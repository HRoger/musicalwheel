> **This plan has been fully implemented.**
> See [`nectarblocks-integration.md`](./nectarblocks-integration.md) for current documentation.

**What was implemented (summary):**
- `EnableTagsToolbarButton` component added to `app/blocks/shared/controls/`
- Toolbar button injected into NB Text and Button blocks via `withNBRowSettings` HOC
- `voxelDynamicContent` attribute registered on toolbar tag blocks
- Child title blocks (accordion-section, tab-section, icon-list-item) get toolbar button for `voxelDynamicTitle`
- PHP resolution handled in `Block_Loader.php → apply_nb_child_block_features()`

See section **7. Toolbar EnableTag** in the integration doc for full details.
