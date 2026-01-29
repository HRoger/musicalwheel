/**
 * Stripe Account Block - Content Tab Inspector Controls
 *
 * Extracted from edit.tsx for maintainability.
 * Contains: General Settings, Preview Settings, and Icons accordions.
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';
import { useState } from 'react';
import {
	AccordionPanelGroup,
	AccordionPanel,
	IconPickerControl,
	ImageUploadControl,
	EnableTagsButton,
} from '@shared/controls';
import { DynamicTagBuilder } from '../../../shared/dynamic-tags';
import type { StripeAccountAttributes } from '../types';

interface ContentTabProps {
	attributes: StripeAccountAttributes;
	setAttributes: (attrs: Partial<StripeAccountAttributes>) => void;
}

export function ContentTab({
	attributes,
	setAttributes,
}: ContentTabProps): JSX.Element {
	const [isPreviewUserModalOpen, setIsPreviewUserModalOpen] = useState(false);

	// Check if preview user has dynamic tags active
	const hasPreviewUserTags = () => {
		const tagValue = attributes.previewAsUserDynamicTag;
		return typeof tagValue === 'string' &&
			tagValue.startsWith('@tags()') &&
			tagValue.includes('@endtags()');
	};

	// Extract preview user tag content (remove @tags() wrapper)
	const getPreviewUserTagContent = () => {
		if (!hasPreviewUserTags()) return attributes.previewAsUserDynamicTag || '';
		const match = attributes.previewAsUserDynamicTag?.match(/@tags\(\)(.*?)@endtags\(\)/s);
		return match ? match[1] : attributes.previewAsUserDynamicTag || '';
	};

	// Handle enabling preview user tags
	const handleEnablePreviewUserTags = () => {
		setIsPreviewUserModalOpen(true);
	};

	// Handle editing preview user tags
	const handleEditPreviewUserTags = () => {
		setIsPreviewUserModalOpen(true);
	};

	// Handle disabling preview user tags
	const handleDisablePreviewUserTags = () => {
		if (window.confirm(__('Are you sure?', 'voxel-fse'))) {
			setAttributes({
				previewAsUserDynamicTag: '',
				previewAsUser: null
			});
		}
	};

	// Handle preview user modal save
	const handlePreviewUserModalSave = (newValue: string) => {
		if (newValue) {
			setAttributes({
				previewAsUserDynamicTag: `@tags()${newValue}@endtags()`,
			});
		}
		setIsPreviewUserModalOpen(false);
	};

	const isPreviewUserTagsActive = hasPreviewUserTags();

	return (
		<AccordionPanelGroup
			attributes={attributes as Record<string, any>}
			setAttributes={setAttributes as (attrs: Record<string, any>) => void}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="general-settings"
		>
			{/* General Settings Accordion */}
			<AccordionPanel id="general-settings" title={__('General Settings', 'voxel-fse')}>
				<ImageUploadControl
					label={__('General image (Stripe Connect)', 'voxel-fse')}
					value={attributes.genImage || { id: 0, url: '' }}
					onChange={(value) => setAttributes({ genImage: value })}
					allowedTypes={['image']}
					enableDynamicTags={true}
					dynamicTagValue={attributes.genImageDynamicTag}
					onDynamicTagChange={(value) => setAttributes({ genImageDynamicTag: value })}
					dynamicTagContext="post"
				/>
			</AccordionPanel>

			{/* Preview Settings Accordion */}
			<AccordionPanel id="preview-settings" title={__('Preview Settings', 'voxel-fse')}>
				<div className="voxel-dynamic-tag-text-control elementor-control elementor-control-type-text" style={{ marginBottom: '16px' }}>
					{/* Label with Voxel icon button */}
					<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<EnableTagsButton onClick={handleEnablePreviewUserTags} />
							<label className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>
								{__('Preview as user', 'voxel-fse')}
							</label>
						</div>
					</div>

					{/* Number input or tag preview panel */}
					<div className="elementor-control-input-wrapper">
						{!isPreviewUserTagsActive ? (
							<TextControl
								type="number"
								value={attributes.previewAsUser?.toString() || ''}
								onChange={(value) =>
									setAttributes({
										previewAsUser: value ? parseInt(value, 10) : null,
									})
								}
								help={__(
									'Enter user ID. Only applies while editing in Elementor. Leave empty to preview as yourself.',
									'voxel-fse'
								)}
								hideLabelFromVision
							/>
						) : (
							<div className="edit-voxel-tags" style={{
								backgroundColor: 'rgb(47, 47, 49)',
								borderRadius: '10px',
								overflow: 'hidden',
								padding: '12px',
							}}>
								{/* Tag content row */}
								<div style={{ marginBottom: '12px' }}>
									<span style={{
										color: '#fff',
										fontSize: '13px',
										fontFamily: 'inherit',
										wordBreak: 'break-all',
									}}>
										{getPreviewUserTagContent()}
									</span>
								</div>

								{/* Light gray divider */}
								<div style={{
									height: '1px',
									backgroundColor: 'rgba(255, 255, 255, 0.15)',
									marginBottom: '8px',
								}} />

								{/* Action buttons row */}
								<div style={{ display: 'flex' }}>
									<button
										type="button"
										className="edit-tags"
										onClick={handleEditPreviewUserTags}
										style={{
											flex: 1,
											background: 'transparent',
											border: 'none',
											color: 'rgba(255, 255, 255, 0.8)',
											fontSize: '10px',
											fontWeight: 600,
											letterSpacing: '0.5px',
											cursor: 'pointer',
											padding: '6px 0',
											textAlign: 'left',
										}}
									>
										{__('EDIT TAGS', 'voxel-fse')}
									</button>
									<button
										type="button"
										className="disable-tags"
										onClick={handleDisablePreviewUserTags}
										style={{
											flex: 1,
											background: 'transparent',
											border: 'none',
											color: 'rgba(255, 255, 255, 0.8)',
											fontSize: '10px',
											fontWeight: 600,
											letterSpacing: '0.5px',
											cursor: 'pointer',
											padding: '6px 0',
											textAlign: 'right',
										}}
									>
										{__('DISABLE TAGS', 'voxel-fse')}
									</button>
								</div>
							</div>
						)}
					</div>

					{/* Dynamic Tag Builder Modal */}
					{isPreviewUserModalOpen && (
						<DynamicTagBuilder
							context="user"
							initialValue={getPreviewUserTagContent()}
							onSave={handlePreviewUserModalSave}
							onClose={() => setIsPreviewUserModalOpen(false)}
						/>
					)}
				</div>
			</AccordionPanel>

			{/* Icons Accordion */}
			<AccordionPanel id="icons" title={__('Icons', 'voxel-fse')}>
				<IconPickerControl
					label={__('Setup icon', 'voxel-fse')}
					value={attributes.tsSetupIco || null}
					onChange={(value) => setAttributes({ tsSetupIco: value })}
				/>

				<IconPickerControl
					label={__('Submit information icon', 'voxel-fse')}
					value={attributes.tsSubmitIco || null}
					onChange={(value) => setAttributes({ tsSubmitIco: value })}
				/>

				<IconPickerControl
					label={__('Update information icon', 'voxel-fse')}
					value={attributes.tsUpdateIco || null}
					onChange={(value) => setAttributes({ tsUpdateIco: value })}
				/>

				<IconPickerControl
					label={__('Stripe icon', 'voxel-fse')}
					value={attributes.tsStripeIco || null}
					onChange={(value) => setAttributes({ tsStripeIco: value })}
				/>

				<IconPickerControl
					label={__('Shipping icon', 'voxel-fse')}
					value={attributes.tsShippingIco || null}
					onChange={(value) => setAttributes({ tsShippingIco: value })}
				/>

				<IconPickerControl
					label={__('Left chevron', 'voxel-fse')}
					value={attributes.tsChevronLeft || null}
					onChange={(value) => setAttributes({ tsChevronLeft: value })}
				/>

				<IconPickerControl
					label={__('Save', 'voxel-fse')}
					value={attributes.saveIcon || null}
					onChange={(value) => setAttributes({ saveIcon: value })}
				/>

				<IconPickerControl
					label={__('Drag handle', 'voxel-fse')}
					value={attributes.handleIcon || null}
					onChange={(value) => setAttributes({ handleIcon: value })}
				/>

				<IconPickerControl
					label={__('Zone', 'voxel-fse')}
					value={attributes.tsZoneIco || null}
					onChange={(value) => setAttributes({ tsZoneIco: value })}
				/>

				<IconPickerControl
					label={__('Trash', 'voxel-fse')}
					value={attributes.trashIcon || null}
					onChange={(value) => setAttributes({ trashIcon: value })}
				/>

				<IconPickerControl
					label={__('Down', 'voxel-fse')}
					value={attributes.downIcon || null}
					onChange={(value) => setAttributes({ downIcon: value })}
				/>

				<IconPickerControl
					label={__('Search', 'voxel-fse')}
					value={attributes.tsSearchIcon || null}
					onChange={(value) => setAttributes({ tsSearchIcon: value })}
				/>

				<IconPickerControl
					label={__('Plus icon', 'voxel-fse')}
					value={attributes.tsAddIcon || null}
					onChange={(value) => setAttributes({ tsAddIcon: value })}
				/>
			</AccordionPanel>
		</AccordionPanelGroup>
	);
}
