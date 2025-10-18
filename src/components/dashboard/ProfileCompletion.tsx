'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase, 
  Award, 
  Camera,
  MapPin,
  Clock,
  Star,
  Plus,
  ArrowRight,
  Loader2,
  Target,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface ProfileStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  points: number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: string;
}

interface ProfileCompletionProps {
  className?: string;
}

export default function ProfileCompletion({ className }: ProfileCompletionProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [profileResponse, statsResponse] = await Promise.all([
          apiClient.getMyProfile(),
          apiClient.getFreelancerStats()
        ]);

        setProfileData({
          profile: profileResponse.data,
          stats: statsResponse.data
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const calculateProfileCompleteness = (profile: any) => {
    let score = 0;
    const maxScore = 100;

    // Basic info (20 points)
    if (profile?.name) score += 10;
    if (profile?.email) score += 5;
    if (profile?.phone) score += 5;

    // Profile details (30 points)
    if (profile?.bio) score += 10;
    if (profile?.location) score += 5;
    if (profile?.avatar) score += 5;
    if (profile?.title) score += 10;

    // Professional info (30 points)
    if (profile?.skills && profile.skills.length > 0) score += 15;
    if (profile?.experience && profile.experience.length > 0) score += 10;
    if (profile?.education && profile.education.length > 0) score += 5;

    // Portfolio (20 points)
    if (profile?.portfolio && profile.portfolio.length > 0) score += 20;

    return Math.min(score, maxScore);
  };

  const getProfileSteps = (profile: any, stats: any): ProfileStep[] => {
    const completeness = calculateProfileCompleteness(profile);
    
    return [
      {
        id: 'basic-info',
        title: 'Basic Information',
        description: 'Add your name, email, and contact details',
        completed: !!(profile?.name && profile?.email),
        required: true,
        points: 20,
        icon: User,
        href: '/profile',
        action: 'Complete Basic Info'
      },
      {
        id: 'profile-photo',
        title: 'Profile Photo',
        description: 'Upload a professional profile picture',
        completed: !!profile?.avatar,
        required: true,
        points: 10,
        icon: Camera,
        href: '/profile',
        action: 'Add Photo'
      },
      {
        id: 'bio-location',
        title: 'Bio & Location',
        description: 'Write a compelling bio and add your location',
        completed: !!(profile?.bio && profile?.location),
        required: true,
        points: 15,
        icon: MapPin,
        href: '/profile',
        action: 'Add Bio & Location'
      },
      {
        id: 'skills',
        title: 'Skills & Expertise',
        description: 'List your professional skills and areas of expertise',
        completed: !!(profile?.skills && profile.skills.length > 0),
        required: true,
        points: 15,
        icon: Award,
        href: '/profile',
        action: 'Add Skills'
      },
      {
        id: 'experience',
        title: 'Work Experience',
        description: 'Add your professional work experience',
        completed: !!(profile?.experience && profile.experience.length > 0),
        required: false,
        points: 10,
        icon: Briefcase,
        href: '/profile',
        action: 'Add Experience'
      },
      {
        id: 'portfolio',
        title: 'Portfolio',
        description: 'Showcase your work with a portfolio',
        completed: !!(profile?.portfolio && profile.portfolio.length > 0),
        required: false,
        points: 20,
        icon: Star,
        href: '/profile',
        action: 'Add Portfolio'
      },
      {
        id: 'verification',
        title: 'Account Verification',
        description: 'Verify your identity and credentials',
        completed: profile?.verified || false,
        required: false,
        points: 10,
        icon: CheckCircle,
        href: '/verification',
        action: 'Verify Account'
      }
    ];
  };

  const getCompletionLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Needs Work', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getRecommendations = (steps: ProfileStep[]) => {
    const incomplete = steps.filter(step => !step.completed);
    const highImpact = incomplete.filter(step => step.required || step.points >= 15);
    
    if (highImpact.length === 0) {
      return {
        title: 'Profile Complete!',
        description: 'Your profile is well optimized. Keep it updated!',
        action: 'View Profile',
        href: '/profile'
      };
    }

    const nextStep = highImpact[0];
    return {
      title: `Complete ${nextStep.title}`,
      description: nextStep.description,
      action: nextStep.action || 'Get Started',
      href: nextStep.href || '/profile'
    };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Profile Completion</CardTitle>
          <CardDescription className="text-sm sm:text-base">Complete your profile to get more opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded mb-4"></div>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-6 h-6 bg-muted rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Profile Completion</CardTitle>
          <CardDescription className="text-sm sm:text-base">Complete your profile to get more opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) return null;

  const steps = getProfileSteps(profileData.profile, profileData.stats);
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const score = calculateProfileCompleteness(profileData.profile);
  const completionLevel = getCompletionLevel(score);
  const recommendations = getRecommendations(steps);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Profile Completion</CardTitle>
        <CardDescription className="text-sm sm:text-base">Complete your profile to get more opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="font-semibold">Profile Strength</span>
              </div>
              <Badge className={`${completionLevel.bgColor} ${completionLevel.color} border-0`}>
                {completionLevel.level}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{score}% Complete</span>
                <span>{completedSteps}/{totalSteps} sections</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>

            {score < 70 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Complete your profile to increase your chances of getting hired by 40%
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Steps */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Profile Sections</h4>
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{step.title}</p>
                      {step.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {step.points} pts
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {!step.completed && step.href && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={step.href}>
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{recommendations.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{recommendations.description}</p>
                <Button size="sm" asChild>
                  <Link href={recommendations.href || '/profile'}>
                    {recommendations.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {profileData.stats && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {profileData.stats.profileViews || 0}
                </div>
                <div className="text-xs text-muted-foreground">Profile Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profileData.stats.successRate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
