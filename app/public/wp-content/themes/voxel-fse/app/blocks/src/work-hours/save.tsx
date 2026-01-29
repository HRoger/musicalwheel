import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { WorkHoursAttributes, VxConfig } from './types';
import { generateWorkHoursResponsiveCSS } from './styles';

interface Props {
  attributes: WorkHoursAttributes;
}

export default function save({ attributes }: Props) {
  const blockId = attributes.blockId || 'work-hours';

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: `ts-work-hours ${attributes.collapse}`,
  });

  // Generate work-hours-specific responsive CSS
  const workHoursResponsiveCSS = generateWorkHoursResponsiveCSS(attributes, blockId);

  // Combine all responsive CSS
  // Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
  const combinedResponsiveCSS = [advancedProps.responsiveCSS, workHoursResponsiveCSS]
    .filter(Boolean)
    .join('\n');

  const blockProps = useBlockProps.save({
    id: advancedProps.elementId,
    className: `${advancedProps.className} voxel-fse-work-hours-${blockId}`,
    style: advancedProps.styles,
    // Headless-ready: Visibility rules configuration
    'data-visibility-behavior': attributes.visibilityBehavior || undefined,
    'data-visibility-rules': attributes.visibilityRules?.length
      ? JSON.stringify(attributes.visibilityRules)
      : undefined,
    // Headless-ready: Loop element configuration
    'data-loop-source': attributes.loopSource || undefined,
    'data-loop-limit': attributes.loopLimit || undefined,
    'data-loop-offset': attributes.loopOffset || undefined,
    ...advancedProps.customAttrs,
  });

  // Build vxConfig for frontend hydration
  const vxConfig: VxConfig = {
    attributes,
    postId: (window as any).__post_id,
    fieldKey: attributes.sourceField,
  };

  return (
    <div {...blockProps}>
      {/* Responsive CSS from AdvancedTab + VoxelTab + Content Tab */}
      {combinedResponsiveCSS && (
        <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
      )}

      {/* Background elements: video, slideshow, overlay, shape dividers */}
      {renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
      />
      <div className="voxel-fse-work-hours-placeholder">
        {/* Placeholder for React hydration - content will be rendered by frontend.tsx */}
      </div>
    </div>
  );
}
