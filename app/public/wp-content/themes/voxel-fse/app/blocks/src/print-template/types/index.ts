/**
 * Print Template Block - Type Definitions
 *
 * @package VoxelFSE
 */

/**
 * Block attributes interface
 * Matches Voxel's print-template widget with single templateId control
 */
export interface PrintTemplateAttributes {
	blockId: string;
	templateId: string; // Can be numeric ID or @tags()...@endtags() dynamic tag
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;
}

/**
 * vxconfig structure for frontend hydration
 */
export interface PrintTemplateVxConfig {
	templateId: string;
	hideDesktop: boolean;
	hideTablet: boolean;
	hideMobile: boolean;
	customClasses: string;
}

/**
 * Props for the shared PrintTemplateComponent
 */
export interface PrintTemplateComponentProps {
	attributes: PrintTemplateAttributes;
	templateContent: string | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
}
