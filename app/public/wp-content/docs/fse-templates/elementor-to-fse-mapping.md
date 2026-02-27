# Elementor to Voxel-FSE Unified Mapping Strategy

This document outlines the systematic, 1:1 mapping strategy for converting Voxel Elementor Card Templates (and other templates) into Voxel-FSE architecture powered by Nectar Blocks.

## 1. Architectural Differences

| Concept | Voxel Elementor | Voxel-FSE + Nectar Blocks |
| :--- | :--- | :--- |
| **Storage** | `wp_postmeta` under `_elementor_data` (JSON array) | `wp_posts` as serialized HTML comments (`<!-- wp:block -->`) |
| **Style Storage** | Auto-generated CSS files or inline | Nectar block styles compiled into `_nectar_blocks_css` postmeta |
| **Layout Roots** | `container` widget | `nectar-blocks/row`, `nectar-blocks/flex-box` |
| **Dynamic Data** | Voxel Dynamic Tags (`@tags()...`) | Supported natively in Voxel-FSE blocks + Nectar Blocks (`voxelDynamicTags` attribute) |

---

## 2. Block Mapping Matrix

When translating an Elementor JSON structure to FSE markup, we apply the following transformation rules:

### Layout & Containers
| Elementor `elType`/`widgetType` | FSE/Nectar Equivalent | Translation Logic |
| :--- | :--- | :--- |
| `container` (Top Level) | `nectar-blocks/row` | Top level containers map to Rows to provide section bounding. |
| `container` (Inner) | `nectar-blocks/column` | Direct children of Rows map to Columns. |
| `container` (Flex Layouts) | `nectar-blocks/flex-box` | Deeply nested containers used purely for flex alignment map to Flex-Box. |

### Typography & Content
| Elementor `elType`/`widgetType` | FSE/Nectar Equivalent | Translation Logic |
| :--- | :--- | :--- |
| `heading` | `nectar-blocks/text` | Set `textElement` attribute to the corresponding H tag (`h1`-`h6`). |
| `text-editor` | `nectar-blocks/text` | Set typography to `body` or map inline HTML directly. |
| `icon` | `nectar-blocks/icon` | Map Elementor SVG libraries to Nectar custom SVG input. |
| `divider` | `nectar-blocks/divider` | Direct equivalence. |
| `image` | `nectar-blocks/image` | Use if static. If dynamic (bound to post/term image), use `voxel-fse/image`. |

### Voxel Specific Widgets
| Elementor `widgetType` | FSE Equivalent | Translation Logic |
| :--- | :--- | :--- |
| `ts-post-feed` | `voxel-fse/post-feed` | Pass `cardTemplate` by resolving the name of the template part. |
| `ts-term-feed` | `voxel-fse/term-feed` | Pass `cardTemplate` by name. |
| `ts-search-form` | `voxel-fse/search-form` | Map filter list attributes explicitly inside the block JSON. |

---

## 3. Dynamic Tags Integration

Voxel Elementor relies heavily on the `@tags()` syntax. Fortunately, the Voxel-FSE theme extends Nectar Blocks to support these same tags natively. 

**Elementor Example:**
```json
"title": "@tags()Book places to stay in @term(:label)@endtags()"
```

**FSE Equivalent (Nectar Text Block):**
```html
<!-- wp:nectar-blocks/text {"voxelDynamicTags":{"textContent":"@tags()Book places to stay in @term(:label)@endtags()"},"voxelDynamicContent":"@tags()Book places to stay in @term(:label)@endtags()"} -->
<p class="wp-block-nectar-blocks-text nectar-blocks-text">Book places to stay in [Dynamic]</p>
<!-- /wp:nectar-blocks/text -->
```

## 4. The Programmatic Conversion Workflow

To automate the translation of Card Templates (and eventually whole pages from Figma/Pencil to FSE), the workflow is:

1. **Extraction (Elementor JSON):** Query `wp_postmeta` for the target template's `_elementor_data`.
2. **AST Parsing:** Convert the Elementor nested JSON array into an Abstract Syntax Tree (AST).
3. **Transformation:** Walk the AST and apply the **Block Mapping Matrix** to build standard FSE Block structs.
4. **Style Extraction:** Convert Elementor styling (padding, margins, colors) into Nectar Blocks' CSS format (`.parent-block-block-{id} { padding: ... }`).
5. **Generation & Injection:**
    - Serialize the FSE Block structs into standard WordPress HTML (`<!-- wp:nectar-... -->`).
    - Write the HTML to the `post_content` of the new/matching `wp_template`.
    - Push the generated CSS dynamically via `update_post_meta($id, '_nectar_blocks_css', $css)`.
