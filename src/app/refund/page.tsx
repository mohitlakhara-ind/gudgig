'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, CreditCard, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RefundPage() {
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
                <RefreshCw className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Refund Policy</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Refund Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Refund Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                    Important Notice
                  </h2>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-amber-800 font-medium">
                      Bid fees are generally non-refundable. Please read this policy carefully before placing any bids.
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    This Refund Policy outlines the circumstances under which refunds may be considered for 
                    services provided through the Gigs Mint platform. By using our platform, you agree to 
                    the terms outlined in this policy.
                  </p>
                </section>

                {/* General Policy */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. General Refund Policy</h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-red-800">
                        <XCircle className="h-5 w-5" />
                        Non-Refundable Items
                      </h3>
                      <ul className="list-disc list-inside text-red-700 space-y-1">
                        <li>Bid fees paid to place bids on projects</li>
                        <li>Platform usage fees</li>
                        <li>Processing fees charged by payment gateways</li>
                        <li>Services already rendered or completed</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        Refundable Circumstances
                      </h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        <li>Technical errors on our platform that prevent bid placement</li>
                        <li>Duplicate payments due to system errors</li>
                        <li>Project cancellation by the client before bid review</li>
                        <li>Fraudulent transactions (subject to investigation)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Bid Fee Refunds */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    2. Bid Fee Refund Policy
                  </h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      Bid fees are charged to ensure serious participation and maintain platform quality. 
                      These fees are generally non-refundable, except in the following specific circumstances:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-green-700">Eligible for Refund</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• System error preventing bid submission</li>
                          <li>• Project removed within 24 hours of bid</li>
                          <li>• Duplicate payment due to technical issue</li>
                          <li>• Client account suspended after bid placement</li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2 text-red-700">Not Eligible for Refund</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Bid not selected by client</li>
                          <li>• Change of mind after bid placement</li>
                          <li>• Project requirements changed</li>
                          <li>• Client communication issues</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Refund Process */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Refund Request Process</h2>
                  <div className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      To request a refund, follow these steps:
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">1</Badge>
                        <div>
                          <h3 className="font-medium">Submit Request</h3>
                          <p className="text-sm text-muted-foreground">
                            Contact our support team within 7 days of the transaction with your transaction ID and reason for refund.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">2</Badge>
                        <div>
                          <h3 className="font-medium">Review Process</h3>
                          <p className="text-sm text-muted-foreground">
                            Our team will review your request within 3-5 business days and verify the circumstances.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">3</Badge>
                        <div>
                          <h3 className="font-medium">Processing</h3>
                          <p className="text-sm text-muted-foreground">
                            If approved, refunds will be processed within 5-10 business days to your original payment method.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Processing Times */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Refund Processing Times</h2>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Approval Time</h3>
                        <p className="text-sm text-muted-foreground">3-5 business days</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Processing Time</h3>
                        <p className="text-sm text-muted-foreground">5-10 business days</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Dispute Resolution */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Dispute Resolution</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you disagree with our refund decision, you may:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                    <li>Request a second review with additional documentation</li>
                    <li>Contact our customer service team for further assistance</li>
                    <li>Escalate the matter to our management team</li>
                  </ul>
                </section>

                {/* Payment Method Refunds */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Payment Method Refunds</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Refunds will be processed to the original payment method used for the transaction. 
                    Processing times may vary depending on your payment provider:
                  </p>
                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-medium">Credit/Debit Cards</h3>
                      <p className="text-sm text-muted-foreground">5-10 business days</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="h-8 w-8 mx-auto mb-2 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">UPI</span>
                      </div>
                      <h3 className="font-medium">UPI</h3>
                      <p className="text-sm text-muted-foreground">1-3 business days</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="h-8 w-8 mx-auto mb-2 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">NB</span>
                      </div>
                      <h3 className="font-medium">Net Banking</h3>
                      <p className="text-sm text-muted-foreground">3-7 business days</p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Contact for Refunds</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For refund requests or questions about this policy, contact us:
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Gigs Mint Support Team</p>
                    <p>Email: refunds@gigsmint.com</p>
                    <p>Phone: +91-XXXX-XXXX</p>
                    <p>Response Time: Within 24 hours</p>
                  </div>
                </section>

                {/* Policy Updates */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Policy Updates</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to update this Refund Policy at any time. Changes will be posted 
                    on this page with an updated "Last updated" date. Continued use of our platform 
                    constitutes acceptance of the updated policy.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/terms">Terms of Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/privacy">Privacy Policy</Link>
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


