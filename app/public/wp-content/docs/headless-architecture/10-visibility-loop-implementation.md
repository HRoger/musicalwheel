# Map Block - Visibility & Loop Implementation Walkthrough

## Summary

Implemented server-side visibility rules and loop element processing for the map block, with headless-ready data attribute output for future Next.js integration.

---

## Changes Made

### New Files

| File | Purpose |
|:-----|:--------|
| [visibility-evaluator.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/visibility-evaluator.php) | Wrapper for Voxel Core visibility evaluation |
| [loop-processor.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/loop-processor.php) | PHP processor for loop element iteration |
| [render.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/map/render.php) | Server-side render callback for map block |

### Modified Files

| File | Change |
|:-----|:-------|
| [block.json](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/map/block.json) | Added `"render": "file:./render.php"` |
| [save.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/map/save.tsx) | Added headless data attributes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  GUTENBERG EDITOR                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  VoxelTab controls save visibility/loop config to attributes   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  save.tsx outputs:                                                      │
│  • Static HTML for WordPress                                            │
│  • data-visibility-* attrs for headless Next.js                        │
└─────────────────────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌───────────────────────┐     ┌─────────────────────────┐
│  WordPress render.php │     │  Future: Next.js        │
│  ┌─────────────────┐  │     │  ┌─────────────────┐   │
│  │ Visibility_     │  │     │  │ evaluateVisib() │   │
│  │ Evaluator       │  │     │  │ resolveLoop()   │   │
│  ├─────────────────┤  │     │  └─────────────────┘   │
│  │ Delegated to    │  │     │  Parse data-* attrs    │
│  │ Voxel Core      │  │     └─────────────────────────┘
│  └─────────────────┘  │
│  Returns final HTML   │
└───────────────────────┘
```

---

## Visibility Logic (Voxel Parity)

The system now **delegates** evaluation to Voxel's native core function `\Voxel\evaluate_visibility_rules()`, ensuring 1:1 logic match with the parent theme.

1.  **Admin Bypass:** Administrators in the block editor (REST requests) always see the block, bypassing visibility rules (matches Elementor behavior).
2.  **Data Transformation:** internally maps FSE `filterKey` to Voxel's `type` and wraps rules in Voxel's expected Group/Rule structure.
3.  **Supported Rules:** Supports ALL rules available in Voxel, as it uses the Voxel core engine directly.

---

## Manual Testing

### Test Visibility Rules

1. Open WordPress editor → Add Map block
2. Go to **Voxel tab** → **Visibility** accordion
3. Set behavior to "Show this element if"
4. Click **Edit rules** → Add "User is logged in"
5. Save and preview:
   - **Logged in**: Map visible ✅
   - **Incognito**: Map hidden ✅

### Verify Data Attributes

View page source (Ctrl+U) and find the map block div:

```html
<div class="wp-block-voxel-fse-map..."
     data-visibility-behavior="show"
     data-visibility-rules='[{"id":"...","filterKey":"user:logged_in",...}]'>
```

---

## Reusability

The shared utilities are designed for reuse across all blocks:

```php
// Any block's render.php can use:
use VoxelFSE\Blocks\Shared\Visibility_Evaluator;
use VoxelFSE\Blocks\Shared\Loop_Processor;

$should_render = Visibility_Evaluator::evaluate($rules, $behavior);
$items = Loop_Processor::resolve($config);
```

---

## Build Status

✅ TypeScript build passed  
✅ PHP syntax verified  
✅ Ready for manual testing
