# Standardize Field CSS Classes - 1:1 Voxel Matching

## Evidence from Voxel Parent Theme

**CRITICAL FINDING:** Voxel **AUTO-GENERATES** `field-key-${field.key}` for ALL fields.

### Evidence: `themes/voxel/templates/widgets/create-post.php:129`

```php
:class="[
  'field-key-'+<?= $field_object ?>.key,  // AUTO-GENERATED for every field
  <?= $field_object ?>.validation.errors.length >= 1 ? 'ts-has-errors' : '',
  <?= $field_object ?>.css_class,  // User-configurable from backend
  <?= $field_object ?>.hidden ? 'hidden' : ''
]"
```

**Voxel's Class Array (in order):**
1. `field-key-${field.key}` - **Always present, auto-generated**
2. `ts-has-errors` - Applied when validation errors exist
3. `${field.css_class}` - User-configured CSS classes (can be empty)
4. `hidden` - Applied when field is hidden

---

## React Implementation: 1:1 Match Required

### Current Inconsistency

Our React components use various patterns:
- Some: `field-${field.type}` (wrong)
- Some: `field-${field.type} field-key-${field.key}` (partially correct)
- None respect the exact Voxel order and pattern

### Required Pattern (1:1 Match)

**Exact Voxel equivalent in React:**

```tsx
<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
```

**Class order:**
1. `ts-form-group` - Base class
2. `field-key-${field.key}` - Auto-generated identifier (REQUIRED)
3. `ts-has-errors` - Validation errors
4. `${field.css_class || ''}` - User-configured classes
5. `${field.hidden ? 'hidden' : ''}` - Hidden state

---

## Implementation Steps

### Step 1: Update TypeScript Interface

**File:** [types.ts](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/types.ts#L176)

```diff
export interface VoxelField {
  id?: number;
  key: string;
  type: string;
  label: string;
  required: boolean;
  value: any;
+ css_class?: string;  // User-configurable CSS from backend
+ hidden?: boolean;    // Hidden field state
  // ...
}
```

### Step 2: Standardize All Field Components

**Pattern to apply to ALL field wrappers:**

```tsx
const hasError = field.validation?.errors?.[0];

return (
  <div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
    {/* Field content */}
  </div>
);
```

### Step 3: Files Requiring Updates (17 files)

| File | Current Class | Required Update |
|------|--------------|-----------------|
| [TextField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/TextField.tsx) | `field-${field.type}` | Replace with `field-key-${field.key}` |
| [ProductField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/ProductField.tsx) | `field-product` | Replace with `field-key-${field.key}` |
| [PostRelationField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/PostRelationField.tsx) | `field-post-relation` | Replace with `field-key-${field.key}` |
| [RecurringDateField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/RecurringDateField.tsx) | `field-recurring-date` | Replace with `field-key-${field.key}` |
| [WorkHoursField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/WorkHoursField.tsx) | `field-work-hours` | Replace with `field-key-${field.key}` |
| [DateField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/DateField.tsx) | `field-date` | Replace with `field-key-${field.key}` |
| [LocationField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/LocationField.tsx) | `field-location` | Replace with `field-key-${field.key}` |
| [TimezoneField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/TimezoneField.tsx) | `field-timezone` | Replace with `field-key-${field.key}` |
| [TexteditorField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/TexteditorField.tsx) | `field-${field.type} field-key-${field.key}` | Remove `field-${field.type}`, keep only `field-key-${field.key}` |
| [NumberField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/NumberField.tsx) | `field-${field.type} field-key-${field.key}` | Remove `field-${field.type}`, keep only `field-key-${field.key}` |
| [FileField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/FileField.tsx) | `field-${field.type} field-key-${field.key}` | Remove `field-${field.type}`, keep only `field-key-${field.key}` |
| [DescriptionField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/DescriptionField.tsx) | `field-${field.type} field-key-${field.key}` | Remove `field-${field.type}`, keep only `field-key-${field.key}` |
| [SwitcherField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/SwitcherField.tsx) | `switcher-label` | Keep `switcher-label`, add `field-key-${field.key}` |
| [SelectField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/SelectField.tsx) | `inline-terms-wrapper` | Keep `inline-terms-wrapper`, add `field-key-${field.key}` |
| [MultiselectField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/MultiselectField.tsx) | `inline-terms-wrapper` | Keep `inline-terms-wrapper`, add `field-key-${field.key}` |
| [TaxonomyField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/TaxonomyField.tsx) | `inline-terms-wrapper` | Keep `inline-terms-wrapper`, add `field-key-${field.key}` |
| [RepeaterField.tsx](file:///c:/Users/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/components/fields/RepeaterField.tsx) | `ts-repeater` | Keep `ts-repeater`, add `field-key-${field.key}` |

---

## Expected DOM Output

### Example: Product Field

**Voxel output:**
```html
<div class="ts-form-group field-key-product ts-has-errors">
```

**Our React output (after fix):**
```html
<div class="ts-form-group field-key-product ts-has-errors">
```

### Example: Description Field with custom CSS

**Voxel output (user added "custom-style" in backend):**
```html
<div class="ts-form-group field-key-description custom-style">
```

**Our React output:**
```html
<div class="ts-form-group field-key-description custom-style">
```

---

## Key Corrections from Previous Plan

| Previous Plan ❌ | Correct Pattern ✅ | Evidence |
|------------------|-------------------|----------|
| Use `field-${field.type}` | Use `field-key-${field.key}` | create-post.php:129 |
| Add to existing classes | Replace type-based classes | Voxel ONLY uses `field-key-*` |
| Order not specified | Exact order matters | Voxel class array order |

---

## Verification

After implementation, inspect DOM:
- ✅ `field-key-${field.key}` present on ALL fields
- ✅ `ts-has-errors` appears when validation fails
- ✅ User `css_class` is respected
- ✅ `hidden` class applied when needed
- ✅ Scroll-to-error works reliably

## Navigation & Scroll Logic (New)

**Goal:** Replicate Voxel's behavior for "Publish", "Save changes", and "Next/Prev" buttons.

### 1. Submit / Save Changes Behavior
**Voxel Logic:**
1. Validate ALL fields.
2. If invalid:
   - Find the *first* field with an error.
   - **Switch Step:** If the field is on a different step, switch to that step.
   - **Scroll:** Scroll to the field element (`field-key-${field.key}`) with offset.

**React Implementation (`CreatePostForm.tsx`):**
- Update `validateForm()` or `handleSubmit()`:
  - Identify the first invalid field.
  - Check which step it belongs to.
  - If `stepIndex !== currentStepIndex`, call `setCurrentStepIndex(stepIndex)`.
  - Use `setTimeout` to allow render, then find element `.field-key-${field.key}`.
  - Scroll using `scrollIntoView({ behavior: 'smooth', block: 'center' })`.

### 2. Next Step Behavior
**Voxel Logic:**
1. Validate *current step* fields only.
2. If invalid:
   - Stay on current step.
   - Scroll to first error field.
3. If valid:
   - Proceed to next step.
   - Scroll to top of form.

**React Implementation (`CreatePostForm.tsx`):**
- Update `nextStep()`:
  - Ensure `validateCurrentStep()` uses `.field-key-${field.key}` selector for scrolling.

### 3. Selector Updates
- Replace all `field-${field.type}` selectors in `CreatePostForm.tsx` with `.field-key-${field.key}` to match our new class naming convention.

