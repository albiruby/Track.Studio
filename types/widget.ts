export type WidgetState = 'Loading' | 'Ready' | 'Refreshing' | 'Offline' | 'Partial Data' | 'Empty' | 'Error' | 'Disabled' | 'Hidden';

export type WidgetSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Full Width';

export type WidgetRefreshStrategy = 'manual' | 'interval' | 'realtime';

export interface WidgetPreferences {
  size: WidgetSize;
  isCollapsed: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  customTitle?: string;
}

export interface WidgetMetadata {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  version: string;
  ownerDashboards: string[];
  requiredViewModel: string;
  requiredPermissions: string[];
  supportedSizes: WidgetSize[];
  refreshStrategy: WidgetRefreshStrategy;
  documentation: string;
  defaultWidth: number; // Grid columns
  defaultHeight: number; // Grid rows
  minWidth?: number;
  minHeight?: number;
  isResizable?: boolean;
}

export interface WidgetLifecycleEvent {
  type: 'mount' | 'initialize' | 'receive_viewmodel' | 'render' | 'refresh' | 'resize' | 'hide' | 'show' | 'destroy';
  timestamp: string;
  payload?: any;
}
