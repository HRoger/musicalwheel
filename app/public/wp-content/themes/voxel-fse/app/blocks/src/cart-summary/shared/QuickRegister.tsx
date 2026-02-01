/**
 * QuickRegister Component - Guest Checkout Email Verification
 *
 * Matches Voxel's quick-register.php template 1:1
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/quick-register.php
 *
 * @package VoxelFSE
 */

import { useRef, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import { getSiteBaseUrl } from '@shared/utils/siteUrl';
import type { IconValue } from '@shared/controls/IconPickerControl';
import type { QuickRegisterState, CartConfig } from '../types';

interface QuickRegisterProps {
	config: CartConfig;
	quickRegister: QuickRegisterState;
	onQuickRegisterChange: (changes: Partial<QuickRegisterState>) => void;
	authLink: string;
	requireVerification: boolean;
	loginIcon: IconValue;
	emailIcon: IconValue;
	context: 'editor' | 'frontend';
}

/**
 * Get the AJAX URL for Voxel endpoints
 */
function getAjaxUrl(): string {
	const win = window as unknown as { Voxel_Config?: { ajax_url?: string } };
	if (typeof window !== 'undefined' && win.Voxel_Config?.ajax_url) {
		return win.Voxel_Config.ajax_url;
	}
	const baseUrl = getSiteBaseUrl();
	return baseUrl.replace('?vx=1', '');
}

/**
 * Execute reCAPTCHA if enabled
 */
async function executeRecaptcha(
	siteKey: string | undefined,
	action: string
): Promise<string | null> {
	if (!siteKey) return null;

	const grecaptcha = (window as unknown as { grecaptcha?: {
		ready: (cb: () => void) => void;
		execute: (key: string, opts: { action: string }) => Promise<string>;
	} }).grecaptcha;

	if (!grecaptcha) {
		console.warn('reCAPTCHA not loaded');
		return null;
	}

	return new Promise((resolve) => {
		grecaptcha.ready(async () => {
			try {
				const token = await grecaptcha.execute(siteKey, { action });
				resolve(token);
			} catch (error) {
				console.error('reCAPTCHA error:', error);
				resolve(null);
			}
		});
	});
}

export default function QuickRegister({
	config,
	quickRegister,
	onQuickRegisterChange,
	authLink,
	requireVerification,
	loginIcon,
	emailIcon,
	context,
}: QuickRegisterProps) {
	const sendCodeRef = useRef<HTMLAnchorElement>(null);
	const emailConfirmCodeRef = useRef<HTMLInputElement>(null);

	// Email validation
	const isValidEmail = /^\S+@\S+\.\S+$/.test(quickRegister.email);

	/**
	 * Send email verification code
	 * Matches Voxel's sendEmailVerificationCode() method
	 */
	const sendEmailVerificationCode = useCallback(async () => {
		if (context === 'editor') return;
		if (quickRegister.sending_code || !isValidEmail) return;

		onQuickRegisterChange({ sending_code: true });

		try {
			const ajaxUrl = getAjaxUrl();
			const formData = new FormData();
			formData.append('email', quickRegister.email);
			formData.append('_wpnonce', config.nonce.checkout);

			// Add reCAPTCHA token if enabled
			if (config.recaptcha.enabled && config.recaptcha.key) {
				const recaptchaToken = await executeRecaptcha(
					config.recaptcha.key,
					'quick_register_send_code'
				);
				if (recaptchaToken) {
					formData.append('_recaptcha', recaptchaToken);
				}
			}

			const response = await fetch(
				`${ajaxUrl}?vx=1&action=products.quick_register.send_confirmation_code`,
				{
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				}
			);

			const data = await response.json() as {
				success: boolean;
				status?: 'email_exists';
				message?: string;
			};

			if (data.success) {
				onQuickRegisterChange({
					sending_code: false,
					sent_code: true,
				});
				// Focus the code input after a short delay
				setTimeout(() => {
					emailConfirmCodeRef.current?.focus();
				}, 100);
			} else if (data.status === 'email_exists') {
				// Email already registered - redirect to login
				const win = window as unknown as { Voxel?: { alert: (msg: string) => void } };
				if (win.Voxel?.alert) {
					win.Voxel.alert(data.message || __('This email is already registered. Please sign in.', 'voxel-fse'));
				} else {
					alert(data.message || __('This email is already registered. Please sign in.', 'voxel-fse'));
				}
				onQuickRegisterChange({ sending_code: false });
			} else {
				const win = window as unknown as { Voxel?: { alert: (msg: string) => void } };
				if (win.Voxel?.alert) {
					win.Voxel.alert(data.message || __('Failed to send verification code.', 'voxel-fse'));
				} else {
					alert(data.message || __('Failed to send verification code.', 'voxel-fse'));
				}
				onQuickRegisterChange({ sending_code: false });
			}
		} catch (error) {
			console.error('Failed to send verification code:', error);
			onQuickRegisterChange({ sending_code: false });
		}
	}, [config, quickRegister.email, quickRegister.sending_code, isValidEmail, context, onQuickRegisterChange]);

	/**
	 * Handle email input change
	 */
	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newEmail = e.target.value;
		// If email changes after code was sent, reset sent_code flag
		const changes: Partial<QuickRegisterState> = { email: newEmail };
		if (quickRegister.sent_code) {
			changes.sent_code = false;
		}
		onQuickRegisterChange(changes);
	};

	/**
	 * Handle Enter key on email input
	 */
	const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			sendCodeRef.current?.click();
		}
	};

	return (
		<>
			{/* Sign in button for existing customers */}
			<a href={authLink} className="ts-btn ts-btn-1 form-btn">
				{renderIcon(loginIcon)}
				{__('Existing customer? Sign in', 'voxel-fse')}
			</a>

			{/* Guest checkout email section */}
			<div className="checkout-section form-field-grid">
				{/* Section divider */}
				<div className="ts-form-group">
					<div className="or-group">
						<div className="or-line"></div>
						<span className="or-text">
							{__('Or continue as Guest', 'voxel-fse')}
						</span>
						<div className="or-line"></div>
					</div>
				</div>

				{/* Email input */}
				<div className="ts-form-group vx-1-1">
					<label>{__('Email address', 'voxel-fse')}</label>
					<div className="ts-input-icon flexify">
						{renderIcon(emailIcon)}
						<input
							type="email"
							value={quickRegister.email}
							onChange={handleEmailChange}
							onKeyDown={handleEmailKeyDown}
							placeholder={__('Your email address', 'voxel-fse')}
							readOnly={quickRegister.sending_code || quickRegister.registered}
							className="ts-filter"
						/>
					</div>
				</div>

				{/* Verification flow - only if required */}
				{requireVerification && (
					<>
						{/* Send code button - show when email is valid and code not yet sent */}
						{!quickRegister.sent_code && isValidEmail && (
							<div className="ts-form-group vx-1-1">
								<div className={quickRegister.sending_code ? 'vx-disabled' : ''}>
									<a
										href="#"
										className="ts-btn ts-btn-1 form-btn"
										ref={sendCodeRef}
										onClick={(e) => {
											e.preventDefault();
											if (context === 'frontend') {
												sendEmailVerificationCode();
											}
										}}
									>
										{renderIcon(emailIcon)}
										{__('Send confirmation code', 'voxel-fse')}
									</a>
								</div>
							</div>
						)}

						{/* Confirmation code input - show after code is sent */}
						{quickRegister.sent_code && (
							<div className="ts-form-group vx-1-1">
								<label>{__('Confirmation code', 'voxel-fse')}</label>
								<input
									ref={emailConfirmCodeRef}
									type="text"
									maxLength={6}
									placeholder={__('Type your 6 digit code', 'voxel-fse')}
									value={quickRegister.code}
									onChange={(e) =>
										onQuickRegisterChange({ code: e.target.value })
									}
									readOnly={quickRegister.registered}
									className="ts-filter"
								/>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}
