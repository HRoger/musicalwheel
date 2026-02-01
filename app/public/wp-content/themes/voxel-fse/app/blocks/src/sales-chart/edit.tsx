/**
 * Sales Chart Block - Editor Component
 *
 * Provides InspectorControls for block settings.
 * Uses shared SalesChartComponent for live preview.
 *
 * Evidence:
 * - Voxel widget controls: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php
 *
 * @package VoxelFSE
 */

import React, { useState, useEffect, useMemo } from 'react';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import type { BlockEditProps } from '@wordpress/blocks';
import type { SalesChartAttributes, SalesChartApiConfig } from './types';
import { SalesChartComponent } from './SalesChartComponent';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateSalesChartResponsiveCSS } from './styles';

/**
 * Sales Chart Block Editor Component
 *
 * Matches Voxel widget controls from:
 * themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php
 */
export default function Edit({
  attributes,
  setAttributes,
  clientId,
}: BlockEditProps<SalesChartAttributes>): JSX.Element {
  const blockId = attributes.blockId || clientId;

  // Set blockId if not set
  useEffect(() => {
    if (!attributes.blockId) {
      setAttributes({ blockId: clientId });
    }
  }, [attributes.blockId, clientId, setAttributes]);

  // Inject Voxel Editor Styles
  useEffect(() => {
    const cssId = 'voxel-bar-chart-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      const voxelConfig = (window as any).Voxel_Config;
      const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
      link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/bar-chart.css?ver=1.7.5.2`;
      document.head.appendChild(link);
    }
  }, []);

  // State for API data
  const [config, setConfig] = useState<SalesChartApiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: 'voxel-fse-sales-chart',
    selectorPrefix: 'voxel-fse-sales-chart',
  });

  // Generate sales-chart specific responsive CSS
  const salesChartResponsiveCSS = useMemo(
    () => generateSalesChartResponsiveCSS(attributes, blockId),
    [attributes, blockId]
  );

  // Combine all responsive CSS
  const combinedResponsiveCSS = useMemo(
    () => [advancedProps.responsiveCSS, salesChartResponsiveCSS].filter(Boolean).join('\n'),
    [advancedProps.responsiveCSS, salesChartResponsiveCSS]
  );

  // Get block props for proper Gutenberg integration
  const blockProps = useBlockProps({
    id: advancedProps.elementId,
    className: advancedProps.className,
    style: advancedProps.styles,
    ...advancedProps.customAttrs,
  });

  // Fetch chart data from REST API
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    apiFetch({
      path: '/voxel-fse/v1/sales-chart',
    })
      .then((data: any) => {
        setConfig(data as SalesChartApiConfig);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || __('Failed to load chart data', 'voxel-fse'));
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <InspectorControls>
        <InspectorTabs
          tabs={[
            {
              id: 'content',
              label: __('Content', 'voxel-fse'),
              icon: '\ue92c',
              render: () => (
                <ContentTab
                  attributes={attributes}
                  setAttributes={setAttributes}
                />
              ),
            },
            {
              id: 'style',
              label: __('Style', 'voxel-fse'),
              icon: '\ue921',
              render: () => (
                <StyleTab
                  attributes={attributes}
                  setAttributes={setAttributes}
                />
              ),
            },
          ]}
          includeAdvancedTab={true}
          includeVoxelTab={true}
          attributes={attributes}
          setAttributes={setAttributes}
          defaultTab="content"
        />
      </InspectorControls>

      {/* Live Preview using shared component */}
      <div {...blockProps}>
        {/* Output combined responsive CSS */}
        {combinedResponsiveCSS && (
          <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
        )}

        {error && (
          <div className="voxel-fse-error">
            <p>{error}</p>
          </div>
        )}

        {!error && (
          <SalesChartComponent
            attributes={attributes}
            config={config}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </>
  );
}
