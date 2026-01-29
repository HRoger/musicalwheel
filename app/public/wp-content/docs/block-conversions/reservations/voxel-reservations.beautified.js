/**
 * ============================================================================
 * VOXEL RESERVATIONS (BOOKING CALENDAR) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/reservations.js
 * Size: 4.1KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * Displays booking/reservation calendar for posts with reservation functionality.
 * Shows weekly calendar view with available time slots and booking management.
 * Includes date picker, post filtering, and drag scrolling.
 *
 * CORRESPONDING FSE BLOCK:
 * Used for booking/reservation widgets (not a standalone block)
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Pikaday (date picker library)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup (popup component)
 * - Voxel.components.formGroup (form group component)
 * - Voxel.helpers.dateFormatYmd (date formatter)
 * - Voxel.alert (notification system)
 *
 * CSS CLASSES:
 * - .ts-booking-calendar: Main container element
 * - .ts-booking-date: Date picker container
 * - .ts-cal-box: Calendar box for scrolling
 * - .vxconfig: Script tag containing configuration JSON
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "post_types": ["places", "events"],
 *   "default_post_id": 123
 * }
 */

/**
 * API ENDPOINTS:
 *
 * 1. GET {ajax_url}&action=reservations.get_items
 *    - Fetches calendar items for a week
 *    Parameters:
 *    - post_id: Post ID to show reservations for
 *    - timeframe: "upcoming" | "custom"
 *    - custom_date: YYYY-MM-DD format (if timeframe is "custom")
 *
 * 2. GET {ajax_url}&action=reservations.get_day
 *    - Loads more reservations for a specific day
 *    Parameters:
 *    - post_id: Post ID
 *    - date: YYYY-MM-DD
 *    - offset: Pagination offset
 *
 * 3. GET {ajax_url}&action=reservations.get_post_list
 *    - Fetches list of posts with reservations
 *    Parameters:
 *    - offset: Pagination offset
 *
 * RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "date": "2025-12-22",
 *       "label": "Mon, Dec 22",
 *       "items": [...],
 *       "has_more": false,
 *       "loading": false
 *     }
 *   ]
 * }
 */

/**
 * FEATURES:
 * 1. Weekly Calendar View - Shows 7 days at a time
 * 2. Date Picker - Pikaday calendar for custom date selection
 * 3. Post Filtering - Filter reservations by post
 * 4. Pagination - Load more reservations per day
 * 5. Navigation - Previous/Next week buttons
 * 6. Drag Scrolling - Mouse drag to scroll calendar
 * 7. Auto-refresh - Updates on voxel:markup-update event
 */

((e) => {
    "function" == typeof define && define.amd ? define("reservations", e) : e();
})(function () {
    var s = {
        template:
            '<div class="ts-booking-date ts-booking-date-single ts-form-group" ref="calendar"><input type="hidden" ref="input"></div>',
        data() {
            return { picker: null };
        },
        mounted() {
            this.picker = new Pikaday({
                field: this.$refs.input,
                container: this.$refs.calendar,
                bound: !1,
                firstDay: 1,
                keyboardInput: !1,
                defaultDate: this.$root.filters.custom_date || new Date(),
                onSelect: (e) => {
                    this.$root.filters.custom_date = e;
                },
                selectDayFn: (e) =>
                    this.$root.filters.custom_date &&
                    this.$root.filters.custom_date.toDateString() === e.toDateString(),
            });
        },
        unmounted() {
            setTimeout(() => this.picker.destroy(), 200);
        },
        methods: {
            refresh() {
                this.picker.draw();
            },
            reset() {
                ((this.$root.filters.custom_date = null), this.refresh());
            },
        },
    };
    ((window.render_reservations = () => {
        Array.from(document.querySelectorAll(".ts-booking-calendar")).forEach((e) => {
            var t;
            e.__vue_app__ ||
                ((t = ((e) => {
                    let t = JSON.parse(e.closest(".elementor-element").querySelector(".vxconfig").innerHTML);
                    return Vue.createApp({
                        el: e,
                        mixins: [Voxel.mixins.base],
                        window: window,
                        data() {
                            return {
                                config: t,
                                activePopup: null,
                                loading: !1,
                                filters: { post_id: null, timeframe: "upcoming", custom_date: null },
                                post_filter: { active: null, loading: !1, has_more: !1, posts: null },
                                items: [],
                                scrollArea: { isDown: !1, scrollLeft: null, startX: null, dragLength: 0 },
                            };
                        },
                        created() {
                            this.getItems();
                        },
                        mounted() {
                            this.$nextTick(() => {
                                jQuery(".ts-grid-nav div").on("click", (e) => {
                                    e.preventDefault();
                                    var e = e.currentTarget.classList.contains("prev-item") ? "prev" : "next",
                                        t = this.$refs.scrollArea.querySelector(".ts-cal-box");
                                    t &&
                                        ((t = t.scrollWidth),
                                            this.$refs.scrollArea.scrollBy({
                                                left: "prev" == e ? -t : t,
                                                behavior: "smooth",
                                            }));
                                });
                                let t = this.$refs.scrollArea;
                                (t.addEventListener("mouseup", () => (this.scrollArea.isDown = !1)),
                                    t.addEventListener("mouseleave", () => (this.scrollArea.isDown = !1)),
                                    t.addEventListener("mousedown", (e) => {
                                        ((this.scrollArea.isDown = !0),
                                            (this.scrollArea.startX = e.pageX - t.offsetLeft),
                                            (this.scrollArea.scrollLeft = t.scrollLeft),
                                            (this.scrollArea.dragLength = 0));
                                    }),
                                    t.addEventListener("mousemove", (e) => {
                                        this.scrollArea.isDown &&
                                            (e.preventDefault(),
                                                (e = e.pageX - t.offsetLeft - this.scrollArea.startX),
                                                (t.scrollLeft = this.scrollArea.scrollLeft - e),
                                                (this.scrollArea.dragLength = this.scrollArea.scrollLeft - t.scrollLeft));
                                    }));
                            });
                        },
                        methods: {
                            getItems() {
                                ((this.loading = !0),
                                    jQuery
                                        .get(Voxel_Config.ajax_url + "&action=reservations.get_items", {
                                            post_id: this.filters.post_id,
                                            timeframe: this.filters.timeframe,
                                            custom_date: this.filters.custom_date
                                                ? Voxel.helpers.dateFormatYmd(this.filters.custom_date)
                                                : null,
                                        })
                                        .always((e) => {
                                            ((this.loading = !1),
                                                e.success
                                                    ? ((this.items = e.data),
                                                        this.$refs.scrollArea && (this.$refs.scrollArea.scrollLeft = 0))
                                                    : Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error"));
                                        }));
                            },
                            loadMore(t) {
                                ((t.loading = !0),
                                    jQuery
                                        .get(Voxel_Config.ajax_url + "&action=reservations.get_day", {
                                            post_id: this.filters.post_id,
                                            date: t.date,
                                            offset: t.items.length,
                                        })
                                        .always((e) => {
                                            ((t.loading = !1),
                                                e.success
                                                    ? (t.items.push(...e.data.items), (t.has_more = e.data.has_more))
                                                    : Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error"));
                                        }));
                            },
                            nextWeek() {
                                var e;
                                this.items.length &&
                                    ((e = new Date(this.items[0].date)).setDate(e.getDate() + 7),
                                        (this.filters.timeframe = "custom"),
                                        (this.filters.custom_date = e),
                                        this.getItems());
                            },
                            prevWeek() {
                                var e;
                                this.items.length &&
                                    ((e = new Date(this.items[0].date)).setDate(e.getDate() - 7),
                                        (this.filters.timeframe = "custom"),
                                        (this.filters.custom_date = e),
                                        this.getItems());
                            },
                            postFilterOpened() {
                                null === this.post_filter.posts && ((this.post_filter.posts = []), this.loadPosts());
                            },
                            loadPosts() {
                                ((this.post_filter.loading = !0),
                                    jQuery
                                        .get(Voxel_Config.ajax_url + "&action=reservations.get_post_list", {
                                            offset: this.post_filter.posts.length,
                                        })
                                        .always((e) => {
                                            ((this.post_filter.loading = !1),
                                                e.success
                                                    ? (this.post_filter.posts.push(...e.data),
                                                        (this.post_filter.has_more = e.has_more))
                                                    : Voxel.alert(e.message || Voxel_Config.l10n.ajaxError, "error"));
                                        }));
                            },
                            itemClicked(e) {
                                15 < Math.abs(this.scrollArea.dragLength) && e.preventDefault();
                            },
                        },
                        computed: {
                            timeframeLabel() {
                                if (7 === this.items.length) return this.items[0].label + " - " + this.items[6].label;
                            },
                        },
                    });
                })(e)).component("form-popup", Voxel.components.popup),
                    t.component("form-group", Voxel.components.formGroup),
                    t.component("date-picker", s),
                    t.mount(e));
        });
    }),
        window.render_reservations(),
        jQuery(document).on("voxel:markup-update", window.render_reservations));
});
