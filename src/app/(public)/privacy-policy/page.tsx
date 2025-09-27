import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - Data Protection | MicroJobs",
  description: "Learn how MicroJobs collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices.",
  openGraph: {
    title: "Privacy Policy - Data Protection | MicroJobs",
    description: "Learn how MicroJobs collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Data Protection | MicroJobs",
    description: "Learn how MicroJobs collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices.",
  },
};

export default function PrivacyPolicy() {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                At MicroJobs ("we," "us," or "our"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job portal platform and related services.
              </p>
              <p className="mb-4">
                By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
              <p className="mb-4">We may collect the following types of personal information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Name, email address, and contact information</li>
                <li>Professional information (resume, work experience, skills)</li>
                <li>Educational background and qualifications</li>
                <li>Account credentials and profile information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.2 Usage Information</h3>
              <p className="mb-4">We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on our site</li>
                <li>Device information and operating system</li>
                <li>Referral sources and search terms</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">2.3 Cookies and Tracking Technologies</h3>
              <p className="mb-4">
                We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide and maintain our job portal services</li>
                <li>Process job applications and connect candidates with employers</li>
                <li>Create and manage user accounts</li>
                <li>Send important service updates and notifications</li>
                <li>Improve our platform through analytics and user feedback</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-medium mb-3">4.1 With Employers (for Job Seekers)</h3>
              <p className="mb-4">
                When you apply for jobs through our platform, your resume and application information may be shared with the relevant employer. We only share information necessary for the hiring process.
              </p>

              <h3 className="text-xl font-medium mb-3">4.2 Service Providers</h3>
              <p className="mb-4">
                We may share information with trusted third-party service providers who assist us in operating our platform, such as hosting providers, analytics services, and payment processors.
              </p>

              <h3 className="text-xl font-medium mb-3">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose information if required by law, court order, or government request, or to protect our rights, property, or safety, or that of our users.
              </p>

              <h3 className="text-xl font-medium mb-3">4.4 Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods vary depending on the type of information and the purpose for which it was collected.
              </p>
              <p className="mb-4">
                When information is no longer needed, we securely delete or anonymize it in accordance with our data retention policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date.
              </p>
              <p className="mb-4">
                Your continued use of our services after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@microjobs.com</p>
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