# Project Log

Central documentation hub for MusicalWheel FSE Theme development.

---

## 📂 Structure Overview

### **prompts/** - Executable Instructions
What Claude should build (written BEFORE work starts):
- [phase-3.2-modifiers.md](phases/phase1/phase-3.2-modifiers.md) ✅ Used
- [phase-3.3-additional-data-groups.md](phases/phase1/phase-3.3-additional-data-groups.md) 📋 Ready

### **tasks/** - Completed Work Logs
What was actually built (written AFTER work finishes):
- [task-3.2-modifiers-system.md](tasks/task-3.2-modifiers-system.md) ✅ Latest

### **phases/** - Phase Documentation
High-level overview of development phases:
- [phase1/day-3-blocks-implementation.md](phases/phase1/day-3-blocks-implementation.md)

### **critical-pivots/** - Strategic Discoveries
Rare discoveries that fundamentally changed approach:
- [2025-11-09-dynamic-content-discovery.md](critical-pivots/2025-11-09-dynamic-content-discovery.md)

### **Timeline**
- [changelog.md](changelog.md) - Chronological list of completed work

### **archive/** - Historical Documentation
Preserved documentation from previous development sessions:
- [2025-11-08_task-2.3/](archive/2025-11-08_task-2.3/) - Block system refactor
- [2025-11-09_task-3.1/](archive/2025-11-09_task-3.1/) - Widget conversion and discovery

---

## 🔄 Workflow

```
1. Read Prompt:      prompts/phase-3.3-additional-data-groups.md
2. Execute Work:     Implement the features
3. Write Task Log:   tasks/task-3.3-additional-data-groups.md
4. Create Next:      prompts/phase-3.4-react-editor-ui.md
```

This separation ensures:
- **Prompts** = Clear requirements before starting
- **Tasks** = Accurate record of what was actually done
- **No confusion** = Input (prompts) and output (tasks) are separate

---

## 🎯 Current Status

**Date:** November 2025
**Architecture:** All-in FSE Child Theme (post-consolidation)
**Next Action:** Review and continue with dynamic data system implementation

---

## 📊 Progress

| Task | Status | Completion |
|------|--------|------------|
| Day 1 | ✅ Complete | 2025-11-08 |
| Day 2 | ✅ Complete | 2025-11-09 |
| Task 3.1 | ✅ Complete | 2025-11-09 |
| Task 3.2 | ✅ Complete | 2025-11-11 |
| **Task 3.3** | **📋 Next** | **-** |

**Overall Progress:** ~32-38% complete (58-72 hours of 180-304 total)

---

## 📝 Documentation Guidelines

### When to Create New Documents

**Prompts** (before work):
- Create BEFORE starting any task/phase
- Contains: Requirements, architecture, acceptance criteria
- Purpose: Tell Claude what to build
- Naming: `phase-X.X-descriptive-name.md`

**Tasks** (after work):
- Create AFTER completing a task/phase
- Contains: Deliverables, commits, decisions, tests
- Purpose: Document what was built
- Naming: `task-X.X-descriptive-name.md`

**Days** (summaries):
- One per Implementation Plan day
- High-level overview linking to tasks
- Update as tasks complete

**Critical Pivots** (rare):
- Only for fundamental architectural discoveries
- Example: Discovering Voxel's dynamic content system
- Naming: `YYYY-MM-DD-descriptive-name.md`

### File Naming Conventions

- Prompts: `phase-X.X-name.md` or `prompt-name.md`
- Tasks: `task-X.X-name.md`
- Days: `day-X-name.md`
- Pivots: `YYYY-MM-DD-name.md`

---

## 🏗️ Project Architecture

### Completed Phases

**✅ Phase 1: Bundle Size Fix**
- Externalized WordPress packages
- Reduced bundle from 1.8MB to 0.14KB per block

**✅ Phase 2: Dynamic System Discovery**
- Discovered 17 data groups, 31 modifiers, 27 visibility rules
- Analyzed VoxelScript parser architecture
- Documented Elementor integration patterns

**✅ Phase 3.1: Core Parser & Renderer**
- Implemented VoxelScript tokenizer and renderer
- Created Post and Site data groups
- Built theme-level `mw_render()` function
- 5 tests, 9 assertions - all passing

**✅ Phase 3.2: Complete Modifiers System**
- Implemented 31 modifiers (11 text, 3 number, 3 date, 13 control, 1 fallback)
- Built base modifier architecture with dependency injection
- Created control flow logic with `$last_condition` tracking
- 31 tests, 37 assertions - all passing

### Next Phases

**📋 Phase 3.3: Additional Data Groups** (Next)
- User data group (`@user`)
- Current user data group (`@current_user`)
- Estimated: 8-12 hours

**🔮 Phase 3.4: React Editor UI** (Future)
- Dynamic tag builder component
- Tag tree with search
- Modifier editor UI

**🔮 Phase 3.5: Block Integration** (Future)
- `withDynamicTags` HOC
- Dynamic tag panel in InspectorControls
- Server-side rendering

**🔮 Phase 4: Widget Conversion** (Future)
- Convert 40 widgets with dynamic support
- Full feature parity with Voxel

---

## 🔗 Quick Links

**Ready to execute:** [phase-3.3-additional-data-groups.md](phases/phase1/phase-3.3-additional-data-groups.md)
**Latest completed:** [task-3.2-modifiers-system.md](tasks/task-3.2-modifiers-system.md)
**Timeline:** [changelog.md](changelog.md)
**Critical discovery:** [2025-11-09-dynamic-content-discovery.md](critical-pivots/2025-11-09-dynamic-content-discovery.md)

---

## 📚 Key Concepts

### VoxelScript Syntax
```
@group(field)              # Access data
@group(field).modifier()   # Apply transformation
@field.is_empty().then()   # Conditional logic
```

### Implemented Features
- ✅ Parser handles `@group(field)` syntax
- ✅ Renderer coordinates data groups
- ✅ Post data group (title, content, permalink)
- ✅ Site data group (title, tagline, url, etc.)
- ✅ 31 modifiers (text, number, date, control)
- ✅ Modifier chaining
- ✅ Control flow (then/else)
- ✅ Dynamic arguments (nested tags)

### Working Expressions
```php
@post(title).truncate(50)
@site(title).append( - Welcome)
@field.is_empty().then(Default).else(@field)
@product(price).currency_format(USD)
@post(date).date_format(Y-m-d)
```

---

**Back to:** [Main Documentation](../../README.md)

**Last Updated:** 2025-11-11
