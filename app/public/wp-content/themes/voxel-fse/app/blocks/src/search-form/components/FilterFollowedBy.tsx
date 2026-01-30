/**
 * FilterFollowedBy Component
 *
 * Filter posts followed by a specific user.
 * Uses the same component logic as FilterFollowing.
 *
 * Evidence: themes/voxel/templates/widgets/search-form/followed-by-filter.php
 * Reference: voxel-search-form.beautified.js lines 1611-1626
 *
 * Voxel Registration:
 * "filter-followed-by": FilterFollowedBy,
 * "filter-following-user": FilterFollowedBy, // Same component
 *
 * @package VoxelFSE
 */

// Re-export FilterFollowing as FilterFollowedBy
// Voxel uses the same Vue component for both filter types
export { default } from './FilterFollowing';
