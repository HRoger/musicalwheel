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

import { useState, useCallback, useMemo, useEffect, useRef, type RefObject } from 'react';

import type {
	OrdersComponentProps,
		OrdersConfig,
		Order,
	OrderStatus,
	ShippingStatus,
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
	noResultsIcon: { library: 'svg', value: '' }, // Uses bag.svg inline SVG below
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
 * Voxel bag.svg - used as the default "No orders found" icon.
 * Source: themes/voxel/assets/images/svgs/bag.svg
 */
export const BAG_SVG = '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)"><path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM9.75 7C9.75 6.58579 9.41421 6.25 9 6.25C8.58579 6.25 8.25 6.58579 8.25 7V8C8.25 10.0711 9.92893 11.75 12 11.75C14.0711 11.75 15.75 10.0711 15.75 8V7C15.75 6.58579 15.4142 6.25 15 6.25C14.5858 6.25 14.25 6.58579 14.25 7V8C14.25 9.24264 13.2426 10.25 12 10.25C10.7574 10.25 9.75 9.24264 9.75 8V7Z" fill="#343C54"></path></svg>';

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
// @ts-ignore -- unused but kept for future use
function _showAlert(message: string, type: 'error' | 'success' = 'error'): void {
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

/**
 * Hook to close dropdowns when clicking outside
 */
function useClickOutside(ref: RefObject<HTMLElement | null>, onClose: () => void) {
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [ref, onClose]);
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
 * Render the "no results" icon.
 * Uses inline bag.svg by default (matching Voxel's \Voxel\svg('bag.svg')),
 * or renders a custom icon if the user has set one.
 */
export function renderNoResultsIcon(icon: IconValue | undefined): JSX.Element {
	// If user has set a custom icon with a value, render it
	if (icon && icon.value) {
		return renderIcon(icon) || <span dangerouslySetInnerHTML={{ __html: BAG_SVG }} />;
	}
	// Default: inline bag.svg matching Voxel
	return <span dangerouslySetInnerHTML={{ __html: BAG_SVG }} />;
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
		result = result.split(key).join(String(vars[key]));
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

	// Refs for click-outside dropdown closing
	const statusDropdownRef = useRef<HTMLDivElement>(null);
	const shippingDropdownRef = useRef<HTMLDivElement>(null);
	const productTypeDropdownRef = useRef<HTMLDivElement>(null);

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
	 * Inject Voxel CSS dependencies for both Editor and Frontend.
	 *
	 * The Voxel orders widget depends on multiple CSS files:
	 * - commons.css: base styles (.ts-down-icon chevron, .ts-no-posts, .ts-btn, .container-radio/.checkmark)
	 * - forms.css: form layout (.ts-form, .ts-filter height:44px, .ts-input-icon, .ts-form-group)
	 * - popup-kit.css: dropdown popups (.ts-field-popup-container, .ts-field-popup)
	 * - orders.css: order-specific styles (.vx-order-card, .order-status, .vx-order-filters)
	 * - line-awesome.css: icon font (.las .la-search, .la-sync, etc.)
	 *
	 * Reference: Voxel orders widget get_style_depends(): ['vx:forms.css', 'vx:orders.css', 'vx:product-summary.css']
	 * Plus globally loaded: commons.css, popup-kit.css (via assets.config.php)
	 */
	useEffect(() => {
		const voxelConfig = (window as unknown as { Voxel_Config?: { site_url?: string } }).Voxel_Config;
		const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
		const themeBase = `${siteUrl}/wp-content/themes/voxel`;

		const cssFiles = [
			{ id: 'voxel-commons-css', href: `${themeBase}/assets/dist/commons.css` },
			{ id: 'voxel-forms-css', href: `${themeBase}/assets/dist/forms.css` },
			{ id: 'voxel-popup-kit-css', href: `${themeBase}/assets/dist/popup-kit.css` },
			{ id: 'voxel-orders-css', href: `${themeBase}/assets/dist/orders.css` },
			{ id: 'voxel-line-awesome-css', href: `${themeBase}/assets/icons/line-awesome/line-awesome.css` },
		];

		cssFiles.forEach(({ id, href }) => {
			if (!document.getElementById(id)) {
				const link = document.createElement('link');
				link.id = id;
				link.rel = 'stylesheet';
				link.href = href;
				document.head.appendChild(link);
			}
		});
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
			shippingStatusFilter: shippingParam && config?.shipping_statuses?.[shippingParam as ShippingStatus] ? shippingParam : null,
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
			if (status && (status as any) !== 'all') {
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
			if (status && (status as any) !== 'all') {
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

	// Close dropdowns on click outside
	const closeStatusDropdown = useCallback(() => {
		setState((prev) => prev.statusDropdownOpen ? { ...prev, statusDropdownOpen: false } : prev);
	}, []);
	const closeShippingDropdown = useCallback(() => {
		setState((prev) => prev.shippingStatusDropdownOpen ? { ...prev, shippingStatusDropdownOpen: false } : prev);
	}, []);
	const closeProductTypeDropdown = useCallback(() => {
		setState((prev) => prev.productTypeDropdownOpen ? { ...prev, productTypeDropdownOpen: false } : prev);
	}, []);

	useClickOutside(statusDropdownRef, closeStatusDropdown);
	useClickOutside(shippingDropdownRef, closeShippingDropdown);
	useClickOutside(productTypeDropdownRef, closeProductTypeDropdown);

	// Open direct message conversation - matches Voxel's openConversation()
	const openConversation = useCallback(
		(order: Order) => {
			if (!config?.messages?.url) return;

			const isVendor = (order as any).current_user?.id === order.vendor?.id;
			const url = new URL(config.messages.url);

			if (isVendor) {
				// Vendor contacting customer
				url.searchParams.set('chat', `u${order.customer?.id}`);
				url.searchParams.set(
					'text',
					replaceVars(config.messages.enquiry_text?.vendor || 'Order #@order_id inquiry', {
						'@order_id': String(order.id),
					})
				);
			} else {
				// Customer contacting vendor
				url.searchParams.set('chat', String(order.actions?.dms?.vendor_target || `u${order.vendor?.id}`));
				url.searchParams.set(
					'text',
					replaceVars(config.messages.enquiry_text?.customer || 'Question about order #@order_id', {
						'@order_id': String(order.id),
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
			return config.shipping_statuses[state.shippingStatusFilter as ShippingStatus]?.label || 'Shipping';
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

	// @ts-ignore -- unused but kept for future use
	// Check if any filters are active
	const _hasActiveFilters = useMemo(() => {
		return (
			state.searchQuery !== '' ||
			state.statusFilter !== null ||
			state.shippingStatusFilter !== null ||
			state.productTypeFilter !== null
		);
	}, [state.searchQuery, state.statusFilter, state.shippingStatusFilter, state.productTypeFilter]);

	// Check if filters should be shown - matches Voxel: orders.php:27
	// v-if="config.available_statuses.length"
	const hasAvailableStatuses = useMemo(() => {
		return config?.available_statuses && config.available_statuses.length > 0;
	}, [config]);

	// Check if shipping statuses are available - matches Voxel: orders.php:82
	// v-if="config.available_shipping_statuses.length"
	const hasShippingStatuses = useMemo(() => {
		return config?.available_shipping_statuses && config.available_shipping_statuses.length > 0;
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

	// Editor mode: Interactive preview matching frontend exactly
	if (context === 'editor') {
		return (
			<div className="voxel-fse-orders-inner" style={{ display: 'contents', ...customStyles }}>
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

				{/* Filters - only shown when available_statuses has entries */}
				{/* Matches Voxel: templates/widgets/orders.php:27 - v-if="config.available_statuses.length" */}
				{hasAvailableStatuses && (
					<div className="vx-order-filters ts-form">
						<div className="ts-form-group ts-inline-filter order-keyword-search">
							<div className="ts-input-icon flexify">
								{renderIcon(getIconWithFallback(attributes.searchIcon, 'searchIcon'))}
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
						<div className="ts-form-group ts-inline-filter order-status-search" ref={statusDropdownRef}>
							<div
								className={`ts-filter ts-popup-target${state.statusFilter ? ' ts-filled' : ''}`}
								onClick={toggleStatusDropdown}
							>
								<div className="ts-filter-text">{statusFilterLabel}</div>
								<div className="ts-down-icon"></div>
							</div>

							{state.statusDropdownOpen && config && (
								<div className="ts-field-popup-container">
									<div className="ts-field-popup">
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
														<div className="ts-checkbox-container">
															<label className="container-radio">
																<input type="radio" checked={!state.statusFilter} disabled hidden readOnly />
																<span className="checkmark"></span>
															</label>
														</div>
														<span>All statuses</span>
													</a>
												</li>
												{config.statuses && Object.entries(config.statuses).map(([key, status]) => (
													<li key={key}>
														<a
															href="#"
															className="flexify"
															onClick={(e) => {
																e.preventDefault();
																handleStatusSelect(key as OrderStatus);
															}}
														>
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={state.statusFilter === key} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
															<span>{status.label}</span>
														</a>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Shipping Status Filter */}
						{hasShippingStatuses && (
							<div className="ts-form-group ts-inline-filter order-shipping-status-search" ref={shippingDropdownRef}>
								<div
									className={`ts-filter ts-popup-target${state.shippingStatusFilter ? ' ts-filled' : ''}`}
									onClick={toggleShippingStatusDropdown}
								>
									<div className="ts-filter-text">{shippingStatusFilterLabel}</div>
									<div className="ts-down-icon"></div>
								</div>

								{state.shippingStatusDropdownOpen && config && (
									<div className="ts-field-popup-container">
										<div className="ts-field-popup">
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
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={!state.shippingStatusFilter} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
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
																<div className="ts-checkbox-container">
																	<label className="container-radio">
																		<input type="radio" checked={state.shippingStatusFilter === key} disabled hidden readOnly />
																		<span className="checkmark"></span>
																	</label>
																</div>
																<span>{(status as { label: string }).label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Product Type Filter */}
						{config && config.product_types && config.product_types.length > 0 && (
							<div className="ts-form-group ts-inline-filter order-product-type-search" ref={productTypeDropdownRef}>
								<div
									className={`ts-filter ts-popup-target${state.productTypeFilter ? ' ts-filled' : ''}`}
									onClick={toggleProductTypeDropdown}
								>
									<div className="ts-filter-text">{productTypeFilterLabel}</div>
									<div className="ts-down-icon"></div>
								</div>

								{state.productTypeDropdownOpen && config && (
									<div className="ts-field-popup-container">
										<div className="ts-field-popup">
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
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={!state.productTypeFilter} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
															<span>All product types</span>
														</a>
													</li>
													{config.product_types.map((pt) => (
														<li key={pt.key}>
															<a
																href="#"
																className="flexify"
																onClick={(e) => {
																	e.preventDefault();
																	handleProductTypeSelect(pt.key);
																}}
															>
																<div className="ts-checkbox-container">
																	<label className="container-radio">
																		<input type="radio" checked={state.productTypeFilter === pt.key} disabled hidden readOnly />
																		<span className="checkmark"></span>
																	</label>
																</div>
																<span>{pt.label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Reset Button */}
						<div className="ts-form-group order-reset-button">
							<a
								href="#"
								className="ts-filter"
								onClick={(e) => {
									e.preventDefault();
									handleResetSearch();
								}}
							>
								{renderIcon(getIconWithFallback(attributes.resetSearchIcon, 'resetSearchIcon'))}
							</a>
						</div>
					</div>
				)}

				{/* Empty State Preview - matches Voxel: templates/widgets/orders.php:221-224 */}
				<div className="ts-no-posts">
					{renderNoResultsIcon(attributes.noResultsIcon)}
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

					{/* Filters - matches Voxel: templates/widgets/orders.php:28-169 */}
					{hasAvailableStatuses && (
					<div className="vx-order-filters ts-form">
						{/* Search Input */}
						<div className="ts-form-group ts-inline-filter order-keyword-search">
							<div className="ts-input-icon flexify">
								{renderIcon(getIconWithFallback(attributes.searchIcon, 'searchIcon'))}
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
						<div className="ts-form-group ts-inline-filter order-status-search" ref={statusDropdownRef}>
							<div
								className={`ts-filter ts-popup-target${state.statusFilter ? ' ts-filled' : ''}`}
								onClick={toggleStatusDropdown}
							>
								<div className="ts-filter-text">{statusFilterLabel}</div>
								<div className="ts-down-icon"></div>
							</div>

							{state.statusDropdownOpen && config && (
								<div className="ts-field-popup-container">
									<div className="ts-field-popup">
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
														<div className="ts-checkbox-container">
															<label className="container-radio">
																<input type="radio" checked={!state.statusFilter} disabled hidden readOnly />
																<span className="checkmark"></span>
															</label>
														</div>
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
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={state.statusFilter === key} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
															<span>{status.label}</span>
														</a>
													</li>
												))}
											</ul>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Shipping Status Filter - matches Voxel's setShippingStatus() */}
						{hasShippingStatuses && (
							<div className="ts-form-group ts-inline-filter order-shipping-status-search" ref={shippingDropdownRef}>
								<div
									className={`ts-filter ts-popup-target${state.shippingStatusFilter ? ' ts-filled' : ''}`}
									onClick={toggleShippingStatusDropdown}
								>
									<div className="ts-filter-text">{shippingStatusFilterLabel}</div>
									<div className="ts-down-icon"></div>
								</div>

								{state.shippingStatusDropdownOpen && config && (
									<div className="ts-field-popup-container">
										<div className="ts-field-popup">
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
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={!state.shippingStatusFilter} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
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
																<div className="ts-checkbox-container">
																	<label className="container-radio">
																		<input type="radio" checked={state.shippingStatusFilter === key} disabled hidden readOnly />
																		<span className="checkmark"></span>
																	</label>
																</div>
																<span>{(status as { label: string }).label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Product Type Filter */}
						{config && config.product_types && config.product_types.length > 0 && (
							<div className="ts-form-group ts-inline-filter order-product-type-search" ref={productTypeDropdownRef}>
								<div
									className={`ts-filter ts-popup-target${state.productTypeFilter ? ' ts-filled' : ''}`}
									onClick={toggleProductTypeDropdown}
								>
									<div className="ts-filter-text">{productTypeFilterLabel}</div>
									<div className="ts-down-icon"></div>
								</div>

								{state.productTypeDropdownOpen && config && (
									<div className="ts-field-popup-container">
										<div className="ts-field-popup">
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
															<div className="ts-checkbox-container">
																<label className="container-radio">
																	<input type="radio" checked={!state.productTypeFilter} disabled hidden readOnly />
																	<span className="checkmark"></span>
																</label>
															</div>
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
																<div className="ts-checkbox-container">
																	<label className="container-radio">
																		<input type="radio" checked={state.productTypeFilter === productType.key} disabled hidden readOnly />
																		<span className="checkmark"></span>
																	</label>
																</div>
																<span>{productType.label}</span>
															</a>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Reset Button - matches Voxel: templates/widgets/orders.php:164-168 */}
						<div className="ts-form-group order-reset-button">
							<a
								href="#"
								className="ts-filter"
								onClick={(e) => {
									e.preventDefault();
									handleResetSearch();
								}}
							>
								{renderIcon(getIconWithFallback(attributes.resetSearchIcon, 'resetSearchIcon'))}
							</a>
						</div>
					</div>
					)}

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
