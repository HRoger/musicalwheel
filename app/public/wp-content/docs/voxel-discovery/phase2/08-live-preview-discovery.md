# Discovery: Live Preview Implementation (ServerSideRender vs REST API)

**Discovery Date:** 2025-11-15
**Purpose:** Determine best approach for live preview in product-price FSE block editor

---

## Key Finding: Use REST API with apiFetch (NOT ServerSideRender)

**WordPress Official Guidance:**
> "ServerSideRender should be regarded as a fallback or legacy mechanism, it is not appropriate for developing new features."

> "New blocks should be built in conjunction with any necessary REST API endpoints, so that JavaScript can be used for rendering client-side in the edit function, which gives the best user experience."

**Source:** WordPress Block Editor Handbook
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-server-side-render/
- https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/creating-dynamic-blocks/

---

## Approach Comparison

### ❌ ServerSideRender (NOT Recommended)

**How it works:**
- React component makes API call to `/wp/v2/block-renderer/:block`
- WordPress executes `render_callback` function
- Returns HTML to display in editor
- Re-renders on every attribute change

**Code Example:**
```typescript
import ServerSideRender from '@wordpress/server-side-render';

export default function Edit({ attributes }) {
  return (
    <ServerSideRender
      block="musicalwheel/product-price"
      attributes={attributes}
    />
  );
}
```

**Issues:**
- ❌ HTTP request per attribute change
- ❌ Loading spinner flashes on every change
- ❌ Slow editor experience
- ❌ WordPress officially discourages for new blocks
- ❌ Limited client-side control

**Evidence:** Phase 1 discovery mentioned ServerSideRender at `/docs/voxel-discovery/phase1/dynamic-system/CRITICAL_DISCOVERY.md:426-475`

---

### ✅ REST API with apiFetch (RECOMMENDED)

**How it works:**
- Create custom REST endpoint that returns JSON data
- Fetch data once in React component
- Render preview using fetched data
- No re-fetch on attribute changes (only on post ID change)

**Code Example:**

**PHP - REST Endpoint:**
```php
// Register endpoint
add_action('rest_api_init', function() {
  register_rest_route('musicalwheel/v1', '/product-price/(?P<id>\d+)', [
    'methods' => 'GET',
    'callback' => 'mw_get_product_price_data',
    'permission_callback' => '__return_true',
  ]);
});

// Endpoint handler - reuse Voxel logic
function mw_get_product_price_data($request) {
  $post_id = $request['id'];
  $post = \Voxel\get_post($post_id);

  if (!$post) {
    return new WP_Error('no_post', 'Post not found', ['status' => 404]);
  }

  $field = $post->get_field('product');
  if (!$field || $field->get_type() !== 'product') {
    return new WP_Error('no_product', 'Not a product post', ['status' => 400]);
  }

  // Check availability (same logic as render.php)
  try {
    $field->check_product_form_validity();
    $is_available = true;
  } catch (\Exception $e) {
    $is_available = false;
    $error_message = $e->getCode() === \Voxel\PRODUCT_ERR_OUT_OF_STOCK
      ? 'Out of stock'
      : 'Unavailable';
  }

  $data = ['isAvailable' => $is_available];

  if ($is_available) {
    $reference_date = \Voxel\now();

    // Calculate prices (same as render.php)
    $regular_price = $field->get_minimum_price_for_date($reference_date, [
      'with_discounts' => false,
    ]);

    $discount_price = $field->get_minimum_price_for_date($reference_date, [
      'with_discounts' => true,
    ]);

    $currency = \Voxel\get_primary_currency();

    // Return formatted AND raw values
    $data['regularPrice'] = [
      'raw' => $regular_price,
      'formatted' => \Voxel\currency_format($regular_price, $currency, false),
    ];

    $data['discountPrice'] = [
      'raw' => $discount_price,
      'formatted' => \Voxel\currency_format($discount_price, $currency, false),
    ];

    $data['hasDiscount'] = $discount_price < $regular_price;

    // Calculate suffix (booking/subscription)
    $suffix = '';
    $product_type = $field->get_product_type();

    if ($booking = $field->get_product_field('booking')) {
      if ($booking->get_booking_type() === 'days') {
        $suffix = $product_type->config('modules.booking.date_ranges.count_mode') === 'nights'
          ? ' / night'
          : ' / day';
      }
    }

    if ($subscription_interval = $field->get_product_field('subscription-interval')) {
      $interval = $field->get_value()['subscription'];
      $formatted_interval = \Voxel\interval_format($interval['unit'], $interval['frequency']);
      $suffix = ' / ' . $formatted_interval;
    }

    $data['suffix'] = $suffix;
  } else {
    $data['errorMessage'] = $error_message;
  }

  return rest_ensure_response($data);
}
```

**TypeScript - React Component:**
```typescript
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';

interface ProductPriceData {
  isAvailable: boolean;
  errorMessage?: string;
  regularPrice?: {
    raw: number;
    formatted: string;
  };
  discountPrice?: {
    raw: number;
    formatted: string;
  };
  hasDiscount: boolean;
  suffix: string;
}

export default function Edit({ attributes, setAttributes, context }: EditProps) {
  const blockProps = useBlockProps();
  const [priceData, setPriceData] = useState<ProductPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get post ID from context (when used in templates)
  const postId = useSelect((select) => {
    return select('core/editor').getCurrentPostId();
  }, []);

  // Fetch price data from REST API
  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    apiFetch<ProductPriceData>({
      path: `/musicalwheel/v1/product-price/${postId}`
    })
      .then((data) => {
        setPriceData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load price data');
        setLoading(false);
      });
  }, [postId]); // Only re-fetch if post ID changes

  // Loading state
  if (!postId) {
    return (
      <div {...blockProps}>
        <div className="notice notice-warning">
          Product Price block must be used on a product page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div {...blockProps}>
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div {...blockProps}>
        <div className="notice notice-error">{error}</div>
      </div>
    );
  }

  if (!priceData) {
    return null;
  }

  // Render live preview (same markup as frontend)
  return (
    <div {...blockProps}>
      <div className="mw-product-price">
        {priceData.isAvailable ? (
          <>
            {priceData.hasDiscount ? (
              <>
                <span className="vx-price">
                  {priceData.discountPrice?.formatted}{priceData.suffix}
                </span>
                <span className="vx-price">
                  <s>{priceData.regularPrice?.formatted}{priceData.suffix}</s>
                </span>
              </>
            ) : (
              <span className="vx-price">
                {priceData.regularPrice?.formatted}{priceData.suffix}
              </span>
            )}
          </>
        ) : (
          <span className="vx-price no-stock">{priceData.errorMessage}</span>
        )}
      </div>
    </div>
  );
}
```

**Benefits:**
- ✅ Single fetch per post (not per attribute change)
- ✅ Fast, responsive editor experience
- ✅ No loading spinners during editing
- ✅ Full React control over display
- ✅ Can cache data client-side
- ✅ WordPress recommended approach

**Evidence:** Found real-world usage in:
- `/themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/CodeEditor.tsx:152` (apiFetch usage)
- `/themes/musicalwheel-fse/app/blocks/src/components/DynamicTagBuilder/index.tsx:70` (apiFetch usage)
- Elementor plugin uses similar patterns at `/plugins/elementor/assets/js/ai-gutenberg.js`

---

## Hybrid Approach (Recommended for Product-Price)

### Strategy

1. **Editor:** Fetch data via REST API → Render in React
2. **Frontend:** Use existing `render.php` (no duplication)

### Why Hybrid?

**Product-price block requirements:**
- ✅ Complex Voxel PHP logic (must stay in PHP)
- ✅ Price calculations use Voxel methods
- ✅ Currency formatting via Voxel helpers
- ✅ Stock checking via Voxel exceptions
- ✅ Live preview in editor (user requirement)
- ✅ No loading spinners (better UX)

**Solution:**
- REST endpoint handles all PHP logic
- Returns pre-formatted JSON data
- React component renders preview
- `render.php` handles frontend (optimized, working)

---

## Implementation Plan for Product-Price Block

### Step 1: Create REST Endpoint Class

**File:** `/themes/musicalwheel-fse/app/blocks/src/product-price/Product_Price_REST.php`

```php
<?php
namespace MusicalWheel\Blocks;

class Product_Price_REST {
  public function register_routes() {
    register_rest_route('musicalwheel/v1', '/product-price/(?P<id>\d+)', [
      'methods' => 'GET',
      'callback' => [$this, 'get_price_data'],
      'permission_callback' => '__return_true',
      'args' => [
        'id' => [
          'validate_callback' => function($param) {
            return is_numeric($param);
          }
        ],
      ],
    ]);
  }

  public function get_price_data($request) {
    // Implementation from render.php logic
    // Return JSON instead of rendering HTML
  }
}
```

### Step 2: Register REST Routes

**File:** `/themes/musicalwheel-fse/app/blocks/Block_Loader.php`

Add to `init()` method:
```php
// Register REST API endpoints
add_action('rest_api_init', [$this, 'register_rest_routes']);
```

Add method:
```php
public function register_rest_routes() {
  // Auto-load REST classes from each block directory
  foreach ($this->blocks as $block_name => $block_info) {
    $rest_class = $block_info['path'] . '/Product_Price_REST.php';
    if (file_exists($rest_class)) {
      require_once $rest_class;
      $rest_instance = new \MusicalWheel\Blocks\Product_Price_REST();
      $rest_instance->register_routes();
    }
  }
}
```

### Step 3: Update Edit Component

**File:** `/themes/musicalwheel-fse/app/blocks/src/product-price/edit.tsx`

See code example above in "REST API with apiFetch" section.

### Step 4: Add TypeScript Types

**File:** `/themes/musicalwheel-fse/app/blocks/src/product-price/types.ts`

```typescript
export interface ProductPriceData {
  isAvailable: boolean;
  errorMessage?: string;
  regularPrice?: {
    raw: number;
    formatted: string;
  };
  discountPrice?: {
    raw: number;
    formatted: string;
  };
  hasDiscount: boolean;
  suffix: string;
}
```

### Step 5: Keep Existing Frontend Rendering

**File:** `/themes/musicalwheel-fse/app/blocks/src/product-price/render.php`

Keep current implementation - it works correctly for frontend.

---

## Caching Strategy

### Server-Side Caching (5 min TTL per CLAUDE.md)

```php
function mw_get_product_price_data($request) {
  $post_id = $request['id'];
  $cache_key = "mw_product_price_{$post_id}";

  // Check cache first
  $cached = wp_cache_get($cache_key);
  if ($cached !== false) {
    return $cached;
  }

  // Calculate price data
  $data = [ /* ... complex calculations ... */ ];

  // Cache for 5 minutes (per project standards)
  wp_cache_set($cache_key, $data, '', 300);

  return rest_ensure_response($data);
}
```

### Client-Side Caching

React state automatically caches data - no re-fetch unless post ID changes.

---

## Dependencies Required

### TypeScript/React
```typescript
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
```

### Already Available
Evidence from existing code:
- `@wordpress/api-fetch` already configured in `vite.config.ts:53`
- `@wordpress/api-fetch` mapped in `Block_Loader.php:83`
- Already used in `DynamicTagBuilder/CodeEditor.tsx:10`

**No new dependencies needed!**

---

## Comparison with Voxel Widget

### Voxel Widget (Elementor)
- **Editor:** Live preview via Vue.js `content_template()` OR static placeholder
- **Frontend:** PHP `render()` method
- **Note:** product-price has NO `content_template()` (lines 170-171 are empty)

### FSE Block (Our Approach)
- **Editor:** Live preview via REST API + React (better than Voxel!)
- **Frontend:** PHP `render.php` (same as Voxel)
- **Advantage:** Our editor preview is MORE functional than Voxel's

---

## Next Steps

1. ✅ Complete remaining discoveries (InspectorControls, Responsive controls)
2. Create REST endpoint class for product-price
3. Update edit.tsx with apiFetch implementation
4. Add TypeScript types
5. Test live preview in editor
6. Verify frontend rendering still works

---

## Key Takeaways

1. **Use REST API + apiFetch** for all new FSE blocks (WordPress best practice)
2. **Avoid ServerSideRender** (legacy/fallback only)
3. **Keep render.php** for frontend (no duplication, optimal performance)
4. **Reuse Voxel logic** in REST endpoint (same calculations, different output format)
5. **Single fetch** per post ID (not per attribute change)
6. **Cache aggressively** (5 min server-side, React state client-side)

---

## References

- WordPress Block Editor Handbook: https://developer.wordpress.org/block-editor/
- ServerSideRender Package: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-server-side-render/
- REST API Handbook: https://developer.wordpress.org/rest-api/
- apiFetch Package: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-api-fetch/
- Phase 1 Discovery: `/docs/voxel-discovery/phase1/dynamic-system/CRITICAL_DISCOVERY.md:426-475`
