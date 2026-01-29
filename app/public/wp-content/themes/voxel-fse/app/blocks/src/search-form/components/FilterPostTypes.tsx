/**
 * FilterPostTypes Component
 *
 * Post type switcher filter matching Voxel's HTML structure exactly.
 * Uses FieldPopup with React Portal for correct vx-popup positioning.
 * Evidence: docs/block-conversions/popup-positioning-architecture.md
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback } from 'react';
import type { PostTypeConfig } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { FieldPopup } from '@shared';

interface FilterPostTypesProps {
	postTypes: PostTypeConfig[];
	currentPostType: string;
	onChange: ( postTypeKey: string ) => void;
	blockId?: string;
	style?: React.CSSProperties;
}

export default function FilterPostTypes( {
	postTypes,
	currentPostType,
	onChange,
	blockId,
	style,
}: FilterPostTypesProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';

	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLDivElement >( null );

	const handleSelect = useCallback( ( postTypeKey: string ) => {
		onChange( postTypeKey );
		setIsOpen( false );
	}, [ onChange ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const currentPostTypeConfig = postTypes.find( ( pt ) => pt.key === currentPostType );
	const displayValue = currentPostTypeConfig?.label || 'Select type';
	const hasValue = !! currentPostType;

	// Get post type icon - from API data (HTML markup) or empty
	// Evidence: themes/voxel/templates/widgets/search-form/choose-cpt.php uses v-html="$root.post_type.icon"
	const postTypeIcon = currentPostTypeConfig?.icon || '';

	// Render post type list (used in popup)
	// Evidence: themes/voxel/templates/widgets/search-form/post-types-filter.php:21-34
	const renderPostTypeList = () => (
		<div className="ts-term-dropdown ts-md-group">
			<ul className="simplify-ul ts-term-dropdown-list min-scroll">
				{ postTypes.map( ( postType ) => {
					const isSelected = currentPostType === postType.key;
					return (
						<li key={ postType.key }>
							<a
								href="#"
								className="flexify"
								onClick={ ( e ) => {
									e.preventDefault();
									handleSelect( postType.key );
								} }
							>
								{ /* Radio button structure - matches Voxel parent */ }
								<div className="ts-radio-container">
									<label className="container-radio">
										<input
											type="radio"
											checked={ isSelected }
											disabled
											hidden
											readOnly
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{ postType.label }</span>
								{ /* Icon on the right - matches Voxel v-html="post_type.icon" pattern */ }
								<div className="ts-term-icon ts-pull-right">
									{ postType.icon && (
										<span dangerouslySetInnerHTML={ { __html: postType.icon } } />
									) }
								</div>
							</a>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	// Correct HTML structure: <div class="ts-form-group choose-cpt-filter"><label>Post type</label>...
	// Evidence: Voxel renders both classes on same element with label
	return (
		<div className="ts-form-group choose-cpt-filter" style={ style }>
			<label>Post type</label>
			{ /* Trigger button */ }
			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
				onClick={ openPopup }
				onMouseDown={ ( e ) => e.preventDefault() }
				role="button"
				tabIndex={ 0 }
			>
				{ /* Icon from API (HTML markup) - matches Voxel v-html="$root.post_type.icon" pattern */ }
				{ postTypeIcon && (
					<span dangerouslySetInnerHTML={ { __html: postTypeIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title=""
				icon={ postTypeIcon }
				saveLabel="Save"
				showSave={ false }
				showClear={ false }
				onSave={ () => setIsOpen( false ) }
				onClose={ () => setIsOpen( false ) }
				className={ `hide-head ${popupClassName}`.trim() }
			>
				{ renderPostTypeList() }
			</FieldPopup>
		</div>
	);
}
