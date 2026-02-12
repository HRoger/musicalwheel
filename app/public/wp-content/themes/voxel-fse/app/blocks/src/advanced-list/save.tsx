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
import type { ExtendedAttributes, VxConfig } from './types';
import { generateAdvancedListStyles } from './styles';
import {
	getAdvancedVoxelTabProps,
	renderBackgroundElements,
} from '../../shared/utils';

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
			'data-loop-property': attributes.loopProperty || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		const vxConfig: VxConfig = {
			items: attributes.items,
			icons: {
				closeIcon: attributes.closeIcon?.value ? attributes.closeIcon : null,
				messageIcon: attributes.messageIcon?.value ? attributes.messageIcon : null,
				linkIcon: attributes.linkIcon?.value ? attributes.linkIcon : null,
				shareIcon: attributes.shareIcon?.value ? attributes.shareIcon : null,
			},
			list: {
				enableCssGrid: attributes.enableCssGrid,
				gridColumns: attributes.gridColumns,
				itemWidth: attributes.itemWidth,
				customItemWidth: attributes.customItemWidth,
				customItemWidthUnit: attributes.customItemWidthUnit,
				listJustify: attributes.listJustify,
				itemGap: attributes.itemGap,
				itemGapUnit: attributes.itemGapUnit,
			},
			itemStyle: {
				justifyContent: attributes.itemJustifyContent,
				padding: attributes.itemPadding,
				paddingUnit: attributes.itemPaddingUnit,
				height: attributes.itemHeight,
				heightUnit: attributes.itemHeightUnit,
				borderType: attributes.itemBorderType,
				borderWidth: attributes.itemBorderWidth,
				borderWidthUnit: attributes.itemBorderWidthUnit,
				borderColor: attributes.itemBorderColor,
				borderRadius: attributes.itemBorderRadius,
				borderRadiusUnit: attributes.itemBorderRadiusUnit,
				boxShadow: attributes.itemBoxShadow,
				typography: attributes.itemTypography,
				textColor: attributes.itemTextColor,
				backgroundColor: attributes.itemBackgroundColor,
			},
			iconContainer: {
				background: attributes.iconContainerBackground,
				size: attributes.iconContainerSize,
				sizeUnit: attributes.iconContainerSizeUnit,
				borderType: attributes.iconContainerBorderType,
				borderWidth: attributes.iconContainerBorderWidth,
				borderWidthUnit: attributes.iconContainerBorderWidthUnit,
				borderColor: attributes.iconContainerBorderColor,
				borderRadius: attributes.iconContainerBorderRadius,
				borderRadiusUnit: attributes.iconContainerBorderRadiusUnit,
				boxShadow: attributes.iconContainerBoxShadow,
				textSpacing: attributes.iconTextSpacing,
				textSpacingUnit: attributes.iconTextSpacingUnit,
			},
			icon: {
				onTop: attributes.iconOnTop,
				size: attributes.iconSize,
				sizeUnit: attributes.iconSizeUnit,
				color: attributes.iconColor,
			},
			hoverStyle: {
				boxShadow: attributes.itemBoxShadowHover,
				borderColor: attributes.itemBorderColorHover,
				textColor: attributes.itemTextColorHover,
				backgroundColor: attributes.itemBackgroundColorHover,
				iconContainerBackground: attributes.iconContainerBackgroundHover,
				iconContainerBorderColor: attributes.iconContainerBorderColorHover,
				iconColor: attributes.iconColorHover,
			},
			activeStyle: {
				boxShadow: attributes.itemBoxShadowActive,
				textColor: attributes.itemTextColorActive,
				backgroundColor: attributes.itemBackgroundColorActive,
				borderColor: attributes.itemBorderColorActive,
				iconContainerBackground: attributes.iconContainerBackgroundActive,
				iconContainerBorderColor: attributes.iconContainerBorderColorActive,
				iconColor: attributes.iconColorActive,
			},
			tooltip: {
				bottom: attributes.tooltipBottom,
				textColor: attributes.tooltipTextColor,
				typography: attributes.tooltipTypography,
				backgroundColor: attributes.tooltipBackgroundColor,
				borderRadius: attributes.tooltipBorderRadius,
				borderRadiusUnit: attributes.tooltipBorderRadiusUnit,
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
