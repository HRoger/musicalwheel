# Advanced List Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** advanced-list.php (1185 lines) - "Actions (VX)" PHP widget

## Summary

The advanced-list block has **100% parity** with Voxel's implementation. All core features are implemented: 18 action types (from simple links to complex calendar exports and shopping cart integration), comprehensive repeater system with 26 properties per item, three-state styling (normal/hover/active), tooltip system with positioning control, flexible layout options (flexbox/CSS grid), icon container styling, and post context integration via REST API. The React implementation adds REST API post context fetching for headless/Next.js compatibility while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| advanced-list.php (1185 lines) | Actions (VX) Widget | **PHP widget with template** |
| advanced-list.php (template) | Widget Template | Action list rendering |

The widget is one of Voxel's most complex PHP widgets (1185 lines). It supports 18 different action types with dynamic behavior based on post context and user state.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/advanced-list.php` (1185 lines)
- **Template:** `themes/voxel/templates/widgets/advanced-list.php`
- **Widget ID:** ts-advanced-list
- **Widget name:** "Actions (VX)"
- **Framework:** PHP with template rendering + vx-action JavaScript
- **Purpose:** Multi-purpose action list for various interactive actions

### Action Types (18 Total)

| Action Type | Description | Special Features |
|-------------|-------------|------------------|
| none | Static display only | No interaction |
| action_link | Simple link | URL control |
| add_to_cart | Add product to cart | Cart integration, "select options" state |
| toggle_follow | Follow/unfollow post | Active state toggle |
| post_review | Open review popup | Popup integration |
| follow_user | Follow user | User context required |
| unfollow_user | Unfollow user | User context required |
| edit_post | Edit post | Edit link |
| moderate_post | Approve/delete | Admin action |
| delete_post | Delete post | Confirmation required |
| scroll_to_section | Scroll to element | Section ID parameter |
| share_twitter | Share on Twitter | Social sharing |
| share_facebook | Share on Facebook | Social sharing |
| share_email | Share via email | Email mailto link |
| share_linkedin | Share on LinkedIn | Social sharing |
| share_whatsapp | Share on WhatsApp | Mobile-friendly |
| gcal | Export to Google Calendar | Event data required |
| ical | Export to iCalendar | Event data required |

### Voxel HTML Structure

```html
<div class="ts-advanced-list">
  <!-- Action item -->
  <div class="ts-action">
    <a href="#" class="ts-action-con" data-action="toggle_follow">
      <!-- Icon container -->
      <div class="ts-action-icon">
        <i class="las la-heart"></i>
      </div>
      <!-- Text -->
      <span>Follow</span>
    </a>
    <!-- Tooltip (via ::after pseudo-element when enabled) -->
  </div>

  <!-- Active state example -->
  <div class="ts-action">
    <a href="#" class="ts-action-con active" data-action="toggle_follow">
      <div class="ts-action-icon">
        <i class="las la-heart-broken"></i>
      </div>
      <span>Unfollow</span>
    </a>
  </div>

  <!-- Add to cart with select options state -->
  <div class="ts-action">
    <a href="#" class="ts-action-con" data-action="add_to_cart">
      <div class="ts-action-icon">
        <i class="las la-shopping-cart"></i>
      </div>
      <span>Add to cart</span>
    </a>
  </div>

  <!-- More actions... -->
</div>
```

### Data Flow (from Voxel PHP)

- Gets action items from repeater field (ts_actions)
- Gets post context (ID, type, status, author, etc.)
- Gets user context (logged in, following status, etc.)
- Renders each action with appropriate state (normal/active)
- Applies custom styling from widget controls
- Handles tooltips via CSS ::after pseudo-element
- Voxel.js handles dynamic actions (follow, cart, delete, etc.)

### State Management

| State | Class | When Applied |
|-------|-------|--------------|
| Normal | `.ts-action-con` | Default state |
| Hover | `.ts-action-con:hover` | On mouse hover |
| Active | `.ts-action-con.active` | When action is active (e.g., already following) |

## React Implementation Analysis

### File Structure
```
app/blocks/src/advanced-list/
├── frontend.tsx              (~700 lines) - Entry point with hydration
├── shared/
│   └── AdvancedListComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types (ActionItem with 26 properties!)
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** ~23.52 kB | gzip: ~6.15 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Fetches post context via REST API** (`/voxel-fse/v1/post-context/{postId}`)
2. **18 action types** with proper handling for each
3. **Same HTML structure** as Voxel's template (`.ts-advanced-list`, `.ts-action`, `.ts-action-con`, etc.)
4. **Same CSS classes** for all elements and states
5. **Three-state styling** (normal/hover/active)
6. **Tooltip system** with position control (top/bottom)
7. **normalizeConfig()** for dual-format API compatibility with 14 specialized helpers

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-advanced-list | Main list container | ✅ Done |
| .ts-action | Action item wrapper | ✅ Done |
| .ts-action-con | Action container (linkable) | ✅ Done |
| .ts-action-icon | Icon container | ✅ Done |
| .active | Active state class | ✅ Done |
| ::after pseudo | Tooltip content | ✅ Done |

### Action Types

| Action Type | Implementation | Status |
|-------------|---------------|--------|
| none | Static display | ✅ Done |
| action_link | Simple link | ✅ Done |
| add_to_cart | Cart integration | ✅ Done |
| toggle_follow | Follow/unfollow | ✅ Done |
| post_review | Review popup | ✅ Done |
| follow_user | Follow user | ✅ Done |
| unfollow_user | Unfollow user | ✅ Done |
| edit_post | Edit link | ✅ Done |
| moderate_post | Approve/delete | ✅ Done |
| delete_post | Delete post | ✅ Done |
| scroll_to_section | Scroll to element | ✅ Done |
| share_twitter | Twitter share | ✅ Done |
| share_facebook | Facebook share | ✅ Done |
| share_email | Email share | ✅ Done |
| share_linkedin | LinkedIn share | ✅ Done |
| share_whatsapp | WhatsApp share | ✅ Done |
| gcal | Google Calendar export | ✅ Done |
| ical | iCalendar export | ✅ Done |

**Total Action Types:** 18/18 (100%)

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **REPEATER ITEM (Content)** | 24 | ✅ Done |
| - ts_action_type | Action type (18 options) | ✅ Done |
| - ts_addition_id | Addition ID | ✅ Done |
| - ts_action_link | Link URL | ✅ Done |
| - ts_scroll_to | Section ID | ✅ Done |
| - ts_action_cal_* | Calendar fields (6 total) | ✅ Done |
| - ts_acw_initial_text | Default text | ✅ Done |
| - ts_enable_tooltip | Enable tooltip | ✅ Done |
| - ts_tooltip_text | Tooltip text | ✅ Done |
| - ts_acw_initial_icon | Default icon | ✅ Done |
| - ts_cart_opts_* | Cart options (4 total) | ✅ Done |
| - ts_acw_reveal_* | Active state (4 total) | ✅ Done |
| - ts_acw_custom_style | Custom styling | ✅ Done |
| - ts_acw_icon_color_custom | Custom icon colors (2 total) | ✅ Done |
| **ICONS (Content)** | 4 | ✅ Done |
| - ts_close_ico | Close icon | ✅ Done |
| - ts_message_ico | Direct message icon | ✅ Done |
| - ts_link_ico | Copy link icon | ✅ Done |
| - ts_share_ico | Share via icon | ✅ Done |
| **LIST (Style)** | 6 | ✅ Done |
| - csgrid_action_on | Enable CSS grid (responsive) | ✅ Done |
| - ts_cgrid_columns | Grid columns (responsive) | ✅ Done |
| - ts_al_columns_no | Item width mode | ✅ Done |
| - ts_al_columns_cstm | Custom width (responsive) | ✅ Done |
| - ts_al_justify | List justify (responsive) | ✅ Done |
| - ts_cgrid_gap | Item gap (responsive) | ✅ Done |
| **LIST ITEM - NORMAL** | 9 | ✅ Done |
| - ts_al_align | Justify content (responsive) | ✅ Done |
| - ts_action_padding | Padding (responsive dimensions) | ✅ Done |
| - ts_acw_height | Height (responsive) | ✅ Done |
| - ts_acw_border | Border (group) | ✅ Done |
| - ts_acw_border_radius | Border radius | ✅ Done |
| - ts_acw_border_shadow | Box shadow (group) | ✅ Done |
| - ts_acw_typography | Typography (group) | ✅ Done |
| - ts_acw_initial_color | Text color | ✅ Done |
| - ts_acw_initial_bg | Background color | ✅ Done |
| **ICON CONTAINER - NORMAL** | 6 | ✅ Done |
| - ts_acw_icon_con_bg | Background | ✅ Done |
| - ts_acw_icon_con_size | Size (responsive) | ✅ Done |
| - ts_acw_icon_con_border | Border (group) | ✅ Done |
| - ts_acw_icon_con_radius | Border radius | ✅ Done |
| - ts_acw_con_shadow | Box shadow (group) | ✅ Done |
| - ts_acw_icon_margin | Icon/text spacing (responsive) | ✅ Done |
| **ICON - NORMAL** | 3 | ✅ Done |
| - ts_acw_icon_orient | Icon on top | ✅ Done |
| - ts_acw_icon_size | Icon size (responsive) | ✅ Done |
| - ts_acw_icon_color | Icon color | ✅ Done |
| **LIST ITEM - HOVER** | 7 | ✅ Done |
| - ts_acw_border_shadow_h | Box shadow (hover) | ✅ Done |
| - ts_acw_border_h | Border color (hover) | ✅ Done |
| - ts_acw_initial_color_h | Text color (hover) | ✅ Done |
| - ts_acw_initial_bg_h | Background (hover) | ✅ Done |
| - ts_acw_icon_con_bg_h | Icon container bg (hover) | ✅ Done |
| - ts_acw_icon_con_bord_h | Icon container border (hover) | ✅ Done |
| - ts_acw_icon_color_h | Icon color (hover) | ✅ Done |
| **LIST ITEM - ACTIVE** | 7 | ✅ Done |
| - ts_acw_border_shadow_a | Box shadow (active) | ✅ Done |
| - ts_acw_initial_color_a | Text color (active) | ✅ Done |
| - ts_acw_initial_bg_a | Background (active) | ✅ Done |
| - ts_acw_initial_border_a | Border color (active) | ✅ Done |
| - ts_acw_icon_con_bg_a | Icon container bg (active) | ✅ Done |
| - ts_acw_icon_con_bord_a | Icon container border (active) | ✅ Done |
| - ts_acw_icon_color_a | Icon color (active) | ✅ Done |
| **TOOLTIPS (Style)** | 5 | ✅ Done |
| - tooltip_bottom | Display below item | ✅ Done |
| - ts_tooltip_color | Text color | ✅ Done |
| - ts_tooltip_typo | Typography (group) | ✅ Done |
| - ts_tooltip_bg | Background color | ✅ Done |
| - ts_tooltip_radius | Border radius (responsive) | ✅ Done |

**Total Style Controls:** 71 controls (24 repeater + 4 icons + 43 styling)

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch post context | REST API `/voxel-fse/v1/post-context/{postId}` | ✅ Done |
| Normalize config | `normalizeConfig()` with 14 specialized helpers | ✅ Done |
| Normalize items | Handle both array and object repeater formats | ✅ Done |
| Render list | Flexbox or CSS grid based on setting | ✅ Done |
| Render actions | All 18 action types | ✅ Done |
| Handle states | Normal/hover/active styling | ✅ Done |
| Render tooltips | CSS ::after pseudo-element | ✅ Done |
| Icon rendering | Support for default and active icons | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No items | Show empty state | ✅ Done |
| No post ID | Limited actions available | ✅ Done |
| Not logged in | Hide user-specific actions | ✅ Done |
| Already following | Show active state with unfollow | ✅ Done |
| Cart product | Show "select options" for variable products | ✅ Done |
| Calendar actions | Generate .ics file or Google Calendar URL | ✅ Done |
| Tooltip overflow | Position control (top/bottom) | ✅ Done |
| Custom styling | Per-item color overrides | ✅ Done |
| Re-initialization | `data-react-mounted` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/post-context/{postId} | REST GET | ✅ Done |

### API Response Structure

```typescript
interface PostContext {
  id: number;
  type: string;
  status: 'publish' | 'draft' | 'pending' | 'private';
  author: number;
  title: string;
  url: string;
  editUrl?: string;
  isFollowing?: boolean;
  canEdit?: boolean;
  canModerate?: boolean;
  canDelete?: boolean;
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility with **14 specialized helper functions**:
  - normalizeString, normalizeNumber, normalizeBoolean
  - normalizeIcon, normalizeBoxValues, normalizeBoxShadow, normalizeTypography
  - normalizeLinkConfig, normalizeActionItem, normalizeItems
  - normalizeIcons, normalizeList, normalizeItemStyle, normalizeIconContainer
  - normalizeIconSettings, normalizeHoverStyle, normalizeActiveStyle, normalizeTooltip
- ActionItem type with 26 properties per item
- VxConfig type with 9 nested sections (items, icons, list, itemStyle, iconContainer, icon, hoverStyle, activeStyle, tooltip)
- useState for action state management
- useEffect for REST API post context fetching
- CSS variables for dynamic styling (71 controls)
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- Loading and error states

## Build Output

```
frontend.js  ~23.52 kB | gzip: ~6.15 kB
```

## Conclusion

The advanced-list block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-advanced-list`, `.ts-action`, `.ts-action-con`, `.ts-action-icon`)
- All 18 action types implemented
- All 71 style controls supported (24 repeater + 4 icons + 43 styling)
- Three-state styling (normal/hover/active)
- Tooltip system with position control
- Flexible layout (flexbox/CSS grid)
- Icon container styling with separate normal/hover/active states
- POST context integration via REST API
- vxconfig parsing with 14 specialized normalization helpers
- Multisite support

**Key Insight:** The Voxel advanced-list widget is the **most complex action widget** (1185 lines PHP). Our React implementation adds:
- REST API post context fetching for headless/Next.js compatibility
- Client-side action state management
- Dynamic action rendering based on user and post context
- Loading and error states

**Architecture:** Headless-ready with REST API post context - Voxel widget is PHP-based with vx-action JavaScript

**Unique Features:**
- **18 action types**: Most diverse action set (link, cart, follow, edit, delete, calendar, social sharing, etc.)
- **Complex repeater**: Each item has 26 configurable properties
- **Three-state styling**: Normal, hover, and active states with independent controls
- **Tooltip system**: Built-in tooltips with position control (top/bottom)
- **CSS Grid option**: Supports both flexbox and CSS grid layouts
- **Calendar integration**: Google Calendar and iCalendar export with event data
- **Shopping cart integration**: Add to cart with "select options" state for variable products
- **Post context dependent**: Many actions require dynamic post context from REST API
- **14 specialized normalizers**: Most comprehensive normalizeConfig() implementation across all blocks
