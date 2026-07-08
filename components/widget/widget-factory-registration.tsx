/**
 * Track.Studio — Widget Factory Registration
 * Auto-registers all components in WidgetLibrary to the global WidgetFactory custom registry.
 */

'use client';

import React from 'react';
import { registerCustomWidget } from '@/components/widget/widget-factory';
import { WIDGET_METADATA_REGISTRY } from '@/lib/widget/registry';
import { WidgetLibrary } from '@/lib/widget/library';
import { useDashboard } from '@/providers/dashboard-provider';
import { useWorkspace } from '@/providers/workspace-provider';

// Import our analytical widget components
import { HomeProfileWidget } from './library/home-profile-widget';
import { HomeRecentActivityWidget } from './library/home-recent-activity-widget';
import { HomeWeeklySummaryWidget } from './library/home-weekly-summary-widget';
import { HomePerformanceMetricsWidget } from './library/home-performance-metrics-widget';
import { PerfFitnessFatigueWidget } from './library/perf-fitness-fatigue-widget';
import { ActListViewWidget } from './library/act-list-view-widget';

/**
 * Registry runner that wires up WidgetLibrary definitions
 */
export function registerAllLibraryWidgets() {
  // 1. Register our widgets in WidgetLibrary runtime first
  WidgetLibrary.registerWidget({
    widgetId: 'home_profile',
    component: HomeProfileWidget
  });

  WidgetLibrary.registerWidget({
    widgetId: 'home_recent_activity',
    component: HomeRecentActivityWidget
  });

  WidgetLibrary.registerWidget({
    widgetId: 'home_weekly_summary',
    component: HomeWeeklySummaryWidget
  });

  WidgetLibrary.registerWidget({
    widgetId: 'home_performance_metrics',
    component: HomePerformanceMetricsWidget
  });

  WidgetLibrary.registerWidget({
    widgetId: 'perf_fitness_fatigue',
    component: PerfFitnessFatigueWidget
  });

  WidgetLibrary.registerWidget({
    widgetId: 'act_list_view',
    component: ActListViewWidget
  });

  // 2. Loop through and register each custom widget to CUSTOM_WIDGET_COMPONENTS
  const registeredIds = WidgetLibrary.getRegisteredIds();
  
  registeredIds.forEach((id) => {
    registerCustomWidget(id, function CustomWidgetBridge({ widgetId }: { widgetId: string }) {
      const { viewModels } = useDashboard();
      const metadata = WIDGET_METADATA_REGISTRY[widgetId];
      let viewModelData: any = null;

      if (metadata) {
        const requiredVM = metadata.requiredViewModel;
        const mainVM = viewModels[requiredVM];

        if (mainVM) {
          if (requiredVM === 'HomeDashboardViewModel') {
            // Unpack sub-fields for specific Home Widgets
            if (widgetId === 'home_profile') {
              viewModelData = mainVM.profile;
            } else if (widgetId === 'home_recent_activity') {
              viewModelData = mainVM.recentActivity;
            } else if (widgetId === 'home_weekly_summary') {
              viewModelData = mainVM.weeklySummary;
            } else if (widgetId === 'home_performance_metrics') {
              viewModelData = mainVM.performanceMetrics;
            } else {
              viewModelData = mainVM;
            }
          } else if (requiredVM === 'ActivitySummaryViewModel' && widgetId === 'act_list_view') {
            viewModelData = mainVM;
          } else {
            viewModelData = mainVM;
          }
        }
      }

      const widgetDef = WidgetLibrary.getWidget(widgetId);
      if (!widgetDef) return null;

      const Component = widgetDef.component;
      return <Component widgetId={widgetId} viewModel={viewModelData} />;
    });
  });
}
