/**
 * Choose Control Component
 *
 * Icon-based button group control (like Elementor's CHOOSE control type).
 * Useful for alignment options, display modes, etc.
 *
 * @package VoxelFSE
 */

import React from 'react';
import { Button, ButtonGroup } from '@wordpress/components';
import { mergeButtonStyle } from './theme-constants.tsx';

// Note: elementor-controls.css is loaded via shared-styles.ts entry point

export interface ChooseOption {
	value: string;
	icon: string | React.ReactNode;
	label?: string; // Alias for title (backward compatibility)
	title?: string;
}

export interface ChooseControlProps {
	label: string;
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	options: ChooseOption[];
	/** Enable toggle mode - clicking selected button deselects it (default: true for Elementor parity) */
	allowToggle?: boolean;
	/** Layout variant: 'block' (default, full-width buttons) or 'inline' (label left, compact buttons right) */
	variant?: 'block' | 'inline';
	controls?: React.ReactNode;
}

/**
 * Render icon - supports string (dashicon, eicon) and React node
 */
function renderIcon(icon: string | React.ReactNode, size: number = 18): React.ReactNode {
	if (typeof icon === 'string') {
		let iconClass: string;

		if (icon.startsWith('eicon-')) {
			// Elementor icon format: "eicon-align-start-v" → "eicon eicon-align-start-v"
			iconClass = `eicon ${icon}`;
		} else if (icon.startsWith('dashicons-')) {
			// Dashicon with prefix: "dashicons-editor-alignleft" → "dashicons dashicons-editor-alignleft"
			iconClass = `dashicons ${icon}`;
		} else {
			// Dashicon without prefix: "editor-alignleft" → "dashicons dashicons-editor-alignleft"
			iconClass = `dashicons dashicons-${icon}`;
		}

		return <span className={iconClass} style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }} />;
	}
	// If it's a React node, render directly
	return icon;
}

export const ChooseControl: React.FC<ChooseControlProps> = ({
	label,
	value,
	onChange,
	options,
	allowToggle = true, // Default true for Elementor parity
	variant = 'block',
	controls,
}) => {
	// Handle button click with toggle functionality
	const handleClick = (optionValue: string) => {
		if (allowToggle && value === optionValue) {
			// Toggle off: clicking selected button deselects it
			onChange(undefined);
		} else {
			onChange(optionValue);
		}
	};

	// Inline variant: label on left, compact icon buttons on right (like Elementor's Background Type)
	if (variant === 'inline') {
		// Build CSS classes for each button position
		const getButtonClass = (index: number, total: number, isSelected: boolean) => {
			const classes = ['vxfse-inline-choose-btn'];
			if (isSelected) classes.push('vxfse-inline-choose-btn--active');
			if (index === 0) classes.push('vxfse-inline-choose-btn--first');
			if (index === total - 1) classes.push('vxfse-inline-choose-btn--last');
			return classes.join(' ');
		};

		// Styles are now in elementor-controls.css (ChooseControl Inline Variant section)
		return (
			<div
				className="elementor-control elementor-control-inline"
				style={{
					marginBottom: '16px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<span
					className="elementor-control-title"
					style={{
						fontSize: '13px',
						fontWeight: 500,
						color: 'rgb(30, 30, 30)',
						margin: 0,
					}}
				>
					{label}
				</span>
				<ButtonGroup className="vxfse-inline-choose-group" style={{ display: 'flex', gap: '0' }}>
					{options.map((option, index) => {
						const isSelected = value === option.value;

						return (
							<Button
								key={option.value}
								className={getButtonClass(index, options.length, isSelected)}
								onClick={() => handleClick(option.value)}
								title={option.title || option.label}
							>
								{renderIcon(option.icon, 14)}
							</Button>
						);
					})}
				</ButtonGroup>
			</div>
		);
	}

	// Block variant (default): full-width buttons below label
	return (
		<div className="elementor-control" style={{ marginBottom: '16px' }}>
			<div className="elementor-control-content" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0, marginRight: '8px' }}>
						{label}
					</span>
					{controls}
				</div>
			</div>
			<ButtonGroup style={{ width: '100%', display: 'flex', gap: '4px' }}>
				{options.map((option) => (
					<Button
						key={option.value}
						onClick={() => handleClick(option.value)}
						title={option.title || option.label}
						style={mergeButtonStyle(value === option.value, {
							flex: 1,
							justifyContent: 'center',
						})}
					>
						{renderIcon(option.icon)}
					</Button>
				))}
			</ButtonGroup>
		</div>
	);
};

export default ChooseControl;
