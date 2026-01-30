# Voxel FSE Compatibility Shim Documentation

## Overview
This directory contains `voxel-fse-compat.js`, a critical "shim" script that ensures the Voxel FSE child theme functions correctly with the Voxel parent theme and external APIs. This script addresses two primary crash conditions.

## 1. Voxel Mixin Compatibility (The FSE Fix)
**Issue:**
Voxel's parent theme relies on Vue.js mixins (specifically `Voxel.mixins.base`) that expect to find Elementor-specific DOM structures (`.elementor-element`, `.elementor`, `dataset.id`). In the Full Site Editing (FSE) environment, these Elementor wrappers do not exist.
- **Symptom:** Console error: `Cannot read properties of null (reading 'dataset')`.
- **Result:** Popup components and other interactive Voxel elements fail to mount or crash the page.

**Solution:**
The shim intercepts the `Voxel.mixins.base` object immediately after initialization (using both event listeners and polling). It replaces the `mounted()` lifecycle hook with a safe version that:
1.  Checks for Elementor structure first (backward compatibility).
2.  Fallbacks to FSE block structure if Elementor is missing.
3.  Generates safe fallback IDs if neither are found.

## 2. Google Maps Billing Error (The Maps Fix)
**Issue:**
The project uses a Google Maps API key that does not have billing enabled. This causes specific libraries (like `places`) to fail when loading.
- **Symptom:** Console error: `BillingNotEnabledMapError`.
- **Result:** Critical JavaScript crash when Voxel tries to use the `places` library, breaking the entire page's scripting execution.
- **Reference:** [Google Maps Error Messages](https://developers.google.com/maps/documentation/javascript/error-messages#billing-not-enabled-map-error)

**Solution:**
The shim adds a patch for `google.maps.importLibrary`. It wraps the import function to catch promise rejections specifically for the `places` library.
1.  Intercepts the `BillingNotEnabledMapError` (or any import error).
2.  Returns a **Mock Places Library** instead of letting the error propagate.
3.  The mock library provides empty/no-op classes (`Autocomplete`, `PlacesService`, etc.) so Voxel's code can continue running without crashing.

## Usage
This script is automatically enqueued by `app/controllers/fse-compatibility-controller.php` on both the frontend and in the block editor.

**File:** `assets/js/voxel-fse-compat.js`
