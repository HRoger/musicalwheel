# Timeline Style Kit - Visual Inspector Comparison

**Before vs After:** Old PanelBody pattern → New InspectorTabs + AccordionPanelGroup pattern

---

## Tab Structure

### ❌ BEFORE (Old Pattern)
```
┌─────────────────────────────────────┐
│  InspectorControls (no tabs)       │
│                                     │
│  ▼ General                          │
│    • Primary text                   │
│    • Secondary text                 │
│    • Link color                     │
│    • Background                     │
│    • Border Color                   │
│    • Detail color                   │
│    • Box Shadow                     │
│    • XL radius                      │
│    • LG radius                      │
│    • MD radius                      │
│                                     │
│  ▼ Icons                            │
│    • Post Actions                   │
│    • Reply actions                  │
│    • Icon color                     │
│    • Liked Icon color               │
│    • Reposted Icon color            │
│    • Verified Icon color            │
│    • Star Icon color                │
│                                     │
│  ▼ Post reviews                     │
│    • Review categories (Min width)  │
│                                     │
│  ▼ Buttons                          │
│    [Normal] [Hover] ← ButtonGroup   │
│    • Button typography              │
│    • Border radius                  │
│    • Primary button colors          │
│    • Border width (TextControl)     │
│    • Border style (SelectControl)   │
│    • Accent button colors           │
│    • Tertiary button colors         │
│                                     │
│  ▼ Loading spinner                  │
│    (NOT IMPLEMENTED)                │
└─────────────────────────────────────┘
```

### ✅ AFTER (New Pattern)
```
┌─────────────────────────────────────┐
│  🎨 Style  ⚙️ Advanced  🔷 Voxel    │ ← InspectorTabs
│                                     │
│  [Style Tab Active]                 │
│                                     │
│  ▼ General                          │ ← AccordionPanel
│    • Primary text                   │
│    • Secondary text                 │
│    • Link color                     │
│    • Background                     │
│    • Border Color                   │
│    • Detail color                   │
│    • Box Shadow                     │
│    • XL radius                      │
│    • LG radius                      │
│    • MD radius                      │
│                                     │
│  ▶ Icons                            │
│  ▶ Post reviews                     │
│  ▶ Buttons                          │
│  ▶ Loading spinner                  │
└─────────────────────────────────────┘
```

---

## Buttons Section (Expanded)

### ❌ BEFORE
```
▼ Buttons
  ┌─────────────────────────────────┐
  │ [Normal] [Hover]                │ ← Manual ButtonGroup
  └─────────────────────────────────┘

  General (h4 heading)
  • Button typography
  • Border radius

  Primary button (h4 heading)
  • Background
  • Text color
  • Icon color
  • Border color
  • Border width       ← TextControl (string: "1px")
  • Border style       ← SelectControl (dropdown)

  Accent button (h4 heading)
  • Background
  • Text color
  • Icon color
  • Border color
  • Border width       ← TextControl (string: "1px")
  • Border style       ← SelectControl (dropdown)

  Tertiary button (h4 heading)
  • Background
  • Text color
  • Icon color
```

### ✅ AFTER
```
▼ Buttons
  ┌─────────────────────────────────┐
  │ ● Normal   ○ Hover              │ ← StateTabPanel (with persistence)
  └─────────────────────────────────┘

  ──── General ────                  ← SectionHeading
  • Button typography
  • Border radius

  ──── Primary button ────
  • Background
  • Text color
  • Icon color
  ┌─────────────────────────────────┐
  │ Border Type                     │ ← BorderGroupControl
  │ ▼ Solid                         │    (unified control)
  │ ┌───┬───┬───┬───┐               │
  │ │ 1 │ 1 │ 1 │ 1 │ px            │
  │ └───┴───┴───┴───┘               │
  │ [Color Picker]                  │
  └─────────────────────────────────┘

  ──── Accent button ────
  • Background
  • Text color
  • Icon color
  ┌─────────────────────────────────┐
  │ Border Type                     │ ← BorderGroupControl
  │ ▼ Solid                         │
  │ ┌───┬───┬───┬───┐               │
  │ │ 1 │ 1 │ 1 │ 1 │ px            │
  │ └───┴───┴───┴───┘               │
  │ [Color Picker]                  │
  └─────────────────────────────────┘

  ──── Tertiary button ────
  • Background
  • Text color
  • Icon color
```

---

## Loading Spinner Section

### ❌ BEFORE
```
(No Loading Spinner section - missing from old implementation)
```

### ✅ AFTER
```
▼ Loading spinner
  • Color 1    [Color Picker]
  • Color 2    [Color Picker]
```

---

## Control Comparison

### Color Controls

**❌ BEFORE:**
```tsx
<responsiveColorControl  // ← Wrong: lowercase, has device switcher (not needed)
    label={__('Primary text', 'voxel-fse')}
    attributes={attributes}
    setAttributes={setAttributes}
    attributeBaseName="primaryText"
/>
```

**✅ AFTER:**
```tsx
<ColorControl  // ← Correct: Simple inline color circle picker
    label={__('Primary text', 'voxel-fse')}
    value={attributes.primaryText || ''}
    onChange={(value) => setAttributes({ primaryText: value })}
/>
```

### Border Controls

**❌ BEFORE:**
```tsx
{/* Separate controls - inconsistent with Elementor */}
<responsiveColorControl
    label={__('Border color', 'voxel-fse')}
    attributeBaseName="primaryButtonBorder"
    ...
/>
<TextControl
    label={__('Border width', 'voxel-fse')}
    value={attributes.primaryButtonBorderWidth}  // String: "1px"
    onChange={(value) => setAttributes({ primaryButtonBorderWidth: value })}
/>
<SelectControl
    label={__('Border style', 'voxel-fse')}
    value={attributes.primaryButtonBorderStyle}  // "solid" | "dashed" | etc
    options={[...]}
/>
```

**✅ AFTER:**
```tsx
{/* Unified control - matches Elementor's Group_Control_Border */}
<BorderGroupControl
    label={__('Border Type', 'voxel-fse')}
    value={{
        borderType: attributes.primaryButtonBorderStyle || 'solid',
        borderWidth: parseBorderWidth(attributes.primaryButtonBorderWidth),
        borderColor: attributes.primaryButtonBorder || '',
    }}
    onChange={(value) => {
        const updates: Partial<TimelineKitAttributes> = {};
        if (value.borderType !== undefined) {
            updates.primaryButtonBorderStyle = value.borderType as any;
        }
        if (value.borderWidth !== undefined) {
            updates.primaryButtonBorderWidth = formatBorderWidth(value.borderWidth);
        }
        if (value.borderColor !== undefined) {
            updates.primaryButtonBorder = value.borderColor;
        }
        setAttributes(updates);
    }}
    hideRadius={true}
/>
```

### State Tabs

**❌ BEFORE:**
```tsx
{/* Manual state management with local useState */}
const [buttonsTab, setButtonsTab] = useState<'normal' | 'hover'>('normal');

<div style={{ marginBottom: '16px' }}>
    <ButtonGroup>
        <Button
            variant={buttonsTab === 'normal' ? 'primary' : 'secondary'}
            onClick={() => setButtonsTab('normal')}
        >
            {__('Normal', 'voxel-fse')}
        </Button>
        <Button
            variant={buttonsTab === 'hover' ? 'primary' : 'secondary'}
            onClick={() => setButtonsTab('hover')}
        >
            {__('Hover', 'voxel-fse')}
        </Button>
    </ButtonGroup>
</div>

{buttonsTab === 'normal' && (
    <>{/* Normal controls */}</>
)}
{buttonsTab === 'hover' && (
    <>{/* Hover controls */}</>
)}
```

**✅ AFTER:**
```tsx
{/* Automatic state persistence via block attributes */}
<StateTabPanel
    attributeName="buttonsState"
    attributes={attributes as Record<string, any>}
    setAttributes={setAttributes as (attrs: Record<string, any>) => void}
    tabs={[
        { name: 'normal', title: __('Normal', 'voxel-fse') },
        { name: 'hover', title: __('Hover', 'voxel-fse') },
    ]}
>
    {(tab) => (
        <>
            {tab.name === 'normal' && <>{/* Normal controls */}</>}
            {tab.name === 'hover' && <>{/* Hover controls */}</>}
        </>
    )}
</StateTabPanel>
```

---

## Visual Hierarchy Improvements

### Section Dividers

**❌ BEFORE:**
```tsx
<h4>{__('Primary button', 'voxel-fse')}</h4>
{/* No visual separator, just a heading */}
```

**✅ AFTER:**
```tsx
<SectionHeading label={__('Primary button', 'voxel-fse')} />
{/* Visual separator with border-top line + proper spacing */}
```

### Accordion Behavior

**❌ BEFORE:**
```tsx
{/* Multiple accordions can be open at once */}
<PanelBody title="General" initialOpen={openPanel === 'general'}>
<PanelBody title="Icons" initialOpen={openPanel === 'icons'}>
<PanelBody title="Buttons" initialOpen={openPanel === 'buttons'}>

{/* Manual state management */}
const [openPanel, setOpenPanel] = useState<string | null>('general');
```

**✅ AFTER:**
```tsx
{/* Only one accordion open at a time, automatic state persistence */}
<AccordionPanelGroup
    attributes={attributes as Record<string, any>}
    setAttributes={setAttributes as (attrs: Record<string, any>) => void}
    stateAttribute="styleTabOpenPanel"
    defaultPanel="general"
>
    <AccordionPanel id="general" title={__('General', 'voxel-fse')}>
    <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
    <AccordionPanel id="buttons" title={__('Buttons', 'voxel-fse')}>
</AccordionPanelGroup>

{/* No manual state management needed! */}
```

---

## Benefits of New Pattern

| Aspect | Before | After |
|--------|--------|-------|
| **Tab Structure** | ❌ No tabs (all controls in one panel) | ✅ Style / Advanced / Voxel tabs |
| **Accordion State** | ❌ Manual useState hook | ✅ Auto-persisted via block attributes |
| **Button State** | ❌ Manual ButtonGroup | ✅ StateTabPanel with persistence |
| **Border Controls** | ❌ 3 separate controls | ✅ Unified BorderGroupControl |
| **Color Pickers** | ❌ ResponsiveColorControl (overkill) | ✅ Simple ColorControl |
| **Section Dividers** | ❌ Plain h4 headings | ✅ SectionHeading with visual separator |
| **File Size** | ❌ 509 lines in edit.tsx | ✅ ~70 lines edit.tsx + 500 lines StyleTab.tsx |
| **Maintainability** | ❌ Hard to find controls | ✅ Clear file structure |
| **Testability** | ❌ Difficult to test | ✅ StyleTab can be tested in isolation |
| **Elementor Parity** | ⚠️ Partial (separate border controls) | ✅ Full (unified BorderGroupControl) |

---

## Performance Improvements

### Reduced Re-renders

**Before:**
- Every accordion state change re-renders entire InspectorControls
- Manual state management causes unnecessary re-renders

**After:**
- AccordionPanelGroup only re-renders active panel
- StateTabPanel only re-renders active tab content
- Block attributes-based state prevents unnecessary re-renders

### Code Splitting

**Before:**
- 509 lines of controls code in edit.tsx
- All loaded on block mount

**After:**
- ~70 lines in edit.tsx (rendering logic only)
- ~500 lines in StyleTab.tsx (controls logic)
- Clear separation of concerns

---

## Migration Checklist for Other Blocks

Use this visual guide when migrating other blocks:

- [ ] Create `inspector/` folder
- [ ] Extract tab controls to separate files (e.g., `StyleTab.tsx`)
- [ ] Replace `PanelBody` with `AccordionPanelGroup` + `AccordionPanel`
- [ ] Replace manual `ButtonGroup` state tabs with `StateTabPanel`
- [ ] Replace `ResponsiveColorControl` with `ColorControl` (if no device switcher needed)
- [ ] Replace separate border controls with `BorderGroupControl`
- [ ] Replace `h4` headings with `SectionHeading`
- [ ] Add state persistence attributes to block.json
- [ ] Update edit.tsx to use `InspectorTabs`
- [ ] Add `includeAdvancedTab={true}` and `includeVoxelTab={true}`

---

**Status:** ✅ MIGRATION COMPLETE
**Pattern:** InspectorTabs + AccordionPanelGroup + StateTabPanel + BorderGroupControl
**Maintainability:** ⭐⭐⭐⭐⭐ (Excellent - separated into clean modules)
