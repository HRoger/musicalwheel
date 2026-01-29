/**
 * Sales Chart Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Uses AccordionPanelGroup/AccordionPanel for native Gutenberg styling.
 *
 * Evidence:
 * - Voxel widget controls: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php:30-82
 *
 * @package VoxelFSE
 */

import React from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	AdvancedIconControl,
} from '@shared/controls';
import type { SalesChartAttributes } from '../types';
import type { IconValue } from '@shared/types';

interface ContentTabProps {
	attributes: SalesChartAttributes;
	setAttributes: (attrs: Partial<SalesChartAttributes>) => void;
}

/**
 * Content Tab Component
 *
 * Contains two accordion sections:
 * 1. Chart - Default view selector
 * 2. Icons - Icon controls (using AdvancedIconControl for large preview)
 */
export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="chart"
		>
			{/* Chart Accordion */}
			<AccordionPanel id="chart" title={__('Chart', 'voxel-fse')}>
				<SelectControl
					label={__('Default view', 'voxel-fse')}
					value={attributes.ts_active_chart}
					options={[
						{ label: __('Week', 'voxel-fse'), value: 'this-week' },
						{ label: __('Month', 'voxel-fse'), value: 'this-month' },
						{ label: __('Year', 'voxel-fse'), value: 'this-year' },
						{ label: __('All time', 'voxel-fse'), value: 'all-time' },
					]}
					onChange={(value) =>
						setAttributes({
							ts_active_chart: value as SalesChartAttributes['ts_active_chart'],
						})
					}
				/>
			</AccordionPanel>

			{/* Icons Accordion - Using AdvancedIconControl */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.chart_icon}
					onChange={(value: IconValue) =>
						setAttributes({ chart_icon: value })
					}
					supportsDynamicTags={true}
				/>

				<AdvancedIconControl
					label={__('Right chevron', 'voxel-fse')}
					value={attributes.ts_chevron_right}
					onChange={(value: IconValue) =>
						setAttributes({ ts_chevron_right: value })
					}
					supportsDynamicTags={true}
				/>

				<AdvancedIconControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.ts_chevron_left}
					onChange={(value: IconValue) =>
						setAttributes({ ts_chevron_left: value })
					}
					supportsDynamicTags={true}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
