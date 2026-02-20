/**
 * ShippingDetails Component - Shipping Address Form
 *
 * Matches Voxel's shipping-details.php template 1:1
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/shipping-details.php (lines 1-93)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import type { ShippingState, ShippingCountries } from '../types';

interface ShippingDetailsProps {
	shipping: ShippingState;
	onShippingChange: (changes: Partial<ShippingState>) => void;
	countries: ShippingCountries;
	context: 'editor' | 'frontend';
}

/**
 * Get states for a specific country
 */
function getCountryStates(
	countries: ShippingCountries,
	countryCode: string | null
): Record<string, { name: string }> | undefined {
	if (!countryCode || !countries[countryCode]) return undefined;
	return countries[countryCode].states;
}

export default function ShippingDetails({
	shipping,
	onShippingChange,
	countries,
	context: _context,
}: ShippingDetailsProps) {
	const countryStates = getCountryStates(countries, shipping.country);
	const hasStates = countryStates && Object.keys(countryStates).length > 0;

	/**
	 * Handle country selection change
	 * Resets state, zone, and rate when country changes
	 */
	const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newCountry = e.target.value || null;
		onShippingChange({
			country: newCountry,
			state: '',
			zone: null,
			rate: null,
		});
	};

	// Loading state
	if (shipping.status !== 'completed') {
		return (
			<div className="checkout-section form-field-grid">
				<div className="ts-form-group">
					<div className="or-group">
						<div className="or-line"></div>
						<span className="or-text">
							{__('Shipping details', 'voxel-fse')}
						</span>
						<div className="or-line"></div>
					</div>
				</div>
				<div className="ts-form-group vx-1-1">
					<div className="vx-loading-screen">
						<div className="ts-no-posts">
							<span className="ts-loader"></span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="checkout-section form-field-grid">
			{/* Section divider */}
			<div className="ts-form-group">
				<div className="or-group">
					<div className="or-line"></div>
					<span className="or-text">
						{__('Shipping details', 'voxel-fse')}
					</span>
					<div className="or-line"></div>
				</div>
			</div>

			{/* First Name */}
			<div className="ts-form-group vx-1-2">
				<label>{__('First name', 'voxel-fse')}</label>
				<input
					type="text"
					value={shipping.first_name}
					onChange={(e) =>
						onShippingChange({ first_name: e.target.value })
					}
					placeholder={__('First name', 'voxel-fse')}
					className="ts-filter"
				/>
			</div>

			{/* Last Name */}
			<div className="ts-form-group vx-1-2">
				<label>{__('Last name', 'voxel-fse')}</label>
				<input
					type="text"
					value={shipping.last_name}
					onChange={(e) =>
						onShippingChange({ last_name: e.target.value })
					}
					placeholder={__('Last name', 'voxel-fse')}
					className="ts-filter"
				/>
			</div>

			{/* Country - Full width if no states, half width if has states */}
			<div className={`ts-form-group ${hasStates ? 'vx-1-2' : 'vx-1-1'}`}>
				<label>{__('Country', 'voxel-fse')}</label>
				<div className="ts-filter">
					<select
						value={shipping.country || ''}
						onChange={handleCountryChange}
					>
						<option value="">{__('Select country', 'voxel-fse')}</option>
						{Object.entries(countries).map(([code, country]) => (
							<option key={code} value={code}>
								{country.name}
							</option>
						))}
					</select>
					<div className="ts-down-icon"></div>
				</div>
			</div>

			{/* State - Only show if country has states */}
			{hasStates && (
				<div className="ts-form-group vx-1-2">
					<label>{__('State / County', 'voxel-fse')}</label>
					<div className="ts-filter">
						<select
							value={shipping.state}
							onChange={(e) =>
								onShippingChange({ state: e.target.value })
							}
						>
							<option value="">{__('Select state', 'voxel-fse')}</option>
							{Object.entries(countryStates!).map(
								([code, stateData]) => (
									<option key={code} value={code}>
										{stateData.name || code}
									</option>
								)
							)}
						</select>
						<div className="ts-down-icon"></div>
					</div>
				</div>
			)}

			{/* Address */}
			<div className="ts-form-group vx-1-2">
				<label>{__('Address', 'voxel-fse')}</label>
				<input
					type="text"
					value={shipping.address}
					onChange={(e) =>
						onShippingChange({ address: e.target.value })
					}
					placeholder={__('Street address', 'voxel-fse')}
					className="ts-filter"
				/>
			</div>

			{/* ZIP Code */}
			<div className="ts-form-group vx-1-2">
				<label>{__('ZIP / Postal code', 'voxel-fse')}</label>
				<input
					type="text"
					value={shipping.zip}
					onChange={(e) => onShippingChange({ zip: e.target.value })}
					placeholder={__('ZIP / Postal code', 'voxel-fse')}
					className="ts-filter"
				/>
			</div>
		</div>
	);
}
