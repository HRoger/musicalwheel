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
import { useState } from 'react';
import {
	ResponsiveRangeControl,
	AdvancedIconControl,
	EnableTagsButton,
	AccordionPanelGroup,
	AccordionPanel,
} from '@shared/controls';
import { DynamicTagBuilder } from '../../../shared/dynamic-tags';
import type { TermFeedAttributes } from '../types';

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
	// State for dynamic tag modals
	const [parentTermIdModalOpen, setParentTermIdModalOpen] = useState(false);
	const [perPageModalOpen, setPerPageModalOpen] = useState(false);

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
					onChange={(value) =>
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
						onChange={(value) => setAttributes({ taxonomy: value })}
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
							onChange={(value) =>
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
						onChange={(value) =>
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
							onChange={(value) =>
								setAttributes({
									perPage: parseInt(value || '10', 10),
								})
							}
							help={__('Maximum 500 terms', 'voxel-fse')}
							label=""
						/>
					</>
				)}

				{/* Manual selection - ts_manual_terms (manual mode only) */}
				{attributes.source === 'manual' && (
					<div style={{ marginBottom: '16px' }}>
						<TextControl
							label={__('Term IDs (comma-separated)', 'voxel-fse')}
							value={attributes.manualTerms.map((t) => t.term_id).join(',')}
							onChange={(value) => {
								const termIds = value
									.split(',')
									.map((id) => parseInt(id.trim(), 10))
									.filter((id) => !isNaN(id) && id > 0);
								setAttributes({
									manualTerms: termIds.map((term_id) => ({
										term_id,
									})),
								});
							}}
							help={__('Enter term IDs separated by commas', 'voxel-fse')}
						/>
					</div>
				)}

				{/* Hide empty terms? - ts_hide_empty */}
				<ToggleControl
					label={__('Hide empty terms?', 'voxel-fse')}
					checked={attributes.hideEmpty}
					onChange={(value) => setAttributes({ hideEmpty: value })}
				/>

				{/* Hide terms without a post in: - ts_hide_empty_pt (shown when hideEmpty is true) */}
				{attributes.hideEmpty && (
					<SelectControl
						label={__('Hide terms without a post in:', 'voxel-fse')}
						value={attributes.hideEmptyPostType}
						options={postTypeOptions}
						onChange={(value) => setAttributes({ hideEmptyPostType: value })}
					/>
				)}

				{/* Preview card template - ts_card_template */}
				<SelectControl
					label={__('Preview card template', 'voxel-fse')}
					value={attributes.cardTemplate}
					options={cardTemplateOptions}
					onChange={(value) => setAttributes({ cardTemplate: value })}
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
					onChange={(value) =>
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
							min={5}
							max={100}
							step={1}
							help={__(
								'Set the width of an individual item in the carousel',
								'voxel-fse'
							)}
						/>

						{/* Auto slide? - carousel_autoplay */}
						<ToggleControl
							label={__('Auto slide?', 'voxel-fse')}
							checked={attributes.carouselAutoplay}
							onChange={(value) => setAttributes({ carouselAutoplay: value })}
						/>

						{/* Auto slide interval (ms) - carousel_autoplay_interval */}
						{attributes.carouselAutoplay && (
							<TextControl
								label={__('Auto slide interval (ms)', 'voxel-fse')}
								type="number"
								value={String(attributes.carouselAutoplayInterval || '')}
								onChange={(value) =>
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
					onChange={(value) => setAttributes({ replaceAccentColor: value })}
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
					onChange={(value) => setAttributes({ rightChevronIcon: value })}
					supportsDynamicTags={true}
				/>

				{/* Left chevron - ts_chevron_left */}
				<AdvancedIconControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.leftChevronIcon}
					onChange={(value) => setAttributes({ leftChevronIcon: value })}
					supportsDynamicTags={true}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>

		{/* Dynamic Tag Builder Modals */}
		{parentTermIdModalOpen && (
			<DynamicTagBuilder
				value={String(attributes.parentTermId || '')}
				onSave={(value) => {
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
				onSave={(value) => {
					setAttributes({ perPage: parseInt(value || '10', 10) });
					setPerPageModalOpen(false);
				}}
				onClose={() => setPerPageModalOpen(false)}
				context="term"
			/>
		)}
		</>
	);
}
