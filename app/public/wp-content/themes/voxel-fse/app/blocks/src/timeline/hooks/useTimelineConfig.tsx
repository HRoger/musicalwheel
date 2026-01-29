/**
 * useTimelineConfig Hook
 *
 * Fetches and caches timeline configuration from REST API.
 * Used by all timeline components for settings, permissions, and i18n strings.
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { getTimelineConfig } from '../api';
import type { TimelineConfig, TimelineAttributes } from '../types';

/**
 * Timeline context value
 */
interface TimelineContextValue {
	config: TimelineConfig | null;
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
	context?: 'editor' | 'frontend';
	children: ReactNode;
}

/**
 * Cache for timeline config (avoid refetching on re-renders)
 */
let configCache: TimelineConfig | null = null;
let configPromise: Promise<TimelineConfig> | null = null;

/**
 * Timeline context provider
 */
export function TimelineProvider({ attributes, context = 'frontend', children }: TimelineProviderProps): JSX.Element {
	const [config, setConfig] = useState<TimelineConfig | null>(configCache);
	const [isLoading, setIsLoading] = useState(!configCache);
	const [error, setError] = useState<string | null>(null);

	const fetchConfig = useCallback(async () => {
		// Return cached config if available
		if (configCache) {
			setConfig(configCache);
			setIsLoading(false);
			return;
		}

		// Wait for existing request if in progress
		if (configPromise) {
			try {
				const result = await configPromise;
				setConfig(result);
				setIsLoading(false);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to load configuration');
				setIsLoading(false);
			}
			return;
		}

		// Start new request
		setIsLoading(true);
		setError(null);

		try {
			configPromise = getTimelineConfig();
			const result = await configPromise;
			configCache = result;
			setConfig(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load configuration');
		} finally {
			setIsLoading(false);
			configPromise = null;
		}
	}, []);

	const refetch = useCallback(async () => {
		// Clear cache and refetch
		configCache = null;
		configPromise = null;
		await fetchConfig();
	}, [fetchConfig]);

	useEffect(() => {
		fetchConfig();
	}, [fetchConfig]);

	const value: TimelineContextValue = {
		config,
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
