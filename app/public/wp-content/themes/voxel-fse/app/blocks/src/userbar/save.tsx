/**
 * Userbar Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern matches Voxel widget's data structure:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { UserbarAttributes, UserbarVxConfig } from './types';
import { generateUserbarResponsiveCSS } from './styles';

interface SaveProps {
	attributes: UserbarAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'userbar';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'voxel-fse-userbar ts-user-area',
		});

		// Generate userbar-specific responsive CSS
		const userbarResponsiveCSS = generateUserbarResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		// Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, userbarResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Build class list matching Voxel's user-bar pattern
		const blockProps = (useBlockProps as any).save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			// Headless-ready: Visibility rules configuration
			'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
			'data-visibility-rules': ((attributes as any).visibilityRules as any)?.length
				? JSON.stringify(attributes['visibilityRules'])
				: undefined,
			// Headless-ready: Loop element configuration
			'data-loop-source': attributes['loopSource'] || undefined,
			'data-loop-limit': attributes['loopLimit'] || undefined,
			'data-loop-offset': attributes['loopOffset'] || undefined,
			...advancedProps.customAttrs,
		});

		// Build vxconfig JSON (matching Voxel pattern)
		// Contains all configuration needed by frontend.tsx
		const vxConfig: UserbarVxConfig = {
			items: attributes.items,
			icons: attributes.icons,
			settings: {
				itemsAlign: attributes.itemsAlign,
				verticalOrientation: attributes.verticalOrientation,
				verticalOrientationTablet: attributes.verticalOrientationTablet ?? false,
				verticalOrientationMobile: attributes.verticalOrientationMobile ?? false,
				itemContentAlign: attributes.itemContentAlign,
				hideChevron: attributes.hideChevron,
				customPopupEnable: attributes.customPopupEnable,
			},
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
				{/* Placeholder for React hydration - will be replaced by UserbarComponent */}
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
