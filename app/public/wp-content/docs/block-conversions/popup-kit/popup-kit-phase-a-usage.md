# Popup Kit - Phase A: Usage Guide

**Date:** November 24, 2025  
**Status:** ✅ Complete  
**Components:** FormGroup, FormPopup, DatePicker

---

## 🎯 Overview

The Voxel Popup components provide a reusable popup system that matches Voxel's `popup-kit.css` exactly. Use these components in your blocks to create popups for any purpose.

---

## 📦 Available Components

### 1. FormPopup
Renders the 4-layer popup structure with animations, backdrop, and buttons.

### 2. FormGroup
Manages popup state, handles open/close, and uses React Portal to teleport popup to `<body>`.

### 3. DatePicker (Optional)
Pikaday integration with immediate save on date selection.

---

## 🚀 Quick Start

### Example 1: Simple Popup with useFormPopup Hook

```tsx
import React from 'react';
import { useFormPopup } from '../popup/components';

export const MyBlock: React.FC = () => {
	const { openPopup, closePopup, popupElement } = useFormPopup({
		popupId: 'my-popup',
		title: 'My Popup',
		renderContent: () => (
			<div className="ts-form-group">
				<label>Label</label>
				<input type="text" className="ts-filter" />
			</div>
		),
		onSave: () => {
			console.log('Saved!');
			// Handle save logic
		},
		onClear: () => {
			console.log('Cleared!');
			// Handle clear logic
		},
		wrapperClass: 'md-width xl-height',
	});

	return (
		<>
			<button onClick={openPopup}>Open Popup</button>
			{popupElement}
		</>
	);
};
```

---

### Example 2: FormGroup with Custom Trigger

```tsx
import React from 'react';
import { FormGroup, FormPopup } from '../popup/components';

export const MyBlock: React.FC = () => {
	return (
		<FormGroup
			popupId="custom-popup"
			renderTrigger={() => (
				<div className="ts-filter ts-popup-target">
					<span>Click to open</span>
				</div>
			)}
			renderPopup={({ isOpen, popupId, onClose }) => (
				<FormPopup
					isOpen={isOpen}
					popupId={popupId}
					title="Custom Popup"
					onSave={() => {
						console.log('Saved!');
						onClose();
					}}
					onClose={onClose}
				>
					<div className="ts-form-group">
						<p>Popup content goes here</p>
					</div>
				</FormPopup>
			)}
		>
			{/* Additional content */}
		</FormGroup>
	);
};
```

---

### Example 3: DatePicker with Popup

```tsx
import React, { useState } from 'react';
import { useFormPopup, DatePicker } from '../popup/components';

export const DateFieldBlock: React.FC = () => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	const { openPopup, closePopup, popupElement } = useFormPopup({
		popupId: 'date-picker-popup',
		title: 'Select Date',
		icon: '<svg>...</svg>',
		renderContent: () => (
			<DatePicker
				value={selectedDate}
				onChange={setSelectedDate}
				onSave={closePopup} // CRITICAL: Auto-save on select
			/>
		),
		onSave: () => {
			console.log('Selected date:', selectedDate);
		},
		wrapperClass: 'md-width xl-height',
		showClear: true,
		onClear: () => {
			setSelectedDate(null);
		},
	});

	return (
		<>
			<div className="ts-filter ts-popup-target" onClick={openPopup}>
				{selectedDate ? selectedDate.toDateString() : 'Select date'}
			</div>
			{popupElement}
		</>
	);
};
```

---

### Example 4: Standalone DatePicker (No Popup)

```tsx
import React from 'react';
import { useDatePicker } from '../popup/components';

export const SimpleDatePicker: React.FC = () => {
	const { date, datePickerElement, clearDate } = useDatePicker({
		onSave: (newDate) => {
			console.log('Date selected:', newDate);
		},
	});

	return (
		<div>
			{datePickerElement}
			<button onClick={clearDate}>Clear</button>
		</div>
	);
};
```

---

## 🎨 Width/Height Classes

Control popup size with `wrapperClass`:

```tsx
// Width classes
wrapperClass="xs-width"  // min-width: 180px
wrapperClass="md-width"  // min-width: 340px
wrapperClass="lg-width"  // min-width: 420px
wrapperClass="xl-width"  // min-width: 640px

// Height classes
wrapperClass="md-height"   // max-height: 370px
wrapperClass="xl-height"   // max-height: none (full)

// Combined
wrapperClass="md-width xl-height"
```

---

## 🔧 Common Patterns

### Pattern 1: Conditional Popup with State

```tsx
import React, { useState } from 'react';
import { FormPopup } from '../popup/components';
import { createPortal } from 'react-dom';

export const ConditionalPopup: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [value, setValue] = useState('');

	const popupElement = isOpen
		? createPortal(
				<FormPopup
					isOpen={isOpen}
					popupId="conditional-popup"
					title="Enter Value"
					onSave={() => {
						console.log('Value:', value);
						setIsOpen(false);
					}}
					onClose={() => setIsOpen(false)}
				>
					<div className="ts-form-group">
						<input
							type="text"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="ts-filter"
						/>
					</div>
				</FormPopup>,
				document.body
		  )
		: null;

	return (
		<>
			<button onClick={() => setIsOpen(true)}>Open</button>
			{popupElement}
		</>
	);
};
```

---

### Pattern 2: Multiple Popups (One at a Time)

```tsx
import React, { useState } from 'react';
import { useFormPopup } from '../popup/components';

export const MultiplePopups: React.FC = () => {
	const popup1 = useFormPopup({
		popupId: 'popup-1',
		title: 'Popup 1',
		renderContent: () => <div>Content 1</div>,
		onSave: () => console.log('Popup 1 saved'),
	});

	const popup2 = useFormPopup({
		popupId: 'popup-2',
		title: 'Popup 2',
		renderContent: () => <div>Content 2</div>,
		onSave: () => console.log('Popup 2 saved'),
	});

	return (
		<>
			<button onClick={popup1.openPopup}>Open Popup 1</button>
			<button onClick={popup2.openPopup}>Open Popup 2</button>

			{popup1.popupElement}
			{popup2.popupElement}
		</>
	);
};
```

**Note:** Only one popup can be open at a time (Voxel behavior).

---

### Pattern 3: Popup with Custom Actions

```tsx
import React from 'react';
import { FormPopup } from '../popup/components';
import { createPortal } from 'react-dom';

export const CustomActionsPopup: React.FC = () => {
	const [isOpen, setIsOpen] = React.useState(false);

	const popupElement = isOpen
		? createPortal(
				<FormPopup
					isOpen={isOpen}
					popupId="custom-actions"
					title="Custom Actions"
					showSave={false}
					showClear={false}
					onClose={() => setIsOpen(false)}
				>
					<div className="ts-form-group">
						<p>Custom content</p>
					</div>
					<div className="ts-popup-controller">
						<ul className="flexify simplify-ul">
							<li>
								<a href="#" className="ts-btn ts-btn-1">
									Cancel
								</a>
							</li>
							<li>
								<a href="#" className="ts-btn ts-btn-2">
									Apply
								</a>
							</li>
							<li>
								<a href="#" className="ts-btn ts-btn-2">
									Delete
								</a>
							</li>
						</ul>
					</div>
				</FormPopup>,
				document.body
		  )
		: null;

	return (
		<>
			<button onClick={() => setIsOpen(true)}>Open</button>
			{popupElement}
		</>
	);
};
```

---

## 📱 Responsive Behavior

Popups adapt automatically:

**Desktop (> 1024px):**
- Fullscreen overlay with centered popup
- `smooth-reveal` animation (scale + opacity)
- Close button hidden in controller

**Mobile (≤ 1024px):**
- Fixed position, slide up from bottom
- `slide-up` animation (translateY + opacity)
- Controller at top (reversed flex-direction)
- Full viewport height options

---

## 🎨 Styling

### Using Voxel's CSS Classes

```tsx
<div className="ts-form-group">
	<label>Label</label>
	<input type="text" className="ts-filter" />
</div>
```

### Custom Styles

Add custom styles in your block's `style.css`:

```css
.my-custom-popup .ts-popup-content-wrapper {
	padding: 20px;
}

.my-custom-popup .ts-form-group {
	margin-bottom: 15px;
}
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Call onClose

```tsx
// ❌ WRONG: Popup never closes
<FormPopup
	isOpen={isOpen}
	onSave={() => {
		console.log('Saved');
		// Forgot to close!
	}}
/>

// ✅ RIGHT: Always close after save
<FormPopup
	isOpen={isOpen}
	onSave={() => {
		console.log('Saved');
		onClose(); // Or setIsOpen(false)
	}}
/>
```

---

### 2. Not Using React Portal for FormPopup

```tsx
// ❌ WRONG: Renders inline (z-index issues)
<FormPopup isOpen={isOpen} ... />

// ✅ RIGHT: Use Portal to teleport to body
{isOpen && createPortal(
	<FormPopup isOpen={isOpen} ... />,
	document.body
)}

// OR use useFormPopup hook (handles Portal automatically)
const { popupElement } = useFormPopup({ ... });
```

---

### 3. DatePicker onSave Not Triggering

```tsx
// ❌ WRONG: onSave not provided
<DatePicker
	value={date}
	onChange={setDate}
	// Missing onSave!
/>

// ✅ RIGHT: Provide onSave for immediate save
<DatePicker
	value={date}
	onChange={setDate}
	onSave={handleSave} // CRITICAL
/>
```

---

## 🧪 Testing Your Popup

1. **Backdrop Click:** Click outside popup → should close
2. **ESC Key:** Press ESC → should close
3. **Save Button:** Click Save → should trigger `onSave` and close
4. **Clear Button:** Click Clear → should trigger `onClear` (keep open)
5. **Animations:** Check smooth-reveal (desktop) and slide-up (mobile)
6. **Responsive:** Test on desktop and mobile
7. **Multiple Popups:** Only one should be open at a time

---

## 📚 Next Steps

- **API Reference:** See `popup-kit-phase-a-api.md`
- **Implementation Details:** See `popup-kit-phase-a-implementation.md`
- **Discovery:** See `popup-kit-phase-a-discovery.md`

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Complete

