/**
 * ============================================================================
 * VOXEL VENDOR STATS (SALES CHART) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/vendor-stats.js
 * Size: 1.8KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * Displays sales statistics chart for vendors using Stripe Connect.
 * Shows revenue data with time period navigation (this week, last week, etc.)
 * Includes interactive chart with hover popups showing order details.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/sales-chart/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.alert (notification system)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 *
 * CSS CLASSES:
 * - .ts-vendor-stats: Main container element
 * - .vxconfig: Script tag containing configuration JSON
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "charts": {
 *     "this-week": {
 *       "label": "This Week",
 *       "data": [
 *         {
 *           "date": "2025-12-22",
 *           "amount": 150.00,
 *           "orders": 5,
 *           "order_ids": [123, 124, 125, 126, 127]
 *         }
 *       ],
 *       "meta": {
 *         "total": 750.00,
 *         "state": {
 *           "date": "2025-12-22"
 *         }
 *       }
 *     },
 *     "last-week": { ... },
 *     "this-month": { ... },
 *     "last-month": { ... }
 *   },
 *   "activeChart": "this-week"
 * }
 *
 * CHART DATA STRUCTURE:
 * Each chart contains:
 * - label: Display name for the time period
 * - data: Array of daily statistics
 * - meta: Totals and navigation state
 */

/**
 * API ENDPOINT:
 * GET {ajax_url}&action=stripe_connect.sales_chart.get_data
 *
 * REQUEST PARAMETERS:
 * - chart: Chart key (e.g., "this-week")
 * - date: Current date for navigation
 * - direction: "prev" or "next" for time navigation
 *
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": {
 *     "label": "This Week",
 *     "data": [...],
 *     "meta": {...}
 *   }
 * }
 */

/**
 * FEATURES:
 * 1. Time Period Selection - Switch between week/month views
 * 2. Navigation - Previous/Next buttons to navigate time periods
 * 3. Interactive Chart - Hover to see order details
 * 4. Drag Scrolling - Mouse drag to scroll horizontal chart
 * 5. Auto-refresh - Updates on voxel:markup-update event
 */

((e) => {
    "function" == typeof define && define.amd ? define("vendorStats", e) : e();
})(function () {
    ((window.render_vendor_stats = () => {
        Array.from(document.querySelectorAll(".ts-vendor-stats")).forEach((e) => {
            e.__vue_app__ ||
                ((e) => {
                    let t = JSON.parse(e.closest(".elementor-element").querySelector(".vxconfig").innerHTML);
                    return Vue.createApp({
                        el: e,
                        mixins: [Voxel.mixins.base],
                        data() {
                            return {
                                loading: !1,
                                charts: t.charts,
                                activeChart: t.charts[t.activeChart] ? t.activeChart : "this-week",
                                activeItem: null,
                                scrollArea: { isDown: !1, scrollLeft: null, startX: null },
                            };
                        },
                        mounted() {
                            this.$nextTick(() => this.dragScroll());
                        },
                        methods: {
                            loadMore(e) {
                                ((this.loading = !0),
                                    jQuery
                                        .get(Voxel_Config.ajax_url + "&action=stripe_connect.sales_chart.get_data", {
                                            chart: this.activeChart,
                                            date: this.currentChart.meta.state.date,
                                            direction: e,
                                        })
                                        .always((e) => {
                                            ((this.loading = !1),
                                                e.success
                                                    ? (this.charts[this.activeChart] = e.data)
                                                    : Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error"));
                                        }));
                            },
                            showPopup(e, t) {
                                this.activeItem = t;
                                t = e.target.getBoundingClientRect();
                                ((this.$refs.popup.style.left = t.left + t.width + 10 + "px"),
                                    (this.$refs.popup.style.top = t.top + "px"));
                            },
                            hidePopup() {
                                this.activeItem = null;
                            },
                            dragScroll() {
                                let t = this.$refs.scrollArea;
                                t &&
                                    (t.addEventListener("mouseup", () => (this.scrollArea.isDown = !1)),
                                        t.addEventListener("mouseleave", () => (this.scrollArea.isDown = !1)),
                                        t.addEventListener("mousedown", (e) => {
                                            ((this.scrollArea.isDown = !0),
                                                (this.scrollArea.startX = e.pageX - t.offsetLeft),
                                                (this.scrollArea.scrollLeft = t.scrollLeft));
                                        }),
                                        t.addEventListener("mousemove", (e) => {
                                            this.scrollArea.isDown &&
                                                (e.preventDefault(),
                                                    (e = e.pageX - t.offsetLeft - this.scrollArea.startX),
                                                    (t.scrollLeft = this.scrollArea.scrollLeft - e));
                                        }));
                            },
                        },
                        computed: {
                            currentChart() {
                                return this.charts[this.activeChart];
                            },
                        },
                        watch: {
                            currentChart() {
                                this.$nextTick(() => this.dragScroll());
                            },
                        },
                    });
                })(e).mount(e);
        });
    }),
        window.render_vendor_stats(),
        jQuery(document).on("voxel:markup-update", window.render_vendor_stats));
});
