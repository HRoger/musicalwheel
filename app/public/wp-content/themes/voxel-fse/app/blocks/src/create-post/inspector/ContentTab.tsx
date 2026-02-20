/**
 * Create Post Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains Post Type and Icons accordions.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	IconPickerControl,
} from '@shared/controls';
import type { CreatePostAttributes, VoxelPostType } from '../types';
import type { IconValue } from '@shared/types';

interface ContentTabProps {
	attributes: CreatePostAttributes;
	setAttributes: (attrs: Partial<CreatePostAttributes>) => void;
	postTypes: VoxelPostType[];
	hasPostType: boolean;
}

export function ContentTab({
	attributes,
	setAttributes,
	postTypes,
	hasPostType,
}: ContentTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, unknown>}
			setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="post-type"
		>
			<AccordionPanel id="post-type" title={__('Post type', 'voxel-fse')}>
				<SelectControl
					label={__('Post Type', 'voxel-fse')}
					value={attributes.postTypeKey}
					options={[
						{ label: __('Select a post type...', 'voxel-fse'), value: '' },
						...postTypes,
					]}
					onChange={(postTypeKey: any) => setAttributes({ postTypeKey })}
				/>
				{/* Note: cpt_filter_width slider has condition cpt_filter_cols = 'elementor-col-auto'
				    which doesn't exist in FSE, so we omit it */}
			</AccordionPanel>

			{hasPostType && (
				<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
					<IconPickerControl
						label={__('Dropdown icon', 'voxel-fse')}
						value={(attributes.popupIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ popupIcon: value })}
					/>
					<IconPickerControl
						label={__('Dialogue icon', 'voxel-fse')}
						value={(attributes.infoIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ infoIcon: value })}
					/>
					<IconPickerControl
						label={__('Media library icon', 'voxel-fse')}
						value={(attributes.tsMediaIco as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsMediaIco: value })}
					/>
					<IconPickerControl
						label={__('Right arrow icon', 'voxel-fse')}
						value={(attributes.nextIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ nextIcon: value })}
					/>
					<IconPickerControl
						label={__('Left arrow icon', 'voxel-fse')}
						value={(attributes.prevIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ prevIcon: value })}
					/>
					<IconPickerControl
						label={__('Down arrow icon', 'voxel-fse')}
						value={(attributes.downIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ downIcon: value })}
					/>
					<IconPickerControl
						label={__('Trash icon', 'voxel-fse')}
						value={(attributes.trashIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ trashIcon: value })}
					/>
					<IconPickerControl
						label={__('Draft icon', 'voxel-fse')}
						value={(attributes.draftIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ draftIcon: value })}
					/>
					<IconPickerControl
						label={__('Publish icon', 'voxel-fse')}
						value={(attributes.publishIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ publishIcon: value })}
					/>
					<IconPickerControl
						label={__('Save changes icon', 'voxel-fse')}
						value={(attributes.saveIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ saveIcon: value })}
					/>
					<IconPickerControl
						label={__('Success icon', 'voxel-fse')}
						value={(attributes.successIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ successIcon: value })}
					/>
					<IconPickerControl
						label={__('View post icon', 'voxel-fse')}
						value={(attributes.viewIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ viewIcon: value })}
					/>
					<IconPickerControl
						label={__('Calendar icon', 'voxel-fse')}
						value={(attributes.tsCalendarIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsCalendarIcon: value })}
					/>
					<IconPickerControl
						label={__('Calendar minus icon', 'voxel-fse')}
						value={(attributes.tsCalminusIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsCalminusIcon: value })}
					/>
					<IconPickerControl
						label={__('Add icon', 'voxel-fse')}
						value={(attributes.tsAddIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsAddIcon: value })}
					/>
					<IconPickerControl
						label={__('Email icon', 'voxel-fse')}
						value={(attributes.tsEmailIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsEmailIcon: value })}
					/>
					<IconPickerControl
						label={__('Phone icon', 'voxel-fse')}
						value={(attributes.tsPhoneIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsPhoneIcon: value })}
					/>
					<IconPickerControl
						label={__('Location icon', 'voxel-fse')}
						value={(attributes.tsLocationIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsLocationIcon: value })}
					/>
					<IconPickerControl
						label={__('My location icon', 'voxel-fse')}
						value={(attributes.tsMylocationIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsMylocationIcon: value })}
					/>
					<IconPickerControl
						label={__('Minus icon', 'voxel-fse')}
						value={(attributes.tsMinusIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsMinusIcon: value })}
					/>
					<IconPickerControl
						label={__('Plus icon', 'voxel-fse')}
						value={(attributes.tsPlusIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsPlusIcon: value })}
					/>
					<IconPickerControl
						label={__('List icon', 'voxel-fse')}
						value={(attributes.tsListIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsListIcon: value })}
					/>
					<IconPickerControl
						label={__('Search icon', 'voxel-fse')}
						value={(attributes.tsSearchIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsSearchIcon: value })}
					/>
					<IconPickerControl
						label={__('Clock icon', 'voxel-fse')}
						value={(attributes.tsClockIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsClockIcon: value })}
					/>
					<IconPickerControl
						label={__('Link icon', 'voxel-fse')}
						value={(attributes.tsLinkIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsLinkIcon: value })}
					/>
					<IconPickerControl
						label={__('Remove timeslot icon', 'voxel-fse')}
						value={(attributes.tsRtimeslotIcon as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsRtimeslotIcon: value })}
					/>
					<IconPickerControl
						label={__('Upload icon', 'voxel-fse')}
						value={(attributes.tsUploadIco as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsUploadIco: value })}
					/>
					<IconPickerControl
						label={__('Load more icon', 'voxel-fse')}
						value={(attributes.tsLoadMore as IconValue) || { library: '', value: '' }}
						onChange={(value) => setAttributes({ tsLoadMore: value })}
					/>
				</AccordionPanel>
			)}
		</AccordionPanelGroup>
	);
}
