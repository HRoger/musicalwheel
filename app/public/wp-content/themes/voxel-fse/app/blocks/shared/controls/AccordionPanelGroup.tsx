/**
 * Accordion Panel Group Component
 *
 * Wraps multiple PanelBody components and provides true accordion behavior
 * where only one panel can be open at a time. Opening a panel automatically
 * closes any other open panel.
 *
 * Supports optional persistence to block attributes to survive re-renders
 * (e.g., when device changes).
 *
 * Usage:
 * <AccordionPanelGroup
 *   defaultPanel="layout"
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 *   stateAttribute="advancedOpenPanel"
 * >
 *   <AccordionPanel id="layout" title="Layout">
 *     <LayoutControls />
 *   </AccordionPanel>
 *   <AccordionPanel id="transform" title="Transform">
 *     <TransformControls />
 *   </AccordionPanel>
 * </AccordionPanelGroup>
 *
 * @package VoxelFSE
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

// Context for accordion state
interface AccordionContextValue {
	openPanel: string | null;
	setOpenPanel: (panelId: string | null) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Hook to use accordion context
export function useAccordion() {
	const context = useContext(AccordionContext);
	if (!context) {
		throw new Error('useAccordion must be used within an AccordionPanelGroup');
	}
	return context;
}

// Props for AccordionPanelGroup
interface AccordionPanelGroupProps {
	children: ReactNode;
	/** ID of the panel that should be open by default */
	defaultPanel?: string;
	/** Block attributes object (optional, for persistence) */
	attributes?: Record<string, any>;
	/** setAttributes function (optional, for persistence) */
	setAttributes?: (attrs: Record<string, any>) => void;
	/** Attribute name to store open panel state (default: 'accordionOpenPanel') */
	stateAttribute?: string;
}

/**
 * AccordionPanelGroup - Container that manages accordion state
 *
 * Only one child AccordionPanel can be open at a time.
 * Uses local state initialized from Attributes > SessionStorage > Default.
 */
export function AccordionPanelGroup({
	children,
	defaultPanel,
	attributes,
	setAttributes,
	stateAttribute = 'accordionOpenPanel',
}: AccordionPanelGroupProps) {
	// Get current client ID for storage key
	const clientId = useSelect(
		(select: (store: string) => { getSelectedBlockClientId: () => string | null }) =>
			select('core/block-editor').getSelectedBlockClientId(),
		[]
	);

	// Determine storage key
	const persistenceKey = clientId ? `voxel_accordion_${clientId}_${stateAttribute}` : null;

	// Internal state initialized from Attributes > SessionStorage > Default
	// This ensures we start with the correct panel immediately (no flicker)
	const [internalState, setInternalState] = useState<string | null>(() => {
		// 1. Attributes (Highest priority)
		if (attributes?.[stateAttribute] !== undefined) {
			return attributes[stateAttribute];
		}

		// 2. Session Storage (Persistence)
		if (persistenceKey) {
			const stored = sessionStorage.getItem(persistenceKey);
			if (stored) return stored;
		}

		// 3. Fallback
		return defaultPanel ?? null;
	});

	// Sync internal state with attributes when they change (e.g. undo/redo)
	// Also restore from sessionStorage if internal state gets cleared
	useEffect(() => {
		const attrValue = attributes?.[stateAttribute];

		// Priority 1: Sync from attributes if they have a value
		if (attrValue !== undefined && attrValue !== internalState) {
			setInternalState(attrValue);
			return;
		}

		// Priority 2: Restore from sessionStorage if internal state is null but storage has a value
		if (internalState === null && persistenceKey) {
			const stored = sessionStorage.getItem(persistenceKey);
			if (stored) {
				setInternalState(stored);
			}
		}
	}, [attributes?.[stateAttribute], internalState, persistenceKey, stateAttribute]);

	const openPanel = internalState;

	const setOpenPanel = (panelId: string | null) => {
		// 1. Update Session Storage
		if (persistenceKey) {
			if (panelId) {
				sessionStorage.setItem(persistenceKey, panelId);
			} else {
				sessionStorage.removeItem(persistenceKey);
			}
		}

		// 2. Update Attributes
		if (attributes && setAttributes) {
			setAttributes({ [stateAttribute]: panelId });
		}

		// 3. Update Internal State (always update this to ensure re-render if attributes/storage don't trigger it)
		setInternalState(panelId);
	};

	return (
		<AccordionContext.Provider value={{ openPanel, setOpenPanel }}>
			{children}
		</AccordionContext.Provider>
	);
}

// Props for AccordionPanel
interface AccordionPanelProps {
	/** Unique ID for this panel */
	id: string;
	/** Panel title displayed in the header */
	title: string;
	/** Panel content */
	children: ReactNode;
	/** Optional icon for the panel header */
	icon?: JSX.Element;
	/** Optional class name */
	className?: string;
}

/**
 * AccordionPanel - A PanelBody that participates in accordion behavior
 *
 * Must be used within an AccordionPanelGroup.
 */
export function AccordionPanel({ id, title, children, icon, className }: AccordionPanelProps) {
	const { openPanel, setOpenPanel } = useAccordion();

	const isOpen = openPanel === id;

	const handleToggle = () => {
		// If clicking the open panel, close it; otherwise open this panel
		setOpenPanel(isOpen ? null : id);
	};

	return (
		<PanelBody
			title={title}
			icon={icon}
			opened={isOpen}
			onToggle={handleToggle}
			className={className}
		>
			{children}
		</PanelBody>
	);
}

// Default export for convenience
export default AccordionPanelGroup;
