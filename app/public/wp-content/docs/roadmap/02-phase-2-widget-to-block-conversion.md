# Phase 2: Voxel Widget to FSE Block Conversion

**Version:** 3.0 (Widget Conversion Focus)
**Status:** Active - Current Task
**Architecture:** FSE Child Theme extending Voxel
**Current Block:** create-post (5,125 lines - most complex)
**Estimated Duration:** 20-25 days

---

## 📋 Overview

Phase 2 focuses on converting Voxel's Elementor widgets to WordPress FSE blocks. We're building a child theme that **uses Voxel's existing admin** (Vue.js) and **leverages all Voxel features** (product types, custom fields, payments, shipping, etc.) - no reimplementation needed.

**What We're NOT Doing:**
- ❌ Building a React admin interface (use Voxel's Vue.js admin)
- ❌ Porting Vue.js to React
- ❌ Implementing payments/marketplace/shipping (Voxel handles this)
- ❌ Creating custom post type management (Voxel's admin does this)

**What We ARE Doing:**
- ✅ Converting Voxel Elementor widgets → FSE blocks
- ✅ Building React/TypeScript block editor components
- ✅ Server-side rendering with PHP render.php files
- ✅ Integration with Voxel's existing data and features

---

## 🎯 Widget Conversion Strategy

### Priority Order

**1. Essential Blocks (Start Here)**
- **create-post** (5,125 lines) - CURRENT TASK
  - Most complex, but essential for content creation
  - MVP exists (basic structure only, NO full analysis yet)
  - Dependencies: All Voxel field types, file upload, validation
  - Full implementation: 15 days

- **product-price** (172 lines) - NEXT TASK
  - Simple display block
  - MVP exists (basic structure only, NO full analysis yet)
  - Enhance with full Voxel feature parity
  - Full implementation: 2-3 days

**2. Simple Utility Blocks (Build Momentum)**
- **image** (15 lines) - Simplest block
- **print-template** (50 lines)
- **nested-tabs** (139 lines)
- **nested-accordion** (155 lines)
- **template-tabs** (179 lines)
- **ring-chart** (187 lines)
- **countdown** (299 lines)

**3. User Interface Blocks**
- **login** (2,929 lines)
- **user-bar** (1,165 lines)
- **navbar** (1,183 lines)

**4. E-Commerce Blocks**
- **product-form** (2,581 lines)
- **cart-summary** (2,732 lines)
- **orders** (2,551 lines)

**5. Search & Discovery**
- **search-form** (4,295 lines)
- **quick-search** (1,629 lines)
- **post-feed** (1,638 lines)
- **term-feed** (721 lines)

**6. Interactive Blocks**
- **timeline** (662 lines)
- **timeline-kit** (715 lines)
- **popup-kit** (1,636 lines)
- **booking-calendar** (1,641 lines)

**7. Display Blocks**
- **gallery** (1,031 lines)
- **slider** (759 lines)
- **map** (1,315 lines)
- **advanced-list** (1,184 lines)

**8. Analytics & Charts**
- **bar-chart** (1,062 lines)
- **visits-chart** (1,103 lines)
- **review-stats** (284 lines)
- **work-hours** (796 lines)

---

## 🏗️ Block Conversion Process

### Block Complexity Tiers

**Simple Blocks (<200 lines):**
- Read widget → Code immediately
- No formal documentation needed
- Inline comments only
- Examples: image, print-template, nested-tabs

**Medium Blocks (200-1000 lines):**
- Read widget → Code immediately
- No formal documentation needed
- Inline comments for complex logic
- Examples: countdown, ring-chart, work-hours

**Complex Blocks (1000+ lines or multi-session):**
- Requires lightweight documentation for session continuity
- Create progress tracker + decision notes
- Examples: create-post, product-form, search-form, login

---

### For Simple & Medium Blocks

**Process (no documentation):**
1. Read Voxel widget PHP file
2. Code block structure (block.json + TypeScript)
3. Implement editor component
4. Implement render.php
5. Test and commit

---

### For Complex Blocks Only

**Step 1: Quick Analysis (1-2 hours)**
Create lightweight progress tracker in `docs/conversions/block-name-progress.md`:
```markdown
# Block Name Progress

## Widget Features (from widget reading)
- [ ] Feature 1
- [ ] Feature 2
...

## Implementation Status
- ✅ Basic structure
- 🔄 Feature currently working on
- ⏳ Not started

## Key Decisions/Notes
- Important finding at line X
- Voxel integration note
```

**Step 2-5:** Same as simple blocks but with progress tracker updates

---

## 📅 Current Task: create-post Block

### Overview
Converting Voxel's most complex widget (5,125 lines) to FSE block. This block handles:
- Multi-step form for creating posts/products
- All Voxel field types (text, number, file, location, repeater, etc.)
- File uploads with drag & drop
- Form validation (frontend & backend)
- AJAX submission
- Success/error handling
- Post status management
- Category/taxonomy selection

### Why Start Here?
- Essential for content creation workflow
- Once complete, provides pattern for other form blocks
- Tests all integration points with Voxel
- MVP exists as foundation

### Implementation Plan

**Day 1-2: Analysis & Setup**
- ✅ MVP exists with basic structure
- Read full Voxel widget implementation
- Map all widget controls to block attributes
- Document required Voxel APIs
- Plan state management approach

**Day 3-5: Editor Component**
- Build InspectorControls with all settings
- Implement form field configuration UI
- Add DynamicTagBuilder for dynamic content
- Preview component showing form structure

**Day 6-10: Field Rendering System**
- Text/textarea fields
- Number fields with validation
- Select/radio/checkbox fields
- File upload (single & multiple)
- Image upload with preview
- Location field with map integration
- Date/time pickers
- Repeater fields (nested)
- Relation fields (connect to other posts)
- Work hours fields

**Day 11-13: Form Submission**
- AJAX submission handler
- Server-side validation
- File upload processing
- Post creation via Voxel APIs
- Meta field storage
- Taxonomy assignment
- Error handling & user feedback

**Day 14-15: Testing & Polish**
- Test all field types
- Test file uploads
- Test validation
- Test with different post types
- Fix bugs
- Optimize performance
- Documentation

### Technical Challenges

**1. File Uploads**
- Handle multipart/form-data
- Progress tracking
- Error handling
- File type validation
- Size limits
- Integration with Voxel's file handling

**2. Field Type System**
- Support 11+ Voxel field types
- Conditional field visibility
- Field dependencies
- Repeater fields (nested fields)
- Relation fields (query posts/users)

**3. Validation**
- Client-side validation (React Hook Form)
- Server-side validation (PHP)
- Real-time error display
- Required field checks
- Custom validation rules

**4. State Management**
- Multi-step form state
- File upload state
- Error state
- Loading states
- Form data persistence (draft support?)

---

## 📦 Block Architecture

### Block Categories
All blocks registered under `voxel-fse` category:
- **voxel-fse-forms** - Form blocks (create-post, product-form)
- **voxel-fse-commerce** - E-commerce (cart, orders, product-price)
- **voxel-fse-social** - Social features (timeline, user-bar)
- **voxel-fse-content** - Content display (post-feed, gallery)
- **voxel-fse-layout** - Layout utilities (tabs, accordion)

### Voxel Integration Points

**1. Product Types & Custom Fields**
- Access via Voxel's Post_Type classes
- Read field definitions from Voxel admin
- Use Voxel's field rendering system
- Store data in Voxel's meta structure

**2. File Uploads**
- Use Voxel's file upload APIs
- Leverage Voxel's media handling
- Follow Voxel's storage conventions

**3. Permissions**
- Check Voxel's permission system
- Respect post type capabilities
- Honor visibility rules

**4. Templates**
- Use Voxel's template utilities
- Apply Voxel's template variables
- Integrate with VoxelScript parser

---

## 🛠️ Development Tools

### Build System
```bash
# Development (watch mode)
npm run build:blocks -- --watch

# Production build
npm run build:blocks

# Type checking
npm run type-check
```

### Testing Blocks
1. Load WordPress editor
2. Insert block from "Voxel FSE" category
3. Configure block settings
4. Preview in editor
5. Save and view on frontend
6. Test all interactive features

### Debugging
- Browser DevTools for React components
- WordPress Debug Bar for PHP rendering
- Network tab for AJAX requests
- PHP error logs for server-side issues

---

## 📊 Progress Tracking

### Completed
- ✅ Build system configured (Vite + externals)
- ✅ Import maps for WordPress packages
- ✅ Block_Loader auto-discovery
- ✅ create-post MVP (basic structure only - NO analysis/implementation yet)
- ✅ product-price MVP (basic structure only - NO analysis/implementation yet)

### In Progress
- 🔄 create-post full implementation (Day 1-15)
  - Step 1: Analysis NOT started yet
  - Need to read 5,125 line Voxel widget
  - Map all controls to block attributes

### Upcoming (New Priority Order)
- ⏳ product-price full implementation (2-3 days)
- ⏳ Simple utility blocks (image, print-template, tabs, etc.)
- ⏳ User interface blocks (login, user-bar, navbar)
- ⏳ E-commerce blocks (product-form, cart, orders)
- ⏳ (30+ blocks remaining)

---

## 🎓 Learning Resources

### Voxel Documentation
- `docs/voxel-discovery/` - Architecture analysis
- `docs/voxel-documentation/` - Feature specs
- `docs/voxel-widget-block-conversion/` - Conversion reference

### WordPress Block Development
- [Block Editor Handbook](https://developer.wordpress.org/block-editor/)
- [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts)
- [Block.json Schema](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)

### Voxel Widget Code
- `themes/voxel/app/widgets/` - All widget PHP files
- `themes/voxel/templates/widgets/` - Widget templates

---

## 📝 Documentation Guidelines

**For Simple & Medium Blocks:**
- ❌ No pre-implementation documentation
- ✅ Inline code comments only
- ✅ Optional: End-user usage guide if block is non-obvious

**For Complex Blocks (1000+ lines):**
- ✅ Lightweight progress tracker (`docs/conversions/block-name-progress.md`)
  - Feature checklist
  - Implementation status
  - Key decisions/notes
- ✅ End-user usage guide after completion

**Optional (if genuinely useful):**
- Block reference guides for end users
- API integration notes if discovering new Voxel patterns
- Conversion notes if something was particularly tricky

**Never Create:**
- Formal analysis documents
- Detailed conversion plans before starting
- Documentation for the sake of documentation

---

## 🚀 Success Criteria

**Phase 2 Complete When:**
- All high-priority blocks converted (create-post, product-price, simple utility blocks)
- Medium-priority blocks converted (user interface, e-commerce, search blocks)
- All blocks tested and documented
- **Blocks render with FULL functionality inside WordPress editor** (not just frontend)
- Blocks provide accurate preview in editor matching frontend output
- No regressions in Voxel functionality
- Performance acceptable (blocks load fast)
- Code quality high (TypeScript strict mode, ESLint passing)

**Estimated Completion:** 20-25 days for high + medium priority blocks
**Full Widget Coverage:** 40-50 days for all 35+ widgets

---

**Created:** November 2025
**Last Updated:** November 2025
**Architecture Version:** 3.0 (Widget-to-Block Conversion)
**Current Block:** create-post (Day 1)
