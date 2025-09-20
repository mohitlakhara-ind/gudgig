'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight, Bell, Users, Shield } from 'lucide-react';

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
      className="py-20 md:py-28 relative"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
    
            
            {/* Subtle Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5 overflow-hidden">
              <div 
                className="w-full h-full rounded-full"
                style={{ backgroundColor: '#1FA9FF' }}
              ></div>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-12">
                <div 
                  className="inline-flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-semibold mb-6 border"
                  style={{ 
                    backgroundColor: '#C9F6FF',
                    borderColor: '#1FA9FF',
                    color: '#037171'
                  }}
                >
                  <Bell className="h-4 w-4" />
                  <span>Stay Updated</span>
                </div>

                <h2 
                  className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                  style={{ color: '#0A0908' }}
                >
                  Get Premium Jobs
                  <span style={{ color: '#1FA9FF' }}> First</span>
                </h2>
                
                <p 
                  className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto"
                  style={{ color: '#037171' }}
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
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                          style={{ color: '#037171' }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your professional email"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none transition-all duration-300"
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#C9F6FF',
                            color: '#0A0908'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#1FA9FF'}
                          onBlur={(e) => e.target.style.borderColor = '#C9F6FF'}
                        />
                      </div>
                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px] text-white"
                        style={{ 
                          backgroundColor: '#1FA9FF',
                          ':hover': { backgroundColor: '#037171' }
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#037171'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#1FA9FF'}
                      >
                        {isLoading ? (
                          <div 
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
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
                    className="text-sm text-center mt-4"
                    style={{ color: '#037171' }}
                  >
                    By subscribing, you agree to receive professional updates. Unsubscribe anytime.
                  </p>
                </div>
              ) : (
                <div className="max-w-lg mx-auto mb-16">
                  <div 
                    className="rounded-2xl p-8 text-center border"
                    style={{ 
                      backgroundColor: '#C9F6FF',
                      borderColor: '#1FA9FF'
                    }}
                  >
                    <CheckCircle 
                      className="h-16 w-16 mx-auto mb-4"
                      style={{ color: '#037171' }}
                    />
                    <h3 
                      className="text-2xl font-bold mb-3"
                      style={{ color: '#0A0908' }}
                    >
                      Successfully Subscribed
                    </h3>
                    <p style={{ color: '#037171' }}>
                      Welcome to our professional community. Check your email for confirmation and your first exclusive job alert.
                    </p>
                  </div>
                </div>
              )}
              {/* Stats and Trust Indicators */}
              <div 
                className="border-t pt-8"
                style={{ borderColor: '#C9F6FF' }}
              >
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}