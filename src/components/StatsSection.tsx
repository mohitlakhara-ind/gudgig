'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, TrendingUp, Star, Award, Globe } from 'lucide-react';
import { apiClient } from '@/lib/api';

type StatColor = 'primary' | 'secondary' | 'accent' | 'warning' | 'success' | 'error';

interface StatData {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  color: StatColor;
  description: string;
}

const colorClasses = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  accent: 'text-accent bg-accent/10',
  warning: 'text-warning bg-warning/10',
  success: 'text-success bg-success/10',
  error: 'text-destructive bg-destructive/10'
};

export default function StatsSection() {
  const [stats, setStats] = useState<StatData[]>([]);
  const [counters, setCounters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // TODO: Replace with real API call when stats API is implemented
        // const response = await apiClient.getPublicStats();
        // const apiStats = response.data;
        
        // For now, use default stats structure with real API data when available
        const defaultStats: StatData[] = [
          {
            icon: Users,
            value: 0, // Will be updated from API
            suffix: '+',
            label: 'Active Users',
            color: 'primary',
            description: 'Growing community'
          },
          {
            icon: Briefcase,
            value: 0, // Will be updated from API
            suffix: '+',
            label: 'Jobs Posted',
            color: 'secondary',
            description: 'Quality opportunities'
          },
          {
            icon: TrendingUp,
            value: 0, // Will be updated from API
            suffix: '%',
            label: 'Success Rate',
            color: 'accent',
            description: 'High completion rate'
          },
          {
            icon: Star,
            value: 0, // Will be updated from API
            suffix: '/5',
            label: 'User Rating',
            color: 'warning',
            description: 'Excellent reviews'
          },
          {
            icon: Award,
            value: 0, // Will be updated from API
            suffix: '+',
            label: 'Categories',
            color: 'success',
            description: 'Diverse skills'
          },
          {
            icon: Globe,
            value: 0, // Will be updated from API
            suffix: '+',
            label: 'Countries',
            color: 'error',
            description: 'Global reach'
          }
        ];
        
        setStats(defaultStats);
        setCounters(defaultStats.map(() => 0));
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to empty stats
        setStats([]);
        setCounters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (stats.length === 0) return;

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
  }, [stats]);

  return (
    <section className="py-20 md:py-28 bg-surface-gradient relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-accent rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-secondary rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border text-xs uppercase tracking-wider text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Platform impact
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Trusted by <span className="text-primary">Thousands</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our growing community of freelancers and employers making success happen
          </p>
          <div className="mt-8 h-px w-24 mx-auto bg-divider-gradient" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-center group bg-card border border-border rounded-2xl px-4 py-6 md:px-5 md:py-7 shadow-sm animate-pulse">
                <div className="w-14 h-14 bg-muted rounded-xl mx-auto mb-4"></div>
                <div className="space-y-1.5">
                  <div className="h-8 bg-muted rounded w-16 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-20 mx-auto"></div>
                  <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const displayValue = stat.suffix === '/5' && counters[index] === stat.value
                ? stat.value
                : counters[index];

              return (
                <div key={index} className="text-center group bg-card border border-border rounded-2xl px-4 py-6 md:px-5 md:py-7 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-14 h-14 ${colorClasses[stat.color]} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-7 w-7" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground leading-none">
                      {typeof displayValue === 'number' && displayValue >= 1000
                        ? `${(displayValue / 1000).toFixed(1)}K`
                        : displayValue
                      }
                      <span className="ml-0.5 text-primary">{stat.suffix}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-border">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="body-small text-muted-foreground font-medium">Join 10,000+ successful freelancers</span>
          </div>
        </div>
      </div>
    </section>
  );
}
