import type { Metadata } from 'next';
import EmployerDashboard from '@/components/dashboard/EmployerDashboard';
 

export const metadata: Metadata = {
  title: "Employer Dashboard",
  description: "Manage your job postings, review applications, and find the perfect candidates.",
};

export default function EmployerDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <EmployerDashboard />
      </main>
    </div>
  );
}
