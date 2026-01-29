# Discovery: Responsive Controls in Gutenberg

**Discovery Date:** 2025-11-15
**Purpose:** Understand how to implement responsive controls (desktop/tablet/mobile) in Gutenberg blocks to match Elementor's responsive functionality

---

## Critical Finding: NO Built-In Responsive Controls in Gutenberg

**WordPress Gutenberg does NOT have built-in responsive controls like Elementor.**

Elementor provides:
- `add_responsive_control()` method
- Automatic device switcher UI (desktop/tablet/mobile icons)
- Automatic responsive value storage (`control_name`, `control_name_tablet`, `control_name_mobile`)
- Automatic CSS generation with media queries

**Gutenberg requires manual implementation of ALL responsive functionality.**

---

## Elementor Responsive Control Pattern

### Voxel Widget Example

```php
// File: themes/voxel/app/widgets/product-price.php:39-49

$this->add_responsive_control(
  'ts_price_col',
  [
    'label' => __('Color', 'voxel-elementor'),
    'type' => \Elementor\Controls_Manager::COLOR,
    'selectors' => [
      '{{WRAPPER}} .vx-price' => 'color: {{VALUE}}',
    ],
  ]
);
```

**What Elementor automatically provides:**
1. Device switcher UI (desktop/tablet/mobile icons in toolbar)
2. Stores 3 separate values:
   - `ts_price_col` (desktop)
   - `ts_price_col_tablet` (tablet)
   - `ts_price_col_mobile` (mobile)
3. Generates CSS with media queries automatically
4. Shows current device value in control

---

## Gutenberg Implementation Options

### Option 1: ResponsiveBlockControl (Official Component)

**Component:** `@wordpress/block-editor` - `ResponsiveBlockControl`

**Documentation:** https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/responsive-block-control/README.md

**Limitations:**
- ⚠️ Only works with specific control types
- ⚠️ Not as flexible as Elementor
- ⚠️ Limited documentation
- ⚠️ Not widely used in WordPress core

**Example:**
```typescript
import { ResponsiveBlockControl } from '@wordpress/block-editor';
import { RangeControl } from '@wordpress/components';
import { useState } from '@wordpress/element';

function Edit({ attributes, setAttributes }) {
  const [isResponsive, setIsResponsive] = useState(false);

  const renderControl = (labelComponent: JSX.Element, viewport: string) => {
    const attributeKey = viewport === 'all'
      ? 'lineWidth'
      : `lineWidth_${viewport}`;

    return (
      <RangeControl
        label={labelComponent}
        value={attributes[attributeKey]}
        onChange={(newValue) => setAttributes({ [attributeKey]: newValue })}
        min={1}
        max={200}
      />
    );
  };

  return (
    <ResponsiveBlockControl
      title={__('Line Width', 'musicalwheel')}
      property="line-width"
      renderDefaultControl={renderControl}
      isResponsive={isResponsive}
      onIsResponsiveChange={() => setIsResponsive(!isResponsive)}
    />
  );
}
```

**Verdict:** ❌ Too limited for our needs

---

### Option 2: Custom Responsive Control Component (RECOMMENDED)

**Advantages:**
- ✅ Full control over UI/UX
- ✅ Matches Elementor behavior exactly
- ✅ Reusable across all blocks
- ✅ Supports any control type (color, range, text, etc.)
- ✅ Can be styled to match Elementor appearance

**Implementation:**

#### Step 1: Create ResponsiveRangeControl Component

**File:** `/themes/musicalwheel-fse/app/blocks/src/components/ResponsiveRangeControl.tsx`

```typescript
import { Button, ButtonGroup, RangeControl } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveRangeControlProps {
  label: string;
  attributes: Record<string, any>;
  setAttributes: (attrs: Record<string, any>) => void;
  attributeBaseName: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}

export default function ResponsiveRangeControl({
  label,
  attributes,
  setAttributes,
  attributeBaseName,
  min = 0,
  max = 100,
  step = 1,
  help,
}: ResponsiveRangeControlProps) {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');

  // Get attribute name for current device
  const getAttributeName = () => {
    if (currentDevice === 'desktop') return attributeBaseName;
    return `${attributeBaseName}_${currentDevice}`;
  };

  // Get current value
  const getValue = () => {
    const attrName = getAttributeName();
    return attributes[attrName];
  };

  // Set value for current device
  const setValue = (newValue: number | undefined) => {
    const attrName = getAttributeName();
    setAttributes({ [attrName]: newValue });
  };

  return (
    <div className="mw-responsive-control">
      {/* Device Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{ fontWeight: 500, fontSize: '13px' }}>{label}</span>
        <ButtonGroup>
          <Button
            icon={desktop}
            onClick={() => setCurrentDevice('desktop')}
            isPressed={currentDevice === 'desktop'}
            label={__('Desktop', 'musicalwheel')}
            showTooltip
            size="small"
          />
          <Button
            icon={tablet}
            onClick={() => setCurrentDevice('tablet')}
            isPressed={currentDevice === 'tablet'}
            label={__('Tablet', 'musicalwheel')}
            showTooltip
            size="small"
          />
          <Button
            icon={mobile}
            onClick={() => setCurrentDevice('mobile')}
            isPressed={currentDevice === 'mobile'}
            label={__('Mobile', 'musicalwheel')}
            showTooltip
            size="small"
          />
        </ButtonGroup>
      </div>

      {/* Range Control */}
      <RangeControl
        value={getValue()}
        onChange={setValue}
        min={min}
        max={max}
        step={step}
        help={help}
        allowReset
        __nextHasNoMarginBottom
        __next40pxDefaultSize
      />

      {/* Device Indicator */}
      <div style={{
        fontSize: '11px',
        color: '#757575',
        marginTop: '4px'
      }}>
        {currentDevice === 'desktop' && __('Desktop value', 'musicalwheel')}
        {currentDevice === 'tablet' && (
          getValue() !== undefined
            ? __('Tablet value', 'musicalwheel')
            : __('Tablet value (inherits from desktop)', 'musicalwheel')
        )}
        {currentDevice === 'mobile' && (
          getValue() !== undefined
            ? __('Mobile value', 'musicalwheel')
            : __('Mobile value (inherits from tablet/desktop)', 'musicalwheel')
        )}
      </div>
    </div>
  );
}
```

#### Step 2: Create ResponsiveColorControl Component

**File:** `/themes/musicalwheel-fse/app/blocks/src/components/ResponsiveColorControl.tsx`

```typescript
import { Button, ButtonGroup, ColorPicker, BaseControl } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveColorControlProps {
  label: string;
  attributes: Record<string, any>;
  setAttributes: (attrs: Record<string, any>) => void;
  attributeBaseName: string;
}

export default function ResponsiveColorControl({
  label,
  attributes,
  setAttributes,
  attributeBaseName,
}: ResponsiveColorControlProps) {
  const [currentDevice, setCurrentDevice] = useState<DeviceType>('desktop');

  const getAttributeName = () => {
    if (currentDevice === 'desktop') return attributeBaseName;
    return `${attributeBaseName}_${currentDevice}`;
  };

  const getValue = () => {
    const attrName = getAttributeName();
    return attributes[attrName];
  };

  const setValue = (newValue: string | undefined) => {
    const attrName = getAttributeName();
    setAttributes({ [attrName]: newValue });
  };

  return (
    <BaseControl
      id={`responsive-color-${attributeBaseName}`}
      label={
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <span>{label}</span>
          <ButtonGroup>
            <Button
              icon={desktop}
              onClick={() => setCurrentDevice('desktop')}
              isPressed={currentDevice === 'desktop'}
              label={__('Desktop', 'musicalwheel')}
              showTooltip
              size="small"
            />
            <Button
              icon={tablet}
              onClick={() => setCurrentDevice('tablet')}
              isPressed={currentDevice === 'tablet'}
              label={__('Tablet', 'musicalwheel')}
              showTooltip
              size="small"
            />
            <Button
              icon={mobile}
              onClick={() => setCurrentDevice('mobile')}
              isPressed={currentDevice === 'mobile'}
              label={__('Mobile', 'musicalwheel')}
              showTooltip
              size="small"
            />
          </ButtonGroup>
        </div>
      }
    >
      <ColorPicker
        color={getValue()}
        onChange={setValue}
        enableAlpha
      />
    </BaseControl>
  );
}
```

#### Step 3: Usage in Block

```typescript
import ResponsiveRangeControl from '../components/ResponsiveRangeControl';
import { PanelBody } from '@wordpress/components';

<InspectorControls>
  <PanelBody title={__('Linethrough Settings', 'musicalwheel')}>
    <ResponsiveRangeControl
      label={__('Line Width', 'musicalwheel')}
      attributes={attributes}
      setAttributes={setAttributes}
      attributeBaseName="linethroughWidth"
      min={1}
      max={200}
      step={1}
      help={__('Adjust the thickness of the linethrough line', 'musicalwheel')}
    />
  </PanelBody>
</InspectorControls>
```

#### Step 4: Block Attributes

**File:** `block.json`

```json
{
  "attributes": {
    "linethroughWidth": {
      "type": "number",
      "default": 1
    },
    "linethroughWidth_tablet": {
      "type": "number"
    },
    "linethroughWidth_mobile": {
      "type": "number"
    }
  }
}
```

**Note:** Follow Elementor naming convention: `name`, `name_tablet`, `name_mobile`

---

### Option 3: Object-Based Responsive Values

**Alternative attribute structure:**

```json
{
  "attributes": {
    "linethroughWidth": {
      "type": "object",
      "default": {
        "desktop": 1,
        "tablet": null,
        "mobile": null
      }
    }
  }
}
```

**Pros:**
- ✅ Single attribute for all devices
- ✅ Easier to manage in code
- ✅ Cleaner attribute list

**Cons:**
- ❌ Doesn't match Elementor pattern
- ❌ More complex to access values
- ❌ Migration from Elementor more difficult

**Verdict:** ❌ Use Option 2 (separate attributes) to match Elementor

---

## CSS Generation with Responsive Values

### In render.php

```php
<?php
// Get responsive values
$line_width_desktop = $attributes['linethroughWidth'] ?? 1;
$line_width_tablet = $attributes['linethroughWidth_tablet'] ?? $line_width_desktop;
$line_width_mobile = $attributes['linethroughWidth_mobile'] ?? $line_width_tablet;

$text_color_desktop = $attributes['textColor'] ?? '';
$text_color_tablet = $attributes['textColor_tablet'] ?? $text_color_desktop;
$text_color_mobile = $attributes['textColor_mobile'] ?? $text_color_tablet;

// Build inline styles
$inline_styles = "
.wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price {
  color: {$text_color_desktop};
}

.wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price s {
  text-decoration-thickness: {$line_width_desktop}px;
}

@media (max-width: 782px) {
  .wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price {
    color: {$text_color_tablet};
  }

  .wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price s {
    text-decoration-thickness: {$line_width_tablet}px;
  }
}

@media (max-width: 600px) {
  .wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price {
    color: {$text_color_mobile};
  }

  .wp-block-musicalwheel-product-price-{$block->context['blockId']} .vx-price s {
    text-decoration-thickness: {$line_width_mobile}px;
  }
}
";

// Output styles
?>
<style><?php echo esc_html( $inline_styles ); ?></style>
<div <?php echo get_block_wrapper_attributes(); ?>>
  <!-- Block content -->
</div>
```

### WordPress Breakpoints

**Standard WordPress breakpoints:**
- Desktop: > 782px
- Tablet: 601px - 782px
- Mobile: ≤ 600px

**Match Elementor if possible:**
- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px

---

## Value Inheritance Pattern

**Elementor pattern (which we should match):**

1. **Desktop value** is always set (required)
2. **Tablet value** inherits from desktop if not set
3. **Mobile value** inherits from tablet if not set, otherwise from desktop

**Implementation:**

```typescript
// In ResponsiveRangeControl component
const getValue = () => {
  const attrName = getAttributeName();
  const value = attributes[attrName];

  // If value is undefined, show inherited value
  if (value === undefined) {
    if (currentDevice === 'tablet') {
      return attributes[attributeBaseName]; // Desktop value
    } else if (currentDevice === 'mobile') {
      return attributes[`${attributeBaseName}_tablet`] ?? attributes[attributeBaseName];
    }
  }

  return value;
};
```

**Visual indicator in UI:**
```typescript
{/* Show inheritance info */}
{currentDevice === 'tablet' && getValue() === undefined && (
  <div style={{ fontSize: '11px', color: '#757575', marginTop: '4px' }}>
    {__('Inheriting from desktop', 'musicalwheel')}
  </div>
)}
```

---

## Comparison: Elementor vs Custom Implementation

| Aspect | Elementor | Custom Gutenberg |
|--------|-----------|------------------|
| **API** | `add_responsive_control()` | Custom component |
| **Device Switcher** | Built-in toolbar | Custom ButtonGroup |
| **Value Storage** | `name`, `name_tablet`, `name_mobile` | Same pattern ✅ |
| **Inheritance** | Automatic | Manual implementation |
| **CSS Generation** | Automatic | Manual in render.php |
| **UI Location** | Above control | Above control ✅ |
| **Icons** | Device icons | WordPress icons ✅ |

---

## Available WordPress Icons

```typescript
import { desktop, tablet, mobile } from '@wordpress/icons';
```

**Evidence:** WordPress Icons package
- https://github.com/WordPress/gutenberg/tree/trunk/packages/icons/src/library

**Icons available:**
- `desktop` - Desktop/monitor icon
- `tablet` - Tablet icon
- `mobile` - Mobile/phone icon

---

## Implementation Checklist

For each responsive control:

- [ ] Create responsive component (ResponsiveRangeControl, ResponsiveColorControl, etc.)
- [ ] Add device switcher UI (ButtonGroup with desktop/tablet/mobile)
- [ ] Define 3 attributes: `name`, `name_tablet`, `name_mobile`
- [ ] Implement getValue() with inheritance logic
- [ ] Implement setValue() for current device
- [ ] Add visual indicator showing current device and inheritance
- [ ] Generate CSS with media queries in render.php
- [ ] Test all three devices
- [ ] Verify inheritance works correctly

---

## Recommended Implementation Strategy

### Phase 1: Create Base Components
1. Create `ResponsiveRangeControl.tsx`
2. Create `ResponsiveColorControl.tsx`
3. Add to components directory
4. Export from index file

### Phase 2: Use in Product-Price Block
1. Import components
2. Replace regular controls with responsive versions
3. Update block.json attributes (add `_tablet` and `_mobile` variants)
4. Update render.php to handle responsive values
5. Generate CSS with media queries

### Phase 3: Test
1. Test desktop values
2. Test tablet values (with and without override)
3. Test mobile values (with and without override)
4. Verify inheritance
5. Test on actual devices/browser resize

---

## Summary

**Key Findings:**

1. ❌ **No built-in responsive controls** in Gutenberg
2. ✅ **Custom implementation required** for all responsive functionality
3. ✅ **Follow Elementor pattern** for value storage (`name`, `name_tablet`, `name_mobile`)
4. ✅ **Use WordPress icons** for device switcher (desktop, tablet, mobile)
5. ✅ **Implement inheritance** (tablet ← desktop, mobile ← tablet ← desktop)
6. ✅ **Generate CSS manually** in render.php with media queries

**Recommended Approach:**

Create reusable responsive control components:
- `ResponsiveRangeControl` (for sliders)
- `ResponsiveColorControl` (for colors)
- Future: `ResponsiveTextControl`, `ResponsiveSelectControl`, etc.

This provides:
- Consistent UX across all blocks
- Matches Elementor behavior
- Reusable components for future widgets
- Proper value inheritance
- Clean, maintainable code

---

## References

- WordPress ResponsiveBlockControl: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/responsive-block-control/README.md
- WordPress Icons: https://github.com/WordPress/gutenberg/tree/trunk/packages/icons/src/library
- WordPress Breakpoints: https://codex.wordpress.org/CSS#WordPress_Generated_Classes
- Elementor Responsive Controls: Voxel widget examples
