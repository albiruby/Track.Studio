'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none',
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-status-danger/20 text-status-danger border border-status-danger/30': variant === 'destructive',
          'text-foreground border-border bg-transparent': variant === 'outline',
          'border-transparent bg-status-success/15 text-status-success border border-status-success/30': variant === 'success',
          'border-transparent bg-status-warning/15 text-status-warning border border-status-warning/30': variant === 'warning',
          'border-transparent bg-status-info/15 text-status-info border border-status-info/30': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
