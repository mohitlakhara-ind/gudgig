'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  X,
  DollarSign,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Target,
  Zap,
  Star,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiClient, ApiClientError } from '@/lib/api';
import { CreateJobRequest, Job } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

interface JobFormData extends Omit<CreateJobRequest, 'salary' | 'applicationDeadline'> {
  salary: {
    min: string;
    max: string;
    currency: string;
    isNegotiable: boolean;
    period: string;
  };
  applicationDeadline: string;
  status: string;
  featured: boolean;
  urgent: boolean;
}

export default function PostJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    shortDescription: '',
    company: user?.company || '',
    category: '',
    type: '',
    location: '',
    isRemote: false,
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      isNegotiable: false,
      period: 'project'
    },
    requirements: [''],
    skills: [''],
    benefits: [''],
    experience: '',
    education: 'any',
    applicationDeadline: '',
    tags: [''],
    applicationInstructions: '',
    status: 'draft',
    featured: false,
    urgent: false
  });

  // Auto-save to localStorage for mobile safety
  useEffect(() => {
    const saved = localStorage.getItem('postJobDraft');
    if (saved) {
      try {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch {}
    }
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem('postJobDraft', JSON.stringify(formData));
      } catch {}
    }, 800);
    return () => clearTimeout(id);
  }, [formData]);

  const categories = [
    'Technology',
    'Design',
    'Writing',
    'Marketing',
    'Data Entry',
    'Research',
    'Customer Service',
    'Translation',
    'Virtual Assistance',
    'Social Media',
    'Other'
  ];

  const jobTypes = [
    'micro-task',
    'short-project',
    'hourly',
    'fixed-price'
  ];

  const experienceLevels = [
    'fresher',
    '1-2 years',
    '3-5 years',
    '5-10 years',
    '10+ years'
  ];

  const educationLevels = [
    'high-school',
    'bachelors',
    'masters',
    'phd',
    'any'
  ];

  const currencies = [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
    'CHF',
    'SEK',
    'NOK',
    'DKK'
  ];

  const salaryPeriods = [
    'project',
    'hourly',
    'daily',
    'weekly'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof JobFormData] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayFieldChange = (field: 'requirements' | 'skills' | 'benefits' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'requirements' | 'skills' | 'benefits' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'requirements' | 'skills' | 'benefits' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { status, featured, urgent, ...rest } = formData;
      const jobData: CreateJobRequest = {
        ...rest,
        salary: { ...rest.salary, min: rest.salary.min ? parseFloat(rest.salary.min) : undefined, max: rest.salary.max ? parseFloat(rest.salary.max) : undefined },
        applicationDeadline: rest.applicationDeadline || undefined,
        requirements: rest.requirements.filter(Boolean),
        skills: rest.skills.filter(Boolean),
        benefits: rest.benefits.filter(Boolean),
        tags: rest.tags.filter(Boolean),
      };

      const response = await apiClient.createGig(jobData);

      if (publish) {
        router.push('/employer/jobs');
      } else {
        router.push(`/employer/jobs/${response.data._id}?edit=true`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
      const message = error instanceof Error ? error.message : 'An error occurred while creating the job';
      alert(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <div className="flex items-center max-w-full overflow-x-auto">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-xs font-medium touch-manipulation ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : step < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title *
        </label>
        <Input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="e.g., Logo Design for Tech Startup"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <Input
          value={formData.shortDescription}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
          placeholder="Brief description (max 300 characters)"
          maxLength={300}
          required
        />
        <p className="text-xs text-gray-700 mt-1">
          {(formData.shortDescription || '').length}/300 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detailed Description *
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide detailed information about the microjob..."
          rows={6}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type *
          </label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, State, Country"
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRemote"
            checked={formData.isRemote}
            onChange={(e) => handleInputChange('isRemote', e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="isRemote" className="text-sm font-medium text-gray-700">
            Remote Work Available
          </label>
        </div>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Experience Level *
        </label>
        <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Level
        </label>
        <Select value={formData.education} onValueChange={(value) => handleInputChange('education', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            {educationLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level === 'any' ? 'Any' : level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Required Skills
        </label>
        {formData.skills.map((skill, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={skill}
              onChange={(e) => handleArrayFieldChange('skills', index, e.target.value)}
              placeholder="e.g., React, Node.js, TypeScript"
            />
            {formData.skills.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayField('skills', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayField('skills')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Requirements
        </label>
        {formData.requirements.map((requirement, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={requirement}
              onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
              placeholder="e.g., Must have portfolio, Available immediately"
            />
            {formData.requirements.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayField('requirements', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayField('requirements')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Requirement
        </Button>
      </div>
    </div>
  );

  const renderCompensation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          id="isNegotiable"
          checked={formData.salary.isNegotiable}
          onChange={(e) => handleInputChange('salary.isNegotiable', e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="isNegotiable" className="text-sm font-medium text-gray-700">
          Salary is negotiable
        </label>
      </div>

      {!formData.salary.isNegotiable && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
              <Input
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary.min', e.target.value)}
                placeholder="100"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Budget
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
              <Input
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary.max', e.target.value)}
                placeholder="500"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <Select value={formData.salary.currency} onValueChange={(value) => handleInputChange('salary.currency', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Period *
        </label>
        <Select value={formData.salary.period} onValueChange={(value) => handleInputChange('salary.period', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {salaryPeriods.map((period) => (
              <SelectItem key={period} value={period}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Benefits & Perks
        </label>
        {formData.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={benefit}
              onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
              placeholder="e.g., Flexible hours, Quick payment, Future opportunities"
            />
            {formData.benefits.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeArrayField('benefits', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayField('benefits')}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Benefit
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderRequirements();
      case 3:
        return renderCompensation();
      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/employer/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Post New MicroJob</h1>
            <p className="text-gray-600">
              Create a detailed microjob posting to attract the right talent
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, true)}
            disabled={isLoading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publish Job
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      {renderStepIndicator()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {currentStep === 1 && <Briefcase className="h-5 w-5 mr-2" />}
                {currentStep === 2 && <Target className="h-5 w-5 mr-2" />}
                {currentStep === 3 && <DollarSign className="h-5 w-5 mr-2" />}
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Requirements & Skills'}
                {currentStep === 3 && 'Compensation & Benefits'}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Provide the essential details about your microjob'}
                {currentStep === 2 && 'Specify the skills and requirements needed'}
                {currentStep === 3 && 'Set your budget and additional perks'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => handleSubmit(e, true)}>
                {renderStepContent()}

                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
                    >
                      Next
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => handleSubmit(e, false)}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Publish MicroJob
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Job Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {formData.title || 'Job Title'}
                </h3>
                <p className="text-gray-800 text-sm mt-1">
                  {formData.shortDescription || 'Short description will appear here'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.category && (
                  <Badge variant="secondary">{formData.category}</Badge>
                )}
                {formData.type && (
                  <Badge variant="secondary">
                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('-', ' ')}
                  </Badge>
                )}
                {formData.urgent && (
                  <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                )}
                {formData.featured && (
                  <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-800">
                {formData.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {formData.location}
                  </div>
                )}
                {formData.isRemote && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Remote Available
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formData.experience || 'Experience level'}
                </div>
              </div>

              {!formData.salary.isNegotiable && formData.salary.min && (
                <div className="flex items-center text-sm">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${formData.salary.min} - ${formData.salary.max} {formData.salary.currency}
                  <span className="text-gray-500 ml-1">per {formData.salary.period}</span>
                </div>
              )}

              {formData.salary.isNegotiable && (
                <div className="text-sm text-gray-800">
                  Salary negotiable
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Use clear, descriptive titles that include key skills</p>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Be specific about requirements and deliverables</p>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Set competitive rates to attract quality candidates</p>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p>Include benefits to make your job more appealing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

