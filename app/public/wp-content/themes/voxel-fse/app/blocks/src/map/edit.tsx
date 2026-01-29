/**
 * Map (VX) Block - Edit Component
 *
 * Editor UI with InspectorControls for configuring the map block.
 * Implements interactive Google Maps in editor following Plan C+ architecture.
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	SelectControl,
	ToggleControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import {
	ResponsiveRangeControl,
	RelationControl,
	InspectorTabs,
	AdvancedTab,
	VoxelTab,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';

import type { MapEditProps } from './types';
import { buildVxConfig, applyMapStyles } from './utils';
import StyleTab from './inspector/StyleTab';
import { generateMapResponsiveCSS } from './styles';

// Voxel Maps API types
// Evidence: themes/voxel/assets/dist/create-post.js - Voxel.Maps.LatLng
interface VoxelLatLng {
	getLatitude: () => number;
	getLongitude: () => number;
	toGeocoderFormat: () => { lat: number; lng: number };
}

interface VoxelMapInstance {
	setCenter: (position: VoxelLatLng) => void;
	setZoom: (zoom: number) => void;
	fitMarkers: () => void;
	getZoom: () => number;
}

interface VoxelMaps {
	await: (callback: () => void) => void;
	Map: new (config: {
		el: HTMLElement;
		zoom: number;
		center?: VoxelLatLng;
		minZoom?: number;
		maxZoom?: number;
	}) => VoxelMapInstance;
	LatLng: new (lat: number, lng: number) => VoxelLatLng;
	Marker: new (config: Record<string, unknown>) => unknown;
	Loaded?: boolean;
}

declare global {
	interface Window {
		Voxel?: {
			Maps?: VoxelMaps;
		};
	}
}

declare const Voxel: {
	Maps: VoxelMaps;
};

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
	const blockId = attributes.blockId || 'map';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-map-editor ts-map-widget',
		selectorPrefix: 'voxel-fse-map',
	});

	// Generate map-specific responsive CSS
	const mapResponsiveCSS = useMemo(
		() => generateMapResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, mapResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, mapResponsiveCSS]
	);

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: advancedProps.styles,
	});

	// Refs for map management
	const blockWrapperRef = useRef<HTMLDivElement>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<VoxelMapInstance | null>(null);
	const mapInitializedRef = useRef(false);

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Find all search form blocks on the page for RelationControl
	const searchFormBlocks = useSelect(
		(select) => {
			const { getBlocks } = select('core/block-editor') as {
				getBlocks: () => Array<{
					clientId: string;
					name: string;
					attributes: Record<string, unknown>;
					innerBlocks: Array<unknown>;
				}>;
			};

			// Recursive function to find blocks by name
			const findBlocksRecursive = (
				blocks: Array<{
					clientId: string;
					name: string;
					attributes: Record<string, unknown>;
					innerBlocks: Array<unknown>;
				}>,
				targetName: string
			): Array<{ clientId: string; name: string; attributes: Record<string, unknown> }> => {
				let found: Array<{ clientId: string; name: string; attributes: Record<string, unknown> }> = [];
				blocks.forEach((block) => {
					if (block.name === targetName && block.clientId !== clientId) {
						found.push(block);
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						found = found.concat(
							findBlocksRecursive(
								block.innerBlocks as typeof blocks,
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

	// Initialize interactive Google Map in editor
	const initializeMap = useCallback(() => {
		if (!mapContainerRef.current || mapInitializedRef.current) {
			return;
		}

		// Check if Voxel.Maps is available
		if (typeof Voxel === 'undefined' || !Voxel.Maps) {
			console.warn('[Map Block] Voxel.Maps not available yet');
			return;
		}

		Voxel.Maps.await(() => {
			if (!mapContainerRef.current || mapInitializedRef.current) {
				return;
			}

			try {
				// Create center position using Voxel.Maps.LatLng
				// Evidence: themes/voxel/assets/dist/create-post.js - new Voxel.Maps.LatLng()
				const centerPosition = new Voxel.Maps.LatLng(
					attributes.defaultLat,
					attributes.defaultLng
				);

				// Create map using Voxel's API
				// Evidence: themes/voxel/assets/dist/create-post.js - new Voxel.Maps.Map()
				mapInstanceRef.current = new Voxel.Maps.Map({
					el: mapContainerRef.current,
					zoom: attributes.defaultZoom,
					center: centerPosition,
					minZoom: attributes.minZoom,
					maxZoom: attributes.maxZoom,
				});
				mapContainerRef.current.classList.add('ts-map-loaded');
				mapInitializedRef.current = true;

				console.log('[Map Block] Interactive map initialized in editor');
			} catch (error) {
				console.error('[Map Block] Failed to initialize map:', error);
			}
		});
	}, [attributes.defaultLat, attributes.defaultLng, attributes.defaultZoom, attributes.minZoom, attributes.maxZoom]);

	// Effect to initialize map
	useEffect(() => {
		// Small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			initializeMap();
		}, 100);

		return () => clearTimeout(timer);
	}, [initializeMap]);

	// Update map center/zoom when attributes change
	useEffect(() => {
		if (mapInstanceRef.current && mapInitializedRef.current && typeof Voxel !== 'undefined' && Voxel.Maps) {
			const newCenter = new Voxel.Maps.LatLng(
				attributes.defaultLat,
				attributes.defaultLng
			);
			mapInstanceRef.current.setCenter(newCenter);
			mapInstanceRef.current.setZoom(attributes.defaultZoom);
		}
	}, [attributes.defaultLat, attributes.defaultLng, attributes.defaultZoom]);

	// Apply map styles to block wrapper
	useEffect(() => {
		if (blockWrapperRef.current) {
			const config = buildVxConfig(attributes);
			applyMapStyles(blockWrapperRef.current, config);
		}
	}, [attributes]);

	// Content Tab Component
	const ContentTab = () => (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="mapContentAccordion"
			defaultPanel="map-settings"
		>
			<AccordionPanel id="map-settings" title={__('Map settings', 'voxel-fse')}>
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
					onChange={(value: string) =>
						setAttributes({ source: value as 'search-form' | 'current-post' })
					}
				/>

				{attributes.source === 'search-form' && (
					<>
						<RelationControl
							label={__('Link to search form', 'voxel-fse')}
							items={searchFormBlocks.map((block) => ({
								// Use persistent blockId (not temporary clientId) for proper save/load
								id: (block.attributes.blockId as string) || block.clientId,
								clientId: block.clientId,
								label: (block.attributes.blockId as string) || block.clientId.substring(0, 7),
							}))}
							selectedId={attributes.searchFormId}
							onSelect={(id) => setAttributes({ searchFormId: id ?? '' })}
							widgetType="SearchForm"
							description={__(
								'Select the search form to link this map to.',
								'voxel-fse'
							)}
						/>

						<ToggleControl
							label={__('Show "Search this area" button', 'voxel-fse')}
							checked={attributes.dragSearch}
							onChange={(value: boolean) => setAttributes({ dragSearch: value })}
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
									onChange={(value: string) =>
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
										onChange={(value: string) =>
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
					onChange={(value: boolean) => setAttributes({ enableCalcHeight: value })}
				/>

				{attributes.enableCalcHeight && (
					<TextControl
						label={__('Calculation', 'voxel-fse')}
						help={__(
							'Use CSS calc() to calculate height e.g calc(100vh - 215px)',
							'voxel-fse'
						)}
						value={attributes.calcHeight}
						onChange={(value: string) => setAttributes({ calcHeight: value })}
						placeholder="calc(100vh - 70px)"
					/>
				)}

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes}
					setAttributes={setAttributes}
					attributeBaseName="mapBorderRadius"
					min={0}
					max={100}
					step={1}
				/>
			</AccordionPanel>

			{/* Content Tab - Default Map Location */}
			<AccordionPanel id="default-location" title={__('Default map location', 'voxel-fse')}>
				<div style={{ display: 'flex', gap: '10px' }}>
					<TextControl
						label={__('Default latitude', 'voxel-fse')}
						type="number"
						value={String(attributes.defaultLat)}
						onChange={(value: string) =>
							setAttributes({ defaultLat: parseFloat(value) || 0 })
						}
						help={__('-90 to 90', 'voxel-fse')}
					/>
					<TextControl
						label={__('Default longitude', 'voxel-fse')}
						type="number"
						value={String(attributes.defaultLng)}
						onChange={(value: string) =>
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
						value={attributes['minZoom'] as number}
						onChange={(value: number) => setAttributes({ minZoom: value })}
						min={0}
						max={30}
					/>
					<RangeControl
						label={__('Maximum zoom level', 'voxel-fse')}
						value={attributes['maxZoom'] as number}
						onChange={(value: number) => setAttributes({ maxZoom: value })}
						min={0}
						max={30}
					/>
				</div>
			</AccordionPanel>
		</AccordionPanelGroup>
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: ContentTab,
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
									context="editor"
								/>
							),
						},
						{
							id: 'advanced',
							label: __('Advanced', 'voxel-fse'),
							icon: '\ue916',
							render: () => (
								<AdvancedTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'voxel',
							label: __('Voxel', 'voxel-fse'),
							icon: '/wp-content/themes/voxel/assets/images/post-types/logo.svg',
							render: () => (
								<VoxelTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
					]}
				/>
			</InspectorControls>

			{/* Editor Preview - Interactive Google Map */}
			<div {...blockProps} ref={blockWrapperRef}>
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Drag search UI (shown when enabled) */}
				{attributes.source === 'search-form' && attributes.dragSearch && (
					<div className="ts-map-drag">
						{attributes.dragSearchMode === 'automatic' ? (
							<a
								href="#"
								className={`ts-map-btn ts-drag-toggle ${attributes.dragSearchDefault === 'checked' ? 'active' : ''
									}`}
								onClick={(e) => e.preventDefault()}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="18"
									height="18"
									fill="currentColor"
								>
									<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
								</svg>
								{__('Search as I move the map', 'voxel-fse')}
							</a>
						) : (
							<a
								href="#"
								className="ts-search-area ts-map-btn"
								onClick={(e) => e.preventDefault()}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									width="18"
									height="18"
									fill="currentColor"
								>
									<path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
								</svg>
								{__('Search this area', 'voxel-fse')}
							</a>
						)}
					</div>
				)}

				{/* Interactive Map Container */}
				<div
					ref={mapContainerRef}
					className="ts-map"
					style={{
						height: attributes.enableCalcHeight && attributes.calcHeight
							? attributes.calcHeight
							: `${attributes.height || 400}${attributes.heightUnit || 'px'}`,
						borderRadius: `${attributes.borderRadius || 0}px`,
					}}
					data-config={JSON.stringify({
						center: {
							lat: attributes.defaultLat,
							lng: attributes.defaultLng,
						},
						zoom: attributes.defaultZoom,
						minZoom: attributes.minZoom,
						maxZoom: attributes.maxZoom,
					})}
				/>

				{/* Hidden marker symbol for Voxel compatibility */}
				<div style={{ display: 'none' }}>
					<svg id="ts-symbol-marker" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 10.9696C3 6.01585 7.02944 2 12 2C16.9706 2 21 6.01585 21 10.9696C21 16.3296 15.929 20.2049 12.7799 21.8117C12.2877 22.0628 11.7123 22.0628 11.2201 21.8117C8.07101 20.2049 3 16.3296 3 10.9696ZM12 14.6136C13.933 14.6136 15.5 13.0323 15.5 11.0818C15.5 9.13121 13.933 7.54997 12 7.54997C10.067 7.54997 8.5 9.13121 8.5 11.0818C8.5 13.0323 10.067 14.6136 12 14.6136Z" />
					</svg>
				</div>
			</div>
		</>
	);
}
