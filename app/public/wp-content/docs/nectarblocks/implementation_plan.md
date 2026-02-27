> **This plan has been fully implemented.**
> See [`nectarblocks-integration.md`](./nectarblocks-integration.md) for current documentation.

**What was implemented (summary):**
- VoxelTab injected as 4th tab into all 23 NB parent blocks (not just flex-box)
- EnableTag buttons injected inline next to NB inspector field controls
- MutationObserver + createPortal pattern used (no NB source modification)
- Attribute injection done via `blocks.registerBlockType` JS filter (PHP filter not available for NB blocks)
- Three `editor.BlockEdit` HOCs registered: `withNBDynamicTags`, `withNBAdvancedPanelControls`, `withNBRowSettings`
- Server-side resolution in `Block_Loader.php → apply_nb_child_block_features()`
- All logic consolidated in `app/blocks/shared/nb-integration/` (not separate filter files)

See the full integration doc for architecture, block list, and all technical details.
