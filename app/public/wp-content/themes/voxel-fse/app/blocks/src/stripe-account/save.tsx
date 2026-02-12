/**
 * Stripe Account Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig for React hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { StripeAccountAttributes } from './types';

interface SaveProps {
	attributes: StripeAccountAttributes;
}

/**
 * Convert icon attribute to icon value string for vxconfig
 */
function getIconValue(icon: StripeAccountAttributes['tsSetupIco']): string {
	if (!icon) return '';
	if (icon.library === 'svg' && icon.url) {
		return `svg:${icon.url}`;
	}
	if (icon.library === 'icon' && icon.value) {
		return icon.value;
	}
	return '';
}

import { generateBlockResponsiveCSS } from './styles';

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId: attributes.blockId || 'stripe-account',
			baseClass: 'ts-vendor-settings voxel-fse-stripe-account-frontend',
		});

		// Generate block-specific responsive CSS
		const styleTabCSS = generateBlockResponsiveCSS(
			attributes,
			advancedProps.uniqueSelector
		);

		// Combine Advanced Tab CSS with Style Tab CSS
		const finalCSS = advancedProps.responsiveCSS
			? `${advancedProps.responsiveCSS}\n${styleTabCSS}`
			: styleTabCSS;

		// Save wrapper element with vxconfig (matching Voxel pattern)
		const blockProps = useBlockProps.save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes.visibilityBehavior || undefined,
			'data-visibility-rules': attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes.loopSource || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Configuration will be populated by frontend after fetching from REST API
		const vxConfig = {
			// Image settings
			genImage: attributes.genImage || { id: 0, url: '' },
			genImageDynamicTag: attributes.genImageDynamicTag || '',

			// Icons - store as icon values for frontend rendering
			icons: {
				setup: getIconValue(attributes.tsSetupIco),
				submit: getIconValue(attributes.tsSubmitIco),
				update: getIconValue(attributes.tsUpdateIco),
				stripe: getIconValue(attributes.tsStripeIco),
				shipping: getIconValue(attributes.tsShippingIco),
				chevronLeft: getIconValue(attributes.tsChevronLeft),
				save: getIconValue(attributes.saveIcon),
				handle: getIconValue(attributes.handleIcon),
				zone: getIconValue(attributes.tsZoneIco),
				trash: getIconValue(attributes.trashIcon),
				down: getIconValue(attributes.downIcon),
				search: getIconValue(attributes.tsSearchIcon),
				add: getIconValue(attributes.tsAddIcon),
			},
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab + StyleTab */}
				{finalCSS && (
					<style dangerouslySetInnerHTML={{ __html: finalCSS }} />
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
					<div className="ts-panel">
						<div
							className="voxel-fse-block-placeholder"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: '#f0f0f0',
								padding: '40px',
								minHeight: '200px',
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="48"
								height="48"
								fill="currentColor"
								style={{ opacity: 0.3 }}
							>
								<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
							</svg>
						</div>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
