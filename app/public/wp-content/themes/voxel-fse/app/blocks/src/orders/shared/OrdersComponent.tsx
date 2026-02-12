/**
 * Orders Block - Shared Component
 *
 * Reference: docs/block-conversions/orders/voxel-orders.beautified.js (1,249 lines)
 *
 * VOXEL PARITY: 100%
 * ✅ HTML structure matches (vx-orders-widget, widget-head, vx-order-filters)
 * ✅ CSS classes match exactly (ts-form, ts-search-widget, ts-filter-wrapper)
 * ✅ Status filter dropdown matches
 * ✅ Shipping status filter - setShippingStatus() implemented
 * ✅ Product type filter dropdown matches
 * ✅ Search input matches
 * ✅ Loading state matches (.ts-loader)
 * ✅ Empty state matches (.ts-no-posts)
 * ✅ Single order view (via SingleOrder component)
 * ✅ Order actions handling
 * ✅ URL state persistence - getSearchParam/setSearchParam implemented
 * ✅ Direct messaging - openConversation() implemented
 * ✅ Content truncation - HTML-preserving truncate() implemented
 * ✅ Reset filters - resetFilters() implemented
 * ✅ File upload component - FileUpload.tsx (drag & drop, media library)
 * ✅ Promotion cancellation - ItemPromotionDetails.tsx
 *
 * NEXT.JS READINESS:
 * ✅ Props-based component (config via props)
 * ✅ Context parameter for editor vs frontend behavior
 * ✅ No jQuery dependencies
 * ✅ TypeScript strict mode compatible
 * ✅ Callback props for all interactions
 * ✅ URL helpers abstracted for easy replacement
 *
 * Evidence:
 * - Voxel Vue.js: Vue.createApp({ methods: { getOrders(), viewOrder(), runAction()... }})
 * - API endpoints: products.orders.list, products.single_order.get, etc.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import type {
	OrdersComponentProps,
	OrdersBlockAttributes,
	OrdersConfig,
	OrderListItem,
	Order,
	OrderStatus,
	BlockContext,
} from '../types';
import type { IconValue } from '@shared/controls/IconPickerControl';
import { getIconWithFallback as getIconWithFallbackBase } from '@shared/utils';

import OrdersList from './OrdersList';
import SingleOrder from './SingleOrder';

// ============================================================================
// DEFAULT ICONS (fallbacks when no custom icon is set)
// ============================================================================

/**
 * Default icons for the Orders block.
 * These are used as fallbacks when the user hasn't selected a custom icon.
 * Matches the fallback values in frontend.tsx normalizeConfig().
 */
export const ORDERS_ICON_DEFAULTS: Record<string, IconValue> = {
	searchIcon: { library: 'icon', value: 'las la-search' },
	noResultsIcon: { library: 'icon', value: 'las la-inbox' },
	resetSearchIcon: { library: 'icon', value: 'las la-sync' },
	backIcon: { library: 'icon', value: 'las la-angle-left' },
	forwardIcon: { library: 'icon', value: 'las la-angle-right' },
	downIcon: { library: 'icon', value: 'las la-angle-down' },
	inboxIcon: { library: 'icon', value: 'las la-inbox' },
	checkmarkIcon: { library: 'icon', value: 'las la-check' },
	menuIcon: { library: 'icon', value: 'las la-ellipsis-h' },
	infoIcon: { library: 'icon', value: 'las la-info-circle' },
	filesIcon: { library: 'icon', value: 'las la-file' },
	trashIcon: { library: 'icon', value: 'las la-trash' },
	calendarIcon: { library: 'icon', value: 'las la-calendar' },
};

/**
 * Get icon with fallback to default if no custom icon is set.
 * Uses the shared utility with Orders-specific defaults.
 * Exported for use in sub-components (SingleOrder, OrdersList).
 */
export function getIconWithFallback(icon: IconValue | undefined, key: string): IconValue {
	return getIconWithFallbackBase(icon, ORDERS_ICON_DEFAULTS[key] || { library: '', value: '' });
}

// ============================================================================
// URL STATE HELPERS (matches Voxel.setSearchParam/getSearchParam/deleteSearchParam)
// ============================================================================

/**
 * Get a search parameter from the URL
 */
function getSearchParam(key: string): string | null {
	if (typeof window === 'undefined') return null;
	const params = new URLSearchParams(window.location.search);
	return params.get(key);
}

/**
 * Set a search parameter in the URL (without page reload)
 */
function setSearchParam(key: string, value: string | number): void {
	if (typeof window === 'undefined') return;
	const url = new URL(window.location.href);
	url.searchParams.set(key, String(value));
	window.history.replaceState({}, '', url.toString());
}

/**
 * Delete a search parameter from the URL
 */
function deleteSearchParam(key: string): void {
	if (typeof window === 'undefined') return;
	const url = new URL(window.location.href);
	url.searchParams.delete(key);
	window.history.replaceState({}, '', url.toString());
}

/**
 * Show Voxel alert notification
 */
function showAlert(message: string, type: 'error' | 'success' = 'error'): void {
	const win = window as unknown as { Voxel?: { alert?: (msg: string, t: string) => void } };
	if (win.Voxel?.alert) {
		win.Voxel.alert(message, type);
	} else {
		if (type === 'error') {
			console.error(message);
		} else {
			console.log(message);
		}
	}
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Render icon from IconValue
 */
export function renderIcon(icon: IconValue | undefined, className?: string): JSX.Element | null {
	if (!icon || !icon.value) return null;

	if (icon.library === 'svg') {
		return <img src={icon.value} alt="" className={className} />;
	}

	return <i className={`${icon.value} ${className || ''}`} />;
}

/**
 * Truncate HTML content while preserving structure
 * Matches Voxel's truncate() function from beautified reference lines 455-501
 */
export function truncateHtml(html: string, maxLength: number = 200): { content: string; truncated: boolean } {
	const container = document.createElement('div');
	container.innerHTML = html;

	let truncated = false;
	let currentLength = 0;

	const processNode = (node: Node): void => {
		if (truncated) {
			node.parentNode?.removeChild(node);
			return;
		}

		const childNodes = Array.from(node.childNodes);

		if (childNodes.length) {
			childNodes.forEach((child) => processNode(child));
		} else {
			// Text node
			currentLength += (node.textContent || '').length;

			if (currentLength >= maxLength) {
				truncated = true;

				if (currentLength > maxLength) {
					const excess = currentLength - maxLength;
					node.textContent = (node.textContent || '').slice(0, -excess);
				}

				node.textContent += '…';
			}
		}
	};

	processNode(container);

	return {
		content: container.innerHTML,
		truncated,
	};
}

/**
 * Replace template variables in a string
 * Matches Voxel's replace_vars() from beautified reference lines 313-318
 */
function replaceVars(template: string, vars: Record<string, string | number>): string {
	let result = template;
	Object.keys(vars).forEach((key) => {
		result = result.replaceAll(key, String(vars[key]));
	});
	return result;
}

/**
 * Format currency using Voxel.helpers.currencyFormat when available
 * Reference: voxel-orders.beautified.js lines 976-978
 *
 * Falls back to Intl.NumberFormat for Next.js compatibility
 */
export function currencyFormat(amount: number, currency: string): string {
	// Use Voxel.helpers.currencyFormat if available (matches Voxel behavior exactly)
	const win = window as unknown as {
		Voxel?: {
			helpers?: {
				currencyFormat?: (amount: number, currency: string) => string;
			};
		};
	};

	if (win.Voxel?.helpers?.currencyFormat) {
		return win.Voxel.helpers.currencyFormat(amount, currency);
	}

	// Fallback for Next.js or when Voxel is not available
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: currency.toUpperCase(),
		}).format(amount / 100); // Voxel stores amounts in cents
	} catch {
		return `${currency} ${(amount / 100).toFixed(2)}`;
	}
}

/**
 * Get status class based on order status
 */
export function getStatusClass(status: OrderStatus, config: OrdersConfig | null): string {
	if (!config?.statuses_ui) return 'vx-neutral';
	return config.statuses_ui[status]?.class || 'vx-neutral';
}

/**
 * Get status label
 */
export function getStatusLabel(status: OrderStatus, config: OrdersConfig | null): string {
	if (!config?.statuses) return status;
	return config.statuses[status]?.label || status;
}

/**
 * Orders Component Props with defaults
 */
interface OrdersComponentState {
	searchQuery: string;
	statusFilter: OrderStatus | null;
	shippingStatusFilter: string | null;
	productTypeFilter: string | null;
	statusDropdownOpen: boolean;
	shippingStatusDropdownOpen: boolean;
	productTypeDropdownOpen: boolean;
	parentOrderId: number | null;
}

/**
 * Extended props for Orders Component with shipping status
 */
interface ExtendedOrdersComponentProps extends OrdersComponentProps {
	onShippingStatusFilter?: (status: string | null) => void;
	onCancelPromotion?: (orderId: number) => Promise<void>;
}

/**
 * Main Orders Component
 */
export default function OrdersComponent({
	attributes,
	config,
	orders,
	currentOrder,
	context,
	isLoading,
	error,
	currentPage,
	totalPages,
	onSearch,
	onStatusFilter,
	onShippingStatusFilter,
	onProductTypeFilter,
	onOrderSelect,
	onOrderBack,
	onOrderAction,
	onPageChange,
	onCancelPromotion,
}: ExtendedOrdersComponentProps) {
	// Initialize from URL params on mount
	const initializedRef = useRef(false);

	// Local state for filter dropdowns
	const [state, setState] = useState<OrdersComponentState>({
		searchQuery: '',
		statusFilter: null,
		shippingStatusFilter: null,
		productTypeFilter: null,
		statusDropdownOpen: false,
		shippingStatusDropdownOpen: false,
		productTypeDropdownOpen: false,
		parentOrderId: null,
	});

	/**
	 * Inject Voxel Orders CSS for both Editor and Frontend
	 */
	useEffect(() => {
		const cssId = 'voxel-orders-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';

			// Get site URL from Voxel config or fallback to origin
			const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
			// Ensure no trailing slash for consistency
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');

			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/orders.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Initialize state from URL params (matches Voxel's getInitialOrders())
	useEffect(() => {
		if (initializedRef.current || context === 'editor') return;
		initializedRef.current = true;

		const statusParam = getSearchParam('status');
		const shippingParam = getSearchParam('shipping_status');
		const productTypeParam = getSearchParam('product_type');
		const searchParam = getSearchParam('search');
		const orderIdParam = getSearchParam('order_id');
		const parentIdParam = getSearchParam('parent_id');

		// Apply URL params to state
		setState((prev) => ({
			...prev,
			statusFilter: statusParam && config?.statuses?.[statusParam as OrderStatus] ? (statusParam as OrderStatus) : null,
			shippingStatusFilter: shippingParam && config?.shipping_statuses?.[shippingParam] ? shippingParam : null,
			productTypeFilter: productTypeParam || null,
			searchQuery: searchParam || '',
			parentOrderId: parentIdParam ? parseInt(parentIdParam, 10) : null,
		}));

		// If order_id param exists, load that order
		if (orderIdParam && onOrderSelect) {
			const orderId = parseInt(orderIdParam, 10);
			if (!isNaN(orderId) && orderId > 0) {
				onOrderSelect(orderId);
			}
		}

		// Apply filters from URL
		if (statusParam && onStatusFilter) {
			onStatusFilter(statusParam as OrderStatus);
		}
		if (shippingParam && onShippingStatusFilter) {
			onShippingStatusFilter(shippingParam);
		}
		if (productTypeParam && onProductTypeFilter) {
			onProductTypeFilter(productTypeParam);
		}
		if (searchParam && onSearch) {
			onSearch(searchParam);
		}
	}, [config, context, onSearch, onStatusFilter, onShippingStatusFilter, onProductTypeFilter, onOrderSelect]);

	// Handle search input with URL persistence
	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setState((prev) => ({ ...prev, searchQuery: value }));

			// Update URL
			if (value) {
				setSearchParam('search', value);
			} else {
				deleteSearchParam('search');
			}

			if (onSearch) {
				onSearch(value);
			}
		},
		[onSearch]
	);

	// Handle search reset - matches Voxel's resetFilters()
	const handleResetSearch = useCallback(() => {
		// Check if anything needs resetting
		if (
			state.searchQuery === '' &&
			state.statusFilter === null &&
			state.shippingStatusFilter === null &&
			state.productTypeFilter === null
		) {
			return;
		}

		setState((prev) => ({
			...prev,
			searchQuery: '',
			statusFilter: null,
			shippingStatusFilter: null,
			productTypeFilter: null,
		}));

		// Clear URL params
		deleteSearchParam('search');
		deleteSearchParam('status');
		deleteSearchParam('shipping_status');
		deleteSearchParam('product_type');
		deleteSearchParam('pg');

		if (onSearch) onSearch('');
		if (onStatusFilter) onStatusFilter(null);
		if (onShippingStatusFilter) onShippingStatusFilter(null);
		if (onProductTypeFilter) onProductTypeFilter(null);
	}, [state, onSearch, onStatusFilter, onShippingStatusFilter, onProductTypeFilter]);

	// Handle status filter with URL persistence
	const handleStatusSelect = useCallback(
		(status: OrderStatus | null) => {
			setState((prev) => ({
				...prev,
				statusFilter: status,
				statusDropdownOpen: false,
			}));

			// Update URL
			if (status && status !== 'all') {
				setSearchParam('status', status);
			} else {
				deleteSearchParam('status');
			}
			deleteSearchParam('pg'); // Reset to page 1

			if (onStatusFilter) {
				onStatusFilter(status);
			}
		},
		[onStatusFilter]
	);

	// Handle shipping status filter with URL persistence
	const handleShippingStatusSelect = useCallback(
		(status: string | null) => {
			setState((prev) => ({
				...prev,
				shippingStatusFilter: status,
				shippingStatusDropdownOpen: false,
			}));

			// Update URL
			if (status && status !== 'all') {
				setSearchParam('shipping_status', status);
			} else {
				deleteSearchParam('shipping_status');
			}
			deleteSearchParam('pg'); // Reset to page 1

			if (onShippingStatusFilter) {
				onShippingStatusFilter(status);
			}
		},
		[onShippingStatusFilter]
	);

	// Handle product type filter with URL persistence
	const handleProductTypeSelect = useCallback(
		(productType: string | null) => {
			setState((prev) => ({
				...prev,
				productTypeFilter: productType,
				productTypeDropdownOpen: false,
			}));

			// Update URL
			if (productType && productType !== 'all') {
				setSearchParam('product_type', productType);
			} else {
				deleteSearchParam('product_type');
			}
			deleteSearchParam('pg'); // Reset to page 1

			if (onProductTypeFilter) {
				onProductTypeFilter(productType);
			}
		},
		[onProductTypeFilter]
	);

	// Toggle dropdowns
	const toggleStatusDropdown = useCallback(() => {
		setState((prev) => ({
			...prev,
			statusDropdownOpen: !prev.statusDropdownOpen,
			shippingStatusDropdownOpen: false,
			productTypeDropdownOpen: false,
		}));
	}, []);

	const toggleShippingStatusDropdown = useCallback(() => {
		setState((prev) => ({
			...prev,
			shippingStatusDropdownOpen: !prev.shippingStatusDropdownOpen,
			statusDropdownOpen: false,
			productTypeDropdownOpen: false,
		}));
	}, []);

	const toggleProductTypeDropdown = useCallback(() => {
		setState((prev) => ({
			...prev,
			productTypeDropdownOpen: !prev.productTypeDropdownOpen,
			statusDropdownOpen: false,
			shippingStatusDropdownOpen: false,
		}));
	}, []);

	// Open direct message conversation - matches Voxel's openConversation()
	const openConversation = useCallback(
		(order: Order) => {
			if (!config?.messages?.url) return;

			const isVendor = order.current_user?.id === order.vendor?.id;
			const url = new URL(config.messages.url);

			if (isVendor) {
				// Vendor contacting customer
				url.searchParams.set('chat', `u${order.customer?.id}`);
				url.searchParams.set(
					'text',
					replaceVars(config.messages.enquiry_text?.vendor || 'Order #@order_id inquiry', {
						'@order_id': order.id,
					})
				);
			} else {
				// Customer contacting vendor
				url.searchParams.set('chat', order.actions?.dms?.vendor_target || `u${order.vendor?.id}`);
				url.searchParams.set(
					'text',
					replaceVars(config.messages.enquiry_text?.customer || 'Question about order #@order_id', {
						'@order_id': order.id,
					})
				);
			}

			window.location.href = url.toString();
		},
		[config]
	);

	// Handle order select with URL persistence
	const handleOrderSelectWithUrl = useCallback(
		(orderId: number) => {
			setSearchParam('order_id', orderId);
			if (onOrderSelect) {
				onOrderSelect(orderId);
			}
		},
		[onOrderSelect]
	);

	// Handle order back with URL persistence
	const handleOrderBackWithUrl = useCallback(() => {
		deleteSearchParam('order_id');
		deleteSearchParam('parent_id');

		// If we came from a parent order, navigate back to it
		if (state.parentOrderId && onOrderSelect) {
			onOrderSelect(state.parentOrderId);
			setState((prev) => ({ ...prev, parentOrderId: null }));
		} else {
			if (onOrderBack) {
				onOrderBack();
			}
		}
	}, [state.parentOrderId, onOrderSelect, onOrderBack]);

	// Handle page change with URL persistence
	const handlePageChangeWithUrl = useCallback(
		(page: number) => {
			if (page > 1) {
				setSearchParam('pg', page);
			} else {
				deleteSearchParam('pg');
			}
			if (onPageChange) {
				onPageChange(page);
			}
		},
		[onPageChange]
	);

	// Get status filter label
	const statusFilterLabel = useMemo(() => {
		if (state.statusFilter && config?.statuses) {
			return config.statuses[state.statusFilter]?.label || 'Status';
		}
		return 'Status';
	}, [state.statusFilter, config]);

	// Get shipping status filter label
	const shippingStatusFilterLabel = useMemo(() => {
		if (state.shippingStatusFilter && config?.shipping_statuses) {
			return config.shipping_statuses[state.shippingStatusFilter]?.label || 'Shipping';
		}
		return 'Shipping';
	}, [state.shippingStatusFilter, config]);

	// Get product type filter label
	const productTypeFilterLabel = useMemo(() => {
		if (state.productTypeFilter && config?.product_types) {
			const productType = config.product_types.find(
				(pt) => pt.key === state.productTypeFilter
			);
			return productType?.label || 'Product type';
		}
		return 'Product type';
	}, [state.productTypeFilter, config]);

	// Check if any filters are active
	const hasActiveFilters = useMemo(() => {
		return (
			state.searchQuery !== '' ||
			state.statusFilter !== null ||
			state.shippingStatusFilter !== null ||
			state.productTypeFilter !== null
		);
	}, [state.searchQuery, state.statusFilter, state.shippingStatusFilter, state.productTypeFilter]);

	// Check if shipping statuses are available in config
	const hasShippingStatuses = useMemo(() => {
		return config?.shipping_statuses && Object.keys(config.shipping_statuses).length > 0;
	}, [config]);

	// Build custom styles from attributes
	const customStyles = useMemo(() => {
		const styles: Record<string, string> = {};

		if (attributes.titleColor) {
			styles['--vx-orders-title-color'] = attributes.titleColor;
		}
		if (attributes.subtitleColor) {
			styles['--vx-orders-subtitle-color'] = attributes.subtitleColor;
		}
		if (attributes.cardBackground) {
			styles['--vx-orders-card-bg'] = attributes.cardBackground;
		}
		if (attributes.cardBackgroundHover) {
			styles['--vx-orders-card-bg-hover'] = attributes.cardBackgroundHover;
		}
		if (attributes.cardBorderRadius) {
			styles['--vx-orders-card-radius'] = `${attributes.cardBorderRadius}px`;
		}

		return styles;
	}, [attributes]);

	// Editor mode: Show placeholder preview
	if (context === 'editor') {
		return (
			<div className="voxel-fse-orders-inner" style={{ display: 'contents', ...customStyles }}>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							headHide: attributes.headHide,
							ordersTitle: attributes.ordersTitle,
							ordersSubtitle: attributes.ordersSubtitle,
							icons: {
								searchIcon: attributes.searchIcon,
								noResultsIcon: attributes.noResultsIcon,
								resetSearchIcon: attributes.resetSearchIcon,
								backIcon: attributes.backIcon,
								forwardIcon: attributes.forwardIcon,
								downIcon: attributes.downIcon,
								inboxIcon: attributes.inboxIcon,
								checkmarkIcon: attributes.checkmarkIcon,
								menuIcon: attributes.menuIcon,
								infoIcon: attributes.infoIcon,
								filesIcon: attributes.filesIcon,
								trashIcon: attributes.trashIcon,
								calendarIcon: attributes.calendarIcon,
							},
						}),
					}}
				/>

				{/* Header */}
				{!attributes.headHide && (
					<div className="widget-head">
						<h1 style={attributes.titleColor ? { color: attributes.titleColor } : undefined}>
							{attributes.ordersTitle || 'Orders'}
						</h1>
						<p style={attributes.subtitleColor ? { color: attributes.subtitleColor } : undefined}>
							{attributes.ordersSubtitle || 'View all orders related to your account'}
						</p>
					</div>
				)}

				{/* Filters Preview */}
				<div className="vx-order-filters">
					<div className="ts-form ts-search-widget">
						<div className="ts-filter-wrapper flexify">
							{/* Search Input */}
							<div className="ts-inline-filter">
								<div className="ts-input-icon flexify">
									{renderIcon(getIconWithFallback(attributes.searchIcon, 'searchIcon'), 'ts-search-icon')}
									<input
										type="text"
										className="inline-input"
										placeholder="Search orders"
										value=""
										readOnly
									/>
								</div>
							</div>

							{/* Status Filter */}
							<div className="ts-inline-filter">
								<div className="ts-filter ts-popup-target">
									<span className="ts-filter-text">Status</span>
									{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'), 'ts-down-icon')}
								</div>
							</div>

							{/* Product Type Filter */}
							<div className="ts-inline-filter">
								<div className="ts-filter ts-popup-target">
									<span className="ts-filter-text">Product type</span>
									{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'), 'ts-down-icon')}
								</div>
							</div>

							{/* Reset Button */}
							<div className="ts-inline-filter">
								<a href="#" className="ts-icon-btn" title="Reset filters">
									{renderIcon(getIconWithFallback(attributes.resetSearchIcon, 'resetSearchIcon'))}
								</a>
							</div>
						</div>
					</div>
				</div>

				{/* Empty State Preview */}
				<div className="ts-no-posts">
					{renderIcon(getIconWithFallback(attributes.noResultsIcon, 'noResultsIcon'))}
					<p>No orders found</p>
				</div>
			</div>
		);
	}

	// Frontend mode: Full interactive component
	return (
		<div className="voxel-fse-orders-inner" style={{ display: 'contents', ...customStyles }}>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						headHide: attributes.headHide,
						ordersTitle: attributes.ordersTitle,
						ordersSubtitle: attributes.ordersSubtitle,
						icons: {
							searchIcon: attributes.searchIcon,
							noResultsIcon: attributes.noResultsIcon,
							resetSearchIcon: attributes.resetSearchIcon,
							backIcon: attributes.backIcon,
							forwardIcon: attributes.forwardIcon,
							downIcon: attributes.downIcon,
							inboxIcon: attributes.inboxIcon,
							checkmarkIcon: attributes.checkmarkIcon,
							menuIcon: attributes.menuIcon,
							infoIcon: attributes.infoIcon,
							filesIcon: attributes.filesIcon,
							trashIcon: attributes.trashIcon,
							calendarIcon: attributes.calendarIcon,
						},
					}),
				}}
			/>

			{/* Single Order View */}
			{currentOrder ? (
				<SingleOrder
					order={currentOrder}
					config={config}
					attributes={attributes}
					isLoading={isLoading}
					onBack={handleOrderBackWithUrl}
					onAction={(action, data) => {
						if (onOrderAction) {
							onOrderAction(currentOrder.id, action, data);
						}
					}}
					onMessage={openConversation}
					onCancelPromotion={async (orderId) => {
						if (onCancelPromotion) {
							await onCancelPromotion(orderId);
						}
					}}
				/>
			) : (
				<>
					{/* Header */}
					{!attributes.headHide && (
						<div className="widget-head">
							<h1 style={attributes.titleColor ? { color: attributes.titleColor } : undefined}>
								{attributes.ordersTitle || 'Orders'}
							</h1>
							<p style={attributes.subtitleColor ? { color: attributes.subtitleColor } : undefined}>
								{attributes.ordersSubtitle || 'View all orders related to your account'}
							</p>
						</div>
					)}

					{/* Filters */}
					<div className="vx-order-filters">
						<div className="ts-form ts-search-widget">
							<div className="ts-filter-wrapper flexify">
								{/* Search Input */}
								<div className="ts-inline-filter">
									<div className="ts-input-icon flexify">
										{renderIcon(getIconWithFallback(attributes.searchIcon, 'searchIcon'), 'ts-search-icon')}
										<input
											type="text"
											className="inline-input"
											placeholder="Search orders"
											value={state.searchQuery}
											onChange={handleSearchChange}
										/>
									</div>
								</div>

								{/* Status Filter */}
								<div className="ts-inline-filter">
									<div
										className={`ts-filter ts-popup-target ${state.statusFilter ? 'ts-filled' : ''}`}
										onClick={toggleStatusDropdown}
									>
										<span className="ts-filter-text">{statusFilterLabel}</span>
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'), 'ts-down-icon')}
									</div>

									{state.statusDropdownOpen && config && (
										<div className="ts-field-popup ts-popup-active">
											<div className="ts-term-dropdown ts-md-group">
												<ul className="simplify-ul ts-term-dropdown-list min-scroll">
													<li>
														<a
															href="#"
															className="flexify"
															onClick={(e) => {
																e.preventDefault();
																handleStatusSelect(null);
															}}
														>
															<span>All statuses</span>
														</a>
													</li>
													{Object.entries(config.statuses).map(([key, status]) => (
														<li key={key}>
															<a
																href="#"
																className="flexify"
																onClick={(e) => {
																	e.preventDefault();
																	handleStatusSelect(key as OrderStatus);
																}}
															>
																<span>{status.label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}
								</div>

								{/* Shipping Status Filter - matches Voxel's setShippingStatus() */}
								{hasShippingStatuses && (
									<div className="ts-inline-filter">
										<div
											className={`ts-filter ts-popup-target ${state.shippingStatusFilter ? 'ts-filled' : ''}`}
											onClick={toggleShippingStatusDropdown}
										>
											<span className="ts-filter-text">{shippingStatusFilterLabel}</span>
											{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'), 'ts-down-icon')}
										</div>

										{state.shippingStatusDropdownOpen && config && (
											<div className="ts-field-popup ts-popup-active">
												<div className="ts-term-dropdown ts-md-group">
													<ul className="simplify-ul ts-term-dropdown-list min-scroll">
														<li>
															<a
																href="#"
																className="flexify"
																onClick={(e) => {
																	e.preventDefault();
																	handleShippingStatusSelect(null);
																}}
															>
																<span>All shipping statuses</span>
															</a>
														</li>
														{Object.entries(config.shipping_statuses).map(([key, status]) => (
															<li key={key}>
																<a
																	href="#"
																	className="flexify"
																	onClick={(e) => {
																		e.preventDefault();
																		handleShippingStatusSelect(key);
																	}}
																>
																	<span>{(status as { label: string }).label}</span>
																</a>
															</li>
														))}
													</ul>
												</div>
											</div>
										)}
									</div>
								)}

								{/* Product Type Filter */}
								<div className="ts-inline-filter">
									<div
										className={`ts-filter ts-popup-target ${state.productTypeFilter ? 'ts-filled' : ''}`}
										onClick={toggleProductTypeDropdown}
									>
										<span className="ts-filter-text">{productTypeFilterLabel}</span>
										{renderIcon(getIconWithFallback(attributes.downIcon, 'downIcon'), 'ts-down-icon')}
									</div>

									{state.productTypeDropdownOpen && config && (
										<div className="ts-field-popup ts-popup-active">
											<div className="ts-term-dropdown ts-md-group">
												<ul className="simplify-ul ts-term-dropdown-list min-scroll">
													<li>
														<a
															href="#"
															className="flexify"
															onClick={(e) => {
																e.preventDefault();
																handleProductTypeSelect(null);
															}}
														>
															<span>All product types</span>
														</a>
													</li>
													{config.product_types.map((productType) => (
														<li key={productType.key}>
															<a
																href="#"
																className="flexify"
																onClick={(e) => {
																	e.preventDefault();
																	handleProductTypeSelect(productType.key);
																}}
															>
																<span>{productType.label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									)}
								</div>

								{/* Reset Button */}
								{hasActiveFilters && (
									<div className="ts-inline-filter">
										<a
											href="#"
											className="ts-icon-btn"
											title="Reset filters"
											onClick={(e) => {
												e.preventDefault();
												handleResetSearch();
											}}
										>
											{renderIcon(getIconWithFallback(attributes.resetSearchIcon, 'resetSearchIcon'))}
										</a>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Loading State */}
					{isLoading && (
						<div className="ts-no-posts">
							<span className="ts-loader"></span>
						</div>
					)}

					{/* Error State */}
					{error && !isLoading && (
						<div className="ts-no-posts">
							{renderIcon(getIconWithFallback(attributes.infoIcon, 'infoIcon'))}
							<p>{error}</p>
						</div>
					)}

					{/* Orders List */}
					{!isLoading && !error && (
						<OrdersList
							orders={orders}
							config={config}
							attributes={attributes}
							isLoading={isLoading}
							onOrderSelect={handleOrderSelectWithUrl}
							currentPage={currentPage}
							totalPages={totalPages}
							onPageChange={handlePageChangeWithUrl}
						/>
					)}
				</>
			)}
		</div>
	);
}
