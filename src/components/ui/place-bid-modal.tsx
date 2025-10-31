"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ContactSelection, { ContactFormData } from '@/components/forms/ContactSelection';
import { ContactDetailsProvider } from '@/contexts/ContactDetailsContext';

type Props = {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
};

export default function PlaceBidModal({ open, onClose, jobId, jobTitle }: Props) {
  const router = useRouter();
  const [quotation, setQuotation] = useState<string>("");
  const [proposal, setProposal] = useState<string>("");
  const [fees, setFees] = useState<number[]>([1, 5, 10]);
  const [currency, setCurrency] = useState<string>("INR");
  const [loading, setLoading] = useState(false);
  const [fetchingFees, setFetchingFees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bidCount, setBidCount] = useState<number | null>(null);
  const [contactDetails, setContactDetails] = useState<ContactFormData | null>(null);
  const [showContactSelection, setShowContactSelection] = useState(false);
  const proposalMin = 40;

  const parsedQuotation = Number(quotation);
  const isValidQuotation = Number.isFinite(parsedQuotation) && parsedQuotation > 0;

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setError(null);
        setFetchingFees(true);
        const res = await apiClient.getBidFees().catch(() => null as any);
        if (res?.data?.bidFeeOptions?.length) setFees(res.data.bidFeeOptions);
      } catch (e: any) {
        // fallback already set
      } finally {
        setFetchingFees(false);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await apiClient.getJobBidCount(jobId);
        setBidCount(res?.data?.count ?? 0);
      } catch {
        setBidCount(null);
      }
    })();
  }, [open, jobId]);

  const handleSelectFee = async (fee: number) => {
    try {
      setLoading(true);
      setError(null);
      const quoteVal = Number(quotation);
      if (!isValidQuotation) {
        setError('Please enter a valid positive quotation.');
        return;
      }
      if (proposal.trim().length < proposalMin) {
        setError(`Proposal must be at least ${proposalMin} characters.`);
        return;
      }
      if (!contactDetails) {
        setError('Please provide your contact details.');
        return;
      }
      
      const params = new URLSearchParams({
        gigId: jobId,
        quotation: String(quoteVal),
        fee: String(fee),
        proposal: proposal || "",
        contactDetails: JSON.stringify(contactDetails)
      }).toString();
      router.push(`/gigs/pay?${params}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to start payment');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <ContactDetailsProvider>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
        <div className="bg-white w-full sm:w-[600px] rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Place Bid</div>
            <button className="text-sm" onClick={onClose}>Close</button>
          </div>
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">{jobTitle}</div>
              <div className="text-xs text-gray-500">{bidCount === null ? 'Bids: —' : `Bids: ${bidCount}`}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quotation (INR)</label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  inputMode="decimal"
                  value={quotation}
                  onChange={(e) => {
                    setQuotation(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter your project quote in INR"
                />
                {!isValidQuotation && quotation !== '' && (
                  <div className="text-xs text-red-600 mt-1">Enter a number greater than 0.</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Proposal</label>
                <Textarea rows={5} value={proposal} onChange={(e) => { setProposal(e.target.value); if (error) setError(null); }} placeholder="Describe your approach, timeline, and relevant experience for this project" />
                <div className="text-xs text-gray-500 mt-1">{proposal.length} / {proposalMin}+ characters</div>
              </div>
            </div>

            {/* Contact Details Section */}
            <div>
              <div className="text-sm font-semibold mb-3">Contact Information</div>
              {!contactDetails ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Please provide your contact details for this bid submission.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowContactSelection(true)}
                    className="w-full"
                  >
                    Add Contact Details
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{contactDetails.name}</div>
                      <div className="text-sm text-gray-600">{contactDetails.email}</div>
                      <div className="text-sm text-gray-600">{contactDetails.phone}</div>
                      {contactDetails.company && (
                        <div className="text-sm text-gray-600">{contactDetails.company}</div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setContactDetails(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold mb-1">Select bid fee</div>
              <div className="text-xs text-gray-600 mb-3">Bid fee covers platform costs and gives you direct access to chat with the project admin once submitted. Your bid will be visible to the admin immediately after payment confirmation.</div>
              <div className="flex gap-2 flex-wrap">
                {fetchingFees ? (
                  <div className="text-sm text-gray-500">Loading fee options…</div>
                ) : (
                  fees.map((f) => (
                    <Button 
                      key={f} 
                      variant="outline" 
                      disabled={loading || !isValidQuotation || proposal.trim().length < proposalMin || !contactDetails} 
                      onClick={() => handleSelectFee(f)} 
                      className="min-w-[84px]"
                    >
                      {currency === 'INR' ? '₹' : ''}{f}
                    </Button>
                  ))
                )}
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </div>
      </div>

      {/* Contact Selection Modal */}
      {showContactSelection && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Contact Details</div>
              <button className="text-sm" onClick={() => setShowContactSelection(false)}>Close</button>
            </div>
            <div className="p-5">
              <ContactSelection
                onContactSelect={(contact) => {
                  setContactDetails(contact);
                  setShowContactSelection(false);
                }}
                title="Contact Information for Bid"
                description="Choose your contact details for this bid submission"
                showSaveOption={true}
              />
            </div>
          </div>
        </div>
      )}
    </ContactDetailsProvider>
  );
}


