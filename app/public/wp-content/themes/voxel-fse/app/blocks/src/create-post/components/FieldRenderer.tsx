/**
 * Field Renderer - Phase B Field Rendering System
 * Routes each field to its appropriate React component
 * 
 * This is the main entry point for rendering all 30+ Voxel field types
 */
import React from 'react';
import type { VoxelField, FieldValue } from '../types';

// Field Components (Phase B - Progressive implementation)
import { TextField } from './fields/TextField';
import { TextareaField } from './fields/TextareaField';
import { DescriptionField } from './fields/DescriptionField';
import { TexteditorField } from './fields/TexteditorField';
import { NumberField } from './fields/NumberField';
import { EmailField } from './fields/EmailField';
import { UrlField } from './fields/UrlField';
import { PhoneField } from './fields/PhoneField';
import { SelectField } from './fields/SelectField';
import { SwitcherField } from './fields/SwitcherField';
import { MultiselectField } from './fields/MultiselectField';
import { TaxonomyField } from './fields/TaxonomyField';
import { LocationField } from './fields/LocationField';
import { DateField } from './fields/DateField';
import { TimeField } from './fields/TimeField';
import { TimezoneField } from './fields/TimezoneField';
import { RecurringDateField } from './fields/RecurringDateField';
import { WorkHoursField } from './fields/WorkHoursField';
import { FileField } from './fields/FileField';
import { UIField } from './fields/UIField';
import { RepeaterField } from './fields/RepeaterField';
import { ProductField } from './fields/ProductField';
import { PostRelationField } from './fields/PostRelationField';
import { ColorField } from './fields/ColorField';
// Phase B Complete - All field types implemented!

import type { FieldIcons } from '../types';

interface FieldRendererProps {
	field: VoxelField;
	value: FieldValue;
	onChange: (value: FieldValue) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
	postTypeKey?: string; // Post type key for relation fields
	errors?: string[]; // Validation errors
}

/**
 * Field Renderer Component
 *
 * Routes field rendering to appropriate component based on field.type
 * Matches Voxel's field type system exactly
 *
 * Note: All fields now use field.validation.errors (Level 2 validation pattern)
 */
export const FieldRenderer: React.FC<FieldRendererProps> = ({
	field,
	value,
	onChange,
	onBlur,
	icons,
	postTypeKey
}) => {
	// Route to appropriate field component based on type
	switch (field.type) {
		// ===== Basic Text Fields =====
		case 'text':
		case 'title':
		case 'profile-name':
			return <TextField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'email':
			return <EmailField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'url':
			return <UrlField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'phone':
			return <PhoneField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'texteditor':
		case 'description':
			// Description is a preset of texteditor (Voxel: Description_Field extends Texteditor_Field)
			return <TexteditorField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'number':
			return <NumberField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// ===== Phase B.8: Color Field (Phase C) =====
		case 'color':
			return <ColorField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// ===== Phase B.2: Location Field (STAGE 1 COMPLETE) =====
		case 'location':
			return <LocationField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// ===== Phase B.4: Selection Fields =====
		case 'select':
			return <SelectField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'switcher':
			return <SwitcherField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'multiselect':
			return <MultiselectField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'taxonomy':
			return <TaxonomyField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// Note: radio and checkbox are display modes within select/multiselect/taxonomy fields,
		// not separate field types in Voxel's system

		// ===== Phase B.5: Date/Time Fields (COMPLETE) =====
		case 'date':
			return <DateField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'time':
			return <TimeField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'timezone':
			return <TimezoneField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'recurring-date':
			// Phase B: Simplified (single date input)
			// Phase C: Full repeater with recurrence patterns
			return <RecurringDateField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		case 'work-hours':
			// Phase B: Simplified (text input)
			// Phase C: Full schedule management
			return <WorkHoursField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// ===== Phase B.6: File/Media Fields (COMPLETE - Simplified) =====
		case 'file':
		case 'image':
		case 'profile-avatar':
		// NOTE: Voxel only has these 3 field types. 'logo', 'cover-image', 'gallery' are field KEYS, not types.
		// However, for safety we include them here in case they're used as types in legacy configs:
		case 'logo':
		case 'cover-image':
		case 'gallery':
			// Phase B: HTML5 file input, basic file list
			// Phase C: WordPress media library integration, drag-drop, sortable
			return <FileField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} />;

		// ===== Phase B.7: Complex Fields (FULLY FUNCTIONAL - Phase 2) =====
		case 'repeater':
			// Phase 2: Fully functional repeater with drag-and-drop, nested fields, validation
			return <RepeaterField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} postTypeKey={postTypeKey} />;

		case 'product':
			// Phase B: Placeholder acknowledging complexity
			// Phase C: Full product configuration (booking, calendar, pricing, variations)
			return <ProductField field={field} value={value} onChange={onChange} />;

		case 'post-relation':
			// Phase B: Basic text input for post IDs
			// Phase C: Searchable post selector with previews
			return <PostRelationField field={field} value={value} onChange={onChange} onBlur={onBlur} icons={icons} postTypeKey={postTypeKey} />;

		// ===== UI Fields (Display Only) - COMPLETE =====
		case 'ui-heading':
		case 'ui-html':
		case 'ui-image':
		case 'ui-step':
			return <UIField field={field} />;

		// ===== Fallback for Unknown Types =====
		default:
			console.warn(`FieldRenderer: Unknown field type "${field.type}"`);
			return (
				<div className="ts-form-group field-placeholder">
					<p style={{ color: '#c33', fontSize: '14px', padding: '10px' }}>
						⚠️ Unknown field type: "{field.type}"
					</p>
					<p style={{ color: '#999', fontSize: '12px', padding: '0 10px 10px' }}>
						This field type is not yet implemented. Check FieldRenderer.tsx
					</p>
				</div>
			);
	}
};

