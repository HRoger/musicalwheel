/**
 * Orders Block - Item Promotion Details Component
 *
 * Displays promotion package details within an order item with cancel functionality.
 * Matches Voxel's itemPromotionDetails Vue component exactly.
 *
 * Voxel HTML structure (from templates/widgets/orders/item-promotion-details.php):
 *   .order-event
 *     .order-event-icon.vx-blue > [info icon]
 *     <b> status title </b>
 *     <span> date range </span>
 *     .further-actions
 *       a.ts-btn.ts-btn-1 (View listing)
 *       a.ts-btn.ts-btn-1 (View stats)
 *       a.ts-btn.ts-btn-1 (Cancel promotion)
 *
 * Reference: voxel-orders.beautified.js lines 120-190
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';
import type { ItemPromotionDetailsProps } from '../types';
import { renderIcon } from '@shared/utils/renderIcon';

declare const Voxel_Config: {
	l10n: {
		confirmAction: string;
		ajaxError: string;
	};
};

/**
 * Item Promotion Details Component
 *
 * Matches Voxel's item-promotion-details.php template structure:
 * - Uses .order-event container (not custom classes)
 * - Renders info icon in .order-event-icon.vx-blue
 * - Status-conditional title text
 * - Date range display
 * - .further-actions with View listing, View stats, Cancel promotion links
 */
export default function ItemPromotionDetails({
	item,
	order,
	config,
	onCancelPromotion,
	isRunningAction,
	infoIcon,
}: ItemPromotionDetailsProps) {
	const promotionPackage = item.details?.promotion_package;

	/**
	 * Handle cancel promotion click
	 * Reference: voxel-orders.beautified.js lines 140-165
	 */
	const handleCancelPromotion = useCallback(async (e: React.MouseEvent) => {
		e.preventDefault();

		const confirmMessage =
			typeof Voxel_Config !== 'undefined'
				? Voxel_Config.l10n.confirmAction
				: 'Are you sure you want to cancel this promotion?';

		if (!window.confirm(confirmMessage)) {
			return;
		}

		await onCancelPromotion();
	}, [onCancelPromotion]);

	// Placed AFTER hooks to comply with React Rules of Hooks.
	if (!promotionPackage) {
		return null;
	}

	const hasDates = promotionPackage.start_date && promotionPackage.end_date;
	const getDates = hasDates
		? `${promotionPackage.start_date} - ${promotionPackage.end_date}`
		: null;

	/**
	 * Get status title text matching Voxel's template conditionals
	 * Reference: item-promotion-details.php template v-if/v-else-if chains
	 */
	const getStatusTitle = (): string => {
		switch (promotionPackage.status) {
			case 'cancelled':
				return 'Promotion canceled';
			case 'expired':
				return 'Promotion has ended';
			case 'active':
				return promotionPackage.assigned_to_post
					? 'Promotion is active'
					: 'Promotion details';
			default:
				return 'Promotion details';
		}
	};

	return (
		<div className="order-event">
			{/* Info icon — matches .order-event-icon.vx-blue */}
			<div className="order-event-icon vx-blue">
				{infoIcon ? renderIcon(infoIcon) : <i className="las la-info-circle"></i>}
			</div>

			{/* Status title */}
			<b>{getStatusTitle()}</b>

			{/* Date range */}
			{getDates && <span>{getDates}</span>}

			{/* Action links — matches .further-actions */}
			<div className="further-actions">
				{promotionPackage.post_link && (
					<a href={promotionPackage.post_link} target="_blank" rel="noopener noreferrer" className="ts-btn ts-btn-1">
						View listing
					</a>
				)}
				{promotionPackage.stats_link && (
					<a href={promotionPackage.stats_link} target="_blank" rel="noopener noreferrer" className="ts-btn ts-btn-1">
						View stats
					</a>
				)}
				{promotionPackage.status === 'active' && promotionPackage.assigned_to_post && (
					<a
						href="#"
						className={`ts-btn ts-btn-1${isRunningAction ? ' vx-pending' : ''}`}
						onClick={handleCancelPromotion}
					>
						Cancel promotion
					</a>
				)}
			</div>
		</div>
	);
}
