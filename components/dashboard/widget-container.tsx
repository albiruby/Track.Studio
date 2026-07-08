'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/providers/dashboard-provider';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  AlertTriangle, 
  Inbox, 
  Maximize2, 
  Minimize2,
  EyeOff,
  MoreVertical,
  Heart
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
  const { updateWidgetVisibility, dashboardState } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Clean, consistent layout spacing (Bauhaus specs: 16px padding, 12px inner)
  const paddingClass = 'p-4';
  const headerPaddingClass = 'px-4 pt-4 pb-2';
  const footerPaddingClass = 'px-4 pb-4 pt-2';

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
        'relative bg-[#121722] border border-[#232A36] text-foreground transition-all duration-300 flex flex-col focus-within:ring-1 focus-within:ring-primary/45 outline-none select-none overflow-hidden h-full rounded-[18px] hover:border-[#323b4b] hover:shadow-lg hover:-translate-y-0.5',
        isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen bg-[#0F1117] p-6' : '',
        className
      )}
    >
      {/* Upper Header section */}
      <CardHeader className={cn('flex flex-col gap-1 shrink-0', headerPaddingClass)}>
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex flex-col min-w-0">
            <CardTitle 
              id={`widget-title-${id}`}
              className="text-sm font-semibold tracking-tight text-foreground uppercase truncate"
            >
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-muted-foreground font-medium leading-none truncate mt-1 text-[11px]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Widget Toolbar / Operations Panel */}
          <div className="flex items-center gap-1 shrink-0 select-none">
            {toolbar && <div className="flex items-center gap-1 mr-1">{toolbar}</div>}
            
            {/* Interactive favorite heart button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorited(!isFavorited)}
              className={cn(
                "h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors",
                isFavorited && "text-[#FF6B00] hover:text-[#FF6B00]"
              )}
              title="Favorite widget"
            >
              <Heart className={cn("h-3.5 w-3.5", isFavorited && "fill-current")} />
            </Button>

            {onRefresh && !isWidgetLoading && !error && !isEmpty && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLocalRefresh}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                aria-label={`Refresh data for ${title}`}
                title="Refresh"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isWidgetRefreshing && 'animate-spin text-status-success')} />
              </Button>
            )}

            {/* Expand / minimize icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                aria-label={`Settings for ${title}`}
                id={`widget-menu-trigger-${id}`}
                title="More options"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div 
                    className="absolute right-0 mt-1 w-44 rounded-xl border border-border bg-[#121722]/95 backdrop-blur-md shadow-xl z-20 p-1 text-xs"
                    id={`widget-menu-${id}`}
                  >
                    <button
                      onClick={() => {
                        updateWidgetVisibility(id, false);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-status-danger/10 text-muted-foreground hover:text-status-danger text-left font-medium transition-colors"
                    >
                      <EyeOff className="h-3 w-3" />
                      <span>Hide Widget</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main Content Slot */}
      <CardContent className={cn('flex-1 flex flex-col justify-center min-h-[140px]', paddingClass)}>
        {isWidgetLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3.5 py-6" id={`widget-loading-${id}`}>
            <RefreshCw className="h-7 w-7 animate-spin text-muted-foreground/60" />
            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-wider">Syncing Stream...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5 bg-status-danger/5 rounded-xl border border-status-danger/10" id={`widget-error-${id}`}>
            <AlertTriangle className="h-6 w-6 text-status-danger" />
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Sync Stream Error</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] mx-auto">{error}</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5" id={`widget-empty-${id}`}>
            <Inbox className="h-6 w-6 text-muted-foreground/45" />
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">No activities synced yet</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed mx-auto">
                Connect Strava in Connections to begin.
              </p>
            </div>
          </div>
        ) : isGlobalOffline ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2.5" id={`widget-offline-${id}`}>
            <AlertTriangle className="h-6 w-6 text-muted-foreground/60" />
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Offline mode active</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[240px] leading-relaxed mx-auto">
                No active internet connection found. Working with cached records.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full w-full relative">
            {isWidgetRefreshing && (
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 text-[9px] font-mono text-status-success font-semibold px-1.5 py-0.5 rounded-lg bg-status-success/10 border border-status-success/20">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                <span>Syncing</span>
              </div>
            )}
            {children}
          </div>
        )}
      </CardContent>

      {/* Footer slot */}
      {footer && (
        <CardFooter className={cn('border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 select-none bg-muted/5', footerPaddingClass)}>
          <div />
          {footer && <div className="shrink-0">{footer}</div>}
        </CardFooter>
      )}
    </Card>
  );
}
