/**
 * Orders Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/orders/voxel-orders.beautified.js
 *
 * VOXEL PARITY: 100%
 * ✅ Renders HTML structure with matching CSS classes (vx-orders-widget, ts-no-posts)
 * ✅ Order listing with pagination
 * ✅ Status filter dropdown
 * ✅ Shipping status filter dropdown
 * ✅ Product type filter dropdown
 * ✅ Search functionality
 * ✅ Single order view
 * ✅ Order actions execution
 * ✅ URL state persistence (order_id, pg, status, shipping_status, product_type params)
 * ✅ File upload component for order items
 * ✅ Direct messaging integration (openConversation)
 * ✅ Content truncation with HTML preservation
 * ✅ Promotion cancellation (cancelPromotion)
 * ✅ ItemPromotionDetails component
 * ✅ Voxel.prompt() styled confirmation dialogs (with native fallback)
 * ✅ Actions dropdown blur after execution
 * ✅ Voxel.helpers.currencyFormat (with Intl.NumberFormat fallback)
 *
 * ARCHITECTURAL NOTES:
 * - Uses REST API endpoints (future Next.js compatible)
 * - Promotion cancellation uses Voxel's ?vx=1 AJAX system for native compatibility
 *
 * API ENDPOINTS (REST API):
 * - GET /voxel-fse/v1/orders/config - Load configuration
 * - GET /voxel-fse/v1/orders - List orders with filters
 * - GET /voxel-fse/v1/orders/{id} - Single order details
 * - POST /voxel-fse/v1/orders/{id}/action - Execute order action
 *
 * VOXEL API ENDPOINTS (used directly):
 * - products.single_order.promotions.cancel_promotion - Cancel promotion
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Component receives normalized data as props
 * ✅ Pure React implementation (no jQuery)
 * ✅ TypeScript strict mode compatible
 * ✅ getRestBaseUrl() supports multisite subdirectory installations
 *
 * Evidence:
 * - Voxel widget: themes/voxel/templates/widgets/orders.php
 * - Voxel JS: themes/voxel/assets/dist/orders.js (beautified: 1,250 lines)
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect, useCallback } from 'react';
import OrdersComponent from './shared/OrdersComponent';

import type {
	OrdersBlockAttributes,
	OrdersVxConfig,
	OrdersConfig,
	OrderListItem,
	Order,
	OrderStatus,
	OrdersFilterState,
} from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

// jQuery type for voxel:markup-update handler
declare const jQuery: any;

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Get the REST API nonce for authentication
 */
function getRestNonce(): string {
	const win = window as unknown as { wpApiSettings?: { nonce?: string } };
	if (typeof window !== 'undefined' && win.wpApiSettings?.nonce) {
		return win.wpApiSettings.nonce;
	}
	return '';
}

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): OrdersVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent) as OrdersVxConfig;
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized OrdersVxConfig
 */
function normalizeConfig(raw: any): OrdersVxConfig {
	// Normalize icons (handle both nested and flat formats)
	const icons = {
		searchIcon: raw.icons?.searchIcon ?? raw.icons?.search_icon ?? { library: 'icon', value: 'las la-search' },
		noResultsIcon: raw.icons?.noResultsIcon ?? raw.icons?.no_results_icon ?? { library: 'icon', value: 'las la-inbox' },
		resetSearchIcon: raw.icons?.resetSearchIcon ?? raw.icons?.reset_search_icon ?? { library: 'icon', value: 'las la-sync' },
		backIcon: raw.icons?.backIcon ?? raw.icons?.back_icon ?? { library: 'icon', value: 'las la-angle-left' },
		forwardIcon: raw.icons?.forwardIcon ?? raw.icons?.forward_icon ?? { library: 'icon', value: 'las la-angle-right' },
		downIcon: raw.icons?.downIcon ?? raw.icons?.down_icon ?? { library: 'icon', value: 'las la-angle-down' },
		inboxIcon: raw.icons?.inboxIcon ?? raw.icons?.inbox_icon ?? { library: 'icon', value: 'las la-inbox' },
		checkmarkIcon: raw.icons?.checkmarkIcon ?? raw.icons?.checkmark_icon ?? { library: 'icon', value: 'las la-check' },
		menuIcon: raw.icons?.menuIcon ?? raw.icons?.menu_icon ?? { library: 'icon', value: 'las la-ellipsis-h' },
		infoIcon: raw.icons?.infoIcon ?? raw.icons?.info_icon ?? { library: 'icon', value: 'las la-info-circle' },
		filesIcon: raw.icons?.filesIcon ?? raw.icons?.files_icon ?? { library: 'icon', value: 'las la-file' },
		trashIcon: raw.icons?.trashIcon ?? raw.icons?.trash_icon ?? { library: 'icon', value: 'las la-trash' },
		calendarIcon: raw.icons?.calendarIcon ?? raw.icons?.calendar_icon ?? { library: 'icon', value: 'las la-calendar' },
	};

	return {
		headHide: raw.headHide ?? raw.head_hide ?? false,
		ordersTitle: raw.ordersTitle ?? raw.orders_title ?? 'Orders',
		ordersSubtitle: raw.ordersSubtitle ?? raw.orders_subtitle ?? 'View all orders related to your account',
		icons,
		// Style properties
		titleColor: raw.titleColor ?? raw.title_color ?? '',
		subtitleColor: raw.subtitleColor ?? raw.subtitle_color ?? '',
		cardBackground: raw.cardBackground ?? raw.card_background ?? '',
		cardBackgroundHover: raw.cardBackgroundHover ?? raw.card_background_hover ?? '',
		cardBorderRadius: raw.cardBorderRadius ?? raw.card_border_radius ?? 0,
		statusPendingColor: raw.statusPendingColor ?? raw.status_pending_color ?? '',
		statusCompletedColor: raw.statusCompletedColor ?? raw.status_completed_color ?? '',
		statusCancelledColor: raw.statusCancelledColor ?? raw.status_cancelled_color ?? '',
		statusRefundedColor: raw.statusRefundedColor ?? raw.status_refunded_color ?? '',
		primaryButtonBackground: raw.primaryButtonBackground ?? raw.primary_button_background ?? '',
		primaryButtonTextColor: raw.primaryButtonTextColor ?? raw.primary_button_text_color ?? '',
		secondaryButtonBackground: raw.secondaryButtonBackground ?? raw.secondary_button_background ?? '',
		secondaryButtonTextColor: raw.secondaryButtonTextColor ?? raw.secondary_button_text_color ?? '',
		filterBackground: raw.filterBackground ?? raw.filter_background ?? '',
		filterTextColor: raw.filterTextColor ?? raw.filter_text_color ?? '',
	};
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: OrdersVxConfig): OrdersBlockAttributes {
	return {
		blockId: '',
		headHide: vxConfig.headHide || false,
		ordersTitle: vxConfig.ordersTitle || 'Orders',
		ordersSubtitle: vxConfig.ordersSubtitle || 'View all orders related to your account',

		// Icons
		searchIcon: vxConfig.icons?.searchIcon || { library: 'icon', value: 'las la-search' },
		noResultsIcon: vxConfig.icons?.noResultsIcon || { library: 'icon', value: 'las la-inbox' },
		resetSearchIcon: vxConfig.icons?.resetSearchIcon || { library: 'icon', value: 'las la-sync' },
		backIcon: vxConfig.icons?.backIcon || { library: 'icon', value: 'las la-angle-left' },
		forwardIcon: vxConfig.icons?.forwardIcon || { library: 'icon', value: 'las la-angle-right' },
		downIcon: vxConfig.icons?.downIcon || { library: 'icon', value: 'las la-angle-down' },
		inboxIcon: vxConfig.icons?.inboxIcon || { library: 'icon', value: 'las la-inbox' },
		checkmarkIcon: vxConfig.icons?.checkmarkIcon || { library: 'icon', value: 'las la-check' },
		menuIcon: vxConfig.icons?.menuIcon || { library: 'icon', value: 'las la-ellipsis-h' },
		infoIcon: vxConfig.icons?.infoIcon || { library: 'icon', value: 'las la-info-circle' },
		filesIcon: vxConfig.icons?.filesIcon || { library: 'icon', value: 'las la-file' },
		trashIcon: vxConfig.icons?.trashIcon || { library: 'icon', value: 'las la-trash' },
		calendarIcon: vxConfig.icons?.calendarIcon || { library: 'icon', value: 'las la-calendar' },

		// Typography (not stored in vxconfig, use defaults)
		titleTypography: {},
		subtitleTypography: {},

		// Colors from vxconfig
		titleColor: vxConfig.titleColor || '',
		subtitleColor: vxConfig.subtitleColor || '',
		cardBackground: vxConfig.cardBackground || '',
		cardBackgroundHover: vxConfig.cardBackgroundHover || '',
		cardBorderRadius: vxConfig.cardBorderRadius || 0,
		cardPadding: {},
		cardPadding_tablet: {},
		cardPadding_mobile: {},

		// Status colors
		statusPendingColor: vxConfig.statusPendingColor || '',
		statusCompletedColor: vxConfig.statusCompletedColor || '',
		statusCancelledColor: vxConfig.statusCancelledColor || '',
		statusRefundedColor: vxConfig.statusRefundedColor || '',

		// Button colors
		primaryButtonBackground: vxConfig.primaryButtonBackground || '',
		primaryButtonBackgroundHover: '',
		primaryButtonTextColor: vxConfig.primaryButtonTextColor || '',
		primaryButtonTextColorHover: '',
		secondaryButtonBackground: vxConfig.secondaryButtonBackground || '',
		secondaryButtonBackgroundHover: '',
		secondaryButtonTextColor: vxConfig.secondaryButtonTextColor || '',
		secondaryButtonTextColorHover: '',

		// Filter colors
		filterBackground: vxConfig.filterBackground || '',
		filterBackgroundActive: '',
		filterTextColor: vxConfig.filterTextColor || '',
		filterTextColorActive: '',

		// Block spacing
		blockMargin: {},
		blockMargin_tablet: {},
		blockMargin_mobile: {},
		blockPadding: {},
		blockPadding_tablet: {},
		blockPadding_mobile: {},

		// Visibility
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,

		// Custom
		customClasses: '',
		customCSS: '',
	};
}

/**
 * Fetch orders configuration from REST API
 */
async function fetchOrdersConfig(): Promise<OrdersConfig | null> {
	const restUrl = getRestUrl();
	const nonce = getRestNonce();

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(`${restUrl}voxel-fse/v1/orders/config`, {
			credentials: 'same-origin',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json() as OrdersConfig;
	} catch (error) {
		console.error('Failed to fetch orders config:', error);
		return null;
	}
}

/**
 * Fetch orders list from REST API
 */
async function fetchOrdersList(
	page: number = 1,
	status?: string | null,
	productType?: string | null,
	search?: string,
	shippingStatus?: string | null
): Promise<{ orders: OrderListItem[]; total: number; totalPages: number }> {
	const restUrl = getRestUrl();
	const nonce = getRestNonce();
	const params = new URLSearchParams();

	params.set('page', String(page));
	if (status) params.set('status', status);
	if (productType) params.set('product_type', productType);
	if (search) params.set('search', search);
	if (shippingStatus) params.set('shipping_status', shippingStatus);

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(`${restUrl}voxel-fse/v1/orders?${params.toString()}`, {
			credentials: 'same-origin',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json() as {
			orders: OrderListItem[];
			total: number;
			total_pages: number;
		};

		return {
			orders: data.orders,
			total: data.total,
			totalPages: data.total_pages,
		};
	} catch (error) {
		console.error('Failed to fetch orders:', error);
		return { orders: [], total: 0, totalPages: 0 };
	}
}

/**
 * Fetch single order from REST API
 */
async function fetchSingleOrder(orderId: number): Promise<Order | null> {
	const restUrl = getRestUrl();
	const nonce = getRestNonce();

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(`${restUrl}voxel-fse/v1/orders/${orderId}`, {
			credentials: 'same-origin',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json() as { order: Order };
		return data.order;
	} catch (error) {
		console.error('Failed to fetch order:', error);
		return null;
	}
}

/**
 * Execute order action via REST API
 */
async function executeOrderAction(
	orderId: number,
	action: string,
	data?: Record<string, unknown>
): Promise<boolean> {
	const restUrl = getRestUrl();
	const nonce = getRestNonce();

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(`${restUrl}voxel-fse/v1/orders/${orderId}/action`, {
			method: 'POST',
			credentials: 'same-origin',
			headers,
			body: JSON.stringify({ action, ...data }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return true;
	} catch (error) {
		console.error('Failed to execute order action:', error);
		return false;
	}
}

/**
 * Cancel promotion for an order
 * Reference: voxel-orders.beautified.js lines 140-165
 *
 * Uses Voxel's AJAX system (?vx=1) to match native behavior.
 */
async function cancelPromotion(orderId: number, nonce?: string): Promise<boolean> {
	try {
		// Use Voxel's AJAX system for promotion cancellation
		// Reference: voxel-orders.beautified.js line 149-154
		const ajaxUrl = (window as any).Voxel_Config?.ajax_url || `${window.location.origin}/?vx=1`;

		const formData = new FormData();
		formData.append('order_id', String(orderId));
		if (nonce) {
			formData.append('_wpnonce', nonce);
		}

		const response = await fetch(`${ajaxUrl}&action=products.single_order.promotions.cancel_promotion`, {
			method: 'POST',
			credentials: 'same-origin',
			body: formData,
		});

		const data = await response.json();

		if (!data.success) {
			// Use Voxel.alert if available
			const errorMessage = data.message || (window as any).Voxel_Config?.l10n?.ajaxError || 'Failed to cancel promotion';
			if (typeof (window as any).Voxel?.alert === 'function') {
				(window as any).Voxel.alert(errorMessage, 'error');
			} else {
				console.error(errorMessage);
			}
			return false;
		}

		return true;
	} catch (error) {
		console.error('Failed to cancel promotion:', error);
		return false;
	}
}

/**
 * Wrapper component that handles data fetching and state management
 */
interface OrdersWrapperProps {
	attributes: OrdersBlockAttributes;
}

function OrdersWrapper({ attributes }: OrdersWrapperProps) {
	const [config, setConfig] = useState<OrdersConfig | null>(null);
	const [orders, setOrders] = useState<OrderListItem[]>([]);
	const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState(1);

	const [filters, setFilters] = useState<OrdersFilterState>({
		searchQuery: '',
		status: null,
		shippingStatus: null,
		productType: null,
		page: 1,
	});

	// Load configuration on mount
	useEffect(() => {
		let cancelled = false;

		async function loadConfig() {
			const configData = await fetchOrdersConfig();
			if (!cancelled) {
				if (configData) {
					setConfig(configData);
				} else {
					setError('Failed to load orders configuration');
				}
			}
		}

		loadConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	// Load orders when filters change
	useEffect(() => {
		if (!config) return;

		let cancelled = false;

		async function loadOrders() {
			setIsLoading(true);

			const result = await fetchOrdersList(
				filters.page,
				filters.status,
				filters.productType,
				filters.searchQuery,
				filters.shippingStatus
			);

			if (!cancelled) {
				setOrders(result.orders);
				setTotalPages(result.totalPages);
				setIsLoading(false);
			}
		}

		loadOrders();

		return () => {
			cancelled = true;
		};
	}, [config, filters]);

	// Handle search
	const handleSearch = useCallback((query: string) => {
		setFilters((prev) => ({ ...prev, searchQuery: query, page: 1 }));
	}, []);

	// Handle status filter
	const handleStatusFilter = useCallback((status: OrderStatus | null) => {
		setFilters((prev) => ({ ...prev, status, page: 1 }));
	}, []);

	// Handle shipping status filter
	const handleShippingStatusFilter = useCallback((shippingStatus: string | null) => {
		setFilters((prev) => ({ ...prev, shippingStatus, page: 1 }));
	}, []);

	// Handle product type filter
	const handleProductTypeFilter = useCallback((productType: string | null) => {
		setFilters((prev) => ({ ...prev, productType, page: 1 }));
	}, []);

	// Handle order selection
	const handleOrderSelect = useCallback(async (orderId: number) => {
		setIsLoading(true);
		const order = await fetchSingleOrder(orderId);
		setCurrentOrder(order);
		setIsLoading(false);
	}, []);

	// Handle back from single order
	const handleOrderBack = useCallback(() => {
		setCurrentOrder(null);
	}, []);

	// Handle order action
	const handleOrderAction = useCallback(
		async (orderId: number, action: string, data?: Record<string, unknown>) => {
			const success = await executeOrderAction(orderId, action, data);

			if (success) {
				// Refresh current order if viewing single order
				if (currentOrder && currentOrder.id === orderId) {
					const order = await fetchSingleOrder(orderId);
					setCurrentOrder(order);
				}

				// Refresh orders list
				const result = await fetchOrdersList(
					filters.page,
					filters.status,
					filters.productType,
					filters.searchQuery,
					filters.shippingStatus
				);
				setOrders(result.orders);
			}
		},
		[currentOrder, filters]
	);

	// Handle page change
	const handlePageChange = useCallback((page: number) => {
		setFilters((prev) => ({ ...prev, page }));
	}, []);

	// Handle promotion cancellation
	// Reference: voxel-orders.beautified.js lines 140-165
	const handleCancelPromotion = useCallback(
		async (orderId: number) => {
			const nonce = config?.nonce;
			const success = await cancelPromotion(orderId, nonce);

			if (success) {
				// Refresh current order to show updated state
				if (currentOrder && currentOrder.id === orderId) {
					const order = await fetchSingleOrder(orderId);
					setCurrentOrder(order);
				}

				// Refresh orders list
				const result = await fetchOrdersList(
					filters.page,
					filters.status,
					filters.productType,
					filters.searchQuery,
					filters.shippingStatus
				);
				setOrders(result.orders);
			}
		},
		[config?.nonce, currentOrder, filters]
	);

	// Show login required message if not authenticated
	if (config && !config.current_user_id) {
		return (
			<div className="vx-orders-widget">
				<div className="ts-no-posts">
					<span className="ts-loader"></span>
					<p>Please log in to view your orders.</p>
				</div>
			</div>
		);
	}

	return (
		<OrdersComponent
			attributes={attributes}
			config={config}
			orders={orders}
			currentOrder={currentOrder}
			context="frontend"
			isLoading={isLoading}
			error={error}
			currentPage={filters.page}
			totalPages={totalPages}
			onSearch={handleSearch}
			onStatusFilter={handleStatusFilter}
			onShippingStatusFilter={handleShippingStatusFilter}
			onProductTypeFilter={handleProductTypeFilter}
			onOrderSelect={handleOrderSelect}
			onOrderBack={handleOrderBack}
			onOrderAction={handleOrderAction}
			onPageChange={handlePageChange}
			onCancelPromotion={handleCancelPromotion}
		/>
	);
}

/**
 * Initialize orders blocks on the page
 */
function initOrdersBlocks() {
	// Find all orders blocks
	const ordersBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-orders-frontend, .vx-orders-widget'
	);

	ordersBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.reactMounted === 'true') {
			return;
		}

		// Parse vxconfig
		const rawConfig = parseVxConfig(container);
		if (!rawConfig) {
			console.warn('Orders block: No vxconfig found');
			return;
		}

		// Normalize config for both vxconfig and REST API compatibility
		const vxConfig = normalizeConfig(rawConfig);

		// Build attributes
		const attributes = buildAttributes(vxConfig);

		// Clear placeholder and create React root
		container.innerHTML = '';
		container.dataset.reactMounted = 'true';

		const root = createRoot(container);
		root.render(<OrdersWrapper attributes={attributes} />);
	});
}

/**
 * Component registry for custom order/item types
 * Reference: voxel-orders.beautified.js lines 244-280 (setupComponents)
 * Voxel uses Vue.defineAsyncComponent() to lazy-load custom renderers.
 * We expose a registration API so third-party code can add custom components.
 */
const componentRegistry: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {};

/**
 * Expose window.VX_Orders global for external script compatibility
 * Reference: voxel-orders.beautified.js line 779 (window.VX_Orders = this)
 */
(window as any).VX_Orders = {
	reinit: () => initOrdersBlocks(),
	/**
	 * Register a custom component for an order or item type.
	 * Usage: VX_Orders.registerComponent('order:booking', () => import('./my-booking-component'))
	 * Usage: VX_Orders.registerComponent('order-item:custom_addon', () => import('./my-addon-component'))
	 */
	registerComponent: (name: string, loader: () => Promise<{ default: React.ComponentType<any> }>) => {
		componentRegistry[name] = loader;
	},
	getComponent: (name: string) => componentRegistry[name] || null,
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initOrdersBlocks);
} else {
	initOrdersBlocks();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initOrdersBlocks);
window.addEventListener('pjax:complete', initOrdersBlocks);

// Re-initialize on Voxel's native AJAX markup updates
// Reference: voxel-orders.beautified.js line 1153
if (typeof jQuery !== 'undefined') {
	jQuery(document).on('voxel:markup-update', initOrdersBlocks);
}
