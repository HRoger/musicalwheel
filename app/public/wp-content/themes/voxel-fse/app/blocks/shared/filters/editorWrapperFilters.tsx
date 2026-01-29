/**
 * Editor Wrapper Filters - Shared filters for all voxel-fse blocks
 *
 * This file provides editor filters that apply to block wrapper elements.
 * These filters are necessary because WordPress wraps blocks with elements
 * that have `position: relative`, which breaks sticky positioning.
 *
 * STICKY POSITION:
 * WordPress wrapper elements have `position: relative` which creates a containing block.
 * Sticky elements can only stick within their containing block, so applying sticky
 * to the inner element doesn't work (the containing block is only as tall as itself).
 * By applying sticky to the wrapper, it can properly stick within the scroll container.
 *
 * FULL WIDTH (flex-container only):
 * WordPress editor applies: .is-root-container > :where(:not(.alignfull)...) { max-width: 800px }
 * The :where() has zero specificity, so any selector can override it.
 * By adding `data-content-width="full"` to the wrapper, we can target it with CSS.
 *
 * NOTE: Using global wp.hooks and wp.compose to avoid ESM import map issues with Vite.
 * These packages are not in WordPress's import maps but are available globally.
 *
 * @package VoxelFSE
 */

// Flag to prevent multiple registrations
let isFilterRegistered = false;

/**
 * Register the editor wrapper filter for all voxel-fse blocks
 * This function is idempotent - it will only register the filter once
 */
export function registerEditorWrapperFilters(): void {
	if (isFilterRegistered) {
		return;
	}

	// Access WordPress globals directly (available in editor context)
	const wpHooks = (window as any).wp?.hooks;
	const wpCompose = (window as any).wp?.compose;

	if (!wpHooks || !wpCompose) {
		console.warn('VoxelFSE: wp.hooks or wp.compose not available');
		return;
	}

	const { addFilter } = wpHooks;
	const { createHigherOrderComponent } = wpCompose;

	const withVoxelWrapperProps = createHigherOrderComponent((BlockListBlock: any) => {
		return (props: any) => {
			const { name, attributes } = props;

			// Only process voxel-fse blocks
			if (!name.startsWith('voxel-fse/')) {
				return <BlockListBlock {...props} />;
			}

			// Build wrapper props and styles
			const wrapperProps: Record<string, any> = { ...props.wrapperProps };
			const wrapperStyle: Record<string, string> = { ...(wrapperProps.style || {}) };

			// ==========================================
			// STICKY POSITION - Applies to ALL voxel-fse blocks
			// ==========================================
			// Check if sticky is enabled and desktop mode is sticky
			// Note: stickyDesktop defaults to 'sticky', but WordPress may not serialize default values
			if (attributes.stickyEnabled && (attributes.stickyDesktop ?? 'sticky') === 'sticky') {
				wrapperStyle.position = 'sticky';
				wrapperStyle.zIndex = '10'; // Ensure sticky element stays on top
				// CRITICAL: align-self: flex-start prevents the sticky element from stretching
				// to fill its parent in a flex layout. Without this, the sticky element would be
				// the same height as its parent, leaving no room to "stick" during scrolling.
				wrapperStyle.alignSelf = 'flex-start';

				if (attributes.stickyTop !== undefined) {
					wrapperStyle.top = `${attributes.stickyTop}${attributes.stickyTopUnit || 'px'}`;
				}
				if (attributes.stickyLeft !== undefined) {
					wrapperStyle.left = `${attributes.stickyLeft}${attributes.stickyLeftUnit || 'px'}`;
				}
				if (attributes.stickyRight !== undefined) {
					wrapperStyle.right = `${attributes.stickyRight}${attributes.stickyRightUnit || 'px'}`;
				}
				if (attributes.stickyBottom !== undefined) {
					wrapperStyle.bottom = `${attributes.stickyBottom}${attributes.stickyBottomUnit || 'px'}`;
				}
			}

			// ==========================================
			// FULL WIDTH - flex-container only
			// ==========================================
			if (name === 'voxel-fse/flex-container' && attributes.contentWidthType === 'full') {
				wrapperProps['data-content-width'] = 'full';
			}

			// Only add wrapperProps if we have modifications
			if (Object.keys(wrapperStyle).length > 0) {
				wrapperProps.style = wrapperStyle;
			}

			// Check if we have any wrapper modifications
			const hasModifications =
				wrapperProps['data-content-width'] ||
				Object.keys(wrapperStyle).length > 0;

			if (hasModifications) {
				return (
					<BlockListBlock
						{...props}
						wrapperProps={wrapperProps}
					/>
				);
			}

			return <BlockListBlock {...props} />;
		};
	}, 'withVoxelWrapperProps');

	addFilter(
		'editor.BlockListBlock',
		'voxel-fse/editor-wrapper-props',
		withVoxelWrapperProps
	);

	isFilterRegistered = true;
}

// Auto-register when this module is imported
registerEditorWrapperFilters();
