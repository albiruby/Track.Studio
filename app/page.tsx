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
  Eye
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
    dashboardState
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

  // Layout Selector Dropdown Toolbar
  const layoutSelectorToolbar = (
    <div className="flex items-center gap-1.5 border border-border bg-card rounded-md p-1" id="layout-preview-selector-harness">
      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 text-muted-foreground hidden lg:inline">Layout previewer:</span>
      <select
        value={activeLayoutView}
        onChange={(e) => setActiveLayoutView(e.target.value as any)}
        className="text-[10px] font-semibold uppercase bg-secondary/60 hover:bg-secondary border-0 outline-none rounded py-1 px-2.5 cursor-pointer max-w-[150px] truncate"
        id="layout-template-select"
      >
        <option value="standard">Standard Shell</option>
        <option value="auth">Auth Layout</option>
        <option value="fullscreen">Fullscreen Layout</option>
        <option value="error">Error Diagnostics (500)</option>
        <option value="maintenance">Maintenance mode</option>
        <option value="offline">Offline simulator</option>
        <option value="empty">Onboarding Empty</option>
        <option value="print">Print Grayscale PDF</option>
      </select>
    </div>
  );

  // ConnectionCenter view body (original Standard Shell design)
  const connectionCenterBody = (
    <div className="space-y-6">
      {/* High-density bento stats at the top of the standard view to make it look professional */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 select-none" id="high-density-bento-indicators">
        
        {/* VO2 Max */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">VO2 Max Capacity</span>
            <Activity className="h-4 w-4 text-status-success" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold tracking-tight">{activeAthlete.vo2max}</span>
            <span className="text-[10px] text-muted-foreground ml-1">ml/kg/min</span>
          </div>
          <div className="text-[9px] text-muted-foreground font-mono mt-1.5">
            Performance level: <span className="text-status-success font-bold uppercase">Elite</span>
          </div>
        </div>

        {/* Anaerobic Power */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Functional FTP</span>
            <Zap className="h-4 w-4 text-status-warning" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold tracking-tight">{activeAthlete.ftpWatts}</span>
            <span className="text-[10px] text-muted-foreground ml-1">Watts</span>
          </div>
          <div className="text-[9px] text-muted-foreground font-mono mt-1.5">
            Watts/kg ratio: <span className="text-status-warning font-bold">{(activeAthlete.ftpWatts / activeAthlete.weightKg).toFixed(2)} W/kg</span>
          </div>
        </div>

        {/* Heart Rate zones */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Resting HR Zones</span>
            <Heart className="h-4 w-4 text-status-danger" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold tracking-tight">{activeAthlete.restingHr} / {activeAthlete.maxHr}</span>
            <span className="text-[10px] text-muted-foreground ml-1">BPM</span>
          </div>
          <div className="text-[9px] text-muted-foreground font-mono mt-1.5">
            Heart rate reserve: <span className="text-status-danger font-bold">{activeAthlete.maxHr - activeAthlete.restingHr} BPM</span>
          </div>
        </div>

        {/* Physical Weight */}
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">Body Dimensions</span>
            <Compass className="h-4 w-4 text-status-info" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold tracking-tight">{activeAthlete.weightKg}</span>
            <span className="text-[10px] text-muted-foreground ml-1">kg</span>
          </div>
          <div className="text-[9px] text-muted-foreground font-mono mt-1.5">
            Athlete gender: <span className="text-status-info font-bold">{activeAthlete.gender}</span>
          </div>
        </div>

      </div>

      {/* Main ConnectionCenter integration */}
      <ConnectionCenter />
    </div>
  );

  // Pick between original connections panel or modular dashboard renderer
  const contentBody = activeDashboardId === 'connections' ? connectionCenterBody : <DashboardPageRenderer />;

  // Side Panel Widget showing quick stats logs
  const sidebarInspectorWidget = (
    <div className="space-y-4 text-xs leading-normal select-none" id="workspace-sidebar-inspect-widget">
      <div className="p-3.5 rounded-lg border border-border bg-muted/40 font-mono text-[10px] space-y-1.5">
        <span className="font-bold text-foreground block uppercase">Telemetry Status:</span>
        <div>• Active Client Port: <b>3000</b></div>
        <div>• Ingestion Handshake: <b>Google Firebase</b></div>
        <div>• Persistence Store: <b>Cloud Firestore</b></div>
        <div>• Active Workspace: <b className="text-foreground uppercase">{activeDashboardId}</b></div>
        <div>• Render Mode: <b className="text-foreground uppercase">{dashboardState}</b></div>
      </div>
      
      <p className="text-muted-foreground font-medium">
        The analytics query engine compiles synchronized activities directly on user actions. Use the dashboard selectors to filter streams down to fine grain tempos.
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
      toolbar={layoutSelectorToolbar}
      contentSlot={contentBody}
      sidePanelSlot={sidebarInspectorWidget}
      footerSlot={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono uppercase text-muted-foreground">
          <span>Database handshakes: <b className="text-foreground">Connected</b></span>
          <span>Authentication sessions: <b className="text-foreground">Authentic</b></span>
        </div>
      }
    />
  );
}
