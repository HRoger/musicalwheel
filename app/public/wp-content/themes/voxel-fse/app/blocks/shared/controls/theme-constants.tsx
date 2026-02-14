/**
 * WordPress Theme Constants
 *
 * Standard WordPress admin color palette and common control styles.
 * Use these constants across all custom controls for consistency.
 *
 * @package VoxelFSE
 */

import React from 'react';

/**
 * WordPress Admin Color Palette
 * Based on WordPress default admin color scheme
 */
export const WP_COLORS = {
	// Primary colors - uses CSS variable for theme-ability (NectarBlocks override)
	primary: 'var(--vxfse-accent-color, #3858e9)',
	primaryHover: 'var(--vxfse-accent-color-darker, #2145e6)',
	primaryLight: '#f0f6fc',   // Light background

	// Secondary/inactive colors
	secondary: '#f0f0f1',      // Inactive button background
	secondaryHover: '#dcdcde', // Inactive hover
	border: '#dcdcde',         // Border color

	// Text colors
	text: '#1e1e1e',           // Primary text
	textLight: '#757575',      // Secondary text
	textInverse: '#ffffff',    // White text (on primary)

	// Status colors
	success: '#00a32a',
	warning: '#dba617',
	error: '#d63638',
	info: '#72aee6',
} as const;

/**
 * Common button styles for active/inactive states
 * Used in ButtonGroup controls, ChooseControl, etc.
 */
export const BUTTON_STYLES = {
	active: {
		backgroundColor: WP_COLORS.primary,
		color: WP_COLORS.textInverse,
		borderColor: WP_COLORS.primary,
	},
	inactive: {
		backgroundColor: WP_COLORS.secondary,
		color: WP_COLORS.text,
		borderColor: WP_COLORS.border,
	},
} as const;

/**
 * Reset button icon component using Dashicons
 */
export const ResetIcon = () => (
	<span
		className="dashicons dashicons-image-rotate"
		style={{ fontSize: '16px', width: '16px', height: '16px' }}
	/>
);

/**
 * Small reset button icon (14px) for compact controls
 */
export const ResetIconSmall = () => (
	<span
		className="dashicons dashicons-image-rotate"
		style={{ fontSize: '14px', width: '14px', height: '14px' }}
	/>
);

/**
 * Helper function to get button style based on active state
 */
export function getButtonStyle(isActive: boolean) {
	return isActive ? BUTTON_STYLES.active : BUTTON_STYLES.inactive;
}

/**
 * Helper function to merge button styles with custom overrides
 */
export function mergeButtonStyle(
	isActive: boolean,
	customStyles: React.CSSProperties = {}
): React.CSSProperties {
	const baseStyle = getButtonStyle(isActive);
	return {
		...baseStyle,
		transition: 'all 0.2s ease',
		...customStyles,
	};
}
