# Tab Components Rebuild Discovery

**Date:** 2025-12-23  
**Purpose:** 1:1 UI/UX matching for Elementor inspector tab components

---

## Key Finding: Elementor CSS Variable System

Elementor uses a comprehensive CSS variable system for theming. All tab components MUST use these variables.

### Theme Variables (from `theme-light.css`)

```css
:root {
  /* Colors */
  --e-a-color-white: #fff;
  --e-a-color-black: #000;
  --e-a-color-primary: #f3bafd;
  --e-a-color-primary-bold: #d004d4;
  --e-a-color-txt: #515962;
  --e-a-color-txt-muted: #818a96;
  --e-a-color-txt-accent: #0c0d0e;
  --e-a-color-txt-hover: #3f444b;
  --e-a-color-txt-active: #0c0d0e;
  
  /* Backgrounds */
  --e-a-bg-default: #fff;
  --e-a-bg-hover: #f1f2f3;
  --e-a-bg-active: #e6e8ea;
  --e-a-bg-active-bold: #d5d8dc;
  
  /* Borders */
  --e-a-border-color: #e6e8ea;
  --e-a-border-color-bold: #d5d8dc;
  --e-a-border-color-focus: #babfc5;
  --e-a-border: 1px solid var(--e-a-border-color);
  --e-a-border-bold: 1px solid var(--e-a-border-color-bold);
  --e-a-border-radius: 3px;
  
  /* Buttons */
  --e-a-btn-bg-primary: #f3bafd;
  --e-a-btn-bg-primary-hover: #f5d0fe;
  
  /* Transitions */
  --e-a-transition-hover: all .3s;
  
  /* Font */
  --e-a-font-family: Roboto, Arial, Helvetica, sans-serif;
}
```

---

## Component 1: StyleTabPanel (Normal/Hover Tabs)

### Source CSS (editor-preview.css lines 2509-2547)

```css
.elementor-control-type-tabs {
  display: none;
  font-size: var(--control-title-size);
}
.elementor-control-type-tabs:has(> :not(.elementor-control-type-tab.elementor-hidden-control)) {
  display: flex;
}

.elementor-control-type-tab {
  text-align: center;
  width: 100%;
  padding: 0;
  line-height: 25px;
  border-block-start: var(--e-a-border-bold);
  border-block-end: var(--e-a-border-bold);
  border-inline-end: var(--e-a-border-bold);
  transition: var(--e-a-transition-hover);
  cursor: pointer;
}
.elementor-control-type-tab:first-child {
  border-inline-start: var(--e-a-border-bold);
  border-start-start-radius: var(--e-a-border-radius);
  border-end-start-radius: var(--e-a-border-radius);
}
.elementor-control-type-tab:last-child {
  border-start-end-radius: var(--e-a-border-radius);
  border-end-end-radius: var(--e-a-border-radius);
}
.elementor-control-type-tab:hover {
  background-color: var(--e-a-bg-hover);
}
.elementor-control-type-tab.e-tab-active {
  background-color: var(--e-a-bg-active-bold);
  color: var(--e-a-color-txt-accent);
}
```

### Required React Implementation

```tsx
interface StyleTab {
  name: string;  // 'normal' | 'hover' | 'active' | 'filled'
  title: string; // Display text
}

interface StyleTabPanelProps {
  tabs: StyleTab[];
  children: (tab: StyleTab) => React.ReactNode;
  className?: string;
}
```

### Key Visual Requirements
- Tabs in horizontal flex row
- Equal width tabs (`width: 100%`)
- Height: 25px line-height
- Border: 1px solid #d5d8dc all around
- First tab: left border-radius 3px
- Last tab: right border-radius 3px
- Hover: bg #f1f2f3
- Active: bg #d5d8dc, text #0c0d0e (darker)

---

## Component 2: AdvancedTab

### Elementor Advanced Tab Contents
1. **Advanced section**
   - Margin (responsive)
   - Padding (responsive)
   - Z-index
   - CSS ID
   - CSS Classes

2. **Motion Effects** (optional)
3. **Transform** (optional)
4. **Background** (optional)
5. **Border** (optional)
6. **Positioning** (optional)
7. **Responsive** (visibility toggles)
8. **Custom CSS** (Pro feature)

### Key Sections to Implement
- Spacing (Margin/Padding) with linked sides toggle
- Custom CSS input
- CSS Classes input
- Responsive visibility toggles

---

## Component 3: VoxelTab

### Voxel-Specific Settings
1. Voxel integration toggle
2. Display conditions
3. Responsive show/hide per device
4. Portal mode (for some widgets)

---

## Implementation Priorities

### Phase 1: Core StyleTabPanel
1. Copy CSS exactly using Elementor variables
2. Implement tab switching logic
3. Match transition timing

### Phase 2: AdvancedTab Rebuild
1. Implement spacing controls with responsive
2. Add CSS classes/ID inputs
3. Add responsive visibility toggles

### Phase 3: VoxelTab Rebuild
1. Match Voxel's existing general tab UI
2. Device visibility toggles

---

## Files to Copy

| Source | Destination | Purpose |
|--------|-------------|---------|
| `plugins/elementor/assets/lib/eicons/` | `themes/voxel-fse/assets/lib/eicons/` | Icon library |
| `plugins/elementor/assets/css/theme-light.css` | Reference only | CSS variables |

---

## Next Steps

1. [ ] Create CSS file with Elementor variables for Gutenberg editor
2. [ ] Rebuild `StyleTabPanel.tsx` with exact styling
3. [ ] Rebuild `AdvancedTab.tsx` with spacing + CSS controls
4. [ ] Rebuild `VoxelTab.tsx` with device toggles
5. [ ] Test in Gutenberg editor for visual parity
