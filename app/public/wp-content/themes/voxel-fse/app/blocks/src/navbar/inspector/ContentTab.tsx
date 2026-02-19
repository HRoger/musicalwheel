/**
 * Navbar Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Matches Voxel's Navbar (VX) Content tab:
 * - Source accordion: Choose source, Select menus, Relation links
 * - Settings accordion: Orientation, Justify, Hamburger toggles
 * - Icons accordion: Hamburger icon, Close icon (AdvancedIconControl)
 * - Content accordion: Manual links (only when source is manual) - Repeater Control with Loop/Visibility
 * - Popups: Custom style (moved to Style tab)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    ToggleControl,
    RangeControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    AccordionPanelGroup,
    AccordionPanel,
    SectionHeading,
    AdvancedIconControl,
    DynamicTagTextControl,
    LinkSearchControl,
    RelationControl,
    RepeaterControl,
    generateRepeaterId,
    LoopVisibilityControl,
    LoopElementModal,
} from '@shared/controls';
import type { LoopConfig } from '@shared/controls/LoopElementModal';
import type { IconValue } from '@shared/types';
import type { NavbarAttributes, NavbarManualItem } from '../types';

interface ContentTabProps {
    attributes: NavbarAttributes;
    setAttributes: (attrs: Partial<NavbarAttributes>) => void;
    menuLocationOptions: { value: string; label: string }[];
}

// Block type constants
const SEARCH_FORM_BLOCK = 'voxel-fse/search-form';
const TEMPLATE_TABS_BLOCK = 'voxel-fse/template-tabs';

export function ContentTab({
    attributes,
    setAttributes,
    menuLocationOptions,
}: ContentTabProps): JSX.Element {
    // Loop modal state
    const [loopModalItemIndex, setLoopModalItemIndex] = useState<number | null>(null);

    // Force Icons panel to remount when source changes by using key
    // This fixes WordPress PanelBody height calculation issue with dynamic content
    const iconsPanelKey = `icons-${attributes.source}`;

    // Ref to track the content wrapper for JavaScript-based height fix
    const contentWrapperRef = useRef<HTMLDivElement>(null);

    // Function to fix PanelBody inline styles set by WordPress
    const fixPanelBodyHeights = useCallback(() => {
        if (!contentWrapperRef.current) return;

        // Find all opened PanelBody elements
        const openedPanels = contentWrapperRef.current.querySelectorAll<HTMLElement>(
            '.components-panel__body.is-opened'
        );

        openedPanels.forEach((panel) => {
            // Remove the inline max-height that WordPress sets
            panel.style.maxHeight = 'none';
            panel.style.height = 'auto';
            panel.style.overflow = 'visible';
        });

        // Also fix the image upload empty areas
        const uploadAreas = contentWrapperRef.current.querySelectorAll<HTMLElement>(
            '.voxel-fse-image-upload-empty'
        );

        uploadAreas.forEach((area) => {
            area.style.minHeight = '100px';
        });
    }, []);

    // Fix heights after render and whenever source changes
    useEffect(() => {
        // Initial fix with small delay to let WordPress set its inline styles first
        const timeoutId = setTimeout(fixPanelBodyHeights, 50);

        // Also set up a MutationObserver to catch when panels open/close
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // A panel opened or closed, fix heights
                    setTimeout(fixPanelBodyHeights, 50);
                }
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // WordPress set inline styles, fix them
                    const target = mutation.target as HTMLElement;
                    if (target.classList.contains('is-opened')) {
                        target.style.maxHeight = 'none';
                        target.style.height = 'auto';
                        target.style.overflow = 'visible';
                    }
                }
            });
        });

        if (contentWrapperRef.current) {
            observer.observe(contentWrapperRef.current, {
                attributes: true,
                subtree: true,
                attributeFilter: ['class', 'style'],
            });
        }

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [attributes.source, fixPanelBodyHeights]);

    // Inject CSS fix for inspector panels - editorStyle in block.json only applies to canvas, not inspector
    const inspectorPanelFix = `
        .components-panel__body.is-opened {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
        }
        .voxel-advanced-icon-control .voxel-fse-image-upload-empty {
            min-height: 100px !important;
        }
    `;

    // Fetch available blocks for RelationControl
    const { searchFormBlocks, templateTabsBlocks } = useSelect((select: any) => {
        const { getBlocks } = select('core/block-editor');
        const allBlocks = getBlocks();

        // Recursive helper to find blocks by name
        const findBlocksByName = (blocks: any[], blockName: string): any[] => {
            let found: any[] = [];
            blocks.forEach((block: any) => {
                if (block.name === blockName) {
                    found.push(block);
                }
                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    found = [...found, ...findBlocksByName(block.innerBlocks, blockName)];
                }
            });
            return found;
        };

        return {
            searchFormBlocks: findBlocksByName(allBlocks, SEARCH_FORM_BLOCK),
            templateTabsBlocks: findBlocksByName(allBlocks, TEMPLATE_TABS_BLOCK),
        };
    });

    // Justify options (standard select, not responsive)
    const justifyOptions = [
        { value: 'left', label: __('Left', 'voxel-fse') },
        { value: 'center', label: __('Center', 'voxel-fse') },
        { value: 'right', label: __('Right', 'voxel-fse') },
        { value: 'space-between', label: __('Space between', 'voxel-fse') },
        { value: 'space-around', label: __('Space around', 'voxel-fse') },
    ];

    // Source options
    const sourceOptions = [
        { value: 'add_links_manually', label: __('Add links manually', 'voxel-fse') },
        { value: 'select_wp_menu', label: __('Select existing menu', 'voxel-fse') },
        { value: 'template_tabs', label: __('Link to Template Tabs widget', 'voxel-fse') },
        { value: 'search_form', label: __('Link to Search Form widget', 'voxel-fse') },
    ];

    // Orientation options
    const orientationOptions = [
        { value: 'horizontal', label: __('Horizontal', 'voxel-fse') },
        { value: 'vertical', label: __('Vertical', 'voxel-fse') },
    ];

    return (
        <div ref={contentWrapperRef}>
            {/* Inject CSS fix for inspector panel height issues */}
            <style>{inspectorPanelFix}</style>
            <AccordionPanelGroup
                defaultPanel="source"
                attributes={attributes as Record<string, any>}
                setAttributes={setAttributes as (attrs: Record<string, any>) => void}
                stateAttribute="contentTabOpenPanel"
            >
                {/* Source Accordion */}
                <AccordionPanel id="source" title={__('Source', 'voxel-fse')}>
                    <SelectControl
                        label={__('Choose source', 'voxel-fse')}
                        value={attributes.source}
                        options={sourceOptions}
                        onChange={(value: string) =>
                            setAttributes({
                                source: value as NavbarAttributes['source'],
                            })
                        }
                        __nextHasNoMarginBottom
                    />

                    {/* WordPress Menu Selection - conditional */}
                    {attributes.source === 'select_wp_menu' && (
                        <>
                            <SelectControl
                                label={__('Desktop menu', 'voxel-fse')}
                                help={__('Choose the navigation menu to display', 'voxel-fse')}
                                value={attributes.menuLocation}
                                options={menuLocationOptions.filter(opt => opt.value !== '')}
                                onChange={(value: string) => setAttributes({ menuLocation: value })}
                                __nextHasNoMarginBottom
                            />

                            <SelectControl
                                label={__('Mobile menu', 'voxel-fse')}
                                help={__(
                                    'Choose the menu which is displayed when hamburger icon is clicked',
                                    'voxel-fse'
                                )}
                                value={attributes.mobileMenuLocation}
                                options={menuLocationOptions.filter(opt => opt.value !== '')}
                                onChange={(value: string) => setAttributes({ mobileMenuLocation: value })}
                                __nextHasNoMarginBottom
                            />
                        </>
                    )}

                    {/* Template Tabs Relation */}
                    {attributes.source === 'template_tabs' && (
                        <>
                            <p className="components-base-control__help" style={{ marginBottom: '12px' }}>
                                {__(
                                    'Navbar will be automatically populated with links to each tab added in the Template Tabs widget.',
                                    'voxel-fse'
                                )}
                            </p>
                            <RelationControl
                                label={__('Link to a Template Tabs widget', 'voxel-fse')}
                                items={templateTabsBlocks.map((b: any) => ({
                                    id: b.clientId,
                                    clientId: b.clientId,
                                    label: undefined,
                                }))}
                                selectedId={attributes.templateTabsId}
                                onSelect={(id: string | null) =>
                                    setAttributes({ templateTabsId: id || '' })
                                }
                                widgetType="TemplateTabs"
                            />
                        </>
                    )}

                    {/* Search Form Relation */}
                    {attributes.source === 'search_form' && (
                        <>
                            <p className="components-base-control__help" style={{ marginBottom: '12px' }}>
                                {__(
                                    'Navbar will be automatically populated with links to each post type used in the Search Form widget.',
                                    'voxel-fse'
                                )}
                            </p>
                            <RelationControl
                                label={__('Link to a Search Form widget', 'voxel-fse')}
                                items={searchFormBlocks.map((b: any) => ({
                                    id: b.clientId,
                                    clientId: b.clientId,
                                    label: undefined,
                                }))}
                                selectedId={attributes.searchFormId}
                                onSelect={(id: string | null) =>
                                    setAttributes({ searchFormId: id || '' })
                                }
                                widgetType="SearchForm"
                            />
                        </>
                    )}
                </AccordionPanel>

                {/* Settings Accordion */}
                <AccordionPanel id="settings" title={__('Settings', 'voxel-fse')}>
                    <SelectControl
                        label={__('Orientation', 'voxel-fse')}
                        value={attributes.orientation}
                        options={orientationOptions}
                        onChange={(value: string) =>
                            setAttributes({
                                orientation: value as NavbarAttributes['orientation'],
                            })
                        }
                        __nextHasNoMarginBottom
                    />

                    {/* Collapsible (vertical only) */}
                    {attributes.orientation === 'vertical' && (
                        <>
                            <ToggleControl
                                label={__('Collapsible?', 'voxel-fse')}
                                checked={attributes.collapsible}
                                onChange={(value: boolean) => setAttributes({ collapsible: value })}
                                __nextHasNoMarginBottom
                            />

                            {attributes.collapsible && (
                                <>
                                    <RangeControl
                                        label={__('Collapsed width', 'voxel-fse')}
                                        value={attributes.collapsedWidth}
                                        onChange={(value: number | undefined) =>
                                            setAttributes({
                                                collapsedWidth: value ?? 60,
                                            })
                                        }
                                        min={0}
                                        max={500}
                                    />

                                    <RangeControl
                                        label={__('Expanded width', 'voxel-fse')}
                                        value={attributes.expandedWidth}
                                        onChange={(value: number | undefined) =>
                                            setAttributes({
                                                expandedWidth: value ?? 200,
                                            })
                                        }
                                        min={0}
                                        max={500}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* Justify - Standard (horizontal only) */}
                    {attributes.orientation === 'horizontal' && (
                        <SelectControl
                            label={__('Justify', 'voxel-fse')}
                            value={attributes.justify}
                            options={justifyOptions}
                            onChange={(value: string) =>
                                setAttributes({ justify: value as NavbarAttributes['justify'] })
                            }
                            __nextHasNoMarginBottom
                        />
                    )}

                    {/* Hamburger menu section heading - (WP menu only) */}
                    {attributes.source === 'select_wp_menu' && (
                        <>
                            <SectionHeading label={__('Hamburger menu', 'voxel-fse')} />

                            <DynamicTagTextControl
                                label={__('Menu title', 'voxel-fse')}
                                value={attributes.hamburgerTitle}
                                onChange={(value: string) => setAttributes({ hamburgerTitle: value })}
                                placeholder={__('Menu', 'voxel-fse')}
                            />

                            <ToggleControl
                                label={__('Show on desktop', 'voxel-fse')}
                                checked={attributes.showBurgerDesktop}
                                onChange={(value: boolean) => setAttributes({ showBurgerDesktop: value })}
                                __nextHasNoMarginBottom
                            />

                            <ToggleControl
                                label={__('Show on tablet and mobile', 'voxel-fse')}
                                checked={attributes.showBurgerTablet}
                                onChange={(value: boolean) => setAttributes({ showBurgerTablet: value })}
                                __nextHasNoMarginBottom
                            />

                            <ToggleControl
                                label={__('Show label?', 'voxel-fse')}
                                checked={attributes.showMenuLabel}
                                onChange={(value: boolean) => setAttributes({ showMenuLabel: value })}
                                __nextHasNoMarginBottom
                            />
                        </>
                    )}
                </AccordionPanel>

                {/* Icons Accordion - remounts when source changes to fix height */}
                <AccordionPanel
                    id="icons"
                    title={__('Icons', 'voxel-fse')}
                    key={iconsPanelKey}
                >
                    {/* Hamburger Icon - conditional on WP menu source */}
                    {attributes.source === 'select_wp_menu' && (
                        <AdvancedIconControl
                            label={__('Hamburger', 'voxel-fse')}
                            value={attributes.hamburgerIcon}
                            onChange={(value: IconValue | null) =>
                                setAttributes({
                                    hamburgerIcon: value || { library: '', value: '' },
                                })
                            }
                        />
                    )}

                    <AdvancedIconControl
                        label={__('Close icon', 'voxel-fse')}
                        value={attributes.closeIcon}
                        onChange={(value: IconValue | null) =>
                            setAttributes({ closeIcon: value || { library: '', value: '' } })
                        }
                    />
                </AccordionPanel>

                {/* Content Items Accordion (Manual Links) */}
                {attributes.source === 'add_links_manually' && (
                    <AccordionPanel id="manual_items" title={__('Content', 'voxel-fse')}>
                        <RepeaterControl
                            items={attributes.manualItems}
                            onChange={(newItems) => setAttributes({ manualItems: newItems })}
                            createItem={() => ({
                                id: generateRepeaterId(),
                                text: __('Navbar item', 'voxel-fse'),
                                icon: null,
                                url: '',
                                isExternal: false,
                                nofollow: false,
                                isActive: true,
                                visibilityRules: [],
                                rowVisibility: 'show',
                            } as NavbarManualItem)}
                            getItemLabel={(item: NavbarManualItem, index: number) => item.text || `Item #${index + 1}`}
                            renderContent={({ item, index, onUpdate }: { item: NavbarManualItem, index: number, onUpdate: (update: Partial<NavbarManualItem>) => void }) => (
                                <>
                                    <DynamicTagTextControl
                                        label={__('Title', 'voxel-fse')}
                                        value={item.text}
                                        onChange={(value: string) => onUpdate({ text: value })}
                                    />

                                    <AdvancedIconControl
                                        label={__('Icon', 'voxel-fse')}
                                        value={item.icon ?? { library: '', value: '' }}
                                        onChange={(value: IconValue | null) => onUpdate({ icon: value || { library: '', value: '' } })}
                                    />

                                    <LinkSearchControl
                                        label={__('Link', 'voxel-fse')}
                                        value={{
                                            url: item.url,
                                            isExternal: item.isExternal,
                                            nofollow: item.nofollow,
                                            customAttributes: item.customAttributes,
                                        }}
                                        onChange={(link) => onUpdate({
                                            url: link.url,
                                            isExternal: link.isExternal,
                                            nofollow: link.nofollow,
                                            customAttributes: link.customAttributes,
                                        })}
                                        enableDynamicTags
                                    />

                                    <ToggleControl
                                        label={__('Active?', 'voxel-fse')}
                                        checked={item.isActive}
                                        onChange={(value: boolean) => onUpdate({ isActive: value })}
                                        __nextHasNoMarginBottom
                                    />

                                    <LoopVisibilityControl
                                        rowVisibility={item.rowVisibility || 'show'}
                                        visibilityRules={item.visibilityRules || []}
                                        onRowVisibilityChange={(value: any) => onUpdate({ rowVisibility: value })}
                                        onEditVisibilityRules={() => console.log('Edit visibility rules', item.id)}
                                        onClearVisibilityRules={() => onUpdate({ visibilityRules: [] })}
                                        showLoopSection={true}
                                        loopSource={item.loopSource}
                                        loopProperty={item.loopProperty}
                                        loopLimit={item.loopLimit}
                                        loopOffset={item.loopOffset}
                                        onEditLoop={() => setLoopModalItemIndex(index)}
                                        onClearLoop={() => onUpdate({ loopSource: undefined, loopProperty: undefined, loopLimit: undefined, loopOffset: undefined })}
                                        onLoopLimitChange={(value: string) => onUpdate({ loopLimit: value })}
                                        onLoopOffsetChange={(value: string) => onUpdate({ loopOffset: value })}
                                    />
                                </>
                            )}
                        />
                    </AccordionPanel>
                )}
            </AccordionPanelGroup>

            {/* Loop Element Modal */}
            {loopModalItemIndex !== null && (
                <LoopElementModal
                    isOpen={true}
                    config={{
                        loopSource: attributes.manualItems[loopModalItemIndex]?.loopSource || '',
                        loopProperty: attributes.manualItems[loopModalItemIndex]?.loopProperty || '',
                        loopLimit: attributes.manualItems[loopModalItemIndex]?.loopLimit || '',
                        loopOffset: attributes.manualItems[loopModalItemIndex]?.loopOffset || '',
                    }}
                    onClose={() => setLoopModalItemIndex(null)}
                    onSave={(newConfig: LoopConfig) => {
                        const newItems = [...attributes.manualItems];
                        newItems[loopModalItemIndex] = {
                            ...newItems[loopModalItemIndex],
                            loopSource: newConfig.loopSource,
                            loopProperty: newConfig.loopProperty || '',
                        };
                        setAttributes({ manualItems: newItems });
                        setLoopModalItemIndex(null);
                    }}
                />
            )}
        </div>
    );
}
