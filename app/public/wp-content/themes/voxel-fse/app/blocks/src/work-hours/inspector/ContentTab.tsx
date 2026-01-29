/**
 * Work Hours Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Follows the mandatory separate inspector folder pattern.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { SelectControl, TextControl } from '@wordpress/components';
import {
	AccordionPanelGroup,
	AccordionPanel,
	BorderGroupControl,
	ResponsiveRangeControl,
	BoxShadowPopup,
	ColorControl,
	ResponsiveDimensionsControl,
	TypographyControl,
	AdvancedIconControl,
	StateTabPanel,
} from '@shared/controls';
import type { WorkHoursAttributes } from '../types';
import { useState, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

// Declare window type for voxelPostTypes
declare global {
	interface Window {
		voxelPostTypes?: Array<{ label: string; value: string }>;
	}
}

interface ContentTabProps {
	attributes: WorkHoursAttributes;
	setAttributes: (attrs: Partial<WorkHoursAttributes>) => void;
}

/**
 * Extract post type from FSE template slug
 * Template slugs follow pattern: single-{post_type} or archive-{post_type}
 */
function extractPostTypeFromTemplateSlug(slug: string | null): string | null {
	if (!slug) return null;

	// Single post type templates: "single-places", "single-events", etc.
	const singleMatch = slug.match(/^single-([a-z0-9_-]+)$/);
	if (singleMatch) {
		return singleMatch[1];
	}

	// Archive templates: "archive-places", etc.
	const archiveMatch = slug.match(/^archive-([a-z0-9_-]+)$/);
	if (archiveMatch) {
		return archiveMatch[1];
	}

	return null;
}

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	// Get available work-hours fields
	const [workHoursFields, setWorkHoursFields] = useState<
		Array<{ label: string; value: string }>
	>([
		{ label: __('Choose field', 'voxel-fse'), value: '' },
	]);
	const [isLoadingFields, setIsLoadingFields] = useState(false);

	// Get the current template slug from FSE editor
	const templateSlug = useSelect((select) => {
		// Try Site Editor store first (FSE templates)
		const editSite = select('core/edit-site') as {
			getEditedPostId?: () => string;
		} | undefined;

		if (editSite?.getEditedPostId) {
			const templateId = editSite.getEditedPostId();
			// Template ID format is "theme-slug//template-slug"
			if (templateId && typeof templateId === 'string') {
				const parts = templateId.split('//');
				return parts.length > 1 ? parts[1] : templateId;
			}
		}

		return null;
	}, []);

	// Fetch work-hours fields when template changes
	useEffect(() => {
		const postType = extractPostTypeFromTemplateSlug(templateSlug);

		if (!postType) {
			// No specific post type detected - show only the default option
			setWorkHoursFields([
				{ label: __('Choose field', 'voxel-fse'), value: '' },
			]);
			return;
		}

		setIsLoadingFields(true);

		apiFetch<{ fields: Array<{ value: string; label: string }> }>({
			path: `/voxel-fse/v1/work-hours-fields/${postType}`,
		})
			.then((response) => {
				const options: Array<{ label: string; value: string }> = [
					{ label: __('Choose field', 'voxel-fse'), value: '' },
				];

				if (response.fields && Array.isArray(response.fields)) {
					response.fields.forEach((field) => {
						options.push({
							label: field.label,
							value: field.value,
						});
					});
				}

				setWorkHoursFields(options);
			})
			.catch((error) => {
				console.error('Failed to fetch work-hours fields:', error);
				// Reset to default on error
				setWorkHoursFields([
					{ label: __('Choose field', 'voxel-fse'), value: '' },
				]);
			})
			.finally(() => {
				setIsLoadingFields(false);
			});
	}, [templateSlug]);

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="general"
		>
			{/* General Accordion */}
			<AccordionPanel id="general" title={__('General', 'voxel-fse')}>
				<SelectControl
					label={__('Work hours field', 'voxel-fse')}
					value={attributes.sourceField || ''}
					options={workHoursFields}
					onChange={(value: string) => setAttributes({ sourceField: value })}
					disabled={isLoadingFields}
					help={
						isLoadingFields
							? __('Loading fields...', 'voxel-fse')
							: workHoursFields.length === 1
								? __('No work hours fields found for this post type', 'voxel-fse')
								: undefined
					}
				/>

				<SelectControl
					label={__('Collapse', 'voxel-fse')}
					value={attributes.collapse || 'wh-default'}
					options={[
						{ label: __('Yes', 'voxel-fse'), value: 'wh-default' },
						{ label: __('No', 'voxel-fse'), value: 'wh-expanded' },
					]}
					onChange={(value: string) => setAttributes({ collapse: value })}
				/>

				<BorderGroupControl
					label={__('Border Type', 'voxel-fse')}
					value={{
						borderType: attributes.borderType || '',
						borderWidth: attributes.borderWidth || {},
						borderColor: attributes.borderColor || '',
					}}
					onChange={(value) => {
						const updates: Partial<WorkHoursAttributes> = {};
						if (value.borderType !== undefined) {
							updates.borderType = value.borderType;
						}
						if (value.borderWidth !== undefined) {
							updates.borderWidth = value.borderWidth;
						}
						if (value.borderColor !== undefined) {
							updates.borderColor = value.borderColor;
						}
						setAttributes(updates);
					}}
					hideRadius={true}
				/>

				<ResponsiveRangeControl
					label={__('Border radius', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="borderRadius"
					min={0}
					max={100}
					units={['px']}
				/>

				<BoxShadowPopup
					label={__('Box Shadow', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					shadowAttributeName="boxShadow"
				/>
			</AccordionPanel>

			{/* Top area Accordion */}
			<AccordionPanel id="top-area" title={__('Top area', 'voxel-fse')}>
				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.topBg || ''}
					onChange={(value) => setAttributes({ topBg: value })}
				/>

				<ResponsiveRangeControl
					label={__('Icon size', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="topIconSize"
					min={0}
					max={40}
					units={['px']}
				/>

				<TypographyControl
					label={__('Label typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="labelTypography"
				/>

				<ColorControl
					label={__('Label color', 'voxel-fse')}
					value={attributes.labelColor || ''}
					onChange={(value) => setAttributes({ labelColor: value })}
				/>

				<TypographyControl
					label={__('Current hours typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="currentHoursTypography"
				/>

				<ColorControl
					label={__('Current hours color', 'voxel-fse')}
					value={attributes.currentHoursColor || ''}
					onChange={(value) => setAttributes({ currentHoursColor: value })}
				/>

				<ResponsiveDimensionsControl
					label={__('Padding', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="topPadding"
				/>
			</AccordionPanel>

			{/* Body Accordion */}
			<AccordionPanel id="body" title={__('Body', 'voxel-fse')}>
				<ColorControl
					label={__('Background', 'voxel-fse')}
					value={attributes.bodyBg || ''}
					onChange={(value) => setAttributes({ bodyBg: value })}
				/>

				<ColorControl
					label={__('Separator color', 'voxel-fse')}
					value={attributes.bodySeparatorColor || ''}
					onChange={(value) => setAttributes({ bodySeparatorColor: value })}
				/>

				<TypographyControl
					label={__('Day typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="dayTypography"
				/>

				<ColorControl
					label={__('Day color', 'voxel-fse')}
					value={attributes.dayColor || ''}
					onChange={(value) => setAttributes({ dayColor: value })}
				/>

				<TypographyControl
					label={__('Hours typography', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeName="hoursTypography"
				/>

				<ColorControl
					label={__('Hours color', 'voxel-fse')}
					value={attributes.hoursColor || ''}
					onChange={(value) => setAttributes({ hoursColor: value })}
				/>

				<ResponsiveDimensionsControl
					label={__('Padding', 'voxel-fse')}
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					attributeBaseName="bodyPadding"
				/>
			</AccordionPanel>

			{/* Open Accordion */}
			<AccordionPanel id="open" title={__('Open', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.openIcon || {}}
					onChange={(value) => setAttributes({ openIcon: value })}
					supportsDynamicTags={true}
				/>

				<TextControl
					label={__('Label', 'voxel-fse')}
					value={attributes.openText || 'Open now'}
					onChange={(value: string) => setAttributes({ openText: value })}
					placeholder={__('Enter label', 'voxel-fse')}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.openIconColor || ''}
					onChange={(value) => setAttributes({ openIconColor: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.openTextColor || ''}
					onChange={(value) => setAttributes({ openTextColor: value })}
				/>
			</AccordionPanel>

			{/* Closed Accordion */}
			<AccordionPanel id="closed" title={__('Closed', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.closedIcon || {}}
					onChange={(value) => setAttributes({ closedIcon: value })}
					supportsDynamicTags={true}
				/>

				<TextControl
					label={__('Label', 'voxel-fse')}
					value={attributes.closedText || 'Closed'}
					onChange={(value: string) => setAttributes({ closedText: value })}
					placeholder={__('Enter label', 'voxel-fse')}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.closedIconColor || ''}
					onChange={(value) => setAttributes({ closedIconColor: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.closedTextColor || ''}
					onChange={(value) => setAttributes({ closedTextColor: value })}
				/>
			</AccordionPanel>

			{/* Appointment only Accordion */}
			<AccordionPanel
				id="appointment-only"
				title={__('Appointment only', 'voxel-fse')}
			>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.appointmentIcon || {}}
					onChange={(value) => setAttributes({ appointmentIcon: value })}
					supportsDynamicTags={true}
				/>

				<TextControl
					label={__('Label', 'voxel-fse')}
					value={attributes.appointmentText || 'Appointment only'}
					onChange={(value: string) => setAttributes({ appointmentText: value })}
					placeholder={__('Enter label', 'voxel-fse')}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.appointmentIconColor || ''}
					onChange={(value) => setAttributes({ appointmentIconColor: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.appointmentTextColor || ''}
					onChange={(value) => setAttributes({ appointmentTextColor: value })}
				/>
			</AccordionPanel>

			{/* Not available Accordion */}
			<AccordionPanel id="not-available" title={__('Not available', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Icon', 'voxel-fse')}
					value={attributes.notAvailableIcon || {}}
					onChange={(value) => setAttributes({ notAvailableIcon: value })}
					supportsDynamicTags={true}
				/>

				<TextControl
					label={__('Label', 'voxel-fse')}
					value={attributes.notAvailableText || 'Not available'}
					onChange={(value: string) => setAttributes({ notAvailableText: value })}
					placeholder={__('Enter label', 'voxel-fse')}
				/>

				<ColorControl
					label={__('Icon color', 'voxel-fse')}
					value={attributes.notAvailableIconColor || ''}
					onChange={(value) => setAttributes({ notAvailableIconColor: value })}
				/>

				<ColorControl
					label={__('Text color', 'voxel-fse')}
					value={attributes.notAvailableTextColor || ''}
					onChange={(value) => setAttributes({ notAvailableTextColor: value })}
				/>
			</AccordionPanel>

			{/* Icons Accordion */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<AdvancedIconControl
					label={__('Down arrow icon', 'voxel-fse')}
					value={attributes.downIcon || {}}
					onChange={(value) => setAttributes({ downIcon: value })}
					supportsDynamicTags={true}
				/>
			</AccordionPanel>

			{/* Accordion button Accordion */}
			<AccordionPanel
				id="accordion-button"
				title={__('Accordion button', 'voxel-fse')}
			>
				<StateTabPanel
					attributeName="accordionButtonState"
					attributes={attributes as Record<string, any>}
					setAttributes={setAttributes as (attrs: Record<string, any>) => void}
					tabs={[
						{ name: 'normal', title: __('Normal', 'voxel-fse') },
						{ name: 'hover', title: __('Hover', 'voxel-fse') },
					]}
				>
					{(tab) =>
						tab.name === 'normal' ? (
							<>
								<ResponsiveRangeControl
									label={__('Button size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="accordionButtonSize"
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.accordionButtonColor || ''}
									onChange={(value) =>
										setAttributes({ accordionButtonColor: value })
									}
								/>

								<ResponsiveRangeControl
									label={__('Button icon size', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="accordionButtonIconSize"
									min={0}
									max={100}
									units={['px']}
								/>

								<ColorControl
									label={__('Button background', 'voxel-fse')}
									value={attributes.accordionButtonBg || ''}
									onChange={(value) =>
										setAttributes({ accordionButtonBg: value })
									}
								/>

								<BorderGroupControl
									label={__('Border Type', 'voxel-fse')}
									value={{
										borderType: attributes.accordionButtonBorderType || '',
										borderWidth: attributes.accordionButtonBorderWidth || {},
										borderColor: attributes.accordionButtonBorderColor || '',
									}}
									onChange={(value) => {
										const updates: Partial<WorkHoursAttributes> = {};
										if (value.borderType !== undefined) {
											updates.accordionButtonBorderType = value.borderType;
										}
										if (value.borderWidth !== undefined) {
											updates.accordionButtonBorderWidth = value.borderWidth;
										}
										if (value.borderColor !== undefined) {
											updates.accordionButtonBorderColor = value.borderColor;
										}
										setAttributes(updates);
									}}
									hideRadius={true}
								/>

								<ResponsiveRangeControl
									label={__('Button border radius', 'voxel-fse')}
									attributes={attributes as Record<string, any>}
									setAttributes={
										setAttributes as (attrs: Record<string, any>) => void
									}
									attributeBaseName="accordionButtonBorderRadius"
									min={0}
									max={100}
									units={['px']}
								/>
							</>
						) : (
							<>
								<ColorControl
									label={__('Button icon color', 'voxel-fse')}
									value={attributes.accordionButtonColorHover || ''}
									onChange={(value) =>
										setAttributes({ accordionButtonColorHover: value })
									}
								/>

								<ColorControl
									label={__('Button background color', 'voxel-fse')}
									value={attributes.accordionButtonBgHover || ''}
									onChange={(value) =>
										setAttributes({ accordionButtonBgHover: value })
									}
								/>

								<ColorControl
									label={__('Button border color', 'voxel-fse')}
									value={attributes.accordionButtonBorderColorHover || ''}
									onChange={(value) =>
										setAttributes({ accordionButtonBorderColorHover: value })
									}
								/>
							</>
						)
					}
				</StateTabPanel>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
