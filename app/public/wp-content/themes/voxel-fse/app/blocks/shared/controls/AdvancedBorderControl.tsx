/**
 * AdvancedBorderControl Component
 *
 * Advanced border control with support for:
 * - Normal/Hover states (StateTabPanel)
 * - Border Type, Width (Dimensions), Color (via BorderGroupControl)
 * - Responsive Border Radius (desktop/tablet/mobile)
 * - Box Shadow (Normal/Hover)
 * - Transition Duration (Hover)
 *
 * Used in AdvancedTab for the Border accordion.
 * For simpler border controls without states/responsiveness, use BorderGroupControl.
 *
 * @package VoxelFSE
 */

import { useState } from 'react';
import { RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import DimensionsControl from './DimensionsControl';
import StateTabPanel from './StateTabPanel';
import BoxShadowPopup from './BoxShadowPopup';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import UnitDropdownButton from './UnitDropdownButton';
import BorderGroupControl, { type BorderGroupValue } from './BorderGroupControl';

export interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

interface AdvancedBorderControlProps {
	attributes: {
		// Border Type
		borderType?: string;
		borderTypeHover?: string;

		// Border Width
		borderWidth?: DimensionsConfig;
		borderWidthHover?: DimensionsConfig;

		// Border Color
		borderColor?: string;
		borderColorHover?: string;

		// Border Radius (responsive)
		borderRadius?: DimensionsConfig;
		borderRadius_tablet?: DimensionsConfig;
		borderRadius_mobile?: DimensionsConfig;
		borderRadiusHover?: DimensionsConfig;
		borderRadiusHover_tablet?: DimensionsConfig;
		borderRadiusHover_mobile?: DimensionsConfig;

		// Box Shadow
		boxShadow?: any;
		boxShadowHover?: any;

		// Transition
		transitionDuration?: number;

		// StateTabPanel persistence
		borderActiveTab?: string;

		[key: string]: any;
	};
	setAttributes: (attrs: any) => void;
}

export default function AdvancedBorderControl({
	attributes,
	setAttributes,
}: AdvancedBorderControlProps) {
	// Local state for responsive device (desktop/tablet/mobile)
	const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

	return (
		<StateTabPanel
			attributeName="borderActiveTab"
			attributes={attributes}
			setAttributes={setAttributes}
			tabs={[
				{ name: 'normal', title: __('Normal', 'voxel-fse') },
				{ name: 'hover', title: __('Hover', 'voxel-fse') },
			]}
		>
			{(tab) => (
				<>
					{/* Border Type, Width, Color - Reuse BorderGroupControl */}
					<BorderGroupControl
						value={{
							borderType: tab.name === 'normal' ? attributes.borderType : attributes.borderTypeHover,
							borderWidth: tab.name === 'normal' ? attributes.borderWidth : attributes.borderWidthHover,
							borderColor: tab.name === 'normal' ? attributes.borderColor : attributes.borderColorHover,
						}}
						onChange={(value: BorderGroupValue) => {
							if (tab.name === 'normal') {
								setAttributes({
									borderType: value.borderType,
									borderWidth: value.borderWidth,
									borderColor: value.borderColor,
								});
							} else {
								setAttributes({
									borderTypeHover: value.borderType,
									borderWidthHover: value.borderWidth,
									borderColorHover: value.borderColor,
								});
							}
						}}
						hideRadius={true}
					/>

					{/* Border Radius - Always shown (responsive) */}
					<div style={{ marginTop: '16px' }}>
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '8px'
						}}>
							{/* Left side: Label + ResponsiveDropdownButton inline */}
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<span style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize' as const, color: 'rgb(30, 30, 30)' }}>
									{__('Border Radius', 'voxel-fse')}
								</span>
								<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
							</div>

							{/* Right side: Unit Dropdown */}
							<UnitDropdownButton
								currentUnit={((() => {
									const getCurrentBorderRadius = () => {
										if (tab.name === 'normal') {
											if (currentDevice === 'desktop') return attributes.borderRadius;
											if (currentDevice === 'tablet') return attributes.borderRadius_tablet;
											return attributes.borderRadius_mobile;
										} else {
											if (currentDevice === 'desktop') return attributes.borderRadiusHover;
											if (currentDevice === 'tablet') return attributes.borderRadiusHover_tablet;
											return attributes.borderRadiusHover_mobile;
										}
									};
									return getCurrentBorderRadius()?.unit || 'px';
								})() as 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh')}
								onUnitChange={(unit) => {
									const getCurrentBorderRadius = () => {
										if (tab.name === 'normal') {
											if (currentDevice === 'desktop') return attributes.borderRadius || {};
											if (currentDevice === 'tablet') return attributes.borderRadius_tablet || {};
											return attributes.borderRadius_mobile || {};
										} else {
											if (currentDevice === 'desktop') return attributes.borderRadiusHover || {};
											if (currentDevice === 'tablet') return attributes.borderRadiusHover_tablet || {};
											return attributes.borderRadiusHover_mobile || {};
										}
									};
									const currentConfig = getCurrentBorderRadius();
									const newConfig = { ...currentConfig, unit };

									if (tab.name === 'normal') {
										if (currentDevice === 'desktop') {
											setAttributes({ borderRadius: newConfig });
										} else if (currentDevice === 'tablet') {
											setAttributes({ borderRadius_tablet: newConfig });
										} else {
											setAttributes({ borderRadius_mobile: newConfig });
										}
									} else {
										if (currentDevice === 'desktop') {
											setAttributes({ borderRadiusHover: newConfig });
										} else if (currentDevice === 'tablet') {
											setAttributes({ borderRadiusHover_tablet: newConfig });
										} else {
											setAttributes({ borderRadiusHover_mobile: newConfig });
										}
									}
								}}
								availableUnits={['px', '%', 'em', 'rem']}
							/>
						</div>
						<DimensionsControl
							label=""
							values={
								tab.name === 'normal'
									? currentDevice === 'desktop'
										? attributes.borderRadius || {}
										: currentDevice === 'tablet'
											? attributes.borderRadius_tablet || {}
											: attributes.borderRadius_mobile || {}
									: currentDevice === 'desktop'
										? attributes.borderRadiusHover || {}
										: currentDevice === 'tablet'
											? attributes.borderRadiusHover_tablet || {}
											: attributes.borderRadiusHover_mobile || {}
							}
							onChange={(value) => {
								if (tab.name === 'normal') {
									if (currentDevice === 'desktop') {
										setAttributes({ borderRadius: value });
									} else if (currentDevice === 'tablet') {
										setAttributes({
											borderRadius_tablet: value,
										});
									} else {
										setAttributes({
											borderRadius_mobile: value,
										});
									}
								} else {
									if (currentDevice === 'desktop') {
										setAttributes({
											borderRadiusHover: value,
										});
									} else if (currentDevice === 'tablet') {
										setAttributes({
											borderRadiusHover_tablet: value,
										});
									} else {
										setAttributes({
											borderRadiusHover_mobile: value,
										});
									}
								}
							}}
							availableUnits={[]}
						/>
					</div>

					{/* Box Shadow */}
					<div style={{ marginTop: '16px' }}>
						<BoxShadowPopup
							label={__('Box Shadow', 'voxel-fse')}
							attributes={attributes}
							setAttributes={setAttributes}
							shadowAttributeName={
								tab.name === 'normal' ? 'boxShadow' : 'boxShadowHover'
							}
						/>
					</div>

					{/* Transition Duration - Only show in Hover tab */}
					{tab.name === 'hover' && (
						<div style={{ marginTop: '16px' }}>
							<RangeControl
								label={__('Transition Duration (s)', 'voxel-fse')}
								value={attributes.transitionDuration ?? 0.3}
								onChange={(value: number | undefined) =>
									setAttributes({ transitionDuration: value ?? 0.3 })
								}
								min={0}
								max={3}
								step={0.1}
							/>
						</div>
					)}
				</>
			)}
		</StateTabPanel>
	);
}
