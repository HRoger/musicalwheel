/**
 * FilterSwitcher Component
 *
 * Toggle/switcher filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/ssr/switcher-ssr.php
 *
 * @package VoxelFSE
 */

import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles } from '@shared';

export default function FilterSwitcher( {
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps ) {
	const isChecked = value === true || value === 'true' || value === '1';

	const handleToggle = ( e: React.MouseEvent | React.ChangeEvent ) => {
		e.preventDefault();
		onChange( ! isChecked );
	};

	// Voxel structure: ts-form-group switcher-label ts-inline-filter
	// with onoffswitch toggle control
	// Evidence: Voxel uses @click.prevent on the label to toggle
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group switcher-label ts-inline-filter' );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }
			<label
				className={ `onoffswitch ts-${ isChecked ? 'on' : 'off' }` }
				onClick={ handleToggle }
			>
				<input
					type="checkbox"
					className="onoffswitch-checkbox"
					checked={ isChecked }
					readOnly
				/>
				<span className="onoffswitch-trigger"></span>
			</label>
		</div>
	);
}
