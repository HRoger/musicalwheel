# Cart Summary — Icon System Parity Audit

**Date:** 2026-02-12
**Focus:** Default icon rendering + Inspector control state
**Status:** 2 bugs identified with root causes and fixes

---

## Reference Files

| Source | File | Key Lines |
|--------|------|-----------|
| **Voxel Widget** | `themes/voxel/app/widgets/cart-summary.php` | 29-120 (icon controls) |
| **Voxel Template** | `themes/voxel/templates/widgets/cart-summary/cart-item.php` | 19-32 (quantity buttons) |
| **FSE block.json** | `themes/voxel-fse/app/blocks/src/cart-summary/block.json` | 37-113 (icon attributes) |
| **FSE CartSummaryComponent** | `themes/voxel-fse/app/blocks/src/cart-summary/shared/CartSummaryComponent.tsx` | 31-53 (defaults + getIcon) |
| **FSE ContentTab** | `themes/voxel-fse/app/blocks/src/cart-summary/inspector/ContentTab.tsx` | 28-82 (icon controls) |
| **IconPickerControl** | `themes/voxel-fse/app/blocks/shared/controls/IconPickerControl.tsx` | 113-116, 514-549 (normalization + buttons) |
| **renderIcon** | `themes/voxel-fse/app/blocks/shared/utils/renderIcon.tsx` | 49-81 (render logic) |

---

## Architecture Comparison: How Icons Work

### Voxel Parent (Elementor)

```
1. Widget PHP registers icon controls with NO DEFAULT:
   $this->add_control('ts_minus_icon', ['type' => ICONS])

2. Template renders with fallback pattern:
   get_icon_markup($settings['ts_minus_icon']) ?: \Voxel\svg('minus.svg')

3. When user hasn't set icon → get_icon_markup() returns '' → SVG fallback renders
4. When user picks icon → get_icon_markup() returns <i class="..."> → user icon renders
```

**Key insight:** Voxel's Elementor controls have **NO default icon value**. The default icon rendering is handled entirely by the PHP template's `?:` fallback to SVG files.

### FSE Block (Gutenberg)

```
1. block.json sets default values WITH icon data:
   "minusIcon": { "library": "line-awesome", "value": "las la-minus" }

2. CartSummaryComponent has getIcon() helper:
   getIcon(attributes.minusIcon, 'minusIcon') → returns attribute value

3. renderIcon() renders the icon from the value
```

**Key insight:** The FSE block bakes the default icon into the block.json attribute AND has a duplicate fallback table in CartSummaryComponent. This creates conflicting logic.

---

## Bug #1: Default Icons Not Showing on Frontend (Quantity +/-)

### Symptoms
The +/- quantity buttons appear as empty circles with no icon inside (see screenshot).

### Root Cause

The `getIcon()` function in [CartSummaryComponent.tsx:48-53](app/public/wp-content/themes/voxel-fse/app/blocks/src/cart-summary/shared/CartSummaryComponent.tsx#L48-L53) has a flawed condition:

```typescript
function getIcon(attrValue: IconValue | undefined, key: string): IconValue {
    if (attrValue && typeof attrValue === 'object' && 'library' in attrValue) {
        return attrValue;  // ← Returns even when library='' and value=''
    }
    return defaultIcons[key] || { library: 'line-awesome', value: 'las la-question' };
}
```

**The bug chain:**

1. block.json default: `{ library: "line-awesome", value: "las la-minus" }`
2. User opens inspector and clicks "None" on the minus icon
3. IconPickerControl's `handleNone()` sets attribute to `{ library: '', value: '' }`
4. `getIcon({ library: '', value: '' }, 'minusIcon')` evaluates:
   - `attrValue` is truthy (it's an object) ✅
   - `typeof attrValue === 'object'` ✅
   - `'library' in attrValue` ✅ (property exists, even if empty string)
   - Returns `{ library: '', value: '' }` ← **BUG: should fall through to defaults**
5. `renderIcon({ library: '', value: '' })` evaluates:
   - `icon.value` is `''` (falsy) → skips icon rendering
   - No `fallbackKey` passed → returns `null`
6. **Result: no icon renders**

**But wait — the user hasn't clicked "None".** So why would `attributes.minusIcon` be `{ library: '', value: '' }`?

**Actually**, the block.json default IS `{ library: "line-awesome", value: "las la-minus" }`, and since the user hasn't changed it, `attributes.minusIcon` should still contain this default. The `renderIcon()` check at line 53 is:

```typescript
if (icon.library === 'icon' || !icon.library || icon.library === '') {
    return <i className={icon.value}></i>;
}
```

The library is `"line-awesome"` — which does NOT match `'icon'`, is NOT falsy, and is NOT `''`. So it falls through all conditions and returns `null`!

### The REAL Root Cause

`renderIcon()` only handles these library values:
- `'icon'` → renders `<i>`
- `''` or falsy → renders `<i>` (treats as Line Awesome)
- `'svg'` → renders SVG

But block.json uses `library: "line-awesome"` which is **NOT handled** by `renderIcon()`.

### Evidence

[renderIcon.tsx:53](app/public/wp-content/themes/voxel-fse/app/blocks/shared/utils/renderIcon.tsx#L53):
```typescript
if (icon.library === 'icon' || !icon.library || icon.library === '') {
```

[block.json:88-91](app/public/wp-content/themes/voxel-fse/app/blocks/src/cart-summary/block.json#L88-L91):
```json
"minusIcon": {
    "default": { "library": "line-awesome", "value": "las la-minus" }
}
```

### Fix

Update `renderIcon()` to handle `"line-awesome"` (and any non-svg/non-dynamic library) as a font icon:

```typescript
export function renderIcon(icon?: IconConfig, fallbackKey?: string): ReactNode {
    if (icon && icon.value) {
        // Handle SVG first (specific check)
        if (icon.library === 'svg') {
            if (icon.value.startsWith('<svg') || icon.value.startsWith('<?xml')) {
                return <span className="ts-icon-svg" dangerouslySetInnerHTML={{ __html: icon.value }} />;
            }
            return <img src={icon.value} alt="" className="ts-icon-svg" />;
        }
        // Everything else (icon, line-awesome, font-awesome, empty, etc.) = font icon
        return <i className={icon.value}></i>;
    }
    // fallback...
}
```

Additionally, fix `getIcon()` to properly detect empty values:

```typescript
function getIcon(attrValue: IconValue | undefined, key: string): IconValue {
    if (attrValue && attrValue.library && attrValue.value) {
        return attrValue;
    }
    return defaultIcons[key] || { library: 'line-awesome', value: 'las la-question' };
}
```

---

## Bug #2: Inspector Shows Default Icons Instead of "None" State

### Symptoms
In the inspector panel, all icon controls show the icon library button as active (blue) with the icon preview displayed. They should show "None" as active since the user hasn't customized them.

### Root Cause

**The problem is the block.json defaults.** Every icon attribute has a non-empty default:

```json
"minusIcon": {
    "type": "object",
    "default": { "library": "line-awesome", "value": "las la-minus" }
}
```

When the block is first inserted, WordPress sets `attributes.minusIcon` to this default. When passed to `IconPickerControl`:

[IconPickerControl.tsx:113-116](app/public/wp-content/themes/voxel-fse/app/blocks/shared/controls/IconPickerControl.tsx#L113-L116):
```typescript
const normalizedValue: IconValue = {
    library: value?.library || '',   // = "line-awesome"
    value: value?.value || '',       // = "las la-minus"
};
```

[IconPickerControl.tsx:514-515](app/public/wp-content/themes/voxel-fse/app/blocks/shared/controls/IconPickerControl.tsx#L514-L515):
```typescript
<Button variant={normalizedValue.library === '' ? 'primary' : 'secondary'}>
```

Since `library = "line-awesome"` (not empty), the "None" button shows as secondary (inactive), and the Icon Library button shows as primary (active) with the icon preview.

### How Voxel/Elementor Handles This

In Elementor, icon controls have **NO DEFAULT** (see [cart-summary.php:38-47](app/public/wp-content/themes/voxel/app/widgets/cart-summary.php)):

```php
$this->add_control('ts_delete_icon', [
    'label' => 'Delete icon',
    'type' => Controls_Manager::ICONS,
    'skin' => 'inline',
    'label_block' => false,
    // NO 'default' key!
]);
```

The control starts empty. The fallback icon rendering is handled by the template, not by the control's default value.

### Fix

**Change block.json defaults to empty objects** for all icon attributes:

```json
"minusIcon": {
    "type": "object",
    "default": {}
}
```

The `getIcon()` helper (with the fix from Bug #1) will use `defaultIcons[key]` when the attribute is empty, ensuring:
1. Inspector: "None" button is active (correct UX)
2. Frontend: default icons still render (via `getIcon()` fallback)

---

## Summary of Required Changes

### File 1: `renderIcon.tsx` — Fix library type handling
**Severity: HIGH** (causes missing icons on frontend)

Change the icon type check to treat any non-SVG library as a font icon class.

### File 2: `CartSummaryComponent.tsx:48-53` — Fix `getIcon()` condition
**Severity: HIGH** (would cause missing icons when user clicks "None" then expects defaults)

Check `attrValue.library && attrValue.value` instead of `'library' in attrValue`.

### File 3: `block.json:37-113` — Change icon defaults to empty
**Severity: MEDIUM** (UX issue in inspector controls)

Change all 11 icon attribute defaults from `{ library: "line-awesome", value: "..." }` to `{}`.

### Priority Fix Order

1. `renderIcon.tsx` — Fixes the actual missing icon rendering (Bug #1 primary cause)
2. `CartSummaryComponent.tsx` — Fixes the fallback logic for empty values
3. `block.json` — Fixes the inspector control visual state (Bug #2)

---

## Impact on Other Blocks

The `renderIcon()` fix is in a **shared utility** used by many blocks. Need to verify that changing the library check doesn't break other blocks. The change is safe because:
- Previously: `library === 'icon' || !library || library === ''` → font icon
- After: `library !== 'svg'` → font icon (SVG handled first)
- This is strictly more permissive, handling `"line-awesome"`, `"font-awesome"`, etc.

The `block.json` change is cart-summary specific. Other blocks should audit their icon defaults for the same pattern.

---

## Voxel Widget Icon Controls Comparison

| Voxel Control ID | Voxel Has Default? | FSE Attribute | FSE Has Default? | Match? |
|------------------|-------------------|---------------|-----------------|--------|
| `ts_delete_icon` | ❌ No | `deleteIcon` | ❌ Should be `{}` | Fix needed |
| `nostock_ico` | ❌ No | `noProductsIcon` | ❌ Should be `{}` | Fix needed |
| `ts_enter` | ❌ No | `loginIcon` | ❌ Should be `{}` | Fix needed |
| `auth_email_ico` | ❌ No | `emailIcon` | ❌ Should be `{}` | Fix needed |
| `auth_user_ico` | ❌ No | `userIcon` | ❌ Should be `{}` | Fix needed |
| `ts_upload_ico` | ❌ No | `uploadIcon` | ❌ Should be `{}` | Fix needed |
| `ts_shipping_ico` | ❌ No | `shippingIcon` | ❌ Should be `{}` | Fix needed |
| `ts_minus_icon` | ❌ No (not even registered!) | `minusIcon` | ❌ Should be `{}` | Fix needed |
| `ts_plus_icon` | ❌ No (not even registered!) | `plusIcon` | ❌ Should be `{}` | Fix needed |
| N/A | N/A | `checkoutIcon` | ❌ Should be `{}` | FSE-only |
| N/A | N/A | `continueIcon` | ❌ Should be `{}` | FSE-only |
