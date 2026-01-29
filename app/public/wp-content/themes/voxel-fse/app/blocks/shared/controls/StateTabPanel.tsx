/**
 * State Tab Panel Component
 *
 * Reusable tab panel for Normal/Hover/Active state controls that persists
 * to block attributes. Uses the same thin visual style as StyleTabPanel
 * but with attribute persistence.
 *
 * Usage:
 * ```tsx
 * <StateTabPanel
 *   attributeName="pfActiveTab"
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 *   tabs={[
 *     { name: 'normal', title: 'Normal' },
 *     { name: 'hover', title: 'Hover' }
 *   ]}
 * >
 *   {(tab) => (
 *     <>
 *       <ColorControl
 *         label="Background"
 *         value={attributes[`buttonBg_${tab.name}`]}
 *         onChange={(v) => setAttributes({ [`buttonBg_${tab.name}`]: v })}
 *       />
 *     </>
 *   )}
 * </StateTabPanel>
 * ```
 *
 * @package VoxelFSE
 */

// Note: StyleTabPanel.css is loaded via shared-styles.ts entry point

export interface StateTab {
	name: string;
	title: string;
	icon?: string; // Optional eicon class
}

export interface StateTabPanelProps {
	/** Attribute name to store active tab state (e.g., 'pfActiveTab') */
	attributeName: string;
	/** Block attributes object */
	attributes: Record<string, any>;
	/** Block setAttributes function */
	setAttributes: (attrs: Record<string, any>) => void;
	/** Array of tab definitions */
	tabs: StateTab[];
	/** Render function receiving the active tab */
	children: (tab: StateTab) => React.ReactNode;
	/** Optional CSS class */
	className?: string;
}

/**
 * StateTabPanel - Thin-style state tabs with attribute persistence
 *
 * Uses block attributes to persist tab state, unlike StyleTabPanel which
 * uses local state. Shares the same visual styling as StyleTabPanel.
 */
export default function StateTabPanel({
	attributeName,
	attributes,
	setAttributes,
	tabs,
	children,
	className = '',
}: StateTabPanelProps) {
	// Get current active tab from attributes, default to first tab
	const activeTabName = attributes[attributeName] || tabs[0]?.name || 'normal';
	const currentTab = tabs.find((tab) => tab.name === activeTabName) || tabs[0];

	if (!tabs.length) {
		return null;
	}

	return (
		<div
			className={`elementor-control-type-tabs vxfse-style-tabs ${className}`.trim()}
		>
			{/* Tab buttons container - matches StyleTabPanel structure */}
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
						aria-selected={activeTabName === tab.name}
						aria-controls={`vxfse-state-tab-panel-${tab.name}`}
						id={`vxfse-state-tab-${tab.name}`}
						className={`elementor-control-type-tab vxfse-style-tabs__tab ${
							activeTabName === tab.name ? 'e-tab-active' : ''
						}`}
						onClick={() => setAttributes({ [attributeName]: tab.name })}
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
					id={`vxfse-state-tab-panel-${currentTab.name}`}
					aria-labelledby={`vxfse-state-tab-${currentTab.name}`}
					className="vxfse-style-tabs__content"
				>
					{children(currentTab)}
				</div>
			)}
		</div>
	);
}

// Named export for convenience
export { StateTabPanel };
