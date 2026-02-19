/**
 * Link Search Control Component
 *
 * Elementor-style URL control with:
 * - Post/page search autocomplete (via /wp/v2/search)
 * - Settings gear icon (open in new window, nofollow, custom attributes)
 * - Dynamic tag support (EnableTagsButton + DynamicTagBuilder)
 *
 * Evidence:
 * - Elementor pattern: Controls_Manager::URL (navbar.php:364-377)
 * - Renders: url, is_external, nofollow, custom_attributes
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DynamicTagBuilder } from '../dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

export interface LinkValue {
	url: string;
	isExternal: boolean;
	nofollow: boolean;
	customAttributes?: string;
}

export interface LinkSearchControlProps {
	label: string;
	value: LinkValue;
	onChange: (value: LinkValue) => void;
	placeholder?: string;
	enableDynamicTags?: boolean;
	dynamicTagContext?: string;
}

interface SearchResult {
	id: number;
	title: string;
	url: string;
	type: string;
	subtype: string;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
	let timeoutId: ReturnType<typeof setTimeout>;
	return ((...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	}) as T;
}

export default function LinkSearchControl({
	label,
	value,
	onChange,
	placeholder = __('https://your-link.com', 'voxel-fse'),
	enableDynamicTags = false,
	dynamicTagContext = 'post',
}: LinkSearchControlProps) {
	const [showSettings, setShowSettings] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [showDropdown, setShowDropdown] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [isTagModalOpen, setIsTagModalOpen] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Dynamic tag helpers
	const hasDynamicTags = () => {
		return typeof value.url === 'string' &&
			value.url.startsWith('@tags()') &&
			value.url.includes('@endtags()');
	};

	const getTagContent = () => {
		if (!hasDynamicTags()) return value.url || '';
		const match = value.url.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value.url;
	};

	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	const handleEnableTags = () => setIsTagModalOpen(true);
	const handleEditTags = () => setIsTagModalOpen(true);

	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange({ ...value, url: '' });
		}
	};

	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange({ ...value, url: wrapWithTags(newValue) });
		}
		setIsTagModalOpen(false);
	};

	// Search posts/pages via WP REST API
	const searchPosts = useCallback(async (term: string) => {
		if (term.length < 2) {
			setSearchResults([]);
			setShowDropdown(false);
			return;
		}

		setIsSearching(true);
		setShowDropdown(true);

		try {
			const results = (await apiFetch({
				path: `/wp/v2/search?search=${encodeURIComponent(term)}&per_page=5&_fields=id,title,url,type,subtype`,
			})) as SearchResult[];
			setSearchResults(results || []);
		} catch {
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	}, []);

	const debouncedSearch = useCallback(debounce(searchPosts, 300), [searchPosts]);

	// Handle URL input change
	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newUrl = e.target.value;
		onChange({ ...value, url: newUrl });
		debouncedSearch(newUrl);
	};

	// Handle search result selection
	const handleSelectResult = (result: SearchResult) => {
		onChange({ ...value, url: result.url });
		setSearchResults([]);
		setShowDropdown(false);
	};

	// Click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const isTagsActive = enableDynamicTags && hasDynamicTags();

	// Theme colors based on dynamic tag state
	const textColor = isTagsActive ? 'rgba(255, 255, 255, 0.6)' : 'rgb(30, 30, 30)';
	const labelColor = isTagsActive ? 'rgba(255, 255, 255, 0.6)' : '#1e1e1e';
	const helpColor = isTagsActive ? 'rgba(255, 255, 255, 0.4)' : '#757575';
	const inputBg = isTagsActive ? 'rgba(255, 255, 255, 0.1)' : '#fff';
	const inputBorder = isTagsActive ? 'rgba(255, 255, 255, 0.2)' : '#8c8f94';
	const inputColor = isTagsActive ? '#fff' : '#1e1e1e';

	return (
		<div
			ref={containerRef}
			className="vxfse-link-search-control"
			style={{
				marginBottom: '16px',
				...(isTagsActive ? {
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					padding: '12px',
				} : {}),
			}}
		>
			{/* Label row (shared for both states) */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				marginBottom: '8px',
			}}>
				{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
				<label style={{
					fontSize: '13px',
					fontWeight: 500,
					textTransform: 'capitalize',
					color: textColor,
					margin: 0,
				}}>
					{label}
				</label>
			</div>

			{/* Dynamic tags active: tag content + EDIT/DISABLE buttons */}
			{isTagsActive ? (
				<>
					<div style={{
						backgroundColor: 'rgba(0, 0, 0, 0.2)',
						borderRadius: '6px',
						padding: '10px 12px',
						marginBottom: '10px',
					}}>
						<span style={{
							color: '#fff',
							fontSize: '13px',
							fontFamily: 'inherit',
							wordBreak: 'break-all',
						}}>
							{getTagContent()}
						</span>
					</div>

					<div style={{ display: 'flex', marginBottom: '12px' }}>
						<button
							type="button"
							onClick={handleEditTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'left',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.5)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'right',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</>
			) : (
				<>
					{/* Normal state: URL input + gear button row */}
					<div style={{ position: 'relative' }}>
						<div style={{
							display: 'flex',
							alignItems: 'center',
							gap: '0',
						}}>
							<input
								ref={inputRef}
								type="text"
								value={value.url || ''}
								onChange={handleUrlChange}
								onFocus={() => {
									if (searchResults.length > 0) setShowDropdown(true);
								}}
								placeholder={placeholder}
								autoComplete="off"
								style={{
									flex: 1,
									height: '30px',
									padding: '0 8px',
									border: '1px solid #8c8f94',
									borderRadius: showSettings ? '4px 0 0 0' : '4px 0 0 4px',
									fontSize: '13px',
									boxSizing: 'border-box',
									backgroundColor: '#fff',
									outline: 'none',
								}}
							/>
							{/* Settings gear button */}
							<button
								type="button"
								onClick={() => setShowSettings(!showSettings)}
								title={__('Link Options', 'voxel-fse')}
								style={{
									width: '30px',
									height: '30px',
									minWidth: '30px',
									padding: 0,
									border: '1px solid #8c8f94',
									borderLeft: 'none',
									borderRadius: showSettings ? '0 4px 0 0' : '0 4px 4px 0',
									background: showSettings ? '#f0f0f0' : '#fff',
									cursor: 'pointer',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: showSettings ? '#1e1e1e' : '#757575',
								}}
							>
								<span
									className="dashicons dashicons-admin-generic"
									style={{ fontSize: '16px', width: '16px', height: '16px' }}
								/>
							</button>
						</div>

						{/* Autocomplete dropdown */}
						{showDropdown && (
							<div style={{
								position: 'absolute',
								top: '100%',
								left: 0,
								right: 0,
								zIndex: 1000000,
								backgroundColor: '#fff',
								border: '1px solid #ddd',
								borderTop: 'none',
								borderRadius: '0 0 4px 4px',
								boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
								maxHeight: '200px',
								overflowY: 'auto',
							}}>
								{isSearching ? (
									<div style={{ padding: '12px', textAlign: 'center', color: '#757575', fontSize: '13px' }}>
										{__('Searching...', 'voxel-fse')}
									</div>
								) : searchResults.length > 0 ? (
									<ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
										{searchResults.map((result) => (
											<li
												key={`${result.type}-${result.id}`}
												onClick={() => handleSelectResult(result)}
												style={{
													padding: '8px 12px',
													cursor: 'pointer',
													borderBottom: '1px solid #f0f0f0',
													fontSize: '13px',
													color: '#1e1e1e',
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'center',
												}}
												onMouseEnter={(e) => {
													(e.currentTarget as HTMLElement).style.backgroundColor = '#f0f0f1';
												}}
												onMouseLeave={(e) => {
													(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
												}}
											>
												<span style={{
													flex: 1,
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}>
													{result.title}
												</span>
												<span style={{
													fontSize: '11px',
													color: '#757575',
													marginLeft: '8px',
													flexShrink: 0,
													textTransform: 'capitalize',
												}}>
													{result.subtype || result.type}
												</span>
											</li>
										))}
									</ul>
								) : value.url && value.url.length >= 2 ? (
									<div style={{ padding: '12px', textAlign: 'center', color: '#757575', fontSize: '13px' }}>
										{__('No results found', 'voxel-fse')}
									</div>
								) : null}
							</div>
						)}
					</div>
				</>
			)}

			{/* Settings section — always visible below both tag panel and URL input */}
			{/* Open in new window */}
			<label style={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				marginBottom: '10px',
				marginTop: isTagsActive ? '0' : '10px',
				fontSize: '13px',
				color: labelColor,
				cursor: 'pointer',
			}}>
				<input
					type="checkbox"
					checked={value.isExternal}
					onChange={(e) => onChange({ ...value, isExternal: e.target.checked })}
					style={{ margin: 0 }}
				/>
				{__('Open in new window', 'voxel-fse')}
			</label>

			{/* Add nofollow */}
			<label style={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px',
				marginBottom: '12px',
				fontSize: '13px',
				color: labelColor,
				cursor: 'pointer',
			}}>
				<input
					type="checkbox"
					checked={value.nofollow}
					onChange={(e) => onChange({ ...value, nofollow: e.target.checked })}
					style={{ margin: 0 }}
				/>
				{__('Add nofollow', 'voxel-fse')}
			</label>

			{/* Custom Attributes */}
			<div>
				<label style={{
					display: 'block',
					fontSize: '13px',
					fontWeight: 500,
					color: labelColor,
					marginBottom: '4px',
				}}>
					{__('Custom Attributes', 'voxel-fse')}
				</label>
				<input
					type="text"
					value={value.customAttributes || ''}
					onChange={(e) => onChange({ ...value, customAttributes: e.target.value })}
					placeholder="key|value"
					style={{
						width: '100%',
						height: '30px',
						padding: '0 8px',
						border: `1px solid ${inputBorder}`,
						borderRadius: '4px',
						fontSize: '13px',
						boxSizing: 'border-box',
						backgroundColor: inputBg,
						color: inputColor,
					}}
				/>
				<p style={{
					margin: '4px 0 0',
					fontSize: '12px',
					color: helpColor,
					lineHeight: '1.4',
				}}>
					{__('Set custom attributes for the link element. Separate attribute keys from values using the | (pipe) character. Separate key-value pairs with a comma.', 'voxel-fse')}
				</p>
			</div>

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isTagModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={dynamicTagContext}
					onClose={() => setIsTagModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}
