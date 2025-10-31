'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CTACard() {
  const router = useRouter();

  const handleBrowseAll = () => {
    router.push('/gigs');
  };

  return (
    <Card className="professional-card hover-professional-primary group bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 h-full">
      <CardContent className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <h3 className="text-xl font-bold text-foreground mb-6">
          Explore More Opportunities
        </h3>
        
        <Button 
          size="lg"
          onClick={handleBrowseAll}
          className="px-6 py-3"
        >
          Browse All Gigs
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
