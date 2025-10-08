'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import OtpVerification from '@/components/auth/OtpVerification';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Use OTP-based password reset via email
      await apiClient.forgotPasswordOtp({
        email: email,
        channel: 'email'
      });

      toast.success('Password reset OTP sent to your email!');
      setShowOtpVerification(true);
    } catch (err: any) {
      const msg = err?.message || 'Failed to send reset OTP';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = async (otpResponse: any) => {
    // Redirect to reset password page with the OTP data
    const resetData = {
      email: email,
      otp: otpResponse.otp
    };
    
    // Store reset data in sessionStorage for the reset password page
    sessionStorage.setItem('passwordResetData', JSON.stringify(resetData));
    
    toast.success('OTP verified! Please set your new password.');
    router.push('/reset-password');
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await apiClient.forgotPasswordOtp({
        email: email,
        channel: 'email'
      });

      toast.success('Password reset OTP resent to your email!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend reset OTP';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Show OTP verification if needed
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
          {/* Branding Panel */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-muted">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">Gigs Mint</span>
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Verify your identity</h2>
              <p className="text-muted-foreground mb-6">Enter the OTP sent to your email.</p>
            </div>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gigs Mint. All rights reserved.</div>
          </div>

          {/* OTP Verification Panel */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-6 md:hidden">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Gigs Mint</span>
                </Link>
              </div>
              
              <OtpVerification
                email={email}
                purpose="password-reset"
                channel="email"
                onSuccess={handleOtpSuccess}
                onBack={handleBackFromOtp}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (false) { // Keep the old success state for reference
    return (
      <div className="min-h-screen bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
          {/* Branding Panel */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-muted">
            <div>
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">Gigs Mint</span>
              </Link>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Check your email</h2>
              <p className="text-muted-foreground mb-6">We've sent you a password reset link.</p>
            </div>
            <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gigs Mint. All rights reserved.</div>
          </div>

          {/* Success Panel */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-6 md:hidden">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Gigs Mint</span>
                </Link>
              </div>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl">Email sent!</CardTitle>
                  <CardDescription>
                    We've sent a password reset link to <strong>{email}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertDescription>
                      Check your email and click the link to reset your password. The link will expire in 10 minutes.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleResendEmail} 
                      variant="outline" 
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending...' : 'Resend email'}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        setEmail('');
                        setShowOtpVerification(false);
                      }} 
                      variant="ghost" 
                      className="w-full"
                    >
                      Try different email
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Didn't receive the email? Check your spam folder.</p>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Branding Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-muted">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">Gigs Mint</span>
            </Link>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Forgot your password?</h2>
            <p className="text-muted-foreground mb-6">No worries! Enter your email and we'll send you a reset link.</p>
          </div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gigs Mint. All rights reserved.</div>
        </div>

        {/* Reset Form Panel */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 md:hidden">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">Gigs Mint</span>
              </Link>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Reset password</CardTitle>
                <CardDescription>Enter your email address and we'll send you a reset link</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="you@example.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your email address to receive a reset code
                    </p>
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending reset link...' : 'Send reset link'}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
