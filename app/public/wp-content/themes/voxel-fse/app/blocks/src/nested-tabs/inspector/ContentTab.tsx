/**
 * Nested Tabs Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability following the mandatory inspector folder pattern.
 * Maps to Voxel Nested Tabs Elementor widget Content tab controls.
 *
 * Accordions:
 * 1. Tabs - Tab items repeater with Title, Icon, CSS ID, Loop repeater row, Row visibility, Direction, Justify, Align Title
 * 2. Additional Settings - Horizontal Scroll, Breakpoint
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { TextControl, SelectControl } from '@wordpress/components';
import { useState, useCallback } from 'react';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ChooseControl,
	IconPickerControl,
	RepeaterControl,
	LoopVisibilityControl,
	LoopElementModal,
	ElementVisibilityModal,
	EnableTagsButton,
	ResponsiveSelectControl,
	type LoopConfig,
	type VisibilityRule,
	generateRepeaterId,
} from '@shared/controls';
import type { NestedTabsAttributes, TabItemData } from '../types';

interface ContentTabProps {
	attributes: NestedTabsAttributes;
	setAttributes: (attrs: Partial<NestedTabsAttributes>) => void;
	isVerticalLayout: boolean;
	onTabsChange: (tabs: TabItemData[]) => void;
}

/**
 * Direction options for tab layout
 * Maps to Elementor's tabs_direction control
 * Using Elementor icons (eicon-v-align-*)
 */
const DIRECTION_OPTIONS = [
	{ value: 'block-start', title: __('Top', 'voxel-fse'), icon: 'eicon-v-align-top' },
	{ value: 'block-end', title: __('Bottom', 'voxel-fse'), icon: 'eicon-v-align-bottom' },
	{ value: 'inline-end', title: __('End', 'voxel-fse'), icon: 'eicon-h-align-right' },
	{ value: 'inline-start', title: __('Start', 'voxel-fse'), icon: 'eicon-h-align-left' },
];

/**
 * Justify options for horizontal layout
 * Using Elementor icons (eicon-align-start-h, etc.)
 */
const JUSTIFY_HORIZONTAL_OPTIONS = [
	{ value: 'start', title: __('Start', 'voxel-fse'), icon: 'eicon-align-start-h' },
	{ value: 'center', title: __('Center', 'voxel-fse'), icon: 'eicon-align-center-h' },
	{ value: 'end', title: __('End', 'voxel-fse'), icon: 'eicon-align-end-h' },
	{ value: 'stretch', title: __('Stretch', 'voxel-fse'), icon: 'eicon-align-stretch-h' },
];

/**
 * Title alignment options
 * Using Elementor icons (eicon-text-align-*)
 */
const TITLE_ALIGNMENT_OPTIONS = [
	{ value: 'start', title: __('Start', 'voxel-fse'), icon: 'eicon-text-align-left' },
	{ value: 'center', title: __('Center', 'voxel-fse'), icon: 'eicon-text-align-center' },
	{ value: 'end', title: __('End', 'voxel-fse'), icon: 'eicon-text-align-right' },
];

/**
 * Horizontal scroll options
 */
const HORIZONTAL_SCROLL_OPTIONS = [
	{ value: 'disable', label: __('Disable', 'voxel-fse') },
	{ value: 'enable', label: __('Enable', 'voxel-fse') },
];

/**
 * Breakpoint options for accordion fallback
 */
const BREAKPOINT_OPTIONS = [
	{ value: 'none', label: __('None', 'voxel-fse') },
	{ value: 'mobile', label: __('Mobile Portrait', 'voxel-fse') },
	{ value: 'tablet', label: __('Tablet Portrait', 'voxel-fse') },
];

/**
 * Content Tab Component
 *
 * Contains two accordion sections:
 * 1. Tabs - Tab items repeater with all tab-level settings
 * 2. Additional Settings - Scroll and breakpoint options
 */
export function ContentTab({
	attributes,
	setAttributes,
	isVerticalLayout,
	onTabsChange,
}: ContentTabProps): JSX.Element {
	// Modal states for loop and visibility
	const [loopModalOpen, setLoopModalOpen] = useState(false);
	const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
	const [editingTabIndex, setEditingTabIndex] = useState<number | null>(null);

	// Ensure tabs is always an array
	const tabs = Array.isArray(attributes.tabs) ? attributes.tabs : [];

	/**
	 * Create a new tab item with default values
	 */
	const createTabItem = useCallback((): TabItemData => ({
		id: `tab-${generateRepeaterId()}`,
		title: `Tab #${tabs.length + 1}`,
		cssId: '',
		icon: null,
		iconActive: null,
		loopConfig: undefined,
		rowVisibility: 'show',
		visibilityRules: [],
	}), [tabs.length]);

	/**
	 * Get label for tab item in repeater
	 */
	const getTabLabel = useCallback((tab: TabItemData, index: number): string => {
		return tab.title || `Tab #${index + 1}`;
	}, []);

	/**
	 * Handle opening loop modal for a specific tab
	 */
	const handleEditLoop = useCallback((index: number) => {
		setEditingTabIndex(index);
		setLoopModalOpen(true);
	}, []);

	/**
	 * Handle opening visibility modal for a specific tab
	 */
	const handleEditVisibility = useCallback((index: number) => {
		setEditingTabIndex(index);
		setVisibilityModalOpen(true);
	}, []);

	/**
	 * Handle loop config save
	 */
	const handleLoopSave = useCallback((config: LoopConfig | null) => {
		if (editingTabIndex !== null) {
			const newTabs = [...tabs];
			newTabs[editingTabIndex] = {
				...newTabs[editingTabIndex],
				loopConfig: config || undefined,
			};
			onTabsChange(newTabs);
		}
		setLoopModalOpen(false);
		setEditingTabIndex(null);
	}, [editingTabIndex, tabs, onTabsChange]);

	/**
	 * Handle visibility rules save
	 */
	const handleVisibilitySave = useCallback((rules: VisibilityRule[]) => {
		if (editingTabIndex !== null) {
			const newTabs = [...tabs];
			newTabs[editingTabIndex] = {
				...newTabs[editingTabIndex],
				visibilityRules: rules,
			};
			onTabsChange(newTabs);
		}
		setVisibilityModalOpen(false);
		setEditingTabIndex(null);
	}, [editingTabIndex, tabs, onTabsChange]);

	/**
	 * Render the content for each tab item in the repeater
	 */
	const renderTabContent = useCallback(({ item, index, onUpdate }: {
		item: TabItemData;
		index: number;
		onUpdate: (updates: Partial<TabItemData>) => void;
	}) => {
		return (
			<div className="voxel-fse-tab-item-content">
				{/* Title with EnableTagsButton */}
				<div className="voxel-fse-control-with-tags">
					<div className="voxel-fse-control-header">
						<EnableTagsButton onClick={() => {}} />
						<span className="voxel-fse-dynamic-tag-label">{__('Edit with AI', 'voxel-fse')}</span>
					</div>
					<TextControl
						label={__('Title', 'voxel-fse')}
						value={item.title}
						onChange={(title) => onUpdate({ title })}
						__nextHasNoMarginBottom
					/>
				</div>

				{/* Icon - with margin-top */}
				<div style={{ marginTop: '10px' }}>
					<IconPickerControl
						label={__('Icon', 'voxel-fse')}
						value={item.icon ?? undefined}
						onChange={(icon) => onUpdate({ icon: icon ?? null })}
					/>
				</div>

				{/* CSS ID with EnableTagsButton */}
				<div className="voxel-fse-control-with-tags">
					<div className="voxel-fse-control-header">
						<EnableTagsButton onClick={() => {}} />
						<span className="voxel-fse-dynamic-tag-label">{__('Edit with AI', 'voxel-fse')}</span>
					</div>
					<TextControl
						label={__('CSS ID', 'voxel-fse')}
						value={item.cssId}
						onChange={(cssId) => onUpdate({ cssId })}
						__nextHasNoMarginBottom
					/>
				</div>

				{/* Loop Repeater Row and Row Visibility using LoopVisibilityControl */}
				<LoopVisibilityControl
					showLoopSection={true}
					loopSource={item.loopConfig?.source}
					loopProperty={item.loopConfig?.property}
					loopLimit={item.loopConfig?.limit}
					loopOffset={item.loopConfig?.offset}
					onEditLoop={() => handleEditLoop(index)}
					onClearLoop={() => onUpdate({ loopConfig: undefined })}
					onLoopLimitChange={(value) => onUpdate({
						loopConfig: { ...item.loopConfig, limit: value } as LoopConfig
					})}
					onLoopOffsetChange={(value) => onUpdate({
						loopConfig: { ...item.loopConfig, offset: value } as LoopConfig
					})}
					rowVisibility={item.rowVisibility || 'show'}
					visibilityRules={item.visibilityRules || []}
					onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
					onEditVisibilityRules={() => handleEditVisibility(index)}
					onClearVisibilityRules={() => onUpdate({ visibilityRules: [] })}
				/>
			</div>
		);
	}, [handleEditLoop, handleEditVisibility]);

	return (
		<>
			<AccordionPanelGroup
				attributes={attributes as Record<string, any>}
				setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				stateAttribute="contentTabOpenPanel"
				defaultPanel="tabs"
			>
				{/* Accordion 1: Tabs */}
				<AccordionPanel id="tabs" title={__('Tabs', 'voxel-fse')}>
					{/* Tabs Items Repeater */}
					<RepeaterControl<TabItemData>
						label={__('Tabs Items', 'voxel-fse')}
						items={tabs}
						onChange={onTabsChange}
						getItemLabel={getTabLabel}
						createItem={createTabItem}
						renderContent={renderTabContent}
						addButtonText={__('Add Item', 'voxel-fse')}
						showClone={true}
						showDelete={true}
						minItems={1}
					/>

					{/* Direction - Responsive ChooseControl with Elementor icons */}
					<ChooseControl
						label={__('Direction', 'voxel-fse')}
						value={attributes.tabsDirection?.desktop || 'block-start'}
						onChange={(value) =>
							setAttributes({
								tabsDirection: { ...attributes.tabsDirection, desktop: value as any },
							})
						}
						options={DIRECTION_OPTIONS}
					/>

					{/* Justify - Only for horizontal layouts */}
					{!isVerticalLayout && (
						<ChooseControl
							label={__('Justify', 'voxel-fse')}
							value={attributes.tabsJustifyHorizontal?.desktop || 'start'}
							onChange={(value) =>
								setAttributes({
									tabsJustifyHorizontal: { ...attributes.tabsJustifyHorizontal, desktop: value as any },
								})
							}
							options={JUSTIFY_HORIZONTAL_OPTIONS}
						/>
					)}

					{/* Align Title */}
					<ChooseControl
						label={__('Align Title', 'voxel-fse')}
						value={attributes.titleAlignment?.desktop || 'center'}
						onChange={(value) =>
							setAttributes({
								titleAlignment: { ...attributes.titleAlignment, desktop: value as any },
							})
						}
						options={TITLE_ALIGNMENT_OPTIONS}
					/>
				</AccordionPanel>

				{/* Accordion 2: Additional Settings */}
				<AccordionPanel id="additional-settings" title={__('Additional Settings', 'voxel-fse')}>
					{/* Horizontal Scroll - Responsive SelectControl - Only for horizontal layouts */}
					{!isVerticalLayout && (
						<ResponsiveSelectControl
							label={__('Horizontal Scroll', 'voxel-fse')}
							value={attributes.horizontalScroll?.desktop || 'disable'}
							valueTablet={attributes.horizontalScroll?.tablet}
							valueMobile={attributes.horizontalScroll?.mobile}
							onChange={(value) =>
								setAttributes({
									horizontalScroll: { ...attributes.horizontalScroll, desktop: value as any },
								})
							}
							onChangeTablet={(value) =>
								setAttributes({
									horizontalScroll: { ...attributes.horizontalScroll, tablet: value as any },
								})
							}
							onChangeMobile={(value) =>
								setAttributes({
									horizontalScroll: { ...attributes.horizontalScroll, mobile: value as any },
								})
							}
							options={HORIZONTAL_SCROLL_OPTIONS}
							controlKey="nested-tabs-horizontal-scroll"
							help={__("Scroll tabs if they don't fit into their parent container.", 'voxel-fse')}
						/>
					)}

					{/* Breakpoint */}
					<SelectControl
						label={__('Breakpoint', 'voxel-fse')}
						value={attributes.breakpointSelector || 'mobile'}
						onChange={(value) => setAttributes({ breakpointSelector: value as NestedTabsAttributes['breakpointSelector'] })}
						options={BREAKPOINT_OPTIONS}
						help={__('Choose at which breakpoint tabs will automatically switch to a vertical ("accordion") layout.', 'voxel-fse')}
						__nextHasNoMarginBottom
					/>
				</AccordionPanel>
			</AccordionPanelGroup>

			{/* Loop Modal */}
			{loopModalOpen && editingTabIndex !== null && (
				<LoopElementModal
					isOpen={loopModalOpen}
					onClose={() => {
						setLoopModalOpen(false);
						setEditingTabIndex(null);
					}}
					initialConfig={tabs[editingTabIndex]?.loopConfig || null}
					onSave={handleLoopSave}
				/>
			)}

			{/* Visibility Modal */}
			{visibilityModalOpen && editingTabIndex !== null && (
				<ElementVisibilityModal
					isOpen={visibilityModalOpen}
					onClose={() => {
						setVisibilityModalOpen(false);
						setEditingTabIndex(null);
					}}
					rules={tabs[editingTabIndex]?.visibilityRules || []}
					onSave={handleVisibilitySave}
				/>
			)}
		</>
	);
}
