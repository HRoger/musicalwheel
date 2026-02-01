/**
 * FileUploadField Component - File Upload for Cart Items
 *
 * Matches Voxel's file-upload.php template 1:1
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/file-upload.php
 * - JS: themes/voxel/assets/dist/product-summary.js (file upload component)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import type { IconValue } from '@shared/controls/IconPickerControl';

/**
 * Uploaded file interface
 */
interface UploadedFile {
	source: 'new_upload' | 'existing';
	name: string;
	type: string;
	size: number;
	preview: string;
	item?: File;
	_id?: string;
	id?: number;
}

interface FileUploadFieldProps {
	field: {
		key: string;
		label?: string;
		allowed_types?: string;
		max_files?: number;
	};
	value: UploadedFile[];
	onChange: (files: UploadedFile[]) => void;
	uploadIcon: IconValue;
	trashIcon: IconValue;
	context: 'editor' | 'frontend';
}

/**
 * Generate random ID (matches Voxel.helpers.randomId)
 */
function randomId(length: number = 8): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Global file upload cache (matches window._vx_file_upload_cache)
 */
declare global {
	interface Window {
		_vx_file_upload_cache?: UploadedFile[];
	}
}

export default function FileUploadField({
	field,
	value,
	onChange,
	uploadIcon,
	trashIcon,
	context,
}: FileUploadFieldProps) {
	const [dragActive, setDragActive] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const maxFileCount = field.max_files || 1;
	const allowedFileTypes = field.allowed_types || '';

	/**
	 * Get style for file preview
	 * Matches Voxel's getStyle() method
	 */
	const getStyle = (file: UploadedFile): React.CSSProperties => {
		if (file.type.startsWith('image/')) {
			return { backgroundImage: `url('${file.preview}')` };
		}
		return {};
	};

	/**
	 * Push a file to the upload list
	 * Matches Voxel's pushFile() method
	 */
	const pushFile = useCallback(
		(file: File) => {
			let newValue = [...value];

			// Single file mode: clear existing
			if (maxFileCount === 1) {
				newValue = [];
			}

			const uploadedFile: UploadedFile = {
				source: 'new_upload',
				name: file.name,
				type: file.type,
				size: file.size,
				preview: URL.createObjectURL(file),
				item: file,
				_id: randomId(8),
			};

			// Check global cache for duplicate
			if (typeof window !== 'undefined') {
				if (!window._vx_file_upload_cache) {
					window._vx_file_upload_cache = [];
				}

				const cached = window._vx_file_upload_cache.find(
					(f) =>
						f.item?.name === file.name &&
						f.item?.type === file.type &&
						f.item?.size === file.size &&
						f.item?.lastModified === file.lastModified
				);

				if (cached) {
					newValue.push(cached);
				} else {
					newValue.push(uploadedFile);
					window._vx_file_upload_cache.unshift(uploadedFile);
				}
			} else {
				newValue.push(uploadedFile);
			}

			onChange(newValue);
		},
		[value, maxFileCount, onChange]
	);

	/**
	 * Handle file input change
	 */
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files) return;

			for (let i = 0; i < files.length; i++) {
				pushFile(files[i]);
			}

			// Reset input
			if (inputRef.current) {
				inputRef.current.value = '';
			}
		},
		[pushFile]
	);

	/**
	 * Handle drag events
	 * Matches Voxel's onDrop() method
	 */
	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragActive(false);

			if (e.dataTransfer.items) {
				Array.from(e.dataTransfer.items).forEach((item) => {
					if (item.kind === 'file') {
						const file = item.getAsFile();
						if (file) pushFile(file);
					}
				});
			} else {
				Array.from(e.dataTransfer.files).forEach((file) => {
					pushFile(file);
				});
			}
		},
		[pushFile]
	);

	/**
	 * Remove file from list
	 */
	const handleRemove = (index: number) => {
		if (context === 'editor') return;
		const newValue = [...value];
		const removed = newValue.splice(index, 1)[0];

		// Revoke object URL for new uploads
		if (removed.source === 'new_upload') {
			URL.revokeObjectURL(removed.preview);
		}

		onChange(newValue);
	};

	/**
	 * Cleanup object URLs on unmount
	 */
	useEffect(() => {
		return () => {
			setTimeout(() => {
				value.forEach((file) => {
					if (file.source === 'new_upload') {
						URL.revokeObjectURL(file.preview);
					}
				});
			}, 10);
		};
	}, []);

	return (
		<div
			className="ts-form-group ts-file-upload inline-file-field vx-1-1"
			onDragEnter={() => setDragActive(true)}
		>
			{/* Drop mask */}
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

			<div className="ts-file-list">
				{/* Pick file button */}
				<div className="pick-file-input">
					<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							if (context !== 'editor') {
								inputRef.current?.click();
							}
						}}
					>
						{renderIcon(uploadIcon)}
						{__('Upload', 'voxel-fse')}
					</a>
				</div>

				{/* File list */}
				{value.map((file, index) => (
					<div
						key={file._id || file.id || index}
						className={`ts-file ${file.type.startsWith('image/') ? 'ts-file-img' : ''}`}
						style={getStyle(file)}
					>
						<div className="ts-file-info">
							<svg
								fill="none"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12 16V4m0 0L8 8m4-4l4 4m-9 4v5a2 2 0 002 2h10a2 2 0 002-2v-5"
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
								/>
							</svg>
							<code>{file.name}</code>
						</div>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								handleRemove(index);
							}}
							className="ts-remove-file flexify"
						>
							{renderIcon(trashIcon)}
						</a>
					</div>
				))}
			</div>

			{/* Hidden file input */}
			<input
				ref={inputRef}
				type="file"
				className="hidden"
				multiple={maxFileCount > 1}
				accept={allowedFileTypes}
				onChange={handleInputChange}
			/>
		</div>
	);
}
