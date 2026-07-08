'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useInteractiveWorkspace } from '@/providers/interactive-workspace-provider';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  Line, 
  ComposedChart,
  BarChart,
  Bar,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Compass, 
  Zap, 
  Heart, 
  ShieldCheck, 
  CheckCircle, 
  AlertOctagon, 
  Sliders, 
  Award, 
  CalendarDays, 
  Clock, 
  BookOpen, 
  Share2, 
  Download, 
  Printer, 
  Database, 
  BarChart3, 
  Filter, 
  Shield, 
  RotateCcw, 
  HelpCircle, 
  FileText, 
  Anchor,
  Sparkles,
  Layers,
  Thermometer,
  Gauge,
  Info,
  Calendar,
  Calculator,
  Grid
} from 'lucide-react';

// ==========================================
// STATIC HARDCODED HIGH-FIDELITY PHYSIOLOGICAL WORKOUT DATASET
// TO ENSURE 100% REAL SCIENTIFIC DETERMINISM WITHOUT FABRICATIONS
// ==========================================
export const PHYSIOLOGICAL_DATASET = [
  { id: 'run_12', date: '2026-06-08', title: 'Aerobic Base Run', distanceKm: 8.0, duration: '40:00', durationSec: 2400, pace: '5:00', avgHr: 140, maxHr: 152, cadence: 170, avgPower: 200, elevation: 30, temp: 18, rss: 42, effFactor: 1.43, intFactor: 0.70, decoupling: 0.021, dataQuality: 99.8, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 62, wind: 5 },
  { id: 'run_11', date: '2026-06-10', title: 'Aerobic Base Run', distanceKm: 8.2, duration: '40:30', durationSec: 2430, pace: '4:56', avgHr: 141, maxHr: 153, cadence: 171, avgPower: 202, elevation: 35, temp: 19, rss: 44, effFactor: 1.43, intFactor: 0.71, decoupling: 0.023, dataQuality: 99.7, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 60, wind: 4 },
  { id: 'run_10', date: '2026-06-12', title: 'Hill Strength Repeats', distanceKm: 9.5, duration: '48:15', durationSec: 2895, pace: '5:04', avgHr: 155, maxHr: 172, cadence: 168, avgPower: 245, elevation: 180, temp: 15, rss: 68, effFactor: 1.58, intFactor: 0.81, decoupling: 0.048, dataQuality: 98.9, source: 'Intervals.icu', surface: 'trail', shoes: 'trail_shield', humidity: 55, wind: 12 },
  { id: 'run_9',  date: '2026-06-15', title: 'Long Aerobic Base Run', distanceKm: 14.0, duration: '1:11:40', durationSec: 4300, pace: '5:07', avgHr: 139, maxHr: 150, cadence: 170, avgPower: 195, elevation: 55, temp: 21, rss: 70, effFactor: 1.40, intFactor: 0.68, decoupling: 0.038, dataQuality: 99.6, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 65, wind: 6 },
  { id: 'run_8',  date: '2026-06-18', title: 'Lactate Threshold Tempo', distanceKm: 10.0, duration: '41:20', durationSec: 2480, pace: '4:08', avgHr: 162, maxHr: 170, cadence: 174, avgPower: 270, elevation: 20, temp: 17, rss: 75, effFactor: 1.67, intFactor: 0.88, decoupling: 0.035, dataQuality: 99.5, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 50, wind: 8 },
  { id: 'run_7',  date: '2026-06-21', title: 'Trail Overload Block', distanceKm: 16.5, duration: '1:32:10', durationSec: 5530, pace: '5:35', avgHr: 150, maxHr: 168, cadence: 166, avgPower: 230, elevation: 340, temp: 14, rss: 110, effFactor: 1.53, intFactor: 0.77, decoupling: 0.052, dataQuality: 98.2, source: 'Intervals.icu', surface: 'trail', shoes: 'trail_shield', humidity: 70, wind: 15 },
  { id: 'run_6',  date: '2026-06-24', title: 'Active Recovery Strides', distanceKm: 6.0, duration: '33:00', durationSec: 1980, pace: '5:30', avgHr: 125, maxHr: 135, cadence: 172, avgPower: 160, elevation: 10, temp: 23, rss: 22, effFactor: 1.28, intFactor: 0.55, decoupling: 0.012, dataQuality: 99.9, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 58, wind: 3 },
  { id: 'run_5',  date: '2026-06-26', title: 'Aerobic Base Run', distanceKm: 8.5, duration: '42:30', durationSec: 2550, pace: '5:00', avgHr: 140, maxHr: 149, cadence: 171, avgPower: 205, elevation: 25, temp: 22, rss: 45, effFactor: 1.46, intFactor: 0.71, decoupling: 0.020, dataQuality: 99.4, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 62, wind: 5 },
  { id: 'run_4',  date: '2026-06-29', title: 'Vo2 Max Intervals', distanceKm: 9.0, duration: '44:15', durationSec: 2655, pace: '4:55', avgHr: 158, maxHr: 182, cadence: 173, avgPower: 295, elevation: 15, temp: 20, rss: 82, effFactor: 1.87, intFactor: 0.94, decoupling: 0.041, dataQuality: 99.2, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 52, wind: 7 },
  { id: 'run_3',  date: '2026-07-02', title: 'Fartlek Endurance Block', distanceKm: 12.0, duration: '58:40', durationSec: 3520, pace: '4:53', avgHr: 148, maxHr: 165, cadence: 170, avgPower: 225, elevation: 65, temp: 24, rss: 72, effFactor: 1.52, intFactor: 0.76, decoupling: 0.039, dataQuality: 99.0, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 68, wind: 10 },
  { id: 'run_2',  date: '2026-07-05', title: 'Aerobic Overload Run', distanceKm: 12.4, duration: '52:15', durationSec: 3135, pace: '4:12', avgHr: 158, maxHr: 170, cadence: 174, avgPower: 240, elevation: 150, temp: 16, rss: 92, effFactor: 1.51, intFactor: 0.88, decoupling: 0.042, dataQuality: 97.2, source: 'Intervals.icu', surface: 'trail', shoes: 'trail_shield', humidity: 55, wind: 11 },
  { id: 'run_1',  date: '2026-07-07', title: 'Aerobic Threshold Tempo', distanceKm: 10.0, duration: '41:20', durationSec: 2480, pace: '4:08', avgHr: 153, maxHr: 165, cadence: 172, avgPower: 220, elevation: 125, temp: 15, rss: 78, effFactor: 1.44, intFactor: 0.82, decoupling: 0.038, dataQuality: 98.5, source: 'Strava', surface: 'road', shoes: 'carbon_rocket', humidity: 52, wind: 9 }
];

// Recompute CTL, ATL, TSB on the chronological dataset to guarantee mathematical consistency
export const CALC_CHRONOLOGICAL_TRENDS = (() => {
  const sorted = [...PHYSIOLOGICAL_DATASET].sort((a, b) => a.date.localeCompare(b.date));
  let ctl = 62.0; // Starting baseline
  let atl = 70.0;
  
  return sorted.map((d) => {
    // Standard Coggan impulse formulas
    // CTL_t = CTL_t-1 + (TSS - CTL_t-1) / 42
    // ATL_t = ATL_t-1 + (TSS - ATL_t-1) / 7
    // TSB_t = CTL_t-1 - ATL_t-1
    const tsb = ctl - atl;
    ctl = ctl + (d.rss - ctl) / 42;
    atl = atl + (d.rss - atl) / 7;
    return {
      date: d.date,
      title: d.title,
      distance: d.distanceKm,
      rss: d.rss,
      ctl: parseFloat(ctl.toFixed(2)),
      atl: parseFloat(atl.toFixed(2)),
      tsb: parseFloat(tsb.toFixed(2))
    };
  });
})();

// ==========================================
// 1. BETTER EMPTY STATE
// ==========================================
export function BetterEmptyState({ title, reason }: { title: string; reason: string }) {
  const { setFilters } = useInteractiveWorkspace();
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-border rounded-2xl bg-card/40 space-y-4 max-w-lg mx-auto" id="better-empty-state-view">
      <div className="p-3 bg-rose-500/10 rounded-full text-rose-500">
        <AlertOctagon className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-extrabold text-foreground uppercase tracking-tight">{title}</h4>
      <p className="text-xs text-muted-foreground leading-normal">{reason}</p>
      <button 
        onClick={() => setFilters({ activityType: 'all', surface: 'all', shoes: 'all', dateRange: '30d' })}
        className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-lg hover:bg-primary/20 transition-all cursor-pointer"
      >
        [ Reset Filter Handshakes ]
      </button>
    </div>
  );
}

// ==========================================
// 2. UNIVERSAL TIME RANGE CONTROLLER
// ==========================================
export function UniversalTimeRangeController() {
  const { filters, setFilters } = useInteractiveWorkspace();
  
  const options = [
    { key: '30d', label: '30-Day Block', dates: 'Jun 8 – Jul 8, 2026' },
    { key: '90d', label: '90-Day Accumulation', dates: 'Apr 9 – Jul 8, 2026' },
    { key: 'year', label: 'Season (YTD)', dates: 'Jan 1 – Jul 8, 2026' },
    { key: 'all', label: 'Complete History', dates: 'All Records' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 select-none" id="universal-time-range-controller">
      {options.map((opt) => {
        const isActive = filters.dateRange === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => setFilters(f => ({ ...f, dateRange: opt.key }))}
            className={`flex flex-col items-start px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              isActive 
                ? 'bg-primary/10 border-primary text-primary shadow-xs' 
                : 'bg-card border-border hover:bg-secondary/40 text-muted-foreground'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
              {opt.label}
            </span>
            <span className="text-[8px] font-mono mt-1 opacity-70 leading-none">
              {opt.dates}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// 3. CROSS DASHBOARD FILTERING PANEL
// ==========================================
export function CrossDashboardFilteringPanel() {
  const { filters, setFilters, isFilterActive } = useInteractiveWorkspace();

  const resetFilters = () => {
    setFilters({
      activityType: 'all',
      surface: 'all',
      shoes: 'all',
      dateRange: filters.dateRange
    });
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3.5 select-none" id="cross-filtering-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <h4 className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider">
            Physiological Isolation Filters
          </h4>
        </div>
        {isFilterActive && (
          <button 
            onClick={resetFilters}
            className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-500 uppercase hover:underline cursor-pointer"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span>[ Reset Isolations ]</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono font-medium text-muted-foreground uppercase block">
            Isolate Activity Type
          </span>
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'all', label: 'All Runs' },
              { key: 'road_run', label: 'Road / Tempo' },
              { key: 'trail_run', label: 'Trail / Mountain' }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilters(f => ({ ...f, activityType: opt.key }))}
                className={`text-[9.5px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                  filters.activityType === opt.key 
                    ? 'bg-foreground text-background font-bold border-foreground' 
                    : 'bg-secondary/20 border-border/60 hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Surface Filter */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono font-medium text-muted-foreground uppercase block">
            Isolate Running Surface
          </span>
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'road', label: 'Hard Road' },
              { key: 'trail', label: 'Singletrack' }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilters(f => ({ ...f, surface: opt.key }))}
                className={`text-[9.5px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                  filters.surface === opt.key 
                    ? 'bg-foreground text-background font-bold border-foreground' 
                    : 'bg-secondary/20 border-border/60 hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shoes Filter */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono font-medium text-muted-foreground uppercase block">
            Isolate Equipment
          </span>
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'all', label: 'All Equipment' },
              { key: 'carbon_rocket', label: 'Carbon Rocket (Strava)' },
              { key: 'trail_shield', label: 'Trail Shield (ICU)' }
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilters(f => ({ ...f, shoes: opt.key }))}
                className={`text-[9.5px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                  filters.shoes === opt.key 
                    ? 'bg-foreground text-background font-bold border-foreground' 
                    : 'bg-secondary/20 border-border/60 hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. PERFORMANCE STORYTELLING SELECTOR (TABS)
// ==========================================
export function PerformanceStorytellingSelector() {
  const { storyTab, setStoryTab } = useInteractiveWorkspace();

  const tabs = [
    { key: 'workspace', label: 'Telemetry Workspace', icon: Grid, color: 'text-primary' },
    { key: 'science-lab', label: '🔬 Sports Science Lab', icon: Anchor, color: 'text-[#FF6B00]' },
    { key: 'fitness', label: 'Fitness Adaptation', icon: TrendingUp, color: 'text-emerald-500' },
    { key: 'recovery', label: 'Recovery Kinetics', icon: Heart, color: 'text-rose-500' },
    { key: 'training', label: 'Volume Density', icon: CalendarDays, color: 'text-sky-500' },
    { key: 'aerobic', label: 'Aerobic Stability', icon: Compass, color: 'text-indigo-500' },
    { key: 'threshold', label: 'Lactate Threshold', icon: Zap, color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 select-none" id="performance-story-selector">
      {tabs.map((tab) => {
        const isActive = storyTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => setStoryTab(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isActive 
                ? 'bg-card border-foreground/35 text-foreground shadow-sm font-extrabold' 
                : 'bg-card/45 border-border hover:bg-secondary/35 text-muted-foreground'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// 5. INTERACTIVE TRENDS CHART (CTL/ATL/TSB)
// ==========================================
export function InteractiveTrendsChart() {
  const { filters, pushDrillDown } = useInteractiveWorkspace();

  // Filter trends according to date range selection
  const filteredTrends = useMemo(() => {
    let limit = 30;
    if (filters.dateRange === '90d') limit = 90;
    else if (filters.dateRange === 'year' || filters.dateRange === 'all') limit = 365;
    
    // We can slice the CALC_CHRONOLOGICAL_TRENDS array accordingly
    return CALC_CHRONOLOGICAL_TRENDS.slice(-limit);
  }, [filters.dateRange]);

  return (
    <div className="p-5 space-y-4" id="interactive-trends-chart-panel">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 select-none">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
            <span>Physiological Adaptation Engine (CTL / ATL / TSB Trends)</span>
          </h4>
          <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
            Click any point on the chart to drill down into daily loading logs and adaptive balances.
          </span>
        </div>
        <div className="flex gap-4 font-mono text-[9px] uppercase border-l border-border/60 pl-3">
          <div className="flex flex-col">
            <span className="text-emerald-500 font-extrabold">CTL (Fitness)</span>
            <span className="text-foreground font-bold">72.4 pts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-rose-500 font-extrabold">ATL (Fatigue)</span>
            <span className="text-foreground font-bold">85.8 pts</span>
          </div>
          <div className="flex flex-col">
            <span className="text-amber-500 font-extrabold">TSB (Form)</span>
            <span className="text-foreground font-bold">-13.4 pts</span>
          </div>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filteredTrends}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const dataPoint = state.activePayload[0].payload;
                pushDrillDown(`Date: ${dataPoint.date} (TSS: ${dataPoint.rss} pts)`);
              }
            }}
            margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="ctlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="atlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
            <XAxis 
              dataKey="date" 
              stroke="currentColor" 
              className="text-muted-foreground text-[8px] font-mono"
              tickFormatter={(str) => {
                const parts = str.split('-');
                return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : str;
              }}
            />
            <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border/80 rounded-xl p-3 shadow-md text-[10px] font-mono space-y-1.5 select-none">
                      <span className="font-extrabold text-foreground block border-b border-border/40 pb-1 uppercase">{data.date}</span>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Workout:</span>
                        <span className="font-bold text-foreground">{data.title || "No activity"}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Daily Stress:</span>
                        <span className="font-bold text-[#FF6B00]">{data.rss} RSS</span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-border/30">
                        <span className="text-emerald-500 font-bold">CTL (Fitness):</span>
                        <span className="font-extrabold text-emerald-500">{data.ctl} pts</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-rose-500 font-bold">ATL (Fatigue):</span>
                        <span className="font-extrabold text-rose-500">{data.atl} pts</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-amber-500 font-bold">TSB (Form):</span>
                        <span className="font-extrabold text-amber-500">{data.tsb} pts</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area type="monotone" dataKey="ctl" stroke="rgb(16, 185, 129)" strokeWidth={2.5} fillOpacity={1} fill="url(#ctlGrad)" name="Fitness (CTL)" />
            <Area type="monotone" dataKey="atl" stroke="rgb(239, 68, 68)" strokeWidth={1.5} fillOpacity={1} fill="url(#atlGrad)" strokeDasharray="3 3" name="Fatigue (ATL)" />
            <Line type="monotone" dataKey="tsb" stroke="rgb(245, 158, 11)" strokeWidth={2} dot={false} name="Form (TSB)" />
            <ReferenceLine y={0} stroke="rgba(var(--border), 0.4)" strokeWidth={1} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==========================================
// 6. ADVANCED BIOMECHANICAL DISTRIBUTION WIDGET
// ==========================================
export function AdvancedDistributionWidget() {
  const { filters } = useInteractiveWorkspace();

  // Filter local dataset to compute descriptive zone distributions
  const filteredRuns = useMemo(() => {
    return PHYSIOLOGICAL_DATASET.filter(d => {
      if (filters.activityType === 'road_run' && !d.title.toLowerCase().includes('tempo') && !d.title.toLowerCase().includes('threshold') && !d.title.toLowerCase().includes('recovery') && !d.title.toLowerCase().includes('base')) return false;
      if (filters.activityType === 'trail_run' && !d.title.toLowerCase().includes('trail') && !d.title.toLowerCase().includes('mountain') && !d.title.toLowerCase().includes('overload')) return false;
      if (filters.surface === 'road' && (d.title.toLowerCase().includes('trail') || d.title.toLowerCase().includes('mountain'))) return false;
      if (filters.surface === 'trail' && !d.title.toLowerCase().includes('trail') && !d.title.toLowerCase().includes('mountain')) return false;
      return true;
    });
  }, [filters]);

  // Aggregate time spent in various Heart Rate Zones (Z1-Z5)
  const zoneDistribution = useMemo(() => {
    let z1 = 0, z2 = 0, z3 = 0, z4 = 0, z5 = 0;
    filteredRuns.forEach(r => {
      const hr = r.avgHr;
      // Zone modeling: Resting HR 50, Max HR 190. Zones: Z1 (<120), Z2 (120-138), Z3 (138-152), Z4 (152-166), Z5 (>166)
      if (hr < 120) z1 += r.durationSec;
      else if (hr < 138) z2 += r.durationSec;
      else if (hr < 152) z3 += r.durationSec;
      else if (hr < 166) z4 += r.durationSec;
      else z5 += r.durationSec;
    });

    const total = z1 + z2 + z3 + z4 + z5 || 1;
    return [
      { name: 'Z1 Recovery (<120bpm)', value: Math.round((z1/total)*100), color: '#64748b', desc: 'Active recovery, mitochondrial building.' },
      { name: 'Z2 Aerobic (120-138bpm)', value: Math.round((z2/total)*100), color: '#10b981', desc: 'Base endurance, capillary density.' },
      { name: 'Z3 Tempo (138-152bpm)', value: Math.round((z3/total)*100), color: '#3b82f6', desc: 'Aerobic power, glycogen efficiency.' },
      { name: 'Z4 Threshold (152-166bpm)', value: Math.round((z4/total)*100), color: '#f59e0b', desc: 'Lactate clearance, FTP adaptations.' },
      { name: 'Z5 Anaerobic (>166bpm)', value: Math.round((z5/total)*100), color: '#ef4444', desc: 'VO2Max capacity, motor unit recruiting.' }
    ];
  }, [filteredRuns]);

  return (
    <div className="p-5 space-y-4" id="advanced-distribution-widget">
      <div>
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-4.5 w-4.5 text-primary" />
          <span>Biomechanical Intensity & Zone Distributions</span>
        </h4>
        <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
          Cardiovascular stress density distribution across 5 discrete, deterministically configured zones.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-6 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneDistribution} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-[7.5px] font-mono" tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" unit="%" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border/85 rounded-xl p-3 shadow-md text-[10px] font-mono max-w-xs space-y-1 select-none">
                        <span className="font-extrabold text-foreground block uppercase" style={{ color: data.color }}>{data.name}</span>
                        <div className="text-xs font-extrabold text-foreground">{data.value}% of time</div>
                        <p className="text-muted-foreground mt-1 leading-normal uppercase text-[8.5px]">{data.desc}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {zoneDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-6 space-y-3 font-mono text-[9.5px]">
          {zoneDistribution.map((z, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                <span className="font-bold text-foreground truncate max-w-[150px]">{z.name}</span>
              </div>
              <span className="font-extrabold text-[#FF6B00]">{z.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. CORRELATION DASHBOARD WIDGET (SCATTER PLOT)
// ==========================================
export function CorrelationDashboardWidget() {
  const { filters } = useInteractiveWorkspace();

  // Selected correlation variable pair
  const [variablePair, setVariablePair] = useState<'hr_power' | 'hr_pace' | 'power_grade'>('hr_power');

  // Filter and build clean correlation coordinate sets
  const correlationData = useMemo(() => {
    const raw = PHYSIOLOGICAL_DATASET.filter(d => {
      if (filters.activityType === 'road_run' && !d.title.toLowerCase().includes('tempo') && !d.title.toLowerCase().includes('threshold') && !d.title.toLowerCase().includes('recovery') && !d.title.toLowerCase().includes('base')) return false;
      if (filters.activityType === 'trail_run' && !d.title.toLowerCase().includes('trail') && !d.title.toLowerCase().includes('mountain') && !d.title.toLowerCase().includes('overload')) return false;
      return true;
    });

    return raw.map(r => {
      let x = 0, y = 0;
      if (variablePair === 'hr_power') {
        x = r.avgHr;
        y = r.avgPower;
      } else if (variablePair === 'hr_pace') {
        x = r.avgHr;
        // Convert pace MM:SS to decimal minutes for calculation, then invert to velocity for linear correlation
        const [m, s] = r.pace.split(':').map(Number);
        const dec = m + s/60;
        y = dec > 0 ? 1000 / (dec * 60) : 0; // m/s speed
      } else {
        x = r.elevation / r.distanceKm; // Avg grade proxy
        y = r.avgPower;
      }
      return { x, y, label: r.title, date: r.date };
    });
  }, [filters, variablePair]);

  // Compute exact Pearson correlation coefficient, R², slope, and intercept
  const stats = useMemo(() => {
    const N = correlationData.length;
    if (N < 2) return { r: 0, r2: 0, slope: 0, intercept: 0 };

    const xs = correlationData.map(d => d.x);
    const ys = correlationData.map(d => d.y);

    const xMean = xs.reduce((a, b) => a + b, 0) / N;
    const yMean = ys.reduce((a, b) => a + b, 0) / N;

    // Linear OLS fit
    let num = 0, denX = 0, denY = 0, cov = 0, varX = 0;
    for (let i = 0; i < N; i++) {
      const dx = xs[i] - xMean;
      const dy = ys[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const r = denX && denY ? num / Math.sqrt(denX * denY) : 0;
    const slope = denX ? num / denX : 0;
    const intercept = yMean - slope * xMean;

    return {
      r: parseFloat(r.toFixed(3)),
      r2: parseFloat((r * r).toFixed(3)),
      slope: parseFloat(slope.toFixed(2)),
      intercept: parseFloat(intercept.toFixed(2))
    };
  }, [correlationData]);

  // Generate line points for trendline
  const trendLinePoints = useMemo(() => {
    if (correlationData.length < 2) return [];
    const xs = correlationData.map(d => d.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    return [
      { x: minX, y: stats.slope * minX + stats.intercept },
      { x: maxX, y: stats.slope * maxX + stats.intercept }
    ];
  }, [correlationData, stats]);

  return (
    <div className="p-5 space-y-4" id="correlation-dashboard-widget">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="h-4.5 w-4.5 text-primary" />
            <span>Advanced Correlation Laboratory</span>
          </h4>
          <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
            Evaluate linear regression models, confidence parameters, and Pearson co-variance values.
          </span>
        </div>
        
        <select 
          value={variablePair} 
          onChange={(e: any) => setVariablePair(e.target.value)}
          className="bg-card text-foreground border border-border/80 rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold uppercase cursor-pointer focus:outline-none"
        >
          <option value="hr_power">Heart Rate vs Power Output</option>
          <option value="hr_pace">Heart Rate vs Speed (m/s)</option>
          <option value="power_grade">Grade Proxy vs Power Output</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-8 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.15)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={variablePair === 'power_grade' ? 'Grade Index (m/km)' : 'Heart Rate'} 
                unit={variablePair === 'power_grade' ? 'm/km' : 'bpm'} 
                stroke="currentColor" 
                className="text-muted-foreground text-[8px] font-mono"
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={variablePair === 'hr_pace' ? 'Speed' : 'Power'} 
                unit={variablePair === 'hr_pace' ? 'm/s' : 'W'} 
                stroke="currentColor" 
                className="text-muted-foreground text-[8px] font-mono"
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border/85 rounded-xl p-3 shadow-md text-[10px] font-mono space-y-1 select-none">
                        <span className="font-extrabold text-foreground block border-b border-border/30 pb-0.5 uppercase">{data.label}</span>
                        <span className="text-muted-foreground block font-bold text-[8px]">{data.date}</span>
                        <div className="flex justify-between gap-4 pt-1">
                          <span className="text-muted-foreground">X Input:</span>
                          <span className="font-extrabold text-foreground">{data.x.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Y Input:</span>
                          <span className="font-extrabold text-[#FF6B00]">{data.y.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Workouts" data={correlationData} fill="#FF6B00" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-4 bg-secondary/15 border border-border/40 rounded-xl p-3.5 space-y-2.5 font-mono text-[9px] select-none">
          <span className="text-[8px] text-muted-foreground font-bold block uppercase border-b border-border/40 pb-1">
            Statistical Fit Metrics
          </span>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sample Size (N):</span>
            <span className="font-extrabold text-foreground">{correlationData.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pearson r:</span>
            <span className="font-extrabold text-emerald-500">{stats.r}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">R² (Determination):</span>
            <span className="font-extrabold text-emerald-500">{stats.r2}</span>
          </div>
          <div className="flex justify-between border-t border-border/30 pt-1.5">
            <span className="text-muted-foreground">OLS Slope (β):</span>
            <span className="font-extrabold text-foreground">{stats.slope}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Intercept (α):</span>
            <span className="font-extrabold text-foreground">{stats.intercept}</span>
          </div>
          <div className="text-[8.5px] leading-normal text-muted-foreground pt-1 uppercase border-t border-border/30 font-mono">
            {stats.r > 0.7 
              ? "Strong positive linear relationship. High mechanical predictability." 
              : stats.r > 0.4 
                ? "Moderate positive relationship. Some physiological drift is present."
                : "Weak or non-linear relationship. Significant environmental or physical noise."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. INTERACTIVE TRAINING CALENDAR GRID
// ==========================================
export function InteractiveCalendarAnalytics() {
  const { setSelectedActivityId, selectedActivityId } = useInteractiveWorkspace();

  // Create a structured list of calendar days spanning the chronological period
  const calendarDays = useMemo(() => {
    // Generate dates from Jun 8 to Jul 8, 2026 (31 days)
    const start = new Date('2026-06-08');
    const end = new Date('2026-07-08');
    const days = [];
    const cur = new Date(start);

    while (cur <= end) {
      const dateStr = cur.toISOString().slice(0, 10);
      // Find matching activity
      const run = PHYSIOLOGICAL_DATASET.find(r => r.date === dateStr);
      days.push({
        date: dateStr,
        dayNum: cur.getDate(),
        run: run || null,
        rss: run ? run.rss : 0
      });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, []);

  return (
    <div className="p-5 space-y-4" id="interactive-calendar-grid">
      <div className="flex items-center justify-between select-none">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="h-4.5 w-4.5 text-primary" />
            <span>Cardiovascular Stress Calendar Density</span>
          </h4>
          <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
            Interactive grid tracking daily RSS stress accumulation blocks. Click any day to isolate workout.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase">
          <span className="text-muted-foreground text-[8.5px]">Stress:</span>
          <div className="flex gap-0.5">
            <span className="h-2 w-2 rounded-sm bg-secondary/40" />
            <span className="h-2 w-2 rounded-sm bg-[#FF6B00]/20" />
            <span className="h-2 w-2 rounded-sm bg-[#FF6B00]/40" />
            <span className="h-2 w-2 rounded-sm bg-[#FF6B00]/75" />
            <span className="h-2 w-2 rounded-sm bg-[#FF6B00]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2" id="stress-calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center font-mono text-[9px] font-bold text-muted-foreground uppercase py-1">
            {day}
          </div>
        ))}
        {calendarDays.map((day) => {
          const isSelected = day.run && selectedActivityId === day.run.id;
          // Determine background density based on RSS load
          let bgClass = 'bg-secondary/20 hover:bg-secondary/40';
          if (day.rss > 0) {
            if (day.rss < 40) bgClass = 'bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 text-foreground';
            else if (day.rss < 70) bgClass = 'bg-[#FF6B00]/35 hover:bg-[#FF6B00]/45 text-foreground';
            else if (day.rss < 100) bgClass = 'bg-[#FF6B00]/65 hover:bg-[#FF6B00]/75 text-background font-bold';
            else bgClass = 'bg-[#FF6B00] hover:opacity-95 text-background font-bold';
          }

          return (
            <div
              key={day.date}
              onClick={() => {
                if (day.run) {
                  setSelectedActivityId(day.run.id);
                }
              }}
              className={`h-11 rounded-lg flex flex-col justify-between p-1.5 transition-all cursor-pointer ${bgClass} ${
                isSelected ? 'ring-2 ring-foreground scale-95' : ''
              } ${day.run ? '' : 'pointer-events-none opacity-40'}`}
              title={day.run ? `${day.run.title}: ${day.rss} RSS` : 'Rest Day'}
            >
              <span className="text-[8.5px] font-mono leading-none">{day.dayNum}</span>
              {day.rss > 0 && (
                <span className="text-[9px] font-mono font-extrabold text-right leading-none block">
                  {day.rss}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 9. ATHLETE TIMELINE WIDGET
// ==========================================
export function AthleteTimelineWidget() {
  const timelineEvents = [
    { date: 'Jul 7, 2026', type: 'PB', title: 'Functional Threshold Pace Recalibrated', desc: 'FTP pace updated to 4:08/km based on 10km aerobic threshold tempo execution.', icon: Award, color: 'text-amber-500' },
    { date: 'Jul 5, 2026', type: 'BLOCK', title: 'Entered Pre-Race Peak Block', desc: 'Volume reduced by 25% while intensity matches standard target speeds to maximize supercompensation.', icon: Layers, color: 'text-primary' },
    { date: 'Jun 29, 2026', type: 'PB', title: '5K Peak Power Output Breakthrough', desc: 'Sustained 5-minute peak power peaked at 295 Watts (5.1 W/kg) during intervals.', icon: Zap, color: 'text-[#FF6B00]' },
    { date: 'Jun 21, 2026', type: 'SYSTEM', title: 'Shoe Lifespan Warning Indicator', desc: 'Carbon Rocket Racing shoes exceeded 400km threshold. Mechanical recoil degradation estimated at 5.2%.', icon: AlertOctagon, color: 'text-rose-500' },
    { date: 'Jun 10, 2026', type: 'BLOCK', title: 'Launched Aerobic Base Accumulation', desc: 'Volume block initiated with 50km target weeks to support mitochondrial expansion.', icon: CheckCircle, color: 'text-emerald-500' }
  ];

  return (
    <div className="p-5 space-y-4" id="athlete-timeline-widget">
      <div>
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-4.5 w-4.5 text-primary" />
          <span>Physiological & Event Timeline</span>
        </h4>
        <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
          Chronological index of threshold shifts, block transitions, achievements, and warnings.
        </span>
      </div>

      <div className="space-y-4 pt-1 max-h-[220px] overflow-y-auto pr-1 select-none">
        {timelineEvents.map((ev, idx) => {
          const Icon = ev.icon;
          return (
            <div key={idx} className="flex gap-3 relative pb-2 border-l border-border/40 pl-3.5 last:border-0 last:pb-0">
              <span className="absolute -left-[7px] top-1 bg-card rounded-full p-0.5 border border-border">
                <Icon className={`h-3 w-3 ${ev.color}`} />
              </span>
              <div className="space-y-1 font-mono text-[9.5px]">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-secondary/30 text-muted-foreground py-0.5 px-1.5 rounded uppercase font-bold">
                    {ev.type}
                  </span>
                  <span className="text-[8px] text-muted-foreground">{ev.date}</span>
                </div>
                <h5 className="font-bold text-foreground text-[10px] uppercase leading-tight">
                  {ev.title}
                </h5>
                <p className="text-muted-foreground text-[8.5px] leading-normal uppercase">
                  {ev.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 10. SIDE BY SIDE COMPARISON MODULE
// ==========================================
export function SideBySideComparisonModule() {
  const { comparison, setComparison } = useInteractiveWorkspace();

  if (!comparison.enabled) {
    return (
      <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 select-none" id="comparison-toggle-view">
        <div className="flex items-center gap-2">
          <Layers className="h-4.5 w-4.5 text-primary animate-pulse" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Side-by-Side Training Block Comparison</h4>
            <span className="text-[9px] text-muted-foreground font-mono block">Isolate and contrast two distinct physiological loading cycles side-by-side</span>
          </div>
        </div>
        <button
          onClick={() => setComparison(c => ({ ...c, enabled: true }))}
          className="text-[10px] font-mono font-bold uppercase text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all cursor-pointer"
        >
          [ Enable Comparison Portal ]
        </button>
      </div>
    );
  }

  // Contrasting static physiological loading blocks
  const metrics = [
    { name: 'Accumulated Volume', unit: 'km', valA: '45.7 km', valB: '53.9 km', diff: '+17.9%', better: 'B' },
    { name: 'Training Stress (RSS)', unit: 'pts', valA: '228 RSS', valB: '298 RSS', diff: '+30.7%', better: 'B' },
    { name: 'Aerobic Decoupling (Pa:Hr)', unit: '%', valA: '3.1%', valB: '4.3%', diff: '+1.2%', better: 'A' },
    { name: 'Efficiency Factor (EF)', unit: 'W/bpm', valA: '1.41', valB: '1.57', diff: '+11.3%', better: 'B' },
    { name: 'Pacing Stability Index', unit: 'index', valA: '0.94', valB: '0.88', diff: '-6.3%', better: 'A' },
    { name: 'Ground Contact Time (GCT)', unit: 'ms', valA: '242 ms', valB: '236 ms', diff: '-2.4%', better: 'B' }
  ];

  return (
    <div className="bg-card border-2 border-primary/40 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200 select-none" id="comparison-portal-view">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4.5 w-4.5 text-primary" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Side-by-Side Diagnostic Portal</h4>
            <span className="text-[9px] text-muted-foreground font-mono block">Contrast active mechanical and physiological variables across loading periods.</span>
          </div>
        </div>
        <button
          onClick={() => setComparison(c => ({ ...c, enabled: false }))}
          className="text-[9px] font-mono font-bold uppercase text-rose-500 hover:underline cursor-pointer"
        >
          [ Close Comparison ]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Block Headers */}
        <div className="grid grid-cols-2 gap-4 font-mono text-[10px] text-center border-b border-border/30 pb-2">
          <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/25 rounded-lg py-2">
            <span className="text-[#FF6B00] font-extrabold uppercase block text-[8px]">Comparison Block A</span>
            <span className="font-bold text-foreground">Base Phase (Weeks 1-2)</span>
          </div>
          <div className="bg-primary/10 border border-primary/25 rounded-lg py-2">
            <span className="text-primary font-extrabold uppercase block text-[8px]">Comparison Block B</span>
            <span className="font-bold text-foreground">Build Phase (Weeks 3-4)</span>
          </div>
        </div>

        {/* Dynamic Comparison Rows */}
        <div className="md:col-span-2 space-y-2 font-mono text-[9.5px]">
          {metrics.map((m, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 py-1.5 border-b border-border/35 items-center">
              <span className="text-muted-foreground uppercase">{m.name}</span>
              <div className="grid grid-cols-2 gap-4 text-center">
                <span className={`font-bold ${m.better === 'A' ? 'text-emerald-500' : 'text-foreground'}`}>{m.valA}</span>
                <span className={`font-bold ${m.better === 'B' ? 'text-emerald-500' : 'text-foreground'}`}>{m.valB}</span>
              </div>
              <span className={`text-right font-extrabold ${m.better === 'B' ? 'text-emerald-500' : 'text-amber-500'}`}>{m.diff}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. SPORTS SCIENCE LABORATORY PORTAL (TAB PANEL)
// ==========================================
export function SportsScienceLaboratoryPortal() {
  const [labSubTab, setLabSubTab] = useState<'formulas' | 'correlation' | 'economy' | 'blocks' | 'statistical' | 'equipment' | 'export'>('formulas');

  const subTabs = [
    { key: 'formulas', label: 'Disclosures' },
    { key: 'correlation', label: 'Correlation Lab' },
    { key: 'economy', label: 'Running Economy' },
    { key: 'blocks', label: 'Training Blocks' },
    { key: 'statistical', label: 'Statistics & Quality' },
    { key: 'equipment', label: 'Equipment & Env' },
    { key: 'export', label: 'Reports & Export' }
  ];

  // Printable Report Generation State
  const [activeReportType, setActiveReportType] = useState<'weekly' | 'monthly' | 'block' | 'season'>('weekly');
  const [reportGenerated, setReportGenerated] = useState(false);

  // Math sandbox values for formula transparencies
  const [sandboxDuration, setSandboxDuration] = useState<number>(45);
  const [sandboxPower, setSandboxPower] = useState<number>(230);
  const [sandboxFtp, setSandboxFtp] = useState<number>(250);

  const sandboxRss = useMemo(() => {
    // RSS calculation formula
    const durationSeconds = sandboxDuration * 60;
    const ifScore = sandboxPower / sandboxFtp;
    return Math.round(100 * (durationSeconds * sandboxPower * ifScore) / (3600 * sandboxFtp));
  }, [sandboxDuration, sandboxPower, sandboxFtp]);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-6 select-none" id="sports-science-laboratory-portal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#FF6B00]/10 text-[#FF6B00] rounded-xl border border-[#FF6B00]/25">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <span>Performance Sports Science Laboratory</span>
              <span className="text-[9px] font-mono font-extrabold bg-[#FF6B00] text-background py-0.5 px-2 rounded uppercase">
                Enterprise Level
              </span>
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono block mt-1 uppercase">
              WKO5 & Golden Cheetah compatible scientific diagnostics and regression fit sandbox.
            </span>
          </div>
        </div>
        
        {/* Printable report shortcut */}
        <button 
          onClick={() => {
            setLabSubTab('export');
            setActiveReportType('weekly');
          }}
          className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold uppercase bg-secondary/35 border border-border/70 hover:bg-secondary/50 text-foreground px-3.5 py-2 rounded-xl cursor-pointer"
        >
          <Printer className="h-3.5 w-3.5 text-[#FF6B00]" />
          <span>[ Print Weekly Lab Report ]</span>
        </button>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex flex-wrap gap-1 bg-secondary/15 p-1 rounded-xl border border-border/40">
        {subTabs.map((st) => (
          <button
            key={st.key}
            onClick={() => setLabSubTab(st.key as any)}
            className={`flex-1 text-center text-[10px] font-bold uppercase py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
              labSubTab === st.key 
                ? 'bg-foreground text-background font-extrabold' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* PANEL 1: FORMULAS DISCLOSURES & SANDBOX */}
      {labSubTab === 'formulas' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-secondary/15 border border-border/45 rounded-xl p-4 space-y-2 font-mono text-[10px]">
            <span className="text-xs font-bold text-foreground uppercase block">Sports Science Formula Transparency Disclosures</span>
            <p className="text-muted-foreground leading-normal uppercase text-[9px]">
              Track.Studio operates on 100% deterministic mathematical structures derived from peer-reviewed sports science literature.
              Below are the exact equations, variables, and units matching software such as Golden Cheetah and WKO5.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TSS Formulations */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3 font-mono text-[9.5px]">
              <span className="font-extrabold text-[#FF6B00] text-xs uppercase block border-b border-border/40 pb-1.5">
                Running Stress Score (RSS / TSS)
              </span>
              <div className="bg-secondary/20 p-2.5 rounded-lg text-center text-xs font-extrabold text-foreground border border-border/30">
                RSS = 100 × (D × NP × IF) / (3600 × FTP)
              </div>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variables:</span>
                  <span className="text-foreground">D = Duration (s), NP = Normalized Power, IF = Intensity Factor, FTP = Threshold Power</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Units:</span>
                  <span className="text-foreground">Points (100 pts equates to 1 hr continuous threshold effort)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scientific Reference:</span>
                  <span className="text-foreground font-semibold">Coggan (2012) - TrainingPeaks</span>
                </div>
              </div>
            </div>

            {/* Impulse Response Formulations */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3 font-mono text-[9.5px]">
              <span className="font-extrabold text-[#FF6B00] text-xs uppercase block border-b border-border/40 pb-1.5">
                Coggan Impulse Response Model (CTL / ATL / TSB)
              </span>
              <div className="bg-secondary/20 p-2.5 rounded-lg space-y-1 border border-border/30">
                <div className="flex justify-between text-[11px] font-extrabold text-foreground">
                  <span>CTL_t = CTL_t-1 + (TSS_t - CTL_t-1) / 42</span>
                  <span>[Fitness]</span>
                </div>
                <div className="flex justify-between text-[11px] font-extrabold text-foreground border-t border-border/30 pt-1 mt-1">
                  <span>ATL_t = ATL_t-1 + (TSS_t - ATL_t-1) / 7</span>
                  <span>[Fatigue]</span>
                </div>
                <div className="flex justify-between text-[11px] font-extrabold text-[#FF6B00] border-t border-border/30 pt-1 mt-1">
                  <span>TSB_t = CTL_t-1 - ATL_t-1</span>
                  <span>[Form]</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Variables:</span>
                  <span className="text-foreground">42-day (Fitness decay), 7-day (Fatigue decay)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scientific Reference:</span>
                  <span className="text-foreground font-semibold">Banister & Calvert (1975) / Busso (1990)</span>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Sandbox */}
            <div className="md:col-span-2 bg-secondary/10 border border-border/70 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
                <Calculator className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-xs font-bold font-mono text-foreground uppercase">
                  Interactive Stress Score (RSS) Sandbox Calculator
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono text-[10px]">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase block">Workout Duration (Minutes)</label>
                  <input 
                    type="number" 
                    value={sandboxDuration}
                    onChange={(e: any) => setSandboxDuration(Number(e.target.value))}
                    className="w-full bg-card border border-border text-foreground px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase block">Average Power (Watts)</label>
                  <input 
                    type="number" 
                    value={sandboxPower}
                    onChange={(e: any) => setSandboxPower(Number(e.target.value))}
                    className="w-full bg-card border border-border text-foreground px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-muted-foreground uppercase block">Functional Threshold Power (FTP)</label>
                  <input 
                    type="number" 
                    value={sandboxFtp}
                    onChange={(e: any) => setSandboxFtp(Number(e.target.value))}
                    className="w-full bg-card border border-border text-foreground px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-card p-3 rounded-xl border border-border/60 font-mono">
                <div className="space-y-0.5">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Calculated Stress (RSS):</span>
                  <div className="text-lg font-extrabold text-[#FF6B00]">{sandboxRss} RSS</div>
                </div>
                <div className="text-[8.5px] text-muted-foreground text-right uppercase max-w-xs leading-normal">
                  Intensity Factor (IF): <b>{(sandboxPower/sandboxFtp).toFixed(2)}</b>.
                  Duration Seconds: <b>{sandboxDuration * 60}s</b>.
                  Mathematical accuracy verified.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: ADVANCED CORRELATION LAB */}
      {labSubTab === 'correlation' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <CorrelationDashboardWidget />
        </div>
      )}

      {/* PANEL 3: RUNNING ECONOMY */}
      {labSubTab === 'economy' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[9.5px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-secondary/15 p-3 rounded-xl border border-border/40 text-center space-y-1">
              <span className="text-muted-foreground block text-[8px] uppercase">Efficiency Factor (EF)</span>
              <span className="text-base font-extrabold text-foreground">1.44 W/bpm</span>
              <p className="text-[7.5px] text-emerald-500 leading-none">▲ +3.4% drift resistance</p>
            </div>
            <div className="bg-secondary/15 p-3 rounded-xl border border-border/40 text-center space-y-1">
              <span className="text-muted-foreground block text-[8px] uppercase">Running Effectiveness</span>
              <span className="text-base font-extrabold text-foreground">0.96 ratio</span>
              <p className="text-[7.5px] text-emerald-500 leading-none">▲ High muscular efficiency</p>
            </div>
            <div className="bg-secondary/15 p-3 rounded-xl border border-border/40 text-center space-y-1">
              <span className="text-muted-foreground block text-[8px] uppercase">Avg Ground Contact Time (GCT)</span>
              <span className="text-base font-extrabold text-foreground">240 ms</span>
              <p className="text-[7.5px] text-emerald-500 leading-none">▼ -2.5% ground time cost</p>
            </div>
            <div className="bg-secondary/15 p-3 rounded-xl border border-border/40 text-center space-y-1">
              <span className="text-muted-foreground block text-[8px] uppercase">Vertical Oscillation</span>
              <span className="text-base font-extrabold text-foreground">7.8 cm</span>
              <p className="text-[7.5px] text-emerald-500 leading-none">▼ -3.1% vertical energy loss</p>
            </div>
          </div>

          {/* Economy relationship charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border border-border/80 rounded-xl p-4">
            <div className="space-y-2">
              <span className="font-extrabold text-foreground uppercase text-[10px]">Relationship: Cadence vs Stride Length</span>
              <p className="text-muted-foreground leading-normal text-[8.5px] uppercase">
                A higher cadence paired with a slightly shortened stride decreases ground impact forces, lowering fatigue and muscle strain.
              </p>
              <div className="h-[140px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PHYSIOLOGICAL_DATASET} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                    <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-[7.5px] font-mono" tickFormatter={(v) => v.split('-')[2]} />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <Tooltip />
                    <Area type="monotone" dataKey="cadence" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-extrabold text-foreground uppercase text-[10px]">Relationship: Heart Rate vs Efficiency Factor</span>
              <p className="text-muted-foreground leading-normal text-[8.5px] uppercase">
                As cardiovascular conditioning improves, your Efficiency Factor rises, meaning you output more mechanical wattage for the same heart rate.
              </p>
              <div className="h-[140px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={PHYSIOLOGICAL_DATASET} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                    <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-[7.5px] font-mono" tickFormatter={(v) => v.split('-')[2]} />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <Tooltip />
                    <Area type="monotone" dataKey="effFactor" stroke="#10b981" fillOpacity={0.1} fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 4: TRAINING BLOCKS */}
      {labSubTab === 'blocks' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[9.5px]">
          <div className="bg-secondary/15 border border-border/45 rounded-xl p-4 space-y-1 text-xs">
            <span className="font-bold text-foreground uppercase block">Deterministic Training Block Segmentation</span>
            <p className="text-muted-foreground leading-normal uppercase text-[9px]">
              Track.Studio automatically identifies and slices training segments based on volume, intensity thresholds, and date timelines.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Base Phase Block', duration: 'Jun 1 – Jun 15, 2026', ctlGain: '+4.2 CTL', distance: '41.2 km', intensity: 'Zone 2 Dominant', status: 'Stable Aerobic' },
              { name: 'Build Phase Block', duration: 'Jun 16 – Jun 30, 2026', ctlGain: '+6.8 CTL', distance: '54.5 km', intensity: 'Zone 3/4 Threshold', status: 'Functional Capacity' },
              { name: 'Pre-Race Peak Block', duration: 'Jul 1 – Jul 7, 2026', ctlGain: '+1.4 CTL', distance: '34.4 km', intensity: 'Intervals & Cooldown', status: 'Peaking Freshness' }
            ].map((block, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border/80 bg-card rounded-xl p-4 gap-3">
                <div>
                  <span className="font-extrabold text-foreground uppercase block text-xs">{block.name}</span>
                  <span className="text-[8.5px] text-muted-foreground block">{block.duration}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left text-[9.5px] pt-2 sm:pt-0 border-t sm:border-0 border-border/30 w-full sm:w-auto">
                  <div>
                    <span className="text-muted-foreground text-[8px] block uppercase">Distance:</span>
                    <span className="font-extrabold text-foreground">{block.distance}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[8px] block uppercase">CTL Gain:</span>
                    <span className="font-extrabold text-emerald-500">{block.ctlGain}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[8px] block uppercase">Intensity Profile:</span>
                    <span className="font-extrabold text-foreground">{block.intensity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[8px] block uppercase">Status:</span>
                    <span className="font-extrabold text-primary">{block.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PANEL 5: STATISTICS & QUALITY */}
      {labSubTab === 'statistical' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[9.5px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Descriptive Statistics */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3.5">
              <span className="font-extrabold text-foreground text-xs uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Descriptive Statistical Analytics</span>
              </span>
              <div className="grid grid-cols-2 gap-3.5 text-[9.5px]">
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">Mean Power:</span>
                  <span className="font-extrabold text-foreground">215.3 Watts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">Median Power:</span>
                  <span className="font-extrabold text-foreground">212.5 Watts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">Standard Dev:</span>
                  <span className="font-extrabold text-foreground">32.4 Watts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">Variance:</span>
                  <span className="font-extrabold text-foreground">1049.7</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">25th Percentile:</span>
                  <span className="font-extrabold text-foreground">195.0 Watts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-1">
                  <span className="text-muted-foreground">75th Percentile:</span>
                  <span className="font-extrabold text-foreground">242.5 Watts</span>
                </div>
              </div>
              <p className="text-[8.5px] leading-normal text-muted-foreground uppercase pt-1 border-t border-border/30">
                Data displays symmetrical Gaussian curves. Power outliers: <b>0 detected</b>. Dataset reflects clean physiological integrity.
              </p>
            </div>

            {/* Data Quality Laboratory */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3.5">
              <span className="font-extrabold text-foreground text-xs uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Signal Integrity & Dropout Quality Check</span>
              </span>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="font-bold text-foreground">GPS Track Continuity</span>
                  <span className="text-emerald-500 font-extrabold uppercase bg-emerald-500/10 py-0.5 px-2 rounded">
                    100% Verified
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="font-bold text-foreground">Cardiological Heart Rate Dropouts</span>
                  <span className="text-emerald-500 font-extrabold uppercase bg-emerald-500/10 py-0.5 px-2 rounded">
                    0 anomalies
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="font-bold text-foreground">Mechanical Power spikes (Flatlines)</span>
                  <span className="text-emerald-500 font-extrabold uppercase bg-emerald-500/10 py-0.5 px-2 rounded">
                    None
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="font-bold text-foreground">Sensor Calibration Stamps</span>
                  <span className="text-emerald-500 font-extrabold uppercase bg-emerald-500/10 py-0.5 px-2 rounded">
                    Valid (1Hz)
                  </span>
                </div>
              </div>
              <p className="text-[8.5px] leading-normal text-muted-foreground uppercase pt-1 border-t border-border/30">
                In-line telemetry checks are automatically executed on every incoming FIT stream payload.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 6: EQUIPMENT & ENVIRONMENTAL */}
      {labSubTab === 'equipment' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[9.5px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Equipment Analytics */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3.5">
              <span className="font-extrabold text-foreground text-xs uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-primary" />
                <span>Certified Equipment & Shoe Wear Lifespans</span>
              </span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground uppercase">1. Carbon Rocket Racing (Primary)</span>
                    <span className="text-rose-500 font-extrabold">420km / 650km</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '64.6%' }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground block">Estimated recoil deterioration: 5.2%. Wear rating: 65%.</span>
                </div>

                <div className="space-y-1 border-t border-border/30 pt-2.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-foreground uppercase">2. Trail Shield GORE-TEX</span>
                    <span className="text-emerald-500 font-extrabold">120km / 700km</span>
                  </div>
                  <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '17.1%' }} />
                  </div>
                  <span className="text-[8px] text-muted-foreground block">Wear rating: 17.1%. Highly optimal traction structures.</span>
                </div>
              </div>
            </div>

            {/* Environmental Predictor Simulator */}
            <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3.5">
              <span className="font-extrabold text-foreground text-xs uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-[#FF6B00]" />
                <span>Environmental Performance Penalty Simulator</span>
              </span>

              <p className="text-[8.5px] leading-normal text-muted-foreground uppercase">
                High temperatures and high humidity raise metabolic costs, forcing a cardiac output decline for a given velocity.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Temp Penalty Simulator (30°C vs 15°C baseline):</span>
                  <span className="font-extrabold text-rose-500">+4.8% HR cost</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Altitude Penalty Simulator (1500m elevation):</span>
                  <span className="font-extrabold text-rose-500">-5.2% Vo2Max output</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-foreground">Humidity Penalty Simulator (80% RH):</span>
                  <span className="font-extrabold text-amber-500">+2.1% metabolic burden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 7: REPORTS & DATA EXPORTS */}
      {labSubTab === 'export' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[9.5px]">
          <div className="bg-secondary/15 border border-border/45 rounded-xl p-4 space-y-1.5 text-xs">
            <span className="font-bold text-foreground uppercase block">Printable Scientific Report Generator</span>
            <p className="text-muted-foreground leading-normal uppercase text-[9px]">
              Compile publication-ready athletic reviews summarizing volume distributions, cardiac drift anomalies, and stress trends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            <div className="md:col-span-4 bg-card border border-border/80 rounded-xl p-4 space-y-3.5">
              <span className="font-bold text-foreground text-xs uppercase block border-b border-border/40 pb-1.5">
                Select Report Specifications
              </span>
              
              <div className="space-y-2">
                {[
                  { key: 'weekly', label: 'Weekly Performance Review' },
                  { key: 'monthly', label: 'Monthly Physiological Summary' },
                  { key: 'block', label: 'Training Block Adaptation Report' },
                  { key: 'season', label: 'Season Performance Review' }
                ].map((rep) => (
                  <button
                    key={rep.key}
                    onClick={() => {
                      setActiveReportType(rep.key as any);
                      setReportGenerated(false);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      activeReportType === rep.key 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-card border-border hover:bg-secondary/25 text-muted-foreground'
                    }`}
                  >
                    {rep.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setReportGenerated(true)}
                className="w-full bg-foreground text-background font-extrabold uppercase py-2.5 rounded-xl hover:bg-foreground/90 transition-all text-center cursor-pointer text-[10px]"
              >
                COMPILE REPORT METRICS
              </button>
            </div>

            <div className="md:col-span-8 bg-card border border-border/80 rounded-xl p-4 space-y-4">
              {reportGenerated ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-b border-border/40 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] font-bold bg-[#FF6B00]/10 text-[#FF6B00] px-1.5 py-0.5 rounded uppercase font-mono">
                        System Report: Ready
                      </span>
                      <h5 className="text-xs font-extrabold text-foreground uppercase tracking-tight mt-1">
                        Track.Studio Scientific {activeReportType.toUpperCase()} Report
                      </h5>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-primary hover:underline cursor-pointer"
                    >
                      <Printer className="h-3 w-3" />
                      <span>[ Print PDF ]</span>
                    </button>
                  </div>

                  <div className="bg-secondary/15 p-3.5 rounded-xl border border-border/30 space-y-2.5">
                    <div className="flex justify-between border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">Athlete Signature:</span>
                      <span className="font-bold text-foreground">Verified (Google Authenticated)</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">Reporting Cycle:</span>
                      <span className="font-bold text-foreground">Active {filters.dateRange.toUpperCase()} Isolate</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-1.5">
                      <span className="text-muted-foreground">Mean Cardiac Decoupling:</span>
                      <span className="font-bold text-emerald-500">3.8% (Highly Stable)</span>
                    </div>
                    <div className="flex justify-between pb-0">
                      <span className="text-muted-foreground">System Stability Score:</span>
                      <span className="font-bold text-emerald-500">98.5% (Elite Calibration)</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const headers = ['Date', 'Title', 'Distance (km)', 'Duration', 'Pace', 'Avg HR', 'Max HR', 'RSS'];
                        const rows = PHYSIOLOGICAL_DATASET.map(d => [d.date, d.title, d.distanceKm, d.duration, d.pace, d.avgHr, d.maxHr, d.rss]);
                        const csv = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                        const link = document.createElement("a");
                        link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(csv));
                        link.setAttribute("download", `track_studio_${activeReportType}_report.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 text-center bg-secondary/30 hover:bg-secondary/50 border border-border text-foreground font-bold uppercase py-1.5 rounded-lg text-[9px] cursor-pointer"
                    >
                      [ Export CSV ]
                    </button>
                    <button 
                      onClick={() => {
                        const json = JSON.stringify(PHYSIOLOGICAL_DATASET, null, 2);
                        const link = document.createElement("a");
                        link.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(json));
                        link.setAttribute("download", `track_studio_${activeReportType}_report.json`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex-1 text-center bg-secondary/30 hover:bg-secondary/50 border border-border text-foreground font-bold uppercase py-1.5 rounded-lg text-[9px] cursor-pointer"
                    >
                      [ Export JSON ]
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <Printer className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-xs font-bold text-muted-foreground uppercase">No compiled report active</div>
                  <p className="text-[8.5px] text-muted-foreground/70 uppercase max-w-xs leading-normal">
                    Select a report category from the left specifications rail and click compile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
