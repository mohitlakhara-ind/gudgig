'use client';

import { Star, Quote, TrendingUp, Users, Award } from 'lucide-react';

const testimonials = [
  { name: 'Sarah M.', role: 'Designer', text: 'Landed 3 clients this month!', rating: 5, earnings: '$2,400' },
  { name: 'Alex K.', role: 'Developer', text: 'Best platform for side gigs', rating: 5, earnings: '$3,200' },
  { name: 'Emma L.', role: 'Writer', text: 'Found my dream clients here', rating: 5, earnings: '$1,800' },
  { name: 'David R.', role: 'Marketer', text: 'Consistent work every week', rating: 5, earnings: '$2,900' },
  { name: 'Lisa C.', role: 'VA', text: 'Flexible hours, great pay', rating: 5, earnings: '$1,600' },
  { name: 'Mike T.', role: 'Consultant', text: 'Professional clients only', rating: 5, earnings: '$4,100' },
  { name: 'Anna P.', role: 'Photographer', text: 'Creative freedom + income', rating: 5, earnings: '$2,200' },
  { name: 'John D.', role: 'Analyst', text: 'Perfect for data projects', rating: 5, earnings: '$3,500' }
];

const stats = [
  { icon: Users, value: '50K+', label: 'Happy Freelancers' },
  { icon: TrendingUp, value: '$2M+', label: 'Paid Out' },
  { icon: Award, value: '98%', label: 'Success Rate' }
];

export default function SocialProofTicker() {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 via-white to-teal-50 border-y border-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Testimonials Ticker */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee-horizontal">
            {/* First set of testimonials */}
            {testimonials.map((testimonial, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 w-80 mx-4">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <Quote className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-gray-700 text-sm mb-3 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{testimonial.earnings}</p>
                      <p className="text-xs text-gray-500">earned</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {testimonials.map((testimonial, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 w-80 mx-4">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <Quote className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-gray-700 text-sm mb-3 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{testimonial.earnings}</p>
                      <p className="text-xs text-gray-500">earned</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 mb-4">Join thousands of successful freelancers</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-4">+10,000 more success stories</span>
          </div>
        </div>
      </div>
    </section>
  );
}
