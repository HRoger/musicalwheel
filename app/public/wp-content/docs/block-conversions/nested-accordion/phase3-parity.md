# Nested Accordion Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** Elementor Nested_Accordion widget (extended by Voxel)

## Summary

The nested-accordion block has **100% parity** with Voxel's implementation which extends Elementor's Nested_Accordion widget. All core features are implemented: accordion items with expand/collapse, keyboard navigation, FAQ schema support, flexible icon positioning, animation control, and complete style controls for all states (normal/hover/active). The block uses native HTML5 `<details>`/`<summary>` elements with Web Animations API for smooth transitions.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| nested-accordion.php (156 lines) | Voxel Nested Accordion Widget | **Extends Elementor** |
| Elementor\Modules\NestedAccordion\Widgets\Nested_Accordion | Base Elementor Widget | Core Elementor class |

The widget extends Elementor's Nested_Accordion with:
- Loop support (`_voxel_loop`)
- Dynamic data support (`@tags()` syntax in titles)
- FAQ schema markup (JSON-LD structured data)
- Integration with Voxel's design system

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/nested-accordion.php` (156 lines)
- **Base widget:** `Elementor\Modules\NestedAccordion\Widgets\Nested_Accordion`
- **Widget ID:** nested-accordion
- **Framework:** Elementor (extended)
- **Purpose:** Collapsible content panels with FAQ schema support

### Voxel HTML Structure

```html
<div class="e-n-accordion" data-widget-number="1">
  <!-- FAQ Schema (optional) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...]
  }
  </script>

  <!-- Accordion Items -->
  <details class="e-n-accordion-item" open>
    <summary class="e-n-accordion-item-title" role="button" aria-expanded="true" aria-controls="e-n-accordion-content-1001" tabindex="0">
      <div class="e-n-accordion-item-title-header">
        <h3 class="e-n-accordion-item-title-text">Question #1</h3>
        <span class="e-n-accordion-item-title-icon">
          <span class="e-opened">
            <i class="fas fa-minus"></i>
          </span>
          <span class="e-closed">
            <i class="fas fa-plus"></i>
          </span>
        </span>
      </div>
    </summary>
    <div class="e-n-accordion-item-content" id="e-n-accordion-content-1001" role="region" aria-labelledby="e-n-accordion-item-title-1001">
      <!-- InnerBlocks content -->
    </div>
  </details>

  <details class="e-n-accordion-item">
    <summary class="e-n-accordion-item-title" role="button" aria-expanded="false" aria-controls="e-n-accordion-content-1002" tabindex="0">
      <!-- Similar structure -->
    </summary>
    <div class="e-n-accordion-item-content" id="e-n-accordion-content-1002">
      <!-- InnerBlocks content -->
    </div>
  </details>
</div>
```

### Data Flow (from Voxel PHP)

- Extends Elementor's Nested_Accordion control structure
- Adds `_voxel_loop` for loop context support
- Renders accordion items from repeater
- Applies Elementor-style CSS classes
- Supports dynamic data in item titles (`@tags()`)
- Generates JSON-LD FAQ schema if enabled

## React Implementation Analysis

### File Structure
```
app/blocks/src/nested-accordion/
├── frontend.tsx              (~414 lines) - Entry point with hydration
├── edit.tsx                  (~542 lines) - Block editor
├── save.tsx                  - Static HTML output with InnerBlocks
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Elementor
```

**Build Output:** 3.45 kB | gzip: 1.47 kB

### Architecture

The React implementation matches Elementor's structure:

1. **Native `<details>`/`<summary>` elements** for accessibility
2. **Web Animations API** for smooth height transitions
3. **Same CSS classes** (`.e-n-accordion`, `.e-n-accordion-item`, etc.)
4. **Same accessibility** (role="button", aria-expanded, aria-controls)
5. **Keyboard navigation** (Arrow keys, Home, End, Enter, Space, Escape)
6. **FAQ schema** (JSON-LD structured data generation)
7. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel/Elementor Element | React Implementation | Status |
|------------------------|---------------------|--------|
| .e-n-accordion | Main accordion container | ✅ Done |
| .e-n-accordion-item | Details element wrapper | ✅ Done |
| .e-n-accordion-item-title | Summary element (role="button") | ✅ Done |
| .e-n-accordion-item-title-header | Title header wrapper | ✅ Done |
| .e-n-accordion-item-title-text | Title text element | ✅ Done |
| .e-n-accordion-item-title-icon | Icon container | ✅ Done |
| .e-opened | Expanded icon state | ✅ Done |
| .e-closed | Collapsed icon state | ✅ Done |
| .e-n-accordion-item-content | Content panel | ✅ Done |
| role="button" | On summary element | ✅ Done |
| role="region" | On content panel | ✅ Done |
| aria-expanded | Expanded state attribute | ✅ Done |
| aria-controls | Summary-content linking | ✅ Done |
| aria-labelledby | Content-summary linking | ✅ Done |
| tabindex | Keyboard navigation | ✅ Done |
| FAQ schema script | JSON-LD structured data | ✅ Done |

### Style Controls (All from Elementor)

| Control Category | Count | Status |
|-----------------|-------|--------|
| **CONTENT** | | |
| - items (repeater) | Accordion items with title/id | ✅ Done |
| - item_title | Item title text | ✅ Done |
| - element_css_id | CSS ID for linking | ✅ Done |
| - _voxel_loop | Loop context (Voxel extension) | ✅ Done |
| **LAYOUT** | | |
| - title_tag | HTML tag for title (h1-h6, div, span, p) | ✅ Done |
| - faq_schema | Enable FAQ schema markup | ✅ Done |
| - accordion_item_title_icon | Expand icon | ✅ Done |
| - accordion_item_title_icon_active | Collapse icon | ✅ Done |
| **INTERACTIONS** | | |
| - default_state | Initial state (expanded, all_collapsed) | ✅ Done |
| - max_items_expended | Max open items (one, multiple) | ✅ Done |
| - n_accordion_animation_duration | Animation duration (ms) | ✅ Done |
| **STYLE - ACCORDION** | | |
| - accordion_item_title_space_between | Gap between items (responsive) | ✅ Done |
| - accordion_item_title_distance_from_content | Content distance (responsive) | ✅ Done |
| - accordion_border_radius | Border radius (responsive box) | ✅ Done |
| - accordion_padding | Padding (responsive box) | ✅ Done |
| - accordion_item_title_background_color | Background (3 states) | ✅ Done |
| - accordion_item_title_border | Border (3 states) | ✅ Done |
| **STYLE - HEADER** | | |
| - accordion_item_title_position | Item justify (start, center, end, stretch) | ✅ Done |
| - accordion_item_title_icon_position | Icon position (start, end) | ✅ Done |
| **STYLE - TITLE** | | |
| - title_typography | Typography group | ✅ Done |
| - title_normal_color | Normal text color | ✅ Done |
| - title_hover_color | Hover text color | ✅ Done |
| - title_active_color | Active text color | ✅ Done |
| **STYLE - ICON** | | |
| - accordion_item_title_icon_size | Icon size (responsive) | ✅ Done |
| - accordion_item_title_icon_space_between | Icon spacing (responsive) | ✅ Done |
| - icon_color | Normal icon color | ✅ Done |
| - icon_color_hover | Hover icon color | ✅ Done |
| - icon_color_active | Active icon color | ✅ Done |
| **STYLE - CONTENT** | | |
| - content_background_color | Content background | ✅ Done |
| - content_border | Content border | ✅ Done |
| - content_border_radius | Border radius (responsive box) | ✅ Done |
| - content_padding | Content padding (responsive box) | ✅ Done |
| **VOXEL EXTENSIONS** | | |
| - _voxel_loop | Loop context support | ✅ Done |
| - Dynamic Data | @tags() syntax in titles | ✅ Done |
| - faq_schema | JSON-LD FAQ structured data | ✅ Done |

**Total Style Controls:** ~45 controls (all Elementor controls + Voxel extensions)

### State Rendering

| State | Elementor Output | React Output | Status |
|-------|------------------|--------------|--------|
| Item collapsed | Closed details element | Same | ✅ Done |
| Item expanded | Open details element | Same | ✅ Done |
| Normal state | Default styles | Same | ✅ Done |
| Hover state | Hover styles | Same | ✅ Done |
| Active state | Active styles | Same | ✅ Done |
| Icon swap | Expanded/collapsed icon swap | Same | ✅ Done |
| One item mode | Auto-close other items | Same | ✅ Done |
| Multiple mode | Multiple items open | Same | ✅ Done |
| FAQ schema | JSON-LD script tag | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Accordion state | React useState for openItems | ✅ Done |
| Animation control | Web Animations API | ✅ Done |
| Keyboard navigation | Arrow/Home/End/Enter/Space/Escape handlers | ✅ Done |
| Icon rendering | Expanded/collapsed icon swap | ✅ Done |
| FAQ schema generation | JSON-LD structured data | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-react-mounted` check | ✅ Done |
| No items defined | Show empty state | ✅ Done |
| Single item | Still functional | ✅ Done |
| Long item titles | Text wrapping | ✅ Done |
| Missing icons | Graceful fallback | ✅ Done |
| One item mode | Auto-close siblings | ✅ Done |
| Multiple mode | Independent toggling | ✅ Done |
| Keyboard navigation | Full arrow key support | ✅ Done |
| Animation disabled | Instant toggle | ✅ Done |
| AJAX/Turbo navigation | Re-initialization listeners | ✅ Done |

## Keyboard Navigation

| Key | Behavior | Status |
|-----|----------|--------|
| Arrow Down | Next item | ✅ Done |
| Arrow Up | Previous item | ✅ Done |
| Home | First item | ✅ Done |
| End | Last item | ✅ Done |
| Enter/Space | Toggle item | ✅ Done |
| Escape | Close current item | ✅ Done |
| Tab | Focus next element | ✅ Done |

## Accessibility

| Feature | Implementation | Status |
|---------|---------------|--------|
| Native <details> | Semantic HTML5 element | ✅ Done |
| role="button" | On summary element | ✅ Done |
| role="region" | On content panel | ✅ Done |
| aria-expanded | Reflects open/closed state | ✅ Done |
| aria-controls | Links summary to content | ✅ Done |
| aria-labelledby | Links content to summary | ✅ Done |
| tabindex | 0 for all items | ✅ Done |
| Keyboard navigation | Full support | ✅ Done |
| Focus management | Focus trap in accordion | ✅ Done |

## FAQ Schema Support

When `faqSchema` is enabled, generates JSON-LD structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question title",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer content"
      }
    }
  ]
}
```

Status: ✅ Done

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case/Elementor format)
- useState for accordion state management
- Web Animations API for smooth height transitions
- useCallback for memoized event handlers
- useMemo for computed values (FAQ schema)
- CSS variables for dynamic styling
- InnerBlocks for accordion content (Gutenberg integration)
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- WCAG 2.1 AA accessibility compliance
- Native <details>/<summary> for progressive enhancement

## Build Output

```
frontend.js  3.45 kB | gzip: 1.47 kB
Built in 79ms
```

## Conclusion

The nested-accordion block has **100% parity** with Voxel's Elementor Nested_Accordion extension:

- HTML structure matches exactly (`.e-n-accordion`, `.e-n-accordion-item`, etc.)
- Native `<details>`/`<summary>` elements for accessibility
- All Elementor style controls implemented
- Web Animations API for smooth transitions
- Normal/hover/active states for items
- Icon support with expand/collapse variants
- Full keyboard navigation
- ARIA accessibility (button, region roles)
- FAQ schema support (JSON-LD structured data)
- Voxel extensions (loop support, dynamic data)
- normalizeConfig() for Next.js compatibility
- Multisite support

**Key Insights:**

1. **Extends Elementor:** Voxel's nested-accordion.php (156 lines) extends Elementor's Nested_Accordion widget
2. **Native HTML:** Uses `<details>`/`<summary>` for progressive enhancement
3. **Web Animations API:** Smooth height transitions without jQuery
4. **FAQ Schema:** Generates JSON-LD structured data for SEO
5. **Voxel additions:** Loop support, dynamic data, and FAQ schema integration

Our React implementation achieves 100% parity by:
- Using native `<details>`/`<summary>` elements
- Matching Elementor's HTML structure exactly
- Implementing all Elementor control features
- Adding Voxel's loop support and FAQ schema
- Supporting dynamic data in item titles
- Maintaining full accessibility
- Being headless-ready via normalizeConfig()

**Architecture:** Full React implementation with InnerBlocks - replaces Elementor widget

## Differences from Nested Tabs

| Feature | Nested Tabs | Nested Accordion |
|---------|-------------|------------------|
| HTML Element | Custom div structure | Native <details>/<summary> |
| Multiple Open | Only one tab active at a time | Can have multiple items open |
| Animation | CSS transitions | Web Animations API |
| Use Case | Tab navigation | Collapsible FAQ content |
| Schema Support | None | FAQ schema (JSON-LD) |
| Icon States | Normal/active | Expanded/collapsed |
| Keyboard | Tab switching | Item expanding |

Both blocks extend Elementor widgets and share similar control structures, but serve different UI patterns (tab navigation vs. collapsible panels).

