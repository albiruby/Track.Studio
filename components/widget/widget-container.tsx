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
        relative border transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-lg bg-slate-950/80 backdrop-blur-md
        ${isFullscreen 
          ? 'fixed inset-4 z-50 border-emerald-500/50 shadow-2xl shadow-emerald-950/30 w-[calc(100%-2rem)] h-[calc(100%-2rem)] max-h-none' 
          : `${sizeClasses} border-slate-800 hover:border-slate-700 shadow-lg`
        }
        ${state === 'Error' ? 'border-red-500/30 shadow-red-950/10' : ''}
        ${state === 'Offline' ? 'border-sky-500/30' : ''}
        ${isCollapsed && !isFullscreen ? 'h-auto max-h-[58px]' : ''}
      `}
      role="region"
      aria-labelledby={`widget-title-${id}`}
      tabIndex={0}
    >
      {/* Header Panel */}
      <div 
        id={`widget-header-${id}`}
        className="flex items-center justify-between border-b border-slate-900 px-4 py-3 bg-slate-950/90 select-none"
      >
        <div className="flex flex-col min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            {prefs.isFavorite && (
              <span className="text-rose-500" title="Favorite Widget">★</span>
            )}
            <h3 
              id={`widget-title-${id}`}
              className="font-sans text-xs font-bold tracking-wider uppercase text-slate-100 truncate"
            >
              {prefs.customTitle || metadata.title}
            </h3>
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[8px] font-mono font-medium text-slate-400">
              v{metadata.version}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate mt-0.5 font-sans font-medium">
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
            className="relative flex-1 flex flex-col p-4 overflow-y-auto"
          >
            {/* CONTENT SLOT */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>

            {/* Loading Overlay */}
            {state === 'Loading' && (
              <div 
                id={`loading-overlay-${id}`}
                className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-3 z-10"
                aria-busy="true"
              >
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Initializing Telemetry Sync...
                </span>
              </div>
            )}

            {/* Refreshing Header Indicator */}
            {state === 'Refreshing' && (
              <div 
                id={`refreshing-overlay-${id}`}
                className="absolute inset-0 bg-slate-950/30 flex flex-col items-center justify-center space-y-2 z-10 backdrop-blur-[1px]"
              >
                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex items-center space-x-2 shadow-xl">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300">
                    Refreshing Streams...
                  </span>
                </div>
              </div>
            )}

            {/* Offline Overlay */}
            {state === 'Offline' && (
              <div 
                id={`offline-overlay-${id}`}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <WifiOff className="w-8 h-8 text-sky-400" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-200">
                    Telemetry Stream Offline
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans font-medium">
                    The external connection to Intervals.icu or Strava webhooks is currently suspended.
                  </p>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="mt-2 text-[10px] font-mono border border-sky-500/30 hover:border-sky-400 text-sky-400 hover:text-sky-300 px-2 py-1 rounded transition-all duration-150"
                >
                  Reconnect Handshake
                </button>
              </div>
            )}

            {/* Empty State Overlay */}
            {state === 'Empty' && (
              <div 
                id={`empty-overlay-${id}`}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <Layers className="w-8 h-8 text-slate-600" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-slate-400">
                    No Telemetry Packets Detected
                  </h4>
                  <p className="text-[10px] text-slate-500 font-sans font-medium">
                    This widget requires synchronized activities. Please connect your accounts or trigger a manual sync queue.
                  </p>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="mt-2 text-[10px] font-mono border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 px-2 py-1 rounded transition-all duration-150"
                >
                  Inject Default Schema
                </button>
              </div>
            )}

            {/* Partial Data Overlay Banner */}
            {state === 'Partial Data' && (
              <div 
                id={`partial-overlay-${id}`}
                className="absolute bottom-2 left-2 right-2 bg-amber-950/80 border border-amber-500/30 rounded px-2.5 py-1.5 flex items-center justify-between z-10 shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-[9px] text-amber-200 font-sans font-medium truncate">
                    Partial stream packets. Accuracy is degraded.
                  </span>
                </div>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className="text-[8px] font-mono text-amber-400 hover:text-amber-300 underline"
                >
                  Interpolate
                </button>
              </div>
            )}

            {/* Error Overlay */}
            {state === 'Error' && (
              <div 
                id={`error-overlay-${id}`}
                className="absolute inset-0 bg-slate-950/98 flex flex-col items-center justify-center space-y-3 p-4 text-center z-10"
              >
                <ShieldAlert className="w-8 h-8 text-red-500" />
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-xs font-sans font-bold tracking-wider uppercase text-red-400">
                    TELEMETRY CRITICAL FAILURE
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono bg-slate-900 border border-slate-800 rounded p-1.5 max-h-[80px] overflow-y-auto break-words">
                    {errorMsg}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => resetWidget(id)}
                    className="text-[10px] font-mono border border-red-500/30 hover:border-red-400 text-red-400 hover:text-red-300 px-2.5 py-1 rounded transition-all duration-150"
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
                className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 z-10"
              >
                <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded flex items-center space-x-2 shadow-xl">
                  <span className="text-slate-500 font-bold">🔒</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Widget Stream Locked
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Collapsed strip minimal visual */
          <div className="px-4 py-1.5 bg-slate-950/40 text-[9px] font-mono text-slate-500 flex justify-between items-center select-none">
            <span>Widget in dormant background execution</span>
            <span>State: {state}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Footer / Telemetry Status Bar */}
      {!isCollapsed && (
        <div 
          id={`widget-footer-${id}`}
          className="border-t border-slate-900 bg-slate-950/90 px-4 py-2 flex items-center justify-between text-[9px] font-mono text-slate-500"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              state === 'Ready' ? 'bg-emerald-500' :
              state === 'Refreshing' ? 'bg-emerald-400 animate-pulse' :
              state === 'Error' ? 'bg-red-500' :
              state === 'Offline' ? 'bg-sky-500' :
              'bg-slate-600'
            }`} />
            <span className="uppercase text-[8px] tracking-wider text-slate-400 truncate">
              {state}
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline truncate max-w-[120px] md:max-w-[180px]">
              VM: {metadata.requiredViewModel}
            </span>
          </div>
          <span className="font-mono text-[8px] text-slate-500 flex-shrink-0">
            SYNC: {formattedTime} UTC
          </span>
        </div>
      )}
    </div>
  );
}
