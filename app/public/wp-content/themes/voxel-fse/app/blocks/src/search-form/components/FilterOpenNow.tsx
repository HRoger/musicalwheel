/**
 * FilterOpenNow Component
 *
 * Open now filter for business hours matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/ssr/open-now-ssr.php
 *
 * @package VoxelFSE
 */

import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles } from '@shared';

export default function FilterOpenNow( {
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

	const label = filterData.props?.placeholder || filterData.label || 'Open now';

	// Voxel structure (inline mode): ts-form-group switcher-label ts-inline-filter
	// with switch-slider containing onoffswitch
	// Evidence: Voxel uses @click.prevent on the label to toggle
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group switcher-label ts-inline-filter' );

	return (
		<div className={ className } style={ style }>
			<label>
				<div className="switch-slider">
					<div className="onoffswitch" onClick={ handleToggle }>
						<input
							type="checkbox"
							className="onoffswitch-checkbox"
							checked={ isChecked }
							readOnly
						/>
						<label
							className="onoffswitch-label"
							onClick={ handleToggle }
						></label>
					</div>
				</div>
				{ label }
			</label>
		</div>
	);
}
