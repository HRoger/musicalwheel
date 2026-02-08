/**
 * Timeline Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the mandatory inspector folder pattern.
 * Maps to Voxel Timeline Elementor widget Content tab controls.
 *
 * Evidence:
 * - Timeline settings section: themes/voxel/app/widgets/timeline.php:L25-131
 * - Timeline icons section: themes/voxel/app/widgets/timeline.php:L133-306
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { useState } from 'react';
import {
	AccordionPanelGroup,
	AccordionPanel,
	IconPickerControl,
	DynamicTagTextControl,
	RepeaterControl,
	generateRepeaterId,
	LoopVisibilityControl,
	ElementVisibilityModal,
	type VisibilityRule,
} from '@shared/controls';
import type { BlockAttributes, OrderingOption } from '../types';
import type { IconValue } from '@shared/types';
import type { RepeaterItemRenderProps } from '@shared/controls';
import { DISPLAY_MODE_OPTIONS, ORDER_OPTIONS, TIME_OPTIONS } from '../types';

interface ContentTabProps {
	attributes: BlockAttributes;
	setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

/**
 * Content Tab Component
 *
 * Contains two accordion sections:
 * 1. Timeline settings - Display mode, ordering, search
 * 2. Timeline icons - All icon pickers for timeline UI elements
 */
export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	// State for visibility rules modal
	const [visibilityModalState, setVisibilityModalState] = useState<{
		isOpen: boolean;
		itemId: string | null;
		rules: VisibilityRule[];
	}>({
		isOpen: false,
		itemId: null,
		rules: [],
	});

	return (
		<>
			<AccordionPanelGroup
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				stateAttribute="contentTabOpenPanel"
				defaultPanel="timeline-settings"
			>
			{/* Accordion 1: Timeline settings */}
			<AccordionPanel id="timeline-settings" title={__('Timeline settings', 'voxel-fse')}>
				{/* Display mode - maps to: timeline.php:L33-46 */}
				<SelectControl
					label={__('Display mode', 'voxel-fse')}
					value={attributes.mode}
					options={DISPLAY_MODE_OPTIONS}
					onChange={(value: string) => setAttributes({ mode: value as BlockAttributes['mode'] })}
				/>

				{/* Ordering options repeater - maps to: timeline.php:L48-98 */}
				<RepeaterControl<OrderingOption>
					label={__('Ordering options', 'voxel-fse')}
					items={attributes.orderingOptions ?? []}
					onChange={(items) => setAttributes({ orderingOptions: items })}
					getItemLabel={(item) => item.label || 'Untitled'}
					createItem={() => ({
						_id: generateRepeaterId(),
						order: 'latest',
						time: 'all_time',
						timeCustom: 7,
						label: 'Latest',
						rowVisibility: 'show',
						visibilityRules: [],
					})}
					renderContent={({ item, onUpdate }: RepeaterItemRenderProps<OrderingOption>) => (
						<>
							{/* Order - maps to: timeline.php:L50-63 */}
							<SelectControl
								label={__('Order', 'voxel-fse')}
								value={item.order}
								options={ORDER_OPTIONS}
								onChange={(value: string) =>
									onUpdate({ order: value as OrderingOption['order'] })
								}
							/>

							{/* Timeframe - maps to: timeline.php:L65-77 */}
							<SelectControl
								label={__('Timeframe', 'voxel-fse')}
								value={item.time}
								options={TIME_OPTIONS}
								onChange={(value: string) =>
									onUpdate({ time: value as OrderingOption['time'] })
								}
							/>

							{/* Time Custom (conditional) - maps to: timeline.php:L79-84 */}
							{item.time === 'custom' && (
								<DynamicTagTextControl
									label={__('Show items from the past number of days', 'voxel-fse')}
									value={String(item.timeCustom ?? 7)}
									onChange={(value: string) => {
										// If dynamic tag, store as string; otherwise clamp as number
										if (value.startsWith('@tags()')) {
											onUpdate({ timeCustom: value });
										} else {
											const num = parseInt(value, 10);
											onUpdate({
												timeCustom: isNaN(num) ? 7 : Math.max(1, Math.min(365, num)),
											});
										}
									}}
								/>
							)}

							{/* Label with Dynamic Tag Support - maps to: timeline.php:L86-90 */}
							<DynamicTagTextControl
								label={__('Label', 'voxel-fse')}
								value={item.label}
								onChange={(value: string) => onUpdate({ label: value })}
							/>

							{/* Row Visibility Control */}
							<LoopVisibilityControl
								itemId={item._id}
								rowVisibility={item.rowVisibility || 'show'}
								visibilityRules={item.visibilityRules || []}
								onRowVisibilityChange={(value: 'show' | 'hide') =>
									onUpdate({ rowVisibility: value })
								}
								onEditVisibilityRules={() => {
									setVisibilityModalState({
										isOpen: true,
										itemId: item._id,
										rules: item.visibilityRules || [],
									});
								}}
								onClearVisibilityRules={() =>
									onUpdate({ visibilityRules: [] })
								}
								showLoopSection={false}
								inlineVisibilityLayout={false}
							/>
						</>
					)}
					addButtonText={__('Add Item', 'voxel-fse')}
					showClone={true}
					showDelete={true}
				/>

				{/* No posts text - maps to: timeline.php:L100-108 */}
				<div style={{ marginTop: '16px' }}>
					<TextControl
						label={__('No posts text', 'voxel-fse')}
						value={attributes.noStatusText}
						onChange={(value: string) => setAttributes({ noStatusText: value })}
						placeholder={__('Type your text', 'voxel-fse')}
					/>
				</div>

				{/* Enable search input - maps to: timeline.php:L110-118 */}
				<ToggleControl
					label={__('Enable search input', 'voxel-fse')}
					checked={attributes.searchEnabled}
					onChange={(value: boolean) => setAttributes({ searchEnabled: value })}
				/>

				{/* Default search value (conditional) - maps to: timeline.php:L121-130 */}
				{attributes.searchEnabled && (
					<DynamicTagTextControl
						label={__('Default search value', 'voxel-fse')}
						value={attributes.searchValue}
						onChange={(value: string) => setAttributes({ searchValue: value })}
						placeholder={__('@tags()@site().query_var(q)@endtags()', 'voxel-fse')}
					/>
				)}
			</AccordionPanel>

			{/* Accordion 2: Timeline icons */}
			<AccordionPanel id="timeline-icons" title={__('Timeline icons', 'voxel-fse')}>
				{/* Verified icon - maps to: timeline.php:L141-150 */}
				<IconPickerControl
					label={__('Verified', 'voxel-fse')}
					value={attributes.verifiedIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ verifiedIcon: value })}
				/>

				{/* Repost icon - maps to: timeline.php:L152-161 */}
				<IconPickerControl
					label={__('Repost', 'voxel-fse')}
					value={attributes.repostIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ repostIcon: value })}
				/>

				{/* More icon - maps to: timeline.php:L163-172 */}
				<IconPickerControl
					label={__('More', 'voxel-fse')}
					value={attributes.moreIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ moreIcon: value })}
				/>

				{/* Like icon - maps to: timeline.php:L174-183 */}
				<IconPickerControl
					label={__('Like', 'voxel-fse')}
					value={attributes.likeIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ likeIcon: value })}
				/>

				{/* Liked icon - maps to: timeline.php:L185-194 */}
				<IconPickerControl
					label={__('Liked', 'voxel-fse')}
					value={attributes.likedIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ likedIcon: value })}
				/>

				{/* Comment icon - maps to: timeline.php:L196-205 */}
				<IconPickerControl
					label={__('Comment', 'voxel-fse')}
					value={attributes.commentIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ commentIcon: value })}
				/>

				{/* Reply icon - maps to: timeline.php:L207-216 */}
				<IconPickerControl
					label={__('Reply', 'voxel-fse')}
					value={attributes.replyIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ replyIcon: value })}
				/>

				{/* Gallery icon - maps to: timeline.php:L218-227 */}
				<IconPickerControl
					label={__('Gallery', 'voxel-fse')}
					value={attributes.galleryIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ galleryIcon: value })}
				/>

				{/* Upload icon - maps to: timeline.php:L229-238 */}
				<IconPickerControl
					label={__('Upload', 'voxel-fse')}
					value={attributes.uploadIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ uploadIcon: value })}
				/>

				{/* Emoji icon - maps to: timeline.php:L240-249 */}
				<IconPickerControl
					label={__('Emoji', 'voxel-fse')}
					value={attributes.emojiIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ emojiIcon: value })}
				/>

				{/* Search icon - maps to: timeline.php:L251-260 */}
				<IconPickerControl
					label={__('Search', 'voxel-fse')}
					value={attributes.searchIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ searchIcon: value })}
				/>

				{/* Delete icon - maps to: timeline.php:L262-271 */}
				<IconPickerControl
					label={__('Delete', 'voxel-fse')}
					value={attributes.trashIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ trashIcon: value })}
				/>

				{/* External link icon - maps to: timeline.php:L273-282 */}
				<IconPickerControl
					label={__('External link', 'voxel-fse')}
					value={attributes.externalIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ externalIcon: value })}
				/>

				{/* Load more icon - maps to: timeline.php:L284-293 */}
				<IconPickerControl
					label={__('Load more', 'voxel-fse')}
					value={attributes.loadMoreIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ loadMoreIcon: value })}
				/>

				{/* No posts icon - maps to: timeline.php:L295-304 */}
				<IconPickerControl
					label={__('No posts', 'voxel-fse')}
					value={attributes.noPostsIcon || undefined}
					onChange={(value: IconValue) => setAttributes({ noPostsIcon: value })}
				/>
			</AccordionPanel>
			</AccordionPanelGroup>

			{/* Visibility Rules Modal */}
			{visibilityModalState.isOpen && (
				<ElementVisibilityModal
					isOpen={visibilityModalState.isOpen}
					onClose={() =>
						setVisibilityModalState({
							isOpen: false,
							itemId: null,
							rules: [],
						})
					}
					rules={visibilityModalState.rules}
					onSave={(rules: VisibilityRule[]) => {
						// Find the item and update its visibility rules
						const updatedOptions = attributes.orderingOptions.map((opt) =>
							opt._id === visibilityModalState.itemId
								? { ...opt, visibilityRules: rules }
								: opt
						);
						setAttributes({ orderingOptions: updatedOptions });
						setVisibilityModalState({
							isOpen: false,
							itemId: null,
							rules: [],
						});
					}}
				/>
			)}
		</>
	);
}
