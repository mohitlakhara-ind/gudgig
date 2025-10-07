'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ShieldCheck, Users, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') || '/dashboard';
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, next, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ email, password, rememberMe } as any);
      toast.success('Signed in successfully');
      router.replace(next);
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        {/* Branding / Benefits Panel */}
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
            <h2 className="text-3xl font-bold text-foreground mb-3">Welcome back</h2>
            <p className="text-muted-foreground mb-6">Sign in to continue your journey.</p>
            <ul className="space-y-2 text-sm text-foreground/90">
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Connect with top clients</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Track bids and earnings</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Grow your portfolio</li>
            </ul>
          </div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gigs Mint. All rights reserved.</div>
        </div>

        {/* Sign-in Panel */}
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
                <CardTitle>Sign in</CardTitle>
                <CardDescription>Access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors(prev => ({ ...prev, email: '' }));
                          }
                        }} 
                        required 
                        disabled={isLoading} 
                        placeholder="you@example.com" 
                        className={`pl-10 ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors(prev => ({ ...prev, password: '' }));
                          }
                        }} 
                        required 
                        disabled={isLoading} 
                        placeholder="••••••••" 
                        className={`pl-10 pr-10 ${fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      <button type="button" className="absolute inset-y-0 right-2 flex items-center px-2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" className="size-4 rounded border-input" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                      Remember me
                    </label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                  </div>

                  {errorMessage && (
                    <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-2">
                      {errorMessage}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                      Create one here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


