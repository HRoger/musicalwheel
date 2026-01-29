/**
 * DynamicTagPanel Component
 *
 * Displays DynamicTagBuilder controls for each attribute in the InspectorControls panel.
 *
 * @package MusicalWheel
 */

import React from 'react';
import { DynamicTagBuilder } from './DynamicTagBuilder';
import './DynamicTagPanel.scss';

interface DynamicTagPanelProps {
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	dynamicAttributes: string[];
	context?: string;
}

/**
 * Convert attribute key to human-readable label
 *
 * @param key Attribute key (e.g., 'dynamicTitle', 'post_title')
 * @returns Formatted label (e.g., 'Dynamic Title', 'Post Title')
 */
function formatAttributeLabel(key: string): string {
	// Split on camelCase or underscores
	const words = key
		.replace(/([A-Z])/g, ' $1')
		.replace(/_/g, ' ')
		.trim()
		.split(' ');

	// Capitalize each word
	return words
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export const DynamicTagPanel: React.FC<DynamicTagPanelProps> = ({
	attributes,
	setAttributes,
	dynamicAttributes,
	context = 'post',
}) => {
	if (dynamicAttributes.length === 0) {
		return (
			<div className="mw-dynamic-tag-panel mw-dynamic-tag-panel--empty">
				<p>No attributes available for dynamic tags.</p>
			</div>
		);
	}

	return (
		<div className="mw-dynamic-tag-panel">
			<p className="mw-dynamic-tag-panel__description">
				Add dynamic content that updates automatically based on the current context.
			</p>

			{dynamicAttributes.map((attrKey) => {
				const value = attributes[attrKey] || '';
				const label = formatAttributeLabel(attrKey);

				return (
					<div key={attrKey} className="mw-dynamic-tag-panel__control">
						<label htmlFor={`dynamic-tag-${attrKey}`} className="components-base-control__label">
							{label}
						</label>
						<DynamicTagBuilder
							value={value}
							onChange={(newValue) => setAttributes({ [attrKey]: newValue })}
							label={`Edit ${label}`}
							context={context}
						/>
					</div>
				);
			})}

			<div className="mw-dynamic-tag-panel__help">
				<h4>Dynamic Tag Examples:</h4>
				<ul>
					<li><code>@post(title)</code> - Current post title</li>
					<li><code>@user(display_name)</code> - Current user name</li>
					<li><code>@site(title)</code> - Site name</li>
					<li><code>@post(title).truncate(50)</code> - Truncated title</li>
				</ul>
			</div>
		</div>
	);
};

export default DynamicTagPanel;
