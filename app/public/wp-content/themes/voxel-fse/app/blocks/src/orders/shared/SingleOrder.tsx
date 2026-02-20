/**
 * Orders Block - Single Order Component
 *
 * Displays single order details matching Voxel HTML structure.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';

import type { SingleOrderProps, OrderAction } from '../types';

/**
 * Type declarations for Voxel global objects
 */
declare const Voxel: {
	prompt?: (
		message: string,
		type: 'warning' | 'error' | 'success',
		buttons: Array<{ label: string; onClick: () => void }>,
		timeout?: number
	) => void;
};

declare const Voxel_Config: {
	l10n: {
		confirmAction: string;
		yes: string;
		no: string;
		ajaxError: string;
	};
};
import { renderIcon, currencyFormat, getStatusClass, getStatusLabel, getIconWithFallback } from './OrdersComponent';
import ItemPromotionDetails from './ItemPromotionDetails';

/**
 * Single Order Component
 */
export default function SingleOrder({
	order,
	config,
	attributes,
	isLoading,
	onBack,
	onAction,
	onCancelPromotion,
	onMessage,
}: SingleOrderProps) {
	const [runningAction, setRunningAction] = useState(false);
	const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
	const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

	// Ref for actions dropdown to blur after action execution
	// Reference: voxel-orders.beautified.js line 430 - self.$refs.actions?.blur()
	const actionsRef = useRef<HTMLAnchorElement>(null);

	// Scroll to top when single order view opens
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [order.id]);

	// Content truncation length from config (default 128)
	const contentLength = config?.data_inputs?.content_length ?? 128;

	/**
	 * Handle promotion cancellation for an order item
	 * Reference: voxel-orders.beautified.js lines 140-165
	 */
	const handleCancelPromotion = useCallback(async () => {
		setRunningAction(true);
		try {
			await onCancelPromotion(order.id);
		} finally {
			setRunningAction(false);
		}
	}, [order.id, onCancelPromotion]);

	// Handle action execution
	// Reference: voxel-orders.beautified.js lines 401-447 - runAction()
	const handleRunAction = useCallback(
		async (action: OrderAction) => {
			if (runningAction) return;

			/**
			 * Execute the action after confirmation (or immediately if no confirm)
			 * Reference: voxel-orders.beautified.js lines 404-431 - executeAction()
			 */
			const executeAction = async () => {
				setRunningAction(true);
				await onAction(action.action);
				setRunningAction(false);
				setActionsMenuOpen(false);

				// Blur actions dropdown after execution
				// Reference: voxel-orders.beautified.js line 430 - self.$refs.actions?.blur()
				actionsRef.current?.blur();
			};

			// Check for confirmation requirement
			// Reference: voxel-orders.beautified.js lines 434-446
			if (typeof action.confirm === 'string') {
				// Use Voxel.prompt() for styled confirmation dialogs when available
				if (typeof Voxel !== 'undefined' && typeof Voxel.prompt === 'function') {
					const confirmMessage = action.confirm || Voxel_Config?.l10n?.confirmAction || 'Are you sure?';
					const yesLabel = Voxel_Config?.l10n?.yes || 'Yes';
					const noLabel = Voxel_Config?.l10n?.no || 'No';

					Voxel.prompt(
						confirmMessage,
						'warning',
						[
							{ label: yesLabel, onClick: () => { executeAction(); } },
							{ label: noLabel, onClick: () => {} }
						],
						7500
					);
				} else {
					// Fallback to native confirm if Voxel.prompt is not available
					const confirmed = window.confirm(action.confirm);
					if (confirmed) {
						await executeAction();
					}
				}
			} else {
				// No confirmation required, execute immediately
				await executeAction();
			}
		},
		[onAction, runningAction]
	);

	// Toggle item expansion
	const toggleItemExpanded = useCallback((itemId: number) => {
		setExpandedItems((prev) => ({
			...prev,
			[itemId]: !prev[itemId],
		}));
	}, []);

	// Check if current user is vendor
	const isVendor = config?.is_vendor || config?.is_admin || false;

	return (
		<div className="vx-order-ease">
			<div className={`single-order ${(runningAction || isLoading) ? 'vx-pending' : ''}`}>
				{/* Order Head */}
				<div className="vx-order-head">
					{/* Back Button */}
					<a
						href="#"
						className="ts-btn ts-btn-1 ts-go-back"
						onClick={(e) => {
							e.preventDefault();
							onBack();
						}}
					>
						{renderIcon(getIconWithFallback(attributes.backIcon, 'backIcon'))}
						Go back
					</a>

					{/* DMS (Direct Messaging) Button */}
					{order.actions.dms.enabled && order.customer.id && order.actions.dms.vendor_target && onMessage && (
						<a
							href="#"
							className="ts-btn ts-btn-1 has-tooltip"
							data-tooltip={isVendor ? 'Message customer' : 'Message seller'}
							onClick={(e) => {
								e.preventDefault();
								onMessage(order);
							}}
						>
							{renderIcon(getIconWithFallback(attributes.inboxIcon, 'inboxIcon'))}
						</a>
					)}

					{/* Primary Actions */}
					{order.actions.primary.length > 0 && (
						<>
							{order.actions.primary.map((action, index) => (
								<a
									key={index}
									href="#"
									className="ts-btn ts-btn-2"
									onClick={(e) => {
										e.preventDefault();
										handleRunAction(action);
									}}
								>
									{action.action.endsWith('vendor.approve') && renderIcon(getIconWithFallback(attributes.checkmarkIcon, 'checkmarkIcon'))}
									{action.label}
								</a>
							))}
						</>
					)}

					{/* Secondary Actions (Menu) */}
					{order.actions.secondary.length > 0 && (
						<div className="ts-inline-filter">
							<a
								ref={actionsRef}
								href="#"
								className="ts-btn ts-btn-1 has-tooltip ts-popup-target"
								data-tooltip="More actions"
								onClick={(e) => {
									e.preventDefault();
									setActionsMenuOpen(!actionsMenuOpen);
								}}
							>
								{renderIcon(getIconWithFallback(attributes.menuIcon, 'menuIcon'))}
							</a>

							{actionsMenuOpen && (
								<div className="ts-field-popup ts-popup-active">
									<div className="ts-term-dropdown ts-md-group">
										<ul className="simplify-ul ts-term-dropdown-list min-scroll">
											{order.actions.secondary.map((action, index) => (
												<li key={index}>
													<a
														href="#"
														className="flexify"
														onClick={(e) => {
															e.preventDefault();
															handleRunAction(action);
														}}
													>
														<span>{action.label}</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Order Timeline */}
				<div className="order-timeline">
					{/* Order Event - Header */}
					<div className="order-event">
						{/* Customer Avatar */}
						{order.customer.avatar && (
							<a href={order.customer.link}>
								<div
									className="vx-avatar big-avatar"
									dangerouslySetInnerHTML={{ __html: order.customer.avatar }}
								/>
							</a>
						)}

						{/* Status Badge */}
						{order.status.key === 'completed' && order.shipping.enabled ? (
							<div className={`order-status ${order.shipping.status.class || 'vx-neutral'}`}>
								{order.shipping.status.label || order.shipping.status.key}
							</div>
						) : (
							<div className={`order-status ${getStatusClass(order.status.key, config)}`}>
								{getStatusLabel(order.status.key, config)}
							</div>
						)}

						{/* Order Title */}
						<h3>
							{order.customer.name} placed order #{order.id}
						</h3>

						{/* Date */}
						<span>{order.created_at}</span>
					</div>

					{/* Child Orders (for marketplace) */}
					{order.child_orders.length > 0 && (
						<div className="order-event ts-child-orders">
							<div className="vx-order-list">
								{order.child_orders.map((childOrder) => (
									<div
										key={childOrder.id}
										className={`vx-order-card vx-status-${childOrder.status}`}
									>
										<div className="vx-order-meta vx-order-title">
											{childOrder.vendor.avatar ? (
												<div
													className="vx-avatar"
													dangerouslySetInnerHTML={{ __html: childOrder.vendor.avatar }}
												/>
											) : (
												<div className="vx-avatar">
													<img src="/wp-content/themes/voxel/assets/images/platform.jpg" alt="" />
												</div>
											)}

											<b>
												{childOrder.item_count <= 1
													? `One item sold by ${childOrder.vendor.name}`
													: `${childOrder.item_count} items sold by ${childOrder.vendor.name}`}
											</b>
										</div>

										<div className="vx-order-meta">
											{childOrder.total !== null && (
												<span className="vx-hide-mobile">
													{currencyFormat(childOrder.total, childOrder.currency)}
												</span>
											)}
										</div>

										{childOrder.shipping_status !== null ? (
											<div className={`order-status ${config?.shipping_statuses?.[childOrder.shipping_status]?.class || 'vx-neutral'}`}>
												{config?.shipping_statuses?.[childOrder.shipping_status]?.label || childOrder.shipping_status}
											</div>
										) : (
											<div className={`order-status ${getStatusClass(childOrder.status, config)}`}>
												{getStatusLabel(childOrder.status, config)}
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Order Items */}
					<div className="order-event">
						<div className="order-event-box">
							{/* Cart Items */}
							{order.items.length > 0 && (
								<ul className="ts-cart-list simplify-ul">
									{order.items.map((item) => (
										<li key={item.id}>
											<div className="cart-image">
												<img
													width="150"
													height="150"
													src={item.product.thumbnail_url || '/wp-content/themes/voxel/assets/images/platform.jpg'}
													className="ts-status-avatar"
													alt={item.product.label}
												/>
											</div>
											<div className="cart-item-details">
												<div className="order-item-title">
													<a href={item.product.link}>{item.product.label}</a>
													<span>{currencyFormat(item.subtotal, item.currency)}</span>
												</div>
												<span>{item.product.description}</span>

												{/* Data Inputs */}
												<span
													className="cart-data-inputs"
													dangerouslySetInnerHTML={{
														__html: expandedItems[item.id]
															? item.data_inputs_markup
															: getTruncatedContent(item.data_inputs_markup, contentLength),
													}}
												/>

												{/* Expand/Collapse */}
												{hasLongContent(item.data_inputs_markup, contentLength) && (
													<span className="order-expand-details">
														<span onClick={() => toggleItemExpanded(item.id)}>
															{expandedItems[item.id] ? 'Collapse ▴' : 'Expand ▾'}
														</span>
													</span>
												)}

												{/* Promotion Package Details */}
												{/* Reference: voxel-orders.beautified.js lines 120-190 */}
												{item.details?.promotion_package && (
													<ItemPromotionDetails
														item={item}
														order={order}
														config={config}
														onCancelPromotion={handleCancelPromotion}
														isRunningAction={runningAction}
													/>
												)}
											</div>
										</li>
									))}
								</ul>
							)}

							{/* Pricing Breakdown */}
							<ul className="ts-cost-calculator simplify-ul flexify">
								{order.pricing.subtotal !== null && (
									<li className="ts-cost--subtotal">
										<div className="ts-item-name">
											<p>Subtotal</p>
										</div>
										<div className="ts-item-price">
											<p>{currencyFormat(order.pricing.subtotal, order.pricing.currency)}</p>
										</div>
									</li>
								)}

								{order.pricing.discount_amount !== null && (
									<li className="ts-cost--discount-amount">
										<div className="ts-item-name">
											<p>Discount</p>
										</div>
										<div className="ts-item-price">
											<p>{currencyFormat(order.pricing.discount_amount, order.pricing.currency)}</p>
										</div>
									</li>
								)}

								{order.pricing.tax_amount !== null && (
									<li className="ts-cost--tax-amount">
										<div className="ts-item-name">
											<p>Tax</p>
										</div>
										<div className="ts-item-price">
											<p>{currencyFormat(order.pricing.tax_amount, order.pricing.currency)}</p>
										</div>
									</li>
								)}

								{order.pricing.shipping_amount !== null && (
									<li className="ts-cost--shipping-amount">
										<div className="ts-item-name">
											<p>Shipping</p>
										</div>
										<div className="ts-item-price">
											<p>{currencyFormat(order.pricing.shipping_amount, order.pricing.currency)}</p>
										</div>
									</li>
								)}

								{order.pricing.total !== null && (
									<li className="ts-total">
										<div className="ts-item-name">
											<p>Total</p>
										</div>
										<div className="ts-item-price">
											<p>{currencyFormat(order.pricing.total, order.pricing.currency)}</p>
										</div>
									</li>
								)}

								{order.pricing.total !== null && order.pricing.subscription_interval !== null && (
									<li className="ts-cost--schedule">
										<div className="ts-item-name"></div>
										<div className="ts-item-price">
											<p>Renews {order.pricing.subscription_interval}</p>
										</div>
									</li>
								)}
							</ul>

							{/* Vendor Fees (for vendors) */}
							{order.vendor.fees && (
								<details className="order-accordion">
									<summary>
										Vendor fees
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									<div className="details-body">
										<ul className="ts-cost-calculator simplify-ul flexify ts-customer-details">
											{order.vendor.fees.breakdown.map((fee, index) => (
												<li key={index}>
													<div className="ts-item-name">
														<p>{fee.label}</p>
													</div>
													<div className="ts-item-price">
														<p>{fee.content}</p>
													</div>
												</li>
											))}
											<li className="ts-total">
												<div className="ts-item-name">
													<p>Total</p>
												</div>
												<div className="ts-item-price">
													<p>{currencyFormat(order.vendor.fees.total, order.pricing.currency)}</p>
												</div>
											</li>
										</ul>
									</div>
								</details>
							)}

							{/* Pricing Sections */}
							{order.pricing.sections.map((section, index) => (
								<details key={index} className="order-accordion">
									<summary>
										{section.label}
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									{section.type === 'list' && section.items && (
										<div className="details-body">
											<ul className="ts-cost-calculator simplify-ul flexify ts-customer-details">
												{section.items.map((item, itemIndex) => (
													<li key={itemIndex} className={item.bold ? 'ts-total' : ''}>
														<div className="ts-item-name">
															<p>{item.label}</p>
														</div>
														<div className="ts-item-price">
															<p>{item.content}</p>
														</div>
													</li>
												))}
											</ul>
										</div>
									)}
								</details>
							))}

							{/* Customer Details */}
							{order.customer.customer_details && order.customer.customer_details.length > 0 && (
								<details className="order-accordion">
									<summary>
										Customer details
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									<div className="details-body">
										<ul className="ts-cost-calculator simplify-ul flexify ts-customer-details">
											{order.customer.customer_details.map((detail, index) => (
												<li key={index}>
													<div className="ts-item-name">
														<p>{detail.label}</p>
													</div>
													<div className="ts-item-price">
														<p>{detail.content}</p>
													</div>
												</li>
											))}
										</ul>
									</div>
								</details>
							)}

							{/* Shipping Details */}
							{order.customer.shipping_details && order.customer.shipping_details.length > 0 && (
								<details className="order-accordion">
									<summary>
										Shipping details
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									<div className="details-body">
										<ul className="ts-cost-calculator simplify-ul flexify ts-customer-details">
											{order.customer.shipping_details.map((detail, index) => (
												<li key={index}>
													<div className="ts-item-name">
														<p>{detail.label}</p>
													</div>
													<div className="ts-item-price">
														<p>{detail.content}</p>
													</div>
												</li>
											))}
										</ul>
									</div>
								</details>
							)}

							{/* Order Notes */}
							{order.customer.order_notes && order.customer.order_notes.length > 0 && (
								<details className="order-accordion">
									<summary>
										Order notes
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									<div className="details-body">
										<p
											style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
											dangerouslySetInnerHTML={{ __html: order.customer.order_notes }}
										/>
									</div>
								</details>
							)}

							{/* Notes to Customer */}
							{order.vendor.notes_to_customer && order.vendor.notes_to_customer.length > 0 && (
								<details className="order-accordion">
									<summary>
										Notes to customer
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'))}
									</summary>
									<div className="details-body">
										<p
											style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
											dangerouslySetInnerHTML={{ __html: order.vendor.notes_to_customer }}
										/>
									</div>
								</details>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Helper to check if content is long
 */
function hasLongContent(html: string, maxLength: number = 128): boolean {
	const stripped = html.replace(/<[^>]*>/g, '');
	return stripped.length > maxLength;
}

/**
 * Helper to get truncated content
 * Default 128 matches Voxel: apply_filters('voxel/single_order/data_inputs/max_content_length', 128)
 */
function getTruncatedContent(html: string, maxLength: number = 128): string {
	const stripped = html.replace(/<[^>]*>/g, '');
	if (stripped.length <= maxLength) return html;

	// Find a good break point
	const truncated = stripped.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	const breakPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;

	return stripped.substring(0, breakPoint) + '...';
}
