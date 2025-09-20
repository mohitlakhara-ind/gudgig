'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Code,
  Palette,
  Camera,
  Music,
  FileText,
  Calculator,
  Smartphone,
  Megaphone,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const categories = [
  {
    icon: Code,
    title: 'Web Development',
    description: 'Frontend, Backend, Full-Stack',
    jobs: '2,500+',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Palette,
    title: 'Design & Creative',
    description: 'Graphics, UI/UX, Branding',
    jobs: '1,800+',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Camera,
    title: 'Photography',
    description: 'Editing, Retouching, Events',
    jobs: '900+',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Music,
    title: 'Audio & Video',
    description: 'Editing, Production, Voice Over',
    jobs: '750+',
    color: 'orange',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    icon: FileText,
    title: 'Writing & Content',
    description: 'Copywriting, Blogging, SEO',
    jobs: '1,200+',
    color: 'teal',
    gradient: 'from-teal-500 to-blue-500'
  },
  {
    icon: Calculator,
    title: 'Data & Analytics',
    description: 'Analysis, Reports, Excel',
    jobs: '600+',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'iOS, Android, React Native',
    jobs: '400+',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    description: 'Social Media, Ads, SEO',
    jobs: '800+',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500'
  }
];

const colorClasses = {
  blue: 'hover:border-blue-200 hover:shadow-blue-100',
  purple: 'hover:border-purple-200 hover:shadow-purple-100',
  green: 'hover:border-green-200 hover:shadow-green-100',
  orange: 'hover:border-orange-200 hover:shadow-orange-100',
  teal: 'hover:border-teal-200 hover:shadow-teal-100',
  indigo: 'hover:border-indigo-200 hover:shadow-indigo-100',
  pink: 'hover:border-pink-200 hover:shadow-pink-100',
  yellow: 'hover:border-yellow-200 hover:shadow-yellow-100'
};

export default function ShowcaseSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Explore Categories</span>
          </div>

          <h2 className="heading-1 text-primary mb-4">
            Find Your <span className="text-gradient-primary">Perfect Gig</span>
          </h2>
          <p className="body-large text-secondary max-w-2xl mx-auto">
            Browse thousands of opportunities across multiple categories and skill levels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Card
                key={index}
                className={`group cursor-pointer transition-all duration-500 hover:-translate-y-2 ${colorClasses[category.color]} border-0 shadow-lg hover:shadow-2xl bg-white/90 backdrop-blur-sm`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <CardContent className="p-6">
                  {/* Icon Container */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                    <div className={`w-full h-full rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="heading-3 text-primary group-hover:text-brand transition-colors">
                      {category.title}
                    </h3>
                    <p className="body-small text-secondary">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="label text-muted">
                        {category.jobs} jobs
                      </span>
                      <ArrowRight className={`h-4 w-4 text-brand transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-2xl border border-blue-100">
            <div className="text-center sm:text-left">
              <h3 className="heading-3 text-primary mb-2">Can't find your category?</h3>
              <p className="body-small text-secondary">Post a custom job and let freelancers come to you</p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 glow-effect">
              Post Custom Job
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
