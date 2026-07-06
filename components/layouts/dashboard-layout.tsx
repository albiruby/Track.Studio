'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/hooks/use-auth';
import { useTheme } from '@/providers/theme-provider';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Activity, 
  Settings as SettingsIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor,
  CloudLightning,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeHref: string;
}

export function DashboardLayout({ children, navItems, activeHref }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'Session ended successfully.',
        type: 'info',
      });
    } catch {
      toast({
        title: 'Sign Out Failed',
        description: 'Failed to terminate the athlete session.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground transition-colors duration-200">
      {/* Off-canvas sidebar for mobile */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm transition-opacity duration-300',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'relative flex flex-col w-64 max-w-xs bg-card border-r border-border p-5 transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-foreground stroke-[2.5]" />
              <span className="font-sans font-bold text-sm tracking-tight text-foreground uppercase">
                Track.Studio
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1.5 select-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4 mt-auto space-y-4">
            {/* Theme switcher */}
            <div className="flex items-center justify-between gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer',
                  theme === 'light' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer',
                  theme === 'dark' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={cn(
                  'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer',
                  theme === 'system' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Profile Summary & Logout */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">
                  {profile?.displayName || user?.email?.split('@')[0] || 'Athlete'}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase truncate">
                  Athlete Profile
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-status-danger" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border p-5 shrink-0 select-none">
        <div className="flex items-center gap-2 mb-8">
          <Activity className="h-5 w-5 text-foreground stroke-[2.5]" />
          <span className="font-sans font-bold text-sm tracking-tight text-foreground uppercase">
            Track.Studio
          </span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border pt-4 mt-auto space-y-4">
          {/* Theme Switcher */}
          <div className="flex items-center justify-between gap-1 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer transition-colors',
                theme === 'light' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer transition-colors',
                theme === 'dark' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'flex-1 flex justify-center py-1 rounded-md text-xs cursor-pointer transition-colors',
                theme === 'system' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title="System Default"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Profile Summary & Logout */}
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-foreground leading-snug">
                {profile?.displayName || user?.email?.split('@')[0] || 'Athlete'}
              </p>
              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider leading-none">
                Active Athlete
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-status-danger" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-5 sticky top-0 z-40">
          <div className="flex items-center gap-3 lg:gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono">
              Performance Monitor
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Sync Indicators & Status */}
            <Badge variant="outline" className="gap-1 border-border bg-background select-none text-[10px] font-mono text-muted-foreground py-0.5">
              <CloudLightning className="h-3 w-3 text-status-success" />
              Cloud Connected
            </Badge>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
