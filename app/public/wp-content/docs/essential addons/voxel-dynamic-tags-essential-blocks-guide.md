# Adding Voxel Dynamic Tag Buttons to Essential Blocks

**Date:** December 14, 2025  
**Purpose:** Add Voxel-style dynamic tag buttons to Essential Blocks inspector controls  
**Question:** Can I add the Voxel dynamic tag button in Essential Blocks controls?

---

## Executive Summary

**YES, you can add Voxel dynamic tag buttons to Essential Blocks!** ✅

The pink gradient icon buttons you see in Voxel Elementor widgets can be replicated in Gutenberg blocks using:
1. **Custom React component** for the dynamic tag button
2. **WordPress integration** to open Voxel's dynamic tag modal
3. **Attribute storage** for selected dynamic tags
4. **Next.js rendering** to process dynamic tags on the frontend

---

## What Are Voxel Dynamic Tags?

### In Voxel Elementor Widgets

![Voxel Dynamic Tags in Elementor](uploaded_image_0_1765667975240.png)
![Voxel Dynamic Tags in Heading](uploaded_image_1_1765667975240.png)
![Voxel Dynamic Tags in Button](uploaded_image_4_1765667975240.png)

**Features:**
- Pink gradient icon button (🔮)
- Opens dynamic tag modal
- Allows selecting post fields, user data, site info, etc.
- Replaces static text with dynamic content
- Works with @post.title, @user.display_name, etc.

### What We Need in Gutenberg

Same functionality, but:
- React component instead of Elementor control
- WordPress block attributes instead of Elementor settings
- Next.js rendering instead of PHP `render_callback`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 WORDPRESS EDITOR (edit.tsx)              │
│                                                          │
│  Essential Blocks InspectorPanel                        │
│    ↓                                                     │
│  Custom DynamicTagButton Component                      │
│    ↓ onClick                                            │
│  Opens Voxel Dynamic Tag Modal                          │
│    ↓ onSelect                                           │
│  Saves tag to block attributes                          │
│    ↓                                                     │
│  attributes.title = "@post.title"                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    SAVE (save.tsx)                       │
│                                                          │
│  Output vxconfig JSON with dynamic tags                 │
│  {                                                       │
│    title: "@post.title",                                │
│    description: "@post.excerpt"                         │
│  }                                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS FRONTEND                        │
│                                                          │
│  Parse vxconfig → Process dynamic tags                  │
│  "@post.title" → "My Awesome Post"                      │
│  "@post.excerpt" → "This is the excerpt..."             │
│    ↓                                                     │
│  Render with real data                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### Step 1: Create DynamicTagButton Component

**File:** `themes/voxel-fse/app/blocks/src/components/DynamicTagButton.tsx`

```tsx
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

interface DynamicTagButtonProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function DynamicTagButton({ 
  value, 
  onChange, 
  label = __('Dynamic Tag', 'voxel-fse') 
}: DynamicTagButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openDynamicTagModal = () => {
    // Check if Voxel dynamic tags are available
    if (typeof window.Voxel === 'undefined' || !window.Voxel.openDynamicTagModal) {
      console.error('Voxel dynamic tags not available');
      return;
    }

    // Open Voxel's dynamic tag modal
    window.Voxel.openDynamicTagModal({
      currentValue: value,
      onSelect: (tag: string) => {
        onChange(tag);
        setIsOpen(false);
      },
      onClose: () => {
        setIsOpen(false);
      }
    });

    setIsOpen(true);
  };

  return (
    <div className="voxel-dynamic-tag-control">
      <Button
        className="voxel-dynamic-tag-button"
        onClick={openDynamicTagModal}
        icon={<DynamicTagIcon />}
        label={label}
        showTooltip
      />
      {value && value.startsWith('@') && (
        <span className="voxel-dynamic-tag-value">{value}</span>
      )}
    </div>
  );
}

// Pink gradient icon (like Voxel)
function DynamicTagIcon() {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="voxel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ff00ff', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00ffff', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="8" fill="url(#voxel-gradient)" />
      <path 
        d="M10 6v8M6 10h8" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}
```

**Styles:** `themes/voxel-fse/app/blocks/src/components/DynamicTagButton.scss`

```scss
.voxel-dynamic-tag-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.voxel-dynamic-tag-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 0, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.voxel-dynamic-tag-value {
  font-size: 12px;
  color: #8b5cf6;
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
}
```

---

### Step 2: Integrate with Essential Blocks

**File:** `themes/voxel-fse/app/blocks/src/search-form/edit.tsx`

```tsx
import { InspectorPanel } from "@essential-blocks/controls";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";
import { DynamicTagButton } from "../components/DynamicTagButton";

export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        <InspectorPanel
          advancedControlProps={{
            marginPrefix: "searchFormMargin",
            paddingPrefix: "searchFormPadding",
            backgroundPrefix: "searchFormBackground",
            borderPrefix: "searchFormBorder",
            hasMargin: true,
            hasPadding: true,
            hasBackground: true,
            hasBorder: true,
          }}
        >
          <InspectorPanel.General>
            <PanelBody title="Search Settings">
              {/* Title with Dynamic Tag Button */}
              <div className="voxel-control-with-tag">
                <TextControl
                  label="Title"
                  value={attributes.title}
                  onChange={(value) => setAttributes({ title: value })}
                />
                <DynamicTagButton
                  value={attributes.title}
                  onChange={(value) => setAttributes({ title: value })}
                  label="Insert Dynamic Tag"
                />
              </div>

              {/* Description with Dynamic Tag Button */}
              <div className="voxel-control-with-tag">
                <TextControl
                  label="Description"
                  value={attributes.description}
                  onChange={(value) => setAttributes({ description: value })}
                />
                <DynamicTagButton
                  value={attributes.description}
                  onChange={(value) => setAttributes({ description: value })}
                  label="Insert Dynamic Tag"
                />
              </div>

              {/* Placeholder with Dynamic Tag Button */}
              <div className="voxel-control-with-tag">
                <TextControl
                  label="Placeholder"
                  value={attributes.placeholder}
                  onChange={(value) => setAttributes({ placeholder: value })}
                />
                <DynamicTagButton
                  value={attributes.placeholder}
                  onChange={(value) => setAttributes({ placeholder: value })}
                  label="Insert Dynamic Tag"
                />
              </div>
            </PanelBody>
          </InspectorPanel.General>
        </InspectorPanel>
      </InspectorControls>
      
      {/* Block preview */}
      <div className="search-form-preview">
        <h2>{processDynamicTag(attributes.title)}</h2>
        <p>{processDynamicTag(attributes.description)}</p>
        <input 
          type="text" 
          placeholder={processDynamicTag(attributes.placeholder)} 
        />
      </div>
    </>
  );
}

// Preview dynamic tags in editor
function processDynamicTag(value: string): string {
  if (!value || !value.startsWith('@')) {
    return value;
  }

  // Show preview in editor
  const tagMap: Record<string, string> = {
    '@post.title': 'Post Title (Dynamic)',
    '@post.excerpt': 'Post Excerpt (Dynamic)',
    '@user.display_name': 'User Name (Dynamic)',
    '@site.name': 'Site Name (Dynamic)',
  };

  return tagMap[value] || value;
}
```

---

### Step 3: Register Block Attributes

**File:** `themes/voxel-fse/app/blocks/src/search-form/block.json`

```json
{
  "apiVersion": 2,
  "name": "voxel-fse/search-form",
  "title": "Search Form (VX)",
  "category": "voxel",
  "attributes": {
    "title": {
      "type": "string",
      "default": "Search"
    },
    "description": {
      "type": "string",
      "default": "Find what you're looking for"
    },
    "placeholder": {
      "type": "string",
      "default": "Enter keywords..."
    },
    "searchFormMargin": {
      "type": "object",
      "default": {}
    },
    "searchFormPadding": {
      "type": "object",
      "default": {}
    },
    "searchFormBackground": {
      "type": "object",
      "default": {}
    },
    "searchFormBorder": {
      "type": "object",
      "default": {}
    }
  }
}
```

---

### Step 4: Save Block with Dynamic Tags

**File:** `themes/voxel-fse/app/blocks/src/search-form/save.tsx`

```tsx
export default function save({ attributes }) {
  const vxConfig = {
    title: attributes.title,
    description: attributes.description,
    placeholder: attributes.placeholder,
    margin: attributes.searchFormMargin,
    padding: attributes.searchFormPadding,
    background: attributes.searchFormBackground,
    border: attributes.searchFormBorder,
  };

  return (
    <div data-block-type="search-form">
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig)
        }}
      />
      <div className="placeholder">Loading...</div>
    </div>
  );
}
```

---

### Step 5: Process Dynamic Tags in Next.js

**File:** `apps/musicalwheel-frontend/lib/dynamic-tags/processor.ts`

```typescript
import { Post, User } from '@/types';

interface DynamicTagContext {
  post?: Post;
  user?: User;
  site?: {
    name: string;
    description: string;
    url: string;
  };
}

export function processDynamicTags(
  value: string,
  context: DynamicTagContext
): string {
  if (!value || !value.startsWith('@')) {
    return value;
  }

  // Parse dynamic tag
  const tagParts = value.substring(1).split('.');
  const [source, field] = tagParts;

  switch (source) {
    case 'post':
      return getPostField(field, context.post);
    case 'user':
      return getUserField(field, context.user);
    case 'site':
      return getSiteField(field, context.site);
    default:
      return value;
  }
}

function getPostField(field: string, post?: Post): string {
  if (!post) return '';

  const fieldMap: Record<string, string> = {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author.name,
    date: new Date(post.date).toLocaleDateString(),
    url: post.url,
  };

  return fieldMap[field] || '';
}

function getUserField(field: string, user?: User): string {
  if (!user) return '';

  const fieldMap: Record<string, string> = {
    display_name: user.displayName,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
  };

  return fieldMap[field] || '';
}

function getSiteField(field: string, site?: any): string {
  if (!site) return '';

  const fieldMap: Record<string, string> = {
    name: site.name,
    description: site.description,
    url: site.url,
  };

  return fieldMap[field] || '';
}
```

---

### Step 6: Render Block in Next.js

**File:** `apps/musicalwheel-frontend/components/blocks/SearchFormBlock.tsx`

```tsx
import { processDynamicTags } from '@/lib/dynamic-tags/processor';
import { generateStyles } from '@/lib/blocks/utils/generateStyles';

interface SearchFormBlockProps {
  vxConfig: {
    title: string;
    description: string;
    placeholder: string;
    margin: any;
    padding: any;
    background: any;
    border: any;
  };
  context: {
    post?: any;
    user?: any;
    site?: any;
  };
}

export function SearchFormBlock({ vxConfig, context }: SearchFormBlockProps) {
  // Process dynamic tags
  const title = processDynamicTags(vxConfig.title, context);
  const description = processDynamicTags(vxConfig.description, context);
  const placeholder = processDynamicTags(vxConfig.placeholder, context);

  // Generate styles from Essential Blocks attributes
  const styles = generateStyles({
    margin: vxConfig.margin,
    padding: vxConfig.padding,
    background: vxConfig.background,
    border: vxConfig.border,
  });

  return (
    <div className="search-form-block" style={styles}>
      <h2>{title}</h2>
      <p>{description}</p>
      <input 
        type="text" 
        placeholder={placeholder}
        className="search-input"
      />
      <button type="submit">Search</button>
    </div>
  );
}
```

---

## WordPress Integration

### Enqueue Voxel Dynamic Tags Script

**File:** `themes/voxel-fse/app/controllers/fse-blocks-controller.php`

```php
<?php

namespace VoxelFSE\Controllers;

class FSE_Blocks_Controller extends FSE_Base_Controller {
    
    public function hooks() {
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
    }
    
    public function enqueue_editor_assets() {
        // Enqueue Voxel dynamic tags script
        wp_enqueue_script(
            'voxel-dynamic-tags',
            get_template_directory_uri() . '/assets/js/dynamic-tags.js',
            ['wp-element', 'wp-components'],
            VOXEL_VERSION,
            true
        );
        
        // Pass Voxel data to JavaScript
        wp_localize_script('voxel-dynamic-tags', 'VoxelData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('voxel_dynamic_tags'),
            'availableTags' => $this->get_available_tags(),
        ]);
    }
    
    private function get_available_tags() {
        return [
            'post' => [
                'title' => __('Post Title', 'voxel-fse'),
                'excerpt' => __('Post Excerpt', 'voxel-fse'),
                'content' => __('Post Content', 'voxel-fse'),
                'author' => __('Post Author', 'voxel-fse'),
                'date' => __('Post Date', 'voxel-fse'),
            ],
            'user' => [
                'display_name' => __('User Display Name', 'voxel-fse'),
                'email' => __('User Email', 'voxel-fse'),
                'username' => __('Username', 'voxel-fse'),
            ],
            'site' => [
                'name' => __('Site Name', 'voxel-fse'),
                'description' => __('Site Description', 'voxel-fse'),
                'url' => __('Site URL', 'voxel-fse'),
            ],
        ];
    }
}
```

---

## Example: Complete Block with Dynamic Tags

### Heading Block

**File:** `themes/voxel-fse/app/blocks/src/heading/edit.tsx`

```tsx
import { InspectorPanel } from "@essential-blocks/controls";
import { InspectorControls, RichText } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { DynamicTagButton } from "../components/DynamicTagButton";

export default function Edit({ attributes, setAttributes }) {
  return (
    <>
      <InspectorControls>
        <InspectorPanel
          advancedControlProps={{
            marginPrefix: "headingMargin",
            paddingPrefix: "headingPadding",
            hasMargin: true,
            hasPadding: true,
          }}
        >
          <InspectorPanel.General>
            <PanelBody title="Heading Settings">
              {/* Dynamic Tag Button for Heading */}
              <DynamicTagButton
                value={attributes.content}
                onChange={(value) => setAttributes({ content: value })}
                label="Insert Dynamic Tag"
              />

              {/* HTML Tag */}
              <SelectControl
                label="HTML Tag"
                value={attributes.tag}
                options={[
                  { label: 'H1', value: 'h1' },
                  { label: 'H2', value: 'h2' },
                  { label: 'H3', value: 'h3' },
                  { label: 'H4', value: 'h4' },
                  { label: 'H5', value: 'h5' },
                  { label: 'H6', value: 'h6' },
                ]}
                onChange={(value) => setAttributes({ tag: value })}
              />
            </PanelBody>
          </InspectorPanel.General>
        </InspectorPanel>
      </InspectorControls>
      
      <RichText
        tagName={attributes.tag}
        value={processDynamicTag(attributes.content)}
        onChange={(value) => setAttributes({ content: value })}
        placeholder="Enter heading..."
      />
    </>
  );
}
```

---

## Benefits

### ✅ Pros

1. **Familiar UX** - Same pink gradient icon as Voxel Elementor
2. **Dynamic Content** - Use @post.title, @user.display_name, etc.
3. **Headless Compatible** - Works with Next.js frontend
4. **Reusable Component** - Use in all blocks
5. **Type Safe** - TypeScript support
6. **Consistent** - Same pattern across all blocks

### ⚠️ Considerations

1. **WordPress Dependency** - Requires Voxel dynamic tags script
2. **Two Implementations** - WordPress editor + Next.js frontend
3. **Tag Processing** - Need to build tag processor for Next.js
4. **Context Required** - Need post/user/site data in Next.js

---

## Implementation Checklist

### WordPress Setup
- [ ] Create `DynamicTagButton.tsx` component
- [ ] Add styles for dynamic tag button
- [ ] Enqueue Voxel dynamic tags script
- [ ] Register available tags in PHP
- [ ] Add dynamic tag button to block controls

### Block Integration
- [ ] Add dynamic tag button to text controls
- [ ] Store dynamic tags in block attributes
- [ ] Preview dynamic tags in editor
- [ ] Save dynamic tags to vxconfig

### Next.js Setup
- [ ] Create `processDynamicTags()` function
- [ ] Build tag processor for post fields
- [ ] Build tag processor for user fields
- [ ] Build tag processor for site fields
- [ ] Integrate with block components

### Testing
- [ ] Test dynamic tag button click
- [ ] Test tag selection
- [ ] Test tag preview in editor
- [ ] Test tag rendering in Next.js
- [ ] Test with different contexts (post/user/site)

---

## Final Answer

**YES, you can add Voxel dynamic tag buttons to Essential Blocks!** ✅

**What you get:**
- ✅ Pink gradient icon button (like Voxel)
- ✅ Dynamic tag modal integration
- ✅ @post.title, @user.display_name support
- ✅ Headless-compatible architecture
- ✅ Next.js rendering

**What you need to build:**
- ⚠️ `DynamicTagButton` React component
- ⚠️ WordPress integration (enqueue scripts)
- ⚠️ Next.js tag processor
- ⚠️ Context provider for post/user/site data

**Time estimate:** 4-6 hours for initial setup, then 15-30 minutes per block

---

**Document Version:** 1.0.0  
**Last Updated:** December 14, 2025  
**Author:** AI Agent  
**Status:** Implementation Guide Complete ✅
