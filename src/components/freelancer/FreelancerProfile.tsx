"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { Service, User } from '@/types/api';
import ServiceCard from '@/components/services/ServiceCard';

export default function FreelancerProfile() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await apiClient.getUserServices(user._id);
      setServices(res.data || []);
    })();
  }, [user]);

  const u = user as User | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div>
          <div className="text-xl font-semibold">{u?.name || 'Freelancer'}</div>
          <div className="text-gray-600">{u?.sellerProfile?.tagline || 'Add a catchy tagline'}</div>
          <div className="text-sm text-gray-500">Level: {u?.sellerProfile?.level || 'new'} · Rating: {(u?.sellerProfile?.rating || 0).toFixed(1)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-semibold">Active Services</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <ServiceCard key={s._id} service={s} />
          ))}
        </div>
      </div>
    </div>
  );
}


