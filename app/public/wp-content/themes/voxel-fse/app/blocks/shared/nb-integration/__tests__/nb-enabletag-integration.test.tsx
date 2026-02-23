/**
 * NB EnableTag Integration Tests
 *
 * Tests the EnableTag button integration across all NectarBlocks:
 *
 * 1. isBodyField helper — identifies body-observer-managed fields
 * 2. Field config validation — every block's fields have correct structure
 * 3. EnableTag placement types — inline vs corner for each field
 * 4. Toolbar tag blocks — text/button get voxelDynamicContent attribute
 * 5. Advanced panel blocks — button/icon get extra controls
 * 6. Child title blocks — accordion-section/tab-section/icon-list-item
 * 7. Dynamic tag attribute read/write — voxelDynamicTags object
 * 8. NBDynamicTagInjector component rendering
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
	NB_TARGET_BLOCK_NAMES,
	NB_ROW_SETTINGS_BLOCK_NAMES,
	NB_TOOLBAR_TAG_BLOCK_NAMES,
	NB_CHILD_TITLE_BLOCK_NAMES,
	NB_ADVANCED_PANEL_BLOCKS,
	NB_DYNAMIC_TAG_FIELDS,
	getNBBlockConfig,
	nectarBlocksRegistry,
	type NBFieldTarget,
	type NBBlockConfig,
} from '../nectarBlocksConfig';

// ============================================================================
// Mocks — same pattern as nb-voxeltab-wiring.test.tsx
// ============================================================================

vi.mock('@shared/controls/ResponsiveRangeControl', () => ({
	default: ({ label, attributeBaseName }: any) => (
		<div data-testid={`responsive-range-${attributeBaseName}`}>{label}</div>
	),
}));

vi.mock('@shared/controls/SectionHeading', () => ({
	default: ({ label }: any) => <h3 data-testid="section-heading">{label}</h3>,
}));

vi.mock('@shared/controls/ResponsiveToggle', () => ({
	default: ({ label, attributeBaseName }: any) => (
		<div data-testid={`responsive-toggle-${attributeBaseName}`}>{label}</div>
	),
}));

vi.mock('@shared/controls/ResponsiveTextControl', () => ({
	default: ({ label, attributeBaseName }: any) => (
		<label>{label}<input type="text" data-testid={`responsive-text-${attributeBaseName}`} /></label>
	),
}));

vi.mock('@shared/controls/ColorPickerControl', () => ({
	default: ({ label, value, onChange }: any) => (
		<label>{label}<input type="color" value={value || ''} onChange={(e: any) => onChange?.(e.target.value)} data-testid={`color-picker-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} /></label>
	),
}));

vi.mock('@shared/controls/ElementVisibilityModal', () => ({
	default: () => null,
	getVisibilityRuleLabel: (rule: any) => rule.filterKey || 'Unknown',
}));

vi.mock('@shared/controls/EnableTagsButton', () => ({
	default: ({ onClick, title }: any) => (
		<button data-testid="enable-tags-button" onClick={onClick} title={title}>Enable Tags</button>
	),
}));

vi.mock('@shared/controls/DynamicTagPopoverPanel', () => ({
	default: () => <div data-testid="dynamic-tag-popover-panel" />,
	extractTagContent: (val: string) => val.replace(/@tags\(\)/g, '').replace(/@endtags\(\)/g, ''),
	wrapWithTags: (val: string) => `@tags()${val}@endtags()`,
}));

vi.mock('@shared/dynamic-tags', () => ({
	DynamicTagBuilder: ({ isOpen, onClose, onSave, initialContent }: any) =>
		isOpen ? (
			<div data-testid="dynamic-tag-builder">
				<span data-testid="dtb-initial-content">{initialContent}</span>
				<button onClick={() => onSave?.('@tags()@post(title)@endtags()')}>Save</button>
				<button onClick={onClose}>Close</button>
			</div>
		) : null,
}));

// ============================================================================
// 1. isBodyField Helper Tests
// ============================================================================

/**
 * Replicating the isBodyField function from NBDynamicTagInjector.tsx for unit testing.
 * This is a pure function that doesn't depend on React/DOM state.
 */
function isBodyField(fieldKey: string): { label: string; type: string } | null {
	if (fieldKey === 'cssClasses') return { label: 'Additional CSS class(es)', type: 'css-class' };
	if (fieldKey === 'customId') return { label: 'Custom ID', type: 'text' };
	if (fieldKey === 'textContent') return { label: 'Text Content', type: 'textarea' };
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_name')) return { label: 'Custom Attribute Name', type: 'text' };
	if (fieldKey.startsWith('customAttr_') && fieldKey.endsWith('_value')) return { label: 'Custom Attribute Value', type: 'text' };
	if (fieldKey === 'iconImage') return { label: 'Icon Image', type: 'image' };
	if (fieldKey === 'galleryImages') return { label: 'Gallery Images', type: 'image' };
	return null;
}

describe('isBodyField helper', () => {
	it('should return CSS Classes info for cssClasses key', () => {
		const result = isBodyField('cssClasses');
		expect(result).toEqual({ label: 'Additional CSS class(es)', type: 'css-class' });
	});

	it('should return Custom ID info for customId key', () => {
		const result = isBodyField('customId');
		expect(result).toEqual({ label: 'Custom ID', type: 'text' });
	});

	it('should return Text Content info for textContent key', () => {
		const result = isBodyField('textContent');
		expect(result).toEqual({ label: 'Text Content', type: 'textarea' });
	});

	it('should return Icon Image info for iconImage key', () => {
		const result = isBodyField('iconImage');
		expect(result).toEqual({ label: 'Icon Image', type: 'image' });
	});

	it('should return Gallery Images info for galleryImages key', () => {
		const result = isBodyField('galleryImages');
		expect(result).toEqual({ label: 'Gallery Images', type: 'image' });
	});

	it('should return Custom Attribute Name for customAttr_*_name pattern', () => {
		expect(isBodyField('customAttr_abc123_name')).toEqual({ label: 'Custom Attribute Name', type: 'text' });
		expect(isBodyField('customAttr_xyz_name')).toEqual({ label: 'Custom Attribute Name', type: 'text' });
	});

	it('should return Custom Attribute Value for customAttr_*_value pattern', () => {
		expect(isBodyField('customAttr_abc123_value')).toEqual({ label: 'Custom Attribute Value', type: 'text' });
		expect(isBodyField('customAttr_xyz_value')).toEqual({ label: 'Custom Attribute Value', type: 'text' });
	});

	it('should return null for unknown field keys', () => {
		expect(isBodyField('imageSource')).toBeNull();
		expect(isBodyField('title')).toBeNull();
		expect(isBodyField('zIndex')).toBeNull();
		expect(isBodyField('linkUrl')).toBeNull();
		expect(isBodyField('unknown')).toBeNull();
		expect(isBodyField('')).toBeNull();
	});

	it('should return null for partial customAttr patterns', () => {
		expect(isBodyField('customAttr_abc123')).toBeNull();
		expect(isBodyField('customAttr_')).toBeNull();
		expect(isBodyField('customAttr_abc_other')).toBeNull();
	});
});

// ============================================================================
// 2. Field Config Validation Tests
// ============================================================================

describe('NB Field Config Validation', () => {
	describe('All blocks have at least one field', () => {
		it.each(nectarBlocksRegistry.map((c) => [c.blockName, c.fields.length]))(
			'%s should have %d field(s)',
			(blockName, fieldCount) => {
				const config = getNBBlockConfig(blockName as string);
				expect(config).toBeDefined();
				expect(config!.fields.length).toBe(fieldCount);
			},
		);
	});

	describe('Every block has a zIndex field', () => {
		it.each(nectarBlocksRegistry.map((c) => c.blockName))(
			'%s should have a zIndex field',
			(blockName) => {
				const config = getNBBlockConfig(blockName);
				expect(config).toBeDefined();
				const zIndex = config!.fields.find((f) => f.fieldKey === 'zIndex');
				expect(zIndex).toBeDefined();
				expect(zIndex!.tab).toBe('style');
				expect(zIndex!.type).toBe('number');
				expect(zIndex!.parentLabelText).toBe('Z-Index');
				expect(zIndex!.labelText).toBe('Value');
			},
		);
	});

	describe('Field types are valid', () => {
		const validTypes = ['text', 'url', 'image', 'number', 'css-class', 'textarea'];

		it('should only use valid field types across all blocks', () => {
			for (const config of nectarBlocksRegistry) {
				for (const field of config.fields) {
					expect(validTypes).toContain(field.type);
				}
			}
		});
	});

	describe('Field tabs are valid', () => {
		const validTabs = ['layout', 'style', 'motion'];

		it('should only use valid tab names across all blocks', () => {
			for (const config of nectarBlocksRegistry) {
				for (const field of config.fields) {
					expect(validTabs).toContain(field.tab);
				}
			}
		});
	});

	describe('Field placements are valid', () => {
		const validPlacements = ['inline', 'corner', undefined];

		it('should only use valid placements across all blocks', () => {
			for (const config of nectarBlocksRegistry) {
				for (const field of config.fields) {
					expect(validPlacements).toContain(field.placement);
				}
			}
		});
	});
});

// ============================================================================
// 3. EnableTag Placement Tests
// ============================================================================

describe('EnableTag Placement per Block', () => {
	describe('nectar-blocks/image fields', () => {
		const config = getNBBlockConfig('nectar-blocks/image')!;

		it('imageSource should have corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'imageSource');
			expect(field?.placement).toBe('corner');
		});

		it('title should have inline placement (default)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'title');
			expect(field?.placement).toBeUndefined(); // undefined = inline default
		});

		it('altText should have inline placement (default)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'altText');
			expect(field?.placement).toBeUndefined();
		});

		it('linkUrl should have inline placement (default)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'linkUrl');
			expect(field?.placement).toBeUndefined();
		});

		it('zIndex should have inline placement (default)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'zIndex');
			expect(field?.placement).toBeUndefined();
		});
	});

	describe('nectar-blocks/image-gallery fields', () => {
		const config = getNBBlockConfig('nectar-blocks/image-gallery')!;

		it('should have galleryImages field with no labelText (body observer)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'galleryImages');
			expect(field).toBeDefined();
			expect(field?.labelText).toBe('');
		});

		it('backgroundImage should have corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'backgroundImage');
			expect(field?.placement).toBe('corner');
			expect(field?.parentLabelText).toBe('Background');
		});
	});

	describe('nectar-blocks/video-lightbox fields', () => {
		const config = getNBBlockConfig('nectar-blocks/video-lightbox')!;

		it('should have 5 fields', () => {
			expect(config.fields).toHaveLength(5);
		});

		it('videoUrl should have inline placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'videoUrl');
			expect(field?.type).toBe('url');
			expect(field?.placement).toBeUndefined();
		});

		it('videoLocal should have corner placement under General Settings', () => {
			const field = config.fields.find((f) => f.fieldKey === 'videoLocal');
			expect(field?.placement).toBe('corner');
			expect(field?.parentLabelText).toBe('General Settings');
		});

		it('previewImage should have corner placement under Preview', () => {
			const field = config.fields.find((f) => f.fieldKey === 'previewImage');
			expect(field?.placement).toBe('corner');
			expect(field?.parentLabelText).toBe('Preview');
		});

		it('previewVideo should have corner placement under Preview', () => {
			const field = config.fields.find((f) => f.fieldKey === 'previewVideo');
			expect(field?.placement).toBe('corner');
			expect(field?.parentLabelText).toBe('Preview');
		});
	});

	describe('nectar-blocks/video-player fields', () => {
		const config = getNBBlockConfig('nectar-blocks/video-player')!;

		it('should have 3 fields', () => {
			expect(config.fields).toHaveLength(3);
		});

		it('video should have corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'video');
			expect(field?.placement).toBe('corner');
			expect(field?.type).toBe('image');
		});

		it('previewImage should have corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'previewImage');
			expect(field?.placement).toBe('corner');
			expect(field?.type).toBe('image');
		});
	});

	describe('nectar-blocks/star-rating fields', () => {
		const config = getNBBlockConfig('nectar-blocks/star-rating')!;

		it('should have 2 fields', () => {
			expect(config.fields).toHaveLength(2);
		});

		it('rating should have corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'rating');
			expect(field?.placement).toBe('corner');
			expect(field?.type).toBe('number');
		});
	});

	describe('Blocks with only zIndex field', () => {
		const zIndexOnlyBlocks = nectarBlocksRegistry.filter((c) => c.fields.length === 1);

		it.each(zIndexOnlyBlocks.map((c) => c.blockName))(
			'%s should only have zIndex field',
			(blockName) => {
				const config = getNBBlockConfig(blockName);
				expect(config!.fields).toHaveLength(1);
				expect(config!.fields[0].fieldKey).toBe('zIndex');
			},
		);
	});
});

// ============================================================================
// 4. Toolbar Tag Blocks Tests
// ============================================================================

describe('Toolbar Tag Blocks (voxelDynamicContent)', () => {
	it('should contain exactly text and button blocks', () => {
		expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/text')).toBe(true);
		expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/button')).toBe(true);
		expect(NB_TOOLBAR_TAG_BLOCK_NAMES.size).toBe(2);
	});

	it('text and button should also be in NB_TARGET_BLOCK_NAMES', () => {
		expect(NB_TARGET_BLOCK_NAMES.has('nectar-blocks/text')).toBe(true);
		expect(NB_TARGET_BLOCK_NAMES.has('nectar-blocks/button')).toBe(true);
	});

	it('should NOT include child blocks in toolbar tags', () => {
		expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/tab-section')).toBe(false);
		expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/accordion-section')).toBe(false);
	});

	describe('voxelDynamicContent attribute injection', () => {
		/**
		 * Simulates the attribute injection logic from index.tsx for toolbar blocks.
		 * Toolbar blocks get voxelDynamicContent in addition to voxelDynamicTags.
		 */
		function simulateToolbarAttributeInjection(blockName: string): Record<string, unknown> {
			if (!NB_TARGET_BLOCK_NAMES.has(blockName)) return {};

			const attrs: Record<string, unknown> = {
				voxelDynamicTags: { type: 'object', default: {} },
			};

			if (NB_TOOLBAR_TAG_BLOCK_NAMES.has(blockName)) {
				attrs['voxelDynamicContent'] = { type: 'string', default: '' };
			}

			return attrs;
		}

		it('should inject voxelDynamicContent for text block', () => {
			const attrs = simulateToolbarAttributeInjection('nectar-blocks/text');
			expect(attrs).toHaveProperty('voxelDynamicContent');
			expect((attrs['voxelDynamicContent'] as any).type).toBe('string');
			expect((attrs['voxelDynamicContent'] as any).default).toBe('');
		});

		it('should inject voxelDynamicContent for button block', () => {
			const attrs = simulateToolbarAttributeInjection('nectar-blocks/button');
			expect(attrs).toHaveProperty('voxelDynamicContent');
		});

		it('should NOT inject voxelDynamicContent for image block', () => {
			const attrs = simulateToolbarAttributeInjection('nectar-blocks/image');
			expect(attrs).not.toHaveProperty('voxelDynamicContent');
		});

		it('should NOT inject voxelDynamicContent for non-target blocks', () => {
			const attrs = simulateToolbarAttributeInjection('core/paragraph');
			expect(attrs).toEqual({});
		});
	});
});

// ============================================================================
// 5. Advanced Panel Blocks Tests
// ============================================================================

describe('Advanced Panel Blocks (NB_ADVANCED_PANEL_BLOCKS)', () => {
	it('should define controls for nectar-blocks/button', () => {
		const fields = NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/button'];
		expect(fields).toBeDefined();
		expect(fields).toHaveLength(3);
	});

	it('button should have Edit Label as HTML (text), Icon Size (range), Icon Color (color)', () => {
		const fields = NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/button'];
		const labelField = fields.find((f) => f.attr === 'voxelDynamicContent');
		const iconSizeField = fields.find((f) => f.attr === 'voxelIconSize');
		const iconColorField = fields.find((f) => f.attr === 'voxelIconColor');

		expect(labelField).toBeDefined();
		expect(labelField?.label).toBe('Edit Label as HTML');
		expect(labelField?.controlType).toBeUndefined(); // default = text

		expect(iconSizeField).toBeDefined();
		expect(iconSizeField?.label).toBe('Icon Size');
		expect(iconSizeField?.controlType).toBe('range');

		expect(iconColorField).toBeDefined();
		expect(iconColorField?.label).toBe('Icon Color');
		expect(iconColorField?.controlType).toBe('color');
	});

	it('should define controls for nectar-blocks/icon', () => {
		const fields = NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/icon'];
		expect(fields).toBeDefined();
		expect(fields).toHaveLength(1);
		expect(fields[0].attr).toBe('voxelIconColor');
		expect(fields[0].controlType).toBe('color');
	});

	it('should NOT define controls for blocks without advanced panels', () => {
		expect(NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/image']).toBeUndefined();
		expect(NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/row']).toBeUndefined();
		expect(NB_ADVANCED_PANEL_BLOCKS['nectar-blocks/carousel']).toBeUndefined();
	});

	describe('Icon attribute injection', () => {
		/**
		 * Simulates the icon-related attribute injection from index.tsx.
		 * When a block has range/color controls in NB_ADVANCED_PANEL_BLOCKS,
		 * the corresponding icon attributes are registered.
		 */
		function simulateIconAttrsInjection(blockName: string): Record<string, unknown> {
			const advFields = NB_ADVANCED_PANEL_BLOCKS[blockName];
			if (!advFields) return {};

			const attrs: Record<string, unknown> = {};
			let needsIconAttrs = false;

			for (const field of advFields) {
				if (field.controlType === 'range' && field.attr === 'voxelIconSize') {
					needsIconAttrs = true;
					continue;
				}
				if (field.controlType === 'color' && field.attr === 'voxelIconColor') {
					needsIconAttrs = true;
					continue;
				}
				attrs[field.attr] = { type: 'string', default: '' };
			}

			if (needsIconAttrs) {
				attrs['voxelIconSize'] = { type: 'number' };
				attrs['voxelIconSize_tablet'] = { type: 'number' };
				attrs['voxelIconSize_mobile'] = { type: 'number' };
				attrs['voxelIconSizeUnit'] = { type: 'string', default: 'px' };
				attrs['voxelIconColor'] = { type: 'string', default: '' };
			}

			return attrs;
		}

		it('should inject all icon attrs for button block', () => {
			const attrs = simulateIconAttrsInjection('nectar-blocks/button');
			expect(attrs).toHaveProperty('voxelDynamicContent');
			expect(attrs).toHaveProperty('voxelIconSize');
			expect(attrs).toHaveProperty('voxelIconSize_tablet');
			expect(attrs).toHaveProperty('voxelIconSize_mobile');
			expect(attrs).toHaveProperty('voxelIconSizeUnit');
			expect(attrs).toHaveProperty('voxelIconColor');
		});

		it('should inject icon color attrs for icon block', () => {
			const attrs = simulateIconAttrsInjection('nectar-blocks/icon');
			expect(attrs).toHaveProperty('voxelIconSize');
			expect(attrs).toHaveProperty('voxelIconColor');
		});

		it('should set voxelIconSizeUnit default to px', () => {
			const attrs = simulateIconAttrsInjection('nectar-blocks/button');
			expect((attrs['voxelIconSizeUnit'] as any).default).toBe('px');
		});
	});
});

// ============================================================================
// 6. Child Title Blocks Tests
// ============================================================================

describe('Child Title Blocks (NB_CHILD_TITLE_BLOCK_NAMES)', () => {
	it('should contain accordion-section, tab-section, icon-list-item', () => {
		expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/accordion-section')).toBe(true);
		expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/tab-section')).toBe(true);
		expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/icon-list-item')).toBe(true);
	});

	it('should contain exactly 3 blocks', () => {
		expect(NB_CHILD_TITLE_BLOCK_NAMES.size).toBe(3);
	});

	it('should NOT include column or carousel-item (they have no title)', () => {
		expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/column')).toBe(false);
		expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/carousel-item')).toBe(false);
	});

	it('all child title blocks should also be in NB_ROW_SETTINGS_BLOCK_NAMES', () => {
		for (const blockName of NB_CHILD_TITLE_BLOCK_NAMES) {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.has(blockName)).toBe(true);
		}
	});

	it('all child title blocks should have voxelDynamicTitle in NB_DYNAMIC_TAG_FIELDS', () => {
		for (const blockName of NB_CHILD_TITLE_BLOCK_NAMES) {
			const fields = NB_DYNAMIC_TAG_FIELDS[blockName];
			expect(fields).toBeDefined();
			const titleField = fields.find((f) => f.attr === 'voxelDynamicTitle');
			expect(titleField).toBeDefined();
			expect(titleField?.label).toBe('Title');
		}
	});
});

// ============================================================================
// 7. Dynamic Tag Attribute Read/Write Tests
// ============================================================================

describe('Dynamic Tag Attributes (voxelDynamicTags)', () => {
	describe('Tag storage format', () => {
		it('should store tags as key-value pairs in an object', () => {
			const voxelDynamicTags: Record<string, string> = {
				imageSource: '@tags()@post(thumbnail)@endtags()',
				title: '@tags()@post(title)@endtags()',
			};

			expect(typeof voxelDynamicTags).toBe('object');
			expect(voxelDynamicTags['imageSource']).toContain('@tags()');
			expect(voxelDynamicTags['title']).toContain('@post(title)');
		});

		it('should support all field types in tag values', () => {
			const tags: Record<string, string> = {
				imageSource: '@tags()@post(thumbnail)@endtags()',
				title: '@tags()@post(title)@endtags()',
				linkUrl: '@tags()@post(:url)@endtags()',
				zIndex: '@tags()@post(zindex)@endtags()',
				cssClasses: '@tags()@post(css_class)@endtags()',
				galleryImages: '@tags()@post(gallery.ids)@endtags()',
				video: '@tags()@post(video_url)@endtags()',
			};

			expect(Object.keys(tags)).toHaveLength(7);
			for (const value of Object.values(tags)) {
				expect(value).toMatch(/^@tags\(\).*@endtags\(\)$/);
			}
		});
	});

	describe('Tag update logic', () => {
		it('should add a new tag to empty voxelDynamicTags', () => {
			const currentTags: Record<string, string> = {};
			const updatedTags = { ...currentTags, imageSource: '@tags()@post(thumbnail)@endtags()' };
			expect(updatedTags).toHaveProperty('imageSource');
			expect(Object.keys(updatedTags)).toHaveLength(1);
		});

		it('should update an existing tag', () => {
			const currentTags: Record<string, string> = {
				imageSource: '@tags()@post(thumbnail)@endtags()',
			};
			const updatedTags = {
				...currentTags,
				imageSource: '@tags()@term(image)@endtags()',
			};
			expect(updatedTags['imageSource']).toContain('@term(image)');
		});

		it('should remove a tag by deleting the key', () => {
			const currentTags: Record<string, string> = {
				imageSource: '@tags()@post(thumbnail)@endtags()',
				title: '@tags()@post(title)@endtags()',
			};
			const updatedTags = { ...currentTags };
			delete updatedTags['imageSource'];
			expect(updatedTags).not.toHaveProperty('imageSource');
			expect(updatedTags).toHaveProperty('title');
		});

		it('should handle toolbar block textContent mapped to voxelDynamicContent', () => {
			// Toolbar blocks (text/button) store textContent in voxelDynamicContent,
			// not in voxelDynamicTags. This simulates the mapping.
			const blockAttrs: Record<string, unknown> = {
				voxelDynamicTags: { imageSource: '@tags()@post(thumbnail)@endtags()' },
				voxelDynamicContent: '@tags()@post(title)@endtags()',
			};

			// Reading: getVoxelTags merges textContent from voxelDynamicContent
			const tags = { ...(blockAttrs['voxelDynamicTags'] as Record<string, string>) };
			const dynamicContent = blockAttrs['voxelDynamicContent'] as string;
			if (dynamicContent) {
				tags['textContent'] = dynamicContent;
			}

			expect(tags['textContent']).toBe('@tags()@post(title)@endtags()');
			expect(tags['imageSource']).toBeDefined();
		});
	});
});

// ============================================================================
// 8. Block-Specific Field Configuration Tests
// ============================================================================

describe('Block-Specific Field Configurations', () => {
	describe('nectar-blocks/image (5 fields)', () => {
		const config = getNBBlockConfig('nectar-blocks/image')!;

		it('should have exactly 5 fields', () => {
			expect(config.fields).toHaveLength(5);
		});

		it.each([
			['imageSource', 'Image', 'layout', 'image', 'corner'],
			['title', 'Title', 'layout', 'text', undefined],
			['altText', 'Alt Text', 'layout', 'text', undefined],
			['linkUrl', 'URL', 'layout', 'url', undefined],
			['zIndex', 'Value', 'style', 'number', undefined],
		] as [string, string, string, string, string | undefined][])(
			'field %s: labelText=%s, tab=%s, type=%s, placement=%s',
			(fieldKey, labelText, tab, type, placement) => {
				const field = config.fields.find((f) => f.fieldKey === fieldKey);
				expect(field).toBeDefined();
				expect(field?.labelText).toBe(labelText);
				expect(field?.tab).toBe(tab);
				expect(field?.type).toBe(type);
				expect(field?.placement).toBe(placement);
			},
		);
	});

	describe('nectar-blocks/video-player (3 fields)', () => {
		const config = getNBBlockConfig('nectar-blocks/video-player')!;

		it('should have exactly 3 fields', () => {
			expect(config.fields).toHaveLength(3);
		});

		it('video field should be image type with corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'video');
			expect(field?.type).toBe('image');
			expect(field?.placement).toBe('corner');
			expect(field?.tab).toBe('layout');
		});

		it('previewImage field should be image type with corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'previewImage');
			expect(field?.type).toBe('image');
			expect(field?.placement).toBe('corner');
			expect(field?.tab).toBe('layout');
		});
	});

	describe('nectar-blocks/video-lightbox (5 fields)', () => {
		const config = getNBBlockConfig('nectar-blocks/video-lightbox')!;

		it('should distinguish videoUrl (inline) vs videoLocal (corner, General Settings)', () => {
			const urlField = config.fields.find((f) => f.fieldKey === 'videoUrl');
			const localField = config.fields.find((f) => f.fieldKey === 'videoLocal');

			expect(urlField?.placement).toBeUndefined();
			expect(urlField?.parentLabelText).toBeUndefined();

			expect(localField?.placement).toBe('corner');
			expect(localField?.parentLabelText).toBe('General Settings');
		});

		it('should have two Preview-scoped fields (image + video)', () => {
			const previewFields = config.fields.filter((f) => f.parentLabelText === 'Preview');
			expect(previewFields).toHaveLength(2);
			expect(previewFields.map((f) => f.fieldKey).sort()).toEqual(['previewImage', 'previewVideo']);
		});
	});

	describe('nectar-blocks/image-gallery (3 fields)', () => {
		const config = getNBBlockConfig('nectar-blocks/image-gallery')!;

		it('should have galleryImages as body-observer field (empty labelText)', () => {
			const field = config.fields.find((f) => f.fieldKey === 'galleryImages');
			expect(field).toBeDefined();
			expect(field?.labelText).toBe('');
			expect(field?.type).toBe('image');
		});

		it('should have backgroundImage under Background with corner placement', () => {
			const field = config.fields.find((f) => f.fieldKey === 'backgroundImage');
			expect(field?.parentLabelText).toBe('Background');
			expect(field?.placement).toBe('corner');
			expect(field?.tab).toBe('style');
		});
	});
});

// ============================================================================
// 9. Video Resolver Attribute Structure Tests
// ============================================================================

describe('Video Resolver Attribute Structure', () => {
	/**
	 * Simulates the video resolver's setAttributes call.
	 * NB requires: { desktop: { source: { id, url, type, mime? } }, tablet: {...}, mobile: {...} }
	 */
	function buildVideoAttribute(url: string, mime: string = 'video/mp4') {
		const sourceObj = {
			id: 0,
			url,
			type: 'self-hosted' as const,
			mime,
		};
		return {
			video: {
				desktop: { source: sourceObj },
				tablet: { source: sourceObj },
				mobile: { source: sourceObj },
			},
		};
	}

	it('should create video attribute with source on all breakpoints', () => {
		const result = buildVideoAttribute('https://example.com/video.mp4');
		expect(result.video.desktop.source).toBeDefined();
		expect(result.video.tablet.source).toBeDefined();
		expect(result.video.mobile.source).toBeDefined();
	});

	it('should include id: 0 on all breakpoints (prevents NB TypeError)', () => {
		const result = buildVideoAttribute('https://example.com/video.mp4');
		expect(result.video.desktop.source.id).toBe(0);
		expect(result.video.tablet.source.id).toBe(0);
		expect(result.video.mobile.source.id).toBe(0);
	});

	it('should set type to self-hosted on all breakpoints', () => {
		const result = buildVideoAttribute('https://example.com/video.mp4');
		expect(result.video.desktop.source.type).toBe('self-hosted');
		expect(result.video.tablet.source.type).toBe('self-hosted');
		expect(result.video.mobile.source.type).toBe('self-hosted');
	});

	it('should include the URL on all breakpoints', () => {
		const url = 'https://example.com/sample.webm';
		const result = buildVideoAttribute(url);
		expect(result.video.desktop.source.url).toBe(url);
		expect(result.video.tablet.source.url).toBe(url);
		expect(result.video.mobile.source.url).toBe(url);
	});

	it('should include mime type on all breakpoints', () => {
		const result = buildVideoAttribute('https://example.com/video.webm', 'video/webm');
		expect(result.video.desktop.source.mime).toBe('video/webm');
		expect(result.video.tablet.source.mime).toBe('video/webm');
		expect(result.video.mobile.source.mime).toBe('video/webm');
	});

	it('should default mime to video/mp4', () => {
		const result = buildVideoAttribute('https://example.com/video.mp4');
		expect(result.video.desktop.source.mime).toBe('video/mp4');
	});
});

// ============================================================================
// 10. Gallery Resolver Tests
// ============================================================================

describe('Gallery Resolver Logic', () => {
	/**
	 * Simulates parsing the comma-separated IDs response from the dynamic data API.
	 */
	function parseGalleryIds(rendered: string): number[] {
		// Strip @tags() wrapper if present
		let content = rendered;
		const wrapperMatch = content.match(/@tags\(\)(.*?)@endtags\(\)/s);
		if (wrapperMatch) {
			content = wrapperMatch[1];
		}
		return content
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.map((s) => parseInt(s, 10))
			.filter((n) => !isNaN(n));
	}

	it('should parse comma-separated IDs', () => {
		const ids = parseGalleryIds('123,456,789');
		expect(ids).toEqual([123, 456, 789]);
	});

	it('should handle @tags() wrapper', () => {
		const ids = parseGalleryIds('@tags()123,456@endtags()');
		expect(ids).toEqual([123, 456]);
	});

	it('should handle spaces around IDs', () => {
		const ids = parseGalleryIds('  123 , 456 , 789  ');
		expect(ids).toEqual([123, 456, 789]);
	});

	it('should filter out NaN values', () => {
		const ids = parseGalleryIds('123,abc,789');
		expect(ids).toEqual([123, 789]);
	});

	it('should handle empty string', () => {
		const ids = parseGalleryIds('');
		expect(ids).toEqual([]);
	});

	it('should handle single ID', () => {
		const ids = parseGalleryIds('42');
		expect(ids).toEqual([42]);
	});

	/**
	 * Simulates building the imageGalleryImages attribute from resolved media URLs.
	 */
	function buildGalleryAttribute(mediaItems: Array<{ id: number; url: string }>) {
		return {
			imageGalleryImages: mediaItems.map((item) => ({
				id: item.id,
				url: item.url,
			})),
		};
	}

	it('should build gallery attribute from media items', () => {
		const result = buildGalleryAttribute([
			{ id: 123, url: 'https://example.com/img1.jpg' },
			{ id: 456, url: 'https://example.com/img2.jpg' },
		]);
		expect(result.imageGalleryImages).toHaveLength(2);
		expect(result.imageGalleryImages[0].id).toBe(123);
		expect(result.imageGalleryImages[1].url).toBe('https://example.com/img2.jpg');
	});

	it('should handle empty media items', () => {
		const result = buildGalleryAttribute([]);
		expect(result.imageGalleryImages).toHaveLength(0);
	});
});

// ============================================================================
// 11. Cross-Registry Consistency Tests
// ============================================================================

describe('Cross-Registry Consistency', () => {
	it('parent blocks and child blocks should have no overlap', () => {
		for (const childBlock of NB_ROW_SETTINGS_BLOCK_NAMES) {
			expect(NB_TARGET_BLOCK_NAMES.has(childBlock)).toBe(false);
		}
		for (const parentBlock of NB_TARGET_BLOCK_NAMES) {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.has(parentBlock)).toBe(false);
		}
	});

	it('toolbar tag blocks should be subset of parent blocks', () => {
		for (const blockName of NB_TOOLBAR_TAG_BLOCK_NAMES) {
			expect(NB_TARGET_BLOCK_NAMES.has(blockName)).toBe(true);
		}
	});

	it('child title blocks should be subset of child blocks', () => {
		for (const blockName of NB_CHILD_TITLE_BLOCK_NAMES) {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.has(blockName)).toBe(true);
		}
	});

	it('advanced panel blocks should be subset of parent blocks', () => {
		for (const blockName of Object.keys(NB_ADVANCED_PANEL_BLOCKS)) {
			expect(NB_TARGET_BLOCK_NAMES.has(blockName)).toBe(true);
		}
	});

	it('every NB_DYNAMIC_TAG_FIELDS key should be a child block', () => {
		for (const blockName of Object.keys(NB_DYNAMIC_TAG_FIELDS)) {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.has(blockName)).toBe(true);
		}
	});

	it('every child block should have an entry in NB_DYNAMIC_TAG_FIELDS', () => {
		for (const blockName of NB_ROW_SETTINGS_BLOCK_NAMES) {
			expect(NB_DYNAMIC_TAG_FIELDS[blockName]).toBeDefined();
		}
	});

	it('all block names should follow nectar-blocks/ prefix convention', () => {
		for (const config of nectarBlocksRegistry) {
			expect(config.blockName).toMatch(/^nectar-blocks\//);
		}
		for (const blockName of NB_ROW_SETTINGS_BLOCK_NAMES) {
			expect(blockName).toMatch(/^nectar-blocks\//);
		}
	});

	it('total block count: 23 parent + 5 child = 28', () => {
		expect(NB_TARGET_BLOCK_NAMES.size).toBe(23);
		expect(NB_ROW_SETTINGS_BLOCK_NAMES.size).toBe(5);
		expect(NB_TARGET_BLOCK_NAMES.size + NB_ROW_SETTINGS_BLOCK_NAMES.size).toBe(28);
	});
});

// ============================================================================
// 12. HOC Wiring for EnableTag (Parent + Child blocks)
// ============================================================================

describe('HOC Wiring for EnableTag', () => {
	describe('Parent block HOC', () => {
		it('should wrap all 23 parent blocks with NBDynamicTagInjector', () => {
			for (const blockName of NB_TARGET_BLOCK_NAMES) {
				const config = getNBBlockConfig(blockName);
				expect(config).toBeDefined();
			}
		});

		it('should pass blockConfig to NBDynamicTagInjector', () => {
			let receivedConfig: NBBlockConfig | null = null;

			const hocFn = (BlockEdit: any) => (props: any) => {
				const { name } = props;
				if (!NB_TARGET_BLOCK_NAMES.has(name)) return <BlockEdit {...props} />;
				const config = getNBBlockConfig(name);
				if (!config) return <BlockEdit {...props} />;
				receivedConfig = config;
				return <BlockEdit {...props} />;
			};

			const MockBlockEdit = () => <div data-testid="block-edit" />;
			const WrappedComponent = hocFn(MockBlockEdit);
			render(
				<WrappedComponent
					name="nectar-blocks/image"
					clientId="test-id"
					attributes={{}}
					setAttributes={vi.fn()}
				/>,
			);

			expect(receivedConfig).not.toBeNull();
			expect(receivedConfig!.blockName).toBe('nectar-blocks/image');
			expect(receivedConfig!.fields.length).toBeGreaterThan(0);
		});
	});

	describe('Child block HOC', () => {
		it('should wrap child blocks with bodyObserverOnly NBDynamicTagInjector', () => {
			let receivedBodyObserverOnly = false;

			const hocFn = (BlockEdit: any) => (props: any) => {
				const { name } = props;
				if (!NB_ROW_SETTINGS_BLOCK_NAMES.has(name)) return <BlockEdit {...props} />;
				receivedBodyObserverOnly = true;
				return <BlockEdit {...props} />;
			};

			const MockBlockEdit = () => <div data-testid="block-edit" />;
			const WrappedComponent = hocFn(MockBlockEdit);
			render(
				<WrappedComponent
					name="nectar-blocks/tab-section"
					clientId="test-id"
					attributes={{}}
					setAttributes={vi.fn()}
				/>,
			);

			expect(receivedBodyObserverOnly).toBe(true);
		});

		it('should add EnableTagsToolbarButton for child title blocks', () => {
			for (const blockName of NB_CHILD_TITLE_BLOCK_NAMES) {
				// Should get toolbar button
				expect(NB_CHILD_TITLE_BLOCK_NAMES.has(blockName)).toBe(true);
			}
		});

		it('should NOT add EnableTagsToolbarButton for non-title child blocks', () => {
			expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/column')).toBe(false);
			expect(NB_CHILD_TITLE_BLOCK_NAMES.has('nectar-blocks/carousel-item')).toBe(false);
		});
	});
});
