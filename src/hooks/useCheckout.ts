"use client";
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshSubscription } = useAuth() as any;

  const createCheckoutSession = async (
    planId: 'pro' | 'enterprise',
    options?: {
      provider?: 'stripe' | 'razorpay' | 'paypal';
      billingCycle?: 'monthly' | 'quarterly' | 'yearly';
      allowTrial?: boolean;
      returnTo?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const provider = options?.provider || 'stripe';
      const successUrl = options?.returnTo || `${window.location.origin}/checkout/success`;
      const cancelUrl = `${window.location.origin}/checkout/cancel`;
      const response = await apiClient.createSubscriptionCheckout({ provider, planId, billingCycle: options?.billingCycle || 'monthly', successUrl, cancelUrl });
      if (!response.success || !response.data) throw new Error(response.message || 'Failed to initiate checkout');

      if (provider === 'stripe' && response.data.url) {
        window.location.href = response.data.url;
      } else if (provider === 'paypal' && response.data.order?.links) {
        const approveLink = response.data.order.links.find((l: any) => l.rel === 'approve');
        if (approveLink?.href) window.location.href = approveLink.href;
        else throw new Error('Missing PayPal approval link');
      } else if (provider === 'razorpay' && response.data.order) {
        // Consumer of hook should open Razorpay checkout widget using returned order
        return response.data.order;
      }

    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : (err instanceof Error ? err.message : 'Checkout failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSuccess = useCallback(async (redirectTo?: string, timeoutMs: number = 30000) => {
    const start = Date.now();
    setLoading(true);
    setError(null);
    try {
      // Poll subscription status until active or timeout
      while (Date.now() - start < timeoutMs) {
        const me = await apiClient.getMySubscription();
        if (me?.data?.status === 'active' || me?.data?.status === 'trialing') {
          await (refreshSubscription?.() || Promise.resolve());
          if (redirectTo) router.replace(redirectTo);
          return true;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
      setError('Subscription activation is taking longer than expected. Please check back shortly.');
      return false;
    } catch (e: any) {
      setError(e?.message || 'Failed to verify subscription');
      return false;
    } finally {
      setLoading(false);
    }
  }, [router, refreshSubscription]);

  const handleCheckoutCancel = useCallback((redirectTo: string = '/subscription') => {
    router.replace(redirectTo);
  }, [router]);

  return {
    createCheckoutSession,
    createSubscriptionCheckout: createCheckoutSession,
    createPromotionCheckout: async (payload: { jobId: string; tier: 'feature' | 'urgent' | 'highlight' | 'boost'; durationDays?: number }) => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.createPromotionCheckout(payload);
        if (res.success && res.data?.url) window.location.href = res.data.url;
        else return res.data; // may contain order for non-Stripe
      } catch (err) {
        const msg = err instanceof ApiClientError ? err.message : (err instanceof Error ? err.message : 'Checkout failed');
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    handleCheckoutSuccess,
    handleCheckoutCancel,
    loading,
    error
  };
}