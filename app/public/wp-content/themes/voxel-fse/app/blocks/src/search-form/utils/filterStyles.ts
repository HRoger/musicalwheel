/**
 * Filter Styles Utility
 *
 * Generates inline styles for filter wrappers based on config.
 * Matches Voxel's approach for width, alignment, and visibility.
 *
 * @package VoxelFSE
 */

import type { FilterConfig } from '../types';

export interface FilterWrapperStyles {
	style: React.CSSProperties;
	className: string;
}

export interface PopupStyles {
	style: React.CSSProperties;
	className: string;
}

/**
 * Get wrapper styles and classes for a filter based on its config
 *
 * NOTE: Visibility is handled by shouldRenderFilter() in filterVisibility.ts
 * which evaluates visibilityRules + rowVisibility together. This function
 * should NOT check rowVisibility - it only handles layout/styling.
 */
export function getFilterWrapperStyles( config: FilterConfig, baseClassName: string ): FilterWrapperStyles {
	const style: React.CSSProperties = {};
	const classes: string[] = [ baseClassName ];

	// Width (as percentage)
	if ( config.width && config.width > 0 ) {
		style.width = `${ config.width }%`;
		style.flexGrow = 0;
		style.flexShrink = 0;
	}

	// Hide filter visually (but keep functional)
	if ( config.hideFilter ) {
		classes.push( 'vx-hidden' );
	}

	// Content alignment
	if ( config.alignContent ) {
		style.justifyContent = config.alignContent;
	}

	// Hide label
	if ( config.hideLabel ) {
		classes.push( 'hide-label' );
	}

	return {
		style,
		className: classes.join( ' ' ),
	};
}

/**
 * Get popup styles based on filter config
 */
export function getPopupStyles( config: FilterConfig ): PopupStyles {
	const style: React.CSSProperties = {};
	const classes: string[] = [ 'ts-field-popup', 'triggers-blur' ];

	// Custom popup styles
	if ( config.customPopupEnabled ) {
		if ( config.popupMinWidth && config.popupMinWidth > 0 ) {
			style.minWidth = `${ config.popupMinWidth }px`;
		}

		if ( config.popupMaxWidth && config.popupMaxWidth > 0 ) {
			style.maxWidth = `${ config.popupMaxWidth }px`;
		}

		if ( config.popupMaxHeight && config.popupMaxHeight > 0 ) {
			style.maxHeight = `${ config.popupMaxHeight }px`;
		}

		// Center position
		if ( config.popupCenterPosition ) {
			classes.push( 'ts-popup-centered' );
		}
	}

	return {
		style,
		className: classes.join( ' ' ),
	};
}
