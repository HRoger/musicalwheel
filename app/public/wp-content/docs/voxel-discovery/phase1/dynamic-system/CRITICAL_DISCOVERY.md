# CRITICAL DISCOVERY: Voxel Dynamic Content System

**Date:** 2025-11-09  
**Priority:** FOUNDATIONAL - Must be implemented before widget conversion  
**Status:** Discovery Phase

---

## Executive Summary

Voxel's true power lies in its **three-layer dynamic content system** that wraps Elementor widgets. This system allows users to insert dynamic data (custom fields, user data, relationships) into ANY widget control. **Without this system, converted blocks will lack the core functionality that makes Voxel valuable.**

### Why This Changes Everything

- **Image Widget** - MUST convert (needs dynamic tag support for custom field images)
- **Text/Heading/Button** - MUST convert (need dynamic content insertion)
- **All "simple" widgets** - MUST convert if they have text/image/URL controls

**Bottom Line:** We cannot skip "simple" widgets. Every widget that accepts text, images, or URLs needs dynamic tag support.

---

## Three-Layer Architecture

### Layer 1: Dynamic Tags (Data Source)

**Purpose:** Pull data from various sources using tag syntax

**Syntax:** `@group(property.nested.path)`

**Examples:**
```
@post(title)
@author(name)
@user(email)
@site(url)
@term(name)
```

**Data Groups Discovered:**

| Group Key | Class | Purpose |
|-----------|-------|---------|
| `post` | `Post_Data_Group` | Current post data and custom fields |
| `simple-post` | `Simple_Post_Data_Group` | Lightweight post data |
| `user` | `User_Data_Group` | User profile and custom fields |
| `author` | (via `post`) | Post author data |
| `site` | `Site_Data_Group` | Site settings and options |
| `term` | `Term_Data_Group` | Taxonomy term data |
| `message` | `Message_Data_Group` | Direct message data |
| `order` | `Order_Data_Group` | E-commerce order data |
| `orders/booking` | `Booking_Data_Group` | Booking order items |
| `orders/promotion` | `Promotion_Data_Group` | Promotion order items |
| `timeline/status` | `Status_Data_Group` | Timeline status data |
| `timeline/review` | `Review_Data_Group` | Timeline review data |
| `timeline/reply` | `Reply_Data_Group` | Timeline reply data |
| `user/membership` | `Membership_Data_Group` | User membership data |
| `posts/relation-request` | `Relation_Request_Data_Group` | Post relationship requests |
| `value` | `Value_Data_Group` | Direct value insertion |
| `noop` | `Noop_Data_Group` | No-operation placeholder |

**Total:** 17 data groups

### Layer 2: Modifiers (Data Transformation)

**Purpose:** Transform tag output before display

**Syntax:** `@post(title)|modifier(param1,param2)`

**Modifier Categories:**

#### Text Modifiers (9)
- `append` - Add text after value
- `prepend` - Add text before value
- `capitalize` - Capitalize text
- `truncate` - Limit text length
- `abbreviate` - Shorten text with ellipsis
- `replace` - Find and replace text
- `list` - Format array as list
- `first` - Get first item from array
- `last` - Get last item from array
- `nth` - Get nth item from array
- `count` - Count array items

#### Number Modifiers (3)
- `number_format` - Format numbers (decimals, thousands separator)
- `currency_format` - Format as currency
- `round` - Round numbers

#### Date Modifiers (3)
- `date_format` - Format dates
- `time_diff` - Show time difference (e.g., "2 hours ago")
- `to_age` - Convert birthdate to age

#### Control Structures (13)
- `is_empty` - Check if empty
- `is_not_empty` - Check if not empty
- `is_equal_to` - Compare equality
- `is_not_equal_to` - Compare inequality
- `is_greater_than` - Numeric comparison
- `is_less_than` - Numeric comparison
- `is_between` - Range check
- `is_checked` - Boolean check
- `is_unchecked` - Boolean check
- `contains` - String/array contains
- `does_not_contain` - String/array does not contain
- `then` - If-then logic
- `else` - Else logic

#### Other Modifiers (1)
- `fallback` - Default value if empty

**Total:** 29 modifiers

**Modifier Chaining:**
```
@post(title)|truncate(50)|append(...)
@post(created_at)|date_format(Y-m-d)|fallback(No date)
@post(price)|currency_format(USD)
```

### Layer 3: Dynamic Editor UI (Visual Tag Builder)

**Purpose:** Visual interface for building dynamic tag expressions

**Features:**
- Searchable tag library organized by source
- Hierarchical tree view of available tags
- Real-time syntax building
- Mod selector dropdown with parameters
- Expression validation
- Save/Discard actions

**Trigger:** Voxel icon next to widget controls

---

## VoxelScript Parser Architecture

### Tokenizer

**File:** `voxel/app/dynamic-data/voxelscript/tokenizer.php`

**Purpose:** Parse dynamic tag syntax into tokens

**Syntax Rules:**
```
Tag Format: @group(property.nested.path)|modifier(param1,param2)|modifier2()
```

**Parsing Logic:**
1. **Group Key Parsing:**
   - Starts with `@`
   - Alphanumeric + underscore only
   - Max 32 characters
   - Ends with `(`

2. **Property Path Parsing:**
   - Dot-separated nested properties
   - Max 60 characters per property
   - Max 240 characters total path
   - Escape characters: `)`, `.`, `\`

3. **Modifier Parsing:**
   - Starts with `|`
   - Modifier key + optional parameters
   - Parameters in parentheses, comma-separated
   - Max 100 characters per modifier
   - Escape characters: `(`, `)`, `,`, `\`

**Output:** `Token_List` containing `Dynamic_Tag` and `Plain_Text` tokens

### Renderer

**File:** `voxel/app/dynamic-data/voxelscript/renderer.php`

**Purpose:** Execute tokens and generate output

**Process:**
1. Tokenize content string
2. For each token:
   - If `Dynamic_Tag`: Resolve group → property → modifiers → output
   - If `Plain_Text`: Output as-is
3. Concatenate all outputs

**Context Groups:**
```php
$groups = [
    'post' => Post_Data_Group::get($current_post),
    'user' => User_Data_Group::get($current_user),
    'site' => Site_Data_Group::get(),
    'author' => User_Data_Group::get($post_author),
    // ... etc
];

$renderer = new Renderer($groups);
$output = $renderer->render('@post(title)|truncate(50)');
```

---

## Data Types System

**File:** `voxel/app/dynamic-data/data-types/`

**Purpose:** Type-safe data handling

**Types:**
- `Data_String` - Text values
- `Data_Number` - Numeric values
- `Data_Bool` - Boolean values
- `Data_Date` - Date/time values
- `Data_Email` - Email addresses
- `Data_URL` - URLs
- `Data_Object` - Complex objects (posts, users, terms)
- `Data_Object_List` - Arrays of objects

**Usage:**
```php
use Voxel\Dynamic_Data\Tag;

$title = Tag::String($post->get_title());
$price = Tag::Number($product->get_price());
$published = Tag::Date($post->get_date());
$author = Tag::Object($post->get_author());
```

---

## Visibility Rules System

**Purpose:** Conditional rendering based on context

**File:** `voxel/app/dynamic-data/visibility-rules/`

**Rule Categories:**

### User Rules (11)
- `user:logged_in` - User is logged in
- `user:logged_out` - User is logged out
- `user:plan` - User has specific plan
- `user:role` - User has specific role
- `user:is_author` - User is post author
- `user:can_create_post` - User can create posts
- `user:can_edit_post` - User can edit post
- `user:is_verified` - User is verified
- `user:is_vendor` - User is vendor
- `user:has_bought_product` - User purchased product
- `user:has_bought_product_type` - User purchased product type
- `user:is_customer_of_author` - User is customer
- `user:follows_post` - User follows post
- `user:follows_author` - User follows author

### Author Rules (4)
- `author:plan` - Author has specific plan
- `author:role` - Author has specific role
- `author:is_verified` - Author is verified
- `author:is_vendor` - Author is vendor

### Template Rules (8)
- `template:is_page` - Current page is specific page
- `template:is_child_of_page` - Current page is child of page
- `template:is_single_post` - Single post view
- `template:is_post_type_archive` - Post type archive
- `template:is_author` - Author archive
- `template:is_single_term` - Term archive
- `template:is_homepage` - Homepage
- `template:is_404` - 404 page

### Post Rules (1)
- `post:is_verified` - Post is verified

### Product Rules (2)
- `product:is_available` - Product is available
- `product_type:is` - Product type matches

### Dynamic Tag Rule (1)
- `dtag` - Evaluate dynamic tag expression

**Total:** 27 visibility rules

---

## Integration with Elementor Widgets

### How Voxel Wraps Widgets

Voxel doesn't modify Elementor widgets directly. Instead, it:

1. **Adds Dynamic Tag Support to Controls:**
   - Intercepts control rendering
   - Adds Voxel icon next to text/image/URL controls
   - Stores dynamic expressions in widget settings

2. **Processes Expressions During Render:**
   - Widget calls `$this->get_settings_for_display('control_name')`
   - Voxel intercepts and processes any dynamic tags
   - Returns processed value to widget

3. **Editor UI Integration:**
   - Voxel icon opens dynamic tag builder
   - Tag builder is React component
   - Saves expression back to control

### Example: Text Widget with Dynamic Content

**Elementor Control:**
```php
$this->add_control('text', [
    'label' => 'Text',
    'type' => Controls_Manager::TEXT,
    'default' => 'Hello World',
]);
```

**User Input (via Voxel UI):**
```
Hello @user(display_name), welcome to @site(name)!
```

**Render Output:**
```
Hello John Doe, welcome to My Awesome Site!
```

---

## Critical Files for Discovery

### Core System
- ✅ `voxel/app/dynamic-data/config.php` - Data groups, modifiers, visibility rules registry
- ✅ `voxel/app/dynamic-data/tag.php` - Data type factory
- ✅ `voxel/app/dynamic-data/group.php` - Data group factory
- ✅ `voxel/app/dynamic-data/voxelscript/tokenizer.php` - Tag syntax parser
- ✅ `voxel/app/dynamic-data/voxelscript/renderer.php` - Tag execution engine
- ⏳ `voxel/app/dynamic-data/exporter.php` - Export data groups for editor
- ⏳ `voxel/app/dynamic-data/looper.php` - Loop through object lists

### Data Groups (Need Analysis)
- ⏳ `voxel/app/dynamic-data/data-groups/post/post-data-group.php`
- ⏳ `voxel/app/dynamic-data/data-groups/user/user-data-group.php`
- ⏳ `voxel/app/dynamic-data/data-groups/site/site-data-group.php`
- ⏳ `voxel/app/dynamic-data/data-groups/term/term-data-group.php`

### Modifiers (Need Analysis)
- ⏳ All modifier files in `voxel/app/dynamic-data/modifiers/`

### Elementor Integration (CRITICAL)
- ✅ `voxel/app/modules/elementor/` - How Voxel integrates with Elementor
- ✅ Find where Voxel adds icon to controls - **DISCOVERED:** Via `elementor/widget/print_template` filter + `voxel_handle_tags()` JS function
- ✅ Find where Voxel processes dynamic tags during render - **DISCOVERED:** Custom controls override `get_value()` method, check for `@tags()` prefix
- ✅ Find Vue.js component for dynamic tag builder UI - **DISCOVERED:** Vue.js 2 (NOT React), inline templates in `templates/backend/dynamic-data/`

---

## Implementation Strategy for MusicalWheel

### Phase 1: Core Parser (Foundation)

**Goal:** Implement VoxelScript parser and renderer

**Tasks:**
1. Port tokenizer logic to PHP
2. Port renderer logic to PHP
3. Implement data type system
4. Create data group registry
5. Create modifier registry

**Location:** `musicalwheel-fse/app/dynamic-content/parser/`

### Phase 2: Data Groups (Data Layer)

**Goal:** Implement data groups with GraphQL

**Tasks:**
1. Create base data group class
2. Implement Post data group (GraphQL-powered)
3. Implement User data group
4. Implement Site data group
5. Implement Term data group
6. Add custom field support

**Location:** `musicalwheel-fse/app/dynamic-content/data-groups/`

### Phase 3: Modifiers (Transformation Layer)

**Goal:** Implement all modifiers

**Tasks:**
1. Create base modifier class
2. Implement text modifiers (truncate, append, etc.)
3. Implement number modifiers (format, currency, etc.)
4. Implement date modifiers (format, time_diff, etc.)
5. Implement control structures (if/then/else)
6. Support modifier chaining

**Location:** `musicalwheel-fse/app/dynamic-content/modifiers/`

### Phase 4: React Dynamic Editor (UI Layer)

**Goal:** Build visual tag builder for Gutenberg

**Tasks:**
1. Create React component for tag tree
2. Implement search functionality
3. Add modifier selector
4. Build expression composer
5. Add validation and preview
6. Integrate with InspectorControls

**Location:** `musicalwheel-fse/src/components/DynamicTagBuilder/`

### Phase 5: Block Integration (Glue Layer)

**Goal:** Add dynamic tag support to all blocks

**Tasks:**
1. Create HOC for dynamic tag support
2. Add Voxel icon to text/image/URL controls
3. Store expressions in block attributes
4. Process expressions in render.php
5. Show preview in editor

**Location:** `musicalwheel-fse/src/blocks/with-dynamic-tags.jsx`

### Phase 6: ServerSideRender Integration (CRITICAL)

**Goal:** Ensure editor preview matches frontend exactly, like Voxel does in Elementor

**Implementation:**

**Use WordPress `@wordpress/server-side-render` component:**
```jsx
import ServerSideRender from '@wordpress/server-side-render';

function Edit({ attributes, name }) {
    return (
        <>
            <InspectorControls>
                {/* Block controls */}
            </InspectorControls>
            
            <ServerSideRender
                block={name}
                attributes={attributes}
            />
        </>
    );
}
```

**How it Works:**
1. Editor component renders `ServerSideRender`
2. Component makes AJAX request to WordPress REST API
3. WordPress executes `render.php` with current attributes
4. Dynamic tags processed via GraphQL on server
5. HTML returned and displayed in editor
6. Updates automatically when attributes change

**Benefits:**
- ✅ WYSIWYG experience like Voxel/Elementor
- ✅ Dynamic tags render live in editor with real data
- ✅ Single source of truth (`render.php`) for both editor and frontend
- ✅ Prevents editor/frontend divergence
- ✅ No dual markup maintenance needed
- ✅ Complex server-side logic works in editor preview

**Considerations:**
- Performance: Cache rendered output when possible
- Loading states: Show spinner during AJAX requests
- Error handling: Graceful fallback if render fails
- Selective use: Not all blocks need SSR (simple static blocks can use React preview)

**Location:** `musicalwheel-fse/src/blocks/with-server-side-render.jsx`

---

## Success Criteria

### Technical
- [ ] VoxelScript parser handles all syntax correctly
- [ ] All 17 data groups implemented with GraphQL
- [ ] All 29 modifiers working and chainable
- [ ] Dynamic editor UI matches Voxel's UX
- [ ] Block integration seamless and performant

### Functional
- [ ] Users can insert `@post(title)` and see post title
- [ ] Modifiers work: `@post(title)|truncate(50)`
- [ ] Nested properties work: `@post(author.name)`
- [ ] Chained modifiers work: `@post(price)|currency_format(USD)|fallback(Free)`
- [ ] Editor preview shows sample data
- [ ] Frontend renders actual data

### User Experience
- [ ] Voxel icon appears next to compatible controls
- [ ] Tag builder opens smoothly
- [ ] Search finds tags quickly
- [ ] Expression building is intuitive
- [ ] Validation prevents errors

---

## Next Steps (Immediate)

### 1. Complete Elementor Integration Discovery
**Priority:** CRITICAL

**Tasks:**
- Find where Voxel adds icon to Elementor controls
- Discover how Voxel intercepts `get_settings_for_display()`
- Analyze React component for dynamic tag builder
- Document control-to-tag mapping

**Files to Analyze:**
- `voxel/app/modules/elementor/controllers/`
- `voxel/assets/src/` (React components)

### 2. Analyze Post Data Group
**Priority:** HIGH

**Tasks:**
- Study `Post_Data_Group` implementation
- Document all available properties
- Understand custom field access
- Map to GraphQL queries

### 3. Analyze Key Modifiers
**Priority:** HIGH

**Tasks:**
- Study `truncate`, `date_format`, `currency_format`
- Document modifier parameters
- Understand chaining logic

### 4. Build Proof of Concept
**Priority:** MEDIUM

**Tasks:**
- Implement basic tokenizer
- Implement basic renderer
- Create simple Post data group
- Test with `@post(title)` expression

---

## Estimated Effort

### Discovery Phase (Current)
- Elementor integration: 4-6 hours
- Data group analysis: 6-8 hours
- Modifier analysis: 4-6 hours
- **Total:** 14-20 hours

### Implementation Phase
- Core parser: 16-20 hours
- Data groups (5 core): 20-24 hours
- Modifiers (29 total): 24-32 hours
- React UI: 16-20 hours
- Block integration: 12-16 hours
- Testing & refinement: 16-20 hours
- **Total:** 104-132 hours (13-16.5 days)

### Widget Conversion (After Dynamic System)
- Per widget: 2-4 hours (with dynamic support)
- 40 widgets: 80-160 hours (10-20 days)

**Grand Total:** 198-312 hours (25-39 days)

---

## Critical Insights

### 1. This is NOT Optional
Without the dynamic content system, MusicalWheel blocks will be static and useless for Voxel users. This is the **core differentiator** that makes Voxel valuable.

### 2. Must Come Before Widget Conversion
Converting widgets without dynamic tag support is wasted effort. Users will immediately ask "where are the dynamic tags?"

### 3. GraphQL is the Right Choice
Voxel uses direct database queries. MusicalWheel should use GraphQL for:
- Better performance (caching)
- Type safety
- Easier frontend integration
- Modern architecture

### 4. Preserve Voxel's UX
Users are familiar with Voxel's tag syntax and editor UI. Don't reinvent - replicate and improve.

### 5. This is Foundational Work
Once built, every block gets dynamic tag support for free. This is infrastructure, not a feature.

---

**Generated by:** Cursor AI Agent  
**Date:** 2025-11-09  
**Status:** Discovery Phase - Elementor Integration Analysis Next  
**Priority:** CRITICAL - Blocks Foundation

