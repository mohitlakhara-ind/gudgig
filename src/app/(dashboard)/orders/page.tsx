'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Bid } from '@/types/api';

interface BidWithJob {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    category: string;
    createdAt: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  quotation?: string | number;
  proposal?: string;
  bidFeePaid: number;
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bids, setBids] = useState<BidWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchBids = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getMyBids();
        if (response.success && response.data) {
          const serverBids: any[] = response.data as any[];
          // Normalize to BidWithJob shape expected by UI
          const normalized: BidWithJob[] = serverBids.map((b: any) => {
            const gig = (b.gig && typeof b.gig === 'object') ? b.gig : (b.job && typeof b.job === 'object') ? b.job : null;
            const jobObj = gig ? {
              _id: gig._id,
              title: gig.title || 'Gig',
              category: gig.category || 'general',
              createdAt: gig.createdAt || b.createdAt
            } : {
              _id: b.gig || b.jobId || b.job || 'unknown',
              title: 'Gig',
              category: 'general',
              createdAt: b.createdAt
            };
            const derivedStatus: 'pending' | 'accepted' | 'rejected' = (b.selectionStatus && b.selectionStatus !== 'pending')
              ? b.selectionStatus
              : (b.paymentStatus === 'failed' ? 'rejected' : 'pending');
            return {
              _id: b._id,
              jobId: jobObj,
              userId: b.userId || { _id: '', name: '', email: '' },
              quotation: String(b.quotation ?? ''),
              proposal: b.proposal ?? '',
              bidFeePaid: Number(b.bidFeePaid ?? 0),
              paymentStatus: b.paymentStatus || 'pending',
              status: derivedStatus,
              createdAt: b.createdAt
            } as BidWithJob;
          });
          setBids(normalized);
        }
      } catch (err) {
        console.error('Failed to fetch bids:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bids');
        toast.error('Failed to load your bids');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [user, router]);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Dashboard</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Your Orders Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your orders and manage your freelance purchases
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{bids.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">
                  {bids.filter(bid => (bid.status || 'pending') === 'accepted').length}
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
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bids.filter(bid => (bid.status || 'pending') === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bids List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Your Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bids.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start browsing gigs to find opportunities.
              </p>
              <Button onClick={() => router.push('/gigs')}>
                Browse Gigs
              </Button>
            </div>
      ) : (
        <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid._id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(bid.status)} flex items-center gap-1`}
                        >
                          {getStatusIcon(bid.status)}
                          {(bid.status || 'pending').charAt(0).toUpperCase() + (bid.status || 'pending').slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {(bid as any).job?.category || (bid as any).jobId?.category || 'General'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-1">
                        {(bid as any).job?.title || (bid as any).jobId?.title || 'Gig Title'}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(bid.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          Fee: {formatCurrency(bid.bidFeePaid)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/gigs/${(bid as any).job?._id || (bid as any).jobId?._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Gig
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Bid ID: {bid._id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Payment: {bid.paymentStatus === 'succeeded' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
                  </div>
                )}
              </CardContent>
            </Card>
    </div>
  );
}
