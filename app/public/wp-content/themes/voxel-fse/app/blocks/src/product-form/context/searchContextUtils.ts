/**
 * Search Context Utilities
 *
 * Parses referrer URL parameters to auto-fill product form values.
 * Enables search → product page data pass-through.
 *
 * Evidence: voxel-product-form.beautified.js lines 2065-2132
 *
 * @package VoxelFSE
 */

import type { SearchContext, SearchContextConfig } from '../types';

/**
 * Validate date string format (YYYY-MM-DD)
 *
 * Evidence: voxel-product-form.beautified.js lines 2076-2081
 */
function isValidDate( dateString: unknown ): dateString is string {
	if ( typeof dateString !== 'string' || ! dateString.match( /^\d{4}-\d{2}-\d{2}$/ ) ) {
		return false;
	}
	return isFinite( new Date( dateString ).getTime() );
}

/**
 * Parse search context from referrer URL
 *
 * Extracts search parameters from the referring page (e.g., search results)
 * and returns values to pre-fill the form. Handles:
 * - Availability dates (for booking products)
 * - Numeric addon quantities
 * - Switcher addon states
 *
 * Evidence: voxel-product-form.beautified.js lines 2065-2132
 *
 * @param contextConfig - Configuration mapping URL params to addon keys
 * @returns SearchContext with parsed values
 */
export function parseSearchContextFromReferrer(
	contextConfig: SearchContextConfig | null | undefined
): SearchContext {
	const context: SearchContext = {
		availability: { start: '', end: '' },
		numeric_addons: {},
		switcher_addons: {},
	};

	// No config or no referrer
	if ( ! contextConfig ) {
		return context;
	}

	try {
		// Parse referrer URL parameters
		// Evidence: lines 2084-2085
		const referrerUrl = new URL( document.referrer );
		const searchParams = referrerUrl.searchParams;

		// Extract availability dates
		// Evidence: lines 2089-2098
		if ( contextConfig.availability ) {
			const availabilityParam = searchParams.get( contextConfig.availability );

			if ( typeof availabilityParam === 'string' ) {
				const dates = availabilityParam.split( '..' );

				if ( isValidDate( dates[ 0 ] ) ) {
					context.availability = {
						start: dates[ 0 ],
						end: isValidDate( dates[ 1 ] ) ? dates[ 1 ] : dates[ 0 ],
					};
				}
			}
		}

		// Extract numeric addon values
		// Evidence: lines 2103-2115
		if ( contextConfig.numeric_addons ) {
			Object.keys( contextConfig.numeric_addons ).forEach( ( addonKey ) => {
				const paramName = contextConfig.numeric_addons![ addonKey ];
				const paramValue = searchParams.get( paramName );

				if ( typeof paramValue === 'string' ) {
					const numValue = parseInt( paramValue, 10 );
					if ( ! isNaN( numValue ) ) {
						context.numeric_addons![ addonKey ] = numValue;
					}
				}
			} );
		}

		// Extract switcher addon states
		// Evidence: lines 2118-2126
		if ( contextConfig.switcher_addons ) {
			Object.keys( contextConfig.switcher_addons ).forEach( ( addonKey ) => {
				const paramName = contextConfig.switcher_addons![ addonKey ];

				if ( searchParams.get( paramName ) === '1' ) {
					context.switcher_addons![ addonKey ] = true;
				}
			} );
		}
	} catch ( error ) {
		// Silently ignore referrer parsing errors
		// Evidence: lines 2127-2129
		console.debug( 'Search context parsing failed:', error );
	}

	return context;
}

/**
 * Merge search context with existing config context
 *
 * Combines parsed referrer context with any pre-existing search_context
 * from the vxconfig (server-provided values take precedence).
 *
 * @param existing - Existing search context from config
 * @param parsed - Parsed context from referrer URL
 * @returns Merged search context
 */
export function mergeSearchContext(
	existing: SearchContext | undefined,
	parsed: SearchContext
): SearchContext {
	return {
		availability: {
			start: existing?.availability?.start || parsed.availability?.start || '',
			end: existing?.availability?.end || parsed.availability?.end || '',
		},
		numeric_addons: {
			...parsed.numeric_addons,
			...existing?.numeric_addons,
		},
		switcher_addons: {
			...parsed.switcher_addons,
			...existing?.switcher_addons,
		},
	};
}

/**
 * Set search context on product config
 *
 * Main entry point matching Voxel's _setSearchContext() method.
 * Modifies config.settings.search_context in place.
 *
 * Evidence: voxel-product-form.beautified.js line 2131
 *
 * @param config - Product form configuration (will be mutated)
 */
export function setSearchContext<T extends {
	settings?: {
		search_context?: SearchContext;
		search_context_config?: SearchContextConfig;
	};
}>( config: T ): void {
	if ( ! config.settings ) {
		return;
	}

	const contextConfig = config.settings.search_context_config;
	const parsed = parseSearchContextFromReferrer( contextConfig );
	const existing = config.settings.search_context;

	config.settings.search_context = mergeSearchContext( existing, parsed );
}

export default {
	parseSearchContextFromReferrer,
	mergeSearchContext,
	setSearchContext,
};
