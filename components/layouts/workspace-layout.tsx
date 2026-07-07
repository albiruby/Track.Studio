'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { useWorkspace, WorkspaceNotification, AthleteProfile } from '@/providers/workspace-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Flame, 
  TrendingUp, 
  Heart, 
  Zap, 
  Footprints, 
  Scale, 
  Battery, 
  CloudSun, 
  Compass, 
  GitCompare, 
  Search, 
  Database, 
  ShieldAlert, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  RefreshCw, 
  Bell, 
  User, 
  Plus, 
  X, 
  SlidersHorizontal, 
  Moon, 
  Sun, 
  LogOut, 
  CornerDownLeft, 
  Command, 
  Lock, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  FileDown,
  Sparkles,
  Check,
  CheckSquare
} from 'lucide-react';
import Image from 'next/image';

interface WorkspaceLayoutProps {
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  actions?: React.ReactNode;
  filtersSlot?: React.ReactNode;
  contentSlot: React.ReactNode;
  sidePanelSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  activeRouteId: string;
}

// Map route IDs to Lucide icons
export const ICON_REGISTRY: Record<string, any> = {
  dashboard: LayoutDashboard,
  activities: Flame,
  performance: TrendingUp,
  heart_rate: Heart,
  power: Zap,
  cadence: Footprints,
  training_load: Scale,
  recovery: Battery,
  environment: CloudSun,
  equipment: Compass,
  compare: GitCompare,
  search: Search,
  connections: Database,
  data_health: ShieldAlert,
  settings: Settings,
};

// Route structures and categories
export const NAVIGATION_STRUCTURE = [
  {
    category: 'Core Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '#dashboard' },
      { id: 'activities', label: 'Activities', path: '#activities' },
    ]
  },
  {
    category: 'Analytics Engine',
    items: [
      { id: 'performance', label: 'Performance', path: '#performance' },
      { id: 'training_load', label: 'Training Load', path: '#training_load' },
      { id: 'recovery', label: 'Recovery', path: '#recovery' },
      { id: 'compare', label: 'Compare', path: '#compare' },
      { id: 'search', label: 'Search', path: '#search' },
    ]
  },
  {
    category: 'Sensor Insights',
    items: [
      { id: 'heart_rate', label: 'Heart Rate', path: '#heart_rate' },
      { id: 'power', label: 'Power', path: '#power' },
      { id: 'cadence', label: 'Cadence', path: '#cadence' },
    ]
  },
  {
    category: 'Environment & Gear',
    items: [
      { id: 'environment', label: 'Environment', path: '#environment' },
      { id: 'equipment', label: 'Equipment', path: '#equipment' },
    ]
  },
  {
    category: 'System Administration',
    items: [
      { id: 'connections', label: 'Connections', path: '#connections' },
      { id: 'data_health', label: 'Data Health', path: '#data_health' },
      { id: 'settings', label: 'Settings', path: '#settings' },
    ]
  }
];

// Flatten all navigation items for search/reference
const ALL_NAV_ITEMS = NAVIGATION_STRUCTURE.flatMap(cat => 
  cat.items.map(item => ({ ...item, category: cat.category }))
);

export function WorkspaceLayout({
  title,
  subtitle,
  toolbar,
  actions,
  filtersSlot,
  contentSlot,
  sidePanelSlot,
  footerSlot,
  activeRouteId,
}: WorkspaceLayoutProps) {
  const { user, logout } = useAuth() as any;
  const { theme, setTheme } = useTheme();
  
  const {
    isSidebarCollapsed,
    setSidebarCollapsed,
    favorites,
    toggleFavorite,
    recentPages,
    addRecentPage,
    isCompactMode,
    setCompactMode,
    activeAthlete,
    athletesList,
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
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    isLoading,
    setLoading,
    loadingMessage,
    isSidePanelOpen,
    setSidePanelOpen,
    isFiltersOpen,
    setFiltersOpen,
    setLoadingProgress,
  } = useWorkspace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [athleteDropdownOpen, setAthleteDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Keyboard navigation inside sidebar
  const [focusedNavIndex, setFocusedNavIndex] = useState<number>(-1);
  const sidebarNavRef = useRef<HTMLDivElement>(null);

  // Record visits to recent pages
  useEffect(() => {
    const navItem = ALL_NAV_ITEMS.find(item => item.id === activeRouteId);
    if (navItem) {
      addRecentPage(activeRouteId, navItem.label);
    }
  }, [activeRouteId]);

  // Handle outside click closures
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#athlete-selector-btn') && !target.closest('#athlete-selector-dropdown')) {
        setAthleteDropdownOpen(false);
      }
      if (!target.closest('#notif-bell-btn') && !target.closest('#notif-dropdown-panel')) {
        setNotifDropdownOpen(false);
      }
      if (!target.closest('#user-profile-btn') && !target.closest('#user-dropdown-panel')) {
        setUserDropdownOpen(false);
      }
      if (!target.closest('#quick-actions-btn') && !target.closest('#quick-actions-panel')) {
        setQuickActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard Arrow navigation inside collapsible sidebar
  const handleSidebarKeyDown = (e: React.KeyboardEvent) => {
    if (isSidebarCollapsed) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedNavIndex((prev) => (prev + 1) % ALL_NAV_ITEMS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedNavIndex((prev) => (prev - 1 + ALL_NAV_ITEMS.length) % ALL_NAV_ITEMS.length);
    } else if (e.key === 'Enter' && focusedNavIndex >= 0) {
      e.preventDefault();
      const targetItem = ALL_NAV_ITEMS[focusedNavIndex];
      // Simulate navigate
      window.location.hash = targetItem.id;
      setMobileMenuOpen(false);
    }
  };

  // Keyboard accessibility hook for closing panels
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotifDropdownOpen(false);
        setAthleteDropdownOpen(false);
        setUserDropdownOpen(false);
        setQuickActionsOpen(false);
        setImportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Sync animation helper
  const isSyncing = syncStatus === 'syncing';

  return (
    <div 
      className={cn(
        'min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-foreground selection:text-background',
        isCompactMode && 'text-xs tracking-tight'
      )} 
      id="workspace-shell-container"
    >
      
      {/* Global Ingestion Simulation Top Loader */}
      {isSyncing && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50 overflow-hidden">
          <motion.div 
            className="h-full bg-status-success"
            initial={{ width: '0%' }}
            animate={{ width: `${syncProgress}%` }}
            transition={{ ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Primary Layout Frame */}
      <div className="flex-1 flex flex-row overflow-hidden relative">

        {/* ========================================================= */}
        {/* SIDEBAR NAVIGATION (Desktop) */}
        {/* ========================================================= */}
        <aside 
          ref={sidebarNavRef}
          onKeyDown={handleSidebarKeyDown}
          tabIndex={0}
          className={cn(
            'hidden md:flex flex-col border-r border-border bg-card shrink-0 transition-all duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-ring/30 select-none z-30',
            isSidebarCollapsed ? 'w-16' : 'w-64'
          )}
          id="workspace-desktop-sidebar"
          aria-label="Sidebar navigation"
        >
          {/* Sidebar Brand Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Flame className="h-4.5 w-4.5 text-status-warning" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col animate-in fade-in duration-200">
                  <span className="text-sm font-bold tracking-tight uppercase">
                    Track<span className="text-muted-foreground font-light">.Studio</span>
                  </span>
                  <div className="text-[9px] text-muted-foreground font-mono leading-none tracking-widest uppercase mt-0.5">
                    Workspace v10
                  </div>
                </div>
              )}
            </div>

            {!isSidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarCollapsed(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hidden md:inline-flex"
                title="Collapse Sidebar (Ctrl + /)"
                id="sidebar-collapse-btn"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sidebar Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
            
            {/* FAVORITES SECTION */}
            {favorites.length > 0 && !isSidebarCollapsed && (
              <div className="space-y-1">
                <div className="px-2 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span>Favorites</span>
                  <Star className="h-2.5 w-2.5 text-status-warning fill-status-warning" />
                </div>
                <div className="space-y-0.5">
                  {favorites.map(favId => {
                    const item = ALL_NAV_ITEMS.find(n => n.id === favId);
                    if (!item) return null;
                    const Icon = ICON_REGISTRY[item.id] || LayoutDashboard;
                    const isSelected = activeRouteId === item.id;
                    return (
                      <a
                        key={favId}
                        href={item.path}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                          isSelected 
                            ? 'bg-foreground text-background font-semibold' 
                            : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                        )}
                        id={`fav-link-${favId}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(favId);
                          }}
                          className="opacity-0 group-hover:opacity-100 hover:scale-115 transition-all text-status-warning"
                          title="Unstar page"
                        >
                          <Star className="h-3 w-3 fill-current" />
                        </button>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MAIN NAVIGATION GROUPINGS */}
            <nav className="space-y-4" aria-label="Main Navigation">
              {NAVIGATION_STRUCTURE.map((group, groupIdx) => (
                <div key={group.category} className="space-y-1">
                  {!isSidebarCollapsed ? (
                    <h3 className="px-2.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {group.category}
                    </h3>
                  ) : (
                    <div className="h-px bg-border/60 mx-2 my-2" />
                  )}
                  
                  <div className="space-y-0.5">
                    {group.items.map((item, itemIdx) => {
                      const Icon = ICON_REGISTRY[item.id] || LayoutDashboard;
                      const isSelected = activeRouteId === item.id;
                      const globalIdx = ALL_NAV_ITEMS.findIndex(n => n.id === item.id);
                      const isFocused = focusedNavIndex === globalIdx;
                      const isFav = favorites.includes(item.id);

                      return (
                        <div key={item.id} className="relative group/item flex items-center">
                          <a
                            href={item.path}
                            className={cn(
                              'flex-1 flex items-center justify-between rounded-md transition-all',
                              isSidebarCollapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5 text-xs font-medium',
                              isSelected 
                                ? 'bg-foreground text-background font-semibold shadow-sm' 
                                : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground',
                              isFocused && 'ring-1 ring-ring bg-secondary/30'
                            )}
                            id={`sidebar-link-${item.id}`}
                            title={isSidebarCollapsed ? item.label : undefined}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              {!isSidebarCollapsed && <span>{item.label}</span>}
                            </div>

                            {/* Hover Star to Toggle Favorite */}
                            {!isSidebarCollapsed && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className={cn(
                                  'transition-opacity hover:scale-115',
                                  isFav 
                                    ? 'text-status-warning opacity-100' 
                                    : 'text-muted-foreground/35 hover:text-status-warning opacity-0 group-hover/item:opacity-100'
                                )}
                              >
                                <Star className={cn('h-3 w-3', isFav && 'fill-current')} />
                              </button>
                            )}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* RECENT PAGES LIST */}
            {recentPages.length > 0 && !isSidebarCollapsed && (
              <div className="space-y-1 border-t border-border/60 pt-3">
                <div className="px-2 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Recents
                </div>
                <div className="space-y-0.5">
                  {recentPages.map((recent, idx) => {
                    const iconMap = ICON_REGISTRY[recent.routeId] || LayoutDashboard;
                    const Icon = iconMap;
                    return (
                      <a
                        key={`${recent.routeId}-${idx}`}
                        href={`#${recent.routeId}`}
                        className="flex items-center gap-2 px-2.5 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-all"
                        id={`recent-link-${recent.routeId}`}
                      >
                        <Icon className="h-3 w-3 text-muted-foreground/50" />
                        <span className="truncate">{recent.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Collapsed/Footer Indicator */}
          <div className="p-3 border-t border-border flex flex-col gap-1.5 bg-muted/20">
            {isSidebarCollapsed ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8 mx-auto text-muted-foreground hover:text-foreground"
                title="Expand Sidebar (Ctrl + /)"
                id="sidebar-expand-btn"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Active Ingestion Feed Indicators */}
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1" id="ingestion-connection-badges">
                  <span className="flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-status-success" />
                    Strava
                  </span>
                  <span className="flex items-center gap-1.5">
                    <WifiOff className="h-3 w-3 text-muted-foreground/50" />
                    Intervals.icu
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground font-mono text-center bg-muted/40 py-1 rounded">
                  Press <kbd className="font-sans px-1 bg-card border border-border rounded text-[8px]">Ctrl</kbd> + <kbd className="font-sans px-1 bg-card border border-border rounded text-[8px]">/</kbd>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================= */}
        {/* VIEWPORT HEADER & BODY */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* ========================================================= */}
          {/* TOP BAR */}
          {/* ========================================================= */}
          <header className="h-14 border-b border-border bg-card/85 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0" id="workspace-topbar">
            
            {/* Topbar Left: Drawer Trigger + Breadcrumbs */}
            <div className="flex items-center gap-3">
              {/* Hamburger Menu on Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="Open mobile menu"
                id="hamburger-menu-btn"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>

              {/* Breadcrumb Indicator */}
              <nav className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-medium" aria-label="Breadcrumbs" id="breadcrumb-navigation">
                <span className="font-semibold text-foreground tracking-tight">Track.Studio</span>
                <ChevronRight className="h-3 w-3" />
                <span className="capitalize">{activeRouteId.replace('_', ' ')}</span>
              </nav>
            </div>

            {/* Topbar Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Sync Webhook Channel Button with Status Banner */}
              <div className="relative" id="sync-engine-panel">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={triggerSync}
                  className={cn(
                    'h-8 font-semibold text-[10px] uppercase gap-1.5 border border-border',
                    isSyncing && 'bg-secondary/40 border-status-success'
                  )}
                  disabled={isSyncing}
                  id="feed-sync-trigger"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin text-status-success')} />
                  <span className="hidden md:inline">
                    {syncStatus === 'syncing' ? `Syncing (${syncProgress}%)` : 'Sync Feeds'}
                  </span>
                </Button>
              </div>

              {/* Athlete Context Switcher */}
              <div className="relative">
                <button
                  onClick={() => setAthleteDropdownOpen(!athleteDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-semibold hover:bg-secondary/40 transition-colors cursor-pointer"
                  id="athlete-selector-btn"
                  aria-expanded={athleteDropdownOpen}
                >
                  <div className="relative h-4.5 w-4.5 rounded-full overflow-hidden border border-border">
                    <Image 
                      src={activeAthlete.avatarUrl} 
                      alt="Athlete Avatar" 
                      fill
                      sizes="18px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="max-w-[80px] sm:max-w-[120px] truncate">{activeAthlete.name}</span>
                </button>

                <AnimatePresence>
                  {athleteDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1.5 w-56 rounded-md border border-border bg-card shadow-lg z-50 p-1"
                      id="athlete-selector-dropdown"
                    >
                      <div className="px-2 py-1.5 border-b border-border text-[10px] font-mono uppercase text-muted-foreground font-bold">
                        Switch Athlete context
                      </div>
                      <div className="space-y-0.5 pt-1">
                        {athletesList.map(ath => (
                          <button
                            key={ath.id}
                            onClick={() => {
                              setActiveAthleteById(ath.id);
                              setAthleteDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors cursor-pointer',
                              activeAthlete.id === ath.id 
                                ? 'bg-secondary text-foreground font-bold' 
                                : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <img src={ath.avatarUrl} className="h-4 w-4 rounded-full" alt="" />
                              <span>{ath.name}</span>
                            </div>
                            {activeAthlete.id === ath.id && <Check className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Global Command Palette search shortcut launcher */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandPaletteOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground relative border border-transparent hover:border-border rounded-md"
                title="Search / Command Palette (Ctrl + K)"
                id="workspace-search-trigger"
              >
                <Search className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 text-[7px] font-bold bg-foreground text-background px-1 rounded-full scale-90">K</span>
              </Button>

              {/* Theme Selector */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md"
                title="Toggle Theme"
                id="theme-toggle-trigger"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Notifications Dropdown Drawer */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground relative border border-transparent hover:border-border rounded-md"
                  id="notif-bell-btn"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-status-danger text-[9px] font-bold text-white rounded-full h-4.5 w-4.5 flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden"
                      id="notif-dropdown-panel"
                    >
                      {/* Dropdown Header */}
                      <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide">Workspace Alerts</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{unreadNotificationsCount} unread system notifications</p>
                        </div>
                        {notifications.length > 0 && (
                          <button 
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            Mark read
                          </button>
                        )}
                      </div>

                      {/* Dropdown Scrollable Notifications List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center space-y-2">
                            <SlidersHorizontal className="h-6 w-6 text-muted-foreground/30 mx-auto" />
                            <p className="text-xs text-muted-foreground font-medium">Clear of notifications.</p>
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div 
                              key={notif.id} 
                              className={cn(
                                'p-3.5 text-xs flex gap-3 transition-colors',
                                !notif.read ? 'bg-secondary/15 font-medium' : 'text-muted-foreground'
                              )}
                            >
                              {/* Alarm Indicator Badging */}
                              <div className="shrink-0 pt-0.5">
                                {notif.type === 'critical' && <ShieldAlert className="h-4 w-4 text-status-danger" />}
                                {notif.type === 'warning' && <AlertTriangle className="h-4 w-4 text-status-warning" />}
                                {notif.type === 'sync' && <RefreshCw className="h-4 w-4 text-status-success" />}
                                {['info', 'system'].includes(notif.type) && <SlidersHorizontal className="h-4 w-4 text-status-info" />}
                              </div>

                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="font-semibold text-foreground leading-tight">{notif.title}</span>
                                  <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-snug">{notif.message}</p>
                                
                                <div className="flex items-center gap-3 pt-1 text-[10px]">
                                  {!notif.read && (
                                    <button 
                                      onClick={() => markNotificationAsRead(notif.id)}
                                      className="text-foreground hover:underline font-semibold cursor-pointer"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => clearNotification(notif.id)}
                                    className="text-muted-foreground hover:text-status-danger hover:underline cursor-pointer"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Dropdown Footer Actions */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2 bg-muted/20 border-t border-border flex justify-between text-[10px] font-medium">
                          <button 
                            onClick={clearAllNotifications}
                            className="text-status-danger hover:underline cursor-pointer"
                          >
                            Purge all alerts
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Workspace Quick Actions */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground border border-border rounded-md"
                  id="quick-actions-btn"
                  title="Quick Actions"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {quickActionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-1.5 w-56 rounded-md border border-border bg-card shadow-lg z-50 p-1"
                      id="quick-actions-panel"
                    >
                      <div className="px-2 py-1.5 border-b border-border text-[9px] font-mono uppercase text-muted-foreground font-bold">
                        Quick Actions
                      </div>
                      <div className="space-y-0.5 pt-1 text-xs">
                        <button
                          onClick={() => {
                            setImportModalOpen(true);
                            setQuickActionsOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <FileDown className="h-4 w-4 text-status-info" />
                          <span>Import JSON Activity</span>
                        </button>
                        <button
                          onClick={() => {
                            // Clear cache simulator
                            setLoading(true);
                            setTimeout(() => {
                              setLoading(false);
                              triggerSync();
                            }, 1000);
                            setQuickActionsOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <SlidersHorizontal className="h-4 w-4 text-status-warning" />
                          <span>Purge Cache & Re-sync</span>
                        </button>
                        <button
                          onClick={() => {
                            setCompactMode(!isCompactMode);
                            setQuickActionsOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <SlidersHorizontal className="h-4 w-4 text-status-success" />
                          <span>Toggle Dense View</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 border-l border-border pl-3.5 focus:outline-none cursor-pointer"
                    id="user-profile-btn"
                  >
                    <div className="relative h-8 w-8 rounded-full border border-border bg-muted overflow-hidden">
                      <Image 
                        src={user.photoURL || 'https://picsum.photos/seed/avatar/150/150'} 
                        alt="Profile" 
                        fill
                        sizes="32px"
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-1.5 w-64 rounded-md border border-border bg-card shadow-lg z-50 p-1"
                        id="user-dropdown-panel"
                      >
                        <div className="p-2.5 border-b border-border flex flex-col gap-0.5">
                          <span className="text-xs font-bold truncate leading-tight">{user.displayName || 'Track.Studio User'}</span>
                          <span className="text-[9px] font-mono text-muted-foreground truncate">{user.email}</span>
                        </div>
                        <div className="space-y-0.5 pt-1 text-xs">
                          <a
                            href="#settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                          >
                            <Settings className="h-3.5 w-3.5" />
                            <span>System Settings</span>
                          </a>
                          <button
                            onClick={logout}
                            className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-status-danger/10 text-muted-foreground hover:text-status-danger cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>Sign Out Workspace</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

            </div>
          </header>

          {/* ========================================================= */}
          {/* VIEWPORT CONTENT CONTAINER */}
          {/* ========================================================= */}
          <main className="flex-1 overflow-y-auto relative scrollbar-thin flex flex-col md:flex-row" id="workspace-viewport">
            
            {/* Primary Viewport Column */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
              
              {/* PAGE FRAMEWORK HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border" id="page-framework-header">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
                  )}
                </div>

                {/* Toolbar & Primary Actions Slots */}
                {(toolbar || actions) && (
                  <div className="flex items-center gap-2 shrink-0 select-none" id="page-framework-actions">
                    {toolbar}
                    {actions}
                  </div>
                )}
              </div>

              {/* FILTERS SLOT (Collapsible Filters Bar) */}
              {filtersSlot && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFiltersOpen(!isFiltersOpen)}
                      className="h-8 gap-2 border border-border uppercase"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isFiltersOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-lg border border-border bg-card overflow-hidden shadow-sm p-4"
                        id="collapsible-filters-panel"
                      >
                        {filtersSlot}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* CORE CONTENT PORT */}
              <div className="relative min-h-[400px]" id="workspace-core-content">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-background/50 backdrop-blur-xs z-10 rounded-lg">
                    <RefreshCw className="h-8 w-8 animate-spin text-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">{loadingMessage}</span>
                  </div>
                ) : (
                  contentSlot
                )}
              </div>

              {/* VIEWPORT FOOTER SLOT */}
              {footerSlot && (
                <footer className="pt-6 border-t border-border mt-8 select-none" id="page-framework-footer">
                  {footerSlot}
                </footer>
              )}
            </div>

            {/* SIDE PANEL SLOT (Collapsible Right Side Inspect Drawer) */}
            {sidePanelSlot && isSidePanelOpen && (
              <aside 
                className="w-full md:w-80 lg:w-96 shrink-0 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col p-5 space-y-4 select-none z-10 animate-in slide-in-from-right-4 duration-300"
                id="workspace-right-inspect-panel"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide">Analysis inspector</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidePanelOpen(false)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {sidePanelSlot}
                </div>
              </aside>
            )}

          </main>

          {/* Sticky Bottom Credit Line */}
          <footer className="w-full border-t border-border py-4 bg-card/30 z-10 select-none">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              <span>Track.Studio © 2026 • Workspace Foundation Shell</span>
              <span>
                Fidelity Score: <b className="text-foreground">99.8%</b> • Recalibrated
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE DRAWER NAVIGATION */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" id="workspace-mobile-drawer">
            {/* Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            />

            {/* Drawer Sliding Side Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-72 max-w-[80vw] bg-card border-r border-border h-full flex flex-col p-4 z-10 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Track.Studio menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6">
                <nav className="space-y-4">
                  {NAVIGATION_STRUCTURE.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <h4 className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2.5">
                        {group.category}
                      </h4>
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = ICON_REGISTRY[item.id] || LayoutDashboard;
                          const isSelected = activeRouteId === item.id;
                          return (
                            <a
                              key={item.id}
                              href={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-semibold transition-all',
                                isSelected 
                                  ? 'bg-foreground text-background font-bold' 
                                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-border pt-3 space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-7 w-7 rounded-full overflow-hidden relative border border-border">
                    <img src={activeAthlete.avatarUrl} className="object-cover" alt="" />
                  </div>
                  <div className="flex flex-col text-[10px]">
                    <span className="font-bold leading-none">{activeAthlete.name}</span>
                    <span className="text-muted-foreground font-mono leading-none mt-0.5">{activeAthlete.email}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout} 
                  className="w-full justify-start text-xs font-semibold uppercase text-status-danger hover:bg-status-danger/10 h-8"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign Out Workspace
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MOCK JSON INGESTION MODAL OVERLAY */}
      {/* ========================================================= */}
      <AnimatePresence>
        {importModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImportModalOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-lg shadow-xl overflow-hidden p-6 space-y-4"
              id="json-ingestion-modal"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <FileDown className="h-4.5 w-4.5 text-status-info" />
                  Import activity payload
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setImportModalOpen(false)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-muted-foreground leading-snug">
                  Upload raw workout files (JSON from Strava, FIT or GPX payload) to synchronize your data platform securely.
                </p>

                {/* Drag and Drop box template */}
                <div className="border-2 border-dashed border-border/80 rounded-lg p-8 text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer group">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground/40 group-hover:text-foreground mx-auto mb-2 transition-colors" />
                  <span className="font-bold block text-foreground mb-1">Drag and drop workout payloads here</span>
                  <span className="text-[10px] text-muted-foreground">Supports JSON, FIT, GPX up to 10MB</span>
                </div>

                <div className="flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => {
                      setImportModalOpen(false);
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                        triggerSync();
                      }, 1200);
                    }}
                  >
                    Simulate Ingestion
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* GLOBAL COMMAND PALETTE MODAL (Ctrl + K) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette />
        )}
      </AnimatePresence>

    </div>
  );
}

// =========================================================
// COMMAND PALETTE OVERLAY COMPONENT
// =========================================================
function CommandPalette() {
  const { setCommandPaletteOpen, athletesList, setActiveAthleteById, triggerSync, setCompactMode, isCompactMode } = useWorkspace();
  const { setTheme, theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultIdx, setSelectedResultIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const commandItems = [
    // Navigation command options
    ...ALL_NAV_ITEMS.map(item => ({
      id: `nav-${item.id}`,
      title: `Navigate to ${item.label}`,
      subtitle: `System workspace area inside ${item.category}`,
      category: 'Workspace Areas',
      action: () => {
        window.location.hash = item.id;
        setCommandPaletteOpen(false);
      }
    })),
    // Athlete context options
    ...athletesList.map(ath => ({
      id: `athlete-${ath.id}`,
      title: `Switch Athlete: ${ath.name}`,
      subtitle: `Change modeling context to ${ath.name}`,
      category: 'Athletes & Profiles',
      action: () => {
        setActiveAthleteById(ath.id);
        setCommandPaletteOpen(false);
      }
    })),
    // Command utility action options
    {
      id: 'cmd-sync',
      title: 'Synchronize Ingestion Feeds',
      subtitle: 'Triggers active webhook query with Strava',
      category: 'Ingestion Operations',
      action: () => {
        triggerSync();
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-theme',
      title: `Toggle Theme: Set to ${theme === 'dark' ? 'Light' : 'Dark'}`,
      subtitle: 'Changes system appearance styling immediately',
      category: 'Workspace Preferences',
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        setCommandPaletteOpen(false);
      }
    },
    {
      id: 'cmd-density',
      title: `Toggle Compact View: ${isCompactMode ? 'Disable' : 'Enable'}`,
      subtitle: 'Adjusts spacing and padding for high-density layouts',
      category: 'Workspace Preferences',
      action: () => {
        setCompactMode(!isCompactMode);
        setCommandPaletteOpen(false);
      }
    },
  ];

  // Search filter
  const filteredCommands = commandItems.filter(cmd => 
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation within command palette list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIdx((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIdx((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedResultIdx]) {
        filteredCommands[selectedResultIdx].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4" id="command-palette-overlay">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCommandPaletteOpen(false)}
        className="fixed inset-0 bg-background/85 backdrop-blur-xs"
      />

      {/* Palette Container */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="relative w-full max-w-xl bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[480px]"
        id="command-palette-container"
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3.5 bg-muted/20">
          <Command className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedResultIdx(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search navigation, switch athletes or trigger operations..."
            className="flex-1 bg-transparent border-0 outline-none focus:outline-none text-xs text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="font-sans px-2 py-0.5 bg-card border border-border rounded text-[10px] text-muted-foreground shrink-0 uppercase select-none">ESC</kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/20 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-xs">
              <SlidersHorizontal className="h-6 w-6 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground font-medium">No system actions matched your search.</p>
            </div>
          ) : (
            // Group by category visually
            Object.entries(
              filteredCommands.reduce((groups, item) => {
                const group = groups[item.category] || [];
                group.push(item);
                groups[item.category] = group;
                return groups;
              }, {} as Record<string, typeof filteredCommands>)
            ).map(([category, items]) => (
              <div key={category} className="py-2 first:pt-1 last:pb-1 text-xs">
                <div className="px-3 py-1 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                  {category}
                </div>
                <div className="space-y-0.5 mt-1">
                  {items.map((cmd) => {
                    const globalIdx = filteredCommands.findIndex(c => c.id === cmd.id);
                    const isSelected = selectedResultIdx === globalIdx;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={cn(
                          'w-full text-left flex items-center justify-between px-3 py-2 rounded transition-all cursor-pointer',
                          isSelected 
                            ? 'bg-foreground text-background font-semibold shadow-sm' 
                            : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                        )}
                        onMouseEnter={() => setSelectedResultIdx(globalIdx)}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold leading-tight">{cmd.title}</span>
                          <span className={cn(
                            'text-[10px] leading-none',
                            isSelected ? 'text-background/80' : 'text-muted-foreground'
                          )}>
                            {cmd.subtitle}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[9px] font-mono text-background/85">
                            <span>Execute</span>
                            <CornerDownLeft className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Command Palette Keyboard Help Bar */}
        <div className="px-4 py-2 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 bg-card border border-border rounded">↑↓</kbd> Navigation
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 bg-card border border-border rounded">Enter</kbd> Select
            </span>
          </div>
          <span>Track.Studio Cmd Palette</span>
        </div>
      </motion.div>
    </div>
  );
}
