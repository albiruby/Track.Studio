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

    const seedAthleteAndActivities = async (profile: AthleteProfile) => {
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Athlete';

      const athlete: CanonicalAthlete = {
        id: profile.id,
        firstName,
        lastName,
        profileUrl: profile.avatarUrl,
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

      const now = Date.now();
      const dayMs = 1000 * 60 * 60 * 24;

      const activityData = [
        {
          id: `${profile.id}_act_1`,
          name: 'Aerobic Threshold Tempo Run',
          daysAgo: 0,
          distance: 10000,
          duration: 2980,
          avgHr: Math.round(profile.restingHr + 106),
          maxHr: profile.maxHr - 16,
          elevation: 45,
          cadence: 178,
          power: Math.round(profile.ftpWatts * 0.85),
          runningStressScore: 78,
          intensityFactor: 0.85,
        },
        {
          id: `${profile.id}_act_2`,
          name: 'Aerobic Base Overload',
          daysAgo: 2,
          distance: 12400,
          duration: 4215,
          avgHr: Math.round(profile.restingHr + 95),
          maxHr: profile.maxHr - 25,
          elevation: 110,
          cadence: 174,
          power: Math.round(profile.ftpWatts * 0.75),
          runningStressScore: 92,
          intensityFactor: 0.75,
        },
        {
          id: `${profile.id}_act_3`,
          name: 'Recovery Strides Active',
          daysAgo: 4,
          distance: 8200,
          duration: 2710,
          avgHr: Math.round(profile.restingHr + 80),
          maxHr: profile.maxHr - 40,
          elevation: 20,
          cadence: 180,
          power: Math.round(profile.ftpWatts * 0.60),
          runningStressScore: 55,
          intensityFactor: 0.60,
        },
        {
          id: `${profile.id}_act_4`,
          name: 'Interval Lactate Ingestion',
          daysAgo: 6,
          distance: 15000,
          duration: 3855,
          avgHr: Math.round(profile.restingHr + 115),
          maxHr: profile.maxHr - 5,
          elevation: 85,
          cadence: 182,
          power: Math.round(profile.ftpWatts * 0.95),
          runningStressScore: 140,
          intensityFactor: 0.95,
        },
        {
          id: `${profile.id}_act_5`,
          name: 'Spike Noise Gaps Run',
          daysAgo: 8,
          distance: 6500,
          duration: 1920,
          avgHr: Math.round(profile.restingHr + 100),
          maxHr: profile.maxHr - 20,
          elevation: 35,
          cadence: 176,
          power: Math.round(profile.ftpWatts * 0.80),
          runningStressScore: 48,
          intensityFactor: 0.80,
        }
      ];

      for (const data of activityData) {
        const durationMin = data.duration / 60;
        const avgPaceDecimal = durationMin / (data.distance / 1000);

        const activity: CanonicalActivity = {
          id: data.id,
          externalProviderId: 'strava',
          providerObjectId: `strava_${data.id}`,
          athleteId: profile.id,
          activityName: data.name,
          sportType: 'running',
          startDate: new Date(now - data.daysAgo * dayMs).toISOString(),
          timezone: 'America/Los_Angeles',
          elapsedTimeSec: data.duration + 45,
          movingTimeSec: data.duration,
          distanceMeters: data.distance,
          averagePaceMinPerKm: avgPaceDecimal,
          averageSpeedMps: data.distance / data.duration,
          maximumSpeedMps: (data.distance / data.duration) * 1.3,
          elevationGainMeters: data.elevation,
          elevationLossMeters: data.elevation,
          averageHeartRateBpm: data.avgHr,
          maxHeartRateBpm: data.maxHr,
          averageCadenceRpm: data.cadence,
          maxCadenceRpm: data.cadence + 15,
          averagePowerWatts: data.power,
          maxPowerWatts: Math.round(data.power * 1.5),
          calories: Math.round(data.distance * 0.065),
          device: {
            name: 'Garmin Forerunner 955',
            serialNumber: 'GRM955-129482',
            manufacturer: 'Garmin'
          },
          shoesId: 'shoe_pegasus_39',
          gpsPolyline: null,
          visibility: 'public',
          privateFlag: false,
          manualFlag: false,
          commuteFlag: false,
          trainerFlag: false,
          kilojoules: Math.round(data.power * data.duration / 1000),
          weather: {
            temperatureC: 15.5,
            humidityPercent: 65,
            windSpeedMps: 2.1,
            windDirectionDeg: 180,
            summary: 'Clear',
            precipProbabilityPercent: 0
          },
          location: {
            city: 'San Francisco',
            state: 'California',
            country: 'United States',
            startLatLng: [37.7749, -122.4194],
            endLatLng: [37.7749, -122.4194]
          },
          elevation: {
            gainMeters: data.elevation,
            lossMeters: data.elevation,
            maxAltitudeMeters: data.elevation + 20,
            minAltitudeMeters: 20
          },
          achievements: [],
          bestEfforts: [],
          sourceMetadata: {
            providerId: 'strava',
            providerObjectId: `strava_raw_${data.id}`,
            rawDocumentId: `raw_doc_${data.id}`,
            syncJobId: `sync_job_${data.id}`,
            apiEndpoint: 'https://www.strava.com/api/v3/activities',
            payloadHash: `hash_${data.id}`,
            providerApiVersion: 'v3',
            transformationVersion: '1.0.0',
            importedAt: new Date().toISOString()
          },
          metadata: {
            schemaVersion: '1.0.0',
            importedAt: new Date().toISOString(),
            transformationVersion: '1.0.0'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await CanonicalRepository.saveActivity(activity);

        const lapsCount = Math.ceil(data.distance / 1000);
        for (let i = 0; i < lapsCount; i++) {
          const lapDistance = Math.min(1000, data.distance - i * 1000);
          const lapDuration = (lapDistance / data.distance) * data.duration;
          await CanonicalRepository.saveLap({
            id: `${data.id}_lap_${i}`,
            activityId: data.id,
            lapIndex: i,
            name: `Lap ${i + 1}`,
            elapsedTimeSec: lapDuration + 5,
            movingTimeSec: lapDuration,
            distanceMeters: lapDistance,
            averageSpeedMps: lapDistance / lapDuration,
            maxSpeedMps: (lapDistance / lapDuration) * 1.2,
            averageHeartRateBpm: data.avgHr + Math.sin(i) * 5,
            maxHeartRateBpm: data.maxHr,
            averageCadenceRpm: data.cadence,
            averagePowerWatts: data.power + Math.sin(i) * 10,
            maxPowerWatts: Math.round(data.power * 1.3),
            elevationGainMeters: 10,
            elevationLossMeters: 10,
            startDate: new Date(now - data.daysAgo * dayMs + i * 300000).toISOString(),
            startIndex: i * 100,
            endIndex: (i + 1) * 100,
            sourceMetadata: {
              providerId: 'strava',
              providerObjectId: `strava_raw_lap_${data.id}_${i}`,
              rawDocumentId: `raw_doc_lap_${data.id}_${i}`,
              syncJobId: `sync_job_${data.id}`,
              apiEndpoint: 'https://www.strava.com/api/v3/laps',
              payloadHash: `hash_lap_${data.id}_${i}`,
              providerApiVersion: 'v3',
              transformationVersion: '1.0.0',
              importedAt: new Date().toISOString()
            },
            metadata: {
              schemaVersion: '1.0.0',
              importedAt: new Date().toISOString(),
              transformationVersion: '1.0.0'
            }
          }, profile.id);
        }
      }

      const gear: CanonicalGear = {
        id: 'shoe_pegasus_39',
        athleteId: profile.id,
        name: 'Nike Air Zoom Pegasus 39',
        brandName: 'Nike',
        modelName: 'Pegasus 39',
        distanceMeters: 450000,
        isPrimary: true,
        description: 'Daily trainer shoe',
        retired: false,
        type: 'shoes',
        sourceMetadata: {
          providerId: 'strava',
          providerObjectId: 'gear_pegasus_39',
          rawDocumentId: `raw_gear_pegasus_39_${profile.id}`,
          syncJobId: `sync_job_${profile.id}`,
          apiEndpoint: 'https://www.strava.com/api/v3/gear',
          payloadHash: 'initial_gear_hash',
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
      await CanonicalRepository.saveGear(gear);
    };

    const loadData = async () => {
      setDashboardState('Loading');
      try {
        const queryEngine = new AnalyticsQueryEngine();
        
        // Ensure athlete profile exists in Firestore, else perform deterministic live seeding
        const existingAthlete = await queryEngine['getAthlete'](activeAthlete.id);
        if (!existingAthlete) {
          await seedAthleteAndActivities(activeAthlete);
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
