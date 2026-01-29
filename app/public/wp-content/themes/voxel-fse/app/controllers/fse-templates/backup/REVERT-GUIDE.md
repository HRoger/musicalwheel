# Revert Guide: action=fse Implementation

**Date:** November 2025
**Version:** 1.1.0 → 1.0.x (revert)

---

## Quick Revert (5 minutes)

### Step 1: Restore Backup Files

```bash
cd app/public/wp-content/themes/voxel-fse

# Restore vue-integration.php
cp app/controllers/fse-templates/backup/vue-integration.php.backup \
   app/controllers/fse-templates/vue-integration.php

# Restore design-menu-integration.php
cp app/controllers/fse-templates/backup/design-menu-integration.php.backup \
   app/controllers/fse-templates/design-menu-integration.php
```

### Step 2: Remove New Handler

**In `templates-controller.php` line 33:**

```php
// REMOVE this line:
require_once VOXEL_FSE_TEMPLATES_PATH . '/fse-action-handler.php';

// Keep the rest as-is
require_once VOXEL_FSE_TEMPLATES_PATH . '/vue-integration.php';
```

### Step 3: Delete New File (Optional)

```bash
rm app/controllers/fse-templates/fse-action-handler.php
```

---

## What Changed

### New Files Created:
- `fse-action-handler.php` - WordPress `replace_editor` filter handler

### Files Modified:
- `vue-integration.php` - Changed `replaceEditLinks()` to use `action=fse`
- `design-menu-integration.php` - Changed `replaceEditLinks()` to use `action=fse`
- `templates-controller.php` - Added require for `fse-action-handler.php`

### Files Backed Up:
- `backup/vue-integration.php.backup`
- `backup/design-menu-integration.php.backup`

---

## How to Test Revert

1. Restore backup files (Step 1)
2. Remove handler require (Step 2)
3. Clear browser cache
4. Test template editing in Post Types admin
5. Verify links go to Site Editor URLs (old behavior)

---

## Why Revert Might Be Needed

- `replace_editor` filter conflicts with other plugins
- WordPress version compatibility issues
- Performance issues with redirects
- Prefer direct Site Editor URLs

---

## Git Revert (If Committed)

```bash
# Find the commit
git log --oneline --grep="action=fse"

# Revert the commit
git revert <commit-hash>
```

---

**Last Updated:** November 2025

