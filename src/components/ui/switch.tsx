'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  id?: string;
};

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, onCheckedChange, disabled, className, id, ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          className
        )}
        {...rest}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';


