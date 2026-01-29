# TailwindUI HTML Components Reference

**Version:** 1.0  
**Date:** November 2, 2025  
**Purpose:** Pure HTML + Tailwind CSS styling patterns for AI agent conversion to MusicalWheel FSE blocks

---

## 📁 Project Structure

```
tailwindui-components/
├── html/
│   ├── application-ui/          # Application UI Components (10 categories)
│   ├── ecommerce/               # Ecommerce Components
│   └── marketing/               # Marketing Sections + Elements
├── README.md                    # This file
└── component-hierarchy.md       # AI agent component selection rules
```

---

## 🎯 Purpose

This folder contains TailwindUI HTML components that serve as **styling reference patterns** for AI agents to convert into:

1. **UntitledUI React components** (Tier 1 - Primary)
2. **WordPress FSE blocks** (with `block.json` + React Edit components)
3. **MusicalWheel custom blocks** (Voxel-integrated features)

---

## 📚 Component Categories

### Application UI (10 Categories)

Component-level UI patterns for web applications:

| Category | Description | Use Cases |
|----------|-------------|-----------|
| **application-shells** | Complete app layout structures | Dashboard layouts, admin panels |
| **data-display** | Data presentation patterns | Stats, badges, descriptions, key-values |
| **elements** | Basic UI building blocks | Buttons, avatars, dropdowns, toggles |
| **feedback** | User feedback components | Alerts, progress bars, empty states, loading |
| **forms** | Form components and layouts | Input groups, validation, multi-step forms |
| **headings** | Page and section headers | Page titles, section dividers, card headers |
| **layout** | Layout primitives | Containers, panels, dividers, spacing |
| **lists** | List patterns | Stacked lists, grid lists, tables, feeds |
| **navigation** | Navigation components | Navbars, tabs, breadcrumbs, pagination, sidebars |
| **overlays** | Overlay components | Modals, slide-overs, notifications, dialogs |

### Ecommerce (Components Only)

Product and shopping components for marketplace features:

- Product cards (grid, list views)
- Product quick views
- Shopping cart items
- Cart summaries
- Category filters
- Product image galleries
- Review components
- Wishlist items

### Marketing

#### Sections (16 Types)

Marketing page sections for landing pages and promotional content:

| Section Type | Description | Use Cases |
|--------------|-------------|-----------|
| **bento-grids** | Modern grid layouts | Feature showcases, service grids |
| **blog-sections** | Blog post displays | Latest posts, featured articles |
| **contact-sections** | Contact forms and info | Contact pages, support sections |
| **content-sections** | Text-heavy content | About sections, story sections |
| **cta-sections** | Call-to-action sections | Sign-up prompts, conversion sections |
| **faq-sections** | FAQ accordions | Help sections, product FAQs |
| **feature-sections** | Feature showcases | Product features, service highlights |
| **footers** | Website footers | Site navigation, legal links, social |
| **header** | Website headers | Site-wide navigation, branding |
| **heroes** | Hero sections | Homepage heroes, landing page headers |
| **logo-clouds** | Logo grids | Client logos, partner showcases |
| **newsletter-sections** | Newsletter signups | Email capture, subscription forms |
| **pricing** | Pricing tables | Subscription plans, service pricing |
| **stats-sections** | Statistics displays | Metrics, achievements, impact numbers |
| **team-sections** | Team member displays | About us, team pages |
| **testimonials** | Customer testimonials | Social proof, reviews, quotes |

#### Elements (3 Types)

Marketing page elements:

- **banners** - Announcement banners, cookie consent
- **flyout-menus** - Mega menus, dropdown navigation
- **headers** - Marketing site headers with navigation

---

## 🤖 AI Agent Usage Guidelines

### Component Selection Priority (Tier System)

**Tier 1 - UntitledUI React Free (Primary)**  
Check if component exists in UntitledUI React free tier first.

**Tier 2 - TailwindUI HTML → React Conversion (Secondary)**  
Use this folder when UntitledUI doesn't have the component. AI converts HTML to React + FSE blocks.

**Tier 3 - shadcn/ui (Gap Filler)**  
For components missing in Tier 1 & 2.

**Tier 4 - Flowbite React (Last Resort)**  
Marketing mega menus, timelines, niche components.

### Conversion Workflow

```
1. Locate TailwindUI HTML component
   ↓
2. Reference HTML structure + Tailwind classes
   ↓
3. Convert to React using UntitledUI React patterns
   ↓
4. Preserve all Tailwind CSS classes
   ↓
5. Wrap as WordPress FSE block (block.json + Edit.tsx + render.php)
   ↓
6. Add WPGraphQL integration for dynamic data
```

### Example AI Prompt

```markdown
Reference: docs/design-system/tailwindui-components/html/application-ui/forms/form-layouts.html

Convert "Simple Contact Form" to:
1. React component using UntitledUI React <Input> and <Button>
2. WordPress FSE block (vxfse/contact-form)
3. Keep all Tailwind classes: space-y-8, rounded-md, border-gray-300
4. Add WPGraphQL mutation for form submission to Voxel CPT
5. Add block attributes: formTitle, submitButtonText, successMessage

Output:
- src/blocks/contact-form/block.json
- src/blocks/contact-form/Edit.tsx
- src/blocks/contact-form/render.php
- src/blocks/contact-form/index.tsx
```

---

## 📋 Common Component Mappings

### Forms
| TailwindUI HTML | UntitledUI React | FSE Block |
|-----------------|------------------|-----------|
| Input groups | `<Input>` | `vxfse/input-field` |
| Form layouts | `<Form>` + `<Input>` + `<Button>` | `vxfse/registration-form` |
| Validation patterns | `<Input error>` | `vxfse/validated-input` |

### Lists
| TailwindUI HTML | UntitledUI React | FSE Block |
|-----------------|------------------|-----------|
| Stacked lists | `<Card>` + `<Avatar>` | `vxfse/venue-list` |
| Grid lists | `<Grid>` + `<Card>` | `vxfse/artist-grid` |
| Tables | `<Table>` | `vxfse/data-table` |

### Navigation
| TailwindUI HTML | UntitledUI React | FSE Block |
|-----------------|------------------|-----------|
| Navbars | `<Navigation>` + `<Button>` | `vxfse/main-nav` |
| Tabs | `<Tabs>` | `vxfse/content-tabs` |
| Breadcrumbs | `<Breadcrumb>` | `vxfse/breadcrumbs` |

### Marketing
| TailwindUI HTML | UntitledUI React | FSE Block |
|-----------------|------------------|-----------|
| Hero sections | `<Container>` + `<Heading>` + `<Button>` | `vxfse/hero-section` |
| Feature sections | `<Grid>` + `<Card>` + `<Icon>` | `vxfse/features` |
| Testimonials | `<Card>` + `<Avatar>` + `<Quote>` | `vxfse/testimonial` |
| Pricing tables | `<Card>` + `<Badge>` + `<Button>` | `vxfse/pricing-table` |

---

## 🎨 Styling Notes

### Tailwind CSS Classes
- **All components use Tailwind utility classes** - preserve these during conversion
- **Responsive breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Dark mode**: Some components include `dark:` classes
- **Spacing**: Uses Tailwind spacing scale (0-96)
- **Colors**: Uses Tailwind color palette (gray, blue, indigo, etc.)

### Component Customization
- Replace color classes to match MusicalWheel brand
- Adjust spacing for specific layouts
- Add custom animations if needed
- Extend with Alpine.js/React for interactivity

---

## 📦 What Was Removed

To optimize for AI agent usage, the following were removed:

- ❌ `application-ui/page-examples/` - Full page templates
- ❌ `ecommerce/page-examples/` - Complete ecommerce pages
- ❌ `marketing/page-examples/` - Full marketing pages (about, landing, pricing)
- ❌ `marketing/feedback/404-pages/` - Error page templates

**Reason:** Page examples are too opinionated. AI agents build custom pages from **component sections** based on Figma designs.

---

## 🔗 Related Files

- **component-hierarchy.md** - Complete tier system with component selection rules
- **docs/figma/** - Figma design tokens and export notes
- **docs/voxel-documentation/** - Voxel theme documentation for CPT integration
- **AI_AGENT_IMPLEMENTATION_PLAN_v3.1.md** - Full implementation plan

---

## 🚀 Quick Start for AI Agents

### Warp.dev Workflow
```bash
# 1. Reference TailwindUI component
cat docs/design-system/tailwindui-components/html/application-ui/forms/form-layouts.html

# 2. Generate FSE block with AI
warp ai "Convert TailwindUI form layout to MusicalWheel FSE block with UntitledUI React components"

# 3. Validate output
npm run build
wp vxfse validate-block contact-form
```

### Cursor/Windsurf with Figma MCP
```javascript
// .cursorrules
{
  "designSystemPaths": [
    "docs/design-system/tailwindui-components/html/**/*.html",
    "docs/design-system/untitledui-react/**/*"
  ],
  "conversionTarget": "WordPress FSE blocks with UntitledUI React"
}
```

---

## 📝 Notes

- All components are **mobile-first responsive**
- No JavaScript dependencies (add with React/Alpine.js as needed)
- Designed for **copy-paste workflow**
- Compatible with Tailwind CSS v3.0+
- Fully accessible (WCAG 2.1 AA compliant)

---

## 🎯 MusicalWheel Specific Usage

### For November 15 AWS Demo
Priority components to convert:

1. **Forms** → User registration, venue submission, contact
2. **Lists** → Venue directory, artist listings, event feeds
3. **Navigation** → Main nav, user dashboard tabs
4. **Marketing/Heroes** → Homepage hero section
5. **Marketing/Features** → Platform features section
6. **Marketing/Testimonials** → User testimonials

### For December 31 Full Platform
Additional components:

- **Overlays** → Modals for bookings, slide-overs for profiles
- **Data Display** → Stats for user dashboards, metrics cards
- **Ecommerce** → Service marketplace, package listings
- **Marketing/Pricing** → Subscription plans, service tiers

---

**Last Updated:** November 2, 2025  
**Maintained by:** MusicalWheel Development Team  
**For Questions:** Reference AI_AGENT_IMPLEMENTATION_PLAN_v3.1.md
