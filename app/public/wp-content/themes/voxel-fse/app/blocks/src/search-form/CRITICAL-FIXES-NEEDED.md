# Critical Fixes Needed for Search Form Block

**Date:** 2026-01-28
**Status:** ✅ ALL ISSUES RESOLVED (2026-01-29)
**Comparison:** React Implementation vs. Corrected Beautified Reference

---

## ✅ All Issues Resolved

All critical issues identified during the comparison have been fixed. See details below.

---

## ✅ Fixed Issues

### Issue 1: FilterTerms Missing Parent-Child Exclusion Logic ✅ FIXED (2026-01-29)

**Location:** `components/FilterTerms.tsx` lines 179-200

**Problem:** The React implementation does NOT handle hierarchical term conflicts when selecting terms. The Voxel original has critical logic that:
1. Deselects parent terms when selecting a child
2. Deselects conflicting sibling terms when selecting a parent
3. Maintains `hasSelection` flags for proper UI state

**Original Voxel Logic** (from corrected beautified.js lines 1123-1145):
```javascript
// When selecting a term:
Object.values(this.value).forEach(selectedTerm => {
    let ancestor = selectedTerm.parentRef;
    let ancestorChain = [];
    let foundConflict = false;

    // Traverse up to find if the newly selected term is an ancestor
    while (ancestor) {
        if (ancestor.slug === term.slug) {
            foundConflict = true;
            break;
        }
        ancestorChain.push(ancestor);
        ancestor = ancestor.parentRef;
    }

    // If conflict found, deselect the term and clear hasSelection flags
    if (foundConflict) {
        delete this.value[selectedTerm.slug];
        ancestorChain.forEach(ancestor => ancestor.hasSelection = false);
    }
});
```

**Current React Implementation:**
```typescript
// Lines 186-194: Just toggles selection - NO parent-child logic
if (currentSlugs.includes(termSlug)) {
    const newSlugs = currentSlugs.filter((slug) => slug !== termSlug);
    onChange(serializeTermsValue(newSlugs));
} else {
    const newSlugs = [...currentSlugs, termSlug];
    onChange(serializeTermsValue(newSlugs));
}
```

**Impact:**
- ❌ User can select both "Music" and "Music > Rock" simultaneously (invalid)
- ❌ Selecting a parent doesn't deselect child terms
- ❌ Term hierarchy is not properly enforced
- ❌ Backend receives invalid term combinations

**Example Bug:**
1. User selects "Music > Rock"
2. User then selects "Music"
3. **Expected:** "Music > Rock" should be deselected
4. **Actual:** Both remain selected (WRONG!)

---

### Issue 2: FilterTerms Missing Parent References ✅ FIXED (2026-01-29)

**Location:** `components/FilterTerms.tsx` lines 105-114

**Problem:** The `flattenTerms` function doesn't build `parentRef` relationships, which are REQUIRED for the parent-child exclusion logic.

**Current Implementation:**
```typescript
const flattenTerms = useCallback((terms: TermOption[], depth = 0): TermOption[] => {
    const result: TermOption[] = [];
    for (const term of terms) {
        result.push({ ...term, depth } as TermOption & { depth: number });
        if (term.children && term.children.length > 0) {
            result.push(...flattenTerms(term.children, depth + 1));
        }
    }
    return result;
}, []);
```

**What's Missing:**
- No `parentRef` property assigned
- No parent-child relationship tracking
- Cannot traverse upward in term hierarchy

**Voxel Original** (beautified.js lines 1070-1079):
```javascript
let setup = (term, parent) => {
    term.parentRef = parent;  // ← CRITICAL: Build parent reference
    term.depth = parent ? parent.depth + 1 : 0;
    if (term.children) term.children.forEach(c => setup(c, term));
    // ... more setup
};
this.terms.forEach(t => setup(t, null));
```

---

### Issue 3: Missing Auto-Save for Single-Select Popup ✅ FIXED (2026-01-29)

**Location:** `components/FilterTerms.tsx` lines 196-199

**Problem:** Single-select popup mode closes correctly, but the logic doesn't match Voxel's dual-check pattern.

**Voxel Original** (beautified.js lines 1146-1155):
```javascript
// Auto-save for non-multiple, non-inline mode
if (!this.filter.props.multiple && this.filter.props.display_as !== 'inline') {
    this.onSave(); // Saves AND blurs popup
}

// Manual save for inline mode
if (this.filter.props.display_as === 'inline') {
    this.saveValue(); // Saves without closing
}
```

**Current React Implementation:**
```typescript
// Lines 196-199: Only checks multiple flag
else {
    onChange(serializeTermsValue([termSlug]));
    setIsOpen(false); // ← Closes but doesn't distinguish inline vs popup
}
```

**Impact:**
- ⚠️ Functional but logic structure doesn't match Voxel pattern
- ⚠️ Could cause issues if inline mode behavior changes

---

### Issue 4: Missing `_last_modified` Tracking ✅ FIXED (2026-01-28)

**Location:** `hooks/useSearchForm.ts` - ENTIRE HOOK

**Problem:** Voxel uses `_last_modified` to track which filter changed last. This is a CRITICAL optimization that tells the backend which filter changed, so adaptive filtering can skip recalculating unaffected filters.

**Voxel Original** (beautified.js lines 1510-1522):
```javascript
// CRITICAL: Add mixin to track _last_modified for adaptive filter optimization
let filterMixin = {
    watch: {
        "filter.value"() {
            this.$root.post_type._last_modified = this.filter.key;
        }
    }
};

// Register all filter components with the mixin
Object.keys(filterComponents).forEach(componentName => {
    let component = filterComponents[componentName];
    component.mixins.push(filterMixin);
    app.component(componentName, component);
});
```

**Current React Implementation:**
```typescript
// ❌ COMPLETELY MISSING!
// No tracking of which filter changed last
```

**Impact:**
- ❌ Backend recalculates ALL adaptive filters on every change (performance hit)
- ❌ Voxel's optimization for large taxonomies is lost
- ❌ Server load increases unnecessarily

**How it Should Work:**
1. User changes "Category" filter
2. React tracks: `_last_modified = "category"`
3. Backend sees `_last_modified` in request
4. Backend ONLY recalculates filters affected by "category"
5. Skips recalculating price range, location, etc.

**Without Tracking:**
1. User changes "Category" filter
2. No `_last_modified` sent to backend
3. Backend recalculates ALL filters (slow!)

---

## 📊 Resolution Summary

| Issue | Status | Fixed Date | Location |
|-------|--------|------------|----------|
| #1: Parent-Child Logic | ✅ FIXED | 2026-01-29 | `FilterTerms.tsx:248-335` |
| #2: Parent References | ✅ FIXED | 2026-01-29 | `FilterTerms.tsx:127-172` |
| #3: Auto-Save Pattern | ✅ FIXED | 2026-01-29 | `FilterTerms.tsx:325-334` |
| #4: _last_modified | ✅ FIXED | 2026-01-28 | `useSearchForm.ts` |
| #5: FilterUser Default | ✅ FIXED | 2026-01-28 | `FilterUser.tsx` + REST endpoint |

---

## 🔧 Fixes Applied

### Fix 1: Add Parent References to Term Tree ✅

**File:** `components/FilterTerms.tsx`
**Lines:** 105-114

**Changes Needed:**
```typescript
// BEFORE:
const flattenTerms = useCallback((terms: TermOption[], depth = 0): TermOption[] => {
    const result: TermOption[] = [];
    for (const term of terms) {
        result.push({ ...term, depth } as TermOption & { depth: number });
        if (term.children && term.children.length > 0) {
            result.push(...flattenTerms(term.children, depth + 1));
        }
    }
    return result;
}, []);

// AFTER:
// Build term tree with parent references (Voxel pattern)
// Reference: voxel-search-form.beautified.js lines 1070-1079
const buildTermTree = useCallback((terms: TermOption[]) => {
    const termMap = new Map<string, TermOption & { parentRef?: TermOption; hasSelection?: boolean }>();

    // Recursive setup to build parent references
    const setupTerm = (term: TermOption, parent: (TermOption & { parentRef?: TermOption }) | null, depth: number) => {
        const enrichedTerm = {
            ...term,
            parentRef: parent || undefined,
            depth,
            hasSelection: false,
        };
        termMap.set(term.slug, enrichedTerm);

        if (term.children && term.children.length > 0) {
            term.children.forEach(child => setupTerm(child, enrichedTerm, depth + 1));
        }

        return enrichedTerm;
    };

    return terms.map(term => setupTerm(term, null, 0));
}, []);
```

### Fix 2: Add Parent-Child Exclusion Logic ✅

**File:** `components/FilterTerms.tsx`
**Lines:** 248-335 (in `handleSelect` function)

**Changes Needed:** Add the exclusion logic INSIDE the handleSelect function:

```typescript
const handleSelect = useCallback((term: TermOption) => {
    const termSlug = term.slug;
    if (!termSlug) return;

    if (multiple) {
        const currentSlugs = [...selectedSlugs];
        if (currentSlugs.includes(termSlug)) {
            // Remove
            const newSlugs = currentSlugs.filter((slug) => slug !== termSlug);
            onChange(serializeTermsValue(newSlugs));
        } else {
            // Add
            let newSlugs = [...currentSlugs, termSlug];

            // CRITICAL: Handle parent-child exclusion (Voxel parity)
            // Reference: voxel-search-form.beautified.js lines 1123-1145
            const selectedTerms = newSlugs.map(slug => termMap.get(slug)).filter(Boolean);
            const toRemove = new Set<string>();

            selectedTerms.forEach(selectedTerm => {
                if (!selectedTerm) return;

                let ancestor = selectedTerm.parentRef;
                const ancestorChain: Array<TermOption & { parentRef?: TermOption }> = [];
                let foundConflict = false;

                // Traverse up to find if the newly selected term is an ancestor
                while (ancestor) {
                    if (ancestor.slug === termSlug) {
                        foundConflict = true;
                        break;
                    }
                    ancestorChain.push(ancestor);
                    ancestor = ancestor.parentRef;
                }

                // If conflict found, mark for removal
                if (foundConflict) {
                    toRemove.add(selectedTerm.slug);
                    // Clear hasSelection flags
                    ancestorChain.forEach(anc => {
                        if (anc) anc.hasSelection = false;
                    });
                }
            });

            // Also deselect parent if selecting child
            let parent = term.parentRef;
            while (parent) {
                toRemove.add(parent.slug);
                parent.hasSelection = true;
                parent = parent.parentRef;
            }

            // Remove conflicting terms
            newSlugs = newSlugs.filter(slug => !toRemove.has(slug));

            onChange(serializeTermsValue(newSlugs));
        }
    } else {
        // Single select - save and close
        onChange(serializeTermsValue([termSlug]));

        // Auto-close for popup mode (matches Voxel pattern)
        if (displayAs !== 'inline') {
            setIsOpen(false);
        }
    }
}, [multiple, selectedSlugs, onChange, termMap, term, displayAs]);
```

### Fix 3: Add _last_modified Tracking ✅

**File:** `hooks/useSearchForm.ts`
**Status:** Implemented - tracks `lastModifiedFilter` in state and sends in requests

**Changes Needed:**

```typescript
// Add to state (line 66):
const [state, setState] = useState<SearchFormState>(() => ({
    currentPostType: attributes.postTypes[0] || '',
    filterValues: {},
    activeFilterCount: 0,
    portalActive: false,
    loading: false,
    resetting: false,
    narrowedValues: null,
    narrowingFilters: false,
    lastModifiedFilter: null, // ← ADD THIS
}));

// Update setFilterValue (lines 206-229):
const setFilterValue = useCallback(
    (filterKey: string, value: unknown) => {
        setState((prev) => {
            const newFilterValues = {
                ...prev.filterValues,
                [filterKey]: value,
            };

            // Track which filter changed last (Voxel optimization)
            // Reference: voxel-search-form.beautified.js lines 1510-1522
            const lastModifiedFilter = filterKey;

            // In editor context: notify parent to sync filter values to attributes
            if (context === 'editor' && onFilterChange) {
                setTimeout(() => onFilterChange(newFilterValues), 0);
            }

            return {
                ...prev,
                filterValues: newFilterValues,
                lastModifiedFilter, // ← ADD THIS
            };
        });
    },
    [context, onFilterChange]
);

// Update fetchNarrowedValues to include _last_modified (line 324):
queryParams.set('type', state.currentPostType);

// ADD THIS:
if (state.lastModifiedFilter) {
    queryParams.set('_last_modified', state.lastModifiedFilter);
}

Object.entries(state.filterValues).forEach(([key, value]) => {
    // ... existing code
});
```

### Fix 4: Update TypeScript Types ✅

**File:** `types.ts`
**Status:** Implemented - `EnrichedTermOption` interface added to FilterTerms.tsx

**Changes Needed:**

```typescript
export interface SearchFormState {
    currentPostType: string;
    filterValues: Record<string, unknown>;
    activeFilterCount: number;
    portalActive: boolean;
    loading: boolean;
    resetting: boolean;
    narrowedValues: NarrowedValues | null;
    narrowingFilters: boolean;
    lastModifiedFilter: string | null; // ← ADD THIS
}

// For FilterTerms:
interface EnrichedTermOption extends TermOption {
    parentRef?: EnrichedTermOption;
    hasSelection?: boolean;
    depth?: number;
}
```

---

## 🎯 Implementation Complete

All fixes have been applied in priority order:

1. ✅ **Fix #1 & #2** (Parent references + exclusion logic) - Data integrity restored
2. ✅ **Fix #4** (_last_modified tracking) - Performance optimization active
3. ✅ **Fix #3** (Auto-save pattern) - Logic matches Voxel pattern

---

## 🧪 Testing Plan

### Test Issue #1 & #2 (Parent-Child Logic):

**Test Case 1: Select Child, Then Parent**
1. Select "Music > Rock"
2. Select "Music"
3. **Expected:** "Music > Rock" is deselected, only "Music" remains
4. **Result:** ✅ Works correctly

**Test Case 2: Select Parent, Then Child**
1. Select "Music"
2. Select "Music > Rock"
3. **Expected:** "Music" is deselected, only "Music > Rock" remains
4. **Result:** ✅ Works correctly

### Test Issue #4 (_last_modified):

**Test Case: Network Request Inspection**
1. Open DevTools Network tab
2. Change "Category" filter
3. Check adaptive filtering request
4. **Expected:** `_last_modified=category` in query string
5. **Result:** ✅ Parameter included in requests

---

## 📝 Implementation Notes

- All fixes have been applied successfully
- FilterTerms.tsx now includes `buildTermTree` function with parent references
- `handleSelect` function implements full parent-child exclusion logic
- TypeScript interface `EnrichedTermOption` added for type safety

---

**Status:** ✅ ALL ISSUES RESOLVED (2026-01-29)

---

## 📋 Fix History

### Issue #4: _last_modified Tracking ✅ FIXED (2026-01-28)

**Fix Location:** `hooks/useSearchForm.ts`
- Added `lastModifiedFilter` to SearchFormState
- Updated `setFilterValue` to track the filter key
- Updated `fetchNarrowedValues` to include `_last_modified` in request

### Issue #5: FilterUser Not Working with Default Values ✅ FIXED (2026-01-28)

**Problem:** User filter (Author) wasn't displaying when default value was set.

**Root Cause Analysis:**
1. In Voxel Elementor: `set_value($default_value)` is called BEFORE `frontend_props()`
2. In `user-filter.php:52`: `frontend_props()` uses `$this->get_value()` to fetch user data
3. Our REST API was calling `frontend_props()` WITHOUT setting the value first
4. Result: User data (name, avatar) was always empty

**Fix Applied:**

1. **PHP Controller** (`fse-search-form-controller.php`):
   - Added new REST endpoint: `/wp-json/voxel-fse/v1/search-form/user-data`
   - Accepts `user_id` parameter
   - Returns `{ id, name, avatar }` using Voxel's User class

2. **React Component** (`components/FilterUser.tsx`):
   - Added `useState` for dynamic user data fetching
   - Added `useEffect` to fetch user data when default value is set but no props data
   - Fetches from new REST endpoint when needed
   - Shows loading state during fetch
   - Added clear button functionality

**How it works now:**
1. Block Inspector sets default value (e.g., user ID 1)
2. `useSearchForm` hook initializes `filterValues` with the default
3. `FilterUser` component receives `value={1}` but `filterData.props.user` is empty
4. Component fetches user data from `/voxel-fse/v1/search-form/user-data?user_id=1`
5. User name and avatar are displayed
6. Clear button allows resetting (respects `resetValue` config)

### Issue #1 & #2: FilterTerms Parent-Child Logic ✅ FIXED (2026-01-29)

**Fix Location:** `components/FilterTerms.tsx`

**Changes Applied:**
1. Added `EnrichedTermOption` interface (lines 45-49) with `parentRef`, `hasSelection`, `depth`
2. Added `buildTermTree` function (lines 127-151) to build parent references
3. Added `termMap` (lines 160-172) for O(1) slug lookups
4. Updated `handleSelect` function (lines 248-335) with full exclusion logic:
   - Step 1: Deselects parent terms when selecting a child
   - Step 2: Deselects child terms when selecting a parent (traverses ancestry)
   - Updates `hasSelection` flags for proper UI state

### Issue #3: Auto-Save Pattern ✅ FIXED (2026-01-29)

**Fix Location:** `components/FilterTerms.tsx:325-334`

**Changes Applied:**
- Single-select popup mode auto-closes on selection
- Inline mode stays open (value saved without closing)
- Matches Voxel pattern from beautified.js lines 1146-1155

---

**Final Status:** ✅ ALL CRITICAL ISSUES RESOLVED
