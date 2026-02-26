/**
 * Review Stats Block - Entry Point
 *
 * Registers the block with WordPress.
 * Converted from Voxel Elementor widget using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { BlockConfiguration } from '@wordpress/blocks';
import type { ReviewStatsVxConfig } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Deprecated save v1 - with loading spinners
 * This was the old format before we fixed the Voxel behavior matching
 */
const deprecatedSaveV1 = ({ attributes }: { attributes: any }) => {
	const blockProps = (useBlockProps as any).save({
		className: 'vxfse-review-stats',
	});

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

	const styleVars: Record<string, string> = {};
	if (attributes.columns.desktop) {
		styleVars['--rs-grid-columns'] = `repeat(${attributes.columns.desktop}, 1fr)`;
	}
	if (attributes.itemGap.desktop) {
		styleVars['--rs-grid-gap'] = attributes.itemGap.desktop;
	}
	if (attributes.iconSize.desktop) {
		styleVars['--rs-icon-size'] = attributes.iconSize.desktop;
	}
	if (attributes.iconSpacing) {
		styleVars['--rs-icon-spacing'] = `${attributes.iconSpacing}px`;
	}
	if (attributes.labelColor) {
		styleVars['--rs-label-color'] = attributes.labelColor;
	}
	if (attributes.scoreColor) {
		styleVars['--rs-score-color'] = attributes.scoreColor;
	}
	if (attributes.chartBgColor) {
		styleVars['--rs-chart-bg'] = attributes.chartBgColor;
	}
	if (attributes.chartHeight.desktop) {
		styleVars['--rs-chart-height'] = attributes.chartHeight.desktop;
	}
	if (attributes.chartRadius.desktop) {
		styleVars['--rs-chart-radius'] = attributes.chartRadius.desktop;
	}
	if (attributes.labelTypography?.fontSize) {
		const unit = attributes.labelTypography.fontSizeUnit || 'px';
		styleVars['--rs-label-font-size'] = `${attributes.labelTypography.fontSize}${unit}`;
	}
	if (attributes.scoreTypography?.fontSize) {
		const unit = attributes.scoreTypography.fontSizeUnit || 'px';
		styleVars['--rs-score-font-size'] = `${attributes.scoreTypography.fontSize}${unit}`;
	}

	const visibilityClasses = [
		attributes.hideDesktop ? 'vxfse-hide-desktop' : '',
		attributes.hideTablet ? 'vxfse-hide-tablet' : '',
		attributes.hideMobile ? 'vxfse-hide-mobile' : '',
		attributes.customClasses || '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div
			{...blockProps}
			data-block-id={attributes.blockId}
			data-stat-mode={attributes.statMode}
			className={`${blockProps.className} ${visibilityClasses}`.trim()}
			style={styleVars as React.CSSProperties}
		>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
			/>
			<div className="ts-review-bars" style={styleVars as React.CSSProperties}>
				<div className="ts-percentage-bar excellent">
					<div className="ts-bar-data">
						<p>
							Excellent
							<span>
								<span className="ts-loader" style={{ width: '16px', height: '16px' }}></span>
							</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
				<div className="ts-percentage-bar very_good">
					<div className="ts-bar-data">
						<p>
							Very Good
							<span>
								<span className="ts-loader" style={{ width: '16px', height: '16px' }}></span>
							</span>
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
							<span>
								<span className="ts-loader" style={{ width: '16px', height: '16px' }}></span>
							</span>
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
							<span>
								<span className="ts-loader" style={{ width: '16px', height: '16px' }}></span>
							</span>
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
							<span>
								<span className="ts-loader" style={{ width: '16px', height: '16px' }}></span>
							</span>
						</p>
					</div>
					<div className="ts-bar-chart">
						<div style={{ width: '0%' }}></div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Deprecation definitions for block migration
const deprecated = [
	{
		// Version 1: With loading spinners and vxfse-loading class
		attributes: {
			blockId: { type: 'string' },
			statMode: { type: 'string', default: 'overall' },
			columns: { type: 'object', default: { desktop: 1 } },
			itemGap: { type: 'object', default: { desktop: '' } },
			iconSize: { type: 'object', default: { desktop: '' } },
			iconSpacing: { type: 'number' },
			labelTypography: { type: 'object', default: {} },
			labelColor: { type: 'string', default: '' },
			scoreTypography: { type: 'object', default: {} },
			scoreColor: { type: 'string', default: '' },
			chartBgColor: { type: 'string', default: '' },
			chartHeight: { type: 'object', default: { desktop: '' } },
			chartRadius: { type: 'object', default: { desktop: '' } },
			hideDesktop: { type: 'boolean', default: false },
			hideTablet: { type: 'boolean', default: false },
			hideMobile: { type: 'boolean', default: false },
			customClasses: { type: 'string', default: '' },
		},
		save: deprecatedSaveV1,
	},
];

// Register the block
registerBlockType(metadata.name as string, {
	...(metadata as unknown as BlockConfiguration<Record<string, unknown>>),
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
