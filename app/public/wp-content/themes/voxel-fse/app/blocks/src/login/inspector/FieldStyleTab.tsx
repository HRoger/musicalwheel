/**
 * Login/Register Block - Field Style Tab Inspector Controls
 *
 * Matches Elementor's "Field style" tab for login widget.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
    SectionHeading,
    ResponsiveRangeControl,
    ColorControl,
    TypographyControl,
    ResponsiveDimensionsControl,
    StyleTabPanel,
    BoxShadowPopup,
    BorderGroupControl,
} from '@shared/controls';
import type { LoginAttributes } from '../types';

interface FieldStyleTabProps {
    attributes: LoginAttributes;
    setAttributes: (attrs: Partial<LoginAttributes>) => void;
}


export function FieldStyleTab({
    attributes,
    setAttributes,
}: FieldStyleTabProps): JSX.Element {
    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            stateAttribute="fieldStyleTabOpenPanel"
            defaultPanel="label"
        >
            {/* ==================== LABEL ==================== */}
            <AccordionPanel id="label" title={__('Label', 'voxel-fse')}>
                <SectionHeading label={__('Label', 'voxel-fse')} />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="fieldLabelTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Color', 'voxel-fse')}
                        value={attributes.fieldLabelColor}
                        onChange={(value) => setAttributes({ fieldLabelColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Link color', 'voxel-fse')}
                        value={attributes.fieldLabelLinkColor}
                        onChange={(value) => setAttributes({ fieldLabelLinkColor: value })}
                    />
                </div>

                <ResponsiveDimensionsControl
                    label={__('Label padding', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="fieldLabelPadding"
                />

                <SectionHeading label={__('Optional label', 'voxel-fse')} />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="fieldOptionalLabelTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Default Color', 'voxel-fse')}
                        value={attributes.fieldOptionalLabelColor}
                        onChange={(value) => setAttributes({ fieldOptionalLabelColor: value })}
                    />
                </div>
            </AccordionPanel>

            {/* ==================== FORM: INPUT & TEXTAREA ==================== */}
            <AccordionPanel id="form_input_textarea" title={__('Form: Input & Textarea', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                        { name: 'active', title: __('Active', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Placeholder', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Placeholder color', 'voxel-fse')}
                                            value={attributes.fieldInputPlaceholderColor}
                                            onChange={(value) => setAttributes({ fieldInputPlaceholderColor: value })}
                                        />
                                    </div>

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="fieldInputPlaceholderTypography"
                                    />

                                    <SectionHeading label={__('Value', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldInputTextColor}
                                            onChange={(value) => setAttributes({ fieldInputTextColor: value })}
                                        />
                                    </div>

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="fieldInputTypography"
                                    />

                                    <SectionHeading label={__('General', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.fieldInputBackgroundColor}
                                            onChange={(value) => setAttributes({ fieldInputBackgroundColor: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.fieldInputBorderType || '',
                                            borderWidth: attributes.fieldInputBorderWidth || {},
                                            borderColor: attributes.fieldInputBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.fieldInputBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.fieldInputBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.fieldInputBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <SectionHeading label={__('Input', 'voxel-fse')} />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldInputPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldInputBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <SectionHeading label={__('Input with icon', 'voxel-fse')} />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldInputIconPadding"
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.fieldInputIconColor}
                                            onChange={(value) => setAttributes({ fieldInputIconColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldInputIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon side padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldInputIconSidePadding"
                                        min={0}
                                        max={50}
                                    />

                                    <SectionHeading label={__('Textarea', 'voxel-fse')} />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldTextareaPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldTextareaHeight"
                                        min={0}
                                        max={500}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldTextareaBorderRadius"
                                        min={0}
                                        max={50}
                                    />
                                </>
                            )}

                            {/* Hover Tab */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.fieldInputBackgroundColorHover}
                                            onChange={(value) => setAttributes({ fieldInputBackgroundColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.fieldInputBorderColorHover}
                                            onChange={(value) => setAttributes({ fieldInputBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Placeholder color', 'voxel-fse')}
                                            value={attributes.fieldInputPlaceholderColorHover}
                                            onChange={(value) => setAttributes({ fieldInputPlaceholderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldInputTextColorHover}
                                            onChange={(value) => setAttributes({ fieldInputTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.fieldInputIconColorHover}
                                            onChange={(value) => setAttributes({ fieldInputIconColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Active Tab */}
                            {tab.name === 'active' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.fieldInputBackgroundColorActive}
                                            onChange={(value) => setAttributes({ fieldInputBackgroundColorActive: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.fieldInputBorderColorActive}
                                            onChange={(value) => setAttributes({ fieldInputBorderColorActive: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Placeholder color', 'voxel-fse')}
                                            value={attributes.fieldInputPlaceholderColorActive}
                                            onChange={(value) => setAttributes({ fieldInputPlaceholderColorActive: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldInputTextColorActive}
                                            onChange={(value) => setAttributes({ fieldInputTextColorActive: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== FORM: POPUP BUTTON ==================== */}
            <AccordionPanel id="form_popup_button" title={__('Form: Popup button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                        { name: 'filled', title: __('Filled', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <SectionHeading label={__('Style', 'voxel-fse')} />

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="fieldPopupBtnTypography"
                                    />

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="fieldPopupBtnBoxShadow"
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnBackgroundColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnBackgroundColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnTextColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnTextColor: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.fieldPopupBtnBorderType || '',
                                            borderWidth: attributes.fieldPopupBtnBorderWidth || {},
                                            borderColor: attributes.fieldPopupBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.fieldPopupBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.fieldPopupBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.fieldPopupBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <SectionHeading label={__('Icons', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnIconColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnIconColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnIconSpacing"
                                        min={0}
                                        max={50}
                                    />

                                    <SectionHeading label={__('Chevron', 'voxel-fse')} />

                                    <ToggleControl
                                        label={__('Hide chevron', 'voxel-fse')}
                                        checked={!!attributes.fieldPopupBtnHideChevron}
                                        onChange={(value: boolean) => setAttributes({ fieldPopupBtnHideChevron: value })}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Chevron color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnChevronColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnChevronColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover Tab */}
                            {tab.name === 'hover' && (
                                <>
                                    <SectionHeading label={__('Style', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnBackgroundColorHover}
                                            onChange={(value) => setAttributes({ fieldPopupBtnBackgroundColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnTextColorHover}
                                            onChange={(value) => setAttributes({ fieldPopupBtnTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ fieldPopupBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnIconColorHover}
                                            onChange={(value) => setAttributes({ fieldPopupBtnIconColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="fieldPopupBtnBoxShadowHover"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Filled Tab */}
                            {tab.name === 'filled' && (
                                <>
                                    <SectionHeading label={__('Style (Filled)', 'voxel-fse')} />

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="fieldPopupBtnFilledTypography"
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnFilledBackground}
                                            onChange={(value) => setAttributes({ fieldPopupBtnFilledBackground: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnFilledTextColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnFilledTextColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnFilledIconColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnFilledIconColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.fieldPopupBtnFilledBorderColor}
                                            onChange={(value) => setAttributes({ fieldPopupBtnFilledBorderColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Border width', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="fieldPopupBtnFilledBorderWidth"
                                        min={0}
                                        max={20}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <BoxShadowPopup
                                            label={__('Box Shadow', 'voxel-fse')}
                                            attributes={attributes}
                                            setAttributes={setAttributes}
                                            shadowAttributeName="fieldPopupBtnFilledBoxShadow"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== FORM: SWITCHER ==================== */}
            <AccordionPanel id="form_switcher" title={__('Form: Switcher', 'voxel-fse')}>
                <SectionHeading label={__('Switch slider', 'voxel-fse')} />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background (Inactive)', 'voxel-fse')}
                        value={attributes.fieldSwitcherBackgroundColor}
                        onChange={(value) => setAttributes({ fieldSwitcherBackgroundColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background (Active)', 'voxel-fse')}
                        value={attributes.fieldSwitcherBackgroundColorActive}
                        onChange={(value) => setAttributes({ fieldSwitcherBackgroundColorActive: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Handle background', 'voxel-fse')}
                        value={attributes.fieldSwitcherHandleColor}
                        onChange={(value) => setAttributes({ fieldSwitcherHandleColor: value })}
                    />
                </div>
            </AccordionPanel>

            {/* ==================== CHECKBOX ==================== */}
            <AccordionPanel id="checkbox" title={__('Checkbox', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Checkbox size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="fieldCheckboxSize"
                    min={0}
                    max={50}
                />

                <ResponsiveRangeControl
                    label={__('Checkbox radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="fieldCheckboxBorderRadius"
                    min={0}
                    max={50}
                />

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.fieldCheckboxBorderType || '',
                        borderWidth: attributes.fieldCheckboxBorderWidth || {},
                        borderColor: attributes.fieldCheckboxBorderColor || '',
                    }}
                    onChange={(value) => {
                        const updates: Partial<LoginAttributes> = {};
                        if (value.borderType !== undefined) {
                            updates.fieldCheckboxBorderType = value.borderType;
                        }
                        if (value.borderWidth !== undefined) {
                            updates.fieldCheckboxBorderWidth = value.borderWidth as any;
                        }
                        if (value.borderColor !== undefined) {
                            updates.fieldCheckboxBorderColor = value.borderColor;
                        }
                        setAttributes(updates);
                    }}
                    hideRadius={true}
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background color (unchecked)', 'voxel-fse')}
                        value={attributes.fieldCheckboxBackgroundColor}
                        onChange={(value) => setAttributes({ fieldCheckboxBackgroundColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background color (checked)', 'voxel-fse')}
                        value={attributes.fieldCheckboxBackgroundColorChecked}
                        onChange={(value) => setAttributes({ fieldCheckboxBackgroundColorChecked: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Border-color (checked)', 'voxel-fse')}
                        value={attributes.fieldCheckboxBorderColorChecked}
                        onChange={(value) => setAttributes({ fieldCheckboxBorderColorChecked: value })}
                    />
                </div>
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
