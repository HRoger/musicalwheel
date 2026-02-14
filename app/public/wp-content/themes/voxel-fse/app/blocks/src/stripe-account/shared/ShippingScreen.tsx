/**
 * Shipping Screen Component
 *
 * Handles shipping zones and rates configuration.
 * Matches Voxel's stripe-account-shipping.php template structure.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/stripe-connect/templates/frontend/stripe-account-shipping.php
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
	ShippingClassPrice,
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
 * Matches Voxel's key format for shipping zones/rates
 */
function generateKey(): string {
	return Math.random().toString(36).substring(2, 10);
}

/**
 * Create default delivery estimate
 * Matches Voxel's default delivery estimate structure
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
	const [activeRegions, setActiveRegions] = useState<Record<string, ShippingRegion | null>>({});
	const [activeContinentFilters, setActiveContinentFilters] = useState<Record<string, string | null>>({});
	const [draggedZoneIndex, setDraggedZoneIndex] = useState<number | null>(null);
	const [draggedRateIndex, setDraggedRateIndex] = useState<number | null>(null);

	// Get countries data from config
	const countries = config.shipping_countries || {};
	const countriesByContinent = config.shipping_countries_by_continent || {};
	const shippingClasses = config.shipping_classes || {};
	const primaryCurrency = config.primary_currency || 'USD';

	// ========================================
	// ZONE HANDLERS
	// ========================================

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

	// Get zone index by key
	const getZoneIndex = useCallback((zone: ShippingZone): number => {
		return zones.findIndex(z => z.key === zone.key);
	}, [zones]);

	// ========================================
	// COUNTRY/REGION HANDLERS
	// ========================================

	// Check if should show continent option (if any countries in continent are not yet added)
	const shouldShowContinentOption = useCallback((zone: ShippingZone, continent: string): boolean => {
		const continentCountries = countriesByContinent[continent] || {};
		return Object.keys(continentCountries).some(
			code => !zone.regions.some(r => r.country === code)
		);
	}, [countriesByContinent]);

	// Add country/continent to zone
	const handleCountrySelect = useCallback((zone: ShippingZone, value: string) => {
		if (!value) return;

		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		// Check if it's a continent selection
		if (value.startsWith('continent:')) {
			const continent = value.substring(10);
			const continentCountries = countriesByContinent[continent] || {};
			const newRegions = Object.keys(continentCountries)
				.filter(code => !zone.regions.some(r => r.country === code))
				.map(code => ({ country: code, states: [], zip_codes_enabled: false, zip_codes: '' }));

			updateZone(zoneIndex, {
				regions: [...zone.regions, ...newRegions],
			});
		} else {
			// Single country
			if (!zone.regions.some(r => r.country === value)) {
				updateZone(zoneIndex, {
					regions: [...zone.regions, { country: value, states: [], zip_codes_enabled: false, zip_codes: '' }],
				});
			}
		}
	}, [getZoneIndex, countriesByContinent, updateZone]);

	// Select all countries in a zone
	const selectAllCountries = useCallback((zone: ShippingZone) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const allCountryCodes = Object.keys(countries);
		const existingCodes = zone.regions.map(r => r.country);
		const newRegions = allCountryCodes
			.filter(code => !existingCodes.includes(code))
			.map(code => ({ country: code, states: [], zip_codes_enabled: false, zip_codes: '' }));

		updateZone(zoneIndex, {
			regions: [...zone.regions, ...newRegions],
		});
	}, [getZoneIndex, countries, updateZone]);

	// Unselect all countries in a zone
	const unselectAllCountries = useCallback((zone: ShippingZone) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;
		updateZone(zoneIndex, { regions: [] });
	}, [getZoneIndex, updateZone]);

	// Remove region from zone
	const removeRegion = useCallback((zone: ShippingZone, regionIndex: number) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const newRegions = [...zone.regions];
		newRegions.splice(regionIndex, 1);
		updateZone(zoneIndex, { regions: newRegions });
	}, [getZoneIndex, updateZone]);

	// Update region
	const updateRegion = useCallback((zone: ShippingZone, regionIndex: number, updates: Partial<ShippingRegion>) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const newRegions = [...zone.regions];
		newRegions[regionIndex] = { ...newRegions[regionIndex], ...updates };
		updateZone(zoneIndex, { regions: newRegions });
	}, [getZoneIndex, updateZone]);

	// ========================================
	// STATE/SUBDIVISION HANDLERS
	// ========================================

	// Get available states for a country
	const getAvailableStates = useCallback((countryCode: string): Record<string, { name: string }> => {
		return countries[countryCode]?.states || {};
	}, [countries]);

	// Get state name
	const getStateName = useCallback((countryCode: string, stateCode: string): string => {
		const states = getAvailableStates(countryCode);
		return states[stateCode]?.name || stateCode;
	}, [getAvailableStates]);

	// Handle state select
	const handleStateSelect = useCallback((zone: ShippingZone, region: ShippingRegion, stateCode: string) => {
		if (!stateCode) return;

		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const regionIndex = zone.regions.findIndex(r => r.country === region.country);
		if (regionIndex === -1) return;

		const currentStates = region.states || [];
		if (!currentStates.includes(stateCode)) {
			updateRegion(zone, regionIndex, {
				states: [...currentStates, stateCode],
			});
		}
	}, [getZoneIndex, updateRegion]);

	// Remove state from region
	const removeState = useCallback((zone: ShippingZone, region: ShippingRegion, stateIndex: number) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const regionIndex = zone.regions.findIndex(r => r.country === region.country);
		if (regionIndex === -1) return;

		const newStates = [...(region.states || [])];
		newStates.splice(stateIndex, 1);
		updateRegion(zone, regionIndex, { states: newStates });
	}, [getZoneIndex, updateRegion]);

	// Select all states for a region
	const selectAllStates = useCallback((zone: ShippingZone, region: ShippingRegion) => {
		const zoneIndex = getZoneIndex(zone);
		if (zoneIndex === -1) return;

		const regionIndex = zone.regions.findIndex(r => r.country === region.country);
		if (regionIndex === -1) return;

		const allStates = Object.keys(getAvailableStates(region.country));
		updateRegion(zone, regionIndex, { states: allStates });
	}, [getZoneIndex, getAvailableStates, updateRegion]);

	// ========================================
	// CONTINENT FILTER HELPERS
	// ========================================

	// Get active continent filter for a zone
	const getActiveContinent = useCallback((zone: ShippingZone): string | null => {
		return activeContinentFilters[zone.key] ?? null;
	}, [activeContinentFilters]);

	// Set active continent filter for a zone
	const setActiveContinent = useCallback((zone: ShippingZone, continent: string | null) => {
		setActiveContinentFilters(prev => ({
			...prev,
			[zone.key]: continent,
		}));
	}, []);

	// Get continents with country counts for a zone
	const getContinentsWithCounts = useCallback((zone: ShippingZone): Array<{ name: string; count: number }> => {
		const continentCounts: Record<string, number> = {};

		zone.regions.forEach(region => {
			const continent = countries[region.country]?.continent || 'Other';
			continentCounts[continent] = (continentCounts[continent] || 0) + 1;
		});

		return Object.entries(continentCounts)
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [countries]);

	// Get filtered regions by continent
	const getFilteredRegionsByContinent = useCallback((zone: ShippingZone): Record<string, Array<{ region: ShippingRegion; name: string }>> => {
		const activeContinent = getActiveContinent(zone);
		const result: Record<string, Array<{ region: ShippingRegion; name: string }>> = {};

		zone.regions.forEach(region => {
			const continent = countries[region.country]?.continent || 'Other';

			// Filter by active continent if set
			if (activeContinent !== null && continent !== activeContinent) {
				return;
			}

			if (!result[continent]) {
				result[continent] = [];
			}

			result[continent].push({
				region,
				name: countries[region.country]?.name || region.country,
			});
		});

		// Sort countries within each continent
		Object.keys(result).forEach(continent => {
			result[continent].sort((a, b) => a.name.localeCompare(b.name));
		});

		return result;
	}, [countries, getActiveContinent]);

	// ========================================
	// RATE HANDLERS
	// ========================================

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

	// Select all zones for a rate
	const selectAllZonesForRate = useCallback((rate: ShippingRate) => {
		updateRate(rate, { zone_keys: zones.map(z => z.key) });
	}, [zones, updateRate]);

	// Unselect all zones for a rate
	const unselectAllZonesForRate = useCallback((rate: ShippingRate) => {
		updateRate(rate, { zone_keys: [] });
	}, [updateRate]);

	// ========================================
	// SHIPPING CLASS HANDLERS
	// ========================================

	// Add shipping class to rate
	const addShippingClassToRate = useCallback((rate: ShippingRate, classKey: string) => {
		if (rate.fixed_rate.shipping_classes.some(c => c.shipping_class === classKey)) return;

		const newClasses: ShippingClassPrice[] = [
			...rate.fixed_rate.shipping_classes,
			{ shipping_class: classKey, amount_per_unit: null },
		];

		updateRate(rate, {
			fixed_rate: {
				...rate.fixed_rate,
				shipping_classes: newClasses,
			},
		});
	}, [updateRate]);

	// Remove shipping class from rate
	const removeShippingClassFromRate = useCallback((rate: ShippingRate, classIndex: number) => {
		const newClasses = [...rate.fixed_rate.shipping_classes];
		newClasses.splice(classIndex, 1);

		updateRate(rate, {
			fixed_rate: {
				...rate.fixed_rate,
				shipping_classes: newClasses,
			},
		});
	}, [updateRate]);

	// Update shipping class price
	const updateShippingClassPrice = useCallback((rate: ShippingRate, classIndex: number, amount: number | null) => {
		const newClasses = [...rate.fixed_rate.shipping_classes];
		newClasses[classIndex] = { ...newClasses[classIndex], amount_per_unit: amount };

		updateRate(rate, {
			fixed_rate: {
				...rate.fixed_rate,
				shipping_classes: newClasses,
			},
		});
	}, [updateRate]);

	// Get available shipping classes (not yet added to rate)
	const getAvailableShippingClasses = useCallback((rate: ShippingRate) => {
		return Object.values(shippingClasses).filter(
			sc => !rate.fixed_rate.shipping_classes.some(c => c.shipping_class === sc.key)
		);
	}, [shippingClasses]);

	// ========================================
	// DELIVERY ESTIMATE HANDLERS
	// ========================================

	// Update delivery estimate for a rate
	const updateDeliveryEstimate = useCallback((
		rate: ShippingRate,
		rateType: 'free_shipping' | 'fixed_rate',
		updates: Partial<DeliveryEstimate>
	) => {
		const currentEstimate = rate[rateType].delivery_estimate;
		const newEstimate = { ...currentEstimate, ...updates };

		updateRate(rate, {
			[rateType]: {
				...rate[rateType],
				delivery_estimate: newEstimate,
			},
		});
	}, [updateRate]);

	// ========================================
	// DRAG AND DROP HANDLERS
	// ========================================

	// Handle zone drag start
	const handleZoneDragStart = useCallback((e: React.DragEvent, index: number) => {
		setDraggedZoneIndex(index);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', String(index));
	}, []);

	// Handle zone drag over
	const handleZoneDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedZoneIndex === null || draggedZoneIndex === index) return;

		const newZones = [...zones];
		const [draggedZone] = newZones.splice(draggedZoneIndex, 1);
		newZones.splice(index, 0, draggedZone);
		onZonesChange(newZones);
		setDraggedZoneIndex(index);
	}, [draggedZoneIndex, zones, onZonesChange]);

	// Handle zone drag end
	const handleZoneDragEnd = useCallback(() => {
		setDraggedZoneIndex(null);
	}, []);

	// Handle rate drag start
	const handleRateDragStart = useCallback((e: React.DragEvent, index: number) => {
		setDraggedRateIndex(index);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', String(index));
	}, []);

	// Handle rate drag over
	const handleRateDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault();
		if (draggedRateIndex === null || draggedRateIndex === index) return;

		const newRates = [...rates];
		const [draggedRate] = newRates.splice(draggedRateIndex, 1);
		newRates.splice(index, 0, draggedRate);
		onRatesChange(newRates);
		setDraggedRateIndex(index);
	}, [draggedRateIndex, rates, onRatesChange]);

	// Handle rate drag end
	const handleRateDragEnd = useCallback(() => {
		setDraggedRateIndex(null);
	}, []);

	// ========================================
	// HELPER FUNCTIONS
	// ========================================

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

	// Render delivery estimate fields
	const renderDeliveryEstimateFields = (
		rate: ShippingRate,
		rateType: 'free_shipping' | 'fixed_rate'
	) => {
		const estimate = rate[rateType].delivery_estimate;

		return (
			<div className="ts-form-group vx-1-1">
				<label>
					<div className="switch-slider">
						<div className="onoffswitch">
							<input
								type="checkbox"
								className="onoffswitch-checkbox"
								checked={estimate.enabled}
								onChange={(e) => updateDeliveryEstimate(rate, rateType, { enabled: e.target.checked })}
							/>
							<label
								className="onoffswitch-label"
								onClick={(e) => {
									e.preventDefault();
									updateDeliveryEstimate(rate, rateType, { enabled: !estimate.enabled });
								}}
							></label>
						</div>
					</div>
					{__('Add delivery estimate?', 'voxel-fse')}
				</label>

				{estimate.enabled && (
					<div className="medium form-field-grid">
						<div className="ts-form-group vx-1-2">
							<label>{__('Between', 'voxel-fse')}</label>
							<input
								type="number"
								className="ts-filter"
								value={estimate.minimum.value ?? ''}
								onChange={(e) => updateDeliveryEstimate(rate, rateType, {
									minimum: { ...estimate.minimum, value: e.target.value ? parseInt(e.target.value) : null },
								})}
							/>
						</div>
						<div className="ts-form-group vx-1-2">
							<label>{__('Period', 'voxel-fse')}</label>
							<div className="ts-filter">
								<select
									value={estimate.minimum.unit}
									onChange={(e) => updateDeliveryEstimate(rate, rateType, {
										minimum: { ...estimate.minimum, unit: e.target.value as DeliveryEstimate['minimum']['unit'] },
									})}
								>
									<option value="hour">{__('Hour(s)', 'voxel-fse')}</option>
									<option value="day">{__('Day(s)', 'voxel-fse')}</option>
									<option value="business_day">{__('Business day(s)', 'voxel-fse')}</option>
									<option value="week">{__('Week(s)', 'voxel-fse')}</option>
									<option value="month">{__('Month(s)', 'voxel-fse')}</option>
								</select>
								<div className="ts-down-icon"></div>
							</div>
						</div>
						<div className="ts-form-group vx-1-2">
							<label>{__('And', 'voxel-fse')}</label>
							<input
								type="number"
								className="ts-filter"
								value={estimate.maximum.value ?? ''}
								onChange={(e) => updateDeliveryEstimate(rate, rateType, {
									maximum: { ...estimate.maximum, value: e.target.value ? parseInt(e.target.value) : null },
								})}
							/>
						</div>
						<div className="ts-form-group vx-1-2">
							<label>{__('Period', 'voxel-fse')}</label>
							<div className="ts-filter">
								<select
									value={estimate.maximum.unit}
									onChange={(e) => updateDeliveryEstimate(rate, rateType, {
										maximum: { ...estimate.maximum, unit: e.target.value as DeliveryEstimate['maximum']['unit'] },
									})}
								>
									<option value="hour">{__('Hour(s)', 'voxel-fse')}</option>
									<option value="day">{__('Day(s)', 'voxel-fse')}</option>
									<option value="business_day">{__('Business day(s)', 'voxel-fse')}</option>
									<option value="week">{__('Week(s)', 'voxel-fse')}</option>
									<option value="month">{__('Month(s)', 'voxel-fse')}</option>
								</select>
								<div className="ts-down-icon"></div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	};

	// ========================================
	// RENDER
	// ========================================

	return (
		<div className="ts-vendor-shipping-zones" style={{ marginTop: '20px' }}>
			<div className="ac-body">
				<div className="ts-form">
					<div className="create-form-step form-field-grid">
						{/* Heading */}
						<div className="ts-form-group ui-heading-field field-key-ui-heading">
							<label>{__('Configure Shipping', 'voxel-fse')}</label>
						</div>

						{/* ============================================ */}
						{/* SHIPPING ZONES SECTION */}
						{/* ============================================ */}
						<div className="ts-form-group">
							<label>{__('Shipping zones', 'voxel-fse')}</label>

							{zones.length > 0 && (
								<div className="ts-repeater-container">
									{zones.map((zone, zoneIndex) => (
										<div
											key={zone.key}
											className={`ts-field-repeater ${activeZone !== zone ? 'collapsed' : ''}`}
											draggable
											onDragStart={(e) => handleZoneDragStart(e, zoneIndex)}
											onDragOver={(e) => handleZoneDragOver(e, zoneIndex)}
											onDragEnd={handleZoneDragEnd}
											style={draggedZoneIndex === zoneIndex ? { opacity: 0.5 } : undefined}
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
																<a href="#" onClick={(e) => { e.preventDefault(); selectAllCountries(zone); }}>
																	{__('Select all', 'voxel-fse')}
																</a>
																{' / '}
																<a href="#" onClick={(e) => { e.preventDefault(); unselectAllCountries(zone); }}>
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
																{/* Continent "All in X" options */}
																{Object.keys(countriesByContinent).map(continent => (
																	shouldShowContinentOption(zone, continent) && (
																		<option
																			key={`continent:${continent}`}
																			value={`continent:${continent}`}
																			style={{ fontWeight: 'bold' }}
																		>
																			{__('All in', 'voxel-fse')} {continent}
																		</option>
																	)
																))}
																{/* Countries grouped by continent */}
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

													{/* Selected Countries with Continent Tabs */}
													<div className="ts-form-group vx-1-1">
														{zone.regions.length > 0 ? (
															<>
																{/* Continent filter tabs */}
																<div className="ts-region-categories" style={{ marginBottom: '20px' }}>
																	<ul className="simplify-ul addon-buttons flexify">
																		<li
																			onClick={(e) => { e.preventDefault(); setActiveContinent(zone, null); }}
																			className={getActiveContinent(zone) === null ? 'adb-selected' : ''}
																		>
																			{__('All', 'voxel-fse')} ({zone.regions.length})
																		</li>
																		{getContinentsWithCounts(zone).map(({ name, count }) => (
																			<li
																				key={name}
																				onClick={(e) => { e.preventDefault(); setActiveContinent(zone, name); }}
																				className={getActiveContinent(zone) === name ? 'adb-selected' : ''}
																			>
																				{name} ({count})
																			</li>
																		))}
																	</ul>
																</div>

																{/* Regions list */}
																<div className="ts-repeater-container">
																	{Object.entries(getFilteredRegionsByContinent(zone)).map(([continent, items]) => (
																		items.map(({ region, name }) => {
																			const regionIndex = zone.regions.findIndex(r => r.country === region.country);
																			const isActiveRegion = activeRegions[zone.key]?.country === region.country;
																			const hasStates = Object.keys(getAvailableStates(region.country)).length > 0;

																			return (
																				<div
																					key={region.country}
																					className={`ts-field-repeater ${!isActiveRegion ? 'collapsed' : ''}`}
																				>
																					<div
																						className="ts-repeater-head"
																						onClick={() => setActiveRegions(prev => ({
																							...prev,
																							[zone.key]: isActiveRegion ? null : region,
																						}))}
																					>
																						<label>{name}</label>
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

																					{isActiveRegion && (
																						<div className="form-field-grid medium">
																							{/* States Selection (if country has states) */}
																							{hasStates && (
																								<>
																									<div className="ts-form-group vx-1-1">
																										<label>
																											{__('States', 'voxel-fse')}
																											<span style={{ marginLeft: 'auto' }}>
																												<a href="#" onClick={(e) => { e.preventDefault(); selectAllStates(zone, region); }}>
																													{__('Select all', 'voxel-fse')}
																												</a>
																												{' / '}
																												<a href="#" onClick={(e) => { e.preventDefault(); updateRegion(zone, regionIndex, { states: [] }); }}>
																													{__('Unselect all', 'voxel-fse')}
																												</a>
																											</span>
																										</label>
																										<div className="ts-filter">
																											<select
																												onChange={(e) => {
																													handleStateSelect(zone, region, e.target.value);
																													e.target.value = '';
																												}}
																												value=""
																											>
																												<option value="">{__('Add state', 'voxel-fse')}</option>
																												{Object.entries(getAvailableStates(region.country)).map(([stateCode, stateData]) => (
																													<option
																														key={stateCode}
																														value={stateCode}
																														disabled={(region.states || []).includes(stateCode)}
																													>
																														{stateData.name || stateCode}
																													</option>
																												))}
																											</select>
																											<div className="ts-down-icon"></div>
																										</div>
																									</div>
																									<div className="ts-form-group vx-1-1">
																										{(region.states?.length ?? 0) > 0 ? (
																											<div className="flexify simplify-ul attribute-select">
																												{region.states?.map((stateCode, stateIndex) => (
																													<a key={stateCode} href="#" onClick={(e) => e.preventDefault()}>
																														{getStateName(region.country, stateCode)}
																														<span onClick={(e) => {
																															e.preventDefault();
																															e.stopPropagation();
																															removeState(zone, region, stateIndex);
																														}}>
																															{renderIcon(config.icons?.trash, 'las la-trash')}
																														</span>
																													</a>
																												))}
																											</div>
																										) : (
																											<label style={{ paddingBottom: 0 }}>
																												{__('No states selected. Leave empty to allow all states in this country.', 'voxel-fse')}
																											</label>
																										)}
																									</div>
																								</>
																							)}

																							{/* ZIP Code Filtering */}
																							<div className="ts-form-group vx-1-1 switch-slider">
																								<label>{__('Limit by ZIP codes', 'voxel-fse')}</label>
																								<div className="onoffswitch">
																									<input
																										type="checkbox"
																										className="onoffswitch-checkbox"
																										id={`switcher-zip-${region.country}`}
																										checked={region.zip_codes_enabled || false}
																										onChange={(e) => updateRegion(zone, regionIndex, { zip_codes_enabled: e.target.checked })}
																									/>
																									<label
																										className="onoffswitch-label"
																										htmlFor={`switcher-zip-${region.country}`}
																									></label>
																								</div>
																							</div>

																							{region.zip_codes_enabled && (
																								<div className="ts-form-group vx-1-1">
																									<label>{__('Limit to specific ZIP/postcodes in this country (one per line).', 'voxel-fse')}</label>
																									<textarea
																										className="ts-filter"
																										rows={3}
																										style={{ minHeight: '120px' }}
																										placeholder={__('Enter ZIP codes one per line', 'voxel-fse')}
																										value={region.zip_codes || ''}
																										onChange={(e) => updateRegion(zone, regionIndex, { zip_codes: e.target.value })}
																									/>
																								</div>
																							)}
																						</div>
																					)}
																				</div>
																			);
																		})
																	))}
																</div>
															</>
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

						{/* ============================================ */}
						{/* SHIPPING RATES SECTION */}
						{/* ============================================ */}
						<div className="ts-form-group">
							<label>{__('Shipping rates', 'voxel-fse')}</label>

							{rates.length > 0 && (
								<div className="ts-repeater-container">
									{rates.map((rate, rateIndex) => (
										<div
											key={rate.key}
											className={`ts-field-repeater ${activeRate !== rate ? 'collapsed' : ''}`}
											draggable
											onDragStart={(e) => handleRateDragStart(e, rateIndex)}
											onDragOver={(e) => handleRateDragOver(e, rateIndex)}
											onDragEnd={handleRateDragEnd}
											style={draggedRateIndex === rateIndex ? { opacity: 0.5 } : undefined}
										>
											<div
												className="ts-repeater-head ts-repeater-head--rate"
												onClick={() => setActiveRate(activeRate === rate ? null : rate)}
											>
												{/* Use rate icon for rate headers (Voxel uses box.svg fallback) */}
												{renderIcon(config.icons?.rate, 'las la-box')}
												<label>{rate.label || __('Untitled rate', 'voxel-fse')}</label>
												{getRateZones(rate).length > 0 && (
													<em>
														{getRateZones(rate).length === 1
															? __('1 zone', 'voxel-fse')
															: `${getRateZones(rate).length} ${__('zones', 'voxel-fse')}`
														}
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
																<a href="#" onClick={(e) => { e.preventDefault(); selectAllZonesForRate(rate); }}>
																	{__('Select all', 'voxel-fse')}
																</a>
																{' / '}
																<a href="#" onClick={(e) => { e.preventDefault(); unselectAllZonesForRate(rate); }}>
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
																			value={rate.free_shipping.minimum_order_amount ?? ''}
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

															{/* Free Shipping Delivery Estimate */}
															{renderDeliveryEstimateFields(rate, 'free_shipping')}
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
																		value={rate.fixed_rate.amount_per_unit ?? ''}
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

															{/* Shipping Classes (only for per_item and per_class) */}
															{rate.fixed_rate.calculation_method !== 'per_order' && Object.keys(shippingClasses).length > 0 && (
																<div className="ts-form-group vx-1-1">
																	<div className="medium form-field-grid">
																		<div className="ts-form-group vx-1-1 ui-heading-field">
																			<label>{__('Price by class', 'voxel-fse')}</label>
																		</div>

																		{/* Added shipping classes */}
																		{rate.fixed_rate.shipping_classes.map((shippingClass, classIndex) => {
																			const classData = shippingClasses[shippingClass.shipping_class];
																			if (!classData) return null;

																			return (
																				<>
																					<div key={`class-${classIndex}`} className="ts-form-group vx-1-2">
																						<label>{classData.label}</label>
																						<div className="input-container">
																							<input
																								className="ts-filter"
																								type="number"
																								step="any"
																								value={shippingClass.amount_per_unit ?? ''}
																								onChange={(e) => updateShippingClassPrice(
																									rate,
																									classIndex,
																									e.target.value ? parseFloat(e.target.value) : null
																								)}
																							/>
																							<span className="input-suffix">{primaryCurrency}</span>
																						</div>
																					</div>
																					<div key={`remove-${classIndex}`} className="ts-form-group vx-1-2">
																						<label>&nbsp;</label>
																						<a
																							href="#"
																							onClick={(e) => {
																								e.preventDefault();
																								removeShippingClassFromRate(rate, classIndex);
																							}}
																							className="ts-btn ts-btn-1 form-btn"
																						>
																							{renderIcon(config.icons?.trash, 'las la-trash')}
																							{__('Remove', 'voxel-fse')}
																						</a>
																					</div>
																				</>
																			);
																		})}

																		{/* Available classes to add */}
																		{getAvailableShippingClasses(rate).length > 0 && (
																			<div className="ts-form-group">
																				<div className="flexify simplify-ul attribute-select">
																					{getAvailableShippingClasses(rate).map((sc) => (
																						<a
																							key={sc.key}
																							href="#"
																							onClick={(e) => {
																								e.preventDefault();
																								addShippingClassToRate(rate, sc.key);
																							}}
																						>
																							{sc.label}
																						</a>
																					))}
																				</div>
																			</div>
																		)}
																	</div>
																</div>
															)}

															{/* Fixed Rate Delivery Estimate */}
															{renderDeliveryEstimateFields(rate, 'fixed_rate')}
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

						{/* ============================================ */}
						{/* BOTTOM ACTIONS */}
						{/* ============================================ */}
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
