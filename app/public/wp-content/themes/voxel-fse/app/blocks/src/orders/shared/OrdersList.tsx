/**
 * Orders Block - Orders List Component
 *
 * Displays list of orders matching Voxel HTML structure.
 *
 * @package VoxelFSE
 */

import type { OrdersListProps, OrdersConfig, ShippingStatus, OrderListItem } from '../types';
import { renderIcon, renderNoResultsIcon, currencyFormat, getStatusClass, getStatusLabel, getIconWithFallback } from './OrdersComponent';

/**
 * Get shipping status class
 */
function getShippingStatusClass(status: ShippingStatus | null, config: OrdersConfig | null): string {
	if (!status || !config?.shipping_statuses) return 'vx-neutral';
	return config.shipping_statuses[status]?.class || 'vx-neutral';
}

/**
 * Get shipping status label
 */
function getShippingStatusLabel(status: ShippingStatus | null, config: OrdersConfig | null): string {
	if (!status || !config?.shipping_statuses) return status || '';
	return config.shipping_statuses[status]?.label || status;
}

/**
 * Get personalized order title
 * Matches Voxel: templates/widgets/orders.php:185-211
 */
function getOrderTitle(order: OrderListItem): string {
	const name = order.customer.name;
	if (order.item_count === 1 && order.product_type === 'voxel:listing_plan_subscription' && order.first_item_label) {
		return `${name} subscribed to ${order.first_item_label} listing plan`;
	}
	if (order.item_count === 1 && order.product_type === 'voxel:listing_plan_payment' && order.first_item_label) {
		return `${name} purchased ${order.first_item_label} listing plan`;
	}
	if (order.item_count === 1 && order.product_type === 'voxel:membership_plan' && order.first_item_label) {
		return `${name} subscribed to ${order.first_item_label} plan`;
	}
	if (order.item_count === 1 && order.product_type === 'voxel:claim_request' && order.first_item_claim_title) {
		return `${name} requested to claim ${order.first_item_claim_title}`;
	}
	if (order.item_count === 1 && order.product_type === 'voxel:claim_request') {
		return `${name} requested to claim a listing`;
	}
	if (order.item_count === 1 && order.first_item_type === 'booking' && order.first_item_label) {
		return `${name} booked ${order.first_item_label}`;
	}
	return `${name} placed an order ${order.created_at}`;
}

/**
 * Orders List Component
 */
export default function OrdersList({
	orders,
	config,
	attributes,
	isLoading,
	onOrderSelect,
	currentPage,
	totalPages,
	onPageChange,
}: OrdersListProps) {
	// Empty state - matches Voxel: templates/widgets/orders.php:221-224
	if (!orders || orders.length === 0) {
		return (
			<div className="ts-no-posts">
				{renderNoResultsIcon(attributes.noResultsIcon)}
				<p>No orders found</p>
			</div>
		);
	}

	const hasMore = currentPage < totalPages;
	const showPagination = currentPage > 1 || hasMore;

	return (
		<>
			<div className="vx-order-ease">
				<div className={`vx-order-list${isLoading ? ' vx-disabled' : ''}`}>
					{orders.map((order) => (
						<div
							key={order.id}
							className={`vx-order-card vx-status-${order.status}`}
							onClick={(e) => {
								e.preventDefault();
								onOrderSelect(order.id);
							}}
						>
							{/* Order Title Row - matches Voxel: templates/widgets/orders.php:180-188 */}
							<div className="vx-order-meta vx-order-title">
								{/* Avatar */}
								{order.customer.avatar && (
									<div
										className="vx-avatar"
										dangerouslySetInnerHTML={{ __html: order.customer.avatar }}
									/>
								)}

								{/* Order Badge */}
								<span className="order-badge vx-hide-mobile">#{order.id}</span>

								{/* Order Title - personalized per product type, matches Voxel: templates/widgets/orders.php:185-211 */}
								<b>{getOrderTitle(order)}</b>
							</div>

							{/* Order Meta Row - matches Voxel: templates/widgets/orders.php:190-198 */}
							<div className="vx-order-meta">
								{order.item_count > 1 && (
									<span className="vx-hide-mobile">{order.item_count} items</span>
								)}
								{typeof order.total === 'number' ? (
									<span className="vx-hide-mobile">
										{currencyFormat(order.total, order.currency)}
									</span>
								) : typeof order.subtotal === 'number' ? (
									<span className="vx-hide-mobile">
										{currencyFormat(order.subtotal, order.currency)}
									</span>
								) : null}
							</div>

							{/* Status Badge - matches Voxel: templates/widgets/orders.php:199-204 */}
							{order.status === 'completed' && order.shipping_status !== null ? (
								<div className={`order-status ${getShippingStatusClass(order.shipping_status, config)}`}>
									{getShippingStatusLabel(order.shipping_status, config)}
								</div>
							) : (
								<div className={`order-status ${getStatusClass(order.status, config)}`}>
									{getStatusLabel(order.status, config)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Pagination - matches Voxel: templates/widgets/orders.php:210-219 */}
			{showPagination && (
				<div className={`vx-order-more${isLoading ? ' vx-inert' : ''}`}>
					<a
						href="#"
						className={`ts-load-more ts-btn ts-btn-1${currentPage < 2 ? ' vx-disabled' : ''}`}
						onClick={(e) => {
							e.preventDefault();
							if (currentPage > 1) onPageChange(currentPage - 1);
						}}
					>
						{renderIcon(getIconWithFallback(attributes.backIcon, 'backIcon'))}
						Previous
					</a>
					<a
						href="#"
						className={`ts-load-more ts-btn ts-btn-1${!hasMore ? ' vx-disabled' : ''}`}
						onClick={(e) => {
							e.preventDefault();
							if (hasMore) onPageChange(currentPage + 1);
						}}
					>
						Next
						{renderIcon(getIconWithFallback(attributes.forwardIcon, 'forwardIcon'))}
					</a>
				</div>
			)}
		</>
	);
}
