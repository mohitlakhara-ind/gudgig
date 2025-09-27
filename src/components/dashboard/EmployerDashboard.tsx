'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building2,
  Users,
  Briefcase,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  Settings,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Sparkles,
  Zap,
  Trophy,
  ArrowRight,
  MessageCircle,
  Video,
  Phone,
  Activity,
  TrendingDown,
  Award,
  Globe,
  MapPin,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { Job, Application } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiresThisMonth: 0,
    viewsThisMonth: 0,
    responseRate: 0
  });
  const [animatedStats, setAnimatedStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiresThisMonth: 0,
    viewsThisMonth: 0,
    responseRate: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  useEffect(() => {
    setIsVisible(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats, jobs, and applications in parallel
      const [statsResponse, jobsResponse, applicationsResponse] = await Promise.all([
        apiClient.getEmployerStats(),
        apiClient.getGigs({ limit: 5 }),
        apiClient.getApplications({ limit: 5 })
      ]);

      // Update stats
      if (statsResponse.success && statsResponse.data) {
        const newStats = {
          activeJobs: statsResponse.data.activeJobs || 0,
          totalApplications: statsResponse.data.totalApplications || 0,
          interviewsScheduled: statsResponse.data.interviewsScheduled || 0,
          hiresThisMonth: statsResponse.data.hiresThisMonth || 0,
          viewsThisMonth: statsResponse.data.viewsThisMonth || 0,
          responseRate: statsResponse.data.responseRate || 0
        };
        setStats(newStats);

        // Animate stats
        setTimeout(() => {
          setAnimatedStats(newStats);
        }, 500);
      }

      // Update jobs
      if (jobsResponse.success) {
        setRecentJobs(jobsResponse.data);
      }

      // Update applications
      if (applicationsResponse.success) {
        setRecentApplications(applicationsResponse.data);
      }

    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'interviewing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  // Chart data builders
  const applicationsByMonthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [
          Math.max(2, Math.floor(stats.totalApplications * 0.1)),
          Math.max(3, Math.floor(stats.totalApplications * 0.15)),
          Math.max(4, Math.floor(stats.totalApplications * 0.2)),
          Math.max(5, Math.floor(stats.totalApplications * 0.2)),
          Math.max(6, Math.floor(stats.totalApplications * 0.2)),
          Math.max(7, Math.floor(stats.totalApplications * 0.15)),
        ],
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const viewsVsApplicationsData = {
    labels: ['Views', 'Applications', 'Interviews', 'Hires'],
    datasets: [
      {
        label: 'Counts',
        data: [stats.viewsThisMonth, stats.totalApplications, stats.interviewsScheduled, stats.hiresThisMonth],
        backgroundColor: [
          'rgba(99,102,241,0.6)',
          'rgba(59,130,246,0.6)',
          'rgba(16,185,129,0.6)',
          'rgba(234,179,8,0.6)'
        ],
        borderColor: [
          'rgba(99,102,241,1)',
          'rgba(59,130,246,1)',
          'rgba(16,185,129,1)',
          'rgba(234,179,8,1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const applicationStatusDistribution = (() => {
    const statusCounts: Record<string, number> = { interviewing: 0, reviewing: 0, rejected: 0, accepted: 0 };
    recentApplications.forEach(a => {
      if (statusCounts[a.status] !== undefined) statusCounts[a.status] += 1;
    });
    return {
      labels: ['Interviewing', 'Reviewing', 'Rejected', 'Accepted'],
      datasets: [
        {
          data: [statusCounts.interviewing, statusCounts.reviewing, statusCounts.rejected, statusCounts.accepted],
          backgroundColor: [
            'rgba(59,130,246,0.6)',
            'rgba(234,179,8,0.6)',
            'rgba(239,68,68,0.6)',
            'rgba(34,197,94,0.6)'
          ],
          borderColor: [
            'rgba(59,130,246,1)',
            'rgba(234,179,8,1)',
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

      {/* Enhanced Page Header */}
      <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>

          <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3 flex items-center gap-3 text-text">
                  Welcome back, {user?.name || 'Employer'}!
                  <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-primary-foreground/90 text-lg md:text-xl">Find the perfect talent to grow your team</p>
              </div>
              <Building2 className="h-10 w-10 text-white" />
            </div>      

            {/* Marketplace Quick Links */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors" href="/dashboard/services">Browse Services</Link>
              <Link className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors" href="/dashboard/orders">Manage Orders</Link>
              <Link className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors" href="/dashboard/messages">Messages</Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.activeJobs}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  Active MicroJobs
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.totalApplications}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Users className="h-4 w-4" />
                  Applications
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.interviewsScheduled}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Video className="h-4 w-4" />
                  Interviews
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.hiresThisMonth}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4" />
                  Hires
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.viewsThisMonth.toLocaleString()}</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4" />
                  Views
                </div>
              </div>
              <div className="glass rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <div className="text-2xl font-bold text-white">{animatedStats.responseRate}%</div>
                <div className="text-white/90 text-sm flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Response Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Jobs & Applications */}
        <div className="lg:col-span-2 space-y-8">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  Applications Over Time
                </CardTitle>
                <CardDescription>Recent application trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <Line data={applicationsByMonthData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Pipeline Overview
                </CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <Bar data={viewsVsApplicationsData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Recent Jobs */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-6 w-6 text-primary" />
                  Recent MicroJobs
                </CardTitle>
                <CardDescription>
                  Your latest microjobs and their performance
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform bg-transparent">
                <Link href="/employer/jobs">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading jobs...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job, index) => (
                    <div key={job._id} className={`flex items-center justify-between p-6 rounded-xl border hover:shadow-medium transition-all duration-300 animate-slide-in-left`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.applicationsCount} bids
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            {job.views} views
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Recent Applications
                </CardTitle>
                <CardDescription>
                  Latest candidates who applied to your positions
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="hover:scale-105 transition-transform bg-transparent">
                <Link href="/employer/applications">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
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
                  {recentApplications.map((application, index) => (
                    <div key={application._id} className={`flex items-center justify-between p-6 rounded-xl border hover:shadow-medium transition-all duration-300 animate-slide-in-left`} style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">Applicant {application.applicant}</h3>
                            <p className="text-sm text-muted-foreground">Job {application.job}</p>
                          </div>
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </span>
                          {application.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {application.rating}/5.0
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:scale-110 transition-transform bg-transparent">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:scale-110 transition-transform bg-transparent">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Interviews & Quick Actions */}
        <div className="space-y-8">
          {/* Status Distribution */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-6 w-6 text-blue-600" />
                Application Status
              </CardTitle>
              <CardDescription>Recent applications breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Doughnut data={applicationStatusDistribution} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
          {/* Upcoming Interviews */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Video className="h-6 w-6 text-green-600" />
                Upcoming Interviews
              </CardTitle>
              <CardDescription>
                Your scheduled interviews for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No upcoming interviews</h3>
                <p className="text-gray-600 text-center">Interview schedules will appear here once applications are reviewed</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-6 w-6 text-orange-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start hover:scale-105 transition-transform glow-primary" asChild>
                <Link href="/employer/post-job">
                    <Plus className="h-4 w-4 mr-2" />
                  Post New MicroJob
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                  <Link href="/employer/applications">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Applications
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                <Link href="/employer/promote">
                    <TrendingUp className="h-4 w-4 mr-2" />
                  Promote MicroJobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform bg-transparent" asChild>
                  <Link href="/profile">
                    <Settings className="h-4 w-4 mr-2" />
                    Company Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="glass-card border-0 shadow-strong hover:shadow-soft transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Performance Insights
              </CardTitle>
              <CardDescription>
                Key metrics for your hiring process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Response Rate</span>
                    <span className="text-sm text-muted-foreground">{stats.responseRate}%</span>
                  </div>
                  <Progress value={stats.responseRate} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Interview to Hire Ratio</span>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </div>
                  <Progress value={20} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Time to Fill</span>
                    <span className="text-sm text-muted-foreground">12 days</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Goal</span>
                    <span className="text-sm text-muted-foreground">3/5 hires</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Progress value={60} className="flex-1 h-2" />
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
