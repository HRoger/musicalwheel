/**
 * UnitDropdownButton Component Tests
 *
 * Tests for unit selection dropdown including custom unit support.
 * Ensures proper rendering, unit switching, and custom value handling.
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitDropdownButton, { type UnitType } from '../UnitDropdownButton';

// ============================================================================
// Component Tests
// ============================================================================

describe('UnitDropdownButton Component', () => {
	const mockOnUnitChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('should render with default px unit', () => {
			render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%']}
				/>
			);

			const toggle = screen.getByTestId('dropdown-toggle');
			expect(toggle).toHaveTextContent('px');
		});

		it('should render percentage unit', () => {
			render(
				<UnitDropdownButton
					currentUnit="%"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%']}
				/>
			);

			const toggle = screen.getByTestId('dropdown-toggle');
			expect(toggle).toHaveTextContent('%');
		});

		it('should render all standard units correctly', () => {
			const units: UnitType[] = ['px', '%', 'em', 'rem', 'vw', 'vh'];

			units.forEach((unit) => {
				const { unmount } = render(
					<UnitDropdownButton
						currentUnit={unit}
						onUnitChange={mockOnUnitChange}
						availableUnits={units}
					/>
				);

				const toggle = screen.getByTestId('dropdown-toggle');
				expect(toggle).toHaveTextContent(unit);
				unmount();
			});
		});

		it('should render pencil icon for custom unit', () => {
			const { container } = render(
				<UnitDropdownButton
					currentUnit="custom"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'custom']}
				/>
			);

			// Check for the pencil icon element
			const pencilIcon = container.querySelector('.eicon-edit');
			expect(pencilIcon).toBeInTheDocument();
		});

		it('should apply e-units-custom class when custom unit is selected', () => {
			const { container } = render(
				<UnitDropdownButton
					currentUnit="custom"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'custom']}
				/>
			);

			const wrapper = container.querySelector('.e-units-wrapper');
			expect(wrapper).toHaveClass('e-units-custom');
		});

		it('should not apply e-units-custom class for standard units', () => {
			const { container } = render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'custom']}
				/>
			);

			const wrapper = container.querySelector('.e-units-wrapper');
			expect(wrapper).not.toHaveClass('e-units-custom');
		});
	});

	describe('Unit Selection', () => {
		it('should render all available units in dropdown', () => {
			render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%', 'em', 'custom']}
				/>
			);

			const menuItems = screen.getAllByTestId('menu-item');
			expect(menuItems).toHaveLength(4);
		});

		it('should call onUnitChange when unit is selected', () => {
			render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%', 'em']}
				/>
			);

			// Find the % menu item and click it
			const menuItems = screen.getAllByTestId('menu-item');
			const percentItem = menuItems.find(item => item.textContent === '%');
			expect(percentItem).toBeDefined();

			fireEvent.click(percentItem!);
			expect(mockOnUnitChange).toHaveBeenCalledWith('%');
		});

		it('should call onUnitChange with custom when custom is selected', () => {
			render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%', 'custom']}
				/>
			);

			const menuItems = screen.getAllByTestId('menu-item');
			// Custom unit shows pencil icon, find by checking for eicon element
			const customItem = menuItems[menuItems.length - 1]; // custom is last in the array

			fireEvent.click(customItem);
			expect(mockOnUnitChange).toHaveBeenCalledWith('custom');
		});

		it('should mark current unit as selected', () => {
			render(
				<UnitDropdownButton
					currentUnit="%"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%', 'em']}
				/>
			);

			const menuItems = screen.getAllByTestId('menu-item');
			const percentItem = menuItems.find(item => item.textContent === '%');

			expect(percentItem).toHaveAttribute('data-selected', 'true');
		});
	});

	describe('Special Units', () => {
		it('should handle fr unit', () => {
			render(
				<UnitDropdownButton
					currentUnit="fr"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'fr']}
				/>
			);

			const toggle = screen.getByTestId('dropdown-toggle');
			expect(toggle).toHaveTextContent('fr');
		});

		it('should handle auto unit', () => {
			render(
				<UnitDropdownButton
					currentUnit="auto"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'auto']}
				/>
			);

			const toggle = screen.getByTestId('dropdown-toggle');
			expect(toggle).toHaveTextContent('auto');
		});

		it('should handle minmax unit', () => {
			render(
				<UnitDropdownButton
					currentUnit="minmax"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', 'minmax']}
				/>
			);

			const toggle = screen.getByTestId('dropdown-toggle');
			expect(toggle).toHaveTextContent('minmax');
		});
	});

	describe('Default Props', () => {
		it('should default to px and % when availableUnits not provided', () => {
			render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
				/>
			);

			const menuItems = screen.getAllByTestId('menu-item');
			expect(menuItems).toHaveLength(2);
			expect(menuItems[0]).toHaveTextContent('px');
			expect(menuItems[1]).toHaveTextContent('%');
		});
	});

	describe('CSS Classes', () => {
		it('should have e-units-wrapper class', () => {
			const { container } = render(
				<UnitDropdownButton
					currentUnit="px"
					onUnitChange={mockOnUnitChange}
					availableUnits={['px', '%']}
				/>
			);

			expect(container.querySelector('.e-units-wrapper')).toBeInTheDocument();
		});
	});
});

// ============================================================================
// Integration Tests with ResponsiveRangeControl
// ============================================================================

describe('UnitDropdownButton Integration', () => {
	it('should switch from standard unit to custom unit', () => {
		const mockOnUnitChange = vi.fn();

		const { rerender } = render(
			<UnitDropdownButton
				currentUnit="px"
				onUnitChange={mockOnUnitChange}
				availableUnits={['px', '%', 'custom']}
			/>
		);

		// Click custom unit
		const menuItems = screen.getAllByTestId('menu-item');
		fireEvent.click(menuItems[2]); // custom is the 3rd item

		expect(mockOnUnitChange).toHaveBeenCalledWith('custom');

		// Rerender with custom unit selected
		rerender(
			<UnitDropdownButton
				currentUnit="custom"
				onUnitChange={mockOnUnitChange}
				availableUnits={['px', '%', 'custom']}
			/>
		);

		// Verify pencil icon is now shown in toggle
		const { container } = render(
			<UnitDropdownButton
				currentUnit="custom"
				onUnitChange={mockOnUnitChange}
				availableUnits={['px', '%', 'custom']}
			/>
		);
		expect(container.querySelector('.eicon-edit')).toBeInTheDocument();
	});

	it('should switch from custom unit back to standard unit', () => {
		const mockOnUnitChange = vi.fn();

		render(
			<UnitDropdownButton
				currentUnit="custom"
				onUnitChange={mockOnUnitChange}
				availableUnits={['px', '%', 'custom']}
			/>
		);

		// Click px unit
		const menuItems = screen.getAllByTestId('menu-item');
		fireEvent.click(menuItems[0]); // px is the 1st item

		expect(mockOnUnitChange).toHaveBeenCalledWith('px');
	});
});

// ============================================================================
// UnitType Tests
// ============================================================================

describe('UnitType', () => {
	it('should include all expected unit types', () => {
		// This test verifies the UnitType union includes all expected values
		const validUnits: UnitType[] = [
			'px', '%', 'em', 'rem', 'vw', 'vh', 'fr', 'auto', 'minmax', 'custom'
		];

		// Each of these should be a valid UnitType
		validUnits.forEach((unit) => {
			const testUnit: UnitType = unit;
			expect(testUnit).toBe(unit);
		});
	});

	it('should allow custom unit in availableUnits', () => {
		const mockOnUnitChange = vi.fn();
		const unitsWithCustom: UnitType[] = ['px', '%', 'custom'];

		// This should not throw any TypeScript errors
		render(
			<UnitDropdownButton
				currentUnit="px"
				onUnitChange={mockOnUnitChange}
				availableUnits={unitsWithCustom}
			/>
		);

		expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
	});
});
