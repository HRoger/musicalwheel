/**
 * Nested Accordion Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Matches Elementor's nested-accordion widget Content tab.
 *
 * Controls based on Elementor images:
 * - Layout accordion: Items repeater, Item Position, Icon section, Title HTML Tag, FAQ Schema
 * - Interactions accordion: Default State, Max Items Expanded, Animation Duration
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, ToggleControl, RangeControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	ChooseControl,
	IconPickerControl,
	SectionHeading,
	UnitDropdownButton,
	ResponsiveDropdownButton,
} from '@shared/controls';
import type { UnitType } from '@shared/controls/UnitDropdownButton';
import type { NestedAccordionAttributes } from '../types';

interface ContentTabProps {
	attributes: NestedAccordionAttributes;
	setAttributes: (attrs: Partial<NestedAccordionAttributes>) => void;
	itemsRepeater: JSX.Element;
}

export function ContentTab({
	attributes,
	setAttributes,
	itemsRepeater,
}: ContentTabProps) {
	// Handle animation duration unit change with value conversion
	const handleAnimationUnitChange = (newUnit: 'ms' | 's') => {
		const currentUnit = attributes.animationDuration.unit;
		const currentSize = attributes.animationDuration.size;

		// Convert value when switching units
		let newSize = currentSize;
		if (currentUnit === 'ms' && newUnit === 's') {
			// ms to s: divide by 1000
			newSize = currentSize / 1000;
		} else if (currentUnit === 's' && newUnit === 'ms') {
			// s to ms: multiply by 1000
			newSize = currentSize * 1000;
		}

		setAttributes({
			animationDuration: {
				size: newSize,
				unit: newUnit,
			},
		});
	};

	// Get animation range based on unit
	const getAnimationRange = () => {
		if (attributes.animationDuration.unit === 's') {
			return { min: 0, max: 10, step: 0.1 };
		}
		return { min: 0, max: 10000, step: 50 };
	};

	const animationRange = getAnimationRange();

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="layout"
		>
			{/* ===== LAYOUT ACCORDION ===== */}
			<AccordionPanel id="layout" title={__('Layout', 'voxel-fse')}>
				{/* Items Repeater - Passed from edit.tsx */}
				{itemsRepeater}

				{/* Item Position */}
				<ChooseControl
					label={__('Item Position', 'voxel-fse')}
					value={attributes.itemPosition.desktop || 'start'}
					onChange={(value) =>
						setAttributes({
							itemPosition: { ...attributes.itemPosition, desktop: value },
						})
					}
					controls={<ResponsiveDropdownButton />}
					options={[
						{
							value: 'start',
							label: __('Start', 'voxel-fse'),
							icon: 'eicon-align-start-h',
						},
						{
							value: 'center',
							label: __('Center', 'voxel-fse'),
							icon: 'eicon-h-align-center',
						},
						{
							value: 'end',
							label: __('End', 'voxel-fse'),
							icon: 'eicon-align-end-h',
						},
						{
							value: 'stretch',
							label: __('Stretch', 'voxel-fse'),
							icon: 'eicon-h-align-stretch',
						},
					]}
				/>

				{/* Icon Section */}
				<SectionHeading label={__('Icon', 'voxel-fse')} />

				{/* Icon Position */}
				<ChooseControl
					label={__('Position', 'voxel-fse')}
					value={attributes.iconPosition.desktop || 'end'}
					onChange={(value) =>
						setAttributes({
							iconPosition: { ...attributes.iconPosition, desktop: value },
						})
					}
					controls={<ResponsiveDropdownButton />}
					options={[
						{
							value: 'start',
							label: __('Start', 'voxel-fse'),
							icon: 'eicon-h-align-left',
						},
						{
							value: 'end',
							label: __('End', 'voxel-fse'),
							icon: 'eicon-h-align-right',
						},
					]}
				/>

				{/* Expand Icon - showSelectedIcon=true to display default las la-plus icon */}
				<IconPickerControl
					label={__('Expand', 'voxel-fse')}
					value={attributes.expandIcon}
					onChange={(value) => setAttributes({ expandIcon: value })}
					showSelectedIcon={true}
				/>

				{/* Collapse Icon - Only shown when Expand icon is selected */}
				{/* showSelectedIcon=true to display default las la-minus icon */}
				{attributes.expandIcon?.value && (
					<IconPickerControl
						label={__('Collapse', 'voxel-fse')}
						value={attributes.collapseIcon}
						onChange={(value) => setAttributes({ collapseIcon: value })}
						showSelectedIcon={true}
					/>
				)}

				{/* Title HTML Tag */}
				<SelectControl
					label={__('Title HTML Tag', 'voxel-fse')}
					value={attributes.titleTag}
					onChange={(value) =>
						setAttributes({ titleTag: value as typeof attributes.titleTag })
					}
					options={[
						{ value: 'h1', label: 'H1' },
						{ value: 'h2', label: 'H2' },
						{ value: 'h3', label: 'H3' },
						{ value: 'h4', label: 'H4' },
						{ value: 'h5', label: 'H5' },
						{ value: 'h6', label: 'H6' },
						{ value: 'div', label: 'div' },
						{ value: 'span', label: 'span' },
						{ value: 'p', label: 'p' },
					]}
					__nextHasNoMarginBottom
				/>

				{/* FAQ Schema */}
				<ToggleControl
					label={__('FAQ Schema', 'voxel-fse')}
					checked={attributes.faqSchema}
					onChange={(value) => setAttributes({ faqSchema: value })}
					__nextHasNoMarginBottom
				/>
			</AccordionPanel>

			{/* ===== INTERACTIONS ACCORDION ===== */}
			<AccordionPanel id="interactions" title={__('Interactions', 'voxel-fse')}>
				{/* Default State */}
				<SelectControl
					label={__('Default State', 'voxel-fse')}
					value={attributes.defaultState}
					onChange={(value) =>
						setAttributes({
							defaultState: value as typeof attributes.defaultState,
						})
					}
					options={[
						{ value: 'expanded', label: __('First expanded', 'voxel-fse') },
						{ value: 'all_collapsed', label: __('All collapsed', 'voxel-fse') },
					]}
					__nextHasNoMarginBottom
				/>

				{/* Max Items Expanded */}
				<SelectControl
					label={__('Max Items Expanded', 'voxel-fse')}
					value={attributes.maxItemsExpanded}
					onChange={(value) =>
						setAttributes({
							maxItemsExpanded: value as typeof attributes.maxItemsExpanded,
						})
					}
					options={[
						{ value: 'one', label: __('One', 'voxel-fse') },
						{ value: 'multiple', label: __('Multiple', 'voxel-fse') },
					]}
					__nextHasNoMarginBottom
				/>

				{/* Animation Duration - Custom slider with unit dropdown */}
				<div className="elementor-control" style={{ marginBottom: '16px' }}>
					<div
						className="elementor-control-content"
						style={{
							marginBottom: '8px',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<span
							className="elementor-control-title"
							style={{
								fontSize: '13px',
								fontWeight: 500,
								color: 'rgb(30, 30, 30)',
								margin: 0,
							}}
						>
							{__('Animation Duration', 'voxel-fse')}
						</span>
						<UnitDropdownButton
							currentUnit={attributes.animationDuration.unit as UnitType}
							onUnitChange={(unit) => handleAnimationUnitChange(unit as 'ms' | 's')}
							availableUnits={['ms', 's'] as UnitType[]}
						/>
					</div>
					<RangeControl
						value={attributes.animationDuration.size}
						onChange={(value) =>
							setAttributes({
								animationDuration: {
									...attributes.animationDuration,
									size: value ?? 0,
								},
							})
						}
						min={animationRange.min}
						max={animationRange.max}
						step={animationRange.step}
						withInputField={true}
						__nextHasNoMarginBottom
					/>
				</div>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
