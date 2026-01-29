<?php

namespace Voxel\Product_Types\Shipping;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Vendor_Shipping_Zone {

	protected static $instances;

	protected
		$key,
		$label,
		$regions,
		$rates;

	protected $supported_country_codes = [];

	/**
	 * @param array $data Zone data
	 * @param array $rates_by_key Lookup map of rate key => rate data (for new structure where rates are stored separately)
	 */
	public function __construct( array $data, array $rates_by_key = [] ) {
		$this->key = $data['key'];
		$this->label = $data['label'];

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

		// Backward compatibility: support old 'countries' format
		if ( empty( $this->regions ) && ! empty( $data['countries'] ) && is_array( $data['countries'] ) ) {
			foreach ( $data['countries'] as $country_code ) {
				$this->regions[] = [
					'type' => 'country',
					'country' => $country_code,
					'states' => [],
					'zip_codes_enabled' => false,
					'zip_codes' => '',
				];
				$this->supported_country_codes[ $country_code ] = true;
			}
		}

		$this->rates = [];
		foreach ( (array) ( $data['rates'] ?? [] ) as $rate ) {
			try {
				if ( ! is_string( $rate ) ) {
					continue;
				}

				if ( ! isset( $rates_by_key[ $rate ] ) ) {
					continue;
				}

				$shipping_rate = Vendor_Rates\Vendor_Base_Shipping_Rate::create( $this, $rates_by_key[ $rate ] );
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

	public function get_rate( string $rate_key ): ?Vendor_Rates\Vendor_Base_Shipping_Rate {
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
