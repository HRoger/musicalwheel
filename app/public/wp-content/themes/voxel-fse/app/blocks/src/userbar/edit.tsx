/**
 * Userbar Block - Editor Component
 *
 * 1:1 match with Voxel's User bar widget:
 * - Repeater control for user area components
 * - Multiple component types: notifications, cart, messages, user_menu, select_wp_menu, link
 * - Icon configuration
 * - Style controls
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/user-bar.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type { UserbarAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { useExpandedLoopItems } from '@shared/utils/useExpandedLoopItems';
import ContentTab from './inspector/ContentTab';
import StyleTab from './inspector/StyleTab';
import UserbarComponent from './shared/UserbarComponent';
import { generateUserbarResponsiveCSS } from './styles';

interface EditProps {
	attributes: UserbarAttributes;
	setAttributes: (attrs: Partial<UserbarAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Expand items with loop configuration for editor preview
	const { items: expandedItems } = useExpandedLoopItems({
		items: attributes.items,
	});

	const [navMenus, setNavMenus] = useState<Array<{ value: string; label: string }>>([
		{ value: '', label: __('Select menu', 'voxel-fse') },
	]);

	// Track when server config is loaded to trigger re-render (fixes avatar not showing on first load)
	const [configLoaded, setConfigLoaded] = useState(false);

	// Load nav menus and userbar config on mount
	useEffect(() => {
		// Fetch available nav menu locations from WordPress using navbar API
		const fetchMenus = async () => {
			try {
				const response = (await apiFetch({
					path: '/voxel-fse/v1/navbar/locations',
				})) as {
					locations: Array<{ slug: string; name: string }>;
				};

				if (response && response.locations) {
					const menuOptions = [
						{ value: '', label: __('Select menu', 'voxel-fse') },
						...response.locations.map((location: { slug: string; name: string }) => ({
							value: location.slug,
							label: location.name,
						})),
					];
					setNavMenus(menuOptions);
				}
			} catch (error) {
				// If REST API not available, use default
				console.error('Could not fetch nav menus:', error);
			}
		};
		fetchMenus();

		// Fetch userbar server config for editor context
		// This provides nonces, user data, menus, and unread counts
		// that window.VoxelFSEUserbar normally provides on the frontend
		const fetchUserbarConfig = async () => {
			try {
				const config = await apiFetch({ path: '/voxel-fse/v1/userbar/context' });
				if (config) {
					(window as any).VoxelFSEUserbar = config;
					// Also set VoxelFSEUser for avatar fallback
					const typedConfig = config as any;
					if (typedConfig.user) {
						(window as any).VoxelFSEUser = {
							isLoggedIn: true,
							id: typedConfig.user.id,
							displayName: typedConfig.user.displayName,
							avatarUrl: typedConfig.user.avatarUrl,
							avatarMarkup: typedConfig.user.avatarMarkup,
						};
					}
					// Trigger re-render so UserbarComponent picks up the new config
					setConfigLoaded(true);
				}
			} catch (error) {
				console.error('Could not fetch userbar config:', error);
			}
		};
		fetchUserbarConfig();
	}, []);

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}

		// Ensure items is an array
		if (!attributes.items) {
			setAttributes({ items: [] });
		}
	}, [attributes.blockId, attributes.items, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-commons-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/commons.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-userbar ts-user-area',
		selectorPrefix: 'voxel-fse-userbar',
	});

	// Generate userbar-specific responsive CSS with useMemo for performance
	const userbarResponsiveCSS = useMemo(
		() => generateUserbarResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, userbarResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, userbarResponsiveCSS]
	);

	// Inject popup-specific CSS into parent frame for editor live preview.
	// Popup elements are portaled to the parent frame's body, so CSS in the
	// editor iframe doesn't reach them. Extract .voxel-popup-* rules and
	// inject into the parent document.
	useEffect(() => {
		if (!combinedResponsiveCSS) return;

		const popupCssLines = combinedResponsiveCSS
			.split('\n')
			.filter(line => line.includes('.voxel-popup-'));

		if (popupCssLines.length === 0) return;

		const styleId = `userbar-popup-css-${blockId}`;
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement('style');
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = popupCssLines.join('\n');

		return () => {
			styleEl?.remove();
		};
	}, [combinedResponsiveCSS, blockId]);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	return (
		<div {...blockProps}>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							render: () => (
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
									navMenus={navMenus}
								/>
							)
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							)
						}
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Output combined responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Editor Preview — key changes when config loads to force re-render with avatar */}
			<UserbarComponent key={configLoaded ? 'loaded' : 'loading'} attributes={{ ...attributes, items: expandedItems }} context="editor" />
		</div>
	);
}
