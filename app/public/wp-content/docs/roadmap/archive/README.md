# Roadmap Archive

Historical planning documents that have been superseded by the current architecture.

---

## Contents

### AI_AGENT_IMPLEMENTATION_PLAN_v3.9.md
**Original Date:** November 9, 2025
**Status:** Superseded

Original implementation plan for building a monolithic WordPress FSE theme from scratch with:
- Headless WordPress architecture
- WPGraphQL + Next.js + Vercel stack
- Complete Voxel feature recreation
- Full backend obfuscation

**Why Archived:** This approach was superseded by the current "all-in child theme" strategy that:
- Extends Voxel parent theme rather than recreating it
- Uses WordPress FSE without headless architecture (for now)
- Consolidates all functionality in a child theme
- Follows Voxel's "everything in the theme" philosophy

The headless approach may be revisited in Phase 4, but the current focus is on building a solid FSE child theme foundation first.

---

### LOCAL_BY_FLYWHEEL_GIT_STRUCTURE.md
**Status:** Reference only

Brief git workflow documentation for Local by Flywheel setup. Still relevant for understanding the two-repository approach (WordPress theme + Next.js frontend), but the Next.js frontend hasn't been implemented yet.

---

## Current Strategy

The current architecture is documented in:
- **[../../README.md](../../README.md)** - Main documentation index
- **[../../CHANGELOG.md](../../CHANGELOG.md)** - Architecture evolution
- **[../../voxel-discovery/02-pivot-summary.md](../../voxel-discovery/02-pivot-summary.md)** - Plugin → child theme decision
- **[../01-phase-2-plan.md](../01-phase-2-plan.md)** - Current roadmap

---

**Last Updated:** November 2025
