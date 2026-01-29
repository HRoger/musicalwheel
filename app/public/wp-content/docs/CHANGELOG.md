# Changelog

All notable changes to the MusicalWheel project documentation and architecture are documented in this file.

## 2025-11-19

### Documentation Reorganization
- **Consolidated all functionality into voxel-fse child theme**
  - Removed `musicalwheel-core` plugin (moved all code to theme)
  - Reorganized controllers to avoid parent theme autoloader conflicts
  - Refactored FSE templates to use proper OOP controller pattern
  - Created `FSE_Base_Controller` class for child theme controllers
  - Moved controllers from `app/controllers/templates/` to `app/controllers/fse-templates/`

- **Reorganized docs/voxel-discovery/**
  - Removed outdated `SESSION-SUMMARY.md` (referenced removed plugin)
  - Moved `VOXEL_STRUCTURE_ANALYSIS.md` → `01-voxel-structure-analysis.md`
  - Moved `phase2/PIVOT-SUMMARY.md` → `02-pivot-summary.md`
  - Renamed all `.txt` files to `.md` in phase2/
  - Added numbered prefixes for sequential documentation

- **Reorganized other docs directories**
  - `deployment/` — Renamed files with numbered prefixes
  - `roadmap/` — Renamed phase plan files
  - `voxel-dynamic-tag-builder/` — Renamed docs with numbered prefixes
  - `voxel-widget-block-conversion/` — Added README.md

### Architecture Changes
- **Child Theme Strategy:** All functionality now in `themes/voxel-fse/`
  - No separate plugin — follows Voxel's "everything in the theme" approach
  - Avoids `locate_template()` conflicts with parent theme autoloader
  - Cleaner, simpler codebase maintenance

### Build System
- **Switched from Webpack to Vite** for all block builds
  - Faster development builds with HMR
  - Modern ESM format output
  - Consolidated build configuration

---

## 2025-11-08

### Task 2.3 — Block System Refactor
- **Documentation moved to** `docs/project-log/archive/2025-11-08_task-2.3/`
  - `BLOCK_SYSTEM_REFACTOR_COMPLETE.md`
  - `VALIDATION_CHECKLIST.md`
  - `REFACTORING_SUMMARY.md`
  - `QUICK_START.md`
  - `FIX_APPLIED.md`
  - `CORS_FIX_APPLIED.md`

- **Block System Updates:**
  - Consolidated duplicate loaders into `app/blocks/Block_Loader.php`
  - Removed manual block registration from `functions.php`
  - Implemented auto-discovery for blocks (scan `app/blocks/src/*/block.json`)
  - Added HMR support via Vite (`@vite/client`) with dev/prod asset handling

- **Vite Configuration:**
  - Added `cors: true` to `vite.config.ts`
  - Added `manifest: true` for production builds
  - Added `require_once MWFSE_PATH . '/app/utils/class-vite-loader.php'` to `functions.php`

- **Testing:**
  - Created `test-auto-discovery` block to validate scalability

---

## Documentation Structure

Current documentation organization:

```
docs/
├── README.md                       # This index
├── CHANGELOG.md                    # This file
├── deployment/                     # Deployment guides
├── roadmap/                        # Implementation plans
├── voxel-discovery/                # Voxel theme analysis
│   ├── 01-voxel-structure-analysis.md
│   ├── 02-pivot-summary.md
│   ├── phase1/
│   └── phase2/
├── voxel-documentation/            # Scraped Voxel docs (reference)
├── voxel-build-admin-ui/           # Admin UI screenshots (reference)
├── voxel-dynamic-tag-builder/      # Dynamic tag implementation
├── voxel-widget-block-conversion/  # Widget conversion screenshots
├── design-system/                  # TailwindUI reference
└── project-log/                    # Development logs
    ├── critical-pivots/
    ├── tasks/
    ├── phases/
    └── archive/
```
