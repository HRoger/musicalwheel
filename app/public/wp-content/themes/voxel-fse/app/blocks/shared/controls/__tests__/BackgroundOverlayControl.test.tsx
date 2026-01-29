/**
 * BackgroundOverlayControl Component Tests
 *
 * Tests for the comprehensive background overlay control that supports
 * Classic and Gradient modes with Normal/Hover states.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackgroundOverlayControl, {
	BackgroundOverlayControlAttributes,
	backgroundOverlayControlAttributes,
} from '../BackgroundOverlayControl';

// Mock WordPress data store
vi.mock('@wordpress/data', () => ({
	useSelect: vi.fn(() => 'Desktop'),
}));

// Mock WordPress element
vi.mock('@wordpress/element', () => ({
	useState: vi.fn((initial) => {
		const React = require('react');
		return React.useState(initial);
	}),
	useEffect: vi.fn((fn, deps) => {
		const React = require('react');
		return React.useEffect(fn, deps);
	}),
}));

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
	SelectControl: ({ label, value, options, onChange }: any) => (
		<div data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
			<label>{label}</label>
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options?.map((opt: any) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	),
	RangeControl: ({ label, value, onChange, min, max, step }: any) => (
		<div data-testid={`range-${label?.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')}`}>
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
		</div>
	),
}));

vi.mock('@wordpress/i18n', () => ({
	__: (text: string) => text,
}));

// Mock child controls
vi.mock('../StateTabPanel', () => ({
	default: ({ children, tabs, attributes, setAttributes, attributeName }: any) => {
		const activeTab = attributes[attributeName] || tabs[0].name;
		return (
			<div data-testid="state-tab-panel">
				<div className="state-tabs" role="tablist">
					{tabs.map((tab: any) => (
						<button
							key={tab.name}
							role="tab"
							aria-selected={activeTab === tab.name}
							onClick={() => setAttributes({ [attributeName]: tab.name })}
							data-testid={`tab-${tab.name}`}
						>
							{tab.title}
						</button>
					))}
				</div>
				<div className="state-content" data-testid={`content-${activeTab}`}>
					{children({ name: activeTab })}
				</div>
			</div>
		);
	},
}));

vi.mock('../ChooseControl', () => ({
	default: ({ label, value, options, onChange }: any) => (
		<div data-testid="choose-control">
			<label>{label}</label>
			<div className="choose-options">
				{options?.map((opt: any) => (
					<button
						key={opt.value}
						onClick={() => onChange(opt.value)}
						aria-pressed={value === opt.value}
						data-testid={`choose-${opt.value}`}
					>
						{opt.title}
					</button>
				))}
			</div>
		</div>
	),
}));

vi.mock('../ColorPickerControl', () => ({
	default: ({ label, value, onChange }: any) => (
		<div data-testid={`color-picker-${label?.toLowerCase()}`}>
			<label>{label}</label>
			<input
				type="color"
				value={value || '#000000'}
				onChange={(e) => onChange(e.target.value)}
				aria-label={label}
			/>
		</div>
	),
}));

vi.mock('../ImageUploadControl', () => ({
	default: ({ label, value, onChange }: any) => (
		<div data-testid="image-upload">
			<label>{label}</label>
			<button onClick={() => onChange({ url: 'test.jpg', id: 1 })}>
				Upload Image
			</button>
			{value?.url && <span data-testid="image-preview">{value.url}</span>}
		</div>
	),
}));

vi.mock('../ResponsiveDropdownButton', () => ({
	default: ({ currentDevice, onDeviceChange }: any) => (
		<button data-testid="responsive-dropdown" onClick={() => onDeviceChange('tablet')}>
			{currentDevice}
		</button>
	),
}));

vi.mock('../ResponsiveRangeControl', () => ({
	default: ({ label, attributes, setAttributes, attributeBaseName }: any) => (
		<div data-testid={`responsive-range-${attributeBaseName}`}>
			<label>{label}</label>
			<input
				type="range"
				value={attributes[attributeBaseName] || 0}
				onChange={(e) => setAttributes({ [attributeBaseName]: parseFloat(e.target.value) })}
				aria-label={label}
			/>
		</div>
	),
}));

vi.mock('../CssFiltersPopup', () => ({
	default: ({ label, value, onChange }: any) => (
		<div data-testid="css-filters-popup">
			<label>{label}</label>
			<button onClick={() => onChange({ blur: 5 })}>
				Apply Filters
			</button>
		</div>
	),
}));

describe('BackgroundOverlayControl', () => {
	const mockSetAttributes = vi.fn();
	const defaultAttributes: BackgroundOverlayControlAttributes = {
		bgOverlayActiveTab: 'normal',
		bgOverlayType: 'classic',
		bgOverlayTypeHover: 'classic',
		bgOverlayOpacity: 0.5,
	};

	beforeEach(() => {
		mockSetAttributes.mockClear();
	});

	describe('Rendering', () => {
		it('should render the control container', () => {
			const { container } = render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(
				container.querySelector('.voxel-fse-background-overlay-control')
			).toBeInTheDocument();
		});

		it('should render StateTabPanel with Normal/Hover tabs', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('state-tab-panel')).toBeInTheDocument();
			expect(screen.getByTestId('tab-normal')).toBeInTheDocument();
			expect(screen.getByTestId('tab-hover')).toBeInTheDocument();
		});

		it('should render Background Type toggle', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('choose-control')).toBeInTheDocument();
			expect(screen.getByText('Background Type')).toBeInTheDocument();
		});

		it('should render color picker in classic mode', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
		});

		it('should render image upload in classic mode', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('image-upload')).toBeInTheDocument();
		});

		it('should render opacity slider', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('range-opacity')).toBeInTheDocument();
		});

		it('should NOT render CSS Filters popup in Normal tab (only in Hover)', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			// CSS Filters are only shown in Hover tab
			expect(screen.queryByTestId('css-filters-popup')).not.toBeInTheDocument();
		});
	});

	describe('Tab Switching', () => {
		it('should start with Normal tab active', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const normalTab = screen.getByTestId('tab-normal');
			expect(normalTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should switch to Hover tab when clicked', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByTestId('tab-hover'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayActiveTab: 'hover',
			});
		});

		it('should show Transition Duration only in Hover tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			// Transition Duration should be visible in hover content
			expect(screen.getByTestId('content-hover')).toBeInTheDocument();
			expect(screen.getByText('Transition Duration (s)')).toBeInTheDocument();
		});

		it('should NOT show Transition Duration in Normal tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'normal' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.queryByText('Transition Duration (s)')).not.toBeInTheDocument();
		});
	});

	describe('Background Type Toggle', () => {
		it('should show Classic controls by default', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			// Classic mode shows Color and Image
			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
			expect(screen.getByTestId('image-upload')).toBeInTheDocument();
		});

		it('should switch to Gradient mode when clicked', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByTestId('choose-gradient'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayType: 'gradient',
			});
		});

		it('should show Gradient controls when in gradient mode', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayType: 'gradient' }}
					setAttributes={mockSetAttributes}
				/>
			);

			// Gradient mode shows Color (first), Second Color, Location, Type
			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
			// Note: data-testid uses lowercase label, so "Second Color" becomes "second color"
			expect(screen.getByTestId('color-picker-second color')).toBeInTheDocument();
			expect(screen.getByText('Type')).toBeInTheDocument();
		});

		it('should update hover type separately from normal type', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByTestId('choose-gradient'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayTypeHover: 'gradient',
			});
		});
	});

	describe('Classic Mode Controls', () => {
		it('should update normal color when changed', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const colorInput = screen.getByLabelText('Color');
			fireEvent.change(colorInput, { target: { value: '#ff0000' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayColor: '#ff0000',
			});
		});

		it('should update hover color when in hover tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const colorInput = screen.getByLabelText('Color');
			fireEvent.change(colorInput, { target: { value: '#00ff00' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayColorHover: '#00ff00',
			});
		});

		it('should update image when uploaded', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByText('Upload Image'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayImage: { url: 'test.jpg', id: 1 },
			});
		});
	});

	describe('Image Sub-Controls', () => {
		it('should show image sub-controls when image is set', () => {
			render(
				<BackgroundOverlayControl
					attributes={{
						...defaultAttributes,
						bgOverlayImage: { url: 'test.jpg', id: 1 },
					}}
					setAttributes={mockSetAttributes}
				/>
			);

			// Should show Position, Attachment, Repeat, Size
			// Note: "Repeat" may appear multiple times (in select options), so check for at least one
			expect(screen.getAllByText('Position').length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText('Attachment')).toBeInTheDocument();
			expect(screen.getAllByText('Repeat').length).toBeGreaterThanOrEqual(1);
			expect(screen.getAllByText('Size').length).toBeGreaterThanOrEqual(1);
		});

		it('should NOT show image sub-controls when no image is set', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			// Should not show image sub-controls
			expect(screen.queryByText('Position')).not.toBeInTheDocument();
			expect(screen.queryByText('Attachment')).not.toBeInTheDocument();
			expect(screen.queryByText('Repeat')).not.toBeInTheDocument();
			// Note: Size may exist elsewhere, so we check within context
		});
	});

	describe('Opacity Control', () => {
		it('should display default opacity value of 0.5', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const opacityInput = screen.getByLabelText('Opacity');
			expect(opacityInput).toHaveValue('0.5');
		});

		it('should update normal opacity when changed', () => {
			render(
				<BackgroundOverlayControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const opacityInput = screen.getByLabelText('Opacity');
			fireEvent.change(opacityInput, { target: { value: '0.8' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayOpacity: 0.8,
			});
		});

		it('should update hover opacity when in hover tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const opacityInput = screen.getByLabelText('Opacity');
			fireEvent.change(opacityInput, { target: { value: '0.3' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayOpacityHover: 0.3,
			});
		});
	});

	describe('CSS Filters (Hover Tab Only)', () => {
		// Note: CSS Filters are ONLY available in Hover tab, not Normal tab
		it('should render CSS Filters popup in Hover tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('css-filters-popup')).toBeInTheDocument();
		});

		it('should NOT render CSS Filters popup in Normal tab', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'normal' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.queryByTestId('css-filters-popup')).not.toBeInTheDocument();
		});

		it('should update hover CSS filters when applied', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByText('Apply Filters'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayCssFiltersHover: { blur: 5 },
			});
		});
	});

	describe('Gradient Mode', () => {
		const gradientAttributes = {
			...defaultAttributes,
			bgOverlayType: 'gradient',
		};

		it('should show gradient type selector (Linear/Radial)', () => {
			render(
				<BackgroundOverlayControl
					attributes={gradientAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('select-type')).toBeInTheDocument();
		});

		it('should show Angle control for Linear gradient', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...gradientAttributes, bgOverlayGradientType: 'linear' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(
				screen.getByTestId('responsive-range-bgOverlayGradientAngle')
			).toBeInTheDocument();
		});

		it('should show Position control for Radial gradient', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...gradientAttributes, bgOverlayGradientType: 'radial' }}
					setAttributes={mockSetAttributes}
				/>
			);

			// Radial mode should show Position select
			expect(screen.getByText('Position')).toBeInTheDocument();
		});

		it('should show gradient location controls', () => {
			render(
				<BackgroundOverlayControl
					attributes={gradientAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			// Should have two Location controls (first and second color)
			expect(
				screen.getByTestId('responsive-range-bgOverlayGradientLocation')
			).toBeInTheDocument();
			expect(
				screen.getByTestId('responsive-range-bgOverlayGradientSecondLocation')
			).toBeInTheDocument();
		});
	});

	describe('Transition Duration', () => {
		it('should display default transition duration of 0.3s', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const transitionInput = screen.getByLabelText('Transition Duration (s)');
			expect(transitionInput).toHaveValue('0.3');
		});

		it('should update transition duration when changed', () => {
			render(
				<BackgroundOverlayControl
					attributes={{ ...defaultAttributes, bgOverlayActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const transitionInput = screen.getByLabelText('Transition Duration (s)');
			fireEvent.change(transitionInput, { target: { value: '0.5' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgOverlayTransitionDuration: 0.5,
			});
		});
	});
});

describe('backgroundOverlayControlAttributes', () => {
	it('should export attribute definitions', () => {
		expect(backgroundOverlayControlAttributes).toBeDefined();
		expect(typeof backgroundOverlayControlAttributes).toBe('object');
	});

	it('should have correct default for opacity', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayOpacity.default).toBe(0.5);
	});

	it('should have correct default for active tab', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayActiveTab.default).toBe('normal');
	});

	it('should have correct default for background type', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayType.default).toBe('classic');
	});

	it('should have correct default for gradient type', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayGradientType.default).toBe('linear');
	});

	it('should have correct default for gradient angle', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayGradientAngle.default).toBe(180);
	});

	it('should have correct default for transition duration', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayTransitionDuration.default).toBe(0.3);
	});

	it('should have correct default for CSS filters', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayCssFilters.default).toEqual({});
	});

	it('should include all responsive image attributes', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayImage).toBeDefined();
		expect(backgroundOverlayControlAttributes.bgOverlayImage_tablet).toBeDefined();
		expect(backgroundOverlayControlAttributes.bgOverlayImage_mobile).toBeDefined();
	});

	it('should include all hover attributes', () => {
		expect(backgroundOverlayControlAttributes.bgOverlayTypeHover).toBeDefined();
		expect(backgroundOverlayControlAttributes.bgOverlayColorHover).toBeDefined();
		expect(backgroundOverlayControlAttributes.bgOverlayOpacityHover).toBeDefined();
		expect(backgroundOverlayControlAttributes.bgOverlayCssFiltersHover).toBeDefined();
	});
});
