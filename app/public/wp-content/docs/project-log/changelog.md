# Project Changelog

Chronological log of all completed work.

---

## 2025-11-19

### ✅ Architecture Consolidation
- **What:** Moved all functionality from musicalwheel-core plugin to voxel-fse child theme
- **Impact:** Simplified architecture following Voxel's "everything in the theme" approach
- **Changes:**
  - Consolidated plugin code into child theme
  - Switched from Webpack to Vite build system
  - Implemented OOP controller pattern with FSE_Base_Controller
  - Fixed autoloader conflicts with parent theme
  - Renamed `controllers/templates/` → `controllers/fse-templates/`
  - Removed musicalwheel-core plugin entirely
- **Commits:**
  - Complete documentation reorganization across all docs directories
  - Reorganize documentation for better navigation and future sessions
  - Fix: Rename controllers/templates to controllers/fse-templates to avoid autoloader conflict
  - Refactor FSE templates to use proper OOP controller pattern
  - Fix: Remove base-controller that conflicts with parent theme's autoloader
- **Documentation:**
  - Updated all docs with numbered prefixes
  - Created comprehensive CHANGELOG.md
  - Updated project README.md with current architecture

---

## 2025-11-11

### ✅ Task 3.2: Complete Modifiers System
- **What:** Implemented 31 modifiers for VoxelScript (11 text, 3 number, 3 date, 13 control, 1 fallback)
- **Impact:** Enables data transformation in dynamic content tags
- **Features:**
  - Base modifier architecture with dependency injection
  - Two-tier modifier retrieval (group-specific → common)
  - Control flow logic with `$last_condition` tracking
  - Dynamic argument support for nested tags
- **Tests:** 31/31 passing, 37 assertions (100% coverage)
- **Commits:**
  - `f3a1f0e` - Implement Phase 3.2: Complete Modifiers System (31 modifiers)
  - `6ddde3f` - Fix: Load modifiers in test bootstrap and fix test syntax
  - `7ff1968` - Fix: Correct namespace for Renderer and Dynamic_Tag
  - `81c4b1c` - Fix: Add PHP fallbacks for WordPress functions
- **Prompt:** [phase-3.2-modifiers.md](phases/phase1/phase-3.2-modifiers.md)
- **Log:** [task-3.2-modifiers-system.md](tasks/task-3.2-modifiers-system.md)

### 📋 Documentation Reorganization
- **What:** Restructured project documentation with prompts/tasks separation
- **Impact:** Clear workflow: prompt (input) → execute → task log (output)
- **Structure:**
  - `prompts/` - Executable instructions (what to build)
  - `tasks/` - Completed work logs (what was built)
  - `days/` - Day-level summaries
  - `critical-pivots/` - Strategic discoveries
- **Files Created:**
  - `README.md` - Navigation hub
  - `changelog.md` - This file
  - `days/day-3-blocks-implementation.md`
  - `tasks/task-3.2-modifiers-system.md`
  - `prompts/phase-3.3-additional-data-groups.md`

---

## 2025-11-09

### ✅ Task 3.1: Widget Block Conversion + Critical Discovery
- **What:** Converted 2 widgets (Print Template, Ring Chart) to FSE blocks
- **Impact:** Critical architectural pivot - discovered Voxel's dynamic content system
- **Discovery:** Three-layer system (Tags + Modifiers + Editor) is Voxel's core value
- **Decision:** Paused widget conversion to implement dynamic system first
- **Duration:** ~4 hours
- **Log:** [2025-11-09-dynamic-content-discovery.md](critical-pivots/2025-11-09-dynamic-content-discovery.md)

### ✅ Phase 3.1: Core Parser & Renderer
- **What:** Implemented VoxelScript tokenizer and renderer
- **Features:**
  - Parser handles `@group(field)` syntax
  - Renderer coordinates data groups
  - Post data group (title, content, permalink)
  - Site data group (title, tagline, url, admin_url, language, date)
  - Theme-level `mw_render()` function
- **Tests:** 5/5 passing, 9 assertions
- **Files Created:**
  - `app/dynamic-data/parser/` (Tokenizer, Renderer, Token classes)
  - `app/dynamic-data/data-groups/` (Base, Post, Site)
  - `tests/unit/DynamicContentParserTest.php`
  - `tests/bootstrap.php` (with WordPress mocks)

### ✅ Phase 2: Dynamic System Discovery
- **What:** Comprehensive analysis of Voxel's dynamic content architecture
- **Discovered:**
  - 17 data groups (Post, User, Site, Term, etc.)
  - 29 modifiers (truncate, date_format, currency_format, etc.)
  - VoxelScript parser architecture
  - Elementor integration patterns
  - 27 visibility rules
- **Documentation Created:**
  - `docs/voxel-discovery/dynamic-system/CRITICAL_DISCOVERY.md`
  - `docs/voxel-discovery/dynamic-system/ELEMENTOR_INTEGRATION_DISCOVERY.md`
  - `docs/voxel-discovery/dynamic-system/IMPLEMENTATION_ROADMAP.md`
- **Duration:** ~14-20 hours

---

## 2025-11-08

### ✅ Day 2: Core Implementation
- Custom Post Types (CPTs) implementation
- Custom Fields System
- Block System Foundation
- Voxel 6 Addons Discovery

### ✅ Day 1: Analysis & Setup
- **What:** Voxel theme analysis and development environment setup
- **Analyzed:** 68 Voxel theme documents
- **Installed:**
  - WPGraphQL stack
  - UI component libraries (UntitledUI, shadcn, Flowbite)
- **Documentation:** Theme structure analysis

---

## Legend

- ✅ **Complete** - Task finished and documented
- ⏳ **In Progress** - Currently being worked on
- 📋 **Ready** - Prompt created, ready to execute
- 🔮 **Future** - Planned but not yet ready

---

**Last Updated:** 2025-11-11
