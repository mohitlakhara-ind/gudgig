'use client';

import React, { useState, useEffect } from 'react';
import { AccessibleForm } from '../ui/accessible-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface JobPostingFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onSaveDraft?: (data: any) => void;
  loading?: boolean;
  userLocation?: string;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  initialData = {},
  onSubmit,
  onSaveDraft,
  loading = false,
  userLocation = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [complianceStatus, setComplianceStatus] = useState<{
    salary: boolean;
    accessibility: boolean;
    eeoc: boolean;
    overall: boolean;
  }>({
    salary: false,
    accessibility: false,
    eeoc: false,
    overall: false
  });
  const [seoPreview, setSeoPreview] = useState({
    title: '',
    description: '',
    url: ''
  });

  const steps = [
    { id: 'basic', title: 'Basic Information', required: true },
    { id: 'details', title: 'MicroJob Details', required: true },
    { id: 'salary', title: 'Budget', required: true },
    { id: 'compliance', title: 'Compliance & Legal', required: true },
    { id: 'seo', title: 'SEO & Publishing', required: false }
  ];

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onSaveDraft && Object.keys(formData).length > 0) {
        onSaveDraft(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, onSaveDraft]);

  // Update compliance status when form data changes
  useEffect(() => {
    updateComplianceStatus();
    updateSeoPreview();
  }, [formData]);

  const updateComplianceStatus = () => {
    const salaryCompliant = checkSalaryCompliance();
    const accessibilityCompliant = checkAccessibilityCompliance();
    const eeocCompliant = checkEEOCompliance();

    setComplianceStatus({
      salary: salaryCompliant,
      accessibility: accessibilityCompliant,
      eeoc: eeocCompliant,
      overall: salaryCompliant && accessibilityCompliant && eeocCompliant
    });
  };

  const checkSalaryCompliance = () => {
    const location = formData.location || userLocation;
    if (!location) return false;

    const requiresDisclosure = location.toLowerCase().includes('california') ||
                              location.toLowerCase().includes('new york') ||
                              location.toLowerCase().includes('colorado');

    if (requiresDisclosure) {
      return formData.salaryDisclosure?.min && formData.salaryDisclosure?.max;
    }

    return true;
  };

  const checkAccessibilityCompliance = () => {
    return formData.description?.length >= 50 &&
           formData.requirements?.length > 0 &&
           !containsComplexLanguage(formData.description);
  };

  const checkEEOCompliance = () => {
    return formData.eeocCompliant === true;
  };

  const containsComplexLanguage = (text: string) => {
    const complexWords = ['utilize', 'leverage', 'synergize', 'paradigm'];
    return complexWords.some(word => text.toLowerCase().includes(word));
  };

  const updateSeoPreview = () => {
    const title = formData.title || 'MicroJob Title';
    const company = formData.company?.name || 'Company Name';
    const location = formData.location || 'Location';

    setSeoPreview({
      title: `${title} at ${company} - ${location}`,
      description: formData.shortDescription || formData.description?.substring(0, 155) + '...' || '',
      url: ['micro-task','short-project','hourly','fixed-price','freelance'].includes(formData.type)
        ? `/gigs/${formData.slug || 'microjob-slug'}`
        : `/jobs/${formData.slug || 'job-slug'}`
    });
  };

  const getStepFields = (stepId: string) => {
    switch (stepId) {
      case 'basic':
        return [
          {
            id: 'title',
            label: 'MicroJob Title',
            type: 'text',
            required: true,
            placeholder: 'e.g. Senior Software Engineer',
            description: 'Clear, descriptive job title that candidates will search for'
          },
          {
            id: 'company',
            label: 'Company',
            type: 'select',
            required: true,
            options: [], // Would be populated from user's companies
            description: 'Select the company posting this job'
          },
          {
            id: 'category',
            label: 'MicroJob Category',
            type: 'select',
            required: true,
            options: [
              { value: 'Technology', label: 'Technology' },
              { value: 'Healthcare', label: 'Healthcare' },
              { value: 'Finance', label: 'Finance' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Other', label: 'Other' }
            ]
          },
          {
            id: 'location',
            label: 'MicroJob Location',
            type: 'text',
            required: true,
            placeholder: 'e.g. San Francisco, CA or Remote',
            description: 'City, state/country or "Remote"'
          }
        ];

      case 'details':
        return [
          {
            id: 'type',
            label: 'Engagement Type',
            type: 'select',
            required: true,
            options: [
              { value: 'full-time', label: 'Full-time' },
              { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' },
              { value: 'freelance', label: 'Freelance' }
            ]
          },
          {
            id: 'experience',
            label: 'Experience Level',
            type: 'select',
            required: true,
            options: [
              { value: 'fresher', label: 'Fresher' },
              { value: '1-2 years', label: '1-2 years' },
              { value: '3-5 years', label: '3-5 years' },
              { value: '5-10 years', label: '5-10 years' },
              { value: '10+ years', label: '10+ years' }
            ]
          },
          {
            id: 'description',
            label: 'MicroJob Description',
            type: 'textarea',
            required: true,
            description: 'Detailed description of responsibilities, requirements, and what the candidate will do'
          },
          {
            id: 'requirements',
            label: 'Requirements',
            type: 'textarea',
            required: true,
            description: 'List specific skills, qualifications, and experience required'
          },
          {
            id: 'benefits',
            label: 'Benefits',
            type: 'textarea',
            required: false,
            description: 'Compensation, perks, and benefits offered'
          }
        ];

      case 'salary':
        return [
          {
            id: 'salaryDisclosure.min',
            label: 'Minimum Salary',
            type: 'text',
            required: checkSalaryCompliance(),
            placeholder: 'e.g. 50000',
            description: 'Required in some locations for transparency compliance'
          },
          {
            id: 'salaryDisclosure.max',
            label: 'Maximum Salary',
            type: 'text',
            required: checkSalaryCompliance(),
            placeholder: 'e.g. 70000'
          },
          {
            id: 'salaryDisclosure.currency',
            label: 'Currency',
            type: 'select',
            required: checkSalaryCompliance(),
            options: [
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' }
            ]
          },
          {
            id: 'salaryDisclosure.period',
            label: 'Pay Period',
            type: 'select',
            required: checkSalaryCompliance(),
            options: [
              { value: 'yearly', label: 'Yearly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'hourly', label: 'Hourly' }
            ]
          },
          {
            id: 'salaryDisclosure.isNegotiable',
            label: 'Salary is Negotiable',
            type: 'checkbox',
            required: false
          }
        ];

      case 'compliance':
        return [
          {
            id: 'eeocCompliant',
            label: 'EEOC Compliance Statement',
            type: 'checkbox',
            required: true,
            description: 'We are an equal opportunity employer and comply with all EEOC regulations'
          },
          {
            id: 'disabilityAccommodations',
            label: 'Disability Accommodations',
            type: 'checkbox',
            required: false,
            description: 'We provide reasonable accommodations for qualified individuals with disabilities'
          },
          {
            id: 'veteranFriendly',
            label: 'Veteran Friendly',
            type: 'checkbox',
            required: false,
            description: 'We welcome veterans and value their service'
          },
          {
            id: 'jobLocationType',
            label: 'Work Arrangement',
            type: 'select',
            required: true,
            options: [
              { value: 'PHYSICAL_LOCATION', label: 'On-site' },
              { value: 'HYBRID', label: 'Hybrid' },
              { value: 'TELECOMMUTE', label: 'Remote' }
            ]
          }
        ];

      case 'seo':
        return [
          {
            id: 'shortDescription',
            label: 'SEO Description',
            type: 'textarea',
            required: false,
            description: 'Brief description for search results (155 characters max)',
            maxLength: 155
          },
          {
            id: 'tags',
            label: 'Tags',
            type: 'text',
            required: false,
            description: 'Comma-separated keywords for better discoverability'
          }
        ];

      default:
        return [];
    }
  };

  const handleStepSubmit = (stepData: any) => {
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      onSubmit(newFormData);
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(formData);
    }
  };

  const getComplianceBadge = (compliant: boolean) => (
    <Badge variant={compliant ? 'default' : 'destructive'} className="ml-2">
      {compliant ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
      {compliant ? 'Compliant' : 'Needs Attention'}
    </Badge>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle>Post a Job</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={(currentStep + 1) / steps.length * 100} />
          </div>
        </CardHeader>
      </Card>

      {/* Compliance Status */}
      {currentStep >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <span>Salary Transparency</span>
                {getComplianceBadge(complianceStatus.salary)}
              </div>
              <div className="flex items-center">
                <span>Accessibility</span>
                {getComplianceBadge(complianceStatus.accessibility)}
              </div>
              <div className="flex items-center">
                <span>EEOC Compliance</span>
                {getComplianceBadge(complianceStatus.eeoc)}
              </div>
              <div className="flex items-center">
                <span>Overall</span>
                {getComplianceBadge(complianceStatus.overall)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Preview */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SEO Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-semibold text-blue-600">{seoPreview.title}</h3>
              <p className="text-green-600 text-sm">{seoPreview.url}</p>
              <p className="text-gray-600 mt-1">{seoPreview.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Step Form */}
      <Card>
        <CardContent className="pt-6">
          <AccessibleForm
            fields={getStepFields(steps[currentStep].id) as any}
            onSubmit={handleStepSubmit}
            onChange={(data) => setFormData({ ...formData, ...data })}
            submitLabel={currentStep === steps.length - 1 ? 'Publish Job' : 'Next Step'}
            loading={loading}
            showProgress={true}
          />

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="space-x-2">
              {onSaveDraft && (
                <Button type="button" variant="outline" onClick={handleSaveDraft} className="bg-transparent">
                  Save Draft
                </Button>
              )}
              <Button
                type="button"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Warnings */}
      {!complianceStatus.overall && currentStep >= 3 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Some compliance requirements are not met. Please review and complete all required fields
                to ensure legal compliance before publishing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};