<?php

namespace Voxel\Modules\PayPal_Payments;

use \Voxel\Vendor\Symfony\Component\HttpClient\HttpClient;
use \Voxel\Vendor\Symfony\Contracts\HttpClient\HttpClientInterface;
use \Voxel\Vendor\Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use \Voxel\Vendor\Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Client {

	private static $live_client, $test_client;

	const SANDBOX_BASE_URL = 'https://api-m.sandbox.paypal.com';
	const LIVE_BASE_URL = 'https://api-m.paypal.com';

	const WEBHOOK_EVENTS = [
		'PAYMENT.CAPTURE.COMPLETED',
		'PAYMENT.CAPTURE.DECLINED',
		'PAYMENT.CAPTURE.DENIED',
		'PAYMENT.CAPTURE.PENDING',
		'PAYMENT.CAPTURE.REFUNDED',
		'PAYMENT.CAPTURE.REVERSED',
		'PAYMENT.AUTHORIZATION.CREATED',
		'PAYMENT.AUTHORIZATION.VOIDED',
		'CHECKOUT.ORDER.APPROVED',
		'BILLING.SUBSCRIPTION.CREATED',
		'BILLING.SUBSCRIPTION.ACTIVATED',
		'BILLING.SUBSCRIPTION.CANCELLED',
		'BILLING.SUBSCRIPTION.EXPIRED',
		'BILLING.SUBSCRIPTION.SUSPENDED',
		'BILLING.SUBSCRIPTION.RE-ACTIVATED',
		'BILLING.SUBSCRIPTION.UPDATED',
		'BILLING.SUBSCRIPTION.PAYMENT.FAILED',
	];

	public static function is_test_mode() {
		return \Voxel\get( 'payments.paypal.mode', 'sandbox' ) === 'sandbox';
	}

	public static function get_base_url() {
		return static::is_test_mode() ? static::SANDBOX_BASE_URL : static::LIVE_BASE_URL;
	}

	public static function get_client_id() {
		$mode = static::is_test_mode() ? 'sandbox' : 'live';
		return \Voxel\get( sprintf( 'payments.paypal.%s.client_id', $mode ) );
	}

	public static function get_client_secret() {
		$mode = static::is_test_mode() ? 'sandbox' : 'live';
		return \Voxel\get( sprintf( 'payments.paypal.%s.client_secret', $mode ) );
	}

	public static function get_client() {
		return static::is_test_mode() ? static::get_test_client() : static::get_live_client();
	}

	public static function get_live_client() {
		if ( is_null( static::$live_client ) ) {
			static::$live_client = HttpClient::create( [
				'base_uri' => static::LIVE_BASE_URL,
				'timeout' => 30,
				'headers' => [
					'Content-Type' => 'application/json',
					'Accept' => 'application/json',
				],
			] );
		}

		return static::$live_client;
	}

	public static function get_test_client() {
		if ( is_null( static::$test_client ) ) {
			static::$test_client = HttpClient::create( [
				'base_uri' => static::SANDBOX_BASE_URL,
				'timeout' => 30,
				'headers' => [
					'Content-Type' => 'application/json',
					'Accept' => 'application/json',
				],
			] );
		}

		return static::$test_client;
	}

	public static function get_access_token() {
		$mode = static::is_test_mode() ? 'sandbox' : 'live';
		$transient_key = sprintf( 'voxel_paypal_token_%s', $mode );

		$token = get_transient( $transient_key );
		if ( $token !== false ) {
			return $token;
		}

		$client_id = static::get_client_id();
		$client_secret = static::get_client_secret();

		if ( empty( $client_id ) || empty( $client_secret ) ) {
			throw new \Exception( _x( 'PayPal credentials not configured', 'paypal', 'voxel' ) );
		}

		$base_url = static::get_base_url();
		$client = static::get_client();

		try {
			$response = $client->request( 'POST', $base_url . '/v1/oauth2/token', [
				'auth_basic' => [ $client_id, $client_secret ],
				'body' => [
					'grant_type' => 'client_credentials',
				],
			] );

			$status_code = $response->getStatusCode();
			$content = $response->getContent();
			$data = json_decode( $content, true );

			if ( $status_code >= 200 && $status_code < 300 && ! empty( $data['access_token'] ) ) {
				$expires_in = isset( $data['expires_in'] ) ? (int) $data['expires_in'] : 32400; // 9 hours default
				// Refresh before expiry; ensure TTL remains positive even on unexpected short expirations.
				$ttl = max( 60, $expires_in - 600 ); // refresh 10 minutes early, at minimum every 60s
				set_transient( $transient_key, $data['access_token'], $ttl );
				return $data['access_token'];
			}

			$error_message = _x( 'Failed to obtain PayPal access token', 'paypal', 'voxel' );
			if ( ! empty( $data['error_description'] ) ) {
				$error_message = $data['error_description'];
			}
			throw new \Exception( $error_message, $status_code );
		} catch ( HttpExceptionInterface $e ) {
			$error_message = _x( 'PayPal authentication failed', 'paypal', 'voxel' );
			try {
				$response = $e->getResponse();
				$body = json_decode( $response->getContent(), true );
				if ( ! empty( $body['error_description'] ) ) {
					$error_message = $body['error_description'];
				}
			} catch ( \Exception $ex ) {
				// Ignore response parsing errors
			}
			throw new \Exception( $error_message, $e->getCode(), $e );
		} catch ( TransportExceptionInterface $e ) {
			throw new \Exception(
				_x( 'PayPal authentication failed: Network error', 'paypal', 'voxel' ),
				$e->getCode(),
				$e
			);
		}
	}

	public static function make_request( $method, $endpoint, $data = null, $retry = true ) {
		$client = static::get_client();
		$token = static::get_access_token();
		$base_url = static::get_base_url();
		$url = $base_url . $endpoint;

		$options = [
			'auth_bearer' => $token,
			'headers' => [
				'Content-Type' => 'application/json',
				'Accept' => 'application/json',
			],
		];

		if ( $data !== null ) {
			$options['json'] = $data;
		}

		try {
			$response = $client->request( $method, $url, $options );
			$status_code = $response->getStatusCode();

			if ( $status_code >= 200 && $status_code < 300 ) {
				$content = $response->getContent();
				return json_decode( $content, true );
			}

			// For non-2xx status codes, try to get error details
			// Symfony might throw HttpExceptionInterface when calling getContent() on error responses
			try {
				$content = $response->getContent( false );
			} catch ( \Exception $content_ex ) {
				// If we can't get content, use the exception response
				$content = '';
			}

			$body = json_decode( $content, true );
			$error_message = _x( 'PayPal API request failed', 'paypal', 'voxel' );
			if ( ! empty( $body['message'] ) ) {
				$error_message = $body['message'];
			} elseif ( ! empty( $body['error_description'] ) ) {
				$error_message = $body['error_description'];
			} elseif ( ! empty( $body['name'] ) ) {
				$error_message = $body['name'];
			}

			// Collect detailed error information
			$error_details = [];
			if ( ! empty( $body['details'] ) ) {
				$error_details = $body['details'];
			} elseif ( ! empty( $body['error'] ) ) {
				$error_details = $body['error'];
			}

			// Log basic error information for debugging (avoid logging full response bodies).
			if ( $status_code === 400 ) {
				$debug_id = is_array( $body ) ? ( $body['debug_id'] ?? null ) : null;
				$issues = [];
				if ( is_array( $error_details ) ) {
					$issues = array_filter( array_map( function( $detail ) {
						return $detail['issue'] ?? null;
					}, $error_details ) );
				}

				\Voxel\log( sprintf(
					'PayPal API 400 Error: %s | Issues: %s | Debug ID: %s',
					$error_message,
					! empty( $issues ) ? implode( ', ', $issues ) : 'n/a',
					$debug_id ? (string) $debug_id : 'n/a'
				) );
			}

			// Append details if available
			if ( ! empty( $error_details ) ) {
				if ( is_array( $error_details ) ) {
					$details_messages = array_filter( array_map( function( $detail ) {
						return $detail['issue'] ?? $detail['description'] ?? $detail['field'] ?? null;
					}, $error_details ) );
					if ( ! empty( $details_messages ) ) {
						$error_message .= ': ' . implode( ', ', $details_messages );
					}
				}
			}

			throw new \Exception( $error_message, $status_code );
		} catch ( HttpExceptionInterface $e ) {
			$status_code = $e->getResponse()->getStatusCode();

			// Handle 401 (unauthorized) - token might be expired
			if ( $status_code === 401 && $retry ) {
				// Clear token cache and retry once
				$mode = static::is_test_mode() ? 'sandbox' : 'live';
				delete_transient( sprintf( 'voxel_paypal_token_%s', $mode ) );
				return static::make_request( $method, $endpoint, $data, false );
			}

			// Handle 429 (rate limit) - retry with exponential backoff
			if ( $status_code === 429 && $retry ) {
				sleep( 2 );
				return static::make_request( $method, $endpoint, $data, false );
			}

			$error_message = _x( 'PayPal API request failed', 'paypal', 'voxel' );
			$error_details = [];
			try {
				$response = $e->getResponse();
				$body = json_decode( $response->getContent(), true );

				// PayPal error responses can have different structures
				if ( ! empty( $body['message'] ) ) {
					$error_message = $body['message'];
				} elseif ( ! empty( $body['error_description'] ) ) {
					$error_message = $body['error_description'];
				} elseif ( ! empty( $body['name'] ) ) {
					$error_message = $body['name'];
				}

				// Collect detailed error information
				if ( ! empty( $body['details'] ) ) {
					$error_details = $body['details'];
				} elseif ( ! empty( $body['error'] ) ) {
					$error_details = $body['error'];
				}

			// Log basic error information for debugging (avoid logging full response bodies).
				if ( $status_code === 400 ) {
				$debug_id = is_array( $body ) ? ( $body['debug_id'] ?? null ) : null;
				$issues = [];
				if ( is_array( $error_details ) ) {
					$issues = array_filter( array_map( function( $detail ) {
						return $detail['issue'] ?? null;
					}, $error_details ) );
				}

					\Voxel\log( sprintf(
					'PayPal API 400 Error: %s | Issues: %s | Debug ID: %s',
						$error_message,
					! empty( $issues ) ? implode( ', ', $issues ) : 'n/a',
					$debug_id ? (string) $debug_id : 'n/a'
					) );
				}
			} catch ( \Exception $ex ) {
				// Ignore response parsing errors
			}

			// Append details if available
			if ( ! empty( $error_details ) ) {
				if ( is_array( $error_details ) ) {
					$details_messages = array_filter( array_map( function( $detail ) {
						return $detail['issue'] ?? $detail['description'] ?? $detail['field'] ?? null;
					}, $error_details ) );
					if ( ! empty( $details_messages ) ) {
						$error_message .= ': ' . implode( ', ', $details_messages );
					}
				}
			}

			throw new \Exception( $error_message, $status_code, $e );
		} catch ( TransportExceptionInterface $e ) {
			throw new \Exception(
				_x( 'PayPal API request failed: Network error', 'paypal', 'voxel' ),
				$e->getCode(),
				$e
			);
		}
	}

	/**
	 * Check if an exception message indicates a COMPLIANCE_VIOLATION error
	 *
	 * @param \Exception|string $exception Exception object or error message string
	 * @return bool True if the error is a COMPLIANCE_VIOLATION
	 */
	public static function is_compliance_violation( $exception ): bool {
		$message = $exception instanceof \Exception ? $exception->getMessage() : (string) $exception;
		return strpos( $message, 'COMPLIANCE_VIOLATION' ) !== false;
	}

	/**
	 * Check if an exception message indicates an AUTHORIZATION_ALREADY_CAPTURED error
	 *
	 * @param \Exception|string $exception Exception object or error message string
	 * @return bool True if the error is AUTHORIZATION_ALREADY_CAPTURED
	 */
	public static function is_authorization_already_captured( $exception ): bool {
		$message = $exception instanceof \Exception ? $exception->getMessage() : (string) $exception;
		return strpos( $message, 'AUTHORIZATION_ALREADY_CAPTURED' ) !== false;
	}

	/**
	 * Check if an exception message indicates an AUTHORIZATION_VOIDED error
	 *
	 * @param \Exception|string $exception Exception object or error message string
	 * @return bool True if the error is AUTHORIZATION_VOIDED
	 */
	public static function is_authorization_voided( $exception ): bool {
		$message = $exception instanceof \Exception ? $exception->getMessage() : (string) $exception;
		return strpos( $message, 'AUTHORIZATION_VOIDED' ) !== false;
	}

	public static function create_order( $data ) {
		return static::make_request( 'POST', '/v2/checkout/orders', $data );
	}

	public static function capture_order( $order_id ) {
		return static::make_request( 'POST', sprintf( '/v2/checkout/orders/%s/capture', $order_id ) );
	}

	public static function authorize_order( $order_id ) {
		return static::make_request( 'POST', sprintf( '/v2/checkout/orders/%s/authorize', $order_id ) );
	}

	public static function capture_authorization( $authorization_id ) {
		return static::make_request( 'POST', sprintf( '/v2/payments/authorizations/%s/capture', $authorization_id ) );
	}

	public static function get_authorization( $authorization_id ) {
		return static::make_request( 'GET', sprintf( '/v2/payments/authorizations/%s', $authorization_id ) );
	}

	public static function get_capture( $capture_id ) {
		return static::make_request( 'GET', sprintf( '/v2/payments/captures/%s', $capture_id ) );
	}

	public static function void_authorization( $authorization_id ) {
		return static::make_request( 'POST', sprintf( '/v2/payments/authorizations/%s/void', $authorization_id ) );
	}

	public static function get_order( $order_id ) {
		return static::make_request( 'GET', sprintf( '/v2/checkout/orders/%s', $order_id ) );
	}

	public static function create_product( $data ) {
		return static::make_request( 'POST', '/v1/catalogs/products', $data );
	}

	public static function create_plan( $data ) {
		return static::make_request( 'POST', '/v1/billing/plans', $data );
	}

	public static function get_plan( $plan_id ) {
		return static::make_request( 'GET', sprintf( '/v1/billing/plans/%s', $plan_id ) );
	}

	public static function create_subscription( $data ) {
		return static::make_request( 'POST', '/v1/billing/subscriptions', $data );
	}

	public static function get_subscription( $subscription_id ) {
		return static::make_request( 'GET', sprintf( '/v1/billing/subscriptions/%s', $subscription_id ) );
	}

	public static function update_subscription( $subscription_id, $data ) {
		return static::make_request( 'PATCH', sprintf( '/v1/billing/subscriptions/%s', $subscription_id ), $data );
	}

	public static function cancel_subscription( $subscription_id, $reason = null ) {
		$data = [];
		if ( $reason ) {
			$data['reason'] = $reason;
		}

		return static::make_request(
			'POST',
			sprintf( '/v1/billing/subscriptions/%s/cancel', $subscription_id ),
			$data
		);
	}

	public static function suspend_subscription( $subscription_id, $reason = null ) {
		$data = [];
		if ( $reason ) {
			$data['reason'] = $reason;
		}

		return static::make_request(
			'POST',
			sprintf( '/v1/billing/subscriptions/%s/suspend', $subscription_id ),
			$data
		);
	}

	public static function activate_subscription( $subscription_id, $reason = null ) {
		$data = [];
		if ( $reason ) {
			$data['reason'] = $reason;
		}

		return static::make_request(
			'POST',
			sprintf( '/v1/billing/subscriptions/%s/activate', $subscription_id ),
			$data
		);
	}

	public static function verify_webhook_signature( $headers, $body, $webhook_id ) {
		$webhook_event = json_decode( $body, true );
		if ( ! $webhook_event ) {
			return false;
		}

		$data = [
			'auth_algo' => $headers['PAYPAL-AUTH-ALGO'] ?? '',
			'cert_url' => $headers['PAYPAL-CERT-URL'] ?? '',
			'transmission_id' => $headers['PAYPAL-TRANSMISSION-ID'] ?? '',
			'transmission_sig' => $headers['PAYPAL-TRANSMISSION-SIG'] ?? '',
			'transmission_time' => $headers['PAYPAL-TRANSMISSION-TIME'] ?? '',
			'webhook_id' => $webhook_id,
			'webhook_event' => $webhook_event,
		];

		try {
			$result = static::make_request( 'POST', '/v1/notifications/verify-webhook-signature', $data );
			return isset( $result['verification_status'] ) && $result['verification_status'] === 'SUCCESS';
		} catch ( \Exception $e ) {
			\Voxel\log( 'PayPal webhook verification failed: ' . $e->getMessage() );
			return false;
		}
	}

	public static function get_webhook_events(): array {
		return static::WEBHOOK_EVENTS;
	}

	public static function dashboard_url( $path = '' ) {
		$url = static::is_test_mode()
			? 'https://www.sandbox.paypal.com/'
			: 'https://www.paypal.com/';

		$path = ltrim( $path, "/\\" );
		return $url . $path;
	}

	/**
	 * Extract PayPal Order ID from a webhook event using multiple fallback strategies.
	 *
	 * @param array $event Webhook event payload
	 * @return string|null PayPal Order ID or null if not found
	 */
	public static function extract_order_id_from_webhook_event( array $event ): ?string {
		$resource = $event['resource'] ?? [];
		$event_type = $event['event_type'] ?? '';

		// Primary: Check supplementary_data.related_ids.order_id
		$order_id = $resource['supplementary_data']['related_ids']['order_id'] ?? null;
		if ( $order_id ) {
			return $order_id;
		}

		// For CHECKOUT.ORDER.* events, the resource.id IS the order ID
		if ( strpos( $event_type, 'CHECKOUT.ORDER.' ) === 0 ) {
			return $resource['id'] ?? null;
		}

		// For PAYMENT.CAPTURE.REFUNDED events, the resource is a refund, not a capture
		// We need to get the capture_id from links first, then fetch the capture
		if ( $event_type === 'PAYMENT.CAPTURE.REFUNDED' ) {
			if ( ! empty( $resource['links'] ) && is_array( $resource['links'] ) ) {
				foreach ( $resource['links'] as $link ) {
					if ( isset( $link['rel'] ) && $link['rel'] === 'up' && isset( $link['href'] ) ) {
						$href = $link['href'];
						// Extract capture ID from URL like: https://api.paypal.com/v2/payments/captures/38E7544943396802K
						if ( preg_match( '#/v2/payments/captures/([A-Z0-9]+)#', $href, $matches ) ) {
							$capture_id = $matches[1];
							try {
								$capture = static::get_capture( $capture_id );
								$order_id = $capture['supplementary_data']['related_ids']['order_id'] ?? null;
								if ( $order_id ) {
									return $order_id;
								}
							} catch ( \Exception $e ) {
								\Voxel\log( sprintf( 'PayPal webhook: failed to fetch capture %s from refund to extract order_id: %s', $capture_id, $e->getMessage() ) );
							}
						}
					}
				}
			}
		}

		// For other PAYMENT.CAPTURE.* events, try to get order_id from capture
		if ( strpos( $event_type, 'PAYMENT.CAPTURE.' ) === 0 ) {
			$capture_id = $resource['id'] ?? null;
			if ( $capture_id ) {
				try {
					$capture = static::get_capture( $capture_id );
					$order_id = $capture['supplementary_data']['related_ids']['order_id'] ?? null;
					if ( $order_id ) {
						return $order_id;
					}
				} catch ( \Exception $e ) {
					\Voxel\log( sprintf( 'PayPal webhook: failed to fetch capture %s to extract order_id: %s', $capture_id, $e->getMessage() ) );
				}
			}
		}

		// For PAYMENT.AUTHORIZATION.* events, try to get order_id from authorization
		if ( strpos( $event_type, 'PAYMENT.AUTHORIZATION.' ) === 0 ) {
			$authorization_id = $resource['id'] ?? null;
			if ( $authorization_id ) {
				try {
					$authorization = static::get_authorization( $authorization_id );
					$order_id = $authorization['supplementary_data']['related_ids']['order_id'] ?? null;
					if ( $order_id ) {
						return $order_id;
					}
				} catch ( \Exception $e ) {
					\Voxel\log( sprintf( 'PayPal webhook: failed to fetch authorization %s to extract order_id: %s', $authorization_id, $e->getMessage() ) );
				}
			}
		}

		// Fallback: Parse order ID from resource.links array
		// Look for link with rel="up" pointing to /v2/checkout/orders/{order_id}
		if ( ! empty( $resource['links'] ) && is_array( $resource['links'] ) ) {
			foreach ( $resource['links'] as $link ) {
				if ( isset( $link['rel'] ) && $link['rel'] === 'up' && isset( $link['href'] ) ) {
					$href = $link['href'];
					// Extract order ID from URL like: https://api.paypal.com/v2/checkout/orders/5O190127TN364715T
					if ( preg_match( '#/v2/checkout/orders/([A-Z0-9]+)#', $href, $matches ) ) {
						return $matches[1];
					}
				}
			}
		}

		return null;
	}

	/**
	 * Extract PayPal Subscription ID from a webhook event.
	 *
	 * @param array $event Webhook event payload
	 * @return string|null PayPal Subscription ID or null if not found
	 */
	public static function extract_subscription_id_from_webhook_event( array $event ): ?string {
		$resource = $event['resource'] ?? [];

		// For BILLING.SUBSCRIPTION.* events, the resource.id IS the subscription ID
		return $resource['id'] ?? null;
	}

}

