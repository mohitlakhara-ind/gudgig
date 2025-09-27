'use client';

import { useState, useEffect } from 'react';
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

export default function JobSeekerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stats, setStats] = useState({
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

  useEffect(() => {
    setIsVisible(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats, applications, and recommended jobs in parallel
      const [statsResponse, applicationsResponse, jobsResponse] = await Promise.all([
        apiClient.getJobSeekerStats(),
        apiClient.getApplications({ limit: 5 }),
        apiClient.getGigs({ limit: 5 }) // Use gigs for recommendations
      ]);

      // Update stats
      if (statsResponse.success && statsResponse.data) {
        const newStats = {
          applications: statsResponse.data.applications || 0,
          interviews: statsResponse.data.interviews || 0,
          offers: statsResponse.data.offers || 0,
          profileCompleteness: statsResponse.data.profileCompleteness || 0
        };
        setStats(newStats);

        // Animate stats
        setTimeout(() => {
          setAnimatedStats(newStats);
        }, 500);
      }

      // Update applications
      if (applicationsResponse.success) {
        setRecentApplications(applicationsResponse.data);
      }

      // Update recommended jobs
      if (jobsResponse.success) {
        setRecommendedJobs(jobsResponse.data);
      }

    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard data');
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
      fetchDashboardData();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to apply for job');
    } finally {
      setApplyingJobId(null);
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
      {/* Enhanced Welcome Section */}
      <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="glass-card rounded-3xl p-8 text-white relative overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-warning/20"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3 text-foreground">
                  Welcome back, {user?.name || 'Job Seeker'}!
                  <Sparkles className="h-8 w-8 text-warning animate-pulse" />
                </h1>
                <p className="text-primary-foreground/90 text-lg md:text-xl">
                  Discover services or become a seller in the marketplace.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.applications}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  Applications
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.interviews}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" />
                  Interviews
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.offers}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Offers
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.profileCompleteness}%</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Target className="h-4 w-4" />
                  Profile Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Quick Links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link className="px-3 py-2 rounded border" href="/dashboard/services">Browse Services</Link>
        <Link className="px-3 py-2 rounded border" href="/dashboard/create-service">Create Service</Link>
        <Link className="px-3 py-2 rounded border" href="/dashboard/orders">Orders</Link>
        <Link className="px-3 py-2 rounded border" href="/dashboard/messages">Messages</Link>
      </div>

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
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-success" />
                Applications Timeline
              </CardTitle>
              <CardDescription>Recent months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <Line data={applicationsTimelineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <Doughnut data={statusBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
          {/* Enhanced Profile Card */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary rounded-bl-full opacity-20"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-medium">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.experience || 'Experience level'}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {user?.location || 'Location not set'}
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
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-warning" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start hover:scale-105 transition-transform glow-primary" asChild>
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse MicroJobs
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/applications">
                  <FileText className="h-4 w-4 mr-2" />
                  View Applications
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/notifications">
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
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
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
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading applications...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <div key={app._id} className={`p-6 rounded-xl border hover:shadow-medium transition-all duration-300 animate-slide-in-left ${getStatusColor(app.status).replace('bg-', 'bg-').replace('text-', 'text-')}`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground">Job Application</h4>
                          <p className="text-muted-foreground text-sm">Job ID: {app.job}</p>
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
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Star className="h-6 w-6 mr-2 text-warning" />
                  Recommended for You
                </CardTitle>
                <CardDescription>MicroJobs matched to your profile</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform bg-transparent">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading recommended jobs...</span>
                </div>
              ) : (
                <div className="grid gap-4">
                  {recommendedJobs.map((job, index) => (
                    <div key={job._id} className={`p-6 rounded-xl border hover:shadow-medium transition-all duration-300 hover:border-primary/50 group animate-slide-in-right`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{job.title}</h4>
                          <p className="text-muted-foreground text-sm">{typeof job.company === 'object' ? job.company.name : 'Company Name'}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="font-medium text-success">
                              {job.salary.min && job.salary.max
                                ? `${job.salary.currency}${job.salary.min} - ${job.salary.currency}${job.salary.max}`
                                : job.salary.min
                                ? `From ${job.salary.currency}${job.salary.min}`
                                : job.salary.max
                                ? `Up to ${job.salary.currency}${job.salary.max}`
                                : 'Salary not disclosed'
                              }
                            </span>
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button size="sm" className="hover:scale-105 transition-transform glow-primary" onClick={() => handleApply(job._id)} disabled={applyingJobId === job._id}>
                            {applyingJobId === job._id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Interviews */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
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
              <div className="flex flex-col items-center justify-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No upcoming interviews</h3>
                <p className="text-gray-600 text-center">Interview schedules will appear here once your applications are reviewed</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

