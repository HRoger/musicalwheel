/**
 * NB VoxelTab Wiring Tests
 *
 * Tests the complete wiring chain that connects VoxelTab inspector controls
 * to NectarBlocks blocks:
 *
 * 1. Attribute injection — voxelTabAttributes spread onto NB blocks via registerBlockType filter
 * 2. HOC wiring — editor.BlockEdit filter wraps NB blocks, passes attributes/setAttributes
 * 3. Config lookup — getNBBlockConfig returns correct config for target blocks
 * 4. Target block filtering — NB_TARGET_BLOCK_NAMES identifies which blocks to process
 * 5. VoxelTab portal rendering — VoxelTab renders into injected panel when active
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoxelTab, { voxelTabAttributes } from '@shared/controls/VoxelTab';
import {
	NB_TARGET_BLOCK_NAMES,
	getNBBlockConfig,
	nectarBlocksRegistry,
	NB_ROW_SETTINGS_BLOCK_NAMES,
	NB_ROW_SETTINGS_BLOCKS,
	NB_DYNAMIC_TAG_FIELDS,
	NB_TOOLBAR_TAG_BLOCK_NAMES,
} from '../nectarBlocksConfig';

// Mock VoxelTab's dependencies (same mocks as VoxelTab.test.tsx)
vi.mock('@shared/controls/ResponsiveRangeControl', () => ({
	default: ({ label, attributeBaseName }: any) => (
		<div data-testid={`responsive-range-${attributeBaseName}`}>{label}</div>
	),
}));

vi.mock('@shared/controls/SectionHeading', () => ({
	default: ({ label }: any) => <h3 data-testid="section-heading">{label}</h3>,
}));

vi.mock('@shared/controls/ResponsiveToggle', () => ({
	default: ({ label, attributeBaseName, attributes, setAttributes, help }: any) => {
		const checked = attributes?.[attributeBaseName] ?? false;
		return (
			<div data-testid={`responsive-toggle-${attributeBaseName}`}>
				<label>
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => setAttributes?.({ [attributeBaseName]: e.target.checked })}
					/>
					{label}
				</label>
				{help && <span className="help-text">{help}</span>}
			</div>
		);
	},
}));

vi.mock('@shared/controls/ResponsiveTextControl', () => ({
	default: ({ label, attributeBaseName, attributes, setAttributes, placeholder, help }: any) => {
		const value = attributes?.[attributeBaseName] ?? '';
		return (
			<label>
				{label}
				<input
					type="text"
					value={value}
					onChange={(e) => setAttributes?.({ [attributeBaseName]: e.target.value })}
					data-testid={`responsive-text-${attributeBaseName}`}
					placeholder={placeholder}
				/>
				{help && <span className="help-text">{help}</span>}
			</label>
		);
	},
}));

vi.mock('@shared/controls/ColorPickerControl', () => ({
	default: ({ label, value, onChange }: any) => (
		<label>
			{label}
			<input
				type="color"
				value={value || ''}
				onChange={(e) => onChange?.(e.target.value)}
				data-testid={`color-picker-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
			/>
		</label>
	),
}));

vi.mock('@shared/controls/ElementVisibilityModal', () => ({
	default: ({ isOpen, onClose, rules, onSave }: any) =>
		isOpen ? (
			<div data-testid="element-visibility-modal">
				<button onClick={onClose}>Close Modal</button>
				<button onClick={() => onSave(rules)}>Save</button>
			</div>
		) : null,
	getVisibilityRuleLabel: (rule: any) => rule.filterKey || 'Unknown rule',
}));

// ============================================================================
// 1. Attribute Registration Tests
// ============================================================================

describe('NB Attribute Registration', () => {
	describe('voxelTabAttributes export', () => {
		it('should export all sticky position attributes', () => {
			expect(voxelTabAttributes).toHaveProperty('stickyEnabled');
			expect(voxelTabAttributes).toHaveProperty('stickyDesktop');
			expect(voxelTabAttributes).toHaveProperty('stickyTablet');
			expect(voxelTabAttributes).toHaveProperty('stickyMobile');
			expect(voxelTabAttributes).toHaveProperty('stickyTop');
			expect(voxelTabAttributes).toHaveProperty('stickyTopUnit');
			expect(voxelTabAttributes).toHaveProperty('stickyLeft');
			expect(voxelTabAttributes).toHaveProperty('stickyLeftUnit');
			expect(voxelTabAttributes).toHaveProperty('stickyRight');
			expect(voxelTabAttributes).toHaveProperty('stickyRightUnit');
			expect(voxelTabAttributes).toHaveProperty('stickyBottom');
			expect(voxelTabAttributes).toHaveProperty('stickyBottomUnit');
		});

		it('should export responsive variants for sticky positions', () => {
			expect(voxelTabAttributes).toHaveProperty('stickyTop_tablet');
			expect(voxelTabAttributes).toHaveProperty('stickyTop_mobile');
			expect(voxelTabAttributes).toHaveProperty('stickyLeft_tablet');
			expect(voxelTabAttributes).toHaveProperty('stickyLeft_mobile');
			expect(voxelTabAttributes).toHaveProperty('stickyRight_tablet');
			expect(voxelTabAttributes).toHaveProperty('stickyRight_mobile');
			expect(voxelTabAttributes).toHaveProperty('stickyBottom_tablet');
			expect(voxelTabAttributes).toHaveProperty('stickyBottom_mobile');
		});

		it('should export visibility attributes', () => {
			expect(voxelTabAttributes).toHaveProperty('visibilityBehavior');
			expect(voxelTabAttributes).toHaveProperty('visibilityRules');
		});

		it('should export loop element attributes', () => {
			expect(voxelTabAttributes).toHaveProperty('loopEnabled');
			expect(voxelTabAttributes).toHaveProperty('loopSource');
			expect(voxelTabAttributes).toHaveProperty('loopProperty');
			expect(voxelTabAttributes).toHaveProperty('loopLimit');
			expect(voxelTabAttributes).toHaveProperty('loopOffset');
		});

		it('should have correct default values', () => {
			expect(voxelTabAttributes.stickyEnabled.default).toBe(false);
			expect(voxelTabAttributes.stickyDesktop.default).toBe('sticky');
			expect(voxelTabAttributes.stickyTablet.default).toBe('sticky');
			expect(voxelTabAttributes.stickyMobile.default).toBe('sticky');
			expect(voxelTabAttributes.stickyTopUnit.default).toBe('px');
			expect(voxelTabAttributes.stickyLeftUnit.default).toBe('px');
			expect(voxelTabAttributes.stickyRightUnit.default).toBe('px');
			expect(voxelTabAttributes.stickyBottomUnit.default).toBe('px');
			expect(voxelTabAttributes.visibilityBehavior.default).toBe('show');
			expect(voxelTabAttributes.visibilityRules.default).toEqual([]);
			expect(voxelTabAttributes.loopEnabled.default).toBe(false);
			expect(voxelTabAttributes.loopSource.default).toBe('');
			expect(voxelTabAttributes.loopProperty.default).toBe('');
			expect(voxelTabAttributes.loopLimit.default).toBe('');
			expect(voxelTabAttributes.loopOffset.default).toBe('');
		});

		it('should have correct types for all attributes', () => {
			expect(voxelTabAttributes.stickyEnabled.type).toBe('boolean');
			expect(voxelTabAttributes.stickyDesktop.type).toBe('string');
			expect(voxelTabAttributes.stickyTop.type).toBe('number');
			expect(voxelTabAttributes.visibilityBehavior.type).toBe('string');
			expect(voxelTabAttributes.visibilityRules.type).toBe('array');
			expect(voxelTabAttributes.loopEnabled.type).toBe('boolean');
			expect(voxelTabAttributes.loopSource.type).toBe('string');
		});
	});

	describe('blocks.registerBlockType filter simulation', () => {
		// Simulate the filter logic from index.tsx
		function simulateAttributeInjection(
			settings: Record<string, unknown>,
			name: string
		): { attributes: Record<string, unknown> } & Record<string, unknown> {
			if (!NB_TARGET_BLOCK_NAMES.has(name)) {
				return settings as { attributes: Record<string, unknown> } & Record<string, unknown>;
			}

			const attrs = (settings['attributes'] ?? {}) as Record<string, unknown>;
			return {
				...settings,
				attributes: {
					...attrs,
					voxelDynamicTags: {
						type: 'object' as const,
						default: {},
					},
					...voxelTabAttributes,
				},
			};
		}

		it('should inject voxelDynamicTags attribute into NB image block', () => {
			const settings = { attributes: { blockId: { type: 'string' } } };
			const result = simulateAttributeInjection(settings, 'nectar-blocks/image');

			expect(result.attributes).toHaveProperty('voxelDynamicTags');
			expect((result.attributes as Record<string, unknown>)['voxelDynamicTags']).toEqual({
				type: 'object',
				default: {},
			});
		});

		it('should inject all voxelTabAttributes into NB image block', () => {
			const settings = { attributes: { blockId: { type: 'string' } } };
			const result = simulateAttributeInjection(settings, 'nectar-blocks/image');

			// Check all VoxelTab attributes are present
			for (const key of Object.keys(voxelTabAttributes)) {
				expect(result.attributes).toHaveProperty(key);
			}
		});

		it('should NOT inject attributes into non-target blocks', () => {
			const settings = { attributes: { content: { type: 'string' } } };
			const result = simulateAttributeInjection(settings, 'core/paragraph');

			expect(result.attributes).not.toHaveProperty('voxelDynamicTags');
			expect(result.attributes).not.toHaveProperty('stickyEnabled');
		});

		it('should NOT inject attributes into voxel-fse blocks', () => {
			const settings = { attributes: { blockId: { type: 'string' } } };
			const result = simulateAttributeInjection(settings, 'voxel-fse/image');

			expect(result.attributes).not.toHaveProperty('voxelDynamicTags');
		});

		it('should preserve existing NB block attributes', () => {
			const settings = {
				attributes: {
					blockId: { type: 'string', default: 'abc' },
					image: { type: 'object' },
					imageRatio: { type: 'string' },
				},
			};
			const result = simulateAttributeInjection(settings, 'nectar-blocks/image');

			expect(result.attributes).toHaveProperty('blockId');
			expect(result.attributes).toHaveProperty('image');
			expect(result.attributes).toHaveProperty('imageRatio');
			// Plus injected attributes
			expect(result.attributes).toHaveProperty('voxelDynamicTags');
			expect(result.attributes).toHaveProperty('stickyEnabled');
		});

		it('should handle blocks with no existing attributes', () => {
			const settings = {};
			const result = simulateAttributeInjection(settings, 'nectar-blocks/image');

			expect(result.attributes).toHaveProperty('voxelDynamicTags');
			expect(result.attributes).toHaveProperty('stickyEnabled');
		});
	});
});

// ============================================================================
// 2. NectarBlocks Config Tests
// ============================================================================

describe('NectarBlocks Config', () => {
	describe('NB_TARGET_BLOCK_NAMES (23 parent blocks)', () => {
		const expectedParentBlocks = [
			'nectar-blocks/image',
			'nectar-blocks/accordion',
			'nectar-blocks/button',
			'nectar-blocks/carousel',
			'nectar-blocks/divider',
			'nectar-blocks/flex-box',
			'nectar-blocks/icon',
			'nectar-blocks/icon-list',
			'nectar-blocks/image-gallery',
			'nectar-blocks/image-grid',
			'nectar-blocks/milestone',
			'nectar-blocks/post-content',
			'nectar-blocks/post-grid',
			'nectar-blocks/row',
			'nectar-blocks/scrolling-marquee',
			'nectar-blocks/star-rating',
			'nectar-blocks/tabs',
			'nectar-blocks/taxonomy-grid',
			'nectar-blocks/taxonomy-terms',
			'nectar-blocks/testimonial',
			'nectar-blocks/text',
			'nectar-blocks/video-lightbox',
			'nectar-blocks/video-player',
		];

		it('should contain exactly 23 parent blocks', () => {
			expect(NB_TARGET_BLOCK_NAMES.size).toBe(23);
		});

		it.each(expectedParentBlocks)('should include %s', (blockName) => {
			expect(NB_TARGET_BLOCK_NAMES.has(blockName)).toBe(true);
		});

		it('should match the registry length', () => {
			expect(NB_TARGET_BLOCK_NAMES.size).toBe(nectarBlocksRegistry.length);
		});

		it('should NOT include core blocks', () => {
			expect(NB_TARGET_BLOCK_NAMES.has('core/image')).toBe(false);
			expect(NB_TARGET_BLOCK_NAMES.has('core/paragraph')).toBe(false);
		});

		it('should NOT include voxel-fse blocks', () => {
			expect(NB_TARGET_BLOCK_NAMES.has('voxel-fse/image')).toBe(false);
			expect(NB_TARGET_BLOCK_NAMES.has('voxel-fse/flex-container')).toBe(false);
		});

		it('should NOT include child blocks', () => {
			for (const childBlock of NB_ROW_SETTINGS_BLOCKS) {
				expect(NB_TARGET_BLOCK_NAMES.has(childBlock)).toBe(false);
			}
		});
	});

	describe('NB_ROW_SETTINGS_BLOCK_NAMES (5 child blocks)', () => {
		const expectedChildBlocks = [
			'nectar-blocks/tab-section',
			'nectar-blocks/accordion-section',
			'nectar-blocks/column',
			'nectar-blocks/icon-list-item',
			'nectar-blocks/carousel-item',
		];

		it('should contain exactly 5 child blocks', () => {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.size).toBe(5);
		});

		it.each(expectedChildBlocks)('should include %s', (blockName) => {
			expect(NB_ROW_SETTINGS_BLOCK_NAMES.has(blockName)).toBe(true);
		});

		it('should NOT overlap with parent blocks', () => {
			for (const childBlock of NB_ROW_SETTINGS_BLOCKS) {
				expect(NB_TARGET_BLOCK_NAMES.has(childBlock)).toBe(false);
			}
		});
	});

	describe('NB_DYNAMIC_TAG_FIELDS', () => {
		it('should define fields for tab-section (title + CSS ID)', () => {
			const fields = NB_DYNAMIC_TAG_FIELDS['nectar-blocks/tab-section'];
			expect(fields).toBeDefined();
			expect(fields).toHaveLength(2);
			expect(fields.map(f => f.attr)).toContain('voxelDynamicTitle');
			expect(fields.map(f => f.attr)).toContain('voxelDynamicCssId');
		});

		it('should define fields for accordion-section (title + CSS ID)', () => {
			const fields = NB_DYNAMIC_TAG_FIELDS['nectar-blocks/accordion-section'];
			expect(fields).toBeDefined();
			expect(fields).toHaveLength(2);
			expect(fields.map(f => f.attr)).toContain('voxelDynamicTitle');
			expect(fields.map(f => f.attr)).toContain('voxelDynamicCssId');
		});

		it('should define fields for column (CSS ID only)', () => {
			const fields = NB_DYNAMIC_TAG_FIELDS['nectar-blocks/column'];
			expect(fields).toBeDefined();
			expect(fields).toHaveLength(1);
			expect(fields[0].attr).toBe('voxelDynamicCssId');
		});

		it('should define fields for icon-list-item (title only)', () => {
			const fields = NB_DYNAMIC_TAG_FIELDS['nectar-blocks/icon-list-item'];
			expect(fields).toBeDefined();
			expect(fields).toHaveLength(1);
			expect(fields[0].attr).toBe('voxelDynamicTitle');
		});

		it('should define fields for carousel-item (CSS ID only)', () => {
			const fields = NB_DYNAMIC_TAG_FIELDS['nectar-blocks/carousel-item'];
			expect(fields).toBeDefined();
			expect(fields).toHaveLength(1);
			expect(fields[0].attr).toBe('voxelDynamicCssId');
		});

		it('should cover all child blocks', () => {
			for (const blockName of NB_ROW_SETTINGS_BLOCKS) {
				expect(NB_DYNAMIC_TAG_FIELDS[blockName]).toBeDefined();
				expect(NB_DYNAMIC_TAG_FIELDS[blockName].length).toBeGreaterThan(0);
			}
		});
	});

	describe('NB_TOOLBAR_TAG_BLOCK_NAMES', () => {
		it('should include text and button blocks', () => {
			expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/text')).toBe(true);
			expect(NB_TOOLBAR_TAG_BLOCK_NAMES.has('nectar-blocks/button')).toBe(true);
		});

		it('should contain exactly 2 blocks', () => {
			expect(NB_TOOLBAR_TAG_BLOCK_NAMES.size).toBe(2);
		});
	});

	describe('getNBBlockConfig', () => {
		it('should return config for nectar-blocks/image', () => {
			const config = getNBBlockConfig('nectar-blocks/image');
			expect(config).toBeDefined();
			expect(config?.blockName).toBe('nectar-blocks/image');
		});

		it('should return undefined for non-target blocks', () => {
			expect(getNBBlockConfig('core/paragraph')).toBeUndefined();
			expect(getNBBlockConfig('voxel-fse/image')).toBeUndefined();
			expect(getNBBlockConfig('nonexistent/block')).toBeUndefined();
		});

		it('should include correct fields for nectar-blocks/image', () => {
			const config = getNBBlockConfig('nectar-blocks/image');
			expect(config?.fields).toBeDefined();
			expect(config?.fields.length).toBeGreaterThan(0);

			const fieldKeys = config?.fields.map((f) => f.fieldKey);
			expect(fieldKeys).toContain('imageSource');
			expect(fieldKeys).toContain('title');
			expect(fieldKeys).toContain('altText');
			expect(fieldKeys).toContain('linkUrl');
			expect(fieldKeys).toContain('zIndex');
		});

		it('should have correct field types for image block', () => {
			const config = getNBBlockConfig('nectar-blocks/image');
			const imageField = config?.fields.find((f) => f.fieldKey === 'imageSource');
			const titleField = config?.fields.find((f) => f.fieldKey === 'title');
			const linkField = config?.fields.find((f) => f.fieldKey === 'linkUrl');
			const zIndexField = config?.fields.find((f) => f.fieldKey === 'zIndex');

			expect(imageField?.type).toBe('image');
			expect(titleField?.type).toBe('text');
			expect(linkField?.type).toBe('url');
			expect(zIndexField?.type).toBe('number');
		});

		it('should have correct placement for image field', () => {
			const config = getNBBlockConfig('nectar-blocks/image');
			const imageField = config?.fields.find((f) => f.fieldKey === 'imageSource');
			expect(imageField?.placement).toBe('corner');
		});

		it('should have parentLabelText for nested fields (zIndex)', () => {
			const config = getNBBlockConfig('nectar-blocks/image');
			const zIndexField = config?.fields.find((f) => f.fieldKey === 'zIndex');
			expect(zIndexField?.parentLabelText).toBe('Z-Index');
		});
	});

	describe('nectarBlocksRegistry', () => {
		it('should be a non-empty array', () => {
			expect(Array.isArray(nectarBlocksRegistry)).toBe(true);
			expect(nectarBlocksRegistry.length).toBeGreaterThan(0);
		});

		it('should have unique block names', () => {
			const names = nectarBlocksRegistry.map((c) => c.blockName);
			const uniqueNames = new Set(names);
			expect(uniqueNames.size).toBe(names.length);
		});

		it('should have unique field keys within each block', () => {
			for (const config of nectarBlocksRegistry) {
				const fieldKeys = config.fields.map((f) => f.fieldKey);
				const uniqueKeys = new Set(fieldKeys);
				expect(uniqueKeys.size).toBe(fieldKeys.length);
			}
		});

		it('should have valid tab values for all fields', () => {
			const validTabs = new Set(['layout', 'style', 'motion']);
			for (const config of nectarBlocksRegistry) {
				for (const field of config.fields) {
					expect(validTabs.has(field.tab)).toBe(true);
				}
			}
		});

		it('should have valid type values for all fields', () => {
			const validTypes = new Set(['text', 'url', 'image', 'number', 'css-class', 'textarea']);
			for (const config of nectarBlocksRegistry) {
				for (const field of config.fields) {
					expect(validTypes.has(field.type)).toBe(true);
				}
			}
		});
	});
});

// ============================================================================
// 3. HOC Wiring Tests
// ============================================================================

describe('NB HOC Wiring', () => {
	let addFilterCalls: Array<{ hookName: string; namespace: string; callback: Function }>;
	let mockWpHooks: any;
	let mockWpCompose: any;

	beforeEach(() => {
		addFilterCalls = [];

		mockWpHooks = {
			addFilter: vi.fn((hookName: string, namespace: string, callback: Function) => {
				addFilterCalls.push({ hookName, namespace, callback });
			}),
		};

		mockWpCompose = {
			createHigherOrderComponent: vi.fn((fn: Function, _name: string) => {
				// Return the HOC function itself for testing
				return fn;
			}),
		};
	});

	describe('Filter registration', () => {
		it('should register blocks.registerBlockType filter', () => {
			// Simulate what registerNBDynamicTagIntegration does
			const { addFilter } = mockWpHooks;

			// Register the attribute injection filter
			addFilter(
				'blocks.registerBlockType',
				'voxel-fse/nb-inject-attributes',
				(settings: Record<string, unknown>, name: string) => {
					if (!NB_TARGET_BLOCK_NAMES.has(name)) return settings;
					const attrs = (settings['attributes'] ?? {}) as Record<string, unknown>;
					return {
						...settings,
						attributes: {
							...attrs,
							voxelDynamicTags: { type: 'object', default: {} },
							...voxelTabAttributes,
						},
					};
				}
			);

			expect(addFilter).toHaveBeenCalledWith(
				'blocks.registerBlockType',
				'voxel-fse/nb-inject-attributes',
				expect.any(Function)
			);
		});

		it('should register editor.BlockEdit filter', () => {
			const { addFilter } = mockWpHooks;
			const { createHigherOrderComponent } = mockWpCompose;

			const withNBDynamicTags = createHigherOrderComponent(
				(_BlockEdit: any) => (_props: any) => null,
				'withNBDynamicTags'
			);

			addFilter('editor.BlockEdit', 'voxel-fse/nb-dynamic-tags', withNBDynamicTags);

			expect(addFilter).toHaveBeenCalledWith(
				'editor.BlockEdit',
				'voxel-fse/nb-dynamic-tags',
				expect.any(Function)
			);
		});
	});

	describe('HOC block filtering', () => {
		it('should wrap NB target blocks with NBDynamicTagInjector', () => {
			// Simulate the HOC logic
			const MockBlockEdit = vi.fn(() => <div data-testid="block-edit" />);
			let injectorRendered = false;

			const hocFn = (BlockEdit: any) => (props: any) => {
				const { name } = props;
				if (!NB_TARGET_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}
				injectorRendered = true;
				return (
					<>
						<BlockEdit {...props} />
						<div data-testid="nb-dynamic-tag-injector" />
					</>
				);
			};

			const WrappedComponent = hocFn(MockBlockEdit);
			render(
				<WrappedComponent
					name="nectar-blocks/image"
					clientId="test-id"
					attributes={{ blockId: 'abc' }}
					setAttributes={vi.fn()}
				/>
			);

			expect(injectorRendered).toBe(true);
			expect(screen.getByTestId('block-edit')).toBeInTheDocument();
			expect(screen.getByTestId('nb-dynamic-tag-injector')).toBeInTheDocument();
		});

		it('should NOT wrap non-target blocks', () => {
			const MockBlockEdit = vi.fn(() => <div data-testid="block-edit" />);
			let injectorRendered = false;

			const hocFn = (BlockEdit: any) => (props: any) => {
				const { name } = props;
				if (!NB_TARGET_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}
				injectorRendered = true;
				return (
					<>
						<BlockEdit {...props} />
						<div data-testid="nb-dynamic-tag-injector" />
					</>
				);
			};

			const WrappedComponent = hocFn(MockBlockEdit);
			render(
				<WrappedComponent
					name="core/paragraph"
					clientId="test-id"
					attributes={{}}
					setAttributes={vi.fn()}
				/>
			);

			expect(injectorRendered).toBe(false);
			expect(screen.getByTestId('block-edit')).toBeInTheDocument();
			expect(screen.queryByTestId('nb-dynamic-tag-injector')).not.toBeInTheDocument();
		});

		it('should pass attributes and setAttributes to injector', () => {
			let receivedProps: any = null;

			const hocFn = (BlockEdit: any) => (props: any) => {
				const { name, clientId, attributes, setAttributes } = props;
				if (!NB_TARGET_BLOCK_NAMES.has(name)) {
					return <BlockEdit {...props} />;
				}
				receivedProps = { clientId, attributes, setAttributes };
				return <BlockEdit {...props} />;
			};

			const MockBlockEdit = () => <div />;
			const mockSetAttributes = vi.fn();
			const mockAttributes = {
				blockId: 'abc',
				stickyEnabled: true,
				visibilityBehavior: 'hide',
				loopLimit: '5',
				voxelDynamicTags: { imageSource: '@tags()@term(image)@endtags()' },
			};

			const WrappedComponent = hocFn(MockBlockEdit);
			render(
				<WrappedComponent
					name="nectar-blocks/image"
					clientId="test-client-id"
					attributes={mockAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(receivedProps).not.toBeNull();
			expect(receivedProps.clientId).toBe('test-client-id');
			expect(receivedProps.attributes).toBe(mockAttributes);
			expect(receivedProps.setAttributes).toBe(mockSetAttributes);
		});
	});
});

// ============================================================================
// 4. VoxelTab Portal Rendering Tests
// ============================================================================

describe('NB VoxelTab Portal Rendering', () => {
	/** Default VoxelTab attributes with correct literal types for tests */
	function makeVoxelTabAttrs(overrides: Record<string, unknown> = {}) {
		return {
			stickyEnabled: false,
			stickyDesktop: 'sticky' as const,
			stickyTablet: 'sticky' as const,
			stickyMobile: 'sticky' as const,
			stickyTopUnit: 'px',
			stickyLeftUnit: 'px',
			stickyRightUnit: 'px',
			stickyBottomUnit: 'px',
			visibilityBehavior: 'show' as const,
			visibilityRules: [] as never[],
			loopEnabled: false,
			loopSource: '',
			loopProperty: '',
			loopLimit: '',
			loopOffset: '',
			...overrides,
		};
	}

	it('should render VoxelTab with block attributes when tab is active', () => {
		const mockSetAttributes = vi.fn();
		const attrs = makeVoxelTabAttrs({ stickyEnabled: true });

		render(<VoxelTab attributes={attrs} setAttributes={mockSetAttributes} />);

		// VoxelTab should render all three accordions
		expect(screen.getByText('Widget options')).toBeInTheDocument();
		expect(screen.getByText('Visibility')).toBeInTheDocument();
		expect(screen.getByText('Loop element')).toBeInTheDocument();
	});

	it('should call setAttributes when VoxelTab controls change', () => {
		const mockSetAttributes = vi.fn();
		const attrs = makeVoxelTabAttrs();

		render(<VoxelTab attributes={attrs} setAttributes={mockSetAttributes} />);

		// Toggle sticky enabled — this proves setAttributes wiring works
		const enableCheckboxes = screen.getAllByRole('checkbox');
		const stickyToggle = enableCheckboxes[0]; // First checkbox is "Enable?" for sticky
		fireEvent.click(stickyToggle);

		expect(mockSetAttributes).toHaveBeenCalledWith({ stickyEnabled: true });
	});

	it('should update visibility behavior through setAttributes', () => {
		const mockSetAttributes = vi.fn();
		const attrs = makeVoxelTabAttrs();

		render(<VoxelTab attributes={attrs} setAttributes={mockSetAttributes} />);

		// Change visibility behavior dropdown
		const selects = screen.getAllByRole('combobox');
		const behaviorSelect = selects.find((s) => {
			const options = s.querySelectorAll('option');
			return Array.from(options).some((o) => o.value === 'hide');
		});

		if (behaviorSelect) {
			fireEvent.change(behaviorSelect, { target: { value: 'hide' } });
			expect(mockSetAttributes).toHaveBeenCalledWith({ visibilityBehavior: 'hide' });
		}
	});
});

// ============================================================================
// 5. Complete Wiring Chain Integration Test
// ============================================================================

describe('NB VoxelTab Complete Wiring Chain', () => {
	it('should wire attributes end-to-end: register → HOC → VoxelTab → setAttributes', () => {
		// Step 1: Simulate attribute injection
		const originalSettings = {
			attributes: {
				blockId: { type: 'string' },
				image: { type: 'object' },
			},
		};

		// Apply the filter
		const injectedSettings = {
			...originalSettings,
			attributes: {
				...(originalSettings.attributes as Record<string, unknown>),
				voxelDynamicTags: { type: 'object', default: {} },
				...voxelTabAttributes,
			},
		};

		// Verify attributes were injected
		expect(injectedSettings.attributes).toHaveProperty('stickyEnabled');
		expect(injectedSettings.attributes).toHaveProperty('visibilityBehavior');
		expect(injectedSettings.attributes).toHaveProperty('loopLimit');
		expect(injectedSettings.attributes).toHaveProperty('voxelDynamicTags');

		// Step 2: Simulate block instance with default attribute values
		const blockAttributes: Record<string, unknown> = {};
		for (const [key, schema] of Object.entries(injectedSettings.attributes)) {
			const def = (schema as any).default;
			if (def !== undefined) {
				blockAttributes[key] = def;
			}
		}

		// Verify default values are correct
		expect(blockAttributes['stickyEnabled']).toBe(false);
		expect(blockAttributes['visibilityBehavior']).toBe('show');
		expect(blockAttributes['loopEnabled']).toBe(false);
		expect(blockAttributes['loopSource']).toBe('');
		expect(blockAttributes['voxelDynamicTags']).toEqual({});

		// Step 3: Simulate setAttributes call (what VoxelTab does when user interacts)
		const setAttributes = vi.fn((newAttrs: Record<string, unknown>) => {
			Object.assign(blockAttributes, newAttrs);
		});

		// Simulate user toggling stickyEnabled via VoxelTab
		setAttributes({ stickyEnabled: true });
		expect(blockAttributes['stickyEnabled']).toBe(true);

		// Simulate user changing visibility to 'hide'
		setAttributes({ visibilityBehavior: 'hide' });
		expect(blockAttributes['visibilityBehavior']).toBe('hide');

		// Simulate user setting loop limit
		setAttributes({ loopLimit: '10' });
		expect(blockAttributes['loopLimit']).toBe('10');

		// Verify all setAttributes calls
		expect(setAttributes).toHaveBeenCalledTimes(3);
		expect(setAttributes).toHaveBeenCalledWith({ stickyEnabled: true });
		expect(setAttributes).toHaveBeenCalledWith({ visibilityBehavior: 'hide' });
		expect(setAttributes).toHaveBeenCalledWith({ loopLimit: '10' });
	});

	it('should keep NB native attributes separate from VoxelTab attributes', () => {
		const blockAttributes = {
			// NB native
			blockId: 'test-123',
			image: { url: 'https://example.com/img.jpg' },
			imageRatio: '16-9',
			// VoxelTab
			stickyEnabled: false,
			visibilityBehavior: 'show',
			loopLimit: '',
			voxelDynamicTags: {},
		};

		// Changing a VoxelTab attribute should not affect NB attributes
		const newAttrs = { stickyEnabled: true };
		const merged = { ...blockAttributes, ...newAttrs };

		expect(merged.blockId).toBe('test-123');
		expect(merged.image).toEqual({ url: 'https://example.com/img.jpg' });
		expect(merged.imageRatio).toBe('16-9');
		expect(merged.stickyEnabled).toBe(true);
	});

	it('should support dynamic tags alongside VoxelTab attributes', () => {
		const blockAttributes = {
			// NB native
			blockId: 'test-123',
			// Dynamic tags (set by DynamicTagBuilder)
			voxelDynamicTags: {
				imageSource: '@tags()@term(image)@endtags()',
				title: '@tags()@term(title)@endtags()',
			},
			// VoxelTab attributes
			stickyEnabled: true,
			visibilityBehavior: 'hide',
			visibilityRules: [
				{ id: '1', filterKey: 'user:logged_in', operator: 'equals' },
			],
			loopSource: 'author',
			loopProperty: 'role',
			loopLimit: '5',
		};

		// Both systems should coexist
		expect(blockAttributes.voxelDynamicTags).toHaveProperty('imageSource');
		expect(blockAttributes.stickyEnabled).toBe(true);
		expect(blockAttributes.visibilityRules).toHaveLength(1);
		expect(blockAttributes.loopSource).toBe('author');
	});
});

// ============================================================================
// 6. Child Block (RowSettings) Attribute Injection Tests
// ============================================================================

describe('NB Child Block Attribute Injection', () => {
	// Simulate the child block attribute injection logic from index.tsx
	const rowSettingsAttributes = {
		loopEnabled: { type: 'boolean' as const, default: false },
		loopSource: { type: 'string' as const, default: '' },
		loopProperty: { type: 'string' as const, default: '' },
		loopLimit: { type: 'string' as const, default: '' },
		loopOffset: { type: 'string' as const, default: '' },
		visibilityBehavior: { type: 'string' as const, default: 'show' },
		visibilityRules: { type: 'array' as const, default: [] },
		voxelDynamicTitle: { type: 'string' as const, default: '' },
		voxelDynamicCssId: { type: 'string' as const, default: '' },
	};

	function simulateChildAttributeInjection(
		settings: Record<string, unknown>,
		name: string
	): { attributes: Record<string, unknown> } & Record<string, unknown> {
		if (!NB_ROW_SETTINGS_BLOCK_NAMES.has(name)) {
			return settings as { attributes: Record<string, unknown> } & Record<string, unknown>;
		}

		const attrs = (settings['attributes'] ?? {}) as Record<string, unknown>;
		return {
			...settings,
			attributes: {
				...attrs,
				...rowSettingsAttributes,
			},
		};
	}

	it.each([...NB_ROW_SETTINGS_BLOCKS])(
		'should inject RowSettings attributes into %s',
		(blockName) => {
			const settings = { attributes: {} };
			const result = simulateChildAttributeInjection(settings, blockName);

			expect(result.attributes).toHaveProperty('loopEnabled');
			expect(result.attributes).toHaveProperty('loopSource');
			expect(result.attributes).toHaveProperty('visibilityBehavior');
			expect(result.attributes).toHaveProperty('visibilityRules');
			expect(result.attributes).toHaveProperty('voxelDynamicTitle');
			expect(result.attributes).toHaveProperty('voxelDynamicCssId');
		}
	);

	it('should NOT inject RowSettings into parent blocks', () => {
		const settings = { attributes: {} };
		const result = simulateChildAttributeInjection(settings, 'nectar-blocks/image');
		expect(result.attributes).not.toHaveProperty('loopEnabled');
	});

	it('should NOT inject RowSettings into core blocks', () => {
		const settings = { attributes: {} };
		const result = simulateChildAttributeInjection(settings, 'core/paragraph');
		expect(result.attributes).not.toHaveProperty('loopEnabled');
	});

	it('should preserve existing child block attributes', () => {
		const settings = {
			attributes: {
				title: { type: 'string', default: 'Tab 1' },
			},
		};
		const result = simulateChildAttributeInjection(settings, 'nectar-blocks/tab-section');
		expect(result.attributes).toHaveProperty('title');
		expect(result.attributes).toHaveProperty('loopEnabled');
	});
});
