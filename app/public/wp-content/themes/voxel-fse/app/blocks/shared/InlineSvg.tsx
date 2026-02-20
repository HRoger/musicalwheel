/**
 * Inline SVG component — fetches SVG from URL and renders inline.
 *
 * Voxel renders SVG icons inline (not via <img>) so CSS like
 * `.ts-comp-icon > svg { fill: var(--ts-icon-color); }` works.
 *
 * Uses a ref-based approach to inject the raw SVG element as a direct
 * child, avoiding wrapper elements that would break Voxel's `> svg`
 * CSS child selectors.
 *
 * Also strips hardcoded `fill` attributes from the SVG root element
 * so CSS variables can control the color.
 *
 * @package VoxelFSE
 */

import { useRef, useEffect } from 'react';

/** SVG content cache — shared across all InlineSvg instances. */
const svgCache = new Map<string, string>();

/** In-flight fetch promises to deduplicate concurrent requests. */
const fetchPromises = new Map<string, Promise<string>>();

function fetchSvg(url: string): Promise<string> {
	if (svgCache.has(url)) {
		return Promise.resolve(svgCache.get(url)!);
	}

	if (fetchPromises.has(url)) {
		return fetchPromises.get(url)!;
	}

	const promise = fetch(url)
		.then((res) => res.text())
		.then((text) => {
			fetchPromises.delete(url);
			if (!text.includes('<svg')) return '';

			// Add aria-hidden if not present
			if (!text.includes('aria-hidden')) {
				text = text.replace('<svg', '<svg aria-hidden="true"');
			}

			// Strip hardcoded fill from the root <svg> element so CSS
			// variables (--ts-icon-color) can control the color.
			// Only remove fill from the opening <svg> tag, not from
			// child elements like <path> that may need specific fills.
			text = text.replace(/<svg([^>]*)\sfill="[^"]*"/, '<svg$1');

			svgCache.set(url, text);
			return text;
		})
		.catch(() => {
			fetchPromises.delete(url);
			return '';
		});

	fetchPromises.set(url, promise);
	return promise;
}

interface InlineSvgProps {
	url: string;
	className?: string;
}

/**
 * Renders an SVG from a URL as an inline element.
 *
 * Uses a <span> wrapper with innerHTML to inject the SVG.
 * The wrapper is styled to be invisible (display:contents) so it
 * doesn't affect Voxel's `> svg` CSS child selectors.
 *
 * IMPORTANT: Does NOT use replaceChild to swap out React-managed nodes.
 * That approach causes "removeChild" errors when React tries to
 * reconcile the DOM after the node was replaced externally.
 */
export function InlineSvg({ url, className }: InlineSvgProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		let cancelled = false;

		fetchSvg(url).then((svgText) => {
			if (cancelled || !ref.current || !svgText) return;

			// Parse the SVG text into a DOM element
			const temp = document.createElement('div');
			temp.innerHTML = svgText;
			const svgEl = temp.querySelector('svg');
			if (!svgEl) return;

			// Add className if provided
			if (className) {
				svgEl.classList.add(...className.split(' '));
			}

			// Inject SVG inside the wrapper (React still owns the wrapper)
			ref.current.innerHTML = '';
			ref.current.appendChild(svgEl);
		});

		return () => {
			cancelled = true;
			// Clean up injected SVG on unmount/URL change
			if (ref.current) {
				ref.current.innerHTML = '';
			}
		};
	}, [url, className]);

	// Wrapper uses display:contents so it's invisible to CSS selectors
	// like `.ts-item-icon > svg` — the SVG appears as a direct child
	return <span ref={ref} aria-hidden="true" style={{ display: 'contents' }} />;
}

export default InlineSvg;
