/**
 * Search Form Value Serialization Utilities
 *
 * Extracted from filter components for testability.
 * All serialization formats match Voxel's API exactly.
 *
 * Evidence: voxel-search-form.beautified.js
 *
 * @package VoxelFSE
 */

// ============================================================================
// Terms Filter Serialization
// Evidence: voxel-search-form.beautified.js uses comma-separated slugs
// ============================================================================

/**
 * Parse Voxel terms value - comma-separated SLUGS
 * Evidence: themes/voxel/app/post-types/filters/terms-filter.php uses slugs
 */
export function parseTermsValue(value: unknown): string[] {
	if (value === null || value === undefined || value === '') {
		return [];
	}

	// Handle string format (Voxel API format - comma-separated slugs)
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((slug) => slug.trim())
			.filter((slug) => slug !== '');
	}

	// Handle array of strings (slugs)
	if (Array.isArray(value)) {
		if (value.length > 0 && typeof value[0] === 'string') {
			return value as string[];
		}
		// Try to convert numbers to strings if necessary
		if (value.length > 0 && typeof value[0] === 'number') {
			return value.map(String);
		}
		return [];
	}

	return [];
}

/**
 * Serialize term slugs to Voxel API format
 */
export function serializeTermsValue(slugs: string[]): string | null {
	if (slugs.length === 0) return null;
	return slugs.join(',');
}

// ============================================================================
// Range Filter Serialization
// Evidence: voxel-search-form.beautified.js line 437: this.filter.value = this.value.join("..");
// ============================================================================

interface RangeValue {
	min?: number;
	max?: number;
}

/**
 * Parse Voxel range string format "min..max" to object
 * Evidence: voxel-search-form.beautified.js line 437
 */
export function parseRangeValue(
	value: unknown,
	rangeStart: number,
	rangeEnd: number
): { min: number; max: number } {
	// Handle null/undefined
	if (value === null || value === undefined || value === '') {
		return { min: rangeStart, max: rangeEnd };
	}

	// Handle string format "min..max" (Voxel API format)
	if (typeof value === 'string' && value.includes('..')) {
		const parts = value.split('..');
		const min = parts[0] !== '' ? Number(parts[0]) : rangeStart;
		const max = parts[1] !== '' ? Number(parts[1]) : rangeEnd;
		return {
			min: isNaN(min) ? rangeStart : min,
			max: isNaN(max) ? rangeEnd : max,
		};
	}

	// Handle legacy object format (backward compatibility)
	if (typeof value === 'object') {
		const obj = value as RangeValue;
		return {
			min: obj.min ?? rangeStart,
			max: obj.max ?? rangeEnd,
		};
	}

	// Handle single number
	if (typeof value === 'number') {
		return { min: value, max: rangeEnd };
	}

	return { min: rangeStart, max: rangeEnd };
}

/**
 * Serialize range value to Voxel API format: "min..max"
 * Evidence: voxel-search-form.beautified.js line 437
 */
export function serializeRangeValue(
	min: number,
	max: number,
	rangeStart: number,
	rangeEnd: number,
	handles: 'single' | 'double' = 'double',
	compare: 'in_range' | 'greater_than' | 'less_than' = 'in_range'
): string | null {
	// If both values are at defaults, return null to clear filter
	if (min === rangeStart && max === rangeEnd) {
		return null;
	}
	// Voxel format: "min..max" for double handles
	if (handles === 'double') {
		return `${min}..${max}`;
	}
	// Single handle: min only (greater_than) or max only (less_than)
	if (compare === 'greater_than' || compare === 'in_range') {
		return `${min}..`;
	}
	return `..${max}`;
}

// ============================================================================
// Location Filter Serialization
// Evidence: voxel-search-form.beautified.js lines 721, 724
// Radius: `${address};${lat},${lng},${radius}`
// Area: `${address};${swlat},${swlng}..${nelat},${nelng}`
// ============================================================================

interface LocationValue {
	address?: string;
	lat?: number;
	lng?: number;
	swlat?: number;
	swlng?: number;
	nelat?: number;
	nelng?: number;
	radius?: number;
}

/**
 * Serialize location value to Voxel API format
 * Evidence: voxel-search-form.beautified.js lines 721, 724
 */
export function serializeLocationValue(loc: LocationValue | null): string | null {
	if (!loc || !loc.address) return null;

	// If we have viewport bounds (area method), use that format
	if (
		loc.swlat !== undefined &&
		loc.swlng !== undefined &&
		loc.nelat !== undefined &&
		loc.nelng !== undefined
	) {
		return `${loc.address};${loc.swlat},${loc.swlng}..${loc.nelat},${loc.nelng}`;
	}

	// Otherwise use radius format (requires lat/lng)
	if (loc.lat !== undefined && loc.lng !== undefined) {
		return `${loc.address};${loc.lat},${loc.lng},${loc.radius || 25}`;
	}

	// Just address without coordinates
	return loc.address;
}

/**
 * Parse Voxel location string format to object
 * Evidence: voxel-search-form.beautified.js lines 721, 724
 */
export function parseLocationValue(
	value: unknown,
	defaultRadius: number = 25
): LocationValue | null {
	if (value === null || value === undefined || value === '') {
		return null;
	}

	// Handle string format
	if (typeof value === 'string') {
		// Format: "address;lat,lng,radius" or "address;swlat,swlng..nelat,nelng"
		const semicolonIndex = value.indexOf(';');
		if (semicolonIndex === -1) {
			// Just an address
			return { address: value };
		}

		const address = value.substring(0, semicolonIndex);
		const coords = value.substring(semicolonIndex + 1);

		// Check for area format (contains "..")
		if (coords.includes('..')) {
			const parts = coords.split('..');
			const sw = parts[0].split(',');
			const ne = parts[1].split(',');
			return {
				address,
				swlat: Number(sw[0]),
				swlng: Number(sw[1]),
				nelat: Number(ne[0]),
				nelng: Number(ne[1]),
			};
		}

		// Radius format: lat,lng,radius
		const parts = coords.split(',');
		return {
			address,
			lat: Number(parts[0]),
			lng: Number(parts[1]),
			radius: parts[2] ? Number(parts[2]) : defaultRadius,
		};
	}

	// Handle legacy object format (backward compatibility)
	if (typeof value === 'object') {
		return value as LocationValue;
	}

	return null;
}

// ============================================================================
// Availability Filter Serialization
// Evidence: voxel-search-form.beautified.js line 985
// Format: "YYYY-MM-DD" or "YYYY-MM-DD..YYYY-MM-DD"
// ============================================================================

/**
 * Parse Voxel availability value
 * Evidence: voxel-search-form.beautified.js line 985
 */
export function parseAvailabilityValue(value: unknown): { date: string; slots: number } {
	// Handle null/undefined
	if (value === null || value === undefined || value === '') {
		return { date: '', slots: 1 };
	}

	// Handle string format (Voxel API format)
	if (typeof value === 'string') {
		return { date: value, slots: 1 };
	}

	// Handle legacy object format
	if (typeof value === 'object') {
		const obj = value as { date?: string; slots?: number };
		return {
			date: obj.date || '',
			slots: obj.slots || 1,
		};
	}

	return { date: '', slots: 1 };
}

/**
 * Serialize availability date range to Voxel API format
 * Evidence: voxel-search-form.beautified.js line 985
 */
export function serializeAvailabilityValue(
	startDate: string | null,
	endDate: string | null,
	isRangeMode: boolean
): string | null {
	if (isRangeMode) {
		if (startDate && endDate) {
			return `${startDate}..${endDate}`;
		}
		return null;
	}
	return startDate || null;
}

// ============================================================================
// URL Parameter Utilities
// Evidence: voxel-search-form.beautified.js lines 1202-1203
// VOXEL PARITY: Uses 'type' instead of 'post_type', and filter keys without 'filter_' prefix
// ============================================================================

/**
 * Build URL search params from filter values
 * VOXEL PARITY: Uses 'type' instead of 'post_type'
 */
export function buildUrlParams(
	filterValues: Record<string, unknown>,
	postType?: string
): URLSearchParams {
	const params = new URLSearchParams();

	// Add post type if provided - VOXEL PARITY: Use 'type' not 'post_type'
	if (postType) {
		params.set('type', postType);
	}

	// Add filter params - VOXEL PARITY: Use key directly without 'filter_' prefix
	Object.entries(filterValues).forEach(([key, value]) => {
		if (value !== null && value !== undefined && value !== '') {
			if (Array.isArray(value)) {
				params.set(key, value.join(','));
			} else if (typeof value === 'object') {
				params.set(key, JSON.stringify(value));
			} else {
				params.set(key, String(value));
			}
		}
	});

	return params;
}

/**
 * Parse URL search params to filter values
 * VOXEL PARITY: Reads 'type' (not 'post_type') and filter keys without 'filter_' prefix
 */
export function parseUrlParams(search: string): {
	postType: string | null;
	filterValues: Record<string, string>;
} {
	const params = new URLSearchParams(search);
	const filterValues: Record<string, string> = {};

	// Get post type - VOXEL PARITY: Use 'type' not 'post_type'
	const postType = params.get('type');

	// Get filter values - VOXEL PARITY: Keys are used directly without 'filter_' prefix
	params.forEach((value, key) => {
		if (key !== 'type') {
			filterValues[key] = value;
		}
	});

	return { postType, filterValues };
}

/**
 * Clear all filter-related URL parameters from a search string
 * Keeps only the post type if provided
 * VOXEL PARITY: Reset clears all filters but maintains current post type
 */
export function clearUrlParamsFromSearch(
	search: string,
	keepPostType?: string
): string {
	const params = new URLSearchParams(search);
	const keysToRemove: string[] = [];

	params.forEach((_value, key) => {
		// Remove legacy FSE format
		if (key.startsWith('filter_') || key === 'post_type') {
			keysToRemove.push(key);
		}
		// Remove 'type' only if we're not keeping it
		if (key === 'type' && !keepPostType) {
			keysToRemove.push(key);
		}
		// Remove any other filter params (anything that's not a known system param)
		if (key !== 'type' && key !== 'page' && key !== 'pg') {
			keysToRemove.push(key);
		}
	});

	keysToRemove.forEach((key) => params.delete(key));

	// Re-add post type if provided
	if (keepPostType) {
		params.set('type', keepPostType);
	}

	return params.toString();
}
