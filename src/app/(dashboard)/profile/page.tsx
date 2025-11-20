'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, ApiClientError } from '@/lib/api';
import CustomLoader from '@/components/CustomLoader';
import { AlertCircle, Home, MapPin, Phone, Save, User as UserIcon } from 'lucide-react';

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const INITIAL_FORM: ProfileFormState = {
  name: '',
  email: '',
  phone: '',
  countryCode: 'US',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<ProfileFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await apiClient.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        return;
      }

      const address = (currentUser as any).address || {};
      setUser(currentUser);
        setFormData({
          name: (currentUser as any).name || '',
          email: (currentUser as any).email || '',
          phone: (currentUser as any).phone || '',
        countryCode: (currentUser as any).countryCode || 'US',
        addressLine1: address.line1 || (currentUser as any).addressLine1 || '',
        addressLine2: address.line2 || (currentUser as any).addressLine2 || '',
        city: address.city || (currentUser as any).city || '',
        state: address.state || (currentUser as any).state || '',
        postalCode: address.postalCode || (currentUser as any).postalCode || '',
        country: address.country || (currentUser as any).country || '',
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone,
        countryCode: formData.countryCode || 'US',
        address: {
          line1: formData.addressLine1 || undefined,
          line2: formData.addressLine2 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          postalCode: formData.postalCode || undefined,
          country: formData.country || undefined,
        },
        location: [formData.city, formData.state, formData.country].filter(Boolean).join(', ') || undefined,
      };

      const response = await apiClient.updateProfile(payload as any);
      if (response.success) {
        setSuccess('Profile updated successfully');
        setUser(response.data as any);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const maskedMemberSince = useMemo(() => {
    if (!user?.createdAt) return '—';
    return new Date(user.createdAt).toLocaleDateString();
  }, [user]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <CustomLoader size={32} color="#1FA9FF" />
        <span className="ml-2 text-muted-foreground">Loading profile…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Unable to load profile</h3>
          <p className="text-sm text-muted-foreground">{error || 'Please try again in a moment.'}</p>
        </div>
        <Button variant="outline" onClick={fetchProfile}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
        title="Profile"
        description="Only essential information is shown. Update your contact details below."
        actions={
          <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving…' : 'Save'}
            </Button>
        }
      />

      {success && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-success">
          {success}
                      </div>
                    )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
                      </div>
                    )}

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        <Card>
                          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Only the required profile fields remain editable.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  Full name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
                              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Mobile number
                </label>
                <Input value={formData.phone} disabled className="bg-muted/40" />
                              </div>
                            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Email
                </label>
                <Input value={formData.email} disabled className="bg-muted/40" />
                              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                />
                                      </div>
                                    </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Address line 1</label>
                <Input
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  placeholder="Street, house number"
                />
                                  </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address line 2</label>
                <Input
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Apartment, suite, etc."
                />
                                </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
                          </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State / Region</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
                          </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Postal code</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="ZIP / PIN"
                            />
                          </div>
                        </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
                        </div>
                      </CardContent>
                    </Card>

        <div className="space-y-6">
                    <Card>
                      <CardHeader>
              <CardTitle>Account snapshot</CardTitle>
              <CardDescription>Your immutable account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{maskedMemberSince}</span>
                          </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">{user?._id || '—'}</span>
                        </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{user?.role || 'user'}</span>
                        </div>
                      </CardContent>
                    </Card>
                
          {/* <Card>
            <CardHeader>
              <CardTitle>Why only essentials?</CardTitle>
              <CardDescription>Everything else stays hidden by default.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                To keep things simple and secure, this page now focuses on the core contact information required for job activity.
              </p>
              <div className="space-y-2">
                <p>Name and phone can be updated anytime.</p>
                <p>Email remains read-only for security.</p>
                <p>Detailed profile, skills, and stats are hidden by design.</p>
              </div>
            </CardContent>
          </Card> */}
          </div>
        </div>
      </div>
  );
}

