/**
 * Orders Block - Edit Component
 *
 * Editor interface with InspectorControls and preview using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useEffect, useMemo } from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '@shared/utils';

import OrdersComponent from './shared/OrdersComponent';
import { useOrdersConfig } from './hooks/useOrdersConfig';
import { ContentTab, StyleTab } from './inspector';
import { generateOrdersResponsiveCSS } from './styles';

import type { EditProps } from './types';

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Use shared utility for AdvancedTab + VoxelTab wiring (Layer 1)
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'vx-orders-widget voxel-fse-orders-editor',
		selectorPrefix: 'voxel-fse-orders',
	});

	// Generate orders-specific responsive CSS (Layer 2) with useMemo for performance
	const ordersResponsiveCSS = useMemo(
		() => generateOrdersResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS (Layer 1 + Layer 2)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, ordersResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, ordersResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// Fetch orders configuration from REST API
	const { config, isLoading, error } = useOrdersConfig();

	// Set block ID if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-orders-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/orders.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: () => (
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Output combined responsive CSS (AdvancedTab + VoxelTab + Style Tab) */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{isLoading && (
					<div className="ts-no-posts">
						<span className="ts-loader"></span>
					</div>
				)}

				{error && (
					<div className="voxel-fse-error">
						<span>{error}</span>
					</div>
				)}

				{!isLoading && !error && (
					<OrdersComponent
						attributes={attributes}
						config={config}
						orders={[]}
						currentOrder={null}
						context="editor"
						isLoading={false}
						error={null}
						currentPage={1}
						totalPages={1}
					/>
				)}
			</div>
		</>
	);
}
