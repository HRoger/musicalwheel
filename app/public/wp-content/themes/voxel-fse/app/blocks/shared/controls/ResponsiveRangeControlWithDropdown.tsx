/**
 * Responsive Range Control with Dropdown Button
 *
 * Matches Elementor's responsive control pattern - label on left, dropdown button on right,
 * range control below.
 *
 * Features:
 * - Standard units: px, %, em, rem, vw, vh, fr, auto, minmax
 * - Custom unit mode: When 'custom' unit is selected, shows text input for CSS calc() expressions
 */

import { RangeControl, Button, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import UnitDropdownButton, { type UnitType } from './UnitDropdownButton';
import UndoIcon from '../icons/UndoIcon';

import { getCurrentDeviceType, type DeviceType } from '@shared/utils/deviceType';

interface ResponsiveRangeControlWithDropdownProps {
	label: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	attributeBaseName: string;
	min?: number;
	max?: number;
	step?: number;
	help?: string;
	availableUnits?: UnitType[];
	unitAttributeName?: string;
	showResetButton?: boolean;
	/** Attribute name for storing custom CSS value (e.g., 'calc(100vh - 80px)'). Only used when unit is 'custom'. */
	customValueAttributeName?: string;
}

export default function ResponsiveRangeControlWithDropdown({
	label,
	attributes,
	setAttributes,
	attributeBaseName,
	min = 0,
	max = 100,
	step = 1,
	help,
	availableUnits,
	unitAttributeName,
	showResetButton = true,
	customValueAttributeName,
}: ResponsiveRangeControlWithDropdownProps) {
	// Get WordPress's current device type from the store - this is the source of truth
	const currentDevice = useSelect((select) => getCurrentDeviceType(select), []);

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

		// If value is undefined, show inherited value
		if (value === undefined || value === null) {
			if (currentDevice === 'tablet') {
				const desktopValue = attributes[attributeBaseName];
				return typeof desktopValue === 'object' && desktopValue !== null
					? desktopValue.desktop
					: desktopValue;
			} else if (currentDevice === 'mobile') {
				const tabletValue = attributes[`${attributeBaseName}_tablet`];
				if (tabletValue !== undefined && tabletValue !== null) {
					return typeof tabletValue === 'object' && tabletValue !== null
						? tabletValue.mobile ?? tabletValue.desktop
						: tabletValue;
				}
				const desktopValue = attributes[attributeBaseName];
				return typeof desktopValue === 'object' && desktopValue !== null
					? desktopValue.desktop
					: desktopValue;
			}
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
	const setValue = (newValue: number | undefined) => {
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

	// Determine if we should show the percentage default behavior
	// When unit is %, the max should be 100 and default value should be 100
	const isPercentUnit = currentUnit === '%';
	const percentMax = 100;
	const effectiveMax = isPercentUnit ? percentMax : max;

	// When unit is % and no value is set, use max as the initial position
	// Otherwise, use min so the handle starts at the beginning of the bar (not the middle)
	const initialPosition = isPercentUnit ? effectiveMax : min;

	// Handle reset - always clear to undefined so inheritance can work
	const handleReset = () => {
		setValue(undefined);
	};

	return (
		<div className="elementor-control elementor-control-type-slider" style={{ marginBottom: '16px' }}>
			{/* Two-column layout: Title+Responsive on left, Unit selector on right corner */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				{/* Left side: Label and Responsive Button - inline */}
				<div className="elementor-control-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>{label}</span>
					<ResponsiveDropdownButton controlKey={attributeBaseName} />
				</div>

				{/* Right side: Unit Dropdown (if available) - pushed to right corner */}
				{availableUnits && availableUnits.length > 0 && (
					<UnitDropdownButton
						currentUnit={currentUnit}
						onUnitChange={setUnit}
						availableUnits={availableUnits}
					/>
				)}
			</div>

			{/* Custom unit mode: Text input for calc() expressions */}
			{isCustomUnit ? (
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
			) : (
				/* Standard Range Control - Full width below */
				<div
					className="elementor-control-input-wrapper"
					style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
				>
					<div style={{ flex: 1 }}>
						<RangeControl
							value={currentValue}
							onChange={setValue}
							min={min}
							max={effectiveMax}
							step={step}
							help={help}
							initialPosition={initialPosition}
							__nextHasNoMarginBottom
							__next40pxDefaultSize
						/>
					</div>
					{showResetButton && (
						<Button
							icon={<UndoIcon />}
							label={__('Reset to default', 'voxel-fse')}
							onClick={handleReset}
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
			{isInherited() && (
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
		</div>
	);
}

