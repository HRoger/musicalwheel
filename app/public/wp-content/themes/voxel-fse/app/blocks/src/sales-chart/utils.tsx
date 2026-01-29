/**
 * Sales Chart - Utility Functions
 *
 * Helper functions for the Sales Chart block.
 *
 * @package VoxelFSE
 */

import React from 'react';
import type { IconValue } from './types';

/**
 * Default chart icon SVG
 */
export const DefaultChartIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
  >
    <path d="M3 12H5V21H3V12ZM19 8H21V21H19V8ZM11 2H13V21H11V2Z" />
  </svg>
);

/**
 * Default chevron left SVG
 */
export const DefaultChevronLeft = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" />
  </svg>
);

/**
 * Default chevron right SVG
 */
export const DefaultChevronRight = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z" />
  </svg>
);

/**
 * Render icon from IconValue
 *
 * Renders either a Voxel icon class or an SVG URL.
 *
 * @param icon - Icon value object
 * @returns JSX element or null
 */
export function renderIcon(icon: IconValue): JSX.Element | null {
  if (!icon || !icon.value) {
    return null;
  }

  if (icon.library === 'icon') {
    // Voxel icon class - render as <i> element
    return <i className={icon.value} />;
  }

  if (icon.library === 'svg') {
    // SVG URL - render as <img> element
    return (
      <img
        src={icon.value}
        alt=""
        className="voxel-fse-icon-svg"
        style={{ width: '1em', height: '1em' }}
      />
    );
  }

  return null;
}

/**
 * Format currency value
 *
 * Basic currency formatting (used as fallback)
 *
 * @param value - Numeric value
 * @param currency - Currency code
 * @returns Formatted string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Generate mock chart data for editor preview
 *
 * Creates sample data when no API data is available.
 *
 * @returns Mock charts collection
 */
export function generateMockChartData() {
  const today = new Date();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate week data
  const weekItems = weekDays.map((day) => ({
    label: day,
    percent: Math.random() * 80 + 10,
    earnings: formatCurrency(Math.random() * 500),
    orders: String(Math.floor(Math.random() * 20)),
  }));

  // Generate month data
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthItems = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    percent: Math.random() * 80 + 10,
    earnings: formatCurrency(Math.random() * 200),
    orders: String(Math.floor(Math.random() * 10)),
  }));

  // Generate year data
  const yearItems = months.map((month) => ({
    label: month,
    percent: Math.random() * 80 + 10,
    earnings: formatCurrency(Math.random() * 5000),
    orders: String(Math.floor(Math.random() * 100)),
  }));

  // Generate all-time data
  const currentYear = today.getFullYear();
  const allTimeItems = Array.from({ length: 3 }, (_, i) => ({
    label: String(currentYear - 2 + i),
    percent: Math.random() * 80 + 10,
    earnings: formatCurrency(Math.random() * 50000),
    orders: String(Math.floor(Math.random() * 500)),
  }));

  const steps = ['$1,000', '$800', '$600', '$400', '$200', '$0'];

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    'this-week': {
      steps,
      items: weekItems,
      meta: {
        label: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
        state: {
          date: weekStart.toISOString().split('T')[0],
          has_next: false,
          has_prev: true,
          has_activity: true,
        },
      },
    },
    'this-month': {
      steps,
      items: monthItems,
      meta: {
        label: months[today.getMonth()],
        state: {
          date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
          has_next: false,
          has_prev: true,
          has_activity: true,
        },
      },
    },
    'this-year': {
      steps: ['$10,000', '$8,000', '$6,000', '$4,000', '$2,000', '$0'],
      items: yearItems,
      meta: {
        label: String(today.getFullYear()),
        state: {
          date: `${today.getFullYear()}-01-01`,
          has_next: false,
          has_prev: true,
          has_activity: true,
        },
      },
    },
    'all-time': {
      steps: ['$100,000', '$80,000', '$60,000', '$40,000', '$20,000', '$0'],
      items: allTimeItems,
      meta: {
        label: 'All time stats',
        state: {
          date: null,
          has_next: false,
          has_prev: false,
          has_activity: true,
        },
      },
    },
  };
}
