import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono tracking-tight transition-colors border select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground bg-transparent',
        success: 'border-transparent bg-status-success/10 text-status-success dark:text-status-success/90',
        warning: 'border-transparent bg-status-warning/10 text-status-warning dark:text-status-warning/90',
        destructive: 'border-transparent bg-status-danger/10 text-status-danger dark:text-status-danger/90',
        info: 'border-transparent bg-status-info/10 text-status-info dark:text-status-info/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
