/**
 * Nested Tabs Block - Save Component
 *
 * Outputs static HTML that will be hydrated on the frontend.
 * Matches Elementor's nested-tabs HTML structure 1:1.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateNestedTabsResponsiveCSS } from './styles';

// Access InnerBlocks from WordPress global - ESM imports don't work with externalized modules
const InnerBlocks = (window as any).wp?.blockEditor?.InnerBlocks;
import type { NestedTabsAttributes, NestedTabsVxConfig } from './types';

interface SaveProps {
	attributes: NestedTabsAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockId = (attributes as any).blockId || 'nested-tabs';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
		blockId,
		baseClass: 'vxfse-nested-tabs',
	});

	// Generate responsive CSS from Style tab controls
	const nestedTabsResponsiveCSS = generateNestedTabsResponsiveCSS(attributes, blockId);

	// Combine AdvancedTab responsive CSS with block-specific CSS
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, nestedTabsResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = (useBlockProps as any).save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		// Note: style will be merged with styleVars below
	});

	// Build vxconfig for frontend hydration
	const vxconfig: NestedTabsVxConfig = {
		tabs: attributes.tabs.map((tab) => ({
			id: tab.id,
			title: tab.title,
			cssId: tab.cssId,
			icon: tab.icon,
			iconActive: tab.iconActive,
		})),
		layout: {
			direction: attributes.tabsDirection.desktop || 'block-start',
			justifyHorizontal: attributes.tabsJustifyHorizontal.desktop || 'start',
			justifyVertical: attributes.tabsJustifyVertical.desktop || 'start',
			titleAlignment: attributes.titleAlignment.desktop || 'center',
			horizontalScroll: attributes.horizontalScroll.desktop || 'disable',
			breakpoint: attributes.breakpointSelector,
		},
		icons: {
			position: attributes.iconPosition.desktop || 'inline-start',
		},
		animations: {
			transitionDuration: attributes.tabsTransitionDuration.desktop?.size || 0.3,
			hoverAnimation: attributes.tabsHoverAnimation || '',
		},
	};

	// Get widget number for IDs
	const widgetNumber = (attributes as any).blockId.substring(0, 3);

	// Build inline styles for CSS variables
	const styleVars: Record<string, string> = {};

	// Direction styling
	const directionStyles: Record<string, string> = {
		'block-start': '--n-tabs-direction: column; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
		'block-end': '--n-tabs-direction: column-reverse; --n-tabs-heading-direction: row; --n-tabs-heading-width: initial;',
		'inline-start': '--n-tabs-direction: row; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
		'inline-end': '--n-tabs-direction: row-reverse; --n-tabs-heading-direction: column; --n-tabs-heading-width: 240px;',
	};
	const dir = attributes.tabsDirection.desktop || 'block-start';
	if (directionStyles[dir]) {
		directionStyles[dir].split(';').forEach((style) => {
			const [key, value] = style.split(':').map((s) => s.trim());
			if (key && value) {
				styleVars[key] = value;
			}
		});
	}

	// Check if layout is vertical
	const isVerticalLayout = ['inline-start', 'inline-end'].includes(dir);

	// Width for vertical layout
	if (isVerticalLayout && attributes.tabsWidth.desktop?.size) {
		const w = attributes.tabsWidth.desktop;
		styleVars['--n-tabs-heading-width'] = `${w.size}${w.unit}`;
	}

	// Justify horizontal
	const justifyHMap: Record<string, string> = {
		start: 'flex-start',
		center: 'center',
		end: 'flex-end',
		stretch: 'initial',
	};
	const justifyH = attributes.tabsJustifyHorizontal.desktop || 'start';
	styleVars['--n-tabs-heading-justify-content'] = justifyHMap[justifyH] || 'flex-start';
	if (justifyH === 'stretch') {
		styleVars['--n-tabs-title-flex-grow'] = '1';
		styleVars['--n-tabs-title-width'] = '100%';
	}

	// Title alignment
	const alignMap: Record<string, string> = {
		start: 'flex-start',
		center: 'center',
		end: 'flex-end',
	};
	const titleAlign = attributes.titleAlignment.desktop || 'center';
	styleVars['--n-tabs-title-justify-content'] = alignMap[titleAlign] || 'center';

	// Gap
	if (attributes.tabsGap.desktop) {
		styleVars['--n-tabs-title-gap'] = attributes.tabsGap.desktop;
	}

	// Content distance
	if (attributes.tabsContentDistance.desktop) {
		styleVars['--n-tabs-gap'] = attributes.tabsContentDistance.desktop;
	}

	// Padding
	if (attributes.tabsPadding.desktop) {
		const p = attributes.tabsPadding.desktop;
		styleVars['--n-tabs-title-padding-top'] = p.top || '15px';
		styleVars['--n-tabs-title-padding-right'] = p.right || '20px';
		styleVars['--n-tabs-title-padding-bottom'] = p.bottom || '15px';
		styleVars['--n-tabs-title-padding-left'] = p.left || '20px';
	}

	// Border radius
	if (attributes.tabsBorderRadius.desktop) {
		const br = attributes.tabsBorderRadius.desktop;
		styleVars['--n-tabs-title-border-radius'] = `${br.top || '0'} ${br.right || '0'} ${br.bottom || '0'} ${br.left || '0'}`;
	}

	// Background colors
	if (attributes.tabsNormalBg) {
		styleVars['--n-tabs-title-background-color'] = attributes.tabsNormalBg;
	}
	if (attributes.tabsHoverBg) {
		styleVars['--n-tabs-title-background-color-hover'] = attributes.tabsHoverBg;
	}
	if (attributes.tabsActiveBg) {
		styleVars['--n-tabs-title-background-color-active'] = attributes.tabsActiveBg;
	}

	// Title colors
	if (attributes.titleNormalColor) {
		styleVars['--n-tabs-title-color'] = attributes.titleNormalColor;
	}
	if (attributes.titleHoverColor) {
		styleVars['--n-tabs-title-color-hover'] = attributes.titleHoverColor;
	}
	if (attributes.titleActiveColor) {
		styleVars['--n-tabs-title-color-active'] = attributes.titleActiveColor;
	}

	// Icon
	if (attributes.iconSize.desktop) {
		styleVars['--n-tabs-icon-size'] = attributes.iconSize.desktop;
	}
	if (attributes.iconSpacing.desktop) {
		styleVars['--n-tabs-icon-gap'] = attributes.iconSpacing.desktop;
	}
	if (attributes.iconNormalColor) {
		styleVars['--n-tabs-icon-color'] = attributes.iconNormalColor;
	}
	if (attributes.iconHoverColor) {
		styleVars['--n-tabs-icon-color-hover'] = attributes.iconHoverColor;
	}
	if (attributes.iconActiveColor) {
		styleVars['--n-tabs-icon-color-active'] = attributes.iconActiveColor;
	}

	// Icon position styling
	const iconPosStyles: Record<string, string> = {
		'block-start': '--n-tabs-title-direction: column; --n-tabs-icon-order: initial;',
		'block-end': '--n-tabs-title-direction: column; --n-tabs-icon-order: 1;',
		'inline-start': '--n-tabs-title-direction: row; --n-tabs-icon-order: initial;',
		'inline-end': '--n-tabs-title-direction: row; --n-tabs-icon-order: 1;',
	};
	const iconPos = attributes.iconPosition.desktop || 'inline-start';
	if (iconPosStyles[iconPos]) {
		iconPosStyles[iconPos].split(';').forEach((style) => {
			const [key, value] = style.split(':').map((s) => s.trim());
			if (key && value) {
				styleVars[key] = value;
			}
		});
	}

	// Transition
	if (attributes.tabsTransitionDuration.desktop?.size) {
		styleVars['--n-tabs-title-transition'] = `${attributes.tabsTransitionDuration.desktop.size}s`;
	}

	// Content styles
	if (attributes.contentBg) {
		styleVars['--n-tabs-content-background-color'] = attributes.contentBg;
	}
	if (attributes.contentBorderRadius.desktop) {
		const cbr = attributes.contentBorderRadius.desktop;
		styleVars['--n-tabs-content-border-radius'] = `${cbr.top || '0'} ${cbr.right || '0'} ${cbr.bottom || '0'} ${cbr.left || '0'}`;
	}
	if (attributes.contentPadding.desktop) {
		const cp = attributes.contentPadding.desktop;
		styleVars['--n-tabs-content-padding'] = `${cp.top || '0'} ${cp.right || '0'} ${cp.bottom || '0'} ${cp.left || '0'}`;
	}

	// Horizontal scroll
	if (attributes.horizontalScroll.desktop === 'enable') {
		styleVars['--n-tabs-heading-wrap'] = 'nowrap';
		styleVars['--n-tabs-heading-overflow-x'] = 'scroll';
		styleVars['--n-tabs-title-white-space'] = 'nowrap';
	}

	// Breakpoint class
	const breakpointClass = `e-n-tabs-${attributes.breakpointSelector}`;

	// Merge advancedProps.styles with component styleVars
	const mergedStyles = {
		...styleVars,
		...(advancedProps.styles || {}),
	};

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
			{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
			<div
				className={`e-n-tabs ${breakpointClass}`}
				data-widget-number={widgetNumber}
				aria-label="Tabs. Open items with Enter or Space, close with Escape and navigate using the Arrow keys."
			>
				{/* Tab Headers */}
				<div className="e-n-tabs-heading" role="tablist">
					{attributes.tabs.map((tab, index) => {
						const isFirst = index === 0;
						const tabCount = index + 1;
						const tabTitleId = `e-n-tab-title-${widgetNumber}${tabCount}`;
						const tabId = tab.cssId || tabTitleId;
						const containerId = `e-n-tab-content-${widgetNumber}${tabCount}`;

						return (
							<button
								key={tab.id}
								id={tabId}
								data-tab-title-id={tabTitleId}
								className={`e-n-tab-title${isFirst ? ' e-active' : ''}${attributes.tabsHoverAnimation ? ` elementor-animation-${attributes.tabsHoverAnimation}` : ''}`}
								data-tab-index={tabCount}
								role="tab"
								aria-selected={isFirst ? 'true' : 'false'}
								tabIndex={isFirst ? 0 : -1}
								aria-controls={containerId}
								style={{ '--n-tabs-title-order': tabCount } as React.CSSProperties}
							>
								{/* Tab Icon */}
								{tab.icon?.value && (
									<span className="e-n-tab-icon">
										<i className={tab.icon.value} aria-hidden="true"></i>
										{tab.iconActive?.value && (
											<i className={tab.iconActive.value} aria-hidden="true"></i>
										)}
									</span>
								)}

								{/* Tab Title */}
								<span className="e-n-tab-title-text">
									{tab.title}
								</span>
							</button>
						);
					})}
				</div>

				{/* Tab Content - InnerBlocks content renders here */}
				<div className="e-n-tabs-content">
					<InnerBlocks.Content />
				</div>
			</div>
		</div>
	);
}
