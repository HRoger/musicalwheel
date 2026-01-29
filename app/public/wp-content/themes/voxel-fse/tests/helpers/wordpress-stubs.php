<?php
/**
 * WordPress Stub Functions for Unit Testing
 *
 * Provides minimal stubs for WordPress functions used in tests.
 * Brain\Monkey handles most mocking, but these ensure functions exist.
 *
 * @package VoxelFSE\Tests
 */

if ( ! function_exists( 'wp_get_attachment_url' ) ) {
	/**
	 * Stub for wp_get_attachment_url
	 */
	function wp_get_attachment_url( $attachment_id ) {
		return 'https://example.com/wp-content/uploads/test.svg';
	}
}

if ( ! function_exists( 'get_attached_file' ) ) {
	/**
	 * Stub for get_attached_file
	 */
	function get_attached_file( $attachment_id ) {
		// Return path to test fixture if available
		$test_fixtures = dirname( __DIR__ ) . '/fixtures/';
		return $test_fixtures . 'test-icon.svg';
	}
}

if ( ! function_exists( 'esc_attr' ) ) {
	/**
	 * Stub for esc_attr
	 */
	function esc_attr( $text ) {
		return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'esc_html' ) ) {
	/**
	 * Stub for esc_html
	 */
	function esc_html( $text ) {
		return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'absint' ) ) {
	/**
	 * Stub for absint
	 */
	function absint( $maybeint ) {
		return abs( (int) $maybeint );
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	/**
	 * Stub for sanitize_text_field
	 */
	function sanitize_text_field( $str ) {
		return trim( strip_tags( $str ) );
	}
}

if ( ! function_exists( 'current_user_can' ) ) {
	/**
	 * Stub for current_user_can
	 */
	function current_user_can( $capability ) {
		return true; // Default to true for tests
	}
}

if ( ! function_exists( 'register_rest_route' ) ) {
	/**
	 * Stub for register_rest_route
	 */
	function register_rest_route( $namespace, $route, $args = [] ) {
		// Store registered routes for test assertions
		global $test_registered_routes;
		if ( ! isset( $test_registered_routes ) ) {
			$test_registered_routes = [];
		}
		$test_registered_routes[ $namespace . $route ] = $args;
		return true;
	}
}

if ( ! function_exists( 'rest_ensure_response' ) ) {
	/**
	 * Stub for rest_ensure_response
	 */
	function rest_ensure_response( $response ) {
		if ( $response instanceof \WP_REST_Response ) {
			return $response;
		}
		return new \WP_REST_Response( $response );
	}
}

if ( ! function_exists( '__' ) ) {
	/**
	 * Stub for translation function
	 */
	function __( $text, $domain = 'default' ) {
		return $text;
	}
}

if ( ! function_exists( 'get_terms' ) ) {
	/**
	 * Stub for get_terms
	 */
	function get_terms( $args = [] ) {
		return [];
	}
}

if ( ! function_exists( 'is_wp_error' ) ) {
	/**
	 * Stub for is_wp_error
	 */
	function is_wp_error( $thing ) {
		return $thing instanceof \WP_Error;
	}
}

if ( ! function_exists( 'get_user_by' ) ) {
	/**
	 * Stub for get_user_by
	 */
	function get_user_by( $field, $value ) {
		return null;
	}
}

if ( ! function_exists( 'get_avatar' ) ) {
	/**
	 * Stub for get_avatar
	 */
	function get_avatar( $id_or_email, $size = 96 ) {
		return '<img src="https://example.com/avatar.png" alt="avatar" />';
	}
}

/**
 * WP_Error class stub
 */
if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		public $errors = [];
		public $error_data = [];

		public function __construct( $code = '', $message = '', $data = '' ) {
			if ( $code ) {
				$this->errors[ $code ][] = $message;
				if ( $data ) {
					$this->error_data[ $code ] = $data;
				}
			}
		}

		public function get_error_code() {
			$codes = array_keys( $this->errors );
			return $codes[0] ?? '';
		}

		public function get_error_message( $code = '' ) {
			if ( ! $code ) {
				$code = $this->get_error_code();
			}
			return $this->errors[ $code ][0] ?? '';
		}

		public function get_error_data( $code = '' ) {
			if ( ! $code ) {
				$code = $this->get_error_code();
			}
			return $this->error_data[ $code ] ?? null;
		}
	}
}

/**
 * WP_REST_Response class stub
 */
if ( ! class_exists( 'WP_REST_Response' ) ) {
	class WP_REST_Response {
		public $data;
		public $status;
		public $headers = [];

		public function __construct( $data = null, $status = 200, $headers = [] ) {
			$this->data = $data;
			$this->status = $status;
			$this->headers = $headers;
		}

		public function get_data() {
			return $this->data;
		}

		public function get_status() {
			return $this->status;
		}

		public function set_status( $status ) {
			$this->status = $status;
		}
	}
}

/**
 * WP_REST_Request class stub
 */
if ( ! class_exists( 'WP_REST_Request' ) ) {
	class WP_REST_Request {
		private $params = [];
		private $method = 'GET';
		private $body_params = [];

		public function __construct( $method = 'GET', $route = '' ) {
			$this->method = $method;
		}

		public function set_param( $key, $value ) {
			$this->params[ $key ] = $value;
		}

		public function get_param( $key ) {
			return $this->params[ $key ] ?? null;
		}

		public function get_method() {
			return $this->method;
		}

		public function set_method( $method ) {
			$this->method = $method;
		}

		public function get_json_params() {
			return $this->body_params;
		}

		public function set_body_params( $params ) {
			$this->body_params = $params;
		}
	}
}
