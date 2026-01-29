<?php
/**
 * Advanced Tab Attributes
 *
 * Defines all attributes used by the AdvancedTab component.
 * These are merged into all voxel-fse blocks automatically by Block_Loader.
 *
 * Keep in sync with: shared/controls/AdvancedTab.tsx (advancedTabAttributes export)
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Blocks\Shared;

/**
 * Get all advanced tab attributes for block registration
 *
 * @return array Attribute definitions for WordPress block registration
 */
function get_advanced_tab_attributes(): array
{
    return [
        // ============================================
        // LAYOUT SECTION
        // ============================================

        // Margin (responsive)
        'blockMargin' => ['type' => 'object', 'default' => []],
        'blockMargin_tablet' => ['type' => 'object'],
        'blockMargin_mobile' => ['type' => 'object'],

        // Padding (responsive)
        'blockPadding' => ['type' => 'object', 'default' => []],
        'blockPadding_tablet' => ['type' => 'object'],
        'blockPadding_mobile' => ['type' => 'object'],

        // Width controls (responsive)
        'elementWidth' => ['type' => 'string', 'default' => ''],
        'elementWidth_tablet' => ['type' => 'string'],
        'elementWidth_mobile' => ['type' => 'string'],
        'elementCustomWidth' => ['type' => 'number'],
        'elementCustomWidth_tablet' => ['type' => 'number'],
        'elementCustomWidth_mobile' => ['type' => 'number'],
        'elementCustomWidthUnit' => ['type' => 'string', 'default' => '%'],

        // Flexbox Item controls (responsive)
        'flexAlignSelf' => ['type' => 'string'],
        'flexAlignSelf_tablet' => ['type' => 'string'],
        'flexAlignSelf_mobile' => ['type' => 'string'],
        'flexOrder' => ['type' => 'string', 'default' => ''],
        'flexOrder_tablet' => ['type' => 'string'],
        'flexOrder_mobile' => ['type' => 'string'],
        'flexOrderCustom' => ['type' => 'number'],
        'flexOrderCustom_tablet' => ['type' => 'number'],
        'flexOrderCustom_mobile' => ['type' => 'number'],
        'flexSize' => ['type' => 'string', 'default' => ''],
        'flexSize_tablet' => ['type' => 'string'],
        'flexSize_mobile' => ['type' => 'string'],
        'flexGrow' => ['type' => 'number', 'default' => 1],
        'flexGrow_tablet' => ['type' => 'number'],
        'flexGrow_mobile' => ['type' => 'number'],
        'flexShrink' => ['type' => 'number', 'default' => 1],
        'flexShrink_tablet' => ['type' => 'number'],
        'flexShrink_mobile' => ['type' => 'number'],

        // Position controls
        'position' => ['type' => 'string', 'default' => ''],
        'offsetOrientationH' => ['type' => 'string', 'default' => 'start'],
        'offsetX' => ['type' => 'number'],
        'offsetX_tablet' => ['type' => 'number'],
        'offsetX_mobile' => ['type' => 'number'],
        'offsetXUnit' => ['type' => 'string', 'default' => 'px'],
        'offsetXEnd' => ['type' => 'number'],
        'offsetXEnd_tablet' => ['type' => 'number'],
        'offsetXEnd_mobile' => ['type' => 'number'],
        'offsetXEndUnit' => ['type' => 'string', 'default' => 'px'],
        'offsetOrientationV' => ['type' => 'string', 'default' => 'start'],
        'offsetY' => ['type' => 'number'],
        'offsetY_tablet' => ['type' => 'number'],
        'offsetY_mobile' => ['type' => 'number'],
        'offsetYUnit' => ['type' => 'string', 'default' => 'px'],
        'offsetYEnd' => ['type' => 'number'],
        'offsetYEnd_tablet' => ['type' => 'number'],
        'offsetYEnd_mobile' => ['type' => 'number'],
        'offsetYEndUnit' => ['type' => 'string', 'default' => 'px'],

        // Z-Index (responsive)
        'zIndex' => ['type' => 'number'],
        'zIndex_tablet' => ['type' => 'number'],
        'zIndex_mobile' => ['type' => 'number'],

        // CSS ID & Classes
        'elementId' => ['type' => 'string'],
        'customClasses' => ['type' => 'string'],

        // ============================================
        // BACKGROUND SECTION
        // ============================================

        // Background (Active tab state)
        'backgroundActiveTab' => ['type' => 'string', 'default' => 'normal'],

        // Background Type (Normal/Hover) - 'classic' | 'gradient'
        'backgroundType' => ['type' => 'string', 'default' => 'classic'],
        'backgroundTypeHover' => ['type' => 'string', 'default' => 'classic'],

        // Background Color (Normal/Hover)
        'backgroundColor' => ['type' => 'string'],
        'backgroundColorHover' => ['type' => 'string'],

        // Background Image (Normal, responsive)
        'backgroundImage' => ['type' => 'object'],
        'backgroundImage_tablet' => ['type' => 'object'],
        'backgroundImage_mobile' => ['type' => 'object'],

        // Background Image (Hover, responsive)
        'backgroundImageHover' => ['type' => 'object'],
        'backgroundImageHover_tablet' => ['type' => 'object'],
        'backgroundImageHover_mobile' => ['type' => 'object'],

        // Image Resolution (Normal/Hover, responsive)
        'bgImageResolution' => ['type' => 'string', 'default' => 'full'],
        'bgImageResolution_tablet' => ['type' => 'string'],
        'bgImageResolution_mobile' => ['type' => 'string'],
        'bgImageResolutionHover' => ['type' => 'string', 'default' => 'full'],
        'bgImageResolutionHover_tablet' => ['type' => 'string'],
        'bgImageResolutionHover_mobile' => ['type' => 'string'],

        // Image Position (Normal/Hover, responsive)
        'bgImagePosition' => ['type' => 'string', 'default' => 'center center'],
        'bgImagePosition_tablet' => ['type' => 'string'],
        'bgImagePosition_mobile' => ['type' => 'string'],
        'bgImagePositionHover' => ['type' => 'string', 'default' => 'center center'],
        'bgImagePositionHover_tablet' => ['type' => 'string'],
        'bgImagePositionHover_mobile' => ['type' => 'string'],

        // Image Attachment (Normal/Hover)
        'bgImageAttachment' => ['type' => 'string', 'default' => 'scroll'],
        'bgImageAttachmentHover' => ['type' => 'string', 'default' => 'scroll'],

        // Image Repeat (Normal/Hover, responsive)
        'bgImageRepeat' => ['type' => 'string', 'default' => 'no-repeat'],
        'bgImageRepeat_tablet' => ['type' => 'string'],
        'bgImageRepeat_mobile' => ['type' => 'string'],
        'bgImageRepeatHover' => ['type' => 'string', 'default' => 'no-repeat'],
        'bgImageRepeatHover_tablet' => ['type' => 'string'],
        'bgImageRepeatHover_mobile' => ['type' => 'string'],

        // Image Size (Normal/Hover, responsive)
        'bgImageSize' => ['type' => 'string', 'default' => 'cover'],
        'bgImageSize_tablet' => ['type' => 'string'],
        'bgImageSize_mobile' => ['type' => 'string'],
        'bgImageSizeHover' => ['type' => 'string', 'default' => 'cover'],
        'bgImageSizeHover_tablet' => ['type' => 'string'],
        'bgImageSizeHover_mobile' => ['type' => 'string'],

        // Image Custom Width (Normal/Hover, responsive)
        'bgImageCustomWidth' => ['type' => 'number'],
        'bgImageCustomWidth_tablet' => ['type' => 'number'],
        'bgImageCustomWidth_mobile' => ['type' => 'number'],
        'bgImageCustomWidthUnit' => ['type' => 'string', 'default' => 'px'],
        'bgImageCustomWidthHover' => ['type' => 'number'],
        'bgImageCustomWidthHover_tablet' => ['type' => 'number'],
        'bgImageCustomWidthHover_mobile' => ['type' => 'number'],
        'bgImageCustomWidthHoverUnit' => ['type' => 'string', 'default' => 'px'],

        // Gradient (Normal state)
        'gradientColor' => ['type' => 'string'],
        'gradientLocation' => ['type' => 'number', 'default' => 0],
        'gradientLocation_tablet' => ['type' => 'number'],
        'gradientLocation_mobile' => ['type' => 'number'],
        'gradientSecondColor' => ['type' => 'string'],
        'gradientSecondLocation' => ['type' => 'number', 'default' => 100],
        'gradientSecondLocation_tablet' => ['type' => 'number'],
        'gradientSecondLocation_mobile' => ['type' => 'number'],
        'gradientType' => ['type' => 'string', 'default' => 'linear'],
        'gradientAngle' => ['type' => 'number', 'default' => 180],
        'gradientAngle_tablet' => ['type' => 'number'],
        'gradientAngle_mobile' => ['type' => 'number'],
        'gradientPosition' => ['type' => 'string', 'default' => 'center center'],

        // Gradient (Hover state)
        'gradientColorHover' => ['type' => 'string'],
        'gradientLocationHover' => ['type' => 'number', 'default' => 0],
        'gradientLocationHover_tablet' => ['type' => 'number'],
        'gradientLocationHover_mobile' => ['type' => 'number'],
        'gradientSecondColorHover' => ['type' => 'string'],
        'gradientSecondLocationHover' => ['type' => 'number', 'default' => 100],
        'gradientSecondLocationHover_tablet' => ['type' => 'number'],
        'gradientSecondLocationHover_mobile' => ['type' => 'number'],
        'gradientTypeHover' => ['type' => 'string', 'default' => 'linear'],
        'gradientAngleHover' => ['type' => 'number', 'default' => 180],
        'gradientAngleHover_tablet' => ['type' => 'number'],
        'gradientAngleHover_mobile' => ['type' => 'number'],
        'gradientPositionHover' => ['type' => 'string', 'default' => 'center center'],

        // ============================================
        // BORDER SECTION
        // ============================================

        // Border (Active tab state)
        'borderActiveTab' => ['type' => 'string', 'default' => 'normal'],

        // Border (Normal state)
        'borderType' => ['type' => 'string', 'default' => ''],
        'borderWidth' => ['type' => 'object', 'default' => []],
        'borderColor' => ['type' => 'string'],
        'borderRadius' => ['type' => 'object', 'default' => []],
        'borderRadius_tablet' => ['type' => 'object'],
        'borderRadius_mobile' => ['type' => 'object'],
        'boxShadow' => ['type' => 'object', 'default' => []],

        // Border (Hover state)
        'borderTypeHover' => ['type' => 'string'],
        'borderWidthHover' => ['type' => 'object', 'default' => []],
        'borderColorHover' => ['type' => 'string'],
        'borderRadiusHover' => ['type' => 'object', 'default' => []],
        'borderRadiusHover_tablet' => ['type' => 'object'],
        'borderRadiusHover_mobile' => ['type' => 'object'],
        'boxShadowHover' => ['type' => 'object', 'default' => []],

        // ============================================
        // MASK SECTION
        // ============================================

        'maskType' => ['type' => 'string', 'default' => 'none'],
        'maskShape' => ['type' => 'string', 'default' => 'circle'],
        'maskImage' => ['type' => 'object'],
        'maskSize' => ['type' => 'string', 'default' => 'contain'],
        'maskPosition' => ['type' => 'string', 'default' => 'center center'],
        'maskRepeat' => ['type' => 'string', 'default' => 'no-repeat'],

        // ============================================
        // TRANSFORM SECTION
        // ============================================

        // Rotate
        'transformRotate' => ['type' => 'number'],
        'transformRotate_tablet' => ['type' => 'number'],
        'transformRotate_mobile' => ['type' => 'number'],
        'transformRotate3dX' => ['type' => 'number'],
        'transformRotate3dX_tablet' => ['type' => 'number'],
        'transformRotate3dX_mobile' => ['type' => 'number'],
        'transformRotate3dY' => ['type' => 'number'],
        'transformRotate3dY_tablet' => ['type' => 'number'],
        'transformRotate3dY_mobile' => ['type' => 'number'],
        'transformRotate3dPerspective' => ['type' => 'number', 'default' => 1000],
        'transformRotate3dPerspective_tablet' => ['type' => 'number'],
        'transformRotate3dPerspective_mobile' => ['type' => 'number'],

        // Offset
        'transformOffsetX' => ['type' => 'number'],
        'transformOffsetX_tablet' => ['type' => 'number'],
        'transformOffsetX_mobile' => ['type' => 'number'],
        'transformOffsetXUnit' => ['type' => 'string', 'default' => 'px'],
        'transformOffsetY' => ['type' => 'number'],
        'transformOffsetY_tablet' => ['type' => 'number'],
        'transformOffsetY_mobile' => ['type' => 'number'],
        'transformOffsetYUnit' => ['type' => 'string', 'default' => 'px'],

        // Scale
        'transformScaleX' => ['type' => 'number'],
        'transformScaleX_tablet' => ['type' => 'number'],
        'transformScaleX_mobile' => ['type' => 'number'],
        'transformScaleY' => ['type' => 'number'],
        'transformScaleY_tablet' => ['type' => 'number'],
        'transformScaleY_mobile' => ['type' => 'number'],
        'transformScaleLinked' => ['type' => 'boolean', 'default' => true],

        // Skew
        'transformSkewX' => ['type' => 'number'],
        'transformSkewX_tablet' => ['type' => 'number'],
        'transformSkewX_mobile' => ['type' => 'number'],
        'transformSkewY' => ['type' => 'number'],
        'transformSkewY_tablet' => ['type' => 'number'],
        'transformSkewY_mobile' => ['type' => 'number'],

        // Flip
        'transformFlipH' => ['type' => 'boolean'],
        'transformFlipH_tablet' => ['type' => 'boolean'],
        'transformFlipH_mobile' => ['type' => 'boolean'],
        'transformFlipV' => ['type' => 'boolean'],
        'transformFlipV_tablet' => ['type' => 'boolean'],
        'transformFlipV_mobile' => ['type' => 'boolean'],

        // ============================================
        // MOTION EFFECTS SECTION
        // ============================================

        'motionScrollingEnabled' => ['type' => 'boolean', 'default' => false],
        'motionScrollingDirection' => ['type' => 'string', 'default' => ''],
        'motionScrollingSpeed' => ['type' => 'number', 'default' => 4],
        'motionScrollingViewport' => ['type' => 'object', 'default' => ['start' => 0, 'end' => 100]],
        'motionScrollingDevices' => ['type' => 'array', 'default' => ['desktop', 'tablet', 'mobile']],

        'motionMouseEnabled' => ['type' => 'boolean', 'default' => false],
        'motionMouseDirection' => ['type' => 'string', 'default' => ''],
        'motionMouseSpeed' => ['type' => 'number', 'default' => 1],

        // ============================================
        // RESPONSIVE VISIBILITY SECTION
        // ============================================

        'hideDesktop' => ['type' => 'boolean', 'default' => false],
        'hideTablet' => ['type' => 'boolean', 'default' => false],
        'hideMobile' => ['type' => 'boolean', 'default' => false],

        // ============================================
        // CUSTOM CSS SECTION
        // ============================================

        'customCSS' => ['type' => 'string', 'default' => ''],
    ];
}
