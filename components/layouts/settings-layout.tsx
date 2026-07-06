'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SettingsLayoutProps {
  children: React.ReactNode;
  sidebarNav: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  activeValue: string;
  onSelectNav: (value: string) => void;
  title?: string;
  description?: string;
}

export function SettingsLayout({
  children,
  sidebarNav,
  activeValue,
  onSelectNav,
  title = 'Settings',
  description = 'Manage physical thresholds, system access, and sync integrations.',
}: SettingsLayoutProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-4 sm:px-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="lg:w-1/5 shrink-0">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible border-b lg:border-b-0 border-border pb-2 lg:pb-0 gap-1 select-none">
            {sidebarNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeValue === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => onSelectNav(item.value)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer',
                    isActive
                      ? 'bg-secondary text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
