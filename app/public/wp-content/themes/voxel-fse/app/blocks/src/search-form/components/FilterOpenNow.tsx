/**
 * FilterOpenNow Component
 *
 * Open now filter for business hours matching Voxel's HTML structure exactly.
 * Supports two display modes based on openInPopup admin option:
 * - Popup mode (openInPopup=true): Button trigger with icon + placeholder text
 * - Inline mode (openInPopup=false): Toggle switch with label
 *
 * Evidence: themes/voxel/templates/widgets/search-form/open-now-filter.php
 * Evidence: themes/voxel/templates/widgets/search-form/ssr/open-now-ssr.php
 * Evidence: themes/voxel/app/post-types/filters/open-now-filter.php:124-128
 *
 * @package VoxelFSE
 */

import type { FilterComponentProps } from '../types';
import { getFilterWrapperStyles } from '@shared';

export default function FilterOpenNow( {
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps ) {
	// Voxel uses 1/null for open-now value
	// Evidence: voxel-search-form.beautified.js:1135
	//   toggle() { this.filter.value = this.filter.value === null ? 1 : null; }
	// Evidence: open-now-filter.php:97-98
	//   return absint( $value ) === 1 ? 1 : null;
	const isChecked = value !== null && value !== undefined && value !== false && value !== '' && value !== 0;

	const handleToggle = ( e: React.MouseEvent | React.ChangeEvent ) => {
		e.preventDefault();
		// Match Voxel: toggle between 1 and null
		// Evidence: voxel-search-form.beautified.js:1135
		onChange( isChecked ? null : 1 );
	};

	const placeholder = filterData.props?.placeholder || filterData.label || 'Open now';

	// Check openInPopup from inspector config (Gutenberg attribute) or from backend props
	// Evidence: open-now-filter.php:126 → frontend_props() returns openInPopup
	// Evidence: open-now-filter.php:111-116 → Elementor control 'open_in_popup'
	const openInPopup = config.openInPopup || filterData.props?.openInPopup || false;

	if ( openInPopup ) {
		// Popup mode: button trigger
		// Evidence: open-now-filter.php template line 2-9
		//   <div v-if="filter.props.openInPopup" class="ts-form-group">
		//     <label v-if="$root.config.showLabels">{{ filter.label }}</label>
		//     <div class="ts-filter" @click.prevent="toggle" :class="{'ts-filled': filter.value !== null}">
		//       <span v-html="filter.icon"></span>
		//       <div class="ts-filter-text"><span>{{ filter.props.placeholder }}</span></div>
		//     </div>
		//   </div>
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
		const filterIcon = filterData.icon || '';

		return (
			<div className={ className } style={ style }>
				<label>{ filterData.label }</label>
				<div
					className={ `ts-filter ts-popup-target${ isChecked ? ' ts-filled' : '' }` }
					onClick={ handleToggle }
					role="button"
					tabIndex={ 0 }
				>
					{ filterIcon && (
						<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
					) }
					<div className="ts-filter-text">
						<span>{ placeholder }</span>
					</div>
				</div>
			</div>
		);
	}

	// Inline mode: toggle switch (default)
	// Evidence: open-now-filter.php template line 11-21
	//   <div v-else class="ts-form-group switcher-label ts-inline-filter">
	//     <label class="ts-keep-visible">
	//       <div class="switch-slider">
	//         <div class="onoffswitch">
	//           <input type="checkbox" class="onoffswitch-checkbox" :checked="filter.value !== null" @change="toggle" tabindex="0">
	//           <label class="onoffswitch-label" @click.prevent="toggle"></label>
	//         </div>
	//       </div>
	//       {{ filter.props.placeholder }}
	//     </label>
	//   </div>
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group switcher-label ts-inline-filter' );

	return (
		<div className={ className } style={ style }>
			<label className="ts-keep-visible">
				<div className="switch-slider">
					<div className="onoffswitch">
						<input
							type="checkbox"
							className="onoffswitch-checkbox"
							checked={ isChecked }
							onChange={ handleToggle }
							tabIndex={ 0 }
						/>
						<label
							className="onoffswitch-label"
							onClick={ handleToggle }
						></label>
					</div>
				</div>
				{ placeholder }
			</label>
		</div>
	);
}
