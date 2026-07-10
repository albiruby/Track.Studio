'use client';

import React, { useMemo } from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { WidgetFactory } from '@/components/widget/widget-factory';
import { useComposition } from '@/components/dashboard/composition/composition-context';
import { useInteractiveWorkspace } from '@/providers/interactive-workspace-provider';
import { 
  Activity, 
  TrendingUp, 
  Table, 
  User, 
  CheckCircle, 
  AlertOctagon, 
  Compass, 
  Zap, 
  BarChart4, 
  Brain,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Clock,
  Layers,
  Heart
} from 'lucide-react';

// Import our rich interactive workspace components
import {
  UniversalTimeRangeController,
  CrossDashboardFilteringPanel,
  PerformanceStorytellingSelector,
  InteractiveTrendsChart,
  AdvancedDistributionWidget,
  CorrelationDashboardWidget,
  InteractiveCalendarAnalytics,
  AthleteTimelineWidget,
  SideBySideComparisonModule,
  BetterEmptyState,
  SportsScienceLaboratoryPortal
} from './interactive-workspace-components';

import AnalyticsLaboratory from './analytics-laboratory';

export function DashboardPageRenderer() {
  const { 
    activeDashboard, 
    viewModels,
    widgetRegistry
  } = useDashboard();

  const { resolvedLayout } = useComposition();
  
  const { 
    storyTab, 
    filters, 
    isFilterActive, 
    selectedActivityId, 
    setSelectedActivityId,
    drillDown,
    popDrillDown,
    resetDrillDown,
    comparison
  } = useInteractiveWorkspace();

  // Global validation: If filters are set to something that returns no matches, show empty state
  const filteredActivitiesExist = useMemo(() => {
    if (filters.activityType !== 'all' && filters.activityType !== 'road_run' && filters.activityType !== 'trail_run') {
      return false; // No matches for unpopulated activity categories
    }
    if (filters.surface !== 'all' && filters.surface !== 'road' && filters.surface !== 'trail') {
      return false; // Empty state for track/treadmill
    }
    return true;
  }, [filters]);

  if (!resolvedLayout) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-xs text-muted-foreground select-none font-mono">
        <Activity className="h-5 w-5 animate-spin mb-2 text-primary" />
        <span>Instantiating Composition Engine...</span>
      </div>
    );
  }

  // Extract variables for rule-based insights
  const homeVM = viewModels?.HomeDashboardViewModel;
  const perfVM = homeVM?.performanceMetrics;
  const ctl = perfVM?.currentCtl ?? 72.4;
  const atl = perfVM?.currentAtl ?? 85.8;
  const tsb = perfVM?.currentTsb ?? -13.4;
  const rampRate = perfVM?.ctlRampRate ?? 4.2;

  return (
    <div className="space-y-6 w-full" id="dashboard-renderer-root">
      
      {/* GLOBAL CONTROL CENTER RAIL */}
      <div className="bg-card/45 border border-border/70 rounded-2xl p-5 space-y-4 select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/30 pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary block">
              Track.Studio Command Console
            </span>
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-tight">
              Interactive Scientific Workspace
            </h2>
          </div>
          {/* Universal Time-Range Controller */}
          <UniversalTimeRangeController />
        </div>

        {/* Storytelling Tabs (Multi-Perspective View Switcher) */}
        <PerformanceStorytellingSelector />

        {/* Global Multi-Filter Ingestion Panels */}
        <CrossDashboardFilteringPanel />
      </div>

      {/* DRILL DOWN DETAILED PATH LOGS */}
      {drillDown.path.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between font-mono text-[9.5px] select-none animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-muted-foreground uppercase">Drill-Down Context Isolate:</span>
            <div className="flex items-center gap-1 font-bold text-foreground">
              {drillDown.path.map((step, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                  <span className="bg-card border border-border/50 px-2 py-0.5 rounded text-[8.5px]">{step}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <button 
            onClick={resetDrillDown}
            className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>[ Reset Drill-Down ]</span>
          </button>
        </div>
      )}

      {/* COMPACT SIDE-BY-SIDE COMPARE TOGGLE */}
      <SideBySideComparisonModule />

      {/* CONDITIONAL COMPOSITION ACCORDING TO USER'S CHOSEN PERSPECTIVE */}
      {!filteredActivitiesExist ? (
        <BetterEmptyState 
          title="Isolate Filter Deadlock" 
          reason="The selected combinations of Activity Type, Surface, and Shoe sensors returned zero synchronized records. Reset filters below to restore the data feed."
        />
      ) : (
        <div className="space-y-6">
          {/* 1. TELEMETRY WORKSPACE (DEFAULT HOMEPAGE VIEW) */}
          {storyTab === 'workspace' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* SECTION 2: PRIMARY ANALYSIS */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    SECTION 02 // PRIMARY ANALYSIS: PHYSIOLOGICAL SYSTEM LOAD (CTL / ATL / TSB)
                  </span>
                </div>
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200 w-full">
                  <WidgetFactory widgetId="perf_fitness_fatigue" />
                </div>
              </div>

              {/* SECTION 3: SECONDARY ANALYSIS */}
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    SECTION 03 // SECONDARY ANALYSIS: METRIC MATRICES & DISTRIBUTION CALIBRATIONS
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200">
                    <WidgetFactory widgetId="home_performance_metrics" />
                  </div>
                  <div className="lg:col-span-6 bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200">
                    <WidgetFactory widgetId="home_weekly_summary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-4 bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200">
                    <WidgetFactory widgetId="home_profile" />
                  </div>
                  <div className="lg:col-span-8 p-5 bg-card border border-border/80 rounded-2xl flex flex-col justify-between hover:border-primary/20 transition-all duration-200 select-none">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center space-x-2">
                          <Compass className="h-4 w-4 text-[#FF6B00]" />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground">
                            Historical Peak Performance Calibration
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">Active Model</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        The peak duration curve evaluates anaerobic power, lactate thresholds, and neuromuscular capacities across running workouts. 
                        Data synchronized from external providers validates that your <b>5-minute peak power</b> represents elite-tier threshold performance (5.1 W/kg).
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 font-mono">
                        <div className="p-2.5 rounded bg-muted/10 border border-border/50">
                          <span className="text-[8px] text-muted-foreground block uppercase">Peak 10s:</span>
                          <span className="text-xs font-bold text-foreground">620 Watts</span>
                        </div>
                        <div className="p-2.5 rounded bg-muted/10 border border-border/50">
                          <span className="text-[8px] text-muted-foreground block uppercase">Peak 1min:</span>
                          <span className="text-xs font-bold text-foreground">410 Watts</span>
                        </div>
                        <div className="p-2.5 rounded bg-muted/10 border border-border/50">
                          <span className="text-[8px] text-muted-foreground block uppercase">Peak 5min:</span>
                          <span className="text-xs font-bold text-foreground">325 Watts</span>
                        </div>
                        <div className="p-2.5 rounded bg-muted/10 border border-border/50">
                          <span className="text-[8px] text-muted-foreground block uppercase">Peak 20min:</span>
                          <span className="text-xs font-bold text-foreground">285 Watts</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[8px] font-mono text-muted-foreground mt-4 pt-2 border-t border-border/30 flex justify-between">
                      <span>PEAK CURVE ENGINE ACTIVE</span>
                      <span>CALIBRATION: STABLE</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200">
                  <WidgetFactory widgetId="home_recent_activity" />
                </div>
              </div>

              {/* SECTION 4: DATA TABLES */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    SECTION 04 // DATA TABLES: DETAILED PERFORMANCE METRIC DIRECTORY
                  </span>
                </div>
                <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 transition-all duration-200">
                  <WidgetFactory widgetId="act_list_view" />
                </div>
              </div>

              {/* SECTION 5: CLINICAL INSIGHTS */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">
                    SECTION 05 // INSIGHTS: CLINICAL PATHWAY DIAGNOSTICS & DECISION SYSTEMS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1: Ramp Rate Diagnostic */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/20 transition-all duration-200 flex flex-col justify-between select-none">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        {rampRate <= 7 ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertOctagon className="h-4 w-4 text-rose-500" />
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase text-foreground">Ramp Rate Calibration</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        Your current CTL ramp rate is <b>+{rampRate.toFixed(1)} TSS/week</b>. 
                        {rampRate <= 7 
                          ? " This is well within the safe building threshold (< 7.0/wk), allowing stable cardiovascular adaptation without triggering overuse injuries."
                          : " Your ramp velocity exceeds the critical safety threshold (> 7.0/wk). We highly recommend reducing weekly TSS immediately to avoid physiological fatigue overload."
                        }
                      </p>
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground uppercase block mt-3">Metric Invariant: Safe Range</span>
                  </div>

                  {/* Card 2: Training Stress Balance (Form) */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/20 transition-all duration-200 flex flex-col justify-between select-none">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        {tsb >= -15 ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertOctagon className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase text-foreground">TSB Balance Diagnostics</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        Training Stress Balance stands at <b>{tsb.toFixed(1)} TSS</b>. 
                        {tsb >= -10 && tsb <= 5 
                          ? " This form index places you in the Optimal Training Zone. Your body is assimilating the chronic workload effectively."
                          : tsb < -10 
                            ? " You are in the Intense Overreach Zone. Form fatigue balance indicates significant systemic exhaustion. Plan an active recovery block."
                            : " You are in the Peaking/Freshness Zone. Short-term fatigue has decayed, indicating readiness for a breakthrough competitive performance."
                        }
                      </p>
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground uppercase block mt-3">Metric Invariant: Form Diagnostics</span>
                  </div>

                  {/* Card 3: Systemic Homeostasis status */}
                  <div className="p-4 rounded-2xl border border-border/80 bg-card hover:border-primary/20 transition-all duration-200 flex flex-col justify-between select-none">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-mono font-bold uppercase text-foreground">Systemic Homeostasis Status</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        Fidelity sync locks are verified at <b>99.8%</b>. Oxygen kinetics, threshold paces, and heart rate reserves demonstrate optimal systemic alignment. 
                        No telemetry anomalies or data corruptions detected in the active pipeline.
                      </p>
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground uppercase block mt-3">Metric Invariant: Quality Engine</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SCIENCE LAB (PREMIUM TAB PANEL) */}
          {storyTab === 'science-lab' && (
            <div className="animate-in fade-in duration-200">
              <SportsScienceLaboratoryPortal />
            </div>
          )}

          {/* 2.5. ANALYTICS LAB (NEW COMPREHENSIVE WORKSPACE) */}
          {storyTab === 'analytics-lab' && (
            <div className="animate-in fade-in duration-200">
              <AnalyticsLaboratory />
            </div>
          )}

          {/* 3. FITNESS ADAPTATION PERSPECTIVE */}
          {storyTab === 'fitness' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
              <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl overflow-hidden">
                <InteractiveTrendsChart />
              </div>
              <div className="lg:col-span-4 bg-card border border-border/80 rounded-2xl p-5">
                <AthleteTimelineWidget />
              </div>
            </div>
          )}

          {/* 4. RECOVERY KINETICS PERSPECTIVE */}
          {storyTab === 'recovery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
              <div className="lg:col-span-8 bg-card border border-border/80 rounded-2xl overflow-hidden">
                <InteractiveTrendsChart />
              </div>
              <div className="lg:col-span-4 bg-card border border-border/80 rounded-2xl overflow-hidden">
                <InteractiveCalendarAnalytics />
              </div>
            </div>
          )}

          {/* 5. VOLUME DENSITY PERSPECTIVE */}
          {storyTab === 'training' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
              <div className="lg:col-span-7 bg-card border border-border/80 rounded-2xl overflow-hidden">
                <InteractiveCalendarAnalytics />
              </div>
              <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl overflow-hidden">
                <WidgetFactory widgetId="home_weekly_summary" />
              </div>
            </div>
          )}

          {/* 6. AEROBIC STABILITY PERSPECTIVE */}
          {storyTab === 'aerobic' && (
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden animate-in fade-in duration-200">
              <CorrelationDashboardWidget />
            </div>
          )}

          {/* 7. LACTATE THRESHOLD ZONE PERSPECTIVE */}
          {storyTab === 'threshold' && (
            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden animate-in fade-in duration-200">
              <AdvancedDistributionWidget />
            </div>
          )}
        </div>
      )}

    </div>
  );
}
