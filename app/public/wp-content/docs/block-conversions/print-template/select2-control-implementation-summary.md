# Select2 Control Implementation Summary

**Date:** December 2025
**Block:** Print Template (VX)
**Architecture:** Plan C+ Compliant
**Component:** Reusable Select2-style Dropdown Control

---

## Executive Summary

This document summarizes the creation of a reusable, generic Select2-style dropdown control that was extracted from the Print Template block's `TemplateSelectControl` and moved to the shared controls library. This implementation demonstrates best practices for creating reusable controls that comply with Plan C+ architecture and TypeScript strict mode requirements.

---

## What Was Built

### 1. Generic Select2Control Component

**Location:** `app/blocks/src/shared/controls/Select2Control.tsx`

**Purpose:** A fully reusable, generic single-select dropdown with:
- Grouped options with visual separators
- Lazy loading via `onFetch` callback prop
- Single option loading via `onFetchSingle` callback prop
- Searchable/filterable dropdown
- Optional dynamic tag support (VoxelScript integration)
- Select2-style UI matching Voxel's admin patterns

**Key Features:**
```typescript
interface Select2ControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  groups?: Select2Group[];              // Static groups
  onFetch?: () => Promise<Select2Group[]>;  // Lazy load
  onFetchSingle?: (id: string) => Promise<Select2Option | null>;
  enableDynamicTags?: boolean;
  context?: string;
  emptyMessage?: string;
  filterPlaceholder?: string;
}
```

### 2. Specialized TemplateSelectControl Wrapper

**Location:** `app/blocks/src/shared/controls/TemplateSelectControl.tsx`

**Purpose:** FSE template-specific implementation that wraps `Select2Control`:
- Fetches `/wp/v2/templates` and `/wp/v2/template-parts`
- Groups by type (FSE Templates, Template Parts)
- Includes dynamic tag support by default
- Provides clean API for template selection use cases

**Simplicity:**
```typescript
export default function TemplateSelectControl({
  label,
  value,
  onChange,
  placeholder,
  context,
}: TemplateSelectControlProps) {
  const handleFetch = useCallback(() => fetchAllFSETemplates(), []);
  const handleFetchSingle = useCallback((id: string) => fetchTemplate(id), []);

  return (
    <Select2Control
      label={label}
      value={value}
      onChange={onChange}
      onFetch={handleFetch}
      onFetchSingle={handleFetchSingle}
      enableDynamicTags={true}
      // ... other props
    />
  );
}
```

### 3. Integration in Print Template Block

**Before:**
```typescript
import TemplateSelectControl from './controls/TemplateSelectControl';
```

**After:**
```typescript
import { TemplateSelectControl } from '../shared/controls';
```

All functionality preserved, but now using shared library component.

---

## Plan C+ Compliance

### ✅ Principle 1: Shared Component Architecture

**Requirement:** Components should be reusable across blocks, not duplicated.

**Implementation:**
- `Select2Control` is fully generic and reusable
- `TemplateSelectControl` wraps it for specific use case
- Both exported from `shared/controls/index.ts`
- Any block can import and use either component

**Evidence:**
```typescript
// shared/controls/index.ts
export { default as Select2Control } from './Select2Control';
export { default as TemplateSelectControl } from './TemplateSelectControl';
export type { Select2ControlProps, Select2Option, Select2Group } from './Select2Control';
export type { TemplateSelectControlProps } from './TemplateSelectControl';
```

### ✅ Principle 2: TypeScript Strict Mode (No `any` Types)

**Requirement:** All components must work with `strict: true` in tsconfig.json.

**Implementation:**
- All props properly typed with interfaces
- Generic types for flexible data structures
- Optional properties marked with `?`
- Nullable values typed as `Type | null`
- Runtime validation for external data

**Evidence:**
```typescript
// Generic with proper types
export interface Select2Option {
  id: string;
  title: string;
  type?: string;  // Optional
}

export interface Select2Group {
  label: string;
  type: string;
  items: Select2Option[];
}

// Props with proper optionals
export interface Select2ControlProps {
  label: string;                    // Required
  value: string;                    // Required
  onChange: (value: string) => void;  // Required
  placeholder?: string;              // Optional
  groups?: Select2Group[];           // Optional
  onFetch?: () => Promise<Select2Group[]>;  // Optional
  // ... etc
}
```

### ✅ Principle 3: Separation of Concerns

**Requirement:** Generic logic separate from specific implementations.

**Implementation:**
- **Select2Control:** Generic dropdown logic (UI, state, positioning)
- **TemplateSelectControl:** Template-specific data fetching
- Clear separation allows reuse for other data sources

**Future Usage Example:**
```typescript
// Can create PostSelectControl, UserSelectControl, etc.
export default function PostSelectControl({ label, value, onChange }) {
  const handleFetch = useCallback(() => fetchPosts(), []);
  const handleFetchSingle = useCallback((id) => fetchPost(id), []);

  return (
    <Select2Control
      label={label}
      value={value}
      onChange={onChange}
      onFetch={handleFetch}
      onFetchSingle={handleFetchSingle}
      enableDynamicTags={false}
    />
  );
}
```

### ✅ Principle 4: WordPress Import Map Compatibility

**Requirement:** Only use WordPress packages available in browser import maps.

**Implementation:**
- React hooks from `'react'` (not `@wordpress/element`)
- WordPress components from `@wordpress/components` (verified available)
- No experimental or deprecated APIs

**Evidence:**
```typescript
// CORRECT - import from 'react'
import { useState, useEffect, useRef, useCallback } from 'react';

// CORRECT - standard WordPress components
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
```

### ✅ Principle 5: Lazy Loading Pattern

**Requirement:** Optimize performance by loading data only when needed.

**Implementation:**
- Templates fetch only when dropdown opens
- Uses `hasLoaded` flag to prevent duplicate fetches
- Single option fetch for initial render
- Clean state management

**Evidence:**
```typescript
// Lazy load groups when dropdown opens
useEffect(() => {
  if (isOpen && !hasLoaded && !isLoading && onFetch) {
    setIsLoading(true);
    onFetch().then((fetchedGroups) => {
      setGroups(fetchedGroups);
      setHasLoaded(true);
      setIsLoading(false);
    });
  }
}, [isOpen, hasLoaded, isLoading, onFetch]);
```

### ✅ Principle 6: Dynamic Tag Integration

**Requirement:** Support VoxelScript `@tags()` expressions where applicable.

**Implementation:**
- Optional `enableDynamicTags` prop
- Integrates with `DynamicTagBuilder` component
- Shows tag preview panel when tags active
- Clean enable/disable workflow

**Evidence:**
```typescript
const hasDynamicTags = enableDynamicTags &&
  typeof value === 'string' &&
  value.startsWith('@tags()');

// Tag preview panel (matches DynamicTagTextControl pattern)
{hasDynamicTags ? (
  <div className="edit-voxel-tags">
    <div className="tags-content">{getTagContent()}</div>
    <div className="actions">
      <button onClick={() => setIsModalOpen(true)}>EDIT TAGS</button>
      <button onClick={handleDisableTags}>DISABLE TAGS</button>
    </div>
  </div>
) : (
  // Select2 dropdown
)}
```

---

## Architecture Patterns

### Pattern 1: Generic Control + Specialized Wrapper

**Benefit:** Reusability without sacrificing ease of use.

```
┌─────────────────────────────────────────────────────────────┐
│                    Select2Control (Generic)                  │
│  - UI rendering                                              │
│  - State management                                          │
│  - Positioning logic                                         │
│  - Filtering                                                 │
│  - Dynamic tag support                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ accepts onFetch callback
                           │
         ┌─────────────────┴──────────────────┐
         │                                    │
┌────────▼─────────────┐      ┌──────────────▼─────────────┐
│ TemplateSelectControl│      │  PostSelectControl (future)│
│                      │      │                            │
│ - fetchAllFSE...()   │      │  - fetchPosts()            │
│ - fetchTemplate()    │      │  - fetchPost()             │
└──────────────────────┘      └────────────────────────────┘
```

### Pattern 2: Callback-Based Data Loading

**Benefit:** Control remains generic, data source is injected.

```typescript
// Control doesn't know WHERE data comes from
<Select2Control
  onFetch={async () => {
    // Could be REST API
    const response = await fetch('/api/templates');
    return response.json();

    // Could be WordPress API
    const data = await apiFetch({ path: '/wp/v2/templates' });
    return data;

    // Could be static data
    return [{ label: 'Group 1', items: [...] }];
  }}
/>
```

### Pattern 3: Progressive Enhancement

**Benefit:** Start simple, add features as needed.

```typescript
// Minimal usage - static groups
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  groups={staticGroups}
/>

// Add lazy loading
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  onFetch={fetchGroups}
/>

// Add dynamic tags
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  onFetch={fetchGroups}
  enableDynamicTags={true}
  context="post"
/>
```

---

## TypeScript Best Practices Demonstrated

### 1. Explicit Types for All Props

```typescript
// ✅ GOOD - All types explicit
interface Select2ControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  groups?: Select2Group[];
  onFetch?: () => Promise<Select2Group[]>;
  onFetchSingle?: (id: string) => Promise<Select2Option | null>;
  enableDynamicTags?: boolean;
  context?: string;
  emptyMessage?: string;
  filterPlaceholder?: string;
}

// ❌ BAD - Using any
interface BadProps {
  label: string;
  value: any;  // Don't do this!
  onChange: (value: any) => void;  // Don't do this!
  config?: any;  // Don't do this!
}
```

### 2. Optional vs Nullable Types

```typescript
// ✅ GOOD - Clear distinction
interface Example {
  required: string;           // Always present
  optional?: string;          // May be undefined
  nullable: string | null;    // Always present, but may be null
  both?: string | null;       // May be undefined OR null
}
```

### 3. Generic Interfaces

```typescript
// ✅ GOOD - Flexible interfaces
export interface Select2Option {
  id: string;
  title: string;
  type?: string;  // Can extend with additional properties
}

export interface Select2Group {
  label: string;
  type: string;
  items: Select2Option[];
}
```

### 4. Runtime Type Guards

```typescript
// ✅ GOOD - Validate external data
function parseVxConfig(container: HTMLElement): VxConfig | null {
  const script = container.querySelector<HTMLScriptElement>('script.vxconfig');
  if (!script?.textContent) {
    return null;
  }

  try {
    return JSON.parse(script.textContent);
  } catch (e) {
    console.error('Failed to parse vxconfig:', e);
    return null;
  }
}
```

---

## CSS and Styling Strategy

### Plan C+ Requirement: Inherit from Voxel Parent Theme

**Implementation:** Use existing Voxel Select2 CSS classes:
- `.vxfse-select2-wrap`
- `.select2-container`
- `.select2-selection--single`
- `.select2-selection__rendered`
- `.select2-selection__placeholder`
- `.select2-dropdown`
- `.select2-search`
- `.select2-results__option--group`

**Evidence:**
```typescript
<div className="vxfse-select2-wrap select2-container select2-container--default">
  <span className="select2-selection select2-selection--single">
    <span className="select2-selection__rendered">
      {selectedOption.title}
    </span>
  </span>
</div>
```

**Result:** Zero custom CSS needed. Component inherits all styling from:
- `themes/voxel/assets/css/elementor-controls.css`
- Voxel parent theme styles automatically apply to child theme

---

## Integration with Existing Controls

### Consistency with Other Shared Controls

The Select2Control follows the same patterns as other shared controls:

| Control | Pattern | Example |
|---------|---------|---------|
| `DynamicTagTextControl` | Single field + dynamic tags | Text input with tag button |
| `IconPickerControl` | Popup picker | Icon selection modal |
| `TagMultiSelect` | Multi-select + search | Tag selection with chips |
| **`Select2Control`** | **Single-select + search** | **Grouped dropdown** |
| `TemplateSelectControl` | Specialized wrapper | Template picker |

All controls:
- Export from `shared/controls/index.ts`
- Include TypeScript types
- Work in strict mode
- Match Voxel UI patterns

---

## Usage Documentation

### For Block Developers: Using TemplateSelectControl

```typescript
import { TemplateSelectControl } from '../shared/controls';

// In edit.tsx InspectorControls
<TemplateSelectControl
  label={__('Template', 'voxel-fse')}
  value={attributes.templateId}
  onChange={(value) => setAttributes({ templateId: value })}
  placeholder={__('Select template...', 'voxel-fse')}
  context="post"
/>
```

### For Control Developers: Using Select2Control

```typescript
import { Select2Control } from '../shared/controls';
import type { Select2Group } from '../shared/controls';

// Example: Custom post picker
export default function PostPickerControl({ label, value, onChange }) {
  const fetchPosts = useCallback(async (): Promise<Select2Group[]> => {
    const posts = await apiFetch({ path: '/wp/v2/posts?per_page=100' });
    return [{
      label: 'Posts',
      type: 'post',
      items: posts.map(p => ({
        id: String(p.id),
        title: p.title.rendered,
        type: 'post',
      })),
    }];
  }, []);

  const fetchPost = useCallback(async (id: string) => {
    const post = await apiFetch({ path: `/wp/v2/posts/${id}` });
    return {
      id: String(post.id),
      title: post.title.rendered,
      type: 'post',
    };
  }, []);

  return (
    <Select2Control
      label={label}
      value={value}
      onChange={onChange}
      onFetch={fetchPosts}
      onFetchSingle={fetchPost}
      enableDynamicTags={false}
      emptyMessage={__('No posts found', 'voxel-fse')}
    />
  );
}
```

---

## Future Enhancements

### Potential Improvements

1. **Multi-Select Variant**
   - Create `Select2MultiControl` for multiple selections
   - Similar API but returns array of values
   - Use chips/tags for selected items

2. **Custom Renderers**
   - Allow custom option rendering (icons, thumbnails)
   - Callback prop for option template

3. **Async Search**
   - Support server-side filtering for large datasets
   - Debounced search requests

4. **Keyboard Navigation**
   - Arrow keys for option selection
   - Enter to select, Escape to close

5. **Accessibility**
   - ARIA labels and roles
   - Screen reader announcements
   - Focus management

---

## Lessons Learned

### 1. Generic First, Specialize Later

Starting with a generic `Select2Control` made it easy to create `TemplateSelectControl` as a thin wrapper. This pattern is more maintainable than duplicating code.

### 2. Callbacks > Hard-Coded Logic

Using `onFetch` and `onFetchSingle` callbacks makes the control completely data-source agnostic. It works with REST API, static data, or any async function.

### 3. TypeScript Strict Mode Forces Better Design

The requirement to avoid `any` types led to:
- Clear interface definitions
- Better separation of concerns
- More predictable behavior
- Better IDE autocomplete

### 4. React Portal Not Needed for Simple Dropdowns

Unlike `FieldPopup` which uses React Portal to render outside the component tree, Select2Control uses CSS `position: fixed` for the dropdown. This is simpler and sufficient for non-modal overlays.

### 5. WordPress Import Map Limitations Are Real

Had to use `wp.element.render()` at runtime instead of importing `render` from `@wordpress/element` due to import map limitations. This is documented in the master guide.

---

## Compliance Checklist

- [x] ✅ No `any` types (TypeScript strict mode)
- [x] ✅ Shared component (not block-specific)
- [x] ✅ Exported from `shared/controls/index.ts`
- [x] ✅ TypeScript types exported
- [x] ✅ React hooks from `'react'` not `@wordpress/element`
- [x] ✅ Uses Voxel CSS classes (no custom CSS)
- [x] ✅ Lazy loading pattern
- [x] ✅ Dynamic tag support (optional)
- [x] ✅ Callback-based data loading
- [x] ✅ Proper TypeScript interfaces
- [x] ✅ Generic + specialized wrapper pattern
- [x] ✅ WordPress import map compatible
- [x] ✅ Plan C+ architecture compliant

---

## File References

### Created Files
- `app/blocks/src/shared/controls/Select2Control.tsx` (419 lines)
- `app/blocks/src/shared/controls/TemplateSelectControl.tsx` (133 lines)

### Modified Files
- `app/blocks/src/shared/controls/index.ts` (added exports)
- `app/blocks/src/print-template/edit.tsx` (updated import)

### Removed Files
- `app/blocks/src/print-template/controls/TemplateSelectControl.tsx` (moved to shared)
- `app/blocks/src/print-template/controls/` (directory removed)

---

## Conclusion

The Select2Control implementation demonstrates how to build reusable, type-safe, Plan C+ compliant controls that:
1. Follow WordPress and Voxel patterns
2. Work in TypeScript strict mode
3. Are easily extensible for new use cases
4. Maintain clean separation of concerns
5. Integrate seamlessly with existing shared controls

This pattern should be used as a reference for future control development, particularly when creating specialized controls that wrap generic functionality.

---

**Document Version:** 1.0
**Last Updated:** December 2025
**Author:** VoxelFSE Development Team
**Related Documents:**
- [Plan C+ Architecture](../voxel-widget-conversion-master-guide.md#2-plan-c-architecture-mandatory)
- [TypeScript Guidelines](../voxel-widget-conversion-master-guide.md#9-wordpress-import-map-limitations)
- [Shared Controls Library](../../shared/controls/README.md)
