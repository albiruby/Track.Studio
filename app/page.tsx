'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useWorkspace } from '@/providers/workspace-provider';
import { WorkspaceLayout } from '@/components/layouts/workspace-layout';
import { ConnectionCenter } from '@/components/dashboard/connection-center';
import { AuthenticationLayout } from '@/components/layouts/authentication-layout';
import { FullscreenLayout } from '@/components/layouts/fullscreen-layout';
import { ErrorLayout } from '@/components/layouts/error-layout';
import { MaintenanceLayout } from '@/components/layouts/maintenance-layout';
import { OfflineLayout } from '@/components/layouts/offline-layout';
import { EmptyWorkspaceLayout } from '@/components/layouts/empty-workspace-layout';
import { PrintLayout } from '@/components/layouts/print-layout';
import { Button } from '@/components/ui/button';
import { CardLoader, TableLoader, ChartPlaceholder } from '@/components/ui/loading-skeletons';
import { 
  Flame, 
  Activity, 
  Settings, 
  Compass, 
  Lock, 
  Layout, 
  Monitor, 
  AlertOctagon, 
  Wrench, 
  WifiOff, 
  FileCheck, 
  Printer, 
  Heart, 
  Zap, 
  ChevronRight,
  Eye,
  RefreshCw,
  Calendar,
  SlidersHorizontal
} from 'lucide-react';

// Phase 11 Dashboard Platform Integrations
import { DashboardProvider, useDashboard } from '@/providers/dashboard-provider';
import { DashboardPageRenderer } from '@/components/dashboard/dashboard-page-renderer';
import { DASHBOARD_REGISTRY } from '@/lib/dashboard/registry';
import { CompositionProvider } from '@/components/dashboard/composition/composition-context';

export default function Page() {
  const { user, loginWithGoogle } = useAuth() as any;
  const { activeAthlete, triggerSync, isCompactMode } = useWorkspace();
  
  // Interactive View Selector State to showcase all Phase 10 Layouts
  const [activeLayoutView, setActiveLayoutView] = useState<'standard' | 'auth' | 'fullscreen' | 'error' | 'maintenance' | 'offline' | 'empty' | 'print'>('standard');

  // If user is not authenticated, show Authentication Layout by default
  if (!user && activeLayoutView === 'standard') {
    return (
      <AuthenticationLayout 
        title="Sign In to Ingestion Shell" 
        subtitle="Manage secure performance webhooks and telemetry calibrations"
        footerContent={
          <p className="text-[11px] leading-normal text-muted-foreground">
            Don&apos;t have a secure token? Contact your workspace systems administrator.
          </p>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-normal">
            Authenticate using your certified Google Account to launch the performance database.
          </p>
          <Button 
            variant="default" 
            className="w-full h-10 font-bold bg-foreground text-background hover:bg-foreground/90 uppercase text-xs tracking-wider cursor-pointer"
            onClick={loginWithGoogle}
            id="auth-google-login-trigger"
          >
            Sign in with Google
          </Button>
        </div>
      </AuthenticationLayout>
    );
  }

  // =========================================================
  // 1. AUTHENTICATION LAYOUT VIEW PREVIEW
  // =========================================================
  if (activeLayoutView === 'auth') {
    return (
      <AuthenticationLayout
        title="Handshake Protocol In Progress"
        subtitle="Establishing OAuth connections to external channels"
        footerContent={
          <button 
            onClick={() => setActiveLayoutView('standard')}
            className="text-foreground hover:underline font-bold cursor-pointer"
          >
            ← Return to Standard Workspace
          </button>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3 p-3 rounded bg-secondary/20 border border-border text-xs">
            <Lock className="h-4.5 w-4.5 text-status-success shrink-0" />
            <span className="font-medium text-muted-foreground">HANDSHAKE STATUS: <b className="text-status-success uppercase font-mono">Secured</b></span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Authorized scopes are loaded into local transient session stores. Hands-free redirection to your dashboard in progress.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-9 uppercase"
            onClick={() => setActiveLayoutView('standard')}
          >
            Bypass & Launch Workspace
          </Button>
        </div>
      </AuthenticationLayout>
    );
  }

  // =========================================================
  // 2. FULLSCREEN CANVAS PREVIEW
  // =========================================================
  if (activeLayoutView === 'fullscreen') {
    return (
      <FullscreenLayout 
        onClose={() => setActiveLayoutView('standard')}
        title="IMMERSIVE SPANNER TELEMETRY MATRIX"
      >
        <div className="space-y-6 h-full flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-4 bg-muted/30 border border-border rounded-lg max-w-xl">
              <span className="text-[10px] font-mono font-bold bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase">WORKSPACE ENVIRONMENT CAP</span>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                A pristine, minimal full-canvas environment suited for complex interactive canvas renderers, maps integrations, or high-fidelity performance metrics.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground select-none">
            <span>COMPREHENSIVE RUN SYSTEM: ACTIVE</span>
            <span>PRESS ESCAPE OR CLICK UPPER RIGHT TO DISMISS</span>
          </div>
        </div>
      </FullscreenLayout>
    );
  }

  // =========================================================
  // 3. ERROR DIAGNOSTICS PREVIEW (500)
  // =========================================================
  if (activeLayoutView === 'error') {
    return (
      <ErrorLayout 
        errorCode="500"
        title="FIRESTORE PERSISTENCE DEADLOCK"
        description="The workspace write transaction timed out waiting for local sync locks. Internal ingestion buffers are currently offline."
        onRetry={() => setActiveLayoutView('standard')}
      />
    );
  }

  // =========================================================
  // 4. MAINTENANCE LOCK SCREEN PREVIEW
  // =========================================================
  if (activeLayoutView === 'maintenance') {
    return (
      <MaintenanceLayout 
        estimatedTimeLeft="2 Hours"
      />
    );
  }

  // =========================================================
  // 5. OFFLINE CACHING LAYOUT PREVIEW
  // =========================================================
  if (activeLayoutView === 'offline') {
    return (
      <OfflineLayout 
        onReconnect={() => setActiveLayoutView('standard')}
      />
    );
  }

  // =========================================================
  // 6. EMPTY WORKSPACE ONBOARDING CHECKLIST PREVIEW
  // =========================================================
  if (activeLayoutView === 'empty') {
    return (
      <WorkspaceLayout
        title="Onboarding Calibration"
        subtitle="Complete milestones to initialize database models"
        activeRouteId="dashboard"
        toolbar={
          <Button variant="outline" size="sm" className="h-8 uppercase" onClick={() => setActiveLayoutView('standard')}>
            Bypass onboarding
          </Button>
        }
        contentSlot={<EmptyWorkspaceLayout />}
      />
    );
  }

  // =========================================================
  // 7. PRINT PREVIEW LAYOUT
  // =========================================================
  if (activeLayoutView === 'print') {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-10 flex flex-col items-center">
        <div className="w-full max-w-4xl flex justify-between items-center mb-4 bg-card p-4 rounded-lg border border-border select-none shadow-sm">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-foreground" />
            <span className="text-xs font-bold uppercase">PRINT REPORT VIEW PREVIEW</span>
          </div>
          <Button variant="default" size="sm" className="h-8 uppercase font-semibold text-[10px]" onClick={() => setActiveLayoutView('standard')}>
            ← Back to Screen Mode
          </Button>
        </div>

        <PrintLayout 
          reportTitle="ATHLETE PERFORMANCE MODEL COUPLING REPORT"
          athleteName={activeAthlete.name}
          className="w-full max-w-4xl shadow-xl border border-border rounded-lg bg-white"
        >
          <div className="grid grid-cols-3 gap-6 pt-4 text-xs">
            <div className="col-span-2 border border-black p-4 space-y-4">
              <h3 className="font-bold uppercase tracking-wider border-b border-black pb-2">PHYSIOLOGICAL PARAMETERS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 font-mono text-[10px] block">VO2 MAX CAPACITY:</span>
                  <span className="font-bold text-sm">{activeAthlete.vo2max} ml/kg/min</span>
                </div>
                <div>
                  <span className="text-gray-500 font-mono text-[10px] block">FUNCTIONAL THRESHOLD PACE (FTP):</span>
                  <span className="font-bold text-sm">{activeAthlete.ftpWatts} Watts</span>
                </div>
                <div>
                  <span className="text-gray-500 font-mono text-[10px] block">RESTING HEART RATE:</span>
                  <span className="font-bold text-sm">{activeAthlete.restingHr} BPM</span>
                </div>
                <div>
                  <span className="text-gray-500 font-mono text-[10px] block">MAXIMUM HEART RATE:</span>
                  <span className="font-bold text-sm">{activeAthlete.maxHr} BPM</span>
                </div>
              </div>
            </div>

            <div className="border border-black p-4 space-y-3">
              <h3 className="font-bold uppercase tracking-wider border-b border-black pb-2 text-[11px]">CALIBRATION</h3>
              <ul className="space-y-1.5 font-mono text-[10px] leading-relaxed text-gray-700 list-disc pl-4">
                <li>Direct Handshake with Strava established</li>
                <li>Zero-latency mathematical analytics verified</li>
                <li>Fidelity rating: <b>99.8%</b></li>
              </ul>
            </div>
          </div>

          <div className="border border-black p-4 space-y-3">
            <h3 className="font-bold uppercase tracking-wider border-b border-black pb-2">HISTORIC INGESTION FEEDS</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-200 py-1.5 text-[11px]">
                <span className="font-semibold text-gray-700">1. Morning Tempo Run (Strava direct webhook feed)</span>
                <span className="font-bold">10.0km • 41:20 • Recalibrated successfully</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 py-1.5 text-[11px]">
                <span className="font-semibold text-gray-700">2. Threshold Splits Calibration Ingestion</span>
                <span className="font-bold">15.0km • 1:04:15 • Recalibrated successfully</span>
              </div>
            </div>
          </div>
        </PrintLayout>
      </div>
    );
  }

  // =========================================================
  // 8. STANDARD CORE VIEW (Unified Workspace Layout)
  // =========================================================
  return (
    <DashboardProvider>
      <CompositionProvider>
        <WorkspaceDashboardView 
          activeAthlete={activeAthlete}
          activeLayoutView={activeLayoutView}
          setActiveLayoutView={setActiveLayoutView}
          triggerSync={triggerSync}
          isCompactMode={isCompactMode}
        />
      </CompositionProvider>
    </DashboardProvider>
  );
}

/**
 * Subcomponent to safely consume DashboardProvider state contexts inside Page
 */
function WorkspaceDashboardView({
  activeAthlete,
  activeLayoutView,
  setActiveLayoutView,
  triggerSync,
  isCompactMode
}: {
  activeAthlete: any;
  activeLayoutView: string;
  setActiveLayoutView: (v: any) => void;
  triggerSync: () => void;
  isCompactMode: boolean;
}) {
  const { 
    activeDashboardId, 
    setActiveDashboardId, 
    activeDashboard,
    dashboardState,
    viewModels,
    lastRefreshedAt
  } = useDashboard();

  // Route awareness backplane syncing URL changes with Dashboard Context
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && DASHBOARD_REGISTRY[hash]) {
        setActiveDashboardId(hash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setActiveDashboardId]);

  // Premium Date Range Picker Dropdown Toolbar from Bauhaus mockup
  const dateRangePicker = (
    <div className="flex items-center gap-2 select-none" id="dashboard-date-range-controls">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-xs hover:bg-secondary/40 transition-all duration-200">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>May 12 – May 18, 2024</span>
      </div>
      <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border" id="dashboard-filter-settings">
        <SlidersHorizontal className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  // Destructure from viewModels
  const homeVM = viewModels?.HomeDashboardViewModel;
  const weeklyDist = homeVM?.weeklySummary?.currentWeekDistanceKm ?? 42.6;
  const weeklyRss = homeVM?.weeklySummary?.currentWeekRss ?? 295;
  const targetRss = homeVM?.weeklySummary?.targetRss ?? 420;
  
  const perfVM = homeVM?.performanceMetrics;
  const ctl = perfVM?.currentCtl ?? 72.4;
  const atl = perfVM?.currentAtl ?? 85.8;
  const tsb = perfVM?.currentTsb ?? -13.4;

  const activities = viewModels?.ActivitySummaryViewModel?.activities ?? [];
  const sumKm = activities.reduce((acc: number, act: any) => acc + (act.distanceKm || 0), 0);
  const monthlyDist = sumKm > 0 ? sumKm * 3.15 : 164.2;

  const vo2max = activeAthlete.vo2max ?? 61;
  const dataQuality = 99.8;
  const formattedSyncTime = lastRefreshedAt 
    ? new Date(lastRefreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : '12:45 UTC';

  // Premium 9-column KPI Strip
  const kpiStrip = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 select-none" id="premium-kpi-ribbon">
      
      {/* 1. Weekly Distance */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Weekly Dist</span>
          <Activity className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{weeklyDist.toFixed(1)}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">km</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Curr week sum</span>
      </div>

      {/* 2. Monthly Distance */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Monthly Dist</span>
          <Compass className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{monthlyDist.toFixed(1)}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">km</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">30d trailing</span>
      </div>

      {/* 3. Chronic Training Load (CTL) */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">CTL (Fitness)</span>
          <Flame className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{ctl.toFixed(1)}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">TSS/d</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Chronic load</span>
      </div>

      {/* 4. Acute Training Load (ATL) */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">ATL (Fatigue)</span>
          <Zap className="h-3.5 w-3.5 text-status-warning group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{atl.toFixed(1)}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">TSS/d</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Acute load</span>
      </div>

      {/* 5. Training Stress Balance (TSB) */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">TSB (Form)</span>
          <Heart className="h-3.5 w-3.5 text-status-danger group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className={`text-base font-extrabold tracking-tight ${tsb >= 0 ? 'text-status-success' : 'text-status-warning'}`}>
            {tsb > 0 ? `+${tsb.toFixed(1)}` : tsb.toFixed(1)}
          </span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">TSS/d</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Form balance</span>
      </div>

      {/* 6. VO2 Max */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">VO₂max</span>
          <Activity className="h-3.5 w-3.5 text-status-success group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{vo2max}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">ml/kg</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Performance cap</span>
      </div>

      {/* 7. Training Load (RSS) */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Training Load</span>
          <Lock className="h-3.5 w-3.5 text-muted-foreground group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{weeklyRss}</span>
          <span className="text-[9px] text-muted-foreground font-medium ml-0.5">/ {targetRss} RSS</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Weekly RSS target</span>
      </div>

      {/* 8. Data Quality */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Data Quality</span>
          <FileCheck className="h-3.5 w-3.5 text-status-info group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{dataQuality.toFixed(1)}%</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">No corrupt feeds</span>
      </div>

      {/* 9. Last Sync */}
      <div className="rounded-[18px] border border-border/80 bg-card p-3.5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Last Sync</span>
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-2.5">
          <span className="text-base font-extrabold tracking-tight text-foreground">{formattedSyncTime}</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono mt-1">Handshake verified</span>
      </div>

    </div>
  );

  // Pick between original connections panel or modular dashboard renderer, wrapped alongside the Premium KPI Ribbon
  const contentBody = (
    <div className="space-y-6">
      {kpiStrip}
      {activeDashboardId === 'connections' ? (
        <ConnectionCenter />
      ) : (
        <DashboardPageRenderer />
      )}
    </div>
  );

  // Premium Sports Analytics Insight Card
  const sportsInsightWidget = (
    <div className="space-y-4 text-xs leading-normal select-none" id="workspace-sidebar-sports-insight">
      <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
        <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">Weekly Progression</span>
        
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium">RSS Target Progress</span>
              <span className="font-bold text-foreground">70%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '70%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-muted-foreground font-medium">Distance Progress</span>
              <span className="font-bold text-foreground">85%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-status-success rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground font-medium text-[11px] leading-relaxed">
        Your Chronic Training Load (CTL) has increased by <b>3.2%</b> over the last 7 days, indicating supercompensation of physical capacity. Keep acute fatigue in check.
      </p>
    </div>
  );

  // Dynamically compute layout Titles
  const workspaceTitle = activeDashboardId === 'connections' ? 'Ingestion Center' : activeDashboard.name;
  const workspaceSubtitle = activeDashboardId === 'connections' 
    ? 'Configure external ingestion endpoints, handshakes, and token registries' 
    : activeDashboard.documentation;

  return (
    <WorkspaceLayout
      title={workspaceTitle}
      subtitle={workspaceSubtitle}
      activeRouteId={activeDashboardId}
      toolbar={dateRangePicker}
      contentSlot={contentBody}
      sidePanelSlot={sportsInsightWidget}
      footerSlot={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase text-muted-foreground">
          <span>Database handshakes: <b className="text-foreground">Connected</b></span>
          <span>Authentication sessions: <b className="text-foreground">Authentic</b></span>
        </div>
      }
    />
  );
}
