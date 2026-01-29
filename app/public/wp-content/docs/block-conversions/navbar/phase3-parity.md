# Navbar Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Complete (100% parity)
**Reference:** navbar.php (1,183 lines) - PHP widget with template

## Summary

The navbar block has **100% parity** with Voxel's implementation. All core features are implemented: 4 source types (manual links, WordPress menus, template tabs, search form link), orientation control (horizontal/vertical), collapsible sidebar mode, hamburger menu with mobile/desktop/tablet display options, multi-column popup menu, icon display controls, menu item states (current/hover/active), and comprehensive styling controls. The React implementation adds REST API integration for headless/Next.js compatibility while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| navbar.php (1,183 lines) | Navbar Widget | **PHP widget with template** |
| navbar.php (template) | Widget Template | Menu rendering |

The widget is PHP-based with WordPress menu integration. It renders navigation menus with 4 different source types and supports both horizontal and vertical orientations.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/navbar.php` (1,183 lines)
- **Template:** `themes/voxel/templates/widgets/navbar.php`
- **Widget ID:** ts-navbar
- **Framework:** PHP with template rendering + WordPress Menus
- **Purpose:** Display navigation menus with multiple source options

### Voxel HTML Structure

```html
<!-- Horizontal navbar -->
<nav class="ts-nav ts-nav-horizontal">
  <ul class="ts-wp-menu">
    <li class="menu-item menu-item-has-children current-menu-item">
      <a href="#" class="ts-item-link">
        <i class="ts-item-icon las la-home"></i>
        <span>Home</span>
        <i class="ts-down-icon las la-angle-down"></i>
      </a>
      <!-- Dropdown submenu (multi-column if enabled) -->
      <ul class="sub-menu">
        <li class="menu-item">
          <a href="#" class="ts-item-link">Submenu Item</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>

<!-- Vertical collapsible navbar -->
<nav class="ts-nav ts-nav-vertical ts-nav-collapsible" style="--collapsed-width: 60px; --expanded-width: 250px;">
  <ul class="ts-wp-menu">
    <!-- Same menu structure -->
  </ul>
</nav>

<!-- Hamburger menu (mobile) -->
<div class="ts-mobile-menu">
  <button class="ts-burger-icon">
    <i class="las la-bars"></i>
  </button>
  <!-- Mobile menu slides in -->
</div>
```

### Data Flow (from Voxel PHP)

- Gets menu source type from widget settings (manual, wp_menu, template_tabs, search_form)
- Fetches WordPress menu via wp_nav_menu() if using select_wp_menu source
- Renders manual items from repeater if using add_links_manually source
- Applies orientation (horizontal/vertical) classes
- Applies justify alignment (left/center/right/space-between/space-around)
- Handles collapsible state for vertical navbars
- Renders hamburger menu based on viewport settings
- Applies custom styling from 60+ widget controls
- Handles multi-column popup menu if enabled

### Source Types

| Source | Description | Data |
|--------|-------------|------|
| add_links_manually | Manual repeater | ts_navbar_items (repeater with text, icon, link, active state) |
| select_wp_menu | WordPress menu | ts_navbar_menu (menu location) |
| template_tabs | Template Tabs link | Links to Template Tabs widget on same page |
| search_form | Search Form link | Links to Search Form widget results |

### Orientation Modes

| Mode | Class | Features |
|------|-------|----------|
| Horizontal | `.ts-nav-horizontal` | Standard top nav, justify alignment, overflow scroll |
| Vertical | `.ts-nav-vertical` | Sidebar nav, collapsible option, fixed width |

## React Implementation Analysis

### File Structure
```
app/blocks/src/navbar/
├── frontend.tsx              (~450 lines) - Entry point with hydration
├── shared/
│   └── NavbarComponent.tsx   - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** ~15 kB | gzip: ~4 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Fetches menu data via REST API** (`/voxel-fse/v1/navbar/menu`)
2. **4 source types** (manual, wp_menu, template_tabs, search_form)
3. **Same HTML structure** as Voxel's template (`.ts-nav`, `.ts-wp-menu`, `.menu-item`, `.ts-item-link`)
4. **Same CSS classes** for all elements and states
5. **Two orientation modes** (horizontal, vertical)
6. **Collapsible sidebar** with CSS variables
7. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-nav | Main nav container | ✅ Done |
| .ts-nav-horizontal | Horizontal orientation | ✅ Done |
| .ts-nav-vertical | Vertical orientation | ✅ Done |
| .ts-nav-collapsible | Collapsible sidebar | ✅ Done |
| .ts-wp-menu | Menu list (ul) | ✅ Done |
| .menu-item | Menu item (li) | ✅ Done |
| .menu-item-has-children | Has dropdown | ✅ Done |
| .current-menu-item | Active state | ✅ Done |
| .ts-item-link | Item link (a) | ✅ Done |
| .ts-item-icon | Item icon | ✅ Done |
| .ts-down-icon | Dropdown chevron | ✅ Done |
| .sub-menu | Dropdown submenu | ✅ Done |
| .ts-mobile-menu | Mobile menu container | ✅ Done |
| .ts-burger-icon | Hamburger button | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **SOURCE (Content)** | 4 | ✅ Done |
| - ts_navbar_source | Source type (4 options) | ✅ Done |
| - ts_navbar_menu | WordPress menu location | ✅ Done |
| - ts_navbar_mobile_menu | Mobile menu location | ✅ Done |
| - ts_navbar_items | Manual items repeater | ✅ Done |
| **LAYOUT (Style)** | 6 | ✅ Done |
| - ts_nav_orientation | Horizontal/vertical | ✅ Done |
| - ts_nav_justify | Alignment (5 options) | ✅ Done |
| - ts_nav_collapsible | Collapsible toggle | ✅ Done |
| - ts_nav_collapsed_width | Collapsed width (px) | ✅ Done |
| - ts_nav_expanded_width | Expanded width (px) | ✅ Done |
| - ts_nav_show_menu_label | Show text labels | ✅ Done |
| **HAMBURGER MENU (Content)** | 5 | ✅ Done |
| - ts_burger_title | Hamburger title | ✅ Done |
| - ts_burger_show_desktop | Show on desktop | ✅ Done |
| - ts_burger_show_tablet | Show on tablet | ✅ Done |
| - ts_burger_icon | Hamburger icon | ✅ Done |
| - ts_burger_close_icon | Close icon | ✅ Done |
| **ICONS (Content)** | 3 | ✅ Done |
| - ts_nav_show_icon | Show/hide icons | ✅ Done |
| - ts_nav_icon_on_top | Icon position | ✅ Done |
| - ts_down_icon | Dropdown chevron | ✅ Done |
| **POPUP MENU (Style)** | 6 | ✅ Done |
| - ts_custom_menu_popup | Custom popup toggle | ✅ Done |
| - ts_custom_menu_cols | Multi-column layout | ✅ Done |
| - ts_set_menu_cols | Number of columns | ✅ Done |
| - ts_popup_backdrop_blur | Backdrop blur | ✅ Done |
| - ts_popup_box_shadow | Popup shadow | ✅ Done |
| - ts_popup_max_height | Max height | ✅ Done |
| **ITEM STYLING - NORMAL** | 12 | ✅ Done |
| - ts_item_padding | Padding (responsive) | ✅ Done |
| - ts_item_height | Height (responsive) | ✅ Done |
| - ts_item_typography | Typography (group) | ✅ Done |
| - ts_item_color | Text color | ✅ Done |
| - ts_item_bg | Background | ✅ Done |
| - ts_item_border | Border (group) | ✅ Done |
| - ts_item_border_radius | Border radius | ✅ Done |
| - ts_item_box_shadow | Box shadow (group) | ✅ Done |
| - ts_icon_size | Icon size (responsive) | ✅ Done |
| - ts_icon_color | Icon color | ✅ Done |
| - ts_icon_margin | Icon spacing (responsive) | ✅ Done |
| - ts_chevron_size | Chevron size (responsive) | ✅ Done |
| **ITEM STYLING - HOVER** | 6 | ✅ Done |
| - ts_item_color_h | Text color (hover) | ✅ Done |
| - ts_item_bg_h | Background (hover) | ✅ Done |
| - ts_item_border_h | Border (hover) | ✅ Done |
| - ts_item_box_shadow_h | Shadow (hover) | ✅ Done |
| - ts_icon_color_h | Icon color (hover) | ✅ Done |
| - ts_chevron_color_h | Chevron color (hover) | ✅ Done |
| **ITEM STYLING - ACTIVE** | 6 | ✅ Done |
| - ts_item_color_a | Text color (active) | ✅ Done |
| - ts_item_bg_a | Background (active) | ✅ Done |
| - ts_item_border_a | Border (active) | ✅ Done |
| - ts_item_box_shadow_a | Shadow (active) | ✅ Done |
| - ts_icon_color_a | Icon color (active) | ✅ Done |
| - ts_chevron_color_a | Chevron color (active) | ✅ Done |
| **MOBILE MENU** | 8+ | ✅ Done |
| - Mobile overlay, slide-in panel | ✅ Done |
| - Mobile menu item styling | ✅ Done |

**Total Style Controls:** 60+ controls (4 source + 6 layout + 5 hamburger + 45+ styling)

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch menu data | REST API `/voxel-fse/v1/navbar/menu` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Normalize items | Handle both array and object repeater formats | ✅ Done |
| Render orientation | Horizontal/vertical classes | ✅ Done |
| Render collapsible | CSS variables for width | ✅ Done |
| Render hamburger | Mobile menu toggle | ✅ Done |
| Render menu items | WordPress menu structure | ✅ Done |
| Handle active state | `.current-menu-item` class | ✅ Done |
| Multi-column popup | Grid columns if enabled | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No menu selected | Show empty state | ✅ Done |
| Invalid menu location | Fallback to manual items | ✅ Done |
| No manual items | Show placeholder | ✅ Done |
| Collapsible (no width) | Use defaults (60px/250px) | ✅ Done |
| Mobile menu | Slide-in overlay | ✅ Done |
| Deep nesting | Recursive submenu rendering | ✅ Done |
| Active item detection | WordPress .current-menu-item | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Re-initialization | `data-react-mounted` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/navbar/menu | REST GET | ✅ Done |

### API Response Structure

```typescript
interface NavbarMenuApiResponse {
  items: NavbarMenuItem[];
  location: string;
}

interface NavbarMenuItem {
  id: number;
  title: string;
  url: string;
  icon?: VoxelIcon;
  classes: string[];
  target?: string;
  rel?: string;
  children?: NavbarMenuItem[];
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- NavbarManualItem type for repeater items
- VoxelIcon type for icon objects
- useState for menu state management
- useEffect for REST API menu fetching
- CSS variables for dynamic styling (60+ controls)
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- Loading and error states

## Build Output

```
frontend.js  ~15 kB | gzip: ~4 kB
```

## Conclusion

The navbar block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-nav`, `.ts-wp-menu`, `.menu-item`, `.ts-item-link`, `.current-menu-item`)
- All 4 source types supported (manual, wp_menu, template_tabs, search_form)
- All 60+ style controls supported
- Two orientation modes (horizontal + vertical)
- Collapsible sidebar mode with CSS variables
- Hamburger menu with mobile/desktop/tablet display control
- Multi-column popup menu
- Icon display controls (show/hide, icon on top)
- Three-state item styling (normal/hover/active)
- WordPress menu integration with active item detection
- REST API menu fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel navbar widget is a comprehensive navigation system (1,183 lines PHP). Our React implementation adds:
- REST API menu fetching for headless/Next.js compatibility
- Client-side menu state management
- Loading and error states

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-based with WordPress Menus integration

**Unique Features:**
- **4 source types**: Manual links, WordPress menus, Template Tabs, Search Form
- **Dual orientation**: Horizontal (top nav) and vertical (sidebar) with collapsible mode
- **Hamburger menu**: Separate menu location for mobile with viewport display control
- **Multi-column popup**: Grid layout for dropdown menus
- **Icon controls**: Show/hide icons, icon position (side/top)
- **Three-state styling**: Normal, hover, and active states with complete control set
- **WordPress integration**: Native WordPress menu walker with active item detection
- **Collapsible sidebar**: CSS variables for collapsed (60px default) and expanded (250px default) widths
