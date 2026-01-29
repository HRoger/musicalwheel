# Implementation Summary: action=fse Approach

**Date:** November 2025
**Version:** 1.1.0
**Status:** ✅ Implemented

---

## What Changed

### New System: `action=fse` with `replace_editor` Filter

**Old Approach:**
- MutationObserver watches DOM
- Replaces `action=elementor` URLs with Site Editor URLs
- Requires URL mapping (template ID → Site Editor URL)
- Uses configured template slug (can be wrong)

**New Approach:**
- MutationObserver replaces `action=elementor` with `action=fse`
- WordPress `replace_editor` filter intercepts `action=fse`
- Queries actual post from database using `post_id`
- Uses actual slug from database (self-correcting!)

---

## Files Modified

### 1. **NEW:** `fse-action-handler.php`
- Implements `replace_editor` filter
- Handles `action=fse` parameter
- Redirects to Site Editor using actual post slug

### 2. **Modified:** `vue-integration.php`
- `replaceEditLinks()` function updated
- Now replaces `action=elementor` → `action=fse`
- Removed dependency on URL mapping

### 3. **Modified:** `design-menu-integration.php`
- Same changes as `vue-integration.php`
- Consistent approach across all admin screens

### 4. **Modified:** `templates-controller.php`
- Added require for `fse-action-handler.php`
- Must load FIRST (before other integrations)

---

## How It Works

### Flow Diagram:

```
1. User clicks "Edit Template" button
   ↓
2. Vue renders: /post.php?post=297&action=elementor
   ↓
3. MutationObserver detects link
   ↓
4. Replaces: /post.php?post=297&action=fse
   ↓
5. User clicks link → WordPress loads post.php
   ↓
6. replace_editor filter fires (action=fse detected)
   ↓
7. Query post from database: get_post(297)
   ↓
8. Get actual slug: $post->post_name = "voxel-places-form"
   ↓
9. Build Site Editor URL: site-editor.php?postId=voxel-fse//voxel-places-form
   ↓
10. Redirect to Site Editor ✅
```

---

## Benefits

### ✅ Self-Correcting
- Uses `post_id` from URL (always correct)
- Queries actual post from database
- Gets real slug (not configured slug)
- Solves wrong slug issue automatically

### ✅ Simpler Code
- No URL mapping needed
- One filter instead of complex MutationObserver logic
- Less code to maintain

### ✅ Consistent Pattern
- Matches Elementor's `action=elementor` pattern
- Familiar for developers
- WordPress-native approach

---

## Testing Checklist

### Test 1: Template Editing (Post Types Admin)
- [ ] Go to Post Types → Places → Templates
- [ ] Click "Edit Template" for Single post
- [ ] Verify redirects to Site Editor
- [ ] Verify correct template loads

### Test 2: Template Editing (Design Menu)
- [ ] Go to Design → Header & Footer
- [ ] Click "Edit Template"
- [ ] Verify redirects to Site Editor
- [ ] Verify correct template loads

### Test 3: Wrong Slug Fix
- [ ] Create post with wrong template slug configured
- [ ] Click "Back to Editing"
- [ ] Verify uses actual slug (not configured slug)
- [ ] Verify no 404 errors

### Test 4: Create-Post Form Pages
- [ ] Create new post via create-post block
- [ ] Click "Back to Editing"
- [ ] Verify redirects to form page with `?post_id=X`
- [ ] Verify form loads with post data

---

## Rollback Plan

If issues occur, see `REVERT-GUIDE.md` for step-by-step revert instructions.

**Quick revert:**
1. Restore backup files
2. Remove `fse-action-handler.php` require
3. Clear cache
4. Test

---

## Known Limitations

1. **Extra Redirect:** One extra HTTP request (post.php → Site Editor)
   - **Impact:** Minimal (~50-100ms)
   - **Benefit:** Self-correcting behavior worth it

2. **URL Mapping Still Present:** Old code still builds URL mapping
   - **Impact:** None (not used anymore)
   - **Future:** Can be removed in cleanup

---

## Performance Impact

**Before:**
- 1 request: Direct to Site Editor
- MutationObserver overhead: ~5-10ms

**After:**
- 2 requests: post.php → redirect → Site Editor
- MutationObserver overhead: ~5-10ms (same)
- Filter overhead: ~1-2ms

**Total Impact:** +50-100ms per click (acceptable for self-correcting behavior)

---

## Future Improvements

1. **Remove URL Mapping Code:** Clean up unused `fseTemplateUrls` code
2. **Cache Post Queries:** Cache `get_post()` results if needed
3. **Optimize Filter:** Add early returns for non-FSE requests

---

**Status:** ✅ Ready for testing
**Next Steps:** Test all scenarios, verify wrong slug fix works

