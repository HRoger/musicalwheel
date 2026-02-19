import { IconValue } from '@shared/types';

export interface TypographyValue {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
}

/**
 * Border width object - can have top, right, bottom, left values
 */
export interface BorderWidthValue {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface WorkHoursAttributes {
  blockId: string;
  sourceField: string;
  collapse: 'wh-default' | 'wh-expanded';
  topBg: string;
  topBgTablet: string;
  topBgMobile: string;
  topIconSize: number;
  topIconSizeTablet: number;
  topIconSizeMobile: number;
  topIconSizeUnit: string;
  labelTypography: TypographyValue;
  labelColor: string;
  currentHoursTypography: TypographyValue;
  currentHoursColor: string;
  topPaddingTop: number;
  topPaddingRight: number;
  topPaddingBottom: number;
  topPaddingLeft: number;
  topPaddingTopTablet: number;
  topPaddingRightTablet: number;
  topPaddingBottomTablet: number;
  topPaddingLeftTablet: number;
  topPaddingTopMobile: number;
  topPaddingRightMobile: number;
  topPaddingBottomMobile: number;
  topPaddingLeftMobile: number;
  bodyBg: string;
  bodySeparatorColor: string;
  dayTypography: TypographyValue;
  dayColor: string;
  hoursTypography: TypographyValue;
  hoursColor: string;
  bodyPaddingTop: number;
  bodyPaddingRight: number;
  bodyPaddingBottom: number;
  bodyPaddingLeft: number;
  bodyPaddingTopTablet: number;
  bodyPaddingRightTablet: number;
  bodyPaddingBottomTablet: number;
  bodyPaddingLeftTablet: number;
  bodyPaddingTopMobile: number;
  bodyPaddingRightMobile: number;
  bodyPaddingBottomMobile: number;
  bodyPaddingLeftMobile: number;
  openIcon: IconValue;
  openText: string;
  openIconColor: string;
  openTextColor: string;
  closedIcon: IconValue;
  closedText: string;
  closedIconColor: string;
  closedTextColor: string;
  appointmentIcon: IconValue;
  appointmentText: string;
  appointmentIconColor: string;
  appointmentTextColor: string;
  notAvailableIcon: IconValue;
  notAvailableText: string;
  notAvailableIconColor: string;
  notAvailableTextColor: string;
  downIcon: IconValue;
  borderType: string;
  borderWidth: BorderWidthValue;
  borderColor: string;
  borderRadius: number;
  borderRadiusTablet: number;
  borderRadiusMobile: number;
  boxShadow: string;
  accordionButtonSize: number;
  accordionButtonSize_tablet?: number;
  accordionButtonSize_mobile?: number;
  accordionButtonIconSize: number;
  accordionButtonIconSize_tablet?: number;
  accordionButtonIconSize_mobile?: number;
  accordionButtonColor: string;
  accordionButtonBg: string;
  accordionButtonBorderType: string;
  accordionButtonBorderWidth: BorderWidthValue;
  accordionButtonBorderColor: string;
  accordionButtonBorderRadius: number;
  accordionButtonBorderRadius_tablet?: number;
  accordionButtonBorderRadius_mobile?: number;
  accordionButtonColorHover: string;
  accordionButtonBgHover: string;
  accordionButtonBorderColorHover: string;
  workHoursActiveTab: string;
  contentTabOpenPanel: string;
  accordionButtonState: string;
}

export interface WorkHoursData {
  schedule: Record<string, ScheduleDay>;
  isOpenNow: boolean;
  weekdays: Record<string, string>;
  today: string;
  localTime: string;
}

/**
 * Time slot with both raw and formatted times
 *
 * PARITY: Server formats times using \Voxel\time_format() which respects WP site settings
 * Reference: themes/voxel/templates/widgets/work-hours.php:63-68
 */
export interface TimeSlot {
  from: string;        // Raw time (HH:MM)
  to: string;          // Raw time (HH:MM)
  fromFormatted: string; // Formatted via WP site time_format setting
  toFormatted: string;   // Formatted via WP site time_format setting
}

export interface ScheduleDay {
  status: 'hours' | 'open' | 'closed' | 'appointments_only' | null;
  hours?: TimeSlot[];
}

export interface VxConfig {
  attributes: WorkHoursAttributes;
  postId?: number;
  fieldKey?: string;
}
