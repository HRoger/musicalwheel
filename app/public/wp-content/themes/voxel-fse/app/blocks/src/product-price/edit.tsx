/**
 * Product Price Block - Editor Component (Plan C+)
 *
 * Uses the shared ProductPriceComponent for editor preview.
 * Fetches live price data from REST API for real-time preview.
 *
 * NO ServerSideRender - follows Plan C+ headless architecture.
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useState, useEffect, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ProductPriceComponent from './shared/ProductPriceComponent';
import { InspectorTabs } from '@shared/controls';
import ContentTab from './inspector/ContentTab';
import { generateProductPriceResponsiveCSS } from './styles';
import { useTemplatePostType } from '@shared/utils/useTemplateContext';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import type {
		ProductPriceData,
	ProductPriceEditProps,
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
 * Fetch product price data from REST API
 */
async function fetchProductPrice(postId: number): Promise<ProductPriceData> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/product-price?post_id=${postId}`;

	const response = await fetch(endpoint);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error((errorData as { message?: string }).message || `HTTP error ${response.status}`);
	}

	return response.json() as Promise<ProductPriceData>;
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
	clientId,
}: ProductPriceEditProps) {
	const blockId = attributes.blockId || clientId;

	// Wire AdvancedTab + VoxelTab controls to the block wrapper
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'vxfse-product-price',
		selectorPrefix: 'vxfse-product-price',
	});

	// Build CSS variables from content tab controls (colors, typography)
	const contentStyles: Record<string, string> = {};
	if (attributes.priceColor) contentStyles['--vx-price-color'] = attributes.priceColor;
	if (attributes.strikethroughTextColor) contentStyles['--vx-strike-text-color'] = attributes.strikethroughTextColor;
	if (attributes.strikethroughLineColor) contentStyles['--vx-strike-line-color'] = attributes.strikethroughLineColor;
	if (attributes.strikethroughWidth) {
		contentStyles['--vx-strike-width'] = `${attributes.strikethroughWidth}${attributes.strikethroughWidthUnit || 'px'}`;
	}
	if (attributes.outOfStockColor) contentStyles['--vx-nostock-color'] = attributes.outOfStockColor;
	if (attributes.typography?.fontSize) contentStyles['--vx-price-font-size'] = attributes.typography.fontSize as string;
	if (attributes.typography?.fontWeight) contentStyles['--vx-price-font-weight'] = attributes.typography.fontWeight as string;
	if (attributes.typography?.fontFamily) contentStyles['--vx-price-font-family'] = attributes.typography.fontFamily as string;
	if (attributes.typography?.lineHeight) contentStyles['--vx-price-line-height'] = attributes.typography.lineHeight as string;
	if (attributes.typography?.letterSpacing) contentStyles['--vx-price-letter-spacing'] = attributes.typography.letterSpacing as string;
	if (attributes.typography?.textTransform) contentStyles['--vx-price-text-transform'] = attributes.typography.textTransform as string;
	if (attributes.strikethroughTypography?.fontSize) contentStyles['--vx-strike-font-size'] = attributes.strikethroughTypography.fontSize as string;
	if (attributes.strikethroughTypography?.fontWeight) contentStyles['--vx-strike-font-weight'] = attributes.strikethroughTypography.fontWeight as string;
	if (attributes.strikethroughTypography?.fontFamily) contentStyles['--vx-strike-font-family'] = attributes.strikethroughTypography.fontFamily as string;
	if (attributes.strikethroughTypography?.lineHeight) contentStyles['--vx-strike-line-height'] = attributes.strikethroughTypography.lineHeight as string;
	if (attributes.strikethroughTypography?.letterSpacing) contentStyles['--vx-strike-letter-spacing'] = attributes.strikethroughTypography.letterSpacing as string;
	if (attributes.strikethroughTypography?.textTransform) contentStyles['--vx-strike-text-transform'] = attributes.strikethroughTypography.textTransform as string;

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: `vxfse-product-price-editor ${advancedProps.className}`,
		style: { ...contentStyles, ...advancedProps.styles },
		...advancedProps.customAttrs,
	});

	// State for price data
	// Start as loading=true so the editor shows EmptyPlaceholder instead of
	// a blank div while samplePostId resolves (eliminates editor FOUC).
	const [priceData, setPriceData] = useState<ProductPriceData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Get post context from FSE or block editor
	const editorPostId = useSelect(
		(select) => {
			const editorStore = select('core/editor') as { getCurrentPostId?: () => number } | undefined;
			return editorStore?.getCurrentPostId?.() ?? null;
		},
		[]
	);

	// Detect template context for sample post resolution
	const templatePostType = useTemplatePostType();

	// Use context first, fallback to editor, or resolve sample post for templates
	const rawPostId = context.postId || editorPostId;
	const [samplePostId, setSamplePostId] = useState<number | null>(null);

	// Track whether we're still resolving the sample post ID (template context)
	const [resolvingPostId, setResolvingPostId] = useState(!rawPostId && !!templatePostType);

	// When editing a template (non-numeric postId), resolve a sample post
	useEffect(() => {
		if (rawPostId && typeof rawPostId === 'number' && rawPostId > 0) {
			setSamplePostId(null);
			setResolvingPostId(false);
			return;
		}

		if (!templatePostType) {
			setSamplePostId(null);
			setResolvingPostId(false);
			return;
		}

		setResolvingPostId(true);
		const controller = new AbortController();
		apiFetch<{ rendered: string }>({
			path: '/voxel-fse/v1/dynamic-data/render',
			method: 'POST',
			data: {
				expression: '@post(id)',
				preview_context: { type: 'post', post_type: templatePostType },
			},
			signal: controller.signal,
		})
			.then((res) => {
				const id = parseInt(res.rendered, 10);
				if (!isNaN(id) && id > 0) {
					setSamplePostId(id);
				}
			})
			.catch(() => {
				// Silently fail — block will show placeholder
			})
			.finally(() => {
				setResolvingPostId(false);
			});

		return () => { controller.abort(); };
	}, [rawPostId, templatePostType]);

	const postId = (typeof rawPostId === 'number' && rawPostId > 0) ? rawPostId : samplePostId;

	// Generate block ID if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Fetch price data when postId changes
	useEffect(() => {
		let cancelled = false;

		async function loadPriceData() {
			if (!postId) {
				setPriceData(null);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchProductPrice(postId);
				if (!cancelled) {
					setPriceData(data);
				}
			} catch (err) {
				if (!cancelled) {
					// Don't show error for "no product field" - this is expected
					const errorMessage = err instanceof Error ? err.message : 'Failed to load';
					if (!errorMessage.includes('product field')) {
						setError(errorMessage);
					}
					setPriceData(null);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPriceData();

		return () => {
			cancelled = true;
		};
	}, [postId]);

	// Generate responsive CSS: AdvancedTab (Layer 1) + block-specific (Layer 2)
	const responsiveCSS = useMemo(
		() => [
			advancedProps.responsiveCSS,
			generateProductPriceResponsiveCSS(attributes, blockId),
		].filter(Boolean).join('\n'),
		[attributes, blockId, advancedProps.responsiveCSS]
	);

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
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
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Output responsive CSS for tablet/mobile */}
				{responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
				)}

				{postId ? (
					<ProductPriceComponent
						attributes={attributes}
						priceData={priceData}
						isLoading={isLoading}
						error={error}
						context="editor"
						postId={postId}
					/>
				) : resolvingPostId ? (
					// Still resolving sample post ID — show loading state to avoid FOUC
					<ProductPriceComponent
						attributes={attributes}
						priceData={null}
						isLoading={true}
						error={null}
						context="editor"
					/>
				) : (
					<div className="vxfse-product-price-placeholder">
						<span className="vx-price">
							{__('Product Price - Select a post with product data', 'voxel-fse')}
						</span>
					</div>
				)}
			</div>
		</>
	);
}
