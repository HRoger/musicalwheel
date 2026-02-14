/**
 * FilterUIHeading Component
 *
 * UI heading/separator element matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/ssr/ui-heading-ssr.php
 * This is a non-functional display element.
 *
 * @package VoxelFSE
 */

import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles } from '@shared';

export default function FilterUIHeading( {
	config,
	filterData,
}: Omit< FilterComponentProps, 'value' | 'onChange' > ) {
	// Evidence: ui-heading-filter.php has NO frontend_props() override (returns [])
	// Description comes from get_frontend_config() base-filter.php:99 → top-level filterData.description
	// Voxel template: <small v-if="filter.description">{{ filter.description }}</small>
	const description = filterData.description || '';

	// Voxel structure: wrapper_class ui-heading > label > text + small
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group ui-heading' );

	return (
		<div className={ className } style={ style }>
			<label>
				{ config.label || filterData.label }
				{ description && <small>{ description }</small> }
			</label>
		</div>
	);
}
