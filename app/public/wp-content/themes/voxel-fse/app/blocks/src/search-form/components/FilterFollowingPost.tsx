/**
 * FilterFollowingPost Component
 *
 * Filter posts that follow a specific post.
 * This is used for social-style "following" relationships between posts.
 *
 * Evidence: themes/voxel/templates/widgets/search-form/following-post-filter.php
 * Reference: voxel-search-form.beautified.js lines 1632-1647
 *
 * 1:1 VOXEL PARITY:
 * - The PHP controller calls $filter->set_value() before $filter->frontend_props()
 * - filterData.value contains the post ID being followed
 * - filterData.props.post contains post data (title) if value is set
 *
 * Voxel HTML structure:
 * <div class="ts-form-group">
 *   <label>Following Post</label>
 *   <div class="ts-filter ts-popup-target ts-filled">
 *     <span></span>
 *     <div class="ts-filter-text">Post Title</div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect } from 'react';
import type { FilterComponentProps } from '../types';
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles } from '@shared';

interface FollowingPostValue {
	id?: number;
	title?: string;
}

interface PostData {
	title?: string;
	thumbnail?: string;
}

export default function FilterFollowingPost({
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState<Array<{ id: number; title: string }>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const props = filterData.props || {};
	const placeholder = props.placeholder || filterData.label || 'Following Post';
	// Post data from PHP frontend_props() - populated when set_value() was called
	const propsPostData = props.post as PostData | undefined;

	// Get filter icon from API data (HTML markup) or fallback
	const filterIcon = filterData.icon || '';

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const term = e.target.value;
		setSearchTerm(term);

		if (term.length >= 2) {
			setIsLoading(true);
			// In a real implementation, this would search posts via REST API
			// Matching Voxel's pattern for post search
			setTimeout(() => {
				setResults([]);
				setIsLoading(false);
			}, 300);
		} else {
			setResults([]);
		}
	};

	const handleSelect = (id: number, title: string) => {
		onChange({ id, title });
		setIsOpen(false);
		setSearchTerm('');
	};

	const toggleOpen = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsOpen(!isOpen);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	// Determine effective value using 1:1 Voxel parity approach
	// Priority:
	// 1. State value (from user interaction or clearAll) - if explicitly set
	// 2. filterData.value from PHP (set via set_value() before frontend_props())
	let effectiveValue: number | null = null;

	if (value !== undefined) {
		// State has been set - could be a value or null (from clearAll)
		const stateValue = value as FollowingPostValue | number | null;
		if (stateValue === null) {
			effectiveValue = null;
		} else if (typeof stateValue === 'number') {
			effectiveValue = stateValue;
		} else if (typeof stateValue === 'object' && stateValue?.id) {
			effectiveValue = stateValue.id;
		}
	} else if (filterData.value !== null && filterData.value !== undefined) {
		// Use filterData.value from PHP (1:1 Voxel parity)
		effectiveValue = typeof filterData.value === 'number' ? filterData.value : Number(filterData.value);
	}

	const hasValue = effectiveValue !== null && !isNaN(effectiveValue) && effectiveValue > 0;

	// Get display name from props.post (PHP) or state value
	let displayValue = placeholder;
	if (hasValue) {
		// Priority 1: State value with title (user selected)
		const stateValue = value as FollowingPostValue | null;
		if (stateValue && typeof stateValue === 'object' && stateValue.title) {
			displayValue = stateValue.title;
		}
		// Priority 2: PHP props.post data (from frontend_props)
		else if (propsPostData?.title) {
			displayValue = propsPostData.title;
		}
	}

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
	const popupStyles = getPopupStyles(config);

	return (
		<div className={className} style={style} ref={containerRef}>
			{!config.hideLabel && <label>{filterData.label}</label>}
			<div
				className={`ts-filter ts-popup-target ${hasValue ? 'ts-filled' : ''}`}
				onClick={toggleOpen}
				onMouseDown={(e) => e.preventDefault()}
				role="button"
				tabIndex={0}
			>
				{/* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */}
				{filterIcon && (
					<span dangerouslySetInnerHTML={{ __html: filterIcon }} />
				)}
				<div className="ts-filter-text">{displayValue}</div>
				<div className="ts-down-icon"></div>
			</div>

			{/* Voxel dropdown structure */}
			{isOpen && (
				<div className="ts-field-popup-container">
					<div className={popupStyles.className} style={popupStyles.style}>
						<div className="ts-popup-content-wrapper min-scroll">
							<div className="ts-form-group">
								<div className="flexify ts-input-icon">
									<span>{VoxelIcons.search}</span>
									<input
										type="text"
										className="inline-input"
										value={searchTerm}
										onChange={handleSearch}
										placeholder="Search posts..."
									/>
								</div>
							</div>

							{isLoading ? (
								<div className="ts-loading">
									<span className="ts-loader"></span>
								</div>
							) : results.length > 0 ? (
								<div className="ts-term-dropdown">
									<ul className="simplify-ul ts-term-dropdown-list">
										{results.map((item) => (
											<li key={item.id}>
												<a
													href="#"
													className="flexify"
													onClick={(e) => {
														e.preventDefault();
														handleSelect(item.id, item.title);
													}}
												>
													<span>{item.title}</span>
												</a>
											</li>
										))}
									</ul>
								</div>
							) : searchTerm.length >= 2 ? (
								<div className="ts-empty-user-list">
									<span>No posts found</span>
								</div>
							) : null}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
