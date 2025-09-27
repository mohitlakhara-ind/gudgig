import React, { useCallback, useState } from 'react';
import apiClient from '@/lib/api';

interface ReviewSystemProps {
  orderId: string;
  serviceId: string;
  revieweeId: string;
  onSubmitted?: () => void;
}

export default function ReviewSystem({ orderId, serviceId, revieweeId, onSubmitted }: ReviewSystemProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      await apiClient.createReview({ orderId, serviceId, revieweeId, rating, title, comment });
      onSubmitted?.();
      setTitle('');
      setComment('');
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  }, [orderId, serviceId, revieweeId, rating, title, comment, onSubmitted]);

  return (
    <div className="space-y-3 border rounded-lg p-4">
      <div className="font-semibold">Leave a Review</div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Rating:</label>
        <select className="border rounded px-3 py-2" value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <input className="w-full border rounded px-3 py-2" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2 h-32" placeholder="Share your experience" value={comment} onChange={e => setComment(e.target.value)} />
      <button className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50" disabled={submitting} onClick={submit}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
    </div>
  );
}


