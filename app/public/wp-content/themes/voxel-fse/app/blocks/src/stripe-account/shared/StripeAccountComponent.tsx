/**
 * Stripe Account Component
 *
 * Shared component for editor and frontend rendering.
 * Matches Voxel's HTML structure 1:1 for CSS inheritance.
 *
 * @package VoxelFSE
 */

import { useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';

import type {
	StripeAccountAttributes,
	StripeAccountConfig,
	ScreenType,
	ShippingZone,
	ShippingRate,
} from '../types';

import ShippingScreen from './ShippingScreen';

/**
 * Component props
 */
interface StripeAccountComponentProps {
	attributes: StripeAccountAttributes;
	config: StripeAccountConfig;
	context: 'editor' | 'frontend';
	onSaveShipping?: (zones: ShippingZone[], rates: ShippingRate[]) => Promise<void>;
}

/**
 * Render icon from icon value string
 */
function renderIcon(iconValue: string | undefined, fallbackClass?: string): JSX.Element | null {
	if (!iconValue && !fallbackClass) return null;

	const value = iconValue || fallbackClass || '';

	// Check if it's an SVG URL
	if (value.startsWith('svg:')) {
		const url = value.substring(4);
		return <img src={url} alt="" className="ts-icon" />;
	}

	// It's an icon class
	return <i className={value} />;
}

/**
 * Get default Stripe Connect image URL
 */
function getDefaultImageUrl(): string {
	// This would typically come from the theme directory
	// In production, this should be passed via config
	return '/wp-content/themes/voxel/assets/images/Connect-social-card.png';
}

/**
 * Main Stripe Account Component
 */
export default function StripeAccountComponent({
	attributes,
	config,
	context,
	onSaveShipping,
}: StripeAccountComponentProps) {
	const [screen, setScreen] = useState<ScreenType>('main');
	const [savingShipping, setSavingShipping] = useState(false);

	// Local state for shipping configuration
	const [shippingZones, setShippingZones] = useState<ShippingZone[]>(
		config.shipping_zones || []
	);
	const [shippingRates, setShippingRates] = useState<ShippingRate[]>(
		config.shipping_rates || []
	);

	// Get image URL with fallback
	const imageUrl = attributes.genImage?.url || config.icons?.setup || getDefaultImageUrl();

	// Handle save shipping
	const handleSaveShipping = useCallback(async () => {
		if (savingShipping || !onSaveShipping) return;

		setSavingShipping(true);
		try {
			await onSaveShipping(shippingZones, shippingRates);
		} finally {
			setSavingShipping(false);
		}
	}, [savingShipping, onSaveShipping, shippingZones, shippingRates]);

	// Determine account status and messages
	const isAdmin = config.is_admin;
	const adminOnboardingEnabled = config.admin_onboarding_enabled;
	const account = config.account;

	// Get status message
	const getStatusMessage = (): string => {
		if (isAdmin && !adminOnboardingEnabled) {
			return __('Stripe vendor onboarding is not necessary for admin accounts.', 'voxel-fse');
		}
		if (account.charges_enabled) {
			return __('Your account is ready to accept payments.', 'voxel-fse');
		}
		if (account.details_submitted) {
			return __('Your account is pending verification.', 'voxel-fse');
		}
		return __('Setup your Stripe vendor account in order to accept payments.', 'voxel-fse');
	};

	// Re-render vxconfig for DevTools visibility (Plan C+ pattern)
	const vxConfig = {
		genImage: attributes.genImage || { id: 0, url: '' },
		icons: config.icons,
	};

	return (
		<>
			{/* vxconfig re-render for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Main Screen - matches Voxel's HTML structure exactly */}
			{screen === 'main' && (
				<div className="ts-panel">
					{/* Header Image */}
					<img
						src={imageUrl}
						alt=""
						style={{ width: '100%', height: 'auto', borderRadius: '8px 8px 0 0' }}
					/>

					<div className="ac-body">
						{/* Status Message */}
						{(isAdmin && !adminOnboardingEnabled) ? (
							<p>{getStatusMessage()}</p>
						) : (
							<>
								<p>{getStatusMessage()}</p>

								{/* Action Buttons based on account status */}
								{!account.exists ? (
									// Account doesn't exist - Show setup button
									<div className="ac-bottom">
										<ul className="simplify-ul current-plan-btn">
											<li>
												<a
													href={config.onboard_link}
													className="ts-btn ts-btn-1 ts-btn-large"
												>
													{renderIcon(config.icons?.setup, 'las la-plus')}
													{__('Start setup', 'voxel-fse')}
												</a>
											</li>
										</ul>
									</div>
								) : !account.details_submitted ? (
									// Account exists but details not submitted - Show complete onboarding
									<div className="ac-bottom">
										<ul className="simplify-ul current-plan-btn">
											<li>
												<a
													href={config.onboard_link}
													className="ts-btn ts-btn-1 ts-btn-large"
												>
													{renderIcon(config.icons?.submit, 'las la-info-circle')}
													{__('Complete onboarding', 'voxel-fse')}
												</a>
											</li>
										</ul>
									</div>
								) : (
									// Account fully set up - Show dashboard and update options
									<>
										<div className="ac-bottom">
											<ul className="simplify-ul current-plan-btn">
												<li>
													<a
														href={config.dashboard_link}
														target="_blank"
														rel="noopener noreferrer"
														className="ts-btn ts-btn-1 ts-btn-large"
													>
														{renderIcon(config.icons?.stripe, 'lab la-stripe')}
														{__('Stripe Express Dashboard', 'voxel-fse')}
													</a>
												</li>
											</ul>
										</div>
										<div className="ac-bottom">
											<ul className="simplify-ul current-plan-btn">
												<li>
													<a
														href={config.onboard_link}
														className="ts-btn ts-btn-1 ts-btn-large"
													>
														{renderIcon(config.icons?.update, 'las la-pen')}
														{__('Update information', 'voxel-fse')}
													</a>
												</li>
												{config.shipping_enabled && (
													<li>
														<a
															href="#"
															className="ts-btn ts-btn-1 ts-btn-large"
															onClick={(e) => {
																e.preventDefault();
																setScreen('shipping');
															}}
														>
															{renderIcon(config.icons?.shipping, 'las la-shipping-fast')}
															{__('Configure shipping', 'voxel-fse')}
														</a>
													</li>
												)}
											</ul>
										</div>
									</>
								)}
							</>
						)}
					</div>
				</div>
			)}

			{/* Shipping Screen */}
			{screen === 'shipping' && config.shipping_enabled && (
				<ShippingScreen
					config={config}
					zones={shippingZones}
					rates={shippingRates}
					onZonesChange={setShippingZones}
					onRatesChange={setShippingRates}
					onGoBack={() => setScreen('main')}
					onSave={handleSaveShipping}
					saving={savingShipping}
					context={context}
				/>
			)}
		</>
	);
}
