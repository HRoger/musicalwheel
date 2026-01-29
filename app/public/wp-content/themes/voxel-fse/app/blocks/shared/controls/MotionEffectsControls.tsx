/**
 * Motion Effects Controls Component
 *
 * Replicates Elementor Pro's Motion Effects accordion from Advanced tab.
 * Features: Scrolling Effects (6 types), Mouse Effects (2 types),
 * Sticky positioning, and Entrance Animation.
 *
 * Evidence:
 * - Scrolling/Mouse: plugins/elementor-pro/modules/motion-fx/controls-group.php
 * - Sticky: plugins/elementor-pro/modules/sticky/module.php
 * - Animation: plugins/elementor/includes/widgets/common-base.php:L837-878
 *
 * @package VoxelFSE
 */

import React, { useState, useRef, useEffect } from 'react';
import {
	Button,
	ToggleControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SliderControl from './SliderControl';
import RangeSliderControl from './RangeSliderControl';
import type { RangeSliderValue } from './RangeSliderControl';
import AnimationSelectControl from './AnimationSelectControl';
import ChooseControl from './ChooseControl';
import TagMultiSelect from './TagMultiSelect';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import SectionHeading from './SectionHeading';
import UndoIcon from '../icons/UndoIcon';

// Pencil Icon for popover toggle
const PencilIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
	</svg>
);

// ============================================
// Effect Popover Component
// ============================================
interface EffectPopoverProps {
	label: string;
	isEnabled: boolean;
	onToggle: (enabled: boolean) => void;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onReset: () => void;
	children: React.ReactNode;
	hasValue?: boolean;
}

function EffectPopover({
	label,
	isEnabled,
	onToggle,
	isOpen,
	onOpenChange,
	onReset,
	children,
	hasValue,
}: EffectPopoverProps) {
	const popoverRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!isOpen || !popoverRef.current || !buttonRef.current) return;

		const updatePosition = () => {
			if (!popoverRef.current || !buttonRef.current) return;
			const rect = buttonRef.current.getBoundingClientRect();
			const popover = popoverRef.current;
			const popoverWidth = popover.offsetWidth;
			const popoverHeight = popover.offsetHeight;
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			let top = rect.top;
			let left = rect.left - popoverWidth - 8;

			if (left < 8) {
				left = rect.right + 8;
			}
			if (left + popoverWidth > viewportWidth - 8) {
				left = viewportWidth - popoverWidth - 8;
			}
			if (top + popoverHeight > viewportHeight - 8) {
				top = viewportHeight - popoverHeight - 8;
			}
			if (top < 8) {
				top = 8;
			}

			popover.style.top = `${top}px`;
			popover.style.left = `${left}px`;
		};

		updatePosition();

		const handleClickOutside = (event: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
				if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
					onOpenChange(false);
				}
			}
		};

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onOpenChange]);

	return (
		<div style={{ position: 'relative', marginBottom: '12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<ToggleControl
					label={label}
					checked={isEnabled}
					onChange={onToggle}
					__nextHasNoMarginBottom
				/>
				{isEnabled && (
					<div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
						{hasValue && (
							<Button
								icon={<UndoIcon />}
								size="small"
								variant="tertiary"
								onClick={(e) => {
									e.stopPropagation();
									onReset();
								}}
								style={{ minWidth: 'auto', padding: '4px', width: '24px', height: '24px' }}
								label={__('Reset', 'voxel-fse')}
							/>
						)}
						<Button
							ref={buttonRef}
							icon={<PencilIcon />}
							size="small"
							variant="tertiary"
							onClick={() => onOpenChange(!isOpen)}
							style={{ minWidth: 'auto', padding: '4px', width: '24px', height: '24px' }}
						/>
					</div>
				)}
			</div>
			{isOpen && isEnabled && (
				<div
					ref={popoverRef}
					style={{
						position: 'fixed',
						zIndex: 999999,
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
						minWidth: '280px',
						maxWidth: '350px',
						maxHeight: '80vh',
						overflowY: 'auto',
						padding: '16px',
					}}
				>
					{children}
				</div>
			)}
		</div>
	);
}

// ============================================
// Motion Effects Attributes Interface
// ============================================
export interface MotionEffectsAttributes {
	// === Scrolling Effects ===
	scrollingEffectsEnabled?: boolean;

	// Vertical Scroll
	verticalScrollEnabled?: boolean;
	verticalScrollDirection?: string;
	verticalScrollSpeed?: number;
	verticalScrollViewport?: RangeSliderValue;

	// Horizontal Scroll
	horizontalScrollEnabled?: boolean;
	horizontalScrollDirection?: string;
	horizontalScrollSpeed?: number;
	horizontalScrollViewport?: RangeSliderValue;

	// Transparency
	transparencyEnabled?: boolean;
	transparencyDirection?: string;
	transparencyLevel?: number;
	transparencyViewport?: RangeSliderValue;

	// Blur
	blurEnabled?: boolean;
	blurDirection?: string;
	blurLevel?: number;
	blurViewport?: RangeSliderValue;

	// Rotate
	rotateEnabled?: boolean;
	rotateDirection?: string;
	rotateSpeed?: number;
	rotateViewport?: RangeSliderValue;

	// Scale
	scaleEnabled?: boolean;
	scaleDirection?: string;
	scaleSpeed?: number;
	scaleViewport?: RangeSliderValue;

	// Common Scrolling Settings
	motionFxXAnchor?: string;
	motionFxYAnchor?: string;
	motionFxDevices?: string[];
	motionFxRange?: string;

	// === Mouse Effects ===
	mouseEffectsEnabled?: boolean;

	// Mouse Track
	mouseTrackEnabled?: boolean;
	mouseTrackDirection?: string;
	mouseTrackSpeed?: number;

	// 3D Tilt
	tiltEnabled?: boolean;
	tiltDirection?: string;
	tiltSpeed?: number;

	// === Sticky ===
	sticky?: string;
	stickyOn?: string[];
	stickyOffset?: number;
	stickyOffset_tablet?: number;
	stickyOffset_mobile?: number;
	stickyEffectsOffset?: number;
	stickyEffectsOffset_tablet?: number;
	stickyEffectsOffset_mobile?: number;
	stickyAnchorOffset?: number;
	stickyAnchorOffset_tablet?: number;
	stickyAnchorOffset_mobile?: number;
	stickyParent?: boolean;

	// === Entrance Animation ===
	entranceAnimation?: string;
	entranceAnimation_tablet?: string;
	entranceAnimation_mobile?: string;
	animationDuration?: string;
	animationDelay?: number;
}

// Default attribute values
export const motionEffectsAttributes: Record<string, { type: string; default?: unknown }> = {
	// Scrolling Effects
	scrollingEffectsEnabled: { type: 'boolean', default: false },
	verticalScrollEnabled: { type: 'boolean', default: false },
	verticalScrollDirection: { type: 'string', default: '' },
	verticalScrollSpeed: { type: 'number', default: 4 },
	verticalScrollViewport: { type: 'object', default: { start: 0, end: 100 } },
	horizontalScrollEnabled: { type: 'boolean', default: false },
	horizontalScrollDirection: { type: 'string', default: '' },
	horizontalScrollSpeed: { type: 'number', default: 4 },
	horizontalScrollViewport: { type: 'object', default: { start: 0, end: 100 } },
	transparencyEnabled: { type: 'boolean', default: false },
	transparencyDirection: { type: 'string', default: 'in' },
	transparencyLevel: { type: 'number', default: 10 },
	transparencyViewport: { type: 'object', default: { start: 20, end: 80 } },
	blurEnabled: { type: 'boolean', default: false },
	blurDirection: { type: 'string', default: 'in' },
	blurLevel: { type: 'number', default: 7 },
	blurViewport: { type: 'object', default: { start: 20, end: 80 } },
	rotateEnabled: { type: 'boolean', default: false },
	rotateDirection: { type: 'string', default: '' },
	rotateSpeed: { type: 'number', default: 1 },
	rotateViewport: { type: 'object', default: { start: 0, end: 100 } },
	scaleEnabled: { type: 'boolean', default: false },
	scaleDirection: { type: 'string', default: 'scale-up' },
	scaleSpeed: { type: 'number', default: 4 },
	scaleViewport: { type: 'object', default: { start: 0, end: 100 } },
	motionFxXAnchor: { type: 'string', default: 'center' },
	motionFxYAnchor: { type: 'string', default: 'center' },
	motionFxDevices: { type: 'array', default: ['desktop', 'tablet', 'mobile'] },
	motionFxRange: { type: 'string', default: '' },

	// Mouse Effects
	mouseEffectsEnabled: { type: 'boolean', default: false },
	mouseTrackEnabled: { type: 'boolean', default: false },
	mouseTrackDirection: { type: 'string', default: '' },
	mouseTrackSpeed: { type: 'number', default: 1 },
	tiltEnabled: { type: 'boolean', default: false },
	tiltDirection: { type: 'string', default: '' },
	tiltSpeed: { type: 'number', default: 4 },

	// Sticky
	sticky: { type: 'string', default: '' },
	stickyOn: { type: 'array', default: ['desktop', 'tablet', 'mobile'] },
	stickyOffset: { type: 'number', default: 0 },
	stickyOffset_tablet: { type: 'number' },
	stickyOffset_mobile: { type: 'number' },
	stickyEffectsOffset: { type: 'number', default: 0 },
	stickyEffectsOffset_tablet: { type: 'number' },
	stickyEffectsOffset_mobile: { type: 'number' },
	stickyAnchorOffset: { type: 'number', default: 0 },
	stickyAnchorOffset_tablet: { type: 'number' },
	stickyAnchorOffset_mobile: { type: 'number' },
	stickyParent: { type: 'boolean', default: false },

	// Entrance Animation
	entranceAnimation: { type: 'string', default: '' },
	entranceAnimation_tablet: { type: 'string' },
	entranceAnimation_mobile: { type: 'string' },
	animationDuration: { type: 'string', default: '' },
	animationDelay: { type: 'number', default: 0 },
};

// ============================================
// Motion Effects Controls Component
// ============================================
interface MotionEffectsControlsProps {
	attributes: MotionEffectsAttributes;
	setAttributes: (attrs: Partial<MotionEffectsAttributes>) => void;
}

export default function MotionEffectsControls({
	attributes,
	setAttributes,
}: MotionEffectsControlsProps) {
	// Popover state management
	const [openPopover, setOpenPopover] = useState<string | null>(null);

	// Device options for TagMultiSelect (matches Elementor exactly)
	const deviceOptions = [
		{ label: __('Desktop', 'voxel-fse'), value: 'desktop' },
		{ label: __('Laptop', 'voxel-fse'), value: 'laptop' },
		{ label: __('Tablet Portrait', 'voxel-fse'), value: 'tablet' },
		{ label: __('Mobile Portrait', 'voxel-fse'), value: 'mobile' },
	];

	// Helper to check if an effect has non-default values
	const hasScrollingValue = (effect: string): boolean => {
		const prefix = effect;
		const attrs = attributes as Record<string, unknown>;
		const defaults = motionEffectsAttributes as Record<string, { default?: unknown }>;

		if (effect === 'verticalScroll') {
			return (
				attrs.verticalScrollDirection !== '' ||
				attrs.verticalScrollSpeed !== 4 ||
				JSON.stringify(attrs.verticalScrollViewport) !== JSON.stringify({ start: 0, end: 100 })
			);
		}
		// Add similar checks for other effects if needed
		return false;
	};

	return (
		<div className="voxel-fse-motion-effects-controls">
			{/* ============================================ */}
			{/* Scrolling Effects Section */}
			{/* ============================================ */}
			<SectionHeading text={__('Scrolling Effects', 'voxel-fse')} />

			<ToggleControl
				label={__('Scrolling Effects', 'voxel-fse')}
				checked={attributes.scrollingEffectsEnabled ?? false}
				onChange={(value) => setAttributes({ scrollingEffectsEnabled: value })}
				__nextHasNoMarginBottom
			/>

			{attributes.scrollingEffectsEnabled && (
				<>
					{/* Vertical Scroll */}
					<EffectPopover
						label={__('Vertical Scroll', 'voxel-fse')}
						isEnabled={attributes.verticalScrollEnabled ?? false}
						onToggle={(enabled) => setAttributes({ verticalScrollEnabled: enabled })}
						isOpen={openPopover === 'verticalScroll'}
						onOpenChange={(open) => setOpenPopover(open ? 'verticalScroll' : null)}
						onReset={() =>
							setAttributes({
								verticalScrollDirection: '',
								verticalScrollSpeed: 4,
								verticalScrollViewport: { start: 0, end: 100 },
							})
						}
						hasValue={hasScrollingValue('verticalScroll')}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.verticalScrollDirection ?? ''}
							options={[
								{ label: __('Up', 'voxel-fse'), value: '' },
								{ label: __('Down', 'voxel-fse'), value: 'negative' },
							]}
							onChange={(value) => setAttributes({ verticalScrollDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.verticalScrollSpeed}
							onChange={(value) => setAttributes({ verticalScrollSpeed: value })}
							min={0}
							max={10}
							step={0.1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.verticalScrollViewport ?? { start: 0, end: 100 }}
							onChange={(value) => setAttributes({ verticalScrollViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* Horizontal Scroll */}
					<EffectPopover
						label={__('Horizontal Scroll', 'voxel-fse')}
						isEnabled={attributes.horizontalScrollEnabled ?? false}
						onToggle={(enabled) => setAttributes({ horizontalScrollEnabled: enabled })}
						isOpen={openPopover === 'horizontalScroll'}
						onOpenChange={(open) => setOpenPopover(open ? 'horizontalScroll' : null)}
						onReset={() =>
							setAttributes({
								horizontalScrollDirection: '',
								horizontalScrollSpeed: 4,
								horizontalScrollViewport: { start: 0, end: 100 },
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.horizontalScrollDirection ?? ''}
							options={[
								{ label: __('To Left', 'voxel-fse'), value: '' },
								{ label: __('To Right', 'voxel-fse'), value: 'negative' },
							]}
							onChange={(value) => setAttributes({ horizontalScrollDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.horizontalScrollSpeed}
							onChange={(value) => setAttributes({ horizontalScrollSpeed: value })}
							min={0}
							max={10}
							step={0.1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.horizontalScrollViewport ?? { start: 0, end: 100 }}
							onChange={(value) => setAttributes({ horizontalScrollViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* Transparency */}
					<EffectPopover
						label={__('Transparency', 'voxel-fse')}
						isEnabled={attributes.transparencyEnabled ?? false}
						onToggle={(enabled) => setAttributes({ transparencyEnabled: enabled })}
						isOpen={openPopover === 'transparency'}
						onOpenChange={(open) => setOpenPopover(open ? 'transparency' : null)}
						onReset={() =>
							setAttributes({
								transparencyDirection: 'in',
								transparencyLevel: 10,
								transparencyViewport: { start: 20, end: 80 },
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.transparencyDirection ?? 'in'}
							options={[
								{ label: __('Fade In', 'voxel-fse'), value: 'in' },
								{ label: __('Fade Out', 'voxel-fse'), value: 'out' },
								{ label: __('Fade Out In', 'voxel-fse'), value: 'out-in' },
								{ label: __('Fade In Out', 'voxel-fse'), value: 'in-out' },
							]}
							onChange={(value) => setAttributes({ transparencyDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Level', 'voxel-fse')}
							value={attributes.transparencyLevel}
							onChange={(value) => setAttributes({ transparencyLevel: value })}
							min={1}
							max={10}
							step={1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.transparencyViewport ?? { start: 20, end: 80 }}
							onChange={(value) => setAttributes({ transparencyViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* Blur */}
					<EffectPopover
						label={__('Blur', 'voxel-fse')}
						isEnabled={attributes.blurEnabled ?? false}
						onToggle={(enabled) => setAttributes({ blurEnabled: enabled })}
						isOpen={openPopover === 'blur'}
						onOpenChange={(open) => setOpenPopover(open ? 'blur' : null)}
						onReset={() =>
							setAttributes({
								blurDirection: 'in',
								blurLevel: 7,
								blurViewport: { start: 20, end: 80 },
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.blurDirection ?? 'in'}
							options={[
								{ label: __('Fade In', 'voxel-fse'), value: 'in' },
								{ label: __('Fade Out', 'voxel-fse'), value: 'out' },
								{ label: __('Fade Out In', 'voxel-fse'), value: 'out-in' },
								{ label: __('Fade In Out', 'voxel-fse'), value: 'in-out' },
							]}
							onChange={(value) => setAttributes({ blurDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Level', 'voxel-fse')}
							value={attributes.blurLevel}
							onChange={(value) => setAttributes({ blurLevel: value })}
							min={1}
							max={15}
							step={1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.blurViewport ?? { start: 20, end: 80 }}
							onChange={(value) => setAttributes({ blurViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* Rotate */}
					<EffectPopover
						label={__('Rotate', 'voxel-fse')}
						isEnabled={attributes.rotateEnabled ?? false}
						onToggle={(enabled) => setAttributes({ rotateEnabled: enabled })}
						isOpen={openPopover === 'rotate'}
						onOpenChange={(open) => setOpenPopover(open ? 'rotate' : null)}
						onReset={() =>
							setAttributes({
								rotateDirection: '',
								rotateSpeed: 1,
								rotateViewport: { start: 0, end: 100 },
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.rotateDirection ?? ''}
							options={[
								{ label: __('To Left', 'voxel-fse'), value: '' },
								{ label: __('To Right', 'voxel-fse'), value: 'negative' },
							]}
							onChange={(value) => setAttributes({ rotateDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.rotateSpeed}
							onChange={(value) => setAttributes({ rotateSpeed: value })}
							min={0}
							max={10}
							step={0.1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.rotateViewport ?? { start: 0, end: 100 }}
							onChange={(value) => setAttributes({ rotateViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* Scale */}
					<EffectPopover
						label={__('Scale', 'voxel-fse')}
						isEnabled={attributes.scaleEnabled ?? false}
						onToggle={(enabled) => setAttributes({ scaleEnabled: enabled })}
						isOpen={openPopover === 'scale'}
						onOpenChange={(open) => setOpenPopover(open ? 'scale' : null)}
						onReset={() =>
							setAttributes({
								scaleDirection: 'scale-up',
								scaleSpeed: 4,
								scaleViewport: { start: 0, end: 100 },
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.scaleDirection ?? 'scale-up'}
							options={[
								{ label: __('Scale Up', 'voxel-fse'), value: 'scale-up' },
								{ label: __('Scale Down', 'voxel-fse'), value: 'scale-down' },
								{ label: __('Scale Down Up', 'voxel-fse'), value: 'scale-down-up' },
								{ label: __('Scale Up Down', 'voxel-fse'), value: 'scale-up-down' },
							]}
							onChange={(value) => setAttributes({ scaleDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.scaleSpeed}
							onChange={(value) => setAttributes({ scaleSpeed: value })}
							min={-10}
							max={10}
							step={0.1}
						/>
						<RangeSliderControl
							label={__('Viewport', 'voxel-fse')}
							value={attributes.scaleViewport ?? { start: 0, end: 100 }}
							onChange={(value) => setAttributes({ scaleViewport: value })}
							min={0}
							max={100}
							unit="%"
							labels={[__('Bottom', 'voxel-fse'), __('Top', 'voxel-fse')]}
						/>
					</EffectPopover>

					{/* X/Y Anchor Points */}
					<ChooseControl
						label={__('X Anchor Point', 'voxel-fse')}
						value={attributes.motionFxXAnchor ?? 'center'}
						onChange={(value) => setAttributes({ motionFxXAnchor: value })}
						options={[
							{ value: 'left', label: __('Left', 'voxel-fse'), icon: 'editor-alignleft' },
							{ value: 'center', label: __('Center', 'voxel-fse'), icon: 'editor-aligncenter' },
							{ value: 'right', label: __('Right', 'voxel-fse'), icon: 'editor-alignright' },
						]}
					/>

					<ChooseControl
						label={__('Y Anchor Point', 'voxel-fse')}
						value={attributes.motionFxYAnchor ?? 'center'}
						onChange={(value) => setAttributes({ motionFxYAnchor: value })}
						options={[
							{ value: 'top', label: __('Top', 'voxel-fse'), icon: 'arrow-up-alt' },
							{ value: 'center', label: __('Center', 'voxel-fse'), icon: 'minus' },
							{ value: 'bottom', label: __('Bottom', 'voxel-fse'), icon: 'arrow-down-alt' },
						]}
					/>

					{/* Apply Effects On */}
					<TagMultiSelect
						label={__('Apply Effects On', 'voxel-fse')}
						value={attributes.motionFxDevices ?? ['desktop', 'laptop', 'tablet', 'mobile']}
						options={deviceOptions}
						onChange={(value) => setAttributes({ motionFxDevices: value })}
					/>

					{/* Effects Relative To */}
					<SelectControl
						label={__('Effects Relative To', 'voxel-fse')}
						value={attributes.motionFxRange ?? ''}
						options={[
							{ label: __('Default', 'voxel-fse'), value: '' },
							{ label: __('Viewport', 'voxel-fse'), value: 'viewport' },
							{ label: __('Page', 'voxel-fse'), value: 'page' },
						]}
						onChange={(value) => setAttributes({ motionFxRange: value })}
						__nextHasNoMarginBottom
					/>
				</>
			)}

			{/* ============================================ */}
			{/* Mouse Effects Section */}
			{/* ============================================ */}
			<SectionHeading text={__('Mouse Effects', 'voxel-fse')} />

			<ToggleControl
				label={__('Mouse Effects', 'voxel-fse')}
				checked={attributes.mouseEffectsEnabled ?? false}
				onChange={(value) => setAttributes({ mouseEffectsEnabled: value })}
				__nextHasNoMarginBottom
			/>

			{attributes.mouseEffectsEnabled && (
				<>
					{/* Mouse Track */}
					<EffectPopover
						label={__('Mouse Track', 'voxel-fse')}
						isEnabled={attributes.mouseTrackEnabled ?? false}
						onToggle={(enabled) => setAttributes({ mouseTrackEnabled: enabled })}
						isOpen={openPopover === 'mouseTrack'}
						onOpenChange={(open) => setOpenPopover(open ? 'mouseTrack' : null)}
						onReset={() =>
							setAttributes({
								mouseTrackDirection: '',
								mouseTrackSpeed: 1,
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.mouseTrackDirection ?? ''}
							options={[
								{ label: __('Opposite', 'voxel-fse'), value: '' },
								{ label: __('Direct', 'voxel-fse'), value: 'negative' },
							]}
							onChange={(value) => setAttributes({ mouseTrackDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.mouseTrackSpeed}
							onChange={(value) => setAttributes({ mouseTrackSpeed: value })}
							min={0}
							max={10}
							step={0.1}
						/>
					</EffectPopover>

					{/* 3D Tilt */}
					<EffectPopover
						label={__('3D Tilt', 'voxel-fse')}
						isEnabled={attributes.tiltEnabled ?? false}
						onToggle={(enabled) => setAttributes({ tiltEnabled: enabled })}
						isOpen={openPopover === 'tilt'}
						onOpenChange={(open) => setOpenPopover(open ? 'tilt' : null)}
						onReset={() =>
							setAttributes({
								tiltDirection: '',
								tiltSpeed: 4,
							})
						}
					>
						<SelectControl
							label={__('Direction', 'voxel-fse')}
							value={attributes.tiltDirection ?? ''}
							options={[
								{ label: __('Direct', 'voxel-fse'), value: '' },
								{ label: __('Opposite', 'voxel-fse'), value: 'negative' },
							]}
							onChange={(value) => setAttributes({ tiltDirection: value })}
							__nextHasNoMarginBottom
						/>
						<SliderControl
							label={__('Speed', 'voxel-fse')}
							value={attributes.tiltSpeed}
							onChange={(value) => setAttributes({ tiltSpeed: value })}
							min={0}
							max={10}
							step={0.1}
						/>
					</EffectPopover>
				</>
			)}

			{/* ============================================ */}
			{/* Sticky Section */}
			{/* ============================================ */}
			<SectionHeading text={__('Sticky', 'voxel-fse')} />

			<SelectControl
				label={__('Sticky', 'voxel-fse')}
				value={attributes.sticky ?? ''}
				options={[
					{ label: __('None', 'voxel-fse'), value: '' },
					{ label: __('Top', 'voxel-fse'), value: 'top' },
					{ label: __('Bottom', 'voxel-fse'), value: 'bottom' },
				]}
				onChange={(value) => setAttributes({ sticky: value })}
				__nextHasNoMarginBottom
			/>

			{attributes.sticky && (
				<>
					<TagMultiSelect
						label={__('Sticky On', 'voxel-fse')}
						value={attributes.stickyOn ?? ['desktop', 'laptop', 'tablet', 'mobile']}
						options={deviceOptions}
						onChange={(value) => setAttributes({ stickyOn: value })}
					/>

					<ResponsiveRangeControl
						label={__('Sticky Offset', 'voxel-fse')}
						attributes={attributes as Record<string, unknown>}
						setAttributes={setAttributes}
						attributeBaseName="stickyOffset"
						min={0}
						max={500}
						step={1}
					/>

					<ResponsiveRangeControl
						label={__('Effects Offset', 'voxel-fse')}
						attributes={attributes as Record<string, unknown>}
						setAttributes={setAttributes}
						attributeBaseName="stickyEffectsOffset"
						min={0}
						max={1000}
						step={1}
					/>

					<ResponsiveRangeControl
						label={__('Anchor Offset', 'voxel-fse')}
						attributes={attributes as Record<string, unknown>}
						setAttributes={setAttributes}
						attributeBaseName="stickyAnchorOffset"
						min={0}
						max={500}
						step={1}
					/>

					<ToggleControl
						label={__('Stay In Column', 'voxel-fse')}
						checked={attributes.stickyParent ?? false}
						onChange={(value) => setAttributes({ stickyParent: value })}
						__nextHasNoMarginBottom
					/>
				</>
			)}

			{/* ============================================ */}
			{/* Entrance Animation Section */}
			{/* ============================================ */}
			<SectionHeading text={__('Entrance Animation', 'voxel-fse')} />

			<AnimationSelectControl
				label={__('Entrance Animation', 'voxel-fse')}
				value={attributes.entranceAnimation ?? ''}
				onChange={(value) => setAttributes({ entranceAnimation: value })}
			/>

			{attributes.entranceAnimation && (
				<>
					<SelectControl
						label={__('Animation Duration', 'voxel-fse')}
						value={attributes.animationDuration ?? ''}
						options={[
							{ label: __('Slow', 'voxel-fse'), value: 'slow' },
							{ label: __('Normal', 'voxel-fse'), value: '' },
							{ label: __('Fast', 'voxel-fse'), value: 'fast' },
						]}
						onChange={(value) => setAttributes({ animationDuration: value })}
						__nextHasNoMarginBottom
					/>

					<TextControl
						label={__('Animation Delay (ms)', 'voxel-fse')}
						type="number"
						value={String(attributes.animationDelay ?? 0)}
						onChange={(value) => setAttributes({ animationDelay: Number(value) || 0 })}
						min={0}
						step={100}
						__nextHasNoMarginBottom
					/>
				</>
			)}
		</div>
	);
}
