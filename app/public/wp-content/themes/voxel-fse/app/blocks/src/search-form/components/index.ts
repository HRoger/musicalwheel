/**
 * Filter Components Index
 *
 * Export all filter components for easy importing.
 *
 * Voxel Filter Component Registry (beautified.js lines 3081-3100):
 * - filter-post-types: FilterPostTypes
 * - filter-keywords: FilterKeywords
 * - filter-stepper: FilterStepper
 * - filter-range: FilterRange
 * - filter-location: FilterLocation
 * - filter-availability: FilterAvailability
 * - filter-open-now: FilterOpenNow
 * - filter-terms: FilterTerms
 * - filter-order-by: FilterOrderBy
 * - filter-recurring-date: FilterRecurringDate
 * - filter-date: FilterRecurringDate (same component)
 * - filter-switcher: FilterSwitcher
 * - filter-user: FilterUser
 * - filter-followed-by: FilterFollowedBy
 * - filter-following-user: FilterFollowedBy (same component)
 * - filter-following-post: FilterFollowingPost
 * - filter-relations: FilterRelations
 * - filter-post-status: FilterPostStatus
 * - filter-ui-heading: FilterUIHeading
 *
 * @package VoxelFSE
 */

export { default as FilterKeywords } from './FilterKeywords';
export { default as FilterRange } from './FilterRange';
export { default as FilterStepper } from './FilterStepper';
export { default as FilterTerms } from './FilterTerms';
export { default as FilterLocation } from './FilterLocation';
export { default as FilterAvailability } from './FilterAvailability';
export { default as FilterDate } from './FilterDate';
// Voxel uses the same component for both filter-date and filter-recurring-date
// Evidence: voxel-search-form.beautified.js:3091-3092
// Both use Date_Filter_Helpers trait with identical frontend_props()
export { default as FilterRecurringDate } from './FilterDate';
export { default as FilterOpenNow } from './FilterOpenNow';
export { default as FilterOrderBy } from './FilterOrderBy';
export { default as FilterPostStatus } from './FilterPostStatus';
export { default as FilterUser } from './FilterUser';
export { default as FilterRelations } from './FilterRelations';
export { default as FilterFollowing } from './FilterFollowing';
export { default as FilterFollowedBy } from './FilterFollowedBy';
export { default as FilterFollowingPost } from './FilterFollowingPost';
export { default as FilterSwitcher } from './FilterSwitcher';
export { default as FilterUIHeading } from './FilterUIHeading';
export { default as FilterPostTypes } from './FilterPostTypes';
