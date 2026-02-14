/**
 * Responsive Range Control
 *
 * Replacement for the legacy ResponsiveRangeControl, using the dropdown-style layout
 * from ResponsiveRangeControlWithDropdown to match Voxel/Elementor UI patterns.
 *
 * Matches Elementor's responsive control pattern - label on left, dropdown button on right,
 * range control below.
 *
 * Features:
 * - Standard units: px, %, em, rem, vw, vh
 * - Custom unit mode: When 'custom' unit is selected, shows text input for CSS calc() expressions
 *
 * IMPORTANT: Device state is managed by WordPress global store, not local state.
 * This ensures all responsive controls stay in sync when any one is changed.
 */

import { RangeControl, Button, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import UnitDropdownButton, { type UnitType } from './UnitDropdownButton';
import UndoIcon from '../icons/UndoIcon';
import { DynamicTagBuilder } from '../../shared/dynamic-tags';
import EnableTagsButton from './EnableTagsButton';
import { getCurrentDeviceType } from '@shared/utils/deviceType';

interface ResponsiveRangeControlProps {
	label: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	attributeBaseName: string;
	min?: number;
	max?: number;
	step?: number;
	help?: string;
	availableUnits?: UnitType[];
	units?: UnitType[]; // Alias for availableUnits for backward compatibility
	unitAttributeName?: string;
	showResetButton?: boolean;
	/** When false, hides the header row (label + responsive button). Useful when header is rendered externally. */
	showHeader?: boolean;
	/** Attribute name for storing custom CSS value (e.g., 'calc(100vh - 80px)'). Only used when unit is 'custom'. */
	customValueAttributeName?: string;
	enableDynamicTags?: boolean;
	/** Optional prefix for the control key used in popup state persistence. Useful when the same attributeBaseName is used in multiple instances (e.g., inside repeater items). */
	controlKeyPrefix?: string;
}

export default function ResponsiveRangeControl({
	label,
	attributes,
	setAttributes,
	attributeBaseName,
	min = 0,
	max = 100,
	step = 1,
	help,
	availableUnits,
	units,
	unitAttributeName,
	showResetButton = true,
	showHeader = true,
	customValueAttributeName,
	enableDynamicTags = false,
	controlKeyPrefix,
}: ResponsiveRangeControlProps) {
	// Support 'units' prop for backward compatibility
	const actualAvailableUnits = availableUnits || units;

	// State for dynamic tag modal
	const [isDynamicModalOpen, setIsDynamicModalOpen] = useState(false);

	// Get WordPress's current device type from the store - this is the source of truth
	const currentDevice = useSelect((select: any) => getCurrentDeviceType(select));

	// Get attribute name for current device
	const getAttributeName = () => {
		if (currentDevice === 'desktop') return attributeBaseName;
		return `${attributeBaseName}_${currentDevice}`;
	};

	// Get current value with inheritance
	const getValue = () => {
		const attrName = getAttributeName();
		let value = attributes[attrName];

		// Handle both number and object formats (for backward compatibility)
		if (typeof value === 'object' && value !== null) {
			value = value[currentDevice] ?? value.desktop;
		}

		return value ?? undefined;
	};

	// Check if current value is inherited
	const isInherited = () => {
		const attrName = getAttributeName();
		const value = attributes[attrName];

		// Handle object format
		if (typeof value === 'object' && value !== null) {
			return value[currentDevice] === undefined;
		}

		return value === undefined || value === null;
	};

	// Set value for current device
	const setValue = (newValue: any) => {
		const attrName = getAttributeName();
		setAttributes({ [attrName]: newValue });
	};

	const currentUnit = unitAttributeName
		? (attributes[unitAttributeName] || 'px') as UnitType
		: 'px';

	const setUnit = (unit: UnitType) => {
		if (unitAttributeName) {
			setAttributes({ [unitAttributeName]: unit });
		}
	};

	// Custom value handling (for calc() expressions, etc.)
	const isCustomUnit = currentUnit === 'custom';
	const customAttrName = customValueAttributeName || `${attributeBaseName}_custom`;

	const getCustomValue = (): string => {
		return attributes[customAttrName] || '';
	};

	const setCustomValue = (newValue: string) => {
		setAttributes({ [customAttrName]: newValue });
	};

	// Get the current value
	const currentValue = getValue();

	// Dynamic Tag Logic
	const hasDynamicTags = () => {
		return typeof currentValue === 'string' && currentValue.startsWith('@tags()') && currentValue.includes('@endtags()');
	};

	const getTagContent = () => {
		if (!hasDynamicTags()) return currentValue || '';
		const match = (currentValue as string).match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : currentValue;
	};

	const wrapWithTags = (content: string) => {
		if (!content) return '';
		return `@tags()${content}@endtags()`;
	};

	const handleEnableTags = () => {
		setIsDynamicModalOpen(true);
	};

	const handleEditTags = () => {
		setIsDynamicModalOpen(true);
	};

	const handleDisableTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			setValue(undefined);
		}
	};

	const handleModalSave = (newValue: string) => {
		if (newValue) {
			setValue(wrapWithTags(newValue));
		}
		setIsDynamicModalOpen(false);
	};

	const isTagsActive = hasDynamicTags();

	// Determine if we should show the percentage default behavior
	const isPercentUnit = currentUnit === '%';
	const percentMax = 100;
	const effectiveMax = isPercentUnit ? percentMax : max;

	// When unit is % and no value is set, use max as the initial position
	const initialPosition = isPercentUnit ? effectiveMax : undefined;

	// Check if we should show the placeholder (no value set and unit is %)
	const showPercentPlaceholder = isPercentUnit && (currentValue === undefined || currentValue === null) && !isTagsActive;

	return (
		<div className="elementor-control elementor-control-type-slider" style={{ marginBottom: '16px' }}>
			{/* Two-column layout: Title+Responsive on left, Unit selector on right corner */}
			{showHeader && (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
					{/* Left side: Label and Responsive Button - inline */}
					<div className="elementor-control-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						{/* Dynamic Tag Button (if not active, allows enabling) */}
						{enableDynamicTags && !isTagsActive && <EnableTagsButton onClick={handleEnableTags} />}

						<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>{label}</span>
						<ResponsiveDropdownButton controlKey={controlKeyPrefix ? `${controlKeyPrefix}_${attributeBaseName}` : attributeBaseName} />
					</div>

					{/* Right side: Unit Dropdown (if available) - pushed to right corner */}
					{actualAvailableUnits && actualAvailableUnits.length > 0 && !isTagsActive && (
						<UnitDropdownButton
							currentUnit={currentUnit}
							onUnitChange={setUnit}
							availableUnits={actualAvailableUnits}
						/>
					)}
				</div>
			)}

			{/* Custom unit mode: Text input for calc() expressions */}
			{isCustomUnit && !isTagsActive ? (
				<div
					className="elementor-control-input-wrapper elementor-control-custom-unit"
					style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
				>
					<div style={{ flex: 1 }}>
						<TextControl
							value={getCustomValue()}
							onChange={setCustomValue}
							placeholder={__('e.g., calc(100vh - 80px)', 'voxel-fse')}
							help={help}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</div>
				</div>
			) : isTagsActive ? (
				/* Dynamic Tag Mode */
				<div className="edit-voxel-tags" style={{
					backgroundColor: 'rgb(47, 47, 49)',
					borderRadius: '10px',
					overflow: 'hidden',
					padding: '12px',
				}}>
					{/* Tag content row */}
					<div style={{ marginBottom: '12px' }}>
						<span style={{
							color: '#fff',
							fontSize: '13px',
							fontFamily: 'inherit',
							wordBreak: 'break-all',
						}}>
							{getTagContent()}
						</span>
					</div>

					{/* Light gray divider */}
					<div style={{
						height: '1px',
						backgroundColor: 'rgba(255, 255, 255, 0.15)',
						marginBottom: '8px',
					}} />

					{/* Action buttons row */}
					<div style={{ display: 'flex' }}>
						<button
							type="button"
							className="edit-tags"
							onClick={handleEditTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'left',
							}}
						>
							{__('EDIT TAGS', 'voxel-fse')}
						</button>
						<button
							type="button"
							className="disable-tags"
							onClick={handleDisableTags}
							style={{
								flex: 1,
								background: 'transparent',
								border: 'none',
								color: 'rgba(255, 255, 255, 0.5)',
								fontSize: '10px',
								fontWeight: 600,
								letterSpacing: '0.5px',
								cursor: 'pointer',
								padding: '6px 0',
								textAlign: 'right',
							}}
						>
							{__('DISABLE TAGS', 'voxel-fse')}
						</button>
					</div>
				</div>
			) : (
				/* Standard Range Control - Full width below */
				<div
					className={`elementor-control-input-wrapper${showPercentPlaceholder ? ' has-percent-placeholder' : ''}`}
					style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
					data-placeholder={showPercentPlaceholder ? effectiveMax.toString() : undefined}
				>
					<div style={{ flex: 1, position: 'relative' }}>
						<RangeControl
							value={currentValue as number | undefined}
							onChange={setValue}
							min={min}
							max={effectiveMax}
							step={step}
							help={help}
							initialPosition={initialPosition}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
						{/* Placeholder overlay for % unit when no value is set */}
						{showPercentPlaceholder && (
							<div
								className="percent-placeholder-overlay"
								style={{
									position: 'absolute',
									top: '0',
									right: '0',
									width: '54px', // Match WordPress RangeControl input width
									height: '40px', // Match __next40pxDefaultSize
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									pointerEvents: 'none',
									color: '#949494',
									fontSize: '13px',
									fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
									zIndex: 1,
									background: 'transparent',
								}}
							>
								{effectiveMax}
							</div>
						)}
					</div>
					{showResetButton && (
						<Button
							icon={<UndoIcon />}
							label={__('Reset to default', 'voxel-fse')}
							onClick={() => setValue(undefined)}
							variant="tertiary"
							size="small"
							style={{
								marginTop: '0',
								color: 'var(--vxfse-accent-color, #3858e9)',
								padding: '4px',
								minWidth: 'auto',
								width: '32px',
								height: '32px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								flexShrink: 0,
							}}
						/>
					)}
				</div>
			)}

			{/* Inheritance Indicator */}
			{isInherited() && !isTagsActive && (
				<div
					style={{
						fontSize: '11px',
						color: '#757575',
						marginTop: '4px',
					}}
				>
					{currentDevice === 'tablet' &&
						__('Inheriting from desktop', 'voxel-fse')}
					{currentDevice === 'mobile' &&
						(attributes[`${attributeBaseName}_tablet`] !== undefined
							? __('Inheriting from tablet', 'voxel-fse')
							: __('Inheriting from desktop', 'voxel-fse'))}
				</div>
			)}

			{/* Dynamic Tag Builder Modal */}
			{isDynamicModalOpen && enableDynamicTags && (
				<DynamicTagBuilder
					value={getTagContent()}
					onChange={handleModalSave}
					label={label}
					context="post" // Default context
					onClose={() => setIsDynamicModalOpen(false)}
					autoOpen={true}
				/>
			)}
		</div>
	);
}
