/**
 * EnableTagsToolbarButton Component
 *
 * Two-state toolbar button for NB text/button blocks:
 * - Gradient state (no tag set): Voxel logo with gradient circle
 * - Dark state (tag set): Voxel logo with dark background
 *
 * Gradient → click → DynamicTagBuilder modal → save → Dark
 * Dark → click → Popover (tag content + EDIT TAGS / DISABLE TAGS)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Popover } from '@wordpress/components';
import DynamicTagPopoverPanel, {
	extractTagContent,
	wrapWithTags,
} from './DynamicTagPopoverPanel';
import DynamicTagBuilder from '../dynamic-tags/DynamicTagBuilder';
import './enable-tags-toolbar.css';

interface EnableTagsToolbarButtonProps {
	/** Current voxelDynamicContent value (with @tags() wrapper, or empty) */
	value: string;
	/** Called with updated value (wrapped with @tags()...@endtags()) or empty string */
	onChange: (value: string) => void;
	/** Block's existing text content — pre-fills the modal when no tag is set yet */
	initialContent?: string;
}

export default function EnableTagsToolbarButton({
	value,
	onChange,
	initialContent = '',
}: EnableTagsToolbarButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const hasTag = Boolean(value);
	const isActive = hasTag;

	const handleClick = useCallback(() => {
		if (hasTag) {
			setIsPopoverOpen((prev) => !prev);
		} else {
			setIsModalOpen(true);
		}
	}, [hasTag]);

	const handleModalSave = useCallback(
		(tagContent: string) => {
			if (tagContent) {
				onChange(wrapWithTags(tagContent));
			}
			setIsModalOpen(false);
		},
		[onChange],
	);

	const handleModalClose = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const handleEdit = useCallback(() => {
		setIsPopoverOpen(false);
		setIsModalOpen(true);
	}, []);

	const handleDisable = useCallback(() => {
		onChange('');
		setIsPopoverOpen(false);
	}, [onChange]);

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				className={`voxel-toolbar-tag ${isActive ? 'voxel-toolbar-tag--active' : ''}`}
				onClick={handleClick}
				title={
					isActive
						? __('Edit dynamic content', 'voxel-fse')
						: __('Enable dynamic content', 'voxel-fse')
				}
			>
				<span className="voxel-toolbar-tag__icon" />
			</button>

			{isPopoverOpen && buttonRef.current && (
				<Popover
					anchor={buttonRef.current}
					onClose={() => setIsPopoverOpen(false)}
					placement="bottom"
					offset={8}
					className="voxel-toolbar-tag-popover"
				>
					<DynamicTagPopoverPanel
						tagContent={value}
						onEdit={handleEdit}
						onDisable={handleDisable}
					/>
				</Popover>
			)}

			{isModalOpen &&
				createPortal(
					<DynamicTagBuilderModal
						value={extractTagContent(value) || initialContent}
						onSave={handleModalSave}
						onClose={handleModalClose}
					/>,
					document.body,
				)}
		</>
	);
}

/**
 * Wrapper for DynamicTagBuilder modal.
 * editor.js already bundles DynamicTagBuilder for NB integration.
 */
function DynamicTagBuilderModal({
	value,
	onSave,
	onClose,
}: {
	value: string;
	onSave: (content: string) => void;
	onClose: () => void;
}) {
	return (
		<DynamicTagBuilder
			value={value}
			onChange={onSave}
			onClose={onClose}
			label={__('Dynamic Content', 'voxel-fse')}
			autoOpen={true}
		/>
	);
}
