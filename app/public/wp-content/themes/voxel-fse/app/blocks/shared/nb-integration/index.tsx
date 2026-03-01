/**
 * NectarBlocks Integration Entry Point
 *
 * Registers editor.BlockEdit filters that inject Voxel features into NectarBlocks:
 *
 * 1. Parent blocks (23): VoxelTab (4th tab) + EnableTag buttons via NBDynamicTagInjector
 * 2. Child blocks (5): RowSettings PanelBody (loop + visibility) + Advanced panel controls
 *
 * Auto-registers on import (same pattern as editorWrapperFilters.tsx).
 *
 * @package VoxelFSE
 */

import { InspectorControls, BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import NBDynamicTagInjector from './NBDynamicTagInjector';
import {
	getNBBlockConfig,
	NB_TARGET_BLOCK_NAMES,
	NB_ROW_SETTINGS_BLOCK_NAMES,
	NB_TOOLBAR_TAG_BLOCK_NAMES,
	NB_CHILD_TITLE_BLOCK_NAMES,
	NB_DYNAMIC_TAG_FIELDS,
	NB_ADVANCED_PANEL_BLOCKS,
} from './nectarBlocksConfig';
import { voxelTabAttributes } from '@shared/controls/VoxelTab';
import RowSettings from '@shared/controls/RowSettings';
import DynamicTagTextControl from '@shared/controls/DynamicTagTextControl';
import EnableTagsToolbarButton from '@shared/controls/EnableTagsToolbarButton';
import ColorPickerControl from '@shared/controls/ColorPickerControl';
import ResponsiveRangeControlWithDropdown from '@shared/controls/ResponsiveRangeControlWithDropdown';
import ResponsiveRangeControl from '@shared/controls/ResponsiveRangeControl';

/**
 * Typed wrapper for InspectorControls with group="advanced".
 * WP 6.x supports the `group` prop at runtime but @types/wordpress__block-editor
 * doesn't include it in its type definitions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InspectorAdvancedControls = (props: { children: React.ReactNode }) =>
	<InspectorControls {...({ group: 'advanced' } as any)} {...props} />;

let isRegistered = false;

/** Row settings attributes injected into child blocks */
const rowSettingsAttributes = {
	loopEnabled: { type: 'boolean' as const, default: false },
	loopSource: { type: 'string' as const, default: '' },
	loopProperty: { type: 'string' as const, default: '' },
	loopLimit: { type: 'string' as const, default: '' },
	loopOffset: { type: 'string' as const, default: '' },
	visibilityBehavior: { type: 'string' as const, default: 'show' },
	visibilityRules: { type: 'array' as const, default: [] },
	voxelDynamicTitle: { type: 'string' as const, default: '' },
	voxelDynamicCssId: { type: 'string' as const, default: '' },
	voxelIconSize: { type: 'number' as const },
	voxelIconSize_tablet: { type: 'number' as const },
	voxelIconSize_mobile: { type: 'number' as const },
	voxelIconSizeUnit: { type: 'string' as const, default: 'px' },
	voxelIconColor: { type: 'string' as const, default: '' },
};

/** NB container blocks that get editor preview width (matches Voxel container-controller.php) */
const NB_EDITOR_PREVIEW_WIDTH_BLOCKS = new Set([
	'nectar-blocks/row',
	'nectar-blocks/flex-box',
]);

export function registerNBDynamicTagIntegration(): void {
	if (isRegistered) return;

	const wpHooks = (window as any).wp?.hooks;
	const wpCompose = (window as any).wp?.compose;

	if (!wpHooks || !wpCompose) {
		return;
	}

	const { addFilter } = wpHooks;
	const { createHigherOrderComponent } = wpCompose;

	// ========================================================================
	// ATTRIBUTE INJECTION (client-side, since NB registers blocks via JS)
	// ========================================================================

	addFilter(
		'blocks.registerBlockType',
		'voxel-fse/nb-inject-attributes',
		(settings: Record<string, unknown>, name: string) => {
			const attrs = (settings['attributes'] ?? {}) as Record<string, unknown>;

			const isParent = NB_TARGET_BLOCK_NAMES.has(name);
			const isChild = NB_ROW_SETTINGS_BLOCK_NAMES.has(name);

			// Parent blocks: VoxelTab attributes + voxelDynamicTags
			// Blocks can be in BOTH sets (e.g. column) — merge both attribute groups
			if (isParent || isChild) {
				const mergedAttrs: Record<string, unknown> = {
					...attrs,
					voxelDynamicTags: {
						type: 'object' as const,
						default: {},
					},
				};

				// Parent: VoxelTab + EnableTags
				if (isParent) {
					Object.assign(mergedAttrs, voxelTabAttributes);

					// Toolbar blocks also get voxelDynamicContent
					if (NB_TOOLBAR_TAG_BLOCK_NAMES.has(name)) {
						mergedAttrs['voxelDynamicContent'] = {
							type: 'string' as const,
							default: '',
						};
					}

					// Advanced panel blocks get their extra attributes
					const advFields = NB_ADVANCED_PANEL_BLOCKS[name];
					if (advFields) {
						let needsIconAttrs = false;
						for (const field of advFields) {
							if (field.controlType === 'range' && field.attr === 'voxelIconSize') {
								needsIconAttrs = true;
								continue;
							}
							if (field.controlType === 'color' && field.attr === 'voxelIconColor') {
								needsIconAttrs = true;
								continue;
							}
							if (!(field.attr in mergedAttrs)) {
								mergedAttrs[field.attr] = {
									type: 'string' as const,
									default: '',
								};
							}
						}
						if (needsIconAttrs) {
							mergedAttrs['voxelIconSize'] = { type: 'number' as const };
							mergedAttrs['voxelIconSize_tablet'] = { type: 'number' as const };
							mergedAttrs['voxelIconSize_mobile'] = { type: 'number' as const };
							mergedAttrs['voxelIconSizeUnit'] = { type: 'string' as const, default: 'px' };
							mergedAttrs['voxelIconColor'] = { type: 'string' as const, default: '' };
						}
					}
				}

				// Child: RowSettings attributes
				if (isChild) {
					Object.assign(mergedAttrs, rowSettingsAttributes);
				}

				// Container blocks: editor preview width
				if (NB_EDITOR_PREVIEW_WIDTH_BLOCKS.has(name)) {
					mergedAttrs['editorPreviewWidth'] = { type: 'number' as const };
				}

				return { ...settings, attributes: mergedAttrs };
			}

			return settings;
		}
	);

	// ========================================================================
	// PARENT BLOCK HOC: VoxelTab (4th tab) + EnableTag buttons
	// ========================================================================

	const withNBDynamicTags = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, clientId, attributes, setAttributes } = props;

				if (!NB_TARGET_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}

				const blockConfig = getNBBlockConfig(name);
				if (!blockConfig) {
					return <BlockEdit {...props} />;
				}

				return (
					<>
						<BlockEdit {...props} />
						<NBDynamicTagInjector
							blockConfig={blockConfig}
							clientId={clientId}
							attributes={attributes}
							setAttributes={setAttributes}
						/>
					</>
				);
			};
		},
		'withNBDynamicTags'
	);

	addFilter('editor.BlockEdit', 'voxel-fse/nb-dynamic-tags', withNBDynamicTags);

	// ========================================================================
	// PARENT BLOCK ADVANCED PANEL CONTROLS (e.g., button "Edit label as HTML")
	// ========================================================================

	const withNBAdvancedPanelControls = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, attributes, setAttributes } = props;

				const advFields = NB_ADVANCED_PANEL_BLOCKS[name];
				if (!advFields || advFields.length === 0) {
					return <BlockEdit {...props} />;
				}

				return (
					<>
						<BlockEdit {...props} />
						<InspectorAdvancedControls>
							{advFields.map(({ attr, label, controlType }) => {
								if (controlType === 'range') {
									return (
										<ResponsiveRangeControlWithDropdown
											key={attr}
											label={__(label, 'voxel-fse')}
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={attr}
											min={0}
											max={200}
											step={1}
											availableUnits={['px', 'em', 'rem', '%', 'vw']}
											unitAttributeName={`${attr}Unit`}
										/>
									);
								}
								if (controlType === 'color') {
									return (
										<ColorPickerControl
											key={attr}
											label={__(label, 'voxel-fse')}
											value={(attributes[attr] as string) || ''}
											onChange={(color: string) =>
												setAttributes({ [attr]: color })
											}
										/>
									);
								}
								return (
									<DynamicTagTextControl
										key={attr}
										label={label}
										value={(attributes[attr] as string) || ''}
										onChange={(val: string) =>
											setAttributes({ [attr]: val })
										}
									/>
								);
							})}
						</InspectorAdvancedControls>
					</>
				);
			};
		},
		'withNBAdvancedPanelControls'
	);

	addFilter('editor.BlockEdit', 'voxel-fse/nb-advanced-panel', withNBAdvancedPanelControls);

	// ========================================================================
	// CHILD BLOCK HOC: RowSettings PanelBody + Advanced panel controls
	// ========================================================================

	const withNBRowSettings = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, clientId, attributes, setAttributes } = props;

				if (!NB_ROW_SETTINGS_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}

				const dynamicFields = NB_DYNAMIC_TAG_FIELDS[name] ?? [];
				const hasToolbarTag = NB_CHILD_TITLE_BLOCK_NAMES.has(name);
				const rawTitle = (attributes['voxelDynamicTitle'] as string) ?? '';
				// Only pass @tags() expressions to the toolbar button — plain text
				// is just the bi-directional sync value and shouldn't activate it.
				const tagValue = rawTitle.includes('@tags(') ? rawTitle : '';

				// Read the title for initialContent:
				// - accordion-section / icon-list-item: native `title` attribute
				// - tab-section: parent tabs block's `tabItems[idx].label`
				const isTabSection = name === 'nectar-blocks/tab-section';
				const titleInitialContent = useSelect((select: any) => {
					if (!isTabSection) {
						return (attributes['title'] as string) ?? '';
					}
					const store = select('core/block-editor');
					const parents = store.getBlockParents(clientId) as string[];
					for (const parentId of parents) {
						const parentBlock = store.getBlock(parentId);
						if (parentBlock?.name === 'nectar-blocks/tabs') {
							const idx = (parentBlock.innerBlocks || []).findIndex(
								(ib: { clientId: string }) => ib.clientId === clientId
							);
							if (idx >= 0) {
								const tabItems = (parentBlock.attributes as Record<string, unknown>)['tabItems'] as Array<{ label?: string }> | undefined;
								return tabItems?.[idx]?.label ?? '';
							}
						}
					}
					return '';
				}, [clientId, isTabSection, attributes['title']]);

				return (
					<>
						<BlockEdit {...props} />
						<NBDynamicTagInjector
							blockConfig={{ blockName: name, fields: [] }}
							clientId={clientId}
							attributes={attributes}
							setAttributes={setAttributes}
							bodyObserverOnly
						/>
						{hasToolbarTag && (
							<BlockControls group="other">
								<ToolbarGroup>
									<EnableTagsToolbarButton
										value={tagValue}
										onChange={(newValue: string) =>
											setAttributes({ voxelDynamicTitle: newValue })
										}
										initialContent={titleInitialContent}
									/>
								</ToolbarGroup>
							</BlockControls>
						)}
						<InspectorControls>
							<RowSettings
								attributes={attributes}
								setAttributes={setAttributes}
								blockName={name}
							/>
						</InspectorControls>
						{dynamicFields.length > 0 && (
							<InspectorAdvancedControls>
								{dynamicFields.map(({ attr, label }) => (
									<DynamicTagTextControl
										key={attr}
										label={attr === 'voxelDynamicTitle' ? __('Edit Title as HTML', 'voxel-fse') : label}
										value={(attributes[attr] as string) || ''}
										onChange={(val: string) =>
											setAttributes({ [attr]: val })
										}
									/>
								))}
							</InspectorAdvancedControls>
						)}
					</>
				);
			};
		},
		'withNBRowSettings'
	);

	addFilter('editor.BlockEdit', 'voxel-fse/nb-row-settings', withNBRowSettings);

	// ========================================================================
	// EDITOR PREVIEW WIDTH: RangeControl in Advanced panel for Row/Flex-Box
	// Matches Voxel container-controller.php "Editor preview width" section
	// ========================================================================

	const withNBEditorPreviewWidth = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, attributes, setAttributes } = props;

				if (!NB_EDITOR_PREVIEW_WIDTH_BLOCKS.has(name)) {
					return <BlockEdit {...props} />;
				}

				return (
					<>
						<BlockEdit {...props} />
						<InspectorControls>
							<PanelBody
								title={__('Editor preview width', 'voxel-fse')}
								initialOpen={false}
							>
								<ResponsiveRangeControl
									label={__('Width', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="editorPreviewWidth"
									min={0}
									max={1200}
									step={1}
									showHeader={false}
								/>
								<p style={{ marginTop: '4px', color: '#757575', fontSize: '12px' }}>
									{__('Change the width of the canvas, useful when designing preview cards', 'voxel-fse')}
								</p>
							</PanelBody>
						</InspectorControls>
					</>
				);
			};
		},
		'withNBEditorPreviewWidth'
	);

	addFilter('editor.BlockEdit', 'voxel-fse/nb-editor-preview-width', withNBEditorPreviewWidth);

	// ========================================================================
	// EDITOR PREVIEW WIDTH: Apply max-width to block wrapper (editor only)
	// ========================================================================

	const withNBEditorPreviewWidthStyle = createHigherOrderComponent(
		(BlockListBlock: any) => {
			return (props: any) => {
				const { name, attributes, wrapperProps } = props;

				if (!NB_EDITOR_PREVIEW_WIDTH_BLOCKS.has(name)) {
					return <BlockListBlock {...props} />;
				}

				const previewWidth = attributes?.['editorPreviewWidth'] as number | null | undefined;

				const newWrapperProps = {
					...wrapperProps,
					style: {
						...(wrapperProps?.style || {}),
						maxWidth: previewWidth ? `${previewWidth}px` : undefined,
					},
				};

				return <BlockListBlock {...props} wrapperProps={newWrapperProps} />;
			};
		},
		'withNBEditorPreviewWidthStyle'
	);

	addFilter('editor.BlockListBlock', 'voxel-fse/nb-editor-preview-width-style', withNBEditorPreviewWidthStyle);

	isRegistered = true;
}

// Auto-register when this module is imported
registerNBDynamicTagIntegration();
