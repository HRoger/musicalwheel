/**
 * Countdown Block - Save Function
 *
 * Outputs vxconfig + minimal placeholder matching Voxel HTML structure 1:1
 */
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '../../shared/utils';
import type { CountdownAttributes, CountdownConfig } from './types';

interface SaveProps {
	attributes: CountdownAttributes;
}

export default function save({ attributes }: SaveProps): JSX.Element {
	// Get blockId or use default
	const blockId = attributes.blockId || 'countdown';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-countdown',
		selectorPrefix: 'voxel-fse-countdown',
	});

	// Block props with AdvancedTab styles wired
	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
		// Headless-ready: Visibility rules configuration
		'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
		'data-visibility-rules': (attributes as any).visibilityRules?.length
			? JSON.stringify(attributes['visibilityRules'])
			: undefined,
		// Headless-ready: Loop element configuration
		'data-loop-source': attributes['loopSource'] || undefined,
		'data-loop-limit': attributes['loopLimit'] || undefined,
		'data-loop-offset': attributes['loopOffset'] || undefined,
	});

	// Build vxconfig
	const vxconfig: CountdownConfig = {
		dueDate: attributes.dueDate,
		countdownEndedText: attributes.countdownEndedText,
		hideSeconds: attributes.hideSeconds,
		hideMinutes: attributes.hideMinutes,
		hideHours: attributes.hideHours,
		hideDays: attributes.hideDays,
		disableAnimation: attributes.disableAnimation,
		horizontalOrientation: attributes.horizontalOrientation,
		itemSpacing: attributes.itemSpacing,
		itemSpacing_tablet: attributes.itemSpacing_tablet,
		itemSpacing_mobile: attributes.itemSpacing_mobile,
		itemSpacingUnit: attributes.itemSpacingUnit,
		contentSpacing: attributes.contentSpacing,
		contentSpacing_tablet: attributes.contentSpacing_tablet,
		contentSpacing_mobile: attributes.contentSpacing_mobile,
		contentSpacingUnit: attributes.contentSpacingUnit,
		textColor: attributes.textColor,
		numberColor: attributes.numberColor,
		endedColor: attributes.endedColor,
		textTypography: attributes.textTypography,
		numberTypography: attributes.numberTypography,
		endedTypography: attributes.endedTypography,
	};

	// Block wrapper with AdvancedTab + VoxelTab styles
	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab */}
			{advancedProps.responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* vxconfig JSON script tag (for frontend.js to read) */}
			<script
				type="application/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(vxconfig),
				}}
			/>

			{/* Placeholder matching Voxel HTML structure 1:1 */}
			<div className="ts-countdown-widget flexify" data-config='{"days":0,"hours":0,"minutes":0,"seconds":0,"due":0,"now":0}'>
				<ul className="countdown-timer flexify simplify-ul" style={{ display: 'none' }}>
					<li><span className="timer-days">0</span><p>Days</p></li>
					<li><span className="timer-hours">0</span><p>Hours</p></li>
					<li><span className="timer-minutes">0</span><p>Minutes</p></li>
					<li><span className="timer-seconds">0</span><p>Seconds</p></li>
				</ul>
				<div className="countdown-ended" style={{ display: 'none' }}>
					{attributes.countdownEndedText}
				</div>
			</div>
		</div>
	);
}
