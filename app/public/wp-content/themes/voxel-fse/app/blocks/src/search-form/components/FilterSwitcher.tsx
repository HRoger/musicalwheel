/**
 * FilterSwitcher Component
 *
 * Toggle/switcher filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/switcher-filter.php
 *
 * CRITICAL: Supports BOTH inline and popup modes based on props.openInPopup
 * - Popup mode (line 2-10): Button trigger with placeholder text, toggle on click
 * - Inline mode (line 11-21): Switch slider with onoffswitch control
 *
 * Props from frontend_props() (switcher-filter.php:189-193):
 *   openInPopup, placeholder
 *
 * Voxel JS toggle(): this.filter.value = null === this.filter.value ? 1 : null
 * Values are 1 (checked) or null (unchecked), NOT true/false
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
	const props = filterData.props || {};

	// Evidence: switcher-filter.php:191 openInPopup is boolean
	// Controller default: get_default_elementor_config() line 593 returns open_in_popup => 'no' → false
	const openInPopup = props.openInPopup === true;

	// Evidence: switcher-filter.php:192 placeholder falls back to label
	const placeholder = ( props.placeholder as string ) || filterData.label || '';

	// Get filter icon - from API data (HTML markup)
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Evidence: Voxel JS toggle() { this.filter.value = null === this.filter.value ? 1 : null }
	// Values are 1 (on) or null (off) — NOT true/false
	// Evidence: switcher-filter.php template line 15: :checked="filter.value !== null"
	const isChecked = value !== null && value !== undefined && value !== '' && value !== false;

	/**
	 * toggle - matches Voxel JS:
	 *   toggle() { this.filter.value = null === this.filter.value ? 1 : null }
	 */
	const handleToggle = ( e: React.MouseEvent | React.ChangeEvent ) => {
		e.preventDefault();
		// Voxel uses 1 for checked, null for unchecked
		// We use 1 for checked, '' for unchecked (empty string triggers filter reset in search form)
		onChange( isChecked ? '' : 1 );
	};

	// Popup mode - matches switcher-filter.php line 2-10
	// Evidence: v-if="filter.props.openInPopup"
	if ( openInPopup ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );

		return (
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }
				<div
					className={ `ts-filter${ isChecked ? ' ts-filled' : '' }` }
					onClick={ handleToggle }
					onMouseDown={ ( e ) => e.preventDefault() }
					role="button"
					tabIndex={ 0 }
				>
					{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
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

	// Inline mode - matches switcher-filter.php line 11-21
	// Evidence: v-else → ts-form-group switcher-label ts-inline-filter
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group switcher-label ts-inline-filter' );

	return (
		<div className={ className } style={ style }>
			{ /* Evidence: switcher-filter.php line 12-20
			  * <label class="ts-keep-visible">
			  *   <div class="switch-slider">
			  *     <div class="onoffswitch">
			  *       <input type="checkbox" class="onoffswitch-checkbox" :checked="..." @change="toggle">
			  *       <label class="onoffswitch-label" @click.prevent="toggle"></label>
			  *     </div>
			  *   </div>
			  *   {{ filter.props.placeholder }}
			  * </label>
			  */ }
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
						{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
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
