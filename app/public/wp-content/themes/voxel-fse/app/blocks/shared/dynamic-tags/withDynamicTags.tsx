/**
 * withDynamicTags Higher-Order Component
 *
 * Wraps a block edit component to add dynamic tag support.
 * Automatically detects string attributes and provides DynamicTagBuilder UI.
 *
 * @package MusicalWheel
 */

import React from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { DynamicTagPanel } from './DynamicTagPanel';

interface WithDynamicTagsOptions {
	// Attributes that should have dynamic tag support
	attributes?: string[];
	// Attributes to exclude from dynamic tag support
	excludeAttributes?: string[];
	// Panel title in inspector
	panelTitle?: string;
	// Context for tag filtering (post, user, term, etc.)
	context?: string;
}

/**
 * Higher-Order Component to add dynamic tag support to blocks
 *
 * @param BlockEdit Original block edit component
 * @param options Configuration options
 * @returns Enhanced block edit component with dynamic tag support
 */
export function withDynamicTags(
	BlockEdit: React.ComponentType<any>,
	options: WithDynamicTagsOptions = {}
) {
	const {
		attributes: includeAttributes,
		excludeAttributes = [],
		panelTitle = 'Dynamic Data',
		context = 'post',
	} = options;

	return (props: any) => {
		const { attributes, setAttributes } = props;

		// Auto-detect string attributes that can have dynamic tags
		const dynamicAttributes = includeAttributes || Object.keys(attributes).filter((key) => {
			// Skip excluded attributes
			if (excludeAttributes.includes(key)) {
				return false;
			}

			// Include only string attributes
			const value = attributes[key];
			return typeof value === 'string';
		});

		// Check if any attributes have dynamic tags
		const hasDynamicTags = dynamicAttributes.some((key) => {
			const value = attributes[key];
			return typeof value === 'string' && value.includes('@');
		});

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={panelTitle}
						initialOpen={hasDynamicTags}
						icon="tag"
					>
						<DynamicTagPanel
							attributes={attributes}
							setAttributes={setAttributes}
							dynamicAttributes={dynamicAttributes}
							context={context}
						/>
					</PanelBody>
				</InspectorControls>

				<BlockEdit {...props} />
			</>
		);
	};
}

export default withDynamicTags;
