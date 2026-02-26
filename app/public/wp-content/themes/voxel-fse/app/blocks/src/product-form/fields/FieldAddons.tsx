/**
 * FieldAddons Component
 *
 * Wrapper component that manages all product addons.
 * Delegates to specific addon type components and provides
 * pricing calculation helpers.
 *
 * Evidence: voxel-product-form.beautified.js lines 1028-1193
 *
 * @package VoxelFSE
 */

import { useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
	AddonSwitcher,
	AddonNumeric,
	AddonSelect,
	AddonMultiselect,
	AddonCustomSelect,
	AddonCustomMultiselect,
} from '../addons';
import type {
	AddonConfig,
	AddonValue,
	AddonSwitcherValue,
	AddonNumericValue,
	AddonSelectValue,
	AddonMultiselectValue,
	AddonCustomSelectValue,
	AddonCustomMultiselectValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
	ExtendedProductFormConfig,
	SearchContext,
	FieldAddonsRef,
} from '../types';

export interface FieldAddonsProps {
	config: ExtendedProductFormConfig;
	values: Record<string, AddonValue>;
	onValueChange: ( addonKey: string, value: AddonValue ) => void;
	bookingValue?: {
		date?: string;
		start_date?: string;
		end_date?: string;
	};
	bookingRangeLength?: number;
	searchContext?: SearchContext;
}

/**
 * Normalize addons from object to array
 * Evidence: Voxel may return addons as object keyed by ID
 */
function normalizeAddonsConfig( addons: Record<string, AddonConfig> | AddonConfig[] | undefined ): AddonConfig[] {
	if ( ! addons ) return [];
	if ( Array.isArray( addons ) ) return addons;
	return Object.entries( addons ).map( ( [ key, addon ] ) => ( {
		...addon,
		key: addon.key || key,
	} ) );
}

/**
 * FieldAddons - Wrapper for all addon components
 *
 * Responsibilities:
 * - Renders addon components by type
 * - Provides getRepeatConfig for date range bookings
 * - Provides getCustomPrice for date-based pricing
 * - Collects pricing summaries from all addons
 */
const FieldAddons = forwardRef<FieldAddonsRef, FieldAddonsProps>( function FieldAddons( {
	config,
	values,
	onValueChange,
	bookingValue,
	bookingRangeLength,
	searchContext,
}, ref ) {
	const addonsField = config.props?.fields?.[ 'form-addons' ];
	const addons = useMemo( () => {
		return normalizeAddonsConfig( addonsField?.props.addons );
	}, [ addonsField ] );

	const l10n = addonsField?.props.l10n ?? {};
	const productMode = config.settings?.product_mode ?? 'regular';
	const customPrices = config.props?.custom_prices;

	/**
	 * Get custom price configuration for a specific date
	 *
	 * Checks custom_prices.list for matching conditions:
	 * - date: exact date match
	 * - date_range: date within range
	 * - day_of_week: specific weekday
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1888-1924
	 */
	const getCustomPriceForDate = useCallback( ( date: Date ): CustomPriceConfig | null => {
		if ( ! customPrices?.enabled || ! customPrices.list?.length ) {
			return null;
		}

		const dateStr = date.toISOString().split( 'T' )[ 0 ];
		const dayOfWeek = date.getUTCDay(); // 0 = Sunday

		for ( const priceConfig of customPrices.list ) {
			for ( const condition of priceConfig.conditions ) {
				if ( condition.type === 'date' && condition.date === dateStr ) {
					return priceConfig;
				}

				if ( condition.type === 'date_range' && condition.range ) {
					const fromDate = new Date( condition.range.from + 'T00:00:00Z' );
					const toDate = new Date( condition.range.to + 'T00:00:00Z' );
					if ( date >= fromDate && date <= toDate ) {
						return priceConfig;
					}
				}

				if ( condition.type === 'day_of_week' && condition.days ) {
					const dayNames = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
					if ( condition.days.includes( dayNames[ dayOfWeek ] ) ) {
						return priceConfig;
					}
				}
			}
		}

		return null;
	}, [ customPrices ] );

	/**
	 * Get custom price for current context
	 *
	 * For booking mode: uses booking.date if single_day or timeslots
	 * For regular mode: uses today's date
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1095-1113
	 */
	const getCustomPrice = useCallback( ( _addon: AddonConfig ): CustomPriceConfig | null => {
		const bookingField = config.props?.fields?.[ 'form-booking' ];

		if ( productMode === 'booking' ) {
			if ( bookingField && [ 'single_day', 'timeslots' ].includes( bookingField.props?.mode ?? '' ) ) {
				if ( bookingValue?.date ) {
					return getCustomPriceForDate( new Date( bookingValue.date + 'T00:00:00Z' ) );
				}
			}
			return null;
		}

		if ( productMode === 'regular' ) {
			const todayDate = config.props?.today?.date;
			if ( todayDate ) {
				return getCustomPriceForDate( new Date( todayDate + 'T00:00:00Z' ) );
			}
		}

		return null;
	}, [ productMode, bookingValue, config.props, getCustomPriceForDate ] );

	/**
	 * Get repeat configuration for date range bookings
	 *
	 * Returns null if:
	 * - Not in booking mode with date_range
	 * - Addon doesn't have repeat enabled
	 * - Missing start/end dates
	 * - Range length < 1
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1118-1150
	 */
	const getRepeatConfig = useCallback( ( addon: AddonConfig ): RepeatConfig | null => {
		const bookingField = config.props?.fields?.[ 'form-booking' ];

		if ( ! bookingField || bookingField.props?.mode !== 'date_range' || ! addon.repeat ) {
			return null;
		}

		if ( ! bookingValue?.start_date || ! bookingValue?.end_date ) {
			return null;
		}

		const length = bookingRangeLength ?? 0;
		if ( length < 1 ) return null;

		const countMode = bookingField.props?.count_mode ?? 'nights';
		let label = '';

		if ( length > 1 ) {
			if ( countMode === 'nights' ) {
				label = ` (${ ( l10n.amount_nights ?? '@count nights' ).replace( '@count', String( length ) ) })`;
			} else {
				label = ` (${ ( l10n.amount_days ?? '@count days' ).replace( '@count', String( length ) ) })`;
			}
		}

		return {
			length,
			label,
			start: bookingValue.start_date,
			end: bookingValue.end_date,
			count_mode: countMode as 'nights' | 'days',
		};
	}, [ config.props, bookingValue, bookingRangeLength, l10n ] );

	/**
	 * Get pricing summary from all addon components
	 *
	 * Returns array of { label, amount } for each active addon.
	 * Multiselect addons may return multiple summaries.
	 *
	 * Evidence: voxel-product-form.beautified.js lines 1073-1090
	 */
	const getPricingSummary = useCallback( (): AddonPricingSummary[] => {
		const summaries: AddonPricingSummary[] = [];

		addons.forEach( ( addon ) => {
			const value = values[ addon.key ];
			if ( ! value ) return;

			let summary: AddonPricingSummary | AddonPricingSummary[] | null = null;

			switch ( addon.type ) {
				case 'switcher':
					summary = AddonSwitcher.getPricingSummary(
						addon,
						value as AddonSwitcherValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;

				case 'numeric':
					summary = AddonNumeric.getPricingSummary(
						addon,
						value as AddonNumericValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;

				case 'select':
					summary = AddonSelect.getPricingSummary(
						addon,
						value as AddonSelectValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;

				case 'multiselect':
					summary = AddonMultiselect.getPricingSummary(
						addon,
						value as AddonMultiselectValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;

				case 'custom-select':
					summary = AddonCustomSelect.getPricingSummary(
						addon,
						value as AddonCustomSelectValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;

				case 'custom-multiselect':
					summary = AddonCustomMultiselect.getPricingSummary(
						addon,
						value as AddonCustomMultiselectValue,
						getRepeatConfig,
						getCustomPrice,
						getCustomPriceForDate
					);
					break;
			}

			if ( summary !== null ) {
				if ( Array.isArray( summary ) ) {
					summaries.push( ...summary );
				} else {
					summaries.push( summary );
				}
			}
		} );

		return summaries;
	}, [ addons, values, getRepeatConfig, getCustomPrice, getCustomPriceForDate ] );

	// Expose getPricingSummary to parent via ref
	useImperativeHandle( ref, () => ( {
		getPricingSummary,
	} ), [ getPricingSummary ] );

	/**
	 * Render addon component by type
	 */
	const renderAddon = ( addon: AddonConfig ) => {
		const value = values[ addon.key ];
		const handleChange = ( newValue: AddonValue ) => {
			onValueChange( addon.key, newValue );
		};

		const commonProps = {
			addon,
			getRepeatConfig,
			getCustomPrice,
			getCustomPriceForDate,
		};

		switch ( addon.type ) {
			case 'switcher':
				return (
					<AddonSwitcher
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonSwitcherValue ) ?? { enabled: false } }
						onChange={ handleChange as ( v: AddonSwitcherValue ) => void }
						searchContext={ searchContext }
					/>
				);

			case 'numeric':
				return (
					<AddonNumeric
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonNumericValue ) ?? { quantity: null } }
						onChange={ handleChange as ( v: AddonNumericValue ) => void }
						searchContext={ searchContext }
					/>
				);

			case 'select':
				return (
					<AddonSelect
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonSelectValue ) ?? { selected: null } }
						onChange={ handleChange as ( v: AddonSelectValue ) => void }
					/>
				);

			case 'multiselect':
				return (
					<AddonMultiselect
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonMultiselectValue ) ?? { selected: [] } }
						onChange={ handleChange as ( v: AddonMultiselectValue ) => void }
					/>
				);

			case 'custom-select':
				return (
					<AddonCustomSelect
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonCustomSelectValue ) ?? { selected: { item: null, quantity: 1 } } }
						onChange={ handleChange as ( v: AddonCustomSelectValue ) => void }
					/>
				);

			case 'custom-multiselect':
				return (
					<AddonCustomMultiselect
						key={ addon.key }
						{ ...commonProps }
						value={ ( value as AddonCustomMultiselectValue ) ?? { selected: [] } }
						onChange={ handleChange as ( v: AddonCustomMultiselectValue ) => void }
					/>
				);

			default:
				return null;
		}
	};

	if ( addons.length === 0 ) {
		return null;
	}

	return (
		<div className="ts-form-group ts-field-addons">
			{ addons.map( renderAddon ) }
		</div>
	);
} );

export default FieldAddons;
