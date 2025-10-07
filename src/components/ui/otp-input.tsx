'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  className,
  inputClassName,
  autoFocus = true,
  placeholder = '0'
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize input refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Handle input change
  const handleInputChange = useCallback((index: number, inputValue: string) => {
    // Only allow digits
    const sanitizedValue = inputValue.replace(/\D/g, '');
    
    if (sanitizedValue.length > 1) {
      // Handle paste operation - improved logic
      const pastedDigits = sanitizedValue.slice(0, length);
      
      // Create new OTP value by replacing from current index
      const currentValue = value.split('');
      for (let i = 0; i < pastedDigits.length && (index + i) < length; i++) {
        currentValue[index + i] = pastedDigits[i];
      }
      
      const newOtp = currentValue.join('').slice(0, length);
      onChange(newOtp);
      
      // Smart focus management for paste
      const totalFilled = newOtp.replace(/\s/g, '').length;
      const nextFocusIndex = Math.min(totalFilled, length - 1);
      
      // Focus the appropriate input with delay for better UX
      setTimeout(() => {
        inputRefs.current[nextFocusIndex]?.focus();
        setFocusedIndex(nextFocusIndex);
      }, 50);
      
      // Call onComplete if all digits are filled
      if (totalFilled === length && onComplete) {
        setTimeout(() => onComplete(newOtp), 150);
      }
      return;
    }

    // Single digit input
    const newValue = value.split('');
    newValue[index] = sanitizedValue;
    const newOtp = newValue.join('').slice(0, length);
    onChange(newOtp);

    // Auto-focus next input
    if (sanitizedValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Call onComplete when all digits are filled
    if (newOtp.length === length && onComplete) {
      onComplete(newOtp);
    }
  }, [value, onChange, onComplete, length]);

  // Handle key down events
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentValue = value.split('');
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (currentValue[index]) {
        // Clear current input
        const newValue = [...currentValue];
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        const newValue = [...currentValue];
        newValue[index - 1] = '';
        onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (e.key === 'Delete') {
      e.preventDefault();
      const newValue = [...currentValue];
      newValue[index] = '';
      onChange(newValue.join(''));
    }
  }, [value, onChange, length]);

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  // Handle paste events
  const handlePaste = useCallback((index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const pastedText = e.clipboardData.getData('text');
    
    // Enhanced sanitization - handle various formats
    let sanitizedDigits = pastedText.replace(/\D/g, '');
    
    // Handle common OTP formats like "123 456" or "123-456" or "123456"
    if (sanitizedDigits.length === 0) {
      // Try to extract digits from formatted text
      const formattedMatch = pastedText.match(/(\d{1,6})/);
      if (formattedMatch) {
        sanitizedDigits = formattedMatch[1];
      }
    }
    
    if (sanitizedDigits.length === 0) return;
    
    // Create new OTP value by replacing from current index
    const currentValue = value.split('');
    const digitsToPaste = sanitizedDigits.slice(0, length - index);
    
    for (let i = 0; i < digitsToPaste.length && (index + i) < length; i++) {
      currentValue[index + i] = digitsToPaste[i];
    }
    
    const newOtp = currentValue.join('').slice(0, length);
    onChange(newOtp);
    
    // Smart focus management
    const totalFilled = newOtp.replace(/\s/g, '').length;
    const nextFocusIndex = Math.min(totalFilled, length - 1);
    
    // Focus the appropriate input with slight delay for better UX
    setTimeout(() => {
      inputRefs.current[nextFocusIndex]?.focus();
      setFocusedIndex(nextFocusIndex);
    }, 50);
    
    // Call onComplete if all digits are filled
    if (totalFilled === length && onComplete) {
      setTimeout(() => onComplete(newOtp), 150);
    }
  }, [value, onChange, onComplete, length]);

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      setFocusedIndex(0);
    }
  }, [autoFocus]);

  // Focus first empty input when value changes
  useEffect(() => {
    if (!disabled) {
      const firstEmptyIndex = value.split('').findIndex((digit, index) => !digit);
      if (firstEmptyIndex !== -1 && focusedIndex === null) {
        inputRefs.current[firstEmptyIndex]?.focus();
        setFocusedIndex(firstEmptyIndex);
      }
    }
  }, [value, disabled, focusedIndex]);

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20',
            'border-border bg-background text-foreground',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            focusedIndex === index 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50',
            value[index] 
              ? 'border-primary bg-primary/5' 
              : '',
            inputClassName
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
