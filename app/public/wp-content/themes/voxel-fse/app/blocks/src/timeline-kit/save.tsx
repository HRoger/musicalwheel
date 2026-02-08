/**
 * Timeline Kit Block - Save Function
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/timeline-kit.php
 * - Outputs demo timeline preview like Voxel original (8 items)
 *
 * This block outputs:
 * 1. CSS custom properties that style .vxfeed elements
 * 2. A visible demo/preview showing all styled timeline components (matching Voxel's demofeed)
 */
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateTimelineResponsiveCSS } from './generateCSS';
import Demofeed from './Demofeed';
import type { Attributes } from './types';

interface SaveProps {
	attributes: Attributes;
}

export default function save({ attributes }: SaveProps): JSX.Element {
	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || 'timeline-kit',
		baseClass: 'voxel-fse-timeline-kit',
	});

	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
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

	// Generate full responsive CSS
	const dynamicCSS = generateTimelineResponsiveCSS(attributes);

	return (
		<>
			{/* Inject dynamic styles GLOBALLY to .vxfeed elements */}
			{/* data-voxel-timeline-kit-styles: Marker for Block_Loader.php to extract and enqueue globally */}
			<style type="text/css" data-voxel-timeline-kit-styles="true">
				{dynamicCSS}
			</style>

			<div {...blockProps}>
				{/* Responsive CSS from AdvancedTab + VoxelTab */}
				{advancedProps.responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

				{/* Demo timeline preview (matching Voxel's demofeed structure 1:1) */}
				<Demofeed />
			</div>
		</>
	);
}
