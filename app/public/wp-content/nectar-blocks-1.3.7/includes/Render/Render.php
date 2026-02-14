<?php

namespace Nectar\Render;

use Nectar\Editor\Blocks;
use Nectar\Global_Settings\{ Global_Colors, Global_Typography, Nectar_Plugin_Options, Nectar_Custom_Fonts };
use Nectar\Render\{RenderJS, Compatibility};
use Nectar\Utilities\{Log, HTTP};

/**
 * Blocks Editor configuration
 * @version 1.3.4
 * @since 0.0.2
 */
class Render {
  function __construct() {
    $this->initialize_hooks();
    $renderJS = new RenderJS();
    $compatibility = new Compatibility();
  }

  function initialize_hooks() {
    add_filter( 'should_load_separate_core_block_assets', '__return_true' );

    // As of wp 6.4, block styles will still load in the footer rather than the head
    // when using a classic or hybrid theme https://github.com/WordPress/gutenberg/issues/49927
    // This is  a workaround to load the styles before the block is rendered and can hopefully
    // be removed in the future.
    add_filter( 'render_block', [$this, 'make_nectar_block_css_non_deferred'], 9999, 2 );
    add_filter( 'render_block', [$this, 'render_template_part'], 10, 2 );
    // add_filter( "get_block_templates", [$this, "modify_get_block_templates_defaults" ], 10, 3 );

    add_filter( 'render_block', [$this, 'accessible_svgs'], 10, 2 );
    add_action( 'after_setup_theme', [$this, 'block_styles'] );
    add_action( 'plugins_loaded', [$this, 'localization'] );
    add_action( 'wp_enqueue_scripts', [$this, 'frontend_render_styles'], 99 );
    add_action( 'wp_enqueue_scripts', [$this, 'frontend_render_scripts'] );

    add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue'], 99 );
    add_action( 'admin_head', [$this, 'admin_head'], 1 );
    add_action( 'customize_controls_enqueue_scripts', [$this, 'customize_controls_enqueue_scripts'], 99 );
    add_action( 'wp_head', [$this, 'render_head'] );
    add_action( 'wp_body_open', [$this, 'wp_body_open'] );
  }

  function accessible_svgs( $block_content, $block ) {
    if (empty($block_content)) {
      return $block_content;
    }

    // Ensure it only applies to blocks in the 'nectar-blocks/' namespace
    if (! isset($block['blockName']) || strpos($block['blockName'], 'nectar-blocks/') !== 0) {
      return $block_content;
    }

     // Regex pattern to find <svg> elements that don't have a role attribute
     $pattern = '/<svg(?![^>]*\brole=)[^>]*>/i';

     // Callback function to add role="none"
     $block_content = preg_replace_callback($pattern, function ($matches) {
         return str_replace('<svg', '<svg role="none"', $matches[0]);
     }, $block_content);

     return $block_content;

  }

  // function modify_get_block_templates_defaults($query_result, $query, $template_type) { 

  //   Log::debug('get_block_temps', [
  //     '$query_result' => $query_result,
  //     '$query' => $query,
  //     '$template_type' => $template_type
  //   ]);

  //   // Update the $query_result variable according to your website requirements and return this variable.
  //   // You can modify the $query_result variable conditionally too if you want.
  //   return $query_result; 
  // }

  /**
   * Adds the _nectar_blocks_css post metadata field when we are in a block theme for wp_template_parts.
   * @since 0.2.2
   * @version 0.2.2
   */
  function render_template_part( $block_content, $block ) {
    // Bail early if we are not in a block theme
    if ( ! wp_is_block_theme() ) {
      return $block_content;
    }
    global $nectar_template_parts_css;
    if ( empty($nectar_template_parts_css) ) {
      $nectar_template_parts_css = '';
    }

    // Skip non core/template-part blocks
    if (array_key_exists('blockName', $block) && $block['blockName'] !== 'core/template-part') {
      return $block_content;
    }

    if (! array_key_exists('attrs', $block)) {
      Log::error('No attrs found for wp_template_part');
      return $block_content;
    }
    $attrs = $block['attrs'];

    if (! array_key_exists('slug', $attrs)) {
      Log::error('No attrs slug found for wp_template_part');
      return $block_content;
    }
    $slug = $attrs['slug'];

    if (! array_key_exists('theme', $attrs)) {
      Log::error('No attrs theme found for wp_template_part');
      return $block_content;
    }
    $theme = $attrs['theme'];
    $post_name = $theme . '//' . $slug;
    $block_template = get_block_template($post_name, 'wp_template_part');
    $post_id = $block_template->wp_id;

    $theme_part_css = get_post_meta( $post_id, '_nectar_blocks_css', true );
    Log::debug('render_template_part', [
      'time' => time(),
      'post_name' => $post_name,
      'post_id' => $post_id,
      'theme_part_css' => $theme_part_css
    ]);

    if ($theme_part_css) {
      $nectar_template_parts_css .= $theme_part_css;
    }

    return $block_content;
  }

  /**
   * Filters the content of a single block.
   *
   * @param string   $block_content The block content.
   * @param array    $block         The full block, including name and attributes.
   * @see            https://github.com/WordPress/gutenberg/pull/50087/files
   */
  function make_nectar_block_css_non_deferred( $block_content, $block ) {

      // Bail early if not a classic theme.
      if ( wp_is_block_theme() || ! wp_should_load_separate_core_block_assets() ) {
        return $block_content;
      }

      // Bail early if not a Nectar block.
      if ( ! isset( $block['blockName'] ) || ! str_starts_with( $block['blockName'], 'nectar-blocks/' ) ) {
        return $block_content;
      }

      /* This filter is documented in wp-includes/script-loader.php */
      $total_inline_limit = apply_filters( 'styles_inline_size_limit', 20000 );

      // A static var to keep track of the total inlined CSS size.
      static $total_inline_size = 0;

      // Get the handle for this block's stylesheet.
      $handle = str_replace( 'nectar-blocks/', 'nectar-blocks-', $block['blockName'] );

      // Get the WP_Styles object.
      $wp_styles = wp_styles();

      // Bail early if this block was already processed.
      if ( in_array( $handle, $wp_styles->done, true ) ) {
        return $block_content;
      }

      // Bail early if the block doesn't have a stylesheet.
      if ( empty( $wp_styles->registered[$handle] ) ) {
        return $block_content;
      }

      $path = wp_styles()->get_data( $handle, 'path' );
      $after = wp_styles()->get_data( $handle, 'after' );
      if ( is_array( $after ) ) {
        $after = implode( '', $after );
      }

      // Bail early if the stylesheet doesn't have a "path" defined,
      // or if there are no inline styles attached to it.
      if ( ! $path && ! $after ) {
        return $block_content;
      }

      // Get the CSS for this block's stylesheet.
      $css = file_exists( $path ) ? file_get_contents( $path ) : '';

      // Add the "after" styles.
      $css .= $after;

      // Enqueue the styles from the dependencies.
      // Unfortunately, these will still have to load in the footer.
      $deps = wp_styles()->registered[$handle]->deps;

      if ( ! empty( $deps ) ) {
        foreach ( $deps as $dep ) {
          // Ensure dep was not already loaded.
          if ( ! in_array( $dep, $wp_styles->done, true ) ) {
            wp_enqueue_style($dep);
          }
        }
      }

      // Get the size of the CSS.
      $styles_size = strlen( $css );

      // Bail early if the CSS is empty.
      if ( 0 === $styles_size ) {
        $wp_styles->done[] = $handle;
        return $block_content;
      }

      // Check if adding these styles inline will exceed the limit.
      // If it does, then bail early.

      // The default limit is much than what we use in Nectar Blocks, so should never be an issue.
      // However, this can just be removed if needed.
      if ( $total_inline_size + $styles_size > $total_inline_limit ) {
        return $block_content;
      }

      $wp_styles->done[] = $handle;
      $block_content = '<style id="' . $handle . '-inline-css">' . $css . '</style>' . $block_content;

      return $block_content;
  }

  /**
   * Enqueues core stylesheets for each block when a block is found on the page.
   */
  function block_styles() {

    foreach ( Blocks::$block_list as $block => $args) {
      $asset_args = [
        'handle' => "nectar-blocks-$block",
        'src' => NECTAR_BLOCKS_BUILD_PATH . '/blocks/' . $block . '/frontend-style.css',
        'path' => NECTAR_BLOCKS_ROOT_DIR_PATH . '/build/blocks/' . $block . '/frontend-style.css',
      ];

      // deps.
      if ( isset( $args['deps'] ) && ! empty($args['deps']) ) {
        $asset_args['deps'] = $args['deps'];
      }

      if ( file_exists($asset_args['path']) ) {
        // --------- LOADED IN FRONTEND ONLY -------------
        if( ! is_admin() ) {
          wp_enqueue_block_style( "nectar-blocks/$block", $asset_args );
        }
      }

    }
  }

  function localization() {
    load_plugin_textdomain( 'nectar-blocks', false, NECTAR_BLOCKS_FOLDER_NAME . '/languages' );
  }

  function admin_enqueue() {
    $screen = get_current_screen();
    if( $screen && $screen->id && 'customize' === $screen->id) {
      // Uploaded fonts.
      $uploaded_fonts = Global_Typography::create_uploaded_fonts_style('frontend');
      if ( $uploaded_fonts ) {
        wp_add_inline_style( 'nectar-customizer-css', $uploaded_fonts);
      }
    }
  }

  /**
   * Registers or Enqueues JS for frontend
   */
  function frontend_render_scripts() {
    global $post;
    wp_register_script( 'gsap', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/gsap/gsap.min.js', [], '3.12.5', true );
    wp_register_script( 'gsap-scroll-trigger', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/gsap/ScrollTrigger.min.js', ['gsap'], '3.12.5', true );
    wp_register_script( 'gsap-custom-ease', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/gsap/CustomEase.min.js', ['gsap'], '3.12.5', true );

    wp_register_script( 'split-type', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/split-type/index.min.js', [], '0.3.4', true );
    wp_register_script( 'count-up', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/countup/countup.js', [], '2.8.0', true );
    wp_register_script( 'swiper', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/swiper/swiper-bundle.min.js', [], '11.0.3', true );
    wp_register_script( 'fitty', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/fitty/fitty.min.js', [], '2.4.2', true);
    // wp_register_script( 'lightgallery', 'https://cdnjs.cloudflare.com/ajax/libs/lightgallery/2.7.2/lightgallery.min.js', [], '2.7.2', true);

    $frontend_JS_asset_path = NECTAR_BLOCKS_ROOT_DIR_PATH . '/build/nectar-blocks-frontend.asset.php';
    $args_array = include($frontend_JS_asset_path);
    // localize page id to nectar-frontend

    wp_register_script( 'nectar-blocks-frontend', NECTAR_BLOCKS_PLUGIN_PATH . '/build/nectar-blocks-frontend.js', $args_array['dependencies'], $args_array['version'], true );
    wp_enqueue_script( 'nectar-blocks-frontend' );
    if ( isset($post->ID) ) {
      // Post JS
      $post_JS = get_post_meta( $post->ID, '_nectar_blocks_page_js', true );
      Log::debug($post_JS);
      wp_add_inline_script( 'nectar-blocks-frontend', $post_JS );
    }
    wp_localize_script( 'nectar-blocks-frontend', 'nectarBlocksData', [
      'postID' => get_the_ID()
    ]);
  }

  /**
   * Enqueues the admin scripts in the customizer.
   * @since 1.3.5
   * @version 1.3.5
   */
  function customize_controls_enqueue_scripts() {
    wp_register_script( 'nectar-blocks-env-variables', '', );
    wp_enqueue_script( 'nectar-blocks-env-variables' );
    wp_add_inline_script(
        'nectar-blocks-env-variables',
        'window.nectarblocks_env =' . json_encode($this->get_nectar_blocks_env_variables()) . ';',
        'before'
    );
  }

  /**
   * Gets the nectar blocks env variables.
   * @since 1.3.5
   * @version 1.3.5
   * @return array
   */
  function get_nectar_blocks_env_variables() {
    $output = [];

    if (defined('NECTAR_BLOCKS_VERSION')) {
      $output['NB_PLUGIN_VERSION'] = NECTAR_BLOCKS_VERSION;
    } else {
      $output['NB_PLUGIN_VERSION'] = null;
    }

    if (defined('NB_THEME_VERSION')) {
      $output['NB_THEME_VERSION'] = NB_THEME_VERSION;
    } else {
      $output['NB_THEME_VERSION'] = null;
    }

    if (defined('NB_IE_VERSION')) {
      $output['NB_IE_VERSION'] = NB_IE_VERSION;
    } else {
      $output['NB_IE_VERSION'] = null;
    }

    $output['PHP_VERSION'] = phpversion();
    $output['WORDPRESS_VERSION'] = get_bloginfo('version');
    $output['IS_BLOCK_THEME'] = wp_is_block_theme();
    $output['WOOCOMMERCE_ACTIVE'] = class_exists('WooCommerce');
    // $output['EDITOR_DOM'] = null;

    $output['IS_WIDGET_EDITOR'] = false;
    $screen = get_current_screen();
    if ( property_exists($screen, 'base') ) {
      if ($screen->base === 'widgets') {
        $output['IS_WIDGET_EDITOR'] = true;
      }
    }

    $output['WORDPRESS_ADMIN_URL'] = admin_url();
    $output['THEME_OPTIONS_URL'] = admin_url('customize.php');

    $nectar_plugin_options = Nectar_Plugin_Options::get_options();
    $output['NECTAR_PLUGIN_SETTINGS'] = [
      'shouldDisableNectarGlobalTypography' => $nectar_plugin_options['shouldDisableNectarGlobalTypography']
    ];

    return $output;
  }

  /**
   * Used to set global context variables for the admin.
   */
  function admin_head() {

    $output = $this->get_nectar_blocks_env_variables();

    echo '<script>window.nectarblocks_env =' . json_encode($output) . ';</script>';
  }

  /**
   * Renders in the head tag.
   */
  function render_head() {

    // Custom code in head
    $custom_code = get_option('nectar_code_options');
    if ( $custom_code ) {
      $custom_code_head = $custom_code['jsCodeHead'];
      if ( $custom_code_head ) {
        echo $custom_code_head;
      }
    }
  }

  /**
   * Renders after the opening body tag.
   */
  function wp_body_open() {

    // Custom code after body
    $custom_code = get_option('nectar_code_options');
    if ( $custom_code ) {
      $custom_code_body = $custom_code['jsCodeBody'];
      if ( $custom_code_body ) {
        echo $custom_code_body;
      }
    }
  }

  function frontend_pattern_set($blocks) {
    $pattern_set = [];
    $blocks = $this->flatten_blocks($blocks);

    foreach( $blocks as $block ) {
      if ( 'core/block' === $block['blockName'] ) {
        $pattern_ref = $block['attrs']['ref'];
        $pattern_set[$pattern_ref] = true;
        Log::debug('Adding to pattern set: ' . $pattern_ref);

        $pattern_post = get_post($pattern_ref);
        $sub_blocks = parse_blocks($pattern_post->post_content);
        $sub_patterns = $this->frontend_pattern_set($sub_blocks);
        // Log::debug(json_encode($sub_blocks));
        $pattern_set = $pattern_set + $sub_patterns;
      }
    }

    return $pattern_set;
  }

  function flatten_blocks( &$blocks ) {
    $all_blocks = [];
    $queue = [];
    foreach ( $blocks as &$block ) {
      $queue[] = &$block;
    }

    while ( count( $queue ) > 0 ) {
      $block = &$queue[0];
      array_shift( $queue );
      $all_blocks[] = &$block;

      if ( ! empty( $block['innerBlocks'] ) ) {
        foreach ( $block['innerBlocks'] as &$inner_block ) {
          $queue[] = &$inner_block;
        }
      }
    }

    return $all_blocks;
  }

  /**
   * Adds pattern css that is saved in _nectar_blocks_css metadata.
   */
  function frontend_pattern_css($blocks) {
    $pattern_set = $this->frontend_pattern_set($blocks);
    Log::debug('Pattern Set: ' . json_encode($pattern_set));

    $patterns_css = '';
    foreach( $pattern_set as $block_id => $v ) {
      Log::debug('Patten CSS output for ' . $block_id);
      $pattern_css = get_post_meta( $block_id, '_nectar_blocks_css', true );
      $patterns_css .= $pattern_css;
    }

    return $patterns_css;
  }

  /**
   * Registers or Enqueues CSS for frontend
   */
  function add_google_preconnect_links() {
    echo '<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>';
  }

  function add_custom_fonts_preload_links(): void {
    $custom_fonts = apply_filters('nectar_custom_font_list', Nectar_Custom_Fonts::get_options());
    if ( ! empty($custom_fonts) ) {
      foreach ($custom_fonts as $slug => $custom_font) {
        foreach ($custom_font['variations'] as $variation) {
          $exploded = explode('.', $variation['url']);
          $format = array_pop($exploded);
          if ($format !== 'woff' && $format !== 'woff2') {
            $format = 'truetype';
          }
          echo '<link rel="preload" href="' . HTTP::maybe_force_https(esc_attr($variation['url'])) . '" as="font" type="font/' . esc_attr($format) . '" crossorigin>';
        }
      }
    }
  }

  function frontend_render_styles() {
    global $post;

    // NB Plugin Options
    $nb_plugin_options = Nectar_Plugin_Options::get_options();

    // General Frontend Styles
    wp_enqueue_style( 'nectar-frontend-global', NECTAR_BLOCKS_PLUGIN_PATH . '/build/nectar-blocks-core.css', [], NECTAR_BLOCKS_VERSION);
    // Always enqueue these to skip the inline since they're likely used on every page.
    wp_enqueue_style( 'nectar-blocks-row', NECTAR_BLOCKS_PLUGIN_PATH . '/build/blocks/row/frontend-style.css', [], NECTAR_BLOCKS_VERSION);
    wp_enqueue_style( 'nectar-blocks-column', NECTAR_BLOCKS_PLUGIN_PATH . '/build/blocks/column/frontend-style.css', [], NECTAR_BLOCKS_VERSION);
    wp_enqueue_style( 'nectar-blocks-text', NECTAR_BLOCKS_PLUGIN_PATH . '/build/blocks/text/frontend-style.css', [], NECTAR_BLOCKS_VERSION);

    // Custom CSS
    $custom_code = get_option('nectar_code_options');
    if ( $custom_code ) {
      $custom_css = $custom_code['cssCode'];
      if ( $custom_css ) {
        wp_add_inline_style( 'nectar-frontend-global', $custom_css );
      }
    }

    // Third party styles.
    wp_register_style('nectar-blocks-swiper', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/swiper/bundle.css', [], '9.4.1');
    wp_register_style('nectar-blocks-lightgallery', NECTAR_BLOCKS_PLUGIN_PATH . '/assets/lightgallery/css/bundle.min.css', [], '9.4.1');
    // This has to be global since any link can trigger the lightgallery.
    wp_enqueue_style('nectar-blocks-lightgallery');

    // Google fonts.
    $google_fonts = Global_Typography::create_google_fonts_link('frontend');
    if ( $google_fonts ) {
      // add preconnect for google fonts
      add_action('wp_head', [$this, 'add_google_preconnect_links'], 4);
      // Enqueue fonts
      wp_enqueue_style( 'nectar-blocks-google-fonts', $google_fonts, [], null );
    }

    // Uploaded fonts.
    $uploaded_fonts = Global_Typography::create_uploaded_fonts_style('frontend');
    if ( $uploaded_fonts ) {
      wp_add_inline_style( 'nectar-frontend-global', $uploaded_fonts);
      add_action('wp_head', [$this, 'add_custom_fonts_preload_links'], 4);
    }

    // Post title visibility
    if ( isset($post->ID) ) {
      // Post title visibility
      $global_post_hide_title_vis = $nb_plugin_options['shouldHideTitleDefault'];
      $post_hide_title_vis = get_post_meta( $post->ID, '_nectar_blocks_hide_post_title', true );
      $post_title_css = '';

      if ( $post_hide_title_vis === '1' || ($global_post_hide_title_vis === true && is_page()) ) {
        $post_title_css = 'h1.wp-block-post-title {
          display: none;
        }';
        wp_add_inline_style( 'nectar-frontend-global', $post_title_css );
      }

      // Post CSS
      $post_CSS = get_post_meta( $post->ID, '_nectar_blocks_page_css', true );
      wp_add_inline_style( 'nectar-frontend-global', $post_CSS );
    }

    // Dynamic styles from block element settings.
    $dynamic_css = '';

    $post_content = $post->post_content;
    if ($post_content) {
      $blocks = parse_blocks($post_content);
      $patterns_css = $this->frontend_pattern_css($blocks);
      $dynamic_css .= $patterns_css;
    }

    $post_status = get_post_status( get_the_ID() );
    $use_preview_css = false;
    if ( is_preview() ) {
      // Skip drafts and auto drafts. They should not use the preview CSS.

      // Published / Private posts
      if ( in_array($post_status, ['publish', 'private']) ) {
        $use_preview_css = true;
      }

      // Some post statuses will technically return true for is_preview() 
      // in both the actual preview and the frontend. We can determine which is the 
      // real preview by checking the query var.

      // Scheduled / Pending posts
      if ( in_array($post_status, ['future', 'pending']) && get_query_var('preview') ) {
        $use_preview_css = true;
      }

    }

    if ( $use_preview_css ) {
      $dynamic_css .= get_post_meta( get_the_ID(), '_nectar_blocks_css_preview', true );
    } else {
      $dynamic_css .= get_post_meta( get_the_ID(), '_nectar_blocks_css', true );
    }

    wp_add_inline_style( 'nectar-frontend-global', $dynamic_css );

    // Dynamic styles from widgets
    $widget_dynamic_css = get_option('nectar_blocks_widgets_css');
    if ( ! empty($widget_dynamic_css) ) {
      wp_add_inline_style( 'nectar-frontend-global', $widget_dynamic_css );
    }
    // Log::debug('nectar_blocks_widgets_css:' . $widget_dynamic_css);

    // Dynamic styles from FSE templates
    $fse_dynamic_css = get_option('nectar_blocks_fs_templates_css');
    if ( ! empty($fse_dynamic_css) ) {

      $css = '';
      foreach ( $fse_dynamic_css as $template => $styles ) {
        $css .= $styles;
      }

      if ( ! empty($css) ) {
        wp_add_inline_style( 'nectar-frontend-global', $css );
      }

    }

    // Adds CSS vars from our Global Settings
    // -- Global Colors
    $color_css = Global_Colors::css_output();
    if ( $color_css ) {
      wp_add_inline_style( 'nectar-frontend-global', $color_css );
    }

    // -- Global Typography
    // Disable global typography output if required
    $typography_css = Global_Typography::css_output( 'render', $nb_plugin_options['shouldDisableNectarGlobalTypography'] );
    if ( $typography_css ) {
      wp_add_inline_style( 'nectar-frontend-global', $typography_css );
    }

    // Get wp_template CSS, only for block based themes
    if (wp_is_block_theme()) {
      global $_wp_current_template_id;
      $block_template = get_block_template($_wp_current_template_id, 'wp_template');
      $post_id = $block_template->wp_id;
      $template_css = get_post_meta( $post_id, '_nectar_blocks_css', true );
      if ($template_css) {
        Log::debug('Rendering wp_template ' . $_wp_current_template_id . ' ' . $post_id . ': ' . $template_css);
        wp_add_inline_style( 'nectar-frontend-global', $template_css );
      }
    }

    // wp_template_part CSS for block theme
    global $nectar_template_parts_css;
    if (! empty($nectar_template_parts_css)) {
      Log::debug('Rendering wp_template_part css:' . $nectar_template_parts_css);
      wp_add_inline_style( 'nectar-frontend-global', $nectar_template_parts_css );
    }
  }
}
