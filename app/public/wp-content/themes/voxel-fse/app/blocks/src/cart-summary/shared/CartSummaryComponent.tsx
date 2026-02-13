/**
 * Cart Summary Block - Shared Component
 *
 * Renders the cart summary UI for both editor and frontend.
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary.php
 * - Cart Item: themes/voxel/templates/widgets/cart-summary/cart-item.php
 *
 * @package VoxelFSE
 */

import { useMemo, useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import { VoxelIcons } from '@shared/utils/voxelIcons';
import QuickRegister from './QuickRegister';
import ShippingDetails from './ShippingDetails';
import ShippingMethodCards from './ShippingMethodCards';
import VendorShippingCards from './VendorShippingCards';
import FileUploadField from './FileUploadField';
import type {
	CartSummaryComponentProps,
	CartItem,
	CartSummaryVxConfig,
	Vendor,
} from '../types';
import { getCartIcon, hasIconValue } from './iconDefaults';

/**
 * Currency format helper
 */
function currencyFormat(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency || 'USD',
		}).format(amount / 100);
	} catch {
		return `${(amount / 100).toFixed(2)} ${currency}`;
	}
}

/**
 * Get quantity from cart item
 */
function getItemQuantity(item: CartItem): number {
	if (item.product_mode === 'regular') {
		const value = item.value as Record<string, Record<string, number>>;
		return value.stock?.quantity || 1;
	} else {
		const value = item.value as Record<string, Record<string, number>>;
		return value.variations?.quantity || 1;
	}
}

/**
 * Check if item has stock left for incrementing
 */
function hasStockLeft(item: CartItem): boolean {
	const qty = getItemQuantity(item);
	return item.quantity.max === 0 || qty < item.quantity.max;
}

/**
 * Cart Item Component
 * Matches themes/voxel/templates/widgets/cart-summary/cart-item.php
 */
interface CartItemRowProps {
	item: CartItem;
	attributes: CartSummaryComponentProps['attributes'];
	onUpdateQuantity?: (itemKey: string, quantity: number) => void;
	onRemoveItem?: (itemKey: string) => void;
	context: 'editor' | 'frontend';
}

function CartItemRow({
	item,
	attributes,
	onUpdateQuantity,
	onRemoveItem,
	context,
}: CartItemRowProps) {
	const quantity = getItemQuantity(item);
	const stockLeft = hasStockLeft(item);

	const handleMinusOne = () => {
		if (quantity > 1 && onUpdateQuantity) {
			onUpdateQuantity(item.key, quantity - 1);
		} else if (onRemoveItem) {
			onRemoveItem(item.key);
		}
	};

	const handlePlusOne = () => {
		if (stockLeft && onUpdateQuantity) {
			onUpdateQuantity(item.key, quantity + 1);
		}
	};

	const handleRemove = () => {
		if (onRemoveItem) {
			onRemoveItem(item.key);
		}
	};

	return (
		<li className={`${item._disabled ? 'vx-disabled' : ''} ${item.custom_class || ''}`}>
			<div
				className="cart-image"
				dangerouslySetInnerHTML={{ __html: item.logo }}
			/>
			<div className="cart-item-details">
				<a href={item.link}>{item.title}</a>
				{item.subtitle && <span>{item.subtitle}</span>}
				{item.pricing.total_amount === 0 ? (
					<span>{__('Free', 'voxel-fse')}</span>
				) : (
					<span>{currencyFormat(item.pricing.total_amount, item.currency)}</span>
				)}
			</div>
			{item.quantity.enabled ? (
				<div className="cart-stepper">
					<a
						href="#"
						className="ts-icon-btn ts-smaller"
						onClick={(e) => {
							e.preventDefault();
							if (context === 'frontend') handleMinusOne();
						}}
					>
						{renderIcon(getCartIcon(attributes.minusIcon, 'minusIcon'))}
					</a>
					<span>{quantity}</span>
					<a
						href="#"
						className={`ts-icon-btn ts-smaller ${!stockLeft ? 'vx-disabled' : ''}`}
						onClick={(e) => {
							e.preventDefault();
							if (context === 'frontend') handlePlusOne();
						}}
					>
						{renderIcon(getCartIcon(attributes.plusIcon, 'plusIcon'))}
					</a>
				</div>
			) : (
				<div className="cart-stepper">
					<a
						href="#"
						className="ts-icon-btn ts-smaller"
						onClick={(e) => {
							e.preventDefault();
							if (context === 'frontend') handleRemove();
						}}
					>
						{renderIcon(getCartIcon(attributes.deleteIcon, 'deleteIcon'))}
					</a>
				</div>
			)}
		</li>
	);
}

/**
 * Order Notes Component
 */
interface OrderNotesProps {
	enabled: boolean;
	content: string;
	onToggle: () => void;
	onChange: (content: string) => void;
	context: 'editor' | 'frontend';
}

function OrderNotes({ enabled, content, onToggle, onChange, context }: OrderNotesProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	const resizeComposer = () => {
		if (textareaRef.current && hiddenTextareaRef.current) {
			hiddenTextareaRef.current.value = textareaRef.current.value;
			textareaRef.current.style.height = `${hiddenTextareaRef.current.scrollHeight}px`;
		}
	};

	useEffect(() => {
		if (enabled) {
			resizeComposer();
			textareaRef.current?.focus();
		}
	}, [enabled, content]);

	return (
		<>
			{/* Toggle checkbox */}
			<div className="tos-checkbox ts-form-group vx-1-1 switcher-label">
				<label
					onClick={(e) => {
						e.preventDefault();
						if (context === 'frontend') onToggle();
					}}
				>
					<div className="ts-checkbox-container">
						<label className="container-checkbox">
							<input
								type="checkbox"
								tabIndex={0}
								className="hidden"
								checked={enabled}
								readOnly
							/>
							<span className="checkmark"></span>
						</label>
					</div>
					{__('Add order notes?', 'voxel-fse')}
				</label>
			</div>

			{/* Textarea */}
			{enabled && (
				<div className="ts-form-group vx-1-1">
					<textarea
						ref={textareaRef}
						value={content}
						onChange={(e) => {
							onChange(e.target.value);
							resizeComposer();
						}}
						placeholder={__('Add notes about your order', 'voxel-fse')}
						className="autofocus ts-filter"
					/>
					{/* Hidden textarea for height calculation */}
					<textarea
						ref={hiddenTextareaRef}
						disabled
						style={{
							height: '5px',
							position: 'fixed',
							top: '-9999px',
							left: '-9999px',
							visibility: 'hidden',
						}}
					/>
				</div>
			)}
		</>
	);
}

/**
 * Main Cart Summary Component
 */
export default function CartSummaryComponent({
	attributes,
	config,
	items,
	context,
	isLoading,
	error,
	onUpdateQuantity,
	onRemoveItem,
	onCheckout,
	shipping,
	onShippingChange,
	quickRegister,
	onQuickRegisterChange,
	orderNotes,
	onOrderNotesChange,
}: CartSummaryComponentProps) {
	// Build vxconfig for re-rendering (Plan C+ pattern)
	const vxConfig = useMemo<CartSummaryVxConfig>(() => {
		return {
			icons: {
				deleteIcon: getCartIcon(attributes.deleteIcon, 'deleteIcon'),
				noProductsIcon: getCartIcon(attributes.noProductsIcon, 'noProductsIcon'),
				loginIcon: getCartIcon(attributes.loginIcon, 'loginIcon'),
				emailIcon: getCartIcon(attributes.emailIcon, 'emailIcon'),
				userIcon: getCartIcon(attributes.userIcon, 'userIcon'),
				uploadIcon: getCartIcon(attributes.uploadIcon, 'uploadIcon'),
				shippingIcon: getCartIcon(attributes.shippingIcon, 'shippingIcon'),
				minusIcon: getCartIcon(attributes.minusIcon, 'minusIcon'),
				plusIcon: getCartIcon(attributes.plusIcon, 'plusIcon'),
				checkoutIcon: getCartIcon(attributes.checkoutIcon, 'checkoutIcon'),
				continueIcon: getCartIcon(attributes.continueIcon, 'continueIcon'),
			},
			sectionSpacing: attributes.sectionSpacing || undefined,
			titleColor: attributes.titleColor || undefined,
		};
	}, [attributes]);

	/**
	 * Inject Voxel Product Summary CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-product-summary-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/product-summary.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Group items by vendor for multivendor display
	const vendors = useMemo<Record<string, Vendor>>(() => {
		if (!items) return {};

		const vendorMap: Record<string, Vendor> = {};

		Object.values(items).forEach((item) => {
			const vendorId = item.vendor?.id;
			const vendorKey = vendorId ? `vendor_${vendorId}` : 'platform';

			if (!vendorMap[vendorKey]) {
				vendorMap[vendorKey] = {
					id: vendorId || null,
					display_name: item.vendor?.display_name || __('Platform', 'voxel-fse'),
					vendor_key: vendorKey,
					key: vendorKey,
					items: {},
					has_shippable_products: false,
					shipping_zones: item.vendor?.shipping_zones || null,
					shipping_countries: item.vendor?.shipping_countries || null,
				};
			}

			vendorMap[vendorKey].items[item.key] = item;
			if (item.shipping.is_shippable) {
				vendorMap[vendorKey].has_shippable_products = true;
			}
		});

		return vendorMap;
	}, [items]);

	// Check if should group by vendor
	// Matches Voxel's shouldGroupItemsByVendor() method
	const shouldGroupByVendor = useMemo(() => {
		if (!config?.multivendor.enabled) return false;
		const vendorCount = Object.keys(vendors).length;
		if (vendorCount < 1) return false;
		// If only one vendor and it's platform, don't group
		if (vendorCount === 1 && vendors.platform) return false;
		return true;
	}, [config, vendors]);

	/**
	 * Get shipping method
	 * Evidence: docs/block-conversions/cart-summary/product-summary-beautified.js:7
	 * Voxel checks: multivendor.enabled, responsibility === 'vendor', vendor count, platform key
	 */
	const getShippingMethod = (): 'platform_rates' | 'vendor_rates' | null => {
		if (!config?.multivendor.enabled) return 'platform_rates';
		if (config.shipping.responsibility !== 'vendor') return 'platform_rates';

		// Check vendor count - if only 1 vendor and it's 'platform', use platform_rates
		const vendorKeys = Object.keys(vendors);
		const vendorCount = vendorKeys.length;
		if (vendorCount === 1 && vendors['platform']) {
			return 'platform_rates';
		}

		// If at least one vendor, use vendor_rates
		return vendorCount >= 1 ? 'vendor_rates' : null;
	};

	/**
	 * Merge shipping countries from platform and vendors
	 * Matches Voxel's shippingCountries computed property
	 */
	const shippingCountries = useMemo(() => {
		const countries = { ...config?.shipping.countries };

		// For vendor shipping, merge in vendor-specific countries
		if (getShippingMethod() === 'vendor_rates') {
			Object.values(vendors).forEach((vendor) => {
				if (vendor.shipping_countries) {
					Object.entries(vendor.shipping_countries).forEach(([code, data]) => {
						if (!countries[code]) {
							countries[code] = data;
						}
					});
				}
			});
		}

		return countries;
	}, [config?.shipping.countries, vendors]);

	// Check if cart has shippable products
	const hasShippableProducts = useMemo(() => {
		if (!items) return false;
		return Object.values(items).some((item) => item.shipping.is_shippable);
	}, [items]);

	// Calculate subtotal
	const subtotal = useMemo(() => {
		if (!items) return 0;
		let total = 0;
		Object.values(items).forEach((item) => {
			total += item.pricing.total_amount;
		});
		return total;
	}, [items]);

	/**
	 * Check if vendor shipping is fully selected
	 * Matches Voxel's isVendorShippingSelected for all vendors
	 */
	const isAllVendorShippingSelected = useMemo(() => {
		if (getShippingMethod() !== 'vendor_rates') return true;
		if (!shipping.country) return false;

		const vendorsWithShippable = Object.values(vendors).filter(
			(v) => v.has_shippable_products
		);

		for (const vendor of vendorsWithShippable) {
			const selection = shipping.vendors[vendor.key];
			if (!selection?.zone || !selection?.rate) return false;
		}

		return true;
	}, [vendors, shipping]);

	// Calculate shipping total
	const shippingTotal = useMemo(() => {
		if (!shipping || !config) return null;

		if (getShippingMethod() === 'platform_rates') {
			if (!shipping.zone || !shipping.rate) return null;
			// Find the rate in config and calculate
			const zone = config.shipping.zones[shipping.zone];
			if (!zone || !zone.rates[shipping.rate]) return null;
			// For now simplified - return 0 for free shipping
			const rate = zone.rates[shipping.rate];
			if (rate.type === 'free_shipping') return 0;
			return rate.amount_per_unit || 0;
		} else {
			// Vendor rates - sum all vendor shipping totals
			if (!isAllVendorShippingSelected) return null;
			let total = 0;
			Object.values(vendors).forEach((vendor) => {
				if (!vendor.has_shippable_products) return;
				const selection = shipping.vendors[vendor.key];
				if (!selection || !vendor.shipping_zones) return;
				const zone = vendor.shipping_zones[selection.zone];
				if (!zone || !zone.rates[selection.rate]) return;
				const rate = zone.rates[selection.rate];
				if (rate.type === 'free_shipping') return;
				total += rate.amount_per_unit || 0;
			});
			return total;
		}
	}, [shipping, config, vendors, isAllVendorShippingSelected]);

	// Has items check
	const hasItems = items && Object.keys(items).length > 0;
	const currency = config?.currency || 'USD';
	const isLoggedIn = config?.is_logged_in || false;

	// Guest checkout behavior
	const guestBehavior = config?.guest_customers.behavior || 'redirect_to_login';
	const showQuickRegister = !isLoggedIn && guestBehavior === 'proceed_with_email';
	const requireVerification = config?.guest_customers.proceed_with_email?.require_verification || false;
	const requireTos = config?.guest_customers.proceed_with_email?.require_tos || false;

	// Check if can proceed with payment
	const canProceedWithPayment = useMemo(() => {
		if (!hasItems) return false;
		if (!isLoggedIn && guestBehavior === 'proceed_with_email') {
			// Must have valid email
			if (!quickRegister?.email || !/^\S+@\S+\.\S+$/.test(quickRegister.email)) {
				return false;
			}
			// Must have verification code if required
			if (requireVerification && !quickRegister.registered && (!quickRegister.sent_code || !quickRegister.code)) {
				return false;
			}
			// Must accept terms if required
			if (requireTos && !quickRegister.terms_agreed) {
				return false;
			}
		}
		// Check shipping if required
		if (hasShippableProducts && shipping) {
			if (!shipping.country) return false;
			const shippingMethod = getShippingMethod();
			// Platform shipping - need zone and rate
			if (shippingMethod === 'platform_rates' && (!shipping.zone || !shipping.rate)) {
				return false;
			}
			// Vendor shipping - need all vendors to have zone and rate selected
			if (shippingMethod === 'vendor_rates' && !isAllVendorShippingSelected) {
				return false;
			}
		}
		return true;
	}, [hasItems, isLoggedIn, guestBehavior, quickRegister, requireVerification, requireTos, hasShippableProducts, shipping, config, isAllVendorShippingSelected]);

	// Check if offline payment
	const isOfflinePayment = useMemo(() => {
		if (!items) return false;
		return Object.values(items).every((item) => item.payment_method === 'offline_payment');
	}, [items]);

	// Loading state
	if (isLoading) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="vx-loading-screen ts-checkout-loading">
					<div className="ts-no-posts">
						<span className="ts-loader"></span>
					</div>
				</div>
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-no-posts">
					<p>{error}</p>
				</div>
			</>
		);
	}

	// Editor preview and empty cart both show the same empty state placeholder
	// matching Voxel's behavior when no products are selected for checkout
	if (context === 'editor' || !hasItems) {
		const noProductsIconValue = hasIconValue(attributes.noProductsIcon)
			? attributes.noProductsIcon
			: null;
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-form ts-checkout ts-checkout-regular">
					<div className="vx-loading-screen">
						<div className="ts-form-group ts-no-posts">
							{noProductsIconValue
								? renderIcon(noProductsIconValue)
								: VoxelIcons.boxRemove
							}
							<p>{__('No products selected for checkout', 'voxel-fse')}</p>
						</div>
					</div>
				</div>
			</>
		);
	}

	// Main cart view
	return (
		<>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			<div className="ts-form ts-checkout ts-checkout-regular">
				{/* Quick Register for guests */}
				{showQuickRegister && quickRegister && onQuickRegisterChange && config && (
					<QuickRegister
						config={config}
						quickRegister={quickRegister}
						onQuickRegisterChange={onQuickRegisterChange}
						authLink={config.auth_link}
						requireVerification={requireVerification}
						loginIcon={getCartIcon(attributes.loginIcon, 'loginIcon')}
						emailIcon={getCartIcon(attributes.emailIcon, 'emailIcon')}
						context={context}
					/>
				)}

				{/* Cart Head - Only show if logged in or not quick register mode */}
				{(isLoggedIn || guestBehavior !== 'proceed_with_email') && (
					<div className="ts-cart-head">
						<h1>{__('Order summary', 'voxel-fse')}</h1>
					</div>
				)}

				{/* Cart Items Section */}
				<div className="checkout-section form-field-grid">
					{shouldGroupByVendor ? (
						// Grouped by vendor
						Object.values(vendors).map((vendor) => (
							<div key={vendor.key}>
								<div className="ts-form-group">
									<div className="or-group">
										<div className="or-line"></div>
										<span className="or-text">
											{__('Sold by', 'voxel-fse')} {vendor.display_name}
										</span>
										<div className="or-line"></div>
									</div>
								</div>
								<div className="ts-form-group">
									<ul className="ts-cart-list simplify-ul">
										{Object.values(vendor.items).map((item) => (
											<CartItemRow
												key={item.key}
												item={item}
												attributes={attributes}
												onUpdateQuantity={onUpdateQuantity}
												onRemoveItem={onRemoveItem}
												context={context}
											/>
										))}
									</ul>
								</div>
							</div>
						))
					) : (
						// Not grouped
						<>
							<div className="ts-form-group">
								<div className="or-group">
									<div className="or-line"></div>
									<span className="or-text">{__('Items', 'voxel-fse')}</span>
									<div className="or-line"></div>
								</div>
							</div>
							<div className="ts-form-group">
								<ul className="ts-cart-list simplify-ul">
									{Object.values(items).map((item) => (
										<CartItemRow
											key={item.key}
											item={item}
											attributes={attributes}
											onUpdateQuantity={onUpdateQuantity}
											onRemoveItem={onRemoveItem}
											context={context}
										/>
									))}
								</ul>
							</div>
						</>
					)}
				</div>

				{/* Shipping Details */}
				{hasShippableProducts && shipping && onShippingChange && config && (
					<>
						<ShippingDetails
							shipping={shipping}
							onShippingChange={onShippingChange}
							countries={shippingCountries}
							context={context}
						/>

						{/* Shipping Method Cards - Platform or Vendor */}
						{shipping.status === 'completed' && shipping.country && (
							<>
								{/* Platform shipping rates */}
								{getShippingMethod() === 'platform_rates' && (
									<ShippingMethodCards
										config={config}
										shipping={shipping}
										onShippingChange={onShippingChange}
										items={items}
										shippingIcon={getCartIcon(attributes.shippingIcon, 'shippingIcon')}
										currency={currency}
										l10n={config.l10n}
										context={context}
									/>
								)}

								{/* Vendor shipping rates */}
								{getShippingMethod() === 'vendor_rates' && (
									<VendorShippingCards
										config={config}
										shipping={shipping}
										onShippingChange={onShippingChange}
										items={items}
										vendors={vendors}
										shippingIcon={getCartIcon(attributes.shippingIcon, 'shippingIcon')}
										currency={currency}
										l10n={config.l10n}
										context={context}
									/>
								)}
							</>
						)}
					</>
				)}

				{/* Details Section - Order notes, Terms */}
				{(isLoggedIn || guestBehavior === 'proceed_with_email') && (
					<div className="checkout-section form-field-grid">
						<div className="ts-form-group">
							<div className="or-group">
								<div className="or-line"></div>
								<span className="or-text">{__('Details', 'voxel-fse')}</span>
								<div className="or-line"></div>
							</div>
						</div>

						{/* Dynamic Cart Item Components */}
						{/* Matches Voxel: cart-summary.php:95-113 (suspense > item.components) */}
						{items && Object.values(items).map((item) =>
							item.components && Object.entries(item.components).map(([compKey, component]) => {
								const compData = (component as Record<string, unknown>).data as Record<string, unknown> | undefined;
								if (component.type === 'file-upload' && compData) {
									return (
										<FileUploadField
											key={`${item.key}-${compKey}`}
											field={(compData.field as { key: string; label?: string; allowed_types?: string; max_files?: number }) || { key: compKey }}
											value={(compData.value as []) || []}
											onChange={() => {}}
											uploadIcon={getCartIcon(attributes.uploadIcon, 'uploadIcon')}
											trashIcon={getCartIcon(attributes.deleteIcon, 'deleteIcon')}
											context={context}
										/>
									);
								}
								return null;
							})
						)}

						{/* Order Notes */}
						{orderNotes && onOrderNotesChange && (
							<OrderNotes
								enabled={orderNotes.enabled}
								content={orderNotes.content}
								onToggle={() => onOrderNotesChange({ enabled: !orderNotes.enabled })}
								onChange={(content) => onOrderNotesChange({ content })}
								context={context}
							/>
						)}

						{/* Terms & Conditions checkbox for guests */}
						{!isLoggedIn && guestBehavior === 'proceed_with_email' && requireTos && quickRegister && onQuickRegisterChange && (
							<div className="tos-checkbox ts-form-group vx-1-1 switcher-label">
								<label
									onClick={(e) => {
										e.preventDefault();
										if (context === 'frontend') {
											onQuickRegisterChange({ terms_agreed: !quickRegister.terms_agreed });
										}
									}}
								>
									<div className="ts-checkbox-container">
										<label className="container-checkbox">
											<input
												type="checkbox"
												tabIndex={0}
												className="hidden"
												checked={quickRegister.terms_agreed}
												readOnly
											/>
											<span className="checkmark"></span>
										</label>
									</div>
									<p className="field-info">
										{__('I agree to the Terms and Conditions and Privacy Policy', 'voxel-fse')}
									</p>
								</label>
							</div>
						)}
					</div>
				)}

				{/* Checkout Section */}
				<div className="checkout-section">
					{subtotal !== 0 && (
						<ul className="ts-cost-calculator simplify-ul flexify">
							{shippingTotal !== null && (
								<li>
									<div className="ts-item-name">
										<p>{__('Shipping', 'voxel-fse')}</p>
									</div>
									<div className="ts-item-price">
										<p>{currencyFormat(shippingTotal, currency)}</p>
									</div>
								</li>
							)}
							<li className="ts-total">
								<div className="ts-item-name">
									<p>{__('Subtotal', 'voxel-fse')}</p>
								</div>
								<div className="ts-item-price">
									<p>{currencyFormat(subtotal + (shippingTotal || 0), currency)}</p>
								</div>
							</li>
						</ul>
					)}

					{/* Checkout Button */}
					{(isLoggedIn || guestBehavior === 'proceed_with_email') ? (
						<a
							href="#"
							className={`ts-btn ts-btn-2 form-btn ${!canProceedWithPayment ? 'vx-disabled' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								if (context === 'frontend' && canProceedWithPayment && onCheckout) {
									onCheckout();
								}
							}}
						>
							{subtotal === 0 || isOfflinePayment ? (
								<>
									{__('Submit order', 'voxel-fse')}
									{renderIcon(getCartIcon(attributes.continueIcon, 'continueIcon'))}
								</>
							) : (
								<>
									{__('Proceed to payment', 'voxel-fse')}
									{renderIcon(getCartIcon(attributes.checkoutIcon, 'checkoutIcon'))}
								</>
							)}
						</a>
					) : (
						// Login button for guests when quick register is not enabled
						<a href={config?.auth_link || '#'} className="ts-btn ts-btn-2 form-btn">
							{renderIcon(getCartIcon(attributes.userIcon, 'userIcon'))}
							{__('Log in to continue', 'voxel-fse')}
						</a>
					)}
				</div>
			</div>
		</>
	);
}
