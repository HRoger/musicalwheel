# Popup Kit Block - Remaining InspectorControls Implementation

**Status:** In Progress  
**Completed:** Popup: General, Popup: Head  
**Remaining:** Popup: Buttons, Popup: Label, Popup: Menu, Popup: Cart

---

## Task Overview

Complete the conversion of Elementor controls to Gutenberg InspectorControls for the remaining four sections of the Popup Kit block. Each section should match the Voxel Elementor widget's styling options exactly.

---

## Implementation Requirements

### 1. Popup: Buttons Section

**Location:** `app/blocks/src/popup/edit.tsx` - Line 415-420

**Reference:** `themes/voxel/app/widgets/option-groups/popup-controller.php`

**Structure:**
- Use `PanelBody` with tabs (Normal/Hover) - WordPress doesn't have native tabs, use `ButtonGroup` or custom tab implementation
- **Normal Tab:**
  - **General subsection:**
    - Button typography (font family, size, weight, line height, text transform)
    - Border radius (responsive with dropdown, units: px, %)
  - **Primary button subsection:**
    - Background color
    - Text color
    - Icon color (responsive)
    - Border (type, width, color, style)
  - **Secondary button subsection:**
    - Background color
    - Text color
    - Icon color (responsive)
    - Border (type, width, color, style)
- **Hover Tab:**
  - **Primary button subsection:**
    - Background color
    - Button color (text)
    - Border color
  - **Secondary button subsection:**
    - Background color
    - Button color (text)
    - Border color

**Attributes to add to `block.json`:**
```json
{
  "pbTypo": { "type": "object" },
  "pbRadius": { "type": "object" },
  "pbButton1Bg": { "type": "string" },
  "pbButton1Text": { "type": "string" },
  "pbButton1Icon": { "type": "object" },
  "pbButton1Border": { "type": "object" },
  "pbButton2Bg": { "type": "string" },
  "pbButton2Text": { "type": "string" },
  "pbButton2Icon": { "type": "object" },
  "pbButton2Border": { "type": "object" },
  "pbButton1HoverBg": { "type": "string" },
  "pbButton1HoverText": { "type": "string" },
  "pbButton1HoverBorder": { "type": "string" },
  "pbButton2HoverBg": { "type": "string" },
  "pbButton2HoverText": { "type": "string" },
  "pbButton2HoverBorder": { "type": "string" }
}
```

**CSS Selectors (for `render.php`):**
- `.ts-field-popup .ts-btn` - General button styles
- `.ts-field-popup .ts-btn-1` - Primary button
- `.ts-field-popup .ts-btn-2` - Secondary button
- `.ts-field-popup .ts-btn-1:hover` - Primary button hover
- `.ts-field-popup .ts-btn-2:hover` - Secondary button hover

---

### 2. Popup: Label and Description Section

**Location:** `app/blocks/src/popup/edit.tsx` - Line 422-427

**Reference:** `themes/voxel/app/widgets/option-groups/popup-label.php`

**Structure:**
- **Label subsection:**
  - Typography (font family, size, weight, line height, text transform)
  - Color (responsive)
- **Field description subsection:**
  - Typography (font family, size, weight, line height, text transform)
  - Color (responsive)

**Attributes to add to `block.json`:**
```json
{
  "plLabelTypo": { "type": "object" },
  "plLabelColor": { "type": "object" },
  "plDescTypo": { "type": "object" },
  "plDescColor": { "type": "object" }
}
```

**CSS Selectors (for `render.php`):**
- `.ts-field-popup .ts-form-group label` - Label styles
- `.ts-field-popup .ts-form-group small` - Description styles

---

### 3. Popup: Menu Styling Section

**Location:** `app/blocks/src/popup/edit.tsx` - Line 429-434

**Reference:** `themes/voxel/app/widgets/option-groups/popup-menu.php`

**Structure:**
- Use tabs (Normal/Hover/Selected/Parent)
- **Normal Tab:**
  - **Item subsection:**
    - Item padding (dimensions: top, right, bottom, left, units: px, %, em)
    - Height (responsive, units: px)
    - Separator color
  - **Title subsection:**
    - Title color
    - Title typography
  - **Icon subsection:**
    - Icon color
    - Icon size (responsive, units: px, %)
    - Spacing (responsive, units: px)
  - **Chevron subsection:**
    - Chevron color
- **Hover Tab:**
  - List item background
  - Title color
  - Icon color
- **Selected Tab:**
  - Title typography
  - Title color
  - Icon color
- **Parent Tab:**
  - Title typography

**Attributes to add to `block.json`:**
```json
{
  "pmItemPadding": { "type": "object" },
  "pmItemHeight": { "type": "object" },
  "pmSeparatorColor": { "type": "string" },
  "pmTitleColor": { "type": "string" },
  "pmTitleTypo": { "type": "object" },
  "pmIconColor": { "type": "string" },
  "pmIconSize": { "type": "object" },
  "pmIconSpacing": { "type": "object" },
  "pmChevronColor": { "type": "string" },
  "pmHoverBg": { "type": "string" },
  "pmHoverTitleColor": { "type": "string" },
  "pmHoverIconColor": { "type": "string" },
  "pmSelectedTitleTypo": { "type": "object" },
  "pmSelectedTitleColor": { "type": "string" },
  "pmSelectedIconColor": { "type": "string" },
  "pmParentTitleTypo": { "type": "object" }
}
```

**CSS Selectors (for `render.php`):**
- `.ts-field-popup .ts-term-dropdown li > a` - Menu item
- `.ts-field-popup .ts-term-dropdown li` - Separator (border-color)
- `.ts-field-popup .ts-term-dropdown li > a span` - Title
- `.ts-field-popup .ts-term-icon` - Icon
- `.ts-field-popup .ts-right-icon, .ts-field-popup .ts-left-icon` - Chevron
- `.ts-field-popup .pika-label:after` - Date picker chevron
- `.ts-field-popup .ts-term-dropdown li > a:hover` - Hover state
- `.ts-field-popup .ts-term-dropdown li.ts-selected > a` - Selected state
- `.ts-field-popup .ts-term-dropdown li.ts-parent-item` - Parent item

---

### 4. Popup: Cart Section

**Location:** `app/blocks/src/popup/edit.tsx` - Line 436-441

**Reference:** `themes/voxel/app/widgets/popup-kit.php` (lines 85-1633)

**Structure:**
- Item spacing (responsive, units: px)
- Item content spacing (responsive, units: px)
- Picture size (responsive, units: px)
- Additional cart styling controls (check full widget file for complete list)

**Attributes to add to `block.json`:**
```json
{
  "pcItemSpacing": { "type": "object" },
  "pcItemContentSpacing": { "type": "object" },
  "pcPictureSize": { "type": "object" }
}
```

**CSS Selectors (for `render.php`):**
- `.ts-field-popup .ts-cart-list` - Cart list (gap)
- `.ts-field-popup .ts-cart-list li` - Cart item (gap)
- `.ts-field-popup .ts-cart-list img` - Cart image (size)

---

## Implementation Guidelines

### 1. Typography Controls

For typography controls, use a combination of:
- `TextControl` for font family
- `RangeControl` for font size
- `SelectControl` for font weight (100-900)
- `RangeControl` for line height
- `SelectControl` for text transform (none, uppercase, lowercase, capitalize)

**Pattern:**
```tsx
<h4>{__('Typography', 'voxel-fse')}</h4>
<TextControl
  label={__('Font family', 'voxel-fse')}
  value={attributes.pbTypo?.fontFamily || ''}
  onChange={(value: string) => setAttributes({
    pbTypo: { ...attributes.pbTypo, fontFamily: value }
  })}
/>
<RangeControl
  label={__('Font size', 'voxel-fse')}
  value={attributes.pbTypo?.fontSize || 16}
  onChange={(value: number) => setAttributes({
    pbTypo: { ...attributes.pbTypo, fontSize: value }
  })}
  min={10}
  max={72}
  step={1}
/>
```

### 2. Border Controls

For border controls, use:
- `SelectControl` for border type (none, solid, dashed, dotted, double)
- `RangeControl` for border width
- `PanelColorSettings` for border color
- `SelectControl` for border style (if needed)

**Pattern:**
```tsx
<SelectControl
  label={__('Border type', 'voxel-fse')}
  value={attributes.pbButton1Border?.type || 'none'}
  options={[
    { label: __('None', 'voxel-fse'), value: 'none' },
    { label: __('Solid', 'voxel-fse'), value: 'solid' },
    { label: __('Dashed', 'voxel-fse'), value: 'dashed' },
    { label: __('Dotted', 'voxel-fse'), value: 'dotted' },
  ]}
  onChange={(value: string) => setAttributes({
    pbButton1Border: { ...attributes.pbButton1Border, type: value }
  })}
/>
<RangeControl
  label={__('Border width', 'voxel-fse')}
  value={attributes.pbButton1Border?.width || 0}
  onChange={(value: number) => setAttributes({
    pbButton1Border: { ...attributes.pbButton1Border, width: value }
  })}
  min={0}
  max={10}
  step={1}
/>
```

### 3. Tabs Implementation

WordPress Gutenberg doesn't have native tabs. Use one of these approaches:

**Option A: ButtonGroup (Simple)**
```tsx
const [activeTab, setActiveTab] = useState('normal');

<ButtonGroup>
  <Button
    isPressed={activeTab === 'normal'}
    onClick={() => setActiveTab('normal')}
  >
    {__('Normal', 'voxel-fse')}
  </Button>
  <Button
    isPressed={activeTab === 'hover'}
    onClick={() => setActiveTab('hover')}
  >
    {__('Hover', 'voxel-fse')}
  </Button>
</ButtonGroup>

{activeTab === 'normal' && (
  // Normal tab controls
)}

{activeTab === 'hover' && (
  // Hover tab controls
)}
```

**Option B: Custom Tab Component** (More complex, better UX)

### 4. Dimensions Control

For padding/margin dimensions (top, right, bottom, left), use multiple `RangeControl` components or create a custom `DimensionsControl` component.

**Pattern:**
```tsx
<h4>{__('Item padding', 'voxel-fse')}</h4>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
  <RangeControl
    label={__('Top', 'voxel-fse')}
    value={attributes.pmItemPadding?.top || 0}
    onChange={(value: number) => setAttributes({
      pmItemPadding: { ...attributes.pmItemPadding, top: value }
    })}
    min={0}
    max={100}
  />
  <RangeControl
    label={__('Right', 'voxel-fse')}
    value={attributes.pmItemPadding?.right || 0}
    onChange={(value: number) => setAttributes({
      pmItemPadding: { ...attributes.pmItemPadding, right: value }
    })}
    min={0}
    max={100}
  />
  {/* Bottom, Left */}
</div>
```

### 5. CSS Generation in `render.php`

Add CSS generation for all new attributes in `render.php`. Follow the existing pattern:

```php
// Example: Button styles
if (!empty($attributes['pbButton1Bg'])) {
    $css .= '.ts-field-popup .ts-btn-1 { background: ' . esc_attr($attributes['pbButton1Bg']) . '; }';
}

if (!empty($attributes['pbButton1Text'])) {
    $css .= '.ts-field-popup .ts-btn-1 { color: ' . esc_attr($attributes['pbButton1Text']) . '; }';
}

// Responsive icon color
if (!empty($attributes['pbButton1Icon']['desktop'])) {
    $css .= '.ts-field-popup .ts-btn-1 { --ts-icon-color: ' . esc_attr($attributes['pbButton1Icon']['desktop']) . '; }';
}
if (!empty($attributes['pbButton1Icon']['tablet'])) {
    $css .= '@media (max-width: 1024px) { .ts-field-popup .ts-btn-1 { --ts-icon-color: ' . esc_attr($attributes['pbButton1Icon']['tablet']) . '; } }';
}
```

---

## Testing Checklist

After implementing each section:

- [ ] Controls appear in InspectorControls sidebar
- [ ] Values save to block attributes
- [ ] CSS generates correctly in `render.php`
- [ ] Styles apply to correct selectors
- [ ] Responsive controls work (desktop/tablet/mobile)
- [ ] Typography controls apply correctly
- [ ] Color controls apply correctly
- [ ] Border controls apply correctly
- [ ] Hover states work (if applicable)
- [ ] Preview updates when values change

---

## Reference Files

- **Elementor Controls:** `themes/voxel/app/widgets/option-groups/popup-controller.php`
- **Elementor Controls:** `themes/voxel/app/widgets/option-groups/popup-label.php`
- **Elementor Controls:** `themes/voxel/app/widgets/option-groups/popup-menu.php`
- **Elementor Controls:** `themes/voxel/app/widgets/popup-kit.php` (Cart section)
- **Block Editor:** `app/blocks/src/popup/edit.tsx`
- **Block Config:** `app/blocks/src/popup/block.json`
- **Render:** `app/blocks/src/popup/render.php`
- **Existing Pattern:** `app/blocks/src/popup/edit.tsx` (General and Head sections)

---

## Notes

1. **1:1 Voxel Matching:** Match Elementor controls exactly. Use same labels, same ranges, same default values.

2. **Responsive Controls:** Use `ResponsiveRangeControlWithDropdown` component for responsive controls (already created).

3. **CSS Variables:** Some Voxel styles use CSS variables (e.g., `--ts-icon-color`). Preserve these in `render.php`.

4. **Units:** Support units (px, %, em) where Elementor does. Use `SelectControl` for unit selection.

5. **Tabs:** Implement tabs using `ButtonGroup` or custom component. WordPress doesn't have native tabs.

6. **Typography Groups:** Elementor uses `Group_Control_Typography` which includes multiple properties. Break this into individual controls in Gutenberg.

---

## Priority Order

1. **Popup: Buttons** (Most commonly used)
2. **Popup: Label and description** (Simple, quick win)
3. **Popup: Menu styling** (Complex with multiple tabs)
4. **Popup: Cart** (Check full widget file for all controls)

---

**Start with Popup: Buttons section and work through each section systematically.**

