/**
 * Track.Studio — Performance Load Matrix Widget (home_performance_metrics)
 * High-density dashboard widget plotting fitness CTL, fatigue ATL, and form TSB.
 */

'use client';

import React from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { ShieldAlert, Compass, Flame, TrendingUp, AlertOctagon } from 'lucide-react';

export function HomePerformanceMetricsWidget({ widgetId, viewModel }: WidgetRenderProps) {
  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        No performance metrics ingested.
      </div>
    );
  }

  const validation = WidgetValidation.validatePerformanceMetrics(viewModel);
  if (!validation.isValid) {
    return (
      <div className="p-5 border border-status-danger/35 bg-status-danger/5 text-status-danger rounded-lg flex items-start gap-3 select-none">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div className="text-xs font-mono leading-relaxed">
          <span className="font-bold uppercase block mb-1">CONTRACT VALIDATION ERROR:</span>
          {validation.error}
        </div>
      </div>
    );
  }

  const {
    currentCtl,
    currentAtl,
    currentTsb,
    ctlRampRate,
    overtrainingRisk,
    peakingState
  } = viewModel;

  const getTsbColorClass = (tsb: number): string => {
    if (tsb > 15) return 'text-status-success'; // Optimal Peaking / Fresh
    if (tsb >= -10 && tsb <= 15) return 'text-status-info'; // Transistional
    if (tsb < -30) return 'text-status-danger'; // Severe Overreaching Risk
    return 'text-status-warning'; // Building
  };

  const getRiskBadgeClass = (risk: string): string => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'moderate': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between select-none" id="widget-performance-matrix">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold bg-secondary py-0.5 px-1.5 rounded text-muted-foreground uppercase">
            Banister Adaptation Model
          </span>
          <span className="text-[9px] font-mono font-bold text-muted-foreground">
            CTL COUPLING DECAY: EXPONENTIAL
          </span>
        </div>

        {/* Big Three Banister Model Values */}
        <div className="grid grid-cols-3 gap-3.5 mt-5">
          <div className="p-3 border border-border bg-muted/20 rounded-lg relative overflow-hidden">
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Fitness (CTL):</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground block mt-1">{currentCtl.toFixed(1)}</span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-1">42-day rolling Stress</span>
          </div>

          <div className="p-3 border border-border bg-muted/20 rounded-lg relative overflow-hidden">
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Fatigue (ATL):</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground block mt-1">{currentAtl.toFixed(1)}</span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-1">7-day rolling Stress</span>
          </div>

          <div className="p-3 border border-border bg-muted/20 rounded-lg relative overflow-hidden">
            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Form (TSB):</span>
            <span className={`text-2xl font-bold font-mono tracking-tight block mt-1 ${getTsbColorClass(currentTsb)}`}>
              {currentTsb > 0 ? `+${currentTsb.toFixed(1)}` : currentTsb.toFixed(1)}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-1">Form Balance Index</span>
          </div>
        </div>

        {/* Second row metadata */}
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="space-y-2.5">
            <div>
              <span className="text-[8px] font-mono text-muted-foreground block uppercase">Overtraining Stress Risk:</span>
              <span className={`inline-block text-[10px] font-bold font-mono py-0.5 px-2 rounded border mt-1 capitalize ${getRiskBadgeClass(overtrainingRisk)}`}>
                {overtrainingRisk} Risk
              </span>
            </div>

            <div>
              <span className="text-[8px] font-mono text-muted-foreground block uppercase">Adaptive State:</span>
              <span className="text-[11px] font-bold text-foreground block mt-1 uppercase font-mono tracking-tight">
                {peakingState}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border/50 bg-muted/20 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-status-success font-mono">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[9px] font-bold uppercase">Ramp Velocity:</span>
            </div>
            <span className="text-base font-bold font-mono text-foreground block mt-1.5">
              +{ctlRampRate.toFixed(1)} <b className="text-[9px] font-normal text-muted-foreground uppercase">CTL/wk</b>
            </span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-1">
              {ctlRampRate > 7 ? 'Ramp rate is high risk' : 'Safe building range'}
            </span>
          </div>
        </div>
      </div>

      {currentTsb < -20 && (
        <div className="mt-4 p-2.5 rounded bg-status-danger/5 border border-status-danger/25 text-[9px] font-mono text-status-danger leading-normal flex items-start gap-2">
          <AlertOctagon className="h-4 w-4 shrink-0" />
          <span>TSB ZONE CRITICAL: SHORT-TERM OVERREACHING DETECTED. WE RECOMMEND IMMEDIATE 48-HOUR RECOVERY STRATEGY.</span>
        </div>
      )}
    </div>
  );
}
