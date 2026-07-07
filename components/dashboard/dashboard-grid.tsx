'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, GripVertical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionContainerProps {
  title: string;
  id: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}

export function SectionContainer({
  title,
  id,
  defaultCollapsed = false,
  children
}: SectionContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const { preferences } = useDashboard();
  
  const paddingClass = 
    preferences.layoutDensity === 'compact' ? 'py-2 mb-3' : 
    preferences.layoutDensity === 'spacious' ? 'py-4 mb-6' : 
    'py-3 mb-4';

  return (
    <div className="w-full flex flex-col" id={`section-${id}`}>
      {/* Collapsible Section Header */}
      <div 
        className={cn(
          'flex items-center justify-between border-b border-border/75 select-none',
          paddingClass
        )}
      >
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <span>{title}</span>
          <span className="text-[9px] font-mono font-medium text-muted-foreground/45">({id})</span>
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          aria-label={isCollapsed ? `Expand section ${title}` : `Collapse section ${title}`}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Collapsible Section Content Body */}
      {!isCollapsed && (
        <div className="w-full py-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

interface DashboardGridProps {
  layoutTemplate: 'grid' | 'bento' | 'split' | 'vertical' | 'connections';
  children: React.ReactNode[];
  widgetIds: string[];
}

export function DashboardGrid({
  layoutTemplate,
  children,
  widgetIds
}: DashboardGridProps) {
  const { preferences } = useDashboard();

  // Spacing gaps based on Density Modes
  const gapClass = 
    preferences.layoutDensity === 'compact' ? 'gap-3' : 
    preferences.layoutDensity === 'spacious' ? 'gap-8' : 
    'gap-5';

  // Render the widgets aligned correctly depending on the layout template
  if (layoutTemplate === 'split') {
    // Split: 2 equal-sized cols on large screens, single col on smaller ones
    return (
      <div 
        className={cn('grid grid-cols-1 lg:grid-cols-2 w-full', gapClass)}
        id="dashboard-split-layout"
      >
        {children.map((child, idx) => {
          const widgetId = widgetIds[idx];
          const isVisible = preferences.widgetVisibility[widgetId] !== false;
          if (!isVisible) return null;

          return (
            <div 
              key={widgetId || idx} 
              className="relative group/grid-item min-h-[200px]"
              id={`grid-cell-${widgetId}`}
            >
              {/* Future-Ready drag/resize handle handles */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/grid-item:opacity-100 transition-opacity flex items-center gap-1 bg-background/85 border border-border p-1 rounded cursor-grab">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="text-[8px] font-mono uppercase text-muted-foreground">Alt + Resize</span>
              </div>
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  if (layoutTemplate === 'vertical') {
    // Vertical: full-width column, perfect for forms or lists
    return (
      <div 
        className={cn('flex flex-col w-full max-w-4xl mx-auto', gapClass)}
        id="dashboard-vertical-layout"
      >
        {children.map((child, idx) => {
          const widgetId = widgetIds[idx];
          const isVisible = preferences.widgetVisibility[widgetId] !== false;
          if (!isVisible) return null;

          return (
            <div 
              key={widgetId || idx} 
              className="w-full relative group/grid-item min-h-[140px]"
              id={`grid-cell-${widgetId}`}
            >
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/grid-item:opacity-100 transition-opacity flex items-center gap-1 bg-background/85 border border-border p-1 rounded cursor-grab">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </div>
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  if (layoutTemplate === 'bento') {
    // Bento layout: asymmetric sizes spanning 1-4 columns depending on widget defaultWidths
    return (
      <div 
        className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full auto-rows-auto', gapClass)}
        id="dashboard-bento-layout"
      >
        {children.map((child, idx) => {
          const widgetId = widgetIds[idx];
          const isVisible = preferences.widgetVisibility[widgetId] !== false;
          if (!isVisible) return null;

          // Decide col spanning based on widget specifications
          let spanClass = 'col-span-1 md:col-span-1 lg:col-span-2';
          if (widgetId === 'home_performance_metrics' || widgetId === 'perf_fitness_fatigue' || widgetId === 'act_list_view' || widgetId === 'power_curve' || widgetId === 'eq_shoe_mileage' || widgetId === 'health_anomaly_logs' || widgetId === 'set_thresholds') {
            spanClass = 'col-span-1 md:col-span-2 lg:col-span-4'; // Full width span
          } else if (widgetId === 'home_profile' || widgetId === 'home_weekly_summary' || widgetId === 'perf_season_bests' || widgetId === 'perf_running_economy' || widgetId === 'act_stats_aggregation') {
            spanClass = 'col-span-1 md:col-span-1 lg:col-span-2'; // Mid width span
          }

          return (
            <div 
              key={widgetId || idx} 
              className={cn('relative group/grid-item h-full min-h-[180px]', spanClass)}
              id={`grid-cell-${widgetId}`}
            >
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/grid-item:opacity-100 transition-opacity flex items-center gap-1 bg-background/85 border border-border p-1 rounded cursor-grab">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </div>
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  if (layoutTemplate === 'connections') {
    // Specialized layout for connection credentials hub
    return (
      <div 
        className={cn('grid grid-cols-1 md:grid-cols-2 w-full max-w-6xl mx-auto', gapClass)}
        id="dashboard-connections-layout"
      >
        {children.map((child, idx) => {
          const widgetId = widgetIds[idx];
          const isVisible = preferences.widgetVisibility[widgetId] !== false;
          if (!isVisible) return null;

          return (
            <div 
              key={widgetId || idx} 
              className="relative group/grid-item h-full"
              id={`grid-cell-${widgetId}`}
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  // Standard responsive responsive grid layout
  return (
    <div 
      className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full', gapClass)}
      id="dashboard-grid-layout"
    >
      {children.map((child, idx) => {
        const widgetId = widgetIds[idx];
        const isVisible = preferences.widgetVisibility[widgetId] !== false;
        if (!isVisible) return null;

        return (
          <div 
            key={widgetId || idx} 
            className="relative group/grid-item h-full min-h-[180px]"
            id={`grid-cell-${widgetId}`}
          >
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover/grid-item:opacity-100 transition-opacity flex items-center gap-1 bg-background/85 border border-border p-1 rounded cursor-grab">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
            {child}
          </div>
        );
      })}
    </div>
  );
}
