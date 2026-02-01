/**
 * Empty Placeholder Component
 *
 * Reusable empty state placeholder matching Voxel's Elementor widget empty states.
 * Displays a grid icon (\e817 eicon-apps) with optional text.
 *
 * @package VoxelFSE
 */

import React from 'react';

interface EmptyPlaceholderProps {
	/** Optional text to display below the icon */
	text?: string;
	/** Icon to display (default: grid icon) */
	icon?: string;
	/** Additional CSS class names */
	className?: string;
	/** Custom inline styles */
	style?: React.CSSProperties;
}

/**
 * Empty Placeholder Component
 *
 * Non-interactive placeholder matching Voxel Elementor's empty widget state.
 */
export function EmptyPlaceholder({
	text,
	icon = '\ue817', // eicon-apps (grid icon)
	className = '',
	style = {},
}: EmptyPlaceholderProps): JSX.Element {
	return (
		<div
			className={`voxel-empty-placeholder ${className}`}
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: text ? '8px' : '0',
				background: 'rgb(213 216 220 / 80%)',
				borderRadius: '0',
				color: '#666',
				fontSize: '13px',
				height: '45px',
				width: '100%',
				...style,
			}}
		>
			{/* Icon */}
			<span
				className="placeholder-icon"
				style={{
					fontFamily: 'eicons',
					fontSize: '24px',
					opacity: 0.3,
					lineHeight: 1,
					fontStyle: 'normal',
				}}
			>
				{icon}
			</span>

			{/* Optional text */}
			{text && (
				<span className="placeholder-text" style={{ opacity: 0.6 }}>
					{text}
				</span>
			)}
		</div>
	);
}
