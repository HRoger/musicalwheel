/**
 * @fileoverview Essential Blocks Pro Admin/License Manager
 * 
 * @description
 * This module provides the license activation and management interface
 * for Essential Blocks Pro WordPress plugin. It handles license key
 * validation, activation, deactivation, and status display.
 * 
 * @module essential-blocks-pro/admin
 * @version De-minified documentation version
 * 
 * @requires React - For UI components
 * @requires wp.i18n - WordPress internationalization
 * @requires wp.hooks - WordPress hooks system
 * @requires wp.apiFetch - WordPress REST API utility
 * 
 * @author WPDeveloper
 * @see https://essential-blocks.com/
 * 
 * Components:
 * ===========
 * - LicenseHeader - Header with icon and description
 * - LicenseInstructions - Step-by-step activation guide
 * - LicenseForm - License key input and activation/deactivation
 * - LicenseStatus - Current license status display
 * 
 * Classes:
 * ========
 * - ApiClient - REST API wrapper for license operations
 */

(() => {
  "use strict";

  var chunkCache;
  var modules = {

    /* ========================================================================
     * MODULE 923: License Manager Main Module
     * ========================================================================
     */
    923: (module, exports, require) => {

      var defineProperty = require(4467);
      var React = require(1609);
      var ReactDefault = require.n(React);

      const wpI18n = window.wp.i18n;
      const wpHooks = window.wp.hooks;

      var createClass = require(2901);
      var classCallCheck = require(3029);
      var objectWithoutProperties = require(45);
      var asyncToGenerator = require(467);

      const wpApiFetch = window.wp.apiFetch;
      var apiFetch = require.n(wpApiFetch);

      var EXCLUDED_PROPS = ["endpoint"];

      /**
       * Regenerator runtime for async/await support.
       * Provides generator function handling.
       * @private
       */
      function regeneratorRuntime() {
        var undefined;
        var completed;
        var Symbol = typeof Symbol === "function" ? Symbol : {};
        var iteratorSymbol = Symbol.iterator || "@@iterator";
        var toStringTagSymbol = Symbol.toStringTag || "@@toStringTag";

        function wrap(innerFn, outerFn, self, tryLocsList) {
          var protoGenerator = outerFn && outerFn.prototype instanceof Generator 
            ? outerFn 
            : Generator;
          var generator = Object.create(protoGenerator.prototype);
          
          defineHiddenProperty(generator, "_invoke", makeInvokeMethod(
            innerFn, self, tryLocsList || []
          ));
          
          return generator;
        }

        var GENERATOR_STATE_SUSPENDED_START = 0;
        var GENERATOR_STATE_EXECUTING = 2;
        var GENERATOR_STATE_COMPLETED = 1;
        
        var ContinueSentinel = {};

        function Generator() {}
        function GeneratorFunction() {}
        function GeneratorFunctionPrototype() {}

        var IteratorPrototype = [][iteratorSymbol] 
          ? Object.getPrototypeOf(Object.getPrototypeOf([][iteratorSymbol]())) 
          : {};
        
        var GeneratorPrototype = GeneratorFunctionPrototype.prototype = 
          Generator.prototype = Object.create(IteratorPrototype);

        function defineGeneratorMethod(name) {
          return Object.setPrototypeOf 
            ? Object.setPrototypeOf(name, GeneratorFunctionPrototype)
            : (name.__proto__ = GeneratorFunctionPrototype, 
               defineHiddenProperty(name, toStringTagSymbol, "GeneratorFunction"));
        }

        GeneratorFunction.prototype = GeneratorFunctionPrototype;
        defineHiddenProperty(GeneratorPrototype, "constructor", GeneratorFunctionPrototype);
        defineHiddenProperty(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
        GeneratorFunction.displayName = "GeneratorFunction";
        defineHiddenProperty(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction");
        defineHiddenProperty(GeneratorPrototype);
        defineHiddenProperty(GeneratorPrototype, toStringTagSymbol, "Generator");
        defineHiddenProperty(GeneratorPrototype, iteratorSymbol, function() { return this; });
        defineHiddenProperty(GeneratorPrototype, "toString", function() { 
          return "[object Generator]"; 
        });

        return (regeneratorRuntime = function() {
          return { w: wrap, m: defineGeneratorMethod };
        })();
      }

      /**
       * Defines a hidden (non-enumerable) property on an object.
       * @param {Object} obj - Target object
       * @param {string} key - Property name
       * @param {any} value - Property value
       * @param {boolean} [nonWritable] - If true, property is not writable
       * @private
       */
      function defineHiddenProperty(obj, key, value, nonWritable) {
        var defineProperty = Object.defineProperty;
        try { 
          defineProperty({}, "", {}); 
        } catch (e) { 
          defineProperty = null; 
        }
        
        if (key && defineProperty) {
          defineProperty(obj, key, {
            value: value,
            enumerable: !nonWritable,
            configurable: !nonWritable,
            writable: !nonWritable
          });
        } else if (key) {
          obj[key] = value;
        }
      }

      /**
       * Helper to merge object properties.
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
      function objectSpread(target) {
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
       * API Client for license management operations.
       * Provides methods for making REST API requests to the license server.
       * 
       * @class ApiClient
       * @example
       * const api = new ApiClient();
       * const result = await api.post('activate', { license_key: 'xxx' });
       */
      const ApiClient = (0, createClass.A)(function ApiClient() {
        var config;
        var self = this;
        
        (0, classCallCheck.A)(this, ApiClient);

        /**
         * Makes a POST request to the API.
         * 
         * @async
         * @param {string} endpoint - API endpoint path
         * @param {Object} [options={}] - Request options
         * @returns {Promise<Object>} API response
         * @example
         * await api.post('activate', { data: { license_key: 'xxx' } });
         */
        (0, defineProperty.A)(this, "post", function() {
          var asyncFn = (0, asyncToGenerator.A)(regeneratorRuntime().m(
            function* postGenerator(endpoint) {
              var options = arguments.length > 1 && arguments[1] !== void 0 
                ? arguments[1] 
                : {};
              return self.request(objectSpread({ 
                endpoint: endpoint, 
                method: "POST" 
              }, options));
            }
          ));
          return function(endpoint) {
            return asyncFn.apply(this, arguments);
          };
        }());

        /**
         * Makes a DELETE request to the API.
         * 
         * @async
         * @param {string} endpoint - API endpoint path
         * @param {Object} [options={}] - Request options
         * @returns {Promise<Object>} API response
         */
        (0, defineProperty.A)(this, "delete", function() {
          var asyncFn = (0, asyncToGenerator.A)(regeneratorRuntime().m(
            function* deleteGenerator(endpoint) {
              var options = arguments.length > 1 && arguments[1] !== void 0 
                ? arguments[1] 
                : {};
              return self.request(objectSpread({ 
                endpoint: endpoint, 
                method: "DELETE" 
              }, options));
            }
          ));
          return function(endpoint) {
            return asyncFn.apply(this, arguments);
          };
        }());

        /**
         * Makes a GET request to the API.
         * 
         * @async
         * @param {string} endpoint - API endpoint path
         * @param {Object} [options={}] - Request options
         * @returns {Promise<Object>} API response
         */
        (0, defineProperty.A)(this, "get", function() {
          var asyncFn = (0, asyncToGenerator.A)(regeneratorRuntime().m(
            function* getGenerator(endpoint) {
              var options = arguments.length > 1 && arguments[1] !== void 0 
                ? arguments[1] 
                : {};
              return self.request(objectSpread({ 
                endpoint: endpoint, 
                method: "GET" 
              }, options));
            }
          ));
          return function(endpoint) {
            return asyncFn.apply(this, arguments);
          };
        }());

        /**
         * Constructs the full API path for an endpoint.
         * Handles both REST API and AJAX API types.
         * 
         * @param {string} endpoint - Endpoint path
         * @returns {string} Full API URL
         */
        (0, defineProperty.A)(this, "getPath", function(endpoint) {
          if (self.config.apiType === "ajax") {
            return `${self.config?.api_url}?action=${self.config?.action}/${endpoint}`;
          }
          return `${self.config?.api_url}${endpoint}`;
        });

        /**
         * Makes a request to the API.
         * Handles both REST API and AJAX request formats.
         * 
         * @async
         * @param {Object} options - Request options
         * @param {string} options.endpoint - API endpoint
         * @param {string} options.method - HTTP method
         * @param {Object} [options.data] - Request data
         * @returns {Promise<Object>} API response
         */
        (0, defineProperty.A)(this, "request", function() {
          var asyncFn = (0, asyncToGenerator.A)(regeneratorRuntime().m(
            function* requestGenerator(options) {
              var endpoint = options.endpoint;
              var requestOptions = (0, objectWithoutProperties.A)(options, EXCLUDED_PROPS);
              
              requestOptions.url = self.getPath(endpoint, requestOptions?.method);
              
              if (self.config.apiType === "ajax" && requestOptions?.method !== "GET") {
                var formData = new FormData();
                var data = requestOptions?.data != null 
                  ? objectSpread({}, requestOptions.data) 
                  : {};
                
                data = objectSpread(objectSpread({}, data), {
                  action: `${self.config?.action}/${endpoint}`,
                  _nonce: self.config?.nonce
                });
                
                requestOptions.headers = {};
                
                for (var key in data) {
                  formData.append(key, data[key]);
                }
                
                requestOptions.body = formData;
                delete requestOptions.data;
              }
              
              return apiFetch()(requestOptions).catch(function(error) {
                return error;
              });
            }
          ));
          return function(options) {
            return asyncFn.apply(this, arguments);
          };
        }());

        /**
         * Creates a URLSearchParams object from a query string.
         * 
         * @param {string} queryString - URL query string
         * @returns {URLSearchParams} Parsed query parameters
         */
        (0, defineProperty.A)(this, "useQuery", function(queryString) {
          return new URLSearchParams(queryString);
        });

        /**
         * Gets a URL parameter value.
         * 
         * @param {string} param - Parameter name
         * @param {any} [defaultValue=null] - Default value if not found
         * @returns {string|null} Parameter value or default
         */
        (0, defineProperty.A)(this, "getParam", function(param) {
          var defaultValue = arguments.length > 1 && arguments[1] !== void 0 
            ? arguments[1] 
            : null;
          return self.useQuery(location?.search).get(param) || defaultValue;
        });

        this.config = (config = window) === null || config === void 0 
          ? void 0 
          : config.wpdeveloperLicenseManagerConfig;
      });

      var arrayDestructure = require(3453);
      var HEADER_EXCLUDED_PROPS = ["className", "title", "description"];

      /**
       * License Header Component.
       * Displays the header with lock icon, title, and description.
       * 
       * @component
       * @param {Object} props - Component props
       * @param {string} [props.className=''] - Additional CSS classes
       * @param {string} props.title - Header title
       * @param {string} props.description - Header description
       * @returns {JSX.Element} Rendered header component
       */
      const LicenseHeader = function(props) {
        var className = props.className;
        var classNameValue = className === void 0 ? "" : className;
        var title = props.title;
        var description = props.description;
        
        (0, objectWithoutProperties.A)(props, HEADER_EXCLUDED_PROPS);
        
        return ReactDefault().createElement("div", {
          className: `${classNameValue} wpdeveloper-licensing-header-wrapper`
        },
          ReactDefault().createElement("div", {
            className: "wpdeveloper-licensing-header-icon"
          },
            ReactDefault().createElement("svg", {
              width: "32",
              height: "32",
              viewBox: "0 0 32 32",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg"
            },
              ReactDefault().createElement("path", {
                d: "M8 10.6667V9.33334C8 4.91506 11.5817 1.33334 16 1.33334C20.4183 1.33334 24 4.91506 24 9.33334V10.6667H26.6667C27.4031 10.6667 28 11.2636 28 12V28C28 28.7364 27.4031 29.3333 26.6667 29.3333H5.33333C4.59696 29.3333 4 28.7364 4 28V12C4 11.2636 4.59696 10.6667 5.33333 10.6667H8ZM25.3333 13.3333H6.66667V26.6667H25.3333V13.3333ZM14.6667 20.9765C13.8696 20.5155 13.3333 19.6537 13.3333 18.6667C13.3333 17.1939 14.5272 16 16 16C17.4728 16 18.6667 17.1939 18.6667 18.6667C18.6667 19.6537 18.1304 20.5155 17.3333 20.9765V24H14.6667V20.9765ZM10.6667 10.6667H21.3333V9.33334C21.3333 6.38782 18.9455 4 16 4C13.0545 4 10.6667 6.38782 10.6667 9.33334V10.6667Z",
                fill: "#C01048"
              })
            )
          ),
          ReactDefault().createElement("div", {
            className: "wpdeveloper-licensing-content"
          },
            ReactDefault().createElement("h2", {
              className: "wpdeveloper-licensing-header-title"
            }, title),
            ReactDefault().createElement("p", {
              className: "wpdeveloper-licensing-header-description"
            }, description)
          )
        );
      };

      /**
       * License Instructions Component.
       * Displays step-by-step instructions for activating the license.
       * 
       * @component
       * @param {Object} props - Component props
       * @param {string} [props.className=''] - Additional CSS classes
       * @param {string} [props.textdomain=''] - Text domain for translations
       * @returns {JSX.Element} Rendered instructions component
       */
      const LicenseInstructions = function(props) {
        var className = props.className;
        var classNameValue = className === void 0 ? "" : className;
        var textdomain = props.textdomain;
        var textdomainValue = textdomain === void 0 ? "" : textdomain;
        
        return ReactDefault().createElement("div", {
          className: `${classNameValue} wpdeveloper-licensing-instructions`
        },
          ReactDefault().createElement("p", null,
            (0, wpI18n.__)(
              "Enter your license key here, to activate Essential blocks, and get automatic updates and premium support.",
              textdomainValue
            )
          ),
          ReactDefault().createElement("ol", null,
            ReactDefault().createElement("li", null,
              "Log in to ",
              ReactDefault().createElement("a", {
                rel: "nofollow",
                href: "https://store.wpdeveloper.com/",
                target: "_blank"
              }, "your account"),
              " to get your license key."
            ),
            ReactDefault().createElement("li", null,
              "If you don't yet have a license key, get ",
              ReactDefault().createElement("a", {
                rel: "nofollow",
                href: "https://essential-blocks.com/upgrade",
                target: "_blank"
              }, "Essential Blocks Pro now"),
              "."
            ),
            ReactDefault().createElement("li", null,
              "Copy the license key from your account and paste it below."
            ),
            ReactDefault().createElement("li", null,
              "Click on ",
              ReactDefault().createElement("strong", null, '"Activate License"'),
              " button."
            )
          )
        );
      };

      /**
       * License Form Component.
       * Provides license key input and activation/deactivation buttons.
       * Manages license state and API communication.
       * 
       * @component
       * @param {Object} props - Component props
       * @param {ApiClient} props.apiFetch - API client instance
       * @param {Function} props.setIsLicenseActive - State setter for license status
       * @param {Object} props.licenseData - Current license data
       * @param {string} props.textdomain - Text domain for translations
       * @param {string} [props.className=''] - Additional CSS classes
       * @returns {JSX.Element} Rendered form component
       * 
       * @example
       * <LicenseForm
       *   apiFetch={apiClient}
       *   setIsLicenseActive={setActive}
       *   licenseData={{ license_status: 'valid', license_key: 'xxx' }}
       *   textdomain="essential-blocks"
       * />
       */
      const LicenseForm = function(props) {
        var initialKeyRef;
        var apiFetchClient = props.apiFetch;
        var setIsLicenseActive = props.setIsLicenseActive;
        var licenseData = props.licenseData;
        var textdomain = props.textdomain;
        var className = props.className;
        var classNameValue = className === void 0 ? "" : className;
        
        var isValidLicense = (0, React.useState)(
          (licenseData?.license_status) === "valid"
        );
        var isValidState = (0, arrayDestructure.A)(isValidLicense, 2);
        var isValid = isValidState[0];
        var setIsValid = isValidState[1];
        
        var messageState = (0, React.useState)(null);
        var message = (0, arrayDestructure.A)(messageState, 2);
        var messageText = message[0];
        var setMessage = message[1];
        
        var loadingState = (0, React.useState)(true);
        var isLoading = (0, arrayDestructure.A)(loadingState, 2);
        var loading = isLoading[0];
        var setLoading = isLoading[1];
        
        var licenseKeyState = (0, React.useState)(
          (initialKeyRef = licenseData?.license_key) !== null && 
          initialKeyRef !== void 0 
            ? initialKeyRef 
            : ""
        );
        var licenseKey = (0, arrayDestructure.A)(licenseKeyState, 2);
        var key = licenseKey[0];
        var setKey = licenseKey[1];
        
        var errorState = (0, React.useState)("");
        var error = (0, arrayDestructure.A)(errorState, 2);
        var errorText = error[0];
        var setError = error[1];
        
        var statusState = (0, React.useState)(null);
        var status = (0, arrayDestructure.A)(statusState, 2);
        var statusValue = status[0];
        var setStatus = status[1];

        // Component continues with activation/deactivation logic...
        // Full implementation in formatted file
      };

      // Additional components and webpack runtime...
    }
  };

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
 * Essential Blocks Pro Admin Module API Reference:
 * 
 * Classes:
 * --------
 * ApiClient
 *   - post(endpoint, options) - Make POST request
 *   - get(endpoint, options) - Make GET request
 *   - delete(endpoint, options) - Make DELETE request
 *   - getPath(endpoint) - Get full API URL
 *   - request(options) - Execute API request
 *   - useQuery(queryString) - Parse URL query string
 *   - getParam(param, default) - Get URL parameter
 * 
 * Components:
 * -----------
 * LicenseHeader
 *   - Props: className, title, description
 *   - Displays header with lock icon
 * 
 * LicenseInstructions
 *   - Props: className, textdomain
 *   - Step-by-step activation guide
 * 
 * LicenseForm
 *   - Props: apiFetch, setIsLicenseActive, licenseData, textdomain, className
 *   - License key input and activation/deactivation
 * 
 * Configuration:
 * --------------
 * Uses window.wpdeveloperLicenseManagerConfig for:
 *   - api_url: API base URL
 *   - action: AJAX action name
 *   - nonce: Security nonce
 *   - apiType: 'rest' or 'ajax'
 */
