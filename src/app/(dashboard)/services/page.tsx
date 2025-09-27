import React from 'react';
import ServicesListing from '@/components/services/ServicesListing';

export const metadata = {
  title: 'Browse Services',
  description: 'Discover freelance services across categories with flexible pricing and delivery times.'
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Browse Services</h1>
      <ServicesListing />
    </div>
  );
}


