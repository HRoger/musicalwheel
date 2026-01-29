/**
 * Sales Chart - Shared Component
 *
 * Main React component used by both editor and frontend.
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php
 * - CSS: themes/voxel/assets/dist/bar-chart.css
 * - JS: themes/voxel/assets/dist/vendor-stats.js
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  SalesChartAttributes,
  SalesChartApiConfig,
  ChartData,
  ChartRange,
  ActiveItem,
  SalesChartVxConfig,
} from './types';
import { renderIcon, DefaultChartIcon, DefaultChevronLeft, DefaultChevronRight } from './utils';

interface SalesChartComponentProps {
  attributes: SalesChartAttributes;
  config: SalesChartApiConfig | null;
  isLoading: boolean;
  error: string | null;
  context: 'editor' | 'frontend';
}


/**
 * Sales Chart Component
 *
 * Renders the bar chart with tabs, navigation, and popup functionality.
 * HTML structure matches Voxel's template exactly for CSS inheritance.
 */
export function SalesChartComponent({
  attributes,
  config,
  isLoading,
  error,
}: Omit<SalesChartComponentProps, 'context'>): JSX.Element {
  // State for active chart tab
  const [activeChart, setActiveChart] = useState<ChartRange>(
    attributes.ts_active_chart
  );

  // State for charts data (can be updated via load more)
  const [charts, setCharts] = useState(config?.charts ?? null);

  // State for popup
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  // State for loading more data
  const [loading, setLoading] = useState(false);

  // Refs
  const popupRef = useRef<HTMLUListElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Drag scroll state
  const dragScrollState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
  });

  // Update charts when config changes
  useEffect(() => {
    if (config?.charts) {
      setCharts(config.charts);
    }
  }, [config]);

  // Update active chart when attribute changes
  useEffect(() => {
    setActiveChart(attributes.ts_active_chart);
  }, [attributes.ts_active_chart]);

  // Get current chart data
  const currentChart: ChartData | null = charts ? charts[activeChart] : null;

  /**
   * Show popup on bar hover
   */
  const showPopup = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, item: ActiveItem) => {
      setActiveItem(item);
      if (popupRef.current) {
        const rect = event.currentTarget.getBoundingClientRect();
        popupRef.current.style.left = `${rect.left + rect.width + 10}px`;
        popupRef.current.style.top = `${rect.top}px`;
      }
    },
    []
  );

  /**
   * Hide popup on mouse leave
   */
  const hidePopup = useCallback(() => {
    setActiveItem(null);
  }, []);

  /**
   * Load more data (prev/next navigation)
   */
  const loadMore = useCallback(
    async (direction: 'prev' | 'next') => {
      if (!currentChart || loading) return;

      setLoading(true);

      try {
        // Determine the REST URL
        const restUrl =
          (window as { wpApiSettings?: { root?: string } }).wpApiSettings?.root ||
          '/wp-json/';

        const params = new URLSearchParams({
          chart: activeChart,
          date: currentChart.meta.state.date ?? '',
          direction,
        });

        const response = await fetch(
          `${restUrl}voxel-fse/v1/sales-chart/load-more?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data && charts) {
          setCharts({
            ...charts,
            [activeChart]: data,
          });
        }
      } catch (err) {
        console.error('[SalesChart] Load more failed:', err);
      } finally {
        setLoading(false);
      }
    },
    [activeChart, currentChart, loading, charts]
  );

  /**
   * Setup drag scroll functionality
   */
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const state = dragScrollState.current;

    const handleMouseDown = (e: MouseEvent) => {
      state.isDown = true;
      state.startX = e.pageX - scrollArea.offsetLeft;
      state.scrollLeft = scrollArea.scrollLeft;
    };

    const handleMouseUp = () => {
      state.isDown = false;
    };

    const handleMouseLeave = () => {
      state.isDown = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!state.isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollArea.offsetLeft;
      const walk = x - state.startX;
      scrollArea.scrollLeft = state.scrollLeft - walk;
    };

    scrollArea.addEventListener('mousedown', handleMouseDown);
    scrollArea.addEventListener('mouseup', handleMouseUp);
    scrollArea.addEventListener('mouseleave', handleMouseLeave);
    scrollArea.addEventListener('mousemove', handleMouseMove);

    return () => {
      scrollArea.removeEventListener('mousedown', handleMouseDown);
      scrollArea.removeEventListener('mouseup', handleMouseUp);
      scrollArea.removeEventListener('mouseleave', handleMouseLeave);
      scrollArea.removeEventListener('mousemove', handleMouseMove);
    };
  }, [activeChart]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="ts-vendor-stats">
        <div className="ts-no-posts">
          <DefaultChartIcon />
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="ts-vendor-stats">
        <div className="ts-no-posts">
          <DefaultChartIcon />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Build vxconfig for re-rendering (visible in DevTools)
  const vxConfig: Omit<SalesChartVxConfig, 'charts'> = {
    activeChart: attributes.ts_active_chart,
    chartIcon: attributes.chart_icon,
    chevronRight: attributes.ts_chevron_right,
    chevronLeft: attributes.ts_chevron_left,
  };

  return (
    <>
      {/* Re-render vxconfig for DevTools visibility */}
      <script
        type="application/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig),
        }}
      />

      {/* Main container - matches Voxel structure */}
      <div className="ts-vendor-stats">
        {/* Tab navigation */}
        <ul className="ts-generic-tabs simplify-ul flexify bar-chart-tabs">
          <li className={activeChart === 'this-week' ? 'ts-tab-active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveChart('this-week');
              }}
            >
              Week
            </a>
          </li>
          <li className={activeChart === 'this-month' ? 'ts-tab-active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveChart('this-month');
              }}
            >
              Month
            </a>
          </li>
          <li className={activeChart === 'this-year' ? 'ts-tab-active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveChart('this-year');
              }}
            >
              Year
            </a>
          </li>
          <li className={activeChart === 'all-time' ? 'ts-tab-active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveChart('all-time');
              }}
            >
              All time
            </a>
          </li>
        </ul>

        {/* Chart container */}
        {currentChart && (
          <div
            className={`ts-chart chart-${activeChart}${loading ? ' vx-pending' : ''}`}
            key={activeChart}
          >
            {/* Chart with activity */}
            {currentChart.meta.state.has_activity ? (
              <div className="chart-contain">
                {/* Y-axis values */}
                <div className="chart-content">
                  <div className="bar-item-con bar-values">
                    {currentChart.steps.map((step, index) => (
                      <span key={index}>{step}</span>
                    ))}
                  </div>
                </div>

                {/* Bars */}
                <div
                  className="chart-content min-scroll min-scroll-h"
                  ref={scrollAreaRef}
                >
                  {currentChart.items.map((item, index) => (
                    <div key={index} className="bar-item-con">
                      <div className="bi-hold">
                        <div
                          className="bar-item bar-animate"
                          style={{ height: `${item.percent}%` }}
                          onMouseOver={(e) =>
                            showPopup(e, {
                              label: item.label,
                              earnings: item.earnings,
                              orders: item.orders,
                            })
                          }
                          onMouseLeave={hidePopup}
                        />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Popup */}
                <ul
                  ref={popupRef}
                  className={`flexify simplify-ul bar-item-data${activeItem ? ' active' : ''}`}
                >
                  <li>
                    <small>Value</small>
                    {activeItem?.earnings ?? ''}
                  </li>
                  <li>
                    <small>Orders</small>
                    {activeItem?.orders ?? ''}
                  </li>
                </ul>
              </div>
            ) : (
              /* No activity state */
              <div className="ts-no-posts">
                {renderIcon(attributes.chart_icon) || <DefaultChartIcon />}
                <p>No activity</p>
              </div>
            )}

            {/* Navigation */}
            <div className="ts-chart-nav">
              <p>{currentChart.meta.label}</p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentChart.meta.state.has_prev) {
                    loadMore('prev');
                  }
                }}
                className={`ts-icon-btn${!currentChart.meta.state.has_prev ? ' vx-disabled' : ''}`}
              >
                {renderIcon(attributes.ts_chevron_left) || <DefaultChevronLeft />}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentChart.meta.state.has_next) {
                    loadMore('next');
                  }
                }}
                className={`ts-icon-btn${!currentChart.meta.state.has_next ? ' vx-disabled' : ''}`}
              >
                {renderIcon(attributes.ts_chevron_right) || <DefaultChevronRight />}
              </a>
            </div>
          </div>
        )}

        {/* No chart data */}
        {!currentChart && (
          <div className="ts-chart">
            <div className="ts-no-posts">
              {renderIcon(attributes.chart_icon) || <DefaultChartIcon />}
              <p>No chart data available</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
