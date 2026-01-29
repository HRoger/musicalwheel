/**
 * BackgroundControl Component Tests
 *
 * Tests for the comprehensive background control that supports
 * Classic, Gradient, Video, and Slideshow modes with Normal/Hover states.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackgroundControl, {
	BackgroundControlAttributes,
	backgroundControlAttributes,
	extendedBackgroundControlAttributes,
} from '../BackgroundControl';

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
	SelectControl: ({ label, value, options, onChange, help }: any) => (
		<div data-testid={`select-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
			<label>{label}</label>
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options?.map((opt: any) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
			{help && <span className="help-text">{help}</span>}
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
	TextControl: ({ label, value, onChange, help, type }: any) => (
		<div data-testid={`text-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
			<label>{label}</label>
			<input
				type={type || 'text'}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={label}
			/>
			{help && <span className="help-text">{help}</span>}
		</div>
	),
	ToggleControl: ({ label, checked, onChange }: any) => (
		<div data-testid={`toggle-${label?.toLowerCase().replace(/\s+/g, '-')}`}>
			<label>
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					aria-label={label}
				/>
				{label}
			</label>
		</div>
	),
	Button: ({ children, onClick }: any) => (
		<button onClick={onClick}>{children}</button>
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
	default: ({ label, value, onChange, help }: any) => (
		<div data-testid="image-upload">
			<label>{label}</label>
			<button onClick={() => onChange({ url: 'test.jpg', id: 1 })}>
				Upload Image
			</button>
			{value?.url && <span data-testid="image-preview">{value.url}</span>}
			{help && <span data-testid="image-help-text" className="help-text">{help}</span>}
		</div>
	),
	ImageUploadValue: {},
}));

vi.mock('../GalleryUploadControl', () => ({
	default: ({ label, value, onChange }: any) => (
		<div data-testid="gallery-upload">
			<label>{label}</label>
			<button onClick={() => onChange([{ url: 'slide1.jpg', id: 1 }, { url: 'slide2.jpg', id: 2 }])}>
				Select Images
			</button>
			{value?.length > 0 && (
				<span data-testid="gallery-count">{value.length} images</span>
			)}
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

describe('BackgroundControl', () => {
	const mockSetAttributes = vi.fn();
	const defaultAttributes: BackgroundControlAttributes = {
		backgroundActiveTab: 'normal',
		backgroundType: 'classic',
		backgroundTypeHover: 'classic',
	};

	beforeEach(() => {
		mockSetAttributes.mockClear();
	});

	describe('Rendering', () => {
		it('should render the control container', () => {
			const { container } = render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(
				container.querySelector('.voxel-fse-background-control')
			).toBeInTheDocument();
		});

		it('should render StateTabPanel with Normal/Hover tabs', () => {
			render(
				<BackgroundControl
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
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('choose-control')).toBeInTheDocument();
			expect(screen.getByText('Background Type')).toBeInTheDocument();
		});

		it('should NOT render hover tabs when showHoverState is false', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					showHoverState={false}
				/>
			);

			expect(screen.queryByTestId('state-tab-panel')).not.toBeInTheDocument();
			expect(screen.queryByTestId('tab-hover')).not.toBeInTheDocument();
		});
	});

	describe('Tab Switching', () => {
		it('should start with Normal tab active', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const normalTab = screen.getByTestId('tab-normal');
			expect(normalTab).toHaveAttribute('aria-selected', 'true');
		});

		it('should switch to Hover tab when clicked', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByTestId('tab-hover'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				backgroundActiveTab: 'hover',
			});
		});

		it('should show Transition Duration only in Hover tab', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('content-hover')).toBeInTheDocument();
			expect(screen.getByText('Transition Duration (s)')).toBeInTheDocument();
		});

		it('should NOT show Transition Duration in Normal tab', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'normal' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.queryByText('Transition Duration (s)')).not.toBeInTheDocument();
		});
	});

	describe('Background Type Toggle', () => {
		it('should show Classic and Gradient options by default', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('choose-classic')).toBeInTheDocument();
			expect(screen.getByTestId('choose-gradient')).toBeInTheDocument();
		});

		it('should show Video option when showVideoBackground is true', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('choose-video')).toBeInTheDocument();
		});

		it('should show Slideshow option when showSlideshowBackground is true', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('choose-slideshow')).toBeInTheDocument();
		});

		it('should NOT show Video/Slideshow in Hover tab', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.queryByTestId('choose-video')).not.toBeInTheDocument();
			expect(screen.queryByTestId('choose-slideshow')).not.toBeInTheDocument();
		});

		it('should switch to Gradient mode when clicked', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			fireEvent.click(screen.getByTestId('choose-gradient'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				backgroundType: 'gradient',
			});
		});
	});

	describe('Classic Mode Controls', () => {
		it('should render color picker in classic mode', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
		});

		it('should render image upload in classic mode', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('image-upload')).toBeInTheDocument();
		});

		it('should update normal color when changed', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			const colorInput = screen.getByLabelText('Color');
			fireEvent.change(colorInput, { target: { value: '#ff0000' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				backgroundColor: '#ff0000',
			});
		});

		it('should update hover color when in hover tab', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const colorInput = screen.getByLabelText('Color');
			fireEvent.change(colorInput, { target: { value: '#00ff00' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				backgroundColorHover: '#00ff00',
			});
		});

		it('should NOT show image controls when showImageControls is false', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					showImageControls={false}
				/>
			);

			expect(screen.queryByTestId('image-upload')).not.toBeInTheDocument();
		});
	});

	describe('Image Sub-Controls', () => {
		it('should show image sub-controls when image is set', () => {
			render(
				<BackgroundControl
					attributes={{
						...defaultAttributes,
						backgroundImage: { url: 'test.jpg', id: 1 },
					}}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('select-image-resolution')).toBeInTheDocument();
			expect(screen.getByText('Position')).toBeInTheDocument();
			expect(screen.getByText('Attachment')).toBeInTheDocument();
		});

		it('should NOT show image sub-controls when no image is set', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.queryByTestId('select-image-resolution')).not.toBeInTheDocument();
			expect(screen.queryByText('Attachment')).not.toBeInTheDocument();
		});
	});

	describe('Gradient Mode Controls', () => {
		const gradientAttributes = {
			...defaultAttributes,
			backgroundType: 'gradient',
		};

		it('should show gradient color controls', () => {
			render(
				<BackgroundControl
					attributes={gradientAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
			expect(screen.getByTestId('color-picker-second color')).toBeInTheDocument();
		});

		it('should show gradient type selector (Linear/Radial)', () => {
			render(
				<BackgroundControl
					attributes={gradientAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByTestId('select-type')).toBeInTheDocument();
		});

		it('should show Angle control for Linear gradient', () => {
			render(
				<BackgroundControl
					attributes={{ ...gradientAttributes, gradientType: 'linear' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(
				screen.getByTestId('responsive-range-gradientAngle')
			).toBeInTheDocument();
		});

		it('should show Position control for Radial gradient', () => {
			render(
				<BackgroundControl
					attributes={{ ...gradientAttributes, gradientType: 'radial' }}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(screen.getByText('Position')).toBeInTheDocument();
		});

		it('should show gradient location controls', () => {
			render(
				<BackgroundControl
					attributes={gradientAttributes}
					setAttributes={mockSetAttributes}
				/>
			);

			expect(
				screen.getByTestId('responsive-range-gradientLocation')
			).toBeInTheDocument();
			expect(
				screen.getByTestId('responsive-range-gradientSecondLocation')
			).toBeInTheDocument();
		});

		it('should NOT show gradient controls when showGradientMode is false', () => {
			render(
				<BackgroundControl
					attributes={defaultAttributes}
					setAttributes={mockSetAttributes}
					showGradientMode={false}
				/>
			);

			expect(screen.queryByTestId('choose-gradient')).not.toBeInTheDocument();
		});
	});

	describe('Video Mode Controls', () => {
		const videoAttributes = {
			...defaultAttributes,
			backgroundType: 'video',
		};

		it('should render Color picker in video mode', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('color-picker-color')).toBeInTheDocument();
		});

		it('should render Video Link input', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('text-video-link')).toBeInTheDocument();
			expect(screen.getByText('YouTube/Vimeo link, or link to video file (mp4 is recommended).')).toBeInTheDocument();
		});

		it('should render Start Time and End Time inputs', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('text-start-time')).toBeInTheDocument();
			expect(screen.getByTestId('text-end-time')).toBeInTheDocument();
		});

		it('should render Play Once toggle', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-play-once')).toBeInTheDocument();
		});

		it('should render Play On Mobile toggle', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-play-on-mobile')).toBeInTheDocument();
		});

		it('should render Privacy Mode toggle', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-privacy-mode')).toBeInTheDocument();
		});

		it('should render Background Fallback image upload with help text', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			expect(screen.getByTestId('image-upload')).toBeInTheDocument();
			expect(screen.getByText('Background Fallback')).toBeInTheDocument();
			expect(screen.getByTestId('image-help-text')).toHaveTextContent(
				'This cover image will replace the background video in case that the video could not be loaded.'
			);
		});

		it('should update video link when changed', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			const linkInput = screen.getByLabelText('Video Link');
			fireEvent.change(linkInput, { target: { value: 'https://youtube.com/watch?v=test' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgVideoLink: 'https://youtube.com/watch?v=test',
			});
		});

		it('should update Play Once toggle when clicked', () => {
			render(
				<BackgroundControl
					attributes={videoAttributes}
					setAttributes={mockSetAttributes}
					showVideoBackground={true}
				/>
			);

			const toggle = screen.getByLabelText('Play Once');
			fireEvent.click(toggle);

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgVideoPlayOnce: true,
			});
		});
	});

	describe('Slideshow Mode Controls', () => {
		const slideshowAttributes = {
			...defaultAttributes,
			backgroundType: 'slideshow',
		};

		it('should render Gallery upload control', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('gallery-upload')).toBeInTheDocument();
		});

		it('should render Infinite Loop toggle', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-infinite-loop')).toBeInTheDocument();
		});

		it('should render Duration input', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('text-duration-(ms)')).toBeInTheDocument();
		});

		it('should render Transition select', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('select-transition')).toBeInTheDocument();
		});

		it('should render Transition Duration input', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('text-transition-duration-(ms)')).toBeInTheDocument();
		});

		it('should render Background Size control', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			// Background Size has a separate label span with responsive dropdown
			expect(screen.getByText('Background Size')).toBeInTheDocument();
		});

		it('should render Background Position control', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			// Background Position has a separate label span with responsive dropdown
			expect(screen.getByText('Background Position')).toBeInTheDocument();
		});

		it('should render Lazyload toggle', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-lazyload')).toBeInTheDocument();
		});

		it('should render Ken Burns Effect toggle', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('toggle-ken-burns-effect')).toBeInTheDocument();
		});

		it('should NOT show Ken Burns Direction when Ken Burns is disabled', () => {
			render(
				<BackgroundControl
					attributes={{ ...slideshowAttributes, bgSlideshowKenBurns: false }}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.queryByTestId('select-direction')).not.toBeInTheDocument();
		});

		it('should show Ken Burns Direction when Ken Burns is enabled', () => {
			render(
				<BackgroundControl
					attributes={{ ...slideshowAttributes, bgSlideshowKenBurns: true }}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			expect(screen.getByTestId('select-direction')).toBeInTheDocument();
		});

		it('should update Ken Burns Direction when changed', () => {
			render(
				<BackgroundControl
					attributes={{ ...slideshowAttributes, bgSlideshowKenBurns: true }}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			const directionSelect = screen.getByTestId('select-direction').querySelector('select');
			fireEvent.change(directionSelect!, { target: { value: 'out' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgSlideshowKenBurnsDirection: 'out',
			});
		});

		it('should update gallery when images are selected', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			fireEvent.click(screen.getByText('Select Images'));

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgSlideshowGallery: [
					{ url: 'slide1.jpg', id: 1 },
					{ url: 'slide2.jpg', id: 2 },
				],
			});
		});

		it('should update Ken Burns toggle when clicked', () => {
			render(
				<BackgroundControl
					attributes={slideshowAttributes}
					setAttributes={mockSetAttributes}
					showSlideshowBackground={true}
				/>
			);

			const toggle = screen.getByLabelText('Ken Burns Effect');
			fireEvent.click(toggle);

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgSlideshowKenBurns: true,
			});
		});
	});

	describe('Transition Duration', () => {
		it('should display default transition duration of 0.3s', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const transitionInput = screen.getByLabelText('Transition Duration (s)');
			expect(transitionInput).toHaveValue('0.3');
		});

		it('should update transition duration when changed', () => {
			render(
				<BackgroundControl
					attributes={{ ...defaultAttributes, backgroundActiveTab: 'hover' }}
					setAttributes={mockSetAttributes}
				/>
			);

			const transitionInput = screen.getByLabelText('Transition Duration (s)');
			fireEvent.change(transitionInput, { target: { value: '0.5' } });

			expect(mockSetAttributes).toHaveBeenCalledWith({
				bgTransitionDuration: 0.5,
			});
		});
	});
});

describe('backgroundControlAttributes', () => {
	it('should export attribute definitions', () => {
		expect(backgroundControlAttributes).toBeDefined();
		expect(typeof backgroundControlAttributes).toBe('object');
	});

	it('should have correct default for active tab', () => {
		expect(backgroundControlAttributes.backgroundActiveTab.default).toBe('normal');
	});

	it('should have correct default for background type', () => {
		expect(backgroundControlAttributes.backgroundType.default).toBe('classic');
	});

	it('should have correct default for gradient type', () => {
		expect(backgroundControlAttributes.gradientType.default).toBe('linear');
	});

	it('should have correct default for gradient angle', () => {
		expect(backgroundControlAttributes.gradientAngle.default).toBe(180);
	});

	it('should have correct default for gradient location', () => {
		expect(backgroundControlAttributes.gradientLocation.default).toBe(0);
	});

	it('should have correct default for gradient second location', () => {
		expect(backgroundControlAttributes.gradientSecondLocation.default).toBe(100);
	});

	it('should have correct default for transition duration', () => {
		expect(backgroundControlAttributes.bgTransitionDuration.default).toBe(0.3);
	});

	it('should include all responsive image attributes', () => {
		expect(backgroundControlAttributes.backgroundImage).toBeDefined();
		expect(backgroundControlAttributes.backgroundImage_tablet).toBeDefined();
		expect(backgroundControlAttributes.backgroundImage_mobile).toBeDefined();
	});

	it('should include all hover attributes', () => {
		expect(backgroundControlAttributes.backgroundTypeHover).toBeDefined();
		expect(backgroundControlAttributes.backgroundColorHover).toBeDefined();
		expect(backgroundControlAttributes.backgroundImageHover).toBeDefined();
	});
});

describe('extendedBackgroundControlAttributes', () => {
	it('should export extended attribute definitions', () => {
		expect(extendedBackgroundControlAttributes).toBeDefined();
		expect(typeof extendedBackgroundControlAttributes).toBe('object');
	});

	describe('Video attributes', () => {
		it('should include video link attribute', () => {
			expect(extendedBackgroundControlAttributes.bgVideoLink).toBeDefined();
		});

		it('should include video time attributes', () => {
			expect(extendedBackgroundControlAttributes.bgVideoStartTime).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgVideoEndTime).toBeDefined();
		});

		it('should have correct defaults for video toggles', () => {
			expect(extendedBackgroundControlAttributes.bgVideoPlayOnce.default).toBe(false);
			expect(extendedBackgroundControlAttributes.bgVideoPlayOnMobile.default).toBe(false);
			expect(extendedBackgroundControlAttributes.bgVideoPrivacyMode.default).toBe(false);
		});

		it('should include video fallback attribute', () => {
			expect(extendedBackgroundControlAttributes.bgVideoFallback).toBeDefined();
		});
	});

	describe('Slideshow attributes', () => {
		it('should include gallery attribute with empty array default', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowGallery).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgSlideshowGallery.default).toEqual([]);
		});

		it('should have correct default for infinite loop', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowInfiniteLoop.default).toBe(true);
		});

		it('should have correct default for duration', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowDuration.default).toBe(5000);
		});

		it('should have correct default for transition', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowTransition.default).toBe('fade');
		});

		it('should have correct default for transition duration', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowTransitionDuration.default).toBe(500);
		});

		it('should have correct default for lazyload', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowLazyload.default).toBe(false);
		});

		it('should have correct default for Ken Burns', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowKenBurns.default).toBe(false);
		});

		it('should have correct default for Ken Burns Direction', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowKenBurnsDirection.default).toBe('in');
		});

		it('should include responsive slideshow size attributes', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowSize).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgSlideshowSize_tablet).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgSlideshowSize_mobile).toBeDefined();
		});

		it('should include responsive slideshow position attributes', () => {
			expect(extendedBackgroundControlAttributes.bgSlideshowPosition).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgSlideshowPosition_tablet).toBeDefined();
			expect(extendedBackgroundControlAttributes.bgSlideshowPosition_mobile).toBeDefined();
		});
	});
});
