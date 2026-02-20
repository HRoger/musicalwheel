/**
 * Range Slider Control Component (Dual-Handle)
 *
 * A dual-handle range slider for selecting a range of values.
 * Used for Viewport ranges in Motion Effects (e.g., 0%-100%).
 *
 * Matches Elementor Pro's SLIDER with 'handles' => 'range' option.
 * Source: plugins/elementor-pro/modules/motion-fx/controls-group.php:L120-130
 *
 * @package VoxelFSE
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { TextControl } from '@wordpress/components';

export interface RangeSliderValue {
	start: number;
	end: number;
}

export interface RangeSliderControlProps {
	label: string;
	description?: string;
	value: RangeSliderValue;
	onChange: (value: RangeSliderValue) => void;
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
	labels?: [string, string]; // [startLabel, endLabel] e.g., ["Bottom", "Top"]
}

/**
 * RangeSliderControl - Dual-handle range slider
 *
 * Visual structure:
 * ```
 * Label (unit)
 * [Start Input] ─────●━━━━━━●───── [End Input]
 *                 Bottom    Top
 * ```
 */
export const RangeSliderControl: React.FC<RangeSliderControlProps> = ({
	label,
	description,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	unit = '%',
	labels = ['Start', 'End'],
}) => {
	const trackRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

	// Ensure value is valid
	const safeValue: RangeSliderValue = {
		start: typeof value?.start === 'number' ? value.start : min,
		end: typeof value?.end === 'number' ? value.end : max,
	};

	// Calculate percentage positions for the handles
	const range = max - min;
	const startPercent = ((safeValue.start - min) / range) * 100;
	const endPercent = ((safeValue.end - min) / range) * 100;

	// Handle value changes with validation
	const handleStartChange = useCallback(
		(newStart: number) => {
			const clampedStart = Math.max(min, Math.min(newStart, safeValue.end - step));
			onChange({ start: clampedStart, end: safeValue.end });
		},
		[min, step, safeValue.end, onChange]
	);

	const handleEndChange = useCallback(
		(newEnd: number) => {
			const clampedEnd = Math.min(max, Math.max(newEnd, safeValue.start + step));
			onChange({ start: safeValue.start, end: clampedEnd });
		},
		[max, step, safeValue.start, onChange]
	);

	// Convert pixel position to value
	const positionToValue = useCallback(
		(clientX: number): number => {
			if (!trackRef.current) return min;
			const rect = trackRef.current.getBoundingClientRect();
			const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
			const rawValue = min + percent * range;
			// Snap to step
			return Math.round(rawValue / step) * step;
		},
		[min, range, step]
	);

	// Mouse/touch drag handlers
	const handleMouseDown = useCallback(
		(handle: 'start' | 'end') => (e: React.MouseEvent | React.TouchEvent) => {
			e.preventDefault();
			setIsDragging(handle);
		},
		[]
	);

	useEffect(() => {
		if (!isDragging) return;

		const handleMove = (e: MouseEvent | TouchEvent) => {
			const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
			const newValue = positionToValue(clientX);

			if (isDragging === 'start') {
				handleStartChange(newValue);
			} else {
				handleEndChange(newValue);
			}
		};

		const handleUp = () => {
			setIsDragging(null);
		};

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleUp);
		document.addEventListener('touchmove', handleMove);
		document.addEventListener('touchend', handleUp);

		return () => {
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('mouseup', handleUp);
			document.removeEventListener('touchmove', handleMove);
			document.removeEventListener('touchend', handleUp);
		};
	}, [isDragging, positionToValue, handleStartChange, handleEndChange]);

	// Handle click on track to move nearest handle
	const handleTrackClick = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (e.target !== trackRef.current) return; // Only handle clicks on track itself
			const newValue = positionToValue(e.clientX);
			const distToStart = Math.abs(newValue - safeValue.start);
			const distToEnd = Math.abs(newValue - safeValue.end);

			if (distToStart < distToEnd) {
				handleStartChange(newValue);
			} else {
				handleEndChange(newValue);
			}
		},
		[positionToValue, safeValue, handleStartChange, handleEndChange]
	);

	return (
		<div className="voxel-fse-range-slider-control">
			<div className="voxel-fse-range-slider-header">
				<label>
					{label}
					{unit && <span className="voxel-fse-range-slider-unit"> ({unit})</span>}
				</label>
			</div>

			{description && <p className="voxel-fse-control-description">{description}</p>}

			{/* Slider Track */}
			<div
				ref={trackRef}
				className="voxel-fse-range-slider-track"
				onClick={handleTrackClick}
			>
				{/* Background track */}
				<div className="voxel-fse-range-slider-track-bg" />

				{/* Highlighted range between handles */}
				<div
					className="voxel-fse-range-slider-track-fill"
					style={{
						left: `${startPercent}%`,
						width: `${endPercent - startPercent}%`,
					}}
				/>

				{/* Start handle */}
				<div
					className={`voxel-fse-range-slider-handle voxel-fse-range-slider-handle-start ${isDragging === 'start' ? 'is-dragging' : ''}`}
					style={{ left: `${startPercent}%` }}
					onMouseDown={handleMouseDown('start')}
					onTouchStart={handleMouseDown('start')}
					role="slider"
					aria-label={labels[0]}
					aria-valuenow={safeValue.start}
					aria-valuemin={min}
					aria-valuemax={safeValue.end}
					tabIndex={0}
				/>

				{/* End handle */}
				<div
					className={`voxel-fse-range-slider-handle voxel-fse-range-slider-handle-end ${isDragging === 'end' ? 'is-dragging' : ''}`}
					style={{ left: `${endPercent}%` }}
					onMouseDown={handleMouseDown('end')}
					onTouchStart={handleMouseDown('end')}
					role="slider"
					aria-label={labels[1]}
					aria-valuenow={safeValue.end}
					aria-valuemin={safeValue.start}
					aria-valuemax={max}
					tabIndex={0}
				/>
			</div>

			{/* Input fields */}
			<div className="voxel-fse-range-slider-inputs">
				<div className="voxel-fse-range-slider-input-item">
					<div className="voxel-fse-range-slider-input-group">
						<span className="voxel-fse-range-slider-input-label">{labels[0]}</span>
						<TextControl
							type="number"
							value={String(safeValue.start)}
							onChange={(val: string) => handleStartChange(Number(val) || min)}
							min={min}
							max={safeValue.end - step}
							step={step}
							__nextHasNoMarginBottom
						/>
					</div>
				</div>
				<div className="voxel-fse-range-slider-divider-wrapper">
					<div className="voxel-fse-range-slider-divider" />
				</div>
				<div className="voxel-fse-range-slider-input-item">
					<div className="voxel-fse-range-slider-input-group">
						<span className="voxel-fse-range-slider-input-label">{labels[1]}</span>
						<TextControl
							type="number"
							value={String(safeValue.end)}
							onChange={(val: string) => handleEndChange(Number(val) || max)}
							min={safeValue.start + step}
							max={max}
							step={step}
							__nextHasNoMarginBottom
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RangeSliderControl;
