/**
 * Review Stats Block - Save Component (Plan C+)
 *
 * Outputs static HTML with vxconfig JSON for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * The save function outputs:
 * 1. A vxconfig script tag with block configuration
 * 2. A placeholder that will be replaced by React hydration
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateReviewStatsResponsiveCSS } from './styles';
import type { ReviewStatsAttributes, ReviewStatsVxConfig } from './types';

interface SaveProps {
	attributes: ReviewStatsAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockId = attributes.blockId || 'review-stats';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'vxfse-review-stats',
	});

	// Generate block-specific responsive CSS
	const reviewStatsResponsiveCSS = generateReviewStatsResponsiveCSS(attributes, blockId);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, reviewStatsResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	// Build wrapper props with Voxel-compatible classes
	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		// Note: style will be merged with styleVars below
	});

	// Build vxconfig for frontend hydration
	// This contains all styling information needed to render the component
	const vxconfig: ReviewStatsVxConfig = {
		statMode: attributes.statMode,
		columns: attributes.columns,
		columns_tablet: attributes.columns_tablet,
		columns_mobile: attributes.columns_mobile,
		itemGap: attributes.itemGap,
		itemGap_tablet: attributes.itemGap_tablet,
		itemGap_mobile: attributes.itemGap_mobile,
		iconSize: attributes.iconSize,
		iconSize_tablet: attributes.iconSize_tablet,
		iconSize_mobile: attributes.iconSize_mobile,
		iconSpacing: attributes.iconSpacing,
		labelTypography: attributes.labelTypography,
		labelColor: attributes.labelColor,
		scoreTypography: attributes.scoreTypography,
		scoreColor: attributes.scoreColor,
		chartBgColor: attributes.chartBgColor,
		chartHeight: attributes.chartHeight,
		chartHeight_tablet: attributes.chartHeight_tablet,
		chartHeight_mobile: attributes.chartHeight_mobile,
		chartRadius: attributes.chartRadius,
		chartRadius_tablet: attributes.chartRadius_tablet,
		chartRadius_mobile: attributes.chartRadius_mobile,
	};

	// Build CSS variables from attributes for initial render
	const styleVars: Record<string, string> = {};

	// Grid columns
	if (attributes.columns) {
		styleVars['--rs-grid-columns'] = `repeat(${attributes.columns}, 1fr)`;
	}

	// Item gap
	if (attributes.itemGap !== undefined) {
		styleVars['--rs-grid-gap'] = `${attributes.itemGap}px`;
	}

	// Icon size
	if (attributes.iconSize) {
		styleVars['--rs-icon-size'] = `${attributes.iconSize}px`;
	}

	// Icon spacing
	if (attributes.iconSpacing) {
		styleVars['--rs-icon-spacing'] = `${attributes.iconSpacing}px`;
	}

	// Colors
	if (attributes.labelColor) {
		styleVars['--rs-label-color'] = attributes.labelColor;
	}
	if (attributes.scoreColor) {
		styleVars['--rs-score-color'] = attributes.scoreColor;
	}
	if (attributes.chartBgColor) {
		styleVars['--rs-chart-bg'] = attributes.chartBgColor;
	}

	// Chart dimensions
	if (attributes.chartHeight) {
		styleVars['--rs-chart-height'] = `${attributes.chartHeight}px`;
	}
	if (attributes.chartRadius) {
		styleVars['--rs-chart-radius'] = `${attributes.chartRadius}px`;
	}

	// Typography (simplified - just font-size for now)
	if (attributes.labelTypography?.fontSize) {
		const unit = attributes.labelTypography.fontSizeUnit || 'px';
		styleVars['--rs-label-font-size'] = `${attributes.labelTypography.fontSize}${unit}`;
	}
	if (attributes.scoreTypography?.fontSize) {
		const unit = attributes.scoreTypography.fontSizeUnit || 'px';
		styleVars['--rs-score-font-size'] = `${attributes.scoreTypography.fontSize}${unit}`;
	}

	// Merge advancedProps.styles with component styleVars
	const mergedStyles = {
		...styleVars,
		...(advancedProps.styles || {}),
	};

	return (
		<div
			{...blockProps}
			data-block-id={attributes.blockId}
			data-stat-mode={attributes.statMode}
			style={mergedStyles as React.CSSProperties}
			// Headless-ready: Visibility rules configuration
			data-visibility-behavior={attributes.visibilityBehavior || undefined}
			data-visibility-rules={attributes.visibilityRules?.length
				? JSON.stringify(attributes.visibilityRules)
				: undefined}
			// Headless-ready: Loop element configuration
			data-loop-source={attributes.loopSource || undefined}
			data-loop-limit={attributes.loopLimit || undefined}
			data-loop-offset={attributes.loopOffset || undefined}
			{...advancedProps.customAttrs}
		>
			{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
			{/* Vxconfig JSON for frontend hydration (matching Voxel pattern) */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
			/>

			{/* Skeleton bars matching Voxel HTML structure - shows 0% immediately, React will update with actual data */}
			<div className="ts-review-bars" style={styleVars as React.CSSProperties}>
				<div className="ts-percentage-bar excellent">
					<div className="ts-bar-data">
						<p>
							Excellent
							<span>0%</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
				<div className="ts-percentage-bar very_good">
					<div className="ts-bar-data">
						<p>
							Very good
							<span>0%</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
				<div className="ts-percentage-bar good">
					<div className="ts-bar-data">
						<p>
							Good
							<span>0%</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
				<div className="ts-percentage-bar fair">
					<div className="ts-bar-data">
						<p>
							Fair
							<span>0%</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
				<div className="ts-percentage-bar poor">
					<div className="ts-bar-data">
						<p>
							Poor
							<span>0%</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
			</div>
		</div>
	);
}
