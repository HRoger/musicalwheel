# Timeline Kit Widget vs Block — Parity Audit

**Date:** 2026-02-11
**Overall Parity:** 100%
**Status:** Complete — all Voxel controls matched, FSE exceeds Voxel with extras

---

## Reference Files

| Source | File | Purpose |
|--------|------|---------|
| Voxel Widget | `themes/voxel/app/widgets/timeline-kit.php` | Elementor controls (~40 controls) |
| Voxel Template | `themes/voxel/templates/widgets/timeline-kit.php` | Static HTML output (8 demo items) |
| Voxel CSS | `themes/voxel/assets/dist/social-feed.css` | Timeline feed styles |
| FSE block.json | `themes/voxel-fse/app/blocks/src/timeline-kit/block.json` | Block registration (75+ attributes) |
| FSE edit.tsx | `themes/voxel-fse/app/blocks/src/timeline-kit/edit.tsx` | Editor component (98 lines) |
| FSE save.tsx | `themes/voxel-fse/app/blocks/src/timeline-kit/save.tsx` | Saved output (70 lines) |
| FSE Demofeed | `themes/voxel-fse/app/blocks/src/timeline-kit/Demofeed.tsx` | Shared demo feed (407 lines) |
| FSE StyleTab | `themes/voxel-fse/app/blocks/src/timeline-kit/inspector/StyleTab.tsx` | Inspector controls (437 lines) |
| FSE generateCSS | `themes/voxel-fse/app/blocks/src/timeline-kit/generateCSS.ts` | CSS generation (324 lines) |
| FSE types | `themes/voxel-fse/app/blocks/src/timeline-kit/types.ts` | Type definitions (126 lines) |
| Existing docs | `docs/block-conversions/timeline-kit/timeline-kit-lessons-learned.md` | Conversion lessons |
| Voxel HTML | `docs/block-conversions/timeline-kit/voxel.html` | Original HTML snapshot |
| FSE HTML | `docs/block-conversions/timeline-kit/voxel-fse.html` | FSE HTML snapshot |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Type** | Static style kit (CSS-only) | Static style kit (CSS-only) |
| **JavaScript** | None | None (no viewScript) |
| **AJAX** | None | None |
| **Rendering** | PHP template with hardcoded HTML | Demofeed.tsx shared component + save.tsx |
| **CSS Strategy** | Elementor controls → CSS selectors on `.vxfeed` | Gutenberg attributes → generateCSS.ts → `<style>` tag |
| **State Management** | N/A (no JS) | Block attributes only |
| **Inspector** | Style tab only (~40 Elementor controls) | Style + Advanced + Voxel tabs |
| **Responsive** | Elementor responsive toggle | ResponsiveRangeControl with device switcher |
| **CSS Variables** | Set via Elementor selectors | Set via generateCSS.ts on `.vxfeed` |

---

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.vxfeed.demofeed` | `.vxfeed.demofeed` (inside block wrapper) | ✅ |
| Create post (collapsed) | `.vxf-create-post.flexify` | `.vxf-create-post.flexify` | ✅ |
| Create post (expanded) | `.vxf-create-post.flexify.vxf-expanded` | `.vxf-create-post.flexify.vxf-expanded` | ✅ |
| Avatar | `.vxf-avatar.flexify > img` | `.vxf-avatar.flexify > img` | ✅ |
| Textarea | `.vxf-content__textarea` | `.vxf-content__textarea` | ✅ |
| Highlighter | `.vxf-content__highlighter` | `.vxf-content__highlighter` | ✅ |
| File upload section | `.ts-file-upload.vxf-create-section` | `.ts-file-upload.vxf-create-section` | ✅ |
| File items | `.ts-file.ts-file-img` | `.ts-file.ts-file-img` | ✅ |
| Star ratings | `.rs-stars.simplify-ul.flexify` | `.rs-stars.simplify-ul.flexify` | ✅ |
| Number ratings | `.rs-num.simplify-ul.flexify` | `.rs-num.simplify-ul.flexify` | ✅ |
| Ray animations | `.ray-holder > .ray` (×8) | `.ray-holder > .ray` (×8) | ✅ |
| Footer actions | `.vxf-footer.flexify > .vxf-actions.flexify` | `.vxf-footer.flexify > .vxf-actions.flexify` | ✅ |
| Buttons | `.ts-btn.ts-btn-1`, `.ts-btn-2` | `.ts-btn.ts-btn-1`, `.ts-btn-2` | ✅ |
| Filters section | `.vxf-filters` | `.vxf-filters` | ✅ |
| Post container | `.vxf-post` | `.vxf-post` | ✅ |
| Post highlight | `.vxf-highlight.flexify` | `.vxf-highlight.flexify` | ✅ |
| Post head | `.vxf-head.flexify` | `.vxf-head.flexify` | ✅ |
| User info | `.vxf-user.flexify` | `.vxf-user.flexify` | ✅ |
| Verified badge | `.vxf-icon.vxf-verified` | `.vxf-icon.vxf-verified` | ✅ |
| More icon | `.vxf-icon.vxf-more` | `.vxf-icon.vxf-more` | ✅ |
| Post body | `.vxf-body > .vxf-body-text` | `.vxf-body > .vxf-body-text` | ✅ |
| Gallery | `.vxf-gallery.simplify-ul` | `.vxf-gallery.simplify-ul` | ✅ |
| Liked state | `.vxf-liked` | `.vxf-liked` | ✅ |
| Reposted state | `.vxf-reposted` | `.vxf-reposted` | ✅ |
| Has-replies | `.vxf-has-replies` | `.vxf-has-replies` | ✅ |
| Recent likes | `.vxf-recent-likes.flexify` | `.vxf-recent-likes.flexify` | ✅ |
| Review score | `.rev-score` with `--ts-accent-1` | `.rev-score` with `--ts-accent-1` | ✅ |
| Review stars display | `.rev-star-score.flexify.simplify-ul` | `.rev-star-score.flexify.simplify-ul` | ✅ |
| Review categories | `.rev-cats` | `.rev-cats` | ✅ |
| Quoted/reposted post | — | `.vxf-post.vxf__quoted-post` (nested) | ✅ Extra |
| Link preview | — | `.vxf-link.flexify` | ✅ Extra |
| Load more buttons | — | `.ts-load-more.ts-btn.ts-btn-1` | ✅ Extra |
| Loading spinner | — | `.ts-loader` styles in generateCSS | ✅ Extra |

**HTML Parity: ~100%** — FSE includes all Voxel elements plus additional demo items (quoted post, link preview, load more).

---

## Style Controls Parity

### Section: General (`ts_vxfeed_general`)

| # | Voxel Control ID | Label | Type | FSE Attribute | FSE Component | Match |
|---|-----------------|-------|------|---------------|---------------|-------|
| 1 | `vxf-text-1` | Primary text | COLOR | `vxfText1` | ColorControl | ✅ |
| 2 | `vxf-text-2` | Secondary text | COLOR | `vxfText2` | ColorControl | ✅ |
| 3 | `vxf-text-3` | Link color | COLOR | `vxfText3` | ColorControl | ✅ |
| 4 | `vxf-bg` | Background | COLOR | `vxfBg` | ColorControl | ✅ |
| 5 | `vxf-border` | Border Color | COLOR | `vxfBorder` | ColorControl | ✅ |
| 6 | `vxf-detail` | Detail color | COLOR | `vxfDetail` | ColorControl | ✅ |
| 7 | `vxf-shadow` | Box Shadow | BOX_SHADOW | `vxfShadow` | BoxShadowPopup | ✅ |
| 8 | `xl-radius` | XL radius | SLIDER (responsive) | `xlRadius` | ResponsiveRangeControl | ✅ |
| 9 | `lg-radius` | LG radius | SLIDER (responsive) | `lgRadius` | ResponsiveRangeControl | ✅ |
| 10 | `md-radius` | MD radius | SLIDER (responsive) | `mdRadius` | ResponsiveRangeControl | ✅ |

**General: 10/10 ✅**

### Section: Icons (`ts_vxfeed_actions`)

| # | Voxel Control ID | Label | Type | FSE Attribute | FSE Component | Match |
|---|-----------------|-------|------|---------------|---------------|-------|
| 1 | `main-icon-size` | Post Actions | SLIDER (responsive) | `mainIconSize` | ResponsiveRangeControl | ✅ |
| 2 | `reply-icon-size` | Reply actions | SLIDER (responsive) | `replyIconSize` | ResponsiveRangeControl | ✅ |
| 3 | `vxf-action-1` | Icon color | COLOR | `vxfAction1` | ColorControl | ✅ |
| 4 | `vxf-action-2` | Liked Icon color | COLOR | `vxfAction2` | ColorControl | ✅ |
| 5 | `vxf-action-3` | Reposted Icon color | COLOR | `vxfAction3` | ColorControl | ✅ |
| 6 | `vxf-action-4` | Verified Icon color | COLOR | `vxfAction4` | ColorControl | ✅ |
| 7 | `vxf-action-5` | Star Icon color | COLOR | `vxfAction5` | ColorControl | ✅ |

**Icons: 7/7 ✅**

### Section: Post Reviews (`ts_kit_reviews`)

| # | Voxel Control ID | Label | Type | FSE Attribute | FSE Component | Match |
|---|-----------------|-------|------|---------------|---------------|-------|
| 1 | `rev-min-width` | Review categories (Min width) | SLIDER (responsive) | `revMinWidth` | ResponsiveRangeControl | ✅ |

**Reviews: 1/1 ✅**

### Section: Buttons — Normal State (`ts_sfc_normal`)

| # | Voxel Control ID | Label | Type | FSE Attribute | FSE Component | Match |
|---|-----------------|-------|------|---------------|---------------|-------|
| 1 | `ts_popup_btn_typo` | Button typography | TYPOGRAPHY | `tsPopupBtnTypo` | TypographyControl | ✅ |
| 2 | `ts_popup_btn_radius` | Border radius | SLIDER | `tsPopupBtnRadius` | ResponsiveRangeControl | ✅ |
| 3 | `ts_popup_button_1` | Primary - Background | COLOR | `tsPopupButton1` | ColorControl | ✅ |
| 4 | `ts_popup_button_1_c` | Primary - Text color | COLOR | `tsPopupButton1C` | ColorControl | ✅ |
| 5 | `ts_popup_button_1_icon` | Primary - Icon color | COLOR | `tsPopupButton1Icon` | ColorControl | ✅ |
| 6 | `ts_popup_button_1_border` | Primary - Border | BORDER | `tsPopupButton1Border*` | BorderGroupControl | ✅ |
| 7 | `ts_popup_button_2` | Accent - Background | COLOR | `tsPopupButton2` | ColorControl | ✅ |
| 8 | `ts_popup_button_2_c` | Accent - Text color | COLOR | `tsPopupButton2C` | ColorControl | ✅ |
| 9 | `ts_popup_button_2_icon` | Accent - Icon color | COLOR | `tsPopupButton2Icon` | ColorControl | ✅ |
| 10 | `ts_popup_button_2_border` | Accent - Border | BORDER | `tsPopupButton2Border*` | BorderGroupControl | ✅ |
| 11 | `ts_popuptertiary_2` | Tertiary - Background | COLOR | `tsPopuptertiary2` | ColorControl | ✅ |
| 12 | `ts_popup_tertiary_2_c` | Tertiary - Text color | COLOR | `tsPopupTertiary2C` | ColorControl | ✅ |
| 13 | `ts_popup_button_3_icon` | Tertiary - Icon color | COLOR | `tsPopupButton3Icon` | ColorControl | ✅ |
| 14 | — | Tertiary - Border | BORDER | — | — | ⚠️ Missing |

**Buttons Normal: 13/14** — Tertiary button border not implemented in Voxel either (no `ts_popuptertiary_border`), but Voxel _does_ have borders on Primary and Accent. Tertiary has no border control in Voxel — so this is actually **13/13 ✅** (no gap).

### Section: Buttons — Hover State (`ts_sfc_hover`)

| # | Voxel Control ID | Label | Type | FSE Attribute | FSE Component | Match |
|---|-----------------|-------|------|---------------|---------------|-------|
| 1 | `ts_popup_button_1_h` | Primary - Hover bg | COLOR | `tsPopupButton1H` | ColorControl | ✅ |
| 2 | `ts_popup_button_1_c_h` | Primary - Hover text | COLOR | `tsPopupButton1CH` | ColorControl | ✅ |
| 3 | `ts_popup_button_1_icon_h` | Primary - Hover icon | COLOR | `tsPopupButton1IconH` | ColorControl | ✅ |
| 4 | `ts_popup_button_1_border_h` | Primary - Hover border | COLOR | `tsPopupButton1BH` | ColorControl | ✅ |
| 5 | `ts_popup_button_2_h` | Accent - Hover bg | COLOR | `tsPopupButton2H` | ColorControl | ✅ |
| 6 | `ts_popup_button_2_c_h` | Accent - Hover text | COLOR | `tsPopupButton2CH` | ColorControl | ✅ |
| 7 | `ts_popup_button_2_icon_h` | Accent - Hover icon | COLOR | `tsPopupButton2IconH` | ColorControl | ✅ |
| 8 | `ts_popup_button_2_border_h` | Accent - Hover border | COLOR | `tsPopupButton2BH` | ColorControl | ✅ |
| 9 | `ts_popup_tertiary_h` | Tertiary - Hover bg | COLOR | `tsPopupTertiary2H` | ColorControl | ✅ |
| 10 | `ts_popup_tertiary_c_h` | Tertiary - Hover text | COLOR | `tsPopupTertiary2CH` | ColorControl | ✅ |
| 11 | `ts_popup_tertiary_icon_h` | Tertiary - Hover icon | COLOR | `tsPopupTertiaryIconH` | ColorControl | ✅ |

**Buttons Hover: 11/11 ✅**

### Extra FSE Controls (Not in Voxel)

| # | FSE Attribute | Label | Component | Purpose |
|---|---------------|-------|-----------|---------|
| 1 | `tmColor1` | Loading spinner color 1 | ColorControl | `.ts-loader` border-color |
| 2 | `tmColor2` | Loading spinner color 2 | ColorControl | `.ts-loader` border-bottom-color |
| 3 | `visibilityBehavior` | Visibility | VoxelTab | Conditional visibility |
| 4 | `loopEnabled` | Loop | VoxelTab | Loop rendering |

**FSE adds 4 extra controls beyond Voxel** (loading spinner colors + VoxelTab features).

---

## CSS Generation Parity

| CSS Property | Voxel Selector | FSE Selector | Match |
|-------------|---------------|-------------|-------|
| `--main-text` | `.vxfeed` | `.vxfeed` | ✅ |
| `--faded-text` | `.vxfeed` | `.vxfeed` | ✅ |
| `--main-link` | `.vxfeed` | `.vxfeed` | ✅ |
| `--main-bg` | `.vxfeed` | `.vxfeed` | ✅ |
| `--main-border` | `.vxfeed` | `.vxfeed` | ✅ |
| `--detail-color` | `.vxfeed` | `.vxfeed` | ✅ |
| `--xl-radius` | `.vxfeed` | `.vxfeed` | ✅ |
| `--lg-radius` | `.vxfeed` | `.vxfeed` | ✅ |
| `--md-radius` | `.vxfeed` | `.vxfeed` | ✅ |
| `--main-icon-size` | `.vxfeed` | `.vxfeed` | ✅ |
| `--reply-icon-size` | `.vxfeed` | `.vxfeed` | ✅ |
| `--main-icon-color` | `.vxfeed` | `.vxfeed` | ✅ |
| box-shadow | `.vxf-post, .vxf-create-post` | `.vxf-post, .vxf-create-post` | ✅ |
| `--ts-icon-color` (liked) | `.vxf-liked` | `.vxf-liked` | ✅ |
| `--ts-icon-color` (reposted) | `.vxf-reposted` | `.vxf-reposted` | ✅ |
| `--ts-icon-color` (verified) | `.vxf-verified` | `.vxf-verified` | ✅ |
| `--ts-icon-color` (stars) | `.rs-stars li .ts-star-icon` | `.rs-stars li .ts-star-icon` | ✅ |
| `--max-r-width` | `.rev-cats` | `.rev-cats` | ✅ |
| Button typography | `.vxfeed .ts-btn` | `.vxfeed .ts-btn` | ✅ |
| Button radius | `.vxfeed .ts-btn` | `.vxfeed .ts-btn` | ✅ |
| Primary normal | `.vxfeed .ts-btn-1` | `.vxfeed .ts-btn-1` | ✅ |
| Primary hover | `.vxfeed .ts-btn-1:hover` | `.vxfeed .ts-btn-1:hover` | ✅ |
| Accent normal | `.vxfeed .ts-btn-2` | `.vxfeed .ts-btn-2` | ✅ |
| Accent hover | `.vxfeed .ts-btn-2:hover` | `.vxfeed .ts-btn-2:hover` | ✅ |
| Tertiary normal | `.vxfeed .ts-btn-4` | `.vxfeed .ts-btn-4` | ✅ |
| Tertiary hover | `.vxfeed .ts-btn-4:hover` | `.vxfeed .ts-btn-4:hover` | ✅ |
| Spinner colors | — | `.vxfeed .ts-loader` | ✅ Extra |

**CSS Generation Parity: 100%** — All Voxel selectors matched exactly + 1 extra (spinner).

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Create post composer (collapsed) | ✅ Static HTML | ✅ Demofeed.tsx | ✅ |
| 2 | Create post composer (expanded) | ✅ Static HTML | ✅ Demofeed.tsx | ✅ |
| 3 | File upload preview | ✅ 3 file items | ✅ 3 file items | ✅ |
| 4 | Star rating input | ✅ 5 stars + rays | ✅ 5 stars + rays | ✅ |
| 5 | Number rating input | ✅ 1-5 scale | ✅ 1-5 scale | ✅ |
| 6 | Post actions (like/repost/share/comment) | ✅ | ✅ | ✅ |
| 7 | Liked/reposted states | ✅ `.vxf-liked`, `.vxf-reposted` | ✅ Same classes | ✅ |
| 8 | Verified badge | ✅ `.vxf-verified` | ✅ Same class | ✅ |
| 9 | Image gallery (3 images) | ✅ `.vxf-gallery` | ✅ Same class | ✅ |
| 10 | Review score with stars | ✅ `.rev-score` | ✅ Same class | ✅ |
| 11 | Highlight notification | ✅ `.vxf-highlight` | ✅ Same class | ✅ |
| 12 | Search filter | ✅ `.vxf-filters` | ✅ Same class | ✅ |
| 13 | Recent likes avatars | ✅ `.vxf-recent-likes` | ✅ Same class | ✅ |
| 14 | Ray animations (8 rays) | ✅ `.ray-holder > .ray` | ✅ Same structure | ✅ |
| 15 | Button variants (btn-1, btn-2, btn-4) | ✅ 3 variants | ✅ 3 variants | ✅ |
| 16 | Responsive controls | ✅ Elementor responsive | ✅ ResponsiveRangeControl | ✅ |
| 17 | Normal/hover button states | ✅ Elementor tabs | ✅ `buttonsState` attribute | ✅ |
| 18 | Quoted/reposted post | ❌ Not in kit | ✅ Added in FSE | ✅ Extra |
| 19 | Link preview | ❌ Not in kit | ✅ Added in FSE | ✅ Extra |
| 20 | Load more buttons | ❌ Not in kit | ✅ Added in FSE | ✅ Extra |
| 21 | Loading spinner styling | ❌ Not in kit | ✅ Added in FSE | ✅ Extra |
| 22 | Visibility/Loop (VoxelTab) | ❌ Not in Elementor | ✅ VoxelTab | ✅ Extra |

**Feature Parity: 17/17 Voxel features + 5 extras in FSE**

---

## Identified Gaps

None. All Voxel controls are fully matched in FSE.

---

## Summary

### What Works Well (100%)

- **HTML Structure:** 100% match — all CSS classes, nesting, and data attributes are identical
- **CSS Variables:** 100% match — all 15 CSS custom properties target the same selectors
- **Controls:** 100% match — all ~40 Elementor controls mapped to Gutenberg equivalents
- **Responsive:** Full device-responsive support with Desktop/Tablet/Mobile breakpoints
- **Button States:** Normal + Hover tabs implemented with state toggle
- **Architecture:** Clean separation (inspector/, Demofeed.tsx, generateCSS.ts)
- **Extra Features:** FSE adds quoted posts, link previews, load more, spinner, VoxelTab

### Final Assessment

The timeline-kit block achieves **100% parity** with the Voxel widget. The FSE implementation exceeds Voxel by including additional demo items (quoted posts, link previews, load more buttons) and extra features (loading spinner styling, VoxelTab visibility/loop).

**Recommendation:** ✅ Production-ready.
