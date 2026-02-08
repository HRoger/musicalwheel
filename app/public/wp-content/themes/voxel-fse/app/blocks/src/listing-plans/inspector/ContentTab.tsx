/**
 * Listing Plans Block - Content Tab Inspector Controls
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import {
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
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
    ListingPlansAttributes,
    ListingPlansApiResponse,
    PlanConfig,
    PlanFeature,
} from '../types';
import { defaultIconValue, defaultPlanConfig } from '../types';
import type { IconValue as SharedIconValue } from '@shared/types';
import type { VisibilityRule } from '@shared/controls/ElementVisibilityModal';

interface ContentTabProps {
    attributes: ListingPlansAttributes;
    setAttributes: (attrs: Partial<ListingPlansAttributes>) => void;
    apiData: ListingPlansApiResponse | null;
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

    // Helper to get plan options for TagMultiSelect
    const getAvailablePlanOptions = () => {
        if (!apiData) return [];

        return apiData.availablePlans.map((plan) => {
            const submissionLabel =
                plan.submissions.mode === 'unlimited'
                    ? __('Unlimited', 'voxel-fse')
                    : `${plan.submissions.count}`;

            return {
                value: plan.key,
                label: `${plan.label} (${submissionLabel})`,
            };
        });
    };

    // Helper to get unique plan keys used in price groups
    const getUniquePlanKeys = () => {
        const planKeys = new Set<string>();
        attributes.priceGroups.forEach((group) => {
            group.prices.forEach((planKey) => {
                planKeys.add(planKey);
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
            <AccordionPanel
                id="price_groups"
                title={__('Price groups', 'voxel-fse')}
            >
                <RepeaterControl
                    items={attributes.priceGroups}
                    onChange={(newGroups) => setAttributes({ priceGroups: newGroups })}
                    getItemLabel={(item, index) => item.label || `Item #${index + 1}`}
                    addButtonText={__('Add Item', 'voxel-fse')}
                    createItem={() => ({
                        id: generateRepeaterId(),
                        label: 'New Group',
                        icon: defaultIconValue,
                        prices: [],
                        visibilityRules: []
                    })}
                    renderContent={({ item, onUpdate }) => (
                        <>
                            {/* Group Label with Dynamic Tag Builder */}
                            <DynamicTagTextControl
                                label={__('Group label', 'voxel-fse')}
                                value={item.label}
                                onChange={(label) => onUpdate({ label })}
                            />

                            <TagMultiSelect
                                label={__('Choose prices', 'voxel-fse')}
                                value={item.prices}
                                options={getAvailablePlanOptions()}
                                onChange={(prices) => onUpdate({ prices })}
                                placeholder={__('Select plans', 'voxel-fse')}
                            />

                            {/* Visibility Controls */}
                            <LoopVisibilityControl
                                rowVisibility={item.rowVisibility || 'show'}
                                visibilityRules={item.visibilityRules || []}
                                onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
                                onEditVisibilityRules={() => setVisibilityModal({
                                    isOpen: true,
                                    groupId: item.id,
                                    featureId: null,
                                    planKey: null,
                                    rules: item.visibilityRules || []
                                })}
                                onClearVisibilityRules={() => onUpdate({ visibilityRules: [] })}
                            />
                        </>
                    )}
                />
            </AccordionPanel>

            {/* Plan Configurations */}
            {getUniquePlanKeys().map((planKey) => {
                const plan = apiData?.availablePlans.find((p) => p.key === planKey);
                const planLabel = plan?.label || planKey;
                const config = attributes.planConfigs[planKey] || defaultPlanConfig;

                // Ensure features have IDs (lazy migration)
                const featuresWithIds: PlanFeature[] = config.features.map(f => ({
                    ...f,
                    id: f.id || generateRepeaterId()
                }));

                return (
                    <AccordionPanel
                        key={planKey}
                        id={`plan_${planKey}`}
                        title={`${__('Plan', 'voxel-fse')}: ${planLabel}`}
                    >
                        <div style={{ marginBottom: '15px' }}>
                            <ImageUploadControl
                                label={__('Choose image', 'voxel-fse')}
                                value={config.image ? { id: config.image.id, url: config.image.url } : undefined}
                                onChange={(image) => updatePlanConfig(planKey, {
                                    image: image ? { id: image.id || 0, url: image.url || '' } : null
                                })}
                                enableDynamicTags={true}
                                dynamicTagValue={config.imageDynamicTag}
                                onDynamicTagChange={(tag) => updatePlanConfig(planKey, { imageDynamicTag: tag })}
                                dynamicTagContext="post"
                            />
                        </div>

                        {/* Featured plan controls — Evidence: listing-plans-widget.php:1494-1510 */}
                        <SectionHeading label={__('Featured', 'voxel-fse')} />
                        <ToggleControl
                            label={__('Mark as featured', 'voxel-fse')}
                            checked={config.featured ?? false}
                            onChange={(val) => updatePlanConfig(planKey, { featured: val })}
                        />
                        {config.featured && (
                            <TextControl
                                label={__('Featured text', 'voxel-fse')}
                                value={config.featuredText ?? 'Featured'}
                                onChange={(val) => updatePlanConfig(planKey, { featuredText: val })}
                            />
                        )}

                        <SectionHeading label={__('Features', 'voxel-fse')} />

                        <RepeaterControl
                            items={featuresWithIds}
                            onChange={(newFeatures) => updatePlanConfig(planKey, { features: newFeatures })}
                            getItemLabel={(item, index) => item.text || `Item #${index + 1}`}
                            addButtonText={__('Add Item', 'voxel-fse')}
                            createItem={() => ({
                                id: generateRepeaterId(),
                                text: '',
                                icon: defaultIconValue,
                                rowVisibility: 'show' as 'show' | 'hide',
                                visibilityRules: []
                            })}
                            renderContent={({ item, onUpdate }) => (
                                <>
                                    <DynamicTagTextControl
                                        label={__('Text', 'voxel-fse')}
                                        value={item.text}
                                        onChange={(text) => onUpdate({ text })}
                                    />
                                    <AdvancedIconControl
                                        label={__('Icon', 'voxel-fse')}
                                        value={item.icon as SharedIconValue}
                                        onChange={(icon) => onUpdate({ icon })}
                                    />

                                    {/* Feature Visibility Controls */}
                                    <LoopVisibilityControl
                                        rowVisibility={item.rowVisibility || 'show'}
                                        visibilityRules={item.visibilityRules || []}
                                        onRowVisibilityChange={(value) => onUpdate({ rowVisibility: value })}
                                        onEditVisibilityRules={() => setVisibilityModal({
                                            isOpen: true,
                                            groupId: null,
                                            featureId: item.id,
                                            planKey: planKey,
                                            rules: item.visibilityRules || []
                                        })}
                                        onClearVisibilityRules={() => onUpdate({ visibilityRules: [] })}
                                    />
                                </>
                            )}
                        />
                    </AccordionPanel>
                );
            })}

            <AccordionPanel id="redirect_options" title={__('Redirect options', 'voxel-fse')}>
                {/* Evidence: listing-plans-widget.php:1549-1582 */}
                <SelectControl
                    label={__('Direct purchase redirect', 'voxel-fse')}
                    help={__('Specify where users should be redirected after purchasing a plan when the page is accessed directly (not as part of a specific flow such as creating a post, claiming a listing, or switching plans).', 'voxel-fse')}
                    value={attributes.directPurchaseRedirect}
                    options={[
                        { label: __('Go to Order page', 'voxel-fse'), value: 'order' },
                        { label: __('Go to post submission form', 'voxel-fse'), value: 'new_post' },
                        { label: __('Custom redirect', 'voxel-fse'), value: 'custom' },
                    ]}
                    onChange={(value: string) => setAttributes({
                        directPurchaseRedirect: value as 'order' | 'new_post' | 'custom'
                    })}
                />
                {attributes.directPurchaseRedirect === 'new_post' && (
                    <TextControl
                        label={__('Post type', 'voxel-fse')}
                        value={attributes.directPurchasePostType ?? ''}
                        onChange={(value) => setAttributes({ directPurchasePostType: value })}
                        help={__('Enter the post type key (e.g. "post", "listing")', 'voxel-fse')}
                    />
                )}
                {attributes.directPurchaseRedirect === 'custom' && (
                    <TextControl
                        label={__('Custom redirect URL', 'voxel-fse')}
                        value={attributes.directPurchaseCustomUrl ?? ''}
                        onChange={(value) => setAttributes({ directPurchaseCustomUrl: value })}
                        placeholder="https://"
                    />
                )}
            </AccordionPanel>

            {/* Visibility Rules Modal */}
            <ElementVisibilityModal
                isOpen={visibilityModal.isOpen}
                onClose={() => setVisibilityModal({ ...visibilityModal, isOpen: false })}
                rules={visibilityModal.rules}
                onSave={(newRules) => {
                    if (visibilityModal.groupId) {
                        const index = attributes.priceGroups.findIndex(g => g.id === visibilityModal.groupId);
                        if (index !== -1) {
                            const newGroups = [...attributes.priceGroups];
                            newGroups[index] = { ...newGroups[index], visibilityRules: newRules };
                            setAttributes({ priceGroups: newGroups });
                        }
                    } else if (visibilityModal.planKey && visibilityModal.featureId) {
                        const currentConfig = attributes.planConfigs[visibilityModal.planKey] || defaultPlanConfig;
                        const newFeatures = currentConfig.features.map(f => {
                            // Match by ID if possible, otherwise rely on index stability if IDs weren't stable (but they are now)
                            if (f.id === visibilityModal.featureId) {
                                return { ...f, visibilityRules: newRules };
                            }
                            return f;
                        });

                        setAttributes({
                            planConfigs: {
                                ...attributes.planConfigs,
                                [visibilityModal.planKey]: { ...currentConfig, features: newFeatures },
                            },
                        });
                    }
                }}
            />
        </AccordionPanelGroup>
    );
}
