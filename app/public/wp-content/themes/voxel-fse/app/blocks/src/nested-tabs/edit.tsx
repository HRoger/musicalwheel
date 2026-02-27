/**
 * Nested Tabs Block - Editor Component
 *
 * Uses InnerBlocks for real content editing.
 * Each tab has its own content container that can hold any blocks.
 *
 * @package VoxelFSE
 */

import {
	useBlockProps,
	InspectorControls,
} from '@wordpress/block-editor';

// Access these from WordPress globals - ESM imports don't work with externalized modules
const blockEditorStore = 'core/block-editor';
const useInnerBlocksProps = (window as any).wp?.blockEditor?.useInnerBlocksProps;
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from 'react';
// @ts-ignore
import { useSelect, useDispatch } from '@wordpress/data';

// Access createBlock from WordPress global - ESM imports don't work with externalized modules
const createBlock = (window as any).wp?.blocks?.createBlock;

import type { EditProps, TabItemData } from './types';
import {
	InspectorTabs,
} from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import { generateNestedTabsResponsiveCSS } from './styles';



// Default tab template
const createDefaultTab = (index: number): TabItemData => ({
	id: `tab-${Date.now()}-${index}`,
	title: `Tab #${index + 1}`,
	cssId: '',
	icon: null,
	iconActive: null,
});

// Create inner block template for a tab
const createTabBlock = (tab: TabItemData) => {
	return createBlock(
		'core/group',
		{
			className: 'vxfse-tab-panel',
			metadata: { name: tab.title },
		},
		[createBlock('core/paragraph', { placeholder: __('Add content for this tab...', 'voxel-fse') })]
	);
};

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	// Get blockId from attributes or use clientId as fallback
	const blockId = attributes.blockId || clientId;

	// Ensure tabs is always an array to prevent "Cannot read properties of undefined (reading 'length')"
	const tabs = Array.isArray(attributes.tabs) ? attributes.tabs : [];

	const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

	// Get inner blocks info
	// @ts-ignore - useSelect accepts dependency array as second argument
	const { innerBlocks } = useSelect(
		(select: any) => {
			const { getBlocks } = select(blockEditorStore);
			const blocks = getBlocks(clientId);
			return {
				innerBlocks: blocks,
			};
		},
		[clientId]
	);

	const { replaceInnerBlocks, selectBlock } = useDispatch(blockEditorStore) as any;

	// Set blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	/**
	 * Inject Voxel Template Tabs CSS for Editor
	 */
	useEffect(() => {
		const cssId = 'voxel-template-tabs-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/template-tabs.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Initialize inner blocks when component mounts or tabs change
	useEffect(() => {
		// If we have tabs but no inner blocks, create them
		if (tabs.length > 0 && innerBlocks.length === 0) {
			const blocks = tabs.map((tab) => createTabBlock(tab));
			replaceInnerBlocks(clientId, blocks, false);
		}
		// If inner blocks count doesn't match tabs, sync them
		else if (innerBlocks.length !== tabs.length && tabs.length > 0) {
			// Add missing blocks or remove extras
			if (innerBlocks.length < tabs.length) {
				const newBlocks = [...innerBlocks];
				for (let i = innerBlocks.length; i < tabs.length; i++) {
					newBlocks.push(createTabBlock(tabs[i]));
				}
				replaceInnerBlocks(clientId, newBlocks, false);
			}
		}
	}, [tabs.length, innerBlocks.length, clientId, replaceInnerBlocks]);

	// Update a single tab
	// @ts-ignore -- unused but kept for future use
	const _updateTab = useCallback(
		(index: number, updates: Partial<TabItemData>) => {
			const newTabs = [...tabs];
			newTabs[index] = { ...newTabs[index], ...updates };
			setAttributes({ tabs: newTabs });
		},
		[tabs, setAttributes]
	);

	// @ts-ignore -- unused but kept for future use
	// Add new tab
	const _addTab = useCallback(() => {
		const newTab = createDefaultTab(tabs.length);
		const newTabs = [...tabs, newTab];
		setAttributes({ tabs: newTabs });

		// Add corresponding inner block
		const newBlock = createTabBlock(newTab);
		replaceInnerBlocks(clientId, [...innerBlocks, newBlock], false);
		setActiveTabIndex(newTabs.length - 1);
	}, [tabs, setAttributes, clientId, innerBlocks, replaceInnerBlocks]);

// @ts-ignore -- unused but kept for future use

	// Remove tab
	const _removeTab = useCallback(
		(index: number) => {
			if (tabs.length <= 1) return;

			const newTabs = tabs.filter((_, i) => i !== index);
			setAttributes({ tabs: newTabs });

			// Remove corresponding inner block
			const newBlocks = innerBlocks.filter((_: any, i: number) => i !== index);
			replaceInnerBlocks(clientId, newBlocks, false);

			if (activeTabIndex >= newTabs.length) {
				setActiveTabIndex(newTabs.length - 1);
			} else if (activeTabIndex === index && index > 0) {
				setActiveTabIndex(index - 1);
			}
		},
		[tabs, setAttributes, activeTabIndex, clientId, innerBlocks, replaceInnerBlocks]
	// @ts-ignore -- unused but kept for future use
	);

	// Move tab up/down
	// @ts-ignore -- unused but kept for future use
	const _moveTab = useCallback(
		(index: number, direction: 'up' | 'down') => {
			const newIndex = direction === 'up' ? index - 1 : index + 1;
			if (newIndex < 0 || newIndex >= tabs.length) return;

			// Swap tabs
			const newTabs = [...tabs];
			[newTabs[index], newTabs[newIndex]] = [newTabs[newIndex], newTabs[index]];
			setAttributes({ tabs: newTabs });

			// Swap inner blocks
			const newBlocks = [...innerBlocks];
			[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
			replaceInnerBlocks(clientId, newBlocks, false);

			// Update active index
			if (activeTabIndex === index) {
				setActiveTabIndex(newIndex);
			} else if (activeTabIndex === newIndex) {
				setActiveTabIndex(index);
			}
		},
		[tabs, setAttributes, activeTabIndex, clientId, innerBlocks, replaceInnerBlocks]
	);

	// Handle tab click - switch tab and select the inner block
	const handleTabClick = useCallback(
		(e: React.MouseEvent, index: number) => {
			e.preventDefault();
			e.stopPropagation();
			setActiveTabIndex(index);
			// Select the corresponding inner block for editing
			if (innerBlocks[index]) {
				selectBlock(innerBlocks[index].clientId);
			}
		},
		[innerBlocks, selectBlock]
	);

	// Handle tabs change from ContentTab (via RepeaterControl)
	const handleTabsChange = useCallback(
		(newTabs: TabItemData[]) => {
			const oldLength = tabs.length;
			const newLength = newTabs.length;

			setAttributes({ tabs: newTabs });

			// Sync inner blocks with tabs
			if (newLength > oldLength) {
				// Tab added - add corresponding inner block
				const newBlocks = [...innerBlocks];
				for (let i = oldLength; i < newLength; i++) {
					newBlocks.push(createTabBlock(newTabs[i]));
				}
				replaceInnerBlocks(clientId, newBlocks, false);
				setActiveTabIndex(newLength - 1);
			} else if (newLength < oldLength) {
				// Tab removed - remove corresponding inner block
				// Find which index was removed by comparing IDs
				const removedIndex = tabs.findIndex(
					(tab) => !newTabs.some((newTab) => newTab.id === tab.id)
				);
				if (removedIndex !== -1) {
					const newBlocks = innerBlocks.filter((_: any, i: number) => i !== removedIndex);
					replaceInnerBlocks(clientId, newBlocks, false);
					if (activeTabIndex >= newLength) {
						setActiveTabIndex(newLength - 1);
					}
				}
			}
		},
		[tabs, innerBlocks, setAttributes, clientId, replaceInnerBlocks, activeTabIndex]
	);

	// Check if layout is vertical
	const isVerticalLayout = ['inline-start', 'inline-end'].includes(
		attributes.tabsDirection.desktop || 'block-start'
	);

	// Get widget number for IDs
	const widgetNumber = (attributes.blockId || clientId).substring(0, 3);

	// Generate responsive CSS from styles.ts
	const responsiveCSS = generateNestedTabsResponsiveCSS(attributes, blockId);

	// Build CSS variables for styling
	const styleVars: Record<string, string> = {};

	// Direction styling
	const directionStyles: Record<string, string> = {
		'block-start': '--n-tabs-direction: column; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
		'block-end': '--n-tabs-direction: column-reverse; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
		'inline-start': '--n-tabs-direction: row; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
		'inline-end': '--n-tabs-direction: row-reverse; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
	};
	const dir = attributes.tabsDirection.desktop || 'block-start';
	if (directionStyles[dir]) {
		directionStyles[dir].split(';').forEach((style) => {
			const [key, value] = style.split(':').map((s) => s.trim());
			if (key && value) {
				styleVars[key] = value;
			}
		});
	}

	// Justify horizontal
	const justifyHMap: Record<string, string> = {
		start: 'flex-start',
		center: 'center',
		end: 'flex-end',
		stretch: 'initial',
	};
	const justifyH = attributes.tabsJustifyHorizontal.desktop || 'start';
	styleVars['--n-tabs-heading-justify-content'] = justifyHMap[justifyH] || 'flex-start';
	if (justifyH === 'stretch') {
		styleVars['--n-tabs-title-flex-grow'] = '1';
		styleVars['--n-tabs-title-width'] = '100%';
	}

	// Title alignment
	const alignMap: Record<string, string> = {
		start: 'flex-start',
		center: 'center',
		end: 'flex-end',
	};
	const titleAlign = attributes.titleAlignment.desktop || 'center';
	styleVars['--n-tabs-title-justify-content'] = alignMap[titleAlign] || 'center';

	// Gap
	if (attributes.tabsGap.desktop) {
		styleVars['--n-tabs-title-gap'] = attributes.tabsGap.desktop;
	}

	// Content distance
	if (attributes.tabsContentDistance.desktop) {
		styleVars['--n-tabs-gap'] = attributes.tabsContentDistance.desktop;
	}

	// Padding
	if (attributes.tabsPadding.desktop) {
		const p = attributes.tabsPadding.desktop;
		styleVars['--n-tabs-title-padding-top'] = p.top || '15px';
		styleVars['--n-tabs-title-padding-right'] = p.right || '20px';
		styleVars['--n-tabs-title-padding-bottom'] = p.bottom || '15px';
		styleVars['--n-tabs-title-padding-left'] = p.left || '20px';
	}

	// Border radius
	if (attributes.tabsBorderRadius.desktop) {
		const br = attributes.tabsBorderRadius.desktop;
		styleVars['--n-tabs-title-border-radius'] = `${br.top || '0'} ${br.right || '0'} ${br.bottom || '0'} ${br.left || '0'}`;
	}

	// Colors
	if (attributes.titleNormalColor) {
		styleVars['--n-tabs-title-color'] = attributes.titleNormalColor;
	}
	if (attributes.titleHoverColor) {
		styleVars['--n-tabs-title-color-hover'] = attributes.titleHoverColor;
	}
	if (attributes.titleActiveColor) {
		styleVars['--n-tabs-title-color-active'] = attributes.titleActiveColor;
	}

	// Background colors
	if (attributes.tabsNormalBg) {
		styleVars['--n-tabs-title-background-color'] = attributes.tabsNormalBg;
	}
	if (attributes.tabsHoverBg) {
		styleVars['--n-tabs-title-background-color-hover'] = attributes.tabsHoverBg;
	}
	if (attributes.tabsActiveBg) {
		styleVars['--n-tabs-title-background-color-active'] = attributes.tabsActiveBg;
	}

	// Icon
	if (attributes.iconSize.desktop) {
		styleVars['--n-tabs-icon-size'] = attributes.iconSize.desktop;
	}
	if (attributes.iconSpacing.desktop) {
		styleVars['--n-tabs-icon-gap'] = attributes.iconSpacing.desktop;
	}
	if (attributes.iconNormalColor) {
		styleVars['--n-tabs-icon-color'] = attributes.iconNormalColor;
	}
	if (attributes.iconHoverColor) {
		styleVars['--n-tabs-icon-color-hover'] = attributes.iconHoverColor;
	}
	if (attributes.iconActiveColor) {
		styleVars['--n-tabs-icon-color-active'] = attributes.iconActiveColor;
	}

	// Icon position styling
	const iconPosStyles: Record<string, string> = {
		'block-start': '--n-tabs-title-direction: column; --n-tabs-icon-order: initial;',
		'block-end': '--n-tabs-title-direction: column; --n-tabs-icon-order: 1;',
		'inline-start': '--n-tabs-title-direction: row; --n-tabs-icon-order: initial;',
		'inline-end': '--n-tabs-title-direction: row; --n-tabs-icon-order: 1;',
	};
	const iconPos = attributes.iconPosition.desktop || 'inline-start';
	if (iconPosStyles[iconPos]) {
		iconPosStyles[iconPos].split(';').forEach((style) => {
			const [key, value] = style.split(':').map((s) => s.trim());
			if (key && value) {
				styleVars[key] = value;
			}
		});
	}

	// Transition
	if (attributes.tabsTransitionDuration.desktop?.size) {
		styleVars['--n-tabs-title-transition'] = `${attributes.tabsTransitionDuration.desktop.size}s`;
	}

	// Width for vertical layout
	if (isVerticalLayout && attributes.tabsWidth.desktop?.size) {
		const w = attributes.tabsWidth.desktop;
		styleVars['--n-tabs-heading-width'] = `${w.size}${w.unit}`;
	}

	// Content styles
	if (attributes.contentBg) {
		styleVars['--n-tabs-content-background-color'] = attributes.contentBg;
	}

	const blockProps = useBlockProps({
		className: 'vxfse-nested-tabs',
		style: styleVars as React.CSSProperties,
		'data-active-tab': activeTabIndex,
	});

	// Inner blocks props - controls how inner blocks are rendered
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'e-n-tabs-content' },
		{
			allowedBlocks: ['core/group'],
			renderAppender: false,
		}
	);

	return (
		<div {...blockProps}>
			{/* Output responsive CSS from Style tab controls */}
			{responsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />
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
									isVerticalLayout={isVerticalLayout}
									onTabsChange={handleTabsChange}
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
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
				/>
			</InspectorControls>

			{/* Editor Preview */}
			<div
				className={`e-n-tabs e-n-tabs-${attributes.breakpointSelector}`}
				data-widget-number={widgetNumber}
			>
				{/* Tab Headers */}
				<div className="e-n-tabs-heading" role="tablist">
					{attributes.tabs.map((tab, index) => {
						const isActive = index === activeTabIndex;
						const tabCount = index + 1;

						return (
							<button
								type="button"
								key={tab.id}
								className={`e-n-tab-title${isActive ? ' e-active' : ''}${attributes.tabsHoverAnimation ? ` elementor-animation-${attributes.tabsHoverAnimation}` : ''}`}
								data-tab-index={tabCount}
								role="tab"
								aria-selected={isActive ? 'true' : 'false'}
								onClick={(e) => handleTabClick(e, index)}
								onMouseDown={(e) => e.stopPropagation()}
							>
								{/* Tab Icon */}
								{tab.icon?.value && (
									<span className="e-n-tab-icon">
										<i
											className={isActive && tab.iconActive?.value ? tab.iconActive.value : tab.icon.value}
											aria-hidden="true"
										></i>
									</span>
								)}

								{/* Tab Title */}
								<span className="e-n-tab-title-text">
									{tab.title}
								</span>
							</button>
						);
					})}
				</div>

				{/* Tab Content - InnerBlocks renders here */}
				<div {...innerBlocksProps} />
			</div>
		</div>
	);
}
