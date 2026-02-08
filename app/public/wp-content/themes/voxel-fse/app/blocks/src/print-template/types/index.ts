/**
 * Print Template Block - Type Definitions
 *
 * Synced with block.json attributes.
 *
 * @package VoxelFSE
 */

/**
 * Block attributes interface
 * Matches block.json and Voxel's print-template widget
 */
export interface PrintTemplateAttributes {
	blockId: string;
	templateId: string; // Can be numeric ID or @tags()...@endtags() dynamic tag
	contentTabOpenPanel: string;
	customClasses: string;
	// VoxelTab attributes for visibility and loop features
	visibilityBehavior: 'show' | 'hide';
	visibilityRules: object[];
	loopEnabled: boolean;
	loopSource: string;
	loopProperty: string;
	loopLimit: string;
	loopOffset: string;
}

/**
 * vxconfig structure for frontend hydration
 * Minimal config needed for client-side rendering
 */
export interface PrintTemplateVxConfig {
	templateId: string;
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
