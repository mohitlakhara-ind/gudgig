'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  description?: string;
  error?: string;
  value?: any;
}

interface AccessibleFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  onChange?: (data: Record<string, any>) => void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
  showProgress?: boolean;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  fields,
  onSubmit,
  onChange,
  submitLabel = 'Submit',
  loading = false,
  className = '',
  showProgress = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.id] = field.value || '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [currentFocus, setCurrentFocus] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);

  // Announce form errors to screen readers
  useEffect(() => {
    const errorMessages = Object.values(errors).filter(Boolean);
    if (errorMessages.length > 0) {
      const announcement = `${errorMessages.length} form errors: ${errorMessages.join(', ')}`;
      announceToScreenReader(announcement);
    }
  }, [errors]);

  const handleFieldChange = (fieldId: string, value: any) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    onChange?.(newFormData);

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
    validateField(fieldId);
  };

  const handleFieldFocus = (fieldId: string) => {
    setCurrentFocus(fieldId);
  };

  const validateField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const value = formData[fieldId];
    let error = '';

    if (field.required && (!value || value.toString().trim() === '')) {
      error = `${field.label} is required`;
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (field.type === 'password' && value) {
      if (value.length < 12) {
        error = 'Password must be at least 12 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
        error = 'Password must contain uppercase, lowercase, number, and special character';
      }
    }

    setErrors(prev => ({ ...prev, [fieldId]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const fieldValid = validateField(field.id);
      if (!fieldValid) {
        newErrors[field.id] = errors[field.id] || `${field.label} is invalid`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Focus first error field
      const firstErrorField = fields.find(field => errors[field.id]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField.id);
        element?.focus();
      }
    }
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const getProgressPercentage = () => {
    const requiredFields = fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => formData[f.id] && !errors[f.id]);
    return (completedFields.length / requiredFields.length) * 100;
  };

  const renderField = (field: FormField) => {
    const hasError = errors[field.id];
    const isTouched = touched[field.id];
    const fieldValue = formData[field.id];

    const fieldProps = {
      id: field.id,
      name: field.id,
      value: fieldValue,
      placeholder: field.placeholder,
      required: field.required,
      'aria-describedby': field.description ? `${field.id}-description` : undefined,
      'aria-invalid': hasError ? true : false,
      'aria-required': field.required ? true : false,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleFieldChange(field.id, e.target.value),
      onBlur: () => handleFieldBlur(field.id),
      onFocus: () => handleFieldFocus(field.id)
    };

    return (
      <div key={field.id} className="space-y-2">
        <label
          htmlFor={field.id}
          className={`text-sm font-medium ${hasError ? 'text-red-600' : ''}`}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>

        {field.description && (
          <p id={`${field.id}-description`} className="text-sm text-gray-600">
            {field.description}
          </p>
        )}

        {field.type === 'textarea' && (
          <Textarea
            {...fieldProps}
            className={hasError ? 'border-red-500' : ''}
            rows={4}
          />
        )}

        {field.type === 'select' && (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger
              id={field.id}
              className={hasError ? 'border-red-500' : ''}
              aria-describedby={field.description ? `${field.id}-description` : undefined}
              aria-invalid={hasError ? 'true' : 'false'}
              aria-required={field.required ? 'true' : 'false'}
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {field.type === 'checkbox' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={fieldValue}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              onBlur={() => handleFieldBlur(field.id)}
              onFocus={() => handleFieldFocus(field.id)}
              className="rounded border-gray-300"
              aria-describedby={field.description ? `${field.id}-description` : undefined}
              aria-invalid={hasError ? 'true' : 'false'}
              aria-required={field.required ? 'true' : 'false'}
            />
            <label htmlFor={field.id} className="text-sm">
              {field.label}
            </label>
          </div>
        )}

        {field.type === 'radio' && field.options && (
          <div className="space-y-2">
            {field.options.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${option.value}`}
                  name={field.id}
                  value={option.value}
                  checked={fieldValue === option.value}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  onBlur={() => handleFieldBlur(field.id)}
                  onFocus={() => handleFieldFocus(field.id)}
                  className="border-gray-300"
                  aria-describedby={field.description ? `${field.id}-description` : undefined}
                  aria-invalid={hasError ? 'true' : 'false'}
                  aria-required={field.required ? 'true' : 'false'}
                />
                <label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )}

        {['text', 'email', 'password'].includes(field.type) && (
          <Input
            type={field.type}
            {...fieldProps}
            className={hasError ? 'border-red-500' : ''}
          />
        )}

        {hasError && isTouched && (
          <p
            role="alert"
            className="text-sm text-red-600"
            id={`${field.id}-error`}
          >
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      aria-labelledby="form-title"
    >
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Form Progress</span>
            <span>{Math.round(getProgressPercentage())}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
              role="progressbar"
              aria-valuenow={getProgressPercentage()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Form completion progress"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {fields.map(renderField)}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full"
        aria-describedby="submit-description"
      >
        {loading ? 'Submitting...' : submitLabel}
      </Button>

      <div id="submit-description" className="sr-only">
        Submit the form with all required fields completed
      </div>
    </form>
  );
};

// Keyboard navigation helper component
export const KeyboardNavigationHelper: React.FC = () => {
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && e.altKey) {
        e.preventDefault();
        setShowHelper(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!showHelper) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHelper(true)}
          aria-label="Show keyboard navigation help"
        >
          ?
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold mb-2">Keyboard Navigation</h3>
      <ul className="text-sm space-y-1">
        <li><kbd className="bg-gray-100 px-1 rounded">Tab</kbd> - Move to next field</li>
        <li><kbd className="bg-gray-100 px-1 rounded">Shift+Tab</kbd> - Move to previous field</li>
        <li><kbd className="bg-gray-100 px-1 rounded">Enter</kbd> - Submit form</li>
        <li><kbd className="bg-gray-100 px-1 rounded">Alt+?</kbd> - Toggle this help</li>
      </ul>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelper(false)}
        className="mt-2"
      >
        Close
      </Button>
    </div>
  );
};

// Timeout warning component
export const TimeoutWarning: React.FC<{
  timeoutMinutes: number;
  onExtend: () => void;
  onExpire: () => void;
}> = ({ timeoutMinutes, onExtend, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          onExpire();
          return 0;
        }

        if (prev <= 300 && !showWarning) { // Show warning at 5 minutes
          setShowWarning(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire, showWarning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!showWarning) return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="timeout-title"
      aria-describedby="timeout-description"
      className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 rounded-lg p-4 shadow-lg z-50 max-w-md"
    >
      <h2 id="timeout-title" className="font-semibold text-yellow-800">
        Session Timeout Warning
      </h2>
      <p id="timeout-description" className="text-yellow-700 mt-1">
        Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}.
        Any unsaved data will be lost.
      </p>
      <div className="mt-3 flex space-x-2">
        <Button onClick={onExtend} size="sm">
          Extend Session
        </Button>
        <Button onClick={() => setShowWarning(false)} variant="outline" size="sm">
          Dismiss
        </Button>
      </div>
    </div>
  );
};