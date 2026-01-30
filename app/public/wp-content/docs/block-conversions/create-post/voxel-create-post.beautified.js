/**
 * ============================================================================
 * VOXEL CREATE POST WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/create-post.js
 * Size: ~69KB
 * Beautified: December 2025 (Revision 2 - Full Logic)
 *
 * PURPOSE:
 * The frontend submission form module (Create Post / Edit Post).
 * Handles all field types, validation, multi-step navigation, draft saving,
 * and post submission.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/create-post/frontend.tsx
 *
 * NAMESPACE: window.render_create_post
 *
 * DEPENDENCIES:
 * - Vue 3
 * - Pikaday
 * - TinyMCE (via wp.oldEditor)
 * - Voxel Maps
 * - jQuery
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "post_type": {
 *     "key": "post_type_key",
 *     "label": "Post Type Name",
 *     "fields": {
 *       "title": {
 *         "id": "title",
 *         "key": "title",
 *         "type": "title",
 *         "label": "Title",
 *         "placeholder": "Enter title...",
 *         "required": true,
 *         "step": "step_1",
 *         "in_repeater": false,
 *         "value": "",
 *         "props": {
 *           "minlength": 3,
 *           "maxlength": 100
 *         },
 *         "validation": {
 *           "errors": []
 *         },
 *         "conditions": [
 *           {
 *             "type": "text:not_empty",
 *             "source": "other_field_key",
 *             "value": "expected_value"
 *           }
 *         ]
 *       },
 *       "description": {
 *         "id": "description",
 *         "key": "description",
 *         "type": "texteditor",
 *         "label": "Description",
 *         "required": false,
 *         "step": "step_1",
 *         "value": "",
 *         "props": {
 *           "minlength": 10,
 *           "maxlength": 5000,
 *           "editorType": "wp-editor" | "plain-text",
 *           "editorId": "description_editor",
 *           "editorConfig": {
 *             "textarea_name": "description",
 *             "tinymce": {
 *               "toolbar1": "formatselect,bold,italic,bullist,numlist,link",
 *               "toolbar2": "",
 *               "setup": "function(editor) { ... }"
 *             },
 *             "quicktags": true,
 *             "mediaButtons": false
 *           }
 *         }
 *       },
 *       "price": {
 *         "id": "price",
 *         "key": "price",
 *         "type": "number",
 *         "label": "Price",
 *         "required": true,
 *         "step": "step_2",
 *         "value": null,
 *         "props": {
 *           "min": 0,
 *           "max": 10000,
 *           "step": 0.01,
 *           "precision": 2
 *         }
 *       },
 *       "email": {
 *         "id": "email",
 *         "key": "email",
 *         "type": "email",
 *         "label": "Email",
 *         "required": true,
 *         "step": "step_1",
 *         "value": ""
 *       },
 *       "website": {
 *         "id": "website",
 *         "key": "website",
 *         "type": "url",
 *         "label": "Website",
 *         "required": false,
 *         "step": "step_1",
 *         "value": ""
 *       },
 *       "gallery": {
 *         "id": "gallery",
 *         "key": "gallery",
 *         "type": "file",
 *         "label": "Gallery",
 *         "required": false,
 *         "step": "step_2",
 *         "value": [],
 *         "props": {
 *           "maxCount": 10,
 *           "maxSize": 5000,
 *           "allowedTypes": ["image/jpeg", "image/png", "image/webp"]
 *         }
 *       },
 *       "location": {
 *         "id": "location",
 *         "key": "location",
 *         "type": "location",
 *         "label": "Location",
 *         "required": false,
 *         "step": "step_1",
 *         "value": {
 *           "address": "",
 *           "latitude": null,
 *           "longitude": null,
 *           "map_picker": true
 *         },
 *         "props": {
 *           "default_zoom": 12
 *         }
 *       },
 *       "category": {
 *         "id": "category",
 *         "key": "category",
 *         "type": "taxonomy",
 *         "label": "Category",
 *         "required": true,
 *         "step": "step_1",
 *         "value": [],
 *         "props": {
 *           "taxonomy": {
 *             "key": "category",
 *             "label": "Categories"
 *           },
 *           "multiple": true,
 *           "terms": [
 *             {
 *               "id": 1,
 *               "slug": "category-slug",
 *               "label": "Category Name",
 *               "depth": 0,
 *               "parentRef": null,
 *               "children": []
 *             }
 *           ]
 *         }
 *       },
 *       "availability": {
 *         "id": "availability",
 *         "key": "availability",
 *         "type": "date",
 *         "label": "Available From",
 *         "required": false,
 *         "step": "step_2",
 *         "value": null,
 *         "props": {
 *           "mode": "single" | "range",
 *           "format": "Y-m-d"
 *         }
 *       },
 *       "features": {
 *         "id": "features",
 *         "key": "features",
 *         "type": "select",
 *         "label": "Features",
 *         "required": false,
 *         "step": "step_2",
 *         "value": null,
 *         "props": {
 *           "multiple": true,
 *           "choices": {
 *             "wifi": { "value": "wifi", "label": "WiFi" },
 *             "parking": { "value": "parking", "label": "Parking" }
 *           }
 *         }
 *       },
 *       "phone": {
 *         "id": "phone",
 *         "key": "phone",
 *         "type": "phone",
 *         "label": "Phone",
 *         "required": false,
 *         "step": "step_1",
 *         "value": ""
 *       },
 *       "terms_agree": {
 *         "id": "terms_agree",
 *         "key": "terms_agree",
 *         "type": "switcher",
 *         "label": "I agree to the terms",
 *         "required": true,
 *         "step": "step_3",
 *         "value": false
 *       },
 *       "work_hours": {
 *         "id": "work_hours",
 *         "key": "work_hours",
 *         "type": "work-hours",
 *         "label": "Working Hours",
 *         "required": false,
 *         "step": "step_2",
 *         "value": {
 *           "mon": { "enabled": true, "hours": [{ "from": "09:00", "to": "17:00" }] },
 *           "tue": { "enabled": true, "hours": [{ "from": "09:00", "to": "17:00" }] }
 *         }
 *       },
 *       "repeater_field": {
 *         "id": "repeater_field",
 *         "key": "repeater_field",
 *         "type": "repeater",
 *         "label": "Team Members",
 *         "required": false,
 *         "step": "step_2",
 *         "value": [],
 *         "props": {
 *           "min_rows": 0,
 *           "max_rows": 10,
 *           "fields": {
 *             "name": {
 *               "type": "text",
 *               "label": "Name",
 *               "in_repeater": true
 *             },
 *             "role": {
 *               "type": "text",
 *               "label": "Role",
 *               "in_repeater": true
 *             }
 *           }
 *         }
 *       },
 *       "ui_step": {
 *         "id": "ui_step",
 *         "key": "ui_step",
 *         "type": "ui-step",
 *         "label": "Step 1",
 *         "step": "step_1"
 *       },
 *       "ui_heading": {
 *         "id": "ui_heading",
 *         "key": "ui_heading",
 *         "type": "ui-heading",
 *         "label": "Section Title",
 *         "step": "step_1"
 *       }
 *     },
 *     "steps": ["step_1", "step_2", "step_3"],
 *     "errors": {
 *       "required": "This field is required",
 *       "text:minlength": "Minimum @minlength characters required",
 *       "text:maxlength": "Maximum @maxlength characters allowed",
 *       "text:pattern": "Invalid format",
 *       "number:min": "Minimum value is @min",
 *       "number:max": "Maximum value is @max",
 *       "email:invalid": "Invalid email address",
 *       "url:invalid": "Invalid URL",
 *       "file:max": "Maximum @max files allowed",
 *       "file:size": "@filename exceeds size limit (@limit_mb MB)",
 *       "file:type": "@filename has invalid type (@filetype)"
 *     }
 *   },
 *   "post": {
 *     "id": 123,
 *     "title": "Existing Post Title",
 *     "status": "publish" | "draft" | "pending"
 *   },
 *   "is_admin_mode": false,
 *   "admin_mode_nonce": null,
 *   "autocomplete": {
 *     "types": ["geocode"],
 *     "componentRestrictions": { "country": "us" }
 *   }
 * }
 *
 * FILE VALUE FORMAT (in field.value for file fields):
 * [
 *   {
 *     "source": "existing",
 *     "id": 456,
 *     "name": "image.jpg",
 *     "type": "image/jpeg",
 *     "size": 102400,
 *     "preview": "https://example.com/wp-content/uploads/image.jpg"
 *   },
 *   {
 *     "source": "new_upload",
 *     "_id": "abc12345",
 *     "name": "new-image.png",
 *     "type": "image/png",
 *     "size": 204800,
 *     "preview": "blob:http://example.com/...",
 *     "item": File
 *   }
 * ]
 */

/* ==========================================================================
   SECTION 1: MEDIA LIBRARY POPUP
   ========================================================================== */

const MediaPopup = {
    template: "#create-post-media-popup",
    props: {
        multiple: { type: Boolean, default: true },
        ignore: { type: Array, default: [] },
        customTarget: [Object, String],
        saveLabel: String,
    },
    emits: ["save", "blur", "open"],
    data() {
        return {
            files: [],
            selected: {},
            active: false,
            loading: true,
            has_more: false,
            firstLoad: true,
            search: {
                term: "",
                offset: 0,
                loading: false,
                loading_more: false,
                has_more: false,
                list: null,
            },
        };
    },
    methods: {
        getStyle(file) {
            return file.type.startsWith("image/")
                ? `background-image: url('${file.preview}');`
                : "";
        },
        selectFile(file) {
            if (this.selected[file.id]) {
                delete this.selected[file.id];
            } else {
                if (!this.multiple) this.selected = {};
                this.selected[file.id] = file;
            }
        },
        selectSessionFile(file) {
            if (this.selected[file._id]) {
                delete this.selected[file._id];
            } else {
                if (!this.multiple) this.selected = {};
                this.selected[file._id] = file;
            }
        },
        loadMedia() {
            jQuery
                .get(Voxel_Config.ajax_url + "&action=list_media", {
                    offset: this.files.length,
                })
                .always((res) => {
                    this.loading = false;
                    if (res.success) {
                        this.files.push(...res.data);
                        this.has_more = res.has_more;
                    } else {
                        Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                    }
                });
        },
        loadMore() {
            this.loading = true;
            this.loadMedia();
        },
        openLibrary() {
            this.$emit("open");
            if (this.firstLoad) this.loadMedia();
            this.firstLoad = false;
            this.active = !this.active;
        },
        isImage(file) {
            return file.type.startsWith("image/");
        },
        save() {
            this.active = false;
            this.$emit("save", this.selected);
            this.selected = {};
        },
        clear() {
            this.selected = {};
        },
        clientSearchFiles() {
            let term = this.search.term.trim().toLowerCase();
            let list = [];
            let full = false;
            this.files.forEach((file) => {
                if (!full && file.name.toLowerCase().indexOf(term) !== -1) {
                    list.push(file);
                    full = list.length >= 10;
                }
            });
            this.search.list = list;
            this.search.loading = false;
            this.search.has_more = false;
            this.search.loading_more = false;
        },
        serverSearchFiles: Voxel.helpers.debounce(function (vm, loadMore = false) {
            jQuery
                .get(Voxel_Config.ajax_url + "&action=list_media", {
                    offset: loadMore ? vm.search.list.length : 0,
                    search: vm.search.term.trim(),
                })
                .always((res) => {
                    vm.search.loading = false;
                    vm.search.loading_more = false;
                    if (res.success) {
                        if (loadMore) {
                            vm.search.list.push(...res.data);
                        } else {
                            vm.search.list = res.data;
                        }
                        vm.search.has_more = res.has_more;
                    } else {
                        Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                    }
                });
        }),
        sessionFiles() {
            if (!Array.isArray(window._vx_file_upload_cache)) {
                window._vx_file_upload_cache = [];
            }
            return window._vx_file_upload_cache.reverse();
        },
    },
    watch: {
        "search.term"() {
            if (this.search.term.trim() && this.files) {
                this.search.loading = true;
                if (!this.has_more || this.search.term.trim().length <= 2) {
                    this.clientSearchFiles();
                } else {
                    this.serverSearchFiles(this);
                }
            }
        },
    },
};

/* ==========================================================================
   SECTION 2: FIELD COMPONENTS
   ========================================================================== */

/**
 * FIELD: TITLE
 */
const FieldTitle = {
    template: "#create-post-title-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);
                let min = this.field.props.minlength;
                let max = this.field.props.maxlength;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && val.length < min) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("text:minlength"), { "@minlength": min }));
                    }
                    if (max && val.length > max) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("text:maxlength"), { "@maxlength": max }));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: TEXT
 */
const FieldText = {
    template: "#create-post-text-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);
                let min = this.field.props.minlength;
                let max = this.field.props.maxlength;
                let pattern = this.field.props.pattern;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && val.length < min) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("text:minlength"), { "@minlength": min }));
                    }
                    if (max && val.length > max) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("text:maxlength"), { "@maxlength": max }));
                    }
                    if (typeof pattern === 'string' && pattern.trim().length && !(new RegExp('^' + pattern.trim() + '$').test(val))) {
                        errors.push(this.$root.get_error("text:pattern"));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: TEXT EDITOR
 */
const FieldTextEditor = {
    template: "#create-post-texteditor-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        return {
            editor: {
                id: this.field.props.editorId,
                config: JSON.parse(JSON.stringify(this.field.props.editorConfig)),
            },
        };
    },
    created() {
        if (this.field.in_repeater && this.field.props.editorType !== "plain-text") {
            this.editor.id += this.index;
            this.editor.config.textarea_name += this.index;
        }
        if (
            this.field.props.editorType !== "plain-text" &&
            typeof this.field.value === "string"
        ) {
            this.field.value = this.field.value.replaceAll("<!--_more-->", "<!--more-->");
        }
    },
    mounted() {
        this.renderEditor();
    },
    unmounted() {
        if (window.wp?.oldEditor) {
            window.wp.oldEditor.remove(this.editor.id);
        }
    },
    methods: {
        renderEditor() {
            if (this.field.props.editorType !== "plain-text") {
                if (this.field.step === this.$root.currentStep.key) {
                    this.$refs.editor.innerHTML = this.field.value;
                    jQuery(() => {
                        wp.oldEditor.remove(this.editor.id);
                        wp.oldEditor.initialize(this.editor.id, this.editor.config);
                        let editor = tinyMCE.editors[this.editor.id];
                        editor.on("change", (e) => (this.field.value = e.target.getContent()));
                        editor.on("keyup", () => editor.save());
                        editor.on("input", () => editor.save());
                    });
                }
            }
            if (this.field.props.editorType === "plain-text") {
                this.$nextTick(() => this.resizeComposer());
            }
        },
        resizeComposer() {
            if (this.$refs.composer) {
                this.$refs._composer.value = this.$refs.composer.value;
                this.$refs._composer.style.width = this.$refs.composer.scrollWidth + "px";
                this.$refs._composer.style.minWidth = this.$refs.composer.scrollWidth + "px";
                this.$refs._composer.style.maxWidth = this.$refs.composer.scrollWidth + "px";
                this.$refs.composer.style.height = this.$refs._composer.scrollHeight + "px";
            }
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);
                let min = this.field.props.minlength;
                let max = this.field.props.maxlength;
                let isPlainText = this.field.props.editorType === "plain-text";

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    let content = val;
                    if (!isPlainText) {
                        let div = document.createElement("div");
                        div.innerHTML = val;
                        content = div.innerText; // stripped text
                        div.remove();
                    }
                    if (min && content.length < min) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("text:minlength"), { "@minlength": min }));
                    }
                    if (max && content.length > max) {
                        errors.push(content.length + "/" + max); // Generic max length error
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    computed: {
        content_length() {
            let val = this.field.value;
            if (typeof val !== "string") return 0;
            if (this.field.props.editorType !== "plain-text") {
                let div = document.createElement("div");
                div.innerHTML = val;
                val = div.innerText;
                div.remove();
            }
            return val.length;
        },
    },
    watch: {
        "$root.currentStep"() {
            this.renderEditor();
        },
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: DESCRIPTION (Extends editor)
 */
const FieldDescription = {
    template: "#create-post-texteditor-field",
    extends: FieldTextEditor
};

/**
 * FIELD: NUMBER
 */
const FieldNumber = {
    template: "#create-post-number-field",
    props: { field: Object },
    created() {
        let val = parseFloat(this.field.value);
        if (!isNaN(val)) this.field.value = val;
    },
    methods: {
        increment() {
            if (typeof this.field.value !== "number") {
                let min = typeof this.field.props.min === "number" ? this.field.props.min : 0;
                let step = typeof this.field.props.step === "number" ? this.field.props.step : 1;
                this.setValue(min === 0 ? step : min);
            } else {
                this.setValue(this.field.value + this.field.props.step);
            }
        },
        decrement() {
            if (typeof this.field.value !== "number") {
                this.setValue(this.field.props.min);
            } else {
                this.setValue(this.field.value - this.field.props.step);
            }
        },
        setValue(val) {
            if (val === "" || typeof val !== "number") {
                this.field.value = null;
            } else if (val < this.field.props.min) {
                this.field.value = this.field.props.min;
            } else if (val > this.field.props.max) {
                this.field.value = this.field.props.max;
            } else {
                this.field.value = Number(val.toFixed(this.field.props.precision));
            }
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "number");
                let min = this.field.props.min;
                let max = this.field.props.max;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && val < min) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("number:min"), { "@min": min }));
                    }
                    if (max && val > max) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("number:max"), { "@max": max }));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: EMAIL
 */
const FieldEmail = {
    template: "#create-post-email-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (!/^\S+@\S+\.\S+$/.test(val)) {
                        errors.push(this.$root.get_error("email:invalid"));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: URL
 */
const FieldUrl = {
    template: "#create-post-url-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    let url = val;
                    if (url.indexOf('.') >= 1 && !url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "https://" + url;
                    }
                    try {
                        new URL(url);
                    } catch (e) {
                        errors.push(this.$root.get_error("url:invalid"));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
    },
    watch: {
        "field.value"() {
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: FILE
 */
const FieldFile = {
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
            () => {
                this.validate(this.field.value);
            },
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
            if (this.field.props.maxCount === 1) this.field.value = [];

            let fileObj = {
                source: "new_upload",
                name: file.name,
                type: file.type,
                size: file.size,
                preview: URL.createObjectURL(file),
                item: file,
                _id: Voxel.helpers.randomId(8),
            };

            if (!window._vx_file_upload_cache) window._vx_file_upload_cache = [];
            let existing = window._vx_file_upload_cache.find(
                (e) =>
                    e.item.name === file.name &&
                    e.item.type === file.type &&
                    e.item.size === file.size &&
                    e.item.lastModified === file.lastModified
            );

            if (existing) {
                this.field.value.push(existing);
            } else {
                this.field.value.push(fileObj);
                window._vx_file_upload_cache.unshift(fileObj);
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
            if (this.field.props.maxCount === 1) this.field.value = [];
            let added = {};
            this.field.value.forEach((file) => {
                if (file.source === "existing") added[file.id] = true;
                if (file.source === "new_upload") added[file._id] = true;
            });

            Object.values(files).forEach((file) => {
                if (file.source === "existing" && !added[file.id]) this.field.value.push(file);
                if (file.source === "new_upload" && !added[file._id]) this.field.value.push(file);
            });
            this.$emit("files-added");
        },
        onSubmit(data, formData, path = null) {
            let key;
            if (Array.isArray(path) && path.length) {
                key = `files[${this.field.id}::row-${path.join(".")}][]`;
            } else {
                key = `files[${this.field.id}][]`;
            }

            data[this.field.key] = [];
            this.field.value.forEach(file => {
                if (file.source === 'new_upload') {
                    formData.append(key, file.item);
                    data[this.field.key].push('uploaded_file');
                } else if (file.source === 'existing') {
                    data[this.field.key].push(file.id);
                }
            });
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(Array.isArray(val) && val.length >= 1);
                let maxCount = this.field.props.maxCount;
                let maxSize = this.field.props.maxSize;
                let allowedTypes = this.field.props.allowedTypes;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (maxCount && val.length > maxCount) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("file:max"), { "@max": maxCount }));
                    }
                    if (maxSize) {
                        val.forEach(file => {
                            if (file.source === 'new_upload' && file.size > (maxSize * 1000)) {
                                errors.push(this.$root.replace_vars(this.$root.get_error("file:size"), {
                                    "@filename": file.name,
                                    "@limit_kb": maxSize,
                                    "@limit_mb": maxSize / 1000
                                }));
                            }
                        });
                    }
                    if (Array.isArray(allowedTypes) && allowedTypes.length) {
                        val.forEach(file => {
                            if (!allowedTypes.includes(file.type)) {
                                errors.push(this.$root.replace_vars(this.$root.get_error("file:type"), {
                                    "@filename": file.name,
                                    "@filetype": file.type
                                }));
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
 * FIELD: PHONE
 */
const FieldPhone = {
    template: "#create-post-phone-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === 'string' && val.trim().length >= 1);
                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: SWITCHER
 */
const FieldSwitcher = {
    template: "#create-post-switcher-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        return {
            switcherId: `_switch-${this.field.id}:` + this.index
        };
    },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(val === true);
                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: LOCATION
 */
const FieldLocation = {
    template: "#create-post-location-field",
    props: { field: Object },
    data() {
        return { map: null };
    },
    mounted() {
        Voxel.Maps.await(() => {
            new Voxel.Maps.Autocomplete(
                this.$refs.addressInput,
                (result) => {
                    if (result) {
                        this.field.value.address = result.address;
                        this.field.value.latitude = result.latlng.getLatitude();
                        this.field.value.longitude = result.latlng.getLongitude();
                        if (this.map) this.map.fitBounds(result.viewport);
                    } else {
                        this.field.value.address = this.$refs.addressInput.value;
                    }
                },
                this.$root.config.autocomplete
            );

            if (this.field.value.map_picker) {
                this.$nextTick(() => this.setupMap());
            }
        });
    },
    methods: {
        setupMap() {
            if (this.map) return;
            Voxel.Maps.await(() => {
                this.map = new Voxel.Maps.Map({
                    el: this.$refs.mapDiv,
                    zoom: this.field.props.default_zoom,
                });
                this.marker = new Voxel.Maps.Marker({
                    template: this.$refs.marker.innerHTML,
                });

                let pos = this.getMarkerPosition();
                if (pos) {
                    this.map.setCenter(pos);
                    this.marker.setPosition(pos);
                    this.marker.setMap(this.map);
                }

                this.map.addListener("click", (e) => {
                    let latlng = this.map.getClickPosition(e);
                    if (!this.marker.getPosition()) {
                        this.marker.setPosition(latlng);
                        this.marker.setMap(this.map);
                    }
                    this.field.value.latitude = latlng.getLatitude();
                    this.field.value.longitude = latlng.getLongitude();

                    Voxel.Maps.getGeocoder().geocode(latlng.toGeocoderFormat(), (result) => {
                        this.field.value.address = result.address;
                    });
                });
            });
        },
        getMarkerPosition() {
            if (typeof this.field.value.latitude !== 'number' || typeof this.field.value.longitude !== 'number') return null;
            return new Voxel.Maps.LatLng(this.field.value.latitude, this.field.value.longitude);
        },
        geolocate() {
            Voxel.Maps.getGeocoder().getUserLocation({
                fetchAddress: true,
                receivedPosition: (pos) => {
                    this.field.value.latitude = pos.getLatitude();
                    this.field.value.longitude = pos.getLongitude();
                },
                receivedAddress: (res) => {
                    this.field.value.address = res.address;
                    if (this.map) this.map.fitBounds(res.viewport);
                },
                positionFail: () => Voxel.alert(Voxel_Config.l10n.positionFail, "error"),
                addressFail: () => Voxel.alert(Voxel_Config.l10n.addressFail, "error"),
            });
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === 'object' && typeof val.address === 'string' && val.address.length >= 1 && typeof val.latitude === 'number' && typeof val.longitude === 'number');

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (val.latitude < -90 || val.latitude > 90) errors.push(this.$root.get_error("location:invalid_position"));
                    if (val.longitude < -180 || val.longitude > 180) errors.push(this.$root.get_error("location:invalid_position"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "field.value.address"() { this.validate(this.field.value); },
        "field.value.map_picker"() { this.$nextTick(() => this.setupMap()); },
        "field.value.latitude"() {
            this.marker?.setPosition(this.getMarkerPosition());
            this.validate(this.field.value);
        },
        "field.value.longitude"() {
            this.marker?.setPosition(this.getMarkerPosition());
            this.validate(this.field.value);
        },
    },
};

/**
 * FIELD: WORK HOURS
 */
const FieldWorkHours = {
    template: "#create-post-work-hours-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() { return {}; },
    methods: {
        addGroup() {
            this.field.value.push({ days: [], status: "hours", hours: [] });
        },
        removeGroup(group) {
            this.field.value.splice(this.field.value.indexOf(group), 1);
        },
        removeHours(slot, group) {
            group.hours.splice(group.hours.indexOf(slot), 1);
        },
        addHours(group) {
            group.hours.push({ from: "09:00", to: "17:00" });
        },
        displayDays(days) {
            return days.map(d => this.field.props.weekdays[d]).filter(Boolean).join(", ");
        },
        displayTime(time) {
            // Format time string (e.g., "09:00") to locale time format
            return new Date("2021-01-01 " + time)
                .toLocaleTimeString()
                .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
        },
        id() {
            return this.field.id + "." + Object.values(arguments).join(".") + "." + this.index;
        },
        isChecked(day, list) {
            return list.includes(day);
        },
        check(day, list) {
            list.includes(day) ? list.splice(list.indexOf(day), 1) : list.push(day);
        },
        isDayAvailable(day, group) {
            return group.days.includes(day) || this.unusedDays.includes(day);
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = true;
                if (Array.isArray(val)) {
                    for (let group of val) {
                        if (group.days.length) {
                            if (["open", "closed", "appointments_only"].includes(group.status)) {
                                isEmpty = false; break;
                            }
                            if (group.status === "hours" && group.hours.length) {
                                for (let slot of group.hours) {
                                    if (typeof slot.from === 'string' && slot.from.length && typeof slot.to === 'string' && slot.to.length) {
                                        isEmpty = false; break; // break inner
                                    }
                                }
                                if (!isEmpty) break; // break outer
                            }
                        }
                    }
                }
                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    computed: {
        unusedDays() {
            let used = [];
            this.field.value.forEach(g => used = used.concat(g.days));
            return Object.keys(this.field.props.weekdays).filter(d => !used.includes(d));
        }
    }
};

/**
 * FIELD: TAXONOMY
 */
const TermList = {
    template: "#create-post-term-list",
    props: ["terms", "parent-term", "previous-list", "list-key"],
    data() {
        return {
            taxonomyField: Voxel.helpers.getParent(this, "taxonomy-field"),
            perPage: 50,
            page: 1
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
            // Restore scroll position after slide animation
            setTimeout(() => {
                el.closest(".min-scroll").scrollTop = this.taxonomyField.scrollPosition[key] || 0;
            }, 100);
        },
        beforeLeave(el, key) {
            // Save scroll position before slide animation
            this.taxonomyField.scrollPosition[key] = el.closest(".min-scroll").scrollTop;
        }
    },
    computed: {
        termsWithChildren() {
            return this.terms.filter(term => term.children && term.children.length);
        }
    }
};

const FieldTaxonomy = {
    template: "#create-post-taxonomy-field",
    name: "taxonomy-field",
    props: { field: Object, index: { type: Number, default: 0 } },
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
        // Recursively count terms and set parent refs
        let processNode = (term, parent) => {
            this.termCount++;
            term.parentRef = parent;
            if (term.children) term.children.forEach(child => processNode(child, term));
        };
        this.terms.forEach(term => processNode(term, null));
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
            return Object.keys(this.value).length > 0;
        },
        _getDisplayValue() {
            return this._getLeafTermSlugs(this.value).map(k => this.value[k].label).join(", ");
        },
        deselectChildren(term) {
            if (term.children) {
                term.children.forEach(child => {
                    delete this.value[child.slug];
                    this.deselectChildren(child);
                });
            }
        },
        _getLeafTermSlugs(selection) {
            let keys = Object.keys(selection);
            if (keys.length === 0) return [];
            let map = {};
            let keySet = new Set(keys);

            // Initial false
            keys.forEach(k => map[k] = false);

            keys.forEach(key => {
                let term = selection[key];
                if (term) {
                    let parent = term.parentRef;
                    while (parent) {
                        if (keySet.has(parent.slug)) {
                            map[parent.slug] = true; // Is a parent of someone checked, so not a leaf
                        }
                        parent = parent.parentRef;
                    }
                }
            });

            return keys.filter(k => !map[k]);
        },
        _countLeafTerms() {
            return this._getLeafTermSlugs(this.value).length;
        },
        selectTerm(term) {
            if (this.value[term.slug]) {
                // Deselect
                delete this.value[term.slug];
                this.deselectChildren(term);
                // Handle Auto-Deselect parents if no children left
                let parent = term.parentRef;
                while (parent) {
                    if (!parent.children.some(child => !!this.value[child.slug])) {
                        delete this.value[parent.slug];
                    }
                    parent = parent.parentRef;
                }
            } else {
                // Select
                if (!this.field.props.multiple) Object.keys(this.value).forEach(k => delete this.value[k]);

                this.value[term.slug] = term;
                let parent = term.parentRef;
                while (parent) {
                    this.value[parent.slug] = parent;
                    parent = parent.parentRef;
                }

                if (!this.field.props.multiple && this.field.props.display_as !== 'inline') {
                    this.onSave();
                }
            }

            if (this.field.props.display_as === 'inline') this.saveValue();
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let count = this._countLeafTerms();
                let isEmpty = count === 0;
                let min = this.field.props.min;
                let max = this.field.props.max;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && count < min) errors.push(this.$root.replace_vars(this.$root.get_error("taxonomy:min"), { "@min": min }));
                    if (max && count > max) errors.push(this.$root.replace_vars(this.$root.get_error("taxonomy:max"), { "@max": max }));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    computed: {
        searchResults() {
            if (!this.search.trim().length) return false;
            let list = [];
            let term = this.search.trim().toLowerCase();

            let scan = (node) => {
                if (node.label.toLowerCase().indexOf(term) !== -1) {
                    list.push(node);
                    if (list.length >= 100) return -1; // limit
                }
                if (node.children) {
                    for (let child of node.children) {
                        if (scan(child) === -1) return -1;
                    }
                }
            };

            for (let root of this.terms) {
                if (scan(root) === -1) break;
            }
            return list;
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: REPEATER
 */
const FieldRepeater = {
    template: "#create-post-repeater-field",
    props: { field: Object },
    data() {
        return { rows: this.field.props.rows, active: null };
    },
    created() {
        this.rows.forEach((row) => {
            this.$root.setupConditions(row);
            row["meta:state"].id = Voxel.helpers.sequentialId();
        });
    },
    mounted() {
        this.$nextTick(() => this.rows.forEach(r => this.getRowLabel(r)));
    },
    methods: {
        addRow() {
            let row = Vue.reactive(jQuery.extend(true, {}, this.field.props.fields));
            row["meta:state"].id = Voxel.helpers.sequentialId();
            this.rows.push(row);
            this.active = row;
            this.$root.setupConditions(row);
            this.$nextTick(() => this.getRowLabel(row));
        },
        onSubmit(data, formData, path = null) {
            data[this.field.key] = [];
            if (path === null) path = [];

            this.rows.forEach((row, index) => {
                let rowData = {};
                Object.values(row).forEach((field) => {
                    if (field.key !== "meta:state" && !field.is_ui && this.$root.conditionsPass(field)) {
                        let ref = this.$refs[`row#${row["meta:state"].id}:` + field.key]?.[0];
                        if (typeof ref?.onSubmit === 'function') {
                            let subPath = [...path];
                            subPath.push(index);
                            ref.onSubmit(rowData, formData, subPath);
                        } else if (field.value !== null) {
                            rowData[field.key] = field.value;
                        }
                    }
                });
                data[this.field.key].push(rowData);
            });
        },
        getRowLabel(row) {
            let state = row["meta:state"];
            let labelKey = this.field.props.row_label;
            let defaultLabel = this.field.props.l10n.item;

            let update = (val) => { state.label = val; };

            let field = row[labelKey];
            let ref = this.$refs[`row#${state.id}:` + field?.key]?.[0];

            if (field && ref) {
                if (['taxonomy', 'post-relation', 'multiselect', 'date'].includes(field.type)) {
                    ref.$watch('displayValue', () => update(ref.displayValue || defaultLabel));
                    update(ref.displayValue || defaultLabel);
                } else if (field.type === 'select') {
                    this.$watch(() => field.value, () => {
                        let choice = field.props.choices.find(c => c.value === field.value);
                        update(choice?.label || defaultLabel);
                    });
                    let choice = field.props.choices.find(c => c.value === field.value);
                    update(choice?.label || defaultLabel);
                } else if (field.type === 'time') {
                    this.$watch(() => field.value, () => update(ref.formattedTime() || defaultLabel));
                    update(ref.formattedTime() || defaultLabel);
                } else {
                    this.$watch(() => field.value, () => update(field.value?.toString() || defaultLabel));
                    update(field.value?.toString() || defaultLabel);
                }
            } else {
                update(defaultLabel);
            }
        },
        validate(rows) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(Array.isArray(rows) && rows.length >= 1);
                let min = this.field.props.min_rows;
                let max = this.field.props.max_rows;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (min && rows.length < min) errors.push(this.$root.replace_vars(this.$root.get_error("repeater:min"), { "@min": min }));
                    if (max && rows.length > max) errors.push(this.$root.replace_vars(this.$root.get_error("repeater:max"), { "@max": max }));

                    // Deep validate
                    for (let row of rows) {
                        Object.values(row).forEach(field => {
                            if (field.key !== "meta:state") {
                                if (this.shouldValidateSubfield(field)) {
                                    let id = row["meta:state"].id;
                                    let ref = this.$refs[`row#${id}:` + field.key]?.[0];
                                    if (typeof ref?.validate === 'function') ref.validate(ref.field.value);
                                } else {
                                    field.validation.errors = [];
                                }
                            }
                        });
                    }

                    if (this.hasInvalidRows()) {
                        errors.push(this.$root.get_error("repeater:row-error"));
                    }
                }
                this.field.validation.errors = errors;
            }
        },
        hasInvalidRows() {
            for (let row of this.rows) {
                for (let field of Object.values(row)) {
                    if (field.key !== "meta:state" && this.shouldValidateSubfield(field)) {
                        let ref = this.$refs[`row#${row["meta:state"].id}:` + field.key]?.[0];
                        if (field.validation.errors.length) return true;
                        if (field.type === 'repeater' && ref?.hasInvalidRows?.()) return true;
                    }
                }
            }
            return false;
        },
        shouldValidateSubfield(field) {
            if (!field || field.key === "meta:state" || field.is_ui || !this.$root.conditionsPass(field)) return false;
            return true;
        }
    },
    watch: {
        "rows.length"() { this.validate(this.rows); }
    }
};

/**
 * FIELD: UI-STEP
 * Step marker for multi-step forms (ui-only, no value)
 */
const FieldUiStep = {
    template: "#create-post-ui-step-field",
    props: { field: Object }
};

/**
 * FIELD: UI-HEADING
 * Section heading for form organization (ui-only, no value)
 */
const FieldUiHeading = {
    template: "#create-post-ui-heading-field",
    props: { field: Object }
};

/**
 * FIELD: UI-HTML
 * Custom HTML content field (ui-only, no value)
 */
const FieldUiHtml = {
    template: "#create-post-ui-html-field",
    props: { field: Object },
    mounted() {
        let content = jQuery.parseHTML(this.field.props.content, document, true);
        this.$nextTick(() => {
            jQuery(this.$refs.composer).append(content);
        });
    }
};

/**
 * FIELD: UI-IMAGE
 * Static image display field (ui-only, no value)
 */
const FieldUiImage = {
    template: "#create-post-ui-image-field",
    props: { field: Object }
};

/**
 * FIELD: PROFILE-NAME (extends Text)
 * Profile name field - uses same template/logic as text field
 */
const FieldProfileName = {
    template: "#create-post-text-field",
    extends: FieldText
};

/**
 * FIELD: TIMEZONE
 * Timezone selector with search functionality
 */
const FieldTimezone = {
    template: "#create-post-timezone-field",
    props: { field: Object },
    data() {
        return {
            search: ""
        };
    },
    methods: {
        onSave() {
            this.$refs.formGroup.blur();
        },
        onClear() {
            this.field.value = null;
            this.search = "";
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    computed: {
        choices() {
            if (this.search.trim().length) {
                return this.field.props.list.filter(e =>
                    e.toLowerCase().indexOf(this.search.trim().toLowerCase()) !== -1
                );
            }
            return this.field.props.list;
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: SELECT
 * Single select dropdown
 */
const FieldSelect = {
    template: "#create-post-select-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        let choiceMap = {};
        this.field.props.choices.forEach(choice => choiceMap[choice.value] = choice);
        return {
            value: this.field.value,
            choiceMap: choiceMap
        };
    },
    created() {
        // Validate initial value exists in choices
        if (this.field.value !== null && !this.choiceMap[this.field.value]) {
            this.field.value = null;
            this.value = null;
        }

        // Auto-select first option if required and empty
        if (this.value === null && this.field.required) {
            this.value = this.field.props.choices[0]?.value;
            this.saveValue();
        }

        this.$watch(() => this.field.value, () => this.validate(this.field.value));
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
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    }
};

/**
 * FIELD: MULTISELECT
 * Multi-select field with search
 */
const FieldMultiselect = {
    template: "#create-post-multiselect-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        let choiceMap = {};
        this.field.props.choices.forEach(choice => choiceMap[choice.value] = choice);
        return {
            value: this.field.props.selected,
            choiceMap: choiceMap,
            displayValue: "",
            search: ""
        };
    },
    created() {
        this.$watch(() => this.field.value, () => this.validate(this.field.value));
        this.displayValue = this._getDisplayValue();
    },
    methods: {
        selectChoice(choice) {
            if (this.value[choice.value]) {
                delete this.value[choice.value];
            } else {
                this.value[choice.value] = choice;
            }
            if (this.field.props.display_as === 'inline') {
                this.saveValue();
            }
        },
        saveValue() {
            this.field.value = this.isFilled() ? Object.keys(this.value) : null;
            this.displayValue = this._getDisplayValue();
        },
        isFilled() {
            return Object.keys(this.value).length > 0;
        },
        _getDisplayValue() {
            return Object.values(this.value)
                .sort((a, b) => a.order - b.order)
                .map(c => c.label)
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
                let isEmpty = !(Array.isArray(val) && val.length);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    computed: {
        searchResults() {
            if (!this.search.trim().length) return false;
            let list = [];
            let term = this.search.trim().toLowerCase();
            for (let choice of this.field.props.choices) {
                if (choice.label.toLowerCase().indexOf(term) !== -1) {
                    list.push(choice);
                    if (list.length >= 100) break;
                }
            }
            return list;
        }
    }
};

/**
 * FIELD: DATE
 * Single date picker with optional time
 */
const FieldDate = {
    template: "#create-post-date-field",
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
                    selectDayFn: (date) => {
                        return this.parent.date && this.parent.date.toDateString() === date.toDateString();
                    }
                });
            },
            unmounted() {
                setTimeout(() => this.picker.destroy(), 200);
            },
            methods: {
                reset() {
                    this.parent.date = null;
                    this.picker.draw();
                }
            }
        }
    },
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        return {
            date: this.field.value.date,
            time: this.field.value.time,
            displayValue: ""
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
            this.field.value.date = this.isFilled() ? Voxel.helpers.dateFormatYmd(this.date) : null;
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
            if (this.$root.shouldValidate()) {
                let errors = [];
                let hasTimepicker = !!this.field.props.enable_timepicker;
                let isEmpty = !(typeof val === "object" && val.date && (!hasTimepicker || val.time));

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "field.value.date"() { this.validate(this.field.value); },
        "field.value.time"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: TIME
 * Time picker field
 */
const FieldTime = {
    template: "#create-post-time-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        },
        formattedTime() {
            if (typeof this.field.value === "string" && this.field.value.length) {
                // Validate time format HH:MM
                if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(this.field.value)) return null;

                let [hours, minutes, seconds = 0] = this.field.value.split(":").map(Number);
                let date = new Date();
                date.setHours(hours, minutes, seconds, 0);
                return Voxel.helpers.timeFormat(date);
            }
            return null;
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: COLOR
 * Color picker field with hex validation
 */
const FieldColor = {
    template: "#create-post-color-field",
    props: { field: Object },
    methods: {
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(typeof val === "string" && val.trim().length >= 1);

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    // Validate hex color format
                    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(val)) {
                        errors.push(this.$root.get_error("color:invalid"));
                    }
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * FIELD: POST-RELATION
 * Links posts to other posts with search functionality
 */
const FieldPostRelation = {
    template: "#create-post-post-relation-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    data() {
        return {
            posts: {
                loading: false,
                has_more: false,
                list: null
            },
            value: this.field.props.selected,
            displayValue: "",
            search: {
                term: "",
                offset: 0,
                loading: false,
                loading_more: false,
                has_more: false,
                list: null
            }
        };
    },
    created() {
        this.displayValue = this._getDisplayValue();
    },
    methods: {
        onOpen() {
            if (this.posts.list === null) {
                this.posts.list = [];
                this.loadPosts();
            }
        },
        loadPosts() {
            this.posts.loading = true;
            jQuery.get(Voxel_Config.ajax_url + "&action=create_post.relations.get_posts", {
                offset: this.posts.list.length,
                post_id: this.$root.post?.id,
                exclude: this.$root.post?.id,
                post_type: this.$root.config.post_type.key,
                field_key: this.field.key,
                field_path: this.field.path
            }).always((res) => {
                this.posts.loading = false;
                if (res.success) {
                    this.posts.list.push(...res.data);
                    this.posts.has_more = res.has_more;
                } else {
                    Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                }
            });
        },
        saveValue() {
            this.field.value = this.isFilled() ? Object.keys(this.value) : null;
            this.displayValue = this._getDisplayValue();
        },
        onSave() {
            this.saveValue();
            this.$refs.formGroup.blur();
        },
        onClear() {
            Object.keys(this.value).forEach(k => delete this.value[k]);
        },
        isFilled() {
            return Object.keys(this.value).length > 0;
        },
        _getDisplayValue() {
            let items = Object.values(this.value);
            let result = "";
            if (items[0]) {
                result += items[0].title;
            }
            if (items.length > 1) {
                result += " +" + (items.length - 1);
            }
            return result;
        },
        selectPost(post) {
            if (this.value[post.id]) {
                delete this.value[post.id];
            } else {
                if (!this.field.props.multiple) {
                    Object.keys(this.value).forEach(k => delete this.value[k]);
                }
                this.value[post.id] = post;
                if (!this.field.props.multiple) {
                    this.onSave();
                }
            }
        },
        clientSearchPosts() {
            let term = this.search.term.trim().toLowerCase();
            let list = [];
            let full = false;
            this.posts.list.forEach((post) => {
                if (!full && post.title.toLowerCase().indexOf(term) !== -1) {
                    list.push(post);
                    full = list.length >= 10;
                }
            });
            this.search.list = list;
            this.search.loading = false;
            this.search.has_more = false;
            this.search.loading_more = false;
        },
        serverSearchPosts: Voxel.helpers.debounce(function (vm, loadMore = false) {
            jQuery.get(Voxel_Config.ajax_url + "&action=create_post.relations.get_posts", {
                offset: loadMore ? vm.search.list.length : 0,
                post_id: vm.$root.post?.id,
                exclude: vm.$root.post?.id,
                search: vm.search.term.trim(),
                post_type: vm.$root.config.post_type.key,
                field_key: vm.field.key,
                field_path: vm.field.path
            }).always((res) => {
                vm.search.loading = false;
                vm.search.loading_more = false;
                if (res.success) {
                    if (loadMore) {
                        vm.search.list.push(...res.data);
                    } else {
                        vm.search.list = res.data;
                    }
                    vm.search.has_more = res.has_more;
                } else {
                    Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                }
            });
        }),
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(Array.isArray(val) && val.length >= 1);
                let max = this.field.props.multiple ? this.field.props.max_count : 1;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (max && val.length > max) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("relation:max"), { "@max": max }));
                    }
                }
                this.field.validation.errors = errors;
            }
        }
    },
    watch: {
        "search.term"() {
            if (this.search.term.trim() && this.posts.list) {
                this.search.loading = true;
                if (!this.posts.has_more || this.search.term.trim().length <= 2) {
                    this.clientSearchPosts();
                } else {
                    this.serverSearchPosts(this);
                }
            }
        },
        "field.value"() { this.validate(this.field.value); }
    }
};

/**
 * DATE RANGE PICKER Component
 * Used by recurring date field for multi-day events
 */
const DateRangePicker = {
    template: "#recurring-date-range-picker",
    props: { date: Object, parent: Object },
    emits: ["save"],
    data() {
        return {
            picker: null,
            activePicker: "start",
            value: {
                start: this.date.startDate ? new Date(this.date.startDate + "T00:00:00") : null,
                end: this.date.endDate ? new Date(this.date.endDate + "T00:00:00") : null
            }
        };
    },
    mounted() {
        this.picker = new Pikaday({
            field: this.$refs.input,
            container: this.$refs.calendar,
            bound: false,
            firstDay: 1,
            keyboardInput: false,
            numberOfMonths: 2,
            defaultDate: this.value.start,
            startRange: this.value.start,
            endRange: this.value.end,
            theme: "pika-range",
            onSelect: (date) => {
                if (this.activePicker === "start") {
                    this.setStartDate(date);
                    this.setEndDate(null);
                    this.activePicker = "end";
                } else {
                    this.setEndDate(date);
                    this.activePicker = "start";
                    this.date.startDate = Voxel.helpers.dateFormatYmd(this.value.start);
                    this.date.endDate = Voxel.helpers.dateFormatYmd(this.value.end);
                    this.$emit("save");
                }
                this.refresh();
            },
            selectDayFn: (date) => {
                if (this.value.start && date.toDateString() === this.value.start.toDateString()) return true;
                if (this.value.end && date.toDateString() === this.value.end.toDateString()) return true;
                return false;
            },
            disableDayFn: (date) => {
                if (this.activePicker === "end" && this.value.start && date <= this.value.start) {
                    return true;
                }
                return false;
            }
        });
        this.setStartDate(this.value.start);
        this.setEndDate(this.value.end);
        this.refresh();
    },
    unmounted() {
        setTimeout(() => this.picker.destroy(), 200);
    },
    methods: {
        setStartDate(date) {
            this.value.start = date;
            this.picker.setStartRange(date);
            if (this.value.end && this.value.start > this.value.end) {
                this.setEndDate(null);
            }
        },
        setEndDate(date) {
            this.value.end = date;
            this.picker.setEndRange(date);
        },
        refresh() {
            this.picker.draw();
        },
        reset() {
            this.setStartDate(null);
            this.setEndDate(null);
            this.refresh();
            this.activePicker = "start";
        }
    },
    computed: {
        startLabel() {
            return this.value.start
                ? Voxel.helpers.dateFormat(this.value.start)
                : this.parent.field.props.l10n.from;
        },
        endLabel() {
            return this.value.end
                ? Voxel.helpers.dateFormat(this.value.end)
                : this.parent.field.props.l10n.to;
        }
    },
    watch: {
        activePicker() { this.refresh(); }
    }
};

/**
 * FIELD: RECURRING-DATE
 * Recurring date field with single/multi-day events and repeat rules
 */
const FieldRecurringDate = {
    template: "#create-post-recurring-date-field",
    props: { field: Object, index: { type: Number, default: 0 } },
    components: {
        datePicker: {
            template: '#recurring-date-picker',
            props: ['modelValue', 'minDate'],
            emits: ['update:modelValue'],
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
                    defaultDate: this.modelValue ? new Date(this.modelValue) : null,
                    onSelect: (date) => {
                        this.$emit('update:modelValue', Voxel.helpers.dateFormatYmd(date));
                    },
                    selectDayFn: (date) => {
                        return this.modelValue && this.modelValue === Voxel.helpers.dateFormatYmd(date);
                    }
                });
            },
            unmounted() {
                setTimeout(() => this.picker.destroy(), 200);
            },
            watch: {
                modelValue() { this.picker.draw(); }
            }
        },
        dateRangePicker: DateRangePicker
    },
    methods: {
        add() {
            this.field.value.push({
                multiday: false,
                startDate: null,
                startTime: "09:00",
                endDate: null,
                endTime: "10:00",
                allday: false,
                repeat: false,
                frequency: 1,
                unit: "week",
                until: null
            });
        },
        remove(date) {
            this.field.value.splice(this.field.value.indexOf(date), 1);
        },
        id() {
            return this.field.id + ":" + this.index + "." + Object.values(arguments).join(".");
        },
        clearDate(date) {
            date.startDate = null;
            date.startTime = null;
            date.endDate = null;
            date.endTime = null;
            this.$refs.rangePicker?.[0]?.reset();
        },
        singleDatePicked(date) {
            let startDate = new Date(date.startDate + "T00:00:00Z");
            let nextDay = new Date(startDate);
            nextDay.setDate(nextDay.getDate() + 1);
            date.endDate = Voxel.helpers.dateFormatYmd(nextDay);
        },
        getStartDate(date) {
            let time = date.startTime || "00:00:00";
            let d = new Date(date.startDate + " " + time);
            return date.startDate && isFinite(d) ? d : null;
        },
        getEndDate(date) {
            let time = date.endTime || "00:00:00";
            let d = new Date(date.endDate + " " + time);
            return date.endDate && isFinite(d) ? d : null;
        },
        getUntilDate(date) {
            let d = new Date(date.until);
            return date.until && isFinite(d) ? d : null;
        },
        format(date) {
            return Voxel.helpers.dateTimeFormat(date);
        },
        formatDate(date) {
            return Voxel.helpers.dateFormat(date);
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = !(Array.isArray(val) && val.length >= 1);
                let max = this.field.props.max_date_count;

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }

                if (!isEmpty) {
                    if (max && val.length > max) {
                        errors.push(this.$root.replace_vars(this.$root.get_error("recurring-date:max"), { "@max": max }));
                    }
                    val.forEach(date => {
                        if (!date.startDate || (date.multiday && !date.endDate)) {
                            errors.push(this.$root.get_error("recurring-date:empty"));
                        }
                        if (date.repeat && !date.until) {
                            errors.push(this.$root.get_error("recurring-date:missing-until"));
                        }
                    });
                }
                this.field.validation.errors = errors;
            }
        }
    }
};


/* ==========================================================================
   SECTION 2B: PRODUCT FIELD & SUB-COMPONENTS
   ========================================================================== */

/**
 * PRODUCT ADDON: NUMERIC
 * Numeric addon for products
 */
const ProductAddonNumeric = {
    template: "#product-addon-numeric",
    props: { product: Object, field: Object, addon: Object },
    data() {
        return {
            value: this.field.value[this.addon.key]
        };
    }
};

/**
 * PRODUCT ADDON: SWITCHER
 * Toggle addon for products
 */
const ProductAddonSwitcher = {
    template: "#product-addon-switcher",
    props: { product: Object, field: Object, addon: Object },
    data() {
        return {
            value: this.field.value[this.addon.key]
        };
    }
};

/**
 * PRODUCT ADDON: SELECT
 * Single/multi-select addon for products
 */
const ProductAddonSelect = {
    template: "#product-addon-select",
    props: { product: Object, field: Object, addon: Object },
    data() {
        return {
            value: this.field.value[this.addon.key],
            active: null
        };
    },
    methods: {
        beforeSubmit() {
            Object.values(this.value.choices).forEach(choice => {
                if (typeof choice.price === "number" && choice.price >= 0) {
                    choice.enabled = true;
                } else {
                    choice.enabled = false;
                    choice.price = null;
                }
            });
        }
    }
};

/**
 * PRODUCT ADDON: CUSTOM SELECT
 * User-defined select choices addon
 */
const ProductAddonCustomSelect = {
    template: "#product-addon-custom-select",
    props: { product: Object, field: Object, addon: Object },
    data() {
        return {
            value: this.field.value[this.addon.key],
            active: null,
            list: [],
            addon_id: [this.product.field.key, this.field.field.key, this.addon.key].join(".")
        };
    },
    created() {
        if (this.value.choices === null) {
            this.value.choices = {};
        }
        Object.keys(this.value.choices).forEach(key => {
            let choice = this.value.choices[key];
            choice.value = key;
            this.list.push(choice);
        });
    },
    methods: {
        insertChoice() {
            let choice = jQuery.extend(true, {}, this.addon.props.choice);
            this.active = choice;
            this.list.push(choice);
            this.$nextTick(() => {
                this.$refs.formGroup.querySelector(".ts-field-repeater:not(.collapsed) .ts-choice-label .ts-filter")?.focus();
            });
        },
        deleteChoice(target) {
            this.list = this.list.filter(c => c !== target);
        },
        beforeSubmit(data, formData) {
            let choices = {};
            this.list.forEach(choice => {
                if (typeof choice?.value === "string" && choice.value.length) {
                    let entry = {
                        value: choice.value,
                        price: choice.price,
                        subheading: choice.subheading,
                        image: null
                    };

                    if (["cards", "radio", "checkboxes"].includes(this.addon.props.display_mode)) {
                        entry.quantity = {
                            enabled: choice.quantity.enabled,
                            min: choice.quantity.min,
                            max: choice.quantity.max
                        };
                    }

                    if (["cards", "images"].includes(this.addon.props.display_mode)) {
                        let fileKey = `files[${this.addon_id + "." + choice.value}][]`;
                        if (Array.isArray(choice.image) && choice.image.length) {
                            let file = choice.image[0];
                            if (file.source === "new_upload") {
                                formData.append(fileKey, file.item);
                                entry.image = "uploaded_file";
                            } else if (file.source === "existing") {
                                entry.image = file.id;
                            }
                        }
                    }

                    choices[entry.value] = entry;
                }
            });
            this.value.choices = choices;
        }
    }
};

/**
 * PRODUCT ADDONS Container
 * Manages all addon types for a product
 */
const ProductAddons = {
    template: "#product-addons",
    props: { product: Object, field: Object, productType: Object },
    components: {
        addonNumeric: ProductAddonNumeric,
        addonSwitcher: ProductAddonSwitcher,
        addonSelect: ProductAddonSelect,
        addonMultiselect: ProductAddonSelect,
        addonCustomSelect: ProductAddonCustomSelect,
        addonCustomMultiselect: ProductAddonCustomSelect
    },
    data() {
        return {
            value: this.productType.value.addons
        };
    },
    methods: {
        beforeSubmit(data, formData) {
            Object.values(this.field.props.addons).forEach(addon => {
                let ref = this.$refs["addon:" + addon.key]?.[0];
                if (typeof ref?.beforeSubmit === "function") {
                    ref.beforeSubmit(data, formData);
                }
            });
        }
    }
};

/**
 * PRODUCT BASE PRICE
 * Base price configuration for products
 */
const ProductBasePrice = {
    template: "#product-base-price",
    props: { product: Object, productType: Object, field: Object },
    data() {
        return {
            value: this.productType.value.base_price
        };
    }
};

/**
 * PRODUCT BOOKING CALENDAR
 * Availability calendar for booking products
 */
const ProductBookingCalendar = {
    template: '<div class="ts-calendar-wrapper ts-availability-calendar"><input type="hidden" ref="input"></div>',
    props: { booking: Object },
    data() {
        return {
            picker: null,
            today: new Date(),
            weekdays: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
        };
    },
    mounted() {
        this.picker = new Pikaday({
            field: this.$refs.input,
            container: this.$el,
            bound: false,
            firstDay: 1,
            keyboardInput: false,
            onSelect: (date) => {
                let formatted = Voxel.helpers.dateFormatYmd(date);
                if (this.booking.value.excluded_days.includes(formatted)) {
                    this.booking.value.excluded_days = this.booking.value.excluded_days.filter(d => d !== formatted);
                } else {
                    this.booking.value.excluded_days.push(formatted);
                }
            },
            selectDayFn: (date) => {
                return this.booking.value.excluded_days.includes(Voxel.helpers.dateFormatYmd(date));
            },
            disableDayFn: (date) => {
                if (date < this.today) return true;
                if (this.booking.field.props.booking_type === "days") {
                    if (this.booking.value.excluded_weekdays.includes(this.weekdays[date.getDay()])) {
                        return true;
                    }
                }
                if (this.booking.field.props.booking_type === "timeslots") {
                    if (this.booking.$refs.timeslots.unusedDays.includes(this.weekdays[date.getDay()])) {
                        return true;
                    }
                }
                return false;
            }
        });

        if (this.booking.field.props.booking_type === "days") {
            this.$watch(() => this.booking.value.excluded_weekdays, () => this.refresh(), { deep: true });
        } else if (this.booking.field.props.booking_type === "timeslots") {
            this.$watch(() => this.booking.$refs.timeslots.unusedDays, () => this.refresh());
        }
    },
    unmounted() {
        this.picker.destroy();
    },
    methods: {
        refresh() {
            this.picker.draw();
        }
    }
};

/**
 * PRODUCT WEEKDAY EXCLUSIONS
 * Configure which weekdays are excluded from booking
 */
const ProductWeekdayExclusions = {
    template: "#product-weekday-exclusions",
    props: { booking: Object },
    methods: {
        toggleDay(day) {
            let days = this.booking.value.excluded_weekdays;
            if (days.includes(day)) {
                days.splice(days.indexOf(day), 1);
            } else {
                days.push(day);
            }
        }
    },
    computed: {
        label() {
            return Object.keys(this.booking.field.props.weekdays)
                .filter(d => this.booking.value.excluded_weekdays.includes(d))
                .map(d => this.booking.field.props.weekdays[d])
                .join(", ");
        }
    }
};

/**
 * PRODUCT TIMESLOTS
 * Configure time slot availability for booking
 */
const ProductTimeslots = {
    template: "#product-timeslots",
    props: { booking: Object },
    data() {
        return {
            active: null,
            groups: this.booking.value.timeslots.groups,
            generate: {
                from: "09:00",
                to: "17:00",
                length: 30,
                gap: 0
            },
            showGenerate: false
        };
    },
    methods: {
        isDayUsed(day, group) {
            return group.days.indexOf(day) !== -1;
        },
        isDayAvailable(day, group) {
            return this.isDayUsed(day, group) || this.unusedDays.indexOf(day) !== -1;
        },
        addGroup() {
            let group = { days: [], slots: [] };
            this.groups.push(group);
            this.active = group;
            this.showGenerate = false;
        },
        createSlot(group) {
            if (group.slots.length < 50) {
                group.slots.push({ from: "09:00", to: "09:30" });
            }
        },
        removeSlot(slot, group) {
            group.slots = group.slots.filter(s => s !== slot);
        },
        removeGroup(target) {
            this.groups = this.booking.value.timeslots.groups = this.groups.filter(g => g !== target);
        },
        toggleDay(day, group) {
            if (this.isDayUsed(day, group)) {
                group.days = group.days.filter(d => d !== day);
            } else {
                group.days.push(day);
            }
        },
        groupKey(index, suffix = "") {
            suffix = suffix.length ? "." + suffix : "";
            return `${this.booking.product.key}.${this.booking.field.key}.slots.` + index + suffix;
        },
        groupLabel(group) {
            return Object.keys(this.booking.field.props.weekdays)
                .filter(d => group.days.includes(d))
                .map(d => this.booking.field.props.weekdays[d])
                .join(", ");
        },
        groupLabelShort(group) {
            return Object.keys(this.booking.field.props.weekdays_short)
                .filter(d => group.days.includes(d))
                .map(d => this.booking.field.props.weekdays_short[d])
                .join(", ");
        },
        generateSlots(group) {
            let fromParts = this.generate.from.split(":");
            let toParts = this.generate.to.split(":");
            let length = this.generate.length;
            let gap = this.generate.gap;

            let fromHour = parseInt(fromParts[0], 10);
            let fromMinute = parseInt(fromParts[1], 10);
            let toHour = parseInt(toParts[0], 10);
            let toMinute = parseInt(toParts[1], 10);

            if (isNaN(fromHour) || isNaN(fromMinute) || isNaN(toHour) || isNaN(toMinute) || length < 5) {
                return;
            }

            let slots = [];
            let startMinutes = fromHour * 60 + fromMinute;
            let endMinutes = toHour * 60 + toMinute;

            if (endMinutes <= startMinutes) {
                endMinutes += 1440; // next day
            }

            while (startMinutes < endMinutes && endMinutes >= startMinutes + length && slots.length < 50) {
                let startTime = {
                    hour: Math.floor(startMinutes / 60),
                    minute: startMinutes % 60
                };
                let endTime = {
                    hour: Math.floor((startMinutes + length) / 60),
                    minute: (startMinutes + length) % 60
                };

                if (startTime.hour >= 24) startTime.hour -= 24;
                if (endTime.hour >= 24) endTime.hour -= 24;

                slots.push({
                    from: [startTime.hour.toString().padStart(2, "0"), startTime.minute.toString().padStart(2, "0")].join(":"),
                    to: [endTime.hour.toString().padStart(2, "0"), endTime.minute.toString().padStart(2, "0")].join(":")
                });

                startMinutes += length + gap;
            }

            group.slots = slots;
            this.showGenerate = false;
        }
    },
    computed: {
        unusedDays() {
            let used = [];
            this.groups.forEach(g => used = used.concat(g.days));
            return Object.keys(this.booking.field.props.weekdays).filter(d => !used.includes(d));
        }
    }
};

/**
 * PRODUCT BOOKING
 * Complete booking configuration component
 */
const ProductBooking = {
    template: "#product-booking",
    props: { product: Object, field: Object, productType: Object },
    components: {
        bookingCalendar: ProductBookingCalendar,
        weekdayExclusions: ProductWeekdayExclusions,
        timeSlots: ProductTimeslots
    },
    data() {
        return {
            value: this.productType.value.booking
        };
    },
    methods: {
        toggleWeekdayExclusion(day) {
            let days = this.value.excluded_weekdays;
            if (days.includes(day)) {
                days.splice(days.indexOf(day), 1);
            } else {
                days.push(day);
            }
        }
    },
    computed: {
        excludedWeekdays() {
            return Object.keys(this.field.props.weekdays)
                .filter(d => this.value.excluded_weekdays.includes(d))
                .map(d => this.field.props.weekdays[d])
                .join(", ");
        }
    }
};

/**
 * PRODUCT DELIVERABLES
 * Digital product deliverable files
 */
const ProductDeliverables = {
    template: "#product-deliverables",
    props: { product: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.productType.value.deliverables,
            files: this.productType.value.deliverables.files
        };
    },
    created() {
        if (!Array.isArray(this.files)) {
            this.files = [];
        }
    },
    methods: {
        beforeSubmit(data, formData) {
            let key = `files[${this.product.field.key}.deliverables][]`;
            let fileIds = [];

            if (Array.isArray(this.files) && this.files.length) {
                this.files.forEach(file => {
                    if (file.source === "new_upload") {
                        formData.append(key, file.item);
                        fileIds.push("uploaded_file");
                    } else if (file.source === "existing") {
                        fileIds.push(file.id);
                    }
                });
            }
            this.value.files = fileIds;
        }
    }
};

/**
 * PRODUCT SHIPPING
 * Physical product shipping configuration
 */
const ProductShipping = {
    template: "#product-shipping",
    props: { product: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.productType.value.shipping
        };
    }
};

/**
 * PRODUCT STOCK
 * Inventory/stock management
 */
const ProductStock = {
    template: "#product-stock",
    props: { product: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.productType.value.stock
        };
    }
};

/**
 * PRODUCT SUBSCRIPTION INTERVAL
 * Recurring payment interval configuration
 */
const ProductSubscriptionInterval = {
    template: "#product-subscription-interval",
    props: { product: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.productType.value.subscription
        };
    },
    computed: {
        maxFrequency() {
            let unit = this.value.unit;
            if (unit === "day") return 365;
            if (unit === "week") return 156;
            if (unit === "month") return 36;
            return 3; // year
        }
    }
};

/**
 * PRODUCT ATTRIBUTE
 * Single attribute definition for variations
 */
const ProductAttribute = {
    template: "#product-attribute",
    props: { product: Object, field: Object, attributes: Object, attribute: Object, productType: Object },
    data() {
        return {
            activeChoice: null
        };
    },
    methods: {
        createChoice() {
            let choice = { id: this.field.randomId(6) };
            this.activeChoice = choice;
            this.attribute.choices.push(choice);
            this.$nextTick(() => {
                this.$refs.formGroup.querySelector(".ts-field-repeater:not(.collapsed)")?.querySelector(".ts-choice-label .ts-filter")?.focus();
            });
        },
        deleteChoice(target) {
            this.attribute.choices = this.attribute.choices.filter(c => c !== target);
        },
        toggleChoice(choice) {
            if (this.attribute.choices[choice.value]) {
                delete this.attribute.choices[choice.value];
            } else {
                this.attribute.choices[choice.value] = { enabled: true };
            }
        }
    }
};

/**
 * PRODUCT ATTRIBUTES
 * Manages all attributes for product variations
 */
const ProductAttributes = {
    template: "#product-attributes",
    props: { product: Object, field: Object, productType: Object },
    emits: ["change:attributes"],
    components: {
        attribute: ProductAttribute
    },
    data() {
        return {
            value: this.field.value,
            active: null
        };
    },
    created() {
        if (this.value.attributes === null) {
            this.value.attributes = {};
        }

        Object.keys(this.value.attributes).forEach(key => {
            let attr = this.value.attributes[key];
            attr.key = key;
            if (attr.type === "custom") {
                Object.keys(attr.choices).forEach(choiceKey => {
                    attr.choices[choiceKey].id = choiceKey;
                });
            }
        });

        this.field.attributeList = Object.values(this.value.attributes);
        this.field.attributeList.forEach(attr => {
            if (attr.type === "custom") {
                attr.choices = Object.values(attr.choices);
            }
        });

        this.$watch(() => this.field.attributeList, () => {
            this.$emit("change:attributes", this.field.attributeList, this);
        }, { deep: true });

        this.$nextTick(() => this.$emit("change:attributes", this.field.attributeList, this));
    },
    methods: {
        createAttribute() {
            this.field.attributeList.push({
                type: "custom",
                key: this.field.randomId(6),
                label: this.field.field.props.l10n.new_attribute_label,
                display_mode: "dropdown",
                choices: []
            });
            this.active = this.field.attributeList.at(-1);
            this.$nextTick(() => {
                this.$refs.attribute.$refs.formGroup.querySelector(".variation-box .ts-attribute-label .ts-filter")?.focus();
            });
        },
        useAttribute(preset) {
            this.field.attributeList.push({
                type: "existing",
                key: preset.key,
                choices: {}
            });
            this.active = this.field.attributeList.at(-1);
        },
        isUsed(preset) {
            return this.field.attributeList.find(a => a.type === "existing" && a.key === preset.key);
        },
        getPreset(attr) {
            return this.field.getAttributePreset(attr);
        },
        getLabel(attr) {
            return this.field.getAttributeLabel(attr);
        },
        getChoiceCount(attr) {
            if (attr.type !== "existing") {
                return attr.choices.length;
            }
            let count = 0;
            Object.values(attr.choices).forEach(c => { if (c.enabled) count++; });
            return count;
        },
        deleteAttribute(target) {
            this.field.attributeList = this.field.attributeList.filter(a => a !== target);
        },
        beforeSubmit(data, formData) {
            let attributes = {};

            this.field.attributeList.forEach(attr => {
                if (attr.type === "existing") {
                    let choices = {};
                    Object.keys(attr.choices).forEach(key => {
                        if (attr.choices[key].enabled) {
                            choices[key] = { enabled: true };
                        }
                    });
                    attributes[attr.key] = {
                        type: "existing",
                        choices: choices
                    };
                } else if (attr.type === "custom") {
                    let choices = {};
                    attr.choices.forEach(choice => {
                        choices[choice.id] = {
                            label: choice.label,
                            color: choice.color,
                            subheading: choice.subheading,
                            image: null
                        };

                        if (["cards", "images"].includes(attr.display_mode)) {
                            let fileKey = `files[${this.product.field.key + ".custom-attributes." + choice.id}][]`;
                            if (Array.isArray(choice.image) && choice.image.length) {
                                let file = choice.image[0];
                                if (file.source === "new_upload") {
                                    formData.append(fileKey, file.item);
                                    choices[choice.id].image = "uploaded_file";
                                } else if (file.source === "existing") {
                                    choices[choice.id].image = file.id;
                                }
                            }
                        }
                    });

                    attributes[attr.key] = {
                        type: "custom",
                        label: attr.label,
                        display_mode: attr.display_mode,
                        choices: choices
                    };
                }
            });

            this.value.attributes = attributes;
        }
    }
};

/**
 * PRODUCT VARIATION BASE PRICE
 * Price configuration for a single variation
 */
const ProductVariationBasePrice = {
    template: "#product-variation-base-price",
    props: { product: Object, variations: Object, variation: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.variation.config.base_price
        };
    }
};

/**
 * PRODUCT VARIATION STOCK
 * Stock configuration for a single variation
 */
const ProductVariationStock = {
    template: "#product-variation-stock",
    props: { product: Object, variations: Object, variation: Object, field: Object, productType: Object },
    data() {
        return {
            value: this.variation.config.stock
        };
    }
};

/**
 * PRODUCT VARIATION BULK SETTINGS
 * Apply settings to multiple variations at once
 */
const ProductVariationBulkSettings = {
    template: "#product-variation-bulk-settings",
    props: { product: Object, variations: Object, variation: Object, productType: Object },
    data() {
        return {
            open: false,
            copy: {
                what: "price",
                where: "all"
            }
        };
    },
    methods: {
        getWhereChoices() {
            let choices = [];
            this.variations.attributeList?.forEach(attr => {
                if (attr.type === "custom") {
                    let choiceLabel = attr.choices.find(c => c.id === this.variation.attributes[attr.key])?.label;
                    choices.push({ key: attr.key, label: attr.label + ": " + choiceLabel });
                } else {
                    let preset = this.variations.getAttributePreset(attr);
                    let choiceLabel = preset.choices.find(c => c.value === this.variation.attributes[attr.key])?.label;
                    choices.push({ key: attr.key, label: preset.label + ": " + choiceLabel });
                }
            });
            return choices;
        },
        apply() {
            let what = this.copy.what;
            let where = this.copy.where;
            let settings = {};

            if (what === "all" || what === "price") {
                settings.price = this.variation.config.base_price;
                settings.enabled = this.variation.enabled;
            }
            if (what === "all" || what === "image") {
                settings.image = this.variation.image;
            }
            if (this.variations.field.props.stock.enabled && (what === "all" || what === "stock")) {
                settings.stock = this.variation.config.stock;
            }

            let count = 0;
            for (let v of this.variations.variationList) {
                if (v.id === this.variation.id) continue;
                if (where !== "all" && v.attributes[where] !== this.variation.attributes[where]) continue;

                count++;
                if (settings.price) {
                    v.enabled = settings.enabled;
                    v.config.base_price.amount = settings.price.amount;
                    if (this.variations.field.props.fields["base-price"].props.discount_price.enabled) {
                        v.config.base_price.discount_amount = settings.price.discount_amount;
                    }
                }
                if (settings.image) {
                    if (!v.image) v.image = [];
                    v.image.length = 0;
                    if (settings.image.length) {
                        v.image.push(settings.image[0]);
                    }
                }
                if (settings.stock) {
                    v.config.stock.enabled = settings.stock.enabled;
                    v.config.stock.quantity = settings.stock.quantity;
                    v.config.stock.sold_individually = settings.stock.sold_individually;
                }
            }

            if (count > 1) {
                let message = count === 1
                    ? this.variations.field.props.l10n.one_variation_updated
                    : this.variations.field.props.l10n.multiple_variations_updated.replace("@count", count);
                Voxel.alert(message, "success", 3000);
                this.open = false;
            }
        }
    }
};

/**
 * PRODUCT VARIATIONS
 * Manages product variations (attribute combinations)
 */
const ProductVariations = {
    template: "#product-variations",
    props: { product: Object, field: Object, productType: Object },
    components: {
        attributes: ProductAttributes,
        variationBasePrice: ProductVariationBasePrice,
        variationStock: ProductVariationStock,
        variationBulkSettings: ProductVariationBulkSettings
    },
    data() {
        return {
            value: this.productType.value.variations,
            attributeList: null,
            filteredAttributes: [],
            activeVariation: null,
            variationList: null,
            keyMapCache: {},
            manualVariationsCache: [],
            autoVariationsCache: [],
            manualMode: false,
            manualVariation: {
                active: false,
                attributes: {}
            }
        };
    },
    created() {
        if (this.value.variations === null) {
            this.value.variations = {};
        }

        this.manualMode = !!this.value.manual_mode;

        Object.keys(this.value.variations).forEach(key => {
            let variation = this.value.variations[key];
            variation.id = key;
            variation._key = JSON.stringify(this.sortObject(variation.attributes));
            if (this.manualMode) {
                variation._manual = true;
            }
        });

        this.variationList = Object.values(this.value.variations);
        if (this.manualMode) {
            this.manualVariationsCache = [...this.variationList];
        }

        this.enableManualVariationsForEditing();
    },
    methods: {
        sortObject(obj) {
            return Object.fromEntries(Object.entries(obj).sort());
        },
        getAttributePreset(attr) {
            return this.field.props.attributes.find(a => a.key === attr.key);
        },
        getAttributeLabel(attr) {
            return attr.type === "existing" ? this.getAttributePreset(attr)?.label : attr.label;
        },
        getVariationLabel(variation) {
            let labels = [];
            let attrs = this.filteredAttributes.length ? this.filteredAttributes : (this.attributeList || []);

            attrs.forEach(attr => {
                let value = variation.attributes[attr.key];
                if (value === "any") {
                    labels.push(this.getAttributeLabel(attr) + ": " + this.field.props.l10n.any);
                } else if (attr.type === "custom") {
                    labels.push(attr.choices.find(c => c.id === value)?.label);
                } else {
                    let preset = this.getAttributePreset(attr);
                    labels.push(preset.choices.find(c => c.value === value)?.label);
                }
            });

            return labels.filter(Boolean).join(" / ");
        },
        onAttributesUpdate(attrList) {
            this.filteredAttributes = attrList.filter(attr => {
                if (attr.type === "custom") {
                    return attr.choices && attr.choices.length > 0;
                }
                return Object.values(attr.choices).some(c => c.enabled);
            });

            this.autoVariationsCache = [];

            if (this.manualMode && this.manualVariationsCache.length) {
                this.cleanupInvalidManualVariations();
            } else if (!this.manualMode) {
                let combinations = this.filteredAttributes.length
                    ? this._generateCombinations(this.filteredAttributes)
                    : [];

                let newList = [];
                this.variationList.forEach(v => this.keyMapCache[v._key] = v);

                combinations.forEach(combo => {
                    let key = JSON.stringify(this.sortObject(combo));
                    if (this.keyMapCache[key]) {
                        newList.push(this.keyMapCache[key]);
                    } else {
                        let variation = jQuery.extend(true, {}, this.field.props.variation_props);
                        variation.id = this.randomId(8);
                        variation.attributes = this.sortObject(combo);
                        variation.image = [];
                        variation._key = JSON.stringify(this.sortObject(variation.attributes));
                        newList.push(variation);
                    }
                });

                this.variationList = newList;
            }
        },
        cleanupInvalidManualVariations() {
            let validChoices = {};
            this.filteredAttributes.forEach(attr => {
                if (attr.type === "custom") {
                    validChoices[attr.key] = attr.choices.map(c => c.id);
                } else {
                    validChoices[attr.key] = Object.keys(attr.choices).filter(k => attr.choices[k].enabled);
                }
            });

            let validVariations = this.manualVariationsCache.filter(v => {
                for (let attrKey of Object.keys(v.attributes)) {
                    let value = v.attributes[attrKey];
                    if (!validChoices[attrKey]) return false;
                    if (value !== "any" && !validChoices[attrKey].includes(value)) return false;
                }
                for (let attrKey of Object.keys(validChoices)) {
                    if (!(attrKey in v.attributes)) return false;
                }
                return true;
            });

            this.manualVariationsCache = validVariations;
            this.variationList = [...validVariations];
            this.enableManualVariationsForEditing();

            Object.keys(this.keyMapCache).forEach(key => {
                let v = this.keyMapCache[key];
                if (v._manual && !validVariations.includes(v)) {
                    delete this.keyMapCache[key];
                }
            });
        },
        onManualModeToggle() {
            this.manualVariation.active = false;

            if (this.manualMode) {
                this.autoVariationsCache = [...this.variationList];
                this.variationList = [...this.manualVariationsCache];
                this.enableManualVariationsForEditing();
            } else {
                this.manualVariationsCache = [...this.variationList];

                if (this.filteredAttributes.length) {
                    let combinations = this._generateCombinations(this.filteredAttributes);
                    let newList = [];

                    combinations.forEach(combo => {
                        let key = JSON.stringify(this.sortObject(combo));
                        if (this.keyMapCache[key]) {
                            newList.push(this.keyMapCache[key]);
                        } else {
                            let variation = jQuery.extend(true, {}, this.field.props.variation_props);
                            variation.id = this.randomId(8);
                            variation.attributes = this.sortObject(combo);
                            variation.image = [];
                            variation._key = key;
                            newList.push(variation);
                        }
                    });

                    this.variationList = newList;
                    this.autoVariationsCache = [...newList];
                } else {
                    this.variationList = [];
                    this.autoVariationsCache = [];
                }
            }
        },
        showManualVariationForm() {
            this.manualVariation.active = true;
            this.manualVariation.attributes = {};
            this.filteredAttributes.forEach(attr => {
                this.manualVariation.attributes[attr.key] = "";
            });
        },
        createManualVariation() {
            let attributes = {};
            let allAny = true;
            let hasEmpty = false;

            this.filteredAttributes.forEach(attr => {
                let value = this.manualVariation.attributes[attr.key];
                attributes[attr.key] = value;
                if (value === "") hasEmpty = true;
                if (value !== "any" && value !== "") allAny = false;
            });

            if (hasEmpty) {
                Voxel.alert(this.field.props.l10n.select_at_least_one, "error");
                return;
            }
            if (allAny) {
                Voxel.alert(this.field.props.l10n.select_at_least_one, "error");
                return;
            }

            let key = JSON.stringify(this.sortObject(attributes));
            if (this.variationList.find(v => v._key === key)) {
                Voxel.alert(this.field.props.l10n.variation_exists, "error");
                return;
            }

            let variation = jQuery.extend(true, {}, this.field.props.variation_props);
            variation.id = this.randomId(8);
            variation.attributes = this.sortObject(attributes);
            variation.image = [];
            variation._key = key;
            variation.enabled = true;
            variation._manual = true;

            this.variationList.push(variation);
            this.manualVariationsCache.push(variation);
            this.keyMapCache[key] = variation;
            this.activeVariation = variation;
            this.manualVariation.active = false;
        },
        removeVariation(target) {
            let index = this.variationList.indexOf(target);
            if (index !== -1) {
                this.variationList.splice(index, 1);
            }

            let manualIndex = this.manualVariationsCache.findIndex(v => v._key === target._key);
            if (manualIndex !== -1) {
                this.manualVariationsCache.splice(manualIndex, 1);
            }

            delete this.keyMapCache[target._key];
        },
        _generateCombinations(attributes, index = 0, current = {}, results = []) {
            if (results.length >= this.field.props.max_variations) {
                return results;
            }

            if (index === attributes.length) {
                results.push({ ...current });
                return results;
            }

            let attr = attributes[index];
            let key = attr.key;
            let choices;

            if (attr.type === "custom") {
                choices = attr.choices;
            } else {
                choices = [];
                let preset = this.field.props.attributes.find(a => a.key === attr.key);
                preset.choices.forEach(c => {
                    if (attr.choices[c.value]?.enabled) {
                        choices.push(c.value);
                    }
                });
            }

            for (let i = 0; i < choices.length; i++) {
                current[key] = attr.type === "custom" ? choices[i].id : choices[i];
                this._generateCombinations(attributes, index + 1, current, results);
            }

            return results;
        },
        randomId(length = 8) {
            let chars = "0123456789abcdefghijklmnopqrstuvwxyz";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            return result;
        },
        beforeSubmit(data, formData) {
            this.$refs.attributes.beforeSubmit(data, formData);

            let variations = {};
            this.variationList.forEach(v => {
                variations[v.id] = {
                    attributes: v.attributes,
                    config: v.config,
                    image: null,
                    enabled: v.enabled
                };

                let fileKey = `files[${this.product.field.key + ".variations." + v.id}][]`;
                if (Array.isArray(v.image) && v.image.length) {
                    let file = v.image[0];
                    if (file.source === "new_upload") {
                        formData.append(fileKey, file.item);
                        variations[v.id].image = "uploaded_file";
                    } else if (file.source === "existing") {
                        variations[v.id].image = file.id;
                    }
                }

                if (v.enabled && !this.hasValidPrice(v)) {
                    variations[v.id].enabled = false;
                }
            });

            this.value.variations = variations;
            this.value.manual_mode = this.manualMode;
        },
        enableManualVariationsForEditing() {
            this.variationList.forEach(v => {
                if (v._manual && !v.enabled) {
                    v.enabled = true;
                }
            });
        },
        hasValidPrice(variation) {
            return typeof variation.config.base_price.amount === "number";
        },
        hasValidStock(variation) {
            if (!this.field.props.stock.enabled) return true;
            if (!variation.config.stock.enabled) return true;
            return variation.config.stock.quantity >= 1;
        }
    },
    computed: {
        currentAttributes() {
            return this.filteredAttributes;
        }
    }
};

/**
 * PRODUCT CUSTOM PRICES SINGLE
 * Single custom price rule configuration
 */
const ProductCustomPricesSingle = {
    template: "#product-custom-prices-single",
    props: { product: Object, customPrices: Object, pricing: Object, productType: Object },
    data() {
        return {};
    },
    created() {
        if (this.customPrices.field.props.addons.enabled) {
            this.handleCustomChoices();
        }
    },
    methods: {
        createCondition() {
            this.pricing.conditions.push({
                type: "day_of_week",
                days: [],
                date: null,
                range: { from: null, to: null }
            });
        },
        deleteCondition(condition) {
            this.pricing.conditions.splice(this.pricing.conditions.indexOf(condition), 1);
        },
        conditionKey(index, suffix = "") {
            suffix = suffix.length ? "." + suffix : "";
            return `${this.product.field.key}.${this.customPrices.field.key}.conditions.` + index + suffix;
        },
        conditionLabel(condition) {
            if (condition.type === "day_of_week") {
                return Object.keys(this.customPrices.field.props.weekdays)
                    .filter(d => condition.days.includes(d))
                    .map(d => this.customPrices.field.props.weekdays[d])
                    .join(", ");
            }
            if (condition.type === "date") {
                let date = new Date(condition.date + "T00:00:00");
                if (date && isFinite(date)) {
                    return Voxel.helpers.dateFormat(date);
                }
            }
            if (condition.type === "date_range") {
                let from = new Date(condition.range.from + "T00:00:00");
                let to = new Date(condition.range.to + "T00:00:00");
                if (from && to && isFinite(from) && isFinite(to)) {
                    return Voxel.helpers.dateFormat(from) + " - " + Voxel.helpers.dateFormat(to);
                }
            }
            return "";
        },
        toggleDay(day, condition) {
            let index = condition.days.indexOf(day);
            if (index !== -1) {
                condition.days.splice(index, 1);
            } else {
                condition.days.push(day);
            }
        },
        isAddonActive(addonKey) {
            let addon = this.productType.fields.addons.props.addons[addonKey];
            let value = this.productType.value.addons[addonKey];
            let active = addon.required || value.enabled;

            if (["select", "multiselect"].includes(addon.type)) {
                let hasPrice = false;
                for (let choice of Object.values(value.choices)) {
                    if (choice.price !== null && choice.price !== "") {
                        hasPrice = true;
                        break;
                    }
                }
                active = active && hasPrice;
            }

            if (["custom-select", "custom-multiselect"].includes(addon.type)) {
                let hasPrice = false;
                for (let choice of this.getAddonRef(addonKey).list) {
                    if (choice.price !== null && choice.price !== "") {
                        hasPrice = true;
                        break;
                    }
                }
                active = active && hasPrice;
            }

            return active;
        },
        isChoiceActive(choice, addonKey) {
            let addon = this.productType.fields.addons.props.addons[addonKey];
            let value = this.productType.value.addons[addonKey];

            if (addon.type === "select" || addon.type === "multiselect") {
                return value.choices[choice.value].price !== null && value.choices[choice.value].price !== "";
            }
            return choice.price !== null && choice.price !== "";
        },
        handleCustomChoices() {
            if (this.pricing.prices.addons === null) return;

            Object.keys(this.pricing.prices.addons).forEach(addonKey => {
                let addon = this.productType.fields.addons.props.addons[addonKey];
                if (addon.type === "custom-select" || addon.type === "custom-multiselect") {
                    let ref = this.getAddonRef(addonKey);
                    if (!this.pricing.prices.addons[addonKey]) {
                        this.pricing.prices.addons[addonKey] = {};
                    }

                    let updatePrices = (list) => {
                        let current = this.pricing.prices.addons[addonKey];
                        this.pricing.prices.addons[addonKey] = {};
                        list.forEach(choice => {
                            if (!this.pricing.prices.addons[addonKey][choice.value]) {
                                this.pricing.prices.addons[addonKey][choice.value] = {
                                    price: current[choice.value]?.price
                                };
                            }
                        });
                    };

                    updatePrices(ref.list);
                    this.$watch(() => ref.list, (list) => updatePrices(list), { deep: true });
                }
            });
        },
        getAddonRef(addonKey) {
            return this.product.$refs[`type:${this.productType.key}-field:addons`][0].$refs["addon:" + addonKey][0];
        }
    }
};

/**
 * PRODUCT CUSTOM PRICES
 * Container for multiple custom price rules
 */
const ProductCustomPrices = {
    template: "#product-custom-prices",
    props: { product: Object, field: Object, productType: Object },
    components: {
        singlePrice: ProductCustomPricesSingle
    },
    data() {
        return {
            value: this.productType.value.custom_prices,
            active: null
        };
    },
    methods: {
        createPrice() {
            this.value.list.push({
                enabled: true,
                label: "",
                conditions: [],
                prices: structuredClone(Vue.toRaw(this.field.props.prices_schema))
            });
            this.active = this.value.list.at(-1);
            this.$nextTick(() => {
                this.$refs.prices.$el.querySelector(".ts-field-repeater:not(.collapsed) .ts-pricing-label .ts-filter")?.focus();
            });
        },
        deletePrice(price) {
            this.value.list.splice(this.value.list.indexOf(price), 1);
        }
    }
};

/**
 * FIELD: PRODUCT
 * Main product field orchestrating all product sub-components
 */
const FieldProduct = {
    template: "#create-post-product-field",
    props: { field: Object },
    components: {
        "field-addons": ProductAddons,
        "field-base-price": ProductBasePrice,
        "field-booking": ProductBooking,
        "field-deliverables": ProductDeliverables,
        "field-shipping": ProductShipping,
        "field-stock": ProductStock,
        "field-subscription-interval": ProductSubscriptionInterval,
        "field-variations": ProductVariations,
        "field-custom-prices": ProductCustomPrices
    },
    data() {
        return {
            product_type: null
        };
    },
    created() {
        this.set_initial_product_type();
    },
    methods: {
        set_initial_product_type() {
            let productType = this.field.props.product_types[this.field.value.product_type];
            this.product_type = productType;
            productType.value = this.field.value;
        },
        set_product_type(key) {
            let productType = this.field.props.product_types[key];
            productType.value.enabled = true;
            this.field.value = productType.value;
            this.product_type = productType;
        },
        onSubmit(data, formData) {
            Object.values(this.product_type.fields).forEach(field => {
                let ref = this.$refs[`type:${this.product_type.key}-field:` + field.key]?.[0];
                if (typeof ref?.beforeSubmit === "function") {
                    ref.beforeSubmit(data, formData);
                }
            });
            data[this.field.key] = this.field.value;
            this.$refs.deliverables?.onSubmit(data[this.field.key], formData);
        },
        validate(val) {
            if (this.$root.shouldValidate()) {
                let errors = [];
                let isEmpty = true;

                if (this.field.required || val.enabled) {
                    isEmpty = false;
                }

                if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
                    errors.push(this.$root.get_error("required"));
                }
                this.field.validation.errors = errors;
            }
        }
    }
};


/* ==========================================================================
   SECTION 2C: FILE UPLOAD COMPONENT
   ========================================================================== */

/**
 * FILE UPLOAD
 * Reusable file upload component with drag-drop and media library
 */
const FileUpload = {
    template: "#vx-file-upload",
    props: {
        field: Object,
        sortable: { type: Boolean, default: true },
        allowedFileTypes: String,
        maxFileCount: { type: Number, default: 1 },
        modelValue: Array,
        context: Object
    },
    emits: ["update:modelValue"],
    data() {
        return {
            dragActive: false,
            reordering: false,
            value: this.modelValue,
            id: "file-upload-" + Voxel.helpers.sequentialId()
        };
    },
    mounted() {
        jQuery(this.$refs.input).on("change", (e) => {
            for (let i = 0; i < e.target.files.length; i++) {
                this.pushFile(e.target.files[i]);
            }
            this.$refs.input.value = "";
            this.update();
        });
    },
    unmounted() {
        setTimeout(() => {
            if (Array.isArray(this.value)) {
                this.value.forEach(file => {
                    if (file.source === "new_upload") {
                        URL.revokeObjectURL(file.preview);
                    }
                });
            }
        }, 10);
    },
    methods: {
        getStyle(file) {
            return file.type.startsWith("image/")
                ? `background-image: url('${file.preview}');`
                : "";
        },
        pushFile(file) {
            if (this.maxFileCount === 1) {
                this.value = [];
            }

            let fileObj = {
                source: "new_upload",
                name: file.name,
                type: file.type,
                size: file.size,
                preview: URL.createObjectURL(file),
                item: file,
                _id: Voxel.helpers.randomId(8)
            };

            if (window._vx_file_upload_cache === undefined) {
                window._vx_file_upload_cache = [];
            }

            let existing = window._vx_file_upload_cache.find(e =>
                e.item.name === file.name &&
                e.item.type === file.type &&
                e.item.size === file.size &&
                e.item.lastModified === file.lastModified
            );

            if (existing) {
                this.value.push(existing);
            } else {
                this.value.push(fileObj);
                window._vx_file_upload_cache.unshift(fileObj);
            }
        },
        onDrop(e) {
            this.dragActive = false;
            if (e.dataTransfer.items) {
                [...e.dataTransfer.items].forEach(item => {
                    if (item.kind === "file") {
                        this.pushFile(item.getAsFile());
                    }
                });
            } else {
                [...e.dataTransfer.files].forEach(file => {
                    this.pushFile(file);
                });
            }
            this.update();
        },
        onMediaPopupSave(files) {
            if (this.maxFileCount === 1) {
                this.value = [];
            }

            let added = {};
            this.value.forEach(file => {
                if (file.source === "existing") added[file.id] = true;
                if (file.source === "new_upload") added[file._id] = true;
            });

            Object.values(files).forEach(file => {
                if (file.source === "existing" && !added[file.id]) {
                    this.value.push(file);
                }
                if (file.source === "new_upload" && !added[file._id]) {
                    this.value.push(file);
                }
            });

            this.update();
        },
        update() {
            this.$emit("update:modelValue", this.value);
        }
    },
    watch: {
        modelValue(val) {
            this.value = val;
        }
    }
};


/* ==========================================================================
   SECTION 3: MAIN APP & VALIDATION Mixin
   ========================================================================== */

const ConditionMixin = {
    methods: {
        setupConditions(fields) {
            Object.values(fields).forEach((field) => {
                if (field.conditions) {
                    field.conditions.forEach((group) => {
                        group.forEach((condition) => {
                            let [sourceKey, sourceProp] = condition.source.split(".");
                            let sourceField = fields[sourceKey];

                            if (sourceField) {
                                let getValue = () => {
                                    let val = sourceField.value;
                                    if (sourceProp !== undefined) return val ? val[sourceProp] : null;
                                    return val;
                                };

                                this.evaluateCondition(condition, getValue(), field, sourceField);

                                this.$watch(() => {
                                    return { value: getValue(), _passes: this.conditionsPass(sourceField) };
                                }, (newVal, oldVal) => {
                                    this.evaluateCondition(condition, newVal.value, field, sourceField);
                                }, { deep: true });

                            } else {
                                condition._passes = false;
                            }
                        });
                    });
                }
            });
        },
        evaluateCondition(condition, value, targetField, sourceField) {
            let handler = Voxel.conditionHandlers[condition.type];
            if (handler) {
                condition._passes = this.conditionsPass(sourceField) && handler(condition, value, targetField, sourceField);
            }
        },
        conditionsPass(field) {
            if (this.$root.widget === 'create-post' && field.type !== 'ui-step') {
                // Check step visibility first
                let step = this.$root.fields[field.step];
                if (step && !this.conditionsPass(step)) return false;
            }

            if (!field.conditions) return true;

            let pass = false;
            field.conditions.forEach(group => {
                if (group.length) {
                    let groupPass = true;
                    group.forEach(c => { if (!c._passes) groupPass = false; });
                    if (groupPass) pass = true;
                }
            });

            return field.conditions_behavior === 'hide' ? !pass : pass;
        }
    },
};


/**
 * CONDITION HANDLERS
 * Used for conditional field visibility based on other field values.
 * Each handler takes (condition, value) and returns boolean.
 */
window.Voxel.conditionHandlers = {
    // Text conditions
    "text:equals": (c, v) => v === c.value,
    "text:not_equals": (c, v) => v !== c.value,
    "text:empty": (c, v) => !v?.trim()?.length,
    "text:not_empty": (c, v) => !!v?.trim()?.length,
    "text:contains": (c, v) => v?.match(new RegExp(c.value, "i")),

    // Taxonomy conditions
    "taxonomy:contains": (c, v) => Array.isArray(v) && v.includes(c.value),
    "taxonomy:not_contains": (c, v) => !(Array.isArray(v) && v.includes(c.value)),
    "taxonomy:empty": (c, v) => !Array.isArray(v) || !v.length,
    "taxonomy:not_empty": (c, v) => Array.isArray(v) && v.length > 0,

    // Switcher conditions
    "switcher:checked": (c, v) => !!v,
    "switcher:unchecked": (c, v) => !v,

    // Number conditions
    "number:empty": (c, v) => isNaN(parseFloat(v)),
    "number:equals": (c, v) => parseFloat(v) === parseFloat(c.value),
    "number:gt": (c, v) => parseFloat(v) > parseFloat(c.value),
    "number:gte": (c, v) => parseFloat(v) >= parseFloat(c.value),
    "number:lt": (c, v) => parseFloat(v) < parseFloat(c.value),
    "number:lte": (c, v) => parseFloat(v) <= parseFloat(c.value),
    "number:not_empty": (c, v) => !isNaN(parseFloat(v)),
    "number:not_equals": (c, v) => parseFloat(v) !== parseFloat(c.value),

    // File conditions
    "file:empty": (c, v) => !Array.isArray(v) || !v.length,
    "file:not_empty": (c, v) => Array.isArray(v) && v.length > 0,

    // Date conditions (handles date object with date and time properties)
    "date:empty": (c, v) => !isFinite(new Date(v.date + " " + (v.time || "00:00:00"))),
    "date:gt": (c, v) => {
        let dateVal = new Date(v.date + " " + (v.time || "00:00:00"));
        let compareVal = new Date(c.value);
        if (!isFinite(dateVal) || !isFinite(compareVal)) return false;
        return compareVal < dateVal;
    },
    "date:lt": (c, v) => {
        let dateVal = new Date(v.date + " " + (v.time || "00:00:00"));
        let compareVal = new Date(c.value);
        if (!isFinite(dateVal) || !isFinite(compareVal)) return false;
        return dateVal < compareVal;
    },
    "date:not_empty": (c, v) => isFinite(new Date(v.date + " " + (v.time || "00:00:00")))
};

window.render_create_post = () => {
    Array.from(document.querySelectorAll(".ts-create-post")).forEach((el) => {
        if (el.__vue_app__ || el.classList.contains("no-vue")) return;

        let wrapper = el;
        let configRaw = wrapper.closest(".elementor-element").querySelector(".vxconfig").innerHTML;
        let config = JSON.parse(configRaw);

        const app = Vue.createApp({
            el: wrapper,
            mixins: [Voxel.mixins.base, ConditionMixin],
            data() {
                return {
                    widget: "create-post",
                    config: config,
                    activePopup: null,
                    fields: {},
                    steps: [],
                    post_type: {},
                    post: null,
                    step_index: null,
                    submission: {
                        status: null,
                        processing: false,
                        done: false,
                        message: null,
                        viewLink: null,
                        editLink: null
                    },
                    validateRequired: true,
                };
            },
            created() {
                window.CP = this;
                wrapper.__vue_instance__ = this;

                this.fields = config.fields;
                this.steps = config.steps;
                this.post_type = config.post_type;
                this.post = config.post || null;

                this.setupConditions(this.fields);

                // URL-based step routing
                let stepKey = Voxel.getSearchParam("step");
                let stepIdx = this.activeSteps.findIndex(k => k === stepKey);
                if (stepKey && stepIdx > 0) {
                    this.setStep(stepIdx);
                } else {
                    this.setStep(0);
                }

                // Log any config errors (for debugging)
                config.errors.forEach(error => console.log(error));
            },
            mounted() {
                wrapper.classList.toggle("ts-ready");

                // Notify parent frame in admin mode (for iframe embedding)
                if (config.is_admin_mode) {
                    window.parent.postMessage("create-post:mounted", "*");
                }
            },
            methods: {
                setStep(i) {
                    this.step_index = i;
                    if (this.step_index > 0 && this.currentStep) {
                        Voxel.setSearchParam("step", this.currentStep.key);
                    } else {
                        Voxel.deleteSearchParam("step");
                    }
                },
                prevStep() {
                    if (this.step_index > 0) {
                        this.setStep(this.step_index - 1);
                        this.scrollIntoView();
                    }
                },
                nextStep(validate = false) {
                    if (validate) {
                        let error = this.validateCurrentStep();
                        if (error !== null) {
                            this.$nextTick(() => {
                                window.scrollTo({
                                    top: error.ref.$el?.getBoundingClientRect().top + window.scrollY - 100,
                                    behavior: 'smooth'
                                });
                            });
                            return;
                        }
                    }

                    if (this.step_index < this.steps.length - 1) {
                        this.setStep(this.step_index + 1);
                        this.scrollIntoView();
                    }
                },
                validateCurrentStep() {
                    this.validateRequired = true;
                    let firstError = null;
                    Object.values(this.fields).forEach(field => {
                        let ref = this.$refs["field:" + field.key];
                        if (field.step === this.currentStep.key && !field.is_ui && this.conditionsPass(field) && ref) {
                            ref.validate(field.value);
                            if (firstError === null) {
                                if (field.validation.errors.length) firstError = { field, ref };
                                if (field.type === 'repeater' && ref.hasInvalidRows()) firstError = { field, ref };
                            }
                        }
                    });
                    return firstError;
                },
                validateAllFields() {
                    let firstError = null;
                    Object.values(this.fields).forEach(field => {
                        let ref = this.$refs["field:" + field.key];
                        if (!field.is_ui && this.conditionsPass(field) && ref) {
                            ref.validate(field.value);
                            if (firstError === null) {
                                if (field.validation.errors.length) firstError = { field, ref };
                                if (field.type === 'repeater' && ref.hasInvalidRows()) firstError = { field, ref };
                            }
                        }
                    });
                    return firstError;
                },
                submit(args = {}) {
                    this.submission.processing = true;

                    if (args.save_as_draft) {
                        this.validateRequired = false;
                    } else {
                        this.validateRequired = true;
                    }

                    let error = this.validateAllFields();
                    if (error !== null) {
                        this.setStep(this.activeSteps.findIndex(k => k === error.field.step));
                        this.$nextTick(() => {
                            window.scrollTo({
                                top: error.ref.$el?.getBoundingClientRect().top + window.scrollY - 100,
                                behavior: 'smooth'
                            });
                        });
                        this.submission.processing = false;
                    } else {
                        // Prepare payload
                        let formData = new FormData();
                        let data = {};

                        Object.values(this.fields).forEach(field => {
                            let ref = this.$refs["field:" + field.key];
                            if (!field.is_ui && this.conditionsPass(field)) {
                                if (ref && typeof ref.onSubmit === 'function') {
                                    ref.onSubmit(data, formData);
                                } else if (field.value !== null) {
                                    data[field.key] = field.value;
                                }
                            }
                        });

                        formData.append("postdata", JSON.stringify(data));

                        // Handle file deduplication with aliases
                        // Voxel uses a smart aliasing system to avoid uploading duplicate files
                        let entries = Object.fromEntries(formData);
                        let fileAliasMap = {};

                        for (let key in entries) {
                            if (key.startsWith("files[")) {
                                let files = formData.getAll(key);
                                let uniqueFiles = [];

                                for (let idx in files) {
                                    let file = files[idx];
                                    if (file instanceof File) {
                                        // Create a unique key based on file properties
                                        let fileKey = JSON.stringify({
                                            name: file.name,
                                            type: file.type,
                                            size: file.size,
                                            lastModified: file.lastModified
                                        });

                                        if (fileAliasMap[fileKey] !== undefined) {
                                            // File already exists, use alias
                                            formData.append(
                                                `_vx_file_aliases[${key.slice(6, -3)}][${idx}][path]`,
                                                fileAliasMap[fileKey].path
                                            );
                                            formData.append(
                                                `_vx_file_aliases[${key.slice(6, -3)}][${idx}][index]`,
                                                fileAliasMap[fileKey].index
                                            );
                                        } else {
                                            // New unique file
                                            uniqueFiles.push(file);
                                            fileAliasMap[fileKey] = {
                                                path: key.slice(6, -3),
                                                index: uniqueFiles.indexOf(file)
                                            };
                                        }
                                    }
                                }

                                // Replace with deduplicated files
                                formData.delete(key);
                                for (let file of uniqueFiles) {
                                    formData.append(key, file);
                                }
                            }
                        }

                        if (args.save_as_draft) formData.append("save_as_draft", "yes");

                        let params = jQuery.param({
                            action: config.is_admin_mode ? "create_post__admin" : "create_post",
                            post_type: this.post_type.key,
                            post_id: this.post?.id,
                            admin_mode: config.is_admin_mode ? config.admin_mode_nonce : null
                        });

                        jQuery.post({
                            url: Voxel_Config.ajax_url + "&" + params,
                            data: formData,
                            contentType: false,
                            processData: false
                        }).always((res) => {
                            this.submission.processing = false;

                            // In admin mode, notify parent frame and skip normal response handling
                            if (config.is_admin_mode) {
                                window.parent.postMessage("create-post:submitted", "*");
                                return;
                            }

                            if (res.success) {
                                this.submission.done = true;
                                this.submission.viewLink = res.view_link;
                                this.submission.editLink = res.edit_link;
                                this.submission.message = res.message;
                                this.submission.status = res.status;
                                this.scrollIntoView();
                            } else {
                                if (res.errors) {
                                    Voxel.alert(res.errors.join("<br>"), "error");
                                } else {
                                    Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                                }
                            }
                        });
                    }
                },
                saveDraft() {
                    this.submit({ save_as_draft: true });
                },
                scrollIntoView() {
                    // Get the closest Elementor element wrapper
                    let el = wrapper.closest(".elementor-element");
                    if (el.getBoundingClientRect().top < 0) {
                        requestAnimationFrame(() => {
                            // Handle iOS Safari scroll quirks
                            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                                document.body.scrollTop = 0;
                                document.documentElement.scrollTop = 0;
                            } else {
                                window.scrollTo({ top: 0, left: 0 });
                            }
                        });
                    }
                },
                toggleRow(e) {
                    // Toggle repeater row collapsed state
                    e.target.closest(".ts-field-repeater").classList.toggle("collapsed");
                },
                replace_vars(template, vars) {
                    // Replace @variable placeholders in error messages
                    Object.keys(vars).forEach(key => {
                        template = template.replaceAll(key, vars[key]);
                    });
                    return template;
                },
                get_error(key) {
                    // Get validation error message by key
                    return this.config.validation_errors[key];
                },
                validate_field(fieldKey) {
                    // Validate a single field by key
                    let ref = this.$refs["field:" + fieldKey];
                    if (typeof ref?.validate === "function") {
                        ref.validate(ref.field.value);
                    } else {
                        console.warn("No validation added for this field type");
                    }
                },
                shouldValidate() {
                    // Check if validation should run (disabled in admin mode)
                    return this.$root.widget === "create-post" && !config.is_admin_mode;
                },
                shouldValidateRequired() {
                    // Check if required field validation is active
                    return this.validateRequired;
                },
                currencyFormat() {
                    // Format currency values using Voxel helper
                    return Voxel.helpers.currencyFormat(...arguments);
                },
                randomId() {
                    // Generate a random ID for internal use
                    return Math.ceil(Math.random() * 100000) + "-" + Voxel.helpers.sequentialId();
                }
            },
            computed: {
                currentStep() { return this.fields[this.activeSteps[this.step_index]]; },
                activeSteps() { return this.steps.filter(k => this.conditionsPass(this.fields[k])); }
            }
        });

        // Apply ConditionMixin to the app
        app.mixin(ConditionMixin);

        // Register Core Components
        app.component("form-popup", Voxel.components.popup);
        app.component("form-group", Voxel.components.formGroup);
        app.component("media-popup", MediaPopup);
        app.component("term-list", TermList);

        // Register Field Components - Basic Fields
        app.component("field-title", FieldTitle);
        app.component("field-text", FieldText);
        app.component("field-texteditor", FieldTextEditor);
        app.component("field-description", FieldDescription);
        app.component("field-number", FieldNumber);
        app.component("field-email", FieldEmail);
        app.component("field-url", FieldUrl);
        app.component("field-file", FieldFile);
        app.component("field-image", FieldFile);
        app.component("field-profile-avatar", FieldFile);
        app.component("field-profile-name", FieldProfileName);
        app.component("field-profile-first-name", FieldText);
        app.component("field-profile-last-name", FieldText);
        app.component("field-profile-bio", FieldTextEditor);
        app.component("field-taxonomy", FieldTaxonomy);
        app.component("field-phone", FieldPhone);
        app.component("field-switcher", FieldSwitcher);
        app.component("field-location", FieldLocation);
        app.component("field-work-hours", FieldWorkHours);

        // Register Field Components - Product Field
        app.component("field-product", FieldProduct);

        // Register Field Components - UI Fields (no value, display only)
        app.component("field-ui-image", FieldUiImage);
        app.component("field-ui-heading", FieldUiHeading);
        app.component("field-ui-html", FieldUiHtml);
        app.component("field-ui-step", FieldUiStep);

        // Register Field Components - Complex Fields
        app.component("field-repeater", FieldRepeater);
        app.component("field-timezone", FieldTimezone);
        app.component("field-recurring-date", FieldRecurringDate);
        app.component("field-date", FieldDate);
        app.component("field-time", FieldTime);
        app.component("field-select", FieldSelect);
        app.component("field-multiselect", FieldMultiselect);
        app.component("field-color", FieldColor);
        app.component("field-post-relation", FieldPostRelation);

        // Register Utility Components
        app.component("draggable", typeof vuedraggable === "object" ? vuedraggable : {});
        app.component("file-upload", FileUpload);
        app.component("inline-template", { template: "<slot></slot>" });

        // Register Inline Date Input Components
        app.component("single-date-input", {
            template: '<div><input type="hidden" ref="input"></div>',
            props: ["modelValue", "minDate"],
            emits: ["update:modelValue"],
            data() {
                return { picker: null };
            },
            mounted() {
                this.picker = new Pikaday({
                    field: this.$refs.input,
                    container: this.$el,
                    bound: false,
                    firstDay: 1,
                    keyboardInput: false,
                    defaultDate: this.modelValue ? new Date(this.modelValue) : null,
                    onSelect: (date) => {
                        this.$emit("update:modelValue", Voxel.helpers.dateFormatYmd(date));
                    },
                    selectDayFn: (date) => {
                        return this.modelValue && this.modelValue === Voxel.helpers.dateFormatYmd(date);
                    },
                    disableDayFn: (date) => {
                        if (this.minDate && date < this.minDate) return true;
                        return false;
                    }
                });
            },
            unmounted() {
                setTimeout(() => this.picker.destroy(), 200);
            },
            watch: {
                modelValue() { this.picker.draw(); }
            }
        });

        app.component("date-range-input", {
            template: '<div class="ts-booking-date ts-booking-date-range"><input type="hidden" ref="input"></div>',
            props: ["modelValue", "minDate", "startDate", "endDate"],
            emits: ["update:modelValue"],
            data() {
                return {
                    picker: null,
                    activePicker: "start",
                    value: {
                        start: this.startDate || null,
                        end: this.endDate || null
                    }
                };
            },
            mounted() {
                this.picker = new Pikaday({
                    field: this.$refs.input,
                    container: this.$el,
                    bound: false,
                    firstDay: 1,
                    keyboardInput: false,
                    numberOfMonths: 2,
                    defaultDate: this.value.start,
                    startRange: this.value.start,
                    endRange: this.value.end,
                    theme: "pika-range",
                    onSelect: (date) => {
                        if (this.activePicker === "start") {
                            this.setStartDate(date);
                            this.activePicker = "end";
                        } else {
                            this.setEndDate(date);
                            this.activePicker = "start";
                            this.$emit("update:modelValue", {
                                start: Voxel.helpers.dateFormatYmd(this.value.start),
                                end: Voxel.helpers.dateFormatYmd(this.value.end)
                            });
                        }
                    },
                    selectDayFn: (date) => {
                        if (this.value.start && date.toDateString() === this.value.start.toDateString()) return true;
                        if (this.value.end && date.toDateString() === this.value.end.toDateString()) return true;
                        return false;
                    },
                    disableDayFn: (date) => {
                        if (this.activePicker === "end" && this.value.start && date < this.value.start) return true;
                        if (this.minDate && date < this.minDate) return true;
                        return false;
                    }
                });
                this.setStartDate(this.value.start);
                this.setEndDate(this.value.end);
            },
            unmounted() {
                setTimeout(() => this.picker.destroy(), 200);
            },
            methods: {
                setStartDate(date) {
                    this.value.start = date;
                    this.picker.setStartRange(date);
                    if (this.value.end && this.value.start > this.value.end) {
                        this.setEndDate(null);
                    }
                },
                setEndDate(date) {
                    this.value.end = date;
                    this.picker.setEndRange(date);
                }
            },
            watch: {
                activePicker() { this.picker.draw(); },
                value: {
                    handler() { this.picker.draw(); },
                    deep: true
                }
            }
        });

        // Init Icons
        let icons = JSON.parse(wrapper.closest(".elementor-element").querySelector(".vxconfig__icons").innerHTML);
        Object.keys(icons).forEach(k => {
            app.component("icon-" + k, { template: icons[k] || "<!-- icon -->" });
        });

        // Dispatch init event for extensions
        document.dispatchEvent(new CustomEvent("voxel/create-post/init", { detail: { app, config, el: wrapper } }));

        app.mount(wrapper);
    });
};

window.render_create_post();
jQuery(document).on("voxel:markup-update", window.render_create_post);
