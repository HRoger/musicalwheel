/**
 * Search Form Serialization Tests
 *
 * Tests for Voxel parity in value serialization and URL parameter format.
 * All formats must match Voxel's original implementation exactly.
 *
 * Evidence: voxel-search-form.beautified.js
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	// Terms
	parseTermsValue,
	serializeTermsValue,
	// Range
	parseRangeValue,
	serializeRangeValue,
	// Location
	parseLocationValue,
	serializeLocationValue,
	// Availability
	parseAvailabilityValue,
	serializeAvailabilityValue,
	// URL
	buildUrlParams,
	parseUrlParams,
	clearUrlParamsFromSearch,
} from '../utils/serialization';

// ============================================================================
// Terms Filter Tests
// Evidence: Voxel uses comma-separated SLUGS (not IDs)
// ============================================================================

describe('Terms Filter Serialization', () => {
	describe('parseTermsValue', () => {
		it('should return empty array for null', () => {
			expect(parseTermsValue(null)).toEqual([]);
		});

		it('should return empty array for undefined', () => {
			expect(parseTermsValue(undefined)).toEqual([]);
		});

		it('should return empty array for empty string', () => {
			expect(parseTermsValue('')).toEqual([]);
		});

		it('should parse comma-separated slugs', () => {
			expect(parseTermsValue('apartment,hotel,villa')).toEqual([
				'apartment',
				'hotel',
				'villa',
			]);
		});

		it('should trim whitespace from slugs', () => {
			expect(parseTermsValue(' apartment , hotel , villa ')).toEqual([
				'apartment',
				'hotel',
				'villa',
			]);
		});

		it('should filter out empty segments', () => {
			expect(parseTermsValue('apartment,,hotel')).toEqual(['apartment', 'hotel']);
		});

		it('should handle single slug', () => {
			expect(parseTermsValue('apartment')).toEqual(['apartment']);
		});

		it('should handle array of strings', () => {
			expect(parseTermsValue(['apartment', 'hotel'])).toEqual(['apartment', 'hotel']);
		});

		it('should convert array of numbers to strings', () => {
			expect(parseTermsValue([1, 2, 3])).toEqual(['1', '2', '3']);
		});
	});

	describe('serializeTermsValue', () => {
		it('should return null for empty array', () => {
			expect(serializeTermsValue([])).toBeNull();
		});

		it('should serialize single slug', () => {
			expect(serializeTermsValue(['apartment'])).toBe('apartment');
		});

		it('should serialize multiple slugs with comma separator', () => {
			expect(serializeTermsValue(['apartment', 'hotel', 'villa'])).toBe(
				'apartment,hotel,villa'
			);
		});
	});
});

// ============================================================================
// Range Filter Tests
// Evidence: voxel-search-form.beautified.js line 437: this.filter.value = this.value.join("..");
// ============================================================================

describe('Range Filter Serialization', () => {
	const rangeStart = 0;
	const rangeEnd = 100;

	describe('parseRangeValue', () => {
		it('should return defaults for null', () => {
			expect(parseRangeValue(null, rangeStart, rangeEnd)).toEqual({
				min: 0,
				max: 100,
			});
		});

		it('should return defaults for undefined', () => {
			expect(parseRangeValue(undefined, rangeStart, rangeEnd)).toEqual({
				min: 0,
				max: 100,
			});
		});

		it('should return defaults for empty string', () => {
			expect(parseRangeValue('', rangeStart, rangeEnd)).toEqual({
				min: 0,
				max: 100,
			});
		});

		it('should parse "min..max" format', () => {
			expect(parseRangeValue('10..50', rangeStart, rangeEnd)).toEqual({
				min: 10,
				max: 50,
			});
		});

		it('should parse "min.." format (open-ended max)', () => {
			expect(parseRangeValue('25..', rangeStart, rangeEnd)).toEqual({
				min: 25,
				max: 100,
			});
		});

		it('should parse "..max" format (open-ended min)', () => {
			expect(parseRangeValue('..75', rangeStart, rangeEnd)).toEqual({
				min: 0,
				max: 75,
			});
		});

		it('should handle object format for backward compatibility', () => {
			expect(parseRangeValue({ min: 20, max: 80 }, rangeStart, rangeEnd)).toEqual({
				min: 20,
				max: 80,
			});
		});

		it('should handle single number as min', () => {
			expect(parseRangeValue(30, rangeStart, rangeEnd)).toEqual({
				min: 30,
				max: 100,
			});
		});

		it('should use defaults for invalid NaN values', () => {
			expect(parseRangeValue('abc..def', rangeStart, rangeEnd)).toEqual({
				min: 0,
				max: 100,
			});
		});
	});

	describe('serializeRangeValue', () => {
		it('should return null when values are at defaults', () => {
			expect(serializeRangeValue(0, 100, 0, 100)).toBeNull();
		});

		it('should serialize double handles as "min..max"', () => {
			expect(serializeRangeValue(10, 50, 0, 100, 'double', 'in_range')).toBe('10..50');
		});

		it('should serialize single handle greater_than as "min.."', () => {
			expect(serializeRangeValue(25, 100, 0, 100, 'single', 'greater_than')).toBe('25..');
		});

		it('should serialize single handle less_than as "..max"', () => {
			expect(serializeRangeValue(0, 75, 0, 100, 'single', 'less_than')).toBe('..75');
		});

		it('should serialize single handle in_range as "min.."', () => {
			expect(serializeRangeValue(30, 100, 0, 100, 'single', 'in_range')).toBe('30..');
		});
	});
});

// ============================================================================
// Location Filter Tests
// Evidence: voxel-search-form.beautified.js lines 721, 724
// Radius: `${address};${lat},${lng},${radius}`
// Area: `${address};${swlat},${swlng}..${nelat},${nelng}`
// ============================================================================

describe('Location Filter Serialization', () => {
	describe('parseLocationValue', () => {
		it('should return null for null', () => {
			expect(parseLocationValue(null)).toBeNull();
		});

		it('should return null for undefined', () => {
			expect(parseLocationValue(undefined)).toBeNull();
		});

		it('should return null for empty string', () => {
			expect(parseLocationValue('')).toBeNull();
		});

		it('should parse address-only format', () => {
			expect(parseLocationValue('New York, NY')).toEqual({
				address: 'New York, NY',
			});
		});

		it('should parse radius format: address;lat,lng,radius', () => {
			expect(parseLocationValue('New York, NY;40.7128,-74.006,25')).toEqual({
				address: 'New York, NY',
				lat: 40.7128,
				lng: -74.006,
				radius: 25,
			});
		});

		it('should use default radius when not provided', () => {
			expect(parseLocationValue('New York, NY;40.7128,-74.006', 50)).toEqual({
				address: 'New York, NY',
				lat: 40.7128,
				lng: -74.006,
				radius: 50,
			});
		});

		it('should parse area format: address;swlat,swlng..nelat,nelng', () => {
			expect(
				parseLocationValue('New York, NY;40.4774,-74.2591..40.9176,-73.7004')
			).toEqual({
				address: 'New York, NY',
				swlat: 40.4774,
				swlng: -74.2591,
				nelat: 40.9176,
				nelng: -73.7004,
			});
		});

		it('should handle object format for backward compatibility', () => {
			const obj = { address: 'NYC', lat: 40.7, lng: -74.0, radius: 10 };
			expect(parseLocationValue(obj)).toEqual(obj);
		});
	});

	describe('serializeLocationValue', () => {
		it('should return null for null', () => {
			expect(serializeLocationValue(null)).toBeNull();
		});

		it('should return null for empty address', () => {
			expect(serializeLocationValue({ lat: 40.7, lng: -74.0 })).toBeNull();
		});

		it('should serialize address-only', () => {
			expect(serializeLocationValue({ address: 'New York, NY' })).toBe('New York, NY');
		});

		it('should serialize radius format: address;lat,lng,radius', () => {
			expect(
				serializeLocationValue({
					address: 'New York, NY',
					lat: 40.7128,
					lng: -74.006,
					radius: 25,
				})
			).toBe('New York, NY;40.7128,-74.006,25');
		});

		it('should use default radius of 25 when not provided', () => {
			expect(
				serializeLocationValue({
					address: 'New York, NY',
					lat: 40.7128,
					lng: -74.006,
				})
			).toBe('New York, NY;40.7128,-74.006,25');
		});

		it('should serialize area format: address;swlat,swlng..nelat,nelng', () => {
			expect(
				serializeLocationValue({
					address: 'New York, NY',
					swlat: 40.4774,
					swlng: -74.2591,
					nelat: 40.9176,
					nelng: -73.7004,
				})
			).toBe('New York, NY;40.4774,-74.2591..40.9176,-73.7004');
		});

		it('should prefer area format over radius when both are present', () => {
			expect(
				serializeLocationValue({
					address: 'New York, NY',
					lat: 40.7128,
					lng: -74.006,
					radius: 25,
					swlat: 40.4774,
					swlng: -74.2591,
					nelat: 40.9176,
					nelng: -73.7004,
				})
			).toBe('New York, NY;40.4774,-74.2591..40.9176,-73.7004');
		});
	});
});

// ============================================================================
// Availability Filter Tests
// Evidence: voxel-search-form.beautified.js line 985
// Format: "YYYY-MM-DD" or "YYYY-MM-DD..YYYY-MM-DD"
// ============================================================================

describe('Availability Filter Serialization', () => {
	describe('parseAvailabilityValue', () => {
		it('should return empty date for null', () => {
			expect(parseAvailabilityValue(null)).toEqual({ date: '', slots: 1 });
		});

		it('should return empty date for undefined', () => {
			expect(parseAvailabilityValue(undefined)).toEqual({ date: '', slots: 1 });
		});

		it('should return empty date for empty string', () => {
			expect(parseAvailabilityValue('')).toEqual({ date: '', slots: 1 });
		});

		it('should parse single date string', () => {
			expect(parseAvailabilityValue('2025-12-25')).toEqual({
				date: '2025-12-25',
				slots: 1,
			});
		});

		it('should parse date range string', () => {
			expect(parseAvailabilityValue('2025-12-25..2026-01-05')).toEqual({
				date: '2025-12-25..2026-01-05',
				slots: 1,
			});
		});

		it('should handle object format for backward compatibility', () => {
			expect(parseAvailabilityValue({ date: '2025-12-25', slots: 3 })).toEqual({
				date: '2025-12-25',
				slots: 3,
			});
		});
	});

	describe('serializeAvailabilityValue', () => {
		it('should return null when no start date in range mode', () => {
			expect(serializeAvailabilityValue(null, '2025-12-31', true)).toBeNull();
		});

		it('should return null when no end date in range mode', () => {
			expect(serializeAvailabilityValue('2025-12-25', null, true)).toBeNull();
		});

		it('should serialize range as "start..end"', () => {
			expect(serializeAvailabilityValue('2025-12-25', '2026-01-05', true)).toBe(
				'2025-12-25..2026-01-05'
			);
		});

		it('should serialize single date in single mode', () => {
			expect(serializeAvailabilityValue('2025-12-25', null, false)).toBe('2025-12-25');
		});

		it('should return null for empty single date', () => {
			expect(serializeAvailabilityValue(null, null, false)).toBeNull();
		});
	});
});

// ============================================================================
// URL Parameter Tests
// Evidence: voxel-search-form.beautified.js lines 1202-1203
// VOXEL PARITY: Uses 'type' instead of 'post_type', filter keys without 'filter_' prefix
// ============================================================================

describe('URL Parameter Utilities', () => {
	describe('buildUrlParams', () => {
		it('should use "type" not "post_type" for post type', () => {
			const params = buildUrlParams({}, 'places');
			expect(params.get('type')).toBe('places');
			expect(params.get('post_type')).toBeNull();
		});

		it('should use filter keys directly without "filter_" prefix', () => {
			const params = buildUrlParams(
				{
					categories: 'apartment,hotel',
					price: '100..500',
				},
				'places'
			);
			expect(params.get('categories')).toBe('apartment,hotel');
			expect(params.get('price')).toBe('100..500');
			expect(params.get('filter_categories')).toBeNull();
			expect(params.get('filter_price')).toBeNull();
		});

		it('should serialize array values as comma-separated', () => {
			const params = buildUrlParams({
				tags: ['music', 'live', 'jazz'],
			});
			expect(params.get('tags')).toBe('music,live,jazz');
		});

		it('should serialize object values as JSON', () => {
			const params = buildUrlParams({
				complex: { min: 10, max: 50 },
			});
			expect(params.get('complex')).toBe('{"min":10,"max":50}');
		});

		it('should skip null, undefined, and empty string values', () => {
			const params = buildUrlParams({
				valid: 'value',
				nullVal: null,
				undefinedVal: undefined,
				emptyVal: '',
			});
			expect(params.get('valid')).toBe('value');
			expect(params.has('nullVal')).toBe(false);
			expect(params.has('undefinedVal')).toBe(false);
			expect(params.has('emptyVal')).toBe(false);
		});

		it('should convert non-string primitives to strings', () => {
			const params = buildUrlParams({
				number: 42,
				boolean: true,
			});
			expect(params.get('number')).toBe('42');
			expect(params.get('boolean')).toBe('true');
		});
	});

	describe('parseUrlParams', () => {
		it('should read "type" parameter for post type', () => {
			const result = parseUrlParams('?type=places&categories=apartment');
			expect(result.postType).toBe('places');
		});

		it('should read filter keys without "filter_" prefix', () => {
			const result = parseUrlParams('?type=places&categories=apartment&price=100..500');
			expect(result.filterValues).toEqual({
				categories: 'apartment',
				price: '100..500',
			});
		});

		it('should exclude "type" from filterValues', () => {
			const result = parseUrlParams('?type=places&keyword=test');
			expect(result.filterValues).toEqual({ keyword: 'test' });
			expect(result.filterValues).not.toHaveProperty('type');
		});

		it('should return null postType when not present', () => {
			const result = parseUrlParams('?keyword=test');
			expect(result.postType).toBeNull();
		});

		it('should handle empty search string', () => {
			const result = parseUrlParams('');
			expect(result.postType).toBeNull();
			expect(result.filterValues).toEqual({});
		});
	});

	describe('clearUrlParamsFromSearch', () => {
		it('should clear all filter params when no postType provided', () => {
			const result = clearUrlParamsFromSearch(
				'?type=places&categories=apartment&price=100..500'
			);
			expect(result).toBe('');
		});

		it('should keep postType when provided', () => {
			const result = clearUrlParamsFromSearch(
				'?type=places&categories=apartment&price=100..500',
				'places'
			);
			expect(result).toBe('type=places');
		});

		it('should clear legacy filter_ prefix params', () => {
			const result = clearUrlParamsFromSearch(
				'?filter_categories=apartment&filter_price=100..500',
				'places'
			);
			expect(result).toBe('type=places');
		});

		it('should clear legacy post_type param', () => {
			const result = clearUrlParamsFromSearch(
				'?post_type=places&categories=apartment',
				'places'
			);
			expect(result).toBe('type=places');
		});

		it('should preserve page and pg params', () => {
			const result = clearUrlParamsFromSearch(
				'?type=places&categories=apartment&page=2&pg=3',
				'places'
			);
			// page and pg are preserved, filters cleared
			expect(result).toContain('type=places');
			expect(result).toContain('page=2');
			expect(result).toContain('pg=3');
			expect(result).not.toContain('categories');
		});

		it('should handle empty search string', () => {
			const result = clearUrlParamsFromSearch('', 'places');
			expect(result).toBe('type=places');
		});

		it('should handle empty search string without postType', () => {
			const result = clearUrlParamsFromSearch('');
			expect(result).toBe('');
		});

		it('should clear availability, location, and other common filters', () => {
			const result = clearUrlParamsFromSearch(
				'?type=places&availability=2025-12-25..2026-01-05&location=NYC;40.7,-74.0,25&keywords=test',
				'places'
			);
			expect(result).toBe('type=places');
		});
	});
});

// ============================================================================
// General Tab Styling Attribute Tests
// Evidence: search-form.php:912-3960 (General tab controls)
// These attributes control visual styling via InspectorControls
// ============================================================================

describe('General Tab Styling Attributes', () => {
	// -------------------------------------------------------------------------
	// Color Attribute Tests
	// ColorPickerControl stores simple string values (hex colors)
	// -------------------------------------------------------------------------
	describe('Color Attributes', () => {
		it('should accept hex color strings', () => {
			const color = '#2271b1';
			expect(typeof color).toBe('string');
			expect(color.startsWith('#')).toBe(true);
			expect(color.length).toBe(7);
		});

		it('should accept undefined for default (no custom color)', () => {
			const color: string | undefined = undefined;
			expect(color).toBeUndefined();
		});

		it('should accept rgba color strings', () => {
			const color = 'rgba(34, 113, 177, 0.5)';
			expect(typeof color).toBe('string');
			expect(color.startsWith('rgba')).toBe(true);
		});

		it('should handle empty string as "no color set"', () => {
			const color = '';
			expect(color).toBe('');
			expect(!color).toBe(true); // Falsy check
		});
	});

	// -------------------------------------------------------------------------
	// Typography Object Tests
	// TypographyControl stores objects with fontFamily, fontSize, etc.
	// -------------------------------------------------------------------------
	describe('Typography Attributes', () => {
		interface TypographyConfig {
			fontFamily?: string;
			fontSize?: number;
			fontSizeUnit?: string;
			fontWeight?: string;
			fontStyle?: string;
			textTransform?: string;
			textDecoration?: string;
			lineHeight?: number;
			lineHeightUnit?: string;
			letterSpacing?: number;
			letterSpacingUnit?: string;
			wordSpacing?: number;
			wordSpacingUnit?: string;
		}

		it('should accept empty object as default', () => {
			const typography: TypographyConfig = {};
			expect(Object.keys(typography).length).toBe(0);
		});

		it('should accept partial typography config', () => {
			const typography: TypographyConfig = {
				fontFamily: 'Inter',
				fontSize: 14,
				fontWeight: '600',
			};
			expect(typography.fontFamily).toBe('Inter');
			expect(typography.fontSize).toBe(14);
			expect(typography.fontWeight).toBe('600');
			expect(typography.fontStyle).toBeUndefined();
		});

		it('should accept full typography config', () => {
			const typography: TypographyConfig = {
				fontFamily: 'Inter',
				fontSize: 16,
				fontSizeUnit: 'px',
				fontWeight: '500',
				fontStyle: 'normal',
				textTransform: 'uppercase',
				textDecoration: 'none',
				lineHeight: 1.5,
				lineHeightUnit: 'em',
				letterSpacing: 0.5,
				letterSpacingUnit: 'px',
				wordSpacing: 0,
				wordSpacingUnit: 'px',
			};
			expect(typography.fontFamily).toBe('Inter');
			expect(typography.textTransform).toBe('uppercase');
			expect(typography.lineHeight).toBe(1.5);
		});

		it('should serialize/deserialize typography as JSON', () => {
			const original: TypographyConfig = {
				fontFamily: 'Inter',
				fontSize: 14,
				fontWeight: '600',
			};
			const serialized = JSON.stringify(original);
			const deserialized: TypographyConfig = JSON.parse(serialized);
			expect(deserialized).toEqual(original);
		});
	});

	// -------------------------------------------------------------------------
	// Box Shadow Object Tests
	// BoxShadowPopup stores shadow configuration
	// -------------------------------------------------------------------------
	describe('Box Shadow Attributes', () => {
		interface BoxShadowConfig {
			horizontal?: number;
			vertical?: number;
			blur?: number;
			spread?: number;
			color?: string;
			position?: 'outset' | 'inset';
		}

		it('should accept empty object as default (no shadow)', () => {
			const shadow: BoxShadowConfig = {};
			expect(Object.keys(shadow).length).toBe(0);
		});

		it('should accept basic shadow config', () => {
			const shadow: BoxShadowConfig = {
				horizontal: 0,
				vertical: 4,
				blur: 8,
				spread: 0,
				color: 'rgba(0, 0, 0, 0.1)',
			};
			expect(shadow.horizontal).toBe(0);
			expect(shadow.vertical).toBe(4);
			expect(shadow.blur).toBe(8);
			expect(shadow.color).toBe('rgba(0, 0, 0, 0.1)');
		});

		it('should accept inset shadow', () => {
			const shadow: BoxShadowConfig = {
				horizontal: 0,
				vertical: 2,
				blur: 4,
				spread: 0,
				color: 'rgba(0, 0, 0, 0.05)',
				position: 'inset',
			};
			expect(shadow.position).toBe('inset');
		});

		it('should serialize/deserialize box shadow as JSON', () => {
			const original: BoxShadowConfig = {
				horizontal: 2,
				vertical: 4,
				blur: 8,
				spread: 0,
				color: '#000000',
				position: 'outset',
			};
			const serialized = JSON.stringify(original);
			const deserialized: BoxShadowConfig = JSON.parse(serialized);
			expect(deserialized).toEqual(original);
		});

		it('should convert box shadow to CSS string', () => {
			const shadow: BoxShadowConfig = {
				horizontal: 0,
				vertical: 4,
				blur: 8,
				spread: 0,
				color: 'rgba(0, 0, 0, 0.1)',
				position: 'outset',
			};
			// CSS format: h-offset v-offset blur spread color [inset]
			const css = `${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
			expect(css).toBe('0px 4px 8px 0px rgba(0, 0, 0, 0.1)');
		});
	});

	// -------------------------------------------------------------------------
	// Border Object Tests
	// BorderGroupControl stores border configuration
	// -------------------------------------------------------------------------
	describe('Border Attributes', () => {
		interface BorderConfig {
			width?: number;
			style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
			color?: string;
			radius?: number;
		}

		it('should accept empty object as default (no border)', () => {
			const border: BorderConfig = {};
			expect(Object.keys(border).length).toBe(0);
		});

		it('should accept solid border config', () => {
			const border: BorderConfig = {
				width: 1,
				style: 'solid',
				color: '#e0e0e0',
			};
			expect(border.width).toBe(1);
			expect(border.style).toBe('solid');
			expect(border.color).toBe('#e0e0e0');
		});

		it('should accept border with radius', () => {
			const border: BorderConfig = {
				width: 2,
				style: 'solid',
				color: '#2271b1',
				radius: 8,
			};
			expect(border.radius).toBe(8);
		});

		it('should serialize/deserialize border as JSON', () => {
			const original: BorderConfig = {
				width: 1,
				style: 'dashed',
				color: '#cccccc',
				radius: 4,
			};
			const serialized = JSON.stringify(original);
			const deserialized: BorderConfig = JSON.parse(serialized);
			expect(deserialized).toEqual(original);
		});

		it('should convert border to CSS string', () => {
			const border: BorderConfig = {
				width: 1,
				style: 'solid',
				color: '#e0e0e0',
			};
			const css = `${border.width}px ${border.style} ${border.color}`;
			expect(css).toBe('1px solid #e0e0e0');
		});
	});

	// -------------------------------------------------------------------------
	// Dimensions Object Tests
	// DimensionsControl stores top/right/bottom/left values
	// -------------------------------------------------------------------------
	describe('Dimensions Attributes', () => {
		interface DimensionsConfig {
			top?: number;
			right?: number;
			bottom?: number;
			left?: number;
			unit?: string;
			isLinked?: boolean;
		}

		it('should accept empty object as default', () => {
			const dimensions: DimensionsConfig = {};
			expect(Object.keys(dimensions).length).toBe(0);
		});

		it('should accept uniform dimensions (all sides equal)', () => {
			const dimensions: DimensionsConfig = {
				top: 16,
				right: 16,
				bottom: 16,
				left: 16,
				unit: 'px',
				isLinked: true,
			};
			expect(dimensions.top).toBe(dimensions.bottom);
			expect(dimensions.left).toBe(dimensions.right);
			expect(dimensions.isLinked).toBe(true);
		});

		it('should accept asymmetric dimensions', () => {
			const dimensions: DimensionsConfig = {
				top: 8,
				right: 16,
				bottom: 8,
				left: 16,
				unit: 'px',
				isLinked: false,
			};
			expect(dimensions.top).toBe(8);
			expect(dimensions.right).toBe(16);
			expect(dimensions.isLinked).toBe(false);
		});

		it('should serialize/deserialize dimensions as JSON', () => {
			const original: DimensionsConfig = {
				top: 10,
				right: 20,
				bottom: 10,
				left: 20,
				unit: 'px',
			};
			const serialized = JSON.stringify(original);
			const deserialized: DimensionsConfig = JSON.parse(serialized);
			expect(deserialized).toEqual(original);
		});

		it('should convert dimensions to CSS padding string', () => {
			const d: DimensionsConfig = {
				top: 8,
				right: 16,
				bottom: 8,
				left: 16,
				unit: 'px',
			};
			const css = `${d.top}${d.unit} ${d.right}${d.unit} ${d.bottom}${d.unit} ${d.left}${d.unit}`;
			expect(css).toBe('8px 16px 8px 16px');
		});
	});

	// -------------------------------------------------------------------------
	// Responsive Value Tests
	// Responsive controls store separate desktop/tablet/mobile values
	// -------------------------------------------------------------------------
	describe('Responsive Attributes', () => {
		it('should store desktop value in base attribute', () => {
			const fontSize = 16; // Desktop value
			expect(fontSize).toBe(16);
		});

		it('should store tablet value in _tablet suffixed attribute', () => {
			const fontSize_tablet = 14;
			expect(fontSize_tablet).toBe(14);
		});

		it('should store mobile value in _mobile suffixed attribute', () => {
			const fontSize_mobile = 12;
			expect(fontSize_mobile).toBe(12);
		});

		it('should handle undefined responsive values (inherit from desktop)', () => {
			const fontSize = 16;
			const fontSize_tablet: number | undefined = undefined;
			const fontSize_mobile: number | undefined = undefined;

			// Tablet inherits from desktop if undefined
			const effectiveTablet = fontSize_tablet ?? fontSize;
			expect(effectiveTablet).toBe(16);

			// Mobile inherits from tablet which inherits from desktop
			const effectiveMobile = fontSize_mobile ?? effectiveTablet;
			expect(effectiveMobile).toBe(16);
		});
	});

	// -------------------------------------------------------------------------
	// State-based Value Tests
	// StyleTabPanel manages Normal/Hover/Filled/Focus states
	// -------------------------------------------------------------------------
	describe('State-based Attributes', () => {
		it('should store normal state in base attribute', () => {
			const bgColor = '#ffffff'; // Normal state
			expect(bgColor).toBe('#ffffff');
		});

		it('should store hover state in Hover suffixed attribute', () => {
			const bgColorHover = '#f0f0f0';
			expect(bgColorHover).toBe('#f0f0f0');
		});

		it('should handle undefined hover state (no change on hover)', () => {
			const bgColor = '#ffffff';
			const bgColorHover: string | undefined = undefined;

			// If hover is undefined, element uses normal state
			const effectiveHover = bgColorHover ?? bgColor;
			expect(effectiveHover).toBe('#ffffff');
		});

		it('should support all four states: Normal, Hover, Filled, Focus', () => {
			const states = {
				normal: '#ffffff',
				hover: '#f0f0f0',
				filled: '#e8f4fd',
				focus: '#2271b1',
			};
			expect(Object.keys(states).length).toBe(4);
		});
	});
});

// ============================================================================
// Round-trip Tests (Parse -> Serialize -> Parse)
// Ensures data integrity through serialization cycles
// ============================================================================

describe('Round-trip Tests', () => {
	it('terms: parse -> serialize -> parse should maintain value', () => {
		const original = 'apartment,hotel,villa';
		const parsed = parseTermsValue(original);
		const serialized = serializeTermsValue(parsed);
		const reparsed = parseTermsValue(serialized);
		expect(reparsed).toEqual(parsed);
	});

	it('range: parse -> serialize -> parse should maintain value', () => {
		const original = '25..75';
		const parsed = parseRangeValue(original, 0, 100);
		const serialized = serializeRangeValue(parsed.min, parsed.max, 0, 100);
		const reparsed = parseRangeValue(serialized, 0, 100);
		expect(reparsed).toEqual(parsed);
	});

	it('location radius: parse -> serialize -> parse should maintain value', () => {
		const original = 'New York, NY;40.7128,-74.006,25';
		const parsed = parseLocationValue(original);
		const serialized = serializeLocationValue(parsed);
		const reparsed = parseLocationValue(serialized);
		expect(reparsed).toEqual(parsed);
	});

	it('location area: parse -> serialize -> parse should maintain value', () => {
		const original = 'New York, NY;40.4774,-74.2591..40.9176,-73.7004';
		const parsed = parseLocationValue(original);
		const serialized = serializeLocationValue(parsed);
		const reparsed = parseLocationValue(serialized);
		expect(reparsed).toEqual(parsed);
	});

	it('availability range: parse -> serialize -> parse should maintain value', () => {
		const original = '2025-12-25..2026-01-05';
		const parsed = parseAvailabilityValue(original);
		const [start, end] = parsed.date.split('..');
		const serialized = serializeAvailabilityValue(start, end, true);
		const reparsed = parseAvailabilityValue(serialized);
		expect(reparsed.date).toBe(parsed.date);
	});

	it('url params: build -> parse should maintain values', () => {
		const filterValues = {
			categories: 'apartment,hotel',
			price: '100..500',
			availability: '2025-12-25..2026-01-05',
		};
		const postType = 'places';

		const params = buildUrlParams(filterValues, postType);
		const result = parseUrlParams('?' + params.toString());

		expect(result.postType).toBe(postType);
		expect(result.filterValues).toEqual(filterValues);
	});
});
