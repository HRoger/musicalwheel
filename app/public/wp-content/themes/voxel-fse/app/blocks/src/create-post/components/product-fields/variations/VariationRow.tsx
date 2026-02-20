/**
 * VariationRow Component
 * Phase 3: VariationsField implementation - 1:1 Voxel Match
 *
 * Displays a single variation in the variations list with full configuration.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations-field.php:22-94
 * - CSS classes: collapsed, disabled, v-checked, v-error
 * - Style: pointer-events: all
 * - Status icon: checkmark-circle.svg (valid) or info.svg (invalid)
 * - Price in <em>: "Out of stock", "$price", "$discount <s>$original</s>", "No price added"
 * - Controller: plus icon (enable), trash icon (disable), chevron-down
 * - Expanded content: medium form-field-grid with Price, Image, Stock, Bulk settings
 *
 * Sub-components evidence:
 * - variation-base-price.php: Price and Discount price inputs with currency suffix
 * - variation-stock.php: Manage stock toggle, Stock quantity, SKU, Limit purchases
 * - variation-bulk-settings.php: Bulk apply settings with Copy/To dropdowns
 */
import React, { useRef, useState } from 'react';
import type {
	ProductVariation,
	ProductAttribute,
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
// @ts-ignore -- unused but kept for future use
type _MediaPopupSelectedFile = MediaPopupNewUpload | MediaPopupExisting;

// Initialize global cache (use any cast to avoid Window interface conflicts)
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
		(cached: SessionFile) =>
			cached.name === file.name &&
			cached.type === file.type &&
			cached.size === file.size &&
			cached.item!.lastModified === file.lastModified
	);

	if (exists) {
		return exists._id ?? '';
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
interface VariationRowProps {
	variation: ProductVariation;
	isActive: boolean;
	stockEnabled?: boolean;
	skuEnabled?: boolean;
	discountEnabled?: boolean;
	currency?: string;
	allVariations?: ProductVariation[];
	attributes?: ProductAttribute[];
	onToggle: () => void;
	onUpdate: (updates: Partial<ProductVariation>) => void;
	onToggleEnabled: (enabled: boolean) => void;
	onBulkApply?: (what: string, where: string, sourceVariation: ProductVariation) => void;
}

/**
 * Format currency (simple implementation)
 */
function formatCurrency(amount: number, currency: string = '$'): string {
	return `${currency}${amount.toFixed(2)}`;
}

/**
 * VariationRow Component
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/variations-field.php
 */
export const VariationRow: React.FC<VariationRowProps> = ({
	variation,
	isActive,
	stockEnabled = false,
	skuEnabled = false,
	discountEnabled = true,
	currency = '$',
	allVariations: _allVariations = [],
	attributes = [],
	onToggle,
	onUpdate,
	onToggleEnabled,
	onBulkApply,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragActive, setDragActive] = useState(false);
	const [bulkOpen, setBulkOpen] = useState(false);
	const [bulkWhat, setBulkWhat] = useState<string>('price');
	const [bulkWhere, setBulkWhere] = useState<string>('all');

	// Validation checks - matches Voxel hasValidPrice and hasValidStock
	const hasValidPrice = typeof variation.base_price?.amount === 'number';
	const hasValidStock = !stockEnabled ||
		!variation.stock?.enabled ||
		(variation.stock?.quantity ?? 0) > 0;

	// Status flags
	const isValid = variation.enabled && hasValidPrice && hasValidStock;
	const isError = variation.enabled && (!hasValidPrice || !hasValidStock);
	const isOutOfStock = variation.enabled && stockEnabled && variation.stock?.enabled && !hasValidStock;

	// CSS classes - matches Voxel :class="{collapsed, disabled, 'v-checked', 'v-error'}"
	const rowClasses = [
		'ts-field-repeater',
		isActive ? '' : 'collapsed',
		!variation.enabled ? 'disabled' : '',
		isValid ? 'v-checked' : '',
		isError ? 'v-error' : '',
	].filter(Boolean).join(' ');

	// Display label
	const displayLabel = variation.label || 'Unnamed variation';

	// Image handling
	const imageFile = variation.image;
	const hasImage = !!imageFile;

	// Handle price change
	const handlePriceChange = (amount: string) => {
		const numAmount = parseFloat(amount);
		onUpdate({
			base_price: {
				...variation.base_price,
				amount: isNaN(numAmount) ? 0 : numAmount,
			}
		});
	};

	// Handle discount price change
	const handleDiscountChange = (discountAmount: string) => {
		const numAmount = parseFloat(discountAmount);
		onUpdate({
			base_price: {
				amount: variation.base_price?.amount ?? 0,
				discount_amount: isNaN(numAmount) ? undefined : numAmount,
			}
		});
	};

	// Handle image file selection
	const handleImageSelect = (files: FileList | null) => {
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.type.startsWith('image/')) return;

		const sessionId = addToSessionCache(file);
		onUpdate({
			image: {
				source: 'new_upload',
				_id: sessionId,
				file: file,
				name: file.name,
				type: file.type,
				preview: URL.createObjectURL(file),
			}
		});
	};

	// Handle drag & drop for image
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		handleImageSelect(e.dataTransfer.files);
	};

	// Handle media popup save
	const handleMediaPopupSave = (selectedFiles: any[]) => {
		if (selectedFiles.length === 0) return;

		const file = selectedFiles[0];
		if (file.source === 'new_upload' && file._id && file.file) {
			onUpdate({
				image: {
					source: 'new_upload',
					_id: file._id,
					file: file.file,
					name: file.name,
					type: file.type,
					preview: file.preview,
				} as any
			});
		} else {
			onUpdate({
				image: {
					source: 'existing',
					id: file.id,
					name: file.name,
					type: file.type,
					preview: file.preview,
				} as any
			});
		}
	};

	// Remove image
	const removeImage = () => {
		onUpdate({ image: undefined });
	};

	// Stock handlers
	const handleStockToggle = () => {
		onUpdate({
			stock: {
				enabled: !variation.stock?.enabled,
				quantity: variation.stock?.quantity ?? 0,
				sku: variation.stock?.sku,
				sold_individually: variation.stock?.sold_individually ?? false,
			}
		});
	};

	const handleStockQuantityChange = (quantity: string) => {
		const numQuantity = parseInt(quantity);
		onUpdate({
			stock: {
				enabled: variation.stock?.enabled ?? false,
				quantity: isNaN(numQuantity) ? 0 : numQuantity,
				sku: variation.stock?.sku,
				sold_individually: variation.stock?.sold_individually ?? false,
			}
		});
	};

	const handleSkuChange = (sku: string) => {
		onUpdate({
			stock: {
				enabled: variation.stock?.enabled ?? false,
				quantity: variation.stock?.quantity ?? 0,
				sku,
				sold_individually: variation.stock?.sold_individually ?? false,
			}
		});
	};

	const handleSoldIndividuallyToggle = () => {
		onUpdate({
			stock: {
				enabled: variation.stock?.enabled ?? false,
				quantity: variation.stock?.quantity ?? 0,
				sku: variation.stock?.sku,
				sold_individually: !variation.stock?.sold_individually,
			}
		});
	};

	// Bulk apply handler
	const handleBulkApply = () => {
		if (onBulkApply) {
			onBulkApply(bulkWhat, bulkWhere, variation);
		}
	};

	// Get "where" choices for bulk apply - based on attributes
	const getWhereChoices = () => {
		const choices: { key: string; label: string }[] = [];
		(attributes || []).forEach(attr => {
			const attrValue = variation.attributes?.[attr.key];
			if (attrValue) {
				choices.push({
					key: `${attr.key}:${attrValue}`,
					label: `${attr.label}: ${attrValue}`,
				});
			}
		});
		return choices;
	};

	// Get image style for preview
	const getImageStyle = (): React.CSSProperties => {
		const img = variation.image;
		if (!img) return {};

		// Handle number (WordPress attachment ID) - no preview available
		if (typeof img === 'number') return {};

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
		const img = variation.image;
		if (!img) return 'Image';
		if (typeof img === 'number') return 'Image';
		if (typeof img === 'string') return 'Image';
		return img.name || 'Image';
	};

	return (
		<div className={rowClasses} style={{ pointerEvents: 'all' }}>
			{/* Row header - matches Voxel variations-field.php:23-60 */}
			<div className="ts-repeater-head" onClick={onToggle}>
				{/* Status icon - matches Voxel variations-field.php:24-29 */}
				{isValid ? (
					// Checkmark circle icon - matches Voxel checkmark-circle.svg
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.5303 9.53033C16.8232 9.23744 16.8232 8.76256 16.5303 8.46967C16.2374 8.17678 15.7626 8.17678 15.4697 8.46967L10.5 13.4393L8.53033 11.4697C8.23744 11.1768 7.76256 11.1768 7.46967 11.4697C7.17678 11.7626 7.17678 12.2374 7.46967 12.5303L9.96967 15.0303C10.2626 15.3232 10.7374 15.3232 11.0303 15.0303L16.5303 9.53033Z" fill="#343C54"/>
					</svg>
				) : (
					// Info icon - matches Voxel info.svg
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V8.01C12.75 8.42421 12.4142 8.76 12 8.76C11.5858 8.76 11.25 8.42421 11.25 8.01V8C11.25 7.58579 11.5858 7.25 12 7.25ZM12 10.25C12.4142 10.25 12.75 10.5858 12.75 11V16C12.75 16.4142 12.4142 16.75 12 16.75C11.5858 16.75 11.25 16.4142 11.25 16V11C11.25 10.5858 11.5858 10.25 12 10.25Z" fill="#343C54"/>
					</svg>
				)}

				{/* Variation label - matches Voxel variations-field.php:30-32 */}
				<label>{displayLabel}</label>

				{/* Price/Status display in <em> - matches Voxel variations-field.php:33-49 */}
				{isOutOfStock ? (
					// Out of stock - matches Voxel variations-field.php:33-35
					<em>Out of stock</em>
				) : hasValidPrice ? (
					// Price with optional discount - matches Voxel variations-field.php:36-46
					typeof variation.base_price?.discount_amount === 'number' ? (
						<em>
							{formatCurrency(variation.base_price.discount_amount, currency)}
							{' '}
							<s>{formatCurrency(variation.base_price.amount, currency)}</s>
						</em>
					) : (
						<em>{formatCurrency(variation.base_price!.amount, currency)}</em>
					)
				) : (
					// No price - matches Voxel variations-field.php:47-49
					<em>No price added</em>
				)}

				{/* Controller buttons - matches Voxel variations-field.php:50-60 */}
				<div className="ts-repeater-controller">
					{/* Enable button (plus icon) - shown when disabled - matches Voxel variations-field.php:51-53 */}
					{!variation.enabled && (
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleEnabled(true);
							}}
							className="ts-icon-btn ts-smaller"
						>
							{/* Plus icon - matches Voxel plus.svg */}
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#343C54"/>
							</svg>
						</a>
					)}

					{/* Disable button (trash icon) - shown when enabled - matches Voxel variations-field.php:54-56 */}
					{variation.enabled && (
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleEnabled(false);
							}}
							className="ts-icon-btn ts-smaller"
						>
							{/* Trash icon - matches Voxel trash-can.svg */}
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="#343C54"/>
								<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="#343C54"/>
							</svg>
						</a>
					)}

					{/* Collapse/expand icon - matches Voxel variations-field.php:57-59 */}
					<a href="#" className="ts-icon-btn ts-smaller" onClick={(e) => e.preventDefault()}>
						{/* Chevron down icon - matches Voxel chevron-down.svg */}
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="#343C54"/>
						</svg>
					</a>
				</div>
			</div>

			{/* Expanded content - matches Voxel variations-field.php:62-93 */}
			{isActive && (
				<div className="medium form-field-grid">
					{/* Base Price - matches Voxel variation-base-price.php */}
					<div className={`ts-form-group ${discountEnabled ? 'vx-1-2' : ''}`}>
						<label>Price</label>
						<div className="input-container">
							<input
								type="number"
								className="ts-filter"
								value={variation.base_price?.amount ?? ''}
								onChange={(e) => handlePriceChange(e.target.value)}
								min="0"
								placeholder="Add price"
							/>
							<span className="input-suffix">{currency}</span>
						</div>
					</div>

					{/* Discount Price - matches Voxel variation-base-price.php:17-26 */}
					{discountEnabled && (
						<div className="ts-form-group vx-1-2">
							<label>Discount price</label>
							<div className="input-container">
								<input
									type="number"
									className="ts-filter"
									value={variation.base_price?.discount_amount ?? ''}
									onChange={(e) => handleDiscountChange(e.target.value)}
									min="0"
									placeholder="Add price"
								/>
								<span className="input-suffix">{currency}</span>
							</div>
						</div>
					)}

					{/* Image Upload - matches Voxel file-field pattern */}
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

					{/* Stock Management - matches Voxel variation-stock.php */}
					{stockEnabled && (
						<div className="ts-form-group switcher-label">
							<label>
								<div className="switch-slider">
									<div className="onoffswitch">
										<input
											type="checkbox"
											className="onoffswitch-checkbox"
											checked={variation.stock?.enabled || false}
											onChange={handleStockToggle}
										/>
										<label
											className="onoffswitch-label"
											onClick={(e) => {
												e.preventDefault();
												handleStockToggle();
											}}
										></label>
									</div>
								</div>
								Manage stock
							</label>

							{/* Stock fields - shown when stock is enabled */}
							{variation.stock?.enabled && (
								<div className="ts-field-repeater">
									<div className="medium form-field-grid">
										{/* Stock quantity */}
										<div className="ts-form-group vx-1-2">
											<label>Stock</label>
											<input
												type="number"
												className="ts-filter"
												value={variation.stock?.quantity ?? ''}
												onChange={(e) => handleStockQuantityChange(e.target.value)}
												min="0"
												placeholder="Set quantity"
											/>
										</div>

										{/* SKU */}
										{skuEnabled && (
											<div className="ts-form-group vx-1-2">
												<label>SKU</label>
												<input
													type="text"
													className="ts-filter"
													value={variation.stock?.sku || ''}
													onChange={(e) => handleSkuChange(e.target.value)}
													placeholder="Stock-keeping unit"
												/>
											</div>
										)}

										{/* Sold individually toggle */}
										<div className="ts-form-group switcher-label">
											<label>
												<div className="switch-slider">
													<div className="onoffswitch">
														<input
															type="checkbox"
															className="onoffswitch-checkbox"
															checked={variation.stock?.sold_individually || false}
															onChange={handleSoldIndividuallyToggle}
														/>
														<label
															className="onoffswitch-label"
															onClick={(e) => {
																e.preventDefault();
																handleSoldIndividuallyToggle();
															}}
														></label>
													</div>
												</div>
												Limit purchases to 1 item per order
											</label>
										</div>
									</div>
								</div>
							)}
						</div>
					)}

					{/* Bulk Apply Settings - matches Voxel variation-bulk-settings.php */}
					<div className="ts-form-group">
						<a
							href="#"
							className="ts-btn ts-btn-4 form-btn"
							onClick={(e) => {
								e.preventDefault();
								setBulkOpen(!bulkOpen);
							}}
						>
							{/* Cog icon - matches Voxel cog.svg */}
							<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M3.39854 12.1458C2.33012 11.5289 1.96404 10.1627 2.5809 9.09428L4.09689 6.4685C4.71388 5.39984 6.08042 5.03388 7.14894 5.65079C7.63842 5.9334 8.25011 5.58009 8.25011 5.01524C8.25011 3.78144 9.2503 2.78125 10.4841 2.78125H13.5165C14.7502 2.78125 15.7501 3.78149 15.7501 5.01502C15.7501 5.57981 16.3615 5.93263 16.8503 5.65041C17.9185 5.03366 19.2845 5.39967 19.9012 6.46792L21.4176 9.09435C22.0345 10.1628 21.6684 11.5289 20.6 12.1458C20.1108 12.4282 20.1108 13.1343 20.6 13.4167C21.6684 14.0336 22.0344 15.3998 21.4176 16.4682L19.9012 19.0946C19.2845 20.1629 17.9185 20.5289 16.8503 19.9121C16.3615 19.6299 15.7501 19.9827 15.7501 20.5475C15.7501 21.781 14.7502 22.7812 13.5165 22.7812H10.4841C9.2503 22.7812 8.25011 21.7811 8.25011 20.5473C8.25011 19.9824 7.63844 19.6291 7.14896 19.9117C6.08044 20.5286 4.71391 20.1627 4.09692 19.094L2.58092 16.4682C1.96407 15.3998 2.33013 14.0336 3.39856 13.4168C3.88776 13.1343 3.88777 12.4282 3.39854 12.1458ZM11.9992 8.94618C9.88118 8.94618 8.16419 10.6632 8.16419 12.7812C8.16419 14.8992 9.88118 16.6162 11.9992 16.6162C14.1172 16.6162 15.8342 14.8992 15.8342 12.7812C15.8342 10.6632 14.1172 8.94618 11.9992 8.94618Z" fill="#343C54"/>
							</svg>
							<span>Bulk apply settings</span>
						</a>
					</div>

					{/* Bulk settings expanded - matches Voxel variation-bulk-settings.php:12-44 */}
					{bulkOpen && (
						<>
							<div className="ts-form-group vx-1-2">
								<label>Copy settings</label>
								<div className="ts-filter">
									<select
										value={bulkWhat}
										onChange={(e) => setBulkWhat(e.target.value)}
									>
										<option value="price">Price</option>
										<option value="image">Image</option>
										{stockEnabled && <option value="stock">Stock</option>}
										<option value="all">All</option>
									</select>
									<div className="ts-down-icon"></div>
								</div>
							</div>

							<div className="ts-form-group vx-1-2">
								<label>To variations</label>
								<div className="ts-filter">
									<select
										value={bulkWhere}
										onChange={(e) => setBulkWhere(e.target.value)}
									>
										{getWhereChoices().map(choice => (
											<option key={choice.key} value={choice.key}>
												All in {choice.label}
											</option>
										))}
										<option value="all">All</option>
									</select>
									<div className="ts-down-icon"></div>
								</div>
							</div>

							<div className="ts-form-group vx-1-1">
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										handleBulkApply();
									}}
									className="ts-btn ts-btn-2 form-btn"
								>
									{/* Checkmark circle icon */}
									<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path fillRule="evenodd" clipRule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.5303 9.53033C16.8232 9.23744 16.8232 8.76256 16.5303 8.46967C16.2374 8.17678 15.7626 8.17678 15.4697 8.46967L10.5 13.4393L8.53033 11.4697C8.23744 11.1768 7.76256 11.1768 7.46967 11.4697C7.17678 11.7626 7.17678 12.2374 7.46967 12.5303L9.96967 15.0303C10.2626 15.3232 10.7374 15.3232 11.0303 15.0303L16.5303 9.53033Z" fill="#343C54"/>
									</svg>
									Apply
								</a>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};
