# References

This file centralizes external documentation links used as reference models during implementation. Keep the implementation plan (AI_AGENT_IMPLEMENTATION_PLAN_*.md) free of raw URLs and point to this file instead.

## Kadence Blocks (Official)

- Help Center (index): https://www.kadencewp.com/help-center/ [Primary entry point][web:110]
- Kadence Blocks docs (all blocks): https://www.kadencewp.com/help-center/knowledge-base/kadence-blocks/ [Block-by-block docs][web:97]
- Kadence Blocks Pro overview: https://www.kadencewp.com/help-center/docs/kadence-blocks/kadence-blocks-pro-plugin/ [Pro features like Dynamic Content, Conditional Display][web:102]

### Frequently Used Blocks (direct docs)

- Row Layout: https://www.kadencewp.com/help-center/docs/kadence-blocks/row-layout-block/ [Layout patterns][web:122]
- Section: https://www.kadencewp.com/help-center/docs/kadence-blocks/section-block/ [Z-index, stacking contexts][web:117]
- Form: https://www.kadencewp.com/help-center/docs/kadence-blocks/form-block/ [Form settings, validation][web:99]
- Posts/Grid: https://www.kadencewp.com/help-center/docs/kadence-blocks/posts-block/ [List/grid display patterns][web:98]
- Table of Contents: https://www.kadencewp.com/help-center/docs/kadence-blocks/table-of-contents-block/ [Anchors, in-page nav][web:118]
- Advanced Query Loop (Pro): https://www.kadencewp.com/help-center/docs/kadence-blocks/advanced-query-loop-block/ [Advanced querying][web:127]
- Dynamic Content (Pro): https://www.kadencewp.com/help-center/docs/kadence-blocks/dynamic-content/ [Field bindings][web:128]

### Plugin Listings (for capabilities/context)

- WordPress.org plugin page: https://wordpress.org/plugins/kadence-blocks/ [Capabilities, blocks list][web:104]
- Kadence Blocks Pro (marketing): https://www.kadencewp.com/kadence-blocks/pro/ [Feature overview][web:114]

### Deep Dives / Tutorials (optional)

- "Every Kadence WP Block Explained" (video, 3h): https://www.youtube.com/watch?v=-xVDLbTo8jY [Survey of blocks][web:101]

## Usage Guidance

- Treat Kadence docs as a **reference model** for UX, controls, and editor workflows. Do not depend on Kadence as a runtime dependency unless explicitly approved.
- When recreating features, prefer native FSE blocks + React editor components. Use Kadence patterns for inspiration on attribute design, inspector controls, responsive options, and performance practices.
- If citing a Kadence feature, include a short note why it’s relevant (e.g., “Dynamic Content: attribute binding model for custom fields”).

## Add Your Own Links

Use this template for additional links:

- Title: <short name>
  - URL: <link>
  - Why relevant: <1 sentence>
  - Notes: <optional details>

Example:

- Title: Kadence Modal Block (Pro)
  - URL: https://www.kadencewp.com/help-center/docs/kadence-blocks/modal-block/
  - Why relevant: Reference for accessibility and focus trapping patterns when building custom modals.
  - Notes: Check ARIA attributes and keyboard nav behavior.

