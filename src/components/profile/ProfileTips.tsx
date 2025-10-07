'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ProfileTipsProps {
  user: any;
  profileCompleteness: number;
}

export default function ProfileTips({ user, profileCompleteness }: ProfileTipsProps) {
  const getTips = () => {
    const tips = [];
    
    if (!user.profileImage && !user.avatar) {
      tips.push({
        icon: AlertCircle,
        text: 'Add a professional photo to increase visibility',
        priority: 'high',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Professional photo added',
        priority: 'high',
        completed: true
      });
    }

    if (!user.bio || user.bio.length < 50) {
      tips.push({
        icon: AlertCircle,
        text: 'Write a compelling bio (at least 50 characters)',
        priority: 'high',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Bio is well-written',
        priority: 'high',
        completed: true
      });
    }

    if (!user.location) {
      tips.push({
        icon: AlertCircle,
        text: 'Add your location to help clients find you',
        priority: 'medium',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Location added',
        priority: 'medium',
        completed: true
      });
    }

    if (!user.skills || user.skills.length === 0) {
      tips.push({
        icon: AlertCircle,
        text: 'Add skills to showcase your expertise',
        priority: 'high',
        completed: false
      });
    } else if (user.skills.length < 3) {
      tips.push({
        icon: Info,
        text: 'Add more skills to improve matching',
        priority: 'medium',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Good variety of skills added',
        priority: 'high',
        completed: true
      });
    }

    if (!user.experience || user.experience.length === 0) {
      tips.push({
        icon: AlertCircle,
        text: 'Add work experience to build credibility',
        priority: 'high',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Work experience added',
        priority: 'high',
        completed: true
      });
    }

    if (!user.education || user.education.length === 0) {
      tips.push({
        icon: Info,
        text: 'Add education background',
        priority: 'low',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Education background added',
        priority: 'low',
        completed: true
      });
    }

    if (!user.certifications || user.certifications.length === 0) {
      tips.push({
        icon: Info,
        text: 'Add certifications to stand out',
        priority: 'low',
        completed: false
      });
    } else {
      tips.push({
        icon: CheckCircle,
        text: 'Certifications added',
        priority: 'low',
        completed: true
      });
    }

    return tips;
  };

  const tips = getTips();
  const completedTips = tips.filter(tip => tip.completed).length;
  const totalTips = tips.length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Profile Tips</CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedTips}/{totalTips} completed
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityBgColor(tip.priority)}`}></div>
            <div className="flex items-start gap-2 flex-1">
              <tip.icon className={`h-4 w-4 mt-0.5 ${tip.completed ? 'text-green-500' : getPriorityColor(tip.priority)}`} />
              <p className={`text-sm ${tip.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {tip.text}
              </p>
            </div>
          </div>
        ))}
        
        {profileCompleteness < 100 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Complete more sections to reach 100% profile completeness and increase your chances of getting hired.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


