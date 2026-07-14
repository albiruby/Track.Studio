'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getFirebaseFirestore } from '@/lib/firebase/config';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getProviderById } from '@/lib/data-platform/registry';
import { SyncJob, IngestionErrorRecord, AuditLogRecord } from '@/lib/data-platform/ingestion/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertOctagon, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Database,
  Info,
  ChevronDown,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SyncProgressPanelProps {
  userId: string;
  providerId: string;
  onClose?: () => void;
}

const STAGE_NAMES = [
  'Authenticating',
  'Checking Permissions',
  'Fetching Activities',
  'Fetching Streams',
  'Fetching Laps',
  'Fetching Equipment',
  'Fetching Routes',
  'Normalizing',
  'Validating',
  'Saving',
  'Rebuilding Analytics',
  'Completed'
];

export function SyncProgressPanel({ userId, providerId, onClose }: SyncProgressPanelProps) {
  const { toast } = useToast();
  const [activeJob, setActiveJob] = useState<SyncJob | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<AuditLogRecord[]>([]);
  const [errorLogs, setErrorLogs] = useState<IngestionErrorRecord[]>([]);
  const [tab, setTab] = useState<'current' | 'history' | 'errors'>('current');
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Periodically refresh timer for elapsed calculation
  useEffect(() => {
    if (activeJob?.status === 'running') {
      const timer = setInterval(() => {
        setNowTime(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeJob?.status]);

  // Derive progress estimations
  const getProgressEstimation = () => {
    if (!activeJob || activeJob.status !== 'running' || !activeJob.startedAt) return null;
    const started = new Date(activeJob.startedAt).getTime();
    const elapsedSeconds = Math.max((nowTime - started) / 1000, 1);
    
    // Estimate speed based on itemsProcessed
    const items = activeJob.itemsProcessed || 0;
    const speed = items / elapsedSeconds; // items per second

    // Estimate remaining time based on current progress percentage
    const progress = activeJob.progress || 1;
    const totalEstSeconds = (elapsedSeconds / progress) * 100;
    const remainingSeconds = Math.max(totalEstSeconds - elapsedSeconds, 0);

    return {
      speed: speed.toFixed(1),
      remaining: remainingSeconds.toFixed(0),
    };
  };

  const ests = getProgressEstimation();

  // Trigger Sync Job
  const triggerSync = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, providerId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start sync job.');
      }

      toast({
        title: 'Sync Pipeline Initialised',
        description: 'Universal synchronization queue is running in the background.',
        type: 'success',
      });

      // Subscribe to updates for this job
      subscribeToJob(data.job.id);
    } catch (e: any) {
      toast({
        title: 'Pipeline Error',
        description: e.message || 'Failed to trigger synchronization.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel Sync Job
  const cancelSync = async () => {
    if (!activeJob) return;
    try {
      setCancelling(true);
      const res = await fetch('/api/integrations/sync', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, jobId: activeJob.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request cancellation.');
      }

      toast({
        title: 'Cancellation Requested',
        description: 'The ingestion engine will halt on the next request window.',
        type: 'warning',
      });
    } catch (e: any) {
      toast({
        title: 'Cancellation Failed',
        description: e.message || 'Unable to request cancellation.',
        type: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Subscribe to real-time updates for a Job ID in Firestore
  const subscribeToJob = useCallback((jobId: string) => {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const docRef = doc(firestore, 'users', userId, 'syncJobs', jobId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setActiveJob(docSnap.data() as SyncJob);
      }
    });

    return unsubscribe;
  }, [userId]);

  // Fetch past sync records for history tab
  const fetchLogs = useCallback(async () => {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    try {
      const auditCol = collection(firestore, 'users', userId, 'auditLogs');
      const errCol = collection(firestore, 'users', userId, 'ingestionErrors');

      const auditSnap = await getDocs(query(auditCol, orderBy('timestamp', 'desc'), limit(10)));
      const errSnap = await getDocs(query(errCol, orderBy('timestamp', 'desc'), limit(10)));

      const auds: AuditLogRecord[] = [];
      auditSnap.forEach(d => {
        const item = d.data() as AuditLogRecord;
        if (item.providerId === providerId) auds.push(item);
      });
      setHistoryLogs(auds);

      const errs: IngestionErrorRecord[] = [];
      errSnap.forEach(d => {
        const item = d.data() as IngestionErrorRecord;
        if (item.providerId === providerId) errs.push(item);
      });
      setErrorLogs(errs);
    } catch (e) {
      console.error('Failed to load history logs:', e);
    }
  }, [userId, providerId]);

  useEffect(() => {
    fetchLogs();
  }, [activeJob, fetchLogs]);

  // Handle active job auto-selection from previous run on mount
  useEffect(() => {
    const fetchLatestJob = async () => {
      const firestore = getFirebaseFirestore();
      if (!firestore) return;

      try {
        const colRef = collection(firestore, 'users', userId, 'syncJobs');
        const snap = await getDocs(query(colRef, orderBy('startedAt', 'desc'), limit(1)));
        if (!snap.empty) {
          const latest = snap.docs[0].data() as SyncJob;
          if (latest.providerId === providerId) {
            // If it was running within the last hour, monitor it
            const startMs = new Date(latest.startedAt).getTime();
            const ageHr = (Date.now() - startMs) / (1000 * 60 * 60);
            
            if (latest.status === 'running' || latest.status === 'waiting' || latest.status === 'queued' || ageHr < 0.5) {
              setActiveJob(latest);
              subscribeToJob(latest.id);
            }
          }
        }
      } catch (e) {
        console.error('Error auto-recovering latest sync job:', e);
      }
    };

    fetchLatestJob();
  }, [userId, providerId, subscribeToJob]);

  // Color mapping helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-status-success border-status-success/30 bg-status-success/5';
      case 'completed_with_warnings': return 'text-status-warning border-status-warning/30 bg-status-warning/5';
      case 'running': return 'text-sky-500 border-sky-500/30 bg-sky-500/5 animate-pulse';
      case 'waiting': return 'text-amber-500 border-amber-500/30 bg-amber-500/5';
      case 'cancelled': return 'text-zinc-500 border-zinc-500/30 bg-zinc-500/5';
      case 'failed': return 'text-status-danger border-status-danger/30 bg-status-danger/5';
      case 'queued': return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5';
      default: return 'text-muted-foreground border-border bg-card';
    }
  };

  const isJobActive = (status?: string) => {
    return status === 'running' || status === 'queued' || status === 'waiting' || status === 'retrying';
  };

  return (
    <Card className="border-border bg-card flex flex-col h-full overflow-hidden" id="sync-console-panel">
      
      {/* Panel Header */}
      <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div>
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none">Ingestion Controller</span>
          <h4 className="text-xs font-bold uppercase text-foreground mt-0.5">
            {getProviderById(providerId)?.name || providerId} Handshake & Sync
          </h4>
        </div>
        <div className="flex gap-1.5 font-mono text-[9px]">
          <button 
            onClick={() => setTab('current')} 
            className={`px-2 py-1 rounded border transition-colors cursor-pointer uppercase ${
              tab === 'current' ? 'bg-foreground text-background font-bold border-foreground' : 'text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            Monitor
          </button>
          <button 
            onClick={() => { setTab('history'); fetchLogs(); }} 
            className={`px-2 py-1 rounded border transition-colors cursor-pointer uppercase ${
              tab === 'history' ? 'bg-foreground text-background font-bold border-foreground' : 'text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            Audits
          </button>
          <button 
            onClick={() => { setTab('errors'); fetchLogs(); }} 
            className={`px-2 py-1 rounded border transition-colors cursor-pointer uppercase ${
              tab === 'errors' ? 'bg-foreground text-background font-bold border-foreground' : 'text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            Errors
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
        
        {tab === 'current' && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* INGESTION STATE BLOCK */}
            {!activeJob ? (
              <div className="py-8 text-center border border-dashed border-border rounded-lg bg-muted/10 space-y-3.5">
                <Database className="h-7 w-7 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-foreground uppercase tracking-wider">No Active Pipeline Job</h5>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                    Start a manual synchronization cycle to securely pull, validate, and persist unmutated API responses.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  onClick={triggerSync} 
                  disabled={loading}
                  className="h-8 text-[10px] uppercase font-bold bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-1.5" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1.5 fill-background" />
                      Sync Feed Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Ingestion Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-muted-foreground">JOB: {activeJob.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase border px-1.5 py-0.5 rounded ${getStatusColor(activeJob.status)}`}>
                        {activeJob.status}
                      </span>
                      {activeJob.cancellationState === 'requested' && (
                        <Badge variant="warning" className="text-[8px] px-1 h-4 animate-pulse uppercase">
                          cancellation requested
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isJobActive(activeJob.status) ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={cancelSync}
                      disabled={cancelling}
                      className="h-7 text-[9px] uppercase font-bold cursor-pointer"
                    >
                      <Square className="h-2.5 w-2.5 mr-1 fill-destructive-foreground" />
                      Halt Sync
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerSync}
                      disabled={loading}
                      className="h-7 text-[9px] uppercase font-bold cursor-pointer"
                    >
                      <RefreshCw className="h-2.5 w-2.5 mr-1" />
                      Sync Again
                    </Button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono leading-none">
                    <span className="text-muted-foreground uppercase tracking-wider text-[8px] font-bold">Pipeline Ingestion Progress</span>
                    <span className="font-bold text-foreground">{activeJob.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 h-2 rounded overflow-hidden border border-border">
                    <motion.div 
                      className="bg-foreground h-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${activeJob.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {ests && (
                    <div className="flex justify-between text-[9px] font-mono text-muted-foreground pt-0.5 leading-none">
                      <span>Ingest Velocity: <b>{ests.speed} records/sec</b></span>
                      <span>Est. Remaining: <b>{ests.remaining}s</b></span>
                    </div>
                  )}
                </div>

                {/* 12-Stage Vertical Timeline */}
                <div className="space-y-2 border border-border rounded-lg bg-muted/25 p-3">
                  <div className="flex justify-between border-b border-border/50 pb-1.5 text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-none">
                    <span>Pipeline Progression Timeline</span>
                    <span>Current Ingest Page: <b>{activeJob.currentPage || 1}</b></span>
                  </div>

                  <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1 text-[11px] font-mono scrollbar-thin">
                    {STAGE_NAMES.map((stageName, idx) => {
                      const stageObj = activeJob.stages?.[stageName] || {
                        name: stageName,
                        status: 'pending',
                        elapsedTimeMs: 0,
                        processedRecords: 0,
                        warnings: [],
                        errors: []
                      };

                      const statusColors = {
                        pending: 'text-muted-foreground/30 border-muted-foreground/20 bg-muted/5',
                        running: 'text-sky-500 border-sky-500/40 bg-sky-500/5 animate-pulse',
                        completed: 'text-status-success border-status-success bg-status-success/5',
                        completed_with_warnings: 'text-status-warning border-status-warning bg-status-warning/5',
                        warning: 'text-status-warning border-status-warning bg-status-warning/5',
                        failed: 'text-status-danger border-status-danger bg-status-danger/5'
                      };

                      const dotColors = {
                        pending: 'bg-muted-foreground/20',
                        running: 'bg-sky-500 animate-pulse',
                        completed: 'bg-status-success',
                        completed_with_warnings: 'bg-status-warning',
                        warning: 'bg-status-warning',
                        failed: 'bg-status-danger'
                      };

                      return (
                        <div key={stageName} className="relative flex items-start gap-3 pl-1.5">
                          {/* Connector line */}
                          {idx < STAGE_NAMES.length - 1 && (
                            <div className="absolute left-3 top-4.5 bottom-0 w-0.5 bg-border/40" style={{ transform: 'translateX(-50%)' }} />
                          )}

                          {/* Dot indicator */}
                          <div className={`relative z-10 h-3 w-3 rounded-full border flex items-center justify-center shrink-0 mt-1 ${statusColors[stageObj.status] || statusColors.pending}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${dotColors[stageObj.status] || dotColors.pending}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`font-bold truncate ${stageObj.status === 'running' ? 'text-sky-500' : stageObj.status === 'completed' ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                                {idx + 1}. {stageName}
                              </span>
                              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground shrink-0 leading-none">
                                {stageObj.status === 'running' && (
                                  <span className="text-[8px] uppercase font-bold tracking-widest text-sky-500 animate-pulse">active</span>
                                )}
                                {stageObj.elapsedTimeMs > 0 && (
                                  <span>{(stageObj.elapsedTimeMs / 1000).toFixed(1)}s</span>
                                )}
                              </div>
                            </div>

                            {/* Show processed count or warning lists */}
                            {(stageObj.processedRecords > 0 || stageObj.warnings?.length > 0 || stageObj.errors?.length > 0) && (
                              <div className="mt-1 pl-2.5 border-l border-border/60 text-[9px] text-muted-foreground space-y-0.5 leading-normal">
                                {stageObj.processedRecords > 0 && (
                                  <div>Processed records: <span className="text-foreground font-bold">{stageObj.processedRecords}</span></div>
                                )}
                                {stageObj.warnings?.map((w, i) => (
                                  <div key={i} className="text-status-warning flex items-center gap-1">
                                    <span>⚠️ {w}</span>
                                  </div>
                                ))}
                                {stageObj.errors?.map((e, i) => (
                                  <div key={i} className="text-status-danger flex items-center gap-1 font-bold">
                                    <span>❌ {e}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {activeJob.lastError && (
                    <div className="mt-2 pt-2 border-t border-border/40 space-y-1 font-mono text-[10px]">
                      <span className="text-[9px] uppercase tracking-wider text-status-danger font-bold flex items-center gap-1">
                        <AlertOctagon className="h-3 w-3" />
                        Pipeline Exception
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-normal break-words max-h-16 overflow-y-auto">
                        {activeJob.lastError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Live Stats Bento */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="p-2.5 border border-border bg-card rounded flex flex-col justify-between">
                    <span className="text-muted-foreground uppercase text-[8px] tracking-wider block">Items Handshaked</span>
                    <span className="text-base font-bold text-foreground mt-1 block">{activeJob.itemsProcessed}</span>
                  </div>
                  <div className="p-2.5 border border-border bg-card rounded flex flex-col justify-between">
                    <span className="text-muted-foreground uppercase text-[8px] tracking-wider block">Stored Immutable</span>
                    <span className="text-base font-bold text-status-success mt-1 block">+{activeJob.itemsImported}</span>
                  </div>
                  <div className="p-2.5 border border-border bg-card rounded flex flex-col justify-between">
                    <span className="text-muted-foreground uppercase text-[8px] tracking-wider block">Deduplicated</span>
                    <span className="text-base font-bold text-indigo-400 mt-1 block">
                      {activeJob.itemsProcessed - activeJob.itemsImported - activeJob.itemsFailed > 0 
                        ? activeJob.itemsProcessed - activeJob.itemsImported - activeJob.itemsFailed 
                        : 0}
                    </span>
                  </div>
                  <div className="p-2.5 border border-border bg-card rounded flex flex-col justify-between">
                    <span className="text-muted-foreground uppercase text-[8px] tracking-wider block">Failed / Skipped</span>
                    <span className={`text-base font-bold mt-1 block ${activeJob.itemsFailed > 0 ? 'text-status-danger' : 'text-foreground'}`}>
                      {activeJob.itemsFailed}
                    </span>
                  </div>
                </div>

                {/* Timing stats */}
                {activeJob.completedAt && (
                  <div className="text-[10px] font-mono text-muted-foreground text-center">
                    Synchronization finished in <b>{((new Date(activeJob.completedAt).getTime() - new Date(activeJob.startedAt).getTime()) / 1000).toFixed(1)} seconds</b>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-2.5 animate-in fade-in-50 duration-200">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block">Audit Logs history</span>
            {historyLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-[10px] font-mono border border-dashed rounded">
                No past audit logs registered
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {historyLogs.map((log) => (
                  <div key={log.id} className="p-3 border border-border bg-card rounded-lg space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-start gap-1">
                      <div className="space-y-0.5">
                        <span className="font-bold text-foreground block">JOB: {log.syncJobId}</span>
                        <span className="text-muted-foreground text-[9px] block">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <Badge variant={log.completionState.includes('completed') ? 'success' : 'destructive'} className="text-[8px] uppercase">
                        {log.completionState}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 border-t border-border/40 pt-2 text-[9px] leading-tight">
                      <div>
                        <span className="text-muted-foreground block uppercase text-[7px]">Processed</span>
                        <span className="font-bold text-foreground block mt-0.5">{log.itemsDownloaded} items</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase text-[7px]">Stored</span>
                        <span className="font-bold text-status-success block mt-0.5">+{log.itemsStored} items</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block uppercase text-[7px]">Skipped</span>
                        <span className="font-bold text-zinc-400 block mt-0.5">{log.itemsSkipped} items</span>
                      </div>
                    </div>

                    {log.warnings.length > 0 && (
                      <div className="bg-status-warning/5 border border-status-warning/25 p-1.5 rounded text-[9px] text-status-warning flex items-start gap-1 leading-normal">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{log.warnings[0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'errors' && (
          <div className="space-y-2.5 animate-in fade-in-50 duration-200">
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block">Logged Ingestion Errors</span>
            {errorLogs.length === 0 ? (
              <div className="text-center py-8 text-status-success/40 text-[10px] font-mono border border-dashed rounded border-status-success/20 bg-status-success/5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-status-success" />
                Zero ingestion errors logged! Channel pristine.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {errorLogs.map((err) => (
                  <div key={err.id} className="p-3 border border-status-danger/25 bg-status-danger/5 rounded-lg space-y-2 font-mono text-[10px]">
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider px-1 py-0.5 rounded border border-border bg-muted leading-none">
                          {err.category}
                        </span>
                        <span className="text-muted-foreground text-[8px] block mt-1.5">
                          {new Date(err.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <Badge variant="destructive" className="text-[8px] uppercase">
                        {err.severity}
                      </Badge>
                    </div>

                    <div className="space-y-1 mt-1 leading-normal text-[10px]">
                      <span className="font-bold text-foreground">Message:</span>
                      <p className="text-muted-foreground">{err.message}</p>
                    </div>

                    <div className="pt-2 border-t border-border/40 text-[9px] leading-normal space-y-0.5 bg-muted/20 p-1.5 rounded">
                      <span className="font-bold text-foreground block">Suggested Resolution:</span>
                      <p className="text-muted-foreground">{err.suggestedResolution}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </CardContent>

    </Card>
  );
}
