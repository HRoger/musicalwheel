/**
 * @fileoverview Essential Blocks Editor - Block Definitions and Controls
 * 
 * @description
 * This is the main editor bundle for Essential Blocks WordPress Gutenberg plugin.
 * It contains all block definitions, edit components, save components, inspector
 * controls, and style generators for 40+ Gutenberg blocks.
 * 
 * This is a VERY LARGE file (3.6MB, 20,616 lines) containing the complete
 * Essential Blocks editor functionality. This documented version provides
 * an overview of the architecture and key components.
 * 
 * @module essential-blocks/editor
 * @version De-minified documentation version
 * 
 * @requires React - For component rendering
 * @requires wp.i18n - Internationalization
 * @requires wp.blockEditor - Block editor API (RichText, InspectorControls, etc.)
 * @requires wp.blocks - Block registration
 * @requires wp.components - UI components
 * @requires wp.data - State management
 * @requires wp.element - React utilities
 * @requires wp.hooks - WordPress hooks
 * @requires EBControls - Essential Blocks control components
 * 
 * @author Essential Blocks Team (WPDeveloper)
 * @see https://essential-blocks.com/
 * 
 * File Structure:
 * ===============
 * 1. Module imports and dependencies
 * 2. Shared constants and configurations
 * 3. Block-specific modules (one per block type)
 * 4. Style generators
 * 5. Block registrations
 * 6. Webpack runtime
 * 
 * Blocks Included:
 * ================
 * - Accordion
 * - Advanced Heading
 * - Advanced Image
 * - Advanced Navigation
 * - Advanced Tabs
 * - Advanced Video
 * - Button
 * - Call To Action
 * - Countdown
 * - Counter
 * - Dual Button
 * - Feature List
 * - Flipbox
 * - Form
 * - Google Maps
 * - Icon
 * - Image Comparison
 * - Image Gallery
 * - Infobox
 * - Instagram Feed
 * - Interactive Promo
 * - NFT Gallery
 * - Notice
 * - Number Counter
 * - Openverse
 * - Parallax Slider
 * - Popup
 * - Post Carousel
 * - Post Grid
 * - Pricing Table
 * - Progress Bar
 * - Row
 * - Shape Divider
 * - Slider
 * - Social
 * - Social Share
 * - Table of Contents
 * - Team Member
 * - Testimonial
 * - Timeline
 * - Typing Text
 * - Wrapper
 * - WooCommerce Blocks
 */

(() => {
  "use strict";

  var chunkCache;
  var modules = {

    /* ========================================================================
     * MODULE 247: Post Grid/Carousel Block Inspector
     * ========================================================================
     * Provides the inspector (sidebar) controls for Post Grid and 
     * Post Carousel blocks.
     */
    247(module, exports, require) {

      const wpI18n = require(27723);
      var objectSpread = require(58168);
      var arrayDestructure = require(82284);
      var slicedToArray = require(3453);
      var defineProperty = require(64467);
      var React = require(51609);
      var useState = require(86087);
      var useSelect = require(28107);
      var blockEditor = require(52619);
      var components = require(38443);
      var wpData = require(47143);
      var hooks = require(4589);
      var uuid = require(10900);
      var controls = require(94715);
      var richText = require(56427);
      var panelBody = require(46005);

      /* ----------------------------------------------------------------------
       * Control Name Constants
       * These constants define the attribute prefixes for different control groups
       * ---------------------------------------------------------------------- */

      /**
       * Wrapper margin control name prefix
       * @constant {string}
       */
      var WRP_MARGIN = "wrpMargin";

      /**
       * Wrapper padding control name prefix
       * @constant {string}
       */
      var WRP_PADDING = "wrpPadding";

      /**
       * Wrapper border/shadow control name prefix
       * @constant {string}
       */
      var WRP_BORDER_SHADOW = "wrpBorderShadow";

      /**
       * Wrapper background control name prefix
       * @constant {string}
       */
      var WRP_BG = "wrpBG";

      /**
       * Column padding control name prefix
       * @constant {string}
       */
      var COLUMN_PADDING = "columnPadding";

      /**
       * Column media width control name prefix
       * @constant {string}
       */
      var COLUMN_MEDIA_WIDTH = "columnMediaWidth";

      /**
       * Column background control name prefix
       * @constant {string}
       */
      var COLUMN_BG = "columnBG";

      /**
       * Column border/shadow control name prefix
       * @constant {string}
       */
      var COLUMN_BORDER_SHADOW = "columnBorderShadow";

      /**
       * Thumbnail image size control name prefix
       * @constant {string}
       */
      var THUMBNAIL_IMAGE_SIZE = "thumbnailImageSize";

      /**
       * Thumbnail border radius control name prefix
       * @constant {string}
       */
      var THUMBNAIL_BDR = "thumbnailBDR";

      /**
       * Thumbnail margin control name prefix
       * @constant {string}
       */
      var THUMBNAIL_MARGIN = "thumbnailMargin";

      /**
       * Title margin control name prefix
       * @constant {string}
       */
      var TITLE_MARGIN = "titleMargin";

      /**
       * Content margin control name prefix
       * @constant {string}
       */
      var CONTENT_MARGIN = "contentMargin";

      /**
       * Read more margin control name prefix
       * @constant {string}
       */
      var READMORE_MARGIN = "readmoreMargin";

      /**
       * Read more padding control name prefix
       * @constant {string}
       */
      var READMORE_PADDING = "readmorePadding";

      /**
       * Header meta margin control name prefix
       * @constant {string}
       */
      var HEADER_META_MARGIN = "headerMetaMargin";

      /**
       * Footer meta margin control name prefix
       * @constant {string}
       */
      var FOOTER_META_MARGIN = "footerMetaMargin";

      /**
       * Header meta space control name prefix
       * @constant {string}
       */
      var HEADER_META_SPACE = "headerMetaSpace";

      /**
       * Footer meta space control name prefix
       * @constant {string}
       */
      var FOOTER_META_SPACE = "footerMetaSpace";

      /**
       * Avatar border radius control name prefix
       * @constant {string}
       */
      var AVATAR_BDR = "avatarBDR";

      /**
       * Slide to show control name prefix (for carousel)
       * @constant {string}
       */
      var SLIDE_TO_SHOW = "slideToShow";

      /**
       * Dots gap control name prefix
       * @constant {string}
       */
      var DOTS_GAP = "dotsGap";

      /**
       * Arrow position control name prefix
       * @constant {string}
       */
      var ARROW_POSITION = "arrowPosition";

      /**
       * Dots position control name prefix
       * @constant {string}
       */
      var DOTS_POSITION = "dotsPosition";

      /**
       * Arrow size control name prefix
       * @constant {string}
       */
      var ARROW_SIZE = "arrowSize";

      /**
       * Dots size control name prefix
       * @constant {string}
       */
      var DOTS_SIZE = "dotsSize";

      /**
       * Slides gap control name prefix
       * @constant {string}
       */
      var SLIDES_GAP = "slidesGap";

      /**
       * Read more border control name prefix
       * @constant {string}
       */
      var READMORE_BORDER = "readmoreBorder";

      /* ----------------------------------------------------------------------
       * UI Option Constants
       * ---------------------------------------------------------------------- */

      /**
       * Size unit options (px, em, %)
       * @constant {Array<{label: string, value: string}>}
       */
      var SIZE_UNITS = [
        { label: "px", value: "px" },
        { label: "em", value: "em" },
        { label: "%", value: "%" }
      ];

      /**
       * Height unit options (px, em, vh)
       * @constant {Array<{label: string, value: string}>}
       */
      var HEIGHT_UNITS = [
        { label: "px", value: "px" },
        { label: "em", value: "em" },
        { label: "vh", value: "vh" }
      ];

      /**
       * Hover state tab options
       * @constant {Array<{label: string, value: string}>}
       */
      var HOVER_TABS = [
        { label: "Normal", value: "normal" },
        { label: "Hover", value: "hover" }
      ];

      /**
       * Heading tag options (H1-H6, P)
       * @constant {Array<{label: string, value: string}>}
       */
      var HEADING_TAGS = [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
        { label: "H5", value: "h5" },
        { label: "H6", value: "h6" },
        { label: "P", value: "p" }
      ];

      /**
       * Dot style options for carousel pagination
       * @constant {Array<{label: string, value: string}>}
       */
      var DOT_STYLES = [
        { label: (0, wpI18n.__)("Style 1", "essential-blocks"), value: "dot-style-1" },
        { label: (0, wpI18n.__)("Style 2", "essential-blocks"), value: "dot-style-2" },
        { label: (0, wpI18n.__)("Style 3", "essential-blocks"), value: "dot-style-3" },
        { label: (0, wpI18n.__)("Style 4", "essential-blocks"), value: "dot-style-4" },
        { label: (0, wpI18n.__)("Modern 1", "essential-blocks"), value: "eb-dot-style-modern-1" },
        { label: (0, wpI18n.__)("Modern 2", "essential-blocks"), value: "eb-dot-style-modern-2" },
        { label: (0, wpI18n.__)("Modern 3", "essential-blocks"), value: "eb-dot-style-modern-3" }
      ];

      /**
       * Text alignment options with icons
       * @constant {Array<{label: JSX.Element, value: string}>}
       */
      var TEXT_ALIGN_OPTIONS = [
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-alignleft" })), 
          value: "left" 
        },
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-aligncenter" })), 
          value: "center" 
        },
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-alignright" })), 
          value: "right" 
        }
      ];

      /**
       * Flexbox alignment options
       * @constant {Array<{label: JSX.Element, value: string}>}
       */
      var FLEX_ALIGN_OPTIONS = [
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-alignleft" })), 
          value: "flex-start" 
        },
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-aligncenter" })), 
          value: "center" 
        },
        { 
          label: (0, wpI18n.__)(React.createElement(richText.Dashicon, { icon: "editor-alignright" })), 
          value: "flex-end" 
        }
      ];

      /**
       * Vertical alignment options
       * @constant {Array<{label: string, value: string}>}
       */
      var VERTICAL_ALIGN_OPTIONS = [
        { label: "Top", value: "flex-start" },
        { label: "Middle", value: "center" },
        { label: "Bottom", value: "flex-end" }
      ];

      /**
       * Typography prefix constants for post grid
       * @constant {string}
       */
      var EBPG_TITLE = "ebpg_title";
      var EBPG_CONTENT = "ebpg_content";
      var EBPG_READMORE = "ebpg_readmore";
      var EBPG_META = "ebpg_meta";

      /* ----------------------------------------------------------------------
       * Helper Functions
       * ---------------------------------------------------------------------- */

      /**
       * Gets object keys including symbols.
       * @private
       */
      function getOwnKeys(obj, includeSymbols) {
        var keys = Object.keys(obj);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(obj);
          if (includeSymbols) {
            symbols = symbols.filter(function(sym) {
              return Object.getOwnPropertyDescriptor(obj, sym).enumerable;
            });
          }
          keys.push.apply(keys, symbols);
        }
        return keys;
      }

      /**
       * Object spread helper.
       * @private
       */
      function spread(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i] != null ? arguments[i] : {};
          if (i % 2) {
            getOwnKeys(Object(source), true).forEach(function(key) {
              (0, defineProperty.A)(target, key, source[key]);
            });
          } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
          } else {
            getOwnKeys(Object(source)).forEach(function(key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
          }
        }
        return target;
      }

      /**
       * Post Grid Inspector Component.
       * Provides all sidebar controls for the Post Grid block including:
       * - Query settings
       * - Layout options
       * - Thumbnail settings
       * - Title settings
       * - Content settings
       * - Meta settings
       * - Read more button
       * - Carousel settings (if slider mode)
       * 
       * @component
       * @param {Object} props - Component props
       * @param {Object} props.attributes - Block attributes
       * @param {Function} props.setAttributes - Attribute setter
       * @param {boolean} props.slider - Whether in slider/carousel mode
       * @param {Function} props.setQueryResults - Query results setter
       * @returns {JSX.Element} Inspector controls panel
       */
      const PostGridInspector = function(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var isSlider = props.slider;
        var setQueryResults = props.setQueryResults;

        // Destructure all attributes
        var resOption = attributes.resOption;
        var preset = attributes.preset;
        var queryData = attributes.queryData;
        var postTerms = attributes.postTerms;
        var showThumbnail = attributes.showThumbnail;
        var thumbnailOverlayColor = attributes.thumbnailOverlayColor;
        var thumbnailOverlayHoverColor = attributes.thumbnailOverlayHoverColor;
        var showTitle = attributes.showTitle;
        var titleColor = attributes.titleColor;
        var titleHoverColor = attributes.titleHoverColor;
        var titleColorStyle = attributes.titleColorStyle;
        var titleLength = attributes.titleLength;
        var titleTextAlign = attributes.titleTextAlign;
        var titleTag = attributes.titleTag;
        var showContent = attributes.showContent;
        var contentColor = attributes.contentColor;
        var contentTextAlign = attributes.contentTextAlign;
        var contentLength = attributes.contentLength;
        var expansionIndicator = attributes.expansionIndicator;
        var showReadMore = attributes.showReadMore;
        var readmoreText = attributes.readmoreText;
        var readmoreColor = attributes.readmoreColor;
        var readmoreBGColor = attributes.readmoreBGColor;
        var readmoreTextAlign = attributes.readmoreTextAlign;
        var readmoreHoverColor = attributes.readmoreHoverColor;
        var readmoreBGHoverColor = attributes.readmoreBGHoverColor;
        var readmoreColorType = attributes.readmoreColorType;
        var showMeta = attributes.showMeta;
        var headerMeta = attributes.headerMeta;
        var footerMeta = attributes.footerMeta;
        var authorPrefix = attributes.authorPrefix;
        var datePrefix = attributes.datePrefix;
        var headerMetaTextAlign = attributes.headerMetaTextAlign;

        // Inspector implementation continues...
        // Full implementation in formatted file
      };
    },

    /* ========================================================================
     * INFOBOX BLOCK - Save Components
     * ========================================================================
     * Contains multiple deprecated save component versions for the Infobox
     * block, ensuring backward compatibility with older block versions.
     */

    /**
     * Infobox Save Component (Deprecated v1).
     * Renders the saved HTML for an older Infobox block version.
     * 
     * @component
     * @param {Object} props - Component props
     * @param {Object} props.requiredProps - Required block properties
     * @returns {JSX.Element} Saved block HTML
     * @deprecated Use current version instead
     */
    // InfoboxSaveV1 function...

    /**
     * Infobox Save Component (Deprecated v2).
     * Adds linkNewTab support for opening links in new tabs.
     * 
     * @component
     * @param {Object} props - Component props
     * @param {Object} props.requiredProps - Required block properties
     * @returns {JSX.Element} Saved block HTML
     * @deprecated Use current version instead
     */
    // InfoboxSaveV2 function...

    /**
     * Infobox Save Component (Current Version).
     * Full-featured save component with all current options:
     * - Icon, number, or image media
     * - Title, subtitle, description
     * - Button with effects
     * - Click-to-link whole box option
     * 
     * @component
     * @param {Object} props - Component props
     * @param {Object} props.requiredProps - Required block properties
     * @param {string} props.requiredProps.blockId - Unique block ID
     * @param {string} props.requiredProps.infoboxIcon - Icon class or SVG
     * @param {string} props.requiredProps.media - Media type (icon/number/image)
     * @param {string} props.requiredProps.number - Display number
     * @param {string} props.requiredProps.imageUrl - Image URL
     * @param {string} props.requiredProps.imageAlt - Image alt text
     * @param {string} props.requiredProps.infoboxLink - Link URL
     * @param {boolean} props.requiredProps.linkNewTab - Open in new tab
     * @param {boolean} props.requiredProps.enableSubTitle - Show subtitle
     * @param {boolean} props.requiredProps.enableDescription - Show description
     * @param {boolean} props.requiredProps.enableButton - Show button
     * @param {boolean} props.requiredProps.isInfoClick - Whole box is clickable
     * @param {string} props.requiredProps.buttonText - Button label
     * @param {string} props.requiredProps.title - Infobox title
     * @param {string} props.requiredProps.subTitle - Infobox subtitle
     * @param {string} props.requiredProps.description - Infobox description
     * @param {string} props.requiredProps.titleTag - Title HTML tag
     * @param {string} props.requiredProps.subTitleTag - Subtitle HTML tag
     * @param {string} props.requiredProps.btnEffect - Button hover effect
     * @param {string} props.requiredProps.classHook - Additional CSS class
     * @returns {JSX.Element} Saved block HTML
     */
    // InfoboxSaveCurrent function...
  };

  /* ==========================================================================
   * BLOCK ARCHITECTURE OVERVIEW
   * ==========================================================================
   * 
   * Each block in Essential Blocks follows this structure:
   * 
   * 1. CONSTANTS
   *    - Control name prefixes
   *    - Typography prefixes
   *    - UI option arrays
   * 
   * 2. ATTRIBUTES
   *    - Generated using attribute generators from EBControls
   *    - Includes responsive variants (TAB*, MOB*)
   *    - Includes hover variants (hov_*)
   * 
   * 3. EDIT COMPONENT
   *    - Renders block in editor
   *    - Provides InspectorControls sidebar
   *    - Handles user interactions
   * 
   * 4. SAVE COMPONENT
   *    - Generates static HTML
   *    - Multiple deprecated versions for backward compatibility
   * 
   * 5. STYLE FUNCTION
   *    - Generates CSS for block
   *    - Uses style generators from EBControls
   *    - Returns desktop, tablet, mobile styles
   * 
   * 6. BLOCK REGISTRATION
   *    - Registers block with WordPress
   *    - Defines category, icon, supports
   */

  /* ==========================================================================
   * WEBPACK RUNTIME
   * ========================================================================== */

  var installedModules = {};

  function __webpack_require__(moduleId) {
    var cachedModule = installedModules[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = installedModules[moduleId] = { exports: {} };
    modules[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }

  // Webpack chunk loading runtime...

})();

/**
 * =============================================================================
 * END OF DOCUMENTED FILE
 * =============================================================================
 * 
 * Essential Blocks Editor - Block Types Reference:
 * 
 * Content Blocks:
 * ---------------
 * - Accordion: Collapsible content sections
 * - Advanced Heading: Enhanced heading with typography
 * - Advanced Tabs: Tabbed content panels
 * - Call To Action: CTA sections with button
 * - Feature List: Icon + text feature items
 * - Infobox: Icon/image with title and description
 * - Notice: Alert/notification boxes
 * - Pricing Table: Product/service pricing
 * - Team Member: Staff profiles
 * - Testimonial: Customer reviews
 * - Timeline: Chronological content
 * 
 * Media Blocks:
 * -------------
 * - Advanced Image: Enhanced image with effects
 * - Advanced Video: Video with custom poster
 * - Image Comparison: Before/after slider
 * - Image Gallery: Grid/masonry gallery
 * - Instagram Feed: Social media feed
 * - NFT Gallery: NFT collection display
 * - Openverse: Creative Commons images
 * 
 * Interactive Blocks:
 * -------------------
 * - Button: Single CTA button
 * - Dual Button: Two buttons side by side
 * - Countdown: Timer countdown
 * - Counter: Animated number counter
 * - Flipbox: Flip animation cards
 * - Interactive Promo: Hover effect promos
 * - Popup: Modal/popup content
 * - Progress Bar: Animated progress
 * - Slider: Content carousel
 * - Typing Text: Typewriter effect
 * 
 * Post Blocks:
 * ------------
 * - Post Grid: Posts in grid layout
 * - Post Carousel: Posts in slider
 * - Table of Contents: Auto-generated TOC
 * 
 * Layout Blocks:
 * --------------
 * - Row: Flexbox row container
 * - Wrapper: Section container
 * - Shape Divider: SVG dividers
 * 
 * Form Blocks:
 * ------------
 * - Form: Contact/subscription forms
 * 
 * Utility Blocks:
 * ---------------
 * - Google Maps: Embedded maps
 * - Icon: Standalone icon
 * - Social: Social media links
 * - Social Share: Share buttons
 * 
 * WooCommerce Blocks:
 * -------------------
 * - Product Grid: WooCommerce products
 * - Add to Cart: Purchase button
 * - Product Price: Price display
 * 
 * Common Control Prefixes:
 * ------------------------
 * - wrp* - Wrapper controls
 * - column* - Column controls
 * - thumbnail* - Thumbnail/image controls
 * - title* - Title controls
 * - content* - Content controls
 * - readmore* - Read more button controls
 * - *Meta* - Meta information controls
 * - arrow* - Carousel arrow controls
 * - dots* - Carousel dots controls
 * - slide* - Carousel slide controls
 * 
 * Responsive Prefixes:
 * --------------------
 * - (none) - Desktop value
 * - TAB* - Tablet value
 * - MOB* - Mobile value
 * 
 * State Prefixes:
 * ---------------
 * - (none) - Normal state
 * - hov_* - Hover state
 * - active* - Active state
 */
