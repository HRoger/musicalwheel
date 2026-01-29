# Nested Accordion Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel/Elementor parity header and normalizeConfig() function to nested-accordion frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel/Elementor Parity Header (frontend.tsx lines 1-104)

Added comprehensive documentation header covering Elementor NestedAccordion controls:

**CONTENT - ITEMS (Elementor Repeater):**
- items - Accordion items repeater
- item_title - Item title text
- element_css_id - CSS ID for linking
- _voxel_loop - Loop context (Voxel extension)
- _loop_index - Loop item index (Voxel extension)
- _child_index - Child container index (Voxel extension)

**LAYOUT - ACCORDION:**
- title_tag - HTML tag for title (h1-h6, div, span, p)
- faq_schema - Enable FAQ schema markup
- accordion_item_title_icon - Expand/collapse icon
- accordion_item_title_icon_active - Active state icon

**INTERACTIONS:**
- default_state - Initial state (expanded, all_collapsed)
- max_items_expended - Max open items (one, multiple)
- n_accordion_animation_duration - Animation duration (ms)

**STYLE - ACCORDION (Normal + Hover + Active):**
- accordion_item_title_space_between - Gap between items (responsive)
- accordion_item_title_distance_from_content - Content distance (responsive)
- accordion_border_radius - Border radius (responsive box)
- accordion_padding - Padding (responsive box)
- accordion_item_title_background_color - Background color (states)
- accordion_item_title_border - Border (states)

**STYLE - HEADER:**
- accordion_item_title_position - Item justify (start, center, end, stretch)
- accordion_item_title_icon_position - Icon position (start, end)

**STYLE - TITLE:**
- title_typography - Typography group
- title_normal_color - Normal text color
- title_hover_color - Hover text color
- title_active_color - Active text color

**STYLE - ICON:**
- accordion_item_title_icon_size - Icon size (responsive)
- accordion_item_title_icon_space_between - Icon spacing (responsive)
- icon_color - Normal icon color
- icon_color_hover - Hover icon color
- icon_color_active - Active icon color

**STYLE - CONTENT:**
- content_background_color - Content background
- content_border - Content border
- content_border_radius - Border radius (responsive box)
- content_padding - Content padding (responsive box)

**VOXEL EXTENSIONS:**
- _voxel_loop - Loop context support
- _loop_index - Loop item index
- _child_index - Child container index
- Dynamic Data - @tags() syntax in titles
- faq_schema - JSON-LD FAQ structured data

**HTML STRUCTURE (Elementor):**
- .e-n-accordion - Main accordion container
- .e-n-accordion-item - Details element wrapper
- .e-n-accordion-item-title - Summary element (role="button")
- .e-n-accordion-item-title-header - Title header wrapper
- .e-n-accordion-item-title-text - Title text element
- .e-n-accordion-item-title-icon - Icon container
- .e-opened / .e-closed - Icon state wrappers
- .e-n-accordion-item-content - Content panel

**ACCESSIBILITY:**
- role="button" on summary
- aria-expanded for open state
- aria-controls linking to content
- tabindex management for focus
- Keyboard navigation (Arrow, Home, End, Enter, Space, Escape)

### 2. normalizeConfig() Function (lines 115-188)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): NestedAccordionVxConfig {
  // Helper for string normalization
  const normalizeString = <T extends string>(val: unknown, fallback: T): T => { ... };

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => { ... };

  // Helper for boolean normalization
  const normalizeBool = (val: unknown, fallback: boolean): boolean => { ... };

  // Helper for accordion item normalization
  const normalizeItem = (item: Record<string, unknown>) => ({
    id: normalizeString(item.id ?? item.item_id, ''),
    title: normalizeString(item.title ?? item.item_title, ''),
    cssId: normalizeString(item.cssId ?? item.css_id ?? item.element_css_id, ''),
    loop: item.loop ?? item._voxel_loop,
    visibility: item.visibility,
  });

  // Normalize items, interactions, icons, titleTag, faqSchema...
  return { items, interactions, icons, titleTag, faqSchema };
}
```

**Features:**
- String normalization with generic type support
- Number normalization (string to float parsing)
- Boolean normalization (handles various truthy/falsy values)
- Accordion item normalization (maps Elementor field names)
- Nested object normalization (interactions, icons)
- Loop config preservation for Voxel extensions
- Dual-format support (camelCase and snake_case)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 194-207)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  3.45 kB │ gzip: 1.47 kB
Built in 79ms
```

## Voxel/Elementor Reference

- Voxel file: `themes/voxel/app/widgets/nested-accordion.php` (156 lines)
- Base widget: `Elementor\Modules\NestedAccordion\Widgets\Nested_Accordion`
- Voxel extends Elementor with loop support, dynamic data, and FAQ schema

## Architecture Notes

The nested-accordion block is unique because:
- **Extends Elementor**: Voxel's nested-accordion.php (156 lines) extends Elementor's Nested_Accordion
- **Styling from Elementor**: All style controls come from Elementor's base widget
- **Voxel adds**: Loop support (_voxel_loop), dynamic data (@tags() syntax), FAQ schema
- **Uses <details>/<summary>**: Native HTML5 accordion elements with Web Animations API
- **Our FSE block**: Reimplements Elementor structure with Gutenberg InnerBlocks

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] Pure JS initialization (no jQuery)
- [x] Web Animations API for smooth transitions
- [x] TypeScript strict mode
- [x] Event delegation for SPA compatibility

## Files Modified

1. `app/blocks/src/nested-accordion/frontend.tsx`
   - Added Voxel/Elementor parity header (104 lines)
   - Added normalizeConfig() function (74 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Accordion items | 100% | Title, CSS ID, loop, visibility |
| Layout controls | 100% | Title tag, FAQ schema, icons |
| Interactions | 100% | Default state, max items, animation |
| Style - Accordion | 100% | Gap, radius, padding, 3 states |
| Style - Header | 100% | Position, icon position |
| Style - Title | 100% | Typography, 3 state colors |
| Style - Icon | 100% | Size, spacing, colors |
| Style - Content | 100% | Background, border, radius, padding |
| Voxel extensions | 100% | Loop support, dynamic data, FAQ schema |
| HTML structure | 100% | All Elementor classes match |
| Accessibility | 100% | ARIA roles, keyboard navigation |
| normalizeConfig() | NEW | API format compatibility |
