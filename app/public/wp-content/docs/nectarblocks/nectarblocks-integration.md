# NectarBlocks Integration

**Last Updated:** 2026-02-23
**Status:** Complete — 23 parent blocks + 5 child blocks fully integrated
**Test Coverage:** 38 passing tests

---

## 1. Overview

This integration injects Voxel's dynamic data system into NectarBlocks' inspector controls and block toolbar. It allows NB blocks to use Voxel's `@tags()` expressions to populate fields dynamically from post/term/user data, and adds full Voxel Tab controls (sticky, visibility, loop) to every NB block.

**What it enables:**
- Dynamic image sources (`@term(image)` → resolves to an `<img>` preview in the editor canvas)
- Dynamic text, URL, number, and CSS class fields across all NB blocks
- Dynamic icon images in accordion-section titles, button blocks, and icon blocks
- Voxel Tab on every NB block (sticky position, visibility rules, loop element)
- RowSettings (loop + visibility) on NB child/inner blocks
- Toolbar EnableTag button on NB Text and Button blocks for inline dynamic content
- Icon size + color controls for accordion-section, button, and icon blocks
- Server-side tag resolution via `Block_Loader.php`

**Architecture:** MutationObserver + React `createPortal` pattern. No NB source code is modified.

---

## 2. Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  WordPress Filter: blocks.registerBlockType                  │
│  Injects voxelDynamicTags + voxelTabAttributes onto         │
│  parent NB blocks at JS registration time.                  │
│  Injects rowSettingsAttributes onto child NB blocks.        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  WordPress Filter: editor.BlockEdit (3 HOCs)                 │
│                                                              │
│  1. withNBDynamicTags    → parent blocks                    │
│     Wraps with NBDynamicTagInjector (VoxelTab + EnableTags) │
│                                                              │
│  2. withNBAdvancedPanelControls → parent blocks             │
│     Injects WP Advanced panel controls (icon size/color)    │
│                                                              │
│  3. withNBRowSettings    → child blocks                     │
│     Injects RowSettings PanelBody + Dynamic fields          │
│     + EnableTagsToolbarButton for title-bearing children    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  NBDynamicTagInjector                                        │
│                                                              │
│  1. Sidebar MutationObserver                                 │
│     Watches .interface-interface-skeleton__sidebar           │
│     Scans for .nectar-control-row elements                  │
│     Matches by .nectar-control-row__label text content      │
│     Creates portal containers for EnableTagsButton          │
│                                                              │
│  2. Body MutationObserver                                    │
│     Watches document.body for elements outside sidebar      │
│     Targets: Custom Attributes popover, WP Advanced panel   │
│                                                              │
│  3. Voxel Tab Injection                                      │
│     Creates 4th <li> in .nectar-blocks-tab-list             │
│     Creates .voxel-nb-tab-panel container                   │
│     Renders VoxelTab via createPortal                       │
│                                                              │
│  4. Dynamic Image Preview                                    │
│     Resolves @tags() expressions via REST API               │
│     Injects <img> into editor iframe canvas                 │
│     Handles accordion-section, button, and icon block       │
│                                                              │
│  5. Icon Size + Color Effect                                 │
│     Sets --voxel-icon-size and --voxel-icon-color CSS vars  │
│     Applies CSS mask technique for SVG image recoloring     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Block_Loader.php — apply_nb_child_block_features()          │
│                                                              │
│  Server-side rendering for NB child + icon blocks:          │
│  • Injects dynamic tag values into block HTML               │
│  • Applies icon size / color via inline --css-vars          │
│  • Outputs global CSS rules (once per page)                 │
└─────────────────────────────────────────────────────────────┘
```

### Why MutationObserver + createPortal?

NectarBlocks uses `react-tabs` for its inspector sidebar and renders controls dynamically. There is no plugin API for adding custom controls or tabs. The integration must:

1. **Wait for NB controls to render** (they appear asynchronously)
2. **Detect which controls exist** (NB provides no data-attributes; label text is the only reliable identifier)
3. **Inject buttons without breaking NB's React state** (portals render independently)
4. **Survive tab switches** (MutationObserver re-scans when DOM changes)

### Why Client-Side Attribute Injection?

NB registers blocks via JavaScript (`registerBlockType`), not PHP (`register_block_type`). The PHP filter `register_block_type_args` never fires for NB blocks. We use the client-side `blocks.registerBlockType` JS filter instead.

---

## 3. File Structure

```
app/blocks/shared/nb-integration/
├── index.tsx                    # Entry point: registers all 3 WP filters/HOCs
├── NBDynamicTagInjector.tsx     # Main component: observers + portals + image injection
├── nectarBlocksConfig.ts        # Field registry + block lists (config-driven)
├── nb-dynamic-tag-injector.css  # All CSS (portal, preview, Voxel tab, WP components)
└── __tests__/
    └── nb-voxeltab-wiring.test.tsx  # 38 unit tests

app/blocks/Block_Loader.php      # apply_nb_child_block_features() — server-side rendering

app/blocks/shared/controls/
├── EnableTagsToolbarButton.tsx  # Toolbar button for NB Text/Button blocks
└── (TagPreview shared component used by DynamicTagTextControl)
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `index.tsx` | Registers `blocks.registerBlockType` filter (attribute injection) and three `editor.BlockEdit` HOCs (`withNBDynamicTags`, `withNBAdvancedPanelControls`, `withNBRowSettings`). Auto-registers on import. |
| `NBDynamicTagInjector.tsx` | The core HOC component. Manages sidebar observer, body observer, Voxel tab injection, dynamic image preview (accordion/button/icon), icon size+color CSS effect, tag read/write, custom attribute resolution. |
| `nectarBlocksConfig.ts` | Config-driven registry. Maps NB block names to targetable fields. Defines all block name sets (`NB_TARGET_BLOCK_NAMES`, `NB_ROW_SETTINGS_BLOCK_NAMES`, `NB_TOOLBAR_TAG_BLOCK_NAMES`, etc.) and `NB_ADVANCED_PANEL_BLOCKS`. |
| `nb-dynamic-tag-injector.css` | Styles for portal containers, tag preview panels, Voxel tab appearance, and full recreation of `@wordpress/components` Emotion CSS (since portals render outside the editor iframe where Emotion injects styles). |
| `Block_Loader.php` | `apply_nb_child_block_features()` handles server-side dynamic tag resolution and icon size/color CSS injection for NB child blocks, icon block, and button block. |

---

## 4. Registered Blocks

### 4.1 Parent Blocks (23) — VoxelTab + EnableTags

These get the full VoxelTab (as 4th inspector tab) and EnableTag buttons injected into their existing NB inspector fields.

| Block | Fields with EnableTags |
|-------|----------------------|
| `nectar-blocks/image` | Image source (image), Title (text), Alt Text (text), Link URL (url), Z-Index (number) |
| `nectar-blocks/button` | Z-Index (number) + Toolbar EnableTag for content + Advanced panel (icon size, icon color) |
| `nectar-blocks/text` | Z-Index (number) + Toolbar EnableTag for content |
| `nectar-blocks/star-rating` | Z-Index (number), Rating value (number) |
| `nectar-blocks/accordion` | Z-Index only |
| `nectar-blocks/carousel` | Z-Index only |
| `nectar-blocks/divider` | Z-Index only |
| `nectar-blocks/flex-box` | Z-Index only |
| `nectar-blocks/icon` | Z-Index only + Advanced panel (icon color) |
| `nectar-blocks/icon-list` | Z-Index only |
| `nectar-blocks/image-gallery` | Z-Index only |
| `nectar-blocks/image-grid` | Z-Index only |
| `nectar-blocks/milestone` | Z-Index only |
| `nectar-blocks/post-content` | Z-Index only |
| `nectar-blocks/post-grid` | Z-Index only |
| `nectar-blocks/row` | Z-Index only |
| `nectar-blocks/scrolling-marquee` | Z-Index only |
| `nectar-blocks/tabs` | Z-Index only |
| `nectar-blocks/taxonomy-grid` | Z-Index only |
| `nectar-blocks/taxonomy-terms` | Z-Index only |
| `nectar-blocks/testimonial` | Z-Index only |
| `nectar-blocks/video-lightbox` | Z-Index only |
| `nectar-blocks/video-player` | Z-Index only |

### 4.2 Child/Inner Blocks (5) — RowSettings

These get the RowSettings PanelBody (loop + visibility rules), Dynamic tag fields (title, CSS ID) in the WP Advanced panel, and optional toolbar EnableTag for their title.

| Block | Dynamic Fields | Toolbar Title Button |
|-------|---------------|---------------------|
| `nectar-blocks/accordion-section` | Title (HTML), CSS ID | ✅ Yes |
| `nectar-blocks/tab-section` | Title (HTML), CSS ID | ✅ Yes |
| `nectar-blocks/icon-list-item` | Title (HTML) | ✅ Yes |
| `nectar-blocks/column` | CSS ID | ❌ No |
| `nectar-blocks/carousel-item` | CSS ID | ❌ No |

---

## 5. EnableTags Controls Detail

### 5.1 Inline Inspector Controls

These controls add an EnableTagsButton next to NB's inspector fields. When a tag is set, a dark TagPreview panel replaces the control.

| # | Field Key | Label | NB Tab | Type | Placement | Block |
|---|-----------|-------|--------|------|-----------|-------|
| 1 | `imageSource` | Image Source | Layout | `image` | `corner` | nectar-blocks/image |
| 2 | `title` | Title | Layout | `text` | `inline` | nectar-blocks/image |
| 3 | `altText` | Alt Text | Layout | `text` | `inline` | nectar-blocks/image |
| 4 | `linkUrl` | Link URL | Layout | `url` | `inline` | nectar-blocks/image |
| 5 | `zIndex` | Z-Index | Style | `number` | `corner` | All parent blocks |
| 6 | `rating` | Rating | Layout | `number` | `corner` | nectar-blocks/star-rating |

**Z-Index nested field:** The "Value" sub-row is nested inside the "Z-Index" parent control row. Uses `parentLabelText: 'Z-Index'` to scope the match. Tag preview spans the parent's component area.

### 5.2 Body-Observer Controls (Outside Sidebar)

| # | Field Key Pattern | Location | Type | Description |
|---|-------------------|----------|------|-------------|
| 7 | `customAttr_{id}_name` | NB Custom Attributes Popover | `text` | Repeater item name field |
| 8 | `customAttr_{id}_value` | NB Custom Attributes Popover | `text` | Repeater item value field |
| 9 | `cssClasses` | WP Advanced Panel | `css-class` | WordPress "Additional CSS class(es)" input |

### 5.3 TagPreview Layout

When a tag is set, a dark panel replaces the NB control:

```
┌──────────────────────────────────────┐
│ Label Text             [EnableTag]   │
│ ┌──────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  Dark background
│ │ @term(image)                     │ │  Tag expression
│ │ ─────────────────────────────── │ │  Divider
│ │  [EDIT TAGS]      [DISABLE TAGS] │ │  Left / Right aligned
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

EDIT TAGS is left-aligned, DISABLE TAGS is right-aligned.

---

## 6. VoxelTab Integration

### Tab Injection

NB uses `react-tabs` for its inspector tabs. The integration creates a 4th tab:

```
Before:  [Layout] [Style] [Motion/FX]
After:   [Layout] [Style] [Motion/FX] [Voxel]
```

**Tab switching strategy:**
- NB's tabs use `react-tabs` which manages its own `--selected` class
- We do NOT fight `react-tabs` by removing its selected state
- Instead, we use `data-voxel-tab-active` on the tab list container
- CSS hides NB's `::after` marker and tab panels when Voxel tab is active
- When an NB tab is clicked, we remove our active state and let `react-tabs` resume

**31 attributes injected** (from `voxelTabAttributes`):

| Section | Attributes |
|---------|------------|
| **Sticky Position** | `stickyEnabled`, `stickyDesktop/Tablet/Mobile`, `stickyTop/Left/Right/Bottom` (+ responsive + unit variants) — 19 total |
| **Visibility** | `visibilityBehavior`, `visibilityRules` |
| **Loop Element** | `loopEnabled`, `loopSource`, `loopProperty`, `loopLimit`, `loopOffset` |

### CSS Recreation

VoxelTab renders `@wordpress/components` via `createPortal` into the NB inspector sidebar. These components use Emotion CSS-in-JS that only injects into the block editor iframe. The CSS file contains a full recreation of all needed `@wordpress/components` styles.

---

## 7. Toolbar EnableTag (Text + Button Blocks)

NB Text and Button blocks get an `EnableTagsToolbarButton` in the block toolbar for dynamic inline content.

### UX Flow

```
[gradient button] → click → DynamicTagBuilder modal opens
                             (pre-filled with block's current text)
                  ← save  ←

[dark button] → click → Popover: stored expression + EDIT TAGS + DISABLE TAGS
                         EDIT TAGS → modal reopens
                         DISABLE TAGS → returns to gradient button
```

### Implementation

- Attribute: `voxelDynamicContent` (type: string) stored on the block
- Component: `EnableTagsToolbarButton` in `BlockControls group="other"`
- Child title blocks (`accordion-section`, `tab-section`, `icon-list-item`): toolbar button uses `voxelDynamicTitle` instead, which is bidirectionally synced to the native NB title attribute

### PHP Resolution

`Block_Loader.php` resolves `voxelDynamicContent` server-side and replaces the block's rendered inner text with the resolved output.

---

## 8. Advanced Panel Controls

Some parent blocks get extra controls injected into WordPress's built-in "Advanced" accordion panel.

### Configuration (`NB_ADVANCED_PANEL_BLOCKS`)

| Block | Controls |
|-------|---------|
| `nectar-blocks/button` | "Edit Label as HTML" (DynamicTagTextControl), "Icon Size" (ResponsiveRangeControlWithDropdown), "Icon Color" (ColorPickerControl) |
| `nectar-blocks/icon` | "Icon Color" (ColorPickerControl) |

### Rendering

The `withNBAdvancedPanelControls` HOC reads the block's entry in `NB_ADVANCED_PANEL_BLOCKS` and renders the appropriate control:
- `controlType: 'text'` (default) → `DynamicTagTextControl`
- `controlType: 'color'` → `ColorPickerControl`
- `controlType: 'range'` → `ResponsiveRangeControlWithDropdown` (responsive: desktop/tablet/mobile + unit)

---

## 9. Dynamic Icon Image System

Several NB blocks support a dynamic icon image (uploaded via Voxel's image tag, e.g. `@term(icon)`). The icon tag key is `iconImage` in `voxelDynamicTags`.

### Icon Injection by Block Type

| Block | Injection Target | DOM Position |
|-------|-----------------|-------------|
| `nectar-blocks/accordion-section` | `.nectar-blocks-accordion-section__title` | Before first child (before title text) |
| `nectar-blocks/button` | `<a>` inside `.nectar-blocks-button` | After `.nectar-blocks-button__text` span |
| `nectar-blocks/icon` | `.nectar-blocks-icon__inner` | Before first child (replaces native icon visually) |

**Button block alignment:** NB's `iconAlignment` attribute (`"left"` or `"right"`) applies `flex-direction: row-reverse` on the `<a>` tag. The dynamic `<img>` is always placed after the text span in the DOM — CSS handles visual order, so left/right alignment works automatically.

### Icon Size

- **Default size**: Accordion and Button get a 20px default. Icon block fills its `.nectar-blocks-icon__inner` container (NB's own size controls apply).
- **Size control**: `ResponsiveRangeControlWithDropdown` in the WP Advanced panel (accordion-section and button only). Stores `voxelIconSize` / `voxelIconSize_tablet` / `voxelIconSize_mobile` / `voxelIconSizeUnit`.
- **CSS custom property**: `--voxel-icon-size` is set on the block element and overrides the default via compound CSS selectors.

### Icon Color

A `ColorPickerControl` in the WP Advanced panel stores `voxelIconColor`. Color is applied via two mechanisms:

1. **Native NB icon (SVG font icon):** CSS `color: var(--voxel-icon-color)` on `.nectar-component__icon`
2. **Dynamic `<img>` (Voxel icon image):** CSS mask technique — the image src becomes a `mask-image`, then `background-color` provides the tint. `object-position: -9999px` hides the original image pixels. A `data-voxel-colored="true"` attribute marks images that have had color applied (used by PHP for frontend CSS scoping).

### CSS Selector Rule (Critical)

In the NB editor, `[data-voxel-icon-size]` and the block's own class (e.g. `.nectar-blocks-button`) are on the **same** DOM element. Use compound selectors (no space) — not descendant selectors (space):

```css
/* ✅ Correct — compound selector (same element) */
[data-voxel-icon-size].nectar-blocks-button a > .voxel-nb-icon-image-preview { ... }

/* ❌ Wrong — descendant (would require separate parent element) */
[data-voxel-icon-size] .nectar-blocks-button a > .voxel-nb-icon-image-preview { ... }
```

---

## 10. RowSettings for Child Blocks

Child NB blocks (`accordion-section`, `tab-section`, `column`, `icon-list-item`, `carousel-item`) receive a full `RowSettings` PanelBody injected via `<InspectorControls>`.

**Attributes injected into child blocks:**

```typescript
{
  loopEnabled, loopSource, loopProperty, loopLimit, loopOffset,  // loop
  visibilityBehavior, visibilityRules,                            // visibility
  voxelDynamicTitle, voxelDynamicCssId,                          // dynamic fields
  voxelIconSize, voxelIconSize_tablet, voxelIconSize_mobile,     // icon size (accordion-section)
  voxelIconSizeUnit, voxelIconColor,                             // icon size unit + color
  voxelDynamicTags,                                              // CSS Classes / Custom ID
}
```

The `RowSettings` component renders the loop section and visibility rules section in a collapsible PanelBody within the WP inspector.

---

## 11. PHP Server-Side Rendering

`Block_Loader.php` → `apply_nb_child_block_features()` handles all NB blocks that need server-side processing.

**Supported blocks:** `nectar-blocks/accordion-section`, `nectar-blocks/icon`, `nectar-blocks/button`

**What it does per block:**

1. **Dynamic tag resolution** — reads `voxelDynamicTags` and resolves expressions (title, CSS ID, etc.) via the VoxelScript parser
2. **Icon size** — injects `--voxel-icon-size` as inline CSS custom property; generates responsive CSS (`@media` queries) for tablet/mobile overrides
3. **Icon color** — injects `--voxel-icon-color` as inline CSS custom property
4. **Global CSS** — outputs a `<style>` block once per page with all the icon styling rules (size selectors, color selectors, mask technique for SVG images, default sizes)

**CSS output targets (frontend):**

| Selector | Purpose |
|----------|---------|
| `.nectar-blocks-accordion-section[style*="--voxel-icon-size"] .nectar-blocks-icon__inner` | Native icon size |
| `.nectar-blocks-accordion-section[style*="--voxel-icon-color"] ... .nectar-component__icon` | Native icon color |
| `.nectar-blocks-accordion-section[style*="--voxel-icon-color"] ... img[data-voxel-colored="true"]` | Dynamic icon color (mask) |
| `.nectar-blocks-button[style*="--voxel-icon-size"] a > img` | Button dynamic icon size |
| `.nectar-blocks-button[style*="--voxel-icon-color"] a > img[data-voxel-colored="true"]` | Button dynamic icon color (mask) |
| `.nectar-blocks-icon[style*="--voxel-icon-color"] .nectar-blocks-icon__inner .nectar-component__icon` | Icon block native color |
| `.nectar-blocks-icon[style*="--voxel-icon-color"] .nectar-blocks-icon__inner > img[data-voxel-colored="true"]` | Icon block dynamic color (mask) |
| `.nectar-blocks-button a > img.voxel-nb-icon-image-preview` | Button icon default 20px |
| `.nectar-blocks-accordion-section ... > img` | Accordion icon default 20px |

---

## 12. Custom Attribute Repeater

The most complex integration handles NB's custom attribute repeater. Each repeater item has a unique `id` that NB assigns internally.

### Flow

```
1. User clicks a custom attribute item in the sidebar
   → Click handler captures the item's index via event delegation
   → activeCustomAttrIndexRef stores the clicked index

2. NB opens a popover (.nectar__link-control__custom-attr__popover)
   → Body observer detects the popover appearing
   → Reads the item's `id` from link.customAttributes[index]
   → Creates portal containers for "Attribute" and "Value" labels
   → Field keys: customAttr_{id}_name, customAttr_{id}_value

3. User sets a tag via DynamicTagBuilder
   → Tag saved to voxelDynamicTags[fieldKey]
   → Resolved value written back to NB's native block attribute
     (link.customAttributes[i].attribute or .value)
   → Sidebar shows resolved text instead of "Empty"

4. NB clears resolved values (e.g., when adding a new attribute)
   → Block store subscriber detects emptied fields
   → Re-resolves all tag-bound custom attribute fields
   → Writes resolved values back (resync mechanism)
```

---

## 13. Data Storage

All dynamic tag data is stored in a single block attribute:

```json
{
  "voxelDynamicTags": {
    "imageSource": "@tags()@term(image)@endtags()",
    "iconImage": "@tags()@term(icon)@endtags()",
    "title": "@tags()@term(title)@endtags()",
    "customAttr_abc123_name": "@tags()data-author@endtags()",
    "customAttr_abc123_value": "@tags()@post(:author_name)@endtags()"
  }
}
```

VoxelTab + icon attributes stored individually:

```json
{
  "stickyEnabled": true,
  "stickyDesktop": "sticky",
  "visibilityBehavior": "show",
  "visibilityRules": [],
  "loopEnabled": false,
  "voxelDynamicContent": "@tags()@term(title)@endtags()",
  "voxelDynamicTitle": "@tags()@term(title)@endtags()",
  "voxelDynamicCssId": "",
  "voxelIconSize": 24,
  "voxelIconSize_tablet": 20,
  "voxelIconSizeUnit": "px",
  "voxelIconColor": "#ff5722"
}
```

---

## 14. Adding a New NB Block

### Step 1: Add to Registry (parent blocks)

Edit `nectarBlocksConfig.ts`, add to `nectarBlocksRegistry`:

```typescript
{
  blockName: 'nectar-blocks/heading',
  fields: [
    {
      fieldKey: 'headingText',
      label: 'Heading Text',
      labelText: 'Text',       // exact label text in NB's DOM
      tab: 'layout',
      type: 'text',
    },
    {
      fieldKey: 'zIndex',
      label: 'Z-Index',
      labelText: 'Value',
      tab: 'style',
      type: 'number',
      parentLabelText: 'Z-Index',
    },
  ],
},
```

### Step 2: Add to Child Block Config (if inner block)

Add to `NB_ROW_SETTINGS_BLOCKS` array, and optionally add dynamic fields to `NB_DYNAMIC_TAG_FIELDS` and/or `NB_CHILD_TITLE_BLOCK_NAMES`.

### Step 3: Add Advanced Panel Controls (if needed)

Add to `NB_ADVANCED_PANEL_BLOCKS` with `controlType: 'text' | 'color' | 'range'`.

### Step 4: Verify Label Text

Open the Site Editor, select the NB block, inspect the sidebar. Find `.nectar-control-row__label` elements and note their exact text content.

---

## 15. Testing

### Test File

`app/blocks/shared/nb-integration/__tests__/nb-voxeltab-wiring.test.tsx`

### Test Suites (38 tests)

| Suite | Tests | What It Verifies |
|-------|-------|------------------|
| Attribute Registration | 5 | `blocks.registerBlockType` filter adds `voxelDynamicTags` + all 31 `voxelTabAttributes` |
| Config & Registry | 5 | `nectarBlocksRegistry` structure, `NB_TARGET_BLOCK_NAMES` set, `getNBBlockConfig()` lookup |
| HOC Wiring | 5 | `editor.BlockEdit` HOC renders `NBDynamicTagInjector` for target blocks, skips non-target blocks |
| VoxelTab Portal Rendering | 11 | VoxelTab renders all 3 accordion sections with correct controls |
| Complete Wiring Chain | 12 | End-to-end: attribute injection → HOC wrapping → VoxelTab rendering → `setAttributes` |

```bash
# Run NB integration tests only
npx vitest run app/blocks/shared/nb-integration/
```

---

## 16. Known Limitations

1. **Label-based matching is fragile.** If NB changes its label text, the match breaks. Mitigation: version-pinned NB plugin.

2. **No PHP attribute registration.** NB registers blocks client-side. VoxelTab attributes are editor-only; server-side rendering reads them from the serialized block markup.

3. **Emotion CSS recreation.** The CSS file recreates `@wordpress/components` styles for portal-rendered content. Verified against WP 6.7.

4. **Icon color on non-SVG images.** The CSS mask technique works best with SVG/transparent PNGs. Opaque raster images won't look right with color applied.

---

## 17. Reference

| Resource | Path |
|----------|------|
| Entry point | `app/blocks/shared/nb-integration/index.tsx` |
| Main component | `app/blocks/shared/nb-integration/NBDynamicTagInjector.tsx` |
| Field registry | `app/blocks/shared/nb-integration/nectarBlocksConfig.ts` |
| CSS | `app/blocks/shared/nb-integration/nb-dynamic-tag-injector.css` |
| Tests | `app/blocks/shared/nb-integration/__tests__/nb-voxeltab-wiring.test.tsx` |
| PHP rendering | `app/blocks/Block_Loader.php` → `apply_nb_child_block_features()` |
| VoxelTab component | `app/blocks/shared/controls/VoxelTab.tsx` |
| RowSettings component | `app/blocks/shared/controls/RowSettings.tsx` |
| EnableTagsButton | `app/blocks/shared/controls/EnableTagsButton.tsx` |
| EnableTagsToolbarButton | `app/blocks/shared/controls/EnableTagsToolbarButton.tsx` |
| DynamicTagBuilder | `app/blocks/shared/dynamic-tags/` |
