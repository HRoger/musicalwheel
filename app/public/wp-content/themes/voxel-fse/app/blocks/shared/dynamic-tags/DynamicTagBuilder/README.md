# DynamicTagBuilder Component

React component for building dynamic tag expressions visually in the Gutenberg block editor.

## Overview

The DynamicTagBuilder provides a modal interface for:
- Browsing available dynamic tags (Post, Site, User, Term)
- Adding and configuring modifiers
- Building complex expressions visually
- Real-time expression editing with syntax highlighting

## Usage

```tsx
import { DynamicTagBuilder } from './components/DynamicTagBuilder';

function MyBlockEdit({ attributes, setAttributes }) {
  return (
    <InspectorControls>
      <PanelBody title="Dynamic Content">
        <DynamicTagBuilder
          value={attributes.dynamicTitle}
          onChange={(value) => setAttributes({ dynamicTitle: value })}
          label="Dynamic Title"
          context="post"
        />
      </PanelBody>
    </InspectorControls>
  );
}
```

## Components

### 1. **DynamicTagBuilder** (Main Component)
- Opens modal with full editor interface
- Manages state for data groups, modifiers, and expressions
- Fetches data from REST API endpoints
- Handles save/discard actions

**Props:**
- `value: string` - Current expression value
- `onChange: (value: string) => void` - Callback when value changes
- `label?: string` - Button label (default: "Dynamic Content")
- `context?: string` - Context for filtering tags (default: "post")
- `onClose?: () => void` - Callback when modal closes

### 2. **TagTree**
- Displays hierarchical tree of available tags
- Groups tags by data source (Post, Site, User, Term)
- Expandable nested properties
- Click to insert tag into expression

**Props:**
- `groups: DataGroup[]` - Array of data groups
- `searchQuery: string` - Search filter
- `onSelectTag: (group, property) => void` - Callback when tag is selected

### 3. **TagSearch**
- Search input for filtering tags
- Filters by tag name or key

**Props:**
- `value: string` - Search query
- `onChange: (value: string) => void` - Callback when query changes

### 4. **CodeEditor**
- Textarea for editing expressions
- Syntax highlighting for @tags
- Token selection for modifier editing

**Props:**
- `value: string` - Expression content
- `onChange: (value: string) => void` - Callback when content changes
- `onTokenFocus?: (index: number) => void` - Callback when token is focused

### 5. **ModifierEditor**
- UI for adding and configuring modifiers
- Dropdown to select modifier
- Dynamic form for modifier arguments
- List of applied modifiers with configuration

**Props:**
- `modifiers: AppliedModifier[]` - Currently applied modifiers
- `availableModifiers: Modifier[]` - All available modifiers
- `onUpdate: (modifiers) => void` - Callback when modifiers change

## REST API Endpoints

### GET `/musicalwheel/v1/dynamic-data/groups`

Returns available data groups with their properties.

**Query Parameters:**
- `context` - Context filter (default: "post")

**Response:**
```json
[
  {
    "type": "post",
    "label": "Post",
    "exports": [
      { "key": "title", "label": "Title", "type": "string" },
      { "key": "content", "label": "Content", "type": "string" }
    ]
  }
]
```

### GET `/musicalwheel/v1/dynamic-data/modifiers`

Returns available modifiers with their configuration.

**Response:**
```json
[
  {
    "key": "truncate",
    "label": "Truncate",
    "category": "text",
    "args": [
      {
        "type": "number",
        "label": "Length",
        "description": "Maximum length",
        "default": 50
      }
    ]
  }
]
```

## Type Definitions

See `types.ts` for complete TypeScript definitions:
- `DataGroup` - Data group structure
- `TagExport` - Tag/property definition
- `Modifier` - Modifier definition
- `ModifierArg` - Modifier argument
- `AppliedModifier` - Applied modifier with args
- `DynamicToken` - Parsed token from expression

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   DynamicTagBuilder                       │
│  ┌────────────────┬─────────────┬───────────────────┐   │
│  │  Left Sidebar  │    Main     │   Right Sidebar   │   │
│  │                │             │                    │   │
│  │  TagSearch     │ CodeEditor  │ ModifierEditor     │   │
│  │  TagTree       │             │ (when tag selected)│   │
│  │                │             │                    │   │
│  └────────────────┴─────────────┴───────────────────┘   │
│  [Discard]                              [Save]           │
└──────────────────────────────────────────────────────────┘
```

## Styling

All styles are in `styles.scss` using BEM naming:
- `.mw-dynamic-tag-builder` - Main container
- `.mw-tag-tree` - Tag tree styles
- `.mw-code-editor` - Editor styles
- `.mw-modifier-editor` - Modifier editor styles

## Future Enhancements

- [ ] Syntax highlighting overlay in CodeEditor
- [ ] Drag-and-drop modifier reordering
- [ ] Expression validation with error messages
- [ ] Preview pane showing rendered output
- [ ] Keyboard shortcuts (Ctrl+S to save, Esc to discard)
- [ ] Recently used tags list
- [ ] Expression templates/presets

## Development

Built with:
- React 18
- TypeScript
- WordPress Components (@wordpress/components)
- WordPress API Fetch (@wordpress/api-fetch)
- SCSS for styling

## Testing

To test the component:
1. Import in a block's edit function
2. Add to InspectorControls
3. Open Gutenberg editor
4. Click the dynamic content button
5. Browse tags and build expressions

The REST API endpoints will be automatically available when the theme is active.
