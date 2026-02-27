/**
 * ResponsiveRangeControl Component Tests
 *
 * Tests for responsive range control including custom unit support.
 * Ensures proper rendering, value handling, and custom CSS value input.
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResponsiveRangeControl from '../ResponsiveRangeControl';

// ============================================================================
// Component Tests
// ============================================================================

describe('ResponsiveRangeControl Component', () => {
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
			render(<ResponsiveRangeControl {...defaultProps} />);
			expect(screen.getByText('Test Range')).toBeInTheDocument();
		});

		it('should render range input', () => {
			render(<ResponsiveRangeControl {...defaultProps} />);
			const rangeInput = screen.getByRole('slider');
			expect(rangeInput).toBeInTheDocument();
		});

		it('should render unit dropdown when availableUnits provided', () => {
			const { container } = render(
				<ResponsiveRangeControl
					{...defaultProps}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);
			// Check for e-units-wrapper which contains the unit dropdown
			expect(container.querySelector('.e-units-wrapper')).toBeInTheDocument();
		});

		it('should hide header when showHeader is false', () => {
			render(
				<ResponsiveRangeControl
					{...defaultProps}
					showHeader={false}
				/>
			);
			expect(screen.queryByText('Test Range')).not.toBeInTheDocument();
		});
	});

	describe('Value Handling', () => {
		it('should display current value from attributes', () => {
			render(
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			const textInput = screen.getByRole('textbox');
			expect(textInput).toHaveAttribute('placeholder', 'e.g., calc(100vh - 80px)');
		});

		it('should not show reset button in custom mode', () => {
			render(
				<ResponsiveRangeControl
					{...defaultProps}
					attributes={{ testValueUnit: 'custom' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Reset button is no longer rendered (removed to match Elementor/NB pattern)
			const buttons = screen.queryAllByRole('button');
			const resetButton = buttons.find(b => b.getAttribute('label') === 'Reset to default');
			expect(resetButton).toBeUndefined();
		});
	});

	describe('Standard Unit Mode', () => {
		it('should show range input for standard units', () => {
			render(
				<ResponsiveRangeControl
					{...defaultProps}
					attributes={{ testValueUnit: 'px' }}
					availableUnits={['px', '%', 'custom']}
					unitAttributeName="testValueUnit"
				/>
			);

			expect(screen.getByRole('slider')).toBeInTheDocument();
			expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		});

		it('should respect min/max props', () => {
			render(
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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
				<ResponsiveRangeControl
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

	describe('Backward Compatibility', () => {
		it('should support units prop as alias for availableUnits', () => {
			const { container } = render(
				<ResponsiveRangeControl
					{...defaultProps}
					units={['px', '%', 'em']}
					unitAttributeName="testValueUnit"
				/>
			);

			// Should render dropdown with units (check for e-units-wrapper)
			expect(container.querySelector('.e-units-wrapper')).toBeInTheDocument();
		});
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('ResponsiveRangeControl with Custom Unit Integration', () => {
	it('should handle full custom unit workflow', () => {
		const mockSetAttributes = vi.fn();
		const initialAttributes = {
			contentWidth: 1200,
			contentWidthUnit: 'px',
		};

		const { rerender } = render(
			<ResponsiveRangeControl
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
			<ResponsiveRangeControl
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
			<ResponsiveRangeControl
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
