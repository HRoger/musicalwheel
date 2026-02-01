import { __ } from '@wordpress/i18n';
import {
    ResponsiveRangeControl,
    ColorControl,
    BoxShadowPopup,
    TypographyControl,
    IconPickerControl,
    BorderGroupControl,
    SectionHeading,
    AccordionPanelGroup,
    AccordionPanel,
    BoxControl,
} from '@shared/controls';
import type { MapComponentProps, MapAttributes } from '../types';

export default function StyleTab({ attributes, setAttributes }: MapComponentProps) {
    // Helper to ensure setAttributes is treated as required (it is in Inspector)
    const setAttrs = setAttributes as (attrs: Partial<MapAttributes>) => void;

    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttrs}
            stateAttribute="mapStyleAccordion"
            defaultPanel="clusters"
        >
            <AccordionPanel id="clusters" title={__('Clusters', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="clusterSize"
                    min={0}
                    max={100}
                    step={1}
                />

                <ColorControl
                    label={__('Background color', 'voxel-fse')}
                    value={attributes.clusterBgColor}
                    onChange={(value) => setAttrs({ clusterBgColor: value })}
                />

                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    shadowAttributeName="clusterShadow"
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="clusterRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.clusterTypography}
                    onChange={(value) => setAttrs({ clusterTypography: value })}
                />

                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.clusterTextColor}
                    onChange={(value) => setAttrs({ clusterTextColor: value })}
                />
            </AccordionPanel>

            {/* Style Tab - Icon Marker */}
            <AccordionPanel id="icon-marker" title={__('Icon marker', 'voxel-fse')}>
                <SectionHeading label={__('General', 'voxel-fse')} />

                <ResponsiveRangeControl
                    label={__('Marker size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="iconMarkerSize"
                    min={30}
                    max={60}
                    step={1}
                />

                <ResponsiveRangeControl
                    label={__('Marker icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="iconMarkerIconSize"
                    min={10}
                    max={60}
                    step={1}
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="iconMarkerRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    shadowAttributeName="iconMarkerShadow"
                />

                <SectionHeading label={__('Static marker', 'voxel-fse')} />

                <ColorControl
                    label={__('Background color', 'voxel-fse')}
                    value={attributes.iconMarkerStaticBg}
                    onChange={(value) => setAttrs({ iconMarkerStaticBg: value })}
                />

                <ColorControl
                    label={__('Background color (Active)', 'voxel-fse')}
                    value={attributes.iconMarkerStaticBgActive}
                    onChange={(value) =>
                        setAttrs({ iconMarkerStaticBgActive: value })
                    }
                />

                <ColorControl
                    label={__('Icon color', 'voxel-fse')}
                    value={attributes.iconMarkerStaticIconColor}
                    onChange={(value) =>
                        setAttrs({ iconMarkerStaticIconColor: value })
                    }
                />

                <ColorControl
                    label={__('Icon color (Active)', 'voxel-fse')}
                    value={attributes.iconMarkerStaticIconColorActive}
                    onChange={(value) =>
                        setAttrs({ iconMarkerStaticIconColorActive: value })
                    }
                />
            </AccordionPanel>

            {/* Style Tab - Text Marker */}
            <AccordionPanel id="text-marker" title={__('Text marker', 'voxel-fse')}>
                <ColorControl
                    label={__('Background color', 'voxel-fse')}
                    value={attributes.textMarkerBgColor}
                    onChange={(value) => setAttrs({ textMarkerBgColor: value })}
                />

                <ColorControl
                    label={__('Background color (Active)', 'voxel-fse')}
                    value={attributes.textMarkerBgColorActive}
                    onChange={(value) =>
                        setAttrs({ textMarkerBgColorActive: value })
                    }
                />

                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.textMarkerTextColor}
                    onChange={(value) => setAttrs({ textMarkerTextColor: value })}
                />

                <ColorControl
                    label={__('Text color (Active)', 'voxel-fse')}
                    value={attributes.textMarkerTextColorActive}
                    onChange={(value) =>
                        setAttrs({ textMarkerTextColorActive: value })
                    }
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="textMarkerRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <TypographyControl
                    label={__('Title typography', 'voxel-fse')}
                    value={attributes.textMarkerTypography}
                    onChange={(value) => setAttrs({ textMarkerTypography: value })}
                />

                <BoxControl
                    label={__('Padding', 'voxel-fse')}
                    values={attributes.textMarkerPadding}
                    onChange={(value) => setAttrs({ textMarkerPadding: value })}
                />

                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    shadowAttributeName="textMarkerShadow"
                />
            </AccordionPanel>

            {/* Style Tab - Image Marker */}
            <AccordionPanel id="image-marker" title={__('Image marker', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Marker size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="imageMarkerSize"
                    min={30}
                    max={60}
                    step={1}
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="imageMarkerRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    shadowAttributeName="imageMarkerShadow"
                />
            </AccordionPanel>

            {/* Style Tab - Map Popup */}
            <AccordionPanel id="map-popup" title={__('Map popup', 'voxel-fse')}>
                <ResponsiveRangeControl
                    label={__('Card width', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="popupCardWidth"
                    min={0}
                    max={700}
                    step={1}
                />

                <SectionHeading label={__('Loader', 'voxel-fse')} />

                <ColorControl
                    label={__('Color 1', 'voxel-fse')}
                    value={attributes.popupLoaderColor1}
                    onChange={(value) => setAttrs({ popupLoaderColor1: value })}
                />

                <ColorControl
                    label={__('Color 2', 'voxel-fse')}
                    value={attributes.popupLoaderColor2}
                    onChange={(value) => setAttrs({ popupLoaderColor2: value })}
                />
            </AccordionPanel>

            {/* Style Tab - Search Button */}
            <AccordionPanel id="search-button" title={__('Search button', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={attributes.searchBtnTypography}
                    onChange={(value) => setAttrs({ searchBtnTypography: value })}
                />

                <ColorControl
                    label={__('Text color', 'voxel-fse')}
                    value={attributes.searchBtnTextColor}
                    onChange={(value) => setAttrs({ searchBtnTextColor: value })}
                />

                <ColorControl
                    label={__('Background color', 'voxel-fse')}
                    value={attributes.searchBtnBgColor}
                    onChange={(value) => setAttrs({ searchBtnBgColor: value })}
                />

                <ColorControl
                    label={__('Icon color', 'voxel-fse')}
                    value={attributes.searchBtnIconColor}
                    onChange={(value) => setAttrs({ searchBtnIconColor: value })}
                />

                <ColorControl
                    label={__('Icon color (Active)', 'voxel-fse')}
                    value={attributes.searchBtnIconColorActive}
                    onChange={(value) =>
                        setAttrs({ searchBtnIconColorActive: value })
                    }
                />

                <ResponsiveRangeControl
                    label={__('Border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="searchBtnRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <IconPickerControl
                    label={__('Checkmark icon', 'voxel-fse')}
                    value={attributes.checkmarkIcon}
                    onChange={(value) => setAttrs({ checkmarkIcon: value })}
                />
            </AccordionPanel>

            {/* Style Tab - Next/Prev Buttons */}
            <AccordionPanel id="nav-buttons" title={__('Next/Prev buttons', 'voxel-fse')}>
                <SectionHeading label={__('Normal', 'voxel-fse')} />

                <ColorControl
                    label={__('Button icon color', 'voxel-fse')}
                    value={attributes.navBtnIconColor}
                    onChange={(value) => setAttrs({ navBtnIconColor: value })}
                />

                <ResponsiveRangeControl
                    label={__('Button icon size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="navBtnIconSize"
                    min={0}
                    max={100}
                    step={1}
                />

                <ColorControl
                    label={__('Button background', 'voxel-fse')}
                    value={attributes.navBtnBgColor}
                    onChange={(value) => setAttrs({ navBtnBgColor: value })}
                />

                <BorderGroupControl
                    label={__('Border', 'voxel-fse')}
                    value={attributes.navBtnBorder || { borderType: 'none', borderWidth: {}, borderColor: '' }}
                    onChange={(value) => setAttrs({ navBtnBorder: value })}
                />

                <ResponsiveRangeControl
                    label={__('Button border radius', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="navBtnRadius"
                    min={0}
                    max={100}
                    step={1}
                />

                <BoxShadowPopup
                    label={__('Box Shadow', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    shadowAttributeName="navBtnShadow"
                />

                <ResponsiveRangeControl
                    label={__('Button size', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttrs}
                    attributeBaseName="navBtnSize"
                    min={0}
                    max={100}
                    step={1}
                />

                <SectionHeading label={__('Hover', 'voxel-fse')} />

                <ColorControl
                    label={__('Button icon color', 'voxel-fse')}
                    value={attributes.navBtnIconColorHover}
                    onChange={(value) => setAttrs({ navBtnIconColorHover: value })}
                />

                <ColorControl
                    label={__('Button background color', 'voxel-fse')}
                    value={attributes.navBtnBgColorHover}
                    onChange={(value) => setAttrs({ navBtnBgColorHover: value })}
                />

                <ColorControl
                    label={__('Button border color', 'voxel-fse')}
                    value={attributes.navBtnBorderColorHover}
                    onChange={(value) =>
                        setAttrs({ navBtnBorderColorHover: value })
                    }
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
