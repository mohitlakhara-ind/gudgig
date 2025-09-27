"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api';
import { CreateOrderRequest, Order, OrderResponse, OrdersResponse } from '@/types/api';

export function useOrders(role?: 'buyer' | 'seller') {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchOrders = useCallback(async (status?: string) => {
		setIsLoading(true);
		setError(null);
		try {
			const res: OrdersResponse = await apiClient.getOrders({ role, status });
			setOrders(res.data || []);
		} catch (err: any) {
			setError(err?.message || 'Failed to load orders');
		} finally {
			setIsLoading(false);
		}
	}, [role]);

	const createOrder = useCallback(async (payload: CreateOrderRequest) => {
		const res: OrderResponse = await apiClient.createOrder(payload);
		return res.data!;
	}, []);

	const updateOrderStatus = useCallback(async (id: string, status: string) => {
		const res: OrderResponse = await apiClient.updateOrderStatus(id, status);
		return res.data!;
	}, []);

	const deliverOrder = useCallback(async (id: string, payload: { message?: string; files?: Array<{ url: string; publicId?: string; name?: string; size?: number }> }) => {
		const res: OrderResponse = await apiClient.deliverOrder(id, payload);
		return res.data!;
	}, []);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	return useMemo(() => ({
		orders,
		isLoading,
		error,
		fetchOrders,
		createOrder,
		updateOrderStatus,
		deliverOrder,
	}), [orders, isLoading, error, fetchOrders, createOrder, updateOrderStatus, deliverOrder]);
}

export default useOrders;
