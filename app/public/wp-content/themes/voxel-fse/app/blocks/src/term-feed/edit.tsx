/**
 * Term Feed Block - Editor Component
 *
 * Implements all Elementor controls from Voxel's Term_Feed widget.
 * Uses Plan C+ architecture (API-driven, React hydration).
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/term-feed.php
 * - Template: themes/voxel/templates/widgets/term-feed.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';
import type {
	TermFeedAttributes,
	TermData,
	TaxonomyOption,
	PostTypeOption,
	CardTemplateOption,
} from './types';
import {
	InspectorTabs,
} from '@shared/controls';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import TermFeedComponent from './shared/TermFeedComponent';
import { ContentTab, StyleTab } from './inspector';

interface EditProps {
	attributes: TermFeedAttributes;
	setAttributes: (attrs: Partial<TermFeedAttributes>) => void;
	clientId: string;
}

/**
 * API response types
 */
interface TaxonomiesResponse {
	taxonomies: TaxonomyOption[];
}

interface PostTypesResponse {
	postTypes: PostTypeOption[];
}

interface CardTemplatesResponse {
	templates: CardTemplateOption[];
}

interface TermsResponse {
	terms: TermData[];
	total: number;
	styles?: string;
}

/**
 * Inject template styles into the editor iframe document.
 *
 * Block React code runs in the parent frame, but styles need to go into the
 * editor canvas iframe so they affect the rendered card HTML.
 */
function injectTemplateStyles(styles?: string): void {
	if (!styles) return;

	// Target the editor iframe document, fall back to parent document
	const iframe = document.querySelector(
		'iframe[name="editor-canvas"]'
	) as HTMLIFrameElement | null;
	const targetDoc = iframe?.contentDocument ?? document;
	const targetHead = targetDoc.head;

	const temp = document.createElement('div');
	temp.innerHTML = styles;
	Array.from(temp.children).forEach((el) => {
		if (el instanceof HTMLStyleElement || el instanceof HTMLLinkElement) {
			const id = el.id || (el as HTMLLinkElement).href;
			if (id && !targetDoc.getElementById(id)) {
				// Import the node into the target document if it's cross-document
				const imported = targetDoc.importNode(el, true);
				targetHead.appendChild(imported);
			}
		}
	});
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	// State for dynamic options
	const [taxonomies, setTaxonomies] = useState<TaxonomyOption[]>([]);
	const [postTypes, setPostTypes] = useState<PostTypeOption[]>([]);
	const [cardTemplates, setCardTemplates] = useState<CardTemplateOption[]>([]);
	const [terms, setTerms] = useState<TermData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles into the editor iframe
	// post-feed.css contains .post-feed-nav and .ts-icon-btn carousel arrow styles
	// that must be in the iframe (where React renders) not the parent document
	useEffect(() => {
		const cssId = 'voxel-term-feed-css';
		const voxelConfig = (window as any).Voxel_Config;
		const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
		const cssHref = `${siteUrl}/wp-content/themes/voxel/assets/dist/post-feed.css?ver=1.7.5.2`;

		// Inject into the editor iframe where block content renders
		const iframe = document.querySelector(
			'iframe[name="editor-canvas"]'
		) as HTMLIFrameElement | null;
		const targetDoc = iframe?.contentDocument ?? document;

		if (!targetDoc.getElementById(cssId)) {
			const link = targetDoc.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			link.href = cssHref;
			targetDoc.head.appendChild(link);
		}
	}, []);

	// Fetch taxonomies on mount
	useEffect(() => {
		apiFetch({
			path: '/voxel-fse/v1/term-feed/taxonomies',
		})
			.then((response: unknown) => {
				const data = response as TaxonomiesResponse;
				setTaxonomies(data.taxonomies || []);
				// Set default taxonomy if not set
				if (!attributes.taxonomy && data.taxonomies?.length > 0) {
					setAttributes({ taxonomy: data.taxonomies[0].key });
				}
			})
			.catch((err) => {
				console.error('Failed to fetch taxonomies:', err);
			});
	}, []);

	// Fetch post types on mount
	useEffect(() => {
		apiFetch({
			path: '/voxel-fse/v1/term-feed/post-types',
		})
			.then((response: unknown) => {
				const data = response as PostTypesResponse;
				setPostTypes(data.postTypes || []);
			})
			.catch((err) => {
				console.error('Failed to fetch post types:', err);
			});
	}, []);

	// Fetch card templates on mount
	useEffect(() => {
		apiFetch({
			path: '/voxel-fse/v1/term-feed/card-templates',
		})
			.then((response: unknown) => {
				const data = response as CardTemplatesResponse;
				setCardTemplates(data.templates || []);
			})
			.catch((err) => {
				console.error('Failed to fetch card templates:', err);
			});
	}, []);

	// Fetch terms based on current settings
	const fetchTerms = useCallback(async () => {
		if (attributes.source === 'manual') {
			// For manual selection, fetch specific term IDs
			const termIds = attributes.manualTerms
				.map((t) => t.term_id)
				.filter(Boolean);
			if (termIds.length === 0) {
				setTerms([]);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const response = (await apiFetch({
					path: `/voxel-fse/v1/term-feed/terms?source=manual&term_ids=${termIds.join(',')}${attributes.hideEmpty ? '&hide_empty=1' : ''}${attributes.hideEmptyPostType !== ':all' ? `&hide_empty_pt=${attributes.hideEmptyPostType}` : ''}&card_template=${attributes.cardTemplate}`,
				})) as TermsResponse;
				setTerms(response.terms || []);
				injectTemplateStyles(response.styles);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to load terms'
				);
			} finally {
				setIsLoading(false);
			}
		} else {
			// For filters mode
			if (!attributes.taxonomy) {
				setTerms([]);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					source: 'filters',
					taxonomy: attributes.taxonomy,
					order: attributes.order,
					per_page: String(attributes.perPage),
					card_template: attributes.cardTemplate,
				});

				if (attributes.parentTermId) {
					params.set('parent_term_id', String(attributes.parentTermId));
				}

				if (attributes.hideEmpty) {
					params.set('hide_empty', '1');
					if (attributes.hideEmptyPostType !== ':all') {
						params.set('hide_empty_pt', attributes.hideEmptyPostType);
					}
				}

				const response = (await apiFetch({
					path: `/voxel-fse/v1/term-feed/terms?${params.toString()}`,
				})) as TermsResponse;
				setTerms(response.terms || []);
				injectTemplateStyles(response.styles);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to load terms'
				);
			} finally {
				setIsLoading(false);
			}
		}
	}, [
		attributes.source,
		attributes.manualTerms,
		attributes.taxonomy,
		attributes.parentTermId,
		attributes.order,
		attributes.perPage,
		attributes.hideEmpty,
		attributes.hideEmptyPostType,
		attributes.cardTemplate,
	]);

	// Fetch terms when dependencies change
	useEffect(() => {
		fetchTerms();
	}, [fetchTerms]);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const blockId = attributes.blockId || clientId;
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-term-feed',
	});

	// Note: Term-feed responsive CSS (carousel widths, gap, nav styles) is now generated
	// inside the shared TermFeedComponent via cssSelector prop (DRY: works for both editor + frontend)

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: {
			...advancedProps.styles,
			// Prevent carousel content from expanding the Gutenberg block wrapper
			// Same fix as post-feed: overflow:hidden + min-width:0 contain scroll content
			overflow: 'hidden',
			minWidth: 0,
		},
		...advancedProps.customAttrs,
	});

	return (
		<div {...blockProps}>
			{/* Output AdvancedTab responsive CSS (custom CSS, margins, etc.) */}
			{advancedProps.responsiveCSS && (
				<style
					dangerouslySetInnerHTML={{
						__html: advancedProps.responsiveCSS,
					}}
				/>
			)}

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
									taxonomies={taxonomies}
									postTypes={postTypes}
									cardTemplates={cardTemplates}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
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

			{/* Editor Preview */}
			<TermFeedComponent
				attributes={attributes}
				terms={terms}
				isLoading={isLoading}
				error={error}
				context="editor"
				cssSelector={advancedProps.uniqueSelector}
			/>
		</div>
	);
}
