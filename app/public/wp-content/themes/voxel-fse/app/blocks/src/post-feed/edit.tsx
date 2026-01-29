/**
 * Post Feed Block - Editor Component
 *
 * @package VoxelFSE
 */

import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';

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
		style: advancedProps.styles,
	});

	// Fetch configuration from REST API
	const { config, isLoading, error } = usePostFeedConfig();

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

	// Get search form blocks on the page for RelationControl
	const searchFormBlocks = useSelect(
		(select) => {
			const { getBlocks } = select('core/block-editor') as {
				getBlocks: () => Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
					innerBlocks?: Array<unknown>;
				}>;
			};

			// Recursive function to find blocks (including nested ones)
			const findBlocksRecursive = (
				blocks: Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
					innerBlocks?: Array<unknown>;
				}>,
				targetName: string
			): Array<{ clientId: string; name: string; attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string } }> => {
				let found: Array<{ clientId: string; name: string; attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string } }> = [];
				blocks.forEach((block) => {
					if (block.name === targetName && block.clientId !== clientId) {
						found.push(block);
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						found = found.concat(
							findBlocksRecursive(
								block.innerBlocks as Array<{
									clientId: string;
									name: string;
									attributes: { blockId?: string; postTypes?: string[]; selectedPostType?: string };
									innerBlocks?: Array<unknown>;
								}>,
								targetName
							)
						);
					}
				});
				return found;
			};

			return findBlocksRecursive(getBlocks(), 'voxel-fse/search-form');
		},
		[clientId]
	);

	// Step 1: Find the linked Search Form's clientId from the store
	// This lets us use getBlock(clientId) which properly subscribes to attribute changes
	const linkedSearchFormClientId = useSelect(
		(select) => {
			if (attributes.source !== 'search-form' || !attributes.searchFormId) {
				return null;
			}

			const { getBlocks } = select('core/block-editor') as {
				getBlocks: () => Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string };
					innerBlocks?: Array<unknown>;
				}>;
			};

			// Recursive function to find a specific search form block's clientId
			const findSearchFormClientId = (
				blocks: Array<{
					clientId: string;
					name: string;
					attributes: { blockId?: string };
					innerBlocks?: Array<unknown>;
				}>,
				targetId: string
			): string | null => {
				for (const block of blocks) {
					if (block.name === 'voxel-fse/search-form') {
						if (block.attributes.blockId === targetId || block.clientId === targetId) {
							return block.clientId;
						}
					}
					if (block.innerBlocks && block.innerBlocks.length > 0) {
						const found = findSearchFormClientId(
							block.innerBlocks as Array<{
								clientId: string;
								name: string;
								attributes: { blockId?: string };
								innerBlocks?: Array<unknown>;
							}>,
							targetId
						);
						if (found) return found;
					}
				}
				return null;
			};

			return findSearchFormClientId(getBlocks(), attributes.searchFormId);
		},
		[attributes.source, attributes.searchFormId]
	);

	// Step 2: Use getBlock(clientId) to get the linked form's attributes
	// IMPORTANT: No dependency array - this ensures selector re-runs on every store change
	// so we catch when selectedPostType attribute changes on the linked Search Form
	const linkedPostType = useSelect(
		(select) => {
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
		(select) => {
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

	return (
		<>
			{/* Inspector Controls with proper tab navigation */}
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
					activeTabAttribute="postFeedActiveTab"
				/>
			</InspectorControls>

			{/* BLOCK PREVIEW */}
			<div {...blockProps}>
				{isLoading ? (
					<div className="voxel-fse-loading">
						<Spinner />
						<span>{__('Loading configuration...', 'voxel-fse')}</span>
					</div>
				) : error ? (
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
