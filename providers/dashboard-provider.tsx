'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardState, DashboardPreferences, LayoutDensity, DashboardRegistryEntry, WidgetRegistryEntry } from '@/types/dashboard';
import { DASHBOARD_REGISTRY, WIDGET_REGISTRY } from '@/lib/dashboard/registry';
import { useToast } from '@/components/ui/toast';
import { useWorkspace } from '@/providers/workspace-provider';
import { registerAllLibraryWidgets } from '@/components/widget/widget-factory-registration';

interface DashboardContextType {
  activeDashboardId: string;
  setActiveDashboardId: (id: string) => void;
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState) => void;
  preferences: DashboardPreferences;
  updateWidgetVisibility: (widgetId: string, isVisible: boolean) => void;
  updateLayoutDensity: (density: LayoutDensity) => void;
  updateDefaultDashboard: (dashboardId: string) => void;
  refreshDashboard: () => Promise<void>;
  viewModels: Record<string, any>;
  registerViewModel: (modelName: string, data: any) => void;
  widgetRegistry: Record<string, WidgetRegistryEntry>;
  dashboardRegistry: Record<string, DashboardRegistryEntry>;
  activeDashboard: DashboardRegistryEntry;
  lastRefreshedAt: string | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: DashboardPreferences = {
  widgetVisibility: {},
  layoutDensity: 'comfortable',
  defaultDashboardId: 'dashboard',
  theme: 'system'
};

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const { activeAthlete } = useWorkspace();
  const [activeDashboardId, setActiveDashboardId] = useState<string>('dashboard');
  const [dashboardState, setDashboardState] = useState<DashboardState>('Loading');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [viewModels, setViewModels] = useState<Record<string, any>>({});
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);

  // Initialize and register all library widgets on mount
  useEffect(() => {
    registerAllLibraryWidgets();
  }, []);

  // Sync ViewModels dynamically to active athlete context changes
  useEffect(() => {
    if (!activeAthlete) return;

    const homeDashboardVM = {
      profile: {
        id: activeAthlete.id,
        name: activeAthlete.name,
        email: activeAthlete.email,
        gender: activeAthlete.gender,
        weightKg: activeAthlete.weightKg,
        restingHr: activeAthlete.restingHr,
        maxHr: activeAthlete.maxHr,
        ftpWatts: activeAthlete.ftpWatts,
        vo2max: activeAthlete.vo2max,
        avatarUrl: activeAthlete.avatarUrl,
        calculatedThresholds: {
          restingPace: '8:30/km',
          aerobicThresholdPace: '6:15/km',
          lactateThresholdPace: '4:45/km'
        }
      },
      recentActivity: {
        id: 'recent_act_1',
        title: 'Aerobic Threshold Tempo Run',
        sportType: 'run',
        distanceMeters: 10000,
        durationSeconds: 2980,
        averageHeartRate: Math.round(activeAthlete.restingHr + 106),
        maxHeartRate: activeAthlete.maxHr - 16,
        averagePace: '4:58',
        runningStressScore: 78,
        intensityFactor: 0.85,
        efficiencyFactor: 1.62,
        aerobicDecoupling: 0.038,
        source: 'strava',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        isCalibrated: true
      },
      weeklySummary: {
        currentWeekDistanceKm: 42.6,
        currentWeekDurationMinutes: 215,
        currentWeekRss: 295,
        targetDistanceKm: 60.0,
        targetRss: 420,
        variancePercent: -28.9,
        dailyBreakdown: [
          { day: 'Mon', distanceKm: 8.2, rss: 55 },
          { day: 'Tue', distanceKm: 0.0, rss: 0 },
          { day: 'Wed', distanceKm: 12.4, rss: 92 },
          { day: 'Thu', distanceKm: 0.0, rss: 0 },
          { day: 'Fri', distanceKm: 10.0, rss: 78 },
          { day: 'Sat', distanceKm: 12.0, rss: 70 },
          { day: 'Sun', distanceKm: 0.0, rss: 0 }
        ]
      },
      performanceMetrics: {
        currentCtl: 72.4,
        currentAtl: 85.8,
        currentTsb: -13.4,
        ctlRampRate: 4.8,
        overtrainingRisk: 'moderate',
        peakingState: 'optimal'
      }
    };

    const performanceOverviewVM = [
      { date: 'Jun 10', ctl: 62.0, atl: 68.0, tsb: -6.0 },
      { date: 'Jun 15', ctl: 64.5, atl: 72.0, tsb: -7.5 },
      { date: 'Jun 20', ctl: 66.8, atl: 78.5, tsb: -11.7 },
      { date: 'Jun 25', ctl: 68.2, atl: 81.0, tsb: -12.8 },
      { date: 'Jun 30', ctl: 70.1, atl: 84.4, tsb: -14.3 },
      { date: 'Jul 05', ctl: 72.4, atl: 85.8, tsb: -13.4 }
    ];

    const activitySummaryVM = {
      activities: [
        {
          id: 'run_1',
          title: 'Tempo Threshold Session',
          date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          distanceKm: 10.00,
          duration: '49:40',
          pace: '4:58',
          rss: 78,
          status: 'synced'
        },
        {
          id: 'run_2',
          title: 'Aerobic Base Overload',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          distanceKm: 12.40,
          duration: '1:10:15',
          pace: '5:40',
          rss: 92,
          status: 'synced'
        },
        {
          id: 'run_3',
          title: 'Recovery Strides Active',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
          distanceKm: 8.20,
          duration: '45:10',
          pace: '5:30',
          rss: 55,
          status: 'synced'
        },
        {
          id: 'run_4',
          title: 'Interval Lactate Ingestion',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
          distanceKm: 15.00,
          duration: '1:04:15',
          pace: '4:17',
          rss: 140,
          status: 'pending'
        },
        {
          id: 'run_5',
          title: 'Spike Noise Gaps Run',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
          distanceKm: 6.50,
          duration: '32:00',
          pace: '4:55',
          rss: 48,
          status: 'corrupt'
        }
      ]
    };

    setViewModels({
      HomeDashboardViewModel: homeDashboardVM,
      PerformanceOverviewViewModel: performanceOverviewVM,
      ActivitySummaryViewModel: activitySummaryVM
    });
  }, [activeAthlete]);

  // Read preferences from localStorage on mount (for persistent dashboard configurations)
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('track_studio_dashboard_prefs');
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    } catch (e) {
      console.warn('Could not read dashboard preferences', e);
    }
  }, []);

  // Save preferences to localStorage when they change
  const savePreferences = (newPrefs: DashboardPreferences) => {
    setPreferences(newPrefs);
    try {
      localStorage.setItem('track_studio_dashboard_prefs', JSON.stringify(newPrefs));
    } catch (e) {
      console.warn('Could not save dashboard preferences', e);
    }
  };

  // Sync dashboard state with actual hash location to make navigation natural and reactive
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && DASHBOARD_REGISTRY[hash]) {
        setActiveDashboardId(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Set initial default widget visibilities when dashboard changes
  useEffect(() => {
    setDashboardState('Loading');
    const timer = setTimeout(() => {
      // Create empty states if no widgets are mapped yet
      const dashboard = DASHBOARD_REGISTRY[activeDashboardId] || DASHBOARD_REGISTRY.dashboard;
      const initialVisibility = { ...preferences.widgetVisibility };
      
      dashboard.supportedWidgets.forEach(widgetId => {
        if (initialVisibility[widgetId] === undefined) {
          initialVisibility[widgetId] = true;
        }
      });

      setPreferences(prev => ({
        ...prev,
        widgetVisibility: initialVisibility
      }));
      
      setDashboardState('Ready');
      setLastRefreshedAt(new Date().toISOString());
    }, 400);

    return () => clearTimeout(timer);
  }, [activeDashboardId]);

  // Keyboard Navigation Shortcuts for Dashboard Switching and Density settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only execute if Alt key is pressed to avoid interfering with inputs
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        // Alt + 1 : Home Dashboard
        // Alt + 2 : Performance Dashboard
        // Alt + 3 : Activities
        // Alt + 4 : Heart Rate
        // Alt + 5 : Power
        const keyMap: Record<string, string> = {
          '1': 'dashboard',
          '2': 'performance',
          '3': 'activities',
          '4': 'heart_rate',
          '5': 'power',
          '6': 'cadence',
          '7': 'training_load',
          '8': 'recovery',
          '9': 'equipment'
        };

        if (keyMap[e.key]) {
          e.preventDefault();
          const targetId = keyMap[e.key];
          setActiveDashboardId(targetId);
          window.location.hash = targetId;
          
          toast({
            title: 'Shortcut Triggered',
            description: `Switched to ${DASHBOARD_REGISTRY[targetId].name}.`,
          });
        }

        // Alt + D : Toggle Layout Density Mode
        if (e.key.toLowerCase() === 'd') {
          e.preventDefault();
          const densities: LayoutDensity[] = ['compact', 'comfortable', 'spacious'];
          const currentIndex = densities.indexOf(preferences.layoutDensity);
          const nextDensity = densities[(currentIndex + 1) % densities.length];
          updateLayoutDensity(nextDensity);

          toast({
            title: 'Density Mode Switched',
            description: `Layout density is now set to ${nextDensity}.`,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preferences.layoutDensity]);

  const updateWidgetVisibility = (widgetId: string, isVisible: boolean) => {
    const newPrefs = {
      ...preferences,
      widgetVisibility: {
        ...preferences.widgetVisibility,
        [widgetId]: isVisible
      }
    };
    savePreferences(newPrefs);

    toast({
      title: isVisible ? 'Widget Visible' : 'Widget Hidden',
      description: `Widget visibility updated in preferences.`,
    });
  };

  const updateLayoutDensity = (density: LayoutDensity) => {
    const newPrefs = {
      ...preferences,
      layoutDensity: density
    };
    savePreferences(newPrefs);
  };

  const updateDefaultDashboard = (dashboardId: string) => {
    if (!DASHBOARD_REGISTRY[dashboardId]) return;
    const newPrefs = {
      ...preferences,
      defaultDashboardId: dashboardId
    };
    savePreferences(newPrefs);
    
    toast({
      title: 'Default Dashboard Updated',
      description: `${DASHBOARD_REGISTRY[dashboardId].name} is now your landing workspace.`,
    });
  };

  const registerViewModel = (modelName: string, data: any) => {
    setViewModels(prev => ({
      ...prev,
      [modelName]: data
    }));
  };

  const refreshDashboard = async () => {
    if (dashboardState === 'Refreshing') return;
    
    setDashboardState('Refreshing');
    toast({
      title: 'Refreshing Stream',
      description: `Reloading ingestion view models for ${DASHBOARD_REGISTRY[activeDashboardId].name}...`,
    });

    // Simulate standard zero-calculations data pull from Analytics Query Engine
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setLastRefreshedAt(new Date().toISOString());
    setDashboardState('Ready');
    
    toast({
      title: 'Stream Refreshed',
      description: `View models successfully re-normalized from Analytics Query Engine.`,
    });
  };

  const activeDashboard = DASHBOARD_REGISTRY[activeDashboardId] || DASHBOARD_REGISTRY.dashboard;

  return (
    <DashboardContext.Provider
      value={{
        activeDashboardId,
        setActiveDashboardId: (id) => {
          setActiveDashboardId(id);
          window.location.hash = id;
        },
        dashboardState,
        setDashboardState,
        preferences,
        updateWidgetVisibility,
        updateLayoutDensity,
        updateDefaultDashboard,
        refreshDashboard,
        viewModels,
        registerViewModel,
        widgetRegistry: WIDGET_REGISTRY,
        dashboardRegistry: DASHBOARD_REGISTRY,
        activeDashboard,
        lastRefreshedAt
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
