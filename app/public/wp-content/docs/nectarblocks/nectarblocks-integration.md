# NectarBlocks Integration

**Last Updated:** 2026-02-21
**Status:** Phase 1 Complete (NB Image block)
**Test Coverage:** 38 passing tests

---

## 1. Overview

This integration injects Voxel's dynamic data system (EnableTags + VoxelTab) into NectarBlocks' inspector controls. It allows NB blocks to use Voxel's `@tags()` expressions to populate fields dynamically from post/term/user data.

**What it enables:**
- Dynamic image sources (e.g., `@term(image)` for term card images)
- Dynamic text fields (title, alt text, link URL)
- Dynamic custom HTML attributes (for data binding)
- Voxel Tab controls (sticky position, visibility rules, loop element)

**Architecture:** MutationObserver + React `createPortal` pattern. No NB source code is modified.

---

## 2. Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  WordPress Filter: blocks.registerBlockType                  │
│  Injects voxelDynamicTags + voxelTabAttributes onto NB      │
│  blocks at registration time (client-side only)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  WordPress Filter: editor.BlockEdit                          │
│  Wraps NB blocks with NBDynamicTagInjector HOC              │
│  Passes attributes + setAttributes through                  │
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
├── index.tsx                    # Entry point: registers WP filters
├── NBDynamicTagInjector.tsx     # Main component: observers + portals
├── nectarBlocksConfig.ts        # Field registry (config-driven)
├── nb-dynamic-tag-injector.css  # All CSS (portal, preview, Voxel tab, WP components)
└── __tests__/
    └── nb-voxeltab-wiring.test.tsx  # 38 unit tests
```

### File Responsibilities

| File | Purpose |
|------|---------|
| `index.tsx` | Auto-registers `blocks.registerBlockType` filter (attribute injection) and `editor.BlockEdit` filter (HOC wrapping). Imported by block entry points. |
| `NBDynamicTagInjector.tsx` | The HOC component. Manages sidebar observer, body observer, Voxel tab injection, dynamic image preview, tag read/write, custom attribute resolution. |
| `nectarBlocksConfig.ts` | Config-driven registry. Maps NB block names to targetable fields. Each field defines `fieldKey`, `labelText` (for DOM matching), `type`, `placement`, and optional `parentLabelText`. |
| `nb-dynamic-tag-injector.css` | Styles for portal containers, tag preview panels, Voxel tab appearance, and full recreation of `@wordpress/components` Emotion CSS (since portals render outside the editor iframe where Emotion injects styles). |

---

## 4. Integrated Controls Map

### 4.1 EnableTags Controls (Dynamic Data)

These controls add an EnableTagsButton next to NB's inspector fields. When a tag is set, a dark preview panel replaces the control showing the tag expression with EDIT/DISABLE actions.

| # | Field Key | Label | NB Tab | Type | Placement | Parent Label | Description |
|---|-----------|-------|--------|------|-----------|--------------|-------------|
| 1 | `imageSource` | Image Source | Layout | `image` | `corner` | — | Image upload control. Resolves to attachment ID, then fetches image URL via WP REST API. Injects `<img>` preview into editor iframe canvas. |
| 2 | `title` | Title | Layout | `text` | `inline` | — | Text input for image title. Tag expression replaces the text value. |
| 3 | `altText` | Alt Text | Layout | `text` | `inline` | — | Text input for image alt attribute. |
| 4 | `linkUrl` | Link URL | Layout | `url` | `inline` | — | URL input inside NB's link control. Matches label text "URL". |
| 5 | `zIndex` | Z-Index | Style | `number` | `corner` | `Z-Index` | **Nested field.** The "Value" sub-row is nested inside the "Z-Index" parent control row. Uses `parentLabelText: 'Z-Index'` to scope the match. Tag preview spans the parent's component area. |

#### Body-Observer Controls (Outside Sidebar)

These controls live outside the inspector sidebar (in popovers or WP's Advanced panel) and are managed by the body MutationObserver.

| # | Field Key Pattern | Label | Location | Type | Description |
|---|-------------------|-------|----------|------|-------------|
| 6 | `customAttr_{id}_name` | Custom Attribute Name | NB Custom Attributes Popover | `text` | Repeater item. Each custom attribute has a unique `id` assigned by NB. The `{id}` in the field key is the item's `id` from `link.customAttributes[]`. Click tracking on sidebar items identifies which item is being edited. |
| 7 | `customAttr_{id}_value` | Custom Attribute Value | NB Custom Attributes Popover | `text` | Same repeater item, value field. When a tag is saved, the resolved value is written back to NB's native `link.customAttributes[].value` so the sidebar shows the resolved text instead of "Empty". |
| 8 | `cssClasses` | Additional CSS class(es) | WP Advanced Panel | `css-class` | WordPress core's "Additional CSS class(es)" input in the Advanced panel. Uses `corner` placement on the `label` element's parent wrapper. |

### 4.2 VoxelTab Controls (Inspector Tab)

The Voxel tab is injected as a 4th tab in NB's `.nectar-blocks-tab-list`, alongside Layout, Style, and Motion/FX. It renders the shared `VoxelTab` component via `createPortal`.

**31 attributes injected** (from `voxelTabAttributes`):

| Section | Attributes | Description |
|---------|------------|-------------|
| **Sticky Position** | `stickyEnabled`, `stickyDesktop/Tablet/Mobile`, `stickyTop/Left/Right/Bottom` (+ `_tablet`, `_mobile`, `Unit` variants) | 19 attributes. Matches Voxel's widget-controller.php sticky position feature. |
| **Visibility** | `visibilityBehavior`, `visibilityRules` | 2 attributes. Show/hide element based on configurable rules (user role, post field conditions, etc.). |
| **Loop Element** | `loopEnabled`, `loopSource`, `loopProperty`, `loopLimit`, `loopOffset` | 5 attributes. Loop this element based on a data source (e.g., `@author(role)`). |

---

## 5. How EnableTags Integration Works

### Field Matching

NB controls use this DOM structure:

```html
<div class="nectar-control-row">
  <div class="nectar-control-row__label">
    <div class="nectar-control-row__reset-wrap">
      Label Text              <!-- or wrapped in .nectar__dynamic-data-selector__inline -->
    </div>
  </div>
  <div class="nectar-control-row__component">
    <input/textarea/select>   <!-- the actual control -->
  </div>
</div>
```

The integration matches fields by extracting text content from `.nectar-control-row__label`:

```typescript
// getLabelText() handles two NB label formats:
// 1. Plain: .nectar-control-row__reset-wrap > "Label Text"
// 2. Dynamic: .nectar__dynamic-data-selector__inline > span > "Label Text"
```

### Placement Types

**Inline** (`placement: 'inline'` or default): Button appended inside the label element, sitting inline with the label text.

```
┌──────────────────────────────────────┐
│ Label Text  [EnableTag]              │  ← button next to label
│ ┌──────────────────────────────────┐ │
│ │ [input field]                    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

**Corner** (`placement: 'corner'`): Button absolutely positioned in the top-right of `.nectar-control-row__component`.

```
┌──────────────────────────────────────┐
│ Label Text                           │
│ ┌──────────────────────────────────┐ │
│ │ [image upload area]  [EnableTag] │ │  ← button in corner
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Tag Preview

When a tag is set on a field, a dark preview panel replaces the NB control:

```
┌──────────────────────────────────────┐
│ Label Text             [EnableTag]   │
│ ┌──────────────────────────────────┐ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  Dark background
│ │ @term(image)                     │ │  Tag expression
│ │ ─────────────────────────────── │ │  Divider
│ │   EDIT TAGS    │   DISABLE TAGS  │ │  Action buttons
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Nested Fields (parentLabelText)

Some NB controls are nested inside a parent control row. For example, the Z-Index "Value" sub-row is inside the "Z-Index" parent:

```html
<div class="nectar-control-row">          <!-- parent: label = "Z-Index" -->
  <div class="nectar-control-row__label">Z-Index</div>
  <div class="nectar-control-row__component">
    <div class="nectar-control-row">      <!-- child: label = "Value" -->
      <div class="nectar-control-row__label">Value</div>
      <div class="nectar-control-row__component">
        <input type="number">
      </div>
    </div>
  </div>
</div>
```

The config uses `parentLabelText: 'Z-Index'` to ensure the "Value" label match is scoped to the correct parent. The tag preview renders in the **parent's** component area for full-width display.

---

## 6. How VoxelTab Integration Works

### Tab Injection

NB uses `react-tabs` for its inspector tabs. The integration creates a 4th tab:

```
Before:  [Layout] [Style] [Motion/FX]
After:   [Layout] [Style] [Motion/FX] [Voxel]
```

**Tab switching strategy:**

- NB's tabs use `react-tabs` which manages its own `--selected` class
- We do NOT fight `react-tabs` by removing its selected state
- Instead, we use `data-voxel-tab-active` attribute on the tab list container
- CSS hides NB's `::after` marker and tab panels when Voxel tab is active
- When an NB tab is clicked, we remove our active state and let `react-tabs` resume

### CSS Recreation

VoxelTab renders `@wordpress/components` (ToggleControl, SelectControl, RangeControl, Button) via `createPortal` into the NB inspector sidebar. These components use Emotion CSS-in-JS that only injects `<style>` tags inside the block editor iframe. Since our portal renders on the main admin page, those styles are missing.

The CSS file (`nb-dynamic-tag-injector.css`) contains a full recreation of all needed `@wordpress/components` styles, extracted from browser computed styles and verified against the WordPress source.

---

## 7. Custom Attribute Repeater

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

### Why Resync?

NB resets all custom attribute `attribute`/`value` fields to `""` when the user clicks "Add Link Attribute". Our block store subscriber detects when a tag-bound field's NB-native value becomes empty and re-resolves the tag expression to restore the displayed value.

---

## 8. Dynamic Image Preview

When `imageSource` has a tag set:

1. **Resolve tag** → POST to `/voxel-fse/v1/dynamic-data/render`
2. **Extract attachment ID** from rendered output
3. **Fetch image URL** → GET `/wp/v2/media/{id}?context=edit`
4. **Inject `<img>`** into the editor iframe's block element (`[data-block="{clientId}"]`)
5. **Hide NB placeholder** via `[data-voxel-has-dynamic-image="true"] .components-placeholder { display: none }`

A MutationObserver keeps the placeholder hidden even if NB's React re-renders restore it.

---

## 9. Data Storage

All dynamic tag data is stored in a single block attribute:

```json
{
  "voxelDynamicTags": {
    "imageSource": "@tags()@term(image)@endtags()",
    "title": "@tags()@term(title)@endtags()",
    "customAttr_abc123_name": "@tags()data-author@endtags()",
    "customAttr_abc123_value": "@tags()@post(:author_name)@endtags()"
  }
}
```

VoxelTab attributes are stored as individual block attributes:

```json
{
  "stickyEnabled": true,
  "stickyDesktop": "sticky",
  "visibilityBehavior": "show",
  "visibilityRules": [],
  "loopEnabled": false,
  "loopLimit": "5"
}
```

---

## 10. Adding a New NB Block

### Step 1: Add to Registry

Edit `nectarBlocksConfig.ts`:

```typescript
export const nectarBlocksRegistry: NBBlockConfig[] = [
  {
    blockName: 'nectar-blocks/image',
    fields: [ /* ... existing ... */ ],
  },
  // Add new block:
  {
    blockName: 'nectar-blocks/heading',
    fields: [
      {
        fieldKey: 'headingText',
        label: 'Heading Text',
        labelText: 'Text',        // exact label text in NB's DOM
        tab: 'layout',
        type: 'text',
        placement: 'inline',       // optional, defaults to 'inline'
      },
      {
        fieldKey: 'linkUrl',
        label: 'Link URL',
        labelText: 'URL',
        tab: 'layout',
        type: 'url',
      },
    ],
  },
];
```

`NB_TARGET_BLOCK_NAMES` is computed automatically from the registry.

### Step 2: Verify Label Text

Open the Site Editor, select the NB block, and inspect the sidebar. Find the `.nectar-control-row__label` elements and note their exact text content. Use this as the `labelText` value.

### Step 3: Handle Special Cases

- **Nested fields**: Set `parentLabelText` to scope the label match
- **Image fields**: Set `type: 'image'` and `placement: 'corner'`
- **Repeater items**: Handled automatically by the body observer if they appear in a `.nectar__link-control__custom-attr__popover`

### Step 4: Test

Run the test suite:

```bash
cd app/public/wp-content/themes/voxel-fse
npx vitest run app/blocks/shared/nb-integration/__tests__/
```

---

## 11. Testing

### Test File

`app/blocks/shared/nb-integration/__tests__/nb-voxeltab-wiring.test.tsx`

### Test Suites (38 tests)

| Suite | Tests | What It Verifies |
|-------|-------|------------------|
| Attribute Registration | 5 | `blocks.registerBlockType` filter adds `voxelDynamicTags` + all 31 `voxelTabAttributes` |
| Config & Registry | 5 | `nectarBlocksRegistry` structure, `NB_TARGET_BLOCK_NAMES` set, `getNBBlockConfig()` lookup |
| HOC Wiring | 5 | `editor.BlockEdit` HOC renders `NBDynamicTagInjector` for target blocks, skips non-target blocks |
| VoxelTab Portal Rendering | 11 | VoxelTab renders all 3 accordion sections (Widget options, Visibility, Loop element) with correct controls |
| Complete Wiring Chain | 12 | End-to-end: attribute injection → HOC wrapping → VoxelTab rendering → attribute changes via `setAttributes` |

### Running Tests

```bash
# Run NB integration tests only
npx vitest run app/blocks/shared/nb-integration/

# Run with coverage
npx vitest run --coverage app/blocks/shared/nb-integration/
```

---

## 12. Known Limitations

1. **Label-based matching is fragile.** If NB changes its label text (e.g., "Image" → "Image Source"), the match breaks. Mitigation: version-pinned NB plugin.

2. **No PHP attribute registration.** Since NB registers blocks client-side, VoxelTab attributes are only available in the editor. Server-side rendering must read them from the serialized block markup.

3. **Emotion CSS recreation.** The CSS file recreates `@wordpress/components` styles for portal-rendered content. WP core updates may change these styles. The CSS was extracted and verified against WP 6.7.

4. **Single block support.** Currently only `nectar-blocks/image` is in the registry. Adding more blocks requires browser discovery of their DOM structure and label texts.

---

## 13. Reference

| Resource | Path |
|----------|------|
| Entry point | `app/blocks/shared/nb-integration/index.tsx` |
| Main component | `app/blocks/shared/nb-integration/NBDynamicTagInjector.tsx` |
| Field registry | `app/blocks/shared/nb-integration/nectarBlocksConfig.ts` |
| CSS | `app/blocks/shared/nb-integration/nb-dynamic-tag-injector.css` |
| Tests | `app/blocks/shared/nb-integration/__tests__/nb-voxeltab-wiring.test.tsx` |
| VoxelTab component | `app/blocks/shared/controls/VoxelTab.tsx` |
| EnableTagsButton | `app/blocks/shared/controls/EnableTagsButton.tsx` |
| DynamicTagBuilder | `app/blocks/shared/dynamic-tags/` |
