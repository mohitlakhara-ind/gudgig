"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  Star,
  Zap,
  TrendingUp,
  Eye,
  Users,
  Target,
  Check,
  ArrowRight,
  Calendar,
  DollarSign,
  BarChart3,
  Megaphone,
  Rocket,
  Award,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
// import type { Metadata } from 'next';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Note: Client components cannot export metadata. Define it in a parent layout if needed.

export default function PromoteJobsPage() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<number>(7);
  // Mock data - in real app, this would come from API
  const promotionPackages = [
    {
      id: 'basic',
      name: 'Basic Boost',
      price: 29,
      period: '7 days',
      features: [
        'Featured placement for 7 days',
        'Priority in search results',
        'Email alerts to matching candidates',
        'Social media sharing',
        'Basic analytics report'
      ],
      popular: false,
      color: 'blue'
    },
    {
      id: 'premium',
      name: 'Premium Spotlight',
      price: 79,
      period: '14 days',
      features: [
        'All Basic Boost features',
        'Homepage spotlight placement',
        'Targeted candidate outreach',
        'Company profile highlight',
        'Detailed analytics dashboard',
        'Interview scheduling assistance'
      ],
      popular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Campaign',
      price: 149,
      period: '30 days',
      features: [
        'All Premium Spotlight features',
        'Dedicated account manager',
        'Custom candidate sourcing',
        'Multi-channel promotion',
        'Advanced targeting options',
        'Weekly performance reports',
        'Priority customer support'
      ],
      popular: false,
      color: 'gold'
    }
  ];

  const currentPromotions = [
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      package: 'Premium Spotlight',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-01-29',
      views: 1247,
      applications: 23,
      cost: 79
    },
    {
      id: 2,
      jobTitle: 'Full Stack Engineer',
      package: 'Basic Boost',
      status: 'active',
      startDate: '2024-01-12',
      endDate: '2024-01-19',
      views: 856,
      applications: 18,
      cost: 29
    }
  ];

  const promotionStats = {
    totalSpent: 108,
    totalViews: 2103,
    totalApplications: 41,
    avgCostPerApplication: 2.63,
    roi: 380
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageColor = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-500 bg-blue-50';
      case 'purple': return 'border-purple-500 bg-purple-50';
      case 'gold': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen">

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Promote Your Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Boost your microjob visibility and reach more qualified freelancers with our premium promotion features.
            Get up to 10x more bids with targeted project advertising.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats & Performance */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Promotion Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-bold text-lg">${promotionStats.totalSpent}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Views</span>
                  <span className="font-bold">{promotionStats.totalViews.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications Generated</span>
                  <span className="font-bold">{promotionStats.totalApplications}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg. Cost per Application</span>
                  <span className="font-bold">${promotionStats.avgCostPerApplication}</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ROI</span>
                    <Badge className="bg-green-100 text-green-800">
                      {promotionStats.roi}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Promote?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">Increased Visibility</p>
                    <p className="text-xs text-gray-600">Reach 5x more candidates</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm">Quality Applications</p>
                    <p className="text-xs text-gray-600">Targeted to qualified candidates</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-sm">Faster Hiring</p>
                    <p className="text-xs text-gray-600">Fill positions 60% faster</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-sm">Better ROI</p>
                    <p className="text-xs text-gray-600">Average 380% return on investment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Promotion Packages */}
          <div className="lg:col-span-3 space-y-8">
            {/* Promotion Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {promotionPackages.map((pkg) => (
                <Card key={pkg.id} className={`${getPackageColor(pkg.color)} ${pkg.popular ? 'ring-2 ring-purple-500' : ''}`}>
                  <CardHeader className="text-center">
                    {pkg.popular && (
                      <Badge className="bg-purple-500 text-white w-fit mx-auto mb-2">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                      <span className="text-gray-600">/{pkg.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs text-gray-600">Duration (days)</label>
                      <input type="number" min={1} max={60} value={durationDays} onChange={(e)=>setDurationDays(parseInt(e.target.value||'7',10))} className="w-24 border rounded px-2 py-1 text-sm" />
                    </div>

                    <Button
                      disabled={loadingId===pkg.id}
                      onClick={async ()=>{
                        try{
                          setError(null);
                          setLoadingId(pkg.id);
                          // For demo, ask user to manage promotions from specific job detail; here we require a jobId via prompt
                          const jobId = window.prompt('Enter Job ID to promote:');
                          if(!jobId) { setLoadingId(null); return; }
                          const tierMap: Record<string, 'feature'|'urgent'|'highlight'|'boost'> = { basic: 'feature', premium: 'highlight', enterprise: 'boost' };
                          const tier = tierMap[pkg.id] || 'feature';
                          const res = await apiClient.createJobPromotionCheckout(jobId, { tier, durationDays });
                          const url = res.data?.url;
                          if(url) window.location.href = url; else setError('Failed to start checkout');
                        } catch(e:any){
                          setError(e?.message||'Failed to start promotion checkout');
                        } finally{
                          setLoadingId(null);
                        }
                      }}
                      className={`w-full ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      {loadingId===pkg.id ? 'Processing...' : (pkg.popular ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get Started
                        </>
                      ) : (
                        'Choose Plan'
                      ))}
                    </Button>
                    {error && <div className="text-xs text-red-600">{error}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Current Promotions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Current Promotions</CardTitle>
                  <Link href="/employer/jobs">
                    <Button variant="ghost" size="sm">View All Projects</Button>
                  </Link>
                </div>
                <CardDescription>
                  Track the performance of your active job promotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPromotions.map((promo) => (
                    <div key={promo.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{promo.jobTitle}</h4>
                          <Badge className={getStatusColor(promo.status)}>
                            {promo.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{promo.package}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          {promo.startDate} - {promo.endDate}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-blue-600" />
                            <span>{promo.views.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-green-600" />
                            <span>{promo.applications} applications</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">${promo.cost}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Boost More
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card>
              <CardHeader>
                <CardTitle>Success Stories</CardTitle>
                <CardDescription>
                  See how other clients have succeeded with project promotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-3">
                      <Award className="h-8 w-8 text-yellow-600 mr-3" />
                      <div>
                        <h4 className="font-semibold">TechCorp Inc.</h4>
                        <p className="text-sm text-gray-600">Software Engineer Position</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">
                      "We filled our critical engineering role in just 2 weeks using Premium Spotlight.
                      The quality of applications was exceptional!"
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Applications: 45</span>
                      <span className="text-gray-600">Hired: 1</span>
                      <span className="font-semibold text-green-600">ROI: 520%</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center mb-3">
                      <Rocket className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-semibold">StartupXYZ</h4>
                        <p className="text-sm text-gray-600">Full Stack Developer</p>
                      </div>
                    </div>
                    <p className="text-sm mb-3">
                      "The Enterprise Campaign helped us reach developers we couldn't find elsewhere.
                      Perfect match for our startup culture!"
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Applications: 38</span>
                      <span className="text-gray-600">Hired: 2</span>
                      <span className="font-semibold text-green-600">ROI: 340%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Megaphone className="h-12 w-12 mx-auto mb-4 text-white" />
                  <h3 className="text-2xl font-bold mb-2">Ready to Get More Applications?</h3>
                  <p className="text-purple-100 mb-6">
                    Start promoting your projects today and reach thousands of qualified freelancers.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Start Promoting Now
                    </Button>
                    <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-purple-600">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

    </div>
  );
}
