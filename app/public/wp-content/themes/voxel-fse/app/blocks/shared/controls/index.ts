// Note: Shared control CSS is now in shared-styles.ts entry point
// This ensures proper naming (shared-controls.css) in the build output

// Register shared editor filters for ALL voxel-fse blocks
// This is placed here (barrel export) to ensure it runs for any block
// that imports from shared/controls, regardless of tree-shaking
import '../filters/editorWrapperFilters';

// Core Tab Components
export { default as InspectorTabs } from './InspectorTabs';
export { default as VoxelTab, voxelTabAttributes } from './VoxelTab';
export { default as AdvancedTab, advancedTabAttributes } from './AdvancedTab';

// Color Controls
export { default as ColorControl } from './ColorControl';
export { default as ColorPickerControl } from './ColorPickerControl';
export { default as ResponsiveColorControl } from './ResponsiveColorControl';

export { default as TypographyControl, type TypographyValue } from './TypographyPopup';
export { default as TypographyPopup } from './TypographyPopup';

// Style Popup Controls
export { default as BoxShadowPopup } from './BoxShadowPopup';
export { default as TextShadowPopup } from './TextShadowPopup';
export { default as TextStrokePopup } from './TextStrokePopup';
export { default as CssFiltersPopup } from './CssFiltersPopup';

// Selection Controls
export { default as ChooseControl } from './ChooseControl';
export { default as Select2Control } from './Select2Control';
export { default as TagMultiSelect } from './TagMultiSelect';
export { default as ButtonGroupControl } from './ButtonGroupControl';

// Icon & Media Controls
export { default as IconPickerControl } from './IconPickerControl';
export { default as AdvancedIconControl } from './AdvancedIconControl';
export { default as ImageUploadControl } from './ImageUploadControl';
export { default as GalleryUploadControl } from './GalleryUploadControl';

// Image Size Controls
export { default as ImageSizeSelectControl } from './ImageSizeSelectControl';
export { default as ImageSizeWithCustomControl } from './ImageSizeWithCustomControl';
export {
	IMAGE_SIZES_FULL,
	CUSTOM_SIZE_OPTION,
	getImageSizeOptions,
	type ImageSizeValue,
	type ImageSizeOption,
} from './image-options';

// Dimension Controls
export { default as FourRangeControl } from './FourRangeControl';
export { default as BoxControl } from './BoxControl';
export { default as DimensionsControl } from './DimensionsControl';
export { default as ColumnGapControl } from './ColumnGapControl';
export { default as LinkedGapsControl } from './LinkedGapsControl';
export { default as AlignmentControl } from './AlignmentControl';

// Background Controls
export { default as BackgroundControl } from './BackgroundControl';
export { default as BackgroundOverlayControl } from './BackgroundOverlayControl';
export { default as ShapeDividerControl } from './ShapeDividerControl';

// Border Controls
export { default as BorderGroupControl, type BorderGroupValue, type DimensionsConfig } from './BorderGroupControl';
export { default as AdvancedBorderControl } from './AdvancedBorderControl';

// Responsive Controls
export { default as ResponsiveRangeControl } from './ResponsiveRangeControl';
export { default as ResponsiveRangeControlWithDropdown } from './ResponsiveRangeControlWithDropdown';
export { default as ResponsiveToggle } from './ResponsiveToggle';
export { default as ResponsiveTextControl } from './ResponsiveTextControl';
export { default as ResponsiveSelectControl } from './ResponsiveSelectControl';
export { default as ResponsiveControl } from './ResponsiveControl';
export { default as ResponsiveDimensionsControl } from './ResponsiveDimensionsControl';
export { default as ResponsiveDropdownButton } from './ResponsiveDropdownButton';
export { default as UnitDropdownButton } from './UnitDropdownButton';

// State & Tab Panels
export { default as StateTabPanel } from './StateTabPanel';
export { default as StyleTabPanel } from './StyleTabPanel';
export { default as PersistentPanelBody } from './PersistentPanelBody';
export { default as AccordionPanelGroup, AccordionPanel } from './AccordionPanelGroup';

// Section & Layout
export { default as SectionHeading } from './SectionHeading';
export { EmptyPlaceholder } from './EmptyPlaceholder';

// Animation & Motion
export { default as AnimationSelectControl } from './AnimationSelectControl';
export { default as MotionEffectsControls } from './MotionEffectsControls';
export { default as TransformControls } from './TransformControls';

// Advanced Controls
export {
	default as ElementVisibilityModal,
	getVisibilityRuleLabel,
	type VisibilityRule
} from './ElementVisibilityModal';
export { default as LoopElementModal, type LoopConfig } from './LoopElementModal';
export { default as LoopVisibilityControl, type LoopVisibilityControlProps } from './LoopVisibilityControl';
export { default as RowSettings, type RowSettingsProps, type RowSettingsAttributes } from './RowSettings';
export { default as CodeEditorControl } from './CodeEditorControl';
export { default as RelationControl } from './RelationControl';
export { default as TemplateSelectControl } from './TemplateSelectControl';
export { default as PostSelectControl } from './PostSelectControl';

// Dynamic Tag Controls
export { default as EnableTagsButton } from './EnableTagsButton';
export { default as DynamicTagTextControl } from './DynamicTagTextControl';
export { default as DynamicTagTextareaControl } from './DynamicTagTextareaControl';
export { default as DynamicTagDateTimeControl } from './DynamicTagDateTimeControl';

// Link Controls
export { default as LinkSearchControl, type LinkValue } from './LinkSearchControl';

// Slider Controls
export { default as RangeSliderControl } from './RangeSliderControl';
export { default as SliderControl } from './SliderControl';

// Repeater Control
export { default as RepeaterControl, type RepeaterItem, type RepeaterItemRenderProps, generateRepeaterId } from './RepeaterControl';

// Theme Constants
export * from './theme-constants';

export { default as PopupCustomStyleControl } from './PopupCustomStyleControl';
export { default as FilterPopupStyleControl } from './FilterPopupStyleControl';
export { default as CustomPopupMenuControl } from './CustomPopupMenuControl';

// Common Types
export type { IconValue } from '@shared/types';
