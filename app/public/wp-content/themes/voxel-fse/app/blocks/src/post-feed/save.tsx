/**
 * Post Feed Block - Save Component
 *
 * Outputs vxconfig JSON and placeholder HTML for frontend hydration.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '../../shared/utils';
import type { PostFeedAttributes, PostFeedVxConfig } from './types';
import { generatePostFeedStyles } from './styles';

interface SaveProps {
	attributes: PostFeedAttributes;
}

/**
 * Post Feed Save Component
 */
function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps): JSX.Element {
		// Get blockId for AdvancedTab/VoxelTab wiring
		const blockId = attributes.blockId || 'post-feed';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'voxel-fse-post-feed-frontend ts-post-feed',
			selectorPrefix: 'voxel-fse-post-feed',
		});

		const blockProps = (useBlockProps as any).save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			...advancedProps.customAttrs,
			'data-block-type': 'post-feed',
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
			'data-visibility-rules': attributes['visibilityRules']?.length
				? JSON.stringify(attributes['visibilityRules'])
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes['loopSource'] || undefined,
			'data-loop-property': attributes['loopProperty'] || undefined,
			'data-loop-limit': attributes['loopLimit'] || undefined,
			'data-loop-offset': attributes['loopOffset'] || undefined,
		});

		// Build vxconfig object with ALL attributes needed by frontend
		const vxConfig: PostFeedVxConfig = {
			blockId: attributes.blockId,
			source: attributes.source,
			searchFormId: attributes.searchFormId,
			postType: attributes.postType,
			manualPostIds: attributes.manualPostIds,
			filters: attributes.filters,
			// Filters mode settings
			excludePosts: attributes.excludePosts,
			priorityFilter: attributes.priorityFilter,
			priorityMin: attributes.priorityMin,
			priorityMax: attributes.priorityMax,
			offset: attributes.offset,
			cardTemplate: attributes.cardTemplate,
			pagination: attributes.pagination,
			postsPerPage: attributes.postsPerPage,
			displayDetails: attributes.displayDetails,
			noResultsLabel: attributes.noResultsLabel,
			layoutMode: attributes.layoutMode,
			columns: attributes.columns,
			columns_tablet: attributes.columns_tablet,
			columns_mobile: attributes.columns_mobile,
			itemGap: attributes.itemGap,
			itemGap_tablet: attributes.itemGap_tablet,
			itemGap_mobile: attributes.itemGap_mobile,
			carouselItemWidth: attributes.carouselItemWidth,
			carouselItemWidth_tablet: attributes.carouselItemWidth_tablet,
			carouselItemWidth_mobile: attributes.carouselItemWidth_mobile,
			carouselItemWidthUnit: attributes.carouselItemWidthUnit,
			carouselAutoSlide: attributes.carouselAutoSlide,
			scrollPadding: attributes.scrollPadding,
			scrollPadding_tablet: attributes.scrollPadding_tablet,
			scrollPadding_mobile: attributes.scrollPadding_mobile,
			itemPadding: attributes.itemPadding,
			itemPadding_tablet: attributes.itemPadding_tablet,
			itemPadding_mobile: attributes.itemPadding_mobile,
			loadingStyle: attributes.loadingStyle,
			loadingOpacity: attributes.loadingOpacity,
			icons: {
				loadMore: attributes.loadMoreIcon,
				noResults: attributes.noResultsIcon,
				rightArrow: attributes.rightArrowIcon,
				leftArrow: attributes.leftArrowIcon,
				rightChevron: attributes.rightChevronIcon,
				leftChevron: attributes.leftChevronIcon,
				reset: attributes.resetIcon,
			},
		};

		// Note: visibility classes (hideDesktop, hideTablet, hideMobile) and customClasses
		// are now handled by advancedProps.className from getAdvancedVoxelTabProps

		// Generate Style Tab CSS (Counter, Order By, No Results, Pagination, Carousel Nav)
		// This ensures styles are available immediately on page load before JS hydration
		const styleCSS = generatePostFeedStyles(attributes, attributes.blockId);

		return (
			<div
				{...blockProps}
				data-block-id={attributes.blockId}
				data-source={attributes.source}
				data-search-form={attributes.searchFormId || ''}
			>
				{/* Responsive CSS from AdvancedTab + VoxelTab */}
				{advancedProps.responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
				)}

				{/* Style Tab CSS (Counter, Order By, No Results, Pagination, Carousel Nav) */}
				{styleCSS && (
					<style dangerouslySetInnerHTML={{ __html: styleCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* vxconfig JSON - parsed by frontend.tsx */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Placeholder - replaced by React on mount */}
				{includePlaceholder && (
					<div className="voxel-fse-block-placeholder">
						<span className="placeholder-icon">&#x1F4CB;</span>
						<span className="placeholder-text">Post Feed (VX)</span>
					</div>
				)}

				{/* Custom CSS - uses uniqueSelector for proper scoping */}
				{attributes.customCSS && (
					<style
						dangerouslySetInnerHTML={{
							__html: attributes.customCSS.replace(
								/selector/g,
								advancedProps.uniqueSelector
							),
						}}
					/>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
