import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import blockJson from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';
import './filters'; // Register filters for wrapper props

registerBlockType(blockJson.name, {
    ...blockJson,
    attributes: {
        ...blockJson.attributes,
        ...advancedTabAttributes,
        ...voxelTabAttributes,
    },
    icon: VoxelGridIcon,
    edit: Edit,
    save: Save,
} as any);
