'use client';

import React, { createContext, useContext, useState, useTransition, useCallback } from 'react';
import { VisualizationModel, TooltipModel } from '@/types/visualization';
import { TooltipEngine } from '@/lib/visualization/tooltip-engine';

interface VisualizationContextType {
  model: VisualizationModel | null;
  activeRecordIndex: number | null;
  hoveredTooltip: TooltipModel | null;
  isPending: boolean;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  setActiveRecordIndex: (index: number | null) => void;
  triggerHover: (title: string, items: { key: string; label: string; value: string | number; formattedValue: string; color: string }[]) => void;
  clearHover: () => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

export function VisualizationProvider({
  children,
  initialModel
}: {
  children: React.ReactNode;
  initialModel: VisualizationModel | null;
}) {
  const [model, setModel] = useState<VisualizationModel | null>(initialModel);
  const [activeRecordIndex, setActiveRecordIndexState] = useState<number | null>(null);
  const [hoveredTooltip, setHoveredTooltip] = useState<TooltipModel | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev);
  }, []);

  const setActiveRecordIndex = useCallback((index: number | null) => {
    startTransition(() => {
      setActiveRecordIndexState(index);
    });
  }, []);

  const triggerHover = useCallback((
    title: string,
    items: { key: string; label: string; value: string | number; formattedValue: string; color: string }[]
  ) => {
    const tooltip = TooltipEngine.compile(title, items, { mode: 'shared' });
    setHoveredTooltip(tooltip);
  }, []);

  const clearHover = useCallback(() => {
    setHoveredTooltip(null);
  }, []);

  return (
    <VisualizationContext.Provider
      value={{
        model,
        activeRecordIndex,
        hoveredTooltip,
        isPending,
        reducedMotion,
        toggleReducedMotion,
        setActiveRecordIndex,
        triggerHover,
        clearHover
      }}
    >
      {children}
    </VisualizationContext.Provider>
  );
}

export function useVisualization() {
  const context = useContext(VisualizationContext);
  if (context === undefined) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
}
