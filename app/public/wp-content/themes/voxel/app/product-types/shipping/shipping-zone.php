<?php

namespace Voxel\Product_Types\Shipping;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Shipping_Zone {

	protected static $instances;

	protected
		$key,
		$label,
		$regions,
		$rates;

	protected $supported_country_codes = [];

	public static function get_all(): array {
		if ( static::$instances === null ) {
			static::$instances = [];
			// Get all shipping rates (stored separately)
			$all_rates = (array) \Voxel\get( 'product_settings.shipping.shipping_rates', [] );
			$rates_by_key = [];
			foreach ( $all_rates as $rate_data ) {
				if ( isset( $rate_data['key'] ) ) {
					$rates_by_key[ $rate_data['key'] ] = $rate_data;
				}
			}

			foreach ( (array) \Voxel\get( 'product_settings.shipping.shipping_zones', [] ) as $data ) {
				try {
					$shipping_zone = new static( (array) $data, $rates_by_key );
					static::$instances[ $shipping_zone->get_key() ] = $shipping_zone;
				} catch ( \Exception $e ) {
					//
				}
			}
		}

		return static::$instances;
	}

	public static function get( $key ) {
		if ( static::$instances === null ) {
			static::get_all();
		}

		return static::$instances[ $key ] ?? null;
	}


	protected function __construct( array $data, array $rates_by_key = [] ) {
		if ( empty( $data['key'] ) || ! is_string( $data['key'] ) ) {
			throw new \Exception( 'Invalid data.' );
		}

		if ( empty( $data['label'] ) || ! is_string( $data['label'] ) ) {
			throw new \Exception( 'Invalid data.' );
		}

		$this->key = (string) $data['key'];
		$this->label = (string) ( $data['label'] ?? '' );

		$this->regions = [];
		foreach ( (array) ( $data['regions'] ?? [] ) as $region ) {
			if ( ( $region['type'] ?? null ) === 'country' && is_string( $region['country'] ?? null ) && ! empty( $region['country'] ) ) {
				$this->regions[] = [
					'type' => 'country',
					'country' => $region['country'],
					'states' => (array) ( $region['states'] ?? [] ),
					'zip_codes_enabled' => (bool) ( $region['zip_codes_enabled'] ?? false ),
					'zip_codes' => (string) ( $region['zip_codes'] ?? '' ),
				];

				$this->supported_country_codes[ $region['country'] ] = true;
			}
		}

		$this->rates = [];
		// $data['rates'] now contains rate keys (strings), not full rate objects
		foreach ( (array) ( $data['rates'] ?? [] ) as $rate_key ) {
			// Skip if not a string (rate key)
			if ( ! is_string( $rate_key ) ) {
				continue;
			}

			// Look up the full rate data from the rates_by_key map
			if ( ! isset( $rates_by_key[ $rate_key ] ) ) {
				continue;
			}

			try {
				$shipping_rate = Rates\Base_Shipping_Rate::create( $this, (array) $rates_by_key[ $rate_key ] );
				if ( $shipping_rate !== null ) {
					$this->rates[ $shipping_rate->get_key() ] = $shipping_rate;
				}
			} catch ( \Exception $e ) {
				//
			}
		}
	}

	public function get_key(): string {
		return $this->key;
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_regions(): array {
		return $this->regions;
	}

	public function get_rates(): array {
		return $this->rates;
	}

	public function get_rate( string $rate_key ): ?Rates\Base_Shipping_Rate {
		return $this->rates[ $rate_key ] ?? null;
	}

	public function get_supported_country_codes(): array {
		return $this->supported_country_codes;
	}

	public function supports_country( string $country_code ): bool {
		return isset( $this->supported_country_codes[ $country_code ] );
	}

	/**
	 * Check if a location matches this zone's restrictions
	 * @param string $country_code Country code
	 * @param string|null $state_code State code (optional)
	 * @param string|null $zip_code ZIP/postal code (optional)
	 * @return bool
	 */
	public function matches_location( string $country_code, ?string $state_code = null, ?string $zip_code = null ): bool {
		foreach ( $this->regions as $region ) {
			if ( $region['country'] !== $country_code ) {
				continue;
			}

			// Check state restrictions
			if ( ! empty( $region['states'] ) && is_array( $region['states'] ) ) {
				if ( empty( $state_code ) || ! in_array( $state_code, $region['states'], true ) ) {
					continue;
				}
			}

			// Check ZIP code restrictions
			if ( ! empty( $region['zip_codes_enabled'] ) && ! empty( $region['zip_codes'] ) && ! empty( $zip_code ) ) {
				if ( ! $this->matches_zip_code( $zip_code, $region['zip_codes'] ) ) {
					continue;
				}
			}

			return true;
		}

		return false;
	}

	/**
	 * Check if a ZIP code matches the restrictions
	 * Supports:
	 * - Exact match: "23000"
	 * - Range: "20000..90000"
	 * - Wildcard: "CB23*" (matches anything starting with CB23, e.g., "CB23 1EX", "CB231EX")
	 *
	 * @param string $zip_code The ZIP code to check
	 * @param string $restrictions ZIP code restrictions (one per line)
	 * @return bool
	 */
	protected function matches_zip_code( string $zip_code, string $restrictions ): bool {
		// Normalize ZIP code: trim and convert to uppercase
		$zip_code = strtoupper( trim( $zip_code ) );
		if ( empty( $zip_code ) ) {
			return false;
		}

		$lines = array_filter( array_map( 'trim', explode( "\n", $restrictions ) ) );
		if ( empty( $lines ) ) {
			return true; // No restrictions means all ZIP codes allowed
		}

		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( empty( $line ) ) {
				continue;
			}

			// Range check: "20000..90000"
			if ( strpos( $line, '..' ) !== false ) {
				list( $min, $max ) = explode( '..', $line, 2 );
				$min = trim( $min );
				$max = trim( $max );
				if ( is_numeric( $min ) && is_numeric( $max ) && is_numeric( $zip_code ) ) {
					if ( $zip_code >= $min && $zip_code <= $max ) {
						return true;
					}
				}
				continue;
			}

			// Wildcard check: "CB23*"
			if ( strpos( $line, '*' ) !== false ) {
				// Normalize pattern: convert to uppercase and handle wildcard
				$pattern = strtoupper( $line );
				// Escape special regex chars, then replace * with .* for matching
				$pattern = preg_quote( $pattern, '/' );
				$pattern = str_replace( '\*', '.*', $pattern );
				// Match from start
				if ( preg_match( '/^' . $pattern . '$/i', $zip_code ) ) {
					return true;
				}
				continue;
			}

			// Exact match (case-insensitive)
			if ( strcasecmp( $line, $zip_code ) === 0 ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get all supported countries with their data (name, states) for frontend
	 * @return array
	 */
	public static function get_supported_countries_data(): array {
		$countries_data = \Voxel\Utils\Data\Countries_With_Subdivisions::all();
		$countries_flat = [];

		foreach ( static::get_all() as $shipping_zone ) {
			// Only include countries from zones that have at least one shipping rate
			if ( empty( $shipping_zone->get_rates() ) ) {
				continue;
			}

			foreach ( $shipping_zone->get_supported_country_codes() as $country_code => $enabled ) {
				if ( isset( $countries_data[ $country_code ] ) ) {
					$countries_flat[ $country_code ] = [
						'name' => $countries_data[ $country_code ]['name'],
						'states' => $countries_data[ $country_code ]['states'] ?? [],
					];
				}
			}
		}

		// Sort by country name
		uasort( $countries_flat, function( $a, $b ) {
			return strcmp( $a['name'], $b['name'] );
		} );

		return $countries_flat;
	}

	public function get_frontend_config(): array {
		$regions_data = [];
		foreach ( $this->regions as $region ) {
			$regions_data[] = [
				'country' => $region['country'],
				'states' => $region['states'],
				'zip_codes_enabled' => $region['zip_codes_enabled'] ?? false,
				'zip_codes' => $region['zip_codes'],
			];
		}

		return [
			'key' => $this->get_key(),
			'label' => $this->get_label(),
			'countries' => (object) $this->get_supported_country_codes(),
			'regions' => $regions_data,
			'rates' => array_map( function( $shipping_rate ) {
				return $shipping_rate->get_frontend_config();
			}, $this->get_rates() )
		];
	}
}
