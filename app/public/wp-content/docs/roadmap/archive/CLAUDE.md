# Claude Code - MusicalWheel Project Guide

**Last Updated:** November 2025
**Current Architecture:** All-in FSE Child Theme (voxel-fse)
**Development Branch:**  

---

## ⚠️ CRITICAL - READ FIRST

**Before starting ANY work:**

1. Read `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
2. Consult `.mcp-memory/memory.json` for existing patterns and solutions
3. Absolutely read `docs/block-conversions/universal-widget-conversion-prompt.md` for block conversion guidelines.

This document contains **mandatory rules** for:

- ✅ Discovery-first methodology
- ✅ 1:1 Voxel matching requirements
- ✅ Autoloader conflict prevention
- ✅ Evidence-based implementation
- ❌ What you are NOT permitted to do

**Failure to follow these rules will result in broken implementations.**

---

## 🎯 Quick Project Overview

**MusicalWheel** is a WordPress-based music industry directory platform built as an FSE child theme extending the Voxel
parent theme.

**Current Status:**

- ✅ Phase 1 Complete: FSE child theme foundation (Nov 2025)
- 📋 Phase 2 Current: Product Types migration and admin interface
- 🔮 Future: Timeline extended, external database (Supabase), headless Next.js

**Key Architecture Decision (Nov 2025):**
All functionality consolidated into `themes/voxel-fse/` child theme. No separate plugin. Follows Voxel's "everything in
the theme" philosophy.

---

## 🏗️ Current Architecture

### All-in Child Theme Strategy

```
themes/voxel-fse/           # FSE child theme (ALL functionality here)
├── functions.php           # Theme initialization
├── style.css              # Child theme header
├── app/
│   ├── controllers/       # OOP controllers (FSE_Base_Controller pattern)
│   │   ├── fse-base-controller.php
│   │   └── fse-templates/  # FSE template controllers
│   ├── blocks/            # Gutenberg blocks
│   │   ├── Block_Loader.php
│   │   └── src/           # Block source (React/TypeScript)
│   ├── dynamic-data/      # VoxelScript parser & data system
│   │   ├── parser/        # Tokenizer, Renderer
│   │   ├── data-groups/   # Post, User, Site, Term
│   │   └── modifiers/     # 31+ modifiers (text, number, date, control)
│   ├── modules/           # Feature modules (courses, etc.)
│   └── utils/             # Utility functions
├── assets/                # Compiled assets
└── vite.blocks.config.js  # Vite build configuration
```

### Key Architectural Patterns

**1. OOP Controller Pattern**

```php
// themes/voxel-fse/app/controllers/fse-base-controller.php
namespace VoxelFSE\Controllers;

abstract class FSE_Base_Controller {
    abstract protected function hooks();
    protected function dependencies() {}
    protected function authorize() { return true; }
    // Helper methods: filter(), on(), once()
}
```

**2. Autoloader Conflict Avoidance**
⚠️ **CRITICAL:** Voxel parent uses `locate_template()` which searches child theme first.

**Solutions:**

- ✅ Use different filenames: `fse-base-controller.php` not `base-controller.php`
- ✅ Use different paths: `controllers/fse-templates/` not `controllers/templates/`
- ✅ Use distinct namespaces: `VoxelFSE\` not `Voxel\`

**3. Vite Build System**

- Modern ESM builds with HMR
- WordPress packages externalized
- Auto-discovery via Block_Loader.php

---

## 🚀 Development Workflow

### Starting Development

```bash
# Navigate to theme
cd themes/voxel-fse

# Install dependencies
npm install

# Start dev server with HMR
npm run dev

# Production build
npm run build
```

### Common Git Operations

```bash
# Check current branch
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Stage and commit
git add .
git commit -m "Description of changes"

# Push to remote (ALWAYS use -u flag)
git push -u origin branch-name

# Push retries: If network fails, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)
```

### Creating Commits

**When to commit:**

- Only when user explicitly requests
- After completing a feature or fix
- Before major architectural changes

**Commit format:**

```bash
git commit -m "$(cat <<'EOF'
Brief summary of changes

Detailed explanation:
- What changed
- Why it changed
- Impact of changes

Files affected:
- path/to/file1.php
- path/to/file2.tsx
EOF
)"
```

---

## 📁 Key File Locations

### Controllers

- **Base Controller:** `themes/voxel-fse/app/controllers/fse-base-controller.php`
- **FSE Templates:** `themes/voxel-fse/app/controllers/fse-templates/templates-controller.php`
- **Pattern:** All controllers extend `FSE_Base_Controller`

### Blocks

- **Loader:** `themes/voxel-fse/app/blocks/Block_Loader.php`
- **Source:** `themes/voxel-fse/app/blocks/src/*/`
- **Build Config:** `themes/voxel-fse/vite.blocks.config.js`
- **Auto-discovery:** Reads all `block.json` files in `src/*/`

### Dynamic Data System

- **Parser:** `themes/voxel-fse/app/dynamic-data/parser/` (Tokenizer, Renderer)
- **Data Groups:** `themes/voxel-fse/app/dynamic-data/data-groups/` (Post, User, Site, Term)
- **Modifiers:** `themes/voxel-fse/app/dynamic-data/modifiers/` (31+ modifiers)
- **Config:** `themes/voxel-fse/app/dynamic-data/config.php`

### Documentation

- **⚠️ CRITICAL INSTRUCTIONS:** `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` **(READ FIRST)**
- **Main Index:** `docs/README.md`
- **Changelog:** `docs/CHANGELOG.md`
- **Project Log:** `docs/project-log/` (prompts, tasks, phases, critical-pivots)
- **Voxel Discovery:** `docs/voxel-discovery/` (architecture analysis)
- **Voxel Documentation:** `docs/voxel-documentation/` (Voxel theme feature specs)
- **Build Admin UI:** `docs/voxel-build-admin-ui/` (admin interface implementation)
- **Widget Conversion:** `docs/voxel-widget-block-conversion/` (widget-to-block reference)
- **Dynamic Tag Builder:** `docs/voxel-dynamic-tag-builder/` (dynamic tag implementation)
- **Roadmap:** `docs/roadmap/` (implementation plans)

### Memory (MUST CONSULT)

- **Project Memory:** `.mcp-memory/memory.json` (project knowledge graph)
- **Format:** JSONL with entities and relations
- **Usage:** ALWAYS check memory before implementing patterns - solutions may already exist
- **Update:** Add new patterns/learnings after significant implementations

---

## 🔧 Common Tasks

### Adding a New Block

1. Create block directory:

```bash
mkdir -p themes/voxel-fse/app/blocks/src/my-block
```

2. Create `block.json`:

```json
{
  "apiVersion": 2,
  "name": "voxel-fse/my-block",
  "title": "My Block",
  "category": "voxel-fse",
  "icon": "star-filled",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css"
}
```

3. Create `index.js` (or `index.tsx` for TypeScript)
4. Auto-discovery handles registration automatically

### Adding a New Controller

1. Create controller file in `app/controllers/`:

```php
<?php
namespace VoxelFSE\Controllers;

class My_Controller extends FSE_Base_Controller {
    protected function hooks() {
        $this->on( 'init', '@initialize' );
    }

    protected function initialize() {
        // Implementation
    }
}
```

2. Load in `functions.php`:

```php
require_once VOXEL_FSE_PATH . '/app/controllers/my-controller.php';
new \VoxelFSE\Controllers\My_Controller();
```

### Running Tests

```bash
cd themes/voxel-fse
./vendor/bin/phpunit
```

---

## 🐛 Troubleshooting

### Parent Theme Class Not Found

**Error:** `Class 'Voxel\Controllers\Some_Class' not found`

**Cause:** Child theme file at same path as parent prevents autoloading.

**Solution:**

1. Rename child theme file (add `fse-` prefix)
2. Move to different directory (add `fse-` to path)
3. Check namespace is `VoxelFSE\` not `Voxel\`

### Vite Build Issues

**HMR not working:**

```bash
# Check dev server is running
npm run dev

# Verify VITE_DEV_SERVER_URL constant in wp-config.php
define('VITE_DEV_SERVER_URL', 'http://localhost:5173');
```

**Build errors:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Git Push Fails with 403

**Error:** HTTP 403 when pushing

**Cause:** Branch name doesn't match session ID pattern

**Solution:** Branch must start with `claude/` and end with matching session ID

---

## 📚 Documentation Structure

### docs/project-log/

- **prompts/** - Task instructions (written BEFORE work)
- **tasks/** - Completed work logs (written AFTER work)
- **phases/** - Phase summaries
- **critical-pivots/** - Major architectural discoveries
- **archive/** - Historical session documentation

### docs/voxel-discovery/

- Voxel theme analysis and architectural discoveries
- Architecture decisions and pivot summaries
- Integration patterns with Voxel parent theme
- Numbered prefix structure (01-filename.md)

### docs/voxel-documentation/

- Official Voxel theme feature specifications
- 160+ markdown files with feature documentation
- User guides and screenshots
- Reference for understanding Voxel features

### docs/voxel-build-admin-ui/

- Admin interface implementation documentation
- UI/UX patterns from Voxel admin
- React component structures for admin screens
- Product type and field management UI

### docs/voxel-widget-block-conversion/

- Widget-to-block conversion reference
- Screenshots of Voxel widgets for conversion
- Comparison between Elementor widgets and FSE blocks
- Conversion patterns and best practices

### docs/voxel-dynamic-tag-builder/

- Dynamic tag builder implementation docs
- VoxelScript parser architecture
- Tag editor UI components
- Modifier system documentation

### docs/roadmap/

- Implementation plans for upcoming phases
- Future features and enhancements
- Phase planning and estimates
- **archive/** - Superseded planning documents

### docs/deployment/

- Deployment checklists and procedures
- Environment configuration
- Production setup guides

---

## 🎓 Key Concepts

### VoxelScript Parser

**Syntax:**

```
@group(field)                    # Access data
@group(field).modifier()         # Apply transformation
@field.is_empty().then(Default)  # Conditional logic
```

**Examples:**

```
@post(title).truncate(50)
@site(title).append( - Welcome)
@field.is_empty().then(Default).else(@field)
@product(price).currency_format(USD)
```

### Dynamic Data Groups

- **Post:** title, content, permalink, id
- **User:** name, email, display_name, role
- **Site:** title, tagline, url, admin_url, language
- **Term:** name, slug, description, count

### Modifiers (31+)

**Text (11):** truncate, append, prepend, capitalize, replace, list, first, last, nth, count, sanitize_title

**Number (3):** number_format, currency_format, round

**Date (3):** date_format, time_diff, to_age

**Control (13):** is_empty, is_not_empty, is_equal_to, is_greater_than, is_less_than, is_between, contains, then, else,
is_checked, is_unchecked, fallback

---

## 🔐 Security & Best Practices

### Never Commit

- `wp-config.php` or `.env` files
- Database dumps with real data
- API keys or secrets
- `node_modules/` or `vendor/` directories

### Code Standards

- **PHP:** WordPress Coding Standards
- **Namespace:** `VoxelFSE\` for child theme code
- **Controllers:** Extend `FSE_Base_Controller`
- **JavaScript:** ESLint with WordPress rules
- **CSS:** BEM naming where applicable

### Autoloader Safety

- Always check if filename/path conflicts with parent
- Use `fse-` prefix for child theme files/directories
- Test after adding new controllers or classes

---

## 📞 Quick Reference

### Important Constants

```php
VOXEL_FSE_PATH           // themes/voxel-fse/
VOXEL_FSE_URL            // Theme URL
VOXEL_FSE_TEMPLATES_PATH // FSE templates path
```

### Useful Commands

```bash
# Check WordPress info
wp core version
wp theme list

# Check git status
git status
git log --oneline -5

# Build blocks
npm run build

# Run tests
./vendor/bin/phpunit
```

### Documentation Links

- **Main README:** `/README.md`
- **Changelog:** `/docs/CHANGELOG.md`
- **Project Log:** `/docs/project-log/README.md`
- **Memory:** `/.mcp-memory/memory.json`

---

## 🎯 Current Session Context

**Architecture:** All-in child theme (no separate plugin)
**Build System:** Vite with HMR
**Controller Pattern:** OOP extending FSE_Base_Controller
**Dynamic Data:** VoxelScript parser with 31+ modifiers
**Documentation:** Fully reorganized with numbered prefixes

**Phase 1 Complete:**

- FSE child theme foundation
- OOP controllers with autoloader conflict fixes
- Dynamic data system (parser + data groups + modifiers)
- Vite build system with HMR
- Documentation reorganization

**Phase 2 Current:**

- Product Types migration
- Admin interface development
- Custom product fields
- E-commerce blocks

**Future Phases:**

- Phase 3: Social features (timeline extended, external DB)
- Phase 4: Headless Next.js frontend on Vercel

---

## 💡 Tips for Claude Code Sessions

1. **⚠️ READ CRITICAL INSTRUCTIONS FIRST** - `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
2. **ALWAYS check memory.json BEFORE implementing** - Contains solved patterns (e.g., React Portal, Blurable Mixin)
3. **Review recent commits** - `git log --oneline -10` for context
4. **Discovery before implementation** - Search Voxel theme, read actual code
5. **1:1 Voxel matching** - Match HTML, CSS classes, JS logic exactly
6. **Follow autoloader rules** - Use `fse-` prefix to avoid parent conflicts
7. **Use Vite for builds** - `npm run dev` for HMR during development
8. **Extend FSE_Base_Controller** - For all new controllers
9. **Evidence-based claims** - Provide file paths and code snippets
10. **Update memory.json** - When making architectural changes
11. **Document everything** - Update relevant docs after major changes

---

**Remember:** This is a child theme extending Voxel. We extend and enhance, never modify the parent theme directly.

**Branch Pattern:** `claude/[task-description]-[session-id]`

**Last Major Update:** November 2025 - Architecture consolidation to all-in child theme
