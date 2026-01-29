/**
 * useFileUpload Hook
 *
 * Handles file uploads with progress tracking and validation.
 * Supports multiple files with individual progress indicators.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef } from 'react';
import { uploadFile } from '../api';
import type { FileUploadResponse } from '../api';
import type { MediaFile } from '../types';

/**
 * Upload status for individual files
 */
export interface FileUploadStatus {
	id: string;
	file: File;
	progress: number;
	status: 'pending' | 'uploading' | 'completed' | 'error';
	error?: string;
	result?: FileUploadResponse;
}

/**
 * Upload configuration
 */
interface UploadConfig {
	maxFiles: number;
	maxFileSize: number; // in bytes
	allowedTypes: string[];
	allowedExtensions: string[];
}

/**
 * Default upload config
 */
const defaultConfig: UploadConfig = {
	maxFiles: 5,
	maxFileSize: 2 * 1024 * 1024, // 2MB
	allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
	allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

/**
 * Hook return type
 */
interface UseFileUploadReturn {
	// State
	uploads: FileUploadStatus[];
	isUploading: boolean;
	completedFiles: MediaFile[];

	// Actions
	addFiles: (files: FileList | File[]) => void;
	removeFile: (uploadId: string) => void;
	clearAll: () => void;
	uploadAll: () => Promise<MediaFile[]>;
	retryUpload: (uploadId: string) => Promise<void>;

	// Validation
	validateFile: (file: File) => { valid: boolean; error?: string };
}

/**
 * Generate unique ID for uploads
 */
function generateUploadId(): string {
	return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get file extension
 */
function getFileExtension(filename: string): string {
	return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * useFileUpload hook
 *
 * @param config - Upload configuration
 */
export function useFileUpload(config: Partial<UploadConfig> = {}): UseFileUploadReturn {
	const uploadConfig = { ...defaultConfig, ...config };

	const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
	const [completedFiles, setCompletedFiles] = useState<MediaFile[]>([]);

	// Track abort controllers for cancellation
	const abortControllers = useRef<Map<string, AbortController>>(new Map());

	/**
	 * Validate a file before upload
	 */
	const validateFile = useCallback(
		(file: File): { valid: boolean; error?: string } => {
			// Check file size
			if (file.size > uploadConfig.maxFileSize) {
				const maxSizeMB = (uploadConfig.maxFileSize / (1024 * 1024)).toFixed(1);
				return {
					valid: false,
					error: `File is too large. Maximum size is ${maxSizeMB}MB.`,
				};
			}

			// Check file type
			if (!uploadConfig.allowedTypes.includes(file.type)) {
				return {
					valid: false,
					error: `File type "${file.type}" is not allowed.`,
				};
			}

			// Check file extension
			const extension = getFileExtension(file.name);
			if (!uploadConfig.allowedExtensions.includes(extension)) {
				return {
					valid: false,
					error: `File extension ".${extension}" is not allowed.`,
				};
			}

			return { valid: true };
		},
		[uploadConfig]
	);

	/**
	 * Add files to upload queue
	 */
	const addFiles = useCallback(
		(files: FileList | File[]) => {
			const fileArray = Array.from(files);

			// Check max files limit
			const currentCount = uploads.length + completedFiles.length;
			const availableSlots = uploadConfig.maxFiles - currentCount;

			if (availableSlots <= 0) {
				console.warn(`Maximum ${uploadConfig.maxFiles} files allowed.`);
				return;
			}

			const filesToAdd = fileArray.slice(0, availableSlots);

			const newUploads: FileUploadStatus[] = filesToAdd.map((file) => {
				const validation = validateFile(file);
				return {
					id: generateUploadId(),
					file,
					progress: 0,
					status: validation.valid ? 'pending' : 'error',
					error: validation.error,
				};
			});

			setUploads((prev) => [...prev, ...newUploads]);
		},
		[uploads.length, completedFiles.length, uploadConfig.maxFiles, validateFile]
	);

	/**
	 * Remove a file from upload queue
	 */
	const removeFile = useCallback((uploadId: string) => {
		// Cancel upload if in progress
		const controller = abortControllers.current.get(uploadId);
		if (controller) {
			controller.abort();
			abortControllers.current.delete(uploadId);
		}

		setUploads((prev) => prev.filter((u) => u.id !== uploadId));
		setCompletedFiles((prev) => prev.filter((f) => f.id !== parseInt(uploadId)));
	}, []);

	/**
	 * Clear all uploads
	 */
	const clearAll = useCallback(() => {
		// Cancel all pending uploads
		abortControllers.current.forEach((controller) => controller.abort());
		abortControllers.current.clear();

		setUploads([]);
		setCompletedFiles([]);
	}, []);

	/**
	 * Upload a single file
	 */
	const uploadSingleFile = useCallback(
		async (uploadStatus: FileUploadStatus): Promise<MediaFile | null> => {
			// Skip if already completed or has error
			if (uploadStatus.status === 'completed' || uploadStatus.status === 'error') {
				return null;
			}

			// Update status to uploading
			setUploads((prev) =>
				prev.map((u) =>
					u.id === uploadStatus.id ? { ...u, status: 'uploading' as const, progress: 0 } : u
				)
			);

			try {
				const result = await uploadFile(uploadStatus.file, (progress) => {
					setUploads((prev) =>
						prev.map((u) => (u.id === uploadStatus.id ? { ...u, progress } : u))
					);
				});

				// Update status to completed
				setUploads((prev) =>
					prev.map((u) =>
						u.id === uploadStatus.id
							? { ...u, status: 'completed' as const, progress: 100, result }
							: u
					)
				);

				// Convert to MediaFile format
				const mediaFile: MediaFile = {
					id: result.id,
					url: result.url,
					alt: result.name,
					type: result.mime_type.startsWith('image/') ? 'image' : 'file',
					mime_type: result.mime_type,
					thumbnail_url: result.url, // Use same URL for thumbnail
				};

				return mediaFile;
			} catch (error) {
				// Update status to error
				setUploads((prev) =>
					prev.map((u) =>
						u.id === uploadStatus.id
							? {
									...u,
									status: 'error' as const,
									error: error instanceof Error ? error.message : 'Upload failed',
								}
							: u
					)
				);

				return null;
			}
		},
		[]
	);

	/**
	 * Upload all pending files
	 */
	const uploadAll = useCallback(async (): Promise<MediaFile[]> => {
		const pendingUploads = uploads.filter((u) => u.status === 'pending');

		const results = await Promise.all(pendingUploads.map((u) => uploadSingleFile(u)));

		const successfulUploads = results.filter((r): r is MediaFile => r !== null);

		setCompletedFiles((prev) => [...prev, ...successfulUploads]);

		return successfulUploads;
	}, [uploads, uploadSingleFile]);

	/**
	 * Retry a failed upload
	 */
	const retryUpload = useCallback(
		async (uploadId: string): Promise<void> => {
			const upload = uploads.find((u) => u.id === uploadId);
			if (!upload || upload.status !== 'error') {
				return;
			}

			// Reset status to pending
			setUploads((prev) =>
				prev.map((u) =>
					u.id === uploadId ? { ...u, status: 'pending' as const, error: undefined } : u
				)
			);

			const result = await uploadSingleFile({ ...upload, status: 'pending' });
			if (result) {
				setCompletedFiles((prev) => [...prev, result]);
			}
		},
		[uploads, uploadSingleFile]
	);

	/**
	 * Check if any uploads are in progress
	 */
	const isUploading = uploads.some((u) => u.status === 'uploading');

	return {
		uploads,
		isUploading,
		completedFiles,
		addFiles,
		removeFile,
		clearAll,
		uploadAll,
		retryUpload,
		validateFile,
	};
}

export default useFileUpload;
