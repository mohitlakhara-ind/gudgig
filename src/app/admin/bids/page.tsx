'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  DollarSign, 
  Calendar, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  FileText,
  CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Bid {
  _id: string;
  quotation: string;
  proposal: string;
  bidFeePaid: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  paymentId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  job: {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
  };
}

export default function AdminBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchBids();
  }, [pagination.page, statusFilter, jobFilter]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      // Build params using apiClient, which targets backend base URL
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (statusFilter !== 'all') params.status = statusFilter === 'accepted' ? 'succeeded' : statusFilter === 'rejected' ? 'failed' : 'pending';
      if (jobFilter !== 'all') params.jobId = jobFilter;

      const res = await apiClient.getAllBids(params);
      const payload: any = res || {};
      const items = Array.isArray(payload.data) ? payload.data : [];
      // Normalize to match UI expectations (user/job/status fields)
      const normalized = items.map((b: any) => ({
        _id: b._id,
        quotation: String(b.quotation ?? ''),
        proposal: b.proposal ?? '',
        bidFeePaid: Number(b.bidFeePaid ?? 0),
        status: b.selectionStatus && b.selectionStatus !== 'pending'
          ? b.selectionStatus
          : (b.paymentStatus === 'succeeded' ? 'pending' : b.paymentStatus === 'failed' ? 'rejected' : 'pending'),
        paymentId: undefined,
        orderId: undefined,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt || b.createdAt,
        user: b.freelancer ? { _id: b.freelancer._id, name: b.freelancer.name, email: b.freelancer.email, role: 'freelancer' } : { _id: '', name: '-', email: '-', role: 'freelancer' },
        job: b.job ? { _id: b.job._id, title: b.job.title, description: '', category: b.job.category || 'general', status: 'active', createdAt: b.createdAt } : { _id: '', title: '-', description: '', category: 'general', status: 'active', createdAt: b.createdAt }
      }));

      setBids(normalized);
      setPagination(prev => ({
        ...prev,
        total: payload.total || 0,
        totalPages: payload.pages || payload.totalPages || 0
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'withdrawn':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (bidId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`/api/admin/bids/${bidId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update bid status');
      }

      toast.success(newStatus === 'accepted' ? 'Freelancer selected' : 'Bid rejected');
      fetchBids();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update bid status');
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bid.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bid.proposal.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalBidFees = bids
    .filter(bid => bid.status === 'accepted')
    .reduce((sum, bid) => sum + bid.bidFeePaid, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading bids...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bid Management</h1>
            <p className="text-muted-foreground">
              Review and manage all submitted bids
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                    <p className="text-2xl font-bold">{bids.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {bids.filter(bid => bid.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                    <p className="text-2xl font-bold text-green-600">
                      {bids.filter(bid => bid.status === 'accepted').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
      <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatAmount(totalBidFees)}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search bids by project, freelancer, or proposal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Status</option>
            <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    <option value="all">All Projects</option>
                    {/* Add job options here */}
          </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bids List */}
          {filteredBids.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bids found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' || jobFilter !== 'all'
                    ? 'No bids match your current filters.' 
                    : 'No bids have been submitted yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBids.map((bid) => (
                <Card key={bid._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Bid Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              <Link 
                                href={`/gigs/${bid.job._id}`}
                                className="hover:text-primary transition-colors"
                              >
                                {bid.job.title}
                              </Link>
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {bid.job.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(bid.status)}`}
                              >
                                {getStatusIcon(bid.status)}
                                <span className="ml-1 capitalize">{bid.status}</span>
                              </Badge>
                            </div>
        </div>
      </div>

                        {/* Freelancer Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{bid.user.name}</span>
                          <span className="text-muted-foreground">({bid.user.email})</span>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {bid.job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>Quoted: {formatAmount(Number(bid.quotation))}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {formatDate(bid.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span>Bid Fee: {formatAmount(bid.bidFeePaid)}</span>
        </div>
        </div>
      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-48">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          asChild
                        >
                          <Link href={`/gigs/${bid.job._id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Project
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          asChild
                        >
                          <Link href={`/admin/chat?userId=${bid.user._id}`}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Link>
                        </Button>

                        {bid.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleStatusChange(bid._id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleStatusChange(bid._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
      </div>

                    {/* Proposal Preview */}
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium mb-2">Proposal:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {bid.proposal}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}