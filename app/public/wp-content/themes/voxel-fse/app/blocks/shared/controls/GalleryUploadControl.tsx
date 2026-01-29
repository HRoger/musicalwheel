/**
 * Gallery Upload Control Component
 *
 * Allows selecting multiple images from the WordPress Media Library.
 * Used for slideshow backgrounds in flex-container.
 * Styled to match Elementor's gallery selector UI.
 *
 * @package VoxelFSE
 */

import { useState } from 'react';
import { BaseControl } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { ImageUploadValue } from './ImageUploadControl';
import { DynamicTagBuilder } from '../dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

// Note: enable-tags-button.css is loaded via shared-styles.ts entry point

export interface GalleryUploadControlProps {
	/** Control label */
	label?: string;
	/** Currently selected images */
	value: ImageUploadValue[];
	/** Callback when images change */
	onChange: (images: ImageUploadValue[]) => void;
	/** Help text */
	help?: string;
	/** Enable dynamic tag support (shows Voxel icon button) */
	enableDynamicTags?: boolean;
	/** Dynamic tag value (stores the @tags()...@endtags() wrapped value) */
	dynamicTagValue?: string;
	/** Change handler for dynamic tag value */
	onDynamicTagChange?: (value: string | undefined) => void;
	/** Dynamic tag context (default: 'post') */
	dynamicTagContext?: string;
}

/**
 * GalleryUploadControl - Multi-image selector for slideshow backgrounds
 * Matches Elementor's gallery selector UI with:
 * - "X Images Selected" header with trash icon
 * - Image grid with thumbnails
 * - Pencil edit button on hover
 * - Optional dynamic tag support for Voxel image fields
 */
export default function GalleryUploadControl({
	label,
	value = [],
	onChange,
	help,
	enableDynamicTags = false,
	dynamicTagValue,
	onDynamicTagChange,
	dynamicTagContext = 'post',
}: GalleryUploadControlProps) {
	const [isHovering, setIsHovering] = useState(false);
	const [isAddButtonHovering, setIsAddButtonHovering] = useState(false);
	const [isTagModalOpen, setIsTagModalOpen] = useState(false);
	const hasImages = value && value.length > 0;

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

	const onSelectImages = (media: any[]) => {
		const images: ImageUploadValue[] = media.map((item) => {
			// Convert sizes from media object format to our format
			// MediaUpload gives us sizes as { sizeName: { url, width, height, orientation } }
			const sizes: Record<string, { url: string; width: number; height: number }> = {};
			if (item.sizes) {
				Object.entries(item.sizes).forEach(([sizeName, sizeData]: [string, any]) => {
					sizes[sizeName] = {
						url: sizeData.url,
						width: sizeData.width || 0,
						height: sizeData.height || 0,
					};
				});
			}

			return {
				id: item.id,
				url: item.url,
				alt: item.alt || '',
				sizes: Object.keys(sizes).length > 0 ? sizes : undefined,
			};
		});
		onChange(images);
	};

	const onClearAll = () => {
		onChange([]);
	};

	return (
		<BaseControl
			help={help}
			__nextHasNoMarginBottom
		>
			{/* Dynamic Tags Active - show unified dark panel */}
			{isDynamicTagsActive ? (
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
					marginBottom: '16px',
				}}>
					{/* Header row: Label */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
						marginBottom: '8px',
					}}>
						<span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, fontSize: '13px' }}>{label}</span>
					</div>

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
							onClick={handleEditTags}
							style={{
								flex: 1,
								fontSize: '11px',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.3px',
								color: '#fff',
								background: 'transparent',
								border: 'none',
								cursor: 'pointer',
								padding: '4px 0',
								textAlign: 'center',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								fontSize: '11px',
								fontWeight: 600,
								textTransform: 'uppercase',
								letterSpacing: '0.3px',
								color: '#fff',
								background: 'transparent',
								border: 'none',
								cursor: 'pointer',
								padding: '4px 0',
								textAlign: 'center',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				<>
					{/* Normal state: Header + Gallery control */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						marginBottom: '8px',
					}}>
						<span style={{ fontWeight: 500, fontSize: '13px' }}>{label}</span>

						{/* Dynamic tag button */}
						{enableDynamicTags && <EnableTagsButton onClick={handleEnableTags} />}
					</div>

					<div className="voxel-fse-gallery-control">
						{hasImages ? (
							<>
								{/* Header with image count and clear button */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										padding: '8px 12px',
										backgroundColor: '#f0f0f0',
										borderRadius: '4px 4px 0 0',
										borderBottom: '1px solid #ddd',
									}}
								>
									<span
										style={{
											fontSize: '13px',
											fontWeight: 500,
											color: '#1e1e1e',
										}}
									>
										{value.length} {value.length === 1 ? __('Image Selected', 'voxel-fse') : __('Images Selected', 'voxel-fse')}
									</span>
									<button
										type="button"
										onClick={onClearAll}
										style={{
											background: 'none',
											border: 'none',
											padding: '4px',
											cursor: 'pointer',
											color: '#757575',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
										}}
										title={__('Clear all images', 'voxel-fse')}
										aria-label={__('Clear all images', 'voxel-fse')}
									>
										<i className="eicon eicon-trash-o" style={{ fontSize: '16px' }} />
									</button>
								</div>

								{/* Gallery grid with edit overlay */}
								<MediaUploadCheck>
									<MediaUpload
										onSelect={onSelectImages}
										allowedTypes={['image']}
										multiple
										gallery
										value={value.map((img) => img.id).filter(Boolean) as number[]}
										render={({ open }) => (
											<div
												style={{
													position: 'relative',
													backgroundColor: '#f0f0f0',
													padding: '12px',
													borderRadius: '0 0 4px 4px',
													cursor: 'pointer',
												}}
												onClick={open}
												onKeyDown={(e) => {
													if (e.key === 'Enter' || e.key === ' ') {
														open();
													}
												}}
												onMouseEnter={() => setIsHovering(true)}
												onMouseLeave={() => setIsHovering(false)}
												role="button"
												tabIndex={0}
											>
												{/* Image grid */}
												<div
													style={{
														display: 'grid',
														gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
														gap: '6px',
													}}
												>
													{value.map((image, index) => (
														<div
															key={image.id || index}
															style={{
																aspectRatio: '1',
																borderRadius: '3px',
																overflow: 'hidden',
																backgroundColor: '#e0e0e0',
															}}
														>
															<img
																src={image.url}
																alt={image.alt || ''}
																style={{
																	width: '100%',
																	height: '100%',
																	objectFit: 'cover',
																}}
															/>
														</div>
													))}
												</div>

												{/* Edit overlay - shows on hover */}
												<div
													style={{
														position: 'absolute',
														top: 0,
														left: 0,
														right: 0,
														bottom: 0,
														backgroundColor: 'rgba(0, 0, 0, 0.5)',
														borderRadius: '0 0 4px 4px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														opacity: isHovering ? 1 : 0,
														transition: 'opacity 0.2s ease',
														pointerEvents: 'none',
													}}
												>
													<div
														style={{
															width: '36px',
															height: '36px',
															borderRadius: '50%',
															backgroundColor: 'rgba(255, 255, 255, 0.9)',
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'center',
														}}
													>
														<i
															className="eicon eicon-pencil"
															style={{
																fontSize: '16px',
																color: '#1e1e1e',
															}}
														/>
													</div>
												</div>
											</div>
										)}
									/>
								</MediaUploadCheck>
							</>
						) : (
							/* Empty state - No images selected */
							<MediaUploadCheck>
								<MediaUpload
									onSelect={onSelectImages}
									allowedTypes={['image']}
									multiple
									gallery
									value={[]}
									render={({ open }) => (
										<div
											style={{
												backgroundColor: '#f0f0f0',
												borderRadius: '4px',
												overflow: 'hidden',
											}}
										>
											{/* Header */}
											<div
												style={{
													padding: '8px 12px',
													borderBottom: '1px solid #ddd',
												}}
											>
												<span
													style={{
														color: '#757575',
														fontSize: '13px',
													}}
												>
													{__('No Images Selected', 'voxel-fse')}
												</span>
											</div>
											{/* Upload button area */}
											<div
												style={{
													padding: '12px',
												}}
											>
												<div
													style={{
														width: '48px',
														height: '48px',
														backgroundColor: isAddButtonHovering ? '#3a4046' : '#515962',
														borderRadius: '4px',
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'center',
														cursor: 'pointer',
														transition: 'background-color 0.2s ease',
													}}
													onClick={open}
													onKeyDown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') {
															open();
														}
													}}
													onMouseEnter={() => setIsAddButtonHovering(true)}
													onMouseLeave={() => setIsAddButtonHovering(false)}
													role="button"
													tabIndex={0}
													aria-label={__('Add images', 'voxel-fse')}
												>
													<i
														className="eicon eicon-plus-circle"
														style={{
															fontSize: '14px',
															color: '#ffffff',
														}}
													/>
												</div>
											</div>
										</div>
									)}
								/>
							</MediaUploadCheck>
						)}
					</div>
				</>
			)}

			{/* Dynamic Tag Builder Modal */}
			{enableDynamicTags && isTagModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label || ''}
					context={dynamicTagContext}
					onClose={() => setIsTagModalOpen(false)}
					autoOpen={true}
				/>
			)}

		</BaseControl>
	);
}
