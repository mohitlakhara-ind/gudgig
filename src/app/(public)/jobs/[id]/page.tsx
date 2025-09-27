"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	MapPin,
	Clock,
	DollarSign,
	Building2,
	Calendar,
	Users,
	Share2,
	Bookmark,
	ArrowLeft,
	CheckCircle,
	Star
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import type { Job } from '@/types/api';
import SubscriptionBanner from '@/components/ui/subscription-banner';
import SubscriptionGate from '@/components/subscription/SubscriptionGate';
import UpgradeModal from '@/components/subscription/UpgradeModal';
import UsageMeter from '@/components/subscription/UsageMeter';

export default function JobDetailPage({ params }: { params: { id: string } }) {
	const [job, setJob] = useState<Job | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showUpgrade, setShowUpgrade] = useState(false);

	const fetchJob = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
    const response = await apiClient.getJob(params.id);
    setJob(response.data as any);
    const hasFullAccess = (response as any)?.subscription?.hasFullAccess ?? (response as any)?.data?.subscription?.hasFullAccess;
    // Optionally show banner when low remaining usage
		} catch (e: any) {
			setError(e?.message || 'Failed to load job');
		} finally {
			setLoading(false);
		}
	}, [params.id]);

	useEffect(() => {
		fetchJob();
	}, [fetchJob]);

	if (loading) {
		return (
			<main className="container mx-auto px-4 py-8">
				Loading job...
			</main>
		);
	}

	if (error || !job) {
		return (
			<main className="container mx-auto px-4 py-8">
				<div className="text-destructive">{error || 'Microjob not found'}</div>
			</main>
		);
	}

	const isGig = ['micro-task', 'short-project', 'hourly', 'fixed-price', 'freelance'].includes(job.type as any);
	const budget = job.salaryDisclosure?.min || job.salary?.min;
	const budgetMax = job.salaryDisclosure?.max || job.salary?.max;
	const currency = job.salaryDisclosure?.currency || job.salary?.currency || 'USD';
	const budgetLabel = budget && budgetMax
		? `${currency}${budget.toLocaleString()} - ${currency}${budgetMax.toLocaleString()}`
		: budget ? `From ${currency}${budget.toLocaleString()}`
		: budgetMax ? `Up to ${currency}${budgetMax.toLocaleString()}`
		: isGig ? 'Project budget not disclosed' : 'Salary not disclosed';

	return (
		<>
			<main className="container mx-auto px-4 py-8">
				{/* Back Button */}
				<div className="mb-6">
					<Link href="/jobs">
						<Button variant="ghost" className="mb-4">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Jobs
						</Button>
					</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Job Header */}
						<Card>
							<CardHeader>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											{job.featured && (
												<Badge variant="secondary" className="bg-blue-100 text-blue-800">
													Featured
												</Badge>
											)}
											{job.urgent && (
												<Badge variant="destructive">
													Urgent
												</Badge>
											)}
											<Badge variant="outline">
												{job.category}
											</Badge>
										</div>
										<CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
										<CardDescription className="flex items-center text-lg text-gray-600 mb-4">
											<Building2 className="h-5 w-5 mr-2" />
											{typeof job.company === 'object' ? job.company.name : 'Client'}
										</CardDescription>

										<div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
											<div className="flex items-center">
												<MapPin className="h-4 w-4 mr-1" />
												{job.location}
											</div>
											<div className="flex items-center">
												<Clock className="h-4 w-4 mr-1" />
												{job.type}
											</div>
											<div className="flex items-center">
												<DollarSign className="h-4 w-4 mr-1" />
												{budgetLabel}
											</div>
											<div className="flex items-center">
												<Calendar className="h-4 w-4 mr-1" />
												Posted {new Date(job.createdAt).toLocaleDateString()}
											</div>
										</div>
									</div>

									<div className="flex flex-col space-y-2">
										<Button size="lg">
											Place Bid
										</Button>
										<div className="flex space-x-2">
											<Button variant="outline" size="sm" className="bg-transparent">
												<Bookmark className="h-4 w-4" />
											</Button>
											<Button variant="outline" size="sm" className="bg-transparent">
												<Share2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</CardHeader>
						</Card>

						{/* Job Description */}
						<Card>
							<CardHeader>
								<CardTitle>Job Description</CardTitle>
							</CardHeader>
							<CardContent>
								<SubscriptionGate type="hard" preview={<p className="text-gray-700 leading-relaxed">Upgrade to view the full description.</p>} onUpgradeClick={() => setShowUpgrade(true)}>
									<p className="text-gray-700 leading-relaxed mb-6">
										{job.description}
									</p>
								</SubscriptionGate>

								<div className="grid md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold text-lg mb-3">Requirements</h4>
										<ul className="space-y-2">
											{(job.requirements || []).map((req, index) => (
												<li key={index} className="flex items-start">
													<CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
													<span className="text-gray-700">{req}</span>
												</li>
											))}
										</ul>
									</div>

									<div>
										<h4 className="font-semibold text-lg mb-3">Responsibilities</h4>
										<ul className="space-y-2">
											{(job as any).responsibilities ? (job as any).responsibilities.map((resp: string, index: number) => (
												<li key={index} className="flex items-start">
													<CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
													<span className="text-gray-700">{resp}</span>
												</li>
											)) : null}
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Skills Required */}
						<Card>
							<CardHeader>
								<CardTitle>Skills & Technologies</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{(job.skills || []).map((skill) => (
										<Badge key={skill} variant="secondary" className="px-3 py-1">
											{skill}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Benefits */}
						<Card>
							<CardHeader>
								<CardTitle>Benefits & Perks</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid md:grid-cols-2 gap-3">
									{(job.benefits || []).map((benefit, index) => (
										<div key={index} className="flex items-center">
											<Star className="h-4 w-4 text-yellow-500 mr-2" />
											<span className="text-gray-700">{benefit}</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Usage Meter */}
						<Card>
							<CardHeader>
						<CardTitle>Usage</CardTitle>
							</CardHeader>
							<CardContent>
						<UsageMeter />
						{/* Warn when remaining usage is low using headers meta */}
						{(() => {
							const meta = (job as any)?.meta as any;
							return null;
						})()}
							</CardContent>
						</Card>

						{/* Client Info */}
						<Card>
							<CardHeader>
								<CardTitle>About {typeof job.company === 'object' ? job.company.name : 'Client'}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center space-x-3">
									<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
										<Building2 className="h-6 w-6 text-gray-600" />
									</div>
									<div>
										<h4 className="font-semibold">{typeof job.company === 'object' ? job.company.name : 'Company'}</h4>
										<p className="text-sm text-gray-500">{(job as any).companyInfo?.industry || ''}</p>
									</div>
								</div>

								<p className="text-gray-600 text-sm">
									{(job as any).companyInfo?.description || ''}
								</p>

								<Separator />

								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-500">Company Size</span>
										<span className="font-medium">{(job as any).companyInfo?.size || '-'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Founded</span>
										<span className="font-medium">{(job as any).companyInfo?.founded || '-'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-500">Website</span>
										<a href={(job as any).companyInfo?.website || '#'} className="text-blue-600 hover:underline">
											Visit Site
										</a>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Bid Info */}
						<Card>
							<CardHeader>
								<CardTitle>Bid Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between">
									<span className="text-gray-500">Bid Deadline</span>
									<span className="font-medium">{job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : '—'}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Bids</span>
									<span className="font-medium">47 received</span>
								</div>

								<Separator />

								<div className="space-y-2">
									<h4 className="font-semibold text-sm">What happens next?</h4>
									<div className="text-sm text-gray-600 space-y-1">
										<p>1. We'll review your application within 3-5 business days</p>
										<p>2. If selected, you'll be invited for an initial screening call</p>
										<p>3. Technical interview with the development team</p>
										<p>4. Final interview with the hiring manager</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Quick Bid */}
						<Card>
							<CardHeader>
								<CardTitle>Place Bid</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-gray-600">
									Ready to take this microjob? Place your bid with your best offer.
								</p>
								<SubscriptionGate type="hard" onUpgradeClick={() => setShowUpgrade(true)}>
									<Button className="w-full" size="lg">
										Submit Bid
									</Button>
								</SubscriptionGate>
								<Button variant="outline" className="w-full bg-transparent">
									Save for Later
								</Button>
							</CardContent>
						</Card>
						<UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
					</div>
				</div>
			</main>
		</>
	);
}
