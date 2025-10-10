'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Database, Lock, Mail, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
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
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Privacy Content */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Your Privacy Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                {/* Introduction */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary" />
                    1. Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">1.1 Personal Information</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We collect information you provide directly to us, such as when you create an account, 
                        update your profile, or communicate with us. This may include:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>Name and email address</li>
                        <li>Phone number (optional)</li>
                        <li>Profile information and skills</li>
                        <li>Payment information (processed securely by third parties)</li>
                        <li>Communication records</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">1.2 Usage Information</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We automatically collect certain information about your use of our platform, including:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>IP address and device information</li>
                        <li>Browser type and version</li>
                        <li>Pages visited and time spent on our platform</li>
                        <li>Search queries and preferences</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* How We Use Information */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-6 w-6 text-primary" />
                    2. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze usage patterns</li>
                    <li>Detect, prevent, and address technical issues</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                {/* Information Sharing */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    3. Information Sharing and Disclosure
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.1 We Do Not Sell Your Data</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We do not sell, trade, or otherwise transfer your personal information to third parties 
                        without your consent, except as described in this policy.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">3.2 When We Share Information</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        We may share your information in the following circumstances:
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                        <li>With service providers who assist us in operating our platform</li>
                        <li>To comply with legal obligations or court orders</li>
                        <li>To protect our rights, property, or safety</li>
                        <li>In connection with a business transfer or acquisition</li>
                        <li>With your explicit consent</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Data Security */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Lock className="h-6 w-6 text-primary" />
                    4. Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal 
                    information against unauthorized access, alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-4 space-y-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments and updates</li>
                    <li>Access controls and authentication measures</li>
                    <li>Secure payment processing through trusted providers</li>
                  </ul>
                </section>

                {/* Cookies and Tracking */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. 
                    You can control cookie settings through your browser preferences.
                  </p>
                </section>

                {/* Your Rights */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Access and update your personal information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Object to certain processing activities</li>
                  </ul>
                </section>

                {/* Data Retention */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services and 
                    fulfill the purposes outlined in this policy. When you delete your account, we will 
                    delete or anonymize your personal information within a reasonable timeframe.
                  </p>
                </section>

                {/* International Transfers */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your data in accordance with 
                    applicable privacy laws.
                  </p>
                </section>

                {/* Children's Privacy */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our services are not intended for children under 13 years of age. We do not knowingly 
                    collect personal information from children under 13. If we become aware that we have 
                    collected such information, we will take steps to delete it promptly.
                  </p>
                </section>

                {/* Changes to Policy */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any material 
                    changes by posting the new policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                {/* Contact Information */}
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-6 w-6 text-primary" />
                    11. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="font-medium">Gigs Mint Privacy Team</p>
                    <p>Email: privacy@gigsmint.com</p>
                    <p>Phone: +91-XXXX-XXXX</p>
                    <p>Address: [Your Business Address]</p>
                  </div>
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


