/**
 * Review Stats Block - Editor Component (Plan C+)
 *
 * Uses the shared ReviewStatsComponent for editor preview.
 * Fetches live review stats data from REST API for real-time preview.
 *
 * NO ServerSideRender - follows Plan C+ headless architecture.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useMemo } from 'react';
import ReviewStatsComponent from './shared/ReviewStatsComponent';
import { InspectorControls } from './inspector';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateReviewStatsResponsiveCSS } from './styles';
import type {
	ReviewStatsData,
	ReviewStatsEditProps,
} from './types';




/**
 * Get REST API base URL
 */
function getRestUrl(): string {
	if (typeof window !== 'undefined' && window.wpApiSettings?.root) {
		return window.wpApiSettings.root;
	}
	return '/wp-json/';
}

/**
 * Fetch review stats data from REST API
 */
async function fetchReviewStats(postId: number): Promise<ReviewStatsData> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/review-stats?post_id=${postId}`;

	const response = await fetch(endpoint);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error((errorData as { message?: string }).message || `HTTP error ${response.status}`);
	}

	return response.json() as Promise<ReviewStatsData>;
}

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return Math.random().toString(36).substring(2, 9);
}

export default function Edit({
	attributes,
	setAttributes,
	context,
}: ReviewStatsEditProps) {
	// Generate block ID if not set
	const blockId = attributes.blockId || 'review-stats';

	// State for stats data
	const [statsData, setStatsData] = useState<ReviewStatsData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Get post context from FSE or block editor
	// @ts-ignore - select type
	const editorPostId = (useSelect as any)(
		(select: any) => {
			const editorStore = select('core/editor') as { getCurrentPostId?: () => number } | undefined;
			return editorStore?.getCurrentPostId?.() ?? null;
		},
		[]
	);

	// Use context first, fallback to editor
	// In FSE template editor, context.postId may be a template name (string like "voxel-fse//template-name")
	// Only use it if it's a valid numeric ID
	const contextPostId = typeof context.postId === 'number' ? context.postId : null;
	const postId = contextPostId || (typeof editorPostId === 'number' ? editorPostId : null);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'vxfse-review-stats',
		selectorPrefix: 'vxfse-review-stats',
	});

	// Generate block-specific responsive CSS with useMemo for performance
	const reviewStatsResponsiveCSS = useMemo(
		() => generateReviewStatsResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, reviewStatsResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, reviewStatsResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: `${advancedProps.className} vxfse-review-stats-editor`,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	// Generate block ID if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-review-stats-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/review-stats.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Fetch stats data when postId changes
	useEffect(() => {
		let cancelled = false;

		async function loadStatsData() {
			if (!postId) {
				setStatsData(null);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchReviewStats(postId);
				if (!cancelled) {
					setStatsData(data);
				}
			} catch (err) {
				if (!cancelled) {
					// Don't show error for expected cases
					const errorMessage = err instanceof Error ? err.message : 'Failed to load';
					if (!errorMessage.includes('review stats')) {
						setError(errorMessage);
					}
					setStatsData(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadStatsData();

		return () => {
			cancelled = true;
		};
	}, [postId]);

	return (
		<>
			<InspectorControls
				attributes={attributes}
				setAttributes={setAttributes}
			/>

			<div {...blockProps}>
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Always render ReviewStatsComponent - it handles no-data state based on mode */}
				{/* Overall mode: shows 5 rating levels with 0% (matches Voxel) */}
				{/* By category mode: shows empty container when no categories */}
				<ReviewStatsComponent
					attributes={attributes}
					statsData={statsData}
					isLoading={isLoading}
					error={error}
					context="editor"
					postId={postId}
				/>
			</div>
		</>
	);
}
