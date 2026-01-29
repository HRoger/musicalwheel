/**
 * Cart Summary Block - Content Tab
 *
 * Controls for the Content tab in the Inspector panel.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { AccordionPanelGroup, AccordionPanel, IconPickerControl } from '@shared/controls';
import type { CartSummaryBlockAttributes } from '../types';

interface ContentTabProps {
    attributes: CartSummaryBlockAttributes;
    setAttributes: (attrs: Partial<CartSummaryBlockAttributes>) => void;
}


export default function ContentTab({ attributes, setAttributes }: ContentTabProps) {
    return (
        <AccordionPanelGroup
            defaultPanel="icons"
            attributes={attributes as Record<string, any>}
            setAttributes={setAttributes as (attrs: Record<string, any>) => void}
            stateAttribute="contentTabOpenPanel"
        >
            <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
                <IconPickerControl
                    label={__('Delete icon', 'voxel-fse')}
                    value={attributes.deleteIcon}
                    onChange={(value) => setAttributes({ deleteIcon: value })}
                />
                <IconPickerControl
                    label={__('No products icon', 'voxel-fse')}
                    value={attributes.noProductsIcon}
                    onChange={(value) => setAttributes({ noProductsIcon: value })}
                />
                <IconPickerControl
                    label={__('Login icon', 'voxel-fse')}
                    value={attributes.loginIcon}
                    onChange={(value) => setAttributes({ loginIcon: value })}
                />
                <IconPickerControl
                    label={__('Email icon', 'voxel-fse')}
                    value={attributes.emailIcon}
                    onChange={(value) => setAttributes({ emailIcon: value })}
                />
                <IconPickerControl
                    label={__('User icon', 'voxel-fse')}
                    value={attributes.userIcon}
                    onChange={(value) => setAttributes({ userIcon: value })}
                />
                <IconPickerControl
                    label={__('Upload icon', 'voxel-fse')}
                    value={attributes.uploadIcon}
                    onChange={(value) => setAttributes({ uploadIcon: value })}
                />
                <IconPickerControl
                    label={__('Shipping icon', 'voxel-fse')}
                    value={attributes.shippingIcon}
                    onChange={(value) => setAttributes({ shippingIcon: value })}
                />
                <IconPickerControl
                    label={__('Minus icon', 'voxel-fse')}
                    value={attributes.minusIcon}
                    onChange={(value) => setAttributes({ minusIcon: value })}
                />
                <IconPickerControl
                    label={__('Plus icon', 'voxel-fse')}
                    value={attributes.plusIcon}
                    onChange={(value) => setAttributes({ plusIcon: value })}
                />
                <IconPickerControl
                    label={__('Checkout icon', 'voxel-fse')}
                    value={attributes.checkoutIcon}
                    onChange={(value) => setAttributes({ checkoutIcon: value })}
                />
                <IconPickerControl
                    label={__('Continue shopping icon', 'voxel-fse')}
                    value={attributes.continueIcon}
                    onChange={(value) => setAttributes({ continueIcon: value })}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
