/**
 * Popup Kit Block - Editor Component
 *
 * Plan C+ Architecture: NO ServerSideRender, NO PHP rendering
 * 
 * This block is a CONFIGURATION block - it stores styling settings for popups
 * used by other blocks (create-post, search-form, etc.). It doesn't render
 * actual popup content in the editor, just shows a preview of the configuration.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/popup-kit.php
 * - Plan C+ guide: docs/block-conversions/voxel-widget-conversion-master-guide.md
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { InspectorTabs } from '@shared/controls';
import type { PopupKitEditProps } from './types';
import PopupKitPreview from './shared/PopupKitPreview';
import { generatePopupKitCSS } from './shared/generateCSS';
import { StyleTab } from './inspector';

export default function Edit({ attributes, setAttributes }: PopupKitEditProps) {
	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-popup-kit-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/popup-kit.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Generate CSS for preview
	const previewCSS = generatePopupKitCSS(attributes);

	const blockProps = useBlockProps({
		className: 'voxel-fse-popup-kit-editor',
	});

	// Disable all links in popup block when in editor (not frontend)
	useEffect(() => {
		const disableLinks = () => {
			// Find the popup block wrapper
			const blockWrapper = document.querySelector('.voxel-fse-popup-kit-editor');
			if (!blockWrapper) return;

			// Find all links within the popup block
			const links = blockWrapper.querySelectorAll('a[href]');

			links.forEach((link) => {
				// Store original href if not already stored
				if (!link.hasAttribute('data-original-href')) {
					link.setAttribute('data-original-href', link.getAttribute('href') || '');
				}

				// Prevent navigation
				link.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}, true); // Use capture phase to catch early
			});
		};

		// Run immediately
		disableLinks();

		// Also run after a short delay to catch ServerSideRender content
		const timeout = setTimeout(disableLinks, 100);

		// Set up observer to watch for new content (ServerSideRender updates)
		const observer = new MutationObserver(() => {
			disableLinks();
		});

		const blockWrapper = document.querySelector('.voxel-fse-popup-kit-editor');
		if (blockWrapper) {
			observer.observe(blockWrapper, {
				childList: true,
				subtree: true,
			});
		}

		return () => {
			clearTimeout(timeout);
			observer.disconnect();
		};
	}, [attributes]); // Re-run when attributes change (ServerSideRender updates)

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Plan C+ Preview: Shared component shows actual popup styling */}
			{/* Same component used in editor and frontend for consistency */}
			<div {...blockProps}>
				{/* Inline CSS for preview - updates live as attributes change */}
				<style type="text/css">{previewCSS}</style>
				<PopupKitPreview attributes={attributes} context="editor" />
			</div>
		</>
	);
}
