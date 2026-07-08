'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

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
