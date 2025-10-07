/**
 * Bid Service
 * Handles bid storage and retrieval for demo purposes
 */

export interface Bid {
  _id: string;
  jobId: string;
  userId: string;
  quotation: number;
  proposal: string;
  bidFeePaid: number;
  paymentStatus: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

class BidService {
  private bids: Bid[] = [];
  private nextId = 1;

  constructor() {
    this.loadBidsFromStorage();
  }

  private loadBidsFromStorage() {
    try {
      const stored = localStorage.getItem('demo_bids');
      if (stored) {
        this.bids = JSON.parse(stored);
        // Update nextId to avoid conflicts
        this.nextId = Math.max(...this.bids.map(b => parseInt(b._id.split('_')[1]) || 0)) + 1;
      }
    } catch (error) {
      console.warn('Failed to load bids from storage:', error);
      this.bids = [];
    }
  }

  private saveBidsToStorage() {
    try {
      localStorage.setItem('demo_bids', JSON.stringify(this.bids));
    } catch (error) {
      console.warn('Failed to save bids to storage:', error);
    }
  }

  // Create a new bid
  createBid(bidData: Omit<Bid, '_id' | 'createdAt'>): Bid {
    console.log('BidService: Creating bid with data:', bidData);
    
    const newBid: Bid = {
      ...bidData,
      _id: `bid_${this.nextId++}`,
      createdAt: new Date().toISOString(),
    };

    console.log('BidService: Created bid:', newBid);
    
    this.bids.unshift(newBid); // Add to beginning
    this.saveBidsToStorage();
    
    console.log('BidService: Total bids after creation:', this.bids.length);
    
    // Trigger storage event for other components to update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bidCreated', { detail: newBid }));
    }
    
    return newBid;
  }

  // Get bids for a specific gig
  getBidsForGig(gigId: string): Bid[] {
    return this.bids.filter(bid => bid.jobId === gigId);
  }

  // Get bids by user
  getBidsByUser(userId: string): Bid[] {
    return this.bids.filter(bid => bid.userId === userId);
  }

  // Get all bids
  getAllBids(): Bid[] {
    return [...this.bids];
  }

  // Get bid by ID
  getBidById(id: string): Bid | null {
    return this.bids.find(bid => bid._id === id) || null;
  }

  // Update bid status
  updateBidStatus(id: string, status: Bid['status']): Bid | null {
    const bid = this.bids.find(b => b._id === id);
    if (bid) {
      bid.status = status;
      this.saveBidsToStorage();
      return bid;
    }
    return null;
  }

  // Delete bid
  deleteBid(id: string): boolean {
    const index = this.bids.findIndex(b => b._id === id);
    if (index !== -1) {
      this.bids.splice(index, 1);
      this.saveBidsToStorage();
      return true;
    }
    return false;
  }

  // Check if user has existing bid for gig
  hasExistingBid(gigId: string, userId: string): boolean {
    return this.bids.some(bid => bid.jobId === gigId && bid.userId === userId);
  }

  // Get bid statistics
  getBidStats() {
    const totalBids = this.bids.length;
    const pendingBids = this.bids.filter(b => b.status === 'pending').length;
    const acceptedBids = this.bids.filter(b => b.status === 'accepted').length;
    const rejectedBids = this.bids.filter(b => b.status === 'rejected').length;
    const totalRevenue = this.bids.reduce((sum, b) => sum + b.bidFeePaid, 0);

    return {
      totalBids,
      pendingBids,
      acceptedBids,
      rejectedBids,
      totalRevenue
    };
  }

  // Clear all bids (for testing)
  clearAllBids() {
    this.bids = [];
    this.nextId = 1;
    this.saveBidsToStorage();
  }
}

// Create and export singleton instance
export const bidService = new BidService();
export default bidService;
