/**
 * Nested Accordion Block - Save Component
 *
 * Outputs static HTML that will be hydrated on the frontend.
 * Uses native <details>/<summary> for no-JS fallback.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { NestedAccordionAttributes, NestedAccordionVxConfig } from './types';
import { generateContentTabResponsiveCSS, generateStyleTabResponsiveCSS } from './styles';

interface SaveProps {
	attributes: NestedAccordionAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockId = (attributes as any).blockId || 'nested-accordion';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'vxfse-nested-accordion',
	});

	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		// Note: style will be merged with styleVars below
	});

	// Build vxconfig for frontend hydration
	const vxconfig: NestedAccordionVxConfig = {
		items: attributes.items.map((item) => ({
			id: item.id,
			title: item.title,
			cssId: item.cssId,
			loop: item.loop,
			visibility: item.visibility,
		})),
		interactions: {
			defaultState: attributes.defaultState,
			maxItemsExpanded: attributes.maxItemsExpanded,
			animationDuration:
				attributes.animationDuration.size *
				(attributes.animationDuration.unit === 'ms' ? 1 : 1000),
		},
		icons: {
			expand: attributes.expandIcon,
			collapse: attributes.collapseIcon,
			position: attributes.iconPosition.desktop || 'end',
		},
		titleTag: attributes.titleTag,
		faqSchema: attributes.faqSchema,
	};

	// Build inline styles for CSS variables
	const styleVars: Record<string, string> = {};

	// Spacing (these are flat numbers, not ResponsiveValue)
	if (attributes.itemSpacing) {
		styleVars['--n-accordion-item-title-space-between'] = `${attributes.itemSpacing}px`;
	}
	if (attributes.contentDistance) {
		styleVars['--n-accordion-item-title-distance-from-content'] = `${attributes.contentDistance}px`;
	}

	// Padding
	if (attributes.accordionPadding.desktop) {
		const p = attributes.accordionPadding.desktop;
		styleVars['--n-accordion-padding'] = `${p.top || '10px'} ${p.right || '10px'} ${p.bottom || '10px'} ${p.left || '10px'}`;
	}

	// Border radius
	if (attributes.accordionBorderRadius.desktop) {
		const br = attributes.accordionBorderRadius.desktop;
		styleVars['--n-accordion-border-radius'] = `${br.top || '0px'} ${br.right || '0px'} ${br.bottom || '0px'} ${br.left || '0px'}`;
	}

	// Colors
	if (attributes.titleNormalColor) {
		styleVars['--n-accordion-title-normal-color'] = attributes.titleNormalColor;
	}
	if (attributes.titleHoverColor) {
		styleVars['--n-accordion-title-hover-color'] = attributes.titleHoverColor;
	}
	if (attributes.titleActiveColor) {
		styleVars['--n-accordion-title-active-color'] = attributes.titleActiveColor;
	}

	// Icon (these are flat numbers, not ResponsiveValue)
	if (attributes.iconSize) {
		styleVars['--n-accordion-icon-size'] = `${attributes.iconSize}px`;
	}
	if (attributes.iconSpacing) {
		styleVars['--n-accordion-icon-gap'] = `0 ${attributes.iconSpacing}px`;
	}
	if (attributes.iconNormalColor) {
		styleVars['--n-accordion-icon-normal-color'] = attributes.iconNormalColor;
	}
	if (attributes.iconHoverColor) {
		styleVars['--n-accordion-icon-hover-color'] = attributes.iconHoverColor;
	}
	if (attributes.iconActiveColor) {
		styleVars['--n-accordion-icon-active-color'] = attributes.iconActiveColor;
	}

	// Icon position
	if (attributes.iconPosition.desktop === 'start') {
		styleVars['--n-accordion-title-icon-order'] = '-1';
	}

	// Item position
	const positionMap: Record<string, string> = {
		start: 'initial',
		center: 'center',
		end: 'flex-end',
		stretch: 'space-between',
	};
	const pos = attributes.itemPosition.desktop || 'start';
	styleVars['--n-accordion-title-justify-content'] = positionMap[pos];
	if (pos === 'stretch') {
		styleVars['--n-accordion-title-flex-grow'] = '1';
	}

	// Background colors
	if (attributes.accordionNormalBg) {
		styleVars['--n-accordion-bg-normal'] = attributes.accordionNormalBg;
	}

	// Content styles
	if (attributes.contentBg) {
		styleVars['--n-accordion-content-bg'] = attributes.contentBg;
	}

	const TitleTag = attributes.titleTag as keyof JSX.IntrinsicElements;
	const hasIcons = attributes.expandIcon?.value || attributes.collapseIcon?.value;

	// Merge advancedProps.styles with component styleVars
	const mergedStyles = {
		...styleVars,
		...(advancedProps.styles || {}),
	};

	// Generate responsive CSS for Content tab and Style tab controls
	const contentResponsiveCSS = generateContentTabResponsiveCSS(attributes, blockId);
	const styleResponsiveCSS = generateStyleTabResponsiveCSS(attributes, blockId);

	// Combine AdvancedTab/VoxelTab CSS with Content tab CSS and Style tab CSS
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, contentResponsiveCSS, styleResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	return (
		<div
			{...blockProps}
			data-vxconfig={JSON.stringify(vxconfig)}
			data-block-id={(attributes as any).blockId}
			style={mergedStyles as React.CSSProperties}
			// Headless-ready: Visibility rules configuration
			data-visibility-behavior={(attributes as any).visibilityBehavior || undefined}
			data-visibility-rules={(attributes as any).visibilityRules?.length
				? JSON.stringify((attributes as any).visibilityRules)
				: undefined}
			// Headless-ready: Loop element configuration
			data-loop-source={(attributes as any).loopSource || undefined}
			data-loop-limit={(attributes as any).loopLimit || undefined}
			data-loop-offset={(attributes as any).loopOffset || undefined}
			{...advancedProps.customAttrs}
		>
			{/* Responsive CSS from AdvancedTab + VoxelTab + Content Tab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
			<div
				className="e-n-accordion"
				aria-label="Accordion. Open links with Enter or Space, close with Escape, and navigate with Arrow Keys"
			>
				{attributes.items.map((item, index) => {
					const isDefaultOpen = attributes.defaultState === 'expanded' && index === 0;
					const itemId = item.cssId || `e-n-accordion-item-${(attributes as any).blockId}-${index}`;

					return (
						<details
							key={item.id}
							id={itemId}
							className="e-n-accordion-item"
							{...(isDefaultOpen ? { open: true } : {})}
						>
							<summary
								className="e-n-accordion-item-title"
								role="button"
								data-accordion-index={index + 1}
								tabIndex={index === 0 ? 0 : -1}
								aria-expanded={isDefaultOpen ? 'true' : 'false'}
								aria-controls={itemId}
							>
								<span className="e-n-accordion-item-title-header">
									<TitleTag className="e-n-accordion-item-title-text">
										{item.title}
									</TitleTag>
								</span>
								{hasIcons && (
									<span className="e-n-accordion-item-title-icon">
										<span className="e-opened">
											<i
												className={attributes.collapseIcon?.value || 'fas fa-minus'}
												aria-hidden="true"
											></i>
										</span>
										<span className="e-closed">
											<i
												className={attributes.expandIcon?.value || 'fas fa-plus'}
												aria-hidden="true"
											></i>
										</span>
									</span>
								)}
							</summary>

							{/* Content container - InnerBlocks would render here in full implementation */}
							<div className="e-n-accordion-item-content e-con" role="region" aria-labelledby={itemId}>
								{/* Content will be rendered via PHP or InnerBlocks */}
							</div>
						</details>
					);
				})}
			</div>

			{/* FAQ Schema JSON-LD - output via PHP render callback */}
		</div>
	);
}
