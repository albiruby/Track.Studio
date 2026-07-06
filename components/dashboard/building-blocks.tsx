'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  timeframe?: string;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  changeType = 'neutral',
  timeframe,
  icon: Icon,
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{title}</span>
          {Icon && (
            <div className="rounded-md bg-secondary p-1.5 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
          {unit && <span className="text-xs font-semibold text-muted-foreground uppercase">{unit}</span>}
        </div>

        {(change !== undefined || timeframe) && (
          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-border/55 pt-3">
            {change !== undefined ? (
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase select-none">
                {changeType === 'positive' && (
                  <span className="flex items-center text-status-success">
                    <ArrowUpRight className="h-3 w-3 mr-0.5 shrink-0" />
                    +{change}%
                  </span>
                )}
                {changeType === 'negative' && (
                  <span className="flex items-center text-status-danger">
                    <ArrowDownRight className="h-3 w-3 mr-0.5 shrink-0" />
                    {change}%
                  </span>
                )}
                {changeType === 'neutral' && (
                  <span className="text-muted-foreground">
                    {change}%
                  </span>
                )}
              </div>
            ) : <div />}
            {timeframe && <span className="text-[10px] font-mono text-muted-foreground uppercase">{timeframe}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConnectionStatusCardProps {
  providerName: string;
  status: 'connected' | 'disconnected' | 'expired' | 'syncing' | 'error';
  lastSyncAt?: string;
  accountName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ConnectionStatusCard({
  providerName,
  status,
  lastSyncAt,
  accountName,
  onConnect,
  onDisconnect,
  icon: Icon,
}: ConnectionStatusCardProps) {
  return (
    <Card className="hover:border-border/80 transition-all" id={`connection-card-${providerName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-foreground border border-border shrink-0">
              {Icon ? <Icon className="h-5 w-5" /> : providerName.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground leading-tight">{providerName}</h4>
              {accountName ? (
                <p className="text-[11px] text-muted-foreground truncate max-w-[150px] mt-0.5">{accountName}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">Not integrated</p>
              )}
            </div>
          </div>
          
          <Badge
            variant={
              status === 'connected' ? 'success' :
              status === 'syncing' ? 'info' :
              status === 'expired' ? 'warning' :
              status === 'error' ? 'destructive' :
              'outline'
            }
          >
            {status}
          </Badge>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Sync: {lastSyncAt ? lastSyncAt : 'Never'}</span>
          </div>
          
          {status === 'connected' || status === 'expired' || status === 'error' ? (
            <button
              onClick={onDisconnect}
              className="text-status-danger hover:underline cursor-pointer font-bold uppercase tracking-wider"
            >
              Disconnect
            </button>
          ) : (
            status === 'disconnected' && (
              <button
                onClick={onConnect}
                className="text-foreground hover:underline cursor-pointer font-bold uppercase tracking-wider"
              >
                Connect
              </button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface HealthCardProps {
  metric: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  details?: string;
}

export function HealthCard({ metric, score, status, details }: HealthCardProps) {
  return (
    <Card className="overflow-hidden" id={`health-card-${metric.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{metric}</span>
          <div className="flex items-center gap-1.5">
            {status === 'healthy' ? (
              <ShieldCheck className="h-4 w-4 text-status-success" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-status-warning" />
            )}
            <span className="text-xs font-mono font-bold uppercase">
              {status}
            </span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight">{score}</span>
          <span className="text-xs font-mono text-muted-foreground">/100</span>
        </div>
        
        {details && (
          <p className="text-[11px] text-muted-foreground leading-normal mt-2">
            {details}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
