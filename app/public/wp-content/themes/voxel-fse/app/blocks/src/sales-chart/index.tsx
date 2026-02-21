/**
 * Sales Chart Block - Entry Point
 *
 * Registers the Sales Chart block with WordPress.
 * Plan C+ Architecture: No PHP rendering, API-driven.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';


// Register the block
registerBlockType(metadata.name, {
  ...metadata,
  icon: VoxelGridIcon,
  edit: Edit,
  save,
});
