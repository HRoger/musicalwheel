/**
 * Current Plan Block - Shared Component
 *
 * Renders the Current Plan UI, used by both editor and frontend.
 * Matches Voxel's current-plan widget HTML structure 1:1.
 *
 * Evidence:
 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php
 * - CSS classes: ts-panel, active-plan, plan-panel, ac-head, ac-body, ac-plan-pricing, ac-bottom
 *
 * @package VoxelFSE
 */

import { __ } from '@wordpress/i18n';
import type {
			CurrentPlanComponentProps,
	CurrentPlanVxConfig,
	IconValue,
} from '../types';

/**
 * Render icon markup based on IconValue
 */
function renderIcon(icon: IconValue): JSX.Element | null {
	if (!icon || !icon.value) {
		return null;
	}

	if (icon.library === 'svg') {
		// SVG URL
		return <img src={icon.value} alt="" className="voxel-icon-svg" />;
	}

	if (icon.library === 'icon') {
		// Icon font class (e.g., "las la-badge")
		return <i className={icon.value} aria-hidden="true" />;
	}

	return null;
}

/**
 * Default badge icon SVG (matches Voxel's badge.svg)
 */
function DefaultBadgeIcon(): JSX.Element {
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
		>
			<path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11zM12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
		</svg>
	);
}

/**
 * Default cog icon SVG (matches Voxel's cog.svg)
 */
function DefaultCogIcon(): JSX.Element {
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
		>
			<path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
		</svg>
	);
}

/**
 * Default switch icon SVG (matches Voxel's switch.svg)
 */
function DefaultSwitchIcon(): JSX.Element {
	return (
		<svg
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="24"
			height="24"
		>
			<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z" />
		</svg>
	);
}

export default function CurrentPlanComponent({
	attributes,
	planData,
	isLoading,
	error,
	context,
}: CurrentPlanComponentProps): JSX.Element {
	// Build vxconfig for re-rendering (required for Plan C+)
	const vxConfig: CurrentPlanVxConfig = {
		planIcon: attributes.planIcon ?? { library: '', value: '' },
		viewPlansIcon: attributes.viewPlansIcon ?? { library: '', value: '' },
		configureIcon: attributes.configureIcon ?? { library: '', value: '' },
		switchIcon: attributes.switchIcon ?? { library: '', value: '' },
		cancelIcon: attributes.cancelIcon ?? { library: '', value: '' },
		portalIcon: attributes.portalIcon ?? { library: '', value: '' },
	};

	// Render plan icon
	const planIconElement =
		renderIcon(attributes.planIcon) ?? <DefaultBadgeIcon />;

	// Render configure icon
	const configureIconElement =
		renderIcon(attributes.configureIcon) ?? <DefaultCogIcon />;

	// Render switch icon
	const switchIconElement =
		renderIcon(attributes.switchIcon) ?? <DefaultSwitchIcon />;

	// Loading state
	if (isLoading) {
		return (
			<>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-panel active-plan plan-panel">
					<div className="ac-head">
						{planIconElement}
						<b>{__('Current plan', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{__('Loading...', 'voxel-fse')}</p>
					</div>
				</div>
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
				<div className="ts-panel active-plan plan-panel">
					<div className="ac-head">
						{planIconElement}
						<b>{__('Current plan', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{error}</p>
					</div>
				</div>
			</>
		);
	}

	// Not logged in state
	if (!planData?.isLoggedIn) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>
				<div className="ts-panel active-plan plan-panel">
					<div className="ac-head">
						{planIconElement}
						<b>{__('Current plan', 'voxel-fse')}</b>
					</div>
					<div className="ac-body">
						<p>{__('Please log in to view your membership plan.', 'voxel-fse')}</p>
					</div>
				</div>
			</>
		);
	}

	// Check if this is an order-based membership with active subscription
	const isOrderMembership =
		planData.membershipType === 'order' &&
		planData.orderLink &&
		!planData.isSubscriptionCanceled;

	// Order-based membership view (with pricing and manage subscription)
	if (isOrderMembership && planData.pricing) {
		return (
			<>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				<div className="ts-panel active-plan plan-panel">
					{/* Panel head - matches Voxel's .ac-head */}
					<div className="ac-head">
						{planIconElement}
						<b>{__('Current plan', 'voxel-fse')}</b>
					</div>

					{/* Panel body - matches Voxel's .ac-body */}
					<div className="ac-body">
						{/* Pricing section - matches Voxel's .ac-plan-pricing */}
						<div className="ac-plan-pricing">
							<span className="ac-plan-price">
								{planData.pricing.formattedPrice}
							</span>
							<div className="ac-price-period">
								/ {planData.pricing.formattedPeriod}
							</div>
						</div>

						{/* Status message */}
						{planData.statusMessage && <p>{planData.statusMessage}</p>}

						{/* Plan label */}
						<p>
							{__('Your current plan is ', 'voxel-fse')}
							{planData.planLabel}
						</p>

						{/* Action buttons - matches Voxel's .ac-bottom */}
						<div className="ac-bottom">
							<ul className="simplify-ul current-plan-btn">
								{/* Manage subscription button */}
								<li>
									<a
										href={planData.orderLink ?? undefined}
										className="ts-btn ts-btn-1"
										onClick={
											context === 'editor'
												? (e: React.MouseEvent) => e.preventDefault()
												: undefined
										}
									>
										{configureIconElement}
										{__('Manage subscription', 'voxel-fse')}
									</a>
								</li>

								{/* Switch plan button */}
								{planData.switchPlanUrl && (
									<li>
										<a
											href={planData.switchPlanUrl}
											className="ts-btn ts-btn-1"
											onClick={
												context === 'editor'
													? (e: React.MouseEvent) => e.preventDefault()
													: undefined
											}
										>
											{switchIconElement}
											{__('Switch plan', 'voxel-fse')}
										</a>
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			</>
		);
	}

	// Default/Free plan view (simpler - just plan label and switch option)
	return (
		<>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			<div className="ts-panel active-plan plan-panel">
				{/* Panel head */}
				<div className="ac-head">
					{planIconElement}
					<b>{__('Current plan', 'voxel-fse')}</b>
				</div>

				{/* Panel body */}
				<div className="ac-body">
					{/* Plan label */}
					<p>
						{__('Your current plan is ', 'voxel-fse')}
						{planData.planLabel}
					</p>

					{/* Switch plan button */}
					{planData.switchPlanUrl && (
						<div className="ac-bottom">
							<ul className="simplify-ul current-plan-btn">
								<li>
									<a
										href={planData.switchPlanUrl}
										className="ts-btn ts-btn-1"
										onClick={
											context === 'editor'
												? (e: React.MouseEvent) => e.preventDefault()
												: undefined
										}
									>
										{switchIconElement}
										{__('Switch plan', 'voxel-fse')}
									</a>
								</li>
							</ul>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
