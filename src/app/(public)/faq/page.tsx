import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | MicroJobs",
  description: "Find answers to common questions about MicroJobs. Get help with job searching, posting jobs, account management, and more.",
  openGraph: {
    title: "FAQ - Frequently Asked Questions | MicroJobs",
    description: "Find answers to common questions about MicroJobs. Get help with job searching, posting jobs, account management, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Frequently Asked Questions | MicroJobs",
    description: "Find answers to common questions about MicroJobs. Get help with job searching, posting jobs, account management, and more.",
  },
};

export default function FAQ() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create a job seeker account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To create a job seeker account, click on the 'Register' button and select 'Job Seeker'. Fill in your personal information, upload your resume, and complete your profile."
        }
      },
      {
        "@type": "Question",
        "name": "How do I post a job as an employer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Employers can post jobs by creating an employer account, then navigating to the 'Post a Job' section. Fill in job details, requirements, and company information."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a fee to use MicroJobs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Job seekers can use our platform for free. Employers have access to basic features for free, with premium features available through our subscription plans."
        }
      }
    ]
  };

  const faqCategories = [
    {
      title: "For Job Seekers",
      faqs: [
        {
          question: "How do I create a job seeker account?",
          answer: "To create a job seeker account, click on the 'Register' button in the top navigation and select 'Job Seeker'. Fill in your personal information including name, email, and password. You can then upload your resume and complete your profile with skills, experience, and preferences."
        },
        {
          question: "How do I search for jobs?",
          answer: "Use the search bar on our homepage or navigate to the 'Find Jobs' page. You can filter by location, job type, salary range, and keywords. Save your searches to get notified about new matching jobs."
        },
        {
          question: "How do I apply for a job?",
          answer: "Click on any job posting that interests you, review the details, and click 'Apply Now'. You'll need to submit your resume and may be asked to answer additional questions specific to the role."
        },
        {
          question: "Can I save jobs for later?",
          answer: "Yes! When viewing a job posting, click the bookmark icon to save it to your favorites. You can access all saved jobs from your dashboard under 'Saved Jobs'."
        }
      ]
    },
    {
      title: "For Employers",
      faqs: [
        {
          question: "How do I create an employer account?",
          answer: "Click on the 'Register' button and select 'Employer'. Provide your company information, contact details, and create login credentials. You'll need to verify your email before posting jobs."
        },
        {
          question: "How do I post a job?",
          answer: "After logging in as an employer, go to 'Post a Job' from your dashboard. Fill in job title, description, requirements, salary, and location. You can also set application deadlines and customize the application form."
        },
        {
          question: "How much does it cost to post a job?",
          answer: "Basic job posting is free for a limited time. Premium features like featured listings, advanced analytics, and priority support are available through our subscription plans. Check our pricing page for current rates."
        },
        {
          question: "How do I review applications?",
          answer: "Access your employer dashboard and go to 'My Jobs'. Click on any posted job to view all applications. You can filter candidates, view resumes, and contact applicants directly through our platform."
        }
      ]
    },
    {
      title: "Account Management",
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Login' and then 'Forgot Password'. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your account settings. Go to your profile page and click 'Edit Profile'. You'll need to verify the new email address before it becomes active."
        },
        {
          question: "How do I delete my account?",
          answer: "Account deletion requests can be submitted through your account settings or by contacting our support team. Please note that some data may be retained for legal and regulatory purposes."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We comply with data protection regulations and never share your information without your consent."
        }
      ]
    },
    {
      title: "Billing & Payments",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for subscription payments. All transactions are processed securely through encrypted connections."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer refunds within 30 days of purchase for annual subscriptions. Monthly subscriptions are non-refundable. Contact our support team to request a refund."
        },
        {
          question: "How do I update my billing information?",
          answer: "Go to your account settings and click on 'Billing'. You can update your payment method, billing address, and view your payment history from there."
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground text-center mb-12">
              Find answers to common questions about using MicroJobs. Can't find what you're looking for?
              <Link href="/contact" className="text-primary hover:underline ml-1">Contact our support team</Link>.
            </p>

            {faqCategories.map((category, categoryIndex) => (
              <section key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">{category.title}</h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <details key={faqIndex} className="border rounded-lg p-6">
                      <summary className="font-semibold cursor-pointer hover:text-primary">
                        {faq.question}
                      </summary>
                      <p className="text-muted-foreground mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <section className="text-center bg-muted/50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help. Get in touch with us and we'll respond as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                  Contact Support
                </Link>
                <Link href="/help-center" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                  Visit Help Center
                </Link>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}