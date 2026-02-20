/**
 * FilterRelations Component
 *
 * Relations filter for connected posts matching Voxel's HTML structure exactly.
 *
 * 1:1 VOXEL PARITY:
 * This filter is DISPLAY-ONLY. It only renders when a value is set
 * (via URL parameter or default value). It shows the related post title
 * and has NO interactive search/selection popup.
 *
 * Evidence (Vue template):
 *   <form-group ... v-if="filter.value !== null" ...>
 *     <template #trigger>
 *       <div class="ts-filter ts-popup-target" :class="{'ts-filled': filter.value !== null}">
 *         <span v-html="filter.icon"></span>
 *         <div class="ts-filter-text">
 *           <template v-if="filter.props.post.title">{{ filter.props.post.title }}</template>
 *           <template v-else>Unknown</template>
 *         </div>
 *       </div>
 *     </template>
 *     <!-- #popup slot is EMPTY — no search, no selection UI -->
 *   </form-group>
 *
 * Evidence (Vue JS):
 *   FilterRelations = { methods: { saveValue(), isFilled(), onReset() } }
 *   - isFilled() = !!this.value
 *   - saveValue() = this.filter.value = this.isFilled() ? this.value : null
 *   - onReset() = this.value = this.filter.resets_to; this.saveValue()
 *
 * frontend_props() returns ONLY: { post: { title?, logo? } }
 * Evidence: themes/voxel/app/post-types/filters/relations-filter.php:127-138
 *
 * parse_value() expects numeric post ID: absint($value)
 * Evidence: themes/voxel/app/post-types/filters/relations-filter.php:90-96
 *
 * @package VoxelFSE
 */

import { useRef, useCallback } from 'react';
import type { FilterComponentProps } from '../types';
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface PostData {
	title?: string;
	logo?: string;
}

export default function FilterRelations( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	const triggerRef = useRef< HTMLDivElement >( null );

	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';

	const props = filterData.props || {};
	// Post data from PHP frontend_props() — ONLY prop returned
	// Evidence: themes/voxel/app/post-types/filters/relations-filter.php:127-138
	const propsPostData = props['post'] as PostData | undefined;

	// Get filter icon — from API data (HTML markup)
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Determine effective value using 1:1 Voxel parity approach
	// parse_value() expects numeric post ID: absint($value)
	// Evidence: themes/voxel/app/post-types/filters/relations-filter.php:90-96
	//
	// The `value` prop comes from state.filterValues[filterKey]
	// - undefined = not initialized yet, use filterData.value
	// - null = explicitly cleared (e.g., clearAll with resetValue='empty')
	// - number = has a value from URL or default
	let effectiveValue: number | null = null;

	if ( value !== undefined ) {
		// State has been set — could be a number or null (from clearAll/onReset)
		if ( value === null ) {
			effectiveValue = null;
		} else if ( typeof value === 'number' ) {
			effectiveValue = value;
		} else if ( typeof value === 'string' && value !== '' ) {
			effectiveValue = Number( value );
		}
	} else if ( filterData.value !== null && filterData.value !== undefined ) {
		// Use filterData.value from PHP (set via get_frontend_config → parse_value)
		effectiveValue = typeof filterData.value === 'number' ? filterData.value : Number( filterData.value );
	}

	const hasValue = effectiveValue !== null && ! isNaN( effectiveValue ) && effectiveValue > 0;

	// EXACT Voxel: onReset() → this.value = this.filter.resets_to; this.saveValue()
	const handleClear = useCallback( () => {
		onChange( null );
	}, [ onChange ] );

	// EXACT Voxel v-if="filter.value !== null": filter is hidden when no value set
	// The entire filter does not render unless a value is present
	if ( ! hasValue ) {
		return null;
	}

	// Get display name from props.post (PHP frontend_props)
	// EXACT Voxel template:
	//   <template v-if="filter.props.post.title">{{ filter.props.post.title }}</template>
	//   <template v-else>Unknown</template>
	const displayValue = propsPostData?.title || 'Unknown';

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }

			{ /* Trigger button — always ts-filled since we only render when hasValue */ }
			<div
				ref={ triggerRef }
				className="ts-filter ts-popup-target ts-filled"
				role="button"
				tabIndex={ 0 }
			>
				{ /* Icon from API (HTML markup) — matches Voxel v-html="filter.icon" */ }
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* EXACT Voxel: Popup has NO content (#popup slot is empty)
			   * The popup only has the controller footer with clear/close buttons.
			   * Evidence: Vue template #popup slot has no children */ }
			<FieldPopup
				isOpen={ false }
				target={ triggerRef }
				showClear={ true }
				showSave={ false }
				onSave={ () => {} }
				onClear={ handleClear }
				onClose={ () => {} }
				className={ `${ popupClassName }${ config.popupCenterPosition ? ' ts-popup-centered' : '' }` }
				popupStyle={ popupStyles.style }
			>
				{ /* Empty — Voxel's relations filter has no popup content */ }
			</FieldPopup>
		</div>
	);
}
