# Login Block - Frontend CSS Issue Analysis

**Date:** 2026-02-10
**Issue:** Frontend displays input fields instead of proper login form styling
**Status:** ROOT CAUSE IDENTIFIED

---

## Problem Statement

- **Frontend (voxel-fse)**: Displays plain input form with broken CSS
- **Backend (voxel-fse editor)**: Missing icon preview
- **Voxel Original**: Displays properly formatted login modal/popup with icons

The issue is NOT about icons - it's about the **entire form layout being broken**.

---

## Root Cause Analysis

### Voxel Login Widget Architecture

The Voxel login widget uses **server-side PHP templates with Vue.js initialization**:

```php
<!-- File: voxel/templates/widgets/login.php -->
<div class="ts-auth hidden" data-config="<?= esc_attr( wp_json_encode( $config ) ) ?>">
  <div v-if="screen === 'login'" class="ts-form ts-login">
    <!-- PHP includes render the login form server-side -->
  </div>
</div>
```

**Key architectural points:**
1. **Initial state**: `.ts-auth.hidden` - the entire widget is hidden by default
2. **Vue.js reactive**: Screens switch via `v-if="screen === 'login'"` directives
3. **Server-side rendering**: All HTML is rendered PHP templates at page load
4. **JavaScript initialization**: Vue.js app initializes from data-config attribute and manages interactivity

### FSE Login Block Mismatch

The FSE `LoginComponent.tsx` was built as a **fully client-side React component** that:
- ✅ Renders all screens (login, register, recover, security, etc.)
- ✅ Handles state management via `useState()`
- ❌ **ALWAYS displays the form content directly** (no "hidden" initial state)
- ❌ **Lacks the proper CSS modal/popup styling** from Voxel
- ❌ **Missing the Vue.js template structure** that Voxel uses

---

## Critical CSS Issue

The FSE block is missing the **Voxel base styles** that make the login form display properly.

### What Voxel uses:

```css
.ts-auth {
  /* Base login widget styling */
}

.ts-auth.hidden {
  /* Initially hidden until Vue.js initializes */
  display: none;
}

.ts-form.ts-login {
  /* Login form specific styling */
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  /* etc. */
}

.ts-input-icon {
  /* Input field with icon styling */
  display: flex;
  align-items: center;
  position: relative;
}

.ts-input-icon > i {
  /* Icon color and sizing */
  color: inherit;
  margin-right: 10px;
  font-size: 18px;
}
```

### What FSE is missing:

The FSE `styles.ts` ONLY generates inline CSS for inspector controls (colors, spacing, typography), but does NOT include:
1. **Base layout styles** (.ts-form, .ts-login container structure)
2. **Form group styling** (.ts-form-group spacing and layout)
3. **Input field container styles** (.ts-input-icon positioning)
4. **Icon positioning and sizing defaults**
5. **Screen-specific styles** for different login screens

---

## The Real Fix Required

### Step 1: Add Base CSS to the Block

The FSE block needs to add **base structural CSS** similar to what Voxel provides. This should be in:
- `frontend.tsx` - inline styles OR
- A new `frontend-styles.css` file that's enqueued

### Step 2: Enqueue Voxel Login CSS

Since the FSE block is supposed to be a 1:1 conversion, it should either:
1. **Inherit from Voxel's login.css** by enqueuing it as a dependency, OR
2. **Replicate the critical styles** from Voxel's CSS

### Step 3: Match Voxel's HTML Structure

The LoginComponent's rendered HTML needs to match Voxel's structure:
- Wrap in `.ts-auth` container
- Use `.ts-form.ts-login` for form wrapper
- Use `.ts-form-group` for field groups
- Use `.ts-input-icon.flexify` for icon inputs

---

## Comparison: Voxel vs FSE

| Aspect | Voxel | FSE (Current) | FSE (Should Be) |
|--------|-------|---------------|-----------------|
| **Rendering** | PHP templates | React component | React with Voxel styles |
| **Initial state** | Hidden, Vue.js takes over | Always visible | Hidden until JS ready |
| **CSS source** | voxel/assets/dist/login.css | inline (styles.ts) | **+ frontend base styles** |
| **Container** | .ts-auth.hidden | div (no class) | .ts-auth with proper classes |
| **Form wrapper** | .ts-form.ts-login | div (no class) | .ts-form.ts-login |
| **Styling approach** | Inherited CSS + Vue | Generated inline CSS only | **Inherited + Generated** |

---

## Implementation Plan

### Priority 1: Add Base CSS (CRITICAL)

Create a new file: `frontend-styles.css`

```css
.ts-auth {
  /* Base container */
}

.ts-form.ts-login {
  /* Form layout */
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 40px 20px;
}

.login-section {
  margin-bottom: 30px;
}

.ts-form-group {
  margin-bottom: 20px;
}

.ts-input-icon {
  display: flex;
  align-items: center;
  position: relative;
  gap: 10px;
}

.ts-input-icon > i {
  font-size: 18px;
  flex-shrink: 0;
}

.ts-filter {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* etc. - copy from Voxel's login.css */
```

### Priority 2: Enqueue CSS in Block Registration

In `block.json` or `index.tsx`:

```json
"style": "file:./frontend-styles.css"
```

### Priority 3: Update Block's Rendered HTML

Ensure the root element in `LoginComponent.tsx` renders as:

```tsx
<div className="ts-auth">
  <div className="ts-form ts-login">
    {/* Login form content */}
  </div>
</div>
```

---

## Files to Check/Modify

1. **[LoginComponent.tsx](app/public/wp-content/themes/voxel-fse/app/blocks/src/login/shared/LoginComponent.tsx)** - Update root container classes
2. **[frontend.tsx](app/public/wp-content/themes/voxel-fse/app/blocks/src/login/frontend.tsx)** - Verify component initialization
3. **[styles.ts](app/public/wp-content/themes/voxel-fse/app/blocks/src/login/styles.ts)** - Add base layout styles
4. **[block.json](app/public/wp-content/themes/voxel-fse/app/blocks/src/login/block.json)** - Register style dependencies
5. **Create**: `frontend-base-styles.css` - Base structural styles

---

## Voxel CSS References

- Source: `/voxel/assets/dist/login.css`
- Template: `/voxel/templates/widgets/login.php`
- Screen template: `/voxel/templates/widgets/login/login-screen.php`

---

## Next Steps

1. Extract critical CSS from Voxel's `login.css`
2. Create `frontend-base-styles.css` for FSE block
3. Update LoginComponent root element to use `.ts-auth` and `.ts-form.ts-login`
4. Test frontend rendering
5. Rebuild and verify

