'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Flame, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthenticationLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerContent?: React.ReactNode;
}

export function AuthenticationLayout({
  children,
  title,
  subtitle,
  footerContent,
  className,
  ...props
}: AuthenticationLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 select-none relative',
        className
      )}
      id="authentication-layout-container"
      {...props}
    >
      {/* Decorative branding background grid/lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 space-y-6"
      >
        {/* Core Layout Card */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Accent top line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-foreground" />

          {/* Brand Logo and Header */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-md">
              <Flame className="h-5.5 w-5.5 text-status-warning animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight uppercase">
                Track<span className="text-muted-foreground font-light">.Studio</span>
              </h2>
              <div className="text-[9px] text-muted-foreground font-mono leading-none tracking-widest uppercase">
                Performance Calibration Console
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1 mb-6 border-b border-border/60 pb-4">
            <h1 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>}
          </div>

          {/* Form Form Port */}
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer actions or links */}
        {footerContent && (
          <div className="text-center text-xs text-muted-foreground">
            {footerContent}
          </div>
        )}

        {/* Workspace Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
          <ShieldCheck className="h-3.5 w-3.5 text-status-success" />
          <span>Fidelity authentication protocol active</span>
        </div>
      </motion.div>
    </div>
  );
}
