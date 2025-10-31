'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/dashboard/PageHeader';
import { Textarea } from '@/components/ui/textarea';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Eye,
  EyeOff,
  Plus,
  X,
  Award,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CustomLoader from '@/components/CustomLoader';
import { User as UserType } from '@/types/api';
import ProfileSummary from '@/components/profile/ProfileSummary';
import ProfileTips from '@/components/profile/ProfileTips';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: 'US',
    location: '',
    bio: '',
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    certifications: [] as any[]
  });
  const [freelancerProfile, setFreelancerProfile] = useState<any | null>(null);
  const [freelancerStats, setFreelancerStats] = useState<any | null>(null);
  const [freelancerForm, setFreelancerForm] = useState<any>({
    title: '',
    tagline: '',
    description: '',
    hourlyRate: { min: undefined as any, max: undefined as any, currency: 'USD' },
    location: { city: '', country: '', timezone: '' },
  });
  const [expForm, setExpForm] = useState<any>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    location: '',
    description: ''
  });
  const [primarySkillDraft, setPrimarySkillDraft] = useState('');
  const [skillDraft, setSkillDraft] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
  }, [isAuthenticated, router]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currentUser, profileResp, statsResp] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getMyFreelancerProfile().catch(() => null),
        apiClient.getFreelancerStats().catch(() => null)
      ]);

      if (currentUser) {
        setUser(currentUser as any);
        setFormData({
          name: (currentUser as any).name || '',
          email: (currentUser as any).email || '',
          phone: (currentUser as any).phone || '',
          location: (currentUser as any).location || '',
          bio: (currentUser as any).bio || '',
          skills: ((currentUser as any).skills as any[]) || [],
          experience: ((currentUser as any).experience as any[]) || [],
          education: ((currentUser as any).education as any[]) || [],
          certifications: ((currentUser as any).certifications as any[]) || []
        });
      }
      if (profileResp && (profileResp as any).success) {
        const prof = (profileResp as any).data;
        setFreelancerProfile(prof);
        setFreelancerForm({
          title: prof?.title || '',
          tagline: prof?.tagline || '',
          description: prof?.description || '',
          hourlyRate: {
            min: prof?.hourlyRate?.min,
            max: prof?.hourlyRate?.max,
            currency: prof?.hourlyRate?.currency || 'USD'
          },
          location: {
            city: prof?.location?.city || '',
            country: prof?.location?.country || '',
            timezone: prof?.location?.timezone || ''
          }
        });
      }
      if (statsResp && (statsResp as any).success) {
        setFreelancerStats((statsResp as any).data);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiClient.updateProfile(formData);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setUser(response.data as any);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFreelancerInput = (field: string, value: any) => {
    setFreelancerForm((prev: any) => ({ ...prev, [field]: value }));
  };


  const handleFreelancerNested = (group: 'hourlyRate' | 'location', field: string, value: any) => {
    setFreelancerForm((prev: any) => ({ ...prev, [group]: { ...(prev[group] || {}), [field]: value } }));
  };

  const saveFreelancerProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      setValidationError(null);
      // Client-side validation aligned with backend schema
      if (!freelancerForm.title || freelancerForm.title.trim().length < 3) {
        setValidationError('Title must be at least 3 characters.');
        return;
      }
      if (!freelancerForm.description || freelancerForm.description.trim().length < 100) {
        setValidationError('About must be at least 100 characters to save.');
        return;
      }
      const minRate = freelancerForm.hourlyRate?.min ? Number(freelancerForm.hourlyRate.min) : undefined;
      const maxRate = freelancerForm.hourlyRate?.max ? Number(freelancerForm.hourlyRate.max) : undefined;
      if (minRate !== undefined && (Number.isNaN(minRate) || minRate < 1)) {
        setValidationError('Hourly rate min must be a number >= 1.');
        return;
      }
      if (maxRate !== undefined && (Number.isNaN(maxRate) || maxRate < 1)) {
        setValidationError('Hourly rate max must be a number >= 1.');
        return;
      }
      const payload: any = {
        title: freelancerForm.title,
        tagline: freelancerForm.tagline,
        description: freelancerForm.description,
        hourlyRate: {
          min: minRate,
          max: maxRate,
          currency: freelancerForm.hourlyRate?.currency || 'USD'
        },
        location: {
          city: freelancerForm.location?.city || undefined,
          country: freelancerForm.location?.country || undefined,
          timezone: freelancerForm.location?.timezone || undefined
        }
      };
      const resp = await apiClient.updateFreelancerProfile(payload);
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
        setSuccess('Freelancer profile updated');
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to update freelancer profile';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const addExperience = async () => {
    try {
      setSaving(true);
      setError(null);
      setValidationError(null);
      if (!expForm.company?.trim() || !expForm.position?.trim() || !expForm.startDate) {
        setValidationError('Company, Position and Start Date are required.');
        return;
      }
      const newItem = {
        company: expForm.company,
        position: expForm.position,
        startDate: expForm.startDate ? new Date(expForm.startDate) : undefined,
        endDate: expForm.isCurrent ? undefined : (expForm.endDate ? new Date(expForm.endDate) : undefined),
        isCurrent: !!expForm.isCurrent,
        location: expForm.location || undefined,
        description: expForm.description || undefined,
      };
      const nextExperience = [...(freelancerProfile?.experience || []), newItem];
      const resp = await apiClient.updateFreelancerProfile({ experience: nextExperience });
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
        // reset form
        setExpForm({ company: '', position: '', startDate: '', endDate: '', isCurrent: false, location: '', description: '' });
        setSuccess('Experience added');
      }
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to add experience';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const addPrimarySkill = async () => {
    const s = primarySkillDraft.trim();
    if (!s) return;
    try {
      const current = [...(freelancerProfile?.primarySkills || [])];
      if (current.includes(s)) return;
      const resp = await apiClient.updateFreelancerProfile({ 
        primarySkills: [...current, s] 
      });
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
        setPrimarySkillDraft('');
      }
    } catch (e) {
      // no-op UI error handled globally
    }
  };

  const removePrimarySkill = async (skillToRemove: string) => {
    try {
      const next = (freelancerProfile?.primarySkills || []).filter((s: string) => s !== skillToRemove);
      const resp = await apiClient.updateFreelancerProfile({ primarySkills: next });
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
      }
    } catch {}
  };

  const addFreelancerSkill = async () => {
    const s = skillDraft.trim();
    if (!s) return;
    try {
      const current = [...(freelancerProfile?.skills || [])];
      if (current.some((it: any) => (typeof it === 'string' ? it === s : it?.name === s))) return;
      const next = [...current, { name: s, level: 'expert' }];
      const resp = await apiClient.updateFreelancerProfile({ skills: next });
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
        setSkillDraft('');
      }
    } catch {}
  };

  const removeFreelancerSkill = async (skillToRemove: string) => {
    try {
      const next = (freelancerProfile?.skills || []).filter((it: any) => (typeof it === 'string' ? it !== skillToRemove : it?.name !== skillToRemove));
      const resp = await apiClient.updateFreelancerProfile({ skills: next });
      if ((resp as any)?.success) {
        setFreelancerProfile((resp as any).data);
      }
    } catch {}
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const calculateProfileCompleteness = useMemo(() => {
    if (freelancerStats && typeof freelancerStats.profileCompleteness === 'number') {
      return Math.min(100, Math.max(0, Math.round(freelancerStats.profileCompleteness)));
    }
    if (!user) return 0;
    let completeness = 0;
    const fields = [
      (user as any).name,
      (user as any).email,
      (user as any).phone,
      (user as any).location,
      (user as any).bio,
      (user as any).skills?.length > 0,
      (user as any).experience?.length > 0,
      (user as any).education?.length > 0
    ];
    fields.forEach(field => { if (field) completeness += 12.5; });
    return Math.round(completeness);
  }, [user, freelancerStats]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <CustomLoader size={32} color="#1FA9FF" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load profile</h3>
        <p className="text-muted-foreground text-center mb-4">{error}</p>
        <Button onClick={fetchUserProfile} variant="outline" className="bg-transparent">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Profile Management"
          description="Keep your profile up to date to attract the best opportunities."
          actions={(
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileSummary 
              user={{
                ...user,
                title: freelancerProfile?.title || (user as any)?.title,
                primarySkills: freelancerProfile?.primarySkills || (user as any)?.primarySkills,
                location: (freelancerProfile?.location?.city || freelancerProfile?.location?.country)
                  ? [freelancerProfile?.location?.city, freelancerProfile?.location?.country].filter(Boolean).join(', ')
                  : (user as any)?.location,
                bio: freelancerProfile?.description || (user as any)?.bio,
                skills: (freelancerProfile?.skills && freelancerProfile.skills.length > 0) ? freelancerProfile.skills : (user as any)?.skills,
                experience: (freelancerProfile?.experience && freelancerProfile.experience.length > 0) ? freelancerProfile.experience : (user as any)?.experience,
                rating: freelancerStats?.averageRating,
                totalReviews: freelancerStats?.totalReviews
              }} 
              profileCompleteness={calculateProfileCompleteness} 
            />

            <ProfileTips 
              user={user} 
              profileCompleteness={calculateProfileCompleteness} 
            />
          </div>

          {/* Main Content - Profile Form with Tabs (desktop) and Accordion (mobile) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Freelancer profile quick overview (real data) */}
            <Card>
              <CardHeader>
                <CardTitle>Freelancer Profile</CardTitle>
                <CardDescription>Your public freelancer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {freelancerProfile ? (
                  <div className="space-y-4">
                    {freelancerStats && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Level: {freelancerProfile.level || 'new'}</Badge>
                        <Badge variant="secondary">Rating: {freelancerStats.averageRating ?? 0} ({freelancerStats.totalReviews ?? 0})</Badge>
                        <Badge variant="secondary">Orders: {freelancerStats.totalOrders ?? 0}</Badge>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Title</div>
                        <Input value={freelancerForm.title} onChange={(e) => handleFreelancerInput('title', e.target.value)} placeholder="Professional title" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Tagline</div>
                        <Input value={freelancerForm.tagline} onChange={(e) => handleFreelancerInput('tagline', e.target.value)} placeholder="Short tagline" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Hourly Rate</div>
                        <div className="flex items-center gap-2">
                          <Input placeholder="Min" value={freelancerForm.hourlyRate?.min ?? ''} onChange={(e) => handleFreelancerNested('hourlyRate', 'min', e.target.value)} className="w-24" />
                          <Input placeholder="Max" value={freelancerForm.hourlyRate?.max ?? ''} onChange={(e) => handleFreelancerNested('hourlyRate', 'max', e.target.value)} className="w-24" />
                          <Input placeholder="Currency" value={freelancerForm.hourlyRate?.currency ?? 'USD'} onChange={(e) => handleFreelancerNested('hourlyRate', 'currency', e.target.value)} className="w-24" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Per hour</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Location</div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="City" value={freelancerForm.location?.city ?? ''} onChange={(e) => handleFreelancerNested('location', 'city', e.target.value)} />
                          <Input placeholder="Country" value={freelancerForm.location?.country ?? ''} onChange={(e) => handleFreelancerNested('location', 'country', e.target.value)} />
                          <Input placeholder="Timezone" value={freelancerForm.location?.timezone ?? ''} onChange={(e) => handleFreelancerNested('location', 'timezone', e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">About</div>
                      <Textarea value={freelancerForm.description} onChange={(e) => handleFreelancerInput('description', e.target.value)} rows={4} />
                    </div>
                    <div>
                      <Button size="sm" onClick={saveFreelancerProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Freelancer Info'}
                      </Button>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Primary Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {(freelancerProfile.primarySkills || []).length > 0 ? (
                          (freelancerProfile.primarySkills || []).map((s: string, i: number) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1">{s}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">
                        {(freelancerProfile.skills || []).length > 0 ? (
                          (freelancerProfile.skills || []).map((s: any, i: number) => (
                            <Badge key={i} variant="outline" className="px-3 py-1">
                              {typeof s === 'string' ? s : s?.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                    {freelancerProfile.description && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">About</div>
                        <div className="text-sm text-foreground whitespace-pre-wrap">{freelancerProfile.description}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No freelancer profile found. Create one to showcase your work.</div>
                )}
              </CardContent>
            </Card>
            <div className="hidden md:block">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-8 mt-6">
                  {/* Freelancer-focused Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>Update your freelancer profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Professional Title *</label>
                          <Input value={freelancerForm.title} onChange={(e) => handleFreelancerInput('title', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Tagline</label>
                          <Input value={freelancerForm.tagline} onChange={(e) => handleFreelancerInput('tagline', e.target.value)} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate (Min / Max / Currency)</label>
                          <div className="flex items-center gap-2">
                            <Input placeholder="Min" value={freelancerForm.hourlyRate?.min ?? ''} onChange={(e) => handleFreelancerNested('hourlyRate', 'min', e.target.value)} className="w-24" />
                            <Input placeholder="Max" value={freelancerForm.hourlyRate?.max ?? ''} onChange={(e) => handleFreelancerNested('hourlyRate', 'max', e.target.value)} className="w-24" />
                            <Input placeholder="Currency" value={freelancerForm.hourlyRate?.currency ?? 'USD'} onChange={(e) => handleFreelancerNested('hourlyRate', 'currency', e.target.value)} className="w-24" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Location (City / Country / Timezone)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="City" value={freelancerForm.location?.city ?? ''} onChange={(e) => handleFreelancerNested('location', 'city', e.target.value)} />
                            <Input placeholder="Country" value={freelancerForm.location?.country ?? ''} onChange={(e) => handleFreelancerNested('location', 'country', e.target.value)} />
                            <Input placeholder="Timezone" value={freelancerForm.location?.timezone ?? ''} onChange={(e) => handleFreelancerNested('location', 'timezone', e.target.value)} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">About</label>
                        <Textarea value={freelancerForm.description} onChange={(e) => handleFreelancerInput('description', e.target.value)} rows={4} />
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={saveFreelancerProfile} disabled={saving}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Skills</CardTitle>
                          <CardDescription>Manage your primary and detailed skills</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Primary Skills</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(freelancerProfile?.primarySkills || []).map((s: string, i: number) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1">
                              {s}
                              <button className="ml-2 hover:text-red-600" onClick={() => removePrimarySkill(s)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Add primary skill" value={primarySkillDraft} onChange={(e) => setPrimarySkillDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPrimarySkill(); } }} />
                          <Button size="sm" variant="outline" className="bg-transparent" onClick={addPrimarySkill}><Plus className="h-4 w-4 mr-2" />Add</Button>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div>
                        <div className="text-sm font-medium mb-2">Skills</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(freelancerProfile?.skills || []).map((skill: any, index: number) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {typeof skill === 'string' ? skill : skill.name}
                              <button className="ml-2 hover:text-red-600" onClick={() => removeFreelancerSkill(typeof skill === 'string' ? skill : (skill as any).name)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Add skill" value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFreelancerSkill(); } }} />
                          <Button size="sm" variant="outline" className="bg-transparent" onClick={addFreelancerSkill}><Plus className="h-4 w-4 mr-2" />Add</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-8 mt-6">
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="work-experience">
                      <AccordionTrigger value="work-experience">Work Experience</AccordionTrigger>
                      <AccordionContent value="work-experience">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>Work Experience</CardTitle>
                                <CardDescription>Add your professional experience</CardDescription>
                              </div>
                            <Button size="sm" variant="outline" className="bg-transparent" onClick={addExperience}><Plus className="h-4 w-4 mr-2" />Add Experience</Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="border rounded-lg p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder="Company" value={expForm.company} onChange={(e) => setExpForm((p: any) => ({ ...p, company: e.target.value }))} />
                                <Input placeholder="Position/Title" value={expForm.position} onChange={(e) => setExpForm((p: any) => ({ ...p, position: e.target.value }))} />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input type="date" placeholder="Start Date" value={expForm.startDate} onChange={(e) => setExpForm((p: any) => ({ ...p, startDate: e.target.value }))} />
                                <Input type="date" placeholder="End Date" disabled={!!expForm.isCurrent} value={expForm.endDate} onChange={(e) => setExpForm((p: any) => ({ ...p, endDate: e.target.value }))} />
                                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!expForm.isCurrent} onChange={(e) => setExpForm((p: any) => ({ ...p, isCurrent: e.target.checked }))} /> Current Role</label>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder="Location" value={expForm.location} onChange={(e) => setExpForm((p: any) => ({ ...p, location: e.target.value }))} />
                              </div>
                              <Textarea placeholder="Description" value={expForm.description} onChange={(e) => setExpForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} />
                              <div className="flex justify-end">
                                <Button size="sm" onClick={addExperience} disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button>
                              </div>
                            </div>
                              {(freelancerProfile?.experience || []).length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p>No work experience added yet</p>
                                <p className="text-sm">Add your professional experience to showcase your background</p>
                              </div>
                            ) : (
                              (freelancerProfile?.experience || []).map((exp: any, index: number) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="font-semibold">{exp.position || exp.title}</h4>
                                      <p className="text-muted-foreground">{exp.company}</p>
                                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {exp.location}
                                        <span className="mx-2">•</span>
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ''} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : '')}
                                      </div>
                                    </div>
                                    <Button size="sm" variant="ghost">Edit</Button>
                                  </div>
                                  <p className="text-foreground text-sm">{exp.description}</p>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="education">
                      <AccordionTrigger value="education">Education</AccordionTrigger>
                      <AccordionContent value="education">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>Education</CardTitle>
                                <CardDescription>Add your educational background</CardDescription>
                              </div>
                              <Button size="sm" variant="outline" className="bg-transparent"><Plus className="h-4 w-4 mr-2" />Add Education</Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {(freelancerProfile?.education || []).map((edu: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{edu.degree}</h4>
                                    <p className="text-muted-foreground">{edu.institution}</p>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {edu.location}
                                      <span className="mx-2">•</span>
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {edu.startYear || ''} - {edu.endYear || ''}
                                    </div>
                                    {edu.fieldOfStudy && (<p className="text-sm text-muted-foreground mt-1">Field: {edu.fieldOfStudy}</p>)}
                                  </div>
                                  <Button size="sm" variant="ghost">Edit</Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="certifications">
                      <AccordionTrigger value="certifications">Certifications</AccordionTrigger>
                      <AccordionContent value="certifications">
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>Certifications</CardTitle>
                                <CardDescription>Add your professional certifications</CardDescription>
                              </div>
                              <Button size="sm" variant="outline" className="bg-transparent"><Plus className="h-4 w-4 mr-2" />Add Certification</Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {(freelancerProfile?.certifications || []).map((cert: any, index: number) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-semibold">{cert.name}</h4>
                                    <p className="text-muted-foreground">{cert.issuer}</p>
                                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : ''}
                                      {cert.expiryDate && (<><span className="mx-2">•</span><span>Exp: {new Date(cert.expiryDate).toLocaleDateString()}</span></>)}
                                      {cert.credentialId && (<><span className="mx-2">•</span><span>ID: {cert.credentialId}</span></>)}
                                    </div>
                                  </div>
                                  <Button size="sm" variant="ghost">Edit</Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>
                <TabsContent value="freelancer" className="space-y-8 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Freelancer Overview</CardTitle>
                      <CardDescription>Your marketplace performance at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {freelancerStats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground">Active Services</div>
                            <div className="text-xl font-semibold">{freelancerStats.activeServices ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Total Orders</div>
                            <div className="text-xl font-semibold">{freelancerStats.totalOrders ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Avg. Rating</div>
                            <div className="text-xl font-semibold">{freelancerStats.averageRating ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Total Reviews</div>
                            <div className="text-xl font-semibold">{freelancerStats.totalReviews ?? 0}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No stats available.</div>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio</CardTitle>
                      <CardDescription>Your showcased work</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {freelancerProfile?.portfolio?.length ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {freelancerProfile.portfolio.slice(0, 6).map((item: any, idx: number) => {
                            const firstImage = Array.isArray(item.images) && item.images.length > 0
                              ? (typeof item.images[0] === 'string' ? { url: item.images[0] } : item.images[0])
                              : null;
                            return (
                              <div key={idx} className="border rounded overflow-hidden">
                                {firstImage?.url && (
                                  <div className="w-full h-40 bg-muted/30">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={firstImage.url} alt={firstImage.alt || item.title || 'Portfolio'} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="font-medium truncate">{item.title || 'Portfolio Item'}</div>
                                  {item.description && (
                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</div>
                                  )}
                                  {(item.technologies || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {(item.technologies || []).slice(0, 5).map((t: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5">{t}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No portfolio items added.</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:hidden">
              <Accordion type="single" className="w-full">
                <AccordionItem value="basic">
                  <AccordionTrigger value="basic">Basic Info</AccordionTrigger>
                  <AccordionContent value="basic">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Update your personal and contact information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                            <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Professional Title *</label>
                            <Input value={(formData as any).title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <PhoneNumberInput
                              label="Phone Number"
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
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Location *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="pl-10" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Professional Bio</label>
                          <Textarea value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4} />
                          <p className="text-xs text-muted-foreground mt-1">{(formData.bio || '').length} / 500 characters</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Skills</CardTitle>
                            <CardDescription>Add skills that showcase your expertise</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="bg-transparent"><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(formData.skills || []).map((skill: any, index: number) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {typeof skill === 'string' ? skill : skill.name}
                              <button className="ml-2 hover:text-red-600" onClick={() => removeSkill(typeof skill === 'string' ? skill : (skill as any).name)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input 
                          placeholder="Add a new skill..." 
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter') { 
                              e.preventDefault(); 
                              addSkill((e.target as HTMLInputElement).value); 
                              (e.target as HTMLInputElement).value = ''; 
                            } 
                          }} 
                        />
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="experience">
                  <AccordionTrigger value="experience">Experience</AccordionTrigger>
                  <AccordionContent value="experience">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>Work Experience</CardTitle>
                            <CardDescription>Add your professional experience</CardDescription>
                          </div>
                          <Button size="sm" variant="outline" className="bg-transparent"><Plus className="h-4 w-4 mr-2" />Add Experience</Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {(user.experience || []).length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p>No work experience added yet</p>
                            <p className="text-sm">Add your professional experience to showcase your background</p>
                          </div>
                        ) : (
                          (user.experience || []).map((exp: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold">{exp.title}</h4>
                                  <p className="text-muted-foreground">{exp.company}</p>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {exp.location}
                                    <span className="mx-2">•</span>
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                                  </div>
                                </div>
                                <Button size="sm" variant="ghost">Edit</Button>
                              </div>
                              <p className="text-foreground text-sm">{exp.description}</p>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
  );
}