/**
 * Field Icons Helper
 * Provides default icons for field components based on field type
 */
import type { FieldIcons } from '../types';
import { renderIcon, defaultIcons } from './iconRenderer';

/**
 * Get the appropriate icon for a field based on its usage
 */
export const getFieldIcon = (
	iconType: keyof typeof defaultIcons,
	icons?: FieldIcons,
	iconKey?: keyof FieldIcons
) => {
	// If custom icon provided, use it
	if (icons && iconKey && icons[iconKey]) {
		return renderIcon(icons[iconKey], defaultIcons[iconType]);
	}
	
	// Fall back to default icon
	return defaultIcons[iconType];
};

/**
 * Get upload icon specifically (larger size for file upload button)
 */
export const getUploadIcon = (
	icons?: FieldIcons
) => {
	return getFieldIcon('upload', icons, 'tsUploadIco');
};

