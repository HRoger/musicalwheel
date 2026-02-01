/**
 * Quick Search Block - Registration
 *
 * Registers the quick-search block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { QuickSearchAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';



/**
 * Deprecated block versions for migration
 */
const deprecated = [
	// v1: Initial placeholder format
	{
		attributes: metadata.attributes,
		save({ attributes }: { attributes: QuickSearchAttributes }) {
			const blockProps = useBlockProps.save({
				className: 'ts-form quick-search voxel-fse-quick-search',
			});

			const vxConfig = {
				postTypes: {},
				displayMode: attributes.displayMode,
				keywords: { minlength: 2 },
				singleMode: {
					submitTo: attributes.singleSubmitTo || null,
					filterKey: attributes.singleSubmitKey || 'keywords',
				},
				icons: {
					search: attributes.searchIcon,
					close: attributes.closeIcon,
					result: attributes.resultIcon,
					clearSearches: attributes.clearSearchesIcon,
				},
				buttonLabel: attributes.buttonLabel,
				hideCptTabs: attributes.hideCptTabs,
			};

			return (
				<div {...blockProps}>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<div className="voxel-fse-block-placeholder">
						<span className="placeholder-icon">🔍</span>
						<span className="placeholder-text">Quick Search (VX)</span>
					</div>
				</div>
			);
		},
	},
];

// Register the block
registerBlockType<QuickSearchAttributes>(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Quick Search (VX)', 'voxel-fse'),
	description: __(
		'A quick search widget with keyboard shortcut support and recent searches.',
		'voxel-fse'
	),
	edit: Edit,
	save,
	deprecated,
} as Parameters<typeof registerBlockType<QuickSearchAttributes>>[1]);
