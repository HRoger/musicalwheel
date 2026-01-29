/**
 * TypeScript interfaces for Countdown block
 */
import type { CombinedStyleAttributes } from '../../../shared/utils';
import type { TypographyValue } from '../../../shared/controls/TypographyPopup';

/**
 * Block attributes stored in WordPress database
 * Extends CombinedStyleAttributes for AdvancedTab + VoxelTab support
 */
export interface CountdownAttributes extends CombinedStyleAttributes {
	// Block ID for unique selector
	blockId: string;
	// Content attributes
	dueDate: string; // ISO 8601 datetime string
	countdownEndedText: string;
	hideSeconds: boolean;
	hideMinutes: boolean;
	hideHours: boolean;
	hideDays: boolean;

	// Style attributes
	disableAnimation: boolean;
	horizontalOrientation: boolean;

	// Responsive item spacing (gap between countdown items)
	itemSpacing: number;
	itemSpacing_tablet: number;
	itemSpacing_mobile: number;
	itemSpacingUnit: string;

	// Responsive content spacing (gap within each item)
	contentSpacing: number;
	contentSpacing_tablet: number;
	contentSpacing_mobile: number;
	contentSpacingUnit: string;

	// Colors
	textColor?: string;
	numberColor?: string;
	endedColor?: string;

	// Typography (using TypographyValue objects from shared control)
	textTypography: TypographyValue;
	textTypographyFontFamily?: string;
	numberTypography: TypographyValue;
	numberTypographyFontFamily?: string;
	endedTypography: TypographyValue;
	endedTypographyFontFamily?: string;

	// Accordion panel state
	styleTabOpenPanel?: string;
}

/**
 * vxconfig JSON structure (stored in script tag)
 */
export interface CountdownConfig {
	dueDate: string;
	countdownEndedText: string;
	hideSeconds: boolean;
	hideMinutes: boolean;
	hideHours: boolean;
	hideDays: boolean;
	disableAnimation: boolean;
	horizontalOrientation: boolean;
	itemSpacing: number;
	itemSpacing_tablet: number;
	itemSpacing_mobile: number;
	itemSpacingUnit: string;
	contentSpacing: number;
	contentSpacing_tablet: number;
	contentSpacing_mobile: number;
	contentSpacingUnit: string;
	textColor?: string;
	numberColor?: string;
	endedColor?: string;
	textTypography: TypographyValue;
	numberTypography: TypographyValue;
	endedTypography: TypographyValue;
}

/**
 * Countdown timer state
 */
export interface CountdownState {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
}

/**
 * Props for shared CountdownComponent
 */
export interface CountdownComponentProps {
	config: CountdownConfig;
	isEditor?: boolean;
}
