'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Loader2,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface ProfilePhotoUploadProps {
  currentAvatar?: string;
  userName?: string;
  onPhotoUpdate?: (avatarUrl: string) => void;
  className?: string;
  showCard?: boolean;
}

export default function ProfilePhotoUpload({ 
  currentAvatar, 
  userName = 'User', 
  onPhotoUpdate,
  className,
  showCard = true
}: ProfilePhotoUploadProps) {
  const { updateUser } = useAuth();
  const [avatar, setAvatar] = useState(currentAvatar || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [announcement, setAnnouncement] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Screen reader announcements
  const announceToScreenReader = useCallback((message: string) => {
    setAnnouncement(message);
    // Clear announcement after a short delay to allow for new announcements
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Focus management
  useEffect(() => {
    if (error && announcementRef.current) {
      announcementRef.current.focus();
    }
  }, [error]);

  const handleFileSelect = useCallback(async (file: File) => {
    // Announce file selection to screen readers
    announceToScreenReader(`Selected file: ${file.name}. Validating file...`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Please select a valid image file (JPEG, PNG, or WebP)';
      setError(errorMsg);
      announceToScreenReader(`Error: ${errorMsg}`);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 5MB';
      setError(errorMsg);
      announceToScreenReader(`Error: ${errorMsg}`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);
    announceToScreenReader('Starting upload. Please wait...');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.uploadProfilePhoto(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        setAvatar(response.data.avatar);
        onPhotoUpdate?.(response.data.avatar);
        
        // Update user context with new avatar
        updateUser({ avatar: response.data.avatar });
        
        toast.success('Profile photo updated successfully!');
        announceToScreenReader('Profile photo uploaded successfully!');
        
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Profile photo upload error:', err);
      
      // Handle specific error cases
      let errorMsg = 'Failed to upload photo. Please try again.';
      
      if (err.message?.includes('CLOUDINARY_NOT_CONFIGURED')) {
        errorMsg = 'File upload service is not configured. Please contact administrator.';
      } else if (err.message?.includes('cloud_name is disabled')) {
        errorMsg = 'File upload service is temporarily unavailable. Please try again later.';
      } else if (err.message?.includes('Invalid API credentials')) {
        errorMsg = 'File upload service configuration error. Please contact administrator.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      announceToScreenReader(`Upload failed: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  }, [onPhotoUpdate]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      announceToScreenReader(`File dropped: ${file.name}`);
      handleFileSelect(file);
    }
  }, [handleFileSelect, announceToScreenReader]);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!dragActive) {
      setDragActive(true);
      announceToScreenReader('Drop zone active. You can drop an image file here.');
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    if (dragActive) {
      setDragActive(false);
      announceToScreenReader('Drop zone inactive.');
    }
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    if (!dragActive) {
      setDragActive(true);
      announceToScreenReader('Drop zone active. You can drop an image file here.');
    }
  };

  const handleDeletePhoto = async () => {
    if (!avatar) return;

    setUploading(true);
    announceToScreenReader('Deleting profile photo...');
    
    try {
      const response = await apiClient.deleteProfilePhoto();
      
      if (response.success) {
        setAvatar('');
        onPhotoUpdate?.('');
        
        // Update user context to remove avatar
        updateUser({ avatar: '' });
        
        toast.success('Profile photo deleted successfully!');
        announceToScreenReader('Profile photo deleted successfully!');
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (err: any) {
      console.error('Profile photo deletion error:', err);
      const errorMsg = 'Failed to delete photo';
      announceToScreenReader(`Delete failed: ${errorMsg}`);
      toast.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* Screen Reader Announcements */}
      <div 
        ref={announcementRef}
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        tabIndex={-1}
      >
        {announcement}
      </div>

      {/* Avatar Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar 
            className="h-24 w-24 border-4 border-background shadow-lg"
            role="img"
            aria-label={avatar ? `Profile photo of ${userName}` : `Profile photo placeholder for ${userName}`}
          >
            <AvatarImage 
              src={avatar} 
              alt={avatar ? `Profile photo of ${userName}` : ''} 
            />
            <AvatarFallback 
              className="text-lg font-semibold bg-primary text-primary-foreground"
              aria-label={`Initials for ${userName}: ${getInitials(userName)}`}
            >
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          
          {/* Upload Progress Overlay */}
          {uploading && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
              role="progressbar"
              aria-label="Uploading profile photo"
              aria-valuenow={uploadProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin text-white mb-2" aria-hidden="true" />
                <div className="w-16">
                  <Progress value={uploadProgress} className="h-1" />
                </div>
                <span className="sr-only">Upload progress: {uploadProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Upload Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
            aria-label={avatar ? 'Change profile photo' : 'Upload profile photo'}
            aria-describedby="upload-instructions"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {avatar ? 'Change Photo' : 'Upload Photo'}
          </Button>
          
          {avatar && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeletePhoto}
              disabled={uploading}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
              aria-label="Remove profile photo"
              aria-describedby="delete-warning"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="sr-only"
          aria-label="Select profile photo file"
          aria-describedby="file-requirements"
        />
      </div>

      {/* Drag & Drop Area */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploading 
            ? 'border-primary bg-primary/5' 
            : dragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Drop zone for profile photo upload"
        aria-describedby="drop-instructions file-requirements"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <div className="text-sm text-muted-foreground">
            <p id="drop-instructions">Drag and drop an image here, or press Enter to select</p>
            <p id="file-requirements" className="text-xs mt-1">JPEG, PNG, WebP up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div 
          className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-xs text-muted-foreground space-y-1" role="complementary" aria-label="Photo upload tips">
        <h4 className="font-semibold text-foreground mb-2">Photo Tips:</h4>
        <ul className="space-y-1">
          <li>• Use a clear, professional photo</li>
          <li>• Square images work best</li>
          <li>• Make sure your face is clearly visible</li>
          <li>• Avoid group photos or heavily filtered images</li>
        </ul>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card role="region" aria-labelledby="profile-photo-title" aria-describedby="profile-photo-description">
        <CardHeader>
          <CardTitle id="profile-photo-title" className="flex items-center gap-2">
            <User className="h-5 w-5" aria-hidden="true" />
            Profile Photo
          </CardTitle>
          <CardDescription id="profile-photo-description">
            Upload a professional photo to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
}
