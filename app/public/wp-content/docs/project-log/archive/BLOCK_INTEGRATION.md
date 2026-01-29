# Block Integration Guide

Complete guide for integrating dynamic tag support into Gutenberg blocks.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Frontend Integration (React)](#frontend-integration-react)
3. [Backend Integration (PHP)](#backend-integration-php)
4. [Complete Examples](#complete-examples)
5. [Best Practices](#best-practices)

---

## Quick Start

### 3-Step Integration

1. **Wrap your Edit component** with `withDynamicTags` HOC
2. **Process attributes** in render.php using `Block_Renderer`
3. **Done!** Users can now add dynamic tags to your block

---

## Frontend Integration (React)

### Step 1: Import the HOC

```tsx
// From a block in src/my-block/
import { withDynamicTags } from '../shared/dynamic-tags';

// Or import specific components
import { withDynamicTags, DynamicTagBuilder, DynamicTagPanel } from '../shared/dynamic-tags';
```

### Step 2: Wrap Your Edit Component

**Option A: Auto-detect all string attributes (Recommended)**

```tsx
function Edit({ attributes, setAttributes }) {
  return (
    <div>
      <h2>{attributes.title}</h2>
      <p>{attributes.description}</p>
    </div>
  );
}

// Wrap with HOC - automatically detects title and description
export default withDynamicTags(Edit);
```

**Option B: Specify which attributes**

```tsx
export default withDynamicTags(Edit, {
  attributes: ['title', 'subtitle'], // Only these
  panelTitle: 'Dynamic Content',    // Custom panel title
  context: 'post',                   // Tag context
});
```

**Option C: Exclude specific attributes**

```tsx
export default withDynamicTags(Edit, {
  excludeAttributes: ['internalId', 'className'], // Skip these
});
```

### Step 3: Register Block Attributes

No changes needed! Your existing string attributes work as-is:

```js
// block.json
{
  "attributes": {
    "title": {
      "type": "string",
      "default": ""
    },
    "description": {
      "type": "string",
      "default": ""
    }
  }
}
```

---

## Backend Integration (PHP)

### Step 1: Import Block_Renderer

```php
use MusicalWheel\Dynamic_Data\Block_Renderer;
```

### Step 2: Process Attributes in render.php

**Option A: Process all attributes at once (Recommended)**

```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;

// Process all attributes
$attrs = Block_Renderer::process_attributes( $attributes );

// Use processed values
$title = $attrs['title'] ?? '';
$description = $attrs['description'] ?? '';
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <h2><?php echo esc_html( $title ); ?></h2>
  <p><?php echo esc_html( $description ); ?></p>
</div>
```

**Option B: Process individual attributes**

```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;

$title = $attributes['title'] ?? '';
$description = $attributes['description'] ?? '';

// Render each attribute
if ( Block_Renderer::has_dynamic_tags( $title ) ) {
  $title = Block_Renderer::render_attribute( $title );
}

if ( Block_Renderer::has_dynamic_tags( $description ) ) {
  $description = Block_Renderer::render_attribute( $description );
}
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <h2><?php echo esc_html( $title ); ?></h2>
  <p><?php echo esc_html( $description ); ?></p>
</div>
```

**Option C: Custom context**

```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;
use MusicalWheel\Dynamic_Data\Data_Groups;

// Build custom context
$custom_context = [
  'post' => new Data_Groups\Post_Data_Group(),
  'user' => Data_Groups\User_Data_Group::get( 123 ), // Specific user
];

// Process with custom context
$attrs = Block_Renderer::process_attributes( $attributes, $custom_context );
?>
```

---

## Complete Examples

### Example 1: Simple Text Block

**edit.tsx:**
```tsx
import { withDynamicTags } from '../shared/dynamic-tags';
import { useBlockProps, RichText } from '@wordpress/block-editor';

function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <RichText
        tagName="h2"
        value={attributes.title}
        onChange={(title) => setAttributes({ title })}
        placeholder="Enter title..."
      />
    </div>
  );
}

// Add dynamic tag support
export default withDynamicTags(Edit, {
  panelTitle: 'Dynamic Title',
});
```

**render.php:**
```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;

$attrs = Block_Renderer::process_attributes( $attributes );
$title = $attrs['title'] ?? '';
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <h2><?php echo esc_html( $title ); ?></h2>
</div>
```

### Example 2: Card Block with Multiple Fields

**edit.tsx:**
```tsx
import { withDynamicTags } from '../shared/dynamic-tags';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';

function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <TextControl
        label="Title"
        value={attributes.title}
        onChange={(title) => setAttributes({ title })}
      />
      <TextControl
        label="Subtitle"
        value={attributes.subtitle}
        onChange={(subtitle) => setAttributes({ subtitle })}
      />
      <TextareaControl
        label="Description"
        value={attributes.description}
        onChange={(description) => setAttributes({ description })}
      />
    </div>
  );
}

// Auto-detects all string attributes
export default withDynamicTags(Edit, {
  context: 'post',
});
```

**render.php:**
```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;

$attrs = Block_Renderer::process_attributes( $attributes );
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <div class="card">
    <h2><?php echo esc_html( $attrs['title'] ?? '' ); ?></h2>
    <h3><?php echo esc_html( $attrs['subtitle'] ?? '' ); ?></h3>
    <p><?php echo esc_html( $attrs['description'] ?? '' ); ?></p>
  </div>
</div>
```

### Example 3: User Profile Block

**edit.tsx:**
```tsx
import { withDynamicTags } from '../shared/dynamic-tags';
import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';

function Edit({ attributes, setAttributes }) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <div className="user-profile">
        <TextControl
          label="User Name"
          value={attributes.userName}
          onChange={(userName) => setAttributes({ userName })}
          help="Try: @user(display_name)"
        />
        <TextControl
          label="User Email"
          value={attributes.userEmail}
          onChange={(userEmail) => setAttributes({ userEmail })}
          help="Try: @user(email)"
        />
      </div>
    </div>
  );
}

// Context set to 'user' for user-specific tags
export default withDynamicTags(Edit, {
  context: 'user',
  panelTitle: 'User Data',
});
```

**render.php:**
```php
<?php
use MusicalWheel\Dynamic_Data\Block_Renderer;

$attrs = Block_Renderer::process_attributes( $attributes );
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
  <div class="user-profile">
    <h3><?php echo esc_html( $attrs['userName'] ?? '' ); ?></h3>
    <a href="mailto:<?php echo esc_attr( $attrs['userEmail'] ?? '' ); ?>">
      <?php echo esc_html( $attrs['userEmail'] ?? '' ); ?>
    </a>
  </div>
</div>
```

---

## Best Practices

### 1. **Always Escape Output**

```php
// ✅ Good
<h2><?php echo esc_html( $title ); ?></h2>
<a href="<?php echo esc_url( $url ); ?>">Link</a>

// ❌ Bad
<h2><?php echo $title; ?></h2>
<a href="<?php echo $url; ?>">Link</a>
```

### 2. **Check for Dynamic Tags Before Processing**

```php
// ✅ Efficient - only process if needed
if ( Block_Renderer::has_dynamic_tags( $title ) ) {
  $title = Block_Renderer::render_attribute( $title );
}

// ✅ Also fine - process_attributes handles this internally
$attrs = Block_Renderer::process_attributes( $attributes );
```

### 3. **Provide Default Values**

```php
// ✅ Good - handles missing attributes
$title = $attrs['title'] ?? 'Default Title';

// ❌ Bad - may cause errors
$title = $attrs['title'];
```

### 4. **Use Appropriate Context**

```tsx
// For post-related blocks
export default withDynamicTags(Edit, { context: 'post' });

// For user-related blocks
export default withDynamicTags(Edit, { context: 'user' });

// For term/category blocks
export default withDynamicTags(Edit, { context: 'term' });
```

### 5. **Exclude Non-Content Attributes**

```tsx
// ✅ Good - exclude technical attributes
export default withDynamicTags(Edit, {
  excludeAttributes: ['className', 'anchor', 'internalId'],
});
```

### 6. **Test with Sample Data**

```tsx
// In your edit component, show example tags
<TextControl
  label="Title"
  value={attributes.title}
  onChange={(title) => setAttributes({ title })}
  help="Example: @post(title).truncate(50)"
/>
```

---

## API Reference

### withDynamicTags(BlockEdit, options)

**Parameters:**
- `BlockEdit`: Original block edit component
- `options`: Configuration object
  - `attributes?: string[]` - Specific attributes to include
  - `excludeAttributes?: string[]` - Attributes to exclude
  - `panelTitle?: string` - Inspector panel title (default: "Dynamic Data")
  - `context?: string` - Tag context (default: "post")

**Returns:** Enhanced edit component with dynamic tag support

### Block_Renderer::process_attributes(attributes, context)

**Parameters:**
- `attributes: array` - Block attributes
- `context: array` - Optional custom data group context

**Returns:** Array of processed attributes with rendered dynamic tags

### Block_Renderer::render_attribute(value, context)

**Parameters:**
- `value: string` - Attribute value to render
- `context: array` - Optional custom data group context

**Returns:** Rendered string

### Block_Renderer::has_dynamic_tags(value)

**Parameters:**
- `value: mixed` - Value to check

**Returns:** Boolean - true if value contains dynamic tags

---

## Troubleshooting

### Dynamic tags not rendering

1. Check render.php uses `Block_Renderer::process_attributes()`
2. Verify attributes are strings in block.json
3. Ensure loader.php is loaded in functions.php

### Panel not showing in editor

1. Verify HOC is properly applied: `export default withDynamicTags(Edit)`
2. Check string attributes exist in block.json
3. Confirm @wordpress/block-editor is imported

### Tags showing as plain text

1. Verify render.php is processing attributes
2. Check for proper escaping (use esc_html, not esc_attr for content)
3. Test expression manually with `mw_render()` function

---

## Support

For issues or questions:
- Check the DynamicTagBuilder README
- Review complete examples above
- Test with sample data: `@post(title)`, `@user(display_name)`

**Version:** Phase 3.5 - Block Integration
**Status:** Production Ready ✅
