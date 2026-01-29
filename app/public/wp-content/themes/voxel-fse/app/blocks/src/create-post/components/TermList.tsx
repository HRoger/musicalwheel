/**
 * TermList Component - Hierarchical Term Navigation
 *
 * Recursive component for displaying taxonomy terms in a hierarchical structure
 * with parent/child navigation and pagination.
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/taxonomy-field.php:128-202
 *
 * Features:
 * - Recursive term display with children
 * - "Go back" navigation for parent levels
 * - Parent term display (selectable)
 * - Right arrow for terms with children
 * - Pagination (10 terms per page with "Load more")
 * - Icon rendering for each term
 * - Selection state visualization (ts-selected class)
 *
 * Evidence-based implementation matching Voxel's exact structure
 */
import React, { useState, useCallback } from 'react';

interface Term {
	id: number;
	slug: string;
	label: string;
	icon?: string;
	parent: number;
	children?: Term[];
}

interface TermListProps {
	terms: Term[];
	value: { [slug: string]: boolean };
	multiple: boolean;
	onSelectTerm: (term: Term) => void;
	activeList: string;
	setActiveList: (listKey: string) => void;
	parentTerm?: Term;
	previousList?: string;
	listKey: string;
}

// Items per page for pagination
const PER_PAGE = 10;

export const TermList: React.FC<TermListProps> = ({
	terms,
	value,
	multiple,
	onSelectTerm,
	activeList,
	setActiveList,
	parentTerm,
	previousList,
	listKey
}) => {
	const [page, setPage] = useState(1);

	// Check if term has selection (itself or any children)
	const hasSelection = useCallback((term: Term): boolean => {
		if (value[term.slug]) return true;
		if (term.children && term.children.length > 0) {
			return term.children.some(hasSelection);
		}
		return false;
	}, [value]);

	// Navigate to child term list
	const selectTerm = useCallback((term: Term) => {
		if (term.children && term.children.length > 0) {
			setActiveList(`terms_${term.id}`);
		} else {
			onSelectTerm(term);
		}
	}, [onSelectTerm, setActiveList]);

	// Go back to previous list
	const goBack = useCallback(() => {
		if (previousList) {
			setActiveList(previousList);
		}
	}, [previousList, setActiveList]);

	// Filter terms with children for recursive rendering
	const termsWithChildren = terms.filter(term => term.children && term.children.length > 0);

	// Only render if this is the active list
	if (activeList !== listKey) {
		return (
			<>
				{/* Recursively render child term lists */}
				{termsWithChildren.map(term => (
					<TermList
						key={`terms_${term.id}`}
						terms={term.children || []}
						value={value}
						multiple={multiple}
						onSelectTerm={onSelectTerm}
						activeList={activeList}
						setActiveList={setActiveList}
						parentTerm={term}
						previousList={listKey}
						listKey={`terms_${term.id}`}
					/>
				))}
			</>
		);
	}

	// EXACT Voxel: themes/voxel/templates/widgets/create-post/taxonomy-field.php:128-202
	return (
		<>
			<ul className="simplify-ul ts-term-dropdown-list">
				{/* "Go back" button - only show if not at top level */}
				{/* Evidence: taxonomy-field.php:136-141 */}
				{listKey !== 'toplevel' && (
					<li className="ts-term-centered">
						<a href="#" className="flexify" onClick={(e) => {
							e.preventDefault();
							goBack();
						}}>
							<div className="ts-left-icon"></div>
							<span>Go back</span>
						</a>
					</li>
				)}

				{/* Parent term (selectable) - Evidence: taxonomy-field.php:143-162 */}
				{parentTerm && (
					<li className="ts-parent-item">
						<a href="#" className="flexify" onClick={(e) => {
							e.preventDefault();
							onSelectTerm(parentTerm);
						}}>
							<div className="ts-checkbox-container">
								<label className={multiple ? 'container-checkbox' : 'container-radio'}>
									<input
										type={multiple ? 'checkbox' : 'radio'}
										value={parentTerm.slug}
										checked={!!value[parentTerm.slug]}
										disabled
										hidden
									/>
									<span className="checkmark"></span>
								</label>
							</div>
							<span>{parentTerm.label}</span>
							<div className="ts-term-icon">
								<span dangerouslySetInnerHTML={{ __html: parentTerm.icon || '' }} />
							</div>
						</a>
					</li>
				)}

				{/* Term list with pagination - Evidence: taxonomy-field.php:163-185 */}
				{terms.slice(0, page * PER_PAGE).map((term) => (
					<li
						key={term.slug}
						className={
							value[term.slug] || hasSelection(term)
								? 'ts-selected'
								: ''
						}
					>
						<a href="#" className="flexify" onClick={(e) => {
							e.preventDefault();
							selectTerm(term);
						}}>
							<div className="ts-checkbox-container">
								<label className={multiple ? 'container-checkbox' : 'container-radio'}>
									<input
										type={multiple ? 'checkbox' : 'radio'}
										value={term.slug}
										checked={!!value[term.slug]}
										disabled
										hidden
									/>
									<span className="checkmark"></span>
								</label>
							</div>
							<span>{term.label}</span>

							{/* Right arrow icon if term has children */}
							{/* Evidence: taxonomy-field.php:179 */}
							{term.children && term.children.length > 0 && (
								<div className="ts-right-icon"></div>
							)}

							{/* Term icon */}
							<div className="ts-term-icon">
								<span dangerouslySetInnerHTML={{ __html: term.icon || '' }} />
							</div>
						</a>
					</li>
				))}

				{/* "Load more" button if more terms exist */}
				{/* Evidence: taxonomy-field.php:186-191 */}
				{(page * PER_PAGE) < terms.length && (
					<li className="ts-term-centered">
						<a href="#" onClick={(e) => {
							e.preventDefault();
							setPage(page + 1);
						}} className="flexify">
							<div className="ts-term-icon">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
								</svg>
							</div>
							<span>Load more</span>
						</a>
					</li>
				)}
			</ul>

			{/* Recursively render child term lists */}
			{/* Evidence: taxonomy-field.php:194-201 */}
			{termsWithChildren.map(term => (
				<TermList
					key={`terms_${term.id}`}
					terms={term.children || []}
					value={value}
					multiple={multiple}
					onSelectTerm={onSelectTerm}
					activeList={activeList}
					setActiveList={setActiveList}
					parentTerm={term}
					previousList={listKey}
					listKey={`terms_${term.id}`}
				/>
			))}
		</>
	);
};

export default TermList;
