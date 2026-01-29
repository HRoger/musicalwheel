import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import { WorkHoursAttributes } from './types';
import WorkHoursComponent from './shared/WorkHoursComponent';
import { InspectorTabs, EmptyPlaceholder } from '@shared/controls';
import { ContentTab } from './inspector';
import { generateWorkHoursResponsiveCSS } from './styles';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import './editor.css';

interface EditProps {
  attributes: WorkHoursAttributes;
  setAttributes: (attrs: Partial<WorkHoursAttributes>) => void;
  clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
  const blockId = attributes.blockId || clientId;

  // Set blockId if not set
  useEffect(() => {
    if (!attributes.blockId) {
      setAttributes({ blockId: clientId });
    }
  }, [attributes.blockId, clientId, setAttributes]);

  // Use shared utility for AdvancedTab + VoxelTab wiring
  const advancedProps = getAdvancedVoxelTabProps(attributes, {
    blockId,
    baseClass: `ts-work-hours ${attributes.collapse}`,
    selectorPrefix: 'voxel-fse-work-hours',
  });

  // Generate work-hours-specific responsive CSS with useMemo for performance
  const workHoursResponsiveCSS = useMemo(
    () => generateWorkHoursResponsiveCSS(attributes, blockId),
    [attributes, blockId]
  );

  // Combine all responsive CSS
  // Layer 1 (AdvancedTab) + Layer 2 (Block-specific)
  const combinedResponsiveCSS = useMemo(
    () => [advancedProps.responsiveCSS, workHoursResponsiveCSS].filter(Boolean).join('\n'),
    [advancedProps.responsiveCSS, workHoursResponsiveCSS]
  );

  const blockProps = useBlockProps({
    id: advancedProps.elementId,
    className: `${advancedProps.className} voxel-fse-work-hours-${blockId}`,
    style: advancedProps.styles,
    ...advancedProps.customAttrs,
  });

  // Check if source field is selected
  const hasSourceField = Boolean(attributes.sourceField);

  return (
    <div {...blockProps}>
      {/* Output combined responsive CSS */}
      {combinedResponsiveCSS && (
        <style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
      )}

      <InspectorControls>
        <InspectorTabs
          tabs={[
            {
              id: 'content',
              label: __('Content', 'voxel-fse'),
              icon: '\ue92c', // eicon-edit
              render: () => (
                <ContentTab
                  attributes={attributes}
                  setAttributes={setAttributes}
                />
              ),
            },
          ]}
          includeAdvancedTab={true}
          includeVoxelTab={true}
          attributes={attributes}
          setAttributes={setAttributes}
          defaultTab="content"
          activeTabAttribute="workHoursActiveTab"
        />
      </InspectorControls>

      {/* Block Preview - show placeholder when no source field selected */}
      {hasSourceField ? (
        <WorkHoursComponent attributes={attributes} isPreview={true} />
      ) : (
        <EmptyPlaceholder />
      )}
    </div>
  );
}
