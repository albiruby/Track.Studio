'use client';

import React from 'react';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { 
  Activity, 
  Database,
  Sun, 
  Moon, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function DashboardLayout({ children, activeTab = 'connections', setActiveTab }: DashboardLayoutProps) {
  const { user, logout } = useAuth() as any;
  const { setTheme, resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    { id: 'connections', label: 'Connections', icon: Database },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" id="dashboard-layout-container">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold tracking-tighter" id="brand-logo">
              <Activity className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight uppercase font-sans">Track<span className="text-muted-foreground font-light">.Studio</span></span>
              <div className="text-[9px] text-muted-foreground font-mono leading-none tracking-widest uppercase mt-0.5">Performance Engine</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5" id="desktop-nav">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab?.(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-foreground text-background font-bold' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                    }`}
                    id={`nav-item-${item.id}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8" id="theme-toggle-btn">
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* User Profile Summary */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 border-l border-border pl-3.5" id="user-profile-panel">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold leading-tight">{user.displayName}</span>
                  <span className="text-[9px] font-mono text-muted-foreground leading-none">{user.email}</span>
                </div>
                <div className="relative h-8 w-8 rounded-full border border-border bg-muted overflow-hidden">
                  <Image 
                    src={user.photoURL || 'https://picsum.photos/seed/avatar/150/150'} 
                    alt="Profile" 
                    fill
                    sizes="32px"
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                    id="user-profile-avatar"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground hover:text-status-danger" id="logout-btn">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden h-8 w-8"
                id="mobile-menu-toggle"
              >
                {mobileMenuOpen ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-b border-border bg-card px-4 py-3 space-y-2 animate-in slide-in-from-top-4" id="mobile-menu">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab?.(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-foreground text-background' 
                        : 'text-muted-foreground hover:bg-secondary/50'
                    }`}
                    id={`mobile-nav-item-${item.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
            
            <div className="pt-2.5 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 rounded-full border border-border bg-muted overflow-hidden">
                  <Image 
                    src={user.photoURL || 'https://picsum.photos/seed/avatar/150/150'} 
                    alt="Profile" 
                    fill
                    sizes="28px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-xs font-semibold">{user.displayName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="h-7 text-xs px-2.5" id="mobile-logout-btn">
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Pane */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>

      {/* Sticky Bottom Credit Line */}
      <footer className="w-full border-t border-border py-4 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Track.Studio © 2026 • Performance Platform
          </span>
          {user && (
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span>VO2max: <b className="text-foreground">{user.vo2Max ? `${user.vo2Max} ml/kg/min` : '--'}</b></span>
              <span>Weight: <b className="text-foreground">{user.weightKg ? `${user.weightKg} kg` : '--'}</b></span>
              <span>Threshold (FTP): <b className="text-foreground">{user.ftpWatts ? `${user.ftpWatts} W` : '--'}</b></span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
