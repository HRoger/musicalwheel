/**
 * Typography Popup Component
 * 
 * Matches Elementor's typography control pattern - label with pencil icon that opens a popup
 * with typography controls (font family, size, weight, line height, etc.).
 * 
 * Evidence:
 * - Elementor pattern: themes/voxel/app/widgets/option-groups/popup-controller.php:45-52
 * - Gutenberg Popover: @wordpress/components
 */

// @ts-nocheck - WordPress types incomplete
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ResponsiveRangeControlWithDropdown from './ResponsiveRangeControlWithDropdown';
import UndoIcon from '../icons/UndoIcon';
import { usePersistentPopupState } from './usePersistentPopupState';

// Edit icon using Elementor's eicon-edit class
const EditIcon = () => (
	<span className="eicon eicon-edit" style={{ fontSize: '14px' }} />
);

// TypographyValue type for type imports
export interface TypographyValue {
	[key: string]: unknown;
	fontFamily?: string;
	fontSize?: number;
	fontSize_tablet?: number;
	fontSize_mobile?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textTransform?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeight_tablet?: number;
	lineHeight_mobile?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacing_tablet?: number;
	letterSpacing_mobile?: number;
	letterSpacingUnit?: string;
	wordSpacing?: number;
	wordSpacing_tablet?: number;
	wordSpacing_mobile?: number;
	wordSpacingUnit?: string;
}

interface TypographyPopupProps {
	label: string;
	// New pattern (block attributes) - optional when using value/onChange
	attributes?: Record<string, any>;
	setAttributes?: (attrs: Record<string, any>) => void;
	typographyAttributeName?: string;
	fontFamilyAttributeName?: string;
	// Old pattern (direct value) - for backwards compatibility with TypographyControl
	value?: TypographyValue;
	onChange?: (value: TypographyValue) => void;
}

// System fonts
const systemFonts = [
	{ label: __('Default', 'voxel-fse'), value: '' },
	{ label: __('System Font', 'voxel-fse'), value: 'var(--wp--preset--font-family--system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif)' },
	{ label: 'Arial', value: 'Arial, sans-serif' },
	{ label: 'Helvetica', value: 'Helvetica, sans-serif' },
	{ label: 'Times New Roman', value: '"Times New Roman", serif' },
	{ label: 'Courier New', value: '"Courier New", monospace' },
	{ label: 'Verdana', value: 'Verdana, sans-serif' },
	{ label: 'Georgia', value: 'Georgia, serif' },
	{ label: 'Palatino', value: 'Palatino, serif' },
	{ label: 'Garamond', value: 'Garamond, serif' },
	{ label: 'Bookman', value: 'Bookman, serif' },
	{ label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
	{ label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
	{ label: 'Impact', value: 'Impact, sans-serif' },
];

// Google Fonts (comprehensive list of popular fonts) - alphabetically sorted
const googleFonts = [
	{ label: 'Abel', value: 'Abel, sans-serif' },
	{ label: 'Acme', value: 'Acme, sans-serif' },
	{ label: 'Alegreya', value: 'Alegreya, serif' },
	{ label: 'Alfa Slab One', value: '"Alfa Slab One", cursive' },
	{ label: 'Amatic SC', value: '"Amatic SC", cursive' },
	{ label: 'Anonymous Pro', value: '"Anonymous Pro", monospace' },
	{ label: 'Anton', value: 'Anton, sans-serif' },
	{ label: 'Architects Daughter', value: '"Architects Daughter", cursive' },
	{ label: 'Archivo', value: 'Archivo, sans-serif' },
	{ label: 'Arimo', value: 'Arimo, sans-serif' },
	{ label: 'Arvo', value: 'Arvo, serif' },
	{ label: 'Asap', value: 'Asap, sans-serif' },
	{ label: 'Bangers', value: 'Bangers, cursive' },
	{ label: 'Barlow', value: 'Barlow, sans-serif' },
	{ label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
	{ label: 'Bitter', value: 'Bitter, serif' },
	{ label: 'Bree Serif', value: '"Bree Serif", serif' },
	{ label: 'Cabin', value: 'Cabin, sans-serif' },
	{ label: 'Cardo', value: 'Cardo, serif' },
	{ label: 'Caveat', value: 'Caveat, cursive' },
	{ label: 'Cookie', value: 'Cookie, cursive' },
	{ label: 'Cormorant', value: 'Cormorant, serif' },
	{ label: 'Courgette', value: 'Courgette, cursive' },
	{ label: 'Courier Prime', value: '"Courier Prime", monospace' },
	{ label: 'Crete Round', value: '"Crete Round", serif' },
	{ label: 'Crimson Text', value: '"Crimson Text", serif' },
	{ label: 'Dancing Script', value: '"Dancing Script", cursive' },
	{ label: 'DM Sans', value: '"DM Sans", sans-serif' },
	{ label: 'Domine', value: 'Domine, serif' },
	{ label: 'Dosis', value: 'Dosis, sans-serif' },
	{ label: 'EB Garamond', value: '"EB Garamond", serif' },
	{ label: 'Exo 2', value: '"Exo 2", sans-serif' },
	{ label: 'Fira Code', value: '"Fira Code", monospace' },
	{ label: 'Fira Sans', value: '"Fira Sans", sans-serif' },
	{ label: 'Frank Ruhl Libre', value: '"Frank Ruhl Libre", serif' },
	{ label: 'Fredoka One', value: '"Fredoka One", cursive' },
	{ label: 'Gelasio', value: 'Gelasio, serif' },
	{ label: 'Great Vibes', value: '"Great Vibes", cursive' },
	{ label: 'Heebo', value: 'Heebo, sans-serif' },
	{ label: 'Hind', value: 'Hind, sans-serif' },
	{ label: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace' },
	{ label: 'IBM Plex Sans', value: '"IBM Plex Sans", sans-serif' },
	{ label: 'Inconsolata', value: 'Inconsolata, monospace' },
	{ label: 'Indie Flower', value: '"Indie Flower", cursive' },
	{ label: 'Inter', value: 'Inter, sans-serif' },
	{ label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
	{ label: 'Josefin Sans', value: '"Josefin Sans", sans-serif' },
	{ label: 'Kanit', value: 'Kanit, sans-serif' },
	{ label: 'Karla', value: 'Karla, sans-serif' },
	{ label: 'Kaushan Script', value: '"Kaushan Script", cursive' },
	{ label: 'Lato', value: 'Lato, sans-serif' },
	{ label: 'Libre Baskerville', value: '"Libre Baskerville", serif' },
	{ label: 'Libre Franklin', value: '"Libre Franklin", sans-serif' },
	{ label: 'Lobster', value: 'Lobster, cursive' },
	{ label: 'Lora', value: 'Lora, serif' },
	{ label: 'Manrope', value: 'Manrope, sans-serif' },
	{ label: 'Maven Pro', value: '"Maven Pro", sans-serif' },
	{ label: 'Merriweather', value: 'Merriweather, serif' },
	{ label: 'Montserrat', value: 'Montserrat, sans-serif' },
	{ label: 'Mukta', value: 'Mukta, sans-serif' },
	{ label: 'Mulish', value: 'Mulish, sans-serif' },
	{ label: 'Noto Sans', value: '"Noto Sans", sans-serif' },
	{ label: 'Noto Serif', value: '"Noto Serif", serif' },
	{ label: 'Noticia Text', value: '"Noticia Text", serif' },
	{ label: 'Nunito', value: 'Nunito, sans-serif' },
	{ label: 'Nunito Sans', value: '"Nunito Sans", sans-serif' },
	{ label: 'Old Standard TT', value: '"Old Standard TT", serif' },
	{ label: 'Open Sans', value: '"Open Sans", sans-serif' },
	{ label: 'Oswald', value: 'Oswald, sans-serif' },
	{ label: 'Overpass Mono', value: '"Overpass Mono", monospace' },
	{ label: 'Oxygen', value: 'Oxygen, sans-serif' },
	{ label: 'Pacifico', value: 'Pacifico, cursive' },
	{ label: 'Patua One', value: '"Patua One", cursive' },
	{ label: 'Permanent Marker', value: '"Permanent Marker", cursive' },
	{ label: 'Playfair Display', value: '"Playfair Display", serif' },
	{ label: 'Poppins', value: 'Poppins, sans-serif' },
	{ label: 'Prompt', value: 'Prompt, sans-serif' },
	{ label: 'PT Sans', value: '"PT Sans", sans-serif' },
	{ label: 'PT Serif', value: '"PT Serif", serif' },
	{ label: 'Questrial', value: 'Questrial, sans-serif' },
	{ label: 'Quicksand', value: 'Quicksand, sans-serif' },
	{ label: 'Raleway', value: 'Raleway, sans-serif' },
	{ label: 'Righteous', value: 'Righteous, cursive' },
	{ label: 'Roboto', value: 'Roboto, sans-serif' },
	{ label: 'Roboto Condensed', value: '"Roboto Condensed", sans-serif' },
	{ label: 'Roboto Mono', value: '"Roboto Mono", monospace' },
	{ label: 'Roboto Slab', value: '"Roboto Slab", serif' },
	{ label: 'Rubik', value: 'Rubik, sans-serif' },
	{ label: 'Satisfy', value: 'Satisfy, cursive' },
	{ label: 'Shadows Into Light', value: '"Shadows Into Light", cursive' },
	{ label: 'Source Code Pro', value: '"Source Code Pro", monospace' },
	{ label: 'Source Sans Pro', value: '"Source Sans Pro", sans-serif' },
	{ label: 'Space Mono', value: '"Space Mono", monospace' },
	{ label: 'Spectral', value: 'Spectral, serif' },
	{ label: 'Teko', value: 'Teko, sans-serif' },
	{ label: 'Titillium Web', value: '"Titillium Web", sans-serif' },
	{ label: 'Ubuntu', value: 'Ubuntu, sans-serif' },
	{ label: 'Unna', value: 'Unna, serif' },
	{ label: 'Varela Round', value: '"Varela Round", sans-serif' },
	{ label: 'Vollkorn', value: 'Vollkorn, serif' },
	{ label: 'Work Sans', value: '"Work Sans", sans-serif' },
	{ label: 'Yanone Kaffeesatz', value: '"Yanone Kaffeesatz", sans-serif' },
	{ label: 'Yellowtail', value: 'Yellowtail, cursive' },
	{ label: 'Zilla Slab', value: '"Zilla Slab", serif' },
];

const allFonts = [
	...systemFonts,
	{ label: '──────────', value: '', disabled: true },
	...googleFonts,
];

export default function TypographyPopup({
	label,
	attributes,
	setAttributes,
	typographyAttributeName,
	fontFamilyAttributeName,
	// Old API support (TypographyControl compatibility)
	value,
	onChange,
}: TypographyPopupProps) {
	const [isOpen, setIsOpen] = usePersistentPopupState(
		typographyAttributeName ? `typography_popup_${typographyAttributeName}` : undefined,
		false
	);
	const [fontSearch, setFontSearch] = useState('');
	const popoverRef = useRef<HTMLDivElement>(null);

	// Detect which API pattern is being used
	const useOldApi = value !== undefined || onChange !== undefined;

	// Get typography values - either from value prop or from attributes
	const typo = useOldApi ? (value || {}) : (attributes?.[typographyAttributeName || ''] || {});
	const fontFamilyAttr = fontFamilyAttributeName || `${typographyAttributeName}FontFamily`;
	const currentFontFamily = useOldApi ? (typo.fontFamily || '') : (attributes?.[fontFamilyAttr] || '');

	// Helper to update typography - works with both APIs
	const updateTypography = (updates: Partial<TypographyValue>) => {
		const updatedTypo = { ...typo, ...updates };
		if (useOldApi && onChange) {
			onChange(updatedTypo);
		} else if (setAttributes && typographyAttributeName) {
			setAttributes({ [typographyAttributeName]: updatedTypo });
		}
	};

	// Helper to update font family - works with both APIs
	const updateFontFamily = (fontFamily: string) => {
		if (useOldApi && onChange) {
			onChange({ ...typo, fontFamily });
		} else if (setAttributes && typographyAttributeName) {
			setAttributes({
				[fontFamilyAttr]: fontFamily,
				[typographyAttributeName]: { ...typo, fontFamily },
			});
		}
	};

	// Filter and sort fonts based on search
	const filteredFonts = React.useMemo(() => {
		if (!fontSearch) return allFonts;

		const searchLower = fontSearch.toLowerCase();
		return allFonts.filter(font =>
			!font.disabled && font.label.toLowerCase().includes(searchLower)
		);
	}, [fontSearch]);

	const resetTypography = () => {
		if (useOldApi && onChange) {
			onChange({});
		} else if (setAttributes && typographyAttributeName) {
			setAttributes({
				[typographyAttributeName]: {},
				[fontFamilyAttr]: '',
			});
		}
	};

	const buttonRef = useRef<HTMLButtonElement>(null);

	// Position popover to the LEFT of the sidebar (content-aware positioning)
	useEffect(() => {
		if (!isOpen || !popoverRef.current || !buttonRef.current) return;

		const updatePosition = () => {
			if (!popoverRef.current || !buttonRef.current) return;
			const popover = popoverRef.current;
			const popoverWidth = popover.offsetWidth;
			const popoverHeight = popover.offsetHeight;
			const viewportHeight = window.innerHeight;

			// Find the inspector sidebar container
			const sidebar = buttonRef.current.closest('.interface-interface-skeleton__sidebar');
			const sidebarRect = sidebar?.getBoundingClientRect();

			// If we found the sidebar, position to the LEFT of it
			// Otherwise fall back to positioning relative to the button
			let left: number;
			let top: number;

			if (sidebarRect) {
				// Position to the left of the sidebar with a small gap
				left = sidebarRect.left - popoverWidth - 12;

				// Vertically center relative to the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				top = buttonRect.top - (popoverHeight / 2) + (buttonRect.height / 2);
			} else {
				// Fallback: position to the left of the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				left = buttonRect.left - popoverWidth - 8;
				top = buttonRect.top;
			}

			// Ensure popup stays within viewport bounds
			if (left < 8) {
				left = 8;
			}

			// Adjust vertically if off-screen bottom
			if (top + popoverHeight > viewportHeight - 8) {
				top = viewportHeight - popoverHeight - 8;
			}

			// Ensure not above viewport
			if (top < 8) {
				top = 8;
			}

			popover.style.top = `${top}px`;
			popover.style.left = `${left}px`;
		};

		// Initial position after a small delay to allow for rendering
		requestAnimationFrame(updatePosition);

		const handleClickOutside = (event: MouseEvent) => {
			// Don't close if a device change happened recently (within 1000ms)
			// This prevents the popup from closing during WordPress viewport transitions
			// Uses window global to survive component remounts
			const timestamp = window.__voxelDeviceChangeTimestamp || 0;
			if (Date.now() - timestamp < 1000) {
				return;
			}

			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
				if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
					// Check if click is inside a WordPress popover (e.g. responsive dropdowns, tooltips)
					// This prevents the typography popup from closing when interacting with nested dropdowns
					const target = event.target as HTMLElement;
					if (target.closest('.components-popover') || target.closest('.components-dropdown-menu__popover') || target.closest('.components-tooltip')) {
						return;
					}

					setIsOpen(false);
					// Also close font dropdown
					const dropdown = document.getElementById(`font-dropdown-${typographyAttributeName || 'typography'}`);
					if (dropdown) dropdown.style.display = 'none';
				}
			}

			// Close font dropdown when clicking outside
			const dropdown = document.getElementById(`font-dropdown-${typographyAttributeName || 'typography'}`);
			if (dropdown && dropdown.style.display === 'block') {
				const target = event.target as Node;
				if (!dropdown.contains(target)) {
					dropdown.style.display = 'none';
					setFontSearch('');
				}
			}
		};

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className="elementor-control elementor-control-type-typography" style={{ position: 'relative' }}>
			<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>{label}</span>
				{/* Edit icon button - opens popup */}
				<Button
					ref={buttonRef}
					icon={<EditIcon />}
					size="small"
					variant="tertiary"
					onClick={() => setIsOpen(!isOpen)}
					style={{ minWidth: 'auto', padding: '4px', width: '24px', height: '24px' }}
				/>
			</div>
			{isOpen && (
				<div
					ref={popoverRef}
					className="elementor-control-popover"
					style={{
						position: 'fixed',
						zIndex: 999999,
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
						minWidth: '300px',
						maxWidth: '400px',
						maxHeight: '80vh',
						overflowY: 'auto',
						overflowX: 'hidden',
					}}
				>
					{/* Arrow pointing right (towards the sidebar) */}
					<div
						style={{
							position: 'absolute',
							right: '-8px',
							top: '50%',
							transform: 'translateY(-50%)',
							width: 0,
							height: 0,
							borderTop: '8px solid transparent',
							borderBottom: '8px solid transparent',
							borderLeft: '8px solid #fff',
							filter: 'drop-shadow(2px 0 1px rgba(0,0,0,0.1))',
						}}
					/>
					<div style={{ padding: '16px' }}>
						{/* Header with reset button */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
							<h4 style={{ margin: 0 }}>{__('Typography', 'voxel-fse')}</h4>
							<Button
								icon={<UndoIcon />}
								label={__('Reset', 'voxel-fse')}
								onClick={resetTypography}
								variant="tertiary"
								size="small"
							/>
						</div>

						{/* Font Family - Elementor style inline layout */}
						<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
							<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
								{__('Family', 'voxel-fse')}
							</label>
							<div style={{ position: 'relative' }}>
								<button
									type="button"
									onClick={() => {
										const dropdown = document.getElementById(`font-dropdown-${typographyAttributeName || 'typography'}`);
										if (dropdown) {
											dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
										}
									}}
									style={{
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #d5dadf',
										borderRadius: '2px',
										fontSize: '13px',
										backgroundColor: '#fff',
										cursor: 'pointer',
										textAlign: 'left',
										position: 'relative',
									}}
								>
									{allFonts.find(f => f.value === currentFontFamily)?.label || __('Default', 'voxel-fse')}
									<span style={{
										position: 'absolute',
										right: '8px',
										top: '50%',
										transform: 'translateY(-50%)',
										fontSize: '10px',
									}}>▼</span>
								</button>

								{/* Custom dropdown overlay with search */}
								<div
									id={`font-dropdown-${typographyAttributeName || 'typography'}`}
									style={{
										position: 'absolute',
										top: '100%',
										left: 0,
										right: 0,
										marginTop: '4px',
										backgroundColor: '#fff',
										border: '1px solid #d5dadf',
										borderRadius: '2px',
										boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
										maxHeight: '300px',
										display: 'none',
										zIndex: 10000,
									}}
									onClick={(e) => e.stopPropagation()}
								>
									{/* Search input inside dropdown */}
									<div style={{ padding: '8px', borderBottom: '1px solid #d5dadf', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}>
										<input
											type="text"
											placeholder={__('Search fonts...', 'voxel-fse')}
											value={fontSearch}
											onChange={(e) => setFontSearch(e.target.value)}
											style={{
												width: '100%',
												padding: '6px 8px',
												border: '1px solid #d5dadf',
												borderRadius: '2px',
												fontSize: '13px',
											}}
											onClick={(e) => e.stopPropagation()}
											autoFocus
										/>
									</div>

									{/* Font list */}
									<div style={{ maxHeight: '240px', overflowY: 'auto' }}>
										{filteredFonts.filter(f => !f.disabled).map((font) => (
											<div
												key={font.value}
												onClick={() => {
													updateFontFamily(font.value);
													setFontSearch('');
													const dropdown = document.getElementById(`font-dropdown-${typographyAttributeName || 'typography'}`);
													if (dropdown) dropdown.style.display = 'none';
												}}
												style={{
													padding: '8px 12px',
													cursor: 'pointer',
													fontSize: '13px',
													backgroundColor: currentFontFamily === font.value ? '#f0f0f1' : 'transparent',
													borderBottom: '1px solid #f0f0f1',
												}}
												onMouseEnter={(e) => {
													if (currentFontFamily !== font.value) {
														e.currentTarget.style.backgroundColor = '#f8f8f8';
													}
												}}
												onMouseLeave={(e) => {
													if (currentFontFamily !== font.value) {
														e.currentTarget.style.backgroundColor = 'transparent';
													}
												}}
											>
												{font.label}
											</div>
										))}
										{filteredFonts.filter(f => !f.disabled).length === 0 && (
											<div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
												{__('No fonts found', 'voxel-fse')}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Font Size - Responsive */}
						<ResponsiveRangeControlWithDropdown
							label={__('Size', 'voxel-fse')}
							attributes={{
								...(attributes || {}),
								// Map typography object values to separate attributes for ResponsiveRangeControlWithDropdown
								[`${typographyAttributeName || 'typography'}FontSize`]: typeof typo.fontSize === 'number' ? typo.fontSize : undefined,
								[`${typographyAttributeName || 'typography'}FontSize_tablet`]: typeof typo.fontSize_tablet === 'number' ? typo.fontSize_tablet : undefined,
								[`${typographyAttributeName || 'typography'}FontSize_mobile`]: typeof typo.fontSize_mobile === 'number' ? typo.fontSize_mobile : undefined,
								[`${typographyAttributeName || 'typography'}FontSizeUnit`]: typo.fontSizeUnit || 'px',
							}}
							setAttributes={(newAttrs: Record<string, any>) => {
								// Extract font size values and save to typography object
								const attrBase = typographyAttributeName || 'typography';
								const fontSize = newAttrs[`${attrBase}FontSize`];
								const fontSizeTablet = newAttrs[`${attrBase}FontSize_tablet`];
								const fontSizeMobile = newAttrs[`${attrBase}FontSize_mobile`];
								const fontSizeUnit = newAttrs[`${attrBase}FontSizeUnit`];

								// Explicitly handle undefined to allow clearing values
								const updates: Partial<TypographyValue> = {};

								// Font Size
								if (fontSize !== undefined && fontSize !== null && fontSize !== '') {
									updates.fontSize = fontSize;
								} else if (fontSize === undefined) {
									updates.fontSize = undefined; // Explicitly clear
								}

								if (fontSizeTablet !== undefined && fontSizeTablet !== null && fontSizeTablet !== '') {
									updates.fontSize_tablet = fontSizeTablet;
								} else if (fontSizeTablet === undefined) {
									updates.fontSize_tablet = undefined;
								}

								if (fontSizeMobile !== undefined && fontSizeMobile !== null && fontSizeMobile !== '') {
									updates.fontSize_mobile = fontSizeMobile;
								} else if (fontSizeMobile === undefined) {
									updates.fontSize_mobile = undefined;
								}

								if (fontSizeUnit !== undefined) {
									updates.fontSizeUnit = fontSizeUnit;
								}

								updateTypography(updates);
							}}
							attributeBaseName={`${typographyAttributeName || 'typography'}FontSize`}
							min={10}
							max={72}
							step={1}
							availableUnits={['px', 'em', 'rem']}
							unitAttributeName={`${typographyAttributeName || 'typography'}FontSizeUnit`}
						/>

						{/* Font Weight - Elementor style inline layout */}
						<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
							<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
								{__('Weight', 'voxel-fse')}
							</label>
							<select
								value={typo.fontWeight || ''}
								onChange={(e) => updateTypography({ fontWeight: e.target.value })}
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #d5dadf',
									borderRadius: '2px',
									fontSize: '13px',
									backgroundColor: '#fff',
									cursor: 'pointer',
								}}
							>
								<option value="">{__('Default', 'voxel-fse')}</option>
								<option value="100">100</option>
								<option value="200">200</option>
								<option value="300">300</option>
								<option value="400">400</option>
								<option value="500">500</option>
								<option value="600">600</option>
								<option value="700">700</option>
								<option value="800">800</option>
								<option value="900">900</option>
							</select>
						</div>

						{/* Text Transform - Elementor style inline layout */}
						<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
							<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
								{__('Transform', 'voxel-fse')}
							</label>
							<select
								value={typo.textTransform || 'none'}
								onChange={(e) => updateTypography({ textTransform: e.target.value })}
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #d5dadf',
									borderRadius: '2px',
									fontSize: '13px',
									backgroundColor: '#fff',
									cursor: 'pointer',
								}}
							>
								<option value="none">{__('Default', 'voxel-fse')}</option>
								<option value="uppercase">{__('Uppercase', 'voxel-fse')}</option>
								<option value="lowercase">{__('Lowercase', 'voxel-fse')}</option>
								<option value="capitalize">{__('Capitalize', 'voxel-fse')}</option>
							</select>
						</div>

						{/* Font Style - Elementor style inline layout */}
						<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
							<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
								{__('Style', 'voxel-fse')}
							</label>
							<select
								value={typo.fontStyle || 'default'}
								onChange={(e) => updateTypography({ fontStyle: e.target.value === 'default' ? '' : e.target.value })}
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #d5dadf',
									borderRadius: '2px',
									fontSize: '13px',
									backgroundColor: '#fff',
									cursor: 'pointer',
								}}
							>
								<option value="default">{__('Default', 'voxel-fse')}</option>
								<option value="normal">{__('Normal', 'voxel-fse')}</option>
								<option value="italic">{__('Italic', 'voxel-fse')}</option>
								<option value="oblique">{__('Oblique', 'voxel-fse')}</option>
							</select>
						</div>

						{/* Text Decoration - Elementor style inline layout */}
						<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
							<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
								{__('Decoration', 'voxel-fse')}
							</label>
							<select
								value={typo.textDecoration || 'none'}
								onChange={(e) => updateTypography({ textDecoration: e.target.value === 'none' ? '' : e.target.value })}
								style={{
									width: '100%',
									padding: '6px 8px',
									border: '1px solid #d5dadf',
									borderRadius: '2px',
									fontSize: '13px',
									backgroundColor: '#fff',
									cursor: 'pointer',
								}}
							>
								<option value="none">{__('Default', 'voxel-fse')}</option>
								<option value="underline">{__('Underline', 'voxel-fse')}</option>
								<option value="overline">{__('Overline', 'voxel-fse')}</option>
								<option value="line-through">{__('Line Through', 'voxel-fse')}</option>
							</select>
						</div>

						{/* Line Height - Responsive */}
						<ResponsiveRangeControlWithDropdown
							label={__('Line Height', 'voxel-fse')}
							attributes={{
								...(attributes || {}),
								// Map typography object values to separate attributes for ResponsiveRangeControlWithDropdown
								[`${typographyAttributeName || 'typography'}LineHeight`]: typeof typo.lineHeight === 'number' ? typo.lineHeight : undefined,
								[`${typographyAttributeName || 'typography'}LineHeight_tablet`]: typeof typo.lineHeight_tablet === 'number' ? typo.lineHeight_tablet : undefined,
								[`${typographyAttributeName || 'typography'}LineHeight_mobile`]: typeof typo.lineHeight_mobile === 'number' ? typo.lineHeight_mobile : undefined,
								[`${typographyAttributeName || 'typography'}LineHeightUnit`]: typo.lineHeightUnit || 'px',
							}}
							setAttributes={(newAttrs: Record<string, any>) => {
								// Extract line height values and save to typography object
								const attrBase = typographyAttributeName || 'typography';
								const lineHeight = newAttrs[`${attrBase}LineHeight`];
								const lineHeightTablet = newAttrs[`${attrBase}LineHeight_tablet`];
								const lineHeightMobile = newAttrs[`${attrBase}LineHeight_mobile`];
								const lineHeightUnit = newAttrs[`${attrBase}LineHeightUnit`];

								const updates: Partial<TypographyValue> = {};

								// Line Height
								if (lineHeight !== undefined && lineHeight !== null && lineHeight !== '') {
									updates.lineHeight = lineHeight;
								} else if (lineHeight === undefined) {
									updates.lineHeight = undefined;
								}

								if (lineHeightTablet !== undefined && lineHeightTablet !== null && lineHeightTablet !== '') {
									updates.lineHeight_tablet = lineHeightTablet;
								} else if (lineHeightTablet === undefined) {
									updates.lineHeight_tablet = undefined;
								}

								if (lineHeightMobile !== undefined && lineHeightMobile !== null && lineHeightMobile !== '') {
									updates.lineHeight_mobile = lineHeightMobile;
								} else if (lineHeightMobile === undefined) {
									updates.lineHeight_mobile = undefined;
								}

								if (lineHeightUnit !== undefined) {
									updates.lineHeightUnit = lineHeightUnit;
								}

								updateTypography(updates);
							}}
							attributeBaseName={`${typographyAttributeName || 'typography'}LineHeight`}
							min={0.5}
							max={3}
							step={0.1}
							availableUnits={['px', 'em', 'rem']}
							unitAttributeName={`${typographyAttributeName || 'typography'}LineHeightUnit`}
						/>

						{/* Letter Spacing - Responsive */}
						<ResponsiveRangeControlWithDropdown
							label={__('Letter Spacing', 'voxel-fse')}
							attributes={{
								...(attributes || {}),
								// Map typography object values to separate attributes for ResponsiveRangeControlWithDropdown
								[`${typographyAttributeName || 'typography'}LetterSpacing`]: typeof typo.letterSpacing === 'number' ? typo.letterSpacing : undefined,
								[`${typographyAttributeName || 'typography'}LetterSpacing_tablet`]: typeof typo.letterSpacing_tablet === 'number' ? typo.letterSpacing_tablet : undefined,
								[`${typographyAttributeName || 'typography'}LetterSpacing_mobile`]: typeof typo.letterSpacing_mobile === 'number' ? typo.letterSpacing_mobile : undefined,
								[`${typographyAttributeName || 'typography'}LetterSpacingUnit`]: typo.letterSpacingUnit || 'px',
							}}
							setAttributes={(newAttrs: Record<string, any>) => {
								// Extract letter spacing values and save to typography object
								const attrBase = typographyAttributeName || 'typography';
								const letterSpacing = newAttrs[`${attrBase}LetterSpacing`];
								const letterSpacingTablet = newAttrs[`${attrBase}LetterSpacing_tablet`];
								const letterSpacingMobile = newAttrs[`${attrBase}LetterSpacing_mobile`];
								const letterSpacingUnit = newAttrs[`${attrBase}LetterSpacingUnit`];

								const updates: Partial<TypographyValue> = {};

								// Letter Spacing
								if (letterSpacing !== undefined && letterSpacing !== null && letterSpacing !== '') {
									updates.letterSpacing = letterSpacing;
								} else if (letterSpacing === undefined) {
									updates.letterSpacing = undefined;
								}

								if (letterSpacingTablet !== undefined && letterSpacingTablet !== null && letterSpacingTablet !== '') {
									updates.letterSpacing_tablet = letterSpacingTablet;
								} else if (letterSpacingTablet === undefined) {
									updates.letterSpacing_tablet = undefined;
								}

								if (letterSpacingMobile !== undefined && letterSpacingMobile !== null && letterSpacingMobile !== '') {
									updates.letterSpacing_mobile = letterSpacingMobile;
								} else if (letterSpacingMobile === undefined) {
									updates.letterSpacing_mobile = undefined;
								}

								if (letterSpacingUnit !== undefined) {
									updates.letterSpacingUnit = letterSpacingUnit;
								}

								updateTypography(updates);
							}}
							attributeBaseName={`${typographyAttributeName || 'typography'}LetterSpacing`}
							min={-5}
							max={10}
							step={0.1}
							availableUnits={['px', 'em', 'rem']}
							unitAttributeName={`${typographyAttributeName || 'typography'}LetterSpacingUnit`}
						/>

						{/* Word Spacing - Responsive */}
						<ResponsiveRangeControlWithDropdown
							label={__('Word Spacing', 'voxel-fse')}
							attributes={{
								...(attributes || {}),
								// Map typography object values to separate attributes for ResponsiveRangeControlWithDropdown
								[`${typographyAttributeName || 'typography'}WordSpacing`]: typeof typo.wordSpacing === 'number' ? typo.wordSpacing : undefined,
								[`${typographyAttributeName || 'typography'}WordSpacing_tablet`]: typeof typo.wordSpacing_tablet === 'number' ? typo.wordSpacing_tablet : undefined,
								[`${typographyAttributeName || 'typography'}WordSpacing_mobile`]: typeof typo.wordSpacing_mobile === 'number' ? typo.wordSpacing_mobile : undefined,
								[`${typographyAttributeName || 'typography'}WordSpacingUnit`]: typo.wordSpacingUnit || 'px',
							}}
							setAttributes={(newAttrs: Record<string, any>) => {
								// Extract word spacing values and save to typography object
								const attrBase = typographyAttributeName || 'typography';
								const wordSpacing = newAttrs[`${attrBase}WordSpacing`];
								const wordSpacingTablet = newAttrs[`${attrBase}WordSpacing_tablet`];
								const wordSpacingMobile = newAttrs[`${attrBase}WordSpacing_mobile`];
								const wordSpacingUnit = newAttrs[`${attrBase}WordSpacingUnit`];

								const updates: Partial<TypographyValue> = {};

								// Word Spacing
								if (wordSpacing !== undefined && wordSpacing !== null && wordSpacing !== '') {
									updates.wordSpacing = wordSpacing;
								} else if (wordSpacing === undefined) {
									updates.wordSpacing = undefined;
								}

								if (wordSpacingTablet !== undefined && wordSpacingTablet !== null && wordSpacingTablet !== '') {
									updates.wordSpacing_tablet = wordSpacingTablet;
								} else if (wordSpacingTablet === undefined) {
									updates.wordSpacing_tablet = undefined;
								}

								if (wordSpacingMobile !== undefined && wordSpacingMobile !== null && wordSpacingMobile !== '') {
									updates.wordSpacing_mobile = wordSpacingMobile;
								} else if (wordSpacingMobile === undefined) {
									updates.wordSpacing_mobile = undefined;
								}

								if (wordSpacingUnit !== undefined) {
									updates.wordSpacingUnit = wordSpacingUnit;
								}

								updateTypography(updates);
							}}
							attributeBaseName={`${typographyAttributeName || 'typography'}WordSpacing`}
							min={-5}
							max={20}
							step={0.1}
							availableUnits={['px', 'em', 'rem']}
							unitAttributeName={`${typographyAttributeName || 'typography'}WordSpacingUnit`}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

