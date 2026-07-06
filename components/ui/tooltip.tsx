'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 text-[10px] font-medium text-popover-foreground bg-popover border border-border rounded shadow-md whitespace-nowrap pointer-events-none select-none',
            {
              'bottom-full left-1/2 -translate-x-1/2 mb-1.5': position === 'top',
              'top-full left-1/2 -translate-x-1/2 mt-1.5': position === 'bottom',
              'right-full top-1/2 -translate-y-1/2 mr-1.5': position === 'left',
              'left-full top-1/2 -translate-y-1/2 ml-1.5': position === 'right',
            },
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
