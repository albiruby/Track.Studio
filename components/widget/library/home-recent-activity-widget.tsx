/**
 * Track.Studio — Recent Ingested Activity Widget (home_recent_activity)
 * Renders details about the last webhook session.
 */

'use client';

import React from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { ShieldAlert, Zap, Heart, Flame, Calendar, RefreshCw, ArrowRight } from 'lucide-react';
import { useInteractiveWorkspace } from '@/providers/interactive-workspace-provider';

export function HomeRecentActivityWidget({ widgetId, viewModel }: WidgetRenderProps) {
  const { setSelectedActivityId } = useInteractiveWorkspace();
  
  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        No recent activity synchronized.
      </div>
    );
  }

  const validation = WidgetValidation.validateRecentActivity(viewModel);
  if (!validation.isValid) {
    return (
      <div className="p-5 border border-status-danger/35 bg-status-danger/5 text-status-danger rounded-xl flex items-start gap-3 select-none">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold uppercase block mb-1">Data Stream Error:</span>
          {validation.error}
        </div>
      </div>
    );
  }

  const {
    title,
    sportType,
    distanceMeters,
    durationSeconds,
    averageHeartRate,
    maxHeartRate,
    averagePace,
    runningStressScore,
    intensityFactor,
    efficiencyFactor,
    aerobicDecoupling,
    source,
    timestamp,
    isCalibrated
  } = viewModel;

  const distanceKm = (distanceMeters / 1000).toFixed(2);
  const durationMin = Math.floor(durationSeconds / 60);
  const durationSec = durationSeconds % 60;
  const formattedDuration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;
  const dateFormatted = new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      onClick={() => {
        setSelectedActivityId('run_1');
        window.location.hash = '#activity_analysis';
      }}
      className="p-4 sm:p-5 h-full flex flex-col justify-between select-none cursor-pointer hover:bg-primary/5 transition-all duration-150 group/card" 
      id="widget-recent-activity"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary py-0.5 px-1.5 rounded uppercase">
              Latest Workout Analysis
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1.5 truncate uppercase tracking-tight">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mt-1">
              <Calendar className="h-3 w-3" />
              <span>{dateFormatted}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[9px] font-bold">
            <span className={`px-1.5 py-0.5 rounded uppercase ${source === 'strava' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
              {source}
            </span>
            {isCalibrated ? (
              <span className="bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded uppercase">
                Calibrated
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-500 px-1 py-0.5 rounded uppercase animate-pulse">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-2 border border-border bg-muted/20 rounded text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase block">Distance:</span>
            <span className="text-sm font-bold font-mono tracking-tight block mt-0.5">{distanceKm}km</span>
          </div>
          <div className="p-2 border border-border bg-muted/20 rounded text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase block">Duration:</span>
            <span className="text-sm font-bold font-mono tracking-tight block mt-0.5">{formattedDuration}</span>
          </div>
          <div className="p-2 border border-border bg-muted/20 rounded text-center">
            <span className="text-[8px] font-mono text-muted-foreground uppercase block">Avg Pace:</span>
            <span className="text-sm font-bold font-mono tracking-tight block mt-0.5">{averagePace}/km</span>
          </div>
        </div>

        {/* Math & Decoupling Indices */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">Running Stress (RSS):</span>
              <span className="font-bold flex items-center gap-1 text-status-warning">
                <Flame className="h-3.5 w-3.5" />
                {runningStressScore.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">Intensity Factor (IF):</span>
              <span className="font-bold text-foreground">
                {intensityFactor.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2 font-mono text-[10px]">
            <div className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">Efficiency Factor (EF):</span>
              <span className="font-bold text-foreground">
                {efficiencyFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-1">
              <span className="text-muted-foreground">Aerobic Decoupling:</span>
              <span className={`font-bold ${aerobicDecoupling && aerobicDecoupling > 0.05 ? 'text-status-danger' : 'text-status-success'}`}>
                {aerobicDecoupling !== null ? `${(aerobicDecoupling * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {aerobicDecoupling && aerobicDecoupling > 0.05 && (
        <div className="mt-4 p-2.5 rounded bg-status-danger/5 border border-status-danger/25 text-[9px] font-mono text-status-danger leading-normal flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>CARDIAC DECOUPLING HIGHER THAN 5%: DECONDITIONING OR THERMAL ELEVATION DETECTED</span>
        </div>
      )}
    </div>
  );
}
