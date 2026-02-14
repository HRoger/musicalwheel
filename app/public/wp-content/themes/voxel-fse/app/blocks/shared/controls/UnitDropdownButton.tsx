/**
 * Unit Dropdown Button Component
 *
 * Matches Elementor's unit selector pattern - small dropdown button next to input fields
 * that opens a dropdown with unit options (px, %, em, rem, vw, vh, and custom).
 *
 * Features:
 * - Standard units: px, %, em, rem, vw, vh, fr, auto, minmax
 * - Custom unit: Shows pencil icon, allows entering arbitrary CSS values like calc(100vh - 80px)
 *
 * Evidence:
 * - Elementor pattern: themes/voxel/app/widgets/option-groups/popup-head.php:125-143
 * - Gutenberg DropdownMenu: @wordpress/components
 */

// @ts-ignore - DropdownMenu types may not be available in all WordPress versions
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type UnitType = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'fr' | 'auto' | 'minmax' | 'custom' | 'ms' | 's' | 'deg';

interface UnitDropdownButtonProps {
	currentUnit: UnitType;
	onUnitChange: (unit: UnitType) => void;
	availableUnits?: UnitType[];
}

// Pencil icon matching Elementor's eicon-edit
const PencilIcon = () => (
	<span
		className="eicon eicon-edit"
		style={{
			fontSize: '11px',
			lineHeight: 1,
		}}
	/>
);

const getUnitLabel = (unit: UnitType): React.ReactNode => {
	switch (unit) {
		case 'px':
			return 'px';
		case '%':
			return '%';
		case 'em':
			return 'em';
		case 'rem':
			return 'rem';
		case 'vw':
			return 'vw';
		case 'vh':
			return 'vh';
		case 'fr':
			return 'fr';
		case 'auto':
			return 'auto';
		case 'minmax':
			return 'minmax';
		case 'ms':
			return 'ms';
		case 's':
			return 's';
		case 'deg':
			return 'deg';
		case 'custom':
			return <PencilIcon />;
		default:
			return unit;
	}
};

export default function UnitDropdownButton({
	currentUnit,
	onUnitChange,
	availableUnits = ['px', '%'],
}: UnitDropdownButtonProps) {
	const isCustom = currentUnit === 'custom';

	return (
		<div className={`e-units-wrapper${isCustom ? ' e-units-custom' : ''}`}>
			<DropdownMenu
				popoverProps={{
					placement: 'bottom-end',
				}}
				toggleProps={{
					size: 'small',
					variant: 'tertiary',
					children: getUnitLabel(currentUnit),
				}}
			>
				{({ onClose }: { onClose: () => void }) => (
					<MenuGroup>
						{availableUnits.map((unit) => (
							<MenuItem
								key={unit}
								onClick={() => {
									onUnitChange(unit);
									onClose();
								}}
								isSelected={currentUnit === unit}
							>
								{getUnitLabel(unit)}
							</MenuItem>
						))}
					</MenuGroup>
				)}
			</DropdownMenu>
			<style>{`
				.e-units-wrapper button {
					min-width: auto;
					padding: 2px 6px 4px;
					height: 24px;
					font-size: 12px;
					font-weight: 500;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: rgb(240, 240, 241);
					border: none;
					border-radius: 2px;
				}
				.e-units-wrapper button svg {
					display: none;
				}
				/* Custom unit styling - highlight when active */
				.e-units-wrapper.e-units-custom button {
					background-color: color-mix(in srgb, var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) 10%, #f0f0f1);
				}
				/* Menu item icon styling */
				.e-units-wrapper .components-menu-item__item .eicon {
					font-size: 12px;
				}
			`}</style>
		</div>
	);
}

