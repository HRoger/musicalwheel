/**
 * Quick Search Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig JSON for frontend hydration.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { QuickSearchAttributes, VxConfig } from './types';
import { generateQuickSearchResponsiveCSS } from './styles';

interface SaveProps {
	attributes: QuickSearchAttributes;
}

export default function save({ attributes }: SaveProps) {
	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || 'quick-search',
		baseClass: 'ts-form quick-search voxel-fse-quick-search',
	});

	// Generate quick-search-specific responsive CSS
	const quickSearchResponsiveCSS = generateQuickSearchResponsiveCSS(
		attributes,
		attributes.blockId || 'quick-search'
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, quickSearchResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		// Headless-ready: Visibility rules configuration
		'data-visibility-behavior': attributes.visibilityBehavior || undefined,
		'data-visibility-rules': attributes.visibilityRules?.length
			? JSON.stringify(attributes.visibilityRules)
			: undefined,
		// Headless-ready: Loop element configuration
		'data-loop-source': attributes.loopSource || undefined,
		'data-loop-limit': attributes.loopLimit || undefined,
		'data-loop-offset': attributes.loopOffset || undefined,
		...advancedProps.customAttrs,
	});

	// Build post types object with settings
	const postTypesConfig: VxConfig['postTypes'] = {};
	(attributes.postTypes || []).forEach((key) => {
		const settings = attributes.postTypeSettings?.[key] || {};
		postTypesConfig[key] = {
			key,
			label: settings.label || key,
			filter: settings.filter || 'keywords',
			taxonomies: settings.taxonomies || [],
			archive: '', // Will be populated by frontend
			results: {
				query: '',
				items: [],
			},
		};
	});

	// Build vxconfig JSON (matching Voxel pattern)
	const vxConfig: VxConfig = {
		postTypes: postTypesConfig,
		displayMode: attributes.displayMode || 'single',
		keywords: {
			minlength: 2, // Default, will be overridden by API
		},
		singleMode: {
			submitTo: attributes.singleSubmitTo || null,
			filterKey: attributes.singleSubmitKey || 'keywords',
		},
		icons: {
			search: attributes.searchIcon || { library: '', value: '' },
			close: attributes.closeIcon || { library: '', value: '' },
			result: attributes.resultIcon || { library: '', value: '' },
			clearSearches: attributes.clearSearchesIcon || { library: '', value: '' },
		},
		buttonLabel: attributes.buttonLabel || 'Quick search',
		hideCptTabs: attributes.hideCptTabs || false,
	};

	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration */}
			<div
				className="voxel-fse-block-placeholder"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#e0e0e0',
					padding: '16px',
					minHeight: '48px',
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="currentColor"
					style={{ opacity: 0.4 }}
				>
					<rect x="4" y="4" width="4" height="4" rx="0.5" />
					<rect x="10" y="4" width="4" height="4" rx="0.5" />
					<rect x="16" y="4" width="4" height="4" rx="0.5" />
					<rect x="4" y="10" width="4" height="4" rx="0.5" />
					<rect x="10" y="10" width="4" height="4" rx="0.5" />
					<rect x="16" y="10" width="4" height="4" rx="0.5" />
					<rect x="4" y="16" width="4" height="4" rx="0.5" />
					<rect x="10" y="16" width="4" height="4" rx="0.5" />
					<rect x="16" y="16" width="4" height="4" rx="0.5" />
				</svg>
			</div>
		</div>
	);
}
