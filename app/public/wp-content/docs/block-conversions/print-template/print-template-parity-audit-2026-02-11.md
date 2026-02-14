# Print Template Widget vs Block - Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~95%
**Status:** Excellent parity with minor architectural differences. One post-type mismatch and one CSS cleanup needed.

---

## Reference Files

| Source | File | Key Lines |
|--------|------|-----------|
| **Voxel Widget** | `themes/voxel/app/widgets/print-template.php` | L9-51 (entire class) |
| **Voxel Helper** | `themes/voxel/app/utils/template-utils.php` | L54-84 (`print_template()`), L107-119 (`enqueue_template_css()`) |
| **Voxel Post Select** | `themes/voxel/app/modules/elementor/custom-controls/post-select-control.php` | Custom Elementor control |
| **FSE block.json** | `themes/voxel-fse/app/blocks/src/print-template/block.json` | L1-85 |
| **FSE render.php** | `themes/voxel-fse/app/blocks/src/print-template/render.php` | L1-12 |
| **FSE edit.tsx** | `themes/voxel-fse/app/blocks/src/print-template/edit.tsx` | L1-278 |
| **FSE save.tsx** | `themes/voxel-fse/app/blocks/src/print-template/save.tsx` | L1-115 |
| **FSE frontend.tsx** | `themes/voxel-fse/app/blocks/src/print-template/frontend.tsx` | L1-348 |
| **FSE ContentTab.tsx** | `themes/voxel-fse/app/blocks/src/print-template/inspector/ContentTab.tsx` | L1-52 |
| **FSE PrintTemplateComponent.tsx** | `themes/voxel-fse/app/blocks/src/print-template/shared/PrintTemplateComponent.tsx` | L1-389 |
| **FSE types/index.ts** | `themes/voxel-fse/app/blocks/src/print-template/types/index.ts` | L1-47 |
| **FSE index.tsx** | `themes/voxel-fse/app/blocks/src/print-template/index.tsx` | L1-124 |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | Server-side PHP via `\Voxel\print_template()` | Plan C+ hybrid: save.tsx static HTML + frontend.tsx React hydration |
| **State Management** | None (stateless PHP) | React useState: `templateContent`, `isLoading`, `error` |
| **AJAX** | None (server-side only) | WordPress REST API (pages, blocks, posts endpoints) |
| **CSS Strategy** | None (pass-through, no wrapper) | Inline responsive CSS from AdvancedTab, `.voxel-fse-print-template` wrapper |
| **JavaScript** | None (zero JS) | React hydration, nested block hydration, dynamic tag resolution |
| **Inspector Controls** | 1 control (voxel-post-select) | 1 control (PostSelectControl) + AdvancedTab + VoxelTab |
| **API Controller** | None needed | None created (uses WP core REST API directly) |
| **Template Sources** | `page`, `elementor_library` | `page`, `wp_block` (+ posts, FSE templates in editor) |

---

## HTML Structure Parity

### Voxel Widget Output

The Voxel print-template widget produces **NO wrapper HTML**. It directly outputs template content via `\Voxel\print_template()`.

**Evidence:** `print-template.php:42-46`
```php
protected function render( $instance = [] ) {
    if ( $template_id = $this->get_settings_for_display( 'ts_template_id' ) ) {
        \Voxel\print_template( $template_id );
    }
}
```

**Output:**
```html
<!-- NO WRAPPER - template content rendered directly -->
<section class="elementor-section ...">
  <!-- Template content from Elementor -->
</section>
```

### FSE Block Output

**Evidence:** `save.tsx:60-108`, `PrintTemplateComponent.tsx:371-386`

```html
<div class="wp-block-voxel-fse-print-template voxel-fse-print-template ts-print-template"
     id="[blockId]"
     data-template-id="[templateId]"
     data-visibility-behavior="[behavior]"
     data-visibility-rules="[rules]">
  <style>/* responsive CSS from AdvancedTab */</style>
  <script type="text/json" class="vxconfig">{"templateId":"...","customClasses":"..."}</script>
  <!-- After hydration: -->
  <div class="ts-print-template-content [customClasses]">
    <div class="ts-print-template-rendered">
      <!-- Template HTML inserted here -->
    </div>
  </div>
</div>
```

### Structure Comparison

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root wrapper | None (no wrapper) | `.voxel-fse-print-template.ts-print-template` | ⚠️ FSE adds wrapper (necessary for React mount) |
| Content wrapper | None | `.ts-print-template-content` | ⚠️ FSE addition |
| Rendered content | Direct echo | `.ts-print-template-rendered` with `dangerouslySetInnerHTML` | ⚠️ FSE wraps |
| Data attributes | None | `data-template-id`, `data-visibility-*`, `data-loop-*` | ⚠️ FSE additions (for headless/visibility) |
| vxconfig script | N/A | `<script class="vxconfig">` JSON | ⚠️ FSE pattern for hydration |
| Custom classes | Not supported | Via `customClasses` attribute | ✅ FSE enhancement |

**Assessment:** The wrapper HTML differences are **architecturally necessary** for Gutenberg block structure and React hydration. Not a parity issue per se, but a known structural difference. Voxel renders template content as a direct pass-through; FSE needs React mounting points.

---

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | N/A (no JS) | `fetchTemplateContent()` (edit.tsx:36-119) | ✅ Enhancement | Editor template preview fetching |
| 2 | N/A | `resolveDynamicTag()` (edit.tsx:124-145) | ✅ Enhancement | Editor dynamic tag resolution |
| 3 | N/A | `normalizeConfig()` (frontend.tsx:81-98) | ✅ Enhancement | Multi-format config normalization |
| 4 | N/A | `parseVxConfig()` (frontend.tsx:112-127) | ✅ Enhancement | Config extraction from DOM |
| 5 | N/A | `renderDynamicTag()` (frontend.tsx:132-165) | ✅ Enhancement | Frontend dynamic tag resolution |
| 6 | N/A | `fetchTemplateContent()` (frontend.tsx:172-234) | ✅ Enhancement | Frontend REST API fetching |
| 7 | N/A | `initPrintTemplates()` (frontend.tsx:309-336) | ✅ Enhancement | React hydration initialization |
| 8 | N/A | `hydrateNestedVXBlocks()` (PrintTemplateComponent:227-253) | ✅ Enhancement | Nested search form hydration |
| 9 | N/A | `cleanupHydratedRoots()` (PrintTemplateComponent:258-269) | ✅ Enhancement | React cleanup |

**Assessment:** Voxel widget has **zero JavaScript** — it's purely server-rendered. All FSE JS is enhancement for the React/Gutenberg architecture. No missing parity.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| `\Voxel\print_template()` | ✅ Server-side PHP render | ❌ Not called in FSE | ⚠️ FSE uses REST API instead |
| `/wp/v2/pages/{id}` | N/A | ✅ Frontend + Editor | ✅ Enhancement |
| `/wp/v2/blocks/{id}` | N/A | ✅ Frontend + Editor | ✅ Enhancement |
| `/wp/v2/posts/{id}` | N/A | ✅ Frontend + Editor | ✅ Enhancement |
| `/wp/v2/templates/{id}` | N/A | ✅ Editor only | ✅ Enhancement |
| `/wp/v2/template-parts/{id}` | N/A | ✅ Editor only | ✅ Enhancement |

---

## Style Controls Parity

### Content Tab

| # | Voxel Control | Type | FSE Control | Component | Match |
|---|--------------|------|-------------|-----------|-------|
| 1 | `ts_template_id` (L33-37) | `voxel-post-select` | `templateId` | `PostSelectControl` (ContentTab.tsx:39-47) | ⚠️ See Gap #1 |

### Post Type Support

| Post Type | Voxel | FSE | Match |
|-----------|-------|-----|-------|
| `page` | ✅ `print-template.php:36` | ✅ `ContentTab.tsx:43` | ✅ |
| `elementor_library` | ✅ `print-template.php:36` | ❌ Not included | ❌ See Gap #1 |
| `wp_block` | ❌ Not included | ✅ `ContentTab.tsx:43` | N/A (FSE enhancement) |

### Advanced/Voxel Tabs (FSE Enhancements)

| Tab | Controls | Status |
|-----|----------|--------|
| AdvancedTab | Typography, Spacing, Border, Shadow, Background, etc. (~15 controls) | ✅ Auto-included via `includeAdvancedTab={true}` |
| VoxelTab | Visibility rules, Loop features (~8 controls) | ✅ Auto-included via `includeVoxelTab={true}` |

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Template selection (page) | ✅ `print-template.php:36` | ✅ `ContentTab.tsx:43` | ✅ |
| 2 | Template selection (elementor_library) | ✅ `print-template.php:36` | ❌ Uses `wp_block` instead | ❌ Gap #1 |
| 3 | Server-side rendering | ✅ `template-utils.php:54-84` | ⚠️ `render.php` is passthrough | ⚠️ Gap #2 |
| 4 | Template CSS enqueuing | ✅ `template-utils.php:60,107-119` | ❌ Not implemented | ❌ Gap #2 |
| 5 | Elementor 3.24+ asset system | ✅ `template-utils.php:63-68` | ❌ Not implemented | ❌ Gap #2 |
| 6 | CSS deduplication | ✅ `template-utils.php:86-105` | ❌ Not implemented | ❌ Gap #2 |
| 7 | Editor mode CSS fix | ✅ `template-utils.php:72-79` | N/A (Gutenberg editor) | N/A |
| 8 | Dynamic tags (@post(id)) | ✅ Via voxel-post-select | ✅ `edit.tsx:138`, `frontend.tsx:147` | ✅ |
| 9 | Dynamic tags (complex) | ✅ Server-side resolution | ⚠️ Partial (frontend.tsx:163) | ⚠️ Architectural |
| 10 | Custom classes | ❌ Not in widget | ✅ `customClasses` attribute | ✅ Enhancement |
| 11 | Visibility controls | Via Elementor | ✅ VoxelTab via Block_Loader.php | ✅ |
| 12 | Loop features | Via Elementor | ✅ VoxelTab via Block_Loader.php | ✅ |
| 13 | Editor live preview | ❌ Elementor handles | ✅ `edit.tsx:179-241` | ✅ Enhancement |
| 14 | Loading/error states | ❌ None | ✅ `PrintTemplateComponent.tsx:311-368` | ✅ Enhancement |
| 15 | Nested block hydration | ❌ None | ✅ `PrintTemplateComponent.tsx:227-253` | ✅ Enhancement |
| 16 | Multisite support | ✅ PHP native | ✅ `getRestBaseUrl()` | ✅ |
| 17 | Turbo/PJAX re-init | ❌ None | ✅ `frontend.tsx:346-347` | ✅ Enhancement |

---

## Identified Gaps

### Gap #1: Post Type Mismatch in Template Selector (Severity: Medium)

**Voxel behavior:** Uses `['page', 'elementor_library']` as post types for the template selector (`print-template.php:36`). This allows selecting Elementor library templates (sections, pages, popups) in addition to WordPress pages.

**FSE behavior:** Uses `['page', 'wp_block']` as post types (`ContentTab.tsx:43`). This allows selecting WordPress reusable blocks instead of Elementor library templates.

**Impact:** Users cannot select Elementor library templates from the FSE block inspector. This matters if the site still uses Elementor templates alongside the FSE child theme.

**Fix:**
```typescript
// ContentTab.tsx:43 — Change:
postTypes={['page', 'wp_block']}
// To:
postTypes={['page', 'wp_block', 'elementor_library']}
```

**Assessment:** Since the FSE child theme is replacing Elementor, `wp_block` is the correct FSE equivalent of `elementor_library`. This is an **intentional architectural choice** rather than a bug. However, during the transition period, including `elementor_library` would help users who still have Elementor templates. Consider adding it as a transitional measure.

---

### Gap #2: Missing Server-Side Template CSS Enqueuing (Severity: Low)

**Voxel behavior:** The `\Voxel\print_template()` function (`template-utils.php:54-84`) handles:
1. Enqueuing template-specific CSS via `enqueue_template_css()` (L60)
2. Printing template styles via `wp_print_styles()` (L61)
3. Handling Elementor 3.24+ asset system (L63-68)
4. CSS deduplication via `print_template_css()` (L86-105)
5. Editor mode CSS fix (L72-79)

**FSE behavior:** `render.php` is a passthrough that just returns `$content` (L11). No CSS enqueuing, no Elementor asset handling.

**Impact:** If the FSE block renders an Elementor template (via REST API or server-side), the template's CSS may not be enqueued properly, causing unstyled content.

**Fix:** Enhance `render.php` to call Voxel's CSS enqueuing:
```php
<?php
$template_id = $attributes['templateId'] ?? '';
if ( is_numeric( $template_id ) && function_exists( '\Voxel\enqueue_template_css' ) ) {
    \Voxel\enqueue_template_css( (int) $template_id );
}
return $content;
```

**Assessment:** This is **low severity** because:
1. FSE blocks primarily render pages and reusable blocks (which have their own CSS)
2. Elementor templates are legacy and being phased out
3. The FSE frontend.tsx fetches content via REST API, which includes rendered HTML (with inline styles in many cases)

---

### Gap #3: Unused CSS in voxel-fse.css (Severity: Low)

**Voxel behavior:** Widget has no CSS.

**FSE behavior:** `voxel-fse.css` contains ~2KB of NoUiSlider CSS that is completely unrelated to print-template functionality.

**Impact:** Minor — ships ~2KB of unused CSS to the frontend.

**Fix:** Replace `voxel-fse.css` contents with an empty file or remove the `"style": "file:./style.css"` from `block.json`.

---

## Summary

### What Works Well (~95%)

1. **Template selection** — Fully functional PostSelectControl with search and dynamic tag support
2. **Editor preview** — Live template fetching from 5+ sources (pages, blocks, posts, FSE templates, template parts)
3. **Frontend hydration** — React-based hydration with proper loading/error states
4. **Nested block hydration** — Innovative feature to hydrate search forms within templates
5. **Visibility & Loop** — VoxelTab integration via Block_Loader.php
6. **Dynamic tags** — @post(id) resolution works in both editor and frontend
7. **Multisite support** — Proper REST URL handling
8. **Deprecated versions** — 4 migration handlers for graceful upgrades
9. **TypeScript** — Full type safety with proper interfaces

### Gaps to Fix (~5%)

1. **[Medium]** Post type mismatch: `wp_block` vs `elementor_library` — intentional but consider adding `elementor_library` during transition
2. **[Low]** Missing server-side CSS enqueuing in render.php — affects Elementor template styling
3. **[Low]** Unused NoUiSlider CSS in voxel-fse.css — minor bloat

### Priority Fix Order

1. **Gap #3** (Low effort, immediate cleanup) — Remove unused CSS from voxel-fse.css
2. **Gap #1** (Low effort, medium impact) — Add `elementor_library` to postTypes array for transition period
3. **Gap #2** (Medium effort, low impact) — Add CSS enqueuing in render.php for Elementor templates

---

**Audit Methodology:** Parallel subagent research (Voxel widget + FSE block), cross-referenced with direct file reads. All claims include file paths and line numbers.
