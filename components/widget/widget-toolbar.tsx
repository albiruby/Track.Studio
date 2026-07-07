'use client';

import React from 'react';
import { useWidget } from './widget-context';
import { 
  RotateCw, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Pin, 
  Heart, 
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface WidgetToolbarProps {
  widgetId: string;
}

export function WidgetToolbar({ widgetId }: WidgetToolbarProps) {
  const {
    widgetStates,
    widgetPreferences,
    fullscreenWidgetId,
    refreshWidget,
    toggleFullscreen,
    toggleCollapse,
    toggleFavorite,
    togglePin,
    exportWidgetData
  } = useWidget();

  const state = widgetStates[widgetId] || 'Ready';
  const prefs = widgetPreferences[widgetId] || {
    size: 'M',
    isCollapsed: false,
    isPinned: false,
    isFavorite: false,
  };

  const isRefreshing = state === 'Refreshing';
  const isCollapsed = prefs.isCollapsed;
  const isFullscreen = fullscreenWidgetId === widgetId;

  return (
    <div id={`toolbar-${widgetId}`} className="flex items-center space-x-1" aria-label="Widget Toolbar">
      {/* Favorite (future) */}
      <button
        id={`btn-fav-${widgetId}`}
        onClick={() => toggleFavorite(widgetId)}
        className={`p-1.5 rounded transition-all duration-150 relative group ${
          prefs.isFavorite 
            ? 'text-rose-500 hover:text-rose-600 bg-rose-500/10' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={prefs.isFavorite ? "Remove from Favorites" : "Mark as Favorite (Future)"}
        aria-label="Favorite"
      >
        <Heart className="w-3.5 h-3.5" />
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 py-0.5 px-1.5 rounded shadow-xl z-20">
          {prefs.isFavorite ? "Favorited!" : "Favorite (Future)"}
        </span>
      </button>

      {/* Pin (future) */}
      <button
        id={`btn-pin-${widgetId}`}
        onClick={() => togglePin(widgetId)}
        className={`p-1.5 rounded transition-all duration-150 relative group ${
          prefs.isPinned 
            ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={prefs.isPinned ? "Unpin Widget" : "Pin to Dashboard (Future)"}
        aria-label="Pin"
      >
        <Pin className="w-3.5 h-3.5" />
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 py-0.5 px-1.5 rounded shadow-xl z-20">
          {prefs.isPinned ? "Pinned!" : "Pin (Future)"}
        </span>
      </button>

      {/* Refresh */}
      <button
        id={`btn-refresh-${widgetId}`}
        onClick={() => refreshWidget(widgetId)}
        disabled={isRefreshing}
        className={`p-1.5 rounded transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-50 relative group`}
        title="Refresh Widget"
        aria-label="Refresh data"
      >
        <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 py-0.5 px-1.5 rounded shadow-xl z-20">
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </span>
      </button>

      {/* Fullscreen */}
      <button
        id={`btn-fullscreen-${widgetId}`}
        onClick={() => toggleFullscreen(widgetId)}
        className="p-1.5 rounded transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-800 relative group"
        title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
        aria-label="Fullscreen toggle"
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 py-0.5 px-1.5 rounded shadow-xl z-20">
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </span>
      </button>

      {/* Export (Disabled) */}
      <button
        id={`btn-export-${widgetId}`}
        disabled
        className="p-1.5 rounded text-slate-600 bg-transparent cursor-not-allowed relative group"
        title="Export Data (Infrastructure Only)"
        aria-label="Export data (disabled)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-500 py-0.5 px-1.5 rounded shadow-xl z-20">
          Export (Disabled)
        </span>
      </button>

      {/* Settings (Future) */}
      <button
        id={`btn-settings-${widgetId}`}
        disabled
        className="p-1.5 rounded text-slate-600 cursor-not-allowed relative group"
        title="Settings (Future)"
        aria-label="Widget settings (disabled)"
      >
        <Settings className="w-3.5 h-3.5" />
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-500 py-0.5 px-1.5 rounded shadow-xl z-20">
          Settings (Future)
        </span>
      </button>

      <div className="w-[1px] h-3.5 bg-slate-800 mx-1" />

      {/* Collapse / Expand */}
      <button
        id={`btn-collapse-${widgetId}`}
        onClick={() => toggleCollapse(widgetId)}
        className="p-1.5 rounded transition-all duration-150 text-slate-400 hover:text-slate-200 hover:bg-slate-800 relative group"
        title={isCollapsed ? "Expand Widget" : "Collapse Widget"}
        aria-label={isCollapsed ? "Expand widget" : "Collapse widget"}
      >
        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom whitespace-nowrap bg-slate-900 border border-slate-700 text-[10px] text-slate-300 py-0.5 px-1.5 rounded shadow-xl z-20">
          {isCollapsed ? 'Expand' : 'Collapse'}
        </span>
      </button>
    </div>
  );
}
