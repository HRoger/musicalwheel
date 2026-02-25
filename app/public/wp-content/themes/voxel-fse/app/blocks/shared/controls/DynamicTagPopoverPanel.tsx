/**
 * DynamicTagPopoverPanel Component
 *
 * Reusable dark panel showing tag content with EDIT TAGS / DISABLE TAGS actions.
 * Used in both the toolbar EnableTag popover and the inspector tag preview.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';

export interface DynamicTagPopoverPanelProps {
	/** The raw tag content (with or without @tags() wrapper) */
	tagContent: string;
	/** Called when user clicks EDIT TAGS */
	onEdit: () => void;
	/** Called when user clicks DISABLE TAGS (after confirmation) */
	onDisable: () => void;
}

/**
 * Extract inner content from @tags()...@endtags() wrapper.
 * If no wrapper found, returns the original string.
 */
export function extractTagContent(value: string): string {
	if (!value) return '';
	const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
	return match ? match[1] : value;
}

/**
 * Wrap content with @tags()...@endtags() markers for Voxel resolution.
 */
export function wrapWithTags(content: string): string {
	if (!content) return '';
	return `@tags()${content}@endtags()`;
}

export default function DynamicTagPopoverPanel({
	tagContent,
	onEdit,
	onDisable,
}: DynamicTagPopoverPanelProps) {
	const content = extractTagContent(tagContent);

	return (
		<div className="voxel-nb-tag-preview__inner">
			<span className="voxel-nb-tag-preview__content">{content}</span>
			<div className="voxel-nb-tag-preview__divider" />
			<div className="voxel-nb-tag-preview__actions">
				<button type="button" className="voxel-nb-tag-preview__btn" onClick={onEdit}>
					{__('EDIT TAGS', 'voxel-fse')}
				</button>
				<button
					type="button"
					className="voxel-nb-tag-preview__btn voxel-nb-tag-preview__btn--disable"
					onClick={() => {
						if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
							onDisable();
						}
					}}
				>
					{__('DISABLE TAGS', 'voxel-fse')}
				</button>
			</div>
		</div>
	);
}
