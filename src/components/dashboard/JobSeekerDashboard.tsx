'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Briefcase,
  MapPin,
  Calendar,
  TrendingUp,
  Bell,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  FileText,
  Target,
  Award,
  Plus,
  ArrowRight,
  Sparkles,
  Trophy,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  Users,
  Globe,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, ApiClientError } from '@/lib/api';
import { Application, Job } from '@/types/api';
import DismissibleBanner from './DismissibleBanner';
import StatCard from './StatCard';
import EmptyState from './EmptyState';
import { DashboardStatsSkeleton, ApplicationCardSkeleton, ProfileCardSkeleton, RecommendedJobSkeleton, ChartSkeleton, WelcomeBannerSkeleton } from '@/components/ui/loading-skeleton';
import CustomLoader from '@/components/CustomLoader';
import { DASHBOARD, CARD_LAYOUT, SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
import { useAuth } from '@/contexts/AuthContext';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function GigSeekerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [appsError, setAppsError] = useState<string | null>(null);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    profileCompleteness: 0
  });
  const [prevStats, setPrevStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    profileCompleteness: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    profileCompleteness: 0
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [savingJobId, setSavingJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ keyword: string; category: string; location: string }>({ keyword: '', category: '', location: '' });

  useEffect(() => {
    setIsVisible(true);
    fetchAll();
    const interval = setInterval(() => {
      fetchStats();
      fetchApplications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const statsResponse = await apiClient.getFreelancerStats();
      if (statsResponse.success && statsResponse.data) {
        const newStats = {
          applications: statsResponse.data.applications || 0,
          interviews: statsResponse.data.interviews || 0,
          offers: statsResponse.data.offers || 0,
          profileCompleteness: statsResponse.data.profileCompleteness || 0,
          // Additional comprehensive stats
          activeServices: statsResponse.data.activeServices || 0,
          totalServices: statsResponse.data.totalServices || 0,
          totalOrders: statsResponse.data.totalOrders || 0,
          monthlyOrders: statsResponse.data.monthlyOrders || 0,
          activeOrders: statsResponse.data.activeOrders || 0,
          completedOrders: statsResponse.data.completedOrders || 0,
          totalEarnings: statsResponse.data.totalEarnings || 0,
          monthlyEarnings: statsResponse.data.monthlyEarnings || 0,
          pendingEarnings: statsResponse.data.pendingEarnings || 0,
          availableBalance: statsResponse.data.availableBalance || 0,
          averageRating: statsResponse.data.averageRating || 0,
          totalReviews: statsResponse.data.totalReviews || 0,
          recentOrders: statsResponse.data.recentOrders || [],
          recentReviews: statsResponse.data.recentReviews || [],
          recentActivity: statsResponse.data.recentActivity || []
        };
        setPrevStats(stats);
        setStats(newStats);
        setTimeout(() => {
          setAnimatedStats(newStats);
        }, 300);
      }
    } catch (err) {
      setStatsError(err instanceof ApiClientError ? err.message : 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  }, [stats]);

  const fetchApplications = useCallback(async () => {
    try {
      setAppsLoading(true);
      setAppsError(null);
      const applicationsResponse = await apiClient.getApplications({ limit: 5 });
      if (applicationsResponse.success) {
        setRecentApplications(applicationsResponse.data || []);
      }
    } catch (err) {
      setAppsError(err instanceof ApiClientError ? err.message : 'Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      setRecsLoading(true);
      setRecsError(null);
      const jobsResponse = await apiClient.getGigs({ limit: 5, category: filters.category || undefined, status: 'active' });
      if (jobsResponse.success) {
        let data = jobsResponse.data;
        if (filters.keyword) {
          const kw = filters.keyword.toLowerCase();
          data = data?.filter(j => j.title.toLowerCase().includes(kw)) || [];
        }
        if (filters.location) {
          const loc = filters.location.toLowerCase();
          data = data?.filter(j => (j.location || '').toLowerCase().includes(loc)) || [];
        }
        setRecommendedJobs(data || []);
      }
    } catch (err) {
      setRecsError(err instanceof ApiClientError ? err.message : 'Failed to load recommendations');
    } finally {
      setRecsLoading(false);
    }
  }, [filters]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStats(), fetchApplications(), fetchRecommendations()]);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    if (!isAuthenticated) {
      router.push('/login?next=/dashboard');
      return;
    }
    try {
      setApplyingJobId(jobId);
      setError(null);
      setSuccess(null);
      await apiClient.createApplication({ job: jobId, coverLetter: '' });
      setSuccess('Application submitted successfully!');
      fetchAll();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to apply for job');
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (!isAuthenticated) {
      router.push('/login?next=/dashboard');
      return;
    }
    try {
      setSavingJobId(jobId);
      setError(null);
      setSuccess(null);
      await apiClient.saveJob(jobId);
      setSuccess('Job saved successfully');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to save job');
    } finally {
      setSavingJobId(null);
    }
  };

  const handleCreateAlert = async () => {
    if (!isAuthenticated) {
      router.push('/login?next=/dashboard');
      return;
    }
    try {
      setError(null);
      setSuccess(null);
      await apiClient.createJobAlert({ keyword: filters.keyword || undefined, category: filters.category || undefined, location: filters.location || undefined });
      setSuccess('Job alert created');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to create alert');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning border-warning/30 dark:bg-warning/10 dark:text-warning dark:border-warning/20';
      case 'interviewing': return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary dark:border-primary/20';
      case 'rejected': return 'bg-destructive/20 text-destructive border-destructive/30 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/20';
      case 'accepted': return 'bg-success/20 text-success border-success/30 dark:bg-success/10 dark:text-success dark:border-success/20';
      default: return 'bg-muted text-muted-foreground border-border dark:bg-muted/10 dark:text-muted-foreground dark:border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'interviewing': return <Eye className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Charts
  const applicationsTimelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [
          Math.max(1, Math.floor(stats.applications * 0.1)),
          Math.max(1, Math.floor(stats.applications * 0.15)),
          Math.max(1, Math.floor(stats.applications * 0.2)),
          Math.max(1, Math.floor(stats.applications * 0.2)),
          Math.max(1, Math.floor(stats.applications * 0.2)),
          Math.max(1, Math.floor(stats.applications * 0.15)),
        ],
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const statusBreakdownData = (() => {
    const statusCounts: Record<string, number> = { pending: 0, interviewing: 0, rejected: 0, accepted: 0 };
    recentApplications.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status] += 1;
    });
    return {
      labels: ['Pending', 'Interviewing', 'Rejected', 'Accepted'],
      datasets: [
        {
          data: [statusCounts.pending, statusCounts.interviewing, statusCounts.rejected, statusCounts.accepted],
          backgroundColor: [
            'rgba(234,179,8,0.6)',
            'rgba(59,130,246,0.6)',
            'rgba(239,68,68,0.6)',
            'rgba(34,197,94,0.6)'
          ],
          borderColor: [
            'rgba(234,179,8,1)',
            'rgba(59,130,246,1)',
            'rgba(239,68,68,1)',
            'rgba(34,197,94,1)'
          ],
          borderWidth: 1,
        }
      ]
    };
  })();

  return (
    <>
      {/* Welcome Banner */}
      {statsLoading ? (
        <WelcomeBannerSkeleton />
      ) : (
        <DismissibleBanner id="jobseeker-welcome" variant="compact">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                Welcome back, {user?.name || 'Freelancer'}!
                <Sparkles className="h-6 w-6" />
              </h1>
              <p className="text-primary-foreground/90 text-base md:text-lg">Discover gigs and grow your freelancing career.</p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6" aria-label="Dashboard statistics">
            <StatCard label="Applications" value={animatedStats.applications} icon={FileText} tooltip="Total applications submitted" trend={{ value: Math.max(0, animatedStats.applications - prevStats.applications), direction: (animatedStats.applications - prevStats.applications) >= 0 ? 'up' : 'down' }} />
            <StatCard label="Interviews" value={animatedStats.interviews} icon={Eye} tooltip="Scheduled interviews" trend={{ value: Math.max(0, animatedStats.interviews - prevStats.interviews), direction: (animatedStats.interviews - prevStats.interviews) >= 0 ? 'up' : 'down' }} />
            <StatCard label="Offers" value={animatedStats.offers} icon={Trophy} tooltip="Job offers received" trend={{ value: Math.max(0, animatedStats.offers - prevStats.offers), direction: (animatedStats.offers - prevStats.offers) >= 0 ? 'up' : 'down' }} />
            <StatCard label="Profile" value={`${animatedStats.profileCompleteness}%`} icon={Target} tooltip="Profile completion percentage" trend={{ value: Math.max(0, animatedStats.profileCompleteness - prevStats.profileCompleteness), direction: (animatedStats.profileCompleteness - prevStats.profileCompleteness) >= 0 ? 'up' : 'down' }} />
          </div>
        </DismissibleBanner>
      )}

      {/* Quick links moved into section headers per refactor */}

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg text-success">
          <CheckCircle className="h-5 w-5 inline mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Profile & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Charts */}
          {statsLoading ? (
            <>
              <ChartSkeleton height="h-40" />
              <ChartSkeleton height="h-48" />
            </>
          ) : (
            <>
              <Card className="bg-card rounded-xl border border-border shadow-sm">
                <CardHeader className="px-6 py-4 border-b border-border pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-success" />
                    Applications Timeline
                  </CardTitle>
                  <CardDescription>Recent months</CardDescription>
                </CardHeader>
                <CardContent className="px-6 py-5">
                  <div className="h-40">
                    <Line data={applicationsTimelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card rounded-xl border border-border shadow-sm">
                <CardHeader className="px-6 py-4 border-b border-border pb-4">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 py-5">
                  <div className="h-48">
                    <Doughnut data={statusBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {/* Enhanced Profile Card */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary rounded-bl-full opacity-20"></div>
            <CardContent className="px-6 py-5 pt-6 relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-medium">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{user?.name}</h3>
                  <p className="text-muted-foreground">{(user as any)?.experience || 'Experience level'}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {(user as any)?.location || 'Location not set'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Profile Completeness</span>
                    <span className="font-semibold text-primary">{stats.profileCompleteness}%</span>
                  </div>
                  <Progress value={stats.profileCompleteness} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-xl font-bold text-primary">{stats.applications}</div>
                    <div className="text-xs text-muted-foreground">Applications</div>
                  </div>
                  <div className="text-center p-3 glass rounded-lg">
                    <div className="text-xl font-bold text-success">{stats.interviews}</div>
                    <div className="text-xs text-muted-foreground">Interviews</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="px-6 py-4 pb-4 border-b border-border">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-warning" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5 space-y-3">
              <Button className="w-full justify-start hover:scale-105 transition-transform glow-primary" asChild>
                <Link href="/gigs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Gigs
                </Link>
              </Button>
              <Button className="w-full justify-start hover:scale-105 transition-transform" asChild>
                <Link href="/saved-gigs">
                  <Heart className="h-4 w-4 mr-2" />
                  Saved Gigs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/orders">
                  <Eye className="h-4 w-4 mr-2" />
                  My Orders
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                {/* Messages page not implemented */}
                {/* <Link href="/dashboard/messages"> */}
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                {/* </Link> */}
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/profile">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Recent Applications */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Clock className="h-6 w-6 mr-2 text-primary" />
                  Recent Applications
                </CardTitle>
                <CardDescription>Track your latest job applications</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <ApplicationCardSkeleton key={i} />)}</div>
              ) : recentApplications.length === 0 ? (
                <EmptyState icon={FileText} title="No applications yet" description="Start applying to gigs to see your application history here" action={{ label: 'Browse Gigs', onClick: () => router.push('/gigs') }} />
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <div key={app._id} className={`p-6 rounded-xl border hover:shadow-medium transition-all duration-300 animate-fade-in-scale`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">Job Application</h4>
                          <p className="text-muted-foreground text-sm">Job ID: {typeof app.job === 'string' ? app.job : app.job?._id || 'Unknown'}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(app.status)} border-0`}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1 capitalize">{app.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {appsError && (
                <div className="mt-4 p-3 text-sm rounded border border-destructive/20 text-destructive bg-destructive/10">{appsError}</div>
              )}
            </CardContent>
          </Card>

          {/* Services Management */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Briefcase className="h-6 w-6 mr-2 text-primary" />
                  My Services
                </CardTitle>
                <CardDescription>Manage your service offerings</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/dashboard/services">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-primary">{animatedStats?.applications ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Active Services</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-success">{animatedStats?.interviews ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Orders This Month</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-warning">{animatedStats?.offers ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href="/dashboard/create-service">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Service
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                  <Link href="/dashboard/orders">
                    <Eye className="h-4 w-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Earnings & Analytics */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-success" />
                  Earnings Overview
                </CardTitle>
                <CardDescription>Track your financial performance</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-success">${animatedStats?.applications ?? 0}</div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-primary">${animatedStats?.interviews ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Total Earned</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-warning">${animatedStats?.offers ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="text-center p-4 glass rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">${animatedStats?.profileCompleteness ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-success mr-2" />
                  <span className="text-sm font-medium">
                    {animatedStats?.applications && animatedStats?.interviews 
                      ? `+${Math.round((animatedStats.applications / (animatedStats.interviews - animatedStats.applications)) * 100)}% from last month`
                      : '+23% from last month'
                    }
                  </span>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Growing
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Learning */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Award className="h-6 w-6 mr-2 text-warning" />
                  Skill Development
                </CardTitle>
                <CardDescription>Enhance your expertise and marketability</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                Browse Courses <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Web Development Mastery</h4>
                      <p className="text-sm text-muted-foreground">Complete modern web development course</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">65%</div>
                    <Progress value={65} className="w-20 h-2 mt-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mr-3">
                      <Users className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium">Digital Marketing</h4>
                      <p className="text-sm text-muted-foreground">Social media and content marketing</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">90%</div>
                    <Progress value={90} className="w-20 h-2 mt-1" />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Skill Goal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews & Feedback */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-6 w-6 mr-2 text-warning" />
                  Reviews & Ratings
                </CardTitle>
                <CardDescription>Your reputation and client feedback</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-2">4.9</div>
                  <div className="flex justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">Based on 47 reviews</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">5 stars</span>
                    <Progress value={85} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4 stars</span>
                    <Progress value={12} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">3 stars</span>
                    <Progress value={3} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground">3%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    JD
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">John Doe</span>
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-3 w-3 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">"Excellent work quality and fast delivery. Highly recommended!"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Clock className="h-6 w-6 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Order completed successfully</p>
                    <p className="text-xs text-muted-foreground">Logo design for TechCorp - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message received</p>
                    <p className="text-xs text-muted-foreground">Client inquiry about web development - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New 5-star review</p>
                    <p className="text-xs text-muted-foreground">Sarah M. left a review for your service - 1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New service published</p>
                    <p className="text-xs text-muted-foreground">Mobile App UI Design is now live - 2 days ago</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-6 w-6 mr-2 text-warning" />
                  Recommended for You
                </CardTitle>
                <CardDescription>MicroJobs matched to your profile</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="h-9 px-2 rounded-md border border-input bg-background text-sm"
                  value={filters.category}
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                </select>
                <input
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="Keyword"
                  value={filters.keyword}
                  onChange={e => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                  aria-label="Filter by keyword"
                />
                <input
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                  placeholder="Location"
                  value={filters.location}
                  onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  aria-label="Filter by location"
                />
                <Button size="sm" onClick={fetchRecommendations}>Apply Filters</Button>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => router.push('/gigs')}>Browse All</Button>
              </div>
            </CardHeader>
            <CardContent>
              {recsLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <RecommendedJobSkeleton key={i} />)}</div>
              ) : recommendedJobs.length === 0 ? (
                <EmptyState icon={Star} title="No recommendations yet" description="Complete your profile to get personalized gig recommendations" action={{ label: 'Complete Profile', onClick: () => router.push('/dashboard/profile') }} secondaryAction={{ label: 'Browse All Gigs', onClick: () => router.push('/gigs') }} />
              ) : (
                <div className="grid gap-4">
                  {recommendedJobs.map((job, index) => (
                    <div key={job._id} className={`bg-card rounded-xl border border-border shadow-sm p-6 hover:shadow-md hover:border-primary/50 transition-all`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">{job.title}</h4>
                          <p className="text-muted-foreground text-sm">{typeof job.company === 'object' ? job.company.name : 'Company Name'}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="font-medium text-success">
                              {job.salary?.min && job.salary?.max
                                ? `${job.salary.currency}${job.salary.min} - ${job.salary.currency}${job.salary.max}`
                                : job.salary?.min
                                ? `From ${job.salary.currency}${job.salary.min}`
                                : job.salary?.max
                                ? `Up to ${job.salary.currency}${job.salary.max}`
                                : 'Salary not disclosed'}
                            </span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleSaveJob(job._id)} disabled={savingJobId === job._id}>
                            {savingJobId === job._id ? <CustomLoader size={16} color="#1FA9FF" /> : <>
                              <Heart className="h-4 w-4 mr-1" /> Save
                            </>}
                          </Button>
                          <Button size="sm" className="hover:scale-105 transition-transform glow-primary" onClick={() => handleApply(job._id)} disabled={applyingJobId === job._id}>
                            {applyingJobId === job._id ? <CustomLoader size={16} color="#1FA9FF" /> : 'Apply'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {recsError && (
                <div className="mt-4 p-3 text-sm rounded border border-destructive/20 text-destructive bg-destructive/10">{recsError}</div>
              )}
              <div className="mt-4 flex items-center justify-end">
                <Button variant="ghost" size="sm" onClick={handleCreateAlert}><Bell className="h-4 w-4 mr-1" /> Set Alert</Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="bg-card rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-accent" />
                  Upcoming Interviews
                </CardTitle>
                <CardDescription>Don't miss your scheduled interviews</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View Calendar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <EmptyState icon={Calendar} title="No upcoming interviews" description="Interview schedules will appear here once your applications are reviewed" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

