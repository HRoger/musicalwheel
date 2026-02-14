/**
 * Login/Register Block - Editor Component
 *
 * Provides InspectorControls and editor preview.
 * NO ServerSideRender - uses React component for preview.
 *
 * @package VoxelFSE
 */

import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import type { LoginAttributes, AuthConfig, AuthScreen } from './types';
import { IconPickerControl } from '@shared/controls/IconPickerControl';
import TagMultiSelect from '@shared/controls/TagMultiSelect';
import InspectorTabs from '@shared/controls/InspectorTabs';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import LoginComponent from './shared/LoginComponent';
import { DynamicTagTextControl } from '@shared/controls';
import { StyleTab, FieldStyleTab } from './inspector';
import {
	generateAdvancedStyles,
	combineBlockClasses,
} from '../../shared/utils/generateAdvancedStyles';
import { generateVoxelStyles, generateVoxelResponsiveCSS } from '../../shared/utils/generateVoxelStyles';
import { generateBlockStyles, generateBlockResponsiveCSS } from './styles';

interface EditProps {
	attributes: LoginAttributes;
	setAttributes: (attributes: Partial<LoginAttributes>) => void;
	clientId: string;
}

/**
 * Hook to fetch auth configuration from REST API
 */
function useAuthConfig(roleSource: string, manualRoles: string[]) {
	const [config, setConfig] = useState<AuthConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchConfig() {
			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					role_source: roleSource,
				});

				if (roleSource === 'manual' && manualRoles.length > 0) {
					manualRoles.forEach((role) => {
						params.append('manual_roles[]', role);
					});
				}

				const response = await fetch(
					`/wp-json/voxel-fse/v1/auth-config?${params.toString()}`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = (await response.json()) as AuthConfig;
				if (!cancelled) {
					setConfig(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load config');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchConfig();

		return () => {
			cancelled = true;
		};
	}, [roleSource, manualRoles]);

	return { config, isLoading, error };
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Generate unique block ID - use clientId as fallback for stable reference
	const blockId = attributes.blockId || clientId.substr(0, 8);

	// Ensure blockId is set in attributes (MUST be before any early returns to avoid hook order issues)
	useEffect(() => {
		if (!attributes.blockId || attributes.blockId !== clientId) {
			setAttributes({ blockId: clientId });
		}
	}, [clientId, attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-login-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/login.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Generate and merge styles
	const advancedStyles = useMemo(
		() => generateAdvancedStyles(attributes as any),
		[attributes]
	);

	const blockStyles = useMemo(
		() => generateBlockStyles(attributes),
		[attributes]
	);

	const voxelStyles = useMemo(
		() => generateVoxelStyles(attributes as any),
		[attributes]
	);

	const mergedStyle = { ...advancedStyles, ...voxelStyles, ...blockStyles };

	// Generate responsive CSS
	const responsiveCSS = useMemo(
		() => {
			const blockCSS = generateBlockResponsiveCSS(attributes, `.voxel-fse-login-${blockId}`);
			const voxelCSS = generateVoxelResponsiveCSS(attributes as any, `.voxel-fse-login-${blockId}`);
			return [blockCSS, voxelCSS].join('\n');
		},
		[attributes, blockId]
	);

	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`voxel-fse-login voxel-fse-login-${blockId}`,
			attributes as any
		),
		style: mergedStyle,
	});

	const { config, isLoading, error } = useAuthConfig(
		attributes.roleSource,
		attributes.manualRoles
	);

	// Screen options for preview
	const screenOptions: Array<{ value: AuthScreen; label: string }> = [
		{ value: 'login', label: __('Login', 'voxel-fse') },
		{ value: 'register', label: __('Register', 'voxel-fse') },
		{ value: 'confirm_account', label: __('Confirm account', 'voxel-fse') },
		{ value: 'recover', label: __('Recover', 'voxel-fse') },
		{ value: 'recover_confirm', label: __('Recover confirm code', 'voxel-fse') },
		{ value: 'recover_set_password', label: __('Recover set password', 'voxel-fse') },
		{ value: 'welcome', label: __('Welcome', 'voxel-fse') },
		{ value: 'security', label: __('Security', 'voxel-fse') },
		{ value: 'security_update_password', label: __('Update password', 'voxel-fse') },
		{ value: 'security_update_email', label: __('Update email', 'voxel-fse') },
	];

	// Role source options
	const roleSourceOptions = [
		{
			value: 'auto',
			label: __('Auto: All roles enabled for registration in WP Admin > Membership > Roles', 'voxel-fse'),
		},
		{
			value: 'manual',
			label: __('Manual: Choose and order registration roles manually', 'voxel-fse'),
		},
	];

	// Get available roles from config
	const availableRoles = config?.registration?.roles
		? Object.values(config.registration.roles).map((role) => ({
			value: role.key,
			label: role.label,
		}))
		: [];

	// Render Content Tab
	const renderContentTab = () => (
		<>
			{/* General Section */}
			<PanelBody title={__('General', 'voxel-fse')} initialOpen={true}>
				<SelectControl
					label={__('Preview screen', 'voxel-fse')}
					value={attributes.previewScreen}
					options={screenOptions}
					onChange={(value: string) => setAttributes({ previewScreen: value as AuthScreen })}
				/>

				<DynamicTagTextControl
					label={__('Login title', 'voxel-fse')}
					value={attributes.loginTitle}
					onChange={(value: string) => setAttributes({ loginTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Register title', 'voxel-fse')}
					value={attributes.registerTitle}
					onChange={(value: string) => setAttributes({ registerTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Confirm title', 'voxel-fse')}
					value={attributes.confirmTitle}
					onChange={(value: string) => setAttributes({ confirmTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Password recovery title', 'voxel-fse')}
					value={attributes.passwordRecoveryTitle}
					onChange={(value: string) => setAttributes({ passwordRecoveryTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Confirm code title', 'voxel-fse')}
					value={attributes.confirmCodeTitle}
					onChange={(value: string) => setAttributes({ confirmCodeTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('New password title', 'voxel-fse')}
					value={attributes.newPasswordTitle}
					onChange={(value: string) => setAttributes({ newPasswordTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Update password title', 'voxel-fse')}
					value={attributes.updatePasswordTitle}
					onChange={(value: string) => setAttributes({ updatePasswordTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Update email title', 'voxel-fse')}
					value={attributes.updateEmailTitle}
					onChange={(value: string) => setAttributes({ updateEmailTitle: value })}
				/>

				<DynamicTagTextControl
					label={__('Welcome title', 'voxel-fse')}
					value={attributes.welcomeTitle}
					onChange={(value: string) => setAttributes({ welcomeTitle: value })}
				/>
			</PanelBody>

			{/* Registration Section */}
			<PanelBody title={__('Registration', 'voxel-fse')} initialOpen={false}>
				<SelectControl
					label={__('Display registration roles', 'voxel-fse')}
					value={attributes.roleSource}
					options={roleSourceOptions}
					onChange={(value: string) =>
						setAttributes({ roleSource: value as 'auto' | 'manual' })
					}
				/>

				{attributes.roleSource === 'manual' && (
					<TagMultiSelect
						label={__('Choose roles', 'voxel-fse')}
						value={attributes.manualRoles}
						options={availableRoles}
						onChange={(value) => setAttributes({ manualRoles: value })}
					/>
				)}
			</PanelBody>

			{/* Icons Section */}
			<PanelBody title={__('Icons', 'voxel-fse')} initialOpen={false}>
				<IconPickerControl
					label={__('Google icon', 'voxel-fse')}
					value={attributes.googleIcon as any}
					onChange={(value) => setAttributes({ googleIcon: value })}
				/>

				<IconPickerControl
					label={__('Sign up icon', 'voxel-fse')}
					value={attributes.signUpIcon as any}
					onChange={(value) => setAttributes({ signUpIcon: value })}
				/>

				<IconPickerControl
					label={__('Username icon', 'voxel-fse')}
					value={attributes.usernameIcon as any}
					onChange={(value) => setAttributes({ usernameIcon: value })}
				/>

				<IconPickerControl
					label={__('Password icon', 'voxel-fse')}
					value={attributes.passwordIcon as any}
					onChange={(value) => setAttributes({ passwordIcon: value })}
				/>

				<IconPickerControl
					label={__('Eye icon', 'voxel-fse')}
					value={attributes.eyeIcon as any}
					onChange={(value) => setAttributes({ eyeIcon: value })}
				/>

				<IconPickerControl
					label={__('Email icon', 'voxel-fse')}
					value={attributes.emailIcon as any}
					onChange={(value) => setAttributes({ emailIcon: value })}
				/>

				<IconPickerControl
					label={__('Welcome icon', 'voxel-fse')}
					value={attributes.welcomeIcon as any}
					onChange={(value) => setAttributes({ welcomeIcon: value })}
				/>

				<IconPickerControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.leftChevronIcon as any}
					onChange={(value) => setAttributes({ leftChevronIcon: value })}
				/>

				<IconPickerControl
					label={__('Privacy icon', 'voxel-fse')}
					value={attributes.privacyIcon as any}
					onChange={(value) => setAttributes({ privacyIcon: value })}
				/>

				<IconPickerControl
					label={__('Trash icon', 'voxel-fse')}
					value={attributes.trashIcon as any}
					onChange={(value) => setAttributes({ trashIcon: value })}
				/>

				<IconPickerControl
					label={__('Log out icon', 'voxel-fse')}
					value={attributes.logoutIcon as any}
					onChange={(value) => setAttributes({ logoutIcon: value })}
				/>

				<IconPickerControl
					label={__('Phone icon', 'voxel-fse')}
					value={attributes.phoneIcon as any}
					onChange={(value) => setAttributes({ phoneIcon: value })}
				/>

				<IconPickerControl
					label={__('Link icon', 'voxel-fse')}
					value={attributes.linkIcon as any}
					onChange={(value) => setAttributes({ linkIcon: value })}
				/>

				<IconPickerControl
					label={__('Calendar icon', 'voxel-fse')}
					value={attributes.calendarIcon as any}
					onChange={(value) => setAttributes({ calendarIcon: value })}
				/>

				<IconPickerControl
					label={__('Taxonomy / Select icon', 'voxel-fse')}
					value={attributes.taxonomyIcon as any}
					onChange={(value) => setAttributes({ taxonomyIcon: value })}
				/>

				<IconPickerControl
					label={__('Upload icon', 'voxel-fse')}
					value={attributes.uploadIcon as any}
					onChange={(value) => setAttributes({ uploadIcon: value })}
				/>

				<IconPickerControl
					label={__('Copy icon', 'voxel-fse')}
					value={attributes.copyIcon as any}
					onChange={(value) => setAttributes({ copyIcon: value })}
				/>

				<IconPickerControl
					label={__('Cloud icon', 'voxel-fse')}
					value={attributes.cloudIcon as any}
					onChange={(value) => setAttributes({ cloudIcon: value })}
				/>

				<IconPickerControl
					label={__('Device icon', 'voxel-fse')}
					value={attributes.deviceIcon as any}
					onChange={(value) => setAttributes({ deviceIcon: value })}
				/>

				<IconPickerControl
					label={__('Shield icon', 'voxel-fse')}
					value={attributes.shieldIcon as any}
					onChange={(value) => setAttributes({ shieldIcon: value })}
				/>
			</PanelBody>
		</>
	);

	// Render Style Tab using the new StyleTab component
	const renderStyleTab = () => (
		<StyleTab
			attributes={attributes}
			setAttributes={setAttributes}
		/>
	);

	// Render Field Style Tab using the new FieldStyleTab component
	const renderFieldStyleTab = () => (
		<FieldStyleTab
			attributes={attributes}
			setAttributes={setAttributes}
		/>
	);

	// Loading state - use Voxel's ts-loader pattern instead of Gutenberg Placeholder
	if (isLoading) {
		return (
			<div {...blockProps}>
				<div className="ts-no-posts">
					<span className="ts-loader"></span>
				</div>
			</div>
		);
	}

	// Render InspectorTabs component
	const renderInspectorTabs = () => (
		<InspectorTabs
			tabs={[
				{
					id: 'content',
					label: __('Content', 'voxel-fse'),
					icon: '\ue92c', // eicons edit
					render: () => renderContentTab(),
				},
				{
					id: 'style',
					label: __('Style', 'voxel-fse'),
					icon: '\ue921', // eicons paint-brush
					render: () => renderStyleTab(),
				},
				{
					id: 'fieldStyle',
					label: __('Field style', 'voxel-fse'),
					icon: '\ue921', // eicons circle
					render: () => renderFieldStyleTab(),
				},
			]}
			includeAdvancedTab={true}
			includeVoxelTab={true}
			attributes={attributes}
			setAttributes={setAttributes}
			defaultTab="content"
			activeTabAttribute="loginActiveTab"
		/>
	);

	// Error state
	if (error) {
		return (
			<div {...blockProps}>
				<InspectorControls>
					{renderInspectorTabs()}
				</InspectorControls>
				<div className="ts-no-posts">
					<p>
						{__('Error loading configuration: ', 'voxel-fse')}
						{error}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<style>{responsiveCSS}</style>
			<InspectorControls>
				{renderInspectorTabs()}
			</InspectorControls>

			{/* Responsive CSS for Editor */}
			{responsiveCSS && (
				<style>{responsiveCSS}</style>
			)}

			{/* Editor Preview */}
			<LoginComponent
				attributes={attributes}
				config={config}
				context="editor"
				isLoading={isLoading}
			/>
		</div>
	);
}
