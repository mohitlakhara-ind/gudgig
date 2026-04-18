import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Target,
  Zap,
  Shield,
  Heart
} from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us - Gudgig.com | Connecting Freelancers with Opportunities',
  description: 'Learn about Gudgig.com - where opportunities meet talent, one lead at a time. A simple, transparent, and affordable platform connecting clients with freelancers.',
  openGraph: {
    title: 'About Gudgig.com - Your Freelancing Success Partner',
    description: 'Discover how Gudgig.com is revolutionizing the freelancing experience with verified leads and affordable access.',
    type: 'website',
  },
};

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-8 p-4 bg-primary/10 rounded-2xl">
              <div className="w-14 h-14 dark:bg-accent-foreground rounded-lg flex items-center justify-center">
                <Image src="/logo.png" height={100} width={100} alt='gudgig logo' />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                About Gudgig
              </h1>
            </div>
            <div className="space-y-6 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl text-foreground font-medium leading-relaxed">
                Welcome to Gudgig.com — where opportunities meet talent, one lead at a time.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're building a simple, transparent, and affordable platform that connects clients looking for remote services with freelancers and professionals ready to work. Whether it's web development, graphic design, digital marketing, content writing, app development, or virtual assistance, Gudgig brings everyone under one roof.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our goal is to make the process of finding work and clients as easy as possible. No complicated bidding, no long waiting periods — just real, verified leads available instantly. Freelancers can browse leads for free and pay a minimal unlock fee to access the client's contact details.
              </p>
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/20 mt-6">
                <p className="text-base font-semibold text-foreground mb-3">How It Works:</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <span className="text-muted-foreground">Browse verified leads across multiple categories</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <span className="text-muted-foreground">Pay a minimal fee to unlock contact details instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <span className="text-muted-foreground">Connect directly with clients and grow your business</span>
                  </div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Gudgig, we believe in equal opportunities for every skill and fair access to potential clients. By keeping the cost minimal and the process transparent, we empower independent professionals to grow their careers on their own terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-2 bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-center">
                  To become the most trusted platform for freelancers and remote workers to find genuine, verified clients across industries — quickly and affordably.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-2">
              <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 py-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-center">
                  To simplify the way people connect for work by offering:
                </p>
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="p-1.5 bg-primary/20 rounded mt-0.5">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-base text-foreground">Verified, real-time client leads</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="p-1.5 bg-primary/20 rounded mt-0.5">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-base text-foreground">Affordable pay-per-lead access</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="p-1.5 bg-primary/20 rounded mt-0.5">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-base text-foreground">Equal opportunity for all freelancers</p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="p-1.5 bg-primary/20 rounded mt-0.5">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-base text-foreground">A safe and transparent experience</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Choose Gudgig</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover what makes Gudgig the preferred choice for freelancers and clients
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">No Bidding — Just Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Skip the complicated bidding process. Browse verified leads and connect directly with clients.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Verified Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">All leads are verified by our team to ensure you're connecting with real, legitimate clients.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Affordable Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">Pay a minimal unlock fee to access contact details. No subscriptions, no hidden fees.</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">Work Across Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">From web development to virtual assistance, find opportunities in your field.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
              Join the Gudgig Community
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 leading-relaxed max-w-3xl mx-auto">
              Whether you're a freelancer searching for new clients or a business looking for skilled professionals, Gudgig makes the connection simple, fast, and fair. Start browsing leads, connect directly, and grow your work — one gig at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gigs"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Leads
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/10 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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

