/**
 * Map (VX) Block - Edit Component
 *
 * Editor UI with InspectorControls for configuring the map block.
 */

import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	ToggleControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';

import {
	ResponsiveRangeControl,
	ColorControl,
	BoxShadowControl,
	TypographyControl,
	IconPickerControl,
	BoxControl,
	SectionHeading,
} from '@shared/controls';

import type { MapEditProps } from './types';

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return `map-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Edit component
 */
export default function Edit({ attributes, setAttributes, clientId }: MapEditProps) {
	const blockProps = useBlockProps({
		className: 'voxel-fse-map-editor ts-map-widget',
	});

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	return (
		<>
			<InspectorControls>
				{/* Content Tab - Map Settings */}
				<PanelBody title={__('Map settings', 'voxel-fse')} initialOpen={true}>
					<SelectControl
						label={__('Markers', 'voxel-fse')}
						value={attributes.source}
						options={[
							{
								label: __('Get markers from Search Form widget', 'voxel-fse'),
								value: 'search-form',
							},
							{
								label: __('Show marker of current post', 'voxel-fse'),
								value: 'current-post',
							},
						]}
						onChange={(value) =>
							setAttributes({ source: value as 'search-form' | 'current-post' })
						}
					/>

					{attributes.source === 'search-form' && (
						<>
							<TextControl
								label={__('Link to search form', 'voxel-fse')}
								help={__(
									'Enter the block ID of the Search Form block to connect to.',
									'voxel-fse'
								)}
								value={attributes.searchFormId}
								onChange={(value) => setAttributes({ searchFormId: value })}
								placeholder={__('e.g., search-form-abc123', 'voxel-fse')}
							/>

							<ToggleControl
								label={__('Show "Search this area" button', 'voxel-fse')}
								checked={attributes.dragSearch}
								onChange={(value) => setAttributes({ dragSearch: value })}
							/>

							{attributes.dragSearch && (
								<>
									<SelectControl
										label={__('Search mode', 'voxel-fse')}
										value={attributes.dragSearchMode}
										options={[
											{
												label: __(
													'Automatic: Search is performed automatically as the user drags the map',
													'voxel-fse'
												),
												value: 'automatic',
											},
											{
												label: __(
													'Manual: Search is performed when the button is clicked',
													'voxel-fse'
												),
												value: 'manual',
											},
										]}
										onChange={(value) =>
											setAttributes({
												dragSearchMode: value as 'automatic' | 'manual',
											})
										}
									/>

									{attributes.dragSearchMode === 'automatic' && (
										<SelectControl
											label={__('Map drag default state', 'voxel-fse')}
											help={__(
												'If enabled, dragging the map will trigger a search for posts within the visible map bounds.',
												'voxel-fse'
											)}
											value={attributes.dragSearchDefault}
											options={[
												{ label: __('Checked', 'voxel-fse'), value: 'checked' },
												{
													label: __('Unchecked', 'voxel-fse'),
													value: 'unchecked',
												},
											]}
											onChange={(value) =>
												setAttributes({
													dragSearchDefault: value as 'checked' | 'unchecked',
												})
											}
										/>
									)}
								</>
							)}
						</>
					)}

					<ResponsiveRangeControl
						label={__('Height', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="height"
						min={100}
						max={1200}
						step={1}
					/>

					<ToggleControl
						label={__('Calculate height?', 'voxel-fse')}
						checked={attributes.enableCalcHeight}
						onChange={(value) => setAttributes({ enableCalcHeight: value })}
					/>

					{attributes.enableCalcHeight && (
						<TextControl
							label={__('Calculation', 'voxel-fse')}
							help={__(
								'Use CSS calc() to calculate height e.g calc(100vh - 215px)',
								'voxel-fse'
							)}
							value={attributes.calcHeight}
							onChange={(value) => setAttributes({ calcHeight: value })}
							placeholder="calc(100vh - 70px)"
						/>
					)}

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="borderRadius"
						min={0}
						max={100}
						step={1}
					/>
				</PanelBody>

				{/* Content Tab - Default Map Location */}
				<PanelBody
					title={__('Default map location', 'voxel-fse')}
					initialOpen={false}
				>
					<div style={{ display: 'flex', gap: '10px' }}>
						<TextControl
							label={__('Default latitude', 'voxel-fse')}
							type="number"
							value={String(attributes.defaultLat)}
							onChange={(value) =>
								setAttributes({ defaultLat: parseFloat(value) || 0 })
							}
							help={__('-90 to 90', 'voxel-fse')}
						/>
						<TextControl
							label={__('Default longitude', 'voxel-fse')}
							type="number"
							value={String(attributes.defaultLng)}
							onChange={(value) =>
								setAttributes({ defaultLng: parseFloat(value) || 0 })
							}
							help={__('-180 to 180', 'voxel-fse')}
						/>
					</div>

					<RangeControl
						label={__('Default zoom level', 'voxel-fse')}
						value={attributes.defaultZoom}
						onChange={(value) => setAttributes({ defaultZoom: value })}
						min={0}
						max={30}
					/>

					<div style={{ display: 'flex', gap: '10px' }}>
						<RangeControl
							label={__('Minimum zoom level', 'voxel-fse')}
							value={attributes.minZoom}
							onChange={(value) => setAttributes({ minZoom: value })}
							min={0}
							max={30}
						/>
						<RangeControl
							label={__('Maximum zoom level', 'voxel-fse')}
							value={attributes.maxZoom}
							onChange={(value) => setAttributes({ maxZoom: value })}
							min={0}
							max={30}
						/>
					</div>
				</PanelBody>
			</InspectorControls>

			{/* Style Tab - Clusters */}
			<InspectorControls group="styles">
				<PanelBody title={__('Clusters', 'voxel-fse')} initialOpen={false}>
					<ResponsiveRangeControl
						label={__('Size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="clusterSize"
						min={0}
						max={100}
						step={1}
					/>

					<ColorControl
						label={__('Background color', 'voxel-fse')}
						value={attributes.clusterBgColor}
						onChange={(value) => setAttributes({ clusterBgColor: value })}
					/>

					<BoxShadowControl
						label={__('Box Shadow', 'voxel-fse')}
						value={attributes.clusterShadow}
						onChange={(value) => setAttributes({ clusterShadow: value })}
					/>

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="clusterRadius"
						min={0}
						max={100}
						step={1}
					/>

					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.clusterTypography}
						onChange={(value) => setAttributes({ clusterTypography: value })}
					/>

					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.clusterTextColor}
						onChange={(value) => setAttributes({ clusterTextColor: value })}
					/>
				</PanelBody>

				{/* Style Tab - Icon Marker */}
				<PanelBody title={__('Icon marker', 'voxel-fse')} initialOpen={false}>
					<SectionHeading>{__('General', 'voxel-fse')}</SectionHeading>

					<ResponsiveRangeControl
						label={__('Marker size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="iconMarkerSize"
						min={30}
						max={60}
						step={1}
					/>

					<ResponsiveRangeControl
						label={__('Marker icon size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="iconMarkerIconSize"
						min={10}
						max={60}
						step={1}
					/>

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="iconMarkerRadius"
						min={0}
						max={100}
						step={1}
					/>

					<BoxShadowControl
						label={__('Box Shadow', 'voxel-fse')}
						value={attributes.iconMarkerShadow}
						onChange={(value) => setAttributes({ iconMarkerShadow: value })}
					/>

					<SectionHeading>{__('Static marker', 'voxel-fse')}</SectionHeading>

					<ColorControl
						label={__('Background color', 'voxel-fse')}
						value={attributes.iconMarkerStaticBg}
						onChange={(value) => setAttributes({ iconMarkerStaticBg: value })}
					/>

					<ColorControl
						label={__('Background color (Active)', 'voxel-fse')}
						value={attributes.iconMarkerStaticBgActive}
						onChange={(value) =>
							setAttributes({ iconMarkerStaticBgActive: value })
						}
					/>

					<ColorControl
						label={__('Icon color', 'voxel-fse')}
						value={attributes.iconMarkerStaticIconColor}
						onChange={(value) =>
							setAttributes({ iconMarkerStaticIconColor: value })
						}
					/>

					<ColorControl
						label={__('Icon color (Active)', 'voxel-fse')}
						value={attributes.iconMarkerStaticIconColorActive}
						onChange={(value) =>
							setAttributes({ iconMarkerStaticIconColorActive: value })
						}
					/>
				</PanelBody>

				{/* Style Tab - Text Marker */}
				<PanelBody title={__('Text marker', 'voxel-fse')} initialOpen={false}>
					<ColorControl
						label={__('Background color', 'voxel-fse')}
						value={attributes.textMarkerBgColor}
						onChange={(value) => setAttributes({ textMarkerBgColor: value })}
					/>

					<ColorControl
						label={__('Background color (Active)', 'voxel-fse')}
						value={attributes.textMarkerBgColorActive}
						onChange={(value) =>
							setAttributes({ textMarkerBgColorActive: value })
						}
					/>

					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.textMarkerTextColor}
						onChange={(value) => setAttributes({ textMarkerTextColor: value })}
					/>

					<ColorControl
						label={__('Text color (Active)', 'voxel-fse')}
						value={attributes.textMarkerTextColorActive}
						onChange={(value) =>
							setAttributes({ textMarkerTextColorActive: value })
						}
					/>

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="textMarkerRadius"
						min={0}
						max={100}
						step={1}
					/>

					<TypographyControl
						label={__('Title typography', 'voxel-fse')}
						value={attributes.textMarkerTypography}
						onChange={(value) => setAttributes({ textMarkerTypography: value })}
					/>

					<BoxControl
						label={__('Padding', 'voxel-fse')}
						values={attributes.textMarkerPadding}
						onChange={(value) => setAttributes({ textMarkerPadding: value })}
					/>

					<BoxShadowControl
						label={__('Box Shadow', 'voxel-fse')}
						value={attributes.textMarkerShadow}
						onChange={(value) => setAttributes({ textMarkerShadow: value })}
					/>
				</PanelBody>

				{/* Style Tab - Image Marker */}
				<PanelBody title={__('Image marker', 'voxel-fse')} initialOpen={false}>
					<ResponsiveRangeControl
						label={__('Marker size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="imageMarkerSize"
						min={30}
						max={60}
						step={1}
					/>

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="imageMarkerRadius"
						min={0}
						max={100}
						step={1}
					/>

					<BoxShadowControl
						label={__('Box Shadow', 'voxel-fse')}
						value={attributes.imageMarkerShadow}
						onChange={(value) => setAttributes({ imageMarkerShadow: value })}
					/>
				</PanelBody>

				{/* Style Tab - Map Popup */}
				<PanelBody title={__('Map popup', 'voxel-fse')} initialOpen={false}>
					<ResponsiveRangeControl
						label={__('Card width', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="popupCardWidth"
						min={0}
						max={700}
						step={1}
					/>

					<SectionHeading>{__('Loader', 'voxel-fse')}</SectionHeading>

					<ColorControl
						label={__('Color 1', 'voxel-fse')}
						value={attributes.popupLoaderColor1}
						onChange={(value) => setAttributes({ popupLoaderColor1: value })}
					/>

					<ColorControl
						label={__('Color 2', 'voxel-fse')}
						value={attributes.popupLoaderColor2}
						onChange={(value) => setAttributes({ popupLoaderColor2: value })}
					/>
				</PanelBody>

				{/* Style Tab - Search Button */}
				<PanelBody title={__('Search button', 'voxel-fse')} initialOpen={false}>
					<TypographyControl
						label={__('Typography', 'voxel-fse')}
						value={attributes.searchBtnTypography}
						onChange={(value) => setAttributes({ searchBtnTypography: value })}
					/>

					<ColorControl
						label={__('Text color', 'voxel-fse')}
						value={attributes.searchBtnTextColor}
						onChange={(value) => setAttributes({ searchBtnTextColor: value })}
					/>

					<ColorControl
						label={__('Background color', 'voxel-fse')}
						value={attributes.searchBtnBgColor}
						onChange={(value) => setAttributes({ searchBtnBgColor: value })}
					/>

					<ColorControl
						label={__('Icon color', 'voxel-fse')}
						value={attributes.searchBtnIconColor}
						onChange={(value) => setAttributes({ searchBtnIconColor: value })}
					/>

					<ColorControl
						label={__('Icon color (Active)', 'voxel-fse')}
						value={attributes.searchBtnIconColorActive}
						onChange={(value) =>
							setAttributes({ searchBtnIconColorActive: value })
						}
					/>

					<ResponsiveRangeControl
						label={__('Border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="searchBtnRadius"
						min={0}
						max={100}
						step={1}
					/>

					<IconPickerControl
						label={__('Checkmark icon', 'voxel-fse')}
						value={attributes.checkmarkIcon}
						onChange={(value) => setAttributes({ checkmarkIcon: value })}
					/>
				</PanelBody>

				{/* Style Tab - Next/Prev Buttons */}
				<PanelBody
					title={__('Next/Prev buttons', 'voxel-fse')}
					initialOpen={false}
				>
					<SectionHeading>{__('Normal', 'voxel-fse')}</SectionHeading>

					<ColorControl
						label={__('Button icon color', 'voxel-fse')}
						value={attributes.navBtnIconColor}
						onChange={(value) => setAttributes({ navBtnIconColor: value })}
					/>

					<ResponsiveRangeControl
						label={__('Button icon size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="navBtnIconSize"
						min={0}
						max={100}
						step={1}
					/>

					<ColorControl
						label={__('Button background', 'voxel-fse')}
						value={attributes.navBtnBgColor}
						onChange={(value) => setAttributes({ navBtnBgColor: value })}
					/>

					<SelectControl
						label={__('Border Type', 'voxel-fse')}
						value={attributes.navBtnBorderType}
						options={[
							{ label: __('None', 'voxel-fse'), value: 'none' },
							{ label: __('Solid', 'voxel-fse'), value: 'solid' },
							{ label: __('Dashed', 'voxel-fse'), value: 'dashed' },
							{ label: __('Dotted', 'voxel-fse'), value: 'dotted' },
						]}
						onChange={(value) => setAttributes({ navBtnBorderType: value })}
					/>

					{attributes.navBtnBorderType !== 'none' && (
						<>
							<ResponsiveRangeControl
								label={__('Border Width', 'voxel-fse')}
								attributes={attributes}
								setAttributes={setAttributes}
								attributeBaseName="navBtnBorderWidth"
								min={0}
								max={10}
								step={1}
							/>
							<ColorControl
								label={__('Border Color', 'voxel-fse')}
								value={attributes.navBtnBorderColor}
								onChange={(value) => setAttributes({ navBtnBorderColor: value })}
							/>
						</>
					)}

					<ResponsiveRangeControl
						label={__('Button border radius', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="navBtnRadius"
						min={0}
						max={100}
						step={1}
					/>

					<BoxShadowControl
						label={__('Box Shadow', 'voxel-fse')}
						value={attributes.navBtnShadow}
						onChange={(value) => setAttributes({ navBtnShadow: value })}
					/>

					<ResponsiveRangeControl
						label={__('Button size', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName="navBtnSize"
						min={0}
						max={100}
						step={1}
					/>

					<SectionHeading>{__('Hover', 'voxel-fse')}</SectionHeading>

					<ColorControl
						label={__('Button icon color', 'voxel-fse')}
						value={attributes.navBtnIconColorHover}
						onChange={(value) => setAttributes({ navBtnIconColorHover: value })}
					/>

					<ColorControl
						label={__('Button background color', 'voxel-fse')}
						value={attributes.navBtnBgColorHover}
						onChange={(value) => setAttributes({ navBtnBgColorHover: value })}
					/>

					<ColorControl
						label={__('Button border color', 'voxel-fse')}
						value={attributes.navBtnBorderColorHover}
						onChange={(value) =>
							setAttributes({ navBtnBorderColorHover: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			{/* Editor Preview */}
			<div {...blockProps}>
				<div
					className="voxel-fse-map-preview"
					style={{
						minHeight: `${attributes.height || 400}${attributes.heightUnit || 'px'}`,
						borderRadius: `${attributes.borderRadius || 0}px`,
					}}
				>
					<div className="voxel-fse-map-preview-content">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="48"
							height="48"
							fill="currentColor"
						>
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
						</svg>
						<div className="voxel-fse-map-preview-info">
							<span className="voxel-fse-map-preview-title">
								{__('Map (VX)', 'voxel-fse')}
							</span>
							<span className="voxel-fse-map-preview-mode">
								{attributes.source === 'current-post'
									? __('Current post marker', 'voxel-fse')
									: __('Search form markers', 'voxel-fse')}
							</span>
							<span className="voxel-fse-map-preview-coords">
								{attributes.defaultLat.toFixed(3)}, {attributes.defaultLng.toFixed(3)}{' '}
								(zoom: {attributes.defaultZoom})
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
