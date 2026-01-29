# Parity Verification Session Prompt

**Purpose:** Use this prompt to initiate a thorough parity verification session for any Voxel FSE block.

---

## Prompt (Copy & Paste to Start Session)

```
I need you to perform a comprehensive parity verification for the [BLOCK_NAME] block.

## Context
- We are building Gutenberg blocks that must match Voxel's Elementor widgets EXACTLY
- Previous "100% parity" claims were premature - they passed functional tests but failed visual/behavioral tests
- We now have a rigorous checklist that must be completed before claiming parity

## Your Task

1. **Read the verification checklist:**
   `docs/block-conversions/PARITY-VERIFICATION-CHECKLIST.md`

2. **Read the block's existing parity document (if exists):**
   `docs/block-conversions/[BLOCK_NAME]/phase3-parity.md`

3. **Read the Voxel beautified JS reference:**
   `docs/block-conversions/[BLOCK_NAME]/voxel-[block-name].beautified.js`

4. **Read the FSE implementation:**
   `themes/voxel-fse/app/blocks/src/[block-name]/`

5. **Perform verification against ALL 11 checklist sections:**
   - Section 1: HTML Structure Match
   - Section 2: JavaScript Logic
   - Section 3: Feature Coverage
   - Section 4: Edge Cases & Integration
   - Section 5: Automated Tests
   - Section 6: Third-Party Library Configuration (Pikaday, noUiSlider, etc.)
   - Section 7: Visual Side-by-Side Testing
   - Section 8: Dynamic Content Verification
   - Section 9: Interactive Element Wiring
   - Section 10: Cross-Block Event Communication
   - Section 11: Disabled State Matrix

6. **Document findings:**
   - List all gaps found with file:line references
   - For each gap, provide the fix needed
   - Update the phase3-parity.md with accurate status

## Critical Rules

- Do NOT claim 100% parity without visual screenshot evidence
- Every third-party library config option must be compared (minDate, disableDayFn, etc.)
- Every button/interactive element must have a working handler
- Cross-block events must be verified (dispatch AND listener)
- Disabled states must be verified (what's grayed out when)

## Output Format

Provide a report with:
1. **Verification Summary Table** - Each checklist item with ✅/❌ status
2. **Gaps Found** - Detailed list with file:line references
3. **Fixes Required** - Code changes needed for each gap
4. **Updated Parity Status** - Honest percentage based on findings

Block to verify: [BLOCK_NAME]
```

---

## Example Usage

### For Search Form Block:
```
I need you to perform a comprehensive parity verification for the search-form block.

[... rest of prompt ...]

Block to verify: search-form
```

### For Post Feed Block:
```
I need you to perform a comprehensive parity verification for the post-feed block.

[... rest of prompt ...]

Block to verify: post-feed
```

---

## Quick Reference: Common Gaps Found

Based on previous verification sessions, check these first:

| Gap Type | Example | Where to Check |
|----------|---------|----------------|
| Missing library config | `minDate: new Date()` not passed to Pikaday | DatePicker.tsx Pikaday init |
| Button without handler | `<button>` rendered but no `onClick` | All `<button>` elements |
| Wrong date format | "December 28, 2025" vs "28 Dec 2025" | `toLocaleDateString()` calls |
| Missing disabled state | Past dates clickable | `disableDayFn` in Pikaday |
| Dynamic header missing | "Check-out" vs "[date] — Check-out" | Popup title props |
| Cross-block event gap | Reset button doesn't dispatch event | onClick handlers |

---

## Files to Always Check

1. **Checklist:** `docs/block-conversions/PARITY-VERIFICATION-CHECKLIST.md`
2. **Block Status:** `docs/block-conversions/BLOCK-PARITY-STATUS.md`
3. **Block Parity Doc:** `docs/block-conversions/[block-name]/phase3-parity.md`
4. **Voxel Reference:** `docs/block-conversions/[block-name]/voxel-*.beautified.js`
5. **FSE Implementation:** `themes/voxel-fse/app/blocks/src/[block-name]/`

---

## Post-Verification Actions

After completing verification:

1. **Update phase3-parity.md** with accurate status
2. **Update BLOCK-PARITY-STATUS.md** if parity percentage changes
3. **Create GitHub issues** for any gaps that need fixing
4. **Add screenshots** to `docs/block-conversions/[block-name]/screenshots/`

---

## Why This Exists

On December 24, 2025, we discovered that blocks claiming "100% parity" had significant gaps:
- DatePicker missing `minDate` (past dates not grayed)
- Reset button had no onClick handler
- Header format wrong ("[date] — Check-out" missing)
- Checkout dates selectable before check-in

The beautified Voxel JS had all these details - they just weren't verified during implementation. This checklist and prompt ensure thorough verification going forward.
