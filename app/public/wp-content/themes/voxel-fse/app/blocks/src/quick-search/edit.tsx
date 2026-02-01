/**
 * Quick Search Block - Edit Component
 *
 * Editor interface with InspectorControls for configuring the quick search widget.
 * Matches Elementor's Quick Search widget controls.
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useMemo } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';

import { getRestBaseUrl } from '@shared/utils/siteUrl';
import { getAdvancedVoxelTabProps } from '../../shared/utils';

import type { QuickSearchAttributes, PostTypeConfig } from './types';
import QuickSearchComponent from './shared/QuickSearchComponent';
import { InspectorControls } from './inspector';
import { generateQuickSearchResponsiveCSS } from './styles';

/**
 * Fetch available post types from REST API
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
async function fetchPostTypes(): Promise<PostTypeConfig[]> {
	try {
		const restUrl = getRestBaseUrl();
		const response = await fetch(`${restUrl}voxel-fse/v1/quick-search/post-types`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data.postTypes || [];
	} catch (error) {
		console.error('Failed to fetch post types:', error);
		return [];
	}
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: BlockEditProps<QuickSearchAttributes>) {
	// Generate block ID if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: `quick-search-${clientId.slice(0, 8)}` });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-quick-search-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/quick-search.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId,
		baseClass: 'ts-form quick-search voxel-fse-quick-search',
		selectorPrefix: 'voxel-fse-quick-search',
	});

	// Generate quick-search-specific responsive CSS with useMemo for performance
	const quickSearchResponsiveCSS = useMemo(
		() => generateQuickSearchResponsiveCSS(attributes, attributes.blockId),
		[attributes]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, quickSearchResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, quickSearchResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// State for available post types
	const [availablePostTypes, setAvailablePostTypes] = useState<PostTypeConfig[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch available post types
	useEffect(() => {
		let cancelled = false;

		async function loadPostTypes() {
			setIsLoading(true);
			const postTypes = await fetchPostTypes();
			if (!cancelled) {
				setAvailablePostTypes(postTypes);
				setIsLoading(false);
			}
		}

		loadPostTypes();

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<InspectorControls
				attributes={attributes}
				setAttributes={setAttributes}
				availablePostTypes={availablePostTypes}
				isLoading={isLoading}
			/>

			{/* Block Preview */}
			<div {...blockProps}>
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				<QuickSearchComponent
					attributes={attributes}
					postTypes={availablePostTypes.filter((pt) =>
						(attributes.postTypes || []).includes(pt.key)
					)}
					context="editor"
				/>
			</div>
		</>
	);
}
