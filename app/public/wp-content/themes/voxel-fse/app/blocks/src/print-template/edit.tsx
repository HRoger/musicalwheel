/**
 * Print Template Block - Editor Component
 *
 * Renders the selected template inline in the editor using
 * BlockEditorProvider + BlockList, which renders blocks via their
 * edit.tsx components directly in the DOM (no iframe).
 *
 * This matches Elementor's approach where print_template() renders
 * content inline within the editor canvas, making links clickable
 * and popups interactive.
 *
 * Plan C+ blocks (navbar, userbar, etc.) only produce visible
 * content through their React edit components, not through render.php.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/print-template.php
 * - Voxel helper: themes/voxel/app/utils/template-utils.php:54-84
 *
 * @package VoxelFSE
 */

import {
	useBlockProps,
	InspectorControls,
	BlockEditorProvider,
	BlockList,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { parse } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import type { PrintTemplateAttributes } from './types';
import { InspectorTabs, EmptyPlaceholder } from '@shared/controls';
import { ContentTab } from './inspector';

interface EditProps {
	attributes: PrintTemplateAttributes;
	setAttributes: (attrs: Partial<PrintTemplateAttributes>) => void;
	clientId: string;
}

/**
 * Interactive template preview using BlockEditorProvider + BlockList.
 *
 * Fetches the raw block markup (post_content) from the REST API,
 * parses it into block objects via parse(), then renders them
 * inline using BlockEditorProvider + BlockList.
 *
 * Unlike BlockPreview (which uses an iframe with pointer-events: none),
 * this renders blocks directly in the editor DOM, making them fully
 * interactive - links are clickable, popups work, hover states apply.
 */
function TemplatePreview({ templateId }: { templateId: string }) {
	const [blocks, setBlocks] = useState<any[] | null>(null);
	const [_isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	// Keep loader visible until blocks have had time to mount in the DOM.
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const id = parseInt(templateId, 10);
		if (isNaN(id) || id <= 0) {
			setError(__('Invalid template ID.', 'voxel-fse'));
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		(apiFetch({
			path: `/voxel-fse/v1/print-template/content?template_id=${id}`,
		}) as Promise<{ success: boolean; content?: string; message?: string }>)
			.then((response) => {
				if (response.success && response.content) {
					const parsed = parse(response.content);
					setBlocks(parsed);
					// Give BlockEditorProvider + BlockList time to mount
					// before revealing content (prevents empty flash).
					setTimeout(() => setReady(true), 150);
				} else {
					setError(response.message || __('Template not found or empty.', 'voxel-fse'));
				}
				setIsLoading(false);
			})
			.catch(() => {
				setError(__('Failed to load template preview.', 'voxel-fse'));
				setIsLoading(false);
			});
	}, [templateId]);

	if (error) {
		return (
			<div className="ts-no-posts">
				<span style={{ opacity: 0.6 }}>{error}</span>
			</div>
		);
	}

	if (!blocks || blocks.length === 0) {
		return (
			<div className="ts-no-posts">
				<span className="ts-loader"></span>
			</div>
		);
	}

	// Render BlockList hidden behind the loader, then reveal once ready.
	return (
		<div style={{ position: 'relative' }}>
			{!ready && (
				<div className="ts-no-posts" style={{
					position: 'absolute', inset: 0, zIndex: 1,
					background: '#fff',
				}}>
					<span className="ts-loader"></span>
				</div>
			)}
			<BlockEditorProvider value={blocks}>
				<BlockList renderAppender={false} />
			</BlockEditorProvider>
		</div>
	);
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockProps = useBlockProps({
		className: 'voxel-fse-print-template',
		style: { width: '100%' },
	});

	// Set blockId if not set.
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

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

			{attributes.templateId ? (
				<TemplatePreview templateId={attributes.templateId} />
			) : (
				<EmptyPlaceholder />
			)}
		</div>
	);
}
