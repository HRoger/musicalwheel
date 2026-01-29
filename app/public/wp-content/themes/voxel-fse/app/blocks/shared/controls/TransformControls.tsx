/**
 * Transform Controls Component
 *
 * Replicates Elementor Pro's Transform accordion from Advanced tab.
 * Features: Rotate, Offset, Scale, Skew with popover pattern,
 * Flip toggles, Anchor Points, and Hover state with transition.
 *
 * Evidence:
 * - Elementor Pro: plugins/elementor-pro/modules/custom-css/
 * - Core transform: plugins/elementor/includes/widgets/common.php
 *
 * @package VoxelFSE
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, ToggleControl, RangeControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import ChooseControl from './ChooseControl';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';
import StateTabPanel from './StateTabPanel';
import UndoIcon from '../icons/UndoIcon';

// Elementor Icons - using eicon class names
const ElementorIcon = ({ icon }: { icon: string }) => (
	<span className={`eicon ${icon}`} style={{ fontSize: '16px', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
);

type DeviceType = 'desktop' | 'tablet' | 'mobile';

// Global state for device changes - survives component remounts
// This is needed because WordPress may remount the inspector panel during desktop transitions
declare global {
	interface Window {
		__voxelDeviceChangeTimestamp?: number;
		__voxelTransformOpenPopup?: 'rotate' | 'offset' | 'scale' | 'skew' | null;
	}
}

// Hook to sync with WordPress device type
function useWordPressDevice(): DeviceType {
	const wpDeviceType = useSelect(
		(select: (store: string) => Record<string, unknown>) => {
			const editPostStore = select('core/edit-post') as {
				getPreviewDeviceType?: () => string;
				__experimentalGetPreviewDeviceType?: () => string;
			};
			if (editPostStore && typeof editPostStore.getPreviewDeviceType === 'function') {
				return editPostStore.getPreviewDeviceType();
			}
			if (editPostStore && typeof editPostStore.__experimentalGetPreviewDeviceType === 'function') {
				return editPostStore.__experimentalGetPreviewDeviceType();
			}
			const editorStore = select('core/editor') as { getDeviceType?: () => string };
			if (editorStore && typeof editorStore.getDeviceType === 'function') {
				return editorStore.getDeviceType();
			}
			return 'Desktop';
		}
	);
	return wpDeviceType ? (wpDeviceType.toLowerCase() as DeviceType) : 'desktop';
}

// Shared Popover wrapper component
interface TransformPopoverProps {
	label: string;
	isOpen: boolean;
	onToggle: () => void;
	onReset: () => void;
	children: React.ReactNode;
	hasValue?: boolean;
}

function TransformPopover({ label, isOpen, onToggle, onReset, children, hasValue }: TransformPopoverProps) {
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
			const target = event.target as HTMLElement;

			// Don't close if clicking inside the popover
			if (popoverRef.current && popoverRef.current.contains(target)) {
				return;
			}

			// Don't close if clicking the toggle button
			if (buttonRef.current && buttonRef.current.contains(target)) {
				return;
			}

			// Don't close if clicking inside a WordPress popover/dropdown (rendered in portal)
			// These have classes like 'components-popover', 'components-dropdown-menu__popover'
			if (target.closest('.components-popover') || target.closest('.components-dropdown-menu__popover')) {
				return;
			}

			// Don't close if a device change happened recently (within 1000ms)
			// This prevents the popup from closing during WordPress viewport transitions
			// Uses window global to survive component remounts
			const timestamp = window.__voxelDeviceChangeTimestamp || 0;
			if (Date.now() - timestamp < 1000) {
				return;
			}

			onToggle();
		};

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onToggle]);

	return (
		<div style={{ position: 'relative', marginBottom: '12px' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<span style={{ fontWeight: 500, fontSize: '13px' }}>{label}</span>
				<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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
						icon={<ElementorIcon icon="eicon-edit" />}
						size="small"
						variant="tertiary"
						onClick={onToggle}
						style={{ minWidth: 'auto', padding: '4px', width: '24px', height: '24px' }}
					/>
				</div>
			</div>
			{isOpen && (
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

// Transform Attributes Interface
export interface TransformAttributes {
	// Active tab
	transformActiveTab?: string;

	// ROTATE - Normal
	transformRotate?: number;
	transformRotate_tablet?: number;
	transformRotate_mobile?: number;
	transformRotate3D?: boolean;
	transformRotateX?: number;
	transformRotateX_tablet?: number;
	transformRotateX_mobile?: number;
	transformRotateY?: number;
	transformRotateY_tablet?: number;
	transformRotateY_mobile?: number;
	transformPerspective?: number;
	transformPerspective_tablet?: number;
	transformPerspective_mobile?: number;

	// ROTATE - Hover
	transformRotateHover?: number;
	transformRotateHover_tablet?: number;
	transformRotateHover_mobile?: number;
	transformRotate3DHover?: boolean;
	transformRotateXHover?: number;
	transformRotateXHover_tablet?: number;
	transformRotateXHover_mobile?: number;
	transformRotateYHover?: number;
	transformRotateYHover_tablet?: number;
	transformRotateYHover_mobile?: number;
	transformPerspectiveHover?: number;
	transformPerspectiveHover_tablet?: number;
	transformPerspectiveHover_mobile?: number;

	// OFFSET (Translate) - Normal
	transformTranslateX?: number;
	transformTranslateX_tablet?: number;
	transformTranslateX_mobile?: number;
	transformTranslateXUnit?: string;
	transformTranslateY?: number;
	transformTranslateY_tablet?: number;
	transformTranslateY_mobile?: number;
	transformTranslateYUnit?: string;

	// OFFSET (Translate) - Hover
	transformTranslateXHover?: number;
	transformTranslateXHover_tablet?: number;
	transformTranslateXHover_mobile?: number;
	transformTranslateXHoverUnit?: string;
	transformTranslateYHover?: number;
	transformTranslateYHover_tablet?: number;
	transformTranslateYHover_mobile?: number;
	transformTranslateYHoverUnit?: string;

	// SCALE - Normal
	transformScaleProportions?: boolean;
	transformScale?: number;
	transformScale_tablet?: number;
	transformScale_mobile?: number;
	transformScaleX?: number;
	transformScaleX_tablet?: number;
	transformScaleX_mobile?: number;
	transformScaleY?: number;
	transformScaleY_tablet?: number;
	transformScaleY_mobile?: number;

	// SCALE - Hover
	transformScaleProportionsHover?: boolean;
	transformScaleHover?: number;
	transformScaleHover_tablet?: number;
	transformScaleHover_mobile?: number;
	transformScaleXHover?: number;
	transformScaleXHover_tablet?: number;
	transformScaleXHover_mobile?: number;
	transformScaleYHover?: number;
	transformScaleYHover_tablet?: number;
	transformScaleYHover_mobile?: number;

	// SKEW - Normal
	transformSkewX?: number;
	transformSkewX_tablet?: number;
	transformSkewX_mobile?: number;
	transformSkewY?: number;
	transformSkewY_tablet?: number;
	transformSkewY_mobile?: number;

	// SKEW - Hover
	transformSkewXHover?: number;
	transformSkewXHover_tablet?: number;
	transformSkewXHover_mobile?: number;
	transformSkewYHover?: number;
	transformSkewYHover_tablet?: number;
	transformSkewYHover_mobile?: number;

	// FLIP - Normal
	transformFlipX?: boolean;
	transformFlipY?: boolean;

	// FLIP - Hover
	transformFlipXHover?: boolean;
	transformFlipYHover?: boolean;

	// ANCHOR POINT - Normal
	transformOriginX?: string;
	transformOriginX_tablet?: string;
	transformOriginX_mobile?: string;
	transformOriginY?: string;
	transformOriginY_tablet?: string;
	transformOriginY_mobile?: string;

	// ANCHOR POINT - Hover
	transformOriginXHover?: string;
	transformOriginXHover_tablet?: string;
	transformOriginXHover_mobile?: string;
	transformOriginYHover?: string;
	transformOriginYHover_tablet?: string;
	transformOriginYHover_mobile?: string;

	// TRANSITION
	transformTransitionDuration?: number;

	[key: string]: unknown;
}

interface TransformControlsProps {
	attributes: TransformAttributes;
	setAttributes: (attrs: Partial<TransformAttributes>) => void;
}

export default function TransformControls({ attributes, setAttributes }: TransformControlsProps) {
	// Use WordPress global device directly - no local state needed
	const currentDevice = useWordPressDevice();

	// Popover states - initialize from window global if recent device change occurred
	// This allows popups to survive WordPress component remounts during viewport transitions
	const getInitialPopupState = (popupName: 'rotate' | 'offset' | 'scale' | 'skew'): boolean => {
		const timestamp = window.__voxelDeviceChangeTimestamp || 0;
		const isRecentDeviceChange = Date.now() - timestamp < 1500; // 1.5s window for remount
		return isRecentDeviceChange && window.__voxelTransformOpenPopup === popupName;
	};

	const [rotateOpen, setRotateOpen] = useState(() => getInitialPopupState('rotate'));
	const [offsetOpen, setOffsetOpen] = useState(() => getInitialPopupState('offset'));
	const [scaleOpen, setScaleOpen] = useState(() => getInitialPopupState('scale'));
	const [skewOpen, setSkewOpen] = useState(() => getInitialPopupState('skew'));

	// Track which popup is open in window global - survives component remounts
	useEffect(() => {
		if (rotateOpen) {
			window.__voxelTransformOpenPopup = 'rotate';
		} else if (offsetOpen) {
			window.__voxelTransformOpenPopup = 'offset';
		} else if (scaleOpen) {
			window.__voxelTransformOpenPopup = 'scale';
		} else if (skewOpen) {
			window.__voxelTransformOpenPopup = 'skew';
		} else {
			// Only clear if no popup is open AND enough time has passed since device change
			// This prevents clearing during the remount phase
			const timestamp = window.__voxelDeviceChangeTimestamp || 0;
			if (Date.now() - timestamp > 1500) {
				window.__voxelTransformOpenPopup = null;
			}
		}
	}, [rotateOpen, offsetOpen, scaleOpen, skewOpen]);

	// Callback to set timestamp BEFORE device change - called by ResponsiveDropdownButton
	// Uses window global to survive component remounts during desktop transitions
	const handleDeviceChange = () => {
		window.__voxelDeviceChangeTimestamp = Date.now();
		// The current popup state is already tracked in __voxelTransformOpenPopup
		// via the useEffect above, so we just need to set the timestamp
	};

	// Helper for responsive values
	const getResponsiveValue = <T,>(baseName: string, isHover: boolean): T | undefined => {
		const suffix = isHover ? 'Hover' : '';
		const attrName = `${baseName}${suffix}` as keyof TransformAttributes;
		if (currentDevice === 'desktop') {
			return attributes[attrName] as T | undefined;
		}
		const deviceAttr = `${baseName}${suffix}_${currentDevice}` as keyof TransformAttributes;
		return (attributes[deviceAttr] ?? attributes[attrName]) as T | undefined;
	};

	const setResponsiveValue = (baseName: string, value: unknown, isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		if (currentDevice === 'desktop') {
			setAttributes({ [`${baseName}${suffix}`]: value });
		} else {
			setAttributes({ [`${baseName}${suffix}_${currentDevice}`]: value });
		}
	};

	// Check if any rotate values are set
	const hasRotateValue = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		return (
			attributes[`transformRotate${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformRotateX${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformRotateY${suffix}` as keyof TransformAttributes] !== undefined
		);
	};

	const hasOffsetValue = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		return (
			attributes[`transformTranslateX${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformTranslateY${suffix}` as keyof TransformAttributes] !== undefined
		);
	};

	const hasScaleValue = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		return (
			attributes[`transformScale${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformScaleX${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformScaleY${suffix}` as keyof TransformAttributes] !== undefined
		);
	};

	const hasSkewValue = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		return (
			attributes[`transformSkewX${suffix}` as keyof TransformAttributes] !== undefined ||
			attributes[`transformSkewY${suffix}` as keyof TransformAttributes] !== undefined
		);
	};

	// Check if anchor points should be visible
	// Only show when Rotate, Scale, Flip Horizontal, or Flip Vertical are enabled
	const shouldShowAnchorPoints = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		const hasRotate = hasRotateValue(isHover);
		const hasScale = hasScaleValue(isHover);
		const flipX = attributes[`transformFlipX${suffix}` as keyof TransformAttributes];
		const flipY = attributes[`transformFlipY${suffix}` as keyof TransformAttributes];
		return hasRotate || hasScale || flipX || flipY;
	};

	// Reset functions
	const resetRotate = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		setAttributes({
			[`transformRotate${suffix}`]: undefined,
			[`transformRotate${suffix}_tablet`]: undefined,
			[`transformRotate${suffix}_mobile`]: undefined,
			[`transformRotate3D${suffix}`]: undefined,
			[`transformRotateX${suffix}`]: undefined,
			[`transformRotateX${suffix}_tablet`]: undefined,
			[`transformRotateX${suffix}_mobile`]: undefined,
			[`transformRotateY${suffix}`]: undefined,
			[`transformRotateY${suffix}_tablet`]: undefined,
			[`transformRotateY${suffix}_mobile`]: undefined,
			[`transformPerspective${suffix}`]: undefined,
			[`transformPerspective${suffix}_tablet`]: undefined,
			[`transformPerspective${suffix}_mobile`]: undefined,
		});
	};

	const resetOffset = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		setAttributes({
			[`transformTranslateX${suffix}`]: undefined,
			[`transformTranslateX${suffix}_tablet`]: undefined,
			[`transformTranslateX${suffix}_mobile`]: undefined,
			[`transformTranslateY${suffix}`]: undefined,
			[`transformTranslateY${suffix}_tablet`]: undefined,
			[`transformTranslateY${suffix}_mobile`]: undefined,
		});
	};

	const resetScale = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		setAttributes({
			[`transformScaleProportions${suffix}`]: undefined,
			[`transformScale${suffix}`]: undefined,
			[`transformScale${suffix}_tablet`]: undefined,
			[`transformScale${suffix}_mobile`]: undefined,
			[`transformScaleX${suffix}`]: undefined,
			[`transformScaleX${suffix}_tablet`]: undefined,
			[`transformScaleX${suffix}_mobile`]: undefined,
			[`transformScaleY${suffix}`]: undefined,
			[`transformScaleY${suffix}_tablet`]: undefined,
			[`transformScaleY${suffix}_mobile`]: undefined,
		});
	};

	const resetSkew = (isHover: boolean) => {
		const suffix = isHover ? 'Hover' : '';
		setAttributes({
			[`transformSkewX${suffix}`]: undefined,
			[`transformSkewX${suffix}_tablet`]: undefined,
			[`transformSkewX${suffix}_mobile`]: undefined,
			[`transformSkewY${suffix}`]: undefined,
			[`transformSkewY${suffix}_tablet`]: undefined,
			[`transformSkewY${suffix}_mobile`]: undefined,
		});
	};

	return (
		<StateTabPanel
			attributeName="transformActiveTab"
			attributes={attributes}
			setAttributes={setAttributes}
			tabs={[
				{ name: 'normal', title: __('Normal', 'voxel-fse') },
				{ name: 'hover', title: __('Hover', 'voxel-fse') },
			]}
		>
			{(tab) => {
				const isHover = tab.name === 'hover';
				const suffix = isHover ? 'Hover' : '';
				const is3DRotate = isHover ? attributes.transformRotate3DHover : attributes.transformRotate3D;
				const keepProportions = isHover
					? (attributes.transformScaleProportionsHover ?? true)
					: (attributes.transformScaleProportions ?? true);

				return (
					<>
						{/* ROTATE POPOVER */}
						<TransformPopover
							label={__('Rotate', 'voxel-fse')}
							isOpen={rotateOpen}
							onToggle={() => setRotateOpen(!rotateOpen)}
							onReset={() => resetRotate(isHover)}
							hasValue={hasRotateValue(isHover)}
						>
							{/* Rotate (deg) */}
							<div style={{ marginBottom: '16px' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Rotate (deg)', 'voxel-fse')}</span>
									<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformRotate" />
								</div>
								<ResponsiveRangeControl
									label=""
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName={`transformRotate${suffix}`}
									min={-360}
									max={360}
									step={1}
									showHeader={false}
								/>
							</div>

							{/* 3D Rotate Toggle */}
							<ToggleControl
								label={__('3D Rotate', 'voxel-fse')}
								checked={is3DRotate || false}
								onChange={(value) => setAttributes({ [`transformRotate3D${suffix}`]: value })}
								__nextHasNoMarginBottom
							/>

							{/* 3D Rotate controls - show when enabled */}
							{is3DRotate && (
								<>
									<div style={{ marginTop: '16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
											<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Rotate X (deg)', 'voxel-fse')}</span>
											<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformRotateX" />
										</div>
										<ResponsiveRangeControl
											label=""
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={`transformRotateX${suffix}`}
											min={-360}
											max={360}
											step={1}
											showHeader={false}
										/>
									</div>

									<div style={{ marginTop: '16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
											<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Rotate Y (deg)', 'voxel-fse')}</span>
											<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformRotateY" />
										</div>
										<ResponsiveRangeControl
											label=""
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={`transformRotateY${suffix}`}
											min={-360}
											max={360}
											step={1}
											showHeader={false}
										/>
									</div>

									<div style={{ marginTop: '16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
											<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Perspective (px)', 'voxel-fse')}</span>
											<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformPerspective" />
										</div>
										<ResponsiveRangeControl
											label=""
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={`transformPerspective${suffix}`}
											min={0}
											max={2000}
											step={10}
											showHeader={false}
										/>
									</div>
								</>
							)}
						</TransformPopover>

						{/* OFFSET POPOVER */}
						<TransformPopover
							label={__('Offset', 'voxel-fse')}
							isOpen={offsetOpen}
							onToggle={() => setOffsetOpen(!offsetOpen)}
							onReset={() => resetOffset(isHover)}
							hasValue={hasOffsetValue(isHover)}
						>
							<div style={{ marginBottom: '16px' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Offset X', 'voxel-fse')}</span>
									<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformTranslateX" />
								</div>
								<ResponsiveRangeControl
									label=""
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName={`transformTranslateX${suffix}`}
									min={-500}
									max={500}
									step={1}
									availableUnits={['px', '%']}
									unitAttributeName={`transformTranslateX${suffix}Unit`}
									showHeader={false}
								/>
							</div>

							<div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Offset Y', 'voxel-fse')}</span>
									<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformTranslateY" />
								</div>
								<ResponsiveRangeControl
									label=""
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName={`transformTranslateY${suffix}`}
									min={-500}
									max={500}
									step={1}
									availableUnits={['px', '%']}
									unitAttributeName={`transformTranslateY${suffix}Unit`}
									showHeader={false}
								/>
							</div>
						</TransformPopover>

						{/* SCALE POPOVER */}
						<TransformPopover
							label={__('Scale', 'voxel-fse')}
							isOpen={scaleOpen}
							onToggle={() => setScaleOpen(!scaleOpen)}
							onReset={() => resetScale(isHover)}
							hasValue={hasScaleValue(isHover)}
						>
							{/* Keep Proportions Toggle */}
							<ToggleControl
								label={__('Keep Proportions', 'voxel-fse')}
								checked={keepProportions}
								onChange={(value) => setAttributes({ [`transformScaleProportions${suffix}`]: value })}
								__nextHasNoMarginBottom
							/>

							{keepProportions ? (
								/* Unified Scale */
								<div style={{ marginTop: '16px' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Scale', 'voxel-fse')}</span>
										<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformScale" />
									</div>
									<ResponsiveRangeControl
										label=""
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName={`transformScale${suffix}`}
										min={0}
										max={2}
										step={0.01}
										showHeader={false}
									/>
								</div>
							) : (
								/* Separate Scale X and Y */
								<>
									<div style={{ marginTop: '16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
											<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Scale X', 'voxel-fse')}</span>
											<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformScaleX" />
										</div>
										<ResponsiveRangeControl
											label=""
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={`transformScaleX${suffix}`}
											min={0}
											max={2}
											step={0.01}
											showHeader={false}
										/>
									</div>

									<div style={{ marginTop: '16px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
											<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Scale Y', 'voxel-fse')}</span>
											<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformScaleY" />
										</div>
										<ResponsiveRangeControl
											label=""
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName={`transformScaleY${suffix}`}
											min={0}
											max={2}
											step={0.01}
											showHeader={false}
										/>
									</div>
								</>
							)}
						</TransformPopover>

						{/* SKEW POPOVER */}
						<TransformPopover
							label={__('Skew', 'voxel-fse')}
							isOpen={skewOpen}
							onToggle={() => setSkewOpen(!skewOpen)}
							onReset={() => resetSkew(isHover)}
							hasValue={hasSkewValue(isHover)}
						>
							<div style={{ marginBottom: '16px' }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Skew X (deg)', 'voxel-fse')}</span>
									<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformSkewX" />
								</div>
								<ResponsiveRangeControl
									label=""
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName={`transformSkewX${suffix}`}
									min={-90}
									max={90}
									step={1}
									showHeader={false}
								/>
							</div>

							<div>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
									<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Skew Y (deg)', 'voxel-fse')}</span>
									<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} controlKey="transformSkewY" />
								</div>
								<ResponsiveRangeControl
									label=""
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName={`transformSkewY${suffix}`}
									min={-90}
									max={90}
									step={1}
									showHeader={false}
								/>
							</div>
						</TransformPopover>

						{/* FLIP HORIZONTAL */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
							<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Flip Horizontal', 'voxel-fse')}</span>
							<Button
								icon={<ElementorIcon icon="eicon-flip" />}
								size="small"
								variant={(isHover ? attributes.transformFlipXHover : attributes.transformFlipX) ? 'primary' : 'tertiary'}
								onClick={() => {
									const current = isHover ? attributes.transformFlipXHover : attributes.transformFlipX;
									setAttributes({ [`transformFlipX${suffix}`]: !current });
								}}
								style={{ minWidth: 'auto', padding: '4px', width: '28px', height: '28px' }}
								label={__('Flip Horizontal', 'voxel-fse')}
							/>
						</div>

						{/* FLIP VERTICAL */}
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
							<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Flip Vertical', 'voxel-fse')}</span>
							<Button
								icon={<ElementorIcon icon="eicon-flip" />}
								size="small"
								variant={(isHover ? attributes.transformFlipYHover : attributes.transformFlipY) ? 'primary' : 'tertiary'}
								onClick={() => {
									const current = isHover ? attributes.transformFlipYHover : attributes.transformFlipY;
									setAttributes({ [`transformFlipY${suffix}`]: !current });
								}}
								style={{ minWidth: 'auto', padding: '4px', width: '28px', height: '28px', transform: 'rotate(90deg)' }}
								label={__('Flip Vertical', 'voxel-fse')}
							/>
						</div>

						{/* X/Y ANCHOR POINTS - Only show when Rotate, Scale, or Flip is enabled */}
						{shouldShowAnchorPoints(isHover) && (
							<>
								{/* X ANCHOR POINT */}
								<div style={{ marginBottom: '16px' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('X Anchor Point', 'voxel-fse')}</span>
										<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} />
									</div>
									<ChooseControl
										label=""
										value={getResponsiveValue<string>('transformOriginX', isHover) || 'center'}
										onChange={(value) => setResponsiveValue('transformOriginX', value, isHover)}
										options={[
											{ value: 'left', icon: 'eicon-h-align-left', title: __('Left', 'voxel-fse') },
											{ value: 'center', icon: 'eicon-h-align-center', title: __('Center', 'voxel-fse') },
											{ value: 'right', icon: 'eicon-h-align-right', title: __('Right', 'voxel-fse') },
										]}
									/>
								</div>

								{/* Y ANCHOR POINT */}
								<div style={{ marginBottom: isHover ? '16px' : '0' }}>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
										<span style={{ fontWeight: 500, fontSize: '13px' }}>{__('Y Anchor Point', 'voxel-fse')}</span>
										<ResponsiveDropdownButton onDeviceChange={handleDeviceChange} />
									</div>
									<ChooseControl
										label=""
										value={getResponsiveValue<string>('transformOriginY', isHover) || 'center'}
										onChange={(value) => setResponsiveValue('transformOriginY', value, isHover)}
										options={[
											{ value: 'top', icon: 'eicon-v-align-top', title: __('Top', 'voxel-fse') },
											{ value: 'center', icon: 'eicon-v-align-middle', title: __('Center', 'voxel-fse') },
											{ value: 'bottom', icon: 'eicon-v-align-bottom', title: __('Bottom', 'voxel-fse') },
										]}
									/>
								</div>
							</>
						)}

						{/* TRANSITION DURATION - Only in Hover */}
						{isHover && (
							<div style={{ marginTop: '16px' }}>
								<RangeControl
									label={__('Transition Duration (ms)', 'voxel-fse')}
									value={attributes.transformTransitionDuration ?? 300}
									onChange={(value) => setAttributes({ transformTransitionDuration: value })}
									min={0}
									max={3000}
									step={50}
								/>
							</div>
						)}
					</>
				);
			}}
		</StateTabPanel>
	);
}

// Export attributes schema for block registration
export const transformAttributes = {
	// Active tab
	transformActiveTab: { type: 'string', default: 'normal' },

	// ROTATE - Normal
	transformRotate: { type: 'number' },
	transformRotate_tablet: { type: 'number' },
	transformRotate_mobile: { type: 'number' },
	transformRotate3D: { type: 'boolean', default: false },
	transformRotateX: { type: 'number' },
	transformRotateX_tablet: { type: 'number' },
	transformRotateX_mobile: { type: 'number' },
	transformRotateY: { type: 'number' },
	transformRotateY_tablet: { type: 'number' },
	transformRotateY_mobile: { type: 'number' },
	transformPerspective: { type: 'number' },
	transformPerspective_tablet: { type: 'number' },
	transformPerspective_mobile: { type: 'number' },

	// ROTATE - Hover
	transformRotateHover: { type: 'number' },
	transformRotateHover_tablet: { type: 'number' },
	transformRotateHover_mobile: { type: 'number' },
	transformRotate3DHover: { type: 'boolean', default: false },
	transformRotateXHover: { type: 'number' },
	transformRotateXHover_tablet: { type: 'number' },
	transformRotateXHover_mobile: { type: 'number' },
	transformRotateYHover: { type: 'number' },
	transformRotateYHover_tablet: { type: 'number' },
	transformRotateYHover_mobile: { type: 'number' },
	transformPerspectiveHover: { type: 'number' },
	transformPerspectiveHover_tablet: { type: 'number' },
	transformPerspectiveHover_mobile: { type: 'number' },

	// OFFSET (Translate) - Normal
	transformTranslateX: { type: 'number' },
	transformTranslateX_tablet: { type: 'number' },
	transformTranslateX_mobile: { type: 'number' },
	transformTranslateXUnit: { type: 'string', default: 'px' },
	transformTranslateY: { type: 'number' },
	transformTranslateY_tablet: { type: 'number' },
	transformTranslateY_mobile: { type: 'number' },
	transformTranslateYUnit: { type: 'string', default: 'px' },

	// OFFSET (Translate) - Hover
	transformTranslateXHover: { type: 'number' },
	transformTranslateXHover_tablet: { type: 'number' },
	transformTranslateXHover_mobile: { type: 'number' },
	transformTranslateXHoverUnit: { type: 'string', default: 'px' },
	transformTranslateYHover: { type: 'number' },
	transformTranslateYHover_tablet: { type: 'number' },
	transformTranslateYHover_mobile: { type: 'number' },
	transformTranslateYHoverUnit: { type: 'string', default: 'px' },

	// SCALE - Normal
	transformScaleProportions: { type: 'boolean', default: true },
	transformScale: { type: 'number' },
	transformScale_tablet: { type: 'number' },
	transformScale_mobile: { type: 'number' },
	transformScaleX: { type: 'number' },
	transformScaleX_tablet: { type: 'number' },
	transformScaleX_mobile: { type: 'number' },
	transformScaleY: { type: 'number' },
	transformScaleY_tablet: { type: 'number' },
	transformScaleY_mobile: { type: 'number' },

	// SCALE - Hover
	transformScaleProportionsHover: { type: 'boolean', default: true },
	transformScaleHover: { type: 'number' },
	transformScaleHover_tablet: { type: 'number' },
	transformScaleHover_mobile: { type: 'number' },
	transformScaleXHover: { type: 'number' },
	transformScaleXHover_tablet: { type: 'number' },
	transformScaleXHover_mobile: { type: 'number' },
	transformScaleYHover: { type: 'number' },
	transformScaleYHover_tablet: { type: 'number' },
	transformScaleYHover_mobile: { type: 'number' },

	// SKEW - Normal
	transformSkewX: { type: 'number' },
	transformSkewX_tablet: { type: 'number' },
	transformSkewX_mobile: { type: 'number' },
	transformSkewY: { type: 'number' },
	transformSkewY_tablet: { type: 'number' },
	transformSkewY_mobile: { type: 'number' },

	// SKEW - Hover
	transformSkewXHover: { type: 'number' },
	transformSkewXHover_tablet: { type: 'number' },
	transformSkewXHover_mobile: { type: 'number' },
	transformSkewYHover: { type: 'number' },
	transformSkewYHover_tablet: { type: 'number' },
	transformSkewYHover_mobile: { type: 'number' },

	// FLIP - Normal
	transformFlipX: { type: 'boolean', default: false },
	transformFlipY: { type: 'boolean', default: false },

	// FLIP - Hover
	transformFlipXHover: { type: 'boolean', default: false },
	transformFlipYHover: { type: 'boolean', default: false },

	// ANCHOR POINT - Normal
	transformOriginX: { type: 'string', default: 'center' },
	transformOriginX_tablet: { type: 'string' },
	transformOriginX_mobile: { type: 'string' },
	transformOriginY: { type: 'string', default: 'center' },
	transformOriginY_tablet: { type: 'string' },
	transformOriginY_mobile: { type: 'string' },

	// ANCHOR POINT - Hover
	transformOriginXHover: { type: 'string' },
	transformOriginXHover_tablet: { type: 'string' },
	transformOriginXHover_mobile: { type: 'string' },
	transformOriginYHover: { type: 'string' },
	transformOriginYHover_tablet: { type: 'string' },
	transformOriginYHover_mobile: { type: 'string' },

	// TRANSITION
	transformTransitionDuration: { type: 'number', default: 300 },
};
