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
	// Add more NB blocks here as needed
];

/** Set of all target block names for quick lookup */
export const NB_TARGET_BLOCK_NAMES = new Set(
	nectarBlocksRegistry.map((config) => config.blockName)
);

/** Get config for a specific block name, or undefined if not targeted */
export function getNBBlockConfig(blockName: string): NBBlockConfig | undefined {
	return nectarBlocksRegistry.find((config) => config.blockName === blockName);
}
