"use client";
import React, { useCallback, useEffect } from 'react';
import useServices from '@/hooks/useServices';
import ServiceCard from './ServiceCard';
import { useRouter } from 'next/navigation';

const ServicesListing: React.FC = () => {
  const router = useRouter();
  const { services, isLoading, error, fetchServices } = useServices({ initialParams: { limit: 24 } });

  const handleCardClick = useCallback((id: string) => {
    router.push(`/dashboard/services/${id}`);
  }, [router]);

  useEffect(() => {
    // ensure initial load for environments without initialParams
    if (services.length === 0 && !isLoading && !error) {
      fetchServices({ limit: 24 });
    }
  }, [services.length, isLoading, error, fetchServices]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input className="border rounded px-3 py-2" placeholder="Search services" onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const q = (e.target as HTMLInputElement).value;
            fetchServices({ search: q, limit: 24 });
          }
        }} />
        <select className="border rounded px-3 py-2" onChange={(e) => fetchServices({ sortBy: e.target.value, limit: 24 })}>
          <option value="createdAt">Newest</option>
          <option value="rating.average">Top Rated</option>
          <option value="startingPrice">Price</option>
        </select>
      </div>

      {isLoading && <div>Loading services...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {services.map(service => (
          <ServiceCard key={service._id} service={service} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
};

export default ServicesListing;


