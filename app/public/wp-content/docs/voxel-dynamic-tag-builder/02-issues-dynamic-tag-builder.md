Several issues with the Dynamic data panel

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


### Issue 3: @ Autocomplete Dropdown (HIGH PRIORITY)  (SOLVED! TASK COMPLETE!)
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

### Issue 4: When writing the "." dot in a tag script the quick tag insert mod dropdown does not show (SOLVED! TASK COMPLETE!)
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

### Issue 5: When clicking inside a voxel tag , the Tagline(site/Tagline) with the dropdown "add a mod" (SOLVED! TASK COMPLETE!)
- modifiers ADD a MOD does not show up in the right sidebar (it show only when clicking inside a tag script)
  **Current state**: Basic placeholder exists, no click detection
  **What's needed**:
- When user clicks after a tag (cursor position within `@tag(prop).mod()`), detect the tag
- Show tag path in right sidebar: "Site / Title" with breadcrumb
- Show "Add a mod" dropdown
- Display currently applied modifiers in list
- Reference: Screenshot `Screenshot 2025-11-12 144056.jpg`
- Reference: Screenshot `Screenshot 2025-11-12 144056.jpg`  

### Issue 6: The right sidebar modifiers should work  like this: (SOLVED! TASK COMPLETE!)
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


---

###  Issue 7: Syntax Highlighting Colors (HIGH PRIORITY) (SOLVED! TASK COMPLETE!)
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

### Issue 8: The tags script colors don't match voxel. They are all white color. (SOLVED! TASK COMPLETE!)
- Reference: Screenshot `Screenshot 2025-11-13 150020.jpg` showing elementor-voxel dynamic tag controls

### Issue 9: unecessary intructions and panel. (SOLVED! TASK COMPLETE!)
- not needed instruction: "Use @group(property) syntax. Press @ to quickly add a tag. Example: @post(title).truncate(50)"
- The instruction should be placed as a placedholder in the code editor like voxel does
- Reference: Screenshot `Screenshot 2025-11-13 151035.jpg` Not needed panel

### Issue 10: Not follwing voxel modal layout and colors.  (SOLVED! TASK COMPLETE!)
- Button discard shoould be in the right side near the save button.
- Arrow color should be very light gray when down, 
- Arrow color should be pink (not red) when up and expanded (Also the text of the color item should be pink)
- Reference: Screenshot `Screenshot 2025-11-13 150106.jpg` overall layout doesn't match voxel.

### Issue 11: Sidebar left: The tree behaves as a accordion (SOLVED! TASK COMPLETE!)
- Reference: Screenshot `Screenshot 2025-11-12 144205.jpg` accordion like behaviour. In this example, the top parent is expanded by default. 
I can expand any subparent. But if there are other subparents, they are collapsed. In the reference screenshot, 
Site -> Post types -> 3 subparents (If I open one "Spaces", all others are collapsed)

### Issue 12: Top parents and subparents too slow to load (5-10s)  (SOLVED! TASK COMPLETE!)
- Clicking a top parent or subparent with children item delays 5-10s while in Voxel is nearly instateous.
- Reference: Screenshot `Screenshot 2025-11-13 150035.jpg` loading...