import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Careers at MicroJobs - Join Our Team",
  description: "Explore career opportunities at MicroJobs. Join our innovative team and help shape the future of job matching technology.",
  openGraph: {
    title: "Careers at MicroJobs - Join Our Team",
    description: "Explore career opportunities at MicroJobs. Join our innovative team and help shape the future of job matching technology.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at MicroJobs - Join Our Team",
    description: "Explore career opportunities at MicroJobs. Join our innovative team and help shape the future of job matching technology.",
  },
};

export default function Careers() {
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Careers at MicroJobs",
    "description": "Explore career opportunities at MicroJobs. Join our innovative team and help shape the future of job matching technology.",
    "url": "https://jobportal.com/careers",
    "isPartOf": {
      "@type": "WebSite",
      "name": "MicroJobs",
      "url": "https://jobportal.com"
    },
    "mainEntity": {
      "@type": "JobPosting",
      "title": "Software Engineer",
      "description": "We are looking for talented software engineers to join our team.",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "MicroJobs"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "San Francisco",
          "addressRegion": "CA",
          "addressCountry": "US"
        }
      }
    }
  };

  const openPositions = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time"
    },
    {
      title: "UX Designer",
      department: "Design",
      location: "San Francisco, CA",
      type: "Full-time"
    },
    {
      title: "Talent Acquisition Specialist",
      department: "HR",
      location: "Remote",
      type: "Full-time"
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Careers at MicroJobs</h1>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Join Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At MicroJobs, we're building the future of work. Join our passionate team of innovators,
                creators, and problem-solvers who are dedicated to connecting talent with opportunity.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Our Culture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-muted-foreground">We encourage creative thinking and embrace new ideas that challenge the status quo.</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Collaboration</h3>
                  <p className="text-muted-foreground">We believe in the power of teamwork and cross-functional collaboration.</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <h3 className="font-semibold mb-2">Impact</h3>
                  <p className="text-muted-foreground">Every role at MicroJobs contributes to meaningful change in the job market.</p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Benefits & Perks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Health & Wellness</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Comprehensive health insurance</li>
                    <li>• Dental and vision coverage</li>
                    <li>• Mental health support</li>
                    <li>• Flexible PTO policy</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Professional Development</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Learning and development budget</li>
                    <li>• Conference attendance</li>
                    <li>• Mentorship programs</li>
                    <li>• Career growth opportunities</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Work-Life Balance</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Remote work options</li>
                    <li>• Flexible hours</li>
                    <li>• Work from anywhere</li>
                    <li>• Parental leave</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Company Perks</h3>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Stock options</li>
                    <li>• Team events and outings</li>
                    <li>• Modern office equipment</li>
                    <li>• Catered meals</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Open Positions</h2>
              <div className="space-y-4">
                {openPositions.map((position, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <p className="text-muted-foreground">{position.department}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{position.location}</p>
                        <p>{position.type}</p>
                      </div>
                    </div>
                    <Button>Apply Now</Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Application Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold">1</div>
                  <h3 className="font-semibold mb-2">Apply</h3>
                  <p className="text-muted-foreground text-sm">Submit your application and resume</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold">2</div>
                  <h3 className="font-semibold mb-2">Review</h3>
                  <p className="text-muted-foreground text-sm">Our team reviews your application</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold">3</div>
                  <h3 className="font-semibold mb-2">Interview</h3>
                  <p className="text-muted-foreground text-sm">Technical and cultural interviews</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold">4</div>
                  <h3 className="font-semibold mb-2">Offer</h3>
                  <p className="text-muted-foreground text-sm">Welcome to the MicroJobs team!</p>
                </div>
              </div>
            </section>

            <section className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Ready to Join Us?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Don't see a position that matches your skills? We're always looking for talented individuals.
                Send us your resume and we'll keep you in mind for future opportunities.
              </p>
              <Button size="lg">Send Us Your Resume</Button>
            </section>
          </div>
        </main>

    </>
  );
}