# Technical Documentation: `create-post` Block Interactive Editor Rendering

This document outlines the architecture and data flow behind the interactive rendering of the `create-post` block within the Gutenberg Full Site Editing (FSE) environment.

**File Location:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/`

## Core Concept: Mirrored Interactive Preview

The primary architectural goal is to provide a fully interactive, high-fidelity form preview within the Gutenberg editor that is identical to the frontend user experience. This is achieved by using a shared core React component, `CreatePostForm`, for both the editor preview and the live frontend form.

## Component & Data Flow

The rendering process begins when the `create-post` block is added to a page in the editor and proceeds through several stages of data fetching and component rendering.

![Flowchart of the rendering process](https://i.imgur.com/example.png "Fictional flowchart for illustration")

### 1. Block Registration & Initial Render

-   **`block.json`**: Defines the block as a dynamic block with a `render.php` file for server-side rendering on the frontend. Crucially, it specifies `index.js` as the `editorScript`.
-   **`index.tsx`**: This is the entry point for the editor. It uses `registerBlockType` to register the block and assigns the `Edit` component to the `edit` property. No `save` function is provided, as it's a dynamic block.

### 2. The `Edit` Component: The Editor's Gateway

-   **File:** `edit.tsx`
-   **Purpose:** This component orchestrates the block's entire appearance and behavior within the editor.

**Initial State:**
When first added, the block has no `postTypeKey` attribute set. The `Edit` component displays a `Placeholder` component, prompting the user to select a Voxel Post Type from a `SelectControl` in the block's Inspector Controls (the sidebar).

```typescript
// edit.tsx - Simplified Logic
export default function Edit({ attributes, setAttributes }: EditProps) {
    // ...
    const hasPostType = Boolean(attributes.postTypeKey);

    if (!hasPostType) {
        return (
            <Placeholder>
                {/* ... instructions to select a post type ... */}
            </Placeholder>
        );
    }
    // ... more rendering logic
}
```

### 3. Data Fetching via `useFieldsConfig` Hook

-   **File:** `hooks/useFieldsConfig.ts`
-   **Purpose:** A custom React hook responsible for fetching the form's field configuration.

Once the user selects a post type, the `postTypeKey` attribute is updated. This triggers the `useFieldsConfig` hook:

```typescript
// edit.tsx
const { fieldsConfig, isLoading, error } = useFieldsConfig(
    attributes.postTypeKey,
    'editor' // Context is key!
);
```

The hook's behavior is context-dependent:
-   **`context: 'editor'`**: It makes a REST API call using the WordPress `apiFetch` utility to a custom endpoint: `/wp-json/voxel-fse/v1/post-type-fields?post_type=<key>`.
-   **`context: 'frontend'`**: It reads the configuration from a global JavaScript object (`window.voxelFseCreatePost`) that is localized by `wp_localize_script` in `render.php`.

While the data is being fetched (`isLoading` is true), the `Edit` component shows a loading `Spinner`.

### 4. Rendering the Interactive Form: `CreatePostForm`

-   **File:** `shared/CreatePostForm.tsx`
-   **Purpose:** The core, shared component that renders the complete, interactive form.

Once `useFieldsConfig` successfully returns the `fieldsConfig` array, the `Edit` component passes this configuration down to `CreatePostForm`:

```typescript
// edit.tsx
<CreatePostForm
    attributes={attributes}
    fieldsConfig={fieldsConfig}
    context="editor"
    postId={null}
    isAdminMode={false}
/>
```

### 5. Inside `CreatePostForm`: State and Field Rendering

`CreatePostForm` is where the form's interactivity comes to life.

-   **State Management:** It uses `useState` to manage the form's data (`formData`), validation state, and multi-step progress.
-   **Field Initialization:** An effect hook processes the `fieldsConfig` prop to build the initial `formData` state, setting default values for each field.
-   **`FieldRenderer` Component:** The component iterates over the fields for the current step and uses the `FieldRenderer` component (`components/FieldRenderer.tsx`) for each one. `FieldRenderer` acts as a switch, rendering the appropriate input component (e.g., `TextField`, `SelectField`, `FileField`) based on the `field.type` property.
-   **User Interaction:** When a user interacts with an input (e.g., types in a text field), the `onChange` handler in the specific field component is called. This bubbles up to the `handleFieldChange` function in `CreatePostForm`.
-   **`handleFieldChange`**: This function updates the `formData` state with the new value and performs real-time validation, updating the field's error state. The component re-renders, displaying the updated value and any validation messages.

## Role of `render.php` vs. Gutenberg's `ServerSideRender`

A common question is whether this block uses Gutenberg's `<ServerSideRender>` component in the editor, and if not, why.

The block **does not** use the `<ServerSideRender>` component within `edit.tsx`. Instead, it renders the interactive `CreatePostForm` component directly in the editor. The `render.php` file is used exclusively for the **frontend rendering** of the block.

### Why Not Use `<ServerSideRender>`?

The `<ServerSideRender>` component is designed to display a preview of a block's frontend output (what `render.php` generates) within the editor. Using it here would be counterproductive to our goal of a fully interactive editor experience:

1.  **Non-Interactive Preview**: It would render static HTML, preventing the user from interacting with form fields, testing validation, or navigating steps directly within the editor.
2.  **Breaks the 1:1 Pattern**: The editor would show a static preview, while the frontend would have a dynamic React form. This would violate the core principle of having a mirrored, interactive experience in both environments.

### The Role of `render.php` in this Architecture

The `render.php` file is still crucial for the block's functionality on the live site. Its responsibilities are to bootstrap the client-side React application:

1.  **Render a Mount Point**: It outputs a simple root `<div>` element. This div serves as the container where our React form will be mounted.
2.  **Localize Data**: It uses `wp_localize_script` to pass essential data from the server (PHP) to the client (JavaScript). This includes the `fieldsConfig`, the current post ID (if editing), AJAX URLs, and other necessary attributes. This data is then available in a global object like `window.voxelFseCreatePost`.
3.  **Enqueue Scripts**: It ensures the compiled frontend script (`view.js`) is loaded on the page.

This "hydration" approach—where PHP renders a basic container and data, and JavaScript builds the interactive UI on top of it—allows us to use the exact same `CreatePostForm` React component on the frontend as we do in the editor, fulfilling the primary architectural goal.

## Summary of the Rendering Flow

1.  **Block Insertion**: `edit.tsx` renders a `Placeholder`.
2.  **Post Type Selection**: User selects a post type in the Inspector Controls.
3.  **Attribute Update**: The `postTypeKey` attribute is set.
4.  **Data Fetching**: `useFieldsConfig` is triggered and calls the REST API. `edit.tsx` shows a `Spinner`.
5.  **Data Received**: The API returns the field configuration. `isLoading` becomes `false`.
6.  **Interactive Render**: `edit.tsx` renders the `CreatePostForm` component, passing the `fieldsConfig` as a prop.
7.  **Form Display**: `CreatePostForm` initializes its state and uses `FieldRenderer` to display all the interactive form inputs.
8.  **Interaction**: User input updates the component's state, causing re-renders that reflect the changes in real-time within the Gutenberg editor.

This architecture ensures that the editor provides a true "what you see is what you get" experience, as the exact same React components and logic are used to power both the backend preview and the live frontend form.
