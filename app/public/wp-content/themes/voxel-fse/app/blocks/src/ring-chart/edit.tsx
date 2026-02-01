import React, { useEffect, useMemo } from 'react';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import type { BlockEditProps } from '@wordpress/blocks';
import type { RingChartAttributes } from './types';
import { RingChartComponent } from './RingChartComponent';
import InspectorTabs from '../../shared/controls/InspectorTabs';
import ContentTab from './inspector/ContentTab';
import StyleTab from './inspector/StyleTab';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateRingChartResponsiveCSS } from './styles';

/**
 * Ring Chart Block Editor Component
 *
 * Provides InspectorControls using the new InspectorTabs system
 * Uses shared RingChartComponent for live preview
 *
 * Matches Voxel widget controls from:
 * themes/voxel/app/widgets/ring-chart.php
 */
export default function Edit({
  attributes,
  setAttributes,
  clientId,
}: BlockEditProps<RingChartAttributes>): JSX.Element {
  const blockId = attributes.blockId || clientId;

  // Set blockId if not set
  useEffect(() => {
    if (!attributes.blockId) {
      setAttributes({ blockId: clientId });
    }
  }, [attributes.blockId, clientId, setAttributes]);

  // Inject Voxel Editor Styles
  useEffect(() => {
    const cssId = 'voxel-ring-chart-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      const voxelConfig = (window as any).Voxel_Config;
      const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
      link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/ring-chart.css?ver=1.7.5.2`;
      document.head.appendChild(link);
    }
  }, []);

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: 'voxel-fse-ring-chart',
    selectorPrefix: 'voxel-fse-ring-chart',
  });

  // Generate ring-chart-specific responsive CSS (animation duration)
  const ringChartResponsiveCSS = useMemo(
    () => generateRingChartResponsiveCSS(attributes, blockId),
    [attributes, blockId]
  );

  // Combine all responsive CSS
  // Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
  const combinedResponsiveCSS = useMemo(
    () => [advancedProps.responsiveCSS, ringChartResponsiveCSS].filter(Boolean).join('\n'),
    [advancedProps.responsiveCSS, ringChartResponsiveCSS]
  );

  // Get block props for proper Gutenberg integration
  const blockProps = useBlockProps({
    id: advancedProps.elementId,
    className: advancedProps.className,
    style: advancedProps.styles,
    ...advancedProps.customAttrs,
  });

  return (
    <>
      <InspectorControls>
        <InspectorTabs
          tabs={[
            {
              id: 'content',
              label: __('Content', 'voxel-fse'),
              render: () => (
                <ContentTab attributes={attributes} setAttributes={setAttributes} />
              ),
            },
            {
              id: 'style',
              label: __('Style', 'voxel-fse'),
              render: () => (
                <StyleTab attributes={attributes} setAttributes={setAttributes} />
              ),
            },
          ]}
          includeAdvancedTab={true}
          includeVoxelTab={true}
          attributes={attributes}
          setAttributes={setAttributes}
          activeTabAttribute="activeTab"
        />
      </InspectorControls>

      {/* Live Preview using shared component */}
      <div {...blockProps}>
        {/* Output combined responsive CSS */}
        {combinedResponsiveCSS && (
          <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
        )}

        <RingChartComponent attributes={attributes} isEditor={true} />
      </div>
    </>
  );
}
