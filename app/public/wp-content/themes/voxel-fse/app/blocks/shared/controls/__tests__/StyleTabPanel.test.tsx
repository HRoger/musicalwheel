/**
 * StyleTabPanel Component Tests
 *
 * Tests for tab switching and state management.
 * Ensures proper rendering and interaction with Normal/Hover/Active tabs.
 *
 * @package VoxelFSE
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StyleTabPanel, { StyleTab } from '../StyleTabPanel';

// ============================================================================
// Component Tests
// ============================================================================

describe('StyleTabPanel Component', () => {
	const mockTabs: StyleTab[] = [
		{ name: 'normal', title: 'Normal' },
		{ name: 'hover', title: 'Hover' },
	];

	describe('Rendering', () => {
		it('should render all tabs', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByText('Normal')).toBeInTheDocument();
			expect(screen.getByText('Hover')).toBeInTheDocument();
		});

		it('should render tab content for active tab', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for normal');
		});

		it('should return null for empty tabs', () => {
			const { container } = render(
				<StyleTabPanel tabs={[]}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			expect(container.firstChild).toBeNull();
		});

		it('should render with custom className', () => {
			const { container } = render(
				<StyleTabPanel tabs={mockTabs} className="custom-class">
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const element = container.querySelector('.custom-class');
			expect(element).toBeInTheDocument();
		});

		it('should render tabs with icons', () => {
			const tabsWithIcons: StyleTab[] = [
				{ name: 'normal', title: 'Normal', icon: 'eicon-star' },
				{ name: 'hover', title: 'Hover', icon: 'eicon-heart' },
			];

			const { container } = render(
				<StyleTabPanel tabs={tabsWithIcons}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			expect(container.querySelector('.eicon-star')).toBeInTheDocument();
			expect(container.querySelector('.eicon-heart')).toBeInTheDocument();
		});
	});

	describe('Tab Switching', () => {
		it('should switch tabs when clicked', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			// Initially shows normal tab content
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for normal');

			// Click on hover tab
			fireEvent.click(screen.getByText('Hover'));

			// Now shows hover tab content
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for hover');
		});

		it('should apply active class to active tab', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const normalButton = screen.getByText('Normal').closest('button');
			const hoverButton = screen.getByText('Hover').closest('button');

			// Initially normal tab is active
			expect(normalButton).toHaveClass('e-tab-active');
			expect(hoverButton).not.toHaveClass('e-tab-active');

			// Click on hover tab
			fireEvent.click(screen.getByText('Hover'));

			// Now hover tab is active
			expect(normalButton).not.toHaveClass('e-tab-active');
			expect(hoverButton).toHaveClass('e-tab-active');
		});

		it('should update aria-selected when switching tabs', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const normalButton = screen.getByText('Normal').closest('button');
			const hoverButton = screen.getByText('Hover').closest('button');

			// Initially normal tab is selected
			expect(normalButton).toHaveAttribute('aria-selected', 'true');
			expect(hoverButton).toHaveAttribute('aria-selected', 'false');

			// Click on hover tab
			fireEvent.click(screen.getByText('Hover'));

			// Now hover tab is selected
			expect(normalButton).toHaveAttribute('aria-selected', 'false');
			expect(hoverButton).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('Initial State', () => {
		it('should default to first tab', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for normal');
		});

		it('should respect initialTabName', () => {
			render(
				<StyleTabPanel tabs={mockTabs} initialTabName="hover">
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for hover');
		});

		it('should fallback to first tab if initialTabName not found', () => {
			render(
				<StyleTabPanel tabs={mockTabs} initialTabName="invalid">
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for normal');
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const normalButton = screen.getByText('Normal').closest('button');
			const tabPanel = screen.getByRole('tabpanel');

			expect(normalButton).toHaveAttribute('role', 'tab');
			expect(normalButton).toHaveAttribute('aria-controls', 'vxfse-tab-panel-normal');
			expect(normalButton).toHaveAttribute('id', 'vxfse-tab-normal');

			expect(tabPanel).toHaveAttribute('role', 'tabpanel');
			expect(tabPanel).toHaveAttribute('id', 'vxfse-tab-panel-normal');
			expect(tabPanel).toHaveAttribute('aria-labelledby', 'vxfse-tab-normal');
		});

		it('should have tablist role on tabs container', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const tablist = screen.getByRole('tablist');
			expect(tablist).toBeInTheDocument();
			expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
		});

		it('should hide icon with aria-hidden', () => {
			const tabsWithIcons: StyleTab[] = [
				{ name: 'normal', title: 'Normal', icon: 'eicon-star' },
			];

			const { container } = render(
				<StyleTabPanel tabs={tabsWithIcons}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const icon = container.querySelector('.eicon-star');
			expect(icon).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Data Attributes', () => {
		it('should include data-tab-index on tab buttons', () => {
			render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			const normalButton = screen.getByText('Normal').closest('button');
			const hoverButton = screen.getByText('Hover').closest('button');

			expect(normalButton).toHaveAttribute('data-tab-index', '0');
			expect(hoverButton).toHaveAttribute('data-tab-index', '1');
		});
	});

	describe('Multiple Tabs', () => {
		it('should handle three tabs (Normal/Hover/Active)', () => {
			const threeTabs: StyleTab[] = [
				{ name: 'normal', title: 'Normal' },
				{ name: 'hover', title: 'Hover' },
				{ name: 'active', title: 'Active' },
			];

			render(
				<StyleTabPanel tabs={threeTabs}>
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByText('Normal')).toBeInTheDocument();
			expect(screen.getByText('Hover')).toBeInTheDocument();
			expect(screen.getByText('Active')).toBeInTheDocument();

			// Switch to active tab
			fireEvent.click(screen.getByText('Active'));
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for active');
		});

		it('should handle single tab', () => {
			const singleTab: StyleTab[] = [
				{ name: 'normal', title: 'Normal' },
			];

			render(
				<StyleTabPanel tabs={singleTab}>
					{(tab) => <div data-testid="tab-content">Content for {tab.name}</div>}
				</StyleTabPanel>
			);

			expect(screen.getByText('Normal')).toBeInTheDocument();
			expect(screen.getByTestId('tab-content')).toHaveTextContent('Content for normal');
		});
	});

	describe('CSS Classes', () => {
		it('should apply Elementor-style class names', () => {
			const { container } = render(
				<StyleTabPanel tabs={mockTabs}>
					{(tab) => <div>{tab.name}</div>}
				</StyleTabPanel>
			);

			expect(container.querySelector('.elementor-control-type-tabs')).toBeInTheDocument();
			expect(container.querySelector('.vxfse-style-tabs')).toBeInTheDocument();
			expect(container.querySelector('.vxfse-style-tabs__tabs')).toBeInTheDocument();
			expect(container.querySelector('.elementor-control-type-tab')).toBeInTheDocument();
			expect(container.querySelector('.vxfse-style-tabs__tab')).toBeInTheDocument();
			expect(container.querySelector('.vxfse-style-tabs__content')).toBeInTheDocument();
		});
	});

	describe('Children Function', () => {
		it('should call children function with active tab', () => {
			const childrenSpy = vi.fn((tab) => <div>{tab.name}</div>);

			render(
				<StyleTabPanel tabs={mockTabs}>
					{childrenSpy}
				</StyleTabPanel>
			);

			expect(childrenSpy).toHaveBeenCalledWith(mockTabs[0]);
		});

		it('should update children when tab changes', () => {
			const childrenSpy = vi.fn((tab) => <div>{tab.name}</div>);

			render(
				<StyleTabPanel tabs={mockTabs}>
					{childrenSpy}
				</StyleTabPanel>
			);

			// Initially called with normal tab
			expect(childrenSpy).toHaveBeenLastCalledWith(mockTabs[0]);

			// Click hover tab
			fireEvent.click(screen.getByText('Hover'));

			// Now called with hover tab
			expect(childrenSpy).toHaveBeenLastCalledWith(mockTabs[1]);
		});
	});
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('StyleTabPanel Integration', () => {
	it('should work with different content per tab', () => {
		const tabs: StyleTab[] = [
			{ name: 'normal', title: 'Normal' },
			{ name: 'hover', title: 'Hover' },
		];

		render(
			<StyleTabPanel tabs={tabs}>
				{(tab) => (
					<div>
						{tab.name === 'normal' && <input data-testid="normal-input" />}
						{tab.name === 'hover' && <select data-testid="hover-select" />}
					</div>
				)}
			</StyleTabPanel>
		);

		// Normal tab shows input
		expect(screen.getByTestId('normal-input')).toBeInTheDocument();
		expect(screen.queryByTestId('hover-select')).not.toBeInTheDocument();

		// Switch to hover tab
		fireEvent.click(screen.getByText('Hover'));

		// Hover tab shows select
		expect(screen.queryByTestId('normal-input')).not.toBeInTheDocument();
		expect(screen.getByTestId('hover-select')).toBeInTheDocument();
	});

	it('should maintain state across tab switches', () => {
		const tabs: StyleTab[] = [
			{ name: 'normal', title: 'Normal' },
			{ name: 'hover', title: 'Hover' },
		];

		let normalValue = '';
		let hoverValue = '';

		const { rerender } = render(
			<StyleTabPanel tabs={tabs}>
				{(tab) => (
					<div>
						{tab.name === 'normal' && (
							<input
								data-testid="normal-input"
								value={normalValue}
								onChange={(e) => {
									normalValue = e.target.value;
									rerender(
										<StyleTabPanel tabs={tabs}>
											{(t) => (
												<div>
													{t.name === 'normal' && (
														<input
															data-testid="normal-input"
															value={normalValue}
														/>
													)}
													{t.name === 'hover' && (
														<input
															data-testid="hover-input"
															value={hoverValue}
														/>
													)}
												</div>
											)}
										</StyleTabPanel>
									);
								}}
							/>
						)}
						{tab.name === 'hover' && (
							<input
								data-testid="hover-input"
								value={hoverValue}
							/>
						)}
					</div>
				)}
			</StyleTabPanel>
		);

		// Type in normal input
		const normalInput = screen.getByTestId('normal-input') as HTMLInputElement;
		fireEvent.change(normalInput, { target: { value: 'test' } });

		// Switch to hover tab and back
		fireEvent.click(screen.getByText('Hover'));
		fireEvent.click(screen.getByText('Normal'));

		// Normal input value should be preserved
		expect((screen.getByTestId('normal-input') as HTMLInputElement).value).toBe('test');
	});
});
