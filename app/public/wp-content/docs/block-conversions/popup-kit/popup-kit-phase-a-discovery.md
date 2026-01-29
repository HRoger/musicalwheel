# Popup Kit - Phase A: Discovery Findings

**Date:** November 24, 2025  
**Objective:** Discover Voxel's popup implementation before building reusable React components  
**Status:** ✅ Complete

---

## 🔍 Discovery Summary

Voxel's popup system is a **4-layer structure** built with Vue.js, using Teleport to render popups to the document body. The system consists of:

1. **FormGroup Component** - Manages popup state and handles open/close logic
2. **FormPopup Component** - Renders the actual popup UI with proper structure
3. **Supporting CSS** - `popup-kit.css` for animations and styling
4. **Vue Components** - Template-based Vue components in PHP files

---

## 📁 Key Files Discovered

### 1. Form Group Component

**File:** `app/public/wp-content/themes/voxel/templates/components/form-group.php`  
**Lines:** 1-35

```php
<script type="text/html" id="voxel-form-group-template">
	<component :is="tag" :class="{'ts-form-group': defaultClass}">
		<slot name="trigger"></slot>
		<teleport to="body">
			<transition name="form-popup">
				<form-popup
					ref="popup"
					v-if="$root.activePopup === popupKey"
					:class="wrapperClass"
					:controller-class="controllerClass"
					:target="popupTarget"
					:show-save="showSave"
					:show-clear="showClear"
					:show-clear-mobile="showClearMobile"
					:show-close="showClose"
					:save-label="saveLabel"
					:clear-label="clearLabel"
					:prevent-blur="preventBlur"
					@blur="onPopupBlur"
					@save="$emit('save', this);"
					@clear="$emit('clear', this);"
				>
					<slot name="popup"></slot>
					<template #controller>
						<slot name="controller"></slot>
					</template>
					<template #custom-actions>
						<slot name="custom-actions"></slot>
					</template>
				</form-popup>
			</transition>
		</teleport>
	</component>
</script>
```

**Key Behaviors:**
- Uses Vue Teleport to move popup to `<body>`
- Opens popup when `$root.activePopup === popupKey`
- Emits `save`, `clear`, `blur` events
- Has `trigger` and `popup` slots for content

---

### 2. Form Popup Component

**File:** `app/public/wp-content/themes/voxel/templates/components/popup.php`  
**Lines:** 1-57

```php
<script type="text/html" id="voxel-popup-template">
	<div class="elementor vx-popup" :class="'elementor-'+$root.post_id">
		<div class="ts-popup-root elementor-element" :class="'elementor-element-'+$root.widget_id+'-wrap'" v-cloak>
			<div class="ts-form elementor-element" :class="'elementor-element-'+$root.widget_id" :style="styles" ref="popup">
				<div class="ts-field-popup-container">
					<div class="ts-field-popup triggers-blur" ref="popup-box">
						<div class="ts-popup-content-wrapper min-scroll">
							<slot></slot>
						</div>
						<slot name="controller">
							<div class="ts-popup-controller" :class="controllerClass" v-if="showSave || showClear">
								<ul class="flexify simplify-ul">
									<li class="flexify ts-popup-close">
										<a @click.prevent="$emit('blur')" href="#" class="ts-icon-btn" role="button">
											<?= \Voxel\svg( 'close.svg' ) ?>
										</a>
									</li>
									<li class="flexify hide-d" @click.prevent="$emit('clear')">
										<a v-if="showClear && showClearMobile" href="#" class="ts-icon-btn">
											<?= \Voxel\svg( 'reload.svg' ) ?>
										</a>
									</li>
									<li class="flexify hide-m" @click.prevent="$emit('clear')">
										<a v-if="showClear" href="#" class="ts-btn ts-btn-1">
											{{ clearLabel || 'Clear' }}
										</a>
									</li>
									<slot name="custom-actions"></slot>
									<li class="flexify">
										<a v-if="showSave" href="#" class="ts-btn ts-btn-2" @click.prevent="$emit('save')">
											{{ saveLabel || 'Save' }}
											<div class="ts-loader-wrapper">
												<span class="ts-loader"></span>
											</div>
										</a>
									</li>
								</ul>
							</div>
						</slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</script>
```

**Key Structure (4 Layers):**

1. **Layer 1:** `ts-popup-root` - Fullscreen overlay container (z-index: 500000)
2. **Layer 2:** `div` wrapper - Backdrop with `:after` pseudo-element for overlay
3. **Layer 3:** `ts-field-popup-container` - Positioning and margins
4. **Layer 4:** `ts-field-popup` - The actual popup box with content

**Controller Structure:**
- `<ul>` with `flexify simplify-ul` classes
- Each button in `<li>`
- Links styled as buttons (`ts-btn ts-btn-1`, `ts-btn ts-btn-2`)

---

### 3. Date Field Example

**File:** `app/public/wp-content/themes/voxel/templates/widgets/create-post/date-field.php`  
**Lines:** 1-62

```php
<script type="text/html" id="create-post-date-field">
	<form-group
		:popup-key="field.id+':'+index"
		ref="formGroup"
		@save="onSave"
		@blur="saveValue"
		@clear="onClear"
		wrapper-class="md-width xl-height"
	>
		<template #trigger>
			<label>
				{{ field.label }}
				<slot name="errors"></slot>
			</label>
			<div class="ts-filter ts-popup-target" :class="{'ts-filled': field.value.date !== null}" @mousedown="$root.activePopup = field.id+':'+index">
				<?= \Voxel\get_icon_markup( $this->get_settings_for_display('ts_calendar_icon') ) ?: \Voxel\svg( 'calendar.svg' ) ?>
				<div class="ts-filter-text">
					{{ displayValue || field.props.placeholder }}
				</div>
			</div>
		</template>
		<template #popup>
			<date-picker ref="picker" :field="field" :parent="this"></date-picker>
		</template>
	</form-group>
</script>
```

**Key Behaviors:**
- `@mousedown` on trigger opens popup by setting `$root.activePopup`
- `@blur="saveValue"` saves value when popup loses focus
- `@save="onSave"` explicit save action
- `wrapper-class` controls popup width/height classes

---

### 4. Popup Kit Widget

**File:** `app/public/wp-content/themes/voxel/app/widgets/popup-kit.php`  
**Lines:** 1-1637

**Purpose:** Elementor widget for styling Voxel popups globally  
**CSS Dependency:** `vx:popup-kit.css` (line 1631)

This widget provides Elementor controls for styling all popup components:
- General appearance
- Popup head
- Controller buttons
- Labels and descriptions
- Menu styling
- File gallery
- Calendar (Pikaday)
- Notifications
- Cart
- Alerts

---

### 5. Popup Kit CSS

**File:** `app/public/wp-content/themes/voxel/assets/dist/popup-kit.css`

**Key CSS Classes:**

#### Root/Overlay Structure
```css
.ts-popup-root {
    position: absolute !important;
    top: 0;
    left: 0;
    z-index: 500000 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.ts-popup-root > div {
    pointer-events: all;
}

.ts-popup-root > div:after {
    pointer-events: none;
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    content: "";
    animation-name: smooth;
    animation-fill-mode: forwards;
    animation-duration: 0.2s;
    opacity: 0;
    will-change: opacity;
    transform: translateZ(0);
}
```

#### Popup Container & Box
```css
.ts-field-popup-container {
    position: relative;
    z-index: 50;
    width: 100%;
    margin: 10px 0;
    backface-visibility: hidden;
}

.ts-field-popup {
    background: #fff;
    border: 1px solid var(--ts-shade-3);
    box-shadow: 0 2px 8px 0 rgba(99, 99, 99, 0.2);
    border-radius: 0.475rem;
    width: 100%;
    left: 0;
    top: 0;
    min-width: 230px;
    overflow: hidden;
}
```

#### Content Wrapper
```css
.ts-popup-content-wrapper {
    max-height: 293px; /* Default, overridden by classes */
}

.md-height .ts-popup-content-wrapper {
    max-height: 370px;
}

.xl-height .ts-popup-content-wrapper {
    max-height: none;
}
```

#### Popup Head
```css
.ts-popup-head {
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 0.5px solid var(--ts-shade-4);
    padding: 10px 15px;
    height: 50px;
}

.ts-popup-name {
    align-items: center;
    flex-wrap: nowrap;
    grid-gap: 7px;
    min-width: 0;
    --ts-icon-size: 20px;
    --ts-icon-color: var(--ts-shade-4);
}
```

#### Controller Buttons
```css
.ts-popup-controller {
    padding: 10px 15px;
    border-top: 0.5px solid;
    border-color: var(--ts-shade-4);
}

.ts-popup-controller ul {
    grid-gap: 10px;
}

.ts-popup-controller ul li:last-child {
    margin-left: auto;
}
```

#### Animations

**Desktop (Smooth Reveal):**
```css
@keyframes smooth-reveal {
    0% {
        opacity: 0;
        transform: scale(0.95) translateZ(0);
    }
    to {
        opacity: 1;
        transform: scale(1) translateZ(0);
    }
}

.ts-form .ts-field-popup {
    animation-name: smooth-reveal;
    animation-fill-mode: forwards;
    animation-duration: 0.5s;
    animation-timing-function: cubic-bezier(0.22, 0.68, 0, 1);
    opacity: 0;
    will-change: transform, opacity;
}
```

**Mobile (Slide Up):**
```css
@keyframes slide-up {
    0% {
        opacity: 0;
        transform: translateY(150px) translateZ(0);
    }
    to {
        opacity: 1;
        transform: translateY(0) translateZ(0);
    }
}

@media (max-width: 1024px) {
    .ts-form .ts-field-popup {
        animation-name: slide-up;
        animation-fill-mode: forwards;
        animation-duration: 0.4s;
        animation-timing-function: cubic-bezier(0.22, 0.48, 0, 1);
        will-change: transform, opacity;
    }
    
    .ts-field-popup-container {
        position: fixed;
        bottom: 0;
        top: 0 !important;
        left: 0;
        right: 0;
        margin: 0 !important;
        height: 100dvh;
        display: flex;
        min-height: -webkit-fill-available;
    }
}
```

**Backdrop Overlay:**
```css
@keyframes smooth {
    0% {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@media (max-width: 1024px) {
    .ts-popup-root > div:after {
        background: rgba(49, 49, 53, 0.631372549);
    }
}
```

---

## 🎨 Width/Height Classes

**Width Classes:**
- `xs-width` - min-width: 180px
- Default - min-width: 230px
- `md-width` - min-width: 340px
- `lg-width` - min-width: 420px
- `xl-width` - min-width: 640px

**Height Classes:**
- Default - max-height: 293px
- `md-height` - max-height: 370px
- `xl-height` - max-height: none (full height)

---

## 🔧 Pikaday Integration

Pikaday date picker is used within popups. Key characteristics:

**Configuration (from compiled auth.js analysis):**
```javascript
new Pikaday({
    field: inputRef.current,
    container: calendarRef.current,
    bound: false,  // CRITICAL: Inline rendering, not bound to input
    firstDay: 1,  // Monday
    keyboardInput: false,
    defaultDate: value,
    onSelect: (date) => {
        parent.date = date;
        parent.onSave();  // CRITICAL: Calls onSave immediately
    },
    selectDayFn: (date) => {
        // Highlight selected date
        return value && value.toDateString() === date.toDateString();
    }
});
```

**Critical Behavior:**
- `onSelect` **immediately** calls `parent.onSave()` after date selection
- No need for explicit save button click on date selection
- Inline rendering (`bound: false`)
- Month/year selectors enabled

---

## 🎯 Key Implementation Insights

### 1. State Management
- Global `activePopup` property controls which popup is open
- Only ONE popup can be open at a time
- Popup key = `field.id + ':' + index` (unique identifier)

### 2. Opening/Closing Logic
- **Open:** `@mousedown="$root.activePopup = popupKey"`
- **Close:** Any of:
  - Backdrop click
  - ESC key
  - `@blur` event
  - Explicit `@save` or `@clear` action

### 3. Focus/Blur Behavior
- `@blur="saveValue"` - Auto-save when focus leaves popup
- Clicking inside popup doesn't close it (stopPropagation)
- Clicking backdrop closes popup

### 4. Button Structure
- **CRITICAL:** Buttons are `<a>` tags, NOT `<button>` tags
- Wrapped in `<ul><li>` structure
- Clear button on left (desktop) or icon (mobile)
- Save button on right with `margin-left: auto` on parent `<li>`

### 5. Responsive Behavior
- **Desktop:**
  - Fullscreen overlay with centered popup
  - `smooth-reveal` animation (scale + opacity)
  - Close button hidden (`.ts-popup-close { display: none }`)
  
- **Mobile:**
  - Fixed position, slide up from bottom
  - `slide-up` animation (translateY + opacity)
  - Controller at top (reversed flex-direction)
  - Full viewport height options

---

## 📊 CSS Variable Usage

Voxel uses CSS variables extensively:

```css
--ts-shade-1  /* Primary text color */
--ts-shade-2  /* Secondary text color */
--ts-shade-3  /* Border color */
--ts-shade-4  /* Light border color */
--ts-shade-5  /* Background light */
--ts-shade-6  /* Hover background */
--ts-icon-size  /* Icon size */
--ts-icon-color  /* Icon color */
--ts-accent-1  /* Primary accent color */
```

---

## 🚧 Challenges Identified

### 1. **Teleport to Body**
React doesn't have Vue's Teleport. Solution: Use React Portal (`ReactDOM.createPortal`)

### 2. **Global State Management**
Vue's `$root.activePopup` manages open state globally. Solution: Use React Context or prop drilling

### 3. **CSS Animations**
Vue transition names map to CSS classes. Solution: Apply animation classes directly to React elements

### 4. **Backdrop Click Detection**
Need to detect clicks outside popup. Solution: 
- Click on outer `div` closes popup
- `event.stopPropagation()` on inner popup prevents closing

### 5. **ESC Key Handler**
Global keyboard listener needed. Solution: `useEffect` with `keydown` listener

---

## ✅ Implementation Checklist

### Phase 1: Core Components
- [ ] Create `FormGroup.tsx` component (manages state, uses Portal)
- [ ] Create `FormPopup.tsx` component (renders 4-layer structure)
- [ ] Create popup context for global state management
- [ ] Implement backdrop click handler
- [ ] Implement ESC key handler

### Phase 2: Styling & Animation
- [ ] Copy/adapt popup-kit.css classes
- [ ] Implement smooth-reveal animation (desktop)
- [ ] Implement slide-up animation (mobile)
- [ ] Add responsive breakpoints (1024px)
- [ ] Test width/height classes

### Phase 3: Date Picker (Optional)
- [ ] Install Pikaday library
- [ ] Create `DatePicker.tsx` wrapper
- [ ] Implement month/year selectors
- [ ] Connect onSelect to onSave (immediate save)
- [ ] Test standalone and in-popup modes

### Phase 4: Block Registration
- [ ] Create `block.json` for popup block
- [ ] Create block edit component
- [ ] Register block with WordPress
- [ ] Test in Gutenberg editor

### Phase 5: Integration & Testing
- [ ] Test with create-post block
- [ ] Test all animations
- [ ] Test responsive behavior
- [ ] Test accessibility (ARIA labels, keyboard nav)
- [ ] Performance testing

---

## 📝 Notes for Implementation

1. **Popup IS a Component, Not a Block**
   - Similar to Voxel's approach (popup IS a widget/component)
   - Used programmatically, not inserted directly
   - `inserter: false` in block.json

2. **Match HTML Structure Exactly**
   - 4-layer structure is critical for CSS to work
   - Class names must match Voxel exactly
   - Button structure (`<ul><li><a>`) must be preserved

3. **CSS Variables Required**
   - Ensure Voxel's CSS variables are available
   - May need to enqueue popup-kit.css
   - Or copy relevant styles to child theme

4. **Focus Management**
   - Auto-focus first input when popup opens
   - Trap focus within popup (accessibility)
   - Restore focus to trigger when popup closes

5. **Performance Considerations**
   - Only ONE popup rendered at a time
   - Use `display: none` instead of conditional rendering
   - Optimize animations with `will-change`

---

## 🔗 Related Files Created

- `docs/conversions/popup-kit/popup-kit-phase-a-discovery.md` (this file)
- Next: `docs/conversions/popup-kit/popup-kit-phase-a-implementation.md`
- Next: `docs/conversions/popup-kit/popup-kit-phase-a-usage.md`
- Next: `docs/conversions/popup-kit/popup-kit-phase-a-api.md`

---

**Discovery Complete:** ✅ November 24, 2025  
**Next Phase:** Implementation  
**Estimated Time:** 2-3 hours

