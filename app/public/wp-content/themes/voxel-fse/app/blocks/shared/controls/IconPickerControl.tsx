/**
 * Icon Picker Control Component
 *
 * Matches Elementor's icon control pattern with three options:
 * - None: Clears icon value
 * - Upload SVG: Opens WordPress media library (SVG only)
 * - Icon Library: Opens Voxel's icon picker modal (matches Voxel's Vue component structure)
 *
 * Plus Dynamic Tag support:
 * - Pink Voxel button trigger to enable dynamic tags
 * - When active, shows tag preview with EDIT/DISABLE buttons
 *
 * Evidence:
 * - Elementor pattern: app/public/wp-content/themes/voxel/app/widgets/create-post.php:84-383
 * - Voxel icon picker template: app/public/wp-content/themes/voxel/templates/backend/icon-picker.php
 * - Voxel CSS classes: icons-modal, ts-theme-options, inner-tab, vertical-tabs, icon-list, single-icon
 * - Dynamic tag pattern: DynamicTagTextControl.tsx
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DynamicTagBuilder } from '../dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

/**
 * Icon Pack Configuration from Voxel
 * Structure follows themes/voxel/templates/backend/icon-picker.php
 */
interface IconPackConfig {
	label: string;
	family: string;
	fetchJson?: string;
	icons?: string[];
	// Fields used for icon class generation
	displayPrefix?: string;
	prefix?: string;
	list?: string[];
}

// WordPress media types
declare global {
	interface Window {
		Voxel_Icon_Picker_Config?: Record<string, IconPackConfig>;
		Vue?: unknown; // Third-party Vue library - unused, just checking existence
	}
}

/**
 * WordPress Media Selection object
 */
// @ts-ignore -- used via wp.media API
interface MediaSelection {
	first: () => {
		toJSON: () => MediaAttachment;
	};
}

interface MediaAttachment {
	id: number;
	url: string;
	filename?: string;
	title?: string;
	mime?: string;
}

import { IconValue } from '../types';

export type { IconValue };

interface IconPickerControlProps {
	label: string;
	value?: IconValue;
	onChange: (value: IconValue) => void;
	/** Enable Dynamic Tag Builder support (pink Voxel button) */
	supportsDynamicTags?: boolean;
	/** Context for Dynamic Tag Builder (post, user, term, site) */
	dynamicTagContext?: string;
	/**
	 * When true, displays the selected icon in the Icon Library button instead of the placeholder.
	 * Use this when the control has a pre-selected default icon value.
	 * Default: false (shows eicon-circle placeholder when no user interaction has occurred)
	 */
	showSelectedIcon?: boolean;
}

export const IconPickerControl: React.FC<IconPickerControlProps> = ({
	label,
	value,
	onChange,
	supportsDynamicTags = true, // Default to enabled
	dynamicTagContext = 'post',
	showSelectedIcon = false, // Default: show placeholder, not selected icon
}) => {
	// Normalize null/undefined values to empty icon
	// Also handle case where object exists but has undefined properties
	const normalizedValue: IconValue = {
		library: value?.library || '',
		value: value?.value || '',
	};

	// Check if library is an icon library type (not SVG, not empty, not dynamic)
	// Icon libraries include: 'icon', 'line-awesome', 'font-awesome', etc.
	const isIconLibrary = (lib: string): boolean => {
		if (!lib) return false;
		// These are special types that are NOT icon libraries
		const nonIconTypes = ['', 'svg', 'dynamic'];
		return !nonIconTypes.includes(lib);
	};
	const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
	const [iconLists, setIconLists] = useState<Record<string, string[]>>({});
	const [loadingIcons, setLoadingIcons] = useState<Record<string, boolean>>({});
	const [activePackKey, setActivePackKey] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<Record<string, string[]>>({});
	const iconPickerRef = useRef<HTMLDivElement>(null);

	// Dynamic Tag Builder state
	const [isDynamicTagModalOpen, setIsDynamicTagModalOpen] = useState(false);

	// Check if value contains dynamic tags (wrapped with @tags())
	const hasDynamicTags = () => {
		const val = normalizedValue.value;
		return typeof val === 'string' && val.startsWith('@tags()') && val.includes('@endtags()');
	};

	// Extract the tag content (remove @tags() wrapper)
	const getTagContent = () => {
		if (!hasDynamicTags()) return normalizedValue.value || '';
		const match = normalizedValue.value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : normalizedValue.value;
	};

	// Wrap content with @tags() markers
	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	// Enable/Edit dynamic tags - open modal
	const handleEnableTags = () => {
		setIsDynamicTagModalOpen(true);
	};

	// Disable tags - clear the value
	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange({ library: '', value: '' });
		}
	};

	// Handle modal save
	const handleDynamicTagSave = (newValue: string) => {
		if (newValue) {
			// Store dynamic tag with library='dynamic' and wrapped value
			onChange({
				library: 'dynamic',
				value: wrapWithTags(newValue),
			});
		}
		setIsDynamicTagModalOpen(false);
	};

	const isTagsActive = hasDynamicTags();

	// Check if wp.media is available
	const hasWpMedia = typeof window !== 'undefined' && (window as any).wp && (window as any).wp.media;

	// Initialize active pack when config is available
	useEffect(() => {
		if (isIconPickerOpen && window.Voxel_Icon_Picker_Config && !activePackKey) {
			const config = window.Voxel_Icon_Picker_Config;
			const firstPackKey = Object.keys(config)[0];
			if (firstPackKey) {
				setActivePackKey(firstPackKey);
			}
		}
	}, [isIconPickerOpen, activePackKey]);

	// Handle None button - clear icon
	const handleNone = useCallback(() => {
		onChange({ library: '', value: '' });
	}, [onChange]);

	// Handle Upload SVG button - open media library
	const handleUploadSVG = useCallback(() => {
		if (!hasWpMedia || !(window as any).wp?.media) {
			console.warn('WordPress media library not available');
			return;
		}

		const frame = (window as any).wp.media({
			title: __('Select SVG Icon', 'voxel-fse'),
			button: {
				text: __('Select', 'voxel-fse'),
			},
			multiple: false,
			library: {
				type: 'image/svg+xml',
			},
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection');
			const attachment: MediaAttachment = selection.first().toJSON();

			if (attachment && attachment.url) {
				onChange({
					library: 'svg',
					value: attachment.url,
				});
			}
		});

		frame.open();
	}, [hasWpMedia, onChange]);

	// Load icon list for a pack
	const loadIconList = useCallback(async (packKey: string, pack: IconPackConfig) => {
		if (iconLists[packKey] || loadingIcons[packKey] || !pack.fetchJson) {
			return;
		}

		setLoadingIcons((prev) => ({ ...prev, [packKey]: true }));

		try {
			const response = await fetch(pack.fetchJson);
			if (response.ok) {
				const data: unknown = await response.json();
				// Icon list format varies - could be array or object with icons property
				let icons: string[] = [];
				if (Array.isArray(data)) {
					icons = data as string[];
				} else if (data && typeof data === 'object') {
					const dataObj = data as Record<string, unknown>;
					icons = (dataObj['icons'] || dataObj['list'] || []) as string[];
				}
				setIconLists((prev) => ({ ...prev, [packKey]: icons }));
			}
		} catch (error) {
			console.warn(`Failed to load icon list for ${packKey}:`, error);
		} finally {
			setLoadingIcons((prev) => {
				const next = { ...prev };
				delete next[packKey];
				return next;
			});
		}
	}, [iconLists, loadingIcons]);

	// Handle search
	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);

		if (!query.trim()) {
			setSearchResults({});
			return;
		}

		const config = window.Voxel_Icon_Picker_Config;
		if (!config) return;

		const results: Record<string, string[]> = {};
		const lowerQuery = query.toLowerCase();

		Object.entries(config).forEach(([packKey, pack]: [string, any]) => {
			const icons = iconLists[packKey] || pack.list || [];
			const filtered = icons.filter((iconName: string) =>
				iconName.toLowerCase().includes(lowerQuery)
			);
			if (filtered.length > 0) {
				results[packKey] = filtered;
			}
		});

		setSearchResults(results);
	}, [iconLists]);

	// Load backend.css dynamically when modal opens
	useEffect(() => {
		if (isIconPickerOpen) {
			// Load backend.css if not already loaded
			if (!document.getElementById('vx-backend-css-dynamic')) {
				// Get theme URL from existing backend.css link or construct from current page
				const existingBackendCSS = document.querySelector('link[href*="backend.css"]') as HTMLLinkElement;
				let backendCSSUrl = '';

				if (existingBackendCSS && existingBackendCSS.href) {
					backendCSSUrl = existingBackendCSS.href;
				} else {
					// Construct URL from current page
					const currentUrl = window.location.origin;
					backendCSSUrl = `${currentUrl}/wp-content/themes/voxel/assets/dist/backend.css`;
				}

				const link = document.createElement('link');
				link.id = 'vx-backend-css-dynamic';
				link.rel = 'stylesheet';
				link.href = backendCSSUrl;
				link.media = 'all';
				document.head.appendChild(link);
			}
		} else {
			// Remove backend.css when modal closes
			const backendCSS = document.getElementById('vx-backend-css-dynamic');
			if (backendCSS) {
				backendCSS.remove();
			}
		}
	}, [isIconPickerOpen]);

	// Handle Icon Library button - open Voxel icon picker
	const handleIconLibrary = useCallback(() => {
		// Check if Voxel icon picker config is available
		if (!window.Voxel_Icon_Picker_Config) {
			console.warn('Voxel icon picker config not available');
			return;
		}

		setIsIconPickerOpen(true);
		setSearchQuery('');
		setSearchResults({});

		// Load icon lists for all packs
		const config = window.Voxel_Icon_Picker_Config;
		Object.entries(config).forEach(([packKey, pack]: [string, any]) => {
			if (pack.fetchJson) {
				loadIconList(packKey, pack);
			}
		});
	}, [loadIconList]);

	// Close icon picker
	const handleCloseIconPicker = useCallback(() => {
		setIsIconPickerOpen(false);
		setSearchQuery('');
		setSearchResults({});
		setActivePackKey('');
	}, []);

	// Handle pack selection
	const handleSetPack = useCallback((packKey: string) => {
		setActivePackKey(packKey);
		setSearchQuery('');
		setSearchResults({});
	}, []);

	// Handle icon selection from library
	const handleIconSelect = useCallback(
		(iconName: string, packKey: string) => {
			const config = window.Voxel_Icon_Picker_Config;
			if (!config || !config[packKey]) {
				return;
			}

			const pack = config[packKey];
			const iconValue = `${pack.displayPrefix} ${pack.prefix}${iconName}`;

			// Call onChange with the new icon value
			onChange({
				library: 'icon',
				value: iconValue,
			});

			// Close the modal after selection
			handleCloseIconPicker();
		},
		[onChange, handleCloseIconPicker]
	);


	// Get active pack
	const getActivePack = () => {
		if (!window.Voxel_Icon_Picker_Config || !activePackKey) {
			return null;
		}
		return window.Voxel_Icon_Picker_Config[activePackKey];
	};

	const activePack = getActivePack();
	const activePackIcons = activePack ? (iconLists[activePackKey] || activePack.list || []) : [];

	return (
		<div className="voxel-icon-picker-control" style={{ marginBottom: '16px' }}>
			{/* Label row with dynamic tag button */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					{/* Pink Voxel button for Dynamic Tags */}
					{supportsDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
					<label style={{ fontWeight: 500, margin: 0 }}>{label}</label>
				</div>
			</div>

			{/* Dynamic Tags active: Show tag preview panel */}
			{isTagsActive ? (
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
				}}>
					{/* Tag content row */}
					<div style={{ marginBottom: '12px' }}>
						<span style={{
							color: '#fff',
							fontSize: '13px',
							fontFamily: 'inherit',
							wordBreak: 'break-all',
						}}>
							{getTagContent()}
						</span>
					</div>

					{/* Light gray divider */}
					<div style={{
						height: '1px',
						backgroundColor: 'rgba(255, 255, 255, 0.15)',
						marginBottom: '8px',
					}} />

					{/* Action buttons row */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							className="edit-tags"
							onClick={handleEnableTags}
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
							className="disable-tags"
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
				</div>
			) : (
				/* Normal mode: Show icon picker buttons */
				<>
					{/* CSS for icon picker buttons */}
					<style>{`
						.voxel-icon-picker-control .voxel-icon-btn-active.components-button {
							background-color: var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) !important;
							color: #fff !important;
						}
						.voxel-icon-picker-control .voxel-icon-picker-btn.components-button {
							min-width: 36px !important;
							width: 36px !important;
							height: 36px !important;
							padding: 0 !important;
							display: flex !important;
							align-items: center !important;
							justify-content: center !important;
							overflow: visible !important;
						}
						.voxel-icon-picker-control .voxel-icon-picker-btn.components-button i {
							font-size: 16px !important;
							line-height: 1 !important;
							width: auto !important;
							height: auto !important;
						}
					`}</style>
					<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
						{/* None button - using Elementor eicon-ban */}
						<Button
							variant={normalizedValue.library === '' ? 'primary' : 'secondary'}
							onClick={handleNone}
							title={__('None', 'voxel-fse')}
							className={`voxel-icon-picker-btn ${normalizedValue.library === '' ? 'voxel-icon-btn-active' : ''}`}
						>
							<i className="eicon-ban" aria-hidden="true" />
						</Button>

						{/* Upload SVG button - using Elementor eicon-upload */}
						<Button
							variant={normalizedValue.library === 'svg' ? 'primary' : 'secondary'}
							onClick={handleUploadSVG}
							title={__('Upload SVG', 'voxel-fse')}
							className={`voxel-icon-picker-btn ${normalizedValue.library === 'svg' ? 'voxel-icon-btn-active' : ''}`}
						>
							<i className="eicon-upload" aria-hidden="true" />
						</Button>

						{/* Icon Library button - shows selected icon OR circle placeholder */}
						{/* Recognizes multiple icon libraries: 'icon', 'line-awesome', 'font-awesome', etc. */}
						{/* When showSelectedIcon=true, displays the icon even if set via defaults (for pre-populated controls) */}
						<Button
							variant={isIconLibrary(normalizedValue.library) ? 'primary' : 'secondary'}
							onClick={handleIconLibrary}
							title={__('Icon Library', 'voxel-fse')}
							className={`voxel-icon-picker-btn ${isIconLibrary(normalizedValue.library) ? 'voxel-icon-btn-active' : ''}`}
						>
							{(showSelectedIcon || isIconLibrary(normalizedValue.library)) && normalizedValue.value ? (
								<i className={normalizedValue.value} aria-hidden="true" />
							) : normalizedValue.library === 'svg' && normalizedValue.value ? (
								<img src={normalizedValue.value} alt="" style={{ width: '16px', height: '16px' }} />
							) : (
								<i className="eicon-circle" aria-hidden="true" />
							)}
						</Button>
					</div>
				</>
			)}

			{/* Icon picker modal - matches Voxel's structure exactly, no inline styles - backend.css handles all styling */}
			{isIconPickerOpen && (
				<div className="icon-picker-modal">
					{/* Backdrop - matches Voxel's ts-modal-backdrop */}
					<div className="ts-modal-backdrop" onClick={handleCloseIconPicker} />

					{/* Modal content - matches Voxel's icons-modal ts-theme-options */}
					<div className="icons-modal ts-theme-options" ref={iconPickerRef}>
						{activePack && activePackIcons.length > 0 ? (
							<div className="x-row">
								{/* Left sidebar - matches Voxel's inner-tab x-col-4 */}
								<div className="inner-tab x-col-4">
									<div className="x-row">
										{/* Search input - matches Voxel's ts-form-group */}
										<div className="ts-form-group x-col-12">
											<label>Search icons</label>
											<input
												type="text"
												value={searchQuery}
												onChange={(e) => handleSearch(e.target.value)}
												placeholder="Search icon"
											/>
										</div>

										{/* Vertical tabs - matches Voxel's inner-tabs vertical-tabs */}
										<div className="x-col-12">
											<ul className="inner-tabs vertical-tabs">
												{window.Voxel_Icon_Picker_Config && Object.entries(window.Voxel_Icon_Picker_Config).map(([packKey, pack]: [string, any]) => (
													<li
														key={packKey}
														className={activePackKey === packKey ? 'current-item' : ''}
													>
														<a
															href="#"
															onClick={(e) => {
																e.preventDefault();
																handleSetPack(packKey);
															}}
														>
															<i className={pack.labelIcon} />
															<span>{pack.label}</span>
														</a>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>

								{/* Right icon grid - matches Voxel's icon-list-wrapper min-scroll x-col-8 */}
								<div className="icon-list-wrapper min-scroll x-col-8">
									{searchQuery ? (
										/* Filtered icons - matches Voxel's filtered-icons structure */
										<div className="filtered-icons">
											{Object.entries(searchResults).map(([packKey, icons]) => {
												const pack = window.Voxel_Icon_Picker_Config?.[packKey];
												if (!pack) return null;

												return (
													<div key={packKey}>
														<code>{pack.label}</code>
														<div className="icon-list">
															{icons.map((iconName: string) => (
																<div
																	key={iconName}
																	className="single-icon"
																	onClick={(e) => {
																		e.preventDefault();
																		e.stopPropagation();
																		handleIconSelect(iconName, packKey);
																	}}
																	title={iconName}
																>
																	<i className={`${pack.displayPrefix} ${pack.prefix}${iconName}`} />
																	<span>{iconName}</span>
																</div>
															))}
														</div>
													</div>
												);
											})}
										</div>
									) : (
										/* Icon list - matches Voxel's icon-list structure */
										<div className="icon-list">
											{activePackIcons.map((iconName: string) => (
												<div
													key={iconName}
													className="single-icon"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleIconSelect(iconName, activePackKey);
													}}
													title={iconName}
												>
													<i className={`${activePack.displayPrefix} ${activePack.prefix}${iconName}`} />
													<span>{iconName}</span>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="x-row">
								<div className="x-col-12">
									<label>
										{loadingIcons[activePackKey] ? __('Loading icons...', 'voxel-fse') : __('No icon packs available.', 'voxel-fse')}
									</label>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Dynamic Tag Builder Modal */}
			{isDynamicTagModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleDynamicTagSave}
					label={label}
					context={dynamicTagContext}
					onClose={() => setIsDynamicTagModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
};

export default IconPickerControl;
