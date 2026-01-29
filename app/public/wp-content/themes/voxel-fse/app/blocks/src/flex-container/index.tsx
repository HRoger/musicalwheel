import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import blockJson from './block.json';
import './filters'; // Register filters for wrapper props

registerBlockType(blockJson.name, {
    edit: Edit,
    save: Save,
});
