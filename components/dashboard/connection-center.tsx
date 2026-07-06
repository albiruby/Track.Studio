'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import { INTEGRATION_PROVIDERS, getProviderById } from '@/lib/data-platform/registry';
import { ConnectionRepository } from '@/lib/data-platform/repository';
import { Connection, IntegrationProvider, SyncAttempt } from '@/lib/data-platform/types';
import { providerServices } from '@/lib/data-platform/provider-implementations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { 
  Database, 
  Activity, 
  Trash2, 
  RefreshCw, 
  Lock, 
  Info,
  Clock,
  ShieldCheck,
  Zap,
  X,
  ServerCrash,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ConnectionCenter() {
  const { user, loading, isConfigured, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<IntegrationProvider | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [detailConnection, setDetailConnection] = useState<Connection | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncAttempt[]>([]);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  // Form Inputs for API Key connection
  const [athleteIdInput, setAthleteIdInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Load user connections on mount/user change
  const loadConnections = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConnections(true);
      const conns = await ConnectionRepository.getConnections(user.uid);
      setConnections(conns);
    } catch (e: any) {
      toast({
        title: 'Registry Error',
        description: e.message || 'Failed to read synchronized integrations registry.',
        type: 'error'
      });
    } finally {
      setLoadingConnections(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadConnections();
    } else {
      setConnections([]);
    }
  }, [user, loadConnections]);

  // Handle redirect feedback from OAuth (Strava, etc.)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const success = params.get('success');
      const error = params.get('error');

      if (success === 'strava_connected') {
        toast({
          title: 'Strava Connected',
          description: 'OAuth2 verification handshake succeeded. Activity feed is now paired.',
          type: 'success',
        });
        // Clear search parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        if (user) {
          loadConnections();
        }
      } else if (error) {
        toast({
          title: 'Authorization Failed',
          description: decodeURIComponent(error),
          type: 'error',
        });
        // Clear search parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, loadConnections, toast]);

  // Load sync logs when inspecting connection details
  useEffect(() => {
    const fetchLogs = async () => {
      if (detailConnection) {
        const logs = await ConnectionRepository.getSyncHistory(detailConnection.userId, detailConnection.providerId);
        setSyncLogs(logs);
      } else {
        setSyncLogs([]);
      }
    };
    fetchLogs();
  }, [detailConnection]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4" id="loading-spinner-container">
        <Spinner size="md" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Initialising Secure Token Registries...</span>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <Card className="max-w-md mx-auto text-center py-12 border-dashed border-status-warning/40 bg-status-warning/5" id="unconfigured-auth-card">
        <CardContent className="space-y-4">
          <ServerCrash className="h-10 w-10 text-status-warning mx-auto animate-pulse" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-foreground uppercase">Integration Setup Pending</h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              Firebase Authentication and Firestore database services are not yet configured for this instance.
            </p>
          </div>
          <div className="p-4 rounded border border-border bg-card text-left space-y-2 text-[11px] font-mono leading-normal">
            <span className="font-bold text-foreground uppercase">Required Actions:</span>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>Open settings / click <b className="text-foreground">Set up Firebase</b> in the developer workspace tools</li>
              <li>Provide valid Firebase Environment Variables in your local configuration</li>
              <li>Deploy security rules and database collections</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto border border-border/60 bg-card p-6 shadow-sm select-none" id="unauthenticated-card">
        <div className="text-center py-6 space-y-4">
          <div className="h-12 w-12 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-lg mx-auto">
            <Activity className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold tracking-tight text-foreground uppercase animate-fade-in">Athlete Portal Access</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Authorize securely with Google OAuth to manage and pair running performance data channels.
            </p>
          </div>
          
          <Button 
            variant="default" 
            className="w-full h-10 font-bold bg-foreground text-background hover:bg-foreground/90 uppercase text-xs tracking-wider cursor-pointer"
            onClick={loginWithGoogle}
            id="login-google-btn"
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>
        </div>
      </Card>
    );
  }

  // Find connection state for any provider
  const getProviderConnection = (providerId: string) => {
    return connections.find(c => c.providerId === providerId);
  };

  // Disconnect Flow
  const handleDisconnect = async (providerId: string) => {
    try {
      await ConnectionRepository.deleteConnection(user.uid, providerId);
      
      const provider = getProviderById(providerId);
      toast({
        title: 'Connection Terminated',
        description: `Successfully revoked credentials and disconnected from ${provider?.name || providerId}.`,
        type: 'success'
      });

      if (detailConnection && detailConnection.providerId === providerId) {
        setDetailConnection(null);
      }

      await loadConnections();
    } catch (e: any) {
      toast({
        title: 'Disconnection Failed',
        description: e.message || 'Could not remove connection. Please try again.',
        type: 'error'
      });
    }
  };

  // Open appropriate connection dialog
  const handleOpenConnect = (provider: IntegrationProvider) => {
    if (provider.status === 'beta' || provider.status === 'maintenance') {
      toast({
        title: 'Channel Unavailable',
        description: `${provider.name} ingestion channel is currently undergoing development calibration.`,
        type: 'warning'
      });
      return;
    }

    setSelectedProvider(provider);
    setAthleteIdInput('');
    setApiKeyInput('');
    setShowConnectModal(true);
  };

  // Submit Connection
  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    try {
      let connection: Connection;
      const service = providerServices[selectedProvider.id];

      if (selectedProvider.id === 'strava') {
        // Redirection should have occurred. If this gets called somehow, trigger direct OAuth authorization:
        window.location.href = `/api/integrations/strava/authorize?userId=${user.uid}`;
        return;
      } else if (selectedProvider.id === 'intervals-icu') {
        if (!athleteIdInput || !apiKeyInput) {
          toast({
            title: 'Fields Required',
            description: 'Please enter your intervals.icu Athlete ID and personal API Key.',
            type: 'warning'
          });
          return;
        }
        connection = await service.connect(user.uid, {
          athleteId: athleteIdInput,
          apiKey: apiKeyInput,
        });
      } else {
        throw new Error(`${selectedProvider.name} is in beta and cannot be paired at this time.`);
      }

      await ConnectionRepository.saveConnection(connection);
      
      toast({
        title: 'Integration Established',
        description: `Successfully authorized with ${selectedProvider.name}. Synchronization engine initialized.`,
        type: 'success'
      });

      setShowConnectModal(false);
      setSelectedProvider(null);
      await loadConnections();
    } catch (err: any) {
      toast({
        title: 'Authentication Rejected',
        description: err.message || 'Verification of external credentials failed.',
        type: 'error'
      });
    }
  };

  // Validate / Health Check Flow
  const handleValidateConnection = async (connection: Connection) => {
    const provider = getProviderById(connection.providerId);
    setValidatingId(connection.id);
    
    try {
      const service = providerServices[connection.providerId];
      if (!service) {
        throw new Error('Associated Integration service not found.');
      }

      const healthStatus = await service.validateConnection(connection);

      const updatedConn: Connection = {
        ...connection,
        status: healthStatus.status,
        health: healthStatus.health,
        healthMessage: healthStatus.message,
        updatedAt: new Date().toISOString()
      };

      await ConnectionRepository.saveConnection(updatedConn);
      
      toast({
        title: `${provider?.name} Health Status`,
        description: healthStatus.message || 'Handshake check passed.',
        type: healthStatus.health === 'healthy' ? 'success' : 'warning'
      });

      if (detailConnection && detailConnection.id === connection.id) {
        setDetailConnection(updatedConn);
      }

      await loadConnections();
    } catch (e: any) {
      toast({
        title: 'Validation Failed',
        description: e.message || 'Unable to communicate with external API endpoints.',
        type: 'error'
      });
    } finally {
      setValidatingId(null);
    }
  };

  // Manual Trigger Sync (Ingestion pipeline is deferred to Phase 4B)
  const handleTriggerSync = async (connection: Connection) => {
    toast({
      title: 'Ingestion Pipeline Deferred',
      description: `Activity ingestion and mathematical analysis is deferred to Phase 4B. Your paired ${getProviderById(connection.providerId)?.name || 'data'} connection is validated and active.`,
      type: 'info'
    });
  };

  return (
    <div className="space-y-6" id="connection-center-container">
      
      {/* Visual Metadata Alert Banner */}
      <Card className="border-border/60 bg-secondary/25" id="integration-policy-banner">
        <CardContent className="p-4 flex items-start gap-3 text-xs leading-normal">
          <Info className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-muted-foreground">
            <span className="font-bold text-foreground">Infrastructure Invariant:</span> Under Phase 4 guidelines, this portal manages connection handshake tokens, authorization scope logs, and synchronization attempts. No workout files are committed to your historical physiological charts yet.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Providers Grid Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold tracking-tight uppercase">External Ingestion Channels</h3>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-wide">Select channels to pair performance feeds</p>
            </div>
            {loadingConnections && <Spinner size="sm" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INTEGRATION_PROVIDERS.map((provider) => {
              const conn = getProviderConnection(provider.id);
              const isConnected = !!conn;

              return (
                <Card 
                  key={provider.id} 
                  className={`hover:border-foreground/20 transition-all overflow-hidden flex flex-col justify-between ${
                    isConnected ? 'border-border/80 ring-1 ring-border/5' : 'border-border/40 opacity-90'
                  }`}
                  id={`channel-card-${provider.id}`}
                >
                  <CardHeader className="p-5 pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold tracking-tight shrink-0">
                          {provider.id === 'strava' ? 'S' : provider.id === 'intervals-icu' ? 'I' : provider.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold leading-none">{provider.name}</h4>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest leading-none mt-1 inline-block">
                            {provider.authType}
                          </span>
                        </div>
                      </div>

                      {/* Connection status tag */}
                      {isConnected ? (
                        <Badge 
                          variant={
                            conn.status === 'connected' ? 'success' :
                            conn.status === 'syncing' ? 'info' :
                            conn.status === 'expired' ? 'warning' :
                            conn.status === 'error' ? 'destructive' :
                            'outline'
                          }
                          className="font-mono text-[9px] h-4.5"
                        >
                          {conn.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-mono text-[9px] h-4.5 bg-muted/40 text-muted-foreground border-border/60">
                          disconnected
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed h-8">
                      {provider.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-4 border-t border-border/40 mt-3.5 bg-card/20 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Version: <b>{provider.version}</b></span>
                    
                    {isConnected ? (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="h-7 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                        onClick={() => setDetailConnection(conn)}
                        id={`inspect-btn-${provider.id}`}
                      >
                        Inspect Feed
                      </Button>
                    ) : (
                      provider.status === 'maintenance' || provider.status === 'beta' ? (
                        <Badge variant="outline" className="text-[9px] border-border bg-muted/40 text-muted-foreground/60 h-7 rounded px-2.5">
                          {provider.status === 'maintenance' ? 'Maintenance' : 'Coming Soon'}
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                          onClick={() => handleOpenConnect(provider)}
                          id={`connect-btn-${provider.id}`}
                        >
                          Pair Feed
                        </Button>
                      )
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Details / Control Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-bold tracking-tight uppercase">Calibration Console</h3>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-wide">Inspect channel health & sync logs</p>
          </div>

          <AnimatePresence mode="wait">
            {detailConnection ? (
              <motion.div
                key={detailConnection.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
                id="feed-detail-panel"
              >
                <Card className="border-foreground/10 bg-card">
                  <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Active Connection</span>
                      <h4 className="text-sm font-bold text-foreground mt-0.5">
                        {getProviderById(detailConnection.providerId)?.name} Feed
                      </h4>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDetailConnection(null)} 
                      className="h-7 w-7 rounded-full text-muted-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-5">
                    {/* Connection details block */}
                    <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Authorized Athlete:</span>
                        <span className="font-bold text-foreground truncate max-w-[150px]">{detailConnection.accountName}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground">External User ID:</span>
                        <span className="font-bold text-foreground">{detailConnection.externalUserId}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground">Authorized At:</span>
                        <span className="text-foreground">{new Date(detailConnection.connectedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-muted-foreground">Scopes:</span>
                        <span className="text-foreground max-w-[140px] truncate" title={detailConnection.scopes.join(', ')}>
                          {detailConnection.scopes.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Connection Health status */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Sync Health Indicators</span>
                      <div className="p-3.5 rounded-lg border border-border flex items-start gap-2.5 text-xs bg-card">
                        {detailConnection.health === 'healthy' ? (
                          <ShieldCheck className="h-4.5 w-4.5 text-status-success shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4.5 w-4.5 text-status-warning shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold uppercase text-[10px]">
                              Health: {detailConnection.health}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                            {detailConnection.healthMessage || 'Operational thresholds secure.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Console Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                        onClick={() => handleValidateConnection(detailConnection)}
                        disabled={validatingId === detailConnection.id}
                        id="validate-action-btn"
                      >
                        {validatingId === detailConnection.id ? (
                          <>
                            <Spinner size="sm" className="mr-1" />
                            Checking
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Validate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-[10px] bg-foreground text-background hover:bg-foreground/90 uppercase font-bold tracking-wider cursor-pointer"
                        onClick={() => handleTriggerSync(detailConnection)}
                        id="sync-action-btn"
                      >
                        <Zap className="h-3 w-3 mr-1 text-background fill-background" />
                        Sync Now
                      </Button>
                    </div>

                    {/* Synchronize log history */}
                    <div className="space-y-2 pt-2 border-t border-border">
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Ingestion History Logs</span>
                      {syncLogs.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground text-[11px] border border-dashed rounded bg-muted/10 font-mono">
                          No sync cycles recorded yet
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" id="sync-logs-list">
                          {syncLogs.map((log) => (
                            <div key={log.id} className="p-2.5 rounded border border-border bg-muted/10 flex items-center justify-between text-[10px] font-mono leading-none">
                              <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'success' ? 'bg-status-success' : 'bg-status-danger'}`} />
                                <span className="text-muted-foreground truncate max-w-[120px]">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <span className="font-bold">
                                {log.status === 'success' ? `+${log.recordsSynced} records` : 'Throttled'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Danger Zone: Disconnect Button */}
                    <div className="border-t border-border pt-3.5">
                      <Button
                        variant="destructive"
                        className="w-full h-8 text-[10px] uppercase tracking-wider font-bold cursor-pointer"
                        onClick={() => handleDisconnect(detailConnection.providerId)}
                        id="disconnect-action-btn"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Revoke Access & Disconnect
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Card className="border-dashed border-border py-12 text-center flex flex-col items-center justify-center bg-card/10 h-64">
                  <Activity className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <h4 className="text-xs font-bold text-foreground">Select Ingestion Feed</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px] mx-auto leading-normal">
                    Select any active paired connection channel to run calibrations, monitor API health logs, or trigger manual sync tests.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PAIR FEED CONNECTION OVERLAY / MODAL (Supports OAuth & API Key Inputs) */}
      <AnimatePresence>
        {showConnectModal && selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="connect-overlay">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowConnectModal(false);
                setSelectedProvider(null);
              }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl z-10"
              id="connect-modal"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedProvider.id === 'strava' ? 'S' : selectedProvider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider">Configure Ingestion Channel</h3>
                    <p className="text-[9px] text-muted-foreground font-mono uppercase mt-0.5">{selectedProvider.name} Integration</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    setShowConnectModal(false);
                    setSelectedProvider(null);
                  }}
                  className="h-7 w-7 text-muted-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Integration Specs Checklist */}
              <div className="bg-secondary/35 p-3.5 rounded-lg text-xs space-y-2 mb-5">
                <div className="flex gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-foreground shrink-0" />
                  <span>Authentication Protocol: <b className="text-foreground">{selectedProvider.authType}</b></span>
                </div>
                <div className="flex gap-2 text-muted-foreground leading-normal">
                  <Zap className="h-4 w-4 text-foreground shrink-0" />
                  <div>
                    <span>Ingests:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedProvider.supportedData.map((d, i) => (
                        <Badge key={i} variant="secondary" className="text-[8px] font-mono px-1.5 py-0">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <form onSubmit={handleConnectSubmit} className="space-y-4">
                {selectedProvider.id === 'strava' ? (
                  /* Strava Genuine OAuth Authorization */
                  <div className="space-y-3.5">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Connecting to Strava will securely redirect you to the Strava OAuth2 authorize screen to pair your feed.
                    </p>
                    <div className="p-3 bg-secondary/20 rounded border border-border text-[10px] font-mono leading-normal text-muted-foreground">
                      <span className="font-bold text-foreground block uppercase mb-1">Requested Permissions:</span>
                      • activity:read_all (access run details)<br />
                      • profile:read (access basic athlete profile)
                    </div>
                  </div>
                ) : selectedProvider.id === 'intervals-icu' ? (
                  /* Intervals.icu API Key credentials inputs */
                  <div className="space-y-3.5">
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Requires your personal Athlete ID and personal API Key. Your keys are redacted and saved directly in secure workspace persistence.
                    </p>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Intervals.icu Athlete ID
                      </label>
                      <input
                        type="text"
                        value={athleteIdInput}
                        onChange={(e) => setAthleteIdInput(e.target.value)}
                        className="w-full text-xs font-mono bg-muted/40 border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. i55981"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Personal API Key
                      </label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="w-full text-xs font-mono bg-muted/40 border border-border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                        placeholder="e.g. xxxxxxxx_xxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                ) : null}

                {/* Submit button block */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    onClick={() => {
                      setShowConnectModal(false);
                      setSelectedProvider(null);
                    }}
                  >
                    Cancel
                  </Button>
                  {selectedProvider.id === 'strava' ? (
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8 bg-foreground text-background hover:bg-foreground/90 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                      onClick={() => {
                        window.location.href = `/api/integrations/strava/authorize?userId=${user.uid}`;
                      }}
                    >
                      Redirect to Strava
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      className="h-8 bg-foreground text-background hover:bg-foreground/90 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                    >
                      Verify & Connect
                    </Button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
