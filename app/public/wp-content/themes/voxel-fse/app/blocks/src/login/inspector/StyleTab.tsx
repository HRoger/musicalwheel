/**
 * Login/Register Block - Style Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
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

interface StyleTabProps {
    attributes: LoginAttributes;
    setAttributes: (attrs: Partial<LoginAttributes>) => void;
}

export function StyleTab({
    attributes,
    setAttributes,
}: StyleTabProps): JSX.Element {
    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            stateAttribute="styleTabOpenPanel"
            defaultPanel="general"
        >
            {/* ==================== GENERAL ==================== */}
            <AccordionPanel id="general" title={__('General', 'voxel-fse')}>
                <TypographyControl
                    label={__('Title typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="titleTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Title color', 'voxel-fse')}
                        value={attributes.titleColor}
                        onChange={(value) => setAttributes({ titleColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Content spacing', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="contentSpacing"
                    min={0}
                    max={100}
                />
            </AccordionPanel>

            {/* ==================== ROLE SELECTION ==================== */}
            <AccordionPanel id="role_selection" title={__('Role selection', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Minimum role width', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="roleMinWidth"
                    min={0}
                    max={500}
                />

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.roleBorderType || '',
                        borderWidth: attributes.roleBorderWidth || {},
                        borderColor: attributes.roleBorderColor || '',
                    }}
                    onChange={(value) => {
                        const updates: Partial<LoginAttributes> = {};
                        if (value.borderType !== undefined) {
                            updates.roleBorderType = value.borderType;
                        }
                        if (value.borderWidth !== undefined) {
                            updates.roleBorderWidth = value.borderWidth as any;
                        }
                        if (value.borderColor !== undefined) {
                            updates.roleBorderColor = value.borderColor;
                        }
                        setAttributes(updates);
                    }}
                    hideRadius={true}
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="roleBorderRadius"
                    min={0}
                    max={50}
                />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="roleTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Separator color', 'voxel-fse')}
                        value={attributes.roleSeparatorColor}
                        onChange={(value) => setAttributes({ roleSeparatorColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Text color', 'voxel-fse')}
                        value={attributes.roleTextColor}
                        onChange={(value) => setAttributes({ roleTextColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background color', 'voxel-fse')}
                        value={attributes.roleBackgroundColor}
                        onChange={(value) => setAttributes({ roleBackgroundColor: value })}
                    />
                </div>

                <SectionHeading label={__('Active State', 'voxel-fse')} />

                <TypographyControl
                    label={__('Typography (Active)', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="roleActiveTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Text color (Active)', 'voxel-fse')}
                        value={attributes.roleActiveTextColor}
                        onChange={(value) => setAttributes({ roleActiveTextColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background color (Active)', 'voxel-fse')}
                        value={attributes.roleActiveBackgroundColor}
                        onChange={(value) => setAttributes({ roleActiveBackgroundColor: value })}
                    />
                </div>
            </AccordionPanel>

            {/* ==================== PRIMARY BUTTON ==================== */}
            <AccordionPanel id="primary_button" title={__('Primary button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="primaryBtnTypography"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.primaryBtnTextColor}
                                            onChange={(value) => setAttributes({ primaryBtnTextColor: value })}
                                        />
                                    </div>

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.primaryBtnBackgroundColor}
                                            onChange={(value) => setAttributes({ primaryBtnBackgroundColor: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.primaryBtnBorderType || '',
                                            borderWidth: attributes.primaryBtnBorderWidth || {},
                                            borderColor: attributes.primaryBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.primaryBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.primaryBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.primaryBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="primaryBtnIconSpacing"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.primaryBtnIconColor}
                                            onChange={(value) => setAttributes({ primaryBtnIconColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover Tab */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.primaryBtnTextColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.primaryBtnBackgroundColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnBackgroundColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.primaryBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.primaryBtnIconColorHover}
                                            onChange={(value) => setAttributes({ primaryBtnIconColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== SECONDARY BUTTON ==================== */}
            <AccordionPanel id="secondary_button" title={__('Secondary button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="secondaryBtnTypography"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.secondaryBtnTextColor}
                                            onChange={(value) => setAttributes({ secondaryBtnTextColor: value })}
                                        />
                                    </div>

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBackgroundColor}
                                            onChange={(value) => setAttributes({ secondaryBtnBackgroundColor: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.secondaryBtnBorderType || '',
                                            borderWidth: attributes.secondaryBtnBorderWidth || {},
                                            borderColor: attributes.secondaryBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.secondaryBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.secondaryBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.secondaryBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="secondaryBtnIconSpacing"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.secondaryBtnIconColor}
                                            onChange={(value) => setAttributes({ secondaryBtnIconColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover Tab */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.secondaryBtnTextColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBackgroundColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnBackgroundColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.secondaryBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.secondaryBtnIconColorHover}
                                            onChange={(value) => setAttributes({ secondaryBtnIconColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== GOOGLE BUTTON ==================== */}
            <AccordionPanel id="google_button" title={__('Google button', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <TypographyControl
                                        label={__('Button typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="googleBtnTypography"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="googleBtnBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.googleBtnTextColor}
                                            onChange={(value) => setAttributes({ googleBtnTextColor: value })}
                                        />
                                    </div>

                                    <ResponsiveDimensionsControl
                                        label={__('Padding', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="googleBtnPadding"
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Height', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="googleBtnHeight"
                                        min={0}
                                        max={100}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.googleBtnBackgroundColor}
                                            onChange={(value) => setAttributes({ googleBtnBackgroundColor: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.googleBtnBorderType || '',
                                            borderWidth: attributes.googleBtnBorderWidth || {},
                                            borderColor: attributes.googleBtnBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.googleBtnBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.googleBtnBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.googleBtnBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="googleBtnIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon/Text spacing', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="googleBtnIconSpacing"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.googleBtnIconColor}
                                            onChange={(value) => setAttributes({ googleBtnIconColor: value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Hover Tab */}
                            {tab.name === 'hover' && (
                                <>
                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.googleBtnTextColorHover}
                                            onChange={(value) => setAttributes({ googleBtnTextColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background color', 'voxel-fse')}
                                            value={attributes.googleBtnBackgroundColorHover}
                                            onChange={(value) => setAttributes({ googleBtnBackgroundColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.googleBtnBorderColorHover}
                                            onChange={(value) => setAttributes({ googleBtnBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.googleBtnIconColorHover}
                                            onChange={(value) => setAttributes({ googleBtnIconColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== SECTION DIVIDER ==================== */}
            <AccordionPanel id="section_divider" title={__('Section divider', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="dividerTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Text color', 'voxel-fse')}
                        value={attributes.dividerTextColor}
                        onChange={(value) => setAttributes({ dividerTextColor: value })}
                    />
                </div>

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Divider color', 'voxel-fse')}
                        value={attributes.dividerColor}
                        onChange={(value) => setAttributes({ dividerColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Divider height', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="dividerHeight"
                    min={0}
                    max={20}
                />
            </AccordionPanel>

            {/* ==================== WELCOME ==================== */}
            <AccordionPanel id="welcome" title={__('Welcome', 'voxel-fse')}>
                <SelectControl
                    label={__('Align content', 'voxel-fse')}
                    value={attributes.welcomeAlignContent || 'center'}
                    options={[
                        { label: __('Left', 'voxel-fse'), value: 'left' },
                        { label: __('Center', 'voxel-fse'), value: 'center' },
                        { label: __('Right', 'voxel-fse'), value: 'right' },
                    ]}
                    onChange={(value: string) => setAttributes({ welcomeAlignContent: value })}
                />

                <SelectControl
                    label={__('Text align', 'voxel-fse')}
                    value={attributes.welcomeTextAlign || 'center'}
                    options={[
                        { label: __('Left', 'voxel-fse'), value: 'left' },
                        { label: __('Center', 'voxel-fse'), value: 'center' },
                        { label: __('Right', 'voxel-fse'), value: 'right' },
                    ]}
                    onChange={(value: string) => setAttributes({ welcomeTextAlign: value })}
                />

                <SectionHeading label={__('Welcome icon', 'voxel-fse')} />

                <ResponsiveRangeControl
                    label={__('Icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="welcomeIconSize"
                    min={20}
                    max={200}
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Icon color', 'voxel-fse')}
                        value={attributes.welcomeIconColor}
                        onChange={(value) => setAttributes({ welcomeIconColor: value })}
                    />
                </div>

                <SectionHeading label={__('Welcome heading', 'voxel-fse')} />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="welcomeHeadingTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Color', 'voxel-fse')}
                        value={attributes.welcomeHeadingColor}
                        onChange={(value) => setAttributes({ welcomeHeadingColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Top margin', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="welcomeHeadingTopMargin"
                    min={0}
                    max={100}
                />
            </AccordionPanel>

            {/* ==================== FORM: FILE/GALLERY ==================== */}
            <AccordionPanel id="form_file_gallery" title={__('Form: File/Gallery', 'voxel-fse')}>
                <StyleTabPanel
                    tabs={[
                        { name: 'normal', title: __('Normal', 'voxel-fse') },
                        { name: 'hover', title: __('Hover', 'voxel-fse') },
                    ]}
                >
                    {(tab) => (
                        <>
                            {/* Normal Tab */}
                            {tab.name === 'normal' && (
                                <>
                                    <ResponsiveRangeControl
                                        label={__('Item gap', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileItemGap"
                                        min={0}
                                        max={50}
                                    />

                                    <SectionHeading label={__('Select files', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.formFileSelectIconColor}
                                            onChange={(value) => setAttributes({ formFileSelectIconColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileSelectIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.formFileSelectBackground}
                                            onChange={(value) => setAttributes({ formFileSelectBackground: value })}
                                        />
                                    </div>

                                    <BorderGroupControl
                                        label={__('Border', 'voxel-fse')}
                                        value={{
                                            borderType: attributes.formFileSelectBorderType || '',
                                            borderWidth: attributes.formFileSelectBorderWidth || {},
                                            borderColor: attributes.formFileSelectBorderColor || '',
                                        }}
                                        onChange={(value) => {
                                            const updates: Partial<LoginAttributes> = {};
                                            if (value.borderType !== undefined) {
                                                updates.formFileSelectBorderType = value.borderType;
                                            }
                                            if (value.borderWidth !== undefined) {
                                                updates.formFileSelectBorderWidth = value.borderWidth as any;
                                            }
                                            if (value.borderColor !== undefined) {
                                                updates.formFileSelectBorderColor = value.borderColor;
                                            }
                                            setAttributes(updates);
                                        }}
                                        hideRadius={true}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileSelectBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="formFileSelectTypography"
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.formFileSelectTextColor}
                                            onChange={(value) => setAttributes({ formFileSelectTextColor: value })}
                                        />
                                    </div>

                                    <SectionHeading label={__('Added file/image', 'voxel-fse')} />

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileAddedBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.formFileAddedBackground}
                                            onChange={(value) => setAttributes({ formFileAddedBackground: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Icon color', 'voxel-fse')}
                                            value={attributes.formFileAddedIconColor}
                                            onChange={(value) => setAttributes({ formFileAddedIconColor: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileAddedIconSize"
                                        min={0}
                                        max={50}
                                    />

                                    <TypographyControl
                                        label={__('Typography', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        typographyAttributeName="formFileAddedTypography"
                                    />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.formFileAddedTextColor}
                                            onChange={(value) => setAttributes({ formFileAddedTextColor: value })}
                                        />
                                    </div>

                                    <SectionHeading label={__('Remove/Check button', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background', 'voxel-fse')}
                                            value={attributes.formFileRemoveBackground}
                                            onChange={(value) => setAttributes({ formFileRemoveBackground: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Background (Hover)', 'voxel-fse')}
                                            value={attributes.formFileRemoveBackgroundHover}
                                            onChange={(value) => setAttributes({ formFileRemoveBackgroundHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Color', 'voxel-fse')}
                                            value={attributes.formFileRemoveColor}
                                            onChange={(value) => setAttributes({ formFileRemoveColor: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Color (Hover)', 'voxel-fse')}
                                            value={attributes.formFileRemoveColorHover}
                                            onChange={(value) => setAttributes({ formFileRemoveColorHover: value })}
                                        />
                                    </div>

                                    <ResponsiveRangeControl
                                        label={__('Border radius', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileRemoveBorderRadius"
                                        min={0}
                                        max={50}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileRemoveSize"
                                        min={0}
                                        max={100}
                                    />

                                    <ResponsiveRangeControl
                                        label={__('Icon size', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="formFileRemoveIconSize"
                                        min={0}
                                        max={50}
                                    />
                                </>
                            )}

                            {/* Hover Tab - Select files section */}
                            {tab.name === 'hover' && (
                                <>
                                    <SectionHeading label={__('Select files', 'voxel-fse')} />

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Button icon color', 'voxel-fse')}
                                            value={attributes.formFileSelectIconColorHover}
                                            onChange={(value) => setAttributes({ formFileSelectIconColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Button background', 'voxel-fse')}
                                            value={attributes.formFileSelectBackgroundHover}
                                            onChange={(value) => setAttributes({ formFileSelectBackgroundHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Border color', 'voxel-fse')}
                                            value={attributes.formFileSelectBorderColorHover}
                                            onChange={(value) => setAttributes({ formFileSelectBorderColorHover: value })}
                                        />
                                    </div>

                                    <div className="voxel-fse-control-row">
                                        <ColorControl
                                            label={__('Text color', 'voxel-fse')}
                                            value={attributes.formFileSelectTextColorHover}
                                            onChange={(value) => setAttributes({ formFileSelectTextColorHover: value })}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </StyleTabPanel>
            </AccordionPanel>

            {/* ==================== FORM: DIALOG ==================== */}
            <AccordionPanel id="form_dialog" title={__('Form: Dialog', 'voxel-fse')}>
                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Icon color', 'voxel-fse')}
                        value={attributes.formDialogIconColor}
                        onChange={(value) => setAttributes({ formDialogIconColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="formDialogIconSize"
                    min={0}
                    max={50}
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Text color', 'voxel-fse')}
                        value={attributes.formDialogTextColor}
                        onChange={(value) => setAttributes({ formDialogTextColor: value })}
                    />
                </div>

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="formDialogTypography"
                />

                <div className="voxel-fse-control-row">
                    <ColorControl
                        label={__('Background color', 'voxel-fse')}
                        value={attributes.formDialogBackgroundColor}
                        onChange={(value) => setAttributes({ formDialogBackgroundColor: value })}
                    />
                </div>

                <ResponsiveRangeControl
                    label={__('Radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="formDialogRadius"
                    min={0}
                    max={50}
                />

                <div className="voxel-fse-control-row">
                    <BoxShadowPopup
                        label={__('Box Shadow', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        shadowAttributeName="formDialogBoxShadow"
                    />
                </div>

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={{
                        borderType: attributes.formDialogBorderType || '',
                        borderWidth: attributes.formDialogBorderWidth || {},
                        borderColor: attributes.formDialogBorderColor || '',
                    }}
                    onChange={(value) => {
                        const updates: Partial<LoginAttributes> = {};
                        if (value.borderType !== undefined) {
                            updates.formDialogBorderType = value.borderType;
                        }
                        if (value.borderWidth !== undefined) {
                            updates.formDialogBorderWidth = value.borderWidth as any;
                        }
                        if (value.borderColor !== undefined) {
                            updates.formDialogBorderColor = value.borderColor;
                        }
                        setAttributes(updates);
                    }}
                    hideRadius={true}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
