# Timeline Block - Parity Implementation Report

**Date:** 2026-02-01
**Status:** 🟡 In Progress (Critical Backend Gaps Fixed, Frontend Integration Pending)

---

## Executive Summary

The Timeline block implementation has been audited for 1:1 Voxel parity. Critical gaps in the **API Controller** have been identified and **fixed**. The React components are well-structured but need to integrate with the new `post-context` endpoint for proper visibility and composer logic.

---

## 1. Backend Parity Status

### API Controller: `fse-timeline-api-controller.php`

| Feature | Voxel Source | FSE Status | Notes |
|---------|--------------|------------|-------|
| Config endpoint | `timeline.php:410-518` | ✅ Complete | Returns nonces, features, strings, icons |
| **Post-context endpoint** | `timeline.php:316-384, 555-626` | ✅ **NEW** | Added visibility checks, composer config, review config |
| Status feed | `timeline/v2/get_feed` | ✅ Proxied | Uses `voxel_ajax_timeline/v2/get_feed` |
| Status CRUD | `status.publish/edit/delete` | ✅ Proxied | All 9 status actions implemented |
| Comment CRUD | `comment.*` | ✅ Proxied | All 6 comment actions implemented |
| Mentions search | `mentions.search` | ✅ Proxied | |
| File upload | WordPress media | ✅ Native | |

### Critical Fix: Post-Context Endpoint

**Gap Identified:** The original controller returned permissions without checking Voxel's complex visibility rules.

**Solution Added:** New `/timeline/post-context` endpoint that replicates:

1. **Visibility Checks** (`timeline.php:316-384`)
   - Post-related modes: `post_reviews`, `post_wall`, `post_timeline`
   - Author timeline mode
   - User feed / Global feed modes
   - All visibility levels: `public`, `logged_in`, `followers_only`, `customers_only`, `private`

2. **Composer Config** (`timeline.php:555-626`)
   - `feed` - Which feed to post to
   - `can_post` - Permission based on mode and user
   - `post_as` - `'current_user'` or `'current_post'`
   - `placeholder` - Dynamic based on context
   - `reviews_post_type` - For review mode

3. **Review Config** (`timeline.php:555-566`)
   - Returns `post_type->reviews->get_timeline_config()` for review mode

4. **Filtering Options** (`timeline.php:529-535`)
   - `all`, `liked`, `pending` (moderator only)

---

## 2. Frontend Parity Status

### React Components

| Component | Voxel Template | FSE Status | Notes |
|-----------|---------------|------------|-------|
| `StatusFeed.tsx` | `status-feed.php` | ✅ Complete | Infinite scroll, filters, load more |
| `StatusItem.tsx` | `status.php` | ✅ Complete | All actions, dropdown, ray animation |
| `CommentFeed.tsx` | `comment-feed.php` | ✅ Complete | Nested comments |
| `CommentItem.tsx` | `comment.php` | ✅ Complete | Like, edit, delete, reply |
| `StatusComposer.tsx` | `status-composer.php` | ✅ Complete | Media, emoji, mentions |
| `QuoteComposer.tsx` | Part of composer | ✅ Complete | Quote status UI |
| `FeedFilters.tsx` | Part of feed | ✅ Complete | Order, time, search |
| `DropdownList.tsx` | `_dropdown-list.php` | ✅ Complete | Portal-based dropdown |
| `EmojiPicker.tsx` | `_emoji-picker.php` | ✅ Complete | Emoji selection |
| `MediaGallery.tsx` | Part of status | ✅ Complete | Image gallery with lightbox |
| `LinkPreview.tsx` | Part of status | ✅ Complete | YouTube embed support |
| `QuotedStatus.tsx` | `_quoted-status.php` | ✅ Complete | Quoted status display |

### Hooks

| Hook | Voxel Equivalent | FSE Status | Notes |
|------|------------------|------------|-------|
| `useStatusFeed.ts` | Vue feed logic | ✅ Complete | Pagination, filtering |
| `useStatusActions.ts` | Vue status actions | ✅ Complete | Cross-instance sync via CustomEvent |
| `useCommentActions.ts` | Vue comment actions | ✅ Complete | |
| `useCommentFeed.ts` | Vue comment feed | ✅ Complete | |
| `useFileUpload.ts` | Vue file upload | ✅ Complete | |
| `useTimelineConfig.tsx` | Config context | 🟡 Needs Update | Should integrate post-context |

---

## 3. Remaining Work

### 3.1 Integrate Post-Context in Hook (Priority: HIGH)

The `useTimelineConfig` hook should be updated to:

```typescript
// In useTimelineConfig.tsx
const fetchConfig = useCallback(async () => {
  const [config, postContext] = await Promise.all([
    getTimelineConfig(),
    getPostContext(attributes.mode, attributes.postId),
  ]);

  // Merge visibility and composer from postContext
  return {
    ...config,
    ...postContext,
  };
}, [attributes.mode, attributes.postId]);
```

### 3.2 Handle Visibility in Timeline Component

```typescript
// In Timeline.tsx or StatusFeed.tsx
const { config, isLoading } = useTimelineConfig();

// Check visibility
if (!config?.visible) {
  return <AccessRestricted reason={config?.reason} />;
}

// Check composer permission
const canPost = config?.composer?.can_post ?? false;
```

### 3.3 Update StatusComposer to Use Context

```typescript
// In StatusComposer.tsx
const { config } = useTimelineConfig();
const composerConfig = config?.composer;

// Use dynamic placeholder
const placeholder = composerConfig?.placeholder ?? defaultPlaceholder;

// Determine post target (user vs post)
const postAs = composerConfig?.post_as ?? 'current_user';
```

---

## 4. Evidence Mapping

### Visibility Logic

| Voxel Location | FSE Location |
|----------------|--------------|
| `timeline.php:316-331` (post modes) | `fse-timeline-api-controller.php:check_visibility()` |
| `timeline.php:332-373` (author mode) | `fse-timeline-api-controller.php:check_visibility()` |
| `timeline.php:374-377` (user feed) | `fse-timeline-api-controller.php:check_visibility()` |

### Composer Logic

| Voxel Location | FSE Location |
|----------------|--------------|
| `timeline.php:555-566` (post_reviews) | `fse-timeline-api-controller.php:get_composer_config()` |
| `timeline.php:568-579` (post_wall) | `fse-timeline-api-controller.php:get_composer_config()` |
| `timeline.php:580-590` (post_timeline) | `fse-timeline-api-controller.php:get_composer_config()` |
| `timeline.php:591-601` (author_timeline) | `fse-timeline-api-controller.php:get_composer_config()` |
| `timeline.php:602-626` (user/global feed) | `fse-timeline-api-controller.php:get_composer_config()` |

---

## 5. Testing Checklist

### Backend Tests Needed

- [ ] `FSETimelineAPIControllerTest.php`
  - [ ] Test `get_post_context` visibility for each mode
  - [ ] Test composer config for logged-in vs guest
  - [ ] Test review config for post_reviews mode
  - [ ] Test filtering_options for moderator vs user

### Frontend Tests Needed

- [ ] `timeline.frontend.test.tsx`
  - [ ] Test visibility restriction rendering
  - [ ] Test composer shows/hides based on can_post
  - [ ] Test placeholder text matches config

---

## 6. API Endpoints Summary

### New Endpoint Added

```
GET /wp-json/voxel-fse/v1/timeline/post-context
```

**Parameters:**
- `mode` (required): Timeline mode (`user_feed`, `post_wall`, `post_reviews`, etc.)
- `post_id` (optional): Post ID for post-related modes

**Response:**
```json
{
  "success": true,
  "data": {
    "visible": true,
    "reason": null,
    "composer": {
      "feed": "post_reviews",
      "can_post": true,
      "post_as": "current_user",
      "placeholder": "Write a review for Business Name",
      "reviews_post_type": "place"
    },
    "reviews": {
      "place": { /* review config */ }
    },
    "current_post": {
      "exists": true,
      "id": 123,
      "display_name": "Business Name",
      "avatar_url": "...",
      "link": "...",
      "author_id": 1,
      "post_type": "place"
    },
    "filtering_options": {
      "all": "All",
      "liked": "Liked",
      "pending": "Pending"
    },
    "show_usernames": true
  }
}
```

---

## 7. Conclusion

The Timeline block has strong foundation with comprehensive React components and hooks. The critical gap was the **missing visibility and composer logic** in the API layer, which has now been fixed with the new `post-context` endpoint.

**Next Steps:**
1. Update `useTimelineConfig` to call `getPostContext`
2. Add visibility check in Timeline component
3. Wire composer config to StatusComposer
4. Write PHPUnit tests for the new endpoint

**Estimated Parity:** 85% (backend complete, frontend needs integration)
