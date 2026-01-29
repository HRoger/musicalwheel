# RepeaterField Implementation Plan

**Plan Date:** 2025-12-03
**Implementation Phase:** Phase 2 - Product Types & Admin Interface
**Status:** ✅ Ready for Implementation
**Priority:** CRITICAL - Blocks ProductField implementation

---

## Overview
Implement a fully functional RepeaterField component for the create-post block to handle repeatable field groups with nested fields, drag-and-drop reordering, and collapsible UI - matching Voxel's repeater-field.php implementation.

## Critical Context

### Why This Is Blocking
- **ProductField dependency**: ProductField's sub-fields (Variations, Addons) use repeater patterns internally
- **Multiple field types need repeaters**: Not just products - many Voxel fields can be repeatable
- **Current status**: Phase B placeholder stub exists, but no functionality

### Voxel's Repeater Architecture

**Data Structure:**
```typescript
// Value format: Array of row objects
[
  { field1: "value1", field2: "value2" },  // Row 0
  { field1: "value3", field2: "value4" }   // Row 1
]

// Stored in WordPress as JSON-encoded post meta
```

**Key Features from Voxel Analysis:**
1. **Draggable rows** - Uses vue-draggable (Sortable.js wrapper)
2. **Collapsible UI** - Each row can expand/collapse
3. **Row labeling** - Custom row header based on field value (e.g., show variation name)
4. **Add/Remove rows** - With min/max constraints
5. **Nested field rendering** - Each row contains full field instances
6. **Validation per row** - Validates all nested fields
7. **Meta state tracking** - Collapse/expand state per row

**Frontend Props Structure** (from repeater-field.php:frontend_props()):
```php
[
  'fields' => $config,      // Blueprint for new rows (index = -1)
  'rows' => $rows,          // Existing row data with field configs
  'row_label' => 'name',    // Which field key to use for row header
  'l10n' => [
    'item' => 'Item',
    'add_row' => 'Add row'
  ],
  'min_rows' => 3,
  'max_rows' => 10
]
```

## Implementation Plan

### Phase 1: Data Structure & Type Definitions

**File:** `create-post/types.ts`

1. Define TypeScript interfaces for repeater field structure:
   ```typescript
   export interface RepeaterRow {
     [fieldKey: string]: any;  // Field values keyed by field key
     'meta:state': {
       _uid: string;            // CLIENT-SIDE ONLY - for React keys & drag-and-drop
       collapsed: boolean;      // Collapse state
       label: string;           // Computed row label
     };
   }

   export interface RepeaterFieldConfig {
     fields: VoxelField[];      // Blueprint for fields in each row
     rows?: RepeaterRow[];      // Pre-populated rows (edit mode)
     row_label?: string;        // Field key to use for row header
     l10n?: {
       item?: string;
       add_row?: string;
     };
     min_rows?: number;
     max_rows?: number;
   }
   ```

   **CRITICAL:** The `_uid` is for frontend tracking only. Backend uses numeric array indices (0, 1, 2...). We strip `meta:state` entirely before form submission.

2. Update VoxelField interface to support repeater context:
   ```typescript
   export interface VoxelField {
     // ... existing fields ...
     repeater_index?: number;   // Track which row this field belongs to
     repeater_id?: string;      // Parent repeater field ID
   }
   ```

### Phase 2: Core RepeaterField Component

**File:** `create-post/components/fields/RepeaterField.tsx`

1. **Replace stub with functional component:**
   - Accept standard field props: `field`, `value`, `onChange`, `onBlur`, `icons`, `postTypeKey`
   - Parse `field.props` to extract repeater configuration
   - Manage row state with React hooks

   ```typescript
   interface RepeaterFieldProps {
     field: VoxelField;
     value: any;
     onChange: (value: any) => void;
     onBlur?: () => void;
     icons?: FieldIcons;
     postTypeKey?: string;  // REQUIRED for PostRelationField inside repeaters
   }
   ```

2. **State management:**
   ```typescript
   // Generate globally unique IDs for rows (client-side only)
   const generateUid = () => {
     return `${field.key}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   };

   const createEmptyRow = (index: number): RepeaterRow => {
     const newRow: RepeaterRow = {
       'meta:state': {
         _uid: generateUid(),
         collapsed: false,  // New rows start expanded
         label: `${l10n.item} ${index + 1}`
       }
     };

     // Initialize each field with default value
     fieldBlueprint.forEach(field => {
       newRow[field.key] = field.value || null;
     });

     return newRow;
   };

   const [rows, setRows] = useState<RepeaterRow[]>(() => {
     // 1. If editing existing post with data
     if (Array.isArray(value) && value.length > 0) {
       return value.map((row, index) => ({
         ...row,
         'meta:state': {
           _uid: generateUid(),
           collapsed: true,
           label: row[rowLabelField] || `${l10n.item} ${index + 1}`
         }
       }));
     }

     // 2. If creating new post, respect min_rows
     if (minRows && minRows > 0) {
       return Array.from({ length: minRows }, (_, i) => createEmptyRow(i));
     }

     // 3. Otherwise start empty
     return [];
   });

   const [activeRowId, setActiveRowId] = useState<string | null>(null);
   ```

3. **Row operations with action-based validation:**
   ```typescript
   const addRow = () => {
     // ACTION-BASED validation (not useEffect)
     if (maxRows && rows.length >= maxRows) {
       field.validation.errors = [`Cannot add more than ${maxRows} items`];
       return;
     }

     field.validation.errors = [];  // Clear errors on successful add
     const newRow = createEmptyRow(rows.length);
     const newRows = [...rows, newRow];
     setRows(newRows);
     onChange(newRows);
     setActiveRowId(newRow['meta:state']._uid);  // Expand new row
   };

   const removeRow = (index: number) => {
     const newRows = [...rows];
     newRows.splice(index, 1);

     // ACTION-BASED validation
     if (minRows && newRows.length < minRows) {
       field.validation.errors = [`Must contain at least ${minRows} items`];
     } else {
       field.validation.errors = [];
     }

     setRows(newRows);
     onChange(newRows);
   };

   const toggleCollapse = (rowId: string) => {
     setActiveRowId(activeRowId === rowId ? null : rowId);
   };
   ```

4. **Field change handler with enhanced row label support:**
   ```typescript
   const handleFieldChange = (rowIndex: number, fieldKey: string, fieldValue: any) => {
     const newRows = [...rows];
     newRows[rowIndex][fieldKey] = fieldValue;

     // Update row label if this is the label field
     if (fieldKey === rowLabelField) {
       const labelField = fieldBlueprint.find(f => f.key === fieldKey);
       let labelValue = fieldValue;

       // Handle different field types for row label
       switch (labelField?.type) {
         case 'select':
         case 'taxonomy':
           const choice = labelField.props?.choices?.find(c => c.value === fieldValue);
           labelValue = choice?.label || fieldValue;
           break;
         case 'multiselect':
           const selected = Object.keys(fieldValue || {}).filter(k => fieldValue[k]);
           labelValue = `${selected.length} selected`;
           break;
         case 'date':
           labelValue = fieldValue ? new Date(fieldValue).toLocaleDateString() : '';
           break;
       }

       newRows[rowIndex]['meta:state'].label =
         labelValue || `${l10n.item} ${rowIndex + 1}`;
     }

     setRows(newRows);
     onChange(newRows);
   };
   ```

### Phase 3: Nested Field Rendering

**Implementation within RepeaterField.tsx:**

1. **Recursive field rendering with full prop support:**
   ```typescript
   const renderRowFields = (row: RepeaterRow, rowIndex: number) => {
     return fieldBlueprint.map(fieldConfig => {
       // Check visibility rules (if present)
       if (fieldConfig.visibility_rules && !checkVisibility(fieldConfig)) {
         return null;
       }

       // Check conditional logic against row values (if present)
       if (fieldConfig.conditional_logic && !checkConditionalLogic(fieldConfig, row)) {
         return null;
       }

       // Create field instance for this row
       const fieldInstance: VoxelField = {
         ...fieldConfig,
         value: row[fieldConfig.key] || null,
         repeater_index: rowIndex,
         repeater_id: field.key,
         key: `${field.key}[${rowIndex}][${fieldConfig.key}]`  // Unique key
       };

       // Use FieldRenderer for recursive rendering
       return (
         <div key={fieldInstance.key} className="ts-form-field">
           <FieldRenderer
             field={fieldInstance}
             value={fieldInstance.value}
             onChange={(value) => handleFieldChange(rowIndex, fieldConfig.key, value)}
             onBlur={onBlur}
             icons={icons}
             postTypeKey={postTypeKey}  // CRITICAL: Pass through for PostRelationField
           />
         </div>
       );
     });
   };
   ```

2. **Handle field visibility/conditions:**
   - Check `fieldConfig.visibility_rules` if present
   - Check `fieldConfig.conditional_logic` against row values
   - Skip rendering if conditions fail

### Phase 4: Drag-and-Drop Reordering

**Library Choice:** Use `@dnd-kit/core` + `@dnd-kit/sortable` (modern React alternative to vue-draggable)

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Implementation:**

1. **Wrap repeater container with proper imports:**
   ```typescript
   import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
   import {
     SortableContext,
     verticalListSortingStrategy,
     useSortable,
     arrayMove  // CRITICAL: Import arrayMove from @dnd-kit/sortable
   } from '@dnd-kit/sortable';
   import { CSS } from '@dnd-kit/utilities';

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
     if (!over || active.id === over.id) return;

     const oldIndex = rows.findIndex(row => row['meta:state']._uid === active.id);
     const newIndex = rows.findIndex(row => row['meta:state']._uid === over.id);

     const reorderedRows = arrayMove(rows, oldIndex, newIndex);
     setRows(reorderedRows);
     onChange(reorderedRows);
   };

   return (
     <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
       <SortableContext items={rows.map(r => r['meta:state']._uid)} strategy={verticalListSortingStrategy}>
         {rows.map((row, index) => (
           <RepeaterRow key={row['meta:state']._uid} row={row} index={index} ... />
         ))}
       </SortableContext>
     </DndContext>
   );
   ```

2. **Create sortable row component:**
   ```typescript
   const RepeaterRow: React.FC<{row: RepeaterRow, index: number, ...}> = ({row, index, ...}) => {
     const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
       useSortable({ id: row['meta:state']._uid });  // Use _uid for drag tracking

     const style = {
       transform: CSS.Transform.toString(transform),
       transition,
       opacity: isDragging ? 0.5 : 1
     };

     return (
       <div ref={setNodeRef} style={style} className="ts-field-repeater">
         <div className="ts-repeater-head" {...attributes} {...listeners}>
           {/* Drag handle + row header */}
         </div>
         {!row['meta:state'].collapsed && (
           <div className="medium form-field-grid">
             {/* Nested fields */}
           </div>
         )}
       </div>
     );
   };
   ```

### Phase 5: UI/UX Components

**Match Voxel's HTML structure exactly:**

1. **Repeater container:**
   ```tsx
   <div className="ts-form-group ts-repeater" ref={containerRef}>
     <label>
       {field.label}
       {field.required && <span className="is-required">Required</span>}
       {field.description && (
         <div className="vx-dialog">
           {/* Info icon tooltip */}
         </div>
       )}
     </label>

     <div className="ts-repeater-container">
       {/* Sortable rows */}
     </div>

     {/* Add row button */}
     {(!maxRows || rows.length < maxRows) && (
       <a href="#" className="ts-repeater-add ts-btn ts-btn-4 form-btn" onClick={handleAddRow}>
         <svg>...</svg> {l10n.add_row}
       </a>
     )}

     {/* Validation errors */}
     {hasError && <span className="ts-error">{displayError}</span>}
   </div>
   ```

2. **Row header with controls:**
   ```tsx
   <div className="ts-repeater-head" onClick={() => toggleCollapse(row['meta:state']._uid)}>
     {/* Drag handle icon */}
     <svg className="drag-handle">...</svg>

     <label>
       {row['meta:state'].label}
       {rowHasError && <span className="ts-row-error">Error</span>}
     </label>

     <div className="ts-repeater-controller">
       <a href="#" onClick={(e) => { e.stopPropagation(); removeRow(index); }}>
         <svg>...</svg> {/* Delete icon */}
       </a>
       <a href="#">
         <svg>...</svg> {/* Collapse/expand icon */}
       </a>
     </div>
   </div>
   ```

3. **Collapsible content with smooth animation:**
   ```tsx
   <div
     className={`ts-field-repeater ${row['meta:state'].collapsed ? 'collapsed' : ''}`}
     style={{
       maxHeight: row['meta:state'].collapsed ? '0' : '2000px',
       overflow: 'hidden',
       transition: 'max-height 0.3s ease-in-out'
     }}
   >
     {!row['meta:state'].collapsed && (
       <div className="medium form-field-grid">
         {renderRowFields(row, index)}
       </div>
     )}
   </div>
   ```

### Phase 6: Validation

**IMPORTANT:** Use action-based validation (not useEffect) to match existing field patterns.

1. **Row count validation (already implemented in Phase 2):**
   - Validation happens in `addRow()` and `removeRow()` functions
   - Errors set directly on `field.validation.errors` array
   - Clear errors on successful operations

2. **Nested field validation:**
   - Each nested field handles its own validation automatically via FieldRenderer
   - Individual field errors display within each field component
   - RepeaterField aggregates errors: if any nested field has errors, show indicator on row header

3. **Row error indicator:**
   ```typescript
   const hasRowError = (row: RepeaterRow) => {
     return fieldBlueprint.some(fieldConfig => {
       const fieldValue = row[fieldConfig.key];
       const fieldInstance = { ...fieldConfig, value: fieldValue };
       return fieldInstance.validation?.errors?.length > 0;
     });
   };

   // In row header:
   {hasRowError(row) && <span className="ts-row-error">Error</span>}
   ```

4. **Form submission validation:**
   - Form-level validation will be handled by form submission hook
   - RepeaterField just maintains validation state
   - Parent form can check `field.validation.errors` before submit

### Phase 7: Form Submission Integration (CRITICAL)

**File:** `create-post/hooks/useFormSubmission.ts`

**IMPORTANT:** The original plan incorrectly stated "no special handling needed." This is WRONG. Repeater fields require special handling to:
1. Strip frontend-only `meta:state` data
2. Handle nested file fields within repeaters
3. Filter empty rows

1. **Add repeater handling in prepareFormData():**
   ```typescript
   // Around line 150-160, add case for repeater fields:

   if (field.type === 'repeater' && Array.isArray(value)) {
     // 1. Clean rows: strip meta:state and filter empty rows
     const cleanedRows = value
       .map(row => {
         const { 'meta:state': metaState, ...fieldValues } = row;
         return fieldValues;  // Just field values, no meta:state
       })
       .filter(row => {
         // Remove rows with no field values
         return Object.keys(row).length > 0;
       });

     // 2. Add cleaned rows to postdata
     postdataForJson[fieldKey] = cleanedRows;

     // 3. Handle nested file fields
     cleanedRows.forEach((row, rowIndex) => {
       Object.keys(row).forEach(nestedFieldKey => {
         const nestedValue = row[nestedFieldKey];

         // Check if this is a file field value
         if (Array.isArray(nestedValue) && nestedValue.length > 0) {
           const firstItem = nestedValue[0];
           if (firstItem && (firstItem.source === 'new_upload' || firstItem.source === 'existing')) {
             // This is a file field - process it
             nestedValue.forEach((fileObj: any) => {
               if (fileObj.source === 'new_upload' && fileObj.file) {
                 // Add to FormData with proper key
                 const fileKey = `${fieldKey}[${rowIndex}][${nestedFieldKey}]`;
                 formDataObj.append(`files[${fileKey}][]`, fileObj.file);

                 // Mark in postdata
                 if (!postdataForJson[fieldKey][rowIndex][nestedFieldKey]) {
                   postdataForJson[fieldKey][rowIndex][nestedFieldKey] = [];
                 }
                 postdataForJson[fieldKey][rowIndex][nestedFieldKey].push('uploaded_file');
               } else if (fileObj.source === 'existing' && fileObj.id) {
                 // Keep attachment ID
                 if (!postdataForJson[fieldKey][rowIndex][nestedFieldKey]) {
                   postdataForJson[fieldKey][rowIndex][nestedFieldKey] = [];
                 }
                 postdataForJson[fieldKey][rowIndex][nestedFieldKey].push(fileObj.id);
               }
             });
           }
         }
       });
     });
   }
   ```

2. **Add same handling in handleSaveDraft():**
   - Duplicate the repeater handling logic in the draft save function
   - Should be around line 370-380
   - Identical logic to handleSubmit

3. **Update FieldRenderer.tsx:**
   ```typescript
   case 'repeater':
     return (
       <RepeaterField
         field={field}
         value={value}
         onChange={onChange}
         onBlur={onBlur}
         icons={icons}
         postTypeKey={postTypeKey}
       />
     );
   ```

3. **Test scenarios:**
   - Add/remove rows
   - Drag to reorder
   - Collapse/expand rows
   - Nested field changes propagate correctly
   - Min/max row constraints enforced
   - Row labeling updates dynamically
   - Validation errors display correctly
   - Form submission includes repeater data

## Critical Files to Modify

1. **`themes/voxel-fse/app/blocks/src/create-post/components/fields/RepeaterField.tsx`** (~450 lines)
   - Replace entire stub implementation
   - Add drag-and-drop logic with @dnd-kit
   - Add collapsible UI with animation
   - Add nested field rendering with recursive FieldRenderer
   - Add UID generation and row operations

2. **`themes/voxel-fse/app/blocks/src/create-post/types.ts`** (+30 lines)
   - Add RepeaterRow interface (with _uid)
   - Add RepeaterFieldConfig interface
   - Update VoxelField interface (repeater_index, repeater_id)

3. **`themes/voxel-fse/app/blocks/src/create-post/hooks/useFormSubmission.ts`** (+70 lines)
   - **CRITICAL:** Add repeater data cleaning (strip meta:state)
   - Handle nested file fields within repeaters
   - Filter empty rows before submission
   - Apply to both handleSubmit AND handleSaveDraft

4. **`themes/voxel-fse/package.json`** (+2 dependencies)
   - Add `@dnd-kit/core`
   - Add `@dnd-kit/sortable`

5. **`themes/voxel-fse/app/blocks/src/create-post/components/FieldRenderer.tsx`** (update case)
   - Update repeater case to pass postTypeKey prop

## Dependencies

**NPM Packages:**
- `@dnd-kit/core` - Modern drag-and-drop library
- `@dnd-kit/sortable` - Sortable list utilities

**Internal Components:**
- FieldRenderer (for recursive rendering)
- Existing field components (text, select, etc.)
- FieldLabel utility

**Voxel CSS Classes:**
- `.ts-repeater` - Container
- `.ts-repeater-container` - Row list
- `.ts-field-repeater` - Individual row
- `.ts-repeater-head` - Row header (drag handle)
- `.ts-repeater-controller` - Row action buttons
- `.ts-repeater-add` - Add button
- `.form-field-grid` - Field grid layout

## Success Criteria

- [ ] Add/remove rows works correctly
- [ ] Drag-and-drop reordering functional
- [ ] Collapsible rows with expand/collapse animation
- [ ] Row labels update dynamically based on field values
- [ ] Min/max row constraints enforced
- [ ] Nested fields render and update correctly
- [ ] Validation errors display per row and per field
- [ ] Form submission includes repeater data in correct format
- [ ] Matches Voxel's HTML structure and CSS classes exactly
- [ ] No console errors or warnings
- [ ] Build succeeds without TypeScript errors

## Implementation Notes

**Why @dnd-kit over react-beautiful-dnd:**
- Modern, actively maintained
- Better TypeScript support
- No warnings with React 18+
- Smaller bundle size
- More flexible API

**Row ID Generation:**
- Use timestamp + index for uniqueness: `row-${Date.now()}-${index}`
- Required for drag-and-drop library's item key
- Used for tracking collapse state

**Recursive Rendering:**
- FieldRenderer already handles all field types
- Pass unique key per field per row
- Maintain row index in field instance for form submission

**Performance Considerations:**
- Use React.memo for RepeaterRow if many rows
- Avoid re-rendering all rows on single field change
- Use stable row IDs (don't regenerate on every render)

## Future Enhancements (Post-Implementation)

- [ ] Keyboard shortcuts (Enter to add, Delete to remove)
- [ ] Bulk operations (duplicate row, clear all)
- [ ] Row templates (save/load common configurations)
- [ ] Animation on add/remove/reorder
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Search/filter rows (if many rows)

## References

- Voxel: `themes/voxel/app/post-types/fields/repeater-field.php`
- Voxel: `themes/voxel/templates/widgets/create-post/repeater-field.php`
- FileField implementation: `create-post/components/fields/FileField.tsx` (array handling pattern)
- MultiselectField implementation: `create-post/components/fields/MultiselectField.tsx` (popup pattern)

---

## Critical Fixes Applied to Original Plan

This plan was validated by a Plan agent and corrected before implementation. **Key fixes applied:**

### 1. ✅ Data Structure Corrected
- **Issue:** Original used `id: string` in meta:state
- **Fix:** Changed to `_uid: string` (client-side only, not sent to backend)
- **Impact:** Backend uses numeric array indices, not IDs. meta:state stripped before submission.

### 2. ✅ Form Submission Integration Added
- **Issue:** Original plan stated "no special handling needed"
- **Fix:** Added comprehensive repeater handling in useFormSubmission.ts
- **Impact:** Strips meta:state, handles nested file fields, filters empty rows

### 3. ✅ arrayMove Import Fixed
- **Issue:** Original used `arrayMove()` without import
- **Fix:** Import `arrayMove` from `@dnd-kit/sortable`
- **Impact:** Build will succeed without errors

### 4. ✅ Validation Pattern Fixed
- **Issue:** Original used useEffect for validation
- **Fix:** Changed to action-based validation (in addRow/removeRow)
- **Impact:** Matches existing field patterns, avoids infinite loops

### 5. ✅ postTypeKey Prop Added
- **Issue:** Missing from RepeaterFieldProps interface
- **Fix:** Added `postTypeKey?: string` to props
- **Impact:** PostRelationField inside repeaters will work

### 6. ✅ Enhanced Row Label Support
- **Issue:** Only handled simple text fields
- **Fix:** Added support for select, multiselect, date field types
- **Impact:** Better UX with meaningful row labels

### 7. ✅ Collapse Animation Added
- **Issue:** No animation in original plan
- **Fix:** Added CSS transition with maxHeight
- **Impact:** Matches Voxel's smooth collapse/expand

### 8. ✅ min_rows Handling Added
- **Issue:** No initial row creation logic
- **Fix:** Added logic to create min_rows on mount
- **Impact:** New posts respect minimum row requirements

**Plan Status:** ✅ **READY FOR IMPLEMENTATION**
