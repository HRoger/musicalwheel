> **This plan has been fully implemented.**
> See [`nectarblocks-integration.md`](./nectarblocks-integration.md) for current documentation.

**What was implemented (summary):**
- `RowSettings` component extracted to `app/blocks/shared/controls/RowSettings.tsx`
- `NB_ROW_SETTINGS_BLOCKS` expanded to 5 child blocks: `accordion-section`, `tab-section`, `column`, `icon-list-item`, `carousel-item`
- `NB_DYNAMIC_TAG_FIELDS` maps dynamic fields (title, CSS ID) per child block
- `withNBRowSettings` HOC injects RowSettings PanelBody + Dynamic Tag fields in WP Advanced panel
- `rowSettingsAttributes` registered via `blocks.registerBlockType` JS filter

See sections **4.2**, **10. RowSettings for Child Blocks**, and **4. Registered Blocks** in the integration doc.
