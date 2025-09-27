'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Eye, EyeOff, Loader2, Smartphone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/lib/api';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, setSession } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otpMode, setOtpMode] = useState<'email' | 'phone' | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!otpMode) {
        const res = await login(formData);
        router.push(res?.user?.role === 'employer' ? '/employer/dashboard' : '/dashboard');
      } else if (otpMode === 'phone') {
        if (!otpSent) {
          await apiClient.request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) });
          setOtpSent(true);
        } else {
          const res = await apiClient.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code: otpCode }) });
          if (res?.token && res?.refreshToken && res?.user) {
            setSession(res.token, res.refreshToken, res.user);
          }
          router.push('/dashboard');
        }
      } else if (otpMode === 'email') {
        const email = formData.email;
        if (!otpSent) {
          await apiClient.request('/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
          setOtpSent(true);
        } else {
          const res = await apiClient.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, code: otpCode }) });
          if (res?.token && res?.refreshToken && res?.user) {
            setSession(res.token, res.refreshToken, res.user);
          }
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {!otpMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter your email" required disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Enter your password" required disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {otpMode === 'phone' && (
              <>
                {!otpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone number</label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +11234567890" disabled={isLoading} required />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <Input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" disabled={isLoading} required />
                    <button type="button" className="text-xs text-blue-600 mt-1" onClick={async () => { await apiClient.request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ phone }) }); }}>Resend code</button>
                  </div>
                )}
              </>
            )}

            {otpMode === 'email' && (
              <>
                {!otpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter your email" disabled={isLoading} required />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <Input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" disabled={isLoading} required />
                    <button type="button" className="text-xs text-blue-600 mt-1" onClick={async () => { await apiClient.request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email: formData.email }) }); }}>Resend code</button>
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {otpMode ? (otpSent ? 'Verifying...' : 'Sending code...') : 'Signing in...'}
                </>
              ) : (
                otpMode ? (otpSent ? 'Verify Code' : 'Send Code') : 'Sign In'
              )}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <button type="button" className="text-sm text-gray-700 hover:text-blue-600 inline-flex items-center gap-1" onClick={() => { setOtpMode('phone'); setOtpSent(false); setError(''); }}>
                <Smartphone className="h-4 w-4" /> Login with OTP (Phone)
              </button>
              <span className="text-gray-300">|</span>
              <button type="button" className="text-sm text-gray-700 hover:text-blue-600 inline-flex items-center gap-1" onClick={() => { setOtpMode('email'); setOtpSent(false); setError(''); }}>
                <Mail className="h-4 w-4" /> Login with OTP (Email)
              </button>
              {otpMode && (
                <>
                  <span className="text-gray-300">|</span>
                  <button type="button" className="text-sm text-gray-700 hover:text-blue-600" onClick={() => { setOtpMode(null); setOtpSent(false); setError(''); }}>Use password</button>
                </>
              )}
            </div>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register/jobseeker" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up as Freelancer
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Or{' '}
              <Link href="/register/employer" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up as Client
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}