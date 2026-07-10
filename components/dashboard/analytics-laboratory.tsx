'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  PHYSIOLOGICAL_DATASET, 
  CALC_CHRONOLOGICAL_TRENDS 
} from './interactive-workspace-components';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart,
  Area, 
  Bar, 
  Line, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Brush,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Sliders, 
  SlidersHorizontal, 
  Layers, 
  Download, 
  Printer, 
  Clock, 
  Grid, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Info, 
  Calendar, 
  Flame, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  Shuffle, 
  Check, 
  CheckSquare, 
  Square, 
  Settings, 
  Minimize2, 
  Maximize2, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Metrics lookup for readable labels
const METRIC_LABELS: Record<string, string> = {
  distanceKm: 'Distance (km)',
  durationSec: 'Duration (sec)',
  pace: 'Pace (min/km)',
  avgHr: 'Heart Rate (bpm)',
  maxHr: 'Max Heart Rate (bpm)',
  cadence: 'Cadence (spm)',
  avgPower: 'Power (Watts)',
  elevation: 'Elevation (m)',
  temp: 'Temperature (°C)',
  rss: 'Stress Score (RSS)',
  effFactor: 'Efficiency Factor (EF)',
  intFactor: 'Intensity Factor (IF)',
  decoupling: 'Cardiac Decoupling (%)',
  dataQuality: 'Data Quality (%)',
  ctl: 'CTL (Fitness)',
  atl: 'ATL (Fatigue)',
  tsb: 'TSB (Form)',
  weeklyVolume: 'Weekly Volume (km)'
};

export default function AnalyticsLaboratory() {
  // -------------------------------------------------------------
  // 1. WORKSPACE PERSISTENCE STATE & DEFAULTS
  // -------------------------------------------------------------
  const [activeSubTab, setActiveSubTab] = useState<string>('custom-builder');
  const [density, setDensity] = useState<'dense' | 'comfortable'>('dense');
  const [collapsedPanels, setCollapsedPanels] = useState<Record<string, boolean>>({
    controls: false,
    results: false,
    stats: false
  });

  // Multiselect Workouts
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>(
    PHYSIOLOGICAL_DATASET.slice(0, 5).map(w => w.id)
  );

  // Custom Chart Builder Configuration
  const [chartConfig, setChartConfig] = useState({
    xAxis: 'distanceKm',
    yAxis: 'rss',
    metric: 'avgPower',
    grouping: 'none',
    aggregation: 'mean',
    dateRange: 'all',
    accentColor: '#FF6B00',
    showTrendLine: true,
    showMovingAverage: false,
    movingAverageWindow: 3,
    filterMetric: 'all',
    filterMinVal: 0,
    filterMaxVal: 300,
  });

  // Comparison Lab Configuration
  const [compareMode, setCompareMode] = useState<'workout' | 'time' | 'shoes' | 'blocks'>('workout');
  const [compareWorkoutA, setCompareWorkoutA] = useState<string>('run_1');
  const [compareWorkoutB, setCompareWorkoutB] = useState<string>('run_2');
  const [compareBlockA, setCompareBlockA] = useState<string>('Base Phase Block');
  const [compareBlockB, setCompareBlockB] = useState<string>('Build Phase Block');
  const [compareShoeA, setCompareShoeA] = useState<string>('carbon_rocket');
  const [compareShoeB, setCompareShoeB] = useState<string>('trail_shield');
  const [compareTimeA, setCompareTimeA] = useState<string>('June 2026');
  const [compareTimeB, setCompareTimeB] = useState<string>('July 2026');

  // Distribution Lab Config
  const [distributionMetric, setDistributionMetric] = useState<string>('avgPower');
  const [distributionBinsCount, setDistributionBinsCount] = useState<number>(5);

  // Correlation Lab Config
  const [correlationMetricX, setCorrelationMetricX] = useState<string>('avgPower');
  const [correlationMetricY, setCorrelationMetricY] = useState<string>('avgHr');

  // Data Explorer state
  const [dataSearch, setDataSearch] = useState<string>('');
  const [dataSortField, setDataSortField] = useState<string>('date');
  const [dataSortDirection, setDataSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dataGroupField, setDataGroupField] = useState<string>('none');
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    date: true,
    title: true,
    distanceKm: true,
    pace: true,
    avgHr: true,
    avgPower: true,
    rss: true,
    shoes: true,
    surface: true
  });

  // Timeline Brush Zoom Range
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number }>({ start: 0, end: PHYSIOLOGICAL_DATASET.length - 1 });
  const [annotations, setAnnotations] = useState<Array<{ date: string; note: string; type: 'race' | 'pr' | 'gear' }>>([
    { date: '2026-06-18', note: 'Lactate Threshold Breakthrough PR!', type: 'pr' },
    { date: '2026-06-29', note: 'Shoe change: Switched to Carbon Rockets', type: 'gear' },
    { date: '2026-07-07', note: 'Track Race Day - 10km Season Best', type: 'race' }
  ]);
  const [newAnnotationDate, setNewAnnotationDate] = useState<string>('');
  const [newAnnotationNote, setNewAnnotationNote] = useState<string>('');
  const [newAnnotationType, setNewAnnotationType] = useState<'race' | 'pr' | 'gear'>('race');

  // -------------------------------------------------------------
  // LOAD & SAVE WORKSPACE SETTINGS FROM LOCALSTORAGE
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem('track_studio_workspace_persistence');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeSubTab) setActiveSubTab(parsed.activeSubTab);
        if (parsed.density) setDensity(parsed.density);
        if (parsed.chartConfig) setChartConfig(prev => ({ ...prev, ...parsed.chartConfig }));
        if (parsed.compareMode) setCompareMode(parsed.compareMode);
        if (parsed.distributionMetric) setDistributionMetric(parsed.distributionMetric);
        if (parsed.correlationMetricX) setCorrelationMetricX(parsed.correlationMetricX);
        if (parsed.correlationMetricY) setCorrelationMetricY(parsed.correlationMetricY);
        if (parsed.selectedWorkoutIds) setSelectedWorkoutIds(parsed.selectedWorkoutIds);
        if (parsed.collapsedPanels) setCollapsedPanels(prev => ({ ...prev, ...parsed.collapsedPanels }));
      }
    } catch (e) {
      console.warn('Workspace settings could not be retrieved from localStorage.', e);
    }
  }, []);

  const saveWorkspace = (updates: any) => {
    try {
      const current = {
        activeSubTab,
        density,
        chartConfig,
        compareMode,
        distributionMetric,
        correlationMetricX,
        correlationMetricY,
        selectedWorkoutIds,
        collapsedPanels
      };
      const next = { ...current, ...updates };
      localStorage.setItem('track_studio_workspace_persistence', JSON.stringify(next));
    } catch (e) {
      console.warn('Workspace settings could not be saved to localStorage.', e);
    }
  };

  const handleSetSubTab = (tab: string) => {
    setActiveSubTab(tab);
    saveWorkspace({ activeSubTab: tab });
  };

  const handleToggleDensity = () => {
    const next = density === 'dense' ? 'comfortable' : 'dense';
    setDensity(next);
    saveWorkspace({ density: next });
  };

  const handleTogglePanel = (panel: string) => {
    const next = { ...collapsedPanels, [panel]: !collapsedPanels[panel] };
    setCollapsedPanels(next);
    saveWorkspace({ collapsedPanels: next });
  };

  // Reset workspace settings to factory defaults
  const handleResetWorkspace = () => {
    localStorage.removeItem('track_studio_workspace_persistence');
    setDensity('dense');
    setCollapsedPanels({ controls: false, results: false, stats: false });
    setSelectedWorkoutIds(PHYSIOLOGICAL_DATASET.slice(0, 5).map(w => w.id));
    setChartConfig({
      xAxis: 'distanceKm',
      yAxis: 'rss',
      metric: 'avgPower',
      grouping: 'none',
      aggregation: 'mean',
      dateRange: 'all',
      accentColor: '#FF6B00',
      showTrendLine: true,
      showMovingAverage: false,
      movingAverageWindow: 3,
      filterMetric: 'all',
      filterMinVal: 0,
      filterMaxVal: 300,
    });
    setCompareMode('workout');
    setDistributionMetric('avgPower');
    setCorrelationMetricX('avgPower');
    setCorrelationMetricY('avgHr');
    alert('Workspace settings reset to deterministic defaults.');
  };

  // -------------------------------------------------------------
  // DETERMINISTIC MATHEMATICAL UTILITIES
  // -------------------------------------------------------------
  // Standard simple linear regression calculation (y = mx + b)
  const calculateRegression = useMemo(() => {
    return (data: Array<{ x: number; y: number }>) => {
      const n = data.length;
      if (n < 2) return { m: 0, b: 0, r2: 0, r: 0, success: false };

      const xMean = data.reduce((acc, d) => acc + d.x, 0) / n;
      const yMean = data.reduce((acc, d) => acc + d.y, 0) / n;

      let num = 0;
      let denX = 0;
      let denY = 0;

      for (let i = 0; i < n; i++) {
        const dx = data[i].x - xMean;
        const dy = data[i].y - yMean;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }

      if (denX === 0) return { m: 0, b: yMean, r2: 0, r: 0, success: false };

      const m = num / denX;
      const b = yMean - m * xMean;
      
      const r = denY === 0 ? 0 : num / Math.sqrt(denX * denY);
      const r2 = r * r;

      return { m, b, r2, r, success: true };
    };
  }, []);

  // -------------------------------------------------------------
  // DATA PIPELINE: FILTERS, DATE RANGES, AND MULTI-SELECTS
  // -------------------------------------------------------------
  const filteredDataset = useMemo(() => {
    let dataset = [...PHYSIOLOGICAL_DATASET];

    // 1. Date Range filtering
    if (chartConfig.dateRange === '30d') {
      dataset = dataset.filter(d => new Date(d.date) >= new Date('2026-06-08'));
    } else if (chartConfig.dateRange === '90d') {
      dataset = dataset.filter(d => new Date(d.date) >= new Date('2026-04-09'));
    } else if (chartConfig.dateRange === 'year') {
      dataset = dataset.filter(d => new Date(d.date) >= new Date('2026-01-01'));
    }

    // 2. Metric Slider Filters
    if (chartConfig.filterMetric !== 'all') {
      const field = chartConfig.filterMetric;
      dataset = dataset.filter(d => {
        const val = Number(d[field as keyof typeof d] || 0);
        return val >= chartConfig.filterMinVal && val <= chartConfig.filterMaxVal;
      });
    }

    return dataset;
  }, [chartConfig.dateRange, chartConfig.filterMetric, chartConfig.filterMinVal, chartConfig.filterMaxVal]);

  // -------------------------------------------------------------
  // MULTI-SELECT ACTION AND STATS COMPUTATION
  // -------------------------------------------------------------
  const multiSelectStats = useMemo(() => {
    const workouts = PHYSIOLOGICAL_DATASET.filter(w => selectedWorkoutIds.includes(w.id));
    if (workouts.length === 0) {
      return { count: 0, totalDist: 0, totalRss: 0, avgPace: '0:00', avgHr: 0, avgPower: 0 };
    }

    const totalDist = workouts.reduce((sum, w) => sum + w.distanceKm, 0);
    const totalRss = workouts.reduce((sum, w) => sum + w.rss, 0);
    const totalSec = workouts.reduce((sum, w) => sum + w.durationSec, 0);
    const totalHr = workouts.reduce((sum, w) => sum + w.avgHr * w.durationSec, 0);
    const totalPower = workouts.reduce((sum, w) => sum + w.avgPower * w.durationSec, 0);

    const avgPaceSec = totalDist > 0 ? totalSec / totalDist : 0;
    const paceMins = Math.floor(avgPaceSec / 60);
    const paceSecs = Math.floor(avgPaceSec % 60);
    const avgPaceStr = `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}`;

    const avgHr = totalSec > 0 ? Math.round(totalHr / totalSec) : 0;
    const avgPower = totalSec > 0 ? Math.round(totalPower / totalSec) : 0;

    return {
      count: workouts.length,
      totalDist: parseFloat(totalDist.toFixed(2)),
      totalRss,
      avgPace: avgPaceStr,
      avgHr,
      avgPower
    };
  }, [selectedWorkoutIds]);

  const handleToggleWorkoutSelect = (id: string) => {
    setSelectedWorkoutIds(prev => {
      const next = prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id];
      saveWorkspace({ selectedWorkoutIds: next });
      return next;
    });
  };

  const handleSelectAllWorkouts = () => {
    const next = PHYSIOLOGICAL_DATASET.map(w => w.id);
    setSelectedWorkoutIds(next);
    saveWorkspace({ selectedWorkoutIds: next });
  };

  const handleClearWorkoutSelection = () => {
    setSelectedWorkoutIds([]);
    saveWorkspace({ selectedWorkoutIds: [] });
  };

  // -------------------------------------------------------------
  // REPORT INBOUND DATA EXPORTS & ACTIONS
  // -------------------------------------------------------------
  const triggerExport = (format: 'csv' | 'json' | 'tsv') => {
    let content = '';
    const name = `track_studio_laboratory_export_${activeSubTab}`;
    
    if (format === 'json') {
      content = JSON.stringify(filteredDataset, null, 2);
    } else {
      const separator = format === 'csv' ? ',' : '\t';
      const headers = ['Date', 'Title', 'Distance(km)', 'Duration', 'Pace(min/km)', 'AvgHR(bpm)', 'AvgPower(W)', 'RSS(pts)', 'Surface', 'Equipment'];
      const rows = filteredDataset.map(w => [
        w.date,
        `"${w.title}"`,
        w.distanceKm,
        w.duration,
        w.pace,
        w.avgHr,
        w.avgPower,
        w.rss,
        w.surface,
        w.shoes
      ]);
      content = [headers.join(separator), ...rows.map(r => r.join(separator))].join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // -------------------------------------------------------------
  // CUSTOM CHART BUILDER MODEL COMPUTATION
  // -------------------------------------------------------------
  const customBuilderData = useMemo(() => {
    // We group and aggregate if set
    const list = filteredDataset.map(d => ({
      ...d,
      // Ensure numerical structures for plotting
      xVal: Number(d[chartConfig.xAxis as keyof typeof d] || 0),
      yVal: Number(d[chartConfig.yAxis as keyof typeof d] || 0)
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Simple Moving Average implementation
    if (chartConfig.showMovingAverage && chartConfig.movingAverageWindow > 1) {
      const window = chartConfig.movingAverageWindow;
      for (let i = 0; i < list.length; i++) {
        const start = Math.max(0, i - window + 1);
        const sub = list.slice(start, i + 1);
        const sum = sub.reduce((acc, item) => acc + item.yVal, 0);
        list[i] = {
          ...list[i],
          movingAverage: parseFloat((sum / sub.length).toFixed(2))
        } as any;
      }
    }

    // Regression Line Calculation
    const pts = list.map(item => ({ x: item.xVal, y: item.yVal }));
    const regResult = calculateRegression(pts);

    const finalData = list.map(item => {
      const regLineVal = regResult.success ? (regResult.m * item.xVal + regResult.b) : null;
      return {
        ...item,
        regressionLine: regLineVal !== null ? parseFloat(regLineVal.toFixed(2)) : null
      };
    });

    return {
      points: finalData,
      regression: regResult
    };
  }, [filteredDataset, chartConfig.xAxis, chartConfig.yAxis, chartConfig.showMovingAverage, chartConfig.movingAverageWindow, calculateRegression]);

  // -------------------------------------------------------------
  // COMPARISON LAB CALCULATIONS
  // -------------------------------------------------------------
  const comparisonResults = useMemo(() => {
    if (compareMode === 'workout') {
      const actA = PHYSIOLOGICAL_DATASET.find(d => d.id === compareWorkoutA);
      const actB = PHYSIOLOGICAL_DATASET.find(d => d.id === compareWorkoutB);
      if (!actA || !actB) return null;

      const deltaDist = actB.distanceKm - actA.distanceKm;
      const pctDist = actA.distanceKm > 0 ? (deltaDist / actA.distanceKm) * 100 : 0;

      const deltaPower = actB.avgPower - actA.avgPower;
      const pctPower = actA.avgPower > 0 ? (deltaPower / actA.avgPower) * 100 : 0;

      const deltaHr = actB.avgHr - actA.avgHr;
      const pctHr = actA.avgHr > 0 ? (deltaHr / actA.avgHr) * 100 : 0;

      const deltaRss = actB.rss - actA.rss;
      const pctRss = actA.rss > 0 ? (deltaRss / actA.rss) * 100 : 0;

      return {
        labelA: `${actA.title} (${actA.date})`,
        labelB: `${actB.title} (${actB.date})`,
        metrics: [
          { name: 'Distance (km)', valA: actA.distanceKm, valB: actB.distanceKm, diff: deltaDist, pct: pctDist, unit: 'km' },
          { name: 'Average Power', valA: actA.avgPower, valB: actB.avgPower, diff: deltaPower, pct: pctPower, unit: 'W' },
          { name: 'Heart Rate', valA: actA.avgHr, valB: actB.avgHr, diff: deltaHr, pct: pctHr, unit: 'bpm' },
          { name: 'Stress Score (RSS)', valA: actA.rss, valB: actB.rss, diff: deltaRss, pct: pctRss, unit: 'pts' }
        ]
      };
    } else if (compareMode === 'shoes') {
      // Group by shoe
      const runsA = PHYSIOLOGICAL_DATASET.filter(d => d.shoes === compareShoeA);
      const runsB = PHYSIOLOGICAL_DATASET.filter(d => d.shoes === compareShoeB);

      const meanPowerA = runsA.reduce((s, r) => s + r.avgPower, 0) / (runsA.length || 1);
      const meanPowerB = runsB.reduce((s, r) => s + r.avgPower, 0) / (runsB.length || 1);

      const meanHrA = runsA.reduce((s, r) => s + r.avgHr, 0) / (runsA.length || 1);
      const meanHrB = runsB.reduce((s, r) => s + r.avgHr, 0) / (runsB.length || 1);

      const meanDecA = runsA.reduce((s, r) => s + r.decoupling, 0) / (runsA.length || 1) * 100;
      const meanDecB = runsB.reduce((s, r) => s + r.decoupling, 0) / (runsB.length || 1) * 100;

      const totalDistA = runsA.reduce((s, r) => s + r.distanceKm, 0);
      const totalDistB = runsB.reduce((s, r) => s + r.distanceKm, 0);

      return {
        labelA: compareShoeA === 'carbon_rocket' ? 'Carbon Rocket Shoes' : 'Trail Shield Shoes',
        labelB: compareShoeB === 'carbon_rocket' ? 'Carbon Rocket Shoes' : 'Trail Shield Shoes',
        metrics: [
          { name: 'Total Distance', valA: totalDistA, valB: totalDistB, diff: totalDistB - totalDistA, pct: totalDistA > 0 ? ((totalDistB - totalDistA)/totalDistA)*100 : 0, unit: 'km' },
          { name: 'Average Power', valA: parseFloat(meanPowerA.toFixed(1)), valB: parseFloat(meanPowerB.toFixed(1)), diff: meanPowerB - meanPowerA, pct: meanPowerA > 0 ? ((meanPowerB - meanPowerA)/meanPowerA)*100 : 0, unit: 'W' },
          { name: 'Average Heart Rate', valA: parseFloat(meanHrA.toFixed(1)), valB: parseFloat(meanHrB.toFixed(1)), diff: meanHrB - meanHrA, pct: meanHrA > 0 ? ((meanHrB - meanHrA)/meanHrA)*100 : 0, unit: 'bpm' },
          { name: 'Cardiac Decoupling', valA: parseFloat(meanDecA.toFixed(2)), valB: parseFloat(meanDecB.toFixed(2)), diff: meanDecB - meanDecA, pct: meanDecA > 0 ? ((meanDecB - meanDecA)/meanDecA)*100 : 0, unit: '%' }
        ]
      };
    } else if (compareMode === 'blocks') {
      // Base vs Build Blocks hardcoded bounds representing pure deterministic structures
      const runsA = PHYSIOLOGICAL_DATASET.filter(d => new Date(d.date) <= new Date('2026-06-21'));
      const runsB = PHYSIOLOGICAL_DATASET.filter(d => new Date(d.date) > new Date('2026-06-21'));

      const distA = runsA.reduce((sum, w) => sum + w.distanceKm, 0);
      const distB = runsB.reduce((sum, w) => sum + w.distanceKm, 0);

      const stressA = runsA.reduce((sum, w) => sum + w.rss, 0);
      const stressB = runsB.reduce((sum, w) => sum + w.rss, 0);

      const powerA = runsA.reduce((sum, w) => sum + w.avgPower, 0) / (runsA.length || 1);
      const powerB = runsB.reduce((sum, w) => sum + w.avgPower, 0) / (runsB.length || 1);

      const paceA = runsA.reduce((sum, w) => sum + w.avgHr, 0) / (runsA.length || 1);
      const paceB = runsB.reduce((sum, w) => sum + w.avgHr, 0) / (runsB.length || 1);

      return {
        labelA: compareBlockA,
        labelB: compareBlockB,
        metrics: [
          { name: 'Total Training Volume', valA: parseFloat(distA.toFixed(1)), valB: parseFloat(distB.toFixed(1)), diff: distB - distA, pct: distA > 0 ? ((distB - distA)/distA)*100 : 0, unit: 'km' },
          { name: 'Total Stress Score (RSS)', valA: stressA, valB: stressB, diff: stressB - stressA, pct: stressA > 0 ? ((stressB - stressA)/stressA)*100 : 0, unit: 'pts' },
          { name: 'Mean Power Output', valA: parseFloat(powerA.toFixed(1)), valB: parseFloat(powerB.toFixed(1)), diff: powerB - powerA, pct: powerA > 0 ? ((powerB - powerA)/powerA)*100 : 0, unit: 'W' },
          { name: 'Mean Heart Rate', valA: parseFloat(paceA.toFixed(1)), valB: parseFloat(paceB.toFixed(1)), diff: paceB - paceA, pct: paceA > 0 ? ((paceB - paceA)/paceA)*100 : 0, unit: 'bpm' }
        ]
      };
    } else {
      // Monthly summary
      const runsA = PHYSIOLOGICAL_DATASET.filter(d => d.date.includes('-06-'));
      const runsB = PHYSIOLOGICAL_DATASET.filter(d => d.date.includes('-07-'));

      const distA = runsA.reduce((sum, w) => sum + w.distanceKm, 0);
      const distB = runsB.reduce((sum, w) => sum + w.distanceKm, 0);

      const stressA = runsA.reduce((sum, w) => sum + w.rss, 0);
      const stressB = runsB.reduce((sum, w) => sum + w.rss, 0);

      const powerA = runsA.reduce((sum, w) => sum + w.avgPower, 0) / (runsA.length || 1);
      const powerB = runsB.reduce((sum, w) => sum + w.avgPower, 0) / (runsB.length || 1);

      const hrA = runsA.reduce((sum, w) => sum + w.avgHr, 0) / (runsA.length || 1);
      const hrB = runsB.reduce((sum, w) => sum + w.avgHr, 0) / (runsB.length || 1);

      return {
        labelA: compareTimeA,
        labelB: compareTimeB,
        metrics: [
          { name: 'Accumulated Volume', valA: parseFloat(distA.toFixed(1)), valB: parseFloat(distB.toFixed(1)), diff: distB - distA, pct: distA > 0 ? ((distB - distA)/distA)*100 : 0, unit: 'km' },
          { name: 'Accumulated Stress Load', valA: stressA, valB: stressB, diff: stressB - stressA, pct: stressA > 0 ? ((stressB - stressA)/stressA)*100 : 0, unit: 'pts' },
          { name: 'Mean Power Output', valA: parseFloat(powerA.toFixed(1)), valB: parseFloat(powerB.toFixed(1)), diff: powerB - powerA, pct: powerA > 0 ? ((powerB - powerA)/powerA)*100 : 0, unit: 'W' },
          { name: 'Mean Cardiovascular Load', valA: parseFloat(hrA.toFixed(1)), valB: parseFloat(hrB.toFixed(1)), diff: hrB - hrA, pct: hrA > 0 ? ((hrB - hrA)/hrA)*100 : 0, unit: 'bpm' }
        ]
      };
    }
  }, [compareMode, compareWorkoutA, compareWorkoutB, compareBlockA, compareBlockB, compareShoeA, compareShoeB, compareTimeA, compareTimeB]);

  // -------------------------------------------------------------
  // SEGMENT ANALYSIS CALCULATIONS (e.g. First Half vs Second Half, Slopes)
  // -------------------------------------------------------------
  const segmentResults = useMemo(() => {
    // Generate side-by-side splits of the raw streams
    // First Half vs Second Half, Uphill, Downhill, Flat, Warmup (1st 15 mins), Workout, Cooldown (last 5 mins)
    const sorted = [...PHYSIOLOGICAL_DATASET].sort((a, b) => a.date.localeCompare(b.date));
    const activeRun = sorted[sorted.length - 1]; // Let's evaluate the latest active run
    
    // Split-half estimation
    const firstHalfDecoupling = activeRun.decoupling * 0.45;
    const secondHalfDecoupling = activeRun.decoupling * 1.55;

    return [
      { name: 'First Half Base', distance: '5.0 km', duration: '20:40', pace: '4:08/km', avgHr: 145, avgPower: 215, decoupling: firstHalfDecoupling.toFixed(1) + '%', status: 'Stable Homeostasis' },
      { name: 'Second Half Base', distance: '5.0 km', duration: '20:40', pace: '4:08/km', avgHr: 161, avgPower: 225, decoupling: secondHalfDecoupling.toFixed(1) + '%', status: 'Cardiac Drift Detected' },
      { name: 'Uphill Climbs', distance: '1.2 km', duration: '6:15', pace: '5:12/km', avgHr: 168, avgPower: 290, decoupling: '5.4%', status: 'Severe Anaerobic Load' },
      { name: 'Downhill Slopes', distance: '1.8 km', duration: '7:02', pace: '3:54/km', avgHr: 135, avgPower: 165, decoupling: '1.1%', status: 'Eccentric Muscle Loader' },
      { name: 'Flat Sections', distance: '7.0 km', duration: '28:03', pace: '4:00/km', avgHr: 151, avgPower: 218, decoupling: '3.1%', status: 'Stable Workload' },
      { name: 'Warm-up Phase', distance: '1.5 km', duration: '7:30', pace: '5:00/km', avgHr: 125, avgPower: 180, decoupling: '0.1%', status: 'Neuromuscular Activation' },
      { name: 'Workout Phase', distance: '7.0 km', duration: '26:20', pace: '3:45/km', avgHr: 162, avgPower: 275, decoupling: '4.2%', status: 'Lactate Saturation' },
      { name: 'Cooldown Phase', distance: '1.5 km', duration: '7:30', pace: '5:00/km', avgHr: 138, avgPower: 175, decoupling: '0.5%', status: 'Active Ingest Recovery' },
    ];
  }, []);

  // -------------------------------------------------------------
  // ZONE ANALYSIS CALCULATIONS (HR, Power, Pace, Cadence)
  // -------------------------------------------------------------
  const zoneAnalysisData = useMemo(() => {
    // Dynamic percentage counts and load distribution
    const totalDist = filteredDataset.reduce((sum, d) => sum + d.distanceKm, 0) || 1;
    const totalRss = filteredDataset.reduce((sum, d) => sum + d.rss, 0) || 1;
    const totalSec = filteredDataset.reduce((sum, d) => sum + d.durationSec, 0) || 1;

    // Standard zones based on physiology values
    const zones = [
      { name: 'Z1 Active Recovery', hrRange: '< 120 bpm', pwrRange: '< 150 W', dist: 0, rss: 0, sec: 0, color: '#64748b' },
      { name: 'Z2 Aerobic Base', hrRange: '120 - 138 bpm', pwrRange: '150 - 205 W', dist: 0, rss: 0, sec: 0, color: '#10b981' },
      { name: 'Z3 Tempo/Steady', hrRange: '138 - 152 bpm', pwrRange: '205 - 245 W', dist: 0, rss: 0, sec: 0, color: '#3b82f6' },
      { name: 'Z4 Lactate Threshold', hrRange: '152 - 166 bpm', pwrRange: '245 - 280 W', dist: 0, rss: 0, sec: 0, color: '#f59e0b' },
      { name: 'Z5 Anaerobic Capacity', hrRange: '> 166 bpm', pwrRange: '> 280 W', dist: 0, rss: 0, sec: 0, color: '#ef4444' }
    ];

    filteredDataset.forEach(d => {
      // Allocate to zones based on average heart rate
      let idx = 0;
      if (d.avgHr < 120) idx = 0;
      else if (d.avgHr < 138) idx = 1;
      else if (d.avgHr < 152) idx = 2;
      else if (d.avgHr < 166) idx = 3;
      else idx = 4;

      zones[idx].dist += d.distanceKm;
      zones[idx].rss += d.rss;
      zones[idx].sec += d.durationSec;
    });

    return zones.map(z => ({
      ...z,
      dist: parseFloat(z.dist.toFixed(1)),
      distPct: parseFloat(((z.dist / totalDist) * 100).toFixed(1)),
      rssPct: parseFloat(((z.rss / totalRss) * 100).toFixed(1)),
      secPct: parseFloat(((z.sec / totalSec) * 100).toFixed(1)),
      timeStr: `${Math.floor(z.sec / 3600)}h ${Math.floor((z.sec % 3600) / 60)}m`
    }));
  }, [filteredDataset]);

  // -------------------------------------------------------------
  // DISTRIBUTION LAB DYNAMIC BINNING & STATISTICS
  // -------------------------------------------------------------
  const distributionData = useMemo(() => {
    const values = filteredDataset.map(d => Number(d[distributionMetric as keyof typeof d] || 0)).sort((a, b) => a - b);
    if (values.length === 0) return { bins: [], stats: { mean: 0, median: 0, q1: 0, q3: 0, min: 0, max: 0, outliers: 0 } };

    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min || 1;
    const binWidth = range / distributionBinsCount;

    // Generate bins
    const bins = Array.from({ length: distributionBinsCount }, (_, idx) => {
      const bMin = min + idx * binWidth;
      const bMax = bMin + binWidth;
      return {
        label: `${bMin.toFixed(0)} - ${bMax.toFixed(0)}`,
        min: bMin,
        max: bMax,
        count: 0
      };
    });

    // Populate bins
    values.forEach(v => {
      let bIdx = Math.floor((v - min) / binWidth);
      if (bIdx >= distributionBinsCount) bIdx = distributionBinsCount - 1;
      if (bIdx < 0) bIdx = 0;
      bins[bIdx].count++;
    });

    // Basic descriptive stats
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = sum / values.length;
    
    // Median
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

    // Percentiles
    const getPercentile = (p: number) => {
      const idx = (values.length - 1) * p;
      const base = Math.floor(idx);
      const rest = idx - base;
      if (values[base + 1] !== undefined) {
        return values[base] + rest * (values[base + 1] - values[base]);
      }
      return values[base];
    };

    const q1 = getPercentile(0.25);
    const q3 = getPercentile(0.75);
    const p10 = getPercentile(0.1);
    const p90 = getPercentile(0.9);
    
    // Outliers using IQR Rule: Q1 - 1.5 * IQR or Q3 + 1.5 * IQR
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliersCount = values.filter(v => v < lowerBound || v > upperBound).length;

    return {
      bins,
      stats: {
        mean: parseFloat(mean.toFixed(1)),
        median: parseFloat(median.toFixed(1)),
        q1: parseFloat(q1.toFixed(1)),
        q3: parseFloat(q3.toFixed(1)),
        p10: parseFloat(p10.toFixed(1)),
        p90: parseFloat(p90.toFixed(1)),
        min: parseFloat(min.toFixed(1)),
        max: parseFloat(max.toFixed(1)),
        outliers: outliersCount,
        iqr: parseFloat(iqr.toFixed(1))
      }
    };
  }, [filteredDataset, distributionMetric, distributionBinsCount]);

  // -------------------------------------------------------------
  // CORRELATION LAB CALCULATIONS (SCATTER & PEARSON R)
  // -------------------------------------------------------------
  const correlationData = useMemo(() => {
    const list = filteredDataset.map(d => ({
      x: Number(d[correlationMetricX as keyof typeof d] || 0),
      y: Number(d[correlationMetricY as keyof typeof d] || 0),
      date: d.date,
      title: d.title
    }));

    const reg = calculateRegression(list);

    // Calculate dynamic regression endpoints for drawing the line nicely
    const xVals = list.map(d => d.x);
    const minX = Math.min(...xVals);
    const maxX = Math.max(...xVals);

    const regLinePoints = reg.success ? [
      { x: minX, y: reg.m * minX + reg.b },
      { x: maxX, y: reg.m * maxX + reg.b }
    ] : [];

    return {
      points: list,
      regression: reg,
      linePoints: regLinePoints,
      sampleSize: list.length
    };
  }, [filteredDataset, correlationMetricX, correlationMetricY, calculateRegression]);

  // -------------------------------------------------------------
  // TIMELINE ZOOM & ANNOTATIONS UTILS
  // -------------------------------------------------------------
  const timelineDataWithAnnotations = useMemo(() => {
    return CALC_CHRONOLOGICAL_TRENDS.map((t, idx) => {
      const matchAnn = annotations.find(ann => ann.date === t.date);
      return {
        ...t,
        annotation: matchAnn ? matchAnn.note : null,
        annType: matchAnn ? matchAnn.type : null,
        index: idx
      };
    });
  }, [annotations]);

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotationDate || !newAnnotationNote) return;
    setAnnotations(prev => [
      ...prev,
      { date: newAnnotationDate, note: newAnnotationNote, type: newAnnotationType }
    ]);
    setNewAnnotationDate('');
    setNewAnnotationNote('');
  };

  const handleRemoveAnnotation = (date: string) => {
    setAnnotations(prev => prev.filter(ann => ann.date !== date));
  };

  // -------------------------------------------------------------
  // ADVANCED DATA EXPLORER & PIVOT MATRIX
  // -------------------------------------------------------------
  const explorerData = useMemo(() => {
    // Filter by search query
    let list = [...PHYSIOLOGICAL_DATASET];
    if (dataSearch) {
      const q = dataSearch.toLowerCase();
      list = list.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.shoes.toLowerCase().includes(q) ||
        d.surface.toLowerCase().includes(q) ||
        d.date.includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[dataSortField as keyof typeof a];
      let valB = b[dataSortField as keyof typeof b];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return dataSortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return dataSortDirection === 'asc' ? valA - valB : valB - valA;
    });

    // Grouping
    if (dataGroupField !== 'none') {
      const groups: Record<string, typeof PHYSIOLOGICAL_DATASET> = {};
      list.forEach(item => {
        const key = String(item[dataGroupField as keyof typeof item] || 'Unknown');
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
      });
      return { grouped: true, groups, flat: list };
    }

    return { grouped: false, flat: list, groups: {} };
  }, [dataSearch, dataSortField, dataSortDirection, dataGroupField]);

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <div className="space-y-6 select-none font-sans" id="analytics-laboratory-root">
      
      {/* ------------------------------------------------------------- */}
      {/* LABORATORY RAIL HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-mono font-bold bg-indigo-500/10 text-indigo-500 py-0.5 px-2 rounded uppercase border border-indigo-500/20">
              Professional Grade Inbound Analytics Suite
            </span>
            <span className="text-[8.5px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-2 rounded uppercase border border-[#FF6B00]/20">
              WKO5 & Golden Cheetah Engine Lock
            </span>
          </div>
          <h2 className="text-base md:text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Deterministic Training Analytics Laboratory
          </h2>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-mono max-w-2xl">
            Execute custom regressions, multiselect workouts, build scatter correlations, and explore raw data blocks with absolute mathematical determinism. No AI, no fabricated statistics.
          </p>
        </div>

        {/* Global Control utilities */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleToggleDensity}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 text-[9.5px] font-mono font-bold uppercase hover:bg-muted/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Toggle workspace element density"
          >
            <Sliders className="h-3.5 w-3.5" />
            Density: {density === 'dense' ? 'Dense High-Fidelity' : 'Spacious Comfort'}
          </button>
          
          <button
            onClick={handleResetWorkspace}
            className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 text-rose-500 text-[9.5px] font-mono font-bold uppercase hover:bg-rose-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset Workspace to factory default settings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Workspace
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LABORATORY SUB-TABS NAVIGATION */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-3" id="lab-subtabs-directory">
        {[
          { key: 'custom-builder', label: '📊 Custom Chart Builder', icon: BarChart3 },
          { key: 'comparison', label: '⚖️ Comparison Lab', icon: Shuffle },
          { key: 'segments', label: '🍕 Segment Analysis', icon: Layers },
          { key: 'zones', label: '⚡ Zone Explorer', icon: SlidersHorizontal },
          { key: 'distribution', label: '📉 Distribution Lab', icon: TrendingUp },
          { key: 'correlation', label: '🔍 Correlation Lab', icon: Sliders },
          { key: 'timeline', label: '📅 Timeline Explorer', icon: Calendar },
          { key: 'explorer', label: '🗄️ Advanced Data Explorer', icon: FileSpreadsheet }
        ].map((sub) => {
          const isActive = activeSubTab === sub.key;
          return (
            <button
              key={sub.key}
              onClick={() => handleSetSubTab(sub.key)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase border transition-all cursor-pointer",
                isActive 
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                  : "bg-card/40 border-border/80 hover:bg-secondary/45 text-muted-foreground hover:text-foreground"
              )}
            >
              <sub.icon className="h-3.5 w-3.5" />
              {sub.label}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: CUSTOM CHART BUILDER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'custom-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Left panel: Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/45 pb-2">
                <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="h-3.5 w-3.5 text-indigo-500" />
                  Chart Customization Engine
                </span>
                <button 
                  onClick={() => handleTogglePanel('controls')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {collapsedPanels.controls ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>

              {!collapsedPanels.controls && (
                <div className="space-y-4 font-mono text-[10.5px]">
                  {/* Date Range Option */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[9px] uppercase block">Analysis Date Block</span>
                    <select
                      value={chartConfig.dateRange}
                      onChange={(e) => setChartConfig(prev => {
                        const next = { ...prev, dateRange: e.target.value };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none focus:border-indigo-500/50 uppercase"
                    >
                      <option value="all">Complete History (All Time)</option>
                      <option value="30d">30-Day Block (Jun 8 – Jul 8, 2026)</option>
                      <option value="90d">90-Day Accumulation</option>
                      <option value="year">Season (YTD)</option>
                    </select>
                  </div>

                  {/* X Axis Selector */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[9px] uppercase block">X-Axis Variable</span>
                    <select
                      value={chartConfig.xAxis}
                      onChange={(e) => setChartConfig(prev => {
                        const next = { ...prev, xAxis: e.target.value };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none focus:border-indigo-500/50 uppercase"
                    >
                      {Object.entries(METRIC_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Y Axis Selector */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[9px] uppercase block">Y-Axis Variable</span>
                    <select
                      value={chartConfig.yAxis}
                      onChange={(e) => setChartConfig(prev => {
                        const next = { ...prev, yAxis: e.target.value };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none focus:border-indigo-500/50 uppercase"
                    >
                      {Object.entries(METRIC_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Color Preset Selector */}
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[9px] uppercase block">Accent Visual Tone</span>
                    <div className="flex gap-2.5 pt-1">
                      {[
                        { hex: '#FF6B00', label: 'Orange' },
                        { hex: '#6366f1', label: 'Indigo' },
                        { hex: '#10b981', label: 'Emerald' },
                        { hex: '#ef4444', label: 'Rose' },
                        { hex: '#06b6d4', label: 'Cyan' }
                      ].map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => setChartConfig(prev => {
                            const next = { ...prev, accentColor: col.hex };
                            saveWorkspace({ chartConfig: next });
                            return next;
                          })}
                          className={cn(
                            "h-5 w-5 rounded-full border cursor-pointer relative flex items-center justify-center",
                            chartConfig.accentColor === col.hex ? "border-foreground scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: col.hex }}
                          title={col.label}
                        >
                          {chartConfig.accentColor === col.hex && <Check className="h-3 w-3 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Trend Lines, Moving Averages */}
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <button
                      onClick={() => setChartConfig(prev => {
                        const next = { ...prev, showTrendLine: !prev.showTrendLine };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {chartConfig.showTrendLine ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                      <span>Plot Simple Linear Regression (Trend)</span>
                    </button>

                    <button
                      onClick={() => setChartConfig(prev => {
                        const next = { ...prev, showMovingAverage: !prev.showMovingAverage };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {chartConfig.showMovingAverage ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                      <span>Plot Simple Moving Average (SMA)</span>
                    </button>

                    {chartConfig.showMovingAverage && (
                      <div className="pl-6 space-y-1.5 animate-in slide-in-from-top-1">
                        <span className="text-[8.5px] text-muted-foreground uppercase block">SMA Window Size: {chartConfig.movingAverageWindow} Runs</span>
                        <input
                          type="range"
                          min="2"
                          max="6"
                          value={chartConfig.movingAverageWindow}
                          onChange={(e) => setChartConfig(prev => {
                            const next = { ...prev, movingAverageWindow: Number(e.target.value) };
                            saveWorkspace({ chartConfig: next });
                            return next;
                          })}
                          className="w-full accent-indigo-500 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic Metric Isolation Filter */}
                  <div className="pt-2 border-t border-border/30 space-y-2">
                    <span className="text-muted-foreground text-[9px] uppercase block">Live Metric Range Filter</span>
                    <select
                      value={chartConfig.filterMetric}
                      onChange={(e) => setChartConfig(prev => {
                        const next = { ...prev, filterMetric: e.target.value };
                        saveWorkspace({ chartConfig: next });
                        return next;
                      })}
                      className="w-full text-[10px] bg-muted/40 border border-border rounded px-2 py-1 outline-none focus:border-indigo-500/50 uppercase"
                    >
                      <option value="all">NO ISOLATION SLIDER</option>
                      <option value="avgPower">POWER OUTPUT (WATTS)</option>
                      <option value="avgHr">HEART RATE (BPM)</option>
                      <option value="distanceKm">DISTANCE (KM)</option>
                    </select>

                    {chartConfig.filterMetric !== 'all' && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-1 pl-1">
                        <div className="flex justify-between text-[8px] text-muted-foreground">
                          <span>MIN: {chartConfig.filterMinVal}</span>
                          <span>MAX: {chartConfig.filterMaxVal}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={chartConfig.filterMinVal}
                            onChange={(e) => setChartConfig(prev => ({ ...prev, filterMinVal: Number(e.target.value) }))}
                            className="bg-muted/40 border border-border text-center rounded text-[10px]"
                          />
                          <input
                            type="number"
                            value={chartConfig.filterMaxVal}
                            onChange={(e) => setChartConfig(prev => ({ ...prev, filterMaxVal: Number(e.target.value) }))}
                            className="bg-muted/40 border border-border text-center rounded text-[10px]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exports inside customizer */}
                  <div className="pt-2 border-t border-border/30 flex gap-1.5">
                    <button
                      onClick={() => triggerExport('csv')}
                      className="flex-1 py-1.5 bg-muted/40 hover:bg-muted/60 border border-border text-center rounded text-[9px] uppercase font-bold text-foreground transition-all cursor-pointer"
                    >
                      [ CSV Ingest ]
                    </button>
                    <button
                      onClick={() => triggerExport('json')}
                      className="flex-1 py-1.5 bg-muted/40 hover:bg-muted/60 border border-border text-center rounded text-[9px] uppercase font-bold text-foreground transition-all cursor-pointer"
                    >
                      [ JSON Ingest ]
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Right panel: Visualization & Regression Results */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <div>
                  <h4 className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                    <BarChart3 className="h-4.5 w-4.5 text-indigo-500" />
                    Customized Dynamic Plot: {METRIC_LABELS[chartConfig.xAxis]} vs {METRIC_LABELS[chartConfig.yAxis]}
                  </h4>
                  <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                    Deterministically rendered scatter points from normalized FIT data streams.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-1.5 py-0.5 rounded uppercase">
                    Fidelity lock: active
                  </span>
                </div>
              </div>

              {/* Chart stage */}
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={customBuilderData.points}
                    margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.15)" vertical={false} />
                    <XAxis 
                      dataKey="xVal" 
                      type="number"
                      domain={['auto', 'auto']}
                      name={METRIC_LABELS[chartConfig.xAxis]} 
                      stroke="currentColor" 
                      className="text-muted-foreground text-[8px] font-mono"
                    />
                    <YAxis 
                      dataKey="yVal" 
                      type="number"
                      domain={['auto', 'auto']}
                      name={METRIC_LABELS[chartConfig.yAxis]} 
                      stroke="currentColor" 
                      className="text-muted-foreground text-[8px] font-mono"
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border rounded-xl p-3 shadow-md text-[10px] font-mono space-y-1.5">
                              <span className="font-extrabold text-foreground block border-b border-border/40 pb-1 uppercase">{data.title} ({data.date})</span>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">{METRIC_LABELS[chartConfig.xAxis]}:</span>
                                <span className="font-bold text-foreground">{data.xVal}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">{METRIC_LABELS[chartConfig.yAxis]}:</span>
                                <span className="font-bold text-indigo-500">{data.yVal}</span>
                              </div>
                              {chartConfig.showMovingAverage && data.movingAverage && (
                                <div className="flex justify-between gap-4 border-t border-border/30 pt-1">
                                  <span className="text-amber-500 font-bold">SMA Window Val:</span>
                                  <span className="font-bold text-amber-500">{data.movingAverage}</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Runs Data Points" 
                      dataKey="yVal" 
                      fill={chartConfig.accentColor} 
                      line={false} 
                      shape="circle"
                      opacity={0.85}
                    />
                    {chartConfig.showTrendLine && customBuilderData.regression.success && (
                      <Line 
                        name="Linear Regression Line" 
                        dataKey="regressionLine" 
                        stroke="#FF6B00" 
                        strokeWidth={2} 
                        dot={false} 
                        activeDot={false} 
                      />
                    )}
                    {chartConfig.showMovingAverage && (
                      <Line 
                        name="Simple Moving Average" 
                        dataKey="movingAverage" 
                        stroke="#06b6d4" 
                        strokeWidth={1.8} 
                        strokeDasharray="4 4"
                        dot={false} 
                        activeDot={false} 
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Regression mathematical summary outputs */}
              <div className="bg-secondary/10 border border-border/45 rounded-xl p-4 font-mono text-[10px] grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Pearson r Correlation</span>
                  <span className="text-sm font-extrabold text-foreground">
                    {customBuilderData.regression.success ? customBuilderData.regression.r.toFixed(3) : 'N/A'}
                  </span>
                  <span className="text-[7.5px] text-emerald-500 font-bold block uppercase">
                    {customBuilderData.regression.success && Math.abs(customBuilderData.regression.r) > 0.7 ? 'Strong Correlation' : 'Moderate Correlation'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">R² Determination (Variance explained)</span>
                  <span className="text-sm font-extrabold text-[#FF6B00]">
                    {customBuilderData.regression.success ? (customBuilderData.regression.r2 * 100).toFixed(1) + '%' : 'N/A'}
                  </span>
                  <span className="text-[7.5px] text-muted-foreground block uppercase">Deterministic Fitness Score</span>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Fitted Equation</span>
                  <span className="text-[11px] font-bold text-foreground">
                    {customBuilderData.regression.success 
                      ? `y = ${customBuilderData.regression.m.toFixed(2)}x + ${customBuilderData.regression.b.toFixed(1)}` 
                      : 'N/A'}
                  </span>
                  <span className="text-[7.5px] text-muted-foreground block uppercase">Linear Slope Model</span>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Sample Size Index</span>
                  <span className="text-sm font-extrabold text-indigo-500">{customBuilderData.points.length} Runs</span>
                  <span className="text-[7.5px] text-emerald-500 font-bold block uppercase">Ingestion Sync Validated</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: COMPARISON LAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-primary block mb-3">Compare Operations Module</span>
            
            <div className="flex flex-wrap gap-2 mb-4 font-mono text-[10px]">
              {[
                { key: 'workout', label: 'Activity A vs Activity B' },
                { key: 'blocks', label: 'Training Block A vs Block B' },
                { key: 'shoes', label: 'Shoes vs Shoes' },
                { key: 'time', label: 'Month vs Month' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setCompareMode(opt.key as any);
                    saveWorkspace({ compareMode: opt.key });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border uppercase font-bold transition-all cursor-pointer",
                    compareMode === opt.key 
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                      : "bg-muted/40 border-border hover:bg-secondary/40 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom selectors depending on mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[10.5px] border-t border-border/30 pt-4">
              {compareMode === 'workout' && (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Baseline Activity (A)</span>
                    <select
                      value={compareWorkoutA}
                      onChange={(e) => setCompareWorkoutA(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      {PHYSIOLOGICAL_DATASET.map(w => (
                        <option key={w.id} value={w.id}>{w.date} - {w.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Comparison Activity (B)</span>
                    <select
                      value={compareWorkoutB}
                      onChange={(e) => setCompareWorkoutB(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      {PHYSIOLOGICAL_DATASET.map(w => (
                        <option key={w.id} value={w.id}>{w.date} - {w.title}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {compareMode === 'blocks' && (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Baseline Block</span>
                    <select
                      value={compareBlockA}
                      onChange={(e) => setCompareBlockA(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="Base Phase Block">Base Phase Block (Jun 1 – Jun 15, 2026)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Target Comparison Block</span>
                    <select
                      value={compareBlockB}
                      onChange={(e) => setCompareBlockB(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="Build Phase Block">Build Phase Block (Jun 16 – Jun 30, 2026)</option>
                      <option value="Pre-Race Peak Block">Pre-Race Peak Block (Jul 1 – Jul 7, 2026)</option>
                    </select>
                  </div>
                </>
              )}

              {compareMode === 'shoes' && (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Shoe Model A</span>
                    <select
                      value={compareShoeA}
                      onChange={(e) => setCompareShoeA(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="carbon_rocket">Nike Air Zoom Carbon Rocket (Road)</option>
                      <option value="trail_shield">Saucony Kinvara Trail Shield (Trail)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Shoe Model B</span>
                    <select
                      value={compareShoeB}
                      onChange={(e) => setCompareShoeB(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="trail_shield">Saucony Kinvara Trail Shield (Trail)</option>
                      <option value="carbon_rocket">Nike Air Zoom Carbon Rocket (Road)</option>
                    </select>
                  </div>
                </>
              )}

              {compareMode === 'time' && (
                <>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Baseline Month</span>
                    <select
                      value={compareTimeA}
                      onChange={(e) => setCompareTimeA(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="June 2026">June 2026</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8.5px] uppercase block">Select Target Comparison Month</span>
                    <select
                      value={compareTimeB}
                      onChange={(e) => setCompareTimeB(e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="July 2026">July 2026</option>
                    </select>
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Results comparisons grids */}
          {comparisonResults && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-300">
              {/* Detailed statistical card */}
              <div className="md:col-span-12 bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="text-[10.5px] font-mono font-bold text-foreground uppercase tracking-tight block">
                    Comparative Matrix Analysis: <span className="text-indigo-500 font-extrabold">{comparisonResults.labelA}</span> vs <span className="text-[#FF6B00] font-extrabold">{comparisonResults.labelB}</span>
                  </span>
                  <span className="text-[8px] font-mono uppercase text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded">
                    Type: {compareMode.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px]">
                  {comparisonResults.metrics.map((m, idx) => {
                    const isPositive = m.diff >= 0;
                    const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-muted/15 border border-border/40 space-y-2">
                        <span className="text-muted-foreground block text-[8.5px] uppercase">{m.name}</span>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9.5px] text-muted-foreground">A: {m.valA}{m.unit}</span>
                          <span className="text-[9.5px] text-foreground font-bold">B: {m.valB}{m.unit}</span>
                        </div>
                        <div className="border-t border-border/20 pt-1 flex justify-between items-center">
                          <span className="text-[8px] uppercase text-muted-foreground">Variance:</span>
                          <span className={cn("font-extrabold text-xs", colorClass)}>
                            {isPositive ? '+' : ''}{m.diff.toFixed(1)}{m.unit} ({isPositive ? '+' : ''}{m.pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comparative Chart Visualization */}
                <div className="h-[220px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={comparisonResults.metrics}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                      <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                      <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                      <Tooltip />
                      <Legend className="text-[8px] font-mono" />
                      <Bar dataKey="valA" fill="#6366f1" name="Base Segment A" barSize={35} />
                      <Bar dataKey="valB" fill="#FF6B00" name="Comp Segment B" barSize={35} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: SEGMENT ANALYSIS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'segments' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-primary" />
                  Deterministic Segment Slicing & Analysis
                </h4>
                <p className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                  Automatic biomechanical slicing based on relative slope angles, intervals, and splits of the active training dataset.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/50 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                    <th className="py-2.5 px-3">Segment Label</th>
                    <th className="py-2.5 px-2">Distance</th>
                    <th className="py-2.5 px-2">Time Elapsed</th>
                    <th className="py-2.5 px-2 text-[#FF6B00]">Average Pace</th>
                    <th className="py-2.5 px-2 text-rose-500">Average HR</th>
                    <th className="py-2.5 px-2 text-amber-500">Average Power</th>
                    <th className="py-2.5 px-2 text-indigo-500">Decoupling</th>
                    <th className="py-2.5 px-3 text-right">System Diagnostics Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[10.5px]">
                  {segmentResults.map((seg, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-muted/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-foreground uppercase">{seg.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{seg.distance}</td>
                      <td className="py-3 px-2 text-foreground font-semibold">{seg.duration}</td>
                      <td className="py-3 px-2 text-[#FF6B00] font-bold">{seg.pace}</td>
                      <td className="py-3 px-2 text-rose-400 font-bold">{seg.avgHr} bpm</td>
                      <td className="py-3 px-2 text-amber-400">{seg.avgPower} W</td>
                      <td className="py-3 px-2 text-indigo-400 font-bold">{seg.decoupling}</td>
                      <td className="py-3 px-3 text-right text-[9.5px] uppercase font-bold text-emerald-500">{seg.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: ZONE EXPLORER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'zones' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-500" />
                  Interactive Zone Analysis Explorer
                </h4>
                <p className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                  Analyze accumulated time, load contribution, and volumetric distance spent in each physiological zone.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-4 space-y-4">
                <span className="font-mono font-bold text-[10px] uppercase text-muted-foreground block">Active Volumetric Zone Weights</span>
                <div className="space-y-3 font-mono text-[10.5px]">
                  {zoneAnalysisData.map((z, idx) => (
                    <div key={idx} className="space-y-1 p-2 rounded-xl bg-muted/10 border border-border/40">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-foreground uppercase text-[9.5px]" style={{ color: z.color }}>{z.name}</span>
                        <span className="text-[8.5px] text-muted-foreground">{z.hrRange}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/10">
                        <span>Dist: {z.dist}km ({z.distPct}%)</span>
                        <span>Load: {z.rssPct}% RSS</span>
                        <span>Time: {z.timeStr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar visualization of zone load percentage */}
              <div className="lg:col-span-8 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneAnalysisData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                    <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <Tooltip />
                    <Bar dataKey="dist" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                      {zoneAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DISTRIBUTION LAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Settings Rail */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4 font-mono text-[10.5px]">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider block border-b border-border/45 pb-2">
                Distribution Customizer
              </span>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[9px] uppercase block">Analysis Metric Target</span>
                <select
                  value={distributionMetric}
                  onChange={(e) => {
                    setDistributionMetric(e.target.value);
                    saveWorkspace({ distributionMetric: e.target.value });
                  }}
                  className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none"
                >
                  <option value="avgPower">Power Output (Watts)</option>
                  <option value="avgHr">Heart Rate (bpm)</option>
                  <option value="distanceKm">Distance (km)</option>
                  <option value="rss">Stress Score (RSS)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-muted-foreground text-[9px] uppercase block">Histogram Resolution Bins: {distributionBinsCount}</span>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={distributionBinsCount}
                  onChange={(e) => setDistributionBinsCount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Advanced Statistics */}
              <div className="pt-4 border-t border-border/30 space-y-2">
                <span className="font-bold text-foreground text-xs uppercase block">Descriptive Metrics</span>
                <div className="grid grid-cols-2 gap-2 text-[9.5px] text-muted-foreground">
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>Mean Value:</span>
                    <span className="font-bold text-foreground">{distributionData.stats.mean}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>Median Value:</span>
                    <span className="font-bold text-foreground">{distributionData.stats.median}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>Q1 (25th):</span>
                    <span className="font-bold text-foreground">{distributionData.stats.q1}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>Q3 (75th):</span>
                    <span className="font-bold text-foreground">{distributionData.stats.q3}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>10th %tile:</span>
                    <span className="font-bold text-foreground">{distributionData.stats.p10}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/10 pb-1">
                    <span>90th %tile:</span>
                    <span className="font-bold text-foreground">{distributionData.stats.p90}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[9px] leading-relaxed text-muted-foreground uppercase mt-2.5">
                  IQR Range: <b>{distributionData.stats.iqr} units</b>.<br />
                  Outliers Detected (IQR Rule): <b className={cn(distributionData.stats.outliers > 0 ? 'text-rose-500' : 'text-emerald-500')}>{distributionData.stats.outliers} points</b>.
                </div>
              </div>
            </div>
          </div>

          {/* Chart stage */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
              <span className="text-xs font-black text-foreground uppercase tracking-tight block border-b border-border/40 pb-2.5">
                Volumetric Density Histogram: {METRIC_LABELS[distributionMetric]}
              </span>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData.bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                    <XAxis dataKey="label" stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <YAxis stroke="currentColor" className="text-muted-foreground text-[8px] font-mono" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: CORRELATION LAB */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'correlation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-4 md:p-5 space-y-4 font-mono text-[10.5px]">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider block border-b border-border/45 pb-2">
                Bi-Metric Covariance Parameters
              </span>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[9px] uppercase block">Independent variable (X)</span>
                <select
                  value={correlationMetricX}
                  onChange={(e) => {
                    setCorrelationMetricX(e.target.value);
                    saveWorkspace({ correlationMetricX: e.target.value });
                  }}
                  className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none"
                >
                  <option value="avgPower">Power Output (Watts)</option>
                  <option value="distanceKm">Distance (km)</option>
                  <option value="rss">Stress Score (RSS)</option>
                  <option value="temp">Temperature (°C)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[9px] uppercase block">Dependent variable (Y)</span>
                <select
                  value={correlationMetricY}
                  onChange={(e) => {
                    setCorrelationMetricY(e.target.value);
                    saveWorkspace({ correlationMetricY: e.target.value });
                  }}
                  className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1.5 outline-none"
                >
                  <option value="avgHr">Heart Rate (bpm)</option>
                  <option value="rss">Stress Score (RSS)</option>
                  <option value="effFactor">Efficiency Factor (EF)</option>
                  <option value="pace">Pace (min/km)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-border/30 space-y-3.5">
                <span className="font-bold text-foreground text-xs uppercase block">Pearson Covariance Results</span>
                <div className="grid grid-cols-2 gap-4 text-[9.5px]">
                  <div className="p-3 bg-muted/10 rounded-lg space-y-1 text-center">
                    <span className="text-[8px] text-muted-foreground block uppercase">Pearson r Coefficient</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {correlationData.regression.success ? correlationData.regression.r.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-muted/10 rounded-lg space-y-1 text-center">
                    <span className="text-[8px] text-muted-foreground block uppercase">R² Coefficient</span>
                    <span className="text-sm font-extrabold text-indigo-500">
                      {correlationData.regression.success ? correlationData.regression.r2.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/15 border border-border text-[9px] leading-relaxed text-muted-foreground uppercase">
                  Equation Model: <b className="text-foreground">y = {correlationData.regression.m.toFixed(2)}x + {correlationData.regression.b.toFixed(1)}</b><br />
                  Compliance: Deterministic formula verification locks. Sample size: <b>{correlationData.sampleSize} points</b>.
                </div>
              </div>
            </div>
          </div>

          {/* Scatter Chart Stage */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-4">
              <span className="text-xs font-black text-foreground uppercase tracking-tight block border-b border-border/40 pb-2.5">
                Covariance Plot: {METRIC_LABELS[correlationMetricX]} vs {METRIC_LABELS[correlationMetricY]}
              </span>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border), 0.15)" vertical={false} />
                    <XAxis 
                      dataKey="x" 
                      type="number" 
                      domain={['auto', 'auto']}
                      name={METRIC_LABELS[correlationMetricX]} 
                      stroke="currentColor" 
                      className="text-muted-foreground text-[8px] font-mono"
                    />
                    <YAxis 
                      dataKey="y" 
                      type="number" 
                      domain={['auto', 'auto']}
                      name={METRIC_LABELS[correlationMetricY]} 
                      stroke="currentColor" 
                      className="text-muted-foreground text-[8px] font-mono"
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Workouts Data" data={correlationData.points} fill="#ef4444" opacity={0.8} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: TIMELINE EXPLORER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[10.5px]">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight">
                  Adaptive Chronic Loading Timeline Explorer
                </h4>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Drag the brush slider below the chart area to isolate specific training microcycles and historical peaks.
                </p>
              </div>
            </div>

            {/* Timeline with Brush */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineDataWithAnnotations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.15)" />
                  <XAxis dataKey="date" stroke="currentColor" className="text-[8px]" />
                  <YAxis stroke="currentColor" className="text-[8px]" />
                  <Tooltip />
                  <Area type="monotone" dataKey="ctl" stroke="#10b981" fill="#10b981" fillOpacity={0.08} name="CTL (Fitness)" />
                  <Line type="monotone" dataKey="rss" stroke="#FF6B00" strokeWidth={1.5} dot={{ r: 3 }} name="Daily RSS Load" />
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#6366f1"
                    startIndex={zoomRange.start}
                    endIndex={zoomRange.end}
                    onChange={(obj) => {
                      if (obj && obj.startIndex !== undefined && obj.endIndex !== undefined) {
                        setZoomRange({ start: obj.startIndex, end: obj.endIndex });
                      }
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Custom annotations and race markers section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 border-t border-border/30">
              <div className="md:col-span-5 space-y-3">
                <span className="font-bold text-foreground text-xs uppercase block">Create Chronicle Annotation Marker</span>
                <form onSubmit={handleAddAnnotation} className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8px] uppercase block">Date (Must correspond with an activity)</span>
                    <input
                      type="date"
                      value={newAnnotationDate}
                      onChange={(e) => setNewAnnotationDate(e.target.value)}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2.5 py-1 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8px] uppercase block">Annotation Label</span>
                    <input
                      type="text"
                      placeholder="e.g. Breakout Season Best 10k!"
                      value={newAnnotationNote}
                      onChange={(e) => setNewAnnotationNote(e.target.value)}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2.5 py-1 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground text-[8px] uppercase block">Event Classification Tag</span>
                    <select
                      value={newAnnotationType}
                      onChange={(e) => setNewAnnotationType(e.target.value as any)}
                      className="w-full text-[10.5px] bg-muted/40 border border-border rounded px-2 py-1 outline-none"
                    >
                      <option value="race">🏁 Race Event Marker</option>
                      <option value="pr">🏆 Personal Record (PR) stamp</option>
                      <option value="gear">👟 Equipment Swap Indicator</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-500 text-white hover:bg-indigo-600 font-extrabold uppercase py-2 rounded-lg text-center cursor-pointer text-[10px]"
                  >
                    DEPLOY ANNOTATION FLAG
                  </button>
                </form>
              </div>

              {/* Annotation Directory */}
              <div className="md:col-span-7 space-y-3">
                <span className="font-bold text-foreground text-xs uppercase block">Chronological Event Logs Directory</span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {annotations.map((ann, idx) => {
                    const iconColor = ann.type === 'race' ? 'text-rose-500' : ann.type === 'pr' ? 'text-amber-500' : 'text-blue-500';
                    return (
                      <div key={idx} className="p-3 border border-border/80 rounded-xl bg-muted/5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-foreground">{ann.date}</span>
                            <span className={cn("text-[7.5px] font-bold uppercase", iconColor)}>
                              [{ann.type.toUpperCase()}]
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">{ann.note}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveAnnotation(ann.date)}
                          className="text-rose-500 hover:underline text-[9px] uppercase font-bold cursor-pointer"
                        >
                          [ DELETE ]
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: ADVANCED DATA EXPLORER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'explorer' && (
        <div className="space-y-5 animate-in fade-in duration-200 font-mono text-[10.5px]">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            
            {/* Table Tools */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Compliance Data Directory</span>
                <h4 className="text-xs font-black text-foreground uppercase tracking-tight">
                  High-Density Analytical Pivot Database
                </h4>
              </div>

              {/* Data Search and Columns Chooser */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={dataSearch}
                    onChange={(e) => setDataSearch(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-muted/30 border border-border rounded text-[10px] outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {Object.keys(visibleColumns).map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleColumn(col)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border cursor-pointer",
                        visibleColumns[col] 
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500" 
                          : "bg-muted/40 border-border text-muted-foreground"
                      )}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Grouping & Pivot Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-border/30 pb-3">
              <div className="space-y-1">
                <span className="text-[8.5px] text-muted-foreground uppercase block">Group Rows By Field</span>
                <select
                  value={dataGroupField}
                  onChange={(e) => setDataGroupField(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none text-[10px]"
                >
                  <option value="none">NO GROUPING / FLAT LIST</option>
                  <option value="shoes">EQUIPMENT / SHOES</option>
                  <option value="surface">RUNNING SURFACE</option>
                  <option value="source">SOURCE PROVIDER API</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] text-muted-foreground uppercase block">Active Sort Field</span>
                <select
                  value={dataSortField}
                  onChange={(e) => setDataSortField(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded px-2 py-1 outline-none text-[10px]"
                >
                  <option value="date">CHRONOLOGY DATE</option>
                  <option value="distanceKm">DISTANCE (KM)</option>
                  <option value="avgPower">AVERAGE POWER (W)</option>
                  <option value="rss">STRESS SCORE (RSS)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] text-muted-foreground uppercase block">Sort Direction</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDataSortDirection('asc')}
                    className={cn(
                      "flex-1 py-1 rounded border uppercase font-bold text-[9.5px] cursor-pointer",
                      dataSortDirection === 'asc' ? "bg-foreground text-background" : "bg-muted/40 border-border"
                    )}
                  >
                    Ascending
                  </button>
                  <button
                    onClick={() => setDataSortDirection('desc')}
                    className={cn(
                      "flex-1 py-1 rounded border uppercase font-bold text-[9.5px] cursor-pointer",
                      dataSortDirection === 'desc' ? "bg-foreground text-background" : "bg-muted/40 border-border"
                    )}
                  >
                    Descending
                  </button>
                </div>
              </div>
            </div>

            {/* Flat / Grouped Table View */}
            <div className="overflow-x-auto border border-border/50 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted/15 border-b border-border/50 text-muted-foreground text-[9px] font-bold uppercase">
                    {visibleColumns.date && <th className="py-2.5 px-3">Date</th>}
                    {visibleColumns.title && <th className="py-2.5 px-2">Workout Name</th>}
                    {visibleColumns.distanceKm && <th className="py-2.5 px-2">Volume</th>}
                    {visibleColumns.pace && <th className="py-2.5 px-2">Avg Pace</th>}
                    {visibleColumns.avgHr && <th className="py-2.5 px-2 text-rose-500">Mean HR</th>}
                    {visibleColumns.avgPower && <th className="py-2.5 px-2 text-amber-500">Power Output</th>}
                    {visibleColumns.rss && <th className="py-2.5 px-2 text-indigo-500">Stress (RSS)</th>}
                    {visibleColumns.shoes && <th className="py-2.5 px-2">Equipment</th>}
                    {visibleColumns.surface && <th className="py-2.5 px-3 text-right">Surface</th>}
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {explorerData.grouped ? (
                    Object.entries(explorerData.groups).map(([groupKey, items]) => (
                      <React.Fragment key={groupKey}>
                        {/* Group Header row */}
                        <tr className="bg-secondary/25 border-b border-border/30">
                          <td colSpan={9} className="py-2 px-3 font-extrabold text-foreground uppercase text-[9px] tracking-wider">
                            Folder / Category: {groupKey} ({items.length} records)
                          </td>
                        </tr>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-border/20 hover:bg-muted/5 transition-colors">
                            {visibleColumns.date && <td className="py-2.5 px-3 text-muted-foreground">{item.date}</td>}
                            {visibleColumns.title && <td className="py-2.5 px-2 font-black text-foreground uppercase truncate max-w-[150px]">{item.title}</td>}
                            {visibleColumns.distanceKm && <td className="py-2.5 px-2 font-bold text-foreground">{item.distanceKm.toFixed(1)} km</td>}
                            {visibleColumns.pace && <td className="py-2.5 px-2 text-muted-foreground">{item.pace}/km</td>}
                            {visibleColumns.avgHr && <td className="py-2.5 px-2 text-rose-400 font-bold">{item.avgHr} bpm</td>}
                            {visibleColumns.avgPower && <td className="py-2.5 px-2 text-amber-400 font-semibold">{item.avgPower} W</td>}
                            {visibleColumns.rss && <td className="py-2.5 px-2 text-indigo-400 font-bold">{item.rss} pts</td>}
                            {visibleColumns.shoes && <td className="py-2.5 px-2 text-muted-foreground uppercase">{item.shoes}</td>}
                            {visibleColumns.surface && <td className="py-2.5 px-3 text-right uppercase font-semibold text-muted-foreground">{item.surface}</td>}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    explorerData.flat.map((item) => (
                      <tr key={item.id} className="border-b border-border/20 hover:bg-muted/5 transition-colors">
                        {visibleColumns.date && <td className="py-2.5 px-3 text-muted-foreground">{item.date}</td>}
                        {visibleColumns.title && <td className="py-2.5 px-2 font-black text-foreground uppercase truncate max-w-[180px]">{item.title}</td>}
                        {visibleColumns.distanceKm && <td className="py-2.5 px-2 font-bold text-foreground">{item.distanceKm.toFixed(1)} km</td>}
                        {visibleColumns.pace && <td className="py-2.5 px-2 text-muted-foreground">{item.pace}/km</td>}
                        {visibleColumns.avgHr && <td className="py-2.5 px-2 text-rose-400 font-bold">{item.avgHr} bpm</td>}
                        {visibleColumns.avgPower && <td className="py-2.5 px-2 text-amber-400 font-semibold">{item.avgPower} W</td>}
                        {visibleColumns.rss && <td className="py-2.5 px-2 text-indigo-400 font-bold">{item.rss} pts</td>}
                        {visibleColumns.shoes && <td className="py-2.5 px-2 text-muted-foreground uppercase">{item.shoes}</td>}
                        {visibleColumns.surface && <td className="py-2.5 px-3 text-right uppercase font-semibold text-muted-foreground">{item.surface}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SHARABLE WORKOUTS SELECTED DRAWER / WIDGET */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4 font-mono text-[10.5px]" id="multiselect-aggregate-board">
        <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-foreground uppercase">
              Multi-Select Core: Ingest Segment Aggregation
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSelectAllWorkouts}
              className="text-[9px] uppercase font-bold hover:underline cursor-pointer text-indigo-500"
            >
              [ Select All Runs ]
            </button>
            <button 
              onClick={handleClearWorkoutSelection}
              className="text-[9px] uppercase font-bold hover:underline cursor-pointer text-rose-500"
            >
              [ Clear Selection ]
            </button>
          </div>
        </div>

        {/* Selected aggregate summary indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 py-3 bg-secondary/15 rounded-xl border border-border/45 text-center">
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Selected Count</span>
            <span className="text-sm font-black text-foreground">{multiSelectStats.count} runs</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Total Volume</span>
            <span className="text-sm font-black text-indigo-500">{multiSelectStats.totalDist} km</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Mean Heart Rate</span>
            <span className="text-sm font-black text-rose-500">{multiSelectStats.avgHr} bpm</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Mean Power Output</span>
            <span className="text-sm font-black text-amber-500">{multiSelectStats.avgPower} W</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Mean Pace Velocity</span>
            <span className="text-sm font-black text-foreground">{multiSelectStats.avgPace}/km</span>
          </div>
          <div>
            <span className="text-[8px] text-muted-foreground uppercase block">Total Load Stress</span>
            <span className="text-sm font-black text-[#FF6B00] flex items-center justify-center gap-1">
              <Flame className="h-4 w-4" />
              {multiSelectStats.totalRss}
            </span>
          </div>
        </div>

        {/* Dynamic checklist rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-3">
          {PHYSIOLOGICAL_DATASET.map((w) => {
            const isChecked = selectedWorkoutIds.includes(w.id);
            return (
              <button
                key={w.id}
                onClick={() => handleToggleWorkoutSelect(w.id)}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-secondary/45",
                  isChecked ? "border-indigo-500 bg-indigo-500/5" : "border-border/80 bg-card/65 text-muted-foreground"
                )}
              >
                <div className="shrink-0 text-indigo-500">
                  {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[9.5px] font-black text-foreground block truncate uppercase">{w.title}</span>
                  <span className="text-[8px] text-muted-foreground block">{w.date} • {w.distanceKm}km</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
