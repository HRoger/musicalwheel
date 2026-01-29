# Discovery: How FSE Blocks Get Post Context in Editor

**Discovery Date:** 2025-11-15
**Purpose:** Understand how Gutenberg blocks access current post data in the editor for live preview

---

## Key Findings

### 1. Getting Current Post ID in Editor

**Pattern using @wordpress/data:**

```typescript
import { useSelect } from '@wordpress/data';

const postId = useSelect(
  (select) => select('core/editor').getCurrentPostId(),
  []
);

// Get multiple properties
const { postId, postType, isNewPost } = useSelect((select) => {
  const editor = select('core/editor');
  return {
    postId: editor.getCurrentPostId(),
    postType: editor.getCurrentPostType(),
    isNewPost: editor.getCurrentPost()?.status === 'auto-draft'
  };
}, []);
```

**Evidence:** Found in Elementor plugin at `plugins/elementor/assets/js/ai-gutenberg.js:52267`

---

### 2. Reading Post Meta/Custom Fields

**Pattern using @wordpress/core-data:**

```typescript
import { useEntityProp, useEntityId } from '@wordpress/core-data';

// Get current entity ID
const postId = useEntityId('postType', postType);

// Read/write meta
const [meta, setMeta] = useEntityProp('postType', postType, 'meta', postId);

// Access specific meta field
const productField = meta?._voxel_product || '';

// Update meta
setMeta({ ...meta, _voxel_product: newValue });
```

**Evidence:** Found in WooCommerce Product Editor at `plugins/elementor/assets/js/e-wc-product-editor.js:2627-2633`

---

### 3. Core WordPress Packages Required

```typescript
import { useSelect } from '@wordpress/data';
import { useEntityProp, useEntityId } from '@wordpress/core-data';
```

**Note:** Current musicalwheel blocks DO NOT use these packages yet. All existing blocks (dynamic-text, dynamic-heading-example) only use:
- `@wordpress/block-editor` (useBlockProps, InspectorControls)
- `@wordpress/blocks` (registerBlockType)
- `@wordpress/components` (UI components)

---

### 4. Complete Working Example for Product-Price Block

```typescript
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';

export default function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps();

  // Get current post context
  const { postId, postType } = useSelect((select) => {
    const editor = select('core/editor');
    return {
      postId: editor.getCurrentPostId(),
      postType: editor.getCurrentPostType(),
    };
  }, []);

  // Access Voxel post meta (where product field data is stored)
  const [meta] = useEntityProp('postType', postType, 'meta', postId);

  // Get product field data
  const productData = meta?._voxel_product || null;

  return (
    <div {...blockProps}>
      {/* Now we have access to post data for live preview */}
      <div>Post ID: {postId}</div>
      <div>Product Data: {productData ? 'Available' : 'Not set'}</div>
    </div>
  );
}
```

---

## Comparison with Current Implementation

### Current product-price Block (WRONG)
- ❌ No `@wordpress/data` usage
- ❌ No `@wordpress/core-data` usage
- ❌ No access to post context
- ❌ Static placeholder only
- ❌ No live preview

### What's Needed (CORRECT)
- ✅ Use `useSelect` to get post ID/type
- ✅ Use `useEntityProp` to access Voxel meta fields
- ✅ Read product field data from post meta
- ✅ Display live preview based on actual data
- ✅ Fall back to placeholder if no data

---

## Key WordPress Resources

1. **Block Editor Handbook - core/editor Data Store**
   - Methods: `getCurrentPostId()`, `getCurrentPostType()`, `getEditedPostAttribute()`

2. **@wordpress/data Package**
   - Hooks: `useSelect()`, `useDispatch()`

3. **@wordpress/core-data Package**
   - Hooks: `useEntityProp()`, `useEntityId()`, `useEntityRecord()`

---

## Next Steps

1. Discover how to implement live preview (ServerSideRender vs REST API)
2. Determine which approach Voxel product data requires
3. Implement live preview in product-price block editor

---

## Notes

- Voxel stores custom field data in post meta with `_voxel_` prefix
- Product field is likely stored as serialized data in meta
- May need PHP backend to calculate price (just like Voxel widget does)
- ServerSideRender might be necessary for complex calculations
