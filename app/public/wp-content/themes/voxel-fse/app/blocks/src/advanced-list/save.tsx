/**
 * Advanced List Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern follows Plan C+ architecture:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 * - Scoped CSS for hover/active/responsive styles
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { ExtendedAttributes, VxConfig, BoxShadowValue, BoxValues } from './types';
import { generateAdvancedListStyles } from './styles';
import {
	getAdvancedVoxelTabProps,
	renderBackgroundElements,
} from '../../shared/utils';

/**
 * Block.json defaults for all attributes used in save output.
 *
 * When the user resets an attribute, setAttributes({attr: undefined}) is called.
 * At save time, undefined is omitted by JSON.stringify. But on reload, WordPress
 * re-applies block.json defaults, making the attribute non-undefined. This causes
 * a round-trip mismatch (save output differs from stored HTML).
 *
 * Solution: Always use these defaults as fallbacks so undefined (reset) and
 * the block.json default produce identical save output.
 */
const BLOCK_DEFAULTS = {
	enableCssGrid: false,
	gridColumns: 3,
	itemWidth: 'auto',
	customItemWidth: 100,
	customItemWidthUnit: 'px',
	listJustify: 'left',
	itemGap: 10,
	itemGapUnit: 'px',
	itemJustifyContent: 'flex-start',
	itemPadding: { top: '', right: '', bottom: '', left: '' } as BoxValues,
	itemPaddingUnit: 'px',
	itemHeight: 48,
	itemHeightUnit: 'px',
	itemBorderType: 'none',
	itemBorderWidth: { top: '1', right: '1', bottom: '1', left: '1' } as BoxValues,
	itemBorderWidthUnit: 'px',
	itemBorderColor: '',
	itemBorderRadius: 0,
	itemBorderRadiusUnit: 'px',
	itemBoxShadow: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' } as BoxShadowValue,
	itemTypography: {},
	itemTextColor: '',
	itemBackgroundColor: '',
	iconContainerBackground: '',
	iconContainerSize: 36,
	iconContainerSizeUnit: 'px',
	iconContainerBorderType: '',
	iconContainerBorderWidth: {} as BoxValues,
	iconContainerBorderWidthUnit: 'px',
	iconContainerBorderColor: '',
	iconContainerBorderRadius: 50,
	iconContainerBorderRadiusUnit: 'px',
	iconContainerBoxShadow: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' } as BoxShadowValue,
	iconTextSpacing: 0,
	iconTextSpacingUnit: 'px',
	iconOnTop: false,
	iconSize: 18,
	iconSizeUnit: 'px',
	iconColor: '',
	itemBoxShadowHover: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' } as BoxShadowValue,
	itemBorderColorHover: '',
	itemTextColorHover: '',
	itemBackgroundColorHover: '',
	iconContainerBackgroundHover: '',
	iconContainerBorderColorHover: '',
	iconColorHover: '',
	itemBoxShadowActive: { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' } as BoxShadowValue,
	itemTextColorActive: '',
	itemBackgroundColorActive: '',
	itemBorderColorActive: '',
	iconContainerBackgroundActive: '',
	iconContainerBorderColorActive: '',
	iconColorActive: '',
	tooltipBottom: false,
	tooltipTextColor: '',
	tooltipTypography: {},
	tooltipBackgroundColor: '',
	tooltipBorderRadius: 0,
	tooltipBorderRadiusUnit: 'px',
} as const;

interface SaveProps {
	attributes: ExtendedAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'block';

		// Generate scoped CSS for hover/active/responsive styles (block-specific)
		const blockSpecificCSS = generateAdvancedListStyles(attributes, blockId);

		// Use shared utility for AdvancedTab + VoxelTab wiring
		// This handles: styles, className, responsiveCSS, customAttrs, elementId
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'flexify simplify-ul ts-advanced-list voxel-fse-advanced-list-frontend',
			selectorPrefix: 'voxel-fse-advanced-list',
		});

		// Combine responsive CSS from both sources
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, blockSpecificCSS]
			.filter(Boolean)
			.join('\n');

		// Build class list matching Voxel's advanced-list widget structure
		// Include scoped class for CSS targeting
		const blockProps = (useBlockProps as any).save({
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
			'data-loop-property': attributes.loopProperty || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		// Uses BLOCK_DEFAULTS fallback for every attribute to prevent round-trip
		// mismatch when attributes are reset to undefined (see BLOCK_DEFAULTS comment)
		const d = BLOCK_DEFAULTS;
		const vxConfig: VxConfig = {
			items: attributes.items,
			icons: {
				closeIcon: attributes.closeIcon?.value ? attributes.closeIcon : null,
				messageIcon: attributes.messageIcon?.value ? attributes.messageIcon : null,
				linkIcon: attributes.linkIcon?.value ? attributes.linkIcon : null,
				shareIcon: attributes.shareIcon?.value ? attributes.shareIcon : null,
			},
			list: {
				enableCssGrid: attributes.enableCssGrid ?? d.enableCssGrid,
				gridColumns: attributes.gridColumns ?? d.gridColumns,
				itemWidth: attributes.itemWidth ?? d.itemWidth,
				customItemWidth: attributes.customItemWidth ?? d.customItemWidth,
				customItemWidthUnit: attributes.customItemWidthUnit ?? d.customItemWidthUnit,
				listJustify: attributes.listJustify ?? d.listJustify,
				itemGap: attributes.itemGap ?? d.itemGap,
				itemGapUnit: attributes.itemGapUnit ?? d.itemGapUnit,
			},
			itemStyle: {
				justifyContent: attributes.itemJustifyContent ?? d.itemJustifyContent,
				padding: attributes.itemPadding ?? d.itemPadding,
				paddingUnit: attributes.itemPaddingUnit ?? d.itemPaddingUnit,
				height: attributes.itemHeight ?? d.itemHeight,
				heightUnit: attributes.itemHeightUnit ?? d.itemHeightUnit,
				borderType: attributes.itemBorderType ?? d.itemBorderType,
				borderWidth: attributes.itemBorderWidth ?? d.itemBorderWidth,
				borderWidthUnit: attributes.itemBorderWidthUnit ?? d.itemBorderWidthUnit,
				borderColor: attributes.itemBorderColor ?? d.itemBorderColor,
				borderRadius: attributes.itemBorderRadius ?? d.itemBorderRadius,
				borderRadiusUnit: attributes.itemBorderRadiusUnit ?? d.itemBorderRadiusUnit,
				boxShadow: attributes.itemBoxShadow ?? d.itemBoxShadow,
				typography: attributes.itemTypography ?? d.itemTypography,
				textColor: attributes.itemTextColor ?? d.itemTextColor,
				backgroundColor: attributes.itemBackgroundColor ?? d.itemBackgroundColor,
			},
			iconContainer: {
				background: attributes.iconContainerBackground ?? d.iconContainerBackground,
				size: attributes.iconContainerSize ?? d.iconContainerSize,
				sizeUnit: attributes.iconContainerSizeUnit ?? d.iconContainerSizeUnit,
				borderType: attributes.iconContainerBorderType ?? d.iconContainerBorderType,
				borderWidth: attributes.iconContainerBorderWidth ?? d.iconContainerBorderWidth,
				borderWidthUnit: attributes.iconContainerBorderWidthUnit ?? d.iconContainerBorderWidthUnit,
				borderColor: attributes.iconContainerBorderColor ?? d.iconContainerBorderColor,
				borderRadius: attributes.iconContainerBorderRadius ?? d.iconContainerBorderRadius,
				borderRadiusUnit: attributes.iconContainerBorderRadiusUnit ?? d.iconContainerBorderRadiusUnit,
				boxShadow: attributes.iconContainerBoxShadow ?? d.iconContainerBoxShadow,
				textSpacing: attributes.iconTextSpacing ?? d.iconTextSpacing,
				textSpacingUnit: attributes.iconTextSpacingUnit ?? d.iconTextSpacingUnit,
			},
			icon: {
				onTop: attributes.iconOnTop ?? d.iconOnTop,
				size: attributes.iconSize ?? d.iconSize,
				sizeUnit: attributes.iconSizeUnit ?? d.iconSizeUnit,
				color: attributes.iconColor ?? d.iconColor,
			},
			hoverStyle: {
				boxShadow: attributes.itemBoxShadowHover ?? d.itemBoxShadowHover,
				borderColor: attributes.itemBorderColorHover ?? d.itemBorderColorHover,
				textColor: attributes.itemTextColorHover ?? d.itemTextColorHover,
				backgroundColor: attributes.itemBackgroundColorHover ?? d.itemBackgroundColorHover,
				iconContainerBackground: attributes.iconContainerBackgroundHover ?? d.iconContainerBackgroundHover,
				iconContainerBorderColor: attributes.iconContainerBorderColorHover ?? d.iconContainerBorderColorHover,
				iconColor: attributes.iconColorHover ?? d.iconColorHover,
			},
			activeStyle: {
				boxShadow: attributes.itemBoxShadowActive ?? d.itemBoxShadowActive,
				textColor: attributes.itemTextColorActive ?? d.itemTextColorActive,
				backgroundColor: attributes.itemBackgroundColorActive ?? d.itemBackgroundColorActive,
				borderColor: attributes.itemBorderColorActive ?? d.itemBorderColorActive,
				iconContainerBackground: attributes.iconContainerBackgroundActive ?? d.iconContainerBackgroundActive,
				iconContainerBorderColor: attributes.iconContainerBorderColorActive ?? d.iconContainerBorderColorActive,
				iconColor: attributes.iconColorActive ?? d.iconColorActive,
			},
			tooltip: {
				bottom: attributes.tooltipBottom ?? d.tooltipBottom,
				textColor: attributes.tooltipTextColor ?? d.tooltipTextColor,
				typography: attributes.tooltipTypography ?? d.tooltipTypography,
				backgroundColor: attributes.tooltipBackgroundColor ?? d.tooltipBackgroundColor,
				borderRadius: attributes.tooltipBorderRadius ?? d.tooltipBorderRadius,
				borderRadiusUnit: attributes.tooltipBorderRadiusUnit ?? d.tooltipBorderRadiusUnit,
			},
		};

		return (
			<ul {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Block-specific */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}
				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
				{/* vxconfig JSON - parsed by frontend.tsx */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration */}
				{includePlaceholder && (
					<li className="voxel-fse-block-placeholder flexify ts-action">
						<div
							className="ts-action-con"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#e0e0e0',
								padding: '16px',
								minHeight: '48px',
								borderRadius: '8px',
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
							<span style={{ marginLeft: '8px', opacity: 0.6 }}>Actions (VX)</span>
						</div>
					</li>
				)}
			</ul>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
