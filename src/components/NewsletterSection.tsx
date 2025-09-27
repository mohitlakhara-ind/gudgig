'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, Bell } from 'lucide-react';

export default function ProfessionalNewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section
      className="py-10 md:py-28 relative bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">



            {/* Subtle Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 overflow-hidden">
              <div
                className="w-full h-full rounded-full bg-primary"
              ></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-12">
                <div
                  className="inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-semibold mb-6 border bg-accent/20 border-primary text-secondary"
                >
                  <Bell className="h-4 w-4" />
                  <span>Stay Updated</span>
                </div>

                <h2
                  className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground"
                >
                  Get Premium Jobs
                  <span className="text-primary"> First</span>
                </h2>

                <p
                  className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-secondary"
                >
                  Subscribe to our professional newsletter and receive exclusive access to high-paying opportunities,
                  industry insights, and career advancement tips delivered directly to your inbox.
                </p>
              </div>

              {/* Subscription Form */}
              {!isSubscribed ? (
                <div className="max-w-lg mx-auto mb-16">
                  <div onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Mail
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary"
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your professional email"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none transition-all duration-300 bg-card border-accent text-card-foreground"
                          onFocus={(e) => e.target.style.borderColor = 'hsl(var(--primary))'}
                          onBlur={(e) => e.target.style.borderColor = 'hsl(var(--accent))'}
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] text-primary-foreground bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? (
                          <div
                            className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                          ></div>
                        ) : (
                          <>
                            Subscribe Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <p
                    className="text-sm text-center mt-4 text-secondary"
                  >
                    By subscribing, you agree to receive professional updates. Unsubscribe anytime.
                  </p>
                </div>
              ) : (
                <div className="max-w-lg mx-auto mb-16">
                  <div
                    className="rounded-2xl p-8 text-center border bg-accent/20 border-primary"
                  >
                    <CheckCircle
                      className="h-16 w-16 mx-auto mb-4 text-secondary"
                    />
                    <h3
                      className="text-2xl font-bold mb-3 text-foreground"
                    >
                      Successfully Subscribed
                    </h3>
                    <p className="text-secondary">
                      Welcome to our professional community. Check your email for confirmation and your first exclusive job alert.
                    </p>
                  </div>
                </div>
              )}
              {/* Stats and Trust Indicators */}
              <div
                className="border-t pt-8 border-accent"
              >
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
