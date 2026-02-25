import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { RingChartAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Ring Chart Block Registration
 *
 * Converts Voxel Elementor Ring Chart widget to Gutenberg block
 * using Plan C+ architecture (headless-ready)
 *
 * Voxel source: themes/voxel/app/widgets/ring-chart.php
 */

// Cast metadata to proper type
const blockMetadata = metadata as unknown as {
  name: string;
  title: string;
  category: string;
  icon?: string;
  description: string;
  keywords: string[];
  attributes: Record<string, unknown>;
};

registerBlockType<RingChartAttributes>(blockMetadata.name, {
  ...blockMetadata,
  icon: VoxelGridIcon,
  edit: Edit,
  save,
});
