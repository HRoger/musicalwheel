/**
 * Background Elements Rendering Utilities
 *
 * Generates styles and JSX for background-related DOM elements:
 * - Background Overlay (color/gradient/image overlay)
 * - Video Background (YouTube/Vimeo/self-hosted)
 * - Slideshow Background (image gallery with transitions)
 * - Shape Dividers (top/bottom SVG shapes)
 *
 * These elements require actual DOM rendering, not just CSS generation.
 * Used by both edit.tsx (editor preview) and save.tsx (frontend output).
 *
 * @package VoxelFSE
 */

import React from 'react';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Shape divider presets - actual SVG data from Elementor theme shapes
 * Each shape has its own viewBox dimensions and path data
 */
interface ShapeData {
	viewBox: string;
	paths: Array<{ d: string; opacity?: number }>;
}

const SHAPE_DATA: Record<string, ShapeData> = {
	'mountains': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M473,67.3c-203.9,88.3-263.1-34-320.3,0C66,119.1,0,59.7,0,59.7V0h1000v59.7 c0,0-62.1,26.1-94.9,29.3c-32.8,3.3-62.8-12.3-75.8-22.1C806,49.6,745.3,8.7,694.9,4.7S492.4,59,473,67.3z', opacity: 0.33 },
			{ d: 'M734,67.3c-45.5,0-77.2-23.2-129.1-39.1c-28.6-8.7-150.3-10.1-254,39.1 s-91.7-34.4-149.2,0C115.7,118.3,0,39.8,0,39.8V0h1000v36.5c0,0-28.2-18.5-92.1-18.5C810.2,18.1,775.7,67.3,734,67.3z', opacity: 0.66 },
			{ d: 'M766.1,28.9c-200-57.5-266,65.5-395.1,19.5C242,1.8,242,5.4,184.8,20.6C128,35.8,132.3,44.9,89.9,52.5C28.6,63.7,0,0,0,0 h1000c0,0-9.9,40.9-83.6,48.1S829.6,47,766.1,28.9z' },
		],
	},
	'drops': {
		viewBox: '0 0 283.5 27.8',
		paths: [
			{ d: 'M0 0v1.4c.6.7 1.1 1.4 1.4 2 2 3.8 2.2 6.6 1.8 10.8-.3 3.3-2.4 9.4 0 12.3 1.7 2 3.7 1.4 4.6-.9 1.4-3.8-.7-8.2-.6-12 .1-3.7 3.2-5.5 6.9-4.9 4 .6 4.8 4 4.9 7.4.1 1.8-1.1 7 0 8.5.6.8 1.6 1.2 2.4.5 1.4-1.1.1-5.4.1-6.9.1-3.7.3-8.6 4.1-10.5 5-2.5 6.2 1.6 5.4 5.6-.4 1.7-1 9.2 2.9 6.3 1.5-1.1.7-3.5.5-4.9-.4-2.4-.4-4.3 1-6.5.9-1.4 2.4-3.1 4.2-3 2.4.1 2.7 2.2 4 3.7 1.5 1.8 1.8 2.2 3 .1 1.1-1.9 1.2-2.8 3.6-3.3 1.3-.3 4.8-1.4 5.9-.5 1.5 1.1.6 2.8.4 4.3-.2 1.1-.6 4 1.8 3.4 1.7-.4-.3-4.1.6-5.6 1.3-2.2 5.8-1.4 7 .5 1.3 2.1.5 5.8.1 8.1s-1.2 5-.6 7.4c1.3 5.1 4.4.9 4.3-2.4-.1-4.4-2-8.8-.5-13 .9-2.4 4.6-6.6 7.7-4.5 2.7 1.8.5 7.8.2 10.3-.2 1.7-.8 4.6.2 6.2.9 1.4 2 1.5 2.6-.3.5-1.5-.9-4.5-1-6.1-.2-1.7-.4-3.7.2-5.4 1.8-5.6 3.5 2.4 6.3.6 1.4-.9 4.3-9.4 6.1-3.1.6 2.2-1.3 7.8.7 8.9 4.2 2.3 1.5-7.1 2.2-8 3.1-4 4.7 3.8 6.1 4.1 3.1.7 2.8-7.9 8.1-4.5 1.7 1.1 2.9 3.3 3.2 5.2.4 2.2-1 4.5-.6 6.6 1 4.3 4.4 1.5 4.4-1.7 0-2.7-3-8.3 1.4-9.1 4.4-.9 7.3 3.5 7.8 6.9.3 2-1.5 10.9 1.3 11.3 4.1.6-3.2-15.7 4.8-15.8 4.7-.1 2.8 4.1 3.9 6.6 1 2.4 2.1 1 2.3-.8.3-1.9-.9-3.2 1.3-4.3 5.9-2.9 5.9 5.4 5.5 8.5-.3 2-1.7 8.4 2 8.1 6.9-.5-2.8-16.9 4.8-18.7 4.7-1.2 6.1 3.6 6.3 7.1.1 1.7-1.2 8.1.6 9.1 3.5 2 1.9-7 2-8.4.2-4 1.2-9.6 6.4-9.8 4.7-.2 3.2 4.6 2.7 7.5-.4 2.2 1.3 8.6 3.8 4.4 1.1-1.9-.3-4.1-.3-6 0-1.7.4-3.2 1.3-4.6 1-1.6 2.9-3.5 5.1-2.9 2.5.6 2.3 4.1 4.1 4.9 1.9.8 1.6-.9 2.3-2.1 1.2-2.1 2.1-2.1 4.4-2.4 1.4-.2 3.6-1.5 4.9-.5 2.3 1.7-.7 4.4.1 6.5.6 1.5 2.1 1.7 2.8.3.7-1.4-1.1-3.4-.3-4.8 1.4-2.5 6.2-1.2 7.2 1 2.3 4.8-3.3 12-.2 16.3 3 4.1 3.9-2.8 3.8-4.8-.4-4.3-2.1-8.9 0-13.1 1.3-2.5 5.9-5.7 7.9-2.4 2 3.2-1.3 9.8-.8 13.4.5 4.4 3.5 3.3 2.7-.8-.4-1.9-2.4-10 .6-11.1 3.7-1.4 2.8 7.2 6.5.4 2.2-4.1 4.9-3.1 5.2 1.2.1 1.5-.6 3.1-.4 4.6.2 1.9 1.8 3.7 3.3 1.3 1-1.6-2.6-10.4 2.9-7.3 2.6 1.5 1.6 6.5 4.8 2.7 1.3-1.5 1.7-3.6 4-3.7 2.2-.1 4 2.3 4.8 4.1 1.3 2.9-1.5 8.4.9 10.3 4.2 3.3 3-5.5 2.7-6.9-.6-3.9 1-7.2 5.5-5 4.1 2.1 4.3 7.7 4.1 11.6 0 .8-.6 9.5 2.5 5.2 1.2-1.7-.1-7.7.1-9.6.3-2.9 1.2-5.5 4.3-6.2 4.5-1 7.7 1.5 7.4 5.8-.2 3.5-1.8 7.7-.5 11.1 1 2.7 3.6 2.8 5 .2 1.6-3.1 0-8.3-.4-11.6-.4-4.2-.2-7 1.8-10.8 0 0-.1.1-.1.2-.2.4-.3.7-.4.8v.1c-.1.2-.1.2 0 0v-.1l.4-.8c0-.1.1-.1.1-.2.2-.4.5-.8.8-1.2V0H0zM282.7 3.4z' },
		],
	},
	'clouds': {
		viewBox: '0 0 283.5 27.8',
		paths: [
			{ d: 'M0 0v6.7c1.9-.8 4.7-1.4 8.5-1 9.5 1.1 11.1 6 11.1 6s2.1-.7 4.3-.2c2.1.5 2.8 2.6 2.8 2.6s.2-.5 1.4-.7c1.2-.2 1.7.2 1.7.2s0-2.1 1.9-2.8c1.9-.7 3.6.7 3.6.7s.7-2.9 3.1-4.1 4.7 0 4.7 0 1.2-.5 2.4 0 1.7 1.4 1.7 1.4h1.4c.7 0 1.2.7 1.2.7s.8-1.8 4-2.2c3.5-.4 5.3 2.4 6.2 4.4.4-.4 1-.7 1.8-.9 2.8-.7 4 .7 4 .7s1.7-5 11.1-6c9.5-1.1 12.3 3.9 12.3 3.9s1.2-4.8 5.7-5.7c4.5-.9 6.8 1.8 6.8 1.8s.6-.6 1.5-.9c.9-.2 1.9-.2 1.9-.2s5.2-6.4 12.6-3.3c7.3 3.1 4.7 9 4.7 9s1.9-.9 4 0 2.8 2.4 2.8 2.4 1.9-1.2 4.5-1.2 4.3 1.2 4.3 1.2.2-1 1.4-1.7 2.1-.7 2.1-.7-.5-3.1 2.1-5.5 5.7-1.4 5.7-1.4 1.5-2.3 4.2-1.1c2.7 1.2 1.7 5.2 1.7 5.2s.3-.1 1.3.5c.5.4.8.8.9 1.1.5-1.4 2.4-5.8 8.4-4 7.1 2.1 3.5 8.9 3.5 8.9s.8-.4 2 0 1.1 1.1 1.1 1.1 1.1-1.1 2.3-1.1 2.1.5 2.1.5 1.9-3.6 6.2-1.2 1.9 6.4 1.9 6.4 2.6-2.4 7.4 0c3.4 1.7 3.9 4.9 3.9 4.9s3.3-6.9 10.4-7.9 11.5 2.6 11.5 2.6.8 0 1.2.2c.4.2.9.9.9.9s4.4-3.1 8.3.2c1.9 1.7 1.5 5 1.5 5s.3-1.1 1.6-1.4c1.3-.3 2.3.2 2.3.2s-.1-1.2.5-1.9 1.9-.9 1.9-.9-4.7-9.3 4.4-13.4c5.6-2.5 9.2.9 9.2.9s5-6.2 15.9-6.2 16.1 8.1 16.1 8.1.7-.2 1.6-.4V0H0z' },
		],
	},
	'zigzag': {
		viewBox: '0 0 1800 5.8',
		paths: [
			{ d: 'M5.4.4l5.4 5.3L16.5.4l5.4 5.3L27.5.4 33 5.7 38.6.4l5.5 5.4h.1L49.9.4l5.4 5.3L60.9.4l5.5 5.3L72 .4l5.5 5.3L83.1.4l5.4 5.3L94.1.4l5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.4 5.3L161 .4l5.4 5.3L172 .4l5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3L261 .4l5.4 5.3L272 .4l5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3L361 .4l5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.6-5.4 5.5 5.3L461 .4l5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1L550 .4l5.4 5.3L561 .4l5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2L650 .4l5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2L750 .4l5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.4h.2L850 .4l5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.4h.2l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.7-5.4 5.4 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.5 5.4h.1l5.6-5.4 5.5 5.3 5.6-5.3 5.5 5.3 5.6-5.3 5.4 5.3 5.7-5.3 5.4 5.3 5.6-5.3 5.5 5.4V0H-.2v5.8z' },
		],
	},
	'pyramids': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M761.9,44.1L643.1,27.2L333.8,98L0,3.8V0l1000,0v3.9' },
		],
	},
	'triangle': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M500,98.9L0,6.1V0h1000v6.1L500,98.9z' },
		],
	},
	'triangle-asymmetrical': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M738,99l262-93V0H0v5.6L738,99z' },
		],
	},
	'tilt': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M0,6V0h1000v100L0,6z' },
		],
	},
	'opacity-tilt': {
		viewBox: '0 0 2600 131.1',
		paths: [
			{ d: 'M0 0L2600 0 2600 69.1 0 0z' },
			{ d: 'M0 0L2600 0 2600 69.1 0 69.1z', opacity: 0.5 },
			{ d: 'M2600 0L0 0 0 130.1 2600 69.1z', opacity: 0.25 },
		],
	},
	'curve': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M1000,4.3V0H0v4.3C0.9,23.1,126.7,99.2,500,100S1000,22.7,1000,4.3z' },
		],
	},
	'waves': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7 c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4 c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z' },
		],
	},
	'wave-brush': {
		viewBox: '0 0 283.5 27.8',
		paths: [
			{ d: 'M283.5,9.7c0,0-7.3,4.3-14,4.6c-6.8,0.3-12.6,0-20.9-1.5c-11.3-2-33.1-10.1-44.7-5.7 s-12.1,4.6-18,7.4c-6.6,3.2-20,9.6-36.6,9.3C131.6,23.5,99.5,7.2,86.3,8c-1.4,0.1-6.6,0.8-10.5,2c-3.8,1.2-9.4,3.8-17,4.7 c-3.2,0.4-8.3,1.1-14.2,0.9c-1.5-0.1-6.3-0.4-12-1.6c-5.7-1.2-11-3.1-15.8-3.7C6.5,9.2,0,10.8,0,10.8V0h283.5V9.7z M260.8,11.3 c-0.7-1-2-0.4-4.3-0.4c-2.3,0-6.1-1.2-5.8-1.1c0.3,0.1,3.1,1.5,6,1.9C259.7,12.2,261.4,12.3,260.8,11.3z M242.4,8.6 c0,0-2.4-0.2-5.6-0.9c-3.2-0.8-10.3-2.8-15.1-3.5c-8.2-1.1-15.8,0-15.1,0.1c0.8,0.1,9.6-0.6,17.6,1.1c3.3,0.7,9.3,2.2,12.4,2.7 C239.9,8.7,242.4,8.6,242.4,8.6z M185.2,8.5c1.7-0.7-13.3,4.7-18.5,6.1c-2.1,0.6-6.2,1.6-10,2c-3.9,0.4-8.9,0.4-8.8,0.5 c0,0.2,5.8,0.8,11.2,0c5.4-0.8,5.2-1.1,7.6-1.6C170.5,14.7,183.5,9.2,185.2,8.5z M199.1,6.9c0.2,0-0.8-0.4-4.8,1.1 c-4,1.5-6.7,3.5-6.9,3.7c-0.2,0.1,3.5-1.8,6.6-3C197,7.5,199,6.9,199.1,6.9z M283,6c-0.1,0.1-1.9,1.1-4.8,2.5s-6.9,2.8-6.7,2.7 c0.2,0,3.5-0.6,7.4-2.5C282.8,6.8,283.1,5.9,283,6z M31.3,11.6c0.1-0.2-1.9-0.2-4.5-1.2s-5.4-1.6-7.8-2C15,7.6,7.3,8.5,7.7,8.6 C8,8.7,15.9,8.3,20.2,9.3c2.2,0.5,2.4,0.5,5.7,1.6S31.2,11.9,31.3,11.6z M73,9.2c0.4-0.1,3.5-1.6,8.4-2.6c4.9-1.1,8.9-0.5,8.9-0.8 c0-0.3-1-0.9-6.2-0.3S72.6,9.3,73,9.2z M71.6,6.7C71.8,6.8,75,5.4,77.3,5c2.3-0.3,1.9-0.5,1.9-0.6c0-0.1-1.1-0.2-2.7,0.2 C74.8,5.1,71.4,6.6,71.6,6.7z M93.6,4.4c0.1,0.2,3.5,0.8,5.6,1.8c2.1,1,1.8,0.6,1.9,0.5c0.1-0.1-0.8-0.8-2.4-1.3 C97.1,4.8,93.5,4.2,93.6,4.4z M65.4,11.1c-0.1,0.3,0.3,0.5,1.9-0.2s2.6-1.3,2.2-1.2s-0.9,0.4-2.5,0.8C65.3,10.9,65.5,10.8,65.4,11.1 z M34.5,12.4c-0.2,0,2.1,0.8,3.3,0.9c1.2,0.1,2,0.1,2-0.2c0-0.3-0.1-0.5-1.6-0.4C36.6,12.8,34.7,12.4,34.5,12.4z M152.2,21.1 c-0.1,0.1-2.4-0.3-7.5-0.3c-5,0-13.6-2.4-17.2-3.5c-3.6-1.1,10,3.9,16.5,4.1C150.5,21.6,152.3,21,152.2,21.1z' },
			{ d: 'M269.6,18c-0.1-0.1-4.6,0.3-7.2,0c-7.3-0.7-17-3.2-16.6-2.9c0.4,0.3,13.7,3.1,17,3.3 C267.7,18.8,269.7,18,269.6,18z' },
			{ d: 'M227.4,9.8c-0.2-0.1-4.5-1-9.5-1.2c-5-0.2-12.7,0.6-12.3,0.5c0.3-0.1,5.9-1.8,13.3-1.2 S227.6,9.9,227.4,9.8z' },
			{ d: 'M204.5,13.4c-0.1-0.1,2-1,3.2-1.1c1.2-0.1,2,0,2,0.3c0,0.3-0.1,0.5-1.6,0.4 C206.4,12.9,204.6,13.5,204.5,13.4z' },
			{ d: 'M201,10.6c0-0.1-4.4,1.2-6.3,2.2c-1.9,0.9-6.2,3.1-6.1,3.1c0.1,0.1,4.2-1.6,6.3-2.6 S201,10.7,201,10.6z' },
			{ d: 'M154.5,26.7c-0.1-0.1-4.6,0.3-7.2,0c-7.3-0.7-17-3.2-16.6-2.9c0.4,0.3,13.7,3.1,17,3.3 C152.6,27.5,154.6,26.8,154.5,26.7z' },
			{ d: 'M41.9,19.3c0,0,1.2-0.3,2.9-0.1c1.7,0.2,5.8,0.9,8.2,0.7c4.2-0.4,7.4-2.7,7-2.6 c-0.4,0-4.3,2.2-8.6,1.9c-1.8-0.1-5.1-0.5-6.7-0.4S41.9,19.3,41.9,19.3z' },
			{ d: 'M75.5,12.6c0.2,0.1,2-0.8,4.3-1.1c2.3-0.2,2.1-0.3,2.1-0.5c0-0.1-1.8-0.4-3.4,0 C76.9,11.5,75.3,12.5,75.5,12.6z' },
			{ d: 'M15.6,13.2c0-0.1,4.3,0,6.7,0.5c2.4,0.5,5,1.9,5,2c0,0.1-2.7-0.8-5.1-1.4 C19.9,13.7,15.7,13.3,15.6,13.2z' },
		],
	},
	'arrow': {
		viewBox: '0 0 700 10',
		paths: [
			{ d: 'M350,10L340,0h20L350,10z' },
		],
	},
	'split': {
		viewBox: '0 0 1000 20',
		paths: [
			{ d: 'M0,0v3c0,0,393.8,0,483.4,0c9.2,0,16.6,7.4,16.6,16.6c0-9.1,7.4-16.6,16.6-16.6C606.2,3,1000,3,1000,3V0H0z' },
		],
	},
	'book': {
		viewBox: '0 0 1000 100',
		paths: [
			{ d: 'M194,99c186.7,0.7,305-78.3,306-97.2c1,18.9,119.3,97.9,306,97.2c114.3-0.3,194,0.3,194,0.3s0-91.7,0-100c0,0,0,0,0-0 L0,0v99.3C0,99.3,79.7,98.7,194,99z' },
		],
	},
};



export interface OverlayAttributes {
	// Normal state
	bgOverlayType?: string;
	bgOverlayColor?: string;
	bgOverlayImage?: { url?: string };
	bgOverlayOpacity?: number;
	bgOverlayGradientColor?: string;
	bgOverlayGradientLocation?: number;
	bgOverlayGradientSecondColor?: string;
	bgOverlayGradientSecondLocation?: number;
	bgOverlayGradientType?: string;
	bgOverlayGradientAngle?: number;
	bgOverlayGradientPosition?: string;
	bgOverlayImagePosition?: string;
	bgOverlayImageSize?: string;
	bgOverlayImageRepeat?: string;
	bgOverlayImageAttachment?: string;
	bgOverlayCssFilters?: {
		blur?: number;
		brightness?: number;
		contrast?: number;
		saturation?: number;
		hue?: number;
	};
	bgOverlayBlendMode?: string;
	// Hover state
	bgOverlayTypeHover?: string;
	bgOverlayColorHover?: string;
	bgOverlayImageHover?: { url?: string };
	bgOverlayOpacityHover?: number;
	bgOverlayGradientColorHover?: string;
	bgOverlayGradientLocationHover?: number;
	bgOverlayGradientSecondColorHover?: string;
	bgOverlayGradientSecondLocationHover?: number;
	bgOverlayGradientTypeHover?: string;
	bgOverlayGradientAngleHover?: number;
	bgOverlayGradientPositionHover?: string;
	bgOverlayImagePositionHover?: string;
	bgOverlayImageSizeHover?: string;
	bgOverlayImageRepeatHover?: string;
	bgOverlayImageAttachmentHover?: string;
	bgOverlayCssFiltersHover?: {
		blur?: number;
		brightness?: number;
		contrast?: number;
		saturation?: number;
		hue?: number;
	};
	bgOverlayBlendModeHover?: string;
	// Transition duration
	bgOverlayTransitionDuration?: number;
	[key: string]: any;
}

export interface VideoAttributes {
	backgroundType?: string;
	bgVideoLink?: string;
	bgVideoStartTime?: number;
	bgVideoEndTime?: number;
	bgVideoPlayOnce?: boolean;
	bgVideoPlayOnMobile?: boolean;
	bgVideoPrivacyMode?: boolean;
	bgVideoFallback?: { url?: string };
	[key: string]: any;
}

export interface SlideshowAttributes {
	backgroundType?: string;
	bgSlideshowGallery?: Array<{ id?: number; url?: string; alt?: string }>;
	bgSlideshowInfiniteLoop?: boolean;
	bgSlideshowDuration?: number;
	bgSlideshowTransition?: string;
	bgSlideshowTransitionDuration?: number;
	bgSlideshowKenBurns?: boolean;
	bgSlideshowKenBurnsDirection?: string;
	[key: string]: any;
}

export interface ShapeDividerAttributes {
	shapeDividerTop?: {
		type?: string;
		color?: string;
		width?: number;
		height?: number;
		flip?: boolean;
		invert?: boolean;
		aboveContent?: boolean;
	};
	shapeDividerBottom?: {
		type?: string;
		color?: string;
		width?: number;
		height?: number;
		flip?: boolean;
		invert?: boolean;
		aboveContent?: boolean;
	};
	[key: string]: any;
}

/**
 * Drag props interface for slideshow drag/swipe functionality
 */
export interface SlideshowDragProps {
	onMouseDown?: (e: React.MouseEvent) => void;
	onMouseMove?: (e: React.MouseEvent) => void;
	onMouseUp?: (e: React.MouseEvent) => void;
	onMouseLeave?: (e: React.MouseEvent) => void;
	onTouchStart?: (e: React.TouchEvent) => void;
	onTouchMove?: (e: React.TouchEvent) => void;
	onTouchEnd?: (e: React.TouchEvent) => void;
	style?: CSSProperties;
}

/**
 * Generate overlay styles based on attributes
 * @param attributes - Overlay attributes including normal state and transition settings
 */
export function generateOverlayStyles(attributes: OverlayAttributes): CSSProperties {
	// Get transition duration for hover effects (default 0.3s)
	const transitionDuration = attributes.bgOverlayTransitionDuration ?? 0.3;

	const styles: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		pointerEvents: 'none',
		zIndex: 0,
		// Add transition for smooth hover effects
		transition: `background-color ${transitionDuration}s, background-image ${transitionDuration}s, opacity ${transitionDuration}s, filter ${transitionDuration}s`,
	};

	const overlayType = attributes.bgOverlayType || 'classic';
	const opacity = attributes.bgOverlayOpacity ?? 1;

	if (overlayType === 'classic') {
		// Classic: color and/or image
		if (attributes.bgOverlayColor) {
			styles.backgroundColor = attributes.bgOverlayColor;
		}
		if (attributes.bgOverlayImage?.url) {
			styles.backgroundImage = `url(${attributes.bgOverlayImage.url})`;
			if (attributes.bgOverlayImagePosition) {
				styles.backgroundPosition = attributes.bgOverlayImagePosition;
			}
			if (attributes.bgOverlayImageSize) {
				styles.backgroundSize = attributes.bgOverlayImageSize;
			}
			if (attributes.bgOverlayImageRepeat) {
				styles.backgroundRepeat = attributes.bgOverlayImageRepeat;
			}
			if (attributes.bgOverlayImageAttachment) {
				styles.backgroundAttachment = attributes.bgOverlayImageAttachment;
			}
		}
	} else if (overlayType === 'gradient') {
		// Gradient overlay
		const color1 = attributes.bgOverlayGradientColor || '#000000';
		const loc1 = attributes.bgOverlayGradientLocation ?? 0;
		const color2 = attributes.bgOverlayGradientSecondColor || '#ffffff';
		const loc2 = attributes.bgOverlayGradientSecondLocation ?? 100;

		if (attributes.bgOverlayGradientType === 'radial') {
			const position = attributes.bgOverlayGradientPosition || 'center center';
			styles.backgroundImage = `radial-gradient(at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`;
		} else {
			const angle = attributes.bgOverlayGradientAngle ?? 180;
			styles.backgroundImage = `linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`;
		}
	}

	// Apply opacity
	if (opacity !== 1) {
		styles.opacity = opacity;
	}

	// Apply CSS filters
	if (attributes.bgOverlayCssFilters) {
		const filters = attributes.bgOverlayCssFilters;
		const filterParts: string[] = [];

		if (filters.blur && filters.blur > 0) {
			filterParts.push(`blur(${filters.blur}px)`);
		}
		if (filters.brightness !== undefined && filters.brightness !== 100) {
			filterParts.push(`brightness(${filters.brightness}%)`);
		}
		if (filters.contrast !== undefined && filters.contrast !== 100) {
			filterParts.push(`contrast(${filters.contrast}%)`);
		}
		if (filters.saturation !== undefined && filters.saturation !== 100) {
			filterParts.push(`saturate(${filters.saturation}%)`);
		}
		if (filters.hue !== undefined && filters.hue !== 0) {
			filterParts.push(`hue-rotate(${filters.hue}deg)`);
		}

		if (filterParts.length > 0) {
			styles.filter = filterParts.join(' ');
		}
	}

	// Apply blend mode
	if (attributes.bgOverlayBlendMode) {
		styles.mixBlendMode = attributes.bgOverlayBlendMode as CSSProperties['mixBlendMode'];
	}

	return styles;
}

/**
 * Check if overlay should be rendered (has any overlay settings - normal OR hover)
 * We render the overlay if either normal OR hover settings exist, because:
 * - If only hover settings exist, we still need the overlay element for :hover CSS to apply
 */
export function shouldRenderOverlay(attributes: OverlayAttributes): boolean {
	// Check normal state settings
	const hasNormalSettings = !!(
		attributes.bgOverlayColor ||
		attributes.bgOverlayImage?.url ||
		attributes.bgOverlayGradientColor ||
		attributes.bgOverlayGradientSecondColor
	);

	// Check hover state settings
	const hasHoverSettings = !!(
		attributes.bgOverlayColorHover ||
		attributes.bgOverlayImageHover?.url ||
		attributes.bgOverlayGradientColorHover ||
		attributes.bgOverlayGradientSecondColorHover ||
		attributes.bgOverlayOpacityHover !== undefined
	);

	return hasNormalSettings || hasHoverSettings;
}

/**
 * Check if overlay has hover settings
 */
export function hasOverlayHoverSettings(attributes: OverlayAttributes): boolean {
	return !!(
		attributes.bgOverlayColorHover ||
		attributes.bgOverlayImageHover?.url ||
		attributes.bgOverlayGradientColorHover ||
		attributes.bgOverlayGradientSecondColorHover ||
		attributes.bgOverlayOpacityHover !== undefined
	);
}

/**
 * Generate overlay hover CSS for :hover pseudo-selector
 * Returns CSS string to be rendered in a <style> tag
 */
export function generateOverlayHoverCSS(
	attributes: OverlayAttributes,
	selector: string
): string {
	if (!hasOverlayHoverSettings(attributes)) {
		return '';
	}

	const cssRules: string[] = [];
	const overlayTypeHover = attributes.bgOverlayTypeHover || attributes.bgOverlayType || 'classic';

	// Build hover styles
	if (overlayTypeHover === 'classic') {
		// Classic: color and/or image
		if (attributes.bgOverlayColorHover) {
			cssRules.push(`background-color: ${attributes.bgOverlayColorHover}`);
		}
		if (attributes.bgOverlayImageHover?.url) {
			cssRules.push(`background-image: url(${attributes.bgOverlayImageHover.url})`);
			if (attributes.bgOverlayImagePositionHover) {
				cssRules.push(`background-position: ${attributes.bgOverlayImagePositionHover}`);
			}
			if (attributes.bgOverlayImageSizeHover) {
				cssRules.push(`background-size: ${attributes.bgOverlayImageSizeHover}`);
			}
			if (attributes.bgOverlayImageRepeatHover) {
				cssRules.push(`background-repeat: ${attributes.bgOverlayImageRepeatHover}`);
			}
			if (attributes.bgOverlayImageAttachmentHover) {
				cssRules.push(`background-attachment: ${attributes.bgOverlayImageAttachmentHover}`);
			}
		}
	} else if (overlayTypeHover === 'gradient') {
		// Gradient overlay
		const color1 = attributes.bgOverlayGradientColorHover || attributes.bgOverlayGradientColor || '#000000';
		const loc1 = attributes.bgOverlayGradientLocationHover ?? attributes.bgOverlayGradientLocation ?? 0;
		const color2 = attributes.bgOverlayGradientSecondColorHover || attributes.bgOverlayGradientSecondColor || '#ffffff';
		const loc2 = attributes.bgOverlayGradientSecondLocationHover ?? attributes.bgOverlayGradientSecondLocation ?? 100;
		const gradientType = attributes.bgOverlayGradientTypeHover || attributes.bgOverlayGradientType || 'linear';

		if (gradientType === 'radial') {
			const position = attributes.bgOverlayGradientPositionHover || attributes.bgOverlayGradientPosition || 'center center';
			cssRules.push(`background-image: radial-gradient(at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`);
		} else {
			const angle = attributes.bgOverlayGradientAngleHover ?? attributes.bgOverlayGradientAngle ?? 180;
			cssRules.push(`background-image: linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`);
		}
	}

	// Apply hover opacity
	if (attributes.bgOverlayOpacityHover !== undefined) {
		cssRules.push(`opacity: ${attributes.bgOverlayOpacityHover}`);
	}

	// Apply hover CSS filters
	if (attributes.bgOverlayCssFiltersHover) {
		const filters = attributes.bgOverlayCssFiltersHover;
		const filterParts: string[] = [];

		if (filters.blur && filters.blur > 0) {
			filterParts.push(`blur(${filters.blur}px)`);
		}
		if (filters.brightness !== undefined && filters.brightness !== 100) {
			filterParts.push(`brightness(${filters.brightness}%)`);
		}
		if (filters.contrast !== undefined && filters.contrast !== 100) {
			filterParts.push(`contrast(${filters.contrast}%)`);
		}
		if (filters.saturation !== undefined && filters.saturation !== 100) {
			filterParts.push(`saturate(${filters.saturation}%)`);
		}
		if (filters.hue !== undefined && filters.hue !== 0) {
			filterParts.push(`hue-rotate(${filters.hue}deg)`);
		}

		if (filterParts.length > 0) {
			cssRules.push(`filter: ${filterParts.join(' ')}`);
		}
	}

	// Blend mode hover
	if (attributes.bgOverlayBlendModeHover) {
		cssRules.push(`mix-blend-mode: ${attributes.bgOverlayBlendModeHover}`);
	}

	if (cssRules.length === 0) {
		return '';
	}

	// Generate CSS with hover selector on parent container
	return `${selector}:hover .voxel-fse-background-overlay { ${cssRules.join('; ')}; }`;
}

/**
 * Render background overlay element
 */
export function renderOverlay(attributes: OverlayAttributes): ReactNode {
	if (!shouldRenderOverlay(attributes)) {
		return null;
	}

	const styles = generateOverlayStyles(attributes);

	return (
		<div
			className="voxel-fse-background-overlay"
			style={styles}
			aria-hidden="true"
		/>
	);
}

/**
 * Parse video URL to get embed information
 */
function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'hosted'; id?: string; embedUrl?: string } | null {
	if (!url) return null;

	// YouTube
	const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
	if (youtubeMatch) {
		return {
			type: 'youtube',
			id: youtubeMatch[1],
			embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
		};
	}

	// Vimeo
	const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
	if (vimeoMatch) {
		return {
			type: 'vimeo',
			id: vimeoMatch[1],
			embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
		};
	}

	// Self-hosted (direct video URL)
	if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
		return {
			type: 'hosted',
			embedUrl: url,
		};
	}

	return null;
}

/**
 * Check if video background should be rendered
 */
export function shouldRenderVideo(attributes: VideoAttributes): boolean {
	return attributes.backgroundType === 'video' && !!attributes.bgVideoLink;
}

/**
 * Render video background element
 */
export function renderVideoBackground(attributes: VideoAttributes): ReactNode {
	if (!shouldRenderVideo(attributes)) {
		return null;
	}

	const videoInfo = parseVideoUrl(attributes.bgVideoLink || '');
	if (!videoInfo) return null;

	const containerStyles: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		zIndex: 0,
		pointerEvents: 'none',
	};

	const mediaStyles: CSSProperties = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		minWidth: '100%',
		minHeight: '100%',
		width: 'auto',
		height: 'auto',
		transform: 'translate(-50%, -50%)',
		objectFit: 'cover',
	};

	if (videoInfo.type === 'hosted') {
		return (
			<div className="voxel-fse-video-background" style={containerStyles} aria-hidden="true">
				<video
					src={videoInfo.embedUrl}
					autoPlay
					muted
					loop={!attributes.bgVideoPlayOnce}
					playsInline
					style={mediaStyles}
				/>
				{attributes.bgVideoFallback?.url && (
					<img
						src={attributes.bgVideoFallback.url}
						alt=""
						className="voxel-fse-video-fallback"
						style={{ ...mediaStyles, display: 'none' }}
					/>
				)}
			</div>
		);
	}

	// YouTube/Vimeo iframe
	const iframeParams = new URLSearchParams({
		autoplay: '1',
		mute: '1',
		loop: attributes.bgVideoPlayOnce ? '0' : '1',
		controls: '0',
		showinfo: '0',
		rel: '0',
		modestbranding: '1',
	});

	if (videoInfo.type === 'youtube') {
		if (attributes.bgVideoStartTime) {
			iframeParams.set('start', String(attributes.bgVideoStartTime));
		}
		if (attributes.bgVideoEndTime) {
			iframeParams.set('end', String(attributes.bgVideoEndTime));
		}
		if (!attributes.bgVideoPlayOnce && videoInfo.id) {
			iframeParams.set('playlist', videoInfo.id);
		}
		if (attributes.bgVideoPrivacyMode) {
			videoInfo.embedUrl = videoInfo.embedUrl?.replace('youtube.com', 'youtube-nocookie.com');
		}
	}

	return (
		<div className="voxel-fse-video-background" style={containerStyles} aria-hidden="true">
			<iframe
				src={`${videoInfo.embedUrl}?${iframeParams.toString()}`}
				style={{
					...mediaStyles,
					border: 'none',
					width: '200%',
					height: '200%',
				}}
				allow="autoplay; fullscreen"
				title="Background video"
			/>
			{attributes.bgVideoFallback?.url && (
				<img
					src={attributes.bgVideoFallback.url}
					alt=""
					className="voxel-fse-video-fallback"
					style={{ ...mediaStyles, display: 'none' }}
				/>
			)}
		</div>
	);
}

/**
 * Check if slideshow background should be rendered
 */
export function shouldRenderSlideshow(attributes: SlideshowAttributes): boolean {
	return (
		attributes.backgroundType === 'slideshow' &&
		Array.isArray(attributes.bgSlideshowGallery) &&
		attributes.bgSlideshowGallery.length > 0
	);
}

/**
 * Render slideshow background element (static for save, animated for edit)
 *
 * @param attributes - Block attributes containing slideshow configuration
 * @param isEditor - Whether we're in the editor (vs save/frontend)
 * @param currentSlideIndex - Optional current slide index for editor animation (0-based)
 * @param dragProps - Optional drag event handlers for editor drag/swipe navigation
 */
export function renderSlideshowBackground(
	attributes: SlideshowAttributes,
	isEditor: boolean = false,
	currentSlideIndex?: number,
	dragProps?: SlideshowDragProps
): ReactNode {
	if (!shouldRenderSlideshow(attributes)) {
		return null;
	}

	const gallery = attributes.bgSlideshowGallery || [];
	const duration = attributes.bgSlideshowDuration ?? 5000;
	const transition = attributes.bgSlideshowTransition || 'fade';
	const transitionDuration = attributes.bgSlideshowTransitionDuration ?? 500;
	const kenBurns = attributes.bgSlideshowKenBurns ?? false;

	// Use provided currentSlideIndex for editor, otherwise default to 0
	const activeIndex = isEditor && currentSlideIndex !== undefined ? currentSlideIndex : 0;

	const containerStyles: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		zIndex: 0,
	};

	const slideStyles: CSSProperties = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
	};

	// For save/frontend: render data attributes for JS to handle animation
	// For editor: use currentSlideIndex prop for animation
	// Merge container styles with drag props styles (cursor)
	const mergedContainerStyles = dragProps?.style
		? { ...containerStyles, ...dragProps.style }
		: containerStyles;

	// Extract event handlers from dragProps (if provided)
	const {
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onMouseLeave,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
	} = dragProps || {};

	return (
		<div
			className="voxel-fse-slideshow-background"
			style={mergedContainerStyles}
			aria-hidden="true"
			data-duration={duration}
			data-transition={transition}
			data-transition-duration={transitionDuration}
			data-ken-burns={kenBurns}
			data-infinite={attributes.bgSlideshowInfiniteLoop ?? true}
			onMouseDown={onMouseDown}
			onMouseMove={onMouseMove}
			onMouseUp={onMouseUp}
			onMouseLeave={onMouseLeave}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
		>
			{gallery.map((image, index) => {
				const isActive = index === activeIndex;

				// Calculate slide transition styles based on transition type
				let slideTransform = '';
				if (!isActive && transition !== 'fade') {
					// Position inactive slides based on transition direction
					if (transition === 'slide_left') {
						slideTransform = 'translateX(100%)';
					} else if (transition === 'slide_right') {
						slideTransform = 'translateX(-100%)';
					} else if (transition === 'slide_up') {
						slideTransform = 'translateY(100%)';
					} else if (transition === 'slide_down') {
						slideTransform = 'translateY(-100%)';
					}
				}

				return (
					<div
						key={image.id || index}
						className={`voxel-fse-slideshow-slide ${isActive ? 'active' : ''}`}
						style={{
							...slideStyles,
							backgroundImage: `url(${image.url})`,
							opacity: isActive ? 1 : 0,
							transform: slideTransform || undefined,
							transition: `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`,
						}}
						data-index={index}
					/>
				);
			})}
		</div>
	);
}

/**
 * Check if shape dividers should be rendered
 */
export function shouldRenderShapeDivider(attributes: ShapeDividerAttributes, position: 'top' | 'bottom'): boolean {
	const divider = position === 'top' ? attributes.shapeDividerTop : attributes.shapeDividerBottom;
	return !!(divider?.type && divider.type !== 'none');
}

/**
 * Render shape divider element
 */
export function renderShapeDivider(
	attributes: ShapeDividerAttributes,
	position: 'top' | 'bottom'
): ReactNode {
	const divider = position === 'top' ? attributes.shapeDividerTop : attributes.shapeDividerBottom;

	if (!divider?.type || divider.type === 'none') {
		return null;
	}

	// Get shape data with correct viewBox and paths
	const shapeData = SHAPE_DATA[divider.type] || SHAPE_DATA['tilt'];
	const color = divider.color || '#ffffff';
	const width = divider.width ?? 100;
	const height = divider.height ?? 100;
	const flip = divider.flip ?? false;
	const invert = divider.invert ?? false;
	const aboveContent = divider.aboveContent ?? false;

	const containerStyles: CSSProperties = {
		position: 'absolute',
		left: 0,
		width: `${width}%`,
		height: `${height}px`,
		overflow: 'hidden',
		lineHeight: 0,
		zIndex: aboveContent ? 2 : 0,
		...(position === 'top' ? { top: 0 } : { bottom: 0 }),
		...(width > 100 ? { left: `${(100 - width) / 2}%` } : {}),
	};

	const svgStyles: CSSProperties = {
		width: '100%',
		height: '100%',
		display: 'block',
		...(flip ? { transform: 'scaleX(-1)' } : {}),
		...(invert && position === 'top' ? { transform: flip ? 'scaleX(-1) scaleY(-1)' : 'scaleY(-1)' } : {}),
		...(position === 'bottom' && !invert ? { transform: flip ? 'scaleX(-1) scaleY(-1)' : 'scaleY(-1)' } : {}),
	};

	return (
		<div
			className={`voxel-fse-shape-divider voxel-fse-shape-divider-${position}`}
			style={containerStyles}
			aria-hidden="true"
		>
			<svg
				viewBox={shapeData.viewBox}
				preserveAspectRatio="none"
				style={svgStyles}
			>
				{shapeData.paths.map((pathData, index) => (
					<path
						key={index}
						d={pathData.d}
						fill={color}
						opacity={pathData.opacity}
					/>
				))}
			</svg>
		</div>
	);
}

/**
 * Render all background elements (overlay, video, slideshow, shape dividers)
 * Elements are rendered directly without wrapper divs to preserve absolute positioning.
 *
 * @param attributes - Block attributes
 * @param isEditor - Whether we're in the editor
 * @param currentSlideIndex - Optional current slide index for editor slideshow animation
 * @param slideshowDragProps - Optional drag event handlers for editor slideshow drag/swipe
 * @param containerSelector - Optional CSS selector for the container (used for hover CSS generation)
 */
export function renderBackgroundElements(
	attributes: OverlayAttributes & VideoAttributes & SlideshowAttributes & ShapeDividerAttributes,
	isEditor: boolean = false,
	currentSlideIndex?: number,
	slideshowDragProps?: SlideshowDragProps,
	containerSelector?: string
): ReactNode {
	const elements: ReactNode[] = [];

	// Video background (lowest layer)
	const videoElement = shouldRenderVideo(attributes) ? renderVideoBackground(attributes) : null;
	if (videoElement) {
		elements.push(
			<React.Fragment key="video">{videoElement}</React.Fragment>
		);
	}

	// Slideshow background (lowest layer, alternative to video)
	const slideshowElement = shouldRenderSlideshow(attributes)
		? renderSlideshowBackground(attributes, isEditor, currentSlideIndex, slideshowDragProps)
		: null;
	if (slideshowElement) {
		elements.push(
			<React.Fragment key="slideshow">{slideshowElement}</React.Fragment>
		);
	}

	// Background overlay (above video/slideshow)
	const overlayElement = shouldRenderOverlay(attributes) ? renderOverlay(attributes) : null;
	if (overlayElement) {
		elements.push(
			<React.Fragment key="overlay">{overlayElement}</React.Fragment>
		);
	}

	// Generate hover CSS for overlay if container selector provided and has hover settings
	if (containerSelector && shouldRenderOverlay(attributes) && hasOverlayHoverSettings(attributes)) {
		const hoverCSS = generateOverlayHoverCSS(attributes, containerSelector);
		if (hoverCSS) {
			elements.push(
				<style key="overlay-hover-css" dangerouslySetInnerHTML={{ __html: hoverCSS }} />
			);
		}
	}

	// Shape dividers
	const topShapeElement = shouldRenderShapeDivider(attributes, 'top') ? renderShapeDivider(attributes, 'top') : null;
	if (topShapeElement) {
		elements.push(
			<React.Fragment key="shape-top">{topShapeElement}</React.Fragment>
		);
	}

	const bottomShapeElement = shouldRenderShapeDivider(attributes, 'bottom') ? renderShapeDivider(attributes, 'bottom') : null;
	if (bottomShapeElement) {
		elements.push(
			<React.Fragment key="shape-bottom">{bottomShapeElement}</React.Fragment>
		);
	}

	if (elements.length === 0) {
		return null;
	}

	return <>{elements}</>;
}
