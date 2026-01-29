/**
 * Layout Preset Selector Component
 *
 * Displays a modal with layout presets when a Flex Container is first inserted.
 * Inspired by Essential Blocks' flex container preset selector.
 */

import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

// Access createBlock from global wp object (WordPress externals)
declare const wp: { blocks: { createBlock: (name: string, attributes?: Record<string, any>) => any } };

// Layout preset icons - Row direction (first row)
const IconColumn = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1430" fill="white">
            <rect width="58" height="32" rx="0.75"></rect>
        </mask>
        <rect width="58" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1430)"></rect>
        <path d="M29.6 8C29.6 7.66863 29.3314 7.4 29 7.4C28.6686 7.4 28.4 7.66863 28.4 8L29 8L29.6 8ZM28.5757 24.4243C28.81 24.6586 29.1899 24.6586 29.4243 24.4243L33.2426 20.6059C33.477 20.3716 33.477 19.9917 33.2426 19.7574C33.0083 19.523 32.6284 19.523 32.3941 19.7574L29 23.1515L25.6059 19.7574C25.3716 19.523 24.9917 19.523 24.7574 19.7574C24.523 19.9917 24.523 20.3716 24.7574 20.6059L28.5757 24.4243ZM29 8L28.4 8L28.4 24L29 24L29.6 24L29.6 8L29 8Z" fill="#5C626D"></path>
    </svg>
);

const IconRow = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1434" fill="white">
            <rect width="58" height="32" rx="0.75"></rect>
        </mask>
        <rect width="58" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1434)"></rect>
        <path d="M13 15.4C12.6686 15.4 12.4 15.6686 12.4 16C12.4 16.3314 12.6686 16.6 13 16.6V16V15.4ZM45.4243 16.4243C45.6586 16.1899 45.6586 15.8101 45.4243 15.5757L41.6059 11.7574C41.3716 11.523 40.9917 11.523 40.7574 11.7574C40.523 11.9917 40.523 12.3716 40.7574 12.6059L44.1515 16L40.7574 19.3941C40.523 19.6284 40.523 20.0083 40.7574 20.2426C40.9917 20.477 41.3716 20.477 41.6059 20.2426L45.4243 16.4243ZM13 16V16.6H45V16V15.4H13V16Z" fill="#5C626D"></path>
    </svg>
);

const Icon2Col = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1440" fill="white">
            <rect width="28" height="32" rx="0.75"></rect>
        </mask>
        <rect width="28" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1440)"></rect>
        <mask id="path-2-inside-2_6429_1440" fill="white">
            <rect x="30" width="28" height="32" rx="0.75"></rect>
        </mask>
        <rect x="30" width="28" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1440)"></rect>
    </svg>
);

const Icon2ColSidebar = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1445" fill="white">
            <rect width="18" height="32" rx="0.75"></rect>
        </mask>
        <rect width="18" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1445)"></rect>
        <mask id="path-2-inside-2_6429_1445" fill="white">
            <rect x="20" width="38" height="32" rx="0.75"></rect>
        </mask>
        <rect x="20" width="38" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1445)"></rect>
    </svg>
);

const Icon4Col = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1453" fill="white">
            <rect width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1453)"></rect>
        <mask id="path-2-inside-2_6429_1453" fill="white">
            <rect x="15" width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect x="15" width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1453)"></rect>
        <mask id="path-3-inside-3_6429_1453" fill="white">
            <rect x="30" width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect x="30" width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1453)"></rect>
        <mask id="path-4-inside-4_6429_1453" fill="white">
            <rect x="45" width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect x="45" width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-4-inside-4_6429_1453)"></rect>
    </svg>
);

const Icon3ColCenterWide = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1461" fill="white">
            <rect width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1461)"></rect>
        <mask id="path-2-inside-2_6429_1461" fill="white">
            <rect x="15" width="28" height="32" rx="0.75"></rect>
        </mask>
        <rect x="15" width="28" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1461)"></rect>
        <mask id="path-3-inside-3_6429_1461" fill="white">
            <rect x="45" width="13" height="32" rx="0.75"></rect>
        </mask>
        <rect x="45" width="13" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1461)"></rect>
    </svg>
);

// Grid layout icons (second row)
const IconGrid2x2 = () => (
    <svg width="58" height="33" viewBox="0 0 58 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1469" fill="white">
            <rect y="0.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect y="0.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1469)"></rect>
        <mask id="path-2-inside-2_6429_1469" fill="white">
            <rect x="30" y="0.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect x="30" y="0.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1469)"></rect>
        <mask id="path-3-inside-3_6429_1469" fill="white">
            <rect y="17.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect y="17.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1469)"></rect>
        <mask id="path-4-inside-4_6429_1469" fill="white">
            <rect x="30" y="17.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect x="30" y="17.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-4-inside-4_6429_1469)"></rect>
    </svg>
);

const IconGrid2x2FullBottom = () => (
    <svg width="58" height="33" viewBox="0 0 58 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1478" fill="white">
            <rect y="0.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect y="0.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1478)"></rect>
        <mask id="path-2-inside-2_6429_1478" fill="white">
            <rect x="30" y="0.125" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect x="30" y="0.125" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1478)"></rect>
        <mask id="path-3-inside-3_6429_1478" fill="white">
            <rect y="17.125" width="58" height="15" rx="0.75"></rect>
        </mask>
        <rect y="17.125" width="58" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1478)"></rect>
    </svg>
);

const IconGridSidebarContent = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1487" fill="white">
            <rect width="28" height="32" rx="0.75"></rect>
        </mask>
        <rect width="28" height="32" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1487)"></rect>
        <mask id="path-2-inside-2_6429_1487" fill="white">
            <rect x="30" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect x="30" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1487)"></rect>
        <mask id="path-3-inside-3_6429_1487" fill="white">
            <rect x="30" y="17" width="28" height="15" rx="0.75"></rect>
        </mask>
        <rect x="30" y="17" width="28" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1487)"></rect>
    </svg>
);

const IconGrid3x2 = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1494" fill="white">
            <rect width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1494)"></rect>
        <mask id="path-2-inside-2_6429_1494" fill="white">
            <rect x="20" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="20" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1494)"></rect>
        <mask id="path-3-inside-3_6429_1494" fill="white">
            <rect x="40" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="40" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1494)"></rect>
        <mask id="path-4-inside-4_6429_1494" fill="white">
            <rect y="17" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect y="17" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-4-inside-4_6429_1494)"></rect>
        <mask id="path-5-inside-5_6429_1494" fill="white">
            <rect x="20" y="17" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="20" y="17" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-5-inside-5_6429_1494)"></rect>
        <mask id="path-6-inside-6_6429_1494" fill="white">
            <rect x="40" y="17" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="40" y="17" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-6-inside-6_6429_1494)"></rect>
    </svg>
);

const IconGrid3x2Merged = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1_6429_1505" fill="white">
            <rect width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-1-inside-1_6429_1505)"></rect>
        <mask id="path-2-inside-2_6429_1505" fill="white">
            <rect x="20" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="20" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-2-inside-2_6429_1505)"></rect>
        <mask id="path-3-inside-3_6429_1505" fill="white">
            <rect x="40" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect x="40" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-3-inside-3_6429_1505)"></rect>
        <mask id="path-4-inside-4_6429_1505" fill="white">
            <rect y="17" width="18" height="15" rx="0.75"></rect>
        </mask>
        <rect y="17" width="18" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-4-inside-4_6429_1505)"></rect>
        <mask id="path-5-inside-5_6429_1505" fill="white">
            <rect x="20" y="17" width="38" height="15" rx="0.75"></rect>
        </mask>
        <rect x="20" y="17" width="38" height="15" rx="0.75" stroke="#5C626D" strokeWidth="2" mask="url(#path-5-inside-5_6429_1505)"></rect>
    </svg>
);

const IconGridBento = () => (
    <svg width="58" height="32" viewBox="0 0 58 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 14H37V1H1V14ZM38 14.25L37.9961 14.3271C37.9575 14.7051 37.6382 15 37.25 15H0.75L0.672852 14.9961C0.320245 14.9601 0.0399361 14.6798 0.00390625 14.3271L0 14.25V0.75C9.0562e-08 0.361834 0.294882 0.0425277 0.672852 0.00390625L0.75 0H37.25C37.6642 0 38 0.335786 38 0.75V14.25Z" fill="#5C626D"></path>
        <path d="M57 18L21 18L21 31L57 31L57 18ZM20 17.75L20.0039 17.6729C20.0425 17.2949 20.3618 17 20.75 17L57.25 17L57.3271 17.0039C57.6798 17.0399 57.9601 17.3202 57.9961 17.6729L58 17.75L58 31.25C58 31.6382 57.7051 31.9575 57.3271 31.9961L57.25 32L20.75 32C20.3358 32 20 31.6642 20 31.25L20 17.75Z" fill="#5C626D"></path>
        <path d="M41 14H57V1H41V14ZM58 14.25L57.9961 14.3271C57.9601 14.6798 57.6798 14.9601 57.3271 14.9961L57.25 15H40.75C40.3618 15 40.0425 14.7051 40.0039 14.3271L40 14.25V0.75C40 0.335787 40.3358 1.20798e-08 40.75 0H57.25L57.3271 0.00390625C57.7051 0.0425279 58 0.361834 58 0.75V14.25Z" fill="#5C626D"></path>
        <path d="M17 18L0.999999 18L1 31L17 31L17 18ZM-1.24577e-06 17.75L0.003905 17.6729C0.0399348 17.3202 0.320244 17.0399 0.67285 17.0039L0.749999 17L17.25 17C17.6382 17 17.9575 17.2949 17.9961 17.6729L18 17.75L18 31.25C18 31.6642 17.6642 32 17.25 32L0.75 32L0.672852 31.9961C0.294882 31.9575 -3.16325e-08 31.6382 -6.55671e-08 31.25L-1.24577e-06 17.75Z" fill="#5C626D"></path>
    </svg>
);

// Flex Container heading icon
const FlexContainerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path fill="#6C3BFF" d="M.833 21.139h22.333V2.86H.833zm23.167.19c0 .37-.29.671-.649.671H.648A.66.66 0 0 1 0 21.33V2.67C0 2.3.29 2 .648 2h22.703c.358 0 .649.3.649.67z"></path>
        <path fill="#6C3BFF" d="M3.626 7.452c0-.131.106-.237.237-.237h6.704c.13 0 .236.106.236.237v9.072c0 .13-.106.237-.236.237H3.863a.237.237 0 0 1-.237-.237zM11.988 7.452c0-.131.106-.237.237-.237h3.115c.13 0 .237.106.237.237v9.072c0 .13-.106.237-.237.237h-3.115a.237.237 0 0 1-.237-.237zM16.76 7.452c0-.131.107-.237.238-.237h3.115c.13 0 .237.106.237.237v9.072c0 .13-.106.237-.237.237h-3.115a.237.237 0 0 1-.237-.237z"></path>
    </svg>
);

// Preset definitions
export interface LayoutPreset {
    id: string;
    icon: React.ReactNode;
    label: string;
    type: 'flexbox' | 'grid';
    // For flexbox presets
    flexDirection?: string;
    childContainers?: number;
    // For grid presets
    gridColumns?: number;
    gridRows?: number;
    childCount?: number;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
    // Flexbox presets (first row)
    { id: 'column', icon: <IconColumn />, label: __('Column', 'voxel-fse'), type: 'flexbox', flexDirection: 'column', childContainers: 0 },
    { id: 'row', icon: <IconRow />, label: __('Row', 'voxel-fse'), type: 'flexbox', flexDirection: 'row', childContainers: 0 },
    { id: '2-col', icon: <Icon2Col />, label: __('2 Columns', 'voxel-fse'), type: 'flexbox', flexDirection: 'row', childContainers: 2 },
    { id: '2-col-sidebar', icon: <Icon2ColSidebar />, label: __('Sidebar + Content', 'voxel-fse'), type: 'flexbox', flexDirection: 'row', childContainers: 2 },
    { id: '4-col', icon: <Icon4Col />, label: __('4 Columns', 'voxel-fse'), type: 'flexbox', flexDirection: 'row', childContainers: 4 },
    { id: '3-col-center', icon: <Icon3ColCenterWide />, label: __('3 Columns Center Wide', 'voxel-fse'), type: 'flexbox', flexDirection: 'row', childContainers: 3 },
    // Grid presets (second row)
    { id: 'grid-2x2', icon: <IconGrid2x2 />, label: __('Grid 2x2', 'voxel-fse'), type: 'grid', gridColumns: 2, gridRows: 2, childCount: 4 },
    { id: 'grid-2x2-full', icon: <IconGrid2x2FullBottom />, label: __('Grid 2+1', 'voxel-fse'), type: 'grid', gridColumns: 2, gridRows: 2, childCount: 3 },
    { id: 'grid-sidebar', icon: <IconGridSidebarContent />, label: __('Grid Sidebar', 'voxel-fse'), type: 'grid', gridColumns: 2, gridRows: 2, childCount: 3 },
    { id: 'grid-3x2', icon: <IconGrid3x2 />, label: __('Grid 3x2', 'voxel-fse'), type: 'grid', gridColumns: 3, gridRows: 2, childCount: 6 },
    { id: 'grid-3x2-merged', icon: <IconGrid3x2Merged />, label: __('Grid 3x2 Merged', 'voxel-fse'), type: 'grid', gridColumns: 3, gridRows: 2, childCount: 5 },
    { id: 'grid-bento', icon: <IconGridBento />, label: __('Bento Grid', 'voxel-fse'), type: 'grid', gridColumns: 2, gridRows: 2, childCount: 4 },
];

interface LayoutPresetSelectorProps {
    clientId: string;
    setAttributes: (attrs: Record<string, any>) => void;
}

export default function LayoutPresetSelector({ clientId, setAttributes }: LayoutPresetSelectorProps) {
    const { replaceInnerBlocks } = useDispatch('core/block-editor');

    const handleSelectPreset = (preset: LayoutPreset) => {
        // Create child containers based on preset
        const innerBlocks: any[] = [];

        if (preset.type === 'flexbox') {
            // Set flexbox attributes
            const attrs: Record<string, any> = {
                layoutPreset: preset.id,
                containerLayout: 'flexbox',
                flexDirection: preset.flexDirection || 'row',
            };

            // Create child containers if specified
            if (preset.childContainers && preset.childContainers > 0) {
                for (let i = 0; i < preset.childContainers; i++) {
                    innerBlocks.push(wp.blocks.createBlock('voxel-fse/flex-container', {
                        layoutPreset: 'child', // Mark as child to skip preset selector
                    }));
                }
            }

            setAttributes(attrs);
        } else if (preset.type === 'grid') {
            // Set grid attributes
            const attrs: Record<string, any> = {
                layoutPreset: preset.id,
                containerLayout: 'grid',
                gridColumns: preset.gridColumns || 2,
                gridRows: preset.gridRows || 2,
            };

            // Create child containers for grid
            if (preset.childCount && preset.childCount > 0) {
                for (let i = 0; i < preset.childCount; i++) {
                    innerBlocks.push(wp.blocks.createBlock('voxel-fse/flex-container', {
                        layoutPreset: 'child', // Mark as child to skip preset selector
                    }));
                }
            }

            setAttributes(attrs);
        }

        // Replace inner blocks with the created child containers
        if (innerBlocks.length > 0) {
            replaceInnerBlocks(clientId, innerBlocks, false);
        }
    };

    return (
        <div className="voxel-fse-layout-preset-selector">
            <div className="voxel-fse-layout-preset-header">
                <FlexContainerIcon />
                <h2>{__('Flex Container', 'voxel-fse')}</h2>
            </div>
            <p className="voxel-fse-layout-preset-subtitle">
                {__('Please Select a Container Layout', 'voxel-fse')}
            </p>
            <div className="voxel-fse-layout-preset-grid">
                {LAYOUT_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        className="voxel-fse-layout-preset-item"
                        onClick={() => handleSelectPreset(preset)}
                        title={preset.label}
                        tabIndex={0}
                    >
                        <div className="voxel-fse-layout-preset-icon">
                            {preset.icon}
                        </div>
                    </button>
                ))}
            </div>

            <style>{`
                .voxel-fse-layout-preset-selector {
                    padding: 24px;
                    background: #fff;
                    border: 1px dashed #c3c4c7;
                    border-radius: 4px;
                    text-align: center;
                }

                .voxel-fse-layout-preset-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .voxel-fse-layout-preset-header h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e1e1e;
                }

                .voxel-fse-layout-preset-subtitle {
                    margin: 0 0 20px;
                    color: #6C3BFF;
                    font-size: 14px;
                }

                .voxel-fse-layout-preset-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .voxel-fse-layout-preset-item {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 8px;
                    background: #fff;
                    border: 1px dashed #c3c4c7;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .voxel-fse-layout-preset-item:hover {
                    background: #f0f0f1;
                    border-color: #6C3BFF;
                }

                .voxel-fse-layout-preset-item:focus {
                    outline: 2px solid #6C3BFF;
                    outline-offset: 2px;
                }

                .voxel-fse-layout-preset-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .voxel-fse-layout-preset-icon svg {
                    width: 58px;
                    height: 32px;
                }
            `}</style>
        </div>
    );
}
