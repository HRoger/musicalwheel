/**
 * Messages Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern matches Voxel widget's data structure:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/direct-messages/widgets/messages-widget.php
 *
 * @ts-nocheck - Dynamic Gutenberg properties
 * @package VoxelFSE
 */

// @ts-nocheck
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { MessagesAttributes, MessagesVxConfig } from './types';
import { generateMessagesResponsiveCSS } from './styles';

interface SaveProps {
	attributes: MessagesAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'messages';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'voxel-fse-messages',
		});

		// Generate messages-specific responsive CSS
		const messagesResponsiveCSS = generateMessagesResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, messagesResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Build class list matching Voxel's messages widget pattern
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
		// Contains all configuration needed by frontend.tsx
		const vxConfig: MessagesVxConfig = {
			icons: attributes.icons,
			settings: {
				enableCalcHeight: attributes.enableCalcHeight,
				calcHeight: attributes.calcHeight,
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
				{/* Placeholder for React hydration - will be replaced by MessagesComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f5f5f5',
							padding: '40px',
							minHeight: '400px',
							borderRadius: '8px',
							border: '1px solid #e0e0e0',
						}}
					>
						{/* Inbox icon placeholder */}
						<div style={{ textAlign: 'center', color: '#999' }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="48"
								height="48"
								fill="currentColor"
								style={{ opacity: 0.4 }}
							>
								<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
							</svg>
							<p style={{ margin: '12px 0 0', fontSize: '14px' }}>Messages Widget</p>
						</div>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
