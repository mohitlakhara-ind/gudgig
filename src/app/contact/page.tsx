import Link from 'next/link';
import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Gigs Mint',
  description: "Get in touch with Gigs Mint support and admin team.",
  openGraph: { title: 'Contact Us | Gigs Mint', description: 'Contact Gigs Mint for support and inquiries', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Contact Us | Gigs Mint', description: 'Contact Gigs Mint support team' },
};

export default function Contact() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gigs Mint",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "kapiketu@gmail.com",
        "availableLanguage": "English"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6 text-foreground">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">kapiketu@gmail.com</p>
                        <p className="text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                        <p className="text-muted-foreground">Within 24 hours</p>
                        <p className="text-sm text-muted-foreground">Monday to Friday, 9 AM - 6 PM IST</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Support</h3>
                        <p className="text-muted-foreground">Technical & General Support</p>
                        <p className="text-sm text-muted-foreground">Help with platform usage and account issues</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <Link href="/faq" className="block text-primary hover:text-primary/80 transition-colors">
                      → Frequently Asked Questions
                    </Link>
                    <Link href="/help-center" className="block text-primary hover:text-primary/80 transition-colors">
                      → Help Center
                    </Link>
                    <Link href="/terms" className="block text-primary hover:text-primary/80 transition-colors">
                      → Terms of Service
                    </Link>
                    <Link href="/privacy" className="block text-primary hover:text-primary/80 transition-colors">
                      → Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-foreground">Send us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

