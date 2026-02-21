/**
 * Term Feed Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * NO server-side PHP rendering - this is headless-ready.
 *
 * Evidence:
 * - Pattern from: themes/voxel-fse/app/blocks/src/print-template/save.tsx
 * - Voxel template: themes/voxel/templates/widgets/term-feed.php
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { TermFeedAttributes, TermFeedVxConfig } from './types';
import { generateTermFeedResponsiveCSS } from './styles';

interface SaveProps {
	attributes: TermFeedAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId: attributes.blockId || 'term-feed',
			baseClass: 'voxel-fse-term-feed',
		});

		// Generate block-specific responsive CSS
		const blockResponsiveCSS = generateTermFeedResponsiveCSS(
			attributes,
			advancedProps.uniqueSelector
		);

		// Combine all responsive CSS
		const combinedResponsiveCSS = [
			advancedProps.responsiveCSS,
			blockResponsiveCSS,
		]
			.filter(Boolean)
			.join('\n');

		// Build class list matching Voxel's term-feed pattern
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
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON containing all frontend-required data
		const vxConfig: TermFeedVxConfig = {
			// Data source settings
			source: attributes.source,
			manualTermIds: attributes.manualTerms.map((t) => t.term_id),
			taxonomy: attributes.taxonomy,
			parentTermId: attributes.parentTermId,
			order: attributes.order,
			perPage: attributes.perPage,
			hideEmpty: attributes.hideEmpty,
			hideEmptyPostType: attributes.hideEmptyPostType,
			cardTemplate: attributes.cardTemplate,

			// Layout settings
			layoutMode: attributes.layoutMode,
			carouselItemWidth: attributes.carouselItemWidth,
			carouselItemWidthUnit: attributes.carouselItemWidthUnit,
			carouselAutoplay: attributes.carouselAutoplay,
			carouselAutoplayInterval: attributes.carouselAutoplayInterval,
			gridColumns: attributes.gridColumns,
			itemGap: attributes.itemGap,
			scrollPadding: attributes.scrollPadding,
			itemPadding: attributes.itemPadding,
			replaceAccentColor: attributes.replaceAccentColor,

			// Navigation styling - Normal state
			navHorizontalPosition: attributes.navHorizontalPosition,
			navVerticalPosition: attributes.navVerticalPosition,
			navButtonIconColor: attributes.navButtonIconColor,
			navButtonSize: attributes.navButtonSize,
			navButtonIconSize: attributes.navButtonIconSize,
			navButtonBackground: attributes.navButtonBackground,
			navBackdropBlur: attributes.navBackdropBlur,
			navBorderType: attributes.navBorderType,
			navBorderWidth: attributes.navBorderWidth,
			navBorderColor: attributes.navBorderColor,
			navBorderRadius: attributes.navBorderRadius,

			// Navigation styling - Hover state
			navButtonSizeHover: attributes.navButtonSizeHover,
			navButtonIconSizeHover: attributes.navButtonIconSizeHover,
			navButtonIconColorHover: attributes.navButtonIconColorHover,
			navButtonBackgroundHover: attributes.navButtonBackgroundHover,
			navButtonBorderColorHover: attributes.navButtonBorderColorHover,

			// Icons
			rightChevronIcon: attributes.rightChevronIcon,
			leftChevronIcon: attributes.leftChevronIcon,

			// Responsive values
			responsive: {
				carouselItemWidth_tablet: attributes.carouselItemWidth_tablet,
				carouselItemWidth_mobile: attributes.carouselItemWidth_mobile,
				gridColumns_tablet: attributes.gridColumns_tablet,
				gridColumns_mobile: attributes.gridColumns_mobile,
				itemGap_tablet: attributes.itemGap_tablet,
				itemGap_mobile: attributes.itemGap_mobile,
				scrollPadding_tablet: attributes.scrollPadding_tablet,
				scrollPadding_mobile: attributes.scrollPadding_mobile,
				itemPadding_tablet: attributes.itemPadding_tablet,
				itemPadding_mobile: attributes.itemPadding_mobile,
				navHorizontalPosition_tablet:
					attributes.navHorizontalPosition_tablet,
				navHorizontalPosition_mobile:
					attributes.navHorizontalPosition_mobile,
				navVerticalPosition_tablet: attributes.navVerticalPosition_tablet,
				navVerticalPosition_mobile: attributes.navVerticalPosition_mobile,
				navButtonSize_tablet: attributes.navButtonSize_tablet,
				navButtonSize_mobile: attributes.navButtonSize_mobile,
				navButtonIconSize_tablet: attributes.navButtonIconSize_tablet,
				navButtonIconSize_mobile: attributes.navButtonIconSize_mobile,
				navBackdropBlur_tablet: attributes.navBackdropBlur_tablet,
				navBackdropBlur_mobile: attributes.navBackdropBlur_mobile,
				navBorderRadius_tablet: attributes.navBorderRadius_tablet,
				navBorderRadius_mobile: attributes.navBorderRadius_mobile,
				navButtonSizeHover_tablet: attributes.navButtonSizeHover_tablet,
				navButtonSizeHover_mobile: attributes.navButtonSizeHover_mobile,
				navButtonIconSizeHover_tablet:
					attributes.navButtonIconSizeHover_tablet,
				navButtonIconSizeHover_mobile:
					attributes.navButtonIconSizeHover_mobile,
			},
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Block Styles */}
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
				{/* Placeholder for React hydration - will be replaced by TermFeedComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f0f0f0',
							padding: '24px',
							minHeight: '120px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="32"
							height="32"
							fill="currentColor"
							style={{ opacity: 0.3 }}
						>
							<rect x="3" y="3" width="7" height="7" rx="1" />
							<rect x="14" y="3" width="7" height="7" rx="1" />
							<rect x="3" y="14" width="7" height="7" rx="1" />
							<rect x="14" y="14" width="7" height="7" rx="1" />
						</svg>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
