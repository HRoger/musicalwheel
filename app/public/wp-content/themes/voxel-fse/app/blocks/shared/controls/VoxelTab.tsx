/**
 * Reusable Voxel Tab Component
 *
 * Standard inspector tab for all Voxel-FSE blocks, providing Voxel-specific features.
 * Similar pattern to AdvancedTab but with Voxel-specific controls.
 *
 * Includes two main sections (all optionally hideable):
 * 1. Widget options - Sticky position controls (matches widget-controller.php)
 * 2. Visibility - Element visibility rules (matches visibility-controller.php)
 * 3. Loop element - Loop configuration (matches loop-controller.php)
 *
 * @package VoxelFSE
 *
 * @usage
 * // In edit.tsx:
 * import { VoxelTab } from '@shared/controls';
 *
 * <InspectorControls group="voxel">
 *   <VoxelTab
 *     attributes={attributes}
 *     setAttributes={setAttributes}
 *   />
 * </InspectorControls>
 *
 * // In block.json, spread voxelTabAttributes:
 * import { voxelTabAttributes } from '@shared/controls';
 */

// Register shared editor filters for sticky position support on wrapper elements
// This is idempotent and will only register once, even if imported multiple times
import '../filters/editorWrapperFilters';

import { ToggleControl, SelectControl, Button, TextControl, RangeControl } from '@wordpress/components';
import { AccordionPanelGroup, AccordionPanel } from './AccordionPanelGroup';
import { useState } from 'react';
import { __ } from '@wordpress/i18n';
import ResponsiveRangeControl from './ResponsiveRangeControl';
import ResponsiveTextControl from './ResponsiveTextControl';
import ResponsiveToggle from './ResponsiveToggle';
import SectionHeading from './SectionHeading';
import ElementVisibilityModal, { type VisibilityRule, getVisibilityRuleLabel } from './ElementVisibilityModal';
import LoopElementModal, { type LoopConfig } from './LoopElementModal';
import ColorPickerControl from './ColorPickerControl';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VoxelTabAttributes {
	// Widget options - Sticky
	stickyEnabled?: boolean;
	stickyDesktop?: 'sticky' | 'initial';
	stickyTablet?: 'sticky' | 'initial';
	stickyMobile?: 'sticky' | 'initial';
	stickyTop?: number;
	stickyTop_tablet?: number;
	stickyTop_mobile?: number;
	stickyTopUnit?: string;
	stickyLeft?: number;
	stickyLeft_tablet?: number;
	stickyLeft_mobile?: number;
	stickyLeftUnit?: string;
	stickyRight?: number;
	stickyRight_tablet?: number;
	stickyRight_mobile?: number;
	stickyRightUnit?: string;
	stickyBottom?: number;
	stickyBottom_tablet?: number;
	stickyBottom_mobile?: number;
	stickyBottomUnit?: string;

	// Visibility
	visibilityBehavior?: 'show' | 'hide';
	visibilityRules?: VisibilityRule[];

	// Loop element
	loopEnabled?: boolean;
	loopSource?: string;
	loopProperty?: string; // e.g., 'role' for @author(role)
	loopLimit?: number | string;
	loopOffset?: number | string;

	// Container Options (flex-container specific)
	enableInlineFlex?: boolean;
	enableInlineFlex_tablet?: boolean;
	enableInlineFlex_mobile?: boolean;
	enableCalcMinHeight?: boolean;
	calcMinHeight?: string;
	calcMinHeight_tablet?: string;
	calcMinHeight_mobile?: string;
	enableCalcMaxHeight?: boolean;
	calcMaxHeight?: string;
	calcMaxHeight_tablet?: string;
	calcMaxHeight_mobile?: string;
	scrollbarColor?: string;
	enableBackdropBlur?: boolean;
	backdropBlurStrength?: number;
	backdropBlurStrength_tablet?: number;
	backdropBlurStrength_mobile?: number;

	// Allow extension with block-specific attributes
	[key: string]: unknown;
}

export interface VoxelTabProps {
	attributes: VoxelTabAttributes;
	setAttributes: (attrs: Partial<VoxelTabAttributes>) => void;
	/** Show Widget options accordion (default: true) */
	showWidgetOptions?: boolean;
	/** Show Container Options accordion (default: false, only for flex-container) */
	showContainerOptions?: boolean;
	/** Show Visibility accordion (default: true) */
	showVisibility?: boolean;
	/** Show Loop element accordion (default: true) */
	showLoopElement?: boolean;
}

// ============================================================================
// VOXEL TAB COMPONENT
// ============================================================================

/**
 * Normalize visibility rules to ensure they're always an array
 * WordPress sometimes serializes empty arrays as objects or undefined
 */
function normalizeVisibilityRules(rules: any): VisibilityRule[] {
	// Handle undefined, null, or non-array values
	if (!rules) return [];
	if (!Array.isArray(rules)) {
		// If it's an object, try to convert it to an array
		if (typeof rules === 'object') {
			return Object.values(rules).filter(
				(rule): rule is VisibilityRule =>
					rule != null && typeof rule === 'object' && typeof (rule as any).id === 'string'
			);
		}
		return [];
	}
	return rules;
}

export default function VoxelTab({
	attributes,
	setAttributes,
	showWidgetOptions = true,
	showContainerOptions = false,
	showVisibility = true,
	showLoopElement = true,
}: VoxelTabProps) {
	const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
	const [isLoopModalOpen, setIsLoopModalOpen] = useState(false);

	// Normalize visibility rules to handle edge cases
	const normalizedRules = normalizeVisibilityRules(attributes.visibilityRules);
	const hasVisibilityRules = normalizedRules.length > 0;

	// Get display label for loop source in @source(role) format - always includes (role)
	const getLoopSourceLabel = (source: string | undefined, property?: string): string => {
		if (!source) return __('No loop', 'voxel-fse');
		// Always show (role) format as Voxel does - default to 'role' if no property
		const displayProperty = property || 'role';
		return `@${source}(${displayProperty})`;
	};

	return (
		<>
			<AccordionPanelGroup
				defaultPanel={showContainerOptions ? 'voxel-container-options' : 'voxel-widget-options'}
			>
				{/* Widget options - Sticky position */}
				{showWidgetOptions && (
					<AccordionPanel
						id={showContainerOptions ? 'voxel-container-options' : 'voxel-widget-options'}
						title={
							showContainerOptions
								? __('Container options', 'voxel-fse')
								: __('Widget options', 'voxel-fse')
						}
					>
						{/* Sticky position heading */}
						<SectionHeading label={__('Sticky position', 'voxel-fse')} />

						<ToggleControl
							label={__('Enable?', 'voxel-fse')}
							checked={attributes.stickyEnabled ?? false}
							onChange={(value) => setAttributes({ stickyEnabled: value })}
						/>

						{attributes.stickyEnabled && (
							<>
								<SelectControl
									label={__('Enable on desktop', 'voxel-fse')}
									value={attributes.stickyDesktop ?? 'sticky'}
									options={[
										{ label: __('Enable', 'voxel-fse'), value: 'sticky' },
										{ label: __('Disable', 'voxel-fse'), value: 'initial' },
									]}
									onChange={(value) =>
										setAttributes({ stickyDesktop: value as 'sticky' | 'initial' })
									}
								/>

								<SelectControl
									label={__('Enable on tablet', 'voxel-fse')}
									value={attributes.stickyTablet ?? 'sticky'}
									options={[
										{ label: __('Enable', 'voxel-fse'), value: 'sticky' },
										{ label: __('Disable', 'voxel-fse'), value: 'initial' },
									]}
									onChange={(value) =>
										setAttributes({ stickyTablet: value as 'sticky' | 'initial' })
									}
								/>

								<SelectControl
									label={__('Enable on mobile', 'voxel-fse')}
									value={attributes.stickyMobile ?? 'sticky'}
									options={[
										{ label: __('Enable', 'voxel-fse'), value: 'sticky' },
										{ label: __('Disable', 'voxel-fse'), value: 'initial' },
									]}
									onChange={(value) =>
										setAttributes({ stickyMobile: value as 'sticky' | 'initial' })
									}
								/>

								<ResponsiveRangeControl
									label={__('Top', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stickyTop"
									min={0}
									max={500}
									step={1}
									availableUnits={['px', '%', 'vh']}
									unitAttributeName="stickyTopUnit"
								/>

								<ResponsiveRangeControl
									label={__('Left', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stickyLeft"
									min={0}
									max={500}
									step={1}
									availableUnits={['px', '%', 'vh']}
									unitAttributeName="stickyLeftUnit"
								/>

								<ResponsiveRangeControl
									label={__('Right', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stickyRight"
									min={0}
									max={500}
									step={1}
									availableUnits={['px', '%', 'vh']}
									unitAttributeName="stickyRightUnit"
								/>

								<ResponsiveRangeControl
									label={__('Bottom', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="stickyBottom"
									min={0}
									max={500}
									step={1}
									availableUnits={['px', '%', 'vh']}
									unitAttributeName="stickyBottomUnit"
								/>
							</>
						)}

						{/* Container Options - only shown for flex-container */}
						{showContainerOptions && (
							<>
								{/* Inline Flex Section */}
								<SectionHeading label={__('Inline Flex', 'voxel-fse')} />

								<ResponsiveToggle
									label={__('Enable?', 'voxel-fse')}
									help={__(
										'Changes container display to inline flex and applies auto width',
										'voxel-fse'
									)}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="enableInlineFlex"
								/>

								{/* Other Section */}
								<SectionHeading label={__('Other', 'voxel-fse')} />

								{/* Calculate min height */}
								<ResponsiveToggle
									label={__('Calculate min height?', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="enableCalcMinHeight"
									showResponsiveButton={false}
								/>

								{attributes.enableCalcMinHeight && (
									<div style={{ marginBottom: '16px' }}>
										<ResponsiveTextControl
											label={__('Calculation', 'voxel-fse')}
											help={__(
												'Use CSS calc() to calculate min-height e.g. calc(100vh - 215px).',
												'voxel-fse'
											)}
											placeholder="calc()"
											attributes={attributes}
											setAttributes={setAttributes}
											attributeBaseName="calcMinHeight"
											enableDynamicTags={true}
										/>
									</div>
								)}

								{/* Calculate max height */}
								<ResponsiveToggle
									label={__('Calculate max height?', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="enableCalcMaxHeight"
									showResponsiveButton={false}
								/>

								{attributes.enableCalcMaxHeight && (
									<>
										<div style={{ marginBottom: '16px' }}>
											<ResponsiveTextControl
												label={__('Calculation', 'voxel-fse')}
												help={__(
													'Use CSS calc() to calculate max-height e.g. calc(100vh - 215px).',
													'voxel-fse'
												)}
												placeholder="calc()"
												attributes={attributes}
												setAttributes={setAttributes}
												attributeBaseName="calcMaxHeight"
												enableDynamicTags={true}
											/>
										</div>

										{/* Scrollbar color */}
										<SectionHeading label={__('Scrollbar color', 'voxel-fse')} />
										<ColorPickerControl
											label={__('Color', 'voxel-fse')}
											value={attributes.scrollbarColor}
											onChange={(value) => setAttributes({ scrollbarColor: value })}
										/>
									</>
								)}

								{/* Backdrop blur */}
								<ResponsiveToggle
									label={__('Backdrop blur?', 'voxel-fse')}
									attributes={attributes}
									setAttributes={setAttributes}
									attributeBaseName="enableBackdropBlur"
									showResponsiveButton={false}
								/>

								{attributes.enableBackdropBlur && (
									<ResponsiveRangeControl
										label={__('Strength', 'voxel-fse')}
										attributes={attributes}
										setAttributes={setAttributes}
										attributeBaseName="backdropBlurStrength"
										min={0}
										max={100}
										step={1}
										showUnit={false}
									/>
								)}
							</>
						)}
					</AccordionPanel>
				)}

				{/* Visibility */}
				{showVisibility && (
					<AccordionPanel id="voxel-visibility" title={__('Visibility', 'voxel-fse')}>
						<SectionHeading label={__('Element visibility', 'voxel-fse')} />

						<SelectControl
							value={attributes.visibilityBehavior ?? 'show'}
							options={[
								{ label: __('Show this element if', 'voxel-fse'), value: 'show' },
								{ label: __('Hide this element if', 'voxel-fse'), value: 'hide' },
							]}
							onChange={(value) => setAttributes({ visibilityBehavior: value as 'show' | 'hide' })}
						/>

						<div className="voxel-fse-visibility-rules-list">
							{hasVisibilityRules ? (
								normalizedRules
									.filter(
										(rule): rule is VisibilityRule =>
											rule != null && typeof rule === 'object' && !!rule.id
									)
									.map((rule) => (
										<div key={rule.id} className="voxel-fse-visibility-rule-label">
											{getVisibilityRuleLabel(rule)}
										</div>
									))
							) : (
								<p className="voxel-fse-control-note" style={{ margin: 0 }}>
									{__('No visibility rules added.', 'voxel-fse')}
								</p>
							)}
						</div>

						<div className="voxel-fse-filter-actions-row">
							<Button variant="primary" onClick={() => setIsVisibilityModalOpen(true)}>
								{__('Edit rules', 'voxel-fse')}
							</Button>
							<Button variant="secondary" onClick={() => setAttributes({ visibilityRules: [] })}>
								{__('Remove', 'voxel-fse')}
							</Button>
						</div>

						{/* Visibility Rules Modal */}
						<ElementVisibilityModal
							isOpen={isVisibilityModalOpen}
							onClose={() => setIsVisibilityModalOpen(false)}
							rules={normalizedRules}
							onSave={(rules) => setAttributes({ visibilityRules: rules })}
						/>
					</AccordionPanel>
				)}

				{/* Loop element */}
				{showLoopElement && (
					<AccordionPanel id="voxel-loop-element" title={__('Loop element', 'voxel-fse')}>
						{/* Loop source info with light gray background */}
						<div className="voxel-fse-loop-info">
							{/* Description text - matches Voxel's gray italic style */}
							<p className="voxel-fse-loop-description">
								{__('Loop this element based on', 'voxel-fse')}
							</p>

							{/* Current status - @source(property) format like Voxel */}
							<p className="voxel-fse-loop-status">
								{getLoopSourceLabel(attributes.loopSource, attributes.loopProperty)}
							</p>
						</div>

						{/* Action buttons - same pattern as Visibility */}
						<div className="voxel-fse-filter-actions-row">
							<Button
								variant="primary"
								onClick={() => setIsLoopModalOpen(true)}
							>
								{__('Edit loop', 'voxel-fse')}
							</Button>
							<Button
								variant="secondary"
								onClick={() =>
									setAttributes({
										loopEnabled: false,
										loopSource: '',
										loopProperty: '',
										loopLimit: '',
										loopOffset: '',
									})
								}
							>
								{__('Remove', 'voxel-fse')}
							</Button>
						</div>

						{/* Loop limit and offset - always visible with gray background */}
						<div className="voxel-fse-loop-fields">
							<div className="voxel-fse-loop-field-inline">
								<label className="voxel-fse-loop-field-label">
									{__('Loop limit', 'voxel-fse')}
								</label>
								<input
									type="number"
									className="voxel-fse-loop-field-input"
									value={String(attributes.loopLimit ?? '')}
									onChange={(e) => setAttributes({ loopLimit: e.target.value })}
								/>
							</div>
							<p className="voxel-fse-loop-field-help">
								{__(
									'If a hard limit is set, the loop will stop there even if there are additional items left',
									'voxel-fse'
								)}
							</p>

							<div className="voxel-fse-loop-field-inline">
								<label className="voxel-fse-loop-field-label">
									{__('Loop offset', 'voxel-fse')}
								</label>
								<input
									type="number"
									className="voxel-fse-loop-field-input"
									value={String(attributes.loopOffset ?? '')}
									onChange={(e) => setAttributes({ loopOffset: e.target.value })}
								/>
							</div>
							<p className="voxel-fse-loop-field-help">
								{__('Skip a set amount of items from the start of the loop', 'voxel-fse')}
							</p>
						</div>

						{/* Loop Source Modal - uses shared LoopElementModal component */}
						<LoopElementModal
							isOpen={isLoopModalOpen}
							onClose={() => setIsLoopModalOpen(false)}
							config={{
								loopSource: attributes.loopSource ?? '',
								loopLimit: attributes.loopLimit ?? '',
								loopOffset: attributes.loopOffset ?? '',
								loopProperty: attributes.loopProperty,
							}}
							onSave={(loopConfig: LoopConfig) => {
								setAttributes({
									loopEnabled: true,
									loopSource: loopConfig.loopSource,
									loopProperty: loopConfig.loopProperty,
									loopLimit: loopConfig.loopLimit,
									loopOffset: loopConfig.loopOffset,
								});
							}}
						/>
					</AccordionPanel>
				)}
			</AccordionPanelGroup>

			{/* Inline styles for VoxelTab */}
			<style>{`
				/* Control Note - matches search-form editor.css */
				.voxel-fse-control-note {
					margin: 0 0 12px;
					font-size: 12px;
					color: #9ca3af;
					font-style: italic;
				}

				/* Visibility Rules List - matches Element Visibility panel styling */
				.voxel-fse-visibility-rules-list {
					display: flex;
					flex-direction: column;
					gap: 2px;
					margin-bottom: 12px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
				}

				.voxel-fse-visibility-rule-label {
					font-size: 12px;
					color: #515962;
					line-height: 1.5;
					display: block;
				}

				/* Filter Actions Row - matches search-form editor.css */
				.voxel-fse-filter-actions-row {
					display: flex;
					gap: 8px;
					margin-top: 20px;
					padding-top: 16px;
					border-top: 1px solid #e5e7eb;
				}

				.voxel-fse-filter-actions-row .components-button {
					flex: 1;
					justify-content: center;
				}

				/* Loop element - matches Voxel's original styling */
				.voxel-fse-loop-info {
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
					margin-bottom: 0;
				}

				.voxel-fse-loop-description {
					margin: 0 0 4px;
					font-size: 12px;
					color: #515962;
					font-style: italic;
				}

				.voxel-fse-loop-status {
					margin: 0;
					font-size: 12px;
					color: #515962;
					font-weight: 600;
				}

				/* Loop fields container - light gray background */
				.voxel-fse-loop-fields {
					margin-top: 16px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
				}

				/* Inline field row - label left, input right */
				.voxel-fse-loop-field-inline {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 4px;
				}

				.voxel-fse-loop-field-label {
					color: #1e1e1e;
					font-weight: 600;
					font-size: 13px;
					text-transform: none;
				}

				.voxel-fse-loop-field-input {
					width: 80px;
					padding: 6px 8px;
					border: 1px solid #8c8f94;
					border-radius: 4px;
					font-size: 13px;
				}

				.voxel-fse-loop-field-input:focus {
					border-color: var(--vxfse-accent-color, #3858e9);
					box-shadow: 0 0 0 1px var(--vxfse-accent-color, #3858e9);
					outline: none;
				}

				.voxel-fse-loop-field-help {
					margin: 0 0 16px;
					font-size: 12px;
					color: #757575;
					font-style: italic;
				}

				.voxel-fse-loop-field-help:last-child {
					margin-bottom: 0;
				}

				/* Loop Source Modal - uses Voxel's backend.css for styling */
				/* nvx-editor, nvx-topbar, ts-term-dropdown classes are styled by backend.css */

				/* Container Options - calc input group */
				.voxel-fse-calc-input-group {
					display: flex;
					flex-direction: column;
					gap: 12px;
					padding: 12px;
					background: #fbfafb;
					border-radius: 4px;
					margin-bottom: 16px;
				}

				.voxel-fse-calc-input-group .components-base-control {
					margin-bottom: 0;
				}

				.voxel-fse-calc-input-group .components-base-control__help {
					color: #757575;
					font-size: 11px;
					font-style: italic;
					margin-top: 4px;
				}
			`}</style>
		</>
	);
}

// ============================================================================
// ATTRIBUTE DEFINITIONS
// ============================================================================

/**
 * Helper: Get default attributes for VoxelTab
 *
 * Use this in your block.json or block registration to define the full attribute schema.
 * Spread these attributes into your block's attributes:
 *
 * @example
 * // In block registration:
 * import { voxelTabAttributes } from '@shared/controls';
 *
 * registerBlockType('voxel-fse/my-block', {
 *   attributes: {
 *     ...voxelTabAttributes,
 *     // ...other block attributes
 *   },
 * });
 */
export const voxelTabAttributes = {
	// Widget options - Sticky position
	stickyEnabled: { type: 'boolean', default: false },
	stickyDesktop: { type: 'string', default: 'sticky' },
	stickyTablet: { type: 'string', default: 'sticky' },
	stickyMobile: { type: 'string', default: 'sticky' },
	stickyTop: { type: 'number' },
	stickyTop_tablet: { type: 'number' },
	stickyTop_mobile: { type: 'number' },
	stickyTopUnit: { type: 'string', default: 'px' },
	stickyLeft: { type: 'number' },
	stickyLeft_tablet: { type: 'number' },
	stickyLeft_mobile: { type: 'number' },
	stickyLeftUnit: { type: 'string', default: 'px' },
	stickyRight: { type: 'number' },
	stickyRight_tablet: { type: 'number' },
	stickyRight_mobile: { type: 'number' },
	stickyRightUnit: { type: 'string', default: 'px' },
	stickyBottom: { type: 'number' },
	stickyBottom_tablet: { type: 'number' },
	stickyBottom_mobile: { type: 'number' },
	stickyBottomUnit: { type: 'string', default: 'px' },

	// Visibility
	visibilityBehavior: { type: 'string', default: 'show' },
	visibilityRules: { type: 'array', default: [] },

	// Loop element
	loopEnabled: { type: 'boolean', default: false },
	loopSource: { type: 'string', default: '' },
	loopProperty: { type: 'string', default: '' },
	loopLimit: { type: 'string', default: '' },
	loopOffset: { type: 'string', default: '' },
};
