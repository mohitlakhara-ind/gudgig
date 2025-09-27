"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JobPromotionCardProps {
	jobId: string;
}

export default function JobPromotionCard({ jobId }: JobPromotionCardProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const startPromotion = async (tier: 'feature' | 'urgent' | 'highlight' | 'boost') => {
		try {
			setLoading(true);
			setError(null);
			// Placeholder checkout start; backend route to be implemented
			const res = await fetch(`/api/promotions/checkout`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ jobId, tier })
			});
			const data = await res.json();
			if (data?.data?.url) {
				window.location.href = data.data.url;
			}
		} catch (e: any) {
			setError(e?.message || 'Failed to start promotion');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Promote this Job</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{error && <div className="text-sm text-red-600">{error}</div>}
				<div className="grid grid-cols-2 gap-3">
					<Button disabled={loading} onClick={() => startPromotion('feature')}>Feature</Button>
					<Button disabled={loading} onClick={() => startPromotion('urgent')}>Urgent</Button>
					<Button disabled={loading} onClick={() => startPromotion('highlight')}>Highlight</Button>
					<Button disabled={loading} onClick={() => startPromotion('boost')}>Boost</Button>
				</div>
				<p className="text-xs text-muted-foreground">Increase visibility and get more applications.</p>
			</CardContent>
		</Card>
	);
}


