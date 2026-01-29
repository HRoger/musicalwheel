# Popup Eager Loading Optimization Pattern

**Status**: Implemented (2025-12-02)
**Pattern Type**: Performance Optimization
**Applies To**: All popup components with data loading (MediaPopup, PostRelationField, TaxonomyField, etc.)

## Problem Statement

**Symptom**: Popups feel slow to open because they wait for data to load AFTER the popup is visible.

**Root Cause**: **Lazy Loading** - Data is fetched when the popup opens (on user click), causing a visible loading delay.

**User Experience**:
- User clicks "Open Popup" button
- Popup opens instantly (good)
- User sees empty state or "Loading..." message
- Data loads after 100-300ms (bad - visible wait)
- Total perceived delay: 100-300ms

## Solution: Eager Loading

**Pattern**: Load data on **component mount** instead of on **popup open**.

**Benefits**:
- Popup opens with data already loaded (instant)
- Better perceived performance
- No visible loading states
- Data ready before user needs it

**Trade-off**: Small upfront cost (loads data even if user never opens popup), but modern UX principle: anticipate user needs.

## Implementation Pattern

### Before (Lazy Loading)

```typescript
const [isOpen, setIsOpen] = useState(false);
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(false);

// ❌ LAZY: Loads when popup opens
const openPopup = async () => {
    setIsOpen(true);

    // Load data AFTER popup opens
    if (posts.length === 0) {
        setLoading(true);
        const response = await fetchPosts();
        setPosts(response.data);
        setLoading(false);
    }
};
```

**Result**: User sees loading state after popup opens.

### After (Eager Loading)

```typescript
const [isOpen, setIsOpen] = useState(false);
const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(false);

// ✅ EAGER: Load on component mount
useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const response = await fetchPosts();
        setPosts(response.data);
        setLoading(false);
    };

    loadData();
}, []); // Empty deps = run once on mount

// Now popup opens instantly with data ready
const openPopup = () => {
    setIsOpen(true);
};
```

**Result**: User sees data immediately when popup opens.

## When to Apply This Pattern

**✅ Apply eager loading when:**
- Popup is likely to be opened (high probability of use)
- Data size is small (< 10 KB)
- Initial load is fast (< 300ms)
- Component is always rendered (not conditionally mounted)

**❌ Don't apply eager loading when:**
- Popup is rarely opened (low probability of use)
- Data size is large (> 100 KB)
- Initial load is slow (> 1 second)
- Component is conditionally rendered (only mounts when needed)

## Performance Considerations

### With Query Monitor / WP_DEBUG Enabled

**Issue**: Development tools add 2-3 seconds of overhead to EVERY AJAX request.

**Evidence**:
- Without Query Monitor: ~110ms
- With Query Monitor: ~2600ms
- Overhead: 23x slower

**Solution**: Disable Query Monitor during performance testing.

### Network Request Method

**Tested**: Both `fetch()` and `jQuery.get()` have identical performance (same backend, same network time).

**Recommendation**: Use `fetch()` API for:
- Modern JavaScript standard
- Better for Phase 3 headless architecture (Next.js)
- No jQuery dependency in headless frontend

## Components Optimized

### 1. MediaPopup (2025-12-02)

**File**: [MediaPopup.tsx:415-418](../app/blocks/src/create-post/components/MediaPopup.tsx#L415-L418)

**Pattern**:
```typescript
/**
 * Eager Loading - Load files on component mount
 *
 * DEVIATION FROM VOXEL: Voxel uses lazy loading (loads on first open).
 * We use eager loading for better perceived performance.
 */
useEffect(() => {
    loadFiles(0);
}, []); // Run once on mount
```

**Results**:
- Before: 4s delay (2.6s Query Monitor overhead + user wait)
- After: Instant popup open
- Network time: ~110ms (with Query Monitor disabled)

### 2. PostRelationField (2025-12-02)

**File**: [PostRelationField.tsx:304-319](../app/blocks/src/create-post/components/fields/PostRelationField.tsx#L304-L319)

**Pattern**:
```typescript
/**
 * Eager Loading - Load initial posts on component mount
 *
 * DEVIATION FROM VOXEL: Voxel uses lazy loading (loads on popup open).
 * We use eager loading for better perceived performance.
 */
useEffect(() => {
    const loadInitialPosts = async () => {
        if (initialPosts.length === 0 && !initialLoading) {
            setInitialLoading(true);
            const response = await fetchPosts('', 0);
            if (response) {
                setInitialPosts(response.data);
                setInitialHasMore(response.has_more);
                setInitialOffset(10); // Per page is 10
            }
            setInitialLoading(false);
        }
    };

    loadInitialPosts();
}, []); // Run once on mount
```

**Changes**:
- Moved loading logic from `openPopup` function to `useEffect` hook
- Simplified `openPopup` to only open popup and focus search input
- Posts load on component mount (before user clicks)

**Results**:
- Instant popup open with posts ready
- Same ~100-110ms network time as MediaPopup (with Query Monitor disabled)
- No visible loading delay for user

### Other Fields Evaluated

**Fields that don't need this optimization:**
- **TaxonomyField**: No async data loading - terms passed as props
- **FileField**: No popup with data loading - direct file upload
- **Other fields**: No popup-based data loading patterns

**Pattern applies to:** Fields with popup dialogs that fetch data from backend (post relations, media library, etc.)

## Implementation Checklist

When applying this pattern to a new component:

1. **Identify lazy loading**
   - [ ] Find where data is loaded (usually in `openPopup` or similar function)
   - [ ] Check if loading happens AFTER popup opens

2. **Move to eager loading**
   - [ ] Create `useEffect` with empty dependency array
   - [ ] Move data fetching logic to `useEffect`
   - [ ] Remove loading logic from `openPopup` function

3. **Test performance**
   - [ ] Disable Query Monitor / WP_DEBUG
   - [ ] Test popup open speed (should be instant)
   - [ ] Check network time in DevTools (should be < 300ms)
   - [ ] Verify data displays correctly

4. **Document the change**
   - [ ] Add comment explaining eager loading
   - [ ] Note deviation from Voxel if applicable
   - [ ] Document trade-offs

## Future: Headless Architecture (Phase 3)

**Benefit**: This pattern prepares for Next.js headless frontend:
- `fetch()` API works in both WordPress and Next.js
- No jQuery dependency
- Modern async/await patterns
- Easy to migrate to client-side rendering

## References

- **MediaPopup Optimization**: [Task 2025-12-02](../project-log/tasks/task-2025-12-02-media-popup-eager-loading.md)
- **Query Monitor Issue**: Network timing showed 2600ms with Query Monitor, 110ms without
- **Voxel Pattern**: themes/voxel/assets/dist/create-post.js - uses lazy loading with `firstLoad` flag

## Key Learnings

1. **Query Monitor overhead is significant** - Always disable during performance testing
2. **fetch() vs jQuery**: No performance difference for same endpoint
3. **Eager loading improves perceived performance** - Data ready before user needs it
4. **Small trade-off for better UX** - Loads data even if popup never opened
5. **Modern pattern for modern architecture** - Better for headless migration
