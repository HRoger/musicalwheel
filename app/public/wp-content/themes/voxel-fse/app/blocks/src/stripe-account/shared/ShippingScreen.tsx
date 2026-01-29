/**
 * Shipping Screen Component
 *
 * Handles shipping zones and rates configuration.
 * Matches Voxel's stripe-account-shipping.php template structure.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';

import type {
	StripeAccountConfig,
	ShippingZone,
	ShippingRate,
	ShippingRegion,
	DeliveryEstimate,
} from '../types';

/**
 * Component props
 */
interface ShippingScreenProps {
	config: StripeAccountConfig;
	zones: ShippingZone[];
	rates: ShippingRate[];
	onZonesChange: (zones: ShippingZone[]) => void;
	onRatesChange: (rates: ShippingRate[]) => void;
	onGoBack: () => void;
	onSave: () => Promise<void>;
	saving: boolean;
	context: 'editor' | 'frontend';
}

/**
 * Generate a random 8-character key
 */
function generateKey(): string {
	return Math.random().toString(36).substring(2, 10);
}

/**
 * Create default delivery estimate
 */
function createDeliveryEstimate(): DeliveryEstimate {
	return {
		enabled: false,
		minimum: { value: null, unit: 'day' },
		maximum: { value: null, unit: 'day' },
	};
}

/**
 * Shipping Screen Component
 */
export default function ShippingScreen({
	config,
	zones,
	rates,
	onZonesChange,
	onRatesChange,
	onGoBack,
	onSave,
	saving,
	context,
}: ShippingScreenProps) {
	const [activeZone, setActiveZone] = useState<ShippingZone | null>(null);
	const [activeRate, setActiveRate] = useState<ShippingRate | null>(null);
	const [activeContinents, setActiveContinents] = useState<Record<string, string | null>>({});

	// Get countries data from config
	const countries = config.shipping_countries || {};
	const countriesByContinent = config.shipping_countries_by_continent || {};
	const shippingClasses = config.shipping_classes || {};
	const primaryCurrency = config.primary_currency || 'USD';

	// Add new shipping zone
	const addShippingZone = useCallback(() => {
		const newZone: ShippingZone = {
			key: generateKey(),
			label: '',
			regions: [],
		};
		onZonesChange([...zones, newZone]);
		setActiveZone(newZone);
	}, [zones, onZonesChange]);

	// Remove shipping zone
	const removeShippingZone = useCallback((index: number) => {
		const newZones = [...zones];
		newZones.splice(index, 1);
		onZonesChange(newZones);
		if (activeZone === zones[index]) {
			setActiveZone(null);
		}
	}, [zones, onZonesChange, activeZone]);

	// Update zone
	const updateZone = useCallback((index: number, updates: Partial<ShippingZone>) => {
		const newZones = [...zones];
		newZones[index] = { ...newZones[index], ...updates };
		onZonesChange(newZones);
	}, [zones, onZonesChange]);

	// Add country to zone
	const handleCountrySelect = useCallback((zone: ShippingZone, value: string) => {
		if (!value) return;

		const zoneIndex = zones.findIndex(z => z.key === zone.key);
		if (zoneIndex === -1) return;

		// Check if it's a continent selection
		if (value.startsWith('continent:')) {
			const continent = value.substring(10);
			const continentCountries = countriesByContinent[continent] || {};
			const newRegions = Object.keys(continentCountries)
				.filter(code => !zone.regions.some(r => r.country === code))
				.map(code => ({ country: code, states: [] }));

			updateZone(zoneIndex, {
				regions: [...zone.regions, ...newRegions],
			});
		} else {
			// Single country
			if (!zone.regions.some(r => r.country === value)) {
				updateZone(zoneIndex, {
					regions: [...zone.regions, { country: value, states: [] }],
				});
			}
		}
	}, [zones, countriesByContinent, updateZone]);

	// Remove region from zone
	const removeRegion = useCallback((zone: ShippingZone, regionIndex: number) => {
		const zoneIndex = zones.findIndex(z => z.key === zone.key);
		if (zoneIndex === -1) return;

		const newRegions = [...zone.regions];
		newRegions.splice(regionIndex, 1);
		updateZone(zoneIndex, { regions: newRegions });
	}, [zones, updateZone]);

	// Add new shipping rate
	const addShippingRate = useCallback(() => {
		const newRate: ShippingRate = {
			key: generateKey(),
			label: '',
			zone_keys: [],
			type: 'free_shipping',
			free_shipping: {
				requirements: 'none',
				minimum_order_amount: null,
				delivery_estimate: createDeliveryEstimate(),
			},
			fixed_rate: {
				calculation_method: 'per_item',
				amount_per_unit: null,
				shipping_classes: [],
				delivery_estimate: createDeliveryEstimate(),
			},
		};
		onRatesChange([...rates, newRate]);
		setActiveRate(newRate);
	}, [rates, onRatesChange]);

	// Remove shipping rate
	const removeShippingRate = useCallback((rate: ShippingRate) => {
		const index = rates.findIndex(r => r.key === rate.key);
		if (index === -1) return;

		const newRates = [...rates];
		newRates.splice(index, 1);
		onRatesChange(newRates);
		if (activeRate === rate) {
			setActiveRate(null);
		}
	}, [rates, onRatesChange, activeRate]);

	// Update rate
	const updateRate = useCallback((rate: ShippingRate, updates: Partial<ShippingRate>) => {
		const index = rates.findIndex(r => r.key === rate.key);
		if (index === -1) return;

		const newRates = [...rates];
		newRates[index] = { ...newRates[index], ...updates };
		onRatesChange(newRates);
	}, [rates, onRatesChange]);

	// Get zones for a rate
	const getRateZones = useCallback((rate: ShippingRate): ShippingZone[] => {
		return zones.filter(z => rate.zone_keys.includes(z.key));
	}, [zones]);

	// Check if rate is in zone
	const isRateInZone = useCallback((rate: ShippingRate, zoneKey: string): boolean => {
		return rate.zone_keys.includes(zoneKey);
	}, []);

	// Add zone to rate
	const handleZoneSelectForRate = useCallback((rate: ShippingRate, zoneKey: string) => {
		if (!zoneKey || isRateInZone(rate, zoneKey)) return;
		updateRate(rate, { zone_keys: [...rate.zone_keys, zoneKey] });
	}, [isRateInZone, updateRate]);

	// Remove zone from rate
	const removeRateFromZone = useCallback((rate: ShippingRate, zoneKey: string) => {
		updateRate(rate, { zone_keys: rate.zone_keys.filter(k => k !== zoneKey) });
	}, [updateRate]);

	// Get country name
	const getCountryName = useCallback((code: string): string => {
		return countries[code]?.name || code;
	}, [countries]);

	// Render icon
	const renderIcon = (iconValue: string | undefined, fallbackClass: string): JSX.Element => {
		const value = iconValue || fallbackClass;
		if (value.startsWith('svg:')) {
			return <img src={value.substring(4)} alt="" className="ts-icon" />;
		}
		return <i className={value} />;
	};

	return (
		<div className="ts-vendor-shipping-zones" style={{ marginTop: '20px' }}>
			<div className="ac-body">
				<div className="ts-form">
					<div className="create-form-step form-field-grid">
						{/* Heading */}
						<div className="ts-form-group ui-heading-field field-key-ui-heading">
							<label>{__('Configure Shipping', 'voxel-fse')}</label>
						</div>

						{/* Shipping Zones Section */}
						<div className="ts-form-group">
							<label>{__('Shipping zones', 'voxel-fse')}</label>

							{zones.length > 0 && (
								<div className="ts-repeater-container">
									{zones.map((zone, zoneIndex) => (
										<div
											key={zone.key}
											className={`ts-field-repeater ${activeZone !== zone ? 'collapsed' : ''}`}
										>
											<div
												className="ts-repeater-head ts-repeater-head--zone"
												onClick={() => setActiveZone(activeZone === zone ? null : zone)}
											>
												{renderIcon(config.icons?.zone, 'las la-flag')}
												<label>{zone.label || __('Untitled zone', 'voxel-fse')}</label>
												<div className="ts-repeater-controller">
													<a
														href="#"
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															removeShippingZone(zoneIndex);
														}}
														className="ts-icon-btn ts-smaller no-drag"
													>
														{renderIcon(config.icons?.trash, 'las la-trash')}
													</a>
													<a href="#" className="ts-icon-btn ts-smaller no-drag" onClick={(e) => e.preventDefault()}>
														{renderIcon(config.icons?.down, 'las la-angle-down')}
													</a>
												</div>
											</div>

											{activeZone === zone && (
												<div className="medium form-field-grid">
													{/* Zone Label */}
													<div className="ts-form-group vx-1-1">
														<label>{__('Label', 'voxel-fse')}</label>
														<input
															type="text"
															className="ts-filter"
															maxLength={32}
															value={zone.label}
															onChange={(e) => updateZone(zoneIndex, { label: e.target.value })}
														/>
													</div>

													{/* Countries Selection */}
													<div className="ts-form-group vx-1-1">
														<label>
															{__('Countries', 'voxel-fse')}
															<span style={{ marginLeft: 'auto' }}>
																<a href="#" onClick={(e) => { e.preventDefault(); /* Select all */ }}>
																	{__('Select all', 'voxel-fse')}
																</a>
																{' / '}
																<a href="#" onClick={(e) => { e.preventDefault(); updateZone(zoneIndex, { regions: [] }); }}>
																	{__('Unselect all', 'voxel-fse')}
																</a>
															</span>
														</label>
														<div className="ts-filter">
															<select
																onChange={(e) => {
																	handleCountrySelect(zone, e.target.value);
																	e.target.value = '';
																}}
																value=""
															>
																<option value="">{__('Add country', 'voxel-fse')}</option>
																{Object.entries(countriesByContinent).map(([continent, countryList]) => (
																	<optgroup key={continent} label={continent}>
																		{Object.entries(countryList).map(([code, name]) => (
																			<option
																				key={code}
																				value={code}
																				disabled={zone.regions.some(r => r.country === code)}
																			>
																				{name}
																			</option>
																		))}
																	</optgroup>
																))}
															</select>
															<div className="ts-down-icon"></div>
														</div>
													</div>

													{/* Selected Countries */}
													<div className="ts-form-group vx-1-1">
														{zone.regions.length > 0 ? (
															<div className="ts-repeater-container">
																{zone.regions.map((region, regionIndex) => (
																	<div key={region.country} className="ts-field-repeater collapsed">
																		<div className="ts-repeater-head">
																			<label>{getCountryName(region.country)}</label>
																			<div className="ts-repeater-controller">
																				<a
																					href="#"
																					onClick={(e) => {
																						e.stopPropagation();
																						e.preventDefault();
																						removeRegion(zone, regionIndex);
																					}}
																					className="ts-icon-btn ts-smaller"
																				>
																					{renderIcon(config.icons?.trash, 'las la-trash')}
																				</a>
																			</div>
																		</div>
																	</div>
																))}
															</div>
														) : (
															<label style={{ paddingBottom: 0 }}>
																{__('You have not added any countries yet.', 'voxel-fse')}
															</label>
														)}
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							)}

							<a
								href="#"
								className="ts-repeater-add ts-btn ts-btn-4 form-btn"
								onClick={(e) => {
									e.preventDefault();
									addShippingZone();
								}}
							>
								{renderIcon(config.icons?.add, 'las la-plus')}
								{__('Add shipping zone', 'voxel-fse')}
							</a>
						</div>

						{/* Shipping Rates Section */}
						<div className="ts-form-group">
							<label>{__('Shipping rates', 'voxel-fse')}</label>

							{rates.length > 0 && (
								<div className="ts-repeater-container">
									{rates.map((rate) => (
										<div
											key={rate.key}
											className={`ts-field-repeater ${activeRate !== rate ? 'collapsed' : ''}`}
										>
											<div
												className="ts-repeater-head ts-repeater-head--rate"
												onClick={() => setActiveRate(activeRate === rate ? null : rate)}
											>
												{renderIcon(config.icons?.zone, 'las la-box')}
												<label>{rate.label || __('Untitled rate', 'voxel-fse')}</label>
												{getRateZones(rate).length > 0 && (
													<em>
														{getRateZones(rate).length} zone{getRateZones(rate).length !== 1 ? 's' : ''}
													</em>
												)}
												<div className="ts-repeater-controller">
													<a
														href="#"
														onClick={(e) => {
															e.stopPropagation();
															e.preventDefault();
															removeShippingRate(rate);
														}}
														className="ts-icon-btn ts-smaller no-drag"
													>
														{renderIcon(config.icons?.trash, 'las la-trash')}
													</a>
													<a href="#" className="ts-icon-btn ts-smaller no-drag" onClick={(e) => e.preventDefault()}>
														{renderIcon(config.icons?.down, 'las la-angle-down')}
													</a>
												</div>
											</div>

											{activeRate === rate && (
												<div className="medium form-field-grid">
													{/* Rate Label */}
													<div className="ts-form-group vx-1-1">
														<label>{__('Label', 'voxel-fse')}</label>
														<input
															type="text"
															className="ts-filter"
															maxLength={32}
															value={rate.label}
															onChange={(e) => updateRate(rate, { label: e.target.value })}
														/>
													</div>

													{/* Zones Selection */}
													<div className="ts-form-group vx-1-1">
														<label>
															{__('Zones', 'voxel-fse')}
															<span style={{ marginLeft: 'auto' }}>
																<a href="#" onClick={(e) => { e.preventDefault(); updateRate(rate, { zone_keys: zones.map(z => z.key) }); }}>
																	{__('Select all', 'voxel-fse')}
																</a>
																{' / '}
																<a href="#" onClick={(e) => { e.preventDefault(); updateRate(rate, { zone_keys: [] }); }}>
																	{__('Unselect all', 'voxel-fse')}
																</a>
															</span>
														</label>
														<div className="ts-filter">
															<select
																onChange={(e) => {
																	handleZoneSelectForRate(rate, e.target.value);
																	e.target.value = '';
																}}
																value=""
															>
																<option value="">{__('Add zone', 'voxel-fse')}</option>
																{zones.map((zone) => (
																	<option
																		key={zone.key}
																		value={zone.key}
																		disabled={isRateInZone(rate, zone.key)}
																	>
																		{zone.label || __('Untitled zone', 'voxel-fse')}
																	</option>
																))}
															</select>
															<div className="ts-down-icon"></div>
														</div>
													</div>

													{/* Selected Zones */}
													<div className="ts-form-group vx-1-1">
														{getRateZones(rate).length > 0 ? (
															<div className="flexify simplify-ul attribute-select">
																{getRateZones(rate).map((zone) => (
																	<a key={zone.key} href="#" onClick={(e) => e.preventDefault()}>
																		{zone.label || __('Untitled zone', 'voxel-fse')}
																		<span onClick={(e) => {
																			e.preventDefault();
																			e.stopPropagation();
																			removeRateFromZone(rate, zone.key);
																		}}>
																			{renderIcon(config.icons?.trash, 'las la-trash')}
																		</span>
																	</a>
																))}
															</div>
														) : (
															<label style={{ paddingBottom: 0 }}>
																{__('No zones selected. Select zones where this rate applies.', 'voxel-fse')}
															</label>
														)}
													</div>

													{/* Rate Type */}
													<div className="ts-form-group vx-1-1">
														<label>{__('Type', 'voxel-fse')}</label>
														<div className="ts-filter">
															<select
																value={rate.type}
																onChange={(e) => updateRate(rate, { type: e.target.value as 'free_shipping' | 'fixed_rate' })}
															>
																<option value="free_shipping">{__('Free shipping', 'voxel-fse')}</option>
																<option value="fixed_rate">{__('Flat rate', 'voxel-fse')}</option>
															</select>
															<div className="ts-down-icon"></div>
														</div>
													</div>

													{/* Free Shipping Options */}
													{rate.type === 'free_shipping' && (
														<>
															<div className="ts-form-group vx-1-1">
																<label>{__('Free shipping requires', 'voxel-fse')}</label>
																<div className="ts-filter">
																	<select
																		value={rate.free_shipping.requirements}
																		onChange={(e) => updateRate(rate, {
																			free_shipping: {
																				...rate.free_shipping,
																				requirements: e.target.value as 'none' | 'minimum_order_amount',
																			},
																		})}
																	>
																		<option value="none">{__('No requirement', 'voxel-fse')}</option>
																		<option value="minimum_order_amount">{__('Minimum order amount', 'voxel-fse')}</option>
																	</select>
																	<div className="ts-down-icon"></div>
																</div>
															</div>

															{rate.free_shipping.requirements === 'minimum_order_amount' && (
																<div className="ts-form-group vx-1-1">
																	<label>{__('Min. order amount', 'voxel-fse')}</label>
																	<div className="input-container">
																		<input
																			type="number"
																			step="any"
																			className="ts-filter"
																			value={rate.free_shipping.minimum_order_amount || ''}
																			onChange={(e) => updateRate(rate, {
																				free_shipping: {
																					...rate.free_shipping,
																					minimum_order_amount: e.target.value ? parseFloat(e.target.value) : null,
																				},
																			})}
																		/>
																		<span className="input-suffix">{primaryCurrency}</span>
																	</div>
																</div>
															)}
														</>
													)}

													{/* Fixed Rate Options */}
													{rate.type === 'fixed_rate' && (
														<>
															<div className="ts-form-group vx-1-1">
																<label>{__('Calculation method', 'voxel-fse')}</label>
																<div className="ts-filter">
																	<select
																		value={rate.fixed_rate.calculation_method}
																		onChange={(e) => updateRate(rate, {
																			fixed_rate: {
																				...rate.fixed_rate,
																				calculation_method: e.target.value as 'per_item' | 'per_order' | 'per_class',
																			},
																		})}
																	>
																		<option value="per_item">{__('Per item: Charge per item/quantity (default)', 'voxel-fse')}</option>
																		<option value="per_order">{__('Per order: Fixed cost regardless of quantity or number of items', 'voxel-fse')}</option>
																		<option value="per_class">{__('Per class: Use the highest shipping class cost', 'voxel-fse')}</option>
																	</select>
																	<div className="ts-down-icon"></div>
																</div>
															</div>

															<div className="ts-form-group vx-1-1">
																<label>{__('Price per unit', 'voxel-fse')}</label>
																<div className="input-container">
																	<input
																		type="number"
																		step="any"
																		className="ts-filter"
																		value={rate.fixed_rate.amount_per_unit || ''}
																		onChange={(e) => updateRate(rate, {
																			fixed_rate: {
																				...rate.fixed_rate,
																				amount_per_unit: e.target.value ? parseFloat(e.target.value) : null,
																			},
																		})}
																	/>
																	<span className="input-suffix">{primaryCurrency}</span>
																</div>
															</div>
														</>
													)}
												</div>
											)}
										</div>
									))}
								</div>
							)}

							<a
								href="#"
								className="ts-repeater-add ts-btn ts-btn-4 form-btn"
								onClick={(e) => {
									e.preventDefault();
									addShippingRate();
								}}
							>
								{renderIcon(config.icons?.add, 'las la-plus')}
								{__('Add shipping rate', 'voxel-fse')}
							</a>
						</div>

						{/* Bottom Actions */}
						<div className="ts-form-group vx-1-2">
							<a
								href="#"
								className="ts-btn ts-btn-1 ts-btn-large"
								onClick={(e) => {
									e.preventDefault();
									onGoBack();
								}}
							>
								{renderIcon(config.icons?.chevronLeft, 'las la-angle-left')}
								{__('Go back', 'voxel-fse')}
							</a>
						</div>
						<div className="ts-form-group vx-1-2">
							<a
								href="#"
								className={`ts-btn ts-btn-2 ts-btn-large ${saving ? 'vx-disabled' : ''}`}
								onClick={(e) => {
									e.preventDefault();
									if (!saving) {
										onSave();
									}
								}}
							>
								{renderIcon(config.icons?.save, 'las la-save')}
								{__('Save changes', 'voxel-fse')}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
