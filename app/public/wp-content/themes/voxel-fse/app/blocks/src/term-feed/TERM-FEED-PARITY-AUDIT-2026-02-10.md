# Term Feed Block - 1:1 Parity Audit

**Date:** 2026-02-10
**Auditor:** Claude
**Block:** `voxel-fse/term-feed`
**Parity Score:** 99% (1 gap found and fixed)

## Source Files Compared

### Voxel Parent (Source of Truth)
- `themes/voxel/app/widgets/term-feed.php` (721 lines) - Widget class with controls + render
- `themes/voxel/templates/widgets/term-feed.php` (28 lines) - Template
- `themes/voxel/templates/widgets/post-feed/carousel-nav.php` (14 lines) - Shared carousel nav

### FSE Child (Implementation)
- `blocks/src/term-feed/shared/TermFeedComponent.tsx` (392 lines) - Shared component
- `blocks/src/term-feed/frontend.tsx` (600 lines) - Frontend entry point
- `blocks/src/term-feed/save.tsx` (189 lines) - Save component
- `blocks/src/term-feed/styles.ts` (265 lines) - CSS generation
- `blocks/src/term-feed/types/index.ts` (318 lines) - Type definitions

## Audit Checklist

### 1. HTML Structure

| Element | Voxel | FSE | Status |
|---------|-------|-----|--------|
| Grid container `.post-feed-grid` | `term-feed.php:14` | `TermFeedComponent.tsx:226` | MATCH |
| Layout class (`ts-feed-grid-default` / `ts-feed-nowrap`) | `term-feed.php:14` | `TermFeedComponent.tsx:227` | MATCH |
| `min-scroll min-scroll-h` for carousel | `term-feed.php:14` | `TermFeedComponent.tsx:228-230` | MATCH |
| `data-auto-slide` attribute | `term-feed.php:16` | `TermFeedComponent.tsx:314-318` | MATCH |
| `.ts-preview` term cards | `term-feed.php:19` | `TermFeedComponent.tsx:322-323` | MATCH |
| `data-term-id` attribute | `term-feed.php:19` | `TermFeedComponent.tsx:324` | MATCH |
| Accent color override (`--e-global-color-accent`) | `term-feed.php:19` | `TermFeedComponent.tsx:325, buildItemStyles:53-54` | MATCH |
| Carousel nav `ul.simplify-ul.flexify.post-feed-nav` | `carousel-nav.php:2` | `TermFeedComponent.tsx:359` | MATCH |
| Nav `li > a.ts-icon-btn.ts-prev-page` | `carousel-nav.php:4` | `TermFeedComponent.tsx:361-363` | MATCH |
| Nav `li > a.ts-icon-btn.ts-next-page` | `carousel-nav.php:9` | `TermFeedComponent.tsx:377` | MATCH |
| Nav disabled state on initial load | `carousel-nav.php:4` (`disabled`) | `TermFeedComponent.tsx:84` (`canScrollLeft=false`) | MATCH |

### 2. CSS Selectors

| Control | Voxel Selector | FSE Selector | Status |
|---------|---------------|--------------|--------|
| Columns | `{{WRAPPER}} > .post-feed-grid` | `${selector} .post-feed-grid` | MATCH |
| Item gap | `{{WRAPPER}} > .post-feed-grid` | `${selector} .post-feed-grid` | MATCH |
| Item width | `{{WRAPPER}} > .post-feed-grid > div` | `${selector} .ts-feed-nowrap .ts-preview` | EQUIVALENT |
| Scroll padding | `{{WRAPPER}} > .post-feed-grid` | `${selector} .post-feed-grid` | MATCH |
| Item padding | `{{WRAPPER}} > .post-feed-grid > .ts-preview` | `${selector} .ts-feed-nowrap .ts-preview` | EQUIVALENT |
| Nav horizontal | `{{WRAPPER}} .post-feed-nav li:first/last-child` | `${selector} .post-feed-nav li:first/last-child` | MATCH |
| Nav vertical | `{{WRAPPER}} .post-feed-nav li` | `${selector} .post-feed-nav li` | MATCH |
| Nav icon color | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav button size | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav icon size | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav background | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav backdrop blur | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav border | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav border radius | `{{WRAPPER}} .post-feed-nav .ts-icon-btn` | `${selector} .post-feed-nav .ts-icon-btn` | **FIXED** |
| Nav hover size | `{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover` | `${selector} .post-feed-nav .ts-icon-btn:hover` | **FIXED** |
| Nav hover icon | `{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover` | `${selector} .post-feed-nav .ts-icon-btn:hover` | **FIXED** |
| Nav hover bg | `{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover` | `${selector} .post-feed-nav .ts-icon-btn:hover` | **FIXED** |
| Nav hover border | `{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover` | `${selector} .post-feed-nav .ts-icon-btn:hover` | **FIXED** |

### 3. JavaScript Behavior

| Behavior | Voxel | FSE | Status |
|----------|-------|-----|--------|
| Carousel scroll navigation | `commons.js` scrollBy | `TermFeedComponent.tsx:118-134` scrollBy | MATCH |
| Scroll state detection | `commons.js` scroll event | `TermFeedComponent.tsx:88-93` useCallback | MATCH |
| Autoplay with setInterval | `commons.js` via `data-auto-slide` | `TermFeedComponent.tsx:137-165` useEffect | MATCH |
| Autoplay hover-pause | `commons.js` mouseenter/mouseleave | `TermFeedComponent.tsx:144-149` | MATCH |
| Editor link prevention | Elementor `onLinkClick` | `TermFeedComponent.tsx:169-176` | MATCH |

### 4. Data Source Modes

| Mode | Voxel | FSE | Status |
|------|-------|-----|--------|
| Filters (taxonomy query) | `term-feed.php:650-709` | `frontend.tsx:444-462` REST API | MATCH |
| Manual selection | `term-feed.php:615-649` | `frontend.tsx:439-443` REST API | MATCH |
| Hide empty terms | `term-feed.php:99-117, 624-645, 667-682` | `frontend.tsx:457-462` REST API params | MATCH |
| Order (default/name) | `term-feed.php:685` | `frontend.tsx:449` | MATCH |

## Gaps Found

### Gap #1: Nav button CSS selector too broad (FIXED)

**Severity:** LOW
**File:** `styles.ts:66-67`

**Before (Wrong):**
```typescript
const btnSelector = `${selector} .ts-icon-btn`;
const btnHoverSelector = `${selector} .ts-icon-btn:hover`;
```

**After (Fixed):**
```typescript
const btnSelector = `${selector} .post-feed-nav .ts-icon-btn`;
const btnHoverSelector = `${selector} .post-feed-nav .ts-icon-btn:hover`;
```

**Evidence:** All Voxel nav selectors scope through `.post-feed-nav`:
- `term-feed.php:367` — `{{WRAPPER}} .post-feed-nav .ts-icon-btn` (icon color)
- `term-feed.php:387` — `{{WRAPPER}} .post-feed-nav .ts-icon-btn` (button size)
- `term-feed.php:406` — `{{WRAPPER}} .post-feed-nav .ts-icon-btn` (icon size)
- `term-feed.php:511` — `{{WRAPPER}} .post-feed-nav .ts-icon-btn:hover` (hover size)
- etc.

**Impact:** Without `.post-feed-nav` scoping, nav styles would bleed into any `.ts-icon-btn` inside term card templates.

## Remaining Gaps

**None.** All identified gaps have been fixed.

## Build Status

Build passed with zero errors after fix.
