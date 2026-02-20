# Template Parity Workflow — Reference Document

**Created:** 2026-02-17
**Command:** `/parity:template`
**Agent:** `template-parity-agent`

---

## Purpose

This workflow compares Voxel Elementor template parts against their FSE (Full Site Editing) equivalents **block-by-block**, discovers all bugs independently via browser automation and code analysis, then fixes every issue until 100% parity is achieved.

Unlike per-block conversion (`/convert:widget`), this workflow operates at the **template level** — fixing all blocks within a template part (header, footer, sidebar, etc.) as a cohesive unit.

---

## Quick Start

```bash
# Full workflow for a template
/parity:template {template-name} --voxel-url="..." --fse-url="..."

# With user bug report (supplementary)
/parity:template {template-name} --voxel-url="..." --fse-url="..." --bugs="path/to/bugs.md"

# Focus on single block within template
/parity:template {template-name} --voxel-url="..." --fse-url="..." --block=navbar

# Resume from specific phase
/parity:template {template-name} --voxel-url="..." --fse-url="..." --phase=3
```

### Example: Header Template

```bash
/parity:template header-default \
  --voxel-url="http://voxel.local/wp-admin/post.php?post=175&action=elementor" \
  --fse-url="https://musicalwheel.local/stays/wp-admin/site-editor.php?canvas=edit&p=%2Fwp_template%2Fvoxel-fse%2F%2Fvoxel-header-default"
```

---

## Parameters

| Parameter | Required | Description |
|---|---|---|
| `{template-name}` | Yes | Template part name (e.g., `header-default`, `footer-default`) |
| `--voxel-url` | Yes | Voxel Elementor editor URL |
| `--fse-url` | Yes | FSE site editor URL |
| `--bugs` | No | Path to user bug report file. Agent discovers bugs independently — this is supplementary |
| `--phase` | No | Start at specific phase (1-6) |
| `--block` | No | Focus on single block within the template |

---

## The 6 Phases

```
Phase 1: VOXEL LEARNING          → Learn how every Elementor widget works
    ↓ [User confirms]
Phase 2: FSE ASSESSMENT           → Assess current state of FSE blocks
    ↓ [User confirms]
Phase 3: BLOCK-BY-BLOCK COMPARISON → 4-dimension diff per block
    ↓ [User confirms]
Phase 4: FIX PLANNING             → Prioritized fix plan with command assignments
    ↓ [USER APPROVAL REQUIRED]
Phase 5: IMPLEMENTATION           → Apply fixes block-by-block
    ↓ [User confirms per block]
Phase 6: VERIFICATION             → Re-compare, calculate parity percentage
    ↓ [Final report]
```

### Phase 1: Voxel Learning

Opens the Voxel Elementor editor URL in agent-browser. For each widget in the template:
- Screenshots inspector panels (Content, Style, Advanced tabs)
- Expands every accordion section
- Tests responsive at desktop/tablet/mobile viewports
- Tests interactions (dropdowns, popups, hover states)
- Reads Voxel source code via parallel Explore subagents

### Phase 2: FSE Assessment

Opens the FSE site editor URL. For each block:
- Screenshots inspector sidebar
- Tests each control (does changing it affect the preview?)
- Runs `/wire:audit {block}` for wiring completeness
- Identifies editor-specific bugs (popup positioning, link behavior)
- Incorporates user's `--bugs` report if provided

### Phase 3: Block-by-Block Comparison

Compares each block across 4 dimensions:

| Dimension | What's Compared |
|---|---|
| **HTML Structure** | Elements, CSS classes, data attributes, SVGs, conditionals |
| **Inspector Controls** | Control mapping, wiring status, missing/extra controls |
| **JavaScript Behavior** | Popups, click handlers, AJAX, link behavior in editor |
| **Responsive Behavior** | Desktop/tablet/mobile layout, breakpoint styles |

Issues classified by severity: Critical, High, Medium, Low.

### Phase 4: Fix Planning

Creates a prioritized fix plan with command assignments. Each issue gets:
- Severity rating
- Assigned command (or "direct edit" for simple fixes)
- Scope estimate

**User approval required before proceeding to implementation.**

### Phase 5: Implementation

Applies fixes one block at a time (sequential to prevent file conflicts). After each block:
- Builds the theme to verify no errors
- Reports progress to user

### Phase 6: Verification

Re-opens both URLs, re-tests everything, calculates final parity percentage per block. Generates report saved to `docs/block-conversions/{template-name}/`.

---

## Command Delegation Matrix

The agent diagnoses issue types and delegates to existing specialized commands:

### Diagnostic Commands

| Issue Type | Command |
|---|---|
| Deep per-block analysis | `/audit:subagents-task {block}` |
| Control wiring check | `/wire:audit {block}` |
| Admin config check | `/wire:admin-audit {block}` |

### Fix Commands

| Issue Type | Command |
|---|---|
| Control not wired to output | `/wire:controls {block}` |
| CSS not generating on frontend | `/wire:implement-css {block}` |
| Admin options disconnected | `/wire:admin-controls {block}` |
| Entire inspector accordion broken | `/convert:inspector-tab {block} --tab=X --accordion="Y"` |
| API controller missing/broken | `/convert:full-parity {block}` |
| REST API data lifecycle issue | `/fix:parity {block}` |
| Shared control missing | Control creation sub-workflow |
| Simple HTML/CSS fix | Direct edit |

### Decision Tree

```
Issue identified
    │
    ├── Wiring problem?
    │   ├── Single control → /wire:controls
    │   ├── CSS generation → /wire:implement-css
    │   └── Admin config → /wire:admin-controls
    │
    ├── Entire section broken?
    │   └── /convert:inspector-tab
    │
    ├── Data/API problem?
    │   ├── API controller → /convert:full-parity
    │   └── Data lifecycle → /fix:parity
    │
    ├── Shared control missing?
    │   └── Create in shared/controls/
    │
    └── Simple fix?
        └── Direct edit
```

---

## Bug Report Format

When providing a `--bugs` file, use this hierarchical format:

```markdown
1. BLOCK-NAME (VX)
   1. BLOCK (runtime issues)
      1. Bug description
      2. Bug description
   2. INSPECTOR CONTROLS
      1. TAB NAME
         1. ACCORDION NAME
            1. Control issue description
            2. Control issue description
      2. ANOTHER TAB
         1. ACCORDION NAME
            1. Issue description
```

### Example

```markdown
1. FLEX-CONTAINER (VX)
   1. LAYOUT TAB
      1. Container Accordion
         1. Width does not work: e-con-inner div not changing
         2. Min-Height: changes ALL flex-containers on page
   2. STYLE TAB
      1. Border accordion
         1. BORDER TYPE is hardcoded instead of using shared BorderGroupControl
2. NAVBAR (VX)
   1. BLOCK
      1. Popup shows in wrong position (too far left)
      2. Parent links without children navigate instead of doing nothing
   2. INSPECTOR CONTROLS
      1. CONTENT TAB
         1. SOURCE Accordion
            1. CHOOSE SOURCE > Select existing Menu: empty white space instead of EmptyPlaceholder
         2. SETTINGS Accordion
            1. Justify control not wired
            2. Hamburger Menu not wired
```

---

## File Locations

| File | Path | Purpose |
|---|---|---|
| Command | `.claude/commands/parity/template.md` | User-facing `/parity:template` skill |
| Agent | `.claude/agents/template-parity-agent.md` | Orchestrator agent definition |
| This doc | `docs/template-parity-workflow.md` | Reference for future sessions |
| Reports output | `docs/block-conversions/{template-name}/` | Generated parity reports |

---

## Architecture

```
/parity:template (command — user interface)
    │
    └── template-parity-agent (agent — orchestrator)
        │
        ├── Browser automation (agent-browser CLI)
        │   ├── Voxel Elementor editor
        │   └── FSE site editor
        │
        ├── Code research (parallel Explore subagents)
        │   ├── Voxel widget source (themes/voxel/)
        │   └── FSE block source (themes/voxel-fse/)
        │
        └── Delegated commands (existing skills)
            ├── /wire:audit, /wire:controls, /wire:implement-css
            ├── /audit:subagents-task, /audit:frontend-health
            ├── /convert:inspector-tab, /convert:full-parity
            └── /fix:parity
```

---

## Related Commands

| Command | When to Use Instead |
|---|---|
| `/convert:widget {name}` | Converting a single widget from scratch (no existing block) |
| `/convert:inspector-tab {name}` | Fixing a single inspector accordion |
| `/wire:controls {name}` | Quick-fixing a single control's wiring |
| `/audit:subagents-task {name}` | Deep research without fixing |
| `/parity:template {name}` | **This workflow** — template-level comparison + fix everything |
