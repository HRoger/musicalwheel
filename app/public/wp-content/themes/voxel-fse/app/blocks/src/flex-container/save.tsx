import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { generateContainerStyles, generateResponsiveCSS, type FlexContainerAttributes } from './styles';

interface SaveProps {
    attributes: Record<string, any>;
}

export default function Save({ attributes }: SaveProps) {
    // Generate unique block ID from className or fallback
    const blockId = attributes.anchor || Math.random().toString(36).substring(2, 10);

    // Generate styles
    const containerStyles = generateContainerStyles(attributes as FlexContainerAttributes);
    const responsiveCSS = generateResponsiveCSS(attributes as FlexContainerAttributes, blockId);

    const blockProps = useBlockProps.save({
        className: `voxel-fse-flex-container-${blockId} ${attributes.customClasses || ''}`.trim(),
        style: containerStyles,
    });

    const innerBlocksProps = useInnerBlocksProps.save(blockProps);

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
                    __html: JSON.stringify(attributes),
                }}
            />
            {innerBlocksProps.children}
        </div>
    );
}
