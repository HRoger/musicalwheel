# Elementor to Gutenberg Control Mapping Specification

**Version:** 1.0.0  
**Last Updated:** 2025-12-23  
**Purpose:** Comprehensive mapping of Voxel Elementor widget controls to Gutenberg FSE block controls

---

## Tab Structure Mapping

### Elementor Tabs → Gutenberg Equivalent

| Elementor Tab | Constant | Gutenberg Approach | Component Status |
|--------------|----------|-------------------|------------------|
| **Content** | `TAB_CONTENT` | Primary `InspectorControls` + `PanelBody` | Native Gutenberg ✅ |
| **Style** | `TAB_STYLE` | State tabs panel | `StyleTabPanel` 🔴 REBUILD |
| **Advanced** | `TAB_ADVANCED` | Spacing, visibility, CSS | `AdvancedTab` 🔴 REBUILD |
| **Voxel** | `'tab_general'` | Voxel-specific settings | `VoxelTab` 🔴 REBUILD |

### Organizing PanelBody Sections

```tsx
<InspectorControls>
  {/* TAB_CONTENT equivalent */}
  <PanelBody title="Settings" initialOpen={true}>
    {/* Content controls */}
  </PanelBody>
  
  {/* TAB_STYLE equivalent */}
  <PanelBody title="Style" initialOpen={false}>
    {/* Use StyleTabPanel for Normal/Hover states */}
    <StyleTabPanel tabs={[
      { name: 'normal', title: 'Normal' },
      { name: 'hover', title: 'Hover' }
    ]}>
      {(tab) => renderStyleForState(tab.name)}
    </StyleTabPanel>
  </PanelBody>
</InspectorControls>

{/* TAB_ADVANCED equivalent */}
<InspectorControls group="advanced">
  <AdvancedTab attributes={attributes} setAttributes={setAttributes} />
</InspectorControls>
```

---

## Control Type Mapping

### Basic Controls

| Elementor Type | Constant | Gutenberg Control | Import | Notes |
|---------------|----------|-------------------|--------|-------|
| **Text** | `TEXT` | `TextControl` | `@wordpress/components` | Native |
| **Textarea** | `TEXTAREA` | `TextareaControl` | `@wordpress/components` | Native |
| **Number** | `NUMBER` | `NumberControl` | `@wordpress/components` | Add min/max |
| **URL** | `URL` | `TextControl` | `@wordpress/components` | + URLInput if needed |
| **Hidden** | `HIDDEN` | Block attribute only | N/A | No UI control |

### Selection Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Select** | `SELECT` | `SelectControl` | ✅ Native | Basic dropdown |
| **Select2** | `SELECT2` | `Select2Control` | ✅ Shared | Searchable, grouped |
| **Select2 (multi)** | `SELECT2` + `multiple` | `TagMultiSelect` | ✅ Shared | Multi-select |
| **Choose** | `CHOOSE` | `ChooseControl` | ✅ Shared | Icon buttons |
| **Image Choose** | `IMAGE_CHOOSE` | Custom | Create if needed | Image buttons |

### Toggle & Switch Controls

| Elementor Type | Constant | Gutenberg Control | Notes |
|---------------|----------|-------------------|-------|
| **Switcher** | `SWITCHER` | `ToggleControl` | Native. `return_value` → boolean |
| **Button** | `BUTTON` | `Button` | For actions, not state |

### Color & Visual Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Color** | `COLOR` | `ColorControl` | ✅ Shared | With picker |
| **Color (responsive)** | Via `add_responsive_control` | `ResponsiveColorControl` | ✅ Shared | Device-specific |

### Slider & Range Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Slider** | `SLIDER` | `SliderControl` or `RangeControl` | ✅ Shared | Basic slider |
| **Slider (responsive)** | Via `add_responsive_control` | `ResponsiveRangeControlWithDropdown` | ✅ Shared | With units |
| **Dimensions** | `DIMENSIONS` | `DimensionsControl` or `FourRangeControl` | ✅ Shared | Top/Right/Bottom/Left |

### Icon Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Icons** | `ICONS` | `IconPickerControl` | ✅ Shared | Icon library picker |

### Typography & Design Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Heading** | `HEADING` | `SectionHeading` | ✅ Shared | Section dividers |
| **Divider** | `DIVIDER` | CSS + `<hr />` | N/A | Visual separator |
| **Raw HTML** | `RAW_HTML` | `<div dangerouslySetInnerHTML>` | N/A | Rare usage |

### Special Voxel Controls

| Elementor Type | Constant | Gutenberg Control | Shared Control | Notes |
|---------------|----------|-------------------|----------------|-------|
| **Relation** | `'voxel-relation'` | `RelationControl` | ✅ Shared | Widget linking |
| **Dynamic Tags** | Dynamic with VoxelScript | `DynamicTagTextControl` | ✅ Shared | `@post()`, `@user()` |

---

## Group Control Mapping

Elementor's group controls bundle multiple related settings. Here's the mapping:

### Group_Control_Typography

**Elementor:**
```php
$this->add_group_control(
  \Elementor\Group_Control_Typography::get_type(),
  [
    'name' => 'label_typo',
    'selector' => '{{WRAPPER}} .label',
  ]
);
```

**Gutenberg:** `TypographyControl` ✅

```tsx
<TypographyControl
  value={attributes.labelTypography}
  onChange={(value) => setAttributes({ labelTypography: value })}
/>
```

**Value Structure:**
```ts
interface TypographyValue {
  fontFamily?: string;
  fontSize?: number;
  fontSizeUnit?: string;
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: string;
  fontStyle?: string;
}
```

---

### Group_Control_Border 🔴 MISSING

**Elementor:**
```php
$this->add_group_control(
  \Elementor\Group_Control_Border::get_type(),
  [
    'name' => 'input_border',
    'selector' => '{{WRAPPER}} .input',
  ]
);
```

**Gutenberg:** `BorderGroupControl` (TO CREATE)

**Proposed Interface:**
```ts
interface BorderValue {
  width?: number;
  style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  color?: string;
  radius?: number;
  // Or per-side:
  top?: BorderSide;
  right?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
}

interface BorderSide {
  width?: number;
  style?: string;
  color?: string;
}
```

---

### Group_Control_Box_Shadow

**Elementor:**
```php
$this->add_group_control(
  \Elementor\Group_Control_Box_Shadow::get_type(),
  [
    'name' => 'input_shadow',
    'selector' => '{{WRAPPER}} .input',
  ]
);
```

**Gutenberg:** `BoxShadowControl` ✅

```tsx
<BoxShadowControl
  value={attributes.inputShadow}
  onChange={(value) => setAttributes({ inputShadow: value })}
/>
```

**Value Structure:**
```ts
interface BoxShadowValue {
  color?: string;
  horizontal?: number;
  vertical?: number;
  blur?: number;
  spread?: number;
  position?: 'outset' | 'inset';
}
```

---

### Group_Control_Background (Partial)

**Elementor:** Supports solid, gradient, image, video backgrounds.

**Gutenberg:** Only solid color currently available in shared controls.

**Status:** 🟡 Partial - Use `ColorControl` for solid, custom for gradients

---

## Responsive Controls

### Elementor Pattern

```php
$this->add_responsive_control('height', [
  'type' => \Elementor\Controls_Manager::SLIDER,
  'size_units' => ['px', 'em', '%'],
  'range' => [...],
  'selectors' => [...],
]);
```

**Creates attributes:** `height`, `height_tablet`, `height_mobile`

### Gutenberg Equivalent

**Shared Control:** `ResponsiveRangeControlWithDropdown` ✅

```tsx
<ResponsiveRangeControlWithDropdown
  label="Height"
  attributes={attributes}
  setAttributes={setAttributes}
  attributeBaseName="height"
  min={0}
  max={500}
  availableUnits={['px', 'em', '%']}
/>
```

**Attribute Schema (block.json):**
```json
{
  "height": { "type": "object", "default": { "size": 50, "unit": "px" } },
  "height_tablet": { "type": "object" },
  "height_mobile": { "type": "object" }
}
```

---

## CSS Selector Handling

### Elementor Pattern

```php
'selectors' => [
  '{{WRAPPER}} .ts-filter' => 'background: {{VALUE}}',
  '{{WRAPPER}} .inline-input' => 'background: {{VALUE}}',
]
```

### Gutenberg Approach

**Option 1: Inline Styles (Preferred for dynamic values)**

```tsx
const blockStyles: React.CSSProperties = {
  '--filter-bg': attributes.filterBackground,
};

return <div style={blockStyles}>...</div>;
```

**Option 2: CSS Custom Properties in render.php**

```php
$inline_css = sprintf(
  '.wp-block-voxel-search-form-%s { --filter-bg: %s; }',
  $block_id,
  esc_attr($attributes['filterBackground'])
);
```

**Best Practice:** Use CSS custom properties (variables) that map to Voxel's existing CSS.

---

## State Controls (Normal/Hover/Filled)

### Elementor Pattern

```php
$this->start_controls_tabs('button_tabs');

  $this->start_controls_tab('button_normal', ['label' => 'Normal']);
    // Normal state controls
  $this->end_controls_tab();

  $this->start_controls_tab('button_hover', ['label' => 'Hover']);
    // Hover state controls  
  $this->end_controls_tab();

$this->end_controls_tabs();
```

### Gutenberg Equivalent

**Shared Control:** `StyleTabPanel` ✅

```tsx
<StyleTabPanel
  tabs={[
    { name: 'normal', title: 'Normal' },
    { name: 'hover', title: 'Hover' },
    { name: 'filled', title: 'Filled' }
  ]}
>
  {(tab) => (
    <>
      <ColorControl
        label="Background"
        value={attributes[`buttonBg_${tab.name}`]}
        onChange={(v) => setAttributes({ [`buttonBg_${tab.name}`]: v })}
      />
      <ColorControl
        label="Text Color"
        value={attributes[`buttonColor_${tab.name}`]}
        onChange={(v) => setAttributes({ [`buttonColor_${tab.name}`]: v })}
      />
    </>
  )}
</StyleTabPanel>
```

**Attribute Schema:**
```json
{
  "buttonBg_normal": { "type": "string" },
  "buttonBg_hover": { "type": "string" },
  "buttonBg_filled": { "type": "string" },
  "buttonColor_normal": { "type": "string" },
  "buttonColor_hover": { "type": "string" },
  "buttonColor_filled": { "type": "string" }
}
```

---

## Option Groups (Reusable Control Sets)

### Elementor Pattern

```php
// In widget
$this->apply_controls(Option_Groups\Popup_General::class);

// In option group class
class Popup_General {
  public static function controls($widget) {
    $widget->start_controls_section(...);
    $widget->add_control(...);
    $widget->end_controls_section();
  }
}
```

### Gutenberg Equivalent

Create **reusable inspector control components** in `shared/controls/`:

```tsx
// PopupGeneralControls.tsx
export function PopupGeneralControls({ attributes, setAttributes }) {
  return (
    <PanelBody title="Popup: General">
      <ColorControl
        label="Background"
        value={attributes.popupBackground}
        onChange={(v) => setAttributes({ popupBackground: v })}
      />
      {/* More controls... */}
    </PanelBody>
  );
}
```

**Usage in block:**
```tsx
import { PopupGeneralControls } from '@shared/controls';

<InspectorControls>
  <PopupGeneralControls attributes={attributes} setAttributes={setAttributes} />
</InspectorControls>
```

---

## Complete Shared Controls Inventory

| Control | File | Status | Elementor Equivalent |
|---------|------|--------|---------------------|
| `AdvancedTab` | AdvancedTab.tsx | ✅ DONE | TAB_ADVANCED |
| `AlignmentControl` | AlignmentControl.tsx | ✅ | CHOOSE (alignment) |
| `BoxControl` | BoxControl.tsx | ✅ | DIMENSIONS |
| `BoxShadowControl` | BoxShadowControl.tsx | ✅ | Group_Control_Box_Shadow |
| `ButtonGroupControl` | ButtonGroupControl.tsx | ✅ | CHOOSE |
| `ChooseControl` | ChooseControl.tsx | ✅ | CHOOSE |
| `ColorControl` | ColorControl.tsx | ✅ | COLOR |
| `ColumnGapControl` | ColumnGapControl.tsx | ✅ | SLIDER (gap) |
| `DimensionsControl` | DimensionsControl.tsx | ✅ | DIMENSIONS |
| `DynamicTagTextControl` | DynamicTagTextControl.tsx | ✅ | Dynamic VoxelScript |
| `FourRangeControl` | FourRangeControl.tsx | ✅ | DIMENSIONS |
| `IconPickerControl` | IconPickerControl.tsx | ✅ | ICONS |
| `RelationControl` | RelationControl.tsx | ✅ | 'voxel-relation' |
| `ResponsiveColorControl` | ResponsiveColorControl.tsx | 🟡 VERIFY | COLOR + responsive |
| `ResponsiveControl` | ResponsiveControl.tsx | 🟡 VERIFY | Device switcher wrapper |
| `ResponsiveRangeControl` | ResponsiveRangeControl.tsx | 🟡 VERIFY | SLIDER + responsive |
| `ResponsiveRangeControlWithDropdown` | ResponsiveRangeControlWithDropdown.tsx | 🟡 VERIFY | SLIDER + units + responsive |
| `SectionHeading` | SectionHeading.tsx | ✅ | HEADING |
| `Select2Control` | Select2Control.tsx | ✅ | SELECT2 |
| `SliderControl` | SliderControl.tsx | ✅ | SLIDER |
| `StyleTabPanel` | StyleTabPanel.tsx | ✅ DONE | start_controls_tabs |
| `TagMultiSelect` | TagMultiSelect.tsx | ✅ | SELECT2 (multiple) |
| `TemplateSelectControl` | TemplateSelectControl.tsx | ✅ | SELECT2 (templates) |
| `TypographyControl` | TypographyControl.tsx | ✅ | Group_Control_Typography |
| `VoxelTab` | VoxelTab.tsx | ✅ DONE | 'tab_general' (Voxel) |
| `BorderGroupControl` | BorderGroupControl.tsx | ✅ DONE | Group_Control_Border |

---

## Attribute Naming Conventions

### Standard Attributes
- Use **camelCase**: `buttonBackground`, `filterHeight`
- Match Elementor control IDs where possible

### Responsive Attributes
- Desktop: `attributeName`
- Tablet: `attributeName_tablet`
- Mobile: `attributeName_mobile`

### State Attributes
- Normal: `attributeName` or `attributeName_normal`
- Hover: `attributeName_hover`
- Active/Filled: `attributeName_active` or `attributeName_filled`

### Object Attributes (Slider with unit)
```json
{
  "height": {
    "type": "object",
    "default": { "size": 50, "unit": "px" }
  }
}
```

---

## Icon Library Strategy

> [!IMPORTANT]
> To achieve **1:1 UI/UX parity** with Elementor controls, use a consistent icon library system.

### Available Icon Libraries

| Library | Location | Icons | Usage |
|---------|----------|-------|-------|
| **Elementor eicons** | `plugins/elementor/assets/lib/eicons/` | 400+ | Inspector controls, alignment icons |
| **Dashicons** | WordPress core | 300+ | Native WP admin icons |
| **Line Awesome** | Already in shared lib | 1,500+ | General purpose icons |

### ✅ Recommended Approach: Copy Elementor eicons

For **identical UI/UX** to Elementor, copy the eicons library:

**Step 1: Copy the eicons folder**
```bash
# From Elementor plugin to child theme
cp -r plugins/elementor/assets/lib/eicons themes/voxel-fse/assets/lib/eicons
```

**Step 2: Create enqueue function**
```php
// In Block_Loader.php or functions.php
add_action('admin_enqueue_scripts', function() {
    wp_enqueue_style(
        'voxel-fse-eicons',
        get_stylesheet_directory_uri() . '/assets/lib/eicons/css/eicons.css',
        [],
        '5.25.0'
    );
});
```

**Step 3: Use in React components**
```tsx
// Icon usage in controls
<i className="eicon-h-align-center" />
<i className="eicon-text-align-left" />
<i className="eicon-slider-device" />
```

### Key eicons for Inspector Controls

| Icon Class | Usage |
|-----------|-------|
| `eicon-h-align-left/center/right` | Horizontal alignment |
| `eicon-v-align-top/middle/bottom` | Vertical alignment |
| `eicon-text-align-left/center/right/justify` | Text alignment |
| `eicon-device-desktop/tablet/mobile` | Responsive switcher |
| `eicon-edit` | Edit action |
| `eicon-close` | Close/remove |
| `eicon-plus` | Add item |
| `eicon-trash` | Delete |
| `eicon-clone` | Duplicate |
| `eicon-slider-3d` | Slider control |
| `eicon-call-to-action` | CTA/Button |

### ChooseControl Icon Implementation

```tsx
// ChooseControl with eicons
<ChooseControl
  label="Alignment"
  value={attributes.alignment}
  onChange={(v) => setAttributes({ alignment: v })}
  options={[
    { value: 'left', icon: 'eicon-h-align-left', label: 'Left' },
    { value: 'center', icon: 'eicon-h-align-center', label: 'Center' },
    { value: 'right', icon: 'eicon-h-align-right', label: 'Right' },
  ]}
/>
```

### Alternative: Dashicons (Native WordPress)

For lighter integration, use built-in Dashicons:

```tsx
import { Dashicon } from '@wordpress/components';

<Dashicon icon="align-left" />
<Dashicon icon="align-center" />
<Dashicon icon="align-right" />
```

**Dashicons limitations:**
- Fewer icons than eicons
- Different visual style than Elementor
- May not match Voxel's existing UI

---

## Quick Reference: Conversion Checklist

When converting an Elementor widget:

- [ ] List all `start_controls_section()` calls → Create `PanelBody` sections
- [ ] List all `add_control()` calls → Map to Gutenberg controls
- [ ] List all `add_responsive_control()` calls → Use Responsive* controls
- [ ] List all `add_group_control()` calls → Map to group controls
- [ ] List all `start_controls_tabs()` calls → Use `StyleTabPanel`
- [ ] List all `apply_controls()` calls → Create reusable control components
- [ ] Document all selectors → Plan CSS handling approach
- [ ] **Ensure eicons CSS is enqueued** for icon-based controls
