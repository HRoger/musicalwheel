/**
 * Sales Chart Block - Save Function
 *
 * Plan C+ Architecture:
 * - Outputs minimal vxconfig JSON in <script> tag
 * - Outputs placeholder HTML
 * - No render.php needed
 * - Frontend hydration via frontend.tsx
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php
 *
 * @package VoxelFSE
 */

import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { renderIcon, DefaultChartIcon, DefaultChevronLeft, DefaultChevronRight } from './utils';
import type { BlockSaveProps } from '@wordpress/blocks';
import type { SalesChartAttributes, SalesChartVxConfig } from './types';
import { generateSalesChartResponsiveCSS } from './styles';

/**
 * Sales Chart Block Save Function
 *
 * Outputs:
 * 1. vxconfig JSON with block settings (charts loaded on frontend)
 * 2. Placeholder HTML matching Voxel's structure
 */
export default function save({
  attributes,
}: BlockSaveProps<SalesChartAttributes>): JSX.Element {
  const blockId = attributes.blockId || 'sales-chart';

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: 'voxel-fse-sales-chart',
    selectorPrefix: 'voxel-fse-sales-chart',
  });

  // Generate sales-chart specific responsive CSS
  const salesChartResponsiveCSS = generateSalesChartResponsiveCSS(attributes, blockId);

  // Combine all responsive CSS
  const combinedResponsiveCSS = [advancedProps.responsiveCSS, salesChartResponsiveCSS]
    .filter(Boolean)
    .join('\n');

  const blockProps = (useBlockProps as any).save({
    id: advancedProps.elementId,
    className: advancedProps.className,
    style: advancedProps.styles,
    // Headless-ready: Visibility rules configuration
    'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
    'data-visibility-rules': attributes['visibilityRules']?.length
      ? JSON.stringify(attributes['visibilityRules'])
      : undefined,
    // Headless-ready: Loop element configuration
    'data-loop-source': attributes['loopSource'] || undefined,
    'data-loop-limit': attributes['loopLimit'] || undefined,
    'data-loop-offset': attributes['loopOffset'] || undefined,
    ...advancedProps.customAttrs,
  });

  // Build vxconfig for frontend hydration
  // Note: charts data will be fetched on frontend, not stored in vxconfig
  const vxConfig: Omit<SalesChartVxConfig, 'charts'> = {
    activeChart: attributes.ts_active_chart,
    chartIcon: attributes.chart_icon,
    chevronRight: attributes.ts_chevron_right,
    chevronLeft: attributes.ts_chevron_left,
  };

  return (
    <div {...blockProps}>
      {/* Responsive CSS from AdvancedTab + VoxelTab + Sales Chart Styles */}
      {combinedResponsiveCSS && (
        <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
      )}

      {/* Background elements: video, slideshow, overlay, shape dividers */}
      {renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

      {/* vxconfig JSON for frontend hydration */}
      <script
        type="application/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig),
        }}
      />

      {/* Placeholder HTML matching Voxel structure */}
      <div className="ts-vendor-stats">
        <ul className="ts-generic-tabs simplify-ul flexify bar-chart-tabs">
          <li className={attributes.ts_active_chart === 'this-week' ? 'ts-tab-active' : ''}>
            <a href="#">Week</a>
          </li>
          <li className={attributes.ts_active_chart === 'this-month' ? 'ts-tab-active' : ''}>
            <a href="#">Month</a>
          </li>
          <li className={attributes.ts_active_chart === 'this-year' ? 'ts-tab-active' : ''}>
            <a href="#">Year</a>
          </li>
          <li className={attributes.ts_active_chart === 'all-time' ? 'ts-tab-active' : ''}>
            <a href="#">All time</a>
          </li>
        </ul>
        <div className={`ts-chart chart-${attributes.ts_active_chart}`}>
          <div className="ts-no-posts">
            {renderIcon(attributes.chart_icon) || <DefaultChartIcon />}
            <p>Loading chart...</p>
          </div>
          <div className="ts-chart-nav">
            <p>Loading...</p>
            <a href="#" className="ts-icon-btn vx-disabled">
              {renderIcon(attributes.ts_chevron_left) || <DefaultChevronLeft />}
            </a>
            <a href="#" className="ts-icon-btn vx-disabled">
              {renderIcon(attributes.ts_chevron_right) || <DefaultChevronRight />}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
