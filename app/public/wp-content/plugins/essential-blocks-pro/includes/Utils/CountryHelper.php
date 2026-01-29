<?php
namespace EssentialBlocks\Pro\Utils;

/**
 * Phone Number Validation and Formatting Utilities
 *
 * This class provides server-side phone number validation and formatting
 * that mirrors the JavaScript functionality for consistency. It loads
 * country data from the centralized JSON file at includes/Utils/countries-data.json
 * ensuring consistency between frontend and backend implementations.
 *
 * Features:
 * - Complete country data with 246+ countries loaded from JSON
 * - Phone validation patterns and formatting
 * - Flag SVG data for display
 * - Backward compatibility with legacy countries data
 * - JSON-based data loading for consistency with frontend
 * - Static caching to minimize memory usage
 */
class CountryHelper {

    /**
     * Phone validation patterns by country
     */
    const PHONE_VALIDATION_PATTERNS = [
        'international' => '/^\+[1-9]\d{1,14}$/',
        'northAmerica'  => '/^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/',
        'uk'            => '/^(\+44)?[1-9]\d{8,9}$/',
        'general'       => '/^(\+\d{1,3})?[\s\-\(\)]?[\d\s\-\(\)]{7,15}$/',
    ];

    /**
     * Unified Countries Data Structure
     *
     * This array contains a centralized data structure that consolidates all country-related
     * information including country names, ISO codes, phone codes, formatting patterns,
     * and validation rules. This serves as the single source of truth for all Essential
     * Blocks Pro components that need country data.
     *
     * Each country object contains:
     * - label: Country name for display
     * - value: ISO 3166-1 alpha-2 country code
     * - phoneCode: International calling code (optional)
     * - phonePattern: Phone number formatting pattern (optional)
     * - phoneMaxLength: Maximum phone number length (optional)
     * - phoneMask: Display mask for phone formatting (optional)
     * - phoneValidationPattern: Validation pattern key (optional)
     * - flagSvg: SVG flag data for display (optional)
     */
    /**
     * Get the complete countries data from JSON file
     *
     * @return array Complete countries data array
     */
    public static function get_complete_countries_data() {
        static $countries_data = null;

        if ($countries_data === null) {
            // Load the complete countries data from JSON file
            $json_file = dirname(__FILE__) . '/countries-data.json';

            if (file_exists($json_file)) {
                $json_content = file_get_contents($json_file);
                if ($json_content !== false) {
                    $json_data = json_decode($json_content, true);
                    if (json_last_error() === JSON_ERROR_NONE && isset($json_data['countries'])) {
                        $countries_data = $json_data['countries'];
                    }
                }
            }

            // Fallback to basic data if JSON file not found or parsing failed
            if (!is_array($countries_data) || empty($countries_data)) {
                error_log('CountryHelper: Failed to load countries data from JSON, using fallback data');
                $countries_data = [
                    [
                        'label' => 'United States',
                        'value' => 'US',
                        'phoneCode' => '+1',
                        'phonePattern' => '###-###-####',
                        'phoneMaxLength' => 10,
                        'phoneMask' => '(###) ###-####',
                        'phoneValidationPattern' => 'northAmerica',
                        'flagSvg' => '<rect width="20" height="15" fill="#B22234"/>',
                    ],
                    [
                        'label' => 'Canada',
                        'value' => 'CA',
                        'phoneCode' => '+1',
                        'phonePattern' => '###-###-####',
                        'phoneMaxLength' => 10,
                        'phoneMask' => '(###) ###-####',
                        'phoneValidationPattern' => 'northAmerica',
                        'flagSvg' => '<rect width="6.67" height="15" fill="#FF0000"/><rect width="6.67" height="15" x="6.67" fill="white"/><rect width="6.67" height="15" x="13.33" fill="#FF0000"/>',
                    ],
                    [
                        'label' => 'United Kingdom',
                        'value' => 'GB',
                        'phoneCode' => '+44',
                        'phonePattern' => '#### ### ####',
                        'phoneMaxLength' => 11,
                        'phoneMask' => '#### ### ####',
                        'phoneValidationPattern' => 'uk',
                        'flagSvg' => '<rect width="20" height="15" fill="#012169"/>',
                    ],
                ];
            }
        }

        return $countries_data;
    }

    /**
     * Unified Countries Data Structure (dynamically loaded)
     */
    const COUNTRIES_DATA = null; // Will be populated by get_complete_countries_data()

    /**
     * Get legacy country data for backward compatibility
     *
     * @return array Legacy country data structure
     */
    private static function get_legacy_countries_data() {
        $countries_data = self::get_complete_countries_data();
        $legacy_data = [];

        foreach ($countries_data as $country) {
            if (isset($country['value']) && !empty($country['value'])) {
                $legacy_data[$country['value']] = [
                    'code' => isset($country['phoneCode']) ? $country['phoneCode'] : '',
                    'maxLength' => isset($country['phoneMaxLength']) ? $country['phoneMaxLength'] : null,
                    'pattern' => isset($country['phoneValidationPattern']) ? $country['phoneValidationPattern'] : 'general'
                ];
            }
        }

        return $legacy_data;
    }

    /**
     * Get all countries data
     *
     * @return array Complete countries data array
     */
    public static function get_countries_data() {
        return self::get_complete_countries_data();
    }

    /**
     * Get country data by country code from COUNTRIES_DATA
     *
     * @param string $countryCode ISO country code
     * @return array|null Country data or null if not found
     */
    public static function get_country_by_code($countryCode) {
        $countries_data = self::get_complete_countries_data();
        foreach ($countries_data as $country) {
            if (isset($country['value']) && $country['value'] === $countryCode) {
                return $country;
            }
        }
        return null;
    }

    /**
     * Validate phone number
     *
     * @param string $phoneNumber Phone number to validate
     * @param string $countryCode ISO country code (default: US)
     * @return bool Whether the phone number is valid
     */
    public static function validate_phone_number($phoneNumber, $countryCode = 'US') {
        if (empty($phoneNumber)) {
            return false;
        }

        // Sanitize input
        $phoneNumber = function_exists('sanitize_text_field') ? sanitize_text_field($phoneNumber) : trim(strip_tags($phoneNumber));
        $countryCode = function_exists('sanitize_text_field') ? sanitize_text_field($countryCode) : trim(strip_tags($countryCode));

        // Get country data
        $country = self::get_country_data($countryCode);
        if (!$country) {
            return false;
        }

        // Remove all non-digit characters for length check
        $digits = preg_replace('/\D/', '', $phoneNumber);

        // Check length constraints - support both new and legacy format
        $maxLength = isset($country['phoneMaxLength']) ? $country['phoneMaxLength'] :
                    (isset($country['maxLength']) ? $country['maxLength'] : null);

        if ($maxLength && strlen($digits) > $maxLength) {
            return false;
        }

        // Basic length check (minimum 7 digits, maximum 15)
        if (strlen($digits) < 7 || strlen($digits) > 15) {
            return false;
        }

        // Get validation pattern - support both new and legacy format
        $patternKey = isset($country['phoneValidationPattern']) ? $country['phoneValidationPattern'] :
                     (isset($country['pattern']) ? $country['pattern'] : 'general');
        $pattern = self::PHONE_VALIDATION_PATTERNS[$patternKey];

        // Validate against pattern
        return preg_match($pattern, $phoneNumber) === 1;
    }

    /**
     * Get country data by country code
     *
     * @param string $countryCode ISO country code
     * @return array|null Country data or null if not found
     */
    public static function get_country_data($countryCode) {
        // First try to get from the new COUNTRIES_DATA structure
        $country = self::get_country_by_code($countryCode);
        if ($country) {
            return $country;
        }

        // Fallback to legacy countries data for backward compatibility
        $legacy_data = self::get_legacy_countries_data();
        return isset($legacy_data[$countryCode]) ? $legacy_data[$countryCode] : null;
    }

    /**
     * Sanitize phone number for storage
     *
     * @param string $phoneNumber Phone number to sanitize
     * @return string Sanitized phone number
     */
    public static function sanitize_phone_number($phoneNumber) {
        if (empty($phoneNumber)) {
            return '';
        }

        // Remove any potentially harmful characters but keep phone-related ones
        $phoneNumber = function_exists('sanitize_text_field') ? sanitize_text_field($phoneNumber) : trim(strip_tags($phoneNumber));

        // Allow only digits, spaces, hyphens, parentheses, and plus sign
        $phoneNumber = preg_replace('/[^\d\s\-\(\)\+]/', '', $phoneNumber);

        return trim($phoneNumber);
    }

    /**
     * Format phone number to E.164 format
     *
     * @param string $phoneNumber Phone number to format
     * @param string $countryCode ISO country code
     * @return string E.164 formatted phone number
     */
    public static function to_e164_format($phoneNumber, $countryCode = 'US') {
        if (empty($phoneNumber)) {
            return '';
        }

        $country = self::get_country_data($countryCode);
        if (!$country) {
            return $phoneNumber;
        }

        // Get phone code - support both new and legacy format
        $phoneCode = isset($country['phoneCode']) ? $country['phoneCode'] :
                    (isset($country['code']) ? $country['code'] : null);

        if (!$phoneCode) {
            return $phoneNumber;
        }

        // Remove all non-digit characters
        $digits = preg_replace('/\D/', '', $phoneNumber);

        // Return in E.164 format
        return $phoneCode . $digits;
    }

    /**
     * Parse phone number to extract country code and number
     *
     * @param string $phoneNumber Full phone number with country code
     * @return array Array with 'countryCode' and 'number' keys
     */
    public static function parse_phone_number($phoneNumber) {
        if (empty($phoneNumber)) {
            return ['countryCode' => '', 'number' => ''];
        }

        // Remove all non-digit characters except +
        $cleaned = preg_replace('/[^\d\+]/', '', $phoneNumber);

        // Check if it starts with +
        if (strpos($cleaned, '+') === 0) {
            // Try to match with known country codes from COUNTRIES_DATA first
            $countries_data = self::get_complete_countries_data();
            foreach ($countries_data as $country) {
                if (isset($country['phoneCode']) && !empty($country['phoneCode']) &&
                    strpos($cleaned, $country['phoneCode']) === 0) {
                    return [
                        'countryCode' => $country['value'],
                        'number' => substr($cleaned, strlen($country['phoneCode']))
                    ];
                }
            }

            // Fallback to legacy countries data
            $legacy_data = self::get_legacy_countries_data();
            foreach ($legacy_data as $code => $data) {
                if (isset($data['code']) && strpos($cleaned, $data['code']) === 0) {
                    return [
                        'countryCode' => $code,
                        'number' => substr($cleaned, strlen($data['code']))
                    ];
                }
            }
        }

        // Default to US if no country code found
        $number = preg_replace('/^\+?1?/', '', $cleaned); // Remove +1 if present
        return [
            'countryCode' => 'US',
            'number' => $number
        ];
    }

    /**
     * Check if a country code is valid
     *
     * @param string $countryCode ISO country code to check
     * @return bool Whether the country code is valid
     */
    public static function is_valid_country_code($countryCode) {
        // Check in COUNTRIES_DATA first
        $countries_data = self::get_complete_countries_data();
        foreach ($countries_data as $country) {
            if (isset($country['value']) && $country['value'] === $countryCode) {
                return true;
            }
        }

        // Fallback to legacy countries data
        $legacy_data = self::get_legacy_countries_data();
        return isset($legacy_data[$countryCode]);
    }

    /**
     * Get all supported country codes
     *
     * @return array Array of supported country codes
     */
    public static function get_supported_countries() {
        $codes = [];

        // Get codes from COUNTRIES_DATA
        $countries_data = self::get_complete_countries_data();
        foreach ($countries_data as $country) {
            if (isset($country['value']) && !empty($country['value'])) {
                $codes[] = $country['value'];
            }
        }

        // Add legacy codes that might not be in countries_data
        $legacy_data = self::get_legacy_countries_data();
        $legacyCodes = array_keys($legacy_data);
        $codes = array_unique(array_merge($codes, $legacyCodes));

        return $codes;
    }

    /**
     * Get country name by country code
     *
     * @param string $countryCode ISO country code
     * @return string Country name or empty string if not found
     */
    public static function get_country_name($countryCode) {
        $country = self::get_country_by_code($countryCode);
        return isset($country['label']) ? $country['label'] : '';
    }

    /**
     * Get phone code by country code
     *
     * @param string $countryCode ISO country code
     * @return string Phone code or empty string if not found
     */
    public static function get_phone_code($countryCode) {
        $country = self::get_country_data($countryCode);
        if (!$country) {
            return '';
        }

        // Support both new and legacy format
        return isset($country['phoneCode']) ? $country['phoneCode'] :
               (isset($country['code']) ? $country['code'] : '');
    }

    /**
     * Get flag SVG by country code
     *
     * @param string $countryCode ISO country code
     * @return string Flag SVG or empty string if not found
     */
    public static function get_flag_svg($countryCode) {
        $country = self::get_country_by_code($countryCode);
        return isset($country['flagSvg']) ? $country['flagSvg'] : '';
    }

	public static function display_country_flag($countryCode) {
		$flagSvg = self::get_flag_svg($countryCode);
		if (empty($flagSvg)) {
			return '';
		}

		// Sanitize flag SVG (basic validation)
		if (function_exists('wp_kses')) {
			$flagSvg = wp_kses($flagSvg, [
				'rect' => [
					'width' => true,
					'height' => true,
					'x' => true,
					'y' => true,
					'fill' => true,
					'stroke' => true,
					'stroke-width' => true
				],
				'path' => [
					'd' => true,
					'fill' => true,
					'stroke' => true,
					'stroke-width' => true
				],
				'circle' => [
					'cx' => true,
					'cy' => true,
					'r' => true,
					'fill' => true,
					'stroke' => true,
					'stroke-width' => true
				],
				'polygon' => [
					'points' => true,
					'fill' => true,
					'stroke' => true,
					'stroke-width' => true
				]
			]);
		} else {
			// Basic sanitization without WordPress
			$flagSvg = strip_tags($flagSvg, '<rect><path><circle><polygon><g><line>');
		}

		// Create flag icon with proper styling using existing CSS classes
		$escapedCountryCode = function_exists('esc_attr') ? esc_attr($countryCode) : htmlspecialchars($countryCode, ENT_QUOTES, 'UTF-8');

		return sprintf(
			'<span style="display: inline-block; width: 20px; height: 15px; vertical-align: middle;" class="eb-flag-icon eb-table-flag" role="img" aria-label="%s flag">
				<svg width="20" height="15" viewBox="0 0 20 15">
					%s
				</svg>
			</span>',
			$escapedCountryCode,
			$flagSvg
		);

	}

    /**
     * Validate phone number with detailed error information
     *
     * @param string $phoneNumber Phone number to validate
     * @param string $countryCode ISO country code
     * @return array Validation result with 'valid' boolean and 'error' message
     */
    public static function validate_phone_detailed($phoneNumber, $countryCode = 'US') {
        if (empty($phoneNumber)) {
            return [
                'valid' => false,
                'error' => 'Phone number is required'
            ];
        }

        if (!self::is_valid_country_code($countryCode)) {
            return [
                'valid' => false,
                'error' => 'Invalid country code'
            ];
        }

        $isValid = self::validate_phone_number($phoneNumber, $countryCode);

        return [
            'valid' => $isValid,
            'error' => $isValid ? '' : 'Invalid phone number format'
        ];
    }

    /**
     * Get countries with phone data only
     *
     * @return array Array of countries that have phone information
     */
    public static function get_countries_with_phone_data() {
        $countries_data = self::get_complete_countries_data();
        $phone_countries = [];

        foreach ($countries_data as $country) {
            if (isset($country['phoneCode']) && !empty($country['phoneCode'])) {
                $phone_countries[] = $country;
            }
        }

        return $phone_countries;
    }

    /**
     * Get all unique phone codes
     *
     * @return array Array of unique phone codes
     */
    public static function get_all_phone_codes() {
        $countries_data = self::get_complete_countries_data();
        $codes = [];

        foreach ($countries_data as $country) {
            if (isset($country['phoneCode']) && !empty($country['phoneCode'])) {
                $codes[] = $country['phoneCode'];
            }
        }

        return array_unique($codes);
    }

    /**
     * Get countries by phone code (some phone codes are shared)
     *
     * @param string $phoneCode Phone code (e.g., "+1")
     * @return array Array of countries with that phone code
     */
    public static function get_countries_by_phone_code($phoneCode) {
        $countries_data = self::get_complete_countries_data();
        $matching_countries = [];

        foreach ($countries_data as $country) {
            if (isset($country['phoneCode']) && $country['phoneCode'] === $phoneCode) {
                $matching_countries[] = $country;
            }
        }

        return $matching_countries;
    }

    /**
     * Search countries by name or code
     *
     * @param string $searchTerm Search term
     * @return array Array of matching countries
     */
    public static function search_countries($searchTerm) {
        if (empty($searchTerm)) {
            return self::get_complete_countries_data();
        }

        $countries_data = self::get_complete_countries_data();
        $results = [];
        $term = strtolower($searchTerm);

        foreach ($countries_data as $country) {
            if (strpos(strtolower($country['label']), $term) !== false ||
                strpos(strtolower($country['value']), $term) !== false) {
                $results[] = $country;
            }
        }

        return $results;
    }

    /**
     * Get JSON metadata information
     *
     * @return array Metadata about the countries data
     */
    public static function get_countries_metadata() {
        static $metadata = null;

        if ($metadata === null) {
            $json_file = dirname(__FILE__) . '/countries-data.json';

            if (file_exists($json_file)) {
                $json_content = file_get_contents($json_file);
                if ($json_content !== false) {
                    $json_data = json_decode($json_content, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $metadata = [
                            'version' => isset($json_data['_version']) ? $json_data['_version'] : '1.0.0',
                            'generated' => isset($json_data['_generated']) ? $json_data['_generated'] : '',
                            'totalCountries' => isset($json_data['_totalCountries']) ? $json_data['_totalCountries'] : count($json_data['countries']),
                            'description' => isset($json_data['_description']) ? $json_data['_description'] : ''
                        ];
                    }
                }
            }

            // Fallback metadata
            if ($metadata === null) {
                $countries_data = self::get_complete_countries_data();
                $metadata = [
                    'version' => '1.0.0',
                    'generated' => date('Y-m-d'),
                    'totalCountries' => count($countries_data),
                    'description' => 'Fallback country data'
                ];
            }
        }

        return $metadata;
    }
}
