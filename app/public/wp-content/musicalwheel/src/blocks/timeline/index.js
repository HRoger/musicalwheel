/**
 * Timeline Block
 *
 * Registers the Timeline block for the WordPress block editor.
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import metadata from './block.json';
import './style.scss';
import './editor.scss';

registerBlockType(metadata.name, {
	edit: Edit,
	// Dynamic block - no save function
	save: () => null,
});
