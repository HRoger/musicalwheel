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
import ProductPriceComponent from './shared/ProductPriceComponent';
import { InspectorTabs } from '@shared/controls';
import ContentTab from './inspector/ContentTab';
import { generateProductPriceResponsiveCSS } from './styles';
import type {
	ProductPriceAttributes,
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

	const blockProps = useBlockProps({
		className: `vxfse-product-price-editor vxfse-product-price-${blockId}`,
	});

	// State for price data
	const [priceData, setPriceData] = useState<ProductPriceData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Get post context from FSE or block editor
	const editorPostId = useSelect(
		(select) => {
			const editorStore = select('core/editor') as { getCurrentPostId?: () => number } | undefined;
			return editorStore?.getCurrentPostId?.() ?? null;
		},
		[]
	);

	// Use context first, fallback to editor
	const postId = context.postId || editorPostId;

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

	// Generate responsive CSS for tablet/mobile variants
	const responsiveCSS = useMemo(
		() => generateProductPriceResponsiveCSS(attributes, blockId),
		[attributes, blockId]
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
