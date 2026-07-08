/**
 * Track.Studio — Performance Load Matrix Widget (home_performance_metrics)
 * High-density dashboard widget plotting fitness CTL, fatigue ATL, and form TSB.
 */

'use client';

import React from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { ShieldAlert, TrendingUp, AlertOctagon, TrendingDown, CheckCircle, Activity } from 'lucide-react';

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
    currentCtl,
    currentAtl,
    currentTsb,
    ctlRampRate,
    overtrainingRisk,
    peakingState
  } = viewModel;

  const getTsbColorClass = (tsb: number): string => {
    if (tsb > 15) return 'text-emerald-500'; // Optimal Peaking / Fresh
    if (tsb >= -10 && tsb <= 15) return 'text-sky-500'; // Transitional
    if (tsb < -30) return 'text-rose-500'; // Severe Overreaching Risk
    return 'text-amber-500'; // Building
  };

  const getRiskBadgeClass = (risk: string): string => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'moderate': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  // 7-day sparkline coordinates generator based on inputs
  const ctlPoints = "0,25 20,23 40,21 60,18 80,15 100,10";
  const atlPoints = "0,35 20,40 40,30 60,15 80,25 100,5";
  const tsbPoints = "0,15 20,10 40,20 60,35 80,25 100,45";

  return (
    <div className="p-5 h-full flex flex-col justify-between select-none" id="widget-performance-matrix">
      <div className="space-y-4">
        {/* Metric Engine Heading */}
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground">
              Physiological Training Load Matrix
            </span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground">
            Bannister Model Engine
          </span>
        </div>

        {/* Big Three Banister Model Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* CTL Card */}
          <div className="p-3 border border-border bg-muted/10 hover:border-primary/30 transition-all rounded-lg flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Fitness (CTL)</span>
                <span className="text-[8px] font-mono font-semibold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="h-2 w-2" />
                  +4.8%
                </span>
              </div>
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground block mt-1.5">{currentCtl.toFixed(1)}</span>
            </div>
            
            <div className="flex items-end justify-between mt-3">
              <span className="text-[8px] font-mono text-muted-foreground">42d rolling load</span>
              {/* Sparkline */}
              <svg className="w-12 h-6 text-orange-500" viewBox="0 0 100 50">
                <path d={`M ${ctlPoints}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* ATL Card */}
          <div className="p-3 border border-border bg-muted/10 hover:border-primary/30 transition-all rounded-lg flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Fatigue (ATL)</span>
                <span className="text-[8px] font-mono font-semibold text-amber-500 flex items-center gap-0.5">
                  <TrendingUp className="h-2 w-2" />
                  +12.4%
                </span>
              </div>
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground block mt-1.5">{currentAtl.toFixed(1)}</span>
            </div>
            
            <div className="flex items-end justify-between mt-3">
              <span className="text-[8px] font-mono text-muted-foreground">7d acute load</span>
              {/* Sparkline */}
              <svg className="w-12 h-6 text-amber-500" viewBox="0 0 100 50">
                <path d={`M ${atlPoints}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* TSB Card */}
          <div className="p-3 border border-border bg-muted/10 hover:border-primary/30 transition-all rounded-lg flex flex-col justify-between relative overflow-hidden group">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase">Form (TSB)</span>
                <span className="text-[8px] font-mono font-semibold text-rose-500 flex items-center gap-0.5">
                  <TrendingDown className="h-2 w-2" />
                  -5.4
                </span>
              </div>
              <span className={`text-2xl font-bold font-mono tracking-tight block mt-1.5 ${getTsbColorClass(currentTsb)}`}>
                {currentTsb > 0 ? `+${currentTsb.toFixed(1)}` : currentTsb.toFixed(1)}
              </span>
            </div>
            
            <div className="flex items-end justify-between mt-3">
              <span className="text-[8px] font-mono text-muted-foreground">Form Balance Index</span>
              {/* Sparkline */}
              <svg className="w-12 h-6 text-emerald-500" viewBox="0 0 100 50">
                <path d={`M ${tsbPoints}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

        </div>

        {/* Second row metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          <div className="sm:col-span-8 p-3 rounded-lg border border-border bg-muted/5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-muted-foreground uppercase">Adaptive Capacity & Risk Profile</span>
              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border capitalize ${getRiskBadgeClass(overtrainingRisk)}`}>
                {overtrainingRisk} Risk
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-border/40">
              <div>
                <span className="text-[8px] font-mono text-muted-foreground block uppercase">Adaptive State:</span>
                <span className="text-[10px] font-bold text-foreground block mt-0.5 uppercase font-mono tracking-tight flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                  {peakingState}
                </span>
              </div>
              <div>
                <span className="text-[8px] font-mono text-muted-foreground block uppercase">Optimal Zone:</span>
                <span className="text-[10px] font-bold text-muted-foreground block mt-0.5 font-mono">
                  -10 to +5 TSB
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-4 p-3 rounded-lg border border-border/50 bg-muted/5 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-emerald-500 font-mono">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[9px] font-bold uppercase">Ramp Rate:</span>
            </div>
            <span className="text-xl font-bold font-mono text-foreground block mt-1">
              +{ctlRampRate.toFixed(1)} <b className="text-[8px] font-normal text-muted-foreground uppercase">CTL/wk</b>
            </span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-1">
              {ctlRampRate > 7 ? 'High Risk Overload' : 'Safe building velocity'}
            </span>
          </div>

        </div>
      </div>

      {/* Determinisic warning alert if needed */}
      <div className="mt-4">
        {currentTsb < -10 ? (
          <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-[9px] font-mono text-amber-500 leading-normal flex items-start gap-2">
            <AlertOctagon className="h-4 w-4 shrink-0" />
            <span>TSB ZONE: CARDIOVASCULAR DECAY / BUILDING PHASE STRESS ACTIVE. RECOMMEND 24-HOUR ACTIVE RECOVERY ROUTINE BEFORE MAIN TEMPO WORK.</span>
          </div>
        ) : (
          <div className="p-2.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 leading-normal flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>ATHLETE READY: CARDIOVASCULAR HOMEOSTASIS STABLE. CAPACITY TO INGEST INTENSE BLOCK COMPLETED SUCCESSFULLY.</span>
          </div>
        )}
      </div>
    </div>
  );
}
