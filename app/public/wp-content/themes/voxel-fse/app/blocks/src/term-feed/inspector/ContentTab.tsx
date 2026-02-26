/**
 * Term Feed Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Implements all Content tab controls from Voxel's Term_Feed widget.
 *
 * Evidence:
 * - Source: themes/voxel/app/widgets/term-feed.php:27-607
 * - Accordions:
 *   1. Term feed settings (line 27)
 *   2. Layout (line 130)
 *   3. Icons (line 579)
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl, TextControl } from '@wordpress/components';
import { useState, useCallback } from 'react';
import {
	ResponsiveRangeControl,
	AdvancedIconControl,
	EnableTagsButton,
	AccordionPanelGroup,
	AccordionPanel,
	RepeaterControl,
	LoopVisibilityControl,
	ElementVisibilityModal,
	LoopElementModal,
	generateRepeaterId,
} from '@shared/controls';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';
import type { LoopConfig } from '@shared/controls/LoopElementModal';
import { DynamicTagBuilder } from '../../../shared/dynamic-tags';
import type { TermFeedAttributes, ManualTermItem } from '../types';

interface TaxonomyOption {
	key: string;
	label: string;
}

interface PostTypeOption {
	key: string;
	label: string;
}

interface CardTemplateOption {
	id: string;
	label: string;
}

interface ContentTabProps {
	attributes: TermFeedAttributes;
	setAttributes: (attrs: Partial<TermFeedAttributes>) => void;
	taxonomies: TaxonomyOption[];
	postTypes: PostTypeOption[];
	cardTemplates: CardTemplateOption[];
}

export function ContentTab({
	attributes,
	setAttributes,
	taxonomies,
	postTypes,
	cardTemplates,
}: ContentTabProps): JSX.Element {
	// State for dynamic tag modals (filters mode)
	const [parentTermIdModalOpen, setParentTermIdModalOpen] = useState(false);
	const [perPageModalOpen, setPerPageModalOpen] = useState(false);

	// State for repeater item dynamic tag modal (term_id field)
	const [termIdModalOpen, setTermIdModalOpen] = useState(false);
	const [editingTermItemId, setEditingTermItemId] = useState<string | null>(null);

	// State for visibility rules modal (repeater items)
	const [rulesModalOpen, setRulesModalOpen] = useState(false);
	const [editingRulesItemId, setEditingRulesItemId] = useState<string | null>(null);

	// State for loop modal (repeater items)
	const [loopModalOpen, setLoopModalOpen] = useState(false);
	const [editingLoopItemId, setEditingLoopItemId] = useState<string | null>(null);

	// Build post type options for dropdown
	const postTypeOptions = [
		{ value: ':all', label: __('Any post type', 'voxel-fse') },
		...postTypes.map((pt) => ({ value: pt.key, label: pt.label })),
	];

	// Build taxonomy options for dropdown
	const taxonomyOptions = taxonomies.map((tax) => ({
		value: tax.key,
		label: tax.label,
	}));

	// Build card template options for dropdown
	const cardTemplateOptions = cardTemplates.map((template) => ({
		value: template.id,
		label: template.label,
	}));

	// --- Repeater helpers (manual mode) ---

	const createManualTermItem = useCallback((): ManualTermItem => ({
		id: generateRepeaterId(),
		term_id: 0,
		rowVisibility: 'show',
		visibilityRules: [],
	}), []);

	const getTermItemLabel = useCallback((_item: ManualTermItem, index: number) => {
		return `${__('Item', 'voxel-fse')} #${index + 1}`;
	}, []);

	// Handle edit visibility rules from repeater item
	const handleEditRules = useCallback((itemId: string) => {
		setEditingRulesItemId(itemId);
		setRulesModalOpen(true);
	}, []);

	const handleSaveRules = useCallback((rules: VisibilityRule[]) => {
		if (!editingRulesItemId) return;
		const updatedItems = attributes.manualTerms.map((item) =>
			item.id === editingRulesItemId
				? { ...item, visibilityRules: rules }
				: item
		);
		setAttributes({ manualTerms: updatedItems });
		setRulesModalOpen(false);
		setEditingRulesItemId(null);
	}, [editingRulesItemId, attributes.manualTerms, setAttributes]);

	// Handle edit loop from repeater item
	const handleEditLoop = useCallback((itemId: string) => {
		setEditingLoopItemId(itemId);
		setLoopModalOpen(true);
	}, []);

	const handleSaveLoop = useCallback((config: LoopConfig) => {
		if (!editingLoopItemId) return;
		const updatedItems = attributes.manualTerms.map((item) =>
			item.id === editingLoopItemId
				? {
					...item,
					loopSource: config.loopSource,
					loopProperty: config.loopProperty || '',
					loopLimit: config.loopLimit,
					loopOffset: config.loopOffset,
				}
				: item
		);
		setAttributes({ manualTerms: updatedItems as any });
		setLoopModalOpen(false);
		setEditingLoopItemId(null);
	}, [editingLoopItemId, attributes.manualTerms, setAttributes]);

	// Get editing items for modals
	const editingRulesItem = editingRulesItemId
		? attributes.manualTerms.find((item) => item.id === editingRulesItemId)
		: null;

	const editingLoopItem = editingLoopItemId
		? attributes.manualTerms.find((item) => item.id === editingLoopItemId)
		: null;

	const editingTermItem = editingTermItemId
		? attributes.manualTerms.find((item) => item.id === editingTermItemId)
		: null;

	return (
		<>
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="term-feed-settings"
		>
			{/* Accordion 1: Term feed settings */}
			<AccordionPanel
				id="term-feed-settings"
				title={__('Term feed settings', 'voxel-fse')}
			>
				{/* Data source - ts_source */}
				<SelectControl
					label={__('Data source', 'voxel-fse')}
					value={attributes.source}
					options={[
						{
							value: 'filters',
							label: __('Filters', 'voxel-fse'),
						},
						{
							value: 'manual',
							label: __('Manual selection', 'voxel-fse'),
						},
					]}
					onChange={(value: string) =>
						setAttributes({
							source: value as 'filters' | 'manual',
						})
					}
				/>

				{/* Choose taxonomy - ts_choose_taxonomy (filters mode only) */}
				{attributes.source === 'filters' && (
					<SelectControl
						label={__('Choose taxonomy', 'voxel-fse')}
						value={attributes.taxonomy}
						options={taxonomyOptions}
						onChange={(value: string) => setAttributes({ taxonomy: value })}
					/>
				)}

				{/* Direct children of (Term ID) - ts_parent_term_id (filters mode only) */}
				{attributes.source === 'filters' && (
					<>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
							<EnableTagsButton onClick={() => setParentTermIdModalOpen(true)} />
							<label style={{ margin: 0, fontWeight: 500 }}>
								{__('Direct children of (Term ID)', 'voxel-fse')}
							</label>
						</div>
						<TextControl
							type="number"
							value={String(attributes.parentTermId || '')}
							onChange={(value: string) =>
								setAttributes({
									parentTermId: parseInt(value || '0', 10),
								})
							}
							help={__('Enter 0 for top-level terms', 'voxel-fse')}
							label=""
						/>
					</>
				)}

				{/* Order - ts_order (filters mode only) */}
				{attributes.source === 'filters' && (
					<SelectControl
						label={__('Order', 'voxel-fse')}
						value={attributes.order}
						options={[
							{
								value: 'default',
								label: __('Default', 'voxel-fse'),
							},
							{
								value: 'name',
								label: __('Alphabetical', 'voxel-fse'),
							},
						]}
						onChange={(value: string) =>
							setAttributes({
								order: value as 'default' | 'name',
							})
						}
					/>
				)}

				{/* Number of terms to load - ts_per_page (filters mode only) */}
				{attributes.source === 'filters' && (
					<>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
							<EnableTagsButton onClick={() => setPerPageModalOpen(true)} />
							<label style={{ margin: 0, fontWeight: 500 }}>
								{__('Number of terms to load', 'voxel-fse')}
							</label>
						</div>
						<TextControl
							type="number"
							value={String(attributes.perPage || '')}
							onChange={(value: string) =>
								setAttributes({
									perPage: parseInt(value || '10', 10),
								})
							}
							help={__('Maximum 500 terms', 'voxel-fse')}
							label=""
						/>
					</>
				)}

				{/* Manual selection - ts_manual_terms (manual mode only)
				 * PARITY: Matches Voxel Elementor repeater with term_id + loop + visibility
				 * Evidence: themes/voxel/app/widgets/term-feed.php:44-56
				 */}
				{attributes.source === 'manual' && (
					<RepeaterControl<ManualTermItem>
						label={__('Choose terms', 'voxel-fse')}
						items={attributes.manualTerms}
						onChange={(items) => setAttributes({ manualTerms: items })}
						createItem={createManualTermItem}
						getItemLabel={getTermItemLabel}
						addButtonText={__('Add Item', 'voxel-fse')}
						attributes={attributes as Record<string, any>}
						setAttributes={setAttributes as (attrs: Record<string, any>) => void}
						renderContent={({ item, onUpdate }) => (
							<div className="voxel-fse-term-item-editor">
								{/* Dynamic tag button + Term ID field */}
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<EnableTagsButton onClick={() => {
										setEditingTermItemId(item.id);
										setTermIdModalOpen(true);
									}} />
									<label style={{ margin: 0, fontWeight: 500 }}>
										{__('Term ID', 'voxel-fse')}
									</label>
								</div>
								<TextControl
									type="number"
									value={String(item.term_id || '')}
									onChange={(value: string) =>
										onUpdate({ term_id: parseInt(value || '0', 10) } as Partial<ManualTermItem>)
									}
									label=""
								/>

								{/* Loop & Visibility controls - matches Voxel Elementor */}
								<LoopVisibilityControl
									showLoopSection={true}
									loopSource={item.loopSource}
									loopProperty={item.loopProperty}
									loopLimit={String(item.loopLimit ?? '')}
									loopOffset={String(item.loopOffset ?? '')}
									onEditLoop={() => handleEditLoop(item.id)}
									onClearLoop={() => onUpdate({
										loopSource: '',
										loopProperty: '',
										loopLimit: '',
										loopOffset: '',
									} as Partial<ManualTermItem>)}
									onLoopLimitChange={(value) => onUpdate({ loopLimit: value } as Partial<ManualTermItem>)}
									onLoopOffsetChange={(value) => onUpdate({ loopOffset: value } as Partial<ManualTermItem>)}
									rowVisibility={item.rowVisibility || 'show'}
									visibilityRules={item.visibilityRules || []}
									onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value } as Partial<ManualTermItem>)}
									onEditVisibilityRules={() => handleEditRules(item.id)}
									onClearVisibilityRules={() => onUpdate({
										visibilityRules: [],
										rowVisibility: 'show',
									} as Partial<ManualTermItem>)}
								/>
							</div>
						)}
					/>
				)}

				{/* Hide empty terms? - ts_hide_empty */}
				<ToggleControl
					label={__('Hide empty terms?', 'voxel-fse')}
					checked={attributes.hideEmpty}
					onChange={(value: boolean) => setAttributes({ hideEmpty: value })}
				/>

				{/* Hide terms without a post in: - ts_hide_empty_pt (shown when hideEmpty is true) */}
				{attributes.hideEmpty && (
					<SelectControl
						label={__('Hide terms without a post in:', 'voxel-fse')}
						value={attributes.hideEmptyPostType}
						options={postTypeOptions}
						onChange={(value: string) => setAttributes({ hideEmptyPostType: value })}
					/>
				)}

				{/* Preview card template - ts_card_template */}
				<SelectControl
					label={__('Preview card template', 'voxel-fse')}
					value={attributes.cardTemplate}
					options={cardTemplateOptions}
					onChange={(value: string) => setAttributes({ cardTemplate: value })}
				/>
			</AccordionPanel>

			{/* Accordion 2: Layout */}
			<AccordionPanel id="layout" title={__('Layout', 'voxel-fse')}>
				{/* Mode - ts_wrap_feed */}
				<SelectControl
					label={__('Mode', 'voxel-fse')}
					value={attributes.layoutMode}
					options={[
						{
							value: 'ts-feed-grid-default',
							label: __('Grid', 'voxel-fse'),
						},
						{
							value: 'ts-feed-nowrap',
							label: __('Carousel', 'voxel-fse'),
						},
					]}
					onChange={(value: string) =>
						setAttributes({
							layoutMode: value as 'ts-feed-grid-default' | 'ts-feed-nowrap',
						})
					}
				/>

				{/* Carousel-specific settings */}
				{attributes.layoutMode === 'ts-feed-nowrap' && (
					<>
						{/* Item width - ts_nowrap_item_width */}
						<ResponsiveRangeControl
							label={__('Item width', 'voxel-fse')}
							attributes={attributes as Record<string, any>}
							setAttributes={
								setAttributes as (attrs: Record<string, any>) => void
							}
							attributeBaseName="carouselItemWidth"
							min={0}
							max={attributes.carouselItemWidthUnit === '%' ? 100 : 800}
							step={1}
							availableUnits={['px', '%']}
							unitAttributeName="carouselItemWidthUnit"
							help={__(
								'Set the width of an individual item in the carousel',
								'voxel-fse'
							)}
						/>

						{/* Auto slide? - carousel_autoplay */}
						<ToggleControl
							label={__('Auto slide?', 'voxel-fse')}
							checked={attributes.carouselAutoplay}
							onChange={(value: boolean) => setAttributes({ carouselAutoplay: value })}
						/>

						{/* Auto slide interval (ms) - carousel_autoplay_interval */}
						{attributes.carouselAutoplay && (
							<TextControl
								label={__('Auto slide interval (ms)', 'voxel-fse')}
								type="number"
								value={String(attributes.carouselAutoplayInterval || '')}
								onChange={(value: string) =>
									setAttributes({
										carouselAutoplayInterval: parseInt(
											value || '3000',
											10
										),
									})
								}
								help={__('Minimum 500ms recommended', 'voxel-fse')}
							/>
						)}

						{/* Scroll padding - ts_scroll_padding */}
						<ResponsiveRangeControl
							label={__('Scroll padding', 'voxel-fse')}
							attributes={attributes as Record<string, any>}
							setAttributes={
								setAttributes as (attrs: Record<string, any>) => void
							}
							attributeBaseName="scrollPadding"
							min={0}
							max={100}
							step={1}
							help={__(
								'Adds padding to the scrollable area, useful in full width layouts or in responsive mode',
								'voxel-fse'
							)}
						/>

						{/* Item padding - ts_item_padding */}
						<ResponsiveRangeControl
							label={__('Item padding', 'voxel-fse')}
							attributes={attributes as Record<string, any>}
							setAttributes={
								setAttributes as (attrs: Record<string, any>) => void
							}
							attributeBaseName="itemPadding"
							min={0}
							max={100}
							step={1}
							help={__('Adds padding to an individual item', 'voxel-fse')}
						/>
					</>
				)}

				{/* Grid-specific settings */}
				{attributes.layoutMode === 'ts-feed-grid-default' && (
					<ResponsiveRangeControl
						label={__('Number of columns', 'voxel-fse')}
						attributes={attributes as Record<string, any>}
						setAttributes={setAttributes as (attrs: Record<string, any>) => void}
						attributeBaseName="gridColumns"
						min={1}
						max={6}
						step={1}
					/>
				)}

				{/* Item gap - ts_feed_col_gap */}
				<ResponsiveRangeControl
					label={__('Item gap', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="itemGap"
					min={0}
					max={100}
					step={1}
					help={__('Adds gap between the items', 'voxel-fse')}
				/>

				{/* Replace accent color? - mod_accent */}
				<ToggleControl
					label={__('Replace accent color?', 'voxel-fse')}
					checked={attributes.replaceAccentColor}
					onChange={(value: boolean) => setAttributes({ replaceAccentColor: value })}
					help={__(
						'Replaces the color of any element utilizing accent color to the term color',
						'voxel-fse'
					)}
				/>
			</AccordionPanel>

			{/* Accordion 3: Icons */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				{/* Right chevron - ts_chevron_right */}
				<AdvancedIconControl
					label={__('Right chevron', 'voxel-fse')}
					value={attributes.rightChevronIcon}
					onChange={(value: any) => setAttributes({ rightChevronIcon: value })}
					supportsDynamicTags={true}
				/>

				{/* Left chevron - ts_chevron_left */}
				<AdvancedIconControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.leftChevronIcon}
					onChange={(value: any) => setAttributes({ leftChevronIcon: value })}
					supportsDynamicTags={true}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>

		{/* Dynamic Tag Builder Modals (filters mode) */}
		{parentTermIdModalOpen && (
			<DynamicTagBuilder
				value={String(attributes.parentTermId || '')}
				onChange={(value: string) => {
					setAttributes({ parentTermId: parseInt(value || '0', 10) });
					setParentTermIdModalOpen(false);
				}}
				onClose={() => setParentTermIdModalOpen(false)}
				context="term"
			/>
		)}

		{perPageModalOpen && (
			<DynamicTagBuilder
				value={String(attributes.perPage || '')}
				onChange={(value: string) => {
					setAttributes({ perPage: parseInt(value || '10', 10) });
					setPerPageModalOpen(false);
				}}
				onClose={() => setPerPageModalOpen(false)}
				context="term"
			/>
		)}

		{/* Dynamic Tag Builder Modal for repeater item term_id */}
		{termIdModalOpen && editingTermItem && (
			<DynamicTagBuilder
				value={String(editingTermItem.term_id || '')}
				onChange={(value: string) => {
					const updatedItems = attributes.manualTerms.map((item) =>
						item.id === editingTermItemId
							? { ...item, term_id: parseInt(value || '0', 10) }
							: item
					);
					setAttributes({ manualTerms: updatedItems });
					setTermIdModalOpen(false);
					setEditingTermItemId(null);
				}}
				onClose={() => {
					setTermIdModalOpen(false);
					setEditingTermItemId(null);
				}}
				context="term"
			/>
		)}

		{/* Visibility Rules Modal for repeater items */}
		<ElementVisibilityModal
			isOpen={rulesModalOpen}
			onClose={() => {
				setRulesModalOpen(false);
				setEditingRulesItemId(null);
			}}
			rules={editingRulesItem?.visibilityRules || []}
			onSave={handleSaveRules}
		/>

		{/* Loop Element Modal for repeater items */}
		<LoopElementModal
			isOpen={loopModalOpen}
			onClose={() => {
				setLoopModalOpen(false);
				setEditingLoopItemId(null);
			}}
			config={{
				loopSource: editingLoopItem?.loopSource || '',
				loopProperty: editingLoopItem?.loopProperty || '',
				loopLimit: editingLoopItem?.loopLimit || '',
				loopOffset: editingLoopItem?.loopOffset || '',
			}}
			onSave={handleSaveLoop}
		/>
		</>
	);
}
