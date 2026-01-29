# Documentation Index

This folder contains project documentation, discovery notes, design system references, and development logs.

## 📂 Directory Structure

### Core Documentation

- **`voxel-discovery/`** — Voxel theme analysis and architectural discoveries
  - `01-voxel-structure-analysis.md` — Voxel data groups reference
  - `02-pivot-summary.md` — Phase 2 architectural decision (plugin → child theme)
  - `phase1/` — Dynamic data system discoveries
  - `phase2/` — Widget conversion and FSE template integration

- **`deployment/`** — Deployment guides and references
  - `01-deployment-checklist.md` — Pre-deployment checklist
  - `02-references.md` — Deployment resources

- **`roadmap/`** — Implementation plans and roadmaps
  - `01-phase-2-plan.md` — Phase 2 product types migration plan

### Reference Materials

- **`voxel-documentation/`** — Scraped Voxel official documentation (reference only)
- **`voxel-build-admin-ui/`** — Screenshots of Voxel admin UI (reference for building FSE equivalents)
- **`design-system/`** — TailwindUI component library (reference material)

### Development Logs

- **`project-log/`** — Task-based session logs and artifacts
  - `critical-pivots/` — Strategic discoveries that changed project direction
  - `tasks/` — Completed work logs
  - `phases/` — Phase-specific documentation
  - `changelog.md` — Chronological summary

- **`voxel-dynamic-tag-builder/`** — Dynamic tag builder implementation docs
  - `01-handoff-to-new-session.md` — Implementation guide
  - `02-issues-dynamic-tag-builder.md` — Known issues and solutions

- **`voxel-widget-block-conversion/`** — Widget-to-block conversion reference screenshots

## 🎯 Current Architecture

**Strategy:** All-in child theme (following Voxel's "everything in the theme" philosophy)

**Main codebase:** `themes/voxel-fse/`
- FSE child theme extending Voxel parent theme
- OOP controller pattern for core functionality
- Vite build system for blocks
- Dynamic data system with VoxelScript parser

## 📝 Maintenance

When adding new documentation:
1. Use numbered prefixes for sequential docs (e.g., `01-`, `02-`)
2. Use lowercase with hyphens for filenames
3. Add `.md` extension for all markdown files
4. Update this index if adding new top-level directories
5. Add entry to `CHANGELOG.md` for significant documentation changes
