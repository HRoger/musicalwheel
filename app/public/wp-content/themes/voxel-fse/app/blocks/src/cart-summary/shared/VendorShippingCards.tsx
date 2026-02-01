/**
 * VendorShippingCards Component - Vendor-Specific Shipping Rate Selection
 *
 * Matches Voxel's shipping-details.php template 1:1 (lines 155-226)
 * for vendor_rates shipping method.
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/shipping-details.php
 * - JS: themes/voxel/assets/dist/product-summary.js (vendor shipping methods)
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import type { IconValue } from '@shared/controls/IconPickerControl';
import type {
	ShippingState,
	ShippingZone,
	ShippingRate,
	CartItem,
	Vendor,
	CartConfig,
} from '../types';

interface VendorShippingCardsProps {
	config: CartConfig;
	shipping: ShippingState;
	onShippingChange: (changes: Partial<ShippingState>) => void;
	items: Record<string, CartItem>;
	vendors: Record<string, Vendor>;
	shippingIcon: IconValue;
	currency: string;
	l10n: { free: string };
	context: 'editor' | 'frontend';
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
 * Get item quantity helper
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
 * Match ZIP code against patterns (wildcards and ranges)
 * Matches Voxel's matchesZipCode() method
 */
function matchesZipCode(zip: string, patterns: string): boolean {
	const normalizedZip = zip.toLowerCase().replace(/\s/g, '');
	const patternList = patterns.split('\n').map((p) => p.trim());

	for (const pattern of patternList) {
		if (!pattern) continue;
		const normalizedPattern = pattern.toLowerCase().replace(/\s/g, '');

		// Check for range (e.g., "10000...20000")
		if (normalizedPattern.includes('...')) {
			const [start, end] = normalizedPattern.split('...');
			if (normalizedZip >= start && normalizedZip <= end) {
				return true;
			}
		}
		// Check for wildcard (e.g., "100*")
		else if (normalizedPattern.includes('*')) {
			const regex = new RegExp(
				'^' + normalizedPattern.replace(/\*/g, '.*') + '$'
			);
			if (regex.test(normalizedZip)) {
				return true;
			}
		}
		// Exact match
		else if (normalizedZip === normalizedPattern) {
			return true;
		}
	}

	return false;
}

/**
 * Check if a vendor rate should be listed based on region/state/ZIP matching
 * Matches Voxel's shouldListVendorShippingRate() method
 */
function shouldListVendorShippingRate(
	shipping: ShippingState,
	zone: ShippingZone
): boolean {
	// Zone must serve selected country
	if (!zone.countries[shipping.country || '']) {
		return false;
	}

	// Check regions if they exist
	if (zone.regions && Array.isArray(zone.regions) && zone.regions.length > 0) {
		const region = zone.regions.find((r) => r.country === shipping.country);
		if (!region) {
			return false;
		}

		// Check state if required
		if (region.states && Array.isArray(region.states) && region.states.length > 0) {
			if (!shipping.state || !region.states.includes(shipping.state)) {
				return false;
			}
		}

		// Check ZIP code patterns if enabled
		if (region.zip_codes_enabled && region.zip_codes && region.zip_codes.trim()) {
			if (!shipping.zip || !matchesZipCode(shipping.zip, region.zip_codes)) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Calculate vendor-specific order total
 */
function getVendorOrderTotal(vendor: Vendor, items: Record<string, CartItem>): number {
	let total = 0;
	Object.values(items).forEach((item) => {
		if (item.vendor.id === vendor.id) {
			total += item.pricing.total_amount;
		}
	});
	return total;
}

/**
 * Check if a rate meets criteria (minimum order amount for free shipping)
 * Matches Voxel's vendorRateMeetsCriteria() method
 */
function vendorRateMeetsCriteria(
	vendor: Vendor,
	rate: ShippingRate,
	items: Record<string, CartItem>
): boolean {
	// Fixed rate always meets criteria
	if (rate.type !== 'free_shipping') {
		return rate.type === 'fixed_rate' || rate.type === 'flat_rate';
	}

	// Free shipping with no requirements always meets criteria
	if (rate.requirements !== 'minimum_order_amount') {
		return true;
	}

	// Calculate vendor-specific order total
	const vendorTotal = getVendorOrderTotal(vendor, items);

	// Check if total meets minimum
	return vendorTotal >= (rate.minimum_order_amount || 0);
}

/**
 * Calculate shipping total for a vendor-specific rate
 * Matches Voxel's getVendorShippingTotalForRate() method
 */
function getVendorShippingTotalForRate(
	vendor: Vendor,
	rate: ShippingRate,
	items: Record<string, CartItem>
): number | null {
	// Free shipping = 0 cost
	if (rate.type === 'free_shipping') return 0;

	// Only handle fixed_rate / flat_rate
	if (rate.type !== 'fixed_rate' && rate.type !== 'flat_rate') return null;

	const calculationMethod = rate.calculation_method || 'per_item';
	const vendorItems = Object.values(items).filter(
		(item) => item.vendor.id === vendor.id && item.shipping.is_shippable
	);

	// PER ORDER: Single flat rate
	if (calculationMethod === 'per_order') {
		return rate.amount_per_unit || 0;
	}

	// PER CLASS: Maximum of shipping classes in cart
	if (calculationMethod === 'per_class') {
		let maxCost = rate.amount_per_unit || 0;
		for (const item of vendorItems) {
			let itemCost = rate.amount_per_unit || 0;
			const shippingClass = item.shipping.shipping_class;
			if (shippingClass && rate.shipping_classes?.[shippingClass]) {
				itemCost = rate.shipping_classes[shippingClass];
			}
			maxCost = Math.max(maxCost, itemCost);
		}
		return maxCost;
	}

	// PER ITEM: Sum of per-item costs
	let total = 0;
	for (const item of vendorItems) {
		let itemCost = rate.amount_per_unit || 0;
		const shippingClass = item.shipping.shipping_class;
		if (shippingClass && rate.shipping_classes?.[shippingClass]) {
			itemCost = rate.shipping_classes[shippingClass];
		}
		const qty = getItemQuantity(item);
		total += itemCost * qty;
	}
	return total;
}

/**
 * Get all sorted vendor shipping rates
 * Matches Voxel's getAllSortedVendorRates() method
 */
function getAllSortedVendorRates(
	vendor: Vendor,
	shipping: ShippingState
): Array<{ zone: ShippingZone; rate: ShippingRate }> {
	if (!vendor || !vendor.shipping_zones || !shipping.country) {
		return [];
	}

	const rates: Array<{ zone: ShippingZone; rate: ShippingRate }> = [];

	// Loop through vendor's shipping zones
	Object.values(vendor.shipping_zones).forEach((zone) => {
		// Check if zone serves selected country
		if (zone.countries[shipping.country || '']) {
			// Loop through rates in this zone
			Object.values(zone.rates).forEach((rate) => {
				// Check if rate should be listed (region/state/ZIP matching)
				if (shouldListVendorShippingRate(shipping, zone)) {
					rates.push({ zone, rate });
				}
			});
		}
	});

	// Sort by vendor's preferred order
	const ratesOrder = vendor.shipping_rates_order;
	if (ratesOrder && Array.isArray(ratesOrder) && ratesOrder.length > 0) {
		const orderMap: Record<string, number> = {};
		ratesOrder.forEach((key, index) => {
			orderMap[key] = index;
		});
		rates.sort((a, b) => {
			const aIndex = orderMap[a.rate.key] !== undefined ? orderMap[a.rate.key] : Infinity;
			const bIndex = orderMap[b.rate.key] !== undefined ? orderMap[b.rate.key] : Infinity;
			return aIndex - bIndex;
		});
	}

	return rates;
}

/**
 * Check if vendor has any matching shipping rates
 * Matches Voxel's vendorHasMatchingRates() method
 */
function vendorHasMatchingRates(vendor: Vendor, shipping: ShippingState): boolean {
	if (!vendor.has_shippable_products) return false;
	if (!vendor.shipping_zones) return false;
	if (!shipping.country) return false;
	return getAllSortedVendorRates(vendor, shipping).length > 0;
}

export default function VendorShippingCards({
	config,
	shipping,
	onShippingChange,
	items,
	vendors,
	shippingIcon,
	currency,
	l10n,
	context,
}: VendorShippingCardsProps) {
	// Filter to only vendors with shippable products
	const vendorsWithShippable = useMemo(() => {
		const result: Record<string, Vendor> = {};
		Object.values(vendors).forEach((vendor) => {
			if (vendor.has_shippable_products) {
				result[vendor.key] = vendor;
			}
		});
		return result;
	}, [vendors]);

	/**
	 * Handle vendor rate selection
	 */
	const handleRateSelect = (vendorKey: string, zoneKey: string, rateKey: string) => {
		if (context === 'editor') return;

		const updatedVendors = { ...shipping.vendors };
		updatedVendors[vendorKey] = {
			zone: zoneKey,
			rate: rateKey,
		};

		onShippingChange({
			vendors: updatedVendors,
		});
	};

	// Don't render if no country selected
	if (!shipping.country) {
		return null;
	}

	return (
		<>
			{Object.values(vendorsWithShippable).map((vendor) => {
				const sortedRates = getAllSortedVendorRates(vendor, shipping);
				const hasMatchingRates = vendorHasMatchingRates(vendor, shipping);
				const vendorSelection = shipping.vendors[vendor.key];

				return (
					<div key={vendor.key} className="checkout-section form-field-grid">
						{/* Section divider with vendor name */}
						<div className="ts-form-group">
							<div className="or-group">
								<div className="or-line"></div>
								<span className="or-text">
									{__('Shipping method (Products sold by', 'voxel-fse')}{' '}
									{vendor.display_name})
								</span>
								<div className="or-line"></div>
							</div>
						</div>

						<div className="ts-form-group vx-1-1">
							{hasMatchingRates ? (
								<ul className="simplify-ul addon-cards flexify">
									{sortedRates.map(({ zone, rate }) => {
										const isSelected =
											vendorSelection?.zone === zone.key &&
											vendorSelection?.rate === rate.key;
										const meetsCriteria = vendorRateMeetsCriteria(
											vendor,
											rate,
											items
										);
										const shippingTotal = getVendorShippingTotalForRate(
											vendor,
											rate,
											items
										);

										return (
											<li
												key={`${zone.key}-${rate.key}`}
												className={`flexify ${isSelected ? 'adc-selected' : ''} ${
													!meetsCriteria ? 'vx-disabled' : ''
												}`}
												onClick={() => {
													if (meetsCriteria) {
														handleRateSelect(vendor.key, zone.key, rate.key);
													}
												}}
											>
												<div className="card-icn">
													{renderIcon(shippingIcon)}
												</div>
												<div className="addon-details">
													<span className="adc-title">{rate.label}</span>

													{/* Delivery estimate - only show if rate meets criteria */}
													{rate.delivery_estimate && meetsCriteria && (
														<span className="adc-subtitle">
															{rate.delivery_estimate}
														</span>
													)}

													{/* Minimum order message - show if doesn't meet criteria */}
													{!meetsCriteria &&
														rate.type === 'free_shipping' &&
														rate.requirements === 'minimum_order_amount' && (
															<span className="adc-subtitle">
																{__('Minimum order amount:', 'voxel-fse')}{' '}
																{currencyFormat(
																	rate.minimum_order_amount || 0,
																	currency
																)}
															</span>
														)}

													{/* Price */}
													<span className="vx-addon-price">
														{shippingTotal === 0 || shippingTotal === null
															? l10n.free
															: currencyFormat(shippingTotal, currency)}
													</span>
												</div>
											</li>
										);
									})}
								</ul>
							) : (
								<label>
									{__(
										'This vendor does not ship to your location. In order to proceed, remove products by this vendor from cart, or pick a different address.',
										'voxel-fse'
									)}
								</label>
							)}
						</div>
					</div>
				);
			})}
		</>
	);
}
