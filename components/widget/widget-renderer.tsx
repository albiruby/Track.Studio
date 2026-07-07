'use client';

import React, { useEffect, useState } from 'react';
import { WidgetMetadata, WidgetState, WidgetSize } from '@/types/widget';
import { useWidget } from './widget-context';
import { 
  Terminal, 
  Settings2, 
  BookOpen, 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  RefreshCcw, 
  RotateCw,
  Cpu,
  History,
  Workflow,
  Sparkles,
  Layers,
  Gauge
} from 'lucide-react';
import { motion } from 'motion/react';

interface WidgetRendererProps {
  metadata: WidgetMetadata;
}

export function WidgetRenderer({ metadata }: WidgetRendererProps) {
  const {
    widgetStates,
    widgetPreferences,
    widgetEvents,
    setWidgetState,
    setWidgetError,
    setWidgetPreferences
  } = useWidget();

  const id = metadata.id;
  const state = widgetStates[id] || 'Ready';
  const prefs = widgetPreferences[id] || {
    size: 'M',
    isCollapsed: false,
    isPinned: false,
    isFavorite: false,
  };

  const events = widgetEvents[id] || [];

  // Local input for injecting custom error messages
  const [customErrorInput, setCustomErrorInput] = useState('');

  // Auto-log receiving of view model on first render
  useEffect(() => {
    // Simulate Receiving ViewModel subscription
    const timer = setTimeout(() => {
      // In real life, view model would arrive now
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  // Adjust display according to the widget's container size
  const isCompact = prefs.size === 'XS' || prefs.size === 'S';

  return (
    <div id={`widget-renderer-${id}`} className="flex-1 flex flex-col justify-between h-full space-y-3 font-sans">
      {/* Upper Panel: Layout changes depending on compactness */}
      <div className={`flex-1 grid gap-3 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-12'}`}>
        
        {/* Visual telemetry block */}
        <div className={`flex flex-col justify-between rounded border border-slate-900 bg-slate-950/40 p-3 ${isCompact ? '' : 'md:col-span-6'}`}>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                SYSTEM TELEMETRY CONTEXT
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-1">
              {metadata.description}
            </p>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-slate-900/60">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-900/40 border border-slate-900 px-2 py-1 rounded">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">CATEGORY</span>
                <span className="text-[9px] font-semibold text-slate-300 font-sans truncate block uppercase">{metadata.category}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-900 px-2 py-1 rounded">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">REQUIRED VM</span>
                <span className="text-[9px] font-mono text-emerald-400 truncate block">{metadata.requiredViewModel}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-slate-900/40 border border-slate-900 px-2 py-1 rounded">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">STRATEGY</span>
                <span className="text-[9px] font-semibold text-slate-300 font-sans truncate block uppercase font-mono">{metadata.refreshStrategy}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-900 px-2 py-1 rounded">
                <span className="block text-[8px] font-mono text-slate-500 uppercase">PERMISSIONS</span>
                <span className="text-[9px] font-mono text-slate-400 truncate block">
                  {metadata.requiredPermissions.length === 0 ? 'None (Static)' : metadata.requiredPermissions.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic simulator and interactive state toggler (only visible when size permits or compact is not extremely tight) */}
        {!isCompact && (
          <div className="md:col-span-6 flex flex-col justify-between rounded border border-slate-900 bg-slate-950/40 p-3">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                  DEVELOPER RUNTIME DRIVER
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Trigger various states dynamically to verify layout containment and error handlers.
              </p>
            </div>

            <div className="space-y-3 mt-3">
              {/* Preset triggers */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setWidgetState(id, 'Loading')}
                  className={`text-[9px] font-mono border rounded py-1 transition-all duration-150 ${
                    state === 'Loading' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  LOADING
                </button>
                <button
                  onClick={() => setWidgetState(id, 'Empty')}
                  className={`text-[9px] font-mono border rounded py-1 transition-all duration-150 ${
                    state === 'Empty' ? 'border-slate-600 bg-slate-800/50 text-slate-300' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  EMPTY
                </button>
                <button
                  onClick={() => setWidgetState(id, 'Offline')}
                  className={`text-[9px] font-mono border rounded py-1 transition-all duration-150 ${
                    state === 'Offline' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  OFFLINE
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setWidgetState(id, 'Partial Data')}
                  className={`text-[9px] font-mono border rounded py-1 transition-all duration-150 ${
                    state === 'Partial Data' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  PARTIAL STATE
                </button>
                <button
                  onClick={() => setWidgetState(id, 'Ready')}
                  className={`text-[9px] font-mono border rounded py-1 transition-all duration-150 ${
                    state === 'Ready' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  RESTORE READY
                </button>
              </div>

              {/* Error Injection */}
              <div className="flex space-x-1.5 pt-1.5 border-t border-slate-900/60">
                <input
                  type="text"
                  placeholder="Custom fail log string..."
                  value={customErrorInput}
                  onChange={(e) => setCustomErrorInput(e.target.value)}
                  className="flex-1 text-[9px] font-mono bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-red-500/50 placeholder-slate-600"
                />
                <button
                  onClick={() => {
                    const msg = customErrorInput.trim() || 'INJECTION AT SYSTEM RUNTIME: BUFFER_OVERFLOW';
                    setWidgetError(id, msg);
                    setCustomErrorInput('');
                  }}
                  className="text-[9px] font-mono border border-red-500/30 hover:border-red-400 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded transition-all duration-150"
                >
                  FAIL WIDGET
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Lifecycle Event Logger */}
      <div className="rounded border border-slate-900 bg-slate-950/60 p-2">
        <div className="flex items-center justify-between mb-1.5 text-slate-500">
          <div className="flex items-center space-x-1">
            <History className="w-3 h-3 text-indigo-400" />
            <span className="text-[8px] font-mono uppercase tracking-wider">
              REAL-TIME SDK LIFECYCLE MONITOR
            </span>
          </div>
          <span className="text-[8px] font-mono text-indigo-500 uppercase">
            Active Listeners: 100%
          </span>
        </div>

        {/* Scrollable logger display */}
        <div className="h-[60px] overflow-y-auto font-mono text-[9px] space-y-1 scrollbar-none select-text">
          {events.length === 0 ? (
            <div className="text-slate-600 italic py-2">Listening for container signals...</div>
          ) : (
            events.map((evt, idx) => {
              const time = evt.timestamp.split('T')[1]?.slice(0, 8) || '';
              return (
                <div key={idx} className="flex items-start space-x-1.5 text-[8px] leading-3">
                  <span className="text-slate-600">[{time}]</span>
                  <span className={`uppercase font-bold ${
                    evt.type === 'mount' ? 'text-emerald-400' :
                    evt.type === 'initialize' ? 'text-blue-400' :
                    evt.type === 'receive_viewmodel' ? 'text-purple-400' :
                    evt.type === 'refresh' ? 'text-amber-400' :
                    evt.type === 'resize' ? 'text-indigo-400' :
                    evt.type === 'destroy' ? 'text-rose-400' :
                    'text-slate-400'
                  }`}>
                    {evt.type}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-300 truncate">
                    {evt.payload ? JSON.stringify(evt.payload) : 'Signal handshake broadcast successfully.'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
