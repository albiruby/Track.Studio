/**
 * Track.Studio — Weekly Training Volume Breakdown Widget (home_weekly_summary)
 * Renders weekly volume progress bars and daily bars breakdown.
 */

'use client';

import React from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { WeeklySummaryViewModel } from '@/lib/widget/contracts';
import { ShieldAlert, Compass, Calendar, Sparkles } from 'lucide-react';

export function HomeWeeklySummaryWidget({ widgetId, viewModel }: WidgetRenderProps) {
  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        No weekly metrics ingested.
      </div>
    );
  }

  const validation = WidgetValidation.validateWeeklySummary(viewModel);
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
    currentWeekDistanceKm,
    currentWeekDurationMinutes,
    currentWeekRss,
    targetDistanceKm,
    targetRss,
    variancePercent,
    dailyBreakdown
  } = viewModel as WeeklySummaryViewModel;

  const distanceProgress = Math.min(100, (currentWeekDistanceKm / targetDistanceKm) * 100);
  const rssProgress = Math.min(100, (currentWeekRss / targetRss) * 100);

  // Find max daily distance for height scaling
  const maxDayDistance = Math.max(...dailyBreakdown.map((d) => d.distanceKm), 1);

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between select-none" id="widget-weekly-summary">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary py-0.5 px-1.5 rounded uppercase">
            Weekly Progression summary
          </span>
          <span className={`text-[10px] font-mono font-bold ${variancePercent >= 0 ? 'text-status-success' : 'text-muted-foreground'}`}>
            {variancePercent >= 0 ? `+${variancePercent.toFixed(1)}%` : `${variancePercent.toFixed(1)}%`} VS TARGET
          </span>
        </div>

        {/* Accumulated Stats vs targets */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-bold text-foreground">
                {currentWeekDistanceKm.toFixed(1)} / {targetDistanceKm} km
              </span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${distanceProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-muted-foreground">Training Stress:</span>
              <span className="font-bold text-foreground">
                {currentWeekRss.toFixed(0)} / {targetRss} RSS
              </span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-status-warning h-full transition-all duration-500 rounded-full"
                style={{ width: `${rssProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily high density breakdown visualizer */}
        <div className="mt-5">
          <span className="text-[9px] font-mono font-bold text-muted-foreground block uppercase">
            Daily Accumulation Matrix:
          </span>
          
          <div className="flex items-end justify-between gap-2.5 h-16 mt-3 px-1">
            {dailyBreakdown.map((dayData, index) => {
              const heightPercent = (dayData.distanceKm / maxDayDistance) * 100;
              return (
                <div key={dayData.day} className="flex-1 flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-foreground text-background font-mono text-[8px] p-1 rounded whitespace-nowrap shadow-sm">
                    {dayData.distanceKm.toFixed(1)}km • {dayData.rss.toFixed(0)}RSS
                  </div>

                  <div className="w-full bg-secondary/40 rounded-t h-16 flex items-end overflow-hidden">
                    <div 
                      className="bg-primary hover:bg-primary/80 transition-all rounded-t w-full"
                      style={{ height: `${heightPercent || 5}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-mono font-bold text-muted-foreground mt-1.5">
                    {dayData.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-3 border-t border-border/40">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Active Volume: {currentWeekDurationMinutes} mins</span>
        </div>
        <span>Microcycle: 13 / 52</span>
      </div>
    </div>
  );
}
