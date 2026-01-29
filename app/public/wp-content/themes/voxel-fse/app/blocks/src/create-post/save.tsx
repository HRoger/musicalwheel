/**
 * Create Post Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig data for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * Pattern matches search-form's save.tsx:
 * - Minimal storage in database
 * - vxconfig JSON for configuration
 * - Placeholder for React to mount into
 *
 * @package VoxelFSE
 */

// @ts-nocheck - WordPress types incomplete
import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateStyleTabResponsiveCSS, generateFieldStyleTabResponsiveCSS } from './styles';
import type { CreatePostAttributes } from './types';

interface SaveProps {
	attributes: CreatePostAttributes;
}

export default function save({ attributes }: SaveProps) {
	// Build class list using shared utility (handles custom classes, visibility, etc.)
	// NOTE: baseClass MUST start with the selector prefix used in styles.ts
	// styles.ts uses: `.voxel-fse-create-post-${blockId}`
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || '',
		baseClass: 'voxel-fse-create-post ts-form ts-create-post create-post-form',
	});

	// Generate Style tab CSS
	const styleTabCSS = generateStyleTabResponsiveCSS(attributes, attributes.blockId || '');
	// Generate Field Style tab CSS
	const fieldStyleTabCSS = generateFieldStyleTabResponsiveCSS(attributes, attributes.blockId || '');
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, styleTabCSS, fieldStyleTabCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		'data-post-type': attributes.postTypeKey || '',
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
		...advancedProps.customAttrs,
	});

	// Build vxconfig JSON (matching Voxel pattern)
	// Contains all configuration needed by frontend.tsx
	const vxConfig = {
		// Core settings
		postTypeKey: attributes.postTypeKey || '',
		submitButtonText: attributes.submitButtonText || 'Publish',
		successMessage: attributes.successMessage || '',
		redirectAfterSubmit: attributes.redirectAfterSubmit || '',
		showFormHead: attributes.showFormHead ?? true,
		enableDraftSaving: attributes.enableDraftSaving ?? true,

		// Icon attributes (24 icons)
		// These are passed to CreatePostForm for rendering
		icons: {
			popupIcon: attributes.popupIcon || null,
			infoIcon: attributes.infoIcon || null,
			tsMediaIco: attributes.tsMediaIco || null,
			nextIcon: attributes.nextIcon || null,
			prevIcon: attributes.prevIcon || null,
			downIcon: attributes.downIcon || null,
			trashIcon: attributes.trashIcon || null,
			draftIcon: attributes.draftIcon || null,
			publishIcon: attributes.publishIcon || null,
			saveIcon: attributes.saveIcon || null,
			successIcon: attributes.successIcon || null,
			viewIcon: attributes.viewIcon || null,
			tsCalendarIcon: attributes.tsCalendarIcon || null,
			tsCalminusIcon: attributes.tsCalminusIcon || null,
			tsAddIcon: attributes.tsAddIcon || null,
			tsEmailIcon: attributes.tsEmailIcon || null,
			tsPhoneIcon: attributes.tsPhoneIcon || null,
			tsLocationIcon: attributes.tsLocationIcon || null,
			tsMylocationIcon: attributes.tsMylocationIcon || null,
			tsMinusIcon: attributes.tsMinusIcon || null,
			tsPlusIcon: attributes.tsPlusIcon || null,
			tsListIcon: attributes.tsListIcon || null,
			tsSearchIcon: attributes.tsSearchIcon || null,
			tsClockIcon: attributes.tsClockIcon || null,
			tsLinkIcon: attributes.tsLinkIcon || null,
			tsRtimeslotIcon: attributes.tsRtimeslotIcon || null,
			tsUploadIco: attributes.tsUploadIco || null,
			tsLoadMore: attributes.tsLoadMore || null,
		},
	};

	return (
		<div {...blockProps}>
			{/* Advanced Tab + Style Tab Responsive CSS */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Advanced Tab Background Elements (overlay, video, etc.) */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration - will be replaced by CreatePostForm */}
			<div
				className="voxel-fse-block-placeholder"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#e0e0e0',
					padding: '16px',
					minHeight: '48px',
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="24"
					height="24"
					fill="currentColor"
					style={{ opacity: 0.4 }}
				>
					<rect x="4" y="4" width="4" height="4" rx="0.5" />
					<rect x="10" y="4" width="4" height="4" rx="0.5" />
					<rect x="16" y="4" width="4" height="4" rx="0.5" />
					<rect x="4" y="10" width="4" height="4" rx="0.5" />
					<rect x="10" y="10" width="4" height="4" rx="0.5" />
					<rect x="16" y="10" width="4" height="4" rx="0.5" />
					<rect x="4" y="16" width="4" height="4" rx="0.5" />
					<rect x="10" y="16" width="4" height="4" rx="0.5" />
					<rect x="16" y="16" width="4" height="4" rx="0.5" />
				</svg>
			</div>
		</div>
	);
}
