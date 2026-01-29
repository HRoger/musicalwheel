/**
 * Booking Field Component
 *
 * EXACT Voxel HTML:
 * - timeslots: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php
 * - days: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php
 *
 * This file re-exports the main BookingField component from the booking/ folder.
 * The full implementation supports both 'timeslots' and 'days' booking types.
 */

// Re-export everything from the booking folder
export { BookingField, default } from './booking/BookingField';

// Re-export types for consumers
export type { BookingFieldValue, BookingFieldProps } from './booking/types';
