/**
 * Flex Container Block - Icon Definitions
 *
 * Elementor eicon-based icons for flex/grid controls.
 *
 * @package VoxelFSE
 */

// Elementor eicon-based icons for Flex Direction (matching Elementor exactly)
export const FlexDirectionIcons = {
	row: <span className="eicon-arrow-right" style={{ fontSize: '16px' }} />,
	column: <span className="eicon-arrow-down" style={{ fontSize: '16px' }} />,
	'row-reverse': <span className="eicon-arrow-left" style={{ fontSize: '16px' }} />,
	'column-reverse': <span className="eicon-arrow-up" style={{ fontSize: '16px' }} />,
};

// Elementor uses BOTH "eicon-flex" and the specific icon class together

// Elementor eicon-based icons for Justify Content - changes based on flex direction
// For Row direction: uses horizontal icons (main axis is horizontal)
export const JustifyContentIconsHorizontal = {
	'flex-start': <span className="eicon-flex eicon-justify-start-h" style={{ fontSize: '16px' }} />,
	center: <span className="eicon-flex eicon-justify-center-h" style={{ fontSize: '16px' }} />,
	'flex-end': <span className="eicon-flex eicon-justify-end-h" style={{ fontSize: '16px' }} />,
	'space-between': (
		<span className="eicon-flex eicon-justify-space-between-h" style={{ fontSize: '16px' }} />
	),
	'space-around': (
		<span className="eicon-flex eicon-justify-space-around-h" style={{ fontSize: '16px' }} />
	),
	'space-evenly': (
		<span className="eicon-flex eicon-justify-space-evenly-h" style={{ fontSize: '16px' }} />
	),
};

// For Column direction: uses vertical icons (main axis is vertical)
export const JustifyContentIconsVertical = {
	'flex-start': <span className="eicon-flex eicon-justify-start-v" style={{ fontSize: '16px' }} />,
	center: <span className="eicon-flex eicon-justify-center-v" style={{ fontSize: '16px' }} />,
	'flex-end': <span className="eicon-flex eicon-justify-end-v" style={{ fontSize: '16px' }} />,
	'space-between': (
		<span className="eicon-flex eicon-justify-space-between-v" style={{ fontSize: '16px' }} />
	),
	'space-around': (
		<span className="eicon-flex eicon-justify-space-around-v" style={{ fontSize: '16px' }} />
	),
	'space-evenly': (
		<span className="eicon-flex eicon-justify-space-evenly-v" style={{ fontSize: '16px' }} />
	),
};

// Elementor eicon-based icons for Align Items - changes based on flex direction
// For Row direction: uses vertical icons (cross axis is vertical) - only 4 options, no baseline
export const AlignItemsIconsVertical = {
	'flex-start': <span className="eicon-flex eicon-align-start-v" style={{ fontSize: '16px' }} />,
	center: <span className="eicon-flex eicon-align-center-v" style={{ fontSize: '16px' }} />,
	'flex-end': <span className="eicon-flex eicon-align-end-v" style={{ fontSize: '16px' }} />,
	stretch: <span className="eicon-flex eicon-align-stretch-v" style={{ fontSize: '16px' }} />,
};

// For Column direction: uses horizontal icons (cross axis is horizontal) - only 4 options, no baseline
export const AlignItemsIconsHorizontal = {
	'flex-start': <span className="eicon-flex eicon-align-start-h" style={{ fontSize: '16px' }} />,
	center: <span className="eicon-flex eicon-align-center-h" style={{ fontSize: '16px' }} />,
	'flex-end': <span className="eicon-flex eicon-align-end-h" style={{ fontSize: '16px' }} />,
	stretch: <span className="eicon-flex eicon-align-stretch-h" style={{ fontSize: '16px' }} />,
};

// Elementor eicon-based icons for Flex Wrap (only 2 options: nowrap and wrap)
export const FlexWrapIcons = {
	nowrap: <span className="eicon-flex eicon-nowrap" style={{ fontSize: '16px' }} />,
	wrap: <span className="eicon-flex eicon-wrap" style={{ fontSize: '16px' }} />,
};

// Align Content icons - only used when wrap is enabled (uses vertical justify icons)
export const AlignContentIcons = {
	'flex-start': <span className="eicon-flex eicon-justify-start-v" style={{ fontSize: '16px' }} />,
	center: <span className="eicon-flex eicon-justify-center-v" style={{ fontSize: '16px' }} />,
	'flex-end': <span className="eicon-flex eicon-justify-end-v" style={{ fontSize: '16px' }} />,
	'space-between': (
		<span className="eicon-flex eicon-justify-space-between-v" style={{ fontSize: '16px' }} />
	),
	'space-around': (
		<span className="eicon-flex eicon-justify-space-around-v" style={{ fontSize: '16px' }} />
	),
	'space-evenly': (
		<span className="eicon-flex eicon-justify-space-evenly-v" style={{ fontSize: '16px' }} />
	),
};

// Helper to determine if direction is column-based
export const isColumnDirection = (direction: string | undefined): boolean => {
	return direction === 'column' || direction === 'column-reverse';
};
