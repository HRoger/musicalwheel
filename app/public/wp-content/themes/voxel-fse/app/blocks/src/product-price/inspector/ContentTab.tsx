
import { __ } from '@wordpress/i18n';
import {
    AccordionPanelGroup,
    AccordionPanel,
    TypographyControl,
    ResponsiveColorControl,
    ResponsiveRangeControl
} from '@shared/controls';
import type { ProductPriceAttributes } from '../types';

interface ContentTabProps {
    attributes: ProductPriceAttributes;
    setAttributes: (attrs: Partial<ProductPriceAttributes>) => void;
}

export default function ContentTab({ attributes, setAttributes }: ContentTabProps) {
    return (
        <AccordionPanelGroup
            defaultPanel="chart"
            attributes={attributes as Record<string, any>}
            setAttributes={setAttributes as (attrs: Record<string, any>) => void}
            stateAttribute="contentTabOpenPanel"
        >
            <AccordionPanel id="chart" title={__('Chart', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    typographyAttributeName="typography"
                />

                <ResponsiveColorControl
                    label={__('Color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="priceColor"
                />

                <ResponsiveColorControl
                    label={__('Linethrough text color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="strikethroughTextColor"
                />

                <ResponsiveColorControl
                    label={__('Linethrough line color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="strikethroughLineColor"
                />

                <ResponsiveRangeControl
                    label={__('Linethrough line width', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="strikethroughWidth"
                    min={1}
                    max={10}
                    step={0.5}
                    unitAttributeName="strikethroughWidthUnit"
                />

                <ResponsiveColorControl
                    label={__('Out of stock color', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="outOfStockColor"
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
