'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCcw, Wifi, HelpCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface OfflineLayoutProps {
  onReconnect?: () => void;
}

export function OfflineLayout({ onReconnect }: OfflineLayoutProps) {
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const simulateCheck = () => {
    setIsChecking(true);
    toast({
      title: 'Pinging Ingestion Channels',
      description: 'Testing gateway heartbeat and network frames...',
    });

    setTimeout(() => {
      setIsChecking(false);
      const isNowOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      if (isNowOnline) {
        toast({
          title: 'Network Restored',
          description: 'Gateway connected. Resuming telemetry stream.',
        });
        if (onReconnect) onReconnect();
      } else {
        toast({
          title: 'Heartbeat Failed',
          description: 'Internet connection is still offline. Please verify local router.',
          type: 'error',
        });
      }
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 select-none relative"
      id="offline-layout-container"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:18px_18px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-8 space-y-6 text-center relative z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />

        {/* Offline Icon */}
        <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-2 animate-pulse">
          <WifiOff className="h-5.5 w-5.5" />
        </div>

        {/* Offline Message */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">
            Connection Interrupted
          </span>
          <h1 className="text-sm font-bold uppercase tracking-wider">Workspace Offline</h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
            Track.Studio has lost connection to the primary database server. Local state caching is active.
          </p>
        </div>

        {/* Troubleshooting Instructions */}
        <div className="p-4 bg-muted/30 border border-border rounded text-left space-y-2">
          <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            Troubleshooting Guide
          </span>
          <ul className="text-xs text-muted-foreground space-y-1 font-medium list-disc pl-4 leading-relaxed">
            <li>Verify your physical Wi-Fi or ethernet connection is live.</li>
            <li>Check if firewall configurations are blocking port 3000.</li>
            <li>Simulate a reconnect once router signals stabilize.</li>
          </ul>
        </div>

        {/* Reconnect Actions */}
        <div className="flex justify-center pt-2 select-none">
          <Button
            variant="default"
            size="sm"
            onClick={simulateCheck}
            isLoading={isChecking}
            className="h-8.5 uppercase text-[10px] gap-2"
            id="offline-retry-btn"
          >
            {isChecking ? (
              <span>Verifying Connection...</span>
            ) : (
              <>
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Simulate Connection Retry</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Frame details */}
      <div className="mt-8 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest relative z-10">
        Offline Cache Buffer • 1.2 MB Sync-Pending
      </div>
    </div>
  );
}
