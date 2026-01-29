# Create Post Block - Success Message & "Back to Editing" AJAX Behavior

**Created:** November 2025
**Purpose:** Explain how the success message and AJAX "Back to Editing" button work

---

## Table of Contents

1. [Overview](#overview)
2. [The Problem](#the-problem)
3. [The Solution](#the-solution)
4. [Implementation Details](#implementation-details)
5. [Two Implementations](#two-implementations)

---

## Overview

After form submission, instead of redirecting to a new page, the create-post block shows a **success message** with two action buttons:

1. **"View Post"** - Link to view the published post (only if post status is 'publish')
2. **"Back to Editing"** - Return to the form without page reload (AJAX behavior)

This matches Voxel's widget behavior exactly.

---

## The Problem

### Original Behavior (WRONG):
```javascript
// After successful submission:
if (data.success) {
    if (data.redirect_url) {
        window.location.href = data.redirect_url;  // ❌ Page reload!
    }
}
```

**Issues:**
- Page reload loses form context
- User loses their position on the page
- Not the Voxel way (Voxel shows success message inline)
- Poor UX for quick edits

---

## The Solution

### Correct Behavior (Matches Voxel):

**After Submission:**
1. ✅ Hide the form (don't remove it from DOM)
2. ✅ Show success message with buttons
3. ✅ "View Post" button - Regular link (page navigation is fine)
4. ✅ "Back to Editing" button - **AJAX behavior** (no page reload)

**"Back to Editing" AJAX Behavior:**
```javascript
editBtn.addEventListener('click', function(e) {
    e.preventDefault();              // ✅ Prevent page navigation
    successContainer.style.display = 'none';  // ✅ Hide success message
    form.style.display = 'block';    // ✅ Show form again
    form.scrollIntoView({ behavior: 'smooth' });  // ✅ Scroll to form
});
```

**No page reload!** Just toggle visibility.

---

## Implementation Details

### Step 1: Success Message HTML Structure

**File:** `themes/voxel-fse/app/blocks/src/create-post/frontend.tsx:200-222`

```tsx
// Success screen (React component)
if (submission.done && submission.success) {
    return (
        <div className="ts-form ts-create-post">
            <div className="ts-edit-success">
                <div className="success-icon">✓</div>
                <h4>{submission.message}</h4>

                <div className="es-buttons">
                    {/* View Post Button - Regular link (page navigation) */}
                    {submission.viewLink && (
                        <a
                            href={submission.viewLink}
                            className="ts-btn ts-btn-2 ts-btn-large"
                        >
                            View Post
                        </a>
                    )}

                    {/* Back to Editing - Could be AJAX or regular link */}
                    {submission.editLink && (
                        <a
                            href={submission.editLink}
                            className="ts-btn ts-btn-1 ts-btn-large"
                        >
                            Back to Editing
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
```

**CSS Classes (from Voxel):**
- `ts-edit-success` - Success message container (Voxel's class)
- `es-buttons` - Button container (Voxel's class)
- `ts-btn ts-btn-1` - Primary button style (Voxel's class)
- `ts-btn ts-btn-2` - Secondary button style (Voxel's class)

---

### Step 2: Form Submission Sets Success State

**File:** `frontend.tsx:86-147`

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    setSubmission({ ...submission, processing: true });

    try {
        // Prepare form data
        const formDataObj = new FormData();
        formDataObj.append('postdata', JSON.stringify(formData));

        if (postId) {
            formDataObj.append('post_id', postId.toString());
        }

        // Submit via Voxel's AJAX endpoint
        const voxelAjaxUrl = `${wpData.ajaxUrl}?vx=1&action=create_post&post_type=${postTypeKey}${postId ? `&post_id=${postId}` : ''}`;

        const response = await fetch(voxelAjaxUrl, {
            method: 'POST',
            body: formDataObj,
        });

        const result = await response.json();

        if (result.success) {
            // ✅ Set success state with links from Voxel's response
            setSubmission({
                processing: false,
                done: true,
                success: true,
                message: result.message || attributes.successMessage,
                viewLink: result.view_link,  // ⭐ From Voxel response
                editLink: result.edit_link,   // ⭐ From Voxel response
            });

            // Redirect if configured (optional)
            if (attributes.redirectAfterSubmit) {
                window.location.href = attributes.redirectAfterSubmit;
            }
        } else {
            // Handle error
            setSubmission({
                processing: false,
                done: false,
                success: false,
                message: result.message || 'Submission failed',
                errors: result.errors,
            });
        }
    } catch (error) {
        console.error('Form submission error:', error);
        setSubmission({
            processing: false,
            done: false,
            success: false,
            message: 'Network error. Please try again.',
        });
    }
};
```

**Key Points:**
- Voxel's AJAX response includes `view_link` and `edit_link`
- These are stored in React state: `submission.viewLink` and `submission.editLink`
- React re-renders and shows success message instead of form

---

### Step 3: Voxel's Response Data

**Voxel returns:**
```json
{
    "success": true,
    "message": "Your changes have been submitted for review.",
    "post_id": 570,
    "status": "pending",
    "view_link": "https://example.com/post/570/",
    "edit_link": "https://example.com/create-post/?post_id=570"
}
```

**Link Logic:**
- **`view_link`**: Only included if `status === 'publish'` (published posts)
- **`edit_link`**: Always included (allows editing the post)

---

### Step 4: AJAX "Back to Editing" Behavior

There are **two implementations** depending on whether you're using the React component or vanilla JS.

#### Option A: Vanilla JS Implementation (view.js)

**File:** `themes/voxel-fse/app/blocks/src/create-post/view.js:582-594`

```javascript
// Handle "Back to Editing" button click (AJAX behavior like Voxel)
editBtn.addEventListener('click', function(e) {
    e.preventDefault();  // ⭐ Prevent page navigation!

    // Toggle visibility (AJAX behavior)
    successContainer.style.display = 'none';  // Hide success message
    form.style.display = 'block';              // Show form again

    // Scroll to form smoothly
    if (isAdmin) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
```

**How it works:**
1. User clicks "Back to Editing"
2. `e.preventDefault()` stops default link navigation
3. Hide success message (`display: none`)
4. Show form (`display: block`)
5. Scroll to form smoothly
6. **No page reload!** ✅

---

#### Option B: React Implementation (frontend.tsx)

**Current Implementation (frontend.tsx:213-217):**
```tsx
{submission.editLink && (
    <a href={submission.editLink} className="ts-btn ts-btn-1 ts-btn-large">
        Back to Editing
    </a>
)}
```

**Issue:** This is a regular link - causes page reload ❌

**Correct React Implementation (AJAX behavior):**

```tsx
{submission.editLink && (
    <button
        type="button"
        className="ts-btn ts-btn-1 ts-btn-large"
        onClick={handleBackToEditing}
    >
        Back to Editing
    </button>
)}
```

**Handler function:**
```typescript
const handleBackToEditing = () => {
    // Reset submission state to hide success message
    setSubmission({
        processing: false,
        done: false,
        success: false,
        message: '',
    });

    // Scroll to top of form
    const formElement = document.querySelector('.ts-create-post');
    if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
```

**How React version works:**
1. User clicks "Back to Editing" button
2. `handleBackToEditing()` resets `submission` state
3. React re-renders: `submission.done` is now `false`
4. Component switches from success message back to form rendering
5. Smooth scroll to form
6. **No page reload!** ✅

---

## Two Implementations Comparison

### Vanilla JS (view.js):

**Pros:**
- ✅ Simple DOM manipulation
- ✅ Works immediately
- ✅ No state management needed

**Cons:**
- ❌ Manual DOM manipulation
- ❌ Harder to maintain
- ❌ Not the React way

**Code:**
```javascript
// Show success
form.style.display = 'none';
successContainer.style.display = 'block';

// Back to editing
editBtn.addEventListener('click', function(e) {
    e.preventDefault();
    successContainer.style.display = 'none';
    form.style.display = 'block';
});
```

---

### React (frontend.tsx):

**Pros:**
- ✅ Declarative UI (React way)
- ✅ State-driven rendering
- ✅ Easier to test
- ✅ Better for complex state

**Cons:**
- ❌ Requires proper state management
- ❌ More code to understand

**Code:**
```tsx
// Show success (state change triggers re-render)
setSubmission({
    done: true,
    success: true,
    message: 'Success!',
    editLink: '/edit/123'
});

// Conditional rendering
if (submission.done && submission.success) {
    return <SuccessMessage />;  // Show success
}
return <Form />;  // Show form

// Back to editing (reset state)
const handleBackToEditing = () => {
    setSubmission({ done: false, success: false, message: '' });
};
```

---

## Git History

### Commit ebc245ba (Nov 18, 2025)
**Title:** "Fix Create Post block to show success message instead of redirecting"

**Changes:**
- Added success message container in render.php
- Changed view.js to show success instead of redirect
- Added success message styling

**Before:**
```javascript
if (data.redirect_url) {
    window.location.href = data.redirect_url;  // ❌ Page reload
}
```

**After:**
```javascript
form.style.display = 'none';
successContainer.style.display = 'block';  // ✅ Show success message
```

---

### Commit 244e80cc (Nov 18, 2025)
**Title:** "Fix 'Back to editing' button and document indexing issue"

**Changes:**
- Added AJAX behavior to "Back to Editing" button
- Prevented default link navigation
- Added smooth scroll to form

**Before:**
```html
<a href="/edit/123" class="ts-btn">Back to Editing</a>
<!-- ❌ Clicking causes page reload -->
```

**After:**
```javascript
editBtn.addEventListener('click', function(e) {
    e.preventDefault();  // ✅ No page reload
    successContainer.style.display = 'none';
    form.style.display = 'block';
    blockEl.scrollIntoView({ behavior: 'smooth' });
});
```

---

## Key Concepts

### 1. AJAX Behavior vs Page Navigation

**Page Navigation (Regular Link):**
```html
<a href="/edit/123">Back to Editing</a>
```
- Clicking navigates to new page
- Full page reload
- Loses current page state
- Network request for new HTML

**AJAX Behavior (Prevented Default):**
```javascript
link.addEventListener('click', function(e) {
    e.preventDefault();  // Stop navigation!
    // Toggle visibility instead
});
```
- No page reload
- Instant UI update
- Preserves page state
- No network request

---

### 2. Show/Hide vs Conditional Rendering

**Vanilla JS (Show/Hide):**
```javascript
// Both elements exist in DOM
successMessage.style.display = 'none';  // Hidden
form.style.display = 'block';           // Visible

// Toggle
successMessage.style.display = 'block';  // Visible
form.style.display = 'none';             // Hidden
```

**React (Conditional Rendering):**
```tsx
// Only one is rendered at a time
if (submission.success) {
    return <SuccessMessage />;  // ✅ This is in DOM
}
return <Form />;  // ❌ This is NOT in DOM
```

---

### 3. Voxel CSS Classes

The success message uses Voxel's exact CSS classes:

```html
<div class="ts-edit-success">
    <!-- Voxel's success message container -->

    <div class="es-buttons">
        <!-- Voxel's button container -->

        <a class="ts-btn ts-btn-1">...</a>  <!-- Primary button -->
        <a class="ts-btn ts-btn-2">...</a>  <!-- Secondary button -->
    </div>
</div>
```

**Why use Voxel classes?**
- ✅ Automatic styling from Voxel's CSS
- ✅ Perfect visual match with Voxel widgets
- ✅ No custom CSS needed
- ✅ Updates when Voxel theme updates

---

## Summary

### The Success Message Flow:

1. **User submits form**
    - AJAX POST to Voxel endpoint
    - `action=create_post&post_type=places`

2. **Voxel responds with:**
   ```json
   {
       "success": true,
       "message": "Your changes have been submitted for review.",
       "view_link": "/post/570/",
       "edit_link": "/create-post/?post_id=570"
   }
   ```

3. **Block shows success message**
    - Hide form
    - Show success message with two buttons

4. **User clicks "Back to Editing"**
    - **Vanilla JS:** `e.preventDefault()` + toggle `display` properties
    - **React:** Reset state to `{ done: false }` + re-render
    - Smooth scroll to form
    - **No page reload!** ✅

### Key Files:

- **`frontend.tsx`** - React component (current Phase A)
- **`view.js`** - Vanilla JS implementation (legacy/reference)
- **Commit ebc245ba** - Original success message implementation
- **Commit 244e80cc** - Added AJAX "Back to Editing" behavior

---

**The "magic" is `e.preventDefault()` - it stops the link from navigating and allows JavaScript to handle the click event instead.**