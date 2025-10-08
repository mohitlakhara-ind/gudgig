'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Briefcase,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { bidService } from '@/services/bidService';

interface Bid {
  _id: string;
  quotation: string;
  proposal: string;
  bidFeePaid: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  selectionStatus?: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  paymentId?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
  job: {
    _id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
  };
}

export default function BidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchBids();
    
    // Listen for new bid events
    const handleBidCreated = () => {
      fetchBids();
    };
    
    window.addEventListener('bidCreated', handleBidCreated);
    
    return () => {
      window.removeEventListener('bidCreated', handleBidCreated);
    };
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      
      // Try real backend via apiClient (attaches auth token from localStorage)
      try {
        const resp = await apiClient.getMyBids();
        if ((resp as any)?.success && Array.isArray((resp as any).data)) {
          const serverBids = (resp as any).data as any[];
          const normalized = serverBids.map((b) => ({
            _id: b._id,
            quotation: String(b.quotation ?? ''),
            proposal: b.proposal ?? '',
            bidFeePaid: Number(b.bidFeePaid ?? 0),
            status: (b.selectionStatus && b.selectionStatus !== 'pending') ? b.selectionStatus : (b.paymentStatus === 'succeeded' ? 'pending' : b.paymentStatus === 'failed' ? 'rejected' : 'pending'),
            selectionStatus: b.selectionStatus,
            paymentId: undefined,
            orderId: undefined,
            createdAt: b.createdAt,
            updatedAt: b.updatedAt || b.createdAt,
            job: (b.job && typeof b.job === 'object') ? {
              _id: b.job._id,
              title: b.job.title,
              description: b.job.description || '',
              category: b.job.category || 'general',
              status: 'active',
              createdAt: b.job.createdAt
            } : { _id: b.job?._id || b.jobId?._id || b.jobId, title: 'Job', description: '', category: 'general', status: 'active', createdAt: b.createdAt }
          }));
          setBids(normalized);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, using local storage:', apiError);
      }
      
      // Fallback to local storage
      const localBids = bidService.getBidsByUser(user?._id || 'demo_user');
      
      // Convert to the expected format with job data
      const formattedBids = localBids.map(bid => ({
        ...bid,
        updatedAt: bid.createdAt, // Add missing updatedAt property
        quotation: bid.quotation?.toString() || '0', // Convert to string
        job: {
          _id: bid.jobId,
          title: `Gig ${bid.jobId}`,
          description: 'Demo gig description',
          category: 'web development',
          status: 'active',
          createdAt: bid.createdAt
        }
      }));
      
      setBids(formattedBids);
    } catch (error: any) {
      console.error('Failed to fetch bids:', error);
      toast.error('Failed to fetch bids');
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredAndSortedBids = bids
    .filter(bid => {
      const matchesSearch = bid.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bid.proposal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount-high':
          return Number(b.quotation) - Number(a.quotation);
        case 'amount-low':
          return Number(a.quotation) - Number(b.quotation);
        default:
          return 0;
      }
    });

  const stats = {
    total: bids.length,
    accepted: bids.filter(bid => bid.status === 'accepted').length,
    pending: bids.filter(bid => bid.status === 'pending').length,
    rejected: bids.filter(bid => bid.status === 'rejected').length,
    totalValue: bids.reduce((sum, bid) => sum + Number(bid.quotation), 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your bids...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Bids</h1>
          <p className="text-muted-foreground">Track and manage all your submitted bids</p>
        </div>
        <Button asChild>
          <Link href="/gigs">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Gigs
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {bids.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Bids</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                  <div className="text-xs text-muted-foreground">Accepted</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">₹{stats.totalValue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bids by project title or proposal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount-high">Amount (High)</SelectItem>
                  <SelectItem value="amount-low">Amount (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bids List */}
      {filteredAndSortedBids.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bids found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'No bids match your current filters.' 
                : 'You haven\'t submitted any bids yet.'}
            </p>
            <Button asChild>
              <Link href="/gigs">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Available Gigs
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedBids.map((bid) => (
            <Card key={bid._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Project Info */}
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {bid.job.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(bid.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(bid.status)}`}
                      >
                        {getStatusIcon(bid.status)}
                        <span className="ml-1 capitalize">{bid.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {bid.job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Quoted: ₹{Number(bid.quotation).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(bid.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Bid Fee: ₹{bid.bidFeePaid}</span>
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
                      disabled
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Button>

                    {bid.status === 'pending' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          // TODO: Implement withdraw bid functionality
                          toast.error('Withdraw functionality coming soon');
                        }}
                      >
                        Withdraw Bid
                      </Button>
                    )}
                  </div>
                </div>

                {/* Proposal Preview */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-2">Your Proposal:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {bid.proposal}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

