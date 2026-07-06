'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Zap,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
  };
  description?: string;
  tooltipText?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  description,
  tooltipText,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-all duration-200', className)}>
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between gap-1.5 mb-2 select-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-sans">
            {title}
          </span>
          {tooltipText && (
            <Tooltip content={tooltipText} position="top">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground transition-colors" />
            </Tooltip>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground font-sans">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-medium text-muted-foreground font-sans">
              {unit}
            </span>
          )}
        </div>

        {(change || description) && (
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40 text-[11px]">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-mono font-semibold',
                  change.type === 'positive' && 'text-status-success',
                  change.type === 'negative' && 'text-status-danger',
                  change.type === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change.type === 'positive' && <ArrowUpRight className="h-3 w-3" />}
                {change.type === 'negative' && <ArrowDownRight className="h-3 w-3" />}
                {change.value}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground font-sans text-right truncate flex-1 ml-2">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface ActivityCardProps {
  name: string;
  date: string;
  distance: string;
  duration: string;
  pace: string;
  rss?: number;
  source: 'strava' | 'intervals' | 'manual';
  status?: 'processed' | 'syncing' | 'failed';
  onClick?: () => void;
}

export function ActivityCard({
  name,
  date,
  distance,
  duration,
  pace,
  rss,
  source,
  status = 'processed',
  onClick,
}: ActivityCardProps) {
  const sourceBadges = {
    strava: <Badge variant="warning">Strava</Badge>,
    intervals: <Badge variant="info">Intervals</Badge>,
    manual: <Badge variant="outline">Manual</Badge>,
  };

  const statusIndicators = {
    processed: <span className="h-2 w-2 rounded-full bg-status-success" title="Processed" />,
    syncing: <RefreshCw className="h-3.5 w-3.5 text-status-warning animate-spin" title="Syncing..." />,
    failed: <AlertTriangle className="h-3.5 w-3.5 text-status-danger" title="Processing Error" />,
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group border border-border/80 hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden bg-card/60'
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {name}
            </h4>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground select-none">
              {date}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 select-none">
            {sourceBadges[source]}
            {statusIndicators[status]}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-5 pt-4 border-t border-border/40">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground select-none">Distance</p>
            <p className="text-sm font-bold text-foreground font-mono">{distance}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground select-none">Duration</p>
            <p className="text-sm font-bold text-foreground font-mono">{duration}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground select-none">Pace</p>
            <p className="text-sm font-bold text-foreground font-mono">{pace}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground select-none">RSS</p>
            <p className="text-sm font-bold text-foreground font-mono">
              {rss !== undefined ? rss : '--'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface ConnectionStatusCardProps {
  platformName: string;
  logo?: React.ComponentType<{ className?: string }>;
  isConnected: boolean;
  lastSyncedAt?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isSyncing?: boolean;
}

export function ConnectionStatusCard({
  platformName,
  logo: Logo,
  isConnected,
  lastSyncedAt,
  onConnect,
  onDisconnect,
  isSyncing = false,
}: ConnectionStatusCardProps) {
  return (
    <Card className="border border-border bg-card/50">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 select-none">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-secondary/80 border border-border flex items-center justify-center shrink-0">
            {Logo ? <Logo className="h-5 w-5 text-foreground" /> : <Zap className="h-5 w-5" />}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold tracking-tight text-foreground">{platformName}</h4>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex h-2 w-2 rounded-full',
                  isConnected ? 'bg-status-success' : 'bg-muted-foreground/30'
                )}
              />
              <span className="text-[11px] font-medium text-muted-foreground">
                {isConnected ? 'Sync Connection Active' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
          {isConnected && lastSyncedAt && (
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Synced: {lastSyncedAt}
            </span>
          )}
          <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-status-danger/30 text-status-danger hover:bg-status-danger/10 text-xs"
                onClick={onDisconnect}
                disabled={isSyncing}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={onConnect}
                isLoading={isSyncing}
              >
                Connect Platform
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface HealthCardProps {
  title: string;
  status: 'healthy' | 'caution' | 'issue';
  message: string;
  metricLabel?: string;
  metricValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function HealthCard({
  title,
  status,
  message,
  metricLabel,
  metricValue,
  icon: Icon = Heart,
}: HealthCardProps) {
  const borderColors = {
    healthy: 'border-status-success/30 bg-status-success/5',
    caution: 'border-status-warning/30 bg-status-warning/5',
    issue: 'border-status-danger/30 bg-status-danger/5',
  };

  const badgeColors = {
    healthy: <Badge variant="success">Optimal</Badge>,
    caution: <Badge variant="warning">Warning</Badge>,
    issue: <Badge variant="destructive">Critical</Badge>,
  };

  return (
    <Card className={cn('border', borderColors[status])}>
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="rounded-md bg-card p-2 border border-border shrink-0 mt-0.5">
            <Icon className="h-4.5 w-4.5 text-foreground" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 select-none">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h4>
              {badgeColors[status]}
            </div>
            <p className="text-xs text-muted-foreground leading-normal max-w-md">{message}</p>
          </div>
        </div>

        {metricLabel && metricValue && (
          <div className="shrink-0 flex flex-col md:items-end bg-card p-3 rounded-md border border-border min-w-[120px]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {metricLabel}
            </span>
            <span className="text-lg font-bold font-mono text-foreground mt-0.5">
              {metricValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
