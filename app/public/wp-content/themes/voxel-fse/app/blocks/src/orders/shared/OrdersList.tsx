/**
 * Orders Block - Orders List Component
 *
 * Displays list of orders matching Voxel HTML structure.
 *
 * @package VoxelFSE
 */

import type { OrdersListProps, OrdersConfig, ShippingStatus } from '../types';
import { renderIcon, currencyFormat, getStatusClass, getStatusLabel, getIconWithFallback } from './OrdersComponent';

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
 * Orders List Component
 */
export default function OrdersList({
	orders,
	config,
	attributes,
	isLoading,
	onOrderSelect,
}: OrdersListProps) {
	// Empty state
	if (!orders || orders.length === 0) {
		return (
			<div className="ts-no-posts">
				{renderIcon(getIconWithFallback(attributes.noResultsIcon, 'noResultsIcon'))}
				<p>No orders found</p>
			</div>
		);
	}

	return (
		<div className="vx-order-list">
			{orders.map((order) => (
				<div
					key={order.id}
					className={`vx-order-card vx-status-${order.status}`}
					onClick={() => onOrderSelect(order.id)}
					style={{
						cursor: 'pointer',
						backgroundColor: attributes.cardBackground || undefined,
						borderRadius: attributes.cardBorderRadius ? `${attributes.cardBorderRadius}px` : undefined,
					}}
				>
					{/* Order Title Row */}
					<div className="vx-order-meta vx-order-title">
						{/* Avatar */}
						{order.customer.avatar ? (
							<div
								className="vx-avatar"
								dangerouslySetInnerHTML={{ __html: order.customer.avatar }}
							/>
						) : order.vendor.avatar ? (
							<div
								className="vx-avatar"
								dangerouslySetInnerHTML={{ __html: order.vendor.avatar }}
							/>
						) : (
							<div className="vx-avatar">
								<span className="vx-avatar-placeholder">{order.customer.name?.charAt(0) || '?'}</span>
							</div>
						)}

						{/* Order Badge */}
						<span className="order-badge">#{order.id}</span>

						{/* Order Title */}
						<b>
							{order.item_count === 1
								? 'One item'
								: `${order.item_count} items`}
						</b>
					</div>

					{/* Order Meta Row */}
					<div className="vx-order-meta">
						{/* Date */}
						<span className="vx-hide-mobile">{order.created_at}</span>

						{/* Total */}
						{order.total !== null && (
							<span className="vx-hide-mobile">
								{currencyFormat(order.total, order.currency)}
							</span>
						)}
					</div>

					{/* Status Badge */}
					{order.shipping_status !== null ? (
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
	);
}
