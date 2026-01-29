<?php
/**
 * Visibility Evaluator
 *
 * Evaluates visibility rules to determine if a block should render.
 * PHP port of: docs/headless-architecture/nextjs-utilities/visibility.ts
 *
 * Rule types match: shared/controls/ElementVisibilityModal.tsx CONDITION_OPTIONS
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Blocks\Shared;

class Visibility_Evaluator
{
    /**
     * Evaluate visibility rules and determine if block should render
     *
     * @param array $rules Visibility rules from block attributes
     * @param string $behavior 'show' or 'hide'
     * @return bool Whether block should render
     */
    public static function evaluate(array $rules, string $behavior = 'show'): bool
    {
        // 1. Admin Edit Mode Check
        // Voxel logic: Admins in edit mode should always see the element
        if (defined('REST_REQUEST') && REST_REQUEST && current_user_can('administrator')) {
            // We are likely in the block editor (Save/Edit cycle)
            return true;
        }

        // Also check Voxel's specific edit mode check if available
        if (function_exists('\Voxel\is_edit_mode') && \Voxel\is_edit_mode() && current_user_can('administrator')) {
            return true;
        }

        // No rules = always visible
        if (empty($rules)) {
            return true;
        }

        // 2. Format rules for Voxel's evaluator
        // Voxel expects: Array of Groups (OR), where each Group is Array of Rules (AND)
        // Our FSE blocks currently support a single list of rules (AND)
        // So we wrap our rules in a SINGLE group: [ [ rule1, rule2 ] ]
        
        $formatted_group = [];
        foreach ($rules as $rule) {
            // Map FSE 'filterKey' to Voxel 'type'
            // They are identical strings, just different keys
            $formatted_rule = [
                'type' => $rule['filterKey'] ?? '',
                'value' => $rule['value'] ?? '',
                'operator' => $rule['operator'] ?? 'equals',
            ];
            $formatted_group[] = $formatted_rule;
        }

        $voxel_rules_structure = [ $formatted_group ];

        // 3. Delegate to Voxel's native evaluator
        // This ensures 1:1 parity with Voxel's logic
        if (function_exists('\Voxel\evaluate_visibility_rules')) {
            $rules_passed = \Voxel\evaluate_visibility_rules($voxel_rules_structure);
        } else {
            // Fallback if Voxel function missing (shouldn't happen in Voxel theme)
            $rules_passed = self::evaluate_legacy($rules);
        }

        // 4. Apply behavior logic
        if ($behavior === 'hide') {
            // Hide if rules pass
            return !$rules_passed;
        }

        // Default 'show': Show if rules pass
        return $rules_passed;
    }

    /**
     * Legacy evaluator (Fallback)
     */
    private static function evaluate_legacy(array $rules): bool
    {
        foreach ($rules as $rule) {
            if (!self::evaluate_rule($rule)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Evaluate a single visibility rule
     *
     * @param array $rule Rule with 'filterKey', 'operator', 'value'
     * @return bool Whether rule passes
     */
    private static function evaluate_rule(array $rule): bool
    {
        $type = $rule['filterKey'] ?? '';
        $value = $rule['value'] ?? '';

        switch ($type) {
            // ============================================
            // USER RULES
            // ============================================
            case 'user:logged_in':
                return is_user_logged_in();

            case 'user:logged_out':
                return !is_user_logged_in();

            case 'user:role':
                return self::user_has_role($value);

            case 'user:plan':
                return self::user_has_plan($value);

            case 'user:is_author':
                return self::user_is_post_author();

            case 'user:can_create_post':
                return self::user_can_create_post($value);

            case 'user:can_edit_post':
                return self::user_can_edit_current_post();

            case 'user:is_verified':
                return self::user_is_verified();

            case 'user:is_vendor':
                return self::user_is_stripe_vendor();

            case 'user:has_bought_product':
                return self::user_has_bought_product($value);

            case 'user:has_bought_product_type':
                return self::user_has_bought_product_type($value);

            case 'user:is_customer_of_author':
                return self::user_is_customer_of_author();

            case 'user:follows_post':
                return self::user_follows_post();

            case 'user:follows_author':
                return self::user_follows_author();

            case 'user:has_listing_plan':
                return self::user_has_listing_plan($value);

            // ============================================
            // AUTHOR RULES
            // ============================================
            case 'author:plan':
                return self::author_has_plan($value);

            case 'author:role':
                return self::author_has_role($value);

            case 'author:is_verified':
                return self::author_is_verified();

            case 'author:is_vendor':
                return self::author_is_stripe_vendor();

            case 'author:has_listing_plan':
                return self::author_has_listing_plan($value);

            // ============================================
            // TEMPLATE RULES
            // ============================================
            case 'template:is_page':
                return self::is_specific_page($value);

            case 'template:is_child_of_page':
                return self::is_child_of_page($value);

            case 'template:is_single_post':
                return self::is_single_post_type($value);

            case 'template:is_post_type_archive':
                return self::is_post_type_archive($value);

            case 'template:is_author':
                return is_author();

            case 'template:is_single_term':
                return self::is_single_term($value);

            case 'template:is_homepage':
                return is_front_page() || is_home();

            case 'template:is_404':
                return is_404();

            // ============================================
            // POST RULES
            // ============================================
            case 'post:is_verified':
                return self::post_is_verified();

            case 'product:is_available':
                return self::product_is_available();

            case 'product_type:is':
                return self::product_type_is($value);

            case 'listing:plan':
                return self::listing_has_plan($value);

            // ============================================
            // DYNAMIC TAG
            // ============================================
            case 'dtag':
                // Dynamic tag comparison - requires parsing the tag
                return self::evaluate_dynamic_tag($value);

            default:
                // Unknown rule types pass by default
                return true;
        }
    }

    // ========================================================================
    // USER HELPERS
    // ========================================================================

    private static function user_has_role(string $role): bool
    {
        if (!is_user_logged_in()) {
            return false;
        }
        $user = wp_get_current_user();
        return in_array($role, (array) $user->roles, true);
    }

    private static function user_has_plan(string $plan_key): bool
    {
        if (!is_user_logged_in() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        if (!$user) {
            return false;
        }
        $membership = $user->get_membership();
        return $membership && $membership->get_key() === $plan_key;
    }

    private static function user_is_post_author(): bool
    {
        if (!is_user_logged_in() || !is_singular()) {
            return false;
        }
        $post = get_post();
        return $post && (int) $post->post_author === get_current_user_id();
    }

    private static function user_can_create_post(string $post_type): bool
    {
        if (!is_user_logged_in() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        if (!$user) {
            return false;
        }
        return $user->can_create_post($post_type);
    }

    private static function user_can_edit_current_post(): bool
    {
        if (!is_user_logged_in() || !is_singular()) {
            return false;
        }
        $post = get_post();
        return $post && current_user_can('edit_post', $post->ID);
    }

    private static function user_is_verified(): bool
    {
        if (!is_user_logged_in() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        return $user && $user->is_verified();
    }

    private static function user_is_stripe_vendor(): bool
    {
        if (!is_user_logged_in() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        return $user && $user->has_vendor_dashboard();
    }

    private static function user_has_bought_product(string $product_id): bool
    {
        // Implementation depends on Voxel's order system
        return false; // TODO: Implement when order system is available
    }

    private static function user_has_bought_product_type(string $type): bool
    {
        // Implementation depends on Voxel's order system
        return false; // TODO: Implement when order system is available
    }

    private static function user_is_customer_of_author(): bool
    {
        // Implementation depends on Voxel's order system
        return false; // TODO: Implement when order system is available
    }

    private static function user_follows_post(): bool
    {
        if (!is_user_logged_in() || !is_singular() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        $post_id = get_the_ID();
        return $user && $user->is_following_post($post_id);
    }

    private static function user_follows_author(): bool
    {
        if (!is_user_logged_in() || !is_singular() || !function_exists('\\Voxel\\current_user')) {
            return false;
        }
        $user = \Voxel\current_user();
        $post = get_post();
        if (!$user || !$post) {
            return false;
        }
        return $user->is_following_user($post->post_author);
    }

    private static function user_has_listing_plan(string $plan_key): bool
    {
        // Implementation depends on Voxel's listing plan system
        return false; // TODO: Implement when listing plans are available
    }

    // ========================================================================
    // AUTHOR HELPERS
    // ========================================================================

    private static function author_has_plan(string $plan_key): bool
    {
        if (!is_singular() || !function_exists('\\Voxel\\get')) {
            return false;
        }
        $post = get_post();
        if (!$post) {
            return false;
        }
        $author = \Voxel\User::get($post->post_author);
        if (!$author) {
            return false;
        }
        $membership = $author->get_membership();
        return $membership && $membership->get_key() === $plan_key;
    }

    private static function author_has_role(string $role): bool
    {
        if (!is_singular()) {
            return false;
        }
        $post = get_post();
        if (!$post) {
            return false;
        }
        $author = get_userdata($post->post_author);
        return $author && in_array($role, (array) $author->roles, true);
    }

    private static function author_is_verified(): bool
    {
        if (!is_singular() || !function_exists('\\Voxel\\User')) {
            return false;
        }
        $post = get_post();
        if (!$post) {
            return false;
        }
        $author = \Voxel\User::get($post->post_author);
        return $author && $author->is_verified();
    }

    private static function author_is_stripe_vendor(): bool
    {
        if (!is_singular() || !function_exists('\\Voxel\\User')) {
            return false;
        }
        $post = get_post();
        if (!$post) {
            return false;
        }
        $author = \Voxel\User::get($post->post_author);
        return $author && $author->has_vendor_dashboard();
    }

    private static function author_has_listing_plan(string $plan_key): bool
    {
        // Implementation depends on Voxel's listing plan system
        return false; // TODO: Implement when listing plans are available
    }

    // ========================================================================
    // TEMPLATE HELPERS
    // ========================================================================

    private static function is_specific_page($page_identifier): bool
    {
        if (!is_page()) {
            return false;
        }
        // Can be page ID or slug
        return is_page($page_identifier);
    }

    private static function is_child_of_page($parent_identifier): bool
    {
        if (!is_page()) {
            return false;
        }
        $post = get_post();
        if (!$post || !$post->post_parent) {
            return false;
        }
        // Check if parent matches by ID or slug
        $parent = get_post($post->post_parent);
        if (!$parent) {
            return false;
        }
        return $parent->ID == $parent_identifier || $parent->post_name === $parent_identifier;
    }

    private static function is_single_post_type(string $post_type): bool
    {
        return is_singular($post_type);
    }

    private static function is_post_type_archive(string $post_type): bool
    {
        return is_post_type_archive($post_type);
    }

    private static function is_single_term(string $term_identifier): bool
    {
        // Format: taxonomy:term_slug or just term_slug
        if (strpos($term_identifier, ':') !== false) {
            list($taxonomy, $term) = explode(':', $term_identifier, 2);
            return is_tax($taxonomy, $term);
        }
        return is_tax() || is_category() || is_tag();
    }

    // ========================================================================
    // POST HELPERS
    // ========================================================================

    private static function post_is_verified(): bool
    {
        if (!is_singular() || !function_exists('\\Voxel\\Post')) {
            return false;
        }
        $post_id = get_the_ID();
        $voxel_post = \Voxel\Post::get($post_id);
        return $voxel_post && $voxel_post->is_verified();
    }

    private static function product_is_available(): bool
    {
        // Implementation depends on Voxel's product system
        return true; // Default to available
    }

    private static function product_type_is(string $type): bool
    {
        // Implementation depends on Voxel's product type system
        return false; // TODO: Implement when product types are available
    }

    private static function listing_has_plan(string $plan_key): bool
    {
        // Implementation depends on Voxel's listing plan system
        return false; // TODO: Implement when listing plans are available
    }

    // ========================================================================
    // DYNAMIC TAG HELPER
    // ========================================================================

    private static function evaluate_dynamic_tag(string $tag_value): bool
    {
        // Dynamic tag evaluation would parse @context.property format
        // For now, return true as a fallback
        return true;
    }
}
