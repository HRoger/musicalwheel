/**
 * ============================================================================
 * VOXEL PRODUCT FORM WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/product-form.js
 * Size: 42.5 KB (minified)
 * Beautified: December 2025
 *
 * PURPOSE:
 * Complete product configuration form for Voxel's e-commerce system.
 * Handles product addons, variations, booking calendars, stock management,
 * dynamic pricing, and cart operations. Supports three product modes:
 * - Regular: Base price + addons + quantity
 * - Variable: Product variations with attributes
 * - Booking: Date/time selection with availability management
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/product-form/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - Pikaday (date picker library)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup (popup component)
 * - Voxel.components.formGroup (form group component)
 * - Voxel.helpers.* (utility functions)
 *
 * CSS CLASSES:
 * - .ts-product-form: Main container element
 * - .ts-product-main: Product configuration area
 * - .vx-loading-screen: Loading state indicator
 * - .ts-use-addition: External addon trigger buttons
 *
 * DATA ATTRIBUTES:
 * - None on main element (config is in .vxconfig script tag)
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "settings": {
 *     "product_mode": "regular" | "variable" | "booking",
 *     "cart_nonce": "wp_nonce_value",
 *     "search_context_config": {
 *       "availability": "availability_param",
 *       "numeric_addons": { "addon_key": "url_param" },
 *       "switcher_addons": { "addon_key": "url_param" }
 *     },
 *     "search_context": {
 *       "availability": { "start": "2025-01-01", "end": "2025-01-05" },
 *       "numeric_addons": { "addon_key": 2 },
 *       "switcher_addons": { "addon_key": true }
 *     }
 *   },
 *   "props": {
 *     "base_price": {
 *       "enabled": true,
 *       "amount": 100,
 *       "discount_amount": 80
 *     },
 *     "minimum_price": 50,
 *     "custom_prices": {
 *       "enabled": true,
 *       "list": [
 *         {
 *           "conditions": [
 *             { "type": "date", "date": "2025-12-25" },
 *             { "type": "date_range", "range": { "from": "2025-01-01", "to": "2025-01-31" } },
 *             { "type": "day_of_week", "days": ["sat", "sun"] }
 *           ],
 *           "prices": {
 *             "base_price": { "amount": 150, "discount_amount": 120 },
 *             "addons": {
 *               "addon_key": { "price": 20 }
 *             }
 *           },
 *           "minimum_price": 100
 *         }
 *       ]
 *     },
 *     "today": {
 *       "date": "2025-01-15",
 *       "time": "14:30:00"
 *     },
 *     "fields": {
 *       "form-addons": {
 *         "props": {
 *           "addons": {
 *             "addon_key": {
 *               "key": "addon_key",
 *               "type": "switcher" | "numeric" | "select" | "multiselect" | "custom-select" | "custom-multiselect",
 *               "label": "Addon Name",
 *               "required": false,
 *               "repeat": true,
 *               "props": {
 *                 "price": 10,
 *                 "min_units": 1,
 *                 "max_units": 10,
 *                 "charge_after": { "enabled": true, "quantity": 2 },
 *                 "choices": {
 *                   "choice_value": {
 *                     "value": "choice_value",
 *                     "label": "Choice Label",
 *                     "price": 15,
 *                     "quantity": { "enabled": true, "min": 1, "max": 5 }
 *                   }
 *                 }
 *               },
 *               "_has_external_handler": false
 *             }
 *           },
 *           "l10n": {
 *             "amount_nights": "@count nights",
 *             "amount_days": "@count days"
 *           }
 *         }
 *       },
 *       "form-quantity": {
 *         "props": {
 *           "quantity": 100
 *         }
 *       },
 *       "form-variations": {
 *         "props": {
 *           "stock": { "enabled": true },
 *           "selections": { "attr_key": "choice_value" },
 *           "attributes": {
 *             "attr_key": {
 *               "key": "attr_key",
 *               "props": {
 *                 "choices": {
 *                   "choice_value": {
 *                     "value": "choice_value",
 *                     "label": "Choice Label"
 *                   }
 *                 }
 *               }
 *             }
 *           },
 *           "variations": {
 *             "var_id": {
 *               "id": "var_id",
 *               "attributes": { "attr_key": "choice_value" },
 *               "_status": "active" | "out_of_stock",
 *               "image": { "id": 123 },
 *               "config": {
 *                 "base_price": { "amount": 100, "discount_amount": 80 },
 *                 "stock": {
 *                   "enabled": true,
 *                   "quantity": 50,
 *                   "sold_individually": false
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "form-booking": {
 *         "props": {
 *           "mode": "date_range" | "single_day" | "timeslots",
 *           "count_mode": "nights" | "days",
 *           "availability": {
 *             "max_days": 365,
 *             "buffer": { "amount": 2, "unit": "days" | "hours" }
 *           },
 *           "date_range": {
 *             "min_length": 1,
 *             "max_length": 30,
 *             "has_custom_limits": true
 *           },
 *           "excluded_days": ["2025-12-25", "2025-12-26"],
 *           "excluded_weekdays": ["sun"],
 *           "timeslots": {
 *             "groups": [
 *               {
 *                 "days": ["mon", "tue", "wed"],
 *                 "slots": [
 *                   { "from": "09:00", "to": "10:00" },
 *                   { "from": "10:00", "to": "11:00" }
 *                 ]
 *               }
 *             ]
 *           },
 *           "quantity_per_slot": 5,
 *           "booked_slot_counts": {
 *             "2025-01-15 09:00-10:00": 3
 *           },
 *           "today": {
 *             "date": "2025-01-15",
 *             "time": "14:30:00"
 *           },
 *           "l10n": {
 *             "one_night": "1 night",
 *             "multiple_nights": "@count nights",
 *             "one_day": "1 day",
 *             "multiple_days": "@count days",
 *             "select_nights": "Select nights",
 *             "select_days": "Select days",
 *             "select_start_and_end_date": "Select start and end date",
 *             "select_end_date": "Select end date",
 *             "nights_range_error": "Min @minlength, max @maxlength nights",
 *             "days_range_error": "Min @minlength, max @maxlength days",
 *             "booking_price": "Booking",
 *             "amount_available": "@count available"
 *           }
 *         }
 *       },
 *       "form-data-inputs": {
 *         "props": {
 *           "data_inputs": {
 *             "input_key": {
 *               "key": "input_key",
 *               "type": "text" | "textarea" | "number" | "select" | "multiselect" | "email" | "phone" | "url" | "switcher" | "date",
 *               "label": "Input Label",
 *               "required": true,
 *               "props": {
 *                 "min": 1,
 *                 "max": 100,
 *                 "choices": {
 *                   "choice_value": { "value": "choice_value", "label": "Choice Label" }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "value": {
 *     "addons": {
 *       "addon_key": {
 *         "enabled": false,
 *         "quantity": 0,
 *         "selected": null,
 *         "selected": []
 *       }
 *     },
 *     "stock": {
 *       "quantity": 1
 *     },
 *     "variations": {
 *       "variation_id": "var_id",
 *       "quantity": 1
 *     },
 *     "booking": {
 *       "start_date": null,
 *       "end_date": null,
 *       "date": null,
 *       "slot": null
 *     },
 *     "data_inputs": {
 *       "input_key": ""
 *     }
 *   },
 *   "l10n": {
 *     "quantity": "Quantity",
 *     "added_to_cart": "Added to cart",
 *     "view_cart": "View cart"
 *   }
 * }
 */

/**
 * API ENDPOINTS USED:
 *
 * POST products.add_to_cart
 * - item: JSON string of config.value
 * - _wpnonce: Security nonce
 *
 * POST products.add_to_guest_cart
 * - item: JSON string of config.value
 * - guest_cart: JSON string from localStorage
 * - _wpnonce: Security nonce
 *
 * POST products.get_direct_cart
 * - item: JSON string of config.value
 * - _wpnonce: Security nonce
 */

/* ==========================================================================
   SECTION 1: ADDON COMPONENTS
   ========================================================================== */

/**
 * Addon Switcher Component
 *
 * Simple on/off toggle for an addon. When enabled, adds the addon's price
 * to the total. Supports custom pricing based on date ranges and repeat
 * configurations for booking products.
 *
 * @template #product-form-switcher
 */
const AddonSwitcher = {
    template: "#product-form-switcher",

    props: {
        addon: Object,    // The addon configuration
        addons: Object    // Reference to parent addons component
    },

    /**
     * Initialize component data
     *
     * @returns {Object} Component data
     */
    data() {
        return {
            // Reference to the addon's value in root config
            value: this.$root.config.value.addons[this.addon.key],
        };
    },

    /**
     * Component created lifecycle hook
     *
     * Auto-enables the addon if:
     * 1. Addon is marked as required
     * 2. Addon is enabled in search context (from URL parameters)
     */
    created() {
        // Auto-enable if required
        if (this.addon.required) {
            this.value.enabled = true;
        }

        // Auto-enable if specified in search context
        if (this.$root.config.settings.search_context.switcher_addons[this.addon.key] === true) {
            this.value.enabled = true;
        }
    },

    methods: {
        /**
         * Calculate pricing summary for this addon
         *
         * Returns null if addon is not enabled. Otherwise calculates the
         * price based on:
         * - Repeat configuration (for date range bookings)
         * - Custom pricing (for specific dates)
         * - Base addon price
         *
         * @returns {Object|null} { label: string, amount: number } or null
         *
         * CALLED BY: Parent addons component's getPricingSummary()
         * CALLS: addons.getRepeatConfig(), addons.getCustomPrice(), $root.getCustomPriceForDate()
         */
        getPricingSummary() {
            // Return null if not enabled
            if (!this.value.enabled) return null;

            let label = this.addon.label;
            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);
            let amount = 0;

            // Calculate price for date range bookings
            if (repeatConfig !== null) {
                amount = 0;
                let start = new Date(repeatConfig.start + "T00:00:00Z");
                let end = new Date(repeatConfig.end + "T00:00:00Z");

                // Loop through each day in the range
                while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                    let priceDate = this.$root.getCustomPriceForDate(start);

                    if (priceDate !== null) {
                        // Use custom price for this date if available
                        let cp = priceDate.prices.addons[this.addon.key].price;
                        amount += cp != null ? cp : this.addon.props.price;
                    } else {
                        // Use base addon price
                        amount += this.addon.props.price;
                    }

                    start.setDate(start.getDate() + 1);
                }

                label += repeatConfig.label;
            } else {
                // Single day or regular product pricing
                amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key].price, customPrice != null))
                    ? customPrice
                    : this.addon.props.price;
            }

            return { label: label, amount: amount };
        },
    },
};

/**
 * Addon Numeric Component
 *
 * Quantity selector for an addon. Allows users to select a number of units
 * within min/max bounds. Supports "charge after" functionality where the
 * first N units are free.
 *
 * @template #product-form-numeric
 */
const AddonNumeric = {
    template: "#product-form-numeric",

    props: {
        addon: Object,    // The addon configuration
        addons: Object    // Reference to parent addons component
    },

    /**
     * Initialize component data
     *
     * @returns {Object} Component data
     */
    data() {
        return {
            value: this.$root.config.value.addons[this.addon.key],
        };
    },

    /**
     * Component created lifecycle hook
     *
     * Sets initial quantity based on:
     * 1. Required status (min_units if required, 0 if optional)
     * 2. Search context value (from URL parameters)
     */
    created() {
        // Set default quantity
        if (this.value.quantity === null) {
            this.value.quantity = this.addon.required ? this.addon.props.min_units : 0;
        }

        // Override with search context value if valid
        let contextVal = this.$root.config.settings.search_context.numeric_addons[this.addon.key];
        if (contextVal !== undefined) {
            let val = parseInt(contextVal, 10);
            if (typeof val === 'number' && val >= this.addon.props.min_units && val <= this.addon.props.max_units) {
                this.value.quantity = val;
            }
        }
    },

    methods: {
        /**
         * Increment quantity by 1
         *
         * Ensures quantity stays within min/max bounds.
         * If current value is invalid, resets to min_units.
         */
        increment() {
            if (typeof this.value.quantity !== "number" || this.value.quantity + 1 < this.addon.props.min_units) {
                this.value.quantity = this.addon.props.min_units;
            } else {
                this.value.quantity = Math.min(this.value.quantity + 1, this.addon.props.max_units);
            }
        },

        /**
         * Decrement quantity by 1
         *
         * For optional addons, allows decrementing to 0.
         * For required addons, stops at min_units.
         */
        decrement() {
            if (typeof this.value.quantity !== "number") {
                this.value.quantity = this.addon.props.min_units;
            } else {
                let newVal = this.value.quantity - 1;
                if (!this.addon.required && newVal < this.addon.props.min_units) {
                    this.value.quantity = 0;
                } else {
                    this.value.quantity = Math.max(newVal, this.addon.props.min_units);
                }
            }
        },

        /**
         * Validate quantity is within bounds
         *
         * Called on blur or when quantity is manually entered.
         * Clamps value to min/max range.
         */
        validateValueInBounds() {
            if (typeof this.value.quantity === "number") {
                if (this.value.quantity > this.addon.props.max_units) {
                    this.value.quantity = this.addon.props.max_units;
                } else if (this.value.quantity < this.addon.props.min_units) {
                    // Allow 0 for optional addons
                    if (!(!this.addon.required && this.value.quantity === 0)) {
                        this.value.quantity = this.addon.props.min_units;
                    }
                }
            }
        },

        /**
         * Calculate pricing summary for this addon
         *
         * Handles "charge after" functionality where first N units are free.
         * Calculates total based on quantity and pricing rules.
         *
         * @returns {Object|null} { label: string, amount: number } or null
         */
        getPricingSummary() {
            if (this.value.quantity < 1) return null;

            let label = this.addon.label;
            if (this.value.quantity >= 1) label += " × " + this.value.quantity;

            // Calculate billable quantity (after free units)
            let quantity = this.value.quantity;
            if (this.addon.props.charge_after?.enabled && this.addon.props.charge_after?.quantity > 0) {
                quantity = Math.max(0, this.value.quantity - this.addon.props.charge_after.quantity);
            }

            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);
            let amount = 0;

            // Calculate price for date range bookings
            if (repeatConfig !== null) {
                amount = 0;
                let start = new Date(repeatConfig.start + "T00:00:00Z");
                let end = new Date(repeatConfig.end + "T00:00:00Z");

                while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                    let priceDate = this.$root.getCustomPriceForDate(start);

                    if (priceDate !== null) {
                        let cp = priceDate.prices.addons[this.addon.key].price;
                        amount += cp != null ? cp : this.addon.props.price;
                    } else {
                        amount += this.addon.props.price;
                    }

                    start.setDate(start.getDate() + 1);
                }

                amount *= quantity;
                label += repeatConfig.label;
            } else {
                // Single day or regular product pricing
                amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key].price, customPrice != null))
                    ? customPrice * quantity
                    : this.addon.props.price * quantity;
            }

            return { label: label, amount: amount };
        },
    },
};

/**
 * Addon Multiselect Component
 *
 * Allows selection of multiple choices from a list. Each selected choice
 * adds its price to the total. Supports custom pricing and date ranges.
 *
 * @template #product-form-multiselect
 */
const AddonMultiselect = {
    template: "#product-form-multiselect",

    props: {
        addon: Object,    // The addon configuration
        addons: Object    // Reference to parent addons component
    },

    /**
     * Initialize component data
     *
     * @returns {Object} Component data
     */
    data() {
        return {
            value: this.$root.config.value.addons[this.addon.key],
        };
    },

    methods: {
        /**
         * Toggle a choice selection
         *
         * If already selected, removes it from the array.
         * If not selected, adds it to the array.
         *
         * @param {Object} choice - The choice to toggle
         */
        toggle(choice) {
            if (this.value.selected.includes(choice.value)) {
                this.value.selected.splice(this.value.selected.indexOf(choice.value), 1);
            } else {
                this.value.selected.push(choice.value);
            }
        },

        /**
         * Calculate pricing summary for all selected choices
         *
         * Returns an array of pricing summaries, one for each selected choice.
         * Each choice can have custom pricing based on dates.
         *
         * @returns {Array} Array of { label: string, amount: number } objects
         *
         * CALLED BY: Parent addons component's getPricingSummary()
         * CALLS: addons.getRepeatConfig(), addons.getCustomPrice(), $root.getCustomPriceForDate()
         */
        getPricingSummary() {
            let summaries = [];
            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);

            this.value.selected.forEach(selectedValue => {
                let choiceKey = selectedValue;
                if (choiceKey === null) return;

                let choice = this.addon.props.choices[choiceKey];
                if (!choice) return;

                let label = choice.label;
                let amount = 0;

                // Calculate price for date range bookings
                if (repeatConfig !== null) {
                    amount = 0;
                    let start = new Date(repeatConfig.start + "T00:00:00Z");
                    let end = new Date(repeatConfig.end + "T00:00:00Z");

                    while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                        let priceDate = this.$root.getCustomPriceForDate(start);

                        if (priceDate !== null) {
                            let cp = priceDate.prices.addons[this.addon.key][choiceKey].price;
                            amount += cp != null ? cp : choice.price;
                        } else {
                            amount += choice.price;
                        }

                        start.setDate(start.getDate() + 1);
                    }

                    label += repeatConfig.label;
                } else {
                    // Single day or regular product pricing
                    amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key][choiceKey].price, customPrice != null))
                        ? customPrice
                        : choice.price;
                }

                summaries.push({ label: label, amount: amount });
            });

            return summaries;
        },
    },
};

/**
 * Addon Select Component
 *
 * Dropdown selection for a single choice from a list.
 * Auto-selects first choice if addon is required.
 *
 * @template #product-form-select
 */
const AddonSelect = {
    template: "#product-form-select",
    props: { addon: Object, addons: Object },
    data() {
        return {
            value: this.$root.config.value.addons[this.addon.key],
        };
    },
    created() {
        if (this.addon.required && this.value.selected === null) {
            this.value.selected = Object.keys(this.addon.props.choices)[0] || null;
        }
    },
    methods: {
        getPricingSummary() {
            let selected = this.value.selected;
            if (selected === null) return null;
            let choice = this.addon.props.choices[selected];
            if (!choice) return null;

            let label = choice.label;
            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);
            let amount = 0;

            if (repeatConfig !== null) {
                amount = 0;
                let start = new Date(repeatConfig.start + "T00:00:00Z");
                let end = new Date(repeatConfig.end + "T00:00:00Z");

                while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                    let priceDate = this.$root.getCustomPriceForDate(start);

                    if (priceDate !== null) {
                        let cp = priceDate.prices.addons[this.addon.key][selected].price;
                        amount += cp != null ? cp : choice.price;
                    } else {
                        amount += choice.price;
                    }

                    start.setDate(start.getDate() + 1);
                }

                label += repeatConfig.label;
            } else {
                amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key][selected].price, customPrice != null))
                    ? customPrice
                    : choice.price;
            }

            return { label: label, amount: amount };
        },
    },
};

/**
 * Addon Custom Select Component
 *
 * Button-based selection with optional quantity per choice.
 * Used for visual selection interfaces (e.g., room types, meal plans).
 * Supports external handlers for integration with pricing cards.
 *
 * @template #product-form-custom-select
 */
const AddonCustomSelect = {
    template: "#product-form-custom-select",

    props: {
        addon: Object,
        addons: Object
    },

    data() {
        return {
            value: this.$root.config.value.addons[this.addon.key],
        };
    },

    created() {
        if (this.addon.required && this.value.selected.item === null) {
            let firstChoice = Object.values(this.addon.props.choices)[0];
            this.value.selected.item = firstChoice.value;
            this.value.selected.quantity = firstChoice.quantity.enabled ? firstChoice.quantity.min : 1;
        }
    },

    methods: {
        /**
         * Check if addon should be visible
         * Hidden when external handler is active and no selection made
         */
        shouldShowAddon() {
            return !this.addon._has_external_handler || this.value.selected.item !== null;
        },

        /**
         * Check if specific choice should be visible
         */
        shouldShowChoice(choice) {
            return !this.addon._has_external_handler || this.value.selected.item === choice.value;
        },

        /**
         * Toggle choice selection
         */
        toggleChoice(choice) {
            if (choice && this.value.selected.item !== choice.value) {
                this.value.selected.item = choice.value;
                this.value.selected.quantity = choice.quantity.enabled ? choice.quantity.min : 1;
            } else {
                this.value.selected.item = null;
            }
        },

        /**
         * Validate quantity within choice bounds
         */
        validateQuantity(choice) {
            if (typeof this.value.selected.quantity === "number") {
                if (this.value.selected.quantity > choice.quantity.max) {
                    this.value.selected.quantity = choice.quantity.max;
                } else if (this.value.selected.quantity < choice.quantity.min) {
                    this.value.selected.quantity = choice.quantity.min;
                }
            }
        },

        /**
         * Increment quantity for selected choice
         */
        incrementQuantity(choice) {
            if (typeof this.value.selected.quantity !== "number") {
                this.value.selected.quantity = choice.quantity.min;
            } else {
                let newVal = this.value.selected.quantity + 1;
                if (newVal < choice.quantity.min) {
                    this.value.selected.quantity = choice.quantity.min;
                } else {
                    this.value.selected.quantity = Math.min(newVal, choice.quantity.max);
                }
            }
        },

        /**
         * Decrement quantity for selected choice
         */
        decrementQuantity(choice) {
            if (typeof this.value.selected.quantity !== "number") {
                this.value.selected.quantity = choice.quantity.min;
            } else {
                this.value.selected.quantity = Math.max(this.value.selected.quantity - 1, choice.quantity.min);
            }
        },

        /**
         * Calculate pricing summary
         */
        getPricingSummary() {
            let { item, quantity } = this.value.selected;
            if (item === null) return null;

            let choice = this.addon.props.choices[item];
            if (!choice) return null;

            let label = choice.label;
            if (choice.quantity.enabled && quantity >= 1) {
                label += " × " + quantity;
            }

            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);
            let amount = 0;

            if (repeatConfig !== null) {
                let start = new Date(repeatConfig.start + "T00:00:00Z");
                let end = new Date(repeatConfig.end + "T00:00:00Z");

                while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                    let priceDate = this.$root.getCustomPriceForDate(start);

                    if (priceDate !== null) {
                        let cp = priceDate.prices.addons[this.addon.key][item].price;
                        amount += cp != null ? cp : choice.price;
                    } else {
                        amount += choice.price;
                    }

                    start.setDate(start.getDate() + 1);
                }

                if (choice.quantity.enabled) amount *= quantity;
                label += repeatConfig.label;
            } else {
                amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key][item].price, customPrice != null))
                    ? customPrice
                    : choice.price;

                if (choice.quantity.enabled) amount *= quantity;
            }

            return { label: label, amount: amount };
        }
    }
};

/**
 * Addon Custom Multiselect Component
 *
 * Button-based multi-selection with optional quantity per choice.
 * Similar to CustomSelect but allows multiple selections.
 *
 * @template #product-form-custom-multiselect
 */
const AddonCustomMultiselect = {
    template: "#product-form-custom-multiselect",

    props: {
        addon: Object,
        addons: Object
    },

    data() {
        return {
            value: this.$root.config.value.addons[this.addon.key],
        };
    },

    methods: {
        shouldShowAddon() {
            return !this.addon._has_external_handler || !!this.value.selected.length;
        },

        shouldShowChoice(choice) {
            return !this.addon._has_external_handler || this.isChecked(choice);
        },

        getSelectionIndex(choice) {
            return this.value.selected.findIndex(sel => sel.item === choice.value);
        },

        isChecked(choice) {
            return this.getSelectionIndex(choice) !== -1;
        },

        toggleChoice(choice) {
            let idx = this.getSelectionIndex(choice);
            if (idx !== -1) {
                this.value.selected.splice(idx, 1);
            } else {
                this.value.selected.push({
                    item: choice.value,
                    quantity: choice.quantity.min
                });
            }
        },

        validateQuantity(choice) {
            let idx = this.getSelectionIndex(choice);
            if (typeof this.value.selected[idx].quantity === "number") {
                if (this.value.selected[idx].quantity > choice.quantity.max) {
                    this.value.selected[idx].quantity = choice.quantity.max;
                } else if (this.value.selected[idx].quantity < choice.quantity.min) {
                    this.value.selected[idx].quantity = choice.quantity.min;
                }
            }
        },

        incrementQuantity(choice) {
            let idx = this.getSelectionIndex(choice);
            if (typeof this.value.selected[idx].quantity !== "number") {
                this.value.selected[idx].quantity = choice.quantity.min;
            } else {
                let newVal = this.value.selected[idx].quantity + 1;
                if (newVal < choice.quantity.min) {
                    this.value.selected[idx].quantity = choice.quantity.min;
                } else {
                    this.value.selected[idx].quantity = Math.min(newVal, choice.quantity.max);
                }
            }
        },

        decrementQuantity(choice) {
            let idx = this.getSelectionIndex(choice);
            if (typeof this.value.selected[idx].quantity !== "number") {
                this.value.selected[idx].quantity = choice.quantity.min;
            } else {
                this.value.selected[idx].quantity = Math.max(this.value.selected[idx].quantity - 1, choice.quantity.min);
            }
        },

        getPricingSummary() {
            let summaries = [];
            let repeatConfig = this.addons.getRepeatConfig(this.addon);
            let customPrice = this.addons.getCustomPrice(this.addon);

            this.value.selected.forEach(selection => {
                let { item, quantity } = selection;
                if (item === null) return;

                let choice = this.addon.props.choices[item];
                if (!choice) return;

                let label = choice.label;
                if (choice.quantity.enabled && quantity >= 1) {
                    label += " × " + quantity;
                }

                let amount = 0;

                if (repeatConfig !== null) {
                    let amountPerDay = 0;
                    let start = new Date(repeatConfig.start + "T00:00:00Z");
                    let end = new Date(repeatConfig.end + "T00:00:00Z");

                    while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                        let priceDate = this.$root.getCustomPriceForDate(start);

                        if (priceDate !== null) {
                            let cp = priceDate.prices.addons[this.addon.key][item].price;
                            amountPerDay += cp != null ? cp : choice.price;
                        } else {
                            amountPerDay += choice.price;
                        }

                        start.setDate(start.getDate() + 1);
                    }

                    if (choice.quantity.enabled) amountPerDay *= quantity;
                    amount = amountPerDay;
                    label += repeatConfig.label;
                } else {
                    amount = (customPrice !== null && (customPrice = customPrice.prices.addons[this.addon.key][item].price, customPrice != null))
                        ? customPrice
                        : choice.price;

                    if (choice.quantity.enabled) amount *= quantity;
                }

                summaries.push({ label: label, amount: amount });
            });

            return summaries;
        }
    }
};

/* ==========================================================================
   SECTION 2: FIELD COMPONENTS
   ========================================================================== */

/**
 * Field Addons Component
 *
 * Wrapper component that manages all product addons.
 * Delegates to specific addon type components.
 *
 * @template #product-form-addons
 */
const FieldAddons = {
    template: "#product-form-addons",

    props: {
        field: Object
    },

    components: {
        addonSwitcher: AddonSwitcher,
        addonNumeric: AddonNumeric,
        addonSelect: AddonSelect,
        addonMultiselect: AddonMultiselect,
        addonCustomSelect: AddonCustomSelect,
        addonCustomMultiselect: AddonCustomMultiselect,
        externalChoice: {
            template: "#product-form-external-choice",
            data() {
                return {
                    data: this.$root.externalChoice
                };
            },
            methods: {
                onClear() {
                    if (this.data.ref.addon.type === "custom-select") {
                        this.data.ref.value.selected.item = null;
                    } else {
                        let idx = this.data.ref.getSelectionIndex(this.data.choice);
                        if (idx !== -1) {
                            this.data.ref.value.selected.splice(idx, 1);
                        }
                    }
                }
            }
        }
    },

    data() {
        return {};
    },

    methods: {
        /**
         * Get pricing summary for all addons
         * Collects summaries from all addon components
         */
        getPricingSummary() {
            let summaries = [];

            Object.values(this.field.props.addons).forEach(addon => {
                let addonRef = this.$refs["addon:" + addon.key][0];
                let summary = addonRef.getPricingSummary();

                if (summary !== null) {
                    if (Array.isArray(summary)) {
                        summaries = summaries.concat(summary);
                    } else {
                        summaries.push(summary);
                    }
                }
            });

            return summaries;
        },

        /**
         * Get custom price for current date/context
         */
        getCustomPrice(addon) {
            let productMode = this.$root.config.settings.product_mode;

            if (productMode === "booking") {
                let bookingField = this.$root.config.props.fields["form-booking"];
                if (bookingField && ["single_day", "timeslots"].includes(bookingField.props.mode)) {
                    let booking = this.$root.config.value.booking;
                    if (booking.date) {
                        return this.$root.getCustomPriceForDate(new Date(booking.date + "T00:00:00Z"));
                    }
                }
                return null;
            } else if (productMode === "regular") {
                let todayDate = this.$root.config.props.today.date;
                return this.$root.getCustomPriceForDate(new Date(todayDate + "T00:00:00Z"));
            }

            return null;
        },

        /**
         * Get repeat configuration for date range bookings
         */
        getRepeatConfig(addon) {
            let bookingField = this.$root.config.props.fields["form-booking"];
            if (!bookingField || bookingField.props.mode !== "date_range" || !addon.repeat) {
                return null;
            }

            let booking = this.$root.config.value.booking;
            if (!booking.start_date || !booking.end_date) {
                return null;
            }

            let bookingRef = this.$root.$refs["field:form-booking"][0];
            let length = bookingRef.$refs.dateRange.getSelectedRangeLength();

            if (length < 1) return null;

            let countMode = bookingField.props.count_mode;
            let label = "";

            if (length > 1) {
                label = countMode === "nights"
                    ? ` (${this.field.props.l10n.amount_nights.replace("@count", length)})`
                    : ` (${this.field.props.l10n.amount_days.replace("@count", length)})`;
            }

            return {
                length: length,
                label: label,
                start: booking.start_date,
                end: booking.end_date,
                count_mode: countMode
            };
        },

        /**
         * Get formatted price for a choice (used in templates)
         */
        getPriceForChoice(addon, choice) {
            let repeatConfig = this.getRepeatConfig(addon);
            let customPrice = this.getCustomPrice(addon);

            if (repeatConfig === null) {
                if (customPrice !== null && customPrice.prices.addons[addon.key][choice.value].price != null) {
                    return this.$root.currencyFormat(customPrice.prices.addons[addon.key][choice.value].price);
                }
                return this.$root.currencyFormat(choice.price);
            }

            // Calculate price range for date range
            let start = new Date(repeatConfig.start + "T00:00:00Z");
            let end = new Date(repeatConfig.end + "T00:00:00Z");
            let prices = [];

            while (repeatConfig.count_mode === "nights" ? start < end : start <= end) {
                let priceDate = this.$root.getCustomPriceForDate(start);

                if (priceDate !== null) {
                    let cp = priceDate.prices.addons[addon.key][choice.value].price;
                    prices.push(cp != null ? cp : choice.price);
                } else {
                    prices.push(choice.price);
                }

                start.setDate(start.getDate() + 1);
            }

            let minPrice = Math.min(...prices);
            let maxPrice = Math.max(...prices);

            if (minPrice === maxPrice) {
                return this.$root.currencyFormat(minPrice);
            }

            return this.$root.currencyFormat(minPrice) + " - " + this.$root.currencyFormat(maxPrice);
        }
    }
};

/**
 * Field Quantity Component
 *
 * Simple quantity selector for regular products.
 *
 * @template #product-form-quantity
 */
const FieldQuantity = {
    template: "#product-form-quantity",

    props: {
        field: Object
    },

    data() {
        return {
            value: this.$root.config.value.stock
        };
    },

    methods: {
        increment() {
            if (typeof this.value.quantity !== "number") {
                this.value.quantity = 1;
            } else {
                let newVal = this.value.quantity + 1;
                this.value.quantity = newVal < 1 ? 1 : Math.min(this.value.quantity + 1, this.field.props.quantity);
            }
        },

        decrement() {
            if (typeof this.value.quantity !== "number") {
                this.value.quantity = 1;
            } else {
                this.value.quantity = Math.max(this.value.quantity - 1, 1);
            }
        },

        validateValueInBounds() {
            if (typeof this.value.quantity === "number") {
                if (this.value.quantity > this.field.props.quantity) {
                    this.value.quantity = this.field.props.quantity;
                } else if (this.value.quantity < 1) {
                    this.value.quantity = 1;
                }
            }
        }
    }
}
};

/**
 * Field Variations Component
 *
 * Manages product variations (e.g., Size/Color combinations).
 * Handles complex logic for:
 * - Attribute selection with availability filtering
 * - Stock management per variation
 * - Automatic variation matching
 * - Quantity validation
 * - Image gallery synchronization
 *
 * @template #product-form-variations
 */
const FieldVariations = {
    template: "#product-form-variations",

    props: {
        field: Object
    },

    components: {
        /**
         * Variation Attribute Component
         * 
         * Renders a single attribute selector (e.g., Size or Color).
         * Filters available choices based on other attribute selections.
         */
        variationAttribute: {
            template: "#product-form-attribute",

            props: {
                attribute: Object,
                variations: Object
            },

            data() {
                return {};
            },

            methods: {
                /**
                 * Select a choice for this attribute
                 * 
                 * @param {Object} choice - The choice to select
                 */
                selectChoice(choice) {
                    this.variations.setAttribute(this.attribute.key, choice.value);
                },

                /**
                 * Check if choice is currently selected
                 * 
                 * @param {Object} choice - The choice to check
                 * @returns {boolean} True if selected
                 */
                isSelected(choice) {
                    return this.variations.selections[this.attribute.key] === choice.value;
                },

                /**
                 * Get available variations for current selections
                 * 
                 * Filters variations to only those matching OTHER attribute selections.
                 * This is used to determine which choices are available for THIS attribute.
                 *
                 * @returns {Array} Array of variation objects
                 */
                getAvailableVariations() {
                    let allAttributes = Object.values(this.variations.field.props.attributes);

                    return Object.values(this.variations.field.props.variations).filter(variation => {
                        // Check if variation matches all OTHER attribute selections
                        for (let attr of allAttributes) {
                            // Skip this attribute (we're determining choices for it)
                            if (attr.key === this.attribute.key) break;

                            // If variation doesn't match the selected value for this other attribute, exclude it
                            if (this.variations.field.props.selections[attr.key] !== variation.attributes[attr.key]) {
                                return false;
                            }
                        }
                        return true;
                    });
                },

                /**
                 * Get active (available) choices for this attribute
                 * 
                 * Returns only choices that have at least one available variation.
                 *
                 * @returns {Array} Array of choice objects
                 */
                getActiveChoices() {
                    let availableVariations = this.getAvailableVariations();

                    return Object.values(this.attribute.props.choices).filter(choice => {
                        return availableVariations.find(variation => {
                            return variation.attributes[this.attribute.key] === choice.value;
                        });
                    });
                },

                /**
                 * Get status for a specific choice
                 * 
                 * Returns:
                 * - "active": Choice is available and in stock
                 * - "out_of_stock": Choice exists but all variations are out of stock
                 * - "inactive": Choice doesn't exist in any available variation
                 *
                 * @param {Object} choice - The choice to check
                 * @returns {string} Status string
                 */
                getChoiceStatus(choice) {
                    let availableVariations = this.getAvailableVariations();

                    // Filter to variations that have this choice
                    let matchingVariations = availableVariations.filter(variation => {
                        return variation.attributes[this.attribute.key] === choice.value;
                    });

                    if (!matchingVariations.length) {
                        return "inactive";
                    }

                    // Check stock if enabled
                    if (!this.variations.field.props.stock.enabled) {
                        return "active";
                    }

                    // Check if any matching variation is in stock
                    let inStock = matchingVariations.find(variation => variation._status === "active");
                    return inStock ? "active" : "out_of_stock";
                }
            },

            computed: {
                /**
                 * Get label for currently selected choice
                 * 
                 * @returns {string} Choice label
                 */
                selectionLabel() {
                    let selectedValue = this.variations.selections[this.attribute.key];
                    return this.attribute.props.choices["choice_" + selectedValue].label;
                }
            }
        }
    },

    data() {
        return {
            selections: this.field.props.selections,  // Reactive object for attribute selections
            value: this.$root.config.value.variations
        };
    },

    created() {
        this.setDefaultSelection();
    },

    methods: {
        /**
         * Set default variation selection
         * 
         * Finds the first active (in-stock) variation and selects all its attributes.
         * If no active variations exist, does nothing.
         */
        setDefaultSelection() {
            // Find first active variation
            for (let variation of Object.values(this.field.props.variations)) {
                if (variation._status === "active") {
                    // Set all attribute selections to match this variation
                    Object.keys(this.selections).forEach(attributeKey => {
                        this.selections[attributeKey] = variation.attributes[attributeKey];
                    });
                    break;
                }
            }

            this.validateSelection();
        },

        /**
         * Set attribute value and revalidate
         * 
         * Called when user selects a different choice for an attribute.
         * Triggers validation to ensure the combination is valid.
         *
         * @param {string} attributeKey - The attribute key
         * @param {string} value - The choice value
         */
        setAttribute(attributeKey, value) {
            this.selections[attributeKey] = value;
            this.validateSelection();
        },

        /**
         * Validate current attribute selections
         * 
         * Ensures the selected combination of attributes matches an actual variation.
         * If no exact match exists, falls back to the first active variation.
         * Updates variation_id and quantity accordingly.
         */
        validateSelection() {
            let matchedVariation = null;
            let activeVariations = Object.values(this.field.props.variations).filter(v => v._status === "active");

            // Try to find exact match for current selections
            for (let attributeKey of Object.keys(this.selections)) {
                let matchingVariations = activeVariations.filter(variation => {
                    // Check if all selected attributes match this variation
                    for (let key of Object.keys(this.selections)) {
                        if (variation.attributes[key] !== this.selections[key]) {
                            return false;
                        }
                    }
                    return true;
                });

                if (matchingVariations.length) {
                    matchedVariation = matchingVariations[0];
                    break;
                }
            }

            // Fallback to first active variation if no match
            if (!matchedVariation && activeVariations.length) {
                matchedVariation = activeVariations[0];

                // Update selections to match fallback variation
                Object.keys(this.selections).forEach(key => {
                    this.selections[key] = matchedVariation.attributes[key];
                });
            }

            if (matchedVariation) {
                this.value.variation_id = matchedVariation.id;
                this.validateQuantity();

                // Scroll to variation image in gallery if it exists
                if (matchedVariation.image) {
                    let imageElement = document.getElementById("ts-media-" + matchedVariation.image.id);
                    if (imageElement) {
                        imageElement.parentElement.scrollLeft = imageElement.offsetLeft;
                    }
                }
            }
        },

        /**
         * Validate quantity for current variation
         * 
         * Sets quantity to 1 if:
         * - Stock is disabled
         * - Variation stock is disabled
         * - Variation is sold individually
         * 
         * Otherwise validates quantity is within stock bounds.
         */
        validateQuantity() {
            if (this.field.props.stock.enabled &&
                this.currentVariation.config.stock.enabled &&
                !this.currentVariation.config.stock.sold_individually) {
                this.validateQuantityInBounds();
            } else {
                this.value.quantity = 1;
            }
        },

        /**
         * Get pricing summary for current variation
         * 
         * Returns price and quantity information for display in pricing summary.
         *
         * @returns {Object} { label: string, amount: number, quantity: number|null }
         */
        getPricingSummary() {
            let basePrice = this.currentVariation.config.base_price;
            let amount = basePrice.discount_amount != null ? basePrice.discount_amount : basePrice.amount;
            let quantity = null;

            // Include quantity if stock management is enabled
            if (this.field.props.stock.enabled &&
                this.currentVariation.config.stock.enabled &&
                !this.currentVariation.config.stock.sold_individually) {
                this.validateQuantity();
                quantity = this.value.quantity;
                amount *= this.value.quantity;
            }

            // Build label from attribute choices
            let labels = [];
            Object.keys(this.currentVariation.attributes).forEach(attributeKey => {
                let choiceValue = this.currentVariation.attributes[attributeKey];
                let choice = this.field.props.attributes[attributeKey].props.choices["choice_" + choiceValue];
                labels.push(choice.label);
            });

            return {
                label: labels.join(" / "),
                amount: amount,
                quantity: quantity
            };
        },

        /**
         * Increment quantity
         */
        incrementQuantity() {
            if (typeof this.value.quantity !== "number") {
                this.value.quantity = 1;
            } else {
                let newVal = this.value.quantity + 1;
                this.value.quantity = newVal < 1 ? 1 : Math.min(this.value.quantity + 1, this.currentVariation.config.stock.quantity);
            }
        },

        /**
         * Decrement quantity
         */
        decrementQuantity() {
            if (typeof this.value.quantity !== "number") {
                this.value.quantity = 1;
            } else {
                this.value.quantity = Math.max(this.value.quantity - 1, 1);
            }
        },

        /**
         * Validate quantity is within stock bounds
         */
        validateQuantityInBounds() {
            if (typeof this.value.quantity === "number") {
                if (this.value.quantity > this.currentVariation.config.stock.quantity) {
                    this.value.quantity = this.currentVariation.config.stock.quantity;
                } else if (this.value.quantity < 1) {
                    this.value.quantity = 1;
                }
            }
        }
    },

    computed: {
        /**
         * Get current variation object
         * 
         * @returns {Object} Current variation configuration
         */
        currentVariation() {
            return this.field.props.variations[this.value.variation_id];
        }
    }
};

/* ==========================================================================
   SECTION 2: MAIN RENDER FUNCTION
   ========================================================================== */

/**
 * Initialize all product form widgets on the page
 *
 * Creates Vue applications for each .ts-product-form element.
 * Handles product configuration, pricing calculations, and cart operations.
 *
 * CALLED BY:
 * - Immediately on script load
 * - 'voxel:markup-update' event (after AJAX content loads)
 *
 * SELECTOR: .ts-product-form .ts-product-main:not(.vx-loading-screen)
 */
window.render_product_form = () => {
    Array.from(document.querySelectorAll(".ts-product-form .ts-product-main:not(.vx-loading-screen)")).forEach((element) => {
        // Skip if already initialized
        if (element.__vue_app__) return;

        // Parse configuration from sibling .vxconfig script tag
        let configElement = element.closest(".elementor-element").querySelector(".vxconfig");
        let config = JSON.parse(configElement.innerHTML);

        // Create Vue application
        const app = Vue.createApp({
            el: element,
            mixins: [Voxel.mixins.base],

            data() {
                return {
                    config: config,
                    activePopup: null,
                    pricing_summary: {
                        items: [],
                        visible_items: [],
                        total_amount: null
                    },
                    processing: false,
                    externalChoice: {
                        active: false,
                        el: null,
                        choice: null,
                        ref: null
                    }
                };
            },

            created() {
                this._setSearchContext();
            },

            mounted() {
                window.VX_Product_Form = this;
                this.runLoadingAnimation();
                this.updatePricingSummary();
                this.$watch(() => this.config.value, () => this.updatePricingSummary(), { deep: true });
                this.handleExternalAddons();
            },

            methods: {
                /**
                 * Run loading animation
                 * Smoothly transitions from loading screen to form
                 */
                runLoadingAnimation() {
                    let parent = element.parentElement;
                    parent.style.height = parent.offsetHeight + "px";

                    setTimeout(() => {
                        parent.classList.remove("vx-loading");
                        let height = element.offsetHeight;
                        let styles = getComputedStyle(parent);
                        height += parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom) +
                            parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
                        parent.style.height = height + "px";

                        setTimeout(() => parent.style.height = null, 250);
                    }, 150);
                },

                /**
                 * Update pricing summary
                 * Recalculates total price based on selected options
                 */
                updatePricingSummary() {
                    let mode = this.config.settings.product_mode;
                    let items = [];

                    if (mode === "regular") {
                        let base = this._getBasePriceSummary();
                        let addons = this.getFieldRef("form-addons")?.getPricingSummary() || null;
                        let quantity = this._getQuantity();

                        if (base !== null) {
                            base.hidden = (addons === null || !addons.length);
                            items.push(base);
                        }

                        if (addons !== null) items.push(...addons);
                        if (quantity > 1) items.push({ label: this.config.l10n.quantity, value: quantity });

                        let total = 0;
                        items.forEach(item => { if (item.amount) total += item.amount; });
                        total *= quantity;

                        this.pricing_summary.items = items;
                        this.pricing_summary.visible_items = items.filter(i => !i.hidden);
                        this.pricing_summary.total_amount = total;
                    } else if (mode === "variable") {
                        // Variable product mode (with variations)
                        let items = [];
                        let variationSummary = this.getFieldRef("form-variations")?.getPricingSummary() || null;

                        if (variationSummary !== null) {
                            items.push(variationSummary);

                            // Add quantity line if applicable
                            if (variationSummary.quantity && variationSummary.quantity > 1) {
                                items.push({
                                    label: this.config.l10n.quantity,
                                    value: variationSummary.quantity
                                });
                            }
                        }

                        let total = 0;
                        items.forEach(item => { if (item.amount) total += item.amount; });

                        this.pricing_summary.items = items;
                        this.pricing_summary.visible_items = items.filter(i => !i.hidden);
                        this.pricing_summary.total_amount = total;
                    } else if (mode === "booking") {
                        // Booking product mode (with date/time selection)
                        let items = [];
                        let bookingSummary = this.getFieldRef("form-booking")?.getPricingSummary() || null;
                        let addonsSummary = this.getFieldRef("form-addons")?.getPricingSummary() || null;

                        if (bookingSummary !== null) {
                            // Hide booking price if it's zero (addons-only booking)
                            bookingSummary.hidden = bookingSummary.amount === 0;
                            items.push(bookingSummary);

                            if (addonsSummary !== null) {
                                items.push(...addonsSummary);
                            }
                        }

                        let total = 0;
                        items.forEach(item => { if (item.amount) total += item.amount; });

                        this.pricing_summary.items = items;
                        this.pricing_summary.visible_items = items.filter(i => !i.hidden);
                        this.pricing_summary.total_amount = total;
                    }
                },

                /**
                 * Add product to cart
                 */
                addToCart() {
                    this.processing = true;

                    if (Voxel_Config.is_logged_in) {
                        jQuery.post(
                            Voxel_Config.ajax_url + "&action=products.add_to_cart&_wpnonce=" + this.config.settings.cart_nonce,
                            { item: JSON.stringify(this.config.value) }
                        ).always((response) => {
                            this.processing = false;

                            if (response.success) {
                                jQuery(document).trigger("voxel:added_cart_item", response.item);
                                this.showAddedToCartAlert();
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    } else {
                        // Guest cart logic
                        jQuery.post(
                            Voxel_Config.ajax_url + "&action=products.add_to_guest_cart&_wpnonce=" + this.config.settings.cart_nonce,
                            {
                                item: JSON.stringify(this.config.value),
                                guest_cart: localStorage.getItem("voxel:guest_cart")
                            }
                        ).always((response) => {
                            this.processing = false;

                            if (response.success) {
                                localStorage.setItem("voxel:guest_cart", JSON.stringify(response.guest_cart));
                                this.showAddedToCartAlert();
                                jQuery(document).trigger("voxel:added_cart_item", response.item);
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    }
                },

                /**
                 * Show "added to cart" alert
                 * 
                 * Displays success notification with optional "View Cart" button
                 */
                showAddedToCartAlert() {
                    let actions = [];

                    // Add "View Cart" button if cart popup exists
                    if (document.querySelector(".ts-popup-cart > a")) {
                        actions.push({
                            label: this.config.l10n.view_cart,
                            link: "#",
                            onClick: (event) => {
                                event.preventDefault();
                                Voxel.openCart();
                                event.target.closest(".ts-notice").querySelector(".close-alert").click();
                            }
                        });
                    }

                    Voxel.alert(this.config.l10n.added_to_cart, "success", actions, 4000);
                },

                /**
                 * Direct checkout (skip cart)
                 * 
                 * Creates a temporary cart with single item and redirects to checkout.
                 * Used for "Buy Now" buttons.
                 */
                directCart() {
                    this.processing = true;

                    jQuery.post(
                        Voxel_Config.ajax_url + "&action=products.get_direct_cart&_wpnonce=" + this.config.settings.cart_nonce,
                        { item: JSON.stringify(this.config.value) }
                    ).always((response) => {
                        this.processing = false;

                        if (response.success) {
                            // Store in localStorage for checkout page
                            localStorage.setItem("voxel:direct_cart", JSON.stringify({
                                [response.item.key]: response.item.value
                            }));

                            window.location.href = response.checkout_link;
                        } else {
                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                        }
                    });
                },

                /**
                 * Get minimum price for a specific date
                 * 
                 * Used by Pikaday tooltips to show daily pricing.
                 * Returns the minimum price considering custom pricing rules.
                 *
                 * @param {Date|null} date - The date to check (null = use base price)
                 * @returns {number} Minimum price for the date
                 */
                getMinimumPriceForDate(date = null) {
                    if (!this.config.props.custom_prices.enabled || date === null) {
                        return this.config.props.minimum_price;
                    }

                    let customPrice = this.getCustomPriceForDate(date);
                    if (customPrice === null) {
                        return this.config.props.minimum_price;
                    }

                    return customPrice.minimum_price;
                },

                /**
                 * Get custom price configuration for a specific date
                 * 
                 * Checks all custom pricing rules to find one that matches the given date.
                 * Rules can match by:
                 * - Exact date
                 * - Date range
                 * - Day of week
                 *
                 * @param {Date} date - The date to check
                 * @returns {Object|null} Custom price configuration or null if no match
                 */
                getCustomPriceForDate(date) {
                    if (!this.config.props.custom_prices.enabled) {
                        return null;
                    }

                    // Find first matching custom price rule
                    let matchingRule = this.config.props.custom_prices.list.find(rule => {
                        for (let condition of rule.conditions) {
                            if (condition.type === "date") {
                                // Exact date match
                                if (condition.date === Voxel.helpers.dateFormatYmd(date)) {
                                    return true;
                                }
                            } else if (condition.type === "date_range") {
                                // Date range match
                                let rangeStart = new Date(condition.range.from + "T00:00:00Z");
                                let rangeEnd = new Date(condition.range.to + "T00:00:00Z");
                                let checkDate = new Date(Voxel.helpers.dateFormatYmd(date) + "T00:00:00Z");

                                if (rangeStart <= checkDate && checkDate <= rangeEnd) {
                                    return true;
                                }
                            } else if (condition.type === "day_of_week") {
                                // Day of week match
                                let dateObj = new Date(Voxel.helpers.dateFormatYmd(date) + "T00:00:00Z");
                                let dayName = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dateObj.getDay()];

                                if (condition.days.includes(dayName)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });

                    return matchingRule !== undefined ? matchingRule : null;
                },

                /**
                 * Handle external addon selection
                 * 
                 * Allows addon selection from elements outside the form (e.g., pricing cards).
                 * Looks for elements with class .ts-use-addition and data-id attribute.
                 * 
                 * Data-id format: base64 encoded JSON { addon: "addon_key", choice: "choice_value" }
                 */
                handleExternalAddons() {
                    jQuery(".ts-use-addition").each((index, element) => {
                        try {
                            // Decode addon/choice reference
                            let reference = JSON.parse(atob(element.dataset.id));

                            // Get addon configuration
                            let addon = this.config.props.fields["form-addons"]?.props.addons[reference.addon] || null;
                            let choice = addon?.props.choices[reference.choice] || null;
                            let addonValue = this.config.value.addons?.[reference.addon] || null;
                            let addonRef = this.$refs["field:form-addons"]?.[0]?.$refs["addon:" + reference.addon]?.[0] || null;

                            if (addon === null || choice === null || addonValue === null || addonRef === null) {
                                return;
                            }

                            // Get tooltip configuration
                            let container = element.parentElement;
                            let defaultTooltip = container.dataset.tooltipDefault || null;
                            let activeTooltip = container.dataset.tooltipActive || null;

                            // Mark addon as having external handler
                            addon._has_external_handler = true;

                            // Handle custom-multiselect type
                            if (addon.type === "custom-multiselect") {
                                // Watch for selection changes
                                this.$watch(() => addonValue.selected.length, () => {
                                    let isSelected = addonValue.selected.find(sel => sel.item === reference.choice);

                                    if (isSelected) {
                                        element.classList.add("active");
                                        if (activeTooltip) {
                                            container.dataset.tooltip = activeTooltip;
                                        } else {
                                            delete container.dataset.tooltip;
                                        }
                                    } else {
                                        element.classList.remove("active");
                                        if (defaultTooltip) {
                                            container.dataset.tooltip = defaultTooltip;
                                        } else {
                                            delete container.dataset.tooltip;
                                        }
                                    }
                                });

                                // Handle click
                                element.addEventListener("click", (event) => {
                                    event.preventDefault();

                                    let selectionIndex = addonValue.selected.findIndex(sel => sel.item === reference.choice);

                                    if (selectionIndex === -1) {
                                        // Add selection
                                        addonValue.selected.push({
                                            item: reference.choice,
                                            quantity: choice.quantity.min
                                        });

                                        // Show quantity popup if enabled
                                        if (choice.quantity.enabled) {
                                            this.externalChoice.active = true;
                                            this.externalChoice.el = element;
                                            this.externalChoice.choice = choice;
                                            this.externalChoice.ref = addonRef;
                                        }
                                    } else {
                                        // Remove selection
                                        addonValue.selected.splice(selectionIndex, 1);
                                    }
                                });
                            }
                            // Handle custom-select type
                            else if (addon.type === "custom-select") {
                                // Watch for selection changes
                                this.$watch(() => addonValue.selected.item, () => {
                                    if (addonValue.selected.item === reference.choice) {
                                        element.classList.add("active");
                                        if (activeTooltip) {
                                            container.dataset.tooltip = activeTooltip;
                                        } else {
                                            delete container.dataset.tooltip;
                                        }
                                    } else {
                                        element.classList.remove("active");
                                        if (defaultTooltip) {
                                            container.dataset.tooltip = defaultTooltip;
                                        } else {
                                            delete container.dataset.tooltip;
                                        }
                                    }
                                }, { immediate: true });

                                // Handle click
                                element.addEventListener("click", (event) => {
                                    event.preventDefault();

                                    if (addonValue.selected.item !== reference.choice) {
                                        // Select this choice
                                        addonValue.selected.item = reference.choice;
                                        addonValue.selected.quantity = choice.quantity.min;

                                        // Show quantity popup if enabled
                                        if (choice.quantity.enabled) {
                                            this.externalChoice.active = true;
                                            this.externalChoice.el = element;
                                            this.externalChoice.choice = choice;
                                            this.externalChoice.ref = addonRef;
                                        }
                                    } else {
                                        // Deselect
                                        addonValue.selected.item = null;
                                    }
                                });
                            }
                        } catch (error) {
                            // Silently ignore invalid external addon configurations
                        }
                    });
                },

                /**
                 * Parse and set search context from referrer URL
                 * 
                 * Extracts search parameters from the referring page (e.g., search results)
                 * and pre-fills the form with those values. Handles:
                 * - Availability dates (for booking products)
                 * - Numeric addon quantities
                 * - Switcher addon states
                 */
                _setSearchContext() {
                    let contextConfig = this.config.settings.search_context_config;
                    let context = {
                        availability: { start: null, end: null },
                        numeric_addons: {},
                        switcher_addons: {}
                    };

                    /**
                     * Validate date string format (YYYY-MM-DD)
                     */
                    let isValidDate = (dateString) => {
                        if (typeof dateString !== "string" || !dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            return false;
                        }
                        return isFinite(new Date(dateString));
                    };

                    try {
                        // Parse referrer URL parameters
                        let referrerUrl = new URL(document.referrer);
                        let searchParams = referrerUrl.searchParams;

                        // Extract availability dates
                        if (contextConfig.availability !== null) {
                            let availabilityParam = searchParams.get(contextConfig.availability);

                            if (typeof availabilityParam === "string") {
                                let dates = availabilityParam.split("..");

                                if (isValidDate(dates[0])) {
                                    context.availability.start = dates[0];
                                    context.availability.end = isValidDate(dates[1]) ? dates[1] : dates[0];
                                }
                            }
                        }

                        // Extract numeric addon values
                        if (contextConfig.numeric_addons !== null) {
                            Object.keys(contextConfig.numeric_addons).forEach(addonKey => {
                                let paramName = contextConfig.numeric_addons[addonKey];
                                let paramValue = searchParams.get(paramName);

                                if (typeof paramValue === "string") {
                                    let numValue = parseInt(paramValue, 10);
                                    if (!isNaN(numValue)) {
                                        context.numeric_addons[addonKey] = numValue;
                                    }
                                }
                            });
                        }

                        // Extract switcher addon states
                        if (contextConfig.switcher_addons !== null) {
                            Object.keys(contextConfig.switcher_addons).forEach(addonKey => {
                                let paramName = contextConfig.switcher_addons[addonKey];

                                if (searchParams.get(paramName) === "1") {
                                    context.switcher_addons[addonKey] = true;
                                }
                            });
                        }
                    } catch (error) {
                        // Silently ignore referrer parsing errors
                    }

                    this.config.settings.search_context = context;
                },

                /**
                 * Get field reference by key
                 * 
                 * Helper to access field component refs
                 *
                 * @param {string} fieldKey - The field key (e.g., "form-addons")
                 * @returns {Object|undefined} Field component reference
                 */
                getFieldRef(fieldKey) {
                    return this.$refs["field:" + fieldKey]?.[0];
                },

                /**
                 * Get base price summary
                 * 
                 * Returns the base product price, considering custom pricing for today's date.
                 * Marked as hidden if addons are selected (Voxel UX pattern).
                 *
                 * @returns {Object|null} { label: string, amount: number, hidden: boolean } or null
                 */
                _getBasePriceSummary() {
                    let basePrice = this.config.props.base_price;
                    if (!basePrice.enabled) return null;

                    let amount = basePrice.discount_amount !== null ? basePrice.discount_amount : basePrice.amount;

                    // Check for custom pricing on today's date (regular products only)
                    if (this.config.settings.product_mode === "regular") {
                        let todayDate = this.config.props.today.date;
                        let customPrice = this.getCustomPriceForDate(new Date(todayDate + "T00:00:00Z"));

                        if (customPrice !== null) {
                            amount = customPrice.prices.base_price.discount_amount !== null
                                ? customPrice.prices.base_price.discount_amount
                                : customPrice.prices.base_price.amount;
                        }
                    }

                    return {
                        hidden: true,  // Will be set to false if no addons selected
                        label: "Price",
                        amount: amount
                    };
                },

                /**
                 * Get product quantity
                 * 
                 * Returns quantity from stock field, or 1 if not applicable.
                 *
                 * @returns {number} Quantity (minimum 1)
                 */
                _getQuantity() {
                    if (this.config.props.fields["form-quantity"] && this.config.value.stock.quantity > 1) {
                        return this.config.value.stock.quantity;
                    }
                    return 1;
                },

                /**
                 * Format currency value
                 * 
                 * Wrapper for Voxel.helpers.currencyFormat
                 *
                 * @param {number} amount - The amount to format
                 * @returns {string} Formatted currency string
                 */
                currencyFormat(amount) {
                    return Voxel.helpers.currencyFormat(amount);
                }
            }
        });

        // Register components
        app.component("addon-switcher", AddonSwitcher);
        app.component("addon-numeric", AddonNumeric);
        app.component("addon-select", AddonSelect);
        app.component("addon-multiselect", AddonMultiselect);
        app.component("addon-custom-select", AddonCustomSelect);
        app.component("addon-custom-multiselect", AddonCustomMultiselect);
        app.component("field-form-addons", FieldAddons);
        app.component("field-form-quantity", FieldQuantity);
        app.component("field-form-variations", FieldVariations);
        app.component("form-popup", Voxel.components.popup);
        app.component("form-group", Voxel.components.formGroup);

        app.mount(element);
    });
};

/* ==========================================================================
   SECTION 3: AUTO-INITIALIZATION & EVENT BINDING
   ========================================================================== */

// Initialize immediately
window.render_product_form();

// Re-initialize when new markup is added via AJAX
jQuery(document).on("voxel:markup-update", window.render_product_form);

/* ==========================================================================
   SECTION 4: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Re-initialization prevention:
 *    - Checks element.__vue_app__ before creating new Vue instance
 *    - Prevents duplicate Vue apps on same element
 *
 * 2. Invalid addon quantities:
 *    - Validates against min/max bounds
 *    - Handles "charge after" free units
 *    - Allows 0 for optional addons
 *
 * 3. Custom pricing:
 *    - Falls back to base price if custom price not available
 *    - Handles date-specific pricing
 *    - Supports date range pricing for bookings
 *
 * 4. Search context initialization:
 *    - Validates URL parameters before applying
 *    - Handles invalid date formats
 *    - Validates numeric ranges
 *
 * 5. Guest cart:
 *    - Uses localStorage for non-logged-in users
 *    - Syncs with server on cart operations
 *
 * 6. External addon handlers:
 *    - Supports addon selection from outside form
 *    - Handles custom addon buttons on pricing cards
 *
 * POTENTIAL ISSUES:
 *
 * 1. localStorage limitations:
 *    - May fail in private browsing mode
 *    - No error handling for quota exceeded
 *
 * 2. Date calculations:
 *    - Timezone handling relies on UTC conversion
 *    - May have edge cases around DST transitions
 *
 * 3. Price calculation complexity:
 *    - Multiple pricing layers can be confusing
 *    - No validation that total matches server calculation
 */

/* ==========================================================================
   SECTION 5: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── render_product_form()
 *        └── For each .ts-product-form .ts-product-main
 *            ├── Parse .vxconfig JSON
 *            ├── Create Vue app with data/methods
 *            ├── Register addon components
 *            ├── Mount Vue app
 *            └── Initialize:
 *                ├── _setSearchContext()
 *                ├── runLoadingAnimation()
 *                ├── updatePricingSummary()
 *                └── handleExternalAddons()
 *
 * 2. User Modifies Addon/Variation/Booking
 *    └── Vue reactivity triggers
 *        └── $watch on config.value
 *            └── updatePricingSummary()
 *                ├── Collect summaries from all fields
 *                ├── Calculate total based on product mode
 *                └── Update pricing_summary data
 *
 * 3. User Clicks "Add to Cart"
 *    └── addToCart()
 *        ├── Set processing = true
 *        ├── Check if logged in
 *        │   ├── Logged in: POST products.add_to_cart
 *        │   └── Guest: POST products.add_to_guest_cart
 *        └── On response:
 *            ├── Set processing = false
 *            ├── Success: Show alert, trigger event
 *            └── Error: Show error alert
 *
 * 4. AJAX Content Load
 *    └── 'voxel:markup-update' triggered
 *        └── render_product_form() runs again
 *            └── Initializes any new product forms
 */
