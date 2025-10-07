'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    timezone: string;
  };
  privacy: {
    showProfile: boolean;
    showBids: boolean;
    showEarnings: boolean;
    allowMessages: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    bidUpdates: boolean;
    messageNotifications: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const actualUser = (user as any)?.data || user;
  
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: actualUser?.name || '',
      email: actualUser?.email || '',
      bio: actualUser?.bio || '',
      location: actualUser?.location || '',
      website: actualUser?.website || '',
      timezone: 'UTC'
    },
    privacy: {
      showProfile: true,
      showBids: false,
      showEarnings: false,
      allowMessages: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      bidUpdates: true,
      messageNotifications: true,
      paymentNotifications: true,
      marketingEmails: false
    },
    appearance: {
      theme: 'system'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'security'>('profile');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user settings on mount
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Get current user data to populate settings
        const response = await apiClient.getCurrentUser();
        if (response && isMounted) {
          setSettings(prev => ({
            ...prev,
            profile: {
              name: response.name || prev.profile.name,
              email: response.email || prev.profile.email,
              bio: response.bio || prev.profile.bio,
              location: response.location || prev.profile.location,
              website: response.website || prev.profile.website,
              timezone: response.timezone || prev.profile.timezone
            },
            privacy: {
              showProfile: response.privacySettings?.showProfile ?? prev.privacy.showProfile,
              showBids: response.privacySettings?.showBids ?? prev.privacy.showBids,
              showEarnings: response.privacySettings?.showEarnings ?? prev.privacy.showEarnings,
              allowMessages: response.privacySettings?.allowMessages ?? prev.privacy.allowMessages
            },
            notifications: {
              emailNotifications: response.notificationSettings?.emailNotifications ?? prev.notifications.emailNotifications,
              pushNotifications: response.notificationSettings?.pushNotifications ?? prev.notifications.pushNotifications,
              bidUpdates: response.notificationSettings?.bidUpdates ?? prev.notifications.bidUpdates,
              messageNotifications: response.notificationSettings?.messageNotifications ?? prev.notifications.messageNotifications,
              paymentNotifications: response.notificationSettings?.paymentNotifications ?? prev.notifications.paymentNotifications,
              marketingEmails: response.notificationSettings?.marketingEmails ?? prev.notifications.marketingEmails
            }
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSettings();
    return () => { isMounted = false; };
  }, []);

  // Memoized derived values
  const canSave = useMemo(() => !saving && !loading, [saving, loading]);

  // Debounced savers to reduce API calls
  const debounce = (fn: (...args: any[]) => void, delay = 600) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const saveProfileDebounced = useMemo(() => debounce(async (nextProfile: UserSettings['profile']) => {
    try {
      await apiClient.updateProfile(nextProfile);
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    }
  }, 800), []);

  const onProfileChange = useCallback((patch: Partial<UserSettings['profile']>) => {
    setSettings(prev => {
      const next = { ...prev, profile: { ...prev.profile, ...patch } };
      saveProfileDebounced(next.profile);
      return next;
    });
  }, [saveProfileDebounced]);

  const savePrivacyDebounced = useMemo(() => debounce(async (nextPrivacy: UserSettings['privacy']) => {
    try {
      await apiClient.updateProfile({ privacySettings: nextPrivacy });
      toast.success('Privacy saved');
    } catch {
      toast.error('Failed to save privacy');
    }
  }, 600), []);

  const onPrivacyChange = useCallback((patch: Partial<UserSettings['privacy']>) => {
    setSettings(prev => {
      const next = { ...prev, privacy: { ...prev.privacy, ...patch } };
      savePrivacyDebounced(next.privacy);
      return next;
    });
  }, [savePrivacyDebounced]);

  const saveNotificationsDebounced = useMemo(() => debounce(async (nextNotif: UserSettings['notifications']) => {
    try {
      await apiClient.updateProfile({ notificationSettings: nextNotif });
      toast.success('Notifications saved');
    } catch {
      toast.error('Failed to save notifications');
    }
  }, 600), []);

  const onNotificationsChange = useCallback((patch: Partial<UserSettings['notifications']>) => {
    setSettings(prev => {
      const next = { ...prev, notifications: { ...prev.notifications, ...patch } };
      saveNotificationsDebounced(next.notifications);
      return next;
    });
  }, [saveNotificationsDebounced]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await apiClient.updateProfile(settings.profile);
      if (response.success) {
      toast.success('Profile updated successfully');
      // Dispatch a lightweight client event for global listeners
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('user:profileUpdated'));
      }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      // Use profile update API to save privacy settings
      const response = await apiClient.updateProfile({ 
        privacySettings: settings.privacy 
      });
      if (response.success) {
        toast.success('Privacy settings updated');
      } else {
        toast.error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // Use profile update API to save notification settings
      const response = await apiClient.updateProfile({ 
        notificationSettings: settings.notifications 
      });
      if (response.success) {
        toast.success('Notification preferences updated');
      } else {
        toast.error('Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setSaving(true);
      // Use profile update API to change password
      const response = await apiClient.updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:inline-flex" disabled>
          Save all
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => onProfileChange({ name: e.target.value })}
                      placeholder="Your full name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Use your real name for better trust.</p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={settings.profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email changes require support contact.</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.profile.bio}
                    onChange={(e) => onProfileChange({ bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={settings.profile.location}
                      onChange={(e) => onProfileChange({ location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.profile.website}
                      onChange={(e) => onProfileChange({ website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.profile.timezone}
                    onValueChange={(value) => onProfileChange({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} disabled={!canSave}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile
                  </Button>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Public Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Show profile to employers</div>
                    <div className="text-xs text-muted-foreground">Allow employers to find you</div>
                  </div>
                  <Switch 
                    checked={settings.privacy.showProfile} 
                    onCheckedChange={(checked) => onPrivacyChange({ showProfile: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Show bids on profile</div>
                    <div className="text-xs text-muted-foreground">Display your recent activity</div>
                  </div>
                  <Switch 
                    checked={settings.privacy.showBids} 
                    onCheckedChange={(checked) => onPrivacyChange({ showBids: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Show earnings</div>
                    <div className="text-xs text-muted-foreground">Display your earnings publicly</div>
                  </div>
                  <Switch 
                    checked={settings.privacy.showEarnings} 
                    onCheckedChange={(checked) => onPrivacyChange({ showEarnings: checked })}
                  />
                </div>
                <Separator />
                <Button onClick={handleSavePrivacy} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Privacy
                </Button>
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          {activeTab === 'privacy' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Visibility</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Show profile to employers</div>
                      <div className="text-xs text-muted-foreground">Allow employers to find and view your profile</div>
                    </div>
                    <Switch 
                      checked={settings.privacy.showProfile} 
                      onCheckedChange={(checked) => onPrivacyChange({ showProfile: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Show bids on profile</div>
                      <div className="text-xs text-muted-foreground">Display your recent bid activity</div>
                    </div>
                    <Switch 
                      checked={settings.privacy.showBids} 
                      onCheckedChange={(checked) => onPrivacyChange({ showBids: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Show earnings</div>
                      <div className="text-xs text-muted-foreground">Display your earnings publicly</div>
                    </div>
                    <Switch 
                      checked={settings.privacy.showEarnings} 
                      onCheckedChange={(checked) => onPrivacyChange({ showEarnings: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Allow messages</div>
                      <div className="text-xs text-muted-foreground">Let employers contact you directly</div>
                    </div>
                    <Switch 
                      checked={settings.privacy.allowMessages} 
                      onCheckedChange={(checked) => onPrivacyChange({ allowMessages: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data & Analytics</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Data Usage</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        We use your data to improve our services and provide better job matches. 
                        Your personal information is never shared with third parties without your consent.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePrivacy} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Email notifications</div>
                      <div className="text-xs text-muted-foreground">Receive updates via email</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailNotifications} 
                      onCheckedChange={(checked) => onNotificationsChange({ emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Bid updates</div>
                      <div className="text-xs text-muted-foreground">Get notified about bid status changes</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.bidUpdates} 
                      onCheckedChange={(checked) => onNotificationsChange({ bidUpdates: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Message notifications</div>
                      <div className="text-xs text-muted-foreground">Get notified about new messages</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.messageNotifications} 
                      onCheckedChange={(checked) => onNotificationsChange({ messageNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Payment notifications</div>
                      <div className="text-xs text-muted-foreground">Get notified about payments</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.paymentNotifications} 
                      onCheckedChange={(checked) => onNotificationsChange({ paymentNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Push notifications</div>
                      <div className="text-xs text-muted-foreground">Get alerts on your device</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.pushNotifications} 
                      onCheckedChange={(checked) => onNotificationsChange({ pushNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Marketing</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Marketing emails</div>
                      <div className="text-xs text-muted-foreground">Receive promotional content and tips</div>
                    </div>
                    <Switch 
                      checked={settings.notifications.marketingEmails} 
                      onCheckedChange={(checked) => onNotificationsChange({ marketingEmails: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Two-Factor Authentication</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    Enable 2FA (Coming Soon)
                  </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Active Sessions</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Manage your active login sessions
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    View Sessions (Coming Soon)
                  </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">Login History</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        View your recent login activity
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3" disabled>
                    View History (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


