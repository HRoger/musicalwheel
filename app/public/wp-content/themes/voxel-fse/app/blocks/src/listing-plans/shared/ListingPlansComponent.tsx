/**
 * Listing Plans Block - Shared Component
 *
 * Renders the Listing Plans UI, used by both editor and frontend.
 * Matches Voxel's listing-plans widget HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php
 * - CSS classes: ts-plan-tabs, ts-generic-tabs, ts-plans-list, ts-paid-listings-plans, ts-plan-container
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useRef } from 'react';
import type {
	ListingPlansAttributes,
	ListingPlansApiResponse,
	ListingPlansComponentProps,
	ListingPlansVxConfig,
	PriceGroup,
	PlanConfig,
	PriceData,
	IconValue,
} from '../types';
import { defaultIconValue, defaultPlanConfig } from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { VoxelIcons, renderIcon } from '@shared/utils';

/**
 * Declare global types for Voxel
 */
declare global {
	interface Window {
		jQuery?: JQueryStatic;
		Voxel?: {
			alert: (message: string, type: 'error' | 'success' | 'info') => void;
		};
		Voxel_Config?: {
			l10n: {
				ajaxError: string;
			};
		};
	}
}

/**
 * Handle plan button click - matches Voxel listing-plans-widget.js exactly
 *
 * Flow:
 * 1. Prevent default link behavior
 * 2. Add loading state (.vx-pending) to plan container
 * 3. Make AJAX request to button's href
 * 4. Handle response based on type (checkout/redirect/legacy)
 * 5. Remove loading state
 *
 * @see themes/voxel/assets/dist/listing-plans-widget.js
 */
function handlePlanClick(
	event: React.MouseEvent<HTMLAnchorElement>,
	planContainerRef: React.RefObject<HTMLDivElement | null>
): void {
	event.preventDefault();

	const buttonElement = event.currentTarget;
	const planContainer = planContainerRef.current;

	if (!planContainer) {
		console.error('[ListingPlans] Plan container not found');
		return;
	}

	// Add loading state
	planContainer.classList.add('vx-pending');

	// Get the href for the AJAX request
	const href = buttonElement.href;

	// Use jQuery for AJAX request to match Voxel's pattern
	const jQuery = window.jQuery;
	if (!jQuery) {
		console.error('[ListingPlans] jQuery not available');
		planContainer.classList.remove('vx-pending');
		return;
	}

	jQuery.get(href).always(function (response: {
		success?: boolean;
		type?: 'checkout' | 'redirect';
		item?: {
			key: string;
			value: unknown;
		};
		checkout_link?: string;
		redirect_to?: string;
		redirect_url?: string;
		message?: string;
	}) {
		if (response.success) {
			// Handle checkout type response
			if (response.type === 'checkout' && response.item && response.checkout_link) {
				// Store cart item in localStorage
				localStorage.setItem(
					'voxel:direct_cart',
					JSON.stringify({
						[response.item.key]: response.item.value,
					})
				);

				// Redirect to checkout
				window.location.href = response.checkout_link;
			}
			// Handle redirect type response
			else if (response.type === 'redirect' && response.redirect_to) {
				window.location.href = response.redirect_to;
			}
			// Handle legacy redirect_url response
			else if (response.redirect_url) {
				window.location.href = response.redirect_url;
			}
		} else {
			// Show error using Voxel alert system
			const errorMessage =
				response.message ||
				window.Voxel_Config?.l10n?.ajaxError ||
				'An error occurred';

			if (window.Voxel?.alert) {
				window.Voxel.alert(errorMessage, 'error');
			} else {
				console.error('[ListingPlans] Error:', errorMessage);
			}
		}

		// Remove loading state (always, on both success and error)
		planContainer.classList.remove('vx-pending');
	});
}

/**
 * Merge block config with API price data
 */
function mergePriceWithConfig(
	priceData: PriceData,
	planConfigs: Record<string, PlanConfig>
): PriceData {
	const config = planConfigs[priceData.planKey] || defaultPlanConfig;

	return {
		...priceData,
		image: config.image?.url || priceData.image,
		features: config.features.length > 0 ? config.features : priceData.features,
	};
}

/**
 * Plan Card Component
 *
 * Separate component for each plan card to properly handle refs and click events.
 * This matches Voxel's listing-plans-widget.js behavior exactly.
 */
interface PlanCardProps {
	price: PriceData;
	groupId: string;
	isActiveGroup: boolean;
	attributes: ListingPlansAttributes;
	apiData: ListingPlansApiResponse | null;
	context: 'editor' | 'frontend';
	arrowIconElement: React.ReactNode;
}

function PlanCard({
	price,
	groupId,
	isActiveGroup,
	attributes,
	apiData,
	context,
	arrowIconElement,
}: PlanCardProps): JSX.Element {
	const planContainerRef = useRef<HTMLDivElement>(null);

	// Determine plan state classes
	const planClasses = [
		'ts-plan-container',
		!isActiveGroup ? 'hidden' : '',
	]
		.filter(Boolean)
		.join(' ');

	// Determine button state and text
	const buttonInfo = (() => {
		if (!apiData?.isLoggedIn) {
			return {
				text: price.isFree
					? __('Pick plan', 'voxel-fse')
					: __('Buy plan', 'voxel-fse'),
				className: 'ts-btn ts-btn-2 ts-btn-large vx-pick-plan',
				showArrow: true,
			};
		}

		return {
			text: price.isFree
				? __('Pick plan', 'voxel-fse')
				: __('Buy plan', 'voxel-fse'),
			className: 'ts-btn ts-btn-2 ts-btn-large vx-pick-plan',
			showArrow: true,
		};
	})();

	// Click handler - only active on frontend
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			if (context === 'editor') {
				e.preventDefault();
				return;
			}

			// Frontend: use the full AJAX flow
			handlePlanClick(e, planContainerRef);
		},
		[context]
	);

	return (
		<div
			ref={planContainerRef}
			key={`${groupId}-${price.key}`}
			className={planClasses}
			data-group={groupId}
		>
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
						</>
					)}
				</div>

				{/* Plan Image (positioned after pricing in listing-plans) */}
				{price.image && (
					<div className="ts-plan-image flexify">
						{typeof price.image === 'string' ? (
							price.image.startsWith('<') ? (
								<span
									dangerouslySetInnerHTML={{ __html: price.image }}
								/>
							) : (
								<img src={price.image} alt={price.label} />
							)
						) : null}
					</div>
				)}

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
							{price.features.map((feature, index) => (
								<li key={index}>
									{renderIcon(
										feature.icon,
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
						className={buttonInfo.className}
						rel="nofollow"
						data-redirect={attributes.directPurchaseRedirect}
						onClick={handleClick}
					>
						{buttonInfo.text}
						{buttonInfo.showArrow && arrowIconElement}
					</a>
				</div>
			</div>
		</div>
	);
}

export default function ListingPlansComponent({
	attributes,
	apiData,
	isLoading,
	error,
	context,
	onTabChange,
}: ListingPlansComponentProps): JSX.Element {
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
	const vxConfig: ListingPlansVxConfig = {
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
	const arrowIconElement = renderIcon(
		attributes.arrowIcon,
		VoxelIcons.chevronRightSmall
	);

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

	// Build price data map from API
	const getPricesForGroup = (group: PriceGroup): PriceData[] => {
		if (!apiData) return [];

		const prices: PriceData[] = [];

		group.prices.forEach((planKey) => {
			// Find matching price from API
			const apiGroup = apiData.priceGroups.find((g) =>
				g.prices.some((p) => p.planKey === planKey)
			);
			const apiPrice = apiGroup?.prices.find((p) => p.planKey === planKey);

			if (apiPrice) {
				prices.push(mergePriceWithConfig(apiPrice, attributes.planConfigs));
			}
		});

		return prices;
	};

	// CSS custom properties for grid
	const gridStyle: React.CSSProperties = {
		'--ts-plans-columns': attributes.plansColumns,
		'--ts-plans-gap': `${attributes.plansGap}px`,
	} as React.CSSProperties;

	// Default group if activeGroup not set
	const currentGroupId = activeGroup || (attributes.priceGroups[0]?.id ?? '');

	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Tabs - matches Voxel's .ts-plan-tabs structure */}
			{!attributes.tabsDisabled && attributes.priceGroups.length > 1 && (
				<ul
					className="ts-plan-tabs simplify-ul flexify ts-generic-tabs"
					style={{ justifyContent: attributes.tabsJustify }}
				>
					{attributes.priceGroups.map((group) => (
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

			{/* Plans Grid - matches Voxel's .ts-plans-list.ts-paid-listings-plans structure */}
			<div className="ts-plans-list ts-paid-listings-plans" style={gridStyle}>
				{attributes.priceGroups.map((group) => {
					const groupPrices = getPricesForGroup(group);
					const isActiveGroup = group.id === currentGroupId;

					return groupPrices.map((price) => (
						<PlanCard
							key={`${group.id}-${price.key}`}
							price={price}
							groupId={group.id}
							isActiveGroup={isActiveGroup}
							attributes={attributes}
							apiData={apiData}
							context={context}
							arrowIconElement={arrowIconElement}
						/>
					));
				})}
			</div>
		</>
	);
}
