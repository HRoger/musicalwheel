/**
 * ============================================================================
 * VOXEL VISITS CHART WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/visits-chart.js
 * Size: 2KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * Displays visit/view statistics chart for posts with time period selection.
 * Shows page views, unique visitors, or other tracking metrics over time.
 * Includes interactive chart with hover popups and drag scrolling.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/visit-chart/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.alert (notification system)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 *
 * CSS CLASSES:
 * - .ts-visits-chart: Main container element
 * - .vxconfig: Script tag containing configuration JSON
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "source": "post" | "user",
 *   "post_id": 123,
 *   "view_type": "views" | "unique_views",
 *   "nonce": "wp_nonce_value",
 *   "charts": {
 *     "7d": {
 *       "label": "Last 7 Days",
 *       "loaded": false,
 *       "data": [],
 *       "error": false
 *     },
 *     "30d": {
 *       "label": "Last 30 Days",
 *       "loaded": false,
 *       "data": [],
 *       "error": false
 *     },
 *     "90d": { ... },
 *     "1y": { ... }
 *   },
 *   "active_chart": "7d"
 * }
 *
 * CHART DATA STRUCTURE (loaded via AJAX):
 * {
 *   "label": "Last 7 Days",
 *   "loaded": true,
 *   "data": [
 *     {
 *       "date": "2025-12-22",
 *       "count": 45,
 *       "details": "45 views"
 *     }
 *   ],
 *   "total": 315
 * }
 */

/**
 * API ENDPOINT:
 * GET {ajax_url}&action=tracking.get_chart_data
 *
 * REQUEST PARAMETERS:
 * - source: "post" or "user"
 * - post_id: Post ID to track
 * - timeframe: "7d", "30d", "90d", "1y"
 * - view_type: "views" or "unique_views"
 * - _wpnonce: Security nonce
 *
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": {
 *     "label": "Last 7 Days",
 *     "loaded": true,
 *     "data": [...],
 *     "total": 315
 *   }
 * }
 */

/**
 * FEATURES:
 * 1. Lazy Loading - Charts load on demand when selected
 * 2. Time Period Selection - 7d, 30d, 90d, 1y options
 * 3. Interactive Chart - Hover to see daily details
 * 4. Drag Scrolling - Mouse drag to scroll horizontal chart
 * 5. Auto-scroll - Scrolls to latest data on load
 * 6. Error Handling - Shows error state if data fails to load
 */

((t) => {
    "function" == typeof define && define.amd ? define("visitsChart", t) : t();
})(function () {
    ((window.render_visits_chart = () => {
        Array.from(document.querySelectorAll(".ts-visits-chart")).forEach((t) => {
            t.__vue_app__ ||
                ((t) => {
                    let r = JSON.parse(t.closest(".elementor-element").querySelector(".vxconfig").innerHTML);
                    return Vue.createApp({
                        el: t,
                        mixins: [Voxel.mixins.base],
                        data() {
                            return {
                                loading: !1,
                                charts: r.charts,
                                view_type: r.view_type,
                                active_chart: r.charts[r.active_chart] ? r.active_chart : "7d",
                                activeItem: null,
                                scrollArea: { isDown: !1, scrollLeft: null, startX: null },
                            };
                        },
                        mounted() {
                            this.$nextTick(() => this.dragScroll());
                        },
                        methods: {
                            loadChart(e) {
                                ((this.loading = !0),
                                    jQuery
                                        .get(Voxel_Config.ajax_url + "&action=tracking.get_chart_data", {
                                            source: r.source,
                                            post_id: r.post_id,
                                            timeframe: e,
                                            view_type: r.view_type,
                                            _wpnonce: r.nonce,
                                        })
                                        .always((t) => {
                                            ((this.loading = !1),
                                                t.success
                                                    ? (this.charts[e] = t.data)
                                                    : ((this.charts[e].error = !0),
                                                        Voxel.alert(t.message || Voxel_Config.l10n.ajaxError, "error")));
                                        }));
                            },
                            showPopup(t, e) {
                                this.activeItem = e;
                                let r = t.target.getBoundingClientRect(),
                                    s = this.$refs.popup;
                                this.$nextTick(() => {
                                    ((s.style.top = r.top + "px"),
                                        window.innerWidth - r.right >= s.offsetWidth + 10
                                            ? (s.style.left = r.left + r.width + 10 + "px")
                                            : (s.style.left = r.left - s.offsetWidth - 10 + "px"));
                                });
                            },
                            hidePopup() {
                                this.activeItem = null;
                            },
                            dragScroll() {
                                let e = this.$refs.scrollArea;
                                e &&
                                    (e.addEventListener("mouseup", () => (this.scrollArea.isDown = !1)),
                                        e.addEventListener("mouseleave", () => (this.scrollArea.isDown = !1)),
                                        e.addEventListener("mousedown", (t) => {
                                            ((this.scrollArea.isDown = !0),
                                                (this.scrollArea.startX = t.pageX - e.offsetLeft),
                                                (this.scrollArea.scrollLeft = e.scrollLeft));
                                        }),
                                        e.addEventListener("mousemove", (t) => {
                                            this.scrollArea.isDown &&
                                                (t.preventDefault(),
                                                    (t = t.pageX - e.offsetLeft - this.scrollArea.startX),
                                                    (e.scrollLeft = this.scrollArea.scrollLeft - t));
                                        }),
                                        requestAnimationFrame(() => (e.scrollLeft = e.scrollWidth)));
                            },
                        },
                        computed: {
                            currentChart() {
                                return (
                                    !1 === this.charts[this.active_chart].loaded && this.loadChart(this.active_chart),
                                    this.charts[this.active_chart]
                                );
                            },
                        },
                        watch: {
                            currentChart() {
                                this.$nextTick(() => this.dragScroll());
                            },
                        },
                    });
                })(t).mount(t);
        });
    }),
        window.render_visits_chart(),
        jQuery(document).on("voxel:markup-update", window.render_visits_chart));
});
