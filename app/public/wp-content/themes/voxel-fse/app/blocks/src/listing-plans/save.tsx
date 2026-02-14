/**
 * Listing Plans Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Evidence:
 * - Voxel widget template: themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php
 * - Plan C+ pattern: docs/conversions/voxel-widget-conversion-master-guide.md
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { ListingPlansAttributes, ListingPlansVxConfig } from './types';
import { defaultIconValue } from './types';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '@shared/utils/generateAdvancedStyles';
import { renderBackgroundElements } from '@shared/utils/backgroundElements';
import { generateBlockStyles, generateBlockResponsiveCSS } from './styles';

interface SaveProps {
	attributes: ListingPlansAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'block';
		const uniqueSelector = `.voxel-fse-listing-plans-${blockId}`;

		// Generate styles
		const advancedStyles = generateAdvancedStyles(attributes);
		const blockStyles = generateBlockStyles(attributes);
		const mergedStyles = { ...advancedStyles, ...blockStyles };

		// Generate responsive CSS
		const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);
		const blockResponsiveCSS = generateBlockResponsiveCSS(attributes, blockId);
		const combinedResponsiveCSS = [advancedResponsiveCSS, blockResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Parse custom attributes (key|value format)
		const customAttrs = parseCustomAttributes(attributes.customAttributes);

		// Build class list matching Voxel's listing-plans pattern
		const blockProps = useBlockProps.save({
			id: attributes.elementId || undefined,
			className: combineBlockClasses(
				`voxel-fse-listing-plans voxel-fse-listing-plans-${blockId}`,
				attributes
			),
			style: mergedStyles,
			...customAttrs,
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes.visibilityBehavior || undefined,
			'data-visibility-rules': attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes.loopSource || undefined,
			'data-loop-limit': attributes.loopLimit || undefined,
			'data-loop-offset': attributes.loopOffset || undefined,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		const vxConfig: ListingPlansVxConfig = {
			priceGroups: attributes.priceGroups ?? [],
			planConfigs: attributes.planConfigs ?? {},
			arrowIcon: attributes.arrowIcon ?? defaultIconValue,
			// Redirect options (Content Tab) — Evidence: listing-plans-widget.php:1549-1582
			directPurchaseRedirect: attributes.directPurchaseRedirect ?? 'order',
			directPurchasePostType: attributes.directPurchasePostType,
			directPurchaseCustomUrl: attributes.directPurchaseCustomUrl,
			style: {
				plansColumns: attributes.plansColumns ?? 3,
				plansColumns_tablet: attributes.plansColumns_tablet,
				plansColumns_mobile: attributes.plansColumns_mobile,
				plansGap: attributes.plansGap ?? 20,
				tabsDisabled: attributes.tabsDisabled ?? false,
				tabsJustify: attributes.tabsJustify ?? 'flex-start',
				pricingAlign: attributes.pricingAlign ?? 'flex-start',
				contentAlign: attributes.contentAlign ?? 'flex-start',
				descAlign: attributes.descAlign ?? 'left',
				listAlign: attributes.listAlign ?? 'flex-start',
			},
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}
				{/* Background elements */}
				{renderBackgroundElements(attributes, false, undefined, undefined, uniqueSelector)}
				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration - will be replaced by ListingPlansComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							padding: '40px 16px',
							minHeight: '200px',
							borderRadius: '8px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="48"
							height="48"
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
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
