"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import { ApiResponse, Subscription, SubscriptionUsage } from '@/types/api';

interface UseSubscriptionState {
	loading: boolean;
	error: string | null;
	subscription: Subscription | null;
	usage: SubscriptionUsage | null;
	plans?: any;
}

export function useSubscription() {
	const [state, setState] = useState<UseSubscriptionState>({ loading: false, error: null, subscription: null, usage: null });

    const fetchSubscription = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const res = await apiClient.getMySubscription();
            setState(prev => ({ ...prev, subscription: res.data || null, loading: false }));
            return res.data as Subscription | null;
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err?.message || 'Failed to fetch subscription', loading: false }));
            return null;
        }
    }, []);

    const fetchUsage = useCallback(async () => {
        try {
            const res = await apiClient.getSubscriptionUsage();
            // Attach remaining header hints if present
            const headers = (res as any)?.meta?.headers as Record<string, string> | undefined;
            let usageData = res.data as SubscriptionUsage;
            if (headers && usageData) {
                const remainingViews = headers['X-Remaining-Job-Views'] || headers['x-remaining-job-views'];
                const remainingApps = headers['X-Remaining-Applications'] || headers['x-remaining-applications'];
                const limits = usageData.limits || { jobViewsPerDay: null, applicationsPerDay: null };
                if (remainingViews && limits.jobViewsPerDay && limits.jobViewsPerDay > 0) {
                    const used = limits.jobViewsPerDay - Number(remainingViews);
                    usageData = { ...usageData, usage: { ...usageData.usage, jobViewsToday: used } };
                }
                if (remainingApps && limits.applicationsPerDay && limits.applicationsPerDay > 0) {
                    const used = limits.applicationsPerDay - Number(remainingApps);
                    usageData = { ...usageData, usage: { ...usageData.usage, applicationsToday: used } };
                }
            }
            setState(prev => ({ ...prev, usage: usageData }));
            return usageData;
        } catch (err: any) {
            setState(prev => ({ ...prev, error: err?.message || 'Failed to fetch usage' }));
            throw err;
        }
    }, []);

const createCheckout = useCallback(async (
	payload:
		| { priceId: string; successUrl: string; cancelUrl: string; trialPeriodDays?: number }
		| { provider?: 'stripe' | 'razorpay' | 'paypal'; planId: string; billingCycle: 'monthly' | 'quarterly' | 'yearly'; successUrl: string; cancelUrl: string; trialPeriodDays?: number }
)	=> {
		const res = await apiClient.createSubscriptionCheckout(payload as any);
		return res.data as any;
	}, []);

	const cancelAtPeriodEnd = useCallback(async () => {
		await apiClient.cancelSubscriptionAtPeriodEnd();
		await fetchSubscription();
	}, [fetchSubscription]);

	const resumeAutoRenew = useCallback(async () => {
		await apiClient.resumeSubscriptionAutoRenew();
		await fetchSubscription();
	}, [fetchSubscription]);

	useEffect(() => {
		fetchSubscription();
	}, [fetchSubscription]);

	const refreshUsage = useCallback(async () => {
		return fetchUsage();
	}, [fetchUsage]);

	const openCustomerPortal = useCallback(async () => {
		const res = await apiClient.createStripeCustomerPortal();
		return res.data as { url: string };
	}, []);

	return useMemo(() => ({
		...state,
		refresh: fetchSubscription,
		fetchUsage,
		refreshUsage,
		createCheckout,
		cancelAtPeriodEnd,
		resumeAutoRenew,
		openCustomerPortal
	}), [state, fetchSubscription, fetchUsage, createCheckout, cancelAtPeriodEnd, resumeAutoRenew, refreshUsage, openCustomerPortal]);
}

export default useSubscription;


