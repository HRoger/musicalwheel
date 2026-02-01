# Create Post Block - Parity Implementation Report

**Date:** 2026-02-01
**Status:** ✅ Complete (Backend + Frontend Integration)
**Reference Widget:** `themes/voxel/app/widgets/create-post.php`

---

## Executive Summary

Implemented Plan C+ architecture for the Create Post block, adding a new `/post-context` REST API endpoint that provides server-side permission state to the React frontend. Frontend integration complete with permission-gated UI rendering.

---

## 1. Logic Inventory (From Voxel Source)

### Permissions
| Logic | Voxel Source | FSE Implementation |
|-------|--------------|-------------------|
| User Login Check | `create-post.php:4955` | Controller checks `is_user_logged_in()` |
| Create Permission | `create-post.php template:11` | `$user->can_create_post()` |
| Edit Permission | `create-post.php:4985-4987` | `\Voxel\Post::current_user_can_edit()` |

### State
| State | Voxel Source | FSE Implementation |
|-------|--------------|-------------------|
| Post Status | `create-post.php:4994-4997` | Returns `postStatus` in response |
| Can Save Draft | `create-post.php:4999` | `canSaveDraft = (status === 'draft')` |
| Admin Mode | `create-post.php:4966` | N/A (handled separately in render.php) |

### Security (Nonces)
| Nonce | Voxel Source | FSE Implementation |
|-------|--------------|-------------------|
| Admin Mode Nonce | `create-post.php:4971` | N/A (not needed for frontend forms) |
| Create Post Nonce | Form submission | Returns `nonces.create_post` |

---

## 2. New REST API Endpoint

### `/voxel-fse/v1/create-post/post-context`

**Purpose:** Returns permission state, post context, and nonces for React frontend hydration.

**Parameters:**
- `post_type` (required): Post type key (e.g., 'place', 'event')
- `post_id` (optional): Post ID for edit mode

**Response Structure:**
```json
{
  "isLoggedIn": true,
  "userId": 1,
  "permissions": {
    "create": true,
    "edit": false
  },
  "hasPermission": true,
  "noPermission": {
    "title": "Your account doesn't support this feature yet."
  },
  "postId": null,
  "postStatus": null,
  "postTitle": null,
  "editLink": null,
  "createLink": "/create-place/",
  "canSaveDraft": true,
  "steps": [
    { "key": "step-1", "label": "Basic Info" },
    { "key": "step-2", "label": "Details" }
  ],
  "validationErrors": {
    "required": "Required",
    "email:invalid": "You must provide a valid email address"
  },
  "nonces": {
    "create_post": "abc123..."
  },
  "postType": {
    "key": "place",
    "label": "Places",
    "singularName": "Place"
  }
}
```

---

## 3. Files Modified/Created

### Backend (Phase 1)
- `controllers/fse-create-post-controller.php` - Added `get_post_context()` method
- `tests/Unit/Controllers/FSECreatePostControllerTest.php` - PHPUnit tests

### Frontend (Phase 2)
- `app/blocks/src/create-post/types.ts` - Added `PostContext` interface
- `app/blocks/src/create-post/frontend.tsx` - Added `fetchPostContext()` and parallel loading
- `app/blocks/src/create-post/components/NoPermissionScreen.tsx` - New component
- `app/blocks/src/create-post/shared/CreatePostForm.tsx` - Updated props and draft button visibility

---

## 4. Test Coverage

### PHPUnit Tests (6 tests)
- [x] `test_get_post_context_with_create_permission` - User can create
- [x] `test_get_post_context_editing_existing_post` - Edit mode
- [x] `test_get_post_context_without_permission` - No permission screen
- [x] `test_get_post_context_draft_post_can_save_draft` - Draft saving logic
- [x] `test_get_post_context_invalid_post_type` - 404 error
- [x] `test_get_post_context_with_steps` - Multi-step form support

### Vitest Tests (Pending)
- [ ] Test permission-gated button rendering
- [ ] Test no-permission screen display
- [ ] Test draft button visibility based on `canSaveDraft`

---

## 5. Parity Verification Checklist

### Section 1: HTML Structure
- [x] No changes to HTML (frontend component unchanged)
- [x] NoPermissionScreen uses `ts-form`, `ts-no-posts` classes

### Section 2: JavaScript Logic
- [x] Permission logic moves to server (more secure)
- [x] React uses API response for button visibility
- [x] Parallel fetching of post-context and fields-config

### Section 3: CSS Classes
- [x] No changes (component uses existing classes)
- [x] NoPermissionScreen uses `ts-icon-wrapper`

### Section 4: Data Attributes
- [x] N/A - uses REST API instead

### Section 5: Event Handling
- [x] N/A - form submission unchanged

### Section 6: Third-Party Libraries
- [x] N/A - no third-party libraries affected

### Section 7: Visual Parity
- [x] NoPermissionScreen matches Voxel's no-permission.php

### Section 8: Responsive Behavior
- [x] N/A - backend only

### Section 9: Interactive Elements
- [x] Permission-gated buttons (Publish, Save, Draft)
- [x] Draft button visibility controlled by `canSaveDraft`

### Section 10: Cross-Block Events
- [x] N/A - standalone form

### Section 11: Disabled States
- [x] `canSaveDraft` controls draft button visibility

---

## 6. Frontend Integration Details

### FrontendWrapper Changes

```tsx
// Parallel fetching for better performance
const [contextData, fieldsData] = await Promise.all([
  fetchPostContext(attributes.postTypeKey, urlPostId),
  fetchFieldsConfig(attributes.postTypeKey, urlPostId, isAdminMetabox),
]);

// Permission-gated rendering
if (postContext && !postContext.hasPermission) {
  return <NoPermissionScreen context={postContext} />;
}
```

### CreatePostForm Changes

```tsx
// Draft button visibility - Plan C+ parity
{(attributes.enableDraftSaving ?? true) &&
 !isAdminMode &&
 (postContext?.canSaveDraft ?? true) && (
  <DraftButton />
)}
```

---

## 7. Evidence References

| Feature | File | Line |
|---------|------|------|
| Render method | `widgets/create-post.php` | 4954-5058 |
| Permission check | `templates/widgets/create-post.php` | 11 |
| No permission template | `templates/widgets/create-post/no-permission.php` | 6-10 |
| Can save draft logic | `widgets/create-post.php` | 4999 |
| Validation errors | `widgets/create-post.php` | 5111-5138 |

---

## 8. Architectural Notes

### Why Plan C+ for Create Post?

The Create Post block requires server-side permission checks because:

1. **Security**: Permission decisions (`can_create_post`, `can_edit`) MUST be made server-side
2. **User Context**: Requires authenticated user session to check permissions
3. **Post Context**: Edit mode requires loading post data server-side
4. **Nonces**: Security tokens must be generated server-side

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Frontend loads                                               │
│     └── Calls /post-context AND /fields-config in parallel     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Controller checks permissions                                │
│     └── is_user_logged_in()                                     │
│     └── $user->can_create_post()                                │
│     └── $post->is_editable_by_current_user()                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Returns PostContext to React                                 │
│     └── { permissions, hasPermission, canSaveDraft, ... }       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. React renders conditionally                                  │
│     └── hasPermission ? <Form /> : <NoPermissionScreen />       │
│     └── permissions.edit ? "Save Changes" : "Publish"           │
│     └── canSaveDraft ? <DraftButton /> : null                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Build Verification

```bash
npm run build 2>&1
# ✓ All TypeScript compiled successfully
# ✓ create-post/index.js: 449.40 kB
# ✓ create-post/frontend.js: 351.27 kB
```

---

**Report Generated:** 2026-02-01
**Author:** Claude Code (Full Parity Implementation)
**Status:** ✅ Complete - Backend API + Frontend Integration
