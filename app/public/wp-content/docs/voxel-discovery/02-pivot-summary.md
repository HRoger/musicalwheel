# Phase 2 Pivot Summary

**Date:** 2025-11-15

## Critical Discovery

Voxel Product Types = **complete ecommerce system** (like WooCommerce)
- NOT just pricing widgets
- 11 product fields + 6 addons + 9 data inputs
- Full admin interface (Vue.js → React migration needed)
- Marketplace, shipping, inventory, bookings, tax

## Storage

**wp_options:** `voxel:product_types` (JSON)
**Classes:** Product_Type, Product_Type_Repository (Repository pattern)

## Revised Plan

~~OLD: Convert widgets first (WRONG - no data to display)~~

**NEW: Build data layer first**
1. Core infrastructure (Product_Type classes)
2. Admin interface (Vue → React)
3. Product fields (26 types)
4. Frontend blocks + widgets
5. Advanced features

## Key Files

```
/themes/voxel/app/product-type.php
/themes/voxel/app/product-types/product-type-repository.php
/themes/voxel/app/controllers/ecommerce/product-types/
/themes/voxel/templates/backend/product-types/
/themes/voxel/app/product-types/product-fields/*.php (11)
/themes/voxel/app/product-types/product-addons/*.php (6)
/themes/voxel/app/product-types/data-inputs/*.php (9)
```

## Next: Task 2.1

Create musicalwheel-fse Product Type infrastructure
- Product_Type class
- Repository pattern
- wp_options storage
- Admin menu

**Discover implementation details from Voxel code as needed (no more lengthy docs)**
