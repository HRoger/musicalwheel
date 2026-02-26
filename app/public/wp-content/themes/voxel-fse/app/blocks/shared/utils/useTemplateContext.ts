/**
 * Hook to detect the current template context for dynamic data.
 *
 * Reads the template slug from the WordPress site editor store and determines
 * whether the current template is for a term card, user card, or post context.
 *
 * Template slug patterns:
 * - "voxel-term_card-*" → 'term'
 * - "voxel-user_card-*" → 'user'
 * - "voxel-{post_type}-single" → 'post' with post_type extracted
 * - "voxel-{post_type}-card"   → 'post' with post_type extracted
 * - Everything else → 'post'
 *
 * @package VoxelFSE
 */

import { useSelect } from '@wordpress/data';

export type DynamicDataContext = 'post' | 'term' | 'user';

/**
 * Get the raw template slug from the editor store.
 * Returns the full editedPostId string (e.g., "voxel-fse//voxel-place-single").
 */
function getTemplateSlug(select: any): string {
	// Try the site editor store first (FSE template editing)
	const editSite = select('core/edit-site');
	if (editSite) {
		const editedPostId = editSite.getEditedPostId?.();
		if (typeof editedPostId === 'string') return editedPostId;
	}

	// Try the post editor store (wp-admin/post.php editing)
	const editor = select('core/editor');
	if (editor) {
		const post = editor.getCurrentPost?.();
		if (post?.slug) return post.slug;
	}

	return '';
}

/**
 * Detect the dynamic data context based on the current template being edited.
 *
 * @returns The context string: 'post', 'term', or 'user'
 */
export function useTemplateContext(): DynamicDataContext {
	return useSelect((select: any) => {
		const slug = getTemplateSlug(select);
		if (slug.includes('term_card')) return 'term';
		if (slug.includes('user_card')) return 'user';
		return 'post';
	}, []) as DynamicDataContext;
}

/**
 * Extract the Voxel post type from the current template slug.
 *
 * Template slug format: "voxel-fse//voxel-{post_type}-single" or "voxel-fse//voxel-{post_type}-card"
 * Examples:
 * - "voxel-fse//voxel-place-single" → "place"
 * - "voxel-fse//voxel-place-card"   → "place"
 * - "voxel-fse//voxel-event-single" → "event"
 * - "voxel-fse//voxel-term_card-wzgbmdvy" → undefined (not a post template)
 *
 * @returns The post type string or undefined if not a post template
 */
export function useTemplatePostType(): string | undefined {
	return useSelect((select: any) => {
		const slug = getTemplateSlug(select);
		// Match both single templates (voxel-{type}-single) and card templates (voxel-{type}-card)
		// Must NOT match term_card/user_card — those are term/user context, not post
		const match = slug.match(/voxel-([a-z0-9_-]+)-(?:single|card)/);
		if (match && !match[1].includes('term_') && !match[1].includes('user_')) {
			return match[1];
		}
		return undefined;
	}, []) as string | undefined;
}
