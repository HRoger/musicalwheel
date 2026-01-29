/**
 * Section Heading Component
 *
 * A simple divider/separator for organizing controls into sections.
 * Matches Voxel's Elementor section separators.
 *
 * @package VoxelFSE
 */

import React from 'react';

export interface SectionHeadingProps {
	label: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ label }) => (
	<div className="voxel-fse-section-heading">
		<span>{label}</span>
	</div>
);

export default SectionHeading;
