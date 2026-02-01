/**
 * Timeline Kit Block - Editor Component
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/timeline-kit.php
 * - Popup-kit pattern: themes/voxel-fse/app/blocks/src/popup-kit/edit.tsx
 *
 * Styling-only block that applies CSS custom properties to .vxfeed timeline components.
 * Uses InspectorTabs with Style, Advanced, and Voxel tabs.
 */
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useMemo, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import { InspectorTabs } from '@shared/controls';
import { generateTimelineCSS } from './generateCSS';
import { EditProps } from './types';
import Demofeed from './Demofeed';
import { StyleTab } from './inspector';

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-social-feed-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/social-feed.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	const blockProps = useBlockProps({
		className: 'voxel-fse-timeline-kit-editor',
	});

	// Device state for responsive controls
	const wpDeviceType = useSelect((select: any) => {
		const editPostStore = select('core/edit-post');
		if (editPostStore && typeof editPostStore.getPreviewDeviceType === 'function') {
			return editPostStore.getPreviewDeviceType();
		}
		return 'Desktop';
	}, []);

	const wpDevice = wpDeviceType ? wpDeviceType.toLowerCase() as 'desktop' | 'tablet' | 'mobile' : 'desktop';

	// Build dynamic CSS that applies GLOBALLY to .vxfeed elements
	// Uses shared CSS generation function with current device for responsive values
	const dynamicCSS = useMemo(() => {
		return generateTimelineCSS(attributes, wpDevice);
	}, [attributes, wpDevice]);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921', // eicon-paint-brush
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

			{/* Inject dynamic styles GLOBALLY to .vxfeed elements */}
			<style dangerouslySetInnerHTML={{ __html: dynamicCSS }} />

			<div {...blockProps}>
				{/* Demo timeline preview (matching Voxel's demofeed structure 1:1) */}
				<Demofeed />
			</div>
		</>
	);
}
