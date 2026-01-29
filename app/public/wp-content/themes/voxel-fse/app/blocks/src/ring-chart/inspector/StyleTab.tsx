import { __ } from '@wordpress/i18n';
import {
    AccordionPanelGroup,
    AccordionPanel,
} from '../../../shared/controls/AccordionPanelGroup';
import ColorControl from '../../../shared/controls/ColorControl';
import TypographyControl from '../../../shared/controls/TypographyControl';
import type { RingChartAttributes } from '../types';

interface StyleTabProps {
    attributes: RingChartAttributes;
    setAttributes: (attributes: Partial<RingChartAttributes>) => void;
}

export default function StyleTab({ attributes, setAttributes }: StyleTabProps) {

    // Map attributes to TypographyValue object
    // Parsing logic handles conversion from "16px" to { fontSize: 16, fontSizeUnit: 'px' }
    const valueTypography = {
        fontFamily: attributes.chart_value_typography_font_family,
        fontWeight: attributes.chart_value_typography_font_weight,
        textTransform: attributes.chart_value_typography_text_transform,
        textDecoration: attributes.chart_value_typography_text_decoration,

        fontSize: parseFloat(attributes.chart_value_typography_font_size || '0') || undefined,
        fontSizeUnit: (attributes.chart_value_typography_font_size || '').replace(/[0-9.]/g, '') || 'px',

        fontSize_tablet: parseFloat(attributes.chart_value_typography_font_size_tablet || '0') || undefined,
        fontSize_mobile: parseFloat(attributes.chart_value_typography_font_size_mobile || '0') || undefined,

        lineHeight: parseFloat(attributes.chart_value_typography_line_height || '0') || undefined,
        lineHeightUnit: (attributes.chart_value_typography_line_height || '').replace(/[0-9.]/g, '') || 'px', // Assumes unit is present or default px

        // Letter spacing mapping
        letterSpacing: parseFloat(attributes.chart_value_typography_letter_spacing || '0') || undefined,
        letterSpacingUnit: (attributes.chart_value_typography_letter_spacing || '').replace(/[0-9.]/g, '') || 'px',

        letterSpacing_tablet: parseFloat(attributes.chart_value_typography_letter_spacing_tablet || '0') || undefined,
        letterSpacing_mobile: parseFloat(attributes.chart_value_typography_letter_spacing_mobile || '0') || undefined,
    };

    const handleTypographyChange = (newTypo: any) => {
        // Reconstruct the string attributes
        const updates: Partial<RingChartAttributes> = {};

        if (newTypo.fontFamily !== undefined) updates.chart_value_typography_font_family = newTypo.fontFamily;
        if (newTypo.fontWeight !== undefined) updates.chart_value_typography_font_weight = newTypo.fontWeight;
        if (newTypo.textTransform !== undefined) updates.chart_value_typography_text_transform = newTypo.textTransform;
        if (newTypo.textDecoration !== undefined) updates.chart_value_typography_text_decoration = newTypo.textDecoration;

        // Reconstruct combined strings for Font Size
        if (newTypo.fontSize !== undefined) {
            updates.chart_value_typography_font_size = `${newTypo.fontSize}${newTypo.fontSizeUnit || 'px'}`;
        } else if (newTypo.fontSize === undefined) {
            // Should we clear it? attributes are strings. 'undefined' might not be valid for setAttributes if strict, but partial is OK.
            // If we want to clear, empty string is safer for text fields.
            updates.chart_value_typography_font_size = '';
        }

        if (newTypo.fontSize_tablet !== undefined) updates.chart_value_typography_font_size_tablet = `${newTypo.fontSize_tablet}${newTypo.fontSizeUnit || 'px'}`;
        if (newTypo.fontSize_mobile !== undefined) updates.chart_value_typography_font_size_mobile = `${newTypo.fontSize_mobile}${newTypo.fontSizeUnit || 'px'}`;

        // Reconstruct Line Height
        // Note: Line height might be unitless (like 1.5). My simple regex replace might incorrectly grab '.' if not careful, but unit extraction usually grabs a-z. 
        // Replace [0-9.] removes numbers and dots, leaving 'px', 'em' etc. 
        // If unitless '1.5', replace returns empty string.
        // So `${1.5}${''}` = "1.5". This works.
        if (newTypo.lineHeight !== undefined) updates.chart_value_typography_line_height = `${newTypo.lineHeight}${newTypo.lineHeightUnit || ''}`;
        if (newTypo.lineHeight_tablet !== undefined) updates.chart_value_typography_line_height_tablet = `${newTypo.lineHeight_tablet}${newTypo.lineHeightUnit || ''}`;
        if (newTypo.lineHeight_mobile !== undefined) updates.chart_value_typography_line_height_mobile = `${newTypo.lineHeight_mobile}${newTypo.lineHeightUnit || ''}`;

        // Reconstruct Letter Spacing
        if (newTypo.letterSpacing !== undefined) updates.chart_value_typography_letter_spacing = `${newTypo.letterSpacing}${newTypo.letterSpacingUnit || 'px'}`;
        if (newTypo.letterSpacing_tablet !== undefined) updates.chart_value_typography_letter_spacing_tablet = `${newTypo.letterSpacing_tablet}${newTypo.letterSpacingUnit || 'px'}`;
        if (newTypo.letterSpacing_mobile !== undefined) updates.chart_value_typography_letter_spacing_mobile = `${newTypo.letterSpacing_mobile}${newTypo.letterSpacingUnit || 'px'}`;

        setAttributes(updates);
    };

    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            defaultPanel="circle"
        >
            <AccordionPanel id="circle" title={__('Circle', 'voxel-fse')}>
                <ColorControl
                    label={__('Circle Color', 'voxel-fse')}
                    value={attributes.ts_chart_cirle_color}
                    onChange={(value) => setAttributes({ ts_chart_cirle_color: value || '' })}
                />

                <ColorControl
                    label={__('Circle Fill Color', 'voxel-fse')}
                    value={attributes.ts_chart_fill_color}
                    onChange={(value) => setAttributes({ ts_chart_fill_color: value || '' })}
                />
            </AccordionPanel>

            <AccordionPanel id="value" title={__('Value', 'voxel-fse')}>
                <TypographyControl
                    label={__('Typography', 'voxel-fse')}
                    value={valueTypography}
                    onChange={handleTypographyChange}
                />

                <ColorControl
                    label={__('Color', 'voxel-fse')}
                    value={attributes.ts_chart_value_color}
                    onChange={(value) => setAttributes({ ts_chart_value_color: value || '' })}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
