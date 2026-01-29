# Nested Accordion Widget - Discovery Document

**Date:** 2025-12-09
**Widget:** `nested-accordion`
**Source Files:**
- Voxel wrapper: `themes/voxel/app/widgets/nested-accordion.php`
- Elementor parent: `plugins/elementor/modules/nested-accordion/widgets/nested-accordion.php`

---

## 1. Widget Architecture

Voxel's Nested Accordion extends Elementor's native Nested Accordion widget:

```php
class Nested_Accordion extends \Elementor\Modules\NestedAccordion\Widgets\Nested_Accordion
```

**Key Extension Points:**
1. Custom `render()` method - Adds Voxel loop support for repeater items
2. Custom `content_template()` - Strips dynamic tags for editor preview
3. Inherits all Elementor controls via parent class

---

## 2. HTML Structure

```html
<div class="e-n-accordion" aria-label="Accordion. Open links with Enter or Space, close with Escape, and navigate with Arrow Keys">
  <details id="e-n-accordion-item-{id}" class="e-n-accordion-item" [open]>
    <summary class="e-n-accordion-item-title"
             role="button"
             data-accordion-index="{n}"
             tabindex="{0|-1}"
             aria-expanded="{true|false}"
             aria-controls="{item-id}">
      <span class="e-n-accordion-item-title-header">
        <{h1-h6|div|span|p} class="e-n-accordion-item-title-text">
          {title}
        </{tag}>
      </span>
      <span class="e-n-accordion-item-title-icon">
        <span class="e-opened">{active_icon}</span>
        <span class="e-closed">{expand_icon}</span>
      </span>
    </summary>
    <!-- Content container rendered inside details -->
  </details>
</div>

<!-- Optional FAQ Schema -->
<script type="application/ld+json">{FAQPage schema}</script>
```

---

## 3. Elementor Controls

### 3.1 Layout Panel - `section_items`

| Control | Type | Default | Description |
|---------|------|---------|-------------|
| `items` | `Control_Nested_Repeater` | 3 items | Nested repeater with child containers |
| `accordion_item_title_position_horizontal` | `CHOOSE` (responsive) | - | start/center/end/stretch |
| `accordion_item_title_icon_position` | `CHOOSE` (responsive) | - | start/end |
| `accordion_item_title_icon` | `ICONS` | `fas fa-plus` | Expand icon |
| `accordion_item_title_icon_active` | `ICONS` | `fas fa-minus` | Collapse icon |
| `title_tag` | `SELECT` | `div` | h1-h6, div, span, p |
| `faq_schema` | `SWITCHER` | `no` | Enable FAQ JSON-LD |

**Per-Item Repeater Controls:**

| Control | Type | Default | Description |
|---------|------|---------|-------------|
| `item_title` | `TEXT` | "Item Title" | Title with dynamic tag support |
| `element_css_id` | `TEXT` | - | Custom CSS ID |

### 3.2 Interactions Panel - `section_interactions`

| Control | Type | Default | Options |
|---------|------|---------|---------|
| `default_state` | `SELECT` | `expanded` | expanded, all_collapsed |
| `max_items_expended` | `SELECT` | `one` | one, multiple |
| `n_accordion_animation_duration` | `SLIDER` | 400ms | units: s, ms |

### 3.3 Style Tab - Accordion Section

| Control | Type | Description |
|---------|------|-------------|
| `accordion_item_title_space_between` | `SLIDER` (responsive) | Gap between items |
| `accordion_item_title_distance_from_content` | `SLIDER` (responsive) | Gap to content |
| Normal/Hover/Active tabs | - | Background + Border groups |
| `accordion_border_radius` | `DIMENSIONS` (responsive) | Border radius |
| `accordion_padding` | `DIMENSIONS` (responsive) | Padding |

### 3.4 Style Tab - Header Section

**Title Subsection:**

| Control | Type | Description |
|---------|------|-------------|
| `title_typography` | `Group_Control_Typography` | Title typography |
| Normal/Hover/Active color | `COLOR` | Title color |
| `{state}_text_shadow` | `Group_Control_Text_Shadow` | Shadow |
| `{state}_stroke` | `Group_Control_Text_Stroke` | Stroke |

**Icon Subsection:**

| Control | Type | Default |
|---------|------|---------|
| `icon_size` | `SLIDER` (responsive) | 15px |
| `icon_spacing` | `SLIDER` (responsive) | - |
| Normal/Hover/Active color | `COLOR` | Inherits title color |

### 3.5 Style Tab - Content Section

| Control | Type | Description |
|---------|------|-------------|
| `content_background` | `Group_Control_Background` | classic, gradient |
| `content_border` | `Group_Control_Border` | Border |
| `content_border_radius` | `DIMENSIONS` (responsive) | Border radius |
| `content_padding` | `DIMENSIONS` (responsive) | Padding |

---

## 4. Voxel Extensions

### 4.1 Loop Repeater Row

Voxel extends the nested repeater with loop functionality:

```php
// Added to each repeater item:
'_voxel_loop' => [
    'type' => 'voxel-loop',
    'label' => 'Loop repeater row',
],
'_voxel_loop_limit' => [
    'type' => 'number',
    'label' => 'Loop limit',
],
'_voxel_loop_offset' => [
    'type' => 'number',
    'label' => 'Loop offset',
],
```

**Loop Sources Available:**
- `@post(field)` - Current post field
- `@author(field)` - Post author field
- `@user(field)` - Current user field
- Custom Data_Object_List properties

### 4.2 Row Visibility Rules

```php
'_voxel_visibility_behavior' => 'show' | 'hide',
'_voxel_visibility_rules' => [
    // Rule groups (OR between groups)
    [
        // Rules within group (AND between rules)
        ['type' => 'user:logged_in'],
        ['type' => 'user:role', 'role' => 'subscriber'],
    ],
]
```

**Available Visibility Rule Types (~30):**
- **User:** logged_in, logged_out, plan, role, is_author, can_create_post, can_edit_post, is_verified, is_vendor, has_bought_product, etc.
- **Author:** plan, role, is_verified, is_vendor
- **Template:** is_page, is_child_of_page, is_single_post, is_post_type_archive, is_author, is_single_term, is_homepage, is_404
- **Post:** is_verified
- **Product:** is_available
- **Dynamic Tag:** dtag (custom condition)

### 4.3 Dynamic Tags in Titles

Titles support VoxelScript syntax:
```
@tags()@post(title)@endtags()
```

The `content_template()` method strips tags for editor preview:
```php
$template = str_replace(
    "{{{ item.item_title }}}",
    "{{{ typeof item.item_title === 'string' ? item.item_title.replace('@tags()', '').replace('@endtags()', '') : item.item_title }}}",
    $template
);
```

---

## 5. CSS Variables

```css
.elementor-widget-n-accordion {
  /* Typography */
  --n-accordion-title-font-size: 20px;

  /* Layout */
  --n-accordion-title-flex-grow: initial;
  --n-accordion-title-justify-content: initial;
  --n-accordion-title-icon-order: -1;
  --n-accordion-item-title-space-between: 0px;
  --n-accordion-item-title-distance-from-content: 0px;
  --n-accordion-padding: 10px;

  /* Border */
  --n-accordion-border-width: 1px;
  --n-accordion-border-color: #d5d8dc;
  --n-accordion-border-style: solid;
  --n-accordion-border-radius: 0px;

  /* Icon */
  --n-accordion-icon-size: 15px;
  --n-accordion-icon-gap: 0 10px;

  /* Colors - Normal */
  --n-accordion-title-normal-color: #1f2124;
  --n-accordion-icon-normal-color: var(--n-accordion-title-normal-color);

  /* Colors - Hover */
  --n-accordion-title-hover-color: #1f2124;
  --n-accordion-icon-hover-color: var(--n-accordion-title-hover-color);

  /* Colors - Active */
  --n-accordion-title-active-color: #1f2124;
  --n-accordion-icon-active-color: var(--n-accordion-title-active-color);
}
```

---

## 6. JavaScript Behavior

**File:** `plugins/elementor/assets/js/nested-accordion.bd02585a9fcae6f92e67.bundle.js`

### 6.1 NestedAccordion Handler Class

```javascript
class NestedAccordion extends Base {
  getDefaultSettings() {
    return {
      selectors: {
        accordion: '.e-n-accordion',
        accordionItems: '.e-n-accordion-item',
        accordionItemTitles: '.e-n-accordion-item-title',
        accordionContent: '.e-n-accordion-item > .e-con',
      }
    };
  }

  clickListener(event) {
    // If max_items_expended === 'one', close all first
    if ('one' === maxItemsExpended) {
      this.closeAllItems(items, titles);
    }

    // Toggle clicked item
    if (!accordionItem.open) {
      this.prepareOpenAnimation(accordionItem, itemSummary, accordionContent);
    } else {
      this.closeAccordionItem(accordionItem, itemSummary);
    }
  }

  animateItem(accordionItem, startHeight, endHeight, isOpen) {
    // Uses Web Animations API
    animation = accordionItem.animate({
      height: [startHeight, endHeight]
    }, {
      duration: this.getAnimationDuration()
    });
    animation.onfinish = () => this.onAnimationFinish(accordionItem, isOpen);
  }

  getAnimationDuration() {
    const { size, unit } = this.getElementSettings('n_accordion_animation_duration');
    return size * (unit === 'ms' ? 1 : 1000);
  }
}
```

### 6.2 Keyboard Handler

- **Enter/Space:** Toggle item
- **Arrow Up/Down:** Navigate between items
- **Home/End:** Jump to first/last item
- **Escape:** Close current item

---

## 7. Key Implementation Considerations

### 7.1 Nested InnerBlocks

Unlike standard blocks, nested accordion requires:
- Each accordion item is a container for other blocks
- Uses `<details>/<summary>` HTML5 elements
- Content is nested inside the `<details>` element

### 7.2 Loop Data

For FSE blocks, we need to:
1. Define loop source in block attributes
2. Fetch loop data via REST API or pass as vxconfig
3. Render items dynamically on frontend hydration

### 7.3 Visibility Rules

Visibility rules are server-side evaluated in Voxel. For FSE:
- Store rules in vxconfig
- Evaluate during block render (PHP)
- Or defer to React hydration with passed context

### 7.4 Animation

Web Animations API approach works well for React:
- Use refs to access DOM elements
- Animate `<details>` height on toggle
- Respect `n_accordion_animation_duration` setting

---

## 8. Files Referenced

- `themes/voxel/app/widgets/nested-accordion.php` - Widget class
- `plugins/elementor/modules/nested-accordion/widgets/nested-accordion.php` - Parent widget
- `themes/voxel/app/modules/elementor/custom-controls/nested-repeater-control.php` - Loop/visibility
- `themes/voxel/app/modules/elementor/custom-controls/repeater-control.php` - Visibility logic
- `themes/voxel/app/modules/elementor/controllers/loop-controller.php` - Loop settings
- `themes/voxel/app/dynamic-data/looper.php` - Loop execution
- `themes/voxel/app/utils/utils.php:665` - `evaluate_visibility_rules()`
- `themes/voxel/app/dynamic-data/config.php:81` - Visibility rule types
- `plugins/elementor/assets/css/widget-nested-accordion.min.css` - CSS
- `plugins/elementor/assets/js/nested-accordion.*.bundle.js` - JS handler