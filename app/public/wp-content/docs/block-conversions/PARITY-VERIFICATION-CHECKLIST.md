# Block Parity Verification Checklist

**Purpose:** Systematic verification template for blocks claiming 100% parity with Voxel.

**Usage:** Copy this checklist to each block's `phase3-parity.md` file and complete all items before claiming 100% parity.

---

## 1. HTML Structure Match (25%)

- [ ] All CSS classes match Voxel exactly (document class list)
- [ ] Element hierarchy matches Voxel template
- [ ] Data attributes match (e.g., `data-v-app`, `data-marker`)
- [ ] Conditional rendering logic matches Voxel
- [ ] **Evidence:** Reference Voxel template file and line numbers

## 2. JavaScript Logic (35%)

### Event Handlers
- [ ] All event handlers implemented (click, keydown, etc.)
- [ ] Event handler logic matches Voxel (with line references)
- [ ] **Evidence:** Reference beautified JS file and line numbers

### State Management
- [ ] State properties match Voxel's `data()` properties
- [ ] State updates match Voxel's logic
- [ ] **Evidence:** Reference beautified JS file and line numbers

### Value Serialization ⚠️ CRITICAL
- [ ] **Value format matches Voxel exactly** (IDs vs slugs vs objects)
- [ ] Serialization logic matches Voxel's `saveValue()` method
- [ ] URL parameters match Voxel's format
- [ ] Backend PHP can parse the serialized values
- [ ] **Evidence:** Reference beautified JS line showing serialization (e.g., `Object.keys(this.value).join(",")`)
- [ ] **Browser Test:** Verify URL params match Voxel format

### URL Parameter Parity ⚠️ CRITICAL (Dec 24, 2025)
This is a MANDATORY check for all search/filter blocks. URL parameter naming must match Voxel EXACTLY.

**Voxel URL Format (from beautified.js lines 1202-1203):**
```javascript
let params = { type: this.post_type.key };  // NOT 'post_type'
params[f.key] = f.value;                    // NO 'filter_' prefix
```

- [ ] **Post Type Parameter:** Uses `type` (NOT `post_type`)
  - ✅ Correct: `?type=place`
  - ❌ Wrong: `?post_type=place`

- [ ] **Filter Parameters:** Use filter key directly (NO `filter_` prefix)
  - ✅ Correct: `?availability=2025-12-25..2026-01-23`
  - ❌ Wrong: `?filter_availability=2025-12-25..2026-01-23`

- [ ] **Full URL Example:**
  - ✅ Voxel: `?type=place&availability=2025-12-25..2026-01-23&location=...`
  - ❌ FSE (pre-fix): `?post_type=place&filter_availability=2025-12-25..2026-01-23`

**Files to Verify:**
1. `useSearchForm.ts` - `updateUrlParams()` function
2. `frontend.tsx` - `updateUrlAndRefresh()` function
3. Any component that modifies URL parameters

**Why This Matters:**
- Backend compatibility: Voxel's PHP expects `type`, not `post_type`
- SEO: URLs must be consistent
- Bookmarking: User-saved URLs must work

### AJAX Calls
- [ ] API endpoints match Voxel
- [ ] Request parameters match Voxel
- [ ] Response handling matches Voxel
- [ ] **Evidence:** Reference beautified JS file and line numbers

## 3. Feature Coverage (25%)

- [ ] All Voxel features implemented (list each feature)
- [ ] Feature behavior matches Voxel exactly
- [ ] Configuration options supported
- [ ] **Evidence:** Reference Voxel widget PHP file

## 4. Edge Cases & Integration (15%)

### Edge Cases
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Validation logic matches Voxel

### Integration Testing
- [ ] **Browser test confirms visual behavior** (checkmarks, selections, etc.)
- [ ] **URL params verified** against Voxel format
- [ ] **Backend integration works** (search results update correctly)
- [ ] **Persistence verified** (state survives popup close/reopen)
- [ ] **Cross-browser tested** (Chrome, Firefox, Safari)

## 5. Automated Tests (Recommended)

- [ ] Unit tests for value serialization
- [ ] Integration tests for URL format
- [ ] Persistence tests for state management
- [ ] **Test file location:** `__tests__/[ComponentName].test.tsx`

---

## 6. Third-Party Library Configuration ⚠️ CRITICAL

Third-party libraries (Pikaday, noUiSlider, etc.) must have **identical configuration** to Voxel.

### Pikaday / Date Pickers
- [ ] `minDate` configured (e.g., `minDate: new Date()` to gray out past dates)
- [ ] `maxDate` configured (if applicable)
- [ ] `disableDayFn` implemented (conditional date disabling, e.g., no checkout before checkin)
- [ ] `theme` matches Voxel (e.g., `'pika-range'` for date ranges)
- [ ] `numberOfMonths` matches Voxel (e.g., `2` for side-by-side months)
- [ ] `firstDay` matches Voxel (Monday = 1)
- [ ] `bound` matches Voxel (inline vs popup)
- [ ] **Evidence:** Reference Voxel's Pikaday config block with line numbers

### noUiSlider / Range Controls
- [ ] `connect` configuration matches Voxel (e.g., `[true, false]` vs `[false, true]`)
- [ ] `start` value logic matches Voxel
- [ ] `range` (min/max) matches Voxel
- [ ] `step` matches Voxel
- [ ] **Evidence:** Reference Voxel's slider config with line numbers

---

## 7. Visual Side-by-Side Testing (MANDATORY)

**Do NOT claim 100% parity without screenshot evidence.**

- [ ] **Screenshot: Default state** - Side-by-side Voxel vs FSE
- [ ] **Screenshot: Active/open state** - Popups, dropdowns, calendars open
- [ ] **Screenshot: Filled state** - With selections made
- [ ] **Screenshot: Disabled/grayed elements** - What's NOT clickable (past dates, etc.)
- [ ] **Screenshot: Error/empty state** - No results, validation errors
- [ ] **Screenshot: Mobile responsive** - Same states on mobile viewport (375px)
- [ ] All screenshots saved to `docs/block-conversions/[block-name]/screenshots/`

### Screenshot Naming Convention:
```
[block-name]-[state]-[voxel|fse].png
Example: search-form-datepicker-open-voxel.png
         search-form-datepicker-open-fse.png
```

---

## 8. Dynamic Content Verification

Text/content that changes based on state must match Voxel exactly.

### Headers/Titles
- [ ] Popup titles match Voxel format exactly
- [ ] State-dependent titles verified (e.g., "Check-in" → "[date] — Check-out")
- [ ] Placeholder text matches Voxel
- [ ] **Evidence:** Reference Vue template or JS that generates title

### Date/Number Formatting
- [ ] Date format matches Voxel (e.g., "28 Dec 2025" NOT "December 28, 2025")
- [ ] Short format vs long format verified per context
- [ ] Number formatting matches (decimals, thousands separators)
- [ ] Currency formatting matches (if applicable)
- [ ] **Evidence:** Reference `toLocaleDateString()` options or formatting function

### Display Value Logic
- [ ] Empty state display matches Voxel (placeholder text)
- [ ] Filled state display matches Voxel (selected value format)
- [ ] Multi-value display matches Voxel (e.g., "3 selected" vs listing all)

---

## 9. Interactive Element Wiring ⚠️ CRITICAL

**Every rendered interactive element MUST have a working handler.**

- [ ] **Every button has an onClick handler** (not just rendered)
- [ ] **Every form input has onChange handler**
- [ ] **Every link has href or onClick**
- [ ] Handlers execute expected logic (not just console.log or empty functions)
- [ ] **Verification method:** Click every button/link and verify action occurs

### Common Mistakes:
```tsx
// ❌ WRONG - Button rendered but no handler
<button className="ts-btn ts-feed-reset">Reset</button>

// ✅ CORRECT - Button has onClick handler
<button className="ts-btn ts-feed-reset" onClick={handleReset}>Reset</button>
```

---

## 10. Cross-Block Event Communication

Blocks that communicate via custom events must have both dispatch AND listener verified.

- [ ] **Event dispatch verified:** Block dispatches expected custom events
- [ ] **Event listeners verified:** Block listens for expected events
- [ ] **Event payload format matches:** Data structure matches expectations
- [ ] **Integration test:** Trigger event from one block, verify other block responds

### Common Event Pairs:
| Source Block | Event | Target Block | Expected Action |
|--------------|-------|--------------|-----------------|
| Search Form | `voxel-search-submit` | Post Feed | Refresh posts |
| Search Form | `voxel-search-submit` | Map | Update markers |
| Post Feed | `voxel-fse:reset-filters` | Search Form | Clear all filters |
| Map | `voxel-map-bounds-changed` | Search Form | Update location filter |

### Verification Steps:
1. Open browser DevTools → Console
2. Add event listener: `window.addEventListener('voxel-search-submit', e => console.log(e.detail))`
3. Trigger action in source block
4. Verify event fires with correct payload
5. Verify target block responds correctly

---

## 11. Disabled State Matrix

Create a matrix of what should be disabled/grayed when.

| Element | Condition | Should Be Disabled | Verified |
|---------|-----------|-------------------|----------|
| Past dates in calendar | Always | ✅ Yes | [ ] |
| Dates before start date | When picking end date | ✅ Yes | [ ] |
| Submit button | When form is loading | ✅ Yes | [ ] |
| Increment (+) button | When at max value | ✅ Yes | [ ] |
| Decrement (-) button | When at min value | ✅ Yes | [ ] |
| Save button | When no changes made | Depends on UX | [ ] |

- [ ] Matrix completed for all interactive elements
- [ ] Each disabled state visually verified (grayed out appearance)
- [ ] Disabled elements are not clickable (pointer-events: none or disabled attr)
- [ ] **Evidence:** Reference Voxel's `disableDayFn`, `:disabled` bindings, CSS classes

---

## 12. Runtime Functional Testing (MANDATORY)

**This section exists because previous "100% parity" claims passed all 11 sections above but had completely broken runtime behavior.**

### Interactive Element Round-Trip
- [ ] **Every button clicked and action verified** (not just "handler exists")
- [ ] **Every AJAX call completes** (check Network tab — no stuck pending requests)
- [ ] **No stuck loading states** (no permanent `vx-pending`, `is-loading`, or spinning icons)
- [ ] **State transitions complete** (pending -> success, not pending -> stuck)

### AJAX Verification
- [ ] **Endpoint URL matches Voxel** (documented with Network tab evidence)
- [ ] **Request payload matches Voxel** (same params, same format)
- [ ] **Response is parsed correctly** (new data appears in UI)
- [ ] **Error responses handled** (not silently swallowed)
- [ ] **Nonces/security tokens included** in requests that need them

### Pagination / Load More
- [ ] **Page size matches Voxel** (e.g., 10 items per page)
- [ ] **Load more hidden when no more data** (`hasMore` / `has_next_page`)
- [ ] **Page counter increments** (page 1 -> 2 -> 3, not stuck on 1)
- [ ] **Items appended, not replaced** (existing items stay)
- [ ] **No duplicates after load more**

### Conditional Visibility
- [ ] **Each conditionally-shown element documented** with Voxel's rule
- [ ] **Rules match Voxel exactly** (e.g., delete button hidden when not owner)
- [ ] **No "always show" shortcuts** (if Voxel hides it, FSE hides it)

### Icon Rendering
- [ ] **Each icon renders as actual icon** (not filled circle, not [object Object], not empty)
- [ ] **Icon type matches** (SVG vs font icon vs inline SVG)
- [ ] **Icons from block attributes render correctly** (null handling, fallback icons)

---

## Parity Score Calculation

**Do NOT calculate as "X out of Y CSS classes match".**

| Category | Weight | What It Measures |
|----------|--------|-----------------|
| Structural Match | 40% | HTML classes, hierarchy, data attributes, inspector controls |
| Behavioral Match | 40% | Buttons work, AJAX completes, state transitions finish, visibility rules match |
| Integration Match | 20% | Cross-block events, URL serialization, pagination, icons |

A block with perfect HTML but a broken "Load More" button is **at best 60% parity**.

---

## Verification Sign-off

**Verified By:** [Name]
**Date:** [YYYY-MM-DD]
**Voxel Reference Version:** [Version/Commit]
**Known Gaps:** [List any intentional architectural differences]
**Runtime Test Results:** [List each interactive element tested with pass/fail]

---

## Example: FilterTerms Verification

### Value Serialization ✅
- **Format:** Comma-separated slugs (e.g., `"apartment,hotel"`)
- **Evidence:** `voxel-search-form.beautified.js` line 1098: `Object.keys(this.value).join(",")`
- **Evidence:** Line 1114: `this.value[term.slug] = term;` (uses slug as key)
- **Browser Test:** ✅ URL shows `filter_terms=apartment,hotel`
- **Backend Test:** ✅ `Terms_Filter.php` parses slugs correctly (line 236)

### Integration Testing ✅
- **Visual:** ✅ Checkmarks appear when terms selected
- **Persistence:** ✅ Selections survive popup close/reopen
- **Search Results:** ✅ Filtering works correctly
- **URL Format:** ✅ Matches Voxel format exactly
