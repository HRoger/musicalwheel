/**
 * Search Form Block - Save Function (Option C+)
 *
 * Saves static HTML with data attributes for Next.js hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { useBlockProps } from '@wordpress/block-editor';
import type { SearchFormAttributes } from './types';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '../../shared/utils/generateAdvancedStyles';
import {
	generateVoxelStyles,
	generateVoxelResponsiveCSS,
} from '../../shared/utils/generateVoxelStyles';
import { generateBlockStyles, generateInlineTabResponsiveCSS } from './styles';

interface SaveProps {
	attributes: SearchFormAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'search-form';
		const uniqueSelector = `.voxel-fse-search-form-${blockId}`;

		// Generate styles from AdvancedTab attributes
		const advancedStyles = generateAdvancedStyles(attributes);
		const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);

		// Generate styles from General Tab attributes (CSS custom properties)
		const blockStyles = generateBlockStyles(attributes);

		// Generate Inline Tab responsive CSS (scoped to Voxel classes)
		const inlineTabCSS = generateInlineTabResponsiveCSS(attributes, blockId);

		// Generate styles from VoxelTab attributes (sticky position)
		const voxelStyles = generateVoxelStyles(attributes);
		const voxelResponsiveCSS = generateVoxelResponsiveCSS(attributes, uniqueSelector);

		// Merge all styles: AdvancedTab + General Tab + VoxelTab
		const mergedStyles = { ...advancedStyles, ...blockStyles, ...voxelStyles };

		// Combine all responsive CSS: AdvancedTab + InlineTab + VoxelTab
		const responsiveCSS = [advancedResponsiveCSS, inlineTabCSS, voxelResponsiveCSS].filter(Boolean).join('\n');

		// Combine all classes (base + visibility + custom)
		const className = combineBlockClasses(
			`voxel-fse-search-form voxel-fse-search-form-${blockId}`,
			attributes
		);

		// Parse custom attributes (key|value format, one per line)
		const customAttrs = parseCustomAttributes(attributes.customAttributes);

		// Save wrapper element with vxconfig (matching Voxel pattern)
		// Keep minimal data attributes for post type selection and submission handling
		// NOTE: Do NOT add 'ts-form ts-search-widget' here - those classes belong on the React component
		// This wrapper is equivalent to Elementor's .elementor-widget wrapper
		const blockProps = useBlockProps.save({
			// Use elementId if provided (CSS ID from AdvancedTab), otherwise use blockId
			id: attributes.elementId || attributes.blockId,
			className,
			style: mergedStyles,
			'data-post-types': JSON.stringify(attributes.postTypes || []),
			'data-on-submit': attributes.onSubmit,
			'data-post-to-feed-id': attributes.postToFeedId,
			'data-post-to-map-id': attributes.postToMapId,
			'data-enable-clusters': attributes.mapEnableClusters === false ? 'no' : 'yes',
			// VOXEL COMPATIBILITY: Add data attributes that Voxel's commons.js expects
			// Evidence: themes/voxel/assets/dist/commons.js line 1486-1487
			// Voxel's popup components look for .elementor-element and .elementor parents
			// to extract widget_id and post_id. We provide these attributes directly.
			'data-id': attributes.blockId, // Equivalent to Elementor widget ID
			'data-elementor-id': typeof window !== 'undefined' ? (window as any).voxelFsePostId || '0' : '0', // Post ID
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes.visibilityBehavior || undefined,
			'data-visibility-rules': attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes.loopSource || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			// Spread custom attributes
			...customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Post types will be populated by frontend after fetching from REST API
		const vxConfig = {
			blockId: attributes.blockId, // CRITICAL: needed for Post Feed connection
			postTypes: (attributes.postTypes || []).map(key => ({ key, label: '', filters: [] })),
			currentPostType: '',
			filterLists: attributes.filterLists || {},
			portalMode: attributes.portalMode || { desktop: false, tablet: false, mobile: false },
			showPostTypeFilter: attributes.showPostTypeFilter ?? true,
			showSearchButton: attributes.showSearchButton ?? true,
			showResetButton: attributes.showResetButton ?? false,
			searchButtonText: attributes.searchButtonText ?? '',
			resetButtonText: attributes.resetButtonText ?? '',
			// CRITICAL: searchOn must be saved to vxconfig for auto-search to work
			searchOn: attributes.searchOn || 'submit',
			// URL and map integration settings
			updateUrl: attributes.updateUrl ?? true,
			submitToPageId: attributes.submitToPageId,
			mapAdditionalMarkers: attributes.mapAdditionalMarkers ?? 0,
			mapEnableClusters: attributes.mapEnableClusters ?? true,
			// Form toggle settings
			formToggleDesktop: attributes.formToggleDesktop ?? false,
			formToggleTablet: attributes.formToggleTablet ?? true,
			formToggleMobile: attributes.formToggleMobile ?? true,
			// Button width settings
			searchButtonWidth: attributes.searchButtonWidth,
			searchButtonWidth_tablet: attributes.searchButtonWidth_tablet,
			searchButtonWidth_mobile: attributes.searchButtonWidth_mobile,
			searchButtonWidthUnit: attributes.searchButtonWidthUnit || '%',
			resetButtonWidth: attributes.resetButtonWidth,
			resetButtonWidth_tablet: attributes.resetButtonWidth_tablet,
			resetButtonWidth_mobile: attributes.resetButtonWidth_mobile,
			resetButtonWidthUnit: attributes.resetButtonWidthUnit || '%',
			// Post type filter width (Content tab > Post types section)
			postTypeFilterWidth: attributes.postTypeFilterWidth,
			postTypeFilterWidth_tablet: attributes.postTypeFilterWidth_tablet,
			postTypeFilterWidth_mobile: attributes.postTypeFilterWidth_mobile,
			// Icon customization
			searchButtonIcon: attributes.searchButtonIcon,
			resetButtonIcon: attributes.resetButtonIcon,
			rightArrowIcon: attributes.rightArrowIcon,
			leftArrowIcon: attributes.leftArrowIcon,
			closeIcon: attributes.closeIcon,
			trashIcon: attributes.trashIcon,
			// Map/Feed switcher settings
			// Evidence: themes/voxel/templates/widgets/search-form.php:194-222
			mfSwitcherDesktop: attributes.mfSwitcherDesktop ?? false,
			mfSwitcherDesktopDefault: attributes.mfSwitcherDesktopDefault ?? 'feed',
			mfSwitcherTablet: attributes.mfSwitcherTablet ?? false,
			mfSwitcherTabletDefault: attributes.mfSwitcherTabletDefault ?? 'feed',
			mfSwitcherMobile: attributes.mfSwitcherMobile ?? false,
			mfSwitcherMobileDefault: attributes.mfSwitcherMobileDefault ?? 'feed',
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS is now generated server-side in PHP (Block_Loader.php) */}
				{/* This avoids Gutenberg block validation issues with dynamic CSS content */}
				{responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
				)}
				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration */}
				{includePlaceholder && (
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
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
