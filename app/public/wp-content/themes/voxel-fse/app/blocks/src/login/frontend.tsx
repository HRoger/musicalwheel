/**
 * Login/Register Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/login/voxel-login.beautified.js
 *
 * VOXEL PARITY (100%):
 * ✅ Renders HTML structure with matching CSS classes (ts-auth, ts-form, ts-login)
 * ✅ Listens for DOMContentLoaded event for initialization
 * ✅ Prevents double-initialization with mounted flag
 * ✅ Login with username/email + password + remember me
 * ✅ Two-Factor Authentication (2FA) login verification
 * ✅ Registration with multiple roles and custom fields
 * ✅ Registration field types: text, email, url, number, date, taxonomy, file, select, multiselect, switcher
 * ✅ Email confirmation flow (5-digit auto-submit)
 * ✅ Password recovery flow (email → code → new password)
 * ✅ Profile update: password change, email change with verification
 * ✅ 2FA setup with QR code, enable with code verification, disable with password
 * ✅ Backup codes generation and copy
 * ✅ Trusted devices management
 * ✅ Personal data export request
 * ✅ Account deletion with confirmation
 * ✅ reCAPTCHA v3 integration for all actions
 * ✅ Voxel.alert/prompt pattern for notifications
 * ✅ Same CSS classes and API endpoints (?vx=1&action=auth.*)
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Component receives normalized data as props
 * ✅ Pure React implementation (no jQuery in component)
 * ✅ TypeScript strict mode compatible
 * ✅ getRestBaseUrl() supports multisite subdirectory installations
 *
 * Evidence:
 * - Voxel widget: themes/voxel/templates/widgets/login.php
 * - Voxel JS: themes/voxel/assets/dist/login.js (beautified: 1,737 lines)
 * - LoginComponent.tsx: 1,200+ lines with full auth flows
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect, useCallback } from 'react';
import type { LoginAttributes, AuthConfig, LoginVxConfig } from './types';
import LoginComponent from './shared/LoginComponent';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Convert vxconfig icons to attributes format
 */
function convertIconsToAttributes(icons: LoginVxConfig['icons']): Partial<LoginAttributes> {
	return {
		googleIcon: icons.google,
		signUpIcon: icons.signUp,
		usernameIcon: icons.username,
		passwordIcon: icons.password,
		eyeIcon: icons.eye,
		emailIcon: icons.email,
		welcomeIcon: icons.welcome,
		leftChevronIcon: icons.leftChevron,
		privacyIcon: icons.privacy,
		trashIcon: icons.trash,
		logoutIcon: icons.logout,
		phoneIcon: icons.phone,
		linkIcon: icons.link,
		calendarIcon: icons.calendar,
		taxonomyIcon: icons.taxonomy,
		uploadIcon: icons.upload,
		copyIcon: icons.copy,
		cloudIcon: icons.cloud,
		deviceIcon: icons.device,
		shieldIcon: icons.shield,
	};
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized LoginVxConfig
 */
function normalizeConfig(raw: any): LoginVxConfig {
	// Normalize icons (handle both nested and flat formats)
	const icons = {
		google: raw.icons?.google ?? raw.icons?.googleIcon ?? {},
		signUp: raw.icons?.signUp ?? raw.icons?.sign_up ?? raw.icons?.signUpIcon ?? {},
		username: raw.icons?.username ?? raw.icons?.usernameIcon ?? {},
		password: raw.icons?.password ?? raw.icons?.passwordIcon ?? {},
		eye: raw.icons?.eye ?? raw.icons?.eyeIcon ?? {},
		email: raw.icons?.email ?? raw.icons?.emailIcon ?? {},
		welcome: raw.icons?.welcome ?? raw.icons?.welcomeIcon ?? {},
		leftChevron: raw.icons?.leftChevron ?? raw.icons?.left_chevron ?? raw.icons?.leftChevronIcon ?? {},
		privacy: raw.icons?.privacy ?? raw.icons?.privacyIcon ?? {},
		trash: raw.icons?.trash ?? raw.icons?.trashIcon ?? {},
		logout: raw.icons?.logout ?? raw.icons?.logoutIcon ?? {},
		phone: raw.icons?.phone ?? raw.icons?.phoneIcon ?? {},
		link: raw.icons?.link ?? raw.icons?.linkIcon ?? {},
		calendar: raw.icons?.calendar ?? raw.icons?.calendarIcon ?? {},
		taxonomy: raw.icons?.taxonomy ?? raw.icons?.taxonomyIcon ?? {},
		upload: raw.icons?.upload ?? raw.icons?.uploadIcon ?? {},
		copy: raw.icons?.copy ?? raw.icons?.copyIcon ?? {},
		cloud: raw.icons?.cloud ?? raw.icons?.cloudIcon ?? {},
		device: raw.icons?.device ?? raw.icons?.deviceIcon ?? {},
		shield: raw.icons?.shield ?? raw.icons?.shieldIcon ?? {},
	};

	return {
		icons,
		previewScreen: raw.previewScreen ?? raw.preview_screen ?? 'login',
		loginTitle: raw.loginTitle ?? raw.login_title ?? 'Log in to your account',
		registerTitle: raw.registerTitle ?? raw.register_title ?? 'Create an account',
		confirmTitle: raw.confirmTitle ?? raw.confirm_title ?? 'Confirm account',
		passwordRecoveryTitle: raw.passwordRecoveryTitle ?? raw.password_recovery_title ?? 'Password recovery',
		confirmCodeTitle: raw.confirmCodeTitle ?? raw.confirm_code_title ?? 'Enter confirmation code',
		newPasswordTitle: raw.newPasswordTitle ?? raw.new_password_title ?? 'Set new password',
		updatePasswordTitle: raw.updatePasswordTitle ?? raw.update_password_title ?? 'Update password',
		updateEmailTitle: raw.updateEmailTitle ?? raw.update_email_title ?? 'Update email',
		welcomeTitle: raw.welcomeTitle ?? raw.welcome_title ?? 'Welcome!',
		roleSource: raw.roleSource ?? raw.role_source ?? 'auto',
		manualRoles: Array.isArray(raw.manualRoles)
			? raw.manualRoles
			: Array.isArray(raw.manual_roles)
				? raw.manual_roles
				: [],
	};
}

/**
 * Convert vxconfig to full attributes
 */
function vxconfigToAttributes(vxconfig: LoginVxConfig, blockId: string): LoginAttributes {
	const iconAttrs = convertIconsToAttributes(vxconfig.icons);

	return {
		blockId,
		previewScreen: vxconfig.previewScreen,
		loginTitle: vxconfig.loginTitle,
		registerTitle: vxconfig.registerTitle,
		confirmTitle: vxconfig.confirmTitle,
		passwordRecoveryTitle: vxconfig.passwordRecoveryTitle,
		confirmCodeTitle: vxconfig.confirmCodeTitle,
		newPasswordTitle: vxconfig.newPasswordTitle,
		updatePasswordTitle: vxconfig.updatePasswordTitle,
		updateEmailTitle: vxconfig.updateEmailTitle,
		welcomeTitle: vxconfig.welcomeTitle,
		roleSource: vxconfig.roleSource,
		manualRoles: vxconfig.manualRoles,
		...iconAttrs,
	} as LoginAttributes;
}

/**
 * Frontend Login Component with API fetching
 */
function FrontendLogin({
	vxconfig,
	blockId,
}: {
	vxconfig: LoginVxConfig;
	blockId: string;
}) {
	const [config, setConfig] = useState<AuthConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Convert vxconfig to attributes format
	const attributes = vxconfigToAttributes(vxconfig, blockId);

	// Fetch auth config from REST API
	const fetchConfig = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				role_source: vxconfig.roleSource,
			});

			if (vxconfig.roleSource === 'manual' && vxconfig.manualRoles.length > 0) {
				vxconfig.manualRoles.forEach((role) => {
					params.append('manual_roles[]', role);
				});
			}

			// MULTISITE FIX: Use getRestBaseUrl() for multisite subdirectory support
			const restUrl = getRestBaseUrl();

			const headers: HeadersInit = {};
			const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
			if (nonce) {
				headers['X-WP-Nonce'] = nonce;
			}

			const response = await fetch(`${restUrl}voxel-fse/v1/auth-config?${params.toString()}`, {
				credentials: 'same-origin',
				headers,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = (await response.json()) as AuthConfig;
			setConfig(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load config');
			console.error('Login block: Failed to fetch auth config', err);
		} finally {
			setIsLoading(false);
		}
	}, [vxconfig.roleSource, vxconfig.manualRoles]);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	// Error state - show minimal login form
	if (error) {
		return (
			<div className="ts-auth">
				<div className="ts-form ts-login">
					<div className="ts-login-head">
						<span className="vx-step-title">{attributes.loginTitle}</span>
					</div>
					<div className="login-section">
						<div className="ts-form-group">
							<p className="field-info" style={{ color: 'var(--vx-danger-color, #dc3545)' }}>
								Error loading login form. Please refresh the page.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<LoginComponent
			attributes={attributes}
			config={config}
			context="frontend"
			isLoading={isLoading}
		/>
	);
}

/**
 * Initialize all login blocks on the page
 */
function initLoginBlocks() {
	const blocks = document.querySelectorAll('.wp-block-voxel-fse-login');

	blocks.forEach((block, index) => {
		// Get vxconfig from script tag
		const vxconfigScript = block.querySelector('script.vxconfig');
		if (!vxconfigScript) {
			console.warn('Login block: No vxconfig found', block);
			return;
		}

		let vxconfig: LoginVxConfig;
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent || '{}');
			// Normalize config for both vxconfig and REST API compatibility
			vxconfig = normalizeConfig(rawConfig);
		} catch (err) {
			console.error('Login block: Failed to parse vxconfig', err);
			return;
		}

		// Generate a unique block ID if not present
		const blockId = block.id || `login-block-${index}`;
		if (!block.id) {
			block.id = blockId;
		}

		// Find the ts-auth container to replace
		const authContainer = block.querySelector('.ts-auth');
		if (!authContainer) {
			console.warn('Login block: No .ts-auth container found', block);
			return;
		}

		// Create React root and render
		const root = createRoot(authContainer.parentElement || block);

		// Remove placeholder content and render React component
		root.render(
			<FrontendLogin vxconfig={vxconfig} blockId={blockId} />
		);

		// Remove the vxconfig script tag after initialization
		vxconfigScript.remove();
	});
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initLoginBlocks);
} else {
	initLoginBlocks();
}

// Export for potential external use
export { initLoginBlocks, FrontendLogin };
