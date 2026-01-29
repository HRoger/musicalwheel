# MusicalWheel - WordPress FSE Platform

**WordPress-based directory platform built on Voxel theme with custom FSE child theme extensions.**

---

## 🏗️ Current Architecture

**Strategy:** All-in child theme (following Voxel's "everything in the theme" philosophy)

**Main codebase:** `themes/voxel-fse/`
- FSE child theme extending Voxel parent theme
- OOP controller pattern for core functionality
- Vite build system for modern block development
- Dynamic data system with VoxelScript parser
- Custom FSE template management

**No separate plugin** - All functionality consolidated into the child theme for:
- Simpler maintenance
- Avoiding autoloader conflicts
- Following Voxel's architectural approach
- Better integration with theme features

---

## 📁 Repository Structure

This repository tracks **only the custom WordPress content**, not the entire WordPress installation:

```
musicalwheel/
├── docs/                           # 📚 Project documentation
│   ├── README.md                   # Documentation index
│   ├── CHANGELOG.md                # Notable changes and migration notes
│   ├── voxel-discovery/            # Voxel theme analysis and discoveries
│   ├── voxel-dynamic-tag-builder/  # Dynamic tag implementation docs
│   ├── voxel-widget-block-conversion/ # Widget conversion reference
│   ├── project-log/                # Development logs and task artifacts
│   ├── roadmap/                    # Implementation plans
│   └── deployment/                 # Deployment guides
│
├── themes/
│   ├── voxel/                      # 🎨 Voxel parent theme (reference)
│   └── voxel-fse/                  # 🎨 MusicalWheel FSE child theme
│       ├── functions.php           # Theme initialization
│       ├── app/
│       │   ├── controllers/        # OOP controllers
│       │   │   ├── fse-base-controller.php
│       │   │   └── fse-templates/  # FSE template controllers
│       │   ├── blocks/             # Custom Gutenberg blocks
│       │   │   ├── Block_Loader.php
│       │   │   └── src/            # Block source files
│       │   ├── dynamic-data/       # VoxelScript parser & data groups
│       │   │   ├── parser/         # Tokenizer, Renderer
│       │   │   ├── data-groups/    # Post, User, Site, Term
│       │   │   └── modifiers/      # Text, number, date, control modifiers
│       │   ├── modules/            # Feature modules (courses, etc.)
│       │   └── utils/              # Utility functions
│       ├── assets/                 # Compiled assets
│       └── vite.blocks.config.js   # Vite build configuration
│
└── plugins/                        # 🔌 Third-party plugins only
```

### What's Tracked in Git

✅ **Included:**
- `docs/` - All project documentation
- `themes/voxel-fse/` - Custom FSE child theme
- Root configuration files (`.gitignore`, `README.md`)

❌ **Excluded:**
- WordPress core files (`wp-admin/`, `wp-includes/`)
- Parent Voxel theme files (managed separately)
- `uploads/` folder (user-generated content)
- `node_modules/`, `vendor/` directories
- Database files (`.sql`, `.sql.gz`)
- Cache and temporary files
- Environment files (`.env`, `wp-config-local.php`)

---

## 🚀 Local Development Setup

### Prerequisites

- **Local by Flywheel** (or similar local WordPress environment)
- **WordPress 6.4+**
- **PHP 8.1+**
- **Node.js 18+** (for block development with Vite)
- **Composer** (for PHP dependencies)
- **Voxel Theme** (parent theme)

### Initial Setup

1. **Clone this repository:**
   ```bash
   cd "path/to/Local Sites/musicalwheel/app/public"
   git clone https://github.com/HRoger/musicalwheel.git .
   ```

2. **Install Node dependencies:**
   ```bash
   cd wp-content/themes/voxel-fse
   npm install
   ```

3. **Build blocks:**
   ```bash
   # Build all blocks and frontend scripts (production)
   npm run build

   # Build only editor blocks (ES modules)
   npm run build:blocks

   # Build only frontend scripts (IIFE format)
   npm run build:frontend

   # Build specific block frontend (fast)
   npm run build:frontend:search-form
   npm run build:frontend:create-post
   # ... etc (34 blocks available)

   # Development mode with watch
   npm run dev
   ```

4. **Configure WordPress:**
   - Set up `wp-config.php` with your local database credentials
   - Install and activate Voxel parent theme
   - Activate voxel-fse child theme
   - Import database (if provided separately)

---

## 🎨 Key Features

### FSE Template System
- **OOP Controller Pattern**: Clean, maintainable code following Voxel's architecture
- **FSE_Base_Controller**: Custom base class avoiding parent theme conflicts
- **Template Management**: Full WordPress Site Editor integration
- **Custom Templates**: Product types, user profiles, search results

### Dynamic Data System
- **VoxelScript Parser**: Parse and render `@group(field)` expressions
- **Data Groups**: Post, User, Site, Term with extensible architecture
- **Modifiers**: 31+ modifiers (text, number, date, control structures)
- **Chaining**: Support for complex expressions like `@post(title).truncate(50).append(...)`

### Block System
- **Vite Build System**: Fast HMR for development
- **Auto-Discovery**: Automatic block registration from `app/blocks/src/*/block.json`
- **Modern Stack**: React, TypeScript, ESM format
- **Dynamic Content**: Integration with VoxelScript parser

### Custom Modules
- **Courses**: Course management addon
- **Product Types**: E-commerce functionality
- **Dynamic Tag Builder**: Visual editor for dynamic expressions

---

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start development server (for blocks):**
   ```bash
   cd themes/voxel-fse
   npm run dev
   ```

3. **Make changes to theme files**

4. **Test locally** in Local by Flywheel

5. **Run tests:**
   ```bash
   npm test                    # Run all tests
   npm run test:watch          # Run tests in watch mode
   npm run test:coverage       # Run tests with coverage report
   ```

6. **Type check (optional):**
   ```bash
   npm run type-check          # Check TypeScript types
   ```
   Note: Type errors don't prevent builds. The codebase has ~4700 type warnings from WordPress package definitions but builds successfully.

7. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

8. **Push to GitHub:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **PHP:** Follow [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- **Namespaces:** Use `VoxelFSE\` namespace for child theme code
- **Controllers:** Extend `FSE_Base_Controller` for OOP pattern
- **JavaScript:** Use ESLint with WordPress rules
- **CSS:** Modern CSS with BEM naming convention where applicable

### Avoiding Autoloader Conflicts

**Important:** The Voxel parent theme uses `locate_template()` for autoloading, which searches child theme first. To avoid conflicts:

- ✅ Use different filenames than parent (e.g., `fse-base-controller.php` not `base-controller.php`)
- ✅ Use different directory paths (e.g., `controllers/fse-templates/` not `controllers/templates/`)
- ✅ Use distinct namespaces (e.g., `VoxelFSE\Controllers` not `Voxel\Controllers`)

---

## 📚 Documentation

All project documentation is in the `docs/` folder:

- **[docs/README.md](docs/README.md)** - Documentation index and structure
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Notable changes and migration notes
- **[docs/voxel-discovery/](docs/voxel-discovery/)** - Voxel theme analysis and architectural discoveries
- **[docs/project-log/](docs/project-log/)** - Development logs and task artifacts
- **[docs/roadmap/](docs/roadmap/)** - Implementation plans and roadmaps
- **[docs/voxel-dynamic-tag-builder/](docs/voxel-dynamic-tag-builder/)** - Dynamic tag builder implementation

---

## 🎯 Project Status

### ✅ Completed

**Architecture Consolidation** (Nov 2025)
- Moved all functionality from plugin to child theme
- Switched from Webpack to Vite build system
- Implemented OOP controller pattern
- Fixed autoloader conflicts with parent theme
- Reorganized documentation structure

**Dynamic Data System**
- VoxelScript parser (tokenizer + renderer)
- Data groups: Post, User, Site, Term
- 31+ modifiers with full chaining support
- Control structures (if/then/else)
- Dynamic tag builder React component

**Block System**
- Vite-based build with HMR
- Auto-discovery block loader
- Example blocks: dynamic-text, dynamic-heading, create-post, product-price
- WordPress packages externalized for optimal bundle size

### 📋 Current Focus

**FSE Template System**
- Template editor integration
- Custom template types
- User profile templates
- Search result templates

### 🔮 Planned

**Phase 2: Product Types**
- Product type management
- Custom product fields
- E-commerce blocks
- Payment integration

**Future Enhancements**
- Timeline extended (social features)
- Chat system
- Live events
- External database integration (Supabase)

---

## 📦 What's NOT Included

### WordPress Core
WordPress core files should be installed separately:
- Download from [wordpress.org](https://wordpress.org/download/)
- Or use Local by Flywheel's automatic installation

### Parent Theme
Voxel theme files are not tracked in this repository. Install from:
- Official Voxel theme source

### Database
Database dumps are **not tracked** in git due to size and security.

To backup/restore:
```bash
# Export
wp db export backup-$(date +%Y%m%d).sql

# Import
wp db import backup-20250101.sql
```

### Uploads Folder
User-generated content (`wp-content/uploads/`) is excluded.

For deployment:
- Sync separately via SFTP/rsync
- Use a CDN for production assets

---

## 🔐 Security Notes

- **Never commit** `wp-config.php` or `.env` files
- **Never commit** database dumps with real user data
- **Never commit** API keys or secrets
- Use environment variables for sensitive configuration
- Keep WordPress core, plugins, and themes updated
- Follow WordPress security best practices

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following code standards
3. Test thoroughly locally
4. Update documentation if needed
5. Submit a pull request with clear description

---

## 📞 Support

For questions or issues:
- Check the [docs/](docs/) folder first
- Review relevant discovery documentation in `docs/voxel-discovery/`
- Check `docs/CHANGELOG.md` for recent changes
- Contact the development team

---

## 🔗 Related Links

- [WordPress Codex](https://codex.wordpress.org/)
- [WordPress Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [Voxel Theme Documentation](https://voxel.getstudio.co/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

**Last Updated:** January 2026
**WordPress Version:** 6.4+
**PHP Version:** 8.1+
**Node Version:** 18+
**Architecture:** All-in FSE Child Theme
