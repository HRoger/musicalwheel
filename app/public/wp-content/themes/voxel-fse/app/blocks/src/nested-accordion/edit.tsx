/**
 * Nested Accordion Block - Editor Component
 *
 * 1:1 match with Voxel's nested-accordion widget:
 * - Accordion items with nested content
 * - Expand/collapse icons
 * - Animation settings
 * - State-based styling
 *
 * @package VoxelFSE
 */

import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore
import { useSelect, useDispatch } from '@wordpress/data';

// Access WordPress globals - ESM imports don't work with externalized modules
const createBlock = (window as any).wp?.blocks?.createBlock;
const BlockListBlock = (window as any).wp?.blockEditor?.BlockListBlock;
const BLOCK_EDITOR_STORE = 'core/block-editor';

import type { EditProps, AccordionItemData, VisibilityRule, LoopConfig } from './types';
import {
	InspectorTabs,
	RepeaterControl,
	LoopVisibilityControl,
	LoopElementModal,
	ElementVisibilityModal,
	EnableTagsButton,
} from '@shared/controls';
import type { RepeaterItemRenderProps } from '@shared/controls/RepeaterControl';
import type { LoopConfig as LoopModalConfig } from '@shared/controls/LoopElementModal';
import type { VisibilityRule as VisibilityModalRule } from '@shared/controls/ElementVisibilityModal';
import { ContentTab, StyleTab } from './inspector';
import { generateContentTabResponsiveCSS, generateStyleTabResponsiveCSS } from './styles';

// Generate unique ID for new items
const generateItemId = (): string => {
	return 'item_' + Math.random().toString(36).substr(2, 9);
};

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	const blockProps = useBlockProps({
		className: `vxfse-nested-accordion vxfse-nested-accordion-${blockId}`,
	});

	// Track open items using a Set for proper toggle behavior
	const [openItems, setOpenItems] = useState<Set<number>>(() => {
		// Initialize based on defaultState
		if (attributes.defaultState === 'expanded') {
			return new Set([0]); // First item open by default
		}
		return new Set();
	});

	// State for Loop Element Modal
	const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);
	const [editingLoopItemIndex, setEditingLoopItemIndex] = useState<number | null>(null);

	// State for Element Visibility Modal
	const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
	const [editingVisibilityItemIndex, setEditingVisibilityItemIndex] = useState<number | null>(null);

	// Get inner blocks info
	const { innerBlocks, hasInnerBlocks } = useSelect(
		(select: any) => {
			const { getBlocks } = select(BLOCK_EDITOR_STORE);
			const blocks = getBlocks(clientId);
			return {
				innerBlocks: blocks,
				hasInnerBlocks: blocks.length > 0,
			};
		},
		[clientId]
	);

	const { replaceInnerBlocks, selectBlock } = useDispatch(BLOCK_EDITOR_STORE) as any;

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Note: Removed Voxel Template Accordion CSS injection - file doesn't exist in Voxel dist
	// The accordion styling is handled by Voxel's core styles which are already loaded

	// Sync inner blocks with accordion items when items change
	useEffect(() => {
		if (!hasInnerBlocks && attributes.items.length > 0) {
			// Initialize inner blocks from items
			const blocks = attributes.items.map((item) =>
				createBlock('core/group', {
					className: 'vxfse-accordion-content',
					metadata: { name: item.title },
				}, [createBlock('core/paragraph', { placeholder: __('Add content for this accordion item...', 'voxel-fse') })])
			);
			replaceInnerBlocks(clientId, blocks, false);
		}
	}, [hasInnerBlocks, attributes.items, clientId, replaceInnerBlocks]);

	// Update a single item
	const updateItem = useCallback(
		(index: number, updates: Partial<AccordionItemData>) => {
			const newItems = [...attributes.items];
			newItems[index] = { ...newItems[index], ...updates };
			setAttributes({ items: newItems });
		},
		[attributes.items, setAttributes]
	);

	// Toggle accordion item in editor
	const toggleItem = useCallback((index: number) => {
		setOpenItems((prev) => {
			const newSet = new Set(prev);

			if (attributes.maxItemsExpanded === 'one') {
				// Only one item can be open at a time
				if (newSet.has(index)) {
					newSet.delete(index); // Close if already open
				} else {
					newSet.clear(); // Close all others
					newSet.add(index); // Open this one
				}
			} else {
				// Multiple items can be open
				if (newSet.has(index)) {
					newSet.delete(index);
				} else {
					newSet.add(index);
				}
			}

			return newSet;
		});

		// Select the corresponding inner block for editing
		if (innerBlocks[index]) {
			selectBlock(innerBlocks[index].clientId);
		}
	}, [attributes.maxItemsExpanded, innerBlocks, selectBlock]);

	// Title tag element
	const TitleTag = attributes.titleTag as keyof JSX.IntrinsicElements;

	// Handle items change from RepeaterControl
	const handleItemsChange = useCallback((newItems: AccordionItemData[]) => {
		const oldLength = attributes.items.length;
		const newLength = newItems.length;

		setAttributes({ items: newItems });

		// Sync inner blocks when items are added/removed
		if (newLength > oldLength) {
			// Item added - add corresponding inner block
			const newBlock = createBlock('core/group', {
				className: 'vxfse-accordion-content',
				metadata: { name: newItems[newLength - 1].title },
			}, [createBlock('core/paragraph', { placeholder: __('Add content for this accordion item...', 'voxel-fse') })]);
			replaceInnerBlocks(clientId, [...innerBlocks, newBlock], false);
		} else if (newLength < oldLength) {
			// Item removed - find which index was removed and remove corresponding inner block
			const oldIds = attributes.items.map(item => item.id);
			const newIds = newItems.map(item => item.id);
			const removedIndex = oldIds.findIndex(id => !newIds.includes(id));
			if (removedIndex !== -1) {
				const newBlocks = innerBlocks.filter((_: any, i: number) => i !== removedIndex);
				replaceInnerBlocks(clientId, newBlocks, false);
			}
		}
	}, [attributes.items, setAttributes, clientId, innerBlocks, replaceInnerBlocks]);

	// Render content for each repeater item
	const renderItemContent = useCallback(({ item, index, onUpdate }: RepeaterItemRenderProps<AccordionItemData>) => {
		// Convert visibility rules from types.ts format (type) to ElementVisibilityModal format (filterKey)
		// LoopVisibilityControl expects rules with 'filterKey' property for getVisibilityRuleLabel()
		const visibilityRules: VisibilityModalRule[] = (item.visibility?.rules?.flat() || []).map((rule, idx) => ({
			id: `rule_${idx}`,
			filterKey: rule.type || '',
			operator: (rule.operator as VisibilityModalRule['operator']) || 'equals',
			value: typeof rule.value === 'string' ? rule.value : '',
		}));

		return (
			<>
				{/* Title field with Dynamic Tags button */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
					<EnableTagsButton onClick={() => {
						// TODO: Open dynamic tag modal for title
						console.log('Enable tags for title');
					}} />
					<span style={{ fontWeight: 500 }}>{__('Title', 'voxel-fse')}</span>
				</div>
				<TextControl
					value={item.title}
					onChange={(title) => onUpdate({ title })}
					placeholder={__('Item Title', 'voxel-fse')}
					__nextHasNoMarginBottom
				/>

				{/* CSS ID field with Dynamic Tags button */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', marginTop: '16px' }}>
					<EnableTagsButton onClick={() => {
						// TODO: Open dynamic tag modal for CSS ID
						console.log('Enable tags for CSS ID');
					}} />
					<span style={{ fontWeight: 500 }}>{__('CSS ID', 'voxel-fse')}</span>
				</div>
				<TextControl
					value={item.cssId}
					onChange={(cssId) => onUpdate({ cssId })}
					placeholder={__('custom-id', 'voxel-fse')}
					help={__('Add your custom id WITHOUT the # prefix', 'voxel-fse')}
					__nextHasNoMarginBottom
				/>

				{/* Loop and Visibility Controls */}
				<LoopVisibilityControl
					showLoopSection={true}
					loopSource={item.loop?.source?.split('(')[0]?.replace('@', '') || ''}
					loopProperty={item.loop?.source?.match(/\(([^)]+)\)/)?.[1] || ''}
					loopLimit={item.loop?.limit?.toString() || ''}
					loopOffset={item.loop?.offset?.toString() || ''}
					onEditLoop={() => {
						setEditingLoopItemIndex(index);
						setIsLoopModalOpen(true);
					}}
					onClearLoop={() => {
						onUpdate({ loop: undefined });
					}}
					onLoopLimitChange={(value) => {
						const newLoop: LoopConfig = {
							source: item.loop?.source || '',
							limit: value ? parseInt(value, 10) : undefined,
							offset: item.loop?.offset,
						};
						onUpdate({ loop: newLoop });
					}}
					onLoopOffsetChange={(value) => {
						const newLoop: LoopConfig = {
							source: item.loop?.source || '',
							limit: item.loop?.limit,
							offset: value ? parseInt(value, 10) : undefined,
						};
						onUpdate({ loop: newLoop });
					}}
					rowVisibility={item.visibility?.behavior || 'show'}
					visibilityRules={visibilityRules}
					onRowVisibilityChange={(value) => {
						onUpdate({
							visibility: {
								behavior: value,
								rules: item.visibility?.rules || [],
							},
						});
					}}
					onEditVisibilityRules={() => {
						setEditingVisibilityItemIndex(index);
						setIsVisibilityModalOpen(true);
					}}
					onClearVisibilityRules={() => {
						onUpdate({ visibility: undefined });
					}}
				/>
			</>
		);
	}, [setEditingLoopItemIndex, setIsLoopModalOpen, setEditingVisibilityItemIndex, setIsVisibilityModalOpen]);

	// Items Repeater component (passed to ContentTab)
	const itemsRepeater = (
		<RepeaterControl<AccordionItemData>
			label={__('Items', 'voxel-fse')}
			items={attributes.items}
			onChange={handleItemsChange}
			getItemLabel={(item) => item.title || __('Item', 'voxel-fse')}
			renderContent={renderItemContent}
			createItem={() => ({
				id: generateItemId(),
				title: `Item #${attributes.items.length + 1}`,
				cssId: '',
				loop: undefined,
				visibility: undefined,
			})}
			addButtonText={__('Add Item', 'voxel-fse')}
			showClone={true}
			showDelete={true}
			minItems={1}
		/>
	);

	// Handle loop modal save
	const handleLoopModalSave = useCallback((config: LoopModalConfig) => {
		if (editingLoopItemIndex !== null) {
			const newItems = [...attributes.items];
			const loopSource = config.loopProperty
				? `@${config.loopSource}(${config.loopProperty})`
				: `@${config.loopSource}`;

			newItems[editingLoopItemIndex] = {
				...newItems[editingLoopItemIndex],
				loop: {
					source: loopSource,
					limit: config.loopLimit ? parseInt(config.loopLimit, 10) : undefined,
					offset: config.loopOffset ? parseInt(config.loopOffset, 10) : undefined,
				},
			};
			setAttributes({ items: newItems });
		}
		setIsLoopModalOpen(false);
		setEditingLoopItemIndex(null);
	}, [editingLoopItemIndex, attributes.items, setAttributes]);

	// Get current loop config for modal
	const currentLoopConfig: LoopModalConfig = editingLoopItemIndex !== null && attributes.items[editingLoopItemIndex]?.loop
		? {
			loopSource: attributes.items[editingLoopItemIndex].loop?.source?.split('(')[0]?.replace('@', '') || '',
			loopProperty: attributes.items[editingLoopItemIndex].loop?.source?.match(/\(([^)]+)\)/)?.[1] || '',
			loopLimit: attributes.items[editingLoopItemIndex].loop?.limit?.toString() || '',
			loopOffset: attributes.items[editingLoopItemIndex].loop?.offset?.toString() || '',
		}
		: {
			loopSource: '',
			loopProperty: '',
			loopLimit: '',
			loopOffset: '',
		};

	// Handle visibility modal save
	const handleVisibilityModalSave = useCallback((rules: VisibilityModalRule[]) => {
		if (editingVisibilityItemIndex !== null) {
			const newItems = [...attributes.items];
			// Convert VisibilityModalRule[] to VisibilityRule[][] (Voxel stores rules in groups)
			const convertedRules: VisibilityRule[][] = rules.map(rule => [{
				type: rule.filterKey,
				value: rule.value,
				operator: rule.operator,
			}]);

			newItems[editingVisibilityItemIndex] = {
				...newItems[editingVisibilityItemIndex],
				visibility: {
					behavior: newItems[editingVisibilityItemIndex].visibility?.behavior || 'show',
					rules: convertedRules,
				},
			};
			setAttributes({ items: newItems });
		}
		setIsVisibilityModalOpen(false);
		setEditingVisibilityItemIndex(null);
	}, [editingVisibilityItemIndex, attributes.items, setAttributes]);

	// Get current visibility rules for modal
	const currentVisibilityRules: VisibilityModalRule[] = editingVisibilityItemIndex !== null && attributes.items[editingVisibilityItemIndex]?.visibility?.rules
		? attributes.items[editingVisibilityItemIndex].visibility!.rules.flat().map((rule, idx) => ({
			id: `rule_${idx}`,
			filterKey: rule.type || '',
			operator: (rule.operator as VisibilityModalRule['operator']) || 'equals',
			value: typeof rule.value === 'string' ? rule.value : '',
		}))
		: [];

	// Generate responsive CSS for Content tab and Style tab controls (tablet/mobile overrides)
	const contentResponsiveCSS = generateContentTabResponsiveCSS(attributes, blockId);
	const styleResponsiveCSS = generateStyleTabResponsiveCSS(attributes, blockId);
	const combinedResponsiveCSS = [contentResponsiveCSS, styleResponsiveCSS].filter(Boolean).join('\n');

	return (
		<>
			<div {...blockProps}>
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
										itemsRepeater={itemsRepeater}
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
										clientId={clientId}
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

				{/* Responsive CSS for Content tab and Style tab controls */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Editor Preview */}
				<div
					className="e-n-accordion"
					aria-label={__(
						'Accordion. Open links with Enter or Space, close with Escape, and navigate with Arrow Keys',
						'voxel-fse'
					)}
					style={{
						'--n-accordion-item-title-space-between': `${attributes.itemSpacing ?? 0}px`,
						'--n-accordion-padding': attributes.accordionPadding?.desktop
							? `${attributes.accordionPadding.desktop.top || '10px'} ${attributes.accordionPadding.desktop.right || '10px'} ${attributes.accordionPadding.desktop.bottom || '10px'} ${attributes.accordionPadding.desktop.left || '10px'}`
							: '10px',
						'--n-accordion-title-normal-color': attributes.titleNormalColor || '#1f2124',
						'--n-accordion-icon-size': `${attributes.iconSize ?? 15}px`,
					} as React.CSSProperties}
				>
					{attributes.items.map((item, index) => {
						const isOpen = openItems.has(index);
						const itemId = item.cssId || `e-n-accordion-item-${attributes.blockId}-${index}`;

						return (
							<details
								key={item.id}
								id={itemId}
								className="e-n-accordion-item"
								open={isOpen}
							>
								<summary
									className="e-n-accordion-item-title"
									data-accordion-index={index + 1}
									tabIndex={0}
									aria-expanded={isOpen ? 'true' : 'false'}
									aria-controls={`${itemId}-content`}
									onClick={(e) => {
										const target = e.target as HTMLElement;

										// Allow clicking on RichText for editing
										if (target.closest('[contenteditable="true"]')) {
											e.preventDefault(); // Prevent toggle
											return;
										}

										// Prevent native toggle and handle with React state
										e.preventDefault();
										toggleItem(index);
									}}
								>
									<span className="e-n-accordion-item-title-header">
										<TitleTag className="e-n-accordion-item-title-text">
											<RichText
												tagName="span"
												value={item.title}
												onChange={(title) => updateItem(index, { title })}
												placeholder={__('Item Title', 'voxel-fse')}
												allowedFormats={[]}
											/>
										</TitleTag>
									</span>
									{(attributes.expandIcon?.value || attributes.collapseIcon?.value) && (
										<span className="e-n-accordion-item-title-icon">
											<span className="e-opened">
												<i
													className={attributes.collapseIcon?.value || 'fas fa-minus'}
													aria-hidden="true"
												></i>
											</span>
											<span className="e-closed">
												<i
													className={attributes.expandIcon?.value || 'fas fa-plus'}
													aria-hidden="true"
												></i>
											</span>
										</span>
									)}
								</summary>

								<div
									id={`${itemId}-content`}
									className="e-n-accordion-item-content e-con"
									role="region"
									aria-labelledby={itemId}
								>
									{innerBlocks[index] && BlockListBlock && (
										<BlockListBlock
											key={innerBlocks[index].clientId}
											clientId={innerBlocks[index].clientId}
											rootClientId={clientId}
										/>
									)}
								</div>
							</details>
						);
					})}
				</div>

			</div>

			{/* Loop Element Modal - Rendered via portal to .voxel-fse-tab-content */}
			{isLoopModalOpen && (() => {
				const portalTarget = document.querySelector('.voxel-fse-tab-content');
				if (!portalTarget) return null;
				return createPortal(
					<LoopElementModal
						isOpen={isLoopModalOpen}
						onClose={() => {
							setIsLoopModalOpen(false);
							setEditingLoopItemIndex(null);
						}}
						onSave={handleLoopModalSave}
						config={currentLoopConfig}
					/>,
					portalTarget
				);
			})()}

			{/* Element Visibility Modal - Rendered via portal to .voxel-fse-tab-content */}
			{isVisibilityModalOpen && (() => {
				const portalTarget = document.querySelector('.voxel-fse-tab-content');
				if (!portalTarget) return null;
				return createPortal(
					<ElementVisibilityModal
						isOpen={isVisibilityModalOpen}
						onClose={() => {
							setIsVisibilityModalOpen(false);
							setEditingVisibilityItemIndex(null);
						}}
						onSave={handleVisibilityModalSave}
						rules={currentVisibilityRules}
					/>,
					portalTarget
				);
			})()}
		</>
	);
}
