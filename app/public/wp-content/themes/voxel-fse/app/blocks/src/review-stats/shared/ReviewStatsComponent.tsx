/**
 * Review Stats Block - Shared Component
 *
 * Used by both edit.tsx (editor preview) and frontend.tsx (hydration).
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * HTML Structure (from Voxel widget):
 * <div class="ts-review-bars">
 *   <div class="ts-percentage-bar [level-key]" style="--ts-accent-1: [color]">
 *     <div class="ts-bar-data">
 *       [icon if by_category]
 *       <p>[label]<span>[score]</span></p>
 *     </div>
 *     <div class="ts-bar-chart">
 *       <div style="width: [percentage]%;"></div>
 *     </div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import type {
	ReviewStatsAttributes,
	ReviewStatsData,
	ReviewStatsComponentProps,
	ReviewStatsVxConfig,
} from '../types';

/**
 * Default rating levels matching Voxel's structure
 */
const DEFAULT_RATING_LEVELS = [
	{ key: 'excellent', label: __('Excellent', 'voxel-fse'), score: 2 },
	{ key: 'very_good', label: __('Very good', 'voxel-fse'), score: 1 },
	{ key: 'good', label: __('Good', 'voxel-fse'), score: 0 },
	{ key: 'fair', label: __('Fair', 'voxel-fse'), score: -1 },
	{ key: 'poor', label: __('Poor', 'voxel-fse'), score: -2 },
];

/**
 * Build inline styles from attributes
 * Uses actual CSS properties instead of CSS variables for direct styling
 */
function buildStyleVars(attributes: ReviewStatsAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// Grid columns - ts-review-bars uses CSS grid
	if (attributes.columns) {
		styles.gridTemplateColumns = `repeat(${attributes.columns}, 1fr)`;
	}

	// Item gap
	if (attributes.itemGap !== undefined) {
		styles.gap = `${attributes.itemGap}px`;
	}

	return styles;
}

/**
 * ReviewStatsComponent - Shared component for editor and frontend
 */
export default function ReviewStatsComponent({
	attributes,
	statsData,
	isLoading,
	error,
	context,
	postId,
}: ReviewStatsComponentProps) {
	// Build style variables
	const styleVars = buildStyleVars(attributes);

	// Build vxconfig for re-rendering in shared component (CRITICAL for DevTools visibility)
	const vxconfig: ReviewStatsVxConfig = {
		statMode: attributes.statMode,
		columns: attributes.columns,
		itemGap: attributes.itemGap,
		iconSize: attributes.iconSize,
		iconSpacing: attributes.iconSpacing,
		labelTypography: attributes.labelTypography,
		labelColor: attributes.labelColor,
		scoreTypography: attributes.scoreTypography,
		scoreColor: attributes.scoreColor,
		chartBgColor: attributes.chartBgColor,
		chartHeight: attributes.chartHeight,
		chartRadius: attributes.chartRadius,
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="ts-review-bars vxfse-loading" style={styleVars as React.CSSProperties}>
				<div className="vxfse-loading-state">
					<span className="ts-loader"></span>
					<span>{__('Loading review stats...', 'voxel-fse')}</span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="ts-review-bars vxfse-error" style={styleVars as React.CSSProperties}>
				<div className="vxfse-error-state">
					<span>{__('Error loading review stats', 'voxel-fse')}</span>
				</div>
			</div>
		);
	}

	// No data state - behavior depends on mode (matching Voxel original)
	if (!statsData) {
		// For by_category mode: show empty container (Voxel shows nothing when no categories)
		if (attributes.statMode === 'by_category') {
			return (
				<>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
					/>
					<div className="ts-review-bars" style={styleVars as React.CSSProperties}></div>
				</>
			);
		}

		// For overall mode (default): ALWAYS show 5 rating levels with 0%
		// This matches Voxel's original behavior - never shows a placeholder
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				<div className="ts-review-bars" style={styleVars as React.CSSProperties}>
					{DEFAULT_RATING_LEVELS.map((level) => (
						<div
							key={level.key}
							className={`ts-percentage-bar ${level.key}`}
						>
							<div className="ts-bar-data">
								<p>
									{level.label}
									<span>0%</span>
								</p>
							</div>
							<div className="ts-bar-chart">
								<div style={{ width: '0%' }}></div>
							</div>
						</div>
					))}
				</div>
			</>
		);
	}

	// Render based on stat mode
	if (attributes.statMode === 'by_category') {
		// By category mode - show category-specific stats with icons
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				<div className="ts-review-bars" style={styleVars as React.CSSProperties}>
					{statsData.byCategory.map((category) => {
						// Score is -2 to 2, convert to 0-5 scale for display
						const displayScore = Math.round((category.score + 3) * 10) / 10;
						const percentage = (displayScore / 5) * 100;

						return (
							<div
								key={category.key}
								className="ts-percentage-bar"
								style={category.color ? { '--ts-accent-1': category.color } as React.CSSProperties : undefined}
							>
								<div className="ts-bar-data">
									{/* Category icon */}
									{category.icon && (
										<span
											className="ts-category-icon"
											dangerouslySetInnerHTML={{ __html: category.icon }}
										/>
									)}
									<p>
										{category.label}
										<span>{displayScore.toFixed(1)} / 5</span>
									</p>
								</div>
								<div className="ts-bar-chart">
									<div style={{ width: `${percentage}%` }}></div>
								</div>
							</div>
						);
					})}
				</div>
			</>
		);
	}

	// Overall mode - show rating distribution (excellent, very good, etc.)
	// Reverse the order to show Excellent first (matching Voxel widget)
	const ratingLevels = [...(statsData.ratingLevels || DEFAULT_RATING_LEVELS)].reverse();

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
			/>
			<div className="ts-review-bars" style={styleVars as React.CSSProperties}>
				{ratingLevels.map((level) => {
					// Get percentage from stats data
					const percentage = statsData.overall[level.key as keyof typeof statsData.overall] || 0;

					return (
						<div
							key={level.key}
							className={`ts-percentage-bar ${level.key}`}
							style={level.color ? { '--ts-accent-1': level.color } as React.CSSProperties : undefined}
						>
							<div className="ts-bar-data">
								<p>
									{level.label}
									<span>{Math.round(percentage)}%</span>
								</p>
							</div>
							<div className="ts-bar-chart">
								<div style={{ width: `${percentage}%` }}></div>
							</div>
						</div>
					);
				})}
			</div>
		</>
	);
}
