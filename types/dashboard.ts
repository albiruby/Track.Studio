export type DashboardState = 'Loading' | 'Refreshing' | 'Offline' | 'Partial Data' | 'Empty' | 'Error' | 'Ready';

export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';

export interface DashboardPreferences {
  widgetVisibility: Record<string, boolean>;
  layoutDensity: LayoutDensity;
  defaultDashboardId: string;
  theme: 'light' | 'dark' | 'system';
}

export interface DashboardRegistryEntry {
  id: string; // e.g. 'dashboard' or 'performance'
  name: string; // e.g. 'Home Dashboard'
  category: string; // e.g. 'Core Workspace', 'Analytics Engine'
  supportedViewModels: string[]; // e.g. ['HomeDashboardViewModel']
  supportedWidgets: string[]; // List of widget IDs
  layoutTemplate: 'grid' | 'bento' | 'split' | 'vertical' | 'connections';
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  documentation: string;
}

export interface WidgetRegistryEntry {
  id: string;
  name: string;
  description: string;
  defaultWidth: number; // e.g. 1 to 4 cols
  defaultHeight: number; // e.g. small, medium, large or h-value
  minWidth?: number;
  minHeight?: number;
  isResizable?: boolean;
}
