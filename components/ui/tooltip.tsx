import React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-card border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-card border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-card border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-card border-y-transparent border-l-transparent',
  };

  return (
    <div className="relative group inline-block">
      {React.cloneElement(children, {
        className: cn(children.props.className, 'cursor-help'),
      })}
      <div
        className={cn(
          'absolute z-50 scale-95 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 ease-out p-2 text-xs font-sans rounded bg-card text-card-foreground shadow-md border border-border/80 max-w-xs w-max',
          positionClasses[position],
          className
        )}
      >
        {content}
        <div
          className={cn(
            'absolute w-0 h-0 border-4 border-solid',
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
}
