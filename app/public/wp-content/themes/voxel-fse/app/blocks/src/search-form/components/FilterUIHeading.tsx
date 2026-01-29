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
	const description = filterData.props?.description || '';

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
