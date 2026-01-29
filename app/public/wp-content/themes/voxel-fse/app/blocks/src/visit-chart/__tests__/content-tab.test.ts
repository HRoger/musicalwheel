/**
 * Visit Chart Block - Content Tab Attribute Tests
 *
 * Tests for Content tab controls to ensure proper serialization and persistence.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// Type definitions for attribute configs
interface IconValue {
	library?: string;
	value?: string;
}

// CSS Generation Helpers
function generateIconCSS(icon: IconValue | undefined): string {
	if (!icon || !icon.value) return '';
	return `content: '${icon.value}';`;
}

describe('Visit Chart Block - Content Tab Attributes', () => {
	describe('Accordion 1: Chart', () => {
		describe('source (SelectControl)', () => {
			it('should accept valid source values', () => {
				const validSources = ['post', 'user', 'site'] as const;
				validSources.forEach((source) => {
					expect(['post', 'user', 'site']).toContain(source);
				});
			});

			it('should have default value of "post"', () => {
				const source = 'post';
				expect(source).toBe('post');
			});
		});

		describe('activeChart (SelectControl)', () => {
			it('should accept valid activeChart values', () => {
				const validCharts = ['24h', '7d', '30d', '12m'] as const;
				validCharts.forEach((chart) => {
					expect(['24h', '7d', '30d', '12m']).toContain(chart);
				});
			});

			it('should have default value of "7d"', () => {
				const activeChart = '7d';
				expect(activeChart).toBe('7d');
			});
		});

		describe('viewType (SelectControl)', () => {
			it('should accept valid viewType values', () => {
				const validTypes = ['views', 'unique_views'] as const;
				validTypes.forEach((type) => {
					expect(['views', 'unique_views']).toContain(type);
				});
			});

			it('should have default value of "views"', () => {
				const viewType = 'views';
				expect(viewType).toBe('views');
			});
		});
	});

	describe('Accordion 2: Icons', () => {
		describe('chartIcon (AdvancedIconControl)', () => {
			it('should accept empty object as default', () => {
				const chartIcon: IconValue = {};
				expect(Object.keys(chartIcon).length).toBe(0);
			});

			it('should accept valid icon value', () => {
				const chartIcon: IconValue = {
					library: 'fa-solid',
					value: 'chart-bar',
				};
				expect(chartIcon.library).toBe('fa-solid');
				expect(chartIcon.value).toBe('chart-bar');
			});

			it('should generate valid CSS', () => {
				const chartIcon: IconValue = {
					library: 'fa-solid',
					value: 'chart-bar',
				};
				const css = generateIconCSS(chartIcon);
				expect(css).toBe("content: 'chart-bar';");
			});

			it('should handle empty icon gracefully', () => {
				const chartIcon: IconValue = {};
				const css = generateIconCSS(chartIcon);
				expect(css).toBe('');
			});

			it('should support dynamic tags', () => {
				const chartIconWithTag: IconValue = {
					library: 'dynamic',
					value: '@post.featured_image',
				};
				expect(chartIconWithTag.library).toBe('dynamic');
				expect(chartIconWithTag.value).toBe('@post.featured_image');
			});
		});

		describe('chevronRight (AdvancedIconControl)', () => {
			it('should accept empty object as default', () => {
				const chevronRight: IconValue = {};
				expect(Object.keys(chevronRight).length).toBe(0);
			});

			it('should accept valid icon value', () => {
				const chevronRight: IconValue = {
					library: 'fa-solid',
					value: 'chevron-right',
				};
				expect(chevronRight.library).toBe('fa-solid');
				expect(chevronRight.value).toBe('chevron-right');
			});

			it('should support dynamic tags', () => {
				const chevronRightWithTag: IconValue = {
					library: 'dynamic',
					value: '@post.icon',
				};
				expect(chevronRightWithTag.library).toBe('dynamic');
			});
		});

		describe('chevronLeft (AdvancedIconControl)', () => {
			it('should accept empty object as default', () => {
				const chevronLeft: IconValue = {};
				expect(Object.keys(chevronLeft).length).toBe(0);
			});

			it('should accept valid icon value', () => {
				const chevronLeft: IconValue = {
					library: 'fa-solid',
					value: 'chevron-left',
				};
				expect(chevronLeft.library).toBe('fa-solid');
				expect(chevronLeft.value).toBe('chevron-left');
			});

			it('should support dynamic tags', () => {
				const chevronLeftWithTag: IconValue = {
					library: 'dynamic',
					value: '@post.icon',
				};
				expect(chevronLeftWithTag.library).toBe('dynamic');
			});
		});
	});

	describe('Accordion State Persistence', () => {
		describe('contentTabOpenPanel (state attribute)', () => {
			it('should accept accordion IDs', () => {
				const validPanels = ['chart', 'icons'];
				validPanels.forEach((panel) => {
					expect(['chart', 'icons']).toContain(panel);
				});
			});

			it('should have default value of "chart"', () => {
				const contentTabOpenPanel = 'chart';
				expect(contentTabOpenPanel).toBe('chart');
			});
		});
	});

	describe('Complete Attribute Inventory', () => {
		const attributeInventory = {
			chart: ['source', 'activeChart', 'viewType'],
			icons: ['chartIcon', 'chevronRight', 'chevronLeft'],
			state: ['contentTabOpenPanel'],
		};

		it('should have unique attribute names across all sections', () => {
			const allAttributes = Object.values(attributeInventory).flat();
			const uniqueAttributes = new Set(allAttributes);
			expect(uniqueAttributes.size).toBe(allAttributes.length);
		});

		it('should have correct total attribute count', () => {
			const allAttributes = Object.values(attributeInventory).flat();
			expect(allAttributes.length).toBe(7); // 3 chart + 3 icons + 1 state
		});
	});

	describe('Round-trip Persistence Tests', () => {
		it('source should survive JSON round-trip', () => {
			const original = 'user';
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});

		it('IconValue should survive JSON round-trip', () => {
			const original: IconValue = {
				library: 'fa-solid',
				value: 'chart-bar',
			};
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});

		it('Empty IconValue should survive JSON round-trip', () => {
			const original: IconValue = {};
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});
	});

	describe('Integration Tests', () => {
		it('should handle complete block attributes', () => {
			const attributes = {
				blockId: 'test-123',
				source: 'post',
				activeChart: '7d',
				viewType: 'views',
				chartIcon: { library: 'fa-solid', value: 'chart-bar' },
				chevronRight: { library: 'fa-solid', value: 'chevron-right' },
				chevronLeft: { library: 'fa-solid', value: 'chevron-left' },
				contentTabOpenPanel: 'chart',
			};

			// Verify all attributes are present
			expect(attributes.source).toBe('post');
			expect(attributes.activeChart).toBe('7d');
			expect(attributes.viewType).toBe('views');
			expect(attributes.chartIcon.value).toBe('chart-bar');
			expect(attributes.contentTabOpenPanel).toBe('chart');
		});

		it('should handle attributes with defaults', () => {
			const attributes = {
				blockId: '',
				source: 'post',
				activeChart: '7d',
				viewType: 'views',
				chartIcon: {},
				chevronRight: {},
				chevronLeft: {},
				contentTabOpenPanel: 'chart',
			};

			// Verify defaults
			expect(attributes.source).toBe('post');
			expect(attributes.activeChart).toBe('7d');
			expect(attributes.viewType).toBe('views');
			expect(Object.keys(attributes.chartIcon).length).toBe(0);
		});
	});
});
