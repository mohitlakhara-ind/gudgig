"use client";
import React, { useCallback, useState } from 'react';
import useServices from '@/hooks/useServices';
import { CreateServiceRequest, ServicePackage } from '@/types/api';

const steps = ['Overview', 'Packages', 'Requirements', 'Gallery', 'Publish'] as const;

export default function ServiceCreationWizard() {
  const { createService } = useServices();
  const [step, setStep] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [packages, setPackages] = useState<ServicePackage[]>([{
    name: 'Basic', price: 10, deliveryTimeDays: 3, revisions: 1, description: ''
  }]);
  const [requirements, setRequirements] = useState<Array<{ prompt: string; type?: any; required?: boolean }>>([]);
  const [gallery, setGallery] = useState<Array<{ url: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canNext = useCallback(() => {
    if (step === 0) return title.length >= 5 && description.length >= 50;
    if (step === 1) return packages.length > 0 && packages.every(p => p.price >= 5 && p.deliveryTimeDays >= 1);
    return true;
  }, [step, title, description, packages]);

  const onSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const payload: CreateServiceRequest = {
        title,
        description,
        category,
        packages,
        requirements: requirements.map(r => ({ prompt: r.prompt, type: r.type || 'text', required: r.required ?? true })),
        gallery: gallery.map(g => ({ url: g.url })),
        status: 'draft'
      };
      await createService(payload);
      setStep(steps.length - 1);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, category, packages, requirements, gallery, createService]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 ${i === step ? 'font-semibold text-gray-900' : ''}`}>
            <span className="rounded-full w-6 h-6 flex items-center justify-center border">{i + 1}</span>
            <span>{s}</span>
            {i < steps.length - 1 && <span className="text-gray-300">/</span>}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <input className="w-full border rounded px-3 py-2" placeholder="Service title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 h-40" placeholder="Describe your service" value={description} onChange={e => setDescription(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          {packages.map((p, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select className="border rounded px-3 py-2" value={p.name} onChange={e => {
                const next = [...packages];
                next[idx] = { ...p, name: e.target.value as any };
                setPackages(next);
              }}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Premium</option>
              </select>
              <input type="number" className="border rounded px-3 py-2" placeholder="Price" value={p.price} onChange={e => {
                const next = [...packages];
                next[idx] = { ...p, price: Number(e.target.value) };
                setPackages(next);
              }} />
              <input type="number" className="border rounded px-3 py-2" placeholder="Delivery days" value={p.deliveryTimeDays} onChange={e => {
                const next = [...packages];
                next[idx] = { ...p, deliveryTimeDays: Number(e.target.value) };
                setPackages(next);
              }} />
              <input type="number" className="border rounded px-3 py-2" placeholder="Revisions" value={p.revisions || 0} onChange={e => {
                const next = [...packages];
                next[idx] = { ...p, revisions: Number(e.target.value) };
                setPackages(next);
              }} />
            </div>
          ))}
          <button className="px-3 py-2 rounded border" onClick={() => setPackages(prev => [...prev, { name: 'Basic', price: 10, deliveryTimeDays: 3 } as any])}>Add Package</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {requirements.map((r, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Requirement prompt" value={r.prompt} onChange={e => {
                const next = [...requirements];
                next[idx] = { ...r, prompt: e.target.value };
                setRequirements(next);
              }} />
              <select className="border rounded px-3 py-2" value={r.type} onChange={e => {
                const next = [...requirements];
                next[idx] = { ...r, type: e.target.value } as any;
                setRequirements(next);
              }}>
                <option value="text">Text</option>
                <option value="attachment">Attachment</option>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={r.required ?? true} onChange={e => {
                const next = [...requirements];
                next[idx] = { ...r, required: e.target.checked };
                setRequirements(next);
              }} /> Required</label>
            </div>
          ))}
          <button className="px-3 py-2 rounded border" onClick={() => setRequirements(prev => [...prev, { prompt: '' }])}>Add Requirement</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          {gallery.map((g, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Image URL" value={g.url} onChange={e => {
                const next = [...gallery];
                next[idx] = { url: e.target.value };
                setGallery(next);
              }} />
            </div>
          ))}
          <button className="px-3 py-2 rounded border" onClick={() => setGallery(prev => [...prev, { url: '' }])}>Add Image</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button className="px-4 py-2 rounded border" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Back</button>
        {step < steps.length - 1 ? (
          <button className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50" disabled={!canNext()} onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Next</button>
        ) : (
          <button className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50" disabled={isSubmitting} onClick={onSubmit}>{isSubmitting ? 'Saving...' : 'Save Draft'}</button>
        )}
      </div>
    </div>
  );
}


