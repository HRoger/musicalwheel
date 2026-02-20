/**
 * Current Plan Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Evidence:
 * - Voxel widget template: themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php
 * - Plan C+ pattern: docs/conversions/voxel-widget-conversion-master-guide.md
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { CurrentPlanAttributes, CurrentPlanVxConfig } from './types';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
} from '../../shared/utils/generateAdvancedStyles';
import { renderBackgroundElements } from '../../shared/utils/backgroundElements';
import { generateCurrentPlanResponsiveCSS } from './styles';

interface SaveProps {
	attributes: CurrentPlanAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'block';
		const uniqueSelector = `.voxel-fse-current-plan-${blockId}`;

		// Generate advanced styles
		const advancedStyles = generateAdvancedStyles(attributes);

		// Generate responsive CSS (block-specific + advanced)
		const blockCSS = generateCurrentPlanResponsiveCSS(attributes, uniqueSelector);
		const advancedCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);
		const responsiveCSS = blockCSS + '\n' + advancedCSS;

		// Parse custom attributes
		const customAttrs = parseCustomAttributes(attributes.customAttributes);

		// Build class list — DO NOT include ts-panel/plan-panel here,
		// those are rendered by CurrentPlanComponent inside the container.
		// Including them here causes a double-border (outer + inner both get .ts-panel border).
		const blockProps = (useBlockProps as any).save({
			id: attributes.elementId || undefined,
			className: combineBlockClasses(
				`voxel-fse-current-plan voxel-fse-current-plan-${blockId}`,
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
		const vxConfig: CurrentPlanVxConfig = {
			planIcon: attributes.planIcon ?? { library: '', value: '' },
			viewPlansIcon: attributes.viewPlansIcon ?? { library: '', value: '' },
			configureIcon: attributes.configureIcon ?? { library: '', value: '' },
			switchIcon: attributes.switchIcon ?? { library: '', value: '' },
			cancelIcon: attributes.cancelIcon ?? { library: '', value: '' },
			portalIcon: attributes.portalIcon ?? { library: '', value: '' },
		};

		return (
			<div {...blockProps}>
				{/* Responsive CSS */}
				{responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
				)}
				{/* Background elements (video, slideshow, overlay, shape dividers) */}
				{renderBackgroundElements(attributes, false, undefined, undefined, uniqueSelector)}
				{/* Voxel vxconfig pattern - configuration stored in JSON script */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{/* Placeholder for React hydration - will be replaced by CurrentPlanComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#e0e0e0',
							padding: '16px',
							minHeight: '48px',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
							style={{ opacity: 0.4 }}
						>
							<path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11zM12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
						</svg>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
