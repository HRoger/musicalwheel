/**
 * Card Templates Hook
 *
 * Fetches card templates for a specific post type from REST API.
 * Templates are refetched when postType changes.
 *
 * Evidence from Voxel post-feed.php:204-212:
 * - Templates are specific to each post type
 * - Default option is 'main' (Main template)
 * - Custom templates come from $post_type->templates->get_custom_templates()['card']
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';

interface CardTemplate {
	id: string;
	label: string;
}

interface CardTemplatesResponse {
	templates: CardTemplate[];
	postType: string;
	error?: string;
}

interface UseCardTemplatesReturn {
	templates: CardTemplate[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Hook to fetch card templates for a specific post type
 *
 * @param postType - The post type key (e.g., 'listing', 'event')
 */
export function useCardTemplates(postType: string): UseCardTemplatesReturn {
	const [templates, setTemplates] = useState<CardTemplate[]>([
		{ id: 'main', label: 'Main template' },
	]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchTemplates = useCallback(async () => {
		// Don't fetch if no post type selected
		if (!postType) {
			setTemplates([{ id: 'main', label: 'Main template' }]);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await apiFetch<CardTemplatesResponse>({
				path: `/voxel-fse/v1/post-feed/card-templates?post_type=${encodeURIComponent(postType)}`,
			});

			if (response.error) {
				setError(response.error);
			}

			setTemplates(response.templates || [{ id: 'main', label: 'Main template' }]);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to fetch templates';
			setError(message);
			// Fallback to main template on error
			setTemplates([{ id: 'main', label: 'Main template' }]);
		} finally {
			setIsLoading(false);
		}
	}, [postType]);

	// Fetch templates when post type changes
	useEffect(() => {
		fetchTemplates();
	}, [fetchTemplates]);

	return {
		templates,
		isLoading,
		error,
		refetch: fetchTemplates,
	};
}

export default useCardTemplates;
