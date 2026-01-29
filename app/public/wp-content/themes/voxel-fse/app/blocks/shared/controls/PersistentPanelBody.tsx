/**
 * PersistentPanelBody - A PanelBody that persists its open/closed state
 *
 * Wraps WordPress PanelBody to store open/closed state in block attributes,
 * ensuring accordions stay in the same position when device changes or
 * other actions cause re-renders.
 *
 * @package VoxelFSE
 */

import { PanelBody } from '@wordpress/components';
import type { ReactNode } from 'react';

interface PersistentPanelBodyProps {
	/** Unique identifier for this panel (used as key in state object) */
	panelId: string;
	/** Panel title displayed in header */
	title: string;
	/** Whether panel should be open by default (used only on first render) */
	initialOpen?: boolean;
	/** Panel content */
	children: ReactNode;
	/** Block attributes object */
	attributes: Record<string, any>;
	/** setAttributes function */
	setAttributes: (attrs: Record<string, any>) => void;
	/** Attribute name to store panel states (default: 'openPanels') */
	stateAttribute?: string;
	/** Optional icon for the panel */
	icon?: React.ReactNode;
	/** Optional class name */
	className?: string;
}

/**
 * PersistentPanelBody - Stores panel open/closed state in block attributes
 *
 * Simple controlled component that reads/writes directly from block attributes.
 * No local state to avoid sync issues.
 *
 * @example
 * <PersistentPanelBody
 *   panelId="background"
 *   title="Background"
 *   initialOpen={true}
 *   attributes={attributes}
 *   setAttributes={setAttributes}
 * >
 *   <BackgroundControl ... />
 * </PersistentPanelBody>
 */
export default function PersistentPanelBody({
	panelId,
	title,
	initialOpen = false,
	children,
	attributes,
	setAttributes,
	stateAttribute = 'openPanels',
	icon,
	className,
}: PersistentPanelBodyProps) {
	// Get current panel states from attributes (fresh read every render)
	const openPanels: Record<string, boolean> = attributes[stateAttribute] || {};

	// Determine if this panel is open
	// Use saved state if exists, otherwise use initialOpen default
	const isOpen = panelId in openPanels ? openPanels[panelId] : initialOpen;

	// Handle toggle - write directly to attributes
	const handleToggle = () => {
		// Read fresh from attributes to avoid any stale data
		const currentOpenPanels: Record<string, boolean> = attributes[stateAttribute] || {};
		const newOpenPanels = {
			...currentOpenPanels,
			[panelId]: !isOpen,
		};
		setAttributes({ [stateAttribute]: newOpenPanels });
	};

	return (
		<PanelBody
			title={title}
			opened={isOpen}
			onToggle={handleToggle}
			icon={icon}
			className={className}
		>
			{children}
		</PanelBody>
	);
}
