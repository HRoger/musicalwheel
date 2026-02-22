/**
 * Print Template Block - Shared Component
 *
 * Renders the template content for both editor and frontend contexts.
 * Includes hydration of nested VX blocks for interactive preview.
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete for React hooks
import { useRef, useEffect, useState } from 'react';

// Access wp.element at runtime for render/unmount (not available via ES imports)
declare const wp: {
	element: {
		render: (element: React.ReactNode, container: Element) => void;
		unmountComponentAtNode: (container: Element) => boolean;
	};
};
import type {
	PrintTemplateComponentProps,
	PrintTemplateVxConfig,
} from '../types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';

// Import VX block components for hydration
import SearchFormComponent from '../../search-form/shared/SearchFormComponent';
import type { SearchFormAttributes, PostTypeConfig } from '../../search-form/types';

// Placeholder bar style
const placeholderBarStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: '#e0e0e0',
	padding: '16px',
	minHeight: '48px',
};

/**
 * Get REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Fetch post types configuration for search form
 */
async function fetchPostTypes(postTypeKeys: string[]): Promise<PostTypeConfig[]> {
	if (!postTypeKeys || postTypeKeys.length === 0) {
		return [];
	}

	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/search-form/frontend-config?post_types=${encodeURIComponent(postTypeKeys.join(','))}`;

	try {
		const response = await fetch(endpoint, {
			credentials: 'same-origin',
			headers: {
				'X-WP-Nonce': (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce || '',
			},
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error('Failed to fetch post types:', error);
		return [];
	}
}

/**
 * Parse vxconfig from a container element
 */
function parseSearchFormVxConfig(container: HTMLElement): SearchFormAttributes | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (!vxconfigScript?.textContent) {
		return null;
	}

	try {
		const config = JSON.parse(vxconfigScript.textContent);

		// Extract post types
		const postTypes = Array.isArray(config.postTypes)
			? config.postTypes.map((pt: { key: string }) => pt.key)
			: [];

		return {
			blockId: container.id || '',
			postTypes,
			showPostTypeFilter: config.showPostTypeFilter ?? true,
			filterLists: config.filterLists || {},
			onSubmit: 'refresh',
			postToFeedId: '',
			postToMapId: '',
			searchOn: 'submit',
			showSearchButton: config.showSearchButton ?? true,
			searchButtonText: config.searchButtonText || 'Search',
			searchButtonIcon: { library: '', value: '' },
			searchButtonWidth: config.searchButtonWidth,
			searchButtonWidth_tablet: config.searchButtonWidth_tablet,
			searchButtonWidth_mobile: config.searchButtonWidth_mobile,
			searchButtonWidthUnit: config.searchButtonWidthUnit || '%',
			showResetButton: config.showResetButton ?? false,
			resetButtonText: config.resetButtonText || 'Reset',
			resetButtonIcon: { library: '', value: '' },
			resetButtonWidth: config.resetButtonWidth,
			resetButtonWidth_tablet: config.resetButtonWidth_tablet,
			resetButtonWidth_mobile: config.resetButtonWidth_mobile,
			resetButtonWidthUnit: config.resetButtonWidthUnit || '%',
			voxelIntegration: true,
			adaptiveFiltering: false,
			portalMode: config.portalMode || { desktop: false, tablet: true, mobile: true },
			formToggleDesktop: config.formToggleDesktop ?? false,
			formToggleTablet: config.formToggleTablet ?? true,
			formToggleMobile: config.formToggleMobile ?? true,
			toggleText: 'Filter results',
			toggleIcon: { library: '', value: '' },
		};
	} catch (error) {
		console.error('Failed to parse search form vxconfig:', error);
		return null;
	}
}

/**
 * Search Form Wrapper for hydration - handles data fetching
 */
interface SearchFormHydrationWrapperProps {
	attributes: SearchFormAttributes;
}

function SearchFormHydrationWrapper({ attributes }: SearchFormHydrationWrapperProps) {
	const [postTypes, setPostTypes] = useState<PostTypeConfig[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPostTypes() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchPostTypes(attributes.postTypes || []);
				if (!cancelled) {
					setPostTypes(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPostTypes();

		return () => {
			cancelled = true;
		};
	}, [attributes.postTypes]);

	// Loading state - matches Voxel standard (ts-no-posts + ts-loader)
	if (isLoading) {
		return (
			<div className="ts-form ts-search-widget">
				<div className="ts-filter-wrapper flexify">
					<div className="ts-no-posts">
						<span className="ts-loader"></span>
					</div>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="ts-form ts-search-widget voxel-fse-error">
				<div className="ts-filter-wrapper flexify">
					<span>Error loading search form</span>
				</div>
			</div>
		);
	}

	// Filter to only selected post types
	const selectedPostTypes = postTypes.filter((pt: PostTypeConfig) =>
		attributes.postTypes?.includes(pt.key)
	);

	// Handle submit in editor context (no actual navigation)
	const handleSubmit = (values: Record<string, unknown>) => {
		console.log('Search form submitted (editor preview):', values);
	};

	return (
		<SearchFormComponent
			attributes={attributes}
			postTypes={selectedPostTypes}
			context="frontend"
			onSubmit={handleSubmit}
		/>
	);
}

/**
 * Track hydrated containers for cleanup
 */
const hydratedContainers = new Set<HTMLElement>();

/**
 * Hydrate nested VX blocks in a container
 */
function hydrateNestedVXBlocks(container: HTMLElement | null) {
	if (!container) return;

	// Find and hydrate Search Form blocks
	const searchForms = container.querySelectorAll<HTMLElement>('.ts-search-widget, .voxel-fse-search-form');

	searchForms.forEach((searchFormContainer) => {
		// Skip if already hydrated
		if (searchFormContainer.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const attributes = parseSearchFormVxConfig(searchFormContainer);
		if (!attributes) {
			return;
		}

		// Clear placeholder content
		searchFormContainer.innerHTML = '';
		searchFormContainer.dataset['hydrated'] = 'true';

		// Render using legacy render method (React 17 compatible)
		wp.element.render(<SearchFormHydrationWrapper attributes={attributes} />, searchFormContainer);
		hydratedContainers.add(searchFormContainer);
	});
}

/**
 * Clean up hydrated containers
 */
function cleanupHydratedRoots(container: HTMLElement | null) {
	if (!container) return;

	const searchForms = container.querySelectorAll<HTMLElement>('.ts-search-widget, .voxel-fse-search-form');

	searchForms.forEach((searchFormContainer) => {
		if (hydratedContainers.has(searchFormContainer)) {
			wp.element.unmountComponentAtNode(searchFormContainer);
			hydratedContainers.delete(searchFormContainer);
		}
	});
}

export default function PrintTemplateComponent({
	attributes,
	templateContent,
	isLoading,
	error,
	context,
}: PrintTemplateComponentProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Build class list
	const classList = ['ts-print-template-content'];

	if (attributes.customClasses) {
		classList.push(attributes.customClasses);
	}

	// Build vxconfig for re-rendering (required for DevTools visibility)
	const vxConfig: PrintTemplateVxConfig = {
		templateId: attributes.templateId || '',
		customClasses: attributes.customClasses || '',
	};

	// Hydrate nested VX blocks after template content is rendered
	useEffect(() => {
		if (!templateContent || !containerRef.current) {
			return;
		}

		// Small delay to ensure DOM is updated
		const timeoutId = setTimeout(() => {
			hydrateNestedVXBlocks(containerRef.current);
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			cleanupHydratedRoots(containerRef.current);
		};
	}, [templateContent]);

	// Loading state
	if (isLoading) {
		return (
			<div className={classList.join(' ')}>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className={classList.join(' ')}>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// No template selected
	if (!attributes.templateId) {
		return (
			<div className={classList.join(' ')}>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// Dynamic tag - show placeholder in editor
	if (
		context === 'editor' &&
		typeof attributes.templateId === 'string' &&
		attributes.templateId.startsWith('@tags()')
	) {
		return (
			<div className={classList.join(' ')}>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</div>
		);
	}

	// Render template content with hydration support
	return (
		<div className={classList.join(' ')} ref={containerRef}>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{templateContent ? (
				<div
					className="ts-print-template-rendered"
					dangerouslySetInnerHTML={{ __html: templateContent }}
				/>
			) : context === 'editor' ? (
				<EmptyPlaceholder />
			) : null}
		</div>
	);
}
