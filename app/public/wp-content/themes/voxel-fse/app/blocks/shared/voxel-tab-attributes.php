<?php
/**
 * Voxel Tab Attributes
 *
 * Defines all attributes used by the VoxelTab component.
 * These are merged into all voxel-fse blocks automatically by Block_Loader.
 *
 * Keep in sync with: shared/controls/VoxelTab.tsx
 * Keep in sync with: shared/utils/generateVoxelStyles.ts (VoxelStyleAttributes)
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Blocks\Shared;

/**
 * Get all Voxel tab attributes for block registration
 *
 * @return array Attribute definitions for WordPress block registration
 */
function get_voxel_tab_attributes(): array
{
    return [
        // ============================================
        // WIDGET OPTIONS - STICKY POSITION
        // ============================================

        'stickyEnabled' => ['type' => 'boolean', 'default' => false],
        'stickyDesktop' => ['type' => 'string', 'default' => 'sticky'],
        'stickyTablet' => ['type' => 'string', 'default' => 'sticky'],
        'stickyMobile' => ['type' => 'string', 'default' => 'sticky'],

        // Sticky Top (responsive)
        'stickyTop' => ['type' => 'number'],
        'stickyTop_tablet' => ['type' => 'number'],
        'stickyTop_mobile' => ['type' => 'number'],
        'stickyTopUnit' => ['type' => 'string', 'default' => 'px'],

        // Sticky Left (responsive)
        'stickyLeft' => ['type' => 'number'],
        'stickyLeft_tablet' => ['type' => 'number'],
        'stickyLeft_mobile' => ['type' => 'number'],
        'stickyLeftUnit' => ['type' => 'string', 'default' => 'px'],

        // Sticky Right (responsive)
        'stickyRight' => ['type' => 'number'],
        'stickyRight_tablet' => ['type' => 'number'],
        'stickyRight_mobile' => ['type' => 'number'],
        'stickyRightUnit' => ['type' => 'string', 'default' => 'px'],

        // Sticky Bottom (responsive)
        'stickyBottom' => ['type' => 'number'],
        'stickyBottom_tablet' => ['type' => 'number'],
        'stickyBottom_mobile' => ['type' => 'number'],
        'stickyBottomUnit' => ['type' => 'string', 'default' => 'px'],

        // ============================================
        // VISIBILITY RULES
        // ============================================

        'visibilityBehavior' => ['type' => 'string', 'default' => 'show'],
        'visibilityRules' => ['type' => 'array', 'default' => []],

        // ============================================
        // LOOP ELEMENT
        // ============================================

        'loopEnabled' => ['type' => 'boolean', 'default' => false],
        'loopSource' => ['type' => 'string', 'default' => ''],
        'loopProperty' => ['type' => 'string', 'default' => ''],
        'loopLimit' => ['type' => 'string', 'default' => ''],
        'loopOffset' => ['type' => 'string', 'default' => ''],

        // ============================================
        // CUSTOM ATTRIBUTES
        // ============================================

        'customAttributes' => ['type' => 'string', 'default' => ''],
    ];
}
