'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Star, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
  const router = useRouter();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  // Intersection Observer for animations with scroll direction detection
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollDirection = 'down';

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY;
      scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      lastScrollY = currentScrollY;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Only hide when scrolling down and element is out of view
          if (scrollDirection === 'down') {
            setIsVisible(false);
          }
          // Keep visible when scrolling up to prevent flickering
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const element = document.getElementById('home');
    if (element) observer.observe(element);

    const handleScroll = () => {
      updateScrollDirection();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 min-h-screen flex items-center"
    >
     

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-0 lg:py-0 relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Badge */}
            <div className={`inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span>Where independent talent finds community</span>
            </div>

            <div className="space-y-6">
              <h1 className={`text-fluid-xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                Find meaningful micro jobs.
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Connect with people who truly value your skills.
                </span>
              </h1>
              <p className={`text-fluid-base sm:text-xl text-muted-foreground leading-relaxed max-w-lg transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                You belong here. Start with free browsing, upgrade anytime when you’re ready.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Button
                size="lg"
                className="text-fluid-base px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group touch-target"
                onClick={() => {
                  setLoadingBrowse(true);
                  router.push('/jobs');
                  setTimeout(() => setLoadingBrowse(false), 1000); // Simulate loading
                }}
                disabled={loadingBrowse}
              >
                <span className="flex items-center">
                  {loadingBrowse ? 'Loading...' : 'Browse MicroJobs'}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-fluid-base px-6 sm:px-8 py-3 sm:py-4 border-2 hover:bg-muted transition-all duration-300 transform hover:-translate-y-1 touch-target"
                onClick={() => {
                  setLoadingPost(true);
                  if (user && user.role === 'employer') {
                    router.push('/employer/post-job');
                  } else {
                    router.push('/register/employer');
                  }
                  setTimeout(() => setLoadingPost(false), 1000);
                }}
                disabled={loadingPost}
              >
                {loadingPost ? 'Loading...' : 'Post a MicroJob'}
              </Button>
            </div>

            {/* Enhanced Stats */}
            <div className={`grid grid-cols-2 sm:flex sm:items-center sm:space-x-8 gap-4 sm:gap-0 pt-8 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="p-2 bg-accent rounded-lg group-hover:bg-accent/80 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="p-2 bg-success/20 rounded-lg group-hover:bg-success/30 transition-all duration-300 group-hover:scale-110">
                  <Briefcase className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">5K+</div>
                  <div className="text-sm text-muted-foreground">MicroJobs Posted</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 group cursor-pointer sm:block hidden">
                <div className="p-2 bg-warning/20 rounded-lg group-hover:bg-warning/30 transition-all duration-300 group-hover:scale-110">
                  <TrendingUp className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

              {/* Right Content - Enhanced marquee (reduced density for focus) */}
          <div className="relative h-64 sm:h-96 lg:h-[100vh] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-background/60 pointer-events-none z-10"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 h-full">
              {/* Col 1 - Up to Down */}
              <div className="relative overflow-hidden marquee">
                <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-down marquee-track marquee-slow motion-reduce:animate-none">
                  {jobs.slice(0, 3).map((job, i) => (
                    <JobCard
                      key={`col1-${i}`}
                      job={job}
                      isHovered={hoveredCard === i}
                      onHover={() => setHoveredCard(i)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(0, 3).map((job, i) => (
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
              <div className="relative overflow-hidden hidden md:block marquee">
                <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-up marquee-track marquee-medium motion-reduce:animate-none">
                  {jobs.slice(2, 5).map((job, i) => (
                    <JobCard
                      key={`col2-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 8}
                      onHover={() => setHoveredCard(i + 8)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(2, 5).map((job, i) => (
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
              <div className="relative overflow-hidden hidden sm:block marquee">
                <div className="flex flex-col gap-4 animate-marquee-down marquee-track marquee-fast animate-delay-1000 motion-reduce:animate-none">
                  {jobs.slice(4, 7).map((job, i) => (
                    <JobCard
                      key={`col3-${i}`}
                      job={job}
                      isHovered={hoveredCard === i + 16}
                      onHover={() => setHoveredCard(i + 16)}
                      onLeave={() => setHoveredCard(null)}
                    />
                  ))}
                  {jobs.slice(4, 7).map((job, i) => (
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

        .animate-marquee-up { animation: marquee-up 28s linear infinite; }
        .animate-marquee-down { animation: marquee-down 28s linear infinite; }
        .marquee-track { will-change: transform; }
        .marquee-slow { animation-duration: 36s; }
        .marquee-medium { animation-duration: 28s; }
        .marquee-fast { animation-duration: 22s; }
        .marquee:hover .marquee-track { animation-play-state: paused; }
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
    'Remote': 'bg-success/20 text-success border-success/30',
    'Part-Time': 'bg-primary/20 text-primary border-primary/30',
    'Full-Time': 'bg-secondary/20 text-secondary border-secondary/30',
    'Freelance': 'bg-warning/20 text-warning border-warning/30',
    'Contract': 'bg-accent/20 text-accent-foreground border-accent/30'
  };

  return (
    <div
      className={`p-3 sm:p-4 bg-card/80 backdrop-blur-sm shadow-lg rounded-xl border border-border w-full max-w-[280px] mx-auto transition-all duration-300 group hover:shadow-xl transform ${
        isHovered ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-card-foreground text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">{job.company}</p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${typeColors[job.type as keyof typeof typeColors] || 'bg-muted text-muted-foreground border-border'}`}>
            {job.type}
          </span>
        </div>
        <div className="text-xs sm:text-sm font-semibold text-success">
          {job.salary}
        </div>
      </div>
    </div>
  );
}
