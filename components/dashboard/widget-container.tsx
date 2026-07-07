'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  AlertTriangle, 
  Inbox, 
  HelpCircle, 
  Maximize2, 
  Minimize2,
  Settings2,
  EyeOff,
  MoreVertical,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WidgetContainerProps {
  id: string;
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  timestamp?: string;
  onRefresh?: () => Promise<void> | void;
  className?: string;
}

export function WidgetContainer({
  id,
  title,
  subtitle,
  toolbar,
  loading = false,
  error = null,
  isEmpty = false,
  children,
  footer,
  timestamp,
  onRefresh,
  className,
}: WidgetContainerProps) {
  const { preferences, updateWidgetVisibility, dashboardState } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Determine local density padding
  const density = preferences.layoutDensity;
  const paddingClass = 
    density === 'compact' ? 'p-3' : 
    density === 'spacious' ? 'p-6' : 
    'p-5';

  const headerPaddingClass = 
    density === 'compact' ? 'px-3 pt-3 pb-1' : 
    density === 'spacious' ? 'px-6 pt-6 pb-2' : 
    'px-5 pt-5 pb-1.5';

  const footerPaddingClass = 
    density === 'compact' ? 'px-3 pb-3 pt-1' : 
    density === 'spacious' ? 'px-6 pb-6 pt-2' : 
    'px-5 pb-5 pt-1.5';

  const handleLocalRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (e) {
        console.error('Widget refresh error', e);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  // Determine actual state
  const isGlobalLoading = dashboardState === 'Loading';
  const isGlobalOffline = dashboardState === 'Offline';
  const isWidgetLoading = loading || isGlobalLoading;
  const isWidgetRefreshing = isRefreshing || dashboardState === 'Refreshing';

  return (
    <Card
      id={`widget-${id}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-labelledby={`widget-title-${id}`}
      className={cn(
        'relative bg-card border border-border/80 text-foreground transition-all flex flex-col focus-within:ring-1 focus-within:ring-ring/45 outline-none select-none overflow-hidden h-full',
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen bg-background p-6' : 'hover:shadow-sm',
        className
      )}
    >
      {/* Upper Header section */}
      <CardHeader className={cn('flex flex-col gap-1 shrink-0', headerPaddingClass)}>
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex flex-col min-w-0">
            <CardTitle 
              id={`widget-title-${id}`}
              className={cn(
                'font-bold tracking-tight text-foreground uppercase truncate',
                density === 'compact' ? 'text-[11px]' : 'text-xs'
              )}
            >
              {title}
            </CardTitle>
            {subtitle && (
              <p className={cn('text-muted-foreground font-medium leading-none truncate mt-0.5', density === 'compact' ? 'text-[9px]' : 'text-[10px]')}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Widget Toolbar / Operations Panel */}
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            {toolbar && <div className="flex items-center gap-1">{toolbar}</div>}
            
            {onRefresh && !isWidgetLoading && !error && !isEmpty && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLocalRefresh}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label={`Refresh data for ${title}`}
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isWidgetRefreshing && 'animate-spin text-status-success')} />
              </Button>
            )}

            {/* Config & More Actions Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label={`Settings for ${title}`}
                id={`widget-menu-trigger-${id}`}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div 
                    className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-card shadow-lg z-20 p-1 text-xs"
                    id={`widget-menu-${id}`}
                  >
                    <button
                      onClick={() => {
                        setIsFullscreen(!isFullscreen);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground text-left"
                    >
                      {isFullscreen ? (
                        <>
                          <Minimize2 className="h-3 w-3" />
                          <span>Exit Fullscreen</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3 w-3" />
                          <span>Fullscreen Mode</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        updateWidgetVisibility(id, false);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-status-danger/15 text-muted-foreground hover:text-status-danger text-left font-medium"
                    >
                      <EyeOff className="h-3 w-3" />
                      <span>Hide Widget</span>
                    </button>
                    <div className="h-px bg-border my-1" />
                    <div className="px-2.5 py-1 text-[9px] font-mono text-muted-foreground uppercase font-bold">
                      WIDGET ID: {id}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main Content Slot / Template Conditionals */}
      <CardContent className={cn('flex-1 flex flex-col justify-center min-h-[140px]', paddingClass)}>
        {isWidgetLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3.5 py-6" id={`widget-loading-${id}`}>
            <RefreshCw className="h-7 w-7 animate-spin text-muted-foreground/60" />
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Compiling View Model...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5 bg-status-danger/5 rounded border border-status-danger/10" id={`widget-error-${id}`}>
            <AlertTriangle className="h-6 w-6 text-status-danger" />
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Data pipeline broken</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 leading-relaxed max-w-[240px] mx-auto">{error}</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5" id={`widget-empty-${id}`}>
            <Inbox className="h-6 w-6 text-muted-foreground/45" />
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">No activities on file</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[240px] leading-relaxed mx-auto">
                No telemetry packet ingested for the requested physiological bounds. Connect Strava or upload a FIT stream.
              </p>
            </div>
          </div>
        ) : isGlobalOffline ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5" id={`widget-offline-${id}`}>
            <AlertTriangle className="h-6 w-6 text-muted-foreground/60" />
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Workspace Caching Active</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[240px] leading-relaxed mx-auto">
                Local transient browser cache active. Live sync disabled until secure gateway connectivity is restored.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full w-full relative">
            {isWidgetRefreshing && (
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[9px] font-mono text-status-success font-semibold px-1.5 py-0.5 rounded bg-status-success/10 border border-status-success/20">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                <span>Syncing</span>
              </div>
            )}
            {children}
          </div>
        )}
      </CardContent>

      {/* Footer slot */}
      {(footer || timestamp) && (
        <CardFooter className={cn('border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground shrink-0 select-none bg-muted/15', footerPaddingClass)}>
          {timestamp ? (
            <span className="truncate">Trace: {timestamp}</span>
          ) : (
            <div />
          )}
          {footer && <div className="shrink-0">{footer}</div>}
        </CardFooter>
      )}
    </Card>
  );
}
