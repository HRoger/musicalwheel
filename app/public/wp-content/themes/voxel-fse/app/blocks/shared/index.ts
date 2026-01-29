/**
 * Shared Components - Main Barrel Export
 *
 * Central export point for all shared components used by both
 * search-form and create-post blocks. Mirrors Voxel's commons.js pattern.
 *
 * Usage:
 * ```typescript
 * import { FieldPopup, DatePicker, VoxelIcons } from '../../shared';
 * ```
 *
 * @package VoxelFSE
 */

// Popup components
export {
	FieldPopup,
	FormPopup,
	DatePicker,
} from './popup-kit';

export type {
	FieldPopupProps,
	FormPopupProps,
	DatePickerProps,
} from './popup-kit';

// Utility functions and icons
export {
	VoxelIcons,
	getFilterIcon,
	renderIcon,
	hasIcon,
	getFieldWrapperStyles,
	getFilterWrapperStyles,
	getPopupStyles,
} from './utils';

export type {
	FieldStyleConfig,
	FieldWrapperStyles,
	PopupStyles,
} from './utils';

// Media components
export { default as MediaPopup } from './MediaPopup';

// Alert components
export { VxAlert } from './VxAlert';
export type { VxAlertProps, VxAlertAction, AlertType } from './VxAlert';
