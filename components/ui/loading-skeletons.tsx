'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-muted/60 dark:bg-muted/30', className)}
      {...props}
    />
  );
}

export function CardLoader({ count = 1 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-lg border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="border-t border-border pt-4 flex gap-2">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableLoader({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/35 px-4 py-3.5 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, colIdx) => (
          <Skeleton key={colIdx} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-4 py-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton 
                key={colIdx} 
                className={cn('h-3.5 flex-1', colIdx === 0 ? 'w-2/3' : 'w-1/2')} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPlaceholder({ heightClass = 'h-[300px]' }: { heightClass?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-6 flex flex-col justify-between shadow-sm overflow-hidden relative', heightClass)}>
      {/* Top Labels */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
      
      {/* Visual Chart Mock Skeletons */}
      <div className="flex-1 flex items-end gap-3.5 px-2 pt-8">
        {Array.from({ length: 12 }).map((_, idx) => {
          // Semi-random heights for mock charts
          const heights = ['h-[20%]', 'h-[40%]', 'h-[35%]', 'h-[60%]', 'h-[50%]', 'h-[80%]', 'h-[75%]', 'h-[95%]', 'h-[65%]', 'h-[45%]', 'h-[30%]', 'h-[15%]'];
          return (
            <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-1.5 h-full">
              <Skeleton className={cn('w-full rounded-t', heights[idx])} />
              <Skeleton className="h-2.5 w-full max-w-[24px]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ChartPlaceholder />
        </div>
        <div>
          <TableLoader rows={4} cols={2} />
        </div>
      </div>
      <CardLoader count={3} />
    </div>
  );
}
