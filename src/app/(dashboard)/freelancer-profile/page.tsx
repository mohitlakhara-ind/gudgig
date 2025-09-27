import React from 'react';
import FreelancerProfile from '@/components/freelancer/FreelancerProfile';

export const metadata = {
  title: 'Freelancer Profile',
  description: 'Manage your freelancer profile and services.'
};

export default function FreelancerProfilePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Freelancer Profile</h1>
      <FreelancerProfile />
    </div>
  );
}


