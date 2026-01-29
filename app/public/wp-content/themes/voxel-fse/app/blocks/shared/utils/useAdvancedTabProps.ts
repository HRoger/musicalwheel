/**
 * useAdvancedTabProps - Shared utility for AdvancedTab + VoxelTab wiring
 *
 * This utility reduces boilerplate when wiring AdvancedTab controls to block output.
 * It consolidates all the common patterns used across blocks.
 *
 * @package VoxelFSE
 */

import type { CSSProperties } from 'react';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	parseCustomAttributes,
	type AdvancedStyleAttributes,
} from './generateAdvancedStyles';
import {
	generateVoxelStyles,
	generateVoxelResponsiveCSS,
	type VoxelStyleAttributes,
} from './generateVoxelStyles';

/**
 * Combined attributes interface (AdvancedTab + VoxelTab)
 */
export type CombinedStyleAttributes = AdvancedStyleAttributes & VoxelStyleAttributes;

/**
 * Configuration options for useAdvancedTabProps
 */
export interface AdvancedTabPropsConfig {
	/** Block ID for unique selector generation */
	blockId: string;
	/** Base CSS class(es) for the block */
	baseClass: string;
	/** CSS selector prefix (default: block name extracted from baseClass) */
	selectorPrefix?: string;
	/** Include VoxelTab styles (sticky position) - default: true */
	includeVoxelTab?: boolean;
	/** Additional CSS classes to include */
	additionalClasses?: string[];
	/** Additional block-specific responsive CSS to merge */
	additionalResponsiveCSS?: string;
}

/**
 * Return type for useAdvancedTabProps
 */
export interface AdvancedTabPropsResult {
	/** Combined inline styles (AdvancedTab + VoxelTab) */
	styles: CSSProperties;
	/** Combined CSS class names */
	className: string;
	/** Combined responsive CSS string (for <style> tag) */
	responsiveCSS: string;
	/** Parsed custom attributes (for spread on element) */
	customAttrs: Record<string, string>;
	/** Element ID from AdvancedTab (for id prop) */
	elementId: string | undefined;
	/** Unique CSS selector for this block instance */
	uniqueSelector: string;
}

/**
 * Generate all AdvancedTab + VoxelTab props for a block
 *
 * This is a utility function (not a React hook) that can be used in both
 * edit.tsx and save.tsx to generate consistent props.
 *
 * @example
 * // In edit.tsx or save.tsx:
 * const advancedProps = getAdvancedVoxelTabProps(attributes, {
 *   blockId: attributes.blockId || 'my-block',
 *   baseClass: 'voxel-fse-my-block',
 * });
 *
 * const blockProps = useBlockProps.save({
 *   id: advancedProps.elementId,
 *   className: advancedProps.className,
 *   style: { ...advancedProps.styles, ...myBlockStyles },
 *   ...advancedProps.customAttrs,
 * });
 *
 * return (
 *   <div {...blockProps}>
 *     {advancedProps.responsiveCSS && (
 *       <style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
 *     )}
 *     ...
 *   </div>
 * );
 */
export function getAdvancedVoxelTabProps(
	attributes: CombinedStyleAttributes,
	config: AdvancedTabPropsConfig
): AdvancedTabPropsResult {
	const {
		blockId,
		baseClass,
		selectorPrefix,
		includeVoxelTab = true,
		additionalClasses = [],
		additionalResponsiveCSS = '',
	} = config;

	// Generate unique selector
	const prefix = selectorPrefix || baseClass.split(' ')[0];
	const uniqueSelector = `.${prefix}-${blockId}`;

	// Generate AdvancedTab styles
	const advancedStyles = generateAdvancedStyles(attributes);
	const advancedResponsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);

	// Generate VoxelTab styles (if enabled)
	let voxelStyles: CSSProperties = {};
	let voxelResponsiveCSS = '';
	if (includeVoxelTab) {
		voxelStyles = generateVoxelStyles(attributes);
		voxelResponsiveCSS = generateVoxelResponsiveCSS(attributes, uniqueSelector);
	}

	// Merge all styles
	const styles: CSSProperties = { ...advancedStyles, ...voxelStyles };

	// Combine all responsive CSS
	const responsiveCSS = [advancedResponsiveCSS, voxelResponsiveCSS, additionalResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	// Combine all classes
	const className = combineBlockClasses(
		`${baseClass} ${prefix}-${blockId}`,
		attributes,
		additionalClasses
	);

	// Parse custom attributes
	const customAttrs = parseCustomAttributes(attributes.customAttributes);

	// Get element ID
	const elementId = attributes.elementId || undefined;

	return {
		styles,
		className,
		responsiveCSS,
		customAttrs,
		elementId,
		uniqueSelector,
	};
}

/**
 * Helper to merge block-specific styles with AdvancedTab styles
 *
 * AdvancedTab styles should come first (base), block-specific styles override.
 */
export function mergeWithAdvancedStyles(
	advancedStyles: CSSProperties,
	blockStyles: CSSProperties
): CSSProperties {
	return { ...advancedStyles, ...blockStyles };
}

/**
 * Helper to merge block-specific responsive CSS with AdvancedTab CSS
 *
 * AdvancedTab CSS comes first, block-specific CSS comes after for proper cascade.
 */
export function mergeWithAdvancedResponsiveCSS(
	advancedCSS: string,
	blockCSS: string
): string {
	return [advancedCSS, blockCSS].filter(Boolean).join('\n');
}
