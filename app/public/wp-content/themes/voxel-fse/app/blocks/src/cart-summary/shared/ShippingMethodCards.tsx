/**
 * ShippingMethodCards Component - Shipping Rate Selection
 *
 * Matches Voxel's shipping-details.php template 1:1 (lines 94-227)
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/shipping-details.php
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import type { IconValue } from '@shared/controls/IconPickerControl';
import type {
	ShippingState,
	ShippingZones,
	ShippingRate,
	ShippingZone,
	CartItem,
	Vendor,
	CartConfig,
} from '../types';

interface ShippingMethodCardsProps {
	config: CartConfig;
	shipping: ShippingState;
	onShippingChange: (changes: Partial<ShippingState>) => void;
	items: Record<string, CartItem>;
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
 * Check if a rate meets criteria (minimum order amount for free shipping)
 */
function rateMeetsCriteria(
	rate: ShippingRate,
	cartTotal: number
): boolean {
	if (rate.type === 'free_shipping' && rate.requirements === 'minimum_order_amount') {
		return cartTotal >= (rate.minimum_order_amount || 0);
	}
	return true;
}

/**
 * Calculate shipping total for a specific rate
 */
function getShippingTotalForRate(
	rate: ShippingRate,
	items: Record<string, CartItem>
): number {
	if (rate.type === 'free_shipping') return 0;
	if (!rate.amount_per_unit) return 0;

	const calculationMethod = rate.calculation_method || 'per_order';

	switch (calculationMethod) {
		case 'per_order':
			return rate.amount_per_unit;

		case 'per_item': {
			let itemCount = 0;
			Object.values(items).forEach((item) => {
				if (item.shipping.is_shippable) {
					const qty = item.product_mode === 'regular'
						? (item.value as Record<string, Record<string, number>>).stock?.quantity || 1
						: (item.value as Record<string, Record<string, number>>).variations?.quantity || 1;
					itemCount += qty;
				}
			});
			return rate.amount_per_unit * itemCount;
		}

		case 'per_class': {
			// Per shipping class calculation
			const shippingClasses = rate.shipping_classes || {};
			let total = rate.amount_per_unit; // Base amount
			Object.values(items).forEach((item) => {
				if (item.shipping.is_shippable && item.shipping.shipping_class) {
					const classRate = shippingClasses[item.shipping.shipping_class];
					if (classRate !== undefined) {
						const qty = item.product_mode === 'regular'
							? (item.value as Record<string, Record<string, number>>).stock?.quantity || 1
							: (item.value as Record<string, Record<string, number>>).variations?.quantity || 1;
						total += classRate * qty;
					}
				}
			});
			return total;
		}

		default:
			return rate.amount_per_unit;
	}
}

/**
 * Check if a zone/rate applies to the current shipping address
 */
function shouldListShippingRate(
	rate: ShippingRate,
	zone: ShippingZone,
	shipping: ShippingState
): boolean {
	// Check if country is in zone
	if (!zone.countries[shipping.country || '']) {
		return false;
	}

	// Check regions if they exist
	if (zone.regions && zone.regions.length > 0) {
		for (const region of zone.regions) {
			if (region.country !== shipping.country) continue;

			// Check state if required
			if (region.states && region.states.length > 0) {
				if (!region.states.includes(shipping.state)) continue;
			}

			// Check ZIP code patterns if enabled
			if (region.zip_codes_enabled && region.zip_codes) {
				const patterns = region.zip_codes.split('\n').map((p) => p.trim());
				if (!matchesZipCode(shipping.zip, patterns)) continue;
			}

			return true;
		}
		return false;
	}

	return true;
}

/**
 * Match ZIP code against patterns (wildcards and ranges)
 */
function matchesZipCode(zip: string, patterns: string[]): boolean {
	const normalizedZip = zip.toLowerCase().replace(/\s/g, '');

	for (const pattern of patterns) {
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
 * Get all sorted platform shipping rates
 */
function getAllSortedPlatformRates(
	zones: ShippingZones,
	shipping: ShippingState,
	items: Record<string, CartItem>,
	ratesOrder: string[]
): Array<{ zone: ShippingZone; rate: ShippingRate }> {
	const rates: Array<{ zone: ShippingZone; rate: ShippingRate }> = [];

	Object.values(zones).forEach((zone) => {
		Object.values(zone.rates).forEach((rate) => {
			if (shouldListShippingRate(rate, zone, shipping)) {
				rates.push({ zone, rate });
			}
		});
	});

	// Sort by rates order if specified
	if (ratesOrder && ratesOrder.length > 0) {
		rates.sort((a, b) => {
			const aIndex = ratesOrder.indexOf(a.rate.key);
			const bIndex = ratesOrder.indexOf(b.rate.key);
			if (aIndex === -1 && bIndex === -1) return 0;
			if (aIndex === -1) return 1;
			if (bIndex === -1) return -1;
			return aIndex - bIndex;
		});
	}

	return rates;
}

export default function ShippingMethodCards({
	config,
	shipping,
	onShippingChange,
	items,
	shippingIcon,
	currency,
	l10n,
	context,
}: ShippingMethodCardsProps) {
	// Calculate cart total for minimum order checks
	const cartTotal = useMemo(() => {
		let total = 0;
		Object.values(items).forEach((item) => {
			total += item.pricing.total_amount;
		});
		return total;
	}, [items]);

	// Check shipping method (platform or vendor)
	const shippingMethod = config.multivendor.enabled
		? config.shipping.responsibility
		: 'platform_rates';

	// Get sorted rates for platform shipping
	const sortedRates = useMemo(() => {
		if (shippingMethod !== 'platform_rates') return [];
		return getAllSortedPlatformRates(
			config.shipping.zones,
			shipping,
			items,
			config.shipping.shipping_rates_order || []
		);
	}, [config.shipping.zones, shipping, items, config.shipping.shipping_rates_order, shippingMethod]);

	const hasMatchingRates = sortedRates.length > 0;

	// Handle rate selection
	const handleRateSelect = (zoneKey: string, rateKey: string) => {
		if (context === 'editor') return;
		onShippingChange({
			zone: zoneKey,
			rate: rateKey,
		});
	};

	// Only render for platform rates (vendor rates would need additional component)
	if (shippingMethod !== 'platform_rates') {
		// TODO: Implement vendor-specific shipping rates
		return null;
	}

	return (
		<div className="checkout-section form-field-grid">
			{/* Section divider */}
			<div className="ts-form-group">
				<div className="or-group">
					<div className="or-line"></div>
					<span className="or-text">
						{__('Shipping method', 'voxel-fse')}
					</span>
					<div className="or-line"></div>
				</div>
			</div>

			<div className="ts-form-group vx-1-1">
				{hasMatchingRates ? (
					<ul className="simplify-ul addon-cards flexify">
						{sortedRates.map(({ zone, rate }) => {
							const isSelected =
								shipping.zone === zone.key && shipping.rate === rate.key;
							const meetsCriteria = rateMeetsCriteria(rate, cartTotal);
							const shippingTotal = getShippingTotalForRate(rate, items);

							return (
								<li
									key={`${zone.key}-${rate.key}`}
									className={`flexify ${isSelected ? 'adc-selected' : ''} ${
										!meetsCriteria ? 'vx-disabled' : ''
									}`}
									onClick={() => {
										if (meetsCriteria) {
											handleRateSelect(zone.key, rate.key);
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
											{shippingTotal === 0
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
							'No shipping rates available for your location. Please select a different address.',
							'voxel-fse'
						)}
					</label>
				)}
			</div>
		</div>
	);
}
