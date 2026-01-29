/**
 * Animation Select Control Component
 *
 * A categorized dropdown for selecting entrance animations.
 * Matches Elementor's ANIMATION control type with optgroups.
 *
 * Based on Elementor's control-animation.php which uses Animate.css classes.
 * Source: plugins/elementor/includes/widgets/common-base.php:L837-855
 *
 * @package VoxelFSE
 */

import React, { useState, useCallback } from 'react';
import { SelectControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { video } from '@wordpress/icons';

/**
 * Animation categories matching Elementor's control-animation.php
 * These are Animate.css classes used for entrance animations.
 */
export const ANIMATION_OPTIONS = {
	'': __('None', 'voxel-fse'),

	// Fading
	fading: {
		label: __('Fading', 'voxel-fse'),
		options: {
			fadeIn: __('Fade In', 'voxel-fse'),
			fadeInDown: __('Fade In Down', 'voxel-fse'),
			fadeInLeft: __('Fade In Left', 'voxel-fse'),
			fadeInRight: __('Fade In Right', 'voxel-fse'),
			fadeInUp: __('Fade In Up', 'voxel-fse'),
		},
	},

	// Zooming
	zooming: {
		label: __('Zooming', 'voxel-fse'),
		options: {
			zoomIn: __('Zoom In', 'voxel-fse'),
			zoomInDown: __('Zoom In Down', 'voxel-fse'),
			zoomInLeft: __('Zoom In Left', 'voxel-fse'),
			zoomInRight: __('Zoom In Right', 'voxel-fse'),
			zoomInUp: __('Zoom In Up', 'voxel-fse'),
		},
	},

	// Bouncing
	bouncing: {
		label: __('Bouncing', 'voxel-fse'),
		options: {
			bounceIn: __('Bounce In', 'voxel-fse'),
			bounceInDown: __('Bounce In Down', 'voxel-fse'),
			bounceInLeft: __('Bounce In Left', 'voxel-fse'),
			bounceInRight: __('Bounce In Right', 'voxel-fse'),
			bounceInUp: __('Bounce In Up', 'voxel-fse'),
		},
	},

	// Sliding
	sliding: {
		label: __('Sliding', 'voxel-fse'),
		options: {
			slideInDown: __('Slide In Down', 'voxel-fse'),
			slideInLeft: __('Slide In Left', 'voxel-fse'),
			slideInRight: __('Slide In Right', 'voxel-fse'),
			slideInUp: __('Slide In Up', 'voxel-fse'),
		},
	},

	// Rotating
	rotating: {
		label: __('Rotating', 'voxel-fse'),
		options: {
			rotateIn: __('Rotate In', 'voxel-fse'),
			rotateInDownLeft: __('Rotate In Down Left', 'voxel-fse'),
			rotateInDownRight: __('Rotate In Down Right', 'voxel-fse'),
			rotateInUpLeft: __('Rotate In Up Left', 'voxel-fse'),
			rotateInUpRight: __('Rotate In Up Right', 'voxel-fse'),
		},
	},

	// Attention Seekers
	attention: {
		label: __('Attention Seekers', 'voxel-fse'),
		options: {
			bounce: __('Bounce', 'voxel-fse'),
			flash: __('Flash', 'voxel-fse'),
			pulse: __('Pulse', 'voxel-fse'),
			rubberBand: __('Rubber Band', 'voxel-fse'),
			shake: __('Shake', 'voxel-fse'),
			headShake: __('Head Shake', 'voxel-fse'),
			swing: __('Swing', 'voxel-fse'),
			tada: __('Tada', 'voxel-fse'),
			wobble: __('Wobble', 'voxel-fse'),
			jello: __('Jello', 'voxel-fse'),
		},
	},

	// Light Speed
	lightSpeed: {
		label: __('Light Speed', 'voxel-fse'),
		options: {
			lightSpeedIn: __('Light Speed In', 'voxel-fse'),
		},
	},

	// Specials
	specials: {
		label: __('Specials', 'voxel-fse'),
		options: {
			rollIn: __('Roll In', 'voxel-fse'),
		},
	},
};

/**
 * Build flat options array for SelectControl with optgroups
 */
function buildSelectOptions(): Array<{ label: string; value: string; disabled?: boolean }> {
	const options: Array<{ label: string; value: string; disabled?: boolean }> = [];

	// Add "None" option
	options.push({ label: __('None', 'voxel-fse'), value: '' });

	// Add categorized options
	Object.entries(ANIMATION_OPTIONS).forEach(([key, group]) => {
		if (key === '' || typeof group === 'string') return;

		// Add optgroup header (disabled option as separator)
		options.push({
			label: `── ${group.label} ──`,
			value: `__group_${key}`,
			disabled: true,
		});

		// Add options within group
		Object.entries(group.options).forEach(([animValue, animLabel]) => {
			options.push({
				label: `    ${animLabel}`,
				value: animValue,
			});
		});
	});

	return options;
}

export interface AnimationSelectControlProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	previewElementSelector?: string; // CSS selector for element to preview animation on
}

/**
 * AnimationSelectControl - Categorized animation dropdown with preview
 */
export const AnimationSelectControl: React.FC<AnimationSelectControlProps> = ({
	label = __('Entrance Animation', 'voxel-fse'),
	value,
	onChange,
	previewElementSelector,
}) => {
	const [isAnimating, setIsAnimating] = useState(false);

	// Build options once
	const selectOptions = React.useMemo(() => buildSelectOptions(), []);

	// Preview animation on the element
	const handlePreview = useCallback(() => {
		if (!value || isAnimating) return;

		// Try to find element to animate
		let element: HTMLElement | null = null;

		if (previewElementSelector) {
			// Use provided selector
			const iframe = document.querySelector<HTMLIFrameElement>(
				'iframe[name="editor-canvas"]'
			);
			if (iframe?.contentDocument) {
				element = iframe.contentDocument.querySelector(previewElementSelector);
			} else {
				element = document.querySelector(previewElementSelector);
			}
		} else {
			// Try to find the selected block in the editor
			const iframe = document.querySelector<HTMLIFrameElement>(
				'iframe[name="editor-canvas"]'
			);
			if (iframe?.contentDocument) {
				element = iframe.contentDocument.querySelector('.is-selected');
			} else {
				element = document.querySelector('.is-selected');
			}
		}

		if (!element) return;

		// Apply animation
		setIsAnimating(true);
		element.style.animationName = 'none';
		element.classList.remove('animated', value);

		// Force reflow
		void element.offsetWidth;

		// Add animation classes
		element.classList.add('animated', value);

		// Remove animation classes after completion
		const handleAnimationEnd = () => {
			element?.classList.remove('animated', value);
			setIsAnimating(false);
		};

		element.addEventListener('animationend', handleAnimationEnd, { once: true });

		// Fallback timeout in case animationend doesn't fire
		setTimeout(() => {
			element?.classList.remove('animated', value);
			setIsAnimating(false);
		}, 2000);
	}, [value, isAnimating, previewElementSelector]);

	return (
		<div className="voxel-fse-animation-select-control">
			<div className="voxel-fse-animation-select-row">
				<div className="voxel-fse-animation-select-dropdown">
					<SelectControl
						label={label}
						value={value || ''}
						options={selectOptions}
						onChange={(newValue) => {
							// Ignore optgroup "values"
							if (newValue.startsWith('__group_')) return;
							onChange(newValue);
						}}
						__nextHasNoMarginBottom
					/>
				</div>
				{value && (
					<div className="voxel-fse-animation-preview-wrapper">
						<Button
							icon={video}
							label={__('Preview Animation', 'voxel-fse')}
							onClick={handlePreview}
							disabled={isAnimating}
							size="compact"
							className="voxel-fse-animation-preview-btn"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default AnimationSelectControl;
