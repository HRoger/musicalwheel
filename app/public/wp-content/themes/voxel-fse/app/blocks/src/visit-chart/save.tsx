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
								width="80"
								height="80"
								viewBox="0 0 24 25"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								transform="rotate(0 0 0)"
								style={{ opacity: 0.4 }}
							>
								<path
									d="M11.833 3.75C10.5904 3.75 9.58301 4.75736 9.58301 6V18.9991C9.58301 20.2417 10.5904 21.2491 11.833 21.2491H12.1663C13.409 21.2491 14.4163 20.2417 14.4163 18.9991V6C14.4163 4.75736 13.409 3.75 12.1663 3.75H11.833Z"
									fill="#343C54"
								/>
								<path
									d="M5.5 12.5625C4.25736 12.5625 3.25 13.5699 3.25 14.8125V19C3.25 20.2426 4.25736 21.25 5.5 21.25H5.83333C7.07597 21.25 8.08333 20.2426 8.08333 19V14.8125C8.08333 13.5699 7.07598 12.5625 5.83333 12.5625H5.5Z"
									fill="#343C54"
								/>
								<path
									d="M18.166 8.66016C16.9234 8.66016 15.916 9.66752 15.916 10.9102V19.0001C15.916 20.2427 16.9234 21.2501 18.166 21.2501H18.4993C19.742 21.2501 20.7493 20.2427 20.7493 19.0001V10.9102C20.7493 9.66752 19.742 8.66016 18.4993 8.66016H18.166Z"
									fill="#343C54"
								/>
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
