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
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidget } from '@/components/widget/widget-context';
import { WidgetFactory } from '@/components/widget/widget-factory';

export function DashboardPageRenderer() {
  const { 
    activeDashboard, 
    dashboardState, 
    refreshDashboard,
    lastRefreshedAt,
    widgetRegistry
  } = useDashboard();

  const { widgetVisibility, setWidgetVisibility } = useWidget();

  // If we have hidden widgets, show a restore panel at the top for pristine workspace control
  const hiddenWidgets = activeDashboard.supportedWidgets.filter(
    id => widgetVisibility[id] === false
  );

  const handleRestoreWidget = (widgetId: string) => {
    setWidgetVisibility(widgetId, true);
  };

  const handleResetWidgets = () => {
    activeDashboard.supportedWidgets.forEach(widgetId => {
      setWidgetVisibility(widgetId, true);
    });
  };

  // Divide widgets into two logical sections to demonstrate section container layouts
  const primaryWidgets = activeDashboard.supportedWidgets.slice(0, 2);
  const secondaryWidgets = activeDashboard.supportedWidgets.slice(2);

  // Helper to map widget to its layout representation using our robust WidgetFactory
  const renderWidget = (widgetId: string) => {
    return (
      <WidgetFactory
        key={widgetId}
        widgetId={widgetId}
      />
    );
  };

  return (
    <div className="space-y-6 w-full" id="dashboard-renderer-root">
      
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
            {hiddenWidgets.map(widgetId => {
              const widgetMeta = widgetRegistry[widgetId];
              return (
                <Button
                  key={widgetId}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestoreWidget(widgetId)}
                  className="h-7 text-[9px] uppercase font-bold py-1 px-2.5"
                >
                  Restore {widgetMeta?.name || widgetId}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetWidgets}
              className="h-7 text-[9px] uppercase font-bold text-status-danger hover:bg-status-danger/10 py-1 px-2.5"
            >
              Restore All
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid Content - Structured by Section Containers if bento/grid */}
      {activeDashboard.layoutTemplate === 'bento' || activeDashboard.layoutTemplate === 'grid' ? (
        <div className="space-y-4">
          {primaryWidgets.length > 0 && (
            <SectionContainer title="Core Performance Stream" id="primary-stream">
              <DashboardGrid 
                layoutTemplate={activeDashboard.layoutTemplate}
                widgetIds={primaryWidgets}
              >
                {primaryWidgets.map(renderWidget)}
              </DashboardGrid>
            </SectionContainer>
          )}

          {secondaryWidgets.length > 0 && (
            <SectionContainer title="Auxiliary Diagnostics" id="auxiliary-telemetry" defaultCollapsed={false}>
              <DashboardGrid 
                layoutTemplate={activeDashboard.layoutTemplate}
                widgetIds={secondaryWidgets}
              >
                {secondaryWidgets.map(renderWidget)}
              </DashboardGrid>
            </SectionContainer>
          )}
        </div>
      ) : (
        /* Regular Flat Grid for linear template structures */
        <DashboardGrid 
          layoutTemplate={activeDashboard.layoutTemplate}
          widgetIds={activeDashboard.supportedWidgets}
        >
          {activeDashboard.supportedWidgets.map(renderWidget)}
        </DashboardGrid>
      )}

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
            <span className="font-bold text-foreground block uppercase mb-1">Shortcuts Support:</span>
            <span>Alt + 1 to 9 (Available)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
