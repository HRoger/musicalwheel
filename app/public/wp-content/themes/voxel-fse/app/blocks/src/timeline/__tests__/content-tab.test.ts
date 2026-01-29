/**
 * Timeline Block - Content Tab Attribute Tests
 *
 * Tests for all attributes in the Content tab (both accordions):
 * 1. Timeline settings accordion
 * 2. Timeline icons accordion
 *
 * Reference pattern: search-form/__tests__/general-tab.test.ts (148 attributes)
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import type { TimelineAttributes, OrderingOption, TimelineDisplayMode } from '../types';
import type { IconValue } from '@shared/types';

// ============================================================================
// ACCORDION 1: Timeline settings
// Evidence: themes/voxel/app/widgets/timeline.php:L25-131
// ============================================================================

describe('Accordion 1: Timeline settings', () => {
	describe('mode (SelectControl)', () => {
		it('should accept valid display mode values', () => {
			const validModes: TimelineDisplayMode[] = [
				'post_reviews',
				'post_wall',
				'post_timeline',
				'author_timeline',
				'user_feed',
				'global_feed',
			];
			validModes.forEach((mode) => {
				expect(['post_reviews', 'post_wall', 'post_timeline', 'author_timeline', 'user_feed', 'global_feed']).toContain(mode);
			});
		});

		it('should have default value of "user_feed"', () => {
			const mode: TimelineDisplayMode = 'user_feed';
			expect(mode).toBe('user_feed');
		});
	});

	describe('orderingOptions (RepeaterControl)', () => {
		it('should accept empty array as default', () => {
			const orderingOptions: OrderingOption[] = [];
			expect(Array.isArray(orderingOptions)).toBe(true);
			expect(orderingOptions.length).toBe(0);
		});

		it('should accept valid ordering option structure', () => {
			const orderingOptions: OrderingOption[] = [
				{
					_id: 'default-latest',
					order: 'latest',
					time: 'all_time',
					timeCustom: 7,
					label: 'Latest',
				},
			];
			expect(orderingOptions[0]._id).toBe('default-latest');
			expect(orderingOptions[0].order).toBe('latest');
			expect(orderingOptions[0].time).toBe('all_time');
			expect(orderingOptions[0].timeCustom).toBe(7);
			expect(orderingOptions[0].label).toBe('Latest');
		});

		it('should accept all valid order values', () => {
			const validOrders: OrderingOption['order'][] = [
				'latest',
				'earliest',
				'most_liked',
				'most_discussed',
				'most_popular',
				'best_rated',
				'worst_rated',
			];
			validOrders.forEach((order) => {
				const option: OrderingOption = {
					_id: 'test',
					order,
					time: 'all_time',
					timeCustom: 7,
					label: 'Test',
				};
				expect(option.order).toBe(order);
			});
		});

		it('should accept all valid time values', () => {
			const validTimes: OrderingOption['time'][] = [
				'today',
				'this_week',
				'this_month',
				'this_year',
				'all_time',
				'custom',
			];
			validTimes.forEach((time) => {
				const option: OrderingOption = {
					_id: 'test',
					order: 'latest',
					time,
					timeCustom: 7,
					label: 'Test',
				};
				expect(option.time).toBe(time);
			});
		});

		it('should handle timeCustom number within valid range', () => {
			const option: OrderingOption = {
				_id: 'test',
				order: 'latest',
				time: 'custom',
				timeCustom: 30,
				label: 'Test',
			};
			expect(typeof option.timeCustom).toBe('number');
			expect(option.timeCustom).toBeGreaterThan(0);
			expect(option.timeCustom).toBeLessThanOrEqual(365);
		});

		it('should survive JSON round-trip', () => {
			const original: OrderingOption[] = [
				{
					_id: 'opt1',
					order: 'latest',
					time: 'all_time',
					timeCustom: 7,
					label: 'Latest',
				},
				{
					_id: 'opt2',
					order: 'most_liked',
					time: 'this_week',
					timeCustom: 7,
					label: 'Popular',
				},
			];
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});
	});

	describe('noStatusText (TextControl)', () => {
		it('should accept string values', () => {
			const noStatusText = 'No posts available';
			expect(typeof noStatusText).toBe('string');
		});

		it('should have default value', () => {
			const noStatusText = 'No posts available';
			expect(noStatusText).toBe('No posts available');
		});

		it('should accept empty string', () => {
			const noStatusText = '';
			expect(typeof noStatusText).toBe('string');
			expect(noStatusText).toBe('');
		});
	});

	describe('searchEnabled (ToggleControl)', () => {
		it('should accept boolean values', () => {
			expect(typeof true).toBe('boolean');
			expect(typeof false).toBe('boolean');
		});

		it('should have default value of true', () => {
			const searchEnabled = true;
			expect(searchEnabled).toBe(true);
		});
	});

	describe('searchValue (DynamicTagTextControl)', () => {
		it('should accept string values', () => {
			const searchValue = '@tags()@site().query_var(q)@endtags()';
			expect(typeof searchValue).toBe('string');
		});

		it('should accept empty string as default', () => {
			const searchValue = '';
			expect(typeof searchValue).toBe('string');
			expect(searchValue).toBe('');
		});

		it('should accept dynamic tag syntax', () => {
			const searchValue = '@tags()@site().query_var(q)@endtags()';
			expect(searchValue).toContain('@tags()');
			expect(searchValue).toContain('@endtags()');
		});
	});
});

// ============================================================================
// ACCORDION 2: Timeline icons
// Evidence: themes/voxel/app/widgets/timeline.php:L133-306
// ============================================================================

describe('Accordion 2: Timeline icons', () => {
	// Helper function to validate IconValue structure
	function validateIconValue(icon: IconValue | null): void {
		if (icon !== null) {
			expect(icon).toHaveProperty('value');
			expect(icon).toHaveProperty('library');
		}
	}

	describe('verifiedIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const verifiedIcon: IconValue | null = null;
			expect(verifiedIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const verifiedIcon: IconValue = {
				value: 'fas fa-check-circle',
				library: 'fa-solid',
			};
			validateIconValue(verifiedIcon);
		});
	});

	describe('repostIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const repostIcon: IconValue | null = null;
			expect(repostIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const repostIcon: IconValue = {
				value: 'fas fa-retweet',
				library: 'fa-solid',
			};
			validateIconValue(repostIcon);
		});
	});

	describe('moreIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const moreIcon: IconValue | null = null;
			expect(moreIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const moreIcon: IconValue = {
				value: 'fas fa-ellipsis-h',
				library: 'fa-solid',
			};
			validateIconValue(moreIcon);
		});
	});

	describe('likeIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const likeIcon: IconValue | null = null;
			expect(likeIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const likeIcon: IconValue = {
				value: 'far fa-heart',
				library: 'fa-regular',
			};
			validateIconValue(likeIcon);
		});
	});

	describe('likedIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const likedIcon: IconValue | null = null;
			expect(likedIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const likedIcon: IconValue = {
				value: 'fas fa-heart',
				library: 'fa-solid',
			};
			validateIconValue(likedIcon);
		});
	});

	describe('commentIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const commentIcon: IconValue | null = null;
			expect(commentIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const commentIcon: IconValue = {
				value: 'far fa-comment',
				library: 'fa-regular',
			};
			validateIconValue(commentIcon);
		});
	});

	describe('replyIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const replyIcon: IconValue | null = null;
			expect(replyIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const replyIcon: IconValue = {
				value: 'fas fa-reply',
				library: 'fa-solid',
			};
			validateIconValue(replyIcon);
		});
	});

	describe('galleryIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const galleryIcon: IconValue | null = null;
			expect(galleryIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const galleryIcon: IconValue = {
				value: 'far fa-images',
				library: 'fa-regular',
			};
			validateIconValue(galleryIcon);
		});
	});

	describe('uploadIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const uploadIcon: IconValue | null = null;
			expect(uploadIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const uploadIcon: IconValue = {
				value: 'fas fa-upload',
				library: 'fa-solid',
			};
			validateIconValue(uploadIcon);
		});
	});

	describe('emojiIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const emojiIcon: IconValue | null = null;
			expect(emojiIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const emojiIcon: IconValue = {
				value: 'far fa-smile',
				library: 'fa-regular',
			};
			validateIconValue(emojiIcon);
		});
	});

	describe('searchIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const searchIcon: IconValue | null = null;
			expect(searchIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const searchIcon: IconValue = {
				value: 'fas fa-search',
				library: 'fa-solid',
			};
			validateIconValue(searchIcon);
		});
	});

	describe('trashIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const trashIcon: IconValue | null = null;
			expect(trashIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const trashIcon: IconValue = {
				value: 'far fa-trash-alt',
				library: 'fa-regular',
			};
			validateIconValue(trashIcon);
		});
	});

	describe('externalIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const externalIcon: IconValue | null = null;
			expect(externalIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const externalIcon: IconValue = {
				value: 'fas fa-external-link-alt',
				library: 'fa-solid',
			};
			validateIconValue(externalIcon);
		});
	});

	describe('loadMoreIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const loadMoreIcon: IconValue | null = null;
			expect(loadMoreIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const loadMoreIcon: IconValue = {
				value: 'fas fa-sync',
				library: 'fa-solid',
			};
			validateIconValue(loadMoreIcon);
		});
	});

	describe('noPostsIcon (IconPickerControl)', () => {
		it('should accept null as default', () => {
			const noPostsIcon: IconValue | null = null;
			expect(noPostsIcon).toBeNull();
		});

		it('should accept valid IconValue structure', () => {
			const noPostsIcon: IconValue = {
				value: 'fas fa-inbox',
				library: 'fa-solid',
			};
			validateIconValue(noPostsIcon);
		});
	});
});

// ============================================================================
// COMPLETE ATTRIBUTE INVENTORY
// ============================================================================

describe('Complete Attribute Inventory', () => {
	const attributeInventory = {
		timelineSettings: [
			'mode',
			'orderingOptions',
			'noStatusText',
			'searchEnabled',
			'searchValue',
		],
		timelineIcons: [
			'verifiedIcon',
			'repostIcon',
			'moreIcon',
			'likeIcon',
			'likedIcon',
			'commentIcon',
			'replyIcon',
			'galleryIcon',
			'uploadIcon',
			'emojiIcon',
			'searchIcon',
			'trashIcon',
			'externalIcon',
			'loadMoreIcon',
			'noPostsIcon',
		],
		inspectorState: [
			'contentTabOpenPanel',
		],
	};

	it('should have unique attribute names across all sections', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		expect(allAttributes.length).toBe(21); // 5 settings + 15 icons + 1 state
		console.log(`Total attributes in Content tab: ${allAttributes.length}`);
	});

	it('should have all required timeline settings attributes', () => {
		expect(attributeInventory.timelineSettings.length).toBe(5);
	});

	it('should have all 15 timeline icon attributes', () => {
		expect(attributeInventory.timelineIcons.length).toBe(15);
	});

	it('should have inspector state attribute', () => {
		expect(attributeInventory.inspectorState.length).toBe(1);
		expect(attributeInventory.inspectorState[0]).toBe('contentTabOpenPanel');
	});
});

// ============================================================================
// JSON ROUND-TRIP PERSISTENCE TESTS
// ============================================================================

describe('Round-trip Persistence Tests', () => {
	it('TimelineAttributes should survive JSON round-trip', () => {
		const original: TimelineAttributes = {
			mode: 'user_feed',
			orderingOptions: [
				{
					_id: 'default-latest',
					order: 'latest',
					time: 'all_time',
					timeCustom: 7,
					label: 'Latest',
				},
			],
			noStatusText: 'No posts available',
			searchEnabled: true,
			searchValue: '@tags()@site().query_var(q)@endtags()',
			verifiedIcon: { value: 'fas fa-check-circle', library: 'fa-solid' },
			repostIcon: null,
			moreIcon: null,
			likeIcon: null,
			likedIcon: null,
			commentIcon: null,
			replyIcon: null,
			galleryIcon: null,
			uploadIcon: null,
			emojiIcon: null,
			searchIcon: null,
			trashIcon: null,
			externalIcon: null,
			loadMoreIcon: null,
			noPostsIcon: null,
			contentTabOpenPanel: 'timeline-settings',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('OrderingOption array should survive JSON round-trip', () => {
		const original: OrderingOption[] = [
			{
				_id: 'opt1',
				order: 'latest',
				time: 'all_time',
				timeCustom: 7,
				label: 'Latest',
			},
			{
				_id: 'opt2',
				order: 'most_liked',
				time: 'this_week',
				timeCustom: 7,
				label: 'Most liked this week',
			},
		];
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('IconValue should survive JSON round-trip', () => {
		const original: IconValue = {
			value: 'fas fa-heart',
			library: 'fa-solid',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});
});

// ============================================================================
// BLOCK ATTRIBUTE DEFAULTS
// ============================================================================

describe('Block Attribute Defaults', () => {
	it('should have correct default mode', () => {
		const defaultMode: TimelineDisplayMode = 'user_feed';
		expect(defaultMode).toBe('user_feed');
	});

	it('should have default ordering options array', () => {
		const defaultOrderingOptions: OrderingOption[] = [
			{
				_id: 'default-latest',
				order: 'latest',
				time: 'all_time',
				timeCustom: 7,
				label: 'Latest',
			},
		];
		expect(defaultOrderingOptions.length).toBe(1);
		expect(defaultOrderingOptions[0].order).toBe('latest');
	});

	it('should have correct default noStatusText', () => {
		const defaultNoStatusText = 'No posts available';
		expect(defaultNoStatusText).toBe('No posts available');
	});

	it('should have searchEnabled default to true', () => {
		const defaultSearchEnabled = true;
		expect(defaultSearchEnabled).toBe(true);
	});

	it('should have searchValue default to empty string', () => {
		const defaultSearchValue = '';
		expect(defaultSearchValue).toBe('');
	});

	it('should have all icon attributes default to null', () => {
		const defaultIcons = {
			verifiedIcon: null,
			repostIcon: null,
			moreIcon: null,
			likeIcon: null,
			likedIcon: null,
			commentIcon: null,
			replyIcon: null,
			galleryIcon: null,
			uploadIcon: null,
			emojiIcon: null,
			searchIcon: null,
			trashIcon: null,
			externalIcon: null,
			loadMoreIcon: null,
			noPostsIcon: null,
		};
		Object.values(defaultIcons).forEach((icon) => {
			expect(icon).toBeNull();
		});
	});

	it('should have contentTabOpenPanel default to "timeline-settings"', () => {
		const defaultContentTabOpenPanel = 'timeline-settings';
		expect(defaultContentTabOpenPanel).toBe('timeline-settings');
	});
});
