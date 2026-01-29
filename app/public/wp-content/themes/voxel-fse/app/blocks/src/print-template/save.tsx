/**
 * Print Template Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern matches search-form's save.tsx:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { PrintTemplateAttributes } from './types';

interface SaveProps {
	attributes: PrintTemplateAttributes;
}

export default function save({ attributes }: SaveProps) {
	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || 'print-template',
		baseClass: 'voxel-fse-print-template ts-print-template',
	});

	// Build class list matching Voxel's print-template pattern
	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		'data-template-id': attributes.templateId || '',
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
	// Contains all configuration needed by frontend.tsx
	const vxConfig = {
		templateId: attributes.templateId || '',
		hideDesktop: attributes.hideDesktop ?? false,
		hideTablet: attributes.hideTablet ?? false,
		hideMobile: attributes.hideMobile ?? false,
		customClasses: attributes.customClasses || '',
	};

	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab */}
			{advancedProps.responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration - will be replaced by PrintTemplateComponent */}
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
		</div>
	);
}
