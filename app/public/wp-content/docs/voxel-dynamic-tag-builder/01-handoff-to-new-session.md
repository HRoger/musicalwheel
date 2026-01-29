# DynamicTagBuilder Implementation - Session Handoff Document

**Date**: 2025-11-12
**Branch**: `claude/phase-3.3-prep-review-011CV2oPmfVBwtwwXtwSDdxH`
**Priority**: High - Core functionality blocking user workflow

---

## 🎯 Mission

Implement 9 missing features in the DynamicTagBuilder modal to match Voxel's implementation exactly. This modal is used throughout the block editor for inserting dynamic content tags (e.g., `@post(title)`, `@user(username).truncate(50)`).

---

## 📋 The 14 Issues to Fix

### Issue 1: Top DataGroups don't match voxel top datagroups (Post, Author, User, Site) and its children  (SOLVED! TASK COMPLETE!)

**Status**: Already implemented in previous session
**What was done**: Top-level groups match Voxel (Post, Author, User, Site) with lazy loading
**Verification needed**: Test that all nested children load correctly
- Reference: Screenshot `Screenshot 2025-11-13 143951.jpg` loading...
```
VOXEL Post Data Model - Complete Hierarchical Structure
Post
├── ID
├── Title
├── Content
├── Slug
├── Permalink
├── Edit link
│
├── Post type
│   ├── Key
│   ├── Singular name
│   └── Plural name
│
├── Status
│   ├── Key
│   └── Label
│
├── Date created
├── Last modified date
├── Expiration date
├── Priority
├── Excerpt
│
├── Reviews
│   ├── Total count
│   ├── Average rating
│   ├── Percentage
│   │
│   ├── Latest review
│   │   ├── ID
│   │   ├── Date created
│   │   └── Author
│   │       ├── Name
│   │       ├── Link
│   │       └── Avatar
│   │
│   └── Replies
│       ├── Total count
│       └── Latest reply
│           ├── ID
│           ├── Date created
│           └── Author
│               ├── Name
│               ├── Link
│               └── Avatar
│
├── Timeline posts
│   ├── Total count
│   ├── Latest post
│   │   ├── ID
│   │   └── Date created
│   │
│   └── Replies
│       ├── Total count
│       └── Latest reply
│           ├── ID
│           ├── Date created
│           └── Author
│               ├── Name
│               ├── Link
│               └── Avatar
│
├── Wall posts
│   ├── Total count
│   ├── Latest post
│   │   ├── ID
│   │   └── Date created
│   │
│   └── Replies
│       ├── Total count
│       └── Latest reply
│           ├── ID
│           ├── Date created
│           └── Author
│               ├── Name
│               ├── Link
│               └── Avatar
│
├── Followers
│   ├── Follow count
│   └── Block count
│
├── Is verified?
│
├── Post meta
│
├── Author
│   ├── ID
│   ├── Username
│   ├── Display name
│   ├── Email
│   ├── Avatar
│   ├── First name
│   ├── Last name
│   │
│   ├── Profile
│   │   ├── ID
│   │   ├── Title
│   │   ├── Content
│   │   ├── Slug
│   │   ├── Permalink
│   │   ├── Edit link
│   │   │
│   │   ├── Post type
│   │   │   ├── Key
│   │   │   ├── Singular name
│   │   │   └── Plural name
│   │   │
│   │   ├── Status
│   │   │   ├── Key
│   │   │   └── Label
│   │   │
│   │   ├── Date created
│   │   ├── Last modified date
│   │   ├── Expiration date
│   │   ├── Priority
│   │   ├── Excerpt
│   │   │
│   │   ├── Reviews
│   │   │   ├── Total count
│   │   │   ├── Average rating
│   │   │   ├── Percentage
│   │   │   │
│   │   │   ├── Latest review
│   │   │   │   ├── ID
│   │   │   │   ├── Date created
│   │   │   │   └── Author
│   │   │   │       ├── Name
│   │   │   │       ├── Link
│   │   │   │       └── Avatar
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Timeline posts
│   │   │   ├── Total count
│   │   │   │
│   │   │   ├── Latest post
│   │   │   │   ├── ID
│   │   │   │   └── Date created
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Wall posts
│   │   │   ├── Total count
│   │   │   │
│   │   │   ├── Latest post
│   │   │   │   ├── ID
│   │   │   │   └── Date created
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Followers
│   │   │   ├── Follow count
│   │   │   └── Block count
│   │   │
│   │   ├── Is verified?
│   │   ├── Profile name
│   │   │
│   │   ├── Location
│   │   │   ├── Full address
│   │   │   ├── Latitude
│   │   │   ├── Longitude
│   │   │   ├── Short address
│   │   │   ├── Medium address
│   │   │   ├── Long address
│   │   │   │
│   │   │   └── Distance
│   │   │       ├── Meters
│   │   │       ├── Kilometers
│   │   │       └── Miles
│   │   │
│   │   ├── Website
│   │   │
│   │   ├── Profile picture
│   │   │   ├── File ID
│   │   │   ├── File URL
│   │   │   └── File name
│   │   │
│   │   ├── Featured image
│   │   │   ├── File ID
│   │   │   ├── File URL
│   │   │   └── File name
│   │   │
│   │   └── Bio
│   │
│   ├── Profile ID
│   ├── Profile URL
│   ├── Is verified?
│   │
│   ├── Role
│   │   ├── Label
│   │   └── Key
│   │
│   ├── Post types
│   │   ├── Pages
│   │   │   ├── Published count
│   │   │   ├── Pending count
│   │   │   ├── Unpublished count
│   │   │   ├── Expired count
│   │   │   ├── Rejected count
│   │   │   ├── Draft count
│   │   │   └── Archive link
│   │   │
│   │   ├── Profiles
│   │   │   ├── Published count
│   │   │   ├── Pending count
│   │   │   ├── Unpublished count
│   │   │   ├── Expired count
│   │   │   ├── Rejected count
│   │   │   ├── Draft count
│   │   │   └── Archive link
│   │   │
│   │   └── Spaces
│   │       ├── Published count
│   │       ├── Pending count
│   │       ├── Unpublished count
│   │       ├── Expired count
│   │       ├── Rejected count
│   │       ├── Draft count
│   │       └── Archive link
│   │
│   ├── Membership plan
│   │   ├── Key
│   │   ├── Label
│   │   ├── Description
│   │   │
│   │   └── Pricing
│   │       ├── Amount
│   │       ├── Period
│   │       ├── Currency
│   │       ├── Status
│   │       └── Start date
│   │
│   ├── Followers
│   │   ├── Follow count
│   │   └── Block count
│   │
│   ├── Following
│   │   ├── Follow count
│   │   ├── Follow requested count
│   │   ├── Block count
│   │   │
│   │   └── By post type
│   │       ├── Pages
│   │       │   ├── Follow count
│   │       │   ├── Follow requested count
│   │       │   └── Block count
│   │       │
│   │       ├── Profiles
│   │       │   ├── Follow count
│   │   │   │   ├── Follow requested count
│   │   │   │   └── Block count
│   │   │   │
│   │       └── Spaces
│   │           ├── Follow count
│   │           ├── Follow requested count
│   │           └── Block count
│   │
│   ├── User timeline
│   │   ├── Total count
│   │   ├── Repost count
│   │   └── Quote count
│   │
│   ├── Vendor stats
│   │   ├── Total earnings
│   │   ├── Total platform fees
│   │   ├── Customer count
│   │   │
│   │   ├── Order count
│   │   │   ├── Completed
│   │   │   ├── Pending approval
│   │   │   ├── Canceled
│   │   │   └── Refunded
│   │   │
│   │   ├── This year
│   │   │   ├── Earnings
│   │   │   ├── Completed orders
│   │   │   └── Platform fees
│   │   │
│   │   ├── This month
│   │   │   ├── Earnings
│   │   │   ├── Completed orders
│   │   │   └── Platform fees
│   │   │
│   │   ├── This week
│   │   │   ├── Earnings
│   │   │   ├── Completed orders
│   │   │   └── Platform fees
│   │   │
│   │   └── Today
│   │       ├── Earnings
│   │       ├── Completed orders
│   │       └── Platform fees
│   │
│   ├── Listing limits
│   │   ├── By post type (This is dynamic generated)
│   │   │
│   │   ├── By plan (This is dynamic generated)
│   │   │
│   │   └── All
│   │       ├── Total
│   │       ├── Used
│   │       └── Remaining
│   │
│   └── User meta
│
├── User
│   ├── ID
│   ├── Username
│   ├── Display name
│   ├── Email
│   ├── Avatar
│   ├── First name
│   ├── Last name
│   │
│   ├── Profile
│   │   ├── ID
│   │   ├── Title
│   │   ├── Content
│   │   ├── Slug
│   │   ├── Permalink
│   │   ├── Edit link
│   │   │
│   │   ├── Post type
│   │   │   ├── Key
│   │   │   ├── Singular name
│   │   │   └── Plural name
│   │   │
│   │   ├── Status
│   │   │   ├── Key
│   │   │   └── Label
│   │   │
│   │   ├── Date created
│   │   ├── Last modified date
│   │   ├── Expiration date
│   │   ├── Priority
│   │   ├── Excerpt
│   │   │
│   │   ├── Reviews
│   │   │   ├── Total count
│   │   │   ├── Average rating
│   │   │   ├── Percentage
│   │   │   │
│   │   │   ├── Latest review
│   │   │   │   ├── ID
│   │   │   │   ├── Date created
│   │   │   │   └── Author
│   │   │   │       ├── Name
│   │   │   │       ├── Link
│   │   │   │       └── Avatar
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Timeline posts
│   │   │   ├── Total count
│   │   │   │
│   │   │   ├── Latest post
│   │   │   │   ├── ID
│   │   │   │   └── Date created
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Wall posts
│   │   │   ├── Total count
│   │   │   │
│   │   │   ├── Latest post
│   │   │   │   ├── ID
│   │   │   │   └── Date created
│   │   │   │
│   │   │   └── Replies
│   │   │       ├── Total count
│   │   │       └── Latest reply
│   │   │           ├── ID
│   │   │           ├── Date created
│   │   │           └── Author
│   │   │               ├── Name
│   │   │               ├── Link
│   │   │               └── Avatar
│   │   │
│   │   ├── Followers
│   │   │   ├── Follow count
│   │   │   └── Block count
│   │   │
│   │   ├── Is verified?
│   │   ├── Profile name
│   │   │
│   │   ├── Location
│   │   │   ├── Full address
│   │   │   ├── Latitude
│   │   │   ├── Longitude
│   │   │   ├── Short address
│   │   │   ├── Medium address
│   │   │   ├── Long address
│   │   │   │
│   │   │   └── Distance
│   │   │       ├── Meters
│   │   │       ├── Kilometers
│   │   │       └── Miles
│   │   │
│   │   ├── Website
│   │   │
│   │   ├── Profile picture
│   │   │   ├── File ID
│   │   │   ├── File URL
│   │   │   └── File name
│   │   │
│   │   ├── Featured image
│   │   │   ├── File ID
│   │   │   ├── File URL
│   │   │   └── File name
│   │   │
│   │   └── Bio
│   │
│   ├── Profile ID
│   ├── Profile URL
│   ├── Is verified?
│   │
│   ├── Role
│   │
│   ├── Post types
│   │
│   ├── Membership plan
│   │
│   ├── Followers
│   │
│   ├── Following
│   │
│   ├── User timeline
│   │
│   ├── Vendor stats
│   │
│   ├── Listing limits
│   │   ├── By post type (This is dynamic generated)
│   │   │
│   │   ├── By plan (This is dynamic generated)
│   │   │
│   │   └── All
│   │       ├── Total
│   │       ├── Used
│   │       └── Remaining
│   │
│   └── User meta
│
└── Site
├── Title
├── Logo
├── Tagline
├── URL
├── WP Admin URL
├── Login URL
├── Register URL
├── Logout URL
├── Current plan URL
├── Language
├── Date
│
├── Post types
│   ├── Pages
│   │   ├── Singular name
│   │   ├── Plural name
│   │   ├── Icon
│   │   ├── Archive link
│   │   ├── Create post link
│   │   │
│   │   └── Templates
│   │       ├── Single page
│   │       ├── Preview card
│   │       ├── Archive
│   │       ├── Create post
│   │       └── Custom (This is dynamic generated)
│   │
│   ├── Profiles
│   │   ├── Singular name
│   │   ├── Plural name
│   │   ├── Icon
│   │   ├── Archive link
│   │   ├── Create post link
│   │   │
│   │   └── Templates
│   │       ├── Single page
│   │       ├── Preview card
│   │       ├── Archive
│   │       ├── Create post
│   │       └── Custom (This is dynamic generated)
│   │
│   └── Spaces
│       ├── Singular name
│       ├── Plural name
│       ├── Icon
│       ├── Archive link
│       ├── Create post link
│       │
│       └── Templates
│           ├── Single page
│           ├── Preview card
│           ├── Archive
│           ├── Create post
│           └── Custom (This is dynamic generated)
│
├── Query variable
└── Math expression
```

### Issue 2: The loading of modal content is too slow. It tries to load all datagroups at once. Modal Loading Performance (COMPLETE)(SOLVED! TASK COMPLETE!)
-Voxel for example DataGroups are dynamic loaded once with click in a top sub <Ul> to speed up the modal loading.
**Status**: Already optimized
**What was done**: Lazy loading, no pre-loading, instant modal open
**Verification needed**: Confirm modal opens in <100ms


### Issue 3: @ Autocomplete Dropdown (HIGH PRIORITY)
- when we press the @ the popup dropdown is not showing like voxel dynamictagbuild does."Press @ to quickly add a tag, or pick one from the left bar"
  **Current state**: Placeholder state added to CodeEditor.tsx, but no implementation
  **What's needed**:
- When user types `@`, show dropdown with top-level groups (Post, Author, User, Site)
- Dropdown should show below cursor position
- Filter as user types: `@p` shows "Post"
- Arrow keys to navigate, Enter to select
- Clicking outside closes dropdown
- Reference: Screenshot `Screenshot 2025-11-12 143722.jpg`
- Reference: `docs/voxel-dynamic-tag-builder/quick dropdown tag selection.html`

**Voxel behavior**:
- Help text: "Press @ to quickly add a tag, or pick one from the left bar"
- Shows complete tag structure in dropdown (Post / Author / Profile / Location)
- Inserts complete tag path when selected

### Issue 4: When writing the "." dot in a tag script the quick tag insert mod dropdown does not show
**Current state**: Not implemented
**What's needed**:
- When user types `.` after a tag, show dropdown with available modifiers
- Example: `@post(title).` should show: fallback, truncate, currency_format, date_format, etc.
- Reference: `docs/voxel-dynamic-tag-builder/quick dot modifiers.html`

**Voxel behavior**:
- Dropdown positioned besides cursor
- Shows modifier name and brief description
- Some modifiers have arguments: `.truncate(50)`, `.currency_format(EUR)`
- Reference: Screenshot `Screenshot 2025-11-12 144542.jpg`
- Reference: Screenshot `Screenshot 2025-11-12 144542.jpg`

### Issue 5: When clicking inside a voxel tag , the Tagline(site/Tagline) with the dropdown "add a mod"
- modifiers ADD a MOD does not show up in the right sidebar (it show only when clicking inside a tag script)
  **Current state**: Basic placeholder exists, no click detection
  **What's needed**:
- When user clicks after a tag (cursor position within `@tag(prop).mod()`), detect the tag
- Show tag path in right sidebar: "Site / Title" with breadcrumb
- Show "Add a mod" dropdown
- Display currently applied modifiers in list
- Reference: Screenshot `Screenshot 2025-11-12 144056.jpg`
- Reference: Screenshot `Screenshot 2025-11-12 144056.jpg`

### Issue 6: The right sidebar modifiers should work  like this:
- when selecting an item it should show the modifier "minipanel". Each modifier has its own characteristics
  For instance, by selecting currency format, it shows a minipane with a dropdown to choose the currency
  and a dropdown to select "Amount in cents " yes or no. etc
- **Current state**: Not implemented
  **What's needed**:
- Each modifier has custom controls (not just a text input)
- Example: `currency_format` modifier shows:
    - Dropdown: Currency (EUR, USD, GBP, etc.)
    - Dropdown: Amount in cents (Yes/No)
- Example: `date_format` modifier shows:
    - Dropdown: Format (Y-m-d, F j, Y, relative, etc.)
- Reference: Screenshot `Screenshot 2025-11-12 144205.jpg` showing modifier controls
- Reference: Screenshot `Screenshot 2025-11-12 144205.jpg`
- Reference: Screenshot `Screenshot 2025-11-12 144220.jpg`


**Implementation notes**:
- Create ModifierControl components for each modifier type
- Dark mode styling to match modal

### 🔴 Issue 7: Tag Feedback UI ( ATTENTION THIS IS NOT IN THE DYNAMICTAGMODAL BUT ON THE BLOCK SIDEBAR ATTRIBUTE - LOW PRIORITY)

Whenever we click the dynamic tag and add a custom voxel script tag it shows as a tag control-content
as a feedback to the user for which tag has been applied. So for instance the heading title if I
add a script it will show as Title @user(username) and below EDIT TAGS | DISABLE TAGS

**Current state**: Not implemented
**What's needed**:
- Below the code editor, show applied tags with preview
- Example: "Title @user(username)"
- Below that: "EDIT TAGS | DISABLE TAGS" links
- Reference: Screenshot `Screenshot 2025-11-12 145457.jpg` showing elementor-voxel dynamic tag controls
- Reference: Screenshot `Screenshot 2025-11-12 145433.jpg` showing elementor-voxel dynamic tag controls
- Reference: Screenshot `Screenshot 2025-11-12 145523.jpg` showing elementor-voxel dynamic tag controls
- Reference: Screenshot `Screenshot 2025-11-13 144215.jpg` showing what you did for  dynamic tag controls. It is wrong. It should be edit & tag disable tag buttons. Also, should

### Issue 8: Live Tag Rendering (- LOW PRIORITY)

The block with the dynamic tag is not being rendered in the admin editor. Also the dynamic tags
are not being rendered too. So, for instance if i use  a @user(username) dynamic tag, it should be
rendered with my name "Roger" instead of simply displaying the "@user(username)" dynamic tag without rendering

**Current state**: Not implemented
**What's needed**:
- In the block editor (not just the modal), render dynamic tags with actual data (the same way Voxel does inside the editor)
- Example: If editor shows `@user(username)`, render it as "Roger" (current user)
- This requires backend PHP rendering or JavaScript preview system
- Reference: Screenshot `Screenshot 2025-11-13 144327.jpg` the way you did in the timeline block
- Reference: Screenshot `Screenshot 2025-11-13 143821.jpg` the way voxel does. You can see the @username not yet rendered.
- Reference: Screenshot `Screenshot 2025-11-13 143838.jpg` the right way voxel does. Now you can see the @username rendered: Roger
---

###  Issue 9: Syntax Highlighting Colors (HIGH PRIORITY)
**Current state**: Basic `.mw-tag` class exists but no colors
**What's needed**:
- Tags should be pink/magenta color like Voxel
- Modifiers should be different color (orange/yellow)
- Reference: Screenshots show pink `@site(title)` tags
- Reference: Screenshot `Screenshot 2025-11-12 144056.jpg` showing modifier controls

**Voxel colors from screenshots**:
- Group name (@site): `#e91e63` (pink/magenta)
- Property name (title): `#e91e63` (pink/magenta)
- Modifier (.fallback): `#ff9800` (orange)
- Arguments (in parentheses): `#ffc107` (yellow)
- Syntax chars (@, (), .): White/gray

### Issue 10: The tags script colors don't match voxel. They are all white color.
- Reference: Screenshot `Screenshot 2025-11-13 150020.jpg` showing elementor-voxel dynamic tag controls

### Issue 11: unecessary intructions and panel.

- not needed instruction: "Use @group(property) syntax. Press @ to quickly add a tag. Example: @post(title).truncate(50)"
- Reference: Screenshot `Screenshot 2025-11-13 151035.jpg` Not needed panel

### Issue 12: Not follwing voxel modal layout and colors.

- Button discard shoould be in the right side near the save button.
- Arrow color should be very light gray when down,
- Arrow color should be pink (not red) when up and expanded (Also the text of the color item should be pink)
- Reference: Screenshot `Screenshot 2025-11-13 150106.jpg` overall layout doesn't match voxel.

### Issue 13: Sidebar left: The tree behaves as a accordion
- Reference: Screenshot `Screenshot 2025-11-12 144205.jpg` accordion like behaviour. In this example, the top parent is expanded by default.
  I can expand any subparent. But if there are other subparents, they are collapsed. In the reference screenshot,
  Site -> Post types -> 3 subparents (If I open one "Spaces", all others are collapsed)

### Issue 14: Top parents and subparents too slow to load (5-10s)
- Clicking a top parent or subparent with children item delays 5-10s while in Voxel is nearly instateous.
- Reference: Screenshot `Screenshot 2025-11-13 150035.jpg` loading...
---

## 📁 Reference Files

### In `docs/voxel-dynamic-tag-builder/`:

**Issues Document**:
- `ISSUES DYNAMIC TAG BUILDER.txt` - Complete issue list with Voxel data model hierarchy

**Screenshots** (showing Voxel implementation):
- `Screenshot 2025-11-12 143722.jpg` - Modal with left sidebar expanded, showing tag tree structure, and @ + displaying of code suggestion
- `Screenshot 2025-11-12 144056.jpg` - Right sidebar showing "Add a mod" dropdown for Site/Title tag and tag script color
- `Screenshot 2025-11-12 144205.jpg` - Right sidebar showing modifier controls (currency_format with EUR dropdown, date_format, etc.)
- `Screenshot 2025-11-12 144220.jpg` - Another view of modifier panel
- `Screenshot 2025-11-12 144542.jpg` - More modifier examples, in this case the quick tag modifier select code suggestion
- `Screenshot 2025-11-12 144733.jpg` - Tag tree fully expanded and place holder to press @ to quickly add a tag
- `Screenshot 2025-11-12 145433.jpg` - Compact view in elementor widget sidebar control, where a voxel tag  implemented by the dynamictag builder, displays as the new dynamict tag for the attribute title and link of the elementor widget 
- `Screenshot 2025-11-12 145457.jpg` - elementor widget in a normal state without applying voxel dynamic tags, but displaying the voxel dynamic tags pink buttons that when clicked display the dynamic tag builder
- `Screenshot 2025-11-12 145523.jpg` - Another angle of elementor attributes with the new applied voxel dynamic tag

**HTML Examples** (actual Voxel HTML):
- `quick dropdown tag selection.html` - Autocomplete dropdown structure for @ key press
- `quick dot modifiers.html` - Autocomplete dropdown structure for . (dot) key press
- `sidebar right modifiers.html` - Right sidebar structure with modifier list dropdown

### In `docs/voxel-documentation/`:

**Official Voxel Documentation** (critical for understanding intended behavior):
- `docs.getvoxel.io_articles_dynamic-tags-introduction_.md` - Introduction to Voxel's dynamic tag system, syntax explanation, and basic usage
- `docs.getvoxel.io_articles_dynamic-tag-sources_.md` - Complete reference of all data sources (Post, Author, User, Site, etc.) and their available properties
- `docs.getvoxel.io_articles_dynamic-tags-and-conditions-related-to-products_.md` - Dynamic tags for products, marketplace features, and conditional logic

**Why these are important**:
- Explains the @group(property) syntax philosophy
- Documents all available data groups and their properties
- Shows real-world usage examples
- Describes modifier behavior and chaining
- Explains conditional logic (if-then-else patterns)

---

## 🏗️ Current Codebase State

### File Structure
```
themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/
├── index.tsx              # Main modal component
├── CodeEditor.tsx         # Text editor with syntax highlighting (WIP)
├── TagTree.tsx            # Left sidebar tag tree (COMPLETE)
├── TagSearch.tsx          # Search input (COMPLETE)
├── ModifierEditor.tsx     # Right sidebar modifiers (NEEDS WORK)
├── styles.scss            # Dark mode styles (COMPLETE)
└── types.ts               # TypeScript interfaces
```

### What's Already Done

**✅ Modal Dark Mode & Fullscreen**:
- Fullscreen modal (100vw × 100vh)
- Dark theme (#1e1e1e background)
- Three strategies for CSS loading (enqueued file, inline head, JS injection)
- Files: `functions.php`, `assets/gutenberg-editor-overrides.css`, `styles.scss`

**✅ Tag Tree with Lazy Loading**:
- Voxel-like `<ul><li>` structure
- True lazy loading (no pre-loading)
- On-demand data fetching from REST API
- Proper scrollbar styling
- Files: `TagTree.tsx`, `rest-api.php`

**✅ REST API Endpoints**:
- `/musicalwheel/v1/dynamic-data/groups` - Get top-level groups
- `/musicalwheel/v1/dynamic-data/groups?group=post` - Get post children
- `/musicalwheel/v1/dynamic-data/groups?group=post&parent=post.author` - Get nested children
- `/musicalwheel/v1/dynamic-data/modifiers` - Get all modifiers
- File: `themes/musicalwheel-fse/app/dynamic-data/rest-api.php`

**🔶 CodeEditor.tsx - Partially Started**:
```typescript
// Added state management for autocomplete (lines 29-34)
const [showAutocomplete, setShowAutocomplete] = useState(false);
const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
const [selectedIndex, setSelectedIndex] = useState(0);
const [autocompleteQuery, setAutocompleteQuery] = useState('');
const [autocompleteType, setAutocompleteType] = useState<'tag' | 'modifier'>('tag');
```

**What's NOT implemented yet**:
- Autocomplete dropdown rendering
- Keyboard event handlers for @ and .
- Cursor position calculation
- Fetching suggestions from API
- Inserting selected tag/modifier

---

## 🛠️ Technical Requirements

### TypeScript Interfaces Needed

```typescript
// In types.ts
interface TagSuggestion {
  group: string;      // 'post', 'author', 'user', 'site'
  key: string;        // 'title', 'content', 'username'
  label: string;      // 'Title', 'Content', 'Username'
  fullPath: string;   // 'post.title', 'author.profile.location'
  hasChildren?: boolean;
}

interface ModifierSuggestion {
  key: string;        // 'truncate', 'currency_format', 'fallback'
  label: string;      // 'Truncate', 'Currency format', 'Fallback'
  description?: string;
  hasArgs: boolean;
  args?: ModifierArg[];
}

interface ModifierArg {
  name: string;       // 'length', 'currency', 'decimals'
  type: 'number' | 'string' | 'boolean' | 'select';
  options?: { value: string; label: string }[];
  default?: any;
}

interface AppliedModifier {
  key: string;
  args: Record<string, any>;
}

interface ParsedTag {
  group: string;
  property: string;
  modifiers: AppliedModifier[];
  startIndex: number;
  endIndex: number;
}
```

### Key Components to Build

**1. Autocomplete Dropdown** (`AutocompleteDropdown.tsx`)
```typescript
interface AutocompleteDropdownProps {
  suggestions: TagSuggestion[] | ModifierSuggestion[];
  selectedIndex: number;
  position: { top: number; left: number };
  onSelect: (suggestion: any) => void;
  onClose: () => void;
  type: 'tag' | 'modifier';
}
```

**2. Modifier Control** (`ModifierControl.tsx`)
```typescript
interface ModifierControlProps {
  modifier: Modifier;
  value: AppliedModifier;
  onChange: (value: AppliedModifier) => void;
  onRemove: () => void;
}
```

**3. Tag Parser Utility** (`tagParser.ts`)
```typescript
// Parse tags from text
export function parseTags(text: string): ParsedTag[];

// Get tag at cursor position
export function getTagAtPosition(text: string, position: number): ParsedTag | null;

// Insert tag at cursor
export function insertTag(text: string, position: number, tag: string): string;

// Update tag modifier
export function updateTagModifier(
  text: string,
  tagIndex: number,
  modifier: AppliedModifier
): string;
```

### Keyboard Event Handling

**In CodeEditor.tsx, add to textarea:**
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  const { key } = e;
  const textarea = textareaRef.current;
  if (!textarea) return;

  const cursorPos = textarea.selectionStart;
  const textBefore = value.substring(0, cursorPos);

  // @ key press - show tag autocomplete
  if (key === '@') {
    // Fetch top-level groups
    fetchTagSuggestions('');
    setAutocompleteType('tag');
    setShowAutocomplete(true);
    setAutocompletePosition(getCursorCoordinates(textarea, cursorPos));
  }

  // . key press inside a tag - show modifier autocomplete
  if (key === '.') {
    const currentTag = getTagAtPosition(value, cursorPos);
    if (currentTag) {
      fetchModifierSuggestions(currentTag.group);
      setAutocompleteType('modifier');
      setShowAutocomplete(true);
      setAutocompletePosition(getCursorCoordinates(textarea, cursorPos));
    }
  }

  // Arrow keys in autocomplete
  if (showAutocomplete) {
    if (key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    }
    if (key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (key === 'Enter') {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }
    if (key === 'Escape') {
      e.preventDefault();
      setShowAutocomplete(false);
    }
  }
};
```

### Cursor Position Calculation

Use `textarea-caret-position` logic or implement:
```typescript
function getCursorCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  // Create a mirror div with same styles
  const div = document.createElement('div');
  const styles = window.getComputedStyle(textarea);

  // Copy relevant styles
  ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing',
   'lineHeight', 'padding', 'border', 'width'].forEach(prop => {
    div.style[prop] = styles[prop];
  });

  // Set content up to cursor
  div.textContent = textarea.value.substring(0, position);

  // Add span at cursor position
  const span = document.createElement('span');
  span.textContent = '|';
  div.appendChild(span);

  // Temporarily add to DOM
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  document.body.appendChild(div);

  // Get span position
  const spanRect = span.getBoundingClientRect();
  const textareaRect = textarea.getBoundingClientRect();

  // Cleanup
  document.body.removeChild(div);

  return {
    top: spanRect.top - textareaRect.top + 20,
    left: spanRect.left - textareaRect.left
  };
}
```

---

## 🎨 Styling Guidelines

### Colors (from Voxel screenshots)
```scss
// Syntax highlighting colors
$tag-group: #e91e63;      // Pink/magenta for @group
$tag-property: #e91e63;    // Pink/magenta for property
$modifier: #ff9800;        // Orange for modifiers
$modifier-arg: #ffc107;    // Yellow for arguments
$syntax: #9e9e9e;          // Gray for @, (), ., :

// Autocomplete dropdown
.mw-autocomplete-dropdown {
  position: absolute;
  background: #2d2d2d;
  border: 1px solid #404040;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10000;

  &__item {
    padding: 8px 12px;
    cursor: pointer;
    color: #e0e0e0;
    font-size: 14px;

    &:hover {
      background: #383838;
    }

    &--selected {
      background: #0073aa;
      color: #ffffff;
    }

    &__path {
      font-size: 12px;
      color: #999999;
      margin-top: 2px;
    }
  }
}
```

---

## 📊 Implementation Priority

### Phase 1: Core Autocomplete (Day 1)
1. ✅ Issue 3: @ autocomplete dropdown
2. ✅ Issue 4: . (dot) modifier autocomplete
3. ✅ Issue 9: Syntax highlighting with colors

**Success criteria**: User can type `@post(title).fallback()` using autocomplete

### Phase 2: Modifier Management (Day 2)
4. ✅ Issue 5: Right sidebar shows tag on click
5. ✅ Issue 6: Modifier mini-panels with controls

**Success criteria**: User can click inside tag and add/configure modifiers via sidebar

### Phase 3: Polish (Day 3)
6. ✅ Issue 7: Tag feedback UI
7. ✅ Issue 8: Live tag rendering

**Success criteria**: Full Voxel feature parity

---

## 🧪 Testing Checklist

### Autocomplete Tests
- [ ] Type `@` shows dropdown with Post, Author, User, Site
- [ ] Type `@p` filters to show only "Post"
- [ ] Arrow keys navigate dropdown
- [ ] Enter selects and inserts tag
- [ ] Escape closes dropdown
- [ ] Type `@post(title).` shows modifier dropdown
- [ ] Modifiers are filtered by what's already applied

### Modifier Panel Tests
- [ ] Click inside `@post(title)` shows "Post / Title" in right sidebar
- [ ] "Add a mod" dropdown shows available modifiers
- [ ] Selecting modifier shows its control panel
- [ ] Currency format shows currency dropdown + "Amount in cents" toggle
- [ ] Date format shows format dropdown
- [ ] Removing modifier updates the code editor

### Syntax Highlighting Tests
- [ ] `@post` is pink
- [ ] `(title)` property is pink
- [ ] `.fallback` modifier is orange
- [ ] `(default value)` argument is yellow

### Edge Cases
- [ ] Multiple tags in same editor work independently
- [ ] Cursor position calculation accurate even with line wrapping
- [ ] Autocomplete closes when clicking outside
- [ ] Modifiers persist when editing other parts of tag

---

## 🚀 Getting Started

### 1. Review Reference Materials
```bash
cd /home/user/musicalwheel/docs/voxel-dynamic-tag-builder/

# Read the issues
cat "ISSUES DYNAMIC TAG BUILDER.txt"

# View screenshots
ls -la *.jpg

# Examine HTML examples
cat "quick dropdown tag selection.html"
cat "quick dot modifiers.html"
cat "sidebar right modifiers.html"
```

### 2. Understand Current Code
```bash
cd /home/user/musicalwheel/themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/

# Main files to modify
cat CodeEditor.tsx        # Add autocomplete dropdown here
cat ModifierEditor.tsx    # Add modifier controls here
cat styles.scss          # Add autocomplete + highlighting styles
```

### 3. Check REST API
```bash
# Test the endpoints (in browser or via curl)
# GET /wp-json/musicalwheel/v1/dynamic-data/groups
# GET /wp-json/musicalwheel/v1/dynamic-data/modifiers
```

### 4. Build and Test
```bash
cd /home/user/musicalwheel/themes/musicalwheel-fse/app/blocks
npm run build

# Test in WordPress admin:
# 1. Create/edit a post
# 2. Add "Dynamic Text" or "Dynamic Heading" block
# 3. Click "Dynamic Content" button
# 4. Modal should open - test autocomplete
```

---

## 💡 Implementation Tips

### For @ Autocomplete
- Start simple: just show 4 top-level groups
- Position dropdown below cursor (use absolute positioning)
- Don't overthink the cursor position calculation - a simple approximation works
- Use debounce for filtering (100ms)

### For Modifier Autocomplete
- Fetch all modifiers once on modal open (cache in state)
- Filter by which modifiers are already applied to the tag
- Check if modifier accepts the current tag's group type

### For Right Sidebar
- Parse the entire textarea value on every cursor move (debounced)
- Identify which tag contains the cursor
- Extract tag's group and property
- Display breadcrumb: `group` / `property`

### For Modifier Controls
- Create a registry/map of modifier types to control components
- Each control component renders based on modifier config
- Use WordPress components (SelectControl, ToggleControl, etc.)
- Emit changes back to parent, which updates the textarea

---

## 📝 Notes from Previous Session

- Modal fullscreen was difficult - required 3 strategies (CSS file, inline styles, JS injection)
- WordPress core styles fight with high specificity - use `!important` liberally
- The modal class structure is: `<div class="components-modal__screen-overlay"><div class="components-modal__frame mw-dynamic-tag-builder-modal">`
- Tag tree lazy loading works well - modal opens instantly
- REST API endpoints are functional and return correct hierarchical data

---

## 🎯 Definition of Done

All 8 issues fixed, with:
- ✅ @ autocomplete working with proper positioning and keyboard navigation
- ✅ . (dot) modifier autocomplete working
- ✅ Syntax highlighting with Voxel colors (pink tags, orange modifiers)
- ✅ Right sidebar detects clicked tag and shows modifiers
- ✅ Modifier mini-panels render with appropriate controls
- ✅ Tag feedback UI shows applied tags
- ✅ Live rendering works in editor
- ✅ All changes committed and pushed to branch
- ✅ Modal loads in <100ms
- ✅ No console errors

---

## 📞 Questions to Answer Before Starting

1. Should autocomplete fetch suggestions from API or use cached data?
   - **Recommendation**: Cache top-level groups and modifiers on modal open, fetch nested dynamically

2. How should syntax highlighting work - overlay or parse+render?
   - **Recommendation**: Use CodeMirror or PrismJS for proper highlighting, or simple regex with colored spans

3. Should live rendering happen in the modal or in the actual block?
   - **Recommendation**: Both - preview in modal, actual rendering in block

4. What happens if user types an invalid tag?
   - **Recommendation**: Show warning icon, don't break rendering

Good luck! You have everything you need. The Voxel screenshots show exactly what the UX should look like. Match it pixel-perfect! 🚀
