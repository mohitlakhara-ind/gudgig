"use client";

import React, { useEffect, useMemo } from 'react';
import useSubscription from '@/hooks/useSubscription';

export default function UsageMeter() {
	const { usage, subscription, fetchUsage } = useSubscription();

	useEffect(() => {
		fetchUsage().catch(() => {});
	}, [fetchUsage]);

	const plan = subscription?.plan || 'free';
	const status = subscription?.status || 'inactive';
	const jobViewsLimit = usage?.limits?.jobViewsPerDay ?? null;
	const applicationsLimit = usage?.limits?.applicationsPerDay ?? null;
	const jobViewsUsed = usage?.usage?.jobViewsToday ?? 0;
	const applicationsUsed = usage?.usage?.applicationsToday ?? 0;
	const graceActive = status === 'past_due' && !!subscription?.gracePeriodEnd && new Date(subscription.gracePeriodEnd) > new Date();

	const pct = (used: number, limit: number | null) => {
		if (limit === null) return 0;
		if (!limit) return 0;
		return Math.min(100, Math.round((used / limit) * 100));
	};

	const resetText = useMemo(() => {
		const now = new Date();
		const reset = new Date();
		reset.setHours(24,0,0,0);
		const ms = reset.getTime() - now.getTime();
		const hours = Math.floor(ms / (1000*60*60));
		const minutes = Math.floor((ms % (1000*60*60)) / (1000*60));
		return `${hours}h ${minutes}m until reset`;
	}, []);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="p-3 rounded border">
					<div className="flex justify-between text-sm mb-1">
						<span>Job views today</span>
						<span>{jobViewsLimit === null ? 'Unlimited' : `${jobViewsUsed}/${jobViewsLimit}`}</span>
					</div>
					<div className="h-2 bg-gray-200 rounded">
						<div className="h-2 bg-primary rounded" style={{ width: `${pct(jobViewsUsed, jobViewsLimit)}%` }} />
					</div>
				</div>
				<div className="p-3 rounded border">
					<div className="flex justify-between text-sm mb-1">
						<span>Applications today</span>
						<span>{applicationsLimit === null ? 'Unlimited' : `${applicationsUsed}/${applicationsLimit}`}</span>
					</div>
					<div className="h-2 bg-gray-200 rounded">
						<div className="h-2 bg-primary rounded" style={{ width: `${pct(applicationsUsed, applicationsLimit)}%` }} />
					</div>
				</div>
			</div>
			<div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
				<span>Plan: {plan}</span>
				<span>•</span>
				<span>{resetText}</span>
				{jobViewsLimit === null || applicationsLimit === null ? (
					<span className="px-2 py-0.5 rounded bg-green-100 text-green-700">Unlimited</span>
				) : null}
				{graceActive && (
					<span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">Grace period active</span>
				)}
			</div>
		</div>
	);
}


