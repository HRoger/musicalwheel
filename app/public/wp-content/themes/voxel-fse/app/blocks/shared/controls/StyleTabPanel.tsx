/**
 * Style Tab Panel Component (Elementor 1:1 Match)
 *
 * Reusable tab panel for style controls (Normal/Hover/Filled states).
 * Matches Elementor's `.elementor-control-type-tabs` structure exactly.
 *
 * Usage:
 * ```tsx
 * <StyleTabPanel
 *   tabs={[
 *     { name: 'normal', title: 'Normal' },
 *     { name: 'hover', title: 'Hover' }
 *   ]}
 * >
 *   {(tab) => (
 *     <ColorControl
 *       label="Background"
 *       value={attributes[`buttonBg_${tab.name}`]}
 *       onChange={(v) => setAttributes({ [`buttonBg_${tab.name}`]: v })}
 *     />
 *   )}
 * </StyleTabPanel>
 * ```
 *
 * @package VoxelFSE
 */

import { useState } from 'react';

// Note: StyleTabPanel.css is loaded via shared-styles.ts entry point

export interface StyleTab {
	name: string;
	title: string;
	icon?: string; // Optional eicon class
}

export interface StyleTabPanelProps {
	/** Array of tab definitions */
	tabs: StyleTab[];
	/** Render function receiving the active tab */
	children: (tab: StyleTab) => React.ReactNode;
	/** Optional initial active tab name */
	initialTabName?: string;
	/** Optional additional CSS class */
	className?: string;
	/** 
	 * Optional CSS class for active tab styling (backwards compatibility)
	 * @deprecated Use the built-in e-tab-active class instead
	 */
	activeClass?: string;
}

/**
 * StyleTabPanel - Elementor-style state tabs (Normal/Hover/Active)
 *
 * Replicates Elementor's `.elementor-control-type-tabs` component with
 * identical HTML structure, CSS classes, and visual styling.
 */
export default function StyleTabPanel({
	tabs,
	children,
	initialTabName,
	className = '',
}: StyleTabPanelProps) {
	const [activeTab, setActiveTab] = useState(
		initialTabName || tabs[0]?.name || ''
	);

	const currentTab = tabs.find((tab) => tab.name === activeTab) || tabs[0];

	if (!tabs.length) {
		return null;
	}

	return (
		<div
			className={`elementor-control-type-tabs vxfse-style-tabs ${className}`.trim()}
		>
			{/* Tab buttons container - matches Elementor structure */}
			<div
				className="vxfse-style-tabs__tabs"
				role="tablist"
				aria-orientation="horizontal"
			>
				{tabs.map((tab, index) => (
					<button
						key={tab.name}
						type="button"
						role="tab"
						aria-selected={activeTab === tab.name}
						aria-controls={`vxfse-tab-panel-${tab.name}`}
						id={`vxfse-tab-${tab.name}`}
						className={`elementor-control-type-tab vxfse-style-tabs__tab ${activeTab === tab.name ? 'e-tab-active' : ''
							}`}
						onClick={() => setActiveTab(tab.name)}
						data-tab-index={index}
					>
						{tab.icon && <i className={tab.icon} aria-hidden="true" />}
						<span>{tab.title}</span>
					</button>
				))}
			</div>

			{/* Tab content panel */}
			{currentTab && (
				<div
					role="tabpanel"
					id={`vxfse-tab-panel-${currentTab.name}`}
					aria-labelledby={`vxfse-tab-${currentTab.name}`}
					className="vxfse-style-tabs__content"
				>
					{children(currentTab)}
				</div>
			)}
		</div>
	);
}

// Named export for convenience
export { StyleTabPanel };
