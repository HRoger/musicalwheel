/**
 * AddonWrapper Component
 * Phase 4: AddonsField implementation - 1:1 Voxel Match
 *
 * Shared wrapper component that handles the common enable toggle + label + description pattern
 * used by all addon types.
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/*.php
 * All addon templates share this pattern:
 * - If NOT required: Show enable toggle with label and optional description tooltip
 * - If required: Show just the label with optional description tooltip
 * - Children rendered only when addon.required || value.enabled
 *
 * CSS Classes:
 * - ts-form-group switcher-label: Main container
 * - switch-slider: Toggle wrapper
 * - onoffswitch: Toggle container
 * - onoffswitch-checkbox: Hidden checkbox
 * - onoffswitch-label: Visual toggle
 * - vx-dialog: Description tooltip container
 * - vx-dialog-content min-scroll: Tooltip content
 */
import React from 'react';
import type { AddonConfig } from '../../../types';
import { InfoIcon } from '../../icons/InfoIcon';

/**
 * Component props interface
 */
interface AddonWrapperProps {
	addon: AddonConfig;
	enabled: boolean;
	onToggleEnabled: (enabled: boolean) => void;
	children: React.ReactNode;
	/**
	 * How to display the description
	 * - 'tooltip': Use vx-dialog tooltip (default, used by numeric, select, custom-select)
	 * - 'inline': Use <small> tag inline after label (used by switcher)
	 */
	descriptionStyle?: 'tooltip' | 'inline';
}

/**
 * AddonWrapper Component
 * Handles the common pattern for all addon types
 *
 * Evidence: themes/voxel/templates/widgets/create-post/product-field/addons/numeric.php:6-35
 */
export const AddonWrapper: React.FC<AddonWrapperProps> = ({
	addon,
	enabled,
	onToggleEnabled,
	children,
	descriptionStyle = 'tooltip',
}) => {
	// Determine if content should be shown
	const showContent = addon.required || enabled;

	// Render description based on style
	const renderDescription = () => {
		if (!addon.description) return null;

		if (descriptionStyle === 'inline') {
			// Inline style - used by switcher
			return <small>{addon.description}</small>;
		}

		// Tooltip style - used by numeric, select, custom-select
		return (
			<div className="vx-dialog">
				<InfoIcon />
				<div className="vx-dialog-content min-scroll">
					<p>{addon.description}</p>
				</div>
			</div>
		);
	};

	return (
		<div className="ts-form-group switcher-label">
			{/* Non-required addons get the enable toggle */}
			{!addon.required ? (
				<label>
					{/* Toggle switch - matches Voxel switch-slider pattern */}
					<div className="switch-slider">
						<div className="onoffswitch">
							<input
								type="checkbox"
								className="onoffswitch-checkbox"
								checked={enabled}
								onChange={(e) => onToggleEnabled(e.target.checked)}
							/>
							<label
								className="onoffswitch-label"
								onClick={(e) => {
									e.preventDefault();
									onToggleEnabled(!enabled);
								}}
							></label>
						</div>
					</div>

					{/* Addon label */}
					{addon.label}

					{/* Description (tooltip or inline) */}
					{renderDescription()}
				</label>
			) : (
				/* Required addons just show label without toggle */
				<label>
					{addon.label}

					{/* Description (tooltip or inline) */}
					{renderDescription()}
				</label>
			)}

			{/* Expanded content - shown when enabled or required */}
			{showContent && children}
		</div>
	);
};
