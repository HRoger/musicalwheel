/**
 * Popup Kit Block - Save Component
 * 
 * Outputs global CSS that applies to ALL popups sitewide.
 * The CSS is generated from block attributes and extracted by Block_Loader.php
 * to be enqueued globally.
 * 
 * @package VoxelFSE
 */

import type { PopupKitEditProps } from './types';
import { generatePopupKitCSS } from './shared/generateCSS';
import PopupKitPreview from './shared/PopupKitPreview';

export default function save({ attributes }: PopupKitEditProps) {
    // Generate global CSS from attributes
    const css = generatePopupKitCSS(attributes);

    return (
        <>
            {/* Global CSS - extracted and enqueued by Block_Loader.php */}
            <style type="text/css" data-voxel-popup-kit-styles="true">
                {css}
            </style>

            {/* Visual preview for editor */}
            <PopupKitPreview attributes={attributes} context="frontend" />
        </>
    );
}
