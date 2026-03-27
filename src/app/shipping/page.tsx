'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ShippingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-6 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-3 mb-6 p-4 bg-primary/10 rounded-2xl">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Shipping Policy
                </h1>
              </div>
              <p className="text-muted-foreground text-base">
                Last Updated: [Insert Date]
              </p>
            </div>
          </div>

          {/* Shipping Content */}
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                Digital Services Only
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-10">
                {/* Introduction */}
                <section className="pb-6 border-b border-border/50">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-blue-900 dark:text-blue-100 font-semibold text-lg mb-2">
                          Digital Services Only
                        </p>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-base">
                          Gudgig.com provides only digital services. No physical products are shipped.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Digital Delivery */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">1. Digital Delivery</h2>
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          Contact details become instantly visible in your dashboard upon payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Delivery Time */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">2. Delivery Time</h2>
                      <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          Access is immediate. Technical delays can be reported to <a href="mailto:support@gudgig.com" className="text-primary hover:underline">support@gudgig.com</a>.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* No Physical Shipping */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">3. No Physical Shipping</h2>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      Gudgig does not deliver any physical items. All services are digital and delivered electronically.
                    </p>
                  </div>
                </section>

                {/* Access and Availability */}
                <section>
                  <h2 className="text-2xl font-bold mb-3 text-foreground">4. Access and Availability</h2>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">How to Access Unlocked Leads:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm ml-2">
                        <li>After successful payment, contact details are immediately available in your dashboard</li>
                        <li>Navigate to "My Leads" or "Unlocked Leads" section in your account</li>
                        <li>Click on the specific lead to view full contact information</li>
                        <li>Contact information remains accessible as long as your account is active</li>
                      </ul>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <p className="text-sm font-semibold text-foreground mb-2">Technical Support:</p>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        If you experience any technical issues accessing your unlocked leads, please contact our support team at <a href="mailto:support@gudgig.com" className="text-primary hover:underline">support@gudgig.com</a> with your transaction ID. We typically respond within 24 hours.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="min-w-[140px]" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
            <Button variant="outline" className="min-w-[140px]" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" className="min-w-[140px]" asChild>
              <Link href="/refund">Refund Policy</Link>
            </Button>
            <Button className="min-w-[140px]" asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


