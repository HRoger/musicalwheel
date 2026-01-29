# Nested Accordion Block - Implementation Plan

**Date:** 2025-12-09
**Block Name:** `voxel-fse/nested-accordion`
**Architecture:** Plan C+ (Headless-ready, React hydration)

---

## 1. Overview

Convert Voxel's Nested Accordion widget to a Gutenberg FSE block with:
- 1:1 HTML structure matching (uses `<details>/<summary>`)
- Full control parity with Elementor widget
- Voxel loop and visibility features via vxconfig
- React hydration for frontend interactions

---

## 2. Block Structure

```
app/blocks/src/nested-accordion/
├── block.json                    # Block metadata
├── index.tsx                     # Block registration
├── edit.tsx                      # Editor component
├── save.tsx                      # Save component (static markup)
├── view.tsx                      # Frontend hydration entry
├── types.ts                      # TypeScript interfaces
├── components/
│   ├── AccordionItem.tsx         # Single accordion item wrapper
│   ├── AccordionItemTitle.tsx    # Title/summary component
│   ├── AccordionIcon.tsx         # Icon wrapper (open/closed)
│   └── AccordionContent.tsx      # Content wrapper
├── hooks/
│   ├── useAccordionToggle.ts     # Toggle/animation logic
│   └── useKeyboardNavigation.ts  # Keyboard handler
├── shared/
│   └── NestedAccordionComponent.tsx  # Shared render component
├── editor.css                    # Editor-only styles
└── style.css                     # Frontend styles
```

---

## 3. Block Attributes

```typescript
interface NestedAccordionAttributes {
  // Core
  blockId: string;

  // Layout
  items: AccordionItemData[];
  itemPosition: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  titleTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span' | 'p';
  faqSchema: boolean;

  // Icons
  iconPosition: ResponsiveValue<'start' | 'end'>;
  expandIcon: IconValue;
  collapseIcon: IconValue;

  // Interactions
  defaultState: 'expanded' | 'all_collapsed';
  maxItemsExpanded: 'one' | 'multiple';
  animationDuration: { size: number; unit: 'ms' | 's' };

  // Accordion Style
  itemSpacing: ResponsiveValue<string>;
  contentDistance: ResponsiveValue<string>;
  accordionBorderRadius: ResponsiveBoxValue;
  accordionPadding: ResponsiveBoxValue;

  // State-based Accordion Styles
  accordionNormal: StateStyle;
  accordionHover: StateStyle;
  accordionActive: StateStyle;

  // Header/Title Style
  titleTypography: TypographyValue;
  titleNormalColor: string;
  titleHoverColor: string;
  titleActiveColor: string;
  titleTextShadow: Record<string, TextShadowValue>;
  titleTextStroke: Record<string, TextStrokeValue>;

  // Icon Style
  iconSize: ResponsiveValue<string>;
  iconSpacing: ResponsiveValue<string>;
  iconNormalColor: string;
  iconHoverColor: string;
  iconActiveColor: string;

  // Content Style
  contentBackground: BackgroundValue;
  contentBorder: BorderValue;
  contentBorderRadius: ResponsiveBoxValue;
  contentPadding: ResponsiveBoxValue;

  // Visibility
  hideDesktop: boolean;
  hideTablet: boolean;
  hideMobile: boolean;
}

interface AccordionItemData {
  id: string;
  title: string;              // Supports dynamic tags
  cssId: string;
  // Voxel loop settings (stored in vxconfig)
  loopSource?: string;        // e.g., "@post(related_posts)"
  loopLimit?: number;
  loopOffset?: number;
  // Visibility (stored in vxconfig)
  visibilityBehavior?: 'show' | 'hide';
  visibilityRules?: VisibilityRule[][];
}

interface StateStyle {
  background: BackgroundValue;
  border: BorderValue;
}
```

---

## 4. vxconfig Structure

```json
{
  "items": [
    {
      "id": "item-1",
      "title": "@tags()@post(faq:question)@endtags()",
      "cssId": "faq-item-1",
      "loop": {
        "source": "@post(faq_items)",
        "limit": 10,
        "offset": 0
      },
      "visibility": {
        "behavior": "show",
        "rules": [
          [{ "type": "user:logged_in" }]
        ]
      }
    }
  ],
  "interactions": {
    "defaultState": "expanded",
    "maxItemsExpanded": "one",
    "animationDuration": 400
  }
}
```

---

## 5. Control Mappings

### 5.1 Layout Panel

| Elementor Control | Gutenberg Control | Component |
|-------------------|-------------------|-----------|
| `items` (nested repeater) | Custom Repeater + InnerBlocks | Custom component |
| `accordion_item_title_position_horizontal` | `ChooseControl` (responsive) | `ResponsiveChooseControl` |
| `accordion_item_title_icon_position` | `ChooseControl` (responsive) | `ResponsiveChooseControl` |
| `accordion_item_title_icon` | `IconPickerControl` | Shared control |
| `accordion_item_title_icon_active` | `IconPickerControl` | Shared control |
| `title_tag` | `SelectControl` | WP Component |
| `faq_schema` | `ToggleControl` | WP Component |

### 5.2 Interactions Panel

| Elementor Control | Gutenberg Control |
|-------------------|-------------------|
| `default_state` | `SelectControl` |
| `max_items_expended` | `SelectControl` |
| `n_accordion_animation_duration` | `SliderControl` with unit select |

### 5.3 Style Tab

| Elementor Control | Gutenberg Control |
|-------------------|-------------------|
| Typography group | `TypographyControl` |
| Background group | `BackgroundControl` (custom) |
| Border group | `BorderControl` (custom) |
| Dimensions | `BoxControl` |
| Slider (responsive) | `ResponsiveRangeControl` |
| Color | `ColorControl` |
| Text Shadow | Custom or `BoxShadowControl` adapted |
| Text Stroke | Custom control |

---

## 6. Component Architecture

### 6.1 Editor Component (`edit.tsx`)

```tsx
export default function Edit({ attributes, setAttributes, clientId }) {
  const blockProps = useBlockProps({
    className: 'vxfse-nested-accordion',
  });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title="Layout">
          {/* Items repeater */}
          <AccordionItemsRepeater
            items={attributes.items}
            onChange={(items) => setAttributes({ items })}
          />
          {/* Icon settings */}
          {/* Title tag */}
          {/* FAQ Schema toggle */}
        </PanelBody>

        <PanelBody title="Interactions">
          {/* Default state */}
          {/* Max items expanded */}
          {/* Animation duration */}
        </PanelBody>

        {/* Style panels... */}
      </InspectorControls>

      {/* Editor Preview */}
      <div className="e-n-accordion" aria-label="Accordion">
        {attributes.items.map((item, index) => (
          <AccordionItemEditor
            key={item.id}
            item={item}
            index={index}
            isFirst={index === 0}
            defaultState={attributes.defaultState}
            titleTag={attributes.titleTag}
            icons={{ expand: attributes.expandIcon, collapse: attributes.collapseIcon }}
            clientId={clientId}
          />
        ))}
      </div>
    </div>
  );
}
```

### 6.2 AccordionItemEditor Component

```tsx
function AccordionItemEditor({ item, index, isFirst, defaultState, titleTag, icons, clientId }) {
  const isOpen = defaultState === 'expanded' && isFirst;
  const TitleTag = titleTag;

  return (
    <details
      id={item.cssId || `e-n-accordion-item-${clientId}-${index}`}
      className="e-n-accordion-item"
      open={isOpen}
    >
      <summary className="e-n-accordion-item-title">
        <span className="e-n-accordion-item-title-header">
          <TitleTag className="e-n-accordion-item-title-text">
            <RichText
              value={item.title}
              onChange={(title) => updateItem(index, { title })}
              placeholder="Item Title"
            />
          </TitleTag>
        </span>
        <span className="e-n-accordion-item-title-icon">
          <span className="e-opened"><Icon icon={icons.collapse} /></span>
          <span className="e-closed"><Icon icon={icons.expand} /></span>
        </span>
      </summary>

      {/* InnerBlocks for content */}
      <InnerBlocks
        allowedBlocks={ALLOWED_BLOCKS}
        template={CONTENT_TEMPLATE}
        templateLock={false}
      />
    </details>
  );
}
```

### 6.3 Frontend Hydration (`view.tsx`)

```tsx
import { hydrateBlock } from '../shared/utils/hydration';
import NestedAccordionFrontend from './components/NestedAccordionFrontend';

hydrateBlock('vxfse-nested-accordion', NestedAccordionFrontend);
```

### 6.4 Frontend Component

```tsx
function NestedAccordionFrontend({ vxconfig, children }) {
  const { toggleItem, isOpen, animations } = useAccordionToggle({
    defaultState: vxconfig.interactions.defaultState,
    maxItemsExpanded: vxconfig.interactions.maxItemsExpanded,
    animationDuration: vxconfig.interactions.animationDuration,
  });

  const keyboardHandler = useKeyboardNavigation();

  return (
    <div className="e-n-accordion" aria-label="Accordion...">
      {React.Children.map(children, (child, index) => {
        // Clone with toggle handlers
        return React.cloneElement(child, {
          isOpen: isOpen(index),
          onToggle: () => toggleItem(index),
          onKeyDown: keyboardHandler.handleKeyDown,
        });
      })}
    </div>
  );
}
```

---

## 7. Animation Hook

```typescript
// hooks/useAccordionToggle.ts
export function useAccordionToggle(config) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => {
    if (config.defaultState === 'expanded') {
      return new Set([0]);
    }
    return new Set();
  });

  const animationsRef = useRef<Map<HTMLElement, Animation>>(new Map());

  const toggleItem = useCallback((index: number, element: HTMLElement) => {
    const isCurrentlyOpen = openItems.has(index);

    // Cancel existing animation
    const existingAnimation = animationsRef.current.get(element);
    if (existingAnimation) {
      existingAnimation.cancel();
    }

    // If single mode, close others first
    if (config.maxItemsExpanded === 'one' && !isCurrentlyOpen) {
      closeAllItems();
    }

    // Animate
    const summary = element.querySelector('summary');
    const content = element.querySelector(':scope > .e-con');

    if (isCurrentlyOpen) {
      // Close animation
      const startHeight = element.offsetHeight;
      const endHeight = summary.offsetHeight;
      animateItem(element, startHeight, endHeight, false);
    } else {
      // Open animation
      element.style.height = `${element.offsetHeight}px`;
      element.open = true;

      requestAnimationFrame(() => {
        const startHeight = element.offsetHeight;
        const endHeight = summary.offsetHeight + content.offsetHeight;
        animateItem(element, startHeight, endHeight, true);
      });
    }
  }, [openItems, config]);

  const animateItem = (element, startHeight, endHeight, isOpening) => {
    element.style.overflow = 'hidden';

    const animation = element.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: config.animationDuration }
    );

    animation.onfinish = () => {
      element.open = isOpening;
      element.style.height = '';
      element.style.overflow = '';

      setOpenItems(prev => {
        const next = new Set(prev);
        if (isOpening) {
          next.add(index);
        } else {
          next.delete(index);
        }
        return next;
      });
    };

    animationsRef.current.set(element, animation);
  };

  return { openItems, toggleItem, isOpen: (i) => openItems.has(i) };
}
```

---

## 8. CSS Variables (style.css)

```css
.vxfse-nested-accordion {
  /* Inherit Elementor's CSS variable names for compatibility */
  --n-accordion-title-font-size: var(--vxfse-title-font-size, 20px);
  --n-accordion-title-flex-grow: var(--vxfse-title-flex-grow, initial);
  --n-accordion-title-justify-content: var(--vxfse-title-justify-content, initial);
  --n-accordion-title-icon-order: var(--vxfse-icon-order, -1);
  --n-accordion-border-width: var(--vxfse-border-width, 1px);
  --n-accordion-border-color: var(--vxfse-border-color, #d5d8dc);
  --n-accordion-border-style: var(--vxfse-border-style, solid);
  --n-accordion-item-title-space-between: var(--vxfse-item-spacing, 0px);
  --n-accordion-item-title-distance-from-content: var(--vxfse-content-distance, 0px);
  --n-accordion-padding: var(--vxfse-padding, 10px);
  --n-accordion-border-radius: var(--vxfse-border-radius, 0px);
  --n-accordion-icon-size: var(--vxfse-icon-size, 15px);
  --n-accordion-icon-gap: var(--vxfse-icon-gap, 0 10px);
  --n-accordion-title-normal-color: var(--vxfse-title-color, #1f2124);
  --n-accordion-title-hover-color: var(--vxfse-title-hover-color, #1f2124);
  --n-accordion-title-active-color: var(--vxfse-title-active-color, #1f2124);
  --n-accordion-icon-normal-color: var(--n-accordion-title-normal-color);
  --n-accordion-icon-hover-color: var(--n-accordion-title-hover-color);
  --n-accordion-icon-active-color: var(--n-accordion-title-active-color);

  width: 100%;
}

/* Copy Elementor's CSS structure for 1:1 matching */
.vxfse-nested-accordion .e-n-accordion-item {
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ... rest of CSS from widget-nested-accordion.min.css */
```

---

## 9. Implementation Phases

### Phase 1: Core Block Structure
1. Create block.json with attributes
2. Set up types.ts with interfaces
3. Create basic edit.tsx with InspectorControls
4. Create save.tsx with static HTML output
5. Add to Block_Loader.php

### Phase 2: Editor Controls
1. Layout panel controls
2. Interactions panel controls
3. Accordion items repeater (custom component)
4. Per-item settings (title, CSS ID)

### Phase 3: Styling Controls
1. Accordion style section (Normal/Hover/Active tabs)
2. Header style section (Title + Icon)
3. Content style section

### Phase 4: Frontend Hydration
1. Create view.tsx hydration entry
2. Implement useAccordionToggle hook
3. Implement useKeyboardNavigation hook
4. Create frontend component

### Phase 5: Voxel Features
1. Add loop source controls to items
2. Add visibility rules controls
3. Implement server-side loop resolution
4. Implement server-side visibility evaluation

### Phase 6: Polish
1. FAQ Schema JSON-LD output
2. Dynamic tag support in titles
3. Responsive preview in editor
4. Accessibility audit

---

## 10. Challenges & Solutions

### Challenge 1: Multiple InnerBlocks

**Problem:** Gutenberg only allows one `<InnerBlocks>` per block.

**Solution:** Use nested blocks pattern:
- Main block contains accordion structure
- Each item is a child block with its own InnerBlocks
- Or use `useInnerBlocksProps` with multiple template slots

### Challenge 2: Loop Rendering

**Problem:** Voxel loops require server-side data.

**Solution:**
1. Define loop source in vxconfig
2. PHP render callback fetches loop data
3. Pass resolved items to React via data attribute
4. React hydrates with expanded items

### Challenge 3: Visibility Rules

**Problem:** Visibility rules need PHP evaluation.

**Solution:**
1. Store rules in vxconfig
2. PHP evaluates during render
3. Hidden items excluded from HTML output
4. No client-side evaluation needed (server authority)

### Challenge 4: Details/Summary Animation

**Problem:** Native `<details>` toggle is instant, need smooth animation.

**Solution:**
- Prevent default toggle on summary click
- Manually control `open` attribute
- Use Web Animations API for height transition
- Match Elementor's exact animation behavior

---

## 11. Dependencies

**Existing Shared Controls:**
- `IconPickerControl` - For expand/collapse icons
- `TypographyControl` - For title typography
- `ColorControl` - For color pickers
- `BoxControl` - For padding/border-radius
- `ResponsiveRangeControl` - For sliders
- `ChooseControl` - For alignment options
- `DynamicTagTextControl` - For dynamic tag support

**New Controls Needed:**
- `BackgroundControl` - For background settings (optional, can use WP's)
- `BorderControl` - For border settings (optional, can use WP's)
- `TextShadowControl` - For text shadow (if not using BoxShadow)
- `TextStrokeControl` - For text stroke
- `StateTabs` - Tab component for Normal/Hover/Active states

---

## 12. Testing Checklist

- [ ] All accordion items render correctly
- [ ] Open/close animation works smoothly
- [ ] Max items expanded (one/multiple) works
- [ ] Default state (expanded/collapsed) works
- [ ] Keyboard navigation (Enter, Space, Arrows, Escape)
- [ ] Icons change on open/close
- [ ] All style controls apply correctly
- [ ] Responsive styles work
- [ ] FAQ Schema outputs valid JSON-LD
- [ ] Dynamic tags render in titles
- [ ] Loop rendering works
- [ ] Visibility rules hide/show items
- [ ] ARIA attributes are correct
- [ ] No accessibility violations