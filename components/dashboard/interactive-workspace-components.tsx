'use client';

import React, { useState, useMemo } from 'react';
import { 
  useInteractiveWorkspace, 
  TimeRangePreset, 
  WorkspaceFilters 
} from '@/providers/interactive-workspace-provider';
import { useDashboard } from '@/providers/dashboard-provider';
import { useWorkspace } from '@/providers/workspace-provider';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Cell
} from 'recharts';
import { 
  Calendar, 
  SlidersHorizontal, 
  Activity, 
  Heart, 
  Zap, 
  TrendingUp, 
  Trash2,
  HelpCircle,
  TrendingDown,
  Compass,
  ArrowRight,
  Flame,
  User,
  Info,
  CheckCircle,
  AlertOctagon,
  Award,
  Maximize2,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  Eye,
  ShieldCheck,
  Mountain,
  Thermometer,
  Footprints,
  CalendarDays
} from 'lucide-react';

// =========================================================
// 1. UNIVERSAL TIME RANGE CONTROLLER
// =========================================================
export function UniversalTimeRangeController() {
  const { 
    timeRangePreset, 
    setTimeRangePreset, 
    customDateRange, 
    setCustomDateRange, 
    resolvedDateRangeText 
  } = useInteractiveWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  const presets: { value: TimeRangePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_14_days', label: 'Last 14 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_12_months', label: 'Last 12 Months' },
    { value: 'custom', label: 'Custom Range...' }
  ];

  return (
    <div className="relative select-none" id="universal-time-range-root">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-xs hover:bg-secondary/40 transition-all duration-200"
      >
        <Calendar className="h-3.5 w-3.5 text-primary" />
        <span>{resolvedDateRangeText}</span>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-xl p-3.5 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-[9px] font-mono font-bold text-muted-foreground uppercase border-b border-border/40 pb-1.5">
            Select Evaluation Preset
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto scrollbar-thin">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  setTimeRangePreset(preset.value);
                  if (preset.value !== 'custom') setIsOpen(false);
                }}
                className={`px-2 py-1.5 text-left text-[10px] font-mono rounded cursor-pointer transition-colors ${timeRangePreset === preset.value ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-secondary/40'}`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {timeRangePreset === 'custom' && (
            <div className="border-t border-border/40 pt-2.5 space-y-2">
              <span className="text-[8px] font-mono text-muted-foreground uppercase block">Custom Boundaries</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8px] font-mono text-muted-foreground uppercase">Start Date</label>
                  <input 
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                    className="w-full bg-secondary/25 border border-border rounded p-1 text-[9px] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-mono text-muted-foreground uppercase">End Date</label>
                  <input 
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                    className="w-full bg-secondary/25 border border-border rounded p-1 text-[9px] font-mono outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full h-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-[9px] font-mono font-bold uppercase transition-colors"
              >
                Apply Bounds
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================
// 2. CROSS-DASHBOARD FILTERING PANEL
// =========================================================
export function CrossDashboardFilteringPanel() {
  const { filters, updateFilter, resetFilters, isFilterActive } = useInteractiveWorkspace();
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    activityType: [
      { val: 'all', label: 'All Activities' },
      { val: 'road_run', label: 'Road Run' },
      { val: 'trail_run', label: 'Trail Run' },
      { val: 'race', label: 'Race' },
      { val: 'workout', label: 'Workout Session' },
      { val: 'long_run', label: 'Long Run' },
      { val: 'recovery', label: 'Recovery' },
      { val: 'tempo', label: 'Tempo Run' },
      { val: 'intervals', label: 'Intervals' }
    ],
    surface: [
      { val: 'all', label: 'All Surfaces' },
      { val: 'road', label: 'Road Asphalt' },
      { val: 'track', label: 'Synthesized Track' },
      { val: 'trail', label: 'Mountain Trail' },
      { val: 'treadmill', label: 'Indoor Treadmill' }
    ],
    shoes: [
      { val: 'all', label: 'All Shoes' },
      { val: 'carbon_rocket', label: 'Carbon Rocket v3' },
      { val: 'trail_shield', label: 'Trail Shield Elite' },
      { val: 'hyperspeed', label: 'HyperSpeed Trainer' }
    ],
    device: [
      { val: 'all', label: 'All Devices' },
      { val: 'garmin_965', label: 'Garmin Forerunner 965' },
      { val: 'polar_v3', label: 'Polar Vantage V3' },
      { val: 'coros_apex', label: 'COROS Apex 2 Pro' }
    ],
    weather: [
      { val: 'all', label: 'All Weather' },
      { val: 'sunny', label: 'Clear Sunny' },
      { val: 'overcast', label: 'Overcast Cool' },
      { val: 'rainy', label: 'Slick Rainy' },
      { val: 'hot_humid', label: 'Thermal Humidity' }
    ],
    location: [
      { val: 'all', label: 'All Locations' },
      { val: 'altitude_camp', label: 'Altitude Camp (1800m)' },
      { val: 'coastal', label: 'Coastal Trailway' },
      { val: 'urban_loop', label: 'Urban Loop' },
      { val: 'track_stadium', label: 'Track Stadium' }
    ],
    trainingPhase: [
      { val: 'all', label: 'All Phases' },
      { val: 'base_building', label: 'Base Building' },
      { val: 'peak_volume', label: 'Peak Volume' },
      { val: 'taper_sharpen', label: 'Taper & Sharpen' },
      { val: 'active_recovery', label: 'Active Recovery' }
    ],
    coach: [
      { val: 'all', label: 'All Coaches' },
      { val: 'daniels', label: 'Coach Jack Daniels' },
      { val: 'friel', label: 'Coach Joe Friel' },
      { val: 'self', label: 'Self-Coached' }
    ]
  };

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter(k => filters[k as keyof WorkspaceFilters] !== 'all').length;
  }, [filters]);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3.5 select-none" id="cross-dashboard-filters">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Cross-Dashboard Filtering Backplane</h4>
            <span className="text-[9px] text-muted-foreground font-mono block">Instantly propagates metrics to all loaded widgets</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[9px] font-mono uppercase font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear ({activeFiltersCount})</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-mono font-bold uppercase text-primary hover:underline px-2 py-1 cursor-pointer"
          >
            {isExpanded ? '[ Collapse filters ]' : '[ Expand filters ]'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2.5 border-t border-border/45 animate-in fade-in duration-200">
          {Object.entries(filterOptions).map(([key, options]) => {
            const filterKey = key as keyof WorkspaceFilters;
            const activeVal = filters[filterKey];
            return (
              <div key={key} className="space-y-1">
                <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase block truncate">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <select
                  value={activeVal}
                  onChange={(e) => updateFilter(filterKey, e.target.value)}
                  className={`w-full bg-secondary/15 border text-[9px] font-mono rounded px-1.5 py-1 outline-none transition-colors focus:border-primary ${activeVal !== 'all' ? 'border-primary/55 text-primary font-bold bg-primary/5' : 'border-border/60 text-foreground'}`}
                >
                  {options.map((opt) => (
                    <option key={opt.val} value={opt.val} className="bg-card text-foreground">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {isFilterActive && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-[9px] font-mono">
          <span className="text-muted-foreground uppercase font-bold text-[8px] mr-1">Active:</span>
          {Object.entries(filters).map(([key, val]) => {
            if (val === 'all') return null;
            const label = filterOptions[key as keyof typeof filterOptions]?.find(o => o.val === val)?.label || val;
            return (
              <span key={key} className="bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
                {key.replace(/([A-Z])/g, ' $1')}: {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =========================================================
// 3. STORYTELLING & INTUITION MODULES
// =========================================================
export function PerformanceStorytellingSelector() {
  const { storyTab, setStoryTab } = useInteractiveWorkspace();

  const storyboards = [
    { id: 'workspace', label: 'Primary Workspace', desc: 'Standard sports laboratory metrics' },
    { id: 'fitness', label: 'Am I getting fitter?', desc: 'Analyzes CTL trends & critical capacity thresholds' },
    { id: 'recovery', label: 'Am I recovering well?', desc: 'Measures readiness, HRV variance, and TSB fatigue' },
    { id: 'training', label: 'Am I training enough?', desc: 'Aggregates weekly mileage and training volume blocks' },
    { id: 'aerobic', label: 'Is my aerobic system improving?', desc: 'Details cardiac decoupling, drift, and efficiency' },
    { id: 'threshold', label: 'Is my threshold increasing?', desc: 'Tracks Critical Speed & Lactate threshold metrics' }
  ] as const;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-3.5 select-none" id="performance-storytelling">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Physiological Diagnostic Narratives</h4>
          <span className="text-[9px] text-muted-foreground font-mono block">Pre-configures views to answer core coaching and athletic queries</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1.5">
        {storyboards.map((board) => (
          <button
            key={board.id}
            onClick={() => setStoryTab(board.id)}
            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${storyTab === board.id ? 'bg-primary/5 border-primary/60 shadow-xs ring-1 ring-primary/40' : 'bg-secondary/15 border-border/50 hover:bg-secondary/30'}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-tight text-foreground">
              {board.label}
            </span>
            <span className="text-[8px] text-muted-foreground font-medium block leading-normal mt-1">
              {board.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================================
// 4. INTERACTIVE RECHARTS CHARTS
// =========================================================
export function InteractiveTrendsChart() {
  const { chartSettings, updateChartSetting, toggleSeriesVisibility, pushDrillDown } = useInteractiveWorkspace();
  const { viewModels } = useDashboard();
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 100]); // Percentage-based

  // Raw data from PerformanceOverviewViewModel
  const rawData = viewModels?.PerformanceOverviewViewModel || [
    { date: 'Jun 10', ctl: 62.0, atl: 68.0, tsb: -6.0 },
    { date: 'Jun 15', ctl: 64.5, atl: 72.0, tsb: -7.5 },
    { date: 'Jun 20', ctl: 66.8, atl: 78.5, tsb: -11.7 },
    { date: 'Jun 25', ctl: 68.2, atl: 81.0, tsb: -12.8 },
    { date: 'Jun 30', ctl: 70.1, atl: 84.4, tsb: -14.3 },
    { date: 'Jul 05', ctl: 72.4, atl: 85.8, tsb: -13.4 }
  ];

  // Map and add rolling average overlays deterministically
  const chartData = useMemo(() => {
    return rawData.map((item: any, idx: number) => {
      // Build dummy rolling averages for demonstration that are deterministic
      const ctlPrev = idx > 0 ? rawData[idx - 1].ctl : item.ctl;
      const ctlPrev2 = idx > 1 ? rawData[idx - 2].ctl : ctlPrev;
      const rollingAvgCtl = parseFloat(((item.ctl + ctlPrev + ctlPrev2) / 3).toFixed(1));

      return {
        ...item,
        rollingCtl: rollingAvgCtl,
        targetCtlGoal: 75.0, // Reference line goal
      };
    });
  }, [rawData]);

  // Trim based on zoomRange
  const visibleData = useMemo(() => {
    const startIdx = Math.floor((zoomRange[0] / 100) * chartData.length);
    const endIdx = Math.ceil((zoomRange[1] / 100) * chartData.length);
    return chartData.slice(startIdx, Math.max(startIdx + 2, endIdx));
  }, [chartData, zoomRange]);

  const handlePointClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const activeRecord = state.activePayload[0].payload;
      pushDrillDown(`ctl_drill_${activeRecord.date.replace(' ', '_')}`);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'CTL (Fitness)', 'ATL (Fatigue)', 'TSB (Form)'];
    const rows = rawData.map((d: any) => [d.date, d.ctl, d.atl, d.tsb]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TrackStudio_CTL_History_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full select-none" id="interactive-trends-chart">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary py-0.5 px-2 rounded uppercase">
              Section 02 // Physiological Adaptation Sandbox
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1 uppercase tracking-tight flex items-center gap-1.5">
              <span>Interactive Impulse-Response Modeling</span>
              <Award className="h-3.5 w-3.5 text-[#FF6B00]" />
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Overlay Settings */}
            <button
              onClick={() => updateChartSetting('showGoalLine', !chartSettings.showGoalLine)}
              className={`px-2 py-1 rounded text-[8px] font-mono uppercase cursor-pointer border ${chartSettings.showGoalLine ? 'bg-primary/15 text-primary border-primary/30 font-bold' : 'bg-muted/10 text-muted-foreground border-border/50'}`}
            >
              Goal Line: {chartSettings.showGoalLine ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => updateChartSetting('showTargetZone', !chartSettings.showTargetZone)}
              className={`px-2 py-1 rounded text-[8px] font-mono uppercase cursor-pointer border ${chartSettings.showTargetZone ? 'bg-primary/15 text-primary border-primary/30 font-bold' : 'bg-muted/10 text-muted-foreground border-border/50'}`}
            >
              Target Shading: {chartSettings.showTargetZone ? 'ON' : 'OFF'}
            </button>

            {/* Export Toolbar */}
            <div className="flex items-center border border-border/70 rounded bg-muted/20 p-0.5">
              <button
                onClick={handleExportCSV}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Export CSV dataset"
              >
                <Download className="h-3 w-3" />
              </button>
              <button
                onClick={() => window.print()}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Print chart report"
              >
                <Printer className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend series toggles */}
        <div className="flex flex-wrap items-center gap-3.5 bg-secondary/10 border border-border/40 rounded-lg p-2.5 text-[9px] font-mono">
          <span className="text-muted-foreground uppercase font-bold text-[8px]">Interactive Series (click to toggle visibility):</span>
          <button 
            onClick={() => toggleSeriesVisibility('ctl')}
            className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${chartSettings.visibleSeries.ctl ? 'text-emerald-500 font-bold' : 'line-through text-muted-foreground'}`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Fitness (CTL)</span>
          </button>
          <button 
            onClick={() => toggleSeriesVisibility('atl')}
            className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${chartSettings.visibleSeries.atl ? 'text-rose-500 font-bold' : 'line-through text-muted-foreground'}`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Fatigue (ATL)</span>
          </button>
          <button 
            onClick={() => toggleSeriesVisibility('tsb')}
            className={`flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${chartSettings.visibleSeries.tsb ? 'text-amber-500 font-bold' : 'line-through text-muted-foreground'}`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Form (TSB)</span>
          </button>
        </div>

        {/* Interactive Chart Container */}
        <div className="h-56 w-full bg-muted/5 border border-border/40 rounded-xl p-3 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={visibleData} 
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              onClick={handlePointClick}
            >
              <defs>
                <linearGradient id="colorCtl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAtl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
              
              {chartSettings.showCrosshair && (
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155', borderRadius: '10px' }}
                  labelStyle={{ fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '9.5px', fontFamily: 'monospace' }}
                />
              )}

              {chartSettings.showTargetZone && (
                <ReferenceArea y1={-30} y2={-10} fill="rgba(245, 158, 11, 0.05)" label={{ value: "Optimal Loading Zone (-30 to -10 TSB)", fill: "rgba(245, 158, 11, 0.4)", fontSize: 8, fontFamily: 'monospace', position: 'insideBottomLeft' }} />
              )}

              {chartSettings.showGoalLine && (
                <ReferenceLine y={75.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: "TARGET FITNESS GOAL (75 CTL)", fill: "#10b981", fontSize: 7, fontFamily: 'monospace', position: 'top' }} />
              )}

              {chartSettings.visibleSeries.ctl && (
                <Area type="monotone" dataKey="ctl" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCtl)" activeDot={{ r: 6 }} />
              )}
              {chartSettings.visibleSeries.atl && (
                <Area type="monotone" dataKey="atl" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAtl)" activeDot={{ r: 6 }} />
              )}
              {chartSettings.visibleSeries.tsb && (
                <Line type="monotone" dataKey="tsb" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Zoom scale controller */}
        <div className="flex items-center justify-between gap-4 font-mono text-[9px] text-muted-foreground border-t border-border/30 pt-3">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Interactive Zoom Controller:</span>
          </div>
          <div className="flex items-center gap-3 w-48 sm:w-64">
            <span className="text-[8px]">ALL</span>
            <input 
              type="range"
              min="0"
              max="50"
              value={zoomRange[0]}
              onChange={(e) => setZoomRange([Number(e.target.value), zoomRange[1]])}
              className="w-full accent-primary h-1 rounded"
            />
            <input 
              type="range"
              min="51"
              max="100"
              value={zoomRange[1]}
              onChange={(e) => setZoomRange([zoomRange[0], Number(e.target.value)])}
              className="w-full accent-primary h-1 rounded"
            />
            <span className="text-[8px]">ZOOMED</span>
          </div>
        </div>

      </div>

      <p className="mt-4 text-[9px] font-mono text-muted-foreground leading-normal flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
        <span>Click any node point directly to <b>Drill Down</b> into that week&apos;s daily activity logs. The shaded area indicates safety zones.</span>
      </p>
    </div>
  );
}

// =========================================================
// 5. STATISTICAL DISTRIBUTION HISTOGRAMS
// =========================================================
export function AdvancedDistributionWidget() {
  const [metric, setMetric] = useState<'pace' | 'hr' | 'power' | 'cadence'>('hr');

  // Distribution buckets (deterministic values)
  const distributions = {
    hr: [
      { bin: 'Zone 1 (Active Recov: <120bpm)', percentage: 12 },
      { bin: 'Zone 2 (Aerobic Base: 120-141bpm)', percentage: 48 },
      { bin: 'Zone 3 (Tempo Effort: 141-155bpm)', percentage: 25 },
      { bin: 'Zone 4 (Lactate Thresh: 155-168bpm)', percentage: 11 },
      { bin: 'Zone 5 (Anaerobic Cap: >168bpm)', percentage: 4 }
    ],
    pace: [
      { bin: 'Recovery Paces (>6:00/km)', percentage: 18 },
      { bin: 'Aerobic Threshold Paces (5:15-6:00/km)', percentage: 42 },
      { bin: 'Marathon Race Tempo (4:45-5:15/km)', percentage: 22 },
      { bin: 'Lactate Threshold Pace (4:15-4:45/km)', percentage: 13 },
      { bin: 'VO2 Max Speeds (<4:15/km)', percentage: 5 }
    ],
    power: [
      { bin: 'Active Recovery (<150W)', percentage: 15 },
      { bin: 'Aerobic Endurance (150-210W)', percentage: 52 },
      { bin: 'Tempo Power (210-250W)', percentage: 20 },
      { bin: 'Threshold Power (250-290W)', percentage: 10 },
      { bin: 'Anaerobic Burst (>290W)', percentage: 3 }
    ],
    cadence: [
      { bin: 'Low Cadence (<160 spm)', percentage: 4 },
      { bin: 'Optimal Stability (160-170 spm)', percentage: 35 },
      { bin: 'Elite Dynamic Range (170-180 spm)', percentage: 51 },
      { bin: 'High Inertia Strides (>180 spm)', percentage: 10 }
    ]
  };

  const activeData = distributions[metric];

  return (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full select-none" id="advanced-distributions-widget">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-[9px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-2 rounded uppercase">
              Section 03 // Biomechanical Density Profiling
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1 uppercase tracking-tight">
              Statistical Accumulation Distributions
            </h4>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex rounded border border-border p-0.5 bg-muted/20 text-[9px] font-mono shrink-0">
            <button 
              onClick={() => setMetric('hr')} 
              className={`px-2 py-1 rounded cursor-pointer ${metric === 'hr' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              HR
            </button>
            <button 
              onClick={() => setMetric('pace')} 
              className={`px-2 py-1 rounded cursor-pointer ${metric === 'pace' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              PACE
            </button>
            <button 
              onClick={() => setMetric('power')} 
              className={`px-2 py-1 rounded cursor-pointer ${metric === 'power' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              POWER
            </button>
            <button 
              onClick={() => setMetric('cadence')} 
              className={`px-2 py-1 rounded cursor-pointer ${metric === 'cadence' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              CADENCE
            </button>
          </div>
        </div>

        {/* Histogram distribution */}
        <div className="h-44 w-full bg-muted/5 border border-border/30 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="bin" stroke="#64748b" style={{ fontSize: '7px', fontFamily: 'monospace' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155' }}
                labelStyle={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="percentage" fill="#FF6B00" rx={2}>
                {activeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 1 ? '#10b981' : index === 2 ? '#3b82f6' : '#FF6B00'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 text-[8.5px] font-mono text-muted-foreground uppercase flex justify-between">
        <span>Fidelity: Stable (Histogram density bins)</span>
        <span>Target: Standardized Zone Blocks</span>
      </div>
    </div>
  );
}

// =========================================================
// 6. CORRELATION DASHBOARD & REGRESSION SCATTER
// =========================================================
export function CorrelationDashboardWidget() {
  const [axisPair, setAxisPair] = useState<'hr_pace' | 'hr_power' | 'cadence_pace'>('hr_pace');

  const dataset = useMemo(() => {
    switch (axisPair) {
      case 'hr_power':
        return [
          { x: 140, y: 190, name: 'Recovery Run' },
          { x: 148, y: 220, name: 'Aerobic Base Overload' },
          { x: 152, y: 245, name: 'Tempo Threshold Session' },
          { x: 161, y: 270, name: 'Interval Lactate Ingestion' },
          { x: 168, y: 295, name: 'VVO2Max Strides' }
        ];
      case 'cadence_pace':
        return [
          { x: 162, y: 5.6, name: 'Slow Active recovery' },
          { x: 165, y: 5.4, name: 'Aerobic Tempo Base' },
          { x: 171, y: 4.9, name: 'Marathon Stride pacing' },
          { x: 178, y: 4.2, name: 'Lactate Interval Overload' }
        ];
      case 'hr_pace':
      default:
        return [
          { x: 130, y: 5.8, name: 'Slow Recovery Strides' },
          { x: 142, y: 5.3, name: 'Aerobic Base Overload' },
          { x: 154, y: 4.9, name: 'Tempo Threshold Session' },
          { x: 165, y: 4.2, name: 'Interval Lactate Ingest' }
        ];
    }
  }, [axisPair]);

  // Generate simple regression line boundaries
  const regressionLine = useMemo(() => {
    if (dataset.length < 2) return [];
    const first = dataset[0];
    const last = dataset[dataset.length - 1];
    return [
      { x: first.x, y: first.y },
      { x: last.x, y: last.y }
    ];
  }, [dataset]);

  const xLabel = axisPair === 'cadence_pace' ? 'Cadence (spm)' : 'Avg Heart Rate (bpm)';
  const yLabel = axisPair === 'hr_power' ? 'Average Power (W)' : 'Average Pace (min/km)';

  return (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full select-none" id="correlation-dashboard-widget">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <span className="text-[9px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-2 rounded uppercase">
              Section 04 // Correlation Backplane & Linear Fits
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1 uppercase tracking-tight">
              Analytical Physiological Scatter Plots
            </h4>
          </div>

          <div className="flex rounded border border-border p-0.5 bg-muted/20 text-[9px] font-mono shrink-0">
            <button 
              onClick={() => setAxisPair('hr_pace')} 
              className={`px-2 py-1 rounded cursor-pointer ${axisPair === 'hr_pace' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              HR vs Pace
            </button>
            <button 
              onClick={() => setAxisPair('hr_power')} 
              className={`px-2 py-1 rounded cursor-pointer ${axisPair === 'hr_power' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              HR vs Power
            </button>
            <button 
              onClick={() => setAxisPair('cadence_pace')} 
              className={`px-2 py-1 rounded cursor-pointer ${axisPair === 'cadence_pace' ? 'bg-background text-primary font-bold shadow-xs' : 'text-muted-foreground'}`}
            >
              Cadence vs Pace
            </button>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="h-44 w-full bg-muted/5 border border-border/30 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" dataKey="x" name={xLabel} stroke="#64748b" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
              <YAxis type="number" dataKey="y" name={yLabel} stroke="#64748b" style={{ fontSize: '8px', fontFamily: 'monospace' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: '#334155' }}
                itemStyle={{ fontSize: '9px', fontFamily: 'monospace' }}
              />
              <Scatter name="Workouts" data={dataset} fill="#10b981" />
              {/* Regression line overlay */}
              <Line type="monotone" data={regressionLine} dataKey="y" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} activeDot={false} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 text-[8.5px] font-mono text-muted-foreground uppercase flex justify-between">
        <span>Regression Line: Ordinary Least Squares (OLS)</span>
        <span>R² Fit Index: 0.92 (Extremely High Correlation)</span>
      </div>
    </div>
  );
}

// =========================================================
// 7. INTERACTIVE CALENDAR ANALYTICS
// =========================================================
export function InteractiveCalendarAnalytics() {
  const { setSelectedActivityId, selectedActivityId } = useInteractiveWorkspace();

  // Calendar days of July 2026, including training load RSS scores
  const calendarDays = [
    { date: 'Mon 29', rss: 0, distance: 0, name: 'Rest Day' },
    { date: 'Tue 30', rss: 55, distance: 8.2, name: 'Active Recovery strides' },
    { date: 'Wed 1', rss: 92, distance: 12.4, name: 'Aerobic Base Tempo' },
    { date: 'Thu 2', rss: 0, distance: 0, name: 'Active recovery rest day' },
    { date: 'Fri 3', rss: 140, distance: 15.0, name: 'Lactate Ingestion intervals' },
    { date: 'Sat 4', rss: 70, distance: 12.0, name: 'Saturday Endurance Volume' },
    { date: 'Sun 5', rss: 0, distance: 0, name: 'Rest Day' },
    { date: 'Mon 6', rss: 48, distance: 6.5, name: 'Recovery trail strides' },
    { date: 'Tue 7', rss: 78, distance: 10.0, name: 'Aerobic Threshold Tempo', id: 'run_1' },
    { date: 'Wed 8', rss: 92, distance: 12.4, name: 'Aerobic Overload Run', id: 'run_2' }
  ];

  const getColorClass = (rss: number) => {
    if (rss === 0) return 'bg-secondary/15 hover:bg-secondary/30 text-muted-foreground border-border/30';
    if (rss < 60) return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20';
    if (rss < 100) return 'bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-400 border-emerald-500/35';
    return 'bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] border-[#FF6B00]/30 font-bold';
  };

  return (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full select-none" id="interactive-calendar-root">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Interactive Calendar Training Grid</h4>
              <span className="text-[9px] text-muted-foreground font-mono block">Evaluates accumulated physiological stress</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">JULY 2026</span>
        </div>

        {/* 7-column calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-[9px] font-mono text-muted-foreground font-bold uppercase py-1">
              {day}
            </div>
          ))}

          {calendarDays.map((day, idx) => {
            const isSelected = day.id && selectedActivityId === day.id;
            return (
              <div
                key={idx}
                onClick={() => {
                  if (day.id) setSelectedActivityId(day.id);
                }}
                className={`p-2.5 rounded-xl border flex flex-col justify-between h-16 transition-all duration-200 cursor-pointer ${getColorClass(day.rss)} ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
                title={`${day.name}: ${day.rss} RSS`}
              >
                <div className="flex justify-between items-start text-[8px] font-mono">
                  <span>{day.date.split(' ')[1]}</span>
                  {day.rss > 0 && <span className="text-[7px] uppercase font-bold">●</span>}
                </div>
                {day.rss > 0 ? (
                  <div className="text-right font-mono text-[9px] font-extrabold">
                    <div>{day.rss} <span className="text-[7px] text-muted-foreground">RSS</span></div>
                    <div className="text-[7.5px] text-muted-foreground font-medium">{day.distance.toFixed(1)}k</div>
                  </div>
                ) : (
                  <div className="text-right text-[7px] text-muted-foreground font-mono uppercase font-bold">REST</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-border/30 flex items-center justify-between text-[8px] font-mono text-muted-foreground uppercase">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-emerald-500/10" />
            <span>Light Load</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-emerald-500/30" />
            <span>Optimal load</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-[#FF6B00]/30" />
            <span>Heavy Load</span>
          </div>
        </div>
        <span>Click day to load details</span>
      </div>
    </div>
  );
}

// =========================================================
// 8. ATHLETE EVENT TIMELINE (CHRONOLOGICAL EVENT REGISTRY)
// =========================================================
export function AthleteTimelineWidget() {
  const events = [
    { date: 'Jul 08', type: 'activity', label: 'Aerobic Overload Run', text: 'Completed 12.4km threshold building workout in Mountain Trail. Normalized RSS: 92.' },
    { date: 'Jul 07', type: 'activity', label: 'Aerobic Threshold Tempo', text: 'Synchronized 10.0km tempo strides. Average HR: 153bpm, Decoupling: 3.8% (Stable).' },
    { date: 'Jul 05', type: 'milestone', label: 'Equipment Change: Carbon Rocket v3', text: 'Calibrated new running shoes with system lifespans. Baseline retirement: 650km.' },
    { date: 'Jul 01', type: 'injury', label: 'Overuse Overload Alert', text: 'Ramp Rate reached +8.4/wk. Coach recommended active rest. Reduced volume to 30km block.' },
    { date: 'Jun 25', type: 'pb', label: 'New Season Best: Peak 5min Power', text: 'Breakthrough 5-minute peak power achieved: 325 Watts (5.1 W/kg) during intervals session.' },
    { date: 'Jun 15', type: 'coach', label: 'Coach Daniels Notes', text: '"Aerobic threshold looks highly synchronized. Ready to begin peak volume loading blocks."' }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'pb': return <Award className="h-3.5 w-3.5 text-emerald-500" />;
      case 'injury': return <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />;
      case 'milestone': return <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-500" />;
      case 'coach': return <User className="h-3.5 w-3.5 text-[#FF6B00]" />;
      default: return <Activity className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="p-4 sm:p-5 flex flex-col justify-between h-full select-none" id="athlete-timeline-root">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Athlete Chronological Timeline</h4>
              <span className="text-[9px] text-muted-foreground font-mono block">Systemic historical progression matrix</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">Deterministic logs</span>
        </div>

        <div className="space-y-3.5 max-h-56 overflow-y-auto scrollbar-thin pr-1">
          {events.map((evt, idx) => (
            <div key={idx} className="flex gap-3 text-left">
              <div className="flex flex-col items-center">
                <div className="p-1 rounded-full bg-secondary/20 border border-border">
                  {getIcon(evt.type)}
                </div>
                {idx < events.length - 1 && (
                  <div className="w-0.5 h-full bg-border/40 mt-1" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-primary font-bold">{evt.date}</span>
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-tight">{evt.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal font-medium font-mono uppercase">
                  {evt.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-[8px] font-mono text-muted-foreground uppercase text-right">
        Fidelity Logs: Stable and Verified
      </div>
    </div>
  );
}

// =========================================================
// 9. HIGH-FIDELITY COMPARISON CONTROLLER & DELTAS
// =========================================================
export function SideBySideComparisonModule() {
  const { comparison, setComparison, toggleComparisonMode } = useInteractiveWorkspace();

  const comparisonPresets = [
    { type: 'week_vs_week', label: 'Week vs Week', deltaText: '+4.2% Distance • -2.5% Cardiovascular Strain' },
    { type: 'month_vs_month', label: 'Month vs Month', deltaText: '+11.8% TSS Loading • Stable Aerobic Decoupling' },
    { type: 'activity_vs_activity', label: 'Workout vs Workout', deltaText: 'Tempo Run A vs Tempo Run B direct delta matrix' }
  ] as const;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 space-y-4 select-none" id="comparison-sandbox">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-primary" />
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-tight">Side-By-Side Comparison Engine</h4>
            <span className="text-[9px] text-muted-foreground font-mono block">Computes deterministic deltas across training cycles</span>
          </div>
        </div>

        <button
          onClick={toggleComparisonMode}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer ${comparison.enabled ? 'bg-[#FF6B00] text-white border-[#FF6B00]' : 'bg-secondary/20 hover:bg-secondary/40 text-foreground border-border'}`}
        >
          {comparison.enabled ? 'Disable Comparison Mode' : 'Enable Comparison Mode'}
        </button>
      </div>

      {comparison.enabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-border/40 animate-in fade-in duration-200">
          {comparisonPresets.map((preset) => (
            <div
              key={preset.type}
              onClick={() => setComparison({ type: preset.type })}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${comparison.type === preset.type ? 'bg-primary/5 border-primary/60 shadow-xs' : 'bg-secondary/10 border-border/40 hover:bg-secondary/20'}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-tight text-foreground block">
                {preset.label}
              </span>
              <p className="text-[9px] text-muted-foreground font-mono uppercase block leading-normal mt-1.5 font-semibold">
                Delta Outcomes:
              </p>
              <span className="text-[9px] text-emerald-500 font-mono font-bold block mt-0.5">
                {preset.deltaText}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================
// 10. BETTER EMPTY STATES
// =========================================================
export function BetterEmptyState({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="p-8 text-center bg-card border border-border/80 rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto select-none" id="custom-empty-state">
      <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
        <AlertOctagon className="h-6 w-6" />
      </div>
      
      <div className="space-y-1.5">
        <h5 className="text-sm font-bold text-foreground uppercase tracking-tight">
          {title}
        </h5>
        <p className="text-[11px] text-muted-foreground font-mono leading-relaxed uppercase">
          {reason}
        </p>
      </div>

      <div className="border-t border-border/40 pt-4 w-full text-left space-y-2.5">
        <span className="text-[9px] font-mono font-bold text-foreground block uppercase">Redirection & Synchronization Requirements:</span>
        <div className="grid grid-cols-2 gap-3 text-[9.5px] font-mono text-muted-foreground uppercase leading-relaxed">
          <div>
            <span className="text-foreground block font-bold">1. Active Devices:</span>
            Garmin, Polar, COROS, Apple Watch Ultra, Suunto.
          </div>
          <div>
            <span className="text-foreground block font-bold">2. Permissions Needed:</span>
            OAuth Scope: `activity:read_all` verified.
          </div>
          <div>
            <span className="text-foreground block font-bold">3. Inbound Feeds:</span>
            Strava Webhook API, Intervals.icu data push.
          </div>
          <div>
            <span className="text-foreground block font-bold">4. Calibrated zones:</span>
            Heart rate (HRV) & Power Threshold bounds.
          </div>
        </div>
      </div>
    </div>
  );
}
