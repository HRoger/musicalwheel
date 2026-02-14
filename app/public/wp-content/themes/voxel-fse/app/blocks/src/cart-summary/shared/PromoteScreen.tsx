/**
 * Promote Screen Component
 *
 * Renders the post promotion checkout UI matching Voxel's promote-screen.php 1:1.
 *
 * Evidence:
 * - Template: themes/voxel/templates/widgets/cart-summary/promote-screen.php
 * - Widget: themes/voxel/app/widgets/cart-summary.php:2562-2591
 * - JS: docs/block-conversions/cart-summary/product-summary-beautified.js:63-64
 *
 * @package VoxelFSE
 */

import { useState, useCallback } from 'react';
import { __ } from '@wordpress/i18n';
import { renderIcon } from '@shared/utils/renderIcon';
import type { PromoteConfig, PromotePackage } from '../types';
import type { IconValue } from '@shared/controls/IconPickerControl';
import { getSiteBaseUrl } from '@shared/utils/siteUrl';

interface PromoteScreenProps {
	config: PromoteConfig;
	currency: string;
	checkoutIcon?: IconValue;
}

/**
 * Currency format helper
 */
function currencyFormat(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
		}).format(amount);
	} catch {
		return `${currency} ${amount.toFixed(2)}`;
	}
}

/**
 * Get AJAX URL from Voxel config or fallback
 */
function getAjaxUrl(): string {
	const win = window as unknown as { Voxel_Config?: { ajax_url?: string } };
	if (typeof window !== 'undefined' && win.Voxel_Config?.ajax_url) {
		return win.Voxel_Config.ajax_url;
	}
	const baseUrl = getSiteBaseUrl();
	return baseUrl.replace('?vx=1', '');
}

export default function PromoteScreen({ config, currency, checkoutIcon }: PromoteScreenProps) {
	const packages = Object.values(config.packages);
	const [selected, setSelected] = useState<PromotePackage | null>(
		packages.length > 0 ? packages[0] : null
	);
	const [processing, setProcessing] = useState(false);

	/**
	 * Handle promotion checkout
	 * Evidence: product-summary-beautified.js:64
	 * POST /?vx=1&action=products.promotions.checkout
	 */
	const checkout = useCallback(async () => {
		if (!selected || processing) return;

		setProcessing(true);

		try {
			const ajaxUrl = getAjaxUrl();
			const formData = new FormData();
			formData.append('post_id', String(config.post_id));
			formData.append('promotion_package', selected.key);

			const response = await fetch(
				`${ajaxUrl}?vx=1&action=products.promotions.checkout&_wpnonce=${config.nonce.checkout}`,
				{
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				}
			);

			const data = await response.json() as {
				success: boolean;
				redirect_url?: string;
				message?: string;
			};

			if (data.success && data.redirect_url) {
				window.location.href = data.redirect_url;
			} else {
				const win = window as unknown as { Voxel?: { alert: (msg: string, type?: string) => void } };
				if (win.Voxel?.alert) {
					win.Voxel.alert(
						data.message || 'Checkout failed',
						'error'
					);
				} else {
					alert(data.message || 'Checkout failed');
				}
				setProcessing(false);
			}
		} catch (err) {
			console.error('Promote checkout error:', err);
			setProcessing(false);
		}
	}, [selected, processing, config]);

	return (
		<div className="ts-form ts-checkout ts-checkout-promotion">
			{/* Cart Head - Evidence: promote-screen.php:9-12 */}
			<div className="cart-head">
				<h1>
					{__('Promote', 'voxel-fse')} {config.post_title}
				</h1>
			</div>

			{/* Package Selection - Evidence: promote-screen.php:14-33 */}
			<div className="checkout-section form-field-grid">
				<div className="ts-form-group">
					<label>{__('Select promotion package', 'voxel-fse')}</label>
					<ul className="simplify-ul addon-cards flexify">
						{packages.map((pkg) => (
							<li
								key={pkg.key}
								className={`flexify${pkg === selected ? ' adc-selected' : ''}`}
								style={{ '--ts-accent-1': pkg.color } as React.CSSProperties}
								onClick={(e) => {
									e.preventDefault();
									setSelected(pkg);
								}}
							>
								{pkg.icon ? (
									<div
										className="card-icn"
										dangerouslySetInnerHTML={{ __html: pkg.icon }}
									/>
								) : (
									<div className="card-icn">
										<i className="las la-bolt" />
									</div>
								)}
								<div className="addon-details">
									<span className="adc-title">{pkg.label}</span>
									<span className="adc-subtitle">{pkg.description}</span>
									<div className="vx-addon-price">
										{currencyFormat(pkg.price_amount, currency)}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Checkout Button - Evidence: promote-screen.php:35-43 */}
			<div className="checkout-section">
				<a
					href="#"
					className={`ts-btn ts-btn-2 form-btn${processing ? ' ts-loading-btn' : ''}`}
					onClick={(e) => {
						e.preventDefault();
						if (!processing) {
							checkout();
						}
					}}
				>
					{processing && (
						<div className="ts-loader-wrapper">
							<span className="ts-loader" />
						</div>
					)}
					{renderIcon(checkoutIcon, 'checkoutIcon')}
					{__('Pay now', 'voxel-fse')}
				</a>
			</div>
		</div>
	);
}
