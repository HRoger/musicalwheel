/**
 * Image Upload Control Component
 *
 * Opens WordPress Media Library to select an image.
 * Matches Elementor's image picker pattern.
 *
 * Features:
 * - Media library integration via @wordpress/block-editor MediaUpload
 * - Image preview thumbnail
 * - Remove button with eicon-trash-o
 * - Optional responsive support (desktop/tablet/mobile)
 * - Hover overlay with "Choose Image" button
 * - Support for multiple upload buttons with different file type filters
 * - Dynamic tag support for Voxel dynamic images
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import { MediaUpload } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import { DynamicTagBuilder } from '../dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

// Note: enable-tags-button.css is loaded via shared-styles.ts entry point

export interface ImageUploadValue {
	id?: number;
	url?: string;
	alt?: string;
	/** Available image sizes with their URLs - used for resolution selection */
	sizes?: Record<string, { url: string; width: number; height: number }>;
}

export interface UploadButton {
	/** Button label text */
	label: string;
	/** Allowed file types for this button (if using MediaUpload) */
	allowedTypes?: string[];
	/** Custom click handler (overrides MediaUpload) */
	onClick?: () => void;
}

export interface ImageUploadControlProps {
	/** Control label */
	label: string;
	/** Current image value (desktop) */
	value?: ImageUploadValue;
	/** Tablet image value (optional, for responsive) */
	valueTablet?: ImageUploadValue;
	/** Mobile image value (optional, for responsive) */
	valueMobile?: ImageUploadValue;
	/** Change handler for desktop */
	onChange: (value: ImageUploadValue | undefined) => void;
	/** Change handler for tablet (optional) */
	onChangeTablet?: (value: ImageUploadValue | undefined) => void;
	/** Change handler for mobile (optional) */
	onChangeMobile?: (value: ImageUploadValue | undefined) => void;
	/** Enable responsive mode (shows device switcher) */
	responsive?: boolean;
	/** Custom upload buttons (default: single "Choose Image" button for all images) */
	buttons?: UploadButton[];
	/** Help text displayed below the control */
	help?: string;
	/** Enable dynamic tag support (shows Voxel icon button) */
	enableDynamicTags?: boolean;
	/** Dynamic tag value (stores the @tags()...@endtags() wrapped value) */
	dynamicTagValue?: string;
	/** Change handler for dynamic tag value */
	onDynamicTagChange?: (value: string | undefined) => void;
	/** Dynamic tag context (default: 'post') */
	dynamicTagContext?: string;
	/** Custom preview renderer (overrides default image tag) */
	renderPreview?: (value: ImageUploadValue) => React.ReactNode;
	/** Allowed media types (e.g. ['image']) */
	allowedTypes?: string[];
}

import { getCurrentDeviceType, type DeviceType } from '@shared/utils/deviceType';

/**
 * ImageUploadControl - WordPress Media Library image picker
 *
 * Matches Elementor's image upload control with optional responsive support.
 *
 * @example
 * // Simple (non-responsive)
 * <ImageUploadControl
 *   label="Image"
 *   value={attributes.image}
 *   onChange={(image) => setAttributes({ image })}
 * />
 *
 * @example
 * // Responsive
 * <ImageUploadControl
 *   label="Image"
 *   value={attributes.image}
 *   valueTablet={attributes.image_tablet}
 *   valueMobile={attributes.image_mobile}
 *   onChange={(v) => setAttributes({ image: v })}
 *   onChangeTablet={(v) => setAttributes({ image_tablet: v })}
 *   onChangeMobile={(v) => setAttributes({ image_mobile: v })}
 *   responsive
 * />
 *
 * @example
 * // Multiple buttons (e.g., for masks with Image + SVG options)
 * <ImageUploadControl
 *   label="Custom Mask"
 *   value={attributes.maskImage}
 *   onChange={(v) => setAttributes({ maskImage: v })}
 *   buttons={[
 *     { label: 'Choose Image', allowedTypes: ['image'] },
 *     { label: 'Choose SVG', allowedTypes: ['image/svg+xml'] },
 *   ]}
 * />
 */
export default function ImageUploadControl({
	label,
	value,
	valueTablet,
	valueMobile,
	onChange,
	onChangeTablet,
	onChangeMobile,
	responsive = false,
	buttons,
	help,
	enableDynamicTags = false,
	dynamicTagValue,
	onDynamicTagChange,
	dynamicTagContext = 'post',
	renderPreview,
}: ImageUploadControlProps) {
	// Get WordPress's current device type from the store
	const wpDeviceType = useSelect((select: any) => getCurrentDeviceType(select));

	const wpDevice = wpDeviceType ? (wpDeviceType.toLowerCase() as DeviceType) : 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);
	const [isTagModalOpen, setIsTagModalOpen] = useState(false);

	// Sync with WordPress device type
	useEffect(() => {
		setCurrentDevice(wpDevice);
	}, [wpDevice]);

	// Check if dynamic tags are active (value wrapped with @tags())
	const hasDynamicTags = () => {
		return typeof dynamicTagValue === 'string' &&
			dynamicTagValue.startsWith('@tags()') &&
			dynamicTagValue.includes('@endtags()');
	};

	// Extract the tag content (remove @tags() wrapper)
	const getTagContent = () => {
		if (!hasDynamicTags()) return dynamicTagValue || '';
		const match = dynamicTagValue?.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : dynamicTagValue || '';
	};

	// Wrap content with @tags() markers
	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	// Handle enabling dynamic tags
	const handleEnableTags = () => {
		setIsTagModalOpen(true);
	};

	// Handle editing tags
	const handleEditTags = () => {
		setIsTagModalOpen(true);
	};

	// Handle disabling tags
	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onDynamicTagChange?.(undefined);
		}
	};

	// Handle modal save
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onDynamicTagChange?.(wrapWithTags(newValue));
		}
		setIsTagModalOpen(false);
	};

	const isDynamicTagsActive = enableDynamicTags && hasDynamicTags();

	// Get current value based on device
	const getCurrentValue = (): ImageUploadValue | undefined => {
		if (!responsive) return value;
		switch (currentDevice) {
			case 'tablet':
				return valueTablet;
			case 'mobile':
				return valueMobile;
			default:
				return value;
		}
	};

	// Handle image selection
	const handleSelect = (media: { id: number; url: string }) => {
		const newValue: ImageUploadValue = { id: media.id, url: media.url };
		if (!responsive) {
			onChange(newValue);
			return;
		}
		switch (currentDevice) {
			case 'tablet':
				onChangeTablet?.(newValue);
				break;
			case 'mobile':
				onChangeMobile?.(newValue);
				break;
			default:
				onChange(newValue);
				break;
		}
	};

	// Handle image removal
	const handleRemove = () => {
		if (!responsive) {
			onChange(undefined);
			return;
		}
		switch (currentDevice) {
			case 'tablet':
				onChangeTablet?.(undefined);
				break;
			case 'mobile':
				onChangeMobile?.(undefined);
				break;
			default:
				onChange(undefined);
				break;
		}
	};

	const currentValue = getCurrentValue();

	// Default buttons if not provided
	const uploadButtons: UploadButton[] = buttons || [
		{ label: __('Choose Image', 'voxel-fse'), allowedTypes: ['image'] },
	];

	// Render upload button(s) in the overlay
	const renderUploadButtons = () => {
		const renderButton = (btn: UploadButton, index: number) => {
			const buttonContent = (
				<span
					className="voxel-fse-image-upload-empty__button"
				>
					{btn.label}
				</span>
			);

			if (btn.onClick) {
				return (
					<div
						key={index}
						className="voxel-fse-image-upload-button-wrapper"
						onClick={(e) => {
							e.stopPropagation();
							btn.onClick?.();
						}}
					>
						{buttonContent}
					</div>
				);
			}

			return (
				<MediaUpload
					key={index}
					onSelect={handleSelect}
					allowedTypes={btn.allowedTypes || ['image']}
					value={currentValue?.id}
					render={({ open }: { open: () => void }) => (
						<div
							className="voxel-fse-image-upload-button-wrapper"
							onClick={(e) => {
								e.stopPropagation();
								open();
							}}
						>
							{buttonContent}
						</div>
					)}
				/>
			);
		};

		if (uploadButtons.length === 1) {
			return (
				<div className="voxel-fse-image-upload-buttons-wrapper">
					{renderButton(uploadButtons[0], 0)}
				</div>
			);
		}

		// Multiple buttons - render side by side
		return (
			<div className="voxel-fse-image-upload-buttons-wrapper">
				{uploadButtons.map((btn, index) => renderButton(btn, index))}
			</div>
		);
	};

	return (
		<div className="voxel-fse-image-upload-control" style={{ marginBottom: '16px' }}>
			{/* Dynamic Tags Active - show unified dark panel */}
			{isDynamicTagsActive ? (
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
				}}>
					{/* Header row: Label + Responsive dropdown */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						marginBottom: '8px',
					}}>
						{/* Label */}
						<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, fontSize: '13px' }}>{label}</span>
						{/* Responsive dropdown button (styled for dark bg) */}
						{responsive && (
							<div className="voxel-fse-responsive-dark">
								<ResponsiveDropdownButton />
							</div>
						)}
					</div>

					{/* Tag content row */}
					<div style={{ marginBottom: '12px' }}>
						{/* Tag content */}
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

					{/* Action buttons row - white text on dark background */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							onClick={handleEditTags}
							style={{
								flex: 1,
								fontSize: '10px',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								color: 'rgba(255, 255, 255, 0.8)',
								background: 'transparent',
								border: 'none',
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
								fontSize: '10px',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.5px',
								color: 'rgba(255, 255, 255, 0.5)',
								background: 'transparent',
								border: 'none',
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
				<>
					{/* Normal state: Header + Image upload */}
					{/* Header: Label + Responsive button + Dynamic Tag button */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginBottom: '8px',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<span style={{ fontWeight: 500, fontSize: '13px' }}>{label}</span>
							{responsive && <ResponsiveDropdownButton />}
						</div>

						{/* Right side: Dynamic tag button - Voxel style with pink background */}
						{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
					</div>

					{/* Image preview and controls */}
					<div className="voxel-fse-image-upload-control__content">
						{currentValue?.url ? (
							/* Image preview - clicking opens media library */
							<MediaUpload
								onSelect={handleSelect}
								allowedTypes={uploadButtons[0].allowedTypes || ['image']}
								value={currentValue?.id}
								render={({ open }: { open: () => void }) => (
									<div
										className="voxel-fse-image-upload-preview"
										onClick={() => {
											// If custom onClick, use it; otherwise open media library
											const firstBtn = uploadButtons[0];
											if (firstBtn.onClick) {
												firstBtn.onClick();
											} else {
												open();
											}
										}}
										role="button"
										tabIndex={0}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												const firstBtn = uploadButtons[0];
												if (firstBtn.onClick) {
													firstBtn.onClick();
												} else {
													open();
												}
											}
										}}
										style={{
											position: 'relative',
											backgroundColor: '#d5d8dc',
											borderRadius: '4px',
											overflow: 'hidden',
											cursor: 'pointer',
										}}
									>
										{renderPreview ? (
											renderPreview(currentValue)
										) : (
											<img
												src={currentValue.url}
												alt=""
												style={{
													display: 'block',
													width: '100%',
													height: 'auto',
													maxHeight: '150px',
													objectFit: 'cover',
												}}
											/>
										)}
										{/* Remove button overlay - eicon-trash-o */}
										<button
											type="button"
											className="voxel-fse-image-upload-preview__remove"
											onClick={(e) => {
												e.stopPropagation();
												handleRemove();
											}}
											aria-label={__('Remove image', 'voxel-fse')}
											style={{
												position: 'absolute',
												top: '8px',
												right: '8px',
												background: 'rgba(0,0,0,0.5)',
												color: '#fff',
												borderRadius: '3px',
												padding: '6px',
												minWidth: 'auto',
												border: 'none',
												cursor: 'pointer',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<i className="eicon-trash-o" style={{ fontSize: '14px' }} />
										</button>
										{/* Hover overlay with upload buttons - shown on hover via CSS */}
										<div className="voxel-fse-image-upload-empty__overlay">
											{renderUploadButtons()}
										</div>
									</div>
								)}
							/>
						) : (
							/* Empty state - Elementor-style clickable area */
							<div
								className="voxel-fse-image-upload-empty"
								style={{
									position: 'relative',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									padding: '24px 16px',
									backgroundColor: '#e6e9ec',
									borderRadius: '3px',
									cursor: 'pointer',
									minHeight: '100px',
									overflow: 'hidden',
								}}
							>
								{/* Plus circle icon - matches Elementor's eicon-plus-circle */}
								<svg
									className="voxel-fse-image-upload-empty__icon"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									style={{ color: 'rgb(0, 0, 0)' }}
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="16" />
									<line x1="8" y1="12" x2="16" y2="12" />
								</svg>
								{/* Hover overlay with upload button(s) at bottom - CSS handles visibility */}
								<div className="voxel-fse-image-upload-empty__overlay">
									{renderUploadButtons()}
								</div>
							</div>
						)}
					</div>
				</>
			)}

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

			{/* Help text */}
			{help && (
				<p
					style={{
						marginTop: '8px',
						marginBottom: '0',
						fontSize: '12px',
						fontStyle: 'italic',
						color: '#757575',
					}}
				>
					{help}
				</p>
			)}

			{/* Note: CSS moved to elementor-controls.css for DRY */}
		</div>
	);
}

// Backward compatibility aliases
export type BackgroundImageValue = ImageUploadValue;
export type BackgroundImageControlProps = ImageUploadControlProps;
export const BackgroundImageControl = ImageUploadControl;

