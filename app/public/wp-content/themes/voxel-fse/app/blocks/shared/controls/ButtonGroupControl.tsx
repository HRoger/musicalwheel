/**
 * Button Group Control
 *
 * Reusable button group control with WordPress styling.
 * Displays options as buttons in a horizontal group.
 *
 * @package VoxelFSE
 */

import { ButtonGroup, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { mergeButtonStyle } from './theme-constants.tsx';

export interface ButtonGroupOption {
	value: string;
	label: string;
	icon?: React.ReactNode;
}

export interface ButtonGroupControlProps {
	label?: string;
	value: string;
	options: ButtonGroupOption[];
	onChange: (value: string) => void;
	help?: string;
	className?: string;
}

/**
 * Button Group Control Component
 *
 * @example
 * ```tsx
 * <ButtonGroupControl
 *   label="Container Width"
 *   value={containerWidth}
 *   options={[
 *     { value: 'full', label: 'Full' },
 *     { value: 'wide', label: 'Wide' },
 *     { value: 'none', label: 'None' },
 *   ]}
 *   onChange={(value) => setAttributes({ containerWidth: value })}
 * />
 * ```
 */
export default function ButtonGroupControl({
	label,
	value,
	options,
	onChange,
	help,
	className = '',
}: ButtonGroupControlProps) {
	return (
		<div className={`elementor-control ${className}`} style={{ marginBottom: '16px' }}>
			{label && (
				<div className="elementor-control-content" style={{ marginBottom: '8px' }}>
					<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
						{label}
					</span>
				</div>
			)}

			<ButtonGroup style={{ width: '100%', display: 'flex', gap: '4px' }}>
				{options.map((option) => (
					<Button
						key={option.value}
						isPressed={value === option.value}
						onClick={() => onChange(option.value)}
						style={mergeButtonStyle(value === option.value, {
							flex: 1,
							justifyContent: 'center',
							fontWeight: value === option.value ? 600 : 400,
						})}
						label={option.label}
						showTooltip
					>
						{option.icon || option.label}
					</Button>
				))}
			</ButtonGroup>

			{help && (
				<p
					className="elementor-control-field-description"
					style={{
						fontSize: '12px',
						color: '#757575',
						marginTop: '8px',
						marginBottom: 0,
					}}
				>
					{help}
				</p>
			)}
		</div>
	);
}
