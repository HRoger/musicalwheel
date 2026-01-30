/**
 * FilterPopupStyleControl Component
 *
 * Popup style controls specifically for filter repeater items inside Search Form.
 * This is DIFFERENT from PopupCustomStyleControl which is for widget-level popup styling.
 *
 * Evidence: themes/voxel/app/widgets/search-form.php:334-434
 * Filter repeater popup controls include:
 * - filt_custom_popup_enable: Custom popup style toggle (Show/Hide labels)
 * - filt_pg_width: Min width (slider, 200-800px, "Does not affect mobile")
 * - filt_max_width: Max width (slider, 200-800px, "Does not affect mobile")
 * - filt_max_height: Max height (slider, 0-800px, "Does not affect mobile")
 * - filt_center_position: Switch position to center of screen (Yes/No toggle)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import { ResponsiveRangeControl } from './index';

interface FilterPopupStyleControlProps {
	attributes: Record<string, unknown>;
	setAttributes: (attributes: Record<string, unknown>) => void;
	attributeNames?: {
		enable?: string;
		minWidth?: string;
		maxWidth?: string;
		maxHeight?: string;
		centerPosition?: string;
	};
}

/**
 * FilterPopupStyleControl
 *
 * Matches Voxel's filter repeater popup controls exactly:
 * - "Custom popup style" toggle with Show/Hide labels
 * - "Min width" slider (200-800px) with "Does not affect mobile" description
 * - "Max width" slider (200-800px) with "Does not affect mobile" description
 * - "Max height" slider (0-800px) with "Does not affect mobile" description
 * - "Switch position to center of screen" toggle with Yes/No labels
 */
export default function FilterPopupStyleControl({
	attributes,
	setAttributes,
	attributeNames = {},
}: FilterPopupStyleControlProps) {
	// Default attribute names for filter popup controls
	const keys = {
		enable: attributeNames.enable || 'customPopupEnabled',
		minWidth: attributeNames.minWidth || 'popupMinWidth',
		maxWidth: attributeNames.maxWidth || 'popupMaxWidth',
		maxHeight: attributeNames.maxHeight || 'popupMaxHeight',
		centerPosition: attributeNames.centerPosition || 'popupCenterPosition',
	};

	const isEnabled = attributes[keys.enable] as boolean;

	// Get unique identifier for this filter (used for popup state persistence)
	// The attributes object is the filter config which has an 'id' property
	const filterId = (attributes.id || attributes._id || '') as string;

	return (
		<>
			{/* Custom popup style toggle - Evidence: search-form.php:343-352 */}
			<ToggleControl
				label={__('Custom popup style', 'voxel-fse')}
				checked={isEnabled}
				onChange={(value: boolean) =>
					setAttributes({ [keys.enable]: value })
				}
			/>

			{isEnabled && (
				<>
					{/* Min width - Evidence: search-form.php:354-373 */}
					<ResponsiveRangeControl
						label={__('Min width', 'voxel-fse')}
						help={__('Does not affect mobile', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName={keys.minWidth}
						controlKeyPrefix={filterId}
						min={200}
						max={800}
						step={1}
						units={['px']}
					/>

					{/* Max width - Evidence: search-form.php:377-396 */}
					<ResponsiveRangeControl
						label={__('Max width', 'voxel-fse')}
						help={__('Does not affect mobile', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName={keys.maxWidth}
						controlKeyPrefix={filterId}
						min={200}
						max={800}
						step={1}
						units={['px']}
					/>

					{/* Max height - Evidence: search-form.php:398-417 */}
					<ResponsiveRangeControl
						label={__('Max height', 'voxel-fse')}
						help={__('Does not affect mobile', 'voxel-fse')}
						attributes={attributes}
						setAttributes={setAttributes}
						attributeBaseName={keys.maxHeight}
						controlKeyPrefix={filterId}
						min={0}
						max={800}
						step={1}
						units={['px']}
					/>

					{/* Switch position to center of screen - Evidence: search-form.php:421-434 */}
					<ToggleControl
						label={__('Switch position to center of screen', 'voxel-fse')}
						checked={(attributes[keys.centerPosition] as boolean) ?? false}
						onChange={(value: boolean) =>
							setAttributes({ [keys.centerPosition]: value })
						}
					/>
				</>
			)}
		</>
	);
}
