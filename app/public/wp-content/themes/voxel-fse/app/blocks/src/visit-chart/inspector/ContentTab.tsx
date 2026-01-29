/**
 * Visit Chart Block - Content Tab Inspector Controls
 *
 * Provides inspector controls for chart settings and icons.
 * Uses AccordionPanelGroup for collapsible sections.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	AdvancedIconControl,
} from '@shared/controls';
import type { IconValue } from '@shared/types';

interface ContentTabProps {
	attributes: {
		source: 'post' | 'user' | 'site';
		activeChart: '24h' | '7d' | '30d' | '12m';
		viewType: 'views' | 'unique_views';
		chartIcon: IconValue;
		chevronRight: IconValue;
		chevronLeft: IconValue;
		contentTabOpenPanel?: string;
		[key: string]: any;
	};
	setAttributes: (attrs: Partial<ContentTabProps['attributes']>) => void;
}

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
			<AccordionPanel id="chart" title={__('Chart', 'voxel-fse')}>
				<SelectControl
					label={__('Show stats for', 'voxel-fse')}
					value={attributes.source}
					options={[
						{ label: __('Current post', 'voxel-fse'), value: 'post' },
						{ label: __('Current user', 'voxel-fse'), value: 'user' },
						{ label: __('Sitewide stats', 'voxel-fse'), value: 'site' },
					]}
					onChange={(value) =>
						setAttributes({
							source: value as 'post' | 'user' | 'site',
						})
					}
				/>

				<SelectControl
					label={__('Default view', 'voxel-fse')}
					value={attributes.activeChart}
					options={[
						{ label: __('24 hours', 'voxel-fse'), value: '24h' },
						{ label: __('7 days', 'voxel-fse'), value: '7d' },
						{ label: __('30 days', 'voxel-fse'), value: '30d' },
						{ label: __('12 months', 'voxel-fse'), value: '12m' },
					]}
					onChange={(value) =>
						setAttributes({
							activeChart: value as '24h' | '7d' | '30d' | '12m',
						})
					}
				/>

				<SelectControl
					label={__('Display data', 'voxel-fse')}
					value={attributes.viewType}
					options={[
						{ label: __('Total views', 'voxel-fse'), value: 'views' },
						{ label: __('Unique views', 'voxel-fse'), value: 'unique_views' },
					]}
					onChange={(value) =>
						setAttributes({
							viewType: value as 'views' | 'unique_views',
						})
					}
				/>
			</AccordionPanel>

			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.chartIcon}
					onChange={(value: IconValue) =>
						setAttributes({ chartIcon: value })
					}
					supportsDynamicTags={true}
					dynamicTagContext="post"
				/>

				<AdvancedIconControl
					label={__('Right chevron', 'voxel-fse')}
					value={attributes.chevronRight}
					onChange={(value: IconValue) =>
						setAttributes({ chevronRight: value })
					}
					supportsDynamicTags={true}
					dynamicTagContext="post"
				/>

				<AdvancedIconControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.chevronLeft}
					onChange={(value: IconValue) =>
						setAttributes({ chevronLeft: value })
					}
					supportsDynamicTags={true}
					dynamicTagContext="post"
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
