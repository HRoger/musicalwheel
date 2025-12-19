import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { generateContainerStyles, generateResponsiveCSS, type FlexContainerAttributes } from './styles';

interface SaveProps {
    attributes: Record<string, any>;
}

export default function Save({ attributes }: SaveProps) {
    // Use stable block ID from attributes (generated once in edit)
    const blockId = attributes.blockId || attributes.anchor || 'flex-container';

    // Generate styles
    const containerStyles = generateContainerStyles(attributes as FlexContainerAttributes);
    const responsiveCSS = generateResponsiveCSS(attributes as FlexContainerAttributes, blockId);

    const blockProps = useBlockProps.save({
        className: `voxel-fse-flex-container-${blockId} ${attributes.customClasses || ''}`.trim(),
        style: containerStyles,
    });

    const innerBlocksProps = useInnerBlocksProps.save(blockProps);

    // Sort attributes keys to ensure consistent JSON output
    const sortedAttributes = Object.keys(attributes)
        .sort()
        .reduce((acc, key) => {
            acc[key] = attributes[key];
            return acc;
        }, {} as Record<string, any>);

    return (
        <div {...innerBlocksProps}>
            {/* Responsive CSS styles */}
            {responsiveCSS && (
                <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
            )}
            {/* Block config for headless/API usage */}
            <script
                className="vxconfig"
                type="application/json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(sortedAttributes),
                }}
            />
            {innerBlocksProps.children}
        </div>
    );
}
