"use client";

import React, { useState } from 'react';
import { apiClient } from '@/lib/api';
import { useCheckout } from '@/hooks/useCheckout';

interface UpgradeModalProps {
	open: boolean;
	onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
	const { createSubscriptionCheckout, loading: checkoutLoading, error: checkoutError } = useCheckout();
	const [plans, setPlans] = useState<any | null>(null);
	const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
	const [provider, setProvider] = useState<'stripe' | 'razorpay' | 'paypal'>('stripe');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	React.useEffect(() => {
		if (!open) return;
		(async () => {
			try {
				const res = await apiClient.getSubscriptionPlans();
				setPlans(res.data);
			} catch (e: any) {
				setError(e?.message || 'Failed to load plans');
			}
		})();
	}, [open]);

	if (!open) return null;

	const handleUpgrade = async (planId: 'pro' | 'enterprise' | 'free', billingCycleParam?: 'monthly' | 'quarterly' | 'yearly') => {
		try {
			setLoading(true);
			setError(null);
			const successUrl = `${window.location.origin}/checkout/success`;
			const cancelUrl = `${window.location.origin}/checkout/cancel`;
			const cycle = billingCycleParam || billingCycle;
			if (planId === 'free') {
				// No checkout for free; just close
				onClose();
				return;
			}
			const result = await createSubscriptionCheckout(planId, { provider, billingCycle: cycle, returnTo: successUrl });
			// Stripe and PayPal paths redirect directly in hook. Razorpay returns order to be used by client widget.
			if (provider === 'razorpay' && result?.id) {
				// Defer opening widget to parent or integrate here if widget available
				// For now, close modal and let page handle widget with returned order
				onClose();
			}
		} catch (e: any) {
			setError(e?.message || 'Failed to start checkout');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
			<div className="bg-white rounded-2xl shadow-strong w-full max-w-3xl mx-4 p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold">Upgrade your plan</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
				</div>
				{(error || checkoutError) && <div className="text-red-600 text-sm mb-3">{error || checkoutError}</div>}
				<div className="mb-4 flex flex-wrap items-center gap-2">
					{(['monthly','quarterly','yearly'] as const).map(cycle => (
						<button key={cycle} disabled={loading} onClick={() => setBillingCycle(cycle)} className={`px-3 py-1 rounded border ${billingCycle===cycle?'bg-black text-white':'bg-white'}`}>
							{cycle.charAt(0).toUpperCase()+cycle.slice(1)}
						</button>
					))}
					<div className="ml-auto flex items-center gap-2 text-sm">
						<span className="text-gray-600">Provider</span>
						<select value={provider} onChange={(e) => setProvider(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
							<option value="stripe">Stripe</option>
							<option value="razorpay">Razorpay</option>
							<option value="paypal">PayPal</option>
						</select>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{plans ? Object.entries(plans).filter(([id]) => id !== 'free').map(([id, def]: any) => (
						<div key={id} className="glass-card rounded-2xl card-padding">
							<h3 className="font-semibold">{def.name}</h3>
							<p className="text-sm text-muted-foreground">{def.description}</p>
							<ul className="text-sm mt-2 list-disc pl-4">
								<li>Job views/day: {def.features?.jobViewsPerDay ?? 'Unlimited'}</li>
								<li>Applications/day: {def.features?.applicationsPerDay ?? 'Unlimited'}</li>
								<li>Full details: {def.features?.fullJobDescription ? 'Yes' : 'No'}</li>
							</ul>
							<div className="mt-2 text-lg font-semibold">{def.pricing?.[billingCycle]?.amount ? `$${(def.pricing[billingCycle].amount/100).toFixed(2)}` : 'Free'}<span className="text-sm text-gray-500">/{billingCycle.replace('ly','')}</span></div>
							<button disabled={loading || checkoutLoading} onClick={() => handleUpgrade(id as any)} className="mt-3 w-full px-3 py-2 rounded bg-primary text-white text-sm">{(loading || checkoutLoading) ? 'Redirecting...' : `Choose ${def.name}`}</button>
						</div>
					)) : (
						<div className="text-sm text-gray-600">Loading plans...</div>
					)}
				</div>
			</div>
		</div>
	);
}


