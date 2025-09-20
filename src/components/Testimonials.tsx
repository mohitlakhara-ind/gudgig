'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Freelance Designer',
    avatar: '/api/placeholder/40/40',
    content: 'Easy to post and manage jobs, saved me hours! The subscription system is straightforward and the candidate quality is excellent.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Software Developer',
    avatar: '/api/placeholder/40/40',
    content: 'Found my last 3 gigs through this platform. The job alerts and WhatsApp notifications keep me updated instantly.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Manager',
    avatar: '/api/placeholder/40/40',
    content: 'As an employer, I love the dashboard and how easy it is to manage multiple job postings. Highly recommend!',
    rating: 5
  },
  {
    name: 'David Kim',
    role: 'Content Writer',
    avatar: '/api/placeholder/40/40',
    content: 'The platform is intuitive and the support team is amazing. Got my first job within a week of subscribing.',
    rating: 5
  },
  {
    name: 'Lisa Thompson',
    role: 'Product Manager',
    avatar: '/api/placeholder/40/40',
    content: 'The user interface is clean and modern. Finding qualified candidates has never been easier.',
    rating: 5
  },
  {
    name: 'James Wilson',
    role: 'UX Designer',
    avatar: '/api/placeholder/40/40',
    content: 'Excellent platform that connects talent with opportunity seamlessly. Professional and reliable.',
    rating: 5
  }
];

export default function ProfessionalTestimonials() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#F6F7F8' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            style={{ color: '#0A0908' }}
          >
            What Our Users Say
          </h2>
          <p 
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: '#037171' }}
          >
            Join thousands of satisfied candidates and employers who have found success through our platform
          </p>
          <div 
            className="mt-8 w-16 h-1 mx-auto rounded-full"
            style={{ backgroundColor: '#1FA9FF' }}
          ></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 border-0 group"
              style={{ 
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 6px -1px rgba(10, 9, 8, 0.1), 0 2px 4px -1px rgba(10, 9, 8, 0.06)'
              }}
            >
              <CardContent className="p-8">
                {/* User Info */}
                <div className="flex items-center mb-6">
                  <Avatar className="h-16 w-16 mr-4 border-2" style={{ borderColor: '#C9F6FF' }}>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback 
                      className="text-white font-semibold text-lg"
                      style={{ backgroundColor: '#037171' }}
                    >
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 
                      className="font-semibold text-lg mb-1"
                      style={{ color: '#0A0908' }}
                    >
                      {testimonial.name}
                    </h4>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: '#037171' }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5 fill-current mr-1" 
                      style={{ color: '#1FA9FF' }}
                    />
                  ))}
                </div>

                {/* Testimonial Content */}
                <div className="relative">
                  <div 
                    className="absolute -top-2 -left-2 text-6xl font-serif opacity-20"
                    style={{ color: '#C9F6FF' }}
                  >
                    "
                  </div>
                  <p 
                    className="text-base leading-relaxed relative z-10"
                    style={{ color: '#0A0908' }}
                  >
                    {testimonial.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 text-center">
          <div 
            className="inline-flex items-center justify-center space-x-12 px-12 py-8 rounded-2xl border"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderColor: '#C9F6FF',
              boxShadow: '0 10px 15px -3px rgba(10, 9, 8, 0.1)'
            }}
          >
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: '#1FA9FF' }}
              >
                1,000+
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#037171' }}
              >
                Happy Users
              </div>
            </div>
            
            <div className="w-px h-12" style={{ backgroundColor: '#C9F6FF' }}></div>
            
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: '#1FA9FF' }}
              >
                4.9/5
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#037171' }}
              >
                Average Rating
              </div>
            </div>
            
            <div className="w-px h-12" style={{ backgroundColor: '#C9F6FF' }}></div>
            
            <div className="text-center">
              <div 
                className="text-3xl font-bold mb-1"
                style={{ color: '#1FA9FF' }}
              >
                24/7
              </div>
              <div 
                className="text-sm font-medium"
                style={{ color: '#037171' }}
              >
                Support Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}