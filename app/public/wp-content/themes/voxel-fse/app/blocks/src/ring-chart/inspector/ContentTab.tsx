import { __ } from '@wordpress/i18n';
import { SelectControl, RangeControl } from '@wordpress/components';
import {
    AccordionPanelGroup,
    AccordionPanel,
} from '../../../shared/controls/AccordionPanelGroup';
import ResponsiveRangeControl from '../../../shared/controls/ResponsiveRangeControl';
import DynamicTagTextControl from '../../../shared/controls/DynamicTagTextControl';
import type { RingChartAttributes } from '../types';

interface ContentTabProps {
    attributes: RingChartAttributes;
    setAttributes: (attributes: Partial<RingChartAttributes>) => void;
}

export default function ContentTab({ attributes, setAttributes }: ContentTabProps) {

    return (
        <AccordionPanelGroup
            attributes={attributes}
            setAttributes={setAttributes}
            defaultPanel="content"
        >
            <AccordionPanel id="content" title={__('Content', 'voxel-fse')}>
                <SelectControl
                    label={__('Justify', 'voxel-fse')}
                    value={attributes.ts_chart_position}
                    options={[
                        { label: __('Left', 'voxel-fse'), value: 'flex-start' },
                        { label: __('Center', 'voxel-fse'), value: 'center' },
                        { label: __('Right', 'voxel-fse'), value: 'flex-end' },
                    ]}
                    onChange={(value) =>
                        setAttributes({
                            ts_chart_position: value as RingChartAttributes['ts_chart_position'],
                        })
                    }
                />

                {/* Value - Using RangeControl but could be NumberControl. 
            Image shows Input "0" and Voxel Icon.
            Standard RangeControl allows typing number.
            If we wanted Voxel Icon (Dynamic Tag), we'd need DynamicTagTextControl but that returns string.
            Sticking to RangeControl to maintain 'number' type for now. 
        */}
                <RangeControl
                    label={__('Value', 'voxel-fse')}
                    value={attributes.ts_chart_value}
                    onChange={(value) => setAttributes({ ts_chart_value: value ?? 0 })}
                    min={0}
                    max={100}
                    step={0.01}
                    __nextHasNoMarginBottom
                />

                {/* Suffix - String, supports dynamic tags visually in image */}
                <DynamicTagTextControl
                    label={__('Suffix', 'voxel-fse')}
                    value={attributes.ts_chart_value_suffix}
                    onChange={(value) => setAttributes({ ts_chart_value_suffix: value })}
                    help={__('Text to display after the value (e.g., "%", " items")', 'voxel-fse')}
                />

                <RangeControl
                    label={__('Circle size', 'voxel-fse')}
                    value={attributes.ts_chart_size}
                    onChange={(value) => setAttributes({ ts_chart_size: value ?? 100 })}
                    min={0}
                    max={300}
                    step={1}
                    __nextHasNoMarginBottom
                />

                <RangeControl
                    label={__('Stroke width', 'voxel-fse')}
                    value={attributes.ts_chart_stroke_width}
                    onChange={(value) => setAttributes({ ts_chart_stroke_width: value ?? 2 })}
                    min={0}
                    max={5}
                    step={1}
                    __nextHasNoMarginBottom
                />

                {/* Animation duration - Using ResponsiveRangeControl which supports Dynamic Tags via enableDynamicTags */}
                <ResponsiveRangeControl
                    label={__('Animation duration', 'voxel-fse')}
                    attributes={attributes}
                    setAttributes={setAttributes}
                    attributeBaseName="ts_chart_animation_duration"
                    min={0}
                    max={5}
                    step={0.01}
                    enableDynamicTags={true}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
