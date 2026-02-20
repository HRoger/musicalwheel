/**
 * Create Post Form - Shared Component
 * Used by both editor (edit.tsx) and frontend (frontend.tsx)
 *
 * This is the main form component extracted from frontend.tsx
 * Ensures 1:1 matching between editor preview and frontend display
 */
import { useState, useEffect, useRef } from 'react';
import type { CreatePostAttributes, FormData, SubmissionState, VoxelField, SubmissionResult, FieldValue, PostContext } from '../types';

/**
 * FileObject interface for file field values
 * Represents a file attached via upload or media library
 */
interface FileObject {
	source: 'new_upload' | 'existing';
	file?: File;
	id?: number;
	url?: string;
	name?: string;
	type?: string;
	preview?: string;
}

/**
 * File metadata stored in form state (without File object which can't be serialized)
 */
interface FileMetadata {
	source: 'new_upload' | 'existing';
	id?: number;
	name?: string;
	type?: string;
	preview?: string;
}

/**
 * WordPress data passed from PHP for frontend context
 */
interface WpContextData {
	postId?: number | null;
	postTypeKey?: string;
	postStatus?: string | null;
	ajaxUrl?: string;
	nonce?: string;
	adminModeNonce?: string;
	isAdminMetabox?: boolean;
}

/**
 * Product field value structure
 */
interface ProductFieldValue {
	enabled?: boolean;
	product_type?: string;
	base_price?: {
		amount?: number | null;
		discount_amount?: number | null;
	};
	stock?: unknown;
	shipping?: unknown;
	[key: string]: unknown;
}

/**
 * Type guard for product field value
 */
function isProductFieldValue(value: FieldValue): value is ProductFieldValue {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Extended HTMLDivElement with voxelSubmit method
 */
interface VoxelFormElement extends HTMLDivElement {
	voxelSubmit?: (e: React.MouseEvent | React.FormEvent) => Promise<void>;
}



import { FieldRenderer } from '../components/FieldRenderer';
import { renderIcon, defaultIcons } from '../utils/iconRenderer';
import { getSiteBaseUrl } from '@shared/utils/siteUrl';
import { useConditions } from '../hooks/useConditions';

/**
 * Get the Voxel AJAX URL, handling subdirectory installations
 *
 * Priority:
 * 1. window.voxelFseCreatePost.ajaxUrl (set by our block render or localization)
 * 2. window.Voxel_Config.ajax_url (Voxel's native config on frontend)
 * 3. Extract from window.wpApiSettings.root (Gutenberg editor)
 * 4. Fallback to window.location.origin (last resort, may not work for subdirectories)
 *
 * @returns {string} The AJAX URL with ?vx=1 parameter
 */
function getVoxelAjaxUrl(): string {
	// 1. Try our block's localized data
	if ((window as any).voxelFseCreatePost?.ajaxUrl) {
		return (window as any).voxelFseCreatePost.ajaxUrl;
	}

	// 2. Try Voxel's native config (available on frontend)
	if ((window as any).Voxel_Config?.ajax_url) {
		// Voxel_Config.ajax_url is usually like "http://site.com/subdir/?vx=1"
		return (window as any).Voxel_Config.ajax_url;
	}

	// 3. Try extracting site URL from WordPress REST API settings (Gutenberg editor)
	if (window.wpApiSettings?.root) {
		// wpApiSettings.root is like "http://site.com/subdir/wp-json/"
		// Extract the site URL by removing /wp-json/
		const siteUrl = window.wpApiSettings.root.replace(/\/wp-json\/?$/, '');
		return `${siteUrl}/?vx=1`;
	}

	// 4. Fallback using getSiteBaseUrl() for multisite subdirectory support
	return getSiteBaseUrl();
}

/**
 * CreatePostFormProps Interface
 * NEW: Added context and onSubmit for injectable behavior
 * Plan C+ Parity: Added postContext for permission-gated rendering
 */
export interface CreatePostFormProps {
	attributes: CreatePostAttributes;
	fieldsConfig: VoxelField[];
	context: 'editor' | 'frontend';  // NEW - determines rendering context
	onSubmit?: (data: FormData) => Promise<SubmissionResult>; // NEW - injectable submission handler
	postId?: number | null;
	postStatus?: string | null; // Post status from REST API (Plan C+ pattern)
	isAdminMode?: boolean;
	postContext?: PostContext | null; // Plan C+ parity: Server-side permission state
}



/**
 * CreatePostForm Component
 * Main form with full interactivity, validation, and submission
 */
export const CreatePostForm = ({
	attributes,
	fieldsConfig,
	context,
	onSubmit,
	postId,
	postStatus: postStatusProp,
	isAdminMode,
	postContext
}: CreatePostFormProps) => {
	// Form state
	const [formData, setFormData] = useState<FormData>({});
	const [submission, setSubmission] = useState<SubmissionState>({
		processing: false,
		done: false,
		success: false,
		message: '',
	});
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
	const [fields, setFields] = useState<VoxelField[]>([]);
	const [steps, setSteps] = useState<VoxelField[]>([]); // UI Step fields

	// Ref to root div element (used to expose submit method for admin metabox)
	const formRef = useRef<VoxelFormElement>(null);

	// Ref to store File objects separately (React state can't serialize File objects)
	// Maps field key → array of FileObjects with actual File instances
	const fileObjectsRef = useRef<Record<string, FileObject[]>>({});

	// Convert fields array to Record for conditional visibility evaluation
	// Evidence: voxel-create-post.beautified.js lines 1566-1596 (setupConditions)
	const fieldsRecord = fields.reduce<Record<string, VoxelField>>((acc, field) => {
		acc[field.key] = {
			...field,
			// Ensure value exists in field for condition evaluation
			value: formData[field.key]
		};
		return acc;
	}, {});

	// Get conditional visibility map using ConditionMixin logic
	// Evidence: voxel-create-post.beautified.js lines 1564-1713
	const fieldVisibility = useConditions(fieldsRecord, true);

	// Get WordPress data with smart AJAX URL detection
	// CRITICAL: Provide fallback for ajaxUrl when window.voxelFseCreatePost is undefined
	// This happens in:
	// - Gutenberg editor (context === 'editor')
	// - Frontend pages using static save.tsx output (wp_localize_script doesn't run)
	// Uses getVoxelAjaxUrl() to handle subdirectory installations (Plan C+ headless pattern)
	const wpData: WpContextData = {
		ajaxUrl: getVoxelAjaxUrl(), // Smart AJAX URL detection for all contexts
		...(window.voxelFseCreatePost || {}),
	};

	const postTypeKey = attributes.postTypeKey || wpData?.postTypeKey || '';

	/**
	 * Read initial step from URL query params
	 * Matches Voxel's URL pattern:
	 * - Step 1: create-{post-type}/
	 * - Step 2: create-{post-type}/?step=ui-step
	 * - Step 3+: create-{post-type}/?step=ui-step-{number}
	 */
	const getStepFromUrl = (): number => {
		if (typeof window === 'undefined') return 0;

		const params = new URLSearchParams(window.location.search);
		const stepParam = params.get('step');

		if (!stepParam) return 0; // No step param = step 1 (index 0)
		if (stepParam === 'ui-step') return 1; // Step 2 (index 1)

		// Step 3+ format: ui-step-2, ui-step-3, etc.
		// The number in the URL IS the step index (ui-step-2 = index 2, ui-step-3 = index 3)
		const match = stepParam.match(/^ui-step-(\d+)$/);
		if (match) {
			const stepIndex = parseInt(match[1], 10);
			return stepIndex;
		}

		return 0; // Fallback to step 1
	};

	/**
	 * Update URL with current step
	 * Matches Voxel's URL pattern:
	 * - Step 1 (index 0): / (no param)
	 * - Step 2 (index 1): ?step=ui-step
	 * - Step 3 (index 2): ?step=ui-step-2
	 * - Step 4 (index 3): ?step=ui-step-3
	 *
	 * Pattern: The number in the URL IS the step index
	 * NOTE: Skip URL updates in admin mode (metabox iframe)
	 */
	const updateUrlWithStep = (stepIndex: number) => {
		// Skip URL updates in admin mode (metabox iframe) or editor context
		if (typeof window === 'undefined' || context !== 'frontend' || isAdminMode) return;

		const url = new URL(window.location.href);

		if (stepIndex === 0) {
			// Step 1 - no query param
			url.searchParams.delete('step');
		} else if (stepIndex === 1) {
			// Step 2 - ?step=ui-step
			url.searchParams.set('step', 'ui-step');
		} else {
			// Step 3+ - ?step=ui-step-{stepIndex}
			// The number in the URL IS the step index (index 2 → ui-step-2, index 3 → ui-step-3)
			url.searchParams.set('step', `ui-step-${stepIndex}`);
		}

		// Update URL without page reload
		window.history.pushState({}, '', url.toString());
	};

	// Initialize current step from URL on mount (skip in admin mode)
	useEffect(() => {
		if (context === 'frontend' && steps.length > 0 && !isAdminMode) {
			const urlStep = getStepFromUrl();
			// Only set if within valid range
			if (urlStep >= 0 && urlStep < steps.length) {
				setCurrentStepIndex(urlStep);
			}
		}
	}, [context, steps.length, isAdminMode]);

	// Handle browser back/forward button navigation (skip in admin mode)
	useEffect(() => {
		if (context !== 'frontend' || steps.length === 0 || isAdminMode) return;

		const handlePopState = () => {
			const urlStep = getStepFromUrl();
			// Update step index from URL (browser back/forward button)
			if (urlStep >= 0 && urlStep < steps.length) {
				setCurrentStepIndex(urlStep);
				// Scroll to top
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		};

		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [context, steps.length]);

	// Determine if we're in edit mode and get post status
	// CRITICAL: Use prop first (from REST API), then fall back to wpData (from wp_localize_script)
	// Plan C+ pattern: REST API is primary source, wpData is legacy fallback
	const editingPostId = wpData?.postId || postId;
	// @ts-ignore -- unused but kept for future use
	const _isEditMode = !!editingPostId && editingPostId > 0;
	const postStatus = postStatusProp || wpData?.postStatus || null; // 'draft', 'publish', 'pending', etc.
	const isPublishedPost = postStatus && postStatus !== 'draft';

	// Initialize fields from fieldsConfig prop
	useEffect(() => {
		if (fieldsConfig && Array.isArray(fieldsConfig) && fieldsConfig.length > 0) {
			// Separate UI Step fields from regular fields
			const stepFields = fieldsConfig.filter((f: VoxelField) => f.type === 'ui-step');
			const regularFields = fieldsConfig.filter((f: VoxelField) => f.type !== 'ui-step');

			setSteps(stepFields);
			setFields(regularFields);

			// Initialize form data from field values
			// IMPORTANT: Only include non-UI fields (ui-step, ui-heading, ui-html, ui-image)
			const initialData: FormData = {};
			regularFields.forEach((field: VoxelField) => {
				// Skip UI-only fields - they should NOT be sent to server
				if (field.is_ui === 1 || field.is_ui === true) {
					return;
				}

				// Handle different field types with proper default values
				if (field.type === 'switcher') {
					// Boolean field - use false if no value provided
					initialData[field.key] = field.value !== undefined ? field.value : false;
				} else if (field.type === 'multiselect' || field.type === 'taxonomy') {
					// CRITICAL FIX: Convert array format to object format for TaxonomyField
					// Voxel returns saved values as arrays ['slug1', 'slug2']
					// But TaxonomyField component uses object format {slug1: true, slug2: true}
					if (Array.isArray(field.value)) {
						const objValue: Record<string, boolean> = {};
						(field.value as string[]).forEach((slug: string) => { objValue[slug] = true; });
						initialData[field.key] = objValue;
					} else {
						// Already object format or undefined
						initialData[field.key] = field.value || {};
					}
				} else if (['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type)) {
					// File-based fields - CRITICAL FIX for images disappearing
					// Voxel returns array of FileObjects from editing_value() method
					// Evidence: themes/voxel/app/post-types/fields/file-field.php:96-121
					// Format: [{ source: 'existing', id: 123, name: 'file.jpg', type: 'image/jpeg', preview: 'url' }]
					// Note: Backend may return 'url' instead of 'preview' - handle both
					//
					// MUST populate BOTH:
					// 1. fileObjectsRef (for submission - line 965)
					// 2. formData (for UI display and validation)
					const rawFileObjects: unknown[] = Array.isArray(field.value) ? (field.value as unknown[]) : [];

					// Normalize file objects to ensure preview is always set
					// Backend may return 'url' instead of 'preview'
					const fileObjects: FileObject[] = rawFileObjects.map((fileObj: unknown) => {
						const obj = fileObj as Record<string, unknown>;
						return {
							source: (obj['source'] as 'existing' | 'new_upload') || 'existing',
							id: obj['id'] as number | undefined,
							name: (obj['name'] as string) || '',
							type: (obj['type'] as string) || '',
							// CRITICAL FIX: Use 'preview' if available, fall back to 'url'
							preview: (obj['preview'] as string) || (obj['url'] as string) || '',
						};
					});

					// Store FileObjects in ref (used during submission)
					fileObjectsRef.current[field.key] = fileObjects;

					// Store metadata in formData (used for UI)
					const metadataOnly: FileMetadata[] = fileObjects.map((fileObj) => ({
						source: fileObj.source,
						id: fileObj.id,
						name: fileObj.name,
						type: fileObj.type,
						preview: fileObj.preview,
					}));
					initialData[field.key] = metadataOnly as unknown as FieldValue;
				} else {
					// String-based fields - use empty string if no value provided
					initialData[field.key] = field.value || '';
				}
			});

			setFormData(initialData);

			// NOTE: 'create-post:mounted' message is now sent in the submit method exposure useEffect
			// This ensures the submit method is available before parent attaches click handlers
		}
	}, [fieldsConfig, context]);

	/**
	 * Check if a field value is empty based on field type
	 */
	const isFieldValueEmpty = (field: VoxelField, value: FieldValue): boolean => {
		// Null or undefined
		if (value === null || value === undefined) {
			return true;
		}

		// String fields (text, email, url, etc.)
		if (typeof value === 'string') {
			return value.trim() === '';
		}

		// Arrays - check if empty
		// Multiselect fields may use arrays ['value1', 'value2'] from Voxel
		if (Array.isArray(value)) {
			return value.length === 0;
		}

		// Product field - special handling
		// A product field is considered "empty" if enabled is false (or missing)
		// For required product fields, enabled must be true
		if (field.type === 'product' && typeof value === 'object') {
			return !value['enabled'];
		}

		// Multiselect/object fields - check if object is empty or has no true values
		// Multiselect fields may use objects {value1: true, value2: false}
		if (typeof value === 'object') {
			return Object.keys(value).length === 0 || !Object.values(value).some(v => v === true);
		}

		// Boolean fields (switcher) - false is considered empty for required fields
		// Required switchers need to be checked (true) to be valid
		if (typeof value === 'boolean') {
			return value === false;
		}

		// Numbers - 0 is a valid value, only check for null/undefined above
		if (typeof value === 'number') {
			return false;
		}

		return false;
	};

	/**
	 * Validate Product field sub-fields
	 * Returns the first invalid sub-field key, or null if all valid
	 *
	 * Product fields have a nested structure:
	 * - field.props.product_types[type].fields = { base-price: {...}, stock: {...}, etc }
	 * - Each sub-field has props.required to determine if it needs validation
	 * - The product value structure: { enabled, product_type, base_price: {...}, stock: {...}, etc }
	 */
	const validateProductSubFields = (
		field: VoxelField,
		value: FieldValue
	): { subFieldKey: string; error: string } | null => {
		// Only validate if product is enabled and is a product value object
		if (!isProductFieldValue(value) || !value.enabled) {
			return null; // Product not enabled, sub-fields don't need validation
		}

		// Get the selected product type
		const productType = value.product_type;
		if (!productType) {
			return null; // No product type selected
		}

		// Get product type configuration
		const productTypes = (field.props?.['product_types'] || {}) as Record<string, { fields?: Record<string, { label?: string; required?: boolean; props?: { required?: boolean } }> }>;
		const productTypeConfig = productTypes[productType];
		if (!productTypeConfig || !productTypeConfig.fields) {
			return null; // No fields to validate
		}

		// Iterate through sub-fields and validate required ones
		for (const subFieldKey of Object.keys(productTypeConfig.fields)) {
			const subField = productTypeConfig.fields[subFieldKey];
			if (!subField) continue;

			// Check if sub-field is required (can be in props.required or root level)
			const isRequired = subField.props?.required === true || subField.required === true;
			if (!isRequired) continue;

			// Normalize sub-field key (Voxel uses 'base-price' but value uses 'base_price')
			const valueKey = subFieldKey.replace(/-/g, '_');
			const subFieldValue = (value[subFieldKey] || value[valueKey]) as { amount?: number | null } | undefined;

			// Validate based on sub-field type
			let isEmpty = false;

			// Base price validation: { amount: number, discount_amount?: number }
			if (subFieldKey === 'base-price' || subFieldKey === 'base_price') {
				isEmpty = !subFieldValue ||
					(subFieldValue.amount === null ||
						subFieldValue.amount === undefined ||
						(subFieldValue.amount as any) === '');
			}
			// Stock validation (optional by default in many setups)
			else if (subFieldKey === 'stock') {
				// Stock is typically not strictly required
				isEmpty = false;
			}
			// Shipping validation: { enabled: boolean, shipping_class?: string }
			else if (subFieldKey === 'shipping') {
				// If shipping is required and enabled, shipping_class might be required
				// For now, we consider it filled if the object exists
				isEmpty = !subFieldValue;
			}
			// Generic fallback for other sub-fields
			else {
				isEmpty = subFieldValue === null ||
					subFieldValue === undefined ||
					(subFieldValue as any) === '' ||
					(typeof subFieldValue === 'object' && Object.keys(subFieldValue).length === 0);
			}

			// Return first invalid sub-field
			if (isEmpty) {
				return {
					subFieldKey,
					error: `${subField.label || subFieldKey} is required`
				};
			}
		}

		return null; // All required sub-fields are valid
	};

	/**
	 * Handle field value change
	 * Clears validation errors when value becomes valid
	 *
	 * IMPORTANT: File objects can't be stored in React state (they get serialized to {})
	 * Solution: Store File objects in fileObjectsRef, keep metadata in formData
	 */
	const handleFieldChange = (fieldKey: string, value: FieldValue) => {
		// Find the field to check if it's a file-based field
		const field = fields.find(f => f.key === fieldKey);
		const isFileField = field && ['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type);

		// If this is a file field with an array of FileObjects, store actual Files in ref
		if (isFileField && Array.isArray(value)) {
			// Type guard: ensure each item has the FileObject structure
			const fileObjects = value as unknown as FileObject[];

			// Store the File objects in the ref (won't be serialized)
			fileObjectsRef.current[fieldKey] = fileObjects;

			// Store metadata only in formData (for UI display and validation)
			const metadataOnly: FileMetadata[] = fileObjects.map((fileObj) => ({
				source: fileObj.source,
				id: fileObj.id,
				name: fileObj.name,
				type: fileObj.type,
				preview: fileObj.preview,
				// Intentionally omit the 'file' property - it's in the ref
			}));

			setFormData((prev) => ({
				...prev,
				[fieldKey]: metadataOnly as unknown as FieldValue,
			}));
		} else {
			// Non-file field: store as normal
			setFormData((prev) => ({
				...prev,
				[fieldKey]: value,
			}));
		}

		// Clear/update validation errors in real-time
		if (!field) return;

		const errors: string[] = [];

		// Required field validation - handles all field types (select, multiselect, text, etc.)
		if (field.required && isFieldValueEmpty(field, value)) {
			errors.push('Required');
		} else {
			// Only validate other rules if required check passes

			// Email validation
			if (field.type === 'email' && value && typeof value === 'string') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					errors.push('You must provide a valid email address');
				}
			}

			// URL validation
			if (field.type === 'url' && value && typeof value === 'string') {
				try {
					new URL(value);
				} catch {
					errors.push('You must provide a valid URL');
				}
			}

			// Number field min/max validation
			if (field.type === 'number' && value !== '' && value !== null && value !== undefined) {
				const num = (typeof value === 'string' ? parseFloat(value) : value) as number;
				if (!isNaN(num)) {
					if (field.props?.min !== undefined && num < field.props.min) {
						errors.push(`Value cannot be less than ${field.props.min}`);
					}
					if (field.props?.max !== undefined && num > field.props.max) {
						errors.push(`Value cannot be more than ${field.props.max}`);
					}
				}
			}

			// Texteditor/Description field minlength validation
			if ((field.type === 'texteditor' || field.type === 'description') && value && typeof value === 'string') {
				const minLength = field.props?.['minlength'];
				if (minLength != null && value.length < (minLength as number)) {
					errors.push(`Value cannot be shorter than ${minLength} characters`);
				}
			}
		}

		// Update field validation state
		field.validation = field.validation || {};
		field.validation.errors = errors;

		// Trigger re-render with updated validation
		setFields([...fields]);
	};

	/**
	 * Validate current step fields
	 * Returns first field with error, or null if all valid
	 * Matches Voxel's validateCurrentStep logic
	 */
	const validateCurrentStep = (): { field: VoxelField; index: number } | null => {
		const currentStepFields = getCurrentStepFields();
		let firstError: { field: VoxelField; index: number } | null = null;

		// Loop through current step fields and validate each one
		currentStepFields.forEach((field, index) => {
			const value = formData[field.key];
			const errors: string[] = [];

			// DEBUG: Log validation check
			// Required field validation - handles all field types (select, multiselect, text, etc.)
			if (field.required && isFieldValueEmpty(field, value)) {
				errors.push('Required');
			}

			// Product field sub-field validation
			// When product is enabled, validate required sub-fields (base-price, shipping, etc.)
			if (field.type === 'product' && errors.length === 0) {
				const productSubFieldError = validateProductSubFields(field, value);
				if (productSubFieldError) {
					errors.push(productSubFieldError.error);
				}
			}

			// Email validation
			if (field.type === 'email' && value && typeof value === 'string') {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(value)) {
					errors.push('You must provide a valid email address');
				}
			}

			// URL validation
			if (field.type === 'url' && value && typeof value === 'string') {
				try {
					new URL(value);
				} catch {
					errors.push('You must provide a valid URL');
				}
			}

			// Number field min/max validation
			if (field.type === 'number' && value !== '' && value !== null && value !== undefined) {
				const num = (typeof value === 'string' ? parseFloat(value) : value) as number;
				if (!isNaN(num)) {
					if (field.props?.min !== undefined && num < field.props.min) {
						errors.push(`Value cannot be less than ${field.props.min}`);
					}
					if (field.props?.max !== undefined && num > field.props.max) {
						errors.push(`Value cannot be more than ${field.props.max}`);
					}
				}
			}

			// Store first error found
			if (errors.length > 0 && firstError === null) {
				firstError = { field, index };
			}

			// Update field validation state
			field.validation = field.validation || {};
			field.validation.errors = errors;
		});

		// Update fields state to trigger re-render with errors
		if (currentStepFields.length > 0) {
			setFields([...fields]);
		}

		return firstError;
	};

	/**
	 * Step navigation functions
	 * Updates URL with new step and validates before moving forward
	 */
	const nextStep = () => {
		if (currentStepIndex < steps.length - 1) {
			// Validate current step before proceeding
			const validationError = validateCurrentStep();

			if (validationError !== null) {
				// Validation failed - scroll to first error field
				setTimeout(() => {
					// Try to find the error field by ts-has-errors class first (most reliable)
					let errorFieldElement = document.querySelector('.ts-form-group.ts-has-errors');

					// Fallback: try to find by field key (standardized class)
					if (!errorFieldElement) {
						errorFieldElement = document.querySelector(
							`.ts-form-group.field-key-${validationError.field.key}`
						);
					}

					if (errorFieldElement) {
						errorFieldElement.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
							inline: 'nearest'
						});

						// Focus the first input in the error field
						const input = errorFieldElement.querySelector('input, textarea, select');
						if (input && input instanceof HTMLElement) {
							setTimeout(() => {
								input.focus();
							}, 300);
						}
					}
				}, 100);

				return; // Block navigation
			}

			// Validation passed - proceed to next step
			const newStepIndex = currentStepIndex + 1;
			setCurrentStepIndex(newStepIndex);
			updateUrlWithStep(newStepIndex);
			// Scroll to top of form
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const prevStep = () => {
		if (currentStepIndex > 0) {
			// No validation when going back
			const newStepIndex = currentStepIndex - 1;
			setCurrentStepIndex(newStepIndex);
			updateUrlWithStep(newStepIndex);
			// Scroll to top of form
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	/**
	 * Get fields for current step
	 * Fields belong to a step based on their position in the fieldsConfig array
	 *
	 * PHASE 3 UPDATE: Now includes conditional visibility filtering
	 * Evidence: voxel-create-post.beautified.js lines 1676-1684 (ConditionMixin integration)
	 */
	const getCurrentStepFields = (): VoxelField[] => {
		if (steps.length === 0) {
			// No steps defined - show all fields
			// Filter by conditional visibility
			return fields.filter(field => fieldVisibility[field.key] !== false);
		}

		// Get all fields from fieldsConfig (including steps)
		const allFields = fieldsConfig || [];

		// Find indices of step fields
		const stepIndices = steps.map(step =>
			allFields.findIndex((f: VoxelField) => f.key === step.key)
		);

		// Add end index (total length)
		stepIndices.push(allFields.length);

		// Get start and end indices for current step
		const startIdx = stepIndices[currentStepIndex];
		const endIdx = stepIndices[currentStepIndex + 1];

		// Get fields between current step and next step (excluding the step fields themselves)
		// Get fields between current step and next step (excluding the step fields themselves)
		const stepFieldsConfig = allFields
			.slice(startIdx + 1, endIdx)
			.filter((f: VoxelField) => f.type !== 'ui-step');

		// Map to state fields to ensure we render with validation errors
		// IMPORTANT: fieldsConfig is static props, fields is dynamic state with validation
		const stepFields = stepFieldsConfig.map(configField => {
			return fields.find(f => f.key === configField.key) || configField;
		});

		// Filter by conditional visibility (ConditionMixin integration)
		// Evidence: voxel-create-post.beautified.js lines 1603-1622 (conditionsPass method)
		const visibleStepFields = stepFields.filter(field => fieldVisibility[field.key] !== false);

		// console.log(`${context}: Step ${currentStepIndex + 1}/${steps.length} - Fields:`, visibleStepFields.length);

		return visibleStepFields;
	};

	// Get current step's fields
	const currentStepFields = getCurrentStepFields();
	const currentStep = steps[currentStepIndex] || { label: 'Form', key: 'default' };

	/**
	 * Helper: Get step index for a given field key
	 */
	const getStepIndexForField = (targetFieldKey: string): number => {
		if (steps.length <= 1) return 0;

		const allFields = fieldsConfig || [];
		const targetIndex = allFields.findIndex(f => f.key === targetFieldKey);

		if (targetIndex === -1) return 0;

		// Map step indices
		const stepIndices = steps.map(step =>
			allFields.findIndex((f: VoxelField) => f.key === step.key)
		);
		stepIndices.push(allFields.length);

		// Find range
		for (let i = 0; i < stepIndices.length - 1; i++) {
			const startIdx = stepIndices[i];
			const endIdx = stepIndices[i + 1];
			// Field is in this step if it's after the start (ui-step) and before the end
			if (targetIndex > startIdx && targetIndex < endIdx) {
				return i;
			}
		}

		return 0;
	};

	/**
	 * Validate form before submission
	 */
	const validateForm = (): boolean => {
		const errors: { [key: string]: string } = {};

		fields.forEach((field) => {
			const value = formData[field.key];

			// Required field validation - handles all field types (select, multiselect, text, etc.)
			if (field.required && isFieldValueEmpty(field, value)) {
				errors[field.key] = 'Required';
			}

			// Product field sub-field validation
			// When product is enabled, validate required sub-fields (base-price, shipping, etc.)
			if (field.type === 'product' && !errors[field.key]) {
				const productSubFieldError = validateProductSubFields(field, value);
				if (productSubFieldError) {
					errors[field.key] = productSubFieldError.error;
				}
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

				// Handle multi-step forms: switch step if needed
				const targetStep = getStepIndexForField(firstErrorFieldKey);
				const needsStepSwitch = steps.length > 1 && targetStep !== currentStepIndex;

				if (needsStepSwitch) {
					setCurrentStepIndex(targetStep);
					updateUrlWithStep(targetStep);
					// Scroll to top to ensure clean transition
					window.scrollTo({ top: 0, behavior: 'instant' });
				}

				// Wait for DOM to update (longer delay if step switch involved)
				setTimeout(() => {
					// Find the field by its unique key class
					const errorFieldElement = document.querySelector(
						`.ts-form-group.field-key-${firstErrorFieldKey}`
					);

					if (errorFieldElement) {
						errorFieldElement.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
							inline: 'nearest'
						});

						// Focus the first input in the error field if it exists
						const input = errorFieldElement.querySelector('input, textarea, select');
						if (input && input instanceof HTMLElement) {
							setTimeout(() => {
								input.focus();
							}, 300); // Small delay to let scroll complete
						}
					}
				}, needsStepSwitch ? 300 : 100);
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
	 * Uses injected onSubmit handler if provided (editor context)
	 * Falls back to Voxel AJAX submission (frontend context)
	 */
	const handleSubmit = async (e: React.MouseEvent | React.FormEvent) => {
		if (e && 'preventDefault' in e) {
			e.preventDefault();
		}

		// Validate form
		if (!validateForm()) {
			// Notify parent window (admin metabox) that validation failed
			// This allows the Update button to be re-enabled
			try {
				window.parent.postMessage('create-post:validation-failed', '*');
			} catch (error) {
				console.debug('postMessage failed (likely browser extension):', error);
			}
			return;
		}

		setSubmission({ ...submission, processing: true });

		try {
			let result: SubmissionResult;

			// Use injected onSubmit handler if provided (editor context)
			if (onSubmit) {
				result = await onSubmit(formData);
			} else {
				// Fallback to Voxel AJAX submission (frontend/admin context)
				// Detect admin metabox context
				const isAdminMetabox = isAdminMode || attributes._admin_mode === true;

				// Filter out UI fields before submission (they should never be sent to server)
				const submissionData: FormData = {};
				Object.keys(formData).forEach((key) => {
					const field = fields.find(f => f.key === key);
					// Skip if field is UI-only
					if (field && (field.is_ui === 1 || field.is_ui === true)) {
						return;
					}
					submissionData[key] = formData[key];
				});

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

				// File deduplication tracking - matches Voxel's _vx_file_aliases system
				// Evidence: voxel-create-post.beautified.js lines 4173-4221
				// Voxel deduplicates files across FormData using JSON.stringify({name,type,size,lastModified})
				const fileAliases: Record<string, string> = {};
				const appendedFileKeys: Set<string> = new Set();

				// Process each field in submissionData
				Object.keys(submissionData).forEach((fieldKey) => {
					let value = submissionData[fieldKey];
					const field = fields.find((f) => f.key === fieldKey);

					// CRITICAL FIX: Taxonomy fields - Voxel expects array of slugs, not object
					// Convert {slug1: true, slug2: true} → ['slug1', 'slug2']
					if (field && field.type === 'taxonomy' && value && typeof value === 'object' && !Array.isArray(value)) {
						const taxonomyValue = value as Record<string, boolean>;
						value = Object.keys(taxonomyValue).filter(slug => taxonomyValue[slug] === true);
					}

					// Check if this is a file-based field
					const isFileField =
						field &&
						['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type);

					if (isFileField && Array.isArray(value)) {
						// Get the actual File objects from the ref
						const fileObjects = fileObjectsRef.current[fieldKey] || [];

						// Determine FormData key - supports repeater nested paths
						// Evidence: Voxel uses files[field_id::row-path][] for repeater files
						const fileFormKey = field.repeater_id
							? `files[${field.id}::row-${field.repeater_index}][]`
							: `files[${field.id}][]`;

						// Initialize postdata array for this field
						postdataForJson[fieldKey] = [];

						// Process each file object
						fileObjects.forEach((fileObj) => {
							if (fileObj.source === 'new_upload' && fileObj.file) {
								// Deduplication check - same file may appear in multiple fields
								const fileSignature = JSON.stringify({
									name: fileObj.file.name,
									type: fileObj.file.type,
									size: fileObj.file.size,
									lastModified: fileObj.file.lastModified,
								});

								if (!appendedFileKeys.has(fileSignature)) {
									// First occurrence: append to FormData
									formDataObj.append(fileFormKey, fileObj.file);
									appendedFileKeys.add(fileSignature);
									fileAliases[fileSignature] = fileFormKey;
								}
								// Add marker to postdata (Channel 1)
								(postdataForJson[fieldKey] as (string | number)[]).push('uploaded_file');
							} else if (fileObj.source === 'existing' && fileObj.id) {
								// Add attachment ID to postdata only
								(postdataForJson[fieldKey] as (string | number)[]).push(fileObj.id);
							}
						});
					} else {
						// Non-file field: copy value as-is
						postdataForJson[fieldKey] = value;
					}
				});

				// Append file aliases for deduplication (Voxel's _vx_file_aliases system)
				if (Object.keys(fileAliases).length > 0) {
					formDataObj.append('_vx_file_aliases', JSON.stringify(fileAliases));
				}

				// Append JSON-stringified postdata
				formDataObj.append('postdata', JSON.stringify(postdataForJson));

				if (postId && postId > 0) {
					formDataObj.append('post_id', postId.toString());
				}

				// Build URL query string - use different handler for admin vs frontend
				// NOTE: wpData.ajaxUrl already has ?vx=1 from render.php
				let voxelAjaxUrl: string;

				if (isAdminMetabox) {
					// Admin metabox mode: Use admin handler
					const adminNonce = wpData.adminModeNonce || '';
					const queryParams = new URLSearchParams({
						action: 'create_post__admin',
						post_type: postTypeKey,
						post_id: (postId || attributes._admin_post_id || '').toString(),
						admin_mode: adminNonce,
					});
					voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;
				} else {
					// Frontend mode: Use frontend handler
					const queryParams = new URLSearchParams({
						action: 'create_post',
						post_type: postTypeKey,
					});
					if (postId && postId > 0) {
						queryParams.append('post_id', postId.toString());
					}
					voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;
				}

				// Use fetch with proper headers for FormData
				const response = await fetch(voxelAjaxUrl, {
					method: 'POST',
					body: formDataObj,
					credentials: 'same-origin',
					redirect: 'manual',
				});

				// Check for redirect response
				if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
					throw new Error('Server returned redirect. This should not happen with AJAX requests.');
				}

				// Check if response is OK
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				// Check Content-Type to ensure it's JSON
				const contentType = response.headers.get('content-type');
				if (!contentType || !contentType.includes('application/json')) {
					throw new Error('Server returned non-JSON response. This might be a redirect or error page.');
				}

				// Parse JSON response
				result = await response.json();
			}

			// Handle response - matches Voxel's success handling
			if (result.success) {
				// Override edit_link to use Voxel's convention
				// BUG FIX: Voxel returns 'edit_link' (underscore) not 'editLink' (camelCase)
				let editLink = result.edit_link;

				// Extract post_id from edit_link if available
				let extractedPostId: string | null = null;
				if (result.edit_link) {
					try {
						const url = new URL(result.edit_link, window.location.origin);
						extractedPostId = url.searchParams.get('post_id');
					} catch (e) {
						const match = result.edit_link.match(/[?&]post_id=(\d+)/);
						extractedPostId = match ? match[1] : null;
					}
				}

				// Build correct edit_link using Voxel's convention
				// MULTISITE FIX: Use getSiteBaseUrl() for multisite subdirectory support
				if (extractedPostId && postTypeKey) {
					const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
					editLink = `${siteBase}/create-${postTypeKey}/?post_id=${extractedPostId}`;
				}

				// Update state - this will trigger re-render to show success screen
				setSubmission({
					processing: false,
					done: true,
					success: true,
					message: result.message || attributes.successMessage,
					viewLink: result.view_link,
					editLink: editLink,
					status: result.status,
				});

				// Notify parent window (for admin metabox only) - 1:1 match with Voxel
				// Evidence: Voxel only sends postMessage when in admin iframe context
				if (isAdminMode && window.parent !== window) {
					try {
						window.parent.postMessage('create-post:submitted', '*');
					} catch (error) {
						// Silently ignore browser extension errors
						console.debug('postMessage failed (likely browser extension):', error);
					}
				}

				// Scroll to top (matches Voxel's scrollIntoView behavior)
				requestAnimationFrame(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				});

				// DO NOT redirect automatically - Voxel shows success screen with buttons
				if (attributes.redirectAfterSubmit && !result.edit_link && !result.view_link) {
					setTimeout(() => {
						window.location.href = attributes.redirectAfterSubmit;
					}, 500);
				}
			} else {
				// Handle errors - matches Voxel's error handling
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

				// Scroll to top to show inline error notification (works in all contexts)
				requestAnimationFrame(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				});

				// Also show Voxel.alert if available (for frontend consistency)
				if ((window as any).Voxel?.alert) {
					(window as any).Voxel.alert(errorMessage, 'error');
				}
			}
		} catch (error) {
			console.error(`${context}: Form submission error`, error);
			const networkErrorMessage = 'Network error. Please try again.';
			setSubmission({
				processing: false,
				done: false,
				success: false,
				message: networkErrorMessage,
				errors: [networkErrorMessage], // Include in errors array for inline notification
			});

			// Scroll to top to show inline error notification (works in all contexts)
			requestAnimationFrame(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});

			// Also show Voxel.alert if available (for frontend consistency)
			if ((window as any).Voxel?.alert) {
				(window as any).Voxel.alert(networkErrorMessage, 'error');
			}
		}
	};

	/**
	 * Handle save as draft
	 */
	const handleSaveDraft = async () => {
		// Voxel pattern: Skip required field validation for drafts
		// Evidence: voxel-create-post.beautified.js lines 4139-4143
		// this.validateRequired = false; → allows empty required fields
		// We skip validateForm() entirely for drafts — Voxel only validates non-required constraints
		setSubmission({ ...submission, processing: true });

		try {
			const formDataObj = new FormData();
			formDataObj.append('postdata', JSON.stringify(formData));
			formDataObj.append('save_as_draft', 'yes');

			if (postId) {
				formDataObj.append('post_id', postId.toString());
			}

			// NOTE: wpData.ajaxUrl already has ?vx=1 from fallback or wp_localize_script
			const voxelAjaxUrl = `${wpData.ajaxUrl}&action=create_post&post_type=${postTypeKey}${postId ? `&post_id=${postId}` : ''}`;

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

	// Expose submit method for admin metabox (1:1 match with Voxel's __vue_instance__ pattern)
	// CRITICAL: Voxel's backend.js expects: element.__vue_instance__.submit()
	// Evidence: themes/voxel/assets/dist/backend.js line 57:
	//   i.contentWindow.document.querySelector(".ts-create-post").__vue_instance__.submit()
	useEffect(() => {
		if (formRef.current) {
			// Add __vue_instance__ with submit method to match Voxel's expected API
			// This allows Voxel's admin JavaScript to trigger our form submission
			(formRef.current as any).__vue_instance__ = {
				submit: handleSubmit,
			};

			// Also add legacy voxelSubmit for backwards compatibility
			(formRef.current as any).voxelSubmit = handleSubmit;
		}

		// Also expose on window for easier access from parent
		(window as any).voxelFseSubmit = handleSubmit;

		// CRITICAL: Send 'create-post:mounted' AFTER submit method is exposed
		// This fixes the race condition where parent attaches click handlers
		// before the submit method exists on the form element
		if (window.parent !== window) {
			try {
				window.parent.postMessage('create-post:mounted', '*');
			} catch {
				// Silently ignore browser extension errors
			}
		}
	}, [handleSubmit, context]);

	// Build vxconfig JSON matching Voxel's structure (same as save.tsx)
	// This keeps vxconfig visible in DOM after React hydration (matching search-form pattern)
	const vxConfig = {
		postTypeKey: attributes.postTypeKey || '',
		submitButtonText: attributes.submitButtonText || 'Publish',
		successMessage: attributes.successMessage || '',
		redirectAfterSubmit: attributes.redirectAfterSubmit || '',
		showFormHead: attributes.showFormHead ?? true,
		enableDraftSaving: attributes.enableDraftSaving ?? true,
		icons: {
			popupIcon: attributes.popupIcon || null,
			infoIcon: attributes.infoIcon || null,
			tsMediaIco: attributes.tsMediaIco || null,
			nextIcon: attributes.nextIcon || null,
			prevIcon: attributes.prevIcon || null,
			downIcon: attributes.downIcon || null,
			trashIcon: attributes.trashIcon || null,
			draftIcon: attributes.draftIcon || null,
			publishIcon: attributes.publishIcon || null,
			saveIcon: attributes.saveIcon || null,
			successIcon: attributes.successIcon || null,
			viewIcon: attributes.viewIcon || null,
			tsCalendarIcon: attributes.tsCalendarIcon || null,
			tsCalminusIcon: attributes.tsCalminusIcon || null,
			tsAddIcon: attributes.tsAddIcon || null,
			tsEmailIcon: attributes.tsEmailIcon || null,
			tsPhoneIcon: attributes.tsPhoneIcon || null,
			tsLocationIcon: attributes.tsLocationIcon || null,
			tsMylocationIcon: attributes.tsMylocationIcon || null,
			tsMinusIcon: attributes.tsMinusIcon || null,
			tsPlusIcon: attributes.tsPlusIcon || null,
			tsListIcon: attributes.tsListIcon || null,
			tsSearchIcon: attributes.tsSearchIcon || null,
			tsClockIcon: attributes.tsClockIcon || null,
			tsLinkIcon: attributes.tsLinkIcon || null,
			tsRtimeslotIcon: attributes.tsRtimeslotIcon || null,
			tsUploadIco: attributes.tsUploadIco || null,
			tsLoadMore: attributes.tsLoadMore || null,
		},
	};

	// Main form render
	return (
		<div ref={formRef} className="ts-form ts-create-post create-post-form">
			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			{/* This keeps vxconfig visible in DOM after React hydration (matching search-form) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Success screen - conditionally rendered */}
			{submission.done && submission.success ? (
				<div className="ts-edit-success flexify">
					{/* Success icon - matches Voxel line 28 (checkmark-circle.svg) */}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
					</svg>
					<h4>{submission.message}</h4>
					<div className="es-buttons flexify">
						{/* View button - only if status is publish */}
						{submission.status === 'publish' && submission.viewLink && (
							<a
								href={submission.viewLink}
								className="ts-btn ts-btn-2 ts-btn-large form-btn"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
								</svg>
								View
							</a>
						)}
						{/* Back to editing button - disabled in editor context */}
						{submission.editLink && (
							<a
								href={context === 'editor' ? '#' : submission.editLink}
								className={`ts-btn ts-btn-1 ts-btn-large form-btn ${context === 'editor' ? 'disabled' : ''}`}
								onClick={context === 'editor' ? (e) => e.preventDefault() : undefined}
								style={context === 'editor' ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
							>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor" />
								</svg>
								Back to Editing
							</a>
						)}
					</div>
				</div>
			) : (
				<>
					{(attributes.showFormHead ?? true) && (
						<div className="ts-form-progres">
							{/* Step progress bar - only show if multiple steps */}
							{steps.length > 1 && (
								<ul className="step-percentage simplify-ul flexify">
									{steps.map((_, index) => (
										<li key={index} className={currentStepIndex >= index ? 'step-done' : ''}></li>
									))}
								</ul>
							)}
							<div className="ts-active-step flexify">
								<div className="active-step-details">
									<p>{currentStep.label || 'Form'}</p>
								</div>
								<div className="step-nav flexify">
									{/* Draft button visibility - Plan C+ parity
									    Evidence: themes/voxel/app/widgets/create-post.php:4999
									    canSaveDraft = (post_status === 'draft') for existing posts
									    For new posts, always allow draft saving */}
									{(attributes.enableDraftSaving ?? true) && !isAdminMode && (postContext?.canSaveDraft ?? true) && (
										<a
											href="#"
											onClick={handleSaveDraft}
											className={`ts-icon-btn has-tooltip ts-save-draft ${submission.processing ? 'vx-pending' : ''}`}
											data-tooltip="Save as draft"
											aria-label="Save as draft"
										>
											{renderIcon(attributes.draftIcon, defaultIcons.draft)}
										</a>
									)}
									{/* Step navigation - only show if multiple steps */}
									{steps.length > 1 && (
										<>
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													prevStep();
												}}
												className={`ts-icon-btn has-tooltip ${currentStepIndex === 0 ? 'disabled' : ''}`}
												data-tooltip="Previous step"
											>
												{renderIcon(attributes.prevIcon, defaultIcons.prev)}
											</a>
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													nextStep();
												}}
												className={`ts-icon-btn has-tooltip ${currentStepIndex === steps.length - 1 ? 'disabled' : ''}`}
												data-tooltip="Next step"
											>
												{renderIcon(attributes.nextIcon, defaultIcons.next)}
											</a>
										</>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Form fields container */}
					<div className="create-form-step form-field-grid">
						{/* Render fields for current step */}
						{currentStepFields.map((field) => (
							<FieldRenderer
								key={field.key}
								field={field}
								value={formData[field.key]}
								onChange={(value) => handleFieldChange(field.key, value)}
								errors={field.validation?.errors || []}
								onBlur={() => { }}
								postTypeKey={postTypeKey}
								icons={{
									tsCalendarIcon: attributes.tsCalendarIcon,
									tsClockIcon: attributes.tsClockIcon,
									tsMinusIcon: attributes.tsMinusIcon,
									tsPlusIcon: attributes.tsPlusIcon,
									tsEmailIcon: attributes.tsEmailIcon,
									tsPhoneIcon: attributes.tsPhoneIcon,
									tsLocationIcon: attributes.tsLocationIcon,
									tsMylocationIcon: attributes.tsMylocationIcon,
									tsSearchIcon: attributes.tsSearchIcon,
									tsListIcon: attributes.tsListIcon,
									tsLinkIcon: attributes.tsLinkIcon,
									tsAddIcon: attributes.tsAddIcon,
									tsUploadIco: attributes.tsUploadIco,
								}}
							/>
						))}


					</div>

					{/* Form footer with navigation and submit (1:1 Voxel match) */}
					{/* Evidence: themes/voxel/templates/widgets/create-post.php:152-201 */}
					<div className="ts-form-footer flexify">
						{/* Prev/Next navigation - only show if multiple steps */}
						{steps.length > 1 && (
							<ul className="ts-nextprev simplify-ul flexify">
								<li>
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											prevStep();
										}}
										className={`ts-prev ts-btn ts-btn-1 ts-btn-large form-btn ${currentStepIndex === 0 ? 'disabled' : ''}`}
									>
										{renderIcon(attributes.prevIcon, defaultIcons.prev)}
										Previous step
									</a>
								</li>
								<li>
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											nextStep();
										}}
										className={`ts-next ts-btn ts-btn-1 ts-btn-large form-btn ${currentStepIndex === (steps.length - 1) ? 'disabled' : ''}`}
									>
										Next step
										{renderIcon(attributes.nextIcon, defaultIcons.next)}
									</a>
								</li>
							</ul>
						)}

						{/* Submit buttons - Two separate buttons following Voxel's logic (1:1 match) */}
						{/* Evidence: themes/voxel/templates/widgets/create-post.php:170, 190 */}
						{/* Hide submit buttons in admin metabox - WordPress Update button handles saving */}
						{!wpData.isAdminMetabox && (
							<>
								{/* Publish button - Show on last step AND (no post OR post is draft) */}
								{/* Voxel line 170: v-if="step_index === (activeSteps.length - 1) && (!post || post.status === 'draft')" */}
								{currentStepIndex === (steps.length - 1) && (!postId || postStatus === 'draft') && (
									<a
										href="#"
										className={`ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes ${submission.processing ? 'vx-pending' : ''}`}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (!submission.processing) {
												handleSubmit(e);
											}
											return false;
										}}
										onMouseDown={(e) => {
											if (submission.processing) {
												e.preventDefault();
											}
										}}
									>
										{submission.processing ? (
											<div className="ts-loader-wrapper">
												<span className="ts-loader"></span>
												Please wait...
											</div>
										) : (
											<>
												{attributes.submitButtonText || 'Publish'}
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="currentColor" />
												</svg>
											</>
										)}
									</a>
								)}

								{/* Save changes button - Show on ALL steps when editing published post */}
								{/* Different from Publish button which only shows on last step */}
								{/* Voxel line 190: v-if="post && post.status !== 'draft'" */}
								{postId && isPublishedPost && (
									<a
										href="#"
										className={`ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes ${submission.processing ? 'vx-pending' : ''}`}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (!submission.processing) {
												handleSubmit(e);
											}
											return false;
										}}
										onMouseDown={(e) => {
											if (submission.processing) {
												e.preventDefault();
											}
										}}
									>
										{submission.processing ? (
											<div className="ts-loader-wrapper">
												<span className="ts-loader"></span>
												Please wait...
											</div>
										) : (
											<>
												<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H15.3809C15.977 3.25 16.5488 3.48658 16.9707 3.90779L20.0897 7.02197C20.5124 7.44403 20.7499 8.01685 20.7499 8.61418L20.7499 18.5C20.7499 19.7426 19.7425 20.75 18.4999 20.75H16.75V16.25C16.75 15.0074 15.7426 14 14.5 14L9.5 14C8.25736 14 7.25 15.0074 7.25 16.25L7.25001 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H12C12.4142 7.75 12.75 7.41421 12.75 7C12.75 6.58579 12.4142 6.25 12 6.25H8Z" fill="currentColor" />
													<path d="M8.75001 20.75L15.25 20.75V16.25C15.25 15.8358 14.9142 15.5 14.5 15.5L9.5 15.5C9.08579 15.5 8.75 15.8358 8.75 16.25L8.75001 20.75Z" fill="currentColor" />
												</svg>
												Save changes
											</>
										)}
									</a>
								)}
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
};
