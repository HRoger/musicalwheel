/**
 * Field Styles Utility
 *
 * Generates inline styles for field/filter wrappers based on config.
 * Matches Voxel's approach for width, alignment, and visibility.
 *
 * Used by both search-form (filters) and create-post (fields) blocks.
 *
 * @package VoxelFSE
 */

/**
 * Base config interface for field/filter configuration
 * Both FilterConfig and FieldConfig should extend or match this interface
 */
export interface FieldStyleConfig {
	/** Row visibility: 'show' | 'hide' */
	rowVisibility?: string;
	/** Width as percentage (0-100) */
	width?: number;
	/** Hide the field visually */
	hideFilter?: boolean;
	/** Content alignment */
	alignContent?: string;
	/** Hide the label */
	hideLabel?: boolean;
	/** Custom popup enabled */
	customPopupEnabled?: boolean;
	/** Popup minimum width */
	popupMinWidth?: number;
	/** Popup maximum width */
	popupMaxWidth?: number;
	/** Popup maximum height */
	popupMaxHeight?: number;
	/** Center popup position */
	popupCenterPosition?: boolean;
}

export interface FieldWrapperStyles {
	style: React.CSSProperties;
	className: string;
}

export interface PopupStyles {
	style: React.CSSProperties;
	className: string;
}

/**
 * Get wrapper styles and classes for a field/filter based on its config
 *
 * NOTE: Visibility is handled by shouldRenderFilter() in filterVisibility.ts
 * which evaluates visibilityRules + rowVisibility together. This function
 * should NOT check rowVisibility - it only handles layout/styling.
 */
export function getFieldWrapperStyles( config: FieldStyleConfig, baseClassName: string ): FieldWrapperStyles {
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
 * Alias for backward compatibility with search-form filters
 * @deprecated Use getFieldWrapperStyles instead
 */
export function getFilterWrapperStyles( config: FieldStyleConfig, baseClassName: string ): FieldWrapperStyles {
	return getFieldWrapperStyles( config, baseClassName );
}

/**
 * Get popup styles based on field/filter config
 */
export function getPopupStyles( config: FieldStyleConfig ): PopupStyles {
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
