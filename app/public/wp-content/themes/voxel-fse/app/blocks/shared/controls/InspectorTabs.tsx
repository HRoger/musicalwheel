/**
 * InspectorTabs - Reusable Tab Navigation Component
 *
 * Provides Elementor-style tab navigation with WordPress-style animated indicator.
 * Automatically manages tab state and renders tab content.
 *
 * Features:
 * - Dynamic tab configuration
 * - Animated tab indicator (WordPress-style)
 * - Elementor icon rendering
 * - Optional auto-inclusion of AdvancedTab
 * - Responsive and accessible
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import AdvancedTab from './AdvancedTab';
import VoxelTab from './VoxelTab';

// Note: StyleTabPanel.css is loaded via shared-styles.ts entry point

export interface TabConfig {
	id: string;
	label: string;
	/** Icon character code (eicons) or image URL (starts with http:// or https://) */
	icon?: string;
	render: () => ReactNode;
}

export interface InspectorTabsProps {
	/** Array of tab configurations */
	tabs: TabConfig[];
	/** Auto-add AdvancedTab as the last tab (default: false) */
	includeAdvancedTab?: boolean;
	/** Auto-add VoxelTab as the very last tab (default: false) */
	includeVoxelTab?: boolean;
	/** Block attributes (required if includeAdvancedTab or includeVoxelTab is true) */
	attributes?: any;
	/** setAttributes function (required if includeAdvancedTab or includeVoxelTab is true) */
	setAttributes?: (attrs: any) => void;
	/** Default active tab ID (defaults to first tab) */
	defaultTab?: string;
	/**
	 * Attribute name to persist the active tab state.
	 * When provided, the active tab is stored in block attributes to survive re-renders
	 * caused by device changes or other global state updates.
	 * Example: activeTabAttribute="inspectorActiveTab"
	 */
	activeTabAttribute?: string;
}

/**
 * InspectorTabs - Reusable tab navigation for block inspector controls
 *
 * @example
 * // Post Feed (4 tabs: Content, Style, Advanced, Voxel - auto-added)
 * <InspectorTabs
 *   tabs={[
 *     { id: 'content', label: 'Content', icon: '\ue921', render: () => <ContentTab /> },
 *     { id: 'style', label: 'Style', icon: '\ue91c', render: () => <StyleTab /> }
 *   ]}
 *   includeAdvancedTab={true}
 *   includeVoxelTab={true}
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 * />
 *
 * @example
 * // Simple Block (3 tabs: Content, Advanced, Voxel)
 * <InspectorTabs
 *   tabs={[
 *     { id: 'content', label: 'Content', icon: '\ue921', render: () => <ContentTab /> }
 *   ]}
 *   includeAdvancedTab={true}
 *   includeVoxelTab={true}
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 * />
 */
export default function InspectorTabs({
	tabs,
	includeAdvancedTab = false,
	includeVoxelTab = false,
	attributes,
	setAttributes,
	defaultTab,
	activeTabAttribute,
}: InspectorTabsProps) {
	// Build tabs array, optionally adding AdvancedTab and VoxelTab
	let allTabs: TabConfig[] = tabs.map(tab => {
		// Apply standard default icons if not provided
		if (!tab.icon) {
			if (tab.id === 'content') return { ...tab, icon: '\ue92c' }; // eicon-edit
			if (tab.id === 'style') return { ...tab, icon: '\ue921' }; // eicon-paint-brush
		}
		return tab;
	});

	// Auto-add AdvancedTab if requested
	if (includeAdvancedTab && attributes && setAttributes) {
		allTabs.push({
			id: 'advanced',
			label: __('Advanced', 'voxel-fse'),
			icon: '\ue916',
			render: () => (
				<AdvancedTab attributes={attributes} setAttributes={setAttributes} />
			),
		});
	}

	// Auto-add VoxelTab if requested (always last)
	if (includeVoxelTab && attributes && setAttributes) {
		allTabs.push({
			id: 'voxel',
			label: __('Voxel', 'voxel-fse'),
			icon: '/wp-content/themes/voxel/assets/images/post-types/logo.svg',
			render: () => (
				<VoxelTab attributes={attributes} setAttributes={setAttributes} />
			),
		});
	}

	// Get current client ID to key persistence
	const clientId = useSelect((select) => select('core/block-editor').getSelectedBlockClientId(), []);
	const persistenceKey = clientId ? `voxel_inspector_tab_${clientId}` : null;

	// Internal state initialized from Attributes > Session Storage > Default
	const [internalState, setInternalState] = useState<string | null>(() => {
		// 1. Attribute persistence
		if (activeTabAttribute && attributes?.[activeTabAttribute]) {
			return attributes[activeTabAttribute];
		}

		// 2. Session storage persistence
		if (persistenceKey) {
			const storedTab = sessionStorage.getItem(persistenceKey);
			if (storedTab && allTabs.some((t) => t.id === storedTab)) {
				return storedTab;
			}
		}

		// 3. Fallback
		return defaultTab || allTabs[0]?.id || null;
	});

	// Sync internal state with attributes when they change (e.g. undo/redo)
	useEffect(() => {
		if (activeTabAttribute && attributes?.[activeTabAttribute] && attributes[activeTabAttribute] !== internalState) {
			setInternalState(attributes[activeTabAttribute]);
		}
	}, [activeTabAttribute, attributes?.[activeTabAttribute]]);

	const activeTab = internalState || defaultTab || allTabs[0]?.id || '';

	// Wrapper to update both local state, attribute, and session storage
	const setActiveTab = (tabId: string) => {
		// 1. Update Session Storage
		if (persistenceKey) {
			sessionStorage.setItem(persistenceKey, tabId);
		}

		// 2. Update Attribute
		if (activeTabAttribute && setAttributes) {
			setAttributes({ [activeTabAttribute]: tabId });
		}

		// 3. Update Internal State
		setInternalState(tabId);
	};

	// Get active tab index for animated indicator
	const activeTabIndex = allTabs.findIndex((tab) => tab.id === activeTab);

	// Get active tab content
	const activeTabConfig = allTabs.find((tab) => tab.id === activeTab);

	return (
		<>
			{/* Tab navigation */}
			<div
				className="voxel-fse-inspector-tabs"
				data-active-tab={activeTabIndex}
				style={
					{
						'--tab-count': allTabs.length,
					} as any
				}
			>
				{allTabs.map((tab) => {
					// Default to empty string if icon is missing (should be handled above, but for types)
					const icon = tab.icon || '';
					const isImageIcon = icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/');
					return (
						<button
							key={tab.id}
							type="button"
							className={`voxel-fse-tab-btn ${activeTab === tab.id ? 'is-active' : ''}`}
							onClick={() => setActiveTab(tab.id)}
							title={tab.label}
						>
							{isImageIcon ? (
								<img src={icon} alt="" className="voxel-fse-tab-icon-img" />
							) : (
								<i data-icon={icon}></i>
							)}
							<span className="voxel-fse-tab-label">{tab.label}</span>
						</button>
					);
				})}
			</div>

			{/* Tab content */}
			<div className="voxel-fse-tab-content">{activeTabConfig?.render()}</div>

			{/* Inline styles */}
			<style>{`
				/* Inspector tabs - Elementor-style horizontal navigation */
				.voxel-fse-inspector-tabs {
					display: flex;
					gap: 4px;
					padding: 0;
					border-bottom: 1px solid #e0e0e0;
					background: #fff;
					margin: 0;
					position: relative;
				}

				/* WordPress-style animated tab indicator */
				.voxel-fse-inspector-tabs::before {
					content: "";
					position: absolute;
					bottom: 0;
					left: 0;
					height: 0;
					width: calc(100% / var(--tab-count, 4));
					border-bottom: 2px solid #007cba;
					transition: transform 0.2s ease;
					transform-origin: left top;
					pointer-events: none;
				}

				/* Dynamic transform based on active tab index */
				.voxel-fse-inspector-tabs[data-active-tab="0"]::before {
					transform: translateX(0);
				}

				.voxel-fse-inspector-tabs[data-active-tab="1"]::before {
					transform: translateX(100%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="2"]::before {
					transform: translateX(200%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="3"]::before {
					transform: translateX(300%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="4"]::before {
					transform: translateX(400%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="5"]::before {
					transform: translateX(500%);
				}

				.voxel-fse-inspector-tabs[data-active-tab="6"]::before {
					transform: translateX(600%);
				}

				.voxel-fse-tab-btn {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 4px;
					padding: 12px 8px;
					background: transparent;
					border: none;
					border-radius: 0;
					color: #757575;
					cursor: pointer;
					transition: all 0.1s ease;
					font-size: 11px;
					font-weight: 400;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					position: relative;
				}

				.voxel-fse-tab-btn:hover {
					color: #1e1e1e;
					background: transparent;
				}

				.voxel-fse-tab-btn.is-active {
					color: #1e1e1e;
					background: transparent;
					font-weight: 500;
					box-shadow: none;
				}

				/* Render Elementor icons using ::before pseudo-element */
				.voxel-fse-tab-btn i {
					font-size: 18px;
					line-height: 1;
					font-family: 'eicons';
					font-style: normal;
					font-weight: normal;
					font-variant: normal;
					text-transform: none;
				}

				/* Set icon content from data attribute */
				.voxel-fse-tab-btn i::before {
					content: attr(data-icon);
				}

				/* Image icon support (e.g., Voxel logo) */
				.voxel-fse-tab-icon-img {
					width: 18px;
					height: 18px;
					object-fit: contain;
					opacity: 0.7;
					transition: opacity 0.1s ease;
				}

				.voxel-fse-tab-btn:hover .voxel-fse-tab-icon-img,
				.voxel-fse-tab-btn.is-active .voxel-fse-tab-icon-img {
					opacity: 1;
				}

				.voxel-fse-tab-label {
					font-size: 11px;
					white-space: nowrap;
					overflow: hidden;
					display: none;
					text-overflow: ellipsis;
					max-width: 100%;
				}

				.voxel-fse-tab-content {
					padding: 0;
				}
			`}</style>
		</>
	);
}
