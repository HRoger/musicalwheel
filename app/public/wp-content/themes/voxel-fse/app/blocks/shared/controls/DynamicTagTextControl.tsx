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
import { __ } from '@wordpress/i18n';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';

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
	const hasDynamicTags = () => {
		return typeof value === 'string' && value.startsWith('@tags()') && value.includes('@endtags()');
	};

	// Extract the tag content (remove @tags() wrapper)
	const getTagContent = () => {
		if (!hasDynamicTags()) return value || '';

		const match = value.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : value;
	};

	// Wrap content with @tags() markers
	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	// Enable tags - wrap current value
	const handleEnableTags = () => {
		setIsModalOpen(true);
	};

	// Edit tags - open modal with existing tag content
	const handleEditTags = () => {
		setIsModalOpen(true);
	};

	// Disable tags - clear the input field
	const handleDisableTags = () => {
		// Show browser confirmation dialog (matching Voxel pattern)
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			onChange('');
		}
	};

	// Handle modal save
	const handleModalSave = (newValue: string) => {
		if (newValue) {
			// Wrap the value with @tags() markers
			onChange(wrapWithTags(newValue));
		}
		setIsModalOpen(false);
	};

	const isTagsActive = hasDynamicTags();

	return (
		<div className="voxel-dynamic-tag-text-control elementor-control elementor-control-type-text" style={{ marginBottom: '16px' }}>
			{/* Label with Voxel icon button */}
			<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<EnableTagsButton onClick={handleEnableTags} />
					<label className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
						{label}
					</label>
				</div>
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
					<div className="edit-voxel-tags" style={{
						backgroundColor: 'rgb(47, 47, 49)',
						borderRadius: '10px',
						overflow: 'hidden',
						padding: '12px',
					}}>
						{/* Tag content row */}
						<div style={{ marginBottom: '12px' }}>
							<span style={{
								color: '#fff',
								fontSize: '13px',
								fontFamily: 'inherit',
								wordBreak: 'break-all',
							}}>
								{getTagContent()}
							</span>
						</div>

						{/* Light gray divider */}
						<div style={{
							height: '1px',
							backgroundColor: 'rgba(255, 255, 255, 0.15)',
							marginBottom: '8px',
						}} />

						{/* Action buttons row */}
						<div style={{ display: 'flex' }}>
							<button
								type="button"
								className="edit-tags"
								onClick={handleEditTags}
								style={{
									flex: 1,
									background: 'transparent',
									border: 'none',
									color: 'rgba(255, 255, 255, 0.8)',
									fontSize: '10px',
									fontWeight: 600,
									letterSpacing: '0.5px',
									cursor: 'pointer',
									padding: '6px 0',
									textAlign: 'left',
								}}
							>
								{__('EDIT TAGS', 'voxel-fse')}
							</button>
							<button
								type="button"
								className="disable-tags"
								onClick={handleDisableTags}
								style={{
									flex: 1,
									background: 'transparent',
									border: 'none',
									color: 'rgba(255, 255, 255, 0.5)',
									fontSize: '10px',
									fontWeight: 600,
									letterSpacing: '0.5px',
									cursor: 'pointer',
									padding: '6px 0',
									textAlign: 'right',
								}}
							>
								{__('DISABLE TAGS', 'voxel-fse')}
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Dynamic Tag Builder Modal */}
			{isModalOpen && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context={context}
					onClose={() => setIsModalOpen(false)}
				autoOpen={true}
			/>
			)}
		</div>
	);
}
