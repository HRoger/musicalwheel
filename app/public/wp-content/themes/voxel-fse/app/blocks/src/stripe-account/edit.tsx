/**
 * Stripe Account Block - Edit Component
 *
 * Editor interface with InspectorControls and preview using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useMemo, useEffect } from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	Button,
	Placeholder,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import {
	InspectorTabs,
} from '@shared/controls';

import StripeAccountComponent from './shared/StripeAccountComponent';
import { useStripeAccountConfig } from './hooks/useStripeAccountConfig';
import { ContentTab, StyleTab } from './inspector';

import type { StripeAccountAttributes } from './types';
import { generateBlockResponsiveCSS } from './styles';

/**
 * Edit props interface
 */
interface EditProps {
	attributes: StripeAccountAttributes;
	setAttributes: (attrs: Partial<StripeAccountAttributes>) => void;
	clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	const blockProps = useBlockProps({
		className: 'ts-vendor-settings voxel-fse-stripe-account-editor',
		'data-block-id': attributes.blockId || clientId,
	});

	// Fetch Stripe account configuration from REST API
	const previewUserId = attributes.previewAsUserDynamicTag || attributes.previewAsUser;
	const { config, isLoading, error } = useStripeAccountConfig(previewUserId);

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

	// Generate block-specific responsive CSS
	const css = useMemo(() => {
		return generateBlockResponsiveCSS(
			attributes,
			`.voxel-fse-stripe-account-editor[data-block-id="${attributes.blockId || clientId}"]`
		);
	}, [attributes, clientId]);

	return (
		<>
			{css && <style>{css}</style>}
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
				{error && (
					<Placeholder
						icon="warning"
						label={__('Stripe Account', 'voxel-fse')}
						instructions={error}
					>
						<Button variant="secondary" onClick={() => window.location.reload()}>
							{__('Retry', 'voxel-fse')}
						</Button>
					</Placeholder>
				)}

				{!error && config && (
					<StripeAccountComponent
						attributes={attributes}
						config={config}
						context="editor"
					/>
				)}

				{!error && !config && (
					<Placeholder
						icon="admin-users"
						label={__('Stripe Account', 'voxel-fse')}
						instructions={__('Configure Stripe Connect to enable vendor features.', 'voxel-fse')}
					/>
				)}
			</div>
		</>
	);
}
