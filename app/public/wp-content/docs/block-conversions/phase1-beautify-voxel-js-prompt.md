# Phase 1: Beautify Voxel JS Files - Agent Prompt

**For use with:** Codebuff, Verdent IDE, or similar AI coding agents
**Purpose:** Transform minified Voxel JS files into readable, documented reference code

---

## Task Overview

Transform minified JavaScript files from Voxel's `/assets/dist/js/` folder into human-readable code with comprehensive documentation. These beautified files will be used as reference to improve React frontend.tsx components.

## ⚠️ CRITICAL REQUIREMENT: COMPLETE BEAUTIFICATION

**NO SUMMARIZATION ALLOWED.** The beautified output must contain:

- **100% of the original code** - every function, every line, every statement
- **NO omissions** like `// ... rest of the code` or `// similar logic`
- **NO abbreviations** like `// handles other cases similarly`
- **NO placeholders** like `/* implementation details */`

The beautified file must be a **complete, runnable version** of the original minified code. If the original file is 68K minified, the beautified version should be significantly larger (with comments and formatting), not smaller.

**Why this matters:** These files serve as the authoritative reference for improving frontend.tsx components. Any missing code = missing functionality in React components.

---

## 📊 TWO LEVELS OF BEAUTIFICATION

Not all files need the same depth of beautification. Choose the appropriate level based on the tier:

### Level 1: Basic Beautification
**Use for:** Tier 1-4 (Simple to Complex Widgets)

**Requirements:**
- ✅ Format code with Prettier (proper indentation, line breaks)
- ✅ Add comprehensive **file header** documentation:
  - Purpose, dependencies, CSS classes, data attributes
  - vxconfig format with example JSON
  - API response format (if applicable)
  - Event flow diagram
  - Edge cases summary
- ⚠️ Variable names **can remain minified** (e, t, n, o, etc.)
- ⚠️ Individual functions **do not need JSDoc** comments

**Why:** Simple widgets have straightforward logic. The header documentation provides enough context to understand the architecture and data structures. The minified variable names are readable enough in context.

**Example Output:**
```javascript
/**
 * VOXEL COUNTDOWN WIDGET - Beautified Reference
 *
 * Original: themes/voxel/assets/dist/countdown.js (1.2K)
 *
 * PURPOSE: Displays countdown timer to target date
 *
 * VXCONFIG FORMAT:
 * {
 *   "date": "2025-12-31T23:59:59",
 *   "labels": { "days": "Days", "hours": "Hours", ... },
 *   "hideOnComplete": false
 * }
 *
 * CSS CLASSES: .ts-countdown, .ts-countdown-unit, .ts-countdown-value
 *
 * EDGE CASES:
 * - Past date: triggers complete() immediately
 * - Missing config: uses empty object default
 */

// Formatted but minified variable names preserved
class e {
  constructor(t) {
    this.el = t;
    this.config = JSON.parse(t.dataset.config || "{}");
    this.init();
  }

  init() {
    this.targetDate = new Date(this.config.date).getTime();
    this.tick();
    this.interval = setInterval(() => this.tick(), 1000);
  }
  // ... rest of code formatted but not renamed
}
```

---

### Level 2: Deep Beautification
**Use for:** Tier 5-6 (Shared Dependencies + Large Complex Widgets)

**Requirements:**
- ✅ Everything from Level 1, PLUS:
- ✅ **Rename ALL minified variables** to meaningful names
- ✅ **Add JSDoc comments** to every function
- ✅ **Add inline comments** explaining complex logic
- ✅ **Document internal data structures** and state

**Why:** These files are either:
1. **Shared dependencies** (commons.js, dynamic-data.js) - used by multiple widgets, must understand every function
2. **Large complex widgets** (create-post, search-form, product-form) - 40K-70K of logic, impossible to understand without clear naming

**Variable Naming Examples:**
```javascript
// BEFORE (minified)
function g(e, t) {
  var n = e.split("|"),
      o = n[0],
      f = n.slice(1);
  return { type: o, args: f };
}

// AFTER (Level 2)
/**
 * Parse a modifier string into its components
 *
 * @param {string} modifierStr - Modifier string like "uppercase" or "truncate|50"
 * @param {Object} context - Current rendering context
 * @returns {Object} Parsed modifier with type and arguments
 */
function parseModifier(modifierStr, context) {
  var parts = modifierStr.split("|"),
      modifierType = parts[0],
      modifierArgs = parts.slice(1);
  return { type: modifierType, args: modifierArgs };
}
```

---

### Tier-to-Level Mapping

| Tier | Files | Level | Reasoning |
|------|-------|-------|-----------|
| 1 | countdown, listing-plans, pricing-plans, vendor-stats, visits-chart | **Level 1** | Simple widgets, < 5K each |
| 2 | post-feed, quick-search, share, reservations, user-bar, orders, messages | **Level 1** | Medium widgets, straightforward logic |
| 3 | timeline-main, timeline-composer, timeline-comments | **Level 1** | Related widgets, understandable with header docs |
| 4 | product-summary, auth, google-maps | **Level 1** | Complex but self-contained |
| 5 | **commons.js, dynamic-data.js** | **Level 2** | Shared utilities, must understand every function |
| 6 | **create-post, search-form, product-form** | **Level 2** | 40-70K each, too complex for minified names |

---

### Time Estimates by Level

| Level | Per File | Effort |
|-------|----------|--------|
| Level 1 (Basic) | 15-30 min | Format + header docs only |
| Level 2 (Deep) | 1-3 hours | Full variable renaming + JSDoc |

**Updated Total Estimates:**
- Tier 1-4 (18 files, Level 1): ~5-8 hours
- Tier 5-6 (5 files, Level 2): ~8-12 hours
- **Total: ~13-20 hours**

## Source Location

```
C:\Users\herle\Local Sites\musicalwheel\app\public\wp-content\themes\voxel\assets\dist\
```

**Note:** Files are directly in `assets/dist/`, NOT in a `js/` subfolder.

## Output Location

Create a new folder for each beautified file:
```
C:\Users\herle\Local Sites\musicalwheel\app\public\wp-content\docs\block-conversions\{block-name}\voxel-{block-name}.beautified.js
```

---

## Priority Order - WIDGET JS FILES ONLY

Only beautify files that:
1. Have a corresponding frontend.tsx (widget blocks)
2. Are dependencies used by widgets (commons.js, timeline-*.js)
3. Are map alternatives (if needed)

**Excluded:** Admin editors, backend systems, Elementor integration, non-widget utilities.

---

### Tier 1 - Simple Widgets (Start Here) — Level 1
Small widget files to validate the beautification process.

| # | File | Size | Output Folder | frontend.tsx | Level |
|---|------|------|---------------|--------------|-------|
| 1 | `countdown.js` | 1.2K | `countdown/` | ✅ | **1** |
| 2 | `listing-plans-widget.js` | 710B | `listing-plans/` | ✅ | **1** |
| 3 | `pricing-plans.js` | 1.1K | `membership-plans/` | ✅ | **1** |
| 4 | `vendor-stats.js` | 1.8K | `sales-chart/` | ✅ | **1** |
| 5 | `visits-chart.js` | 2.1K | `visit-chart/` | ✅ | **1** |

**Estimated Time:** 1-2 hours (Level 1: format + header docs)

---

### Tier 2 - Medium Widgets — Level 1
Core widget functionality with moderate complexity.

| # | File | Size | Output Folder | frontend.tsx | Level |
|---|------|------|---------------|--------------|-------|
| 6 | `post-feed.js` | 2.9K | `post-feed/` | ✅ | **1** |
| 7 | `quick-search.js` | 3.0K | `quick-search/` | ✅ | **1** |
| 8 | `share.js` | 1.3K | `share/` | (popup utility) | **1** |
| 9 | `reservations.js` | 4.1K | `reservations/` | (booking widget) | **1** |
| 10 | `user-bar.js` | ~3K | `userbar/` | ✅ | **1** |
| 11 | `orders.js` | 11K | `orders/` | ✅ | **1** |
| 12 | `messages.js` | 16K | `messages/` | ✅ | **1** |

**Estimated Time:** 2-3 hours (Level 1: format + header docs)

---

### Tier 3 - Timeline System (Widget + Dependencies) — Level 1
Timeline widget requires multiple JS files.

| # | File | Size | Output Folder | Notes | Level |
|---|------|------|---------------|-------|-------|
| 13 | `timeline-main.js` | 18K | `timeline/` | ✅ Main widget | **1** |
| 14 | `timeline-composer.js` | 11K | `timeline/` | Dependency | **1** |
| 15 | `timeline-comments.js` | 14K | `timeline/` | Dependency | **1** |

**Estimated Time:** 1-2 hours (Level 1: format + header docs)

---

### Tier 4 - Complex Widgets — Level 1
High-usage widgets with significant logic.

| # | File | Size | Output Folder | frontend.tsx | Level |
|---|------|------|---------------|--------------|-------|
| 16 | `product-summary.js` | 24K | `product-price/` | ✅ | **1** |
| 17 | `auth.js` | 25K | `login/` | ✅ | **1** |
| 18 | `google-maps.js` | 30K | `map/` | ✅ | **1** |

**Estimated Time:** 1-2 hours (Level 1: format + header docs)

---

### Tier 5 - Shared Dependencies — ⚠️ Level 2 (Deep Beautification)
Core utilities used by multiple widgets. **Essential to understand popups, modals, etc.**

| # | File | Size | Output Folder | Notes | Level |
|---|------|------|---------------|-------|-------|
| 19 | `commons.js` | 17K | `commons/` | Popups, modals, utilities | **2** |
| 20 | `dynamic-data.js` | 38K | `dynamic-data/` | VoxelScript parser | **2** |

**Estimated Time:** 4-6 hours (Level 2: variable renaming + JSDoc per function)

⚠️ **Level 2 Required:** These files are shared dependencies. Every function must be understood. Rename ALL minified variables (e, t, n → meaningful names). Add JSDoc to EVERY function.

---

### Tier 6 - Large Complex Widgets — ⚠️ Level 2 (Deep Beautification)
Most complex widgets - do last.

| # | File | Size | Output Folder | frontend.tsx | Level |
|---|------|------|---------------|--------------|-------|
| 21 | `product-form.js` | 43K | `product-form/` | ✅ | **2** |
| 22 | `search-form.js` | 57K | `search-form/` | ✅ | **2** |
| 23 | `create-post.js` | 68K | `create-post/` | ✅ | **2** |

**Estimated Time:** 6-10 hours (Level 2: variable renaming + JSDoc per function)

⚠️ **Level 2 Required:** These files are 40-70K each. Minified variable names make them impossible to understand. Rename ALL variables. Add JSDoc to EVERY function.

---

### Optional - Alternative Map Providers
Only if using Mapbox or OpenStreetMap instead of Google Maps.

| # | File | Size | Output Folder | Notes |
|---|------|------|---------------|-------|
| -- | `mapbox.js` | 28K | `mapbox/` | Alt map provider |
| -- | `openstreetmap.js` | 38K | `openstreetmap/` | Alt map provider |

**Estimated Time:** 3-4 hours (if needed)

---

## Summary

| Tier | Focus | Files | Size | Level | Est. Time |
|------|-------|-------|------|-------|-----------|
| 1 | Simple Widgets | 5 | ~7K | **1** | 1-2 hrs |
| 2 | Medium Widgets | 7 | ~42K | **1** | 2-3 hrs |
| 3 | Timeline System | 3 | ~43K | **1** | 1-2 hrs |
| 4 | Complex Widgets | 3 | ~79K | **1** | 1-2 hrs |
| 5 | Shared Dependencies | 2 | ~55K | **2** | 4-6 hrs |
| 6 | Large Complex | 3 | ~168K | **2** | 6-10 hrs |
| **Total** | **Core** | **23** | **~394K** | | **15-25 hrs** |

**Level 1 (Tier 1-4):** 18 files, ~5-9 hours — Format + header docs
**Level 2 (Tier 5-6):** 5 files, ~10-16 hours — Deep variable renaming + JSDoc

**Optional:** +2 files for alternative maps (~66K, 1-2 hrs Level 1)

---

## Beautification Instructions

### For Level 1 (Tier 1-4): Basic Beautification

1. **Format with Prettier** (proper indentation, line breaks)
2. **Add comprehensive file header** (see template below)
3. **Keep variable names as-is** (minified is OK)
4. **Skip per-function JSDoc** (header documentation is sufficient)

### For Level 2 (Tier 5-6): Deep Beautification

1. **Format with Prettier** (proper indentation, line breaks)
2. **Add comprehensive file header** (see template below)
3. **Rename ALL minified variables** to meaningful names
4. **Add JSDoc to EVERY function**
5. **Add inline comments** for complex logic

---

### Step 1: Format the Code (Both Levels)

Use Prettier or similar to format:
```bash
npx prettier --write --parser babel "path/to/file.js"
```

Or manually expand minified code:
- Add line breaks after semicolons and braces
- Proper indentation (2 spaces)
- Separate logical blocks with blank lines

### Step 2: Rename Variables (Level 2 Only)

**Skip this step for Level 1 files.** For Level 2 files, transform minified variable names to meaningful names:

```javascript
// BEFORE (minified)
function a(b,c){var d=b.querySelector(".ts-form");if(d){var e=JSON.parse(d.dataset.config);}}

// AFTER (readable)
function initializeForm(container, options) {
  var formElement = container.querySelector(".ts-form");
  if (formElement) {
    var config = JSON.parse(formElement.dataset.config);
  }
}
```

### Step 3: Add File Header (Both Levels) + Function JSDoc (Level 2 Only)

**File header is required for BOTH levels.** Function JSDoc is only for Level 2.

**File Header (Both Levels):**
```javascript
/**
 * Voxel {WidgetName} Widget - Beautified Reference
 *
 * Original File: themes/voxel/assets/dist/js/{filename}.js
 * Original Size: {size}
 * Beautified: {date}
 *
 * PURPOSE:
 * {Brief description of what this widget does}
 *
 * USAGE:
 * {How Voxel uses this - what triggers it, what DOM it expects}
 *
 * DEPENDENCIES:
 * - Vue.js (if applicable)
 * - jQuery (if applicable)
 * - Voxel global object
 *
 * CSS CLASSES USED:
 * - .ts-{class-name}: {purpose}
 * - .vx-{class-name}: {purpose}
 *
 * DATA ATTRIBUTES:
 * - data-config: {description}
 * - data-{name}: {description}
 */
```

**Function Documentation (Level 2 Only):**
```javascript
/**
 * Initialize the widget
 *
 * @param {HTMLElement} container - The widget container element
 * @param {Object} config - Configuration from vxconfig JSON
 * @returns {Object} Widget instance
 *
 * CALLED BY: DOM ready event / Voxel.init()
 * CALLS: setupEventListeners(), renderInitialState()
 */
function initialize(container, config) {
  // ...
}
```

**Skip function JSDoc for Level 1 files** - the file header documentation is sufficient.

**Data Structure Documentation:**
```javascript
/**
 * VXCONFIG FORMAT:
 * The widget expects this JSON structure in <script class="vxconfig">:
 *
 * {
 *   "targetDate": "2025-12-31T00:00:00",  // ISO date string
 *   "labels": {
 *     "days": "Days",
 *     "hours": "Hours",
 *     "minutes": "Minutes",
 *     "seconds": "Seconds"
 *   },
 *   "showSeconds": true,
 *   "onComplete": "hide" | "showMessage"
 * }
 */
```

### Step 4: Document Edge Cases

Add comments for error handling and edge cases:

```javascript
/**
 * EDGE CASES HANDLED:
 *
 * 1. Empty State:
 *    - When no data: Shows "No items found" message
 *    - CSS class added: .ts-empty-state
 *
 * 2. Loading State:
 *    - Shows spinner while fetching
 *    - CSS class added: .ts-loading
 *
 * 3. Error State:
 *    - Network failure: Shows retry button
 *    - Validation error: Highlights invalid fields
 *    - CSS class added: .ts-error
 *
 * 4. Permission Denied:
 *    - Redirects to login if 401
 *    - Shows message if 403
 */
```

### Step 5: Document Event Flow

```javascript
/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── DOMContentLoaded
 *        └── Voxel.init()
 *            └── initializeWidget()
 *
 * 2. User Interaction
 *    └── Click ".ts-submit-btn"
 *        └── handleSubmit()
 *            └── validateForm()
 *            └── sendRequest()
 *            └── handleResponse()
 *
 * 3. API Response
 *    └── Success: updateUI(), showSuccess()
 *    └── Error: showError(), enableRetry()
 */
```

---

## Output Template

Each beautified file should follow this structure:

```javascript
/**
 * ============================================================================
 * VOXEL {WIDGET_NAME} WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/js/{filename}.js
 * Size: {size}
 * Beautified: {date}
 *
 * PURPOSE:
 * {description}
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/{block-name}/frontend.tsx
 *
 * ============================================================================
 */

/* ==========================================================================
   SECTION 1: CONFIGURATION & DATA STRUCTURES
   ========================================================================== */

/**
 * VXCONFIG FORMAT:
 * {documented structure}
 */

/**
 * API RESPONSE FORMAT:
 * {documented structure}
 */

/* ==========================================================================
   SECTION 2: INITIALIZATION
   ========================================================================== */

/**
 * Main initialization function
 */
function initialize(container, config) {
  // Beautified code with comments
}

/* ==========================================================================
   SECTION 3: EVENT HANDLERS
   ========================================================================== */

/**
 * Handle form submission
 */
function handleSubmit(event) {
  // Beautified code with comments
}

/* ==========================================================================
   SECTION 4: API CALLS
   ========================================================================== */

/**
 * Fetch data from Voxel API
 */
function fetchData(params) {
  // Beautified code with comments
}

/* ==========================================================================
   SECTION 5: UI UPDATES
   ========================================================================== */

/**
 * Update the DOM with new data
 */
function render(data) {
  // Beautified code with comments
}

/* ==========================================================================
   SECTION 6: UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Helper functions
 */

/* ==========================================================================
   SECTION 7: EDGE CASES & ERROR HANDLING
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 * - Empty state: ...
 * - Error state: ...
 * - Loading state: ...
 */
```

---

## Validation Checklist

### Level 1 Checklist (Tier 1-4)

Before marking a Level 1 file as complete:

- [ ] Code is properly formatted and indented
- [ ] File header documents purpose and dependencies
- [ ] vxconfig format is documented with example JSON
- [ ] API response format is documented (if applicable)
- [ ] Event flow is documented
- [ ] Edge cases are listed
- [ ] CSS classes used are documented
- [ ] Data attributes are documented
- [ ] (Variable names can remain minified)
- [ ] (Function JSDoc not required)

### Level 2 Checklist (Tier 5-6)

Before marking a Level 2 file as complete:

- [ ] Code is properly formatted and indented
- [ ] **All variable names are meaningful** (no single letters except i, j in loops)
- [ ] File header documents purpose and dependencies
- [ ] **All functions have JSDoc comments**
- [ ] vxconfig format is documented with example JSON
- [ ] API response format is documented (if applicable)
- [ ] Event flow is documented
- [ ] Edge cases are listed
- [ ] CSS classes used are documented
- [ ] Data attributes are documented
- [ ] **Inline comments for complex logic**

---

## Example: countdown.js (Level 2 Style)

Here's what a **Level 2** completed beautification looks like.

**Note:** Since countdown.js is in Tier 1, it only needs **Level 1** (format + header docs, minified variable names OK). This example shows Level 2 style for reference:

**Input (minified):**
```javascript
!function(){"use strict";var e={};!function(){var t=e;Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;t.default=class{constructor(e){this.el=e,this.config=JSON.parse(e.dataset.config||"{}"),this.init()}init(){this.target=new Date(this.config.date).getTime(),this.tick(),this.interval=setInterval((()=>this.tick()),1e3)}...
```

**Output (beautified):**
```javascript
/**
 * ============================================================================
 * VOXEL COUNTDOWN WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/js/countdown.js
 * Size: 1.2K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Displays a countdown timer to a target date, showing days, hours,
 * minutes, and seconds remaining. Auto-updates every second.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/countdown/frontend.tsx
 *
 * DEPENDENCIES:
 * - None (vanilla JavaScript)
 *
 * CSS CLASSES:
 * - .ts-countdown: Main container
 * - .ts-countdown-unit: Each time unit (days, hours, etc.)
 * - .ts-countdown-value: The numeric value
 * - .ts-countdown-label: The label text
 * - .ts-countdown-complete: Added when countdown reaches zero
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT:
 *
 * {
 *   "date": "2025-12-31T23:59:59",    // Target date (ISO string)
 *   "labels": {
 *     "days": "Days",
 *     "hours": "Hours",
 *     "minutes": "Minutes",
 *     "seconds": "Seconds"
 *   },
 *   "hideOnComplete": false,          // Hide widget when done
 *   "completeMessage": "Event started!" // Message when done
 * }
 */

/* ==========================================================================
   SECTION 1: COUNTDOWN CLASS
   ========================================================================== */

class CountdownWidget {
  /**
   * Create a new countdown widget
   *
   * @param {HTMLElement} element - Container element with data-config
   */
  constructor(element) {
    this.el = element;
    this.config = JSON.parse(element.dataset.config || "{}");
    this.init();
  }

  /**
   * Initialize the countdown
   * Sets up the target date and starts the interval timer
   */
  init() {
    this.targetDate = new Date(this.config.date).getTime();
    this.tick(); // Initial render
    this.interval = setInterval(() => this.tick(), 1000);
  }

  /**
   * Update the countdown display
   * Called every second by the interval timer
   *
   * EDGE CASE: When countdown reaches zero:
   * - Clears the interval
   * - Adds .ts-countdown-complete class
   * - Shows complete message OR hides widget
   */
  tick() {
    const now = Date.now();
    const remaining = this.targetDate - now;

    if (remaining <= 0) {
      this.complete();
      return;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    this.render({ days, hours, minutes, seconds });
  }

  /**
   * Render the countdown values to the DOM
   *
   * @param {Object} time - Object with days, hours, minutes, seconds
   */
  render({ days, hours, minutes, seconds }) {
    const setValue = (selector, value) => {
      const el = this.el.querySelector(selector);
      if (el) el.textContent = value;
    };

    setValue('.ts-days .ts-countdown-value', days);
    setValue('.ts-hours .ts-countdown-value', hours);
    setValue('.ts-minutes .ts-countdown-value', minutes);
    setValue('.ts-seconds .ts-countdown-value', seconds);
  }

  /**
   * Handle countdown completion
   *
   * BEHAVIOR:
   * 1. Clears the interval timer
   * 2. Adds complete class for CSS styling
   * 3. If hideOnComplete: hides the widget
   * 4. If completeMessage: shows the message
   */
  complete() {
    clearInterval(this.interval);
    this.el.classList.add('ts-countdown-complete');

    if (this.config.hideOnComplete) {
      this.el.style.display = 'none';
    }

    if (this.config.completeMessage) {
      const messageEl = this.el.querySelector('.ts-countdown-message');
      if (messageEl) {
        messageEl.textContent = this.config.completeMessage;
        messageEl.style.display = 'block';
      }
    }
  }
}

/* ==========================================================================
   SECTION 2: AUTO-INITIALIZATION
   ========================================================================== */

/**
 * Auto-initialize all countdown widgets on page load
 *
 * SELECTOR: .ts-countdown[data-config]
 * Creates a new CountdownWidget instance for each matching element
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ts-countdown[data-config]').forEach(el => {
    new CountdownWidget(el);
  });
});

/* ==========================================================================
   EDGE CASES SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Missing config: Uses empty object default
 * 2. Invalid date: NaN comparison fails gracefully
 * 3. Past date: Immediately triggers complete()
 * 4. Missing DOM elements: setValue() checks existence
 * 5. Page unload: Interval continues (browser handles cleanup)
 */
```

---

## Start Command

Begin with the smallest file to validate the process:

```
Read: themes/voxel/assets/dist/js/countdown.js
Output: docs/block-conversions/countdown/voxel-countdown.beautified.js
```

Good luck!
