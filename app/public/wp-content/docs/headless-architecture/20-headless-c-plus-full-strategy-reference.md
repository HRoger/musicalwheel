# MusicalWheel — Headless C+ Architecture: Full Strategy & Feasibility Reference

> **Project:** MusicalWheel — Headless WordPress Marketplace Platform
> **Stack:** Voxel FSE Blocks · Nectar Blocks 2.5.3 · Next.js (Vercel) · Agora · Firebase · Stripe
> **Target Launch:** May / June 2026
> **References:** `01-accelerated-option-c-plus-strategy.md` · `12-third-party-blocks-blockdispatcher-compatibility.md`

---

## Table of Contents

1. [The Architecture: Separation of Powers](#1-the-architecture-separation-of-powers)
2. [Nectar Blocks — The Visual Layer](#2-nectar-blocks--the-visual-layer)
3. [Voxel FSE Blocks — The Application Core](#3-voxel-fse-blocks--the-application-core)
4. [Database Migration Tool — The Safety Net](#4-database-migration-tool--the-safety-net)
5. [End-to-End Data Flow Blueprint](#5-end-to-end-data-flow-blueprint)
6. [Strategic Decision: Why Not Strapi?](#6-strategic-decision-why-not-strapi)
7. [Live Events Architecture (Agora + Firebase)](#7-live-events-architecture-agora--firebase)
8. [Messaging Strategy: Dual-Chat System](#8-messaging-strategy-dual-chat-system)
9. [Migration Roadmap: Post-Launch](#9-migration-roadmap-post-launch)

---

## 1. The Architecture: Separation of Powers

This plan works because it strictly enforces the **Separation of Concerns**. No single tool is forced to do everything.

| Layer | Tool | Role |
|-------|------|------|
| **Design System** | Nectar Blocks 2.5.3 | Static UI, layouts, micro-interactions |
| **Application Logic** | Voxel FSE Blocks | State, data fetching, complex features |
| **Data Integrity** | Database Migration Tool | Technical debt management, schema updates |
| **Live Features** | Agora + Firebase | Real-time streaming, chat, tipping |
| **Payments** | Stripe | Tickets, orders, live tips |

This unified stack converges inside the **Next.js `BlockDispatcher`**.

---

## 2. Nectar Blocks — The Visual Layer

**Feasibility: Extremely High** *(Verified: Nectar 2.5.3)*

Incorporating a page builder block suite into a headless app is typically a nightmare due to legacy code (jQuery). Nectar 2.0+ is **modern, jQuery-free, and powered by Vanilla JS + GSAP**, which changes everything.

### Why It Works

- **Type B Blocks:** The `BlockDispatcher` intercepts any block starting with `nectar-blocks/` and injects its `renderedHtml` safely via `dangerouslySetInnerHTML`.
- **Instant Visual Power:** Gain access to complex visual layouts (Flex-Box grids, accordions, animated tabs, parallax sections) without rebuilding them as custom Next.js components.
- **Script Loading:** Load `nectar-blocks-frontend.js` via a Next.js `<Script>` tag. It scans the DOM, finds injected HTML, and initializes GSAP animations — completely independent of React's lifecycle.

### Version 2.5.3 Confirmed

Inspection of `build/nectar-blocks-frontend.asset.php` confirms:

- **Zero jQuery dependency.** Dependencies: `['gsap', 'gsap-custom-ease', 'gsap-scroll-trigger']`
- **Tech Stack:** React (editor) + Static HTML + Vanilla JS / GSAP / Swiper (frontend)
- **Headless Compatibility:** Excellent — no jQuery conflicts

---

## 3. Voxel FSE Blocks — The Application Core

**Feasibility: High** *(Thanks to the C+ Shim Strategy)*

While Nectar handles layout, Voxel FSE handles the *application*: maps, search forms, dynamic post feeds, user dashboards. These cannot be static HTML injections.

### Why It Works

- **Type A Blocks:** The `BlockDispatcher` intercepts `voxel-fse/*` blocks, ignores the HTML fallback, reads structured JSON `attributes` from WPGraphQL, and passes them to custom Next.js React components (e.g., `<VoxelSearchForm {...attributes} />`).
- **The C+ Hybrid Workflow:** The `render.php` shim strategy allows building the WordPress editor experience *independently* of the Next.js frontend. Attributes verified in PHP today are consumed by Next.js tomorrow.
- **Full Client-Side Control:** When a user changes a search filter, the Next.js React component re-renders instantly without pinging the WordPress server for new HTML.

---

## 4. Database Migration Tool — The Safety Net

**Feasibility: Critical and Professional**

This component graduates the project from a good idea to **enterprise-grade software**.

### The Core Problem: Data Obsolescence

Gutenberg stores block content as HTML strings frozen in the database:

```
<!-- wp:voxel-fse/my-block {"layout":"grid"} -->
```

If a block attribute is renamed in code (e.g., `layout` to `viewMode`), all existing posts break.

### Comparison of Solutions

| Approach | Method | Problem |
|----------|--------|---------|
| **Runtime Filter** | Patch on every page load | Slows down Next.js; regex runs on every request |
| **Gutenberg Deprecations** | Admin opens each post, clicks Attempt Recovery | Impossible at scale (1,000+ listings) |
| **Database Migration Script** | One-time programmatic batch update | Clean DB, zero overhead, instant visual confirmation |

### The Strategy: `parse_blocks` → Modify → `serialize_blocks`

WordPress provides helper functions to break the HTML string into a structured block array, modify it, and stitch it back together.

### PHP Migration Script

Package as a custom plugin or run via WP-CLI.

```php
function voxel_migrate_advanced_list_blocks() {
    $query = new WP_Query([
        'post_type'      => 'any',
        'posts_per_page' => -1,
        's'              => 'voxel-fse/advanced-list',
    ]);

    foreach ( $query->posts as $post ) {
        $blocks      = parse_blocks( $post->post_content );
        $has_changes = false;
        $blocks      = voxel_recursive_block_update( $blocks, $has_changes );

        if ( $has_changes ) {
            $updated_content = serialize_blocks( $blocks );
            wp_update_post([
                'ID'           => $post->ID,
                'post_content' => $updated_content,
            ]);
            error_log( 'Migrated Post ID: ' . $post->ID );
        }
    }
}

function voxel_recursive_block_update( $blocks, &$has_changes ) {
    foreach ( $blocks as &$block ) {
        // A. Recurse into inner blocks first
        if ( ! empty( $block['innerBlocks'] ) ) {
            $block['innerBlocks'] = voxel_recursive_block_update( $block['innerBlocks'], $has_changes );
        }

        // B. Target your specific block
        if ( $block['blockName'] === 'voxel-fse/advanced-list' ) {
            if ( preg_match( '/<script class="vxconfig" type="application\/json">(.*?)<\/script>/s', $block['innerHTML'], $matches ) ) {
                $json_str = $matches[1];
                $config   = json_decode( $json_str, true );

                if ( isset( $config['layout'] ) ) {
                    $config['viewMode'] = $config['layout'];
                    unset( $config['layout'] );

                    $new_json_str            = json_encode( $config );
                    $block['innerHTML']       = str_replace( $json_str, $new_json_str, $block['innerHTML'] );
                    $block['innerContent'][0] = $block['innerHTML'];
                    $has_changes              = true;
                }
            }
        }
    }
    return $blocks;
}
```

### Usage Guide

| Scenario | Recommended Solution |
|----------|----------------------|
| Small tweaks (adding a CSS class) | Runtime Filter |
| Breaking changes (renaming attributes) | **Database Migration Script** |

> Run the script once on **staging**, verify results, then run on **production**.

---

## 5. End-to-End Data Flow Blueprint

```
WordPress Backend
  Users build pages with Nectar Blocks (layout) + Voxel FSE Blocks (app logic)
         |
         v
WPGraphQL API
  Nectar Blocks  ->  serves raw renderedHtml
  Voxel FSE      ->  serves clean JSON attributes
         |
         v
Next.js BlockDispatcher
  nectar-blocks/*  ->  dangerouslySetInnerHTML         (Type B)
  voxel-fse/*      ->  <VoxelComponent {...attributes} />  (Type A)
         |
         v
Vercel Frontend (MusicalWheel)
  Nectar CSS + GSAP animations via <Script>
  Voxel React components handle interactivity
  Agora SDK handles live video
  Firebase handles live chat + notification pings

Database Migration Tool (Plugin)
  Runs on-demand during major schema updates:
  parse_blocks() -> mutate JSON -> serialize_blocks() -> wp_update_post()
```

---

## 6. Strategic Decision: Why Not Strapi?

### Feature Parity: Voxel vs. Strapi

| Feature | Voxel (Current) | Strapi (Alternative) |
|---------|----------------|----------------------|
| Listing post types + custom fields | Built-in | Content types only — no marketplace logic |
| Search + Filters + Map Integration | Built-in | Build Algolia / Meilisearch yourself |
| Booking System | Built-in | 4–8 weeks from zero |
| Orders + Payments (Stripe) | Built-in | 4–6 weeks minimum |
| Membership Plans | Built-in | 3–4 weeks |
| User Dashboards | Built-in | 3–4 weeks |
| Messaging System | Built-in | 2–3 weeks + real-time infra |
| Reviews + Ratings | Built-in | 1–2 weeks |
| Auth + Roles + Permissions | WordPress built-in | Basic; not marketplace-grade |
| Dynamic Templates per post type | Built-in | Build a full template engine |

### Why Porting Voxel Logic to Strapi Is Not a Conversion — It Is a Rewrite

Voxel's PHP business logic is deeply coupled to WordPress internals. Every function call, database query, and hook is WordPress-specific — none of it translates to Strapi.

| Voxel PHP Uses | Strapi Equivalent | Effort |
|----------------|-------------------|--------|
| `WP_Query` (search, filters, geo) | Custom Strapi controllers + Knex/SQL | Rewrite from scratch |
| `wp_insert_post` / `update_post_meta` | Strapi Entity Service API | Different data model entirely |
| WordPress user system + roles | Strapi Users & Permissions plugin | Different auth architecture |
| WordPress hooks (`add_action`, `add_filter`) | Strapi Lifecycles + Middleware | Different paradigm |
| Stripe referencing `$post->ID`, `get_user_meta()` | Stripe + Strapi entity IDs | Rewire everything |
| Booking availability (post meta + custom tables) | Custom service + new DB schema | Rebuild the math + storage |

### Timeline Comparison

| | WP + Voxel + Headless | Strapi + Logic Port |
|---|---|---|
| **Business logic** | Already done | 20–30 weeks to rebuild |
| **Backend API** | WPGraphQL (exists) | Strapi API + custom controllers |
| **Frontend** | Convert blocks + Next.js | Build from scratch + Next.js |
| **Launch target** | May / Jun 2026 | Oct 2026 – Jan 2027 |
| **Risk level** | Low (proven stack) | High (untested payment / booking code) |

### Known Pain Points of the Current Approach

| # | Pain Point | Severity |
|---|-----------|----------|
| 4 | Dual database sync (MySQL + PostgreSQL) | **Critical** — the strongest future argument for Strapi |
| 1+2 | Voxel vendor lock-in + update maintenance | **High** — commercial theme you don't control |
| 3 | Database Migration Tool is a workaround | **Medium** — it works but covers a Gutenberg flaw |
| 6 | Performance overhead (PHP + MySQL + GraphQL) | **Medium** — marginal with CDN/caching |
| 5 | Voxel CSS class leakage through obfuscation | **Low** — cosmetic only |

> **Strapi v2 consideration:** A Strapi migration is valid 12–18 months post-launch, once there is revenue and a clear picture of what custom logic is actually needed. The ideal strategy is gradual microservice extraction (Phase 2), which makes a future WordPress → Strapi swap mostly a content-layer swap.

---

## 7. Live Events Architecture (Agora + Firebase)

### Feature Classification

| Feature | Launch (May/Jun)? | Why |
|---------|-------------------|-----|
| Standard Events (listings, tickets, RSVP) | Yes — Voxel | Core platform value |
| Live Broadcast (no chat, just stream) | Yes — minimal effort | Just an embedded Mux/Agora player |
| Interactive Live Events (stream + chat + tips) | Yes — Agora + Firebase | Killer feature for musicians |

### Why Agora + Firebase Compresses the Build Time

| Component | Custom Build | With Agora + Firebase |
|-----------|-------------|----------------------|
| Video Streaming | 2–3 weeks | **3–4 days** (Agora SDK) |
| Live Chat | 2–3 weeks | **2–3 days** (Firebase Realtime DB) |
| Tipping (Stripe) | 2–3 weeks | **2 weeks** (still custom logic) |
| Viewer Count | 1 week | **1 day** (Firebase presence) |
| UI (StageIt-style page) | 2 weeks | **1.5 weeks** |
| **Total** | **6–10 weeks** | **~3–4 weeks** |

### Interactive Live Event Architecture

```
Voxel Event Listing (WordPress / MySQL)
  custom field: live_event_id = 'live_evt_123'
         |
         v
Next.js Frontend
  +----------------------+-------------------------+
  |  Agora SDK           |  Firebase Realtime DB   |
  |  (Video Stream)      |  /chat/{eventId}        |
  |                      |  /tips/{eventId}        |
  |                      |  /viewers/{eventId}     |
  +----------------------+-------------------------+
         |
  Stripe API Route (Next.js /api/tip)
    1. Stripe charges fan
    2. Writes to Firebase /tips/{eventId}
    3. All viewers see animated tip notification
```

### The Tipping Flow (StageIt-style)

```
Fan clicks 'Send $10 Tip'
       |
       v
Next.js API Route (/api/tip)
  -> Stripe PaymentIntent (charge $10)
  -> On success: write to Firebase /tips/{eventId}
  -> Calculate split: 80% artist / 20% platform
       |
       v
Firebase listener fires on all connected clients
  -> Animated notification: 'John just tipped $10!'
```

**No separate Node.js server. No custom WebSocket. No Redis. No extra PostgreSQL.**
Just Agora + Firebase + a single Stripe API route.

---

## 8. Messaging Strategy: Dual-Chat System

These are fundamentally different products that share a messaging UI pattern.

| | User-to-User DMs (Voxel) | Live Stream Chat (Firebase) |
|---|---|---|
| **Purpose** | Private conversations | Public room during a show |
| **Persistence** | Permanent (inbox, history) | Ephemeral (expires after stream) |
| **Volume** | Low (1-on-1) | High (hundreds of messages/min) |
| **Speed needed** | 3–5s delay acceptable | Must be instant |
| **Analogy** | Instagram DMs | Twitch Chat |
| **Launch status** | Ready (already converted to FSE) | Build alongside Agora feature |

### Reusing the Voxel Message React Block

| Layer | Reusable? | Notes |
|-------|-----------|-------|
| UI Components (bubbles, conversation list, compose box) | **Yes** | Pure React presentation — works with any data source |
| API calls (fetch/send messages) | **Swap later** | Currently calls Voxel REST API; change to Firebase SDK |
| Notification handling (unread count, badges) | **Swap later** | Currently polling; change to Firebase listener |

Migration is a simple hook swap:

```tsx
// TODAY (Voxel backend)
const { messages } = useVoxelMessages(conversationId); // polls WP REST API

// FUTURE (Firebase backend) — same component, different hook
const { messages } = useFirebaseMessages(conversationId); // real-time listener
```

### Bridging Voxel Hooks to Firebase (Real-Time DM Badges)

A small PHP snippet in your WordPress plugin bridges Voxel's server-side events to Firebase for instant notification delivery on the frontend:

```php
// Fires when Voxel sends a message
add_action('voxel/messages/sent', function($message) {
    $firebase_url = 'https://your-project.firebaseio.com/notifications/'
                  . $message->recipient_id . '.json';
    wp_remote_post($firebase_url, [
        'body' => json_encode([
            'type'      => 'new_message',
            'from'      => $message->sender_id,
            'timestamp' => time(),
        ]),
    ]);
});
```

Voxel handles message storage and logic. Firebase delivers the real-time ping to the Next.js frontend.

---

## 9. Migration Roadmap: Post-Launch

### Recommended Build Sequence

```
Now -> April 2026
  Core platform: directory, events, blocks, headless frontend
  Voxel messaging (already converted — ship it)

April -> May 2026
  Live Events feature sprint: Agora + Firebase + Stripe tips
  Live stream chat (Firebase)

May -> June 2026
  Polish, testing, launch

Post-Launch (v1.1, July/Aug 2026)
  Upgrade Voxel DMs to Firebase real-time (if users demand it)
  Add messaging to the live events microservice

Post-Launch (Phase 2, 3-6 months)
  Extract bookings, payments, messaging to standalone Node.js microservices
  Backed by PostgreSQL — eliminates dual-database sync problem
  WordPress/Voxel becomes just the content CMS + admin panel

Post-Launch (Phase 3, when revenue justifies it)
  Replace WordPress with Strapi
  Next.js frontend barely changes (already API-driven)
  Estimated effort: 8-12 weeks (business logic already in microservices)
```

### Strapi vs. Payload CMS

| | Strapi | Payload CMS |
|---|---|---|
| Ecosystem | Large (plugins, community, enterprise support) | Growing but smaller |
| Stability | Production-proven | Still maturing |
| Tech | Node.js + REST/GraphQL | TypeScript-native, Next.js-based |
| Performance | Good | Significantly faster |
| Recommendation | **Target for post-launch migration** | Re-evaluate in 2027+ |

---

## Final Verdict

**100% Feasible for a May/June 2026 launch.** This architecture gives MusicalWheel:

- **Design Power** — Nectar Blocks 2.5.3 (modern, jQuery-free, GSAP-powered)
- **Application Logic** — Voxel FSE Blocks (React hydration, structured JSON attributes via WPGraphQL)
- **Data Integrity** — Database Migration Tool (enterprise-grade schema management)
- **Live Feature Velocity** — Agora + Firebase compresses interactive streaming from 10 weeks to ~3–4 weeks
- **Future-Proof Exit Path** — Gradual microservice extraction in Phase 2 sets up a clean Strapi migration in Phase 3 without a big-bang rewrite

> The current architecture is not a compromise — it is the only path that hits the launch window as a solo developer while preserving full optionality for a professional v2.

---

*Document: `19-headless-c-plus-full-strategy-reference.md`*
*Project: MusicalWheel — `wp-content/docs/headless-architecture/`*
*Last updated: February 2026*