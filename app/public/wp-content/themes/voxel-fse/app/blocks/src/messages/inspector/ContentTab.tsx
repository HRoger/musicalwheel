/**
 * Messages Block - Content Tab
 *
 * Matches the "Content" tab from Voxel's Messages (VX) widget.
 * Based on the provided image reference.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    AccordionPanelGroup,
    AccordionPanel,
    IconPickerControl,
} from '@shared/controls';
import type { MessagesAttributes, MessagesIcons } from '../types';

interface ContentTabProps {
    attributes: MessagesAttributes;
    setAttributes: (attrs: Partial<MessagesAttributes>) => void;
}

export default function ContentTab({
    attributes,
    setAttributes,
}: ContentTabProps) {
    const icons = attributes.icons || {};

    /**
     * Update a specific icon in the icons attribute
     */
    const updateIcon = (key: keyof MessagesIcons, value: any) => {
        setAttributes({
            icons: {
                ...attributes.icons,
                [key]: value,
            },
        });
    };

    return (
        <AccordionPanelGroup defaultPanel="icons">
            <AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
                <IconPickerControl
                    label={__('Search', 'voxel-fse')}
                    value={icons.search}
                    onChange={(value) => updateIcon('search', value)}
                />
                <IconPickerControl
                    label={__('Chat', 'voxel-fse')}
                    value={icons.chat}
                    onChange={(value) => updateIcon('chat', value)}
                />
                <IconPickerControl
                    label={__('Load more', 'voxel-fse')}
                    value={icons.loadMore}
                    onChange={(value) => updateIcon('loadMore', value)}
                />
                <IconPickerControl
                    label={__('Back', 'voxel-fse')}
                    value={icons.back}
                    onChange={(value) => updateIcon('back', value)}
                />
                <IconPickerControl
                    label={__('More', 'voxel-fse')}
                    value={icons.more}
                    onChange={(value) => updateIcon('more', value)}
                />
                <IconPickerControl
                    label={__('User', 'voxel-fse')}
                    value={icons.user}
                    onChange={(value) => updateIcon('user', value)}
                />
                <IconPickerControl
                    label={__('Clear', 'voxel-fse')}
                    value={icons.clear}
                    onChange={(value) => updateIcon('clear', value)}
                />
                <IconPickerControl
                    label={__('Ban', 'voxel-fse')}
                    value={icons.ban}
                    onChange={(value) => updateIcon('ban', value)}
                />
                <IconPickerControl
                    label={__('Trash', 'voxel-fse')}
                    value={icons.trash}
                    onChange={(value) => updateIcon('trash', value)}
                />
                <IconPickerControl
                    label={__('Upload', 'voxel-fse')}
                    value={icons.upload}
                    onChange={(value) => updateIcon('upload', value)}
                />
                <IconPickerControl
                    label={__('Media library', 'voxel-fse')}
                    value={icons.gallery}
                    onChange={(value) => updateIcon('gallery', value)}
                />
                <IconPickerControl
                    label={__('Emoji', 'voxel-fse')}
                    value={icons.emoji}
                    onChange={(value) => updateIcon('emoji', value)}
                />
                <IconPickerControl
                    label={__('Send', 'voxel-fse')}
                    value={icons.send}
                    onChange={(value) => updateIcon('send', value)}
                />
            </AccordionPanel>
        </AccordionPanelGroup>
    );
}
