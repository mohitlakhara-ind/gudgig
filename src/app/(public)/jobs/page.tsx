import type { Metadata } from 'next';
import { GigsListing } from '@/components/gigs';

export const metadata: Metadata = {
  title: "Browse MicroJobs",
  description: "Find microjobs and short-term gigs. Browse by category, budget, location, and more.",
};

export default function BrowseJobsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <GigsListing />
    </main>
  );
}
