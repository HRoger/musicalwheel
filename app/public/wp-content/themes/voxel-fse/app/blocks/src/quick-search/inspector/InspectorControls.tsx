/**
 * Quick Search Block - Inspector Controls
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { InspectorControls as WPInspectorControls } from '@wordpress/block-editor';
import { InspectorTabs } from '@shared/controls';

import ContentTab from './ContentTab';
import StyleTab from './StyleTab';
import type { QuickSearchAttributes, PostTypeConfig } from '../types';

interface InspectorControlsProps {
    attributes: QuickSearchAttributes;
    setAttributes: (attributes: Partial<QuickSearchAttributes>) => void;
    availablePostTypes: PostTypeConfig[];
    isLoading: boolean;
}

export default function InspectorControls({
    attributes,
    setAttributes,
    availablePostTypes,
    isLoading,
}: InspectorControlsProps) {
    return (
        <WPInspectorControls>
            <InspectorTabs
                tabs={[
                    {
                        id: 'content',
                        label: __('Content', 'voxel-fse'),
                        icon: '\ue92c',
                        render: () => (
                            <ContentTab
                                attributes={attributes}
                                setAttributes={setAttributes}
                                availablePostTypes={availablePostTypes}
                                isLoading={isLoading}
                            />
                        ),
                    },
                    {
                        id: 'style',
                        label: __('Style', 'voxel-fse'),
                        icon: '\ue921',
                        render: () => (
                            <StyleTab
                                attributes={attributes}
                                setAttributes={setAttributes}
                            />
                        ),
                    },
                ]}
                includeAdvancedTab={true}
                includeVoxelTab={true}
                attributes={attributes}
                setAttributes={setAttributes}
                activeTabAttribute="activeTab"
            />
        </WPInspectorControls>
    );
}
