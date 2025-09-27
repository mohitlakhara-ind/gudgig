import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | MicroJobs',
  description: "Get in touch with MicroJobs support, sales, and offices.",
  openGraph: { title: 'Contact Us | MicroJobs', description: '...', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Contact Us | MicroJobs', description: '...' },
};

export default function Contact() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MicroJobs",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service",
        "email": "support@microjobs.com",
        "availableLanguage": "English"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4568",
        "contactType": "sales",
        "email": "sales@microjobs.com",
        "availableLanguage": "English"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tech Street",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    }
  };

  const officeLocations = [
    {
      city: "San Francisco",
      address: "123 Tech Street, San Francisco, CA 94105",
      phone: "+1 (555) 123-4567",
      email: "sf@microjobs.com"
    },
    {
      city: "New York",
      address: "456 Business Ave, New York, NY 10001",
      phone: "+1 (555) 123-4568",
      email: "ny@microjobs.com"
    },
    {
      city: "Austin",
      address: "789 Innovation Blvd, Austin, TX 78701",
      phone: "+1 (555) 123-4569",
      email: "austin@microjobs.com"
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                Have a question or need support? We'd love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <ContactForm />

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

                {/* Contact Details */}
                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="font-semibold mb-2">General Support</h3>
                    <p className="text-muted-foreground">support@microjobs.com</p>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Sales & Partnerships</h3>
                    <p className="text-muted-foreground">sales@microjobs.com</p>
                    <p className="text-muted-foreground">+1 (555) 123-4568</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM PST</p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>

                {/* Office Locations */}
                <div>
                  <h3 className="font-semibold mb-4">Our Offices</h3>
                  <div className="space-y-4">
                    {officeLocations.map((office, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{office.city}</h4>
                        <p className="text-muted-foreground text-sm mb-1">{office.address}</p>
                        <p className="text-muted-foreground text-sm mb-1">{office.phone}</p>
                        <p className="text-muted-foreground text-sm">{office.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Support Options */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-semibold mb-6">Other Ways to Get Help</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Help Center</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Browse our comprehensive help articles and guides.
                  </p>
                  <Button variant="outline" asChild className="bg-transparent">
                    <Link href="/help-center">Visit Help Center</Link>
                  </Button>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">FAQ</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Find quick answers to frequently asked questions.
                  </p>
                  <Button variant="outline" asChild className="bg-transparent">
                    <Link href="/faq">Browse FAQ</Link>
                  </Button>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Community Forum</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Connect with other users and share solutions.
                  </p>
                  <Button variant="outline" asChild className="bg-transparent">
                    <a href="#">Join Community</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}