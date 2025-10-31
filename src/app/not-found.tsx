'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, Briefcase } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-lg w-full text-center">
        <CardContent className="p-8 space-y-4">
          <div className="text-6xl font-extrabold">404</div>
          <div className="text-xl font-semibold">Page not found</div>
          <p className="text-muted-foreground">The page you are looking for doesn't exist or has moved.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Button onClick={() => router.push('/orders')} className="gap-2">
              <Briefcase className="h-4 w-4" />
              Go to My Orders
            </Button>
            <Link href="/gigs" className="inline-flex">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Browse Gigs
              </Button>
            </Link>
            <Link href="/" className="inline-flex">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


