'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Sparkles, Handshake, TrendingUp } from 'lucide-react';

const freelancerFeatures = [
  {
    icon: Sparkles,
    title: 'Show your magic',
    description: 'Create a profile that celebrates your story, not just your skills.'
  },
  {
    icon: Handshake,
    title: 'Real connections',
    description: 'Meet people who respect your time and value your craft.'
  },
  {
    icon: TrendingUp,
    title: 'Grow with support',
    description: 'Job alerts, guidance, and a community that has your back.'
  }
];

const providerFeatures = [
  {
    icon: ShieldCheck,
    title: 'Safe and fair',
    description: 'Transparent expectations and a secure platform to collaborate.'
  },
  {
    icon: Handshake,
    title: 'Human-first hiring',
    description: 'Find partners who care, not just bidders who race to the bottom.'
  },
  {
    icon: Sparkles,
    title: 'Creative outcomes',
    description: 'Bring ideas to life with people who genuinely enjoy the work.'
  }
];

export default function FeaturesBalanced() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for people on both sides
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            For freelancers and providers—because great work happens together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6">For Freelancers</h3>
              <div className="space-y-6">
                {freelancerFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feat.title}</h4>
                        <p className="text-muted-foreground">{feat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6">For Providers</h3>
              <div className="space-y-6">
                {providerFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{feat.title}</h4>
                        <p className="text-muted-foreground">{feat.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


