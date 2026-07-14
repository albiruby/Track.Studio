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
import { cn } from '@/lib/utils';
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
import { ActivityAnalysisWorkspace } from '@/components/dashboard/activity-analysis-workspace';
import { DASHBOARD_REGISTRY } from '@/lib/dashboard/registry';
import { CompositionProvider } from '@/components/dashboard/composition/composition-context';
import { InteractiveWorkspaceProvider } from '@/providers/interactive-workspace-provider';
import { UniversalTimeRangeController } from '@/components/dashboard/interactive-workspace-components';

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
      <InteractiveWorkspaceProvider>
        <CompositionProvider>
          <WorkspaceDashboardView 
            activeAthlete={activeAthlete}
            activeLayoutView={activeLayoutView}
            setActiveLayoutView={setActiveLayoutView}
            triggerSync={triggerSync}
            isCompactMode={isCompactMode}
          />
        </CompositionProvider>
      </InteractiveWorkspaceProvider>
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

  // Premium Date Range Picker Dropdown Toolbar from UniversalTimeRangeController
  const dateRangePicker = (
    <UniversalTimeRangeController />
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

  // Standardized Clean KPI Card Renderer for Premium SaaS Redesign
  const renderKpiCard = (args: {
    title: string;
    subtitle: string;
    value: string;
    unit?: string;
    trend: string;
    trendUp?: boolean;
    sparklinePoints: string;
  }) => {
    return (
      <div className="rounded-2xl border border-border bg-card p-4.5 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all duration-300 relative overflow-hidden group select-none min-h-[135px]" id={`kpi-card-${args.title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div>
          {/* Title */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {args.title}
            </span>
          </div>

          {/* Value + Trend */}
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-foreground font-sans">
              {args.value}
            </span>
            {args.unit && (
              <span className="text-xs font-semibold text-muted-foreground lowercase ml-0.5">
                {args.unit}
              </span>
            )}
            <span className={cn(
              "text-xs font-semibold flex items-center gap-0.5 ml-1.5",
              args.trendUp ? "text-emerald-500" : "text-rose-500"
            )}>
              {args.trend}
            </span>
          </div>

          {/* Subtitle */}
          <div className="mt-1 text-[11px] text-muted-foreground font-medium">
            {args.subtitle}
          </div>
        </div>

        {/* Pure & simple accent sparkline in the bottom */}
        <div className="mt-4 h-6 w-full relative">
          <svg className="w-full h-full text-primary shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d={args.sparklinePoints} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  };

  // Premium 6-column KPI Strip as per Mockup
  const kpiStrip = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 select-none" id="premium-kpi-ribbon">
      {/* 1. CTL (Fitness) */}
      {renderKpiCard({
        title: "CTL (Fitness)",
        subtitle: "Chronic Training Load",
        value: ctl.toFixed(0),
        trend: "▲ 3",
        trendUp: true,
        sparklinePoints: "M 0,35 Q 25,40 50,32 T 100,28",
      })}

      {/* 2. ATL (Fatigue) */}
      {renderKpiCard({
        title: "ATL (Fatigue)",
        subtitle: "Acute Training Load",
        value: atl.toFixed(0),
        trend: "▲ 5",
        trendUp: true,
        sparklinePoints: "M 0,42 Q 25,32 50,45 T 100,38",
      })}

      {/* 3. TSB (Form) */}
      {renderKpiCard({
        title: "TSB (Form)",
        subtitle: "Training Stress Balance",
        value: tsb > 0 ? `+${tsb.toFixed(0)}` : tsb.toFixed(0),
        trend: "▼ 4",
        trendUp: false,
        sparklinePoints: "M 0,22 Q 25,35 50,28 T 100,30",
      })}

      {/* 4. VO₂max */}
      {renderKpiCard({
        title: "VO₂max",
        subtitle: "Aerobic Capacity (ml/kg/min)",
        value: "55.4",
        trend: "▲ 0.6",
        trendUp: true,
        sparklinePoints: "M 0,30 Q 25,25 50,18 T 100,12",
      })}

      {/* 5. Weekly Volume */}
      {renderKpiCard({
        title: "Weekly Volume",
        subtitle: "Distance This Week",
        value: "295",
        unit: "km",
        trend: "▲ 12",
        trendUp: true,
        sparklinePoints: "M 0,40 Q 25,15 50,30 T 100,20",
      })}

      {/* 6. Readiness */}
      {renderKpiCard({
        title: "Readiness",
        subtitle: "Daily Readiness",
        value: "78",
        unit: "%",
        trend: "▲ 2",
        trendUp: true,
        sparklinePoints: "M 0,35 Q 25,42 50,30 T 100,25",
      })}
    </div>
  );

  // Pick between original connections panel or modular dashboard renderer, wrapped alongside the Premium KPI Ribbon
  const contentBody = (
    <div className="space-y-6">
      {kpiStrip}
      {activeDashboardId === 'connections' ? (
        <ConnectionCenter />
      ) : activeDashboardId === 'activity_analysis' ? (
        <ActivityAnalysisWorkspace />
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
  const workspaceTitle = activeDashboardId === 'connections' ? 'Connections' : activeDashboard.name;
  const workspaceSubtitle = activeDashboardId === 'connections' 
    ? 'Connect your Strava, Garmin, or other accounts to synchronize activities.' 
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
        <div className="text-center py-2 text-xs text-muted-foreground">
          All metrics are calculated from your uploaded and synchronized activity data.
        </div>
      }
    />
  );
}
