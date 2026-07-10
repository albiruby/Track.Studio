'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export interface WorkspaceFilters {
  activityType: 'all' | 'road_run' | 'trail_run' | string;
  surface: 'all' | 'road' | 'trail' | string;
  shoes: 'all' | 'carbon_rocket' | 'trail_shield' | string;
  dateRange: 'all' | '30d' | '90d' | 'year' | string;
}

export interface DrillDownState {
  path: string[];
}

export interface ComparisonState {
  enabled: boolean;
  blockA: string;
  blockB: string;
}

export interface InteractiveWorkspaceContextType {
  storyTab: string;
  setStoryTab: (tab: string) => void;
  filters: WorkspaceFilters;
  setFilters: React.Dispatch<React.SetStateAction<WorkspaceFilters>>;
  isFilterActive: boolean;
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  drillDown: DrillDownState;
  pushDrillDown: (step: string) => void;
  popDrillDown: () => void;
  resetDrillDown: () => void;
  comparison: ComparisonState;
  setComparison: React.Dispatch<React.SetStateAction<ComparisonState>>;
}

const InteractiveWorkspaceContext = createContext<InteractiveWorkspaceContextType | undefined>(undefined);

export function InteractiveWorkspaceProvider({ children }: { children: ReactNode }) {
  const [storyTab, setStoryTab] = useState<string>('workspace');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<WorkspaceFilters>({
    activityType: 'all',
    surface: 'all',
    shoes: 'all',
    dateRange: '30d'
  });

  const [drillDown, setDrillDown] = useState<DrillDownState>({
    path: []
  });

  const [comparison, setComparison] = useState<ComparisonState>({
    enabled: false,
    blockA: 'Block A: Base Phase',
    blockB: 'Block B: Build Phase'
  });

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const persistedStoryTab = localStorage.getItem('track_studio_story_tab');
      if (persistedStoryTab !== null) setStoryTab(persistedStoryTab);

      const persistedActivityId = localStorage.getItem('track_studio_selected_activity_id');
      if (persistedActivityId !== null) setSelectedActivityId(persistedActivityId);

      const persistedFilters = localStorage.getItem('track_studio_filters');
      if (persistedFilters !== null) setFilters(JSON.parse(persistedFilters));

      const persistedComparison = localStorage.getItem('track_studio_comparison');
      if (persistedComparison !== null) setComparison(JSON.parse(persistedComparison));
    } catch (e) {
      console.error('Failed to load local interactive workspace state', e);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_story_tab', storyTab);
    }
  }, [storyTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedActivityId) {
        localStorage.setItem('track_studio_selected_activity_id', selectedActivityId);
      } else {
        localStorage.removeItem('track_studio_selected_activity_id');
      }
    }
  }, [selectedActivityId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_filters', JSON.stringify(filters));
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_comparison', JSON.stringify(comparison));
    }
  }, [comparison]);

  const isFilterActive = useMemo(() => {
    return filters.activityType !== 'all' || 
           filters.surface !== 'all' || 
           filters.shoes !== 'all';
  }, [filters]);

  const pushDrillDown = (step: string) => {
    setDrillDown(prev => ({
      path: [...prev.path, step]
    }));
  };

  const popDrillDown = () => {
    setDrillDown(prev => ({
      path: prev.path.slice(0, -1)
    }));
  };

  const resetDrillDown = () => {
    setDrillDown({ path: [] });
  };

  return (
    <InteractiveWorkspaceContext.Provider
      value={{
        storyTab,
        setStoryTab,
        filters,
        setFilters,
        isFilterActive,
        selectedActivityId,
        setSelectedActivityId,
        drillDown,
        pushDrillDown,
        popDrillDown,
        resetDrillDown,
        comparison,
        setComparison
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
