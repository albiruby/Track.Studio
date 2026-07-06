import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 stroke-[2]',
      md: 'h-6 w-6 stroke-[1.5]',
      lg: 'h-10 w-10 stroke-[1.2]',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        {...props}
      >
        <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
