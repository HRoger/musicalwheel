<?php
namespace EssentialBlocks\Pro\Utils;

use EssentialBlocks\Traits\HasSingletone;

defined('ABSPATH') || exit;

/**
 * Liquid Glass Effect Pro Extension
 * Handles advanced SVG filters for pro effects (effect3, effect4, effect5)
 * This class extends the base LiquidGlassRenderer with pro functionality
 */
class LiquidGlassRendererPro
{
    use HasSingletone;

    /**
     * Track which block IDs have already rendered SVGs to prevent duplicates
     */
    protected static $rendered_blocks = [];

    /**
     * Constructor
     */
    public function __construct()
    {
        // Hook into the liquid glass SVG injection filter
        add_filter('eb_liquid_glass_inject_svg', [$this, 'inject_pro_svg'], 10, 4);
        add_filter('eb_liquid_glass_svg_rendered', [$this, 'check_svg_rendered'], 10, 2);
        add_action('wp_head', [__CLASS__, 'reset_rendered_blocks'], 1);
    }

    /**
     * Inject pro SVG filters for advanced effects
     *
     * @param string $block_content The block content
     * @param array $liquid_glass Liquid glass attributes
     * @param array $attributes All block attributes
     * @param bool $svg_already_rendered Whether SVG was already rendered globally (ignored for pro effects)
     * @return string Modified block content
     */
    public function inject_pro_svg($block_content, $liquid_glass, $attributes, $svg_already_rendered)
    {
        // Only process pro effects
        if (!$this->is_pro_effect($liquid_glass)) {
            return $block_content;
        }

        // Check if this specific block has already rendered its SVG
        $block_id = isset($attributes['blockId']) ? $attributes['blockId'] : '';
        if (empty($block_id) || in_array($block_id, self::$rendered_blocks)) {
            return $block_content;
        }

        // Mark this block as rendered
        self::$rendered_blocks[] = $block_id;

        // Generate pro SVG filters
        $svg = $this->generate_pro_svg($liquid_glass, $attributes);

        // Inject SVG after root wrapper
        return $this->inject_svg_after_root($block_content, $svg, $attributes);
    }

    /**
     * Check if SVG was rendered by this pro extension
     *
     * @param bool $was_rendered Current rendered status
     * @param array $liquid_glass Liquid glass attributes
     * @return bool Whether SVG was rendered
     */
    public function check_svg_rendered($was_rendered, $liquid_glass)
    {
        return $was_rendered || $this->is_pro_effect($liquid_glass);
    }

    /**
     * Check if the effect is a pro effect
     *
     * @param array $liquid_glass Liquid glass attributes
     * @return bool Whether this is a pro effect
     */
    private function is_pro_effect($liquid_glass)
    {
        return isset($liquid_glass['effect']) &&
               in_array($liquid_glass['effect'], ['effect3', 'effect4', 'effect5']);
    }

    /**
     * Generate pro liquid glass SVG filters
     *
     * @param array $liquid_glass Liquid glass attributes
     * @param array $attributes All block attributes
     * @return string SVG markup
     */
    private function generate_pro_svg($liquid_glass, $attributes = [])
    {
        $refraction = isset($liquid_glass['refraction']) ? floatval($liquid_glass['refraction']) : 0.009;
        $depth = isset($liquid_glass['depth']) ? intval($liquid_glass['depth']) : 77;
        $block_id = isset($attributes['blockId']) ? $attributes['blockId'] : '';

        $svg = '<svg style="display: none;">';

        // Effect 3 filter
        $svg .= '<filter id="eb-glass-distortion3-' . esc_attr($block_id) . '" x="0%" y="0%" width="100%" height="100%">';
        $svg .= '<feTurbulence type="fractalNoise" baseFrequency="' . esc_attr($refraction . ' ' . $refraction) . '" numOctaves="2" seed="92" result="noise" />';
        $svg .= '<feGaussianBlur in="noise" stdDeviation="0.02" result="blur" />';
        $svg .= '<feDisplacementMap in="SourceGraphic" in2="blur" scale="' . esc_attr($depth) . '" xChannelSelector="R" yChannelSelector="G" />';
        $svg .= '</filter>';

        // Effect 4 filter
        $svg .= '<filter id="eb-glass-distortion4-' . esc_attr($block_id) . '" x="0%" y="0%" width="100%" height="100%">';
        $svg .= '<feTurbulence type="fractalNoise" baseFrequency="' . esc_attr($refraction . ' ' . $refraction) . '" numOctaves="1" seed="9000" result="noise" />';
        $svg .= '<feGaussianBlur in="noise" stdDeviation="0.1" result="blurred" />';
        $svg .= '<feDisplacementMap in="SourceGraphic" in2="blurred" scale="' . esc_attr($depth) . '" xChannelSelector="R" yChannelSelector="G" />';
        $svg .= '</filter>';

        // Effect 5 filter
        $svg .= '<filter id="eb-glass-distortion5-' . esc_attr($block_id) . '">';
        $svg .= '<feTurbulence type="turbulence" baseFrequency="' . esc_attr($refraction) . '" numOctaves="3" result="turbulence" />';
        $svg .= '<feDisplacementMap in2="turbulence" in="SourceGraphic" scale="' . esc_attr($depth) . '" xChannelSelector="R" yChannelSelector="G" />';
        $svg .= '</filter>';

        $svg .= '</svg>';

        return $svg;
    }

    /**
     * Inject SVG content after root wrapper div
     *
     * @param string $block_content The block content
     * @param string $svg_content The SVG content to inject
     * @param array $attributes All block attributes
     * @return string Modified block content
     */
    private function inject_svg_after_root($block_content, $svg_content, $attributes)
    {
        // Find the root wrapper div and inject SVG after it
        if (isset($attributes['blockId'])) {
            $block_id = $attributes['blockId'];
            $root_pattern = '/(<div[^>]*class="[^"]*root-' . preg_quote($block_id, '/') . '[^"]*"[^>]*>)/';

            if (preg_match($root_pattern, $block_content, $matches)) {
                $root_div = $matches[1];

                // Replace the root div with root div + SVG
                $block_content = str_replace($root_div, $root_div . $svg_content, $block_content);
            } else {
                // Fallback: append to end if root pattern not found
                $block_content .= $svg_content;
            }
        } else {
            // Fallback: append to end if no blockId
            $block_content .= $svg_content;
        }

        return $block_content;
    }

    /**
     * Reset rendered blocks array for new page loads
     * Called on wp_head to ensure fresh state for each page
     */
    public static function reset_rendered_blocks()
    {
        self::$rendered_blocks = [];
    }
}