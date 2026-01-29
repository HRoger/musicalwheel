/**
 * UI Fields Component - ENHANCED to Level 2
 * Handles: ui-heading, ui-html, ui-image, ui-step field types
 *
 * Enhancement Level: Level 2 (1:1 Voxel Matching)
 * Enhancement Date: 2025-11-30
 *
 * These are display-only fields with no user input
 * Used for form structure, instructions, and visual elements
 *
 * Features:
 * - ui-image: 1:1 match with Voxel (no debug code, no inline styles)
 */
import React from 'react';
import type { VoxelField } from '../../types';

interface UIFieldProps {
	field: VoxelField;
}

export const UIField: React.FC<UIFieldProps> = ({ field }) => {
	// Debug: Log field data to console
	React.useEffect(() => {
		console.log(`[UIField] Rendering ${field.type}:`, {
			label: field.label,
			props: field.props,
			description: field.description
		});
	}, [field]);

	switch (field.type) {
		case 'ui-heading':
			// Matches: themes/voxel/templates/widgets/create-post/ui-heading-field.php:1-13
			return (
				<div className={`ts-form-group field-key-${field.key} ui-heading-field ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
					<label>
						{field.label}
						{field.description && (
							<div className="vx-dialog">
								{/* Info icon - Phase C */}
								<div className="vx-dialog-content min-scroll">
									<p>{field.description}</p>
								</div>
							</div>
						)}
					</label>
				</div>
			);

		case 'ui-html':
			// Matches: themes/voxel/templates/widgets/create-post/ui-html-field.php:1-6
			const htmlContent = field.props?.['content'] || '';
			return (
				<div className={`ts-form-group field-key-${field.key} ui-html-field ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
					{field.label && <label>{field.label}</label>}
					<div
						className="ui-html-content"
						dangerouslySetInnerHTML={{ __html: htmlContent }}
					/>
					{/* Debug: Show if content is empty */}
					{!htmlContent && (
						<p style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>
							(No HTML content configured for this field)
						</p>
					)}
				</div>
			);

		case 'ui-image':
			// ENHANCED to Level 2: 1:1 match with Voxel ui-image-field.php
			// Matches: themes/voxel/templates/widgets/create-post/ui-image-field.php:1-5
			const imageUrl = field.props?.['url'];
			const altText = field.props?.['alt'] || '';

			// Only render if URL exists (matches Voxel v-if="field.props.url")
			if (!imageUrl) {
				return null;
			}

			return (
				<div className={`ts-form-group field-key-${field.key} ui-image-field ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
					<img src={imageUrl} alt={altText} />
				</div>
			);

		case 'ui-step':
			// UI Step fields don't render visible content
			// They're used by the form to define step boundaries
			// The step navigation is handled by the form itself
			console.log('[UIField] UI Step field - not rendering (used for form structure only)');
			return null;

		default:
			return null;
	}
};

