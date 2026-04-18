'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, Users, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Terms of Service
                </h1>
              </div>
              <p className="text-muted-foreground text-base">
                Last Updated: [Insert Date]
              </p>
            </div>
          </div>

          {/* Terms Content */}
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-10">
                {/* About Gudgig */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">1. About Gudgig</h2>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        Gudgig.com is an online platform that connects clients seeking remote work services with freelancers and professionals offering those services. Users can browse publicly listed leads and pay a nominal fee to unlock contact information.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Eligibility */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">2. Eligibility</h2>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      You must be at least 18 years of age to use Gudgig.
                    </p>
                  </div>
                </section>

                {/* Account Registration */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">3. Account Registration</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      To access certain features, you may be required to create an account. You agree to provide accurate and complete information and to keep your account credentials confidential.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">Account Requirements:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                        <li>You must provide a valid email address for account verification</li>
                        <li>Account creation is free; you only pay when unlocking lead contact details</li>
                        <li>You are responsible for maintaining the security of your account</li>
                        <li>One person or entity may maintain only one account</li>
                        <li>You must notify us immediately of any unauthorized use of your account</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Lead Purchase */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">4. Lead Purchase</h2>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        Each lead represents contact details of a potential client verified by our team to the best of our ability. However, Gudgig does not guarantee that every lead will result in a successful project.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Payments */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">5. Payments</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      All payments made on Gudgig.com are final and non-transferable.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2">Payment Details:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                        <li>Lead unlock fee: Nominal fee as specified for each lead (to access client contact details)</li>
                        <li>Payment methods: UPI, Credit/Debit Cards, Net Banking, and other supported methods via Razorpay</li>
                        <li>All transactions are processed securely through PCI-compliant payment gateways</li>
                        <li>Payment information is not stored on our servers</li>
                        <li>You can browse leads for free; payment is only required to unlock contact information</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Prohibited Activities */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">6. Prohibited Activities</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      You agree not to misuse lead data or use Gudgig for unlawful purposes. Specifically, you must not:
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm ml-2">
                        <li>Share or resell lead contact information to third parties</li>
                        <li>Use lead data for spam, unsolicited marketing, or harassment</li>
                        <li>Create multiple accounts to circumvent payment or access restrictions</li>
                        <li>Attempt to reverse engineer or hack the platform</li>
                        <li>Post false, misleading, or fraudulent information</li>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Interfere with the proper functioning of the platform</li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-base">
                      Violation of these terms may result in immediate account suspension or termination without refund.
                    </p>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">7. Intellectual Property</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    All content and data on Gudgig.com are the property of Gudgig.
                  </p>
                </section>

                {/* Disclaimer of Warranties */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">8. Disclaimer of Warranties</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Gudgig provides leads "as is" and makes no guarantees regarding their accuracy or results.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">9. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Gudgig shall not be liable for any direct, indirect, or consequential loss arising from the use of our services.
                  </p>
                </section>

                {/* Changes to Terms */}
                <section>
                  <h2 className="text-2xl font-bold mb-3 text-foreground">10. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Gudgig reserves the right to update or modify these terms at any time.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="min-w-[140px]" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" className="min-w-[140px]" asChild>
              <Link href="/refund">Refund Policy</Link>
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


