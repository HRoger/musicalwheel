/**
 * Cart Summary Block - Shared Component
 *
 * Renders the cart summary UI for both editor and frontend.
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * @package VoxelFSE
 */

import { useMemo, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import type {
	CartSummaryComponentProps,
	CartItem,
	CartSummaryVxConfig,
} from '../types';
import type { IconValue } from '@shared/controls/IconPickerControl';

// Default icon values
const defaultIcons: Record<string, IconValue> = {
	deleteIcon: { library: 'line-awesome', value: 'las la-trash-alt' },
	noProductsIcon: { library: 'line-awesome', value: 'las la-box' },
	loginIcon: { library: 'line-awesome', value: 'las la-sign-in-alt' },
	emailIcon: { library: 'line-awesome', value: 'las la-envelope' },
	userIcon: { library: 'line-awesome', value: 'las la-user' },
	uploadIcon: { library: 'line-awesome', value: 'las la-cloud-upload-alt' },
	shippingIcon: { library: 'line-awesome', value: 'las la-shipping-fast' },
	minusIcon: { library: 'line-awesome', value: 'las la-minus' },
	plusIcon: { library: 'line-awesome', value: 'las la-plus' },
	checkoutIcon: { library: 'line-awesome', value: 'las la-arrow-right' },
	continueIcon: { library: 'line-awesome', value: 'las la-arrow-right' },
};

/**
 * Get icon value with fallback
 */
function getIcon(attrValue: IconValue | undefined, key: string): IconValue {
	if (attrValue && typeof attrValue === 'object' && 'library' in attrValue) {
		return attrValue;
	}
	return defaultIcons[key] || { library: 'line-awesome', value: 'las la-question' };
}

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
 * Cart Item Component
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
	const quantity =
		item.product_mode === 'regular'
			? (item.value as Record<string, Record<string, number>>).stock?.quantity
			: (item.value as Record<string, Record<string, number>>).variations?.quantity;

	const handleMinusOne = () => {
		if (quantity !== undefined && quantity > 1 && onUpdateQuantity) {
			onUpdateQuantity(item.key, quantity - 1);
		} else if (onRemoveItem) {
			onRemoveItem(item.key);
		}
	};

	const handlePlusOne = () => {
		if (quantity !== undefined && onUpdateQuantity) {
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
						{renderIcon(getIcon(attributes.minusIcon, 'minusIcon'))}
					</a>
					<span>{quantity}</span>
					<a
						href="#"
						className="ts-icon-btn ts-smaller"
						onClick={(e) => {
							e.preventDefault();
							if (context === 'frontend') handlePlusOne();
						}}
					>
						{renderIcon(getIcon(attributes.plusIcon, 'plusIcon'))}
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
						{renderIcon(getIcon(attributes.deleteIcon, 'deleteIcon'))}
					</a>
				</div>
			)}
		</li>
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
}: CartSummaryComponentProps) {
	// Build vxconfig for re-rendering (Plan C+ pattern)
	const vxConfig = useMemo<CartSummaryVxConfig>(() => {
		return {
			icons: {
				deleteIcon: getIcon(attributes.deleteIcon, 'deleteIcon'),
				noProductsIcon: getIcon(attributes.noProductsIcon, 'noProductsIcon'),
				loginIcon: getIcon(attributes.loginIcon, 'loginIcon'),
				emailIcon: getIcon(attributes.emailIcon, 'emailIcon'),
				userIcon: getIcon(attributes.userIcon, 'userIcon'),
				uploadIcon: getIcon(attributes.uploadIcon, 'uploadIcon'),
				shippingIcon: getIcon(attributes.shippingIcon, 'shippingIcon'),
				minusIcon: getIcon(attributes.minusIcon, 'minusIcon'),
				plusIcon: getIcon(attributes.plusIcon, 'plusIcon'),
				checkoutIcon: getIcon(attributes.checkoutIcon, 'checkoutIcon'),
				continueIcon: getIcon(attributes.continueIcon, 'continueIcon'),
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

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/product-summary.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Calculate subtotal
	const subtotal = useMemo(() => {
		if (!items) return 0;
		let total = 0;
		Object.values(items).forEach((item) => {
			total += item.pricing.total_amount;
		});
		return total;
	}, [items]);

	// Has items check
	const hasItems = items && Object.keys(items).length > 0;
	const currency = config?.currency || 'USD';

	// Loading state
	if (isLoading) {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
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
				{/* Re-render vxconfig for DevTools visibility */}
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

	// Editor preview mode - show placeholder
	if (context === 'editor') {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-form ts-checkout ts-checkout-regular">
					{/* Cart Head */}
					<div className="ts-cart-head">
						<h3>{__('Your Cart', 'voxel-fse')}</h3>
					</div>

					{/* Sample Cart Items */}
					<div className="checkout-section form-field-grid">
						<ul className="simplify-ul ts-cart-list">
							<li>
								<div
									className="cart-image"
									style={{
										width: '60px',
										height: '60px',
										backgroundColor: '#e0e0e0',
										borderRadius: '8px',
									}}
								></div>
								<div className="cart-item-details">
									<a href="#">{__('Sample Product', 'voxel-fse')}</a>
									<span>{__('Product description', 'voxel-fse')}</span>
									<span>$99.00</span>
								</div>
								<div className="cart-stepper">
									<a href="#" className="ts-icon-btn ts-smaller">
										{renderIcon(getIcon(attributes.minusIcon, 'minusIcon'))}
									</a>
									<span>1</span>
									<a href="#" className="ts-icon-btn ts-smaller">
										{renderIcon(getIcon(attributes.plusIcon, 'plusIcon'))}
									</a>
								</div>
							</li>
						</ul>
					</div>

					{/* Cost Calculator */}
					<div className="ts-cost-calculator">
						<ul className="simplify-ul flexify">
							<li className="cost-total">
								<span>{__('Total', 'voxel-fse')}</span>
								<span>$99.00</span>
							</li>
						</ul>
					</div>

					{/* Checkout Button */}
					<button type="button" className="ts-btn ts-btn-2 form-btn">
						{renderIcon(getIcon(attributes.checkoutIcon, 'checkoutIcon'))}
						{__('Proceed to checkout', 'voxel-fse')}
					</button>
				</div>
			</>
		);
	}

	// Empty cart state
	if (!hasItems) {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-form ts-checkout ts-checkout-regular">
					<div className="ts-no-posts">
						{renderIcon(getIcon(attributes.noProductsIcon, 'noProductsIcon'))}
						<p>{__('Your cart is empty', 'voxel-fse')}</p>
					</div>
				</div>
			</>
		);
	}

	// Main cart view
	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			<div className="ts-form ts-checkout ts-checkout-regular">
				{/* Cart Head */}
				<div className="ts-cart-head">
					<h3>{__('Your Cart', 'voxel-fse')}</h3>
				</div>

				{/* Cart Items */}
				<div className="checkout-section form-field-grid">
					<ul className="simplify-ul ts-cart-list">
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

				{/* TODO: Shipping details section - implement when shipping state is provided */}

				{/* Cost Calculator */}
				<div className="ts-cost-calculator">
					<ul className="simplify-ul flexify">
						<li className="cost-total">
							<span>{__('Total', 'voxel-fse')}</span>
							<span>{currencyFormat(subtotal, currency)}</span>
						</li>
					</ul>
				</div>

				{/* Checkout Button */}
				<button
					type="button"
					className="ts-btn ts-btn-2 form-btn"
					onClick={() => {
						if (onCheckout) onCheckout();
					}}
				>
					{renderIcon(getIcon(attributes.checkoutIcon, 'checkoutIcon'))}
					{__('Proceed to checkout', 'voxel-fse')}
				</button>
			</div>
		</>
	);
}
