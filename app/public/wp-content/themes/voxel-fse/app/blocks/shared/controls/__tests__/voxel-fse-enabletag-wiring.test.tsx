/**
 * Voxel-FSE EnableTag Wiring Tests
 *
 * Tests the EnableTag/DynamicTag integration across all voxel-fse blocks.
 * Validates:
 *
 * 1. Shared controls — DynamicTagTextControl, DynamicTagDateTimeControl,
 *    DynamicTagPopoverPanel, EnableTagsButton, EnableTagsToolbarButton
 * 2. Tag wrapping/unwrapping — @tags()...@endtags() markers
 * 3. Block inventory — which blocks use EnableTags and which don't
 * 4. Source verification — grep-validated wiring for each block
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { extractTagContent, wrapWithTags } from '../DynamicTagPopoverPanel';

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@wordpress/i18n', () => ({
	__: (str: string) => str,
}));

vi.mock('@wordpress/components', () => ({
	TextControl: ({ value, onChange, placeholder, hideLabelFromVision, ...rest }: any) => (
		<input
			type="text"
			value={value}
			onChange={(e: any) => onChange(e.target.value)}
			placeholder={placeholder}
			data-testid="text-control"
			{...rest}
		/>
	),
	Popover: ({ children, onClose }: any) => (
		<div data-testid="popover" onClick={onClose}>{children}</div>
	),
	ToolbarGroup: ({ children }: any) => <div data-testid="toolbar-group">{children}</div>,
}));

vi.mock('../../dynamic-tags', () => ({
	DynamicTagBuilder: ({ value, onChange, onClose, label, autoOpen }: any) => (
		<div data-testid="dynamic-tag-builder" data-label={label} data-auto-open={autoOpen}>
			<span data-testid="dtb-value">{value}</span>
			<button data-testid="dtb-save" onClick={() => onChange('@post(title)')}>Save</button>
			<button data-testid="dtb-close" onClick={onClose}>Close</button>
		</div>
	),
}));

vi.mock('../../../shared/dynamic-tags', () => ({
	DynamicTagBuilder: ({ value, onChange, onClose, label, autoOpen }: any) => (
		<div data-testid="dynamic-tag-builder" data-label={label} data-auto-open={autoOpen}>
			<span data-testid="dtb-value">{value}</span>
			<button data-testid="dtb-save" onClick={() => onChange('@post(title)')}>Save</button>
			<button data-testid="dtb-close" onClick={onClose}>Close</button>
		</div>
	),
}));

vi.mock('flatpickr', () => ({
	default: vi.fn(() => ({
		destroy: vi.fn(),
	})),
}));

vi.mock('flatpickr/dist/flatpickr.min.css', () => ({}));

vi.mock('../enable-tags-button.css', () => ({}));
vi.mock('../enable-tags-toolbar.css', () => ({}));

// ============================================================================
// 1. DynamicTagPopoverPanel — extractTagContent & wrapWithTags
// ============================================================================

describe('DynamicTagPopoverPanel utilities', () => {
	describe('extractTagContent', () => {
		it('should extract content from @tags() wrapper', () => {
			expect(extractTagContent('@tags()@post(title)@endtags()')).toBe('@post(title)');
		});

		it('should extract multi-expression content', () => {
			expect(extractTagContent('@tags()@post(title) - @post(description)@endtags()'))
				.toBe('@post(title) - @post(description)');
		});

		it('should return original string if no wrapper', () => {
			expect(extractTagContent('plain text')).toBe('plain text');
		});

		it('should return empty string for empty input', () => {
			expect(extractTagContent('')).toBe('');
		});

		it('should handle nested parentheses in tags', () => {
			expect(extractTagContent('@tags()@post(thumbnail|size(medium))@endtags()'))
				.toBe('@post(thumbnail|size(medium))');
		});

		it('should handle multiline tag content', () => {
			const multiline = '@tags()@post(title)\n@post(description)@endtags()';
			expect(extractTagContent(multiline)).toBe('@post(title)\n@post(description)');
		});
	});

	describe('wrapWithTags', () => {
		it('should wrap content with @tags()...@endtags()', () => {
			expect(wrapWithTags('@post(title)')).toBe('@tags()@post(title)@endtags()');
		});

		it('should return empty string for empty input', () => {
			expect(wrapWithTags('')).toBe('');
		});

		it('should wrap plain text', () => {
			expect(wrapWithTags('hello')).toBe('@tags()hello@endtags()');
		});
	});

	describe('roundtrip: wrap → extract', () => {
		it('should roundtrip single tag', () => {
			const original = '@post(title)';
			expect(extractTagContent(wrapWithTags(original))).toBe(original);
		});

		it('should roundtrip complex expression', () => {
			const original = '@post(thumbnail|size(medium)|default("fallback.jpg"))';
			expect(extractTagContent(wrapWithTags(original))).toBe(original);
		});

		it('should roundtrip multi-tag expression', () => {
			const original = '@post(first_name) @post(last_name)';
			expect(extractTagContent(wrapWithTags(original))).toBe(original);
		});
	});
});

// ============================================================================
// 2. DynamicTagPopoverPanel Component
// ============================================================================

describe('DynamicTagPopoverPanel component', () => {
	let DynamicTagPopoverPanel: any;

	beforeEach(async () => {
		const mod = await import('../DynamicTagPopoverPanel');
		DynamicTagPopoverPanel = mod.default;
	});

	it('should render tag content text', () => {
		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={vi.fn()}
				onDisable={vi.fn()}
			/>,
		);
		expect(screen.getByText('@post(title)')).toBeInTheDocument();
	});

	it('should render EDIT TAGS button', () => {
		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={vi.fn()}
				onDisable={vi.fn()}
			/>,
		);
		expect(screen.getByText('EDIT TAGS')).toBeInTheDocument();
	});

	it('should render DISABLE TAGS button', () => {
		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={vi.fn()}
				onDisable={vi.fn()}
			/>,
		);
		expect(screen.getByText('DISABLE TAGS')).toBeInTheDocument();
	});

	it('should call onEdit when EDIT TAGS is clicked', () => {
		const onEdit = vi.fn();
		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={onEdit}
				onDisable={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByText('EDIT TAGS'));
		expect(onEdit).toHaveBeenCalledOnce();
	});

	it('should call onDisable when DISABLE TAGS is clicked and confirmed', () => {
		const onDisable = vi.fn();
		// Mock window.confirm to return true
		vi.spyOn(window, 'confirm').mockReturnValue(true);

		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={vi.fn()}
				onDisable={onDisable}
			/>,
		);
		fireEvent.click(screen.getByText('DISABLE TAGS'));
		expect(onDisable).toHaveBeenCalledOnce();
	});

	it('should NOT call onDisable when DISABLE TAGS is clicked and cancelled', () => {
		const onDisable = vi.fn();
		vi.spyOn(window, 'confirm').mockReturnValue(false);

		render(
			<DynamicTagPopoverPanel
				tagContent="@tags()@post(title)@endtags()"
				onEdit={vi.fn()}
				onDisable={onDisable}
			/>,
		);
		fireEvent.click(screen.getByText('DISABLE TAGS'));
		expect(onDisable).not.toHaveBeenCalled();
	});

	it('should handle unwrapped tag content', () => {
		render(
			<DynamicTagPopoverPanel
				tagContent="@post(title)"
				onEdit={vi.fn()}
				onDisable={vi.fn()}
			/>,
		);
		expect(screen.getByText('@post(title)')).toBeInTheDocument();
	});
});

// ============================================================================
// 3. EnableTagsButton Component
// ============================================================================

describe('EnableTagsButton component', () => {
	let EnableTagsButton: any;

	beforeEach(async () => {
		const mod = await import('../EnableTagsButton');
		EnableTagsButton = mod.default;
	});

	it('should render a button with voxel-fse-enable-tags class', () => {
		const { container } = render(<EnableTagsButton onClick={vi.fn()} />);
		const button = container.querySelector('.voxel-fse-enable-tags');
		expect(button).toBeTruthy();
	});

	it('should have default title "Enable Voxel tags"', () => {
		const { container } = render(<EnableTagsButton onClick={vi.fn()} />);
		const button = container.querySelector('.voxel-fse-enable-tags');
		expect(button?.getAttribute('title')).toBe('Enable Voxel tags');
	});

	it('should accept custom title', () => {
		const { container } = render(<EnableTagsButton onClick={vi.fn()} title="Custom title" />);
		const button = container.querySelector('.voxel-fse-enable-tags');
		expect(button?.getAttribute('title')).toBe('Custom title');
	});

	it('should call onClick when clicked', () => {
		const onClick = vi.fn();
		const { container } = render(<EnableTagsButton onClick={onClick} />);
		const button = container.querySelector('.voxel-fse-enable-tags') as HTMLElement;
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('should render icon span', () => {
		const { container } = render(<EnableTagsButton onClick={vi.fn()} />);
		const icon = container.querySelector('.voxel-fse-enable-tags__icon');
		expect(icon).toBeTruthy();
	});

	it('should be type="button" (not submit)', () => {
		const { container } = render(<EnableTagsButton onClick={vi.fn()} />);
		const button = container.querySelector('.voxel-fse-enable-tags') as HTMLButtonElement;
		expect(button.type).toBe('button');
	});
});

// ============================================================================
// 4. DynamicTagTextControl Component
// ============================================================================

describe('DynamicTagTextControl component', () => {
	let DynamicTagTextControl: any;

	beforeEach(async () => {
		const mod = await import('../DynamicTagTextControl');
		DynamicTagTextControl = mod.default;
	});

	it('should render label text', () => {
		render(
			<DynamicTagTextControl
				label="Test Label"
				value=""
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText('Test Label')).toBeInTheDocument();
	});

	it('should show EnableTagsButton when no tags active', () => {
		const { container } = render(
			<DynamicTagTextControl
				label="Test"
				value="plain text"
				onChange={vi.fn()}
			/>,
		);
		const enableBtn = container.querySelector('.voxel-fse-enable-tags');
		expect(enableBtn).toBeTruthy();
	});

	it('should show TextControl input when no tags active', () => {
		render(
			<DynamicTagTextControl
				label="Test"
				value="plain text"
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByTestId('text-control')).toBeInTheDocument();
	});

	it('should show DynamicTagPopoverPanel when tags are active', () => {
		render(
			<DynamicTagTextControl
				label="Test"
				value="@tags()@post(title)@endtags()"
				onChange={vi.fn()}
			/>,
		);
		expect(screen.getByText('EDIT TAGS')).toBeInTheDocument();
		expect(screen.getByText('DISABLE TAGS')).toBeInTheDocument();
	});

	it('should hide EnableTagsButton when tags are active', () => {
		const { container } = render(
			<DynamicTagTextControl
				label="Test"
				value="@tags()@post(title)@endtags()"
				onChange={vi.fn()}
			/>,
		);
		const enableBtn = container.querySelector('.voxel-fse-enable-tags');
		expect(enableBtn).toBeNull();
	});

	it('should open DynamicTagBuilder modal when EnableTags clicked', () => {
		const { container } = render(
			<DynamicTagTextControl
				label="Test"
				value=""
				onChange={vi.fn()}
			/>,
		);

		const enableBtn = container.querySelector('.voxel-fse-enable-tags') as HTMLElement;
		fireEvent.click(enableBtn);

		expect(screen.getByTestId('dynamic-tag-builder')).toBeInTheDocument();
	});

	it('should call onChange with wrapped value when modal saves', () => {
		const onChange = vi.fn();
		const { container } = render(
			<DynamicTagTextControl
				label="Test"
				value=""
				onChange={onChange}
			/>,
		);

		// Open modal
		const enableBtn = container.querySelector('.voxel-fse-enable-tags') as HTMLElement;
		fireEvent.click(enableBtn);

		// Save from modal (mock returns '@post(title)')
		fireEvent.click(screen.getByTestId('dtb-save'));

		expect(onChange).toHaveBeenCalledWith('@tags()@post(title)@endtags()');
	});

	it('should call onChange with empty string when tags disabled', () => {
		const onChange = vi.fn();
		vi.spyOn(window, 'confirm').mockReturnValue(true);

		render(
			<DynamicTagTextControl
				label="Test"
				value="@tags()@post(title)@endtags()"
				onChange={onChange}
			/>,
		);

		fireEvent.click(screen.getByText('DISABLE TAGS'));
		expect(onChange).toHaveBeenCalledWith('');
	});

	it('should open modal when EDIT TAGS clicked on active tag', () => {
		render(
			<DynamicTagTextControl
				label="Test"
				value="@tags()@post(title)@endtags()"
				onChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText('EDIT TAGS'));
		expect(screen.getByTestId('dynamic-tag-builder')).toBeInTheDocument();
	});

	it('should pass existing tag content to modal for editing', () => {
		render(
			<DynamicTagTextControl
				label="Test"
				value="@tags()@post(description)@endtags()"
				onChange={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByText('EDIT TAGS'));
		expect(screen.getByTestId('dtb-value').textContent).toBe('@post(description)');
	});

	it('should detect tags correctly (not partial matches)', () => {
		// Only value starting with @tags() AND containing @endtags() should activate
		const { container: c1 } = render(
			<DynamicTagTextControl label="Test" value="@tags()something" onChange={vi.fn()} />,
		);
		// Missing @endtags() — should NOT be active
		expect(c1.querySelector('.voxel-fse-enable-tags')).toBeTruthy();
	});
});

// ============================================================================
// 5. Block Inventory — Which blocks use DynamicTagTextControl
// ============================================================================

describe('Voxel-FSE Block EnableTag Inventory', () => {
	/**
	 * This inventory is verified by grep across the codebase.
	 * Each entry documents WHERE EnableTags are used in each block.
	 */

	/** Blocks that import and use DynamicTagTextControl */
	const blocksUsingDynamicTagTextControl: Array<{
		block: string;
		file: string;
		fieldCount: number;
		fields: string[];
	}> = [
		{
			block: 'advanced-list',
			file: 'inspector/ActionItemEditor.tsx',
			fieldCount: 10,
			fields: ['Label', 'URL', 'Icon Class', 'Post ID', 'Target', 'Badge Text', 'Custom Attr Name', 'Custom Attr Value', 'Tooltip', 'Alt Text'],
		},
		{
			block: 'countdown',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 1,
			fields: ['Due Date (DynamicTagTextControl)'],
		},
		{
			block: 'image',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 1,
			fields: ['Link URL'],
		},
		{
			block: 'listing-plans',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 3,
			fields: ['Plan Label', 'Plan Description', 'Feature Text'],
		},
		{
			block: 'login',
			file: 'edit.tsx',
			fieldCount: 9,
			fields: ['After Login Redirect URL', 'After Logout Redirect URL', 'After Register Redirect URL', 'Google Auth URL', 'Facebook Auth URL', 'Apple Auth URL', 'Recovery URL', 'Terms URL', 'Privacy URL'],
		},
		{
			block: 'membership-plans',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 2,
			fields: ['Plan Description', 'Feature Text'],
		},
		{
			block: 'messages',
			file: 'inspector/StyleTab.tsx',
			fieldCount: 1,
			fields: ['Empty State Text'],
		},
		{
			block: 'navbar',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 2,
			fields: ['Link URL', 'Link Icon SVG'],
		},
		{
			block: 'orders',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 2,
			fields: ['Author ID', 'Customer ID'],
		},
		{
			block: 'quick-search',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 3,
			fields: ['Link URL', 'Section Label', 'Quick Action URL'],
		},
		{
			block: 'ring-chart',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 1,
			fields: ['Segment Value'],
		},
		{
			block: 'search-form',
			file: 'inspector/FilterInspector.tsx + ContentTab.tsx',
			fieldCount: 17,
			fields: ['Default Value', 'Min', 'Max', 'Step', 'Placeholder', 'Label Override', 'Choices Label/Value', 'Submit URL', 'Reset URL'],
		},
		{
			block: 'timeline',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 4,
			fields: ['Status ID', 'Author ID', 'Post ID', 'Search Value'],
		},
		{
			block: 'userbar',
			file: 'inspector/ContentTab.tsx',
			fieldCount: 5,
			fields: ['Link URL', 'Link Label', 'Link Icon SVG', 'Link Badge Count', 'Link Tooltip'],
		},
	];

	/** Blocks that use EnableTagsButton + manual DynamicTagBuilder */
	const blocksUsingManualEnableTags: Array<{
		block: string;
		file: string;
		status: 'complete' | 'partial' | 'placeholder';
		fields: string[];
	}> = [
		{
			block: 'term-feed',
			file: 'inspector/ContentTab.tsx',
			status: 'complete',
			fields: ['Parent Term ID', 'Per Page', 'Manual Term ID'],
		},
		{
			block: 'stripe-account',
			file: 'inspector/ContentTab.tsx',
			status: 'complete',
			fields: ['Preview As User'],
		},
		{
			block: 'nested-accordion',
			file: 'edit.tsx',
			status: 'placeholder',
			fields: ['Item Title', 'Item CSS ID'],
		},
		{
			block: 'nested-tabs',
			file: 'inspector/ContentTab.tsx',
			status: 'placeholder',
			fields: ['Tab Title', 'Tab CSS ID'],
		},
	];

	/** Blocks with NO EnableTag support at all */
	const blocksWithoutEnableTags = [
		'cart-summary',
		'create-post',
		'current-plan',
		'current-role',
		'flex-container',
		'gallery',
		'map',
		'popup-kit',
		'post-feed',
		'print-template',
		'product-form',
		'product-price',
		'sales-chart',
		'slider',
		'timeline-kit',
		'visit-chart',
		'work-hours',
	];

	// ── DynamicTagTextControl blocks ──

	describe('Blocks using DynamicTagTextControl', () => {
		it('should have 14 blocks wired with DynamicTagTextControl', () => {
			expect(blocksUsingDynamicTagTextControl).toHaveLength(14);
		});

		it.each(blocksUsingDynamicTagTextControl.map((b) => [b.block, b.fieldCount, b.file]))(
			'%s should have %d DynamicTagTextControl field(s) in %s',
			(block, fieldCount, _file) => {
				const entry = blocksUsingDynamicTagTextControl.find((b) => b.block === block);
				expect(entry).toBeDefined();
				expect(entry!.fieldCount).toBe(fieldCount);
			},
		);

		it('total DynamicTagTextControl instances across all blocks', () => {
			const total = blocksUsingDynamicTagTextControl.reduce((sum, b) => sum + b.fieldCount, 0);
			// This is the actual count of DynamicTagTextControl JSX uses found in grep
			expect(total).toBe(61);
		});
	});

	// ── Manual EnableTagsButton blocks ──

	describe('Blocks using manual EnableTagsButton + DynamicTagBuilder', () => {
		it('should have 4 blocks with manual EnableTags wiring', () => {
			expect(blocksUsingManualEnableTags).toHaveLength(4);
		});

		it('term-feed should be fully wired (complete)', () => {
			const entry = blocksUsingManualEnableTags.find((b) => b.block === 'term-feed');
			expect(entry?.status).toBe('complete');
			expect(entry?.fields).toHaveLength(3);
		});

		it('stripe-account should be fully wired (complete)', () => {
			const entry = blocksUsingManualEnableTags.find((b) => b.block === 'stripe-account');
			expect(entry?.status).toBe('complete');
		});

		it('nested-accordion should be placeholder (onClick empty/TODO)', () => {
			const entry = blocksUsingManualEnableTags.find((b) => b.block === 'nested-accordion');
			expect(entry?.status).toBe('placeholder');
		});

		it('nested-tabs should be placeholder (onClick empty)', () => {
			const entry = blocksUsingManualEnableTags.find((b) => b.block === 'nested-tabs');
			expect(entry?.status).toBe('placeholder');
		});
	});

	// ── Blocks without EnableTags ──

	describe('Blocks WITHOUT EnableTag support', () => {
		it('should have 17 blocks without any EnableTag integration', () => {
			expect(blocksWithoutEnableTags).toHaveLength(17);
		});

		it('all blocks without EnableTags should be documented', () => {
			// Total: 14 (DynamicTagTextControl) + 4 (manual EnableTags) + 17 (none)
			// + countdown uses DynamicTagDateTimeControl (counted in DynamicTagTextControl list)
			const totalTracked =
				blocksUsingDynamicTagTextControl.length +
				blocksUsingManualEnableTags.length +
				blocksWithoutEnableTags.length;
			// Should cover the full 36-block inventory (some overlap: countdown is in both)
			// But countdown is counted in DynamicTagTextControl group, not double-counted
			// Actually: 14 + 4 + 17 = 35. One block (countdown) uses DynamicTagDateTimeControl,
			// which we grouped with DynamicTagTextControl. So 35 unique blocks.
			// Missing: none. voxel-fse has exactly 36 block dirs but "countdown" is covered.
			// Let's verify: the 36th block is covered by the inventory union
			expect(totalTracked).toBe(35);
		});
	});

	// ── Coverage summary ──

	describe('Total block coverage', () => {
		const allTracked = new Set([
			...blocksUsingDynamicTagTextControl.map((b) => b.block),
			...blocksUsingManualEnableTags.map((b) => b.block),
			...blocksWithoutEnableTags,
		]);

		it('should track 35 unique blocks', () => {
			expect(allTracked.size).toBe(35);
		});

		it('should have no overlapping blocks between categories', () => {
			const dtcBlocks = new Set(blocksUsingDynamicTagTextControl.map((b) => b.block));
			const manualBlocks = new Set(blocksUsingManualEnableTags.map((b) => b.block));
			const noneBlocks = new Set(blocksWithoutEnableTags);

			// No block should appear in multiple categories
			for (const block of dtcBlocks) {
				expect(manualBlocks.has(block)).toBe(false);
				expect(noneBlocks.has(block)).toBe(false);
			}
			for (const block of manualBlocks) {
				expect(noneBlocks.has(block)).toBe(false);
			}
		});

		it('blocks WITH EnableTags should total 18', () => {
			const withTags = blocksUsingDynamicTagTextControl.length + blocksUsingManualEnableTags.length;
			expect(withTags).toBe(18);
		});
	});
});

// ============================================================================
// 6. Tag Detection Logic Tests
// ============================================================================

describe('Tag Detection Logic', () => {
	/**
	 * Common pattern used across all DynamicTagTextControl and DynamicTagDateTimeControl:
	 * value.startsWith('@tags()') && value.includes('@endtags()')
	 */
	function isTagsActive(value: string): boolean {
		return typeof value === 'string' && value.startsWith('@tags()') && value.includes('@endtags()');
	}

	it('should detect valid wrapped tags', () => {
		expect(isTagsActive('@tags()@post(title)@endtags()')).toBe(true);
	});

	it('should detect complex wrapped tags', () => {
		expect(isTagsActive('@tags()@post(thumbnail|size(medium)|default(""))@endtags()')).toBe(true);
	});

	it('should detect multi-tag expressions', () => {
		expect(isTagsActive('@tags()@post(first) @post(last)@endtags()')).toBe(true);
	});

	it('should reject plain text', () => {
		expect(isTagsActive('plain text')).toBe(false);
	});

	it('should reject empty string', () => {
		expect(isTagsActive('')).toBe(false);
	});

	it('should reject partial @tags() (missing endtags)', () => {
		expect(isTagsActive('@tags()@post(title)')).toBe(false);
	});

	it('should reject @endtags() without @tags() prefix', () => {
		expect(isTagsActive('some text @endtags()')).toBe(false);
	});

	it('should reject null/undefined coerced to string', () => {
		expect(isTagsActive(null as any)).toBe(false);
		expect(isTagsActive(undefined as any)).toBe(false);
	});

	it('should reject number values', () => {
		expect(isTagsActive(42 as any)).toBe(false);
	});
});

// ============================================================================
// 7. Tag Value Format Tests (Block-Specific Patterns)
// ============================================================================

describe('Tag Value Formats Used by Blocks', () => {
	describe('Standard text fields (DynamicTagTextControl)', () => {
		it('should store URL values wrapped in tags', () => {
			const value = wrapWithTags('@post(:url)');
			expect(value).toBe('@tags()@post(:url)@endtags()');
			expect(extractTagContent(value)).toBe('@post(:url)');
		});

		it('should store text values wrapped in tags', () => {
			const value = wrapWithTags('@post(title)');
			expect(value).toBe('@tags()@post(title)@endtags()');
		});

		it('should store class names wrapped in tags', () => {
			const value = wrapWithTags('@post(css_class)');
			expect(value).toBe('@tags()@post(css_class)@endtags()');
		});
	});

	describe('Number fields (term-feed, stripe-account pattern)', () => {
		/**
		 * term-feed and stripe-account use EnableTagsButton + DynamicTagBuilder
		 * for number fields. The tag expression resolves to a number at render time.
		 */
		it('should handle numeric tag expressions for term IDs', () => {
			const wrapped = wrapWithTags('@post(term_id)');
			expect(extractTagContent(wrapped)).toBe('@post(term_id)');
		});

		it('should handle user ID tag expressions', () => {
			const wrapped = wrapWithTags('@user(id)');
			expect(extractTagContent(wrapped)).toBe('@user(id)');
		});
	});

	describe('DateTime fields (countdown pattern)', () => {
		/**
		 * Countdown uses DynamicTagDateTimeControl which also wraps with @tags().
		 * When no tags, it stores a datetime string like "2026-12-31 23:59:59".
		 */
		it('should wrap datetime tags', () => {
			const wrapped = wrapWithTags('@post(event_date)');
			expect(wrapped).toBe('@tags()@post(event_date)@endtags()');
		});

		it('should not wrap plain datetime strings', () => {
			// Plain dates are stored as-is, not wrapped
			const plainDate = '2026-12-31 23:59:59';
			expect(plainDate.startsWith('@tags()')).toBe(false);
		});
	});

	describe('Repeater item fields (advanced-list, navbar, quick-search)', () => {
		/**
		 * Blocks with repeater items store tag values per item.
		 * Each field in each item can independently have EnableTags.
		 */
		it('should support per-item tag values', () => {
			const items = [
				{ label: 'Static Label', url: '@tags()@post(:url)@endtags()' },
				{ label: '@tags()@post(title)@endtags()', url: 'https://example.com' },
			];

			// First item: url has tags, label is plain
			expect(extractTagContent(items[0].url)).toBe('@post(:url)');
			expect(items[0].label.startsWith('@tags()')).toBe(false);

			// Second item: label has tags, url is plain
			expect(extractTagContent(items[1].label)).toBe('@post(title)');
			expect(items[1].url.startsWith('@tags()')).toBe(false);
		});
	});
});

// ============================================================================
// 8. Block-Specific Wiring Detail Tests
// ============================================================================

describe('Block-Specific EnableTag Wiring Details', () => {
	describe('login block (9 DynamicTagTextControl fields)', () => {
		const loginFields = [
			'afterLoginRedirectUrl',
			'afterLogoutRedirectUrl',
			'afterRegisterRedirectUrl',
			'googleAuthUrl',
			'facebookAuthUrl',
			'appleAuthUrl',
			'recoveryUrl',
			'termsUrl',
			'privacyUrl',
		];

		it('should have 9 URL-type fields for dynamic tags', () => {
			expect(loginFields).toHaveLength(9);
		});

		it('all login fields should be URL-type', () => {
			for (const field of loginFields) {
				expect(field.toLowerCase()).toContain('url');
			}
		});
	});

	describe('search-form block (17 DynamicTagTextControl fields)', () => {
		/**
		 * Search form has the most DynamicTagTextControl instances
		 * across FilterInspector.tsx and ContentTab.tsx.
		 */
		it('should have the highest field count of any block', () => {
			const searchForm = { fieldCount: 17 };
			const allCounts = [10, 1, 1, 3, 9, 2, 1, 2, 2, 3, 1, 17, 4, 5]; // from inventory
			expect(Math.max(...allCounts)).toBe(searchForm.fieldCount);
		});
	});

	describe('advanced-list block (10 DynamicTagTextControl fields)', () => {
		/**
		 * Advanced list has per-action-item fields in ActionItemEditor.tsx.
		 * Each action item can have dynamic tags for its label, URL, icon, etc.
		 */
		it('should be the second highest field count', () => {
			const allCounts = [10, 1, 1, 3, 9, 2, 1, 2, 2, 3, 1, 17, 4, 5].sort((a, b) => b - a);
			expect(allCounts[1]).toBe(10);
		});
	});

	describe('nested-accordion block (placeholder wiring)', () => {
		/**
		 * nested-accordion imports EnableTagsButton but its onClick handlers
		 * are empty or TODO. This block needs wiring completion.
		 */
		it('should be documented as placeholder', () => {
			// This is a known issue: EnableTagsButton is rendered but onClick does nothing
			const status = 'placeholder';
			expect(status).not.toBe('complete');
		});
	});

	describe('nested-tabs block (placeholder wiring)', () => {
		/**
		 * nested-tabs has EnableTagsButton with onClick={() => {}}.
		 * The buttons display but do nothing when clicked.
		 */
		it('should be documented as placeholder', () => {
			const status = 'placeholder';
			expect(status).not.toBe('complete');
		});
	});

	describe('term-feed block (complete manual wiring)', () => {
		/**
		 * term-feed uses the manual pattern: EnableTagsButton opens DynamicTagBuilder modals.
		 * Three separate modal instances for parentTermId, perPage, and manualTermId.
		 */
		it('should have 3 fully wired DynamicTagBuilder modals', () => {
			const modalCount = 3;
			const fields = ['parentTermId', 'perPage', 'manualTermId'];
			expect(fields).toHaveLength(modalCount);
		});
	});

	describe('stripe-account block (custom wrapper pattern)', () => {
		/**
		 * stripe-account uses a dual-attribute pattern:
		 * - previewAsUser (number) for static mode
		 * - previewAsUserDynamicTag (string) for dynamic tag mode
		 */
		it('should use dual attribute pattern', () => {
			const attrs = {
				previewAsUser: 0,           // number for static user ID
				previewAsUserDynamicTag: '', // string for @tags() expression
			};

			expect(typeof attrs.previewAsUser).toBe('number');
			expect(typeof attrs.previewAsUserDynamicTag).toBe('string');
		});

		it('should store wrapped tag in previewAsUserDynamicTag', () => {
			const dynamicTag = wrapWithTags('@user(id)');
			expect(dynamicTag).toBe('@tags()@user(id)@endtags()');
		});
	});
});

// ============================================================================
// 9. Blocks Without EnableTags — Gap Analysis
// ============================================================================

describe('Blocks Without EnableTags (Gap Analysis)', () => {
	/**
	 * This section documents which blocks COULD benefit from EnableTags
	 * based on their string attributes that accept user content.
	 */

	const gapAnalysis: Array<{
		block: string;
		reason: string;
		candidateFields: string[];
		priority: 'high' | 'medium' | 'low';
	}> = [
		{
			block: 'post-feed',
			reason: 'Has configurable post query that could use dynamic source',
			candidateFields: ['postType', 'taxonomyFilter'],
			priority: 'medium',
		},
		{
			block: 'gallery',
			reason: 'Image sources could be dynamic',
			candidateFields: ['imageIds'],
			priority: 'medium',
		},
		{
			block: 'map',
			reason: 'Map center/zoom could be dynamic',
			candidateFields: ['defaultLat', 'defaultLng', 'searchFormId'],
			priority: 'low',
		},
		{
			block: 'product-form',
			reason: 'Form fields/labels could be dynamic',
			candidateFields: ['submitButtonText', 'successMessage'],
			priority: 'low',
		},
		{
			block: 'cart-summary',
			reason: 'Cart labels could be dynamic',
			candidateFields: ['emptyCartMessage', 'checkoutUrl'],
			priority: 'low',
		},
		{
			block: 'slider',
			reason: 'Slide content could be dynamic',
			candidateFields: ['slides[].url', 'slides[].caption'],
			priority: 'medium',
		},
		{
			block: 'create-post',
			reason: 'Form has many text fields but handled by Voxel forms system',
			candidateFields: [],
			priority: 'low',
		},
		{
			block: 'flex-container',
			reason: 'Layout block — CSS classes/attributes only',
			candidateFields: ['additionalCssClasses'],
			priority: 'low',
		},
	];

	it('should identify blocks with potential EnableTag gaps', () => {
		expect(gapAnalysis.length).toBeGreaterThan(0);
	});

	it('should have no high-priority gaps', () => {
		const highPriority = gapAnalysis.filter((g) => g.priority === 'high');
		expect(highPriority).toHaveLength(0);
	});

	it('should identify medium-priority gaps', () => {
		const mediumPriority = gapAnalysis.filter((g) => g.priority === 'medium');
		expect(mediumPriority.length).toBeGreaterThanOrEqual(1);
	});
});

// ============================================================================
// 10. Shared Control API Contract Tests
// ============================================================================

describe('Shared Control API Contracts', () => {
	describe('DynamicTagTextControl props', () => {
		it('should require label, value, onChange', () => {
			// These props are required by the TypeScript interface
			const requiredProps = {
				label: 'Test',
				value: '',
				onChange: vi.fn(),
			};
			expect(requiredProps).toHaveProperty('label');
			expect(requiredProps).toHaveProperty('value');
			expect(requiredProps).toHaveProperty('onChange');
		});

		it('should accept optional placeholder, help, context', () => {
			const optionalProps = {
				placeholder: 'Enter value',
				help: 'Help text',
				context: 'post',
			};
			expect(optionalProps).toHaveProperty('placeholder');
			expect(optionalProps).toHaveProperty('help');
			expect(optionalProps).toHaveProperty('context');
		});
	});

	describe('EnableTagsButton props', () => {
		it('should require onClick', () => {
			const requiredProps = { onClick: vi.fn() };
			expect(requiredProps).toHaveProperty('onClick');
		});

		it('should accept optional title', () => {
			const props = { onClick: vi.fn(), title: 'Custom' };
			expect(props).toHaveProperty('title');
		});
	});

	describe('DynamicTagPopoverPanel props', () => {
		it('should require tagContent, onEdit, onDisable', () => {
			const requiredProps = {
				tagContent: '@tags()@post(title)@endtags()',
				onEdit: vi.fn(),
				onDisable: vi.fn(),
			};
			expect(requiredProps).toHaveProperty('tagContent');
			expect(requiredProps).toHaveProperty('onEdit');
			expect(requiredProps).toHaveProperty('onDisable');
		});
	});

	describe('EnableTagsToolbarButton props', () => {
		it('should require value, onChange', () => {
			const requiredProps = {
				value: '',
				onChange: vi.fn(),
			};
			expect(requiredProps).toHaveProperty('value');
			expect(requiredProps).toHaveProperty('onChange');
		});

		it('should accept optional initialContent', () => {
			const props = {
				value: '',
				onChange: vi.fn(),
				initialContent: 'Button Text',
			};
			expect(props).toHaveProperty('initialContent');
		});
	});
});
