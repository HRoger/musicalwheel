# CSS Priority and Admin Styling Integrity Patterns

This document outlines the solutions developed for the **Popup Kit** block to ensure custom styles reliably override theme defaults and don't interfere with the WordPress Admin interface. These patterns should be applied to other "Configuration" or "Kit" blocks like **Timeline Kit**.

## 1. CSS Specificity Strategy

### Problem
Static CSS files (like `common.css` or `popup-kit.css`) often use selectors with moderate specificity (e.g., `.ts-btn-2`). If the generated custom CSS uses the same selector, it may be overridden by the theme's static files depending on load order.

### Solution
Wrap generated selectors with a block-specific controller class to increase specificity to `0-3-0` or higher.

**Example from Popup Kit (`generateCSS.ts`):**
```typescript
// Poor specificity (0-2-0) - easily overridden
css += `.ts-field-popup .ts-btn-1 { ... }`;

// High specificity (0-3-0) - wins over defaults
css += `.ts-field-popup .ts-popup-controller .ts-btn-1 { ... }`;
```

## 2. Admin Styling Leak Prevention

### Problem
Styles generated for frontend components can break the WordPress Admin dashboard (e.g., shifting margins, changing body colors) if the CSS is enqueued globally.

### Solution
In the `Block_Loader.php` (or equivalent PHP enqueuing logic), restrict style loading to the Frontend or the Block Editor.

**Implementation Pattern:**
```php
public static function enqueue_kit_styles() {
    // Prevent loading on generic admin pages (Plugins, User, etc.)
    if (is_admin()) {
        $screen = get_current_screen();
        if (!$screen || !$screen->is_block_editor()) {
            return;
        }
    }
    
    // Proceed to enqueue styles...
}
```

## 3. CSS Cascade Control (Dependency-based Enqueue)

### Problem
WordPress `wp_add_inline_style` attaches styles to a specific handle. If attached to the base handle, the inline CSS might still load *before* other related stylesheets, causing cascade issues.

### Solution
Register a **new** handle for the custom CSS and make it dependent on the base stylesheet. This guarantees the custom CSS always appears **after** the base CSS in the HTML source.

**Implementation Pattern:**
```php
if (wp_style_is('vx:base-style.css', 'registered')) {
    // Create a virtual handle dependent on the base style
    wp_register_style('vx:custom-overrides', false, ['vx:base-style.css']);
    wp_add_inline_style('vx:custom-overrides', $custom_css);
    wp_enqueue_style('vx:custom-overrides');
}
```

## 4. Robust "Reset" Logic (`hasValue`)

### Problem
Gutenberg attributes can sometimes store empty strings `""` or `null` when a user clears a field. Simple truthiness checks like `if (attributes.color)` might fail if the user enters a whitespace string, or might generate empty rules.

### Solution
Use a helper function to validate values before generating CSS output.

**Helper Function (`generateCSS.ts`):**
```typescript
function hasValue(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
}

// Usage
if (hasValue(attributes.myColor)) {
    css += `.selector { color: ${attributes.myColor}; }`;
}
```

## 5. Force Re-generation (The "Dirty state" fix)

### Problem
When CSS generation logic changes (e.g., selectors are updated to have higher specificity), existing blocks in the database retain their *old* generated CSS until the block is saved again in the editor.

### Solution
1. **Force Save**: Open the site editor, toggle an attribute (e.g., Border: Solid -> Default) to trigger a "dirty" state, and click Save.
2. **Asset Rebuild**: Ensure `npm run build` is executed so the new `generateCSS.ts` logic is used by the editor's save function.

## 6. Editor Style Conflicts & Reset Functionality

### Problem
When a "Kit" block is loaded in the Site Editor, the server (PHP) often injects the saved global CSS into the page head (e.g., via `Block_Loader.php`). This global CSS exists alongside the block's live preview CSS which responds to attribute changes.

When a user clicks "Reset" on a control:
1. The attribute is cleared.
2. The *live preview* CSS removes the style rule.
3. **However**, the specific global CSS tag injected by the server **remains in the DOM**.
4. Due to cascade rules or identical specificity, the stale global CSS continues to apply, making it look like the reset failed.

### Solution
Use a `useEffect` hook in the block's `edit.tsx` component to detect and remove the server-injected global style tag when the editor component mounts. This effectively hands over full styling control to the editor's live preview.

**Implementation Pattern (Reference: `popup-kit/edit.tsx`):**
```typescript
// edit.tsx

export default function Edit({ attributes, setAttributes }: Props) {
    // ...

    // FIX: Clean up global styles injected by PHP/Block Loader to prevent conflicts with editor preview
    // The server injects a style tag with ID 'vx:popup-kit-custom-inline-css' (or similar)
    // that persists even after block attributes are reset.
    useEffect(() => {
        // Identify the exact ID used by the PHP loader
        const globalStyle = document.getElementById('vx:popup-kit-custom-inline-css');
        if (globalStyle) {
            globalStyle.remove();
        }
    }, []);

    // ... render component with live CSS preview
}
```

**Target Blocks:**
- `popup-kit` (Implemented)
- `timeline-kit` (Pending Implementation)
