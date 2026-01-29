# Nested Tabs Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** Elementor NestedTabs widget (extended by Voxel)

## Summary

The nested-tabs block has **100% parity** with Voxel's implementation which extends Elementor's NestedTabs widget. All core features are implemented: tab items with titles and icons, flexible tab positioning (top/bottom/left/right), keyboard navigation, responsive breakpoints with accordion fallback, and complete style controls for all states (normal/hover/active).

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| nested-tabs.php (142 lines) | Voxel Nested Tabs Widget | **Extends Elementor** |
| Elementor\Modules\NestedTabs\Widgets\NestedTabs | Base Elementor Widget | Core Elementor class |

The widget extends Elementor's NestedTabs with:
- Loop support (`_voxel_loop`)
- Dynamic data support (`@tags()` syntax in titles)
- Integration with Voxel's design system

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/nested-tabs.php` (142 lines)
- **Base widget:** `Elementor\Modules\NestedTabs\Widgets\NestedTabs`
- **Widget ID:** nested-tabs
- **Framework:** Elementor (extended)
- **Purpose:** Tabbed content containers with flexible layout

### Voxel HTML Structure

```html
<div class="e-n-tabs" data-widget-number="1">
  <!-- Tab Titles -->
  <div class="e-n-tabs-heading" role="tablist" aria-orientation="horizontal">
    <div class="e-n-tab-title e-active" id="e-n-tab-title-1001" role="tab" aria-selected="true" aria-controls="e-n-tab-content-1001" tabindex="0">
      <span class="e-n-tab-icon">
        <i class="fas fa-home"></i>
      </span>
      <span class="e-n-tab-title-text">Tab #1</span>
    </div>
    <div class="e-n-tab-title" id="e-n-tab-title-1002" role="tab" aria-selected="false" aria-controls="e-n-tab-content-1002" tabindex="-1">
      <span class="e-n-tab-icon">
        <i class="fas fa-user"></i>
      </span>
      <span class="e-n-tab-title-text">Tab #2</span>
    </div>
  </div>

  <!-- Tab Content -->
  <div class="e-n-tabs-content">
    <div class="e-con e-active" id="e-n-tab-content-1001" role="tabpanel" aria-labelledby="e-n-tab-title-1001">
      <!-- InnerBlocks content -->
    </div>
    <div class="e-con" id="e-n-tab-content-1002" role="tabpanel" aria-labelledby="e-n-tab-title-1002" hidden>
      <!-- InnerBlocks content -->
    </div>
  </div>
</div>
```

### Data Flow (from Voxel PHP)

- Extends Elementor's NestedTabs control structure
- Adds `_voxel_loop` for loop context support
- Renders tab items from repeater
- Applies Elementor-style CSS classes
- Supports dynamic data in tab titles (`@tags()`)

## React Implementation Analysis

### File Structure
```
app/blocks/src/nested-tabs/
├── frontend.tsx              (~417 lines) - Entry point with hydration
├── edit.tsx                  (~458 lines) - Block editor
├── save.tsx                  - Static HTML output with InnerBlocks
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Elementor
```

**Build Output:** 4.00 kB | gzip: 1.57 kB

### Architecture

The React implementation matches Elementor's structure:

1. **Same HTML structure** as Elementor's NestedTabs
2. **Same CSS classes** (`.e-n-tabs`, `.e-n-tabs-heading`, `.e-n-tab-title`, etc.)
3. **Same accessibility** (role="tablist", aria-selected, aria-controls)
4. **Keyboard navigation** (Arrow keys, Home, End, Enter, Space)
5. **Breakpoint system** (accordion fallback on mobile/tablet)
6. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel/Elementor Element | React Implementation | Status |
|------------------------|---------------------|--------|
| .e-n-tabs | Main tabs container | ✅ Done |
| .e-n-tabs-heading | Tab titles container | ✅ Done |
| .e-n-tab-title | Individual tab button | ✅ Done |
| .e-n-tab-title-text | Tab title text span | ✅ Done |
| .e-n-tab-icon | Tab icon container | ✅ Done |
| .e-n-tabs-content | Tab content container | ✅ Done |
| .e-con | Content panel | ✅ Done |
| .e-active | Active tab/panel state | ✅ Done |
| role="tablist" | ARIA role on heading | ✅ Done |
| role="tab" | ARIA role on tab button | ✅ Done |
| role="tabpanel" | ARIA role on content panel | ✅ Done |
| aria-selected | Active state attribute | ✅ Done |
| aria-controls | Tab-panel linking | ✅ Done |
| tabindex | Keyboard navigation | ✅ Done |

### Style Controls (All from Elementor)

| Control Category | Count | Status |
|-----------------|-------|--------|
| **CONTENT** | | |
| - tabs (repeater) | Tab items with title/icon/id | ✅ Done |
| - tab_title | Tab title text | ✅ Done |
| - element_id | CSS ID for linking | ✅ Done |
| - tab_icon | Tab icon (normal) | ✅ Done |
| - tab_icon_active | Tab icon (active) | ✅ Done |
| **LAYOUT** | | |
| - tabs_direction | Tab position (4 options) | ✅ Done |
| - tabs_justify_horizontal | Horizontal justify (4 options) | ✅ Done |
| - tabs_justify_vertical | Vertical justify (4 options) | ✅ Done |
| - tabs_width | Tab container width (responsive) | ✅ Done |
| - title_alignment | Title text alignment (3 options) | ✅ Done |
| **ADDITIONAL** | | |
| - horizontal_scroll | Enable horizontal scroll | ✅ Done |
| - breakpoint_selector | Accordion breakpoint (3 options) | ✅ Done |
| **STYLE - TABS** | | |
| - tabs_gap | Gap between tabs (responsive) | ✅ Done |
| - tabs_title_space | Distance to content (responsive) | ✅ Done |
| - border_radius | Tab border radius (responsive box) | ✅ Done |
| - padding | Tab padding (responsive box) | ✅ Done |
| - box_background_color | Background (3 states) | ✅ Done |
| - box_border | Border (3 states) | ✅ Done |
| - box_shadow | Box shadow (3 states) | ✅ Done |
| - hover_animation | Hover animation type | ✅ Done |
| - hover_transition | Transition duration | ✅ Done |
| **STYLE - TITLE** | | |
| - title_typography | Typography group | ✅ Done |
| - title_normal_color | Normal text color | ✅ Done |
| - title_hover_color | Hover text color | ✅ Done |
| - title_active_color | Active text color | ✅ Done |
| **STYLE - ICON** | | |
| - icon_position | Icon position (responsive) | ✅ Done |
| - icon_size | Icon size (responsive) | ✅ Done |
| - icon_spacing | Icon spacing (responsive) | ✅ Done |
| - icon_color | Normal icon color | ✅ Done |
| - icon_color_hover | Hover icon color | ✅ Done |
| - icon_color_active | Active icon color | ✅ Done |
| **STYLE - CONTENT** | | |
| - content_background_color | Content background | ✅ Done |
| - content_border | Content border | ✅ Done |
| - content_border_radius | Border radius (responsive box) | ✅ Done |
| - content_box_shadow | Box shadow | ✅ Done |
| - content_padding | Content padding (responsive box) | ✅ Done |
| **VOXEL EXTENSIONS** | | |
| - _voxel_loop | Loop context support | ✅ Done |
| - Dynamic Data | @tags() syntax in titles | ✅ Done |

**Total Style Controls:** ~50 controls (all Elementor controls + Voxel extensions)

### State Rendering

| State | Elementor Output | React Output | Status |
|-------|------------------|--------------|--------|
| Normal tab | Default styles | Same | ✅ Done |
| Hover tab | Hover styles + animation | Same | ✅ Done |
| Active tab | Active styles + e-active class | Same | ✅ Done |
| Icon display | Normal/active icon swap | Same | ✅ Done |
| Desktop mode | Tabs layout | Same | ✅ Done |
| Mobile/tablet | Accordion fallback | Same | ✅ Done |
| Keyboard focus | Focus outline | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Tab state | React useState for activeTab | ✅ Done |
| Breakpoint detection | useEffect with window.matchMedia | ✅ Done |
| Keyboard navigation | Arrow/Home/End/Enter/Space handlers | ✅ Done |
| Focus management | useFocusTrap for accessibility | ✅ Done |
| Icon rendering | Support for normal/active icons | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-react-mounted` check | ✅ Done |
| No tabs defined | Show empty state | ✅ Done |
| Single tab | Still functional | ✅ Done |
| Long tab titles | Text wrapping | ✅ Done |
| Missing icons | Graceful fallback | ✅ Done |
| Breakpoint change | Re-render accordion/tabs | ✅ Done |
| Keyboard navigation | Full arrow key support | ✅ Done |
| Touch devices | Touch-friendly tabs | ✅ Done |
| AJAX/Turbo navigation | Re-initialization listeners | ✅ Done |

## Keyboard Navigation

| Key | Behavior | Status |
|-----|----------|--------|
| Arrow Right/Down | Next tab | ✅ Done |
| Arrow Left/Up | Previous tab | ✅ Done |
| Home | First tab | ✅ Done |
| End | Last tab | ✅ Done |
| Enter/Space | Activate tab | ✅ Done |
| Tab | Focus next element | ✅ Done |

## Accessibility

| Feature | Implementation | Status |
|---------|---------------|--------|
| role="tablist" | On .e-n-tabs-heading | ✅ Done |
| role="tab" | On each .e-n-tab-title | ✅ Done |
| role="tabpanel" | On each .e-con panel | ✅ Done |
| aria-selected | true for active tab | ✅ Done |
| aria-controls | Links tab to panel | ✅ Done |
| aria-labelledby | Links panel to tab | ✅ Done |
| tabindex | 0 for active, -1 for others | ✅ Done |
| hidden attribute | On inactive panels | ✅ Done |
| Keyboard navigation | Full support | ✅ Done |
| Focus management | Focus trap in tabs | ✅ Done |

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case/Elementor format)
- useState for active tab management
- useEffect for breakpoint detection
- useCallback for memoized event handlers
- useMemo for computed values
- CSS variables for dynamic styling
- InnerBlocks for tab content (Gutenberg integration)
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- WCAG 2.1 AA accessibility compliance

## Build Output

```
frontend.js  4.00 kB | gzip: 1.57 kB
Built in 47ms
```

## Conclusion

The nested-tabs block has **100% parity** with Voxel's Elementor NestedTabs extension:

- HTML structure matches exactly (`.e-n-tabs`, `.e-n-tabs-heading`, `.e-n-tab-title`, etc.)
- All Elementor style controls implemented
- Tab positioning (top/bottom/left/right)
- Responsive breakpoints with accordion fallback
- Normal/hover/active states for tabs
- Icon support with normal/active variants
- Full keyboard navigation
- ARIA accessibility (tablist, tab, tabpanel roles)
- Voxel extensions (loop support, dynamic data)
- normalizeConfig() for Next.js compatibility
- Multisite support

**Key Insights:**

1. **Extends Elementor:** Voxel's nested-tabs.php (142 lines) extends Elementor's NestedTabs widget
2. **Minimal custom code:** Most functionality comes from Elementor's base widget
3. **Voxel additions:** Loop support and dynamic data integration
4. **React approach:** Uses InnerBlocks to replicate Elementor's nested container system

Our React implementation achieves 100% parity by:
- Matching Elementor's HTML structure exactly
- Implementing all Elementor control features
- Adding Voxel's loop support
- Supporting dynamic data in tab titles
- Maintaining full accessibility
- Being headless-ready via normalizeConfig()

**Architecture:** Full React implementation with InnerBlocks - replaces Elementor widget

## Differences from Other Tier 3 Blocks

| Block | Architecture | Reference | Complexity |
|-------|-------------|-----------|------------|
| nested-tabs | Extends Elementor | NestedTabs widget | InnerBlocks system |
| nested-accordion | Extends Elementor | NestedAccordion widget | Similar to tabs |
| countdown | Vanilla JS | Custom Voxel widget | Interval-based |
| sales-chart | Vue.js | Custom Voxel widget | AJAX + chart rendering |
| visit-chart | Vue.js | Custom Voxel widget | Lazy loading + AJAX |
| ring-chart | Vue.js | Custom Voxel widget | SVG rendering |

The nested-tabs block is unique because it extends Elementor rather than being a standalone Voxel widget. This means our implementation needs to match Elementor's structure (`.e-n-*` classes) while adding Voxel's enhancements (loop support, dynamic data).

