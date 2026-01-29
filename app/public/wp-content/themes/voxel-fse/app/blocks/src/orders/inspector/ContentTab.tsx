/**
 * Orders Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains "Orders head" and "Icons" accordions with Voxel Dynamic Tag support.
 *
 * Evidence:
 * - Voxel Widget: themes/voxel/app/widgets/orders.php:73-224
 * - Icons section ID: ts_order_filter_icons
 * - 13 ICONS controls with skin='inline', label_block=false
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	DynamicTagTextControl,
	IconPickerControl,
} from '@shared/controls';
import type { OrdersBlockAttributes } from '../types';

interface ContentTabProps {
	attributes: OrdersBlockAttributes;
	setAttributes: (attrs: Partial<OrdersBlockAttributes>) => void;
}

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	return (
		<AccordionPanelGroup
			defaultPanel="orders-head"
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
		>
			{/* Orders Head Accordion */}
			<AccordionPanel id="orders-head" title={__('Orders head', 'voxel-fse')}>
				<ToggleControl
					label={__('Hide', 'voxel-fse')}
					checked={attributes.headHide}
					onChange={(value: boolean) => setAttributes({ headHide: value })}
				/>

				{!attributes.headHide && (
					<>
						<DynamicTagTextControl
							label={__('Title', 'voxel-fse')}
							value={attributes.ordersTitle}
							onChange={(value) => setAttributes({ ordersTitle: value })}
							placeholder={__('Orders', 'voxel-fse')}
						/>

						<DynamicTagTextControl
							label={__('Subtitle', 'voxel-fse')}
							value={attributes.ordersSubtitle}
							onChange={(value) => setAttributes({ ordersSubtitle: value })}
							placeholder={__('View all orders related to your account', 'voxel-fse')}
						/>
					</>
				)}
			</AccordionPanel>

			{/* Icons Accordion - matches Voxel orders.php:73-224 */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<IconPickerControl
					label={__('Search icon', 'voxel-fse')}
					value={attributes.searchIcon}
					onChange={(value) => setAttributes({ searchIcon: value })}
				/>

				<IconPickerControl
					label={__('No results icon', 'voxel-fse')}
					value={attributes.noResultsIcon}
					onChange={(value) => setAttributes({ noResultsIcon: value })}
				/>

				<IconPickerControl
					label={__('Reset icon', 'voxel-fse')}
					value={attributes.resetSearchIcon}
					onChange={(value) => setAttributes({ resetSearchIcon: value })}
				/>

				<IconPickerControl
					label={__('Chevron left', 'voxel-fse')}
					value={attributes.backIcon}
					onChange={(value) => setAttributes({ backIcon: value })}
				/>

				<IconPickerControl
					label={__('Chevron right', 'voxel-fse')}
					value={attributes.forwardIcon}
					onChange={(value) => setAttributes({ forwardIcon: value })}
				/>

				<IconPickerControl
					label={__('Chevron down', 'voxel-fse')}
					value={attributes.downIcon}
					onChange={(value) => setAttributes({ downIcon: value })}
				/>

				<IconPickerControl
					label={__('Inbox', 'voxel-fse')}
					value={attributes.inboxIcon}
					onChange={(value) => setAttributes({ inboxIcon: value })}
				/>

				<IconPickerControl
					label={__('Checkmark', 'voxel-fse')}
					value={attributes.checkmarkIcon}
					onChange={(value) => setAttributes({ checkmarkIcon: value })}
				/>

				<IconPickerControl
					label={__('Menu', 'voxel-fse')}
					value={attributes.menuIcon}
					onChange={(value) => setAttributes({ menuIcon: value })}
				/>

				<IconPickerControl
					label={__('Info', 'voxel-fse')}
					value={attributes.infoIcon}
					onChange={(value) => setAttributes({ infoIcon: value })}
				/>

				<IconPickerControl
					label={__('Files', 'voxel-fse')}
					value={attributes.filesIcon}
					onChange={(value) => setAttributes({ filesIcon: value })}
				/>

				<IconPickerControl
					label={__('Trash can', 'voxel-fse')}
					value={attributes.trashIcon}
					onChange={(value) => setAttributes({ trashIcon: value })}
				/>

				<IconPickerControl
					label={__('Calendar', 'voxel-fse')}
					value={attributes.calendarIcon}
					onChange={(value) => setAttributes({ calendarIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
