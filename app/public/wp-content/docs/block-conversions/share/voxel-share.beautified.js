/**
 * ============================================================================
 * VOXEL SHARE DIALOG - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/share.js
 * Size: 1.3KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * Provides social sharing functionality for posts via popup dialog.
 * Supports multiple sharing methods:
 * - Social networks (Facebook, Twitter, LinkedIn, etc.)
 * - Native share API (mobile devices)
 * - Copy link to clipboard
 *
 * CORRESPONDING FSE BLOCK:
 * Used as a popup utility, not a standalone block
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup (popup component)
 * - Voxel.copy (clipboard utility)
 * - Voxel.share (native share API wrapper)
 * - Voxel.alert (notification system)
 *
 * CSS CLASSES:
 * - .ts-share-post: Main container element
 *
 * ============================================================================
 */

/**
 * DATA-CONFIG FORMAT (in data-config attribute):
 *
 * {
 *   "title": "Post Title",
 *   "link": "https://example.com/post-slug"
 * }
 */

/**
 * API ENDPOINT:
 * GET {ajax_url}&action=share.get_networks
 *
 * REQUEST PARAMETERS:
 * - title: Post title to share
 * - link: Post URL to share
 *
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "type": "facebook",
 *       "label": "Facebook",
 *       "icon": "lab la-facebook",
 *       "link": "https://www.facebook.com/sharer/sharer.php?u=..."
 *     },
 *     {
 *       "type": "twitter",
 *       "label": "Twitter",
 *       "icon": "lab la-twitter",
 *       "link": "https://twitter.com/intent/tweet?url=..."
 *     },
 *     {
 *       "type": "copy-link",
 *       "label": "Copy Link",
 *       "icon": "las la-link"
 *     },
 *     {
 *       "type": "native-share",
 *       "label": "Share",
 *       "icon": "las la-share"
 *     }
 *   ]
 * }
 */

/**
 * SHARE TYPES:
 * 1. Social Network - Opens popup window with share URL
 * 2. copy-link - Copies URL to clipboard using Voxel.copy()
 * 3. native-share - Uses navigator.share() API (mobile only)
 *
 * FEATURES:
 * - Lazy loading of share networks (loaded on first open)
 * - Conditional display (native-share only if supported)
 * - Popup positioning via Voxel.components.popup
 * - Centered popup windows for social sharing
 */

((e) => {
    "function" == typeof define && define.amd ? define("share", e) : e();
})(function () {
    ((window.render_share_dialog = () => {
        Array.from(document.querySelectorAll(".ts-share-post")).forEach((e) => {
            if (!e.__vue_app__) {
                let i = JSON.parse(e.dataset.config);
                var t = Vue.createApp({
                    el: e,
                    template: e.innerHTML,
                    mixins: [Voxel.mixins.base],
                    data() {
                        return { active: !1, loading: !0, list: null };
                    },
                    methods: {
                        open() {
                            (null === this.list &&
                                jQuery
                                    .get(Voxel_Config.ajax_url + "&action=share.get_networks", {
                                        title: i.title,
                                        link: i.link,
                                    })
                                    .always((e) => {
                                        ((this.loading = !1),
                                            e.success
                                                ? (this.list = e.data)
                                                : (Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error"),
                                                    (this.active = !1)),
                                            this.$nextTick(() => this.$refs.popup?.reposition()));
                                    }),
                                (this.active = !0));
                        },
                        shouldShow(e) {
                            return "native-share" !== e.type || !!navigator.share;
                        },
                        share(e) {
                            var t, o;
                            "copy-link" === e.type
                                ? (Voxel.copy(i.link), (this.active = !1))
                                : "native-share" === e.type
                                    ? (Voxel.share({ title: i.title, url: i.link }), (this.active = !1))
                                    : ((t = window.top.outerHeight / 2 + window.top.screenY - 240),
                                        (o = window.top.outerWidth / 2 + window.top.screenX - 320),
                                        window.open(
                                            e.link,
                                            window,
                                            "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes," +
                                            (`width=640,height=480,top=${t},left=` + o),
                                        ));
                        },
                    },
                });
                (t.component("popup", Voxel.components.popup), t.mount(e));
            }
        });
    }),
        window.render_share_dialog(),
        jQuery(document).on("voxel:markup-update", window.render_share_dialog));
});
