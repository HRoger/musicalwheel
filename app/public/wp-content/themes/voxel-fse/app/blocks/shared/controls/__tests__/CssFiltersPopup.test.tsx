/**
 * CssFiltersPopup Component Tests
 *
 * Tests for the CSS Filters popup control that provides
 * blur, brightness, contrast, saturation, and hue filters.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CssFiltersPopup, { CssFiltersValue } from '../CssFiltersPopup';

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
	Button: ({ children, onClick, icon, label, ...props }: any) => (
		<button onClick={onClick} aria-label={label} {...props}>
			{icon}
			{children}
		</button>
	),
	RangeControl: ({ label, value, onChange, min, max, step }: any) => (
		<div data-testid={`range-${label.toLowerCase()}`}>
			<label>{label}</label>
			<input
				type="range"
				value={value}
				onChange={(e) => onChange(parseFloat(e.target.value))}
				min={min}
				max={max}
				step={step}
				aria-label={label}
			/>
			<span data-testid={`value-${label.toLowerCase()}`}>{value}</span>
		</div>
	),
}));

vi.mock('@wordpress/i18n', () => ({
	__: (text: string) => text,
}));

describe('CssFiltersPopup', () => {
	const mockOnChange = vi.fn();

	beforeEach(() => {
		mockOnChange.mockClear();
	});

	describe('Rendering', () => {
		it('should render the label', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			expect(screen.getByText('CSS Filters')).toBeInTheDocument();
		});

		it('should render the pencil icon button', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Should have at least one button (the pencil icon)
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBeGreaterThanOrEqual(1);
		});

		it('should not show reset button when no filters are modified', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Only pencil button should be present, not reset
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBe(1);
		});

		it('should show reset button when filters are modified', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 5 }}
					onChange={mockOnChange}
				/>
			);

			// Should have both pencil and reset buttons
			const buttons = screen.getAllByRole('button');
			expect(buttons.length).toBe(2);
		});
	});

	describe('Popup Behavior', () => {
		it('should open popup when pencil button is clicked', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Initially popup should not be visible
			expect(screen.queryByText('Blur')).not.toBeInTheDocument();

			// Click the pencil button (last button when no reset)
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Popup should now be visible with filter controls
			expect(screen.getByText('Blur')).toBeInTheDocument();
			expect(screen.getByText('Brightness')).toBeInTheDocument();
			expect(screen.getByText('Contrast')).toBeInTheDocument();
			expect(screen.getByText('Saturation')).toBeInTheDocument();
			expect(screen.getByText('Hue')).toBeInTheDocument();
		});

		it('should close popup when clicking pencil button again', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			const buttons = screen.getAllByRole('button');
			const pencilButton = buttons[buttons.length - 1];

			// Open popup
			fireEvent.click(pencilButton);
			expect(screen.getByText('Blur')).toBeInTheDocument();

			// Close popup
			fireEvent.click(pencilButton);
			expect(screen.queryByText('Blur')).not.toBeInTheDocument();
		});
	});

	describe('Default Values', () => {
		it('should use default values when value is empty', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Check default values are displayed
			expect(screen.getByTestId('value-blur')).toHaveTextContent('0');
			expect(screen.getByTestId('value-brightness')).toHaveTextContent('100');
			expect(screen.getByTestId('value-contrast')).toHaveTextContent('100');
			expect(screen.getByTestId('value-saturation')).toHaveTextContent('100');
			expect(screen.getByTestId('value-hue')).toHaveTextContent('0');
		});

		it('should display custom values when provided', () => {
			const customValue: CssFiltersValue = {
				blur: 5,
				brightness: 150,
				contrast: 80,
				saturation: 120,
				hue: 45,
			};

			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={customValue}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Check custom values are displayed
			expect(screen.getByTestId('value-blur')).toHaveTextContent('5');
			expect(screen.getByTestId('value-brightness')).toHaveTextContent('150');
			expect(screen.getByTestId('value-contrast')).toHaveTextContent('80');
			expect(screen.getByTestId('value-saturation')).toHaveTextContent('120');
			expect(screen.getByTestId('value-hue')).toHaveTextContent('45');
		});
	});

	describe('onChange Handling', () => {
		it('should call onChange when blur is modified', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Change blur value
			const blurInput = screen.getByLabelText('Blur');
			fireEvent.change(blurInput, { target: { value: '5' } });

			expect(mockOnChange).toHaveBeenCalledWith({ blur: 5 });
		});

		it('should call onChange when brightness is modified', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 0 }}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Change brightness value
			const brightnessInput = screen.getByLabelText('Brightness');
			fireEvent.change(brightnessInput, { target: { value: '150' } });

			expect(mockOnChange).toHaveBeenCalledWith({ blur: 0, brightness: 150 });
		});

		it('should preserve existing values when modifying one filter', () => {
			const initialValue: CssFiltersValue = {
				blur: 2,
				brightness: 110,
			};

			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={initialValue}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Change contrast value
			const contrastInput = screen.getByLabelText('Contrast');
			fireEvent.change(contrastInput, { target: { value: '90' } });

			expect(mockOnChange).toHaveBeenCalledWith({
				blur: 2,
				brightness: 110,
				contrast: 90,
			});
		});
	});

	describe('Reset Functionality', () => {
		it('should reset all filters when reset button is clicked', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 5, brightness: 150 }}
					onChange={mockOnChange}
				/>
			);

			// Find and click reset button (should be first button when filters are modified)
			const resetButton = screen.getByLabelText('Reset');
			fireEvent.click(resetButton);

			// Should call onChange with empty object
			expect(mockOnChange).toHaveBeenCalledWith({});
		});

		it('should also have reset button inside popup', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 5 }}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			// Should have reset buttons (one in header, one in popup)
			const resetButtons = screen.getAllByLabelText('Reset');
			expect(resetButtons.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('Filter Modified Detection', () => {
		it('should detect when blur is modified from default', () => {
			const { rerender } = render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Initially no reset button
			expect(screen.getAllByRole('button').length).toBe(1);

			// Rerender with modified blur
			rerender(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 5 }}
					onChange={mockOnChange}
				/>
			);

			// Now reset button should appear
			expect(screen.getAllByRole('button').length).toBe(2);
		});

		it('should not show reset button for default values', () => {
			render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{ blur: 0, brightness: 100, contrast: 100, saturation: 100, hue: 0 }}
					onChange={mockOnChange}
				/>
			);

			// Default values should not trigger reset button
			expect(screen.getAllByRole('button').length).toBe(1);
		});
	});

	describe('CSS Classes', () => {
		it('should have correct control class', () => {
			const { container } = render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			expect(
				container.querySelector('.elementor-control-type-css-filters')
			).toBeInTheDocument();
		});

		it('should have popup class when open', () => {
			const { container } = render(
				<CssFiltersPopup
					label="CSS Filters"
					value={{}}
					onChange={mockOnChange}
				/>
			);

			// Open popup
			const buttons = screen.getAllByRole('button');
			fireEvent.click(buttons[buttons.length - 1]);

			expect(
				container.querySelector('.voxel-fse-css-filters-popup')
			).toBeInTheDocument();
		});
	});
});
