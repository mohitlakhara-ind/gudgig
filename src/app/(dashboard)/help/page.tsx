'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  BookOpen, 
  Video, 
  FileText,
  ChevronRight,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Users,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  popular?: boolean;
}

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  popular?: boolean;
}

export default function HelpPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);

  // TODO: In the future, this could be fetched from a CMS or API
  // For now, keeping static data for better performance and reliability
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create a bid on a job?',
      answer: 'To create a bid, navigate to the job listing you\'re interested in and click the "Place Bid" button. Fill in your proposed price, timeline, and a detailed proposal explaining why you\'re the best fit for the project.',
      category: 'Bidding',
      popular: true
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.',
      category: 'Payments',
      popular: true
    },
    {
      id: '3',
      question: 'How do I withdraw my earnings?',
      answer: 'You can withdraw your earnings by going to the Payments section in your dashboard. Click "Withdraw" and choose your preferred payment method. Withdrawals typically take 1-3 business days.',
      category: 'Payments'
    },
    {
      id: '4',
      question: 'Can I edit my bid after submitting it?',
      answer: 'Yes, you can edit your bid within 24 hours of submission, as long as the client hasn\'t started reviewing bids yet. After that, you\'ll need to contact support.',
      category: 'Bidding'
    },
    {
      id: '5',
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile to update your personal information, skills, portfolio, and other profile details. Make sure to keep your profile up to date for better job matches.',
      category: 'Profile'
    },
    {
      id: '6',
      question: 'What if I have a dispute with a client?',
      answer: 'We have a dispute resolution process. Contact our support team immediately, and we\'ll work with both parties to find a fair solution. We review all disputes case by case.',
      category: 'Disputes'
    }
  ];

  // TODO: In the future, this could be fetched from a CMS or API
  // For now, keeping static data for better performance and reliability
  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      description: 'Complete guide to setting up your profile and finding your first job on Gudgig.',
      category: 'Getting Started',
      readTime: '5 min read',
      popular: true
    },
    {
      id: '2',
      title: 'How to Write Winning Proposals',
      description: 'Learn the secrets to writing proposals that get you hired more often.',
      category: 'Tips & Tricks',
      readTime: '8 min read',
      popular: true
    },
    {
      id: '3',
      title: 'Pricing Your Services',
      description: 'A comprehensive guide to pricing your freelance services competitively.',
      category: 'Business',
      readTime: '6 min read'
    },
    {
      id: '4',
      title: 'Building Your Portfolio',
      description: 'Tips for creating a portfolio that showcases your best work and attracts clients.',
      category: 'Profile',
      readTime: '4 min read'
    },
    {
      id: '5',
      title: 'Communication Best Practices',
      description: 'How to communicate effectively with clients and maintain professional relationships.',
      category: 'Communication',
      readTime: '7 min read'
    },
    {
      id: '6',
      title: 'Tax Guide for Freelancers',
      description: 'Everything you need to know about taxes as a freelancer.',
      category: 'Business',
      readTime: '10 min read'
    }
  ];

  const categories = [
    { name: 'All', count: faqs.length + articles.length },
    { name: 'Getting Started', count: 3 },
    { name: 'Bidding', count: 2 },
    { name: 'Payments', count: 2 },
    { name: 'Profile', count: 2 },
    { name: 'Business', count: 2 },
    { name: 'Communication', count: 1 },
    { name: 'Disputes', count: 1 }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.submitSupportTicket({
        subject: contactForm.subject,
        message: contactForm.message,
        priority: contactForm.priority,
      });

      if (response.success) {
        toast.success('Your message has been sent! We\'ll get back to you within 24 hours.');
        setContactForm({ subject: '', message: '', priority: 'medium' });
      } else {
        toast.error(response.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to your questions, learn best practices, and get the support you need to succeed on Gudgig.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Get instant help from our support team</p>
            <Button size="sm" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Send us a detailed message</p>
            <Button size="sm" variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>


      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="mt-6">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category.name} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>

            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse our help articles.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFAQs.map((faq) => (
                  <Card key={faq.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{faq.question}</h3>
                            {faq.popular && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{faq.answer}</p>
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                      {article.popular && (
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse our FAQ section.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low - General question</option>
                      <option value="medium">Medium - Need help with feature</option>
                      <option value="high">High - Account or payment issue</option>
                      <option value="urgent">Urgent - Site not working</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      placeholder="Please provide as much detail as possible about your issue..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Other ways to reach us:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">info@gudgig.com</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Mon-Fri 9AM-6PM EST</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Community & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Join our community of freelancers and get tips, share experiences, and network with other professionals.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Join Discord
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Facebook Group
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Watch step-by-step video tutorials to learn how to use Gudgig effectively.
            </p>
            <Button size="sm" variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Watch Tutorials
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
