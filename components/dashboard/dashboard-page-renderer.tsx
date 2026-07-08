'use client';

import React from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { DashboardGrid, SectionContainer } from '@/components/dashboard/dashboard-grid';
import { 
  FileText, 
  HelpCircle, 
  Layers, 
  Check, 
  RefreshCw,
  Eye,
  Settings2,
  Lock,
  Compass,
  Layout,
  AlertTriangle,
  Flame,
  Activity,
  User,
  ExternalLink,
  RotateCcw,
  CloudLightning,
  Workflow
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidget } from '@/components/widget/widget-context';
import { WidgetFactory } from '@/components/widget/widget-factory';
import { useComposition } from '@/components/dashboard/composition/composition-context';
import { WidgetSize } from '@/types/widget';

export function DashboardPageRenderer() {
  const { 
    activeDashboard, 
    dashboardState, 
    refreshDashboard,
    lastRefreshedAt,
    widgetRegistry
  } = useDashboard();

  const { 
    containerRef, 
    resolvedLayout, 
    setWidgetVisibility, 
    resetLayout, 
    syncToCloud,
    setWidgetSize
  } = useComposition();

  // Handle loading states safely
  if (!resolvedLayout) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-xs text-muted-foreground select-none font-mono">
        <Workflow className="h-5 w-5 animate-spin mb-2" />
        <span>Instantiating Composition Engine...</span>
      </div>
    );
  }

  const { widgets, cols, gap, breakpoint, layoutType } = resolvedLayout;

  // Filter out any hidden widgets to display in our Workspace Restore Control Panel
  const hiddenWidgets = widgets.filter(w => !w.isVisible);

  const handleRestoreWidget = (widgetId: string) => {
    setWidgetVisibility(widgetId, true);
  };

  const handleHideWidget = (widgetId: string) => {
    setWidgetVisibility(widgetId, false);
  };

  const handleSizeChange = (widgetId: string, size: WidgetSize) => {
    setWidgetSize(widgetId, size);
  };

  const getColSpanClass = (size: WidgetSize, maxCols: number): string => {
    if (maxCols === 1) return 'col-span-1';
    if (maxCols === 2) {
      if (size === 'XS' || size === 'S') return 'col-span-1';
      return 'col-span-1 md:col-span-2';
    }
    
    switch (size) {
      case 'XS': return 'col-span-1';
      case 'S': return 'col-span-1';
      case 'M': return 'col-span-1 md:col-span-2';
      case 'L': return 'col-span-1 md:col-span-2 lg:col-span-3';
      case 'XL':
      case 'Full Width': 
        return `col-span-1 md:col-span-2 lg:col-span-${maxCols}`;
      default: return 'col-span-1 md:col-span-2';
    }
  };

  const getGridColsClass = (columns: number): string => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 6: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6';
      case 4:
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className="space-y-6 w-full" id="dashboard-renderer-root" ref={containerRef as any}>
      
      {/* Hidden Widgets / Preferences Restore Panel */}
      {hiddenWidgets.length > 0 && (
        <div className="p-4 rounded-2xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2.5">
            <Eye className="h-4.5 w-4.5 text-status-warning" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Hidden Widgets Detected ({hiddenWidgets.length})</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Some widgets have been hidden by your workspace preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {hiddenWidgets.map(w => {
              const widgetMeta = widgetRegistry[w.id];
              return (
                <Button
                  key={w.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreWidget(w.id)}
                  className="h-7 text-[9px] uppercase font-bold py-1 px-2.5 cursor-pointer rounded-lg"
                >
                  Restore {widgetMeta?.name || w.id}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              className="h-7 text-[9px] uppercase font-bold text-status-danger hover:bg-status-danger/10 py-1 px-2.5 cursor-pointer rounded-lg"
            >
              Restore All
            </Button>
          </div>
        </div>
      )}

      {/* Dynamic arranged Grid Layout built using our robust DashboardCompositionEngine */}
      <div 
        className={`grid ${getGridColsClass(cols)} gap-4 w-full`} 
        id="resolved-composition-grid"
      >
        {widgets.map((w) => {
          if (!w.isVisible) return null;
          const meta = widgetRegistry[w.id];
          if (!meta) return null;

          return (
            <div 
              key={w.id} 
              className={`relative ${getColSpanClass(w.size, cols)} transition-all duration-200 group`}
              id={`composed-grid-cell-${w.id}`}
            >
              <WidgetFactory
                widgetId={w.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

