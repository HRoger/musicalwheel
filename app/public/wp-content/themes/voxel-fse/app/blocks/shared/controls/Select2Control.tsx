/**
 * Select2 Control
 *
 * Reusable Select2-style single-select dropdown with:
 * - Grouped options with visual separators
 * - Lazy loading via onFetch callback
 * - Searchable/filterable dropdown
 * - Optional dynamic tag support
 *
 * Based on TagMultiSelect.tsx pattern.
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress components types are incomplete
import { useState, useEffect, useRef, useCallback } from 'react';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DynamicTagBuilder } from '../dynamic-tags';

// Types
export interface Select2Option {
	id: string;
	title: string;
	type?: string;
}

export interface Select2Group {
	label: string;
	type: string;
	items: Select2Option[];
}

export interface Select2ControlProps {
	/** Control label */
	label: string;
	/** Current value (option id or dynamic tag expression) */
	value: string;
	/** Change handler */
	onChange: (value: string) => void;
	/** Placeholder text when no selection */
	placeholder?: string;
	/** Static groups to display (if not using onFetch) */
	groups?: Select2Group[];
	/** Async function to fetch groups (for lazy loading) */
	onFetch?: () => Promise<Select2Group[]>;
	/** Function to fetch single option by ID (for initial load) */
	onFetchSingle?: (id: string) => Promise<Select2Option | null>;
	/** Enable dynamic tag support */
	enableDynamicTags?: boolean;
	/** Context for dynamic tag builder */
	context?: string;
	/** Custom empty message */
	emptyMessage?: string;
	/** Filter placeholder */
	filterPlaceholder?: string;
}

export default function Select2Control({
	label,
	value,
	onChange,
	placeholder = __('Select...', 'voxel-fse'),
	groups: staticGroups,
	onFetch,
	onFetchSingle,
	enableDynamicTags = false,
	context = 'post',
	emptyMessage = __('No options found', 'voxel-fse'),
	filterPlaceholder = __('Filter...', 'voxel-fse'),
}: Select2ControlProps) {
	// Dropdown state
	const [isOpen, setIsOpen] = useState(false);
	const [filterTerm, setFilterTerm] = useState('');
	const [groups, setGroups] = useState<Select2Group[]>(staticGroups || []);
	const [isLoading, setIsLoading] = useState(false);
	const [hasLoaded, setHasLoaded] = useState(!onFetch); // If no onFetch, consider loaded

	// Selected option state
	const [selectedOption, setSelectedOption] = useState<Select2Option | null>(null);

	// Dynamic tag modal state
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Refs
	const containerRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Check if value contains dynamic tags
	const hasDynamicTags = enableDynamicTags && typeof value === 'string' && value.startsWith('@tags()');

	// Extract tag content (without @tags() wrapper)
	const getTagContent = useCallback(() => {
		if (!hasDynamicTags) return value || '';
		const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value;
	}, [hasDynamicTags, value]);

	// Load selected option on mount or when value changes
	useEffect(() => {
		if (!value || hasDynamicTags) {
			setSelectedOption(null);
			return;
		}

		// If we have groups loaded, find the option
		if (groups.length > 0) {
			for (const group of groups) {
				const found = group.items.find((item) => item.id === value);
				if (found) {
					setSelectedOption(found);
					return;
				}
			}
		}

		// Otherwise, use onFetchSingle if provided
		if (onFetchSingle) {
			onFetchSingle(value).then((option) => {
				setSelectedOption(option);
			});
		}
	}, [value, hasDynamicTags, groups, onFetchSingle]);

	// Lazy load groups when dropdown opens
	useEffect(() => {
		if (isOpen && !hasLoaded && !isLoading && onFetch) {
			setIsLoading(true);
			onFetch().then((fetchedGroups) => {
				setGroups(fetchedGroups);
				setHasLoaded(true);
				setIsLoading(false);
			});
		}
	}, [isOpen, hasLoaded, isLoading, onFetch]);

	// Update groups if staticGroups prop changes
	useEffect(() => {
		if (staticGroups) {
			setGroups(staticGroups);
		}
	}, [staticGroups]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setFilterTerm('');
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Position dropdown
	useEffect(() => {
		if (!isOpen || !dropdownRef.current || !containerRef.current) {
			return;
		}

		const updatePosition = () => {
			if (!dropdownRef.current || !containerRef.current) {
				return;
			}
			const rect = containerRef.current.getBoundingClientRect();
			const dropdown = dropdownRef.current;
			const dropdownHeight = dropdown.offsetHeight;
			const viewportHeight = window.innerHeight;

			// Position below the container
			let top = rect.bottom + 1;

			// If not enough space below, position above
			if (top + dropdownHeight > viewportHeight - 8) {
				top = rect.top - dropdownHeight - 1;
			}

			dropdown.style.top = `${top}px`;
			dropdown.style.left = `${rect.left}px`;
			dropdown.style.width = `${rect.width}px`;
		};

		updatePosition();

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
		};
	}, [isOpen]);

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	// Handle option selection
	const handleSelect = (option: Select2Option) => {
		onChange(String(option.id));
		setSelectedOption(option);
		setIsOpen(false);
		setFilterTerm('');
	};

	// Clear selection
	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange('');
		setSelectedOption(null);
	};

	// Enable dynamic tags
	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	// Disable dynamic tags
	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange('');
		}
	};

	// Save dynamic tag
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange(`@tags()${newValue}@endtags()`);
		}
		setIsModalOpen(false);
	};

	// Toggle dropdown
	const handleToggleDropdown = () => {
		if (!hasDynamicTags) {
			setIsOpen(!isOpen);
		}
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			setIsOpen(false);
			setFilterTerm('');
		}
	};

	// Filter options by search term
	const getFilteredGroups = () => {
		if (!filterTerm.trim()) {
			return groups;
		}

		const lowerFilter = filterTerm.toLowerCase();
		return groups.map((group) => ({
			...group,
			items: group.items.filter((item) =>
				item.title.toLowerCase().includes(lowerFilter)
			),
		}));
	};

	const filteredGroups = getFilteredGroups();

	return (
		<div
			ref={containerRef}
			className="vxfse-select2-wrap select2-container select2-container--default"
			style={{ marginBottom: '16px' }}
		>
			{/* Label with optional Dynamic Tag button */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
				}}
			>
				<label
					className="components-base-control__label"
					style={{
						fontWeight: 500,
						fontSize: '13px',
						margin: 0,
					}}
				>
					{label}
				</label>

				{/* Dynamic tag icon button (only if enabled) */}
				{enableDynamicTags && (
					<button
						type="button"
						onClick={handleEnableTags}
						style={{
							background: 'transparent',
							border: 'none',
							cursor: 'pointer',
							padding: '4px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						title={__('Insert dynamic tags', 'voxel-fse')}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
							style={{ color: '#646970' }}
						>
							<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
						</svg>
					</button>
				)}
			</div>

			{/* Control input wrapper */}
			{hasDynamicTags ? (
				/* Dynamic tag mode - matches Voxel's edit-voxel-tags panel */
				<div
					className="edit-voxel-tags"
					style={{
						border: '1px solid #dcdcdc',
						borderRadius: '3px',
						padding: '12px',
						backgroundColor: '#f9f9f9',
					}}
				>
					{/* Tag content preview */}
					<div style={{ marginBottom: '12px' }}>
						<div
							style={{
								fontSize: '13px',
								color: 'rgb(30, 30, 30)',
								marginBottom: '4px',
								textTransform: 'capitalize',
								fontWeight: 500,
							}}
						>
							{label}
						</div>
						<div
							style={{
								padding: '6px 8px',
								backgroundColor: '#fff',
								border: '1px solid #dcdcdc',
								borderRadius: '2px',
								fontFamily: 'Consolas, Monaco, monospace',
								fontSize: '12px',
								wordBreak: 'break-all',
								color: '#2271b1',
							}}
						>
							{getTagContent()}
						</div>
					</div>

					{/* Action buttons */}
					<div style={{ display: 'flex', gap: '8px' }}>
						<button
							type="button"
							className="components-button is-secondary"
							onClick={() => setIsModalOpen(true)}
							style={{ flex: 1, fontSize: '11px', height: '30px' }}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							className="components-button is-link"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								color: '#d63638',
								fontSize: '11px',
								height: '30px',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				/* Select2-style dropdown trigger */
				<span
					className={`select2-selection select2-selection--single ${isOpen ? 'select2-selection--focus' : ''}`}
					onClick={handleToggleDropdown}
					role="combobox"
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						minHeight: '36px',
						padding: '0 12px',
						cursor: 'pointer',
						border: '1px solid #8c8f94',
						borderRadius: '4px',
						backgroundColor: '#fff',
					}}
				>
					{selectedOption ? (
						<span
							className="select2-selection__rendered"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								width: '100%',
							}}
						>
							<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
								{selectedOption.title}
							</span>
							<button
								type="button"
								onClick={handleClear}
								style={{
									background: 'none',
									border: 'none',
									color: '#d63638',
									cursor: 'pointer',
									fontSize: '16px',
									padding: '0 4px',
									marginLeft: '8px',
									lineHeight: 1,
								}}
								title={__('Clear selection', 'voxel-fse')}
							>
								×
							</button>
						</span>
					) : (
						<span
							className="select2-selection__placeholder"
							style={{ color: '#757575' }}
						>
							{placeholder}
						</span>
					)}
					<span
						className="select2-selection__arrow"
						style={{
							marginLeft: '8px',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<b role="presentation" style={{
							borderColor: '#888 transparent transparent',
							borderStyle: 'solid',
							borderWidth: '5px 4px 0',
							height: 0,
							width: 0,
						}}></b>
					</span>
				</span>
			)}

			{/* Dropdown */}
			{isOpen && (
				<div
					ref={dropdownRef}
					className="vxfse-select2-dropdown select2-dropdown select2-dropdown--below"
					style={{
						position: 'fixed',
						zIndex: 1000000,
						backgroundColor: '#fff',
						border: '1px solid #aaa',
						borderRadius: '0 0 4px 4px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
					}}
				>
					{/* Filter input */}
					<span
						className="select2-search select2-search--dropdown"
						style={{
							display: 'block',
							padding: '4px',
							borderBottom: '1px solid #ddd',
						}}
					>
						<input
							ref={searchInputRef}
							type="search"
							className="select2-search__field"
							placeholder={filterPlaceholder}
							value={filterTerm}
							onChange={(e) => setFilterTerm(e.target.value)}
							onKeyDown={handleKeyDown}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							style={{
								width: '100%',
								padding: '8px',
								border: '1px solid #ddd',
								borderRadius: '3px',
								fontSize: '13px',
								boxSizing: 'border-box',
							}}
						/>
					</span>

					{/* Results */}
					<span className="select2-results" style={{ display: 'block', maxHeight: '300px', overflowY: 'auto' }}>
						{isLoading ? (
							<div style={{ padding: '16px', textAlign: 'center' }}>
								<Spinner />
							</div>
						) : (
							<ul className="select2-results__options" role="listbox" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
								{filteredGroups.map((group) => {
									// Skip empty groups
									if (group.items.length === 0) return null;

									return (
										<li key={group.type}>
											{/* Group header */}
											<strong
												className="select2-results__option--group"
												style={{
													display: 'block',
													padding: '8px 12px',
													fontSize: '11px',
													fontWeight: 600,
													color: '#646970',
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
													backgroundColor: '#f5f5f5',
													borderBottom: '1px solid #eee',
												}}
											>
												{group.label}
											</strong>
											{/* Group items */}
											<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
												{group.items.map((item) => {
													const isSelected = value === item.id;
													return (
														<li
															key={item.id}
															className={`select2-results__option ${isSelected ? 'select2-results__option--selected' : ''}`}
															role="option"
															aria-selected={isSelected}
															onClick={() => handleSelect(item)}
															style={{
																padding: '8px 12px',
																cursor: 'pointer',
																backgroundColor: isSelected ? '#ddd' : 'transparent',
																borderBottom: '1px solid #f0f0f0',
															}}
															onMouseEnter={(e) => {
																if (!isSelected) {
																	(e.target as HTMLElement).style.backgroundColor = '#f0f0f0';
																}
															}}
															onMouseLeave={(e) => {
																if (!isSelected) {
																	(e.target as HTMLElement).style.backgroundColor = 'transparent';
																}
															}}
														>
															{item.title}
														</li>
													);
												})}
											</ul>
										</li>
									);
								})}

								{/* No results message */}
								{filteredGroups.every((g) => g.items.length === 0) && (
									<li
										className="select2-results__option select2-results__message"
										style={{
											padding: '12px',
											color: '#646970',
											textAlign: 'center',
										}}
									>
										{emptyMessage}
									</li>
								)}
							</ul>
						)}
					</span>
				</div>
			)}

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={context}
					onClose={() => setIsModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}
