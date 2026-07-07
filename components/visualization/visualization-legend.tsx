'use client';

import React from 'react';
import { useVisualization } from './visualization-context';

export function VisualizationLegend() {
  const { model } = useVisualization();
  if (!model || !model.legend || model.legend.items.length === 0) return null;

  const { items, position, layout } = model.legend;

  return (
    <div 
      className={`flex select-none gap-4 flex-wrap text-[10px] font-mono justify-center items-center py-2 border-t border-border/45 bg-muted/10 rounded-b-md ${
        layout === 'vertical' ? 'flex-col items-start px-4' : 'flex-row'
      }`}
      id={`vis-legend-${model.id}`}
    >
      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mr-1 select-none">Legend:</span>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span 
            className="w-2.5 h-2.5 rounded shrink-0 transition-opacity border border-border/30"
            style={{ backgroundColor: item.color }}
          />
          <span className={`font-medium ${item.visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
