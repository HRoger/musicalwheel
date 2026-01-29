/**
 * Membership Plans Block - Shared Component
 *
 * Renders the Membership Plans UI, used by both editor and frontend.
 * Matches Voxel's pricing-plans widget HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
 * - CSS classes: ts-plan-tabs, ts-generic-tabs, ts-plans-list, ts-paid-members-plans, ts-plan-container
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback } from 'react';
import type {
	MembershipPlansComponentProps,
	MembershipPlansVxConfig,
	PriceGroup,
	PlanConfig,
	PriceData,
} from '../types';
import { defaultIconValue, defaultPlanConfig } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons, renderIcon } from '@shared/utils';

/**
 * Merge block config with API price data
 */
function mergePriceWithConfig(
	priceData: PriceData,
	planConfigs: Record<string, PlanConfig>
): PriceData {
	const planKey = priceData.key === 'default' ? 'default' : priceData.key.split('@')[0];
	const config = planConfigs[planKey] || defaultPlanConfig;

	return {
		...priceData,
		image: config.image?.url || priceData.image,
		features: config.features.length > 0 ? config.features : priceData.features,
	};
}

export default function MembershipPlansComponent({
	attributes,
	apiData,
	isLoading,
	error,
	context,
	onTabChange,
}: MembershipPlansComponentProps): JSX.Element {
	// Active tab state
	const [activeGroup, setActiveGroup] = useState<string>('');

	// Initialize active group from first price group
	useEffect(() => {
		if (!activeGroup && attributes.priceGroups.length > 0) {
			setActiveGroup(attributes.priceGroups[0].id);
		}
	}, [activeGroup, attributes.priceGroups]);

	// Handle tab change
	const handleTabClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, groupId: string) => {
			e.preventDefault();
			setActiveGroup(groupId);
			onTabChange?.(groupId);
		},
		[onTabChange]
	);

	// Build vxconfig for re-rendering (required for Plan C+)
	const vxConfig: MembershipPlansVxConfig = {
		priceGroups: attributes.priceGroups ?? [],
		planConfigs: attributes.planConfigs ?? {},
		arrowIcon: attributes.arrowIcon ?? defaultIconValue,
		style: {
			plansColumns: attributes.plansColumns ?? 3,
			plansColumns_tablet: attributes.plansColumns_tablet,
			plansColumns_mobile: attributes.plansColumns_mobile,
			plansGap: attributes.plansGap ?? 20,
			tabsDisabled: attributes.tabsDisabled ?? false,
			tabsJustify: attributes.tabsJustify ?? 'flex-start',
			pricingAlign: attributes.pricingAlign ?? 'flex-start',
			contentAlign: attributes.contentAlign ?? 'flex-start',
			descAlign: attributes.descAlign ?? 'left',
			listAlign: attributes.listAlign ?? 'flex-start',
		},
	};

	// Arrow icon
	const arrowIconElement = renderIcon(attributes.arrowIcon as any, VoxelIcons.chevronRightSmall);

	// Loading state
	if (isLoading) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// Error state
	if (error) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// No price groups configured
	if (attributes.priceGroups.length === 0) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// All price groups have empty prices (no plans selected)
	const hasAnyPricesSelected = attributes.priceGroups.some(
		(group) => group.prices && group.prices.length > 0
	);
	if (!hasAnyPricesSelected) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<EmptyPlaceholder />
			</>
		);
	}

	// Build price data map from API
	const getPricesForGroup = (group: PriceGroup): PriceData[] => {
		if (!apiData) return [];

		const prices: PriceData[] = [];

		group.prices.forEach((priceKey) => {
			// Find matching price from API
			const apiGroup = apiData.priceGroups.find((g) =>
				g.prices.some((p) => p.key === priceKey)
			);
			const apiPrice = apiGroup?.prices.find((p) => p.key === priceKey);

			if (apiPrice) {
				prices.push(mergePriceWithConfig(apiPrice, attributes.planConfigs));
			}
		});

		return prices;
	};

	// Determine if current plan
	const isCurrentPlan = (priceKey: string): boolean => {
		if (!apiData?.userMembership) return false;

		const membership = apiData.userMembership;

		if (priceKey === 'default') {
			return membership.type === 'default' && membership.planKey === 'default';
		}

		return membership.priceKey === priceKey && !membership.isSubscriptionCanceled;
	};

	// Get button text based on membership status
	const getButtonText = (priceKey: string): string => {
		if (isCurrentPlan(priceKey)) {
			return __('Current plan', 'voxel-fse');
		}

		if (apiData?.userMembership?.type === 'order') {
			return __('Switch to plan', 'voxel-fse');
		}

		return __('Buy plan', 'voxel-fse');
	};

	// Get button class based on membership status
	const getButtonClass = (priceKey: string): string => {
		if (isCurrentPlan(priceKey)) {
			return 'ts-btn ts-btn-1 ts-btn-large vx-pick-plan';
		}
		return 'ts-btn ts-btn-2 ts-btn-large vx-pick-plan';
	};

	// CSS custom properties for grid
	const gridStyle: React.CSSProperties = {
		'--ts-plans-columns': attributes.plansColumns,
		'--ts-plans-gap': `${attributes.plansGap}px`,
	} as React.CSSProperties;

	// Default group if activeGroup not set
	const currentGroupId = activeGroup || (attributes.priceGroups[0]?.id ?? '');

	// Filter visible groups
	const visibleGroups = attributes.priceGroups.filter(
		(group) => group.rowVisibility !== 'hide'
	);

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Tabs - matches Voxel's .ts-plan-tabs structure */}
			{!attributes.tabsDisabled && visibleGroups.length > 1 && (
				<ul
					className="ts-plan-tabs simplify-ul flexify ts-generic-tabs"
					style={{ justifyContent: attributes.tabsJustify }}
				>
					{visibleGroups.map((group) => (
						<li
							key={group.id}
							className={group.id === currentGroupId ? 'ts-tab-active' : ''}
						>
							<a
								href="#"
								data-id={group.id}
								onClick={(e) => handleTabClick(e, group.id)}
							>
								{group.label}
							</a>
						</li>
					))}
				</ul>
			)}

			{/* Plans Grid - matches Voxel's .ts-plans-list structure */}
			<div className="ts-plans-list ts-paid-members-plans" style={gridStyle}>
				{visibleGroups.map((group) => {
					const groupPrices = getPricesForGroup(group);
					const isActiveGroup = group.id === currentGroupId;

					return groupPrices.map((price) => (
						<div
							key={`${group.id}-${price.key}`}
							className={`ts-plan-container ${!isActiveGroup ? 'hidden' : ''}`}
							data-group={group.id}
						>
							{/* ... rest of the card ... */}
							{/* Plan Image */}
							{price.image && (
								<div className="ts-plan-image flexify">
									{typeof price.image === 'string' ? (
										price.image.startsWith('<') ? (
											<span dangerouslySetInnerHTML={{ __html: price.image }} />
										) : (
											<img src={price.image} alt={price.label} />
										)
									) : null}
								</div>
							)}

							{/* Plan Body */}
							<div className="ts-plan-body">
								{/* Plan Details */}
								<div className="ts-plan-details">
									<span className="ts-plan-name">{price.label}</span>
								</div>

								{/* Plan Pricing */}
								<div
									className="ts-plan-pricing"
									style={{ justifyContent: attributes.pricingAlign }}
								>
									{price.isFree ? (
										<span className="ts-plan-price">
											{__('Free', 'voxel-fse')}
										</span>
									) : (
										<>
											{price.discountAmount ? (
												<>
													<span className="ts-plan-price">
														{price.discountAmount}
													</span>
													<span className="ts-plan-price">
														<s>{price.amount}</s>
													</span>
												</>
											) : (
												<span className="ts-plan-price">{price.amount}</span>
											)}
											{price.period && (
												<div className="ts-price-period">
													/ {price.period}
												</div>
											)}
											{price.trialDays != null && price.trialDays > 0 && (
												<p className="ts-price-trial">
													{price.trialDays}
													{__('-day free trial', 'voxel-fse')}
												</p>
											)}
										</>
									)}
								</div>

								{/* Plan Description */}
								{price.description && (
									<div
										className="ts-plan-desc"
										style={{ textAlign: attributes.descAlign }}
									>
										<p
											dangerouslySetInnerHTML={{
												__html: price.description.replace(/\n/g, '<br />'),
											}}
										/>
									</div>
								)}

								{/* Plan Features */}
								{price.features.length > 0 && (
									<div
										className="ts-plan-features"
										style={{ justifyContent: attributes.listAlign }}
									>
										<ul className="simplify-ul">
											{price.features
												.filter((f) => f.rowVisibility !== 'hide')
												.map((feature, index) => (
													<li key={index}>
														{renderIcon(
															feature.icon as any,
															VoxelIcons.checkmark
														)}
														<span>{feature.text}</span>
													</li>
												))}
										</ul>
									</div>
								)}

								{/* Plan Footer */}
								<div className="ts-plan-footer">
									<a
										href={price.link || '#'}
										className={getButtonClass(price.key)}
										rel={isCurrentPlan(price.key) ? undefined : 'nofollow'}
										onClick={
											context === 'editor'
												? (e) => e.preventDefault()
												: undefined
										}
									>
										{getButtonText(price.key)}
										{!isCurrentPlan(price.key) && arrowIconElement}
									</a>
								</div>
							</div>
						</div>
					));
				})}
			</div>
		</>
	);
}
