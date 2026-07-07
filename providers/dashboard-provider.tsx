'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DashboardState, DashboardPreferences, LayoutDensity, DashboardRegistryEntry, WidgetRegistryEntry } from '@/types/dashboard';
import { DASHBOARD_REGISTRY, WIDGET_REGISTRY } from '@/lib/dashboard/registry';
import { useToast } from '@/components/ui/toast';

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
  const [activeDashboardId, setActiveDashboardId] = useState<string>('dashboard');
  const [dashboardState, setDashboardState] = useState<DashboardState>('Loading');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [viewModels, setViewModels] = useState<Record<string, any>>({});
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);

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
