'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType } from '@/types/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    certifications: [] as any[]
  });

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
      const currentUser: any = await apiClient.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          location: currentUser.location || '',
          bio: currentUser.bio || '',
          skills: (currentUser.skills as any[]) || [],
          experience: (currentUser.experience as any[]) || [],
          education: (currentUser.education as any[]) || [],
          certifications: (currentUser.certifications as any[]) || []
        });
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

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const calculateProfileCompleteness = () => {
    if (!user) return 0;
    
    let completeness = 0;
    const fields = [
      user.name,
      user.email,
      user.phone,
      user.location,
      user.bio,
      user.skills?.length > 0,
      user.experience?.length > 0,
      user.education?.length > 0
    ];
    
    fields.forEach(field => {
      if (field) completeness += 12.5;
    });
    
    return Math.round(completeness);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load profile</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchUserProfile} variant="outline" className="bg-transparent">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
            <p className="text-gray-600">
              Keep your profile up to date to attract the best opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Profile Overview */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="h-12 w-12 text-gray-600" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-1/2 transform translate-x-6 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-gray-600">Job Seeker</p>
                    <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location || 'Location not set'}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Profile Completeness</span>
                        <span>{calculateProfileCompleteness()}%</span>
                      </div>
                      <Progress value={calculateProfileCompleteness()} className="h-2" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Member since</p>
                      <p className="text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-sm">Add a professional photo to increase visibility</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-sm">Complete your work experience section</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <p className="text-sm">Add more skills to improve matching</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 mr-3"></div>
                    <p className="text-sm">Add certifications to stand out</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Profile Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your personal and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Professional Title *
                      </label>
                      <Input value={(formData as any).title || ''} onChange={(e) => handleInputChange('title', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="pl-10" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      className="w-full h-24 px-3 py-2 text-sm border border-input bg-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(formData.bio || '').length}/500 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Skills</CardTitle>
                      <CardDescription>
                        Add skills that showcase your expertise
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(formData.skills || []).map((skill: any, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {typeof skill === 'string' ? skill : skill.name}
                        <button 
                          className="ml-2 hover:text-red-600"
                          onClick={() => removeSkill(typeof skill === 'string' ? skill : (skill as any).name)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input placeholder="Add a new skill..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value=''; } }} />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Work Experience</CardTitle>
                      <CardDescription>
                        Add your professional experience
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(user.experience || []).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No work experience added yet</p>
                      <p className="text-sm">Add your professional experience to showcase your background</p>
                    </div>
                  ) : (
                    (user.experience || []).map((exp: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-gray-600">{exp.company}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {exp.location}
                              <span className="mx-2">•</span>
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                        </div>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>
                        Add your educational background
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(user.education || []).map((edu: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-gray-600">{edu.school}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {edu.location}
                            <span className="mx-2">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            {edu.startDate} - {edu.endDate}
                          </div>
                          {edu.gpa && (
                            <p className="text-sm text-gray-500 mt-1">GPA: {edu.gpa}</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Certifications</CardTitle>
                      <CardDescription>
                        Add your professional certifications
                      </CardDescription>
                    </div>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certification
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(user.certifications || []).map((cert: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-gray-600">{cert.issuer}</p>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {cert.date}
                            {cert.credentialId && (
                              <>
                                <span className="mx-2">•</span>
                                <span>ID: {cert.credentialId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control who can see your profile and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-gray-600">Make your profile visible to employers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Contact Information</p>
                      <p className="text-sm text-gray-600">Show phone number to employers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Resume Visibility</p>
                      <p className="text-sm text-gray-600">Allow employers to download your resume</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" className="bg-transparent">Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
