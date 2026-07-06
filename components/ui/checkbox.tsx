import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onChange, ...props }, ref) => {
    return (
      <label className="relative flex items-center justify-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 rounded border border-border bg-card flex items-center justify-center transition-all peer-focus:ring-1 peer-focus:ring-ring peer-checked:bg-primary peer-checked:border-primary peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
            className
          )}
        >
          <Check className="h-3 w-3 text-primary-foreground stroke-[3] hidden peer-checked:block" />
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
