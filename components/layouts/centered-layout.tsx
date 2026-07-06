'use client';

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CenteredLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CenteredLayout({ children, className, ...props }: CenteredLayoutProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground',
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
