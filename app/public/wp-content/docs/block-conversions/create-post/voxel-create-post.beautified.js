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
        id() {
            return this.field.id + "." + Object.values(arguments).join(".") + "." + this.index;
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
        }
        // scroll helpers...
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


window.Voxel.conditionHandlers = {
    "text:equals": (c, v) => v === c.value,
    "text:not_equals": (c, v) => v !== c.value,
    "text:empty": (c, v) => !v?.trim()?.length,
    "text:not_empty": (c, v) => !!v?.trim()?.length,
    "switcher:checked": (c, v) => !!v,
    "switcher:unchecked": (c, v) => !v,
    "number:equals": (c, v) => v === parseFloat(c.value),
    "number:not_equals": (c, v) => v !== parseFloat(c.value),
    "number:greater_than": (c, v) => v > parseFloat(c.value),
    "number:less_than": (c, v) => v < parseFloat(c.value),
    "number:empty": (c, v) => v === null || v === undefined,
    "number:not_empty": (c, v) => v !== null && v !== undefined,
    "select:equals": (c, v) => v === c.value,
    "select:not_equals": (c, v) => v !== c.value,
    "select:any_of": (c, v) => c.value.includes(v),
    "select:none_of": (c, v) => !c.value.includes(v),
    "select:empty": (c, v) => !v,
    "select:not_empty": (c, v) => !!v,
    "date:equals": (c, v) => v === c.value,
    "date:not_equals": (c, v) => v !== c.value,
    "date:after": (c, v) => v > c.value,
    "date:before": (c, v) => v < c.value,
    "date:empty": (c, v) => !v,
    "date:not_empty": (c, v) => !!v,
    "file:empty": (c, v) => !Array.isArray(v) || !v.length,
    "file:not_empty": (c, v) => Array.isArray(v) && v.length > 0,
    "taxonomy:any_of": (c, v) => {
        if (!Array.isArray(v) || !v.length) return false;
        return v.some(term => c.value.includes(term));
    },
    "taxonomy:none_of": (c, v) => {
        if (!Array.isArray(v) || !v.length) return true;
        return !v.some(term => c.value.includes(term));
    },
    "taxonomy:empty": (c, v) => !Array.isArray(v) || !v.length,
    "taxonomy:not_empty": (c, v) => Array.isArray(v) && v.length > 0
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
                this.fields = config.fields;
                this.steps = config.steps;
                this.post_type = config.post_type;
                this.post = config.post || null;

                this.setupConditions(this.fields);

                // Routing
                let stepKey = Voxel.getSearchParam("step");
                let stepIdx = this.activeSteps.findIndex(k => k === stepKey);
                if (stepKey && stepIdx > 0) {
                    this.setStep(stepIdx);
                } else {
                    this.setStep(0);
                }
            },
            mounted() {
                wrapper.classList.toggle("ts-ready");
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

                        // Handle file aliases - map FormData file entries back to actual File objects
                        let entries = Object.fromEntries(formData);
                        let fileAliases = {};
                        let aliasIndex = 0;

                        for (let key in entries) {
                            if (key.startsWith("files[")) {
                                let files = formData.getAll(key);
                                files.forEach((file, idx) => {
                                    if (file instanceof File) {
                                        let alias = `__file_${aliasIndex++}`;
                                        fileAliases[alias] = file;
                                        formData.delete(key);
                                    }
                                });

                                // Re-append with aliases
                                Object.keys(fileAliases).forEach(alias => {
                                    formData.append(key, fileAliases[alias]);
                                });
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
                            if (res.success) {
                                this.submission.done = true;
                                this.submission.viewLink = res.view_link;
                                this.submission.editLink = res.edit_link;
                                this.submission.message = res.message;
                                this.submission.status = res.status;
                                this.scrollIntoView();
                            } else {
                                if (res.errors) Voxel.alert(res.errors.join("<br>"), "error");
                                else Voxel.alert(res.message || Voxel_Config.l10n.ajaxError, "error");
                            }
                        });
                    }
                },
                saveDraft() {
                    this.submit({ save_as_draft: true });
                },
                scrollIntoView() {
                    let el = this.$el;
                    if (!el) return;

                    let rect = el.getBoundingClientRect();
                    let isInView = (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                    );

                    if (!isInView) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            },
            computed: {
                currentStep() { return this.fields[this.activeSteps[this.step_index]]; },
                activeSteps() { return this.steps.filter(k => this.conditionsPass(this.fields[k])); }
            }
        });

        // Register Components
        app.component("form-popup", Voxel.components.popup);
        app.component("form-group", Voxel.components.formGroup);
        app.component("media-popup", MediaPopup);
        app.component("term-list", TermList);

        // Register Fields
        app.component("field-title", FieldTitle);
        app.component("field-text", FieldText);
        app.component("field-texteditor", FieldTextEditor);
        app.component("field-description", FieldDescription);
        app.component("field-number", FieldNumber);
        app.component("field-email", FieldEmail);
        app.component("field-url", FieldUrl);
        app.component("field-file", FieldFile);
        app.component("field-image", FieldFile);
        app.component("field-taxonomy", FieldTaxonomy);
        app.component("field-switcher", FieldSwitcher);
        app.component("field-location", FieldLocation);
        app.component("field-work-hours", FieldWorkHours);
        app.component("field-repeater", FieldRepeater);
        app.component("field-phone", FieldPhone);
        app.component("field-profile-name", FieldProfileName);
        app.component("field-ui-step", FieldUiStep);
        app.component("field-ui-heading", FieldUiHeading);
        app.component("field-ui-html", FieldUiHtml);
        app.component("field-ui-image", FieldUiImage);
        app.component("field-product", FieldProduct);
        app.component("field-recurring-date", FieldRecurringDate);

        // Init Icons
        let icons = JSON.parse(wrapper.closest(".elementor-element").querySelector(".vxconfig__icons").innerHTML);
        Object.keys(icons).forEach(k => {
            app.component("icon-" + k, { template: icons[k] || "<!-- icon -->" });
        });

        document.dispatchEvent(new CustomEvent("voxel/create-post/init", { detail: { app, config, el: wrapper } }));

        app.mount(wrapper);
    });
};

window.render_create_post();
jQuery(document).on("voxel:markup-update", window.render_create_post);
