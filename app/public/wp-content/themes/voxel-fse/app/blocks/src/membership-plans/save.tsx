/**
 * Membership Plans Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Evidence:
 * - Voxel widget template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
 * - Plan C+ pattern: docs/conversions/voxel-widget-conversion-master-guide.md
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { MembershipPlansAttributes, MembershipPlansVxConfig } from './types';
import { defaultIconValue } from './types';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '@shared/utils/generateAdvancedStyles';
import { renderBackgroundElements } from '@shared/utils/backgroundElements';
import { generateBlockResponsiveCSS } from './styles';

interface SaveProps {
	attributes: MembershipPlansAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockId = attributes.blockId || 'block';
	const uniqueSelector = `.voxel-fse-membership-plans-${blockId}`;

	// Generate Advanced tab styles
	const advancedStyles = generateAdvancedStyles(attributes);

	// Generate responsive CSS (Advanced tab + block-specific)
	const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);
	const blockResponsiveCSS = generateBlockResponsiveCSS(attributes, blockId);
	const combinedResponsiveCSS = [advancedResponsiveCSS, blockResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	// Parse custom attributes (key|value format)
	const customAttrs = parseCustomAttributes(attributes.customAttributes);

	// Build class list matching Voxel's pricing-plans pattern
	const blockProps = useBlockProps.save({
		id: attributes.elementId || undefined,
		className: combineBlockClasses(
			`voxel-fse-membership-plans voxel-fse-membership-plans-${blockId}`,
			attributes
		),
		style: advancedStyles,
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
	const vxConfig: MembershipPlansVxConfig = {
		priceGroups: attributes.priceGroups ?? [],
		planConfigs: attributes.planConfigs ?? {},
		arrowIcon: attributes.arrowIcon ?? defaultIconValue,
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
			{/* Background elements (video, slideshow, overlay, shape dividers) */}
			{renderBackgroundElements(attributes, false, undefined, undefined, uniqueSelector)}
			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration - will be replaced by MembershipPlansComponent */}
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
		</div>
	);
}
