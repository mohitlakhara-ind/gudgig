'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, CheckCircle, Users, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';

const employerSteps = [
  {
    icon: Upload,
    title: 'Post Your Job',
    description: 'Create detailed job listings with requirements, skills, and budget. Our team reviews for quality assurance.',
    detail: 'Add job title, description, requirements, budget range, and timeline',
    color: '#1FA9FF'
  },
  {
    icon: CheckCircle,
    title: 'Get Approved',
    description: 'Quick admin review ensures quality listings. Most jobs are approved within 24 hours.',
    detail: 'Quality check for clear requirements and fair compensation',
    color: '#037171'
  },
  {
    icon: Users,
    title: 'Connect with Talent',
    description: 'Receive applications from qualified candidates and manage the hiring process seamlessly.',
    detail: 'Review applications, schedule interviews, and hire the best fit',
    color: '#0A0908'
  }
];

const candidateSteps = [
  {
    icon: Search,
    title: 'Browse Jobs',
    description: 'Explore job listings across various categories and skill levels. Filter by location, budget, and type.',
    detail: 'Search by category, location, skills, or company size',
    color: '#1FA9FF'
  },
  {
    icon: CheckCircle,
    title: 'Choose Your Plan',
    description: 'Select from flexible subscription plans to unlock full job details and application features.',
    detail: 'Basic free access or premium plans with full details and priority support',
    color: '#037171'
  },
  {
    icon: Briefcase,
    title: 'Apply & Track',
    description: 'Submit applications directly and track your progress through an intuitive dashboard.',
    detail: 'One-click apply, application tracking, and interview scheduling',
    color: '#0A0908'
  }
];

export default function HowItWorksMinimal() {
  const [activeTab, setActiveTab] = useState('employers');

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-[#0A0908] mb-6 tracking-tight">
            How It Works
          </h2>
          <p className="text-lg text-[#0A0908]/60 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Simple steps for both employers and job seekers to connect and collaborate
          </p>

          {/* Tab Switcher */}
          <div className="inline-flex bg-[#F6F7F8] p-1.5 rounded-full border border-[#C9F6FF]/20">
            <button
              onClick={() => setActiveTab('employers')}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'employers'
                  ? 'bg-[#1FA9FF] text-white shadow-md'
                  : 'text-[#0A0908]/60 hover:text-[#0A0908]'
              }`}
            >
              For Employers
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'candidates'
                  ? 'bg-[#037171] text-white shadow-md'
                  : 'text-[#0A0908]/60 hover:text-[#0A0908]'
              }`}
            >
              For Job Seekers
            </button>
          </div>
        </div>

        {/* Steps Content */}
        <div className="relative">
          {/* Employers Flow */}
          <div className={`transition-all duration-500 ${
            activeTab === 'employers' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {employerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative group">
                    {/* Connection Arrow */}
                    {index < employerSteps.length - 1 && (
                      <div className="hidden md:flex absolute top-20 -right-4 z-10 w-8 h-8 bg-white items-center justify-center rounded-full border border-[#C9F6FF]/30">
                        <ArrowRight className="w-4 h-4 text-[#1FA9FF]" />
                      </div>
                    )}

                    <Card className="h-full border border-[#C9F6FF]/20 hover:border-[#1FA9FF]/30 hover:shadow-lg transition-all duration-300 bg-white group-hover:bg-[#F6F7F8]/30 rounded-2xl">
                      <CardContent className="p-8">
                        {/* Step Number & Icon */}
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: `${step.color}15` }}>
                            <Icon className="h-6 w-6" style={{ color: step.color }} />
                          </div>
                          <span className="text-xs font-medium text-[#C9F6FF] tracking-wider uppercase">
                            Step {index + 1}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-[#0A0908] mb-4 tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-[#0A0908]/70 mb-4 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-xs text-[#0A0908]/50 bg-[#F6F7F8] rounded-lg p-3 border-l-3 border-[#1FA9FF]/20">
                          {step.detail}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Employer CTA */}
            <div className="text-center">
              <button className="bg-[#1FA9FF] text-white px-10 py-4 rounded-full font-medium hover:bg-[#1FA9FF]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide">
                Start Hiring Today
              </button>
              <p className="text-xs text-[#0A0908]/50 mt-3">Free to post • Quick approval process</p>
            </div>
          </div>

          {/* Candidates Flow */}
          <div className={`transition-all duration-500 ${
            activeTab === 'candidates' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {candidateSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative group">
                    {/* Connection Arrow */}
                    {index < candidateSteps.length - 1 && (
                      <div className="hidden md:flex absolute top-20 -right-4 z-10 w-8 h-8 bg-white items-center justify-center rounded-full border border-[#C9F6FF]/30">
                        <ArrowRight className="w-4 h-4 text-[#037171]" />
                      </div>
                    )}

                    <Card className="h-full border border-[#C9F6FF]/20 hover:border-[#037171]/30 hover:shadow-lg transition-all duration-300 bg-white group-hover:bg-[#F6F7F8]/30 rounded-2xl">
                      <CardContent className="p-8">
                        {/* Step Number & Icon */}
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: `${step.color}15` }}>
                            <Icon className="h-6 w-6" style={{ color: step.color }} />
                          </div>
                          <span className={`text-xs font-medium text-black tracking-wider uppercase`}>
                            Step {index + 1}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-[#0A0908] mb-4 tracking-tight">
                          {step.title}
                        </h3>

                        <p className="text-[#0A0908]/70 mb-4 leading-relaxed text-sm">
                          {step.description}
                        </p>

                        <div className="text-xs text-[#0A0908]/50 bg-[#F6F7F8] rounded-lg p-3 border-l-3 border-[#037171]/20">
                          {step.detail}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Candidate CTA */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto">
                <button className="w-full sm:w-auto bg-[#037171] text-white px-8 py-4 rounded-full font-medium hover:bg-[#037171]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm tracking-wide">
                  Browse Jobs
                </button>
                <button className="w-full sm:w-auto border border-[#037171]/30 text-[#037171] px-8 py-4 rounded-full font-medium hover:bg-[#037171]/5 transition-all duration-300 text-sm tracking-wide">
                  View Plans
                </button>
              </div>
              <p className="text-xs text-[#0A0908]/50 mt-3">Free to browse • Premium features available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}