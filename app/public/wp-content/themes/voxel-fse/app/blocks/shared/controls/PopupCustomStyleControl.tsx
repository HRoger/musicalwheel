import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import { ColorControl, ResponsiveRangeControl, BoxShadowPopup, BorderGroupControl } from './index';

interface PopupCustomStyleControlProps {
    attributes: any;
    setAttributes: (attributes: any) => void;
    attributeNames?: {
        enable?: string;
        backdrop?: string;
        pointerEvents?: string;
        shadow?: string;
        border?: string;
        topMargin?: string;
        maxHeight?: string;
        minWidth?: string;
        maxWidth?: string;
        centerPosition?: string;
        autosuggestTopMargin?: string;
    };
    exclude?: string[];
}

export default function PopupCustomStyleControl({
    attributes,
    setAttributes,
    attributeNames = {},
    exclude = [],
}: PopupCustomStyleControlProps) {
    // Default attribute names matching Userbar implementation
    const keys = {
        enable: attributeNames.enable || 'customPopupEnable',
        backdrop: attributeNames.backdrop || 'popupBackdropColor',
        pointerEvents: attributeNames.pointerEvents || 'popupPointerEvents',
        shadow: attributeNames.shadow || 'popupBoxShadow',
        border: attributeNames.border || undefined, // No default - opt-in only
        topMargin: attributeNames.topMargin || 'popupTopMargin',
        maxHeight: attributeNames.maxHeight || 'popupMaxHeight',
        minWidth: attributeNames.minWidth || 'popupMinWidth',
        maxWidth: attributeNames.maxWidth || 'popupMaxWidth',
        centerPosition: attributeNames.centerPosition || 'popupCenterPosition',
        autosuggestTopMargin: attributeNames.autosuggestTopMargin || 'popupAutosuggestTopMargin',
    };

    const isEnabled = attributes[keys.enable];

    return (
        <>
            <ToggleControl
                label={__('Enable custom style', 'voxel-fse')}
                help={__(
                    'Enable this option to override global popup styles for this widget.',
                    'voxel-fse'
                )}
                checked={isEnabled}
                onChange={(value: boolean) =>
                    setAttributes({ [keys.enable]: value })
                }
            />

            {isEnabled && (
                <>
                    <ColorControl
                        label={__('Backdrop background', 'voxel-fse')}
                        value={attributes[keys.backdrop]}
                        onChange={(value: string | undefined) =>
                            setAttributes({ [keys.backdrop]: value ?? '' })
                        }
                    />

                    <ToggleControl
                        label={__('Enable pointer events for backdrop?', 'voxel-fse')}
                        checked={attributes[keys.pointerEvents]}
                        onChange={(value: boolean) =>
                            setAttributes({ [keys.pointerEvents]: value })
                        }
                    />

                    {!exclude.includes('centerPosition') && keys.centerPosition && attributes[keys.centerPosition] !== undefined && (
                        <ToggleControl
                            label={__('Switch position to center of screen', 'voxel-fse')}
                            checked={attributes[keys.centerPosition]}
                            onChange={(value: boolean) =>
                                setAttributes({ [keys.centerPosition]: value })
                            }
                        />
                    )}

                    <BoxShadowPopup
                        label={__('Box Shadow', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        shadowAttributeName={keys.shadow}
                    />

                    {!exclude.includes('border') && keys.border && attributes[keys.border] !== undefined && (
                        <BorderGroupControl
                            label={__('Border', 'voxel-fse')}
                            value={attributes[keys.border] || {}}
                            onChange={(value) =>
                                setAttributes({ [keys.border]: value })
                            }
                            hideRadius={true}
                        />
                    )}

                    <ResponsiveRangeControl
                        label={__('Top / Bottom margin', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        attributeBaseName={keys.topMargin}
                        min={0}
                        max={200}
                    />

                    {!exclude.includes('minWidth') && keys.minWidth && attributes[keys.minWidth] !== undefined && (
                        <ResponsiveRangeControl
                            label={__('Min width', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName={keys.minWidth}
                            min={200}
                            max={1200}
                        />
                    )}

                    {!exclude.includes('maxWidth') && keys.maxWidth && attributes[keys.maxWidth] !== undefined && (
                        <ResponsiveRangeControl
                            label={__('Max width', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName={keys.maxWidth}
                            min={200}
                            max={1200}
                        />
                    )}

                    <ResponsiveRangeControl
                        label={__('Max height', 'voxel-fse')}
                        attributes={attributes}
                        setAttributes={setAttributes}
                        attributeBaseName={keys.maxHeight}
                        min={0}
                        max={1000}
                    />

                    {!exclude.includes('autosuggestTopMargin') && keys.autosuggestTopMargin && attributes[keys.autosuggestTopMargin] !== undefined && (
                        <ResponsiveRangeControl
                            label={__('Autosuggest top margin', 'voxel-fse')}
                            attributes={attributes}
                            setAttributes={setAttributes}
                            attributeBaseName={keys.autosuggestTopMargin}
                            min={0}
                            max={100}
                        />
                    )}
                </>
            )}
        </>
    );
}
