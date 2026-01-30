/**
 * useFormSubmission Hook
 * Manages form submission, validation, and draft saving
 *
 * Phase 3: Custom hook for form submission logic
 *
 * Handles:
 * - Form validation (required, email, URL)
 * - Form submission via Voxel AJAX endpoint
 * - Draft saving
 * - Submission state management
 * - Error handling
 */
import { useState } from 'react';
import type { FormData, SubmissionState, VoxelField, CreatePostAttributes, FieldValue, RepeaterRow } from '../types';
import type { SubmissionResult } from '../shared/CreatePostForm';
import { getSiteBaseUrl } from '@shared/utils/siteUrl';

/**
 * Global window declarations for Voxel-specific properties
 */
declare global {
	interface Window {
		voxelFseCreatePost?: {
			ajaxUrl?: string;
			nonce?: string;
		};
		Voxel?: {
			alert: (message: string, type: 'error' | 'success' | 'warning') => void;
		};
	}
}

/**
 * File Upload Object - represents a file in file/image fields
 * Can be a new upload (with File object) or existing attachment
 */
interface FileUploadObject {
	source: 'new_upload' | 'existing';
	file?: File;        // Present when source === 'new_upload'
	id?: number;        // Present when source === 'existing' (attachment ID)
	url?: string;       // Preview URL
	name?: string;      // Filename
}

/**
 * Processed file value for form submission
 * Either an attachment ID or 'uploaded_file' marker
 */
type ProcessedFileValue = number | 'uploaded_file';

/**
 * File alias map entry for deduplication
 */
interface FileAliasEntry {
	path: string;
	index: number;
}

/**
 * Deduplicate files in FormData and add aliases for duplicates
 * Evidence: voxel-create-post.beautified.js lines 4173-4221
 *
 * Voxel uses a smart aliasing system to avoid uploading duplicate files.
 * When the same file is used in multiple fields (e.g., same image in gallery and cover),
 * only one copy is uploaded and aliases point to the original.
 *
 * @param formData - The FormData object to deduplicate
 */
function deduplicateFiles(formData: FormData): void {
	const entries = Object.fromEntries(formData);
	const fileAliasMap: Record<string, FileAliasEntry> = {};

	for (const key in entries) {
		if (key.startsWith('files[')) {
			const files = formData.getAll(key);
			const uniqueFiles: File[] = [];

			for (let idx = 0; idx < files.length; idx++) {
				const file = files[idx];
				if (file instanceof File) {
					// Create a unique key based on file properties
					const fileKey = JSON.stringify({
						name: file.name,
						type: file.type,
						size: file.size,
						lastModified: file.lastModified,
					});

					if (fileAliasMap[fileKey] !== undefined) {
						// File already exists, use alias
						// Extract field path from key: files[field_id][] -> field_id
						const fieldPath = key.slice(6, -3);
						formData.append(
							`_vx_file_aliases[${fieldPath}][${idx}][path]`,
							fileAliasMap[fileKey].path
						);
						formData.append(
							`_vx_file_aliases[${fieldPath}][${idx}][index]`,
							fileAliasMap[fileKey].index.toString()
						);
					} else {
						// New unique file
						uniqueFiles.push(file);
						fileAliasMap[fileKey] = {
							path: key.slice(6, -3),
							index: uniqueFiles.indexOf(file),
						};
					}
				}
			}

			// Replace with deduplicated files
			formData.delete(key);
			for (const file of uniqueFiles) {
				formData.append(key, file);
			}
		}
	}
}

/**
 * Repeater row without meta:state for submission
 */
type CleanedRepeaterRow = Omit<RepeaterRow, 'meta:state'> & {
	[fieldKey: string]: FieldValue | ProcessedFileValue[];
};

/**
 * Hook return type
 */
export interface UseFormSubmissionReturn {
	submission: SubmissionState;
	handleSubmit: (e: React.MouseEvent | React.FormEvent) => Promise<void>;
	handleSaveDraft: () => Promise<void>;
	setSubmission: React.Dispatch<React.SetStateAction<SubmissionState>>;
}

/**
 * Hook options
 */
export interface UseFormSubmissionOptions {
	formData: FormData;
	fields: VoxelField[];
	setFields: React.Dispatch<React.SetStateAction<VoxelField[]>>;
	attributes: CreatePostAttributes;
	postTypeKey: string;
	postId?: number | null;
	context: 'editor' | 'frontend';
	onSubmit?: (data: FormData) => Promise<SubmissionResult>;
}

/**
 * useFormSubmission Hook
 *
 * @param options - Hook configuration options
 * @returns Submission state and handlers
 */
export function useFormSubmission(options: UseFormSubmissionOptions): UseFormSubmissionReturn {
	const {
		formData,
		fields,
		setFields,
		attributes,
		postTypeKey,
		postId,
		context,
		onSubmit,
	} = options;

	const [submission, setSubmission] = useState<SubmissionState>({
		processing: false,
		done: false,
		success: false,
		message: '',
	});

	/**
	 * Validate form before submission
	 */
	const validateForm = (): boolean => {
		const errors: { [key: string]: string } = {};

		fields.forEach((field) => {
			const value = formData[field.key];

			// Required field validation - matches Voxel text (create-post.php:5100)
			if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
				errors[field.key] = 'Required';
			}

			// Email validation
			if (field.type === 'email' && value && typeof value === 'string') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					errors[field.key] = 'You must provide a valid email address';
				}
			}

			// URL validation
			if (field.type === 'url' && value && typeof value === 'string') {
				try {
					new URL(value);
				} catch {
					errors[field.key] = 'You must provide a valid URL';
				}
			}
		});

		// Update field validation errors
		if (Object.keys(errors).length > 0) {
			const updatedFields = fields.map((field) => ({
				...field,
				validation: {
					errors: errors[field.key] ? [errors[field.key]] : [],
				},
			}));
			setFields(updatedFields);

			// Scroll to first error field - beautiful smooth scroll like Voxel
			setTimeout(() => {
				const firstErrorFieldKey = Object.keys(errors)[0];
				const errorFieldElement = document.querySelector(
					`.ts-form-group.field-${fields.find(f => f.key === firstErrorFieldKey)?.type}`
				);

				if (errorFieldElement) {
					errorFieldElement.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'nearest'
					});

					const input = errorFieldElement.querySelector('input, textarea, select');
					if (input && input instanceof HTMLElement) {
						setTimeout(() => {
							input.focus();
						}, 300);
					}
				}
			}, 100);

			return false;
		}

		// Clear all validation errors if form is valid
		const clearedFields = fields.map((field) => ({
			...field,
			validation: {
				errors: [],
			},
		}));
		setFields(clearedFields);

		return true;
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
		if (e && 'preventDefault' in e) {
			e.preventDefault();
		}

		// Validate form
		if (!validateForm()) {
			return;
		}

		setSubmission({ ...submission, processing: true });

		try {
			let result: SubmissionResult;

			// Use injected onSubmit handler if provided (editor context)
			if (onSubmit) {
				result = await onSubmit(formData);
			} else {
				// Fallback to Voxel AJAX submission (frontend context)
				const wpData = window.voxelFseCreatePost || {};

				// Prepare form data for submission - DUAL-CHANNEL APPROACH
				// Evidence: themes/voxel/assets/dist/create-post.js - File field onSubmit method
				// Backend: themes/voxel/app/post-types/fields/file-field.php lines 44-67
				//
				// Voxel uses TWO channels for file uploads:
				// 1. Channel 1 (postdata): JSON with markers ['uploaded_file', 'uploaded_file', 123]
				// 2. Channel 2 (FormData): Actual File objects at files[field_id][]
				//
				// Backend correlates markers with files:
				// - Sees 'uploaded_file' → pulls next file from $_FILES['files'][field_id][$upload_index]
				// - Sees number → treats as existing attachment ID
				const formDataObj = new FormData();
				const postdataForJson: Record<string, any> = {};

				// Process each field in formData
				Object.keys(formData).forEach((fieldKey) => {
					const value = formData[fieldKey];
					const field = fields.find((f) => f.key === fieldKey);

					// Check if this is a file-based field
					const isFileField =
						field &&
						['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type);

					if (isFileField && Array.isArray(value)) {
						// Initialize postdata array for this field
						postdataForJson[fieldKey] = [];

						// Process each file object
						value.forEach((fileObj: FileUploadObject) => {
							if (fileObj.source === 'new_upload' && fileObj.file) {
								// Add File object to FormData (Channel 2)
								// CRITICAL: Use field?.id with fallback to fieldKey to ensure uniqueness
								// If field.id is undefined or not unique, files will overwrite each other!
								const fileFormDataKey = field?.id || fieldKey;
								formDataObj.append(`files[${fileFormDataKey}][]`, fileObj.file);
								// Add marker to postdata (Channel 1)
								postdataForJson[fieldKey].push('uploaded_file');
							} else if (fileObj.source === 'existing' && fileObj.id) {
								// Add attachment ID to postdata only
								postdataForJson[fieldKey].push(fileObj.id);
							}
						});
					} else if (field && field.type === 'repeater' && Array.isArray(value)) {
						// REPEATER FIELD HANDLING (Phase 2 - CRITICAL)
						// 1. Clean rows: strip meta:state and filter empty rows
						const cleanedRows = (value as RepeaterRow[])
							.map((row: RepeaterRow) => {
								const { 'meta:state': _metaState, ...fieldValues } = row;
								return fieldValues as CleanedRepeaterRow; // Just field values, no meta:state
							})
							.filter((row: CleanedRepeaterRow) => {
								// Remove rows with no field values
								return Object.keys(row).length > 0;
							});

						// 2. Add cleaned rows to postdata
						postdataForJson[fieldKey] = cleanedRows;

						// 3. Handle nested file fields within repeater rows
						cleanedRows.forEach((row: CleanedRepeaterRow, rowIndex: number) => {
							Object.keys(row).forEach((nestedFieldKey: string) => {
								const nestedValue = row[nestedFieldKey];

								// Check if this is a file field value (array with source property)
								if (Array.isArray(nestedValue) && nestedValue.length > 0) {
									const firstItem = nestedValue[0] as FileUploadObject | undefined;
									if (
										firstItem &&
										typeof firstItem === 'object' &&
										'source' in firstItem &&
										(firstItem.source === 'new_upload' || firstItem.source === 'existing')
									) {
										// This is a file field - process it
										const processedFiles: ProcessedFileValue[] = [];

										(nestedValue as FileUploadObject[]).forEach((fileObj: FileUploadObject) => {
											if (fileObj.source === 'new_upload' && fileObj.file) {
												// Add to FormData with proper key
												const fileKey = `${fieldKey}[${rowIndex}][${nestedFieldKey}]`;
												formDataObj.append(`files[${fileKey}][]`, fileObj.file);
												// Mark in postdata
												processedFiles.push('uploaded_file');
											} else if (fileObj.source === 'existing' && fileObj.id) {
												// Keep attachment ID
												processedFiles.push(fileObj.id);
											}
										});

										// Update row with processed files array
										if (processedFiles.length > 0) {
											postdataForJson[fieldKey][rowIndex][nestedFieldKey] = processedFiles;
										}
									}
								}
							});
						});
					} else {
						// Non-file field: copy value as-is
						postdataForJson[fieldKey] = value;
					}
				});

				// Append JSON-stringified postdata
				formDataObj.append('postdata', JSON.stringify(postdataForJson));

				// Apply file deduplication with aliases
				// Evidence: voxel-create-post.beautified.js lines 4173-4221
				deduplicateFiles(formDataObj);

				if (postId && postId > 0) {
					formDataObj.append('post_id', postId.toString());
				}

				// Build URL query string - matches Voxel's format
				const queryParams = new URLSearchParams({
					action: 'create_post',
					post_type: postTypeKey,
				});
				if (postId && postId > 0) {
					queryParams.append('post_id', postId.toString());
				}

				// Submit via Voxel's AJAX endpoint
				const voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;

				console.log(`${context}: Submitting form`, { url: voxelAjaxUrl });

				const response = await fetch(voxelAjaxUrl, {
					method: 'POST',
					body: formDataObj,
					credentials: 'same-origin',
					redirect: 'manual',
				});

				// Check for redirect response
				if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
					const location = response.headers.get('Location');
					console.error(`${context}: Server returned redirect`, { status: response.status, location });
					throw new Error('Server returned redirect. This should not happen with AJAX requests.');
				}

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Check Content-Type
				const contentType = response.headers.get('content-type');
				if (!contentType || !contentType.includes('application/json')) {
					const text = await response.text();
					console.error(`${context}: Non-JSON response`, { contentType, text: text.substring(0, 200) });
					throw new Error('Server returned non-JSON response.');
				}

				result = await response.json();
				console.log(`${context}: Submission response`, result);
			}

			// Handle response
			if (result.success) {
				// Override edit_link to use Voxel's convention
				let editLink = result.editLink;

				let extractedPostId: string | null = null;
				if (result.editLink) {
					try {
						const url = new URL(result.editLink, window.location.origin);
						extractedPostId = url.searchParams.get('post_id');
					} catch (e) {
						const match = result.editLink.match(/[?&]post_id=(\d+)/);
						extractedPostId = match ? match[1] : null;
					}
				}

				if (extractedPostId && postTypeKey) {
					// MULTISITE FIX: Use getSiteBaseUrl() instead of window.location.origin
					// This ensures the correct site path is used in multisite subdirectory installations
					const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
					editLink = `${siteBase}/create-${postTypeKey}/?post_id=${extractedPostId}`;
					console.log(`${context}: Overriding edit link`, { original: result.editLink, overridden: editLink });
				}

				setSubmission({
					processing: false,
					done: true,
					success: true,
					message: result.message || attributes.successMessage,
					viewLink: result.viewLink,
					editLink: editLink,
					status: result.status,
				});

				// Scroll to top
				setTimeout(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}, 100);

				// Redirect if configured
				if (attributes.redirectAfterSubmit && !result.editLink && !result.viewLink) {
					setTimeout(() => {
						// MULTISITE FIX: Handle relative URLs for multisite subdirectory
						let redirectUrl = attributes.redirectAfterSubmit;
						if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
							// Relative URL - make it multisite-aware
							const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
							redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
						}
						window.location.href = redirectUrl;
					}, 500);
				}
			} else {
				// Handle errors
				const errorMessage = result.errors && Array.isArray(result.errors)
					? result.errors.join('<br>')
					: result.message || 'Submission failed';

				setSubmission({
					processing: false,
					done: false,
					success: false,
					message: errorMessage,
					errors: result.errors || [],
				});

				// Show error alert (if Voxel.alert is available)
				if (context === 'frontend' && window.Voxel?.alert) {
					window.Voxel.alert(errorMessage, 'error');
				}
			}
		} catch (error) {
			console.error(`${context}: Form submission error`, error);
			setSubmission({
				processing: false,
				done: false,
				success: false,
				message: 'Network error. Please try again.',
			});

			// Show error alert
			if (context === 'frontend' && window.Voxel?.alert) {
				window.Voxel.alert('Network error. Please try again.', 'error');
			}
		}
	};

	/**
	 * Handle save as draft
	 */
	const handleSaveDraft = async () => {
		setSubmission({ ...submission, processing: true });

		try {
			const wpData = (window as { voxelFseCreatePost?: { ajaxUrl?: string; nonce?: string } }).voxelFseCreatePost || {};

			// Prepare form data for draft save - DUAL-CHANNEL APPROACH (same as handleSubmit)
			const formDataObj = new FormData();
			const postdataForJson: Record<string, FieldValue | ProcessedFileValue[] | CleanedRepeaterRow[]> = {};

			// Process each field in formData
			Object.keys(formData).forEach((fieldKey) => {
				const value = formData[fieldKey];
				const field = fields.find((f) => f.key === fieldKey);

				// Check if this is a file-based field
				const isFileField =
					field &&
					['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type);

				if (isFileField && Array.isArray(value)) {
					// Initialize postdata array for this field
					const fileValues: ProcessedFileValue[] = [];

					// Process each file object
					value.forEach((fileObj: FileUploadObject) => {
						if (fileObj.source === 'new_upload' && fileObj.file) {
							// Add File object to FormData (Channel 2)
							// CRITICAL: Use field?.id with fallback to fieldKey to ensure uniqueness
							const fileFormDataKey = field?.id || fieldKey;
							formDataObj.append(`files[${fileFormDataKey}][]`, fileObj.file);
							// Add marker to postdata (Channel 1)
							fileValues.push('uploaded_file');
						} else if (fileObj.source === 'existing' && fileObj.id) {
							// Add attachment ID to postdata only
							fileValues.push(fileObj.id);
						}
					});
					postdataForJson[fieldKey] = fileValues;
				} else if (field && field.type === 'repeater' && Array.isArray(value)) {
					// REPEATER FIELD HANDLING (Phase 2 - CRITICAL)
					// 1. Clean rows: strip meta:state and filter empty rows
					const cleanedRows = (value as RepeaterRow[])
						.map((row: RepeaterRow) => {
							const { 'meta:state': _metaState, ...fieldValues } = row;
							return fieldValues as CleanedRepeaterRow; // Just field values, no meta:state
						})
						.filter((row: CleanedRepeaterRow) => {
							// Remove rows with no field values
							return Object.keys(row).length > 0;
						});

					// 2. Add cleaned rows to postdata
					postdataForJson[fieldKey] = cleanedRows;

					// 3. Handle nested file fields within repeater rows
					cleanedRows.forEach((row: CleanedRepeaterRow, rowIndex: number) => {
						Object.keys(row).forEach((nestedFieldKey: string) => {
							const nestedValue = row[nestedFieldKey];

							// Check if this is a file field value (array with source property)
							if (Array.isArray(nestedValue) && nestedValue.length > 0) {
								const firstItem = nestedValue[0] as FileUploadObject | undefined;
								if (
									firstItem &&
									typeof firstItem === 'object' &&
									'source' in firstItem &&
									(firstItem.source === 'new_upload' || firstItem.source === 'existing')
								) {
									// This is a file field - process it
									const processedFiles: ProcessedFileValue[] = [];

									(nestedValue as FileUploadObject[]).forEach((fileObj: FileUploadObject) => {
										if (fileObj.source === 'new_upload' && fileObj.file) {
											// Add to FormData with proper key
											const fileKey = `${fieldKey}[${rowIndex}][${nestedFieldKey}]`;
											formDataObj.append(`files[${fileKey}][]`, fileObj.file);
											// Mark in postdata
											processedFiles.push('uploaded_file');
										} else if (fileObj.source === 'existing' && fileObj.id) {
											// Keep attachment ID
											processedFiles.push(fileObj.id);
										}
									});

									// Update row with processed files array
									if (processedFiles.length > 0) {
										postdataForJson[fieldKey][rowIndex][nestedFieldKey] = processedFiles;
									}
								}
							}
						});
					});
				} else {
					// Non-file field: copy value as-is
					postdataForJson[fieldKey] = value;
				}
			});

			// Append JSON-stringified postdata
			formDataObj.append('postdata', JSON.stringify(postdataForJson));

			// Apply file deduplication with aliases
			// Evidence: voxel-create-post.beautified.js lines 4173-4221
			deduplicateFiles(formDataObj);

			formDataObj.append('save_as_draft', 'yes');

			if (postId) {
				formDataObj.append('post_id', postId.toString());
			}

			// MULTISITE FIX: Use same pattern as regular submission
			// wpData.ajaxUrl already includes ?vx=1 from getSiteBaseUrl() fallback
			// NOTE: wpData.ajaxUrl is multisite-aware via getSiteBaseUrl() fallback in CreatePostForm.tsx
			const queryParams = new URLSearchParams({
				action: 'create_post',
				post_type: postTypeKey,
			});
			if (postId && postId > 0) {
				queryParams.append('post_id', postId.toString());
			}
			const voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;

			const response = await fetch(voxelAjaxUrl, {
				method: 'POST',
				body: formDataObj,
			});

			const result = await response.json();

			if (result.success) {
				setSubmission({
					processing: false,
					done: true,
					success: true,
					message: result.message || 'Draft saved successfully!',
					editLink: result.edit_link,
				});
			} else {
				setSubmission({
					processing: false,
					done: false,
					success: false,
					message: result.message || 'Failed to save draft',
				});
			}
		} catch (error) {
			console.error('Draft save error:', error);
			setSubmission({
				processing: false,
				done: false,
				success: false,
				message: 'Network error. Please try again.',
			});
		}
	};

	return {
		submission,
		handleSubmit,
		handleSaveDraft,
		setSubmission,
	};
}
