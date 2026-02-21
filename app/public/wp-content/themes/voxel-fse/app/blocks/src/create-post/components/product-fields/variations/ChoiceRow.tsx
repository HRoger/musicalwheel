/**
 * ChoiceRow Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Displays a single choice within an attribute with drag-and-drop support.
 * Conditionally shows color picker or image upload based on display mode.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php:40-81
 * - Choice row: collapsed by default
 * - Label text: "Untitled"
 * - "Label" field with ts-choice-label class and vx-2-3 for colors mode
 * - Input wrapper: input-container with ts-filter class
 * - Color picker: ts-cp-con wrapper with ts-color-picker class
 * - Has enter key handler to create next choice
 * - Image upload for cards/images display modes
 */
import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
	AttributeChoice,
	AttributeDisplayMode,
		AttributeChoiceImageNewUpload,
	AttributeChoiceImageExisting,
} from '../../../types';
import { MediaPopup } from '@shared';

// Session file cache types (shared with FileField)
interface SessionFile {
	source: 'new_upload';
	name: string;
	type: string;
	size: number;
	preview: string;
	item: File;
	_id: string;
}

/**
 * Media popup selected file - new upload variant
 */
interface MediaPopupNewUpload {
	source: 'new_upload';
	_id: string;
	file: File;
	name: string;
	type: string;
	preview: string;
}

/**
 * Media popup selected file - existing media library variant
 */
interface MediaPopupExisting {
	source: 'existing';
	id: number;
	url: string;
	alt?: string;
}

/**
 * Union type for media popup selected files
 */
type MediaPopupSelectedFile = MediaPopupNewUpload | MediaPopupExisting;

// _vx_file_upload_cache is declared globally in voxelShim.ts

// Initialize global cache
if (typeof window !== 'undefined' && typeof (window as any)._vx_file_upload_cache === 'undefined') {
	(window as any)._vx_file_upload_cache = [];
}

// Generate unique session ID
const generateSessionId = (): string => {
	return Math.random().toString(36).substring(2, 10);
};

// Add file to global cache
const addToSessionCache = (file: File): string => {
	if (!Array.isArray((window as any)._vx_file_upload_cache)) {
		(window as any)._vx_file_upload_cache = [];
	}

	const exists = (window as any)._vx_file_upload_cache.find(
		(cached: any) =>
			cached.name === file.name &&
			cached.type === file.type &&
			cached.size === file.size &&
			cached.item.lastModified === file.lastModified
	);

	if (exists) {
		return exists._id;
	}

	const sessionId = generateSessionId();
	const sessionFile: SessionFile = {
		source: 'new_upload',
		name: file.name,
		type: file.type,
		size: file.size,
		preview: URL.createObjectURL(file),
		item: file,
		_id: sessionId,
	};

	(window as any)._vx_file_upload_cache.unshift(sessionFile);
	return sessionId;
};

/**
 * Component props interface
 */
interface ChoiceRowProps {
	choice: AttributeChoice;
	displayMode: AttributeDisplayMode;
	isActive: boolean;
	needsColor: boolean;
	needsSubheading: boolean;
	needsImage: boolean;
	onToggle: () => void;
	onUpdate: (updates: Partial<AttributeChoice>) => void;
	onRemove: () => void;
	onCreateNext: () => void;
}

/**
 * ChoiceRow Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations/attribute.php
 */
export const ChoiceRow: React.FC<ChoiceRowProps> = ({
	choice,
	displayMode: _displayMode,
	isActive,
	needsColor,
	needsSubheading,
	needsImage,
	onToggle,
	onUpdate,
	onRemove,
	onCreateNext,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragActive, setDragActive] = useState(false);

	// Set up drag-and-drop functionality
	const {
		attributes: dndAttributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: choice._uid });

	// Apply drag transform styles
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// Image handling
	const hasImage = !!choice.image;

	// Handle image file selection
	const handleImageSelect = (files: FileList | null) => {
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.type.startsWith('image/')) return;

		const sessionId = addToSessionCache(file);
		const newImage: AttributeChoiceImageNewUpload = {
			source: 'new_upload',
			_id: sessionId,
			file: file,
			name: file.name,
			type: file.type,
			preview: URL.createObjectURL(file),
		};
		onUpdate({ image: newImage });
	};

	// Handle drag & drop for image
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		handleImageSelect(e.dataTransfer.files);
	};

	// Handle media popup save
	const handleMediaPopupSave = (selectedFiles: MediaPopupSelectedFile[]) => {
		if (selectedFiles.length === 0) return;

		const file = selectedFiles[0];
		if (file.source === 'new_upload' && file._id && file.file) {
			const newImage: AttributeChoiceImageNewUpload = {
				source: 'new_upload',
				_id: file._id,
				file: file.file,
				name: file.name,
				type: file.type,
				preview: file.preview,
			};
			onUpdate({ image: newImage });
		} else if (file.source === 'existing') {
			const existingImage: AttributeChoiceImageExisting = {
				source: 'existing',
				id: file.id,
				url: file.url,
				name: (file as any).name,
				type: (file as any).type,
				preview: file.url,
			};
			onUpdate({ image: existingImage });
		}
	};

	// Remove image
	const removeImage = () => {
		onUpdate({ image: undefined });
	};

	// Get image style for preview
	const getImageStyle = (): React.CSSProperties => {
		const img = choice.image;
		if (!img) return {};

		// Handle string URL (legacy/simple case)
		if (typeof img === 'string') {
			return {
				backgroundImage: `url(${img})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			};
		}

		// Handle object with preview property
		const previewUrl = img.source === 'new_upload' ? img.preview : (img.preview || img.url);
		if (previewUrl) {
			return {
				backgroundImage: `url(${previewUrl})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			};
		}
		return {};
	};

	// Get image name for display
	const getImageName = (): string => {
		const img = choice.image;
		if (!img) return 'Image';
		if (typeof img === 'string') return 'Image';
		return img.name || 'Image';
	};

	/**
	 * Handle label change
	 * Auto-generates value (slug) from label
	 */
	const handleLabelChange = (label: string) => {
		const value = label
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');

		onUpdate({ label, value });
	};

	/**
	 * Handle enter key to create next choice - matches Voxel @keyup.enter
	 */
	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && choice.label?.length) {
			onCreateNext();
		}
	};

	// Display label (show placeholder if empty) - matches Voxel "Untitled"
	const displayLabel = choice.label || 'Untitled';

	// CSS classes for row state - matches Voxel :class="{collapsed: activeChoice !== choice}"
	const rowClasses = ['ts-field-repeater', isActive ? '' : 'collapsed']
		.filter(Boolean)
		.join(' ');

	// Label field class - matches Voxel :class="{'vx-2-3': attribute.display_mode === 'colors'}"
	const labelFieldClass = needsColor
		? 'ts-form-group ts-choice-label vx-2-3'
		: 'ts-form-group ts-choice-label';

	return (
		<div ref={setNodeRef} style={style} className={rowClasses}>
			{/* Row header with drag handle - matches Voxel attribute.php:42 */}
			<div className="ts-repeater-head" onClick={onToggle}>
				{/* Drag handle icon - matches Voxel handle.svg */}
				<svg
					{...dndAttributes}
					{...listeners}
					id="Layer_1"
					data-name="Layer 1"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 288 480"
					style={{ cursor: 'grab' }}
				>
					<path d="M48,96A48,48,0,1,0,0,48,48,48,0,0,0,48,96Zm0,192A48,48,0,1,0,0,240,48,48,0,0,0,48,288ZM96,432a48,48,0,1,1-48-48A48,48,0,0,1,96,432ZM240,96a48,48,0,1,0-48-48A48,48,0,0,0,240,96Zm48,144a48,48,0,1,1-48-48A48,48,0,0,1,288,240ZM240,480a48,48,0,1,0-48-48A48,48,0,0,0,240,480Z" style={{ fillRule: 'evenodd' }} />
				</svg>

				{/* Choice label - matches Voxel attribute.php:44-46 */}
				<label>{displayLabel}</label>

				{/* Controller buttons - matches Voxel attribute.php:47-54 */}
				<div className="ts-repeater-controller">
					{/* Delete button - matches Voxel with no-drag class */}
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							onRemove();
						}}
						className="ts-icon-btn ts-smaller no-drag"
					>
						{/* Trash icon - matches Voxel trash-can.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54"/>
							<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54"/>
						</svg>
					</a>

					{/* Collapse/expand icon - matches Voxel with no-drag class */}
					<a
						href="#"
						className="ts-icon-btn ts-smaller no-drag"
						onClick={(e) => e.preventDefault()}
					>
						{/* Chevron down icon - matches Voxel chevron-down.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="#343C54"/>
						</svg>
					</a>
				</div>
			</div>

			{/* Choice fields - matches Voxel attribute.php:56-80 */}
			{isActive && (
				<div className="medium form-field-grid">
					{/* Label input - matches Voxel attribute.php:57-62 */}
					<div className={labelFieldClass}>
						<label>Label</label>
						<div className="input-container">
							<input
								type="text"
								value={choice.label}
								onChange={(e) => handleLabelChange(e.target.value)}
								onKeyUp={handleKeyUp}
								className="ts-filter"
							/>
						</div>
					</div>

					{/* Color picker (for 'colors' mode) - matches Voxel attribute.php:63-69 */}
					{needsColor && (
						<div className="ts-form-group vx-1-3">
							<label>Color</label>
							<div className="ts-cp-con">
								<input
									type="color"
									value={choice.color || '#000000'}
									onChange={(e) => onUpdate({ color: e.target.value })}
									className="ts-color-picker"
								/>
								<input
									type="text"
									placeholder="Pick color"
									value={choice.color || ''}
									onChange={(e) => onUpdate({ color: e.target.value })}
									className="color-picker-input"
								/>
							</div>
						</div>
					)}

					{/* Subheading (for 'cards' mode) - matches Voxel attribute.php:70-75 */}
					{needsSubheading && (
						<div className="ts-form-group">
							<label>Subheading</label>
							<div className="input-container">
								<input
									type="text"
									value={choice.subheading || ''}
									onChange={(e) => onUpdate({ subheading: e.target.value })}
									className="ts-filter"
								/>
							</div>
						</div>
					)}

					{/* Image upload (for 'cards' and 'images' modes) - matches Voxel attribute.php:76-79 */}
					{needsImage && (
						<div
							className="ts-form-group ts-file-upload inline-file-field"
							onDragEnter={() => setDragActive(true)}
						>
							{/* Drag overlay */}
							{dragActive && (
								<div
									className="drop-mask"
									onDragLeave={(e) => {
										e.preventDefault();
										setDragActive(false);
									}}
									onDrop={handleDrop}
									onDragEnter={(e) => e.preventDefault()}
									onDragOver={(e) => e.preventDefault()}
								/>
							)}

							<label>Image</label>

							<div className="ts-file-list">
								{/* Upload button */}
								<div className="pick-file-input">
									<a href="#" onClick={(e) => {
										e.preventDefault();
										fileInputRef.current?.click();
									}}>
										<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M6.84487 8.0941L11.4545 3.48744C11.5913 3.34131 11.786 3.25 12.002 3.25C12.2347 3.25 12.4427 3.356 12.5802 3.52235L17.1552 8.09408C17.3698 8.30854 17.434 8.63117 17.318 8.91149C17.2019 9.19181 16.9284 9.3746 16.625 9.3746H12.752L12.752 16C12.752 16.4142 12.4162 16.75 12.002 16.75C11.5878 16.75 11.252 16.4142 11.252 16L11.252 9.3746L7.37503 9.3746C7.07164 9.3746 6.79813 9.19181 6.68208 8.9115C6.56602 8.63119 6.63027 8.30856 6.84487 8.0941Z" fill="#343C54"/>
											<path d="M4.75 16C4.75 15.5858 4.41421 15.25 4 15.25C3.58579 15.25 3.25 15.5858 3.25 16V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5009C19.7435 20.75 20.7509 19.7426 20.7509 18.5V16C20.7509 15.5858 20.4151 15.25 20.0009 15.25C19.5867 15.25 19.2509 15.5858 19.2509 16V18.5C19.2509 18.9142 18.9151 19.25 18.5009 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V16Z" fill="#343C54"/>
										</svg>
										Upload
									</a>
								</div>

								{/* Image preview */}
								{hasImage && (
									<div
										className="ts-file ts-file-img"
										style={getImageStyle()}
									>
										<div className="ts-file-info">
											<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M6.84487 8.0941L11.4545 3.48744C11.5913 3.34131 11.786 3.25 12.002 3.25C12.2347 3.25 12.4427 3.356 12.5802 3.52235L17.1552 8.09408C17.3698 8.30854 17.434 8.63117 17.318 8.91149C17.2019 9.19181 16.9284 9.3746 16.625 9.3746H12.752L12.752 16C12.752 16.4142 12.4162 16.75 12.002 16.75C11.5878 16.75 11.252 16.4142 11.252 16L11.252 9.3746L7.37503 9.3746C7.07164 9.3746 6.79813 9.19181 6.68208 8.9115C6.56602 8.63119 6.63027 8.30856 6.84487 8.0941Z" fill="#343C54"/>
												<path d="M4.75 16C4.75 15.5858 4.41421 15.25 4 15.25C3.58579 15.25 3.25 15.5858 3.25 16V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5009C19.7435 20.75 20.7509 19.7426 20.7509 18.5V16C20.7509 15.5858 20.4151 15.25 20.0009 15.25C19.5867 15.25 19.2509 15.5858 19.2509 16V18.5C19.2509 18.9142 18.9151 19.25 18.5009 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V16Z" fill="#343C54"/>
											</svg>
											<code>{getImageName()}</code>
										</div>
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												removeImage();
											}}
											className="ts-remove-file flexify"
										>
											<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54"/>
												<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54"/>
											</svg>
										</a>
									</div>
								)}
							</div>

							{/* Media library popup */}
							<div style={{ textAlign: 'center', marginTop: '15px' }}>
								<MediaPopup
									onSave={handleMediaPopupSave as any}
									multiple={false}
									saveLabel="Save"
								/>
							</div>

							{/* Hidden file input */}
							<input
								ref={fileInputRef}
								type="file"
								className="hidden"
								accept="image/*"
								onChange={(e) => handleImageSelect(e.target.files)}
								style={{ display: 'none' }}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
