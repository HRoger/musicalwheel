/**
 * Enable Tags Button Component
 *
 * Reusable Voxel-branded button for enabling dynamic tags.
 * Displays the colorful gradient circle with Voxel logo.
 *
 * Usage:
 * ```tsx
 * <EnableTagsButton onClick={handleEnableTags} />
 * ```
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import './enable-tags-button.css';

export interface EnableTagsButtonProps {
	/** Click handler - typically opens the DynamicTagBuilder modal */
	onClick: () => void;
	/** Button title/tooltip (default: "Enable Voxel tags") */
	title?: string;
}

export default function EnableTagsButton({
	onClick,
	title = __('Enable Voxel tags', 'voxel-fse'),
}: EnableTagsButtonProps) {
	return (
		<button
			type="button"
			className="voxel-fse-enable-tags"
			onClick={onClick}
			title={title}
		>
			<span className="voxel-fse-enable-tags__icon" />
		</button>
	);
}
