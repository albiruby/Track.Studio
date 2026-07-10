'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

export interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical' | 'system' | 'sync';
  read: boolean;
  timestamp: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  weightKg: number;
  restingHr: number;
  maxHr: number;
  ftpWatts: number;
  vo2max: number;
  avatarUrl: string;
}

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface WorkspaceContextType {
  // Sidebar State
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isPinned: boolean;
  setPinned: (pinned: boolean) => void;
  favorites: string[];
  toggleFavorite: (routeId: string) => void;
  recentPages: { routeId: string; title: string; timestamp: string }[];
  addRecentPage: (routeId: string, title: string) => void;

  // View Settings
  isCompactMode: boolean;
  setCompactMode: (compact: boolean) => void;

  // Athlete State
  activeAthlete: AthleteProfile;
  athletesList: AthleteProfile[];
  setActiveAthleteById: (id: string) => void;

  // Sync State
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  syncProgress: number;
  triggerSync: () => void;

  // Notifications
  notifications: WorkspaceNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<WorkspaceNotification, 'id' | 'read' | 'timestamp'>) => void;

  // Command Palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (msg: string) => void;
  loadingProgress: number;
  setLoadingProgress: (prog: number) => void;

  // Side Panel
  isSidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
  sidePanelContent: React.ReactNode | null;
  setSidePanelContent: (content: React.ReactNode | null) => void;

  // Filters Panel
  isFiltersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
}

const defaultAthletes: AthleteProfile[] = [
  {
    id: 'athlete_john',
    name: 'John Runner',
    email: 'john.runner@track.studio',
    gender: 'M',
    weightKg: 70,
    restingHr: 48,
    maxHr: 188,
    ftpWatts: 260,
    vo2max: 55.4,
    avatarUrl: 'https://picsum.photos/seed/john/150/150',
  },
  {
    id: 'athlete_sarah',
    name: 'Sarah Pace',
    email: 'sarah.pace@track.studio',
    gender: 'F',
    weightKg: 58,
    restingHr: 42,
    maxHr: 192,
    ftpWatts: 245,
    vo2max: 61.2,
    avatarUrl: 'https://picsum.photos/seed/sarah/150/150',
  },
  {
    id: 'athlete_marcus',
    name: 'Marcus Speed',
    email: 'marcus.speed@track.studio',
    gender: 'M',
    weightKg: 78,
    restingHr: 52,
    maxHr: 180,
    ftpWatts: 310,
    vo2max: 58.0,
    avatarUrl: 'https://picsum.photos/seed/marcus/150/150',
  }
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  // Sidebar settings
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isPinned, setPinned] = useState(true);
  const [favorites, setFavorites] = useState<string[]>(['dashboard', 'performance']);
  const [recentPages, setRecentPages] = useState<{ routeId: string; title: string; timestamp: string }[]>([
    { routeId: 'dashboard', title: 'Dashboard', timestamp: 'Just now' },
    { routeId: 'performance', title: 'Performance Overview', timestamp: '10 mins ago' },
    { routeId: 'equipment', title: 'Equipment Metrics', timestamp: '1 hour ago' },
  ]);

  // Compact mode for professional high-density dashboards
  const [isCompactMode, setCompactMode] = useState(false);

  // Athlete state
  const [activeAthlete, setActiveAthlete] = useState<AthleteProfile>(defaultAthletes[0]);

  // Sync state machine
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);

  // Command palette
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global loading
  const [isLoading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Calibrating Ingestion Engine...');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Side Panel state
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<React.ReactNode | null>(null);

  // Filters state
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  // --- LOCALSTORAGE PERSISTENCE HYDRATION ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const collapsed = localStorage.getItem('track_studio_sidebar_collapsed');
      if (collapsed !== null) setSidebarCollapsed(JSON.parse(collapsed));

      const compact = localStorage.getItem('track_studio_compact_mode');
      if (compact !== null) setCompactMode(JSON.parse(compact));

      const favs = localStorage.getItem('track_studio_favorites');
      if (favs !== null) setFavorites(JSON.parse(favs));

      const recents = localStorage.getItem('track_studio_recent_pages');
      if (recents !== null) setRecentPages(JSON.parse(recents));

      const athlete = localStorage.getItem('track_studio_active_athlete');
      if (athlete !== null) {
        const parsed = JSON.parse(athlete);
        const match = defaultAthletes.find(a => a.id === parsed.id);
        if (match) setActiveAthlete(match);
      }

      const isPanelOpen = localStorage.getItem('track_studio_side_panel_open');
      if (isPanelOpen !== null) setSidePanelOpen(JSON.parse(isPanelOpen));

      const isFilOpen = localStorage.getItem('track_studio_filters_open');
      if (isFilOpen !== null) setFiltersOpen(JSON.parse(isFilOpen));
    } catch (e) {
      console.error('Failed to load localStorage', e);
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_compact_mode', JSON.stringify(isCompactMode));
    }
  }, [isCompactMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_recent_pages', JSON.stringify(recentPages));
    }
  }, [recentPages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_active_athlete', JSON.stringify(activeAthlete));
    }
  }, [activeAthlete]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_side_panel_open', JSON.stringify(isSidePanelOpen));
    }
  }, [isSidePanelOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('track_studio_filters_open', JSON.stringify(isFiltersOpen));
    }
  }, [isFiltersOpen]);

  // Notifications store
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([
    {
      id: 'notif_1',
      title: 'High Fatigue Threshold Reached',
      message: 'CTL/ATL imbalance indicates acute fatigue (TSB -16.7). Recovery recommended.',
      type: 'warning',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
    {
      id: 'notif_2',
      title: 'Cardiac Drift Anomaly Detected',
      message: 'Cardiovascular drift of 4.8% flagged on Tempo Run. Aerobic coupling is normal.',
      type: 'critical',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'notif_3',
      title: 'Strava API Sync Complete',
      message: 'Successfully analyzed Morning Tempo Run (10.0km). Metrics populated.',
      type: 'sync',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    },
    {
      id: 'notif_4',
      title: 'Footwear Threshold Alert',
      message: 'Nike Pegasus 39 is approaching its 500km mechanical limit (Current: 450km).',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ]);

  const toggleFavorite = (routeId: string) => {
    setFavorites((prev) =>
      prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]
    );
    const added = !favorites.includes(routeId);
    toast({
      title: added ? 'Pinned to Favorites' : 'Removed from Favorites',
      description: `${routeId.charAt(0).toUpperCase() + routeId.slice(1)} added to workspace quick links.`,
    });
  };

  const addRecentPage = (routeId: string, title: string) => {
    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.routeId !== routeId);
      return [{ routeId, title, timestamp: 'Just now' }, ...filtered].slice(0, 4);
    });
  };

  const setActiveAthleteById = (id: string) => {
    const ath = defaultAthletes.find((a) => a.id === id);
    if (ath) {
      setActiveAthlete(ath);
      toast({
        title: 'Athlete Context Changed',
        description: `Now presenting performance models for ${ath.name}.`,
      });
    }
  };

  // Simulated background sync process
  const triggerSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    setSyncProgress(10);
    toast({
      title: 'Synchronizing Athletic Feeds',
      description: 'Querying external channels (Strava, Intervals.icu)...',
    });

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 400);

    setTimeout(() => {
      setSyncProgress(100);
      const isSuccessful = Math.random() > 0.15; // 85% success rate simulation

      if (isSuccessful) {
        setSyncStatus('success');
        addNotification({
          title: 'Direct Feed Synchronized',
          message: 'Zero-latency sync with Strava webhook completed. 1 new activity calibrated.',
          type: 'sync',
        });
        toast({
          title: 'Sync Complete',
          description: 'Direct ingestion channels updated. Performance curve recalculated.',
        });
      } else {
        setSyncStatus('failed');
        addNotification({
          title: 'Ingestion Protocol Timeout',
          message: 'Strava API gateway failed to respond within 5000ms. Ingestion rescheduled.',
          type: 'critical',
        });
        toast({
          title: 'Sync Interrupted',
          description: 'Strava API gateway timeout. Re-queueing sync attempt.',
        });
      }

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
      }, 3000);
    }, 2000);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({
      title: 'Feeds Cleared',
      description: 'All system notifications marked as read.',
    });
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: 'Inbox Purged',
      description: 'All workspace notifications permanently removed.',
    });
  };

  const addNotification = (n: Omit<WorkspaceNotification, 'id' | 'read' | 'timestamp'>) => {
    const newNotif: WorkspaceNotification = {
      ...n,
      id: `notif_${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut listener (Ctrl + / for collapse, Ctrl + K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar: Ctrl + /
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setSidebarCollapsed(!isSidebarCollapsed);
      }
      // Toggle palette: Ctrl + K
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarCollapsed, isCommandPaletteOpen]);

  return (
    <WorkspaceContext.Provider
      value={{
        isSidebarCollapsed,
        setSidebarCollapsed,
        isPinned,
        setPinned,
        favorites,
        toggleFavorite,
        recentPages,
        addRecentPage,
        isCompactMode,
        setCompactMode,
        activeAthlete,
        athletesList: defaultAthletes,
        setActiveAthleteById,
        syncStatus,
        syncProgress,
        triggerSync,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        addNotification,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        isLoading,
        setLoading,
        loadingMessage,
        setLoadingMessage,
        loadingProgress,
        setLoadingProgress,
        isSidePanelOpen,
        setSidePanelOpen,
        sidePanelContent,
        setSidePanelContent,
        isFiltersOpen,
        setFiltersOpen,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
