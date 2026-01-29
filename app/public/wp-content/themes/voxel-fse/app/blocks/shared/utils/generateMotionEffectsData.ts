/**
 * Generate Motion Effects Data Utility
 *
 * Maps MotionEffectsAttributes to the `data-settings` JSON format
 * expected by Elementor-compatible frontend scripts.
 *
 * @package VoxelFSE
 */

import type { MotionEffectsAttributes } from '../controls/MotionEffectsControls';

interface ElementorSettings {
    // Animation
    _animation?: string; // Elementor uses _animation
    animation?: string;
    _animation_delay?: number;
    animation_delay?: number;

    // Sticky
    sticky?: string;
    sticky_on?: string[];
    sticky_offset?: number;
    sticky_effects_offset?: number;
    sticky_parent?: string; // "yes" or ""

    // Motion Effects (Scrolling)
    effects_range?: string;

    // Vertical Scroll
    translateY_effect?: string; // "yes"
    translateY_direction?: string;
    translateY_speed?: { size: number; unit: string };
    translateY_affectedRange?: { start: number; end: number };

    // Horizontal Scroll
    translateX_effect?: string;
    translateX_direction?: string;
    translateX_speed?: { size: number; unit: string };
    translateX_affectedRange?: { start: number; end: number };

    // Transparency
    opacity_effect?: string;
    opacity_direction?: string;
    opacity_level?: { size: number; unit: string };
    opacity_affectedRange?: { start: number; end: number };

    // Blur
    blur_effect?: string;
    blur_direction?: string;
    blur_level?: { size: number; unit: string };
    blur_affectedRange?: { start: number; end: number };

    // Rotate
    rotateZ_effect?: string;
    rotateZ_direction?: string;
    rotateZ_speed?: { size: number; unit: string };
    rotateZ_affectedRange?: { start: number; end: number };

    // Scale
    scale_effect?: string;
    scale_direction?: string;
    scale_speed?: { size: number; unit: string };
    scale_affectedRange?: { start: number; end: number };

    // Mouse Effects
    mouseTrack_effect?: string;
    mouseTrack_direction?: string;
    mouseTrack_speed?: { size: number; unit: string };

    tilt_effect?: string;
    tilt_direction?: string;
    tilt_speed?: { size: number; unit: string };

    [key: string]: any;
}

/**
 * Generate data-settings JSON from attributes
 */
export function generateMotionEffectsData(attributes: MotionEffectsAttributes): string | undefined {
    const settings: ElementorSettings = {};
    let hasSettings = false;

    // === Entrance Animation ===
    if (attributes.entranceAnimation && attributes.entranceAnimation !== 'none') {
        settings._animation = attributes.entranceAnimation;
        settings.animation = attributes.entranceAnimation; // Duplicate for compatibility
        hasSettings = true;

        if (attributes.animationDelay) {
            settings._animation_delay = attributes.animationDelay;
            settings.animation_delay = attributes.animationDelay;
        }
    }

    // === Sticky ===
    if (attributes.sticky) {
        settings.sticky = attributes.sticky;
        hasSettings = true;

        if (attributes.stickyOn && attributes.stickyOn.length > 0) {
            settings.sticky_on = attributes.stickyOn;
        }
        if (attributes.stickyOffset) {
            settings.sticky_offset = attributes.stickyOffset;
        }
        if (attributes.stickyEffectsOffset) {
            settings.sticky_effects_offset = attributes.stickyEffectsOffset;
        }
        if (attributes.stickyParent) {
            settings.sticky_parent = 'yes';
        }
    }

    // === Scrolling Effects ===
    if (attributes.scrollingEffectsEnabled) {
        if (attributes.motionFxRange) {
            settings.effects_range = attributes.motionFxRange;
        }

        // Vertical Scroll (Translate Y)
        if (attributes.verticalScrollEnabled) {
            settings.translateY_effect = 'yes';
            settings.translateY_direction = attributes.verticalScrollDirection || 'up'; // Default direction
            settings.translateY_speed = { size: attributes.verticalScrollSpeed ?? 4, unit: 'px' };
            settings.translateY_affectedRange = attributes.verticalScrollViewport || { start: 0, end: 100 };
            hasSettings = true;
        }

        // Horizontal Scroll (Translate X)
        if (attributes.horizontalScrollEnabled) {
            settings.translateX_effect = 'yes';
            settings.translateX_direction = attributes.horizontalScrollDirection || 'left';
            settings.translateX_speed = { size: attributes.horizontalScrollSpeed ?? 4, unit: 'px' };
            settings.translateX_affectedRange = attributes.horizontalScrollViewport || { start: 0, end: 100 };
            hasSettings = true;
        }

        // Transparency (Opacity)
        if (attributes.transparencyEnabled) {
            settings.opacity_effect = 'yes';
            settings.opacity_direction = attributes.transparencyDirection || 'in';
            settings.opacity_level = { size: attributes.transparencyLevel ?? 10, unit: 'px' };
            settings.opacity_affectedRange = attributes.transparencyViewport || { start: 20, end: 80 };
            hasSettings = true;
        }

        // Blur
        if (attributes.blurEnabled) {
            settings.blur_effect = 'yes';
            settings.blur_direction = attributes.blurDirection || 'in';
            settings.blur_level = { size: attributes.blurLevel ?? 7, unit: 'px' };
            settings.blur_affectedRange = attributes.blurViewport || { start: 20, end: 80 };
            hasSettings = true;
        }

        // Rotate
        if (attributes.rotateEnabled) {
            settings.rotateZ_effect = 'yes';
            settings.rotateZ_direction = attributes.rotateDirection || 'left';
            settings.rotateZ_speed = { size: attributes.rotateSpeed ?? 1, unit: 'px' };
            settings.rotateZ_affectedRange = attributes.rotateViewport || { start: 0, end: 100 };
            hasSettings = true;
        }

        // Scale
        if (attributes.scaleEnabled) {
            settings.scale_effect = 'yes';
            settings.scale_direction = attributes.scaleDirection || 'scale-up';
            settings.scale_speed = { size: attributes.scaleSpeed ?? 4, unit: 'px' };
            settings.scale_affectedRange = attributes.scaleViewport || { start: 0, end: 100 };
            hasSettings = true;
        }
    }

    // === Mouse Effects ===
    if (attributes.mouseEffectsEnabled) {
        // Mouse Track
        if (attributes.mouseTrackEnabled) {
            settings.mouseTrack_effect = 'yes';
            settings.mouseTrack_direction = attributes.mouseTrackDirection || 'opposite';
            settings.mouseTrack_speed = { size: attributes.mouseTrackSpeed ?? 1, unit: 'px' };
            hasSettings = true;
        }

        // 3D Tilt
        if (attributes.tiltEnabled) {
            settings.tilt_effect = 'yes';
            settings.tilt_direction = attributes.tiltDirection || 'direct';
            settings.tilt_speed = { size: attributes.tiltSpeed ?? 4, unit: 'px' };
            hasSettings = true;
        }
    }

    if (!hasSettings) {
        return undefined;
    }

    return JSON.stringify(settings);
}
