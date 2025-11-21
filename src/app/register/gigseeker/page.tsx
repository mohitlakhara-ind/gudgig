'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import CustomLoader from '@/components/CustomLoader';
import toast from 'react-hot-toast';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import OtpInput from '@/components/ui/otp-input';

function FreelancerRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '';
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const { expiresIn, cooldown, canResend, start, resetCooldown, format } = useOtpTimer(600, 60);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    currentPosition: '',
    experience: '',
    skills: ''
  });

  const benefits = [
    "Browse curated gigs across 7+ categories",
    "Simple pay-per-bid system (starting ₹1)",
    "Direct communication with clients via admin",
    "Clean, LinkedIn-inspired user experience",
    "No subscription fees or hidden costs",
    "Professional portfolio showcase"
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
        role: 'freelancer'
      });
      await apiClient.sendOtp({ email: formData.email, channel: 'email', purpose: 'signup' });
      toast.success('OTP sent to your email');
      setIsOtpStep(true);
      start();
      // Clear form after successful registration
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        currentPosition: '',
        experience: '',
        skills: ''
      });
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Registration failed';
      setError(msg);
      toast.error(msg);
      // Clear form fields even on failure
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        currentPosition: '',
        experience: '',
        skills: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await apiClient.verifyOtp({ email: formData.email, otp, purpose: 'signup' });
      if (res?.token && res?.refreshToken && res?.user) {
        setSession(res.token, res.refreshToken, res.user);
      }
      toast.success('Email verified and account created');
      const destination = next && next.startsWith('/') ? next : '/dashboard';
      router.push(destination);
      // Clear OTP field after successful verification
      setOtp('');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Invalid or expired OTP';
      setError(msg);
      toast.error(msg);
      // Clear OTP field even on failure
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await apiClient.resendOtp({ email: formData.email, channel: 'email', purpose: 'signup' });
      toast.success('Code resent');
      resetCooldown();
      // Clear OTP field after resending
      setOtp('');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to resend code';
      toast.error(msg);
      // Clear OTP field even on failure
      setOtp('');
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
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Start Your Freelancing Journey
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Join Gigs Mint and start bidding on amazing freelancing opportunities today.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
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
                  <Button variant="outline" className="border-blue-600 text-primary hover:bg-blue-600 hover:text-white bg-transparent">
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Registration / OTP Verification */}
            <div className="lg:pl-8">
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{isOtpStep ? 'Verify Your Email' : 'Create Freelancer Account'}</CardTitle>
                  <CardDescription>
                    {isOtpStep ? 'Enter the 6-digit code sent to your email to complete signup' : 'Find gigs and short-term projects that match your skills'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  {!isOtpStep ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
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
                          <label className="block text-sm font-medium text-foreground mb-1">
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
                          <label className="block text-sm font-medium text-foreground mb-1">
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
                          <label className="block text-sm font-medium text-foreground mb-1">
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
                      <h4 className="font-semibold text-foreground flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Account Security
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">
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
                            <p className="text-xs text-muted-foreground mt-1">
                              Must be at least 8 characters long
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="terms" className="mt-1" required />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy-policy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CustomLoader size={16} color="#1FA9FF" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Freelancer Account
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                  ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Enter OTP</label>
                      <OtpInput
                        value={otp}
                        onChange={setOtp}
                        length={6}
                        disabled={isLoading}
                        className="justify-center mb-3"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <button type="button" className="text-xs text-primary disabled:text-gray-400" disabled={!canResend} onClick={handleResend}>Resend code{cooldown > 0 ? ` (${cooldown}s)` : ''}</button>
                        <div className="text-xs text-muted-foreground">Expires in {format(expiresIn)}</div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CustomLoader size={16} color="#1FA9FF" />
                          Verifying...
                        </>
                      ) : (
                        <>Verify and Complete Signup</>
                      )}
                    </Button>
                  </form>
                  )}
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

export default function FreelancerRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading registration…</div>}>
      <FreelancerRegisterContent />
    </Suspense>
  );
}
