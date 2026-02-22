# VoxelTab + EnableTag Integration into Nectar Blocks

Two complementary features that extend Nectar Blocks (NB) with Voxel-specific editor controls, without modifying any NB plugin source code.

## User Review Required

> [!IMPORTANT]
> **Target blocks**: This plan targets `nectar-blocks/flex-box` as the first NB block. Should we also target `nectar-blocks/text`, `nectar-blocks/image`, `nectar-blocks/row`, `nectar-blocks/column`? If so, the filter simply adds block names to a whitelist array.

> [!WARNING]
> **Two Dynamic Data Systems**: NB has its own Dynamic Data system (PHP-based `Frontend_Render::get_dynamic_content`). Adding Voxel's dynamic tags means NB blocks will have **two** dynamic data buttons — NB's globe icon and Voxel's gradient circle. Is that the desired UX, or should we hide NB's button when a Voxel tag is present?

> [!CAUTION]
> **Backend Resolution**: For Voxel dynamic tags (`@tags()...@endtags()`) to actually render on the frontend, a PHP `render_block` filter must resolve them in NB block output. This requires Voxel's `\Voxel\Dynamic_Tags\Dynamic_Tags::render()` to be available. If the Voxel theme isn't active, tags will show as raw `@post(title)` text.

---

## Proposed Changes

### Feature A: VoxelTab on Nectar Blocks

Adds the Voxel inspector tab (sticky, visibility, loop controls) to selected NB blocks.

---

#### [NEW] [nectar-blocks-integration.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/nectar-blocks-integration.php)

PHP file loaded from `Block_Loader.php` that:

1. **Injects VoxelTab attributes** into target NB blocks via `register_block_type_args` filter
   - Merges `get_voxel_tab_attributes()` into NB block's attribute definitions
   - Only targets a configurable whitelist of NB block names (e.g., `nectar-blocks/flex-box`)

2. **Extends `render_block` filter** to apply visibility/loop/VoxelScript processing to NB blocks
   - Reuses the existing `Visibility_Evaluator` and `Loop_Processor` classes
   - Same logic as `apply_voxel_tab_features` but scoped to NB blocks

```php
// Pseudocode
add_filter('register_block_type_args', function($args, $name) {
    if (in_array($name, $nb_target_blocks)) {
        $args['attributes'] = array_merge($args['attributes'] ?? [], get_voxel_tab_attributes());
    }
    return $args;
}, 10, 2);
```

---

#### [NEW] [nectarBlocksVoxelTab.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/nectarBlocksVoxelTab.tsx)

Editor-side filter using `editor.BlockEdit` hook (following the pattern in [editorWrapperFilters.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/editorWrapperFilters.tsx)):

1. Wraps target NB blocks' edit component with a HOC that adds:
   - A **Voxel tab** in `InspectorControls` containing the `VoxelTab` component
   - Passes `attributes` and `setAttributes` through to VoxelTab

2. Uses `createHigherOrderComponent` from `wp.compose` (same as `editorWrapperFilters.tsx`)

```tsx
// HOC pattern
const withNectarVoxelTab = createHigherOrderComponent((BlockEdit) => {
    return (props) => {
        if (!NB_TARGET_BLOCKS.includes(props.name)) return <BlockEdit {...props} />;
        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody title="Voxel" icon={voxelIcon}>
                        <VoxelTab attributes={props.attributes} setAttributes={props.setAttributes} />
                    </PanelBody>
                </InspectorControls>
            </>
        );
    };
}, 'withNectarVoxelTab');

addFilter('editor.BlockEdit', 'voxel-fse/nectar-voxel-tab', withNectarVoxelTab);
```

---

#### [MODIFY] [editorWrapperFilters.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/editorWrapperFilters.tsx)

Extend the existing `withVoxelWrapperProps` HOC to also apply sticky position styles to NB blocks. Currently it only checks `name.startsWith('voxel-fse/')` — we add the NB target blocks to this check.

```diff
-if (!name.startsWith('voxel-fse/')) {
+if (!name.startsWith('voxel-fse/') && !NB_TARGET_BLOCKS.includes(name)) {
     return <BlockListBlock {...props} />;
 }
```

---

#### [MODIFY] [Block_Loader.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/Block_Loader.php)

- Add `require_once` for `nectar-blocks-integration.php`
- Extend `apply_voxel_tab_features` to also process NB target blocks (or call a shared method)

---

#### [MODIFY] [editor.ts](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/editor.ts)

Add import for the new filter module:
```diff
+import '../shared/filters/nectarBlocksVoxelTab';
```

---

### Feature B: EnableTag (Dynamic Tag Button) on Nectar Blocks

Adds the Voxel dynamic tag builder button next to NB's existing dynamic data controls.

---

#### [NEW] [nectarDynamicTagFilter.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/nectarDynamicTagFilter.tsx)

Editor-side filter using `editor.BlockEdit` hook:

1. **Inspector panel injection**: Adds a "Voxel Dynamic Tags" `PanelBody` to NB blocks' inspector with:
   - `EnableTagsButton` — opens `DynamicTagBuilder` modal
   - When a tag is set → shows the dark feedback area with "EDIT TAGS" / "DISABLE TAGS" buttons
   - Uses the existing `DynamicTagTextControl` component (already has this full UX)

2. **RichText toolbar button**: Registers a custom format via `wp.richText.registerFormatType` that:
   - Shows the `EnableTagsButton` icon in the text formatting toolbar
   - Only appears on NB text blocks (`nectar-blocks/text`)
   - Opens the `DynamicTagBuilder` modal on click
   - Inserts the tag string (`@post(title)`) into the rich text content

```tsx
registerFormatType('voxel-fse/dynamic-tag', {
    title: 'Voxel Dynamic Tag',
    tagName: 'span',
    className: 'voxel-dynamic-tag',
    edit: ({ isActive, onChange, value }) => (
        <RichTextToolbarButton
            icon={<EnableTagsButton />}
            title="Insert Voxel Tag"
            onClick={() => setIsModalOpen(true)}
            isActive={isActive}
        />
    ),
});
```

---

#### [NEW] [nectar-dynamic-tag-filter.css](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/nectar-dynamic-tag-filter.css)

CSS for styling the injected buttons to match NB's aesthetic:
- Positions the `EnableTagsButton` inline with NB's existing controls
- Styles the feedback area in NB's inspector context
- Size adjustments for toolbar icon

---

#### [MODIFY] [nectar-blocks-integration.php](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/nectar-blocks-integration.php)

Add a `render_block` filter that resolves `@tags()...@endtags()` wrappers in NB block HTML:
```php
add_filter('render_block', function($content, $block) {
    if (!in_array($block['blockName'], $nb_target_blocks)) return $content;
    if (strpos($content, '@tags(') === false) return $content;
    // Resolve using Voxel's Dynamic_Tags::render()
    return \Voxel\Dynamic_Tags\Dynamic_Tags::render($content);
}, 15, 2);
```

---

#### [MODIFY] [editor.ts](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/src/editor.ts)

Add import:
```diff
+import '../shared/filters/nectarDynamicTagFilter';
```

---

### Shared: NB Target Blocks Config

#### [NEW] [nectarBlocksConfig.ts](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/filters/nectarBlocksConfig.ts)

Single source of truth for which NB blocks get Voxel features:
```ts
export const NB_TARGET_BLOCKS = [
    'nectar-blocks/flex-box',
    // Add more as needed:
    // 'nectar-blocks/text',
    // 'nectar-blocks/image',
    // 'nectar-blocks/row',
    // 'nectar-blocks/column',
];
```

---

## Verification Plan

### Automated Tests

**Run with**: `npm test` from `c:\Users\herle\Local Sites\musicalwheel\app\public\wp-content\themes\voxel-fse`

1. **Extend existing [VoxelTab.test.tsx](file:///c:/Users/herle/Local%20Sites/musicalwheel/app/public/wp-content/themes/voxel-fse/app/blocks/shared/controls/__tests__/VoxelTab.test.tsx)** — verify VoxelTab renders with NB-block-like attribute shapes
2. **New test `nectarBlocksVoxelTab.test.tsx`** — verify HOC only wraps whitelisted NB blocks, passes attributes/setAttributes correctly
3. **Build check**: `npm run build:blocks` to confirm no TypeScript/build errors

### Manual Verification

> [!IMPORTANT]
> These steps require the WordPress Gutenberg editor running at LocalWP.

1. **VoxelTab on NB flex-box**:
   - Open any page in the Gutenberg editor
   - Insert a `Nectar Flex Box` block
   - Check the inspector sidebar — a "Voxel" tab/panel should appear
   - Toggle sticky position ON → verify controls appear (desktop enable, top/left/right/bottom offsets)
   - Save and view the frontend → verify sticky positioning works

2. **EnableTag button on NB blocks**:
   - Select the `Nectar Flex Box` block → check inspector for "Voxel Dynamic Tags" panel
   - Click the gradient circle button → DynamicTagBuilder modal should open
   - Add a tag like `@post(title)` → button should turn dark, feedback area should show
   - Click "EDIT TAGS" → modal reopens with existing tag
   - Click "DISABLE TAGS" → tag is removed, button returns to gradient state

3. **Text toolbar button**:
   - Insert a `Nectar Text` block
   - Select some text → toolbar should show the Voxel tag icon
   - Click it → DynamicTagBuilder modal should open
   - Insert a tag → verify it appears in the text content
