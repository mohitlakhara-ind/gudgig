import React, { Suspense } from 'react';
import apiClient from '@/lib/api';
import { Service } from '@/types/api';

async function fetchService(id: string) {
  const res = await apiClient.getService(id);
  return res.data as Service;
}

export default async function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const service = await fetchService(params.id);
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {service.gallery && service.gallery[0] && (
              <img src={service.gallery[0].url} alt={service.title} className="w-full h-full object-cover" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{service.title}</h1>
          <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
        </div>
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="font-semibold">Packages</div>
            {service.packages.map((p) => (
              <div key={p.name} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.name}</div>
                  <div className="font-semibold">${p.price}</div>
                </div>
                <div className="text-sm text-gray-600">{p.deliveryTimeDays} days · {p.revisions ?? 0} revisions</div>
                {p.description && <div className="text-sm mt-2">{p.description}</div>}
                {p.features && p.features.length > 0 && (
                  <ul className="text-sm text-gray-700 list-disc pl-5 mt-2">
                    {p.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                )}
                <button className="mt-3 w-full px-3 py-2 rounded bg-gray-900 text-white">Continue (${p.price})</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


