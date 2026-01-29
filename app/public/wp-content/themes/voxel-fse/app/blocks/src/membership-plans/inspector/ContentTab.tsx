/**
 * Membership Plans Block - Content Tab Inspector Controls
 *
 * Matches Voxel's pricing-plans widget Content tab controls:
 * - Price groups with dynamic tags and visibility rules
 * - Dynamic Plan accordions based on selected prices
 * - Plan features with dynamic tags, icons, and visibility rules
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import {
	AccordionPanelGroup,
	AccordionPanel,
	SectionHeading,
	AdvancedIconControl,
	RepeaterControl,
	generateRepeaterId,
	TagMultiSelect,
	ElementVisibilityModal,
	ImageUploadControl,
	DynamicTagTextControl,
	LoopVisibilityControl,
} from '@shared/controls';
import type {
	MembershipPlansAttributes,
	MembershipPlansApiResponse,
	PlanConfig,
	PlanFeature,
	PriceGroup,
} from '../types';
import { defaultIconValue, defaultPlanConfig } from '../types';
import type { IconValue as SharedIconValue } from '@shared/types';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';

interface ContentTabProps {
	attributes: MembershipPlansAttributes;
	setAttributes: (attrs: Partial<MembershipPlansAttributes>) => void;
	apiData: MembershipPlansApiResponse | null;
}

export function ContentTab({
	attributes,
	setAttributes,
	apiData,
}: ContentTabProps): JSX.Element {
	// Visibility Modal State
	const [visibilityModal, setVisibilityModal] = useState<{
		isOpen: boolean;
		groupId: string | null;
		featureId: string | null;
		planKey: string | null;
		rules: VisibilityRule[];
	}>({
		isOpen: false,
		groupId: null,
		featureId: null,
		planKey: null,
		rules: [],
	});

	// Helper to get available price options for TagMultiSelect
	const getAvailablePriceOptions = () => {
		if (!apiData) return [];

		const options: Array<{ value: string; label: string }> = [];

		apiData.availablePlans.forEach((plan) => {
			plan.prices.forEach((price) => {
				const label = price.formattedPeriod
					? `${plan.label} - ${price.formattedAmount} / ${price.formattedPeriod}`
					: `${plan.label} - ${price.formattedAmount}`;
				options.push({
					value: price.priceKey,
					label,
				});
			});
		});

		// Add free/default plan option
		options.push({
			value: 'default',
			label: __('Free plan', 'voxel-fse'),
		});

		return options;
	};

	// Helper to get unique plan keys used in price groups
	const getUniquePlanKeys = () => {
		const planKeys = new Set<string>();
		attributes.priceGroups.forEach((group) => {
			group.prices.forEach((priceKey) => {
				if (priceKey === 'default') {
					planKeys.add('default');
				} else {
					const [planKey] = priceKey.split('@');
					if (planKey) {
						planKeys.add(planKey);
					}
				}
			});
		});
		return Array.from(planKeys);
	};

	// Update Plan Config
	const updatePlanConfig = (planKey: string, updates: Partial<PlanConfig>) => {
		const currentConfig = attributes.planConfigs[planKey] || defaultPlanConfig;
		setAttributes({
			planConfigs: {
				...attributes.planConfigs,
				[planKey]: { ...currentConfig, ...updates },
			},
		});
	};

	return (
		<AccordionPanelGroup
			attributes={attributes}
			setAttributes={setAttributes}
			stateAttribute="contentTabOpenPanel"
			defaultPanel="price_groups"
		>
			{/* Price Groups Accordion */}
			<AccordionPanel
				id="price_groups"
				title={__('Price groups', 'voxel-fse')}
			>
				<RepeaterControl
					label={__('Items', 'voxel-fse')}
					items={attributes.priceGroups}
					onChange={(newGroups) => setAttributes({ priceGroups: newGroups })}
					getItemLabel={(item, index) => item.label || `Item #${index + 1}`}
					addButtonText={__('Add Item', 'voxel-fse')}
					createItem={() => ({
						id: generateRepeaterId(),
						label: __('New Group', 'voxel-fse'),
						prices: [],
						rowVisibility: 'show' as const,
						visibilityRules: [],
					})}
					renderContent={({ item, onUpdate }) => (
						<>
							{/* Group Label with Dynamic Tag Builder */}
							<DynamicTagTextControl
								label={__('Group label', 'voxel-fse')}
								value={item.label}
								onChange={(label) => onUpdate({ label })}
							/>

							{/* Choose Prices - Multi-select */}
							<TagMultiSelect
								label={__('Choose prices', 'voxel-fse')}
								value={item.prices}
								options={getAvailablePriceOptions()}
								onChange={(prices) => onUpdate({ prices })}
								placeholder={__('Select prices', 'voxel-fse')}
							/>

							{/* Visibility Controls */}
							<LoopVisibilityControl
								rowVisibility={item.rowVisibility || 'show'}
								visibilityRules={item.visibilityRules || []}
								onRowVisibilityChange={(value) =>
									onUpdate({ rowVisibility: value })
								}
								onEditVisibilityRules={() =>
									setVisibilityModal({
										isOpen: true,
										groupId: item.id,
										featureId: null,
										planKey: null,
										rules: item.visibilityRules || [],
									})
								}
								onClearVisibilityRules={() =>
									onUpdate({ visibilityRules: [] })
								}
							/>
						</>
					)}
				/>
			</AccordionPanel>

			{/* Dynamic Plan Accordions - Only show when prices are selected */}
			{getUniquePlanKeys().map((planKey) => {
				const plan = apiData?.availablePlans.find((p) => p.key === planKey);
				const planLabel =
					planKey === 'default'
						? __('Free plan', 'voxel-fse')
						: plan?.label || planKey;
				const config = attributes.planConfigs[planKey] || defaultPlanConfig;

				// Ensure features have IDs (lazy migration)
				const featuresWithIds: PlanFeature[] = config.features.map((f) => ({
					...f,
					id: f.id || generateRepeaterId(),
				}));

				return (
					<AccordionPanel
						key={planKey}
						id={`plan_${planKey}`}
						title={`${__('Plan', 'voxel-fse')}: ${planLabel}`}
					>
						{/* Plan Image Upload with Dynamic Tag Support */}
						<div style={{ marginBottom: '15px' }}>
							<ImageUploadControl
								label={__('Choose image', 'voxel-fse')}
								value={
									config.image
										? { id: config.image.id, url: config.image.url }
										: undefined
								}
								onChange={(image) =>
									updatePlanConfig(planKey, {
										image: image
											? { id: image.id || 0, url: image.url || '' }
											: null,
									})
								}
								enableDynamicTags={true}
								dynamicTagValue={config.imageDynamicTag}
								onDynamicTagChange={(tag) =>
									updatePlanConfig(planKey, { imageDynamicTag: tag })
								}
								dynamicTagContext="post"
							/>
						</div>

						{/* Features Section */}
						<SectionHeading label={__('Features', 'voxel-fse')} />

						<RepeaterControl
							items={featuresWithIds}
							onChange={(newFeatures) =>
								updatePlanConfig(planKey, { features: newFeatures })
							}
							getItemLabel={(item, index) => item.text || `Item #${index + 1}`}
							addButtonText={__('Add Item', 'voxel-fse')}
							createItem={() => ({
								id: generateRepeaterId(),
								text: '',
								icon: defaultIconValue,
								rowVisibility: 'show' as const,
								visibilityRules: [],
							})}
							renderContent={({ item, onUpdate }) => (
								<>
									{/* Feature Text with Dynamic Tag Support */}
									<DynamicTagTextControl
										label={__('Text', 'voxel-fse')}
										value={item.text}
										onChange={(text) => onUpdate({ text })}
									/>

									{/* Feature Icon */}
									<AdvancedIconControl
										label={__('Icon', 'voxel-fse')}
										value={item.icon as SharedIconValue}
										onChange={(icon) => onUpdate({ icon })}
									/>

									{/* Feature Visibility Controls */}
									<LoopVisibilityControl
										rowVisibility={item.rowVisibility || 'show'}
										visibilityRules={item.visibilityRules || []}
										onRowVisibilityChange={(value) =>
											onUpdate({ rowVisibility: value })
										}
										onEditVisibilityRules={() =>
											setVisibilityModal({
												isOpen: true,
												groupId: null,
												featureId: item.id,
												planKey: planKey,
												rules: item.visibilityRules || [],
											})
										}
										onClearVisibilityRules={() =>
											onUpdate({ visibilityRules: [] })
										}
									/>
								</>
							)}
						/>
					</AccordionPanel>
				);
			})}

			{/* Visibility Rules Modal */}
			<ElementVisibilityModal
				isOpen={visibilityModal.isOpen}
				onClose={() =>
					setVisibilityModal({ ...visibilityModal, isOpen: false })
				}
				rules={visibilityModal.rules}
				onSave={(newRules) => {
					if (visibilityModal.groupId) {
						// Update price group visibility rules
						const index = attributes.priceGroups.findIndex(
							(g) => g.id === visibilityModal.groupId
						);
						if (index !== -1) {
							const newGroups = [...attributes.priceGroups];
							newGroups[index] = {
								...newGroups[index],
								visibilityRules: newRules,
							};
							setAttributes({ priceGroups: newGroups });
						}
					} else if (visibilityModal.planKey && visibilityModal.featureId) {
						// Update feature visibility rules
						const currentConfig =
							attributes.planConfigs[visibilityModal.planKey] ||
							defaultPlanConfig;
						const newFeatures = currentConfig.features.map((f) => {
							if (f.id === visibilityModal.featureId) {
								return { ...f, visibilityRules: newRules };
							}
							return f;
						});

						setAttributes({
							planConfigs: {
								...attributes.planConfigs,
								[visibilityModal.planKey]: {
									...currentConfig,
									features: newFeatures,
								},
							},
						});
					}
				}}
			/>
		</AccordionPanelGroup>
	);
}
