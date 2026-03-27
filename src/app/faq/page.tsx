import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Gudgig",
  description: "Find answers to common questions about Gudgig. Get help with gig browsing, bidding, account management, and more.",
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Gudgig",
    description: "Find answers to common questions about Gudgig. Get help with gig browsing, bidding, account management, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - Frequently Asked Questions | Gudgig",
    description: "Find answers to common questions about Gudgig. Get help with gig browsing, bidding, account management, and more.",
  },
};

export default function FAQ() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I create a freelancer account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click the 'Sign Up' button on the homepage, select 'Freelancer' as your role, fill in your details, and verify your email address."
        }
      },
      {
        "@type": "Question",
        "name": "How do I place a bid on a gig?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Browse available gigs, click on one that interests you, review the details, and click 'Place Bid'. You'll need to pay a small bid fee and provide your quotation and proposal."
        }
      },
      {
        "@type": "Question",
        "name": "What is the bid fee for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The bid fee (₹1-₹10) helps maintain quality by ensuring serious proposals and reducing spam. It's a one-time payment per bid."
        }
      }
    ]
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create a freelancer account?",
          answer: "Click the 'Sign Up' button on the homepage, select 'Freelancer' as your role, fill in your details, and verify your email address. It's completely free to create an account."
        },
        {
          question: "Do I need to pay to join Gudgig?",
          answer: "No, creating an account is completely free. You only pay a small bid fee (₹1-₹10) when you place a bid on a gig."
        },
        {
          question: "Can I browse gigs without an account?",
          answer: "Yes, you can browse all available gigs as a guest. However, you'll need to create an account and login to place bids."
        }
      ]
    },
    {
      category: "Bidding & Payments",
      questions: [
        {
          question: "How do I place a bid on a gig?",
          answer: "Browse available gigs, click on one that interests you, review the details, and click 'Place Bid'. You'll need to pay a small bid fee and provide your quotation and proposal."
        },
        {
          question: "What is the bid fee for?",
          answer: "The bid fee (₹1-₹10) helps maintain quality by ensuring serious proposals and reducing spam. It's a one-time payment per bid, not a subscription."
        },
        {
          question: "How do I pay the bid fee?",
          answer: "We use Razorpay for secure payments. You can pay using UPI, cards, net banking, or other supported payment methods."
        },
        {
          question: "Can I get a refund for my bid fee?",
          answer: "Bid fees are generally non-refundable as they help maintain platform quality. However, if there's a technical issue, please contact support."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I update my profile?",
          answer: "Go to your dashboard, click on 'Profile', and update your information. A complete profile helps you get better gig matches."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in your profile settings. You'll need to verify the new email address."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team at kapiketu@gmail.com to request account deletion. We'll process your request within 24 hours."
        }
      ]
    },
    {
      category: "Gigs & Projects",
      questions: [
        {
          question: "How do I find gigs that match my skills?",
          answer: "Use the search and filter options on the gigs page. You can filter by category, budget range, and other criteria to find relevant opportunities."
        },
        {
          question: "Can I save gigs for later?",
          answer: "Yes, you can save gigs by clicking the 'Save' button. Saved gigs appear in your dashboard for easy access."
        },
        {
          question: "How do I know if my bid was successful?",
          answer: "The admin will review all bids and contact successful freelancers directly. You can also check your bid status in your dashboard."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I'm having trouble logging in. What should I do?",
          answer: "Try resetting your password using the 'Forgot Password' link. If the issue persists, contact support at kapiketu@gmail.com."
        },
        {
          question: "The payment failed. What should I do?",
          answer: "Check your internet connection and payment method. If the issue continues, try a different payment method or contact support."
        },
        {
          question: "I can't see my bids in the dashboard. Why?",
          answer: "Make sure you're logged in with the correct account. If you still don't see your bids, contact support for assistance."
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about using Gudgig
              </p>
            </div>

            <div className="space-y-12">
              {faqs.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h2 className="text-2xl font-bold mb-6 text-foreground">{section.category}</h2>
                  <div className="space-y-4">
                    {section.questions.map((faq, faqIndex) => (
                      <div key={faqIndex} className="bg-muted rounded-lg p-6">
                        <h3 className="font-semibold text-foreground mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="bg-muted p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Still have questions?</h2>
                <p className="text-muted-foreground mb-6">
                  Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      Contact Support
                    </button>
                  </Link>
                  <Link href="/help-center">
                    <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors">
                      Help Center
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

