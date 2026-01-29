---

## 2. Gutenberg Editor Form Rendering

### 2.1 The Challenge

**Goal:** Show the entire create-post form inside the Gutenberg block editor with:
- Full form preview matching frontend
- All configured fields visible
- Real-time updates when settings change
- Accurate representation for content creators

**Why This Is Hard:**
- Form structure depends on Voxel post type configuration
- Fields are dynamically loaded from Voxel's field definitions
- Need to access Voxel PHP APIs (can't do client-side)
- Form HTML is complex (file uploads, validation, etc.)

---

### 2.2 The Solution: ServerSideRender

**Architecture Pattern:** Dynamic Block with Server-Side Rendering

**How It Works:**

```
┌─────────────────────────────────────────────────────┐
│  Gutenberg Editor (React - edit.tsx)                │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  InspectorControls                        │    │
│  │  - Post Type Selector                     │    │
│  │  - Block Settings                         │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │  Block Preview Area                       │    │
│  │                                           │    │
│  │  <ServerSideRender                        │    │
│  │    block="voxel-fse/create-post"          │    │
│  │    attributes={attributes} />             │    │
│  │                                           │    │
│  │  ┌─────────────────────────────────────┐ │    │
│  │  │  ↓ AJAX Request to WordPress       │ │    │
│  │  │  /wp-json/wp/v2/block-renderer/    │ │    │
│  │  │  voxel-fse/create-post              │ │    │
│  │  └─────────────────────────────────────┘ │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
                        ↓ HTTP Request with attributes
                        │
┌─────────────────────────────────────────────────────┐
│  WordPress Server (PHP - render.php)                │
│                                                     │
│  1. Receives attributes (postTypeKey, etc.)        │
│  2. Loads Voxel Post_Type object                   │
│  3. Gets fields via Voxel API:                     │
│     $post_type->get_fields()                       │
│     $field->get_frontend_config()                  │
│  4. Renders complete HTML form                     │
│  5. Returns HTML string                            │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
                        ↓ HTML Response
                        │
┌─────────────────────────────────────────────────────┐
│  Gutenberg Editor                                   │
│                                                     │
│  ServerSideRender injects HTML into preview        │
│  → User sees complete form in editor               │
│  → Matches frontend output exactly                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### 2.3 Implementation Details

#### Step 1: Block Configuration (block.json)

**File:** `themes/voxel-fse/app/blocks/src/create-post/block.json`

```json
{
  "name": "voxel-fse/create-post",
  "render": "file:./render.php",
  "attributes": {
    "postTypeKey": {
      "type": "string",
      "default": ""
    }
  }
}
```

**Key:** `"render": "file:./render.php"` tells WordPress this is a **dynamic block** that renders server-side.

---

#### Step 2: Editor Component (edit.tsx)

**File:** `themes/voxel-fse/app/blocks/src/create-post/edit.tsx:1-60`

```typescript
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Placeholder } from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';

export default function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps();

  return (
    <>
      {/* Settings Sidebar */}
      <InspectorControls>
        <PanelBody title="Settings">
          <SelectControl
            label="Post Type"
            value={attributes.postTypeKey}
            options={postTypes}
            onChange={(postTypeKey) => setAttributes({ postTypeKey })}
          />
        </PanelBody>
      </InspectorControls>

      {/* Block Preview */}
      <div {...blockProps}>
        {!attributes.postTypeKey ? (
          // Show placeholder when no post type selected
          <Placeholder
            label="Create Post (VX)"
            instructions="Select a post type in the block settings..."
          />
        ) : (
          // Render server-side when post type is selected
          <ServerSideRender
            block="voxel-fse/create-post"
            attributes={attributes}
          />
        )}
      </div>
    </>
  );
}
```

**What `ServerSideRender` Does:**

1. Makes AJAX request to `/wp-json/wp/v2/block-renderer/voxel-fse/create-post`
2. Passes `attributes` as request parameters
3. WordPress calls `render.php` with those attributes
4. Injects returned HTML into the editor
5. Re-renders when attributes change

---

#### Step 3: Server-Side Render (render.php)

**File:** `themes/voxel-fse/app/blocks/src/create-post/render.php:1-148`

**Key Logic:**

```php
<?php
// 1. Get attributes passed from editor
$post_type_key = $attributes['postTypeKey'] ?? '';

// 2. Load Voxel post type
$post_type = \Voxel\Post_Type::get( $post_type_key );

// 3. Get fields using Voxel's API (matches widget exactly)
$config_fields = [];
foreach ( $post_type->get_fields() as $field ) {
    // Check dependencies (matches Voxel line 5012-5017)
    try {
        $field->check_dependencies();
    } catch ( \Exception $e ) {
        continue; // Skip field if dependencies not met
    }

    // Check visibility rules (matches Voxel line 5019-5025)
    if ( ! $field->passes_visibility_rules() ) {
        continue;
    }

    // Use Voxel's get_frontend_config() (matches Voxel line 5027)
    // This returns COMPLETE field configuration (label, type, props, etc.)
    $config_fields[ $field->get_key() ] = $field->get_frontend_config();
}

// 4. Render HTML form
?>
<div class="vx-create-post-block" data-config="<?php echo esc_attr( wp_json_encode( $config ) ); ?>">
    <form class="vx-create-post-form">
        <div class="vx-form-fields">
            <?php foreach ( $config_fields as $field_key => $field ): ?>
                <div class="vx-field vx-field-<?php echo esc_attr( $field['type'] ); ?>">
                    <label class="vx-field-label">
                        <?php echo esc_html( $field['label'] ); ?>
                        <?php if ( $field['required'] ): ?>
                            <span class="vx-required">*</span>
                        <?php endif; ?>
                    </label>

                    <?php
                    // Render field based on type
                    switch ( $field['type'] ) {
                        case 'text':
                            ?>
                            <input
                                type="text"
                                name="vx_field_<?php echo esc_attr( $field_key ); ?>"
                                class="vx-input"
                                value="<?php echo esc_attr( $field['value'] ?? '' ); ?>"
                            />
                            <?php
                            break;

                        case 'file':
                            // Complex file upload UI (lines 270-420)
                            // Matches Voxel's exact HTML structure
                            ?>
                            <div class="ts-form-group ts-file-upload inline-file-field">
                                <div class="ts-file-list">
                                    <!-- Upload button, media library, file previews -->
                                </div>
                            </div>
                            <?php
                            break;
                    }
                    ?>
                </div>
            <?php endforeach; ?>
        </div>

        <button type="submit" class="vx-btn vx-btn-primary vx-submit-btn">
            <?php esc_html_e( 'Create Post', 'voxel-fse' ); ?>
        </button>
    </form>
</div>
```

**Critical Pattern:** Uses `$field->get_frontend_config()` - **same method Voxel's widget uses** (line 5027 of create-post.php)

This ensures **1:1 parity** with Voxel's form structure.

---

#### Step 4: Import Maps for ES Modules

**File:** `themes/voxel-fse/app/blocks/Block_Loader.php:72-94`

**Problem:** `ServerSideRender` is imported as ES module:
```typescript
import ServerSideRender from '@wordpress/server-side-render';
```

**Solution:** Import maps that redirect to WordPress globals:

```php
public static function add_import_map() {
    $imports = [
        '@wordpress/server-side-render' =>
            'data:text/javascript,export default window.wp.serverSideRender;',
        '@wordpress/block-editor' =>
            'data:text/javascript,export const useBlockProps=window.wp.blockEditor.useBlockProps;...',
        // ... all WordPress packages
    ];

    echo '<script type="importmap">' .
         wp_json_encode( [ 'imports' => $imports ] ) .
         '</script>';
}
```

**This allows Vite-built ES modules to import WordPress packages that are actually globals.**

---

### 2.4 Build System Integration

**File:** `themes/voxel-fse/vite.blocks.config.js`

**External Dependencies:**
```javascript
build: {
  rollupOptions: {
    external: [
      '@wordpress/server-side-render',
      '@wordpress/core-data',
      '@wordpress/data',
      '@wordpress/api-fetch',
    ]
  }
}
```

**Why External:**
- These packages exist as WordPress globals (`window.wp.*`)
- Don't bundle them in our build (waste of bytes)
- Import maps redirect imports to globals at runtime

---

### 2.5 Auto-Discovery System

**File:** `themes/voxel-fse/app/blocks/Block_Loader.php:140-180`

```php
public static function load_blocks() {
    $blocks_dir = get_stylesheet_directory() . '/app/blocks/src';

    // Find all block.json files
    $block_files = glob( $blocks_dir . '/*/block.json' );

    foreach ( $block_files as $block_file ) {
        $block_json = json_decode( file_get_contents( $block_file ), true );

        // Register block
        register_block_type(
            dirname( $block_file ), // Registers with render.php
            $block_json
        );
    }
}
```

**Auto-discovery means:**
1. Drop new block folder in `src/`
2. Add `block.json` with `"render": "file:./render.php"`
3. Create `edit.tsx` with `ServerSideRender`
4. Create `render.php` with PHP logic
5. **Done!** Block automatically registered

---

### 2.6 Real-Time Updates

**How Updates Work:**

```
User changes setting (post type selector)
  ↓
edit.tsx: setAttributes({ postTypeKey: 'places' })
  ↓
React re-renders <ServerSideRender>
  ↓
ServerSideRender detects attribute change
  ↓
Makes new AJAX request with updated attributes
  ↓
render.php runs with new postTypeKey
  ↓
Returns HTML for "Places" post type fields
  ↓
Editor preview updates instantly
```

**No page reload needed!** WordPress REST API + React handle all updates.

---

## 3. Key Learnings

### 3.1 When to Use ServerSideRender

**✅ Use ServerSideRender When:**
- Form structure depends on server-side data (Voxel config)
- Need to access PHP APIs (Voxel Post_Type, Field objects)
- Want editor preview to match frontend exactly
- Complex dynamic content based on WordPress data

**❌ Don't Use ServerSideRender When:**
- Simple static blocks
- All data available client-side
- Performance is critical (adds AJAX overhead)
- Block only shows in editor, not frontend

---

### 3.2 1:1 Voxel Matching Strategy

**The Pattern:**

1. **Read Voxel Widget Code**
    - Find exact PHP method calls
    - Note field configuration retrieval
    - Copy HTML structure

2. **Match Voxel's Logic Exactly**
   ```php
   // DON'T write custom logic
   $fields = get_custom_fields();

   // DO match Voxel's exact method
   $fields = $post_type->get_fields();
   foreach ( $fields as $field ) {
       $field->check_dependencies();
       if ( ! $field->passes_visibility_rules() ) continue;
       $config = $field->get_frontend_config();
   }
   ```

3. **Use Voxel's CSS Classes**
    - `ts-form`, `ts-form-group`, `ts-input-text`
    - Matches Voxel styling automatically

---

### 3.3 Architecture Benefits

**Why This Architecture Works:**

1. **Separation of Concerns**
    - Editor UI (React) = Settings and preview container
    - Form Logic (PHP) = Field rendering and Voxel integration
    - Each does what it's good at

2. **Maintainability**
    - Editor component is simple (60 lines)
    - Complex logic in PHP where Voxel APIs live
    - Easy to debug (check render.php output directly)

3. **Voxel Compatibility**
    - Uses Voxel's official APIs
    - Respects field dependencies
    - Honors visibility rules
    - Future-proof against Voxel updates

4. **Performance**
    - Only renders when attributes change
    - Cached by WordPress REST API
    - No redundant React state management

---

### 3.4 Common Pitfalls Avoided

**❌ Pitfall 1:** Trying to render form in React with client-side field definitions
- **Problem:** Can't access Voxel PHP APIs
- **Solution:** Use ServerSideRender

**❌ Pitfall 2:** Duplicating Voxel's field configuration logic
- **Problem:** Out of sync when Voxel updates
- **Solution:** Call `$field->get_frontend_config()` directly

**❌ Pitfall 3:** Custom CSS trying to match Voxel
- **Problem:** Never matches perfectly, breaks on Voxel updates
- **Solution:** Use Voxel's exact CSS classes

**❌ Pitfall 4:** Supporting all field types at once
- **Problem:** Overwhelming complexity
- **Solution:** MVP with basic types, add gradually

---
 
### Form Rendering in Editor
**Solution:** `ServerSideRender` component that makes AJAX requests to `render.php`

**Key Success Factors:**
1. Dynamic block with `"render": "file:./render.php"` in block.json
2. `<ServerSideRender>` in edit.tsx for preview
3. render.php uses Voxel's exact APIs (`$field->get_frontend_config()`)
4. Import maps allow ES modules to access WordPress globals
5. Auto-discovery registers blocks automatically

**Result:** Full form preview in editor that matches frontend exactly, updates in real-time when settings change.

---