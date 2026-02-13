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
 * Source: themes/voxel/assets/images/svgs/chart.svg
 */
export const DefaultChartIcon = (): JSX.Element => (
  <svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
    <path d="M11.833 3.75C10.5904 3.75 9.58301 4.75736 9.58301 6V18.9991C9.58301 20.2417 10.5904 21.2491 11.833 21.2491H12.1663C13.409 21.2491 14.4163 20.2417 14.4163 18.9991V6C14.4163 4.75736 13.409 3.75 12.1663 3.75H11.833Z" fill="#343C54" />
    <path d="M5.5 12.5625C4.25736 12.5625 3.25 13.5699 3.25 14.8125V19C3.25 20.2426 4.25736 21.25 5.5 21.25H5.83333C7.07597 21.25 8.08333 20.2426 8.08333 19V14.8125C8.08333 13.5699 7.07598 12.5625 5.83333 12.5625H5.5Z" fill="#343C54" />
    <path d="M18.166 8.66016C16.9234 8.66016 15.916 9.66752 15.916 10.9102V19.0001C15.916 20.2427 16.9234 21.2501 18.166 21.2501H18.4993C19.742 21.2501 20.7493 20.2427 20.7493 19.0001V10.9102C20.7493 9.66752 19.742 8.66016 18.4993 8.66016H18.166Z" fill="#343C54" />
  </svg>
);

/**
 * Default chevron left SVG
 * Source: themes/voxel/assets/images/svgs/chevron-left.svg
 */
export const DefaultChevronLeft = (): JSX.Element => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
    <path d="M10.746 6.00002C10.746 5.69663 10.5632 5.42312 10.2829 5.30707C10.0026 5.19101 9.67996 5.25526 9.4655 5.46986L3.51254 11.4266C3.35184 11.5642 3.25 11.7685 3.25 11.9966V11.9982C3.24959 12.1906 3.32276 12.3831 3.46949 12.53L9.46548 18.5302C9.67994 18.7448 10.0026 18.809 10.2829 18.693C10.5632 18.5769 10.746 18.3034 10.746 18L10.746 12.7466L20.0014 12.7466C20.4156 12.7466 20.7514 12.4108 20.7514 11.9966C20.7514 11.5824 20.4156 11.2466 20.0014 11.2466L10.746 11.2466V6.00002Z" fill="#343C54" />
  </svg>
);

/**
 * Default chevron right SVG
 * Source: themes/voxel/assets/images/svgs/chevron-right.svg
 */
export const DefaultChevronRight = (): JSX.Element => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
    <path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="#343C54" />
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
