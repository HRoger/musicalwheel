/**
 * Search Form Block - Registration
 *
 * Registers the search-form block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { SearchFormAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';



/**
 * Deprecated block versions for migration
 * Handles old saved content formats to prevent validation errors
 */
const deprecated = [
	// v1: Old placeholder with emoji icon and text spans
	{
		attributes: metadata.attributes,
		save({ attributes }: { attributes: SearchFormAttributes }) {
			const blockProps = useBlockProps.save({
				className: 'ts-form ts-search-widget voxel-fse-search-form',
				'data-post-types': JSON.stringify(attributes.postTypes || []),
				'data-on-submit': attributes.onSubmit,
				'data-post-to-feed-id': attributes.postToFeedId,
				'data-post-to-map-id': attributes.postToMapId,
			});

			const vxConfig = {
				postTypes: (attributes.postTypes || []).map((key: string) => ({ key, label: '', filters: [] })),
				currentPostType: '',
				filterLists: attributes.filterLists || {},
				portalMode: attributes.portalMode || { desktop: false, tablet: false, mobile: false },
				showPostTypeFilter: attributes.showPostTypeFilter ?? true,
				showSearchButton: attributes.showSearchButton ?? true,
				showResetButton: attributes.showResetButton ?? false,
				searchButtonText: attributes.searchButtonText || 'Search',
				resetButtonText: attributes.resetButtonText || '',
				formToggleDesktop: attributes.formToggleDesktop ?? false,
				formToggleTablet: attributes.formToggleTablet ?? true,
				formToggleMobile: attributes.formToggleMobile ?? true,
				searchButtonWidth: attributes.searchButtonWidth,
				searchButtonWidth_tablet: attributes.searchButtonWidth_tablet,
				searchButtonWidth_mobile: attributes.searchButtonWidth_mobile,
				searchButtonWidthUnit: attributes.searchButtonWidthUnit || '%',
				resetButtonWidth: attributes.resetButtonWidth,
				resetButtonWidth_tablet: attributes.resetButtonWidth_tablet,
				resetButtonWidth_mobile: attributes.resetButtonWidth_mobile,
				resetButtonWidthUnit: attributes.resetButtonWidthUnit || '%',
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
						<span className="placeholder-text">Search Form (VX)</span>
					</div>
				</div>
			);
		},
	},
];

// Register the block
registerBlockType<SearchFormAttributes>(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Search Form (VX)', 'voxel-fse'),
	description: __('A search form with filters for Voxel post types.', 'voxel-fse'),
	edit: Edit,
	save, // Option C+ - saves data attributes for Next.js hydration
	deprecated,
} as Parameters<typeof registerBlockType<SearchFormAttributes>>[1]);
