/**
 * Shared Utils - Barrel Export
 *
 * Re-exports all shared utility functions and components.
 * Mirrors Voxel's commons.js pattern where shared helpers
 * are bundled together for both search-form and create-post blocks.
 *
 * ## Adding AdvancedTab + VoxelTab to a New Block
 *
 * ### What's Automated (no action needed):
 * 1. **Attributes in block.json** - Auto-merged by Block_Loader.php from:
 *    - `shared/advanced-tab-attributes.php` (AdvancedTab: margin, padding, background, border, etc.)
 *    - `shared/voxel-tab-attributes.php` (VoxelTab: sticky position, visibility rules, loop element)
 *
 * ### What You Need to Add Manually:
 *
 * 1. **edit.tsx** - Add Inspector UI components:
 *    ```tsx
 *    import { InspectorTabs, AdvancedTab, VoxelTab } from '@shared/controls';
 *    import { getAdvancedVoxelTabProps } from '../../shared/utils';
 *
 *    export default function Edit({ attributes, setAttributes }) {
 *      const blockId = attributes.blockId || 'my-block';
 *      const advancedProps = getAdvancedVoxelTabProps(attributes, {
 *        blockId,
 *        baseClass: 'voxel-fse-my-block',
 *      });
 *
 *      const blockProps = useBlockProps({
 *        className: advancedProps.className,
 *        style: advancedProps.styles,
 *      });
 *
 *      return (
 *        <>
 *          <InspectorControls>
 *            <InspectorTabs>
 *              {(activeTab) => (
 *                <>
 *                  {activeTab === 'content' && <ContentTab />}
 *                  {activeTab === 'style' && <StyleTab />}
 *                  {activeTab === 'advanced' && <AdvancedTab attributes={attributes} setAttributes={setAttributes} />}
 *                  {activeTab === 'voxel' && <VoxelTab attributes={attributes} setAttributes={setAttributes} />}
 *                </>
 *              )}
 *            </InspectorTabs>
 *          </InspectorControls>
 *          <div {...blockProps}>...</div>
 *        </>
 *      );
 *    }
 *    ```
 *
 * 2. **save.tsx** - Wire styles to output:
 *    ```tsx
 *    import { getAdvancedVoxelTabProps, renderBackgroundElements } from '../../shared/utils';
 *
 *    export default function save({ attributes }) {
 *      const blockId = attributes.blockId || 'my-block';
 *      const advancedProps = getAdvancedVoxelTabProps(attributes, {
 *        blockId,
 *        baseClass: 'voxel-fse-my-block',
 *      });
 *
 *      const blockProps = useBlockProps.save({
 *        id: advancedProps.elementId,
 *        className: advancedProps.className,
 *        style: advancedProps.styles,
 *        ...advancedProps.customAttrs,
 *      });
 *
 *      return (
 *        <div {...blockProps}>
 *          {advancedProps.responsiveCSS && (
 *            <style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
 *          )}
 *          {renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
 *          ...
 *        </div>
 *      );
 *    }
 *    ```
 *
 * @package VoxelFSE
 */

export { VoxelIcons, getFilterIcon, renderIcon, hasIcon } from './voxelIcons';

export {
	getFieldWrapperStyles,
	getFilterWrapperStyles, // Backward compatibility alias
	getPopupStyles,
} from './fieldStyles';

export type {
	FieldStyleConfig,
	FieldWrapperStyles,
	PopupStyles,
} from './fieldStyles';

export {
	getSiteBaseUrl,
	getSitePath,
	makeMultisiteAwareUrl,
} from './siteUrl';

export {
	initVoxelShim,
	isVoxelShimApplied,
} from './voxelShim';

// Advanced styles utilities (AdvancedTab output)
export {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	getVisibilityClasses,
	getCustomClasses,
	combineBlockClasses,
	parseCustomAttributes,
} from './generateAdvancedStyles';

export type { AdvancedStyleAttributes } from './generateAdvancedStyles';

// Voxel styles utilities (VoxelTab output - sticky position)
export {
	generateVoxelStyles,
	generateVoxelResponsiveCSS,
} from './generateVoxelStyles';

export type { VoxelStyleAttributes } from './generateVoxelStyles';

// Motion Effects Data Utility
export { generateMotionEffectsData } from './generateMotionEffectsData';

// Combined AdvancedTab + VoxelTab utility
export {
	getAdvancedVoxelTabProps,
	mergeWithAdvancedStyles,
	mergeWithAdvancedResponsiveCSS,
} from './useAdvancedTabProps';

export type {
	CombinedStyleAttributes,
	AdvancedTabPropsConfig,
	AdvancedTabPropsResult,
} from './useAdvancedTabProps';

// Background elements rendering (overlay, video, slideshow, shape dividers)
export { renderBackgroundElements } from './backgroundElements';

// Icon defaults utility (standardized pattern for icon fallbacks)
export {
	getIconWithFallback,
	createIconGetter,
	hasIconValue,
	EMPTY_ICON,
} from './iconDefaults';

export type { IconValue } from './iconDefaults';
