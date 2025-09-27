"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Job } from '@/types/api';
import SubscriptionGate from '@/components/subscription/SubscriptionGate';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import { Lock } from 'lucide-react';

export default function JobCard({ job }: { job: Job }) {
	const [openUpgrade, setOpenUpgrade] = useState(false);

const salaryText = useMemo(() => {
	const min = job.salaryDisclosure?.min ?? job.salary?.min;
	const max = job.salaryDisclosure?.max ?? job.salary?.max;
	const currency = job.salaryDisclosure?.currency ?? job.salary?.currency ?? 'USD';
	if (min && max) return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
	if (min) return `From ${currency}${min.toLocaleString()}`;
	if (max) return `Up to ${currency}${max.toLocaleString()}`;
	return 'Salary not disclosed';
}, [job]);

const preview = (
		<div className="relative" aria-label="Subscription preview">
			<div className="flex items-center gap-2 mb-2" aria-hidden>
				{(job as any).promotion?.featured && <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Featured</span>}
				{(job as any).promotion?.urgent && <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Urgent</span>}
				{(job as any).promotion?.highlighted && <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800">Highlighted</span>}
			</div>
			<h3 className="text-lg font-semibold mb-1 flex items-center gap-1">
				{job.title}
				<Lock className="w-4 h-4 text-gray-400" aria-label="Locked details" />
			</h3>
			<p className="text-sm text-muted-foreground">{typeof job.company === 'object' ? job.company.name : 'Company'}</p>
			<p className="text-sm mt-2">{job.location} • {job.type}</p>
			<p className="text-sm mt-1 text-gray-700">{salaryText}</p>
			<div className="mt-3 text-sm text-gray-600">Unlock full details, description, and application instructions.</div>
		</div>
);

	return (
		<div className="glass-card rounded-2xl p-4 hover:shadow-strong transition group focus-within:ring-2 focus-within:ring-ring" role="article" aria-labelledby={`job-${job._id}-title`}>
			<SubscriptionGate type="soft" preview={preview} onUpgradeClick={() => setOpenUpgrade(true)}>
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h3 id={`job-${job._id}-title`} className="text-lg font-semibold mb-1">
							<Link href={`/jobs/${job._id}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">{job.title}</Link>
						</h3>
						<p className="text-sm text-muted-foreground">{typeof job.company === 'object' ? job.company.name : 'Company'}</p>
						<p className="text-sm mt-2">{job.location} • {job.type}</p>
						<p className="text-sm mt-1 text-gray-700">{salaryText}</p>
					</div>
					<div className="flex flex-col items-end gap-2">
						<div className="flex items-center gap-2" aria-hidden>
							{(job as any).promotion?.featured && <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Featured</span>}
							{(job as any).promotion?.urgent && <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Urgent</span>}
							{(job as any).promotion?.highlighted && <span className="px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-800">Highlighted</span>}
						</div>
						<Link href={`/jobs/${job._id}`} className="text-primary text-sm hover:underline">View details</Link>
					</div>
				</div>
				<p className="text-sm mt-3 line-clamp-3">{(job as any).previewDescription || job.description}</p>
			</SubscriptionGate>
			<UpgradeModal open={openUpgrade} onClose={() => setOpenUpgrade(false)} />
		</div>
	);
}


