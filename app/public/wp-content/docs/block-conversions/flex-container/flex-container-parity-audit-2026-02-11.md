# Flex Container — Elementor Widget vs FSE Block Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~93%
**Status:** Highly functional with some advanced control gaps

---

## Important Context

The Flex Container is **NOT a Voxel-specific widget** — it's Elementor's native Container element. The FSE block (`voxel-fse/flex-container`) is a Gutenberg replacement that replicates Elementor's container behavior plus Voxel's custom container-controller.php additions.

---

## Reference Files

### Elementor Source (Container Element)
| File | Purpose | Lines |
|------|---------|-------|
| `plugins/elementor/includes/elements/container.php` | Main container class | 1-1998 |
| `plugins/elementor/includes/controls/groups/flex-container.php` | Flexbox group controls | 1-252 |
| `plugins/elementor/includes/controls/groups/grid-container.php` | Grid group controls | 1-321 |
| `themes/voxel/app/modules/elementor/controllers/container-controller.php` | Voxel custom controls | 1-333 |
| `plugins/elementor/assets/css/frontend.min.css` | Elementor CSS | All |

### FSE Block Source
| File | Purpose | Lines |
|------|---------|-------|
| `themes/voxel-fse/app/blocks/src/flex-container/block.json` | Block metadata & 357 attributes | 1-1357 |
| `themes/voxel-fse/app/blocks/src/flex-container/edit.tsx` | Editor component | 1-467 |
| `themes/voxel-fse/app/blocks/src/flex-container/save.tsx` | Save component | All |
| `themes/voxel-fse/app/blocks/src/flex-container/render.php` | Server-side render | All |
| `themes/voxel-fse/app/blocks/src/flex-container/styles.ts` | CSS generation | All |
| `themes/voxel-fse/app/blocks/src/flex-container/styles.test.ts` | Style tests | All |
| `themes/voxel-fse/app/blocks/src/flex-container/frontend.tsx` | Frontend JS | All |
| `themes/voxel-fse/app/blocks/src/flex-container/frontend.js` | Frontend JS (compiled) | All |
| `themes/voxel-fse/app/blocks/src/flex-container/filters.tsx` | Block filters | All |
| `themes/voxel-fse/app/blocks/src/flex-container/LayoutPresetSelector.tsx` | Layout presets | All |
| `themes/voxel-fse/app/blocks/src/flex-container/inspector/LayoutTab.tsx` | Layout controls | All |
| `themes/voxel-fse/app/blocks/src/flex-container/inspector/StyleTab.tsx` | Style controls | All |
| `themes/voxel-fse/app/blocks/src/flex-container/inspector/ResponsiveIconButtonGroup.tsx` | Responsive icons | All |
| `themes/voxel-fse/app/blocks/src/flex-container/inspector/icons.tsx` | Control icons | All |
| `themes/voxel-fse/shared/controls/` | Shared controls (AdvancedTab, VoxelTab, etc.) | All |
| `themes/voxel-fse/shared/utils/generateAdvancedStyles.ts` | Advanced CSS generation | All |
| `themes/voxel-fse/shared/utils/backgroundElements.tsx` | Background rendering | All |

---

## Architecture Comparison

| Aspect | Elementor Container | FSE Flex Container |
|--------|--------------------|--------------------|
| **Rendering** | PHP server-side (container.php before_render/after_render) | Hybrid: save.tsx (static HTML) + render.php (pass-through) |
| **State Management** | Elementor controls → CSS variables via selectors | React useState/useEffect → generateContainerStyles/generateInnerStyles |
| **Inspector** | Elementor Panel (Layout/Style/Advanced tabs) | InspectorTabs (Layout/Style/Advanced/Voxel tabs) |
| **CSS Approach** | CSS Custom Properties via Elementor selectors | Inline styles + generateAdvancedStyles utility |
| **Inner Blocks** | Elementor elements nested inside container | WordPress InnerBlocks API |
| **Responsive** | Elementor responsive controls (desktop/tablet/mobile) | `_tablet`/`_mobile` attribute suffixes + useSelect device type |
| **Background Video** | HTML5 video tag / YouTube/Vimeo embed via Embed class | renderBackgroundElements shared utility |
| **Background Slideshow** | Swiper.js library | Custom React slideshow with useState cycling |
| **Shape Dividers** | SVG injected via Shapes::get_shape_path() | Shared ShapeDividerControl |
| **Voxel Additions** | container-controller.php hooks into Elementor | VoxelTab shared control component |

---

## HTML Structure Parity

### Elementor Output
```
<div class="elementor-element e-con e-parent e-con-boxed e-flex">
  <div class="e-con-inner">
    <!-- Background video container (if video bg) -->
    <div class="elementor-background-video-container">
      <video class="elementor-background-video-hosted" autoplay muted playsinline loop />
    </div>
    <!-- Shape divider top -->
    <div class="elementor-shape elementor-shape-top" aria-hidden="true">
      <svg>...</svg>
    </div>
    <!-- Child elements/widgets -->
    ...
    <!-- Shape divider bottom -->
    <div class="elementor-shape elementor-shape-bottom" aria-hidden="true">
      <svg>...</svg>
    </div>
  </div>
</div>
```

### FSE Block Output (Editor)
```
<div class="root-voxel-fse-flex-container-{blockId} voxel-fse-flex-container voxel-fse-flex-container-{blockId}">
  <!-- Background elements (video, slideshow, overlay, shape dividers) via renderBackgroundElements() -->
  ...
  <!-- Inner content wrapper -->
  <div class="e-con-inner">
    <!-- Inner blocks -->
    ...
  </div>
</div>
```

### Structure Comparison

| Element | Elementor | FSE | Match |
|---------|-----------|-----|-------|
| Root container | `.e-con` + `.e-parent`/`.e-child` | `.voxel-fse-flex-container-{id}` | ⚠️ Different class names |
| Width mode class | `.e-con-boxed`/`.e-con-full` | Handled via styles.ts | ⚠️ CSS approach differs |
| Layout mode class | `.e-flex`/`.e-grid` | Handled via styles.ts | ⚠️ CSS approach differs |
| Inner wrapper | `.e-con-inner` (only boxed) | `.e-con-inner` (always) | ✅ Same class name |
| Background video | `.elementor-background-video-container` | renderBackgroundElements() | ⚠️ Different implementation |
| Shape dividers | `.elementor-shape.elementor-shape-top` | Shared ShapeDividerControl | ⚠️ Different approach |
| Background overlay | `::before` pseudo-element | renderBackgroundElements() | ⚠️ Different approach |

**Note:** The HTML structure difference is expected and intentional — FSE uses Gutenberg patterns rather than Elementor patterns. The visual output should be equivalent despite structural differences.

---

## Feature Implementation Parity

### Layout Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 1 | Flexbox direction | ✅ row/column/reverse (responsive) | ✅ flexDirection + _tablet/_mobile | ✅ |  |
| 2 | Justify content | ✅ 6 options (responsive) | ✅ justifyContent + _tablet/_mobile | ✅ |  |
| 3 | Align items | ✅ 4 options (responsive) | ✅ alignItems + _tablet/_mobile | ✅ |  |
| 4 | Flex wrap | ✅ nowrap/wrap (responsive) | ✅ flexWrap + _tablet/_mobile | ✅ |  |
| 5 | Align content | ✅ 6 options (when wrap) (responsive) | ✅ alignContent + _tablet/_mobile | ✅ |  |
| 6 | Gaps (column + row) | ✅ GAPS control (responsive) | ✅ columnGap + rowGap + gapsLinked | ✅ |  |
| 7 | CSS Grid columns | ✅ Slider fr/custom (responsive) | ✅ gridColumns + _tablet/_mobile | ✅ |  |
| 8 | CSS Grid rows | ✅ Slider fr/custom (responsive) | ✅ gridRows + _tablet/_mobile | ✅ |  |
| 9 | Grid auto flow | ✅ row/column (responsive) | ✅ gridAutoFlow | ✅ |  |
| 10 | Grid outline (editor) | ✅ Switcher | ✅ gridOutline + data-grid-outline | ✅ |  |
| 11 | Content width (boxed/full) | ✅ Select | ✅ contentWidthType | ✅ |  |
| 12 | Content width value | ✅ Responsive slider | ✅ contentWidth + _tablet/_mobile | ✅ |  |
| 13 | Min height | ✅ Responsive slider (px/em/rem/vh) | ✅ minHeight + _tablet/_mobile | ✅ |  |
| 14 | Overflow | ✅ visible/hidden/auto | ✅ overflow | ✅ |  |
| 15 | HTML tag | ✅ div/header/footer/main/article/section/aside/nav/a | ✅ htmlTag | ✅ |  |
| 16 | Link (when tag=a) | ✅ URL control with dynamic | ⚠️ Not in block.json | ❌ Low priority |
| 17 | Grid justify items | ✅ 4 options (responsive) | ⚠️ Not in block.json | ❌ |
| 18 | Grid align items | ✅ 4 options (responsive) | ⚠️ Not in block.json | ❌ |
| 19 | Grid justify content | ✅ 6 options (conditional) | ⚠️ Not in block.json | ❌ |
| 20 | Grid align content | ✅ 6 options (conditional) | ⚠️ Not in block.json | ❌ |

### Background Features (Style Tab)

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 21 | Background classic (color) | ✅ | ✅ backgroundColor | ✅ |  |
| 22 | Background classic (image) | ✅ Responsive | ✅ backgroundImage + _tablet/_mobile | ✅ |  |
| 23 | Background image position | ✅ Responsive | ✅ bgImagePosition + _tablet/_mobile | ✅ |  |
| 24 | Background image attachment | ✅ | ✅ bgImageAttachment | ✅ |  |
| 25 | Background image repeat | ✅ Responsive | ✅ bgImageRepeat + _tablet/_mobile | ✅ |  |
| 26 | Background image size | ✅ Responsive | ✅ bgImageSize + _tablet/_mobile + custom width | ✅ |  |
| 27 | Background gradient | ✅ Linear/radial | ✅ gradientType/Color/Location/Angle/Position | ✅ |  |
| 28 | Background video | ✅ YouTube/Vimeo/self-hosted | ✅ bgVideoLink + controls | ✅ |  |
| 29 | Video play once | ✅ Switcher | ✅ bgVideoPlayOnce | ✅ |  |
| 30 | Video play on mobile | ✅ Switcher | ✅ bgVideoPlayOnMobile | ✅ |  |
| 31 | Video privacy mode | ✅ | ✅ bgVideoPrivacyMode | ✅ |  |
| 32 | Video fallback image | ✅ | ✅ bgVideoFallback | ✅ |  |
| 33 | Background slideshow | ✅ Swiper | ✅ bgSlideshowGallery + controls | ✅ |  |
| 34 | Slideshow infinite loop | ✅ | ✅ bgSlideshowInfiniteLoop | ✅ |  |
| 35 | Slideshow duration | ✅ | ✅ bgSlideshowDuration | ✅ |  |
| 36 | Slideshow transition | ✅ | ✅ bgSlideshowTransition | ✅ |  |
| 37 | Slideshow Ken Burns | ✅ CSS classes | ✅ bgSlideshowKenBurns + direction | ✅ |  |
| 38 | Slideshow lazy load | ✅ | ✅ bgSlideshowLazyload | ✅ |  |
| 39 | Background hover color | ✅ | ✅ backgroundColorHover | ✅ |  |
| 40 | Background hover image | ✅ | ✅ backgroundImageHover + _tablet/_mobile | ✅ |  |
| 41 | BG transition duration | ✅ 0-3s slider | ✅ bgTransitionDuration | ✅ |  |
| 42 | Video background color | ✅ | ✅ bgVideoColor | ✅ |  |

### Background Overlay Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 43 | Overlay type (classic/gradient) | ✅ | ✅ bgOverlayType | ✅ |  |
| 44 | Overlay color | ✅ | ✅ bgOverlayColor | ✅ |  |
| 45 | Overlay image | ✅ Responsive | ✅ bgOverlayImage + _tablet/_mobile | ✅ |  |
| 46 | Overlay opacity | ✅ 0-1 slider | ✅ bgOverlayOpacity | ✅ |  |
| 47 | Overlay CSS filters | ✅ blur/brightness/contrast/etc | ✅ bgOverlayCssFilters | ✅ |  |
| 48 | Overlay blend mode | ✅ 10+ modes | ⚠️ Not in block.json | ❌ |
| 49 | Overlay gradient | ✅ | ✅ bgOverlayGradient* attributes | ✅ |  |
| 50 | Overlay hover type | ✅ | ✅ bgOverlayTypeHover | ✅ |  |
| 51 | Overlay hover color | ✅ | ✅ bgOverlayColorHover | ✅ |  |
| 52 | Overlay hover opacity | ✅ | ✅ bgOverlayOpacityHover | ✅ |  |
| 53 | Overlay hover CSS filters | ✅ | ✅ bgOverlayCssFiltersHover | ✅ |  |
| 54 | Overlay transition duration | ✅ | ✅ bgOverlayTransitionDuration | ✅ |  |

### Border & Effects Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 55 | Border type/width/color | ✅ Group control | ✅ borderType/Width/Color | ✅ |  |
| 56 | Border radius | ✅ Responsive dimensions | ✅ borderRadiusDimensions + responsive | ✅ |  |
| 57 | Box shadow (normal) | ✅ Group control | ✅ boxShadow | ✅ |  |
| 58 | Border hover type/width/color | ✅ | ✅ borderTypeHover/WidthHover/ColorHover | ✅ |  |
| 59 | Border radius hover | ✅ | ✅ borderRadiusHover | ✅ |  |
| 60 | Box shadow hover | ✅ | ✅ boxShadowHover | ✅ |  |
| 61 | Border transition duration | ✅ 0-3s | ✅ transitionDuration | ✅ |  |

### Shape Divider Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 62 | Shape divider top | ✅ VISUAL_CHOICE + SVG | ✅ shapeDividerTop object | ✅ |  |
| 63 | Shape divider bottom | ✅ VISUAL_CHOICE + SVG | ✅ shapeDividerBottom object | ✅ |  |
| 64 | Shape color | ✅ Per side | ✅ In shape object | ✅ |  |
| 65 | Shape width | ✅ Responsive slider | ✅ In shape object | ✅ |  |
| 66 | Shape height | ✅ Responsive slider | ✅ In shape object | ✅ |  |
| 67 | Shape flip | ✅ Switcher | ✅ In shape object | ✅ |  |
| 68 | Shape invert | ✅ Switcher | ✅ In shape object | ✅ |  |
| 69 | Shape bring to front | ✅ Switcher | ✅ In shape object | ✅ |  |

### Advanced Tab Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 70 | Margin (responsive) | ✅ DIMENSIONS | ✅ blockMargin + _tablet/_mobile | ✅ |  |
| 71 | Padding (responsive) | ✅ DIMENSIONS | ✅ blockPadding + _tablet/_mobile | ✅ |  |
| 72 | Position (absolute/fixed) | ✅ Select | ✅ position | ✅ |  |
| 73 | Position offsets | ✅ Responsive sliders + orientation | ✅ offsetX/Y/XEnd/YEnd + orientation | ✅ |  |
| 74 | Z-index | ✅ Responsive number | ✅ zIndex + _tablet/_mobile | ✅ |  |
| 75 | CSS ID | ✅ Text input | ✅ elementId | ✅ |  |
| 76 | CSS Classes | ✅ Text input | ✅ customClasses | ✅ |  |
| 77 | Custom Attributes | ✅ Textarea key|value | ✅ customAttributes | ✅ |  |
| 78 | Custom CSS | ✅ Code editor | ✅ customCSS | ✅ |  |
| 79 | Hide desktop | ✅ Switcher | ✅ hideDesktop | ✅ |  |
| 80 | Hide tablet | ✅ Switcher | ✅ hideTablet | ✅ |  |
| 81 | Hide mobile | ✅ Switcher | ✅ hideMobile | ✅ |  |
| 82 | Opacity | ✅ | ✅ opacity | ✅ |  |
| 83 | Element width | ✅ Responsive | ✅ elementWidth + _tablet/_mobile | ✅ |  |

### Transform Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 84 | Rotate Z | ✅ Responsive | ✅ transformRotateZ + _tablet/_mobile | ✅ |  |
| 85 | Rotate X | ✅ Responsive | ✅ transformRotateX + _tablet/_mobile | ✅ |  |
| 86 | Rotate Y | ✅ Responsive | ✅ transformRotateY + _tablet/_mobile | ✅ |  |
| 87 | Translate X | ✅ Responsive | ✅ transformOffsetX + _tablet/_mobile | ✅ |  |
| 88 | Translate Y | ✅ Responsive | ✅ transformOffsetY + _tablet/_mobile | ✅ |  |
| 89 | Scale X | ✅ Responsive | ✅ transformScaleX + _tablet/_mobile | ✅ |  |
| 90 | Scale Y | ✅ Responsive | ✅ transformScaleY + _tablet/_mobile | ✅ |  |
| 91 | Skew X | ✅ Responsive | ✅ transformSkewX + _tablet/_mobile | ✅ |  |
| 92 | Skew Y | ✅ Responsive | ✅ transformSkewY + _tablet/_mobile | ✅ |  |
| 93 | Flip horizontal | ✅ | ✅ transformFlipH | ✅ |  |
| 94 | Flip vertical | ✅ | ✅ transformFlipV | ✅ |  |

### CSS Mask Features

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 95 | Mask enable | ⚠️ Pro/Separate module | ✅ maskSwitch | ✅ FSE bonus |
| 96 | Mask shape | ⚠️ | ✅ maskShape | ✅ |  |
| 97 | Mask image | ⚠️ | ✅ maskImage + responsive | ✅ |  |
| 98 | Mask size/position/repeat | ⚠️ | ✅ All responsive variants | ✅ |  |

### Motion Effects

| # | Feature | Elementor | FSE | Match | Notes |
|---|---------|-----------|-----|-------|-------|
| 99 | Scrolling effects | ⚠️ Pro feature | ✅ motionFxScrolling* | ✅ FSE includes it |
| 100 | Mouse effects | ⚠️ Pro feature | ✅ motionFxMouse* | ✅ FSE includes it |
| 101 | Entrance animation | ✅ animation/duration/delay | ⚠️ Not in block.json | ❌ |

### Voxel Tab Features

| # | Feature | Elementor (via container-controller.php) | FSE | Match | Notes |
|---|---------|------------------------------------------|-----|-------|-------|
| 102 | Sticky enable | ✅ Switcher | ✅ stickyEnabled | ✅ |  |
| 103 | Sticky per device | ✅ desktop/tablet/mobile select | ✅ stickyDesktop/Tablet/Mobile | ✅ |  |
| 104 | Sticky offsets | ✅ top/left/right/bottom responsive | ✅ stickyTop/Left/Right/Bottom | ✅ |  |
| 105 | Inline flex | ✅ Responsive switcher | ✅ enableInlineFlex + _tablet/_mobile | ✅ |  |
| 106 | Calc min-height | ✅ Text input responsive | ✅ calcMinHeight + _tablet/_mobile | ✅ |  |
| 107 | Calc max-height | ✅ Text input responsive | ✅ calcMaxHeight + _tablet/_mobile | ✅ |  |
| 108 | Scrollbar color | ✅ Color control | ✅ scrollbarColor | ✅ |  |
| 109 | Backdrop blur | ✅ Responsive switcher + slider | ✅ backdropBlurStrength + _tablet/_mobile | ✅ |  |
| 110 | Visibility behavior | ✅ (Elementor Display Conditions) | ✅ visibilityBehavior + visibilityRules | ✅ |  |
| 111 | Loop feature | N/A (not in Elementor) | ✅ loopEnabled/Source/Property/Limit/Offset | ✅ FSE bonus |
| 112 | Editor preview width | ✅ Slider 350-1200px | ⚠️ Not in block.json | ❌ |

### FSE Bonus Features (Not in Elementor)

| # | Feature | FSE Implementation | Notes |
|---|---------|-------------------|-------|
| B1 | Layout presets | LayoutPresetSelector.tsx | Pre-configured layouts for new containers |
| B2 | Inspector state persistence | inspectorActiveTab, openPanels, *OpenPanel | Remembers which tab/panel was open |
| B3 | Scroll position preservation | useRef + useLayoutEffect in edit.tsx | Preserves scroll when switching device preview |
| B4 | Block filters | filters.tsx | WordPress block editor filters for wrapper props |
| B5 | CSS Mask (full) | 19 mask-related attributes | More complete than Elementor's approach |
| B6 | Motion effects (non-Pro) | motionFx* attributes | Included without Pro requirement |
| B7 | Loop feature | VoxelTab loop controls | Template looping for dynamic content |

---

## Identified Gaps

### Gap #1: Grid Justify/Align Items & Content (Severity: Medium)
**Elementor behavior:** Grid containers have justify-items, align-items, justify-content, and align-content controls (grid-container.php:130-263). These control cell alignment within the grid.
**FSE behavior:** Only `gridAutoFlow` is present. Missing: `gridJustifyItems`, `gridAlignItems`, `gridJustifyContent`, `gridAlignContent`.
**Impact:** Grid layouts cannot fine-tune cell alignment. Items default to stretch.
**Fix:** Add 4 grid alignment attributes to block.json and corresponding controls to LayoutTab.tsx.

### Gap #2: Entrance Animation (Severity: Low)
**Elementor behavior:** Container.php lines 1824-1865 provides `animation`, `animation_duration`, and `animation_delay` controls for entrance animations (fadeIn, slideInUp, etc.).
**FSE behavior:** No entrance animation attributes in block.json. Motion effects (scrolling/mouse) are present.
**Impact:** Containers don't animate on first scroll into viewport.
**Fix:** Add animation/duration/delay attributes and implement IntersectionObserver-based trigger in frontend.tsx.

### Gap #3: Overlay Blend Mode (Severity: Low)
**Elementor behavior:** Container.php lines 857-893 provides `overlay_blend_mode` with 10+ CSS mix-blend-mode options.
**FSE behavior:** `bgOverlayCssFilters` exists but no blend mode attribute found in block.json.
**Impact:** Cannot create advanced overlay effects like multiply/screen/overlay blending.
**Fix:** Add `bgOverlayBlendMode` and `bgOverlayBlendModeHover` attributes.

### Gap #4: Flex Item Controls (Severity: Medium)
**Elementor behavior:** Advanced tab provides align-self, order, size, grow, shrink for child containers (Group_Control_Flex_Item, container.php:1499-1514).
**FSE behavior:** Not found in block.json.
**Impact:** Child containers cannot override parent flex alignment or control sizing.
**Fix:** Add flex item attributes to block.json and controls to AdvancedTab. Note: May not be needed if Gutenberg handles block alignment differently.

### Gap #5: Grid Item Controls (Severity: Medium)
**Elementor behavior:** Advanced tab provides column/row span controls (1-12 or custom text) for child containers in grid layout (container.php:1410-1497).
**FSE behavior:** Not found in block.json.
**Impact:** Grid children cannot span multiple columns/rows.
**Fix:** Add gridColumn/gridRow attributes. Note: Verify if Gutenberg column block handles this differently.

### Gap #6: Link Support for `<a>` Tag (Severity: Low)
**Elementor behavior:** When htmlTag is set to 'a', a URL control appears for the container link (container.php:610-621).
**FSE behavior:** htmlTag attribute exists but no link/URL attribute found.
**Impact:** Containers set to `<a>` tag have no href to link to.
**Fix:** Add `containerLink` attribute and render in save.tsx/render.php.

### Gap #7: Editor Preview Width (Severity: Low)
**Elementor behavior:** Voxel's container-controller.php adds an "Editor preview width" slider (350-1200px) that constrains the editor canvas width for card design.
**FSE behavior:** Not found in block.json.
**Impact:** Cannot preview cards at specific widths during editing.
**Fix:** May not be needed for Gutenberg which has responsive preview built-in.

---

## Summary

### What Works Well (~93%)
- **Complete flexbox layout system** (direction, justify, align, wrap, gap, align-content) — all responsive
- **Full CSS Grid** (columns, rows, auto-flow, outline) — responsive
- **Comprehensive background system** (classic, gradient, video, slideshow + hover states)
- **Background overlay** with CSS filters, opacity, hover states — responsive
- **Shape dividers** top/bottom with all options
- **Border & box shadow** with normal/hover states
- **Full transform system** (rotate X/Y/Z, translate, scale, skew, flip) — all responsive
- **CSS Mask** with responsive shape/image/size/position/repeat
- **Motion effects** (scrolling + mouse) included without Pro requirement
- **Complete Advanced tab** (margin, padding, position, offsets, z-index, visibility, custom CSS)
- **All Voxel additions** (sticky, inline flex, calc height, backdrop blur, visibility, loop)
- **Bonus features**: Layout presets, inspector state persistence, scroll preservation

### Gaps to Fix (~7%)
1. Grid alignment controls (justify-items, align-items, justify-content, align-content) — **Medium**
2. Flex item controls (align-self, order, grow, shrink) — **Medium**
3. Entrance animation (fadeIn, slideIn, etc.) — **Low**
4. Overlay blend mode — **Low**
5. Link URL for `<a>` tag — **Low**
6. Editor preview width — **Low** (may not be needed)

### Priority Fix Order
1. **Grid alignment controls** — Needed for non-trivial grid layouts
2. **Flex item controls** — Important for nested container behavior
3. **Overlay blend mode** — Quick add, single attribute
4. **Entrance animation** — Nice-to-have, requires frontend JS
5. **Link URL for `<a>` tag** — Low usage but important when needed
6. **Editor preview width** — Gutenberg has responsive preview already

---

## Attribute Count Comparison

| Category | Elementor Controls | FSE Attributes | Coverage |
|----------|-------------------|----------------|----------|
| Layout | ~20 controls | 47 attributes | ✅ 100% |
| Background | ~15 controls | 79 attributes | ✅ 100% |
| Background Extended (Video/Slideshow) | ~12 controls | 21 attributes | ✅ 100% |
| Background Overlay | ~10 controls | 79 attributes | ⚠️ 95% (missing blend mode) |
| Border & Effects | ~12 controls | 16 attributes | ✅ 100% |
| Shape Dividers | ~14 controls (7 per side) | 2 objects | ✅ 100% |
| Advanced/Position | ~15 controls | 31 attributes | ✅ 100% |
| Transform | ~11 controls | 42 attributes | ✅ 100% |
| Mask | ~8 controls | 27 attributes | ✅ 100% (FSE bonus) |
| Motion Effects | ~6 controls (Pro) | 6 attributes | ✅ FSE includes |
| Voxel Custom | ~13 controls | 28 attributes | ✅ 100% |
| Grid Alignment | ~4 controls | 0 attributes | ❌ Missing |
| Flex Item | ~5 controls | 0 attributes | ❌ Missing |
| Animation | ~3 controls | 0 attributes | ❌ Missing |
| **Total** | **~148 controls** | **357 attributes** | **~93%** |

**Note:** FSE has more attributes than Elementor controls because each responsive control maps to 3 attributes (desktop/_tablet/_mobile) and normal/hover states double the count.
