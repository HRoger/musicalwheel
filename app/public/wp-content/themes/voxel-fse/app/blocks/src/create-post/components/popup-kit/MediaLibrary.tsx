/**
 * Media Library Component - WordPress Media Integration
 * 
 * Matches Voxel template: themes/voxel/templates/widgets/create-post/_media-popup.php
 * 
 * PHASE C IMPLEMENTATION:
 * - ✅ WordPress Media Library integration
 * - ✅ Drag-and-drop file upload
 * - ✅ File preview with thumbnails
 * - ✅ Sortable file list
 * - ✅ Upload progress indicators
 * - ✅ Multiple file support
 * 
 * Uses WordPress wp.media API for media library integration
 */
import React, { useCallback, useRef, useState } from 'react';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

// WordPress media types
declare global {
	interface Window {
		wp?: {
			media: (options: MediaFrameOptions) => MediaFrame;
		};
	}
}

interface MediaFrameOptions {
	title: string;
	button: {
		text: string;
	};
	multiple?: boolean;
	library?: {
		type?: string | string[];
	};
}

interface MediaFrame {
	on: (event: string, callback: () => void) => MediaFrame;
	open: () => void;
	state: () => {
		get: (key: string) => {
			toJSON: () => MediaAttachment[];
		};
	};
}

export interface MediaAttachment {
	id: number;
	title: string;
	filename: string;
	url: string;
	type: string;
	subtype: string;
	mime: string;
	sizes?: {
		thumbnail?: { url: string; width: number; height: number };
		medium?: { url: string; width: number; height: number };
		large?: { url: string; width: number; height: number };
		full?: { url: string; width: number; height: number };
	};
}

export interface FileObject {
	id: number | string;
	name: string;
	type: string;
	size: number;
	url: string;
	thumbnail?: string;
	isUploading?: boolean;
	progress?: number;
}

interface MediaLibraryProps {
	value: FileObject[];
	onChange: (files: FileObject[]) => void;
	maxFiles?: number;
	allowedTypes?: string; // e.g., 'image/*', 'application/pdf', '*'
	previewImages?: boolean;
	sortable?: boolean;
	onBlur?: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
	value = [],
	onChange,
	maxFiles = 1,
	allowedTypes = '*',
	previewImages = true,
	sortable = true,
	onBlur
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropZoneRef = useRef<HTMLDivElement>(null);

	// Check if wp.media is available (admin context)
	const hasWpMedia = typeof window !== 'undefined' && window.wp && window.wp.media;

	// Open WordPress Media Library
	const openMediaLibrary = useCallback(() => {
		if (!hasWpMedia || !window.wp?.media) {
			// Fallback to file input if wp.media not available
			fileInputRef.current?.click();
			return;
		}

		// Determine library type based on allowedTypes
		let libraryType: string | string[] | undefined;
		if (allowedTypes.startsWith('image/')) {
			libraryType = 'image';
		} else if (allowedTypes.includes(',')) {
			libraryType = allowedTypes.split(',').map(t => t.trim().split('/')[0]);
		}

		const frame = window.wp.media({
			title: 'Select Files',
			button: {
				text: 'Select'
			},
			multiple: maxFiles > 1,
			library: libraryType ? { type: libraryType } : undefined
		});

		frame.on('select', () => {
			const selection = frame.state().get('selection');
			const attachments = selection.toJSON();

			// Convert WordPress attachments to our file format
			const newFiles: FileObject[] = attachments.map((attachment: MediaAttachment) => ({
				id: attachment.id,
				name: attachment.filename || attachment.title,
				type: attachment.mime,
				size: 0, // WordPress doesn't always provide size
				url: attachment.url,
				thumbnail: attachment.sizes?.thumbnail?.url || attachment.sizes?.medium?.url || attachment.url
			}));

			// Merge with existing files (respect maxFiles)
			const combinedFiles = [...value, ...newFiles].slice(0, maxFiles);
			onChange(combinedFiles);
		});

		frame.open();
	}, [hasWpMedia, allowedTypes, maxFiles, value, onChange]);

	// Handle drag events
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Only set to false if leaving the drop zone entirely
		if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
			setIsDragOver(false);
		}
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	// Handle file drop
	const handleDrop = useCallback(async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragOver(false);
		setUploadError(null);

		const files = e.dataTransfer.files;
		if (!files || files.length === 0) return;

		// Process dropped files
		await handleFileUpload(Array.from(files));
	}, []);

	// Handle file input change
	const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		await handleFileUpload(Array.from(files));

		// Reset input
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	}, []);

	// Upload files via AJAX
	const handleFileUpload = useCallback(async (files: File[]) => {
		setUploadError(null);

		// Check max files
		const remainingSlots = maxFiles - value.length;
		if (remainingSlots <= 0) {
			setUploadError(`Maximum ${maxFiles} file(s) allowed`);
			return;
		}

		const filesToUpload = files.slice(0, remainingSlots);

		// Create placeholder file objects with uploading state
		const uploadingFiles: FileObject[] = filesToUpload.map((file, index) => ({
			id: `uploading-${Date.now()}-${index}`,
			name: file.name,
			type: file.type,
			size: file.size,
			url: URL.createObjectURL(file),
			isUploading: true,
			progress: 0
		}));

		// Add uploading placeholders to state
		const newFiles = [...value, ...uploadingFiles];
		onChange(newFiles);

		// Upload each file
		for (let i = 0; i < filesToUpload.length; i++) {
			const file = filesToUpload[i];
			const placeholderId = uploadingFiles[i].id;

			try {
				const uploaded = await uploadFileToWordPress(file, (progress) => {
					// Update progress
					onChange(prev => {
						if (!Array.isArray(prev)) return prev;
						return prev.map(f => 
							f.id === placeholderId ? { ...f, progress } : f
						);
					});
				});

				// Replace placeholder with uploaded file
				onChange(prev => {
					if (!Array.isArray(prev)) return prev;
					return prev.map(f => 
						f.id === placeholderId ? uploaded : f
					);
				});
			} catch (error) {
				console.error('Upload error:', error);
				setUploadError(`Failed to upload ${file.name}`);
				// Remove failed upload
				onChange(prev => {
					if (!Array.isArray(prev)) return prev;
					return prev.filter(f => f.id !== placeholderId);
				});
			}
		}
	}, [value, maxFiles, onChange]);

	// Upload file to WordPress via REST API
	const uploadFileToWordPress = async (
		file: File, 
		onProgress?: (progress: number) => void
	): Promise<FileObject> => {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append('file', file);

			const xhr = new XMLHttpRequest();

			// Progress handler
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable && onProgress) {
					const progress = Math.round((e.loaded / e.total) * 100);
					onProgress(progress);
				}
			};

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve({
							id: response.id,
							name: response.title?.rendered || file.name,
							type: response.mime_type,
							size: file.size,
							url: response.source_url,
							thumbnail: response.media_details?.sizes?.thumbnail?.source_url || response.source_url
						});
					} catch {
						reject(new Error('Invalid response'));
					}
				} else {
					reject(new Error(`Upload failed: ${xhr.status}`));
				}
			};

			xhr.onerror = () => reject(new Error('Upload failed'));

			// WordPress REST API endpoint for media
			// MULTISITE FIX: Use getRestBaseUrl() for proper subdirectory support
			const restUrl = getRestBaseUrl();
			const nonce = (window as Window & { wpApiSettings?: { root: string; nonce: string } })
				.wpApiSettings?.nonce || '';

			xhr.open('POST', `${restUrl}wp/v2/media`);
			xhr.setRequestHeader('X-WP-Nonce', nonce);
			xhr.setRequestHeader('Content-Disposition', `attachment; filename="${file.name}"`);
			xhr.send(formData);
		});
	};

	// Remove file
	const removeFile = useCallback((id: number | string) => {
		onChange(value.filter(f => f.id !== id));
	}, [value, onChange]);

	// Sortable drag handlers
	const handleSortStart = (index: number) => {
		if (!sortable) return;
		setDraggedIndex(index);
	};

	const handleSortOver = (index: number) => {
		if (!sortable || draggedIndex === null || draggedIndex === index) return;

		const newFiles = [...value];
		const [removed] = newFiles.splice(draggedIndex, 1);
		newFiles.splice(index, 0, removed);
		onChange(newFiles);
		setDraggedIndex(index);
	};

	const handleSortEnd = () => {
		setDraggedIndex(null);
	};

	// Get thumbnail or icon for file
	const getFilePreview = (file: FileObject) => {
		if (previewImages && file.type.startsWith('image/')) {
			return file.thumbnail || file.url;
		}
		return null;
	};

	// Determine accept attribute
	const getAcceptAttribute = () => {
		if (allowedTypes === '*') return undefined;
		return allowedTypes;
	};

	return (
		<div className="ts-media-library">
			{/* Error message */}
			{uploadError && (
				<div className="ts-notice ts-notice-error" style={{
					padding: '10px',
					backgroundColor: '#fee2e2',
					color: '#b91c1c',
					borderRadius: '4px',
					marginBottom: '10px',
					fontSize: '13px'
				}}>
					{uploadError}
				</div>
			)}

			{/* Drop Zone */}
			<div
				ref={dropZoneRef}
				className={`ts-drop-zone ${isDragOver ? 'ts-drag-over' : ''}`}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				style={{
					border: `2px dashed ${isDragOver ? '#3b82f6' : '#d1d5db'}`,
					borderRadius: '8px',
					padding: '20px',
					textAlign: 'center',
					backgroundColor: isDragOver ? '#eff6ff' : '#f9fafb',
					transition: 'all 0.2s ease',
					marginBottom: value.length > 0 ? '15px' : '0'
				}}
			>
				<div className="ts-drop-zone-content">
					{/* Upload icon */}
					<svg 
						width="40" 
						height="40" 
						viewBox="0 0 24 24" 
						fill="none" 
						xmlns="http://www.w3.org/2000/svg"
						style={{ margin: '0 auto 10px', display: 'block', color: '#9ca3af' }}
					>
						<path d="M12 16L12 8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M22 12C22 16.714 22 19.071 20.535 20.535C19.0711 22 16.714 22 12 22C7.286 22 4.929 22 3.465 20.535C2 19.0711 2 16.714 2 12C2 7.286 2 4.929 3.465 3.465C4.92893 2 7.286 2 12 2C16.714 2 19.0711 2 20.535 3.465C21.5196 4.44958 21.8398 5.8088 21.9456 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
					<p style={{ margin: '0 0 10px', color: '#374151', fontWeight: 500 }}>
						Drag & drop files here
					</p>
					<p style={{ margin: '0 0 15px', color: '#9ca3af', fontSize: '13px' }}>
						or
					</p>
					<div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
						<button
							type="button"
							className="ts-btn ts-btn-1"
							onClick={openMediaLibrary}
							style={{
								padding: '8px 16px',
								backgroundColor: '#3b82f6',
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: 500
							}}
						>
							{hasWpMedia ? 'Media Library' : 'Browse Files'}
						</button>
						<button
							type="button"
							className="ts-btn ts-btn-2"
							onClick={() => fileInputRef.current?.click()}
							style={{
								padding: '8px 16px',
								backgroundColor: 'white',
								color: '#374151',
								border: '1px solid #d1d5db',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: 500
							}}
						>
							Upload New
						</button>
					</div>
				</div>
			</div>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				multiple={maxFiles > 1}
				accept={getAcceptAttribute()}
				onChange={handleFileInputChange}
				onBlur={onBlur}
				style={{ display: 'none' }}
				aria-label="File upload"
				title="Upload files"
			/>

			{/* File list */}
			{value.length > 0 && (
				<div className="ts-file-list" style={{
					display: 'grid',
					gridTemplateColumns: previewImages ? 'repeat(auto-fill, minmax(100px, 1fr))' : '1fr',
					gap: '10px'
				}}>
					{value.map((file, index) => {
						const preview = getFilePreview(file);
						const isImage = file.type.startsWith('image/');

						return (
							<div
								key={file.id}
								className={`ts-file ${isImage && previewImages ? 'ts-file-img' : ''} ${file.isUploading ? 'ts-file-uploading' : ''}`}
								draggable={sortable && !file.isUploading}
								onDragStart={() => handleSortStart(index)}
								onDragOver={(e) => { e.preventDefault(); handleSortOver(index); }}
								onDragEnd={handleSortEnd}
								style={{
									position: 'relative',
									borderRadius: '8px',
									overflow: 'hidden',
									border: '1px solid #e5e7eb',
									backgroundColor: 'white',
									cursor: sortable ? 'grab' : 'default',
									...(draggedIndex === index && { opacity: 0.5 }),
									...(preview && previewImages && {
										aspectRatio: '1',
										backgroundImage: `url(${preview})`,
										backgroundSize: 'cover',
										backgroundPosition: 'center'
									})
								}}
							>
								{/* Non-image file info */}
								{(!isImage || !previewImages) && (
									<div className="ts-file-info" style={{
										padding: '12px',
										display: 'flex',
										alignItems: 'center',
										gap: '10px'
									}}>
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#6b7280' }}>
											<path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
										<span style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{file.name}
										</span>
									</div>
								)}

								{/* Upload progress */}
								{file.isUploading && (
									<div style={{
										position: 'absolute',
										bottom: 0,
										left: 0,
										right: 0,
										height: '4px',
										backgroundColor: '#e5e7eb'
									}}>
										<div style={{
											height: '100%',
											width: `${file.progress || 0}%`,
											backgroundColor: '#3b82f6',
											transition: 'width 0.2s ease'
										}} />
									</div>
								)}

								{/* Remove button */}
								{!file.isUploading && (
									<button
										type="button"
										onClick={() => removeFile(file.id)}
										style={{
											position: 'absolute',
											top: '4px',
											right: '4px',
											width: '24px',
											height: '24px',
											borderRadius: '50%',
											border: 'none',
											backgroundColor: 'rgba(0,0,0,0.6)',
											color: 'white',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											padding: 0
										}}
										title="Remove file"
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
											<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* File count info */}
			<div style={{ 
				marginTop: '10px', 
				fontSize: '12px', 
				color: '#6b7280',
				display: 'flex',
				justifyContent: 'space-between'
			}}>
				<span>{value.length} / {maxFiles} file{maxFiles > 1 ? 's' : ''}</span>
				{sortable && value.length > 1 && <span>Drag to reorder</span>}
			</div>
		</div>
	);
};

