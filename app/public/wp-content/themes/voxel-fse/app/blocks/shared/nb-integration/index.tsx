/**
 * NectarBlocks Integration Entry Point
 *
 * Registers an editor.BlockEdit filter that injects Voxel's dynamic tag
 * buttons into NectarBlocks' inspector controls.
 *
 * Auto-registers on import (same pattern as editorWrapperFilters.tsx).
 *
 * @package VoxelFSE
 */

import NBDynamicTagInjector from './NBDynamicTagInjector';
import { getNBBlockConfig, NB_TARGET_BLOCK_NAMES } from './nectarBlocksConfig';
import { voxelTabAttributes } from '@shared/controls/VoxelTab';

let isRegistered = false;

export function registerNBDynamicTagIntegration(): void {
	if (isRegistered) return;

	const wpHooks = (window as any).wp?.hooks;
	const wpCompose = (window as any).wp?.compose;

	if (!wpHooks || !wpCompose) {
		return;
	}

	const { addFilter } = wpHooks;
	const { createHigherOrderComponent } = wpCompose;

	// Inject voxelDynamicTags attribute into target NB blocks client-side.
	// NB registers blocks via JS (not PHP), so register_block_type_args won't work.
	addFilter(
		'blocks.registerBlockType',
		'voxel-fse/nb-inject-attributes',
		(settings: Record<string, unknown>, name: string) => {
			if (!NB_TARGET_BLOCK_NAMES.has(name)) return settings;

			const attrs = (settings['attributes'] ?? {}) as Record<string, unknown>;
			return {
				...settings,
				attributes: {
					...attrs,
					voxelDynamicTags: {
						type: 'object' as const,
						default: {},
					},
					...voxelTabAttributes,
				},
			};
		}
	);

	const withNBDynamicTags = createHigherOrderComponent(
		(BlockEdit: any) => {
			return (props: any) => {
				const { name, clientId, attributes, setAttributes } = props;

				// Only process targeted NB blocks
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

	isRegistered = true;
}

// Auto-register when this module is imported
registerNBDynamicTagIntegration();
