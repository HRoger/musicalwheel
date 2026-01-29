# Popup Kit - Phase A: API Reference

**Date:** November 24, 2025  
**Status:** ✅ Complete  
**Components:** FormGroup, FormPopup, DatePicker

---

## 📦 Exports

```tsx
import {
	// Components
	FormGroup,
	FormPopup,
	DatePicker,
	
	// Hooks
	useFormPopup,
	useDatePicker,
	
	// Types
	FormGroupProps,
	FormPopupProps,
	DatePickerProps,
	UseFormPopupOptions,
	UseDatePickerOptions,
} from '../popup/components';
```

---

## 🎨 FormPopup

### Props

```tsx
interface FormPopupProps {
	isOpen: boolean;               // Whether popup is open
	popupId: string;               // Unique popup identifier
	title?: string;                // Popup title (optional)
	icon?: string;                 // SVG icon HTML (optional)
	saveLabel?: string;            // Save button label (default: 'Save')
	clearLabel?: string;           // Clear button label (default: 'Clear')
	showSave?: boolean;            // Show save button (default: true)
	showClear?: boolean;           // Show clear button (default: true)
	showClearMobile?: boolean;     // Show clear icon on mobile (default: false)
	showClose?: boolean;           // Show close button in head (default: true)
	onSave: () => void;            // Save button click handler
	onClear?: () => void;          // Clear button click handler
	onClose: () => void;           // Close popup handler
	children: React.ReactNode;     // Popup content
	wrapperClass?: string;         // Width/height classes (e.g., 'md-width xl-height')
	controllerClass?: string;      // Custom controller classes
}
```

### Usage

```tsx
<FormPopup
	isOpen={isOpen}
	popupId="my-popup"
	title="My Popup"
	onSave={() => console.log('Saved')}
	onClose={() => setIsOpen(false)}
	wrapperClass="md-width xl-height"
>
	<div className="ts-form-group">
		<p>Content</p>
	</div>
</FormPopup>
```

### Features

- ✅ 4-layer structure matching Voxel
- ✅ Backdrop click closes popup
- ✅ ESC key closes popup
- ✅ Smooth animations (desktop and mobile)
- ✅ Responsive (fullscreen desktop, slide-up mobile)
- ✅ Button structure matches Voxel (`<ul><li><a>`)

---

## 🎯 FormGroup

### Props

```tsx
interface FormGroupProps {
	popupId: string;                      // Unique popup identifier
	children: ReactNode;                  // Additional content
	renderTrigger: () => ReactNode;       // Trigger element renderer
	renderPopup: (popupProps: {           // Popup renderer
		isOpen: boolean;
		popupId: string;
		onClose: () => void;
	}) => ReactNode;
	wrapperClass?: string;                // Popup width/height classes
	controllerClass?: string;             // Controller custom classes
	className?: string;                   // Wrapper custom class
	defaultClass?: boolean;               // Add 'ts-form-group' class (default: true)
	onSave?: () => void;                  // Save handler
	onClear?: () => void;                 // Clear handler
	onBlur?: () => void;                  // Blur handler (called on close)
}
```

### Usage

```tsx
<FormGroup
	popupId="my-popup"
	renderTrigger={() => (
		<div className="ts-filter ts-popup-target">
			Click to open
		</div>
	)}
	renderPopup={({ isOpen, popupId, onClose }) => (
		<FormPopup
			isOpen={isOpen}
			popupId={popupId}
			onSave={() => {
				console.log('Saved');
				onClose();
			}}
			onClose={onClose}
		>
			<div className="ts-form-group">
				<p>Content</p>
			</div>
		</FormPopup>
	)}
	onBlur={() => console.log('Popup closed')}
>
	Additional content
</FormGroup>
```

### Features

- ✅ Manages popup open/close state
- ✅ Uses React Portal to teleport popup to body
- ✅ Handles focus/blur events
- ✅ Restores focus to trigger on close
- ✅ Matches Voxel's form-group behavior

---

## 📅 DatePicker

### Props

```tsx
interface DatePickerProps {
	value: Date | null;               // Selected date
	onChange: (date: Date | null) => void;  // Date change handler
	onSave?: () => void;              // CRITICAL: Called immediately on select
	minDate?: Date;                   // Minimum selectable date
	maxDate?: Date;                   // Maximum selectable date
	disabledDates?: Date[];           // Array of disabled dates
	format?: string;                  // Date format (default: 'YYYY-MM-DD')
	firstDay?: number;                // First day of week (0=Sun, 1=Mon, default: 1)
	showMonthAfterYear?: boolean;     // Year-Month order (default: false)
	yearRange?: number | [number, number];  // Year range in selector (default: 10)
	numberOfMonths?: number;          // Number of months to show (default: 1)
	mainCalendar?: 'left' | 'right';  // Main calendar position (default: 'left')
}
```

### Usage

```tsx
<DatePicker
	value={selectedDate}
	onChange={setSelectedDate}
	onSave={handleSave}  // CRITICAL: Auto-save on select
	minDate={new Date()}
	maxDate={new Date(2025, 11, 31)}
	firstDay={1}  // Monday
/>
```

### Critical Behavior

**IMPORTANT:** `onSave` is called **immediately** after date selection (matches Voxel).

```tsx
// When user clicks a date:
// 1. onChange(date) is called
// 2. onSave() is called immediately (after 10ms delay)
// 3. Popup closes (if onSave closes it)
```

### Features

- ✅ Pikaday integration
- ✅ Inline rendering (bound: false)
- ✅ Month/year selectors
- ✅ Immediate save on selection (Voxel behavior)
- ✅ Date highlighting
- ✅ Disabled dates support

---

## 🪝 useFormPopup Hook

### Signature

```tsx
function useFormPopup(options: UseFormPopupOptions): {
	isOpen: boolean;
	openPopup: () => void;
	closePopup: () => void;
	popupElement: JSX.Element | null;
}
```

### Options

```tsx
interface UseFormPopupOptions extends Omit<FormPopupProps, 'isOpen' | 'children' | 'onClose'> {
	renderContent: () => ReactNode;  // Content renderer
}
```

### Usage

```tsx
const { openPopup, closePopup, popupElement, isOpen } = useFormPopup({
	popupId: 'my-popup',
	title: 'My Popup',
	renderContent: () => (
		<div className="ts-form-group">
			<p>Content</p>
		</div>
	),
	onSave: () => {
		console.log('Saved');
	},
	onClear: () => {
		console.log('Cleared');
	},
	wrapperClass: 'md-width xl-height',
});

return (
	<>
		<button onClick={openPopup}>Open</button>
		{popupElement}
	</>
);
```

### Returns

- `isOpen` - Current popup state
- `openPopup` - Function to open popup
- `closePopup` - Function to close popup
- `popupElement` - Portal element to render (or null)

### Features

- ✅ Handles state management
- ✅ Uses React Portal automatically
- ✅ Auto-closes on save
- ✅ Keeps open on clear
- ✅ Simplest way to use popup

---

## 🪝 useDatePicker Hook

### Signature

```tsx
function useDatePicker(options?: UseDatePickerOptions): {
	date: Date | null;
	setDate: (date: Date | null) => void;
	datePickerElement: JSX.Element;
	clearDate: () => void;
}
```

### Options

```tsx
interface UseDatePickerOptions extends Omit<DatePickerProps, 'value' | 'onChange'> {
	initialValue?: Date | null;  // Initial date value
}
```

### Usage

```tsx
const { date, setDate, datePickerElement, clearDate } = useDatePicker({
	initialValue: new Date(),
	onSave: (newDate) => {
		console.log('Selected:', newDate);
	},
	minDate: new Date(),
});

return (
	<div>
		<p>Selected: {date?.toDateString() || 'None'}</p>
		{datePickerElement}
		<button onClick={clearDate}>Clear</button>
	</div>
);
```

### Returns

- `date` - Current selected date
- `setDate` - Function to update date
- `datePickerElement` - DatePicker element to render
- `clearDate` - Function to clear date

### Features

- ✅ Manages date state
- ✅ Provides clear function
- ✅ Simplest way to use DatePicker
- ✅ Can be used standalone or in popup

---

## 🎨 Width/Height Classes

### Width Classes

| Class | Min Width |
|-------|-----------|
| (default) | 230px |
| `xs-width` | 180px |
| `md-width` | 340px |
| `lg-width` | 420px |
| `xl-width` | 640px |

### Height Classes

| Class | Max Height |
|-------|------------|
| (default) | 293px |
| `md-height` | 370px |
| `xl-height` | none (full) |

### Combined Usage

```tsx
wrapperClass="md-width"           // 340px wide, default height
wrapperClass="xl-height"          // Default width, full height
wrapperClass="md-width xl-height" // 340px wide, full height
wrapperClass="xl-width md-height" // 640px wide, 370px height
```

---

## 🎨 CSS Classes Reference

### Popup Structure

```
.ts-popup-root                   // Layer 1: Fullscreen overlay (z-index: 500000)
  └── div (backdrop)              // Layer 2: Backdrop with :after overlay
      └── .ts-field-popup-container  // Layer 3: Positioning
          └── .ts-field-popup        // Layer 4: Popup box
              ├── .ts-popup-head        // Header (optional)
              │   ├── .ts-popup-name       // Title area
              │   └── ul.simplify-ul       // Close button
              ├── .ts-popup-content-wrapper  // Content
              │   └── .ts-form-group          // Form groups
              └── .ts-popup-controller      // Footer buttons
                  └── ul.flexify.simplify-ul   // Button list
                      ├── li .ts-popup-close   // Close (mobile)
                      ├── li .hide-d/.hide-m   // Clear button
                      └── li                   // Save button
```

### Button Classes

```tsx
// Button types
.ts-btn.ts-btn-1    // Secondary button (Clear)
.ts-btn.ts-btn-2    // Primary button (Save)
.ts-btn.ts-btn-4    // Tertiary button (Load more, etc.)
.ts-icon-btn        // Icon button

// Button states
.ts-filled          // Filled state (selected)
```

### Form Classes

```tsx
.ts-form-group      // Form group wrapper
.ts-filter          // Input field
.ts-input-box       // Text input
.ts-popup-target    // Clickable trigger
.ts-filled          // Filled state
```

### Utility Classes

```tsx
.flexify            // Flex layout
.simplify-ul        // Reset ul styles
.min-scroll         // Minimal scrollbar
.ts-sticky-top      // Sticky positioning
.hide-d             // Hide on desktop
.hide-m             // Hide on mobile
```

---

## 🎯 Event Handlers

### onSave

**Purpose:** Handle save action  
**Behavior:** Called when Save button clicked  
**Expected:** Close popup after save

```tsx
onSave={() => {
	// 1. Validate data
	// 2. Save data
	// 3. Close popup
	onClose();
}}
```

---

### onClear

**Purpose:** Handle clear action  
**Behavior:** Called when Clear button clicked  
**Expected:** Keep popup open (Voxel behavior)

```tsx
onClear={() => {
	// 1. Clear form fields
	// 2. Reset state
	// 3. DO NOT close popup
}}
```

---

### onClose

**Purpose:** Handle popup close  
**Behavior:** Called on backdrop click, ESC key, close button  
**Expected:** Close popup

```tsx
onClose={() => {
	setIsOpen(false);
}}
```

---

### onBlur

**Purpose:** Handle focus leaving popup  
**Behavior:** Called when focus leaves FormGroup wrapper  
**Expected:** Optional auto-save or validation

```tsx
onBlur={() => {
	// Optional: Auto-save on blur
	console.log('Popup closed via blur');
}}
```

---

### DatePicker onSave (CRITICAL)

**Purpose:** Handle date selection  
**Behavior:** Called **immediately** after date selected  
**Expected:** Close popup (if in popup)

```tsx
onSave={() => {
	// CRITICAL: This is called IMMEDIATELY after date selection
	// Close popup here
	closePopup();
}}
```

---

## 🧪 Type Definitions

### FormPopupProps

```tsx
interface FormPopupProps {
	isOpen: boolean;
	popupId: string;
	title?: string;
	icon?: string;
	saveLabel?: string;
	clearLabel?: string;
	showSave?: boolean;
	showClear?: boolean;
	showClearMobile?: boolean;
	showClose?: boolean;
	onSave: () => void;
	onClear?: () => void;
	onClose: () => void;
	children: React.ReactNode;
	wrapperClass?: string;
	controllerClass?: string;
}
```

### FormGroupProps

```tsx
interface FormGroupProps {
	popupId: string;
	children: ReactNode;
	renderTrigger: () => ReactNode;
	renderPopup: (popupProps: {
		isOpen: boolean;
		popupId: string;
		onClose: () => void;
	}) => ReactNode;
	wrapperClass?: string;
	controllerClass?: string;
	className?: string;
	defaultClass?: boolean;
	onSave?: () => void;
	onClear?: () => void;
	onBlur?: () => void;
}
```

### DatePickerProps

```tsx
interface DatePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	onSave?: () => void;
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
	format?: string;
	firstDay?: number;
	showMonthAfterYear?: boolean;
	yearRange?: number | [number, number];
	numberOfMonths?: number;
	mainCalendar?: 'left' | 'right';
}
```

---

## 📚 Related Documentation

- **Usage Guide:** `popup-kit-phase-a-usage.md`
- **Implementation:** `popup-kit-phase-a-implementation.md`
- **Discovery:** `popup-kit-phase-a-discovery.md`

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Complete

