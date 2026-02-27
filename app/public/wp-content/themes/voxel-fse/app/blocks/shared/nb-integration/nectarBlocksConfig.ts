/**
 * NectarBlocks Integration Configuration
 *
 * Config-driven registry mapping NB block names to their targetable fields.
 * Each field defines how to locate the control in the DOM and what type of
 * dynamic tag value it accepts.
 *
 * Field detection strategy: match `.nectar-control-row__label` elements
 * by their text content (labelText). This is the most reliable approach
 * since NB uses no data-attributes on controls.
 *
 * @package VoxelFSE
 */

export interface NBFieldTarget {
	/** Unique field key stored in voxelDynamicTags attribute object */
	fieldKey: string;
	/** Human-readable label for DynamicTagBuilder modal */
	label: string;
	/** Exact label text content in NB's inspector DOM (for matching) */
	labelText: string;
	/** Which NB inspector tab this field lives in: 'layout' | 'style' | 'motion' */
	tab: 'layout' | 'style' | 'motion';
	/** Type of field — determines how resolved value replaces content in HTML */
	type: 'text' | 'url' | 'image' | 'number' | 'css-class' | 'textarea';
	/**
	 * Optional: scope match to a child row nested under a parent control with this label.
	 */
	parentLabelText?: string;
	/**
	 * Placement of the EnableTag button:
	 * - 'inline' (default): appended inside the label element
	 * - 'corner': absolutely positioned in the top-right corner of the .nectar-control-row__component
	 * - 'panel-prepend': prepended at the top of the parent panel body (for standalone controls like gallery)
	 */
	placement?: 'inline' | 'corner';
}

export interface NBBlockConfig {
	/** NB block name e.g. 'nectar-blocks/image' */
	blockName: string;
	/** Targetable fields within this block's inspector */
	fields: NBFieldTarget[];
}

/**
 * Registry of NB blocks and their injectable fields.
 * Populated from Phase 0 browser discovery (2026-02-20).
 *
 * DOM structure (from discovery):
 *   .nectar-control-row
 *     .nectar-control-row__label
 *       .nectar-control-row__reset-wrap
 *         "Label Text" (or .nectar__dynamic-data-selector__inline wrapper)
 *     .nectar-control-row__component
 *       input/textarea/combobox
 */
export const nectarBlocksRegistry: NBBlockConfig[] = [
	{
		blockName: 'nectar-blocks/image',
		fields: [
			{
				fieldKey: 'imageSource',
				label: 'Image Source',
				labelText: 'Image',
				tab: 'layout',
				type: 'image',
				placement: 'corner',
			},
			{
				fieldKey: 'title',
				label: 'Title',
				labelText: 'Title',
				tab: 'layout',
				type: 'text',
			},
			{
				fieldKey: 'altText',
				label: 'Alt Text',
				labelText: 'Alt Text',
				tab: 'layout',
				type: 'text',
			},
			{
				fieldKey: 'linkUrl',
				label: 'Link URL',
				labelText: 'URL',
				tab: 'layout',
				type: 'url',
			},
			{
				fieldKey: 'zIndex',
				label: 'Z-Index',
				labelText: 'Value',
				tab: 'style',
				type: 'number',
				parentLabelText: 'Z-Index',
			},
			],
	},
	// --- Parent blocks (22 additional — VoxelTab as 4th tab) ---
	// All parent blocks get z-index field (Style tab, under Z-Index control).
	// labelText: 'Value' — NB renders the z-index input with label "Value" nested
	// inside a parent row labelled "Z-Index". parentLabelText scopes the match.
	{ blockName: 'nectar-blocks/accordion', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/button', fields: [
		{ fieldKey: 'linkUrl', label: 'Link URL', labelText: 'URL', tab: 'layout', type: 'url' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/carousel', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/divider', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/flex-box', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/icon', fields: [
		{ fieldKey: 'linkUrl', label: 'Link URL', labelText: 'URL', tab: 'layout', type: 'url' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/icon-list', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/image-gallery', fields: [
		// Gallery images — injected into NB's "Edit Photos" dialog via body observer
		{ fieldKey: 'galleryImages', label: 'Gallery Images', labelText: '', tab: 'layout', type: 'image' },
		// Style tab — Background section
		{ fieldKey: 'backgroundImage', label: 'Background Image', labelText: 'Image', tab: 'style', type: 'image', parentLabelText: 'Background', placement: 'corner' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/image-grid', fields: [
		{ fieldKey: 'linkUrl', label: 'Link URL', labelText: 'URL', tab: 'layout', type: 'url' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/milestone', fields: [
		{ fieldKey: 'linkUrl', label: 'Link URL', labelText: 'URL', tab: 'layout', type: 'url' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/post-content', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/post-grid', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/row', fields: [
		{ fieldKey: 'backgroundImage', label: 'Background Image', labelText: 'Image', tab: 'style', type: 'image', parentLabelText: 'Background', placement: 'corner' },
		{ fieldKey: 'backgroundVideo', label: 'Background Video', labelText: 'Video', tab: 'style', type: 'image', parentLabelText: 'Background', placement: 'corner' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/scrolling-marquee', fields: [
		{ fieldKey: 'linkUrl', label: 'Link URL', labelText: 'URL', tab: 'layout', type: 'url' },
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	// star-rating: z-index + rating value (labelText TBD — verify via browser)
	{ blockName: 'nectar-blocks/star-rating', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
		{ fieldKey: 'rating', label: 'Rating', labelText: 'Rating', tab: 'layout', type: 'number', placement: 'corner' },
	] },
	{ blockName: 'nectar-blocks/tabs', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/taxonomy-grid', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/taxonomy-terms', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/testimonial', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/column', fields: [
		{ fieldKey: 'backgroundImage', label: 'Background Image', labelText: 'Image', tab: 'style', type: 'image', parentLabelText: 'Background', placement: 'corner' },
		{ fieldKey: 'backgroundVideo', label: 'Background Video', labelText: 'Video', tab: 'style', type: 'image', parentLabelText: 'Background', placement: 'corner' },
	] },
	{ blockName: 'nectar-blocks/text', fields: [
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/video-lightbox', fields: [
		// General Settings — External mode (labelText unique, no parent needed)
		{ fieldKey: 'videoUrl', label: 'Video URL', labelText: 'Video URL', tab: 'layout', type: 'url' },
		// General Settings — Local mode (scoped to General Settings to avoid Preview > Video collision)
		{ fieldKey: 'videoLocal', label: 'Video (Local)', labelText: 'Video', tab: 'layout', type: 'image', parentLabelText: 'General Settings', placement: 'corner' },
		// Preview section (toggle-panel — matchesParentSection handles this)
		{ fieldKey: 'previewImage', label: 'Preview Image', labelText: 'Image', tab: 'layout', type: 'image', parentLabelText: 'Preview', placement: 'corner' },
		{ fieldKey: 'previewVideo', label: 'Preview Video', labelText: 'Video', tab: 'layout', type: 'image', parentLabelText: 'Preview', placement: 'corner' },
		// Style tab
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
	{ blockName: 'nectar-blocks/video-player', fields: [
		// General Settings
		{ fieldKey: 'video', label: 'Video', labelText: 'Video', tab: 'layout', type: 'image', placement: 'corner' },
		{ fieldKey: 'previewImage', label: 'Preview Image', labelText: 'Preview Image', tab: 'layout', type: 'image', placement: 'corner' },
		// Style tab
		{ fieldKey: 'zIndex', label: 'Z-Index', labelText: 'Value', tab: 'style', type: 'number', parentLabelText: 'Z-Index' },
	] },
];

/** Set of all target block names for quick lookup (parent blocks only — get VoxelTab) */
export const NB_TARGET_BLOCK_NAMES = new Set(
	nectarBlocksRegistry.map((config) => config.blockName)
);

/** Get config for a specific block name, or undefined if not targeted */
export function getNBBlockConfig(blockName: string): NBBlockConfig | undefined {
	return nectarBlocksRegistry.find((config) => config.blockName === blockName);
}

// ============================================================================
// CHILD BLOCK CONFIG (RowSettings PanelBody, NOT VoxelTab)
// ============================================================================

/** NB child/inner blocks that get RowSettings PanelBody (loop + visibility) */
export const NB_ROW_SETTINGS_BLOCKS = [
	'nectar-blocks/tab-section',
	'nectar-blocks/accordion-section',
	'nectar-blocks/column',
	'nectar-blocks/icon-list-item',
	'nectar-blocks/carousel-item',
] as const;

/** Set of child block names for quick lookup */
export const NB_ROW_SETTINGS_BLOCK_NAMES = new Set<string>(NB_ROW_SETTINGS_BLOCKS);

/** Dynamic tag fields per child block type (Title, CSS ID) */
export const NB_DYNAMIC_TAG_FIELDS: Record<string, { attr: string; label: string }[]> = {
	'nectar-blocks/tab-section': [
		{ attr: 'voxelDynamicTitle', label: 'Title' },
		{ attr: 'voxelDynamicCssId', label: 'CSS ID' },
	],
	'nectar-blocks/accordion-section': [
		{ attr: 'voxelDynamicTitle', label: 'Title' },
		{ attr: 'voxelDynamicCssId', label: 'CSS ID' },
	],
	'nectar-blocks/column': [
		{ attr: 'voxelDynamicCssId', label: 'CSS ID' },
	],
	'nectar-blocks/icon-list-item': [
		{ attr: 'voxelDynamicTitle', label: 'Title' },
	],
	'nectar-blocks/carousel-item': [
		{ attr: 'voxelDynamicCssId', label: 'CSS ID' },
	],
};

// ============================================================================
// TOOLBAR TAG BLOCKS (EnableTag in block toolbar for text content)
// ============================================================================

/** NB blocks that get the EnableTag toolbar button for dynamic text content */
export const NB_TOOLBAR_TAG_BLOCKS = [
	'nectar-blocks/text',
	'nectar-blocks/button',
] as const;

/** Set of toolbar block names for quick lookup */
export const NB_TOOLBAR_TAG_BLOCK_NAMES = new Set<string>(NB_TOOLBAR_TAG_BLOCKS);

// ============================================================================
// CHILD TITLE TOOLBAR BLOCKS (EnableTag in toolbar for title-bearing children)
// ============================================================================

/** Child blocks that get toolbar EnableTag button for their title/label */
export const NB_CHILD_TITLE_BLOCKS = [
	'nectar-blocks/accordion-section',
	'nectar-blocks/tab-section',
	'nectar-blocks/icon-list-item',
] as const;

/** Set of child title block names for quick lookup */
export const NB_CHILD_TITLE_BLOCK_NAMES = new Set<string>(NB_CHILD_TITLE_BLOCKS);

// ============================================================================
// ADVANCED PANEL CONTROLS (parent blocks that need extra controls in WP Advanced)
// ============================================================================

/**
 * Parent blocks that get additional controls injected into the WP Advanced
 * accordion panel. Each entry maps a block name to its advanced panel fields.
 *
 * controlType: 'text' (default) = DynamicTagTextControl, 'color' = ColorPickerControl
 */
export const NB_ADVANCED_PANEL_BLOCKS: Record<string, { attr: string; label: string; controlType?: 'text' | 'color' | 'range' }[]> = {
	'nectar-blocks/button': [
		{ attr: 'voxelDynamicContent', label: 'Edit Label as HTML' },
		{ attr: 'voxelIconSize', label: 'Icon Size', controlType: 'range' },
		{ attr: 'voxelIconColor', label: 'Icon Color', controlType: 'color' },
	],
	'nectar-blocks/icon': [
		{ attr: 'voxelIconColor', label: 'Icon Color', controlType: 'color' },
	],
};
