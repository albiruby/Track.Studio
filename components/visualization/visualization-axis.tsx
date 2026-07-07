'use client';

import React from 'react';
import { AxisModel } from '@/types/visualization';

export function VisualizationAxis({ axis, position }: { axis: AxisModel; position: 'bottom' | 'left' }) {
  if (!axis) return null;

  const ticks = axis.ticks || [];

  if (position === 'left') {
    return (
      <div className="flex flex-col justify-between h-full py-1 text-[9px] font-mono text-muted-foreground border-r border-border/50 pr-2 select-none shrink-0 w-12 text-right">
        {[...ticks].reverse().map((t, i) => (
          <span key={i} className="truncate" title={String(t)}>
            {t}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-between w-full pt-2 border-t border-border/50 text-[9px] font-mono text-muted-foreground select-none px-2 mt-1">
      {ticks.map((t, i) => (
        <span key={i} className="truncate" title={String(t)}>
          {t}
        </span>
      ))}
    </div>
  );
}
