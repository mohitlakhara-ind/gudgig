import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Target, 
  Users, 
  Zap, 
  Shield, 
  Heart, 
  Award,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Gigs Mint | Connecting Freelancers with Opportunities',
  description: 'Learn about Gigs Mint - the clean, simple freelancing platform that connects talented freelancers with meaningful gig opportunities.',
  openGraph: {
    title: 'About Gigs Mint - Your Freelancing Success Partner',
    description: 'Discover how Gigs Mint is revolutionizing the freelancing experience with a clean, LinkedIn-inspired platform.',
    type: 'website',
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Focused Experience",
      description: "Clean, LinkedIn-inspired design that eliminates clutter and focuses on what matters - connecting talent with opportunity."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Fast & Simple",
      description: "No complex subscriptions or hidden fees. Just straightforward bidding on projects that match your skills."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Quality Focused",
      description: "Bid fees ensure serious proposals and help maintain a high-quality marketplace for both freelancers and clients."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Community Driven",
      description: "Built by freelancers, for freelancers. We understand the challenges and opportunities in the gig economy."
    }
  ];

  const features = [
    {
      title: "Clean Interface",
      description: "LinkedIn-inspired design that's professional and easy to navigate",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "No Subscriptions",
      description: "Pay only when you bid, no monthly fees or hidden costs",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "Quality Control",
      description: "Bid fees ensure serious proposals and reduce spam",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "Direct Communication",
      description: "Connect directly with project admins for clear communication",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "Skill-Based Matching",
      description: "Find projects that match your expertise and interests",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    },
    {
      title: "Transparent Process",
      description: "Clear project requirements and fair bidding process",
      icon: <CheckCircle className="h-6 w-6 text-green-500" />
    }
  ];

  const stats = [
    { label: "Active Projects", value: "500+", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Freelancers", value: "2,500+", icon: <Users className="h-5 w-5" /> },
    { label: "Success Rate", value: "95%", icon: <Award className="h-5 w-5" /> },
    { label: "Countries", value: "25+", icon: <Shield className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About Gigs Mint
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We\'re building the future of freelancing with a clean, simple platform that connects talented freelancers 
              with meaningful opportunities. No complexity, no hidden fees, just quality work.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-primary mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To create a professional, transparent freelancing platform that eliminates the complexity 
                and hidden costs found in traditional marketplaces. We believe in quality over quantity, 
                and that great work deserves a great platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">Why Choose Gigs Mint?</h2>
              <p className="text-lg text-muted-foreground">
                We've simplified freelancing to focus on what matters most
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-primary-foreground">
              Ready to Start Your Freelancing Journey?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Join thousands of freelancers who are already finding great opportunities on Gigs Mint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/gigs" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-foreground text-primary font-medium rounded-lg hover:bg-primary-foreground/90 transition-colors"
              >
                Browse Gigs
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center px-6 py-3 border border-primary-foreground text-primary-foreground font-medium rounded-lg hover:bg-primary-foreground/10 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

