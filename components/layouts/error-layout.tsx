'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { AlertOctagon, CornerDownLeft, RefreshCcw, Home } from 'lucide-react';

interface ErrorLayoutProps {
  errorCode?: string | number;
  title: string;
  description: string;
  diagnostics?: string;
  onRetry?: () => void;
  homePath?: string;
}

export function ErrorLayout({
  errorCode = '500',
  title,
  description,
  diagnostics,
  onRetry,
  homePath = '/',
}: ErrorLayoutProps) {
  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none relative"
      id="error-layout-container"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg bg-card border border-border rounded-lg shadow-xl p-8 space-y-6 relative z-10 text-center"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-status-danger" />

        {/* Error Icon */}
        <div className="h-12 w-12 rounded-full bg-status-danger/10 text-status-danger flex items-center justify-center mx-auto mb-2 animate-pulse">
          <AlertOctagon className="h-6 w-6" />
        </div>

        {/* Error Code & Code Title */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-status-danger uppercase">
            Ingestion Code: {errorCode}
          </span>
          <h1 className="text-lg font-bold uppercase tracking-wider text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* Diagnostic Stack-trace Container */}
        {diagnostics && (
          <div className="text-left bg-muted/40 border border-border rounded p-4 space-y-1.5 overflow-hidden">
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
              Diagnostic Stack Trace
            </span>
            <pre className="text-[10px] font-mono text-foreground leading-normal overflow-x-auto whitespace-pre-wrap max-h-32 scrollbar-thin">
              {diagnostics}
            </pre>
          </div>
        )}

        {/* Action recovery triggers */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 select-none">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8.5 uppercase text-[10px] gap-2"
              id="error-retry-btn"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Retry Connection</span>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              window.location.href = homePath;
            }}
            className="h-8.5 uppercase text-[10px] gap-2"
            id="error-home-btn"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </div>
      </motion.div>

      {/* Safety system footprint */}
      <div className="mt-8 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest relative z-10">
        Track.Studio Isolation Environment
      </div>
    </div>
  );
}
