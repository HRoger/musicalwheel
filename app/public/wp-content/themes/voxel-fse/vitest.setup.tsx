import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock window.location
const mockLocation = {
	href: 'http://localhost/',
	origin: 'http://localhost',
	pathname: '/',
	search: '',
	hash: '',
	assign: vi.fn(),
	replace: vi.fn(),
	reload: vi.fn(),
};

Object.defineProperty(window, 'location', {
	value: mockLocation,
	writable: true,
});

// Mock window.history
Object.defineProperty(window, 'history', {
	value: {
		pushState: vi.fn(),
		replaceState: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		go: vi.fn(),
		length: 1,
		state: null,
	},
	writable: true,
});

// Mock CustomEvent
class MockCustomEvent<T = unknown> extends Event {
	detail: T;
	constructor(type: string, eventInitDict?: CustomEventInit<T>) {
		super(type, eventInitDict);
		this.detail = eventInitDict?.detail as T;
	}
}
global.CustomEvent = MockCustomEvent as typeof CustomEvent;

// Mock WordPress REST API base URL
vi.mock('@shared/utils/siteUrl', () => ({
	getRestBaseUrl: () => 'http://localhost/wp-json/',
	getSiteUrl: () => 'http://localhost/',
}));

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock @wordpress/components
vi.mock('@wordpress/components', () => ({
	PanelBody: ({ children, title, initialOpen }: any) => (
		<div data-testid={`panel-${title?.replace(/\s+/g, '-').toLowerCase()}`} data-open={initialOpen !== false}>
			<h2>{title}</h2>
			{children}
		</div>
	),
	Button: ({ children, onClick, ...props }: any) => (
		<button onClick={onClick} {...props}>{children}</button>
	),
	TextControl: ({ label, value, onChange, help, placeholder }: any) => (
		<div>
			<label>{label}</label>
			<input type="text" value={value || ''} onChange={(e: any) => onChange?.(e.target.value)} placeholder={placeholder} />
			{help && <span>{help}</span>}
		</div>
	),
	RangeControl: ({ label, value, onChange, min, max, step }: any) => (
		<div>
			<label>{label}</label>
			<input type="range" value={value || 0} onChange={(e: any) => onChange?.(Number(e.target.value))} min={min} max={max} step={step} />
		</div>
	),
	ToggleControl: ({ label, checked, onChange, help }: any) => (
		<div>
			<label>
				<input type="checkbox" checked={checked || false} onChange={(e: any) => onChange?.(e.target.checked)} />
				{label}
			</label>
			{help && <span>{help}</span>}
		</div>
	),
	SelectControl: ({ label, value, options, onChange }: any) => (
		<div>
			<label>{label}</label>
			<select value={value || ''} onChange={(e: any) => onChange?.(e.target.value)}>
				{options?.map((opt: any) => (
					<option key={opt.value} value={opt.value}>{opt.label}</option>
				))}
			</select>
		</div>
	),
	ColorPicker: ({ color, onChange }: any) => (
		<input type="color" value={color || '#000000'} onChange={(e: any) => onChange?.(e.target.value)} data-testid="color-picker" />
	),
	ColorPalette: ({ colors, value, onChange }: any) => (
		<div data-testid="color-palette">
			<input type="color" value={value || ''} onChange={(e: any) => onChange?.(e.target.value)} />
		</div>
	),
	Popover: ({ children }: any) => <div data-testid="popover">{children}</div>,
	Dropdown: ({ renderToggle, renderContent }: any) => (
		<div data-testid="dropdown">
			{renderToggle?.({ isOpen: false, onToggle: vi.fn() })}
			{renderContent?.({ isOpen: false })}
		</div>
	),
	DropdownMenu: ({ icon, label, children, controls, toggleProps }: any) => (
		<div data-testid="dropdown-menu" data-label={label}>
			{/* Render toggle button with children from toggleProps */}
			<button data-testid="dropdown-toggle" type="button">
				{toggleProps?.children}
			</button>
			{icon}
			{/* Support children as function pattern */}
			{typeof children === 'function'
				? children({ onClose: vi.fn() })
				: children}
			{controls?.map((ctrl: any, i: number) => (
				<button key={i} onClick={ctrl.onClick}>{ctrl.title}</button>
			))}
		</div>
	),
	MenuGroup: ({ children, label }: any) => <div data-testid="menu-group" data-label={label}>{children}</div>,
	MenuItem: ({ children, onClick, isSelected }: any) => (
		<button onClick={onClick} data-testid="menu-item" data-selected={isSelected}>{children}</button>
	),
	BaseControl: ({ label, children, help }: any) => (
		<div data-testid="base-control">
			{label && <label>{label}</label>}
			{children}
			{help && <span>{help}</span>}
		</div>
	),
	__experimentalUnitControl: ({ label, value, onChange, units }: any) => (
		<div>
			<label>{label}</label>
			<input type="text" value={value || ''} onChange={(e: any) => onChange?.(e.target.value)} />
		</div>
	),
	__experimentalNumberControl: ({ label, value, onChange }: any) => (
		<div>
			<label>{label}</label>
			<input type="number" value={value || ''} onChange={(e: any) => onChange?.(e.target.value)} />
		</div>
	),
	Icon: ({ icon }: any) => <span data-testid="icon">{typeof icon === 'string' ? icon : '⚙️'}</span>,
}));

// Mock @wordpress/i18n
vi.mock('@wordpress/i18n', () => ({
	__: (str: string) => str,
	_x: (str: string) => str,
	_n: (single: string, plural: string, number: number) => number === 1 ? single : plural,
	sprintf: (format: string, ...args: any[]) => {
		let i = 0;
		return format.replace(/%[sdf]/g, () => String(args[i++] ?? ''));
	},
}));

// Mock @wordpress/icons
vi.mock('@wordpress/icons', () => ({
	Icon: ({ icon }: any) => <span data-testid="wp-icon">{icon}</span>,
	desktop: 'desktop',
	tablet: 'tablet',
	mobile: 'mobile',
	link: 'link',
	linkOff: 'linkOff',
	check: 'check',
	close: 'close',
	chevronDown: 'chevronDown',
	chevronUp: 'chevronUp',
	settings: 'settings',
	reset: 'reset',
	edit: 'edit',
	trash: 'trash',
	plus: 'plus',
	moreVertical: 'moreVertical',
}));

// Mock @wordpress/block-editor
vi.mock('@wordpress/block-editor', () => ({
	InspectorControls: ({ children }: any) => <div data-testid="inspector-controls">{children}</div>,
	useBlockProps: () => ({ className: 'wp-block' }),
	InnerBlocks: ({ allowedBlocks, template }: any) => <div data-testid="inner-blocks" />,
	MediaUpload: ({ onSelect, render }: any) => render?.({ open: vi.fn() }),
	MediaUploadCheck: ({ children }: any) => <>{children}</>,
	RichText: ({ value, onChange, tagName: Tag = 'div', placeholder }: any) => (
		<Tag contentEditable suppressContentEditableWarning onBlur={(e: any) => onChange?.(e.target.innerHTML)}>
			{value || placeholder}
		</Tag>
	),
	BlockControls: ({ children }: any) => <div data-testid="block-controls">{children}</div>,
	AlignmentToolbar: ({ value, onChange }: any) => (
		<div data-testid="alignment-toolbar">
			<button onClick={() => onChange?.('left')}>Left</button>
			<button onClick={() => onChange?.('center')}>Center</button>
			<button onClick={() => onChange?.('right')}>Right</button>
		</div>
	),
	useSetting: () => null,
	useSettings: () => [null],
}));

// Mock @wordpress/data
vi.mock('@wordpress/data', () => ({
	useSelect: (selector: any) => {
		// Return 'Desktop' as the device type for editor store
		if (typeof selector === 'function') {
			const mockSelect = (storeName: string) => {
				if (storeName === 'core/editor' || storeName === 'core/edit-post') {
					return {
						getDeviceType: () => 'Desktop',
						__experimentalGetPreviewDeviceType: () => 'Desktop',
					};
				}
				if (storeName === 'core/block-editor') {
					return {
						getSelectedBlockClientId: () => 'test-client-id',
					};
				}
				return {};
			};
			return selector(mockSelect);
		}
		return 'Desktop';
	},
	useDispatch: () => ({
		setDeviceType: vi.fn(),
		__experimentalSetPreviewDeviceType: vi.fn(),
	}),
	select: (storeName: string) => {
		if (storeName === 'core/editor' || storeName === 'core/edit-post') {
			return {
				getDeviceType: () => 'Desktop',
				__experimentalGetPreviewDeviceType: () => 'Desktop',
			};
		}
		if (storeName === 'core/block-editor') {
			return {
				getSelectedBlockClientId: () => 'test-client-id',
			};
		}
		return {};
	},
	dispatch: () => ({
		setDeviceType: vi.fn(),
		__experimentalSetPreviewDeviceType: vi.fn(),
	}),
	subscribe: vi.fn(),
	registerStore: vi.fn(),
}));

// Mock @wordpress/element
vi.mock('@wordpress/element', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@wordpress/element')>();
	return {
		...actual,
		createPortal: (children: any) => children,
	};
});

// Reset mocks before each test
beforeEach(() => {
	vi.clearAllMocks();
	mockLocation.href = 'http://localhost/';
	mockLocation.search = '';
});
