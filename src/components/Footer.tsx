'use client';

import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'About', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' }
  ],
  candidates: [
    { name: 'Browse MicroJobs', href: '/jobs' },
    { name: 'Pricing', href: '/pricing' }
  ],
  employers: [
    { name: 'Post MicroJobs', href: '/employer/post-job' },
    { name: 'Dashboard', href: '/employer/dashboard' },
    { name: 'Hire Talent', href: '/employer/post-job' }
  ],
  support: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Help Center', href: '/help-center' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' }
  ]
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' }
];

export default function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MJ</span>
              </div>
              <span className="text-xl font-bold">MicroJobs</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connecting talented candidates with employers looking for skilled professionals. Find your next opportunity or hire the perfect candidate.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>hello@microjobs.com</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
           <h3 className="text-lg font-semibold mb-4">Company</h3>
           <ul className="space-y-2">
             {footerLinks.company.map((link) => (
               <li key={link.name}>
                 <Link
                   href={link.href}
                   className="text-muted-foreground hover:text-foreground transition-colors"
                 >
                   {link.name}
                 </Link>
               </li>
             ))}
           </ul>
         </div>

          {/* Candidates Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Candidates</h3>
            <ul className="space-y-2">
              {footerLinks.candidates.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Employers Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Employers</h3>
            <ul className="space-y-2">
              {footerLinks.employers.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <p className="text-muted-foreground text-sm">
                © 2024 MicroJobs. All rights reserved.
              </p>
              <div className="flex space-x-4">
                {footerLinks.support.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
