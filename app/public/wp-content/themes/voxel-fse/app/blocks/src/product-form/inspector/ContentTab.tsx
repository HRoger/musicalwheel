/**
 * Product Form Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: Settings, Cards, Icons accordions
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl } from '@wordpress/components';
import { AccordionPanelGroup, AccordionPanel } from '@shared/controls';
import IconPickerControl from '@shared/controls/IconPickerControl';
import type { ProductFormAttributes, ProductFormIcons } from '../types';
import { DEFAULT_PRODUCT_FORM_ICONS } from '../types';

interface ContentTabProps {
	attributes: ProductFormAttributes;
	setAttributes: (attrs: Partial<ProductFormAttributes>) => void;
}

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	// Helper to update nested icons object
	const updateIcon = (
		key: keyof ProductFormIcons,
		value: ProductFormIcons[keyof ProductFormIcons]
	) => {
		setAttributes({
			icons: {
				...DEFAULT_PRODUCT_FORM_ICONS,
				...attributes.icons,
				[key]: value,
			},
		});
	};

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="settings"
		>
			{/* Settings Section */}
			<AccordionPanel id="settings" title={__('Settings', 'voxel-fse')}>
				<SelectControl
					label={__('Show Price Calculator', 'voxel-fse')}
					value={attributes.showPriceCalculator}
					options={[
						{ label: __('Show', 'voxel-fse'), value: 'show' },
						{ label: __('Hide', 'voxel-fse'), value: 'hide' },
					]}
					onChange={(value: string) =>
						setAttributes({ showPriceCalculator: value as 'show' | 'hide' })
					}
				/>
				<ToggleControl
					label={__('Show only subtotal?', 'voxel-fse')}
					checked={attributes.showSubtotalOnly}
					onChange={(value: boolean) => setAttributes({ showSubtotalOnly: value })}
				/>
			</AccordionPanel>

			{/* Cards Section */}
			<AccordionPanel id="cards" title={__('Cards', 'voxel-fse')}>
				<ToggleControl
					label={__('Hide Cards subheading', 'voxel-fse')}
					checked={attributes.hideCardSubheading}
					onChange={(value: boolean) => setAttributes({ hideCardSubheading: value })}
				/>
				<ToggleControl
					label={__('Select/Deselect on click', 'voxel-fse')}
					help={__(
						'Useful if you are selecting add-ons through Select add-on action',
						'voxel-fse'
					)}
					checked={!attributes.cardSelectOnClick}
					onChange={(value: boolean) => setAttributes({ cardSelectOnClick: !value })}
				/>
			</AccordionPanel>

			{/* Icons Section */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<IconPickerControl
					label={__('Add to cart icon', 'voxel-fse')}
					value={
						attributes.icons?.addToCart || DEFAULT_PRODUCT_FORM_ICONS.addToCart
					}
					onChange={(value) => updateIcon('addToCart', value)}
				/>
				<IconPickerControl
					label={__('Out of stock icons', 'voxel-fse')}
					value={
						attributes.icons?.outOfStock ||
						DEFAULT_PRODUCT_FORM_ICONS.outOfStock
					}
					onChange={(value) => updateIcon('outOfStock', value)}
				/>
				<IconPickerControl
					label={__('Checkout icon', 'voxel-fse')}
					value={
						attributes.icons?.checkout || DEFAULT_PRODUCT_FORM_ICONS.checkout
					}
					onChange={(value) => updateIcon('checkout', value)}
				/>
				<IconPickerControl
					label={__('Calendar icon', 'voxel-fse')}
					value={
						attributes.icons?.calendar || DEFAULT_PRODUCT_FORM_ICONS.calendar
					}
					onChange={(value) => updateIcon('calendar', value)}
				/>
				<IconPickerControl
					label={__('Clock icon', 'voxel-fse')}
					value={attributes.icons?.clock || DEFAULT_PRODUCT_FORM_ICONS.clock}
					onChange={(value) => updateIcon('clock', value)}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
