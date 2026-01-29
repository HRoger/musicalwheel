/**
 * Flex Container Editor Filters
 *
 * This file imports and registers the shared editor wrapper filters.
 * The shared filters handle:
 * - Sticky position for ALL voxel-fse blocks
 * - Full width mode for flex-container specifically
 *
 * IMPORTANT: The shared filter is idempotent and will only register once,
 * even if imported from multiple blocks.
 *
 * @package VoxelFSE
 */

// Import the shared filter - this auto-registers on import
import '../../shared/filters/editorWrapperFilters';
