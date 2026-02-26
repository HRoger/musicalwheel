/**
 * Dynamic Tag Text Control Component
 *
 * Matches Elementor/Voxel's inline dynamic tag pattern:
 * - Shows "Enable Voxel tags" button when no tags present
 * - Shows text input with "EDIT TAGS" and "DISABLE TAGS" buttons when tags active
 * - Wraps dynamic values with @tags()...@endtags()
 *
 * Evidence:
 * - Voxel pattern: themes/voxel/assets/src/js/backend/elementor.js (enable-tags class)
 * - Dynamic tag builder: app/blocks/src/shared/dynamic-tags/DynamicTagBuilder
 */

import { TextControl } from '@wordpress/components';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';
import DynamicTagPopoverPanel, { extractTagContent, wrapWithTags } from './DynamicTagPopoverPanel';

interface DynamicTagTextControlProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	help?: string;
	context?: string;
}

export default function DynamicTagTextControl({
	label,
	value,
	onChange,
	placeholder,
	help,
	context = 'post',
}: DynamicTagTextControlProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Check if value contains dynamic tags (wrapped with @tags())
	const isTagsActive = typeof value === 'string' && value.startsWith('@tags()') && value.includes('@endtags()');

	// Handle modal save
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			onChange(wrapWithTags(newValue));
		}
		setIsModalOpen(false);
	};

	return (
		<div className="voxel-dynamic-tag-text-control elementor-control elementor-control-type-text" style={{ marginBottom: '16px' }}>
			{/* Label with Voxel icon button on right — hidden when tags are active */}
			<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<label className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
					{label}
				</label>
				{!isTagsActive && <EnableTagsButton onClick={() => setIsModalOpen(true)} />}
			</div>

			{/* Text input or tag preview panel */}
			<div className="elementor-control-input-wrapper">
				{!isTagsActive ? (
					<TextControl
						value={value || ''}
						onChange={onChange}
						placeholder={placeholder}
						help={help}
						hideLabelFromVision
					/>
				) : (
					<div className="voxel-nb-tag-preview">
						<DynamicTagPopoverPanel
							tagContent={value}
							onEdit={() => setIsModalOpen(true)}
							onDisable={() => onChange('')}
						/>
					</div>
				)}
			</div>

			{/* Dynamic Tag Builder Modal — portaled to body to escape sidebar stacking context */}
			{isModalOpen &&
				createPortal(
					<DynamicTagBuilder
						value={extractTagContent(value) || ''}
						onChange={handleModalSave}
						label={label}
						context={context}
						onClose={() => setIsModalOpen(false)}
						autoOpen={true}
					/>,
					document.body,
				)}
		</div>
	);
}
