'use client';

import React from 'react';
import { useVisualization } from './visualization-context';

export function VisualizationTooltip() {
  const { hoveredTooltip } = useVisualization();
  if (!hoveredTooltip) return null;

  return (
    <div 
      className="absolute top-4 right-4 z-30 pointer-events-none select-none p-3 rounded border border-border bg-background/95 shadow-md flex flex-col gap-1.5 min-w-[160px]"
      id="vis-floating-tooltip"
      aria-live="polite"
    >
      <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider border-b border-border/50 pb-1 mb-1 block">
        {hoveredTooltip.title}
      </span>
      {hoveredTooltip.items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
          <span className="font-bold text-foreground">{item.formattedValue}</span>
        </div>
      ))}
      <span className="sr-only">{hoveredTooltip.accessibleLabel}</span>
    </div>
  );
}
