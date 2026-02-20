/**
 * Membership Plans Block - Shared Component
 *
 * Renders the Membership Plans UI, used by both editor and frontend.
 * Matches Voxel's pricing-plans widget HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
 * - CSS classes: ts-plan-tabs, ts-generic-tabs, ts-plans-list, ts-paid-members-plans, ts-plan-container
 * - JS behavior: docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useRef } from 'react';
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
 * Declare global types for Voxel
 * @see docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js
 */
declare global {
	interface Window {
		jQuery?: JQueryStatic;
	}
}

interface JQueryStatic {
	get: (url: string) => JQueryPromise;
}

interface JQueryPromise {
	always: (callback: (response: MembershipPlanResponse) => void) => void;
}

/**
 * Dialog action interface
 * @see docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js lines 56-70
 */
interface VoxelDialogAction {
	label: string;
	confirm_switch?: boolean;
	confirm_cancel?: boolean;
	link?: string;
	onClick?: (event: Event) => void;
}

/**
 * Dialog options interface
 */
interface VoxelDialogOptions {
	title: string;
	message: string;
	actions: VoxelDialogAction[];
}

/**
 * API response types for membership plan selection
 * @see docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js lines 48-109
 */
interface MembershipPlanResponse {
	success?: boolean;
	type?: 'dialog' | 'checkout' | 'redirect';
	dialog?: VoxelDialogOptions;
	item?: {
		key: string;
		value: unknown;
	};
	checkout_link?: string;
	redirect_to?: string;
	redirect_url?: string; // Legacy format
	message?: string;
}

/**
 * Confirmation action response
 */
interface ConfirmationResponse {
	success?: boolean;
	redirect_to?: string;
	message?: string;
}

/**
 * Direct cart localStorage key
 * @see docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js lines 111-119
 */
const DIRECT_CART_KEY = 'voxel:direct_cart';

/**
 * Handle plan button click - matches Voxel pricing-plans.js exactly
 *
 * This is more complex than listing-plans because it supports:
 * 1. Dialog confirmations for subscription changes
 * 2. Nested AJAX calls for confirm_switch/confirm_cancel
 * 3. Multiple action buttons in confirmation dialogs
 *
 * Flow:
 * 1. Prevent default link behavior
 * 2. Add loading state (.vx-pending) to plan container
 * 3. Make AJAX request to button's href
 * 4. Handle response based on type:
 *    - dialog: Show confirmation with actions (may have nested AJAX)
 *    - checkout: Store cart in localStorage + redirect
 *    - redirect: Direct redirect
 *    - legacy redirect_url: Fallback redirect
 * 5. Remove loading state
 *
 * @see docs/block-conversions/membership-plans/voxel-pricing-plans.beautified.js lines 168-328
 */
function handlePlanClick(
	event: React.MouseEvent<HTMLAnchorElement>,
	planContainerRef: React.RefObject<HTMLDivElement | null>
): void {
	event.preventDefault();

	const buttonElement = event.currentTarget;
	const planContainer = planContainerRef.current;

	if (!planContainer) {
		console.error('[MembershipPlans] Plan container not found');
		return;
	}

	// Add loading state
	planContainer.classList.add('vx-pending');

	// Get the href for the AJAX request
	const href = buttonElement.href;

	// Use jQuery for AJAX request to match Voxel's pattern
	const jQuery = window.jQuery;
	if (!jQuery) {
		console.error('[MembershipPlans] jQuery not available');
		planContainer.classList.remove('vx-pending');
		return;
	}

	jQuery.get(href).always(function (response: MembershipPlanResponse) {
		if (response.success) {
			// ========================================
			// DIALOG TYPE RESPONSE
			// Used for subscription changes that need user confirmation
			// @see lines 214-261 of beautified.js
			// ========================================
			if (response.type === 'dialog' && response.dialog) {
				// Process each action in the dialog
				response.dialog.actions.forEach(function (action: VoxelDialogAction) {
					// Check if action needs confirmation AJAX call
					if (action.confirm_switch || action.confirm_cancel) {
						/**
						 * Add onClick handler for confirmation actions
						 *
						 * When clicked:
						 * 1. Prevent default
						 * 2. Add loading state
						 * 3. Make confirmation AJAX call
						 * 4. Redirect on success or show error
						 * 5. Remove loading state
						 *
						 * @see lines 232-255 of beautified.js
						 */
						action.onClick = function (clickEvent: Event) {
							clickEvent.preventDefault();

							// Add loading state
							planContainer.classList.add('vx-pending');

							// Make confirmation AJAX request
							if (action.link) {
								jQuery.get(action.link).always(function (
									confirmResponse: ConfirmationResponse
								) {
									if (confirmResponse.success) {
										// Redirect to success page
										if (confirmResponse.redirect_to) {
											window.location.href = confirmResponse.redirect_to;
										}
									} else {
										// Show error using Voxel alert system
										const errorMessage =
											confirmResponse.message ||
											(window as any).Voxel_Config?.l10n?.ajaxError ||
											'An error occurred';

										if (window.Voxel?.alert) {
											window.Voxel.alert(errorMessage, 'error');
										} else {
											console.error('[MembershipPlans] Error:', errorMessage);
										}
									}

									// Remove loading state
									planContainer.classList.remove('vx-pending');
								});
							}
						};
					}
				});

				// Show the dialog with modified actions
				if (window.Voxel?.dialog) {
					(window as any).Voxel.dialog(response.dialog);
				} else {
					console.error('[MembershipPlans] Voxel.dialog not available');
				}
			}
			// ========================================
			// CHECKOUT TYPE RESPONSE
			// Store cart item in localStorage and redirect
			// @see lines 274-282 of beautified.js
			// ========================================
			else if (response.type === 'checkout' && response.item && response.checkout_link) {
				// Store cart item in localStorage
				localStorage.setItem(
					DIRECT_CART_KEY,
					JSON.stringify({
						[response.item.key]: response.item.value,
					})
				);

				// Redirect to checkout
				window.location.href = response.checkout_link;
			}
			// ========================================
			// REDIRECT TYPE RESPONSE
			// Used when no checkout is needed (e.g., free plan)
			// @see lines 293-295 of beautified.js
			// ========================================
			else if (response.type === 'redirect' && response.redirect_to) {
				window.location.href = response.redirect_to;
			}
			// ========================================
			// LEGACY REDIRECT_URL RESPONSE
			// Fallback for older response format
			// @see lines 306-308 of beautified.js
			// ========================================
			else if (response.redirect_url) {
				window.location.href = response.redirect_url;
			}
		} else {
			// ========================================
			// ERROR RESPONSE
			// Show error message using Voxel alert system
			// @see lines 321-322 of beautified.js
			// ========================================
			const errorMessage =
				response.message ||
				(window as any).Voxel_Config?.l10n?.ajaxError ||
				'An error occurred';

			if (window.Voxel?.alert) {
				window.Voxel.alert(errorMessage, 'error');
			} else {
				console.error('[MembershipPlans] Error:', errorMessage);
			}
		}

		// Remove loading state (always, on both success and error)
		// @see line 325 of beautified.js
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
	const planKey = priceData.key === 'default' ? 'default' : priceData.key.split('@')[0];
	const config = planConfigs[planKey] || defaultPlanConfig;

	return {
		...priceData,
		image: config.image?.url || priceData.image,
		features: config.features.length > 0 ? config.features : priceData.features,
	};
}

/**
 * Plan Card Component Props
 */
interface PlanCardProps {
	price: PriceData;
	groupId: string;
	isActiveGroup: boolean;
	isCurrentPlan: boolean;
	buttonText: string;
	buttonClass: string;
	pricingAlign: string;
	descAlign: string;
	listAlign: string;
	arrowIconElement: JSX.Element;
	context: 'editor' | 'frontend';
}

/**
 * Plan Card Component
 *
 * Individual plan card with its own ref for loading state management.
 * Extracted to allow each card to manage its own ref for the click handler.
 */
function PlanCard({
	price,
	groupId,
	isActiveGroup,
	isCurrentPlan,
	buttonText,
	buttonClass,
	pricingAlign,
	descAlign,
	listAlign,
	arrowIconElement,
	context,
}: PlanCardProps): JSX.Element {
	// Ref for loading state management
	const planContainerRef = useRef<HTMLDivElement>(null);

	// Click handler for plan selection
	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>) => {
			// Skip click handling in editor context
			if (context === 'editor') {
				e.preventDefault();
				return;
			}

			// Skip if this is the current plan (no action needed)
			if (isCurrentPlan) {
				e.preventDefault();
				return;
			}

			// Handle plan selection with AJAX
			handlePlanClick(e, planContainerRef);
		},
		[context, isCurrentPlan]
	);

	return (
		<div
			ref={planContainerRef}
			className={`ts-plan-container ${!isActiveGroup ? 'hidden' : ''}`}
			data-group={groupId}
		>
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
					style={{ justifyContent: pricingAlign }}
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
									{__('%d-day free trial', 'voxel-fse').replace('%d', String(price.trialDays))}
								</p>
							)}
						</>
					)}
				</div>

				{/* Plan Description */}
				{price.description && (
					<div
						className="ts-plan-desc"
						style={{ textAlign: descAlign as 'left' | 'center' | 'right' }}
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
						style={{ justifyContent: listAlign }}
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
						className={buttonClass}
						rel={isCurrentPlan ? undefined : 'nofollow'}
						onClick={handleClick}
					>
						{buttonText}
						{!isCurrentPlan && arrowIconElement}
					</a>
				</div>
			</div>
		</div>
	);
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

	/**
	 * Inject Voxel Pricing Plan CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-pricing-plan-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/pricing-plan.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

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
				{context === 'editor' && <EmptyPlaceholder />}
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
				{context === 'editor' && <EmptyPlaceholder />}
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
				{context === 'editor' && <EmptyPlaceholder />}
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
				{context === 'editor' && <EmptyPlaceholder />}
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
	// Evidence: pricing-plans-widget.php template lines 72-92
	const isCurrentPlan = (priceKey: string): boolean => {
		if (!apiData?.userMembership) return false;

		const membership = apiData.userMembership;

		// Default/free plan: must be type 'default', planKey 'default', and NOT initial state
		// (initial state = user just registered, hasn't explicitly chosen a plan yet)
		if (priceKey === 'default') {
			return membership.type === 'default'
				&& membership.planKey === 'default'
				&& !membership.isInitialState;
		}

		// Paid plan: check type is 'order', subscription not canceled, and price matches
		return membership.type === 'order'
			&& membership.priceKey === priceKey
			&& !membership.isSubscriptionCanceled;
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
						<PlanCard
							key={`${group.id}-${price.key}`}
							price={price}
							groupId={group.id}
							isActiveGroup={isActiveGroup}
							isCurrentPlan={isCurrentPlan(price.key)}
							buttonText={getButtonText(price.key)}
							buttonClass={getButtonClass(price.key)}
							pricingAlign={attributes.pricingAlign}
							descAlign={attributes.descAlign}
							listAlign={attributes.listAlign}
							arrowIconElement={arrowIconElement as any}
							context={context}
						/>
					));
				})}
			</div>
		</>
	);
}
