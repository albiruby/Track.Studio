'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface FullscreenLayoutProps {
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  toolbar?: React.ReactNode;
  className?: string;
}

export function FullscreenLayout({
  children,
  title,
  onClose,
  toolbar,
  className,
}: FullscreenLayoutProps) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden select-none"
      id="fullscreen-layout-container"
    >
      {/* Header Panel */}
      <header className="h-14 border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Maximize2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider">{title}</h1>
            <p className="text-[10px] text-muted-foreground leading-none font-mono mt-0.5">Immersive Inspect Mode</p>
          </div>
        </div>

        {/* Toolbar & Close Actions */}
        <div className="flex items-center gap-3">
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
          
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground border border-border/40 rounded-md"
              title="Close Inspect Mode"
              id="fullscreen-close-btn"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Wide Visual Viewport */}
      <main className={cn('flex-1 overflow-hidden relative', className)} id="fullscreen-viewport">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer Meta HUD */}
      <footer className="h-8 border-t border-border bg-card px-6 flex items-center justify-between shrink-0 text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
        <span>Track.Studio • Immersive Inspect active</span>
        <div className="flex items-center gap-3">
          <span>Viewport: <b>Wide Stage</b></span>
          <span>Refresh: <b>Auto</b></span>
        </div>
      </footer>
    </div>
  );
}
