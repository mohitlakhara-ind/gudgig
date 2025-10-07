'use client';

import { User, MapPin, Calendar, Award, Briefcase, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileSummaryProps {
  user: any;
  profileCompleteness: number;
}

export default function ProfileSummary({ user, profileCompleteness }: ProfileSummaryProps) {
  // Handle different user object structures - check if user is nested under 'data'
  const actualUser = user?.data || user;
  const userRole = actualUser?.role;
  const isAdmin = userRole === 'admin';
  const userName = actualUser?.name || 
                   actualUser?.fullName || 
                   actualUser?.firstName || 
                   actualUser?.displayName ||
                   actualUser?.username ||
                   actualUser?.email?.split('@')[0] || // Use email prefix as fallback
                   'User';
  const userEmail = actualUser?.email || 'No email';
  const userAvatar = actualUser?.avatar || 
                     actualUser?.profileImage || 
                     actualUser?.picture || 
                     actualUser?.photoURL ||
                     undefined;
  const userLocation = actualUser?.location || actualUser?.address || 'Location not set';
  const userBio = actualUser?.bio || actualUser?.description || '';

  const getRoleDisplay = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'freelancer':
        return 'Freelancer';
      case 'gigseeker':
        return 'Job Seeker';
      default:
        return 'User';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'freelancer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'gigseeker':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="text-2xl font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          <h3 className="font-semibold text-xl text-foreground mb-1">{userName}</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className={getRoleColor()}>
              {getRoleDisplay()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-3 w-3 mr-1" />
            {userLocation}
          </div>

          {userBio && (
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {userBio.length > 120 ? `${userBio.substring(0, 120)}...` : userBio}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-medium">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Briefcase className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="font-medium">{(user.experience || []).length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Experience</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="font-medium">{(user.skills || []).length}</span>
                </div>
                <p className="text-xs text-muted-foreground">Skills</p>
              </div>
            </div>

            {user.createdAt && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Member since</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
