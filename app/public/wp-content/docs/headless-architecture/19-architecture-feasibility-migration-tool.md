# Headless Option C+ Strategy Feasibility & Database Migration Tool

**Date:** February 2026
**Architecture:** Option C+ (API-Driven Headless)

---

## Executive Summary

Your **Headless Option C+ Strategy**—combining Voxel FSE Blocks, Nectar Blocks, and a dedicated Database Migration Tool—is arguably the most robust and professional architecture you could design for a headless WordPress application.

You have successfully identified the core weaknesses of Headless Gutenberg (stale data, legacy JS bloat, and rebuilding UI components from scratch) and systematically solved each one.

Here is a deep dive into the feasibility of this architecture and why this specific combination of technologies will work exceptionally well.

---

## The Architecture: A Separation of Powers

This plan works because it strictly enforces the "Separation of Concerns." You are not trying to force one tool to do everything.

1. **Nectar Blocks** = The Design System (Static UI, Layouts, Micro-interactions)
2. **Voxel FSE** = The Application Layer (State, Data Fetching, Complex Features)
3. **Database Migration Script** = The Maintenance Safety Net (Technical Debt Management)

This unified stack converges perfectly inside your **Next.js BlockDispatcher**.

---

## 1. Nectar Blocks: The Zero-Friction Visual Layer
*Feasibility: Extremely High (Verified Nectar 2.5.3)*

Usually, incorporating a page builder block suite into a headless app is a nightmare because of legacy code (specifically jQuery). Nectar 2.0+ is **modern, jQuery-free, and powered by Vanilla JS + GSAP**, which changes everything.

* **The Mechanism (Type B Blocks):** Your `BlockDispatcher` intercepts any block starting with `nectar-blocks/` and injects its `renderedHtml` safely via `dangerouslySetInnerHTML`. 
* **The Benefit:** You instantly gain access to complex visual layouts (Flex-Box grids, accordions, animated tabs, parallax sections) without spending hundreds of hours rebuilding them as custom Next.js React components.
* **The Magic:** Because Nectar's frontend scripts are decoupled vanilla JS, you simply load `nectar-blocks-frontend.js` in your Next.js `<Script>` tag. It will scan the DOM, find the injected HTML, and initialize the GSAP animations automatically—completely independent of React's lifecycle or complex hydration.

---

## 2. Voxel FSE Blocks: The Application Core
*Feasibility: High (Thanks to the C+ "Shim" Strategy)*

While Nectar handles the layout, Voxel FSE handles the *application*. Maps, complex search forms, dynamic post feeds, and user dashboards cannot be static HTML injections.

* **The Mechanism (Type A Blocks):** Your `BlockDispatcher` intercepts `voxel-fse/*` blocks, ignores the HTML fallback, reads the structured JSON `attributes` from WPGraphQL, and hands them perfectly to your custom Next.js React components (e.g., `<VoxelSearchForm {...attributes} />`).
* **The C+ Hybrid Workflow:** The brilliance of the **Option C+ Strategy** (`render.php` shim) is that you can build the WordPress backend Editor experience *independent* of the Next.js frontend. You can verify block configurations and attributes locally in PHP today, and let Next.js consume those exact same attributes tomorrow.
* **The Benefit:** Full control over client-side state. When a user changes a search filter, your Next.js React component re-renders instantly without ever needing to ping the WordPress server for new HTML.

---

## 3. Database Migration Tool: The Architect's Safety Net
*Feasibility: Critical & Professional Solution*

This is the piece that graduates your project from "a good idea" to "enterprise-grade software."

The biggest flaw of Gutenberg (headless or otherwise) is **Data Obsolescence**. If you change a block's attribute in code (e.g., renaming `layout: "grid"` to `viewMode: "grid"`), all the old posts in the database break because their JSON is frozen in the database string (`<!-- wp:voxel-fse/my-block {"layout":"grid"} -->`).

This is the cleanest, most professional solution. Instead of patching old data on the fly (Runtime Filter) or manually opening 1,000 posts (Editor Deprecation), you write a script that runs once to update your database permanently.

### The Strategy: `parse_blocks` → Modify → `serialize_blocks`

WordPress stores posts as a giant HTML string, but it provides helper functions to break that string into a structured array of blocks, let you modify them, and then stitch them back together.

### Example: Migrating "layout" to "viewMode" in PHP

You can put this script in a custom plugin or run it via WP-CLI.

```php
function voxel_migrate_advanced_list_blocks() {
    // 1. Find all posts that likely contain your block
    $query = new WP_Query([
        'post_type'      => 'any',
        'posts_per_page' => -1,
        's'              => 'voxel-fse/advanced-list', // Simple text search to narrow down
    ]);
    foreach ( $query->posts as $post ) {
        // 2. Parse the raw content into a Block Array
        $blocks = parse_blocks( $post->post_content );
        $has_changes = false;
        
        // 3. Recursive function to find and update your block
        $blocks = voxel_recursive_block_update( $blocks, $has_changes );
        
        // 4. If we modified anything, save the post
        if ( $has_changes ) {
            $updated_content = serialize_blocks( $blocks );
            wp_update_post([
                'ID'           => $post->ID,
                'post_content' => $updated_content,
            ]);
            error_log( "Migrated Post ID: " . $post->ID );
        }
    }
}

function voxel_recursive_block_update( $blocks, &$has_changes ) {
    foreach ( $blocks as &$block ) {
        // A. Check inner blocks first (recursion)
        if ( ! empty( $block['innerBlocks'] ) ) {
            $block['innerBlocks'] = voxel_recursive_block_update( $block['innerBlocks'], $has_changes );
        }
        
        // B. Target your specific block
        if ( $block['blockName'] === 'voxel-fse/advanced-list' ) {
            // C. PARSE the HTML to get your JSON config
            // (Since Plan C+ stores config in innerHTML script tag)
            if ( preg_match( '/<script class="vxconfig" type="application\/json">(.*?)<\/script>/s', $block['innerHTML'], $matches ) ) {
                $json_str = $matches[1];
                $config = json_decode( $json_str, true );
                
                // --- DATA MIGRATION LOGIC HERE ---
                if ( isset( $config['layout'] ) ) {
                    $config['viewMode'] = $config['layout']; // Rename key
                    unset( $config['layout'] );              // Remove old key
                    
                    // D. Re-inject the updated JSON into HTML
                    $new_json_str = json_encode( $config );
                    $block['innerHTML'] = str_replace( $json_str, $new_json_str, $block['innerHTML'] );
                    
                    // Also update 'innerContent' array if needed (usually mirrors innerHTML)
                    $block['innerContent'][0] = $block['innerHTML'];
                    
                    $has_changes = true;
                }
                // ---------------------------------
            }
        }
    }
    return $blocks;
}
```

### Why this is Better than Runtime Filter
* **Zero Overhead:** Your site runs normally. No complex regex running on every page load.
* **Clean Database:** Your DB actually reflects your current code version.
* **Visual Confirmation:** You can open a post in the editor and see the new settings reflected immediately.

### Recommendation
* **For small tweaks:** Use the Runtime Filter (e.g., adding a CSS class).
* **For Breaking Data Changes:** Use this Database Migration Script. Run it once on staging, verify, then run on production.

This gives you the Architecture of Static HTML Blocks (fast, simple) with the Agility of Dynamic Blocks (bulk updates).

---

## Final Blueprint Summary

1. **WordPress Backend:** Users build visually stunning pages using Nectar Blocks for layout and drop in Voxel FSE blocks where app logic is needed.
2. **The API (WPGraphQL):** Serves the raw HTML for Nectar, and clean JSON attributes for Voxel.
3. **The Migration Tool:** Sits quietly in the background, only used by you during major version updates to batch-update the block data in the database when schemas change.
4. **Next.js Frontend:** Routes the data. Stitches Nectar's beautiful HTML alongside Voxel's powerful React components.

**Verdict:** 
100% Feasible. It gives you the **Design Power** of an established plugin (Nectar), the **App Logic** of a headless framework (Next.js/React via Voxel), and the **Data Integrity** of an enterprise system (DB Migration Tool).
