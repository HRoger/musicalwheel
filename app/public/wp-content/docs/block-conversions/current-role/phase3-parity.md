# Current Role Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** current-role.php (596 lines) - PHP-only widget

## Summary

The current-role block has **100% parity** with Voxel's implementation. **Important Note:** The Voxel current-role widget is PHP-only with no client-side JavaScript. It displays the current user's role(s) and provides links to switch between available roles. The React implementation correctly renders the same HTML structure as Voxel's PHP template while adding REST API data fetching for headless/Next.js compatibility.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| current-role.php (596 lines) | Current Role Widget | **PHP-only (core widget)** |
| current-role.php (template) | HTML Template | PHP template |

There is **no JavaScript file** for this widget - it's purely server-rendered with Voxel's native role switching system (via `?vx=1&action=roles.switch_role`).

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/current-role.php` (596 lines)
- **Template:** `themes/voxel/templates/widgets/current-role.php`
- **Widget ID:** ts-current-role
- **Framework:** PHP-only (no JavaScript)
- **Purpose:** Display current user role and allow role switching
- **AJAX Action:** `roles.switch_role` (uses `vx-action` attribute for Voxel's AJAX handler)

### Voxel HTML Structure

```html
<div class="ts-panel active-plan role-panel">
  <div class="ac-head">
    <svg><!-- role icon --></svg>
    <b>User role</b>
  </div>

  <div class="ac-body">
    <!-- With roles -->
    <p>Your current role is Vendor</p>

    <!-- No roles -->
    <p>You do not have a role assigned currently.</p>

    <!-- Switch role buttons (if can_switch && has switchable_roles) -->
    <div class="ac-bottom">
      <ul class="simplify-ul current-plan-btn">
        <li>
          <a vx-action class="ts-btn ts-btn-1" href="/?vx=1&action=roles.switch_role&role_key=customer&_wpnonce=...">
            <svg><!-- switch icon --></svg>
            Switch to Customer
          </a>
        </li>
        <li>
          <a vx-action class="ts-btn ts-btn-1" href="/?vx=1&action=roles.switch_role&role_key=vendor&_wpnonce=...">
            <svg><!-- switch icon --></svg>
            Switch to Vendor
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
```

### Data Flow (from Voxel PHP)

- Gets current user roles via `$current_user->get_roles()`
- Checks if role switching is enabled: `\Voxel\get( 'settings.membership.enable_role_switcher' )`
- Gets switchable roles (all available roles user can switch to)
- Generates switch URLs with Voxel's AJAX action: `?vx=1&action=roles.switch_role`
- Uses `vx-action` attribute for AJAX handling

### Role Switching System

**Important:** Voxel handles role switching via its native AJAX system:
- URL format: `/?vx=1&action=roles.switch_role&role_key={key}&_wpnonce={nonce}`
- Attribute: `vx-action` on the link triggers Voxel's AJAX handler
- The `vx-action` attribute prevents default link behavior and uses AJAX instead
- On success, page refreshes to show new role state

## React Implementation Analysis

### File Structure
```
app/blocks/src/current-role/
├── frontend.tsx              (~295 lines) - Entry point with hydration
├── shared/
│   └── CurrentRoleComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 14.08 kB | gzip: 4.88 kB

### Architecture

Since the Voxel widget is PHP-only, our React implementation:

1. **Fetches role data via REST API** (`/voxel-fse/v1/current-role`)
2. **Renders same HTML structure** as Voxel's PHP template
3. **Uses same CSS classes** (`.ts-panel`, `.ac-head`, `.ac-body`, `.current-plan-btn`, etc.)
4. **Supports same style controls** (panel style, icons, buttons, typography)
5. **Includes `vx-action` attribute** on switch links for Voxel's AJAX handling
6. **Conditional rendering** based on roles and switch availability

This is intentionally headless-ready for Next.js migration while maintaining compatibility with Voxel's native role switching system.

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-panel.active-plan.role-panel | Main panel container | ✅ Done |
| .ac-head | Header with icon and label | ✅ Done |
| .ac-head svg/i | Header icon | ✅ Done |
| .ac-head b | "User role" text | ✅ Done |
| .ac-body | Body content area | ✅ Done |
| .ac-body p | Current role text | ✅ Done |
| .ac-bottom | Footer section | ✅ Done |
| .simplify-ul.current-plan-btn | Button list | ✅ Done |
| .ts-btn.ts-btn-1 | Button links | ✅ Done |
| [vx-action] attribute | Voxel AJAX handler trigger | ✅ Done |

### Style Controls (All from Voxel widget)

| Control | Implementation | Status |
|---------|---------------|--------|
| **ICONS** | | |
| ts_role_ico | Role icon | ✅ Done |
| ts_switch_ico | Switch icon | ✅ Done |
| **PANEL** | | |
| panel_border | Border | ✅ Done |
| panel_radius | Border radius | ✅ Done |
| panel_bg | Background color | ✅ Done |
| panel_shadow | Box shadow | ✅ Done |
| **PANEL HEAD** | | |
| head_padding | Padding | ✅ Done |
| head_ico_size | Icon size | ✅ Done |
| head_ico_margin | Icon margin | ✅ Done |
| head_ico_col | Icon color | ✅ Done |
| head_typo | Typography | ✅ Done |
| head_typo_col | Text color | ✅ Done |
| head_border_col | Separator color | ✅ Done |
| **PANEL BODY** | | |
| panel_spacing | Body padding | ✅ Done |
| panel_gap | Content gap | ✅ Done |
| text_align | Text alignment | ✅ Done |
| body_typo | Typography | ✅ Done |
| body_typo_col | Text color | ✅ Done |
| **BUTTONS** | | |
| panel_buttons_gap | Button gap | ✅ Done |
| scnd_btn_typo | Typography | ✅ Done |
| scnd_btn_radius | Border radius | ✅ Done |
| scnd_btn_c | Text color | ✅ Done |
| scnd_btn_padding | Padding | ✅ Done |
| scnd_btn_height | Height | ✅ Done |
| scnd_btn_bg | Background | ✅ Done |
| scnd_btn_border | Border | ✅ Done |
| scnd_btn_icon_size | Icon size | ✅ Done |
| scnd_btn_icon_pad | Icon padding | ✅ Done |
| scnd_btn_icon_color | Icon color | ✅ Done |
| scnd_btn_c_h | Text color (hover) | ✅ Done |
| scnd_btn_bg_h | Background (hover) | ✅ Done |
| scnd_btn_border_h | Border (hover) | ✅ Done |
| scnd_btn_icon_color_h | Icon color (hover) | ✅ Done |

### State Rendering

| State | Voxel Output | React Output | Status |
|-------|--------------|--------------|--------|
| Not logged in | "Please login" message | Same | ✅ Done |
| Logged in + roles | "Your current role is X" | Same | ✅ Done |
| Logged in + no roles | "You do not have a role..." | Same | ✅ Done |
| Can switch roles | Show switch buttons | Same | ✅ Done |
| Cannot switch roles | Hide switch section | Same | ✅ Done |
| Multiple roles | Comma-separated list | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch role data | REST API `/voxel-fse/v1/current-role` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Conditional rendering | Based on isLoggedIn, canSwitch, roles | ✅ Done |
| Icon rendering | Support for 2 icon controls | ✅ Done |
| Switch URL generation | Include nonce and role_key | ✅ Done |
| vx-action attribute | Added to switch links | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | ✅ Done |
| Not logged in | Show login message | ✅ Done |
| No roles assigned | "You do not have a role..." | ✅ Done |
| Multiple roles | Comma-separated display | ✅ Done |
| Single switchable role | Show one switch button | ✅ Done |
| Multiple switchable roles | Show all switch buttons | ✅ Done |
| Role switching disabled | Hide switch section | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/current-role | REST GET | ✅ Done |
| /?vx=1&action=roles.switch_role | Voxel AJAX (via vx-action) | ✅ Native |

### API Response Structure

```typescript
interface CurrentRoleApiResponse {
  isLoggedIn: boolean;
  canSwitch: boolean;              // If role switcher is enabled
  currentRoles: Array<{            // User's current role(s)
    key: string;
    label: string;
  }>;
  switchableRoles: Array<{         // Roles user can switch to
    key: string;
    label: string;
    switchUrl: string;             // Pre-built URL with nonce
  }>;
  rolesLabel: string;              // Formatted comma-separated role names
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- Icon object normalizations (2 icons)
- Conditional rendering for roles and switch availability
- useMemo for style computation
- CSS variables for dynamic styling
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners
- `vx-action` attribute for Voxel AJAX compatibility

## Build Output

```
frontend.js  14.08 kB | gzip: 4.88 kB
Built in 108ms
```

## Conclusion

The current-role block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-panel`, `.ac-head`, `.ac-body`, `.current-plan-btn`, etc.)
- Role display with conditional rendering
- All 2 icon controls supported
- All 30+ style controls supported via CSS variables
- Button states with hover effects
- Multiple roles handling (comma-separated)
- Switchable roles with proper URLs
- `vx-action` attribute for native Voxel AJAX handling
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel current-role widget has **no JavaScript** - it's purely PHP-rendered HTML with Voxel's native AJAX system handling role switching. Our React implementation adds:
- REST API data fetching for headless/Next.js compatibility
- Client-side hydration
- Loading and error states
- Conditional rendering based on role state
- Maintains `vx-action` attribute for Voxel's AJAX handler

**Role Switching:** The block generates links with `vx-action` attribute that trigger Voxel's native AJAX handler (`?vx=1&action=roles.switch_role`). This ensures full compatibility with Voxel's role management system.

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-only

## Differences from Other Tier 4 Blocks

| Block | Purpose | User Action | AJAX Handler |
|-------|---------|-------------|--------------|
| current-plan | Show membership plan | Manage/switch via links | Native navigation |
| current-role | Show user roles | Switch role via `vx-action` | Voxel AJAX system |
| listing-plans | Select listing plan | Pick plan via `vx-pick-plan` | listing-plans-widget.js |
| membership-plans | Select membership | Pick plan via `vx-pick-plan` | pricing-plans.js |
| product-price | Show product price | N/A (display only) | None |
| stripe-account | Manage Stripe Connect | Form submission | Native forms |

The current-role block is unique in using the `vx-action` attribute for role switching, which integrates with Voxel's native AJAX system rather than having dedicated JavaScript like the plan selection widgets.
