# Image Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** image.php (16 lines) - Extends Elementor Widget_Image

## Summary

The image block has **100% parity** with Voxel's implementation which extends Elementor's Widget_Image. All core features are implemented: image selection with size options (thumbnail/medium/large/full/custom), custom dimensions, caption support (attachment/custom), link options (none/file/custom), lightbox integration, responsive image styling (alignment/width/height/object-fit/object-position), effects (opacity/CSS filters with hover states), transition duration, hover animations (grow/shrink/pulse/etc.), borders (type/width/color/radius/shadow), aspect ratio control, and complete caption styling. The React implementation uses Elementor's HTML structure and classes for seamless integration.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| image.php (16 lines) | Voxel Image Widget | **Extends Elementor** |
| Widget_Image (Elementor) | Base Elementor Widget | Core Elementor class |

The widget is a **thin wrapper** around Elementor's Image widget (only 16 lines). It extends `Elementor\Widgets\Image` with minimal modifications.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/image.php` (16 lines)
- **Base widget:** `Elementor\Widgets\Image` (core Elementor)
- **Widget ID:** image
- **Framework:** Elementor (extended)
- **Purpose:** Display images with responsive controls and effects

### Voxel HTML Structure

```html
<div class="elementor-widget-image">
  <div class="elementor-image">
    <!-- Link wrapper (optional) -->
    <a href="..." data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="...">
      <img
        src="..."
        alt="..."
        class="attachment-full size-full"
        width="1200"
        height="800"
        loading="lazy"
      />
    </a>

    <!-- Caption (optional) -->
    <div class="widget-image-caption wp-caption-text">
      Image caption text
    </div>
  </div>
</div>
```

### Data Flow (from Elementor PHP)

- Gets image from media library
- Selects image size (thumbnail, medium, large, full, custom)
- Applies custom dimensions if custom size selected
- Gets caption from attachment or custom text
- Wraps in link if link_to is set (file or custom URL)
- Applies lightbox attribute if enabled
- Renders responsive CSS for alignment, width, height
- Applies CSS filters and hover effects
- Sets border, border radius, box shadow
- Applies aspect ratio if set
- Renders caption with custom styling

## React Implementation Analysis

### File Structure
```
app/blocks/src/image/
├── frontend.tsx              (~350 lines) - Entry point with hydration
├── shared/
│   └── ImageComponent.tsx    - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Elementor
```

**Build Output:** Size not specified (relatively small block)

### Architecture

The React implementation matches Elementor's structure:

1. **Same HTML structure** as Elementor's Widget_Image
2. **Same CSS classes** (`.elementor-image`, `.widget-image-caption`, `.attachment-{size}`, etc.)
3. **Image size support** (thumbnail, medium, large, full, custom)
4. **Caption support** (none, attachment, custom)
5. **Link support** (none, file, custom)
6. **Lightbox integration** (data-elementor-open-lightbox attribute)
7. **normalizeConfig()** with 11 specialized helper functions

## Parity Checklist

### HTML Structure

| Elementor Element | React Implementation | Status |
|-------------------|---------------------|--------|
| .elementor-widget-image | Widget wrapper | ✅ Done |
| .elementor-image | Image container | ✅ Done |
| .elementor-image a | Link wrapper (optional) | ✅ Done |
| .elementor-image img | Image element | ✅ Done |
| .attachment-{size} | Size class on img | ✅ Done |
| .size-{size} | Size class on img | ✅ Done |
| .widget-image-caption | Caption element | ✅ Done |
| .wp-caption-text | Caption class | ✅ Done |
| data-elementor-open-lightbox | Lightbox trigger | ✅ Done |
| data-elementor-lightbox-slideshow | Slideshow grouping | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **IMAGE (Content)** | 3 | ✅ Done |
| - image | Image selector (media control) | ✅ Done |
| - image_size | Size select (thumbnail/medium/large/full/custom) | ✅ Done |
| - image_custom_dimension | Custom width/height (dimensions) | ✅ Done |
| **CAPTION (Content)** | 2 | ✅ Done |
| - caption_source | Source (none/attachment/custom) | ✅ Done |
| - caption | Custom caption text | ✅ Done |
| **LINK (Content)** | 3 | ✅ Done |
| - link_to | Destination (none/file/custom) | ✅ Done |
| - link | Custom link URL (url control) | ✅ Done |
| - open_lightbox | Lightbox toggle (default/yes/no) | ✅ Done |
| **IMAGE STYLE (Style)** | 6 | ✅ Done |
| - align | Alignment (left/center/right) [responsive] | ✅ Done |
| - width | Width slider (px, %, vw) [responsive] | ✅ Done |
| - space | Max width slider (px, %) [responsive] | ✅ Done |
| - height | Height slider (px, vh) [responsive] | ✅ Done |
| - object-fit | Object fit select [responsive] | ✅ Done |
| - object-position | Object position (center/top/bottom/left/right) | ✅ Done |
| **EFFECTS (Style)** | 6 | ✅ Done |
| - opacity | Normal opacity (0-1 slider) | ✅ Done |
| - _css_filters | CSS filters (blur/brightness/contrast/saturation/hue) | ✅ Done |
| - opacity_hover | Hover opacity (0-1 slider) | ✅ Done |
| - css_filters_hover | Hover CSS filters | ✅ Done |
| - background_hover_transition | Transition duration (ms) | ✅ Done |
| - hover_animation | Hover animation (grow/shrink/pulse/etc.) | ✅ Done |
| **BORDER (Style)** | 6 | ✅ Done |
| - image_border | Border type (none/solid/dashed/dotted/double) | ✅ Done |
| - image_border_width | Border width (dimensions) | ✅ Done |
| - image_border_color | Border color | ✅ Done |
| - image_border_radius | Border radius (dimensions) [responsive] | ✅ Done |
| - image_box_shadow | Box shadow (group control) | ✅ Done |
| - aspect_ratio | Aspect ratio (n/a, 1:1, 3:2, 4:3, 9:16, 16:9, 21:9) | ✅ Done |
| **CAPTION STYLE (Style)** | 6 | ✅ Done |
| - caption_align | Alignment [responsive] | ✅ Done |
| - text_color | Text color | ✅ Done |
| - caption_background_color | Background color | ✅ Done |
| - caption_typography | Typography (group control) | ✅ Done |
| - caption_text_shadow | Text shadow (group control) | ✅ Done |
| - caption_space | Spacing slider [responsive] | ✅ Done |

**Total Style Controls:** 32 controls (8 content + 24 style)

### Image Sizes

| Size | Description | Status |
|------|-------------|--------|
| thumbnail | WordPress thumbnail size | ✅ Done |
| medium | WordPress medium size | ✅ Done |
| large | WordPress large size | ✅ Done |
| full | Full resolution | ✅ Done |
| custom | Custom dimensions | ✅ Done |

### Caption Sources

| Source | Description | Status |
|--------|-------------|--------|
| none | No caption | ✅ Done |
| attachment | Use image attachment caption | ✅ Done |
| custom | Custom caption text | ✅ Done |

### Link Destinations

| Destination | Description | Status |
|-------------|-------------|--------|
| none | No link | ✅ Done |
| file | Link to full image file | ✅ Done |
| custom | Custom URL | ✅ Done |

### Lightbox Options

| Option | Description | Status |
|--------|-------------|--------|
| default | Use site default | ✅ Done |
| yes | Always open lightbox | ✅ Done |
| no | Never open lightbox | ✅ Done |

### Hover Animations

| Animation | Effect | Status |
|-----------|--------|--------|
| grow | Scale up | ✅ Done |
| shrink | Scale down | ✅ Done |
| pulse | Pulse effect | ✅ Done |
| float | Float effect | ✅ Done |
| sink | Sink effect | ✅ Done |
| bob | Bob effect | ✅ Done |
| hang | Hang effect | ✅ Done |
| skew | Skew effect | ✅ Done |
| rotate | Rotate effect | ✅ Done |
| grow-rotate | Grow + rotate | ✅ Done |
| wiggle | Wiggle effect | ✅ Done |
| buzz | Buzz effect | ✅ Done |
| buzz-out | Buzz out effect | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Normalize config | `normalizeConfig()` with 11 specialized helpers | ✅ Done |
| Load image | ImageMedia object (id, url, alt, width, height) | ✅ Done |
| Select size | Image size selection | ✅ Done |
| Apply dimensions | Custom width/height if custom size | ✅ Done |
| Get caption | Attachment or custom caption | ✅ Done |
| Apply link | Wrap in <a> if link_to is set | ✅ Done |
| Lightbox | data-elementor-open-lightbox attribute | ✅ Done |
| Responsive styling | Alignment, width, height, object-fit | ✅ Done |
| CSS filters | Blur, brightness, contrast, saturation, hue | ✅ Done |
| Hover effects | Opacity, filters, animations | ✅ Done |
| Border styling | Type, width, color, radius, shadow | ✅ Done |
| Aspect ratio | Maintain ratio constraint | ✅ Done |
| Caption styling | Typography, color, background, shadow | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No image selected | Show placeholder | ✅ Done |
| Invalid image ID | Show error state | ✅ Done |
| Missing size | Fallback to full size | ✅ Done |
| Custom size (no dimensions) | Use original dimensions | ✅ Done |
| Caption (no source) | Hide caption | ✅ Done |
| Link (no URL) | No link wrapper | ✅ Done |
| Lightbox (not supported) | Ignore lightbox attribute | ✅ Done |
| Aspect ratio (n/a) | No constraint | ✅ Done |
| CSS filters (empty) | No filter applied | ✅ Done |
| Hover animation (none) | No animation | ✅ Done |
| Re-initialization | `data-react-mounted` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility with **11 specialized helper functions**:
  - normalizeString, normalizeNumber, normalizeBoolean
  - normalizeImageMedia, normalizeLinkObject, normalizeSliderValue
  - normalizeBoxDimensions, normalizeCSSFilters, normalizeBoxShadow
  - normalizeTypography, normalizeTextShadow
- ImageMedia type (id, url, alt, width, height)
- LinkObject type (url, is_external, nofollow, custom_attributes)
- SliderValue type (size, unit)
- BoxDimensions type (top, right, bottom, left, unit)
- CSSFilters type (blur, brightness, contrast, saturation, hue)
- BoxShadowValue type (horizontal, vertical, blur, spread, color)
- TypographyValue type (11 properties: family, size, weight, etc.)
- TextShadowValue type (horizontal, vertical, blur, color)
- Pure client-side rendering (createRoot)
- CSS variables for dynamic styling (32 controls)
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- SSR-compatible image rendering

## Build Output

```
frontend.js  [Size not specified - relatively small]
```

## Conclusion

The image block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.elementor-image`, `.widget-image-caption`, `.attachment-{size}`)
- All 32 Elementor style controls supported
- Image size selection (thumbnail/medium/large/full/custom)
- Custom dimensions for custom size
- Caption support (none/attachment/custom)
- Link support (none/file/custom)
- Lightbox integration (data-elementor-open-lightbox)
- Responsive image styling (alignment/width/height/object-fit/object-position)
- CSS effects (opacity, filters with hover states)
- Hover animations (13 animation types)
- Transition duration control
- Border styling (type/width/color/radius/shadow)
- Aspect ratio control (7 ratio options)
- Complete caption styling (6 controls)
- vxconfig parsing with 11 specialized normalization helpers
- Multisite support

**Key Insight:** Voxel's image.php is **only 16 lines** - it's a thin wrapper extending `Elementor\Widgets\Image`. Our React implementation replicates Elementor's full Image widget functionality:
- All Elementor Image controls (32 total)
- Elementor HTML structure and classes
- Lightbox integration via data attributes
- Hover animations (13 types)
- CSS filters with hover states
- Aspect ratio control

**Architecture:** Pure client-side rendering - Voxel widget extends Elementor's Widget_Image

**Unique Features:**
- **Elementor extension**: Minimal wrapper (16 lines) around Elementor's core Image widget
- **Image size system**: WordPress image sizes (thumbnail/medium/large/full) + custom
- **Lightbox integration**: Elementor lightbox via data-elementor-open-lightbox attribute
- **13 hover animations**: grow, shrink, pulse, float, sink, bob, hang, skew, rotate, grow-rotate, wiggle, buzz, buzz-out
- **CSS filters**: blur, brightness, contrast, saturation, hue (with hover variants)
- **Aspect ratio**: 7 ratio options (n/a, 1:1, 3:2, 4:3, 9:16, 16:9, 21:9)
- **11 specialized normalizers**: Most comprehensive type normalization across blocks (ImageMedia, LinkObject, SliderValue, BoxDimensions, CSSFilters, BoxShadow, Typography, TextShadow)
- **Caption styling**: Complete control over typography, color, background, shadow, spacing
- **Responsive controls**: Alignment, width, height, object-fit, border radius, caption alignment all responsive
