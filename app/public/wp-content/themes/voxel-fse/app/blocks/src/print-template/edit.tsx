/**
 * Print Template Block - Editor Component
 *
 * Renders the selected template inline in the editor by fetching
 * server-rendered HTML via REST API and injecting it into the DOM.
 * This matches Elementor's approach where print_template() outputs
 * content inline within the editor canvas (not in a nested iframe).
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/print-template.php
 * - Voxel helper: themes/voxel/app/utils/template-utils.php:54-84
 * - REST endpoint: themes/voxel-fse/app/controllers/fse-print-template-api-controller.php
 *
 * @package VoxelFSE
 */

import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useRef } from 'react';
import { Spinner } from '@wordpress/components';
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
 * Inline template preview.
 * Fetches server-rendered HTML and injects it directly into the editor DOM,
 * matching how Elementor's print_template() renders content inline.
 */
function TemplatePreview({ templateId }: { templateId: string }) {
	const [html, setHtml] = useState<string>('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

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
			path: `/voxel-fse/v1/print-template/render?template_id=${id}`,
		}) as Promise<{ success: boolean; content?: string; message?: string }>)
			.then((response) => {
				if (response.success && response.content) {
					setHtml(response.content);
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

	// Execute inline <script> tags after HTML is injected.
	useEffect(() => {
		if (!html || !containerRef.current) return;

		const scripts = containerRef.current.querySelectorAll('script');
		scripts.forEach((oldScript) => {
			const newScript = document.createElement('script');
			Array.from(oldScript.attributes).forEach((attr) => {
				newScript.setAttribute(attr.name, attr.value);
			});
			newScript.textContent = oldScript.textContent;
			oldScript.parentNode?.replaceChild(newScript, oldScript);
		});
	}, [html]);

	if (isLoading) {
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '24px',
					gap: '8px',
					color: '#757575',
					fontSize: '13px',
				}}
			>
				<Spinner />
				{__('Loading template preview...', 'voxel-fse')}
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '16px',
					color: '#cc1818',
					fontSize: '13px',
					background: '#fcf0f0',
					borderRadius: '4px',
				}}
			>
				{error}
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			dangerouslySetInnerHTML={{ __html: html }}
			style={{ width: '100%' }}
		/>
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
