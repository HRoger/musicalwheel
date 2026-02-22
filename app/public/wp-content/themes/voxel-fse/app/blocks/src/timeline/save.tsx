/**
 * Timeline Block - Save Function
 *
 * Outputs vxconfig JSON for Voxel's Vue.js hydration.
 * Structure matches: themes/voxel/templates/widgets/timeline.php
 *
 * Note: This is a Vue-compatible hybrid approach, NOT full Plan C+.
 * The frontend uses Voxel's existing Vue infrastructure for the timeline.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { SaveProps, TimelineAttributes } from './types';
import type { IconValue } from '@shared/controls/IconPickerControl';

/**
 * Convert IconValue to icon markup string
 * Returns empty string if no icon selected (Voxel will use defaults)
 */
function getIconMarkup(icon: IconValue | null): string {
	if (!icon || !icon.library || !icon.value) {
		return '';
	}

	if (icon.library === 'svg') {
		// SVG URL - needs to be fetched and inlined by frontend
		return `<img src="${icon.value}" class="ts-svg-icon" alt="" />`;
	}

	if (icon.library === 'icon') {
		// Icon class
		return `<i class="${icon.value}"></i>`;
	}

	return '';
}

/**
 * Build vxconfig for block attributes (editor-set values only)
 * Server-side values (user context, settings, etc.) are added by frontend.tsx
 */
function buildVxConfig(attributes: TimelineAttributes) {
	return {
		// Timeline mode from block settings
		timeline: {
			mode: attributes.mode,
		},
		// Block-level settings
		block_settings: {
			no_status_text: attributes.noStatusText,
			search_enabled: attributes.searchEnabled,
			search_value: attributes.searchValue,
			ordering_options: attributes.orderingOptions.map((opt) => ({
				_id: opt._id,
				label: opt.label,
				order: opt.order,
				time: opt.time,
				time_custom: opt.timeCustom,
			})),
		},
	};
}

/**
 * Build icons config for vxconfig__icons script
 * Empty strings mean Voxel will use its default SVG icons
 */
function buildIconsConfig(attributes: TimelineAttributes) {
	return {
		verified: getIconMarkup(attributes.verifiedIcon),
		repost: getIconMarkup(attributes.repostIcon),
		more: getIconMarkup(attributes.moreIcon),
		like: getIconMarkup(attributes.likeIcon),
		liked: getIconMarkup(attributes.likedIcon),
		comment: getIconMarkup(attributes.commentIcon),
		reply: getIconMarkup(attributes.replyIcon),
		gallery: getIconMarkup(attributes.galleryIcon),
		upload: getIconMarkup(attributes.uploadIcon),
		emoji: getIconMarkup(attributes.emojiIcon),
		search: getIconMarkup(attributes.searchIcon),
		trash: getIconMarkup(attributes.trashIcon),
		'external-link': getIconMarkup(attributes.externalIcon),
		loading: getIconMarkup(attributes.loadMoreIcon),
		'no-post': getIconMarkup(attributes.noPostsIcon),
	};
}

/**
 * Timeline Block Save Function
 */
export default function save({ attributes }: SaveProps): JSX.Element {
	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes['blockId'] || 'timeline',
		baseClass: 'voxel-fse-timeline-frontend',
	});

	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		'data-mode': attributes.mode,
		// Headless-ready: Visibility rules configuration
		'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
		'data-visibility-rules': attributes['visibilityRules']?.length
			? JSON.stringify(attributes['visibilityRules'])
			: undefined,
		// Headless-ready: Loop element configuration
		'data-loop-source': attributes['loopSource'] || undefined,
		'data-loop-limit': attributes['loopLimit'] || undefined,
		'data-loop-offset': attributes['loopOffset'] || undefined,
		...advancedProps.customAttrs,
	});

	// Build configuration objects
	const vxConfig = buildVxConfig(attributes);
	const iconsConfig = buildIconsConfig(attributes);

	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab */}
			{advancedProps.responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* Block config (editor-set values) - parsed by frontend.tsx */}
			<script
				type="text/json"
				className="vxconfig-block"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Icons config - merged with Voxel defaults by frontend.tsx */}
			<script
				type="text/json"
				className="vxconfig-icons"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(iconsConfig) }}
			/>

			{/* Placeholder - replaced by Voxel Vue app */}
			<div className="voxel-fse-timeline-placeholder">
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '40px 20px',
						backgroundColor: '#f5f5f5',
						borderRadius: '4px',
						color: '#666',
						gap: '8px',
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						fill="currentColor"
						style={{ opacity: 0.5 }}
					>
						<path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
					</svg>
					<span>Timeline (VX) - Loading...</span>
				</div>
			</div>
		</div>
	);
}
