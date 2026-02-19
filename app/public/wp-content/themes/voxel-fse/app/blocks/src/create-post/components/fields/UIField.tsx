/**
 * UI Fields Component
 * Handles: ui-heading, ui-html, ui-image, ui-step field types
 *
 * These are display-only fields with no user input.
 * Used for form structure, instructions, and visual elements.
 *
 * 1:1 Voxel Matching:
 * - ui-heading: themes/voxel/templates/widgets/create-post/ui-heading-field.php
 * - ui-html:    themes/voxel/templates/widgets/create-post/ui-html-field.php
 * - ui-image:   themes/voxel/templates/widgets/create-post/ui-image-field.php
 * - ui-step:    Not rendered (step boundary marker only, create-post.php:105-107)
 */
import React from 'react';
import type { VoxelField } from '../../types';

interface UIFieldProps {
	field: VoxelField;
}

export const UIField: React.FC<UIFieldProps> = ({ field }) => {
	switch (field.type) {
		case 'ui-heading':
			// Matches: themes/voxel/templates/widgets/create-post/ui-heading-field.php:1-13
			return (
				<div className={`ts-form-group field-key-${field.key} ui-heading-field ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
					<label>
						{field.label}
						{field.description && (
							<div className="vx-dialog">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
								</svg>
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
			// Voxel JS: voxel-create-post.beautified.js:1604-1612 (jQuery.parseHTML + append)
			const htmlContent = field.props?.['content'] || '';
			return (
				<div className={`ts-form-group field-key-${field.key} ui-html-field ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
					<label>{field.label}</label>
					<div
						className="ui-html-content"
						dangerouslySetInnerHTML={{ __html: htmlContent }}
					/>
				</div>
			);

		case 'ui-image':
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
			// Not rendered — used as step boundary marker only
			// Evidence: themes/voxel/templates/widgets/create-post.php:105-107
			return null;

		default:
			return null;
	}
};

