'use client';

import React, { useEffect, useRef } from 'react';
import { WIDGET_METADATA_REGISTRY } from '@/lib/widget/registry';
import { WidgetContainer } from './widget-container';
import { WidgetRenderer } from './widget-renderer';
import { useWidget } from './widget-context';

interface WidgetFactoryProps {
  widgetId: string;
}

// Map to hold custom overrides for widgets if developers extend the platform with bespoke views.
// This preserves the extensibility requirement and eliminates hardcoded switch-cases.
const CUSTOM_WIDGET_COMPONENTS: Record<string, React.ComponentType<{ widgetId: string }>> = {};

export function WidgetFactory({ widgetId }: WidgetFactoryProps) {
  const { logWidgetEvent, widgetStates } = useWidget();
  const metadata = WIDGET_METADATA_REGISTRY[widgetId];
  const mountedRef = useRef(false);

  // Trigger Mount and Ingestion/ViewModel receiving lifecycle sequences
  useEffect(() => {
    if (!metadata) return;

    if (!mountedRef.current) {
      logWidgetEvent(widgetId, 'mount', { 
        id: widgetId,
        size: metadata.supportedSizes[0] || 'M'
      });
      
      // Simulate receiving VM structure from the dashboard context subscription
      const vmTimer = setTimeout(() => {
        logWidgetEvent(widgetId, 'receive_viewmodel', {
          viewModelName: metadata.requiredViewModel,
          fields: ['id', 'status', 'metrics', 'lastUpdated'],
          timestamp: new Date().toISOString()
        });
      }, 300);

      mountedRef.current = true;

      return () => {
        logWidgetEvent(widgetId, 'destroy', { id: widgetId });
      };
    }
  }, [widgetId, metadata, logWidgetEvent]);

  if (!metadata) {
    return (
      <div className="p-4 border border-dashed border-red-500/30 rounded-lg text-xs font-mono text-red-400 bg-red-950/20">
        [FATAL_FACTORY_ERROR]: Widget ID &quot;{widgetId}&quot; is not registered in WIDGET_METADATA_REGISTRY.
      </div>
    );
  }

  // If a custom override exists, use it. Otherwise render the standard telemetry view.
  const CustomComponent = CUSTOM_WIDGET_COMPONENTS[widgetId];

  return (
    <WidgetContainer metadata={metadata}>
      {CustomComponent ? (
        <CustomComponent widgetId={widgetId} />
      ) : (
        <WidgetRenderer metadata={metadata} />
      )}
    </WidgetContainer>
  );
}

/**
 * Register a custom component renderer for a specific widget ID.
 * This can be used in future modules to inject bespoke views.
 */
export function registerCustomWidget(widgetId: string, Component: React.ComponentType<{ widgetId: string }>) {
  CUSTOM_WIDGET_COMPONENTS[widgetId] = Component;
}
