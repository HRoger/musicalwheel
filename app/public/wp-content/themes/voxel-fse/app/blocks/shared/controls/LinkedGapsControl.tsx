/**
 * LinkedGapsControl Component
 *
 * Elementor-style dual input control for Column/Row gaps with link button.
 * Matches Elementor's Container > Items > Gaps control exactly.
 * UI pattern matches DimensionsControl for consistency.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import UnitDropdownButton from './UnitDropdownButton';

type DeviceType = 'desktop' | 'tablet' | 'mobile';
type UnitType = 'px' | 'em' | '%' | 'vw' | 'vh' | 'rem';

export interface LinkedGapsControlProps {
	label?: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	columnGapAttr?: string;
	rowGapAttr?: string;
	unitAttr?: string;
	linkedAttr?: string;
	min?: number;
	max?: number;
	availableUnits?: UnitType[];
	showResetButton?: boolean;
}

export default function LinkedGapsControl({
	label = __('Gaps', 'voxel-fse'),
	attributes,
	setAttributes,
	columnGapAttr = 'columnGap',
	rowGapAttr = 'rowGap',
	unitAttr = 'gapUnit',
	linkedAttr = 'gapsLinked',
	min = 0,
	max = 200,
	availableUnits = ['px', 'em', '%'],
	showResetButton = true,
}: LinkedGapsControlProps) {
	// Get WordPress's current device type
	const wpDeviceType = useSelect((select) => {
		const editPostStore = select('core/edit-post');
		if (editPostStore && typeof (editPostStore as any).getPreviewDeviceType === 'function') {
			return (editPostStore as any).getPreviewDeviceType();
		}
		const editorStore = select('core/editor');
		if (editorStore && typeof (editorStore as any).getDeviceType === 'function') {
			return (editorStore as any).getDeviceType();
		}
		return 'Desktop';
	}, []);

	const wpDevice = wpDeviceType ? (wpDeviceType.toLowerCase() as DeviceType) : 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	useEffect(() => {
		if (wpDeviceType) {
			setCurrentDevice(wpDevice);
		}
	}, [wpDeviceType, wpDevice]);

	// Get attribute names for current device
	const getColumnGapAttr = () => (currentDevice === 'desktop' ? columnGapAttr : `${columnGapAttr}_${currentDevice}`);
	const getRowGapAttr = () => (currentDevice === 'desktop' ? rowGapAttr : `${rowGapAttr}_${currentDevice}`);

	// Get values with inheritance
	const getColumnGap = (): number | undefined => {
		const attrName = getColumnGapAttr();
		let value = attributes[attrName];

		if (value === undefined || value === null) {
			if (currentDevice === 'tablet') {
				return attributes[columnGapAttr];
			} else if (currentDevice === 'mobile') {
				const tabletValue = attributes[`${columnGapAttr}_tablet`];
				return tabletValue !== undefined ? tabletValue : attributes[columnGapAttr];
			}
		}

		return value;
	};

	const getRowGap = (): number | undefined => {
		const attrName = getRowGapAttr();
		let value = attributes[attrName];

		if (value === undefined || value === null) {
			if (currentDevice === 'tablet') {
				return attributes[rowGapAttr];
			} else if (currentDevice === 'mobile') {
				const tabletValue = attributes[`${rowGapAttr}_tablet`];
				return tabletValue !== undefined ? tabletValue : attributes[rowGapAttr];
			}
		}

		return value;
	};

	const columnGap = getColumnGap();
	const rowGap = getRowGap();
	const unit = (attributes[unitAttr] || 'px') as UnitType;
	const isLinked = attributes[linkedAttr] !== false; // Default to linked

	// Set column gap
	const setColumnGap = (value: number | undefined) => {
		const updates: Record<string, any> = { [getColumnGapAttr()]: value };
		if (isLinked) {
			updates[getRowGapAttr()] = value;
		}
		setAttributes(updates);
	};

	// Set row gap
	const setRowGap = (value: number | undefined) => {
		const updates: Record<string, any> = { [getRowGapAttr()]: value };
		if (isLinked) {
			updates[getColumnGapAttr()] = value;
		}
		setAttributes(updates);
	};

	// Toggle linked state
	const toggleLinked = () => {
		const newLinked = !isLinked;
		setAttributes({ [linkedAttr]: newLinked });
		// If becoming linked, sync row to column
		if (newLinked && columnGap !== undefined) {
			setAttributes({ [getRowGapAttr()]: columnGap });
		}
	};

	// Handle unit change
	const handleUnitChange = (newUnit: UnitType) => {
		setAttributes({ [unitAttr]: newUnit });
	};

	return (
		<div className="voxel-fse-linked-gaps-control" style={{ marginBottom: '16px' }}>
			{/* Header with label, responsive toggle, and unit dropdown */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px',
				}}
			>
				{/* Left side: Label + Responsive */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span
						style={{
							fontSize: '13px',
							fontWeight: 500,
							textTransform: 'capitalize' as const,
							color: 'rgb(30, 30, 30)',
						}}
					>
						{label}
					</span>
					<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
				</div>

				{/* Right side: Unit dropdown only */}
				<UnitDropdownButton
					currentUnit={unit}
					onUnitChange={handleUnitChange}
					availableUnits={availableUnits}
				/>
			</div>

			{/* Dual inputs row with Link button on right */}
			<div
				style={{
					display: 'flex',
					gap: '4px',
					alignItems: 'flex-start',
				}}
			>
				{/* Input Fields Grid (2 columns for gaps) */}
				<div
					className="voxel-fse-gaps-control__inputs"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: '0',
						flex: 1,
					}}
				>
					{/* Column Gap Input */}
					<div>
						<input
							type="number"
							value={columnGap !== undefined ? String(columnGap) : ''}
							onChange={(e) => setColumnGap(e.target.value !== '' ? Number(e.target.value) : undefined)}
							min={min}
							max={max}
							step={1}
							placeholder=""
							className="voxel-fse-gap-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Column', 'voxel-fse')}
						</div>
					</div>

					{/* Row Gap Input */}
					<div>
						<input
							type="number"
							value={isLinked ? (columnGap !== undefined ? String(columnGap) : '') : (rowGap !== undefined ? String(rowGap) : '')}
							onChange={(e) => setRowGap(e.target.value !== '' ? Number(e.target.value) : undefined)}
							min={min}
							max={max}
							step={1}
							placeholder=""
							className="voxel-fse-gap-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Row', 'voxel-fse')}
						</div>
					</div>
				</div>

				{/* Link button on the right (matches DimensionsControl pattern) */}
				<div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '1px' }}>
					<button
						type="button"
						onClick={toggleLinked}
						className={`voxel-fse-gaps-control__link ${isLinked ? 'is-linked' : 'is-unlinked'}`}
						title={isLinked ? __('Unlink values', 'voxel-fse') : __('Link values together', 'voxel-fse')}
						style={{
							minWidth: 'auto',
							padding: '0',
							width: '24px',
							height: '25px',
							border: 'none',
							background: 'color-mix(in srgb, var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) 4%, transparent)',
							borderRadius: '2px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<span className={isLinked ? 'la-link' : 'la-unlink'}></span>
					</button>
				</div>
			</div>

			{/* CSS for Line Awesome icons and input styling (matches DimensionsControl) */}
			<style>{`
				.voxel-fse-gaps-control__link .la-link::before,
				.voxel-fse-gaps-control__link .la-unlink::before {
					font-family: 'Line Awesome Free';
					font-weight: 900;
					font-size: 14px;
					color: var(--vxfse-accent-color, #3858e9);
				}
				.voxel-fse-gaps-control__link .la-link::before {
					content: "\\f0c1";
				}
				.voxel-fse-gaps-control__link .la-unlink::before {
					content: "\\f127";
				}
				.voxel-fse-gap-input {
					width: 100%;
					height: 25px;
					padding: 0 6px;
					border: 1px solid #949494;
					border-radius: 2px;
					font-size: 13px;
					text-align: center;
					line-height: 23px;
					outline: none;
					box-sizing: border-box;
				}
				.voxel-fse-gaps-control__inputs > div:first-child .voxel-fse-gap-input {
					border-right-width: 0;
					border-top-right-radius: 0 !important;
					border-bottom-right-radius: 0 !important;
				}
				.voxel-fse-gaps-control__inputs > div:last-child .voxel-fse-gap-input {
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
				}
				.voxel-fse-gap-input:focus {
					border-color: var(--vxfse-accent-color, #3858e9) !important;
					border-right: 1px solid var(--vxfse-accent-color, #3858e9) !important;
					box-shadow: none !important;
					outline: none !important;
					z-index: 1;
					position: relative;
				}
			`}</style>
		</div>
	);
}
