/**
 * Orders Block - useOrdersConfig Hook
 *
 * Fetches orders configuration from the REST API for the editor.
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';

import type { OrdersConfig, ApiError } from '../types';

interface UseOrdersConfigResult {
	config: OrdersConfig | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Hook to fetch orders configuration from REST API
 */
export function useOrdersConfig(): UseOrdersConfigResult {
	const [config, setConfig] = useState<OrdersConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchConfig = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await apiFetch<OrdersConfig>({
				path: '/voxel-fse/v1/orders/config',
				method: 'GET',
			});

			setConfig(response);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || 'Failed to load orders configuration');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchConfig();
	}, []);

	return {
		config,
		isLoading,
		error,
		refetch: fetchConfig,
	};
}

/**
 * Hook to fetch orders list from REST API
 */
export function useOrdersList(
	page: number = 1,
	status?: string,
	productType?: string,
	searchQuery?: string
) {
	const [orders, setOrders] = useState<unknown[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchOrders = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			if (status) params.set('status', status);
			if (productType) params.set('product_type', productType);
			if (searchQuery) params.set('search', searchQuery);

			const response = await apiFetch<{
				orders: unknown[];
				total: number;
				total_pages: number;
			}>({
				path: `/voxel-fse/v1/orders?${params.toString()}`,
				method: 'GET',
			});

			setOrders(response.orders);
			setTotal(response.total);
			setTotalPages(response.total_pages);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || 'Failed to load orders');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [page, status, productType, searchQuery]);

	return {
		orders,
		total,
		totalPages,
		isLoading,
		error,
		refetch: fetchOrders,
	};
}

/**
 * Hook to fetch single order from REST API
 */
export function useSingleOrder(orderId: number | null) {
	const [order, setOrder] = useState<unknown | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchOrder = async () => {
		if (!orderId) {
			setOrder(null);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await apiFetch<{ order: unknown }>({
				path: `/voxel-fse/v1/orders/${orderId}`,
				method: 'GET',
			});

			setOrder(response.order);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || 'Failed to load order');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchOrder();
	}, [orderId]);

	return {
		order,
		isLoading,
		error,
		refetch: fetchOrder,
	};
}

export default useOrdersConfig;
