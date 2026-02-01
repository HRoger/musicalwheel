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

	const [navMenus, setNavMenus] = useState<Array<{ value: string; label: string }>>([
		{ value: '', label: __('Select menu', 'voxel-fse') },
	]);

	// Load nav menus on mount
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

			{/* Editor Preview */}
			<UserbarComponent attributes={attributes} context="editor" />
		</div>
	);
}
