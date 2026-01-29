# Text Editor Field Validation Fix - 2025-12-05

## Problem Statement
The user reported three issues with the TextEditorField validation:
1. `.ts-exceeds-max` CSS class does not exist in Voxel
2. `ts-has-errors` class is not being added to the description field when there are validation errors
3. Validation error message "Value cannot be shorter than [number] characters" is not working for the text editor field

## Root Cause Analysis

After examining the working `TextField.tsx` component and comparing it with `TextEditorField.tsx`, I identified the following issues:

### TextField.tsx (Working Implementation)
- Has local state management for errors: `const [localError, setLocalError] = useState<string>('');`
- Validates minlength/maxlength in real-time via `handleChange` function
- Combines server and local errors: `const displayError = field.validation?.errors?.[0] || localError;`
- Adds `ts-has-errors` class when `hasError` is true
- Shows error messages in the label

### TextEditorField.tsx (Broken Implementation)
- Only checked server-side validation errors, no local error state
- `handleChange` function didn't validate anything
- Used non-existent `ts-exceeds-max` CSS class
- Didn't combine server and local errors properly

## Voxel Template Analysis

Examined `themes/voxel/templates/widgets/create-post/texteditor-field.php`:
- Lines 2, 28: Uses `class="ts-form-group"` (no `ts-has-errors` in the template, but should be added when errors exist)
- Lines 5-11, 31-37: Shows validation errors from `field.validation.errors[]` 
- Lines 10, 36: Character counter uses only `ts-char-counter` class, NO `ts-exceeds-max`
- Voxel does NOT use `.ts-exceeds-max` anywhere in the codebase

## Changes Made

### 1. Added Local Error State (Line 46)
```typescript
const [localError, setLocalError] = useState<string>('');
```

### 2. Added Real-time Validation Function (Lines 67-93)
```typescript
const validateContent = (newValue: string) => {
    // Only validate if there's content
    if (newValue && newValue.length > 0) {
        const minlength = field.props?.['minlength'];
        const maxlength = field.props?.['maxlength'];
        
        // Get content length (strip HTML for WYSIWYG)
        let length: number;
        if (isPlainText) {
            length = newValue.length;
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newValue;
            length = tempDiv.textContent?.length || 0;
        }

        if (minlength && length < minlength) {
            setLocalError(`Value cannot be shorter than ${minlength} characters`);
        } else if (maxlength && length > maxlength) {
            setLocalError(`Value cannot be longer than ${maxlength} characters`);
        } else {
            setLocalError('');
        }
    } else {
        setLocalError('');
    }
};
```

### 3. Updated TinyMCE Change Handler (Line 176)
Added `validateContent(content);` after `onChange(content);` in the TinyMCE editor's change event handler.

### 4. Updated Plain-text handleChange (Lines 232-237)
```typescript
const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateContent(newValue);  // Added validation
    resizeTextarea();
};
```

### 5. Combined Server and Local Errors (Lines 239-241)
```typescript
// Use server error or local error (matches TextField pattern)
const displayError = field.validation?.errors?.[0] || localError;
const hasError = displayError.length > 0;
```

### 6. Removed ts-exceeds-max Class (Lines 258-264)
Changed from:
```typescript
<span className={`is-required ts-char-counter ${contentLength > maxLength ? 'ts-exceeds-max' : ''}`}>
```
To:
```typescript
<span className="is-required ts-char-counter">
```

### 7. Ensured ts-has-errors is Applied (Line 244)
The root div already had the conditional class, but now it will work correctly because `hasError` properly evaluates both server and local errors.

## Testing Recommendations

1. Navigate to http://musicalwheel.devlocal/create-places/#
2. In the Description field (text editor), enter less than 20 characters
3. Click "Publish" or "Next step"
4. Verify:
   - Error message "Value cannot be shorter than 20 characters" appears in the label
   - The `ts-has-errors` class is applied to the field container
   - The field visually indicates an error state

## Files Modified
- `app/blocks/src/create-post/components/fields/TextEditorField.tsx`

## Pattern for Future Fields
When implementing validation for any field component:
1. Add local error state: `useState<string>('')`
2. Create validation function that checks field constraints
3. Call validation function on value change
4. Combine server errors with local errors: `field.validation?.errors?.[0] || localError`
5. Use the combined error to set `hasError` and display error messages
6. Add `ts-has-errors` class when `hasError` is true
7. Never use custom CSS classes not present in Voxel (like `ts-exceeds-max`)
