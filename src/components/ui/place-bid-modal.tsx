"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
      const params = new URLSearchParams({
        gigId: jobId,
        quotation: String(quoteVal),
        fee: String(fee),
        proposal: proposal || "",
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="bg-white w-full sm:w-[600px] rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">Place Bid</div>
          <button className="text-sm" onClick={onClose}>Close</button>
        </div>
        <div className="p-5 space-y-5">
          <div className="text-sm text-gray-700 font-medium">{jobTitle}</div>

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

          <div>
            <div className="text-sm font-semibold mb-1">Select bid fee</div>
            <div className="text-xs text-gray-600 mb-3">Bid fee covers platform costs and gives you direct access to chat with the project admin once submitted. Your bid will be visible to the admin immediately after payment confirmation.</div>
            <div className="flex gap-2 flex-wrap">
              {fetchingFees ? (
                <div className="text-sm text-gray-500">Loading fee options…</div>
              ) : (
                fees.map((f) => (
                  <Button key={f} variant="outline" disabled={loading || !isValidQuotation || proposal.trim().length < proposalMin} onClick={() => handleSelectFee(f)} className="min-w-[84px]">
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
  );
}


