/**
 * Post Feed Block - Editor Component
 *
 * @package VoxelFSE
 */

import { useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	Spinner,
	RangeControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import {
	ResponsiveRangeControl,
	IconPickerControl,
	TypographyControl,
	ColorControl,
	ChooseControl,
	SectionHeading,
	SliderControl,
	AdvancedTab,
	StyleTabPanel,
	RelationControl,
} from '@shared/controls';

import PostFeedComponent from './shared/PostFeedComponent';
import { usePostFeedConfig } from './hooks/usePostFeedConfig';
import { useCardTemplates } from './hooks/useCardTemplates';
import type { PostFeedEditProps, PostFeedAttributes } from './types';

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return Math.random().toString(36).substring(2, 10);
}

/**
 * Post Feed Edit Component
 */
export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: PostFeedEditProps): JSX.Element {
	const blockProps = useBlockProps({
		className: 'voxel-fse-post-feed-editor',
	});

	// Fetch configuration from REST API
	const { config, isLoading, error } = usePostFeedConfig();

	// Fetch card templates based on selected post type
	// Evidence: Voxel post-feed.php:204-212 - templates are per post type
	const { templates: cardTemplates, isLoading: isLoadingTemplates } = useCardTemplates(
		attributes.postType
	);

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Get search form blocks on the page for RelationControl
	const searchFormBlocks = useSelect(
		(select) => {
			const { getBlocks } = select('core/block-editor') as {
				getBlocks: () => Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
					innerBlocks?: Array<unknown>;
				}>;
			};

			// Recursive function to find blocks (including nested ones)
			const findBlocksRecursive = (
				blocks: Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
					innerBlocks?: Array<unknown>;
				}>,
				targetName: string
			): Array<{ clientId: string; name: string; attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string } }> => {
				let found: Array<{ clientId: string; name: string; attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string } }> = [];
				blocks.forEach((block) => {
					if (block.name === targetName && block.clientId !== clientId) {
						found.push(block);
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						found = found.concat(
							findBlocksRecursive(
								block.innerBlocks as Array<{
									clientId: string;
									name: string;
									attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
									innerBlocks?: Array<unknown>;
								}>,
								targetName
							)
						);
					}
				});
				return found;
			};

			return findBlocksRecursive(getBlocks(), 'voxel-fse/search-form');
		},
		[clientId]
	);

	// Step 1: Find the linked Search Form's clientId from the store
	// This lets us use getBlock(clientId) which properly subscribes to attribute changes
	const linkedSearchFormClientId = useSelect(
		(select) => {
			if (attributes.source !== 'search-form' || !attributes.searchFormId) {
				return null;
			}

			const { getBlocks } = select('core/block-editor') as {
				getBlocks: () => Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string };
					innerBlocks?: Array<unknown>;
				}>;
			};

			// Recursive function to find a specific search form block's clientId
			const findSearchFormClientId = (
				blocks: Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string };
					innerBlocks?: Array<unknown>;
				}>,
				targetId: string
			): string | null => {
				for (const block of blocks) {
					if (block.name === 'voxel-fse/search-form') {
						if (block.attributes.blockId === targetId || block.clientId === targetId) {
							return block.clientId;
						}
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findSearchFormClientId(
							block.innerBlocks as Array<{
								clientId: string;
								name: string;
								attributes: { blockId?: string };
								innerBlocks?: Array<unknown>;
							}>,
							targetId
						);
						if (found) return found;
					}
				}
				return null;
			};

			return findSearchFormClientId(getBlocks(), attributes.searchFormId);
		},
		[attributes.source, attributes.searchFormId]
	);

	// Step 2: Use getBlock(clientId) to get the linked form's attributes
	// getBlock subscribes to changes in that specific block, ensuring re-renders
	// when selectedPostType changes
	const linkedPostType = useSelect(
		(select) => {
			if (!linkedSearchFormClientId) {
				return '';
			}

			const { getBlock } = select('core/block-editor') as {
				getBlock: (clientId: string) => {
					attributes: { selectedPostType?: string; postTypes?: string[] };
				} | null;
			};

			const linkedForm = getBlock(linkedSearchFormClientId);
			if (!linkedForm) {
				return '';
			}

			// Return selectedPostType (current selection) or fallback to first configured postType
			return linkedForm.attributes.selectedPostType || linkedForm.attributes.postTypes?.[0] || '';
		},
		[linkedSearchFormClientId]
	);

	// Build relation items for RelationControl
	const searchFormItems = searchFormBlocks.map(
		(block: { clientId: string; attributes: { blockId?: string } }) => ({
			id: block.attributes.blockId || block.clientId,
			clientId: block.clientId,
			label: block.attributes.blockId || block.clientId.substring(0, 7),
		})
	);

	// Build post type options from config
	const postTypeOptions = [
		{ label: __('Select post type...', 'voxel-fse'), value: '' },
		...(config?.postTypes || []).map((pt) => ({
			label: pt.label,
			value: pt.key,
		})),
	];

	return (
		<>
			<InspectorControls>
				{/* CONTENT TAB */}
				<PanelBody
					title={__('Post Feed Settings', 'voxel-fse')}
					initialOpen={true}
				>
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
								description={__('Select a Search Form block on this page to link with.', 'voxel-fse')}
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
							help={__('Enter post IDs separated by commas. A proper post selector will be added in future updates.', 'voxel-fse')}
						/>
					)}

					{/* MANUAL / ARCHIVE MODE - Preview card template (only when post type selected) */}
					{(attributes.source === 'manual' || attributes.source === 'archive') && attributes.postType && (
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
				</PanelBody>

				{/* LAYOUT TAB */}
				<PanelBody title={__('Layout', 'voxel-fse')} initialOpen={false}>
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
				</PanelBody>

				{/* ICONS TAB */}
				<PanelBody title={__('Icons', 'voxel-fse')} initialOpen={false}>
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

					<IconPickerControl
						label={__('Reset icon', 'voxel-fse')}
						value={attributes.resetIcon}
						onChange={(value) => setAttributes({ resetIcon: value })}
					/>
				</PanelBody>
			</InspectorControls>

			{/* STYLE TAB */}
			<InspectorControls group="styles">
				<PanelBody title={__('Counter', 'voxel-fse')} initialOpen={false}>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.counterTypography}
						onChange={(value) => setAttributes({ counterTypography: value })}
					/>
					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.counterTextColor}
						onChange={(value) => setAttributes({ counterTextColor: value })}
					/>
					<ResponsiveRangeControl
						label={__('Bottom spacing', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="counterBottomSpacing"
						min={0}
						max={100}
					/>
				</PanelBody>

				<PanelBody title={__('Order by', 'voxel-fse')} initialOpen={false}>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.orderByTypography}
						onChange={(value) => setAttributes({ orderByTypography: value })}
					/>
					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.orderByTextColor}
						onChange={(value) => setAttributes({ orderByTextColor: value })}
					/>
					<ColorControl
						label={__('Text color (Hover)', 'voxel-fse')}
						value={attributes.orderByTextColorHover}
						onChange={(value) => setAttributes({ orderByTextColorHover: value })}
					/>
				</PanelBody>

				<PanelBody title={__('Loading results', 'voxel-fse')} initialOpen={false}>
					<SelectControl
						label={__('Loading style', 'voxel-fse')}
						value={attributes.loadingStyle}
						options={[
							{ label: __('Opacity', 'voxel-fse'), value: 'opacity' },
							{ label: __('Skeleton', 'voxel-fse'), value: 'skeleton' },
							{ label: __('None', 'voxel-fse'), value: 'none' },
						]}
						onChange={(value) =>
							setAttributes({ loadingStyle: value as PostFeedAttributes['loadingStyle'] })
						}
					/>

					{attributes.loadingStyle === 'opacity' && (
						<SliderControl
							label={__('Opacity', 'voxel-fse')}
							value={attributes.loadingOpacity}
							onChange={(value) => setAttributes({ loadingOpacity: value })}
							min={0}
							max={1}
							step={0.1}
						/>
					)}
				</PanelBody>

				<PanelBody title={__('No results', 'voxel-fse')} initialOpen={false}>
					<ToggleControl
						label={__('Hide screen', 'voxel-fse')}
						checked={attributes.noResultsHideScreen}
						onChange={(value) => setAttributes({ noResultsHideScreen: value })}
					/>

					<ResponsiveRangeControl
						label={__('Content gap', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="noResultsContentGap"
						min={0}
						max={100}
					/>

					<ResponsiveRangeControl
						label={__('Icon size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="noResultsIconSize"
						min={16}
						max={128}
					/>

					<ColorControl
						label={__('Icon color', 'voxel-fse')}
						value={attributes.noResultsIconColor}
						onChange={(value) => setAttributes({ noResultsIconColor: value })}
					/>

					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.noResultsTypography}
						onChange={(value) => setAttributes({ noResultsTypography: value })}
					/>

					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.noResultsTextColor}
						onChange={(value) => setAttributes({ noResultsTextColor: value })}
					/>

					<ColorControl
						label={__('Link color', 'voxel-fse')}
						value={attributes.noResultsLinkColor}
						onChange={(value) => setAttributes({ noResultsLinkColor: value })}
					/>
				</PanelBody>

				<PanelBody title={__('Load more / Next / Prev', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
						]}
					>
						{(tabName) =>
							tabName === 'normal' ? (
								<>
									<ResponsiveRangeControl
										label={__('Top margin', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="paginationTopMargin"
										min={0}
										max={100}
									/>

									<TypographyControl
										label={__('Button typography', 'voxel-fse')}
										value={attributes.paginationTypography}
										onChange={(value) =>
											setAttributes({ paginationTypography: value })
										}
									/>

									<SelectControl
										label={__('Justify', 'voxel-fse')}
										value={attributes.paginationJustify}
										options={[
											{ label: __('Start', 'voxel-fse'), value: 'flex-start' },
											{ label: __('Center', 'voxel-fse'), value: 'center' },
											{ label: __('End', 'voxel-fse'), value: 'flex-end' },
										]}
										onChange={(value) =>
											setAttributes({ paginationJustify: value })
										}
									/>

									<ResponsiveRangeControl
										label={__('Spacing between buttons', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="paginationSpacing"
										min={0}
										max={50}
									/>

									<ResponsiveRangeControl
										label={__('Border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="paginationBorderRadius"
										min={0}
										max={50}
									/>

									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.paginationTextColor}
										onChange={(value) =>
											setAttributes({ paginationTextColor: value })
										}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.paginationBackgroundColor}
										onChange={(value) =>
											setAttributes({ paginationBackgroundColor: value })
										}
									/>

									<ResponsiveRangeControl
										label={__('Icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="paginationIconSize"
										min={12}
										max={48}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.paginationIconColor}
										onChange={(value) =>
											setAttributes({ paginationIconColor: value })
										}
									/>
								</>
							) : (
								<>
									<ColorControl
										label={__('Text color', 'voxel-fse')}
										value={attributes.paginationTextColorHover}
										onChange={(value) =>
											setAttributes({ paginationTextColorHover: value })
										}
									/>

									<ColorControl
										label={__('Background color', 'voxel-fse')}
										value={attributes.paginationBackgroundColorHover}
										onChange={(value) =>
											setAttributes({ paginationBackgroundColorHover: value })
										}
									/>

									<ColorControl
										label={__('Border color', 'voxel-fse')}
										value={attributes.paginationBorderColorHover}
										onChange={(value) =>
											setAttributes({ paginationBorderColorHover: value })
										}
									/>

									<ColorControl
										label={__('Icon color', 'voxel-fse')}
										value={attributes.paginationIconColorHover}
										onChange={(value) =>
											setAttributes({ paginationIconColorHover: value })
										}
									/>
								</>
							)
						}
					</StyleTabPanel>
				</PanelBody>

				<PanelBody title={__('Carousel navigation', 'voxel-fse')} initialOpen={false}>
					<StyleTabPanel
						tabs={[
							{ name: 'normal', title: __('Normal', 'voxel-fse') },
							{ name: 'hover', title: __('Hover', 'voxel-fse') },
						]}
					>
						{(tabName) =>
							tabName === 'normal' ? (
								<>
									<ResponsiveRangeControl
										label={__('Horizontal position', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="carouselNavHorizontalPosition"
										min={-100}
										max={100}
									/>

									<ResponsiveRangeControl
										label={__('Vertical position', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="carouselNavVerticalPosition"
										min={-100}
										max={100}
									/>

									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.carouselNavIconColor}
										onChange={(value) =>
											setAttributes({ carouselNavIconColor: value })
										}
									/>

									<ResponsiveRangeControl
										label={__('Button size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="carouselNavButtonSize"
										min={20}
										max={80}
									/>

									<ResponsiveRangeControl
										label={__('Button icon size', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="carouselNavIconSize"
										min={12}
										max={48}
									/>

									<ColorControl
										label={__('Button background', 'voxel-fse')}
										value={attributes.carouselNavBackground}
										onChange={(value) =>
											setAttributes({ carouselNavBackground: value })
										}
									/>

									<SliderControl
										label={__('Backdrop blur', 'voxel-fse')}
										value={attributes.carouselNavBackdropBlur}
										onChange={(value) =>
											setAttributes({ carouselNavBackdropBlur: value })
										}
										min={0}
										max={20}
									/>

									<ResponsiveRangeControl
										label={__('Button border radius', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="carouselNavBorderRadius"
										min={0}
										max={50}
									/>
								</>
							) : (
								<>
									<ResponsiveRangeControl
										label={__('Button size', 'voxel-fse')}
										value={attributes.carouselNavButtonSizeHover}
										valueTablet={attributes.carouselNavButtonSizeHover_tablet}
										valueMobile={attributes.carouselNavButtonSizeHover_mobile}
										onChange={(value) =>
											setAttributes({ carouselNavButtonSizeHover: value })
										}
										onChangeTablet={(value) =>
											setAttributes({
												carouselNavButtonSizeHover_tablet: value,
											})
										}
										onChangeMobile={(value) =>
											setAttributes({
												carouselNavButtonSizeHover_mobile: value,
											})
										}
										min={20}
										max={80}
									/>

									<ResponsiveRangeControl
										label={__('Button icon size', 'voxel-fse')}
										value={attributes.carouselNavIconSizeHover}
										valueTablet={attributes.carouselNavIconSizeHover_tablet}
										valueMobile={attributes.carouselNavIconSizeHover_mobile}
										onChange={(value) =>
											setAttributes({ carouselNavIconSizeHover: value })
										}
										onChangeTablet={(value) =>
											setAttributes({ carouselNavIconSizeHover_tablet: value })
										}
										onChangeMobile={(value) =>
											setAttributes({ carouselNavIconSizeHover_mobile: value })
										}
										min={12}
										max={48}
									/>

									<ColorControl
										label={__('Button icon color', 'voxel-fse')}
										value={attributes.carouselNavIconColorHover}
										onChange={(value) =>
											setAttributes({ carouselNavIconColorHover: value })
										}
									/>

									<ColorControl
										label={__('Button background color', 'voxel-fse')}
										value={attributes.carouselNavBackgroundHover}
										onChange={(value) =>
											setAttributes({ carouselNavBackgroundHover: value })
										}
									/>

									<ColorControl
										label={__('Button border color', 'voxel-fse')}
										value={attributes.carouselNavBorderColorHover}
										onChange={(value) =>
											setAttributes({ carouselNavBorderColorHover: value })
										}
									/>
								</>
							)
						}
					</StyleTabPanel>
				</PanelBody>
			</InspectorControls>

			{/* ADVANCED TAB */}
			<InspectorControls group="advanced">
				<AdvancedTab attributes={attributes} setAttributes={setAttributes} />
			</InspectorControls>

			{/* BLOCK PREVIEW */}
			<div {...blockProps}>
				{isLoading ? (
					<div className="voxel-fse-loading">
						<Spinner />
						<span>{__('Loading configuration...', 'voxel-fse')}</span>
					</div>
				) : error ? (
					<div className="voxel-fse-error">
						<span>{error}</span>
					</div>
				) : (
					<PostFeedComponent
						attributes={{
							...attributes,
							// Use derived postType from linked search form when source is 'search-form'
							// Fallback to attributes.postType if linkedPostType is empty (e.g., broken link)
							postType: attributes.source === 'search-form'
								? (linkedPostType || attributes.postType)
								: attributes.postType,
						}}
						config={config}
						context="editor"
					/>
				)}
			</div>
		</>
	);
}
