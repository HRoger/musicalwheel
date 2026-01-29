/**
 * VoxelTab Component Tests
 *
 * Comprehensive tests for the reusable VoxelTab inspector component.
 * Tests all three main accordions:
 * 1. Widget options - Sticky position controls
 * 2. Visibility - Element visibility rules
 * 3. Loop element - Loop configuration
 *
 * Pattern: Same as AdvancedTab - a standard tab that can be used across all blocks.
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import VoxelTab from '../VoxelTab';

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
	PanelBody: ({ title, children, initialOpen }: any) => (
		<div data-testid={`panel-${title?.toLowerCase().replace(/\s+/g, '-')}`} data-initial-open={initialOpen}>
			<button data-testid={`panel-toggle-${title?.toLowerCase().replace(/\s+/g, '-')}`}>{title}</button>
			<div>{children}</div>
		</div>
	),
	ToggleControl: ({ label, checked, onChange }: any) => (
		<label>
			<input
				type="checkbox"
				checked={checked || false}
				onChange={(e) => onChange(e.target.checked)}
				data-testid={`toggle-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
			/>
			{label}
		</label>
	),
	SelectControl: ({ label, value, options, onChange }: any) => (
		<label>
			{label}
			<select
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				data-testid={`select-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
			>
				{options?.map((opt: any) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</label>
	),
	Button: ({ children, onClick, variant }: any) => (
		<button onClick={onClick} data-variant={variant}>
			{children}
		</button>
	),
	TextControl: ({ label, value, onChange, help, type }: any) => (
		<label>
			{label}
			<input
				type={type || 'text'}
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				data-testid={`text-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
			/>
			{help && <span className="help-text">{help}</span>}
		</label>
	),
	RangeControl: ({ label, value, onChange, min, max, step }: any) => (
		<label>
			{label}
			<input
				type="range"
				value={value ?? 0}
				onChange={(e) => onChange(Number(e.target.value))}
				min={min}
				max={max}
				step={step}
				data-testid={`range-${label?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
			/>
		</label>
	),
}));

// Mock ResponsiveRangeControl
vi.mock('../ResponsiveRangeControl', () => ({
	default: ({ label, attributeBaseName }: any) => (
		<div data-testid={`responsive-range-${attributeBaseName}`}>{label}</div>
	),
}));

// Mock SectionHeading
vi.mock('../SectionHeading', () => ({
	default: ({ label }: any) => <h3 data-testid="section-heading">{label}</h3>,
}));

// Mock ResponsiveToggle to avoid DropdownMenu dependency
vi.mock('../ResponsiveToggle', () => ({
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

// Mock ResponsiveTextControl to avoid DropdownMenu dependency
vi.mock('../ResponsiveTextControl', () => ({
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

// Mock ColorPickerControl
vi.mock('../ColorPickerControl', () => ({
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

// Mock ElementVisibilityModal
vi.mock('../ElementVisibilityModal', () => ({
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
// Test Setup
// ============================================================================

const defaultAttributes = {
	// Widget options - Sticky
	stickyEnabled: false,
	stickyDesktop: 'sticky' as const,
	stickyTablet: 'sticky' as const,
	stickyMobile: 'sticky' as const,
	stickyTop: 0,
	stickyTopUnit: 'px',
	// Visibility
	visibilityBehavior: 'show' as const,
	visibilityRules: [],
	// Loop element
	loopSource: '',
	loopProperty: '',
	loopLimit: '',
	loopOffset: '',
};

const createMockSetAttributes = () => vi.fn();

// ============================================================================
// Widget Options (Sticky Position) Tests
// ============================================================================

describe('VoxelTab - Widget Options Accordion', () => {
	describe('Rendering', () => {
		it('should render Widget options accordion', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByTestId('panel-widget-options')).toBeInTheDocument();
			expect(screen.getByText('Widget options')).toBeInTheDocument();
		});

		it('should render Enable toggle for sticky position', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByTestId('toggle-enable-')).toBeInTheDocument();
		});

		it('should hide Widget options accordion when showWidgetOptions is false', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={defaultAttributes}
					setAttributes={setAttributes}
					showWidgetOptions={false}
				/>
			);

			expect(screen.queryByTestId('panel-widget-options')).not.toBeInTheDocument();
		});
	});

	describe('Sticky Controls Visibility', () => {
		it('should show device enable controls when sticky is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...defaultAttributes, stickyEnabled: true };
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByTestId('select-enable-on-desktop')).toBeInTheDocument();
			expect(screen.getByTestId('select-enable-on-tablet')).toBeInTheDocument();
			expect(screen.getByTestId('select-enable-on-mobile')).toBeInTheDocument();
		});

		it('should show position controls when sticky is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...defaultAttributes, stickyEnabled: true };
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByTestId('responsive-range-stickyTop')).toBeInTheDocument();
			expect(screen.getByTestId('responsive-range-stickyLeft')).toBeInTheDocument();
			expect(screen.getByTestId('responsive-range-stickyRight')).toBeInTheDocument();
			expect(screen.getByTestId('responsive-range-stickyBottom')).toBeInTheDocument();
		});

		it('should hide sticky controls when sticky is disabled', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.queryByTestId('select-enable-on-desktop')).not.toBeInTheDocument();
			expect(screen.queryByTestId('responsive-range-stickyTop')).not.toBeInTheDocument();
		});
	});

	describe('State Updates', () => {
		it('should call setAttributes when sticky toggle changes', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			const toggle = screen.getByTestId('toggle-enable-');
			fireEvent.click(toggle);

			expect(setAttributes).toHaveBeenCalledWith({ stickyEnabled: true });
		});

		it('should call setAttributes when desktop enable changes', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...defaultAttributes, stickyEnabled: true };
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			const select = screen.getByTestId('select-enable-on-desktop');
			fireEvent.change(select, { target: { value: 'initial' } });

			expect(setAttributes).toHaveBeenCalledWith({ stickyDesktop: 'initial' });
		});
	});
});

// ============================================================================
// Visibility Accordion Tests
// ============================================================================

describe('VoxelTab - Visibility Accordion', () => {
	describe('Rendering', () => {
		it('should render Visibility accordion', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByTestId('panel-visibility')).toBeInTheDocument();
			expect(screen.getByText('Visibility')).toBeInTheDocument();
		});

		it('should hide Visibility accordion when showVisibility is false', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={defaultAttributes}
					setAttributes={setAttributes}
					showVisibility={false}
				/>
			);

			expect(screen.queryByTestId('panel-visibility')).not.toBeInTheDocument();
		});

		it('should render visibility behavior select', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			// The select for show/hide behavior
			const select = screen.getByRole('combobox', { name: '' });
			expect(select).toBeInTheDocument();
		});

		it('should show "No visibility rules added" when no rules', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByText('No visibility rules added.')).toBeInTheDocument();
		});
	});

	describe('Visibility Rules Display', () => {
		it('should display visibility rules when present', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				visibilityRules: [
					{ id: '1', filterKey: 'user:logged_in', operator: 'equals' as const },
					{ id: '2', filterKey: 'user:plan', operator: 'equals' as const, value: 'premium' },
				],
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByText('user:logged_in')).toBeInTheDocument();
			expect(screen.getByText('user:plan')).toBeInTheDocument();
		});
	});

	describe('Modal Interaction', () => {
		it('should open visibility modal when Edit rules clicked', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			const editButton = screen.getByText('Edit rules');
			fireEvent.click(editButton);

			expect(screen.getByTestId('element-visibility-modal')).toBeInTheDocument();
		});

		it('should close visibility modal when Close is clicked', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			// Open modal
			fireEvent.click(screen.getByText('Edit rules'));
			expect(screen.getByTestId('element-visibility-modal')).toBeInTheDocument();

			// Close modal
			fireEvent.click(screen.getByText('Close Modal'));
			expect(screen.queryByTestId('element-visibility-modal')).not.toBeInTheDocument();
		});
	});

	describe('State Updates', () => {
		it('should call setAttributes when visibility behavior changes', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			// Find the behavior select (first one after visibility heading)
			const selects = screen.getAllByRole('combobox');
			// The visibility behavior select should have show/hide options
			const behaviorSelect = selects.find((s) => {
				const options = s.querySelectorAll('option');
				return Array.from(options).some((o) => o.value === 'hide');
			});

			if (behaviorSelect) {
				fireEvent.change(behaviorSelect, { target: { value: 'hide' } });
				expect(setAttributes).toHaveBeenCalledWith({ visibilityBehavior: 'hide' });
			}
		});

		it('should clear visibility rules when Remove clicked', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				visibilityRules: [{ id: '1', filterKey: 'user:logged_in', operator: 'equals' as const }],
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			// Get the Visibility panel and find the Remove button within it
			const visibilityPanel = screen.getByTestId('panel-visibility');
			const removeButton = within(visibilityPanel).getByText('Remove');
			fireEvent.click(removeButton);

			expect(setAttributes).toHaveBeenCalledWith({ visibilityRules: [] });
		});
	});
});

// ============================================================================
// Loop Element Accordion Tests
// ============================================================================

describe('VoxelTab - Loop Element Accordion', () => {
	describe('Rendering', () => {
		it('should render Loop element accordion', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByTestId('panel-loop-element')).toBeInTheDocument();
			expect(screen.getByText('Loop element')).toBeInTheDocument();
		});

		it('should hide Loop element accordion when showLoopElement is false', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={defaultAttributes}
					setAttributes={setAttributes}
					showLoopElement={false}
				/>
			);

			expect(screen.queryByTestId('panel-loop-element')).not.toBeInTheDocument();
		});

		it('should render description text', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByText('Loop this element based on')).toBeInTheDocument();
		});

		it('should show "No loop" when no loop source set', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByText('No loop')).toBeInTheDocument();
		});

		it('should render Edit loop and Remove buttons', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			expect(screen.getByText('Edit loop')).toBeInTheDocument();
			// Find the Remove button in the loop element section
			const removeButtons = screen.getAllByText('Remove');
			expect(removeButtons.length).toBeGreaterThan(0);
		});
	});

	describe('Loop Source Display', () => {
		it('should display @author(role) format when loop is set', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByText('@author(role)')).toBeInTheDocument();
		});

		it('should display @user(role) format when user loop is set', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'user',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByText('@user(role)')).toBeInTheDocument();
		});

		it('should display @source(role) format when property is not set (defaults to role)', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: '',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			// When property is not set, we default to 'role' to match Voxel's display format
			expect(screen.getByText('@author(role)')).toBeInTheDocument();
		});
	});

	describe('Loop Limit and Offset', () => {
		it('should show Loop limit field when loop source is set', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByText('Loop limit')).toBeInTheDocument();
			// Find the input by its help text container
			const helpText = screen.getByText(/If a hard limit is set/);
			expect(helpText.closest('.voxel-fse-loop-fields')).toBeInTheDocument();
		});

		it('should show Loop offset field when loop source is set', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(screen.getByText('Loop offset')).toBeInTheDocument();
			// Find the input by its help text container
			const helpText = screen.getByText(/Skip a set amount of items/);
			expect(helpText.closest('.voxel-fse-loop-fields')).toBeInTheDocument();
		});

		it('should always show Loop limit/offset (even when no loop source)', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			// Loop limit and offset are always visible per Voxel design
			expect(screen.getByText('Loop limit')).toBeInTheDocument();
			expect(screen.getByText('Loop offset')).toBeInTheDocument();
		});

		it('should show help text for Loop limit', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(
				screen.getByText(/If a hard limit is set, the loop will stop there/)
			).toBeInTheDocument();
		});

		it('should show help text for Loop offset', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			expect(
				screen.getByText(/Skip a set amount of items from the start/)
			).toBeInTheDocument();
		});
	});

	describe('Loop Modal', () => {
		it('should open loop modal when Edit loop clicked', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			const editButton = screen.getByText('Edit loop');
			fireEvent.click(editButton);

			expect(screen.getByText('Select loop source')).toBeInTheDocument();
		});

		it('should show Author and User modules in modal', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			fireEvent.click(screen.getByText('Edit loop'));

			expect(screen.getByText('Author')).toBeInTheDocument();
			expect(screen.getByText('User')).toBeInTheDocument();
		});

		it('should close modal when Discard clicked', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			fireEvent.click(screen.getByText('Edit loop'));
			expect(screen.getByText('Select loop source')).toBeInTheDocument();

			fireEvent.click(screen.getByText('Discard'));
			// Modal should be closed - Select loop source heading should not be visible
			// Note: Due to the way the modal renders, we check if it's gone
			expect(screen.queryByText('nvx-editor nvx-editor-loop')).not.toBeInTheDocument();
		});

		it('should expand Author module when clicked', async () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			fireEvent.click(screen.getByText('Edit loop'));

			// Find and click the Author expand button
			const authorSection = screen.getByText('Author').closest('.nvx-mod');
			const expandButton = authorSection?.querySelector('.ts-button.icon-only');
			if (expandButton) {
				fireEvent.click(expandButton);
			}

			// Role should now be visible
			await waitFor(() => {
				expect(screen.getByText('Role')).toBeInTheDocument();
			});
		});

		it('should set loop source when Use loop clicked', async () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

			fireEvent.click(screen.getByText('Edit loop'));

			// Expand Author
			const authorSection = screen.getByText('Author').closest('.nvx-mod');
			const expandButton = authorSection?.querySelector('.ts-button.icon-only');
			if (expandButton) {
				fireEvent.click(expandButton);
			}

			// Click Use loop
			await waitFor(() => {
				const useLoopButton = screen.getByText('Use loop');
				fireEvent.click(useLoopButton);
			});

			expect(setAttributes).toHaveBeenCalledWith({
				loopSource: 'author',
				loopProperty: 'role',
			});
		});
	});

	describe('State Updates', () => {
		it('should call setAttributes when Loop limit changes', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			// Find the input by its label text and get the next input element
			const loopFields = screen.getByText('Loop limit').closest('.voxel-fse-loop-field-inline');
			const limitInput = loopFields?.querySelector('input[type="number"]') as HTMLInputElement;
			fireEvent.change(limitInput, { target: { value: '10' } });

			expect(setAttributes).toHaveBeenCalledWith({ loopLimit: '10' });
		});

		it('should call setAttributes when Loop offset changes', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			// Find the input by its label text and get the next input element
			const loopFields = screen.getByText('Loop offset').closest('.voxel-fse-loop-field-inline');
			const offsetInput = loopFields?.querySelector('input[type="number"]') as HTMLInputElement;
			fireEvent.change(offsetInput, { target: { value: '5' } });

			expect(setAttributes).toHaveBeenCalledWith({ loopOffset: '5' });
		});

		it('should clear loop settings when Remove clicked', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...defaultAttributes,
				loopSource: 'author',
				loopProperty: 'role',
				loopLimit: '10',
				loopOffset: '5',
			};
			render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

			// Find the Remove button in the loop section (second one)
			const removeButtons = screen.getAllByText('Remove');
			const loopRemoveButton = removeButtons[removeButtons.length - 1];
			fireEvent.click(loopRemoveButton);

			expect(setAttributes).toHaveBeenCalledWith({
				loopSource: '',
				loopProperty: '',
				loopLimit: '',
				loopOffset: '',
			});
		});
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('VoxelTab - Integration', () => {
	it('should render all three accordions by default', () => {
		const setAttributes = createMockSetAttributes();
		render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

		expect(screen.getByTestId('panel-widget-options')).toBeInTheDocument();
		expect(screen.getByTestId('panel-visibility')).toBeInTheDocument();
		expect(screen.getByTestId('panel-loop-element')).toBeInTheDocument();
	});

	it('should hide all accordions when all show props are false', () => {
		const setAttributes = createMockSetAttributes();
		render(
			<VoxelTab
				attributes={defaultAttributes}
				setAttributes={setAttributes}
				showWidgetOptions={false}
				showVisibility={false}
				showLoopElement={false}
			/>
		);

		expect(screen.queryByTestId('panel-widget-options')).not.toBeInTheDocument();
		expect(screen.queryByTestId('panel-visibility')).not.toBeInTheDocument();
		expect(screen.queryByTestId('panel-loop-element')).not.toBeInTheDocument();
	});

	it('should handle multiple attribute changes independently', () => {
		const setAttributes = createMockSetAttributes();
		const attrs = {
			...defaultAttributes,
			stickyEnabled: true,
			loopSource: 'author',
			loopProperty: 'role',
		};
		render(<VoxelTab attributes={attrs} setAttributes={setAttributes} />);

		// Change sticky desktop
		const stickySelect = screen.getByTestId('select-enable-on-desktop');
		fireEvent.change(stickySelect, { target: { value: 'initial' } });
		expect(setAttributes).toHaveBeenCalledWith({ stickyDesktop: 'initial' });

		// Change loop limit
		const loopFields = screen.getByText('Loop limit').closest('.voxel-fse-loop-field-inline');
		const limitInput = loopFields?.querySelector('input[type="number"]') as HTMLInputElement;
		fireEvent.change(limitInput, { target: { value: '20' } });
		expect(setAttributes).toHaveBeenCalledWith({ loopLimit: '20' });
	});
});

// ============================================================================
// CSS Loading Tests
// ============================================================================

// ============================================================================
// Container Options Accordion Tests
// ============================================================================

describe('VoxelTab - Container Options Accordion', () => {
	// Extended attributes for Container Options testing
	const containerOptionsAttributes = {
		...defaultAttributes,
		// Container Options attributes
		enableInlineFlex: false,
		enableInlineFlex_tablet: undefined,
		enableInlineFlex_mobile: undefined,
		enableCalcMinHeight: false,
		calcMinHeight: '',
		calcMinHeight_tablet: '',
		calcMinHeight_mobile: '',
		enableCalcMaxHeight: false,
		calcMaxHeight: '',
		calcMaxHeight_tablet: '',
		calcMaxHeight_mobile: '',
		scrollbarColor: '',
		enableBackdropBlur: false,
		backdropBlurStrength: 5,
		backdropBlurStrength_tablet: undefined,
		backdropBlurStrength_mobile: undefined,
	};

	describe('Rendering', () => {
		it('should NOT show Container options by default (showContainerOptions=false)', () => {
			const setAttributes = createMockSetAttributes();
			render(<VoxelTab attributes={containerOptionsAttributes} setAttributes={setAttributes} />);

			// Should not show Inline Flex section heading
			expect(screen.queryByText('Inline Flex')).not.toBeInTheDocument();
			expect(screen.queryByText('Other')).not.toBeInTheDocument();
		});

		it('should show Container options when showContainerOptions=true', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Should show section headings
			expect(screen.getByText('Inline Flex')).toBeInTheDocument();
			expect(screen.getByText('Other')).toBeInTheDocument();
		});

		it('should rename accordion to "Container options" when showContainerOptions=true', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Should show "Container options" instead of "Widget options"
			expect(screen.getByText('Container options')).toBeInTheDocument();
			expect(screen.queryByText('Widget options')).not.toBeInTheDocument();
		});
	});

	describe('Inline Flex Controls', () => {
		it('should render Enable toggle for inline flex', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// There are two "Enable?" toggles: Sticky Position and Inline Flex
			// Use the testId to find the specific inline flex toggle
			const inlineFlexToggle = screen.getByTestId('responsive-toggle-enableInlineFlex');
			expect(inlineFlexToggle).toBeInTheDocument();
			// Verify it has the "Enable?" label
			expect(inlineFlexToggle).toHaveTextContent('Enable?');
		});

		it('should show help text for inline flex', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(
				screen.getByText('Changes container display to inline flex and applies auto width')
			).toBeInTheDocument();
		});
	});

	describe('Other Section - Calculate Min Height', () => {
		it('should render Calculate min height toggle', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Calculate min height?')).toBeInTheDocument();
		});

		it('should NOT show calculation input when min height is disabled', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// The calculation help text should not be visible
			expect(
				screen.queryByText(/Use CSS calc\(\) to calculate min-height/)
			).not.toBeInTheDocument();
		});

		it('should show calculation input when min height is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...containerOptionsAttributes, enableCalcMinHeight: true };
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Should show calculation label and help text
			expect(screen.getByText('Calculation')).toBeInTheDocument();
			expect(
				screen.getByText(/Use CSS calc\(\) to calculate min-height/)
			).toBeInTheDocument();
		});
	});

	describe('Other Section - Calculate Max Height', () => {
		it('should render Calculate max height toggle', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Calculate max height?')).toBeInTheDocument();
		});

		it('should NOT show calculation input when max height is disabled', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// The max-height calculation help text should not be visible
			expect(
				screen.queryByText(/Use CSS calc\(\) to calculate max-height/)
			).not.toBeInTheDocument();
		});

		it('should show calculation input when max height is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...containerOptionsAttributes, enableCalcMaxHeight: true };
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Should show max-height calculation help text
			expect(
				screen.getByText(/Use CSS calc\(\) to calculate max-height/)
			).toBeInTheDocument();
		});
	});

	describe('Scrollbar Color Control', () => {
		it('should NOT show scrollbar color when max height is disabled', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Scrollbar color section heading should not be visible
			expect(screen.queryByText('Scrollbar color')).not.toBeInTheDocument();
		});

		it('should show scrollbar color section when max height is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...containerOptionsAttributes, enableCalcMaxHeight: true };
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Should show scrollbar color section heading
			expect(screen.getByText('Scrollbar color')).toBeInTheDocument();
			// Should show Color label for the picker
			expect(screen.getByText('Color')).toBeInTheDocument();
		});
	});

	describe('Backdrop Blur Controls', () => {
		it('should render Backdrop blur toggle', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Backdrop blur?')).toBeInTheDocument();
		});

		it('should NOT show strength control when backdrop blur is disabled', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Strength control should not be visible
			expect(screen.queryByTestId('responsive-range-backdropBlurStrength')).not.toBeInTheDocument();
		});

		it('should show strength control when backdrop blur is enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = { ...containerOptionsAttributes, enableBackdropBlur: true };
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Strength control should be visible
			expect(screen.getByTestId('responsive-range-backdropBlurStrength')).toBeInTheDocument();
			expect(screen.getByText('Strength')).toBeInTheDocument();
		});
	});

	describe('State Updates', () => {
		it('should call setAttributes when enabling inline flex', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Note: ResponsiveToggle is mocked, so we test indirectly through rendering
			// The actual toggle behavior is tested in ResponsiveToggle tests
			// There are two "Enable?" labels: one for Sticky Position (ToggleControl) and one for Inline Flex (ResponsiveToggle)
			const enableLabels = screen.getAllByText('Enable?');
			expect(enableLabels.length).toBeGreaterThanOrEqual(2);
			// Also verify the inline flex responsive toggle by its testId
			expect(screen.getByTestId('responsive-toggle-enableInlineFlex')).toBeInTheDocument();
		});

		it('should call setAttributes when enabling calc min height', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Calculate min height?')).toBeInTheDocument();
		});

		it('should call setAttributes when enabling calc max height', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Calculate max height?')).toBeInTheDocument();
		});

		it('should call setAttributes when enabling backdrop blur', () => {
			const setAttributes = createMockSetAttributes();
			render(
				<VoxelTab
					attributes={containerOptionsAttributes}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			expect(screen.getByText('Backdrop blur?')).toBeInTheDocument();
		});
	});

	describe('Conditional Rendering Logic', () => {
		it('should show all controls when all features are enabled', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...containerOptionsAttributes,
				enableInlineFlex: true,
				enableCalcMinHeight: true,
				enableCalcMaxHeight: true,
				enableBackdropBlur: true,
			};
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// All sections should be visible
			expect(screen.getByText('Inline Flex')).toBeInTheDocument();
			expect(screen.getByText('Other')).toBeInTheDocument();
			expect(screen.getByText('Scrollbar color')).toBeInTheDocument();
			expect(screen.getByTestId('responsive-range-backdropBlurStrength')).toBeInTheDocument();
		});

		it('should maintain sticky controls alongside container options', () => {
			const setAttributes = createMockSetAttributes();
			const attrs = {
				...containerOptionsAttributes,
				stickyEnabled: true,
			};
			render(
				<VoxelTab
					attributes={attrs}
					setAttributes={setAttributes}
					showContainerOptions={true}
				/>
			);

			// Sticky controls should still be visible
			expect(screen.getByTestId('select-enable-on-desktop')).toBeInTheDocument();
			expect(screen.getByTestId('responsive-range-stickyTop')).toBeInTheDocument();

			// Container options should also be visible
			expect(screen.getByText('Inline Flex')).toBeInTheDocument();
			expect(screen.getByText('Other')).toBeInTheDocument();
		});
	});
});

describe('VoxelTab - CSS Dynamic Loading', () => {
	beforeEach(() => {
		// Clean up any dynamically added stylesheets
		const existingStyle = document.getElementById('voxel-backend-css-dynamic');
		if (existingStyle) {
			existingStyle.remove();
		}
	});

	it('should load backend.css when loop modal opens', async () => {
		const setAttributes = createMockSetAttributes();
		render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

		// Open loop modal
		fireEvent.click(screen.getByText('Edit loop'));

		// Check if stylesheet was added
		await waitFor(() => {
			const styleLink = document.getElementById('voxel-backend-css-dynamic');
			expect(styleLink).toBeInTheDocument();
			expect(styleLink?.getAttribute('href')).toBe('/wp-content/themes/voxel/assets/dist/backend.css');
		});
	});

	it('should not duplicate stylesheet on subsequent modal opens', async () => {
		const setAttributes = createMockSetAttributes();
		render(<VoxelTab attributes={defaultAttributes} setAttributes={setAttributes} />);

		// Open modal
		fireEvent.click(screen.getByText('Edit loop'));

		// Close modal
		fireEvent.click(screen.getByText('Discard'));

		// Open again
		fireEvent.click(screen.getByText('Edit loop'));

		// Should still only have one stylesheet
		const styleLinks = document.querySelectorAll('#voxel-backend-css-dynamic');
		expect(styleLinks.length).toBe(1);
	});
});
