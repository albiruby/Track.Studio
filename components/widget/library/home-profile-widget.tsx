/**
 * Track.Studio — Athlete Profile Context Widget (home_profile)
 * Pristine structural display of physiological parameters.
 */

'use client';

import React from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { User, Activity, Flame, ShieldAlert } from 'lucide-react';

export function HomeProfileWidget({ widgetId, viewModel }: WidgetRenderProps) {
  // If no viewModel is provided, show fallback loading empty state
  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        Profile Ingestion Missing
      </div>
    );
  }

  // Runtime validation check
  const validation = WidgetValidation.validateHomeProfile(viewModel);
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
    name,
    email,
    gender,
    weightKg,
    restingHr,
    maxHr,
    ftpWatts,
    vo2max,
    avatarUrl,
    calculatedThresholds
  } = viewModel;

  const hrr = maxHr - restingHr;
  const wattsPerKg = (ftpWatts / weightKg).toFixed(2);

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between select-none" id="widget-athlete-profile-card">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={name} 
            className="h-12 w-12 rounded-full border border-border bg-muted shrink-0 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-12 w-12 rounded-full border border-border bg-secondary flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{name}</h3>
          <p className="text-[10px] text-muted-foreground font-mono truncate lowercase">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="space-y-3.5">
          <div className="p-2.5 rounded bg-muted/30 border border-border/50">
            <span className="text-[9px] font-mono font-bold text-muted-foreground block uppercase">Resting Thresholds:</span>
            <span className="text-xs font-mono font-bold text-foreground block mt-0.5">{restingHr} / {maxHr} <b className="text-[9px] font-medium text-muted-foreground uppercase">BPM</b></span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-0.5">HR Reserve: {hrr} BPM</span>
          </div>

          <div className="p-2.5 rounded bg-muted/30 border border-border/50">
            <span className="text-[9px] font-mono font-bold text-muted-foreground block uppercase">Calculated Zones:</span>
            <span className="text-[9px] font-mono text-muted-foreground block mt-1">Resting: <b className="text-foreground">{calculatedThresholds.restingPace}</b></span>
            <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">Aerobic: <b className="text-foreground">{calculatedThresholds.aerobicThresholdPace}</b></span>
            <span className="text-[9px] font-mono text-muted-foreground block mt-0.5">Lactate: <b className="text-foreground">{calculatedThresholds.lactateThresholdPace}</b></span>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="p-2.5 rounded bg-muted/30 border border-border/50">
            <span className="text-[9px] font-mono font-bold text-muted-foreground block uppercase">Aerobic Power:</span>
            <span className="text-xs font-mono font-bold text-foreground block mt-0.5">{ftpWatts} <b className="text-[9px] font-medium text-muted-foreground uppercase">Watts</b></span>
            <span className="text-[8px] font-mono text-muted-foreground block mt-0.5">Power Ratio: {wattsPerKg} W/kg</span>
          </div>

          <div className="p-2.5 rounded bg-muted/30 border border-border/50">
            <span className="text-[9px] font-mono font-bold text-muted-foreground block uppercase">VO2 Max Capacity:</span>
            <span className="text-xs font-mono font-bold text-status-success block mt-0.5">{vo2max} <b className="text-[9px] font-medium text-muted-foreground uppercase">ml/kg/min</b></span>
            <span className="text-[8px] font-mono text-status-success font-bold block mt-0.5">LEVEL: ELITE ATHLETE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
