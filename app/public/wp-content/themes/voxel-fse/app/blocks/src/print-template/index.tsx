/**
 * Print Template Block - Registration
 *
 * Registers the print-template block with WordPress.
 * FSE equivalent of Voxel's Print Template widget for rendering
 * WordPress Reusable Blocks or Block Patterns.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { PrintTemplateAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

import './editor.css';

/**
 * Deprecated block versions for migration
 * Handles old saved content formats to prevent validation errors
 */
const deprecated = [
	// v1: Dynamic block that returned null (render.php period)
	{
		attributes: metadata.attributes,
		save() {
			return null;
		},
	},
	// v2: Old placeholder with emoji icon and text spans (no data-template-id attribute)
	{
		attributes: metadata.attributes,
		save({ attributes }: { attributes: PrintTemplateAttributes }) {
			// Old version did NOT have data-template-id attribute
			const blockProps = useBlockProps.save({
				className: 'voxel-fse-print-template ts-print-template',
			});

			const vxConfig = {
				templateId: attributes.templateId || '',
				hideDesktop: attributes.hideDesktop ?? false,
				hideTablet: attributes.hideTablet ?? false,
				hideMobile: attributes.hideMobile ?? false,
				customClasses: attributes.customClasses || '',
			};

			return (
				<div {...blockProps}>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<div className="voxel-fse-block-placeholder">
						<span className="placeholder-icon">📄</span>
						<span className="placeholder-text">Print Template (VX)</span>
					</div>
				</div>
			);
		},
	},
	// v3: Old placeholder with document icon and text
	{
		attributes: metadata.attributes,
		save({ attributes }: { attributes: PrintTemplateAttributes }) {
			const blockProps = useBlockProps.save({
				className: 'voxel-fse-print-template',
				'data-template-id': attributes.templateId || '',
			});

			const vxConfig = {
				templateId: attributes.templateId || '',
				hideDesktop: attributes.hideDesktop ?? false,
				hideTablet: attributes.hideTablet ?? false,
				hideMobile: attributes.hideMobile ?? false,
				customClasses: attributes.customClasses || '',
			};

			return (
				<div {...blockProps}>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
					/>
					<div className="voxel-fse-print-template-placeholder">
						<span className="dashicons dashicons-media-document"></span>
						<span>Select a template from the sidebar</span>
					</div>
				</div>
			);
		},
	},
];

// Register the block
registerBlockType<PrintTemplateAttributes>(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Print Template (VX)', 'voxel-fse'),
	description: __(
		'Render a WordPress Reusable Block or Block Pattern.',
		'voxel-fse'
	),
	edit: Edit,
	save,
	deprecated,
} as Parameters<typeof registerBlockType<PrintTemplateAttributes>>[1]);
