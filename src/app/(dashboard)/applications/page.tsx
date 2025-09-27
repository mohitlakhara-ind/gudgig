'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  MapPin,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Star,
  TrendingUp,
  Briefcase,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationsResponse, Application } from '@/types/api';

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    interviewing: applications.filter(app => app.status === 'interviewed').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    withdrawn: applications.filter(app => app.status === 'withdrawn').length
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchApplications();
  }, [isAuthenticated, currentPage, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page: currentPage, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const response: ApplicationsResponse = await apiClient.getApplications(params);
      setApplications(response.data);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.updateApplicationStatus(id, status);
      fetchApplications(); // Refresh list
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update application');
    }
  };

  const handleWithdrawApplication = async (id: string) => {
    try {
      await apiClient.withdrawApplication(id);
      fetchApplications(); // Refresh list
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to withdraw application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interviewed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewing': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <Star className="h-4 w-4" />;
      case 'interviewed': return <Eye className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'withdrawn': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDaysSinceApplied = (appliedDate: string) => {
    const today = new Date();
    const applied = new Date(appliedDate);
    const diffTime = Math.abs(today.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track and manage all your job applications in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Applications</span>
                  <span className="font-bold text-lg">{stats.total}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge variant="secondary">{stats.pending}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm">Interviewed</span>
                    </div>
                    <Badge variant="secondary">{stats.interviewing}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">Accepted</span>
                    </div>
                    <Badge variant="secondary">{stats.accepted}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="secondary">{stats.rejected}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/jobs">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse More Jobs
                  </Button>
                </Link>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Applications
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Employers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search applications..." className="pl-10" />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="recent">
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="company">Company A-Z</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading applications...</span>
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications found</h3>
                  <p className="text-gray-600 text-center">Start applying to jobs to see your applications here</p>
                </div>
              ) : (
                applications.map((application) => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg">Job Application</h3>
                              <Badge className={getStatusColor(application.status)}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1 capitalize">{application.status}</span>
                              </Badge>
                            </div>

                            <p className="text-gray-600 mb-2">Job ID: {application.job}</p>

                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {new Date(application.appliedAt).toLocaleDateString()} ({getDaysSinceApplied(application.appliedAt.toISOString().split('T')[0])} days ago)
                            </div>

                            {application.coverLetter && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <strong>Cover Letter:</strong> {application.coverLetter}
                              </p>
                            )}

                            {application.notes && application.notes.length > 0 && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                                <strong>Latest Note:</strong> {application.notes[application.notes.length - 1].content}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Link href={`/jobs/${application.job}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="h-4 w-4 mr-2" />
                              View Job
                            </Button>
                          </Link>

                          {application.status === 'accepted' && (
                            <Button size="sm">
                              View Offer
                            </Button>
                          )}

                          {application.status === 'interviewed' && (
                            <Button size="sm" variant="outline" className="bg-transparent">
                              Schedule
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleWithdrawApplication(application._id)}
                            disabled={application.status === 'withdrawn' || application.status === 'accepted'}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Load More */}
            <div className="text-center">
              {currentPage < totalPages ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Load More Applications
                </Button>
              ) : (
                <p className="text-gray-600">No more applications to load</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
