import React from 'react';
import ServiceCreationWizard from '@/components/services/ServiceCreationWizard';

export const metadata = {
  title: 'Create a Service',
  description: 'Create and publish your freelance service with packages and details.'
};

export default function CreateServicePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Create a Service</h1>
      <ServiceCreationWizard />
    </div>
  );
}


