'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-muted-foreground text-base">
                Last Updated: [Insert Date]
              </p>
            </div>
          </div>

          {/* Privacy Content */}
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-10">
                {/* Introduction */}
                <section className="pb-6 border-b border-border/50">
                  <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
                    <p className="text-foreground leading-relaxed text-base font-medium">
                      At Gudgig.com, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
                    </p>
                  </div>
                </section>

                {/* Information We Collect */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">1. Information We Collect</h2>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          We collect information that you provide directly to us and information that is automatically collected when you use our platform.
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                          <p className="text-sm font-semibold text-foreground mb-2">Personal Information:</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                            <li>Name and email address (required for account creation)</li>
                            <li>Phone number (optional, for account verification)</li>
                            <li>Profile information including skills, experience, and portfolio</li>
                            <li>Payment information (processed securely by Razorpay, not stored on our servers)</li>
                          </ul>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                          <p className="text-sm font-semibold text-foreground mb-2">Usage Data:</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                            <li>IP address and device information</li>
                            <li>Browser type and version</li>
                            <li>Pages visited, time spent, and interactions on the platform</li>
                            <li>Search queries and saved leads</li>
                            <li>Transaction history and payment records</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How We Use Your Information */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">2. How We Use Your Information</h2>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          We use the information we collect for the following purposes:
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                          <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm ml-2">
                            <li><strong>Account Management:</strong> To create, maintain, and manage your account, verify your identity, and provide customer support</li>
                            <li><strong>Payment Processing:</strong> To process payments for lead unlocks through secure payment gateways (Razorpay)</li>
                            <li><strong>Service Delivery:</strong> To provide access to verified leads, match you with relevant opportunities, and enable communication</li>
                            <li><strong>Platform Improvement:</strong> To analyze usage patterns, improve our services, and develop new features</li>
                            <li><strong>Communication:</strong> To send you important updates, notifications about leads, payment confirmations, and support responses</li>
                            <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and unauthorized access</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Data Protection */}
                <section className="pb-6 border-b border-border/50">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">3. Data Protection</h2>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                        </p>
                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold text-foreground mb-2">Security Measures:</p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm ml-2">
                            <li>SSL/TLS encryption for data in transit</li>
                            <li>Encrypted storage for sensitive data at rest</li>
                            <li>Secure payment processing through PCI-compliant gateways (Razorpay)</li>
                            <li>Regular security assessments and updates</li>
                            <li>Access controls and authentication measures</li>
                            <li>Secure server infrastructure and hosting</li>
                          </ul>
                        </div>
                        <p className="text-muted-foreground leading-relaxed text-base text-sm">
                          <strong>Note:</strong> While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to using best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Cookies */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">4. Cookies</h2>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      Gudgig uses cookies to enhance user experience.
                    </p>
                  </div>
                </section>

                {/* Third-Party Services */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">5. Third-Party Services</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    Analytics and payment partners may have separate privacy policies.
                  </p>
                </section>

                {/* User Rights */}
                <section className="pb-6 border-b border-border/50">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">6. User Rights</h2>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                    <p className="text-muted-foreground leading-relaxed text-base">
                      You may request data correction or deletion via <a href="mailto:support@gudgig.com" className="text-primary hover:underline">support@gudgig.com</a>.
                    </p>
                  </div>
                </section>

                {/* Changes to Policy */}
                <section>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3 text-foreground">7. Changes to Policy</h2>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        Updates to this policy will be posted on this page.
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


