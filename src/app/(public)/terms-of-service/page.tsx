import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - User Agreement | MicroJobs",
  description: "Read MicroJobs Terms of Service and User Agreement. Understand your rights and responsibilities when using our job portal platform.",
  openGraph: {
    title: "Terms of Service - User Agreement | MicroJobs",
    description: "Read MicroJobs Terms of Service and User Agreement. Understand your rights and responsibilities when using our job portal platform.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - User Agreement | MicroJobs",
    description: "Read MicroJobs Terms of Service and User Agreement. Understand your rights and responsibilities when using our job portal platform.",
  },
};

export default function TermsOfService() {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                Welcome to MicroJobs. These Terms of Service ("Terms") govern your use of our job portal platform and related services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
              <p className="mb-4">
                These Terms constitute a legally binding agreement between you and MicroJobs ("we," "us," or "our"). By using our Service, you represent that you are at least 18 years old and have the legal capacity to enter into these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                MicroJobs is a job portal platform that connects job seekers with employers. Our Service includes:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Job posting and application management for employers</li>
                <li>Job search and application tools for job seekers</li>
                <li>Profile creation and management</li>
                <li>Communication tools between employers and candidates</li>
                <li>Analytics and reporting features</li>
                <li>Premium subscription services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

              <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
              <p className="mb-4">
                To use certain features of our Service, you must create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-xl font-medium mb-3">3.2 Account Security</h3>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
              </p>

              <h3 className="text-xl font-medium mb-3">3.3 Account Termination</h3>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for other reasons we deem necessary to protect our Service or users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>

              <h3 className="text-xl font-medium mb-3">4.1 Lawful Use</h3>
              <p className="mb-4">
                You agree to use our Service only for lawful purposes and in accordance with these Terms. You shall not use our Service to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post false, misleading, or inappropriate content</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">4.2 Content Standards</h3>
              <p className="mb-4">
                All content you submit to our Service must be accurate, truthful, and not misleading. You retain ownership of your content but grant us a license to use, display, and distribute it as necessary to provide our Service.
              </p>

              <h3 className="text-xl font-medium mb-3">4.3 Prohibited Activities</h3>
              <p className="mb-4">
                You shall not engage in any activity that could damage, disable, overburden, or impair our Service, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Using automated tools to access our Service</li>
                <li>Attempting to reverse engineer our software</li>
                <li>Creating fake accounts or profiles</li>
                <li>Impersonating other individuals or entities</li>
                <li>Collecting user data without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Job Postings and Applications</h2>

              <h3 className="text-xl font-medium mb-3">5.1 Employer Responsibilities</h3>
              <p className="mb-4">
                Employers posting jobs on our platform agree to provide accurate job descriptions, compensation information, and company details. All job postings must comply with applicable employment laws and regulations.
              </p>

              <h3 className="text-xl font-medium mb-3">5.2 Job Seeker Responsibilities</h3>
              <p className="mb-4">
                Job seekers agree to provide truthful information in their profiles and applications. Misrepresentation of qualifications, experience, or other information may result in account suspension.
              </p>

              <h3 className="text-xl font-medium mb-3">5.3 Application Process</h3>
              <p className="mb-4">
                Our Service facilitates the application process but does not guarantee employment. We are not responsible for the hiring decisions or practices of employers using our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Payment Terms</h2>

              <h3 className="text-xl font-medium mb-3">6.1 Subscription Services</h3>
              <p className="mb-4">
                Some features of our Service require payment of fees. By subscribing to paid services, you agree to pay all applicable fees and charges.
              </p>

              <h3 className="text-xl font-medium mb-3">6.2 Billing and Payment</h3>
              <p className="mb-4">
                All payments are processed securely through our authorized payment processors. You agree to provide accurate billing information and authorize us to charge your payment method.
              </p>

              <h3 className="text-xl font-medium mb-3">6.3 Refunds</h3>
              <p className="mb-4">
                Refund policies vary by service. Generally, subscription fees are non-refundable except as required by law or as specified in our refund policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>

              <h3 className="text-xl font-medium mb-3">7.1 Our Intellectual Property</h3>
              <p className="mb-4">
                All content, features, and functionality of our Service, including but not limited to text, graphics, logos, and software, are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3">7.2 User Content</h3>
              <p className="mb-4">
                You retain ownership of content you submit to our Service. By submitting content, you grant us a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content as necessary to provide our Service.
              </p>

              <h3 className="text-xl font-medium mb-3">7.3 DMCA</h3>
              <p className="mb-4">
                We respect intellectual property rights and respond to valid DMCA takedown notices. If you believe your intellectual property has been infringed, please contact us with the required information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Privacy</h2>
              <p className="mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, you consent to our collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations</h2>

              <h3 className="text-xl font-medium mb-3">9.1 Service Availability</h3>
              <p className="mb-4">
                We strive to provide reliable service but cannot guarantee uninterrupted or error-free operation. Our Service is provided "as is" without warranties of any kind.
              </p>

              <h3 className="text-xl font-medium mb-3">9.2 Employment Outcomes</h3>
              <p className="mb-4">
                We do not guarantee job placement or employment outcomes. Our Service facilitates connections between job seekers and employers but does not guarantee hiring or employment.
              </p>

              <h3 className="text-xl font-medium mb-3">9.3 Limitation of Liability</h3>
              <p className="mb-4">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold us harmless from any claims, damages, losses, or expenses arising from your use of our Service, violation of these Terms, or infringement of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and access to our Service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use our Service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of San Francisco County, California.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of our Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@microjobs.com</p>
                <p><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}