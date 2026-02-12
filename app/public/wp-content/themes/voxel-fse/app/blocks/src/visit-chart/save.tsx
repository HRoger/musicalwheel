/**
 * Visit Chart Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig JSON for React hydration.
 * NO render.php - follows headless-ready architecture.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateVisitChartResponsiveCSS } from './styles';
import type { SaveProps, ChartTimeframe, VisitChartVxConfig } from './types';

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		const blockId = attributes.blockId || 'visit-chart';

		// Use shared utility for AdvancedTab + VoxelTab wiring
		// This handles: styles, className, responsiveCSS, customAttrs, elementId
		const advancedProps = getAdvancedVoxelTabProps(attributes, {
			blockId,
			baseClass: 'ts-visits-chart voxel-fse-visit-chart-frontend',
		});

		// Generate visit-chart-specific responsive CSS
		const visitChartResponsiveCSS = generateVisitChartResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, visitChartResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		const blockProps = useBlockProps.save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			style: advancedProps.styles,
			'data-source': attributes.source,
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
		// Note: nonce and postId will be set by frontend.tsx after page load
		const vxConfig: Omit<VisitChartVxConfig, 'nonce' | 'postId'> & {
			nonce: string;
			postId: number | null;
		} = {
			source: attributes.source,
			activeChart: attributes.activeChart,
			viewType: attributes.viewType,
			nonce: '', // Will be populated on frontend
			postId: null, // Will be populated on frontend
			charts: {
				'24h': { loaded: false },
				'7d': { loaded: false },
				'30d': { loaded: false },
				'12m': { loaded: false },
			} as Record<ChartTimeframe, { loaded: boolean }>,
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
				{/* Placeholder for React hydration - shows loading state */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f5f5f5',
							padding: '40px 20px',
							minHeight: '300px',
							borderRadius: '8px',
						}}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: '12px',
								color: '#666',
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
								<rect x="4" y="12" width="4" height="8" rx="0.5" />
								<rect x="10" y="8" width="4" height="12" rx="0.5" />
								<rect x="16" y="4" width="4" height="16" rx="0.5" />
							</svg>
							<span style={{ fontSize: '14px', fontWeight: 500 }}>
								Visit Chart (VX)
							</span>
						</div>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
