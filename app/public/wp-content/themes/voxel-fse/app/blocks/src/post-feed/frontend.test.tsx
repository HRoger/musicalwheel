/**
 * Vitest Tests for PostFeedComponent
 *
 * Tests 1:1 parity with Voxel's post-feed.js behavior:
 * - Pagination button states (disabled, hidden classes)
 * - Loading state class toggle (.vx-loading)
 * - Search form event integration
 * - HTML structure parity (CSS classes)
 * - Carousel navigation structure
 *
 * Reference: docs/block-conversions/post-feed/voxel-post-feed.beautified.js
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostFeedComponent from './shared/PostFeedComponent';
import type { PostFeedAttributes } from './types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.Voxel_Config
Object.defineProperty(window, 'Voxel_Config', {
	value: { home_url: 'http://example.com', ajax_url: 'http://example.com/?vx=1' },
	writable: true,
});

// Mock jQuery for voxel:markup-update event
(window as any).jQuery = vi.fn(() => ({
	trigger: vi.fn(),
}));

/**
 * Create default test attributes
 */
function createTestAttributes(overrides: Partial<PostFeedAttributes> = {}): PostFeedAttributes {
	return {
		blockId: 'test-block-123',
		source: 'search-form',
		searchFormId: 'search-form-456',
		postType: 'place',
		manualPostIds: [],
		filters: {},
		excludePosts: '',
		priorityFilter: false,
		priorityMin: 0,
		priorityMax: 0,
		offset: 0,
		cardTemplate: 'main',
		pagination: 'prev_next',
		postsPerPage: 12,
		displayDetails: true,
		noResultsLabel: 'No results found',
		layoutMode: 'grid',
		columns: 3,
		itemGap: 25,
		carouselItemWidthUnit: 'px',
		carouselAutoSlide: false,
		loadingStyle: 'opacity',
		loadingOpacity: 0.5,
		loadMoreIcon: { library: '' as const, value: '' },
		noResultsIcon: { library: '' as const, value: '' },
		rightArrowIcon: { library: '' as const, value: '' },
		leftArrowIcon: { library: '' as const, value: '' },
		rightChevronIcon: { library: '' as const, value: '' },
		leftChevronIcon: { library: '' as const, value: '' },
		resetIcon: { library: '' as const, value: '' },
		counterTypography: {},
		counterTextColor: '',
		orderByTypography: {},
		orderByTextColor: '',
		orderByTextColorHover: '',
		noResultsHideScreen: false,
		noResultsIconColor: '',
		noResultsTypography: {},
		noResultsTextColor: '',
		noResultsLinkColor: '',
		paginationTypography: {},
		paginationPadding: {},
		paginationWidth: 100,
		paginationWidthUnit: '%',
		paginationJustify: 'center',
		paginationBorderType: '',
		paginationTextColor: '',
		paginationBackgroundColor: '',
		paginationIconColor: '',
		paginationTextColorHover: '',
		paginationBackgroundColorHover: '',
		paginationBorderColorHover: '',
		paginationIconColorHover: '',
		carouselNavIconColor: '',
		carouselNavBackground: '',
		carouselNavBorderType: '',
		carouselNavIconColorHover: '',
		carouselNavBackgroundHover: '',
		carouselNavBorderColorHover: '',
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
		customCSS: '',
		...overrides,
	} as PostFeedAttributes;
}

/**
 * Create mock API response HTML
 */
function createMockResponse(options: {
	hasPrev?: boolean;
	hasNext?: boolean;
	hasResults?: boolean;
	totalCount?: number;
} = {}): string {
	const { hasPrev = false, hasNext = true, hasResults = true, totalCount = 10 } = options;

	return `
		<script class="info"
			data-has-prev="${hasPrev}"
			data-has-next="${hasNext}"
			data-has-results="${hasResults}"
			data-total-count="${totalCount}"
			data-display-count="Showing 1-12 of ${totalCount}"
		></script>
		<div class="ts-preview">Post 1</div>
		<div class="ts-preview">Post 2</div>
	`;
}

describe('PostFeedComponent', () => {
	beforeEach(() => {
		mockFetch.mockReset();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('HTML Structure Parity', () => {
		/**
		 * Test: Pagination container has correct CSS classes
		 * Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:3
		 * Voxel: <div class="feed-pagination flexify">
		 */
		it('renders pagination with feed-pagination flexify classes', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const pagination = container.querySelector('.feed-pagination.flexify');
				expect(pagination).toBeInTheDocument();
			});
		});

		/**
		 * Test: Prev button has ts-btn-large class
		 * Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:4
		 * Voxel: class="ts-btn ts-btn-1 ts-btn-large ts-load-prev"
		 */
		it('renders prev button with ts-btn-large class', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: true })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const prevButton = container.querySelector('.ts-load-prev');
				expect(prevButton).toHaveClass('ts-btn', 'ts-btn-1', 'ts-btn-large');
			});
		});

		/**
		 * Test: Next button has btn-icon-right class
		 * Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:8
		 * Voxel: class="ts-btn ts-btn-1 ts-btn-large btn-icon-right ts-load-next"
		 */
		it('renders next button with btn-icon-right class', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const nextButton = container.querySelector('.ts-load-next');
				expect(nextButton).toHaveClass('btn-icon-right');
			});
		});

		/**
		 * Test: Carousel nav uses ul/li structure
		 * Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:2-13
		 * Voxel: <ul class="simplify-ul flexify post-feed-nav"><li><a...></a></li></ul>
		 */
		it('renders carousel nav with ul.simplify-ul.flexify structure', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes({ layoutMode: 'carousel' })}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const nav = container.querySelector('ul.simplify-ul.flexify.post-feed-nav');
				expect(nav).toBeInTheDocument();

				const listItems = nav?.querySelectorAll('li');
				expect(listItems?.length).toBe(2);

				const prevLink = nav?.querySelector('li a.ts-prev-page');
				const nextLink = nav?.querySelector('li a.ts-next-page');
				expect(prevLink).toBeInTheDocument();
				expect(nextLink).toBeInTheDocument();
			});
		});

		/**
		 * Test: No results uses correct structure
		 * Evidence: themes/voxel/templates/widgets/post-feed/no-results.php:1-11
		 * Voxel: <div class="ts-no-posts">{icon}<p>{text}</p></div>
		 */
		it('renders no-results with ts-no-posts class', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasResults: false, totalCount: 0 })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const noResults = container.querySelector('.ts-no-posts');
				expect(noResults).toBeInTheDocument();
			});
		});
	});

	describe('Button State Parity', () => {
		/**
		 * Test: Prev button has disabled class when no previous page
		 * Evidence: voxel-post-feed.beautified.js:233-235
		 * Voxel: hasPrev ? removeClass('disabled') : addClass('disabled')
		 */
		it('adds disabled class to prev button when hasPrev is false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: false, hasNext: true })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const prevButton = container.querySelector('.ts-load-prev');
				expect(prevButton).toHaveClass('disabled');
			});
		});

		/**
		 * Test: Prev button removes disabled class when previous page exists
		 */
		it('removes disabled class from prev button when hasPrev is true', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: true, hasNext: true })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const prevButton = container.querySelector('.ts-load-prev');
				expect(prevButton).not.toHaveClass('disabled');
			});
		});

		/**
		 * Test: Next button has disabled class when no next page
		 * Evidence: voxel-post-feed.beautified.js:236-238
		 */
		it('adds disabled class to next button when hasNext is false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: true, hasNext: false })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const nextButton = container.querySelector('.ts-load-next');
				expect(nextButton).toHaveClass('disabled');
			});
		});

		/**
		 * Test: Load More button has hidden class when no next page
		 * Evidence: voxel-post-feed.beautified.js:245
		 */
		it('adds hidden class to load-more button when hasNext is false', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasNext: false })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes({ pagination: 'load_more' })}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const loadMoreButton = container.querySelector('.ts-load-more');
				expect(loadMoreButton).toHaveClass('hidden');
			});
		});

		/**
		 * Test: Pagination container hidden when no pages
		 * Evidence: voxel-post-feed.beautified.js:241-243
		 */
		it('hides pagination when no prev and no next', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: false, hasNext: false })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const pagination = container.querySelector('.feed-pagination');
				expect(pagination).toHaveClass('hidden');
			});
		});
	});

	describe('Loading State Parity', () => {
		/**
		 * Test: Component shows loading state initially
		 * Evidence: voxel-post-feed.beautified.js:122
		 * Voxel: feedContainer.addClass("vx-loading")
		 */
		it('starts in loading state', () => {
			mockFetch.mockImplementation(() => new Promise(() => { })); // Never resolves

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="editor"
				/>
			);

			// Check for loading class on container
			const feedContainer = container.querySelector('.ts-post-feed');
			expect(feedContainer?.className).toContain('vx-');
		});
	});

	describe('Search Form Integration', () => {
		/**
		 * Test: Listens for voxel-search-submit events
		 * Evidence: frontend.tsx:279-300 and PostFeedComponent.tsx:707-740
		 */
		it('responds to voxel-search-submit events with matching targetId', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const attributes = createTestAttributes();

			render(
				<PostFeedComponent
					attributes={attributes}
					context="frontend"
				/>
			);

			// Wait for initial render
			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalled();
			});

			// Reset mock to track new calls
			mockFetch.mockClear();

			// Dispatch search event
			window.dispatchEvent(
				new CustomEvent('voxel-search-submit', {
					detail: {
						targetId: attributes.blockId,
						postType: 'event',
						filters: { keywords: 'test' },
					},
				})
			);

			// Should trigger a new fetch
			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalled();
			});
		});

		/**
		 * Test: Ignores events with non-matching targetId
		 */
		it('ignores voxel-search-submit events with different targetId', async () => {
			mockFetch.mockResolvedValue({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const attributes = createTestAttributes();

			render(
				<PostFeedComponent
					attributes={attributes}
					context="frontend"
				/>
			);

			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalled();
			});

			const initialCallCount = mockFetch.mock.calls.length;

			// Dispatch event with different targetId
			window.dispatchEvent(
				new CustomEvent('voxel-search-submit', {
					detail: {
						targetId: 'different-block-id',
						postType: 'event',
						filters: {},
					},
				})
			);

			// Should NOT trigger a new fetch
			expect(mockFetch.mock.calls.length).toBe(initialCallCount);
		});
	});

	describe('Pagination Click Handlers', () => {
		/**
		 * Test: Clicking prev button decrements page
		 * Evidence: voxel-post-feed.beautified.js:286-295
		 */
		it('decrements page when prev is clicked', async () => {
			// First response: page 2 with hasPrev
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: true, hasNext: true })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const prevButton = container.querySelector('.ts-load-prev');
				expect(prevButton).not.toHaveClass('disabled');
			});

			// Mock response for page 1
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: false, hasNext: true })),
			});

			// Click prev
			const prevButton = container.querySelector('.ts-load-prev') as HTMLElement;
			fireEvent.click(prevButton);

			// Verify fetch was called
			await waitFor(() => {
				expect(mockFetch.mock.calls.length).toBeGreaterThan(1);
			});
		});

		/**
		 * Test: Clicking disabled prev button does nothing
		 */
		it('does nothing when disabled prev is clicked', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse({ hasPrev: false })),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const prevButton = container.querySelector('.ts-load-prev');
				expect(prevButton).toHaveClass('disabled');
			});

			const callCountBefore = mockFetch.mock.calls.length;

			// Click disabled prev
			const prevButton = container.querySelector('.ts-load-prev') as HTMLElement;
			fireEvent.click(prevButton);

			// Should NOT trigger fetch
			expect(mockFetch.mock.calls.length).toBe(callCountBefore);
		});
	});

	describe('Grid Classes Parity', () => {
		/**
		 * Test: Grid has post-feed-grid class
		 * Evidence: themes/voxel/templates/widgets/post-feed.php:17-19
		 */
		it('renders grid with post-feed-grid class', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes()}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const grid = container.querySelector('.post-feed-grid');
				expect(grid).toBeInTheDocument();
			});
		});

		/**
		 * Test: Grid mode uses ts-feed-grid-default class
		 */
		it('uses ts-feed-grid-default for grid layout', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes({ layoutMode: 'grid' })}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const grid = container.querySelector('.post-feed-grid');
				expect(grid).toHaveClass('ts-feed-grid-default');
			});
		});

		/**
		 * Test: Carousel mode uses ts-feed-nowrap class
		 */
		it('uses ts-feed-nowrap for carousel layout', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes({ layoutMode: 'carousel' })}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const grid = container.querySelector('.post-feed-grid');
				expect(grid).toHaveClass('ts-feed-nowrap');
				expect(grid).toHaveClass('min-scroll', 'min-scroll-h');
			});
		});

		/**
		 * Test: Grid has sf-post-feed class when connected to search form
		 * Evidence: themes/voxel/templates/widgets/post-feed.php:19
		 */
		it('adds sf-post-feed class when source is search-form', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const { container } = render(
				<PostFeedComponent
					attributes={createTestAttributes({ source: 'search-form' })}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const grid = container.querySelector('.post-feed-grid');
				expect(grid).toHaveClass('sf-post-feed');
			});
		});
	});

	describe('VxConfig Output', () => {
		/**
		 * Test: Renders vxconfig script for DevTools visibility
		 * Evidence: Plan C+ architecture requirement
		 */
		it('outputs vxconfig JSON in script tag', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: () => Promise.resolve(createMockResponse()),
			});

			const attributes = createTestAttributes();

			const { container } = render(
				<PostFeedComponent
					attributes={attributes}
					context="frontend"
				/>
			);

			await waitFor(() => {
				const vxconfigScript = container.querySelector('script.vxconfig');
				expect(vxconfigScript).toBeInTheDocument();

				const config = JSON.parse(vxconfigScript?.textContent || '{}');
				expect(config.blockId).toBe(attributes.blockId);
				expect(config.postType).toBe(attributes.postType);
				expect(config.pagination).toBe(attributes.pagination);
			});
		});
	});
});
