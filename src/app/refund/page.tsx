'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RefundPage() {
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
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Refund Policy
                </h1>
              </div>
              <p className="text-muted-foreground text-base">
                Last Updated: [Insert Date]
              </p>
            </div>
          </div>

          {/* Refund Content */}
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                Refund Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Introduction */}
                <section>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-6 mb-6">
                    <p className="text-amber-900 dark:text-amber-100 font-semibold text-lg mb-3">
                      ⚠️ Important Notice
                    </p>
                    <p className="text-amber-800 dark:text-amber-200 leading-relaxed text-base">
                      All payments made to unlock lead contact details are non-refundable.
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed text-base mb-4">
                    Since leads are digital and instantly accessible once unlocked, we cannot issue refunds for:
                  </p>
                  
                  <div className="bg-muted/50 rounded-lg p-5 border border-border/50 mb-6">
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 text-base ml-2">
                      <li>Accidental purchases.</li>
                      <li>Leads that do not respond or convert.</li>
                      <li>Change of mind after purchase.</li>
                    </ul>
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-5 border border-primary/20">
                    <p className="text-foreground leading-relaxed text-base mb-3">
                      <span className="font-semibold">Exception:</span> If a lead contains invalid or incorrect contact information, please report it within 24 hours of purchase at <a href="mailto:support@gigsmint.com" className="text-primary hover:underline font-medium">support@gigsmint.com</a>. Upon verification, we may offer a replacement lead or credit.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50 mt-3">
                      <p className="text-sm font-semibold text-foreground mb-2">To Report Invalid Lead Information:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                        <li>Contact us within 24 hours of unlocking the lead</li>
                        <li>Provide your transaction ID and the lead details</li>
                        <li>Explain why the contact information is invalid (e.g., wrong number, email bounced, non-existent company)</li>
                        <li>Our team will verify the issue within 2-3 business days</li>
                        <li>If verified, we will provide a replacement lead or credit to your account</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Additional Information */}
                <section className="pt-6 border-t border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">Understanding Our Policy</h2>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">Why Are Payments Non-Refundable?</p>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        Lead contact details are digital products that become immediately accessible upon payment. Once you unlock a lead, you have instant access to the contact information, making it impossible to "return" the product. This policy helps us maintain platform integrity and ensures fair access for all users.
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-foreground mb-2">Tips for Successful Lead Usage:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                        <li>Review lead details carefully before unlocking</li>
                        <li>Contact clients promptly after unlocking (within 24-48 hours)</li>
                        <li>Be professional and prepared when reaching out</li>
                        <li>Follow up appropriately if you don't receive an immediate response</li>
                        <li>Report any issues with contact information immediately</li>
                      </ul>
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
              <Link href="/shipping">Shipping Policy</Link>
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


