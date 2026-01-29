# MusicalWheel Project - General Rules for AI Agents

**Project:** MusicalWheel WordPress Platform
**Architecture:** All-in FSE Child Theme (themes/voxel-fse/)
**Current Phase:** Phase 1 Complete ✅ | Phase 2 Starting 🚀

---

## Rule 0: READ CRITICAL INSTRUCTIONS FIRST ⚠️

Very important => DOCS folder default location: `app/public/wp-content/docs/`

**BEFORE ANY WORK:** Read `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` in the repository.

This document contains **mandatory, non-negotiable rules** including:

- Discovery-first methodology (NEVER guess implementation)
- 1:1 Voxel matching requirements
- Autoloader conflict prevention
- Evidence-based development
- What you are ABSOLUTELY FORBIDDEN from doing

**Failure to follow these instructions WILL result in broken implementations.**

---

## Rule 1: Discovery-First Methodology

**NEVER guess or assume ANY implementation details about the Voxel theme.**

### Discovery Workflow (MANDATORY)

```bash
# Step 1: Read existing documentation
cat docs/voxel-discovery/relevant-topic.md
cat docs/voxel-documentation/feature-name.md

# Step 2: Search ENTIRE Voxel theme (not subdirectories)
grep -r "feature_name" themes/voxel/
find themes/voxel -name "*feature*"

# Step 3: Read the actual Voxel source code
cat themes/voxel/path/to/found/file.php

# Step 4: Document your findings with evidence
# Example: "Found in themes/voxel/app/controllers/postTypes.php:234"
# Code snippet: [paste actual code]

# Step 5: Check for autoloader conflicts
ls themes/voxel/app/path/filename.php
# If file exists in parent, use different name in child!

# Step 6: Implement with 1:1 Voxel matching
# Match HTML structure, CSS classes, JS logic EXACTLY
```

**The Voxel theme code IS the specification. Read it, don't guess it.**

---

## Rule 2: 1:1 Voxel Matching

When implementing features that interact with or extend Voxel functionality:

### Match EXACTLY:

- ✅ HTML structure and DOM hierarchy
- ✅ CSS class names (including `ts-` prefix)
- ✅ JavaScript/Vue component logic
- ✅ SVG icons and markup
- ✅ Component methods and properties
- ✅ Data attributes (data-*)
- ✅ Event handlers and hooks
- ✅ Ajax endpoints and parameters

### DO NOT:

- ❌ Create "similar" implementations
- ❌ Use generic/simplified versions
- ❌ Assume structure based on other features
- ❌ Skip any Voxel patterns or conventions

**Why:** Voxel is a tightly-coupled system. Generic implementations will break integration.

---

## Rule 3: Autoloader Conflict Prevention

**Problem:** Voxel parent theme uses `locate_template()` which searches child theme FIRST. If child has same
filename/path as parent's autoloaded class, the parent class won't load.

### Prevention Rules:

**❌ NEVER create in child theme:**

- `app/controllers/base-controller.php` (parent has this)
- `app/controllers/templates/` directory (parent has this)
- Any file at same path as parent's autoloaded classes
- Any class using namespace `Voxel\` (that's for parent only)

**✅ ALWAYS use in child theme:**

- Different filenames: `fse-base-controller.php`, `fse-templates-controller.php`
- Different paths: `controllers/fse-templates/` not `controllers/templates/`
- Different namespace: `VoxelFSE\` not `Voxel\`
- `fse-` prefix for all controllers and directories

### Check Before Creating Files:

```bash
# Before creating: themes/voxel-fse/app/controllers/my-file.php
# Check if parent has it:
ls themes/voxel/app/controllers/my-file.php

# If exists, use different name:
# → app/controllers/fse-my-file.php
# OR different path:
# → app/controllers/my-features/my-file.php
```

---

## Rule 4: Evidence-Based Development

**Every claim about Voxel structure must include file path + line number.**

### ❌ FORBIDDEN Statements:

- "Voxel probably uses..."
- "Voxel should have..."
- "Typically Voxel does..."
- "Based on WordPress standards, Voxel likely..."

### ✅ REQUIRED Statements:

- "Voxel uses X in themes/voxel/app/file.php:123"
- "Found implementation at themes/voxel/app/controllers/class.php:45-67"
- "The structure in themes/voxel/templates/template.php:89 shows..."

### Provide Code Snippets:

Always include relevant code snippets from Voxel when referencing:

```php
// File: themes/voxel/app/controllers/example.php:123-130
public function example_method() {
    // Actual Voxel code here
}
```

---

## Rule 5: OOP Controller Pattern

**All controllers must extend `FSE_Base_Controller`** (NOT `Base_Controller`).

### Standard Pattern:

```php
<?php
namespace VoxelFSE\Controllers;

class My_Controller extends FSE_Base_Controller {

    protected function hooks() {
        $this->on( 'init', '@initialize' );
        $this->filter( 'the_content', '@modify_content' );
    }

    protected function dependencies() {
        require_once VOXEL_FSE_PATH . '/app/utils/helper.php';
    }

    protected function authorize() {
        return true; // or conditional logic
    }

    protected function initialize() {
        // Implementation
    }

    protected function modify_content( $content ) {
        // Implementation
        return $content;
    }
}
```

### Key Points:

- **Namespace:** `VoxelFSE\Controllers` (NOT `Voxel\Controllers`)
- **Extend:** `FSE_Base_Controller` (NOT `Base_Controller`)
- **Methods:** hooks(), dependencies(), authorize()
- **Helpers:** $this->on(), $this->filter(), $this->once()

---

## Rule 6: Vite Build System

**Use Vite for all block development** (NOT Webpack).

### Development Workflow:

```bash
cd themes/voxel-fse

# Install dependencies
npm install

# Development with HMR
npm run dev

# Production build
npm run build
```

### Block Auto-Discovery:

Blocks are automatically discovered from `app/blocks/src/*/block.json`:

```
app/blocks/src/
├── my-block/
│   ├── block.json      # Required: Block metadata
│   ├── index.tsx       # Required: Entry point
│   ├── edit.tsx        # Optional: Edit component
│   ├── save.tsx        # Optional: Save component
│   └── style.css       # Optional: Styles
```

**No manual registration needed** - `Block_Loader.php` handles it automatically.

---

## Rule 7: When In Doubt - STOP and ASK

**If you encounter ANY of these situations, STOP and ask the user:**

### Stop Immediately If:

- ❌ Cannot find evidence of Voxel feature in theme code
- ❌ Found multiple conflicting implementations in Voxel
- ❌ Unclear which Voxel pattern to match
- ❌ Need to create file that might conflict with parent
- ❌ Implementation requires modifying parent theme
- ❌ User requirements contradict Voxel patterns
- ❌ Missing critical information for 1:1 matching

### NEVER:

- Guess the implementation
- Assume based on "WordPress standards"
- Create generic/simplified version
- Proceed with partial information
- Make architectural decisions without user input

**Better to ask 10 questions than create 1 broken implementation.**

---

## Rule 8: Git Workflow

### Branch Naming:

- Must start with `claude/`
- Must end with matching session ID
- Example: `claude/widget-block-admin-edit-01QFNxVMQKA5kJcUbezzp8DP`

### Commit Messages:

Use heredoc format for proper formatting:

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

### Push with Retries:

```bash
# Always use -u flag
git push -u origin branch-name

# If network fails, retry up to 4 times with exponential backoff:
# Wait 2s, try again
# Wait 4s, try again
# Wait 8s, try again
# Wait 16s, try again
```

### Only Commit When:

- User explicitly requests
- Feature is complete and tested
- Before major architectural changes

---

## Rule 9: Project Structure Understanding

### All Functionality in Child Theme:

```
themes/voxel-fse/              # Everything goes here
├── functions.php              # Theme initialization
├── style.css                  # Child theme header
├── app/
│   ├── controllers/           # OOP controllers
│   │   ├── fse-base-controller.php
│   │   └── fse-templates/     # FSE templates
│   ├── blocks/                # Gutenberg blocks
│   │   ├── Block_Loader.php   # Auto-discovery
│   │   └── src/               # Block source (React/TS)
│   ├── dynamic-data/          # VoxelScript parser
│   │   ├── parser/            # Tokenizer, Renderer
│   │   ├── data-groups/       # Post, User, Site, Term
│   │   └── modifiers/         # 31+ modifiers
│   ├── modules/               # Feature modules
│   └── utils/                 # Utility functions
├── assets/                    # Compiled assets
└── vite.blocks.config.js      # Vite build config
```

### No Separate Plugin:

- ❌ Do NOT create files in `wp-content/plugins/musicalwheel-core/`
- ✅ All functionality goes in `themes/voxel-fse/`
- This is an **all-in child theme** architecture

---

## Rule 10: Documentation Hygiene

### Always Check Memory:

```bash
cat .mcp-memory/memory.json
```

Contains project knowledge graph - read before starting work.

### Update Documentation When:

- Making architectural changes
- Discovering new Voxel patterns
- Solving complex problems
- Creating new features

### Documentation Structure:

```
docs/
├── AI-AGENT-CRITICAL-INSTRUCTIONS.md  ⚠️ READ FIRST
├── CHANGELOG.md                       Project changelog
├── project-log/                       Session logs
├── voxel-discovery/                   Voxel analysis
├── voxel-documentation/               Voxel specs (160+ files)
├── voxel-build-admin-ui/              Admin UI patterns
├── voxel-widget-block-conversion/     Widget→Block reference
├── voxel-dynamic-tag-builder/         Dynamic tags
└── roadmap/                           Phase plans
```

**CLAUDE.md** - Quick reference guide for Claude Code sessions

---

### Rule 11: HTML Class Naming Convention

MANDATORY: Every HTML element must have a semantic class name that describes its content or purpose. Never output bare
HTML tags without classes.

Rules:

- All wrapper divs, sections, and container elements require a class name
- Class names must be semantic and describe the element's content or function
- Use BEM methodology (Block__Element--Modifier) or clear descriptive names
- Avoid generic names like "wrapper", "container", or "box" without context

Examples:

WRONG:
<div>
  <span>Text</span>
</div>

CORRECT:
<div class="artist-profile">
  <span class="artist-profile__name">Text</span>
</div>

WRONG:
<section>
  <div>Content</div>
</section>

CORRECT:
<section class="event-listing">
  <div class="event-listing__card">Content</div>
</section>

Exception: Only skip class names for semantic HTML5 elements when their purpose is self-evident and they're not styled (
e.g., <main>, <article>, <header> in specific contexts). When in doubt, add a class.


---

## Rule 12: Do not delete the following files!

- voxel-fse\assets\dist\voxel-fse-commons.css

---

## Rule 13: Php inline code standard

```bash

<php_inline_code_standard>
When generating PHP code that includes inline JavaScript or CSS, you MUST use the nowdoc syntax for embedding multi-line code blocks. This ensures no variable interpolation occurs and maintains clean, readable code.

## Required Syntax Pattern

Always use this exact format:

For JavaScript blocks:
$variable_name = <<<'JAVASCRIPT'
// JavaScript code here
JAVASCRIPT;

For CSS blocks:
$variable_name = <<<'CSS'
/* CSS code here */
CSS;

## Why This Matters

The single quotes around the identifier ('JAVASCRIPT', 'CSS') create a nowdoc string that:
- Prevents accidental variable interpolation within the embedded code
- Eliminates the need to escape dollar signs or quotes in JavaScript/CSS
- Improves code readability and maintainability
- Matches WordPress and modern PHP best practices

## Examples

Correct implementation:


```

## Rule 14: Avoid `!important` in CSS. Use body-scoped selectors for specificity. Only use
`!important` as a last resort when all other methods fail.

# CSS Specificity Rule for LLM

## Rule: Avoid `!important` in CSS. Use body-scoped selectors for specificity. Only use
`!important` as a last resort when all other methods fail.

### Requirements

- **Preferred**: Prefix all class and ID selectors with `body` to increase specificity naturally
- **Format**: `body .classname { }` or `body #idname { }` (note the space between body and selector)
- **Last Resort**: Use `!important` only when no other solution works (see exceptions below)

### Examples

**✅ Preferred approach:**

```css
body .my-element {
    color: red;
}

body #header {
    background: blue;
}
```

**⚠️ Last resort (use only when necessary):**

```css
.utility-hidden {
    display: none !important; /* Utility class must always apply */
}

.override-inline {
    color: blue !important; /* Overriding inline styles you cannot control */
}
```

### When `!important` Is Acceptable

Use `!important` **only** in these specific cases:

1. **Overriding third-party libraries/frameworks** - When you cannot modify the source CSS and need to override their
   styles
2. **Overriding inline styles** - When dealing with JavaScript-injected inline styles you cannot control
3. **Utility classes** - For helper classes that must always apply (e.g., `.hidden`, `.text-center`)
4. **Print stylesheets** - When media query styles need to override screen styles
5. **Quick prototyping** - Temporary use during development (must be refactored before production)

### Additional Guidance

- Always try to solve specificity issues through proper CSS organization first
- If `body` prefix is insufficient, use more specific parent selectors (e.g., `body.page-template .classname`)
- For deeply nested specificity issues, chain parent selectors instead of using `!important`
- **Document any `!important` usage** with a comment explaining why it's necessary
- This approach maintains clean, maintainable CSS without fighting specificity wars

### Why Avoid `!important`

- Breaks the natural CSS cascade
- Creates "specificity arms race" where more `!important` rules are needed to override previous ones
- Makes CSS harder to maintain and debug
- Causes conflicts in team environments
- Considered an anti-pattern in modern CSS

### Rationale

The `body` prefix increases specificity to (0,1,1) for classes and (1,0,1) for IDs, which typically overrides default
plugin/theme styles without the maintenance burden of `!important` declarations. Only escalate to `!important` when
facing constraints outside your control (third-party code, inline styles, etc.).


---

## Rule 14: OOP Architecture & Code Quality Standards

**All new code MUST follow OOP principles, include unit tests, and adhere to WordPress coding standards.**

### OOP Architecture Requirements:

**✅ ALWAYS:**

- Use object-oriented programming (OOP) for all new features
- Extend `FSE_Base_Controller` for all controllers
- Follow SOLID principles (Single Responsibility, Open/Closed, etc.)
- Use dependency injection where applicable
- Implement proper encapsulation (public, protected, private methods)
- Use type declarations for method parameters and return types (PHP 8.1+)

**❌ NEVER:**

- Write procedural code for new features (unless in simple helper functions)
- Create global functions outside of classes
- Use global variables
- Skip type declarations on methods
- Mix concerns in a single class

### Class Structure Standards:

```php
<?php
namespace VoxelFSE\Feature;

/**
 * Feature description.
 *
 * @since 1.0.0
 */
class My_Feature_Class extends \VoxelFSE\Controllers\FSE_Base_Controller {

    /**
     * Class constructor.
     *
     * @since 1.0.0
     */
    public function __construct() {
        parent::__construct();
    }

    /**
     * Register hooks.
     *
     * @since 1.0.0
     * @return void
     */
    protected function hooks(): void {
        $this->on( 'init', '@initialize' );
        $this->filter( 'the_content', '@modify_content' );
    }

    /**
     * Initialize feature.
     *
     * @since 1.0.0
     * @return void
     */
    protected function initialize(): void {
        // Implementation
    }

    /**
     * Modify post content.
     *
     * @since 1.0.0
     * @param string $content The post content.
     * @return string Modified content.
     */
    protected function modify_content( string $content ): string {
        // Implementation
        return $content;
    }
}
```

### Unit Testing Requirements:

**Every new feature MUST include unit tests.**

**Testing Framework:**

- PHPUnit for PHP code
- Jest for JavaScript/TypeScript code

**Test Coverage Requirements:**

- Minimum 80% code coverage for new features
- 100% coverage for critical business logic
- All public methods must have tests
- Edge cases and error conditions must be tested

**Test Structure:**

```php
<?php
namespace VoxelFSE\Tests\Feature;

use PHPUnit\Framework\TestCase;
use VoxelFSE\Feature\My_Feature_Class;

class My_Feature_Class_Test extends TestCase {

    protected $feature;

    protected function setUp(): void {
        parent::setUp();
        $this->feature = new My_Feature_Class();
    }

    /** @test */
    public function it_modifies_content_correctly() {
        $input = 'Test content';
        $expected = 'Modified content';

        $result = $this->feature->modify_content( $input );

        $this->assertEquals( $expected, $result );
    }

    /** @test */
    public function it_handles_empty_content() {
        $result = $this->feature->modify_content( '' );

        $this->assertEmpty( $result );
    }
}
```

### Code Quality Standards:

**WordPress Coding Standards:**

-
Follow [WordPress PHP Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/)
- Use WordPress-Core ruleset for PHP_CodeSniffer
-
Follow [WordPress JavaScript Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/javascript/)

**PHP Standards:**

- Use PHP 8.1+ features (enums, readonly properties, union types, intersection types)
- Leverage PHP 8.0+ features (named arguments, attributes, match expressions)
- Declare strict types: `declare(strict_types=1);`
- Use type hints for parameters and return types
- DocBlocks for all classes, methods, and properties
- Meaningful variable and method names (no `$data`, `$temp`, `$x`)

**Minimum Requirements (matching Voxel):**

- PHP 8.1 or higher
- MySQL 8 or MariaDB 10.3 or higher
- 64MB or higher memory limit

**JavaScript/TypeScript Standards:**

- Use TypeScript for all new JavaScript code
- Enable strict mode in tsconfig.json
- Use ESLint with WordPress preset
- Prefer functional components and hooks (React)
- Use async/await over promises

**Security Standards:**

- Sanitize all user input
- Escape all output
- Validate data before processing
- Use WordPress nonces for forms
- Prepare database queries (use $wpdb->prepare())
- Check user capabilities before privileged operations

### Code Review Checklist:

Before committing, verify:

- [ ] All new classes extend appropriate base classes
- [ ] All methods have type declarations
- [ ] All classes and methods have DocBlocks
- [ ] Unit tests written and passing
- [ ] Code coverage meets minimum 80%
- [ ] No security vulnerabilities (SQL injection, XSS, CSRF)
- [ ] Input sanitization implemented
- [ ] Output escaping implemented
- [ ] Error handling implemented
- [ ] Code follows WordPress coding standards
- [ ] No var_dump, print_r, or console.log left in code
- [ ] Performance considerations addressed

### Running Tests:

```bash
# PHP Unit Tests
cd themes/voxel-fse
./vendor/bin/phpunit

# With coverage report
./vendor/bin/phpunit --coverage-html coverage/

# JavaScript Tests
npm test

# With coverage
npm test -- --coverage

# Code Standards Check
./vendor/bin/phpcs --standard=WordPress app/

# Auto-fix code standards
./vendor/bin/phpcbf --standard=WordPress app/
```

### Performance Best Practices:

**Database:**

- Use transients for expensive queries
- Implement proper caching strategies
- Avoid N+1 queries
- Use object caching where available

**Frontend:**

- Lazy load images and components
- Minimize HTTP requests
- Use code splitting for JavaScript
- Implement proper asset versioning

**PHP:**

- Avoid loading unnecessary files
- Use autoloading efficiently
- Minimize object instantiation in loops
- Profile slow operations

### Documentation Requirements:

**Every feature must include:**

- Inline code comments for complex logic
- DocBlocks for all public APIs
- README.md in feature directory (if applicable)
- Usage examples in documentation
- Update CHANGELOG.md with new features

---

## 🤖 AI Agent Usage Guidelines

### CSS Framework

**Use Tailwind CSS for all styling:**

- Utility-first CSS approach
- Consistent design tokens
- Responsive design utilities
- Custom configuration in `tailwind.config.js`
- JIT (Just-In-Time) compilation for optimal bundle size

### Component Selection Priority (Tier System)

When building UI components, follow this strict priority order:

**Tier 1 - UntitledUI React Free (Primary) ⭐**

Check if component exists in UntitledUI React free tier FIRST.

- **When to use:** Always check here first for any UI component
- **Why prioritized:** High-quality, production-ready React components
- **Coverage:** Forms, buttons, navigation, modals, tables, cards, etc.
- **Integration:** Built with Tailwind CSS, React best practices
- **Documentation:** Well-documented with examples

**Example components:**

- Form inputs, selects, textareas
- Buttons, button groups
- Navigation bars, tabs, breadcrumbs
- Modals, dialogs, alerts
- Tables, pagination
- Cards, lists, badges

---

**Tier 2 - TailwindUI HTML → React Conversion (Secondary) 🔄**

Use when UntitledUI doesn't have the component.

- **When to use:** Component not available in UntitledUI React
- **Process:** AI agent converts TailwindUI HTML to React + FSE blocks
- **Coverage:** Application UI, marketing sections, ecommerce patterns
- **Source:** TailwindUI HTML examples
- **Conversion requirements:**
    - Maintain exact Tailwind classes
    - Convert to functional React components
    - Add TypeScript types
    - Create corresponding FSE block registration
    - Preserve accessibility attributes
    - Add proper state management if needed

**Example components:**

- Complex form layouts
- Dashboard layouts
- Stats sections
- Feature grids
- Pricing tables

**Conversion template:**

```tsx
// Original TailwindUI HTML
<div class="bg-white shadow sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold">Title</h3>
    </div>
</div>

// Convert to React
import React from 'react';

interface CardProps {
    title: string;
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({title, children}) => {
    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold">{title}</h3>
                {children}
            </div>
        </div>
    );
};
```

---

**Tier 3 - shadcn/ui (Gap Filler) 🔌**

For components missing in Tier 1 & 2.

- **When to use:** Component not in UntitledUI or TailwindUI
- **Coverage:** Additional UI primitives, advanced components
- **Integration:** Copy component code into project
- **Customization:** Fully customizable with Tailwind
- **Radix UI based:** Built on Radix UI primitives

**Example components:**

- Advanced dropdowns with search
- Command palettes
- Toast notifications
- Accordions
- Tooltips, popovers
- Date pickers
- Comboboxes

**Installation:**

```bash
cd themes/voxel-fse
npx shadcn-ui@latest add [component-name]
```

---

**Tier 4 - Flowbite React (Last Resort) ⚠️**

Only use when component doesn't exist in Tiers 1-3.

- **When to use:** Niche components, marketing-specific elements
- **Coverage:** Marketing mega menus, timelines, specialty components
- **Note:** Use sparingly to maintain consistency
- **Integration:** Install via npm

**Example components:**

- Mega menus with multi-column layouts
- Timeline components
- Rating components
- Carousel/slider components
- Video players with custom controls

**Installation:**

```bash
cd themes/voxel-fse
npm install flowbite-react
```

---

### Component Selection Workflow

**Step-by-step process for AI agents:**

1. **Identify Component Need**
    - What UI component is required?
    - What functionality does it need?

2. **Check Tier 1 (UntitledUI React)**
    - Search UntitledUI React free components
    - If found → Use it ✅
    - If not found → Continue to Tier 2

3. **Check Tier 2 (TailwindUI HTML)**
    - Search TailwindUI HTML examples
    - If found → Convert to React ✅
    - If not found → Continue to Tier 3

4. **Check Tier 3 (shadcn/ui)**
    - Search shadcn/ui component library
    - If found → Install and customize ✅
    - If not found → Continue to Tier 4

5. **Check Tier 4 (Flowbite React)**
    - Search Flowbite React components
    - If found → Install and use ⚠️
    - If not found → Build custom component

6. **Custom Component (Last Resort)**
    - Build from scratch with Tailwind CSS
    - Follow accessibility guidelines (WCAG 2.1 AA)
    - Use Radix UI primitives for complex interactions
    - Add to project component library

---

### Component Implementation Standards

**All components (regardless of tier) must:**

✅ **Accessibility**

- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Focus management

✅ **Responsive Design**

- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Touch-friendly interactions

✅ **TypeScript**

- Full type safety
- Proper interface definitions
- Generic types where applicable

✅ **Tailwind CSS**

- Use utility classes (no inline styles)
- Follow design system tokens
- Consistent spacing and colors

✅ **React Best Practices**

- Functional components
- Hooks for state management
- Proper prop drilling / context usage
- Memoization for performance

✅ **Documentation**

- Component props documentation
- Usage examples
- Storybook stories (if applicable)

---

### Design System Integration

**Maintain consistency across all tiers:**

**Colors:**

```js
// tailwind.config.js
colors: {
    primary: {...
    }
,    // Brand colors
    secondary: {...
    }
,
    accent: {...
    }
,
    gray: {...
    }
,       // Neutral palette
}
```

**Typography:**

```js
fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
        display
:
    ['Cal Sans', 'Inter', 'sans-serif'],
}
```

**Spacing:**

- Use Tailwind's default spacing scale
- Custom spacing only when absolutely necessary

**Components:**

- Button variants: primary, secondary, outline, ghost, link
- Input variants: default, error, success, disabled
- Card variants: default, bordered, elevated

---

### When to Avoid Component Libraries

**Build custom components when:**

- Component requires heavy Voxel integration
- Need 1:1 matching with Voxel parent theme UI
- Performance-critical components (virtual lists, etc.)
- Highly specialized domain logic

**In these cases:**

- Use Headless UI or Radix UI primitives
- Build with Tailwind CSS utilities
- Follow accessibility guidelines strictly
- Write comprehensive tests

---

## Quick Reference

### VoxelScript Syntax:

```
@post(title)                         # Access data
@post(title).truncate(50)            # Apply modifier
@field.is_empty().then(Default)      # Conditional logic
@product(price).currency_format(USD) # Format output
```

### Common Constants:

```php
VOXEL_FSE_PATH              // themes/voxel-fse/
VOXEL_FSE_URL               // Theme URL
VOXEL_FSE_TEMPLATES_PATH    // FSE templates path
```

### Useful Commands:

```bash
git status                  # Check branch and changes
git log --oneline -10       # Recent commits
wp theme list               # Installed themes
wp plugin list              # Installed plugins
```

---

## Current Project Status

**Architecture:** All-in FSE Child Theme (no separate plugin)
**Build System:** Vite with HMR
**Controller Pattern:** OOP extending FSE_Base_Controller
**Dynamic Data:** VoxelScript parser + 4 data groups + 31+ modifiers

### Phase 1: ✅ COMPLETE (Nov 2025)

- FSE child theme foundation
- OOP controllers with autoloader conflict fixes
- Dynamic data system fully functional
- Vite build system operational
- Comprehensive documentation

### Phase 2: 🚀 STARTING

- Custom Post Type Fields implementation
- Flexible field system for ANY CPT (product types, collections, directories, etc.)
- Admin interface for field management
- Custom field types and addons
- Frontend blocks for field display

### Phase 3: Design and Layout

- Theme design system
- Layout components
- UI/UX implementation

### Phase 4: Headless Next.js Frontend

- Next.js frontend on Vercel
- WordPress API integration
- Frontend obfuscation

### Phase 5: Social + Supabase

- Timeline extended (video, audio, teams)
- External database (Supabase)
- Chat system
- Live events
- User synchronization

---

## Rule 15: Multisite Compatibility

**All blocks MUST be compatible with WordPress multisite installations (subdirectory and subdomain setups).**

### Why Multisite Matters

WordPress multisite installations require special URL handling:

**Multisite Subdirectory Example:**
- Main site: `http://example.com/`
- Subsite: `http://example.com/vx-fse-stays/`

**The Problem:**
Relative URLs starting with `/` resolve to domain root, not site path. A hardcoded `/?vx=1` on a subsite goes to the main site instead of the subsite, breaking all AJAX operations, redirects, and links.

**Example:**
```
Subsite URL: http://example.com/vx-fse-stays/
Hardcoded AJAX: /?vx=1&action=timeline/v2/get_feed
Resolves to: http://example.com/?vx=1&action=timeline/v2/get_feed (main site - WRONG!)
Should be: http://example.com/vx-fse-stays/?vx=1&action=timeline/v2/get_feed (CORRECT)
```

---

### Mandatory Pattern 1: TypeScript/JavaScript AJAX URLs

**ALWAYS use `getSiteBaseUrl()` utility for Voxel AJAX endpoints.**

**NEVER do this:**
```typescript
// Hardcoded URL - BREAKS on multisite subdirectory
const url = `/?vx=1&action=${action}`;
const url = `${window.location.origin}/?vx=1&action=${action}`; // Also breaks!
```

**ALWAYS do this:**
```typescript
// Import utility
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';

// Build multisite-aware URL
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const url = `${siteBase}/?vx=1&action=${action}&param=value`;
```

**Why it works:**
- `getSiteBaseUrl()` detects site path from WordPress REST API meta tag
- WordPress outputs: `<link rel="https://api.w.org/" href="{site_url}/wp-json/" />`
- Works on single-site, multisite subdomain, and multisite subdirectory
- Location: `themes/voxel-fse/app/blocks/src/shared/utils/siteUrl.ts`

**Real-world example (Timeline block):**
```typescript
// File: timeline/api/voxel-fetch.ts:302-306

// Build URL for voxelAjax()
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const url = `${siteBase}/?vx=1&action=${action}${queryParts.length ? '&' + queryParts.join('&') : ''}`;
```

---

### Mandatory Pattern 2: TypeScript/JavaScript Redirects

**ALWAYS detect and handle relative URLs before redirecting.**

**NEVER do this:**
```typescript
// Relative URL - BREAKS on multisite subdirectory
window.location.href = '/thank-you/';
window.location.href = attributes.redirectAfterSubmit; // Breaks if relative!
```

**ALWAYS do this:**
```typescript
// Import utility
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';

// Check if URL is relative, prepend site base if needed
let redirectUrl = attributes.redirectAfterSubmit;

// Check if URL is relative (doesn't start with http:// or https://)
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    // Relative URL - make it multisite-aware
    const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
    redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
}

// Now safe to redirect
window.location.href = redirectUrl;
```

**Real-world example (Create Post block):**
```typescript
// File: create-post/hooks/useFormSubmission.ts:406-418

// Handle multisite: if redirect is relative, prepend site base URL
let redirectUrl = attributes.redirectAfterSubmit;
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
    redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
}
window.location.href = redirectUrl;
```

---

### Mandatory Pattern 3: PHP URL Generation

**ALWAYS use `get_site_url(get_current_blog_id())` for multisite, NOT `home_url()`.**

**NEVER do this:**
```php
// home_url() only returns main site URL on multisite
$edit_link = home_url('?vx=1&action=posts.get_edit_post_config&post_id=' . $post_id);
```

**ALWAYS do this:**
```php
// Multisite-safe URL generation
$site_url = function_exists('get_current_blog_id')
    ? get_site_url(get_current_blog_id())  // Multisite: Returns current site URL
    : home_url();                           // Single-site: Fallback

$edit_link = $site_url . '?vx=1&action=posts.get_edit_post_config&post_id=' . $post_id;
```

---

### Common Multisite Pitfalls

**Pitfall 1: Using `window.location.origin`**
```typescript
// WRONG - Missing site path on subdirectory multisite
const editLink = `${window.location.origin}/create-post/?post_id=${id}`;
// On /vx-fse-stays/ this returns: http://example.com/create-post/... (main site!)

// CORRECT - Trust backend's multisite-aware URL or use getSiteBaseUrl()
const editLink = result.editLink; // Backend already includes site path
```

**Pitfall 2: Inconsistent URL Patterns**
```typescript
// WRONG - Different patterns in same file
const regularUrl = `${wpData.ajaxUrl}&action=submit`; // Uses wpData
const draftUrl = `/?vx=1&action=draft`; // Hardcoded!

// CORRECT - Consistent patterns everywhere
const regularUrl = `${wpData.ajaxUrl}&action=submit`;
const draftUrl = `${wpData.ajaxUrl}&action=draft`; // Same pattern
```

**Pitfall 3: Forgetting Import**
```typescript
// WRONG - getSiteBaseUrl() not imported
const siteBase = getSiteBaseUrl(); // ReferenceError!

// CORRECT - Import at top of file
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
const siteBase = getSiteBaseUrl();
```

---

### Multisite Testing Checklist

**When testing multisite compatibility, verify:**

**1. Subdirectory Setup (Most Common)**
- [ ] Main site: `http://example.com/`
- [ ] Subsite: `http://example.com/vx-fse-stays/`
- [ ] All AJAX URLs include `/vx-fse-stays/` path

**2. Subdomain Setup**
- [ ] Main site: `http://example.com/`
- [ ] Subsite: `http://stays.example.com/`
- [ ] All AJAX URLs use correct subdomain

**3. Critical Tests**
- [ ] AJAX requests succeed (check Network tab in DevTools)
- [ ] No 404 errors on AJAX endpoints
- [ ] Redirects go to correct site (not main site)
- [ ] Edit links stay within current site
- [ ] Success messages show correct site-specific URLs
- [ ] Draft save works correctly
- [ ] Form submissions succeed
- [ ] `getSiteBaseUrl()` returns correct path (test in console)

---

### When to Apply Multisite Patterns

**Apply multisite patterns whenever your block:**

- Makes AJAX requests using `/?vx=1&action=...` endpoints
- Performs redirects using `window.location.href`
- Generates edit/view links for content
- Submits forms to AJAX endpoints
- Uses PHP to generate URLs (edit links, success messages, etc.)
- Constructs any URL that should be site-specific

**Blocks that are already safe (no changes needed):**
- Display-only blocks (no URL construction)
- REST API blocks using `wpApiSettings.root` (WordPress handles it)
- Static content blocks with no AJAX or navigation

---

### Quick Reference: Multisite Patterns

**Pattern 1: Voxel AJAX (TypeScript)**
```typescript
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const url = `${siteBase}/?vx=1&action=${action}`;
```

**Pattern 2: Redirects (TypeScript)**
```typescript
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
let redirectUrl = attributes.redirect;
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
    redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
}
window.location.href = redirectUrl;
```

**Pattern 3: PHP URLs (PHP)**
```php
$site_url = function_exists('get_current_blog_id')
    ? get_site_url(get_current_blog_id())
    : home_url();
$url = $site_url . '?vx=1&action=...';
```

---

### Reference Documentation

**Primary Multisite Guide:**
- `docs/block-conversions/multisite-compatibility-fixes.md` - Complete guide with all fixes

**Real-world Fix Examples:**
- Timeline AJAX: `timeline/api/voxel-fetch.ts:302-306, 396-399`
- Create Post Redirects: `create-post/hooks/useFormSubmission.ts:406-418`
- Create Post Edit Link: `create-post/hooks/useFormSubmission.ts:383-388`
- Create Post Draft: `create-post/hooks/useFormSubmission.ts:564-574`

**Utility Location:**
- `themes/voxel-fse/app/blocks/src/shared/utils/siteUrl.ts` - getSiteBaseUrl() implementation

---

## Rule 154: Voxel Elementor Widgets to Voxel-FSE Gutenberg Blocks Conversion Guide

## Overview

This document defines the conversion rules and requirements for migrating Voxel Elementor widgets to Voxel-FSE Gutenberg
blocks.

## Backend Conversion Requirements

### Inspector Controls Migration

- **Source**: Elementor controls (UI/UX components)
- **Target**: Voxel-FSE Custom Gutenberg FSE Inspector Controls library
- **Location**: `app/public/wp-content/themes/voxel-fse/app/blocks/src/shared`
- **Action**: Convert all Elementor control definitions to corresponding Gutenberg Inspector Controls using the shared
  library

## Frontend Conversion Requirements

### HTML Structure Preservation (CRITICAL)

**REQUIREMENT**: The converted Gutenberg blocks MUST maintain a 1:1 HTML structure match with the original Elementor
widgets.

- Every HTML element, class name, and DOM hierarchy from the Elementor widget must be preserved exactly
- Ensure data attributes, wrapper elements, and nesting levels remain identical
- The frontend rendering output must be indistinguishable from the Elementor version

## Reference Documentation

### Primary Architecture Documents

1. `app/public/wp-content/docs/headless-architecture/01-accelerated-option-c-plus-strategy.md`
2. `app/public/wp-content/docs/headless-architecture/02-headless-architecture-options-summary.md`

### Conversion Implementation Guides

3. `app/public/wp-content/docs/conversions/search-form/search-form-implementation-summary.md`
4. `app/public/wp-content/docs/conversions/create-post/create-post-plan-c-plus-implementation.md`
5. `app/public/wp-content/docs/conversions/create-post-style-loading-explained.md`
6. `app/public/wp-content/docs/conversions/google-maps-gutenberg-editor-fix.md`
7. `app/public/wp-content/docs/conversions/gutenberg-block-registration-guide.md`
8. `app/public/wp-content/docs/conversions/gutenberg-create-post-rendering.md`
9. `app/public/wp-content/docs/conversions/popup-eager-loading-optimization.md`
10. `app/public/wp-content/docs/conversions/popup-kit-field-popup-discovery.md`
11. `app/public/wp-content/docs/conversions/popup-positioning-architecture.md`
12. `app/public/wp-content/docs/conversions/product-field-backend-rendering-fix.md`
13. `app/public/wp-content/docs/conversions/responsive-controls-discovery.md`
14. `app/public/wp-content/docs/conversions/voxel-ajax-system.md`
15. `app/public/wp-content/docs/voxel-discovery/phase2/02-widget-files.md`

### Official Voxel Documentation

**Location**: `app/public/wp-content/docs/voxel-documentation`

**Naming Convention**: `docs.getvoxel.io_articles_{article-name}_.md`

**Example**: To understand the `product-form-vx-widget`, locate the file:

```
docs.getvoxel.io_articles_product-form-vx-widget_.md
```

## Conversion Workflow

1. **Identify Widget**: Determine which Elementor widget requires conversion
2. **Review Documentation**: Consult the official Voxel documentation using the naming pattern
3. **Map Controls**: Convert Elementor controls to Gutenberg Inspector Controls
4. **Preserve Structure**: Ensure frontend HTML output matches exactly
5. **Reference Guides**: Use the conversion implementation guides for specific patterns
6. **Test Rendering**: Verify the block renders identically to the original widget

 
---

## Remember

**The Voxel theme code is the specification. Discovery first, evidence always, 1:1 matching required.**

**Development Branch:** `claude/widget-block-admin-edit-01QFNxVMQKA5kJcUbezzp8DP`

**Last Updated:** November 2025