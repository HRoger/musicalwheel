/**
 * Map Markers - Shared marker creation with popup support
 *
 * Used by both edit.tsx (editor) and frontend.tsx (frontend).
 * Extracted to avoid code duplication.
 *
 * Evidence: voxel-search-form.beautified.js:2520-2644
 *
 * @package VoxelFSE
 */

import {
	VxMap,
	VxMarker,
	VxLatLng,
	VxClusterer,
	VxPopup,
	type VxMarkerOptions,
} from './voxel-maps-adapter';

/**
 * Preview card cache for map marker popups
 * Key format: postId (string)
 * Evidence: voxel-search-form.beautified.js:2566
 */
const previewCardCache: Record<string, string> = {};

/**
 * Get the Voxel AJAX URL for fetching preview cards
 */
function getVoxelAjaxUrl(): string {
	if ((window as any).Voxel_Config?.ajax_url) {
		return (window as any).Voxel_Config.ajax_url;
	}
	return `${window.location.origin}/?vx=1`;
}

/**
 * Create navigation HTML for prev/next in popup
 * Evidence: templates/widgets/search-form.php:225-230
 */
function createNavHTML(): string {
	return `<div class="ts-map-nav">
		<a href="#" class="ts-map-prev ts-icon-btn"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.746 6.00002C10.746 5.69663 10.5632 5.42312 10.2829 5.30707C10.0026 5.19101 9.67996 5.25526 9.4655 5.46986L3.51254 11.4266C3.35184 11.5642 3.25 11.7685 3.25 11.9966V11.9982C3.24959 12.1906 3.32276 12.3831 3.46949 12.53L9.46548 18.5302C9.67994 18.7448 10.0026 18.809 10.2829 18.693C10.5632 18.5769 10.746 18.3034 10.746 18L10.746 12.7466L20.0014 12.7466C20.4156 12.7466 20.7514 12.4108 20.7514 11.9966C20.7514 11.5824 20.4156 11.2466 20.0014 11.2466L10.746 11.2466V6.00002Z" fill="#343C54"/></svg></a>
		<a href="#" class="ts-map-next ts-icon-btn"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="#343C54"/></svg></a>
	</div>`;
}

/**
 * Marker config type matching the REST API response
 */
export interface MarkerConfig {
	lat: number;
	lng: number;
	template: string;
	uriencoded?: boolean;
	postId?: number | string;
}

/**
 * Add markers to map with popup + clustering support
 *
 * Implements the full marker click → popup flow:
 * 1. Cache check — return cached preview card HTML
 * 2. Feed DOM clone — clone .ts-preview[data-post-id] from post feed
 * 3. AJAX fetch — /?vx=1&action=get_preview_card&post_id={id}
 *
 * Evidence: voxel-search-form.beautified.js:2520-2644
 */
export async function addMarkersToMap(
	map: VxMap,
	markerConfigs: MarkerConfig[],
	popup: VxPopup,
	clusterer: VxClusterer | null,
	postIds?: string[]
): Promise<VxMarker[]> {
	if (!markerConfigs || markerConfigs.length === 0) return [];

	const markers: VxMarker[] = [];
	const markersByPostId: Record<string, VxMarker> = {};

	for (let i = 0; i < markerConfigs.length; i++) {
		const config = markerConfigs[i];
		const postId = postIds?.[i] || String(config.postId || '');
		const template = config.uriencoded
			? decodeURIComponent(config.template)
			: config.template;

		const markerOptions: VxMarkerOptions = {
			position: new VxLatLng(config.lat, config.lng),
			template,
			onClick: (_e, marker) => {
				if (!postId) {
					const pos = marker.getPosition();
					if (pos) {
						popup.setPosition(pos);
						popup.setContent(template);
						popup.show();
					}
					return;
				}

				// Toggle marker-active class
				markers.forEach((m) => m.removeClass('marker-active'));
				marker.addClass('marker-active');

				// Close popup on map click
				map.addListener('click', function onMapClick() {
					marker.removeClass('marker-active');
					popup.hide();
				});

				/**
				 * Show popup with content and optional navigation
				 */
				const showPopup = (contentEl: HTMLElement) => {
					if (markers.length > 1) {
						const existingNav = contentEl.querySelector('.ts-map-nav');
						if (!existingNav) {
							contentEl.insertAdjacentHTML('beforeend', createNavHTML());
						}

						const prevBtn = contentEl.querySelector('.ts-map-prev');
						const nextBtn = contentEl.querySelector('.ts-map-next');
						const keys = Object.keys(markersByPostId);
						const idx = keys.indexOf(postId);

						prevBtn?.addEventListener('click', (evt) => {
							evt.preventDefault();
							evt.stopPropagation();
							if (idx !== -1) {
								const prevIdx = idx > 0 ? idx - 1 : keys.length - 1;
								const prevMarker = markersByPostId[keys[prevIdx]];
								if (prevMarker) {
									const native = prevMarker.getNative();
									if (native?.onClick) native.onClick(new Event('click'), native);
								}
							}
						});

						nextBtn?.addEventListener('click', (evt) => {
							evt.preventDefault();
							evt.stopPropagation();
							if (idx !== -1) {
								const nextIdx = keys.length > idx + 1 ? idx + 1 : 0;
								const nextMarker = markersByPostId[keys[nextIdx]];
								if (nextMarker) {
									const native = nextMarker.getNative();
									if (native?.onClick) native.onClick(new Event('click'), native);
								}
							}
						});
					}

					const pos = marker.getPosition();
					if (pos) {
						popup.setPosition(pos);
						popup.setContent(contentEl);
						popup.show();
					}
				};

				// 1. Check cache
				if (previewCardCache[postId]) {
					const el = document.createElement('div');
					el.className = 'ts-preview-popup';
					el.innerHTML = previewCardCache[postId];
					showPopup(el);
					return;
				}

				// 2. Clone from feed DOM
				const feedEl = document.querySelector(`.ts-preview[data-post-id="${postId}"]`);
				if (feedEl) {
					const clone = feedEl.cloneNode(true) as HTMLElement;
					clone.classList.remove('ts-preview');
					clone.classList.add('ts-preview-popup');
					clone.removeAttribute('style');
					previewCardCache[postId] = clone.innerHTML;
					showPopup(clone);
					return;
				}

				// 3. Fetch via AJAX
				const loadingEl = document.createElement('div');
				loadingEl.className = 'ts-preview-popup ts-loading-popup';
				loadingEl.innerHTML = '<span class="ts-loader"></span>';
				const pos = marker.getPosition();
				if (pos) {
					popup.setPosition(pos);
					popup.setContent(loadingEl);
					popup.show();
				}

				const ajaxUrl = getVoxelAjaxUrl();
				fetch(`${ajaxUrl}&action=get_preview_card&post_id=${postId}`)
					.then((res) => res.text())
					.then((html) => {
						const el = document.createElement('div');
						el.className = 'ts-preview-popup';
						el.innerHTML = html;
						previewCardCache[postId] = html;
						showPopup(el);
					})
					.catch(() => {
						const el = document.createElement('div');
						el.className = 'ts-preview-popup';
						previewCardCache[postId] = '';
						showPopup(el);
					});
			},
			data: { lat: config.lat, lng: config.lng, postId },
		};

		const marker = new VxMarker(markerOptions);
		marker.init(map);
		markers.push(marker);
		if (postId) {
			markersByPostId[postId] = marker;
		}
	}

	// Add to clusterer if available
	if (clusterer && markers.length > 0) {
		clusterer.addMarkers(markers);
	}

	return markers;
}

/**
 * Clear the preview card cache (call on marker refresh)
 */
export function clearPreviewCardCache(): void {
	Object.keys(previewCardCache).forEach((k) => delete previewCardCache[k]);
}
