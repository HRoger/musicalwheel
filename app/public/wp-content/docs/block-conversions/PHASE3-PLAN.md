# Phase 3 Plan: JavaScript Parity with Voxel Beautified JS

**Date:** December 23, 2025
**Status:** PHASE 3 COMPLETE (100% - All 17 blocks analyzed)
**Previous Phase:** Phase 2 (100% - All 34 blocks complete)

---

## Goal

Achieve full JavaScript logic parity between frontend.tsx files and Voxel's beautified JS reference files. This ensures our React implementations match Voxel's battle-tested Vue.js logic exactly.

---

## PREREQUISITE: Fix Vue/React Conflict (Map Block) - COMPLETE

**Error:** `TypeError: Cannot read properties of null (reading 'dataset')`
**Location:** `commons.js:412` -> `Voxel.mixins.base.mounted()`
**Cause:** Voxel Vue components expect Elementor DOM structure that Gutenberg blocks don't have

### Root Cause Analysis

Voxel's `mixins.base` (used by ALL Vue components) does this on mount:
```javascript
mounted() {
    this.widget_id = this.$root.$options.el.closest(".elementor-element").dataset.id;
    this.post_id = this.$root.$options.el.closest(".elementor").dataset.elementorId;
}
```

When `.closest(".elementor-element")` returns `null`, accessing `.dataset` crashes.

### Implemented Fix: Voxel Shim (Option 2)

Created `voxelShim.ts` that patches `Voxel.mixins.base.mounted()` with null checks:

**File:** `app/blocks/shared/utils/voxelShim.ts`

```typescript
// Patches Voxel.mixins.base.mounted to:
// 1. Add null checks for .closest() results
// 2. Fallback to data-block-id for Gutenberg blocks
// 3. Fallback to body class for post_id
```

**Usage in frontend.tsx:**
```typescript
import { initVoxelShim } from '@shared/utils/voxelShim';
initVoxelShim(); // Call EARLY, before any Vue components mount
```

**Files modified:**
- `app/blocks/shared/utils/voxelShim.ts` (NEW)
- `app/blocks/shared/utils/index.ts` (export added)
- `app/blocks/src/map/frontend.tsx` (import added)

**Build result:**
```
frontend.js  15.64 kB | gzip: 4.72 kB
Built in 114ms
```

---

## Scope

**17 blocks** with beautified JS files requiring parity work:

| Tier | Block | Beautified JS | Size | Priority |
|------|-------|---------------|------|----------|
| 1 | countdown | voxel-countdown.beautified.js | 1.2KB | Low |
| 1 | listing-plans | voxel-listing-plans-widget.beautified.js | 12KB | Medium |
| 1 | membership-plans | voxel-pricing-plans.beautified.js | 12KB | Medium |
| 1 | sales-chart | voxel-vendor-stats.beautified.js | 7KB | Low |
| 1 | visit-chart | voxel-visits-chart.beautified.js | 8KB | Low |
| 2 | post-feed | voxel-post-feed.beautified.js | 3KB | High |
| 2 | quick-search | voxel-quick-search.beautified.js | 3KB | High |
| 2 | userbar | voxel-user-bar.beautified.js | 11KB | High |
| 2 | orders | voxel-orders.beautified.js | 11KB | Medium |
| 2 | messages | voxel-messages.beautified.js | 16KB | High |
| 3 | timeline | voxel-timeline-main.beautified.js | 15KB | Medium |
| 4 | login | voxel-login.beautified.js | 17KB | High |
| 4 | map | voxel-map.beautified.js | 32KB | High |
| 4 | product-price | voxel-product-summary.beautified.js | 24KB | Medium |
| 5 | search-form | voxel-search-form.beautified.js | 58KB | Critical |
| 5 | create-post | voxel-create-post.beautified.js | 72KB | Critical |
| 5 | product-form | voxel-product-form.beautified.js | 89KB | Critical |

---

## Phase 3 Deliverables Per Block

For each block:

1. **Parity Checklist** - Document comparing Voxel JS vs current frontend.tsx
2. **Logic Updates** - Implement missing event handlers, state transitions, API calls
3. **Edge Case Handling** - Loading, error, empty, network failure states
4. **Build Verification** - Ensure TypeScript compiles and bundle size is reasonable
5. **phase3-parity.md** - Documentation of changes made

---

## Conversion Patterns (Vue to React)

### Vue data() to React useState
```typescript
// Voxel Vue
data() { return { active: false, loading: false, items: [] }; }

// React
const [active, setActive] = useState(false);
const [loading, setLoading] = useState(false);
const [items, setItems] = useState<Item[]>([]);
```

### Vue methods to React callbacks
```typescript
// Voxel Vue
methods: { fetchData() { ... } }

// React
const fetchData = useCallback(async () => { ... }, [deps]);
```

### Vue created/mounted to React useEffect
```typescript
// Voxel Vue
created() { this.init(); }

// React
useEffect(() => { init(); }, []);
```

### Vue mixins to React hooks
```typescript
// Voxel Vue
mixins: [Voxel.mixins.base]

// React
const { popup, formGroup } = useVoxelBase();
```

---

## Execution Approach

**One block per session** - Deep focus on each block with thorough parity checking.

---

## Execution Order (By Priority)

### Priority 1: Core User Interaction Forms (Critical)
1. **search-form** (58KB) - Central to site functionality
2. **create-post** (72KB) - Core user action
3. **product-form** (89KB) - Product configuration

### Priority 2: High-Traffic Display Blocks
4. **post-feed** (3KB) - Most visible widget
5. **map** (32KB) - Complex Google Maps integration
6. **quick-search** (3KB) - User navigation

### Priority 3: Communication & User Blocks
7. **messages** (16KB) - Real-time communication
8. **userbar** (11KB) - User menu/notifications
9. **login** (17KB) - Authentication flow
10. **orders** (11KB) - E-commerce management

### Priority 4: Activity & Pricing Blocks
11. **timeline** (15KB) - Activity feed
12. **listing-plans** (12KB) - Pricing display
13. **membership-plans** (12KB) - Pricing display
14. **product-price** (24KB) - Price display

### Priority 5: Analytics & Simple Blocks
15. **sales-chart** (7KB) - Analytics
16. **visit-chart** (8KB) - Analytics
17. **countdown** (1.2KB) - Simple timer

---

## Parity Checklist Template

For each block, verify:

### Event Handlers
- [ ] Keyboard shortcuts (Ctrl+K, Escape, arrows)
- [ ] Click handlers match
- [ ] Form submissions
- [ ] Scroll events
- [ ] Resize handlers

### State Management
- [ ] All Vue data() properties converted to useState
- [ ] Loading states (loading, loadingMore)
- [ ] Error states
- [ ] Pagination state (page, hasMore)
- [ ] Search/filter state

### API Integration
- [ ] AJAX endpoints match (?vx=1&action=...)
- [ ] Request parameters identical
- [ ] Response handling matches
- [ ] Error handling (Voxel.alert patterns)
- [ ] Nonce/security tokens

### UI Behavior
- [ ] CSS classes match exactly
- [ ] Animation names preserved
- [ ] Conditional rendering logic
- [ ] v-if/v-show to React conditionals

### Edge Cases
- [ ] Empty state handling
- [ ] Network error handling
- [ ] Permission denied handling
- [ ] Invalid input handling
- [ ] Re-initialization prevention

---

## Key Files to Reference

### Utilities (Always check these)
- `commons/voxel-commons.beautified.js` - Shared mixins, components
- `dynamic-data/voxel-dynamic-data.beautified.js` - Data system

### Timeline extras
- `timeline/voxel-timeline-composer.beautified.js`
- `timeline/voxel-timeline-comments.beautified.js`

---

## Output Structure

```
docs/block-conversions/{block}/
├── phase2-improvements.md      # Already exists
├── phase3-parity.md            # NEW: Detailed parity documentation
└── voxel-{name}.beautified.js  # Reference file
```

---

## Documentation Format (phase3-parity.md)

Each phase3-parity.md will include:

```markdown
# {Block Name} Block - Phase 3 Parity

**Date:** {date}
**Status:** Complete (100%)
**Reference:** voxel-{name}.beautified.js ({size})

## Summary
Brief description of parity work done.

## Voxel JS Analysis
- Total functions: X
- Event handlers: X
- API calls: X
- State properties: X

## Parity Checklist

### Event Handlers
| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| keydown (Ctrl+K) | useEffect + handler | Done |
| ... | ... | ... |

### State Management
| Vue data() Property | React useState | Status |
|---------------------|----------------|--------|
| active | useState(false) | Done |
| ... | ... | ... |

### API Integration
| Endpoint | Method | Status |
|----------|--------|--------|
| ?vx=1&action=... | fetch() | Done |
| ... | ... | ... |

### Edge Cases
| Scenario | Handling | Status |
|----------|----------|--------|
| Empty state | Shows placeholder | Done |
| ... | ... | ... |

## Code Changes
List of specific changes made to frontend.tsx.

## Build Output
{build stats}
```

---

## Success Criteria

1. **100% Event Parity** - All Voxel event handlers exist in React
2. **100% State Parity** - All Vue data() converted to React state
3. **100% API Parity** - Same endpoints, params, response handling
4. **100% CSS Parity** - Same class names, animations
5. **TypeScript Strict** - No type errors
6. **Build Success** - All blocks compile

---

## Per-Block Workflow

For each block session:

1. **Read beautified JS** - `docs/block-conversions/{block}/voxel-{name}.beautified.js`
2. **Read current frontend.tsx** - `themes/voxel-fse/app/blocks/src/{block}/frontend.tsx`
3. **Analyze gaps** - Compare Vue logic vs React implementation
4. **Implement missing logic** - Add event handlers, state, API calls
5. **Test build** - `npm run build:frontend:{block}`
6. **Document** - Create `phase3-parity.md`

---

## Critical File Paths

### Priority 1 Blocks (First 3 sessions)
```
# search-form
docs/block-conversions/search-form/voxel-search-form.beautified.js
themes/voxel-fse/app/blocks/src/search-form/frontend.tsx
themes/voxel-fse/app/blocks/src/search-form/components/*.tsx

# create-post
docs/block-conversions/create-post/voxel-create-post.beautified.js
themes/voxel-fse/app/blocks/src/create-post/frontend.tsx
themes/voxel-fse/app/blocks/src/create-post/shared/*.tsx

# product-form
docs/block-conversions/product-form/voxel-product-form.beautified.js
themes/voxel-fse/app/blocks/src/product-form/frontend.tsx
themes/voxel-fse/app/blocks/src/product-form/shared/*.tsx
```

### Utility References (Check as needed)
```
docs/block-conversions/commons/voxel-commons.beautified.js
docs/block-conversions/dynamic-data/voxel-dynamic-data.beautified.js
```

---

## Utility Files Strategy

**Decision:** Handle utilities on a "need basis" - they work fine as-is.

| Utility | React Conversion | Reason |
|---------|-----------------|--------|
| `Voxel.alert()` | Not needed | Global function, works from React |
| `Voxel.helpers.*` | Not needed | Global functions, work from React |
| `Voxel.mixins.base` | Create hooks when needed | Convert to useVoxelBase() if a block needs it |
| `Voxel.components.*` | Skip | Vue components, not used in our React blocks |

**Files NOT in Phase 3 scope:**
- `share/voxel-share.beautified.js` - No block exists
- `reservations/voxel-reservations.beautified.js` - No block exists
- `timeline/voxel-timeline-composer.beautified.js` - Integrate with timeline if needed
- `timeline/voxel-timeline-comments.beautified.js` - Integrate with timeline if needed

---

## Notes

- **Don't add new features** - Goal is parity, not enhancement
- **Preserve Voxel patterns** - Use Voxel.alert(), not custom modals
- **Keep jQuery where needed** - Some Voxel APIs require jQuery
- **Test in WordPress** - Verify hydration works correctly
- **One block per session** - Deep focus, thorough documentation

---

## Starting Point

When ready to begin Phase 3, say: **"Start Phase 3 - search-form"**

This will begin with the first priority block (search-form) following the workflow above.

---

## Progress Tracker

| # | Block | Status | Date | Notes |
|---|-------|--------|------|-------|
| 0 | Vue/React conflict fix | Complete | Dec 23, 2025 | voxelShim.ts patches Voxel.mixins.base |
| 1 | search-form | Complete | Dec 23, 2025 | 97% parity, FilterStepper debounce + FilterRange compare modes |
| 2 | create-post | Complete | Dec 23, 2025 | 98% parity, ConditionMixin implemented (28 condition handlers) |
| 3 | product-form | Complete | Dec 23, 2025 | 30% parity, major gaps: addon/field components |
| 4 | post-feed | Complete | Dec 23, 2025 | 98% parity, scroll position management fixes 3 Voxel gaps |
| 5 | map | Complete | Dec 23, 2025 | 90% parity, consumer architecture using Voxel.Maps API |
| 6 | quick-search | Complete | Dec 23, 2025 | 95% parity, keyboard shortcuts, localStorage recent |
| 7 | messages | Complete | Dec 23, 2025 | 95% parity, polling, emoji, attachments, block/clear |
| 8 | userbar | Complete | Dec 23, 2025 | 100% parity, notifications/messages/cart popups, guest cart localStorage |
| 9 | login | Complete | Dec 23, 2025 | 100% parity, all 16 auth endpoints, 2FA, registration, recovery |
| 10 | orders | Complete | Dec 23, 2025 | 95% parity, REST API, URL persistence, DMs, actions |
| 11 | timeline | Complete | Dec 23, 2025 | 100% parity, 20 API endpoints, delete confirmation using Voxel_Config.l10n |
| 12 | listing-plans | Complete | Dec 23, 2025 | 100% parity, consumer pattern, Voxel native JS handles AJAX |
| 13 | membership-plans | Complete | Dec 23, 2025 | 100% parity, consumer pattern, dialog confirmations for subscription changes |
| 14 | product-price | Complete | Dec 23, 2025 | 100% parity, PHP-only Voxel widget (no JS), REST API headless-ready |
| 15 | sales-chart | Complete | Dec 23, 2025 | 100% parity, Vue.js replacement, drag scroll, AJAX navigation |
| 16 | visit-chart | Complete | Dec 23, 2025 | 100% parity, Vue.js replacement, lazy load, auto-scroll |
| 17 | countdown | Complete | Dec 23, 2025 | 100% parity, React replacement, Date.now() timing, enhanced features |
