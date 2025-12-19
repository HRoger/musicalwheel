import { useBlockProps, InspectorControls, useInnerBlocksProps, PanelColorSettings } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ButtonGroup,
    Button,
    RangeControl,
    BaseControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';

// Import Shared Controls
import {
    ResponsiveRangeControlWithDropdown,
    AdvancedTab,
    BoxShadowControl,
    BoxShadowValue,
    ResponsiveDropdownButton,
    UnitDropdownButton,
} from '../shared/controls';

// Import style generation utility
import { generateContainerStyles, type FlexContainerAttributes } from './styles';

// Define Main Tabs
const TABS = {
    GENERAL: 'general',
    ADVANCED: 'advanced',
};

type DeviceType = 'desktop' | 'tablet' | 'mobile';

// SVG Icons for Flex Direction
const FlexDirectionIcons = {
    row: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10l4-4v3h8V6l4 4-4 4v-3H6v3z"/>
        </svg>
    ),
    column: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2l4 4h-3v8h3l-4 4-4-4h3V6H6z"/>
        </svg>
    ),
    'row-reverse': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M18 10l-4-4v3H6V6l-4 4 4 4v-3h8v3z"/>
        </svg>
    ),
    'column-reverse': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 18l4-4h-3V6h3l-4-4-4 4h3v8H6z"/>
        </svg>
    ),
};

// SVG Icons for Justify Content
const JustifyContentIcons = {
    'flex-start': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="4" width="2" height="12"/>
            <rect x="6" y="6" width="3" height="8"/>
            <rect x="11" y="6" width="3" height="8"/>
        </svg>
    ),
    'center': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="5" y="6" width="3" height="8"/>
            <rect x="9" y="4" width="2" height="12"/>
            <rect x="12" y="6" width="3" height="8"/>
        </svg>
    ),
    'flex-end': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="6" y="6" width="3" height="8"/>
            <rect x="11" y="6" width="3" height="8"/>
            <rect x="16" y="4" width="2" height="12"/>
        </svg>
    ),
    'space-between': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="4" width="2" height="12"/>
            <rect x="5" y="6" width="3" height="8"/>
            <rect x="12" y="6" width="3" height="8"/>
            <rect x="16" y="4" width="2" height="12"/>
        </svg>
    ),
    'space-around': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="6" width="3" height="8"/>
            <rect x="9" y="4" width="2" height="12" opacity="0.3"/>
            <rect x="13" y="6" width="3" height="8"/>
        </svg>
    ),
    'space-evenly': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="6" width="3" height="8"/>
            <rect x="8.5" y="6" width="3" height="8"/>
            <rect x="15" y="6" width="3" height="8"/>
        </svg>
    ),
};

// SVG Icons for Align Items
const AlignItemsIcons = {
    'flex-start': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="2" width="12" height="2"/>
            <rect x="5" y="5" width="3" height="6"/>
            <rect x="12" y="5" width="3" height="8"/>
        </svg>
    ),
    'center': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="9" width="12" height="2" opacity="0.3"/>
            <rect x="5" y="7" width="3" height="6"/>
            <rect x="12" y="5" width="3" height="10"/>
        </svg>
    ),
    'flex-end': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="16" width="12" height="2"/>
            <rect x="5" y="9" width="3" height="6"/>
            <rect x="12" y="7" width="3" height="8"/>
        </svg>
    ),
    'stretch': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="2" width="12" height="2"/>
            <rect x="5" y="5" width="3" height="10"/>
            <rect x="12" y="5" width="3" height="10"/>
            <rect x="4" y="16" width="12" height="2"/>
        </svg>
    ),
    'baseline': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="4" y="10" width="12" height="1" opacity="0.5"/>
            <rect x="5" y="4" width="3" height="8"/>
            <rect x="12" y="8" width="3" height="8"/>
        </svg>
    ),
};

// SVG Icons for Flex Wrap
const FlexWrapIcons = {
    'nowrap': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="8" width="16" height="4"/>
            <path d="M15 6l3 4-3 4V6z"/>
        </svg>
    ),
    'wrap': (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="3" width="6" height="3"/>
            <rect x="10" y="3" width="6" height="3"/>
            <rect x="2" y="8" width="6" height="3"/>
            <rect x="10" y="8" width="6" height="3"/>
            <rect x="2" y="13" width="6" height="3"/>
        </svg>
    ),
};

// Reset Icon - Dashicon
const ResetIcon = () => (
    <span className="dashicons dashicons-image-rotate" style={{ fontSize: '14px', width: '14px', height: '14px' }} />
);

interface EditProps {
    attributes: Record<string, any>;
    setAttributes: (attrs: Partial<EditProps['attributes']>) => void;
}

// Responsive Icon Button Group Component
interface ResponsiveIconButtonGroupProps {
    label: string;
    attributeBaseName: string;
    attributes: Record<string, any>;
    setAttributes: (attrs: Record<string, any>) => void;
    options: { value: string; icon: React.ReactNode; label: string }[];
    note?: string;
}

function ResponsiveIconButtonGroup({
    label,
    attributeBaseName,
    attributes,
    setAttributes,
    options,
    note,
}: ResponsiveIconButtonGroupProps) {
    // Get WordPress's current device type
    const wpDeviceType = useSelect((select) => {
        const editPostStore = select('core/edit-post');
        if (editPostStore && typeof (editPostStore as any).getPreviewDeviceType === 'function') {
            return (editPostStore as any).getPreviewDeviceType();
        }
        const editorStore = select('core/editor');
        if (editorStore && typeof (editorStore as any).getDeviceType === 'function') {
            return (editorStore as any).getDeviceType();
        }
        return 'Desktop';
    }, []);

    const wpDevice = wpDeviceType ? wpDeviceType.toLowerCase() as DeviceType : 'desktop';
    const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

    useEffect(() => {
        if (wpDeviceType) {
            setCurrentDevice(wpDevice);
        }
    }, [wpDeviceType, wpDevice]);

    // Get attribute name for current device
    const getAttributeName = () => {
        if (currentDevice === 'desktop') return attributeBaseName;
        return `${attributeBaseName}_${currentDevice}`;
    };

    // Get current value with inheritance
    const getValue = () => {
        const attrName = getAttributeName();
        let value = attributes[attrName];

        if (value === undefined || value === null) {
            if (currentDevice === 'tablet') {
                return attributes[attributeBaseName];
            } else if (currentDevice === 'mobile') {
                const tabletValue = attributes[`${attributeBaseName}_tablet`];
                return tabletValue !== undefined ? tabletValue : attributes[attributeBaseName];
            }
        }

        return value;
    };

    // Set value for current device
    const setValue = (newValue: string) => {
        const attrName = getAttributeName();
        setAttributes({ [attrName]: newValue });
    };

    // Reset value
    const resetValue = () => {
        const attrName = getAttributeName();
        setAttributes({ [attrName]: undefined });
    };

    const currentValue = getValue();

    return (
        <div className="voxel-fse-responsive-icon-group" style={{ marginBottom: '16px' }}>
            {/* Header with label, responsive toggle, and reset */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, color: '#1e1e1e' }}>
                        {label}
                    </span>
                    <ResponsiveDropdownButton
                        currentDevice={currentDevice}
                        onDeviceChange={setCurrentDevice}
                    />
                </div>
                <Button
                    icon={<ResetIcon />}
                    label={__('Reset', 'voxel-fse')}
                    onClick={resetValue}
                    variant="tertiary"
                    size="small"
                    style={{ minWidth: 'auto', padding: '4px' }}
                />
            </div>

            {/* Icon Buttons */}
            <ButtonGroup style={{ display: 'flex', width: '100%', gap: '4px' }}>
                {options.map((opt) => (
                    <Button
                        key={opt.value}
                        onClick={() => setValue(opt.value)}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            minWidth: '36px',
                            height: '36px',
                            padding: '0',
                            backgroundColor: currentValue === opt.value ? '#2271b1' : '#f0f0f1',
                            color: currentValue === opt.value ? '#ffffff' : '#1e1e1e',
                            borderColor: currentValue === opt.value ? '#2271b1' : '#dcdcde',
                            transition: 'all 0.2s ease',
                        }}
                        label={opt.label}
                        showTooltip
                    >
                        {opt.icon}
                    </Button>
                ))}
            </ButtonGroup>

            {/* Note text */}
            {note && (
                <p style={{
                    fontSize: '12px',
                    color: '#757575',
                    marginTop: '8px',
                    marginBottom: '0',
                    fontStyle: 'italic',
                }}>
                    {note}
                </p>
            )}
        </div>
    );
}

export default function Edit({ attributes, setAttributes }: EditProps) {
    const [activeTab, setActiveTab] = useState(TABS.GENERAL);

    // Generate stable block ID once
    useEffect(() => {
        if (!attributes.blockId) {
            const newBlockId = Math.random().toString(36).substring(2, 10);
            setAttributes({ blockId: newBlockId });
        }
    }, []);

    // Generate container styles from attributes
    const containerStyles = useMemo(
        () => generateContainerStyles(attributes as FlexContainerAttributes),
        [attributes]
    );

    // Apply styles to the block wrapper itself
    const blockProps = useBlockProps({
        className: `voxel-fse-flex-container ${attributes.customClasses || ''}`.trim(),
        style: containerStyles,
    });

    // Inner blocks without additional styles (parent handles flex)
    const innerBlocksProps = useInnerBlocksProps(blockProps, {});

    // Container Width Options
    const containerWidthOptions = [
        { label: __('Full', 'voxel-fse'), value: 'full' },
        { label: __('Wide', 'voxel-fse'), value: 'wide' },
        { label: __('None', 'voxel-fse'), value: 'none' },
        { label: __('Custom', 'voxel-fse'), value: 'custom' },
    ];

    // Content Width Options
    const contentWidthOptions = [
        { label: __('Boxed', 'voxel-fse'), value: 'boxed' },
        { label: __('Full Width', 'voxel-fse'), value: 'full' },
    ];

    // Flex Direction Options with icons
    const flexDirectionOptions = [
        { value: 'row', icon: FlexDirectionIcons.row, label: __('Row', 'voxel-fse') },
        { value: 'column', icon: FlexDirectionIcons.column, label: __('Column', 'voxel-fse') },
        { value: 'row-reverse', icon: FlexDirectionIcons['row-reverse'], label: __('Row Reverse', 'voxel-fse') },
        { value: 'column-reverse', icon: FlexDirectionIcons['column-reverse'], label: __('Column Reverse', 'voxel-fse') },
    ];

    // Justify Content Options with icons
    const justifyContentOptions = [
        { value: 'flex-start', icon: JustifyContentIcons['flex-start'], label: __('Start', 'voxel-fse') },
        { value: 'center', icon: JustifyContentIcons['center'], label: __('Center', 'voxel-fse') },
        { value: 'flex-end', icon: JustifyContentIcons['flex-end'], label: __('End', 'voxel-fse') },
        { value: 'space-between', icon: JustifyContentIcons['space-between'], label: __('Space Between', 'voxel-fse') },
        { value: 'space-around', icon: JustifyContentIcons['space-around'], label: __('Space Around', 'voxel-fse') },
        { value: 'space-evenly', icon: JustifyContentIcons['space-evenly'], label: __('Space Evenly', 'voxel-fse') },
    ];

    // Align Items Options with icons
    const alignItemsOptions = [
        { value: 'flex-start', icon: AlignItemsIcons['flex-start'], label: __('Start', 'voxel-fse') },
        { value: 'center', icon: AlignItemsIcons['center'], label: __('Center', 'voxel-fse') },
        { value: 'flex-end', icon: AlignItemsIcons['flex-end'], label: __('End', 'voxel-fse') },
        { value: 'stretch', icon: AlignItemsIcons['stretch'], label: __('Stretch', 'voxel-fse') },
        { value: 'baseline', icon: AlignItemsIcons['baseline'], label: __('Baseline', 'voxel-fse') },
    ];

    // Flex Wrap Options with icons
    const flexWrapOptions = [
        { value: 'nowrap', icon: FlexWrapIcons['nowrap'], label: __('No Wrap', 'voxel-fse') },
        { value: 'wrap', icon: FlexWrapIcons['wrap'], label: __('Wrap', 'voxel-fse') },
    ];

    return (
        <div {...innerBlocksProps}>
            <InspectorControls>
                {/* Main Tab Switcher */}
                <div className="voxel-section-header" style={{ marginBottom: 15, padding: '10px 10px 0' }}>
                    <ButtonGroup style={{ width: '100%', display: 'flex', gap: '4px' }}>
                        <Button
                            isPressed={activeTab === TABS.GENERAL}
                            onClick={() => setActiveTab(TABS.GENERAL)}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                backgroundColor: activeTab === TABS.GENERAL ? '#2271b1' : '#f0f0f1',
                                color: activeTab === TABS.GENERAL ? '#ffffff' : '#1e1e1e',
                                borderColor: activeTab === TABS.GENERAL ? '#2271b1' : '#dcdcde',
                                fontWeight: activeTab === TABS.GENERAL ? 600 : 400,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {__('General', 'voxel-fse')}
                        </Button>
                        <Button
                            isPressed={activeTab === TABS.ADVANCED}
                            onClick={() => setActiveTab(TABS.ADVANCED)}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                backgroundColor: activeTab === TABS.ADVANCED ? '#2271b1' : '#f0f0f1',
                                color: activeTab === TABS.ADVANCED ? '#ffffff' : '#1e1e1e',
                                borderColor: activeTab === TABS.ADVANCED ? '#2271b1' : '#dcdcde',
                                fontWeight: activeTab === TABS.ADVANCED ? 600 : 400,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {__('Advanced', 'voxel-fse')}
                        </Button>
                    </ButtonGroup>
                </div>

                {/* GENERAL TAB */}
                {activeTab === TABS.GENERAL && (
                    <>
                        <PanelBody title={__('Container', 'voxel-fse')} initialOpen={true}>
                            {/* Container Width - Button Group */}
                            <BaseControl
                                label={__('Container Width', 'voxel-fse')}
                                __nextHasNoMarginBottom
                            >
                                <ButtonGroup style={{ display: 'flex', width: '100%', marginTop: '8px', gap: '4px' }}>
                                    {containerWidthOptions.map((opt) => (
                                        <Button
                                            key={opt.value}
                                            onClick={() => setAttributes({ containerWidth: opt.value })}
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                backgroundColor: attributes.containerWidth === opt.value ? '#2271b1' : '#f0f0f1',
                                                color: attributes.containerWidth === opt.value ? '#ffffff' : '#1e1e1e',
                                                borderColor: attributes.containerWidth === opt.value ? '#2271b1' : '#dcdcde',
                                                fontWeight: attributes.containerWidth === opt.value ? 600 : 400,
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            </BaseControl>

                            {/* Custom Container Width - Show responsive controls when "custom" is selected */}
                            {attributes.containerWidth === 'custom' && (
                                <div style={{ marginTop: '16px' }}>
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Container Width', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="customContainerWidth"
                                        min={0}
                                        max={2000}
                                        availableUnits={['px', '%', 'vw']}
                                        unitAttributeName="customContainerWidthUnit"
                                        showResetButton={true}
                                    />
                                </div>
                            )}

                            {/* Content Width - Toggle + Slider */}
                            <div style={{ marginTop: '16px' }}>
                                <BaseControl
                                    label={__('Content Width', 'voxel-fse')}
                                    __nextHasNoMarginBottom
                                >
                                    <ButtonGroup style={{ display: 'flex', width: '100%', marginTop: '8px', marginBottom: '12px', gap: '4px' }}>
                                        {contentWidthOptions.map((opt) => (
                                            <Button
                                                key={opt.value}
                                                onClick={() => setAttributes({ contentWidthType: opt.value })}
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    backgroundColor: attributes.contentWidthType === opt.value ? '#2271b1' : '#f0f0f1',
                                                    color: attributes.contentWidthType === opt.value ? '#ffffff' : '#1e1e1e',
                                                    borderColor: attributes.contentWidthType === opt.value ? '#2271b1' : '#dcdcde',
                                                    fontWeight: attributes.contentWidthType === opt.value ? 600 : 400,
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {opt.label}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </BaseControl>

                                {attributes.contentWidthType !== 'full' && (
                                    <ResponsiveRangeControlWithDropdown
                                        label={__('Content Width', 'voxel-fse')}
                                        attributes={attributes}
                                        setAttributes={setAttributes}
                                        attributeBaseName="contentWidth"
                                        min={0}
                                        max={2000}
                                        availableUnits={['px', '%', 'vw']}
                                        unitAttributeName="contentWidthUnit"
                                        showResetButton={true}
                                    />
                                )}
                            </div>

                            <ResponsiveRangeControlWithDropdown
                                label={__('Min Height', 'voxel-fse')}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                attributeBaseName="minHeight"
                                min={0}
                                max={1000}
                                availableUnits={['px', 'vh', 'em']}
                                unitAttributeName="minHeightUnit"
                                showResetButton={true}
                            />

                            <SelectControl
                                label={__('HTML Tag', 'voxel-fse')}
                                value={attributes.htmlTag}
                                options={[
                                    { label: 'div', value: 'div' },
                                    { label: 'section', value: 'section' },
                                    { label: 'header', value: 'header' },
                                    { label: 'footer', value: 'footer' },
                                    { label: 'main', value: 'main' },
                                    { label: 'article', value: 'article' },
                                    { label: 'aside', value: 'aside' },
                                    { label: 'nav', value: 'nav' },
                                ]}
                                onChange={(value) => setAttributes({ htmlTag: value })}
                                __nextHasNoMarginBottom
                            />

                            <SelectControl
                                label={__('Overflow', 'voxel-fse')}
                                value={attributes.overflow}
                                options={[
                                    { label: __('Visible', 'voxel-fse'), value: 'visible' },
                                    { label: __('Hidden', 'voxel-fse'), value: 'hidden' },
                                    { label: __('Scroll', 'voxel-fse'), value: 'scroll' },
                                    { label: __('Auto', 'voxel-fse'), value: 'auto' },
                                ]}
                                onChange={(value) => setAttributes({ overflow: value })}
                                __nextHasNoMarginBottom
                            />
                        </PanelBody>

                        <PanelBody title={__('Layouts', 'voxel-fse')} initialOpen={true}>
                            {/* Flex Direction */}
                            <ResponsiveIconButtonGroup
                                label={__('Flex Direction', 'voxel-fse')}
                                attributeBaseName="flexDirection"
                                attributes={attributes}
                                setAttributes={setAttributes}
                                options={flexDirectionOptions}
                            />

                            {/* Justify Content */}
                            <ResponsiveIconButtonGroup
                                label={__('Justify Content', 'voxel-fse')}
                                attributeBaseName="justifyContent"
                                attributes={attributes}
                                setAttributes={setAttributes}
                                options={justifyContentOptions}
                            />

                            {/* Align Items */}
                            <ResponsiveIconButtonGroup
                                label={__('Align Items', 'voxel-fse')}
                                attributeBaseName="alignItems"
                                attributes={attributes}
                                setAttributes={setAttributes}
                                options={alignItemsOptions}
                            />

                            {/* Flex Wrap */}
                            <ResponsiveIconButtonGroup
                                label={__('Flex Wrap', 'voxel-fse')}
                                attributeBaseName="flexWrap"
                                attributes={attributes}
                                setAttributes={setAttributes}
                                options={flexWrapOptions}
                                note={__('Note: Items within the container can stay in a single line (No Wrap) or break into multiple lines (Wrap).', 'voxel-fse')}
                            />

                            {/* Column Gap */}
                            <ResponsiveRangeControlWithDropdown
                                label={__('Column Gap', 'voxel-fse')}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                attributeBaseName="columnGap"
                                min={0}
                                max={200}
                                availableUnits={['px', 'em', '%']}
                                unitAttributeName="columnGapUnit"
                                showResetButton={true}
                            />

                            {/* Row Gap */}
                            <ResponsiveRangeControlWithDropdown
                                label={__('Row Gap', 'voxel-fse')}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                attributeBaseName="rowGap"
                                min={0}
                                max={200}
                                availableUnits={['px', 'em', '%']}
                                unitAttributeName="rowGapUnit"
                                showResetButton={true}
                            />
                        </PanelBody>
                    </>
                )}

                {/* ADVANCED TAB */}
                {activeTab === TABS.ADVANCED && (
                    <>
                        <PanelColorSettings
                            title={__('Background', 'voxel-fse')}
                            initialOpen={true}
                            colorSettings={[
                                {
                                    value: attributes.backgroundColor,
                                    onChange: (value) => setAttributes({ backgroundColor: value }),
                                    label: __('Background Color', 'voxel-fse'),
                                }
                            ]}
                        />

                        <PanelBody title={__('Border', 'voxel-fse')} initialOpen={false}>
                            <SelectControl
                                label={__('Border Type', 'voxel-fse')}
                                value={attributes.border?.style || 'none'}
                                options={[
                                    { label: __('None', 'voxel-fse'), value: 'none' },
                                    { label: __('Solid', 'voxel-fse'), value: 'solid' },
                                    { label: __('Dashed', 'voxel-fse'), value: 'dashed' },
                                    { label: __('Dotted', 'voxel-fse'), value: 'dotted' },
                                    { label: __('Double', 'voxel-fse'), value: 'double' },
                                ]}
                                onChange={(val) => setAttributes({
                                    border: { ...attributes.border, style: val }
                                })}
                                __nextHasNoMarginBottom
                            />
                            {attributes.border?.style && attributes.border.style !== 'none' && (
                                <>
                                    <RangeControl
                                        label={__('Width', 'voxel-fse')}
                                        value={attributes.border?.width || 0}
                                        onChange={(val) => setAttributes({
                                            border: { ...attributes.border, width: val }
                                        })}
                                        min={0}
                                        max={50}
                                        __nextHasNoMarginBottom
                                    />
                                    <PanelColorSettings
                                        title={__('Border Color', 'voxel-fse')}
                                        initialOpen={false}
                                        colorSettings={[{
                                            value: attributes.border?.color,
                                            onChange: (val) => setAttributes({
                                                border: { ...attributes.border, color: val }
                                            }),
                                            label: __('Color', 'voxel-fse'),
                                        }]}
                                    />
                                </>
                            )}

                            <ResponsiveRangeControlWithDropdown
                                label={__('Border Radius', 'voxel-fse')}
                                attributes={attributes}
                                setAttributes={setAttributes}
                                attributeBaseName="borderRadius"
                                min={0}
                                max={200}
                                availableUnits={['px', '%']}
                                unitAttributeName="borderRadiusUnit"
                                showResetButton={true}
                            />
                        </PanelBody>

                        <BoxShadowControl
                            label={__('Box Shadow', 'voxel-fse')}
                            value={attributes.boxShadow}
                            onChange={(val: BoxShadowValue) => setAttributes({ boxShadow: val })}
                        />

                        <AdvancedTab
                            attributes={attributes}
                            setAttributes={setAttributes}
                        />
                    </>
                )}

            </InspectorControls>

            {/* Inner blocks render as children */}
            {innerBlocksProps.children}
        </div>
    );
}
