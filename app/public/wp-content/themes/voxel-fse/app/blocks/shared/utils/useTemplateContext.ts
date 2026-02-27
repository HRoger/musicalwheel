/**
 * Hook to detect the current template context for dynamic data.
 *
 * Reads the template slug from the WordPress site editor store and determines
 * whether the current template is for a term, user, or post context.
 *
 * ## Complete Template Slug Registry
 *
 * Voxel generates templates with these slug patterns:
 *
 * **Post type templates** (per Voxel post type — place, event, etc.):
 *   - `voxel-{post_type}-single`           → post context (base single)
 *   - `voxel-{post_type}-single-{hash}`    → post context (custom variant)
 *   - `voxel-{post_type}-card`             → post context (base card)
 *   - `voxel-{post_type}-card-{hash}`      → post context (custom variant)
 *   - `voxel-{post_type}-archive`          → post context (archive page)
 *
 * **Term templates** (custom_templates group: term_single, term_card):
 *   - `voxel-term_single-{hash}`           → term context
 *   - `voxel-term_card-{hash}`             → term context
 *
 * **User templates** (custom_templates group: user_single, user_card):
 *   - `voxel-user_single-{hash}`           → user context
 *   - `voxel-user_card-{hash}`             → user context
 *
 * **Layout templates** (no dynamic data context):
 *   - `voxel-header-default`               → layout (no post/term/user)
 *   - `voxel-header-{hash}`                → layout (custom header variant)
 *   - `voxel-footer-default`               → layout (no post/term/user)
 *   - `voxel-footer-{hash}`                → layout (custom footer variant)
 *
 * **System templates** (no dynamic data context):
 *   - `voxel-kit_popups`                   → system
 *   - `voxel-kit_timeline`                 → system
 *
 * **WordPress default templates:**
 *   - `page`, `archive`, `index`, `single` → generic WP (defaults to post)
 *
 * The full editedPostId includes the theme prefix: "voxel-fse//voxel-place-single"
 *
 * @see template-utils.php:440-482 — Voxel's custom_templates groups
 * @see template-manager.php:163 — FSE slug generation: sprintf('voxel-%s-%s', $post_type_key, $template_type)
 * @package VoxelFSE
 */

import { useSelect } from '@wordpress/data';

export type DynamicDataContext = 'post' | 'term' | 'user';

/**
 * Non-post-type prefixes that should never be extracted as a post type.
 * These are layout/system templates with no post context.
 */
const NON_POST_TYPE_PREFIXES = ['header', 'footer', 'kit'];

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
 * Detection order (first match wins):
 * 1. term_card or term_single in slug → 'term'
 * 2. user_card or user_single in slug → 'user'
 * 3. Everything else → 'post' (safe default for post type templates,
 *    headers, footers, and standard WP templates)
 *
 * @returns The context string: 'post', 'term', or 'user'
 */
export function useTemplateContext(): DynamicDataContext {
	return useSelect((select: any) => {
		const slug = getTemplateSlug(select);
		// Term context: term_card-{hash} or term_single-{hash}
		if (slug.includes('term_card') || slug.includes('term_single')) return 'term';
		// User context: user_card-{hash} or user_single-{hash}
		if (slug.includes('user_card') || slug.includes('user_single')) return 'user';
		// Post context: all post type templates, headers, footers, system, WP defaults
		return 'post';
	}, []) as DynamicDataContext;
}

/**
 * Extract the Voxel post type from the current template slug.
 *
 * Matches: voxel-{post_type}-(single|card|archive) with optional -{hash} suffix
 * Excludes: term_*, user_*, header, footer, kit* prefixes
 *
 * Examples:
 * - "voxel-fse//voxel-place-single"           → "place"
 * - "voxel-fse//voxel-place-single-pnzxppea"  → "place"
 * - "voxel-fse//voxel-place-card"             → "place"
 * - "voxel-fse//voxel-place-card-dd0ri9mc"    → "place"
 * - "voxel-fse//voxel-place-archive"          → "place"
 * - "voxel-fse//voxel-event-single"           → "event"
 * - "voxel-fse//voxel-term_card-wzgbmdvy"     → undefined (term context)
 * - "voxel-fse//voxel-header-default"         → undefined (layout template)
 * - "voxel-fse//voxel-footer-odtnn1j5"        → undefined (layout template)
 * - "voxel-fse//voxel-kit_popups"             → undefined (system template)
 *
 * @returns The post type string or undefined if not a post type template
 */
export function useTemplatePostType(): string | undefined {
	return useSelect((select: any) => {
		const slug = getTemplateSlug(select);

		// Term/user templates have no post type
		if (slug.includes('term_card') || slug.includes('term_single')) return undefined;
		if (slug.includes('user_card') || slug.includes('user_single')) return undefined;

		// Match: voxel-{post_type}-(single|card|archive) with optional hash suffix
		const match = slug.match(/voxel-([a-z0-9_-]+)-(?:single|card|archive)/);
		if (match) {
			const captured = match[1];
			// Exclude layout/system templates that aren't post types
			if (NON_POST_TYPE_PREFIXES.some((prefix) => captured === prefix || captured.startsWith(prefix + '_'))) {
				return undefined;
			}
			return captured;
		}

		return undefined;
	}, []) as string | undefined;
}
