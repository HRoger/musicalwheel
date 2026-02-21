/**
 * Orders Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig JSON for React hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateOrdersResponsiveCSS } from './styles';
import type { SaveProps, OrdersVxConfig } from './types';

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'orders';

		// Use shared utility for AdvancedTab + VoxelTab wiring (Layer 1)
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'vx-orders-widget voxel-fse-orders-frontend',
		});

		// Generate orders-specific responsive CSS (Layer 2)
		const ordersResponsiveCSS = generateOrdersResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS (Layer 1 + Layer 2)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, ordersResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		const blockProps = (useBlockProps as any).save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			'data-block-type': 'orders',
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
			'data-visibility-rules': (attributes['visibilityRules'] as any)?.length
				? JSON.stringify(attributes['visibilityRules'])
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes['loopSource'] || undefined,
			'data-loop-limit': attributes['loopLimit'] || undefined,
			'data-loop-offset': attributes['loopOffset'] || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON with all frontend-required attributes
		const vxConfig: OrdersVxConfig = {
			// Head settings
			headHide: attributes.headHide,
			ordersTitle: attributes.ordersTitle || 'Orders',
			ordersSubtitle: attributes.ordersSubtitle || 'View all orders related to your account',

			// Icons
			icons: {
				searchIcon: attributes.searchIcon || { library: 'icon', value: 'las la-search' },
				noResultsIcon: attributes.noResultsIcon || { library: 'icon', value: 'las la-inbox' },
				resetSearchIcon: attributes.resetSearchIcon || { library: 'icon', value: 'las la-sync' },
				backIcon: attributes.backIcon || { library: 'icon', value: 'las la-angle-left' },
				forwardIcon: attributes.forwardIcon || { library: 'icon', value: 'las la-angle-right' },
				downIcon: attributes.downIcon || { library: 'icon', value: 'las la-angle-down' },
				inboxIcon: attributes.inboxIcon || { library: 'icon', value: 'las la-inbox' },
				checkmarkIcon: attributes.checkmarkIcon || { library: 'icon', value: 'las la-check' },
				menuIcon: attributes.menuIcon || { library: 'icon', value: 'las la-ellipsis-h' },
				infoIcon: attributes.infoIcon || { library: 'icon', value: 'las la-info-circle' },
				filesIcon: attributes.filesIcon || { library: 'icon', value: 'las la-file' },
				trashIcon: attributes.trashIcon || { library: 'icon', value: 'las la-trash' },
				calendarIcon: attributes.calendarIcon || { library: 'icon', value: 'las la-calendar' },
			},

			// Styling (CSS custom properties)
			titleColor: attributes.titleColor || undefined,
			subtitleColor: attributes.subtitleColor || undefined,
			cardBackground: attributes.cardBackground || undefined,
			cardBackgroundHover: attributes.cardBackgroundHover || undefined,
			cardBorderRadius: attributes.cardBorderRadius || undefined,

			// Status colors
			statusPendingColor: attributes.statusPendingColor || undefined,
			statusCompletedColor: attributes.statusCompletedColor || undefined,
			statusCancelledColor: attributes.statusCancelledColor || undefined,
			statusRefundedColor: attributes.statusRefundedColor || undefined,

			// Button colors
			primaryButtonBackground: attributes.primaryButtonBackground || undefined,
			primaryButtonTextColor: attributes.primaryButtonTextColor || undefined,
			secondaryButtonBackground: attributes.secondaryButtonBackground || undefined,
			secondaryButtonTextColor: attributes.secondaryButtonTextColor || undefined,

			// Filter colors
			filterBackground: attributes.filterBackground || undefined,
			filterTextColor: attributes.filterTextColor || undefined,
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Placeholder for React hydration */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'column',
							gap: '8px',
							backgroundColor: '#f0f0f0',
							padding: '24px',
							minHeight: '120px',
							borderRadius: '4px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="32"
							height="32"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<rect x="4" y="4" width="4" height="4" rx="0.5" />
							<rect x="10" y="4" width="4" height="4" rx="0.5" />
							<rect x="16" y="4" width="4" height="4" rx="0.5" />
							<rect x="4" y="10" width="4" height="4" rx="0.5" />
							<rect x="10" y="10" width="4" height="4" rx="0.5" />
							<rect x="16" y="10" width="4" height="4" rx="0.5" />
							<rect x="4" y="16" width="4" height="4" rx="0.5" />
							<rect x="10" y="16" width="4" height="4" rx="0.5" />
							<rect x="16" y="16" width="4" height="4" rx="0.5" />
						</svg>
						<span style={{ opacity: 0.6, fontSize: '14px' }}>Orders (VX)</span>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
