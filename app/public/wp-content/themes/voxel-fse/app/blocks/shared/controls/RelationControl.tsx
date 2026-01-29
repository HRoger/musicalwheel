/**
 * RelationControl Component
 *
 * Matches Voxel's Elementor `voxel-relation` control for linking blocks together.
 * Shows target blocks as styled items with eye icon (preview) and check icon (selected).
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

import './RelationControl.css';

/**
 * Represents a block that can be linked to
 */
export interface RelationItem {
	id: string;
	clientId: string;
	label?: string;
}

export interface RelationControlProps {
	label: string;
	items: RelationItem[];
	selectedId: string | null | undefined;
	onSelect: ( id: string | null ) => void;
	widgetType: string;
	description?: string;
}

/**
 * RelationControl - Voxel-style widget linking control
 *
 * Matches Voxel's Elementor relation control with:
 * - Items styled as `<WidgetType #id>`
 * - Gradient background when selected
 * - Eye icon for scroll-to-widget preview
 * - Check icon when selected
 * - Hover highlighting on target block
 * - "Apply changes" button with feedback
 *
 * @example
 * <RelationControl
 *   label="Link to search form"
 *   items={searchFormBlocks.map(b => ({ id: b.clientId, clientId: b.clientId }))}
 *   selectedId={attributes.searchFormId}
 *   onSelect={(id) => setAttributes({ searchFormId: id })}
 *   widgetType="SearchForm"
 * />
 */
export default function RelationControl( {
	label,
	items,
	selectedId,
	onSelect,
	widgetType,
	description,
}: RelationControlProps ): JSX.Element {
	const [ appliedState, setAppliedState ] = useState< 'idle' | 'applied' >( 'idle' );
	const [ highlightedId, setHighlightedId ] = useState< string | null >( null );

	// Get the select block action
	const { selectBlock } = useDispatch( 'core/block-editor' );

	// Handle item click (selection toggle)
	const handleItemClick = useCallback( ( itemId: string ) => {
		if ( selectedId === itemId ) {
			// Deselect
			onSelect( null );
		} else {
			// Select
			onSelect( itemId );
		}

		// Show "Applied" feedback
		setAppliedState( 'applied' );
		setTimeout( () => {
			setAppliedState( 'idle' );
		}, 1500 );
	}, [ selectedId, onSelect ] );

	// Handle eye icon click - scroll to block in editor
	const handleViewClick = useCallback( ( e: React.MouseEvent, item: RelationItem ) => {
		e.stopPropagation();

		// Find the block element in the editor
		const blockElement = document.querySelector(
			`[data-block="${ item.clientId }"]`
		);

		if ( blockElement ) {
			// Scroll the block into view
			blockElement.scrollIntoView( {
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest',
			} );

			// Select the block to highlight it
			selectBlock( item.clientId );
		}
	}, [ selectBlock ] );

	// Handle hover - add highlight class to target block
	const handleMouseEnter = useCallback( ( item: RelationItem ) => {
		setHighlightedId( item.clientId );

		const blockElement = document.querySelector(
			`[data-block="${ item.clientId }"]`
		);
		if ( blockElement ) {
			blockElement.classList.add( 'voxel-highlight-element' );
		}
	}, [] );

	// Handle mouse leave - remove highlight class
	const handleMouseLeave = useCallback( ( item: RelationItem ) => {
		setHighlightedId( null );

		const blockElement = document.querySelector(
			`[data-block="${ item.clientId }"]`
		);
		if ( blockElement ) {
			blockElement.classList.remove( 'voxel-highlight-element' );
		}
	}, [] );

	// Cleanup highlight on unmount
	useEffect( () => {
		return () => {
			// Remove all highlight classes when component unmounts
			document.querySelectorAll( '.voxel-highlight-element' ).forEach( ( el ) => {
				el.classList.remove( 'voxel-highlight-element' );
			} );
		};
	}, [] );

	// Format the item ID for display (short hash)
	const formatId = ( id: string ): string => {
		if ( id.length > 7 ) {
			return id.substring( 0, 7 );
		}
		return id;
	};

	return (
		<div className="vxfse-relation-control">
			{ label && (
				<label className="vxfse-relation-label">{ label }</label>
			) }

			<div className="vx-relation-list">
				{ items.length === 0 ? (
					<div className="relation-item relation-item--empty">
						{ __( 'No', 'voxel-fse' ) } &lt;{ widgetType }&gt; { __( 'widgets found.', 'voxel-fse' ) }
					</div>
				) : (
					items.map( ( item ) => {
						const isSelected = selectedId === item.id;
						const displayId = item.label || formatId( item.id );

						return (
							<div
								key={ item.id }
								className={ `relation-item ${ isSelected ? 'selected' : '' }` }
								onClick={ () => handleItemClick( item.id ) }
								onMouseEnter={ () => handleMouseEnter( item ) }
								onMouseLeave={ () => handleMouseLeave( item ) }
								role="button"
								tabIndex={ 0 }
								onKeyDown={ ( e ) => {
									if ( e.key === 'Enter' || e.key === ' ' ) {
										handleItemClick( item.id );
									}
								} }
							>
								<span className="relation-item__label">
									&lt;{ widgetType } <code>#{ displayId }</code>&gt;
								</span>
								<span
									className="eicon eicon-check check-icon"
									aria-hidden="true"
								/>
								<span
									className="eicon eicon-eye view-icon"
									aria-hidden="true"
									onClick={ ( e ) => handleViewClick( e, item ) }
									onKeyDown={ ( e ) => {
										if ( e.key === 'Enter' || e.key === ' ' ) {
											handleViewClick( e as unknown as React.MouseEvent, item );
										}
									} }
									role="button"
									tabIndex={ 0 }
									title={ __( 'Scroll to widget', 'voxel-fse' ) }
								/>
							</div>
						);
					} )
				) }
			</div>

			<Button
				variant="primary"
				className="vxfse-relation-apply-btn"
				disabled={ appliedState === 'applied' }
			>
				{ appliedState === 'applied'
					? __( 'Applied', 'voxel-fse' )
					: __( 'Apply changes', 'voxel-fse' )
				}
			</Button>

			{ description && (
				<p className="vxfse-relation-description">{ description }</p>
			) }
		</div>
	);
}

// Export types
export type { RelationItem, RelationControlProps };
