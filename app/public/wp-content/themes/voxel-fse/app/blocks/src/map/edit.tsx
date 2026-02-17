/**
 * Map (VX) Block - Edit Component
 *
 * Editor UI with InspectorControls for configuring the map block.
 * Implements interactive Google Maps in editor following Plan C+ architecture.
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
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
	EmptyPlaceholder,
} from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';
import { getBlocksByNameRecursive, getBlockByBlockIdRecursive } from '../../shared/utils/blockSelectors';


import type { MapEditProps } from './types';
import { buildVxConfig, applyMapStyles } from './utils';
import StyleTab from './inspector/StyleTab';
import { generateMapResponsiveCSS } from './styles';
import {
	VxMap,
	VxMarker,
	VxLatLng,
	VxClusterer,
	VxPopup,
} from './voxel-maps-adapter';
import { addMarkersToMap, clearPreviewCardCache, type MarkerConfig } from './map-markers';
import { DEFAULT_CHECKMARK_SVG, DEFAULT_SEARCH_SVG } from './map-icons';

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
	// Include 'elementor-widget-ts-map' for Voxel CSS compatibility (geolocate button visibility)
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-map-editor ts-map-widget elementor-widget-ts-map',
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
	const mapInstanceRef = useRef<VxMap | null>(null);
	const mapInitializedRef = useRef(false);
	const editorMarkersRef = useRef<VxMarker[]>([]);
	const editorClustererRef = useRef<VxClusterer | null>(null);
	const editorPopupRef = useRef<VxPopup | null>(null);

	// Loading state for map initialization
	const [isMapLoaded, setIsMapLoaded] = useState(false);

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-map-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/map.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Find all search form blocks on the page for RelationControl
	const searchFormBlocks = useSelect(
		(select: any) => {
			const { getBlocks } = select('core/block-editor');
			const allBlocks = getBlocks();

			// Filter out current block to avoid self-reference
			return getBlocksByNameRecursive(allBlocks, 'voxel-fse/search-form')
				.filter((block: any) => block.clientId !== clientId);
		},
		// @ts-ignore - Dependency array supported in runtime
		[clientId]
	);

	// Read the linked search-form's mapEnableClusters attribute DIRECTLY from the store
	// This makes the editor preview reactive to toggling the clustering switch on the search-form block.
	// CRITICAL: We must use getBlockAttributes() inside the selector (not rely on searchFormBlocks array)
	// because searchFormBlocks is derived from getBlocks() which may not trigger re-renders
	// when only an attribute changes on a nested block.
	// Read the linked search-form's mapEnableClusters attribute DIRECTLY from the store
	// This makes the editor preview reactive to toggling the clustering switch on the search-form block.
	// Read the linked search-form's mapEnableClusters attribute DIRECTLY from the store
	// This makes the editor preview reactive to toggling the clustering switch on the search-form block.
	const enableClustersInEditor = useSelect(
		(select: any) => {
			if (!attributes.searchFormId || attributes.source !== 'search-form') {
				return true; // default: enabled (matches Voxel default 'yes')
			}
			const { getBlocksByClientId, getBlocks } = select('core/block-editor');

			// Find client ID using memoized recursive search
			const allBlocks = getBlocks();
			const foundBlock = getBlockByBlockIdRecursive(
				allBlocks,
				attributes.searchFormId,
				'voxel-fse/search-form'
			);

			const sfClientId = foundBlock ? foundBlock.clientId : null;
			if (!sfClientId) return true;

			// Read the attribute fresh from the store - this will trigger re-render when it changes
			const sfBlocks = getBlocksByClientId([sfClientId]);
			const sfBlock = sfBlocks?.[0];
			if (!sfBlock) return true;

			return sfBlock.attributes.mapEnableClusters !== false;
		},
		// @ts-ignore - Dependency array supported in runtime
		[attributes.searchFormId, attributes.source]
	);

	// Initialize interactive Google Map in editor using VxMap adapter
	// Uses Voxel.Maps.await() to wait indefinitely for Google Maps (no timeout)
	const initializeMap = useCallback(() => {
		if (!mapContainerRef.current || mapInitializedRef.current) {
			return;
		}

		const Voxel = (window as any).Voxel;
		if (!Voxel?.Maps) {
			console.warn('[Map Block] Voxel.Maps not available yet');
			return;
		}

		// Mark as initialized early to prevent duplicate init from re-renders
		mapInitializedRef.current = true;

		// Use Voxel.Maps.await() — waits indefinitely until Google Maps JS loads
		Voxel.Maps.await(() => {
			if (!mapContainerRef.current) return;

			try {
				const map = new VxMap({
					el: mapContainerRef.current,
					zoom: attributes.defaultZoom,
					center: new VxLatLng(attributes.defaultLat, attributes.defaultLng),
					minZoom: attributes.minZoom,
					maxZoom: attributes.maxZoom,
				});

				// Maps is already loaded, so init() resolves immediately
				map.init().then(() => {
					mapInstanceRef.current = map;
					setIsMapLoaded(true);
					console.log('[Map Block] Interactive map initialized in editor');
				}).catch((error) => {
					mapInitializedRef.current = false;
					console.error('[Map Block] Failed to initialize map:', error);
				});
			} catch (error) {
				mapInitializedRef.current = false;
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
		if (mapInstanceRef.current && mapInitializedRef.current) {
			mapInstanceRef.current.setCenter(new VxLatLng(attributes.defaultLat, attributes.defaultLng));
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

	// Load markers from post feed in editor with popup + clustering support
	// Uses shared addMarkersToMap() from map-markers.ts (same function as frontend.tsx)
	useEffect(() => {
		if (!isMapLoaded || !mapInstanceRef.current) return;

		let loadedPostIdKey = '';
		let isLoading = false;
		let isCancelled = false;

		// Create shared popup instance (one per map, same as frontend.tsx)
		if (!editorPopupRef.current) {
			const popup = new VxPopup({});
			popup.init(mapInstanceRef.current);
			editorPopupRef.current = popup;
		}

		/**
		 * Remove all markers from the map.
		 * Uses VxMarker.remove() for each tracked marker, plus DOM cleanup as fallback.
		 * Voxel's native Map.removeMarkers() can't be used because it relies on
		 * an internal markers[] array that isn't populated when markers are added
		 * through our VxMarker adapter path.
		 */
		const removeAllMarkers = () => {
			// Remove each tracked marker via Voxel's Marker.remove()
			// (calls marker.setMap(null) + marker.remove() on the AdvancedMarkerElement)
			editorMarkersRef.current.forEach((m) => m.remove());
			editorMarkersRef.current = [];

			// DOM fallback: remove any orphaned marker-wrapper elements from the map
			// This catches cases where Voxel's AdvancedMarkerElement.remove()
			// doesn't fully clean up the DOM node
			const mapEl = mapInstanceRef.current?.getElement();
			if (mapEl) {
				mapEl.querySelectorAll('.marker-wrapper').forEach((el) => el.remove());
			}

			// Clear clusterer
			if (editorClustererRef.current) {
				editorClustererRef.current.clearMarkers();
				editorClustererRef.current = null;
			}
		};

		const loadEditorMarkers = async () => {
			if (isCancelled || isLoading || !mapInstanceRef.current) return;

			// Find post IDs from rendered post feed cards in the editor
			const previewEls = document.querySelectorAll<HTMLElement>('.ts-preview[data-post-id]');
			if (previewEls.length === 0) return;

			const postIds = Array.from(previewEls)
				.map((el) => parseInt(el.getAttribute('data-post-id') || '0', 10))
				.filter((id) => id > 0);

			if (postIds.length === 0) return;

			// Skip if same post IDs already loaded
			const newKey = postIds.sort().join(',');
			if (newKey === loadedPostIdKey) return;

			isLoading = true;

			try {
				const restUrl = (window as any).wpApiSettings?.root || '/wp-json/';
				const res = await fetch(`${restUrl}voxel-fse/v1/map/markers`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': (window as any).wpApiSettings?.nonce || '',
					},
					body: JSON.stringify({ post_ids: postIds }),
				});

				// Check cancellation after async operation
				if (isCancelled) return;

				const data: { success: boolean; markers: Array<{ postId: number; lat: number; lng: number; template: string }> } = await res.json();

				if (!data.success || !data.markers || !mapInstanceRef.current || isCancelled) return;

				// Clear existing markers using Voxel's native method
				removeAllMarkers();
				clearPreviewCardCache();

				const map = mapInstanceRef.current;
				const popup = editorPopupRef.current!;

				// Convert REST API response to MarkerConfig[] for shared function
				const markerConfigs: MarkerConfig[] = data.markers.map((m) => ({
					lat: m.lat,
					lng: m.lng,
					template: m.template,
					postId: m.postId,
				}));

				// Initialize clusterer only when enabled by the linked search-form
				// Voxel parity: voxel-search-form.beautified.js:2406 - if (this.config.enable_clusters)
				let clusterer: VxClusterer | null = null;
				if (enableClustersInEditor) {
					try {
						clusterer = new VxClusterer();
						await clusterer.init(map);
						if (isCancelled) return;
						editorClustererRef.current = clusterer;
					} catch (err) {
						console.warn('[Map Block] Editor: clusterer init failed:', err);
					}
				}

				// Use shared addMarkersToMap — same function frontend.tsx uses
				const newMarkers = await addMarkersToMap(map, markerConfigs, popup, clusterer);
				if (isCancelled) {
					newMarkers.forEach((m) => m.remove());
					return;
				}
				editorMarkersRef.current = newMarkers;

				// Render clusters after markers are added
				if (clusterer) {
					clusterer.render();
				}

				loadedPostIdKey = newKey;
				console.log('[Map Block] Editor: loaded', data.markers.length, 'markers with popups');
			} catch (err) {
				if (!isCancelled) {
					console.warn('[Map Block] Editor: failed to load markers:', err);
				}
			} finally {
				isLoading = false;
			}
		};

		// Poll for post feed previews — they may render much later than the map
		// Retries every 2s for up to 30s, then stops polling
		let retryCount = 0;
		const maxRetries = 15;
		let pollTimer: ReturnType<typeof setTimeout> | null = null;

		const pollForPreviews = () => {
			if (isCancelled) return;
			const hasNewPreviews = document.querySelectorAll('.ts-preview[data-post-id]').length > 0;
			if (hasNewPreviews || loadedPostIdKey !== '') {
				loadEditorMarkers();
			} else if (retryCount < maxRetries) {
				retryCount++;
				pollTimer = setTimeout(pollForPreviews, 2000);
			}
		};

		// Start polling after initial delay
		pollTimer = setTimeout(pollForPreviews, 1500);

		return () => {
			isCancelled = true;
			if (pollTimer) clearTimeout(pollTimer);
			removeAllMarkers();
		};
	}, [isMapLoaded, enableClustersInEditor]);

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
							items={searchFormBlocks.map((block: any) => ({
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
					units={['px', '%', 'vh']}
					unitAttributeName="heightUnit"
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
					onChange={(value: number) => setAttributes({ defaultZoom: value })}
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

	const inspectorTabs = useMemo(() => [
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
				<AdvancedTab attributes={attributes as any} setAttributes={setAttributes} />
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
	], [attributes, setAttributes]); // Attributes needed for Style/Advanced/Voxel tabs

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={inspectorTabs}
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
								{/* DRY: Uses same DEFAULT_CHECKMARK_SVG as frontend.tsx (from shared map-icons.ts) */}
								<span dangerouslySetInnerHTML={{ __html: DEFAULT_CHECKMARK_SVG }} />
								{__('Search as I move the map', 'voxel-fse')}
							</a>
						) : (
							<a
								href="#"
								className="ts-search-area ts-map-btn"
								onClick={(e) => e.preventDefault()}
							>
								{/* DRY: Uses same DEFAULT_SEARCH_SVG as frontend.tsx (from shared map-icons.ts) */}
								<span dangerouslySetInnerHTML={{ __html: DEFAULT_SEARCH_SVG }} />
								{__('Search this area', 'voxel-fse')}
							</a>
						)}
					</div>
				)}

				{/* Geolocate button - matches Voxel's map.php:55 */}
				{/* FUNCTIONAL: Triggers real browser geolocation, matching Voxel's Elementor editor behavior */}
				<a
					href="#"
					rel="nofollow"
					role="button"
					className="vx-geolocate-me"
					aria-label={__('Share your location', 'voxel-fse')}
					onClick={(e) => {
						e.preventDefault();
						const btn = e.currentTarget as HTMLAnchorElement;

						// Add loading state
						btn.classList.add('loading');

						// Check if geolocation is available
						if (!navigator.geolocation) {
							btn.classList.remove('loading');
							const errorMsg = (window as any).Voxel_Config?.l10n?.positionFail || 'Geolocation is not supported by your browser.';
							// Use Voxel.alert if available (Voxel scripts are loaded in editor)
							if (typeof (window as any).Voxel?.alert === 'function') {
								(window as any).Voxel.alert(errorMsg, 'error');
							} else {
								// Fallback to console warning
								console.warn('[Map Block]', errorMsg);
							}
							return;
						}

						// Request user's location
						navigator.geolocation.getCurrentPosition(
							// Success callback
							(position) => {
								btn.classList.remove('loading');
								const { latitude, longitude } = position.coords;

								// Update map center if map is loaded
								if (mapInstanceRef.current) {
									mapInstanceRef.current.setCenter(new VxLatLng(latitude, longitude));
									mapInstanceRef.current.setZoom(15);
								}

								// Update block attributes so it persists
								setAttributes({
									defaultLat: latitude,
									defaultLng: longitude,
									defaultZoom: 15,
								});

								console.log('[Map Block] Geolocation success:', latitude, longitude);
							},
							// Error callback
							(_error) => {
								btn.classList.remove('loading');
								// PARITY: Use Voxel's exact localized message (voxel-map.beautified.js:516)
								const errorMsg = (window as any).Voxel_Config?.l10n?.positionFail || 'Could not determine your location.';

								// Use Voxel.alert if available
								if (typeof (window as any).Voxel?.alert === 'function') {
									(window as any).Voxel.alert(errorMsg, 'error');
								} else {
									console.warn('[Map Block]', errorMsg);
								}
							},
							// Options
							{
								enableHighAccuracy: true,
								timeout: 10000,
								maximumAge: 0,
							}
						);
					}}
					style={{
						display: 'flex',
						position: 'absolute',
						top: '8px',
						left: '8px',
						width: '32px',
						height: '32px',
						backgroundColor: '#fff',
						boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
						padding: '5px',
						borderRadius: '2px',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 5,
					}}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 25 25"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						style={{ opacity: 0.6 }}
					>
						<path
							d="M12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z"
							fill="currentColor"
						/>
						<path
							d="M13.1523 2.19141C13.1523 1.77719 12.8166 1.44141 12.4023 1.44141C11.9881 1.44141 11.6523 1.77719 11.6523 2.19141V3.72405C7.5566 4.0822 4.29367 7.34575 3.93549 11.4414H2.40234C1.98813 11.4414 1.65234 11.7772 1.65234 12.1914C1.65234 12.6056 1.98813 12.9414 2.40234 12.9414H3.93545C4.29344 17.0373 7.55645 20.301 11.6523 20.6592V22.1914C11.6523 22.6056 11.9881 22.9414 12.4023 22.9414C12.8166 22.9414 13.1523 22.6056 13.1523 22.1914V20.6592C17.2482 20.301 20.5113 17.0373 20.8692 12.9414H22.4023C22.8166 12.9414 23.1523 12.6056 23.1523 12.1914C23.1523 11.7772 22.8166 11.4414 22.4023 11.4414H20.8692C20.511 7.34575 17.2481 4.0822 13.1523 3.72405V2.19141ZM12.4025 7.94141C14.7496 7.94141 16.6522 9.84446 16.6522 12.1914C16.6522 14.5383 14.7496 16.4414 12.4025 16.4414C10.0554 16.4414 8.15283 14.5384 8.15283 12.1914C8.15283 9.84446 10.0554 7.94141 12.4025 7.94141ZM12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z"
							fill="currentColor"
						/>
					</svg>
				</a>

				{/* Map wrapper with relative positioning for placeholder overlay */}
				<div style={{ position: 'relative' }}>
					{/* Loading placeholder - rendered as sibling to avoid DOM conflicts with Google Maps */}
					{!isMapLoaded && (
						<EmptyPlaceholder
							icon={'\ue826'} /* eicon-map-pin */
							text={__('Loading map...', 'voxel-fse')}
							style={{
								position: 'absolute',
								inset: 0,
								zIndex: 10,
								height: attributes.enableCalcHeight && attributes.calcHeight
									? attributes.calcHeight
									: `${attributes.height || 400}${attributes.heightUnit || 'px'}`,
								borderRadius: `${attributes.borderRadius || 0}px`,
							}}
						/>
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
				</div>

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
