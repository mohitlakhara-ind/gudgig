"use client";

import React from 'react';
import useSubscription from '@/hooks/useSubscription';

interface SubscriptionGateProps {
	children: React.ReactNode;
	type?: 'soft' | 'hard' | 'limit';
	preview?: React.ReactNode;
	onUpgradeClick?: () => void;
}

export default function SubscriptionGate({ children, type = 'soft', preview, onUpgradeClick }: SubscriptionGateProps) {
	const { subscription, usage } = useSubscription();
	const hasAccess = subscription && (subscription.status === 'active' || subscription.status === 'trialing');

	if (hasAccess) return <>{children}</>;

	if (type === 'hard') {
		return (
			<div className="border rounded-md p-4 bg-muted/40">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-semibold">Premium content</h3>
					<button onClick={onUpgradeClick} className="px-3 py-1.5 rounded bg-primary text-white text-sm">Upgrade</button>
				</div>
				<p className="text-sm text-muted-foreground">Upgrade your plan to access this content.</p>
			</div>
		);
	}

	if (type === 'limit') {
		return (
			<div className="border rounded-md p-4 bg-muted/30">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="font-semibold">Daily limit reached</h3>
						<p className="text-sm text-muted-foreground">Upgrade your plan to increase daily limits.</p>
					</div>
					<button onClick={onUpgradeClick} className="px-3 py-1.5 rounded bg-primary text-white text-sm">Upgrade</button>
				</div>
			</div>
		);
	}

	return (
		<div className="border rounded-md p-4 bg-muted/20">
			{preview ? preview : <p className="text-sm text-muted-foreground">Preview available. Upgrade to unlock full content.</p>}
			<div className="mt-3">
				<button onClick={onUpgradeClick} className="px-3 py-1.5 rounded bg-primary text-white text-sm">Upgrade</button>
			</div>
		</div>
	);
}


