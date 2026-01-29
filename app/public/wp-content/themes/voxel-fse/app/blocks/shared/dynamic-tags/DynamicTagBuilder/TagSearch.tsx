/**
 * TagSearch Component
 *
 * Search input for filtering available tags.
 * Matches Voxel's exact HTML structure from edit-content.php template.
 *
 * @package MusicalWheel
 */

import React from 'react';

interface TagSearchProps {
	value: string;
	onChange: (value: string) => void;
}

export const TagSearch: React.FC<TagSearchProps> = ({ value, onChange }) => {
	return (
		<div className="ts-form-group">
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search tags"
				autoComplete="off"
			/>
		</div>
	);
};
