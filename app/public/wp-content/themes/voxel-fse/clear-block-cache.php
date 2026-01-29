<?php
/**
 * Temporary Cache Clearing Script
 *
 * Load this file once in WordPress admin to clear block cache
 * DELETE THIS FILE after use for security
 *
 * Usage: Navigate to wp-admin and append ?clear_block_cache=1 to URL
 * Example: https://yoursite.local/wp-admin/?clear_block_cache=1
 */

add_action('admin_init', function() {
    if (!isset($_GET['clear_block_cache'])) {
        return;
    }

    // Clear WordPress object cache
    wp_cache_flush();

    // Clear all transients
    global $wpdb;
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_%'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_site_transient_%'");

    // Force block type registry to rebuild
    if (function_exists('WP_Block_Type_Registry')) {
        $registry = WP_Block_Type_Registry::get_instance();
        // Registry rebuilds automatically on next request
    }

    wp_die('
        <h1>✅ Cache Cleared Successfully!</h1>
        <p><strong>Next steps:</strong></p>
        <ol>
            <li>Go back to post editor</li>
            <li>Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)</li>
            <li>Search for "Ring Chart" in block inserter</li>
            <li>DELETE THIS FILE (clear-block-cache.php) for security</li>
        </ol>
        <p><a href="' . admin_url('post-new.php') . '">← Go to Post Editor</a></p>
    ');
});
