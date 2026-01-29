/**
 * @fileoverview Essential Blocks Frontend Controls
 * 
 * @description
 * This module provides frontend utility functions for the Essential Blocks
 * WordPress Gutenberg plugin. It handles icon rendering, SVG loading,
 * sanitization functions, and DOM manipulation utilities.
 * 
 * This file is loaded on the frontend of the WordPress site to provide
 * runtime functionality for Essential Blocks.
 * 
 * @module essential-blocks/frontend-controls
 * @version De-minified documentation version
 * 
 * @requires regeneratorRuntime - For async/await support
 * 
 * @author Essential Blocks Team (WPDeveloper)
 * @see https://essential-blocks.com/
 * 
 * Exported Functions:
 * ===================
 * 
 * Icon Utilities:
 * - isSvgIconValue(value) - Check if value is an SVG URL
 * - isInlineSvgMarkup(value) - Check if value contains inline SVG
 * - fetchSvgAsHTML(url) - Fetch SVG file and return as HTML
 * - loadSvgIcons(container) - Load all SVG icons in a container
 * - EBGetIconType(icon) - Determine icon type (fontawesome/dashicon)
 * - EBGetIconClass(icon) - Get proper CSS class for icon
 * - EBRenderIcon(type, className, iconClass) - Render icon HTML
 * - EBRenderIconWithSVG(icon, className) - Render icon with SVG support
 * - generateArrowHTML(icon, direction) - Generate slider arrow HTML
 * 
 * Sanitization Functions:
 * - sanitize(value, type) - Generic sanitization dispatcher
 * - sanitizeURL(url) - Sanitize and validate URLs
 * - sanitizeAttribute(value) - Sanitize HTML attribute values
 * - sanitizeText(value) - Sanitize plain text (strip HTML)
 * - sanitizeHTML(html) - Sanitize HTML content
 * - sanitizeCSS(css) - Sanitize CSS values
 * - sanitizeTarget(target) - Sanitize link target attribute
 * - sanitizeFormInput(value, type) - Sanitize form input values
 * - sanitizeObject(obj, types) - Sanitize object properties
 * - sanitizeIconValue(value) - Sanitize icon class names
 * 
 * DOM Utilities:
 * - getDataAttribute(element, name, type) - Get sanitized data attribute
 * - setDataAttribute(element, name, value) - Set sanitized data attribute
 * - SetEqualHeightOfMultiColumnBlock(container) - Equalize column heights
 * 
 * Security:
 * - logSecurityWarning(message, data) - Log security warnings
 */

(() => {
  "use strict";

  /**
   * Webpack chunk loading variable
   * @type {undefined}
   */
  var chunkLoadingGlobal;

  /**
   * Webpack module definitions
   * @type {Object}
   */
  var modules = {

    /* ========================================================================
     * MODULE 15165: Frontend Controls Main Module
     * ========================================================================
     * Contains all frontend utility functions for Essential Blocks
     */
    15165(module, exports, require) {

      require.r(exports);
      require.d(exports, {
        EBGetIconClass: () => getIconClass,
        EBGetIconType: () => getIconType,
        EBRenderIcon: () => renderIcon,
        EBRenderIconWithSVG: () => renderIconWithSVG,
        SetEqualHeightOfMultiColumnBlock: () => setEqualColumnHeights,
        fetchSvgAsHTML: () => fetchSvgAsHTML,
        generateArrowHTML: () => generateArrowHTML,
        getDataAttribute: () => getDataAttribute,
        isInlineSvgMarkup: () => isInlineSvgMarkup,
        isSvgIconValue: () => isSvgIconValue,
        loadSvgIcons: () => loadSvgIcons,
        logSecurityWarning: () => logSecurityWarning,
        sanitize: () => sanitize,
        sanitizeAttribute: () => sanitizeAttribute,
        sanitizeCSS: () => sanitizeCSS,
        sanitizeFormInput: () => sanitizeFormInput,
        sanitizeHTML: () => sanitizeHTML,
        sanitizeIconValue: () => sanitizeIconValue,
        sanitizeObject: () => sanitizeObject,
        sanitizeTarget: () => sanitizeTarget,
        sanitizeText: () => sanitizeText,
        sanitizeURL: () => sanitizeURL,
        setDataAttribute: () => setDataAttribute
      });

      var asyncHelper = require(88727);
      const regeneratorRuntime = window.regeneratorRuntime;
      var regenerator = require.n(regeneratorRuntime);

      /**
       * Creates an iterator from an iterable or array-like object.
       * Used for async iteration over collections.
       * 
       * @param {Iterable|ArrayLike} iterable - The collection to iterate
       * @param {boolean} [allowArrayLike] - Whether to allow array-like objects
       * @returns {Object} Iterator object with s(), n(), e(), f() methods
       * @private
       */
      function createIterator(iterable, allowArrayLike) {
        var iterator = typeof Symbol !== "undefined" && iterable[Symbol.iterator] || iterable["@@iterator"];
        
        if (!iterator) {
          if (Array.isArray(iterable) || (iterator = toArray(iterable)) || allowArrayLike && iterable && typeof iterable.length === "number") {
            if (iterator) iterable = iterator;
            var index = 0;
            var noop = function() {};
            return {
              s: noop,
              n: function() {
                return index >= iterable.length 
                  ? { done: true } 
                  : { done: false, value: iterable[index++] };
              },
              e: function(err) { throw err; },
              f: noop
            };
          }
          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }
        
        var normalCompletion = true;
        var didErr = false;
        var err;
        
        return {
          s: function() { iterator = iterator.call(iterable); },
          n: function() {
            var step = iterator.next();
            normalCompletion = step.done;
            return step;
          },
          e: function(e) { didErr = true; err = e; },
          f: function() {
            try {
              if (!normalCompletion && iterator.return != null) iterator.return();
            } finally {
              if (didErr) throw err;
            }
          }
        };
      }

      /**
       * Converts an iterable to an array.
       * 
       * @param {any} iterable - Value to convert
       * @param {number} [length] - Max length
       * @returns {Array|undefined} Array or undefined if not convertible
       * @private
       */
      function toArray(iterable, length) {
        if (iterable) {
          if (typeof iterable === "string") return arrayFrom(iterable, length);
          var type = {}.toString.call(iterable).slice(8, -1);
          if (type === "Object" && iterable.constructor) type = iterable.constructor.name;
          if (type === "Map" || type === "Set") return Array.from(iterable);
          if (type === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(type)) {
            return arrayFrom(iterable, length);
          }
        }
        return undefined;
      }

      /**
       * Creates an array from an iterable with optional length limit.
       * 
       * @param {any} iterable - Source iterable
       * @param {number} [length] - Max length
       * @returns {Array} New array
       * @private
       */
      function arrayFrom(iterable, length) {
        if (length == null || length > iterable.length) length = iterable.length;
        var arr = new Array(length);
        for (var i = 0; i < length; i++) arr[i] = iterable[i];
        return arr;
      }

      /* ======================================================================
       * SVG ICON UTILITIES
       * ====================================================================== */

      /**
       * Checks if a value is a URL pointing to an SVG file.
       * 
       * @param {any} value - Value to check
       * @returns {boolean} True if value is an SVG URL
       * @example
       * isSvgIconValue('/icons/arrow.svg');        // true
       * isSvgIconValue('/icons/arrow.svg?v=1.0');  // true
       * isSvgIconValue('/icons/arrow.png');        // false
       * isSvgIconValue('<svg>...</svg>');          // false
       */
      var isSvgIconValue = function(value) {
        if (!value || typeof value !== "string") return false;
        try {
          return /\.svg(\?|#|$)/i.test(value);
        } catch (err) {
          return false;
        }
      };

      /**
       * Checks if a value contains inline SVG markup.
       * 
       * @param {any} value - Value to check
       * @returns {boolean} True if value contains inline SVG
       * @example
       * isInlineSvgMarkup('<svg viewBox="0 0 24 24">...</svg>'); // true
       * isInlineSvgMarkup('fa-icon');                            // false
       */
      var isInlineSvgMarkup = function(value) {
        return typeof value === "string" && /<svg[\s\S]*<\/svg>/i.test(value);
      };

      /**
       * Fetches an SVG file from a URL and returns it as sanitized HTML.
       * Uses the global sanitizeHTML function if available for security.
       * 
       * @async
       * @param {string} url - URL of the SVG file to fetch
       * @returns {Promise<string>} Sanitized SVG HTML or empty string on error
       * @example
       * const svgHtml = await fetchSvgAsHTML('/icons/arrow.svg');
       * element.innerHTML = svgHtml;
       */
      var fetchSvgAsHTML = (function() {
        var asyncFn = (0, asyncHelper.A)(regenerator().mark(function fetchGenerator(url) {
          var response, text, svgMatch, svgContent;
          
          return regenerator().wrap(function(context) {
            for (;;) switch (context.prev = context.next) {
              case 0:
                if (isSvgIconValue(url)) {
                  context.next = 1;
                  break;
                }
                return context.abrupt("return", "");
                
              case 1:
                context.prev = 1;
                context.next = 2;
                return fetch(url, { credentials: "omit" });
                
              case 2:
                response = context.sent;
                if (response.ok) {
                  context.next = 3;
                  break;
                }
                return context.abrupt("return", "");
                
              case 3:
                context.next = 4;
                return response.text();
                
              case 4:
                text = context.sent;
                svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
                svgContent = svgMatch ? svgMatch[0] : text;
                
                if (typeof window === "undefined" || 
                    !window.eb_frontend || 
                    !window.eb_frontend.sanitizeHTML) {
                  context.next = 5;
                  break;
                }
                return context.abrupt("return", window.eb_frontend.sanitizeHTML(svgContent));
                
              case 5:
                return context.abrupt("return", svgContent);
                
              case 6:
                context.prev = 6;
                context.catch(1);
                return context.abrupt("return", "");
                
              case 7:
              case "end":
                return context.stop();
            }
          }, fetchGenerator, null, [[1, 6]]);
        }));
        
        return function(url) {
          return asyncFn.apply(this, arguments);
        };
      })();

      /**
       * Loads all SVG icons within a container element.
       * Finds elements with .eb-svg-icon[data-svg-url] and fetches their SVGs.
       * 
       * @async
       * @param {HTMLElement} container - Container element to search within
       * @returns {Promise<void>}
       * @example
       * await loadSvgIcons(document.querySelector('.eb-block'));
       */
      var loadSvgIcons = (function() {
        var asyncFn = (0, asyncHelper.A)(regenerator().mark(function loadGenerator(container) {
          var svgElements, iterator, step, element, svgUrl, svgHtml;
          
          return regenerator().wrap(function(context) {
            for (;;) switch (context.prev = context.next) {
              case 0:
                svgElements = container.querySelectorAll(".eb-svg-icon[data-svg-url]");
                iterator = createIterator(svgElements);
                context.prev = 1;
                iterator.s();
                
              case 2:
                if ((step = iterator.n()).done) {
                  context.next = 7;
                  break;
                }
                element = step.value;
                svgUrl = element.getAttribute("data-svg-url");
                
                if (!svgUrl) {
                  context.next = 6;
                  break;
                }
                
                context.prev = 3;
                context.next = 4;
                return fetchSvgAsHTML(svgUrl);
                
              case 4:
                svgHtml = context.sent;
                if (svgHtml) {
                  element.innerHTML = svgHtml;
                  element.removeAttribute("data-svg-url");
                }
                context.next = 6;
                break;
                
              case 5:
                context.prev = 5;
                var err = context.catch(3);
                console.warn("Failed to load SVG icon:", svgUrl, err);
                
              case 6:
                context.next = 2;
                break;
                
              case 7:
                context.next = 9;
                break;
                
              case 8:
                context.prev = 8;
                var iterErr = context.catch(1);
                iterator.e(iterErr);
                
              case 9:
                context.prev = 9;
                iterator.f();
                return context.finish(9);
                
              case 10:
              case "end":
                return context.stop();
            }
          }, loadGenerator, null, [[1, 8, 9, 10], [3, 5]]);
        }));
        
        return function(container) {
          return asyncFn.apply(this, arguments);
        };
      })();

      /**
       * Determines the icon type based on the icon class name.
       * 
       * @param {string} iconClass - Icon class name
       * @returns {'fontawesome'|'dashicon'} Icon type
       * @example
       * getIconType('fa-arrow-right');      // 'fontawesome'
       * getIconType('dashicons-admin-home'); // 'dashicon'
       */
      var getIconType = function(iconClass) {
        return iconClass.includes("fa-") ? "fontawesome" : "dashicon";
      };

      /**
       * Renders an icon element as HTML string.
       * 
       * @param {'fontawesome'|'dashicon'} type - Icon type
       * @param {string} className - Additional CSS classes
       * @param {string} iconClass - The icon class name
       * @returns {string} HTML string for the icon element
       * @example
       * renderIcon('fontawesome', 'my-icon', 'fas fa-home');
       * // Returns: '<i class="fas fa-home my-icon"></i>'
       * 
       * renderIcon('dashicon', 'my-icon', 'dashicons-admin-home');
       * // Returns: '<span class="dashicon dashicons dashicons-admin-home my-icon"></span>'
       */
      var renderIcon = function(type, className, iconClass) {
        if (type === "dashicon") {
          return '<span class="dashicon dashicons ' + iconClass + " " + className + '"></span>';
        }
        if (type === "fontawesome") {
          return '<i class="' + iconClass + " " + className + '"></i>';
        }
        return "Invalid icon type";
      };

      /**
       * Gets the full CSS class string for an icon.
       * Adds 'dashicon dashicons' prefix for WordPress dashicons.
       * 
       * @param {string} iconValue - Icon class name
       * @returns {string} Full CSS class string
       * @example
       * getIconClass('admin-home');           // 'dashicon dashicons admin-home'
       * getIconClass('fa-arrow-right');       // 'fa-arrow-right'
       * getIconClass('dashicons-admin-home'); // 'dashicon dashicons dashicons-admin-home'
       */
      var getIconClass = function(iconValue) {
        if (!iconValue) return "";
        if (iconValue.includes("fa-")) {
          return iconValue;
        }
        return "dashicon dashicons " + iconValue;
      };

      /**
       * Renders an icon with full SVG support.
       * Handles inline SVG, SVG URLs, FontAwesome icons, and Dashicons.
       * 
       * @param {string} icon - Icon value (SVG markup, SVG URL, or icon class)
       * @param {string} [className=''] - Additional CSS classes
       * @returns {string} HTML string for the icon
       * @example
       * // Inline SVG
       * renderIconWithSVG('<svg>...</svg>', 'my-icon');
       * 
       * // SVG URL
       * renderIconWithSVG('/icons/arrow.svg', 'my-icon');
       * 
       * // FontAwesome
       * renderIconWithSVG('fas fa-home', 'my-icon');
       * 
       * // Dashicon
       * renderIconWithSVG('dashicons-admin-home', 'my-icon');
       */
      var renderIconWithSVG = function(icon) {
        var className = arguments.length > 1 && arguments[1] !== void 0 
          ? arguments[1] 
          : "";
        
        if (!icon) return "";
        
        var sanitizeHtml = typeof window !== "undefined" && 
          window.eb_frontend && 
          window.eb_frontend.sanitizeHTML 
            ? window.eb_frontend.sanitizeHTML 
            : function(val) { return val; };
        
        var sanitizeIcon = typeof window !== "undefined" && 
          window.eb_frontend && 
          window.eb_frontend.sanitizeIconValue 
            ? window.eb_frontend.sanitizeIconValue 
            : function(val) { 
                return val && typeof val === "string" 
                  ? val.replace(/[<>'"]/g, "") 
                  : ""; 
              };
        
        if (isInlineSvgMarkup(icon)) {
          return '<span class="' + className + '">' + sanitizeHtml(icon) + "</span>";
        }
        
        if (isSvgIconValue(icon)) {
          return '<span class="eb-svg-icon ' + className + '" data-svg-url="' + icon + '"></span>';
        }
        
        var type = getIconType(icon);
        var sanitizedIcon = sanitizeIcon(icon);
        var sanitizedClass = className.replace(/[<>'"]/g, "");
        
        return renderIcon(type, sanitizedClass, sanitizedIcon);
      };

      /**
       * Generates HTML for slider navigation arrows.
       * Used for Slick slider integration.
       * 
       * @param {string} icon - Icon value (SVG, URL, or class)
       * @param {string} direction - Arrow direction ('prev' or 'next')
       * @returns {string} HTML string for the arrow element
       * @example
       * generateArrowHTML('fas fa-chevron-left', 'prev');
       * // Returns: '<div class="slick-prev"><i class="fas fa-chevron-left"></i></div>'
       */
      var generateArrowHTML = function(icon, direction) {
        var sanitizeHtml = typeof window !== "undefined" && 
          window.eb_frontend && 
          window.eb_frontend.sanitizeHTML 
            ? window.eb_frontend.sanitizeHTML 
            : function(val) { return val; };
        
        var sanitizeIcon = typeof window !== "undefined" && 
          window.eb_frontend && 
          window.eb_frontend.sanitizeIconValue 
            ? window.eb_frontend.sanitizeIconValue 
            : function(val) { 
                return val && typeof val === "string" 
                  ? val.replace(/[<>'"]/g, "") 
                  : ""; 
              };
        
        if (isInlineSvgMarkup(icon)) {
          return '<div class="slick-' + direction + '"><span>' + sanitizeHtml(icon) + "</span></div>";
        }
        
        if (isSvgIconValue(icon)) {
          return '<div class="slick-' + direction + '"><span class="eb-svg-icon" data-svg-url="' + icon + '"></span></div>';
        }
        
        var type = getIconType(icon);
        var sanitizedIcon = sanitizeIcon(icon);
        var sanitizedDirection = direction.replace(/[<>'"]/g, "");
        
        return '<div class="slick-' + sanitizedDirection + '">' + renderIcon(type, "", sanitizedIcon) + "</div>";
      };

      /* ======================================================================
       * SANITIZATION FUNCTIONS
       * ====================================================================== */

      var arrayDestructure = require(50809);
      var typeofHelper = require(69624);

      /**
       * Generic sanitization function that dispatches to specific sanitizers.
       * 
       * @param {any} value - Value to sanitize
       * @param {'text'|'url'|'attribute'|'html'} [type='text'] - Sanitization type
       * @returns {string|null} Sanitized value or null for invalid URLs
       * @example
       * sanitize('<script>alert("xss")</script>', 'text');    // ''
       * sanitize('https://example.com', 'url');               // 'https://example.com'
       * sanitize('onclick="alert(1)"', 'attribute');          // 'alert(1)'
       */
      var sanitize = function(value) {
        var type = arguments.length > 1 && arguments[1] !== void 0 
          ? arguments[1] 
          : "text";
        
        if (value == null) return null;
        
        var stringValue = String(value).trim();
        if (!stringValue) return type === "url" ? null : "";
        
        switch (type) {
          case "url":
            return sanitizeURL(stringValue);
          case "attribute":
            return sanitizeAttribute(stringValue);
          case "html":
            return sanitizeHTML(stringValue);
          default:
            return sanitizeText(stringValue);
        }
      };

      /**
       * Sanitizes a URL by removing dangerous protocols and validating the scheme.
       * 
       * Allowed protocols:
       * - http, https, ftp, ftps
       * - mailto, news, irc, irc6, ircs
       * - gopher, nntp, feed, telnet
       * - mms, rtsp, sms, svn
       * - tel, fax, xmpp, webcal, urn
       * 
       * @param {string} url - URL to sanitize
       * @returns {string|null} Sanitized URL or null if invalid/dangerous
       * @example
       * sanitizeURL('https://example.com');           // 'https://example.com'
       * sanitizeURL('javascript:alert(1)');           // null
       * sanitizeURL('/relative/path');                // '/relative/path'
       * sanitizeURL('#anchor');                       // '#anchor'
       */
      var sanitizeURL = function(url) {
        if (!url || typeof url !== "string") return null;
        
        var cleaned = url
          .replace(/javascript:/gi, "")
          .replace(/data:/gi, "")
          .replace(/vbscript:/gi, "")
          .replace(/on\w+=/gi, "")
          .replace(/<script/gi, "")
          .replace(/<\/script>/gi, "");
        
        if (cleaned.startsWith("/") || cleaned.startsWith("#")) {
          return cleaned;
        }
        
        try {
          var parsedUrl = new URL(cleaned);
          var allowedProtocols = [
            "http:", "https:", "ftp:", "ftps:", "mailto:", "news:",
            "irc:", "irc6:", "ircs:", "gopher:", "nntp:", "feed:",
            "telnet:", "mms:", "rtsp:", "sms:", "svn:", "tel:",
            "fax:", "xmpp:", "webcal:", "urn:"
          ];
          
          if (allowedProtocols.includes(parsedUrl.protocol)) {
            return parsedUrl.toString();
          }
          return null;
        } catch (err) {
          return null;
        }
      };

      /**
       * Sanitizes a value for use as an HTML attribute.
       * Removes dangerous characters and protocols.
       * 
       * @param {string} value - Value to sanitize
       * @returns {string} Sanitized attribute value
       * @example
       * sanitizeAttribute('onclick="alert(1)"');  // 'alert(1)'
       * sanitizeAttribute('<script>xss</script>'); // 'scriptxssscript'
       */
      var sanitizeAttribute = function(value) {
        if (!value || typeof value !== "string") return "";
        
        return value
          .replace(/[<>'"]/g, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+=/gi, "")
          .replace(/data:/gi, "")
          .replace(/vbscript:/gi, "")
          .trim();
      };

      /**
       * Sanitizes plain text by removing all HTML tags and dangerous content.
       * 
       * @param {string} value - Text to sanitize
       * @returns {string} Plain text with HTML removed
       * @example
       * sanitizeText('<b>Bold</b> text');           // 'Bold text'
       * sanitizeText('<script>xss</script>Hello');  // 'Hello'
       */
      var sanitizeText = function(value) {
        if (!value || typeof value !== "string") return "";
        
        return value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<[^>]*>/g, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+=/gi, "")
          .trim();
      };

      /**
       * Sanitizes HTML content by removing dangerous elements and attributes.
       * Removes script, iframe, object, embed tags and event handlers.
       * 
       * @param {string} html - HTML to sanitize
       * @returns {string} Sanitized HTML
       * @example
       * sanitizeHTML('<p onclick="alert(1)">Text</p>');
       * // Returns: '<p>Text</p>'
       * 
       * sanitizeHTML('<script>xss</script><p>Safe</p>');
       * // Returns: '<p>Safe</p>'
       */
      var sanitizeHTML = function(html) {
        if (!html || typeof html !== "string") return "";
        
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
          .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
          .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/vbscript:/gi, "")
          .trim();
      };

      /**
       * Sanitizes a link target attribute value.
       * Only allows valid target values: _self, _blank, _parent, _top.
       * 
       * @param {string} target - Target attribute value
       * @returns {'_self'|'_blank'|'_parent'|'_top'} Valid target value
       * @example
       * sanitizeTarget('_blank');              // '_blank'
       * sanitizeTarget('javascript:alert(1)'); // '_self'
       * sanitizeTarget('invalid');             // '_self'
       */
      var sanitizeTarget = function(target) {
        if (!target || typeof target !== "string") return "_self";
        
        var cleaned = sanitizeAttribute(target);
        var validTargets = ["_self", "_blank", "_parent", "_top"];
        
        return validTargets.includes(cleaned) ? cleaned : "_self";
      };

      /**
       * Gets a sanitized data attribute value from an element.
       * 
       * @param {HTMLElement} element - DOM element
       * @param {string} name - Data attribute name (without 'data-' prefix)
       * @param {'text'|'url'|'attribute'|'html'} [type='attribute'] - Sanitization type
       * @returns {string|null} Sanitized attribute value
       * @example
       * // <div data-url="https://example.com">
       * getDataAttribute(element, 'url', 'url');
       * // Returns: 'https://example.com'
       */
      var getDataAttribute = function(element, name) {
        var type = arguments.length > 2 && arguments[2] !== void 0 
          ? arguments[2] 
          : "attribute";
        
        if (!element || !name) return null;
        
        var value = element.getAttribute("data-" + name);
        return sanitize(value, type);
      };

      /**
       * Sets a sanitized data attribute on an element.
       * 
       * @param {HTMLElement} element - DOM element
       * @param {string} name - Data attribute name (without 'data-' prefix)
       * @param {any} value - Value to set
       * @param {'text'|'url'|'attribute'|'html'} [type='attribute'] - Sanitization type
       * @example
       * setDataAttribute(element, 'url', 'https://example.com', 'url');
       */
      var setDataAttribute = function(element, name, value) {
        var type = arguments.length > 3 && arguments[3] !== void 0 
          ? arguments[3] 
          : "attribute";
        
        if (!element || !name) return;
        
        var sanitized = sanitize(value, type);
        if (sanitized !== null) {
          element.setAttribute("data-" + name, sanitized);
        }
      };

      /**
       * Sanitizes CSS values by removing dangerous patterns.
       * Removes javascript:, expression(), @import, behavior:, binding:.
       * 
       * @param {string} css - CSS value to sanitize
       * @returns {string} Sanitized CSS value
       * @example
       * sanitizeCSS('expression(alert(1))');           // ''
       * sanitizeCSS('background: url("image.jpg")');   // 'background: url("image.jpg")'
       */
      var sanitizeCSS = function(css) {
        if (!css || typeof css !== "string") return "";
        
        return css
          .replace(/javascript:/gi, "")
          .replace(/expression\s*\(/gi, "")
          .replace(/@import/gi, "")
          .replace(/behavior\s*:/gi, "")
          .replace(/binding\s*:/gi, "")
          .replace(/<[^>]*>/g, "")
          .trim();
      };

      /**
       * Logs a security warning to the console.
       * Used for debugging and security monitoring.
       * 
       * @param {string} message - Warning message
       * @param {any} [data=null] - Additional data to log
       * @example
       * logSecurityWarning('Invalid URL detected', { url: userInput });
       */
      var logSecurityWarning = function(message) {
        var data = arguments.length > 1 && arguments[1] !== void 0 
          ? arguments[1] 
          : null;
        console.warn("[Essential Blocks Security] " + message, data || "");
      };

      /**
       * Sanitizes form input values based on their type.
       * 
       * @param {string} value - Input value to sanitize
       * @param {'text'|'email'|'url'|'number'} [type='text'] - Input type
       * @returns {string|null} Sanitized value or null if invalid
       * @example
       * sanitizeFormInput('user@example.com', 'email');  // 'user@example.com'
       * sanitizeFormInput('invalid-email', 'email');     // null
       * sanitizeFormInput('123.45', 'number');           // '123.45'
       * sanitizeFormInput('abc', 'number');              // null
       */
      var sanitizeFormInput = function(value) {
        var type = arguments.length > 1 && arguments[1] !== void 0 
          ? arguments[1] 
          : "text";
        
        if (!value || typeof value !== "string") return null;
        
        var cleaned = sanitizeText(value);
        
        switch (type) {
          case "email":
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(cleaned) ? cleaned : null;
          case "url":
            return sanitizeURL(cleaned);
          case "number":
            var num = parseFloat(cleaned);
            return isNaN(num) ? null : num.toString();
          default:
            return cleaned;
        }
      };

      /**
       * Sanitizes all properties of an object based on a type mapping.
       * 
       * @param {Object} obj - Object to sanitize
       * @param {Object} [types={}] - Map of property names to sanitization types
       * @returns {Object} New object with sanitized values
       * @example
       * sanitizeObject(
       *   { name: '<b>John</b>', website: 'https://example.com' },
       *   { name: 'text', website: 'url' }
       * );
       * // Returns: { name: 'John', website: 'https://example.com' }
       */
      var sanitizeObject = function(obj) {
        var types = arguments.length > 1 && arguments[1] !== void 0 
          ? arguments[1] 
          : {};
        
        if (!obj || typeof (0, typeofHelper.A)(obj) !== "object") return {};
        
        var result = {};
        
        for (var i = 0, entries = Object.entries(obj); i < entries.length; i++) {
          var entry = (0, arrayDestructure.A)(entries[i], 2);
          var key = entry[0];
          var value = entry[1];
          var type = types[key] || "text";
          result[key] = sanitize(value, type);
        }
        
        return result;
      };

      /**
       * Validates and sanitizes icon class values.
       * Ensures icon classes match expected patterns for FontAwesome or Dashicons.
       * 
       * @param {string} value - Icon class to validate
       * @returns {string} Validated icon class or empty string if invalid
       * @example
       * sanitizeIconValue('fas fa-home');          // 'fas fa-home'
       * sanitizeIconValue('dashicons-admin-home'); // 'dashicons-admin-home'
       * sanitizeIconValue('<script>xss</script>'); // ''
       */
      var sanitizeIconValue = function(value) {
        if (!value) return "";
        
        if (value.includes("fa-")) {
          var faRegex = /^(fa[srb]?)\s+(fa-[a-z0-9-]+)(\s+fa-[a-z0-9-]+)*$/;
          return faRegex.test(value) ? value : "";
        }
        
        if (value.includes("dashicons-")) {
          var dashRegex = /^dashicons-[a-z0-9-]+$/;
          return dashRegex.test(value) ? value : "";
        }
        
        return "";
      };

      /* ======================================================================
       * DOM UTILITIES
       * ====================================================================== */

      /**
       * Sets equal height for cells in multi-column pricing table blocks.
       * Finds matching cells across columns and sets them to the same height.
       * 
       * @param {HTMLElement} container - The pricing table container element
       * @example
       * const pricingTable = document.querySelector('.eb-pricing-table');
       * setEqualColumnHeights(pricingTable);
       */
      var setEqualColumnHeights = function(container) {
        if (!container) return;
        
        var maxHeights = {};
        
        container.querySelectorAll(".eb-mcpt-feature-list").forEach(function(list) {
          list.querySelectorAll(".eb-mcpt-cell").forEach(function(cell, index) {
            var height = cell.offsetHeight;
            if (height !== 0) {
              if (maxHeights[index] === undefined || maxHeights[index] < height) {
                maxHeights[index] = height;
              }
            }
          });
        });
        
        if (Object.keys(maxHeights).length > 0) {
          container.querySelectorAll(".eb-mcpt-feature-list").forEach(function(list) {
            list.querySelectorAll(".eb-mcpt-cell").forEach(function(cell, index) {
              cell.style.height = maxHeights[index] + "px";
            });
          });
        }
      };
    }
  };

  /* ==========================================================================
   * WEBPACK RUNTIME
   * ========================================================================== */

  /**
   * Module cache
   * @type {Object}
   */
  var moduleCache = {};

  /**
   * Webpack require function
   * @param {number|string} moduleId - Module identifier
   * @returns {Object} Module exports
   */
  function __webpack_require__(moduleId) {
    var cachedModule = moduleCache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    
    var module = moduleCache[moduleId] = { exports: {} };
    modules[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }

  __webpack_require__.m = modules;

  chunkLoadingGlobal = [];
  __webpack_require__.O = (result, chunkIds, fn, priority) => {
    if (!chunkIds) {
      var notFulfilled = 1 / 0;
      for (var i = 0; i < chunkLoadingGlobal.length; i++) {
        var [chunkIds, fn, priority] = chunkLoadingGlobal[i];
        var fulfilled = true;
        for (var j = 0; j < chunkIds.length; j++) {
          if ((priority & 1 === 0 || notFulfilled >= priority) && 
              Object.keys(__webpack_require__.O).every(key => __webpack_require__.O[key](chunkIds[j]))) {
            chunkIds.splice(j--, 1);
          } else {
            fulfilled = false;
            if (priority < notFulfilled) notFulfilled = priority;
          }
        }
        if (fulfilled) {
          chunkLoadingGlobal.splice(i--, 1);
          var r = fn();
          if (r !== undefined) result = r;
        }
      }
      return result;
    }
    priority = priority || 0;
    for (var k = chunkLoadingGlobal.length; k > 0 && chunkLoadingGlobal[k - 1][2] > priority; k--) {
      chunkLoadingGlobal[k] = chunkLoadingGlobal[k - 1];
    }
    chunkLoadingGlobal[k] = [chunkIds, fn, priority];
  };

  __webpack_require__.n = module => {
    var getter = module && module.__esModule ? () => module.default : () => module;
    __webpack_require__.d(getter, { a: getter });
    return getter;
  };

  __webpack_require__.d = (exports, definition) => {
    for (var key in definition) {
      if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
        Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
      }
    }
  };

  __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  __webpack_require__.r = exports => {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    }
    Object.defineProperty(exports, "__esModule", { value: true });
  };

  __webpack_require__.j = 5211;

  (() => {
    var installedChunks = { 5211: 0 };
    
    __webpack_require__.O.j = chunkId => installedChunks[chunkId] === 0;
    
    var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
      var [chunkIds, moreModules, runtime] = data;
      var moduleId, chunkId, i = 0;
      
      if (chunkIds.some(id => installedChunks[id] !== 0)) {
        for (moduleId in moreModules) {
          if (__webpack_require__.o(moreModules, moduleId)) {
            __webpack_require__.m[moduleId] = moreModules[moduleId];
          }
        }
        if (runtime) var result = runtime(__webpack_require__);
      }
      
      if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
      
      while (i < chunkIds.length) {
        chunkId = chunkIds[i++];
        if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
          installedChunks[chunkId][0]();
        }
        installedChunks[chunkId] = 0;
      }
      
      return __webpack_require__.O(result);
    };
    
    var chunkLoadingGlobal = globalThis.webpackChunkessential_blocks = 
      globalThis.webpackChunkessential_blocks || [];
    chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
    chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
  })();

  var exports = __webpack_require__.O(undefined, [3935], () => __webpack_require__(15165));
  exports = __webpack_require__.O(exports);
  
  window.eb_frontend = exports;
})();

/**
 * =============================================================================
 * END OF DOCUMENTED FILE
 * =============================================================================
 * 
 * This file is exposed globally as `window.eb_frontend` and provides:
 * 
 * Icon Rendering:
 * - EBRenderIconWithSVG(icon, className) - Render any icon type
 * - EBRenderIcon(type, className, iconClass) - Render specific icon type
 * - EBGetIconClass(icon) - Get full CSS class for icon
 * - EBGetIconType(icon) - Determine icon framework
 * - loadSvgIcons(container) - Load SVG icons async
 * - fetchSvgAsHTML(url) - Fetch and sanitize SVG
 * - generateArrowHTML(icon, direction) - Create slider arrows
 * 
 * Sanitization (Security):
 * - sanitize(value, type) - General purpose sanitizer
 * - sanitizeURL(url) - Safe URL validation
 * - sanitizeHTML(html) - XSS prevention for HTML
 * - sanitizeText(text) - Strip all HTML
 * - sanitizeAttribute(value) - Safe attribute values
 * - sanitizeCSS(css) - Remove CSS exploits
 * - sanitizeFormInput(value, type) - Form validation
 * - sanitizeObject(obj, types) - Sanitize object properties
 * - sanitizeIconValue(value) - Validate icon classes
 * - sanitizeTarget(target) - Validate link targets
 * 
 * DOM Utilities:
 * - getDataAttribute(el, name, type) - Get sanitized data-* attr
 * - setDataAttribute(el, name, value, type) - Set sanitized data-* attr
 * - SetEqualHeightOfMultiColumnBlock(container) - Equalize heights
 * 
 * Helpers:
 * - isSvgIconValue(value) - Check if SVG URL
 * - isInlineSvgMarkup(value) - Check if inline SVG
 * - logSecurityWarning(msg, data) - Security logging
 */
