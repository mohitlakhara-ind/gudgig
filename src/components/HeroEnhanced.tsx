'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const jobs = [
  { title: 'Logo Design for Startup', company: 'DesignHub', type: 'Freelance', salary: '$30-50/hr' },
  { title: 'Landing Page Copywriting', company: 'WordFlow', type: 'Contract', salary: '$20-35/hr' },
  { title: 'Data Entry (Excel Sheets)', company: 'DataFlow', type: 'Remote', salary: '$12-20/hr' },
  { title: 'Social Media Caption Writing', company: 'SocialPro', type: 'Part-Time', salary: '$15-25/hr' },
  { title: 'Figma to HTML Conversion', company: 'TechSoft', type: 'Remote', salary: '$25-40/hr' },
  { title: 'Blog Post Research', company: 'Contently', type: 'Freelance', salary: '$18-28/hr' },
  { title: 'Create Instagram Reels', company: 'Growthly', type: 'Contract', salary: '$20-30/hr' },
  { title: 'Podcast Audio Editing', company: 'Soundify', type: 'Remote', salary: '$25-35/hr' },
  { title: 'Virtual Assistant Tasks', company: 'Assistly', type: 'Part-Time', salary: '$15-22/hr' },
  { title: 'SEO Keyword Research', company: 'RankBoost', type: 'Freelance', salary: '$18-30/hr' },
  { title: 'Translate Article (EN → Hindi)', company: 'LinguaWorks', type: 'Contract', salary: '$20-35/hr' },
  { title: 'Canva Post Design', company: 'CreativeBee', type: 'Freelance', salary: '$12-20/hr' },
  { title: 'PowerPoint Presentation Design', company: 'SlideCraft', type: 'Remote', salary: '$18-28/hr' },
  { title: 'Transcribe YouTube Videos', company: 'VidTrans', type: 'Contract', salary: '$15-22/hr' },
  { title: 'Product Photo Background Removal', company: 'ShopFix', type: 'Freelance', salary: '$12-18/hr' },
  { title: 'Customer Support Chat Handling', company: 'HelpDeskly', type: 'Remote', salary: '$15-25/hr' },
  { title: 'Email Newsletter Setup', company: 'MailFlow', type: 'Freelance', salary: '$20-30/hr' },
  { title: 'Pinterest Pin Design', company: 'PinBoost', type: 'Contract', salary: '$12-20/hr' },
  { title: 'Spreadsheet Cleanup & Formatting', company: 'DataFix', type: 'Remote', salary: '$15-25/hr' },
  { title: 'Video Subtitles & Captions', company: 'Captionly', type: 'Freelance', salary: '$18-28/hr' },
  { title: 'Simple WordPress Fixes', company: 'WebQuick', type: 'Remote', salary: '$20-35/hr' },
  { title: 'Online Survey Participation', company: 'SurveyHub', type: 'Contract', salary: '$10-15/hr' },
  { title: 'Etsy Shop Banner Design', company: 'Craftify', type: 'Freelance', salary: '$15-25/hr' },
  { title: 'Proofreading Short Articles', company: 'EditEase', type: 'Contract', salary: '$18-28/hr' },
];

export default function HeroEnhanced() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('home');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50 min-h-screen flex items-center"
    >
     

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-0 lg:py-0 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Badge */}
            <div className={`inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Star className="h-4 w-4" />
              <span>#1 Platform for Micro Jobs</span>
            </div>

            <div className="space-y-6">
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                Find Micro Jobs That Fit{' '}
                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Your Skills
                </span>
              </h1>
              <p className={`text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                Browse thousands of small gigs and projects. Subscribe to unlock
                full details & start applying today.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <span className="flex items-center">
                  Browse Jobs
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-2 hover:bg-gray-50 transition-all duration-300 transform hover:-translate-y-1"
              >
                Post a Job
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className={`grid grid-cols-2 sm:flex sm:items-center sm:space-x-8 gap-4 sm:gap-0 pt-8 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-all duration-300 group-hover:scale-110">
                  <Briefcase className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">5K+</div>
                  <div className="text-sm text-gray-600">Jobs Posted</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer sm:block hidden">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced 3 Col Parallel Marquee */}
          <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent  to-white/50 pointer-events-none z-10"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 h-full">
              {/* Col 1 - Up to Down */}
              <div className="relative overflow-hidden">
                <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-down">
                  {jobs.slice(0, 4).map((job, i) => (
                    <JobCard
                      key={`col1-${i}`}
                      job={job}
                      isHovered={hoveredCard === i}
                      onHover={() => setHoveredCard(i)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(0, 4).map((job, i) => (
                    <JobCard
                      key={`col1-dup-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 4}
                      onHover={() => setHoveredCard(i + 4)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                </div>
              </div>

              {/* Col 2 - Down to Up */}
              <div className="relative overflow-hidden">
                <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-up">
                  {jobs.slice(2, 6).map((job, i) => (
                    <JobCard
                      key={`col2-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 8}
                      onHover={() => setHoveredCard(i + 8)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(2, 6).map((job, i) => (
                    <JobCard
                      key={`col2-dup-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 12}
                      onHover={() => setHoveredCard(i + 12)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                </div>
              </div>

              {/* Col 3 - Up to Down (Hidden on mobile) */}
              <div className="relative overflow-hidden hidden sm:block">
                <div className="flex flex-col gap-4 animate-marquee-down animate-delay-1000">
                  {jobs.slice(4, 8).map((job, i) => (
                    <JobCard
                      key={`col3-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 16}
                      onHover={() => setHoveredCard(i + 16)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(4, 8).map((job, i) => (
                    <JobCard
                      key={`col3-dup-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 20}
                      onHover={() => setHoveredCard(i + 20)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes marquee-up {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-marquee-up {
          animation: marquee-up 15s linear infinite;
        }
        .animate-marquee-down {
          animation: marquee-down 15s linear infinite;
        }
        .animate-delay-1000 {
          animation-delay: 1s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-slide-up-delayed {
          animation: slide-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-slide-up-more-delayed {
          animation: slide-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}

function JobCard({
  job,
  isHovered,
  onHover,
  onLeave
}: {
  job: { title: string; company: string; type: string; salary: string };
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const typeColors = {
    'Remote': 'bg-green-50 text-green-700 border-green-200',
    'Part-Time': 'bg-blue-50 text-blue-700 border-blue-200',
    'Full-Time': 'bg-purple-50 text-purple-700 border-purple-200',
    'Freelance': 'bg-orange-50 text-orange-700 border-orange-200',
    'Contract': 'bg-teal-50 text-teal-700 border-teal-200'
  };

  return (
    <div
      className={`p-3 sm:p-4 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 w-full max-w-[280px] mx-auto transition-all duration-300 group hover:shadow-xl transform ${
        isHovered ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 font-medium">{job.company}</p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${typeColors[job.type as keyof typeof typeColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            {job.type}
          </span>
        </div>
        <div className="text-xs sm:text-sm font-semibold text-green-600">
          {job.salary}
        </div>
      </div>
    </div>
  );
}
