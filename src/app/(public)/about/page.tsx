import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Us - MicroJobs",
  description: "Learn about MicroJobs - connecting talented candidates with employers. Discover our mission, vision, team, and company history in the job market.",
  openGraph: {
    title: "About MicroJobs - Our Mission & Team",
    description: "Learn about MicroJobs - connecting talented candidates with employers. Discover our mission, vision, team, and company history in the job market.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About MicroJobs - Our Mission & Team",
    description: "Learn about MicroJobs - connecting talented candidates with employers. Discover our mission, vision, team, and company history in the job market.",
  },
};

export default function About() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MicroJobs",
    "description": "Connecting talented candidates with employers looking for skilled professionals.",
    "url": "https://jobportal.com",
    "logo": "https://jobportal.com/logo.png",
    "foundingDate": "2020",
    "founders": [
      {
        "@type": "Person",
        "name": "John Doe"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "hello@microjobs.com"
    },
    "sameAs": [
      "https://www.facebook.com/microjobs",
      "https://www.twitter.com/microjobs",
      "https://www.linkedin.com/company/microjobs"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About MicroJobs</h1>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              At MicroJobs, our mission is to connect talented candidates with employers looking for skilled professionals.
              We believe that the right job can transform lives, and we're committed to making the job search process
              efficient, transparent, and rewarding for everyone involved.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-lg text-muted-foreground mb-6">
              We envision a world where finding the perfect job is as simple as a few clicks. Our platform serves as
              a bridge between opportunity and talent, fostering meaningful connections that drive career growth and
              business success.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Founded in 2020, MicroJobs emerged from the need for a more streamlined and effective job marketplace.
              Our founders recognized the challenges both job seekers and employers faced in the traditional recruitment
              process and set out to create a solution that would benefit everyone.
            </p>
            <p className="text-lg text-muted-foreground mb-6">
              Starting as a small team with a big vision, we've grown into a comprehensive platform that serves
              thousands of users daily. Our commitment to innovation and user experience has been the driving force
              behind our success.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our diverse team brings together experts in technology, recruitment, and business development.
              Each member is passionate about creating a platform that makes a real difference in people's careers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">JD</span>
                </div>
                <h3 className="font-semibold">John Doe</h3>
                <p className="text-muted-foreground">CEO & Founder</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">JS</span>
                </div>
                <h3 className="font-semibold">Jane Smith</h3>
                <p className="text-muted-foreground">CTO</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">MJ</span>
                </div>
                <h3 className="font-semibold">Mike Johnson</h3>
                <p className="text-muted-foreground">Head of Recruitment</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Why Choose MicroJobs?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">For Job Seekers</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Access to thousands of job opportunities</li>
                  <li>• Personalized job recommendations</li>
                  <li>• Easy application process</li>
                  <li>• Career development resources</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">For Employers</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Quality candidate pool</li>
                  <li>• Advanced search and filtering</li>
                  <li>• Efficient hiring process</li>
                  <li>• Comprehensive analytics</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}