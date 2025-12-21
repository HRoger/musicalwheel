/**
 * Map (VX) Block - Save Function
 *
 * Outputs vxconfig JSON + placeholder HTML for frontend hydration.
 * NO PHP rendering - Plan C+ architecture.
 */

import { useBlockProps } from '@wordpress/block-editor';

import type { MapSaveProps, MapVxConfig } from './types';

/**
 * Build vxconfig object from attributes
 */
function buildVxConfig(attributes: MapSaveProps['attributes']): MapVxConfig {
	return {
		source: attributes.source,
		searchFormId: attributes.searchFormId,
		dragSearch: attributes.dragSearch,
		dragSearchMode: attributes.dragSearchMode,
		dragSearchDefault: attributes.dragSearchDefault,
		center: {
			lat: attributes.defaultLat,
			lng: attributes.defaultLng,
		},
		zoom: attributes.defaultZoom,
		minZoom: attributes.minZoom,
		maxZoom: attributes.maxZoom,
		styles: {
			height: {
				desktop: attributes.height,
				tablet: attributes.height_tablet,
				mobile: attributes.height_mobile,
			},
			heightUnit: attributes.heightUnit,
			calcHeight: {
				desktop: attributes.calcHeight,
				tablet: attributes.calcHeight_tablet,
				mobile: attributes.calcHeight_mobile,
			},
			enableCalcHeight: {
				desktop: attributes.enableCalcHeight,
				tablet: attributes.enableCalcHeight_tablet,
				mobile: attributes.enableCalcHeight_mobile,
			},
			borderRadius: {
				desktop: attributes.borderRadius,
				tablet: attributes.borderRadius_tablet,
				mobile: attributes.borderRadius_mobile,
			},
			cluster: {
				size: {
					desktop: attributes.clusterSize,
					tablet: attributes.clusterSize_tablet,
					mobile: attributes.clusterSize_mobile,
				},
				bgColor: {
					desktop: attributes.clusterBgColor,
					tablet: attributes.clusterBgColor_tablet,
					mobile: attributes.clusterBgColor_mobile,
				},
				shadow: attributes.clusterShadow,
				radius: {
					desktop: attributes.clusterRadius,
					tablet: attributes.clusterRadius_tablet,
					mobile: attributes.clusterRadius_mobile,
				},
				typography: attributes.clusterTypography,
				textColor: {
					desktop: attributes.clusterTextColor,
					tablet: attributes.clusterTextColor_tablet,
					mobile: attributes.clusterTextColor_mobile,
				},
			},
			iconMarker: {
				size: {
					desktop: attributes.iconMarkerSize,
					tablet: attributes.iconMarkerSize_tablet,
					mobile: attributes.iconMarkerSize_mobile,
				},
				iconSize: {
					desktop: attributes.iconMarkerIconSize,
					tablet: attributes.iconMarkerIconSize_tablet,
					mobile: attributes.iconMarkerIconSize_mobile,
				},
				radius: {
					desktop: attributes.iconMarkerRadius,
					tablet: attributes.iconMarkerRadius_tablet,
					mobile: attributes.iconMarkerRadius_mobile,
				},
				shadow: attributes.iconMarkerShadow,
				staticBg: {
					desktop: attributes.iconMarkerStaticBg,
					tablet: attributes.iconMarkerStaticBg_tablet,
					mobile: attributes.iconMarkerStaticBg_mobile,
				},
				staticBgActive: {
					desktop: attributes.iconMarkerStaticBgActive,
					tablet: attributes.iconMarkerStaticBgActive_tablet,
					mobile: attributes.iconMarkerStaticBgActive_mobile,
				},
				staticIconColor: {
					desktop: attributes.iconMarkerStaticIconColor,
					tablet: attributes.iconMarkerStaticIconColor_tablet,
					mobile: attributes.iconMarkerStaticIconColor_mobile,
				},
				staticIconColorActive: {
					desktop: attributes.iconMarkerStaticIconColorActive,
					tablet: attributes.iconMarkerStaticIconColorActive_tablet,
					mobile: attributes.iconMarkerStaticIconColorActive_mobile,
				},
			},
			textMarker: {
				bgColor: {
					desktop: attributes.textMarkerBgColor,
					tablet: attributes.textMarkerBgColor_tablet,
					mobile: attributes.textMarkerBgColor_mobile,
				},
				bgColorActive: {
					desktop: attributes.textMarkerBgColorActive,
					tablet: attributes.textMarkerBgColorActive_tablet,
					mobile: attributes.textMarkerBgColorActive_mobile,
				},
				textColor: {
					desktop: attributes.textMarkerTextColor,
					tablet: attributes.textMarkerTextColor_tablet,
					mobile: attributes.textMarkerTextColor_mobile,
				},
				textColorActive: {
					desktop: attributes.textMarkerTextColorActive,
					tablet: attributes.textMarkerTextColorActive_tablet,
					mobile: attributes.textMarkerTextColorActive_mobile,
				},
				radius: {
					desktop: attributes.textMarkerRadius,
					tablet: attributes.textMarkerRadius_tablet,
					mobile: attributes.textMarkerRadius_mobile,
				},
				typography: attributes.textMarkerTypography,
				padding: {
					desktop: attributes.textMarkerPadding,
					tablet: attributes.textMarkerPadding_tablet,
					mobile: attributes.textMarkerPadding_mobile,
				},
				shadow: attributes.textMarkerShadow,
			},
			imageMarker: {
				size: {
					desktop: attributes.imageMarkerSize,
					tablet: attributes.imageMarkerSize_tablet,
					mobile: attributes.imageMarkerSize_mobile,
				},
				radius: {
					desktop: attributes.imageMarkerRadius,
					tablet: attributes.imageMarkerRadius_tablet,
					mobile: attributes.imageMarkerRadius_mobile,
				},
				shadow: attributes.imageMarkerShadow,
			},
			popup: {
				cardWidth: {
					desktop: attributes.popupCardWidth,
					tablet: attributes.popupCardWidth_tablet,
					mobile: attributes.popupCardWidth_mobile,
				},
				loaderColor1: attributes.popupLoaderColor1,
				loaderColor2: attributes.popupLoaderColor2,
			},
			searchBtn: {
				typography: attributes.searchBtnTypography,
				textColor: {
					desktop: attributes.searchBtnTextColor,
					tablet: attributes.searchBtnTextColor_tablet,
					mobile: attributes.searchBtnTextColor_mobile,
				},
				bgColor: {
					desktop: attributes.searchBtnBgColor,
					tablet: attributes.searchBtnBgColor_tablet,
					mobile: attributes.searchBtnBgColor_mobile,
				},
				iconColor: {
					desktop: attributes.searchBtnIconColor,
					tablet: attributes.searchBtnIconColor_tablet,
					mobile: attributes.searchBtnIconColor_mobile,
				},
				iconColorActive: {
					desktop: attributes.searchBtnIconColorActive,
					tablet: attributes.searchBtnIconColorActive_tablet,
					mobile: attributes.searchBtnIconColorActive_mobile,
				},
				radius: {
					desktop: attributes.searchBtnRadius,
					tablet: attributes.searchBtnRadius_tablet,
					mobile: attributes.searchBtnRadius_mobile,
				},
				checkmarkIcon: attributes.checkmarkIcon,
			},
			navBtn: {
				iconColor: attributes.navBtnIconColor,
				iconColorHover: attributes.navBtnIconColorHover,
				iconSize: {
					desktop: attributes.navBtnIconSize,
					tablet: attributes.navBtnIconSize_tablet,
					mobile: attributes.navBtnIconSize_mobile,
				},
				bgColor: attributes.navBtnBgColor,
				bgColorHover: attributes.navBtnBgColorHover,
				borderType: attributes.navBtnBorderType,
				borderWidth: attributes.navBtnBorderWidth,
				borderColor: attributes.navBtnBorderColor,
				borderColorHover: attributes.navBtnBorderColorHover,
				radius: {
					desktop: attributes.navBtnRadius,
					tablet: attributes.navBtnRadius_tablet,
					mobile: attributes.navBtnRadius_mobile,
				},
				shadow: attributes.navBtnShadow,
				size: {
					desktop: attributes.navBtnSize,
					tablet: attributes.navBtnSize_tablet,
					mobile: attributes.navBtnSize_mobile,
				},
			},
		},
	};
}

/**
 * Save function - outputs static HTML with vxconfig
 */
export default function save({ attributes }: MapSaveProps) {
	const blockProps = useBlockProps.save({
		className: 'voxel-fse-map ts-map-widget',
		'data-source': attributes.source,
		'data-search-form-id': attributes.searchFormId || undefined,
	});

	// Build vxconfig JSON
	const vxConfig = buildVxConfig(attributes);

	return (
		<div {...blockProps}>
			{/* vxconfig JSON for frontend hydration */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Placeholder replaced during hydration */}
			<div
				className="voxel-fse-block-placeholder"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#e8e8e8',
					minHeight: '200px',
					borderRadius: '4px',
				}}
			>
				{/* Map placeholder icon */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="48"
					height="48"
					fill="#999"
				>
					<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
				</svg>
			</div>
		</div>
	);
}
