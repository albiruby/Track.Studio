'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Calendar, AlertTriangle } from 'lucide-react';

interface MaintenanceLayoutProps {
  estimatedTimeLeft?: string;
  maintenanceReason?: string;
}

export function MaintenanceLayout({
  estimatedTimeLeft = '45 minutes',
  maintenanceReason = 'Calibrating the core database engine pipelines to support zero-latency ingestion models.',
}: MaintenanceLayoutProps) {
  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none relative"
      id="maintenance-layout-container"
    >
      {/* Visual branding background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:16px_16px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-8 space-y-6 text-center relative z-10"
      >
        {/* Yellow-black progress indicator bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#fbbf24,#fbbf24_10px,#0f172a_10px,#0f172a_20px)]" />

        {/* Construction Icon */}
        <div className="h-12 w-12 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center mx-auto mb-2 animate-bounce">
          <Wrench className="h-5.5 w-5.5" />
        </div>

        {/* Maintenance Message */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-status-warning uppercase">
            System Calibrating
          </span>
          <h1 className="text-sm font-bold uppercase tracking-wider">Calibration In Progress</h1>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Track.Studio is temporarily offline for scheduled pipeline maintenance.
          </p>
        </div>

        {/* Reason block */}
        <div className="p-4 bg-muted/45 border border-border rounded text-left space-y-1">
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />
            Calibration Mandate
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            {maintenanceReason}
          </p>
        </div>

        {/* Est timeline counter */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-semibold py-1">
          <Calendar className="h-4 w-4 text-muted-foreground/60" />
          <span>Expected Completion: <b className="text-foreground">{estimatedTimeLeft}</b></span>
        </div>
      </motion.div>

      {/* Corporate support indicator */}
      <div className="mt-8 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest relative z-10">
        Engine Operational Base • Track.Studio
      </div>
    </div>
  );
}
