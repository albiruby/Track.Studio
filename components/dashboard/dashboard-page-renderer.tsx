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
      
      {/* Top Level Workspace Composition Controller Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-card/65 select-none" id="composition-dashboard-toolbar">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4.5 w-4.5 text-foreground shrink-0" />
          <div className="text-[10px] leading-tight font-mono">
            <span className="font-bold text-foreground block uppercase">Composition Engine State:</span>
            Active Layout: <b className="text-foreground capitalize">{layoutType}</b> (Breakpoint: <b className="text-foreground uppercase">{breakpoint}</b> • Grid Columns: <b className="text-foreground">{cols}</b>)
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
            className="h-8 text-[10px] uppercase font-bold py-1 px-3 flex items-center gap-1.5 cursor-pointer"
            id="reset-composition-trigger"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Layout
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={syncToCloud}
            className="h-8 text-[10px] uppercase font-bold py-1 px-3 flex items-center gap-1.5 cursor-pointer"
            id="cloud-sync-composition-trigger"
          >
            <CloudLightning className="h-3.5 w-3.5" />
            Cloud Sync (Stub)
          </Button>
        </div>
      </div>

      {/* Hidden Widgets / Preferences Restore Panel */}
      {hiddenWidgets.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-muted/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2.5">
            <Eye className="h-4.5 w-4.5 text-status-warning" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Hidden Widgets Detected ({hiddenWidgets.length})</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Some telemetry widgets have been disabled by your local workspace preferences.</p>
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
                  className="h-7 text-[9px] uppercase font-bold py-1 px-2.5 cursor-pointer"
                >
                  Restore {widgetMeta?.name || w.id}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              className="h-7 text-[9px] uppercase font-bold text-status-danger hover:bg-status-danger/10 py-1 px-2.5 cursor-pointer"
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
              className={`relative ${getColSpanClass(w.size, cols)} transition-all duration-200`}
              id={`composed-grid-cell-${w.id}`}
            >
              {/* Dynamic size switcher overlay on hover */}
              <div className="absolute top-2 left-2 z-20 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-background/95 border border-border p-1 rounded shadow-sm">
                <span className="text-[8px] font-mono uppercase font-bold text-muted-foreground mr-1">Scale:</span>
                {(['XS', 'S', 'M', 'L', 'XL'] as WidgetSize[]).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeChange(w.id, sz)}
                    className={`text-[8px] font-bold px-1 py-0.5 rounded ${w.size === sz ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  >
                    {sz}
                  </button>
                ))}
                <button
                  onClick={() => handleHideWidget(w.id)}
                  className="text-[8px] font-bold px-1 py-0.5 rounded bg-status-danger/10 text-status-danger hover:bg-status-danger/20 ml-1"
                >
                  Hide
                </button>
              </div>

              <WidgetFactory
                widgetId={w.id}
              />
            </div>
          );
        })}
      </div>

      {/* Dashboard Metadata and Documentation Panel */}
      <div className="p-5 rounded-lg border border-border/75 bg-card/45 select-none space-y-4" id="dashboard-metadata-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Dashboard Documentation Reference</h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">
            ID: <b className="text-foreground">{activeDashboard.id}</b> • Category: <b className="text-foreground">{activeDashboard.category}</b>
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          {activeDashboard.documentation} Every dashboard registered inside <code>DASHBOARD_REGISTRY</code> consumes view models generated deterministically by the Analytics Query Engine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
          <div className="p-3.5 rounded bg-muted/30 border border-border/50">
            <span className="font-bold text-foreground block uppercase mb-1">Layout Template:</span>
            <span className="capitalize">{activeDashboard.layoutTemplate} Layout</span>
          </div>
          <div className="p-3.5 rounded bg-muted/30 border border-border/50">
            <span className="font-bold text-foreground block uppercase mb-1">Active Version:</span>
            <span>v{activeDashboard.version} (Verified)</span>
          </div>
          <div className="p-3.5 rounded bg-muted/30 border border-border/50">
            <span className="font-bold text-foreground block uppercase mb-1">Fidelity Status:</span>
            <span className="capitalize text-status-success font-bold">{activeDashboard.status}</span>
          </div>
          <div className="p-3.5 rounded bg-muted/30 border border-border/50">
            <span className="font-bold text-foreground block uppercase mb-1">Composition Specs:</span>
            <span>Dynamic Resolver Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

