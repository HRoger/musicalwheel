/**
 * ContentTab Inspector Component
 *
 * Elementor-style collapsible sections matching Voxel's Search Form widget.
 * Contains: Post types, Place Filters, Buttons, Responsive, Icons
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress components types are incomplete
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	Spinner,
	SelectControl,
	TextControl,
	RangeControl,
} from '@wordpress/components';
import { AccordionPanelGroup, AccordionPanel } from '@shared/controls/AccordionPanelGroup';
import { useState } from 'react';
// @ts-ignore - WordPress data types
import { useSelect } from '@wordpress/data';
import {
	TagMultiSelect,
	IconPickerControl,
	ResponsiveRangeControlWithDropdown,
	DynamicTagTextControl,
	RelationControl,
	RepeaterControl,
	generateRepeaterId,
	ElementVisibilityModal,
} from '@shared/controls';
import type { RepeaterItemRenderProps, VisibilityRule } from '@shared/controls';
import FilterInspector from './FilterInspector';
import type { PostTypeConfig, FilterConfig, FilterData, SearchFormAttributes } from '../types';


interface ContentTabProps {
	attributes: SearchFormAttributes;
	setAttributes: ( attrs: Partial< SearchFormAttributes > ) => void;
	postTypes: PostTypeConfig[];
	isLoading: boolean;
}

export default function ContentTab( {
	attributes,
	setAttributes,
	postTypes,
	isLoading,
}: ContentTabProps ) {
	const [ rulesModalOpen, setRulesModalOpen ] = useState( false );
	const [ editingRulesFilter, setEditingRulesFilter ] = useState< { postTypeKey: string; filterId: string } | null >( null );

	// Find Post Feed and Map blocks for connection
	const { postFeedBlocks, mapBlocks } = useSelect(
		// @ts-ignore - WordPress data types incomplete
		( select: ( store: string ) => unknown ) => {
			const { getBlocks } = select( 'core/block-editor' ) as {
				getBlocks: () => Array< {
					clientId: string;
					name: string;
					attributes: { title?: string; blockId?: string };
					innerBlocks?: Array< unknown >;
				} >;
			};
			const allBlocks = getBlocks();

			const findBlocksRecursive = (
				blocks: Array< {
					clientId: string;
					name: string;
					attributes: { title?: string; blockId?: string };
					innerBlocks?: Array< unknown >;
				} >,
				targetName: string
			): Array< { clientId: string; name: string; attributes: { title?: string; blockId?: string } } > => {
				let found: Array< { clientId: string; name: string; attributes: { title?: string; blockId?: string } } > = [];
				blocks.forEach( ( block ) => {
					if ( block.name === targetName ) {
						found.push( block );
					}
					if ( block.innerBlocks && block.innerBlocks.length > 0 ) {
						found = found.concat(
							findBlocksRecursive(
								block.innerBlocks as Array< {
									clientId: string;
									name: string;
									attributes: { title?: string; blockId?: string };
									innerBlocks?: Array< unknown >;
								} >,
								targetName
							)
						);
					}
				} );
				return found;
			};

			return {
				postFeedBlocks: findBlocksRecursive( allBlocks, 'voxel-fse/post-feed' ),
				mapBlocks: findBlocksRecursive( allBlocks, 'voxel-fse/map' ),
			};
		}
	);

	// Build relation items for Post Feed blocks
	const postFeedItems = postFeedBlocks.map(
		( block: { clientId: string; attributes: { title?: string; blockId?: string } } ) => ( {
			id: block.attributes.blockId || block.clientId,
			clientId: block.clientId,
			label: block.attributes.title || block.attributes.blockId || block.clientId.substring( 0, 7 ),
		} )
	);

	// Build relation items for Map blocks
	const mapItems = mapBlocks.map(
		( block: { clientId: string; attributes: { title?: string; blockId?: string } } ) => ( {
			id: block.attributes.blockId || block.clientId,
			clientId: block.clientId,
			label: block.attributes.title || block.attributes.blockId || block.clientId.substring( 0, 7 ),
		} )
	);

	if ( isLoading ) {
		return (
			<div className="voxel-fse-loading">
				<Spinner />
				<span>{ __( 'Loading post types...', 'voxel-fse' ) }</span>
			</div>
		);
	}

	const postTypeOptions = postTypes.map( ( pt ) => ( {
		label: pt.label,
		value: pt.key,
	} ) );

	const handlePostTypesChange = ( selectedKeys: string[] ) => {
		setAttributes( { postTypes: selectedKeys } );

		// Initialize filterLists for newly added post types
		const newFilterLists = { ...( attributes.filterLists || {} ) };
		selectedKeys.forEach( ( key ) => {
			if ( ! newFilterLists[ key ] ) {
				newFilterLists[ key ] = [];
			}
		} );
		setAttributes( { filterLists: newFilterLists } );
	};

	const getAvailableFilters = ( postTypeKey: string ) => {
		const postType = postTypes.find( ( pt ) => pt.key === postTypeKey );
		return postType?.filters || [];
	};

	// Handle filter list changes from RepeaterControl
	const handleFilterListChange = ( postTypeKey: string, newFilters: FilterConfig[] ) => {
		setAttributes( {
			filterLists: {
				...attributes.filterLists,
				[ postTypeKey ]: newFilters,
			},
		} );
	};

	// Update a specific filter within a post type's filter list
	const updateFilter = ( postTypeKey: string, filterId: string, updates: Partial< FilterConfig > ) => {
		const filterList = attributes.filterLists?.[ postTypeKey ] || [];
		const updatedFilters = filterList.map( ( f: FilterConfig ) =>
			f.id === filterId ? { ...f, ...updates } : f
		);
		handleFilterListChange( postTypeKey, updatedFilters );
	};

	// Open visibility rules modal
	const openRulesModal = ( postTypeKey: string, filterId: string ) => {
		setEditingRulesFilter( { postTypeKey, filterId } );
		setRulesModalOpen( true );
	};

	// Save visibility rules
	const saveVisibilityRules = ( rules: VisibilityRule[] ) => {
		if ( editingRulesFilter ) {
			updateFilter( editingRulesFilter.postTypeKey, editingRulesFilter.filterId, {
				visibilityRules: rules,
			} );
		}
	};

	// Get current filter being edited for rules
	const getCurrentFilterForRules = () => {
		if ( ! editingRulesFilter ) return null;
		const filterList = attributes.filterLists?.[ editingRulesFilter.postTypeKey ] || [];
		return filterList.find( ( f: FilterConfig ) => f.id === editingRulesFilter.filterId );
	};

	const currentRulesFilter = getCurrentFilterForRules();

	return (
	<>
		<AccordionPanelGroup defaultPanel="post-types">
			{/* ===== POST TYPES SECTION ===== */}
			<AccordionPanel id="post-types" title={ __( 'Post types', 'voxel-fse' ) }>
				<TagMultiSelect
					label={ __( 'Choose post types', 'voxel-fse' ) }
					value={ attributes.postTypes || [] }
					options={ postTypeOptions }
					onChange={ handlePostTypesChange }
					placeholder={ __( 'Select post types...', 'voxel-fse' ) }
				/>

				<ToggleControl
					label={ __( 'Show custom post type filter', 'voxel-fse' ) }
					checked={ attributes.showPostTypeFilter || false }
					onChange={ ( value: boolean ) => setAttributes( { showPostTypeFilter: value } ) }
				/>

				{ attributes.showPostTypeFilter && (
					<ResponsiveRangeControlWithDropdown
						label={ __( 'Post type filter width', 'voxel-fse' ) }
						attributes={ attributes }
						setAttributes={ setAttributes }
						attributeBaseName="postTypeFilterWidth"
						min={ 0 }
						max={ 100 }
						step={ 5 }
						availableUnits={ [ '%' ] }
						unitAttributeName=""
					/>
				) }

				<SelectControl
					label={ __( 'On form submit', 'voxel-fse' ) }
					value={ attributes.onSubmit || 'feed' }
					options={ [
						{ label: __( 'Post results to widget', 'voxel-fse' ), value: 'feed' },
						{ label: __( 'Submit to post type archive', 'voxel-fse' ), value: 'archive' },
						{ label: __( 'Submit to page', 'voxel-fse' ), value: 'page' },
					] }
					onChange={ ( value: string ) => setAttributes( { onSubmit: value as 'feed' | 'archive' | 'page' } ) }
				/>

				{ attributes.onSubmit === 'feed' && (
					<RelationControl
						label={ __( 'Connect to Post Feed widget on this page', 'voxel-fse' ) }
						items={ postFeedItems }
						selectedId={ attributes.postToFeedId }
						onSelect={ ( id ) => setAttributes( { postToFeedId: id ?? '' } ) }
						widgetType="PostFeed"
						description={ __( 'Select a Post Feed block on this page to send search results to.', 'voxel-fse' ) }
					/>
				) }

				{ attributes.onSubmit === 'page' && (
					<TextControl
						label={ __( 'Enter page ID', 'voxel-fse' ) }
						type="number"
						value={ attributes.submitToPageId?.toString() || '' }
						onChange={ ( value: string ) => setAttributes( { submitToPageId: value ? parseInt( value, 10 ) : undefined } ) }
					/>
				) }

				{ attributes.onSubmit === 'feed' && (
					<>
						<ToggleControl
							label={ __( 'Connect to Map?', 'voxel-fse' ) }
							checked={ !! attributes.postToMapId }
							onChange={ ( value: boolean ) => setAttributes( { postToMapId: value ? 'auto' : '' } ) }
						/>

						{ !! attributes.postToMapId && (
							<>
								<RelationControl
									label={ __( 'Connect to Map widget on this page', 'voxel-fse' ) }
									items={ mapItems }
									selectedId={ attributes.postToMapId === 'auto' ? null : attributes.postToMapId }
									onSelect={ ( id ) => setAttributes( { postToMapId: id ?? '' } ) }
									widgetType="Map"
									description={ __( 'Select a Map block on this page to display search results.', 'voxel-fse' ) }
								/>

								<RangeControl
									label={ __( 'Load additional markers', 'voxel-fse' ) }
									help={ __( 'Load additional markers on the map from current results set, independently from post feed.', 'voxel-fse' ) }
									value={ attributes.mapAdditionalMarkers ?? 0 }
									onChange={ ( value: number | undefined ) => setAttributes( { mapAdditionalMarkers: value ?? 0 } ) }
									min={ 0 }
									max={ 1000 }
									step={ 10 }
								/>

								<ToggleControl
									label={ __( 'Enable marker clustering', 'voxel-fse' ) }
									help={ __( 'Markers in close proximity will be grouped into clusters', 'voxel-fse' ) }
									checked={ attributes.mapEnableClusters ?? true }
									onChange={ ( value: boolean ) => setAttributes( { mapEnableClusters: value } ) }
								/>
							</>
						) }

						<ToggleControl
							label={ __( 'Update URL with search values?', 'voxel-fse' ) }
							checked={ attributes.updateUrl ?? true }
							onChange={ ( value: boolean ) => setAttributes( { updateUrl: value } ) }
						/>

						<SelectControl
							label={ __( 'Perform search:', 'voxel-fse' ) }
							value={ attributes.searchOn || 'submit' }
							options={ [
								{ label: __( 'When the search button is clicked', 'voxel-fse' ), value: 'submit' },
								{ label: __( 'When any filter value is updated', 'voxel-fse' ), value: 'change' },
							] }
							onChange={ ( value: string ) => setAttributes( { searchOn: value as 'change' | 'submit' } ) }
						/>
					</>
				) }
			</AccordionPanel>

			{/* ===== PLACE FILTERS SECTION ===== */}
			{ ( attributes.postTypes || [] ).map( ( postTypeKey: string ) => {
				const postType = postTypes.find( ( pt ) => pt.key === postTypeKey );
				if ( ! postType ) return null;

				const filterList = attributes.filterLists?.[ postTypeKey ] || [];
				const availableFilters = getAvailableFilters( postTypeKey );

				return (
					<AccordionPanel
						key={ postTypeKey }
						id={ `filters-${ postTypeKey }` }
						title={ `${ __( 'Place Filters', 'voxel-fse' ) } (${ postType.label })` }
						className="voxel-fse-filters-panel"
					>
						<RepeaterControl< FilterConfig >
							label={ __( 'Add filters', 'voxel-fse' ) }
							items={ filterList }
							onChange={ ( newFilters ) => handleFilterListChange( postTypeKey, newFilters ) }
							getItemLabel={ ( filter, index ) =>
								filter.filterKey ? filter.filterKey : `Item #${ index + 1 }`
							}
							createItem={ () => ( {
								id: generateRepeaterId(),
								filterKey: '',
								type: 'keywords' as const,
								label: '',
							} ) }
							renderContent={ ( { item, onUpdate, onRemove }: RepeaterItemRenderProps< FilterConfig > ) => {
								const filterData = availableFilters.find(
									( f: FilterData ) => f.key === item.filterKey
								);
								return (
									<FilterInspector
										filter={ item }
										filterData={ filterData }
										availableFilters={ availableFilters }
										onUpdate={ onUpdate }
										onRemove={ onRemove }
										onEditRules={ () => openRulesModal( postTypeKey, item.id ) }
									/>
								);
							} }
						/>

						{/* Template controls - Matching Voxel search-form.php:453-472 */}
						<div className="voxel-fse-template-controls">
							<SelectControl
								label={ __( 'Preview card template', 'voxel-fse' ) }
								value={ attributes[ `cardTemplate_${ postTypeKey }` ] || 'main' }
								options={ [
									{ label: __( 'Main template', 'voxel-fse' ), value: 'main' },
									// Add custom templates from Voxel
									...( postType.templates || [] ).map( ( tpl ) => ( {
										label: tpl.label,
										value: String( tpl.id ),
									} ) ),
								] }
								onChange={ ( value: string ) =>
									setAttributes( { [ `cardTemplate_${ postTypeKey }` ]: value } )
								}
							/>

							<SelectControl
								label={ __( 'Map popup template', 'voxel-fse' ) }
								value={ attributes[ `mapTemplate_${ postTypeKey }` ] || 'none' }
								options={ [
									{ label: __( 'None', 'voxel-fse' ), value: 'none' },
									{ label: __( 'Preview card (main)', 'voxel-fse' ), value: 'main' },
									// Add custom templates from Voxel
									...( postType.templates || [] ).map( ( tpl ) => ( {
										label: tpl.label,
										value: String( tpl.id ),
									} ) ),
								] }
								onChange={ ( value: string ) =>
									setAttributes( { [ `mapTemplate_${ postTypeKey }` ]: value } )
								}
							/>
						</div>
					</AccordionPanel>
				);
			} ) }

			{/* ===== BUTTONS SECTION ===== */}
			<AccordionPanel id="buttons" title={ __( 'Buttons', 'voxel-fse' ) }>
				{/* Search Button */}
				<ToggleControl
					label={ __( 'Show search button', 'voxel-fse' ) }
					checked={ attributes.showSearchButton ?? true }
					onChange={ ( value: boolean ) => setAttributes( { showSearchButton: value } ) }
				/>

				{ attributes.showSearchButton && (
					<>
						<DynamicTagTextControl
							label={ __( 'Button text', 'voxel-fse' ) }
							value={ attributes.searchButtonText || '' }
							onChange={ ( value: string ) =>
								setAttributes( { searchButtonText: value } )
							}
							placeholder={ __( 'Search', 'voxel-fse' ) }
							context="post"
						/>

						<ResponsiveRangeControlWithDropdown
							label={ __( 'Button width', 'voxel-fse' ) }
							attributes={ attributes }
							setAttributes={ setAttributes }
							attributeBaseName="searchButtonWidth"
							min={ 0 }
							max={ 100 }
							step={ 1 }
							availableUnits={ [ '%', 'px' ] }
							unitAttributeName="searchButtonWidthUnit"
						/>
					</>
				) }

				{/* Reset Button */}
				<ToggleControl
					label={ __( 'Show Reset button', 'voxel-fse' ) }
					checked={ attributes.showResetButton ?? false }
					onChange={ ( value: boolean ) => setAttributes( { showResetButton: value } ) }
				/>

				{ attributes.showResetButton && (
					<>
						<DynamicTagTextControl
							label={ __( 'Button text', 'voxel-fse' ) }
							value={ attributes.resetButtonText || '' }
							onChange={ ( value: string ) =>
								setAttributes( { resetButtonText: value } )
							}
							placeholder={ __( 'Reset', 'voxel-fse' ) }
							context="post"
						/>

						<ResponsiveRangeControlWithDropdown
							label={ __( 'Button width', 'voxel-fse' ) }
							attributes={ attributes }
							setAttributes={ setAttributes }
							attributeBaseName="resetButtonWidth"
							min={ 0 }
							max={ 100 }
							step={ 1 }
							availableUnits={ [ '%', 'px' ] }
							unitAttributeName="resetButtonWidthUnit"
						/>
					</>
				) }
			</AccordionPanel>

			{/* ===== MAP/FEED SWITCHER SECTION ===== */}
			{ attributes.onSubmit === 'feed' && !! attributes.postToMapId && (
				<AccordionPanel id="mf-switcher" title={ __( 'Map/Feed Switcher', 'voxel-fse' ) }>
					<ToggleControl
						label={ __( 'Enable on desktop', 'voxel-fse' ) }
						checked={ attributes.mfSwitcherDesktop ?? false }
						onChange={ ( value: boolean ) => setAttributes( { mfSwitcherDesktop: value } ) }
					/>
					{ attributes.mfSwitcherDesktop && (
						<SelectControl
							label={ __( 'Visible by default', 'voxel-fse' ) }
							value={ attributes.mfSwitcherDesktopDefault || 'feed' }
							options={ [
								{ label: __( 'Feed', 'voxel-fse' ), value: 'feed' },
								{ label: __( 'Map', 'voxel-fse' ), value: 'map' },
							] }
							onChange={ ( value: string ) => setAttributes( { mfSwitcherDesktopDefault: value as 'feed' | 'map' } ) }
						/>
					) }

					<ToggleControl
						label={ __( 'Enable on tablet', 'voxel-fse' ) }
						checked={ attributes.mfSwitcherTablet ?? false }
						onChange={ ( value: boolean ) => setAttributes( { mfSwitcherTablet: value } ) }
					/>
					{ attributes.mfSwitcherTablet && (
						<SelectControl
							label={ __( 'Visible by default', 'voxel-fse' ) }
							value={ attributes.mfSwitcherTabletDefault || 'feed' }
							options={ [
								{ label: __( 'Feed', 'voxel-fse' ), value: 'feed' },
								{ label: __( 'Map', 'voxel-fse' ), value: 'map' },
							] }
							onChange={ ( value: string ) => setAttributes( { mfSwitcherTabletDefault: value as 'feed' | 'map' } ) }
						/>
					) }

					<ToggleControl
						label={ __( 'Enable on mobile', 'voxel-fse' ) }
						checked={ attributes.mfSwitcherMobile ?? false }
						onChange={ ( value: boolean ) => setAttributes( { mfSwitcherMobile: value } ) }
					/>
					{ attributes.mfSwitcherMobile && (
						<SelectControl
							label={ __( 'Visible by default', 'voxel-fse' ) }
							value={ attributes.mfSwitcherMobileDefault || 'feed' }
							options={ [
								{ label: __( 'Feed', 'voxel-fse' ), value: 'feed' },
								{ label: __( 'Map', 'voxel-fse' ), value: 'map' },
							] }
							onChange={ ( value: string ) => setAttributes( { mfSwitcherMobileDefault: value as 'feed' | 'map' } ) }
						/>
					) }
				</AccordionPanel>
			) }

			{/* ===== RESPONSIVE BEHAVIOUR SECTION ===== */}
			<AccordionPanel id="responsive" title={ __( 'Responsive behaviour', 'voxel-fse' ) }>
				<p className="voxel-fse-section-label">{ __( 'Toggle mode', 'voxel-fse' ) }</p>
				<div className="voxel-fse-toggle-list">
					<ToggleControl
						label={ __( 'Enable on desktop', 'voxel-fse' ) }
						checked={ attributes.formToggleDesktop ?? false }
						onChange={ ( value: boolean ) => setAttributes( { formToggleDesktop: value } ) }
					/>
					<ToggleControl
						label={ __( 'Enable on tablet', 'voxel-fse' ) }
						checked={ attributes.formToggleTablet ?? true }
						onChange={ ( value: boolean ) => setAttributes( { formToggleTablet: value } ) }
					/>
					<ToggleControl
						label={ __( 'Enable on mobile', 'voxel-fse' ) }
						checked={ attributes.formToggleMobile ?? true }
						onChange={ ( value: boolean ) => setAttributes( { formToggleMobile: value } ) }
					/>
				</div>
			</AccordionPanel>

			{/* ===== ICONS SECTION ===== */}
			<AccordionPanel id="icons" title={ __( 'Icons', 'voxel-fse' ) }>
				<IconPickerControl
					label={ __( 'Search icon', 'voxel-fse' ) }
					value={ attributes.searchButtonIcon }
					onChange={ ( value ) => setAttributes( { searchButtonIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Search icon (Input)', 'voxel-fse' ) }
					value={ attributes.searchInputIcon }
					onChange={ ( value ) => setAttributes( { searchInputIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Reset icon', 'voxel-fse' ) }
					value={ attributes.resetButtonIcon }
					onChange={ ( value ) => setAttributes( { resetButtonIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Filter toggle icon', 'voxel-fse' ) }
					value={ attributes.toggleIcon }
					onChange={ ( value ) => setAttributes( { toggleIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Location icon', 'voxel-fse' ) }
					value={ attributes.locationIcon }
					onChange={ ( value ) => setAttributes( { locationIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'My location icon', 'voxel-fse' ) }
					value={ attributes.myLocationIcon }
					onChange={ ( value ) => setAttributes( { myLocationIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Map view icon', 'voxel-fse' ) }
					value={ attributes.mapViewIcon }
					onChange={ ( value ) => setAttributes( { mapViewIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'List view icon', 'voxel-fse' ) }
					value={ attributes.listViewIcon }
					onChange={ ( value ) => setAttributes( { listViewIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Calendar icon', 'voxel-fse' ) }
					value={ attributes.calendarIcon }
					onChange={ ( value ) => setAttributes( { calendarIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Minus icon', 'voxel-fse' ) }
					value={ attributes.minusIcon }
					onChange={ ( value ) => setAttributes( { minusIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Plus icon', 'voxel-fse' ) }
					value={ attributes.plusIcon }
					onChange={ ( value ) => setAttributes( { plusIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Down arrow', 'voxel-fse' ) }
					value={ attributes.dropdownIcon }
					onChange={ ( value ) => setAttributes( { dropdownIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Right arrow', 'voxel-fse' ) }
					value={ attributes.rightArrowIcon }
					onChange={ ( value ) => setAttributes( { rightArrowIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Left arrow', 'voxel-fse' ) }
					value={ attributes.leftArrowIcon }
					onChange={ ( value ) => setAttributes( { leftArrowIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Close icon', 'voxel-fse' ) }
					value={ attributes.closeIcon }
					onChange={ ( value ) => setAttributes( { closeIcon: value } ) }
				/>

				<IconPickerControl
					label={ __( 'Trash icon', 'voxel-fse' ) }
					value={ attributes.trashIcon }
					onChange={ ( value ) => setAttributes( { trashIcon: value } ) }
				/>
			</AccordionPanel>
		</AccordionPanelGroup>

		{/* Visibility Rules Modal - Using shared ElementVisibilityModal */}
		{ editingRulesFilter && (
			<ElementVisibilityModal
				isOpen={ rulesModalOpen }
				onClose={ () => {
					setRulesModalOpen( false );
					setEditingRulesFilter( null );
				} }
				rules={ currentRulesFilter?.visibilityRules || [] }
				onSave={ saveVisibilityRules }
			/>
		) }
	</>
	);
}
