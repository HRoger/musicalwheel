import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import {
    generateContainerStyles,
    generateInnerStyles,
    generateResponsiveCSS,
    generateInnerResponsiveCSS,
    type FlexContainerAttributes,
} from './styles';

// Import shared style utilities for AdvancedTab/VoxelTab attributes
import {
    generateAdvancedStyles,
    generateAdvancedResponsiveCSS,
    combineBlockClasses,
    parseCustomAttributes,
} from '../../shared/utils/generateAdvancedStyles';

// Import background elements rendering utilities
import { renderBackgroundElements } from '../../shared/utils/backgroundElements';

interface SaveProps {
    attributes: Record<string, any>;
}

export default function Save({ attributes }: SaveProps) {
    // Use stable block ID from attributes (generated once in edit)
    const blockId = attributes.blockId || attributes.anchor || 'flex-container';
    const uniqueSelector = `.voxel-fse-flex-container-${blockId}`;

    // Generate OUTER container styles (position, min-height, backdrop, etc.)
    const containerStyles = generateContainerStyles(attributes as FlexContainerAttributes);
    const containerResponsiveCSS = generateResponsiveCSS(attributes as FlexContainerAttributes, blockId);

    // Generate INNER wrapper styles (flex/grid, max-width, gaps)
    const innerStyles = generateInnerStyles(attributes as FlexContainerAttributes);
    const innerResponsiveCSS = generateInnerResponsiveCSS(attributes as FlexContainerAttributes, blockId);

    // Generate advanced styles from AdvancedTab/BackgroundControl attributes
    const advancedStyles = generateAdvancedStyles(attributes);
    const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);

    // Merge styles for OUTER container: advancedStyles provides base, containerStyles overrides
    const mergedStyles = { ...advancedStyles, ...containerStyles };

    // Combine responsive CSS (advanced first, then container outer, then inner)
    const combinedResponsiveCSS = [advancedResponsiveCSS, containerResponsiveCSS, innerResponsiveCSS]
        .filter(Boolean)
        .join('\n');

    // Parse custom attributes (key|value format from AdvancedTab)
    const customAttrs = parseCustomAttributes(attributes.customAttributes);

    // OUTER container block props (backgrounds, position, min-height)
    const blockProps = useBlockProps.save({
        // Use elementId if provided (CSS ID from AdvancedTab), otherwise use blockId
        id: attributes.elementId || undefined,
        className: combineBlockClasses(
            `voxel-fse-flex-container voxel-fse-flex-container-${blockId}`,
            attributes
        ),
        style: mergedStyles,
        // Headless-ready: Visibility rules configuration
        'data-visibility-behavior': attributes.visibilityBehavior || undefined,
        'data-visibility-rules': attributes.visibilityRules?.length
            ? JSON.stringify(attributes.visibilityRules)
            : undefined,
        // Headless-ready: Loop element configuration
        'data-loop-source': attributes.loopSource || undefined,
        'data-loop-property': attributes.loopProperty || undefined,
        'data-loop-limit': attributes.loopLimit || undefined,
        'data-loop-offset': attributes.loopOffset || undefined,
        // Entrance animation (attribute names match MotionEffectsControls)
        'data-animation': attributes.entranceAnimation || undefined,
        'data-animation-duration': attributes.animationDuration || undefined,
        'data-animation-delay': attributes.animationDelay ? `${attributes.animationDelay}` : undefined,
        ...customAttrs,
    });

    // INNER wrapper props for inner blocks (flex/grid layout, max-width)
    const innerBlocksProps = useInnerBlocksProps.save({
        className: 'e-con-inner',
        style: innerStyles,
    });

    // Sort attributes keys to ensure consistent JSON output
    const sortedAttributes = Object.keys(attributes)
        .sort()
        .reduce((acc, key) => {
            acc[key] = attributes[key];
            return acc;
        }, {} as Record<string, any>);

    return (
        <div {...blockProps}>
            {/* Responsive CSS styles (AdvancedTab + container outer + inner) */}
            {combinedResponsiveCSS && (
                <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
            )}
            {/* Block config for headless/API usage */}
            <script
                className="vxconfig"
                type="application/json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(sortedAttributes),
                }}
            />
            {/* Background elements: video, slideshow, overlay, shape dividers - on outer container */}
            {renderBackgroundElements(attributes, false, undefined, undefined, uniqueSelector)}
            {/* Inner content wrapper with flex/grid layout and max-width constraint */}
            {/* This matches Elementor's .e-con-inner structure */}
            <div {...innerBlocksProps} />
        </div>
    );
}
