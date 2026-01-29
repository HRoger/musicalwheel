<?php

namespace Voxel\Utils\Async_Requests;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Async_Email extends WP_Async_Request {

	protected $action = 'async_email';

	protected function handle() {
		$emails = wp_unslash( $_POST['emails'] ?? [] );
		foreach ( $emails as $email ) {
			$message = $email['message'];
			if ( ( $email['_email_template'] ?? 'default' ) !== 'custom' ) {
				$message = \Voxel\email_template( $message );
			}

			wp_mail(
				$email['recipient'],
				$email['subject'],
				$message,
				$email['headers']
			);
		}
	}
}
