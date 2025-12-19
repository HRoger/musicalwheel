import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import blockJson from './block.json';

registerBlockType(blockJson.name, {
    edit: Edit,
    save: Save,
});
