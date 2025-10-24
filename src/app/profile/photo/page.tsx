'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Camera } from 'lucide-react';
import Link from 'next/link';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import { useAuth } from '@/contexts/AuthContext';
import { profilePhotoService } from '@/services/profilePhotoService';

export default function ProfilePhotoPage() {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        setLoading(true);
        const photoData = await profilePhotoService.getProfilePhoto();
        setProfilePhoto(photoData);
      } catch (error) {
        console.error('Error fetching profile photo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePhoto();
  }, []);

  const handlePhotoUpdate = (avatarUrl: string) => {
    if (profilePhoto) {
      setProfilePhoto({
        ...profilePhoto,
        avatar: avatarUrl,
        hasAvatar: !!avatarUrl
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile" aria-label="Go back to profile page">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Camera className="h-6 w-6" aria-hidden="true" />
              Profile Photo
            </h1>
            <p className="text-muted-foreground">
              Upload and manage your profile photo
            </p>
          </div>
        </header>

        {/* Current Photo Status */}
        <Card role="region" aria-labelledby="status-title" aria-describedby="status-description">
          <CardHeader>
            <CardTitle id="status-title" className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              Current Status
            </CardTitle>
            <CardDescription id="status-description">
              Your profile photo visibility and completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-3 h-3 rounded-full ${profilePhoto?.hasAvatar ? 'bg-green-500' : 'bg-yellow-500'}`}
                  aria-label={profilePhoto?.hasAvatar ? 'Photo uploaded status' : 'No photo status'}
                ></div>
                <div>
                  <p className="font-medium">
                    {profilePhoto?.hasAvatar ? 'Photo Uploaded' : 'No Photo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profilePhoto?.hasAvatar 
                      ? 'Your profile photo is visible to clients'
                      : 'Add a photo to complete your profile'
                    }
                  </p>
                </div>
              </div>
              {profilePhoto?.hasAvatar && (
                <div className="text-sm text-green-600 font-medium" aria-label="Profile completion points">
                  +10 pts
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Upload Component */}
        <ProfilePhotoUpload
          currentAvatar={profilePhoto?.avatar || ''}
          userName={user?.name || 'User'}
          onPhotoUpdate={handlePhotoUpdate}
          showCard={true}
        />

        {/* Tips and Guidelines */}
        <Card role="region" aria-labelledby="guidelines-title" aria-describedby="guidelines-description">
          <CardHeader>
            <CardTitle id="guidelines-title">Photo Guidelines</CardTitle>
            <CardDescription id="guidelines-description">
              Best practices for a professional profile photo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section aria-labelledby="dos-heading">
                <h4 id="dos-heading" className="font-semibold text-sm">✅ Do's</h4>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>• Use a clear, high-quality image</li>
                  <li>• Look directly at the camera</li>
                  <li>• Use good lighting</li>
                  <li>• Dress professionally</li>
                  <li>• Smile naturally</li>
                  <li>• Use a neutral background</li>
                </ul>
              </section>
              <section aria-labelledby="donts-heading">
                <h4 id="donts-heading" className="font-semibold text-sm">❌ Don'ts</h4>
                <ul className="text-sm text-muted-foreground space-y-1" role="list">
                  <li>• Avoid group photos</li>
                  <li>• Don't use heavily filtered images</li>
                  <li>• Avoid sunglasses or hats</li>
                  <li>• Don't use blurry or dark photos</li>
                  <li>• Avoid casual or inappropriate clothing</li>
                  <li>• Don't use old photos that don't look like you</li>
                </ul>
              </section>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg" role="note" aria-labelledby="pro-tip-heading">
              <h4 id="pro-tip-heading" className="font-semibold text-sm text-blue-900 mb-2">💡 Pro Tip</h4>
              <p className="text-sm text-blue-800">
                A professional profile photo can increase your chances of getting hired by up to 40%. 
                Make sure your photo represents the professional image you want to project to potential clients.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Requirements */}
        <Card role="region" aria-labelledby="requirements-title">
          <CardHeader>
            <CardTitle id="requirements-title">Technical Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" role="list">
              <div className="text-center p-3 bg-muted/50 rounded-lg" role="listitem">
                <div className="font-semibold">File Format</div>
                <div className="text-muted-foreground">JPEG, PNG, WebP</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg" role="listitem">
                <div className="font-semibold">Max Size</div>
                <div className="text-muted-foreground">5 MB</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg" role="listitem">
                <div className="font-semibold">Dimensions</div>
                <div className="text-muted-foreground">400x400px (auto-cropped)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
