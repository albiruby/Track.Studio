'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { 
  CloudOff, 
  RefreshCw, 
  FolderOpen, 
  AlertTriangle, 
  Settings, 
  Database,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Loading State Wrapper with visual skeletons and centering
 */
export function LoadingState({ message = 'Acquiring performance telemetry...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[300px]">
      <Spinner size="lg" className="mb-4" />
      <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest animate-pulse">
        {message}
      </p>
    </div>
  );
}

/**
 * Empty State Container
 */
export function EmptyState({
  title = 'No Telemetry Recorded',
  description = 'Sync your running performance profile to calculate physiological thresholds.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-border border-dashed bg-card/40 text-center min-h-[250px]">
      <div className="rounded-full bg-secondary/60 p-3 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-normal">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Offline Connection Resilience Block
 */
export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-status-danger/5 border border-status-danger/20 rounded-lg min-h-[200px]">
      <WifiOff className="h-8 w-8 text-status-danger mb-3" />
      <h3 className="text-sm font-semibold text-foreground mb-1">Network Connectivity Disrupted</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4">
        Track.Studio is operating on offline fallback data. Reconnect to resume live cloud-platform synchronization.
      </p>
      <Button variant="outline" size="sm" className="border-status-danger/30 text-status-danger hover:bg-status-danger/10" onClick={handleReload}>
        <RefreshCw className="mr-2 h-3.5 w-3.5" />
        Retry Connection
      </Button>
    </div>
  );
}

/**
 * Micro-Syncing Indicator
 */
export function SyncingState({ label = 'Syncing activity queue...' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-xs select-none shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-info opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-status-info"></span>
      </span>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

/**
 * Error / Failure State Frame
 */
export function ErrorState({
  title = 'Telemetry Pipeline Failure',
  description = 'An error occurred during computational processing.',
  errorDetails,
  onReset,
}: {
  title?: string;
  description?: string;
  errorDetails?: string;
  onReset?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-status-danger/30 bg-status-danger/5 text-center min-h-[250px]">
      <div className="rounded-full bg-status-danger/10 p-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-status-danger" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-md mb-4 leading-normal">{description}</p>
      
      {errorDetails && (
        <pre className="text-[10px] text-left p-3 rounded border border-border bg-muted/80 max-w-md w-full overflow-auto font-mono text-muted-foreground mb-5">
          {errorDetails}
        </pre>
      )}

      {onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset Engine
        </Button>
      )}
    </div>
  );
}

/**
 * App Under Maintenance Frame
 */
export function MaintenanceState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
      <Settings className="h-10 w-10 text-muted-foreground mb-4 animate-spin-slow" />
      <h3 className="text-base font-semibold text-foreground mb-2">Computational Updates Ongoing</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-6">
        Track.Studio algorithms are being re-calibrated. Real-time calculations and Strava ingestion queues are temporarily paused.
      </p>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 px-3 py-1 bg-secondary rounded border border-border">
        Status: CALIBRATING_MODELS
      </div>
    </div>
  );
}

/**
 * No Data visual representation
 */
export function NoDataState({
  title = 'No Historical Data',
  description = 'Connect your sports integration profiles to populate chronological trend graphs.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-border border-dashed rounded-lg bg-card/25">
      <Database className="h-7 w-7 text-muted-foreground/60 mb-3" />
      <h4 className="text-xs font-semibold text-foreground mb-0.5">{title}</h4>
      <p className="text-[11px] text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
