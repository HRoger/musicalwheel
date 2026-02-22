/**
 * NectarBlocks Toolbar EnableTag Filter
 *
 * Injects an EnableTagsToolbarButton into the block toolbar for
 * NB text and button blocks. Enables dynamic text content replacement.
 *
 * Also resolves dynamic tags in the editor and replaces the block's
 * visible text with the resolved value (editor preview).
 *
 * Registered as `editor.BlockEdit` filter — auto-runs on import.
 *
 * @package VoxelFSE
 */

import { useEffect, useRef, useState } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { NB_TOOLBAR_TAG_BLOCK_NAMES } from '../nb-integration/nectarBlocksConfig';
import EnableTagsToolbarButton from '../controls/EnableTagsToolbarButton';
import { useTemplateContext, useTemplatePostType } from '../utils/useTemplateContext';

interface BlockEditProps {
	name: string;
	clientId: string;
	attributes: Record<string, unknown>;
	setAttributes: (attrs: Record<string, unknown>) => void;
}

const withNectarToolbarTag = createHigherOrderComponent(
	(BlockEdit: React.ComponentType<BlockEditProps>) => {
		return (props: BlockEditProps) => {
			if (!NB_TOOLBAR_TAG_BLOCK_NAMES.has(props.name)) {
				return <BlockEdit {...props} />;
			}

			const value = (props.attributes['voxelDynamicContent'] as string) ?? '';
			const blockContent = (props.attributes['content'] as string) ?? '';

			return (
				<>
					<BlockEdit {...props} />
					<BlockControls group="other">
						<ToolbarGroup>
							<EnableTagsToolbarButton
								value={value}
								onChange={(newValue: string) =>
									props.setAttributes({ voxelDynamicContent: newValue })
								}
								initialContent={blockContent}
							/>
						</ToolbarGroup>
					</BlockControls>
					<ToolbarTextResolver
						clientId={props.clientId}
						dynamicContent={value}
					/>
				</>
			);
		};
	},
	'withNectarToolbarTag',
);

addFilter(
	'editor.BlockEdit',
	'voxel-fse/nectar-toolbar-tag',
	withNectarToolbarTag,
);

/**
 * Resolves dynamic tag expressions and replaces the block's text
 * in the editor iframe with the resolved value.
 *
 * Uses a MutationObserver to keep the text replaced even when NB's
 * React re-renders overwrite it. Same resilience pattern as the
 * dynamic image injection in NBDynamicTagInjector.
 */
function ToolbarTextResolver({
	clientId,
	dynamicContent,
}: {
	clientId: string;
	dynamicContent: string;
}) {
	const templateContext = useTemplateContext();
	const templatePostType = useTemplatePostType();
	const [resolvedText, setResolvedText] = useState<string | null>(null);
	const observerRef = useRef<MutationObserver | null>(null);

	// Step 1: Resolve the dynamic content expression via REST API
	useEffect(() => {
		if (!dynamicContent) {
			setResolvedText(null);
			return;
		}

		let cancelled = false;

		const previewContext: Record<string, string> = { type: templateContext };
		if (templatePostType) {
			previewContext['post_type'] = templatePostType;
		}

		apiFetch<{ rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: {
				expression: dynamicContent,
				preview_context: previewContext,
			},
		})
			.then((result) => {
				if (cancelled) return;

				let rendered = result.rendered;
				// Strip @tags()...@endtags() wrapper if present
				const wrapperMatch = rendered.match(/@tags\(\)(.*?)@endtags\(\)/s);
				if (wrapperMatch) {
					rendered = wrapperMatch[1];
				}

				setResolvedText(rendered || null);
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					console.error('[NB-Toolbar] Failed to resolve dynamic content:', err);
					setResolvedText(null);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [dynamicContent, templateContext, templatePostType]);

	// Step 2: Keep the text replaced in the editor iframe using MutationObserver
	useEffect(() => {
		// Disconnect previous observer
		if (observerRef.current) {
			observerRef.current.disconnect();
			observerRef.current = null;
		}

		if (!resolvedText) return;

		// Find the editor iframe
		const iframe = document.querySelector(
			'iframe[name="editor-canvas"]',
		) as HTMLIFrameElement | null;
		const iframeDoc = iframe?.contentDocument;
		if (!iframeDoc) return;

		// Find the block element by clientId
		const blockEl = iframeDoc.querySelector(
			`[data-block="${clientId}"]`,
		) as HTMLElement | null;
		if (!blockEl) return;

		/**
		 * Apply resolved text to both <p> elements inside the NB text block.
		 * NB text block has two <p> elements:
		 * 1. .block-editor-rich-text__editable — the visible editable text
		 * 2. .nectar-blocks-text__editor-text-element — NB's internal raw text
		 */
		const applyText = () => {
			const editableP = blockEl.querySelector(
				'p.block-editor-rich-text__editable, p.nectar-blocks-text__rich-text',
			) as HTMLElement | null;
			const rawP = blockEl.querySelector(
				'p.nectar-blocks-text__editor-text-element',
			) as HTMLElement | null;

			if (editableP && editableP.textContent !== resolvedText) {
				editableP.textContent = resolvedText;
			}
			if (rawP && rawP.textContent !== resolvedText) {
				rawP.textContent = resolvedText;
			}
		};

		// Apply immediately
		applyText();

		// Watch for NB React re-renders that overwrite our text
		observerRef.current = new MutationObserver(() => {
			applyText();
		});

		observerRef.current.observe(blockEl, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
			}
		};
	}, [resolvedText, clientId]);

	return null;
}
