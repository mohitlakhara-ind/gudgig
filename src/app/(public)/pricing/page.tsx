import type { Metadata } from 'next';
import PricingClient from '@/components/pricing/PricingClient';

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Choose the perfect plan for your job search or hiring needs. From free basic access to premium features for employers.",
};

export default function PricingPage() {
  return <PricingClient />;
}
