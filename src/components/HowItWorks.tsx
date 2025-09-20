'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Post Jobs',
    description: 'Employers create detailed job listings with requirements and budget. Get admin approval for quality.',
    color: '#1FA9FF'
  },
  {
    icon: Search,
    title: 'Browse & Subscribe',
    description: 'Candidates discover jobs and choose from flexible subscription plans to unlock full details.',
    color: '#037171'
  },
  {
    icon: CheckCircle,
    title: 'Apply & Connect',
    description: 'Subscribers apply directly to employers and manage applications through their dashboard.',
    color: '#0A0908'
  }
];

export default function HowItWorksMinimal() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header Section - Improved hierarchy */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-light text-[#0A0908] mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-[#0A0908]/60 max-w-xl mx-auto font-light leading-relaxed">
            A simple three-step process to connect talent with opportunity
          </p>
        </div>

        {/* Steps - Cleaner layout */}
        <div className="grid md:grid-cols-3 gap-12 mb-20 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="text-center group relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 -right-6 w-12 h-px bg-gradient-to-r from-[#C9F6FF]/40 to-transparent"></div>
                )}

                <Card className="border-0 shadow-none hover:shadow-lg transition-all duration-500 bg-transparent group-hover:bg-[#F6F7F8]/30 rounded-3xl">
                  <CardContent className="p-8">
                    {/* Icon with minimal styling */}
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${step.color}10` }}
                    >
                      <Icon 
                        className="h-9 w-9 transition-colors duration-300" 
                        style={{ color: step.color }}
                      />
                    </div>

                    {/* Step number - subtle */}
                    <div className="mb-6">
                      <span className="text-xs font-medium text-[#C9F6FF] tracking-wider uppercase mb-2 block">
                        Step {index + 1}
                      </span>
                      <h3 className="text-2xl font-medium text-[#0A0908] tracking-tight">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-[#0A0908]/60 leading-relaxed text-sm font-light">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Minimal CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-lg mx-auto">
            <button 
              className="w-full sm:w-auto bg-[#1FA9FF] text-white px-8 py-4 rounded-full font-medium hover:bg-[#1FA9FF]/90 transition-all duration-300 text-sm tracking-wide shadow-sm hover:shadow-md"
            >
              Start Hiring
            </button>
            <button 
              className="w-full sm:w-auto border border-[#037171] text-[#037171] px-8 py-4 rounded-full font-medium hover:bg-[#037171] hover:text-white transition-all duration-300 text-sm tracking-wide"
            >
              Find Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}