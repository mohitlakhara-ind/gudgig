'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, ShieldCheck, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const token = searchParams?.get('token');
  
  // Get reset data from sessionStorage (for OTP-based reset)
  const [resetData, setResetData] = useState<any>(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for OTP-based reset data first
    const storedResetData = sessionStorage.getItem('passwordResetData');
    if (storedResetData) {
      try {
        setResetData(JSON.parse(storedResetData));
        return;
      } catch (e) {
        console.error('Failed to parse reset data:', e);
      }
    }
    
    // Fallback to token-based reset
    if (!token) {
      router.push('/forgot-password');
    }
  }, [token, router]);

  const validatePassword = (password: string) => {
    const errors: Record<string, string> = {};
    
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    if (password !== confirmPassword && confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordErrors.password) {
      validatePassword(value);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (passwordErrors.confirmPassword) {
      validatePassword(password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      if (resetData) {
        // OTP-based reset
        await apiClient.resetPasswordOtp({
          email: resetData.email,
          otp: resetData.otp,
          newPassword: password
        });
        
        // Clear the reset data
        sessionStorage.removeItem('passwordResetData');
      } else if (token) {
        // Token-based reset (fallback)
        await apiClient.resetPassword(token, password);
      } else {
        throw new Error('No reset method available');
      }
      
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      const msg = err?.message || 'Failed to reset password';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              <h2 className="text-3xl font-bold text-foreground mb-3">Password updated!</h2>
              <p className="text-muted-foreground mb-6">Your password has been successfully reset.</p>
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
                  <CardTitle className="text-2xl">Success!</CardTitle>
                  <CardDescription>
                    Your password has been successfully reset.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      You can now sign in with your new password.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={() => router.push('/login')} 
                    className="w-full"
                  >
                    Continue to login
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Your account is secure and ready to use.</p>
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
            <h2 className="text-3xl font-bold text-foreground mb-3">Set new password</h2>
            <p className="text-muted-foreground mb-6">Choose a strong password for your account.</p>
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
                <CardTitle>Set new password</CardTitle>
                <CardDescription>Enter your new password below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                      New password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Enter new password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{passwordErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        required
                        disabled={isLoading}
                        placeholder="Confirm new password"
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Updating password...' : 'Update password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading reset flow…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
