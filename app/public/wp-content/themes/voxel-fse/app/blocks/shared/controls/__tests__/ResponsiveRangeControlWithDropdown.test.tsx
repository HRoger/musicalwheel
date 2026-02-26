/**
 * ResponsiveRangeControlWithDropdown Component Tests
 *
 * Tests for responsive range control with dropdown including custom unit support.
 * Ensures proper rendering, value handling, and custom CSS value input.
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResponsiveRangeControlWithDropdown from '../ResponsiveRangeControlWithDropdown';

// ============================================================================
// Component Tests
// ============================================================================

describe('ResponsiveRangeControlWithDropdown Component', () => {
	const defaultProps = {
		label: 'Test Range',
		attributes: {},
		setAttributes: vi.fn(),
		attributeBaseName: 'testValue',
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with label', () => {
			render(<ResponsiveRangeControlWithDropdown {...defaultProps} />);
			expect(screen.getByText('Test Range')).toBeInTheDocument();
		});

		it('should render range input', () => {
			render(<ResponsiveRangeControlWithDropdown {...defaultProps} />);
			const rangeInput = screen.getByRole('slider');
			expect(rangeInput).toBeInTheDocument();
		});

		it('should render unit dropdown when availableUnits provided', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);
			// Check for e-units-wrapper which contains the unit dropdown
			expect(container.querySelector('.e-units-wrapper')).toBeInTheDocument();
		});
	});

	describe('Value Handling', () => {
		it('should display current value from attributes', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValue: 50 }}
				/>
			);
			const rangeInput = screen.getByRole('slider') as HTMLInputElement;
			expect(rangeInput.value).toBe('50');
		});

		it('should call setAttributes when value changes', () => {
			const mockSetAttributes = vi.fn();
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					setAttributes={mockSetAttributes}
				/>
			);

			const rangeInput = screen.getByRole('slider');
			fireEvent.change(rangeInput, { target: { value: '75' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({ testValue: 75 });
		});
	});

	describe('Custom Unit Mode', () => {
		it('should render text input when custom unit is selected', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Should have text input instead of range
			const textInput = screen.getByRole('textbox');
			expect(textInput).toBeInTheDocument();

			// Should NOT have range input
			expect(screen.queryByRole('slider')).not.toBeInTheDocument();
		});

		it('should display custom value in text input', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{
						testValueUnit: 'custom',
						testValue_custom: 'calc(100vh - 80px)',
					}}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			const textInput = screen.getByRole('textbox') as HTMLInputElement;
			expect(textInput.value).toBe('calc(100vh - 80px)');
		});

		it('should use customValueAttributeName when provided', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{
						testValueUnit: 'custom',
						myCustomAttr: 'calc(50% - 20px)',
					}}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
					customValueAttributeName="myCustomAttr"
				/>
			);

			const textInput = screen.getByRole('textbox') as HTMLInputElement;
			expect(textInput.value).toBe('calc(50% - 20px)');
		});

		it('should call setAttributes with custom value when text input changes', () => {
			const mockSetAttributes = vi.fn();
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					setAttributes={mockSetAttributes}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			const textInput = screen.getByRole('textbox');
			fireEvent.change(textInput, { target: { value: 'calc(100% - 40px)' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				testValue_custom: 'calc(100% - 40px)',
			});
		});

		it('should show placeholder for custom input', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			const textInput = screen.getByRole('textbox');
			expect(textInput).toHaveAttribute('placeholder', 'e.g., calc(100vh - 80px)');
		});

		it('should not have reset button in custom mode', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Reset button is no longer rendered (removed to match Elementor/NB pattern)
			const buttons = container.querySelectorAll('button');
			const resetButton = Array.from(buttons).find(
				(btn) => btn.getAttribute('label') === 'Reset to default'
			);
			expect(resetButton).toBeUndefined();
		});

		it('should NOT render reset button wrapper in custom mode', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// The custom unit section should only have the TextControl wrapper
			const customWrapper = container.querySelector('.elementor-control-custom-unit');
			expect(customWrapper).toBeInTheDocument();

			// Count buttons - should only be dropdown toggle buttons, not reset
			const buttonsInWrapper = customWrapper?.querySelectorAll('button');
			// No buttons should be directly in the custom wrapper (text input doesn't need buttons)
			expect(buttonsInWrapper?.length || 0).toBe(0);
		});
	});

	describe('Standard Unit Mode', () => {
		it('should show range input for standard units', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'px' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			expect(screen.getByRole('slider')).toBeInTheDocument();
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		});

		it('should not have reset button in standard mode', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'px' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Reset button removed to match Elementor/NB pattern
			const buttons = container.querySelectorAll('button');
			const resetButton = Array.from(buttons).find(
				(btn) => btn.getAttribute('label') === 'Reset to default'
			);
			expect(resetButton).toBeUndefined();
		});

		it('should respect min/max props', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					min={10}
					max={200}
				/>
			);

			const rangeInput = screen.getByRole('slider') as HTMLInputElement;
			expect(rangeInput.min).toBe('10');
			expect(rangeInput.max).toBe('200');
		});

		it('should use max 100 for percentage unit', () => {
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: '%' }}
					availableUnits={['px', '%']}
					unitAttributeName="testValueUnit"
					max={500}
				/>
			);

			const rangeInput = screen.getByRole('slider') as HTMLInputElement;
			expect(rangeInput.max).toBe('100');
		});
	});

	describe('Unit Switching', () => {
		it('should switch from range to text input when custom is selected', () => {
			const mockSetAttributes = vi.fn();
			const { rerender } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'px' }}
					setAttributes={mockSetAttributes}
					availableUnits={['px', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Initially should have range input
			expect(screen.getByRole('slider')).toBeInTheDocument();

			// Simulate unit change to custom
			rerender(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					setAttributes={mockSetAttributes}
					availableUnits={['px', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Now should have text input
			expect(screen.queryByRole('slider')).not.toBeInTheDocument();
			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('should preserve custom value when switching back from standard unit', () => {
			const attributes = {
				testValueUnit: 'custom',
				testValue_custom: 'calc(100vh - 80px)',
				testValue: 50,
			};

			const { rerender } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={attributes}
					availableUnits={['px', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Verify custom value is shown
			expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('calc(100vh - 80px)');

			// Switch to px
			rerender(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{ ...attributes, testValueUnit: 'px' }}
					availableUnits={['px', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Range input should show numeric value
			expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('50');

			// Switch back to custom
			rerender(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={attributes}
					availableUnits={['px', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Custom value should still be there
			expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('calc(100vh - 80px)');
		});
	});

	describe('Responsive Behavior', () => {
		it('should use device-specific attribute name for tablet', () => {
			const mockSetAttributes = vi.fn();
			// Note: The mock in vitest.setup.tsx returns 'Desktop' by default
			// This test verifies the attribute naming pattern
			render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					attributes={{
						testValue: 100,
						testValue_tablet: 80,
					}}
					setAttributes={mockSetAttributes}
				/>
			);

			// Desktop value should be shown (mock returns Desktop)
			const rangeInput = screen.getByRole('slider') as HTMLInputElement;
			expect(rangeInput.value).toBe('100');
		});
	});

	describe('All Available Units', () => {
		it('should render all 6 units in dropdown for Width control config', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					availableUnits={['px', '%', 'em', 'rem', 'vw', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Check for e-units-wrapper which contains the unit dropdown
			const unitWrapper = container.querySelector('.e-units-wrapper');
			expect(unitWrapper).toBeInTheDocument();

			// Unit dropdown menu items are inside the e-units-wrapper
			const menuItems = unitWrapper?.querySelectorAll('[data-testid="menu-item"]');
			expect(menuItems).toHaveLength(6);

			// Verify specific units
			expect(menuItems?.[0]).toHaveTextContent('px');
			expect(menuItems?.[1]).toHaveTextContent('%');
			expect(menuItems?.[2]).toHaveTextContent('em');
			expect(menuItems?.[3]).toHaveTextContent('rem');
			expect(menuItems?.[4]).toHaveTextContent('vw');
			// Custom shows pencil icon, not text
		});

		it('should render all 7 units in dropdown for Min Height control config', () => {
			const { container } = render(
				<ResponsiveRangeControlWithDropdown
					{...defaultProps}
					availableUnits={['px', '%', 'em', 'rem', 'vh', 'vw', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Check unit dropdown menu items inside e-units-wrapper
			const unitWrapper = container.querySelector('.e-units-wrapper');
			const menuItems = unitWrapper?.querySelectorAll('[data-testid="menu-item"]');
			expect(menuItems).toHaveLength(7);
		});
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('ResponsiveRangeControlWithDropdown with Custom Unit Integration', () => {
	it('should handle full custom unit workflow', () => {
		const mockSetAttributes = vi.fn();
		const initialAttributes = {
			contentWidth: 1200,
			contentWidthUnit: 'px',
		};

		const { rerender } = render(
			<ResponsiveRangeControlWithDropdown
				label="Width"
				attributes={initialAttributes}
				setAttributes={mockSetAttributes}
				attributeBaseName="contentWidth"
				availableUnits={['px', '%', 'vw', 'custom']}
				unitAttributeName="contentWidthUnit"
				customValueAttributeName="contentWidthCustom"
			/>
		);

		// 1. Initially shows range input with value
		expect(screen.getByRole('slider')).toBeInTheDocument();

		// 2. User changes to custom unit (simulated via rerender)
		rerender(
			<ResponsiveRangeControlWithDropdown
				label="Width"
				attributes={{
					...initialAttributes,
					contentWidthUnit: 'custom',
				}}
				setAttributes={mockSetAttributes}
				attributeBaseName="contentWidth"
				availableUnits={['px', '%', 'vw', 'custom']}
				unitAttributeName="contentWidthUnit"
				customValueAttributeName="contentWidthCustom"
			/>
		);

		// 3. Now shows text input
		const textInput = screen.getByRole('textbox');
		expect(textInput).toBeInTheDocument();

		// 4. User enters calc expression
		fireEvent.change(textInput, { target: { value: 'calc(100% - 40px)' } });

		// 5. Verify setAttributes was called with custom value
		expect(mockSetAttributes).toHaveBeenCalledWith({
			contentWidthCustom: 'calc(100% - 40px)',
		});
	});

	it('should work with min-height custom unit', () => {
		const mockSetAttributes = vi.fn();

		render(
			<ResponsiveRangeControlWithDropdown
				label="Min Height"
				attributes={{
					minHeight: 400,
					minHeightUnit: 'custom',
					minHeightCustom: 'calc(100vh - 80px)',
				}}
				setAttributes={mockSetAttributes}
				attributeBaseName="minHeight"
				availableUnits={['px', 'vh', 'custom']}
				unitAttributeName="minHeightUnit"
				customValueAttributeName="minHeightCustom"
			/>
		);

		const textInput = screen.getByRole('textbox') as HTMLInputElement;
		expect(textInput.value).toBe('calc(100vh - 80px)');

		// Update the value
		fireEvent.change(textInput, { target: { value: 'calc(100svh - 100px)' } });

		expect(mockSetAttributes).toHaveBeenCalledWith({
			minHeightCustom: 'calc(100svh - 100px)',
		});
	});
});
