/**
 * Style Tab - Review Stats Block
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    ResponsiveRangeControl,
    ColorControl,
    TypographyControl,
    SliderControl,
    AccordionPanelGroup,
    AccordionPanel,
} from '@shared/controls';
import type { ReviewStatsAttributes } from '../types';

interface StyleTabProps {
    attributes: ReviewStatsAttributes;
    setAttributes: (attributes: Partial<ReviewStatsAttributes>) => void;
}

export default function StyleTab({ attributes, setAttributes }: StyleTabProps) {
    return (
        <AccordionPanelGroup defaultPanel="reviews_grid">
            {/* Reviews Grid Section */}
            <AccordionPanel
                id="reviews_grid"
                title={__('Reviews grid', 'voxel-fse')}
            >
                <ResponsiveRangeControl
                    label={__('Number of columns', 'voxel-fse')}
                    attributeBaseName="columns"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    min={1}
                    max={6}
                    step={1}
                />

                <ResponsiveRangeControl
                    label={__('Item gap', 'voxel-fse')}
                    attributeBaseName="itemGap"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    min={0}
                    max={100}
                    availableUnits={['px']}
                />
            </AccordionPanel>

            {/* Review Stats Section */}
            <AccordionPanel
                id="review_stats"
                title={__('Review stats', 'voxel-fse')}
            >
                <ResponsiveRangeControl
                    label={__('Icon size', 'voxel-fse')}
                    attributeBaseName="iconSize"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    min={16}
                    max={80}
                    availableUnits={['px']}
                />

                <SliderControl
                    label={__('Icon right spacing', 'voxel-fse')}
                    value={attributes.iconSpacing || 0}
                    onChange={(value) => setAttributes({ iconSpacing: value })}
                    min={0}
                    max={100}
                    unit="px"
                />

                <TypographyControl
                    label={__('Label typography', 'voxel-fse')}
                    value={attributes.labelTypography}
                    onChange={(value) => setAttributes({ labelTypography: value })}
                />

                <ColorControl
                    label={__('Label color', 'voxel-fse')}
                    value={attributes.labelColor}
                    onChange={(value) => setAttributes({ labelColor: value || '' })}
                />

                <TypographyControl
                    label={__('Score typography', 'voxel-fse')}
                    value={attributes.scoreTypography}
                    onChange={(value) => setAttributes({ scoreTypography: value })}
                />

                <ColorControl
                    label={__('Score color', 'voxel-fse')}
                    value={attributes.scoreColor}
                    onChange={(value) => setAttributes({ scoreColor: value || '' })}
                />

                <ColorControl
                    label={__('Chart background color', 'voxel-fse')}
                    value={attributes.chartBgColor}
                    onChange={(value) => setAttributes({ chartBgColor: value || '' })}
                />

                <ResponsiveRangeControl
                    label={__('Chart height', 'voxel-fse')}
                    attributeBaseName="chartHeight"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    min={0}
                    max={50}
                    availableUnits={['px']}
                />

                <ResponsiveRangeControl
                    label={__('Chart radius', 'voxel-fse')}
                    attributeBaseName="chartRadius"
                    attributes={attributes}
                    setAttributes={setAttributes}
                    min={0}
                    max={50}
                    availableUnits={['px']}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
