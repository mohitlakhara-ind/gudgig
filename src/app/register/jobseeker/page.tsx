'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function JobSeekerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    currentPosition: '',
    experience: '',
    skills: ''
  });

  const benefits = [
    "Access to thousands of microjobs and gigs",
    "Personalized gig recommendations",
    "Profile and proposal optimization tips",
    "Interview and client communication resources",
    "Freelance career guidance",
    "Professional networking opportunities"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'jobseeker'
      });

      // After successful registration, log in the user
      await login({ email: formData.email, password: formData.password });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Start Your Career Journey
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Join thousands of successful job seekers who found their dream careers through our platform.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Already have an account?
                </h3>
                <p className="text-blue-700 mb-4">
                  Sign in to access your personalized job recommendations and saved searches.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent">
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:pl-8">
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Create Freelancer Account</CardTitle>
                  <CardDescription>
                    Find gigs and short-term projects that match your skills
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="Enter your email"
                              className="pl-10"
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="Enter your phone number"
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              placeholder="City, State/Country"
                              className="pl-10"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Account Security */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Account Security
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              required
                              disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Must be at least 8 characters long
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="terms" className="mt-1" required />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Job Seeker Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Looking to hire talent instead?{' '}
                      <Link href="/register/employer" className="text-blue-600 hover:underline font-medium">
                        Create Employer Account
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
