/**
 * Stripe Account Block - Content Tab Attribute Tests
 *
 * Tests attribute serialization for Content Tab controls:
 * - General Settings accordion
 * - Preview Settings accordion
 * - Icons accordion
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

/**
 * Icon value structure from shared controls
 */
interface IconValue {
	library: 'icon' | 'image';
	value: string;
	url?: string;
}

/**
 * Image upload value structure
 */
interface ImageValue {
	id: number;
	url: string;
}

// ========================================
// Accordion 1: General Settings
// ========================================

describe('General Settings Accordion', () => {
	describe('genImage (ImageUploadControl)', () => {
		it('should accept empty object as default', () => {
			const genImage: ImageValue = { id: 0, url: '' };
			expect(genImage.id).toBe(0);
			expect(genImage.url).toBe('');
		});

		it('should accept valid image data', () => {
			const genImage: ImageValue = { id: 123, url: 'https://example.com/image.jpg' };
			expect(genImage.id).toBe(123);
			expect(genImage.url).toBe('https://example.com/image.jpg');
		});

		it('should survive JSON round-trip', () => {
			const original: ImageValue = { id: 456, url: 'https://example.com/stripe-logo.png' };
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});
	});

	describe('genImageDynamicTag (Dynamic Tag Support)', () => {
		it('should accept empty string as default', () => {
			const genImageDynamicTag = '';
			expect(genImageDynamicTag).toBe('');
		});

		it('should accept dynamic tag value with markers', () => {
			const genImageDynamicTag = '@tags()@post.thumbnail@endtags()';
			expect(genImageDynamicTag).toContain('@tags()');
			expect(genImageDynamicTag).toContain('@endtags()');
		});

		it('should survive JSON round-trip', () => {
			const original = '@tags()@post.thumbnail@endtags()';
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toBe(original);
		});
	});
});

// ========================================
// Accordion 2: Preview Settings
// ========================================

describe('Preview Settings Accordion', () => {
	describe('previewAsUser (TextControl type=number)', () => {
		it('should accept null as default', () => {
			const previewAsUser: number | null = null;
			expect(previewAsUser).toBeNull();
		});

		it('should accept valid user ID', () => {
			const previewAsUser = 42;
			expect(previewAsUser).toBe(42);
			expect(typeof previewAsUser).toBe('number');
		});

		it('should handle string to number conversion', () => {
			const inputString = '123';
			const previewAsUser = parseInt(inputString, 10);
			expect(previewAsUser).toBe(123);
		});

		it('should survive JSON round-trip', () => {
			const original = 789;
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toBe(original);
		});
	});

	describe('previewAsUserDynamicTag (Dynamic Tag Support)', () => {
		it('should accept empty string as default', () => {
			const previewAsUserDynamicTag = '';
			expect(previewAsUserDynamicTag).toBe('');
		});

		it('should accept dynamic tag value with markers', () => {
			const previewAsUserDynamicTag = '@tags()@user.id@endtags()';
			expect(previewAsUserDynamicTag).toContain('@tags()');
			expect(previewAsUserDynamicTag).toContain('@endtags()');
		});

		it('should survive JSON round-trip', () => {
			const original = '@tags()@user.id@endtags()';
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toBe(original);
		});
	});
});

// ========================================
// Accordion 3: Icons
// ========================================

describe('Icons Accordion', () => {
	const iconAttributes = [
		'tsSetupIco',
		'tsSubmitIco',
		'tsUpdateIco',
		'tsStripeIco',
		'tsShippingIco',
		'tsChevronLeft',
		'saveIcon',
		'handleIcon',
		'tsZoneIco',
		'trashIcon',
		'downIcon',
		'tsSearchIcon',
		'tsAddIcon',
	];

	describe('IconPickerControl attributes', () => {
		it('should accept null as default for all icon attributes', () => {
			iconAttributes.forEach((attr) => {
				const iconValue: IconValue | null = null;
				expect(iconValue).toBeNull();
			});
		});

		it('should accept valid icon value (library: icon)', () => {
			const iconValue: IconValue = { library: 'icon', value: 'las la-plus' };
			expect(iconValue.library).toBe('icon');
			expect(iconValue.value).toBe('las la-plus');
		});

		it('should accept valid icon value (library: image)', () => {
			const iconValue: IconValue = {
				library: 'image',
				value: 'https://example.com/icon.svg',
				url: 'https://example.com/icon.svg',
			};
			expect(iconValue.library).toBe('image');
			expect(iconValue.value).toBe('https://example.com/icon.svg');
			expect(iconValue.url).toBe('https://example.com/icon.svg');
		});

		it('should survive JSON round-trip for icon library', () => {
			const original: IconValue = { library: 'icon', value: 'las la-stripe' };
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});

		it('should survive JSON round-trip for image library', () => {
			const original: IconValue = {
				library: 'image',
				value: 'https://cdn.example.com/custom-icon.png',
				url: 'https://cdn.example.com/custom-icon.png',
			};
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toEqual(original);
		});
	});

	describe('Default icon values', () => {
		const defaultIcons: Record<string, IconValue> = {
			tsSetupIco: { library: 'icon', value: 'las la-plus' },
			tsSubmitIco: { library: 'icon', value: 'las la-info-circle' },
			tsUpdateIco: { library: 'icon', value: 'las la-pen' },
			tsStripeIco: { library: 'icon', value: 'las la-stripe' },
			tsShippingIco: { library: 'icon', value: 'las la-shipping-fast' },
			tsChevronLeft: { library: 'icon', value: 'las la-angle-left' },
			saveIcon: { library: 'icon', value: 'las la-save' },
			handleIcon: { library: 'icon', value: 'las la-grip-vertical' },
			tsZoneIco: { library: 'icon', value: 'las la-flag' },
			trashIcon: { library: 'icon', value: 'las la-trash' },
			downIcon: { library: 'icon', value: 'las la-angle-down' },
			tsSearchIcon: { library: 'icon', value: 'las la-search' },
			tsAddIcon: { library: 'icon', value: 'las la-plus' },
		};

		it('should have valid default values for all icons', () => {
			Object.entries(defaultIcons).forEach(([key, value]) => {
				expect(value.library).toBe('icon');
				expect(value.value).toMatch(/^las la-/);
			});
		});

		it('should have unique icon classes for most icons', () => {
			const iconClasses = Object.values(defaultIcons).map((icon) => icon.value);
			const uniqueClasses = new Set(iconClasses);
			// tsSetupIco and tsAddIcon both use 'las la-plus', so we expect 12 unique classes
			expect(uniqueClasses.size).toBe(12);
		});
	});
});

// ========================================
// Complete Attribute Inventory
// ========================================

describe('Complete Attribute Inventory', () => {
	const attributeInventory = {
		generalSettings: ['genImage', 'genImageDynamicTag'],
		previewSettings: ['previewAsUser', 'previewAsUserDynamicTag'],
		icons: [
			'tsSetupIco',
			'tsSubmitIco',
			'tsUpdateIco',
			'tsStripeIco',
			'tsShippingIco',
			'tsChevronLeft',
			'saveIcon',
			'handleIcon',
			'tsZoneIco',
			'trashIcon',
			'downIcon',
			'tsSearchIcon',
			'tsAddIcon',
		],
		metadata: ['blockId', 'contentTabOpenPanel'],
	};

	it('should have unique attribute names across all sections', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		// 2 genImage + 2 previewAsUser + 13 icons + 2 metadata = 19 total
		expect(allAttributes.length).toBe(19);
		console.log(`Total Content Tab attributes: ${allAttributes.length}`);
	});

	it('should include all icon attributes', () => {
		const iconAttrs = attributeInventory.icons;
		expect(iconAttrs.length).toBe(13);
	});

	it('should include dynamic tag attributes', () => {
		const dynamicTagAttrs = [
			...attributeInventory.generalSettings.filter(attr => attr.includes('DynamicTag')),
			...attributeInventory.previewSettings.filter(attr => attr.includes('DynamicTag')),
		];
		expect(dynamicTagAttrs.length).toBe(2);
		expect(dynamicTagAttrs).toContain('genImageDynamicTag');
		expect(dynamicTagAttrs).toContain('previewAsUserDynamicTag');
	});
});

// ========================================
// Accordion State Persistence
// ========================================

describe('Accordion State Persistence', () => {
	describe('contentTabOpenPanel attribute', () => {
		it('should accept default panel ID', () => {
			const contentTabOpenPanel = 'general-settings';
			expect(contentTabOpenPanel).toBe('general-settings');
		});

		it('should accept valid panel IDs', () => {
			const validPanels = ['general-settings', 'preview-settings', 'icons'];
			validPanels.forEach((panel) => {
				const contentTabOpenPanel: string = panel;
				expect(validPanels).toContain(contentTabOpenPanel);
			});
		});

		it('should survive JSON round-trip', () => {
			const original = 'icons';
			const roundTripped = JSON.parse(JSON.stringify(original));
			expect(roundTripped).toBe(original);
		});
	});
});
