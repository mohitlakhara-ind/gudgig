'use client';

import React, { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

interface PhoneNumberInputProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const PhoneNumberInput = forwardRef<any, PhoneNumberInputProps>(
  ({ 
    value, 
    onChange, 
    placeholder = "Enter phone number", 
    disabled = false, 
    error, 
    label,
    required = false,
    className,
    id,
    name,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <PhoneInput
            value={value as any}
            onChange={(v) => onChange && onChange(v as any)}
            placeholder={placeholder}
            disabled={disabled}
            id={id}
            name={name}
            international
            countryCallingCodeEditable={false}
            defaultCountry="US"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            style={{
              '--PhoneInput-color--focus': 'hsl(var(--ring))',
              '--PhoneInputCountrySelect-marginRight': '0.5rem',
            } as React.CSSProperties}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PhoneNumberInput.displayName = 'PhoneNumberInput';

export { PhoneNumberInput };
export default PhoneNumberInput;



