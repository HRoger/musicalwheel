<?php
/**
 * Loop Processor
 *
 * Delegates loop processing to Voxel's native Looper.
 * Ensures 1:1 parity with Voxel's loop logic and data handling.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Blocks\Shared;

if ( ! defined('ABSPATH') ) {
    exit;
}

class Loop_Processor
{
    /**
     * Render block content based on loop configuration
     *
     * @param array $attributes Block attributes
     * @param string $content Block content
     * @return string Rendered HTML
     */
    public static function render_looped(array $attributes, string $content): string
    {
        $source = $attributes['loopSource'] ?? '';
        $property = $attributes['loopProperty'] ?? '';

        // Construct Voxel Dynamic Tag
        // Voxel uses parentheses format: @group(property.subproperty)
        // e.g. 'user', 'role' -> '@user(role)'
        // e.g. 'post', 'author.name' -> '@post(author.name)'
        $tag = '';
        if (strpos($source, '@') === 0) {
            // Already a full tag like '@user(role)' - use as-is
            $tag = $source;
        } elseif ($source && $property) {
            // Build tag with parentheses: @source(property)
            $tag = "@{$source}({$property})";
        }

        // If no valid loop tag, fallback to standard render (once)
        if (empty($tag)) {
            return \Voxel\render($content);
        }

        // Check if loop is valid using Voxel's parser
        // If invalid, fallback to standard render (once) - matches Voxel behavior
        if (function_exists('\Voxel\_get_default_render_groups') && class_exists('\Voxel\Dynamic_Data\Looper')) {
            $parsed = \Voxel\Dynamic_Data\Looper::parse_loopable($tag, \Voxel\_get_default_render_groups());
            if (!$parsed) {
                return \Voxel\render($content);
            }
        }

        $output = '';

        // Delegate to Voxel Looper
        // This handles limit, offset, and sets the data context
        // so that dynamic tags inside $content are resolved against the current loop item.
        \Voxel\Dynamic_Data\Looper::run($tag, [
            'limit' => $attributes['loopLimit'] ?? null,
            'offset' => $attributes['loopOffset'] ?? null,
            'callback' => function() use (&$output, $content) {
                $output .= \Voxel\render($content);
            }
        ]);

        // If output is empty, the loop ran but had 0 items - return empty (Hide behavior)
        return $output;
    }
}
