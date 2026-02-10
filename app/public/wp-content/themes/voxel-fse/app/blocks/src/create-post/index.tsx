/**
 * Create Post Block Registration (Plan C+)
 *
 * Registers the create-post block with WordPress.
 * Uses save.tsx to output vxconfig for frontend hydration.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import type { CreatePostAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';



/**
 * Deprecated block versions for migration
 * Handles old saved content formats to prevent validation errors
 */
const deprecated = [
	// v2: SVG placeholder version (pre-cleanup)
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
	// v1: Old placeholder without inline styles (just class name)
	{
		attributes: metadata.attributes,
		save({ attributes }: { attributes: CreatePostAttributes }) {
			const blockProps = {
				className: [
					'ts-form',
					'ts-create-post',
					'create-post-form',
					'voxel-fse-create-post-frontend',
				].join(' '),
				'data-post-type': attributes.postTypeKey || '',
			};

			const vxConfig = {
				postTypeKey: attributes.postTypeKey || '',
				submitButtonText: attributes.submitButtonText || 'Publish',
				successMessage: attributes.successMessage || '',
				redirectAfterSubmit: attributes.redirectAfterSubmit || '',
				icons: {
					popupIcon: attributes.popupIcon || null,
					infoIcon: attributes.infoIcon || null,
					tsMediaIco: attributes.tsMediaIco || null,
					nextIcon: attributes.nextIcon || null,
					prevIcon: attributes.prevIcon || null,
					downIcon: attributes.downIcon || null,
					trashIcon: attributes.trashIcon || null,
					draftIcon: attributes.draftIcon || null,
					publishIcon: attributes.publishIcon || null,
					saveIcon: attributes.saveIcon || null,
					successIcon: attributes.successIcon || null,
					viewIcon: attributes.viewIcon || null,
					tsCalendarIcon: attributes.tsCalendarIcon || null,
					tsCalminusIcon: attributes.tsCalminusIcon || null,
					tsAddIcon: attributes.tsAddIcon || null,
					tsEmailIcon: attributes.tsEmailIcon || null,
					tsPhoneIcon: attributes.tsPhoneIcon || null,
					tsLocationIcon: attributes.tsLocationIcon || null,
					tsMylocationIcon: attributes.tsMylocationIcon || null,
					tsMinusIcon: attributes.tsMinusIcon || null,
					tsPlusIcon: attributes.tsPlusIcon || null,
					tsListIcon: attributes.tsListIcon || null,
					tsSearchIcon: attributes.tsSearchIcon || null,
					tsClockIcon: attributes.tsClockIcon || null,
					tsLinkIcon: attributes.tsLinkIcon || null,
					tsRtimeslotIcon: attributes.tsRtimeslotIcon || null,
					tsUploadIco: attributes.tsUploadIco || null,
					tsLoadMore: attributes.tsLoadMore || null,
				},
			};

			return (
				<div {...blockProps}>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<div className="voxel-fse-block-placeholder">
						Loading create post form...
					</div>
				</div>
			);
		},
	},
];

// Register the block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Create Post (VX)', 'voxel-fse'),
	description: __('A form for creating and editing Voxel posts.', 'voxel-fse'),
	edit: Edit,
	save, // Plan C+ - saves vxconfig for frontend hydration
	deprecated,
} as any);
