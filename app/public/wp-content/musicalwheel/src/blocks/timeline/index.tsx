import { registerBlockType } from '@wordpress/blocks';
import Edit from './Edit';

// Import block metadata from block.json
import metadata from '../../../app/blocks/timeline/block.json';

registerBlockType(metadata.name, {
	...metadata,
	edit: Edit,
});
