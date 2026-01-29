# Prompt: Build Voxel Popup Block

**Date:** November 24, 2025  
**Priority:** 🔴 HIGH - Foundation for all popup-based fields  
**Estimated Time:** 3-4 hours  
**Dependencies:** None (standalone feature)

---

## 🎯 Objective

Build a reusable **`voxel-fse/popup`** Gutenberg block that exactly matches Voxel's popup system (`popup-kit.css`). This block will be used by the create-post block and all future blocks that need popup functionality.

---

## 📋 Requirements

### Core Functionality

1. **FormGroup Component**
   - Manages popup open/close state
   - Handles focus/blur events
   - Uses React Portal for teleport to body
   - Matches Voxel's `form-group` Vue component behavior

2. **FormPopup Component**
   - **CRITICAL:** 4-layer structure matching popup-kit.css exactly:
     ```
     ts-popup-root (fullscreen overlay)
     └── div (backdrop wrapper - gets :after overlay)
         └── ts-field-popup-container (positioning)
             └── ts-field-popup (popup box)
                 ├── ts-popup-head (header)
                 ├── ts-popup-content-wrapper (content)
                 └── ts-popup-controller (footer buttons)
     ```
   - Backdrop click closes popup
   - ESC key closes popup
   - Clear/Save buttons in proper structure (`<ul><li><a>`)
   - Fullscreen on desktop, slide-up on mobile
   - Smooth animations (smooth-reveal on desktop, slide-up on mobile)

3. **Date Picker Integration**
   - Pikaday.js integration
   - Month/year selectors
   - **CRITICAL:** `onSelect` must call `onSave()` immediately (Voxel behavior)
   - Date highlighting for selected date
   - Can be used standalone OR inside popup

4. **CSS Integration**
   - Enqueue or copy `themes/voxel/assets/dist/popup-kit.css`
   - Ensure all animations work
   - Verify z-index (500000 for ts-popup-root)
   - Test responsive behavior (desktop vs mobile)

---

## 🔍 Discovery Requirements (MANDATORY)

### ⚠️ CRITICAL: Discovery-First Methodology

**BEFORE writing ANY code, you MUST:**

1. **Read popup-kit.css completely**
   - File: `themes/voxel/assets/dist/popup-kit.css`
   - Document all CSS classes used
   - Note all animations
   - Understand responsive breakpoints

2. **Study Voxel's Vue components**
   - File: `themes/voxel/templates/widgets/create-post/components/form-group.php`
   - File: `themes/voxel/templates/widgets/create-post/components/form-popup.php`
   - File: `themes/voxel/templates/widgets/create-post/date-field.php`
   - Understand how they work together

3. **Analyze compiled JavaScript**
   - File: `themes/voxel/assets/dist/auth.js`
   - Find Pikaday initialization
   - Understand onSelect behavior
   - Note: `onSelect: e => { this.parent.date = e, this.parent.onSave() }`

4. **Test Voxel's actual popup**
   - Open Voxel's create-post form
   - Inspect popup HTML structure
   - Check CSS classes
   - Test behavior (backdrop click, ESC key, etc.)
   - Take screenshots for reference

5. **Document findings**
   - Create `docs/conversions/popup-kit/popup-kit-phase-a-discovery.md`
   - Include file paths and line numbers
   - Include code snippets as evidence
   - Document all CSS classes and their purposes

---

## 📁 File Structure to Create

```
app/blocks/src/popup/
├── block.json              # Block registration
├── index.tsx               # Block edit component
├── save.tsx                # Block save (null - dynamic)
├── style.css               # Block styles (if needed)
├── editor.css              # Editor styles (if needed)
└── components/
    ├── FormGroup.tsx       # Popup state management
    ├── FormPopup.tsx       # 4-layer popup UI
    └── index.ts            # Exports

app/blocks/src/date-picker/  # Optional but recommended
├── block.json
├── index.tsx
├── save.tsx
├── style.css
└── components/
    ├── DatePicker.tsx      # Pikaday integration
    └── index.ts
```

---

## 🎨 Block Configuration

### popup Block (voxel-fse/popup)

```json
{
  "apiVersion": 2,
  "name": "voxel-fse/popup",
  "title": "Voxel Popup",
  "category": "voxel-fse",
  "icon": "admin-collapse",
  "description": "Reusable popup component matching Voxel's popup-kit.css",
  "supports": {
    "html": false,
    "inserter": false  // Hidden - used programmatically
  },
  "attributes": {
    "popupId": {
      "type": "string",
      "default": ""
    },
    "title": {
      "type": "string",
      "default": ""
    },
    "showClear": {
      "type": "boolean",
      "default": true
    },
    "clearLabel": {
      "type": "string",
      "default": "Clear"
    },
    "saveLabel": {
      "type": "string",
      "default": "Save"
    }
  }
}
```

---

## 🔧 Implementation Details

### FormGroup Component

**Purpose:** Manages popup state and handles focus/blur

**Props:**
```typescript
interface FormGroupProps {
  popupId: string;
  children: React.ReactNode;
  renderPopup: (props: {
    isOpen: boolean;
    popupId: string;
    onClose: () => void;
  }) => React.ReactNode;
  className?: string;
}
```

**Behavior:**
- Opens popup on focus
- Closes popup on blur (when focus leaves wrapper)
- Uses React Portal to teleport popup to body
- Matches Voxel's `@blur="saveValue"` behavior

### FormPopup Component

**Purpose:** Renders the actual popup UI

**Props:**
```typescript
interface FormPopupProps {
  isOpen: boolean;
  popupId: string;
  title?: string;
  icon?: string;
  saveLabel?: string;
  clearLabel?: string;
  clearButton?: boolean;
  onSave: () => void;
  onClear?: () => void;
  onClose: () => void;
  children: React.ReactNode;
  popupClass?: string;
}
```

**Structure (CRITICAL - Must Match Exactly):**
```tsx
<div className="ts-popup-root">
  <div onClick={onClose}>  {/* Backdrop click closes */}
    <div className="ts-field-popup-container">
      <div className="ts-field-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ts-popup-head flexify">
          <div className="ts-popup-name flexify">
            {icon && <span dangerouslySetInnerHTML={{ __html: icon }} />}
            <span>{title}</span>
          </div>
          <ul className="flexify simplify-ul">
            <li className="flexify ts-popup-close" onMouseDown={onClose}>
              <a href="#" onClick={(e) => e.preventDefault()} className="ts-icon-btn">
                {/* Close icon */}
              </a>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="ts-popup-content-wrapper">
          {children}
        </div>

        {/* Footer Buttons */}
        <div className="ts-popup-controller flexify">
          <ul className="flexify simplify-ul">
            {clearButton && onClear && (
              <li>
                <a href="#" onClick={onClear} className="ts-btn ts-btn-1">
                  {clearLabel}
                </a>
              </li>
            )}
            <li style={{ marginLeft: clearButton ? 'auto' : undefined }}>
              <a href="#" onClick={onSave} className="ts-btn ts-btn-2">
                {saveLabel}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

### DatePicker Component (Optional but Recommended)

**Purpose:** Pikaday integration for date selection

**Props:**
```typescript
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  onSave?: () => void;  // CRITICAL: Called immediately on date select
}
```

**Pikaday Configuration (CRITICAL - Must Match Voxel):**
```typescript
new Pikaday({
  field: inputRef.current,
  container: calendarRef.current,
  bound: false,  // CRITICAL: Inline rendering
  firstDay: 1,  // Monday
  keyboardInput: false,
  defaultDate: value,
  onSelect: (date: Date) => {
    onChange(date);
    // CRITICAL: Voxel calls onSave immediately
    if (onSave) onSave();
  },
  selectDayFn: (date: Date) => {
    // Highlight selected date
    return value && value.toDateString() === date.toDateString();
  }
});
```

---

## 🧪 Testing Requirements

### Test 1: Popup Structure
- [ ] 4-layer structure renders correctly
- [ ] All CSS classes match Voxel
- [ ] Backdrop overlay appears
- [ ] Z-index is correct (500000)

### Test 2: Popup Behavior
- [ ] Opens on focus
- [ ] Closes on backdrop click
- [ ] Closes on ESC key
- [ ] Closes on blur
- [ ] Clicks inside popup don't close it

### Test 3: Animations
- [ ] Desktop: smooth-reveal animation
- [ ] Mobile: slide-up from bottom
- [ ] Animations are smooth
- [ ] No layout shifts

### Test 4: Buttons
- [ ] Clear button appears (when enabled)
- [ ] Save button appears
- [ ] Buttons are in proper structure (`<ul><li><a>`)
- [ ] Buttons trigger correct callbacks

### Test 5: Date Picker (if implemented)
- [ ] Calendar renders correctly
- [ ] Month/year selectors work
- [ ] Date selection highlights correctly
- [ ] onSelect calls onSave immediately
- [ ] Selected date appears in input field

### Test 6: Responsive
- [ ] Desktop: Fullscreen popup
- [ ] Mobile: Slide-up from bottom
- [ ] Tablet: Appropriate behavior
- [ ] All breakpoints work correctly

---

## 📚 Documentation Requirements

### Create Documentation:

1. **`docs/conversions/popup-kit/popup-kit-phase-a-discovery.md`**
   - All discovery findings
   - Evidence from Voxel code
   - File paths and line numbers
   - Code snippets

2. **`docs/conversions/popup-kit/popup-kit-phase-a-implementation.md`**
   - How it was built
   - Key decisions
   - Challenges and solutions
   - Testing results

3. **`docs/conversions/popup-kit/popup-kit-phase-a-usage.md`**
   - How to use in other blocks
   - Code examples
   - Best practices
   - Common patterns

4. **`docs/conversions/popup-kit/popup-kit-phase-a-api.md`**
   - Component props
   - Methods
   - Events
   - TypeScript types

---

## ⚠️ Critical Rules

### 1. Discovery-First
- **NEVER** guess implementation
- **ALWAYS** check Voxel's actual code first
- **ALWAYS** provide evidence (file paths, line numbers)
- **ALWAYS** document findings before coding

### 2. 1:1 Voxel Matching
- HTML structure must match exactly
- CSS classes must match exactly
- Behavior must match exactly
- NO shortcuts or "similar" implementations

### 3. No Breaking Changes
- Popup block should work standalone
- Should not break existing create-post block
- Should be backward compatible

### 4. Code Quality
- TypeScript strict mode
- Proper error handling
- Accessibility (ARIA labels, keyboard navigation)
- Performance (avoid unnecessary re-renders)

---

## 🔗 References

### Voxel Files to Study:
- `themes/voxel/assets/dist/popup-kit.css` - Popup styles
- `themes/voxel/templates/widgets/create-post/components/form-group.php` - FormGroup component
- `themes/voxel/templates/widgets/create-post/components/form-popup.php` - FormPopup component
- `themes/voxel/templates/widgets/create-post/date-field.php` - Date field example
- `themes/voxel/assets/dist/auth.js` - Compiled Vue components

### Current Create-Post State:
- `docs/conversions/create-post/CREATE-POST-CURRENT-STATE-SUMMARY.md` - Current state
- `docs/conversions/create-post/FIXES-APPLIED-BACKDROP-OPTIONAL.md` - Recent fixes
- `docs/conversions/create-post/POPUP-SYSTEM-REWRITE-COMPLETE.md` - Popup rewrite

### Project Rules:
- `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md` - **READ FIRST**
- `CLAUDE.md` - Project guide

---

## ✅ Success Criteria

### Popup Block is Complete When:
- [ ] FormGroup component works correctly
- [ ] FormPopup component matches Voxel exactly
- [ ] 4-layer structure is correct
- [ ] Backdrop click closes popup
- [ ] ESC key closes popup
- [ ] Clear/Save buttons work
- [ ] Animations work (desktop and mobile)
- [ ] CSS integration is correct
- [ ] Can be imported by other blocks
- [ ] Documentation is complete
- [ ] All tests pass

### Date Picker Block is Complete When (if implemented):
- [ ] Pikaday integration works
- [ ] Month/year selectors work
- [ ] Date selection highlights
- [ ] onSelect calls onSave immediately
- [ ] Can be used standalone OR in popup
- [ ] Documentation is complete
- [ ] All tests pass

---

## 🚀 Implementation Order

### Phase 1: Discovery (30 minutes)
1. Read popup-kit.css completely
2. Study Voxel's Vue components
3. Analyze compiled JavaScript
4. Test Voxel's actual popup
5. Document all findings

### Phase 2: Create Popup Block (1.5 hours)
1. Create block structure
2. Implement FormGroup component
3. Implement FormPopup component
4. Integrate popup-kit.css
5. Test in isolation

### Phase 3: Create Date Picker Block (1 hour)
1. Create block structure
2. Integrate Pikaday
3. Implement month/year selectors
4. Connect onSelect to onSave
5. Test in isolation

### Phase 4: Documentation & Testing (30 minutes)
1. Write all documentation
2. Test all features
3. Fix any issues
4. Verify matches Voxel exactly

**Total: 3-4 hours**

---

## 📝 Notes

### Why This is Important:
- Popup system is foundation for ALL popup-based fields
- Create-post block is blocked until this is done
- Reusable across all future blocks
- Matches Voxel's architecture (popup IS a widget)

### What Happens After:
- Create-post block will use this popup block
- All popup fields will use this block
- Future blocks can use this block
- Clean separation of concerns

### Key Challenges:
- Matching Voxel's exact structure
- CSS integration (popup-kit.css)
- Pikaday onSelect behavior
- Responsive behavior (desktop vs mobile)
- Animations working correctly

---

**Status:** 📋 READY TO START  
**Priority:** 🔴 HIGH  
**Estimated Time:** 3-4 hours  
**Dependencies:** None  
**Blocks:** Create-post block (until this is done)

---

**Last Updated:** November 24, 2025  
**Next:** Start implementation with discovery phase

