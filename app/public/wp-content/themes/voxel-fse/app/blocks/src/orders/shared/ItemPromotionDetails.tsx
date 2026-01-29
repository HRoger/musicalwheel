/**
 * Orders Block - Item Promotion Details Component
 *
 * Displays promotion package details within an order item with cancel functionality.
 * Matches Voxel's itemPromotionDetails Vue component.
 *
 * Reference: voxel-orders.beautified.js lines 120-190
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';
import type { ItemPromotionDetailsProps } from '../types';

declare const Voxel_Config: {
	l10n: {
		confirmAction: string;
		ajaxError: string;
	};
};

/**
 * Item Promotion Details Component
 *
 * Shows promotion package information (dates, status) and provides
 * a cancel button that calls the promotion cancellation API.
 */
export default function ItemPromotionDetails({
	item,
	order,
	config,
	onCancelPromotion,
	isRunningAction,
}: ItemPromotionDetailsProps) {
	const promotionPackage = item.details?.promotion_package;

	// If no promotion package, don't render
	if (!promotionPackage) {
		return null;
	}

	/**
	 * Handle cancel promotion click
	 * Reference: voxel-orders.beautified.js lines 140-165
	 */
	const handleCancelPromotion = useCallback(async () => {
		// Show confirmation dialog - matches Voxel's confirm() call
		const confirmMessage =
			typeof Voxel_Config !== 'undefined'
				? Voxel_Config.l10n.confirmAction
				: 'Are you sure you want to cancel this promotion?';

		if (!window.confirm(confirmMessage)) {
			return;
		}

		await onCancelPromotion();
	}, [onCancelPromotion]);

	/**
	 * Check if promotion has date range
	 * Reference: voxel-orders.beautified.js lines 177-180
	 */
	const hasDates = promotionPackage.start_date && promotionPackage.end_date;

	/**
	 * Format date range string
	 * Reference: voxel-orders.beautified.js lines 182-188
	 */
	const getDates = hasDates
		? `${promotionPackage.start_date} - ${promotionPackage.end_date}`
		: null;

	return (
		<div className="order-item-promotion-details">
			{/* Promotion Package Label */}
			<div className="promotion-label">
				<strong>{promotionPackage.label}</strong>
			</div>

			{/* Promoted Post Link */}
			{promotionPackage.post_title && promotionPackage.post_link && (
				<div className="promotion-post">
					<span>Promoted: </span>
					<a href={promotionPackage.post_link}>{promotionPackage.post_title}</a>
				</div>
			)}

			{/* Date Range */}
			{getDates && (
				<div className="promotion-dates">
					<span>{getDates}</span>
				</div>
			)}

			{/* Status Badge */}
			<div className={`promotion-status promotion-status--${promotionPackage.status}`}>
				{promotionPackage.status}
			</div>

			{/* Cancel Button - only show for active/pending promotions */}
			{(promotionPackage.status === 'active' || promotionPackage.status === 'pending') && (
				<button
					type="button"
					className="ts-btn ts-btn-1 ts-btn-small"
					onClick={handleCancelPromotion}
					disabled={isRunningAction}
				>
					{isRunningAction ? 'Cancelling...' : 'Cancel Promotion'}
				</button>
			)}
		</div>
	);
}
