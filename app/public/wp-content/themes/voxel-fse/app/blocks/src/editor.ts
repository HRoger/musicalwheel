/**
 * Single editor entry point — registers all voxel-fse blocks.
 *
 * Following NectarBlocks pattern: one editor.js bundle enqueued globally
 * instead of 36 separate per-block scripts. This prevents inspector sidebar
 * flicker when switching viewports in the Gutenberg editor.
 *
 * WordPress unconditionally loads ALL registered block editor scripts
 * (wp_enqueue_registered_block_scripts_and_styles). With 36 separate ES modules,
 * the editor does heavy work on viewport switch causing visible flicker.
 * A single bundle eliminates this.
 */

import './category-icon';
import './advanced-list/index';
import './cart-summary/index';
import './countdown/index';
import './create-post/index';
import './current-plan/index';
import './current-role/index';
//import './flex-container/index';
import './gallery/index';
import './image/index';
import './listing-plans/index';
import './login/index';
import './map/index';
import './membership-plans/index';
import './messages/index';
import './navbar/index';
import './nested-accordion/index';
import './nested-tabs/index';
import './orders/index';
import './popup-kit/index';
import './post-feed/index';
import './print-template/index';
import './product-form/index';
import './product-price/index';
import './quick-search/index';
import './review-stats/index';
import './ring-chart/index';
import './sales-chart/index';
import './search-form/index';
import './slider/index';
import './stripe-account/index';
import './term-feed/index';
import './timeline/index';
import './timeline-kit/index';
import './userbar/index';
import './visit-chart/index';
import './work-hours/index';

// NectarBlocks integration — injects Voxel dynamic tag buttons into NB controls
import '../shared/nb-integration';

// NectarBlocks toolbar EnableTag — adds dynamic content button to text/button block toolbars
import '../shared/filters/nectarToolbarFilter';
