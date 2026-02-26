/**
 * Post Feed Block - Editor Component
 *
 * @package VoxelFSE
 */

import { useEffect, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';
import { getBlocksByNameRecursive, getBlockByBlockIdRecursive } from '../../shared/utils/blockSelectors';


import PostFeedComponent from './shared/PostFeedComponent';
import { usePostFeedConfig } from './hooks/usePostFeedConfig';
import { useCardTemplates } from './hooks/useCardTemplates';
import { ContentTab, StyleTab } from './inspector';
import type { PostFeedEditProps } from './types';

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return Math.random().toString(36).substring(2, 10);
}

/**
 * Post Feed Edit Component
 */
export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: PostFeedEditProps): JSX.Element {
	// Get blockId for AdvancedTab/VoxelTab wiring
	const blockId = attributes.blockId || 'post-feed';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-post-feed-editor',
		selectorPrefix: 'voxel-fse-post-feed',
	});

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: {
			...advancedProps.styles,
			// Prevent carousel content from expanding the Gutenberg block wrapper
			// In Elementor, the widget wrapper has a fixed column width; in Gutenberg's
			// flex layout, we need overflow:hidden + min-width:0 on both the wrapper and
			// the inner .ts-post-feed to contain the scroll content
			overflow: 'hidden',
			minWidth: 0,
		},
	});

	// Fetch configuration from REST API
	const { config, error } = usePostFeedConfig();

	// Fetch card templates based on selected post type
	// Evidence: Voxel post-feed.php:204-212 - templates are per post type
	const { templates: cardTemplates, isLoading: isLoadingTemplates } = useCardTemplates(
		attributes.postType
	);

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles into the editor iframe
	// post-feed.css contains carousel nav and card styles that must be in the iframe
	useEffect(() => {
		const cssId = 'voxel-post-feed-css';
		const voxelConfig = (window as any).Voxel_Config;
		const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
		const cssHref = `${siteUrl}/wp-content/themes/voxel/assets/dist/post-feed.css?ver=1.7.5.2`;

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

	// Get search form blocks on the page for RelationControl
	// OPTIMIZATION: Use memoized recursive search to prevent traversing the entire block tree
	// on every store update (e.g. viewport change). Returns stable array reference if blocks haven't changed.
	// @ts-ignore - Dependency array supported in runtime
	const searchFormBlocks = useSelect(
		(select: any) => {
			const { getBlocks } = select('core/block-editor');
			const allBlocks = getBlocks();

			// Filter out current block to avoid self-reference (though Name mismatch handles it mostly)
			return getBlocksByNameRecursive(allBlocks, 'voxel-fse/search-form')
				.filter((block: any) => block.clientId !== clientId);
		},
		// @ts-ignore - Dependency array supported in runtime
		[clientId]
	);


	// @ts-ignore - Dependency array supported in runtime
	const linkedSearchFormClientId = useSelect(
		(select: any) => {
			if (attributes.source !== 'search-form' || !attributes.searchFormId) {
				return null;
			}

			const { getBlocks } = select('core/block-editor');
			const allBlocks = getBlocks();

			// Use memoized search for block by ID (checks clientId and blockId attribute)
			const foundBlock = getBlockByBlockIdRecursive(
				allBlocks,
				attributes.searchFormId,
				'voxel-fse/search-form'
			);

			return foundBlock ? foundBlock.clientId : null;
		},
		// @ts-ignore - Dependency array supported in runtime
		[attributes.source, attributes.searchFormId]
	);

	// Step 2: Use getBlock(clientId) to get the linked form's attributes
	// IMPORTANT: No dependency array - this ensures selector re-runs on every store change
	// so we catch when selectedPostType attribute changes on the linked Search Form
	const linkedPostType = useSelect(
		(select: any) => {
			if (!linkedSearchFormClientId) {
				return '';
			}

			const { getBlock } = select('core/block-editor') as {
				getBlock: (clientId: string) => {
					attributes: { selectedPostType?: string; postTypes?: string[] };
				} | null;
			};

			const linkedForm = getBlock(linkedSearchFormClientId);
			if (!linkedForm) {
				return '';
			}

			// Return selectedPostType (current selection) or fallback to first configured postType
			return linkedForm.attributes.selectedPostType || linkedForm.attributes.postTypes?.[0] || '';
		}
	);

	// Step 3: Watch linked Search Form's editorFilterValues for editor preview sync
	// This enables filter values (price, keywords, etc.) to update the Post Feed preview
	const linkedFilters = useSelect(
		(select: any) => {
			if (!linkedSearchFormClientId) {
				return {};
			}

			const { getBlock } = select('core/block-editor') as {
				getBlock: (clientId: string) => {
					attributes: { editorFilterValues?: Record<string, unknown> };
				} | null;
			};

			const linkedForm = getBlock(linkedSearchFormClientId);
			if (!linkedForm) {
				return {};
			}

			return linkedForm.attributes.editorFilterValues || {};
		}
	);

	// Build relation items for RelationControl
	const searchFormItems = searchFormBlocks.map(
		(block: { clientId: string; attributes: { blockId?: string } }) => ({
			id: block.attributes.blockId || block.clientId,
			clientId: block.clientId,
			label: block.attributes.blockId || block.clientId.substring(0, 7),
		})
	);

	const inspectorTabs = useMemo(() => [
		{
			id: 'content',
			label: __('Content', 'voxel-fse'),
			icon: '\ue92c',
			render: (props: any) => (
				<ContentTab
					attributes={props.attributes}
					setAttributes={props.setAttributes}
					config={config}
					searchFormItems={searchFormItems}
					cardTemplates={cardTemplates}
					isLoadingTemplates={isLoadingTemplates}
				/>
			),
		},
		{
			id: 'style',
			label: __('Style', 'voxel-fse'),
			icon: '\ue921',
			render: (props: any) => (
				<StyleTab
					attributes={props.attributes}
					setAttributes={props.setAttributes}
				/>
			),
		},
	], [config, searchFormItems, cardTemplates, isLoadingTemplates]);

	return (
		<>
			{/* Inspector Controls with proper tab navigation */}
			<InspectorControls>
				<InspectorTabs
					tabs={inspectorTabs}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
					activeTabAttribute="postFeedActiveTab"
				/>
			</InspectorControls>

			{/* BLOCK PREVIEW */}
			<div {...blockProps}>
				{error ? (
					<div className="voxel-fse-error">
						<span>{error}</span>
					</div>
				) : (
					<PostFeedComponent
						attributes={{
							...attributes,
							// Use derived postType from linked search form when source is 'search-form'
							// Fallback to attributes.postType if linkedPostType is empty (e.g., broken link)
							postType: attributes.source === 'search-form'
								? (linkedPostType || attributes.postType)
								: attributes.postType,
						}}
						config={config}
						context="editor"
						editorFilters={attributes.source === 'search-form' ? linkedFilters : undefined}
					/>
				)}
			</div>
		</>
	);
}
