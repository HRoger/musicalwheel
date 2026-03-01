/**
 * Product Form Block - Shared Component
 *
 * Used by both edit.tsx (editor) and frontend.tsx (hydration).
 * Renders the product form with dynamic fields, cart integration,
 * and price calculator.
 *
 * HTML structure matches Voxel's product-form widget 1:1:
 * - .ts-form.ts-product-form wrapper
 * - .ts-product-main container
 * - Dynamic field components
 * - .product-actions for add-to-cart/checkout buttons
 * - .ts-cost-calculator for pricing summary
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/product-form.php
 * - CSS classes: .ts-form, .ts-product-form, .ts-product-main,
 *   .ts-form-group, .product-actions, .ts-cost-calculator
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
	ProductFormAttributes,
		ProductFormVxConfig,
	PricingSummary,
		AddonValue,
	AddonPricingSummary,
	ExtendedProductFormConfig,
	VariationsValue,
	BookingValue,
	FieldAddonsRef,
	VariationPricingSummary,
	DataInputValue,
} from '../types';
import { DEFAULT_PRODUCT_FORM_ICONS, DEFAULT_BOOKING_VALUE } from '../types';
import { FieldAddons, FieldQuantity, FieldVariations, FieldBooking, FieldDataInputs } from '../fields';
import { usePricingSummary } from '../pricing';
import { useCart } from '../cart';
import { useExternalAddons } from '../hooks';
import { ExternalChoicePopup } from '../components';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';

interface ProductFormComponentProps {
	attributes: ProductFormAttributes;
	context: 'editor' | 'frontend';
	config?: ProductFormVxConfig;
	productConfig?: ExtendedProductFormConfig | null;
}

/**
 * Render icon from IconValue
 */
function renderIcon(icon: { library?: string; value?: string } | undefined, className?: string): React.ReactNode {
	if (!icon?.value) return null;

	// Line Awesome icons
	if (icon.library === 'line-awesome' || icon.value.startsWith('la-')) {
		return <i className={`las ${icon.value} ${className || ''}`} />;
	}

	// Font Awesome icons
	if (icon.library === 'fa-solid' || icon.library === 'fa-regular') {
		return <i className={`${icon.library === 'fa-solid' ? 'fas' : 'far'} fa-${icon.value} ${className || ''}`} />;
	}

	// Default to line-awesome
	return <i className={`las ${icon.value} ${className || ''}`} />;
}

/**
 * Loading state — returns null to avoid FOUC (grey box → content).
 */
function LoadingState(): React.ReactElement | null {
	return null;
}

/**
 * Out of stock / error state component
 */
function OutOfStockState({
	message,
	icon,
}: {
	message: string;
	icon?: { library?: string; value?: string };
}): React.ReactElement {
	return (
		<div className="ts-product-main">
			<div className="ts-form-group ts-no-posts">
				{renderIcon(icon)}
				<p>{message}</p>
			</div>
		</div>
	);
}

/**
 * Editor placeholder component
 *
 * Matches Voxel's Elementor editor behavior: when there's no product context,
 * Voxel renders nothing (content_template is empty, render() returns early).
 * We show a minimal loading placeholder so the block is visible/selectable.
 */
function EditorPlaceholder({ attributes }: { attributes: ProductFormAttributes }): React.ReactElement {
	return (
		<>
			{/* Re-render vxconfig for DevTools visibility (CRITICAL for Plan C+) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						blockId: attributes.blockId,
						settings: {
							showPriceCalculator: attributes.showPriceCalculator,
							showSubtotalOnly: attributes.showSubtotalOnly,
							hideCardSubheading: attributes.hideCardSubheading,
							cardSelectOnClick: attributes.cardSelectOnClick,
						},
						icons: {
							...DEFAULT_PRODUCT_FORM_ICONS,
							...attributes.icons,
						},
					}),
				}}
			/>
			{/* Shared empty placeholder control */}
			<EmptyPlaceholder />
		</>
	);
}

/**
 * Price calculator component
 */
function PriceCalculator({
	summary,
	showSubtotalOnly,
}: {
	summary: PricingSummary;
	showSubtotalOnly: boolean;
}): React.ReactElement | null {
	if (!summary.visible_items.length) {
		return null;
	}

	const itemsToShow = showSubtotalOnly
		? summary.visible_items.filter((item) => item.key === 'total')
		: summary.visible_items;

	return (
		<div className="ts-form-group tcc-container">
			<ul className="ts-cost-calculator simplify-ul flexify">
				{itemsToShow.map((item) => (
					<li key={item.key} className={item.key === 'total' ? 'ts-total' : ''}>
						<p className="ts-item-name">{item.label}</p>
						<p className="ts-item-price">{item.formatted_price}</p>
					</li>
				))}
			</ul>
		</div>
	);
}

/**
 * Main Product Form Component
 */
export default function ProductFormComponent({
	attributes,
	context,
	config,
	productConfig,
}: ProductFormComponentProps): React.ReactElement {
	// State for form values and pricing
	const [addonValues, setAddonValues] = useState<Record<string, AddonValue>>({});
	const [quantity, setQuantity] = useState<number>(1);
	const [variationsValue, setVariationsValue] = useState<VariationsValue>({
		variation_id: null,
		quantity: 1,
	});
	const [bookingValue, setBookingValue] = useState<BookingValue>(DEFAULT_BOOKING_VALUE);
	const [dataInputValues, setDataInputValues] = useState<Record<string, DataInputValue>>({});
	const [isLoading, _setIsLoading] = useState(context === 'frontend');

	/**
	 * Inject Voxel Product Form CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-product-form-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/product-form.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Cart hook for add to cart / checkout operations
	const { isProcessing, addToCart, directCheckout } = useCart({
		config: productConfig ?? null,
		addonValues,
		quantity,
		variationsValue,
		bookingValue,
		dataInputValues,
	});

	// Ref for FieldAddons to access getPricingSummary
	const fieldAddonsRef = useRef<FieldAddonsRef>(null);

	// Get quantity field config
	const quantityField = productConfig?.props?.fields?.['form-quantity'];
	const maxQuantity = quantityField?.props?.quantity ?? 999;

	// Calculate booking range length for date_range mode
	// Evidence: voxel-product-form.beautified.js lines 1118-1150
	const bookingRangeLength = useMemo(() => {
		const bookingField = productConfig?.props?.fields?.['form-booking'];
		if (!bookingField || bookingField.props?.mode !== 'date_range') {
			return 0;
		}
		if (!bookingValue.start_date || !bookingValue.end_date) {
			return 0;
		}

		const startDate = new Date(bookingValue.start_date + 'T00:00:00Z');
		const endDate = new Date(bookingValue.end_date + 'T00:00:00Z');
		const diffTime = endDate.getTime() - startDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		// For 'nights' mode, return days between (exclusive end)
		// For 'days' mode, return days + 1 (inclusive end)
		const countMode = bookingField.props?.count_mode ?? 'nights';
		return countMode === 'nights' ? diffDays : diffDays + 1;
	}, [productConfig, bookingValue.start_date, bookingValue.end_date]);

	// Get addon pricing summary via ref
	const getAddonsPricingSummary = useCallback((): AddonPricingSummary[] | null => {
		return fieldAddonsRef.current?.getPricingSummary() ?? null;
	}, []);

	// Get variation pricing summary using static method
	const getVariationsPricingSummary = useCallback((): VariationPricingSummary | null => {
		const variationsField = productConfig?.props?.fields?.['form-variations'];
		if (!variationsField) return null;
		return FieldVariations.getPricingSummary(variationsField, variationsValue);
	}, [productConfig, variationsValue]);

	// Use pricing summary hook
	const { summary: pricingSummary } = usePricingSummary({
		config: productConfig ?? null,
		quantity,
		addonValues,
		variationsValue,
		bookingValue,
		getAddonsPricingSummary,
		getVariationsPricingSummary,
	});

	// Handle addon value change
	const handleAddonValueChange = useCallback((addonKey: string, value: AddonValue) => {
		setAddonValues((prev) => ({
			...prev,
			[addonKey]: value,
		}));
	}, []);

	// Handle data input value change
	const handleDataInputValueChange = useCallback((key: string, value: DataInputValue) => {
		setDataInputValues((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	// External addons hook (for .ts-use-addition buttons outside the form)
	const {
		externalChoice,
		closeExternalChoice,
		updateExternalChoiceQuantity,
	} = useExternalAddons({
		config: productConfig ?? null,
		addonValues,
		onAddonValueChange: handleAddonValueChange,
	});

	// Merge config with attributes
	const icons = config?.icons || attributes.icons || DEFAULT_PRODUCT_FORM_ICONS;
	const settings = config?.settings || {
		showPriceCalculator: attributes.showPriceCalculator,
		showSubtotalOnly: attributes.showSubtotalOnly,
		hideCardSubheading: attributes.hideCardSubheading,
		cardSelectOnClick: attributes.cardSelectOnClick,
	};

	// Editor context - show placeholder
	if (context === 'editor') {
		return <EditorPlaceholder attributes={attributes} />;
	}

	// Frontend context - show loading while fetching product config
	if (isLoading && !productConfig) {
		return <LoadingState />;
	}

	// No product config or not purchasable
	if (!productConfig || !productConfig.is_purchasable) {
		return (
			<OutOfStockState
				message={productConfig?.out_of_stock_message || 'This product is not available'}
				icon={icons.outOfStock}
			/>
		);
	}

	// Get product mode
	const productMode = productConfig?.settings?.product_mode ?? 'regular';
	const hasAddons = !!productConfig?.props?.fields?.['form-addons'];
	const hasQuantity = !!quantityField;
	const hasVariations = !!productConfig?.props?.fields?.['form-variations'];
	const hasBooking = !!productConfig?.props?.fields?.['form-booking'];
	const hasDataInputs = !!productConfig?.props?.fields?.['form-data-inputs'];

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						blockId: attributes.blockId || config?.blockId,
						settings,
						icons,
					}),
				}}
			/>

			<div className="ts-product-main">
				{/* Addons Field */}
				{hasAddons && productConfig && (
					<FieldAddons
						ref={fieldAddonsRef}
						config={productConfig}
						values={addonValues}
						onValueChange={handleAddonValueChange}
						bookingValue={bookingValue as any}
						bookingRangeLength={bookingRangeLength}
						searchContext={productConfig.settings?.search_context}
					/>
				)}

				{/* Variations Field (for variable products) */}
				{hasVariations && productMode === 'variable' && productConfig?.props?.fields?.['form-variations'] && (
					<FieldVariations
						field={productConfig.props.fields['form-variations']}
						value={variationsValue}
						onChange={setVariationsValue}
					/>
				)}

				{/* Booking Field (for booking products) */}
				{hasBooking && productMode === 'booking' && productConfig?.props?.fields?.['form-booking'] && (
					<FieldBooking
						field={productConfig.props.fields['form-booking']}
						value={bookingValue}
						onChange={setBookingValue}
						config={productConfig}
						initialAvailability={productConfig.settings?.search_context?.availability}
					/>
				)}

				{/* Quantity Field (for regular products) */}
				{/* Evidence: form-quantity-field.php:53 - sold_individually hides quantity selector */}
				{hasQuantity && productMode === 'regular' && !(quantityField as any)?.props?.sold_individually && (
					<FieldQuantity
						maxQuantity={maxQuantity}
						value={quantity}
						onChange={setQuantity}
						label={productConfig?.l10n?.quantity ?? 'Quantity'}
					/>
				)}

				{/* Data Inputs Field */}
				{hasDataInputs && productConfig?.props?.fields?.['form-data-inputs'] && (
					<FieldDataInputs
						field={productConfig.props.fields['form-data-inputs']}
						values={dataInputValues}
						onValueChange={handleDataInputValueChange}
						icons={icons as any}
					/>
				)}

				{/* Action buttons */}
				<div className="ts-form-group product-actions">
					{productConfig.cart.enabled ? (
						<a
							href="#"
							className={`ts-btn form-btn ts-btn-2 ${isProcessing ? 'ts-loading-btn' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								if (!isProcessing) {
									addToCart();
								}
							}}
						>
							{isProcessing ? (
								<span className="ts-loader"></span>
							) : (
								<>
									{renderIcon(icons.addToCart)}
									<span>Add to cart</span>
								</>
							)}
						</a>
					) : (
						<a
							href="#"
							className={`ts-btn form-btn ts-btn-2 ${isProcessing ? 'ts-loading-btn' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								if (!isProcessing) {
									directCheckout();
								}
							}}
						>
							{isProcessing ? (
								<span className="ts-loader"></span>
							) : (
								<>
									{renderIcon(icons.checkout)}
									<span>Continue</span>
								</>
							)}
						</a>
					)}
				</div>

				{/* Price calculator */}
				{settings.showPriceCalculator === 'show' && (
					<PriceCalculator
						summary={pricingSummary}
						showSubtotalOnly={settings.showSubtotalOnly}
					/>
				)}
			</div>

			{/* External choice popup for quantity selection */}
			<ExternalChoicePopup
				active={externalChoice.active}
				element={externalChoice.element}
				choice={externalChoice.choice}
				onClose={closeExternalChoice}
				onConfirm={updateExternalChoiceQuantity}
				icons={icons as any}
			/>
		</>
	);
}
