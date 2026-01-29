# MusicalWheel Phase 1: FSE Theme - AI Agent Implementation Plan

**Version:** 3.9 (Discovery-First - No Voxel Assumptions)  
**Date:** November 9, 2025  
**Timeline:** 3-5 days (AI agent-optimized)  
**Team:** 1 developer + AI agent (Warp/OpenCode/Cursor)

---

## Executive Summary

This document provides a **complete, self-contained implementation plan** for an AI agent to build a monolithic WordPress FSE theme that recreates all Voxel features with modern headless WordPress architecture.

**⚠️ CRITICAL UPDATE v3:** This plan makes **ZERO assumptions** about Voxel theme's internal code structure. Discovery-first methodology ensures AI agent analyzes actual implementation before proceeding.

**Critical Requirements:**
- ✅ **Zero pre-written code** - AI agent analyzes actual Voxel theme codebase
- ✅ **Zero assumptions** - Discover Voxel structure first, then implement
- ✅ **Build native FSE features** - Recreate Voxel functionality, don't wrap Elementor
- ✅ **Complete obfuscation** - No WordPress identifiers visible on frontend
- ✅ **Security hardened** - JWT auth, IP whitelisting, security headers
- ✅ **Production-ready** - Testing, validation, deployment scripts
- ✅ **Modern stack** - Vite + React + Tailwind CSS v4 + Faust.js
- ✅ **Multisite compatible** - Theme must work in WordPress Multisite networks (subdomains, subdirectories, domain mapping). Discover how Voxel handles multisite (if at all), then implement equivalent FSE approach.
- ✅ **Frontend translation system** - WordPress stores content in original language only. Next.js handles ALL translation (UI + content) via i18n + Google Translate API. Add originalLanguage custom field to all CPTs. NO WordPress translation plugins required (no WPML, TranslatePress, or Polylang).
---

## Resources Available to AI Agent

### 1. Voxel Theme Source Code (Primary Reference)
- **Location:** `themes/voxel/` (relative to wp-content root)
- **Absolute path:** `wp-content/themes/voxel/`
- **Contents:** Complete PHP implementation (30+ Elementor widgets, CPTs, fields, social features)
- **Usage:** Analyze actual code, don't guess structure
- **⚠️ WARNING:** Do NOT assume file locations, class names, or methods - DISCOVER first

### 2. Voxel Documentation (200+ Pages)
- **Location:** `docs/voxel-documentation/` (160 markdown files)
- **Absolute path:** `wp-content/docs/voxel-documentation/`
- **Contents:** Feature specifications, user guides, screenshots (base64 embedded)
- **Usage:** Cross-reference with source code for context, read BEFORE analyzing code

### 3. Session Logs & Project Changes
- **Project log location:** `app/public/wp-content/docs/project-log/` — per-task session artifacts and migration notes
- **Example:** `app/public/wp-content/docs/project-log/2025-11-08_task-2.3/` contains the Block System refactor session (block loader refactor, HMR, CORS fix, validation checklist).
- **Changelog:** See `app/public/wp-content/docs/CHANGELOG.md` for a chronological summary of notable changes.

### 3. Kadence Blocks & Kadence Blocks Pro
- **Location:** `plugins/kadence-blocks/` (free version)
- **Location:** `plugins/kadence-blocks-pro/` (pro version)
- **Usage:** Reference for FSE block structure patterns, advanced block features

### 4. Implementation Plan
- **Location:** `docs/AI_AGENT_IMPLEMENTATION_PLAN.md`
- **Usage:** This document - complete implementation guide

### 5. WPGraphQL Stack Plugins
- **Location:** `plugins/wp-graphql/` (core GraphQL API)
- **Location:** `plugins/wp-graphql-content-blocks/` (block data as objects)
- **Location:** `plugins/wp-graphql-jwt-authentication/` (secure auth)
- **Location:** `plugins/wpgraphql-smart-cache/` (performance optimization)
- **Location:** `plugins/faustwp/` (Next.js headless framework)
- **Usage:** Pre-installed during Day 1 Task 1.3, reference for GraphQL schema

### 6. Tech Stack Components
- WordPress 6.9 Beta (FSE with multiple template support)
- WPGraphQL + Content Blocks + Smart Cache
- Vite 5.0 + React 18 + TypeScript
- Tailwind CSS v4 (Rust-powered)
- Faust.js + Next.js 14+
- Vercel (frontend hosting)
- Rocket.net Enterprise (backend)

### 7. UI Component Libraries
- **UntitledUI React Free** (Tier 1 - CLI) - Primary React component library, syncs with Figma
- **shadcn/ui** (Tier 2 - CLI) - Secondary React components, Radix UI primitives
- **Flowbite React** (Tier 3 - npm) - Tertiary React components for niche use cases
- **TailwindUI HTML/CSS** (Complementary) - Styling reference only, not a React library

### 8. **Elementor** - Primary UX reference for control patterns

**Kadence Blocks** - Phase 2 supplementary blocks (Next.js frontend only)

Documentation:
- Elementor widget controls = Primary UX inspiration for MusicalWheel block editor
- Adapt Elementor patterns to Gutenberg light theme (FSE constraint)
- Box model spacing, slider controls, visual button groups, dual states
- Kadence blocks = Phase 2 Next.js fallback only (not Phase 1 reference)
---

## System Architecture

### Backend (WordPress on Rocket.net)

```
musicalwheel-fse/                    # Monolithic FSE Theme
├── app/                    # PHP Backend (Voxel-compatible)
├── assets/                 # Built & Static Assets
│   └── dist/              # ✓ CORRECTED: Build output HERE (not root)
│
├── src/                             # Development Source (Vite + React)
│   ├── blocks/                      # 28+ React Block Components
│   │   ├── timeline/
│   │   │   ├── Edit.tsx             # Editor component
│   │   │   └── index.tsx            # Registration
│   │   └── ... (27+ more blocks)
│   ├── components/                  # Shared React Components (Tailwind)
│   │   ├── Button.tsx
│   │   ├── Avatar.tsx
│   │   └── ...
│   ├── utils/
│   │   ├── classNames.ts
│   │   ├── api.ts
│   │   └── hooks.ts
│   └── styles/
│       └── main.css                 # Tailwind CSS v4 config
│
├── languages/                       # Translations
├── templates/                       # FSE Templates
├── patterns/                        # Block Patterns
├── parts/                           # FSE template parts
│
├── cli/                             # CLI Tools
│   ├── validate-obfuscation.php     # Validates no WP identifiers
│   ├── deploy.sh                    # Deployment script
│   └── test-runner.sh               # Automated testing
│
├── tests/                           # Automated Tests
│   ├── unit/                        # PHPUnit tests
│   ├── integration/                 # API tests
│   └── e2e/                         # Playwright tests
│
├── functions.php                    # Main loader
├── package.json
├── README.md
├── style.css                        # Theme header
├── theme.json                       # FSE configuration
├── tsconfig.json
└──  vite.config.ts                   # Vite + Tailwind + React
```
### Frontend (Next.js on Vercel)

```
musicalwheel-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout + Tailwind
│   │   ├── providers.tsx            # WordPressBlocksProvider
│   │   ├── [slug]/page.tsx          # Dynamic pages (ISR)
│   │   └── api/
│   │       └── revalidate/route.ts  # ISR webhook endpoint
│   ├── blocks/                      # React Components (28+ blocks)
│   │   ├── kadence/
│   │   └── musicalwheel/
│   ├── lib/
│   │   ├── graphql/
│   │   └── faust.config.ts
│   └── components/                  # Shared UI (Tailwind)
│
├── faust.config.js
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## AI Agent Implementation Timeline (3-5 Days)

### **Day 1: Analysis & Setup (8-10 hours)**

#### Task 1.1: Voxel Theme Analysis (DISCOVERY-FIRST)

**Objective:** Discover Voxel theme's actual structure and implementation WITHOUT assumptions.

**⚠️ CRITICAL:** Do NOT assume you know Voxel's code structure. DISCOVER first, then proceed.

**Instructions:**


### PHASE 1: DISCOVER STRUCTURE (No Assumptions)

**Step 1: Map Complete Directory Structure**
```bash
# Create directory tree
find themes/voxel -type d | sort > docs/voxel-analysis/01-directory-tree.txt

# List all PHP files with their paths
find themes/voxel -type f -name "*.php" | sort > docs/voxel-analysis/02-php-files-list.txt

# Count files by directory to understand organization
for dir in $(find themes/voxel -type d); do
    count=$(find "$dir" -maxdepth 1 -name "*.php" | wc -l)
    echo "$dir: $count PHP files"
done > docs/voxel-analysis/03-files-per-directory.txt

# List all file types
find themes/voxel -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn > docs/voxel-analysis/04-file-types.txt

# AI agent: Review these files to understand actual organization
```

**Step 2: Discover Code Organization Patterns**
```bash
# Find all namespaces used
grep -rh "^namespace " themes/voxel/ --include="*.php" | sort -u > docs/voxel-analysis/05-namespaces.txt

# Find all class definitions (discover actual classes)
grep -rh "^class " themes/voxel/ --include="*.php" | sort > docs/voxel-analysis/06-classes-list.txt

# Count classes
cat docs/voxel-analysis/06-classes-list.txt | wc -l
# Output: Total number of classes in Voxel

# Find what Voxel extends/implements
grep -rh -E "extends\|implements" themes/voxel/ --include="*.php" | head -100 > docs/voxel-analysis/07-inheritance.txt

# Find interfaces and traits
grep -rn "^interface\|^trait" themes/voxel/ --include="*.php" > docs/voxel-analysis/08-interfaces-traits.txt

# AI agent: Analyze these to understand Voxel's architecture approach
```

**Step 3: Cross-Reference with Documentation**
```bash
# List all documentation files
ls -lh docs/voxel-documentation/*.md | wc -l
# Output: Confirm 160 markdown files exist

# Create index of documentation
ls -1 docs/voxel-documentation/*.md > docs/voxel-analysis/09-documentation-index.txt

# Search for architecture/structure documentation
grep -l "architecture\|structure\|code.*organization\|developer" docs/voxel-documentation/*.md > docs/voxel-analysis/10-technical-docs.txt

# Search for feature documentation by category
grep -l "widget\|block\|component" docs/voxel-documentation/*.md > docs/voxel-analysis/11-widget-docs.txt
grep -l "post.*type\|CPT\|custom.*type" docs/voxel-documentation/*.md > docs/voxel-analysis/12-cpt-docs.txt
grep -l "field\|meta\|custom.*field" docs/voxel-documentation/*.md > docs/voxel-analysis/13-field-docs.txt

# AI agent: Read relevant docs BEFORE analyzing code
# Create summary: docs/voxel-analysis/14-documentation-summary.md
```

### PHASE 2: DISCOVER CUSTOM POST TYPES (Based on Phase 1 Findings)

**Step 4: Search for CPT Registration (ANY method)**
```bash
# Search broadly - don't assume method
grep -rn "post.*type\|postType\|custom.*type" themes/voxel/ --include="*.php" | grep -i "register\|add\|create" > docs/voxel-analysis/15-cpt-search-results.txt

# Check for WordPress standard method
grep -rn "register_post_type" themes/voxel/ --include="*.php" > docs/voxel-analysis/16-register-post-type-usage.txt

# Check for config arrays/files
find themes/voxel -name "*config*.php" -o -name "*types*.php" -o -name "*post-types*.php" > docs/voxel-analysis/17-config-files.txt

# If config files found, examine them
if [ -s docs/voxel-analysis/17-config-files.txt ]; then
    for file in $(cat docs/voxel-analysis/17-config-files.txt); do
        echo "=== $file ===" >> docs/voxel-analysis/18-config-contents.txt
        cat "$file" >> docs/voxel-analysis/18-config-contents.txt
        echo "" >> docs/voxel-analysis/18-config-contents.txt
    done
fi

# Search for custom CPT frameworks/libraries
grep -rn "Pods\|Carbon\|ACF\|CMB2\|Custom Post Type UI" themes/voxel/ --include="*.php" > docs/voxel-analysis/19-cpt-framework.txt

# AI agent: Analyze ALL results to determine ACTUAL CPT registration method
# Document: docs/voxel-analysis/20-CPT-REGISTRATION-METHOD.md
# Include: Exact files, exact methods, exact parameters, example code
```

**Step 5: Discover CPT Details (Using Actual Method Found)**
```bash
# ONLY AFTER discovering actual registration method in Step 4

# AI agent: Based on Step 4 findings, extract from actual code:
#   - CPT names/slugs (e.g., 'venue', 'artist', 'event')
#   - Labels (singular, plural, menu name, etc.)
#   - Supported features (title, editor, thumbnail, custom-fields, etc.)
#   - Taxonomies attached (categories, tags, custom taxonomies)
#   - Capabilities (if custom capability types defined)
#   - GraphQL exposure settings (show_in_graphql, graphql_single_name, etc.)
#   - REST API settings (show_in_rest, rest_base, etc.)
#   - Menu position and icons
#   - Rewrite rules
#   - Meta boxes configuration

# For EACH CPT discovered:
#   1. Create individual analysis file
#   2. Extract complete registration args
#   3. Document associated meta fields
#   4. Note relationships with other CPTs
#   5. Identify REST/GraphQL endpoints

# Document all findings:
# Output: docs/voxel-analysis/21-custom-post-types-COMPLETE.md
# Format:
#   CPT Name: venue
#   Slug: venue
#   Registration File: themes/voxel/[actual-path]
#   Registration Method: [actual-method-found]
#   Labels: {...}
#   Supports: [...]
#   Taxonomies: [...]
#   etc.
```

### PHASE 3: DISCOVER CUSTOM FIELDS SYSTEM

**Step 6: Search for Field System (ANY implementation)**
```bash
# Search broadly for field-related code
grep -rn "field\|meta.*box\|custom.*field" themes/voxel/ --include="*.php" | wc -l
# Output: Count of field-related code lines

# Find field class definitions (if OOP approach)
grep -rn "class.*Field\|class.*Meta" themes/voxel/ --include="*.php" > docs/voxel-analysis/22-field-classes.txt

# Find meta functions usage
grep -rn "get_post_meta\|update_post_meta\|add_meta_box\|register_meta" themes/voxel/ --include="*.php" | head -100 > docs/voxel-analysis/23-meta-functions.txt

# Check for ACF/CMB2/custom field frameworks
grep -rn "acf\|ACF\|cmb2\|CMB2\|rwmb_meta\|carbon_get\|Carbon" themes/voxel/ --include="*.php" > docs/voxel-analysis/24-field-framework.txt

# Search for field types
grep -rn "text.*field\|textarea\|select\|checkbox\|radio\|date.*picker\|image.*upload\|location" themes/voxel/ --include="*.php" | head -50 > docs/voxel-analysis/25-field-types.txt

# Check for custom database tables (some systems store fields separately)
grep -rn "CREATE TABLE\|dbDelta" themes/voxel/ --include="*.php" | grep -i "field\|meta" > docs/voxel-analysis/26-field-tables.txt

# AI agent: Determine ACTUAL field system used
# Document: docs/voxel-analysis/27-FIELD-SYSTEM-METHOD.md
# Include:
#   - Field framework used (ACF, CMB2, custom, etc.)
#   - Registration method
#   - Storage method (post_meta, custom tables, options, etc.)
#   - Retrieval method
#   - Validation/sanitization approach
```

**Step 7: Discover Field Types (Using Actual System Found)**
```bash
# ONLY AFTER discovering field system in Step 6

# AI agent: Based on Step 6 findings, extract from actual code:
#   - All field types available (text, location, date, repeater, etc.)
#   - Field registration method (actual function/class)
#   - Field rendering method (actual code for frontend/backend)
#   - Field validation/sanitization (actual implementation)
#   - Field storage method (where/how data is stored)
#   - Field dependencies (if fields depend on each other)
#   - Field conditional logic (if fields show/hide based on conditions)

# For EACH field type discovered:
#   1. Document field type name
#   2. Extract registration code
#   3. Document options/settings available
#   4. Note rendering approach (frontend/backend)
#   5. Identify validation rules
#   6. Document storage format

# Document complete field system:
# Output: docs/voxel-analysis/28-custom-fields-COMPLETE.md
# Include: Full list of field types with examples
```

### PHASE 4: DISCOVER ELEMENTOR INTEGRATION

**Step 8: Search for Elementor Widgets (ANY location)**
```bash
# Find Elementor integration (don't assume path)
grep -rn "Elementor\|Widget_Base\|\\Elementor\\" themes/voxel/ --include="*.php" | wc -l
# Output: Count of Elementor references

# Save Elementor integration points
grep -rn "Elementor\|Widget_Base" themes/voxel/ --include="*.php" > docs/voxel-analysis/29-elementor-integration.txt

# Find all files that extend Widget_Base or Elementor classes
grep -rl "extends.*Widget_Base\|extends.*Elementor\|extends \\Elementor" themes/voxel/ --include="*.php" > docs/voxel-analysis/30-widget-files-list.txt

# Count widgets found
cat docs/voxel-analysis/30-widget-files-list.txt | wc -l
# Output: Actual number of widgets (e.g., 28, 30, 35, etc.)

# Group widgets by directory
cat docs/voxel-analysis/30-widget-files-list.txt | xargs -I {} dirname {} | sort | uniq -c > docs/voxel-analysis/31-widget-locations.txt

# AI agent: Review actual widget file paths
# Note: DO NOT assume /app/widgets/ - use ACTUAL paths found
```

**Step 9: Analyze Widget Structure (Using Actual Files Found)**
```bash
# ONLY AFTER discovering widget locations in Step 8

# For EACH widget file found in Step 8:

# Extract widget metadata (don't assume method names)
for widget_file in $(cat docs/voxel-analysis/30-widget-files-list.txt); do
    echo "=== Analyzing: $widget_file ===" >> docs/voxel-analysis/32-widget-analysis.txt

    # Find actual class name
    grep "^class " "$widget_file" >> docs/voxel-analysis/32-widget-analysis.txt

    # Find widget name/slug (could be get_name, getName, or in constructor)
    grep -A 2 "function.*name\|get_name\|getName" "$widget_file" >> docs/voxel-analysis/32-widget-analysis.txt

    # Find widget title
    grep -A 2 "function.*title\|get_title\|getTitle" "$widget_file" >> docs/voxel-analysis/32-widget-analysis.txt

    # Find controls registration (don't assume _register_controls)
    grep -n "function.*control\|register.*control" "$widget_file" >> docs/voxel-analysis/32-widget-analysis.txt

    # Find render method (don't assume render())
    grep -n "function.*render\|function.*output" "$widget_file" >> docs/voxel-analysis/32-widget-analysis.txt

    echo "" >> docs/voxel-analysis/32-widget-analysis.txt
done

# Create structured widget inventory
# AI agent: Parse 32-widget-analysis.txt and create:
# Output: docs/voxel-analysis/33-elementor-widgets-COMPLETE.md
# Format for each widget:
#   Widget #1
#   - File Path: themes/voxel/[actual-path]
#   - Class Name: [actual-class-name]
#   - Widget Slug: [actual-slug]
#   - Widget Title: [actual-title]
#   - Control Method: [actual-method-name-found]
#   - Render Method: [actual-method-name-found]
#   - Dependencies: [CPTs used, fields accessed, etc.]
```

**Step 10: Extract Widget Controls and Logic**
```bash
# For EACH widget documented in Step 9:

# Extract actual control definitions
# AI agent: Open each widget file and extract:
#   1. Complete control registration code
#   2. Control types used (text, select, switcher, etc.)
#   3. Default values
#   4. Conditions (if controls show/hide based on other controls)

# Extract actual render logic
# AI agent: Extract render method contents
#   1. How data is fetched (WP_Query, get_posts, custom queries, etc.)
#   2. Template structure (HTML output)
#   3. Dynamic content (how fields are displayed)
#   4. CSS classes used
#   5. JavaScript dependencies

# Document for FSE conversion:
# Output: docs/voxel-analysis/34-widget-to-block-mapping.md
# For each widget, document:
#   - Elementor controls → Block attributes mapping
#   - Render logic → Server-side render.php mapping
#   - Frontend features → React component requirements
```

### PHASE 5: DISCOVER FEATURES

**Step 11: Search for Social Features (Broad Discovery)**
```bash
# Search for social-related functionality
grep -rn "timeline\|follow\|message\|notification\|friend\|activity\|reaction\|comment\|like\|share" themes/voxel/ --include="*.php" | wc -l
# Output: Count of social feature references

# Find database tables (if custom tables used)
grep -rn "CREATE TABLE\|dbDelta" themes/voxel/ --include="*.php" > docs/voxel-analysis/35-database-schema.txt

# Extract table names if found
grep "CREATE TABLE" docs/voxel-analysis/35-database-schema.txt | sed 's/.*CREATE TABLE\s*\(IF NOT EXISTS\s*\)\?//' | cut -d'(' -f1 > docs/voxel-analysis/36-table-names.txt

# Find REST endpoints
grep -rn "register_rest_route" themes/voxel/ --include="*.php" > docs/voxel-analysis/37-rest-endpoints.txt

# Find AJAX handlers
grep -rn "wp_ajax\|add_action.*ajax" themes/voxel/ --include="*.php" > docs/voxel-analysis/38-ajax-handlers.txt

# Document social features architecture:
# AI agent: Create comprehensive analysis
# Output: docs/voxel-analysis/39-social-features-DISCOVERED.md
# Include:
#   - Timeline system (how posts are aggregated and displayed)
#   - Follow system (database schema, relationships)
#   - Messaging system (storage, notifications)
#   - Notification system (types, delivery method)
#   - Reaction system (likes, favorites, etc.)
```

**Step 12: Search for Marketplace Features (Broad Discovery)**
```bash
# Search for e-commerce/marketplace functionality
grep -rn "product\|order\|booking\|payment\|stripe\|checkout\|cart\|purchase" themes/voxel/ --include="*.php" | wc -l
# Output: Count of marketplace references

# Find payment integration
grep -rn "Stripe\|PayPal\|WooCommerce\|payment.*gateway" themes/voxel/ --include="*.php" > docs/voxel-analysis/40-payment-integration.txt

# Find order/booking system
grep -rn "class.*Order\|class.*Booking\|order.*status\|booking.*status" themes/voxel/ --include="*.php" > docs/voxel-analysis/41-order-booking-system.txt

# Find product system
grep -rn "class.*Product\|product.*type\|add.*product" themes/voxel/ --include="*.php" > docs/voxel-analysis/42-product-system.txt

# Document marketplace architecture:
# AI agent: Create comprehensive analysis
# Output: docs/voxel-analysis/43-marketplace-DISCOVERED.md
# Include:
#   - Product types and structure
#   - Order flow and statuses
#   - Booking system (calendar, availability, etc.)
#   - Payment processing (Stripe integration details)
#   - Commission/fees system (if any)
```

### PHASE 6: COMPREHENSIVE SUMMARY

**Step 13: Create Master Analysis Document**
```bash
# AI agent creates comprehensive summary document

# File: docs/voxel-analysis/00-VOXEL-ARCHITECTURE-SUMMARY.md
# This is the MASTER DOCUMENT - all other docs feed into this
```
**Step 14: Discover Frontend JavaScript Framework**
```bash
# Search for Vue.js usage in templates
grep -rn "vue\|v-model\|v-if\|v-for\|@click\|v-bind" themes/voxel/ --include="*.php" --include="*.js" > docs/voxel-analysis/44-frontend-js-framework.txt

# Count template directives
cat docs/voxel-analysis/44-frontend-js-framework.txt | wc -l
# Output: Number of frontend framework references

# Find Vue.js/React files
find themes/voxel -name "*.vue" -o -name "*vue*.js" -o -name "*react*.js" > docs/voxel-analysis/45-js-framework-files.txt

# AI agent: Document frontend framework usage
# Output: docs/voxel-analysis/46-frontend-framework-DISCOVERED.md
# Include:
#   - Framework identified (Vue.js, React, vanilla JS, jQuery, etc.)
#   - Where used (widget templates, admin, frontend forms, etc.)
#   - Patterns found (directives, components, state management)
#   - Interactivity requirements (forms, real-time updates, etc.)
#   - Conversion strategy notes for FSE implementation
```
**Contents of 00-VOXEL-ARCHITECTURE-SUMMARY.md:**

```markdown
# Voxel Theme Architecture - Complete Analysis

## 1. Directory Structure Overview
[Summarize actual organization found - not assumed]
- Main directories and their purposes
- File organization patterns
- Total files: X PHP files, Y JS files, Z CSS files

## 2. Code Organization
- Namespaces: [list actual namespaces found]
- Base classes: [list actual base classes]
- Design patterns identified: [actual patterns used]
- Autoloading approach: [actual autoloader or require structure]

## 3. Custom Post Types System
- Registration Method: [actual method discovered, e.g., register_post_type, custom framework, etc.]
- Location: [exact files where CPTs are registered]
- CPTs Discovered: [complete list with details]
  - CPT 1: [slug, labels, supports, taxonomies, etc.]
  - CPT 2: ...
  - CPT N: ...

## 4. Custom Fields System
- Field Framework: [ACF, CMB2, custom, etc.]
- Registration Method: [actual code approach]
- Storage Method: [post_meta, custom tables, etc.]
- Field Types Discovered: [complete list]
  - Text, Textarea, Number, Date, Location, Repeater, etc.
- Location: [exact files where fields are defined]

## 5. Elementor Integration
- Total Widgets: [actual count, e.g., 28, 30, 35]
- Widget Locations: [actual paths, not assumed /app/widgets/]
- Widget Structure:
  - Base class: [actual base class extended]
  - Control registration method: [actual method name]
  - Render method: [actual method name]
- Complete Widget List:
  - Widget 1: [name, slug, file path, purpose]
  - Widget 2: ...
  - Widget N: ...

## 6. Social Features
- Timeline System: [how implemented]
- Follow System: [database schema, implementation]
- Messaging System: [storage, real-time or polling]
- Notifications: [types, delivery method]
- Database Tables: [list custom tables if any]
- REST Endpoints: [list all social-related endpoints]

## 7. Marketplace Features
- Product System: [types, structure]
- Order System: [flow, statuses]
- Booking System: [calendar, availability]
- Payment Integration: [Stripe, PayPal, etc.]
- Commission/Fees: [how calculated if applicable]

## 8. Database Schema
- Custom Tables: [list all custom tables created]
- Post Meta Usage: [common meta keys, purposes]
- Options Usage: [theme settings storage]

## 9. REST API / GraphQL
- REST Endpoints: [list all custom endpoints]
- GraphQL Integration: [if any existing GraphQL setup]
- Authentication: [method used for API access]

## 10. Hooks & Filters
- Custom Hooks Defined: [list with purposes]
- WordPress Hooks Used: [most important ones]
- Filter Points: [where Voxel can be extended]

## 11. Dependencies
- Required Plugins: [list plugins Voxel depends on]
- WordPress Version: [minimum version required]
- PHP Version: [minimum PHP version]
- JavaScript Libraries: [list JS dependencies]

## 12. Frontend Assets
- CSS Structure: [how styles are organized]
- JavaScript Structure: [how scripts are organized]
- Build Process: [if any build step exists]

## 13. Frontend JavaScript Framework

- Framework Identified: [Vue.js, React, jQuery, vanilla JS, none, etc.]
- Where Used: [widget templates, admin pages, frontend forms, etc.]
- Version: [if applicable]
- Main Use Cases: [forms, real-time updates, interactive components, etc.]
- Interactivity Patterns: [v-model, event handlers, AJAX calls, etc.]
- Dependencies: [other JS libraries required]

**Conversion Strategy for FSE:**
- All frontend interactivity will be recreated using React
- Focus on functionality and user experience, not framework syntax
- Leverage WordPress React components where possible
- Ensure compatibility with FSE block editor and Faust.js frontend

## 14. Admin Field Interfaces

- Backend Admin: [WordPress meta boxes, custom admin pages, etc.]
- Frontend Forms: [user submission forms, profile editing, etc.]
- Shared Logic: [validation, sanitization, storage methods]
- Form Builder: [if Voxel has custom form builder system]

**Recreation Strategy:**
- Dual interface approach: WordPress admin + React frontend forms
- Shared PHP validation/sanitization
- GraphQL exposure for headless frontend access


## 15. Recreation Strategy for FSE
- CPT Recreation: [approach based on discovery]
- Field Recreation: [approach based on discovery]
- Widget → Block Mapping: [detailed conversion plan]
- Social Features Recreation: [custom PHP + React approach]
- Marketplace Recreation: [custom PHP + Stripe integration]

## 16. Challenges Identified
- [List any complex features that will be difficult to recreate]
- [Note any proprietary/locked features]
- [Identify dependencies that must be maintained]

## 17. Implementation Priority
- Must-Have Features: [critical for MVP]
- Should-Have Features: [important but can be phased]
- Could-Have Features: [nice to have, Phase 2]

## 18. Files Generated During Analysis
- 01-directory-tree.txt
- 02-php-files-list.txt
- ... [list all 40+ analysis files]
- 43-marketplace-DISCOVERED.md
```

**Output Files (Complete Set - 47 files):**
- `docs/voxel-analysis/00-VOXEL-ARCHITECTURE-SUMMARY.md` ⭐ **MASTER DOCUMENT**
- `docs/voxel-analysis/01-directory-tree.txt`
- `docs/voxel-analysis/02-php-files-list.txt`
- `docs/voxel-analysis/03-files-per-directory.txt`
- `docs/voxel-analysis/04-file-types.txt`
- `docs/voxel-analysis/05-namespaces.txt`
- `docs/voxel-analysis/06-classes-list.txt`
- `docs/voxel-analysis/07-inheritance.txt`
- `docs/voxel-analysis/08-interfaces-traits.txt`
- `docs/voxel-analysis/09-documentation-index.txt`
- `docs/voxel-analysis/10-technical-docs.txt`
- `docs/voxel-analysis/11-widget-docs.txt`
- `docs/voxel-analysis/12-cpt-docs.txt`
- `docs/voxel-analysis/13-field-docs.txt`
- `docs/voxel-analysis/14-documentation-summary.md`
- `docs/voxel-analysis/15-cpt-search-results.txt`
- `docs/voxel-analysis/16-register-post-type-usage.txt`
- `docs/voxel-analysis/17-config-files.txt`
- `docs/voxel-analysis/18-config-contents.txt`
- `docs/voxel-analysis/19-cpt-framework.txt`
- `docs/voxel-analysis/20-CPT-REGISTRATION-METHOD.md`
- `docs/voxel-analysis/21-custom-post-types-COMPLETE.md`
- `docs/voxel-analysis/22-field-classes.txt`
- `docs/voxel-analysis/23-meta-functions.txt`
- `docs/voxel-analysis/24-field-framework.txt`
- `docs/voxel-analysis/25-field-types.txt`
- `docs/voxel-analysis/26-field-tables.txt`
- `docs/voxel-analysis/27-FIELD-SYSTEM-METHOD.md`
- `docs/voxel-analysis/28-custom-fields-COMPLETE.md`
- `docs/voxel-analysis/29-elementor-integration.txt`
- `docs/voxel-analysis/30-widget-files-list.txt`
- `docs/voxel-analysis/31-widget-locations.txt`
- `docs/voxel-analysis/32-widget-analysis.txt`
- `docs/voxel-analysis/33-elementor-widgets-COMPLETE.md`
- `docs/voxel-analysis/34-widget-to-block-mapping.md`
- `docs/voxel-analysis/35-database-schema.txt`
- `docs/voxel-analysis/36-table-names.txt`
- `docs/voxel-analysis/37-rest-endpoints.txt`
- `docs/voxel-analysis/38-ajax-handlers.txt`
- `docs/voxel-analysis/39-social-features-DISCOVERED.md`
- `docs/voxel-analysis/40-payment-integration.txt`
- `docs/voxel-analysis/41-order-booking-system.txt`
- `docs/voxel-analysis/42-product-system.txt`
- `docs/voxel-analysis/43-marketplace-DISCOVERED.md`
- `docs/voxel-analysis/44-frontend-js-framework.txt`
- `docs/voxel-analysis/45-js-framework-files.txt`
- `docs/voxel-analysis/46-frontend-framework-DISCOVERED.md`

**Checkpoints:**
- [ ] No assumptions made about Voxel structure
- [ ] All code paths discovered via search (not assumed)
- [ ] Documentation read and cross-referenced
- [ ] 00-VOXEL-ARCHITECTURE-SUMMARY.md completed (MASTER DOCUMENT)
- [ ] All 47 analysis documents created
- [ ] AI agent has complete understanding of Voxel's actual implementation
- [ ] Ready to proceed to Day 1 Task 1.2 (Development Environment Setup)

---


#### Task 1.2: Development Environment Setup

**Objective:** Initialize monolithic FSE theme with Vite + React + Tailwind CSS v4.

**Instructions:**
```bash
cd wp-content/themes
mkdir musicalwheel-fse && cd musicalwheel-fse

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install -D vite@latest @vitejs/plugin-react@latest
npm install -D typescript @types/react @types/react-dom
npm install -D @tailwindcss/vite@latest tailwindcss@latest
npm install -D prettier prettier-plugin-tailwindcss

# Install WordPress types
npm install -D @types/wordpress__blocks @types/wordpress__block-editor @types/wordpress__components

# React (externalized by WordPress)
npm install --save-peer react@^18.2.0 react-dom@^18.2.0

# Create directory structure
mkdir -p src/{blocks,components,utils,styles}
mkdir -p app/{post-types,custom-fields,blocks,graphql,social,marketplace,stripe,security,obfuscation,utils}
mkdir -p templates/parts patterns assets/{images,fonts}
mkdir -p cli tests/{unit,integration,e2e}

# Create configuration files
touch vite.config.ts tsconfig.json .prettierrc
touch src/styles/main.css
touch theme.json style.css functions.php
```

Generate configuration files per v2 plan specifications.

**Checkpoints:**
- [ ] npm run dev starts Vite dev server (localhost:3000)
- [ ] Tailwind CSS compiles (5ms HMR)
- [ ] TypeScript type checking works
- [ ] Theme activates in WordPress (no errors)

---
#### Task 1.2a: UI Component Libraries Installation

**Objective**: Install UI component libraries for FSE block development.

**Component Selection Priority Hierarchy**:

### Tier 1: UntitledUI React Free (Primary - CLI Install)

```bash
# Initialize UntitledUI React Free
npx @untitledui/cli init --nextjs --free-only

# Add all free base components
npx @untitledui/cli add --all --type=base

# Add free application UI components
npx @untitledui/cli add --all --type=application

# Components install to: src/components/ui/
# Examples: button.tsx, card.tsx, input.tsx, avatar.tsx, form.tsx
```

**Why Tier 1 (Primary)**:
- **Perfect sync with UntitledUI Figma designs** - Components match your design system exactly
- **5,000+ production-ready React components** (free subset available)
- **Copy-paste ownership** (not npm dependency) - You own and control the code
- **Tailwind CSS v4.1 compatible** - Same stack as Plan v3.1
- **React Aria accessibility** - WAI-ARIA compliant out of the box
- **Custom CLI tool** - Fast component installation like shadcn/ui

### Tier 2: shadcn/ui (Secondary - CLI Install)

```bash
# Initialize shadcn/ui for missing components
npx shadcn@latest init

# Configure separate directory during setup
# Components install to: src/components/shadcn/

# Install specific components as needed
npx shadcn@latest add command
npx shadcn@latest add context-menu
npx shadcn@latest add toast
npx shadcn@latest add sonner
```

**Why Tier 2 (Secondary)**:
- **Radix UI primitives** - Complex interactions (Command palette, Context menus)
- **Use when UntitledUI free doesn't have the component**
- **Free and MIT licensed** - Copy-paste ownership
- **Well-documented** - Large community, battle-tested
- **Tailwind CSS compatible** - Consistent styling approach

### Tier 3: Flowbite React (Tertiary - npm Install)

```bash
# Install Flowbite React for niche components
npm install flowbite-react

# Add to tailwind.config.ts plugins:
plugins: [
  require('flowbite/plugin')
]
```

**Why Tier 3 (Tertiary)**:
- **Marketing sections** - Mega menus, timelines, testimonials
- **Niche components** - Components not in Tier 1 or 2
- **Traditional npm package** (not copy-paste) - Less control over code
- **Use as last resort** - Only when Tier 1 & 2 don't have it

### Complementary: TailwindUI HTML/CSS (Reference Only - Not a Library)

```bash
# TailwindUI is NOT a React library - it's HTML/CSS reference patterns
# Location: docs/design-system/tailwindui-components/
# Structure:
#   - application-ui/
#     ├── forms/ (form-layouts.html, input-groups.html)
#     ├── navigation/ (navbars.html, tabs.html)
#     ├── overlays/ (modals.html, slide-overs.html)
#     ├── lists/ (stacked-lists.html, grid-lists.html)
#   - marketing/
#     ├── heroes/ (hero-sections.html)
#     ├── features/ (feature-sections.html)
#     ├── testimonials/ (testimonial-sections.html)
#   - ecommerce/
#     ├── products/ (product-lists.html)
#     ├── carts/ (shopping-carts.html)
```

**Example TailwindUI HTML** (from primary_buttons.html):
```html
<button type="button" class="rounded-sm bg-indigo-600 px-2 py-1 text-xs 
  font-semibold text-white shadow-xs hover:bg-indigo-500 
  focus-visible:outline-2 focus-visible:outline-offset-2 
  focus-visible:outline-indigo-600">
  Button text
</button>
```

**How to Use TailwindUI**:
- **NOT a component library** - Just HTML markup with Tailwind classes
- **Use as styling reference** - Copy Tailwind classes to your React components
- **Official Tailwind Labs patterns** - Production-quality styling
- **Use ONLY when you already have the component structure**:
  - Have: UntitledUI React `<Button>` component
  - Need: Better styling for specific use case
  - Action: Copy TailwindUI button classes to UntitledUI Button

**When to Use TailwindUI**:
```typescript
// ✅ CORRECT: Use TailwindUI classes with existing React components
import { Button } from '@/components/ui/button'; // UntitledUI React

// Copy TailwindUI classes from primary_buttons.html
<Button className="rounded-sm bg-indigo-600 px-2 py-1 text-xs font-semibold 
  text-white shadow-xs hover:bg-indigo-500">
  Submit
</Button>

// ❌ WRONG: Don't use raw TailwindUI HTML in React
<button type="button" class="rounded-sm...">Submit</button> // Not React syntax
```

---

**AI Agent Component Selection Workflow**:

```markdown
For EACH FSE block, AI agent follows this decision tree:

STEP 1: Check UntitledUI React Free (Tier 1)
├─ Run: npx @untitledui/cli add [component-name]
├─ Component appears in src/components/ui/[component-name].tsx
├─ Import: import { Button } from '@/components/ui/button'
├─ If exists → USE DIRECTLY (Primary choice)
└─ If not exists → Proceed to STEP 2

STEP 2: Check shadcn/ui (Tier 2)
├─ Run: npx shadcn@latest add [component-name]
├─ Component appears in src/components/shadcn/[component-name].tsx
├─ Import: import { Command } from '@/components/shadcn/command'
├─ If exists → USE DIRECTLY (Secondary choice)
└─ If not exists → Proceed to STEP 3

STEP 3: Check Flowbite React (Tier 3)
├─ Import: import { Timeline, Megamenu } from 'flowbite-react'
├─ If exists → USE DIRECTLY (Tertiary choice)
└─ If not exists → Proceed to STEP 4

STEP 4: Build Custom Component
├─ Use UntitledUI React primitives as base structure
├─ OPTIONALLY reference TailwindUI HTML for styling inspiration
│   └─ Copy Tailwind classes from docs/design-system/tailwindui-components/
└─ Create in: src/components/custom/[component-name].tsx

COMPLEMENTARY: Use TailwindUI HTML/CSS Reference
├─ ONLY use after you have React component structure (from Tier 1, 2, 3, or 4)
├─ Browse: docs/design-system/tailwindui-components/
├─ Find matching HTML pattern for your use case
├─ Extract: Copy Tailwind CSS classes (not full HTML)
├─ Apply: Add classes to existing React component
└─ Example: TailwindUI button classes → UntitledUI Button component
```

---

**Project Structure After Installation**:

```
musicalwheel-fse/
├── src/
│   ├── components/
│   │   ├── ui/                    # ← UntitledUI React (Tier 1 - via CLI)
│   │   │   ├── button.tsx         # React component with TypeScript
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── form.tsx
│   │   │   └── ... (100+ free React components)
│   │   ├── shadcn/                # ← shadcn/ui (Tier 2 - via CLI)
│   │   │   ├── command.tsx        # React component with TypeScript
│   │   │   ├── context-menu.tsx
│   │   │   └── toast.tsx
│   │   └── custom/                # ← Custom MusicalWheel components (Tier 4)
│   │       ├── timeline-block.tsx # Built with UntitledUI primitives
│   │       ├── quick-search.tsx   # + TailwindUI styling reference
│   ├── blocks/                    # ← WordPress FSE blocks
│   │   ├── venue-card/
│   │   │   ├── block.json
│   │   │   ├── Edit.tsx           # Uses components from ui/ or shadcn/
│   │   │   ├── render.php
├── docs/
│   ├── design-system/
│   │   ├── tailwindui-components/ # ← TailwindUI HTML/CSS (Reference only)
│   │   │   ├── application-ui/    # HTML files with Tailwind classes
│   │   │   │   ├── forms/
│   │   │   │   │   ├── form-layouts.html
│   │   │   │   │   ├── primary_buttons.html    # Your example
│   │   │   │   ├── navigation/
│   │   │   │   ├── overlays/
│   │   │   ├── marketing/
│   │   │   ├── ecommerce/
│   │   │   └── README.md          # Index of patterns
├── node_modules/
│   └── flowbite-react/            # ← Flowbite (Tier 3 - traditional npm)
```

---

**Real-World Example Workflow**:

```typescript
// SCENARIO: Building a venue registration form block

// STEP 1: Check UntitledUI React Free (Tier 1)
import { Button, Input, Form, Card } from '@/components/ui'; // ✅ Found

// STEP 2: Need a Command palette for quick search
import { Command } from '@/components/shadcn/command'; // ✅ Found (Tier 2)

// STEP 3: Build custom FSE block combining both
export function VenueRegistrationBlock() {
  return (
    <Card>
      <Form>
        <Input label="Venue Name" />
        <Input label="Address" />

        {/* Custom styling from TailwindUI reference */}
        <Button className="rounded-sm bg-indigo-600 px-2 py-1 text-xs 
          font-semibold text-white shadow-xs hover:bg-indigo-500">
          Submit
        </Button>
      </Form>

      {/* Command palette from shadcn/ui */}
      <Command>
        <Command.Input placeholder="Quick search..." />
      </Command>
    </Card>
  );
}

// TailwindUI was referenced ONLY for button styling classes
// All component structure came from UntitledUI (Tier 1) and shadcn/ui (Tier 2)
```

---

**Upgrade Path (Post-AWS Funding)**:

```bash
# When UntitledUI Pro is purchased ($349)
npx @untitledui/cli login
npx @untitledui/cli add [pro-component-name]

# AI agent automatically replaces free alternatives with PRO components
# Example: Custom Stats component → UntitledUI Metrics (PRO)
```

---

**Checkpoints**:
- [ ] UntitledUI React free components installed in `src/components/ui/` (Tier 1)
- [ ] shadcn/ui initialized and ready for selective installs in `src/components/shadcn/` (Tier 2)
- [ ] Flowbite React installed via npm (Tier 3)
- [ ] TailwindUI HTML reference organized in `docs/design-system/tailwindui-components/` (Complementary)
- [ ] AI agent understands component priority: Tier 1 → Tier 2 → Tier 3 → Custom
- [ ] AI agent understands TailwindUI is CSS reference ONLY (not a React library)
- [ ] All component libraries compatible with Tailwind CSS v4.1
- [ ] Component inventory documented for AI reference

---

**Time Estimate**: 45-60 minutes

**Dependencies**: Node.js 18+, npm/pnpm, Tailwind CSS v4.1 configured

**Next Step**: Proceed to Day 1 Task 1.3 (Install Headless WordPress Plugins)


---

#### Task 1.3: Install Headless WordPress Plugins

**Note**: UI component libraries (UntitledUI, shadcn/ui, Flowbite) were installed in Task 1.2a above.
TailwindUI HTML reference is in docs/design-system/ for styling patterns.


**Objective:** Install WPGraphQL stack to accelerate GraphQL development.

**Instructions:**
```bash
# Navigate to wp-content directory
cd ../..

# Method 1: Composer (recommended for version control)
composer require wp-graphql/wp-graphql
composer require wp-graphql/wp-graphql-content-blocks
composer require wp-graphql/wp-graphql-jwt-authentication
composer require wpengine/faustwp

# Method 2: WP-CLI (alternative)
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-content-blocks --activate
wp plugin install wp-graphql-jwt-authentication --activate
wp plugin install faustwp --activate

# Configure JWT secret
wp config set GRAPHQL_JWT_AUTH_SECRET_KEY "$(openssl rand -base64 32)" --type=constant

# Enable WPGraphQL Smart Cache (if available)
wp plugin install wpgraphql-smart-cache --activate || echo "⚠️ Smart Cache not available, will install manually"
```

**Why These Plugins:**
- **WPGraphQL** - Core GraphQL API (saves 10+ hours of development time)
- **WPGraphQL Content Blocks** - Exposes block data as structured objects (not HTML)
- **FaustWP** - Next.js integration, ISR, authentication, seed queries
- **JWT Authentication** - Secure API access with token-based auth

**Verify Installation:**
```bash
# Test GraphQL endpoint
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ generalSettings { title } }"}'

# Expected output:
# {"data":{"generalSettings":{"title":"MusicalWheel"}}}
```

**Generate Configuration Files:**

1. **vite.config.ts** - Vite + React + Tailwind CSS v4 + HMR
2. **tsconfig.json** - TypeScript configuration
3. **tailwind.config.ts** - Tailwind CSS v4 (optional, CSS-first preferred)
4. **.prettierrc** - Prettier + Tailwind plugin
5. **package.json** - Scripts (dev, build, watch, type-check)
6. **theme.json** - FSE configuration
7. **style.css** - Theme header
8. **functions.php** - Main theme loader

**Reference:** Modern WordPress theme structure + Vite HMR setup

**Checkpoints:**
- [ ] `npm run dev` starts Vite dev server (localhost:3000)
- [ ] Tailwind CSS compiles (5ms HMR)
- [ ] TypeScript type checking works
- [ ] Theme activates in WordPress (no errors)
- [ ] Plugins installed and activated
- [ ] GraphQL endpoint accessible: `/graphql`
- [ ] Test query returns data

---

### **Day 2: Core Implementation (10-12 hours)**

#### Task 2.1: Custom Post Types

**Objective:** Recreate all Voxel CPTs based on Day 1 discovery.

**Instructions:**
```bash
# CRITICAL: Reference Day 1 analysis (no assumptions)
cat docs/voxel-analysis/20-CPT-REGISTRATION-METHOD.md
cat docs/voxel-analysis/21-custom-post-types-COMPLETE.md

# For EACH CPT listed in analysis document:
#   1. Read actual registration parameters discovered
#   2. Create file: app/post-types/{slug}.php
#   3. Use ACTUAL data from analysis (labels, supports, taxonomies, etc.)
#   4. Add GraphQL support (show_in_graphql: true)
#   5. Register using WordPress standards

# Do NOT assume CPT structure - use discovered data
```

**Output:** `app/post-types/*.php` (based on actual CPTs found)

**Checkpoints:**
- [ ] All CPTs from Day 1 analysis recreated
- [ ] GraphQL exposure configured
- [ ] Taxonomies registered

---

#### Task 2.2: Custom Fields System

**Objective:** Recreate Voxel field system based on Day 1 discovery.

**⚠️ IMPORTANT - Dual Interface Requirement:**

Custom fields require **TWO interfaces**:
1. **Backend Admin Interface** - WordPress admin meta boxes for administrators
2. **Frontend Submission Forms** - User-facing forms for content submission

Both interfaces must use the same field definitions and validation logic.

**⚠️ IMPORTANT - Frontend Technology Decision:**

Voxel may use Vue.js, jQuery, or other JavaScript frameworks for frontend interactivity. **MusicalWheel uses React exclusively** for all interactive components.

**Why React:**
- WordPress FSE blocks require React (`@wordpress/element`)
- Faust.js/Next.js frontend requires React
- Single framework = smaller bundle, easier maintenance
- Consistent codebase across block editor and headless frontend

**Implementation Note:** AI agent should analyze Voxel's frontend framework usage (discovered in Day 1 Step 14) and determine the best approach to recreate functionality using React. Focus on understanding the **data flow and user interactions**, not replicating the specific framework implementation.

**Instructions:**
```bash
# CRITICAL: Reference Day 1 analysis
cat docs/voxel-analysis/27-FIELD-SYSTEM-METHOD.md
cat docs/voxel-analysis/28-custom-fields-COMPLETE.md
cat docs/voxel-analysis/46-frontend-framework-DISCOVERED.md

# Implement based on ACTUAL field system discovered
# For EACH field type, create:
#   1. Field definition class (shared logic)
#   2. Backend admin interface (WordPress meta boxes)
#   3. Frontend submission forms (React components)
#   4. Validation/sanitization (shared between both interfaces)
#   5. GraphQL resolver (for headless frontend)

# Directory structure example:
# app/custom-fields/
#   ├── class-field-base.php           # Base field class
#   ├── types/
#   │   ├── class-text-field.php       # Field type definitions
#   │   ├── class-location-field.php
#   │   └── ...
#   ├── admin/
#   │   └── class-meta-boxes.php       # Backend admin interface
#   └── frontend/
#       └── class-submission-forms.php  # Frontend form handlers (outputs React)

# If Voxel uses Vue.js, jQuery, or other frameworks:
# AI agent should understand the interaction patterns and recreate using React
# Example conversions:
#   - Vue.js v-model → React useState + onChange
#   - Vue.js v-if → React conditional rendering
#   - Vue.js v-for → React .map()
#   - jQuery event handlers → React event props
```

**Output:** 

- `app/custom-fields/*.php` (based on actual field types found)
- `app/custom-fields/types/*.php` (field type definitions)
- `app/custom-fields/admin/*.php` (backend admin interface)
- `app/custom-fields/frontend/*.php` (frontend form handlers)
- React components in `src/components/forms/` (if needed for complex interactions)


**Checkpoints:**

- [ ] All field types have backend admin interface (WordPress meta boxes)
- [ ] All field types have frontend submission forms
- [ ] Both interfaces use same validation/sanitization logic
- [ ] Frontend uses React (not Vue.js, jQuery, or other frameworks)
- [ ] GraphQL resolvers expose field data for headless frontend
---

## Task 2.2b: Voxel 6 Addons - Theme Integration Discovery ⭐ NEW

**Duration**: 4-5 hours
**Objective**: Discover how Voxel hardcodes these 6 addon features within the theme (NOT as separate plugins)
**Critical**: Discovery-first approach - NO assumptions about implementation

---

### ADDON DISCOVERY CHECKLIST

Voxel includes 6 hardcoded addons:
1. ✅ **Paid Members** - Subscription-based membership plans
2. ✅ **Paid Listings** - One-time or recurring listing submission fees
3. ✅ **Direct Messages** - User-to-user or user-to-post messaging
4. ✅ **Collections** - Save/bookmark posts into personalized collections
5. ✅ **Product Type** - E-commerce for digital and physical products
6. ✅ **Timeline** - Social activity feed powering community engagement

---

### Step 1: Locate Voxel Addons in Theme Structure

**Objective**: Find where Voxel stores addon code within the theme directory.

**Discovery Commands**:
```bash
# Navigate to Voxel theme
cd "$VOXEL_THEME"

# STEP 1.1: BROAD SEARCH - Find addon-related directories and files
echo "Step 1: Discovering addon structure..."

# Find addon-related directories
find . -type d \( -name "*addon*" -o -name "*member*" -o -name "*message*" -o -name "*collection*" -o -name "*product*" -o -name "*timeline*" \) 2>/dev/null | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/52-addon-directories.txt"

# Find addon-related PHP files by class name
find . -type f -name "*.php" | xargs grep -l "class.*Member\|class.*Message\|class.*Collection\|class.*Paid\|class.*Product\|class.*Timeline" 2>/dev/null | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/52-addon-class-files.txt"

# Find addon initialization patterns
grep -rn "addon\|add-on\|module" . --include="*.php" | grep -i "init\|load\|register" | head -200 > "$ANALYSIS_DIR/52-addon-init.txt"

# Check for addon configuration files
find . -type f \( -name "config.php" -o -name "addons.php" -o -name "features.php" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/52-addon-config-files.txt"

# Display summary
echo "Addon directories found: $(cat "$ANALYSIS_DIR/52-addon-directories.txt" | wc -l)"
echo "Addon class files found: $(cat "$ANALYSIS_DIR/52-addon-class-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/52-addon-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/52-addon-structure-discovery.txt" << 'EOF'
# Voxel Addons - Theme Structure Discovery
# Date: [EXECUTION_DATE]
# Purpose: Understand where Voxel stores addon code within theme

## Discovery Commands Executed
[PASTE commands from Step 1]

## Findings

### Addon Directory Structure
[DOCUMENT discovered addon directories - ACTUAL PATHS ONLY]

### Addon Class Files Discovered
[LIST all PHP files containing addon classes - ACTUAL FILES ONLY]

### Addon Initialization Pattern
[DOCUMENT how Voxel loads/initializes addons - BASED ON GREP RESULTS]

### Addon Configuration Files
[DOCUMENT any config files that control addon features - ACTUAL FILES ONLY]

## Key Questions Answered
1. Are addons in a dedicated /addons/ folder or mixed with theme code? [ANSWER]
2. Does Voxel use a class-per-addon pattern or mixed architecture? [ANSWER]
3. How does Voxel enable/disable addon features? [ANSWER]
4. Are addons autoloaded or manually registered? [ANSWER]

## Next Steps
- Proceed to Step 2 (Paid Members discovery)
- Use discovered structure patterns for analysis

EOF

echo "✓ Created $ANALYSIS_DIR/52-addon-structure-discovery.txt"
```

**Validation**:
- [ ] All find/grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/52-addon-*.txt` files
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented addon directory structure and initialization pattern

---

### Step 2: Paid Members - Theme Implementation Discovery

**Objective**: Discover how Voxel implements membership subscriptions WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 2.1: BROAD SEARCH - Find EVERYTHING related to membership/subscription
echo "Step 2: Discovering Paid Members implementation..."

find . -type f \( -name "*member*" -o -name "*subscription*" -o -name "*plan*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/53-paid-members-files.txt"

grep -rn "\bmember\b\|membership\|subscription" . --include="*.php" | head -500 > "$ANALYSIS_DIR/53-paid-members-references.txt"

# STEP 2.2: CHECK MULTIPLE POSSIBLE PATTERNS

# Pattern A: Is it a Custom Post Type?
grep -rn "register_post_type.*member\|register_post_type.*plan\|register_post_type.*subscription" . --include="*.php" > "$ANALYSIS_DIR/53-paid-members-cpt-check.txt"

# Pattern B: Is it stored in User Meta?
grep -rn "user_meta.*member\|update_user_meta.*membership\|get_user_meta.*subscription" . --include="*.php" > "$ANALYSIS_DIR/53-paid-members-usermeta-check.txt"

# Pattern C: Is it a Custom Database Table?
grep -rn "CREATE TABLE.*member\|CREATE TABLE.*subscription\|\$wpdb.*member.*plan" . --include="*.php" > "$ANALYSIS_DIR/53-paid-members-dbtable-check.txt"

# Pattern D: Stripe Integration
grep -rn "Stripe\|stripe_api\|stripe.*webhook\|subscription.*create\|recurring.*payment" . --include="*.php" > "$ANALYSIS_DIR/53-paid-members-stripe.txt"

# Pattern E: Capability/Permission System
grep -rn "can_submit\|user.*plan\|member.*capability\|subscription.*status\|plan.*active" . --include="*.php" | head -100 > "$ANALYSIS_DIR/53-paid-members-capabilities.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/53-paid-members-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/53-paid-members-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/53-paid-members-discovery.txt" << 'EOF'
# Voxel Paid Members - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS - Document actual findings only

## Discovery Approach
We searched using MULTIPLE patterns because we DON'T KNOW how Voxel implements this.
Possibilities: CPT, User Meta, Custom Table, Hybrid, Other

## Pattern Analysis Results

### Pattern A: Custom Post Type Check
[Review 53-paid-members-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern B: User Meta Check
[Review 53-paid-members-usermeta-check.txt]
Result: [✅ USES USER META / ❌ DOES NOT USE USER META]

### Pattern C: Custom Table Check
[Review 53-paid-members-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]

### Pattern D: Stripe Integration
[Review 53-paid-members-stripe.txt]
- Payment Gateway: [STRIPE / OTHER / CUSTOM]
- Webhook Handler: [DISCOVERED_FILE/FUNCTION]
- API Key Storage: [DISCOVERED_METHOD]

### Pattern E: Capability System
[Review 53-paid-members-capabilities.txt]
- Permission Check Functions: [DISCOVERED_FUNCTIONS]
- User Meta Keys: [DISCOVERED_META_KEYS]

## ACTUAL Implementation Discovered
- Storage Method: [DOCUMENT ACTUAL - CPT/User Meta/Custom Table/Hybrid/Other]
- Data Structure: [DESCRIBE BASED ON ACTUAL CODE FOUND]
- File Locations: [LIST ACTUAL FILE PATHS]
- Integration Points: [DOCUMENT ACTUAL HOOKS/FILTERS]

EOF

echo "✓ Created $ANALYSIS_DIR/53-paid-members-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/53-paid-members-*.txt` files (5+ files)
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented actual storage method and integration patterns

---

### Step 3: Paid Listings - Theme Implementation Discovery

**Objective**: Discover how Voxel implements listing submission fees WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 3.1: BROAD SEARCH
echo "Step 3: Discovering Paid Listings implementation..."

find . -type f \( -name "*listing*" -o -name "*submission*" -o -name "*fee*" -o -name "*plan*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/54-paid-listings-files.txt"

grep -rn "\blisting\b.*\bplan\b\|submission.*fee\|post.*plan" . --include="*.php" | head -500 > "$ANALYSIS_DIR/54-paid-listings-references.txt"

# STEP 3.2: CHECK MULTIPLE PATTERNS

# Pattern A: CPT check
grep -rn "register_post_type.*listing.*plan\|register_post_type.*post.*plan" . --include="*.php" > "$ANALYSIS_DIR/54-paid-listings-cpt-check.txt"

# Pattern B: Post Meta check
grep -rn "post_meta.*listing.*plan\|update_post_meta.*submission\|post_meta.*plan" . --include="*.php" > "$ANALYSIS_DIR/54-paid-listings-postmeta-check.txt"

# Pattern C: Custom Table check
grep -rn "CREATE TABLE.*listing.*plan\|\$wpdb.*listing.*fee\|CREATE TABLE.*submission" . --include="*.php" > "$ANALYSIS_DIR/54-paid-listings-dbtable-check.txt"

# Pattern D: Payment integration
grep -rn "payment.*listing\|charge.*submission\|price.*plan\|listing.*fee" . --include="*.php" | head -100 > "$ANALYSIS_DIR/54-paid-listings-payment.txt"

# Pattern E: Submission workflow
grep -rn "submit.*listing\|submission.*workflow\|post.*submission\|listing.*approval" . --include="*.php" | head -100 > "$ANALYSIS_DIR/54-paid-listings-workflow.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/54-paid-listings-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/54-paid-listings-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/54-paid-listings-discovery.txt" << 'EOF'
# Voxel Paid Listings - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS

## Discovery Approach
Paid Listings could be: CPT, Post Meta, Custom Table, Combination, Other

## Pattern Analysis Results

### Pattern A: CPT Check
[Review 54-paid-listings-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern B: Post Meta Check
[Review 54-paid-listings-postmeta-check.txt]
Result: [✅ USES POST META / ❌ DOES NOT USE POST META]

### Pattern C: Custom Table Check
[Review 54-paid-listings-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]

### Pattern D: Payment Integration
[Review 54-paid-listings-payment.txt]
- Payment Type: [ONE_TIME / RECURRING / BOTH]
- Payment Handler: [DISCOVERED_FILE/FUNCTION]

### Pattern E: Submission Workflow
[Review 54-paid-listings-workflow.txt]
- Entry Point: [DISCOVERED_FILE/FUNCTION]
- Status States: [DISCOVERED_STATES]

## ACTUAL Implementation Discovered
- Storage Method: [DOCUMENT ACTUAL]
- Data Structure: [DESCRIBE ACTUAL]
- File Locations: [LIST ACTUAL PATHS]

EOF

echo "✓ Created $ANALYSIS_DIR/54-paid-listings-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/54-paid-listings-*.txt` files (5+ files)
- [ ] Discovery document created with ACTUAL findings

---

### Step 4: Direct Messages - Theme Implementation Discovery

**Objective**: Discover how Voxel implements user messaging WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 4.1: BROAD SEARCH
echo "Step 4: Discovering Direct Messages implementation..."

find . -type f \( -name "*message*" -o -name "*conversation*" -o -name "*chat*" -o -name "*dm*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/55-direct-messages-files.txt"

grep -rn "\bmessage\b\|conversation\|direct.*message\|chat" . --include="*.php" | head -500 > "$ANALYSIS_DIR/55-direct-messages-references.txt"

# STEP 4.2: CHECK MULTIPLE PATTERNS

# Pattern A: CPT check
grep -rn "register_post_type.*message\|register_post_type.*conversation\|register_post_type.*chat" . --include="*.php" > "$ANALYSIS_DIR/55-direct-messages-cpt-check.txt"

# Pattern B: Custom Table check (MOST LIKELY for messaging)
grep -rn "CREATE TABLE.*message\|CREATE TABLE.*conversation\|\$wpdb.*messages\|\$wpdb.*conversations" . --include="*.php" > "$ANALYSIS_DIR/55-direct-messages-dbtable-check.txt"

# Pattern C: Post Meta check
grep -rn "post_meta.*message\|comment_meta.*message" . --include="*.php" > "$ANALYSIS_DIR/55-direct-messages-postmeta-check.txt"

# Pattern D: User Meta check
grep -rn "user_meta.*message\|user_meta.*conversation" . --include="*.php" > "$ANALYSIS_DIR/55-direct-messages-usermeta-check.txt"

# Pattern E: Real-time features
grep -rn "websocket\|pusher\|firebase\|realtime\|socket" . --include="*.php" > "$ANALYSIS_DIR/55-direct-messages-realtime.txt"

# Pattern F: Message CRUD operations
grep -rn "send.*message\|receive.*message\|create.*conversation\|get.*messages\|delete.*message" . --include="*.php" | head -100 > "$ANALYSIS_DIR/55-direct-messages-crud.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/55-direct-messages-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/55-direct-messages-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/55-direct-messages-discovery.txt" << 'EOF'
# Voxel Direct Messages - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS

## Discovery Approach
Direct Messages could be: Custom Table, CPT, Comment System, User Meta, External Service

## Pattern Analysis Results

### Pattern A: CPT Check
[Review 55-direct-messages-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern B: Custom Table Check (Most Likely)
[Review 55-direct-messages-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]
- Table Names: [DISCOVERED_TABLES]
- Schema: [DISCOVERED_SCHEMA]

### Pattern C: Post Meta Check
Result: [✅ USES POST META / ❌ DOES NOT USE POST META]

### Pattern D: User Meta Check
Result: [✅ USES USER META / ❌ DOES NOT USE USER META]

### Pattern E: Real-time Support
[Review 55-direct-messages-realtime.txt]
Result: [YES/NO - METHOD IF YES]

### Pattern F: CRUD Operations
[Review 55-direct-messages-crud.txt]
- Send Message: [DISCOVERED_FUNCTION]
- Get Messages: [DISCOVERED_FUNCTION]
- Delete Message: [DISCOVERED_FUNCTION]

## ACTUAL Implementation Discovered
- Storage Method: [DOCUMENT ACTUAL]
- Database Architecture: [DESCRIBE ACTUAL]
- File Locations: [LIST ACTUAL PATHS]

EOF

echo "✓ Created $ANALYSIS_DIR/55-direct-messages-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/55-direct-messages-*.txt` files (6+ files)
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented database schema and message handling

---

### Step 5: Collections - Theme Implementation Discovery

**Objective**: Discover how Voxel implements bookmarks/favorites WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 5.1: BROAD SEARCH
echo "Step 5: Discovering Collections implementation..."

find . -type f \( -name "*collection*" -o -name "*bookmark*" -o -name "*favorite*" -o -name "*saved*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/56-collections-files.txt"

grep -rn "\bcollection\b\|bookmark\|favorite\|save.*post\|saved.*item" . --include="*.php" | head -500 > "$ANALYSIS_DIR/56-collections-references.txt"

# STEP 5.2: CHECK MULTIPLE POSSIBLE PATTERNS

# Pattern A: CPT check
grep -rn "register_post_type.*collection" . --include="*.php" > "$ANALYSIS_DIR/56-collections-cpt-check.txt"

# Pattern B: Taxonomy check
grep -rn "register_taxonomy.*collection\|register_taxonomy.*bookmark" . --include="*.php" > "$ANALYSIS_DIR/56-collections-taxonomy-check.txt"

# Pattern C: User Meta check (MOST LIKELY for bookmarks)
grep -rn "user_meta.*collection\|update_user_meta.*bookmark\|get_user_meta.*favorite\|user_meta.*saved" . --include="*.php" > "$ANALYSIS_DIR/56-collections-usermeta-check.txt"

# Pattern D: Post Meta check
grep -rn "post_meta.*collection\|post_meta.*bookmark\|post_meta.*favorite" . --include="*.php" > "$ANALYSIS_DIR/56-collections-postmeta-check.txt"

# Pattern E: Custom Table check
grep -rn "CREATE TABLE.*collection\|\$wpdb.*collection\|CREATE TABLE.*bookmark" . --include="*.php" > "$ANALYSIS_DIR/56-collections-dbtable-check.txt"

# Pattern F: Options check
grep -rn "option.*collection\|update_option.*bookmark\|get_option.*favorite" . --include="*.php" > "$ANALYSIS_DIR/56-collections-options-check.txt"

# Pattern G: Collection operations
grep -rn "add.*collection\|save.*post\|bookmark\|remove.*collection\|create.*collection" . --include="*.php" | head -100 > "$ANALYSIS_DIR/56-collections-operations.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/56-collections-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/56-collections-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/56-collections-discovery.txt" << 'EOF'
# Voxel Collections - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS

## Discovery Approach
Collections/Bookmarks could be: User Meta (most common), CPT, Taxonomy, Post Meta, Custom Table, Options, Hybrid

## Pattern Analysis Results

### Pattern A: CPT Check
[Review 56-collections-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern B: Taxonomy Check
[Review 56-collections-taxonomy-check.txt]
Result: [✅ USES TAXONOMY / ❌ DOES NOT USE TAXONOMY]

### Pattern C: User Meta Check (Most Likely)
[Review 56-collections-usermeta-check.txt]
Result: [✅ USES USER META / ❌ DOES NOT USE USER META]
Expected: Array of post IDs saved per user

### Pattern D: Post Meta Check
[Review 56-collections-postmeta-check.txt]
Result: [✅ USES POST META / ❌ DOES NOT USE POST META]

### Pattern E: Custom Table Check
[Review 56-collections-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]

### Pattern F: Options Check
[Review 56-collections-options-check.txt]
Result: [✅ USES OPTIONS / ❌ DOES NOT USE OPTIONS]

### Pattern G: Collection Operations
[Review 56-collections-operations.txt]
- Create Collection: [DISCOVERED_FUNCTION]
- Add Item: [DISCOVERED_FUNCTION]
- Remove Item: [DISCOVERED_FUNCTION]

## ACTUAL Implementation Discovered
- Storage Method: [DOCUMENT ACTUAL]
- Data Structure: [DESCRIBE ACTUAL]
- File Locations: [LIST ACTUAL PATHS]
- User Experience: [Multiple collections? Named? Public/Private?]

EOF

echo "✓ Created $ANALYSIS_DIR/56-collections-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/56-collections-*.txt` files (7+ files)
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented storage method and collection operations

---

### Step 6: Product Type - Theme Implementation Discovery

**Objective**: Discover how Voxel implements e-commerce product features WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 6.1: BROAD SEARCH
echo "Step 6: Discovering Product Type implementation..."

find . -type f \( -name "*product*" -o -name "*shop*" -o -name "*commerce*" -o -name "*store*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/57-product-type-files.txt"

grep -rn "\bproduct\b\|e.*commerce\|shop.*item\|digital.*download\|physical.*product" . --include="*.php" | head -500 > "$ANALYSIS_DIR/57-product-type-references.txt"

# STEP 6.2: CHECK MULTIPLE PATTERNS

# Pattern A: CPT check
grep -rn "register_post_type.*product" . --include="*.php" > "$ANALYSIS_DIR/57-product-type-cpt-check.txt"

# Pattern B: WooCommerce integration check
grep -rn "woocommerce\|WC_\|wc_\|class.*WC_Product" . --include="*.php" | head -100 > "$ANALYSIS_DIR/57-product-type-woo-check.txt"

# Pattern C: Custom table check
grep -rn "CREATE TABLE.*product\|\$wpdb.*product" . --include="*.php" > "$ANALYSIS_DIR/57-product-type-dbtable-check.txt"

# Pattern D: Easy Digital Downloads check
grep -rn "EDD\|Easy.*Digital\|edd_" . --include="*.php" > "$ANALYSIS_DIR/57-product-type-edd-check.txt"

# Pattern E: Custom commerce system
grep -rn "add.*cart\|checkout\|payment.*gateway\|order.*process\|product.*price" . --include="*.php" | head -100 > "$ANALYSIS_DIR/57-product-type-commerce.txt"

# Pattern F: Product types (digital/physical)
grep -rn "digital.*product\|physical.*product\|downloadable\|shipping\|inventory" . --include="*.php" | head -100 > "$ANALYSIS_DIR/57-product-type-types.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/57-product-type-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/57-product-type-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/57-product-type-discovery.txt" << 'EOF'
# Voxel Product Type - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS

## Discovery Approach
Product Type could be: WooCommerce integration, EDD integration, Custom CPT, Custom commerce system, Hybrid

## Pattern Analysis Results

### Pattern A: CPT Check
[Review 57-product-type-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern B: WooCommerce Check
[Review 57-product-type-woo-check.txt]
Result: [✅ INTEGRATES WOOCOMMERCE / ❌ NO WOOCOMMERCE]

### Pattern C: Custom Table Check
[Review 57-product-type-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]

### Pattern D: EDD Check
[Review 57-product-type-edd-check.txt]
Result: [✅ INTEGRATES EDD / ❌ NO EDD]

### Pattern E: Custom Commerce System
[Review 57-product-type-commerce.txt]
- Cart System: [DISCOVERED_PATTERN]
- Checkout Flow: [DISCOVERED_WORKFLOW]
- Payment Integration: [STRIPE / CUSTOM / OTHER]

### Pattern F: Product Types Support
[Review 57-product-type-types.txt]
- Digital Products: [YES/NO - HOW IMPLEMENTED]
- Physical Products: [YES/NO - HOW IMPLEMENTED]
- Downloadable Files: [DISCOVERED_METHOD]
- Shipping: [DISCOVERED_METHOD]

## ACTUAL Implementation Discovered
- E-commerce Approach: [DOCUMENT ACTUAL]
- Product Storage: [DOCUMENT ACTUAL]
- File Locations: [LIST ACTUAL PATHS]

EOF

echo "✓ Created $ANALYSIS_DIR/57-product-type-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/57-product-type-*.txt` files (6+ files)
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented e-commerce approach and product types

---

### Step 7: Timeline - Theme Implementation Discovery

**Objective**: Discover how Voxel implements the social timeline/activity feed WITHIN the theme.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# STEP 7.1: BROAD SEARCH
echo "Step 7: Discovering Timeline implementation..."

find . -type f \( -name "*timeline*" -o -name "*activity*" -o -name "*feed*" -o -name "*stream*" \) | grep -v "node_modules\|vendor" > "$ANALYSIS_DIR/58-timeline-files.txt"

grep -rn "\btimeline\b\|activity.*feed\|activity.*stream\|social.*feed" . --include="*.php" | head -500 > "$ANALYSIS_DIR/58-timeline-references.txt"

# STEP 7.2: CHECK MULTIPLE PATTERNS

# Pattern A: Custom Table check (MOST LIKELY for activity streams)
grep -rn "CREATE TABLE.*timeline\|CREATE TABLE.*activity\|\$wpdb.*timeline\|\$wpdb.*activity" . --include="*.php" > "$ANALYSIS_DIR/58-timeline-dbtable-check.txt"

# Pattern B: CPT check
grep -rn "register_post_type.*timeline\|register_post_type.*activity" . --include="*.php" > "$ANALYSIS_DIR/58-timeline-cpt-check.txt"

# Pattern C: BuddyPress/bbPress integration check
grep -rn "buddypress\|bp_\|bbpress\|bb_" . --include="*.php" > "$ANALYSIS_DIR/58-timeline-bp-check.txt"

# Pattern D: Activity types
grep -rn "activity.*type\|timeline.*type\|feed.*type\|activity.*kind" . --include="*.php" | head -200 > "$ANALYSIS_DIR/58-timeline-activity-types.txt"

# Pattern E: Follow/friend system
grep -rn "follow.*user\|user.*following\|friend.*request\|user.*connection\|follow.*post" . --include="*.php" | head -200 > "$ANALYSIS_DIR/58-timeline-follow-system.txt"

# Pattern F: Timeline operations
grep -rn "create.*activity\|post.*timeline\|add.*timeline\|timeline.*entry\|delete.*activity" . --include="*.php" | head -100 > "$ANALYSIS_DIR/58-timeline-operations.txt"

# Pattern G: Timeline filters
grep -rn "timeline.*filter\|activity.*filter\|privacy.*check\|can.*view.*timeline" . --include="*.php" | head -100 > "$ANALYSIS_DIR/58-timeline-filters.txt"

# Display summary
echo "Files found: $(cat "$ANALYSIS_DIR/58-timeline-files.txt" | wc -l)"
echo "Results saved to $ANALYSIS_DIR/58-timeline-*.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/58-timeline-discovery.txt" << 'EOF'
# Voxel Timeline - Discovery-First Analysis
# Date: [EXECUTION_DATE]
# CRITICAL: NO ASSUMPTIONS

## Discovery Approach
Timeline could be: Custom Table (most likely), CPT, BuddyPress integration, Custom system

## Pattern Analysis Results

### Pattern A: Custom Table Check (Most Likely)
[Review 58-timeline-dbtable-check.txt]
Result: [✅ USES CUSTOM TABLE / ❌ DOES NOT USE CUSTOM TABLE]
- Table Names: [DISCOVERED_TABLES]
- Schema: [DISCOVERED_SCHEMA]

### Pattern B: CPT Check
[Review 58-timeline-cpt-check.txt]
Result: [✅ USES CPT / ❌ DOES NOT USE CPT]

### Pattern C: BuddyPress Check
[Review 58-timeline-bp-check.txt]
Result: [✅ INTEGRATES BUDDYPRESS / ❌ NO BUDDYPRESS]

### Pattern D: Activity Types
[Review 58-timeline-activity-types.txt]
Supported Types: [LIST ALL DISCOVERED TYPES]
- Post created: [YES/NO]
- Comment added: [YES/NO]
- User followed: [YES/NO]
- Product listed: [YES/NO]
- Other: [LIST]

### Pattern E: Follow/Friend System
[Review 58-timeline-follow-system.txt]
- User Following: [DISCOVERED_METHOD]
- Follow Storage: [CUSTOM_TABLE / USER_META / OTHER]
- Connection Management: [DISCOVERED_PATTERN]

### Pattern F: Timeline Operations
[Review 58-timeline-operations.txt]
- Create Activity: [DISCOVERED_FUNCTION]
- Get Timeline: [DISCOVERED_FUNCTION]
- Delete Activity: [DISCOVERED_FUNCTION]

### Pattern G: Privacy/Filtering
[Review 58-timeline-filters.txt]
- Privacy Levels: [DISCOVERED_LEVELS]
- Visibility Checks: [DISCOVERED_FUNCTION]

## ACTUAL Implementation Discovered
- Storage Method: [DOCUMENT ACTUAL]
- Database Architecture: [DESCRIBE ACTUAL]
- Activity Types: [LIST ACTUAL]
- File Locations: [LIST ACTUAL PATHS]

EOF

echo "✓ Created $ANALYSIS_DIR/58-timeline-discovery.txt"
```

**Validation**:
- [ ] All grep commands executed
- [ ] Results saved to `$ANALYSIS_DIR/58-timeline-*.txt` files (7+ files)
- [ ] Discovery document created with ACTUAL findings
- [ ] Documented timeline system, activity types, and social features

---

### Step 8: Consolidate Findings & Document Monolithic Pattern

**Objective**: Understand Voxel's overall addon architecture and monolithic approach.

**Consolidation**:
```bash
cat > "$ANALYSIS_DIR/59-addon-architecture-summary.txt" << 'EOF'
# Voxel Addon Architecture - Monolithic Theme Pattern
# Date: [EXECUTION_DATE]
# CRITICAL: Based on ACTUAL discovery findings, NOT assumptions

## Overview

Voxel implements all 6 addons as hardcoded features within the theme itself:

1. **Paid Members** - Subscription system
2. **Paid Listings** - Listing fees
3. **Direct Messages** - Messaging system
4. **Collections** - Bookmarks/favorites
5. **Product Type** - E-commerce products (digital & physical)
6. **Timeline** - Social activity feed

These are NOT separate plugins - they are integral parts of the theme.

## Discovery Methodology Applied

For EACH addon, we used multi-pattern discovery:
1. Broad search (find ALL files, ALL references)
2. Check MULTIPLE patterns (CPT, User Meta, Custom Table, etc.)
3. Analyze results to determine ACTUAL implementation
4. Document findings without assumptions

This ensures we discover how Voxel ACTUALLY implements each addon, regardless of our expectations.

## Actual Implementation Patterns Found

### Paid Members:
Storage: [CPT / User Meta / Custom Table / Hybrid / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

### Paid Listings:
Storage: [CPT / Post Meta / Custom Table / Hybrid / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

### Direct Messages:
Storage: [Custom Table / CPT / User Meta / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

### Collections:
Storage: [User Meta / CPT / Taxonomy / Custom Table / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

### Product Type:
Storage: [WooCommerce / CPT / Custom Table / Custom / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

### Timeline:
Storage: [Custom Table / CPT / BuddyPress / Other - DOCUMENT ACTUAL]
Rationale: [Explain based on check results]

## Monolithic Architecture Pattern

### Directory Structure
[DOCUMENT ACTUAL addon organization in theme - DO NOT INVENT STRUCTURE]

CRITICAL: Use ACTUAL paths discovered from grep/find commands.
DO NOT use example structures or assumptions.

### Initialization Pattern
[DOCUMENT how Voxel loads all 6 addon features - BASED ON DISCOVERIES]
- Are addons always active or conditionally loaded?
- Where in theme initialization do addons load?
- How are addon dependencies managed?

### Common Patterns Across All 6 Addons
[DOCUMENT ACTUAL common patterns found across addons]
- CPT Registration: [DOCUMENT ACTUAL common pattern]
- Database Approach: [DOCUMENT ACTUAL common approach]
- Stripe Integration: [DOCUMENT ACTUAL common pattern]
- Theme Integration: [DOCUMENT ACTUAL hooks/filters]

### Product Type Specific Patterns
[DOCUMENT ACTUAL e-commerce specific patterns found - NO ASSUMPTIONS]

### Timeline Specific Patterns
[DOCUMENT ACTUAL social/activity specific patterns found - NO ASSUMPTIONS]

## Implications for FSE Theme Recreation

### What We Must Replicate
[DOCUMENT must-have features based on ACTUAL discoveries]

### What We Can Adapt
[DOCUMENT what can be done differently in FSE - BASED ON FINDINGS]

## Architecture Decision

Based on discovery of all 6 addons, our FSE theme should:
- [DOCUMENT decisions based on ACTUAL patterns found]
- [NO PREDETERMINED ARCHITECTURAL CHOICES]

## Next Steps

Discovery Phase Complete - Implementation Planning Can Begin

1. Review all discovery documents (52-59)
2. Create implementation task breakdown for all 6 addons
3. Determine which Voxel patterns to replicate exactly
4. Identify areas where FSE allows improvements

⚠️ **STOP HERE** - Implementation tasks will be defined based on these discoveries.

EOF

echo "✓ Created $ANALYSIS_DIR/59-addon-architecture-summary.txt"
```

**Validation**:
- [ ] Summary document created
- [ ] Monolithic architecture pattern documented based on ACTUAL findings
- [ ] Common patterns identified across all 6 addons
- [ ] No invented structures or assumptions

---

### Task 2.2b Completion Checklist

**Discovery Phase Complete When:**
- [ ] **Addon Structure** - Documented at doc 52 with ACTUAL findings
- [ ] **Paid Members** - Discovered and documented at doc 53 (ACTUAL code paths, multi-pattern)
- [ ] **Paid Listings** - Discovered and documented at doc 54 (ACTUAL code paths, multi-pattern)
- [ ] **Direct Messages** - Discovered and documented at doc 55 (ACTUAL code paths, multi-pattern)
- [ ] **Collections** - Discovered and documented at doc 56 (ACTUAL code paths, multi-pattern)
- [ ] **Product Type** - Discovered and documented at doc 57 (ACTUAL code paths, multi-pattern)
- [ ] **Timeline** - Discovered and documented at doc 58 (ACTUAL code paths, multi-pattern)
- [ ] **Architecture Summary** - Consolidated at doc 59 (all 6 addons, ACTUAL structure)
- [ ] **No Implementation Code** - Discovery only, zero assumptions
- [ ] **Monolithic Pattern** - Understood how Voxel ACTUALLY integrates all 6 addons in theme
- [ ] **No Invented Structure** - ALL paths and patterns from actual Voxel code

### File Count Verification

**Total Discovery Files Expected**: ~45+ files

- Step 1 (doc 52): 4 files
- Step 2 (doc 53): 8 files (multi-pattern)
- Step 3 (doc 54): 7 files (multi-pattern)
- Step 4 (doc 55): 8 files (multi-pattern)
- Step 5 (doc 56): 9 files (multi-pattern)
- Step 6 (doc 57): 8 files (multi-pattern)
- Step 7 (doc 58): 9 files (multi-pattern)
- Step 8 (doc 59): 1 file (summary)

### Critical Success Criteria

✅ All discovery documents contain ACTUAL findings from Voxel theme code
✅ No placeholders like `[DISCOVERED_PATTERN]` remain - all replaced with REAL data
✅ Documented ACTUAL file paths, class names, function names found in Voxel
✅ Identified ACTUAL monolithic theme pattern used by Voxel for all 6 addons
✅ NO example directory structures or imagined code organization
✅ Multi-pattern discovery used for each addon (no assumption-based searches)
✅ Files saved to `$ANALYSIS_DIR` (NOT `/tmp/`)
✅ Correct find syntax with parentheses
✅ Cross-platform compatible (uses `$VOXEL_THEME` not hardcoded paths)
✅ Proper doc numbering (52-59)

---

**Task 2.2b Duration**: 4-5 hours (increased from original estimate due to comprehensive multi-pattern discovery)
**Next**: Proceed to Day 3 Phase 3 after validating all 68 discovery documents exist (docs 01-68)

---
## Task 2.2c: Directory Structure Verification & Correction (NEW v3.7 PATCH)

```markdown
---



**Objective:** Verify actual musicalwheel-fse directory structure matches planned structure.

**Duration:** 30 minutes

**Status:** DISCOVERY ONLY - No implementation code

### Step 1: Verify Current Structure

\`\`\`bash
# Navigate to theme directory
cd wp-content/themes/musicalwheel-fse/

# List top-level directories
ls -1d */

# Verify dist/ location
ls -la dist/        # Should NOT exist at root
ls -la assets/dist/ # Should exist here

# Verify src/ exists
ls -la src/

# Verify app/ exists
ls -la app/
\`\`\`

### Step 2: Document Findings

Create discovery document:

\`\`\`bash
# Save current structure
tree -L 2 -I 'node_modules' > docs/voxel-discovery/69-musicalwheel-fse-structure-actual.txt
\`\`\`

### Step 3: Identify Discrepancies

**Check for:**
- ✓ Is dist/ at root? (should be removed)
- ✓ Is assets/dist/ present? (should exist)
- ✓ Is src/ present? (should exist)
- ✓ Is app/ present? (should exist for Voxel-compatible backend)
- ✓ Are app/ and app/ both present? (consolidate if needed)

### Discovery Questions

**For Warp to Answer (via inspection, NOT code):**

1. **Where is dist/ currently located?**
   - At root? → Needs to be moved to assets/dist/
   - In assets/? → Correct location

2. **Does src/ folder exist?**
   - Yes → Document contents
   - No → Create in Task 2.3

3. **Is app/ or app/ used for PHP backend?**
   - app/ → Voxel-compatible structure
   - app/ → Alternative structure
   - Both → Document which is primary

4. **Are configuration files present?**
   - vite.config.ts → Check outDir setting
   - functions.php → Check asset paths
   - theme.json → Verify existence

### Expected Corrected Structure

\`\`\`
musicalwheel-fse/
├── app/                    # PHP Backend (Voxel-compatible)
├── assets/
│   └── dist/              # Build output (CORRECTED location)
├── src/                    # React/TypeScript source
├── templates/              # FSE templates
├── patterns/               # FSE patterns
├── parts/                  # FSE parts
├── cli/                    # CLI tools
├── tests/                  # Tests
├── languages/              # Translations
├── node_modules/           # Dependencies (gitignored)
├── functions.php
├── style.css
├── theme.json
├── vite.config.ts
├── tsconfig.json
└── package.json
\`\`\`

### Completion Checklist

- [ ] Structure documented in doc 69
- [ ] dist/ location verified (should be in assets/, not root)
- [ ] src/ folder confirmed
- [ ] app/ vs app/ backend structure documented
- [ ] Configuration files listed
- [ ] NO implementation code written
- [ ] Ready to proceed to Task 2.3

---
```



## Task 2.3: Block System Foundation

```markdown
 

**Prerequisites:** Task 2.2c (Directory Structure Verification) must be complete.

**Critical:** Verify dist/ is at assets/dist/ before proceeding with Vite configuration.

### Pre-Task 2.3 Checklist

- [ ] Task 2.2c completed - directory structure verified
- [ ] dist/ removed from root (if it existed there)
- [ ] assets/dist/ confirmed as build output location
- [ ] src/ folder confirmed present
- [ ] vite.config.ts ready to be configured

**If dist/ is still at root:** Stop and move it to assets/dist/ before proceeding.

---

### Objective: Set up block registration system and Vite asset loader.

...
```

**Objective:** Set up block registration system and Vite asset loader.


**Instructions:**
```bash
# Step 1: Create Vite asset loader
# File: app/utils/class-vite-loader.php
# Requirements:
#   - Detect if Vite dev server is running (check localhost:3000)
#   - In dev: enqueue from http://localhost:3000/src/blocks/{name}/index.tsx (HMR)
#   - In prod: enqueue from assets/dist/{name}.js
#   - Inject Vite client script for HMR (@vite/client)
#   - Externalize WordPress packages (wp.blocks, wp.element, etc.)

# Step 2: Create blocks loader
# File: app/blocks/loader.php
# Hook into 'init' action
# Register all blocks: register_block_type(__DIR__ . '/{name}')

# Step 3: Integrate in functions.php
require_once MWFSE_PATH . '/app/utils/class-vite-loader.php';
require_once MWFSE_PATH . '/app/blocks/loader.php';
```

**Output:**
- `app/utils/class-vite-loader.php`
- `app/blocks/loader.php`

**Checkpoints:**
- [ ] Vite dev server assets load in WordPress editor
- [ ] HMR works (edit .tsx → 5ms update)
- [ ] Production build loads from assets/dist/

---

## **Day 3: Blocks Implementation (10-14 hours)**

### Task 3.1: Widget → Block Conversion

**Approach**:
1. Cursor analyzes @voxel/app/widgets/ directory
2. Identifies simplest widgets to start (by file size/complexity)
3. References @TASK_2.3_BLOCK_CONVERSION_STRATEGY.md for widget list
4. Chooses implementation order based on discovery
5. Uses Elementor UX patterns for control organization

**Strategy**: Simple → Medium → Complex
- Start with smallest/simplest widgets
- Establish patterns with foundation blocks
- Scale to complex widgets after patterns proven

**No Prescriptive Lists**: Cursor decides order based on actual discovery


**Objective:** Convert all Voxel widgets to FSE blocks based on Day 1 discovery.

**⚠️ CRITICAL:** Use ACTUAL widget data from analysis, not assumptions.

**UX/Controls Reference:** Elementor widget patterns (box model spacing, sliders, visual buttons, dual states).
Adapt Elementor UX to Gutenberg light theme constraints.
Implementation: Native React + FSE with @wordpress/components.
See: Elementor screenshots for control organization inspiration.


**Instructions:**
```bash
# Reference Day 1 discoveries (no assumptions)
cat docs/voxel-analysis/00-VOXEL-ARCHITECTURE-SUMMARY.md
cat docs/voxel-analysis/33-elementor-widgets-COMPLETE.md
cat docs/voxel-analysis/34-widget-to-block-mapping.md

# For EACH widget listed in 33-elementor-widgets-COMPLETE.md:

# Step 1: Load widget analysis data
# Read actual file path, class name, methods from analysis document

# Step 2: Open actual widget file (from discovered path)
# Extract:
#   - Actual widget slug (from get_name() or equivalent)
#   - Actual widget title (from get_title() or equivalent)
#   - Actual control registration method content
#   - Actual render method logic
#   - Actual dependencies

# Step 3: Create block.json with ACTUAL widget data
# Map Elementor controls to block attributes based on ACTUAL controls found

# Step 4: Create server-side render.php
# Recreate logic from ACTUAL render method (not assumed)

# Step 5: Create React editor component
# Based on ACTUAL control structure discovered

# Step 6: Create block entry point
# Register with ACTUAL data
```

**Priority:** Focus on widgets actually discovered in Day 1 analysis.

**Output:**
- `app/blocks/{slug}/block.json` (actual slugs from analysis)
- `app/blocks/{slug}/render.php` (actual rendering logic)
- `src/blocks/{slug}/Edit.tsx` (based on actual controls)
- `src/blocks/{slug}/index.tsx`

**Checkpoints:**
- [ ] All widgets from Day 1 analysis converted to blocks
- [ ] Block attributes match actual Elementor controls
- [ ] Rendering logic matches actual Voxel implementation

---

### **Day 4: GraphQL, Security & Obfuscation (8-10 hours)**

#### Task 4.1: WPGraphQL Integration

**Objective:** Expose all content and blocks via GraphQL with Smart Cache.

**⚠️ Important - FSE Compatibility Note:**

The WPGraphQL and WPGraphQL Content Blocks plugins handle **70% of your GraphQL needs** (posts, pages, standard blocks, users, taxonomies). However, **FSE-specific features require custom resolvers**.

**What Plugins Provide (Out-of-Box):**
- ✅ Posts, pages, custom post types
- ✅ Users, comments, taxonomies
- ✅ Block content as structured data (not HTML)
- ✅ Media library
- ✅ Standard WordPress data

**What AI Agent Must Build (Custom GraphQL Resolvers):**
- ❌ Template parts (header, footer, sidebar) → Use `get_block_templates()`
- ❌ Block templates (single, archive, home) → Use `get_block_templates()`
- ❌ theme.json data (colors, typography, spacing) → Use `wp_get_global_settings()`
- ❌ Site logo (FSE-managed) → Use `get_theme_mod('custom_logo')`
- ❌ Navigation menus (FSE-managed) → Use `wp_get_nav_menus()`
- ❌ Dynamic CSS export (with obfuscation) → Use `wp_get_global_stylesheet()`

**Why:** WPGraphQL Content Blocks plugin does not expose FSE-specific features by default. These custom resolvers use WordPress core APIs to fill the gaps.

**Instructions:**
```bash
# Step 1: WPGraphQL plugins are already installed (from Day 1 Task 1.3)
# Verify they are active:
wp plugin list --status=active

# Step 2: Create FSE-specific GraphQL resolvers
# File: app/graphql/class-fse-resolvers.php
```

**FSE Resolvers Implementation:**

```php
<?php
namespace MusicalWheel\GraphQL;

/**
 * FSE-specific GraphQL Resolvers
 * Fills gaps in WPGraphQL Content Blocks plugin
 */
class FSEResolvers {

    public static function register() {
        add_action('graphql_register_types', [__CLASS__, 'register_fields']);
    }

    public static function register_fields() {
        // 1. Expose template parts (header, footer, sidebar)
        register_graphql_field('RootQuery', 'templateParts', [
            'type' => ['list_of' => 'TemplatePart'],
            'description' => 'FSE template parts',
            'resolve' => function() {
                return get_block_templates([], 'wp_template_part');
            }
        ]);

        // 2. Expose block templates (single, archive, home, etc.)
        register_graphql_field('RootQuery', 'blockTemplates', [
            'type' => ['list_of' => 'BlockTemplate'],
            'description' => 'FSE block templates',
            'resolve' => function() {
                return get_block_templates([], 'wp_template');
            }
        ]);

        // 3. Expose theme.json settings (colors, typography, spacing)
        register_graphql_field('RootQuery', 'themeSettings', [
            'type' => 'ThemeSettings',
            'description' => 'Global theme settings from theme.json',
            'resolve' => function() {
                return wp_get_global_settings();
            }
        ]);

        // 4. Expose site logo (FSE-managed)
        register_graphql_field('RootQuery', 'siteLogo', [
            'type' => 'MediaItem',
            'description' => 'Site logo defined in FSE',
            'resolve' => function() {
                $logo_id = get_theme_mod('custom_logo');
                return $logo_id ? get_post($logo_id) : null;
            }
        ]);

        // 5. Expose navigation menus (FSE-managed)
        register_graphql_field('RootQuery', 'navigationMenus', [
            'type' => ['list_of' => 'NavigationMenu'],
            'description' => 'FSE navigation menus',
            'resolve' => function() {
                return wp_get_nav_menus();
            }
        ]);

        // 6. Export dynamic CSS (from theme.json + user styles, obfuscated)
        register_graphql_field('RootQuery', 'themeCSS', [
            'type' => 'String',
            'description' => 'Compiled theme CSS (obfuscated)',
            'resolve' => function() {
                $css = wp_get_global_stylesheet();
                // Apply obfuscation (wp-* → mw-*)
                return \MusicalWheel\Obfuscation\Obfuscator::filter_css($css);
            }
        ]);
    }
}

FSEResolvers::register();
```

**Step 3: Create block data resolvers**
```bash
# File: app/graphql/class-block-resolvers.php
# For each custom block, add GraphQL field
# Example: register_graphql_field('ContentNode', 'timelineData', [...])
```

**Step 4: Create post resolvers for custom fields**
```bash
# File: app/graphql/class-post-resolvers.php
# Expose custom fields (location, date, repeater, etc.) via GraphQL
```

**Step 5: Configure Smart Cache**
```bash
# wp-config.php additions:
define('WP_CACHE', true);
define('GRAPHQL_PERSISTED_QUERIES_ENABLED', true);
```

**Output:**
- `app/graphql/loader.php`
- `app/graphql/class-graphql-init.php`
- `app/graphql/class-fse-resolvers.php` (FSE-specific)
- `app/graphql/class-block-resolvers.php`
- `app/graphql/class-post-resolvers.php`

**Checkpoints:**
- [ ] FSE resolvers registered in GraphQL schema
- [ ] Query works: `{ templateParts { slug area content } }`
- [ ] Query works: `{ themeSettings { color { palette { color } } } }`
- [ ] Query works: `{ siteLogo { sourceUrl } }`
- [ ] Query works: `{ themeCSS }` (returns obfuscated CSS)
- [ ] All custom post types queryable
- [ ] All custom fields resolve correctly

#### Task 4.2: Security Hardening

**Objective:** Implement JWT authentication and security measures.

**Instructions:**
```bash
# Step 1: JWT plugin already installed (from Day 1 Task 1.3)
# Verify JWT secret configured in wp-config.php:
wp config get GRAPHQL_JWT_AUTH_SECRET_KEY

# Step 2: Create authentication handler
# File: app/security/class-auth-handler.php
# Features:
#   - JWT token generation (15-min access, 7-day refresh)
#   - Token validation and refresh
#   - HTTP-only cookie storage
#   - Token rotation on refresh

# Step 3: Create firewall
# File: app/security/class-firewall.php
# Features:
#   - IP whitelist (Vercel IPs only for GraphQL)
#   - Rate limiting (prevent brute force)
#   - Block unauthorized GraphQL introspection

# Step 4: Add security headers
# File: app/security/class-security-headers.php
# Headers:
#   - X-Frame-Options: DENY
#   - X-Content-Type-Options: nosniff
#   - Referrer-Policy: no-referrer
#   - Content-Security-Policy: (restrict sources)
#   - Permissions-Policy: (disable unnecessary features)

# Step 5: Custom error handling
# Never expose backend domain or stack traces
# File: app/security/class-error-handler.php
```

**Output:**
- `app/security/loader.php`
- `app/security/class-auth-handler.php`
- `app/security/class-firewall.php`
- `app/security/class-security-headers.php`
- `app/security/class-error-handler.php`

#### Task 4.3: Complete Obfuscation System

**Objective:** Remove ALL WordPress identifiers from frontend.

**Instructions:**
```bash
# Step 1: Create obfuscation filter class
# File: app/obfuscation/class-obfuscator.php

class Obfuscator {
    public static function init() {
        // Remove WordPress meta tags
        remove_action('wp_head', 'wp_generator');
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'wp_shortlink_wp_head');

        // Filter all output
        add_filter('render_block', [__CLASS__, 'filter_block_output'], 10, 2);
        add_filter('the_content', [__CLASS__, 'filter_content']);
        add_filter('body_class', [__CLASS__, 'filter_body_class']);
        add_filter('post_class', [__CLASS__, 'filter_post_class']);

        // Filter GraphQL responses
        add_filter('graphql_request_results', [__CLASS__, 'filter_graphql_response']);

        // Filter REST API responses
        add_filter('rest_pre_serve_request', [__CLASS__, 'filter_rest_response'], 10, 4);
    }

    public static function filter_block_output($block_content, $block) {
        // Replace WordPress identifiers
        $replacements = [
            'wp-block-' => 'mw-block-',
            'wp-element-' => 'mw-element-',
            'wp-container-' => 'mw-container-',
            'wp-' => 'mw-',
            'data-wp-' => 'data-mw-',
            'wordpress' => 'musicalwheel',
            'WordPress' => 'MusicalWheel',
        ];

        foreach ($replacements as $old => $new) {
            $block_content = str_replace($old, $new, $block_content);
        }

        return $block_content;
    }

    public static function filter_content($content) {
        return self::filter_block_output($content, null);
    }

    public static function filter_body_class($classes) {
        // Replace wp-* classes with mw-*
        return array_map(function($class) {
            return str_replace('wp-', 'mw-', $class);
        }, $classes);
    }

    public static function filter_post_class($classes) {
        return array_map(function($class) {
            return str_replace('wp-', 'mw-', $class);
        }, $classes);
    }

    public static function filter_graphql_response($response) {
        // Replace backend domain with frontend domain
        $backend_url = get_site_url();
        $frontend_url = defined('MWFSE_FRONTEND_URL') ? MWFSE_FRONTEND_URL : $backend_url;

        $data = json_encode($response->data);
        $data = str_replace($backend_url, $frontend_url, $data);
        $data = str_replace('/wp-content/', '/content/', $data);
        $data = str_replace('/wp-json/', '/api/', $data);
        $response->data = json_decode($data);

        return $response;
    }

    public static function filter_rest_response($served, $result, $request, $server) {
        // Filter REST API responses (if used)
        // Similar to GraphQL filtering
        return $served;
    }

    public static function filter_css($css) {
        // Obfuscate CSS (for themeCSS GraphQL field)
        $replacements = [
            '.wp-' => '.mw-',
            '#wp-' => '#mw-',
            'wp-block-' => 'mw-block-',
        ];

        foreach ($replacements as $old => $new) {
            $css = str_replace($old, $new, $css);
        }

        return $css;
    }
}

Obfuscator::init();

# Step 2: Create validation CLI tool
# File: cli/validate-obfuscation.php
#!/usr/bin/env php
<?php
/**
 * Validates that no WordPress identifiers are visible on frontend
 * Usage: php cli/validate-obfuscation.php <url>
 * Exit: 0 (pass) or 1 (fail)
 */

if ($argc < 2) {
    echo "Usage: php validate-obfuscation.php <url>\n";
    exit(1);
}

$url = $argv[1];
$html = file_get_contents($url);

$violations = [];

// Check for WordPress identifiers
$patterns = [
    '/wp-[a-z0-9-]+/i' => 'wp-* class or ID',
    '/wordpress/i' => 'WordPress string',
    '/wp-json/' => 'wp-json path',
    '/wp-content/' => 'wp-content path',
    '/<meta name="generator" content="WordPress/' => 'WordPress meta tag',
];

foreach ($patterns as $pattern => $description) {
    if (preg_match($pattern, $html)) {
        $violations[] = "Found: $description";
    }
}

if (!empty($violations)) {
    echo "❌ Obfuscation validation FAILED:\n";
    foreach ($violations as $violation) {
        echo "  - $violation\n";
    }
    exit(1);
}

echo "✅ Obfuscation validation PASSED\n";
exit(0);
```

**Output:**
- `app/obfuscation/class-obfuscator.php`
- `cli/validate-obfuscation.php` (executable)

**Checkpoints:**
- [ ] No 'wp-' classes in HTML
- [ ] No 'WordPress' strings in source
- [ ] No '/wp-json/' paths visible
- [ ] No backend URLs in GraphQL responses
- [ ] Validation CLI passes (exit code 0)

---


### Day 4 Task 4.4: Multisite & Frontend Translation System

**Objective**: Ensure theme works in WordPress Multisite and implements frontend-only translation architecture.

**Duration**: 3-4 hours
**Agent**: Execution Model (Claude Sonnet 3.7 or equivalent)

**Critical Architecture Decision**:
> WordPress stores content in ORIGINAL language ONLY. Next.js handles ALL translation.
> NO WordPress translation plugins required (no WPML, TranslatePress, Polylang).

---

### Step 1: Discovery - Voxel Multisite Support

**Objective**: Discover if/how Voxel supports WordPress Multisite.

**CRITICAL**: Do NOT assume you know Voxel's structure. DISCOVER it through these commands.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# Search for multisite-specific functions
grep -rn "is_multisite\|switch_to_blog\|restore_current_blog\|get_sites\|network_" . --include="*.php" > "$ANALYSIS_DIR/60-multisite-discovery.txt"

# Search for network admin features
grep -rn "network_admin\|network_options\|site_option" . --include="*.php" > "$ANALYSIS_DIR/61-network-admin.txt"

# Search for domain mapping support
grep -rn "domain.*mapping\|mapped.*domain\|get_blog_details" . --include="*.php" > "$ANALYSIS_DIR/62-domain-mapping.txt"

# Display results
echo "=== Multisite Discovery ==="
cat "$ANALYSIS_DIR/60-multisite-discovery.txt"
echo ""
echo "=== Network Admin ==="
cat "$ANALYSIS_DIR/61-network-admin.txt"
echo ""
echo "=== Domain Mapping ==="
cat "$ANALYSIS_DIR/62-domain-mapping.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/63-multisite-implementation-strategy.txt" << 'EOF'
# Voxel Multisite Support - Analysis
# Date: [EXECUTION_DATE]

## Discovery Findings

### Does Voxel Support Multisite?
[YES/NO - based on grep results]

### If YES - How does Voxel implement it?
[DOCUMENT ACTUAL findings - DO NOT ASSUME]

### If NO - What approach should FSE theme take?
[Document strategy for adding multisite support]

## Implementation Strategy for FSE Theme

[Document HOW to implement based on discoveries]

### Files to Create:
[List based on discoveries OR WordPress best practices]

EOF

echo "✓ Created doc 63: Multisite implementation strategy"
```

**Validation**:
- [ ] Discovery commands executed
- [ ] Results documented in docs 60-63
- [ ] Implementation strategy defined
- [ ] No code written yet (strategy only)

---

### Step 2: Discovery - Voxel Translation/Localization

**Objective**: Discover how Voxel handles translations and internationalization.

**CRITICAL**: Do NOT assume. DISCOVER actual patterns.

**Discovery Commands**:
```bash
cd "$VOXEL_THEME"

# Search for translation functions
grep -rn "__\|_e\|_x\|_n\|_nx\|esc_html__\|esc_html_e\|esc_attr__" . --include="*.php" | head -100 > "$ANALYSIS_DIR/64-translation-functions.txt"

# Search for text domain
grep -rn "text.*domain\|Text Domain\|load_theme_textdomain\|load_plugin_textdomain" . --include="*.php" > "$ANALYSIS_DIR/65-text-domain.txt"

# Search for language files
find . -name "*.po" -o -name "*.pot" -o -name "*.mo" > "$ANALYSIS_DIR/66-language-files.txt"

# Check if Voxel uses any translation plugins
grep -rn "wpml\|translatepress\|polylang\|multilingual" . --include="*.php" > "$ANALYSIS_DIR/67-translation-plugins.txt"

# Display results
echo "=== Translation Functions ==="
head -30 "$ANALYSIS_DIR/64-translation-functions.txt"
echo ""
echo "=== Text Domain ==="
cat "$ANALYSIS_DIR/65-text-domain.txt"
echo ""
echo "=== Language Files ==="
cat "$ANALYSIS_DIR/66-language-files.txt"
echo ""
echo "=== Translation Plugins Used ==="
cat "$ANALYSIS_DIR/67-translation-plugins.txt"
```

**Documentation**:
```bash
cat > "$ANALYSIS_DIR/68-translation-implementation-strategy.txt" << 'EOF'
# Voxel Translation Support - Analysis
# Date: [EXECUTION_DATE]
# Architecture: Frontend-Only Translation (Next.js i18n + Google Translate API)

## Discovery Findings

### How does Voxel handle translations?
- Text domain: [DISCOVERED_TEXT_DOMAIN]
- Translation functions used: [DISCOVERED_PATTERN]
- Language files found: [DISCOVERED_FILES]
- Translation plugins used: [DISCOVERED_PLUGINS]

## MusicalWheel Translation Architecture

### WordPress Role:
- Store content in ORIGINAL language ONLY
- NO translation plugins (no WPML, TranslatePress, Polylang)
- Add originalLanguage custom field to all CPTs
- Expose via GraphQL

### Next.js Role:
- Handle ALL translation (UI + content)
- Next.js i18n for routing and locale detection
- JSON files for UI strings (navigation, buttons, labels)
- Google Translate API for on-demand content translation
- Vercel Edge caching for translations

## Implementation Strategy

### Required WordPress Changes:
1. Add originalLanguage custom field to all CPTs
   - Default: 'en'
   - Exposed via GraphQL
   - Saved when content created

2. Ensure all theme strings use translation functions
   - Use theme text domain: [DEFINE_DOMAIN]
   - Create .pot file for reference
   - DO NOT install translation plugins

3. GraphQL: Expose originalLanguage field
   - Add to all post types
   - No translation plugin GraphQL needed

### Required Next.js Implementation:
1. Configure next.config.js with i18n settings
2. Create /locales directory with JSON files
3. Create /api/translate serverless function (Google Translate API)
4. Create TranslatableContent component for on-demand translation
5. Create useTranslation hook for UI strings

### Files to Create:
[List based on Voxel's discovered patterns + frontend requirements]

EOF

echo "✓ Created doc 68: Translation implementation strategy"
```

**Validation**:
- [ ] Discovery commands executed
- [ ] Results documented in docs 64-68
- [ ] Translation strategy defined (frontend-only)
- [ ] NO translation plugin code

---

### Step 3: Implementation - Multisite Support

**Objective**: Implement multisite support based on Step 1 discoveries.

**Instructions for AI Agent**:
```
Based on your findings in docs 60-63:

1. Read your implementation strategy (doc 63)
2. Create necessary files for multisite support
3. Use patterns discovered from Voxel (if any)
4. If Voxel has no multisite support, implement using WordPress best practices
5. Ensure FSE theme works as single site OR multisite

Required functionality:
- Detect multisite with is_multisite()
- Only load multisite code when needed
- Safe cross-site data access (if needed)
- Network admin settings (if needed)
- Per-site customization

Implementation location:
- Create files in theme's app/multisite/ directory
- Load in functions.php only when is_multisite() returns true

Validation:
- Test: wp eval "echo is_multisite() ? 'Multisite: Yes' : 'Multisite: No';"
- Test: Theme activates successfully in multisite
- Test: Site-specific settings work correctly
```

**Output**: Files created based on discovery (NOT predetermined)

---

### Step 4: Implementation - WordPress Translation Preparation

**Objective**: Prepare WordPress for frontend-only translation (no plugins).

**Instructions for AI Agent**:
```
Based on your findings in docs 64-68:

CRITICAL: WordPress stores content in ORIGINAL language ONLY.
NO translation plugins will be installed.

Required implementation:

1. Add originalLanguage custom field to ALL CPTs
   - Field type: string
   - Default value: 'en'
   - Show in REST API: true
   - Expose via GraphQL: true

2. Ensure theme strings use translation functions
   - Use theme text domain (discovered or define new)
   - Wrap all hardcoded strings in __() or _e()
   - Create .pot file as reference for Next.js translation

3. GraphQL: Add originalLanguage field resolver
   - Register field for all post types
   - Return get_post_meta($post->ID, 'originalLanguage', true)

DO NOT:
- Install any translation plugins (WPML, TranslatePress, Polylang)
- Add plugin compatibility code
- Create translation database tables
- Implement server-side translation

Implementation location:
- app/translation/class-original-language.php (custom field)
- app/graphql/language-field.php (GraphQL resolver)
- Load in functions.php

Validation:
- Test: originalLanguage field appears in REST API
- Test: originalLanguage field appears in GraphQL
- Test: Field defaults to 'en' for new posts
- Verify: NO translation plugins present
```

**Output**: WordPress prepared for frontend translation (no plugins)

---

### Step 5: Next.js Translation Instructions (For Future Implementation)

**Objective**: Document what Next.js implementation needs to do.

**Instructions for AI Agent**:
```
Create documentation for Next.js translation implementation.

NOTE: This will be implemented LATER (not in WordPress theme).
The theme just needs to be ready (originalLanguage field exposed).

Document in a README what Next.js needs:

1. next.config.js i18n configuration
   - Supported locales
   - Default locale
   - Locale detection

2. Directory structure needed
   - /locales/{lang}/common.json (UI strings)
   - /locales/{lang}/marketplace.json
   - /locales/{lang}/navigation.json

3. API route needed
   - /pages/api/translate.js (Google Translate API)
   - Rate limiting
   - Caching headers

4. Components needed
   - TranslatableContent (on-demand translation)
   - useTranslation hook (UI strings)

5. GraphQL queries needed
   - Fetch originalLanguage field
   - Pass to translation component

This is DOCUMENTATION only - NOT implementation.
The WordPress theme just provides originalLanguage field.
```

**Output**: Documentation for Next.js implementation

---

### Task 4.4 Completion Checklist

- [ ] **Multisite Discovery** - Docs 60-63 created with actual findings
- [ ] **Translation Discovery** - Docs 64-68 created with actual findings
- [ ] **Multisite Implementation** - Based on doc 63 strategy
- [ ] **WordPress Translation Prep** - originalLanguage field added to all CPTs
- [ ] **GraphQL Exposure** - originalLanguage field in GraphQL schema
- [ ] **Next.js Documentation** - Instructions for frontend implementation created
- [ ] **Validation** - Tested with multisite (if available)
- [ ] **Validation** - Verified NO translation plugins present
- [ ] **Validation** - originalLanguage field working in REST API and GraphQL
---

### **Day 5: Frontend, Testing & Deployment (8-10 hours)**

#### Task 5.1: Faust.js Frontend Setup

**Objective:** Create Next.js frontend with Faust.js and ISR revalidation.

**Instructions:**
```bash
cd ~/projects
npx create-next-app@latest musicalwheel-nextjs --typescript --tailwind --app
cd musicalwheel-nextjs

# FaustWP plugin already installed in WordPress (from Day 1 Task 1.3)

# Install Faust.js client libraries
npm install @faustwp/core @faustwp/blocks
npm install @apollo/client graphql

# Configure Faust.js
# File: faust.config.js
import { setConfig } from '@faustwp/core';

export default setConfig({
  wpUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL,
  apiClientSecret: process.env.FAUST_SECRET_KEY,
  templates: {},
  experimentalPlugins: [],
});

# Create providers
# File: src/app/providers.tsx
import { WordPressBlocksProvider } from '@faustwp/blocks';
import { coreBlocks } from '@faustwp/blocks/blocks';
import * as kadenceBlocks from '@/blocks/kadence';
import * as musicalWheelBlocks from '@/blocks/musicalwheel';

export function Providers({ children }) {
  return (
    <WordPressBlocksProvider config={{
      blocks: {
        ...coreBlocks,
        ...kadenceBlocks,
        ...musicalWheelBlocks,
      },
    }}>
      {children}
    </WordPressBlocksProvider>
  );
}

# Create dynamic page route
# File: src/app/[slug]/page.tsx
import { apolloClient } from '@/lib/apollo-client';
import { WordPressBlocksViewer } from '@faustwp/blocks';
// Fetch page via GraphQL, render blocks, inject CSS

# Create ISR revalidation webhook
# File: src/app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { path, secret } = await request.json();

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 });
  }

  await revalidatePath(path);
  return Response.json({ revalidated: true, path });
}

# Add WordPress webhook (triggers on save_post)
# File (WordPress): app/utils/class-revalidation-webhook.php
add_action('save_post', function($post_id) {
    $url = get_permalink($post_id);
    wp_remote_post('https://musicalwheel.com/api/revalidate', [
        'body' => json_encode([
            'path' => parse_url($url, PHP_URL_PATH),
            'secret' => REVALIDATION_SECRET,
        ]),
    ]);
});
```

**Map All Blocks to React Components:**
```bash
# For each of 28+ blocks, create React component
# File: src/blocks/musicalwheel/{Name}.tsx
# Use GraphQL queries to fetch data
# Apply Tailwind CSS (matching WordPress styles)
# Export with config: { name: 'musicalwheel/{name}', Component }
```

**Output:**
- `musicalwheel-nextjs/` (complete Next.js project)
- All 28+ blocks mapped to React components
- ISR revalidation configured
- Tailwind CSS configured

**Checkpoints:**
- [ ] `npm run dev` starts Next.js
- [ ] Pages load from WordPress (seed queries)
- [ ] Blocks render correctly
- [ ] ISR revalidation works (edit page → update in <60s)
- [ ] Tailwind styles match WordPress editor

#### Task 5.2: Automated Testing Suite

**Objective:** Create comprehensive test coverage.

**Instructions:**
```bash
# Step 1: Unit Tests (PHPUnit)
# File: tests/unit/ObfuscatorTest.php
# Test: filter_block_output(), filter_body_class(), filter_graphql_response()

# File: tests/unit/ViteLoaderTest.php
# Test: check_dev_server(), enqueue_assets()

# Step 2: Integration Tests (PHPUnit + WP Test Suite)
# File: tests/integration/GraphQLTest.php
# Test: Custom types registered, fields resolve correctly, Smart Cache working

# File: tests/integration/BlocksTest.php
# Test: All 28+ blocks registered, attributes work, render.php output correct

# Step 3: E2E Tests (Playwright)
# File: tests/e2e/obfuscation.spec.ts
test('no WordPress identifiers visible', async ({ page }) => {
  await page.goto('https://musicalwheel.com');
  const html = await page.content();
  expect(html).not.toContain('wp-');
  expect(html).not.toContain('wordpress');
  expect(html).not.toContain('wp-json');
});

# File: tests/e2e/blocks.spec.ts
# Test: Timeline block loads, search works, user bar displays

# Step 4: Performance Tests
# File: tests/performance/api-speed.sh
# Test: GraphQL queries < 200ms, Smart Cache hit rate > 80%

# File: tests/performance/frontend-speed.sh
# Test: Page load < 2s, Lighthouse score > 90
```

**Output:**
- `tests/unit/*.php` (PHPUnit tests)
- `tests/integration/*.php` (Integration tests)
- `tests/e2e/*.spec.ts` (Playwright E2E tests)
- `tests/performance/*.sh` (Performance benchmarks)

#### Task 5.3: Deployment Automation

**Objective:** Create one-command deployment script.

**Instructions:**
```bash
# File: cli/deploy.sh
#!/bin/bash
set -e

echo "🚀 Starting MusicalWheel deployment..."

# Step 1: Build theme assets
echo "📦 Building theme assets..."
npm run build
# Check: dist/ folder contains all built assets

# Step 2: Run tests
echo "🧪 Running tests..."
vendor/bin/phpunit tests/unit
vendor/bin/phpunit tests/integration
# Skip E2E tests (run in CI/CD)

# Step 3: Validate obfuscation
echo "🔍 Validating obfuscation..."
php cli/validate-obfuscation.php https://musicalwheel.com
if [ $? -ne 0 ]; then
    echo "❌ Obfuscation validation failed. Aborting."
    exit 1
fi

# Step 4: Deploy WordPress theme
echo "🌐 Deploying WordPress theme..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
    ./ user@rocket.net:/path/to/wp-content/themes/musicalwheel-fse/

# Step 5: Deploy Next.js frontend
echo "⚡ Deploying Next.js to Vercel..."
cd ../musicalwheel-nextjs
vercel --prod

echo "✅ Deployment complete!"
```

**Output:**
- `cli/deploy.sh` (executable)
- `cli/test-runner.sh` (runs all tests)
- `cli/validate-obfuscation.php` (validates no WP identifiers)

**Checkpoints:**
- [ ] `./cli/deploy.sh` completes without errors
- [ ] Theme active on Rocket.net
- [ ] Frontend live on Vercel
- [ ] All tests passing
- [ ] Obfuscation validated

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **Backend domain exposure** | Medium | High | - Custom error handler (never show stack traces)<br>- GraphQL error formatting (generic messages)<br>- Security headers (hide server info)<br>- Validate all responses before sending |
| **WordPress identifier leakage** | High | Medium | - Comprehensive obfuscation filters (class-obfuscator.php)<br>- Validation CLI (automated testing)<br>- E2E tests (check HTML/CSS/Network)<br>- Smart Cache filters (GraphQL responses) |
| **JWT token theft** | Low | Critical | - HTTP-only cookies (not accessible via JS)<br>- Short expiry (15 min access tokens)<br>- Token rotation (refresh tokens)<br>- Secure flag (HTTPS only) |
| **Voxel feature complexity** | High | High | - Prioritize MVP features first<br>- Document deferred features for Phase 2<br>- Analyze Voxel code thoroughly (don't guess)<br>- Cross-reference documentation |
| **Plugin conflicts** | Medium | High | - Pin Voxel version (test before updating)<br>- Test on staging environment first<br>- Document all plugin dependencies<br>- Monitor error logs after updates |
| **GraphQL query performance** | Medium | Medium | - WPGraphQL Smart Cache (network + object)<br>- Optimize queries (limit depth, add pagination)<br>- Monitor query complexity<br>- Add query cost analysis |
| **CSS compilation issues** | Medium | Low | - Use Tailwind CSS v4 (Rust engine, stable)<br>- Test incrementally (one block at a time)<br>- Browser DevTools validation<br>- Automated visual regression tests |
| **Block compatibility issues** | Low | Medium | - Follow WordPress coding standards<br>- Use WordPress components (@wordpress/components)<br>- Test in WordPress editor extensively<br>- Test with different themes/plugins |
| **ISR cache invalidation** | Medium | Low | - Smart Cache automatic invalidation<br>- Manual revalidation webhook<br>- Monitor cache hit rates<br>- Cache versioning (bust on deploy) |
| **Vercel cost overruns** | Low | Medium | - Monitor usage dashboard<br>- Implement request throttling<br>- Use ISR (reduce serverless invocations)<br>- Set budget alerts |
| **AI agent hallucinations** | Medium | Medium | - Reference actual Voxel code (not generic examples)<br>- Cross-check generated code<br>- Validate with tests (unit, integration, E2E)<br>- Manual code review before deploy |

### Operational Risks

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **3-5 day timeline too aggressive** | Medium | High | - AI agent automation (24/7 processing)<br>- Prioritize MVP features<br>- Defer non-essential features to Phase 2<br>- Parallel task execution |
| **Rocket.net downtime** | Low | High | - Set up uptime monitoring (Pingdom, UptimeRobot)<br>- Have rollback plan (backup theme)<br>- Document manual recovery steps<br>- Monitor status page |
| **Developer knowledge gaps** | Low | Low | - Comprehensive documentation (this plan)<br>- AI agent support (code generation)<br>- Reference Voxel codebase directly<br>- WordPress/React/GraphQL documentation |
| **Incomplete Voxel analysis** | Medium | High | - Cross-reference docs + source code<br>- Test all features manually<br>- User acceptance testing<br>- Document missing features for Phase 2 |
| **Testing coverage gaps** | Medium | Medium | - Automated test suite (unit, integration, E2E)<br>- Manual testing checklist<br>- Staging environment validation<br>- Beta user testing |

---

## Success Metrics & Validation

### Phase 1 Completion Criteria (Minimum 85/100 Points)

#### 1. Functionality (40 points)

- **All 28+ blocks functional** (20 pts)
  - [ ] Each block renders in editor
  - [ ] Each block renders on frontend
  - [ ] All block attributes work
  - [ ] Server-side rendering correct
  - [ ] React editor components functional

- **GraphQL API complete** (10 pts)
  - [ ] All CPTs exposed in GraphQL
  - [ ] All custom fields resolve
  - [ ] Block data resolvers working
  - [ ] FSE data exposed (template parts, theme.json, site logo)
  - [ ] Smart Cache operational

- **Frontend rendering correctly** (10 pts)
  - [ ] All blocks mapped to React components
  - [ ] Dynamic pages load (ISR)
  - [ ] Tailwind styles applied
  - [ ] ISR revalidation works
  - [ ] No console errors

#### 2. Security (30 points)

- **Backend hidden** (15 pts)
  - [ ] No backend URLs in HTML
  - [ ] No backend URLs in GraphQL responses
  - [ ] No backend URLs in Network tab
  - [ ] Custom error pages (never show domain)
  - [ ] Security headers implemented

- **JWT authentication working** (10 pts)
  - [ ] Access tokens generated (15-min expiry)
  - [ ] Refresh tokens generated (7-day expiry)
  - [ ] Token rotation on refresh
  - [ ] HTTP-only cookies
  - [ ] Secure flag enabled (HTTPS)

- **Security headers active** (5 pts)
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Referrer-Policy: no-referrer
  - [ ] Content-Security-Policy configured
  - [ ] Permissions-Policy configured

#### 3. Obfuscation (20 points)

- **Zero WordPress identifiers** (10 pts)
  - [ ] No 'wp-' classes in HTML
  - [ ] No 'WordPress' strings visible
  - [ ] No '/wp-json/' paths
  - [ ] No '/wp-content/' paths
  - [ ] Validation CLI passes (exit 0)

- **REST API obfuscated** (5 pts)
  - [ ] GraphQL responses filtered
  - [ ] Backend URLs replaced with frontend
  - [ ] Path obfuscation (/wp-content/ → /content/)
  - [ ] Error messages generic

- **CSS classes replaced** (5 pts)
  - [ ] wp-block-* → mw-block-*
  - [ ] wp-element-* → mw-element-*
  - [ ] wp-container-* → mw-container-*
  - [ ] body_class filtered
  - [ ] post_class filtered

#### 4. Performance (10 points)

- **GraphQL API < 200ms** (5 pts)
  - [ ] Smart Cache hit rate > 80%
  - [ ] Query complexity optimized
  - [ ] Pagination implemented
  - [ ] Object cache enabled (Redis/Relay)
  - [ ] Network cache working (Varnish)

- **Frontend load < 2s** (5 pts)
  - [ ] Lighthouse Performance > 90
  - [ ] First Contentful Paint < 1s
  - [ ] Time to Interactive < 2s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Cumulative Layout Shift < 0.1

### Validation Checklist

**Automated Tests (Must Pass):**
```bash
# Unit tests
vendor/bin/phpunit tests/unit
# Expected: All tests passing

# Integration tests
vendor/bin/phpunit tests/integration
# Expected: All tests passing

# E2E tests
npm run test:e2e
# Expected: No WordPress identifiers visible, all blocks working

# Obfuscation validation
php cli/validate-obfuscation.php https://musicalwheel.com
# Expected: Exit code 0 (pass)

# Performance tests
bash tests/performance/api-speed.sh
# Expected: GraphQL queries < 200ms

bash tests/performance/frontend-speed.sh
# Expected: Page load < 2s, Lighthouse > 90
```

**Manual Validation (Spot Check):**
```bash
# 1. Open WordPress admin
# - Create new page with Kadence + MusicalWheel blocks
# - Publish page

# 2. Check Vercel frontend (within 60 seconds)
# - New page should appear (seed query)
# - Layout/design should match editor
# - All blocks should render correctly

# 3. Inspect HTML source (View Source)
# - Search for "wp-" → Should find ZERO results
# - Search for "wordpress" → Should find ZERO results
# - Search for "wp-json" → Should find ZERO results

# 4. Open Network tab (DevTools)
# - Look for GraphQL requests
# - Check response → Backend URL should NOT appear
# - All URLs should be frontend domain

# 5. Test user interactions
# - Timeline: Follow button, reactions, load more
# - Search: Enter query, apply filters, view results
# - Messages: Send message, receive notification
# - Orders: View orders, filter by status
```

---

## Deployment Procedures

### Pre-Deployment Checklist

**WordPress Theme:**
- [ ] All tests passing (unit, integration)
- [ ] Production build successful (`npm run build`)
- [ ] assets/dist/ folder contains all assets
- [ ] Obfuscation validation passed
- [ ] No PHP errors in error log
- [ ] Theme version updated (style.css)

**Next.js Frontend:**
- [ ] Environment variables configured (.env.production)
- [ ] GraphQL endpoint correct
- [ ] Revalidation secret set
- [ ] Build successful (`npm run build`)
- [ ] ISR revalidation tested

**Infrastructure:**
- [ ] Rocket.net Enterprise plan active
- [ ] Redis/Relay object cache enabled
- [ ] Varnish cache configured
- [ ] Cloudflare CDN enabled
- [ ] Vercel Pro plan active
- [ ] DNS configured (A/CNAME records)
- [ ] SSL certificates installed

### Deployment Steps

**Step 1: Deploy WordPress Theme**
```bash
cd wp-content/themes/musicalwheel-fse

# Build assets
npm run build

# Run validation
php cli/validate-obfuscation.php https://staging.musicalwheel.com
if [ $? -ne 0 ]; then
    echo "Validation failed. Fix before deploying."
    exit 1
fi

# Deploy via SFTP/rsync
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'tests' \
    ./ user@rocket.net:/path/to/wp-content/themes/musicalwheel-fse/

# Activate theme (if not active)
wp theme activate musicalwheel-fse --ssh=user@rocket.net
```

**Step 2: Configure WordPress**
```bash
# SSH into Rocket.net server
ssh user@rocket.net

# Edit wp-config.php
define('MWFSE_FRONTEND_URL', 'https://musicalwheel.com');
define('GRAPHQL_PERSISTED_QUERIES_ENABLED', true);
define('REVALIDATION_SECRET', 'your-secret-here');
define('WP_CACHE', true);

# Flush caches
wp cache flush
wp transient delete --all
```

**Step 3: Deploy Next.js Frontend**
```bash
cd musicalwheel-nextjs

# Set environment variables (Vercel dashboard or CLI)
vercel env add NEXT_PUBLIC_WORDPRESS_URL production
# Value: https://backend.musicalwheel.com

vercel env add NEXT_PUBLIC_GRAPHQL_ENDPOINT production
# Value: https://backend.musicalwheel.com/graphql

vercel env add FAUST_SECRET_KEY production
# Value: (from wp-config.php)

vercel env add REVALIDATION_SECRET production
# Value: (from wp-config.php)

# Deploy to production
vercel --prod
```

**Step 4: Post-Deployment Validation**
```bash
# Wait 2 minutes for DNS propagation

# Test obfuscation
php cli/validate-obfuscation.php https://musicalwheel.com
# Expected: Exit 0 (pass)

# Test GraphQL endpoint
curl -X POST https://musicalwheel.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ themeCSS }"}'
# Expected: CSS returned, no backend URLs

# Test ISR revalidation
# 1. Edit page in WordPress
# 2. Wait 60 seconds
# 3. Check Vercel frontend → Should show updated content

# Run Lighthouse audit
npx lighthouse https://musicalwheel.com --view
# Expected: Performance > 90, no WordPress identifiers in HTML
```

### Rollback Plan

**If deployment fails:**
```bash
# Rollback WordPress theme
ssh user@rocket.net
cd /path/to/wp-content/themes
mv musicalwheel-fse musicalwheel-fse-failed
mv musicalwheel-fse-backup musicalwheel-fse
wp theme activate musicalwheel-fse

# Rollback Vercel deployment
vercel rollback https://musicalwheel.com
# Select previous successful deployment

# Notify team
echo "Deployment rolled back. Investigating issues."
```

---

## Tools & Commands Reference

### Development
```bash
# WordPress local development
wp server
# Or: Local by Flywheel, DDEV, Docker

# Vite dev server (HMR)
cd wp-content/themes/musicalwheel-fse
npm run dev
# Access: http://localhost:3000 (proxied to WordPress)

# Next.js development
cd musicalwheel-nextjs
npm run dev
# Access: http://localhost:3001

# GraphQL playground
# Open: https://backend.musicalwheel.com/graphql
```

### Building
```bash
# Build WordPress theme assets
cd wp-content/themes/musicalwheel-fse
npm run build
# Output: assets/dist/

# Build Next.js frontend
cd musicalwheel-nextjs
npm run build
# Output: /.next/

# Watch mode (continuous build)
npm run watch
```

### Testing
```bash
# Unit tests (PHPUnit)
vendor/bin/phpunit tests/unit

# Integration tests
vendor/bin/phpunit tests/integration

# E2E tests (Playwright)
cd musicalwheel-nextjs
npm run test:e2e

# Obfuscation validation
php cli/validate-obfuscation.php https://musicalwheel.com

# Performance tests
bash tests/performance/api-speed.sh
bash tests/performance/frontend-speed.sh

# Run all tests
bash cli/test-runner.sh
```

### Deployment
```bash
# Full deployment (automated)
bash cli/deploy.sh

# WordPress theme only
rsync -avz ./ user@rocket.net:/path/to/themes/musicalwheel-fse/

# Next.js frontend only
cd musicalwheel-nextjs && vercel --prod

# Rollback Vercel
vercel rollback https://musicalwheel.com
```

### Debugging
```bash
# Check Vite dev server
curl http://localhost:3000

# Check GraphQL endpoint
curl -X POST https://backend.musicalwheel.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ themeCSS }"}'

# Check Smart Cache status
wp graphql show-cache-status --ssh=user@rocket.net

# Check error logs
tail -f wp-content/debug.log

# Check Vercel logs
vercel logs https://musicalwheel.com
```

---

## Next Steps (Phase 2 - Post-Launch)

After Phase 1 MVP is live and stable (3-5 days), consider:

### **Phase 2: Refinement & Optimization (1-2 weeks)**
1. **Plugin Refactoring** - Extract custom blocks into separate plugin (modular architecture)
2. **Advanced Features** - Implement deferred Voxel features (advanced filters, analytics, etc.)
3. **Performance Tuning** - Optimize for 1M+ users (query caching, CDN optimization)
4. **Social Features Enhancement** - Real-time notifications, live chat, activity feeds
5. **AI Integration** - Semantic search, content recommendations, auto-tagging
6. **Mobile App** - React Native app using same GraphQL API
7. **Analytics Dashboard** - Traffic analytics, user behavior, conversion tracking
8. **A/B Testing** - Test layouts, CTAs, user flows

### **Phase 3: Scale & Growth (Ongoing)**
1. **Multi-region deployment** - Edge caching, geolocation-based content
2. **Enterprise features** - Multi-tenancy, white-labeling, custom domains
3. **Marketplace expansion** - Payment integrations (Stripe Connect, PayPal)
4. **Community features** - Forums, groups, events
5. **Content moderation** - AI-powered spam detection, user reporting
6. **SEO optimization** - Structured data, sitemaps, meta tags
7. **Internationalization** - Multi-language support, currency conversion

---

## Conclusion

This implementation plan provides a **complete, self-contained guide** for an AI agent to build the MusicalWheel FSE theme in **3-5 days** using a **discovery-first approach with ZERO assumptions** about Voxel's code structure.

**Key Success Factors:**
✅ **Discover first, implement second** - Never assume Voxel structure  
✅ **Reference actual Voxel codebase** - Use discovered data, not guesses  
✅ **Use WPGraphQL plugins** - Leverage existing tools (saves 10+ hours)  
✅ **Build FSE custom resolvers** - Fill gaps for template parts, theme.json  
✅ **Complete obfuscation** - Zero WordPress identifiers visible  
✅ **Security hardened** - JWT auth, IP whitelisting, security headers  
✅ **Modern stack** - Vite + React + Tailwind CSS v4 + Faust.js  
✅ **Automated testing** - Unit, integration, E2E, performance  
✅ **Production-ready** - Validation CLI, deployment scripts, rollback plan  

**Discovery-First Benefits:**
- ✅ No false assumptions about Voxel structure
- ✅ Accurate recreation based on actual implementation
- ✅ Comprehensive understanding before coding
- ✅ 44 analysis documents provide complete reference
- ✅ Master summary document guides entire implementation

**Timeline:** 3-5 days (AI agent-optimized)  
**Estimated Hours:** 40-50 hours (AI agent 24/7 processing)  
**Recommended Team:** 1 developer + AI agent (Warp/OpenCode/Cursor)  

**Tech Stack:**
- Backend: WordPress 6.9 Beta FSE Theme (monolithic) + WPGraphQL + Content Blocks + Smart Cache
- Frontend: Faust.js + Next.js + Tailwind CSS v4
- Development: Vite + React 18 + TypeScript + HMR
- Infrastructure: Rocket.net Enterprise + Vercel Pro

All architectural decisions prioritize **discovery, accuracy, speed, security, and modern best practices** for the November 15, 2025 alpha/beta milestone.

---

**Document Version:** 3.9 (Discovery-First - No Voxel Assumptions)  
**Last Updated:** November 9, 2025, 2:08 PM CET  
**Status:** Ready for AI Agent Implementation  
**Contact:** MusicalWheel Development Team