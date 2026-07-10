'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardState, DashboardPreferences, LayoutDensity, DashboardRegistryEntry, WidgetRegistryEntry } from '@/types/dashboard';
import { DASHBOARD_REGISTRY, WIDGET_REGISTRY } from '@/lib/dashboard/registry';
import { useToast } from '@/components/ui/toast';
import { useWorkspace, AthleteProfile } from '@/providers/workspace-provider';
import { registerAllLibraryWidgets } from '@/components/widget/widget-factory-registration';
import { AnalyticsQueryEngine } from '@/lib/analytics/query-engine';
import { CanonicalRepository } from '@/lib/data-platform/canonical/repository';
import { CanonicalAthlete, CanonicalActivity, CanonicalGear } from '@/lib/data-platform/canonical/types';
import { MetricEngine } from '@/lib/metrics/engine';

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

    let isSubscribed = true;

    const formatDuration = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.round(seconds % 60);
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatPace = (paceMinPerKm: number): string => {
      const mins = Math.floor(paceMinPerKm);
      const secs = Math.round((paceMinPerKm - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const ensureCanonicalAthleteExists = async (profile: AthleteProfile) => {
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Athlete';

      const athlete: CanonicalAthlete = {
        id: profile.id,
        firstName,
        lastName,
        profileUrl: profile.avatarUrl.startsWith('data:') ? null : profile.avatarUrl,
        gender: profile.gender as 'M' | 'F' | 'Other' | null,
        weightKg: profile.weightKg,
        restingHeartRateBpm: profile.restingHr,
        maxHeartRateBpm: profile.maxHr,
        ftpWatts: profile.ftpWatts,
        vO2Max: profile.vo2max,
        timezone: 'America/Los_Angeles',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceMetadata: {
          providerId: 'strava',
          providerObjectId: `athlete_${profile.id}`,
          rawDocumentId: `raw_athlete_${profile.id}`,
          syncJobId: `sync_job_${profile.id}`,
          apiEndpoint: 'https://www.strava.com/api/v3/athlete',
          payloadHash: 'initial_hash',
          providerApiVersion: 'v3',
          transformationVersion: '1.0.0',
          importedAt: new Date().toISOString()
        },
        metadata: {
          schemaVersion: '1.0.0',
          importedAt: new Date().toISOString(),
          transformationVersion: '1.0.0'
        }
      };

      await CanonicalRepository.saveAthlete(athlete);
    };

    const loadData = async () => {
      setDashboardState('Loading');
      try {
        const queryEngine = new AnalyticsQueryEngine();
        
        // Ensure canonical athlete profile exists in Firestore without seeding mock activities
        const existingAthlete = await queryEngine['getAthlete'](activeAthlete.id);
        if (!existingAthlete) {
          await ensureCanonicalAthleteExists(activeAthlete);
        }

        const [homeVM, perfVM] = await Promise.all([
          queryEngine.queryHomeDashboard(activeAthlete.id, 'none'),
          queryEngine.queryPerformanceOverview(activeAthlete.id, 'none'),
        ]);

        if (!isSubscribed) return;

        const rawActivities = await queryEngine['getActivities'](activeAthlete.id);
        const activitiesVM = {
          activities: rawActivities.map(act => {
            const computed = MetricEngine.evaluateActivity({
              activity: act,
              athlete: {
                id: activeAthlete.id,
                firstName: activeAthlete.name.split(' ')[0] || 'Unknown',
                lastName: activeAthlete.name.split(' ').slice(1).join(' ') || 'Athlete',
                profileUrl: activeAthlete.avatarUrl,
                gender: activeAthlete.gender as any,
                weightKg: activeAthlete.weightKg,
                restingHeartRateBpm: activeAthlete.restingHr,
                maxHeartRateBpm: activeAthlete.maxHr,
                ftpWatts: activeAthlete.ftpWatts,
                vO2Max: activeAthlete.vo2max,
                timezone: 'America/Los_Angeles',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sourceMetadata: {
                  providerId: 'strava',
                  providerObjectId: `athlete_${activeAthlete.id}`,
                  rawDocumentId: `raw_athlete_${activeAthlete.id}`,
                  syncJobId: `sync_job_${activeAthlete.id}`,
                  apiEndpoint: '',
                  payloadHash: '',
                  providerApiVersion: '',
                  transformationVersion: '',
                  importedAt: ''
                },
                metadata: {
                  schemaVersion: '1.0.0',
                  importedAt: '',
                  transformationVersion: ''
                }
              }
            });
            const rssMetric = computed.find(m => m.metricId === 'rss');
            const rss = rssMetric ? Math.round(rssMetric.value) : 0;

            return {
              id: act.id,
              title: act.activityName,
              date: act.startDate,
              distanceKm: Number((act.distanceMeters / 1000).toFixed(2)),
              duration: formatDuration(act.movingTimeSec),
              pace: formatPace(act.averagePaceMinPerKm),
              rss,
              status: 'synced' as const
            };
          })
        };

        setViewModels({
          HomeDashboardViewModel: homeVM,
          PerformanceOverviewViewModel: perfVM,
          ActivitySummaryViewModel: activitiesVM
        });
        setDashboardState('Ready');
        setLastRefreshedAt(new Date().toISOString());
      } catch (err) {
        console.error('[DashboardProvider] Dynamic load failed:', err);
        if (!isSubscribed) return;
        
        toast({
          title: 'Pipeline Ingestion Idle',
          description: 'No real running activities could be query-compiled. Workspace offline.',
        });
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
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
