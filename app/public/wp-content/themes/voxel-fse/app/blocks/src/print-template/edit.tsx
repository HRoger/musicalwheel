/**
 * Print Template Block - Editor Component
 *
 * 1:1 match with Voxel's print-template widget:
 * - Single template selector (search OR dynamic tags)
 * - Visibility controls
 * - Tries to resolve and render dynamic templates where possible
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/print-template.php
 * - Uses voxel-post-select control with single input
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import type { PrintTemplateAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab } from './inspector';
import PrintTemplateComponent from './shared/PrintTemplateComponent';

interface EditProps {
	attributes: PrintTemplateAttributes;
	setAttributes: (attrs: Partial<PrintTemplateAttributes>) => void;
	clientId: string;
}

/**
 * Fetch template content from any source (FSE templates, template parts, pages, blocks, posts)
 * Uses apiFetch for authenticated requests (required for FSE templates)
 */
async function fetchTemplateContent(
	id: string | number
): Promise<{ title: string; content: string; type: string } | null> {
	// Handle FSE template IDs (string format like 'theme//template-name')
	if (typeof id === 'string' && id.includes('//')) {
		// Try FSE templates
		try {
			const data = (await apiFetch({
				path: `/wp/v2/templates/${encodeURIComponent(id)}`,
			})) as { title: { rendered: string }; slug: string; content: { rendered: string; raw: string } };
			return {
				title: data.title?.rendered || data.slug || `FSE Template`,
				content: data.content?.rendered || data.content?.raw || '',
				type: 'fse-template',
			};
		} catch {
			// Try template-parts
		}

		// Try template parts
		try {
			const data = (await apiFetch({
				path: `/wp/v2/template-parts/${encodeURIComponent(id)}`,
			})) as { title: { rendered: string }; slug: string; content: { rendered: string; raw: string } };
			return {
				title: data.title?.rendered || data.slug || `Template Part`,
				content: data.content?.rendered || data.content?.raw || '',
				type: 'template-part',
			};
		} catch {
			// Not found
		}

		return null;
	}

	// Handle numeric IDs
	const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
	if (isNaN(numericId)) return null;

	// Try pages first
	try {
		const data = (await apiFetch({
			path: `/wp/v2/pages/${numericId}`,
		})) as { title: { rendered: string }; content: { rendered: string; raw: string } };
		return {
			title: data.title?.rendered || `Page #${numericId}`,
			content: data.content?.rendered || data.content?.raw || '',
			type: 'page',
		};
	} catch {
		// Continue
	}

	// Try reusable blocks
	try {
		const data = (await apiFetch({
			path: `/wp/v2/blocks/${numericId}`,
		})) as { title: { rendered: string }; content: { rendered: string; raw: string } };
		return {
			title: data.title?.rendered || `Block #${numericId}`,
			content: data.content?.rendered || data.content?.raw || '',
			type: 'block',
		};
	} catch {
		// Continue
	}

	// Try posts
	try {
		const data = (await apiFetch({
			path: `/wp/v2/posts/${numericId}`,
		})) as { title: { rendered: string }; content: { rendered: string; raw: string } };
		return {
			title: data.title?.rendered || `Post #${numericId}`,
			content: data.content?.rendered || data.content?.raw || '',
			type: 'post',
		};
	} catch {
		// Continue
	}

	return null;
}

/**
 * Try to resolve a dynamic tag in the editor context
 */
function resolveDynamicTag(tagValue: string, currentPostId: number | null): string | null {
	if (!tagValue.startsWith('@tags()')) {
		return tagValue;
	}

	// Extract the tag content
	const match = tagValue.match(/@tags\(\)(.*?)@endtags\(\)/s);
	if (!match) {
		return null;
	}

	const tagContent = match[1].trim();

	// Handle @post(id) - return current post ID
	if (tagContent === '@post(id)' && currentPostId) {
		return String(currentPostId);
	}

	// Handle direct ID references like @post(meta:template_id)
	// These can't be resolved in editor without more context
	return null;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockProps = useBlockProps({
		className: 'voxel-fse-print-template',
	});

	// Get current post ID from editor context
	const currentPostId = useSelect((select) => {
		const editor = select('core/editor') as { getCurrentPostId?: () => number } | undefined;
		return editor?.getCurrentPostId?.() || null;
	}, []);

	// State for template content preview
	const [templateContent, setTemplateContent] = useState<string | null>(null);
	const [isLoadingContent, setIsLoadingContent] = useState(false);
	const [contentError, setContentError] = useState<string | null>(null);

	// Check if templateId contains dynamic tags
	const hasDynamicTags =
		typeof attributes.templateId === 'string' &&
		attributes.templateId.startsWith('@tags()');

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Load selected template content for preview
	useEffect(() => {
		let cancelled = false;

		async function loadContent() {
			let templateIdToFetch: string | null = attributes.templateId;

			// Try to resolve dynamic tags
			if (hasDynamicTags) {
				templateIdToFetch = resolveDynamicTag(attributes.templateId, currentPostId);
				if (!templateIdToFetch) {
					// Can't resolve dynamic tag in editor
					setTemplateContent(null);
					setContentError(null);
					setIsLoadingContent(false);
					return;
				}
			}

			// Check if we have a valid templateId
			if (!templateIdToFetch || templateIdToFetch.trim() === '') {
				setTemplateContent(null);
				setContentError(null);
				setIsLoadingContent(false);
				return;
			}

			// Handle FSE template IDs (string format like 'theme//template-name')
			const isFSETemplate = templateIdToFetch.includes('//');

			// For numeric IDs, validate the number
			if (!isFSETemplate) {
				const templateId = parseInt(templateIdToFetch, 10);
				if (!templateId || isNaN(templateId)) {
					setTemplateContent(null);
					setContentError(null);
					setIsLoadingContent(false);
					return;
				}
			}

			setIsLoadingContent(true);
			setContentError(null);

			// Fetch using string or numeric ID
			const template = await fetchTemplateContent(templateIdToFetch);
			if (!cancelled) {
				if (template) {
					setTemplateContent(template.content);
					setContentError(null);
				} else {
					setContentError(__('Template not found', 'voxel-fse'));
				}
				setIsLoadingContent(false);
			}
		}

		loadContent();

		return () => {
			cancelled = true;
		};
	}, [attributes.templateId, hasDynamicTags, currentPostId]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: () => (
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<PrintTemplateComponent
				attributes={attributes}
				templateContent={templateContent}
				isLoading={isLoadingContent}
				error={contentError}
				context="editor"
			/>
		</div>
	);
}
