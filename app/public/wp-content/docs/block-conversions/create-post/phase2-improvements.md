# Create Post Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to create-post frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 11-80)

Added comprehensive documentation header matching the pattern from search-form:

**Field Components (20+ types):**
- TitleField, DescriptionField, TextField, TextareaField
- NumberField, EmailField, UrlField, PhoneField
- SelectField, TaxonomyField, FileField
- LocationField (Google Maps + Places Autocomplete)
- DateField (Pikaday), SwitcherField
- WorkHoursField, RepeaterField, ProductField
- UIStep, UIHeading, UIHtml

**Core Features Documented:**
- Multi-step wizard navigation
- Conditional field visibility
- Client-side validation
- Draft saving (localStorage + AJAX)
- File upload session management
- Success/error messaging (Voxel.alert)
- Admin metabox mode
- Edit mode (post_id param)
- Form head with back button
- Turbo/PJAX navigation support

### 2. normalizeConfig() Function (lines 270-327)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): CreatePostAttributes {
  // Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
  // Core settings: postTypeKey, submitButtonText, successMessage, etc.
  // Icons: From nested icons object or top-level properties
}
```

**Features:**
- Boolean normalization (handles 'true', 'false', 1, 0)
- Icon normalization (supports nested icons object)
- Dual-format support (camelCase and snake_case)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 329-363)

Modified to use normalizeConfig() for consistent format handling:
- Parses vxconfig script tag (Voxel pattern)
- Falls back to data attributes if vxconfig not found
- Logs normalized attributes for debugging

## Build Output

```
frontend.js  338.19 kB │ gzip: 82.45 kB
Built in 466ms
```

## Voxel Reference

- Reference file: `docs/block-conversions/create-post/voxel-create-post.beautified.js` (1,941 lines)
- Original: `themes/voxel/assets/dist/create-post.js` (~69KB)

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] CreatePostForm accepts props (context-aware)
- [x] No jQuery in component logic
- [x] REST API endpoint for headless field fetching
- [x] TypeScript strict mode

## Files Modified

1. `app/blocks/src/create-post/frontend.tsx`
   - Added Voxel parity header (70 lines)
   - Added normalizeConfig() function (57 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Field components (20+) | 100% | All field types implemented |
| Multi-step wizard | 100% | UIStep navigation working |
| Conditional visibility | 100% | Field conditions evaluated |
| Client-side validation | 100% | Matches Voxel validation |
| Draft saving | 100% | localStorage + AJAX |
| File uploads | 100% | Session-based caching |
| Success messaging | 100% | Voxel.alert integration |
| Admin metabox mode | 100% | post_id param support |
| normalizeConfig() | NEW | API format compatibility |
