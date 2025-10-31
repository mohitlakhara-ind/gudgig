'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Plus, 
  Check,
  Star
} from 'lucide-react';
import { useContactDetails, ContactDetails } from '@/contexts/ContactDetailsContext';
import { parsePhoneNumber } from 'react-phone-number-input';

interface ContactSelectionProps {
  onContactSelect: (contact: ContactFormData) => void;
  initialContact?: ContactFormData;
  showSaveOption?: boolean;
  title?: string;
  description?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  company?: string;
  position?: string;
  notes?: string;
  saveContact?: boolean;
  isDefault?: boolean;
}

const ContactSelection: React.FC<ContactSelectionProps> = ({
  onContactSelect,
  initialContact,
  showSaveOption = true,
  title = "Contact Information",
  description = "Choose your contact details for this submission"
}) => {
  const { contactDetails, loading, createContactDetails } = useContactDetails();
  const [selectedOption, setSelectedOption] = useState<'saved' | 'new'>('saved');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [formData, setFormData] = useState<ContactFormData>({
    name: initialContact?.name || '',
    email: initialContact?.email || '',
    phone: initialContact?.phone || '',
    countryCode: initialContact?.countryCode || 'US',
    company: initialContact?.company || '',
    position: initialContact?.position || '',
    notes: initialContact?.notes || '',
    saveContact: showSaveOption,
    isDefault: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (phone: string | undefined) => {
    if (phone) {
      try {
        const parsed = parsePhoneNumber(phone);
        setFormData(prev => ({
          ...prev,
          phone: parsed.number,
          countryCode: parsed.country || 'US'
        }));
      } catch (error) {
        setFormData(prev => ({ ...prev, phone }));
      }
    } else {
      setFormData(prev => ({ ...prev, phone: '', countryCode: 'US' }));
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === 'saved') {
      const selectedContact = contactDetails.find(contact => contact._id === selectedContactId);
      if (selectedContact) {
        onContactSelect({
          name: selectedContact.name,
          email: selectedContact.email,
          phone: selectedContact.phone,
          countryCode: selectedContact.countryCode,
          company: selectedContact.company,
          position: selectedContact.position,
          notes: selectedContact.notes,
          saveContact: false
        });
      }
    } else {
      if (!validateForm()) {
        return;
      }

      let contactToSubmit = { ...formData };

      // If user wants to save this contact
      if (formData.saveContact) {
        const savedContact = await createContactDetails({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          countryCode: formData.countryCode,
          company: formData.company,
          position: formData.position,
          notes: formData.notes,
          isDefault: formData.isDefault,
          isActive: true
        });

        if (savedContact) {
          contactToSubmit.saveContact = false; // Already saved
        }
      }

      onContactSelect(contactToSubmit);
    }
  };

  const defaultContact = contactDetails.find(contact => contact.isDefault);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedOption}
          onValueChange={(value: 'saved' | 'new') => setSelectedOption(value)}
          className="space-y-4"
        >
          {/* Saved Contacts Option */}
          {contactDetails.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="saved" id="saved" />
                <Label htmlFor="saved" className="font-medium">
                  Use Saved Contact Details
                </Label>
              </div>
              
              {selectedOption === 'saved' && (
                <div className="ml-6 space-y-3">
                  {contactDetails.map((contact) => (
                    <div
                      key={contact._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedContactId === contact._id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedContactId(contact._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem 
                            value={contact._id} 
                            id={contact._id}
                            checked={selectedContactId === contact._id}
                            onChange={() => setSelectedContactId(contact._id)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{contact.name}</span>
                              {contact.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                              {contact.company && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {contact.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedContactId === contact._id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Contact Option */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="font-medium">
                Enter New Contact Details
              </Label>
            </div>
            
            {selectedOption === 'new' && (
              <div className="ml-6 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Phone */}
                <PhoneNumberInput
                  label="Phone Number *"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter your phone number"
                  error={errors.phone}
                />

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">Position (Optional)</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="Enter your position"
                    value={formData.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  />
                </div>

                {/* Save Contact Options */}
                {showSaveOption && (
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveContact"
                        checked={formData.saveContact}
                        onCheckedChange={(checked) => handleInputChange('saveContact', checked)}
                      />
                      <Label htmlFor="saveContact" className="text-sm">
                        Save this contact for future use
                      </Label>
                    </div>
                    
                    {formData.saveContact && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                          />
                          <Label htmlFor="isDefault" className="text-sm">
                            Set as default contact
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </RadioGroup>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                Continue
                <Plus className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSelection;



