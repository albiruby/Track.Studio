/**
 * Track.Studio — Fitness & Fatigue Trends Widget (perf_fitness_fatigue)
 * Adapts performance histories to Visualization Models and renders charts.
 */

'use client';

import React, { useMemo } from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { VisualizationBuilder } from '@/lib/visualization/builder';
import { VisualizationFactory } from '@/components/visualization/visualization-factory';
import { ShieldAlert, Info } from 'lucide-react';

export function PerfFitnessFatigueWidget({ widgetId, viewModel }: WidgetRenderProps) {
  // Construct Visualization Model dynamically using the Visualization Engine Builder
  const visualizationModel = useMemo(() => {
    if (!viewModel) return null;
    const validation = WidgetValidation.validatePerformanceTrend(viewModel);
    if (!validation.isValid) return null;

    try {
      return VisualizationBuilder.build('perf-trend', viewModel, {
        xAxisKey: 'date',
        xAxisLabel: 'Timeline',
        xAxisScale: 'categorical',
        yAxisKey: 'ctl',
        yAxisLabel: 'Stress Score',
        yAxisScale: 'linear',
        seriesKeys: [
          { key: 'ctl', label: 'CTL (Fitness)', colorPreset: 'success' },
          { key: 'atl', label: 'ATL (Fatigue)', colorPreset: 'critical' },
          { key: 'tsb', label: 'TSB (Form)', colorPreset: 'warning' }
        ]
      });
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }, [viewModel]);

  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        No fatigue-fitness trend data ingested.
      </div>
    );
  }

  const validation = WidgetValidation.validatePerformanceTrend(viewModel);
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

  if (!visualizationModel) {
    return (
      <div className="p-5 border border-status-danger/35 bg-status-danger/5 text-status-danger rounded-xl flex items-start gap-3 select-none">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold uppercase block mb-1">Visualization Error:</span>
          Failed to build presentation-ready model from trend dataset.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between select-none" id="widget-fitness-fatigue-trends">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-1.5 rounded uppercase">
            Endurance Adaptations Trend
          </span>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">
            Mode: EWMA (42/7 Days)
          </span>
        </div>

        {/* Dynamic visualization factor charting container */}
        <div className="w-full">
          <VisualizationFactory model={visualizationModel} />
        </div>
      </div>

      <div className="mt-4 p-2.5 rounded bg-muted/30 border border-border/50 text-[9px] font-mono text-muted-foreground leading-normal flex items-start gap-2">
        <Info className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
        <span>Fitness (CTL) tracks the 42-day rolling load, representing chronic aerobic adaptation. Short-term volume jumps are flagged in Fatigue (ATL).</span>
      </div>
    </div>
  );
}
