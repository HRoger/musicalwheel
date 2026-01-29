import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { BlockSaveProps } from '@wordpress/blocks';
import type { RingChartAttributes } from './types';
import { generateRingChartResponsiveCSS } from './styles';

/**
 * Ring Chart Block Save Function
 *
 * Plan C+ Architecture:
 * - Outputs minimal vxconfig JSON in <script> tag
 * - Outputs placeholder HTML for SEO
 * - No render.php needed
 * - Frontend hydration via frontend.tsx
 *
 * Matches pattern from search-form and create-post blocks
 */
export default function save({
  attributes,
}: BlockSaveProps<RingChartAttributes>): JSX.Element {
  const blockId = attributes.blockId || 'ring-chart';

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: 'voxel-fse-ring-chart',
  });

  // Generate ring-chart-specific responsive CSS
  const ringChartResponsiveCSS = generateRingChartResponsiveCSS(attributes, blockId);

  // Combine all responsive CSS
  // Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
  const combinedResponsiveCSS = [advancedProps.responsiveCSS, ringChartResponsiveCSS]
    .filter(Boolean)
    .join('\n');

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

  return (
    <div {...blockProps}>
      {/* Responsive CSS from AdvancedTab + VoxelTab + Block-specific */}
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
          __html: JSON.stringify(attributes, null, 2),
        }}
      />

      {/* Placeholder HTML (will be replaced by React on frontend) */}
      <div className="circle-chart-position">
        <div className="circle-chart-wrapper flexify">
          <div className="circle-chart">
            <svg className="circle-chart" width={attributes.ts_chart_size} height={attributes.ts_chart_size}>
              {/* Placeholder circles - actual SVG rendered by React */}
              <circle className="circle-chart__background" />
              <circle className="circle-chart__circle" />
            </svg>
            <p className="chart-value">
              {attributes.ts_chart_value}
              {attributes.ts_chart_value_suffix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
