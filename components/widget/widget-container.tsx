'use client';

import React, { useRef } from 'react';
import { useWidget } from './widget-context';
import { WidgetMetadata, WidgetSize } from '@/types/widget';
import { WidgetToolbar } from './widget-toolbar';
import { 
  AlertTriangle, 
  WifiOff, 
  Layers, 
  ShieldAlert, 
  Loader2, 
  EyeOff, 
  Check, 
  HelpCircle,
  FileCode,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WidgetContainerProps {
  metadata: WidgetMetadata;
  children: React.ReactNode;
}

export function WidgetContainer({ metadata, children }: WidgetContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    widgetStates,
    widgetPreferences,
    widgetVisibility,
    widgetErrors,
    fullscreenWidgetId,
    setWidgetState,
    setWidgetError,
    resetWidget
  } = useWidget();

  const id = metadata.id;

  // If the widget is hidden globally, don't render it at all
  if (widgetVisibility[id] === false) {
    return null;
  }

  const state = widgetStates[id] || 'Ready';
  const prefs = widgetPreferences[id] || {
    size: metadata.supportedSizes[0] || 'M',
    isCollapsed: false,
    isPinned: false,
    isFavorite: false,
  };

  const isFullscreen = fullscreenWidgetId === id;
  const isCollapsed = prefs.isCollapsed;
  const errorMsg = widgetErrors[id] || 'An unresolved analytical runtime deadlock occurred.';

  // Map widget size to grid column classes and heights
  const getSizeClasses = (size: WidgetSize) => {
    switch (size) {
      case 'XS':
        return 'col-span-1 h-[160px]';
      case 'S':
        return 'col-span-1 h-[220px]';
      case 'M':
        return 'col-span-1 md:col-span-2 h-[300px]';
      case 'L':
        return 'col-span-1 md:col-span-3 h-[400px]';
      case 'XL':
        return 'col-span-1 md:col-span-4 h-[480px]';
      case 'Full Width':
        return 'col-span-1 md:col-span-4 w-full h-[320px]';
      default:
        return 'col-span-1 md:col-span-2 h-[300px]';
    }
  };

  const sizeClasses = getSizeClasses(prefs.size);

  // Time stamp helper
  const formattedTime = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      ref={containerRef}
      id={`widget-container-${id}`}
      className={`
        relative border transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-[20px] bg-card
        ${isFullscreen 
          ? 'fixed inset-4 z-50 border-primary/50 shadow-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-h-none' 
          : `${sizeClasses} border-border/80 shadow-sm hover:shadow-md hover:border-primary/25 hover:-translate-y-0.5`
        }
        ${state === 'Error' ? 'border-status-danger/30 shadow-status-danger/10' : ''}
        ${state === 'Offline' ? 'border-status-info/30' : ''}
        ${isCollapsed && !isFullscreen ? 'h-auto max-h-[58px]' : ''}
      `}
      role="region"
      aria-labelledby={`widget-title-${id}`}
      tabIndex={0}
    >
      {/* Header Panel */}
      <div 
        id={`widget-header-${id}`}
        className="flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/10 select-none"
      >
        <div className="flex flex-col min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            {prefs.isFavorite && (
              <span className="text-primary" title="Favorite Widget">★</span>
            )}
            <h3 
              id={`widget-title-${id}`}
              className="font-sans text-xs font-bold tracking-wider uppercase text-foreground truncate"
            >
              {prefs.customTitle || metadata.title}
            </h3>
            <span className="hidden sm:inline-flex items-center rounded-full bg-secondary border border-border px-1.5 py-0.5 text-[8px] font-mono font-medium text-muted-foreground">
              v{metadata.version}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate mt-0.5 font-sans font-medium">
            {metadata.subtitle}
          </span>
        </div>

        {/* Toolbar */}
        <WidgetToolbar widgetId={id} />
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!isCollapsed || isFullscreen ? (
          <motion.div
            key="content-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex-1 flex flex-col p-5 overflow-y-auto"
          >
            {/* CONTENT SLOT */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>

            {/* Loading Overlay */}
            {state === 'Loading' && (
              <div 
                id={`loading-overlay-${id}`}
                className="absolute inset-0 bg-card/95 flex flex-col items-center justify-center space-y-3 z-10"
                aria-busy="true"
              >
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Initializing Telemetry Sync...
                </span>
              </div>
            )}

            {/* Refreshing Header Indicator */}
            {state === 'Refreshing' && (
              <div 
                id={`refreshing-overlay-${id}`}
                className="absolute inset-0 bg-card/40 flex flex-col items-center justify-center space-y-2 z-10 backdrop-blur-[1px]"
              >
                <div className="bg-card border border-border px-3 py-1.5 rounded-lg flex items-center space-x-2 shadow-xl">
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                    Refreshing Streams...
                  </span>
                </div>
              </div>
            )}

            {/* Offline Overlay */}
            {state === 'Offline' && (
              <div 
                id={`offline-overlay-${id}`}
                className="absolute inset-0 bg-card/95 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <WifiOff className="w-8 h-8 text-status-info" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-foreground">
                    Telemetry Stream Offline
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-sans font-medium">
                    The external connection to Intervals.icu or Strava webhooks is currently suspended.
                  </p>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="mt-2 text-[10px] font-mono border border-status-info/30 hover:border-status-info text-status-info hover:text-status-info/80 px-2 py-1 rounded-lg transition-all duration-150"
                >
                  Reconnect Handshake
                </button>
              </div>
            )}

            {/* Empty State Overlay */}
            {state === 'Empty' && (
              <div 
                id={`empty-overlay-${id}`}
                className="absolute inset-0 bg-card/95 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <Layers className="w-8 h-8 text-muted-foreground/40" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-muted-foreground">
                    No Telemetry Packets Detected
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-sans font-medium">
                    This widget requires synchronized activities. Please connect your accounts or trigger a manual sync queue.
                  </p>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="mt-2 text-[10px] font-mono border border-border hover:bg-secondary text-muted-foreground px-2 py-1 rounded-lg transition-all duration-150"
                >
                  Inject Default Schema
                </button>
              </div>
            )}

            {/* Partial Data Overlay Banner */}
            {state === 'Partial Data' && (
              <div 
                id={`partial-overlay-${id}`}
                className="absolute bottom-2 left-2 right-2 bg-status-warning/10 border border-status-warning/30 rounded px-2.5 py-1.5 flex items-center justify-between z-10 shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning flex-shrink-0" />
                  <span className="text-[9px] text-status-warning font-sans font-medium truncate">
                    Partial stream packets. Accuracy is degraded.
                  </span>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="text-[8px] font-mono text-status-warning hover:underline"
                >
                  Interpolate
                </button>
              </div>
            )}

            {/* Error Overlay */}
            {state === 'Error' && (
              <div 
                id={`error-overlay-${id}`}
                className="absolute inset-0 bg-card/98 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <ShieldAlert className="w-8 h-8 text-status-danger" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-status-danger">
                    TELEMETRY CRITICAL FAILURE
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-mono bg-secondary border border-border rounded-lg p-1.5 max-h-[80px] overflow-y-auto break-words">
                    {errorMsg}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => resetWidget(id)}
                    className="text-[10px] font-mono border border-status-danger/30 hover:border-status-danger text-status-danger px-2.5 py-1 rounded-lg transition-all duration-150"
                  >
                    Reset & Hot-Reload
                  </button>
                </div>
              </div>
            )}

            {/* Disabled Overlay */}
            {state === 'Disabled' && (
              <div 
                id={`disabled-overlay-${id}`}
                className="absolute inset-0 bg-card/90 flex flex-col items-center justify-center space-y-2 z-10"
              >
                <div className="bg-secondary border border-border px-4 py-2 rounded-lg flex items-center space-x-2 shadow-xl">
                  <span className="text-muted-foreground font-bold">🔒</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Widget Stream Locked
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Collapsed strip minimal visual */
          <div className="px-4 py-1.5 bg-muted/20 text-[9px] font-mono text-muted-foreground flex justify-between items-center select-none">
            <span>Widget in dormant background execution</span>
            <span>State: {state}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Telemetry Status Bar */}
      {!isCollapsed && (
        <div 
          id={`widget-footer-${id}`}
          className="border-t border-border/40 bg-muted/5 px-4 py-2 flex items-center justify-between text-[9px] font-mono text-muted-foreground"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              state === 'Ready' ? 'bg-status-success' :
              state === 'Refreshing' ? 'bg-status-success animate-pulse' :
              state === 'Error' ? 'bg-status-danger' :
              state === 'Offline' ? 'bg-status-info' :
              'bg-muted-foreground'
            }`} />
            <span className="uppercase text-[8px] tracking-wider text-muted-foreground truncate">
              {state}
            </span>
            <span className="hidden sm:inline text-border">|</span>
            <span className="hidden sm:inline truncate max-w-[120px] md:max-w-[180px]">
              VM: {metadata.requiredViewModel}
            </span>
          </div>
          <span className="font-mono text-[8px] text-muted-foreground flex-shrink-0">
            SYNC: {formattedTime} UTC
          </span>
        </div>
      )}
    </div>
  );
}
