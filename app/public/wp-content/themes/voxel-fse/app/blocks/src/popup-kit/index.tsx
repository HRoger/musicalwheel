/**
 * Voxel Popup Block
 * Demo block showing popup component functionality
 */
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

console.log('🔍 POPUP-KIT: Starting block registration...');
console.log('🔍 POPUP-KIT: Block name:', metadata.name);
console.log('🔍 POPUP-KIT: Edit component:', Edit);
console.log('🔍 POPUP-KIT: Save component:', save);

// Register the block
try {
	registerBlockType(metadata.name as string, {
		...metadata,
		icon: VoxelGridIcon,
		edit: Edit,
		save, // Plan C+: save outputs vxconfig JSON, NO PHP rendering
	});
	console.log('✅ POPUP-KIT: Block registered successfully!');
} catch (error) {
	console.error('❌ POPUP-KIT: Registration failed:', error);
}
