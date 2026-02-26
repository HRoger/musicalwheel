/**
 * Advanced Icon Control
 *
 * A large-preview icon picker that matches Elementor's "Icon" control style.
 * Features:
 * - Large preview area (gray box / checkerboard)
 * - "Icon Library" and "Upload SVG" buttons
 * - Support for Voxel Icon Picker modal
 * - Support for WordPress Media Library (SVG/Image)
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import ImageUploadControl from './ImageUploadControl';
import { IconValue } from '../types';

// Note: enable-tags-button.css is loaded via shared-styles.ts entry point

interface AdvancedIconControlProps {
    label: string;
    value?: IconValue;
    onChange: (value: IconValue) => void;
    help?: string;
    supportsDynamicTags?: boolean;
    dynamicTagContext?: string;
}

export default function AdvancedIconControl({
    label,
    value,
    onChange,
    help,
    supportsDynamicTags = true,
    dynamicTagContext = 'post'
}: AdvancedIconControlProps) {
    const normalizedValue: IconValue = {
        library: value?.library || '',
        value: value?.value || '',
    };

    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    // ========================================================================
    // LOGIC COPIED FROM ICON PICKER CONTROL
    // ========================================================================

    const [iconLists, setIconLists] = useState<Record<string, string[]>>({});
    const [loadingIcons, setLoadingIcons] = useState<Record<string, boolean>>({});
    const [activePackKey, setActivePackKey] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Record<string, string[]>>({});
    const iconPickerRef = useRef<HTMLDivElement>(null);

    // Initialize active pack
    useEffect(() => {
        if (isIconPickerOpen && window.Voxel_Icon_Picker_Config && !activePackKey) {
            const config = window.Voxel_Icon_Picker_Config;
            const firstPackKey = Object.keys(config)[0];
            if (firstPackKey) {
                setActivePackKey(firstPackKey);
            }
        }
    }, [isIconPickerOpen, activePackKey]);

    // Load icon list for a pack
    const loadIconList = useCallback(async (packKey: string, pack: any) => {
        if (iconLists[packKey] || loadingIcons[packKey] || !pack.fetchJson) {
            return;
        }

        setLoadingIcons((prev) => ({ ...prev, [packKey]: true }));

        try {
            const response = await fetch(pack.fetchJson);
            if (response.ok) {
                const data: unknown = await response.json();
                let icons: string[] = [];
                if (Array.isArray(data)) {
                    icons = data as string[];
                } else if (data && typeof data === 'object') {
                    const dataObj = data as Record<string, unknown>;
                    // Safely access properties for unknown type
                    if (Array.isArray(dataObj['icons'])) {
                        icons = dataObj['icons'] as string[];
                    } else if (Array.isArray(dataObj['list'])) {
                        icons = dataObj['list'] as string[];
                    }
                }
                setIconLists((prev) => ({ ...prev, [packKey]: icons }));
            }
        } catch (error) {
            console.warn(`Failed to load icon list for ${packKey}:`, error);
        } finally {
            setLoadingIcons((prev) => {
                const next = { ...prev };
                delete next[packKey];
                return next;
            });
        }
    }, [iconLists, loadingIcons]);

    // Handle search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setSearchResults({});
            return;
        }

        const config = window.Voxel_Icon_Picker_Config;
        if (!config) return;

        const results: Record<string, string[]> = {};
        const lowerQuery = query.toLowerCase();

        Object.entries(config).forEach(([packKey, pack]: [string, any]) => {
            const icons = iconLists[packKey] || pack.list || [];
            const filtered = icons.filter((iconName: string) =>
                iconName.toLowerCase().includes(lowerQuery)
            );
            if (filtered.length > 0) {
                results[packKey] = filtered;
            }
        });

        setSearchResults(results);
    }, [iconLists]);

    // Handle Icon Library button
    const handleOpenIconLibrary = useCallback(() => {
        if (!window.Voxel_Icon_Picker_Config) {
            console.warn('Voxel icon picker config not available');
            return;
        }

        setIsIconPickerOpen(true);
        setSearchQuery('');
        setSearchResults({});

        const config = window.Voxel_Icon_Picker_Config;
        Object.entries(config).forEach(([packKey, pack]: [string, any]) => {
            if (pack.fetchJson) {
                loadIconList(packKey, pack);
            }
        });
    }, [loadIconList]);

    // Close icon picker
    const handleCloseIconPicker = useCallback(() => {
        setIsIconPickerOpen(false);
        setSearchQuery('');
        setSearchResults({});
        setActivePackKey('');
    }, []);

    // Handle pack selection
    const handleSetPack = useCallback((packKey: string) => {
        setActivePackKey(packKey);
        setSearchQuery('');
        setSearchResults({});
    }, []);

    // Handle icon selection
    const handleIconSelect = useCallback(
        (iconName: string, packKey: string) => {
            const config = window.Voxel_Icon_Picker_Config;
            if (!config || !config[packKey]) {
                return;
            }

            const pack = config[packKey] as any;
            const iconValue = `${pack.displayPrefix} ${pack.prefix}${iconName}`;

            onChange({
                library: 'icon',
                value: iconValue,
            });

            handleCloseIconPicker();
        },
        [onChange, handleCloseIconPicker]
    );

    // Load backend.css dynamically
    useEffect(() => {
        if (isIconPickerOpen) {
            if (!document.getElementById('vx-backend-css-dynamic')) {
                const existingBackendCSS = document.querySelector('link[href*="backend.css"]') as HTMLLinkElement;
                let backendCSSUrl = '';

                if (existingBackendCSS && existingBackendCSS.href) {
                    backendCSSUrl = existingBackendCSS.href;
                } else {
                    const currentUrl = window.location.origin;
                    backendCSSUrl = `${currentUrl}/wp-content/themes/voxel/assets/dist/backend.css`;
                }

                const link = document.createElement('link');
                link.id = 'vx-backend-css-dynamic';
                link.rel = 'stylesheet';
                link.href = backendCSSUrl;
                link.media = 'all';
                document.head.appendChild(link);
            }
        }
    }, [isIconPickerOpen]);

    const getActivePack = () => {
        if (!window.Voxel_Icon_Picker_Config || !activePackKey) {
            return null;
        }
        return window.Voxel_Icon_Picker_Config[activePackKey];
    };

    const activePack = getActivePack() as any;
    const activePackIcons = activePack ? (iconLists[activePackKey] || activePack.list || []) : [];

    // ========================================================================
    // RENDER HELPERS
    // ========================================================================

    const handleImageUploadChange = (newValue: { id?: number; url?: string } | undefined) => {
        if (!newValue || !newValue.url) {
            onChange({ library: '', value: '' });
        } else {
            onChange({
                library: 'svg',
                value: newValue.url,
            });
        }
    };

    // Construct buttons for ImageUploadControl
    const uploadButtons = [
        {
            label: __('Icon Library', 'voxel-fse'),
            onClick: handleOpenIconLibrary,
        },
        {
            label: __('Upload SVG', 'voxel-fse'),
            allowedTypes: ['image/svg+xml'],
        },
    ];

    // Determine if the current value is an icon class (not SVG/dynamic/empty)
    const isIconLibraryValue = normalizedValue.library !== '' &&
        normalizedValue.library !== 'svg' &&
        normalizedValue.library !== 'dynamic';

    // Build the full CSS class for icon preview
    const getIconClassName = (): string => {
        if (normalizedValue.library === 'icon') {
            // Selected via Icon Library: value is already the full class (e.g. "las la-eye")
            return normalizedValue.value;
        }
        // From template/Elementor data: library is the pack prefix (e.g. "las"), value is the icon name
        return `${normalizedValue.library} ${normalizedValue.value}`;
    };

    // Custom preview renderer
    const renderPreview = (previewValue: { url?: string }) => {
        if (isIconLibraryValue) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    minHeight: '100px',
                    color: '#495157',
                }}>
                    <i className={getIconClassName()} style={{ fontSize: '40px' }} />
                </div>
            );
        }
        return (
            <img
                src={previewValue.url}
                alt=""
                style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxHeight: '150px',
                    objectFit: 'contain',
                    padding: '10px',
                }}
            />
        );
    };

    const handleDynamicTagChange = (tagValue: string | undefined) => {
        if (tagValue) {
            onChange({ library: 'dynamic', value: tagValue });
        } else {
            onChange({ library: '', value: '' });
        }
    };

    const dynamicTagValue = normalizedValue.library === 'dynamic' ? normalizedValue.value : undefined;

    return (
        <div className="voxel-advanced-icon-control">
            <ImageUploadControl
                label={label}
                value={{ url: normalizedValue.value }}
                onChange={handleImageUploadChange}
                buttons={uploadButtons}
                renderPreview={renderPreview}
                help={help}
                responsive={false}
                enableDynamicTags={supportsDynamicTags}
                dynamicTagValue={dynamicTagValue}
                onDynamicTagChange={handleDynamicTagChange}
                dynamicTagContext={dynamicTagContext}
            />

            {/* Icon Picker Modal */}
            {isIconPickerOpen && (
                <div className="icon-picker-modal">
                    <div className="ts-modal-backdrop" onClick={handleCloseIconPicker} />
                    <div className="icons-modal ts-theme-options" ref={iconPickerRef}>
                        {activePack && activePackIcons.length > 0 ? (
                            <div className="x-row">
                                <div className="inner-tab x-col-4">
                                    <div className="x-row">
                                        <div className="ts-form-group x-col-12">
                                            <label>Search icons</label>
                                            <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search icon" />
                                        </div>
                                        <div className="x-col-12">
                                            <ul className="inner-tabs vertical-tabs">
                                                {window.Voxel_Icon_Picker_Config && Object.entries(window.Voxel_Icon_Picker_Config).map(([packKey, pack]: [string, any]) => (
                                                    <li key={packKey} className={activePackKey === packKey ? 'current-item' : ''}>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleSetPack(packKey); }}>
                                                            <i className={pack.labelIcon} />
                                                            <span>{pack.label}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="icon-list-wrapper min-scroll x-col-8">
                                    {searchQuery ? (
                                        <div className="filtered-icons">
                                            {Object.entries(searchResults).map(([packKey, icons]) => {
                                                const pack = window.Voxel_Icon_Picker_Config?.[packKey] as any;
                                                if (!pack) return null;
                                                return (
                                                    <div key={packKey}>
                                                        <code>{pack.label}</code>
                                                        <div className="icon-list">
                                                            {icons.map((iconName: string) => (
                                                                <div key={iconName} className="single-icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleIconSelect(iconName, packKey); }} title={iconName}>
                                                                    <i className={`${pack.displayPrefix} ${pack.prefix}${iconName}`} />
                                                                    <span>{iconName}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="icon-list">
                                            {activePackIcons.map((iconName: string) => (
                                                <div key={iconName} className="single-icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleIconSelect(iconName, activePackKey); }} title={iconName}>
                                                    <i className={`${activePack.displayPrefix} ${activePack.prefix}${iconName}`} />
                                                    <span>{iconName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="x-row"><div className="x-col-12"><label>{loadingIcons[activePackKey] ? __('Loading icons...', 'voxel-fse') : __('No icon packs available.', 'voxel-fse')}</label></div></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
