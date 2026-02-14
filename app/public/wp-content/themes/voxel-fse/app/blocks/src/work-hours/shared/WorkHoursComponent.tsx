import { useEffect, useRef, useState } from 'react';
import { WorkHoursAttributes, ScheduleDay, VxConfig } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { renderIcon } from '@shared/utils/renderIcon';
import type { IconValue } from '@shared/types';

interface WorkHoursComponentProps {
  attributes: WorkHoursAttributes;
  scheduleData?: Record<string, ScheduleDay>;
  isOpenNow?: boolean;
  weekdays?: Record<string, string>;
  today?: string;
  localTime?: string;
  isPreview?: boolean;
}

// Mock data for editor preview
const getMockData = () => {
  const weekdays: Record<string, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  };

  const schedule: Record<string, ScheduleDay> = {
    mon: { status: 'hours', hours: [{ from: '09:00', to: '17:00' }] },
    tue: { status: 'hours', hours: [{ from: '09:00', to: '17:00' }] },
    wed: { status: 'hours', hours: [{ from: '09:00', to: '17:00' }] },
    thu: { status: 'hours', hours: [{ from: '09:00', to: '17:00' }] },
    fri: { status: 'hours', hours: [{ from: '09:00', to: '17:00' }] },
    sat: { status: 'closed' },
    sun: { status: 'closed' },
  };

  const today = 'mon';
  const isOpenNow = true;
  const localTime = new Date().toLocaleString();

  return { weekdays, schedule, today, isOpenNow, localTime };
};

// Voxel's clock icon SVG path (used for status indicator)
const CLOCK_ICON_PATH = "M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12.75 6.49996C12.75 6.08575 12.4141 5.74998 11.9999 5.75C11.5857 5.75002 11.25 6.08582 11.25 6.50004L11.2502 11.25H8.00024C7.58603 11.25 7.25024 11.5858 7.25024 12C7.25024 12.4142 7.58603 12.75 8.00024 12.75H12.0002C12.1992 12.75 12.3899 12.671 12.5306 12.5303C12.6712 12.3897 12.7503 12.1989 12.7502 12L12.75 6.49996Z";

// Voxel's expand/collapse arrow icon SVG path
const EXPAND_ICON_PATH = "M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z";

/**
 * Format time - prefers server-formatted time (respects WP site settings)
 *
 * PARITY: Server formats times using \Voxel\time_format() which respects WP site settings
 * Reference: themes/voxel/templates/widgets/work-hours.php:63-68
 *
 * Falls back to 12-hour format for preview mode where no server data exists
 */
const formatTime = (time: string, formatted?: string): string => {
  // Use server-formatted time if available (respects WP site settings)
  if (formatted) {
    return formatted;
  }
  // Fallback for preview mode - simple 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${meridiem}`;
};

export default function WorkHoursComponent({
  attributes,
  scheduleData,
  isOpenNow,
  weekdays,
  today,
  localTime,
  isPreview = false,
}: WorkHoursComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track expanded state - start expanded if collapse mode is 'wh-expanded'
  const [isExpanded, setIsExpanded] = useState(attributes.collapse === 'wh-expanded');

  // Use mock data in preview mode, actual data otherwise
  const data = isPreview ? getMockData() : {};

  const schedule = scheduleData || data.schedule;
  const open = isOpenNow !== undefined ? isOpenNow : data.isOpenNow;
  const days = weekdays || data.weekdays;
  const todayKey = today || data.today;
  const time = localTime || data.localTime;

  // Handle expand/collapse click
  const handleExpandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const currentDayStatus = schedule?.[todayKey];

  // Determine current status for display
  let statusClass = 'not-available';
  let statusIcon = attributes.notAvailableIcon;
  let statusText = attributes.notAvailableText;
  let statusIconColor = attributes.notAvailableIconColor;
  let statusTextColor = attributes.notAvailableTextColor;

  if (currentDayStatus) {
    if (currentDayStatus.status === 'hours' && open) {
      statusClass = 'open';
      statusIcon = attributes.openIcon;
      statusText = attributes.openText;
      statusIconColor = attributes.openIconColor;
      statusTextColor = attributes.openTextColor;
    } else if (currentDayStatus.status === 'hours' && !open) {
      statusClass = 'closed';
      statusIcon = attributes.closedIcon;
      statusText = attributes.closedText;
      statusIconColor = attributes.closedIconColor;
      statusTextColor = attributes.closedTextColor;
    } else if (currentDayStatus.status === 'open') {
      statusClass = 'open';
      statusIcon = attributes.openIcon;
      statusText = attributes.openText;
      statusIconColor = attributes.openIconColor;
      statusTextColor = attributes.openTextColor;
    } else if (currentDayStatus.status === 'closed') {
      statusClass = 'closed';
      statusIcon = attributes.closedIcon;
      statusText = attributes.closedText;
      statusIconColor = attributes.closedIconColor;
      statusTextColor = attributes.closedTextColor;
    } else if (currentDayStatus.status === 'appointments_only') {
      statusClass = 'appt-only';
      statusIcon = attributes.appointmentIcon;
      statusText = attributes.appointmentText;
      statusIconColor = attributes.appointmentIconColor;
      statusTextColor = attributes.appointmentTextColor;
    }
  }

  // Generate current day hours text
  const getCurrentHoursText = (): string => {
    if (!currentDayStatus) {
      return 'Not available';
    }

    switch (currentDayStatus.status) {
      case 'open':
        return 'Open all day';
      case 'closed':
        return 'Closed all day';
      case 'appointments_only':
        return 'Appointments only';
      case 'hours':
        if (!currentDayStatus.hours || currentDayStatus.hours.length === 0) {
          return 'Closed all day';
        }
        // PARITY: Use server-formatted times when available (respects WP site settings)
        return currentDayStatus.hours
          .map((h) => `${formatTime(h.from, h.fromFormatted)} - ${formatTime(h.to, h.toFormatted)}`)
          .join(', ');
      default:
        return 'Not available';
    }
  };

  // Determine container classes - Voxel uses "ts-work-hours wh-default active" pattern
  const containerClasses = [
    'ts-work-hours',
    attributes.collapse || 'wh-default',
    isExpanded ? 'active' : '',
  ].filter(Boolean).join(' ');

  return (
    <div ref={containerRef}>
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            attributes,
            postId: (window as any).__post_id,
            fieldKey: attributes.sourceField,
          } as VxConfig),
        }}
      />
      <div className={containerClasses}>
        {/* Top Section: Current Status - matches Voxel's ts-hours-today structure */}
        <div className="ts-hours-today flexify">
          {/* Status Indicator - matches Voxel's flexify ts-open-status structure */}
          {/* PARITY: Voxel uses get_icon_markup($icon) ?: svg('clock.svg') */}
          {/* Reference: themes/voxel/templates/widgets/work-hours.php:6,11,17,22,27,32 */}
          <div className={`flexify ts-open-status ${statusClass}`}>
            {statusIcon && (statusIcon as IconValue).value ? (
              renderIcon(statusIcon as IconValue)
            ) : (
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                transform="rotate(0 0 0)"
              >
                <path d={CLOCK_ICON_PATH} fill={statusIconColor || '#343C54'} />
              </svg>
            )}
            <p>{statusText}</p>
          </div>

          {/* Current Hours Text */}
          <p className="ts-current-period">
            <span>{getCurrentHoursText()}</span>
          </p>

          {/* Expand/Collapse Button - includes vx-event-expand class like Voxel */}
          {/* PARITY: Voxel uses get_icon_markup(down_icon) ?: svg('chevron-down.svg') */}
          {/* Reference: themes/voxel/templates/widgets/work-hours.php:73 */}
          <a
            href="#"
            className="ts-expand-hours ts-icon-btn ts-smaller vx-event-expand"
            onClick={handleExpandClick}
            style={isExpanded ? { transform: 'rotate(180deg)' } : undefined}
          >
            {attributes.downIcon && (attributes.downIcon as IconValue).value ? (
              renderIcon(attributes.downIcon as IconValue)
            ) : (
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d={EXPAND_ICON_PATH} fill={attributes.accordionButtonColor || '#343C54'} />
              </svg>
            )}
          </a>
        </div>

        {/* Work Hours List - matches Voxel's ts-work-hours-list structure */}
        <div className="ts-work-hours-list">
          <ul className="simplify-ul flexify">
            {/* Display all weekdays */}
            {Object.entries(days || {}).map(([key, label]) => {
              const daySchedule = schedule?.[key];

              // Get hours text for this day
              const getHoursText = () => {
                if (!daySchedule) return 'Not available';
                switch (daySchedule.status) {
                  case 'open':
                    return 'Open all day';
                  case 'closed':
                    return 'Closed all day';
                  case 'appointments_only':
                    return 'Appointments only';
                  case 'hours':
                    if (!daySchedule.hours || daySchedule.hours.length === 0) {
                      return 'Closed all day';
                    }
                    // PARITY: Use server-formatted times when available
                    return daySchedule.hours
                      .map((h) => `${formatTime(h.from, h.fromFormatted)} - ${formatTime(h.to, h.toFormatted)}`)
                      .join(', ');
                  default:
                    return 'Not available';
                }
              };

              return (
                <li key={key}>
                  <p className="ts-day">{label}</p>
                  <small className="ts-hours">
                    <span>{getHoursText()}</span>
                  </small>
                </li>
              );
            })}

            {/* Local Time - matches Voxel's timezone row structure */}
            <li>
              <p className="ts-timezone">Local time </p>
              <small>
                <span>{time || new Date().toLocaleTimeString()}</span>
              </small>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
