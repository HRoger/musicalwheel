# Popup Kit Field Popup Discovery

**Date:** 2025-11-30
**Phase:** D - Field Popup Integration (Corrected Understanding)
**Status:** Discovery Complete
**Purpose:** Understand how Voxel's popup-kit controls FIELD popups (not whole-form popups)

---

## ⚠️ CRITICAL CORRECTION

**INCORRECT UNDERSTANDING (Previous):**
- ❌ Thought popup-kit was for making the entire create-post form open in a popup modal
- ❌ Recommended creating CreatePostPopup component to wrap entire form
- ❌ Added "Open in Popup" mode to create-post block

**CORRECT UNDERSTANDING (Actual):**
- ✅ popup-kit is a **global style kit** for ALL popup components in Voxel
- ✅ Individual form **fields** (DateField, MultiselectField, TaxonomyField) open in popups
- ✅ Field popups should be full-screen and styled with popup-kit
- ✅ The create-post form itself does NOT open in a popup
- ✅ The actual problem: Field popups are broken (tiny instead of full-screen styled)

---

## 🎯 Discovery Goals

1. ✅ Understand how Voxel's popup-kit widget works
2. ✅ Identify which fields use popups
3. ✅ Document correct popup HTML structure
4. ✅ Understand how field popups should be styled
5. ✅ Identify what needs to be fixed

---

## 📁 Key Files Discovered

### Voxel Parent Theme

**popup-kit Widget:**
- `themes/voxel/app/widgets/popup-kit.php` (1637 lines)
  - Elementor widget for styling ALL Voxel popups globally
  - Not a functional popup widget - purely for styling preview
  - Line 1626-1628: Renders static template for styling configuration

**popup-kit Template:**
- `themes/voxel/templates/widgets/popup-kit.php` (1144 lines)
  - Static HTML preview of all popup components
  - Shows styling examples for field popups:
    - Date picker popup
    - Multiselect checkbox popup
    - Taxonomy search popup
    - File upload popup
    - Gallery upload popup
  - Not interactive - for global styling only

**Popup Component Template:**
- `themes/voxel/templates/components/popup.php` (58 lines)
  - Vue.js template (`<script type="text/html" id="voxel-popup-template">`)
  - Defines reusable popup structure
  - Used by field popups across the theme

**Create Post Widget:**
- `themes/voxel/app/widgets/create-post.php` (widget definition)
- `themes/voxel/templates/widgets/create-post.php` (Vue.js app)
  - Lines 23-24: Form renders directly on page (NOT in popup)
  - Lines 17-18: Deferred templates for field popups (media popup, file upload)
  - Individual fields trigger their own popups

---

## 🔍 Critical Findings

### Finding 1: popup-kit is a Global Style Kit

**Evidence:**
- `themes/voxel/app/widgets/popup-kit.php:1626-1628`
  ```php
  protected function render( $instance = [] ) {
      require locate_template( 'templates/widgets/popup-kit.php' );
  }
  ```

- `themes/voxel/templates/widgets/popup-kit.php:21-25`
  > "What's the purpose of this widget?"
  > "This widget is used to apply global styles to Voxel popups. It should be added in WP-admin > Design > General > Style kits > Popup styles."

**Conclusion:**
- ✅ popup-kit is a **global style kit** for all popups
- ✅ It's NOT for creating functional popups
- ✅ Actual popup functionality comes from Vue.js components
- ✅ Styles apply to ALL popups that use the correct HTML structure

---

### Finding 2: Field Popups Use popup-kit HTML Structure

**Evidence:**
- `themes/voxel/templates/components/popup.php:2-56`
  - Vue.js component with standardized HTML structure
  - All field popups use this same template
  - Ensures consistent styling via popup-kit

**HTML Structure:**
```html
<div class="elementor vx-popup">
    <div class="ts-popup-root elementor-element">
        <div class="ts-form elementor-element">
            <div class="ts-field-popup-container">
                <div class="ts-field-popup triggers-blur">
                    <!-- Popup content (field UI) -->
                    <div class="ts-popup-content-wrapper min-scroll">
                        <slot></slot> <!-- Field component here -->
                    </div>

                    <!-- Footer controller (save/clear/close buttons) -->
                    <div class="ts-popup-controller">
                        <ul class="flexify simplify-ul">
                            <li class="flexify ts-popup-close">
                                <a class="ts-icon-btn">Close</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

**Key CSS Classes:**
- `.vx-popup` - Outer wrapper
- `.ts-popup-root` - Root element
- `.ts-field-popup` - Actual popup box
- `.triggers-blur` - Enables backdrop blur
- `.ts-popup-content-wrapper` - Scrollable content
- `.ts-popup-controller` - Footer buttons

---

### Finding 3: Create-Post Form Does NOT Open in Popup

**Evidence:**
- `themes/voxel/templates/widgets/create-post.php:23-24`
  ```html
  <div class="ts-form ts-create-post create-post-form">
  ```

**Conclusion:**
- ✅ Voxel's create-post widget renders forms **directly on the page**
- ✅ The form itself is NOT in a popup modal
- ✅ Only individual fields within the form use popups

---

### Finding 4: Which Fields Use Popups?

**Based on Voxel theme analysis:**

1. **DateField** - Date picker opens in popup
2. **MultiselectField** - Checkbox list opens in popup
3. **TaxonomyField** - Term search/selection opens in popup
4. **RelationField** - Post search/selection opens in popup
5. **FileField** - File upload UI opens in popup
6. **ImageField** - Image upload UI opens in popup
7. **GalleryField** - Gallery management opens in popup

**All these field popups should:**
- ✅ Use the standard popup HTML structure
- ✅ Be full-screen styled with popup-kit
- ✅ Have backdrop blur (`.triggers-blur`)
- ✅ Have close button in footer
- ✅ Be scrollable if content is long

---

## 🐛 The Actual Problem

**Issue:** Field popups in create-post block are **broken**

**Symptoms:**
- Field popups appear tiny instead of full-screen
- Missing popup-kit styling
- Don't match Voxel's design
- Poor user experience

**Root Cause:**
- Our field components (DateField, MultiselectField, etc.) don't use the correct popup HTML structure
- Missing required CSS classes (`.vx-popup`, `.ts-field-popup`, etc.)
- Not rendering via React Portal (causing z-index/positioning issues)

**What Needs to Be Fixed:**
1. DateField popup - Must use popup-kit HTML structure
2. MultiselectField popup - Must use popup-kit HTML structure
3. TaxonomyField popup - Must use popup-kit HTML structure
4. All other field popups - Must use popup-kit HTML structure
5. Render field popups via React Portal for proper positioning
6. Match Voxel's exact HTML classes for styling compatibility

---

## ✅ Correct Implementation Approach

### Step 1: Create Shared Popup Component

**File:** `themes/voxel-fse/app/blocks/src/create-post/components/FieldPopup.tsx`

**Purpose:** Reusable popup wrapper for all field types

**Implementation:**
```tsx
import { createPortal } from 'react-dom';

export function FieldPopup({
    isOpen,
    onClose,
    title,
    children
}) {
    if (!isOpen) return null;

    return createPortal(
        <div className="elementor vx-popup">
            <div className="ts-popup-root elementor-element">
                <div className="ts-form elementor-element">
                    <div className="ts-field-popup-container">
                        <div className="ts-field-popup triggers-blur">
                            <div className="ts-popup-content-wrapper min-scroll">
                                {children}
                            </div>
                            <div className="ts-popup-controller">
                                <ul className="flexify simplify-ul">
                                    <li className="flexify ts-popup-close">
                                        <a onClick={onClose} className="ts-icon-btn">
                                            {/* Close icon SVG */}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
```

### Step 2: Update Each Field Component

**Example: DateField**

**Before (Broken):**
```tsx
// Popup renders inline, tiny, unstyled
<div className="date-popup">
    <input type="date" />
</div>
```

**After (Fixed):**
```tsx
import { FieldPopup } from '../components/FieldPopup';

// ...in DateField component
<FieldPopup isOpen={isOpen} onClose={closePopup} title="Select Date">
    <input type="date" />
</FieldPopup>
```

### Step 3: Repeat for All Field Types

**Fields to fix:**
1. DateField
2. MultiselectField
3. TaxonomyField
4. RelationField
5. FileField
6. ImageField
7. GalleryField

---

## 📊 Success Criteria

**Phase D Complete When:**

- ✅ FieldPopup shared component created
- ✅ All field popups use FieldPopup wrapper
- ✅ Field popups match Voxel's HTML structure 1:1
- ✅ Field popups use correct CSS classes
- ✅ Field popups render via React Portal
- ✅ Field popups are full-screen styled
- ✅ Backdrop blur effect works
- ✅ Close button works
- ✅ ESC key closes popups
- ✅ Field popups visually match Voxel's design
- ✅ No styling regressions

---

## 🚧 Out of Scope

**NOT part of Phase D:**
- ❌ Making entire create-post form open in popup (doesn't exist in Voxel)
- ❌ Adding "Open in Popup" mode to create-post block
- ❌ CreatePostPopup wrapper component
- ❌ Popup trigger buttons for entire form

**These were incorrect assumptions based on misunderstanding popup-kit.**

---

## 📝 Next Actions

1. ✅ **Discovery complete** - Correct understanding documented
2. ⏳ **Create FieldPopup component** - Shared wrapper for all field popups
3. ⏳ **Fix DateField popup** - Use FieldPopup wrapper
4. ⏳ **Fix MultiselectField popup** - Use FieldPopup wrapper
5. ⏳ **Fix TaxonomyField popup** - Use FieldPopup wrapper
6. ⏳ **Fix remaining field popups** - All 7 field types
7. ⏳ **Test styling** - Verify popup-kit styles apply correctly
8. ⏳ **Update documentation** - Completion summary

---

## 📚 Key Takeaways

1. **popup-kit is for styling, not functionality**
   - It's a global style kit applied via Elementor Style Kits
   - Provides consistent design for all Voxel popups

2. **Only field popups use popup-kit**
   - DateField, MultiselectField, TaxonomyField, etc.
   - NOT the entire create-post form

3. **1:1 HTML matching is critical**
   - Must use exact CSS classes from Voxel
   - popup-kit styles only apply if HTML structure matches

4. **React Portal is the solution**
   - Renders popups at document.body level
   - Ensures proper z-index and positioning
   - Avoids parent overflow issues

5. **Follow Voxel's way**
   - Don't guess functionality
   - Always verify in Voxel theme code
   - Match implementation exactly

---

**End of Discovery Document**

**Date:** 2025-11-30
**Status:** ✅ Discovery Complete - Correct Understanding
**Next Phase:** Implement FieldPopup component and fix all field popups
**Estimated Effort:** 5-7 days (all 7 field types)
