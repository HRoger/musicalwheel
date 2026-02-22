/**
 * NectarBlocks Integration Entry Point
 *
 * Registers editor.BlockEdit filters that inject Voxel features into NectarBlocks:
 *
 * 1. Parent blocks (23): VoxelTab (4th tab) + EnableTag buttons via NBDynamicTagInjector
 * 2. Child blocks (5): RowSettings PanelBody (loop + visibility) + Dynamic Tags panel
 *
 * Auto-registers on import (same pattern as editorWrapperFilters.tsx).
 *
 * @package VoxelFSE
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import NBDynamicTagInjector from './NBDynamicTagInjector';
import {
	getNBBlockConfig,
	NB_TARGET_BLOCK_NAMES,
	NB_ROW_SETTINGS_BLOCK_NAMES,
	NB_TOOLBAR_TAG_BLOCK_NAMES,
	NB_DYNAMIC_TAG_FIELDS,
} from './nectarBlocksConfig';
import { voxelTabAttributes } from '@shared/controls/VoxelTab';
import RowSettings from '@shared/controls/RowSettings';
import DynamicTagTextControl from '@shared/controls/DynamicTagTextControl';

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
};

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

			// Parent blocks: VoxelTab attributes + voxelDynamicTags
			if (NB_TARGET_BLOCK_NAMES.has(name)) {
				const parentAttrs: Record<string, unknown> = {
					...attrs,
					voxelDynamicTags: {
						type: 'object' as const,
						default: {},
					},
					...voxelTabAttributes,
				};

				// Toolbar blocks also get voxelDynamicContent
				if (NB_TOOLBAR_TAG_BLOCK_NAMES.has(name)) {
					parentAttrs['voxelDynamicContent'] = {
						type: 'string' as const,
						default: '',
					};
				}

				return { ...settings, attributes: parentAttrs };
			}

			// Child blocks: RowSettings attributes + dynamic tag fields
			if (NB_ROW_SETTINGS_BLOCK_NAMES.has(name)) {
				return {
					...settings,
					attributes: {
						...attrs,
						...rowSettingsAttributes,
					},
				};
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
	// CHILD BLOCK HOC: RowSettings PanelBody + Dynamic Tags panel
	// ========================================================================

	const withNBRowSettings = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, attributes, setAttributes } = props;

				if (!NB_ROW_SETTINGS_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}

				const dynamicFields = NB_DYNAMIC_TAG_FIELDS[name] ?? [];

				return (
					<>
						<BlockEdit {...props} />
						<InspectorControls>
							<RowSettings
								attributes={attributes}
								setAttributes={setAttributes}
							/>
							{dynamicFields.length > 0 && (
								<PanelBody
									title={__('Voxel Dynamic Tags', 'voxel-fse')}
									initialOpen={false}
								>
									{dynamicFields.map(({ attr, label }) => (
										<DynamicTagTextControl
											key={attr}
											label={label}
											value={attributes[attr] || ''}
											onChange={(val: string) =>
												setAttributes({ [attr]: val })
											}
										/>
									))}
								</PanelBody>
							)}
						</InspectorControls>
					</>
				);
			};
		},
		'withNBRowSettings'
	);

	addFilter('editor.BlockEdit', 'voxel-fse/nb-row-settings', withNBRowSettings);

	isRegistered = true;
}

// Auto-register when this module is imported
registerNBDynamicTagIntegration();
