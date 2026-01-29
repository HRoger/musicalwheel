# Project Namespace Configuration

This theme supports **dual REST API namespaces** for multi-project deployments.

## Overview

The theme registers REST API endpoints on **TWO namespaces simultaneously**:

1. **Generic Internal API**: `/wp-json/voxel-fse/v1/` (always available)
2. **Project-Branded API**: `/wp-json/PROJECT_NAMESPACE/v1/` (if configured)

Both APIs point to the same functionality but allow for project-specific branding when exposing public APIs.

## Configuration

Add this constant to your `wp-config.php` file:

```php
/**
 * Project-specific REST API namespace
 * 
 * Defines the branded namespace for public REST API endpoints.
 * If not defined, only the generic 'voxel-fse/v1' namespace will be available.
 */
define('PROJECT_NAMESPACE', 'musicalwheel'); // Or 'upbeatjobs', 'yourproject', etc.
```

## Examples

### MusicalWheel Configuration

```php
// wp-config.php
define('PROJECT_NAMESPACE', 'musicalwheel');
```

**Available APIs:**
- Internal: `https://api.musicalwheel.com/wp-json/voxel-fse/v1/dynamic-data/groups`
- Public: `https://api.musicalwheel.com/wp-json/musicalwheel/v1/dynamic-data/groups`

### UpbeatJobs Configuration

```php
// wp-config.php
define('PROJECT_NAMESPACE', 'upbeatjobs');
```

**Available APIs:**
- Internal: `https://api.upbeatjobs.com/wp-json/voxel-fse/v1/dynamic-data/groups`
- Public: `https://api.upbeatjobs.com/wp-json/upbeatjobs/v1/dynamic-data/groups`

## Use Cases

### Internal API (`voxel-fse/v1`)

Use for:
- Admin dashboard
- Development and debugging
- Internal tools
- Consistent across all project instances

### Project-Branded API (`PROJECT_NAMESPACE/v1`)

Use for:
- Public API documentation
- ATS integrations
- Job board syndication
- External partner integrations
- Professional, branded API endpoints

## Benefits

✅ **Single Codebase**: One theme works for all projects  
✅ **Branded APIs**: Each project gets its own API namespace  
✅ **Easy Deployment**: Just set one constant per project  
✅ **Fallback Support**: Generic API always available  
✅ **Professional**: Clean, branded public APIs

## Next.js Frontend Configuration

Point your Next.js frontend to the branded API:

```javascript
// musicalwheel.com/.env.local
NEXT_PUBLIC_WORDPRESS_API_URL=https://api.musicalwheel.com/wp-json/musicalwheel/v1

// upbeatjobs.com/.env.local
NEXT_PUBLIC_WORDPRESS_API_URL=https://api.upbeatjobs.com/wp-json/upbeatjobs/v1
```

## Adding Custom Project-Specific Endpoints

You can add endpoints that only exist on the branded namespace:

```php
// In your custom plugin or theme
add_action('rest_api_init', function() {
    if (defined('PROJECT_NAMESPACE')) {
        register_rest_route(
            PROJECT_NAMESPACE . '/v1',
            '/ats/applicants',
            [
                'methods' => 'POST',
                'callback' => 'handle_ats_applicants',
                'permission_callback' => 'check_ats_permission',
            ]
        );
    }
});
```

This endpoint will only be available on the branded API, not the generic one.
