'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import OtpVerification from '@/components/auth/OtpVerification';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: 'US',
    userType: 'freelancer',
    skills: [] as string[],
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // First, register the user
      const response = await apiClient.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.userType as 'freelancer' | 'admin',
        phone: formData.phone,
        countryCode: formData.countryCode
      });

      if (response.success) {
        // Send OTP for verification via email
        await apiClient.sendOtp({
          email: formData.email,
          channel: 'email',
          purpose: 'signup'
        });

        toast.success('Registration successful! Please verify your account with the OTP sent to your email.');
        setShowOtpVerification(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async (otpResponse: any) => {
    try {
      // Auto-login after successful OTP verification
      await login({
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Account verified successfully!');
      router.push('/orders');
    } catch (error: any) {
      toast.error('Login failed after verification');
    }
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const skillOptions = [
    'Web Development', 'Mobile Development', 'Graphic Design', 'Content Writing',
    'Digital Marketing', 'SEO', 'Data Entry', 'Virtual Assistant',
    'Video Editing', 'Photography', 'Translation', 'Customer Service'
  ];

  // Show OTP verification if needed
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <OtpVerification
          email={formData.email}
          purpose="signup"
          channel="email"
          onSuccess={handleOtpSuccess}
          onBack={handleBackFromOtp}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="professional-card shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <p className="text-muted-foreground">
              Join thousands of freelancers and job seekers
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Phone */}
              <PhoneNumberInput
                label="Phone Number (Optional)"
                value={formData.phone}
                onChange={(phone) => {
                  if (phone) {
                    try {
                      const { parsePhoneNumber } = require('react-phone-number-input');
                      const parsed = parsePhoneNumber(phone);
                      handleInputChange('phone', parsed.number);
                      handleInputChange('countryCode', parsed.country || 'US');
                    } catch (error) {
                      handleInputChange('phone', phone);
                    }
                  } else {
                    handleInputChange('phone', '');
                    handleInputChange('countryCode', 'US');
                  }
                }}
                placeholder="Enter your phone number"
                disabled={loading}
              />

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="userType">I am a *</Label>
                <Select 
                  value={formData.userType} 
                  onValueChange={(value) => handleInputChange('userType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelancer">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Freelancer
                      </div>
                    </SelectItem>
                    <SelectItem value="jobseeker">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Job Seeker
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills (for freelancers) */}
              {formData.userType === 'freelancer' && (
                <div className="space-y-2">
                  <Label>Skills (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {skillOptions.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange('skills', [...formData.skills, skill]);
                            } else {
                              handleInputChange('skills', formData.skills.filter(s => s !== skill));
                            }
                          }}
                          disabled={loading}
                        />
                        <Label htmlFor={skill} className="text-sm font-normal">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-destructive">{errors.agreeToTerms}</p>}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
