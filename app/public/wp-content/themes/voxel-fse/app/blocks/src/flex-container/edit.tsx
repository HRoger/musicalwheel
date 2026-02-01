/**
 * Flex Container Block - Editor Component
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
import { useSelect } from '@wordpress/data';

// Import Layout Preset Selector
import LayoutPresetSelector from './LayoutPresetSelector';

// Import Shared Controls
import { AdvancedTab, VoxelTab, InspectorTabs } from '@shared/controls';

// Import Inspector Tabs
import { LayoutTab, StyleTab } from './inspector';

// Import style generation utility
import { generateContainerStyles, generateInnerStyles, type FlexContainerAttributes } from './styles';

// Import shared style utilities for AdvancedTab/VoxelTab attributes
import { generateAdvancedStyles, combineBlockClasses } from '../../shared/utils/generateAdvancedStyles';

// Import background elements rendering utilities
import { renderBackgroundElements } from '../../shared/utils/backgroundElements';

// Import editor styles


interface EditProps {
	attributes: Record<string, any>;
	setAttributes: (attrs: Partial<EditProps['attributes']>) => void;
	clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Generate stable block ID once
	useEffect(() => {
		if (!attributes.blockId) {
			const newBlockId = Math.random().toString(36).substring(2, 10);
			setAttributes({ blockId: newBlockId });
		}
	}, []);

	// Check if block has inner blocks (to determine if preset selector should show)
	const hasInnerBlocks = useSelect(
		(select) => {
			const { getBlockCount } = select('core/block-editor') as {
				getBlockCount: (clientId: string) => number;
			};
			return getBlockCount(clientId) > 0;
		},
		[clientId]
	);

	// Determine if we should show the layout preset selector
	// Show it when: no preset selected AND no inner blocks AND not a child preset
	const showPresetSelector = !attributes.layoutPreset && !hasInnerBlocks;

	// ALWAYS set align="full" so WordPress wrapper doesn't constrain the outer container
	// The inner wrapper (.e-con-inner) handles the boxed content width constraint
	// This matches Elementor's behavior where the container is always full-width
	useEffect(() => {
		if (attributes.align !== 'full') {
			setAttributes({ align: 'full' });
		}
	}, [attributes.align]);

	// =================================================================
	// Scroll position preservation when device type changes
	// =================================================================
	// Get current device type from WordPress
	const currentDeviceType = useSelect((select) => {
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

	// Refs to track scroll position and previous device type
	const scrollPositionRef = useRef<number>(0);
	const previousDeviceRef = useRef<string>(currentDeviceType);
	const deviceChangedRef = useRef<boolean>(false);

	// Set up scroll listener to continuously track scroll position
	useEffect(() => {
		// Find the inspector scroll container
		const scrollContainer =
			(document.querySelector('.interface-complementary-area__fill') as HTMLElement) ||
			(document.querySelector('.block-editor-block-inspector') as HTMLElement);

		if (!scrollContainer) return;

		const handleScroll = () => {
			scrollPositionRef.current = scrollContainer.scrollTop;
		};

		// Initial position
		scrollPositionRef.current = scrollContainer.scrollTop;

		scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
		return () => scrollContainer.removeEventListener('scroll', handleScroll);
	}, []);

	// Detect device type change
	useEffect(() => {
		if (previousDeviceRef.current !== currentDeviceType) {
			deviceChangedRef.current = true;
			previousDeviceRef.current = currentDeviceType;
		}
	}, [currentDeviceType]);

	// Restore scroll position after device change (using useLayoutEffect for sync restore)
	useLayoutEffect(() => {
		if (!deviceChangedRef.current) return;

		const scrollContainer =
			(document.querySelector('.interface-complementary-area__fill') as HTMLElement) ||
			(document.querySelector('.block-editor-block-inspector') as HTMLElement);

		if (scrollContainer && scrollPositionRef.current > 0) {
			scrollContainer.scrollTop = scrollPositionRef.current;
		}

		deviceChangedRef.current = false;
	}, [currentDeviceType]);

	// Slideshow animation state for editor preview
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	// Drag state for manual slide navigation
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
	const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Drag threshold (minimum distance to trigger slide change)
	const DRAG_THRESHOLD = 50;

	// Extract slideshow-related attributes
	const {
		backgroundType,
		bgSlideshowGallery,
		bgSlideshowInfiniteLoop,
		bgSlideshowDuration,
		bgSlideshowTransition,
	} = attributes;

	// Determine if slideshow is active (has multiple images)
	const isSlideshowEnabled =
		backgroundType === 'slideshow' &&
		Array.isArray(bgSlideshowGallery) &&
		bgSlideshowGallery.length > 1;

	// Determine if auto-play should run
	const isSlideshowAutoPlay = isSlideshowEnabled && bgSlideshowInfiniteLoop !== false;

	const galleryLength = Array.isArray(bgSlideshowGallery) ? bgSlideshowGallery.length : 0;
	const slideDuration = bgSlideshowDuration ?? 5000;
	const transition = bgSlideshowTransition || 'fade';

	// Go to next slide
	const goToNextSlide = useCallback(() => {
		if (!isSlideshowEnabled) return;
		setCurrentSlideIndex((prevIndex) => {
			const nextIndex = prevIndex + 1;
			if (nextIndex >= galleryLength) {
				return bgSlideshowInfiniteLoop !== false ? 0 : prevIndex;
			}
			return nextIndex;
		});
	}, [isSlideshowEnabled, galleryLength, bgSlideshowInfiniteLoop]);

	// Go to previous slide
	const goToPrevSlide = useCallback(() => {
		if (!isSlideshowEnabled) return;
		setCurrentSlideIndex((prevIndex) => {
			const nextIndex = prevIndex - 1;
			if (nextIndex < 0) {
				return bgSlideshowInfiniteLoop !== false ? galleryLength - 1 : prevIndex;
			}
			return nextIndex;
		});
	}, [isSlideshowEnabled, galleryLength, bgSlideshowInfiniteLoop]);

	// Start auto-play
	const startAutoPlay = useCallback(() => {
		if (!isSlideshowAutoPlay || galleryLength < 2) return;
		if (autoPlayRef.current) clearInterval(autoPlayRef.current);
		autoPlayRef.current = setInterval(() => {
			setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % galleryLength);
		}, slideDuration);
	}, [isSlideshowAutoPlay, galleryLength, slideDuration]);

	// Stop auto-play
	const stopAutoPlay = useCallback(() => {
		if (autoPlayRef.current) {
			clearInterval(autoPlayRef.current);
			autoPlayRef.current = null;
		}
	}, []);

	// Handle drag start
	const handleDragStart = useCallback(
		(clientX: number, clientY: number) => {
			if (!isSlideshowEnabled) return;
			setIsDragging(true);
			setDragStart({ x: clientX, y: clientY });
			setDragCurrent({ x: clientX, y: clientY });
			stopAutoPlay();
		},
		[isSlideshowEnabled, stopAutoPlay]
	);

	// Handle drag move
	const handleDragMove = useCallback(
		(clientX: number, clientY: number) => {
			if (!isDragging) return;
			setDragCurrent({ x: clientX, y: clientY });
		},
		[isDragging]
	);

	// Handle drag end
	const handleDragEnd = useCallback(() => {
		if (!isDragging) return;
		setIsDragging(false);

		const deltaX = dragCurrent.x - dragStart.x;
		const deltaY = dragCurrent.y - dragStart.y;

		// Determine if drag is horizontal or vertical based on transition
		const isHorizontalTransition =
			transition === 'slide_left' || transition === 'slide_right' || transition === 'fade';

		if (isHorizontalTransition) {
			if (Math.abs(deltaX) > DRAG_THRESHOLD) {
				if (deltaX < 0) {
					goToNextSlide();
				} else {
					goToPrevSlide();
				}
			}
		} else {
			if (Math.abs(deltaY) > DRAG_THRESHOLD) {
				if (deltaY < 0) {
					goToNextSlide();
				} else {
					goToPrevSlide();
				}
			}
		}

		// Restart auto-play
		startAutoPlay();
	}, [isDragging, dragCurrent, dragStart, transition, goToNextSlide, goToPrevSlide, startAutoPlay]);

	// Slideshow animation effect - cycles through slides in the editor (auto-play)
	useEffect(() => {
		if (!isSlideshowAutoPlay || galleryLength < 2) {
			// Reset to first slide when slideshow is disabled
			setCurrentSlideIndex(0);
			stopAutoPlay();
			return;
		}

		startAutoPlay();

		// Cleanup interval on unmount or when dependencies change
		return () => stopAutoPlay();
	}, [isSlideshowAutoPlay, galleryLength, slideDuration, startAutoPlay, stopAutoPlay]);

	// Mouse event handlers for drag
	const onMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button !== 0) return; // Only left button
			e.preventDefault();
			handleDragStart(e.clientX, e.clientY);
		},
		[handleDragStart]
	);

	const onMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return;
			e.preventDefault();
			handleDragMove(e.clientX, e.clientY);
		},
		[isDragging, handleDragMove]
	);

	const onMouseUp = useCallback(() => {
		handleDragEnd();
	}, [handleDragEnd]);

	const onMouseLeave = useCallback(() => {
		if (isDragging) handleDragEnd();
	}, [isDragging, handleDragEnd]);

	// Touch event handlers for drag
	const onTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (e.touches.length !== 1) return;
			const touch = e.touches[0];
			handleDragStart(touch.clientX, touch.clientY);
		},
		[handleDragStart]
	);

	const onTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging || e.touches.length !== 1) return;
			const touch = e.touches[0];
			handleDragMove(touch.clientX, touch.clientY);
		},
		[isDragging, handleDragMove]
	);

	const onTouchEnd = useCallback(() => {
		handleDragEnd();
	}, [handleDragEnd]);

	// Slideshow drag props
	const slideshowDragProps = isSlideshowEnabled
		? {
			onMouseDown,
			onMouseMove,
			onMouseUp,
			onMouseLeave,
			onTouchStart,
			onTouchMove,
			onTouchEnd,
			style: { cursor: isDragging ? 'grabbing' : 'grab' } as React.CSSProperties,
		}
		: {};

	// Generate OUTER container styles from attributes (position, min-height, backdrop, etc.)
	const containerStyles = useMemo(
		() => generateContainerStyles(attributes as FlexContainerAttributes),
		[attributes]
	);

	// Generate INNER wrapper styles (flex/grid, max-width, gaps)
	const innerStyles = useMemo(
		() => generateInnerStyles(attributes as FlexContainerAttributes),
		[attributes]
	);

	// Generate advanced styles from AdvancedTab/BackgroundControl attributes
	const advancedStyles = useMemo(() => generateAdvancedStyles(attributes), [attributes]);

	// Merge styles for OUTER container: advancedStyles provides base (margin, padding, background, border, etc.)
	// containerStyles overrides with outer-specific properties (width: 100%, position, min-height)
	const mergedStyles = useMemo(
		() => ({ ...advancedStyles, ...containerStyles }),
		[advancedStyles, containerStyles]
	);

	// Generate unique root class for targeting the WordPress wrapper element
	// This is the Essential Blocks pattern - adding a class that we can target with inline styles
	const rootClass = `root-voxel-fse-flex-container-${attributes.blockId || 'default'}`;

	// Apply styles to the OUTER block wrapper (backgrounds, position, min-height)
	// The rootClass gets applied to the wrapper element by useBlockProps
	const blockProps = useBlockProps({
		className: combineBlockClasses(
			`${rootClass} voxel-fse-flex-container voxel-fse-flex-container-${attributes.blockId || 'default'}`,
			attributes
		),
		style: mergedStyles,
		// Grid outline data attribute for editor CSS
		...(attributes.containerLayout === 'grid' && attributes.gridOutline
			? { 'data-grid-outline': 'true' }
			: {}),
	});

	// Inner blocks props for the e-con-inner wrapper (flex/grid layout, max-width)
	// This creates the two-element structure matching Elementor's container model
	// Note: Full-width mode is handled by the editor.BlockListBlock filter in filters.tsx
	// IMPORTANT: We pass only className to useInnerBlocksProps, then manually merge styles
	// to ensure our flex/grid properties (justifyContent, alignItems) are applied correctly
	const innerBlocksProps = useInnerBlocksProps({ className: 'e-con-inner' }, {});

	// Show layout preset selector for new empty containers
	if (showPresetSelector) {
		return (
			<div {...blockProps}>
				<LayoutPresetSelector clientId={clientId} setAttributes={setAttributes} />
			</div>
		);
	}

	return (
		<div {...blockProps}>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'layout',
							label: __('Layout', 'voxel-fse'),
							icon: '\ue899',
							render: () => (
								<LayoutTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'advanced',
							label: __('Advanced', 'voxel-fse'),
							icon: '\ue916',
							render: () => (
								<AdvancedTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'voxel',
							label: __('Voxel', 'voxel-fse'),
							icon: '/wp-content/themes/voxel/assets/images/post-types/logo.svg',
							render: () => (
								<VoxelTab
									attributes={attributes}
									setAttributes={setAttributes}
									showContainerOptions={true}
								/>
							),
						},
					]}
					includeAdvancedTab={false}
					attributes={attributes}
					setAttributes={setAttributes}
					defaultTab="layout"
					activeTabAttribute="inspectorActiveTab"
				/>
			</InspectorControls>

			{/* Background elements: video, slideshow, overlay, shape dividers - on outer container */}
			{renderBackgroundElements(
				attributes,
				true,
				currentSlideIndex,
				slideshowDragProps,
				`.voxel-fse-flex-container-${attributes.blockId || 'default'}`
			)}

			{/* Inner content wrapper with flex/grid layout and max-width constraint */}
			{/* This matches Elementor's .e-con-inner structure */}
			{/* Explicitly merge innerStyles to ensure flex properties are applied */}
			<div {...innerBlocksProps} style={{ ...innerBlocksProps.style, ...innerStyles }} />
		</div>
	);
}
