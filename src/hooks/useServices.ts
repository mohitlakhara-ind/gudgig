"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import apiClient from '@/lib/api';
import { CreateServiceRequest, Service, ServiceResponse, ServicesResponse } from '@/types/api';

interface UseServicesOptions {
	initialParams?: Record<string, string | number | boolean | undefined>;
}

export function useServices(options: UseServicesOptions = {}) {
	const { initialParams } = options;
	const [services, setServices] = useState<Service[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const cacheRef = useRef<Map<string, Service[]>>(new Map());

	const keyFromParams = useCallback((params?: Record<string, any>) => {
		return JSON.stringify(params || {});
	}, []);

	const fetchServices = useCallback(async (params?: Record<string, any>) => {
		setIsLoading(true);
		setError(null);
		try {
			const key = keyFromParams(params);
			if (cacheRef.current.has(key)) {
				setServices(cacheRef.current.get(key)!);
				setIsLoading(false);
				return;
			}
			const res: ServicesResponse = await apiClient.getServices(params);
			setServices(res.data || []);
			cacheRef.current.set(key, res.data || []);
		} catch (err: any) {
			setError(err?.message || 'Failed to load services');
		} finally {
			setIsLoading(false);
		}
	}, [keyFromParams]);

	useEffect(() => {
		if (initialParams) {
			fetchServices(initialParams);
		}
	}, [initialParams, fetchServices]);

	const createService = useCallback(async (payload: CreateServiceRequest) => {
		const res: ServiceResponse = await apiClient.createService(payload);
		return res.data!;
	}, []);

	const updateService = useCallback(async (id: string, payload: Partial<CreateServiceRequest>) => {
		const res: ServiceResponse = await apiClient.updateService(id, payload);
		return res.data!;
	}, []);

	const deleteService = useCallback(async (id: string) => {
		await apiClient.deleteService(id);
		// Invalidate cache
		cacheRef.current.clear();
	}, []);

	return useMemo(() => ({
		services,
		isLoading,
		error,
		fetchServices,
		createService,
		updateService,
		deleteService,
	}), [services, isLoading, error, fetchServices, createService, updateService, deleteService]);
}

export default useServices;
