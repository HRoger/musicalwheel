# Print Template Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to print-template frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-66)

Added comprehensive documentation header:

**CONTENT - TEMPLATE:**
- ts_template_id - Template ID (voxel-post-select control)
  - Supports: page, elementor_library post types
  - Dynamic tags: @tags()@post(id)@endtags() for current post

**TEMPLATE SOURCES (FSE Extensions):**
- Pages - WordPress pages (wp/v2/pages)
- Posts - WordPress posts (wp/v2/posts)
- Reusable Blocks - wp_block post type (wp/v2/blocks)
- Elementor Templates - elementor_library (via Voxel\print_template)
- FSE Templates - Requires authentication (server-side only)

**VISIBILITY (FSE Extensions):**
- hideDesktop - Hide on desktop devices
- hideTablet - Hide on tablet devices
- hideMobile - Hide on mobile devices

**STYLING (FSE Extensions):**
- customClasses - Additional CSS classes

**DYNAMIC TAGS:**
- @tags()@post(id)@endtags() - Current post ID
- Other VoxelScript tags - Partial support (requires server rendering)

**RENDERING:**
- Voxel\print_template() - Server-side template rendering
- REST API fetching - Client-side for pages/posts/blocks
- Loading states - Spinner during fetch
- Error states - Graceful error handling

**HTML STRUCTURE:**
- .voxel-fse-print-template - Main container
- .vxfse-print-template-content - Content wrapper
- [data-template-id] - Template ID data attribute
- script.vxconfig - JSON configuration

**MULTISITE SUPPORT:**
- getRestBaseUrl() - Handles subdirectory multisite
- Dynamic REST URL construction

### 2. normalizeConfig() Function (lines 81-110)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): PrintTemplateVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
  };

  // Helper for boolean normalization
  const normalizeBool = (val: unknown, fallback: boolean): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
    if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
    return fallback;
  };

  return {
    templateId: normalizeString(raw.templateId ?? raw.template_id ?? raw.ts_template_id, ''),
    hideDesktop: normalizeBool(raw.hideDesktop ?? raw.hide_desktop, false),
    hideTablet: normalizeBool(raw.hideTablet ?? raw.hide_tablet, false),
    hideMobile: normalizeBool(raw.hideMobile ?? raw.hide_mobile, false),
    customClasses: normalizeString(raw.customClasses ?? raw.custom_classes, ''),
  };
}
```

**Features:**
- String normalization (handles numeric IDs as strings)
- Boolean normalization (handles various truthy/falsy values)
- Dual-format support (camelCase and snake_case)
- Voxel control name support (ts_template_id)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 124-139)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  101.89 kB │ gzip: 27.92 kB
Built in 249ms
```

Note: Larger bundle size includes React, shared PrintTemplateComponent, and REST API fetching logic.

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/print-template.php` (51 lines)
- Helper: `themes/voxel/app/utils/print-template.php`
- Control: voxel-post-select (page, elementor_library)

## Architecture Notes

The print-template block is unique because:
- **Minimal Voxel widget**: Only 51 lines with single ts_template_id control
- **FSE Extensions**: Adds visibility controls and custom classes
- **Multiple sources**: Fetches from Pages, Posts, Blocks, Elementor templates
- **Dynamic tags**: Supports @post(id) for current post context
- **REST API**: Client-side fetching with proper error handling
- **Multisite support**: Uses getRestBaseUrl() for subdirectory multisite

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] Async template fetching with proper cancellation
- [x] TypeScript strict mode
- [x] React hydration pattern

## Files Modified

1. `app/blocks/src/print-template/frontend.tsx`
   - Added Voxel parity header (66 lines)
   - Added normalizeConfig() function (30 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Template ID | 100% | voxel-post-select control |
| Pages source | 100% | wp/v2/pages REST endpoint |
| Posts source | 100% | wp/v2/posts REST endpoint |
| Blocks source | 100% | wp/v2/blocks REST endpoint |
| Elementor templates | 100% | Via Voxel\print_template() |
| FSE templates | ⚠️ | Requires auth (server-side) |
| Dynamic tags | 90% | @post(id) supported, others partial |
| Visibility | 100% | FSE extension (desktop/tablet/mobile) |
| Custom classes | 100% | FSE extension |
| Loading/error states | 100% | React state management |
| Multisite support | 100% | getRestBaseUrl() helper |
| normalizeConfig() | NEW | API format compatibility |
