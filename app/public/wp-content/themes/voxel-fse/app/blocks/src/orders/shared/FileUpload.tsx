/**
 * Orders Block - File Upload Component
 *
 * Handles file uploads within orders with drag & drop, file selection,
 * and media library integration. Matches Voxel's fileUpload Vue component.
 *
 * Reference: voxel-orders.beautified.js lines 527-716
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { FileUploadProps, UploadedFile } from '../types';

// Extend window for global file cache
declare global {
	interface Window {
		_vx_file_upload_cache?: UploadedFile[];
	}
}

// Voxel helpers type
declare const Voxel: {
	helpers: {
		sequentialId: () => number;
		randomId: (length: number) => string;
	};
};

/**
 * Generate random ID for file tracking
 * Reference: voxel-orders.beautified.js line 623
 */
function generateRandomId(length: number = 8): string {
	if (typeof Voxel !== 'undefined' && Voxel.helpers?.randomId) {
		return Voxel.helpers.randomId(length);
	}
	// Fallback implementation
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Generate sequential ID for input elements
 * Reference: voxel-orders.beautified.js line 557
 */
let sequentialCounter = 0;
function generateSequentialId(): string {
	if (typeof Voxel !== 'undefined' && Voxel.helpers?.sequentialId) {
		return `file-upload-${Voxel.helpers.sequentialId()}`;
	}
	return `file-upload-${++sequentialCounter}`;
}

/**
 * File Upload Component
 *
 * Provides drag & drop file upload with media library integration.
 */
export default function FileUpload({
	field,
	value,
	onChange,
	context,
}: FileUploadProps) {
	const [dragActive, setDragActive] = useState(false);
	const [files, setFiles] = useState<UploadedFile[]>(value || []);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useRef(generateSequentialId());

	// Sync with external value changes
	useEffect(() => {
		setFiles(value || []);
	}, [value]);

	// Cleanup object URLs on unmount
	// Reference: voxel-orders.beautified.js lines 577-589
	useEffect(() => {
		return () => {
			// Delay cleanup to prevent issues during re-renders
			setTimeout(() => {
				files.forEach((file) => {
					if (file.source === 'new_upload' && file.preview) {
						URL.revokeObjectURL(file.preview);
					}
				});
			}, 10);
		};
	}, []);

	/**
	 * Push a file to the upload queue
	 * Reference: voxel-orders.beautified.js lines 608-645
	 */
	const pushFile = useCallback(
		(file: File) => {
			// Single file mode: clear existing
			if (field.maxFileCount === 1) {
				setFiles([]);
			}

			const fileData: UploadedFile = {
				source: 'new_upload',
				name: file.name,
				type: file.type,
				size: file.size,
				preview: URL.createObjectURL(file),
				item: file,
				_id: generateRandomId(8),
			};

			// Initialize global file cache if needed
			if (window._vx_file_upload_cache === undefined) {
				window._vx_file_upload_cache = [];
			}

			// Check for duplicate file in cache
			const existingFile = window._vx_file_upload_cache.find(
				(cached) =>
					cached.item?.name === file.name &&
					cached.item?.type === file.type &&
					cached.item?.size === file.size &&
					cached.item?.lastModified === file.lastModified
			);

			let newFiles: UploadedFile[];
			if (existingFile) {
				newFiles = [...files, existingFile];
			} else {
				newFiles = [...files, fileData];
				window._vx_file_upload_cache.unshift(fileData);
			}

			// Respect max file count
			if (field.maxFileCount > 0 && newFiles.length > field.maxFileCount) {
				newFiles = newFiles.slice(-field.maxFileCount);
			}

			setFiles(newFiles);
			onChange(newFiles);
		},
		[files, field.maxFileCount, onChange]
	);

	/**
	 * Handle native file input change
	 * Reference: voxel-orders.beautified.js lines 564-574
	 */
	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const inputFiles = event.target.files;
			if (!inputFiles) return;

			for (let i = 0; i < inputFiles.length; i++) {
				pushFile(inputFiles[i]);
			}

			// Clear input for re-selection of same file
			if (inputRef.current) {
				inputRef.current.value = '';
			}
		},
		[pushFile]
	);

	/**
	 * Handle drag & drop
	 * Reference: voxel-orders.beautified.js lines 650-667
	 */
	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			event.stopPropagation();
			setDragActive(false);

			if (event.dataTransfer.items) {
				Array.from(event.dataTransfer.items).forEach((item) => {
					if (item.kind === 'file') {
						const file = item.getAsFile();
						if (file) {
							pushFile(file);
						}
					}
				});
			} else {
				Array.from(event.dataTransfer.files).forEach((file) => {
					pushFile(file);
				});
			}
		},
		[pushFile]
	);

	/**
	 * Handle drag events
	 */
	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setDragActive(true);
	}, []);

	const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setDragActive(false);
	}, []);

	/**
	 * Remove a file from the list
	 */
	const removeFile = useCallback(
		(fileToRemove: UploadedFile) => {
			const newFiles = files.filter((file) => {
				if (file.source === 'existing' && fileToRemove.source === 'existing') {
					return file.id !== fileToRemove.id;
				}
				if (file.source === 'new_upload' && fileToRemove.source === 'new_upload') {
					return file._id !== fileToRemove._id;
				}
				return true;
			});

			// Revoke object URL for new uploads
			if (fileToRemove.source === 'new_upload' && fileToRemove.preview) {
				URL.revokeObjectURL(fileToRemove.preview);
			}

			setFiles(newFiles);
			onChange(newFiles);
		},
		[files, onChange]
	);

	/**
	 * Get background style for file preview
	 * Reference: voxel-orders.beautified.js lines 596-600
	 */
	const getPreviewStyle = useCallback((file: UploadedFile): React.CSSProperties => {
		if (file.type.startsWith('image/')) {
			return { backgroundImage: `url('${file.preview}')` };
		}
		return {};
	}, []);

	/**
	 * Format file size for display
	 */
	const formatFileSize = useCallback((bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}, []);

	/**
	 * Check if we can add more files
	 */
	const canAddMore = field.maxFileCount === 0 || files.length < field.maxFileCount;

	return (
		<div className="vx-file-upload">
			{/* File Label */}
			{field.label && (
				<label htmlFor={inputId.current} className="vx-file-upload-label">
					{field.label}
				</label>
			)}

			{/* Drag & Drop Zone */}
			{canAddMore && (
				<div
					className={`vx-file-upload-zone ${dragActive ? 'vx-drag-active' : ''}`}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
				>
					<div className="vx-file-upload-content">
						<span className="vx-file-upload-icon">
							<i className="las la-cloud-upload-alt"></i>
						</span>
						<span className="vx-file-upload-text">
							Drag files here or{' '}
							<label htmlFor={inputId.current} className="vx-file-upload-browse">
								browse
							</label>
						</span>
						{field.allowedFileTypes && (
							<span className="vx-file-upload-types">
								Allowed: {field.allowedFileTypes}
							</span>
						)}
					</div>

					{/* Hidden file input */}
					<input
						ref={inputRef}
						id={inputId.current}
						type="file"
						className="vx-file-input-hidden"
						accept={field.allowedFileTypes || undefined}
						multiple={field.maxFileCount !== 1}
						onChange={handleInputChange}
					/>
				</div>
			)}

			{/* File List */}
			{files.length > 0 && (
				<ul className="vx-file-upload-list simplify-ul">
					{files.map((file) => {
						const key = file.source === 'existing' ? `existing-${file.id}` : `new-${file._id}`;
						const isImage = file.type.startsWith('image/');

						return (
							<li key={key} className="vx-file-upload-item">
								{/* Preview */}
								<div
									className={`vx-file-preview ${isImage ? 'vx-file-preview-image' : 'vx-file-preview-file'}`}
									style={getPreviewStyle(file)}
								>
									{!isImage && (
										<span className="vx-file-icon">
											<i className="las la-file"></i>
										</span>
									)}
								</div>

								{/* File Info */}
								<div className="vx-file-info">
									<span className="vx-file-name">{file.name}</span>
									<span className="vx-file-size">{formatFileSize(file.size)}</span>
								</div>

								{/* Remove Button */}
								<button
									type="button"
									className="vx-file-remove ts-icon-btn"
									onClick={() => removeFile(file)}
									aria-label="Remove file"
								>
									<i className="las la-times"></i>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
