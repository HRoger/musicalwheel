/**
 * Shared Controls CSS Entry Point
 *
 * This file serves as a dedicated entry point for shared control CSS.
 * By having a separate entry, Vite will output CSS with a clear name
 * (shared-controls.css) instead of naming it after a random component.
 *
 * CSS files included:
 * - elementor-controls.css: Core control styles (ImageUploadControl, ChooseControl, etc.)
 * - enable-tags-button.css: Dynamic tag enable button styles
 * - StyleTabPanel.css: Tab panel state styling
 *
 * Note: Component-specific CSS (RepeaterControl.css, RelationControl.css, etc.)
 * remains imported in their respective components for proper code-splitting.
 *
 * @package VoxelFSE
 */

// Core shared control styles
import './elementor-controls.css';

// Dynamic tag button styles (used by ImageUploadControl, AdvancedIconControl, GalleryUploadControl)
import './enable-tags-button.css';

// Tab panel styles (used by InspectorTabs, StateTabPanel, StyleTabPanel)
import './StyleTabPanel.css';

// Export empty object to make this a valid module
export {};
