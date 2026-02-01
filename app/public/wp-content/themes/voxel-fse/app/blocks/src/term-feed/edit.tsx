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
import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { generateTermFeedResponsiveCSS } from './styles';

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

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-post-feed-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/post-feed.css?ver=1.7.5.2`;
			document.head.appendChild(link);
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

	// Generate responsive CSS
	const responsiveCSS = useMemo(
		() => generateTermFeedResponsiveCSS(attributes, advancedProps.uniqueSelector),
		[attributes, advancedProps.uniqueSelector]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	return (
		<div {...blockProps}>
			{/* Output responsive CSS */}
			{(advancedProps.responsiveCSS || responsiveCSS) && (
				<style
					dangerouslySetInnerHTML={{
						__html: [advancedProps.responsiveCSS, responsiveCSS]
							.filter(Boolean)
							.join('\n'),
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
			/>
		</div>
	);
}
