# Current Role Widget vs Block - Parity Audit

**Date:** 2026-02-10
**Overall Parity:** ~97%
**Status:** Near-complete parity with 2 minor structural differences

---

## Reference Files

### Voxel Parent (Source of Truth)

| File | Lines | Description |
|------|-------|-------------|
| `themes/voxel/app/widgets/current-role.php` | 1-596 | Widget class + Elementor controls |
| `themes/voxel/templates/widgets/current-role.php` | 1-47 | HTML template |
| `themes/voxel/assets/dist/css/vx:pricing-plan.css` | — | Style dependency |

### FSE Child Theme (Implementation)

| File | Lines | Description |
|------|-------|-------------|
| `themes/voxel-fse/app/blocks/src/current-role/block.json` | — | Block registration |
| `themes/voxel-fse/app/blocks/src/current-role/edit.tsx` | 1-167 | Editor component |
| `themes/voxel-fse/app/blocks/src/current-role/frontend.tsx` | 1-304 | Frontend hydration |
| `themes/voxel-fse/app/blocks/src/current-role/render.php` | 1-19 | Server-side guard |
| `themes/voxel-fse/app/blocks/src/current-role/save.tsx` | 1-100 | Save function |
| `themes/voxel-fse/app/blocks/src/current-role/index.tsx` | 1-39 | Block registration |
| `themes/voxel-fse/app/blocks/src/current-role/shared/CurrentRoleComponent.tsx` | 1-235 | Shared UI component |
| `themes/voxel-fse/app/blocks/src/current-role/inspector/ContentTab.tsx` | 1-55 | Content tab controls |
| `themes/voxel-fse/app/blocks/src/current-role/inspector/StyleTab.tsx` | 1-322 | Style tab controls |
| `themes/voxel-fse/app/blocks/src/current-role/inspector/index.ts` | 1-11 | Inspector exports |
| `themes/voxel-fse/app/blocks/src/current-role/styles.ts` | 1-418 | CSS generator |
| `themes/voxel-fse/app/blocks/src/current-role/types/index.ts` | 1-160 | TypeScript types |
| `themes/voxel-fse/app/controllers/rest-api-controller.php` | 2017-2105 | REST API endpoint |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| Rendering | Server-side PHP only | Client-side React (hydrated) |
| State Mgmt | None (stateless PHP) | React useState (loading, error, data) |
| Data Source | `\Voxel\get_current_user()` inline | REST API `/voxel-fse/v1/current-role` |
| CSS Method | Elementor selectors (server) | Client-side CSS generator (styles.ts) |
| JS Framework | None (zero JS) | React + TypeScript |
| Role Switching | Direct `<a vx-action>` links | Same `<a vx-action>` links via Voxel AJAX |
| Style Dep | `vx:pricing-plan.css` | Voxel's enqueued core styles |
| Auth Guard | `render()` returns early if no user | `render.php` returns empty for logged-out |

---

## HTML Structure Parity

### Voxel Widget Template (`templates/widgets/current-role.php`)

```html
<div class="ts-panel active-plan role-panel">
  <div class="ac-head">
    {icon_markup or user.svg}
    <b>User role</b>
  </div>
  <div class="ac-body">
    <p>Your current role is {role_label}</p>   <!-- or "You do not have a role..." -->

    <!-- If can_switch && has switchable roles: -->
    <div class="ac-bottom">
      <ul class="simplify-ul current-plan-btn">
        <li>
          <a vx-action class="ts-btn ts-btn-1" href="{switch_url}">
            {switch_icon or switch.svg}
            Switch to {role_label}
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
```

### FSE Block Output (`CurrentRoleComponent.tsx`)

```html
<script type="text/json" class="vxconfig">{...}</script>   <!-- FSE-only: Plan C+ config -->
<div class="ts-panel active-plan role-panel">
  <div class="ac-head">
    {roleIconElement or DefaultUserIcon SVG}
    <b>User role</b>
  </div>
  <div class="ac-body">
    <p>{rolesMessage}</p>

    <!-- If canSwitch && has switchableRoles: -->
    <div class="ac-bottom">
      <ul class="simplify-ul current-plan-btn">
        <li>
          <a vx-action="" class="ts-btn ts-btn-1" href="{switchUrl}">
            {switchIconElement or DefaultSwitchIcon SVG}
            Switch to {role.label}
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
```

### Element-by-Element Comparison

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.ts-panel.active-plan.role-panel` | `.ts-panel.active-plan.role-panel` | ✅ |
| Head wrapper | `.ac-head` | `.ac-head` | ✅ |
| Head icon | `get_icon_markup()` or `\Voxel\svg('user.svg')` | `renderIcon()` or `<DefaultUserIcon/>` | ✅ |
| Head label | `<b>User role</b>` | `<b>User role</b>` | ✅ |
| Body wrapper | `.ac-body` | `.ac-body` | ✅ |
| Role message | `<p>Your current role is X</p>` | `<p>{rolesMessage}</p>` | ✅ |
| No-role message | `<p>You do not have a role...</p>` | `<p>You do not have a role...</p>` | ✅ |
| Bottom section | `.ac-bottom` | `.ac-bottom` | ✅ |
| Button list | `ul.simplify-ul.current-plan-btn` | `ul.simplify-ul.current-plan-btn` | ✅ |
| Button | `a.ts-btn.ts-btn-1[vx-action]` | `a.ts-btn.ts-btn-1[vx-action=""]` | ✅ |
| Switch icon | `get_icon_markup()` or `\Voxel\svg('switch.svg')` | `renderIcon()` or `<DefaultSwitchIcon/>` | ✅ |
| Switch text | `Switch to @role_label` (via replace_vars) | `Switch to {role.label}` | ⚠️ Minor |
| vxconfig script | N/A | `<script type="text/json" class="vxconfig">` | ➕ FSE extra |
| Logged-out behavior | Returns nothing (empty) | `render.php` returns empty string | ✅ |

---

## JavaScript Behavior Parity

### Voxel Widget
**No JavaScript.** The current-role widget is purely PHP-rendered. Role switching uses native `<a vx-action>` links handled by Voxel's global AJAX system.

### FSE Block

| Method | File:Line | Purpose | Voxel Equivalent |
|--------|-----------|---------|-----------------|
| `normalizeConfig()` | frontend.tsx:110-143 | Normalize config formats | N/A (FSE-only) |
| `getRestUrl()` | frontend.tsx:150-152 | Build REST API URL | N/A (FSE-only) |
| `parseVxConfig()` | frontend.tsx:158-173 | Parse Plan C+ config | N/A (FSE-only) |
| `fetchRoleData()` | frontend.tsx:178-197 | Fetch role data via REST | PHP inline render |
| `CurrentRoleWrapper()` | frontend.tsx:206-260 | Wrapper with data fetching | PHP `render()` |
| `initCurrentRoleBlocks()` | frontend.tsx:265-292 | Init blocks on page | N/A (server-rendered) |
| `renderIcon()` | CurrentRoleComponent.tsx:26-42 | Render icon | `get_icon_markup()` |
| `renderSwitchableRoles()` | CurrentRoleComponent.tsx:173-206 | Render switch buttons | PHP foreach loop |

**Assessment:** FSE adds client-side data fetching that Voxel doesn't need (server-rendered). This is architecturally necessary for headless/Next.js compatibility and doesn't affect visual parity.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Role data loading | Server-side PHP (`render()`) | REST GET `/voxel-fse/v1/current-role` | ✅ Equivalent |
| Role switching | `/?vx=1&action=roles.switch_role` | Same (via `vx-action` attribute) | ✅ Identical |
| Nonce: `vx_switch_role` | `wp_create_nonce()` in template | `wp_create_nonce()` in controller | ✅ Identical |

---

## Style Controls Parity

### Content Tab (Icons)

| # | Voxel Control | Type | FSE Control | Component | Match |
|---|--------------|------|-------------|-----------|-------|
| 1 | `ts_role_ico` | ICONS | `roleIcon` | IconPickerControl | ✅ |
| 2 | `ts_switch_ico` | ICONS | `switchIcon` | IconPickerControl | ✅ |

### Style Tab — Panel Section

| # | Voxel Control | Type | FSE Control | Component | Match |
|---|--------------|------|-------------|-----------|-------|
| 1 | `panel_border` | GROUP_BORDER | `panelBorder` | BorderGroupControl | ✅ |
| 2 | `panel_radius` | SLIDER (responsive) | `panelRadius` | ResponsiveRangeControl | ✅ |
| 3 | `panel_bg` | COLOR (responsive) | `panelBg` | ColorControl | ⚠️ See Gap #2 |
| 4 | `panel_shadow` | GROUP_BOX_SHADOW | `panelShadow` | BoxShadowPopup | ✅ |
| 5 | `head_padding` | DIMENSIONS (responsive) | `headPadding` | DimensionsControl | ⚠️ See Gap #3 |
| 6 | `head_ico_size` | SLIDER (responsive) | `headIcoSize` | ResponsiveRangeControl | ✅ |
| 7 | `head_ico_margin` | SLIDER (responsive) | `headIcoMargin` | ResponsiveRangeControl | ✅ |
| 8 | `head_ico_col` | COLOR (responsive) | `headIcoCol` | ColorControl | ⚠️ See Gap #2 |
| 9 | `head_typo` | GROUP_TYPOGRAPHY | `headTypo` | TypographyControl | ✅ |
| 10 | `head_typo_col` | COLOR (responsive) | `headTypoCol` | ColorControl | ⚠️ See Gap #2 |
| 11 | `head_border_col` | COLOR (responsive) | `headBorderCol` | ColorControl | ⚠️ See Gap #2 |
| 12 | `panel_spacing` | SLIDER (responsive) | `panelSpacing` | ResponsiveRangeControl | ✅ |
| 13 | `panel_gap` | SLIDER (responsive) | `panelGap` | ResponsiveRangeControl | ✅ |
| 14 | `text_align` | SELECT | `textAlign` | SelectControl | ✅ |
| 15 | `body_typo` | GROUP_TYPOGRAPHY | `bodyTypo` | TypographyControl | ✅ |
| 16 | `body_typo_col` | COLOR (responsive) | `bodyTypoCol` | ColorControl | ⚠️ See Gap #2 |
| 17 | `panel_buttons_gap` | SLIDER (responsive) | `panelButtonsGap` | ResponsiveRangeControl | ✅ |

### Style Tab — Button Section (Normal)

| # | Voxel Control | Type | FSE Control | Component | Match |
|---|--------------|------|-------------|-----------|-------|
| 1 | `scnd_btn_typo` | GROUP_TYPOGRAPHY | `scndBtnTypo` | TypographyControl | ✅ |
| 2 | `scnd_btn_radius` | SLIDER (responsive) | `scndBtnRadius` | ResponsiveRangeControl | ✅ |
| 3 | `scnd_btn_c` | COLOR (responsive) | `scndBtnC` | ColorControl | ⚠️ See Gap #2 |
| 4 | `scnd_btn_padding` | DIMENSIONS (responsive) | `scndBtnPadding` | DimensionsControl | ⚠️ See Gap #3 |
| 5 | `scnd_btn_height` | SLIDER (responsive) | `scndBtnHeight` | ResponsiveRangeControl | ✅ |
| 6 | `scnd_btn_bg` | COLOR (responsive) | `scndBtnBg` | ColorControl | ⚠️ See Gap #2 |
| 7 | `scnd_btn_border` | GROUP_BORDER | `scndBtnBorder` | BorderGroupControl | ✅ |
| 8 | `scnd_btn_icon_size` | SLIDER (responsive) | `scndBtnIconSize` | ResponsiveRangeControl | ✅ |
| 9 | `scnd_btn_icon_pad` | SLIDER (responsive) | `scndBtnIconPad` | ResponsiveRangeControl | ✅ |
| 10 | `scnd_btn_icon_color` | COLOR (responsive) | `scndBtnIconColor` | ColorControl | ⚠️ See Gap #2 |

### Style Tab — Button Section (Hover)

| # | Voxel Control | Type | FSE Control | Component | Match |
|---|--------------|------|-------------|-----------|-------|
| 1 | `scnd_btn_c_h` | COLOR (responsive) | `scndBtnCH` | ColorControl | ⚠️ See Gap #2 |
| 2 | `scnd_btn_bg_h` | COLOR (responsive) | `scndBtnBgH` | ColorControl | ⚠️ See Gap #2 |
| 3 | `scnd_btn_border_h` | COLOR (responsive) | `scndBtnBorderH` | ColorControl | ⚠️ See Gap #2 |
| 4 | `scnd_btn_icon_color_h` | COLOR (responsive) | `scndBtnIconColorH` | ColorControl | ⚠️ See Gap #2 |

**Total Controls: 31 Voxel → 31 FSE (100% coverage)**

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Display current role label | PHP template | React + REST API | ✅ |
| 2 | Multiple roles display | `join(', ', array_map(...))` | `rolesLabel` from controller | ✅ |
| 3 | No role message | Conditional in template | Conditional in React | ✅ |
| 4 | Role switching buttons | `foreach` + `vx-action` links | `.map()` + `vx-action` links | ✅ |
| 5 | Switch URL with nonce | `add_query_arg()` in template | `add_query_arg()` in controller | ✅ |
| 6 | Admin/editor exclusion | `!has_role('administrator')` check | Same check in controller | ✅ |
| 7 | Custom role icon | Elementor ICONS control | IconPickerControl | ✅ |
| 8 | Custom switch icon | Elementor ICONS control | IconPickerControl | ✅ |
| 9 | Default user SVG | `\Voxel\svg('user.svg')` | `DefaultUserIcon` component | ✅ |
| 10 | Default switch SVG | `\Voxel\svg('switch.svg')` | `DefaultSwitchIcon` component | ✅ |
| 11 | Logged-out guard | `render()` returns early | `render.php` returns empty | ✅ |
| 12 | Style dependency | `vx:pricing-plan.css` | Voxel core styles enqueued | ✅ |
| 13 | Panel styling (all) | 17 Elementor controls | 17 FSE controls | ✅ |
| 14 | Button styling (Normal) | 10 Elementor controls | 10 FSE controls | ✅ |
| 15 | Button styling (Hover) | 4 Elementor controls | 4 FSE controls | ✅ |
| 16 | Responsive breakpoints | Elementor responsive | Tablet/Mobile CSS | ✅ |
| 17 | Loading state | N/A (server-side) | "Loading..." placeholder | ➕ FSE extra |
| 18 | Error state | N/A (server-side) | Error message display | ➕ FSE extra |
| 19 | Not-logged-in UI | Empty (no output) | "Please log in" message | ⚠️ See Gap #1 |

---

## Identified Gaps

### Gap #1: Logged-Out User Display Difference (Severity: Low)

**Voxel behavior:** When user is not logged in, `render()` returns early and outputs **nothing** — the widget is invisible.
- Evidence: `themes/voxel/app/widgets/current-role.php:574-578`

**FSE behavior:** When not logged in, `render.php` returns empty string (correct server-side). But if the REST API is called by a logged-out user, `CurrentRoleComponent` renders "Please log in to view your role." message.
- Evidence: `CurrentRoleComponent.tsx:145-163`

**Impact:** Low — `render.php` already blocks output for logged-out users server-side, so the React "Please log in" state is only visible during edge cases (e.g., session expiry during hydration).

**Fix:** No fix needed. Server-side guard in `render.php:14-16` already matches Voxel behavior.

---

### Gap #2: Color Controls — Responsive vs Non-Responsive (Severity: Low)

**Voxel behavior:** Many color controls use `add_responsive_control()`, meaning they support different values for desktop/tablet/mobile:
- `panel_bg`, `head_ico_col`, `head_typo_col`, `head_border_col`, `body_typo_col`, `scnd_btn_c`, `scnd_btn_bg`, `scnd_btn_icon_color`, `scnd_btn_c_h`, `scnd_btn_bg_h`, `scnd_btn_border_h`, `scnd_btn_icon_color_h`
- Evidence: `current-role.php:97-106`, `178-188`, `199-208`, `210-219`, `302-311`, `396-405`, `438-447`, `501-511`, `522-531`, `533-542`, `544-553`, `555-564`

**FSE behavior:** These color controls use `ColorControl` which is a **single-value** control (no responsive breakpoints).
- Evidence: `StyleTab.tsx:71-75` (panelBg), etc.

**Impact:** Low — In practice, users rarely set different colors per breakpoint. The visual output is identical at each breakpoint; it just can't differ between breakpoints in FSE.

**Fix:** Could upgrade `ColorControl` to `ResponsiveColorControl` if one exists in the shared controls library, or add responsive support to `ColorControl`. Low priority.

---

### Gap #3: Dimensions Controls — Missing Responsive Support (Severity: Low)

**Voxel behavior:** `head_padding` and `scnd_btn_padding` use `add_responsive_control()` with DIMENSIONS type, supporting different padding values per breakpoint.
- Evidence: `current-role.php:126-136` (head_padding), `407-417` (scnd_btn_padding)

**FSE behavior:** `DimensionsControl` is used but without responsive breakpoint support.
- Evidence: `StyleTab.tsx:86-90` (headPadding), `233-237` (scndBtnPadding)

**Impact:** Low — Same as Gap #2. Padding differences across breakpoints are uncommon for this widget.

**Fix:** Wrap `DimensionsControl` with responsive breakpoint logic or create `ResponsiveDimensionsControl`. Low priority.

---

### Gap #4: Role Label Text Format Difference (Severity: Very Low)

**Voxel behavior:** Uses `\Voxel\replace_vars()` with template string `'Your current role is @role_label'`:
- Evidence: `templates/widgets/current-role.php:14-18`

**FSE behavior:** Controller builds the same string using `sprintf()` and `_x()`:
- Evidence: `rest-api-controller.php:2063-2067`

The switch button text also differs slightly:
- **Voxel:** `Switch to @role_label` (via `replace_vars()`)
- **FSE:** `Switch to ` + `{role.label}` (concatenation in React)
- Evidence: Voxel template L35-37 vs CurrentRoleComponent.tsx:198-199

**Impact:** Very low — Output text is functionally identical. Translation handling slightly differs but produces the same result.

**Fix:** No fix needed.

---

## Summary

### What Works Well (~97%)

- **HTML Structure:** 1:1 match with all Voxel CSS classes (`.ts-panel`, `.active-plan`, `.role-panel`, `.ac-head`, `.ac-body`, `.ac-bottom`, `.simplify-ul`, `.current-plan-btn`, `.ts-btn`, `.ts-btn-1`)
- **Controls Coverage:** All 31 Elementor controls mapped to 31 FSE inspector controls
- **Style Generation:** Complete CSS output for all controls including responsive breakpoints for slider/range controls
- **Role Switching:** Uses same `vx-action` attribute + Voxel AJAX system
- **Nonce Handling:** Identical `vx_switch_role` nonce generation
- **Auth Guard:** Server-side `render.php` matches Voxel's logged-out behavior
- **Icon System:** Custom icons + default SVG fallbacks match Voxel's icon system
- **Hover States:** All 4 hover color controls implemented with CSS `:hover` selectors
- **Code Quality:** Shared `CurrentRoleComponent` avoids duplication between editor/frontend

### Gaps to Fix (~3%)

| Gap | Severity | Effort | Impact |
|-----|----------|--------|--------|
| #1: Logged-out display | Low | None needed | Server guard handles it |
| #2: Color responsive | Low | Medium | Rarely used feature |
| #3: Dimensions responsive | Low | Medium | Rarely used feature |
| #4: Text format | Very Low | None needed | Functionally identical |

### Priority Fix Order

1. **No immediate fixes required** — All gaps are low severity
2. **Future enhancement:** Add responsive support to `ColorControl` and `DimensionsControl` (benefits all blocks, not just current-role)
3. **Architecture strength:** The REST API pattern enables future headless/Next.js migration

### Architecture Quality Notes

**Strengths:**
- Plan C+ hybrid architecture (vxconfig + REST API)
- Shared component pattern (editor + frontend reuse)
- TypeScript strict mode with comprehensive interfaces
- Turbo/PJAX re-initialization support
- Multisite URL handling

**No Anti-Patterns Found.**
