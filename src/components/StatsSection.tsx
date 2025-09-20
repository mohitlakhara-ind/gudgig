'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, TrendingUp, Star, Award, Globe } from 'lucide-react';

type StatColor = 'blue' | 'teal' | 'purple' | 'orange' | 'green' | 'red';

const stats: Array<{
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: StatColor;
  description: string;
}> = [
  {
    icon: Users,
    value: 10000,
    suffix: '+',
    label: 'Active Users',
    color: 'blue',
    description: 'Growing community'
  },
  {
    icon: Briefcase,
    value: 5000,
    suffix: '+',
    label: 'Jobs Posted',
    color: 'teal',
    description: 'Quality opportunities'
  },
  {
    icon: TrendingUp,
    value: 95,
    suffix: '%',
    label: 'Success Rate',
    color: 'purple',
    description: 'High completion rate'
  },
  {
    icon: Star,
    value: 4.9,
    suffix: '/5',
    label: 'User Rating',
    color: 'orange',
    description: 'Excellent reviews'
  },
  {
    icon: Award,
    value: 50,
    suffix: '+',
    label: 'Categories',
    color: 'green',
    description: 'Diverse skills'
  },
  {
    icon: Globe,
    value: 120,
    suffix: '+',
    label: 'Countries',
    color: 'red',
    description: 'Global reach'
  }
];

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100',
  teal: 'text-teal-600 bg-teal-100',
  purple: 'text-purple-600 bg-purple-100',
  orange: 'text-orange-600 bg-orange-100',
  green: 'text-green-600 bg-green-100',
  red: 'text-red-600 bg-red-100'
};

export default function StatsSection() {
  const [counters, setCounters] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      const increment = stat.value / 50; // 50 steps
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timers[index]);
        }

        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, 50);
    });

    return () => timers.forEach(clearInterval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-float-gentle"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-teal-500 rounded-full animate-float-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-500 rounded-full animate-float-gentle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="heading-1 text-primary mb-4">
            Trusted by <span className="text-gradient-primary">Thousands</span>
          </h2>
          <p className="body-large text-secondary max-w-2xl mx-auto">
            Join our growing community of freelancers and employers making success happen
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const displayValue = stat.suffix === '/5' && counters[index] === stat.value
              ? stat.value
              : counters[index];

            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 ${colorClasses[stat.color]} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 animate-counter-up`}>
                  <Icon className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {typeof displayValue === 'number' && displayValue >= 1000
                      ? `${(displayValue / 1000).toFixed(1)}K`
                      : displayValue
                    }
                    <span className="text-brand">{stat.suffix}</span>
                  </div>
                  <div className="heading-3 text-primary">{stat.label}</div>
                  <div className="body-small text-muted">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="body-small text-secondary font-medium">Join 10,000+ successful freelancers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
