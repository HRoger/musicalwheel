# Discovery: InspectorControls Structure Matching Voxel Sidebar

**Discovery Date:** 2025-11-15
**Purpose:** Understand how to create Gutenberg InspectorControls that replicate Voxel/Elementor widget sidebar controls

---

## Key Finding: Structure Comparison

### Elementor Widget (Voxel product-price)
**Location:** Left sidebar in Elementor editor

```php
// File: themes/voxel/app/widgets/product-price.php:23-106

protected function register_controls() {
  $this->start_controls_section('ts_chart_settings', [
    'label' => __('Chart', 'voxel-elementor'),
    'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
  ]);

  // 1. Typography (Group Control)
  $this->add_group_control(
    \Elementor\Group_Control_Typography::get_type(),
    [
      'name' => 'price_typo',
      'label' => __('Typography'),
      'selector' => '{{WRAPPER}} .vx-price',
    ]
  );

  // 2. Color (Responsive)
  $this->add_responsive_control('ts_price_col', [
    'label' => __('Color', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
      '{{WRAPPER}} .vx-price' => 'color: {{VALUE}}',
    ],
  ]);

  // 3. Linethrough text color (Responsive)
  $this->add_responsive_control('ts_strike_col_text', [
    'label' => __('Linethrough text color', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
      '{{WRAPPER}} .vx-price s' => 'color: {{VALUE}}',
    ],
  ]);

  // 4. Linethrough line color (Responsive)
  $this->add_responsive_control('ts_strike_col', [
    'label' => __('Linethrough line color', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
      '{{WRAPPER}} .vx-price s' => 'text-decoration-color: {{VALUE}}',
    ],
  ]);

  // 5. Linethrough line width (Responsive Slider)
  $this->add_responsive_control('ts_strike_width', [
    'label' => __('Linethrough line width', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::SLIDER,
    'size_units' => ['px'],
    'range' => [
      'px' => [
        'min' => 1,
        'max' => 200,
        'step' => 1,
      ],
    ],
    'selectors' => [
      '{{WRAPPER}} .vx-price s' => 'text-decoration-thickness: {{SIZE}}{{UNIT}};',
    ],
  ]);

  // 6. Out of stock color (Responsive)
  $this->add_responsive_control('ts_price_nostock', [
    'label' => __('Out of stock color', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
      '{{WRAPPER}} .vx-price.no-stock' => 'color: {{VALUE}}',
    ],
  ]);

  $this->end_controls_section();
}
```

### Gutenberg Block (InspectorControls)
**Location:** Right sidebar in Block Editor

```typescript
import {
  useBlockProps,
  InspectorControls,
  PanelColorSettings
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        {/* Color Settings Panel */}
        <PanelColorSettings
          title={__('Color Settings', 'musicalwheel')}
          __experimentalIsRenderedInSidebar
          colorSettings={[
            {
              value: attributes.textColor,
              onChange: (newColor) => setAttributes({ textColor: newColor }),
              label: __('Price Color', 'musicalwheel'),
            },
            {
              value: attributes.linethroughTextColor,
              onChange: (newColor) => setAttributes({ linethroughTextColor: newColor }),
              label: __('Linethrough Text Color', 'musicalwheel'),
            },
            {
              value: attributes.linethroughLineColor,
              onChange: (newColor) => setAttributes({ linethroughLineColor: newColor }),
              label: __('Linethrough Line Color', 'musicalwheel'),
            },
            {
              value: attributes.outOfStockColor,
              onChange: (newColor) => setAttributes({ outOfStockColor: newColor }),
              label: __('Out of Stock Color', 'musicalwheel'),
            },
          ]}
        />

        {/* Linethrough Settings Panel */}
        <PanelBody title={__('Linethrough Settings', 'musicalwheel')}>
          <ResponsiveRangeControl
            label={__('Line Width', 'musicalwheel')}
            attributes={attributes}
            setAttributes={setAttributes}
            attributeBaseName="linethroughWidth"
            min={1}
            max={200}
            step={1}
          />
        </PanelBody>
      </InspectorControls>

      {/* Block preview */}
      <div {...useBlockProps()}>
        {/* Preview content */}
      </div>
    </>
  );
}
```

---

## WordPress Components Available

### From @wordpress/block-editor

| Component | Purpose | Evidence |
|-----------|---------|----------|
| `InspectorControls` | Wrapper for sidebar controls | `themes/musicalwheel-fse/app/blocks/src/components/withDynamicTags.tsx:11` |
| `PanelColorSettings` | Multiple color pickers in one panel | Official WordPress component |
| `FontSizePicker` | Font size control | Official WordPress component |
| `LineHeightControl` | Line height control | Official WordPress component |

### From @wordpress/components

| Component | Purpose | Evidence |
|-----------|---------|----------|
| `PanelBody` | Collapsible panel container | `themes/musicalwheel-fse/app/blocks/src/components/withDynamicTags.tsx:12` |
| `PanelRow` | Row layout within panel | Official WordPress component |
| `RangeControl` | Slider control | Official WordPress component |
| `ColorPicker` | Single color picker | Official WordPress component |
| `ColorPalette` | Preset color swatches | Official WordPress component |
| `SelectControl` | Dropdown select | Official WordPress component |
| `TextControl` | Text input | `themes/musicalwheel-fse/app/blocks/src/dynamic-text/edit.tsx:8` |
| `TextareaControl` | Multiline text input | `themes/musicalwheel-fse/app/blocks/src/dynamic-text/edit.tsx:8` |
| `ToolbarButton` | Toolbar button | `themes/musicalwheel-fse/app/blocks/src/dynamic-heading-example/edit.tsx:10` |
| `ToolbarGroup` | Toolbar button group | `themes/musicalwheel-fse/app/blocks/src/dynamic-heading-example/edit.tsx:10` |
| `BaseControl` | Base control wrapper | `themes/musicalwheel-fse/app/blocks/src/components/DynamicTagPanel.tsx:10` |
| `Modal` | Modal dialog | `themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/index.tsx:11` |
| `Button` | Button component | `themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/index.tsx:11` |
| `Spinner` | Loading spinner | Official WordPress component |

---

## Control Type Mapping

### Elementor → Gutenberg Equivalents

| Elementor Control | Gutenberg Component | Notes |
|-------------------|---------------------|-------|
| `Group_Control_Typography` | `block.json` supports OR custom components | Use `supports.typography` for automatic controls |
| `Controls_Manager::COLOR` | `PanelColorSettings` or `ColorPicker` | PanelColorSettings recommended for multiple colors |
| `Controls_Manager::SLIDER` | `RangeControl` | Direct equivalent |
| `Controls_Manager::SELECT` | `SelectControl` | Direct equivalent |
| `Controls_Manager::TEXT` | `TextControl` | Direct equivalent |
| `Controls_Manager::TEXTAREA` | `TextareaControl` | Direct equivalent |
| `add_responsive_control()` | **Custom implementation required** | No built-in equivalent |

---

## Typography Controls

### Option 1: Block Supports (Recommended)

**File:** `block.json`

```json
{
  "supports": {
    "typography": {
      "fontSize": true,
      "lineHeight": true,
      "fontWeight": true,
      "fontStyle": true,
      "textTransform": true,
      "textDecoration": true
    }
  }
}
```

**Advantages:**
- ✅ Automatic UI controls appear in sidebar
- ✅ Proper CSS class generation
- ✅ Theme integration
- ✅ No custom code needed

**Evidence:** WordPress Block Editor Handbook - Block Supports
- https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/

### Option 2: Custom Typography Controls

```typescript
import { FontSizePicker, LineHeightControl } from '@wordpress/block-editor';
import { SelectControl } from '@wordpress/components';

<PanelBody title={__('Typography', 'musicalwheel')}>
  <FontSizePicker
    value={attributes.fontSize}
    onChange={(newSize) => setAttributes({ fontSize: newSize })}
    __next40pxDefaultSize
  />

  <LineHeightControl
    value={attributes.lineHeight}
    onChange={(newLineHeight) => setAttributes({ lineHeight: newLineHeight })}
    __next40pxDefaultSize
  />

  <SelectControl
    label={__('Font Weight', 'musicalwheel')}
    value={attributes.fontWeight}
    options={[
      { value: '400', label: __('Normal (400)', 'musicalwheel') },
      { value: '600', label: __('Semi Bold (600)', 'musicalwheel') },
      { value: '700', label: __('Bold (700)', 'musicalwheel') },
    ]}
    onChange={(newWeight) => setAttributes({ fontWeight: newWeight })}
  />
</PanelBody>
```

---

## Color Controls

### Best Practice: PanelColorSettings

**For multiple related colors** (like product-price block):

```typescript
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

<InspectorControls>
  <PanelColorSettings
    title={__('Color Settings', 'musicalwheel')}
    __experimentalIsRenderedInSidebar
    colorSettings={[
      {
        value: attributes.textColor,
        onChange: (newColor) => setAttributes({ textColor: newColor }),
        label: __('Text Color', 'musicalwheel'),
      },
      {
        value: attributes.linethroughTextColor,
        onChange: (newColor) => setAttributes({ linethroughTextColor: newColor }),
        label: __('Linethrough Text Color', 'musicalwheel'),
      },
      // ... more colors
    ]}
  />
</InspectorControls>
```

**Attributes:**
```json
{
  "attributes": {
    "textColor": {
      "type": "string"
    },
    "linethroughTextColor": {
      "type": "string"
    },
    "linethroughLineColor": {
      "type": "string"
    },
    "outOfStockColor": {
      "type": "string"
    }
  }
}
```

**Evidence:** Official WordPress component
- https://developer.wordpress.org/block-editor/reference-guides/components/color-palette/
- https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/panel-color-settings/README.md

---

## Range/Slider Controls

### Basic RangeControl

```typescript
import { RangeControl } from '@wordpress/components';

<PanelBody title={__('Settings', 'musicalwheel')}>
  <RangeControl
    label={__('Linethrough Line Width', 'musicalwheel')}
    value={attributes.linethroughWidth}
    onChange={(newWidth) => setAttributes({ linethroughWidth: newWidth })}
    min={1}
    max={200}
    step={1}
    __nextHasNoMarginBottom
    __next40pxDefaultSize
  />
</PanelBody>
```

**Attribute:**
```json
{
  "attributes": {
    "linethroughWidth": {
      "type": "number",
      "default": 1
    }
  }
}
```

**Evidence:** Official WordPress component
- https://developer.wordpress.org/block-editor/reference-guides/components/range-control/

---

## Existing Pattern in Musicalwheel

### withDynamicTags HOC Pattern

**Evidence:** `themes/musicalwheel-fse/app/blocks/src/components/withDynamicTags.tsx:67-80`

```typescript
return (
  <>
    <InspectorControls>
      <PanelBody
        title={panelTitle}
        initialOpen={hasDynamicTags}
        icon="tag"
      >
        <DynamicTagPanel
          attributes={attributes}
          setAttributes={setAttributes}
          dynamicAttributes={dynamicAttributes}
          context={context}
        />
      </PanelBody>
    </InspectorControls>

    <BlockEdit {...props} />
  </>
);
```

**This pattern works well!** We can extend it for product-price block.

---

## Recommended Structure for Product-Price Block

```typescript
import {
  useBlockProps,
  InspectorControls,
  PanelColorSettings
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ResponsiveRangeControl from '../components/ResponsiveRangeControl';

export default function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        {/* Typography Controls (auto-generated via block.json supports) */}

        {/* Color Settings */}
        <PanelColorSettings
          title={__('Color Settings', 'musicalwheel')}
          __experimentalIsRenderedInSidebar
          colorSettings={[
            {
              value: attributes.textColor,
              onChange: (newColor) => setAttributes({ textColor: newColor }),
              label: __('Price Color', 'musicalwheel'),
            },
            {
              value: attributes.linethroughTextColor,
              onChange: (newColor) => setAttributes({ linethroughTextColor: newColor }),
              label: __('Linethrough Text Color', 'musicalwheel'),
            },
            {
              value: attributes.linethroughLineColor,
              onChange: (newColor) => setAttributes({ linethroughLineColor: newColor }),
              label: __('Linethrough Line Color', 'musicalwheel'),
            },
            {
              value: attributes.outOfStockColor,
              onChange: (newColor) => setAttributes({ outOfStockColor: newColor }),
              label: __('Out of Stock Color', 'musicalwheel'),
            },
          ]}
        />

        {/* Linethrough Settings */}
        <PanelBody title={__('Linethrough Settings', 'musicalwheel')}>
          <ResponsiveRangeControl
            label={__('Line Width', 'musicalwheel')}
            attributes={attributes}
            setAttributes={setAttributes}
            attributeBaseName="linethroughWidth"
            min={1}
            max={200}
            step={1}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {/* Live preview using REST API data */}
      </div>
    </>
  );
}
```

---

## Key Differences: Elementor vs Gutenberg

| Aspect | Elementor | Gutenberg |
|--------|-----------|-----------|
| **Location** | Left sidebar | Right sidebar |
| **API** | PHP (`register_controls()`) | React/TypeScript (JSX) |
| **Sections** | `start_controls_section()` | `<PanelBody>` |
| **Group Controls** | `add_group_control()` | `block.json` supports OR custom |
| **Responsive** | `add_responsive_control()` | Custom implementation required |
| **Selectors** | `{{WRAPPER}} .class` | CSS custom properties or inline styles |
| **Auto-apply CSS** | Yes (automatic) | No (manual in render.php) |

---

## Official WordPress Documentation

1. **InspectorControls**: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inspector-controls/README.md
2. **PanelColorSettings**: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/panel-color-settings/README.md
3. **FontSizePicker**: https://developer.wordpress.org/block-editor/reference-guides/components/font-size-picker/
4. **RangeControl**: https://developer.wordpress.org/block-editor/reference-guides/components/range-control/
5. **Block Supports**: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/

---

## Next Steps

1. ✅ InspectorControls structure documented
2. Create ResponsiveRangeControl component (see responsive controls discovery)
3. Implement product-price InspectorControls
4. Apply styles in render.php based on attributes
5. Test in editor with live preview

---

## Summary

**Gutenberg InspectorControls successfully replicates Elementor sidebar controls:**

- ✅ **Typography**: Use `block.json` supports (automatic controls)
- ✅ **Colors**: Use `PanelColorSettings` for multiple colors
- ✅ **Sliders**: Use `RangeControl` component
- ✅ **Organization**: Use `PanelBody` for sections
- ⚠️ **Responsive**: Requires custom implementation (see next discovery)

All components are available in existing codebase - no new dependencies needed!
