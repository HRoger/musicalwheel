# Image Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to image frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-85)

Added comprehensive documentation header covering all Elementor Widget_Image controls (Voxel's image.php is a thin wrapper):

**IMAGE (Content Tab):**
- image - Image selector (media control)
- image_size - Image size select (thumbnail, medium, large, full, custom)
- image_custom_dimension - Custom width/height (dimensions control)

**CAPTION:**
- caption_source - Caption source (none, attachment, custom)
- caption - Custom caption text

**LINK:**
- link_to - Link destination (none, file, custom)
- link - Custom link URL (url control)
- open_lightbox - Open in lightbox (default, yes, no)

**IMAGE STYLE (Style Tab):**
- align - Image alignment (left, center, right) [responsive]
- width - Width slider with px, %, vw [responsive]
- space - Max width slider [responsive]
- height - Height slider with px, vh [responsive]
- object-fit - Object fit select [responsive]
- object-position - Object position

**EFFECTS:**
- opacity - Normal opacity (slider 0-1)
- _css_filters - CSS filters (blur, brightness, contrast, saturation, hue)
- opacity_hover - Hover opacity (slider 0-1)
- css_filters_hover - Hover CSS filters
- background_hover_transition - Transition duration (ms)
- hover_animation - Hover animation (grow, shrink, pulse, etc.)

**BORDER:**
- image_border - Border type (none, solid, dashed, dotted, double)
- image_border_width - Border width (dimensions)
- image_border_color - Border color
- image_border_radius - Border radius (dimensions) [responsive]
- image_box_shadow - Box shadow (group control)
- aspect_ratio - Aspect ratio (n/a, 1:1, 3:2, 4:3, 9:16, 16:9, 21:9)

**CAPTION STYLE:**
- caption_align - Caption alignment [responsive]
- text_color - Caption text color
- caption_background_color - Caption background color
- caption_typography - Caption typography (group control)
- caption_text_shadow - Caption text shadow (group control)
- caption_space - Caption spacing (slider) [responsive]

### 2. normalizeConfig() Function (lines 109-313)

Added normalization function for API format compatibility with 8 specialized helper functions:

```typescript
function normalizeConfig(raw: Record<string, unknown>): ImageVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number | undefined): number | undefined => {...};

  // Helper for boolean normalization
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {...};

  // Helper for ImageMedia normalization
  const normalizeImageMedia = (val: unknown): ImageMedia => {...};

  // Helper for LinkObject normalization
  const normalizeLinkObject = (val: unknown): LinkObject => {...};

  // Helper for SliderValue normalization
  const normalizeSliderValue = (val: unknown): SliderValue => {...};

  // Helper for BoxDimensions normalization
  const normalizeBoxDimensions = (val: unknown): BoxDimensions => {...};

  // Helper for CSSFilters normalization
  const normalizeCSSFilters = (val: unknown): CSSFilters => {...};

  // Helper for BoxShadowValue normalization
  const normalizeBoxShadow = (val: unknown): BoxShadowValue => {...};

  // Helper for TypographyValue normalization
  const normalizeTypography = (val: unknown): TypographyValue => {...};

  // Helper for TextShadowValue normalization
  const normalizeTextShadow = (val: unknown): TextShadowValue => {...};

  return {
    image: normalizeImageMedia(raw.image),
    imageSize: normalizeString(raw.imageSize ?? raw.image_size, 'full'),
    // ... all properties with dual-format support
  };
}
```

**Features:**
- String normalization (handles numeric values as strings)
- Number normalization (string to float parsing)
- Boolean normalization (handles various truthy/falsy values)
- ImageMedia object normalization (id, url, alt, width, height)
- LinkObject normalization (url, target, rel)
- SliderValue normalization (size, unit)
- BoxDimensions normalization (top, right, bottom, left, unit, isLinked)
- CSSFilters normalization (blur, brightness, contrast, saturation, hue)
- BoxShadowValue normalization (horizontal, vertical, blur, spread, color, position)
- TypographyValue normalization (fontFamily, fontSize, fontWeight, textTransform, etc.)
- TextShadowValue normalization (horizontal, vertical, blur, color)
- Dual-format support (camelCase and snake_case)
- Responsive property support (_tablet, _mobile suffixes)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 319-332)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  12.33 kB | gzip: 3.89 kB
Built in 253ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/image.php` (16 lines)
- Extends: Elementor `Widget_Image` class
- Note: Voxel's image widget is a thin wrapper around Elementor's standard image widget

## Architecture Notes

The image block is unique because:
- **Elementor-based**: Voxel extends Elementor's Widget_Image (16 lines only)
- **Rich styling**: Full CSS filter, shadow, typography support from Elementor
- **Complex nested types**: 8 different complex type normalizers needed
- **Responsive properties**: Most properties have _tablet and _mobile variants
- **Lightbox support**: Integration with Elementor's lightbox system
- **Caption flexibility**: Supports attachment, custom, and no caption modes

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] ImageMedia object normalization
- [x] LinkObject normalization
- [x] SliderValue normalization (responsive values)
- [x] BoxDimensions normalization (border/radius)
- [x] CSSFilters normalization (image effects)
- [x] BoxShadowValue normalization
- [x] TypographyValue normalization (caption styling)
- [x] TextShadowValue normalization
- [x] Responsive property support (_tablet, _mobile)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] SSR-compatible image rendering

## Files Modified

1. `app/blocks/src/image/frontend.tsx`
   - Added Voxel parity header (85 lines)
   - Added normalizeConfig() function (205 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Image selector | 100% | ImageMedia object |
| Image size | 100% | Size select + custom dimensions |
| Caption source | 100% | none, attachment, custom |
| Custom caption | 100% | Text input |
| Link to | 100% | none, file, custom |
| Link URL | 100% | LinkObject with target, rel |
| Lightbox | 100% | default, yes, no |
| Image alignment | 100% | Responsive (desktop/tablet/mobile) |
| Width | 100% | SliderValue with unit |
| Max width | 100% | SliderValue (space control) |
| Height | 100% | SliderValue with unit |
| Object fit | 100% | fill, contain, cover, none, scale-down |
| Object position | 100% | Position select |
| Opacity | 100% | Normal + hover |
| CSS filters | 100% | 5 filter types + hover |
| Transition | 100% | Duration in ms |
| Hover animation | 100% | Animation select |
| Border type | 100% | none, solid, dashed, dotted, double |
| Border width | 100% | BoxDimensions |
| Border color | 100% | Color picker |
| Border radius | 100% | BoxDimensions, responsive |
| Box shadow | 100% | Full shadow control |
| Aspect ratio | 100% | Preset ratios |
| Caption align | 100% | Alignment control |
| Caption text color | 100% | Color picker |
| Caption background | 100% | Color picker |
| Caption typography | 100% | TypographyValue |
| Caption text shadow | 100% | TextShadowValue |
| Caption spacing | 100% | SliderValue |
| Visibility | 100% | Hide per breakpoint |
| Custom classes | 100% | CSS class input |
| HTML structure | 100% | Elementor classes match |
| normalizeConfig() | NEW | API format compatibility |
