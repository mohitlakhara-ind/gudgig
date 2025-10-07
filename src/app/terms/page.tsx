'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, Users, CreditCard, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Terms of Service</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Terms Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    1. Introduction
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to Gigs Mint, a freelance marketplace platform that connects talented freelancers 
                    with clients seeking professional services. These Terms of Service ("Terms") govern your 
                    use of our platform and services.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    By accessing or using our platform, you agree to be bound by these Terms. If you disagree 
                    with any part of these terms, you may not access our service.
                  </p>
                </section>

                {/* Platform Description */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. Platform Description</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Gigs Mint is a freelance marketplace that allows:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                    <li>Freelancers to browse and bid on available projects</li>
                    <li>Clients to post projects and receive bids from qualified freelancers</li>
                    <li>Secure payment processing through integrated payment gateways</li>
                    <li>Communication tools for project collaboration</li>
                  </ul>
                </section>

                {/* User Accounts */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.1 Account Creation</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        To use our platform, you must create an account by providing accurate and complete 
                        information. You are responsible for maintaining the confidentiality of your account 
                        credentials.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.2 Account Security</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You are responsible for all activities that occur under your account. Notify us 
                        immediately of any unauthorized use of your account.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Bidding and Payments */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    4. Bidding and Payments
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.1 Bid Fees</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        To place a bid on a project, freelancers must pay a bid fee. The fee amount varies 
                        and is clearly displayed before bidding. This fee is non-refundable and covers 
                        platform maintenance and verification costs.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.2 Payment Processing</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        All payments are processed securely through our integrated payment gateway. We do not 
                        store your payment information on our servers.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">4.3 Refunds</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Bid fees are generally non-refundable. Refunds may be considered in exceptional 
                        circumstances at our sole discretion.
                      </p>
                    </div>
                  </div>
                </section>

                {/* User Conduct */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. User Conduct</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      You agree not to:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Post false, misleading, or fraudulent information</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Spam or send unsolicited communications</li>
                      <li>Attempt to circumvent our payment system</li>
                      <li>Interfere with the proper functioning of the platform</li>
                    </ul>
                  </div>
                </section>

                {/* Communication */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    6. Communication
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All communication between freelancers and clients should be conducted through our 
                    platform's messaging system. This ensures security and provides a record of all 
                    communications for dispute resolution.
                  </p>
                </section>

                {/* Disclaimers */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Disclaimers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform is provided "as is" without warranties of any kind. We do not guarantee 
                    the quality, accuracy, or reliability of any services provided by freelancers or 
                    projects posted by clients.
                  </p>
                </section>

                {/* Limitation of Liability */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, Gigs Mint shall not be liable for any indirect, 
                    incidental, special, or consequential damages arising from your use of our platform.
                  </p>
                </section>

                {/* Changes to Terms */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify users of 
                    significant changes via email or platform notification. Continued use of the platform 
                    constitutes acceptance of the modified Terms.
                  </p>
                </section>

                {/* Contact Information */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Gigs Mint Support</p>
                    <p>Email: support@gigsmint.com</p>
                    <p>Phone: +91-XXXX-XXXX</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/refund">Refund Policy</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


