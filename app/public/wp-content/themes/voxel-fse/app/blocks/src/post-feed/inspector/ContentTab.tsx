/**
 * Post Feed Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Post Feed Settings, Layout, Icons accordions.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	TextControl,
	ToggleControl,
	RangeControl,
} from '@wordpress/components';

import {
	ResponsiveRangeControl,
	IconPickerControl,
	RelationControl,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';

import type { PostFeedAttributes, PostFeedConfig } from '../types';

interface ContentTabProps {
	attributes: PostFeedAttributes;
	setAttributes: (attrs: Partial<PostFeedAttributes>) => void;
	config: PostFeedConfig | null;
	searchFormItems: Array<{ id: string; clientId: string; label: string }>;
	cardTemplates: Array<{ id: string; label: string }>;
	isLoadingTemplates: boolean;
}

/**
 * Content Tab Component
 *
 * Renders the Content tab with three accordion sections:
 * - Post Feed Settings (data source, pagination, filters)
 * - Layout (grid/carousel settings)
 * - Icons (icon customization)
 */
export function ContentTab({
	attributes,
	setAttributes,
	config,
	searchFormItems,
	cardTemplates,
	isLoadingTemplates,
}: ContentTabProps): JSX.Element {
	// Build post type options from config
	const postTypeOptions = [
		{ label: __('Select post type...', 'voxel-fse'), value: '' },
		...(config?.postTypes || []).map((pt) => ({
			label: pt.label,
			value: pt.key,
		})),
	];

	return (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="postFeedSettingsAccordion"
			defaultPanel="settings"
		>
			{/* POST FEED SETTINGS */}
			<AccordionPanel id="settings" title={__('Post Feed Settings', 'voxel-fse')}>
				{/* 1. Data Source - Always shown */}
				<SelectControl
					label={__('Data source', 'voxel-fse')}
					value={attributes.source}
					options={[
						{ label: __('Search Form widget', 'voxel-fse'), value: 'search-form' },
						{ label: __('Filters', 'voxel-fse'), value: 'search-filters' },
						{ label: __('Manual selection', 'voxel-fse'), value: 'manual' },
						{ label: __('WP default archive', 'voxel-fse'), value: 'archive' },
					]}
					onChange={(value) =>
						setAttributes({ source: value as PostFeedAttributes['source'] })
					}
				/>

				{/* SEARCH FORM MODE */}
				{attributes.source === 'search-form' && (
					<>
						<RelationControl
							label={__('Link to search form', 'voxel-fse')}
							items={searchFormItems}
							selectedId={attributes.searchFormId}
							onSelect={(id) => setAttributes({ searchFormId: id ?? '' })}
							widgetType="SearchForm"
							description={__(
								'Select a Search Form block on this page to link with.',
								'voxel-fse'
							)}
						/>
						<SelectControl
							label={__('Pagination', 'voxel-fse')}
							value={attributes.pagination}
							options={[
								{ label: __('Load more button', 'voxel-fse'), value: 'load_more' },
								{ label: __('Prev/Next buttons', 'voxel-fse'), value: 'prev_next' },
								{ label: __('None', 'voxel-fse'), value: 'none' },
							]}
							onChange={(value) =>
								setAttributes({ pagination: value as PostFeedAttributes['pagination'] })
							}
						/>
						<RangeControl
							label={__('Posts per page', 'voxel-fse')}
							value={attributes.postsPerPage}
							onChange={(value) => setAttributes({ postsPerPage: value ?? 10 })}
							min={1}
							max={100}
						/>
						<ToggleControl
							label={__('Display details', 'voxel-fse')}
							help={__('Display results count and order by (if enabled) on top', 'voxel-fse')}
							checked={attributes.displayDetails}
							onChange={(value) => setAttributes({ displayDetails: value })}
						/>
					</>
				)}

				{/* FILTERS MODE */}
				{attributes.source === 'search-filters' && (
					<>
						<SelectControl
							label={__('Choose post type', 'voxel-fse')}
							value={attributes.postType}
							options={postTypeOptions}
							onChange={(value) => setAttributes({ postType: value })}
						/>
						<RangeControl
							label={__('Number of posts to load', 'voxel-fse')}
							value={attributes.postsPerPage}
							onChange={(value) => setAttributes({ postsPerPage: value ?? 10 })}
							min={0}
							max={500}
						/>
						<SelectControl
							label={__('Pagination', 'voxel-fse')}
							value={attributes.pagination}
							options={[
								{ label: __('Load more button', 'voxel-fse'), value: 'load_more' },
								{ label: __('Prev/Next buttons', 'voxel-fse'), value: 'prev_next' },
								{ label: __('None', 'voxel-fse'), value: 'none' },
							]}
							onChange={(value) =>
								setAttributes({ pagination: value as PostFeedAttributes['pagination'] })
							}
						/>
						<TextControl
							label={__('Exclude posts', 'voxel-fse')}
							value={attributes.excludePosts}
							onChange={(value) => setAttributes({ excludePosts: value })}
							help={__('Comma-separated post IDs to exclude', 'voxel-fse')}
						/>
						<ToggleControl
							label={__('Filter posts by priority', 'voxel-fse')}
							checked={attributes.priorityFilter}
							onChange={(value) => setAttributes({ priorityFilter: value })}
						/>
						{attributes.priorityFilter && (
							<div className="voxel-fse-half-width-controls">
								<RangeControl
									label={__('Priority min', 'voxel-fse')}
									value={attributes.priorityMin}
									onChange={(value) => setAttributes({ priorityMin: value ?? 0 })}
									min={0}
									max={100}
								/>
								<RangeControl
									label={__('Priority max', 'voxel-fse')}
									value={attributes.priorityMax}
									onChange={(value) => setAttributes({ priorityMax: value ?? 0 })}
									min={0}
									max={100}
								/>
							</div>
						)}
						<RangeControl
							label={__('Offset', 'voxel-fse')}
							value={attributes.offset}
							onChange={(value) => setAttributes({ offset: value ?? 0 })}
							min={0}
							max={100}
						/>
						<SelectControl
							label={__('Preview card template', 'voxel-fse')}
							value={attributes.cardTemplate}
							options={cardTemplates.map((t) => ({
								label: t.label,
								value: t.id,
							}))}
							onChange={(value) => setAttributes({ cardTemplate: value })}
							disabled={isLoadingTemplates || !attributes.postType}
							help={
								isLoadingTemplates
									? __('Loading templates...', 'voxel-fse')
									: __('Select post type first to see available templates', 'voxel-fse')
							}
						/>
					</>
				)}

				{/* MANUAL / ARCHIVE MODE - No results label comes FIRST per Voxel */}
				{(attributes.source === 'manual' || attributes.source === 'archive') && (
					<TextControl
						label={__('No results label', 'voxel-fse')}
						value={attributes.noResultsLabel}
						onChange={(value) => setAttributes({ noResultsLabel: value })}
					/>
				)}

				{/* MANUAL / ARCHIVE MODE - Choose post type */}
				{(attributes.source === 'manual' || attributes.source === 'archive') && (
					<SelectControl
						label={__('Choose post type', 'voxel-fse')}
						value={attributes.postType}
						options={postTypeOptions}
						onChange={(value) => setAttributes({ postType: value })}
					/>
				)}

				{/* MANUAL MODE - Choose posts */}
				{attributes.source === 'manual' && (
					<TextControl
						label={__('Choose posts', 'voxel-fse')}
						value={attributes.manualPostIds.join(', ')}
						onChange={(value) => {
							const ids = value
								.split(',')
								.map((id) => parseInt(id.trim(), 10))
								.filter((id) => !isNaN(id) && id > 0);
							setAttributes({ manualPostIds: ids });
						}}
						help={__(
							'Enter post IDs separated by commas. A proper post selector will be added in future updates.',
							'voxel-fse'
						)}
					/>
				)}

				{/* MANUAL / ARCHIVE MODE - Preview card template (only when post type selected) */}
				{(attributes.source === 'manual' || attributes.source === 'archive') &&
					attributes.postType && (
						<SelectControl
							label={__('Preview card template', 'voxel-fse')}
							value={attributes.cardTemplate}
							options={cardTemplates.map((t) => ({
								label: t.label,
								value: t.id,
							}))}
							onChange={(value) => setAttributes({ cardTemplate: value })}
							disabled={isLoadingTemplates}
						/>
					)}

				{/* NO RESULTS LABEL - Only for Search Form and Filters modes */}
				{(attributes.source === 'search-form' || attributes.source === 'search-filters') && (
					<TextControl
						label={__('No results label', 'voxel-fse')}
						value={attributes.noResultsLabel}
						onChange={(value) => setAttributes({ noResultsLabel: value })}
					/>
				)}
			</AccordionPanel>

			{/* LAYOUT ACCORDION */}
			<AccordionPanel id="layout" title={__('Layout', 'voxel-fse')}>
				<SelectControl
					label={__('Mode', 'voxel-fse')}
					value={attributes.layoutMode}
					options={[
						{ label: __('Grid', 'voxel-fse'), value: 'grid' },
						{ label: __('Carousel', 'voxel-fse'), value: 'carousel' },
					]}
					onChange={(value) =>
						setAttributes({ layoutMode: value as PostFeedAttributes['layoutMode'] })
					}
				/>

				{attributes.layoutMode === 'grid' && (
					<>
						<ResponsiveRangeControl
							label={__('Number of columns', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="columns"
							min={1}
							max={6}
						/>
					</>
				)}

				{attributes.layoutMode === 'carousel' && (
					<>
						<ResponsiveRangeControl
							label={__('Item width', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="carouselItemWidth"
							min={100}
							max={800}
						/>

						<ToggleControl
							label={__('Auto slide?', 'voxel-fse')}
							checked={attributes.carouselAutoSlide}
							onChange={(value) => setAttributes({ carouselAutoSlide: value })}
						/>
					</>
				)}

				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="itemGap"
					min={0}
					max={100}
					help={__('Adds gap between the items', 'voxel-fse')}
				/>

				{attributes.layoutMode === 'carousel' && (
					<>
						<ResponsiveRangeControl
							label={__('Scroll padding', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="scrollPadding"
							min={0}
							max={100}
							help={__(
								'Adds padding to the scrollable area, useful in full width layouts or in responsive mode',
								'voxel-fse'
							)}
						/>

						<ResponsiveRangeControl
							label={__('Item padding', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							attributeBaseName="itemPadding"
							min={0}
							max={100}
							help={__('Adds padding to an individual item', 'voxel-fse')}
						/>
					</>
				)}
			</AccordionPanel>

			{/* ICONS ACCORDION */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<IconPickerControl
					label={__('Load more icon', 'voxel-fse')}
					value={attributes.loadMoreIcon}
					onChange={(value) => setAttributes({ loadMoreIcon: value })}
				/>

				<IconPickerControl
					label={__('No results icon', 'voxel-fse')}
					value={attributes.noResultsIcon}
					onChange={(value) => setAttributes({ noResultsIcon: value })}
				/>

				<IconPickerControl
					label={__('Right arrow', 'voxel-fse')}
					value={attributes.rightArrowIcon}
					onChange={(value) => setAttributes({ rightArrowIcon: value })}
				/>

				<IconPickerControl
					label={__('Left arrow', 'voxel-fse')}
					value={attributes.leftArrowIcon}
					onChange={(value) => setAttributes({ leftArrowIcon: value })}
				/>

				<IconPickerControl
					label={__('Right chevron', 'voxel-fse')}
					value={attributes.rightChevronIcon}
					onChange={(value) => setAttributes({ rightChevronIcon: value })}
				/>

				<IconPickerControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.leftChevronIcon}
					onChange={(value) => setAttributes({ leftChevronIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
