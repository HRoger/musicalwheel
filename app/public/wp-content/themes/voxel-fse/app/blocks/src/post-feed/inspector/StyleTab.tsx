/**
 * Post Feed Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Counter, Order By, Loading Results, No Results,
 *           Pagination, Carousel Navigation accordions.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl } from '@wordpress/components';

import {
	ResponsiveRangeControl,
	TypographyControl,
	ColorControl,
	SliderControl,
	StyleTabPanel,
	AccordionPanelGroup,
	AccordionPanel,
	DimensionsControl,
} from '@shared/controls';

import type { PostFeedAttributes } from '../types';

interface StyleTabProps {
	attributes: PostFeedAttributes;
	setAttributes: (attrs: Partial<PostFeedAttributes>) => void;
}

/**
 * Style Tab Component
 *
 * Renders the Style tab with six accordion sections:
 * - Counter (typography, color, spacing)
 * - Order By (typography, colors)
 * - Loading Results (style, opacity)
 * - No Results (gap, icon, typography, colors)
 * - Load More / Next / Prev (button styling with Normal/Hover states)
 * - Carousel Navigation (button styling with Normal/Hover states)
 */
export function StyleTab({ attributes, setAttributes }: StyleTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="postFeedStylesAccordion"
			defaultPanel="counter"
		>
			{/* COUNTER ACCORDION */}
			<AccordionPanel id="counter" title={__('Counter', 'voxel-fse')}>
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
			</AccordionPanel>

			{/* ORDER BY ACCORDION */}
			<AccordionPanel id="order-by" title={__('Order by', 'voxel-fse')}>
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
			</AccordionPanel>

			{/* LOADING RESULTS ACCORDION */}
			<AccordionPanel id="loading-results" title={__('Loading results', 'voxel-fse')}>
				<SelectControl
					label={__('Loading style', 'voxel-fse')}
					value={attributes.loadingStyle}
					options={[
						{ label: __('Opacity', 'voxel-fse'), value: 'opacity' },
						{ label: __('Skeleton', 'voxel-fse'), value: 'skeleton' },
						{ label: __('None', 'voxel-fse'), value: 'none' },
					]}
					onChange={(value: string) =>
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

				{attributes.loadingStyle === 'skeleton' && (
					<ColorControl
						label={__('Skeleton background', 'voxel-fse')}
						value={attributes.skeletonBackgroundColor}
						onChange={(value) => setAttributes({ skeletonBackgroundColor: value })}
					/>
				)}
			</AccordionPanel>

			{/* NO RESULTS ACCORDION */}
			<AccordionPanel id="no-results" title={__('No results', 'voxel-fse')}>
				<ToggleControl
					label={__('Hide screen', 'voxel-fse')}
					checked={attributes.noResultsHideScreen}
					onChange={(value: boolean) => setAttributes({ noResultsHideScreen: value })}
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
			</AccordionPanel>

			{/* PAGINATION ACCORDION */}
			<AccordionPanel id="pagination" title={__('Load more / Next / Prev', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
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
									onChange={(value) => setAttributes({ paginationTypography: value })}
								/>

								<SelectControl
									label={__('Justify', 'voxel-fse')}
									value={attributes.paginationJustify}
									options={[
										{ label: __('Start', 'voxel-fse'), value: 'flex-start' },
										{ label: __('Center', 'voxel-fse'), value: 'center' },
										{ label: __('End', 'voxel-fse'), value: 'flex-end' },
										{ label: __('Space between', 'voxel-fse'), value: 'space-between' },
										{ label: __('Space around', 'voxel-fse'), value: 'space-around' },
									]}

									onChange={(value: string) => setAttributes({ paginationJustify: value })}
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
									onChange={(value) => setAttributes({ paginationTextColor: value })}
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
									onChange={(value) => setAttributes({ paginationIconColor: value })}
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

				<DimensionsControl
					label={__('Padding', 'voxel-fse')}
					values={attributes.paginationPadding || {}}
					onChange={(value) => setAttributes({ paginationPadding: value })}
					availableUnits={['px', 'em', '%']}
				/>

				<ResponsiveRangeControl
					label={__('Height', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="paginationHeight"
					min={0}
					max={100}
				/>

				<ResponsiveRangeControl
					label={__('Width', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="paginationWidth"
					unitAttributeName="paginationWidthUnit"
					availableUnits={['px', '%']}
					min={0}
					max={100}
				/>

				<ResponsiveRangeControl
					label={__('Icon text spacing', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="paginationIconTextSpacing"
					min={0}
					max={50}
				/>

				<SelectControl
					label={__('Border type', 'voxel-fse')}
					value={attributes.paginationBorderType}
					options={[
						{ label: __('None', 'voxel-fse'), value: '' },
						{ label: __('Solid', 'voxel-fse'), value: 'solid' },
						{ label: __('Double', 'voxel-fse'), value: 'double' },
						{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
						{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
						{ label: __('Groove', 'voxel-fse'), value: 'groove' },
					]}
					onChange={(value: string) => setAttributes({ paginationBorderType: value })}
				/>

				{attributes.paginationBorderType && (
					<>
						<SliderControl
							label={__('Border width', 'voxel-fse')}
							value={attributes.paginationBorderWidth}
							onChange={(value) => setAttributes({ paginationBorderWidth: value })}
							min={0}
							max={10}
						/>

						<ColorControl
							label={__('Border color', 'voxel-fse')}
							value={attributes.paginationBorderColor}
							onChange={(value) => setAttributes({ paginationBorderColor: value })}
						/>
					</>
				)}
			</AccordionPanel>

			{/* CAROUSEL NAVIGATION ACCORDION */}
			<AccordionPanel id="carousel-navigation" title={__('Carousel navigation', 'voxel-fse')}>
				<StyleTabPanel
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
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
									onChange={(value) => setAttributes({ carouselNavIconColor: value })}
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
									onChange={(value) => setAttributes({ carouselNavBackground: value })}
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
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="carouselNavButtonSizeHover"
									min={20}
									max={80}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="carouselNavIconSizeHover"
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

				<SelectControl
					label={__('Border type', 'voxel-fse')}
					value={attributes.carouselNavBorderType}
					options={[
						{ label: __('None', 'voxel-fse'), value: '' },
						{ label: __('Solid', 'voxel-fse'), value: 'solid' },
						{ label: __('Double', 'voxel-fse'), value: 'double' },
						{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
						{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
						{ label: __('Groove', 'voxel-fse'), value: 'groove' },
					]}
					onChange={(value: string) => setAttributes({ carouselNavBorderType: value })}
				/>

				{attributes.carouselNavBorderType && (
					<>
						<SliderControl
							label={__('Border width', 'voxel-fse')}
							value={attributes.carouselNavBorderWidth}
							onChange={(value) => setAttributes({ carouselNavBorderWidth: value })}
							min={0}
							max={10}
						/>

						<ColorControl
							label={__('Border color', 'voxel-fse')}
							value={attributes.carouselNavBorderColor}
							onChange={(value) => setAttributes({ carouselNavBorderColor: value })}
						/>
					</>
				)}
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
