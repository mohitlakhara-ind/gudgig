import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, Briefcase, Building2, Settings, Wrench, Lightbulb, Mail, MessageCircle, Phone, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Help Center - Support & Resources | MicroJobs",
  description: "Get help with MicroJobs. Access guides, tutorials, troubleshooting tips, and contact support for job seekers and employers.",
  openGraph: {
    title: "Help Center - Support & Resources | MicroJobs",
    description: "Get help with MicroJobs. Access guides, tutorials, troubleshooting tips, and contact support for job seekers and employers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Help Center - Support & Resources | MicroJobs",
    description: "Get help with MicroJobs. Access guides, tutorials, troubleshooting tips, and contact support for job seekers and employers.",
  },
};

export default function HelpCenter() {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: Rocket,
      description: "New to MicroJobs? Start here with our beginner guides.",
      articles: [
        { title: "Creating Your Account", href: "#" },
        { title: "Setting Up Your Profile", href: "#" },
        { title: "Navigating the Dashboard", href: "#" },
        { title: "Understanding Job Alerts", href: "#" }
      ]
    },
    {
      title: "For Job Seekers",
      icon: Briefcase,
      description: "Everything you need to know about finding and applying for jobs.",
      articles: [
        { title: "How to Search for Jobs", href: "#" },
        { title: "Writing an Effective Resume", href: "#" },
        { title: "Applying to Jobs", href: "#" },
        { title: "Tracking Your Applications", href: "#" }
      ]
    },
    {
      title: "For Employers",
      icon: Building2,
      description: "Learn how to post jobs and manage your hiring process.",
      articles: [
        { title: "Posting Your First Job", href: "#" },
        { title: "Writing Job Descriptions", href: "#" },
        { title: "Reviewing Applications", href: "#" },
        { title: "Interviewing Candidates", href: "#" }
      ]
    },
    {
      title: "Account & Billing",
      icon: Settings,
      description: "Manage your account settings and billing information.",
      articles: [
        { title: "Updating Your Profile", href: "#" },
        { title: "Changing Password", href: "#" },
        { title: "Subscription Management", href: "#" },
        { title: "Payment Methods", href: "#" }
      ]
    },
    {
      title: "Troubleshooting",
      icon: Wrench,
      description: "Common issues and how to resolve them.",
      articles: [
        { title: "Login Problems", href: "#" },
        { title: "Upload Issues", href: "#" },
        { title: "Application Errors", href: "#" },
        { title: "Browser Compatibility", href: "#" }
      ]
    },
    {
      title: "Best Practices",
      icon: Lightbulb,
      description: "Tips and tricks to get the most out of MicroJobs.",
      articles: [
        { title: "Optimizing Your Profile", href: "#" },
        { title: "Networking on the Platform", href: "#" },
        { title: "Using Advanced Search", href: "#" },
        { title: "Building Your Personal Brand", href: "#" }
      ]
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours.",
      contact: "support@microjobs.com",
      icon: Mail
    },
    {
      title: "Live Chat",
      description: "Chat with our support team during business hours.",
      contact: "Available 9 AM - 6 PM PST",
      icon: MessageCircle
    },
    {
      title: "Phone Support",
      description: "Speak directly with our customer service team.",
      contact: "+1 (555) 123-4567",
      icon: Phone
    },
    {
      title: "Community Forum",
      description: "Connect with other users and share solutions.",
      contact: "Join our community",
      icon: Users
    }
  ];

  return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Help Center</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers, get support, and make the most of your MicroJobs experience.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input
                  type="search"
                  placeholder="Search for help..."
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </div>
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <category.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <a
                          href={article.href}
                          className="text-primary hover:underline text-sm"
                        >
                          {article.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">How to Create a Standout Resume</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn the key elements that make a resume effective and how to tailor it for different job applications.
                </p>
                <Button variant="outline" size="sm" className="bg-transparent">Read Article</Button>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Employer: Best Practices for Job Posting</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Discover how to write compelling job descriptions that attract the right candidates.
                </p>
                <Button variant="outline" size="sm" className="bg-transparent">Read Article</Button>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Understanding Job Application Status</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Learn what each application status means and what to expect next in the hiring process.
                </p>
                <Button variant="outline" size="sm" className="bg-transparent">Read Article</Button>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Setting Up Job Alerts</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Never miss a great opportunity. Learn how to set up personalized job alerts.
                </p>
                <Button variant="outline" size="sm" className="bg-transparent">Read Article</Button>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">Contact Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactOptions.map((option, index) => (
                <div key={index} className="text-center border rounded-lg p-6">
                  <div className="mb-4">
                    <option.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  <p className="text-primary font-medium">{option.contact}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-muted/50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is ready to help. Browse our FAQ or get in touch directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/faq">Browse FAQ</Link>
              </Button>
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </section>
        </div>
      </main>
     
  );
}
