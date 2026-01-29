# FilterUser 1:1 Voxel Parity Fix

**Date:** January 2026
**Component:** Search Form Block - FilterUser Component
**Status:** Resolved

---

## The Problem

The `FilterUser` component (Author filter) in our Gutenberg Search Form block was not displaying user data correctly. When a user filter had a default value set, the filter would show "Loading..." or "Unknown" instead of the actual user's name.

### Symptoms
- Filter displayed "Loading..." or "Unknown" even when a valid user ID was set
- `filterData.props.user` was always empty/undefined
- Client-side fetch to REST API was required as a workaround

### Expected Behavior (Voxel Elementor Widget)
- Filter displays user name immediately on page load
- No client-side fetch required
- `filterData.props.user` contains `{ name, avatar }` data from PHP

---

## Root Cause Analysis

### Why Our Initial Strategy Failed

Our initial approach was to match Voxel's JavaScript behavior by:
1. Reading filter data from the REST API
2. Using client-side state to manage filter values
3. Fetching user data via a separate REST endpoint when needed

**This strategy failed because we were matching the wrong layer.**

Voxel's JavaScript (`search-form.js`) doesn't fetch user data client-side. The user data is already populated by PHP **before** the JavaScript ever runs.

### The Critical Discovery

After analyzing Voxel's source code, we found the key in `themes/voxel/app/widgets/search-form.php` lines 4192-4203:

```php
// Voxel's workflow (simplified)
$fallback_value = $filter_config['ts_default_value'] === 'yes'
    ? $filter_config['ts_default_value_value']
    : null;

// CRITICAL: set_value() is called BEFORE frontend_props()
$filter->set_value( $filter_value ?? $fallback_value );

// Set reset behavior
if ( $filter_config['ts_reset_value'] === 'default_value' ) {
    $filter->resets_to( $fallback_value );
}

// NOW get the frontend config (which calls frontend_props() internally)
$frontend_config = $filter->get_frontend_config();
```

### The Filter Value Lifecycle

Voxel's filter value lifecycle is:

```
1. set_value($value)     → Stores value internally
2. get_value()           → Returns the stored value
3. frontend_props()      → Uses get_value() to populate props (e.g., user data)
4. get_frontend_config() → Combines all data including props, value, resets_to
```

**Our REST API was skipping step 1**, which meant `frontend_props()` had no value to work with, so `props.user` was never populated.

### Evidence: user-filter.php

In `themes/voxel/app/post-types/filters/user-filter.php`:

```php
public function frontend_props() {
    $value = $this->get_value();  // Returns null if set_value() wasn't called!

    if ( $value !== null ) {
        $user = \Voxel\User::get( $value );
        if ( $user ) {
            return [
                'user' => [
                    'name' => $user->get_display_name(),
                    'avatar' => $user->get_avatar_markup(),
                ],
            ];
        }
    }
    return [];
}
```

---

## The Solution

### 1. Updated REST API Controller

Modified `fse-search-form-controller.php` to match Voxel's exact workflow:

```php
// Accept filter configs via POST body
$filter_configs = [];
if ( $request->get_method() === 'POST' ) {
    $body = $request->get_json_params();
    $filter_configs = $body['filter_configs'] ?? [];
}

foreach ( $filters as $filter ) {
    $filter_key = $filter->get_key();
    $config = $post_type_filter_configs[ $filter_key ] ?? [];

    // CRITICAL: Match Voxel's value lifecycle exactly
    // Evidence: themes/voxel/app/widgets/search-form.php:4192-4201
    $this->setup_filter_value( $filter, $config );

    // NOW get the frontend config (includes value and resets_to)
    $frontend_config = $filter->get_frontend_config();

    $filters_data[] = [
        'key'       => $frontend_config['key'],
        'label'     => $frontend_config['label'],
        'type'      => $frontend_config['type'],
        'icon'      => $frontend_config['icon'],
        'props'     => $frontend_config['props'],  // Now populated!
        'value'     => $frontend_config['value'],
        'resets_to' => $frontend_config['resets_to'],
    ];
}
```

### 2. Created `setup_filter_value()` Method

Replicates Voxel's exact logic:

```php
private function setup_filter_value( $filter, array $config ): void {
    // Step 1: Determine if default value should be used
    $default_value_enabled = ! empty( $config['defaultValueEnabled'] );
    $default_value = $config['defaultValue'] ?? null;

    $fallback_value = null;
    if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
        $fallback_value = $default_value;
    }

    // Step 2: Set the filter value (CRITICAL!)
    $filter->set_value( $fallback_value );

    // Step 3: Set resets_to if resetValue is 'default_value'
    $reset_value = $config['resetValue'] ?? 'empty';
    if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
        $filter->resets_to( $fallback_value );
    }
}
```

### 3. Updated TypeScript to Send Filter Configs

Modified `usePostTypes.ts` to send filter configurations via POST:

```typescript
if (hasFilterConfigs) {
    data = await apiFetch<PostTypeConfig[]>({
        path: '/voxel-fse/v1/search-form/frontend-config',
        method: 'POST',
        data: {
            filter_configs: apiFilterConfigs,
        },
    });
}
```

### 4. Fixed Output Buffering Issue

During implementation, we encountered an `invalid_json` error. The cause was Voxel's `range-filter.php` calling `wp_print_styles('nouislider')` in `frontend_props()`:

```php
// themes/voxel/app/post-types/filters/range-filter.php:217-219
public function frontend_props() {
    if ( ! is_admin() ) {
        wp_print_styles( 'nouislider' );  // Outputs HTML!
    }
    // ...
}
```

**Solution:** Added output buffering to capture and discard unwanted HTML:

```php
public function get_frontend_config( \WP_REST_Request $request ) {
    // Start output buffering
    ob_start();

    // ... process filters ...

    // Discard any captured output
    ob_end_clean();

    return rest_ensure_response( $result );
}
```

---

## Key Lessons Learned

### 1. Match the Right Layer

**Wrong approach:** Match Voxel's JavaScript behavior
**Right approach:** Match Voxel's PHP data preparation

Voxel's JavaScript assumes data is already prepared by PHP. Our REST API needs to replicate the PHP data preparation, not the JavaScript consumption.

### 2. Filter Value Lifecycle Matters

The order of operations is critical:
1. `set_value()` MUST be called before `frontend_props()`
2. `frontend_props()` uses `get_value()` to determine what data to include
3. `get_frontend_config()` combines everything

Skipping any step breaks the chain.

### 3. Voxel's Methods Have Side Effects

Some Voxel filter methods output HTML unexpectedly (like `wp_print_styles()`). Always use output buffering in REST API endpoints that call Voxel filter methods.

### 4. `elementor_config` Must Be Set for Some Filters

Certain filters (terms, location) require `set_elementor_config()` to be called before `frontend_props()` to prevent PHP warnings:

```php
if ( method_exists( $filter, 'set_elementor_config' ) ) {
    $filter->set_elementor_config( $this->get_default_elementor_config( $filter ) );
}
```

---

## Files Modified

| File | Changes |
|------|---------|
| `fse-search-form-controller.php` | Added POST support, `setup_filter_value()`, output buffering |
| `usePostTypes.ts` | Accept `filterConfigs` option, use POST when configs provided |
| `useSearchForm.ts` | Use `filterData.resets_to` from API |
| `FilterUser.tsx` | Use `filterData.value` and `filterData.props.user` from API |
| `types.ts` | Added `resets_to` to FilterData interface |
| `edit.tsx` | Pass `filterLists` to `usePostTypes` |
| `frontend.tsx` | Send filter configs via POST |

---

## Testing Checklist

- [x] REST API returns valid JSON (no HTML prepended)
- [x] `filterData.props.user` is populated when user filter has default value
- [x] Filter displays user name immediately (no "Loading...")
- [x] `clearAll` respects `resets_to` value from API
- [x] Other filters (range, terms, location) work without PHP warnings

---

## References

- **Voxel search-form.php:** Lines 4192-4203 (filter value lifecycle)
- **Voxel user-filter.php:** `frontend_props()` method (user data population)
- **Voxel base-filter.php:** Lines 90-111 (`get_frontend_config()` implementation)
- **Voxel range-filter.php:** Lines 217-219 (`wp_print_styles()` side effect)
