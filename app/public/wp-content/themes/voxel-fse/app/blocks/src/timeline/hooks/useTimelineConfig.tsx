/**
 * useTimelineConfig Hook
 *
 * Fetches and caches timeline configuration from REST API.
 * Used by all timeline components for settings, permissions, and i18n strings.
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { getTimelineConfig, getPostContext, type PostContextResponse } from '../api';
import type { TimelineConfig, TimelineAttributes } from '../types';

/**
 * Post context for visibility and composer config
 * CRITICAL FOR 1:1 VOXEL PARITY
 */
interface PostContext {
	visible: boolean;
	reason: string | null;
	composer: PostContextResponse['composer'];
	reviews: PostContextResponse['reviews'];
	current_post: PostContextResponse['current_post'];
	current_author: PostContextResponse['current_author'];
	filtering_options: Record<string, string>;
	show_usernames: boolean;
}

/**
 * Timeline context value
 */
interface TimelineContextValue {
	config: TimelineConfig | null;
	postContext: PostContext | null;
	attributes: TimelineAttributes;
	context: 'editor' | 'frontend';
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

/**
 * Default context value
 */
const defaultContextValue: TimelineContextValue = {
	config: null,
	postContext: null,
	attributes: {} as TimelineAttributes,
	context: 'frontend',
	isLoading: true,
	error: null,
	refetch: async () => {},
};

/**
 * Timeline context
 */
const TimelineContext = createContext<TimelineContextValue>(defaultContextValue);

/**
 * Timeline provider props
 */
interface TimelineProviderProps {
	attributes: TimelineAttributes;
	postId?: number;
	context?: 'editor' | 'frontend';
	children: ReactNode;
}

/**
 * Cache for timeline config (avoid refetching on re-renders)
 */
let configCache: TimelineConfig | null = null;
let configPromise: Promise<TimelineConfig> | null = null;

/**
 * Cache for post context (keyed by mode+postId)
 */
const postContextCache: Map<string, PostContext> = new Map();

/**
 * Timeline context provider
 *
 * CRITICAL FOR 1:1 VOXEL PARITY:
 * This provider now fetches BOTH:
 * 1. Timeline config (nonces, features, strings)
 * 2. Post context (visibility, composer, reviews)
 */
export function TimelineProvider({
	attributes,
	postId,
	context = 'frontend',
	children,
}: TimelineProviderProps): JSX.Element {
	const [config, setConfig] = useState<TimelineConfig | null>(configCache);
	const [postContext, setPostContext] = useState<PostContext | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Generate cache key for post context
	const postContextCacheKey = `${attributes.mode}:${postId ?? 'none'}`;

	const fetchConfig = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Fetch config (cached globally)
			let fetchedConfig = configCache;
			if (!fetchedConfig) {
				if (configPromise) {
					fetchedConfig = await configPromise;
				} else {
					configPromise = getTimelineConfig();
					fetchedConfig = await configPromise;
					configCache = fetchedConfig;
					configPromise = null;
				}
			}
			setConfig(fetchedConfig);

			// Fetch post context (cached by mode+postId)
			// Skip in editor context - use mock data instead
			if (context === 'editor') {
				// In editor, provide default post context for preview
				setPostContext({
					visible: true,
					reason: null,
					composer: {
						feed: attributes.mode === 'post_reviews' ? 'post_reviews' : 'user_timeline',
						can_post: true,
						post_as: 'current_user',
						placeholder: "What's on your mind?",
					},
					reviews: null,
					current_post: null,
					current_author: null,
					filtering_options: { all: 'All' },
					show_usernames: true,
				});
			} else {
				// In frontend, fetch real post context
				let fetchedPostContext = postContextCache.get(postContextCacheKey);
				if (!fetchedPostContext) {
					const response = await getPostContext(attributes.mode, postId);
					fetchedPostContext = {
						visible: response.visible,
						reason: response.reason,
						composer: response.composer,
						reviews: response.reviews,
						current_post: response.current_post,
						current_author: response.current_author,
						filtering_options: response.filtering_options,
						show_usernames: response.show_usernames,
					};
					postContextCache.set(postContextCacheKey, fetchedPostContext);
				}
				setPostContext(fetchedPostContext);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load configuration');
		} finally {
			setIsLoading(false);
		}
	}, [attributes.mode, postId, postContextCacheKey, context]);

	const refetch = useCallback(async () => {
		// Clear caches and refetch
		configCache = null;
		configPromise = null;
		postContextCache.delete(postContextCacheKey);
		await fetchConfig();
	}, [fetchConfig, postContextCacheKey]);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	const value: TimelineContextValue = {
		config,
		postContext,
		attributes,
		context,
		isLoading,
		error,
		refetch,
	};

	return (
		<TimelineContext.Provider value={value}>
			{children}
		</TimelineContext.Provider>
	);
}

/**
 * Hook to access timeline context
 */
export function useTimelineContext(): TimelineContextValue {
	const context = useContext(TimelineContext);
	if (!context) {
		throw new Error('useTimelineContext must be used within a TimelineProvider');
	}
	return context;
}

/**
 * Hook to access just the config
 */
export function useTimelineConfig(): {
	config: TimelineConfig | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
} {
	const { config, isLoading, error, refetch } = useTimelineContext();
	return { config, isLoading, error, refetch };
}

/**
 * Hook to access just the attributes
 */
export function useTimelineAttributes(): TimelineAttributes {
	const { attributes } = useTimelineContext();
	return attributes;
}

/**
 * Hook to check if running in editor context
 */
export function useIsEditor(): boolean {
	const { context } = useTimelineContext();
	return context === 'editor';
}

/**
 * Hook to access current user info
 */
export function useCurrentUser(): TimelineConfig['current_user'] | null {
	const { config } = useTimelineContext();
	return config?.current_user ?? null;
}

/**
 * Hook to access permissions
 */
export function usePermissions(): TimelineConfig['permissions'] {
	const { config } = useTimelineContext();
	return config?.permissions ?? {
		can_post: false,
		can_upload: false,
		can_moderate: false,
		is_logged_in: false,
	};
}

/**
 * Hook to access post context (visibility, composer, reviews)
 * CRITICAL FOR 1:1 VOXEL PARITY
 */
export function usePostContext(): PostContext | null {
	const { postContext } = useTimelineContext();
	return postContext;
}

/**
 * Hook to check if timeline is visible based on mode/permissions
 * CRITICAL FOR 1:1 VOXEL PARITY
 *
 * Returns:
 * - visible: true if timeline should be shown
 * - reason: null if visible, otherwise reason code ('login_required', 'followers_only', etc.)
 */
export function useVisibility(): { visible: boolean; reason: string | null } {
	const { postContext, context } = useTimelineContext();

	// In editor, always visible
	if (context === 'editor') {
		return { visible: true, reason: null };
	}

	// Use post context if available
	if (postContext) {
		return {
			visible: postContext.visible,
			reason: postContext.reason,
		};
	}

	// Default to visible while loading
	return { visible: true, reason: null };
}

/**
 * Hook to access composer configuration
 * CRITICAL FOR 1:1 VOXEL PARITY
 *
 * Returns composer config including:
 * - feed: which feed to post to
 * - can_post: whether user can post
 * - post_as: 'current_user' or 'current_post'
 * - placeholder: dynamic placeholder text
 * - reviews_post_type: for review mode
 */
export function useComposerConfig(): PostContextResponse['composer'] | null {
	const { postContext, context } = useTimelineContext();

	// In editor, return default composer config
	if (context === 'editor') {
		return {
			feed: 'user_timeline',
			can_post: true,
			post_as: 'current_user',
			placeholder: "What's on your mind?",
		};
	}

	return postContext?.composer ?? null;
}

/**
 * Hook to access review configuration
 * Used for post_reviews mode
 */
export function useReviewConfig(postType?: string): Record<string, unknown> | null {
	const { postContext } = useTimelineContext();

	if (!postContext?.reviews) {
		return null;
	}

	// If post type specified, return that config
	if (postType && postContext.reviews[postType]) {
		return postContext.reviews[postType] as Record<string, unknown>;
	}

	// Otherwise return first available config
	const keys = Object.keys(postContext.reviews);
	if (keys.length > 0) {
		return postContext.reviews[keys[0]] as Record<string, unknown>;
	}

	return null;
}

/**
 * Hook to access filtering options
 * Returns available filter options based on user permissions
 */
export function useFilteringOptions(): Record<string, string> {
	const { postContext } = useTimelineContext();
	return postContext?.filtering_options ?? { all: 'All' };
}

/**
 * Hook to access i18n strings
 */
export function useStrings(): TimelineConfig['strings'] {
	const { config } = useTimelineContext();

	// Return defaults if config not loaded
	if (!config?.strings) {
		return {
			compose_placeholder: "What's on your mind?",
			compose_submit: 'Post',
			compose_submitting: 'Posting...',
			like: 'Like',
			unlike: 'Unlike',
			comment: 'Comment',
			comments: 'Comments',
			reply: 'Reply',
			replies: 'Replies',
			repost: 'Repost',
			unrepost: 'Unrepost',
			quote: 'Quote',
			edit: 'Edit',
			delete: 'Delete',
			share: 'Share',
			loading: 'Loading...',
			load_more: 'Load more',
			no_posts: 'No posts available',
			no_comments: 'No comments yet',
			error_generic: 'Something went wrong',
			error_network: 'Network error. Please try again.',
			just_now: 'Just now',
			minutes_ago: '%d minutes ago',
			hours_ago: '%d hours ago',
			days_ago: '%d days ago',
			edited: 'Edited',
			pending_approval: 'Pending approval',
			approve: 'Approve',
			mark_pending: 'Mark as pending',
			delete_confirm: 'Are you sure you want to delete this post?',
			delete_comment_confirm: 'Are you sure you want to delete this comment?',
			content_too_short: 'Content is too short',
			content_too_long: 'Content is too long',
			file_too_large: 'File is too large',
			file_type_not_allowed: 'File type not allowed',
			search_placeholder: 'Search posts...',
			search_no_results: 'No results found',
		};
	}

	return config.strings;
}

/**
 * Clear config cache (useful for testing)
 */
export function clearConfigCache(): void {
	configCache = null;
	configPromise = null;
}
