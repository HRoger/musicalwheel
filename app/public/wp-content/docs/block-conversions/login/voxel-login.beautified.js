/**
 * ============================================================================
 * VOXEL AUTH WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/auth.js
 * Size: ~25KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * Handles all authentication forms: Login, Registration, Password Recovery,
 * Profile Update (Email/Password), and Two-Factor Authentication (2FA) setup.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/auth/frontend.tsx (To contain logic reference)
 *
 * DEPENDENCIES:
 * - Vue 3 (Global `Vue`)
 * - jQuery
 * - Voxel Global (`Voxel`, `Voxel_Config`)
 * - Pikaday (for date fields)
 * - ReCaptcha (v3)
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "mode": "login" | "register" | "recover" | "update_profile" | "update_email" | "update_password" | "setup_2fa",
 *   "fields": {
 *     "username": {
 *       "id": "username",
 *       "key": "username",
 *       "type": "text",
 *       "label": "Username or Email",
 *       "placeholder": "Enter username or email",
 *       "required": true,
 *       "value": "",
 *       "validation": {
 *         "errors": []
 *       }
 *     },
 *     "password": {
 *       "id": "password",
 *       "key": "password",
 *       "type": "password",
 *       "label": "Password",
 *       "placeholder": "Enter password",
 *       "required": true,
 *       "value": "",
 *       "props": {
 *         "minlength": 8
 *       }
 *     },
 *     "email": {
 *       "id": "email",
 *       "key": "email",
 *       "type": "email",
 *       "label": "Email",
 *       "placeholder": "Enter email",
 *       "required": true,
 *       "value": ""
 *     },
 *     "confirm_password": {
 *       "id": "confirm_password",
 *       "key": "confirm_password",
 *       "type": "password",
 *       "label": "Confirm Password",
 *       "required": true,
 *       "value": ""
 *     },
 *     "first_name": {
 *       "id": "first_name",
 *       "key": "first_name",
 *       "type": "text",
 *       "label": "First Name",
 *       "required": false,
 *       "value": ""
 *     },
 *     "last_name": {
 *       "id": "last_name",
 *       "key": "last_name",
 *       "type": "text",
 *       "label": "Last Name",
 *       "required": false,
 *       "value": ""
 *     },
 *     "terms": {
 *       "id": "terms",
 *       "key": "terms",
 *       "type": "switcher",
 *       "label": "I agree to the terms and conditions",
 *       "required": true,
 *       "value": false
 *     },
 *     "role": {
 *       "id": "role",
 *       "key": "role",
 *       "type": "select",
 *       "label": "Register as",
 *       "required": true,
 *       "value": null,
 *       "props": {
 *         "choices": [
 *           { "value": "customer", "label": "Customer" },
 *           { "value": "vendor", "label": "Vendor" }
 *         ]
 *       }
 *     },
 *     "custom_field": {
 *       "id": "custom_field",
 *       "key": "custom_field",
 *       "type": "text" | "email" | "url" | "number" | "date" | "taxonomy" | "file" | "select" | "multiselect",
 *       "label": "Custom Field",
 *       "required": false,
 *       "value": null,
 *       "props": {},
 *       "conditions": [
 *         [
 *           {
 *             "type": "text:equals",
 *             "source": "role",
 *             "value": "vendor"
 *           }
 *         ]
 *       ]
 *     }
 *   },
 *   "security": {
 *     "recaptcha": {
 *       "enabled": true,
 *       "site_key": "6Lc...",
 *       "action": "voxel_login"
 *     },
 *     "nonce": "wp_nonce_value",
 *     "two_factor": {
 *       "enabled": false,
 *       "qr_code": "data:image/png;base64,...",
 *       "secret": "BASE32SECRET",
 *       "backup_codes": ["12345678", "87654321"]
 *     }
 *   },
 *   "redirects": {
 *     "after_login": "/dashboard",
 *     "after_register": "/welcome",
 *     "after_logout": "/",
 *     "login_page": "/login",
 *     "register_page": "/register"
 *   },
 *   "social_login": {
 *     "google": {
 *       "enabled": true,
 *       "client_id": "...",
 *       "url": "https://example.com/auth/google"
 *     },
 *     "facebook": {
 *       "enabled": true,
 *       "app_id": "...",
 *       "url": "https://example.com/auth/facebook"
 *     }
 *   },
 *   "l10n": {
 *     "login": "Log In",
 *     "register": "Sign Up",
 *     "recover": "Reset Password",
 *     "or": "or",
 *     "remember_me": "Remember me",
 *     "forgot_password": "Forgot password?",
 *     "no_account": "Don't have an account?",
 *     "have_account": "Already have an account?"
 *   },
 *   "errors": {
 *     "required": "This field is required",
 *     "email:invalid": "Invalid email address",
 *     "password:mismatch": "Passwords do not match",
 *     "password:minlength": "Password must be at least @minlength characters",
 *     "username:taken": "Username already exists",
 *     "email:taken": "Email already registered",
 *     "login:invalid": "Invalid username or password",
 *     "2fa:invalid": "Invalid verification code"
 *   }
 * }
 *
 * FORM MODES:
 * - login: Username/email + password + remember me + 2FA (if enabled)
 * - register: Email + password + confirm password + custom fields + role selection
 * - recover: Email to send password reset link
 * - update_profile: Update user profile fields
 * - update_email: Change email address with password confirmation
 * - update_password: Change password with current password + new password + confirm
 * - setup_2fa: Enable/disable two-factor authentication with QR code
 */

/* ==========================================================================
   SECTION 1: COMPONENTS & MIXINS
   ========================================================================== */

/**
 * Condition handling mixin
 * Evaluates field visibility conditions (e.g. show field X only if field Y = 'yes')
 */
const ConditionMixin = {
    methods: {
        setupConditions(fields) {
            Object.values(fields).forEach((field) => {
                if (!field.conditions) return;

                field.conditions.forEach((group) => {
                    group.forEach((condition) => {
                        const parts = condition.source.split(".");
                        const fieldKey = parts[0];
                        const property = parts[1] || null;
                        const sourceField = fields[fieldKey];

                        if (sourceField) {
                            let value = sourceField.value;
                            if (property !== null) {
                                value = value ? value[property] : null;
                            }

                            this.evaluateCondition(condition, value, field, sourceField);

                            // Watch for changes in the source field
                            this.$watch(
                                () => {
                                    const state = { _passes: this.conditionsPass(sourceField) };
                                    if (property !== null) {
                                        state.value = sourceField.value
                                            ? sourceField.value[property]
                                            : null;
                                    } else {
                                        state.value = sourceField.value;
                                    }
                                    return state;
                                },
                                (val, oldVal) => {
                                    let currentValue = sourceField.value;
                                    if (property !== null) {
                                        currentValue = currentValue ? currentValue[property] : null;
                                    }
                                    this.evaluateCondition(
                                        condition,
                                        currentValue,
                                        field,
                                        sourceField
                                    );
                                },
                                { deep: true }
                            );
                        } else {
                            condition._passes = false;
                        }
                    });
                });
            });
        },
        evaluateCondition(condition, value, targetField, sourceField) {
            const handler = Voxel.conditionHandlers[condition.type];
            if (handler) {
                condition._passes =
                    this.conditionsPass(sourceField) &&
                    handler(condition, value, targetField, sourceField);
            }
        },
        conditionsPass(field) {
            // Recursive check for parent steps in wizard (if applicable)
            if (
                this.$root.widget === "create-post" &&
                field.type !== "ui-step"
            ) {
                const step = this.$root.fields[field.step];
                if (step && !this.conditionsPass(step)) return false;
            }

            if (!field.conditions) return true;

            let valid = false;
            // Conditions are groups of ANDs, separated by ORs
            field.conditions.forEach((group) => {
                if (group.length) {
                    let groupValid = true;
                    group.forEach((condition) => {
                        if (!condition._passes) groupValid = false;
                    });
                    if (groupValid) valid = true;
                }
            });

            return field.conditions_behavior === "hide" ? !valid : valid;
        },
    },
};

// Registered Condition Handlers
window.Voxel.conditionHandlers = {
    "text:equals": (c, v) => v === c.value,
    "text:not_equals": (c, v) => v !== c.value,
    "text:empty": (c, v) => !v?.trim()?.length,
    "text:not_empty": (c, v) => !!v?.trim()?.length,
    "text:contains": (c, v) => v?.match(new RegExp(c.value, "i")),
    "taxonomy:contains": (c, v) => Array.isArray(v) && v.includes(c.value),
    "taxonomy:not_contains": (c, v) => !(Array.isArray(v) && v.includes(c.value)),
    "taxonomy:empty": (c, v) => !Array.isArray(v) || !v.length,
    "taxonomy:not_empty": (c, v) => Array.isArray(v) && v.length,
    "switcher:checked": (c, v) => !!v,
    "switcher:unchecked": (c, v) => !v,
    "number:empty": (c, v) => isNaN(parseFloat(v)),
    "number:equals": (c, v) => parseFloat(v) === parseFloat(c.value),
    "number:gt": (c, v) => parseFloat(v) > parseFloat(c.value),
    "number:gte": (c, v) => parseFloat(v) >= parseFloat(c.value),
    "number:lt": (c, v) => parseFloat(v) < parseFloat(c.value),
    "number:lte": (c, v) => parseFloat(v) <= parseFloat(c.value),
    "number:not_empty": (c, v) => !isNaN(parseFloat(v)),
    "number:not_equals": (c, v) => parseFloat(v) !== parseFloat(c.value),
    "file:empty": (c, v) => !Array.isArray(v) || !v.length,
    "file:not_empty": (c, v) => Array.isArray(v) && v.length,
    "date:empty": (c, v) =>
        !isFinite(new Date(v.date + " " + (v.time || "00:00:00"))),
    "date:gt": (c, v) => {
        const valDate = new Date(v.date + " " + (v.time || "00:00:00"));
        const condDate = new Date(c.value);
        return !(!isFinite(valDate) || !isFinite(condDate)) && condDate < valDate;
    },
    "date:lt": (c, v) => {
        const valDate = new Date(v.date + " " + (v.time || "00:00:00"));
        const condDate = new Date(c.value);
        return !(!isFinite(valDate) || !isFinite(condDate)) && valDate < condDate;
    },
    "date:not_empty": (c, v) =>
        isFinite(new Date(v.date + " " + (v.time || "00:00:00"))),
};

/* ==========================================================================
   SECTION 2: FIELD COMPONENTS (Sub-components)
   ========================================================================== */

/**
 * DATE FIELD COMPONENT
 */
const DateFieldComponent = {
    template: "#create-post-date-field", // Reused from create-post
    components: {
        datePicker: {
            template: '<div class="ts-form-group" ref="calendar"><input type="hidden" ref="input"></div>',
            props: { field: Object, parent: Object },
            data() {
                return { picker: null };
            },
            mounted() {
                this.picker = new Pikaday({
                    field: this.$refs.input,
                    container: this.$refs.calendar,
                    bound: false,
                    firstDay: 1,
                    keyboardInput: false,
                    defaultDate: this.parent.date,
                    onSelect: (date) => {
                        this.parent.date = date;
                        this.parent.onSave();
                    },
                    selectDayFn: (date) =>
                        this.parent.date &&
                        this.parent.date.toDateString() === date.toDateString(),
                });
            },
            unmounted() {
                setTimeout(() => this.picker.destroy(), 200);
            },
            methods: {
                reset() {
                    this.parent.date = null;
                    this.picker.draw();
                },
            },
        },
    },
    props: {
        field: Object,
        index: { type: Number, default: 0 },
    },
    data() {
        return {
            date: this.field.value.date,
            time: this.field.value.time,
            displayValue: "",
        };
    },
    created() {
        if (typeof this.date === "string") {
            this.date = new Date(this.date + "T00:00:00");
            this.displayValue = this.getDisplayValue();
        }
    },
    methods: {
        saveValue() {
            this.field.value.date = this.isFilled()
                ? Voxel.helpers.dateFormatYmd(this.date)
                : null;
            this.displayValue = this.getDisplayValue();
        },
        onSave() {
            this.saveValue();
            this.$refs.formGroup.blur();
        },
        onClear() {
            this.$refs.picker.reset();
        },
        isFilled() {
            return this.date && isFinite(this.date);
        },
        getDisplayValue() {
            return this.date ? Voxel.helpers.dateFormat(this.date) : "";
        },
        validate(val) {
            // Basic required validation
            if (this.$root.shouldValidate()) {
                let errors = [];
                const isTimeEnabled = !!this.field.props.enable_timepicker;
                const isEmptyDate = !(typeof val === "object" && val.date && (!isTimeEnabled || val.time));

                if (this.$root.shouldValidateRequired() && this.field.required && isEmptyDate) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value.date"() {
            this.validate(this.field.value);
        },
        "field.value.time"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * TERM LIST COMPONENT (Used by Taxonomy Field)
 */
const TermListComponent = {
    template: "#create-post-term-list",
    props: ["terms", "parent-term", "previous-list", "list-key"],
    data() {
        return {
            taxonomyField: Voxel.helpers.getParent(this, "taxonomy-field"),
            perPage: 50,
            page: 1,
        };
    },
    methods: {
        selectTerm(term) {
            if (term.children && term.children.length) {
                this.taxonomyField.slide_from = "right";
                this.taxonomyField.active_list = "terms_" + term.id;
            } else {
                this.taxonomyField.selectTerm(term);
            }
        },
        goBack() {
            this.taxonomyField.slide_from = "left";
            this.taxonomyField.active_list = this.previousList;
        },
        afterEnter(el, key) {
            setTimeout(
                () => (el.closest(".min-scroll").scrollTop = this.taxonomyField.scrollPosition[key] || 0),
                100
            );
        },
        beforeLeave(el, key) {
            this.taxonomyField.scrollPosition[key] = el.closest(".min-scroll").scrollTop;
        },
    },
    computed: {
        termsWithChildren() {
            return this.terms.filter((t) => t.children && t.children.length);
        },
    },
};

/**
 * TAXONOMY FIELD COMPONENT
 */
const TaxonomyFieldComponent = {
    template: "#create-post-taxonomy-field",
    name: "taxonomy-field",
    props: {
        field: Object,
        index: { type: Number, default: 0 },
    },
    data() {
        return {
            value: {},
            terms: this.field.props.terms,
            active_list: "toplevel",
            slide_from: "right",
            search: "",
            displayValue: "",
            scrollPosition: {},
            termCount: 0,
        };
    },
    created() {
        this.value = this.field.props.selected;
        this.displayValue = this._getDisplayValue();

        // Index terms with parentRef for traversal
        let indexer = (term, parent) => {
            this.termCount++;
            term.parentRef = parent;
            if (term.children) {
                term.children.forEach((child) => indexer(child, term));
            }
        };
        this.terms.forEach((t) => indexer(t, null));
    },
    methods: {
        saveValue() {
            this.field.value = this.isFilled() ? Object.keys(this.value) : null;
            this.displayValue = this._getDisplayValue();
        },
        onSave() {
            this.saveValue();
            this.$refs.formGroup.$refs.popup.$emit("blur");
        },
        onClear() {
            this.value = {};
            this.search = "";
            this.$refs.searchInput?.focus();
        },
        isFilled() {
            return Object.keys(this.value).length;
        },
        _getDisplayValue() {
            return this._getLeafTermSlugs(this.value)
                .map((slug) => this.value[slug].label)
                .join(", ");
        },
        deselectChildren(term) {
            if (term.children) {
                term.children.forEach((child) => {
                    delete this.value[child.slug];
                    this.deselectChildren(child);
                });
            }
        },
        _getLeafTermSlugs(values) {
            const slugs = Object.keys(values);
            if (slugs.length === 0) return [];

            let isParent = {};
            let slugSet = new Set(slugs);

            slugs.forEach((slug) => { isParent[slug] = false; });

            // Mark terms that are parents of other selected terms
            slugs.forEach((slug) => {
                let term = values[slug];
                if (term) {
                    let parent = term.parentRef;
                    while (parent) {
                        if (slugSet.has(parent.slug)) {
                            isParent[parent.slug] = true;
                        }
                        parent = parent.parentRef;
                    }
                }
            });

            return slugs.filter((slug) => !isParent[slug]);
        },
        _countLeafTermsWithValue(val) {
            return this._getLeafTermSlugs(val).length;
        },
        _countLeafTerms() {
            return this._countLeafTermsWithValue(this.value);
        },
        selectTerm(term) {
            if (this.value[term.slug]) {
                // Deselect
                delete this.value[term.slug];
                this.deselectChildren(term);
                // Deselect parents if they become empty
                let parent = term.parentRef;
                while (parent) {
                    if (!parent.children.some((child) => !!this.value[child.slug])) {
                        delete this.value[parent.slug];
                    }
                    parent = parent.parentRef;
                }
            } else {
                // Select
                if (!this.field.props.multiple) {
                    Object.keys(this.value).forEach((k) => delete this.value[k]);
                }

                this.value[term.slug] = term;
                // Auto-select parents
                let parent = term.parentRef;
                while (parent) {
                    this.value[parent.slug] = parent;
                    parent = parent.parentRef;
                }

                if (!this.field.props.multiple && this.field.props.display_as !== "inline") {
                    this.onSave();
                }
            }

            if (this.field.props.display_as === "inline") {
                this.saveValue();
            }
        },
        validate(val) {
            // Validate Min/Max terms
            if (this.$root.shouldValidate()) {
                let errors = [];
                const count = this._countLeafTerms();
                const isEmpty = count === 0;
                const min = this.field.props.min;
                const max = this.field.props.max;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && count < min) {
                        errors.push(
                            this.$root.replace_vars(this.$root.get_error("taxonomy:min"), {
                                "@min": min,
                            })
                        );
                    }
                    if (max && max < count) {
                        errors.push(
                            this.$root.replace_vars(this.$root.get_error("taxonomy:max"), {
                                "@max": max,
                            })
                        );
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    computed: {
        searchResults() {
            if (!this.search.trim().length) return false;
            let results = [];
            const query = this.search.trim().toLowerCase();

            const searchRecursive = (term) => {
                if (term.label.toLowerCase().indexOf(query) !== -1) {
                    results.push(term);
                    if (results.length >= 100) return -1; // Limit results
                }
                if (term.children) {
                    for (let child of term.children) {
                        if (searchRecursive(child) === -1) return -1;
                    }
                }
            };

            for (let term of this.terms) {
                if (searchRecursive(term) === -1) break;
            }
            return results;
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FILE FIELD COMPONENT
 */
const FileFieldComponent = {
    template: "#create-post-file-field",
    props: {
        field: Object,
        mediaTarget: [Object, String],
        index: { type: Number, default: null },
        sortable: { type: Boolean, default: true },
        showLibrary: { type: Boolean, default: true },
        previewImages: { type: Boolean, default: true },
    },
    data() {
        return {
            accepts: "",
            dragActive: false,
            reordering: false,
        };
    },
    created() {
        if (this.field.value === null) this.field.value = [];
        if (this.field.props.allowedTypes) {
            this.accepts = Object.values(this.field.props.allowedTypes).join(", ");
        }
        this.$watch(
            () => this.field.value,
            () => { this.validate(this.field.value); },
            { deep: true }
        );
    },
    mounted() {
        jQuery(this.$refs.input).on("change", (e) => {
            for (let i = 0; i < e.target.files.length; i++) {
                let file = e.target.files[i];
                this.pushFile(file);
            }
            this.$refs.input.value = "";
            this.$emit("files-added");
        });
    },
    unmounted() {
        // Revoke object URLs to avoid memory leaks
        setTimeout(() => {
            Object.values(this.field.value).forEach((file) => {
                if (file.source === "new_upload") {
                    URL.revokeObjectURL(file.preview);
                }
            });
        }, 10);
    },
    methods: {
        getStyle(file) {
            return file.type.startsWith("image/") && this.previewImages
                ? `background-image: url('${file.preview}');`
                : "";
        },
        pushFile(file) {
            if (this.field.props.maxCount === 1) {
                this.field.value = [];
            }

            const newFile = {
                source: "new_upload",
                name: file.name,
                type: file.type,
                size: file.size,
                preview: URL.createObjectURL(file), // Generate preview URL
                item: file,
                _id: Voxel.helpers.randomId(8),
            };

            // Check global cache to avoid duplicates in current session
            if (typeof window._vx_file_upload_cache === "undefined") {
                window._vx_file_upload_cache = [];
            }

            const cached = window._vx_file_upload_cache.find(
                (f) =>
                    f.item.name === file.name &&
                    f.item.type === file.type &&
                    f.item.size === file.size &&
                    f.item.lastModified === file.lastModified
            );

            if (cached) {
                this.field.value.push(cached);
            } else {
                this.field.value.push(newFile);
                window._vx_file_upload_cache.unshift(newFile);
            }
        },
        onDrop(e) {
            this.dragActive = false;
            if (e.dataTransfer.items) {
                [...e.dataTransfer.items].forEach((item) => {
                    if (item.kind === "file") this.pushFile(item.getAsFile());
                });
            } else {
                [...e.dataTransfer.files].forEach((file) => {
                    this.pushFile(file);
                });
            }
            this.$emit("files-added");
        },
        onMediaPopupSave(files) {
            if (this.field.props.maxCount === 1) {
                this.field.value = [];
            }

            const existingIds = {};
            this.field.value.forEach((f) => {
                if (f.source === "existing") existingIds[f.id] = true;
                if (f.source === "new_upload") existingIds[f._id] = true;
            });

            Object.values(files).forEach((file) => {
                if (file.source === "existing" && !existingIds[file.id]) {
                    this.field.value.push(file);
                }
                if (file.source === "new_upload" && !existingIds[file._id]) {
                    this.field.value.push(file);
                }
            });
            this.$emit("files-added");
        },
        onSubmit(data, formData, prefix = null) {
            // Append files to FormData
            let name;
            if (Array.isArray(prefix) && prefix.length) {
                name = `files[${this.field.id}::row-${prefix.join(".")}][]`;
            } else {
                name = `files[${this.field.id}][]`;
            }

            data[this.field.key] = [];

            this.field.value.forEach((file) => {
                if (file.source === "new_upload") {
                    formData.append(name, file.item);
                    data[this.field.key].push("uploaded_file");
                } else if (file.source === "existing") {
                    data[this.field.key].push(file.id);
                }
            });
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                const isEmpty = !(Array.isArray(val) && val.length >= 1);
                const maxCount = this.field.props.maxCount;
                const maxSize = this.field.props.maxSize;
                const allowedTypes = this.field.props.allowedTypes;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (maxCount && val.length > maxCount) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("file:max"), { "@max": maxCount }));
                    }

                    if (maxSize) {
                        val.forEach((file) => {
                            if (
                                file.source === "new_upload" &&
                                file.size > maxSize * 1000
                            ) {
                                errors.push(
                                    this.$root.replace_vars(this.$root.get_error("file:size"), {
                                        "@filename": file.name,
                                        "@limit_kb": maxSize,
                                        "@limit_mb": maxSize / 1000,
                                    })
                                );
                            }
                        });
                    }

                    if (Array.isArray(allowedTypes) && allowedTypes.length) {
                        val.forEach((file) => {
                            if (!allowedTypes.includes(file.type)) {
                                errors.push(
                                    this.$root.replace_vars(this.$root.get_error("file:type"), {
                                        "@filename": file.name,
                                        "@filetype": file.type,
                                    })
                                );
                            }
                        });
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
};

/**
 * SELECT FIELD COMPONENT
 */
const SelectFieldComponent = {
    template: "#create-post-select-field",
    props: {
        field: Object,
        index: { type: Number, default: 0 },
    },
    data() {
        let map = {};
        this.field.props.choices.forEach((c) => (map[c.value] = c));
        return {
            value: this.field.value,
            choiceMap: map,
        };
    },
    created() {
        // Default value logic
        if (this.field.value !== null && !this.choiceMap[this.field.value]) {
            this.field.value = null;
            this.value = null;
        }

        if (this.value === null && this.field.required) {
            this.value = this.field.props.choices[0]?.value;
            this.saveValue();
        }

        this.$watch(
            () => this.field.value,
            () => this.validate(this.field.value)
        );
    },
    methods: {
        saveValue() {
            this.field.value = this.isFilled() ? this.value : null;
        },
        isFilled() {
            return this.value !== null && this.choiceMap[this.value];
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                const isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        },
    },
};

/**
 * MULTISELECT COMPONENT
 */
const MultiselectFieldComponent = {
    template: "#create-post-multiselect-field",
    props: {
        field: Object,
        index: { type: Number, default: 0 },
    },
    data() {
        let map = {};
        this.field.props.choices.forEach((c) => (map[c.value] = c));
        return {
            value: this.field.props.selected,
            choiceMap: map,
            displayValue: "",
            search: "",
        };
    },
    created() {
        this.$watch(
            () => this.field.value,
            () => this.validate(this.field.value)
        );
        this.displayValue = this._getDisplayValue();
    },
    methods: {
        selectChoice(choice) {
            if (this.value[choice.value]) {
                delete this.value[choice.value];
            } else {
                this.value[choice.value] = choice;
            }

            if (this.field.props.display_as === "inline") {
                this.saveValue();
            }
        },
        saveValue() {
            this.field.value = this.isFilled() ? Object.keys(this.value) : null;
            this.displayValue = this._getDisplayValue();
        },
        isFilled() {
            return Object.keys(this.value).length;
        },
        _getDisplayValue() {
            return Object.values(this.value)
                .sort((a, b) => a.order - b.order)
                .map((c) => c.label)
                .join(", ");
        },
        onSave() {
            this.saveValue();
            this.$refs.formGroup.$refs.popup.$emit("blur");
        },
        onClear() {
            this.value = {};
            this.search = "";
            this.$refs.searchInput?.focus();
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                const isEmpty = !(Array.isArray(val) && val.length);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        },
    },
    computed: {
        searchResults() {
            if (!this.search.trim().length) return false;
            let results = [];
            const query = this.search.trim().toLowerCase();

            for (const choice of this.field.props.choices) {
                if (choice.label.toLowerCase().indexOf(query) !== -1) {
                    results.push(choice);
                    if (results.length >= 100) break;
                }
            }
            return results;
        },
    },
};

/* ==========================================================================
   SECTION 3: MAIN APP INITIALIZATION
   ========================================================================== */

/**
 * Initialize Auth Widget
 * Scans document for .ts-auth elements and creates Vue instances
 */
window.render_auth = () => {
    Array.from(document.querySelectorAll(".ts-auth")).forEach((el) => {
        if (el.__vue_app__) return; // Already initialized

        const app = Vue.createApp({
            el: el,
            mixins: [Voxel.mixins.base, ConditionMixin],

            data() {
                return {
                    widget: "auth",
                    pending: false,
                    resendCodePending: false,
                    screen: null,
                    config: null,

                    // Login Form
                    login: {
                        username: null,
                        password: null,
                        remember: true,
                    },

                    // Recovery Form
                    recovery: {
                        email: null,
                        code: null,
                        password: null,
                        confirm_password: null,
                    },

                    // Registration Form
                    register: {
                        terms_agreed: false,
                    },

                    // Update Profile
                    update: {
                        password: {
                            current: null,
                            new: null,
                            confirm_new: null,
                            successful: false,
                        },
                        email: {
                            new: null,
                            code: null,
                            state: "send_code",
                        },
                    },

                    // Privacy Controls
                    privacy: {
                        export_data: { pending: false },
                        delete_account: {
                            pending: false,
                            password: "",
                            code: "",
                        },
                    },

                    // Two Factor Auth
                    twofa: {
                        qr_code: null,
                        verify_code: "",
                        disable_password: "",
                        backup_codes: [],
                    },

                    // Login with 2FA
                    login2fa: {
                        user_id: null,
                        session_token: null,
                        code: "",
                        use_backup: false,
                        trust_device: false,
                    },

                    confirmation_code: null,
                    activePopup: null,
                    activeRole: null,
                };
            },

            created() {
                this.config = JSON.parse(this.$options.el.dataset.config);
                this.screen = this.config.screen;

                // Setup registration roles
                if (this.config.registration.default_role) {
                    this.activeRole = this.config.registration.roles[this.config.registration.default_role];
                } else {
                    this.activeRole = Object.values(this.config.registration.roles)[0];
                }

                // Setup visibility conditions for role fields
                Object.values(this.config.registration.roles).forEach((role) => {
                    this.setupConditions(role.fields);
                });

                // Handle error parameters in URL (login options)
                const err = Voxel.getSearchParam("err");
                if (err && this.config.errors[err]) {
                    Voxel.alert(this.config.errors[err].message, "error");
                    Voxel.deleteSearchParam("err");
                }

                // Show container
                el.classList.remove("hidden");
            },

            methods: {
                /* -------------------------------------------------------------------------- */
                /*                                LOGIN METHODS                               */
                /* -------------------------------------------------------------------------- */

                submitLogin() {
                    this.recaptcha("vx_login", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.login",
                            data: {
                                username: this.login.username,
                                password: this.login.password,
                                remember: this.login.remember,
                                redirect_to: this.config.redirectUrl,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                if (response.requires_2fa) {
                                    this.login2fa.user_id = response.user_id;
                                    this.login2fa.session_token = response.session_token;
                                    this.login2fa.code = "";
                                    this.login2fa.use_backup = false;
                                    this.screen = "login_2fa_verify";
                                } else if (response.confirmed) {
                                    if (response.redirect_to === "{REDIRECT_URL}") {
                                        window.location.replace(this.config.redirectUrl);
                                    } else {
                                        window.location.replace(
                                            response.redirect_to.replace(
                                                "{REDIRECT_URL}",
                                                encodeURIComponent(this.config.redirectUrl)
                                            )
                                        );
                                    }
                                } else {
                                    this.screen = "login_confirm_account";
                                }
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                /* -------------------------------------------------------------------------- */
                /*                              RECOVERY METHODS                              */
                /* -------------------------------------------------------------------------- */

                submitRecover() {
                    this.recaptcha("vx_recover", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.recover",
                            data: {
                                email: this.recovery.email,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                this.screen = "recover_confirm";
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                submitRecoverConfirm() {
                    this.recaptcha("vx_recover_confirm", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.recover_confirm",
                            data: {
                                email: this.recovery.email,
                                code: this.recovery.code,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                this.screen = "recover_set_password";
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                submitNewPassword() {
                    this.recaptcha("vx_recover_set_password", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.recover_set_password",
                            data: {
                                email: this.recovery.email,
                                code: this.recovery.code,
                                password: this.recovery.password,
                                confirm_password: this.recovery.confirm_password,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                this.screen = "login";
                                // Reset form
                                this.login.username = this.recovery.email;
                                this.recovery.email = null;
                                this.recovery.code = null;
                                this.recovery.password = null;
                                this.recovery.confirm_password = null;
                                this.$refs.loginPassword?.focus();
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                /* -------------------------------------------------------------------------- */
                /*                            REGISTRATION METHODS                            */
                /* -------------------------------------------------------------------------- */

                submitRegister(args = {}) {
                    this.recaptcha("vx_register", (token) => {
                        this.pending = true;
                        var formData = this.getRegisterFormData(this.activeRole);

                        // Append standard fields
                        formData.append("username", this.register_username || "");
                        formData.append("email", this.register_email || "");
                        formData.append("password", this.register_password || "");
                        formData.append("terms_agreed", this.register.terms_agreed ? "yes" : "");
                        formData.append("_wpnonce", this.config.nonce);
                        formData.append("_recaptcha", token || "");
                        formData.append("role", this.activeRole.key);
                        formData.append("redirect_to", this.config.redirectUrl);

                        const planParam = Voxel.getSearchParam("plan");
                        if (planParam) formData.append("plan", planParam);

                        if (typeof args.onFormData === "function") {
                            args.onFormData(formData);
                        }

                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.register",
                            data: formData,
                            contentType: false,
                            processData: false,
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                if (response.verification_required) {
                                    this.screen = "confirm_account";
                                } else {
                                    this._handleRegisterRedirect(response);
                                }
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                submitConfirmRegistration() {
                    this.submitRegister({
                        onFormData: (fd) => fd.append("_confirmation_code", this.confirmation_code),
                    });
                },

                _handleRegisterRedirect(response) {
                    if (response.redirect_to === "{REDIRECT_URL}") {
                        window.location.replace(this.config.redirectUrl);
                    } else {
                        window.location.replace(
                            response.redirect_to.replace(
                                "{REDIRECT_URL}",
                                encodeURIComponent(this.config.redirectUrl)
                            )
                        );
                    }
                },

                registerResendConfirmationCode() {
                    this.recaptcha("vx_resend_confirmation_code", (token) => {
                        this.resendCodePending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.register.resend_confirmation_code",
                            data: {
                                username: this.register_username,
                                email: this.register_email,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.resendCodePending = false;
                            if (response.success) {
                                Voxel.alert(response.message, "info");
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                /* -------------------------------------------------------------------------- */
                /*                              PROFILE UPDATE                                */
                /* -------------------------------------------------------------------------- */

                submitUpdatePassword() {
                    this.recaptcha("vx_update_password", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.update_password",
                            data: {
                                current: this.update.password.current,
                                new: this.update.password.new,
                                confirm_new: this.update.password.confirm_new,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                this.update.password.successful = true;
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                submitUpdateEmail() {
                    this.recaptcha("vx_update_email", (token) => {
                        this.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.update_email",
                            data: {
                                new: this.update.email.new,
                                code: this.update.email.code,
                                state: this.update.email.state,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.pending = false;
                            if (response.success) {
                                this.update.email.state = response.state;
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                requestPersonalData() {
                    this.recaptcha("vx_request_personal_data", (token) => {
                        this.privacy.export_data.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.request_personal_data",
                            data: {
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                            },
                        }).always((response) => {
                            this.privacy.export_data.pending = false;
                            if (response.success) {
                                Voxel.alert(response.message, "success");
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                deleteAccountPermanently(confirmed = false) {
                    const action = confirmed ? "vx_delete_account_permanently" : "vx_delete_account";
                    this.recaptcha(action, (token) => {
                        this.privacy.delete_account.pending = true;
                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&action=auth.delete_account_permanently",
                            data: {
                                password: this.privacy.delete_account.password,
                                _wpnonce: this.config.nonce,
                                _recaptcha: token,
                                confirmation_code: this.privacy.delete_account.code,
                                confirmed: confirmed ? "yes" : "",
                            },
                        }).always((response) => {
                            this.privacy.delete_account.pending = false;
                            if (response.success) {
                                if (confirmed) {
                                    location.reload();
                                } else {
                                    this.privacy.delete_account.code = response.confirmation_code;
                                    this.screen = "security_delete_account_confirm";
                                }
                            } else {
                                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    });
                },

                /* -------------------------------------------------------------------------- */
                /*                               HELPER METHODS                               */
                /* -------------------------------------------------------------------------- */

                recaptcha(action, callback) {
                    if (this.config.recaptcha.enabled) {
                        grecaptcha.ready(() => {
                            grecaptcha
                                .execute(this.config.recaptcha.key, { action: action })
                                .then((token) => callback(token));
                        });
                    } else {
                        callback(null);
                    }
                },

                canRegister() {
                    return Object.keys(this.config.registration.roles).length;
                },

                getRegisterFormData(role) {
                    var formData = new FormData();
                    var postdata = {};

                    Object.values(role.fields).forEach((field) => {
                        // Ignore auth fields as they are handled separately
                        if (field.source !== "auth" && this.conditionsPass(field)) {

                            if (["file", "image", "profile-avatar"].includes(field.type)) {
                                postdata[field.key] = [];
                                field.value.forEach((file) => {
                                    if (file.source === "new_upload") {
                                        formData.append(`files[${field.id}][]`, file.item);
                                        postdata[field.key].push("uploaded_file");
                                    }
                                });
                            } else if (field.value !== null) {
                                postdata[field.key] = field.value;
                            }
                        }
                    });

                    formData.append("postdata", JSON.stringify(postdata));
                    return formData;
                },

                shouldValidate(field) {
                    return false; // Auth forms generally don't validate eagerly on load
                },

                /* -------------------------------------------------------------------------- */
                /*                              2FA METHODS                                   */
                /* -------------------------------------------------------------------------- */

                setup2fa() {
                    this.pending = true;
                    jQuery.post({
                        url: Voxel_Config.ajax_url + "&action=auth.2fa_setup",
                        data: { _wpnonce: this.config.nonce },
                    }).always((response) => {
                        this.pending = false;
                        if (response.success) {
                            this.twofa.qr_code = response.qr_code;
                            this.twofa.verify_code = "";
                            this.screen = "security_2fa_setup";
                        } else {
                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                        }
                    });
                },

                submit2faSetup() {
                    this.pending = true;
                    jQuery.post({
                        url: Voxel_Config.ajax_url + "&action=auth.2fa_enable",
                        data: { code: this.twofa.verify_code, _wpnonce: this.config.nonce },
                    }).always((response) => {
                        this.pending = false;
                        if (response.success) {
                            this.twofa.backup_codes = response.backup_codes;
                            this.config.twofa.enabled = true;
                            this.config.twofa.backup_codes_count = response.backup_codes.length;
                            this.screen = "security_2fa_backup_codes";
                            Voxel.alert(this.config.l10n.twofa_enabled, "success");
                        } else {
                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                        }
                    });
                },

                disable2fa() {
                    Voxel.prompt(
                        this.config.l10n.twofa_disable_confirm,
                        "warning",
                        [
                            {
                                label: Voxel_Config.l10n.yes,
                                onClick: () => {
                                    this.pending = true;
                                    jQuery.post({
                                        url: Voxel_Config.ajax_url + "&action=auth.2fa_disable",
                                        data: {
                                            password: this.twofa.disable_password,
                                            _wpnonce: this.config.nonce,
                                        },
                                    }).always((response) => {
                                        this.pending = false;
                                        if (response.success) {
                                            this.config.twofa.enabled = false;
                                            this.config.twofa.backup_codes_count = 0;
                                            this.twofa.disable_password = "";
                                            this.screen = "security";
                                            Voxel.alert(this.config.l10n.twofa_disabled, "success");
                                        } else {
                                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                                        }
                                    });
                                },
                            },
                            { label: Voxel_Config.l10n.no, onClick: () => { } },
                        ],
                        7500
                    );
                },

                regenerateBackupCodes() {
                    Voxel.prompt(
                        this.config.l10n.twofa_regenerate_backups_confirm,
                        "warning",
                        [
                            {
                                label: Voxel_Config.l10n.yes,
                                onClick: () => {
                                    this.pending = true;
                                    jQuery.post({
                                        url: Voxel_Config.ajax_url + "&action=auth.2fa_regenerate_backups",
                                        data: { _wpnonce: this.config.nonce },
                                    }).always((response) => {
                                        this.pending = false;
                                        if (response.success) {
                                            this.twofa.backup_codes = response.backup_codes;
                                            this.config.twofa.backup_codes_count = response.backup_codes.length;
                                            this.screen = "security_2fa_backup_codes";
                                            Voxel.alert(this.config.l10n.twofa_backups_generated, "success");
                                        } else {
                                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                                        }
                                    });
                                },
                            },
                            { label: Voxel_Config.l10n.no, onClick: () => { } },
                        ],
                        7500
                    );
                },

                removeAllTrustedDevices() {
                    Voxel.prompt(
                        this.config.l10n.twofa_remove_trusted_devices_confirm,
                        "warning",
                        [
                            {
                                label: Voxel_Config.l10n.yes,
                                onClick: () => {
                                    this.pending = true;
                                    jQuery.post({
                                        url: Voxel_Config.ajax_url + "&action=auth.2fa_remove_trusted_devices",
                                        data: { _wpnonce: this.config.nonce },
                                    }).always((response) => {
                                        this.pending = false;
                                        if (response.success) {
                                            this.config.twofa.trusted_devices_count = 0;
                                            Voxel.alert(this.config.l10n.twofa_trusted_devices_removed, "success");
                                        } else {
                                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                                        }
                                    });
                                },
                            },
                            { label: Voxel_Config.l10n.no, onClick: () => { } },
                        ],
                        7500
                    );
                },

                submit2faVerification() {
                    this.pending = true;
                    jQuery.post({
                        url: Voxel_Config.ajax_url + "&action=auth.verify_2fa",
                        data: {
                            user_id: this.login2fa.user_id,
                            session_token: this.login2fa.session_token,
                            code: this.login2fa.code,
                            use_backup: this.login2fa.use_backup ? "yes" : "no",
                            trust_device: this.login2fa.trust_device ? "yes" : "no",
                            remember: this.login.remember ? "yes" : "no",
                            redirect_to: this.config.redirectUrl,
                            _wpnonce: this.config.nonce,
                        },
                    }).always((response) => {
                        this.pending = false;
                        if (response.success) {
                            if (response.redirect_to === "{REDIRECT_URL}") {
                                window.location.replace(this.config.redirectUrl);
                            } else {
                                window.location.replace(
                                    response.redirect_to.replace(
                                        "{REDIRECT_URL}",
                                        encodeURIComponent(this.config.redirectUrl)
                                    )
                                );
                            }
                        } else {
                            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                        }
                    });
                },

                copyBackupCodes() {
                    const codes = this.twofa.backup_codes.join("\n");
                    Voxel.copy(codes);
                },
            },

            watch: {
                screen(val) {
                    if (val === "security_2fa_setup" && !this.twofa.qr_code) {
                        this.setup2fa();
                    }
                },
                confirmation_code(val) {
                    if (val && val.length === 5 && !this.pending) {
                        this.submitConfirmRegistration();
                    }
                },
            },

            computed: {
                register_username() {
                    return this.activeRole?.fields["voxel:auth-username"]?.value || null;
                },
                register_email() {
                    return this.activeRole?.fields["voxel:auth-email"]?.value;
                },
                register_password() {
                    return this.activeRole?.fields["voxel:auth-password"]?.value;
                },
            },
        });

        // Register components
        app.component("form-popup", Voxel.components.popup);
        app.component("form-group", Voxel.components.formGroup);

        // These component templates are defined in a var `a`, `r`, `s`, `o`... need to match them to their component names
        // Based on the minified code:
        // a = date field template, t.component("date-field", a)
        // r = taxonomy field template, t.component("taxonomy-field", r)
        // s = term list template, t.component("term-list", s)
        // o = file field template, t.component("file-field", o)
        // l = select field template, t.component("select-field", l)
        // n = multiselect field template, t.component("multiselect-field", n)

        app.component("date-field", DateFieldComponent);
        app.component("taxonomy-field", TaxonomyFieldComponent);
        app.component("term-list", TermListComponent);
        app.component("file-field", FileFieldComponent);
        app.component("select-field", SelectFieldComponent);
        app.component("multiselect-field", MultiselectFieldComponent);

        app.mount(el);
    });
};

/* ==========================================================================
   SECTION 4: INITIALIZATION HANDLERS
   ========================================================================== */

// Initial render
window.render_auth();

// Re-render on Voxel markup update (e.g. AJAX page loads)
jQuery(document).on("voxel:markup-update", window.render_auth);
