# MusicalWheel FSE Theme

Modern WordPress Full Site Editing (FSE) theme for the MusicalWheel music industry ecosystem. Built with React, TypeScript, Vite, and Tailwind CSS v4.

## 🎯 Architecture

**Based on**: Voxel theme discovery analysis (Task 2.2b)  
**Approach**: Modular monolithic architecture with OOP wrapper patterns  
**Stack**: WordPress FSE + React + TypeScript + Vite + Tailwind CSS v4  
**Headless Support**: GraphQL-first with WPGraphQL integration

## 📁 Directory Structure

```
musicalwheel-fse/
├── inc/                      # PHP backend logic
│   ├── post-types/          # Custom Post Types (OOP wrappers)
│   ├── custom-fields/       # Field system (26+ field types)
│   │   ├── types/           # Field type definitions
│   │   ├── admin/           # Backend admin interface
│   │   └── frontend/        # Frontend submission forms
│   ├── blocks/              # FSE block registration
│   ├── graphql/             # GraphQL resolvers
│   └── utils/               # Utility classes (Vite loader, etc.)
│
├── src/                     # React/TypeScript source
│   ├── blocks/              # FSE block components (React)
│   ├── components/          # Shared React components
│   │   └── ui/              # UI component library
│   └── styles/              # Tailwind CSS v4
│       └── main.css         # Main stylesheet
│
├── dist/                    # Build output (generated)
│
├── templates/               # FSE templates
├── parts/                   # FSE template parts (header, footer)
├── patterns/                # Block patterns
│
├── style.css                # Theme header
├── functions.php            # Main theme loader
├── theme.json               # FSE configuration
├── package.json             # Node.js dependencies
├── vite.config.ts           # Vite build configuration
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Development Setup

### Prerequisites

- **PHP**: 8.1+
- **Node.js**: 18+
- **WordPress**: 6.4+
- **WPGraphQL**: Installed and activated

### Installation

```powershell
# Navigate to theme directory
cd wp-content/themes/musicalwheel-fse

# Install Node.js dependencies
npm install

# Start Vite dev server (with HMR)
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start Vite dev server (localhost:3000) with HMR
- `npm run build` - Production build to dist/
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format code with Prettier

## 🎨 Design System (theme.json)

### Color Palette

- **Primary**: #2563eb (Blue)
- **Secondary**: #7c3aed (Purple)
- **Accent**: #f59e0b (Amber)
- **Base**: #ffffff (White)
- **Contrast**: #0f172a (Dark Slate)
- **Neutral Scale**: 50-900 (Slate gray)

### Typography

- **System Font**: Apple/Windows system fonts
- **Serif**: Georgia
- **Monospace**: Courier New
- **Sizes**: xs (0.75rem) → 5xl (3rem)

### Spacing Scale

Based on Tailwind spacing: 0, 1 (0.25rem), 2 (0.5rem), 3 (0.75rem), 4 (1rem), 5, 6, 8, 10, 12, 16, 20, 24

### Layout

- **Content Width**: 800px
- **Wide Width**: 1200px

## 🏗️ Architecture Patterns (from Voxel Discovery)

### OOP Wrapper System

Following Voxel's approach, we wrap WordPress primitives with rich OOP classes:

```php
namespace MusicalWheel\Post_Types;

class MW_Post_Type {
    private $wp_post_type;   // WP_Post_Type object
    private $repository;      // Configuration storage
    private $fields;          // Field manager
    private $filters;         // Search filters
    
    public function get_key() {}
    public function get_label() {}
    public function get_fields() {}
    public function is_managed_by_mw() {}
}
```

### Repository Pattern

Configuration stored in `wp_options` as JSON:

- Option key: `mw_post_type_{slug}`
- Contains: labels, supports, fields, filters, settings
- Centralized configuration management

### Field System

26+ field types (matching Voxel's architecture):

- Text, Email, Phone, URL, Number, Color
- Select, Multiselect, Switcher, Taxonomy
- Date, Time, Recurring Date, Work Hours
- File, Image
- Post Relation, Product
- Location
- Repeater
- UI Fields (Heading, HTML, Image, Step)

### Dual Interface

All fields support:

1. **Backend Admin**: WordPress meta boxes
2. **Frontend Submission**: React-based forms

## 🔌 GraphQL Integration

All CPTs exposed via GraphQL:

```php
'show_in_graphql' => true,
'graphql_single_name' => 'artist',
'graphql_plural_name' => 'artists',
```

Custom GraphQL resolvers for:

- Template parts (header, footer)
- Block templates (single, archive)
- theme.json data
- Custom fields
- Search filters

## 📝 Naming Conventions

Following **Rule 14** (Multisite - Prefix All Custom Code):

- Functions: `mw_*`
- CPTs: `mw_*`
- Meta keys: `_mw_*`
- Options: `mw_*`
- Namespaces: `MusicalWheel\*`

## 🧩 Key Features

- ✅ Full Site Editing (FSE) support
- ✅ Vite with Hot Module Replacement (HMR)
- ✅ Tailwind CSS v4 (CSS-first approach)
- ✅ TypeScript strict mode
- ✅ React for all interactive components
- ✅ GraphQL-first architecture
- ✅ Custom Post Types with OOP wrappers
- ✅ 26+ field types with dual interfaces
- ✅ Modular addon system (6 core addons planned)
- ✅ Block patterns and templates

## 🎯 Implementation Status

### ✅ Completed (Foundation)

- [x] Directory structure
- [x] Theme header files (style.css, functions.php)
- [x] FSE configuration (theme.json)
- [x] Color palette, typography, spacing

### 🚧 In Progress

- [ ] Node.js setup (package.json, TypeScript)
- [ ] Vite configuration
- [ ] Tailwind CSS v4 setup
- [ ] Vite Asset Loader (PHP class)
- [ ] Post_Type wrapper class
- [ ] CPT Repository class

### 📋 Planned (Next Steps)

- [ ] Base field system (10 core field types)
- [ ] FSE blocks (Timeline, Collections, etc.)
- [ ] GraphQL resolvers
- [ ] 6 Core Addons:
  - Paid Memberships
  - Paid Listings
  - Direct Messages
  - Collections
  - Product Type (E-commerce)
  - Timeline (Social feed)

## 📚 Documentation

- **Discovery Report**: `wp-content/docs/VOXEL_DISCOVERY_REPORT.md`
- **Implementation Plan**: `wp-content/docs/AI_AGENT_IMPLEMENTATION_PLAN_v3.7.md`
- **Warp AI Rules**: `wp-content/docs/WARP_AI_RULES_v4.0_SIMPLIFIED.md`

## 🔗 Related Repositories

This theme is part of a two-repository architecture:

1. **WordPress FSE Theme** (this repo) - Backend and block editor
2. **Next.js Frontend** (separate repo) - Headless frontend on Vercel

## 📄 License

GNU General Public License v2 or later

## 🤝 Contributing

This is a private project for the MusicalWheel music industry ecosystem.

---

**Version**: 0.1.0  
**Last Updated**: 2025-11-04  
**Status**: Foundation Complete, Node.js Setup Next
