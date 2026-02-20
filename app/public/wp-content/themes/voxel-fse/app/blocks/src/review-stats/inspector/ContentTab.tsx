/**
 * Content Tab - Review Stats Block
 *
 * @package VoxelFSE
 */

import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ReviewStatsAttributes } from '../types';

interface ContentTabProps {
    attributes: ReviewStatsAttributes;
    setAttributes: (attributes: Partial<ReviewStatsAttributes>) => void;
}

export default function ContentTab({ attributes, setAttributes }: ContentTabProps) {
    return (
        <PanelBody title={__('Settings', 'voxel-fse')} initialOpen={true}>
            <SelectControl
                label={__('Show stats for', 'voxel-fse')}
                value={attributes.statMode}
                onChange={(value: any) => setAttributes({ statMode: value as 'overall' | 'by_category' })}
                options={[
                    { value: 'overall', label: __('Overall score', 'voxel-fse') },
                    { value: 'by_category', label: __('Scores by category', 'voxel-fse') },
                ]}
            />
        </PanelBody>
    );
}
