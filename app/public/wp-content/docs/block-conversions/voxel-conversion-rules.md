# Voxel Elementor Widgets to Voxel-FSE Gutenberg Blocks Conversion Guide

## Overview
This document defines the conversion rules and requirements for migrating Voxel Elementor widgets to Voxel-FSE Gutenberg blocks.

## Backend Conversion Requirements

### Inspector Controls Migration
- **Source**: Elementor controls (UI/UX components)
- **Target**: Voxel-FSE Custom Gutenberg FSE Inspector Controls library
- **Location**: `app/public/wp-content/themes/voxel-fse/app/blocks/src/shared`
- **Action**: Convert all Elementor control definitions to corresponding Gutenberg Inspector Controls using the shared library

## Frontend Conversion Requirements

### HTML Structure Preservation (CRITICAL)
**REQUIREMENT**: The converted Gutenberg blocks MUST maintain a 1:1 HTML structure match with the original Elementor widgets.

- Every HTML element, class name, and DOM hierarchy from the Elementor widget must be preserved exactly
- Ensure data attributes, wrapper elements, and nesting levels remain identical
- The frontend rendering output must be indistinguishable from the Elementor version

## Reference Documentation

### Primary Architecture Documents
1. `app/public/wp-content/docs/headless-architecture/01-accelerated-option-c-plus-strategy.md`
2. `app/public/wp-content/docs/headless-architecture/02-headless-architecture-options-summary.md`

### Conversion Implementation Guides
3. `app/public/wp-content/docs/conversions/search-form/search-form-implementation-summary.md`
4. `app/public/wp-content/docs/conversions/create-post/create-post-plan-c-plus-implementation.md`
5. `app/public/wp-content/docs/conversions/create-post-style-loading-explained.md`
6. `app/public/wp-content/docs/conversions/google-maps-gutenberg-editor-fix.md`
7. `app/public/wp-content/docs/conversions/gutenberg-block-registration-guide.md`
8. `app/public/wp-content/docs/conversions/gutenberg-create-post-rendering.md`
9. `app/public/wp-content/docs/conversions/popup-eager-loading-optimization.md`
10. `app/public/wp-content/docs/conversions/popup-kit-field-popup-discovery.md`
11. `app/public/wp-content/docs/conversions/popup-positioning-architecture.md`
12. `app/public/wp-content/docs/conversions/product-field-backend-rendering-fix.md`
13. `app/public/wp-content/docs/conversions/responsive-controls-discovery.md`
14. `app/public/wp-content/docs/conversions/voxel-ajax-system.md`
15. `app/public/wp-content/docs/voxel-discovery/phase2/02-widget-files.md`

### Official Voxel Documentation
**Location**: `app/public/wp-content/docs/voxel-documentation`

**Naming Convention**: `docs.getvoxel.io_articles_{article-name}_.md`

**Example**: To understand the `product-form-vx-widget`, locate the file:
```
docs.getvoxel.io_articles_product-form-vx-widget_.md
```

## Conversion Workflow

1. **Identify Widget**: Determine which Elementor widget requires conversion
2. **Review Documentation**: Consult the official Voxel documentation using the naming pattern
3. **Map Controls**: Convert Elementor controls to Gutenberg Inspector Controls
4. **Preserve Structure**: Ensure frontend HTML output matches exactly
5. **Reference Guides**: Use the conversion implementation guides for specific patterns
6. **Test Rendering**: Verify the block renders identically to the original widget

 