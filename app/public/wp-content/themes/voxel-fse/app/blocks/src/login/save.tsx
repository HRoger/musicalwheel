/**
 * Login/Register Block - Save Component
 *
 * Outputs:
 * 1. Placeholder HTML structure with Voxel's CSS classes
 * 2. Script tag with vxconfig JSON for frontend hydration
 *
 * Plan C+ Architecture: No PHP rendering, React hydration on frontend.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '../../shared/utils/generateAdvancedStyles';
import { generateMotionEffectsData } from '../../shared/utils/generateMotionEffectsData';
import { renderBackgroundElements } from '../../shared/utils/backgroundElements';
import { generateVoxelStyles, generateVoxelResponsiveCSS } from '../../shared/utils/generateVoxelStyles';
import { generateBlockResponsiveCSS } from './styles';
import type { LoginAttributes, LoginVxConfig } from './types';

interface SaveProps {
	attributes: LoginAttributes;
}

/**
 * Build vxconfig object from attributes
 */
function buildVxConfig(attributes: LoginAttributes): LoginVxConfig {
	return {
		previewScreen: attributes.previewScreen,
		loginTitle: attributes.loginTitle,
		registerTitle: attributes.registerTitle,
		confirmTitle: attributes.confirmTitle,
		passwordRecoveryTitle: attributes.passwordRecoveryTitle,
		confirmCodeTitle: attributes.confirmCodeTitle,
		newPasswordTitle: attributes.newPasswordTitle,
		updatePasswordTitle: attributes.updatePasswordTitle,
		updateEmailTitle: attributes.updateEmailTitle,
		welcomeTitle: attributes.welcomeTitle,
		roleSource: attributes.roleSource,
		manualRoles: attributes.manualRoles,
		icons: {
			google: attributes.googleIcon,
			signUp: attributes.signUpIcon,
			username: attributes.usernameIcon,
			password: attributes.passwordIcon,
			eye: attributes.eyeIcon,
			email: attributes.emailIcon,
			welcome: attributes.welcomeIcon,
			leftChevron: attributes.leftChevronIcon,
			privacy: attributes.privacyIcon,
			trash: attributes.trashIcon,
			logout: attributes.logoutIcon,
			phone: attributes.phoneIcon,
			link: attributes.linkIcon,
			calendar: attributes.calendarIcon,
			taxonomy: attributes.taxonomyIcon,
			upload: attributes.uploadIcon,
			copy: attributes.copyIcon,
			cloud: attributes.cloudIcon,
			device: attributes.deviceIcon,
			shield: attributes.shieldIcon,
		},
	};
}

export default function save({ attributes }: SaveProps) {
	const blockId = attributes.blockId || 'block'; // Fallback if no ID
	const uniqueSelector = `.voxel-fse-login-${blockId}`;

	// Generate styles
	const advancedStyles = generateAdvancedStyles(attributes as any);
	const voxelStyles = generateVoxelStyles(attributes as any);
	// No block-specific inline styles for login block (all responsive/class-based)

	// Generate responsive CSS
	const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes as any, uniqueSelector);
	const voxelResponsiveCSS = generateVoxelResponsiveCSS(attributes as any, uniqueSelector);
	const blockResponsiveCSS = generateBlockResponsiveCSS(attributes, uniqueSelector);
	const combinedResponsiveCSS = [advancedResponsiveCSS, voxelResponsiveCSS, blockResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	// Parse custom attributes
	const customAttrs = parseCustomAttributes(attributes.customAttributes);

	const blockProps = (useBlockProps as any).save({
		className: combineBlockClasses(
			`voxel-fse-login voxel-fse-login-${blockId}`,
			attributes as any
		),
		style: { ...advancedStyles, ...voxelStyles },
		...customAttrs,
	});

	// Generate Motion Effects data
	const motionEffectsData = generateMotionEffectsData(attributes as any);
	if (motionEffectsData) {
		blockProps['data-settings'] = motionEffectsData;
	}

	// Build vxconfig for frontend hydration
	const vxconfig = buildVxConfig(attributes);

	return (
		<div {...blockProps}>
			{/* Responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements (from Advanced tab) */}
			{renderBackgroundElements(attributes, false, undefined, undefined, uniqueSelector)}

			{/* Placeholder structure matching Voxel's HTML for CSS inheritance */}
			<div className="ts-auth">
				<div className="ts-form ts-login">
					<div className="ts-login-head">
						<span className="vx-step-title">{attributes.loginTitle}</span>
					</div>
					<div className="login-section">
						<div className="ts-form-group">
							<div className="ts-input-icon flexify">
								<i className="las la-user"></i>
								<input
									className="ts-filter"
									type="text"
									placeholder="Username"
									disabled
								/>
							</div>
						</div>
						<div className="ts-form-group ts-password-field">
							<div className="ts-input-icon flexify">
								<i className="las la-lock"></i>
								<input
									className="ts-filter"
									type="password"
									placeholder="Password"
									disabled
								/>
							</div>
						</div>
						<div className="ts-form-group">
							<button type="button" className="ts-btn ts-btn-2 ts-btn-large" disabled>
								<i className="las la-user"></i>
								Log in
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* VxConfig JSON for frontend hydration */}
			<script
				type="application/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(vxconfig),
				}}
			/>
		</div>
	);
}
