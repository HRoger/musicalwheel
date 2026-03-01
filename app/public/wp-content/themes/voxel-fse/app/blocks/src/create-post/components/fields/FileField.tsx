/**
 * File Field Component - ENHANCED to Level 3 (FULLY FUNCTIONAL)
 * Handles: file, image, profile-avatar, logo, cover-image, gallery field types
 *
 * NOTE: Voxel only defines 3 official field types: file, image, profile-avatar
 * However, logo/cover-image/gallery may appear as types in legacy configs
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/file-field.php
 *
 * Enhancement Level: Level 3 (Complete Backend Integration)
 * Enhancement Date: 2025-12-02 (Dual-Channel Implementation)
 *
 * ✅ FULLY FUNCTIONAL - Complete Implementation:
 * ═══════════════════════════════════════════════════════════════════════════════
 * This component now has FULL backend integration matching Voxel 1:1.
 *
 * Features Implemented:
 * ✅ Files show in UI with preview (blob URLs)
 * ✅ Validation works (size, count, type checking)
 * ✅ Drag & drop support
 * ✅ File removal
 * ✅ Files uploaded to WordPress media library on form submission
 * ✅ Files persist after page reload (stored as attachment IDs)
 * ✅ Form submission saves file attachments correctly
 * ✅ Supports mix of new uploads and existing files
 * ✅ Validation error support from field.validation.errors
 * ✅ Description tooltip (vx-dialog)
 * ✅ Optional label display when not required
 * ✅ ts-has-errors class for error styling
 *
 * Implementation Details:
 * - Uses Voxel's dual-channel approach (see useFormSubmission.ts)
 * - Channel 1: JSON postdata with markers ['uploaded_file', 'uploaded_file', 123]
 * - Channel 2: FormData with actual File objects at files[field_id][]
 * - Backend correlates markers with files using File_Uploader utility
 * - Files are uploaded during form submission (no pre-upload needed)
 *
 * Evidence:
 * - Frontend: themes/voxel/assets/dist/create-post.js - File field onSubmit
 * - Backend: themes/voxel/app/post-types/fields/file-field.php lines 44-67
 * - Implementation: app/blocks/src/create-post/hooks/useFormSubmission.ts lines 172-219, 355-393
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Value structure: Array of FileObject
 * [{ source: 'new_upload', file: File, name: 'file.jpg', type: 'image/jpeg', preview: 'blob:...' }]
 * [{ source: 'existing', id: 123, name: 'file.jpg', type: 'image/jpeg', preview: 'url' }]
 */
import React, { useRef, useState, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { getUploadIcon } from '../../utils/fieldIconsHelper';
import { MediaPopup } from '@shared';

// Global cache for session files - shared with MediaPopup
interface SessionFile {
	source: 'new_upload';
	name: string;
	type: string;
	size: number;
	preview: string;
	item: File;
	_id: string;
}

// Initialize global cache (use any cast to avoid Window interface conflicts)
if (typeof window !== 'undefined' && typeof (window as any)._vx_file_upload_cache === 'undefined') {
	(window as any)._vx_file_upload_cache = [];
}

// Generate unique 8-character session ID (matches Voxel pattern)
const generateSessionId = (): string => {
	return Math.random().toString(36).substring(2, 10);
};

// Add file to global cache with deduplication
const addToSessionCache = (file: File): string => {
	if (!Array.isArray((window as any)._vx_file_upload_cache)) {
		(window as any)._vx_file_upload_cache = [];
	}

	// Check if file already exists (by name, type, size, lastModified)
	const exists = (window as any)._vx_file_upload_cache.find(
		(cached: SessionFile) =>
			cached.name === file.name &&
			cached.type === file.type &&
			cached.size === file.size &&
			cached.item!.lastModified === file.lastModified
	);

	if (exists) {
		return exists._id ?? '';
	}

	// Create new session file
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

	// Add to cache (unshift = add to beginning, most recent first)
	(window as any)._vx_file_upload_cache.unshift(sessionFile);

	return sessionId;
};

interface FileObject {
	source: 'existing' | 'new_upload';
	id?: number; // WordPress attachment ID (existing files)
	_id?: string; // Session ID (new uploads)
	file?: File;
	name: string;
	type: string;
	preview?: string;
	url?: string; // Backend may return 'url' instead of 'preview' for existing files
}

interface MediaPopupFile {
	source: 'new_upload' | 'existing';
	id?: number;
	_id?: string;
	file?: File;
	name: string;
	type: string;
	preview?: string;
}

interface FileFieldProps {
	field: VoxelField;
	value: FileObject[];
	onChange: (value: FileObject[]) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const FileField: React.FC<FileFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragActive, setDragActive] = useState(false);
	// Drag-reorder state for sortable files
	const [dragReorderIndex, setDragReorderIndex] = useState<number | null>(null);

	// Normalize value to FileObject array
	const files: FileObject[] = Array.isArray(value) ? value : [];

	// Cleanup blob URLs on unmount to prevent memory leaks
	// Evidence: Voxel calls URL.revokeObjectURL() in unmounted hook
	useEffect(() => {
		return () => {
			files.forEach((file) => {
				if (file.source === 'new_upload' && file.preview?.startsWith('blob:')) {
					URL.revokeObjectURL(file.preview);
				}
			});
		};
	}, []);

	// Field configuration from Voxel props
	const maxCount = field.props?.['max-count'] || field.props?.['maxCount'] || 1;
	// Evidence: file-field-trait.php:145 — sortable flag enables drag-and-drop reordering
	const sortable = field.props?.['sortable'] === true;
	const isImageField = field.type === 'image' || field.type === 'profile-avatar' || field.type === 'logo' || field.type === 'cover-image' || field.type === 'gallery';

	// Preview images - always true (Voxel backend always returns previews)
	const previewImages = true;

	// Get allowed file types
	// Evidence: file-field-trait.php:144 returns 'allowedTypes' (camelCase)
	const getAllowedTypes = () => {
		if (isImageField) return 'image/*';
		const allowedTypes = field.props?.['allowedTypes'] || field.props?.['allowed-types'] || [];
		return Array.isArray(allowedTypes) && allowedTypes.length > 0 ? allowedTypes.join(',') : '*';
	};

	// Get validation error
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Handle file selection
	const handleFileSelect = async (selectedFiles: FileList | null) => {
		if (!selectedFiles) return;

		const newFiles: FileObject[] = [];
		const maxSize = Number(field.props?.['max-size'] || field.props?.['maxSize'] || 2000) * 1000; // Convert KB to bytes
		const validationErrors: string[] = [];

		// Get allowed MIME types for validation
		const allowedTypes = field.props?.['allowedTypes'] || field.props?.['allowed-types'] || [];
		const allowedMimes: string[] = Array.isArray(allowedTypes) ? allowedTypes : [];

		// Process all selected files (matches Voxel: allow upload, then validate)
		for (let i = 0; i < selectedFiles.length; i++) {
			const file = selectedFiles[i];

			// Validate MIME type against allowedTypes
			// Evidence: Voxel file-field-trait.php validates allowed_types server-side
			if (allowedMimes.length > 0 && !allowedMimes.some((mime) => {
				if (mime.endsWith('/*')) {
					return file.type.startsWith(mime.replace('/*', '/'));
				}
				return file.type === mime;
			})) {
				validationErrors.push(`${file.name}: file type not allowed`);
				continue;
			}

			// Add file to global session cache (shared with MediaPopup)
			const sessionId = addToSessionCache(file);

			const fileObj: FileObject = {
				source: 'new_upload',
				file: file,
				name: file.name,
				type: file.type,
				_id: sessionId, // Session ID for MediaPopup tracking
			};

			// Create blob URL preview for images (matches Voxel: blob URLs not base64)
			if (previewImages && file.type.startsWith('image/')) {
				fileObj.preview = URL.createObjectURL(file);
			}

			newFiles.push(fileObj);

			// Validate file size (matches Voxel file-field-trait.php line 91-98)
			if (file.size > maxSize) {
				const limitMB = maxSize / 1000000; // Convert bytes to MB
				validationErrors.push(`${file.name} is over the ${limitMB} MB limit`);
			}
		}

		// Add new files to existing files (Voxel allows upload even if over limit)
		const allFiles = [...files, ...newFiles];
		onChange(allFiles);

		// Validate file count AFTER adding files (matches Voxel file-field-trait.php line 65-70)
		if (allFiles.length > Number(maxCount)) {
			validationErrors.push(`You cannot pick more than ${Number(maxCount)} ${Number(maxCount) === 1 ? 'file' : 'files'}`);
		}

		// Set validation errors (matches Voxel: errors displayed in label area)
		if (field.validation) {
			field.validation.errors = validationErrors;
		}
	};

	// Handle drag & drop - uses DataTransferItemList API with .files fallback
	// Evidence: Modern browsers provide items[] which filters non-file entries
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);

		// Prefer DataTransferItemList (filters non-file items like text selections)
		if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
			const dt = new DataTransfer();
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				const item = e.dataTransfer.items[i];
				if (item.kind === 'file') {
					const file = item.getAsFile();
					if (file) dt.items.add(file);
				}
			}
			handleFileSelect(dt.files);
		} else {
			handleFileSelect(e.dataTransfer.files);
		}
	};

	// Remove file
	const removeFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		onChange(newFiles);
	};

	// Drag-reorder handlers for sortable files
	// Evidence: file-field-trait.php:136-137 — Voxel enqueues 'sortable' and 'vue-draggable' when sortable=true
	const handleDragReorderStart = (index: number) => {
		setDragReorderIndex(index);
	};

	const handleDragReorderOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (dragReorderIndex === null || dragReorderIndex === index) return;

		const reordered = [...files];
		const [moved] = reordered.splice(dragReorderIndex, 1);
		reordered.splice(index, 0, moved);
		onChange(reordered);
		setDragReorderIndex(index);
	};

	const handleDragReorderEnd = () => {
		setDragReorderIndex(null);
	};

	// Handle media library file selection - matches Voxel file-field.php line 63 @save callback
	const handleMediaPopupSave = (selectedFiles: MediaPopupFile[]) => {
		// Convert media library files to FileObject format
		// Handle both session files (with _id and file) and existing files (with id)
		const mediaFiles: FileObject[] = selectedFiles.map((file) => {
			// Session file (new upload from cache)
			if (file.source === 'new_upload' && file._id && file.file) {
				return {
					source: 'new_upload' as const,
					_id: file._id,
					file: file.file,
					name: file.name,
					type: file.type,
					preview: file.preview,
				};
			}

			// Existing file (from media library)
			return {
				source: 'existing' as const,
				id: file.id,
				name: file.name,
				type: file.type,
				preview: file.preview,
			};
		});

		// Add to existing files
		const allFiles = [...files, ...mediaFiles];
		onChange(allFiles);

		// Validate file count (same as upload validation)
		const validationErrors: string[] = [];
		if (allFiles.length > Number(maxCount)) {
			validationErrors.push(`You cannot pick more than ${Number(maxCount)} ${Number(maxCount) === 1 ? 'file' : 'files'}`);
		}

		// Set validation errors
		if (field.validation) {
			field.validation.errors = validationErrors;
		}
	};

	// Get background style for image preview
	// CRITICAL FIX: Backend may return 'url' instead of 'preview' for existing files
	const getStyle = (file: FileObject) => {
		const imageUrl = file.preview || file.url;
		if (imageUrl) {
			return {
				backgroundImage: `url(${imageUrl})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
			};
		}
		return {};
	};

	return (
		<div
			className={`ts-form-group ts-file-upload inline-file-field field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}
			onDragEnter={() => setDragActive(true)}
		>
			{/* Drag overlay - matches Voxel file-field.php line 3 */}
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

			{/* Label with description tooltip - matches Voxel file-field.php lines 4-13 */}
			<label>
				{field.label}

				{/* Error message or Optional label */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* Description tooltip (vx-dialog) - Voxel file-field.php lines 7-12 */}
				{field.description && (
					<div className="vx-dialog">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
						</svg>
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* File list - matches Voxel file-field.php lines 15-59 */}
			<div className="ts-file-list">
				{/* Upload button - matches Voxel file-field.php lines 16-21 */}
				<div className="pick-file-input">
					<a href="#" onClick={(e) => {
						e.preventDefault();
						inputRef.current?.click();
					}}>
						{getUploadIcon(icons)}
						Upload
					</a>
				</div>

				{/* File items - matches Voxel file-field.php lines 47-57 */}
				{files.map((file, index) => (
					<div
						key={index}
						className={`ts-file ${previewImages && file.type.startsWith('image/') ? 'ts-file-img' : ''} ${dragReorderIndex === index ? 'ts-dragging' : ''}`}
						style={getStyle(file)}
						{...(sortable ? {
							draggable: true,
							onDragStart: () => handleDragReorderStart(index),
							onDragOver: (e: React.DragEvent) => handleDragReorderOver(e, index),
							onDragEnd: handleDragReorderEnd,
						} : {})}
					>
						<div className="ts-file-info">
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6.84487 8.0941L11.4545 3.48744C11.5913 3.34131 11.786 3.25 12.002 3.25C12.2347 3.25 12.4427 3.356 12.5802 3.52235L17.1552 8.09408C17.3698 8.30854 17.434 8.63117 17.318 8.91149C17.2019 9.19181 16.9284 9.3746 16.625 9.3746H12.752L12.752 16C12.752 16.4142 12.4162 16.75 12.002 16.75C11.5878 16.75 11.252 16.4142 11.252 16L11.252 9.3746L7.37503 9.3746C7.07164 9.3746 6.79813 9.19181 6.68208 8.9115C6.56602 8.63119 6.63027 8.30856 6.84487 8.0941Z" fill="#343C54" />
								<path d="M4.75 16C4.75 15.5858 4.41421 15.25 4 15.25C3.58579 15.25 3.25 15.5858 3.25 16V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5009C19.7435 20.75 20.7509 19.7426 20.7509 18.5V16C20.7509 15.5858 20.4151 15.25 20.0009 15.25C19.5867 15.25 19.2509 15.5858 19.2509 16V18.5C19.2509 18.9142 18.9151 19.25 18.5009 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V16Z" fill="#343C54" />
							</svg>
							<code>{file.name}</code>
						</div>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								removeFile(index);
							}}
							className="ts-remove-file flexify"
						>
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54" />
								<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54" />
							</svg>
						</a>
					</div>
				))}
			</div>

			{/* Media library popup - matches Voxel file-field.php lines 61-66 */}
			{/* MediaPopup is OUTSIDE ts-file-list (sibling, not child) */}
			<div style={{ textAlign: 'center', marginTop: '15px' }}>
				<MediaPopup
					onSave={handleMediaPopupSave}
					multiple={Number(maxCount) > 1}
					saveLabel="Save"
				/>
			</div>

			{/* Hidden file input - matches Voxel file-field.php line 68 */}
			<input
				ref={inputRef}
				type="file"
				className="hidden"
				multiple={Number(maxCount) > 1}
				accept={getAllowedTypes()}
				onChange={(e) => handleFileSelect(e.target.files)}
				onBlur={onBlur}
				style={{ display: 'none' }}
			/>
		</div>
	);
};
