# Voxel FSE Inspector Controls Library

**Complete Reference Guide**
**Last Updated:** January 2026
**Location:** `themes/voxel-fse/app/blocks/shared/controls/`
**Total Controls:** 39 controls + utilities

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Control Categories](#control-categories)
4. [Usage Patterns](#usage-patterns)
5. [TypeScript Types](#typescript-types)
6. [Migration Guide](#migration-guide)

---

## Overview

The Voxel FSE Inspector Controls Library is a comprehensive collection of reusable React components for Gutenberg block inspector panels. All controls match Elementor UI patterns while integrating seamlessly with WordPress Gutenberg.

### Key Features

- ✅ **Zero Duplication** - Single source of truth for all inspector controls
- ✅ **Type-Safe** - Full TypeScript support with exported interfaces
- ✅ **Responsive** - Built-in desktop/tablet/mobile breakpoint support
- ✅ **State Management** - Normal/Hover state variants
- ✅ **Elementor Parity** - Matches Elementor control types and behavior
- ✅ **WordPress Integration** - Uses WordPress components and design system

### Architecture

```
themes/voxel-fse/app/blocks/shared/controls/
├── index.ts                    # Barrel export - import from here
├── elementor-controls.css      # Global control styles
├── [ControlName].tsx           # Individual control components
└── advanced-tab-attributes.php # AdvancedTab attribute definitions
```

---

## Quick Start

### Import Controls

```typescript
// Import from barrel export
import {
  ColorControl,
  TypographyControl,
  InspectorTabs,
  AdvancedTab,
  BoxControl,
  ResponsiveRangeControl,
} from '@shared/controls';
```

### Basic Usage

```tsx
// Simple color control
<ColorControl
  label="Background Color"
  value={attributes.backgroundColor}
  onChange={(color) => setAttributes({ backgroundColor: color })}
/>

// Typography control
<TypographyControl
  label="Heading Typography"
  value={attributes.headingTypography}
  onChange={(typography) => setAttributes({ headingTypography: typography })}
/>

// Responsive range control
<ResponsiveRangeControl
  label="Width"
  value={attributes.width}
  onChange={(width) => setAttributes({ width })}
  min={0}
  max={100}
  unit="%"
/>
```

### Inspector Tabs Integration

```tsx
<InspectorControls>
  <InspectorTabs
    tabs={[
      {
        id: 'content',
        label: __('Content', 'voxel-fse'),
        icon: '\ue92c',
        render: () => <ContentTab attributes={attributes} setAttributes={setAttributes} />
      },
      {
        id: 'style',
        label: __('Style', 'voxel-fse'),
        icon: '\ue921',
        render: () => <StyleTab attributes={attributes} setAttributes={setAttributes} />
      }
    ]}
    includeAdvancedTab={true}
    attributes={attributes}
    setAttributes={setAttributes}
    defaultTab="content"
  />
</InspectorControls>
```

---

## Control Categories

### 1. Layout & Structure Controls

Controls for organizing inspector panels and navigation.

| Control | Purpose | Key Features | File |
|---------|---------|--------------|------|
| **InspectorTabs** | Tab navigation component | WordPress-style animated indicator, Auto-includes AdvancedTab, Render prop pattern, Supports up to 7 tabs | `InspectorTabs.tsx` |
| **SectionHeading** | Section divider | Simple separator for organizing controls, Matches Elementor section style | `SectionHeading.tsx` |
| **StyleTabPanel** | Local state tabs | Normal/Hover/Active tabs, Uses useState (not persisted), Render prop pattern | `StyleTabPanel.tsx` |
| **StateTabPanel** | Persistent state tabs | Normal/Hover/Active tabs, Saves to block attributes, Auto-responsive grid layout | `StateTabPanel.tsx` |

**Usage Example:**

```tsx
// InspectorTabs - Main navigation
<InspectorTabs
  tabs={[
    { id: 'content', label: 'Content', icon: '\ue92c', render: () => <ContentTab /> }
  ]}
  includeAdvancedTab={true}
  attributes={attributes}
  setAttributes={setAttributes}
/>

// SectionHeading - Organize controls
<SectionHeading label="Background Settings" />

// StateTabPanel - Normal/Hover states
<StateTabPanel
  attributeName="buttonActiveTab"
  attributes={attributes}
  setAttributes={setAttributes}
  tabs={[
    { name: 'normal', title: 'Normal' },
    { name: 'hover', title: 'Hover' }
  ]}
>
  {(tab) => (
    <ColorControl
      label="Background"
      value={attributes[`buttonBg_${tab.name}`]}
      onChange={(v) => setAttributes({ [`buttonBg_${tab.name}`]: v })}
    />
  )}
</StateTabPanel>
```

---

### 2. Basic Input Controls

Simple value input controls for numbers, ranges, and text.

| Control | Purpose | Return Type | Key Features | File |
|---------|---------|-------------|--------------|------|
| **SliderControl** | Number slider | `number` | Min/max/step, WordPress RangeControl wrapper | `SliderControl.tsx` |
| **RangeSliderControl** | Min/max range | `{min: number, max: number}` | Dual-handle slider, For range filters | `RangeSliderControl.tsx` |
| **DynamicTagTextControl** | Text with dynamic tags | `string` | Voxel dynamic data integration, Tag picker popup | `DynamicTagTextControl.tsx` |

**Usage Example:**

```tsx
// SliderControl
<SliderControl
  label="Opacity"
  value={attributes.opacity}
  onChange={(opacity) => setAttributes({ opacity })}
  min={0}
  max={1}
  step={0.1}
/>

// RangeSliderControl
<RangeSliderControl
  label="Price Range"
  value={attributes.priceRange}
  onChange={(range) => setAttributes({ priceRange: range })}
  min={0}
  max={1000}
/>

// DynamicTagTextControl
<DynamicTagTextControl
  label="Title"
  value={attributes.title}
  onChange={(title) => setAttributes({ title })}
/>
```

---

### 3. Selection Controls

Controls for selecting from predefined options.

| Control | Purpose | Option Format | Key Features | File |
|---------|---------|---------------|--------------|------|
| **ChooseControl** | Icon-based button group | `{value, icon, title}` | Dashicons/Elementor icons, Equal-width buttons | `ChooseControl.tsx` |
| **ButtonGroupControl** | Text-based button group | `{value, label}` | Text options, Flex layout | `ButtonGroupControl.tsx` |
| **Select2Control** | Advanced dropdown | `{value, label, group?}` | Search/filter, Option groups, Multi-select | `Select2Control.tsx` |
| **TemplateSelectControl** | Template dropdown | `{value, label}` | Template/layout selection | `TemplateSelectControl.tsx` |
| **TagMultiSelect** | Tag multi-select | `string[]` | Chip-style display, Taxonomy terms | `TagMultiSelect.tsx` |

**Usage Example:**

```tsx
// ChooseControl - Icon-based
<ChooseControl
  label="Alignment"
  value={attributes.align}
  onChange={(align) => setAttributes({ align })}
  options={[
    { value: 'left', icon: 'eicon-align-left', title: 'Left' },
    { value: 'center', icon: 'eicon-align-center', title: 'Center' },
    { value: 'right', icon: 'eicon-align-right', title: 'Right' }
  ]}
/>

// ButtonGroupControl - Text-based
<ButtonGroupControl
  label="Display Mode"
  value={attributes.displayMode}
  onChange={(mode) => setAttributes({ displayMode: mode })}
  options={[
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' }
  ]}
/>

// Select2Control - Advanced dropdown
<Select2Control
  label="Post Type"
  value={attributes.postType}
  onChange={(postType) => setAttributes({ postType })}
  options={[
    { value: 'post', label: 'Posts', group: 'WordPress' },
    { value: 'page', label: 'Pages', group: 'WordPress' },
    { value: 'place', label: 'Places', group: 'Voxel' }
  ]}
  isMulti={false}
  isSearchable={true}
/>
```

---

### 4. Color Controls

Controls for color selection and management.

| Control | Purpose | Features | Supports | File |
|---------|---------|----------|----------|------|
| **ColorControl** | Basic color picker | WordPress color picker, Theme colors | Hex colors | `ColorControl.tsx` |
| **ColorPickerControl** | Enhanced color picker | Alpha channel, Gradients (linear/radial), Preset colors | RGBA, Gradients | `ColorPickerControl.tsx` |
| **ResponsiveColorControl** | Responsive color picker | Device breakpoints, Separate colors per device | Desktop/Tablet/Mobile | `ResponsiveColorControl.tsx` |

**Usage Example:**

```tsx
// ColorControl - Simple
<ColorControl
  label="Text Color"
  value={attributes.textColor}
  onChange={(color) => setAttributes({ textColor: color })}
/>

// ColorPickerControl - With alpha and gradient
<ColorPickerControl
  label="Background"
  value={attributes.background}
  onChange={(bg) => setAttributes({ background: bg })}
  enableAlpha={true}
  enableGradient={true}
/>

// ResponsiveColorControl - Per device
<ResponsiveColorControl
  label="Heading Color"
  value={attributes.headingColor}
  onChange={(color) => setAttributes({ headingColor: color })}
  // Automatically manages _tablet and _mobile variants
/>
```

---

### 5. Typography Controls

Controls for text and font styling.

| Control | Purpose | Properties Managed | State Support | File |
|---------|---------|-------------------|---------------|------|
| **TypographyControl** | Basic typography | Font family, size, weight, style, line-height, letter-spacing, text-transform, decoration | No | `TypographyControl.tsx` |
| **TypographyPopup** | Advanced typography | All TypographyControl properties + responsive variants | Normal/Hover, Desktop/Tablet/Mobile | `TypographyPopup.tsx` |

**Value Structure:**

```typescript
interface TypographyValue {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: string;
  textDecoration?: string;
}
```

**Usage Example:**

```tsx
// TypographyControl - Basic
<TypographyControl
  label="Body Typography"
  value={attributes.bodyTypography}
  onChange={(typography) => setAttributes({ bodyTypography: typography })}
/>

// TypographyPopup - Advanced with responsive and hover
<TypographyPopup
  label="Heading Typography"
  value={attributes.headingTypography}
  onChange={(typography) => setAttributes({ headingTypography: typography })}
  // Manages responsive (_tablet, _mobile) and hover (Hover suffix) automatically
/>
```

---

### 6. Dimension & Spacing Controls

Controls for size, spacing, and box model properties.

| Control | Purpose | Sides | Units | Responsive | File |
|---------|---------|-------|-------|------------|------|
| **BoxControl** | Four-sided box | Top/Right/Bottom/Left | px | No | `BoxControl.tsx` |
| **DimensionsControl** | Enhanced box control | Top/Right/Bottom/Left | px/em/rem/%/vw/vh | Yes | `DimensionsControl.tsx` |
| **FourRangeControl** | Four range sliders | Top/Right/Bottom/Left | Custom per side | No | `FourRangeControl.tsx` |
| **ColumnGapControl** | CSS gap property | Row/Column | px/em/rem | No | `ColumnGapControl.tsx` |
| **AlignmentControl** | Text alignment | N/A | N/A | No | `AlignmentControl.tsx` |

**Usage Example:**

```tsx
// BoxControl - Simple margin/padding
<BoxControl
  label="Margin"
  value={attributes.margin}
  onChange={(margin) => setAttributes({ margin })}
/>

// DimensionsControl - Responsive with units
<DimensionsControl
  label="Padding"
  value={attributes.padding}
  onChange={(padding) => setAttributes({ padding })}
  // Supports linked mode and responsive variants
/>

// FourRangeControl - Individual ranges
<FourRangeControl
  label="Border Width"
  value={attributes.borderWidth}
  onChange={(width) => setAttributes({ borderWidth: width })}
  config={{
    top: { min: 0, max: 10, step: 1 },
    right: { min: 0, max: 10, step: 1 },
    bottom: { min: 0, max: 10, step: 1 },
    left: { min: 0, max: 10, step: 1 }
  }}
/>

// AlignmentControl - Text align
<AlignmentControl
  label="Text Alignment"
  value={attributes.textAlign}
  onChange={(align) => setAttributes({ textAlign: align })}
/>
```

---

### 7. Advanced Style Controls

Advanced styling controls for borders, shadows, and effects.

| Control | Purpose | Features | State Support | File |
|---------|---------|----------|---------------|------|
| **BorderGroupControl** | Complete border control | Type, width (4-sided), color, radius | Normal/Hover | `BorderGroupControl.tsx` |
| **BoxShadowPopup** | Box shadow control | Offset X/Y, Blur, Spread, Color, Inset | Normal/Hover | `BoxShadowPopup.tsx` |
| **TransformControls** | CSS transforms | Rotate (3D), Translate, Scale, Skew, Flip | Responsive | `TransformControls.tsx` |

**Usage Example:**

```tsx
// BorderGroupControl - Complete border
<BorderGroupControl
  label="Border"
  value={attributes.border}
  onChange={(border) => setAttributes({ border })}
  // Returns: { type, width: {top, right, bottom, left}, color, radius }
/>

// BoxShadowPopup - Drop shadow with states
<BoxShadowPopup
  label="Shadow"
  value={attributes.shadow}
  onChange={(shadow) => setAttributes({ shadow })}
  // Supports Normal and Hover states
/>

// TransformControls - 3D transforms
<TransformControls
  attributes={attributes}
  setAttributes={setAttributes}
  // Manages all transform properties: rotate, translate, scale, skew, flip
  // Responsive variants included
/>
```

---

### 8. Media & Asset Controls

Controls for media uploads and asset selection.

| Control | Purpose | Media Type | Features | File |
|---------|---------|-----------|----------|------|
| **IconPickerControl** | Elementor icon picker | Icons | Elementor eicons library, Search/select | `IconPickerControl.tsx` |
| **ImageUploadControl** | WordPress media library | Images | Upload, Size, Position, Attachment, Repeat | `ImageUploadControl.tsx` |
| **BackgroundImageControl** | Background image upload | Images | Preset for background use cases | `ImageUploadControl.tsx` |

**Value Structure:**

```typescript
interface IconValue {
  library: string;  // 'eicons'
  value: string;    // 'eicon-star'
}

interface ImageUploadValue {
  url?: string;
  id?: number;
  size?: string;
  position?: string;
  attachment?: string;
  repeat?: string;
  backgroundSize?: string;
}
```

**Usage Example:**

```tsx
// IconPickerControl
<IconPickerControl
  label="Icon"
  value={attributes.icon}
  onChange={(icon) => setAttributes({ icon })}
  // Returns: { library: 'eicons', value: 'eicon-star' }
/>

// ImageUploadControl
<ImageUploadControl
  label="Image"
  value={attributes.image}
  onChange={(image) => setAttributes({ image })}
/>

// BackgroundImageControl
<BackgroundImageControl
  label="Background Image"
  value={attributes.backgroundImage}
  onChange={(bg) => setAttributes({ backgroundImage: bg })}
/>
```

---

### 9. Responsive Controls

Controls with built-in responsive breakpoint support.

| Control | Purpose | Breakpoints | Units | File |
|---------|---------|-------------|-------|------|
| **ResponsiveRangeControl** | Responsive range slider | Desktop/Tablet/Mobile | px/em/rem/%/vw/vh | `ResponsiveRangeControl.tsx` |
| **ResponsiveRangeControlWithDropdown** | Range with unit dropdown | Desktop/Tablet/Mobile | px/em/rem/%/vw/vh | `ResponsiveRangeControlWithDropdown.tsx` |
| **ResponsiveControl** | Base responsive wrapper | Desktop/Tablet/Mobile | N/A | `ResponsiveControl.tsx` |
| **ResponsiveDropdownButton** | Device switcher button | Desktop/Tablet/Mobile | N/A | `ResponsiveDropdownButton.tsx` |
| **UnitDropdownButton** | Unit selector button | N/A | px/em/rem/%/vw/vh | `UnitDropdownButton.tsx` |

**Responsive Attribute Pattern:**

```typescript
// Base attributes
width: 100,
width_tablet: 80,
width_mobile: 60,

// All responsive controls follow this pattern
```

**Usage Example:**

```tsx
// ResponsiveRangeControl - Full responsive support
<ResponsiveRangeControl
  label="Width"
  value={attributes.width}
  onChange={(width) => setAttributes({ width })}
  min={0}
  max={100}
  unit="%"
  // Automatically manages width_tablet and width_mobile
/>

// ResponsiveRangeControlWithDropdown - Compact UI
<ResponsiveRangeControlWithDropdown
  label="Font Size"
  value={attributes.fontSize}
  onChange={(size) => setAttributes({ fontSize: size })}
  min={10}
  max={100}
  units={['px', 'em', 'rem']}
/>
```

**Breakpoints:**

| Device | CSS Media Query | Attribute Suffix |
|--------|----------------|------------------|
| Desktop | Default (no media query) | (none) |
| Tablet | `768px - 1024px` | `_tablet` |
| Mobile | `< 768px` | `_mobile` |

---

### 10. Specialized Controls

Controls for specific advanced features.

| Control | Purpose | Features | Exports | File |
|---------|---------|----------|---------|------|
| **AnimationSelectControl** | Animation presets | Entrance/Exit animations, Duration, Delay | `ANIMATION_OPTIONS` | `AnimationSelectControl.tsx` |
| **MotionEffectsControls** | Motion effects panel | Scrolling effects, Mouse effects, Viewport triggers, Device toggles | `motionEffectsAttributes` | `MotionEffectsControls.tsx` |
| **CodeEditorControl** | Code editor | CSS syntax highlighting, Linting, Error markers, Auto-complete | None | `CodeEditorControl.tsx` |
| **RelationControl** | Block linking | Scroll to block, Hover highlighting, Visual selection | None | `RelationControl.tsx` |

**Usage Example:**

```tsx
// AnimationSelectControl
<AnimationSelectControl
  label="Entrance Animation"
  value={attributes.animation}
  onChange={(animation) => setAttributes({ animation })}
/>

// MotionEffectsControls - Complete panel
<MotionEffectsControls
  attributes={attributes}
  setAttributes={setAttributes}
  // Manages scrolling and mouse effects with all options
/>

// CodeEditorControl - CSS editor
<CodeEditorControl
  label="Custom CSS"
  value={attributes.customCSS}
  onChange={(css) => setAttributes({ customCSS: css })}
  mode="css"
  lineNumbers={true}
/>

// RelationControl - Link to another block
<RelationControl
  label="Link to Search Form"
  items={searchFormBlocks.map(b => ({
    id: b.blockId,
    clientId: b.clientId
  }))}
  selectedId={attributes.searchFormId}
  onSelect={(id) => setAttributes({ searchFormId: id })}
  widgetType="SearchForm"
/>
```

---

### 11. Complete Tab Components

Pre-built complete inspector tab panels.

| Component | Purpose | Sections | Attributes | File |
|-----------|---------|----------|------------|------|
| **AdvancedTab** | Universal advanced tab | 8 sections: Layout, Background, Border, Mask, Transform, Motion Effects, Visibility, Custom CSS | ~100+ (auto-merged) | `AdvancedTab.tsx` + `advanced-tab-attributes.php` |
| **VoxelTab** | Voxel-specific tab | Legacy Voxel integration | N/A | `VoxelTab.tsx` |

**AdvancedTab Sections:**

| Section | Controls Included |
|---------|-------------------|
| **Layout** | Margin, Padding, Width, Flexbox, Position, Z-Index, CSS ID/Classes |
| **Background** | Type (Classic/Gradient), Color, Image, Responsive, Normal/Hover states |
| **Border** | Type, Width (4-sided), Color, Radius, Box Shadow, Normal/Hover states |
| **Mask** | Shape/Image, Size, Position, Repeat |
| **Transform** | Rotate (3D), Offset, Scale, Skew, Flip, Responsive |
| **Motion Effects** | Scrolling Effects, Mouse Effects, Viewport Triggers, Device toggles |
| **Visibility** | Hide on Desktop/Tablet/Mobile |
| **Custom CSS** | CodeMirror editor with `selector` placeholder |

**Auto-Merging System:**

```php
// Block_Loader.php automatically merges advanced attributes
private static function merge_advanced_tab_attributes(array $block_config): array
{
    $advanced_attributes = get_advanced_tab_attributes();
    $existing_attributes = $block_config['attributes'] ?? [];
    $block_config['attributes'] = array_merge($advanced_attributes, $existing_attributes);
    return $block_config;
}
```

**Usage:**

```tsx
// Automatic inclusion via InspectorTabs
<InspectorTabs
  tabs={customTabs}
  includeAdvancedTab={true}  // AdvancedTab added automatically
  attributes={attributes}
  setAttributes={setAttributes}
/>

// Or standalone
<AdvancedTab
  attributes={attributes}
  setAttributes={setAttributes}
/>
```

**CRITICAL:** Never add advanced tab attributes to `block.json` - they're automatically merged during block registration.

---

### 12. Utility Exports

Shared constants, utilities, and helper functions.

| Export | Type | Purpose | File |
|--------|------|---------|------|
| **WP_COLORS** | `Constant` | WordPress theme color palette array | `theme-constants.tsx` |
| **BUTTON_STYLES** | `Constant` | Button styling for active/inactive states | `theme-constants.tsx` |
| **ResetIcon** | `Component` | Reset button icon | `theme-constants.tsx` |
| **ResetIconSmall** | `Component` | Smaller reset icon | `theme-constants.tsx` |
| **getButtonStyle** | `Function` | Get button style based on active state | `theme-constants.tsx` |
| **mergeButtonStyle** | `Function` | Merge button styles with custom CSS | `theme-constants.tsx` |
| **advancedTabAttributes** | `Export` | AdvancedTab attributes (reference only) | `AdvancedTab.tsx` |
| **ANIMATION_OPTIONS** | `Constant` | Animation preset options array | `AnimationSelectControl.tsx` |

**Usage Example:**

```tsx
import { WP_COLORS, getButtonStyle, mergeButtonStyle } from '@shared/controls';

// Use WordPress colors
const colorOptions = WP_COLORS.map(color => ({
  label: color.name,
  value: color.color
}));

// Button styling
const buttonStyle = getButtonStyle(isActive);
const mergedStyle = mergeButtonStyle(isActive, { padding: '10px' });
```

---

## Usage Patterns

### Import Pattern

Always import from the barrel export (`@shared/controls`):

```typescript
// ✅ Correct
import { ColorControl, TypographyControl, InspectorTabs } from '@shared/controls';

// ❌ Wrong
import ColorControl from '@shared/controls/ColorControl';
```

### Control Selection Guidelines

| Use Case | Recommended Control |
|----------|-------------------|
| Simple color | `ColorControl` |
| Color with transparency/gradient | `ColorPickerControl` |
| Basic text styling | `TypographyControl` |
| Advanced typography with responsive | `TypographyPopup` |
| Icon-based options (alignment, etc.) | `ChooseControl` |
| Text-based options | `ButtonGroupControl` |
| Simple spacing | `BoxControl` |
| Responsive spacing with units | `DimensionsControl` |
| Persistent state tabs | `StateTabPanel` |
| Local state tabs | `StyleTabPanel` |

### Responsive Control Pattern

All responsive controls follow the same attribute naming pattern:

```typescript
// Attribute structure
{
  width: 100,        // Desktop (base)
  width_tablet: 80,  // Tablet
  width_mobile: 60   // Mobile
}

// Responsive control handles this automatically
<ResponsiveRangeControl
  label="Width"
  value={attributes.width}
  onChange={(width) => setAttributes({ width })}
/>
```

### State Control Pattern

Normal/Hover states use attribute suffix pattern:

```typescript
// Attribute structure
{
  buttonBg: '#007cba',       // Normal state
  buttonBgHover: '#005a87'   // Hover state
}

// State tab panel manages switching
<StateTabPanel
  attributeName="buttonActiveTab"
  attributes={attributes}
  setAttributes={setAttributes}
  tabs={[
    { name: 'normal', title: 'Normal' },
    { name: 'hover', title: 'Hover' }
  ]}
>
  {(tab) => (
    <ColorControl
      label="Background"
      value={attributes[`buttonBg${tab.name === 'hover' ? 'Hover' : ''}`]}
      onChange={(v) => setAttributes({
        [`buttonBg${tab.name === 'hover' ? 'Hover' : ''}`]: v
      })}
    />
  )}
</StateTabPanel>
```

### Block Integration Pattern

Standard pattern for all blocks:

```tsx
import { InspectorControls } from '@wordpress/block-editor';
import { InspectorTabs, ColorControl, TypographyControl } from '@shared/controls';

export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        <InspectorTabs
          tabs={[
            {
              id: 'content',
              label: 'Content',
              icon: '\ue92c',
              render: () => (
                <div className="vxfse-tab-panel">
                  {/* Content controls here */}
                </div>
              )
            },
            {
              id: 'style',
              label: 'Style',
              icon: '\ue921',
              render: () => (
                <div className="vxfse-tab-panel">
                  <ColorControl
                    label="Text Color"
                    value={attributes.textColor}
                    onChange={(color) => setAttributes({ textColor: color })}
                  />
                  <TypographyControl
                    label="Typography"
                    value={attributes.typography}
                    onChange={(typo) => setAttributes({ typography: typo })}
                  />
                </div>
              )
            }
          ]}
          includeAdvancedTab={true}
          attributes={attributes}
          setAttributes={setAttributes}
          defaultTab="content"
        />
      </InspectorControls>

      {/* Block preview */}
    </>
  );
}
```

### Advanced Tab Integration

The AdvancedTab is automatically included and requires no manual setup:

```typescript
// ❌ NEVER add advanced attributes to block.json
// They're automatically merged by Block_Loader.php

// ✅ Just enable in InspectorTabs
<InspectorTabs
  tabs={customTabs}
  includeAdvancedTab={true}  // That's it!
  attributes={attributes}
  setAttributes={setAttributes}
/>

// ✅ Use style generation utilities
import {
  generateAdvancedStyles,
  generateAdvancedResponsiveCSS,
  combineBlockClasses
} from '@shared/utils/generateAdvancedStyles';

// In edit.tsx
const advancedStyles = generateAdvancedStyles(attributes);
const responsiveCSS = generateAdvancedResponsiveCSS(attributes, `.my-block-${blockId}`);
const className = combineBlockClasses('my-block', attributes);

return (
  <div className={className} style={advancedStyles}>
    {responsiveCSS && <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />}
    {/* Block content */}
  </div>
);
```

---

## TypeScript Types

### Exported Type Interfaces

| Type | Purpose | Properties |
|------|---------|-----------|
| `TypographyValue` | Typography settings | `fontFamily`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`, `textTransform`, `textDecoration` |
| `IconValue` | Icon selection | `library`, `value` |
| `BoxValues` | Four-sided dimensions | `top`, `right`, `bottom`, `left` |
| `BorderGroupValue` | Complete border | `type`, `width`, `color`, `radius` |
| `ImageUploadValue` | Image with settings | `url`, `id`, `size`, `position`, `attachment`, `repeat`, `backgroundSize` |
| `BackgroundImageValue` | Background image | Same as `ImageUploadValue` |
| `AlignmentValue` | Text alignment | `left`, `center`, `right`, `justify` |
| `RangeSliderValue` | Min/max range | `min`, `max` |
| `TransformAttributes` | Transform properties | `rotate`, `translate`, `scale`, `skew`, `flip` (all responsive) |
| `MotionEffectsAttributes` | Motion effects | Scrolling and mouse effect properties |

### Props Type Interfaces

All controls export Props interfaces:

```typescript
import type {
  ColorControlProps,
  TypographyControlProps,
  BoxControlProps,
  InspectorTabsProps,
  TabConfig,
  // ... and 20+ more
} from '@shared/controls';
```

### Type-Safe Usage

```typescript
import { useState } from '@wordpress/element';
import type { TypographyValue, IconValue } from '@shared/controls';

// Type-safe state
const [typography, setTypography] = useState<TypographyValue>({
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: '400'
});

const [icon, setIcon] = useState<IconValue>({
  library: 'eicons',
  value: 'eicon-star'
});

// Type-safe control props
<TypographyControl
  label="Heading"
  value={typography}
  onChange={(v: TypographyValue) => setTypography(v)}
/>
```

---

## Migration Guide

### Migration Checklist

Follow these steps to migrate an existing block to use shared controls:

1. **Audit Current Controls**
   - [ ] List all custom controls in your block
   - [ ] Identify which have shared equivalents
   - [ ] Note any unique controls to keep

2. **Update Imports**
   - [ ] Add `import { ... } from '@shared/controls'`
   - [ ] Remove old control imports/definitions

3. **Replace Controls**
   - [ ] Swap custom controls with shared controls
   - [ ] Update attribute names if needed
   - [ ] Verify value types match

4. **Migrate to InspectorTabs**
   - [ ] Import `InspectorTabs` component
   - [ ] Define `tabs` array with render functions
   - [ ] Set `includeAdvancedTab={true}`
   - [ ] Remove manual tab state/navigation code

5. **Enable AdvancedTab**
   - [ ] Remove manual AdvancedTab from block.json
   - [ ] Verify attributes auto-merge
   - [ ] Add style generation utilities

6. **Clean Up**
   - [ ] Remove duplicate CSS from editor.css
   - [ ] Remove unused control components
   - [ ] Update TypeScript types

7. **Test**
   - [ ] All controls render correctly
   - [ ] Attribute saving/loading works
   - [ ] Responsive variants apply
   - [ ] State variants (hover) work
   - [ ] AdvancedTab appears and functions
   - [ ] Custom CSS compiles
   - [ ] No console errors

### Common Replacements

| Old Pattern | New Pattern |
|------------|-------------|
| Custom color picker | `<ColorControl>` or `<ColorPickerControl>` |
| Custom typography | `<TypographyControl>` or `<TypographyPopup>` |
| Custom tabs | `<InspectorTabs>` |
| Custom spacing | `<BoxControl>` or `<DimensionsControl>` |
| Custom border | `<BorderGroupControl>` |
| Custom shadow | `<BoxShadowPopup>` |
| Manual AdvancedTab | `includeAdvancedTab={true}` |

### Example Migration

**Before:**

```tsx
// Custom tab state
const [activeTab, setActiveTab] = useState('content');

// Custom control
const CustomColorPicker = ({ value, onChange }) => {
  // Custom implementation
};

// Manual tabs
<PanelBody>
  <div className="custom-tabs">
    <button onClick={() => setActiveTab('content')}>Content</button>
    <button onClick={() => setActiveTab('style')}>Style</button>
  </div>
  {activeTab === 'content' && <ContentTab />}
  {activeTab === 'style' && <StyleTab />}
</PanelBody>
```

**After:**

```tsx
// Import shared controls
import { InspectorTabs, ColorControl } from '@shared/controls';

// Use InspectorTabs
<InspectorTabs
  tabs={[
    {
      id: 'content',
      label: 'Content',
      icon: '\ue92c',
      render: () => <ContentTab />
    },
    {
      id: 'style',
      label: 'Style',
      icon: '\ue921',
      render: () => (
        <ColorControl
          label="Color"
          value={attributes.color}
          onChange={(color) => setAttributes({ color })}
        />
      )
    }
  ]}
  includeAdvancedTab={true}
  attributes={attributes}
  setAttributes={setAttributes}
/>
```

### Breaking Changes

When migrating, be aware of these potential breaking changes:

| Area | Change | Migration |
|------|--------|-----------|
| Color values | May need RGBA object instead of string | Convert `#ff0000` to `{ r: 255, g: 0, b: 0, a: 1 }` if using ColorPickerControl |
| Typography values | Now uses TypographyValue interface | Convert individual font properties to single object |
| Responsive attributes | Must use `_tablet`, `_mobile` suffixes | Rename attributes to follow convention |
| State attributes | Must use `Hover` suffix | Rename hover state attributes |

### Reference Implementation

See **search-form block** (`themes/voxel-fse/app/blocks/src/search-form/edit.tsx`) for a complete migration example:

- ✅ Uses `InspectorTabs` with 3 custom tabs + AdvancedTab
- ✅ All controls imported from `@shared/controls`
- ✅ No duplicate CSS in `editor.css`
- ✅ Proper TypeScript types
- ✅ Responsive and state variants working

---

## Common Elementor Icon Codes

For use with `ChooseControl`, `InspectorTabs`, and other icon-based controls:

| Icon | Unicode | Usage |
|------|---------|-------|
| Content | `\ue92c` | Content tabs, general content |
| Settings | `\ue921` | General/Style tabs |
| Advanced | `\ue916` | Advanced tab, settings |
| Layout | `\ue935` | Layout controls |
| Align Left | `\ue90f` | Text alignment |
| Align Center | `\ue910` | Text alignment |
| Align Right | `\ue911` | Text alignment |
| Align Justify | `\ue912` | Text alignment |

Full icon reference: Elementor eicons font (loaded from parent theme)

---

## Performance Best Practices

1. **Only Render Active Tab Content**
   - Use render prop pattern in `InspectorTabs`
   - Content only mounts when tab is active

2. **Debounce Heavy Operations**
   ```tsx
   import { useDebouncedCallback } from 'use-debounce';

   const debouncedUpdate = useDebouncedCallback(
     (value) => setAttributes({ typography: value }),
     300
   );
   ```

3. **Memoize Expensive Controls**
   ```tsx
   import { memo } from '@wordpress/element';

   const MemoizedTypographyControl = memo(TypographyControl);
   ```

4. **Minimize Re-renders**
   - Use `setAttributes` with only changed values
   - Avoid creating new objects in render

---

## Accessibility

All controls follow WordPress and WCAG accessibility guidelines:

- ✅ **Keyboard Navigation** - All controls support Tab, Enter, Escape
- ✅ **Focus Management** - Proper focus states and indicators
- ✅ **ARIA Labels** - Descriptive labels and roles
- ✅ **Semantic HTML** - Proper button, input, select elements
- ✅ **Color Contrast** - WCAG AA compliant contrast ratios

---

## Additional Resources

### Documentation

- **InspectorTabs System**: See `.mcp-memory/inspector-tabs-memory.jsonl`
- **AdvancedTab Details**: See `advanced-tab-attributes.php` comments
- **Block Conversion Guide**: See `docs/block-conversions/universal-widget-conversion-prompt.md`

### Example Implementations

| Block | Features | File |
|-------|----------|------|
| search-form | InspectorTabs, 3 custom tabs, AdvancedTab | `src/search-form/edit.tsx` |
| popup-kit | StateTabPanel, ResponsiveControls, BoxShadowPopup | `src/popup-kit/edit.tsx` |
| post-feed | RelationControl, Select2Control | `src/post-feed/edit.tsx` |

### Support

For questions or issues:
1. Check this documentation first
2. Review reference implementations
3. Check `.mcp-memory/memory.json` for patterns
4. Consult `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`

---

**Last Updated:** January 2026
**Maintained By:** Voxel FSE Development Team
**Status:** Production Ready ✅
