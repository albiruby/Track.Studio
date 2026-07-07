'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  WidgetState, 
  WidgetSize, 
  WidgetPreferences, 
  WidgetMetadata, 
  WidgetLifecycleEvent 
} from '@/types/widget';
import { WIDGET_METADATA_REGISTRY } from '@/lib/widget/registry';

interface WidgetContextType {
  widgetStates: Record<string, WidgetState>;
  widgetPreferences: Record<string, WidgetPreferences>;
  widgetVisibility: Record<string, boolean>;
  widgetErrors: Record<string, string | null>;
  widgetEvents: Record<string, WidgetLifecycleEvent[]>;
  fullscreenWidgetId: string | null;
  
  // Actions
  setWidgetState: (id: string, state: WidgetState) => void;
  setWidgetVisibility: (id: string, visible: boolean) => void;
  setWidgetPreferences: (id: string, prefs: Partial<WidgetPreferences>) => void;
  setWidgetError: (id: string, error: string | null) => void;
  logWidgetEvent: (id: string, type: WidgetLifecycleEvent['type'], payload?: any) => void;
  
  // Lifecycle Actions
  refreshWidget: (id: string) => Promise<void>;
  toggleFullscreen: (id: string) => void;
  toggleCollapse: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  exportWidgetData: (id: string) => void;
  resetWidget: (id: string) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Initialize widget visibility and preferences from registry
  const [widgetStates, setWidgetStates] = useState<Record<string, WidgetState>>({});
  const [widgetVisibility, setWidgetVisibilityMap] = useState<Record<string, boolean>>({});
  const [widgetPreferences, setWidgetPreferencesMap] = useState<Record<string, WidgetPreferences>>({});
  const [widgetErrors, setWidgetErrors] = useState<Record<string, string | null>>({});
  const [widgetEvents, setWidgetEvents] = useState<Record<string, WidgetLifecycleEvent[]>>({});
  const [fullscreenWidgetId, setFullscreenWidgetId] = useState<string | null>(null);

  // Initialize states on mount
  useEffect(() => {
    const initialStates: Record<string, WidgetState> = {};
    const initialVisibility: Record<string, boolean> = {};
    const initialPrefs: Record<string, WidgetPreferences> = {};
    const initialErrors: Record<string, string | null> = {};
    const initialEvents: Record<string, WidgetLifecycleEvent[]> = {};

    Object.keys(WIDGET_METADATA_REGISTRY).forEach((id) => {
      const metadata = WIDGET_METADATA_REGISTRY[id];
      initialStates[id] = 'Ready'; // Default to Ready
      initialVisibility[id] = true; // Default to visible
      initialPrefs[id] = {
        size: metadata.supportedSizes[0] || 'M',
        isCollapsed: false,
        isPinned: false,
        isFavorite: false,
      };
      initialErrors[id] = null;
      initialEvents[id] = [
        {
          type: 'initialize',
          timestamp: new Date().toISOString(),
          payload: { msg: 'Widget registered in container' }
        }
      ];
    });

    setWidgetStates(initialStates);
    setWidgetVisibilityMap(initialVisibility);
    setWidgetPreferencesMap(initialPrefs);
    setWidgetErrors(initialErrors);
    setWidgetEvents(initialEvents);
  }, []);

  const setWidgetState = useCallback((id: string, state: WidgetState) => {
    setWidgetStates((prev) => ({ ...prev, [id]: state }));
    logWidgetEvent(id, 'render', { state });
  }, []);

  const setWidgetVisibility = useCallback((id: string, visible: boolean) => {
    setWidgetVisibilityMap((prev) => ({ ...prev, [id]: visible }));
    logWidgetEvent(id, visible ? 'show' : 'hide');
  }, []);

  const setWidgetPreferences = useCallback((id: string, prefs: Partial<WidgetPreferences>) => {
    setWidgetPreferencesMap((prev) => {
      const current = prev[id] || {
        size: 'M',
        isCollapsed: false,
        isPinned: false,
        isFavorite: false,
      };
      return {
        ...prev,
        [id]: { ...current, ...prefs },
      };
    });
    if (prefs.size) {
      logWidgetEvent(id, 'resize', { size: prefs.size });
    }
  }, []);

  const setWidgetError = useCallback((id: string, error: string | null) => {
    setWidgetErrors((prev) => ({ ...prev, [id]: error }));
    if (error) {
      setWidgetStates((prev) => ({ ...prev, [id]: 'Error' }));
      logWidgetEvent(id, 'render', { error });
    }
  }, []);

  const logWidgetEvent = useCallback((id: string, type: WidgetLifecycleEvent['type'], payload?: any) => {
    const newEvent: WidgetLifecycleEvent = {
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    setWidgetEvents((prev) => {
      const list = prev[id] || [];
      return {
        ...prev,
        [id]: [newEvent, ...list].slice(0, 50), // keep last 50 events
      };
    });
  }, []);

  const refreshWidget = useCallback(async (id: string) => {
    logWidgetEvent(id, 'refresh', { action: 'start' });
    setWidgetStates((prev) => ({ ...prev, [id]: 'Refreshing' }));
    
    // Simulate natural refresh loading overlay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setWidgetStates((prev) => ({ ...prev, [id]: 'Ready' }));
    logWidgetEvent(id, 'refresh', { action: 'complete' });
  }, [logWidgetEvent]);

  const toggleFullscreen = useCallback((id: string) => {
    setFullscreenWidgetId((current) => (current === id ? null : id));
    logWidgetEvent(id, 'resize', { isFullscreen: fullscreenWidgetId !== id });
  }, [fullscreenWidgetId, logWidgetEvent]);

  const toggleCollapse = useCallback((id: string) => {
    setWidgetPreferencesMap((prev) => {
      const current = prev[id] || { size: 'M', isCollapsed: false, isPinned: false, isFavorite: false };
      const nextCollapsed = !current.isCollapsed;
      logWidgetEvent(id, nextCollapsed ? 'hide' : 'show', { reason: 'collapse_toggle' });
      return {
        ...prev,
        [id]: { ...current, isCollapsed: nextCollapsed }
      };
    });
  }, [logWidgetEvent]);

  const toggleFavorite = useCallback((id: string) => {
    setWidgetPreferencesMap((prev) => {
      const current = prev[id] || { size: 'M', isCollapsed: false, isPinned: false, isFavorite: false };
      return {
        ...prev,
        [id]: { ...current, isFavorite: !current.isFavorite }
      };
    });
  }, []);

  const togglePin = useCallback((id: string) => {
    setWidgetPreferencesMap((prev) => {
      const current = prev[id] || { size: 'M', isCollapsed: false, isPinned: false, isFavorite: false };
      return {
        ...prev,
        [id]: { ...current, isPinned: !current.isPinned }
      };
    });
  }, []);

  const exportWidgetData = useCallback((id: string) => {
    logWidgetEvent(id, 'destroy', { action: 'export_triggered_disabled' });
    alert('Widget Export is disabled (Infrastructure Only).');
  }, [logWidgetEvent]);

  const resetWidget = useCallback((id: string) => {
    const metadata = WIDGET_METADATA_REGISTRY[id];
    setWidgetStates((prev) => ({ ...prev, [id]: 'Ready' }));
    setWidgetErrors((prev) => ({ ...prev, [id]: null }));
    setWidgetPreferencesMap((prev) => ({
      ...prev,
      [id]: {
        size: metadata?.supportedSizes[0] || 'M',
        isCollapsed: false,
        isPinned: false,
        isFavorite: false,
      }
    }));
    logWidgetEvent(id, 'initialize', { action: 'reset' });
  }, [logWidgetEvent]);

  return (
    <WidgetContext.Provider
      value={{
        widgetStates,
        widgetPreferences,
        widgetVisibility,
        widgetErrors,
        widgetEvents,
        fullscreenWidgetId,
        setWidgetState,
        setWidgetVisibility,
        setWidgetPreferences,
        setWidgetError,
        logWidgetEvent,
        refreshWidget,
        toggleFullscreen,
        toggleCollapse,
        toggleFavorite,
        togglePin,
        exportWidgetData,
        resetWidget,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}
