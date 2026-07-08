'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

export type TimeRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_14_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month'
  | 'last_12_months'
  | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface WorkspaceFilters {
  activityType: string;
  surface: string;
  shoes: string;
  device: string;
  weather: string;
  location: string;
  trainingPhase: string;
  coach: string;
}

export interface ComparisonState {
  enabled: boolean;
  type: 'week_vs_week' | 'month_vs_month' | 'block_vs_block' | 'activity_vs_activity' | 'season_vs_season';
  basePeriod: string;
  targetPeriod: string;
}

export interface DrillDownState {
  path: string[]; // e.g. ['ctl_history', 'weekly_breakdown', 'daily_contributors', 'individual_workout']
  activeItemId: string | null;
}

export interface InteractiveChartSettings {
  zoomLevel: number; // 1 to 5
  showCrosshair: boolean;
  showGoalLine: boolean;
  showTargetZone: boolean;
  rollingAverageDays: 7 | 14 | 28 | 90;
  visibleSeries: Record<string, boolean>;
}

interface InteractiveWorkspaceContextType {
  // 1. Time Range
  timeRangePreset: TimeRangePreset;
  setTimeRangePreset: (preset: TimeRangePreset) => void;
  customDateRange: DateRange;
  setCustomDateRange: (range: DateRange) => void;
  resolvedDateRangeText: string;

  // 2. Global Filters
  filters: WorkspaceFilters;
  updateFilter: (key: keyof WorkspaceFilters, value: string) => void;
  resetFilters: () => void;
  isFilterActive: boolean;

  // 3. Cross Widget Synchronized Activity
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  hoveredActivityId: string | null;
  setHoveredActivityId: (id: string | null) => void;

  // 4. Drill Down
  drillDown: DrillDownState;
  pushDrillDown: (item: string) => void;
  popDrillDown: () => void;
  resetDrillDown: () => void;

  // 5. Comparison Mode
  comparison: ComparisonState;
  setComparison: (state: Partial<ComparisonState>) => void;
  toggleComparisonMode: () => void;

  // 6. Interactive Chart Settings
  chartSettings: InteractiveChartSettings;
  updateChartSetting: <K extends keyof InteractiveChartSettings>(key: K, value: InteractiveChartSettings[K]) => void;
  toggleSeriesVisibility: (seriesKey: string) => void;

  // 7. Storytelling Mode
  storyTab: 'fitness' | 'recovery' | 'training' | 'aerobic' | 'threshold' | 'workspace';
  setStoryTab: (tab: 'fitness' | 'recovery' | 'training' | 'aerobic' | 'threshold' | 'workspace') => void;
}

const DEFAULT_FILTERS: WorkspaceFilters = {
  activityType: 'all',
  surface: 'all',
  shoes: 'all',
  device: 'all',
  weather: 'all',
  location: 'all',
  trainingPhase: 'all',
  coach: 'all'
};

const DEFAULT_CHART_SETTINGS: InteractiveChartSettings = {
  zoomLevel: 1,
  showCrosshair: true,
  showGoalLine: true,
  showTargetZone: true,
  rollingAverageDays: 7,
  visibleSeries: {
    ctl: true,
    atl: true,
    tsb: true,
    distance: true,
    rss: true,
    hr: true,
    power: true,
    cadence: true
  }
};

const InteractiveWorkspaceContext = createContext<InteractiveWorkspaceContextType | undefined>(undefined);

export function InteractiveWorkspaceProvider({ children }: { children: React.ReactNode }) {
  // 1. Time Range State
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>('last_30_days');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    start: '2026-06-08',
    end: '2026-07-08'
  });

  // 2. Global Filters State
  const [filters, setFilters] = useState<WorkspaceFilters>(DEFAULT_FILTERS);

  // 3. Cross Widget Synchronized Selected Activity
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>('run_1');
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null);

  // 4. Drill Down state
  const [drillDown, setDrillDown] = useState<DrillDownState>({
    path: [],
    activeItemId: null
  });

  // 5. Comparison Mode
  const [comparison, setComparisonState] = useState<ComparisonState>({
    enabled: false,
    type: 'week_vs_week',
    basePeriod: 'Current Week',
    targetPeriod: 'Previous Week'
  });

  // 6. Interactive Chart Settings
  const [chartSettings, setChartSettings] = useState<InteractiveChartSettings>(DEFAULT_CHART_SETTINGS);

  // 7. Storytelling tab
  const [storyTab, setStoryTab] = useState<'fitness' | 'recovery' | 'training' | 'aerobic' | 'threshold' | 'workspace'>('workspace');

  // Resolved Date Range string text
  const resolvedDateRangeText = useMemo(() => {
    switch (timeRangePreset) {
      case 'today': return 'July 8, 2026';
      case 'yesterday': return 'July 7, 2026';
      case 'last_7_days': return 'July 1 – July 8, 2026';
      case 'last_14_days': return 'June 24 – July 8, 2026';
      case 'last_30_days': return 'June 8 – July 8, 2026';
      case 'last_90_days': return 'April 9 – July 8, 2026';
      case 'this_month': return 'July 1 – July 8, 2026';
      case 'last_month': return 'June 1 – June 30, 2026';
      case 'last_12_months': return 'July 2025 – July 2026';
      case 'custom': return `${customDateRange.start} to ${customDateRange.end}`;
      default: return 'June 8 – July 8, 2026';
    }
  }, [timeRangePreset, customDateRange]);

  const updateFilter = (key: keyof WorkspaceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const isFilterActive = useMemo(() => {
    return Object.values(filters).some(val => val !== 'all');
  }, [filters]);

  const pushDrillDown = (item: string) => {
    setDrillDown(prev => ({
      path: [...prev.path, item],
      activeItemId: item
    }));
  };

  const popDrillDown = () => {
    setDrillDown(prev => {
      if (prev.path.length === 0) return prev;
      const newPath = prev.path.slice(0, -1);
      return {
        path: newPath,
        activeItemId: newPath.length > 0 ? newPath[newPath.length - 1] : null
      };
    });
  };

  const resetDrillDown = () => {
    setDrillDown({ path: [], activeItemId: null });
  };

  const setComparison = (state: Partial<ComparisonState>) => {
    setComparisonState(prev => ({ ...prev, ...state }));
  };

  const toggleComparisonMode = () => {
    setComparisonState(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateChartSetting = <K extends keyof InteractiveChartSettings>(
    key: K,
    value: InteractiveChartSettings[K]
  ) => {
    setChartSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSeriesVisibility = (seriesKey: string) => {
    setChartSettings(prev => ({
      ...prev,
      visibleSeries: {
        ...prev.visibleSeries,
        [seriesKey]: !prev.visibleSeries[seriesKey]
      }
    }));
  };

  return (
    <InteractiveWorkspaceContext.Provider
      value={{
        timeRangePreset,
        setTimeRangePreset,
        customDateRange,
        setCustomDateRange,
        resolvedDateRangeText,
        filters,
        updateFilter,
        resetFilters,
        isFilterActive,
        selectedActivityId,
        setSelectedActivityId,
        hoveredActivityId,
        setHoveredActivityId,
        drillDown,
        pushDrillDown,
        popDrillDown,
        resetDrillDown,
        comparison,
        setComparison,
        toggleComparisonMode,
        chartSettings,
        updateChartSetting,
        toggleSeriesVisibility,
        storyTab,
        setStoryTab
      }}
    >
      {children}
    </InteractiveWorkspaceContext.Provider>
  );
}

export function useInteractiveWorkspace() {
  const context = useContext(InteractiveWorkspaceContext);
  if (context === undefined) {
    throw new Error('useInteractiveWorkspace must be used within an InteractiveWorkspaceProvider');
  }
  return context;
}
