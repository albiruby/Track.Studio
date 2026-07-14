'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DashboardCompositionEngine } from '@/lib/dashboard/composition/engine';
import { CompositionPreferences, ResolvedLayout } from '@/types/composition';
import { useDashboard } from '@/providers/dashboard-provider';
import { useToast } from '@/components/ui/toast';
import { WidgetSize } from '@/types/widget';

interface CompositionContextType {
  containerRef: React.RefObject<HTMLDivElement | null>;
  width: number;
  preferences: CompositionPreferences | null;
  resolvedLayout: ResolvedLayout | null;
  updatePreferences: (updates: Partial<CompositionPreferences>) => void;
  setWidgetVisibility: (widgetId: string, isVisible: boolean) => void;
  setWidgetSize: (widgetId: string, size: WidgetSize) => void;
  toggleSectionCollapse: (widgetId: string) => void;
  resetLayout: () => void;
  syncToCloud: () => Promise<void>;
}

const CompositionContext = createContext<CompositionContextType | undefined>(undefined);

export function CompositionProvider({ children }: { children: React.ReactNode }) {
  const { activeDashboardId, dashboardState } = useDashboard();
  const { toast } = useToast();
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(1200); // Reasonable default for server-side / initial hydration
  const [preferences, setPreferences] = useState<CompositionPreferences | null>(null);
  const [resolvedLayout, setResolvedLayout] = useState<ResolvedLayout | null>(null);

  // Sync state when preferences or width or dashboard change
  const refreshLayout = useCallback(() => {
    try {
      if (activeDashboardId === 'activity_analysis') {
        setPreferences(null);
        setResolvedLayout(null);
        return;
      }
      const activePrefs = DashboardCompositionEngine.getPreferences(activeDashboardId);
      const layout = DashboardCompositionEngine.compose(activeDashboardId, width, activePrefs);
      setPreferences(activePrefs);
      setResolvedLayout(layout);
    } catch (e: any) {
      console.error('CompositionProvider Layout Error:', e.message);
    }
  }, [activeDashboardId, width]);

  // Read preferences and compose on mount or change of dashboard/width
  useEffect(() => {
    refreshLayout();
  }, [activeDashboardId, width, refreshLayout]);

  // Set up container ResizeObserver for robust, responsive container breakpoints
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const rect = entries[0].contentRect;
      setWidth(rect.width || 1200);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [activeDashboardId, dashboardState]); // Re-attach if structural bounds change

  // Actions
  const updatePreferences = useCallback((updates: Partial<CompositionPreferences>) => {
    if (activeDashboardId === 'activity_analysis') return;
    const updated = DashboardCompositionEngine.updatePreferences(activeDashboardId, updates);
    setPreferences(updated);
    setResolvedLayout(DashboardCompositionEngine.compose(activeDashboardId, width, updated));
  }, [activeDashboardId, width]);

  const setWidgetVisibility = useCallback((widgetId: string, isVisible: boolean) => {
    if (activeDashboardId === 'activity_analysis') return;
    const updated = DashboardCompositionEngine.setWidgetVisibility(activeDashboardId, widgetId, isVisible);
    setPreferences(updated);
    setResolvedLayout(DashboardCompositionEngine.compose(activeDashboardId, width, updated));
    
    toast({
      title: isVisible ? 'Widget Restored' : 'Widget Hidden',
      description: `Updated configuration layout bounds in composition context.`,
    });
  }, [activeDashboardId, width, toast]);

  const setWidgetSize = useCallback((widgetId: string, size: WidgetSize) => {
    if (activeDashboardId === 'activity_analysis') return;
    const updated = DashboardCompositionEngine.setWidgetSize(activeDashboardId, widgetId, size);
    setPreferences(updated);
    setResolvedLayout(DashboardCompositionEngine.compose(activeDashboardId, width, updated));
    
    toast({
      title: 'Layout Dimension Altered',
      description: `Widget "${widgetId}" scale updated to size: ${size}`,
    });
  }, [activeDashboardId, width, toast]);

  const toggleSectionCollapse = useCallback((widgetId: string) => {
    if (activeDashboardId === 'activity_analysis') return;
    const updated = DashboardCompositionEngine.toggleSectionCollapse(activeDashboardId, widgetId);
    setPreferences(updated);
    setResolvedLayout(DashboardCompositionEngine.compose(activeDashboardId, width, updated));
  }, [activeDashboardId, width]);

  const resetLayout = useCallback(() => {
    if (activeDashboardId === 'activity_analysis') return;
    const updated = DashboardCompositionEngine.reset(activeDashboardId);
    setPreferences(updated);
    setResolvedLayout(DashboardCompositionEngine.compose(activeDashboardId, width, updated));
    
    toast({
      title: 'Composition Reset',
      description: 'Dashboard restored to original template configurations.',
    });
  }, [activeDashboardId, width, toast]);

  const syncToCloud = useCallback(async () => {
    if (activeDashboardId === 'activity_analysis') return;
    if (!preferences) return;
    toast({
      title: 'Synchronizing Compositions',
      description: 'Pushing layout bounds payload to client-side backup channel...',
    });

    // Invoke clean stub helper
    const activePrefs = DashboardCompositionEngine.getPreferences(activeDashboardId);
    const result = await Promise.resolve({
      success: true,
      message: `Simulated backup of ${activeDashboardId} layout configurations is completed.`
    });

    if (result.success) {
      toast({
        title: 'Cloud Synced Successfully',
        description: result.message,
      });
    }
  }, [activeDashboardId, preferences, toast]);

  return (
    <CompositionContext.Provider
      value={{
        containerRef,
        width,
        preferences,
        resolvedLayout,
        updatePreferences,
        setWidgetVisibility,
        setWidgetSize,
        toggleSectionCollapse,
        resetLayout,
        syncToCloud
      }}
    >
      {children}
    </CompositionContext.Provider>
  );
}

export function useComposition() {
  const context = useContext(CompositionContext);
  if (context === undefined) {
    throw new Error('useComposition must be used within a CompositionProvider');
  }
  return context;
}
